"use client";

import { LIMITES, TIPOS_IMAGEN, type DocumentoAdjunto } from "./tipos";

export type ErrorAdjunto = "tipo" | "grande" | "max";

const TEXTO_EXT = /\.(txt|md|markdown|csv|json|log|tsv|xml|html?)$/i;

const uid = () => Math.random().toString(36).slice(2, 10);

function aBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const paso = 0x8000;
  for (let i = 0; i < bytes.length; i += paso) bin += String.fromCharCode(...bytes.subarray(i, i + paso));
  return btoa(bin);
}

/** Redimensiona imágenes grandes (lado mayor 1568 px) y las pasa a JPEG/PNG. */
async function prepararImagen(file: File): Promise<{ datos: string; tipo: string; bytes: number }> {
  if (file.type === "image/gif") {
    const buf = await file.arrayBuffer();
    return { datos: aBase64(buf), tipo: "image/gif", bytes: buf.byteLength };
  }
  const bmp = await createImageBitmap(file);
  const escala = Math.min(1, LIMITES.imagenLado / Math.max(bmp.width, bmp.height));
  if (escala === 1 && file.size < 900_000) {
    bmp.close();
    const buf = await file.arrayBuffer();
    return { datos: aBase64(buf), tipo: file.type, bytes: buf.byteLength };
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const tipo = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((ok, mal) =>
    canvas.toBlob((b) => (b ? ok(b) : mal(new Error("blob"))), tipo, 0.85),
  );
  const buf = await blob.arrayBuffer();
  return { datos: aBase64(buf), tipo, bytes: buf.byteLength };
}

/**
 * Convierte un File en un documento listo para el chat, respetando los
 * límites (4.5 MB por request en Vercel → 3 MB de adjuntos en total).
 */
export async function prepararAdjunto(
  file: File,
  yaUsados: number,
  cantidad: number,
): Promise<DocumentoAdjunto | ErrorAdjunto> {
  if (cantidad >= LIMITES.documentosMax) return "max";
  if (esVideo(file)) {
    if (file.size > LIMITES.videoBytes) return "grande";
    const doc = await extraerFotogramas(file, file.name);
    if (yaUsados + doc.bytes > LIMITES.documentosBytes) return "grande";
    return doc;
  }
  const esImagen = (TIPOS_IMAGEN as readonly string[]).includes(file.type);
  const esPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const esTexto = file.type.startsWith("text/") || file.type === "application/json" || TEXTO_EXT.test(file.name);
  if (!esImagen && !esPdf && !esTexto) return "tipo";

  if (esTexto) {
    const texto = (await file.text()).slice(0, LIMITES.textoCaracteres);
    const bytes = new Blob([texto]).size;
    if (yaUsados + bytes > LIMITES.documentosBytes) return "grande";
    return { id: uid(), nombre: file.name, tipo: "text/plain", bytes, datos: texto, codificacion: "texto" };
  }
  if (esPdf) {
    if (yaUsados + file.size > LIMITES.documentosBytes) return "grande";
    const buf = await file.arrayBuffer();
    return { id: uid(), nombre: file.name, tipo: "application/pdf", bytes: buf.byteLength, datos: aBase64(buf), codificacion: "base64" };
  }
  const img = await prepararImagen(file);
  if (yaUsados + img.bytes > LIMITES.documentosBytes) return "grande";
  return { id: uid(), nombre: file.name, tipo: img.tipo, bytes: img.bytes, datos: img.datos, codificacion: "base64" };
}

export function formatoBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/* ───────────────────────── Video → fotogramas ───────────────────────── */

const TIPOS_VIDEO = /^video\/(mp4|webm|ogg|quicktime|x-m4v)$/;
export const esVideo = (f: File) => TIPOS_VIDEO.test(f.type) || /\.(mp4|webm|mov|m4v|ogv)$/i.test(f.name);

function esperar(el: HTMLVideoElement, evento: "loadedmetadata" | "seeked" | "loadeddata", ms = 8000): Promise<void> {
  return new Promise((ok, mal) => {
    const t = window.setTimeout(() => mal(new Error(`timeout ${evento}`)), ms);
    el.addEventListener(
      evento,
      () => {
        window.clearTimeout(t);
        ok();
      },
      { once: true },
    );
    el.addEventListener(
      "error",
      () => {
        window.clearTimeout(t);
        mal(new Error("video"));
      },
      { once: true },
    );
  });
}

/** Cuántos fotogramas tomar según la duración (≈1 cada 1.5 s, entre 4 y 12). */
export function cuantosFotogramas(duracion: number): number {
  return Math.max(4, Math.min(LIMITES.fotogramasMax, Math.ceil(duracion / 1.5)));
}

/**
 * Muestrea fotogramas de un video en el navegador (sin subir el video): los
 * reparte a lo largo de la duración, los reduce a 768 px y los pasa a JPEG.
 * Si el total supera ~2 MB baja la calidad. Sirve tanto para un archivo del
 * usuario como para los videos públicos de /vision (mismo origen).
 */
export async function extraerFotogramas(
  fuente: File | string,
  nombre: string,
  alProgreso?: (hechos: number, total: number) => void,
): Promise<DocumentoAdjunto> {
  const url = typeof fuente === "string" ? fuente : URL.createObjectURL(fuente);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  video.src = url;
  try {
    await esperar(video, "loadedmetadata");
    if (video.readyState < 2) await esperar(video, "loadeddata").catch(() => undefined);
    const duracion = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    if (!duracion || !video.videoWidth) throw new Error("video");
    const n = cuantosFotogramas(duracion);
    const escala = Math.min(1, LIMITES.fotogramaLado / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * escala);
    canvas.height = Math.round(video.videoHeight * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");

    const tiempos = Array.from({ length: n }, (_, i) => Math.min(duracion - 0.05, (duracion * (i + 0.5)) / n));
    const capturas: { t: number; blob: Blob }[] = [];
    for (let i = 0; i < tiempos.length; i++) {
      video.currentTime = tiempos[i];
      await esperar(video, "seeked");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error("blob"))), "image/jpeg", 0.8));
      capturas.push({ t: tiempos[i], blob });
      alProgreso?.(i + 1, n);
    }
    let total = capturas.reduce((s, c) => s + c.blob.size, 0);
    // Presupuesto: ~2 MB en fotogramas para quedar holgados bajo 4.5 MB por request.
    if (total > 2_000_000) {
      for (const c of capturas) {
        const bmp = await createImageBitmap(c.blob);
        ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
        bmp.close();
        c.blob = await new Promise<Blob>((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error("blob"))), "image/jpeg", 0.5));
      }
      total = capturas.reduce((s, c) => s + c.blob.size, 0);
    }
    const fotogramas = await Promise.all(
      capturas.map(async (c) => ({ t: Math.round(c.t * 10) / 10, datos: aBase64(await c.blob.arrayBuffer()) })),
    );
    return {
      id: uid(),
      nombre,
      tipo: "video/fotogramas",
      bytes: total,
      datos: "",
      codificacion: "fotogramas",
      fotogramas,
      duracion: Math.round(duracion * 10) / 10,
    };
  } finally {
    video.removeAttribute("src");
    video.load();
    if (typeof fuente !== "string") URL.revokeObjectURL(url);
  }
}

/** Una imagen pública del sitio (p. ej. evidencia de /vision) como adjunto. */
export async function imagenDesdeUrl(url: string, nombre: string): Promise<DocumentoAdjunto> {
  const r = await fetch(url);
  if (!r.ok) throw new Error("imagen");
  const blob = await r.blob();
  const file = new File([blob], nombre, { type: blob.type || "image/jpeg" });
  const res = await prepararAdjunto(file, 0, 0);
  if (typeof res === "string") throw new Error(res);
  return res;
}
