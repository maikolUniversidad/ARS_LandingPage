"use client";

import { useEffect, useState } from "react";
import type { Capitulo, Diagnostico, Metrica } from "@/data/diagnostico/tipos";
import { areaPorId } from "@/data/servicios";
import { cn } from "@/lib/utils";
import { formatear, madurezCapitulo, mejora, metricasCapitulo } from "./calculos";

/** Anima un número de `desde` a `hasta` (ease-out) tras un `retraso`. */
function useContador(desde: number, hasta: number, activo: boolean, reducedMotion: boolean, retraso = 500, dur = 1600) {
  const [v, setV] = useState(desde);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now() + (reducedMotion ? 0 : retraso);
    const fin = activo ? hasta : desde;
    const paso = (ahora: number) => {
      const k = reducedMotion ? 1 : Math.min(1, Math.max(0, (ahora - t0) / dur));
      const e = 1 - Math.pow(1 - k, 3);
      setV(desde + (fin - desde) * e);
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [desde, hasta, activo, reducedMotion, retraso, dur]);
  return v;
}

export function PanelDiferencia({
  diagnostico,
  capitulo,
  reducedMotion,
}: {
  diagnostico: Diagnostico;
  capitulo: Capitulo;
  reducedMotion: boolean;
}) {
  const recomendadas = diagnostico.recomendaciones.map((r) => r.areaId);
  const meta = madurezCapitulo(diagnostico.madurez, recomendadas, capitulo);
  const madurez = useContador(diagnostico.madurez.hoy, meta, capitulo.momento !== "antes", reducedMotion, 300, 1800);
  const metricas = metricasCapitulo(diagnostico.metricas, capitulo).slice(0, 5);
  const foco = capitulo.foco ? areaPorId(capitulo.foco) : undefined;
  const rec = capitulo.foco ? diagnostico.recomendaciones.find((r) => r.areaId === capitulo.foco) : undefined;
  const antes = capitulo.momento === "antes";

  return (
    <aside
      aria-label="La diferencia"
      className="rounded-2xl border border-white/10 bg-[#071631]/80 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0]">La diferencia</h3>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#9eb0c0]">estimado</span>
      </div>

      {foco && (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-white">
          <span className="size-2 rounded-full" style={{ backgroundColor: foco.color, boxShadow: `0 0 8px ${foco.color}` }} />
          {foco.nombre}
        </p>
      )}

      {/* Madurez */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between text-xs text-[#9eb0c0]">
          <span>Madurez digital</span>
          <span className="tabular-nums">
            <span className="text-lg font-semibold text-white">{Math.round(madurez)}</span>/100
          </span>
        </div>
        <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="absolute inset-y-0 left-0 rounded-full bg-[#ff3b5c]/70" style={{ width: `${diagnostico.madurez.hoy}%` }} />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#2348d4] to-[#35e0a1]"
            style={{ width: `${madurez}%`, opacity: antes ? 0 : 1 }}
          />
          <div className="absolute inset-y-0 w-px bg-white/60" style={{ left: `${diagnostico.madurez.conArs}%` }} title="Meta con ARS" />
        </div>
        <p className="mt-1.5 text-[11px] text-[#9eb0c0]/80">
          Hoy {diagnostico.madurez.hoy} · con ARS {diagnostico.madurez.conArs}
        </p>
      </div>

      {/* Métricas */}
      {metricas.length > 0 ? (
        <ul className="mt-4 space-y-3 border-t border-white/10 pt-4">
          {metricas.map((m) => (
            <FilaMetrica key={m.nombre} m={m} antes={antes} reducedMotion={reducedMotion} />
          ))}
        </ul>
      ) : rec ? (
        <p className="mt-4 border-t border-white/10 pt-4 text-sm text-[#cfd8e3]">{rec.cambio}</p>
      ) : null}
    </aside>
  );
}

function FilaMetrica({ m, antes, reducedMotion }: { m: Metrica; antes: boolean; reducedMotion: boolean }) {
  const v = useContador(m.antes, m.despues, !antes, reducedMotion);
  const color = areaPorId(m.areaId)?.color ?? "#6b8aff";
  const pct = mejora(m);
  const max = Math.max(m.antes, m.despues, 1);
  return (
    <li>
      <p className="text-xs text-[#cfd8e3]">{m.nombre}</p>
      <div className="mt-1 flex items-baseline gap-2 tabular-nums">
        <span className={cn("text-xl font-semibold", antes ? "text-[#ff8da0]" : "text-white")}>{formatear(v, m.unidad)}</span>
        {antes ? (
          <span className="text-[11px] text-[#9eb0c0]">hoy</span>
        ) : (
          <>
            <span className="text-[11px] text-[#9eb0c0] line-through decoration-[#ff3b5c]/60">{formatear(m.antes, m.unidad)}</span>
            {pct !== null && pct > 0 && <span className="ml-auto text-[11px] font-medium text-[#7cf0c4]">{m.menosEsMejor ? "−" : "+"}{Math.abs(pct)} %</span>}
          </>
        )}
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${(v / max) * 100}%`, backgroundColor: antes ? "#ff3b5c" : color }} />
      </div>
    </li>
  );
}
