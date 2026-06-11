/**
 * Análisis de AGLOMERACIÓN y densidad para el overlay en vivo.
 *
 * A diferencia del simple "conteo de personas", esto interpreta CÓMO están
 * distribuidas: qué tan juntas, qué tan saturada está la escena y dónde está el
 * foco más denso. Trabaja sólo con los bounding boxes normalizados [0..1] que ya
 * produce el detector de personas (people_detection), así que corre 100% en el
 * navegador, por frame, sin costo extra.
 *
 * Señales que combina:
 *   - Conteo total vs. un límite seguro (capacity) → saturación.
 *   - Proximidad: pares de personas más cerca que ~N anchos de cuerpo → hacinamiento.
 *   - Clusters (union-find sobre la proximidad) → el grupo más denso y su región.
 *   - Ocupación: fracción del cuadro cubierta por personas (grilla) → congestión.
 *
 * Es lógica pura (sin React ni canvas) para mantenerla testeable y reutilizable.
 */

import type { Prediction } from "@/lib/vision-mock";

export type CrowdLevel = "calm" | "moderate" | "busy" | "critical";

export type CrowdAnalysis = {
  /** Personas detectadas en el frame. */
  count: number;
  /** Nivel de afluencia derivado del índice de densidad y el conteo. */
  level: CrowdLevel;
  /** Índice compuesto de aglomeración 0..1 (conteo + proximidad + cluster + ocupación). */
  densityIndex: number;
  /** Fracción del cuadro cubierta por personas 0..1 (vía grilla, sin doble conteo). */
  occupancy: number;
  /** Pares de personas en proximidad cercana (posible hacinamiento). */
  closeContacts: number;
  /** Fracción de personas que están cerca de al menos otra 0..1. */
  closeRatio: number;
  /** Tamaño del grupo (cluster) más denso. */
  peakCluster: number;
  /** Región (bbox normalizada) del foco más denso, si hay un grupo de ≥3. */
  hotspot?: { x: number; y: number; width: number; height: number; count: number };
  /** La escena superó el límite seguro / densidad alta. */
  alert: boolean;
  /** Límite seguro de personas usado para evaluar la saturación. */
  capacity: number;
};

export type CrowdOptions = {
  /** Límite seguro de personas para la zona encuadrada (default 10). */
  capacity?: number;
  /** Resolución de la grilla de ocupación. */
  gridW?: number;
  gridH?: number;
  /** Cuántos "anchos de cuerpo" de separación cuentan como proximidad cercana. */
  proximityFactor?: number;
};

export const CROWD_LEVEL_META: Record<
  CrowdLevel,
  { label: string; short: string; color: string }
> = {
  calm: { label: "Flujo normal", short: "Normal", color: "rgb(74, 222, 128)" },
  moderate: { label: "Afluencia moderada", short: "Moderada", color: "rgb(234, 179, 8)" },
  busy: { label: "Alta afluencia", short: "Alta", color: "rgb(249, 115, 22)" },
  critical: { label: "Saturación crítica", short: "Crítica", color: "rgb(239, 68, 68)" },
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function emptyAnalysis(capacity: number): CrowdAnalysis {
  return {
    count: 0,
    level: "calm",
    densityIndex: 0,
    occupancy: 0,
    closeContacts: 0,
    closeRatio: 0,
    peakCluster: 0,
    alert: false,
    capacity,
  };
}

/** Analiza la aglomeración de un conjunto de detecciones de personas. */
export function analyzeCrowd(preds: Prediction[], opts: CrowdOptions = {}): CrowdAnalysis {
  const capacity = opts.capacity ?? 10;
  const gridW = opts.gridW ?? 24;
  const gridH = opts.gridH ?? 14;
  const proximityFactor = opts.proximityFactor ?? 1.5;

  // En este demo todas las detecciones son personas, pero filtramos por las dudas.
  const people = preds.filter((p) => p.bbox && p.bbox.width > 0 && p.bbox.height > 0);
  const count = people.length;
  if (count === 0) return emptyAnalysis(capacity);

  const c = people.map((p) => ({
    cx: p.bbox.x + p.bbox.width / 2,
    cy: p.bbox.y + p.bbox.height / 2,
    w: p.bbox.width,
    h: p.bbox.height,
    bbox: p.bbox,
  }));

  // ── Ocupación: celdas de la grilla cubiertas por alguna persona ──
  const cover = new Uint8Array(gridW * gridH);
  for (const o of c) {
    const x0 = Math.max(0, Math.floor(o.bbox.x * gridW));
    const x1 = Math.min(gridW - 1, Math.floor((o.bbox.x + o.bbox.width) * gridW));
    const y0 = Math.max(0, Math.floor(o.bbox.y * gridH));
    const y1 = Math.min(gridH - 1, Math.floor((o.bbox.y + o.bbox.height) * gridH));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) cover[y * gridW + x] = 1;
    }
  }
  let covered = 0;
  for (let i = 0; i < cover.length; i++) covered += cover[i];
  const occupancy = covered / (gridW * gridH);

  // ── Proximidad + clusters (union-find sobre pares cercanos) ──
  const parent = c.map((_, i) => i);
  const find = (a: number): number => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]];
      a = parent[a];
    }
    return a;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };

  const closeFlag = new Array<boolean>(count).fill(false);
  let closeContacts = 0;
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const a = c[i];
      const b = c[j];
      const dist = Math.hypot(a.cx - b.cx, a.cy - b.cy);
      const bodyW = (a.w + b.w) / 2 || 0.05;
      if (dist < proximityFactor * bodyW) {
        closeContacts++;
        closeFlag[i] = true;
        closeFlag[j] = true;
        union(i, j);
      }
    }
  }
  const closePeople = closeFlag.filter(Boolean).length;
  const closeRatio = closePeople / count;

  // Tamaño del cluster más grande + su raíz.
  const sizes = new Map<number, number>();
  for (let i = 0; i < count; i++) {
    const r = find(i);
    sizes.set(r, (sizes.get(r) ?? 0) + 1);
  }
  let peakRoot = -1;
  let peakCluster = 0;
  for (const [root, sz] of sizes) {
    if (sz > peakCluster) {
      peakCluster = sz;
      peakRoot = root;
    }
  }

  // Región del foco más denso: bbox que envuelve al cluster más grande (si ≥3).
  let hotspot: CrowdAnalysis["hotspot"];
  if (peakCluster >= 3 && peakRoot >= 0) {
    let minX = 1;
    let minY = 1;
    let maxX = 0;
    let maxY = 0;
    for (let i = 0; i < count; i++) {
      if (find(i) !== peakRoot) continue;
      const b = c[i].bbox;
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    }
    hotspot = { x: minX, y: minY, width: maxX - minX, height: maxY - minY, count: peakCluster };
  }

  // ── Índice compuesto + nivel ──
  const countScore = clamp01(count / capacity);
  const clusterScore = clamp01(peakCluster / Math.max(3, capacity * 0.5));
  const densityIndex = clamp01(
    0.45 * countScore + 0.3 * closeRatio + 0.15 * clusterScore + 0.1 * occupancy
  );

  let level: CrowdLevel = "calm";
  if (densityIndex >= 0.8 || count >= capacity * 1.5) level = "critical";
  else if (densityIndex >= 0.55 || count >= capacity) level = "busy";
  else if (densityIndex >= 0.3 || count >= Math.max(3, capacity * 0.5)) level = "moderate";

  const alert = level === "busy" || level === "critical";

  return {
    count,
    level,
    densityIndex,
    occupancy,
    closeContacts,
    closeRatio,
    peakCluster,
    hotspot,
    alert,
    capacity,
  };
}
