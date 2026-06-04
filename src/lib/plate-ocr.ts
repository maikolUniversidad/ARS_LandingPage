/**
 * OCR de placas 100% en navegador con tesseract.js (Apache-2.0, license-clean).
 *
 * Toma el bbox del vehículo que ya detecta MediaPipe, recorta la región inferior
 * (donde va la placa), la preprocesa (gris + Otsu) y la pasa a tesseract con
 * whitelist A-Z0-9. Valida contra patrón de placa de Colombia (carro ABC123 /
 * moto ABC12D) y — clave para precisión — **acumula varias lecturas y vota por
 * carácter**: cada posición se decide por mayoría, así un error aislado (U↔V,
 * 0↔O) queda en minoría. Confirma solo con ≥3 lecturas y muestra % de acuerdo.
 *
 * Diseño liviano: 1 OCR cada ~0.7 s por vehículo, una sola inferencia en vuelo,
 * en el worker propio de tesseract. `status`/`progress` para la descarga inicial.
 */

import type { Prediction } from "@/lib/vision-mock";
import type { Worker } from "tesseract.js";

const THROTTLE_MS = 700; // más rápido → junta votos antes
const PRUNE_MS = 6000;
const MIN_READS = 3; // lecturas válidas para confirmar
const KEEP_READS = 14; // historial por track para el voto
const PLATE_LEN = 6;

type Entry = { reads: string[]; ts: number };
type Raw = { raw: string; ts: number };

export type OcrStatus = "idle" | "loading" | "ready" | "error";

export class PlateOcrController {
  private worker: Worker | null = null;
  private initing = false;
  private busy = false;
  private cache = new Map<string, Entry>();
  private raws = new Map<string, Raw>();
  private lastTry = new Map<string, number>();

  status: OcrStatus = "idle";
  progress = 0;
  ready = false;

  async init(): Promise<void> {
    if (this.ready || this.initing) return;
    this.initing = true;
    this.status = "loading";
    try {
      const Tesseract = await import("tesseract.js");
      // Modelos auto-hospedados en /public/tesseract (postinstall). Sin CDN externo.
      const worker = await Tesseract.createWorker("eng", undefined, {
        workerPath: "/tesseract/worker.min.js",
        corePath: "/tesseract",
        langPath: "/tesseract",
        logger: (m: { status?: string; progress?: number }) => {
          if (typeof m.progress === "number") {
            this.progress = Math.max(this.progress, Math.round(m.progress * 100));
          }
        },
      });
      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
      });
      this.worker = worker;
      this.ready = true;
      this.progress = 100;
      this.status = "ready";
    } catch (e) {
      console.error("[PlateOcr] no se pudo iniciar tesseract", e);
      this.status = "error";
    } finally {
      this.initing = false;
    }
  }

  /** Placa CONFIRMADA (consenso) + % de acuerdo, o undefined. */
  plateFor(trackId?: string): string | undefined {
    if (!trackId) return undefined;
    const e = this.cache.get(trackId);
    if (!e || e.reads.length < MIN_READS) return undefined;
    const c = consensus(e.reads);
    if (!c || c.confidence < 60) return undefined; // dudoso → sigue como tentativa
    return `${c.text} · ${c.confidence}%`;
  }

  /** Lectura tentativa / escaneando, para mostrar progreso. */
  scanLabel(trackId?: string): string | undefined {
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

  /** OCR sobre el vehículo (mitad inferior del bbox). */
  schedule(video: HTMLVideoElement, pred: Prediction, now: number): void {
    const id = pred.trackId;
    if (!id) return;
    const b = pred.bbox;
    this.scan(video, id, b.x, b.y + b.height * 0.4, b.width, b.height * 0.6, now);
  }

  /** OCR sobre una banda central del frame (probar sin auto: acercá una placa). */
  scheduleFrame(video: HTMLVideoElement, now: number): void {
    this.scan(video, "_frame", 0.1, 0.28, 0.8, 0.46, now);
  }

  private scan(
    video: HTMLVideoElement,
    id: string,
    nx: number,
    ny: number,
    nw: number,
    nh: number,
    now: number
  ): void {
    if (!this.ready || this.busy || !this.worker) return;
    const last = this.lastTry.get(id) ?? 0;
    if (now - last < THROTTLE_MS) return;
    const canvas = cropAndEnhance(video, nx, ny, nw, nh);
    if (!canvas) return;
    this.lastTry.set(id, now);
    this.busy = true;
    void this.run(id, canvas, now);
  }

  private async run(id: string, canvas: HTMLCanvasElement, now: number): Promise<void> {
    try {
      if (!this.worker) return;
      const { data } = await this.worker.recognize(canvas);
      const cleaned = (data.text ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (cleaned) this.raws.set(id, { raw: cleaned, ts: now });
      const plate = normalizePlate(cleaned);
      if (process.env.NODE_ENV !== "production") {
        console.debug("[PlateOcr]", id, "raw:", JSON.stringify(data.text), "→", plate);
      }
      if (plate) {
        const e = this.cache.get(id) ?? { reads: [], ts: now };
        e.reads.push(plate);
        if (e.reads.length > KEEP_READS) e.reads.shift();
        e.ts = now;
        this.cache.set(id, e);
      }
    } catch (e) {
      console.error("[PlateOcr] recognize falló", e);
    } finally {
      this.busy = false;
    }
  }

  prune(now: number): void {
    for (const [id, e] of this.cache) if (now - e.ts > PRUNE_MS) this.cache.delete(id);
    for (const [id, r] of this.raws) if (now - r.ts > PRUNE_MS) this.raws.delete(id);
  }

  async dispose(): Promise<void> {
    try {
      await this.worker?.terminate();
    } catch {
      /* ignore */
    }
    this.worker = null;
    this.ready = false;
    this.status = "idle";
    this.cache.clear();
    this.raws.clear();
    this.lastTry.clear();
  }
}

// ─────────────── Voto por carácter ───────────────

/** Consenso por posición sobre lecturas válidas (6 chars). Devuelve texto + % de acuerdo. */
function consensus(reads: string[]): { text: string; confidence: number } | null {
  const valid = reads.filter((r) => r.length === PLATE_LEN);
  if (!valid.length) return null;
  let text = "";
  let agree = 0;
  for (let i = 0; i < PLATE_LEN; i++) {
    const tally: Record<string, number> = {};
    for (const r of valid) tally[r[i]] = (tally[r[i]] ?? 0) + 1;
    let best = "";
    let bestC = 0;
    for (const ch in tally) if (tally[ch] > bestC) [best, bestC] = [ch, tally[ch]];
    text += best;
    agree += bestC;
  }
  const confidence = Math.round((agree / (valid.length * PLATE_LEN)) * 100);
  return { text, confidence };
}

// ─────────────── Preproceso del recorte ───────────────

/** Recorta una región normalizada [0..1] del video, escala y binariza (Otsu). */
function cropAndEnhance(
  video: HTMLVideoElement,
  nx: number,
  ny: number,
  nw: number,
  nh: number
): HTMLCanvasElement | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  let sx = nx * vw;
  let sy = ny * vh;
  let sw = nw * vw;
  let sh = nh * vh;
  sx = Math.max(0, sx);
  sy = Math.max(0, sy);
  sw = Math.min(sw, vw - sx);
  sh = Math.min(sh, vh - sy);
  if (sw < 24 || sh < 12) return null;

  // Escalar fuerte: placas chicas necesitan resolución para OCR.
  const targetW = 640;
  const scale = Math.max(2, targetW / sw);
  const cw = Math.round(sw * scale);
  const ch = Math.round(sh * scale);

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);

  const img = ctx.getImageData(0, 0, cw, ch);
  const d = img.data;

  // Gris + histograma.
  const hist = new Array<number>(256).fill(0);
  const gray = new Uint8Array(cw * ch);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const g = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) | 0;
    gray[p] = g;
    hist[g]++;
  }

  // Umbral de Otsu (maximiza varianza entre clases).
  const total = cw * ch;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0;
  let wB = 0;
  let maxVar = -1;
  let thr = 127;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maxVar) {
      maxVar = between;
      thr = t;
    }
  }

  // ¿Texto oscuro sobre fondo claro? (mayoría de píxeles claros) → texto = negro.
  let darkCount = 0;
  for (let p = 0; p < total; p++) if (gray[p] <= thr) darkCount++;
  const textIsDark = darkCount < total / 2;

  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const on = gray[p] <= thr; // true = lado oscuro
    // queremos texto NEGRO sobre fondo BLANCO
    const v = on === textIsDark ? 0 : 255;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// ─────────────── Validación de patrón ───────────────

const TO_LETTER: Record<string, string> = { "0": "O", "1": "I", "5": "S", "8": "B", "2": "Z", "6": "G" };
const TO_DIGIT: Record<string, string> = {
  O: "0", Q: "0", D: "0", I: "1", L: "1", S: "5", B: "8", Z: "2", G: "6", A: "4",
};
const L = (c: string) => TO_LETTER[c] ?? c;
const N = (c: string) => TO_DIGIT[c] ?? c;

/** Encaja el texto OCR en un patrón de placa de Colombia (carro LLL DDD / moto LLL DD L). */
function normalizePlate(cleaned: string): string | null {
  const c = cleaned.toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (let i = 0; i + 6 <= c.length; i++) {
    const w = c.slice(i, i + 6);
    const car = L(w[0]) + L(w[1]) + L(w[2]) + N(w[3]) + N(w[4]) + N(w[5]);
    if (/^[A-Z]{3}[0-9]{3}$/.test(car)) return car;
    const moto = L(w[0]) + L(w[1]) + L(w[2]) + N(w[3]) + N(w[4]) + L(w[5]);
    if (/^[A-Z]{3}[0-9]{2}[A-Z]$/.test(moto)) return moto;
  }
  return null;
}
