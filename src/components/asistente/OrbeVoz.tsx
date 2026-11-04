"use client";

import { useEffect, useRef } from "react";
import { AvatarArs } from "./AvatarArs";

export type FaseVoz = "inactivo" | "conectando" | "escuchando" | "transcribiendo" | "pensando" | "hablando";

type Props = {
  fase: FaseVoz;
  /** Nivel de audio 0..1 (entrada al escuchar, salida al hablar). */
  nivel: () => number;
  tamano?: number;
  className?: string;
  /**
   * Muestra el avatar animado de Ars dentro de los anillos (el núcleo dibujado
   * se omite). Por defecto, solo en tamaños de escenario (≥ 96 px).
   */
  avatar?: boolean;
};

const COLORES: Record<FaseVoz, [string, string]> = {
  inactivo: ["#1d3885", "#9eb0c0"],
  conectando: ["#1d3885", "#9eb0c0"],
  escuchando: ["#2348d4", "#7fd1ff"],
  transcribiendo: ["#2348d4", "#9eb0c0"],
  pensando: ["#142664", "#9eb0c0"],
  hablando: ["#2348d4", "#e8eefc"],
};

/**
 * Orbe de voz: anillos que respiran con el nivel de audio. Canvas 2D, sin
 * dependencias. Con `prefers-reduced-motion` se dibuja a baja cadencia y sin
 * ondulación. Con `avatar`, los anillos rodean al avatar animado de Ars.
 */
export function OrbeVoz({ fase, nivel, tamano = 168, className, avatar = tamano >= 96 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const faseRef = useRef(fase);
  const nivelRef = useRef(nivel);

  useEffect(() => {
    faseRef.current = fase;
    nivelRef.current = nivel;
  }, [fase, nivel]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = tamano * dpr;
    canvas.height = tamano * dpr;
    ctx.scale(dpr, dpr);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let suave = 0;
    let ultimo = 0;
    const c = tamano / 2;

    const dibujar = (t: number) => {
      raf = requestAnimationFrame(dibujar);
      if (reducido && t - ultimo < 250) return;
      ultimo = t;
      const f = faseRef.current;
      const objetivo = f === "escuchando" || f === "hablando" ? nivelRef.current() : 0;
      suave += (objetivo - suave) * 0.18;
      const [a, b] = COLORES[f];
      ctx.clearRect(0, 0, tamano, tamano);

      // Halo
      // Con avatar, los anillos se abren para dejar el disco a la vista.
      const r0 = tamano * (avatar ? 0.34 : 0.3);
      const halo = ctx.createRadialGradient(c, c, r0 * 0.4, c, c, c);
      halo.addColorStop(0, `${a}88`);
      halo.addColorStop(1, `${a}00`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(c, c, c, 0, Math.PI * 2);
      ctx.fill();

      // Anillos ondulantes
      const anillos = 4;
      for (let k = 0; k < anillos; k++) {
        const fase = t / (f === "pensando" || f === "conectando" ? 380 : 700) + k * 1.3;
        const base = r0 * (0.78 + k * 0.1) + suave * tamano * (avatar ? 0.07 : 0.11) * (1 - k * 0.18);
        ctx.beginPath();
        const pasos = 72;
        for (let i = 0; i <= pasos; i++) {
          const ang = (i / pasos) * Math.PI * 2;
          const ond = reducido
            ? 0
            : Math.sin(ang * 3 + fase) * (1.4 + suave * 9) + Math.cos(ang * 5 - fase * 1.4) * (0.8 + suave * 5);
          const r = base + ond;
          const x = c + Math.cos(ang) * r;
          const y = c + Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = k === 0 ? b : `${b}${["", "aa", "66", "33"][k]}`;
        ctx.lineWidth = k === 0 ? 2 : 1.2;
        ctx.stroke();
      }

      // Núcleo (el avatar lo reemplaza)
      if (!avatar) {
        const nucleo = ctx.createRadialGradient(c - r0 * 0.25, c - r0 * 0.25, 2, c, c, r0 * 0.82);
        nucleo.addColorStop(0, "#ffffff");
        nucleo.addColorStop(0.25, b);
        nucleo.addColorStop(1, a);
        ctx.fillStyle = nucleo;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(c, c, r0 * (0.72 + suave * 0.12), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Arco de "pensando"
      if (f === "pensando" || f === "conectando" || f === "transcribiendo") {
        const g = (t / 600) % (Math.PI * 2);
        ctx.beginPath();
        ctx.arc(c, c, r0 * 1.32, g, g + Math.PI * 0.55);
        ctx.strokeStyle = "#e8eefc";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(raf);
  }, [tamano, avatar]);

  const lienzo = (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={avatar ? "absolute inset-0" : className}
      // El tamaño del canvas depende de la prop; Tailwind no puede generarlo dinámicamente.
      style={{ width: tamano, height: tamano }}
    />
  );

  if (!avatar) return lienzo;
  return (
    <span
      className={`relative grid place-items-center ${className ?? ""}`}
      // El tamaño depende de la prop; Tailwind no puede generarlo dinámicamente.
      style={{ width: tamano, height: tamano }}
    >
      {lienzo}
      <AvatarArs fase={fase} nivel={nivel} tamano={Math.round(tamano * 0.52)} />
    </span>
  );
}
