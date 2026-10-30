import type { EstadoSim } from "@/data/analiticas";
import { ESTADO_LABEL } from "@/data/analiticas";
import { cn } from "@/lib/utils";

/** Colores de los cuatro estados de una analítica (los mismos de la simulación). */
export const ESTADO_COLOR: Record<EstadoSim, string> = {
  vigila: "#5BA4FF",
  detecta: "#F5A524",
  alerta: "#E5484D",
  ok: "#30A46C",
};

type Props = {
  estado: EstadoSim;
  /** Apagado = la simulación no está en este estado ahora. */
  activo?: boolean;
  className?: string;
  label?: string;
};

export function EstadoPill({ estado, activo = true, className, label }: Props) {
  const color = ESTADO_COLOR[estado];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
        activo ? "border-foreground/30 text-foreground" : "border-border/40 text-foreground/40",
        className,
      )}
      style={activo ? { borderColor: color } : undefined}
    >
      <span
        className={cn("size-2 rounded-full", activo && estado === "alerta" && "animate-pulse")}
        style={{ background: color, opacity: activo ? 1 : 0.35 }}
      />
      {label ?? ESTADO_LABEL[estado]}
    </span>
  );
}
