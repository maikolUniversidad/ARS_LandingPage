"use client";

/**
 * Preparación de adjuntos en el navegador para la entrevista: clasifica el
 * archivo, reduce imágenes grandes y extrae fotogramas JPEG de los videos
 * (<video> + canvas), respetando ~4 MB por petición.
 */
import type { TipoAdjunto } from "@/data/diagnostico/tipos";

/** Tope por petición (Vercel admite 4.5 MB; dejamos margen para el multipart). */
export const MAX_PETICION = 3_800_000;
/** Videos más pesados que esto no se pueden ni muestrear con holgura. */
const MAX_VIDEO_LOCAL = 400_000_000;
const LADO_IMAGEN = 1600;
const LADO_FOTOGRAMA = 768;

export const ACEPTA = {
  imagen: "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif",
  video: "video/mp4,video/quicktime,video/webm,.mov,.mp4,.webm,.m4v",
  documento:
    ".pdf,.txt,.csv,.md,.json,.xlsx,.xls,.docx,.doc,application/pdf,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;
export const ACEPTA_TODO = `${ACEPTA.imagen},${ACEPTA.video},${ACEPTA.documento}`;

const EXT_DOC = /\.(pdf|txt|csv|md|json|xlsx?|docx?)$/i;

export function tipoDe(f: File): TipoAdjunto | null {
  if (f.type.startsWith("image/") || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name)) return "imagen";
  if (f.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(f.name)) return "video";
  if (f.type.startsWith("audio/")) return "audio";
  if (EXT_DOC.test(f.name) || f.type === "application/pdf" || f.type.startsWith("text/")) return "documento";
  return null;
}

export function formatoBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const aBlob = (c: HTMLCanvasElement, calidad: number) =>
  new Promise<Blob>((ok, mal) => c.toBlob((b) => (b ? ok(b) : mal(new Error("blob"))), "image/jpeg", calidad));

/** Reduce una imagen grande a JPEG (lado mayor 1600 px). Si no se puede decodificar (HEIC), la deja igual. */
export async function reducirImagen(f: File): Promise<File> {
  if (f.size < 1_200_000 && !/heic|heif/i.test(f.type)) return f;
  try {
    const bmp = await createImageBitmap(f);
    const escala = Math.min(1, LADO_IMAGEN / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * escala);
    c.height = Math.round(bmp.height * escala);
    c.getContext("2d")?.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close();
    const blob = await aBlob(c, 0.85);
    return new File([blob], f.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return f;
  }
}

function esperar(v: HTMLVideoElement, ev: "loadedmetadata" | "loadeddata" | "seeked", ms = 8000) {
  return new Promise<void>((ok, mal) => {
    const t = window.setTimeout(() => mal(new Error(ev)), ms);
    v.addEventListener(ev, () => (window.clearTimeout(t), ok()), { once: true });
    v.addEventListener("error", () => (window.clearTimeout(t), mal(new Error("video"))), { once: true });
  });
}

/** Extrae 3–6 fotogramas JPEG repartidos en el video. El primero sirve de miniatura. */
export async function extraerFotogramas(f: File, alProgreso?: (hechos: number, total: number) => void): Promise<Blob[]> {
  if (f.size > MAX_VIDEO_LOCAL) throw new Error("grande");
  const url = URL.createObjectURL(f);
  const v = document.createElement("video");
  v.muted = true;
  v.playsInline = true;
  v.preload = "auto";
  v.src = url;
  try {
    await esperar(v, "loadedmetadata");
    if (v.readyState < 2) await esperar(v, "loadeddata").catch(() => undefined);
    const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 0;
    if (!dur || !v.videoWidth) throw new Error("video");
    const n = Math.max(3, Math.min(6, Math.ceil(dur / 4)));
    const escala = Math.min(1, LADO_FOTOGRAMA / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * escala);
    c.height = Math.round(v.videoHeight * escala);
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("canvas");
    const out: Blob[] = [];
    for (let i = 0; i < n; i++) {
      v.currentTime = Math.min(dur - 0.05, (dur * (i + 0.5)) / n);
      await esperar(v, "seeked");
      ctx.drawImage(v, 0, 0, c.width, c.height);
      out.push(await aBlob(c, 0.75));
      alProgreso?.(i + 1, n);
    }
    return out;
  } finally {
    v.removeAttribute("src");
    v.load();
    URL.revokeObjectURL(url);
  }
}
