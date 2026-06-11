/**
 * OCR de placas dedicado en el navegador con onnxruntime-web.
 *
 * Modelo: `fast-plate-ocr` CCT (Compact Convolutional Transformer) `cct-s-v2-global`
 * — entrenado con placas de +65 países (Latín), license permisiva. Auto-hospedado
 * en /public/models/plate. A diferencia de tesseract, está hecho para leer **el
 * recorte ya ajustado de la placa** → mucho más preciso que pasarle texto suelto.
 *
 * Specs del modelo (verificados sobre el .onnx + config YAML):
 *  - Input  `input`  **uint8** [1,64,128,3] (NHWC, **RGB**). La normalización está
 *    DENTRO del grafo → se le pasa el píxel crudo 0-255 (no /255, no float).
 *  - Output `plate`  float32 [1,10,37] = 10 slots × vocab, **ya softmax** (cada
 *    slot suma 1; el valor del ganador ES su probabilidad → NO re-softmaxear).
 *    argmax por slot sobre el alfabeto; el padding '_' sobrante se recorta. (Hay
 *    un 2º output `region` de país que ignoramos: la lista no incluye Colombia.)
 */

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_";
const PAD_CHAR = "_";
const SLOTS = 10;
const VOCAB = ALPHABET.length; // 37
const IMG_W = 128;
const IMG_H = 64;

type OrtModule = typeof import("onnxruntime-web/webgpu");
type Session = Awaited<ReturnType<OrtModule["InferenceSession"]["create"]>>;

export type OcrEngineStatus = "idle" | "loading" | "ready" | "error";

export type PlateRead = {
  /** Texto crudo leído (alfanumérico, sin padding). Aún sin normalizar a Colombia. */
  text: string;
  /** Confianza media de los caracteres no-padding (0..1). */
  confidence: number;
};

export class FastPlateOcr {
  private modelUrl: string;
  private ort: OrtModule | null = null;
  private session: Session | null = null;
  private plateOutput = "plate";
  private canvas: HTMLCanvasElement | null = null;

  status: OcrEngineStatus = "idle";
  backend: "GPU" | "CPU" = "GPU";

  constructor(modelUrl = "/models/plate/cct_s_v2_global.onnx") {
    this.modelUrl = modelUrl;
  }

  async init(): Promise<void> {
    if (this.session || this.status === "loading") return;
    this.status = "loading";
    try {
      const ort = await import("onnxruntime-web/webgpu");
      ort.env.wasm.wasmPaths = "/ort/";
      this.ort = ort;
      let session: Session;
      try {
        session = await ort.InferenceSession.create(this.modelUrl, {
          executionProviders: ["webgpu", "wasm"],
        });
        this.backend = "GPU";
      } catch {
        session = await ort.InferenceSession.create(this.modelUrl, {
          executionProviders: ["wasm"],
        });
        this.backend = "CPU";
      }
      this.session = session;
      this.plateOutput = session.outputNames.includes("plate")
        ? "plate"
        : session.outputNames[0];
      const c = document.createElement("canvas");
      c.width = IMG_W;
      c.height = IMG_H;
      this.canvas = c;
      this.status = "ready";
    } catch (e) {
      console.error("[FastPlateOcr] no se pudo cargar el modelo", this.modelUrl, e);
      this.status = "error";
    }
  }

  get ready() {
    return this.status === "ready" && !!this.session;
  }

  /** Inferencia de prueba (input uint8 en cero): confirma que corre en ORT-web. */
  async selfTest(): Promise<boolean> {
    if (!this.session || !this.ort) return false;
    try {
      const data = new Uint8Array(IMG_W * IMG_H * 3);
      const tensor = new this.ort.Tensor("uint8", data, [1, IMG_H, IMG_W, 3]);
      await this.session.run({ [this.session.inputNames[0]]: tensor } as never);
      return true;
    } catch (e) {
      console.error("[FastPlateOcr] selfTest falló (op no soportada en ORT-web)", e);
      return false;
    }
  }

  /** Lee un recorte de placa (canvas). Resize 128×64 RGB → uint8 NHWC → decode. */
  async read(plate: HTMLCanvasElement): Promise<PlateRead | null> {
    if (!this.ready || !this.session || !this.ort || !this.canvas) return null;
    const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // keep_aspect_ratio=false → resize directo a 128×64.
    ctx.drawImage(plate, 0, 0, plate.width, plate.height, 0, 0, IMG_W, IMG_H);
    const rgba = ctx.getImageData(0, 0, IMG_W, IMG_H).data;

    // uint8 NHWC RGB: [1,64,128,3].
    const data = new Uint8Array(IMG_W * IMG_H * 3);
    for (let p = 0, i = 0; i < rgba.length; i += 4, p += 3) {
      data[p] = rgba[i]; // R
      data[p + 1] = rgba[i + 1]; // G
      data[p + 2] = rgba[i + 2]; // B
    }

    try {
      const tensor = new this.ort.Tensor("uint8", data, [1, IMG_H, IMG_W, 3]);
      const feeds: Record<string, unknown> = { [this.session.inputNames[0]]: tensor };
      const out = await this.session.run(feeds as never);
      const o = out[this.plateOutput];
      return decodePlate(o.data as Float32Array);
    } catch (e) {
      console.error("[FastPlateOcr] run falló", e);
      return null;
    }
  }

  dispose() {
    this.session?.release?.();
    this.session = null;
    this.status = "idle";
    this.canvas = null;
  }
}

/**
 * Decodifica `plate` [10,37] (ya softmax) → texto + confianza. Por slot: argmax
 * sobre el alfabeto; la confianza es la probabilidad cruda del ganador (la
 * salida ya viene normalizada por slot, NO se vuelve a softmaxear).
 */
function decodePlate(probs: Float32Array): PlateRead {
  let text = "";
  let confSum = 0;
  let confN = 0;
  for (let s = 0; s < SLOTS; s++) {
    const base = s * VOCAB;
    let best = 0;
    let bestV = -Infinity;
    for (let v = 0; v < VOCAB; v++) {
      const x = probs[base + v];
      if (x > bestV) {
        bestV = x;
        best = v;
      }
    }
    const ch = ALPHABET[best] ?? PAD_CHAR;
    if (ch !== PAD_CHAR) {
      text += ch;
      confSum += bestV; // bestV ya es probabilidad (slot softmax)
      confN += 1;
    }
  }
  const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return { text: cleaned, confidence: confN ? confSum / confN : 0 };
}
