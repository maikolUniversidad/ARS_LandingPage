"use client";

import { EVENTO_FOCO_SERVICIO, type DetalleFocoServicio } from "./eventos-servicios";

/** Utilidades de DOM para que el asistente "muestre" cosas en la página. */

function esperarElemento(id: string, ms = 3000): Promise<HTMLElement | null> {
  return new Promise((ok) => {
    const inicio = performance.now();
    const buscar = () => {
      const el = document.getElementById(id);
      if (el) return ok(el);
      if (performance.now() - inicio > ms) return ok(null);
      requestAnimationFrame(buscar);
    };
    buscar();
  });
}

export function prefiereMenosMovimiento(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Desplaza hasta un elemento por id y lo resalta con un halo azul de marca. */
export async function resaltarElemento(id: string): Promise<boolean> {
  const el = await esperarElemento(id);
  if (!el) return false;
  const reducido = prefiereMenosMovimiento();
  el.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
  const halo = "0 0 0 3px rgba(35,72,212,0.95), 0 0 48px 8px rgba(35,72,212,0.35)";
  const nada = "0 0 0 0 rgba(35,72,212,0), 0 0 0 0 rgba(35,72,212,0)";
  el.animate(
    reducido
      ? [{ boxShadow: halo }, { boxShadow: halo, offset: 0.85 }, { boxShadow: nada }]
      : [{ boxShadow: nada }, { boxShadow: halo, offset: 0.2 }, { boxShadow: halo, offset: 0.7 }, { boxShadow: nada }],
    { duration: 2600, easing: "ease-out" },
  );
  return true;
}

export function esMovil(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

/** Espera (sondeando) a que se cumpla una condición, con tope de tiempo. */
function esperarCondicion(cond: () => boolean, ms: number): Promise<boolean> {
  return new Promise((ok) => {
    const inicio = performance.now();
    const revisar = () => {
      if (cond()) return ok(true);
      if (performance.now() - inicio > ms) return ok(false);
      window.setTimeout(revisar, 80);
    };
    revisar();
  });
}

/**
 * Pide a la página de /servicios/<area> que muestre un módulo: espera a que la
 * ruta esté cargada (y la sección del módulo exista) y emite `ars:foco-servicio`
 * para que la página desplace y vuele la escena 3D. Si hubo navegación, repite
 * el aviso una vez por si la escena terminó de montarse después.
 */
export async function enfocarServicio(ruta: string, modulo?: string, foco?: string): Promise<boolean> {
  const yaEstaba = window.location.pathname === ruta;
  const listo = await esperarCondicion(
    () => window.location.pathname === ruta && (!modulo || document.getElementById(modulo) !== null),
    8000,
  );
  if (!listo) return false;
  const emitir = () =>
    window.dispatchEvent(new CustomEvent<DetalleFocoServicio>(EVENTO_FOCO_SERVICIO, { detail: { modulo, foco } }));
  emitir();
  if (!yaEstaba) window.setTimeout(emitir, 900);
  return true;
}
