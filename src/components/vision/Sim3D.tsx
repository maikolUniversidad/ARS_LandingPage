"use client";

import { useEffect, useRef, useState } from "react";
import { simUrl, type EstadoSim } from "@/data/analiticas";
import { cn } from "@/lib/utils";

type Props = {
  /** id de la analítica (coincide con la escena de public/analiticas-3d). */
  id: string;
  /** Mostrar el recuadro "lo que ve la cámara". */
  pip?: boolean;
  className?: string;
  title?: string;
  /** Avisa cada cambio de estado de la simulación (vigila → detecta → alerta → ok). */
  onFase?: (fase: EstadoSim) => void;
  /** Cargar recién cuando entra en pantalla (por defecto sí). */
  lazy?: boolean;
};

/**
 * Simulación 3D de una analítica, embebida desde public/analiticas-3d/sim.html.
 *
 * El motor (three.js) vive en la página embebida; acá solo se escucha su
 * postMessage para saber si cargó, si falló y en qué estado va. El contenedor
 * debe tener tamaño propio (p. ej. `aspect-[4/3]`). Para cambiar de analítica,
 * remontar con `key={id}` (así se reinicia el estado de error).
 */
export function Sim3D({ id, pip = true, className, title, onFase, lazy = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!lazy);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lazy || visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy, visible]);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data as { tipo?: string; id?: string; fase?: EstadoSim; error?: string } | null;
      if (!d || d.tipo !== "vigias-sim" || d.id !== id) return;
      if (d.error) setError(d.error);
      if (d.fase && onFase) onFase(d.fase);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [id, onFase]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-[#DDE3EE]", className)}>
      {visible && !error && (
        <iframe
          key={`${id}-${pip ? 1 : 0}`}
          src={simUrl(id, { pip })}
          title={title ?? `Simulación 3D: ${id}`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          allow="fullscreen"
        />
      )}
      {!visible && (
        <div className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#5F6883]">
          Simulación 3D
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-[#0A1330]">
          La vista 3D no cargó en este navegador. Puede abrir la presentación completa desde el final de la página.
        </div>
      )}
    </div>
  );
}
