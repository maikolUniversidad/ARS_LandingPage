/**
 * Guion compartido entre el canvas 3D y la capa HTML del home.
 *
 * El scroll se traduce a un número continuo `chapter` (0 → CHAPTERS.length-1).
 * Apertura: las cinco capas de una sede flotan apiladas y caen sobre ella
 * hasta volverse una sola plataforma. Después cada capítulo enciende una capa
 * y un mismo evento avanza por todas ellas dejando una traza de luz que llega
 * a la central y al tablero de gerencia. En `erp` la cámara baja al cimiento:
 * el ERP de gestión de ARS, que recibe lo que pasa en la operación y lo
 * convierte en nómina, informe al cliente, prefactura y contabilidad.
 */

export const CHAPTERS = [
  "hero",
  "fisica",
  "vision",
  "iot",
  "robotica",
  "central",
  "erp",
  "traza",
  "escala",
] as const;

export type ChapterId = (typeof CHAPTERS)[number];

/** Las cinco capas operativas, en el orden en que se encienden. */
export const LAYER_COUNT = 5;

/** Índice "capa" del ERP de gestión (la base, debajo de las cinco capas). */
export const ERP_LAYER = 6;

/** Capa activa por capítulo (-1 = ninguna, 5 = todas a la vez, 6 = la base ERP). */
export const CHAPTER_LAYER: Record<ChapterId, number> = {
  hero: -1,
  fisica: 0,
  vision: 1,
  iot: 2,
  robotica: 3,
  central: 4,
  erp: ERP_LAYER,
  traza: 5,
  escala: 5,
};

/** Color de cada capa (mismo orden que las capas). */
export const LAYER_TINT = ["#5fd8ff", "#ffb547", "#35e0a1", "#a88bff", "#d5e0ff"] as const;
export const LAYER_HEX = [0x5fd8ff, 0xffb547, 0x35e0a1, 0xa88bff, 0xd5e0ff] as const;

/** Color del ERP de gestión (la base). */
export const ERP_TINT = "#6b8aff";
export const ERP_HEX = 0x6b8aff;

/** Módulos del ERP en el cimiento 3D (mismo orden que `home.erp.modules`). */
export const ERP_MODULE_COUNT = 7;

/**
 * Tiempo "heredado" de la coreografía operativa (la que existía antes del
 * capítulo `erp`): en `erp` el evento termina de cerrarse (5 → 5.9) y entre
 * `erp` y `traza` casi no avanza, así toda la animación de las capas sigue
 * igual y el capítulo nuevo solo mueve la cámara y enciende el cimiento.
 */
export function storyTime(chapter: number): number {
  if (chapter <= 5) return chapter;
  if (chapter <= 6) return 5 + (chapter - 5) * 0.9;
  if (chapter <= 7) return 5.9 + (chapter - 6) * 0.1;
  return chapter - 1;
}

/** Cuánto se ve el capítulo `erp` (0 fuera, 1 en el centro). */
export function erpFocus(chapter: number): number {
  return ramp(chapter, 5.4, 5.8) * (1 - ramp(chapter, 6.3, 6.7));
}

/**
 * Paso de la traza encendido según el capítulo: -1 oculta, 0..5 = nodo
 * (ronda → cámara IA → sensor → robot → central → gerencia/cierre).
 * Se oculta mientras se mira el cimiento ERP.
 */
export function traceStep(chapter: number): number {
  if (chapter > 5.55 && chapter < 6.5) return -1;
  const c = storyTime(chapter);
  if (c < 0.62 || c > 7.35) return -1;
  if (c < 1.5) return 0;
  if (c < 2.5) return 1;
  if (c < 3.5) return 2;
  if (c < 4.5) return 3;
  if (c < 5.45) return 4;
  return 5;
}

export const TRACE_STEPS = 6;

/** Conversiones de la operación a la gestión que se encienden en `erp`. */
export const ERP_STEPS = 4;

/** Avance continuo (0..1) de las conversiones del capítulo `erp`. */
export function erpProgress(chapter: number): number {
  return ramp(chapter, 5.5, 6.0);
}

/** Conversión encendida en el capítulo `erp`: -1 ninguna, 0..3. */
export function erpStep(chapter: number): number {
  if (chapter < 5.45 || chapter > 6.6) return -1;
  return Math.min(ERP_STEPS - 1, Math.floor(erpProgress(chapter) * ERP_STEPS * 0.999));
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
/** Rampa suave entre `a` y `b` del capítulo continuo. */
export const ramp = (c: number, a: number, b: number) => smooth((c - a) / (b - a));
