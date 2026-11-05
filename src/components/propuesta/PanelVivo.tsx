"use client";

import { AREA_IDS } from "@/data/diagnostico/tipos";
import type { Respuestas } from "@/data/propuesta/tipos";
import { Icono, rgba } from "@/components/servicios/ui";
import { areaInfo } from "@/lib/diagnostico/catalogo";
import { cn } from "@/lib/utils";
import { areasEncendidas, partirTexto, useMenosMovimiento } from "./util";

const RANGO: Record<string, string> = { "1-50": "Hasta 50 vigilantes", "51-200": "51 a 200 vigilantes", "201-1000": "201 a 1.000 vigilantes", "1000+": "Más de 1.000 vigilantes" };

/** Nombre a mostrar por app (el ERP con su nombre real si lo dijeron). */
function nodosApps(r: Respuestas): string[] {
  const apps = r.aplicaciones.map((a) => (a === "ERP" && r.erp.trim() ? r.erp.trim() : a));
  return [...new Set(apps)].slice(0, 10);
}

/** Grafo SVG: cada aplicación de la empresa es un nodo que se conecta a ARS. */
export function GrafoApps({ apps, className }: { apps: string[]; className?: string }) {
  const quieto = useMenosMovimiento();
  const cx = 160;
  const cy = 100;
  const n = apps.length;
  return (
    <svg viewBox="-10 -12 340 226" className={cn("h-auto w-full", className)} role="img" aria-label={n ? `Sus aplicaciones conectadas a ARS: ${apps.join(", ")}` : "Aún no ha elegido aplicaciones"}>
      <defs>
        <radialGradient id="prop-nucleo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#6b8aff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#2348d4" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={128} ry={78} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 5" />
      {n === 0 && (
        <text x={cx} y={182} textAnchor="middle" className="fill-white/35 font-mono text-[8px] uppercase tracking-[0.2em]">
          Sus aplicaciones aparecerán aquí
        </text>
      )}
      {apps.map((app, i) => {
        const ang = -Math.PI / 2 + (i / Math.max(n, 1)) * Math.PI * 2 + (n % 2 ? 0 : Math.PI / Math.max(n, 1));
        const x = cx + Math.cos(ang) * 128;
        const y = cy + Math.sin(ang) * 78;
        const lineas = partirTexto(app, 13, 2);
        const debajo = y >= cy;
        return (
          <g key={app} className="animate-in fade-in duration-700">
            <line x1={x} y1={y} x2={cx} y2={cy} stroke="rgba(107,138,255,0.18)" strokeWidth="1" />
            <line x1={x} y1={y} x2={cx} y2={cy} stroke="#6b8aff" strokeWidth="1.4" strokeDasharray="3 9" strokeLinecap="round">
              {!quieto && <animate attributeName="stroke-dashoffset" from="24" to="0" dur={`${1.4 + (i % 3) * 0.3}s`} repeatCount="indefinite" />}
            </line>
            <circle cx={x} cy={y} r="5" fill="#020a18" stroke="#9fb4ff" strokeWidth="1.5" />
            {lineas.map((l, k) => (
              <text
                key={k}
                x={x}
                y={debajo ? y + 17 + k * 10.5 : y - 10 - (lineas.length - 1 - k) * 10.5}
                textAnchor="middle"
                className="fill-[#d5e0ff] text-[10px]"
              >
                {l}
              </text>
            ))}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="24" fill="url(#prop-nucleo)">
        {!quieto && n > 0 && <animate attributeName="r" values="23;26;23" dur="2.6s" repeatCount="indefinite" />}
      </circle>
      <circle cx={cx} cy={cy} r="17" fill="#020a18" stroke="#6b8aff" strokeWidth="1.2" />
      <text x={cx} y={cy + 3.5} textAnchor="middle" className="fill-white font-mono text-[10px] font-bold tracking-[0.15em]">
        ARS
      </text>
    </svg>
  );
}

/** Panel que se llena mientras la persona responde: perfil, áreas que se encienden y sus apps conectadas a ARS. */
export function PanelVivo({ respuestas: r, pct }: { respuestas: Respuestas; pct: number }) {
  const areas = areasEncendidas(r);
  const apps = nodosApps(r);
  const datos = [r.ciudad, r.vigilantes ? RANGO[r.vigilantes] : "", r.sedes.trim() ? `${r.sedes.trim()} sedes` : ""].filter(Boolean);
  return (
    <aside aria-label="Su propuesta en construcción" className="border border-white/10 bg-[#071229]/80 p-4 backdrop-blur md:p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#6b8aff]">Propuesta en construcción</p>
        <span className="font-mono text-[11px] tabular-nums text-white/80">{pct}%</span>
      </div>
      <div className="mt-2 h-1 bg-white/[0.06]" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-[#1d3885] via-[#2348d4] to-[#6b8aff] transition-[width] duration-700 ease-out" style={{ width: `${Math.max(4, pct)}%` }} />
      </div>
      <p className="mt-4 font-heading text-xl font-black leading-tight text-white md:text-2xl">
        {r.empresa.trim() ? (
          <span key={r.empresa} className="animate-in fade-in duration-700">
            {r.empresa}
          </span>
        ) : (
          <span className="text-white/30">Su empresa</span>
        )}
      </p>
      <p className="mt-1 min-h-5 text-[12.5px] text-[#9eb0c0]">{datos.length ? datos.join(" · ") : "Ciudad, tamaño y sedes"}</p>

      <GrafoApps apps={apps} className="mt-2" />

      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#9eb0c0]">Áreas de ARS que aplican</p>
      <ul className="mt-2 grid grid-cols-11 gap-1">
        {AREA_IDS.map((id) => {
          const a = areaInfo(id);
          const on = areas.includes(id);
          return (
            <li
              key={id}
              title={a.nombre}
              className="grid aspect-square place-items-center border transition-all duration-700"
              style={
                on
                  ? { borderColor: rgba(a.color, 0.6), background: rgba(a.color, 0.15), color: a.color, boxShadow: `0 0 14px ${rgba(a.color, 0.35)}` }
                  : { borderColor: "rgba(255,255,255,0.06)", color: "rgba(158,176,192,0.3)" }
              }
            >
              <Icono nombre={a.icono} className="size-3.5" />
              <span className="sr-only">
                {a.nombre}
                {on ? " (aplica)" : ""}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[12px] text-[#9eb0c0]/90" aria-live="polite">
        {areas.length
          ? `${areas.length} de ${AREA_IDS.length} áreas: ${areas.map((id) => areaInfo(id).corto).join(", ")}.`
          : "Las áreas de ARS se encienden según lo que nos cuente."}
      </p>
    </aside>
  );
}
