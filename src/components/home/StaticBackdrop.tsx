"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import s from "@/components/carga/carga.module.css";
import { cn } from "@/lib/utils";

/** Trazas de datos sobre la ilustración (viewBox 0–100, se estira a la pantalla). */
const TRAZAS = [
  { d: "M100 22 H82 L76 30 H58", tinte: "#5fd8ff" },
  { d: "M100 46 H88 L80 54 H66 L60 60", tinte: "#ffb547" },
  { d: "M54 100 V86 L62 78 H78", tinte: "#35e0a1" },
  { d: "M100 70 H90 L84 76 V100", tinte: "#a88bff" },
  { d: "M70 0 V12 L78 20 H92", tinte: "#d5e0ff" },
  { d: "M40 100 V92 L48 84 H60 L66 78", tinte: "#6b8aff" },
] as const;

/**
 * Respaldo sin WebGL (o si el 3D falla): la ilustración de la sede, pero viva.
 * Deriva lenta + parallax con el puntero, trazas de datos de las capas y un
 * barrido de escaneo, para que no se vea plana. Todo CSS; quieto con
 * «reducir movimiento».
 */
export function StaticBackdrop({ note }: { note?: string }) {
  const raizRef = useRef<HTMLDivElement>(null);

  // Parallax suave con el puntero (solo puntero fino y con movimiento permitido).
  useEffect(() => {
    const el = raizRef.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX / window.innerWidth - 0.5;
      y = e.clientY / window.innerHeight - 0.5;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty("--px", x.toFixed(3));
        el.style.setProperty("--py", y.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={raizRef} className="absolute inset-0 overflow-hidden bg-[#020a18]">
      <div className="absolute inset-0 transition-transform duration-700 ease-out [transform:translate3d(calc(var(--px,0)*-18px),calc(var(--py,0)*-12px),0)]">
        <div className={cn(s.deriva, "absolute inset-0")}>
          <Image
            src="/home/hero-poster.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 100vw, 1px"
            className="hidden object-cover object-right md:block"
          />
          <Image src="/home/hero-poster-mobile.webp" alt="" fill priority sizes="(max-width: 767px) 100vw, 1px" className="object-cover object-top md:hidden" />
        </div>
      </div>
      <div className="absolute inset-0 bg-[#020a18]/30" />

      {/* Trazas de datos (más cerca: se mueven un poco más con el puntero) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 size-full [transform:translate3d(calc(var(--px,0)*-28px),calc(var(--py,0)*-18px),0)] transition-transform duration-700 ease-out"
      >
        {TRAZAS.map((t, i) => (
          <g key={t.d} style={{ "--i": i } as CSSProperties}>
            <path d={t.d} fill="none" stroke={t.tinte} strokeOpacity="0.22" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path
              d={t.d}
              fill="none"
              stroke={t.tinte}
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className={s.dato}
            />
          </g>
        ))}
      </svg>

      {/* Barrido de escaneo */}
      <div aria-hidden="true" className={cn(s.barrido, "absolute inset-x-0 top-0 h-1/4 opacity-70")} />

      {note && (
        <div className="absolute right-4 top-20 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/40">{note}</div>
      )}
    </div>
  );
}
