"use client";

import { cn } from "@/lib/utils";
import { ETIQUETAS_FOCO, type FocoAcademia } from "./focos";

/**
 * Ranura de la escena 3D de la Academia.
 *
 * Provisional: dibuja un marco con degradado y la etiqueta del foco. El orquestador
 * lo reemplazará por `dynamic(() => import("./EscenaAcademia"), { ssr: false })`,
 * cuyo componente por defecto recibe `{ foco: FocoAcademia; className?: string }`.
 */
export function RanuraEscena({ foco, className }: { foco: FocoAcademia; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Escena 3D: ${ETIQUETAS_FOCO[foco]}`}
      data-foco={foco}
      className={cn(
        "relative isolate flex aspect-[16/10] w-full items-end overflow-hidden border border-[#b78bff]/25 bg-[#050d22]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 45%, rgba(183,139,255,0.28), transparent 70%), radial-gradient(40% 50% at 80% 80%, rgba(107,138,255,0.22), transparent 70%), linear-gradient(180deg, #071233, #020a18)",
        }}
      />
      <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10 opacity-20" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[42%] size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b78bff]/40 shadow-[0_0_60px_rgba(183,139,255,0.35)] motion-safe:animate-pulse md:size-40"
      />
      <div className="flex w-full items-center justify-between gap-3 border-t border-white/10 bg-[#020a18]/60 px-4 py-3 backdrop-blur">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#d9c6ff]">◇ {ETIQUETAS_FOCO[foco]}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Escena 3D</span>
      </div>
    </div>
  );
}
