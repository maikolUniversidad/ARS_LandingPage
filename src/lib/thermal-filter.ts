/**
 * Filtro de VISIÓN TÉRMICA en el navegador (sin modelo, 100% canvas).
 *
 * Toma el frame del <video>, calcula la luminancia por píxel y la mapea a una
 * paleta "ironbow" (negro→púrpura→rojo→naranja→amarillo→blanco). Aplica
 * auto-ganancia (estira el rango de luminancia del frame, como hacen las cámaras
 * térmicas reales) para que el "calor" resalte aunque la escena sea plana.
 *
 * Se samplea a baja resolución (rápido + estética auténtica de cámara térmica) y
 * se reescala suavizado sobre el canvas del overlay.
 */

type FitMap = { ox: number; oy: number; dw: number; dh: number };

// Paleta ironbow/inferno: stops (luminancia 0..1 → RGB), interpolados a 256.
const STOPS: Array<[number, [number, number, number]]> = [
  [0.0, [0, 0, 4]],
  [0.12, [22, 0, 75]],
  [0.28, [85, 15, 109]],
  [0.45, [165, 44, 96]],
  [0.6, [221, 81, 58]],
  [0.75, [243, 144, 24]],
  [0.88, [250, 206, 60]],
  [1.0, [252, 255, 220]],
];

function buildLUT(): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = STOPS[0];
    let b = STOPS[STOPS.length - 1];
    for (let s = 0; s < STOPS.length - 1; s++) {
      if (t >= STOPS[s][0] && t <= STOPS[s + 1][0]) {
        a = STOPS[s];
        b = STOPS[s + 1];
        break;
      }
    }
    const span = b[0] - a[0] || 1;
    const f = (t - a[0]) / span;
    lut[i * 3] = a[1][0] + (b[1][0] - a[1][0]) * f;
    lut[i * 3 + 1] = a[1][1] + (b[1][1] - a[1][1]) * f;
    lut[i * 3 + 2] = a[1][2] + (b[1][2] - a[1][2]) * f;
  }
  return lut;
}

export class ThermalFilter {
  private lut = buildLUT();
  private off: HTMLCanvasElement | null = null;
  private offCtx: CanvasRenderingContext2D | null = null;
  private sampleW = 360; // baja-res: rápido + look auténtico
  // Min/max de luminancia suavizados entre frames (evita parpadeo de la auto-ganancia).
  private emaMin = 0;
  private emaMax = 255;
  private primed = false;

  private ensureOffscreen(w: number, h: number) {
    if (!this.off) {
      this.off = document.createElement("canvas");
      this.offCtx = this.off.getContext("2d", { willReadFrequently: true });
    }
    if (this.off.width !== w || this.off.height !== h) {
      this.off.width = w;
      this.off.height = h;
    }
  }

  /** Renderiza el video en modo térmico sobre ctx, dentro del rect del fit-map. */
  render(
    video: HTMLVideoElement,
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    map: FitMap
  ): void {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;
    const sw = this.sampleW;
    const sh = Math.max(1, Math.round((sw * vh) / vw));
    this.ensureOffscreen(sw, sh);
    const offCtx = this.offCtx;
    if (!offCtx) return;

    offCtx.drawImage(video, 0, 0, sw, sh);
    const img = offCtx.getImageData(0, 0, sw, sh);
    const d = img.data;
    const n = d.length;

    // 1ª pasada: luminancia + min/max para la auto-ganancia.
    const lumas = new Uint8Array(n >> 2);
    let mn = 255;
    let mx = 0;
    for (let i = 0, j = 0; i < n; i += 4, j++) {
      let l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
      if (l > 255) l = 255;
      lumas[j] = l;
      if (l < mn) mn = l;
      if (l > mx) mx = l;
    }
    // Suavizado temporal del rango (EMA) para que no titile.
    if (!this.primed) {
      this.emaMin = mn;
      this.emaMax = mx;
      this.primed = true;
    } else {
      this.emaMin += (mn - this.emaMin) * 0.1;
      this.emaMax += (mx - this.emaMax) * 0.1;
    }
    const lo = this.emaMin;
    const range = Math.max(8, this.emaMax - lo); // evita dividir por ~0 en escenas planas

    // 2ª pasada: normalizar al rango y mapear por la LUT térmica.
    const lut = this.lut;
    for (let i = 0, j = 0; i < n; i += 4, j++) {
      let v = ((lumas[j] - lo) * 255) / range;
      if (v < 0) v = 0;
      else if (v > 255) v = 255;
      const o = (v | 0) * 3;
      d[i] = lut[o];
      d[i + 1] = lut[o + 1];
      d[i + 2] = lut[o + 2];
    }
    offCtx.putImageData(img, 0, 0);

    // Reescalar suavizado sobre el canvas visible.
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.off as HTMLCanvasElement, map.ox, map.oy, map.dw, map.dh);

    // Viñeta sutil (refuerza la estética de visor térmico).
    const g = ctx.createRadialGradient(
      canvasW / 2,
      canvasH / 2,
      Math.min(canvasW, canvasH) * 0.3,
      canvasW / 2,
      canvasH / 2,
      Math.max(canvasW, canvasH) * 0.75
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  reset() {
    this.primed = false;
    this.emaMin = 0;
    this.emaMax = 255;
  }
}
