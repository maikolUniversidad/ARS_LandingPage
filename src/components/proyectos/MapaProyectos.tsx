"use client";

import type { KeyboardEvent } from "react";
import type { PaisId } from "@/data/proyectos";
import { cn } from "@/lib/utils";
import { MAPA_H, MAPA_W, type GeometriaMapa } from "./geometria-tipos";

export type CiudadMapa = { id: string; nombre: string; pais: PaisId; total: number; visibles: number };

type Props = {
  geometria: GeometriaMapa;
  ciudades: CiudadMapa[];
  seleccionada: string | null;
  pais: PaisId | null;
  onSeleccionar: (id: string | null) => void;
};

const NOMBRE_PAIS: Record<PaisId, string> = { CO: "Colombia", PE: "Perú" };

/** Mapa de presencia: Colombia y Perú resaltados, un marcador por ciudad con su número de casos. */
export function MapaProyectos({ geometria, ciudades, seleccionada, pais, onSeleccionar }: Props) {
  const porId = new Map(ciudades.map((c) => [c.id, c]));

  const alternar = (id: string) => onSeleccionar(seleccionada === id ? null : id);
  const teclado = (id: string) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      alternar(id);
    }
  };

  return (
    <svg
      viewBox={`0 0 ${MAPA_W} ${MAPA_H}`}
      className="h-auto w-full select-none"
      role="group"
      aria-label="Mapa de proyectos en Colombia y Perú. Elija una ciudad para filtrar los casos."
    >
      <defs>
        <radialGradient id="mapa-halo" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2348d4" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#2348d4" stopOpacity="0" />
        </radialGradient>
        <pattern id="mapa-rejilla" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" className="stroke-white/[0.05]" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={MAPA_W} height={MAPA_H} fill="url(#mapa-rejilla)" />
      <rect width={MAPA_W} height={MAPA_H} fill="url(#mapa-halo)" />

      {geometria.paises.map((p) => {
        const activo = p.pais !== null && (pais === null || pais === p.pais);
        return (
          <path
            key={p.nombre}
            d={p.d}
            strokeWidth={p.pais ? 1.1 : 0.6}
            strokeLinejoin="round"
            className={cn(
              "transition-[fill,stroke] duration-300",
              p.pais === null && "fill-white/[0.025] stroke-white/10",
              p.pais !== null && activo && "fill-[#6b8aff]/[0.22] stroke-[#9fb4ff]/80",
              p.pais !== null && !activo && "fill-white/[0.04] stroke-white/20"
            )}
          />
        );
      })}

      {geometria.etiquetas.map((e) => (
        <text
          key={e.pais}
          x={e.x}
          y={e.y}
          textAnchor="middle"
          className="fill-white/25 font-mono text-[13px] uppercase tracking-[0.4em]"
        >
          {NOMBRE_PAIS[e.pais]}
        </text>
      ))}

      {geometria.ciudades.map((pt) => {
        const c = porId.get(pt.id);
        if (!c) return null;
        const sel = seleccionada === c.id;
        const apagada = c.visibles === 0 || (seleccionada !== null && !sel);
        const r = 5 + Math.min(c.total, 5) * 1.6;
        const izquierda = c.id === "medellin";
        return (
          <g
            key={c.id}
            transform={`translate(${pt.x} ${pt.y})`}
            role="button"
            tabIndex={0}
            aria-pressed={sel}
            aria-label={`${c.nombre}: ${c.visibles} de ${c.total} ${c.total === 1 ? "caso" : "casos"}`}
            onClick={() => alternar(c.id)}
            onKeyDown={teclado(c.id)}
            className={cn(
              "group cursor-pointer outline-none transition-opacity duration-300",
              apagada ? "opacity-45 hover:opacity-90 focus-visible:opacity-100" : "opacity-100"
            )}
          >
            <title>{`${c.nombre} · ${c.total} ${c.total === 1 ? "caso" : "casos"}`}</title>
            {/* área de toque generosa */}
            <circle r={22} className="fill-transparent" />
            {!apagada && (
              <circle
                r={r}
                className="origin-center fill-[#6b8aff]/25 [transform-box:fill-box] motion-safe:animate-ping"
              />
            )}
            <circle
              r={r}
              strokeWidth={sel ? 2.5 : 1.5}
              className={cn(
                "transition-colors",
                sel ? "fill-white stroke-[#6b8aff]" : "fill-[#6b8aff] stroke-white/80 group-hover:fill-white group-focus-visible:fill-white"
              )}
            />
            <text
              y={0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn("pointer-events-none font-mono text-[10px] font-bold", sel ? "fill-[#142664]" : "fill-white group-hover:fill-[#142664]")}
            >
              {c.total}
            </text>
            <text
              x={izquierda ? -(r + 8) : r + 8}
              y={1}
              textAnchor={izquierda ? "end" : "start"}
              dominantBaseline="middle"
              className={cn(
                "pointer-events-none font-mono text-[12px] uppercase tracking-[0.18em]",
                sel ? "fill-white font-bold" : "fill-white/75"
              )}
            >
              {c.nombre}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
