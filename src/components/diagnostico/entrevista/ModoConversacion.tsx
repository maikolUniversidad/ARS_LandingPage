"use client";

import { useEffect, useRef } from "react";
import { PhoneOff } from "lucide-react";
import type { FaseVoz } from "./useVozEntrevista";
import css from "./entrevista.module.css";

const COLOR: Record<FaseVoz, [number, number, number]> = {
  apagado: [107, 138, 255],
  conectando: [158, 176, 192],
  escuchando: [53, 224, 161],
  transcribiendo: [53, 224, 161],
  pensando: [255, 209, 102],
  hablando: [107, 138, 255],
  pausa: [158, 176, 192],
};

const TEXTO: Record<FaseVoz, string> = {
  apagado: "",
  conectando: "Conectando…",
  escuchando: "Te escucho…",
  transcribiendo: "Entendiendo…",
  pensando: "Ars está pensando…",
  hablando: "Ars está hablando",
  pausa: "En pausa · toca el orbe para hablar",
};

const AYUDA: Partial<Record<FaseVoz, string>> = {
  escuchando: "Toca el orbe cuando termines",
  hablando: "Toca el orbe o habla para interrumpir",
};

/** Orbe que respira con el audio (entrada o salida) dibujado en canvas. */
function Orbe({ fase, nivel }: { fase: FaseVoz; nivel: () => number }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const faseRef = useRef(fase);
  useEffect(() => {
    faseRef.current = fase;
  }, [fase]);

  useEffect(() => {
    const c = lienzo.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const lado = 220;
    c.width = lado * dpr;
    c.height = lado * dpr;
    ctx.scale(dpr, dpr);
    let suave = 0;
    let raf = 0;
    const dibujar = (t: number) => {
      const f = faseRef.current;
      const [r, g, b] = COLOR[f];
      const objetivo = Math.min(1, nivel() * 1.6);
      suave += (objetivo - suave) * 0.18;
      const mov = reducido ? 0 : 1;
      ctx.clearRect(0, 0, lado, lado);
      const cx = lado / 2;
      const base = 58 + suave * 22 * mov;

      // Halo
      const halo = ctx.createRadialGradient(cx, cx, base * 0.4, cx, cx, cx - 1);
      halo.addColorStop(0, `rgba(${r},${g},${b},${0.28 + suave * 0.3})`);
      halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, lado, lado);

      // Contorno ondulado (reacciona al nivel)
      ctx.beginPath();
      const puntos = 96;
      for (let i = 0; i <= puntos; i++) {
        const a = (i / puntos) * Math.PI * 2;
        const onda = mov * (Math.sin(a * 5 + t / 260) * 3 + Math.sin(a * 9 - t / 180) * (2 + suave * 9));
        const rad = base + onda;
        const x = cx + Math.cos(a) * rad;
        const y = cx + Math.sin(a) * rad;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      const cuerpo = ctx.createRadialGradient(cx - base * 0.35, cx - base * 0.4, base * 0.1, cx, cx, base * 1.05);
      cuerpo.addColorStop(0, "rgba(235,242,255,0.95)");
      cuerpo.addColorStop(0.35, `rgba(${r},${g},${b},0.85)`);
      cuerpo.addColorStop(1, "rgba(20,38,100,0.9)");
      ctx.fillStyle = cuerpo;
      ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},0.7)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Arco giratorio mientras piensa
      if (f === "pensando" || f === "transcribiendo" || f === "conectando") {
        ctx.beginPath();
        const ini = mov ? t / 300 : 0;
        ctx.arc(cx, cx, base + 16, ini, ini + Math.PI * 0.6);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      raf = requestAnimationFrame(dibujar);
    };
    raf = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(raf);
  }, [nivel]);

  return <canvas ref={lienzo} className="size-[220px]" aria-hidden="true" />;
}

/** Capa de conversación manos libres sobre el chat: orbe, subtítulos y colgar. */
export function ModoConversacion({
  fase,
  nivel,
  parcial,
  subtitulo,
  onOrbe,
  onColgar,
}: {
  fase: FaseVoz;
  nivel: () => number;
  parcial: string;
  subtitulo: string;
  onOrbe: () => void;
  onColgar: () => void;
}) {
  const texto = fase === "hablando" ? subtitulo : parcial;
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,rgba(35,72,212,0.25),rgba(2,10,24,0.94)_70%)] px-6 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-label="Conversación por voz con Ars"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0]">Modo conversación</p>
      <button type="button" onClick={onOrbe} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]" aria-label={AYUDA[fase] ?? TEXTO[fase]}>
        <Orbe fase={fase} nivel={nivel} />
      </button>
      <p className={`text-[15px] font-bold ${fase === "pensando" ? css.brillo : "text-white"}`} aria-live="polite">
        {TEXTO[fase]}
      </p>
      <p className="min-h-[3.5rem] max-w-lg text-center text-[14px] leading-relaxed text-[#c9d5e0]" aria-live="polite">
        {texto && <span key={texto.slice(0, 24)} className="animate-in fade-in duration-300">{texto}</span>}
      </p>
      {AYUDA[fase] && <p className="text-[11.5px] text-[#9eb0c0]/70">{AYUDA[fase]}</p>}
      <button
        type="button"
        onClick={onColgar}
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#e5484d] px-5 py-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_24px_rgba(229,72,77,0.45)] transition-transform hover:scale-105 motion-reduce:hover:scale-100"
      >
        <PhoneOff className="size-4" aria-hidden="true" /> Colgar
      </button>
    </div>
  );
}
