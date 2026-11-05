"use client";

import { Headphones, Mic, Music2, Power, RotateCcw, Undo2, Volume2, VolumeX, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { terminarConversacion } from "@/components/servicios/eventos";
import { GUIONES } from "@/data/narracion";
import { useI18n } from "@/lib/i18n/context";
import { MUSICA } from "@/lib/narracion/contrato";
import { motorNarracion } from "@/lib/narracion/motor";
import { cn } from "@/lib/utils";
import { useEscenaMusical, useEstadoNarracion, useObservadorSecciones } from "./useNarracion";

/** /diagnostico tiene su propio reproductor de voz: allí la narración no suena. */
const RUTAS_SIN_AUDIO = ["/diagnostico", "/admin", "/vision-lab"];
const RUTAS_NARRADAS = (p: string) =>
  p === "/" || p === "/plataforma" || p === "/vision" || p === "/laboratorio" || p === "/proyectos" || p.startsWith("/servicios");

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

/** Gestos que el navegador acepta para dejar sonar audio. */
const GESTOS = ["pointerdown", "touchend", "keydown", "click"] as const;
/** Zonas cuyo toque no arranca la narración (el asistente, el «ahora no»). */
const SIN_ARRANQUE = "[data-narracion-ignorar], [data-asistente-raiz]";

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
      if (hecho) return;
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

/** Pausa la narración y abre a Ars en modo voz para que la persona le pregunte. */
function preguntarle() {
  motorNarracion.pausarParaConversar();
  window.dispatchEvent(new CustomEvent("ars:asistente", { detail: { voz: true, origen: "narracion" } }));
}

/**
 * Experiencia sonora global: Ars narra cada capítulo mientras la persona baja,
 * con música de fondo que reacciona al recorrido. Viene encendida por defecto y
 * suena desde el primer gesto (requisito del navegador); si la persona la apaga,
 * se recuerda y no vuelve a arrancar sola.
 */
export function NarracionArs() {
  const { locale } = useI18n();
  const pathname = usePathname() ?? "/";
  const estado = useEstadoNarracion();
  const { pista, pulso } = pistaDeRuta(pathname);
  const narrada = RUTAS_NARRADAS(pathname);
  const visible = estado.soportado && locale === "es" && pista !== null;

  useEscenaMusical(visible ? pista : null, visible ? pulso : null);
  useObservadorSecciones(visible && estado.encendido);
  useArranqueConGesto(visible && estado.esperandoGesto && !estado.encendido);

  // Al cambiar de ruta: Ars se calla (la nueva página la vuelve a llamar).
  useEffect(() => {
    motorNarracion.callar();
  }, [pathname]);

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

  return (
    <div className="pointer-events-none fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-4 z-[58] flex max-w-[calc(100vw-7rem)] flex-col items-start gap-2 md:bottom-20 md:left-6 md:max-w-[22rem]">
      {estado.encendido ? (
        <PanelActivo />
      ) : estado.esperandoGesto ? (
        <ListaParaEscuchar narrada={narrada} />
      ) : (
        <button
          type="button"
          onClick={() => motorNarracion.encender()}
          aria-label="Escuchar el recorrido narrado por Ars"
          className="pointer-events-auto flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-[#020a18]/85 px-3.5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/70 backdrop-blur-md transition-colors hover:border-[#6b8aff]/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
        >
          <Headphones className="size-4" aria-hidden="true" />
          <span>{narrada ? "Escuchar con Ars" : "Sonido"}</span>
        </button>
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

/** Panel cuando el sonido está encendido: orbe, subtítulo y controles. */
function PanelActivo() {
  const estado = useEstadoNarracion();
  const texto = estado.hablando && estado.idActual ? GUIONES[estado.idActual] : null;
  const orbe = useRef<HTMLSpanElement>(null);

  // Orbe que respira con la voz.
  useEffect(() => {
    const el = orbe.current;
    if (!estado.hablando || !el) return;
    let raf = 0;
    const tick = () => {
      el.style.transform = `scale(${1 + motorNarracion.nivel() * 0.55})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [estado.hablando]);

  const boton =
    "grid size-8 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]";
  const etiqueta = estado.conversando
    ? "Conversando con Ars"
    : estado.hablando
      ? "Ars narra"
      : estado.voz
        ? "Ars te acompaña"
        : "Música";

  return (
    <div
      role="region"
      aria-label="Narración de Ars"
      className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-[#2348d4]/40 bg-[#020a18]/90 p-2.5 shadow-2xl shadow-black/40 backdrop-blur-md"
    >
      {texto && (
        <p aria-live="polite" className="line-clamp-3 max-w-[19rem] px-1 text-[12.5px] leading-snug text-[#c5d2ee]">
          {texto}
        </p>
      )}
      <div className="flex items-center gap-2">
        <span className="relative grid size-8 shrink-0 place-items-center" aria-hidden="true">
          <span
            ref={orbe}
            className={cn(
              "absolute inset-1 rounded-full bg-[radial-gradient(circle_at_35%_35%,#6b8aff,#2348d4_55%,#142664)] transition-transform duration-75",
              !estado.hablando && "motion-safe:animate-pulse"
            )}
          />
        </span>
        <span className="mr-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/80" aria-live="polite">
          {etiqueta}
        </span>
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
        {estado.voz && !estado.conversando && (
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
        <button
          type="button"
          onClick={() => motorNarracion.apagar()}
          aria-label="Apagar la narración y la música"
          title="Apagar la narración y la música"
          className={cn(boton, "border-white/15 text-white/70 hover:border-red-400/60 hover:text-white")}
        >
          <Power className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      {estado.conversando ? (
        <button
          type="button"
          onClick={() => terminarConversacion()}
          className="flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/20 px-3.5 py-2 text-xs font-semibold text-white/90 hover:border-[#6b8aff]/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
        >
          <Undo2 className="size-3.5" aria-hidden="true" /> Terminar y seguir el recorrido
        </button>
      ) : (
        <button
          type="button"
          onClick={preguntarle}
          aria-label="Preguntarle a Ars por voz: pausa la narración y abre el micrófono"
          className="flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#2348d4] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2f57e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020a18]"
        >
          <Mic className="size-3.5" aria-hidden="true" /> Preguntarle a Ars
        </button>
      )}
    </div>
  );
}
