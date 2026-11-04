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
