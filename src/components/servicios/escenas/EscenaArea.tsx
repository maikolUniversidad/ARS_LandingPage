"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { EscenaId } from "@/data/servicios/tipos";
import { isLowPower, noopSubscribe, supportsWebGL } from "@/lib/three/webgl";
import { CargaTecnologica } from "@/components/carga/CargaTecnologica";
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
  infraestructura: () => import("./infraestructura"),
};

export type EscenaAreaProps = {
  escena: EscenaId;
  acento: string;
  /** Clave de foco (FOCOS_ESCENA[escena]) o null para la vista general. */
  foco: string | null;
  onSeleccion?: (clave: string) => void;
  className?: string;
  /** Se muestra si no hay WebGL o la escena falla. */
  respaldo?: React.ReactNode;
  /** Muestra el cargador de marca mientras baja la escena (false si ya hay otra capa debajo). */
  conCarga?: boolean;
};

export function EscenaArea({ escena, acento, foco, onSeleccion, className, respaldo, conCarga = true }: EscenaAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const instRef = useRef<InstanciaEscena | null>(null);
  const focoRef = useRef(foco);
  const selRef = useRef(onSeleccion);
  const [fallo, setFallo] = useState(false);
  const [listo, setListo] = useState(false);
  const webgl = useSyncExternalStore(noopSubscribe, supportsWebGL, () => true);

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
    const lowPower = isLowPower();
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
          // El contexto WebGL se perdió y no volvió: respaldo estático.
          onFallo: () => vivo && setFallo(true),
        });
        instRef.current = inst;
        const r = cont.getBoundingClientRect();
        inst.resize(r.width, r.height);
        inst.setFoco(focoRef.current);
        // Dos cuadros: el primero lo pinta la escena, el segundo ya está en pantalla.
        requestAnimationFrame(() => requestAnimationFrame(() => vivo && setListo(true)));
        ro = new ResizeObserver(([e]) => inst.resize(e.contentRect.width, e.contentRect.height));
        ro.observe(cont);
        io = new IntersectionObserver(([e]) => inst.setActiva(e.isIntersecting), { rootMargin: "120px" });
        io.observe(cont);
      })
      .catch(() => vivo && setFallo(true));

    return () => {
      vivo = false;
      setListo(false);
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
      {conCarga && <CargaTecnologica variante="caja" etiqueta="Cargando escena 3D · conectando el área" listo={listo} />}
    </div>
  );
}
