/**
 * STUB provisional: la versión real de MapaDespliegue la construye otra sesión en su
 * propia rama y reemplaza este archivo al fusionar. Solo respeta el contrato.
 */

import { cn } from "@/lib/utils";

export function MapaDespliegue({ modo, className }: { modo: "ars" | "cliente" | "sede" | "hibrida"; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex aspect-[16/10] w-full items-center justify-center border border-dashed border-white/20 bg-[#020a18] font-mono text-[11px] uppercase tracking-[0.3em] text-white/50",
        className
      )}
    >
      mapa · {modo}
    </div>
  );
}
