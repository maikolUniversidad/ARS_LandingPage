"use client";

import type { EstadoServicios, EventoStream, MensajeChat, PeticionChat } from "./tipos";

export class ErrorChat extends Error {
  constructor(
    public codigo: string,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

/** POST al chat y reparte los eventos NDJSON a medida que llegan. */
export async function enviarChat(
  peticion: PeticionChat,
  alEvento: (e: EventoStream) => void,
  signal: AbortSignal,
): Promise<void> {
  const cuerpo = JSON.stringify(peticion);
  const res = await fetch("/api/asistente/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: cuerpo,
    signal,
  });
  if (!res.ok || !res.body) {
    let codigo = "proveedor";
    let mensaje = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as { codigo?: string; mensaje?: string };
      codigo = j.codigo ?? codigo;
      mensaje = j.mensaje ?? mensaje;
    } catch {
      /* sin cuerpo JSON */
    }
    throw new ErrorChat(codigo, mensaje);
  }
  const lector = res.body.getReader();
  const dec = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    buffer += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buffer.indexOf("\n")) >= 0) {
      const linea = buffer.slice(0, i).trim();
      buffer = buffer.slice(i + 1);
      if (!linea) continue;
      try {
        alEvento(JSON.parse(linea) as EventoStream);
      } catch {
        /* línea corrupta: se ignora */
      }
    }
  }
  if (buffer.trim()) {
    try {
      alEvento(JSON.parse(buffer) as EventoStream);
    } catch {
      /* ignorado */
    }
  }
}

export async function leerEstado(): Promise<EstadoServicios | null> {
  try {
    const r = await fetch("/api/asistente/estado", { cache: "no-store" });
    return r.ok ? ((await r.json()) as EstadoServicios) : null;
  } catch {
    return null;
  }
}

/* ───────────── Historial persistido en el navegador ───────────── */

const CLAVE = "ars-asistente-v1";
const MAX_GUARDADOS = 60;

export function cargarHistorial(): MensajeChat[] {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return [];
    const data = JSON.parse(raw) as { v: number; mensajes: MensajeChat[] };
    return Array.isArray(data.mensajes) ? data.mensajes.slice(-MAX_GUARDADOS) : [];
  } catch {
    return [];
  }
}

export function guardarHistorial(mensajes: MensajeChat[]) {
  try {
    // Solo texto, tarjetas y metadatos de adjuntos: nunca el contenido de los documentos.
    localStorage.setItem(CLAVE, JSON.stringify({ v: 1, mensajes: mensajes.slice(-MAX_GUARDADOS) }));
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
}

export function borrarHistorial() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* ignorado */
  }
}
