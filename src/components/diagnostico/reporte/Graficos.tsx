"use client";

import { useId, useState } from "react";
import type { Diagnostico, Metrica } from "@/data/diagnostico/tipos";
import { cn } from "@/lib/utils";
import { arco, barra, colorArea, cronograma, esMejora, mejora, nombreArea, SERIE, totalSemanas, valorConUnidad } from "./datos";

const C = SERIE.oscuro;

/** Etiqueta «estimado» que acompaña toda cifra del diagnóstico. */
export function Estimado({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/15 px-2 py-0.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] text-[#9eb0c0]",
        className
      )}
    >
      Estimado
    </span>
  );
}

export function Leyenda({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/75", className)}>
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-2.5 w-4 rounded-[2px]" style={{ background: C.antes }} aria-hidden="true" />
        Hoy
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-2.5 w-4 rounded-[2px]" style={{ background: C.despues }} aria-hidden="true" />
        Con ARS
      </span>
    </div>
  );
}

/* ───────────── Medidor de madurez (dos anillos concéntricos, sin solapes) ───────────── */

export function MedidorMadurez({ hoy, conArs }: { hoy: number; conArs: number }) {
  const [foco, setFoco] = useState<"hoy" | "ars" | null>(null);
  const cx = 120;
  const cy = 118;
  const anillos = [
    { clave: "ars" as const, r: 100, valor: conArs, color: C.despues, etiqueta: "Con ARS" },
    { clave: "hoy" as const, r: 78, valor: hoy, color: C.antes, etiqueta: "Hoy" },
  ];
  return (
    <figure className="mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 240 132" className="w-full" role="img" aria-label={`Madurez digital estimada: hoy ${hoy} de 100; con ARS ${conArs} de 100.`}>
        {anillos.map((a) => (
          <g
            key={a.clave}
            onMouseEnter={() => setFoco(a.clave)}
            onMouseLeave={() => setFoco(null)}
            className="cursor-default transition-opacity"
            style={{ opacity: foco && foco !== a.clave ? 0.35 : 1 }}
          >
            <title>{`${a.etiqueta}: ${a.valor}/100 (estimado)`}</title>
            <path d={arco(cx, cy, a.r, 0, 100)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={14} strokeLinecap="round" />
            {a.valor > 0 && (
              <path d={arco(cx, cy, a.r, 0, a.valor)} fill="none" stroke={a.color} strokeWidth={14} strokeLinecap="round" />
            )}
            {/* área de captura más grande que la marca */}
            <path d={arco(cx, cy, a.r, 0, 100)} fill="none" stroke="transparent" strokeWidth={22} />
          </g>
        ))}
        <text x={cx - 100} y={cy + 13} textAnchor="middle" className="fill-white/45 font-mono" fontSize={8}>
          0
        </text>
        <text x={cx + 100} y={cy + 13} textAnchor="middle" className="fill-white/45 font-mono" fontSize={8}>
          100
        </text>
      </svg>
      <figcaption className="mt-3 flex items-end justify-center gap-3 md:gap-4">
        <div className="text-center">
          <div className="text-3xl font-black leading-none text-white/85 md:text-4xl">{hoy}</div>
          <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
            <span className="size-2 rounded-full" style={{ background: C.antes }} aria-hidden="true" />
            Hoy
          </div>
        </div>
        <div className="pb-5 text-xl text-white/40" aria-hidden="true">
          →
        </div>
        <div className="text-center">
          <div className="text-4xl font-black leading-none text-white md:text-5xl">{conArs}</div>
          <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
            <span className="size-2 rounded-full" style={{ background: C.despues }} aria-hidden="true" />
            Con ARS
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

/* ───────────── Métricas antes/después: múltiplos pequeños, una escala por métrica ───────────── */

function TarjetaMetrica({ m }: { m: Metrica }) {
  const [foco, setFoco] = useState<"antes" | "despues" | null>(null);
  const W = 320;
  const x0 = 64;
  // espacio a la derecha para la etiqueta de valor más larga (≈6,6 px por carácter a 12 px)
  const etiquetaMax = Math.max(valorConUnidad(m.antes, m.unidad).length, valorConUnidad(m.despues, m.unidad).length);
  const ancho = W - x0 - Math.max(56, etiquetaMax * 6.8 + 14);
  const max = Math.max(m.antes, m.despues, 1);
  const filas = [
    { clave: "antes" as const, etiqueta: "Hoy", valor: m.antes, color: C.antes, y: 6 },
    { clave: "despues" as const, etiqueta: "Con ARS", valor: m.despues, color: C.despues, y: 36 },
  ];
  const bien = esMejora(m);
  return (
    <article className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-[15px] font-bold leading-snug text-white">{m.nombre}</h4>
          <p className="mt-1 text-xs text-white/55">
            {nombreArea(m.areaId)} · {m.menosEsMejor ? "menos es mejor" : "más es mejor"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xl font-black leading-none text-white">{mejora(m)}</div>
          <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/50">{bien ? "mejora" : "cambio"}</div>
        </div>
      </header>
      <svg viewBox={`0 0 ${W} 62`} className="mt-4 w-full" role="img" aria-label={`${m.nombre}: hoy ${valorConUnidad(m.antes, m.unidad)}, con ARS ${valorConUnidad(m.despues, m.unidad)} (estimado).`}>
        <line x1={x0} x2={x0} y1={0} y2={62} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
        {filas.map((f) => {
          const w = (f.valor / max) * ancho;
          const atenuar = foco !== null && foco !== f.clave;
          return (
            <g
              key={f.clave}
              onMouseEnter={() => setFoco(f.clave)}
              onMouseLeave={() => setFoco(null)}
              style={{ opacity: atenuar ? 0.35 : 1 }}
              className="transition-opacity"
            >
              <title>{`${f.etiqueta}: ${valorConUnidad(f.valor, m.unidad)} (estimado)`}</title>
              <rect x={0} y={f.y - 4} width={W} height={28} fill="transparent" />
              <text x={x0 - 8} y={f.y + 14} textAnchor="end" fontSize={11} className="fill-white/70">
                {f.etiqueta}
              </text>
              {w > 0 ? (
                <path d={barra(x0 + 1, f.y + 2, w, 18)} fill={f.color} />
              ) : (
                <rect x={x0 + 1} y={f.y + 2} width={2} height={18} fill={f.color} />
              )}
              <text
                x={x0 + 1 + Math.max(w, 2) + 8}
                y={f.y + 15}
                fontSize={12}
                fontWeight={f.clave === "despues" ? 700 : 400}
                className={f.clave === "despues" ? "fill-white" : "fill-white/75"}
              >
                {valorConUnidad(f.valor, m.unidad)}
              </text>
            </g>
          );
        })}
      </svg>
    </article>
  );
}

export function GraficoMetricas({ metricas }: { metricas: Metrica[] }) {
  const idTabla = useId();
  if (!metricas.length) return null;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Leyenda />
        <Estimado />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {metricas.map((m) => (
          <TarjetaMetrica key={m.nombre} m={m} />
        ))}
      </div>
      <details className="group mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/75">
        <summary className="cursor-pointer select-none font-mono text-[11px] uppercase tracking-[0.2em] text-white/60 hover:text-white" aria-controls={idTabla}>
          Ver las cifras como tabla
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table id={idTabla} className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-xs text-white/50">
              <tr>
                <th className="py-2 pr-3 font-medium">Indicador</th>
                <th className="py-2 pr-3 font-medium">Hoy</th>
                <th className="py-2 pr-3 font-medium">Con ARS</th>
                <th className="py-2 font-medium">Cambio</th>
              </tr>
            </thead>
            <tbody>
              {metricas.map((m) => (
                <tr key={m.nombre} className="border-t border-white/10">
                  <td className="py-2 pr-3 text-white">{m.nombre}</td>
                  <td className="py-2 pr-3 tabular-nums">{valorConUnidad(m.antes, m.unidad)}</td>
                  <td className="py-2 pr-3 tabular-nums">{valorConUnidad(m.despues, m.unidad)}</td>
                  <td className="py-2 tabular-nums">{mejora(m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-white/45">Todas las cifras son estimaciones ilustrativas basadas en la conversación.</p>
        </div>
      </details>
    </div>
  );
}

/* ───────────── Plan por fases: cronograma tipo Gantt ───────────── */

export function Cronograma({ diagnostico }: { diagnostico: Diagnostico }) {
  const filas = cronograma(diagnostico.fases);
  const total = totalSemanas(filas);
  const marcas = Array.from(new Set([1, ...filas.map((f) => f.inicio), total])).sort((a, b) => a - b);
  const pct = (semana: number) => ((semana - 1) / total) * 100;
  return (
    <div>
      {/* eje de semanas */}
      <div className="relative ml-0 h-6 md:ml-[34%]">
        {marcas.map((s) => (
          <span
            key={s}
            className="absolute font-mono text-[10px] text-white/45"
            style={{
              left: `${s === total ? 100 : pct(s)}%`,
              transform: s === 1 ? undefined : s === total ? "translateX(-100%)" : "translateX(-50%)",
            }}
          >
            S{s}
          </span>
        ))}
      </div>
      <ol className="space-y-5">
        {filas.map(({ fase, inicio, fin }, i) => {
          const color = colorArea(fase.areas[0] ?? "operacion-en-campo");
          return (
            <li key={fase.nombre} className="grid gap-3 md:grid-cols-[34%_1fr] md:gap-0">
              <div className="md:pr-6">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-full border text-sm font-black"
                    style={{ borderColor: color, color, boxShadow: `0 0 18px ${color}40` }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="text-[15px] font-bold leading-tight text-white">{fase.nombre}</h4>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/55">{fase.semanas}</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="relative h-9 rounded-lg bg-white/[0.04]">
                  {marcas.map((s) => (
                    <span key={s} className="absolute inset-y-0 w-px bg-white/[0.06]" style={{ left: `${pct(s)}%` }} aria-hidden="true" />
                  ))}
                  <div
                    className="absolute inset-y-1.5 flex items-center overflow-hidden rounded-md px-3"
                    style={{
                      left: `${pct(inicio)}%`,
                      width: `${Math.max(6, ((fin - inicio + 1) / total) * 100)}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                    }}
                    title={`${fase.nombre}: semanas ${inicio} a ${fin}`}
                  >
                    <span className="truncate text-[11px] font-bold text-[#020a18]">{fin - inicio + 1} semanas</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {fase.areas.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">
                      <span className="size-1.5 rounded-full" style={{ background: colorArea(a) }} aria-hidden="true" />
                      {nombreArea(a)}
                    </span>
                  ))}
                </div>
                <ul className="mt-3 grid gap-1.5 text-sm text-white/80 sm:grid-cols-2">
                  {fase.entregables.map((e) => (
                    <li key={e} className="flex gap-2">
                      <span className="mt-[7px] size-1.5 shrink-0 rotate-45" style={{ background: color }} aria-hidden="true" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
