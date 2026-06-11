/**
 * Detector de PLACAS en el navegador con onnxruntime-web.
 *
 * Modelo: `open-image-models` YOLOv9-t end2end (MIT, license-clean), exportado a
 * ONNX. Auto-hospedado en /public/models/plate. Localiza la placa dentro del
 * frame para recortarla ajustada antes del OCR — es la etapa que faltaba (sin
 * ella el OCR recibía "medio auto" y leía mal).
 *
 * Specs del modelo (verificados sobre el .onnx):
 *  - Input  `images`  float32 [1,3,512,512], RGB, normalizado a 0..1 (div 255),
 *    NCHW, letterbox centrado (padding gris 114). Distinto a YOLOX (BGR, 0-255).
 *  - Output `output0` float32 [N,7] = [batch, x1, y1, x2, y2, cls, score], con
 *    **NMS embebido** (end2end, ops estándar ONNX) → no hace falta NMS acá. Las
 *    coords están en px del input 512 (letterbox) → se deshace padding + ratio.
 */

type OrtModule = typeof import("onnxruntime-web/webgpu");
type Session = Awaited<ReturnType<OrtModule["InferenceSession"]["create"]>>;

export type DetStatus = "idle" | "loading" | "ready" | "error";

/** Caja de placa normalizada [0..1] respecto al frame de video. */
export type PlateBox = { x: number; y: number; width: number; height: number; score: number };

const INPUT_SIZE = 512;
const PAD = 114;

export class PlateDetector {
  private modelUrl: string;
  private conf: number;
  private ort: OrtModule | null = null;
  private session: Session | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private busy = false;

  status: DetStatus = "idle";
  backend: "GPU" | "CPU" = "GPU";

  constructor(modelUrl = "/models/plate/yolo-v9-t-512-plate.onnx", conf = 0.4) {
    this.modelUrl = modelUrl;
    this.conf = conf;
  }

  async init(): Promise<void> {
    if (this.session || this.status === "loading") return;
    this.status = "loading";
    try {
      const ort = await import("onnxruntime-web/webgpu");
      ort.env.wasm.wasmPaths = "/ort/"; // wasm auto-hospedado (postinstall)
      this.ort = ort;
      let session: Session;
      try {
        session = await ort.InferenceSession.create(this.modelUrl, {
          executionProviders: ["webgpu", "wasm"],
        });
        this.backend = "GPU";
      } catch {
        // El grafo end2end (NMS) puede no correr entero en WebGPU → WASM puro.
        session = await ort.InferenceSession.create(this.modelUrl, {
          executionProviders: ["wasm"],
        });
        this.backend = "CPU";
      }
      this.session = session;
      const c = document.createElement("canvas");
      c.width = INPUT_SIZE;
      c.height = INPUT_SIZE;
      this.canvas = c;
      this.status = "ready";
    } catch (e) {
      console.error("[PlateDetector] no se pudo cargar el modelo", this.modelUrl, e);
      this.status = "error";
    }
  }

  get ready() {
    return this.status === "ready" && !!this.session;
  }

  /**
   * Inferencia de prueba sobre input en cero: confirma que el grafo (incl. NMS
   * end2end) corre de verdad en onnxruntime-web. Si tira (op no soportada), el
   * orquestador cae a tesseract. También "calienta" la sesión (1ª inferencia).
   */
  async selfTest(): Promise<boolean> {
    if (!this.session || !this.ort) return false;
    try {
      const area = INPUT_SIZE * INPUT_SIZE;
      const input = new Float32Array(3 * area);
      const tensor = new this.ort.Tensor("float32", input, [1, 3, INPUT_SIZE, INPUT_SIZE]);
      await this.session.run({ [this.session.inputNames[0]]: tensor } as never);
      return true;
    } catch (e) {
      console.error("[PlateDetector] selfTest falló (op no soportada en ORT-web)", e);
      return false;
    }
  }

  /** Una inferencia en vuelo a la vez. Devuelve cajas de placa normalizadas [0..1]. */
  async detect(video: HTMLVideoElement): Promise<PlateBox[] | null> {
    if (!this.ready || this.busy || !this.session || !this.ort || !this.canvas) return null;
    if (!video.videoWidth || video.readyState < 2) return null;
    this.busy = true;
    try {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      // Letterbox CENTRADO (como el preprocess de open-image-models).
      const r = Math.min(INPUT_SIZE / vw, INPUT_SIZE / vh);
      const newW = Math.round(vw * r);
      const newH = Math.round(vh * r);
      const dw = (INPUT_SIZE - newW) / 2;
      const dh = (INPUT_SIZE - newH) / 2;

      const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.fillStyle = `rgb(${PAD},${PAD},${PAD})`;
      ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(video, 0, 0, vw, vh, dw, dh, newW, newH);
      const img = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data;

      // NCHW, RGB, normalizado /255.
      const area = INPUT_SIZE * INPUT_SIZE;
      const input = new Float32Array(3 * area);
      for (let p = 0, i = 0; p < area; p++, i += 4) {
        input[p] = img[i] / 255; // R
        input[area + p] = img[i + 1] / 255; // G
        input[2 * area + p] = img[i + 2] / 255; // B
      }

      const tensor = new this.ort.Tensor("float32", input, [1, 3, INPUT_SIZE, INPUT_SIZE]);
      const feeds: Record<string, unknown> = { [this.session.inputNames[0]]: tensor };
      const out = await this.session.run(feeds as never);
      const o = out[this.session.outputNames[0]];
      return this.decode(o.data as Float32Array, o.dims as number[], { r, dw, dh, vw, vh });
    } catch (e) {
      console.error("[PlateDetector] run falló", e);
      return [];
    } finally {
      this.busy = false;
    }
  }

  /** Decodifica [N,7] = [batch, x1,y1,x2,y2, cls, score] (px del input 512) → cajas norm. */
  private decode(
    d: Float32Array,
    dims: number[],
    geo: { r: number; dw: number; dh: number; vw: number; vh: number }
  ): PlateBox[] {
    const { r, dw, dh, vw, vh } = geo;
    // Salida [N,7] (o aplanada). Tomamos el último eje como 7 atributos.
    const stride = 7;
    const n = dims.length >= 2 ? dims[dims.length - 2] : Math.floor(d.length / stride);
    const out: PlateBox[] = [];
    for (let i = 0; i < n; i++) {
      const b = i * stride;
      const score = d[b + 6];
      if (!(score > this.conf)) continue;
      // px del input 512 → px del frame original (deshacer letterbox centrado).
      const x1 = (d[b + 1] - dw) / r;
      const y1 = (d[b + 2] - dh) / r;
      const x2 = (d[b + 3] - dw) / r;
      const y2 = (d[b + 4] - dh) / r;
      const nx = Math.max(0, Math.min(1, x1 / vw));
      const ny = Math.max(0, Math.min(1, y1 / vh));
      const nx2 = Math.max(0, Math.min(1, x2 / vw));
      const ny2 = Math.max(0, Math.min(1, y2 / vh));
      const w = nx2 - nx;
      const h = ny2 - ny;
      if (w <= 0 || h <= 0) continue;
      out.push({ x: nx, y: ny, width: w, height: h, score });
    }
    return out;
  }

  dispose() {
    this.session?.release?.();
    this.session = null;
    this.status = "idle";
    this.canvas = null;
  }
}

/** Recorta una caja de placa (con margen) del video a un canvas, a resolución plena. */
export function cropPlate(
  video: HTMLVideoElement,
  box: PlateBox,
  marginX = 0.08,
  marginY = 0.18
): HTMLCanvasElement | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;
  const mx = box.width * marginX;
  const my = box.height * marginY;
  let sx = (box.x - mx) * vw;
  let sy = (box.y - my) * vh;
  let sw = (box.width + 2 * mx) * vw;
  let sh = (box.height + 2 * my) * vh;
  sx = Math.max(0, sx);
  sy = Math.max(0, sy);
  sw = Math.min(sw, vw - sx);
  sh = Math.min(sh, vh - sy);
  if (sw < 8 || sh < 6) return null;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}
