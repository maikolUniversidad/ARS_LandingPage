/**
 * Motor de inferencia REAL en el navegador (client-side) con MediaPipe Tasks Vision.
 *
 * A diferencia de `vision-mock.ts` (predicciones simuladas), este módulo corre
 * modelos de verdad sobre el `<video>`/`<img>` del visitante usando su propia
 * CPU/GPU vía WebGPU/WebGL — sin enviar el frame a ningún servidor y sin costo
 * por inferencia. Es lo que alimenta el modo "IA real (navegador)" del playground.
 *
 * Cobertura (junio 2026, @mediapipe/tasks-vision 0.10.35):
 *   - pose_detection / fall_detection_demo  → PoseLandmarker (33 landmarks → 17 COCO)
 *   - people_detection / roi_intrusion /
 *     line_crossing / loitering             → ObjectDetector (EfficientDet-Lite), clase persona
 *   - vehicle_detection                     → ObjectDetector, clases vehículo
 *   - face_detection                        → FaceLandmarker (478 puntos + 52 blendshapes)
 *
 * Los modelos pesados (EPP custom, OCR de placas, reconocimiento facial, VLM,
 * objeto abandonado) NO corren bien en el navegador → caen al simulador y se
 * marcan como "Demo simulado". Ver docs/research/VISION_API_OPTIONS.md.
 *
 * El shape de salida (Prediction[] / PredictResponse) es idéntico al del mock,
 * así que VisionCanvas y el motor de reglas (`evaluateRules`) funcionan sin cambios.
 */

import { useEffect, useRef, useState } from "react";
import type { VisionModel } from "@/data/vision-models";
import {
  evaluateRules,
  type Prediction,
  type PredictResponse,
  type Rules,
} from "@/lib/vision-mock";

// Tipos de MediaPipe importados solo como type (no fuerzan el bundle en server).
import type {
  PoseLandmarker as PoseLandmarkerT,
  ObjectDetector as ObjectDetectorT,
  FaceLandmarker as FaceLandmarkerT,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";

// Modelos auto-hospedados en /public (los baja `scripts/fetch-models.mjs` en
// el postinstall). Sin dependencia de CDNs externos en runtime.
const WASM_BASE = "/mediapipe/wasm";
const MODEL_BASE = "/mediapipe/models";

const POSE_MODEL = `${MODEL_BASE}/pose_landmarker_lite.task`;
const OBJ_MODEL = `${MODEL_BASE}/efficientdet_lite0.tflite`;
// Malla facial 478 puntos + 52 blendshapes (acciones faciales).
const FACE_LANDMARKER_MODEL = `${MODEL_BASE}/face_landmarker.task`;

/** Modelos que SÍ pueden correr 100% en el navegador. El resto cae al simulador. */
export const BROWSER_MODELS = new Set<string>([
  "pose_detection",
  "fall_detection_demo",
  "people_detection",
  "vehicle_detection",
  "face_detection",
  "roi_intrusion",
  "line_crossing",
  "loitering",
]);

export function browserInferenceSupported(modelId: string): boolean {
  return BROWSER_MODELS.has(modelId);
}

/** Qué "task" de MediaPipe necesita cada modelo. */
type TaskKind = "pose" | "object" | "face";
function taskForModel(modelId: string): TaskKind {
  if (modelId === "pose_detection" || modelId === "fall_detection_demo") return "pose";
  if (modelId === "face_detection") return "face";
  return "object"; // people, vehicle, roi, line, loitering
}

const VEHICLE_LABELS = new Set(["car", "motorcycle", "truck", "bus", "bicycle"]);

// MediaPipe Pose: 33 landmarks. El canvas dibuja sobre 17 keypoints COCO.
// Mapeo MediaPipe(33) → COCO(17).
const MP_TO_COCO = [0, 2, 5, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

// ─────────────────────────── Tracker simple (IoU/centro) ───────────────────────────
// Da trackIds estables entre frames para que ROI/línea/loitering se vean coherentes.

type TrackedBox = { id: string; cx: number; cy: number; ttl: number };

class CentroidTracker {
  private tracks: TrackedBox[] = [];
  private counter = 1000;
  private maxDist: number;

  constructor(maxDist = 0.12) {
    this.maxDist = maxDist;
  }

  assign(boxes: Array<{ cx: number; cy: number }>): string[] {
    const used = new Set<number>();
    const ids = boxes.map((b) => {
      let best = -1;
      let bestD = this.maxDist;
      this.tracks.forEach((t, i) => {
        if (used.has(i)) return;
        const d = Math.hypot(t.cx - b.cx, t.cy - b.cy);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      if (best >= 0) {
        used.add(best);
        this.tracks[best].cx = b.cx;
        this.tracks[best].cy = b.cy;
        this.tracks[best].ttl = 30;
        return this.tracks[best].id;
      }
      this.counter += 1;
      const id = `T-${this.counter}`;
      this.tracks.push({ id, cx: b.cx, cy: b.cy, ttl: 30 });
      used.add(this.tracks.length - 1);
      return id;
    });
    // Envejecer y limpiar tracks no vistos
    this.tracks = this.tracks
      .map((t, i) => (used.has(i) ? t : { ...t, ttl: t.ttl - 1 }))
      .filter((t) => t.ttl > 0);
    return ids;
  }

  reset() {
    this.tracks = [];
  }
}

// ─────────────────────────── Engine ───────────────────────────

type AnyMedia = HTMLVideoElement | HTMLImageElement;

function mediaSize(el: AnyMedia): { w: number; h: number } {
  if (el instanceof HTMLVideoElement) {
    return { w: el.videoWidth || 1280, h: el.videoHeight || 720 };
  }
  return { w: el.naturalWidth || 1280, h: el.naturalHeight || 720 };
}

function mediaReady(el: AnyMedia): boolean {
  if (el instanceof HTMLVideoElement) return el.readyState >= 2 && el.videoWidth > 0;
  return el.complete && el.naturalWidth > 0;
}

// MediaPipe/TFLite escriben logs informativos a stderr (vía el wasm) que el
// modo dev de Next intercepta y muestra como "Console Error", alarmando aunque
// NO son fallos (p.ej. "Created TensorFlow Lite XNNPACK delegate for CPU").
// Filtramos SOLO ese ruido conocido; cualquier otro error pasa sin tocar.
const MP_NOISE =
  /XNNPACK|TensorFlow Lite|Feedback manager|landmark_projection|InferenceCalculator|gl_context|GL version|OpenGL|single signature|inference feedback/i;

let mpNoiseSilenced = false;
function silenceMediaPipeNoise() {
  if (mpNoiseSilenced || typeof console === "undefined") return;
  mpNoiseSilenced = true;
  const methods = ["error", "warn", "info", "log"] as const;
  for (const m of methods) {
    const original = console[m].bind(console);
    console[m] = (...args: unknown[]) => {
      const first = args[0];
      if (typeof first === "string" && MP_NOISE.test(first)) return; // ruido benigno
      original(...args);
    };
  }
}

export class BrowserVisionEngine {
  private pose: PoseLandmarkerT | null = null;
  private object: ObjectDetectorT | null = null;
  private face: FaceLandmarkerT | null = null;
  private kind: TaskKind | null = null;
  private runningMode: "VIDEO" | "IMAGE" = "VIDEO";
  private tracker = new CentroidTracker();
  private fallStartByTrack = new Map<string, number>();
  backend: "GPU" | "CPU" = "GPU";

  /** Crea (o reutiliza) la task de MediaPipe que necesita este modelo. */
  async ensure(modelId: string, isVideo: boolean): Promise<void> {
    silenceMediaPipeNoise();
    const kind = taskForModel(modelId);
    const mode = isVideo ? "VIDEO" : "IMAGE";
    const mp = await import("@mediapipe/tasks-vision");
    const { FilesetResolver, PoseLandmarker, ObjectDetector, FaceLandmarker } = mp;
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);

    // Si cambió el tipo de task, liberamos las anteriores.
    if (kind !== this.kind) {
      this.dispose();
      this.kind = kind;
    }
    this.tracker.reset();

    const delegate: "GPU" | "CPU" = this.backend;
    try {
      if (kind === "pose") {
        if (!this.pose) {
          this.pose = await PoseLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: POSE_MODEL, delegate },
            runningMode: mode,
            numPoses: 3,
          });
        } else if (this.runningMode !== mode) {
          await this.pose.setOptions({ runningMode: mode });
        }
      } else if (kind === "object") {
        if (!this.object) {
          this.object = await ObjectDetector.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: OBJ_MODEL, delegate },
            runningMode: mode,
            scoreThreshold: 0.3,
            maxResults: 12,
          });
        } else if (this.runningMode !== mode) {
          await this.object.setOptions({ runningMode: mode });
        }
      } else {
        if (!this.face) {
          this.face = await FaceLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL, delegate },
            runningMode: mode,
            numFaces: 3,
            outputFaceBlendshapes: true, // 52 acciones faciales por rostro
          });
        } else if (this.runningMode !== mode) {
          await this.face.setOptions({ runningMode: mode });
        }
      }
      this.runningMode = mode;
    } catch (err) {
      // Fallback a CPU si la GPU/WebGPU no está disponible en este equipo.
      if (delegate === "GPU") {
        this.backend = "CPU";
        this.dispose();
        this.kind = null;
        return this.ensure(modelId, isVideo);
      }
      throw err;
    }
  }

  /** Corre la inferencia sobre el frame y devuelve predicciones normalizadas [0..1]. */
  detect(modelId: string, media: AnyMedia, tsMs: number): Prediction[] {
    if (!mediaReady(media)) return [];
    const kind = taskForModel(modelId);
    const isVideo = media instanceof HTMLVideoElement;
    const { w, h } = mediaSize(media);

    if (kind === "pose" && this.pose) {
      const res = isVideo
        ? this.pose.detectForVideo(media, tsMs)
        : this.pose.detect(media);
      return this.posePredictions(modelId, res.landmarks ?? [], tsMs);
    }

    if (kind === "object" && this.object) {
      const res = isVideo
        ? this.object.detectForVideo(media, tsMs)
        : this.object.detect(media);
      return this.objectPredictions(modelId, res.detections ?? [], w, h);
    }

    if (kind === "face" && this.face) {
      const res = isVideo
        ? this.face.detectForVideo(media, tsMs)
        : this.face.detect(media);
      return this.facePredictions(
        res.faceLandmarks ?? [],
        res.faceBlendshapes ?? []
      );
    }

    return [];
  }

  // ── Pose → Prediction (con bbox y keypoints COCO) ──
  private posePredictions(
    modelId: string,
    poses: NormalizedLandmark[][],
    tsMs: number
  ): Prediction[] {
    const isFallModel = modelId === "fall_detection_demo";
    const centers = poses.map((lm) => {
      const xs = lm.map((p) => p.x);
      const ys = lm.map((p) => p.y);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      return { cx, cy };
    });
    const ids = this.tracker.assign(centers);

    return poses.map((lm, i) => {
      const xs = lm.map((p) => p.x);
      const ys = lm.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);

      // 33 landmarks → 17 keypoints COCO que dibuja el canvas.
      const keypoints = MP_TO_COCO.map((idx) => {
        const p = lm[idx];
        return [p.x, p.y, p.visibility ?? 1] as [number, number, number];
      });

      // Ángulo del torso respecto a la vertical (hombros↔caderas).
      const sh = midpoint(lm[11], lm[12]);
      const hip = midpoint(lm[23], lm[24]);
      const angle = torsoAngle(sh, hip);

      const trackId = ids[i];
      let fall = false;
      if (isFallModel) {
        const horizontal = Math.abs(angle) > 50;
        if (horizontal) {
          const start = this.fallStartByTrack.get(trackId) ?? tsMs;
          this.fallStartByTrack.set(trackId, start);
          if (tsMs - start > 1000) fall = true; // horizontal sostenido > 1s
        } else {
          this.fallStartByTrack.delete(trackId);
        }
      }

      return {
        label: fall ? "person · fall" : "person",
        confidence: avgVisibility(lm),
        bbox: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
        trackId,
        keypoints,
        angle: Math.round(angle),
      };
    });
  }

  // ── ObjectDetector → Prediction ──
  private objectPredictions(
    modelId: string,
    detections: Array<{
      categories: Array<{ categoryName?: string; score: number }>;
      boundingBox?: { originX: number; originY: number; width: number; height: number };
    }>,
    w: number,
    h: number
  ): Prediction[] {
    const wantVehicles = modelId === "vehicle_detection";
    const out: Prediction[] = [];
    const raw: Array<{ label: string; conf: number; bbox: Prediction["bbox"]; cx: number; cy: number }> = [];

    for (const d of detections) {
      const cat = d.categories?.[0];
      const name = cat?.categoryName ?? "object";
      const bb = d.boundingBox;
      if (!bb) continue;
      const keep = wantVehicles ? VEHICLE_LABELS.has(name) : name === "person";
      if (!keep) continue;
      const bbox = {
        x: bb.originX / w,
        y: bb.originY / h,
        width: bb.width / w,
        height: bb.height / h,
      };
      raw.push({
        label: name,
        conf: cat?.score ?? 0.5,
        bbox,
        cx: bbox.x + bbox.width / 2,
        cy: bbox.y + bbox.height / 2,
      });
    }

    const ids = this.tracker.assign(raw.map((r) => ({ cx: r.cx, cy: r.cy })));
    raw.forEach((r, i) => {
      out.push({ label: r.label, confidence: r.conf, bbox: r.bbox, trackId: ids[i] });
    });
    return out;
  }

  // ── FaceLandmarker → Prediction (malla 478 pts + acciones faciales) ──
  private facePredictions(
    faceLandmarks: NormalizedLandmark[][],
    faceBlendshapes: Array<{
      categories: Array<{ categoryName?: string; displayName?: string; score: number }>;
    }>
  ): Prediction[] {
    // Centros para tracking estable entre frames.
    const centers = faceLandmarks.map((lm) => {
      const xs = lm.map((p) => p.x);
      const ys = lm.map((p) => p.y);
      return {
        cx: (Math.min(...xs) + Math.max(...xs)) / 2,
        cy: (Math.min(...ys) + Math.max(...ys)) / 2,
      };
    });
    const ids = this.tracker.assign(centers);

    return faceLandmarks.map((lm, i) => {
      const xs = lm.map((p) => p.x);
      const ys = lm.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);

      // Malla completa como [x,y] normalizados (lo que dibuja el canvas).
      const faceMesh = lm.map((p) => [p.x, p.y] as [number, number]);

      // Acciones faciales (blendshapes) → agregadas, traducidas y ordenadas.
      const cats = faceBlendshapes[i]?.categories ?? [];
      const scoreByName = new Map<string, number>();
      for (const c of cats) {
        if (c.categoryName) scoreByName.set(c.categoryName, c.score);
      }
      const blendshapes = aggregateBlendshapes(scoreByName);
      const emotions = scoreEmotions(scoreByName);
      const expression = summarizeExpression(scoreByName, emotions);

      return {
        label: "rostro",
        confidence: 0.97,
        bbox: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
        trackId: ids[i],
        faceMesh,
        blendshapes,
        emotions,
        expression,
      };
    });
  }

  dispose() {
    this.pose?.close?.();
    this.object?.close?.();
    this.face?.close?.();
    this.pose = null;
    this.object = null;
    this.face = null;
    this.fallStartByTrack.clear();
  }
}

// ─────────────────────────── Geometría pose ───────────────────────────

function midpoint(a?: NormalizedLandmark, b?: NormalizedLandmark) {
  if (!a || !b) return { x: 0.5, y: 0.5 };
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Ángulo (grados) del torso respecto a la vertical. 0 = de pie, ~90 = horizontal. */
function torsoAngle(shoulder: { x: number; y: number }, hip: { x: number; y: number }): number {
  const dx = hip.x - shoulder.x;
  const dy = hip.y - shoulder.y;
  // atan2(dx, dy): 0 cuando el torso es vertical (dy dominante).
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}

function avgVisibility(lm: NormalizedLandmark[]): number {
  if (!lm.length) return 0.8;
  const vis = lm.map((p) => p.visibility ?? 0.9);
  const v = vis.reduce((s, x) => s + x, 0) / vis.length;
  return Math.max(0.6, Math.min(0.99, v));
}

// ─────────────────────────── Acciones faciales (blendshapes) ───────────────────────────

/**
 * Reglas de agregación: combinan los 52 blendshapes crudos de MediaPipe en
 * acciones faciales legibles en español. Cada acción promedia las variantes
 * izquierda/derecha para una lectura más limpia.
 */
const BLENDSHAPE_GROUPS: Array<{ label: string; keys: string[] }> = [
  { label: "Sonrisa", keys: ["mouthSmileLeft", "mouthSmileRight"] },
  { label: "Mandíbula abierta", keys: ["jawOpen"] },
  { label: "Ojos cerrados", keys: ["eyeBlinkLeft", "eyeBlinkRight"] },
  { label: "Ojos muy abiertos", keys: ["eyeWideLeft", "eyeWideRight"] },
  { label: "Ojos entrecerrados", keys: ["eyeSquintLeft", "eyeSquintRight"] },
  { label: "Cejas arriba (sorpresa)", keys: ["browInnerUp", "browOuterUpLeft", "browOuterUpRight"] },
  { label: "Ceño fruncido", keys: ["browDownLeft", "browDownRight"] },
  { label: "Boca hacia abajo", keys: ["mouthFrownLeft", "mouthFrownRight"] },
  { label: "Labios fruncidos", keys: ["mouthPucker"] },
  { label: "Boca en O", keys: ["mouthFunnel"] },
  { label: "Mejillas infladas", keys: ["cheekPuff"] },
  { label: "Nariz arrugada", keys: ["noseSneerLeft", "noseSneerRight"] },
  { label: "Boca a un lado", keys: ["mouthLeft", "mouthRight"] },
  { label: "Mandíbula adelantada", keys: ["jawForward"] },
];

function groupScore(map: Map<string, number>, keys: string[]): number {
  let sum = 0;
  for (const k of keys) sum += map.get(k) ?? 0;
  return sum / keys.length;
}

/** Devuelve las acciones faciales agregadas con score > 0, ordenadas desc. */
function aggregateBlendshapes(
  map: Map<string, number>
): Array<{ name: string; score: number }> {
  return BLENDSHAPE_GROUPS.map((g) => ({ name: g.label, score: groupScore(map, g.keys) }))
    .filter((b) => b.score > 0.04)
    .sort((a, b) => b.score - a.score);
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Estima emociones básicas a partir de los 52 blendshapes de FaceLandmarker.
 * No es un clasificador entrenado de emociones — son heurísticas sobre la
 * "firma" facial de cada emoción (FACS aproximado). Devuelve scores 0..1.
 */
function scoreEmotions(map: Map<string, number>): Array<{ name: string; score: number }> {
  const smile = groupScore(map, ["mouthSmileLeft", "mouthSmileRight"]);
  const cheek = groupScore(map, ["cheekSquintLeft", "cheekSquintRight"]);
  const frown = groupScore(map, ["mouthFrownLeft", "mouthFrownRight"]);
  const browInner = map.get("browInnerUp") ?? 0;
  const browOuter = groupScore(map, ["browOuterUpLeft", "browOuterUpRight"]);
  const browUp = (browInner + browOuter) / 2;
  const browDown = groupScore(map, ["browDownLeft", "browDownRight"]);
  const eyeWide = groupScore(map, ["eyeWideLeft", "eyeWideRight"]);
  const eyeSquint = groupScore(map, ["eyeSquintLeft", "eyeSquintRight"]);
  const jaw = map.get("jawOpen") ?? 0;
  const noseSneer = groupScore(map, ["noseSneerLeft", "noseSneerRight"]);
  const mouthUpper = groupScore(map, ["mouthUpperUpLeft", "mouthUpperUpRight"]);
  const mouthPress = groupScore(map, ["mouthPressLeft", "mouthPressRight"]);

  const emotions = [
    { name: "Feliz", score: clamp01(smile * 1.05 + cheek * 0.3 - frown * 0.6) },
    { name: "Triste", score: clamp01(frown * 0.85 + browInner * 0.6 - smile * 0.8) },
    { name: "Enojado", score: clamp01(browDown * 0.95 + eyeSquint * 0.3 + mouthPress * 0.3 - browInner * 0.5 - smile * 0.6) },
    { name: "Sorprendido", score: clamp01(eyeWide * 0.45 + browUp * 0.5 + jaw * 0.35 - smile * 0.4) },
    { name: "Disgustado", score: clamp01(noseSneer * 0.7 + mouthUpper * 0.5 - smile * 0.4) },
  ];

  return emotions.sort((a, b) => b.score - a.score);
}

/** Expresión/emoción dominante. Cae a estados (hablando, ojos cerrados, neutral). */
function summarizeExpression(
  map: Map<string, number>,
  emotions: Array<{ name: string; score: number }>
): string {
  const top = emotions[0];
  if (top && top.score >= 0.35) {
    // "Feliz" + boca muy abierta = "Riendo".
    if (top.name === "Feliz" && (map.get("jawOpen") ?? 0) > 0.4) return "Riendo";
    return top.name;
  }
  const jaw = map.get("jawOpen") ?? 0;
  const blink = groupScore(map, ["eyeBlinkLeft", "eyeBlinkRight"]);
  if (jaw > 0.4) return "Hablando";
  if (blink > 0.6) return "Ojos cerrados";
  return "Neutral";
}

// ─────────────────────────── React hook ───────────────────────────

type WebGPUNavigator = Navigator & { gpu?: unknown };

export function webgpuAvailable(): boolean {
  if (typeof navigator === "undefined") return false;
  return "gpu" in (navigator as WebGPUNavigator);
}

type EngineStatus = "idle" | "loading" | "running" | "error" | "unsupported";

type UseBrowserVisionArgs = {
  enabled: boolean;
  model: VisionModel;
  source: string;
  mediaRef: React.RefObject<AnyMedia | null>;
  rules: Rules;
  /** ~fps objetivo para actualizar el estado de React (el rAF corre a fondo). */
  targetFps?: number;
  onResult: (r: PredictResponse) => void;
};

/**
 * Hook que maneja el ciclo de vida del motor en navegador: inicializa la task de
 * MediaPipe, corre un loop de requestAnimationFrame sobre el media element y
 * publica PredictResponse compatibles con el canvas/reglas existentes.
 */
export function useBrowserVision({
  enabled,
  model,
  source,
  mediaRef,
  rules,
  targetFps = 15,
  onResult,
}: UseBrowserVisionArgs) {
  const [status, setStatus] = useState<EngineStatus>("idle");
  const [fps, setFps] = useState(0);
  const [backend, setBackend] = useState<"GPU" | "CPU">("GPU");
  const engineRef = useRef<BrowserVisionEngine | null>(null);

  // Mantener rules/onResult frescos sin reiniciar el loop.
  const rulesRef = useRef(rules);
  const onResultRef = useRef(onResult);
  useEffect(() => {
    rulesRef.current = rules;
    onResultRef.current = onResult;
  });

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }
    if (!browserInferenceSupported(model.id)) {
      setStatus("unsupported");
      return;
    }

    let raf = 0;
    let cancelled = false;
    let lastEmit = 0;
    let frames = 0;
    let fpsWindow = performance.now();
    const minInterval = 1000 / targetFps;
    const isVideo = source !== "image";

    const engine = engineRef.current ?? new BrowserVisionEngine();
    engineRef.current = engine;

    (async () => {
      setStatus("loading");
      try {
        await engine.ensure(model.id, isVideo);
        if (cancelled) return;
        setBackend(engine.backend);
        setStatus("running");

        const loop = () => {
          if (cancelled) return;
          const media = mediaRef.current;
          const now = performance.now();
          if (media && now - lastEmit >= minInterval) {
            try {
              const preds = engine.detect(model.id, media, now);
              const filtered = preds.filter(
                (p) => p.confidence >= rulesRef.current.confidenceThreshold
              );
              const { w, h } = media
                ? mediaSize(media)
                : { w: 1280, h: 720 };
              const iso = new Date().toISOString();
              const events = evaluateRules(model, filtered, rulesRef.current, source, iso);
              onResultRef.current({
                model: model.id,
                source,
                timestamp: iso,
                frameWidth: w,
                frameHeight: h,
                predictions: filtered,
                events,
              });
              lastEmit = now;
              frames += 1;
              if (now - fpsWindow >= 1000) {
                setFps(Math.round((frames * 1000) / (now - fpsWindow)));
                frames = 0;
                fpsWindow = now;
              }
            } catch {
              // Frame no listo (p.ej. video aún sin decodificar) — reintentar.
            }
          }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      } catch (err) {
        console.error("BrowserVisionEngine error", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [enabled, model, source, mediaRef, targetFps]);

  // Liberar el engine al desmontar.
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return { status, fps, backend };
}
