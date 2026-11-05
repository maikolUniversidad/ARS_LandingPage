"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { prefiereMenosMovimiento } from "@/lib/asistente/acciones";
import { useTextosBloques } from "./textos";

type Props = {
  video?: string;
  poster?: string;
  imagen?: string;
  alt: string;
  rotulos?: string[];
  className?: string;
};

/**
 * Video en bucle (silenciado) que solo corre mientras está a la vista; con
 * movimiento reducido arranca pausado y se puede reproducir a mano. Muestra
 * los rótulos obligatorios encima («Ejemplo de evidencia», «Generado con IA»).
 */
export function MedioEvidencia({ video, poster, imagen, alt, rotulos, className = "" }: Props) {
  const tx = useTextosBloques();
  const ref = useRef<HTMLVideoElement>(null);
  const [pausado, setPausado] = useState(true);
  const manual = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefiereMenosMovimiento()) return;
    // Arranca solo (silenciado); el observador lo pausa fuera de la vista.
    el.autoplay = true;
    void el.play().catch(() => undefined);
    const io = new IntersectionObserver(
      ([e]) => {
        if (manual.current) return;
        if (e.isIntersecting) void el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`relative overflow-hidden bg-[#06112a] ${className}`}>
      {video ? (
        <>
          <video
            ref={ref}
            src={video}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={alt}
            onPlay={() => setPausado(false)}
            onPause={() => setPausado(true)}
            className="size-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              const el = ref.current;
              if (!el) return;
              manual.current = true;
              if (el.paused) void el.play().catch(() => undefined);
              else el.pause();
            }}
            aria-label={pausado ? tx.reproducir : tx.pausar}
            className="absolute bottom-2 right-2 grid size-7 place-items-center rounded-full border border-white/20 bg-[#020a18]/75 text-white backdrop-blur hover:bg-[#2348d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
          >
            {pausado ? <Play className="size-3 fill-current" aria-hidden="true" /> : <Pause className="size-3 fill-current" aria-hidden="true" />}
          </button>
        </>
      ) : imagen ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagen} alt={alt} loading="lazy" className="size-full object-cover" />
      ) : null}
      {rotulos?.length ? (
        <span className="absolute left-2 top-2 flex flex-wrap gap-1">
          {rotulos.map((r) => (
            <span
              key={r}
              className="rounded-full border border-white/20 bg-[#020a18]/80 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#d5e0ff] backdrop-blur"
            >
              {r}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}
