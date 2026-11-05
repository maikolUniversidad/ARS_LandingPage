"use client";

import { ChevronLeft, ChevronRight, ChevronUp, Compass, Headphones, ListOrdered, MessageSquare, Minus, Music2, Power, Undo2, Volume2, VolumeX, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motorNarracion } from "@/lib/narracion/motor";
import { cn } from "@/lib/utils";
import { AreaVivo, orbeDe } from "./AreaVivo";
import { AvisosArs } from "./AvisosArs";
import { irACapitulo, leerCapitulos, type Capitulo } from "./capitulos";
import { OrbeArs } from "./OrbeArs";
import { BotonEscuchar, CampoPregunta, etiquetaFase } from "./PiezasConversacion";
import { vibrar, type ConversacionArs } from "./useConversacionArs";
import { useEstadoNarracion } from "./useNarracion";

/** Rutas principales del dock (las de la narración + el cierre con la Propuesta ARS). */
const RUTAS = [
  { href: "/", texto: "Inicio" },
  { href: "/servicios", texto: "Servicios" },
  { href: "/plataforma", texto: "Plataforma" },
  { href: "/vision", texto: "Visión" },
  { href: "/#contacto", texto: "Propuesta y contacto" },
] as const;

/** Mantener presionado más que esto = hablar; menos = toque. */
const UMBRAL_PTT_MS = 260;

type Props = {
  narrada: boolean;
  conv: ConversacionArs;
  minimizado: boolean;
  alMinimizar: (v: boolean) => void;
};

/**
 * Dock fijo inferior para pantallas táctiles/estrechas. El botón central de Ars
 * es push-to-talk: mantener presionado pausa la narración y escucha; al soltar
 * envía y Ars responde en voz ahí mismo. Toque corto: pausar/reanudar la
 * narración (o, en plena conversación, cortar a Ars / volver al recorrido).
 * Con teclado: mantener Espacio sobre el botón; Enter es el toque corto.
 */
export function DockMovil({ narrada, conv, minimizado, alMinimizar }: Props) {
  const estado = useEstadoNarracion();
  const pathname = usePathname() ?? "/";
  const [menu, setMenu] = useState<"capitulos" | "rutas" | null>(null);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const raiz = useRef<HTMLDivElement>(null);
  const expandido = !minimizado && (estado.encendido || estado.esperandoGesto);

  // El resto del sitio sabe que hay dock (el botón flotante del chat se oculta y
  // el contenido deja sitio abajo).
  useEffect(() => {
    const html = document.documentElement;
    if (expandido) html.setAttribute("data-ars-dock", "");
    else html.removeAttribute("data-ars-dock");
    return () => html.removeAttribute("data-ars-dock");
  }, [expandido]);

  // Capítulos de la página (se re-leen al cambiar de ruta o de sección).
  useEffect(() => {
    const leer = () => setCapitulos(leerCapitulos());
    const id = window.setTimeout(leer, 400);
    return () => window.clearTimeout(id);
  }, [pathname, estado.seccion, menu]);

  // Al navegar se cierra el menú.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenu(null);
  }, [pathname]);

  // Escape o toque fuera cierran el menú.
  useEffect(() => {
    if (!menu) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    const fuera = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener("keydown", tecla);
    document.addEventListener("pointerdown", fuera, true);
    return () => {
      document.removeEventListener("keydown", tecla);
      document.removeEventListener("pointerdown", fuera, true);
    };
  }, [menu]);

  const apagar = () => {
    conv.terminar();
    motorNarracion.apagar();
  };

  if (!estado.encendido && !estado.esperandoGesto) {
    return (
      <div className="pointer-events-none fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-4 z-[58]">
        <BotonEscuchar narrada={narrada} />
      </div>
    );
  }

  if (minimizado) {
    return (
      <div className="pointer-events-none fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-4 z-[58] flex flex-col items-start gap-2">
        <AvisosArs avisos={conv.avisos} alCerrar={conv.cerrarAviso} alAbrir={conv.abrirAviso} />
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-[#2348d4]/45 bg-[#020a18]/90 p-1 shadow-xl shadow-black/40 backdrop-blur-md">
          <button
            type="button"
            onClick={() => alMinimizar(false)}
            aria-label="Desplegar el dock de Ars"
            className="flex min-h-10 items-center gap-1.5 rounded-full pl-1 pr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
          >
            <OrbeArs {...orbeDe(conv, estado.hablando)} tamano={26} notas={false} />
            <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/80">Ars</span>
            <ChevronUp className="size-4 text-white/60" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={apagar}
            aria-label="Apagar la narración y la música"
            className="grid size-10 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
          >
            <Power className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  const idx = capitulos.findIndex((c) => c.id === estado.seccion);
  const anterior = idx > 0 ? capitulos[idx - 1] : null;
  const siguiente = idx >= 0 ? capitulos[idx + 1] ?? null : capitulos[0] ?? null;
  const iconoBtn =
    "grid size-11 shrink-0 place-items-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff] disabled:opacity-30";
  const chico =
    "grid size-9 shrink-0 place-items-center rounded-full text-white/65 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]";

  return (
    <div ref={raiz} className="pointer-events-none fixed inset-x-0 bottom-0 z-[58] flex flex-col items-stretch">
      <style>{`html[data-ars-dock] body{padding-bottom:calc(7rem + env(safe-area-inset-bottom))}`}</style>
      <AvisosArs avisos={conv.avisos} alCerrar={conv.cerrarAviso} alAbrir={conv.abrirAviso} className="mb-2 px-3" />

      {menu && (
        <div
          id="ars-dock-menu"
          role="dialog"
          aria-label={menu === "capitulos" ? "Capítulos de esta página" : "Ir a otra página"}
          className="pointer-events-auto mx-3 mb-2 max-h-[50svh] overflow-y-auto rounded-2xl border border-[#2348d4]/40 bg-[#020a18]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
        >
          {menu === "capitulos" ? (
            <ol className="flex flex-col">
              {capitulos.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-current={c.id === estado.seccion ? "true" : undefined}
                    onClick={() => {
                      irACapitulo(c.id);
                      setMenu(null);
                    }}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[13.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]",
                      c.id === estado.seccion ? "bg-[#2348d4]/30 text-white" : "text-white/80 hover:bg-white/5"
                    )}
                  >
                    <span className="w-5 font-mono text-[10px] tabular-nums text-[#6b8aff]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="line-clamp-1">{c.titulo}</span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex flex-col">
              <nav aria-label="Páginas principales">
                <ul className="flex flex-col">
                  {RUTAS.map((r) => {
                    const actual = r.href === pathname;
                    return (
                      <li key={r.href}>
                        <Link
                          href={r.href}
                          aria-current={actual ? "page" : undefined}
                          onClick={() => setMenu(null)}
                          className={cn(
                            "flex min-h-11 items-center rounded-xl px-3 text-[13.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]",
                            actual ? "bg-[#2348d4]/30 text-white" : "text-white/80 hover:bg-white/5"
                          )}
                        >
                          {r.texto}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="mt-1 flex flex-wrap gap-1.5 border-t border-white/10 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMenu(null);
                    conv.terminar();
                    window.dispatchEvent(new CustomEvent("ars:asistente", { detail: {} }));
                  }}
                  className="flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-[12.5px] text-white/85 hover:border-[#6b8aff]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
                >
                  <MessageSquare className="size-4" aria-hidden="true" /> Chat con Ars
                </button>
                <button
                  type="button"
                  onClick={() => motorNarracion.setVoz(!estado.voz)}
                  aria-pressed={estado.voz}
                  className="flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-[12.5px] text-white/85 hover:border-[#6b8aff]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
                >
                  {estado.voz ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
                  Voz de Ars
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div
        role="region"
        aria-label="Ars: narración y preguntas"
        className="pointer-events-auto border-t border-[#2348d4]/40 bg-[#020a18]/95 px-2 pb-[calc(0.4rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-18px_50px_-24px_rgba(35,72,212,0.7)] backdrop-blur-md"
      >
        {/* Fila 1: subtítulo + música, minimizar, cerrar */}
        <div className="flex items-center gap-1 pl-2">
          <AreaVivo conv={conv} narrada={narrada} ptt className="min-w-0 flex-1 py-0.5" />
          <button
            type="button"
            onClick={() => motorNarracion.setMusica(!estado.musica)}
            aria-pressed={estado.musica}
            aria-label={estado.musica ? "Quitar la música de fondo" : "Poner música de fondo"}
            className={cn(chico, !estado.musica && "text-white/35")}
          >
            <Music2 className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => alMinimizar(true)} aria-label="Minimizar el dock de Ars (sigue sonando)" className={chico}>
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-narracion-ignorar=""
            onClick={estado.esperandoGesto ? () => motorNarracion.descartar() : apagar}
            aria-label={estado.esperandoGesto ? "Ahora no: no narrar el recorrido" : "Apagar la narración y la música"}
            className={chico}
          >
            {estado.esperandoGesto ? <X className="size-4" aria-hidden="true" /> : <Power className="size-4" aria-hidden="true" />}
          </button>
        </div>

        {conv.fase === "escribiendo" && <CampoPregunta alEnviar={conv.enviarTexto} alEscribir={conv.escribiendo} className="px-1 pt-1.5" />}

        {/* Fila 2: capítulos · Ars · páginas */}
        <div className="mt-0.5 flex items-center justify-between gap-1">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => anterior && irACapitulo(anterior.id)}
              disabled={!anterior}
              aria-label={anterior ? `Capítulo anterior: ${anterior.titulo}` : "No hay capítulo anterior"}
              className={iconoBtn}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setMenu(menu === "capitulos" ? null : "capitulos")}
              disabled={!capitulos.length}
              aria-expanded={menu === "capitulos"}
              aria-controls={menu === "capitulos" ? "ars-dock-menu" : undefined}
              aria-label="Capítulos de esta página"
              className={cn(iconoBtn, menu === "capitulos" && "bg-white/10 text-white")}
            >
              <ListOrdered className="size-5" aria-hidden="true" />
            </button>
          </div>

          <BotonArs conv={conv} />

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenu(menu === "rutas" ? null : "rutas")}
              aria-expanded={menu === "rutas"}
              aria-controls={menu === "rutas" ? "ars-dock-menu" : undefined}
              aria-label="Ir a otra página, chat y voz"
              className={cn(iconoBtn, menu === "rutas" && "bg-white/10 text-white")}
            >
              <Compass className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => siguiente && irACapitulo(siguiente.id)}
              disabled={!siguiente}
              aria-label={siguiente ? `Capítulo siguiente: ${siguiente.titulo}` : "No hay capítulo siguiente"}
              className={iconoBtn}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Botón grande de Ars: mantener = hablar (push-to-talk), toque = pausar/reanudar
 * (o, conversando: cortar a Ars mientras habla / volver al recorrido).
 */
function BotonArs({ conv }: { conv: ConversacionArs }) {
  const estado = useEstadoNarracion();
  const presion = useRef<{ timer: number; hablando: boolean } | null>(null);

  const toque = useCallback(() => {
    if (estado.esperandoGesto) {
      void motorNarracion.arrancarConGesto();
      return;
    }
    switch (conv.fase) {
      case "inactiva":
        if (estado.pausada) motorNarracion.reanudar();
        else motorNarracion.pausar();
        break;
      case "hablando":
      case "pensando":
        conv.interrumpir();
        break;
      case "escuchando":
      case "transcribiendo":
        conv.soltar();
        break;
      default:
        conv.terminar();
    }
  }, [conv, estado.esperandoGesto, estado.pausada]);

  const presionar = useCallback(() => {
    if (presion.current) return;
    const p = { timer: 0, hablando: false };
    presion.current = p;
    if (estado.esperandoGesto) return;
    p.timer = window.setTimeout(() => {
      p.hablando = true;
      vibrar(15);
      conv.empezar();
    }, UMBRAL_PTT_MS);
  }, [conv, estado.esperandoGesto]);

  const soltar = useCallback(
    (cancelado = false) => {
      const p = presion.current;
      presion.current = null;
      if (!p) return;
      window.clearTimeout(p.timer);
      if (p.hablando) conv.soltar();
      else if (!cancelado) toque();
    },
    [conv, toque],
  );

  // Si el componente se desmonta con el dedo abajo, no queda escuchando.
  useEffect(() => () => window.clearTimeout(presion.current?.timer), []);

  const escuchando = conv.fase === "escuchando";
  const etiqueta = estado.esperandoGesto
    ? "Ars: toque para escuchar el recorrido"
    : conv.activa
      ? `${etiquetaFase(conv.fase, true)}. Mantenga presionado (o mantenga Espacio) para hablar; toque para ${
          conv.fase === "hablando" || conv.fase === "pensando" ? "cortar la respuesta" : "volver al recorrido"
        }`
      : `Mantenga presionado (o mantenga Espacio) para preguntarle a Ars; toque para ${estado.pausada ? "reanudar" : "pausar"} la narración`;

  return (
    <button
      type="button"
      aria-label={etiqueta}
      aria-pressed={escuchando}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        presionar();
      }}
      onPointerUp={() => soltar()}
      onPointerCancel={() => soltar(true)}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === " " || e.code === "Space") {
          e.preventDefault();
          if (!e.repeat) presionar();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.code === "Space") {
          e.preventDefault();
          soltar();
        }
      }}
      onBlur={() => presion.current && soltar(true)}
      onClick={(e) => {
        // Enter o lector de pantalla (clic sin puntero): toque.
        if (e.detail === 0) toque();
      }}
      className={cn(
        "relative grid size-[4.25rem] shrink-0 touch-none select-none place-items-center rounded-full border bg-[#020a18] shadow-[0_10px_40px_-8px_rgba(35,72,212,0.8)] transition-transform [-webkit-touch-callout:none] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6b8aff]/70 motion-reduce:transition-none",
        escuchando ? "scale-110 border-[#7fd1ff]" : "border-[#2348d4]/70"
      )}
    >
      <OrbeArs {...orbeDe(conv, estado.hablando)} tamano={52} />
      <span className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
        {estado.esperandoGesto ? (
          <Headphones className="size-5 text-white" />
        ) : conv.activa && conv.fase === "esperando" ? (
          <Undo2 className="size-5 text-white/90" />
        ) : null}
      </span>
      {estado.pausada && !conv.activa && (
        <span className="pointer-events-none absolute -bottom-1 rounded-full bg-[#020a18] px-1.5 font-mono text-[8.5px] uppercase tracking-[0.2em] text-white/70" aria-hidden="true">
          pausa
        </span>
      )}
    </button>
  );
}
