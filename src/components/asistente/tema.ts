/**
 * Tokens visuales del chat de Ars. Cambia aquí colores, tamaños y la
 * variante del orbe sin tocar los componentes.
 */
import type { FaseVoz } from "./OrbeVoz";

/** Estado visible de Ars (cabecera, botón flotante, indicador). */
export type EstadoArs = "reposo" | "escuchando" | "pensando" | "hablando";

export type VarianteOrbe = {
  /** Núcleo (centro brillante → borde). */
  nucleo: [string, string, string];
  /** Anillo orbital (gradiente cónico). */
  anillo: [string, string];
  /** Halo exterior. */
  halo: string;
};

/** Variantes del orbe. `marca` es la de por defecto; `capas` usa los tintes de las capas. */
export const VARIANTES_ORBE = {
  marca: { nucleo: ["#e8eefc", "#6b8aff", "#142664"], anillo: ["#6b8aff", "#2348d4"], halo: "rgba(35,72,212,0.55)" },
  capas: { nucleo: ["#f1fbff", "#5fd8ff", "#142664"], anillo: ["#5fd8ff", "#a88bff"], halo: "rgba(95,216,255,0.4)" },
  calido: { nucleo: ["#fff6e6", "#ffb547", "#142664"], anillo: ["#ffb547", "#6b8aff"], halo: "rgba(255,181,71,0.35)" },
} satisfies Record<string, VarianteOrbe>;

export type NombreVariante = keyof typeof VARIANTES_ORBE;

/** Variante usada en todo el chat (cámbiala aquí). */
export const VARIANTE_ORBE: NombreVariante = "marca";

/** Acento por estado (anillo de estado y etiqueta de la cabecera). */
export const COLOR_ESTADO: Record<EstadoArs, string> = {
  reposo: "#6b8aff",
  escuchando: "#5fd8ff",
  pensando: "#a88bff",
  hablando: "#35e0a1",
};

/** Colores de series de los gráficos (tintes de las capas de ARS). */
export const SERIES = ["#6b8aff", "#5fd8ff", "#35e0a1", "#ffb547", "#a88bff", "#2348d4", "#b9c8ff", "#ff8a7a"];

/** Del estado de voz + chat al estado visible de Ars. */
export function estadoArs(fase: FaseVoz, pensando: boolean): EstadoArs {
  if (fase === "hablando") return "hablando";
  if (fase === "escuchando" || fase === "conectando") return "escuchando";
  if (pensando || fase === "pensando" || fase === "transcribiendo") return "pensando";
  return "reposo";
}
