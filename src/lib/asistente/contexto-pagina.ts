"use client";

import { analiticas } from "@/data/analiticas";
import { areaLibre } from "./acciones";
import type { ContextoPagina, Idioma } from "./tipos";

const porId = new Map(analiticas.map((a) => [a.id, a.nombre]));

/** Ignora elementos del propio asistente y contenedores técnicos. */
function esCandidato(el: Element): boolean {
  if (el.closest("[data-asistente-raiz]")) return false;
  const id = el.id;
  if (!id || id.length > 60 || /^(radix|base-ui|__next|mobile-menu|hero-glow)/.test(id)) return false;
  return true;
}

function tituloDe(el: Element): string {
  const h = el.querySelector<HTMLElement>("h1, h2, h3");
  // innerText respeta los <br> de los titulares («operación<br>desde» → «operación desde»).
  const t = ((h && (h.innerText || h.textContent)) ?? el.getAttribute("aria-label") ?? "").replace(/\s+/g, " ").trim();
  return t.slice(0, 140);
}

/**
 * Sección más visible ahora mismo: entre los elementos con `id` del <main>
 * (secciones, anclas), el que ocupa más alto visible del viewport.
 */
export function seccionVisible(): { id: string; titulo: string } | null {
  if (typeof window === "undefined") return null;
  // Solo cuenta lo que queda visible fuera del encabezado y del asistente acoplado.
  const { arriba, abajo } = areaLibre();
  const vh = abajo - arriba;
  let mejor: { el: Element; area: number } | null = null;
  const nodos = document.querySelectorAll("section[id], [data-seccion][id], main [id]");
  for (const el of nodos) {
    if (!esCandidato(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 80) continue;
    const visible = Math.min(r.bottom, abajo) - Math.max(r.top, arriba);
    if (visible <= 0) continue;
    // Preferimos secciones "grandes" pero no el contenedor de toda la página.
    const area = visible - (r.height > vh * 3 ? vh : 0);
    if (!mejor || area > mejor.area) mejor = { el, area };
  }
  if (!mejor) return null;
  const titulo = tituloDe(mejor.el);
  return { id: mejor.el.id, titulo };
}

export function leerContexto(ruta: string, idioma: Idioma): ContextoPagina {
  const ancla = typeof window === "undefined" ? "" : decodeURIComponent(window.location.hash.slice(1));
  const analitica = ruta.startsWith("/vision") && porId.has(ancla) ? { id: ancla, nombre: porId.get(ancla) ?? ancla } : null;
  return {
    ruta,
    ancla,
    tituloDocumento: typeof document === "undefined" ? "" : document.title,
    seccion: seccionVisible(),
    analitica,
    idioma,
  };
}

/* ───────────── Recorrido guiado ───────────── */

export type PasoGuia = { id: string; titulo: string; texto: string };

function textoDe(el: Element): string {
  for (const p of el.querySelectorAll("p")) {
    if (p.closest("[data-asistente-raiz]")) continue;
    const t = (p.textContent ?? "").replace(/\s+/g, " ").trim();
    if (t.length >= 40) return t.length > 260 ? `${t.slice(0, 257).replace(/\s+\S*$/, "")}…` : t;
  }
  return "";
}

/**
 * Secciones de la página actual para el recorrido, en orden del documento:
 * solo las de primer nivel (no las anidadas dentro de otra) con encabezado,
 * para que el tour sea corto y siga la narrativa de la página.
 */
export function pasosRecorrido(): PasoGuia[] {
  if (typeof document === "undefined") return [];
  const nodos = Array.from(document.querySelectorAll("section[id], [data-seccion][id], main [id]")).filter(esCandidato);
  const pasos: PasoGuia[] = [];
  for (const el of nodos) {
    if (nodos.some((otro) => otro !== el && otro.contains(el))) continue;
    if (el.getBoundingClientRect().height < 120) continue;
    const titulo = tituloDe(el);
    if (!titulo) continue;
    pasos.push({ id: el.id, titulo: titulo.length > 70 ? `${titulo.slice(0, 67)}…` : titulo, texto: textoDe(el) });
  }
  return pasos.slice(0, 12);
}

/** Encabezado de una sección por su id (para «Te llevo a…»). */
export function tituloSeccion(id: string): string {
  const el = typeof document === "undefined" ? null : document.getElementById(id);
  return el ? tituloDe(el) : "";
}
