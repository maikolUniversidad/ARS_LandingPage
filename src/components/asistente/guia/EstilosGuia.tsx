"use client";

import { useEffect, useRef } from "react";
import { definirInsetsGuia } from "@/lib/asistente/acciones";
import { seccionVisible } from "@/lib/asistente/contexto-pagina";

/** Lo que tarda la página en correrse (ms); el scroll guiado espera esto. */
export const DURACION_ACOPLE = 520;

/**
 * Al cambiar el ancho del contenido el texto se reacomoda y la lectura
 * saltaría: durante la transición mantenemos fija en pantalla la sección que
 * la persona estaba mirando.
 */
function anclarLectura(ms: number): () => void {
  const s = seccionVisible();
  const el = s ? document.getElementById(s.id) : null;
  if (!el) return () => undefined;
  // Solo se compensa el reflujo (cambio de la posición del elemento en el
  // documento), no el scroll: así no pelea con un desplazamiento guiado.
  const absoluto = () => el.getBoundingClientRect().top + window.scrollY;
  let previo = absoluto();
  const fin = performance.now() + ms;
  let raf = 0;
  const paso = () => {
    if (performance.now() > fin) return;
    const ahora = absoluto();
    const delta = ahora - previo;
    previo = ahora;
    if (Math.abs(delta) > 1) window.scrollTo({ top: window.scrollY + delta, behavior: "instant" });
    raf = requestAnimationFrame(paso);
  };
  raf = requestAnimationFrame(paso);
  return () => cancelAnimationFrame(raf);
}

/** Ancho de la columna acoplada en escritorio (px). */
export const ANCHO_DOCK = 380;
/** Desde este ancho la página se corre para dejar sitio a la columna (si no, la columna flota encima). */
const EMPUJE_DESDE = 1100;

/*
 * Al acoplarse en pantallas anchas, el contenido se corre a la izquierda en
 * vez de quedar debajo de la columna: se le da margen al <body> y se acortan
 * las barras fijas de ancho completo (encabezados y barras inferiores).
 */
const CSS = `
@media (prefers-reduced-motion: no-preference) {
  html[data-ars-moviendo] body,
  html[data-ars-moviendo] .fixed.inset-x-0 { transition: padding-right .5s cubic-bezier(.2,.8,.2,1), right .5s cubic-bezier(.2,.8,.2,1) !important; }
}
@media (min-width: ${EMPUJE_DESDE}px) {
  html[data-ars-acoplado] body { padding-right: ${ANCHO_DOCK}px; }
  html[data-ars-acoplado] .fixed.inset-x-0:not([data-asistente-raiz] *) { right: ${ANCHO_DOCK}px; }
}
`;

/**
 * Aplica (o quita) el modo acoplado a toda la página. La transición solo se
 * activa durante el cambio, para no pisar las transiciones propias del sitio.
 */
export function EstilosGuia({ acopladoEscritorio }: { acopladoEscritorio: boolean }) {
  const previo = useRef(false);
  useEffect(() => {
    const html = document.documentElement;
    const soltar = previo.current === acopladoEscritorio ? () => undefined : anclarLectura(DURACION_ACOPLE + 80);
    previo.current = acopladoEscritorio;
    html.setAttribute("data-ars-moviendo", "");
    const fin = window.setTimeout(() => html.removeAttribute("data-ars-moviendo"), 600);
    if (acopladoEscritorio) html.setAttribute("data-ars-acoplado", "");
    else html.removeAttribute("data-ars-acoplado");
    definirInsetsGuia({ derecha: acopladoEscritorio ? ANCHO_DOCK : 0 });
    return () => {
      window.clearTimeout(fin);
      soltar();
      html.removeAttribute("data-ars-moviendo");
      html.removeAttribute("data-ars-acoplado");
      definirInsetsGuia({ derecha: 0 });
    };
  }, [acopladoEscritorio]);

  return <style>{CSS}</style>;
}
