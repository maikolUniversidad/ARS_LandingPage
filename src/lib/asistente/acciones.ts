"use client";

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
