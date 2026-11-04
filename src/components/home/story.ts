/**
 * Guion compartido entre el canvas 3D y la capa HTML del home.
 *
 * El scroll se traduce a un número continuo `chapter` (0 → CHAPTERS.length-1).
 * Cada capítulo tiene un encuadre de cámara y los eventos de la cadena
 * (intrusión → detección IA → alerta → despacho) se derivan de ese número,
 * así el 3D y el texto siempre cuentan lo mismo en el mismo momento.
 */

export const CHAPTERS = [
  "hero",
  "capa1",
  "evento",
  "capa2",
  "alerta",
  "capa3",
  "escala",
] as const;

export type ChapterId = (typeof CHAPTERS)[number];

/** Capa de seguridad activa por capítulo (0 = ninguna). */
export const CHAPTER_LAYER: Record<ChapterId, 0 | 1 | 2 | 3> = {
  hero: 0,
  capa1: 1,
  evento: 1,
  capa2: 2,
  alerta: 2,
  capa3: 3,
  escala: 3,
};

/** Paso de la cadena "cámara → IA → alerta → acción" encendido según el capítulo. */
export function chainStep(chapter: number): number {
  // -1 = cadena oculta, 0..3 = paso activo
  if (chapter < 1.6 || chapter > 5.7) return -1;
  if (chapter < 2.55) return 0;
  if (chapter < 3.55) return 1;
  if (chapter < 4.5) return 2;
  return 3;
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
/** Rampa suave entre `a` y `b` del capítulo continuo. */
export const ramp = (c: number, a: number, b: number) => smooth((c - a) / (b - a));
