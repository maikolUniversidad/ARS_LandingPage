"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import s from "./carga.module.css";

/** Las cinco capas de ARS (mismos tintes que la home) y el núcleo: la base ERP. */
const CAPAS = [
  { tinte: "#5fd8ff", es: "Física", en: "Field" },
  { tinte: "#ffb547", es: "Visión IA", en: "AI vision" },
  { tinte: "#35e0a1", es: "IoT", en: "IoT" },
  { tinte: "#a88bff", es: "Robótica", en: "Robotics" },
  { tinte: "#d5e0ff", es: "Central", en: "Control" },
] as const;
const NUCLEO = "#6b8aff";

const TEXTOS = {
  es: { etiqueta: "Iniciando escena · conectando capas", lista: "Escena lista" },
  en: { etiqueta: "Starting scene · connecting layers", lista: "Scene ready" },
} as const;

// Geometría fija del SVG (viewBox -200 -200 400 400): pentágono de capas alrededor del núcleo.
const R_ANILLO = 138;
const R_NODO = 9;
const R_NUCLEO = 40;
const NODOS = CAPAS.map((c, i) => {
  const a = (-90 + i * 72) * (Math.PI / 180);
  const x = Math.cos(a);
  const y = Math.sin(a);
  const r = (v: number) => Math.round(v * 10) / 10;
  return {
    ...c,
    x: r(x * R_ANILLO),
    y: r(y * R_ANILLO),
    // La línea de luz va del borde del nodo al borde del núcleo.
    d: `M${r(x * (R_ANILLO - R_NODO - 4))} ${r(y * (R_ANILLO - R_NODO - 4))}L${r(x * (R_NUCLEO + 6))} ${r(y * (R_NUCLEO + 6))}`,
    // Etiqueta bajo el nodo (sobre él, el de arriba).
    lx: r(x * R_ANILLO),
    ly: r(y * R_ANILLO + (y < -0.9 ? -20 : 30)),
  };
});
const PENTAGONO = NODOS.map((n) => `${n.x},${n.y}`).join(" ");

export type CargaTecnologicaProps = {
  /** Texto visible y anunciado (por defecto «Iniciando escena · conectando capas»). */
  etiqueta?: string;
  /** 0–1. Sin valor: progreso indeterminado. */
  progreso?: number;
  /** `pantalla`: fondo completo con la red a un costado del texto. `caja`: centrado en un contenedor. */
  variante?: "pantalla" | "caja";
  /** true cuando la escena ya pintó: se funde y deja de animar. */
  listo?: boolean;
  className?: string;
};

/**
 * Estado de carga de las escenas 3D: «la plataforma encendiéndose».
 * Rejilla en perspectiva que se traza, las cinco capas que se encienden en
 * secuencia y mandan luz al núcleo (ERP), barrido de escaneo y una etiqueta mono.
 * Solo CSS/SVG (nada de three): aparece al instante, incluso antes de hidratar.
 */
export function CargaTecnologica({ etiqueta, progreso, variante = "caja", listo = false, className }: CargaTecnologicaProps) {
  const { locale } = useI18n();
  const t = TEXTOS[locale];
  const raizRef = useRef<HTMLDivElement>(null);
  const [retirado, setRetirado] = useState(false);
  const pantalla = variante === "pantalla";
  const pct = progreso === undefined ? undefined : Math.round(Math.min(1, Math.max(0, progreso)) * 100);
  const texto = etiqueta ?? t.etiqueta;

  // Pausa todo si la pestaña está oculta o el cargador no está en pantalla (sin re-render).
  useEffect(() => {
    const el = raizRef.current;
    if (!el) return;
    let enPantalla = true;
    const sync = () => {
      const pausar = listo || !enPantalla || document.visibilityState !== "visible";
      if (pausar) el.setAttribute("data-pausado", "");
      else el.removeAttribute("data-pausado");
    };
    const io = new IntersectionObserver(([e]) => {
      enPantalla = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [listo]);

  // Tras el fundido de salida se retira del árbol de render (display: none).
  useEffect(() => {
    if (!listo) return;
    const id = window.setTimeout(() => setRetirado(true), 1100);
    return () => {
      window.clearTimeout(id);
      setRetirado(false);
    };
  }, [listo]);

  return (
    <div
      ref={raizRef}
      role="status"
      aria-live="polite"
      aria-busy={!listo}
      className={cn(
        s.raiz,
        "pointer-events-none absolute inset-0 overflow-hidden bg-[#020a18] transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-opacity",
        listo ? "scale-[1.03] opacity-0" : "scale-100 opacity-100",
        listo && retirado && "hidden",
        className
      )}
    >
      <span className="sr-only">{listo ? t.lista : pct === undefined ? texto : `${texto}: ${pct}%`}</span>

      {/* Halo de marca */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0",
          pantalla
            ? "bg-[radial-gradient(60%_45%_at_50%_30%,rgba(35,72,212,0.26),transparent_70%)] md:bg-[radial-gradient(42%_55%_at_70%_48%,rgba(35,72,212,0.28),transparent_70%)]"
            : "bg-[radial-gradient(60%_60%_at_50%_45%,rgba(35,72,212,0.24),transparent_72%)]"
        )}
      />

      {/* Rejilla en perspectiva que se va trazando */}
      <div aria-hidden="true" className={cn(s.rejilla, "absolute inset-x-[-40%] bottom-0", pantalla ? "h-[62%]" : "h-[58%]")}>
        <div className={cn(s.plano, s.planoMovil)} />
      </div>

      {/* Barrido de escaneo */}
      <div aria-hidden="true" className={cn(s.barrido, "absolute inset-x-0 top-0 h-1/4")} />

      {/* Red de capas + etiqueta */}
      <div
        className={cn(
          "absolute flex flex-col items-center",
          pantalla
            ? // Móvil: etiqueta arriba (bajo la cabecera) y la red detrás, lejos del titular.
              "left-1/2 top-[76px] w-[min(68vw,280px)] -translate-x-1/2 flex-col-reverse md:left-[70%] md:top-1/2 md:w-[min(34vw,460px)] md:-translate-y-1/2 md:flex-col"
            : "left-1/2 top-1/2 w-[min(64%,300px)] -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <svg viewBox="-200 -200 400 400" className="aspect-square w-full overflow-visible" aria-hidden="true">
          <defs>
            <radialGradient id="carga-nucleo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b9c8ff" stopOpacity="0.95" />
              <stop offset="45%" stopColor={NUCLEO} stopOpacity="0.55" />
              <stop offset="100%" stopColor="#2348d4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Pentágono guía y anillos de órbita */}
          <polygon points={PENTAGONO} fill="none" stroke="#6b8aff" strokeOpacity="0.14" strokeWidth="1" />
          <circle r={R_ANILLO} fill="none" stroke="#6b8aff" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 6" />
          <g className={s.girar}>
            <circle r="84" fill="none" stroke="#6b8aff" strokeOpacity="0.32" strokeWidth="1" strokeDasharray="1 5 24 5" />
          </g>
          <g className={s.girarInverso}>
            <circle r="62" fill="none" stroke="#9fb4ff" strokeOpacity="0.28" strokeWidth="1.2" strokeDasharray="40 10 4 10" />
          </g>

          {/* Líneas de luz capa → núcleo */}
          {NODOS.map((n, i) => (
            <g key={n.es} style={{ "--i": i } as CSSProperties}>
              <path d={n.d} stroke={n.tinte} strokeOpacity="0.14" strokeWidth="1" />
              <path d={n.d} pathLength={100} className={s.linea} stroke={n.tinte} strokeOpacity="0.7" strokeWidth="1.4" fill="none" />
              <path
                d={n.d}
                pathLength={100}
                className={s.paquete}
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ))}

          {/* Núcleo: la base ERP donde todo queda trazado */}
          <g className={s.nucleo}>
            <circle r={R_NUCLEO + 30} fill="url(#carga-nucleo)" opacity="0.55" />
            <circle className={s.onda} r={R_NUCLEO} fill="none" stroke={NUCLEO} strokeOpacity="0.6" strokeWidth="1" />
            <polygon
              points="0,-40 34.6,-20 34.6,20 0,40 -34.6,20 -34.6,-20"
              fill="#0a1a44"
              fillOpacity="0.85"
              stroke={NUCLEO}
              strokeWidth="1.4"
            />
            <polygon points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11" fill={NUCLEO} fillOpacity="0.25" stroke="#b9c8ff" strokeOpacity="0.8" strokeWidth="1" />
            <circle r="5" fill="#e6eeff" />
          </g>

          {/* Nodos de las cinco capas */}
          {NODOS.map((n, i) => (
            <g key={n.es} style={{ "--i": i } as CSSProperties}>
              <circle className={s.anilloNodo} cx={n.x} cy={n.y} r={R_NODO} fill="none" stroke={n.tinte} strokeWidth="1.2" />
              <g className={s.nodo}>
                <circle cx={n.x} cy={n.y} r={R_NODO + 8} fill={n.tinte} opacity="0.12" />
                <rect x={n.x - R_NODO} y={n.y - R_NODO} width={R_NODO * 2} height={R_NODO * 2} fill="#020a18" stroke={n.tinte} strokeWidth="1.5" transform={`rotate(45 ${n.x} ${n.y})`} />
                <rect x={n.x - 3.5} y={n.y - 3.5} width="7" height="7" fill={n.tinte} transform={`rotate(45 ${n.x} ${n.y})`} />
                {pantalla && (
                  <text
                    x={n.lx}
                    y={n.ly}
                    textAnchor="middle"
                    fill={n.tinte}
                    className="font-mono uppercase max-md:hidden"
                    fontSize="10.5"
                    letterSpacing="2"
                  >
                    {n[locale]}
                  </text>
                )}
              </g>
            </g>
          ))}
        </svg>

        {/* Etiqueta mono con progreso */}
        <div aria-hidden="true" className={cn("w-full", pantalla ? "mb-3 max-w-[300px] md:mb-0 md:mt-5" : "mt-3 max-w-[260px]")}>
          <div className="flex items-baseline justify-between gap-3 font-mono uppercase text-[#b9c8ff]/75">
            <span className={cn("truncate", pantalla ? "text-[9px] tracking-[0.16em] md:text-[10px] md:tracking-[0.22em]" : "text-[9px] tracking-[0.2em]")}>
              {texto}
              <span className={cn(s.cursor, "ml-0.5 text-[#6b8aff]")}>_</span>
            </span>
            {pct !== undefined && <span className="shrink-0 text-[10px] tabular-nums tracking-[0.12em] text-[#d5e0ff]/80">{pct}%</span>}
          </div>
          <div className="relative mt-2 h-px w-full overflow-hidden bg-[#6b8aff]/18">
            {pct === undefined ? (
              <div className={cn(s.indeterminado, "absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-[#9fb4ff] to-transparent")} />
            ) : (
              <div
                className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-[#2348d4] to-[#9fb4ff] transition-transform duration-500 ease-out"
                style={{ transform: `scaleX(${(pct / 100).toFixed(3)})` }}
              />
            )}
          </div>
          {/* Marcas de las capas, en fase con los nodos */}
          <div className="mt-2 grid grid-cols-5 gap-1">
            {CAPAS.map((c, i) => (
              <span key={c.es} className={cn(s.nodo, "h-[3px]")} style={{ "--i": i, background: c.tinte } as CSSProperties} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
