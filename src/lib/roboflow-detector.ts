/**
 * Detector de Roboflow corriendo ON-DEVICE en el navegador (inferencejs / TF.js).
 *
 * No usa la API hosted (serverless) → no consume créditos: el modelo se baja una
 * vez con la PUBLISHABLE key y la inferencia corre local. Pensado para el demo de
 * EPP cuando el modelo de Roboflow soporta deploy en navegador (YOLOv8/YOLO26).
 *
 * La publishable key es PÚBLICA por diseño (segura en el cliente).
 */

import type { Prediction } from "@/lib/vision-mock";

export type RoboflowConfig = {
  modelName: string;
  version: number;
  publishableKey: string;
};

// Modelo de chalecos/EPP del usuario. La publishable key es pública (no es secreta).
export const RF_PPE_CONFIG: RoboflowConfig = {
  modelName: "safety-vest---v4",
  version: 2,
  publishableKey:
    process.env.NEXT_PUBLIC_ROBOFLOW_PUBLISHABLE_KEY || "rf_YCYD0xAkK3Xm4LyQKFbYq9QkoB03",
};

export type DetStatus = "idle" | "loading" | "ready" | "error";

// inferencejs devuelve cada detección con bbox {x,y,width,height} (centro, px),
// class y confidence. Tipamos lo que usamos de forma defensiva.
type RFPred = {
  class?: string;
  confidence?: number;
  bbox?: { x: number; y: number; width: number; height: number };
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type InferenceEngineT = {
  startWorker: (m: string, v: number, k: string) => Promise<string>;
  stopWorker: (id: string) => Promise<boolean>;
  infer: (id: string, img: unknown) => Promise<RFPred[]>;
};

export class RoboflowDetector {
  private cfg: RoboflowConfig;
  private engine: InferenceEngineT | null = null;
  private workerId: string | null = null;
  private CVImage: (new (el: HTMLVideoElement) => unknown) | null = null;
  private busy = false;

  status: DetStatus = "idle";
  errorMsg = "";

  constructor(cfg: RoboflowConfig) {
    this.cfg = cfg;
  }

  async init(): Promise<void> {
    if (this.workerId || this.status === "loading") return;
    this.status = "loading";
    try {
      const mod = await import("inferencejs");
      this.CVImage = mod.CVImage as unknown as new (el: HTMLVideoElement) => unknown;
      const engine = new mod.InferenceEngine() as unknown as InferenceEngineT;
      this.engine = engine;
      this.workerId = await engine.startWorker(
        this.cfg.modelName,
        this.cfg.version,
        this.cfg.publishableKey
      );
      this.status = "ready";
    } catch (e) {
      this.errorMsg = e instanceof Error ? e.message : String(e);
      console.error("[Roboflow] no se pudo iniciar (¿el modelo soporta navegador?)", e);
      this.status = "error";
    }
  }

  get ready() {
    return this.status === "ready" && !!this.workerId && !!this.engine;
  }

  /** Una inferencia en vuelo a la vez. Devuelve Prediction[] normalizadas. */
  async detect(video: HTMLVideoElement): Promise<Prediction[] | null> {
    if (!this.ready || this.busy || !this.engine || !this.workerId || !this.CVImage) return null;
    if (!video.videoWidth || video.readyState < 2) return null;
    this.busy = true;
    try {
      const img = new this.CVImage(video);
      const preds = await this.engine.infer(this.workerId, img);
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      return (Array.isArray(preds) ? preds : []).map((p) => {
        // bbox centro en px (puede venir como p.bbox o p.x/p.y planos)
        const cx = p.bbox?.x ?? p.x ?? 0;
        const cy = p.bbox?.y ?? p.y ?? 0;
        const w = p.bbox?.width ?? p.width ?? 0;
        const h = p.bbox?.height ?? p.height ?? 0;
        const label = p.class ?? "object";
        const violation = /\bno[-_ ]/i.test(label) || /^no/i.test(label);
        const pred: Prediction = {
          label,
          confidence: p.confidence ?? 0,
          bbox: {
            x: (cx - w / 2) / vw,
            y: (cy - h / 2) / vh,
            width: w / vw,
            height: h / vh,
          },
        };
        if (violation) pred.alarm = "violation";
        return pred;
      });
    } catch (e) {
      console.error("[Roboflow] infer falló", e);
      return [];
    } finally {
      this.busy = false;
    }
  }

  async dispose(): Promise<void> {
    try {
      if (this.engine && this.workerId) await this.engine.stopWorker(this.workerId);
    } catch {
      /* ignore */
    }
    this.engine = null;
    this.workerId = null;
    this.status = "idle";
  }
}
