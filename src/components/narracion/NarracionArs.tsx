"use client";

import { Headphones, Mic, MicOff, Music2, Power, RotateCcw, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GUIONES } from "@/data/narracion";
import { useI18n } from "@/lib/i18n/context";
import { MUSICA } from "@/lib/narracion/contrato";
import { motorNarracion } from "@/lib/narracion/motor";
import { cn } from "@/lib/utils";
import { useEscenaMusical, useEstadoNarracion, useObservadorSecciones } from "./useNarracion";

const CLAVE_INVITACION = "ars:narracion:invitacion";
const RUTAS_SIN_AUDIO = ["/diagnostico", "/admin", "/vision-lab"];
const RUTAS_NARRADAS = (p: string) => p === "/" || p === "/plataforma" || p.startsWith("/servicios");

/** Cama musical según la ruta. /servicios usa sus pistas de ambiente por área. */
function pistaDeRuta(p: string): { pista: string | null; pulso: string | null } {
  if (RUTAS_SIN_AUDIO.some((r) => p.startsWith(r))) return { pista: null, pulso: null };
  if (p === "/") return { pista: MUSICA.home, pulso: MUSICA.homePulso };
  if (p === "/servicios") return { pista: "/servicios/ambiente/hub.mp3", pulso: null };
  if (p.startsWith("/servicios/")) return { pista: `/servicios/ambiente/${p.split("/")[2]}.mp3`, pulso: null };
  return { pista: MUSICA.plataforma, pulso: null };
}

function invitacionDescartada() {
  try {
    return window.localStorage.getItem(CLAVE_INVITACION) === "1";
  } catch {
    return true;
  }
}
function descartarInvitacion() {
  try {
    window.localStorage.setItem(CLAVE_INVITACION, "1");
  } catch {
    /* almacenamiento bloqueado */
  }
}

/**
 * Experiencia sonora global: Ars narra cada capítulo mientras la persona baja,
 * con música de fondo que reacciona al recorrido. Opcional y apagada por
 * defecto: se enciende con un toque (requisito del navegador para sonar).
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

  // Invitación, una sola vez y solo en las experiencias narradas.
  const [invitar, setInvitar] = useState(false);
  useEffect(() => {
    if (!visible || !narrada || estado.encendido) return;
    if (invitacionDescartada() || motorNarracion.recordabaEncendido()) return;
    const t = window.setTimeout(() => setInvitar(true), 4500);
    return () => window.clearTimeout(t);
  }, [visible, narrada, estado.encendido]);

  if (!visible) return null;

  const encender = (opc?: { voz?: boolean; musica?: boolean }) => {
    descartarInvitacion();
    setInvitar(false);
    motorNarracion.encender(opc);
  };
  const cerrarInvitacion = () => {
    descartarInvitacion();
    setInvitar(false);
  };

  return (
    <div className="pointer-events-none fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-4 z-[58] flex max-w-[calc(100vw-7rem)] flex-col items-start gap-2 md:bottom-20 md:left-6 md:max-w-[22rem]">
      {invitar && !estado.encendido && (
        <div
          role="dialog"
          aria-label="Escuchar el recorrido con Ars"
          className="pointer-events-auto relative w-[min(20rem,calc(100vw-7rem))] rounded-2xl rounded-bl-sm border border-[#2348d4]/40 bg-[#0a1430]/95 p-4 pr-8 shadow-2xl shadow-black/50 backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
        >
          <button
            type="button"
            onClick={cerrarInvitacion}
            aria-label="Ahora no"
            className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full text-foreground/50 hover:bg-white/10 hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#6b8aff]">Experiencia sonora</p>
          <p className="mt-2 text-sm leading-snug text-foreground/90">
            ¿Te acompaño con mi voz? Te narro cada capítulo mientras bajas, con música de fondo.
          </p>
          <p className="mt-1 text-xs text-foreground/50">Mejor con audífonos.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => encender({ voz: true, musica: true })}
              className="flex items-center gap-1.5 rounded-full bg-[#2348d4] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2f57e6]"
            >
              <Headphones className="size-3.5" aria-hidden="true" /> Escuchar con Ars
            </button>
            <button
              type="button"
              onClick={() => encender({ voz: false, musica: true })}
              className="rounded-full border border-white/15 px-3 py-2 text-xs text-foreground/75 hover:text-foreground"
            >
              Solo música
            </button>
          </div>
        </div>
      )}

      {estado.encendido ? (
        <PanelActivo />
      ) : (
        <button
          type="button"
          onClick={() => encender()}
          aria-label="Escuchar el recorrido narrado por Ars"
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-[#020a18]/85 px-3.5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/70 backdrop-blur-md transition-colors hover:border-[#6b8aff]/60 hover:text-white"
        >
          <Headphones className="size-4" aria-hidden="true" />
          <span>{narrada ? "Escuchar con Ars" : "Sonido"}</span>
        </button>
      )}
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

  return (
    <div className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-[#2348d4]/40 bg-[#020a18]/90 p-2.5 shadow-2xl shadow-black/40 backdrop-blur-md">
      {texto && (
        <p aria-live="polite" className="line-clamp-3 max-w-[19rem] px-1 text-[12.5px] leading-snug text-[#c5d2ee]">
          {texto}
        </p>
      )}
      <div className="flex items-center gap-2">
        <span className="relative grid size-8 place-items-center" aria-hidden="true">
          <span
            ref={orbe}
            className={cn(
              "absolute inset-1 rounded-full bg-[radial-gradient(circle_at_35%_35%,#6b8aff,#2348d4_55%,#142664)] transition-transform duration-75",
              !estado.hablando && "motion-safe:animate-pulse"
            )}
          />
        </span>
        <span className="mr-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/80">
          {estado.hablando ? "Ars narra" : estado.voz ? "Ars te acompaña" : "Música"}
        </span>
        <button
          type="button"
          onClick={() => motorNarracion.setVoz(!estado.voz)}
          aria-pressed={estado.voz}
          aria-label={estado.voz ? "Silenciar la voz de Ars" : "Activar la voz de Ars"}
          className={cn(boton, estado.voz ? "border-[#6b8aff]/60 text-white" : "border-white/15 text-white/45")}
        >
          {estado.voz ? <Mic className="size-3.5" aria-hidden="true" /> : <MicOff className="size-3.5" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => motorNarracion.setMusica(!estado.musica)}
          aria-pressed={estado.musica}
          aria-label={estado.musica ? "Quitar la música de fondo" : "Poner música de fondo"}
          className={cn(boton, estado.musica ? "border-[#6b8aff]/60 text-white" : "border-white/15 text-white/45")}
        >
          <Music2 className="size-3.5" aria-hidden="true" />
        </button>
        {estado.voz && (
          <button
            type="button"
            onClick={() => motorNarracion.repetir()}
            aria-label="Repetir la narración de esta sección"
            className={cn(boton, "border-white/15 text-white/70 hover:text-white")}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={() => motorNarracion.apagar()}
          aria-label="Apagar el sonido"
          className={cn(boton, "border-white/15 text-white/70 hover:text-white")}
        >
          <Power className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
