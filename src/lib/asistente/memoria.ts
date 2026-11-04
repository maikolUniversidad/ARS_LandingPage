"use client";

import { LIMITES, type ClavePerfil, type MensajeChat, type PasoRecorrido } from "./tipos";

/**
 * Memoria del asistente, siempre en el navegador de la persona (nunca en el
 * servidor): su perfil (lo que contó), su recorrido por el sitio y un resumen
 * de la conversación antigua para no perder el hilo en charlas largas.
 */

export type Perfil = Partial<Record<ClavePerfil, string>>;

const CLAVE_PERFIL = "ars-asistente-perfil-v1";
const CLAVE_RECORRIDO = "ars-asistente-recorrido-v1";
const MAX_RECORRIDO = 24;

function leer<T>(clave: string, defecto: T): T {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as T) : defecto;
  } catch {
    return defecto;
  }
}

function escribir(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* lleno o bloqueado */
  }
}

/* ───────────── Perfil ───────────── */

export function cargarPerfil(): Perfil {
  if (typeof window === "undefined") return {};
  const p = leer<Perfil>(CLAVE_PERFIL, {});
  return p && typeof p === "object" ? p : {};
}

export function guardarPerfil(p: Perfil) {
  escribir(CLAVE_PERFIL, p);
}

/* ───────────── Recorrido ───────────── */

type PasoGuardado = { ruta: string; ancla: string; titulo: string; ts: number };

export function registrarPaso(ruta: string, ancla: string, titulo: string) {
  if (typeof window === "undefined") return;
  const pasos = leer<PasoGuardado[]>(CLAVE_RECORRIDO, []);
  const ultimo = pasos[pasos.length - 1];
  if (ultimo && ultimo.ruta === ruta && ultimo.ancla === ancla) return;
  pasos.push({ ruta, ancla, titulo: titulo.slice(0, 120), ts: Date.now() });
  escribir(CLAVE_RECORRIDO, pasos.slice(-MAX_RECORRIDO));
}

/** Últimos pasos (máx. 12) con su antigüedad, del más antiguo al más nuevo. */
export function recorridoReciente(): PasoRecorrido[] {
  if (typeof window === "undefined") return [];
  const ahora = Date.now();
  return leer<PasoGuardado[]>(CLAVE_RECORRIDO, [])
    .slice(-12)
    .map((p) => ({ ruta: p.ruta, ancla: p.ancla, titulo: p.titulo, haceSeg: Math.max(0, Math.round((ahora - p.ts) / 1000)) }));
}

export function borrarMemoria() {
  try {
    localStorage.removeItem(CLAVE_PERFIL);
    localStorage.removeItem(CLAVE_RECORRIDO);
  } catch {
    /* ignorado */
  }
}

/* ───────────── Conversación larga ───────────── */

/**
 * Divide el historial: los últimos N mensajes viajan completos y los más
 * antiguos se condensan en un resumen breve (para que el modelo no pierda el
 * hilo sin pagar todo el historial).
 */
export function partirHistorial(mensajes: MensajeChat[]): { recientes: MensajeChat[]; resumen: string } {
  const n = LIMITES.historialMensajes - 2;
  if (mensajes.length <= n) return { recientes: mensajes, resumen: "" };
  const antiguos = mensajes.slice(0, mensajes.length - n);
  const lineas = antiguos
    .filter((m) => m.texto.trim())
    .map((m) => `${m.rol === "user" ? "Persona" : "Ars"}: ${m.texto.replace(/\s+/g, " ").slice(0, 180)}`);
  let resumen = lineas.join("\n");
  if (resumen.length > 3000) resumen = `…\n${resumen.slice(-3000)}`;
  let recientes = mensajes.slice(mensajes.length - n);
  while (recientes.length && recientes[0].rol !== "user") recientes = recientes.slice(1);
  return { recientes, resumen };
}
