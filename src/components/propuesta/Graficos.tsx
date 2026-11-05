"use client";

import type { FaseTrabajo, Indicador } from "@/data/propuesta/tipos";
import { cn } from "@/lib/utils";
import { useVisible } from "./util";

const fmt = (n: number) => n.toLocaleString("es-CO", { maximumFractionDigits: 1 });

function mejora(x: Indicador): string | null {
  if (x.hoy === x.conArs) return null;
  if (x.unidad.trim() === "%") {
    const d = Math.round(x.conArs - x.hoy);
    return `${d > 0 ? "+" : "−"}${Math.abs(d)} pts`;
  }
  if (!x.hoy) return null;
  const pct = Math.round(((x.conArs - x.hoy) / x.hoy) * 100);
  return `${pct > 0 ? "+" : "−"}${Math.abs(pct)} %`;
}

/** Barras SVG «hoy vs con ARS» que crecen al entrar en pantalla. Siempre rotuladas como estimado. */
export function GraficoIndicadores({ indicadores }: { indicadores: Indicador[] }) {
  const [ref, visible] = useVisible<HTMLUListElement>();
  return (
    <ul ref={ref} className="grid gap-4 @3xl:grid-cols-2">
      {indicadores.slice(0, 5).map((x, i) => {
        const max = Math.max(x.hoy, x.conArs, 1);
        const m = mejora(x);
        const barras = [
          { etiqueta: "Hoy", valor: x.hoy, color: "#5b6b86" },
          { etiqueta: "Con ARS", valor: x.conArs, color: "#35e0a1" },
        ];
        return (
          <li key={x.nombre} className="border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14.5px] font-bold leading-snug text-white">{x.nombre}</p>
              {m && <span className="shrink-0 border border-[#35e0a1]/40 bg-[#35e0a1]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#a8f0d2]">{m}</span>}
            </div>
            <dl className="mt-3 space-y-2.5">
              {barras.map((b, k) => (
                <div key={b.etiqueta}>
                  <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
                    <dt className={k ? "text-[#35e0a1]" : "text-white/50"}>{b.etiqueta}</dt>
                    <dd className="tabular-nums text-white/85">
                      {fmt(b.valor)} <span className="normal-case tracking-normal text-white/50">{x.unidad}</span>
                    </dd>
                  </div>
                  <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="mt-1 h-2.5 w-full" aria-hidden="true">
                    <rect x="0" y="0" width="100" height="6" fill="rgba(255,255,255,0.05)" />
                    <rect
                      x="0"
                      y="0"
                      height="6"
                      width={Math.max(1.5, (b.valor / max) * 100)}
                      fill={b.color}
                      className={cn("origin-left transition-transform duration-[1200ms] ease-out [transform-box:fill-box] motion-reduce:transition-none", visible ? "scale-x-100" : "scale-x-0")}
                      style={{ transitionDelay: `${i * 120 + k * 250}ms` }}
                    />
                  </svg>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[12px] leading-relaxed text-[#9eb0c0]">
              <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#ffd166]">Estimado</span>
              {x.nota}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/** Semanas (mín., máx.) a partir de «4 a 6 semanas (estimado)», «2 meses», etc. */
function semanas(duracion: string): [number, number] {
  const nums = (duracion.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => parseFloat(n.replace(",", ".")));
  const factor = /mes/i.test(duracion) ? 4.3 : /d[ií]a/i.test(duracion) ? 1 / 7 : 1;
  if (!nums.length) return [4, 4];
  const a = nums[0] * factor;
  const b = (nums[1] ?? nums[0]) * factor;
  return [Math.min(a, b), Math.max(a, b)];
}

const COLORES = ["#6b8aff", "#5fd8ff", "#35e0a1", "#ffd166", "#ff8fb1", "#b78bff"];

/** Gantt de la línea de trabajo: fases en secuencia; la parte tenue es el margen del rango estimado. */
export function GanttTrabajo({ fases }: { fases: FaseTrabajo[] }) {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const filas = fases.reduce<{ f: FaseTrabajo; inicio: number; min: number; max: number }[]>((acc, f) => {
    const [min, max] = semanas(f.duracion);
    const prev = acc[acc.length - 1];
    return [...acc, { f, inicio: prev ? prev.inicio + prev.max : 0, min, max }];
  }, []);
  const ultima = filas[filas.length - 1];
  const total = Math.max(ultima ? ultima.inicio + ultima.max : 0, 1);
  const marcas = Array.from({ length: Math.floor(total / 4) + 1 }, (_, k) => k * 4).filter((s) => s <= total);

  return (
    <div ref={ref} role="img" aria-label={`Cronograma estimado de ${Math.round(total)} semanas: ${fases.map((f) => `${f.nombre}, ${f.duracion}`).join("; ")}.`}>
      <div className="relative ml-0 @2xl:ml-[34%]" aria-hidden="true">
        <div className="relative h-5">
          {marcas.map((s) => (
            <span key={s} className="absolute -translate-x-1/2 font-mono text-[9.5px] text-white/40" style={{ left: `${(s / total) * 100}%` }}>
              {s === 0 ? "Sem 0" : s}
            </span>
          ))}
        </div>
      </div>
      <ol className="space-y-3" aria-hidden="true">
        {filas.map(({ f, inicio: ini, min, max }, i) => {
          const color = COLORES[i % COLORES.length];
          return (
            <li key={f.nombre} className="grid gap-1.5 @2xl:grid-cols-[34%_1fr] @2xl:items-center">
              <p className="truncate pr-3 text-[13px] text-white">
                <span className="text-white/90">{f.nombre}</span>
              </p>
              <div className="relative h-7 bg-white/[0.04]">
                {marcas.map((s) => (
                  <span key={s} className="absolute inset-y-0 w-px bg-white/[0.06]" style={{ left: `${(s / total) * 100}%` }} />
                ))}
                <div
                  className={cn("absolute inset-y-1 origin-left transition-transform duration-[1000ms] ease-out motion-reduce:transition-none", visible ? "scale-x-100" : "scale-x-0")}
                  style={{ left: `${(ini / total) * 100}%`, width: `${(max / total) * 100}%`, transitionDelay: `${300 + i * 450}ms` }}
                >
                  <div className="absolute inset-0 border" style={{ borderColor: color, background: `${color}22` }} />
                  <div className="absolute inset-y-0 left-0" style={{ width: `${(min / max) * 100}%`, background: color }} />
                  <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[10px] font-bold text-[#020a18]">{min === max ? `${fmt(min)} sem` : `${fmt(min)}–${fmt(max)} sem`}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
        ≈ {fmt(Math.round(total))} semanas en total · estimado · tramo tenue = margen del rango
      </p>
    </div>
  );
}
