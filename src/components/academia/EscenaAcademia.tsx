"use client";

/**
 * «Objeto 3D» de la Academia ARS: escena Three.js procedural que cambia de
 * encuadre y contenido según `foco` (portal, dotación, polígono, garita,
 * portería, plataforma).
 *
 * Pensado para cargarse con `dynamic(() => import(...), { ssr: false })` en
 * varias secciones a la vez: un renderer por instancia, el bucle se pausa fuera
 * de pantalla (IntersectionObserver) y con la pestaña oculta, y todo se libera
 * al desmontar. Sin WebGL o si el contexto muere, muestra un SVG por foco.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CargaTecnologica } from "@/components/carga/CargaTecnologica";
import { isLowPower, isModestDevice, noopSubscribe, supportsWebGL } from "@/lib/three/webgl";
import { cn } from "@/lib/utils";
import { RespaldoAcademia } from "./RespaldoAcademia";
import { DESCRIPCION_FOCO, type FocoAcademia } from "./escena/focos";
import type { MotorAcademia } from "./escena/motor";

export type { FocoAcademia } from "./escena/focos";

export type EscenaAcademiaProps = {
  foco: FocoAcademia;
  className?: string;
};

export function EscenaAcademia({ foco, className }: EscenaAcademiaProps) {
  const contRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capaRef = useRef<HTMLDivElement>(null);
  const motorRef = useRef<MotorAcademia | null>(null);
  const focoRef = useRef(foco);
  const [fallo, setFallo] = useState(false);
  const [listo, setListo] = useState(false);
  const webgl = useSyncExternalStore(noopSubscribe, supportsWebGL, () => true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cont = contRef.current;
    if (!canvas || !cont || !webgl) return;
    let vivo = true;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("./escena/motor")
      .then(({ crearMotor }) => {
        if (!vivo) return;
        let motor: MotorAcademia | null = null;
        try {
          motor = crearMotor({
            canvas,
            capaEtiquetas: capaRef.current,
            lowPower: isLowPower(),
            modesto: isModestDevice(),
            reducedMotion,
            onFallo: () => vivo && setFallo(true),
          });
        } catch {
          motor = null;
        }
        if (!motor) {
          setFallo(true);
          return;
        }
        motorRef.current = motor;
        const r = cont.getBoundingClientRect();
        motor.resize(r.width, r.height);
        motor.setFoco(focoRef.current);
        requestAnimationFrame(() => requestAnimationFrame(() => vivo && setListo(true)));
        ro = new ResizeObserver(([e]) => motor?.resize(e.contentRect.width, e.contentRect.height));
        ro.observe(cont);
        io = new IntersectionObserver(([e]) => motor?.setActiva(e.isIntersecting), { rootMargin: "80px" });
        io.observe(cont);
      })
      .catch(() => vivo && setFallo(true));

    return () => {
      vivo = false;
      setListo(false);
      ro?.disconnect();
      io?.disconnect();
      motorRef.current?.dispose();
      motorRef.current = null;
    };
  }, [webgl]);

  useEffect(() => {
    focoRef.current = foco;
    motorRef.current?.setFoco(foco);
  }, [foco]);

  if (!webgl || fallo) {
    return (
      <div className={cn("relative overflow-hidden bg-[#020a18]", className)}>
        <RespaldoAcademia foco={foco} className="absolute inset-0" />
      </div>
    );
  }

  return (
    <div ref={contRef} role="img" aria-label={DESCRIPCION_FOCO[foco]} className={cn("relative overflow-hidden bg-[#020a18]", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div ref={capaRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" />
      <CargaTecnologica variante="caja" etiqueta="Cargando la Academia · escena 3D" listo={listo} />
    </div>
  );
}

export default EscenaAcademia;
