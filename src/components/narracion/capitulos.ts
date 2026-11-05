"use client";

/**
 * Capítulos de la página actual: los elementos `[data-narracion]` (los mismos
 * que narra Ars), con un título legible para el menú del dock móvil.
 */
export type Capitulo = { id: string; titulo: string };

function humanizar(id: string) {
  const cola = id.split("/").pop() ?? id;
  const t = cola.replace(/[-_]+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function tituloDe(el: HTMLElement, id: string) {
  const aria = el.getAttribute("aria-label");
  const h = el.querySelector("h1, h2, h3");
  const texto = (h?.textContent ?? aria ?? "").replace(/\s+/g, " ").trim();
  if (!texto) return humanizar(id);
  return texto.length > 46 ? `${texto.slice(0, 44).replace(/\s\S*$/, "")}…` : texto;
}

export function leerCapitulos(): Capitulo[] {
  if (typeof document === "undefined") return [];
  const vistos = new Set<string>();
  const lista: Capitulo[] = [];
  document.querySelectorAll<HTMLElement>("[data-narracion]").forEach((el) => {
    const id = el.dataset.narracion;
    if (!id || vistos.has(id) || el.getClientRects().length === 0) return;
    vistos.add(id);
    lista.push({ id, titulo: tituloDe(el, id) });
  });
  return lista;
}

export function irACapitulo(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-narracion="${CSS.escape(id)}"]`);
  if (!el) return;
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
}
