"use client";

import type { CSSProperties } from "react";
import { VARIANTES_ORBE, VARIANTE_ORBE, COLOR_ESTADO, type EstadoArs, type NombreVariante } from "./tema";

type Props = {
  estado: EstadoArs;
  /** Diámetro en px. */
  tamano?: number;
  variante?: NombreVariante;
  className?: string;
};

/**
 * Orbe de Ars en CSS puro (sin canvas): núcleo que respira, anillo orbital que
 * gira y ondas al hablar o escuchar. El estado se expone en `data-estado` y
 * las animaciones viven en `EstilosChat` (todas bajo prefers-reduced-motion).
 * Al pasar el cursor por un ancestro `.group` el orbe se enciende.
 */
export function OrbeArs({ estado, tamano = 56, variante = VARIANTE_ORBE, className = "" }: Props) {
  const v = VARIANTES_ORBE[variante];
  const estilo = {
    width: tamano,
    height: tamano,
    "--orbe-c0": v.nucleo[0],
    "--orbe-c1": v.nucleo[1],
    "--orbe-c2": v.nucleo[2],
    "--orbe-a0": v.anillo[0],
    "--orbe-a1": v.anillo[1],
    "--orbe-halo": v.halo,
    "--orbe-estado": COLOR_ESTADO[estado],
  } as CSSProperties;
  return (
    <span aria-hidden="true" data-estado={estado} className={`ars-orbe relative inline-block shrink-0 ${className}`} style={estilo}>
      <span className="ars-orbe-halo" />
      <span className="ars-orbe-onda" />
      <span className="ars-orbe-onda ars-orbe-onda-2" />
      <span className="ars-orbe-anillo" />
      <span className="ars-orbe-nucleo">
        <span className="ars-orbe-brillo" />
      </span>
    </span>
  );
}
