"use client";

import { ArrowUpRight, ScanEye } from "lucide-react";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import type { Accion, Tarjeta } from "@/lib/asistente/tipos";
import { FormularioContacto } from "./FormularioContacto";

/** Tarjetas enriquecidas bajo un mensaje: analíticas, enlaces y contacto. */
export function Tarjetas({ tarjetas, ejecutar }: { tarjetas: Tarjeta[]; ejecutar: (a: Accion) => void }) {
  const { t } = useTextosAsistente();
  if (!tarjetas.length) return null;
  // Sin duplicados (una misma tarjeta puede venir de dos herramientas).
  const vistas = new Set<string>();
  const unicas = tarjetas.filter((x) => {
    const k = x.tipo === "analitica" ? `a:${x.id}` : x.tipo === "enlace" ? `e:${x.ruta}#${x.ancla ?? ""}` : "c";
    if (vistas.has(k)) return false;
    vistas.add(k);
    return true;
  });

  return (
    <ul className="mt-2 space-y-2" aria-label={t("asistente.sugerencias")}>
      {unicas.map((x, i) => (
        <li key={i}>
          {x.tipo === "contacto" ? (
            <FormularioContacto motivo={x.motivo} />
          ) : x.tipo === "analitica" ? (
            <button
              type="button"
              onClick={() => ejecutar({ tipo: "mostrar_analitica", id: x.id })}
              className="group flex w-full items-start gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-[#142664]/60 to-[#020a18]/60 p-3 text-left transition-colors hover:border-[#2348d4]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
            >
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#2348d4]/25 text-[#9fb6ff]">
                <ScanEye className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-[#9eb0c0]">
                  {t("asistente.tarjeta.analitica")} · {x.familia}
                </span>
                <span className="mt-0.5 block text-sm font-bold text-foreground">{x.nombre}</span>
                <span className="mt-0.5 line-clamp-2 block text-xs text-foreground/60">{x.corta}</span>
              </span>
              <span className="self-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#9fb6ff] group-hover:text-white">
                {t("asistente.tarjeta.ver")} →
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => ejecutar({ tipo: "ir_a", ruta: x.ruta, ancla: x.ancla })}
              className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-[#2348d4]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-[#9eb0c0]">
                  {x.ruta}
                  {x.ancla ? `#${x.ancla}` : ""}
                </span>
                <span className="mt-0.5 block text-sm font-bold text-foreground">{x.titulo}</span>
                {x.descripcion && <span className="mt-0.5 line-clamp-2 block text-xs text-foreground/60">{x.descripcion}</span>}
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-[#9fb6ff] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
