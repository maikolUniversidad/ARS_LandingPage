/**
 * Guion compartido entre el canvas 3D y la capa HTML del home.
 *
 * El scroll se traduce a un número continuo `chapter` (0 → CHAPTERS.length-1).
 * Apertura: las cinco capas de una sede flotan apiladas y caen sobre ella
 * hasta volverse una sola plataforma. Después cada capítulo enciende una capa
 * y un mismo evento avanza por todas ellas dejando una traza de luz que llega
 * a la central y al tablero de gerencia.
 */

export const CHAPTERS = [
  "hero",
  "fisica",
  "vision",
  "iot",
  "robotica",
  "central",
  "traza",
  "escala",
] as const;

export type ChapterId = (typeof CHAPTERS)[number];

/** Las cinco capas, en el orden en que se encienden. */
export const LAYER_COUNT = 5;

/** Capa activa por capítulo (-1 = ninguna, 5 = todas a la vez). */
export const CHAPTER_LAYER: Record<ChapterId, number> = {
  hero: -1,
  fisica: 0,
  vision: 1,
  iot: 2,
  robotica: 3,
  central: 4,
  traza: 5,
  escala: 5,
};

/** Color de cada capa (mismo orden que las capas). */
export const LAYER_TINT = ["#5fd8ff", "#ffb547", "#35e0a1", "#a88bff", "#d5e0ff"] as const;
export const LAYER_HEX = [0x5fd8ff, 0xffb547, 0x35e0a1, 0xa88bff, 0xd5e0ff] as const;

/**
 * Paso de la traza encendido según el capítulo: -1 oculta, 0..5 = nodo
 * (ronda → cámara IA → sensor → robot → central → gerencia/cierre).
 */
export function traceStep(chapter: number): number {
  if (chapter < 0.62 || chapter > 7.35) return -1;
  if (chapter < 1.5) return 0;
  if (chapter < 2.5) return 1;
  if (chapter < 3.5) return 2;
  if (chapter < 4.5) return 3;
  if (chapter < 5.45) return 4;
  return 5;
}

export const TRACE_STEPS = 6;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
/** Rampa suave entre `a` y `b` del capítulo continuo. */
export const ramp = (c: number, a: number, b: number) => smooth((c - a) / (b - a));
