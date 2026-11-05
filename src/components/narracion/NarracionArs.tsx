"use client";

import { ChevronUp, Headphones, Mic, Minus, Music2, Power, RotateCcw, Undo2, Volume2, VolumeX, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMedia } from "@/components/asistente/guia/useMedia";
import { useI18n } from "@/lib/i18n/context";
import { MUSICA } from "@/lib/narracion/contrato";
import { motorNarracion } from "@/lib/narracion/motor";
import { cn } from "@/lib/utils";
import { AreaVivo, orbeDe } from "./AreaVivo";
import { AvisosArs } from "./AvisosArs";
import { DockMovil } from "./DockMovil";
import { OrbeArs } from "./OrbeArs";
import { BotonEscuchar, CampoPregunta, etiquetaFase } from "./PiezasConversacion";
import { useConversacionArs, type ConversacionArs } from "./useConversacionArs";
import { useEscenaMusical, useEstadoNarracion, useObservadorSecciones } from "./useNarracion";

/** /diagnostico tiene su propio reproductor de voz: allí la narración no suena. */
const RUTAS_SIN_AUDIO = ["/diagnostico", "/admin", "/vision-lab"];
const RUTAS_NARRADAS = (p: string) =>
  p === "/" || p === "/plataforma" || p === "/vision" || p === "/laboratorio" || p === "/proyectos" || p === "/arquitectura" || p.startsWith("/servicios");

/** Pantallas táctiles o estrechas: dock fijo inferior en lugar del panel flotante. */
const CONSULTA_DOCK = "(max-width: 767px), (pointer: coarse) and (max-width: 1024px)";

/** Cama musical según la ruta. /servicios usa sus pistas de ambiente por área. */
function pistaDeRuta(p: string): { pista: string | null; pulso: string | null } {
  if (RUTAS_SIN_AUDIO.some((r) => p.startsWith(r))) return { pista: null, pulso: null };
  if (p === "/") return { pista: MUSICA.home, pulso: MUSICA.homePulso };
  if (p === "/servicios") return { pista: "/servicios/ambiente/hub.mp3", pulso: null };
  if (p.startsWith("/servicios/")) return { pista: `/servicios/ambiente/${p.split("/")[2]}.mp3`, pulso: null };
  // Analíticas de video → la cama de monitoreo; laboratorio → la de IA; la red → la central.
  if (p === "/vision") return { pista: "/servicios/ambiente/monitoreo-inteligente.mp3", pulso: null };
  if (p === "/laboratorio") return { pista: "/servicios/ambiente/productividad-e-ia.mp3", pulso: null };
  if (p === "/proyectos") return { pista: "/servicios/ambiente/centro-de-operaciones.mp3", pulso: null };
  return { pista: MUSICA.plataforma, pulso: null };
}

/**
 * Eventos que pueden desbloquear el audio. Por la especificación HTML solo
 * `keydown`, `mousedown`/`pointerdown` (ratón), `pointerup`/`touchend` (toque sin
 * scroll) y `click` dan «activación de usuario»; `touchstart`, `wheel` y el
 * scroll no. Escuchamos también esos (baratos) y antes de intentar miramos
 * `navigator.userActivation.isActive`, así un toque que empezó como scroll no
 * gasta intentos y el primero que sí cuenta arranca la narración.
 */
const GESTOS = ["pointerdown", "pointerup", "touchstart", "touchend", "keydown", "click", "wheel"] as const;
/** Zonas cuyo toque no arranca la narración (el asistente, el «ahora no»). */
const SIN_ARRANQUE = "[data-narracion-ignorar], [data-asistente-raiz]";
const CLAVE_UI = "ars:narracion-ui";

function activacionVigente(e: Event) {
  const ua = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
  if (ua) return ua.isActive;
  // Sin la API (navegadores viejos): solo los eventos que la especificación acepta.
  return e.type !== "touchstart" && e.type !== "wheel";
}

/**
 * Arranca la narración con el primer gesto de la persona en cualquier parte de
 * la página. Si el gesto no desbloqueó el audio (p. ej. soltar el dedo tras un
 * scroll en el celular), sigue escuchando hasta el siguiente.
 */
function useArranqueConGesto(activo: boolean) {
  useEffect(() => {
    if (!activo) return;
    let hecho = false;
    const quitar = () => GESTOS.forEach((g) => document.removeEventListener(g, alGesto, true));
    function alGesto(e: Event) {
      if (hecho || !activacionVigente(e)) return;
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest(SIN_ARRANQUE)) return;
      void motorNarracion.arrancarConGesto().then((ok) => {
        if (!ok || hecho) return;
        hecho = true;
        quitar();
      });
    }
    GESTOS.forEach((g) => document.addEventListener(g, alGesto, { capture: true, passive: true }));
    return quitar;
  }, [activo]);
}

/** Panel minimizado (píldora que sigue sonando); se recuerda entre visitas. */
function useMinimizado(): [boolean, (v: boolean) => void] {
  const [min, setMin] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return (JSON.parse(window.localStorage.getItem(CLAVE_UI) ?? "{}") as { minimizado?: boolean }).minimizado === true;
    } catch {
      return false;
    }
  });
  const cambiar = (v: boolean) => {
    setMin(v);
    try {
      window.localStorage.setItem(CLAVE_UI, JSON.stringify({ minimizado: v }));
    } catch {
      /* almacenamiento bloqueado */
    }
  };
  return [min, cambiar];
}

/**
 * Experiencia sonora global: Ars narra cada capítulo mientras la persona baja,
 * con música de fondo que reacciona al recorrido. Viene encendida por defecto:
 * intenta sonar al entrar y, si el navegador no lo deja, arranca con el primer
 * gesto. Si la persona la apaga, se recuerda y no vuelve a arrancar sola.
 * Se le puede preguntar a Ars ahí mismo (sin abrir el chat): responde en voz
 * y con avisos pequeños. En pantallas táctiles/estrechas es un dock inferior.
 */
export function NarracionArs() {
  const { locale } = useI18n();
  const pathname = usePathname() ?? "/";
  const estado = useEstadoNarracion();
  const { pista, pulso } = pistaDeRuta(pathname);
  const narrada = RUTAS_NARRADAS(pathname);
  const visible = estado.soportado && locale === "es" && pista !== null;
  const movil = useMedia(CONSULTA_DOCK);
  const conv = useConversacionArs(movil ? "ptt" : "continuo");
  const [minimizado, setMinimizado] = useMinimizado();

  useEscenaMusical(visible ? pista : null, visible ? pulso : null);
  useObservadorSecciones(visible && estado.encendido);
  useArranqueConGesto(visible && estado.esperandoGesto && !estado.encendido);

  // Al entrar: intenta sonar ya (si el navegador lo permite sin gesto).
  useEffect(() => {
    if (visible && estado.esperandoGesto) void motorNarracion.intentarArranqueAutomatico();
  }, [visible, estado.esperandoGesto]);

  // Al cambiar de ruta: Ars se calla (la nueva página la vuelve a llamar).
  useEffect(() => {
    motorNarracion.callar();
  }, [pathname]);

  // Si la narración desaparece (inglés, /diagnostico) no queda una conversación colgada.
  const terminar = conv.terminar;
  useEffect(() => {
    if (!visible) terminar();
  }, [visible, terminar]);

  // Brillo según el avance por la página (la home lo maneja ella misma).
  useEffect(() => {
    if (!visible || !estado.encendido || pathname === "/") return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      motorNarracion.parametros({ brillo: 0.25 + 0.75 * (max > 0 ? window.scrollY / max : 0) });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visible, estado.encendido, pathname]);

  if (!visible) return null;

  if (movil) {
    return <DockMovil narrada={narrada} conv={conv} minimizado={minimizado} alMinimizar={setMinimizado} />;
  }

  return (
    <div className="pointer-events-none fixed bottom-20 left-6 z-[58] flex max-w-[22rem] flex-col items-start gap-2">
      <AvisosArs avisos={conv.avisos} alCerrar={conv.cerrarAviso} alAbrir={conv.abrirAviso} />
      {estado.encendido ? (
        minimizado ? (
          <PildoraMinimizada conv={conv} alExpandir={() => setMinimizado(false)} />
        ) : (
          <PanelActivo conv={conv} alMinimizar={() => setMinimizado(true)} />
        )
      ) : estado.esperandoGesto ? (
        <ListaParaEscuchar narrada={narrada} />
      ) : (
        <BotonEscuchar narrada={narrada} />
      )}
    </div>
  );
}

/** Encendida por defecto, a la espera del primer gesto: invita sin molestar. */
function ListaParaEscuchar({ narrada }: { narrada: boolean }) {
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#2348d4]/50 bg-[#020a18]/90 p-1 pr-1.5 shadow-2xl shadow-black/40 backdrop-blur-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
      <button
        type="button"
        onClick={() => void motorNarracion.arrancarConGesto()}
        aria-label={narrada ? "Ars está lista: toque para escuchar el recorrido narrado" : "Toque para activar la música"}
        className="flex min-h-10 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
      >
        <span className="relative grid size-7 place-items-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-full bg-[#2348d4]/40 motion-safe:animate-ping" />
          <span className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_35%_35%,#6b8aff,#2348d4_55%,#142664)]" />
          <Headphones className="relative size-3.5 text-white" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/90">Ars lista</span>
          <span className="text-[11.5px] text-[#c5d2ee]/80">{narrada ? "Toque para escuchar" : "Toque para la música"}</span>
        </span>
      </button>
      <button
        type="button"
        data-narracion-ignorar=""
        onClick={() => motorNarracion.descartar()}
        aria-label="Ahora no: no narrar el recorrido"
        title="Ahora no"
        className="grid size-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Minimizado: sigue sonando; un toque lo despliega. */
function PildoraMinimizada({ conv, alExpandir }: { conv: ConversacionArs; alExpandir: () => void }) {
  const estado = useEstadoNarracion();
  return (
    <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-[#2348d4]/45 bg-[#020a18]/90 p-1 shadow-xl shadow-black/40 backdrop-blur-md">
      <button
        type="button"
        onClick={alExpandir}
        aria-label="Desplegar el panel de Ars"
        title="Desplegar"
        className="flex min-h-8 items-center gap-1.5 rounded-full pl-0.5 pr-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
      >
        <OrbeArs {...orbeDe(conv, estado.hablando)} tamano={26} notas={false} />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/80">Ars</span>
        <ChevronUp className="size-3.5 text-white/60" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => {
          conv.terminar();
          motorNarracion.apagar();
        }}
        aria-label="Apagar la narración y la música"
        title="Apagar"
        className="grid size-8 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
      >
        <Power className="size-3.5" aria-hidden="true" />
      </button>
      <span className="sr-only" aria-live="polite">
        {estado.pausada ? "Narración en pausa" : ""}
      </span>
    </div>
  );
}

/** Panel cuando el sonido está encendido: orbe, subtítulo, controles y la conversación en línea. */
function PanelActivo({ conv, alMinimizar }: { conv: ConversacionArs; alMinimizar: () => void }) {
  const estado = useEstadoNarracion();
  const orbe = orbeDe(conv, estado.hablando);

  const boton =
    "grid size-8 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]";
  const etiqueta = conv.activa
    ? etiquetaFase(conv.fase, false)
    : estado.hablando
      ? "Ars narra"
      : estado.pausada
        ? "En pausa"
        : estado.voz
          ? "Ars te acompaña"
          : "Música";

  return (
    <div
      role="region"
      aria-label="Narración de Ars"
      className="pointer-events-auto flex w-[21rem] max-w-full flex-col gap-2 rounded-2xl border border-[#2348d4]/40 bg-[#020a18]/90 p-2.5 shadow-2xl shadow-black/40 backdrop-blur-md"
    >
      {/* Área en vivo: subtítulo de la narración / «Usted: …» / «Ars está pensando…» */}
      <div className="flex items-center gap-3 px-1 pt-1">
        <OrbeArs {...orbe} tamano={40} className="m-1" />
        <AreaVivo conv={conv} narrada ptt={false} className="min-w-0 flex-1" />
      </div>
      <div className="flex items-center gap-2">
        <span className="mr-auto min-w-0 truncate font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/80" aria-live="polite">
          {etiqueta}
        </span>
        {!conv.activa && (
          <>
            <button
              type="button"
              onClick={() => motorNarracion.setVoz(!estado.voz)}
              aria-pressed={estado.voz}
              aria-label={estado.voz ? "Silenciar la voz de Ars" : "Activar la voz de Ars"}
              title={estado.voz ? "Silenciar la voz" : "Activar la voz"}
              className={cn(boton, estado.voz ? "border-[#6b8aff]/60 text-white" : "border-white/15 text-white/45")}
            >
              {estado.voz ? <Volume2 className="size-3.5" aria-hidden="true" /> : <VolumeX className="size-3.5" aria-hidden="true" />}
            </button>
            {estado.voz && (
              <button
                type="button"
                onClick={() => motorNarracion.repetir()}
                aria-label="Repetir la narración de esta sección"
                title="Repetir"
                className={cn(boton, "border-white/15 text-white/70 hover:text-white")}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </>
        )}
        <button
          type="button"
          onClick={() => motorNarracion.setMusica(!estado.musica)}
          aria-pressed={estado.musica}
          aria-label={estado.musica ? "Quitar la música de fondo" : "Poner música de fondo"}
          title={estado.musica ? "Quitar la música" : "Poner música"}
          className={cn(boton, estado.musica ? "border-[#6b8aff]/60 text-white" : "border-white/15 text-white/45")}
        >
          <Music2 className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={alMinimizar}
          aria-label="Minimizar el panel de Ars (sigue sonando)"
          title="Minimizar"
          className={cn(boton, "border-white/15 text-white/70 hover:text-white")}
        >
          <Minus className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            conv.terminar();
            motorNarracion.apagar();
          }}
          aria-label="Apagar la narración y la música"
          title="Apagar la narración y la música"
          className={cn(boton, "border-white/15 text-white/70 hover:border-red-400/60 hover:text-white")}
        >
          <Power className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      {conv.fase === "escribiendo" && <CampoPregunta alEnviar={conv.enviarTexto} alEscribir={conv.escribiendo} />}
      {conv.activa ? (
        <div className="flex gap-1.5">
          {conv.fase === "hablando" || conv.fase === "pensando" ? (
            <button
              type="button"
              onClick={conv.empezar}
              className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-[#6b8aff]/50 px-3 py-2 text-xs font-semibold text-white hover:bg-[#2348d4]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
            >
              <Mic className="size-3.5" aria-hidden="true" /> Interrumpir y hablar
            </button>
          ) : conv.fase === "esperando" ? (
            <button
              type="button"
              onClick={conv.empezar}
              className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#2348d4] px-3 py-2 text-xs font-bold text-white hover:bg-[#2f57e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020a18]"
            >
              <Mic className="size-3.5" aria-hidden="true" /> Preguntar otra cosa
            </button>
          ) : null}
          <button
            type="button"
            onClick={conv.terminar}
            className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/90 hover:border-[#6b8aff]/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
          >
            <Undo2 className="size-3.5" aria-hidden="true" /> Seguir el recorrido
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={conv.empezar}
          aria-label="Preguntarle a Ars: pausa la narración y la escucha aquí mismo"
          className="flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#2348d4] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2f57e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020a18]"
        >
          <Mic className="size-3.5" aria-hidden="true" /> Preguntarle a Ars
        </button>
      )}
    </div>
  );
}
