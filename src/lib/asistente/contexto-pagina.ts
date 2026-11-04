"use client";

import { analiticas } from "@/data/analiticas";
import type { ContextoPagina, ContextoServicio, Idioma } from "./tipos";

const porId = new Map(analiticas.map((a) => [a.id, a.nombre]));

/** Ignora elementos del propio asistente y contenedores técnicos. */
function esCandidato(el: Element): boolean {
  if (el.closest("[data-asistente-raiz]")) return false;
  const id = el.id;
  if (!id || id.length > 60 || /^(radix|base-ui|__next|mobile-menu|hero-glow)/.test(id)) return false;
  return true;
}

function tituloDe(el: Element): string {
  const h = el.querySelector("h1, h2, h3");
  const t = (h?.textContent ?? el.getAttribute("aria-label") ?? "").replace(/\s+/g, " ").trim();
  return t.slice(0, 140);
}

/**
 * Sección más visible ahora mismo: entre los elementos con `id` del <main>
 * (secciones, anclas), el que ocupa más alto visible del viewport.
 */
export function seccionVisible(): { id: string; titulo: string } | null {
  if (typeof window === "undefined") return null;
  const vh = window.innerHeight;
  let mejor: { el: Element; area: number } | null = null;
  const nodos = document.querySelectorAll("section[id], [data-seccion][id], main [id]");
  for (const el of nodos) {
    if (!esCandidato(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 80) continue;
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (visible <= 0) continue;
    // Preferimos secciones "grandes" pero no el contenedor de toda la página.
    const area = visible - (r.height > vh * 3 ? vh : 0);
    if (!mejor || area > mejor.area) mejor = { el, area };
  }
  if (!mejor) return null;
  const titulo = tituloDe(mejor.el);
  return { id: mejor.el.id, titulo };
}

/**
 * En /servicios/<area>: el área (por la URL) y el módulo más visible entre
 * las secciones con `data-modulo` (contrato con las páginas de servicios).
 */
export function servicioVisible(ruta: string): ContextoServicio | null {
  const m = /^\/servicios\/([^/?#]+)/.exec(ruta);
  if (!m || typeof window === "undefined") return null;
  const area = decodeURIComponent(m[1]);
  const vh = window.innerHeight;
  let mejor: { el: Element; visible: number } | null = null;
  for (const el of document.querySelectorAll("[data-modulo]")) {
    if (el.closest("[data-asistente-raiz]")) continue;
    const r = el.getBoundingClientRect();
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (visible <= 0) continue;
    if (!mejor || visible > mejor.visible) mejor = { el, visible };
  }
  if (!mejor) return { area };
  const modulo = mejor.el.getAttribute("data-modulo") || mejor.el.id || undefined;
  const titulo = tituloDe(mejor.el) || undefined;
  return { area, modulo, titulo };
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
    servicio: servicioVisible(ruta),
    idioma,
  };
}
