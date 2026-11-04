"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { EscenaId } from "@/data/servicios/tipos";
import { cn } from "@/lib/utils";
import type { FabricaEscena, InstanciaEscena } from "./contrato";

/** Carga perezosa: cada escena es su propio chunk. */
const CARGADORES: Record<EscenaId, () => Promise<{ default: FabricaEscena }>> = {
  campo: () => import("./campo"),
  centro: () => import("./centro"),
  comunicacion: () => import("./comunicacion"),
  edificio: () => import("./edificio"),
  inmersiva: () => import("./inmersiva"),
  humana: () => import("./humana"),
  formacion: () => import("./formacion"),
  finanzas: () => import("./finanzas"),
  productividad: () => import("./productividad"),
  gobierno: () => import("./gobierno"),
};

const noop = () => () => {};
function soportaWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

export type EscenaAreaProps = {
  escena: EscenaId;
  acento: string;
  /** Clave de foco (FOCOS_ESCENA[escena]) o null para la vista general. */
  foco: string | null;
  onSeleccion?: (clave: string) => void;
  className?: string;
  /** Se muestra si no hay WebGL o la escena falla. */
  respaldo?: React.ReactNode;
};

export function EscenaArea({ escena, acento, foco, onSeleccion, className, respaldo }: EscenaAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const instRef = useRef<InstanciaEscena | null>(null);
  const focoRef = useRef(foco);
  const selRef = useRef(onSeleccion);
  const [fallo, setFallo] = useState(false);
  const webgl = useSyncExternalStore(noop, soportaWebGL, () => true);

  useEffect(() => {
    selRef.current = onSeleccion;
  }, [onSeleccion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cont = contRef.current;
    if (!canvas || !cont || !webgl) return;
    let vivo = true;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    const lowPower =
      window.matchMedia("(pointer: coarse), (max-width: 767px)").matches || (navigator.hardwareConcurrency || 8) <= 4;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    CARGADORES[escena]()
      .then(({ default: crear }) => {
        if (!vivo) return;
        const inst = crear({
          canvas,
          acento,
          lowPower,
          reducedMotion,
          onSeleccion: (c) => selRef.current?.(c),
        });
        instRef.current = inst;
        const r = cont.getBoundingClientRect();
        inst.resize(r.width, r.height);
        inst.setFoco(focoRef.current);
        ro = new ResizeObserver(([e]) => inst.resize(e.contentRect.width, e.contentRect.height));
        ro.observe(cont);
        io = new IntersectionObserver(([e]) => inst.setActiva(e.isIntersecting), { rootMargin: "120px" });
        io.observe(cont);
      })
      .catch(() => vivo && setFallo(true));

    return () => {
      vivo = false;
      ro?.disconnect();
      io?.disconnect();
      instRef.current?.dispose();
      instRef.current = null;
    };
  }, [escena, acento, webgl]);

  useEffect(() => {
    focoRef.current = foco;
    instRef.current?.setFoco(foco);
  }, [foco]);

  if (!webgl || fallo) return <div className={cn("relative", className)}>{respaldo}</div>;

  return (
    <div ref={contRef} className={cn("relative touch-pan-y", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}
