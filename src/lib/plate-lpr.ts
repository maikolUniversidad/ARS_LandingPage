/**
 * Orquestador de LPR (lectura de placas) en el navegador — el pipeline ANPR
 * completo, license-clean, 100% client-side:
 *
 *   auto (MediaPipe) → DETECTAR placa (YOLOv9 ONNX) → recortar ajustado →
 *   OCR (fast-plate-ocr CCT ONNX) → normalizar a patrón Colombia → VOTO temporal
 *
 * El salto de calidad vs. el OCR anterior está en la **localización**: antes se
 * le pasaba "medio auto" a tesseract; ahora un detector dedicado recorta solo la
 * placa y un OCR entrenado en placas la lee. Si los modelos ONNX no cargan
 * (red/CSP/WebGPU), cae con elegancia al motor tesseract de
 * [plate-ocr.ts](./plate-ocr.ts) — misma API pública, el overlay no cambia.
 *
 * Liviano: el detector corre throttled (~1 cada 0.45 s) con una sola inferencia
 * en vuelo; por ciclo se leen como máx. las placas más grandes del cuadro.
 */

import type { Prediction } from "@/lib/vision-mock";
import { PlateDetector, cropPlate, type PlateBox } from "@/lib/plate-detector";
import { FastPlateOcr } from "@/lib/fast-plate-ocr";
import { PlateOcrController, type OcrStatus } from "@/lib/plate-ocr";
import { consensus, normalizePlate } from "@/lib/plate-postprocess";

export type { OcrStatus };

const THROTTLE_MS = 450;
const PRUNE_MS = 6000;
const MIN_READS = 2; // el OCR dedicado es preciso → confirma con 2 lecturas
const KEEP_READS = 12;
const MAX_PLATES = 3; // placas leídas por ciclo (las más grandes)
const MIN_OCR_CONF = 0.5; // confianza mínima del OCR por lectura
const MIN_CONSENSUS = 60; // % de acuerdo para confirmar (verde)
const FRAME_KEY = "_frame";

type Entry = { reads: string[]; ts: number };
type Raw = { raw: string; ts: number };
type Mode = "pending" | "onnx" | "tesseract";

export class PlateLprController {
  private detector = new PlateDetector();
  private ocr = new FastPlateOcr();
  private tess: PlateOcrController | null = null;
  private mode: Mode = "pending";
  private initing = false;
  private busy = false;
  private lastTry = 0;
  private cache = new Map<string, Entry>();
  private raws = new Map<string, Raw>();

  status: OcrStatus = "idle";
  progress = 0;
  ready = false;

  /** Etiqueta del motor activo para el HUD ("ONNX·GPU" / "tesseract"). */
  get engineLabel(): string {
    if (this.mode === "onnx") return `ONNX·${this.detector.backend}`;
    if (this.mode === "tesseract") return "tesseract";
    return "…";
  }

  async init(): Promise<void> {
    if (this.ready || this.initing) return;
    this.initing = true;
    this.status = "loading";
    try {
      await Promise.all([this.detector.init(), this.ocr.init()]);
      // Confirmar que los grafos corren de verdad en ORT-web (no solo que cargan).
      const runs =
        this.detector.ready &&
        this.ocr.ready &&
        (await this.detector.selfTest()) &&
        (await this.ocr.selfTest());
      if (runs) {
        this.mode = "onnx";
        this.ready = true;
        this.progress = 100;
        this.status = "ready";
      } else {
        await this.fallbackToTesseract();
      }
    } catch (e) {
      console.error("[PlateLpr] init ONNX falló, usando tesseract", e);
      await this.fallbackToTesseract();
    } finally {
      this.initing = false;
    }
  }

  private async fallbackToTesseract(): Promise<void> {
    this.detector.dispose();
    this.ocr.dispose();
    this.mode = "tesseract";
    const tess = new PlateOcrController();
    this.tess = tess;
    await tess.init();
    this.status = tess.status;
    this.progress = tess.progress;
    this.ready = tess.ready;
  }

  /**
   * Corre el pipeline sobre el frame actual. `vehicles` son las cajas de auto de
   * MediaPipe (para asociar cada placa a su vehículo y mostrar el texto debajo).
   */
  process(video: HTMLVideoElement, vehicles: Prediction[], now: number): void {
    if (this.mode === "tesseract") {
      const tess = this.tess;
      if (!tess) return;
      if (vehicles.length > 0) for (const p of vehicles) tess.schedule(video, p, now);
      else tess.scheduleFrame(video, now);
      tess.prune(now);
      this.status = tess.status;
      this.progress = tess.progress;
      return;
    }
    if (this.mode !== "onnx" || this.busy) return;
    if (now - this.lastTry < THROTTLE_MS) return;
    this.lastTry = now;
    this.busy = true;
    void this.runOnnx(video, vehicles, now).finally(() => {
      this.busy = false;
    });
    this.prune(now);
  }

  private async runOnnx(video: HTMLVideoElement, vehicles: Prediction[], now: number): Promise<void> {
    const boxes = await this.detector.detect(video);
    if (!boxes || boxes.length === 0) return;
    // Leer las placas más grandes primero (las legibles).
    boxes.sort((a, b) => b.width * b.height - a.width * a.height);
    let bestArea = 0;
    let bestRaw: string | null = null;
    let bestPlate: string | null = null;
    for (const box of boxes.slice(0, MAX_PLATES)) {
      const crop = cropPlate(video, box);
      if (!crop) continue;
      const read = await this.ocr.read(crop);
      if (!read || !read.text) continue;
      const key = associate(box, vehicles);
      this.raws.set(key, { raw: read.text, ts: now });
      const plate = read.confidence >= MIN_OCR_CONF ? normalizePlate(read.text) : null;
      if (plate) this.pushRead(key, plate, now);
      const area = box.width * box.height;
      if (area > bestArea) {
        bestArea = area;
        bestRaw = read.text;
        bestPlate = plate;
      }
    }
    // Espejo de la placa más prominente bajo "_frame" (banner sin vehículo).
    if (bestRaw) {
      this.raws.set(FRAME_KEY, { raw: bestRaw, ts: now });
      if (bestPlate) this.pushRead(FRAME_KEY, bestPlate, now);
    }
  }

  private pushRead(key: string, plate: string, now: number): void {
    const e = this.cache.get(key) ?? { reads: [], ts: now };
    e.reads.push(plate);
    if (e.reads.length > KEEP_READS) e.reads.shift();
    e.ts = now;
    this.cache.set(key, e);
  }

  /** Placa CONFIRMADA (consenso) + % de acuerdo, o undefined. */
  plateFor(trackId?: string): string | undefined {
    if (this.mode === "tesseract") return this.tess?.plateFor(trackId);
    if (!trackId) return undefined;
    const e = this.cache.get(trackId);
    if (!e || e.reads.length < MIN_READS) return undefined;
    const c = consensus(e.reads);
    if (!c || c.confidence < MIN_CONSENSUS) return undefined;
    return `${c.text} · ${c.confidence}%`;
  }

  /** Lectura tentativa / escaneando, para mostrar progreso. */
  scanLabel(trackId?: string): string | undefined {
    if (this.mode === "tesseract") return this.tess?.scanLabel(trackId);
    if (!trackId || !this.ready) return undefined;
    const e = this.cache.get(trackId);
    if (e && e.reads.length > 0) {
      const c = consensus(e.reads);
      if (c) return `⟳ ${c.text} (${e.reads.length})`;
    }
    const r = this.raws.get(trackId);
    if (r && r.raw) return `⟳ ${r.raw.slice(0, 8)}`;
    return "⟳ leyendo placa…";
  }

  prune(now: number): void {
    if (this.mode === "tesseract") {
      this.tess?.prune(now);
      return;
    }
    for (const [id, e] of this.cache) if (now - e.ts > PRUNE_MS) this.cache.delete(id);
    for (const [id, r] of this.raws) if (now - r.ts > PRUNE_MS) this.raws.delete(id);
  }

  async dispose(): Promise<void> {
    this.detector.dispose();
    this.ocr.dispose();
    await this.tess?.dispose();
    this.tess = null;
    this.mode = "pending";
    this.ready = false;
    this.status = "idle";
    this.cache.clear();
    this.raws.clear();
  }
}

// ─────────────── Asociación placa → vehículo ───────────────

/** Centro de la placa → trackId del auto que la contiene (o el más cercano), o bucket de posición. */
function associate(box: PlateBox, vehicles: Prediction[]): string {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  let nearest: string | undefined;
  let nearestD = 0.25; // umbral de cercanía (frac. del frame)
  for (const v of vehicles) {
    if (!v.trackId) continue;
    const b = v.bbox;
    const inside = cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height;
    if (inside) return v.trackId;
    const vcx = b.x + b.width / 2;
    const vcy = b.y + b.height / 2;
    const d = Math.hypot(vcx - cx, vcy - cy);
    if (d < nearestD) {
      nearestD = d;
      nearest = v.trackId;
    }
  }
  if (nearest) return nearest;
  // Sin vehículo cercano: bucket de posición estable entre frames (voto temporal).
  return `_p:${Math.round(cx * 16)}:${Math.round(cy * 16)}`;
}
