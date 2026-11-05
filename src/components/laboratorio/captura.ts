/**
 * Captura del cuadro actual con las detecciones dibujadas encima.
 * Se compone 100% en el navegador y se descarga como PNG en el equipo del
 * visitante; no se sube a ningún lado.
 */

type Opciones = {
  video: HTMLVideoElement;
  overlay: HTMLCanvasElement | null;
  /** Tamaño mostrado del escenario (CSS px). */
  ancho: number;
  alto: number;
  objectFit: "cover" | "contain";
  /** Caja donde se dibujan video y overlay (puede exceder el escenario y quedar recortada). */
  contenido?: { w: number; h: number };
  /** Línea de sello inferior (modelo, hora, detecciones). */
  sello: string;
  archivo: string;
};

export async function capturarCuadro(o: Opciones): Promise<boolean> {
  const { video, overlay, ancho, alto } = o;
  if (!video.videoWidth || !ancho || !alto) return false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const c = document.createElement("canvas");
  c.width = Math.round(ancho * dpr);
  c.height = Math.round(alto * dpr);
  const ctx = c.getContext("2d");
  if (!ctx) return false;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#020a18";
  ctx.fillRect(0, 0, ancho, alto);

  // Mismo encuadre que el <video> en pantalla (object-fit).
  const cw = o.contenido?.w ?? ancho;
  const ch = o.contenido?.h ?? alto;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const s = o.objectFit === "contain" ? Math.min(cw / vw, ch / vh) : Math.max(cw / vw, ch / vh);
  const dw = vw * s;
  const dh = vh * s;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, cw, ch);
  ctx.clip();
  ctx.drawImage(video, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  ctx.restore();
  if (overlay && overlay.width) ctx.drawImage(overlay, 0, 0, cw, ch);

  // Sello tipo CCTV.
  ctx.fillStyle = "rgba(2,10,24,0.82)";
  ctx.fillRect(0, alto - 26, ancho, 26);
  ctx.fillStyle = "rgb(107,138,255)";
  ctx.fillRect(0, alto - 26, 4, 26);
  ctx.font = "bold 11px ui-monospace, monospace";
  ctx.fillStyle = "rgba(213,224,255,0.95)";
  ctx.fillText(o.sello, 12, alto - 9);

  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = o.archivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

/** "2026-11-04 22:31:07" en hora local. */
export function marcaTiempo(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
