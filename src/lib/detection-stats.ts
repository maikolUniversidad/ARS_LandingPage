/**
 * Conteo acumulado para el Vision Lab.
 *
 * El motor de inferencia (real o mock) ya asigna un `trackId` estable a cada
 * persona/objeto entre frames (ver `CentroidTracker` en vision-browser.ts). Este
 * módulo acumula esos IDs a lo largo de una sesión (un video / una cámara) para
 * responder la pregunta clave de cualquier sistema de conteo:
 *
 *   ¿Cuántas personas/objetos DIFERENTES pasaron a lo largo del video?
 *
 * Es lógica pura (sin React) para mantenerla testeable y desacoplada de la UI.
 * El acumulador se mantiene en un ref del componente y se reinicia cuando cambia
 * la fuente o el modelo.
 */

import type { VisionModel } from "@/data/vision-models";
import type { Prediction, PredictResponse } from "@/lib/vision-mock";

export type DetectionStats = {
  /** Cantidad de track IDs (u objetos con texto) distintos vistos en toda la sesión. */
  uniqueTotal: number;
  /** Detecciones contables en el frame actual. */
  onScreen: number;
  /** Máximo de detecciones simultáneas observado en un solo frame. */
  peak: number;
  /** Frames procesados desde el último reinicio. */
  frames: number;
  /** Desglose de IDs únicos por clase (person, car, truck…), de mayor a menor. */
  byClass: Array<{ label: string; count: number }>;
};

/** Estado interno mutable que persiste entre frames (vive en un ref). */
export type StatsAccumulator = {
  /** uniqueKey → clase normalizada. El tamaño es el total de únicos. */
  seen: Map<string, string>;
  peak: number;
  frames: number;
};

export function createAccumulator(): StatsAccumulator {
  return { seen: new Map(), peak: 0, frames: 0 };
}

export const emptyStats: DetectionStats = {
  uniqueTotal: 0,
  onScreen: 0,
  peak: 0,
  frames: 0,
  byClass: [],
};

/** Clave única de una detección: su track ID estable o, en su defecto, su texto (placas/OCR). */
function uniqueKey(p: Prediction): string | null {
  if (p.trackId) return p.trackId;
  if (p.text) return `txt:${p.text}`;
  return null;
}

/** Normaliza el label a su clase base legible: "person · fall" → "person". */
function normalizeClass(label: string): string {
  return label.split("·")[0].trim() || label;
}

/**
 * Acumula un frame en `acc` (lo muta) y devuelve el snapshot de stats para la UI.
 * Cada objeto cuenta una sola vez gracias a su `trackId` — reapariciones del mismo
 * track no inflan el total.
 */
export function accumulate(acc: StatsAccumulator, r: PredictResponse): DetectionStats {
  let onScreen = 0;
  for (const p of r.predictions) {
    const key = uniqueKey(p);
    if (!key) continue;
    onScreen++;
    if (!acc.seen.has(key)) acc.seen.set(key, normalizeClass(p.label));
  }
  acc.frames++;
  if (onScreen > acc.peak) acc.peak = onScreen;

  const counts = new Map<string, number>();
  for (const cls of acc.seen.values()) counts.set(cls, (counts.get(cls) ?? 0) + 1);

  return {
    uniqueTotal: acc.seen.size,
    onScreen,
    peak: acc.peak,
    frames: acc.frames,
    byClass: [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
  };
}

/** Sustantivo (con género) para titular el conteo según el tipo de modelo. */
export function countNoun(model: VisionModel): {
  singular: string;
  plural: string;
  fem: boolean;
} {
  if (model.id.startsWith("face")) return { singular: "rostro", plural: "rostros", fem: false };
  if (model.category === "vehicle") return { singular: "vehículo", plural: "vehículos", fem: false };
  if (model.category === "ocr") return { singular: "placa", plural: "placas", fem: true };
  if (model.category === "people" || model.category === "industrial")
    return { singular: "persona", plural: "personas", fem: true };
  return { singular: "detección", plural: "detecciones", fem: true };
}

/** Un modelo produce conteo único significativo (todos salvo el VLM de escena). */
export function countingCapable(modelId: string): boolean {
  return modelId !== "scene_description_vlm";
}
