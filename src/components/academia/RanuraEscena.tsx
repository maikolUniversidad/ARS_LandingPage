"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { ETIQUETAS_FOCO, type FocoAcademia } from "./focos";

/** Marco con degradado: se ve mientras baja la escena 3D (y en el HTML del servidor). */
function MarcoEscena({ foco, className }: { foco: FocoAcademia; className?: string }) {
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
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_50%_45%,rgba(183,139,255,0.28),transparent_70%),radial-gradient(40%_50%_at_80%_80%,rgba(107,138,255,0.22),transparent_70%),linear-gradient(180deg,#071233,#020a18)]"
      />
      <div aria-hidden="true" className="grid-bg absolute inset-0 -z-10 opacity-20" />
      <div className="flex w-full items-center justify-between gap-3 border-t border-white/10 bg-[#020a18]/60 px-4 py-3 backdrop-blur">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#d9c6ff]">◇ {ETIQUETAS_FOCO[foco]}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Escena 3D</span>
      </div>
    </div>
  );
}

const EscenaAcademia = dynamic(() => import("./EscenaAcademia"), { ssr: false });

/**
 * Escena 3D de la Academia para una sección de /academia. La escena Three.js
 * (`EscenaAcademia`) se carga solo en el navegador; mientras tanto, el marco.
 */
export function RanuraEscena({ foco, className }: { foco: FocoAcademia; className?: string }) {
  return (
    <div className={cn("relative aspect-[16/10] w-full overflow-hidden border border-[#b78bff]/25", className)} data-foco={foco}>
      <MarcoEscena foco={foco} className="absolute inset-0 aspect-auto border-0" />
      <EscenaAcademia foco={foco} className="absolute inset-0" />
    </div>
  );
}
