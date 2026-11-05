"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { RECORRIDOS, type Recorrido } from "./contenido";

const MQ = "(prefers-reduced-motion: reduce)";

function suscribir(cb: () => void) {
  const mq = window.matchMedia(MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** true si el usuario pidió reducir el movimiento. En servidor, false. */
export function useMenosMovimiento() {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(MQ).matches,
    () => false
  );
}

const PASO_MS = 1900;

export type EstadoRecorrido = {
  recorrido: Recorrido | null;
  paso: number;
  reproduciendo: boolean;
  iniciar: (id: string) => void;
  alternar: () => void;
  anterior: () => void;
  siguiente: () => void;
  cerrar: () => void;
};

/** Estado del recorrido «Sigue un dato»: avanza un paso cada PASO_MS mientras se reproduce. */
export function useRecorrido(): EstadoRecorrido {
  const menosMovimiento = useMenosMovimiento();
  const [s, setS] = useState<{ id: string | null; paso: number; play: boolean }>({ id: null, paso: 0, play: false });
  const recorrido = s.id ? (RECORRIDOS.find((r) => r.id === s.id) ?? null) : null;
  const total = recorrido?.pasos.length ?? 0;

  useEffect(() => {
    if (!recorrido || !s.play || s.paso >= total - 1) return;
    const tm = window.setTimeout(() => {
      setS((p) => {
        const n = Math.min(p.paso + 1, total - 1);
        return { ...p, paso: n, play: n < total - 1 };
      });
    }, PASO_MS);
    return () => window.clearTimeout(tm);
  }, [recorrido, s.play, s.paso, total]);

  const iniciar = useCallback(
    (id: string) => {
      const r = RECORRIDOS.find((x) => x.id === id);
      if (!r) return;
      // Con movimiento reducido se muestra el camino completo, sin animación.
      setS(menosMovimiento ? { id, paso: r.pasos.length - 1, play: false } : { id, paso: 0, play: true });
    },
    [menosMovimiento]
  );

  const alternar = useCallback(() => {
    setS((p) => {
      if (!p.id) return p;
      const r = RECORRIDOS.find((x) => x.id === p.id);
      const ultimo = (r?.pasos.length ?? 1) - 1;
      // Al final, «reproducir» vuelve a empezar.
      if (!p.play && p.paso >= ultimo) return { ...p, paso: 0, play: true };
      return { ...p, play: !p.play };
    });
  }, []);

  const anterior = useCallback(() => setS((p) => ({ ...p, paso: Math.max(0, p.paso - 1), play: false })), []);
  const siguiente = useCallback(
    () => setS((p) => ({ ...p, paso: Math.min(Math.max(total - 1, 0), p.paso + 1), play: false })),
    [total]
  );
  const cerrar = useCallback(() => setS({ id: null, paso: 0, play: false }), []);

  return { recorrido, paso: s.paso, reproduciendo: s.play, iniciar, alternar, anterior, siguiente, cerrar };
}
