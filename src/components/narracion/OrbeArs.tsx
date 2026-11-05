"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type EstadoOrbe = "reposo" | "escuchando" | "pensando" | "hablando";

type Props = {
  estado: EstadoOrbe;
  /** Nivel real 0..1 (voz de la narración, de la respuesta o del micrófono). */
  nivel: () => number;
  /** Diámetro del núcleo en px; el lienzo es más grande para el brillo y las notas. */
  tamano?: number;
  /** Notas que brotan del orbe mientras habla. */
  notas?: boolean;
  className?: string;
};

type Particula = { x: number; y: number; vx: number; vy: number; vida: number; max: number; glifo: string; tam: number; giro: number };

const GLIFOS = ["♪", "♫", "♩", "•", "♪", "·"];
const ESCALA = 3.4;

/**
 * Orbe de Ars dibujado en canvas: pulsa, se deforma y brilla con el nivel real
 * del audio; mientras habla, le brotan notas. Al escuchar se vuelve cian y
 * emite anillos; al pensar, gira un brillo lento. Con `prefers-reduced-motion`
 * no se deforma ni suelta partículas (solo cambia el brillo, a baja cadencia).
 */
export function OrbeArs({ estado, nivel, tamano = 32, notas = false, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const estadoRef = useRef(estado);
  const nivelRef = useRef(nivel);
  const notasRef = useRef(notas);

  useEffect(() => {
    estadoRef.current = estado;
    nivelRef.current = nivel;
    notasRef.current = notas;
  }, [estado, nivel, notas]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const lado = Math.round(tamano * ESCALA);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = lado * dpr;
    canvas.height = lado * dpr;
    ctx.scale(dpr, dpr);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = lado / 2;
    const R = tamano / 2;
    // Las notas viajan en proporción al orbe (que no se salgan del lienzo).
    const vel = Math.max(0.45, Math.min(1.2, R / 30));
    const parts: Particula[] = [];
    let suave = 0;
    let anillo = 0;
    let raf = 0;
    let ultimo = 0;
    let previo = performance.now();

    const dibujar = (ahora: number) => {
      raf = requestAnimationFrame(dibujar);
      if (reducido && ahora - ultimo < 250) return;
      ultimo = ahora;
      const dt = Math.min(0.05, (ahora - previo) / 1000);
      previo = ahora;
      const t = ahora / 1000;
      const e = estadoRef.current;
      const objetivo = e === "hablando" || e === "escuchando" ? Math.min(1, nivelRef.current()) : 0;
      // Ataque rápido, caída lenta: se lee como «habla».
      suave += (objetivo - suave) * (objetivo > suave ? 0.45 : 0.12);
      const s = suave;
      ctx.clearRect(0, 0, lado, lado);

      const [claro, medio, oscuro] =
        e === "escuchando" ? ["#9fe4ff", "#2f8fd4", "#123a64"] : e === "pensando" ? ["#8ea4ff", "#22398f", "#0e1a48"] : ["#8ea6ff", "#2348d4", "#142664"];

      // Halo / brillo
      const brillo = 0.18 + s * 0.75 + (e === "reposo" ? 0.06 * Math.sin(t * 1.6) : 0);
      const halo = ctx.createRadialGradient(c, c, R * 0.6, c, c, R * (1.6 + s * 0.9));
      halo.addColorStop(0, `rgba(107,138,255,${0.55 * brillo})`);
      halo.addColorStop(1, "rgba(107,138,255,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(c, c, R * (1.6 + s * 0.9), 0, Math.PI * 2);
      ctx.fill();

      // Anillos al escuchar
      if (e === "escuchando" && !reducido) {
        anillo = (anillo + dt * (0.6 + s)) % 1;
        for (const k of [0, 0.5]) {
          const a = (anillo + k) % 1;
          ctx.strokeStyle = `rgba(127,209,255,${(1 - a) * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(c, c, R * (1 + a * 0.9), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Núcleo deformado
      const base = R * (0.9 + s * 0.2 + (e === "reposo" && !reducido ? 0.025 * Math.sin(t * 2.2) : 0));
      const def = reducido ? 0 : 0.035 + s * 0.16;
      ctx.save();
      ctx.shadowColor = claro;
      ctx.shadowBlur = 6 + s * 26;
      const grad = ctx.createRadialGradient(c - R * 0.35, c - R * 0.35, R * 0.1, c, c, base * 1.15);
      grad.addColorStop(0, claro);
      grad.addColorStop(0.55, medio);
      grad.addColorStop(1, oscuro);
      ctx.fillStyle = grad;
      ctx.beginPath();
      const N = 48;
      for (let i = 0; i <= N; i++) {
        const th = (i / N) * Math.PI * 2;
        const r =
          base *
          (1 +
            def * (Math.sin(3 * th + t * 2.3) * 0.55 + Math.sin(5 * th - t * 3.1) * 0.3 + Math.sin(2 * th + t * 1.4) * 0.35));
        const x = c + Math.cos(th) * r;
        const y = c + Math.sin(th) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Brillo que gira al pensar
      if (e === "pensando" && !reducido) {
        const a = t * 2.4;
        ctx.strokeStyle = "rgba(197,210,238,0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c, c, R * 1.12, a, a + 1.1);
        ctx.stroke();
      }

      // Destello interior
      ctx.fillStyle = `rgba(255,255,255,${0.18 + s * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(c - R * 0.3, c - R * 0.32, R * 0.26, R * 0.16, -0.6, 0, Math.PI * 2);
      ctx.fill();

      // Notas que brotan mientras habla
      if (!reducido && notasRef.current && e === "hablando" && s > 0.12 && parts.length < 26 && Math.random() < s * 0.45) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
        parts.push({
          x: c + Math.cos(ang) * base,
          y: c + Math.sin(ang) * base,
          vx: Math.cos(ang) * (10 + Math.random() * 16) * vel,
          vy: (Math.sin(ang) * (12 + Math.random() * 14) - 14) * vel,
          vida: 0,
          max: 1.1 + Math.random() * 0.9,
          glifo: GLIFOS[Math.floor(Math.random() * GLIFOS.length)],
          tam: Math.max(8, R * (0.42 + Math.random() * 0.3)),
          giro: (Math.random() - 0.5) * 1.2,
        });
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vida += dt;
        if (p.vida >= p.max) {
          parts.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= 6 * vel * dt;
        const k = p.vida / p.max;
        ctx.save();
        ctx.globalAlpha = (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85) * 0.9;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.giro * k);
        ctx.fillStyle = k < 0.5 ? "#dce5f7" : "#8ea6ff";
        ctx.font = `${p.tam}px system-ui, sans-serif`;
        ctx.fillText(p.glifo, 0, 0);
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(raf);
  }, [tamano]);

  const lado = Math.round(tamano * ESCALA);
  return (
    <span className={cn("pointer-events-none relative inline-grid shrink-0 place-items-center", className)} style={{ width: tamano, height: tamano }} aria-hidden="true">
      <canvas ref={ref} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: lado, height: lado }} />
    </span>
  );
}
