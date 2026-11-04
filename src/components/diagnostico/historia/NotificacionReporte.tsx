"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Minus } from "lucide-react";
import type { ItemReporte, ReporteDiario } from "@/data/diagnostico/tipos";
import { cn } from "@/lib/utils";

/** Teléfono con la notificación del resumen de las 6 a. m. que le llegaría al gerente. */
export function NotificacionReporte({
  reporte,
  onVer,
  reducedMotion,
}: {
  reporte: ReporteDiario;
  onVer: () => void;
  reducedMotion: boolean;
}) {
  const [visible, setVisible] = useState(reducedMotion);
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setTimeout(() => setVisible(true), 1400);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <div className="mx-auto w-full max-w-[330px] rounded-[2.2rem] border border-white/15 bg-gradient-to-b from-[#0b1d45] to-[#050f26] p-2.5 shadow-[0_30px_80px_-20px_rgba(35,72,212,0.6)]">
        <div className="rounded-[1.8rem] bg-[radial-gradient(ellipse_at_top,#1d3885_0%,#071631_60%)] px-3 pb-3 pt-2">
          <div className="mx-auto h-5 w-24 rounded-full bg-black/70" />
          <p className="mt-2 text-center text-3xl font-light tabular-nums text-white">{reporte.hora.replace(/\s*a\.\s*m\./, "")}</p>
          <p className="text-center text-[10px] uppercase tracking-widest text-[#9eb0c0]">{reporte.hora}</p>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md" role="status">
            <div className="flex items-center gap-2 text-[11px] text-[#cfd8e3]">
              <span className="grid size-5 place-items-center rounded-md bg-[#2348d4]">
                <Bell className="size-3 text-white" aria-hidden="true" />
              </span>
              <span className="font-semibold">ARS</span>
              <span className="ml-auto text-[#9eb0c0]">ahora</span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-snug text-white">{reporte.titulo}</p>
            <ul className="mt-2 space-y-1">
              {reporte.items.slice(0, 5).map((it) => (
                <li key={it.etiqueta} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-[#cfd8e3]">{it.etiqueta}</span>
                  <span className="flex shrink-0 items-center gap-1 font-medium tabular-nums text-white">
                    {it.valor}
                    <Tendencia it={it} />
                  </span>
                </li>
              ))}
            </ul>
            {reporte.destacados.length > 0 && (
              <ul className="mt-2 space-y-1 border-t border-white/10 pt-2">
                {reporte.destacados.slice(0, 2).map((d) => (
                  <li key={d} className="text-[11px] leading-snug text-[#9eb0c0]">
                    • {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onVer}
        className="mx-auto mt-3 flex items-center gap-2 rounded-full bg-[#2348d4] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(35,72,212,0.55)] transition hover:bg-[#2c56f0] lg:hidden"
      >
        Ver mi reporte <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function Tendencia({ it }: { it: ItemReporte }) {
  if (!it.tendencia) return null;
  const color = it.bueno === undefined ? "text-[#9eb0c0]" : it.bueno ? "text-[#35e0a1]" : "text-[#ffb347]";
  const Icono = it.tendencia === "sube" ? ArrowUpRight : it.tendencia === "baja" ? ArrowDownRight : Minus;
  return <Icono className={cn("size-3.5", color)} aria-label={it.tendencia} />;
}
