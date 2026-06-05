/**
 * Detector YOLOX (Megvii, Apache-2.0) en el navegador con onnxruntime-web.
 *
 * Modelos de ARS/vigias (EPP y armas), fine-tuneados sobre YOLOX_M. Corren
 * 100% client-side; los .onnx se auto-hospedan en /public/models/vigias.
 *
 * Detalles específicos de YOLOX (¡distintos a Ultralytics!):
 *  - Input [1,3,640,640] float32 NCHW, orden **BGR**, **píxel crudo 0–255 (NO /255)**.
 *  - Letterbox manteniendo aspecto, padding gris (114).
 *  - Output crudo [1,8400,5+nc]: [cx,cy,w,h,obj, cls...] en píxeles del input 640,
 *    con objectness, ya con sigmoid. score = obj * cls. SIN NMS embebido → NMS acá.
 *
 * ⚠️ El "sin /255" es el gotcha clásico de YOLOX: verificar empíricamente con una
 *    imagen real (si las cajas salen mal, ese suele ser el motivo).
 */

import type { Prediction } from "@/lib/vision-mock";

export type YoloxConfig = {
  modelUrl: string;
  inputSize: number;
  classes: string[];
  confThreshold: number;
  iouThreshold: number;
  /** Umbral por clase (nombre → umbral). Cae a confThreshold si falta. */
  perClass?: Record<string, number>;
  /** Índices de clases que son "violación"/peligro → caja roja + alarma. */
  alarmClasses?: number[];
  alarmKind?: "violation" | "weapon";
};

const VIGIAS = "/models/vigias";

export const EPP_CONFIG: YoloxConfig = {
  // FP32 (más compatible en navegador). Alternativa liviana: epp_detector_int8.onnx (QDQ).
  modelUrl: `${VIGIAS}/epp_detector.onnx`,
  inputSize: 640,
  classes: ["Hardhat", "NO-Hardhat", "Safety Vest", "NO-Safety Vest", "Person"],
  confThreshold: 0.3,
  iouThreshold: 0.45,
  perClass: {
    Hardhat: 0.35,
    "NO-Hardhat": 0.25,
    "Safety Vest": 0.35,
    "NO-Safety Vest": 0.25,
    Person: 0.4,
  },
  alarmClasses: [1, 3], // NO-Hardhat, NO-Safety Vest
  alarmKind: "violation",
};

export const WEAPONS_CONFIG: YoloxConfig = {
  modelUrl: `${VIGIAS}/weapon_detector.onnx`,
  inputSize: 640,
  classes: ["pistol", "knife", "rifle", "person"],
  confThreshold: 0.25,
  iouThreshold: 0.45,
  perClass: { pistol: 0.3, knife: 0.3, rifle: 0.25, person: 0.4 },
  alarmClasses: [0, 1, 2], // cualquier arma
  alarmKind: "weapon",
};

type OrtModule = typeof import("onnxruntime-web/webgpu");
type Session = Awaited<ReturnType<OrtModule["InferenceSession"]["create"]>>;

export type DetStatus = "idle" | "loading" | "ready" | "error";

export class YoloxDetector {
  private cfg: YoloxConfig;
  private ort: OrtModule | null = null;
  private session: Session | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private busy = false;

  status: DetStatus = "idle";
  backend: "GPU" | "CPU" = "GPU";

  constructor(cfg: YoloxConfig) {
    this.cfg = cfg;
  }

  get modelUrl(): string {
    return this.cfg.modelUrl;
  }

  async init(): Promise<void> {
    if (this.session || this.status === "loading") return;
    this.status = "loading";
    try {
      const ort = await import("onnxruntime-web/webgpu");
      // wasm de ORT auto-hospedado en /public/ort (postinstall).
      ort.env.wasm.wasmPaths = "/ort/";
      this.ort = ort;
      let session: Session;
      try {
        session = await ort.InferenceSession.create(this.cfg.modelUrl, {
          executionProviders: ["webgpu", "wasm"],
        });
        this.backend = "GPU";
      } catch {
        // Fallback a WASM puro (p.ej. modelos QDQ o sin WebGPU).
        session = await ort.InferenceSession.create(this.cfg.modelUrl, {
          executionProviders: ["wasm"],
        });
        this.backend = "CPU";
      }
      this.session = session;
      const c = document.createElement("canvas");
      c.width = this.cfg.inputSize;
      c.height = this.cfg.inputSize;
      this.canvas = c;
      this.status = "ready";
    } catch (e) {
      console.error("[YOLOX] no se pudo cargar el modelo", this.cfg.modelUrl, e);
      this.status = "error";
    }
  }

  get ready() {
    return this.status === "ready" && !!this.session;
  }

  /** Una inferencia en vuelo a la vez; si está ocupado devuelve null. */
  async detect(video: HTMLVideoElement): Promise<Prediction[] | null> {
    if (!this.ready || this.busy || !this.session || !this.ort || !this.canvas) return null;
    if (!video.videoWidth || video.readyState < 2) return null;
    this.busy = true;
    try {
      const size = this.cfg.inputSize;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const scale = Math.min(size / vw, size / vh);
      const newW = Math.round(vw * scale);
      const newH = Math.round(vh * scale);
      const padX = Math.floor((size - newW) / 2);
      const padY = Math.floor((size - newH) / 2);

      const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.fillStyle = "rgb(114,114,114)";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(video, 0, 0, vw, vh, padX, padY, newW, newH);
      const img = ctx.getImageData(0, 0, size, size).data;

      // NCHW, orden BGR, píxel crudo 0–255 (sin normalizar).
      const area = size * size;
      const input = new Float32Array(3 * area);
      for (let p = 0, i = 0; p < area; p++, i += 4) {
        input[p] = img[i + 2]; // B
        input[area + p] = img[i + 1]; // G
        input[2 * area + p] = img[i]; // R
      }

      const tensor = new this.ort.Tensor("float32", input, [1, 3, size, size]);
      const feeds: Record<string, unknown> = { [this.session.inputNames[0]]: tensor };
      const out = await this.session.run(feeds as never);
      const o = out[this.session.outputNames[0]];
      const preds = this.decode(o.data as Float32Array, o.dims as number[], {
        scale,
        padX,
        padY,
        vw,
        vh,
      });
      return preds;
    } catch (e) {
      console.error("[YOLOX] run falló", e);
      return [];
    } finally {
      this.busy = false;
    }
  }

  private decode(
    d: Float32Array,
    dims: number[],
    geo: { scale: number; padX: number; padY: number; vw: number; vh: number }
  ): Prediction[] {
    const nc = this.cfg.classes.length;
    const attrs = 5 + nc;
    // Layout robusto: [1,N,attrs] (normal) o [1,attrs,N] (transpuesto).
    let N: number;
    let transposed: boolean;
    if (dims.length === 3 && dims[2] === attrs) {
      N = dims[1];
      transposed = false;
    } else if (dims.length === 3 && dims[1] === attrs) {
      N = dims[2];
      transposed = true;
    } else {
      // fallback: asume [1,N,attrs]
      N = dims[dims.length - 2];
      transposed = false;
    }
    const at = (i: number, a: number) => (transposed ? d[a * N + i] : d[i * attrs + a]);

    const { scale, padX, padY, vw, vh } = geo;
    type Box = { x1: number; y1: number; x2: number; y2: number; score: number; cls: number };
    const boxes: Box[] = [];

    for (let i = 0; i < N; i++) {
      const obj = at(i, 4);
      if (obj < 0.05) continue;
      let bestC = 0;
      let bestS = 0;
      for (let c = 0; c < nc; c++) {
        const s = at(i, 5 + c);
        if (s > bestS) {
          bestS = s;
          bestC = c;
        }
      }
      const score = obj * bestS;
      const thr = this.cfg.perClass?.[this.cfg.classes[bestC]] ?? this.cfg.confThreshold;
      if (score < thr) continue;

      const cx = at(i, 0);
      const cy = at(i, 1);
      const w = at(i, 2);
      const h = at(i, 3);
      // 640-input px → frame original px (deshacer letterbox)
      const x1 = (cx - w / 2 - padX) / scale;
      const y1 = (cy - h / 2 - padY) / scale;
      const x2 = (cx + w / 2 - padX) / scale;
      const y2 = (cy + h / 2 - padY) / scale;
      boxes.push({ x1, y1, x2, y2, score, cls: bestC });
    }

    const kept = nms(boxes, this.cfg.iouThreshold);

    return kept.map((b) => {
      const x1 = Math.max(0, Math.min(vw, b.x1));
      const y1 = Math.max(0, Math.min(vh, b.y1));
      const x2 = Math.max(0, Math.min(vw, b.x2));
      const y2 = Math.max(0, Math.min(vh, b.y2));
      const isAlarm = this.cfg.alarmClasses?.includes(b.cls);
      const pred: Prediction = {
        label: this.cfg.classes[b.cls],
        confidence: b.score,
        bbox: {
          x: x1 / vw,
          y: y1 / vh,
          width: (x2 - x1) / vw,
          height: (y2 - y1) / vh,
        },
      };
      if (isAlarm) pred.alarm = this.cfg.alarmKind;
      return pred;
    });
  }

  dispose() {
    this.session?.release?.();
    this.session = null;
    this.status = "idle";
    this.canvas = null;
  }
}

// NMS por clase (greedy IoU).
function nms<T extends { x1: number; y1: number; x2: number; y2: number; score: number; cls: number }>(
  boxes: T[],
  iouThr: number
): T[] {
  const byClass = new Map<number, T[]>();
  for (const b of boxes) {
    const arr = byClass.get(b.cls) ?? [];
    arr.push(b);
    byClass.set(b.cls, arr);
  }
  const out: T[] = [];
  for (const arr of byClass.values()) {
    arr.sort((a, b) => b.score - a.score);
    const removed = new Array<boolean>(arr.length).fill(false);
    for (let i = 0; i < arr.length; i++) {
      if (removed[i]) continue;
      out.push(arr[i]);
      for (let j = i + 1; j < arr.length; j++) {
        if (removed[j]) continue;
        if (iou(arr[i], arr[j]) > iouThr) removed[j] = true;
      }
    }
  }
  return out;
}

function iou(
  a: { x1: number; y1: number; x2: number; y2: number },
  b: { x1: number; y1: number; x2: number; y2: number }
): number {
  const ix1 = Math.max(a.x1, b.x1);
  const iy1 = Math.max(a.y1, b.y1);
  const ix2 = Math.min(a.x2, b.x2);
  const iy2 = Math.min(a.y2, b.y2);
  const iw = Math.max(0, ix2 - ix1);
  const ih = Math.max(0, iy2 - iy1);
  const inter = iw * ih;
  const areaA = Math.max(0, a.x2 - a.x1) * Math.max(0, a.y2 - a.y1);
  const areaB = Math.max(0, b.x2 - b.x1) * Math.max(0, b.y2 - b.y1);
  const uni = areaA + areaB - inter;
  return uni > 0 ? inter / uni : 0;
}
