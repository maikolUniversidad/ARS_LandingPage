"use client";

import { useEffect, useRef, useState } from "react";
import type { Clip } from "@/data/servicios";

/**
 * Clip del módulo: mudo, en bucle, que solo se reproduce cuando está a la vista.
 * Con «reducir movimiento» no arranca solo: muestra el póster y los controles.
 */
export function ClipVisible({ clip, acento }: { clip: Clip; acento: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reducido, setReducido] = useState(false);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      queueMicrotask(() => setReducido(true));
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload === "none") v.preload = "auto";
          void v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.4 }
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.pause();
    };
  }, []);

  if (fallo) return null;

  return (
    <figure className="overflow-hidden border border-white/10 bg-[#060f24]">
      <div className="relative">
        <video
          ref={ref}
          src={clip.mp4}
          poster={clip.poster}
          muted
          loop
          playsInline
          preload="none"
          controls={reducido}
          onError={() => setFallo(true)}
          aria-label={clip.titulo}
          className="block aspect-video h-auto w-full bg-black object-cover"
        />
        <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 bg-[#020a18]/75 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/85 backdrop-blur">
          <span className="inline-block size-1.5 rounded-full" style={{ background: acento }} aria-hidden="true" />
          Clip real
        </span>
      </div>
      <figcaption className="border-t border-white/10 px-4 py-3">
        <div className="text-sm font-bold text-white">{clip.titulo}</div>
        <p className="mt-1 text-xs leading-relaxed text-[#9eb0c0]">{clip.descripcion}</p>
      </figcaption>
    </figure>
  );
}
