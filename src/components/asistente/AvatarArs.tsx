"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import type { FaseVoz } from "./OrbeVoz";

/**
 * Identidad visual de «Ars»: una esfera de luz abstracta (no imita a ninguna
 * persona) generada con ElevenLabs Creative. Los archivos viven en
 * `public/asistente/` — ver la sección «Avatar» de `docs/ASISTENTE.md`.
 */
export const MEDIOS_ARS = {
  posterAvif: "/asistente/ars-avatar.avif",
  poster: "/asistente/ars-avatar.webp",
  mini: "/asistente/ars-avatar-128.webp",
  /** Primer fotograma del loop: evita el salto entre póster y video. */
  posterVideo: "/asistente/ars-reposo-poster.webp",
  reposoWebm: "/asistente/ars-reposo.webm",
  reposoMp4: "/asistente/ars-reposo.mp4",
} as const;

const CONSULTA_REDUCIDO = "(prefers-reduced-motion: reduce)";

function suscribirReducido(avisar: () => void) {
  const mq = window.matchMedia(CONSULTA_REDUCIDO);
  mq.addEventListener("change", avisar);
  return () => mq.removeEventListener("change", avisar);
}

/** `true` si la persona pidió menos movimiento. En el servidor, `false`. */
function useMovimientoReducido() {
  return useSyncExternalStore(
    suscribirReducido,
    () => window.matchMedia(CONSULTA_REDUCIDO).matches,
    () => false,
  );
}

/** Velocidad del loop según la fase: piensa más rápido, escucha en calma. */
const VELOCIDAD: Record<FaseVoz, number> = {
  inactivo: 0.85,
  conectando: 1.2,
  escuchando: 1,
  transcribiendo: 1.35,
  pensando: 1.6,
  hablando: 1.25,
};

/** Color del brillo reactivo por fase (cian al escuchar, cálido al hablar). */
const BRILLO: Record<FaseVoz, string> = {
  inactivo: "bg-[radial-gradient(circle,rgba(127,209,255,0.18)_0%,transparent_70%)]",
  conectando: "bg-[radial-gradient(circle,rgba(127,209,255,0.22)_0%,transparent_70%)]",
  escuchando: "bg-[radial-gradient(circle,rgba(127,209,255,0.55)_0%,rgba(35,72,212,0.2)_45%,transparent_72%)]",
  transcribiendo: "bg-[radial-gradient(circle,rgba(158,176,192,0.3)_0%,transparent_70%)]",
  pensando: "bg-[radial-gradient(circle,rgba(158,176,192,0.28)_0%,transparent_70%)]",
  hablando: "bg-[radial-gradient(circle,rgba(255,236,196,0.6)_0%,rgba(127,209,255,0.25)_40%,transparent_72%)]",
};

function Poster({ className, mini = false }: { className?: string; mini?: boolean }) {
  return (
    <picture className="block size-full">
      {!mini && <source srcSet={MEDIOS_ARS.posterAvif} type="image/avif" />}
      <img
        src={mini ? MEDIOS_ARS.mini : MEDIOS_ARS.poster}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className={cn("size-full select-none object-cover", className)}
      />
    </picture>
  );
}

type Props = {
  fase: FaseVoz;
  /** Nivel de audio 0..1 (entrada al escuchar, salida al hablar). */
  nivel?: () => number;
  /** Diámetro en px. */
  tamano: number;
  className?: string;
};

/**
 * Avatar animado de Ars para el escenario de voz: loop de reposo en video
 * (silencioso, sin costuras) que acelera al pensar y un brillo que sigue al
 * nivel de audio mientras escucha o habla. Con `prefers-reduced-motion`, o si
 * el video no carga, muestra el póster estático.
 */
export function AvatarArs({ fase, nivel, tamano, className }: Props) {
  const reducido = useMovimientoReducido();
  const [falloVideo, setFalloVideo] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const brillo = useRef<HTMLSpanElement>(null);
  const disco = useRef<HTMLSpanElement>(null);
  const faseRef = useRef(fase);
  const nivelRef = useRef(nivel);
  const estatico = reducido || falloVideo;

  useEffect(() => {
    faseRef.current = fase;
    nivelRef.current = nivel;
    const v = video.current;
    if (v) v.playbackRate = VELOCIDAD[fase];
  }, [fase, nivel]);

  // Algunos navegadores ignoran `autoPlay` hasta que el elemento está montado y silenciado.
  useEffect(() => {
    const v = video.current;
    if (!v || estatico) return;
    v.muted = true;
    v.playbackRate = VELOCIDAD[faseRef.current];
    v.play().catch(() => {
      // Sin autoplay (ahorro de datos, modo de bajo consumo): queda el póster del video.
    });
  }, [estatico]);

  // Brillo reactivo al audio: escribe transform/opacity directo en el DOM, sin re-render.
  useEffect(() => {
    if (reducido) return;
    let raf = 0;
    let suave = 0;
    const paso = () => {
      raf = requestAnimationFrame(paso);
      const f = faseRef.current;
      const activo = f === "escuchando" || f === "hablando";
      const objetivo = activo ? Math.min(1, Math.max(0, nivelRef.current?.() ?? 0)) : 0;
      suave += (objetivo - suave) * 0.2;
      if (brillo.current) {
        brillo.current.style.opacity = String(0.55 + suave * 0.45);
        brillo.current.style.transform = `scale(${1 + suave * 0.35})`;
      }
      if (disco.current) {
        disco.current.style.transform = `scale(${1 + (f === "hablando" ? suave * 0.06 : suave * 0.03)})`;
      }
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [reducido]);

  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none relative block", className)}
      // El diámetro depende de la prop; Tailwind no puede generarlo dinámicamente.
      style={{ width: tamano, height: tamano }}
    >
      <span
        ref={brillo}
        className={cn(
          "absolute -inset-[18%] rounded-full transition-[background] duration-500 motion-reduce:transition-none",
          BRILLO[fase],
        )}
      />
      <span
        ref={disco}
        className={cn(
          "relative block size-full overflow-hidden rounded-full bg-[#020a18] ring-1 transition-[filter,box-shadow] duration-500 motion-reduce:transition-none",
          fase === "escuchando"
            ? "ring-[#7fd1ff]/70 shadow-[0_0_24px_-4px_rgba(127,209,255,0.7)]"
            : fase === "hablando"
              ? "ring-[#e8eefc]/60 shadow-[0_0_28px_-4px_rgba(255,236,196,0.55)]"
              : "ring-white/10",
          fase === "pensando" || fase === "transcribiendo" || fase === "conectando"
            ? "brightness-90 saturate-75"
            : fase === "inactivo"
              ? "brightness-90"
              : "",
        )}
      >
        {estatico ? (
          <Poster />
        ) : (
          <video
            ref={video}
            className="size-full select-none object-cover"
            poster={MEDIOS_ARS.posterVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onError={() => setFalloVideo(true)}
          >
            <source src={MEDIOS_ARS.reposoWebm} type="video/webm" />
            <source src={MEDIOS_ARS.reposoMp4} type="video/mp4" onError={() => setFalloVideo(true)} />
          </video>
        )}
      </span>
    </span>
  );
}

type PropsMini = {
  /** Diámetro en px (36 en el encabezado, ~56 en el botón flotante). */
  tamano?: number;
  /** Si llega, el aro de estado cambia con la fase de voz. */
  fase?: FaseVoz;
  /** Reproduce el loop de reposo (para el botón flotante). Por defecto, imagen fija. */
  animado?: boolean;
  className?: string;
};

/** Avatar pequeño de Ars para el encabezado del panel y el botón flotante. */
export function AvatarMini({ tamano = 36, fase = "inactivo", animado = false, className }: PropsMini) {
  const reducido = useMovimientoReducido();
  const [falloVideo, setFalloVideo] = useState(false);
  const conVideo = animado && !reducido && !falloVideo;
  const pensando = fase === "pensando" || fase === "transcribiendo" || fase === "conectando";

  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none relative inline-block shrink-0", className)}
      // El diámetro depende de la prop; Tailwind no puede generarlo dinámicamente.
      style={{ width: tamano, height: tamano }}
    >
      <span
        className={cn(
          "absolute inset-0 overflow-hidden rounded-full bg-[#020a18] ring-1 transition-shadow duration-300 motion-reduce:transition-none",
          fase === "escuchando"
            ? "ring-[#7fd1ff] shadow-[0_0_12px_rgba(127,209,255,0.75)] motion-safe:animate-pulse"
            : fase === "hablando"
              ? "ring-[#e8eefc] shadow-[0_0_14px_rgba(255,236,196,0.6)]"
              : "ring-[#2348d4]/50",
        )}
      >
        {conVideo ? (
          <video
            className="size-full object-cover"
            poster={MEDIOS_ARS.mini}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            disableRemotePlayback
            onError={() => setFalloVideo(true)}
          >
            <source src={MEDIOS_ARS.reposoWebm} type="video/webm" />
            <source src={MEDIOS_ARS.reposoMp4} type="video/mp4" onError={() => setFalloVideo(true)} />
          </video>
        ) : (
          <Poster mini={tamano <= 64} />
        )}
      </span>
      {pensando && (
        <span className="absolute -inset-0.5 rounded-full border-2 border-transparent border-t-[#e8eefc] motion-safe:animate-spin" />
      )}
    </span>
  );
}
