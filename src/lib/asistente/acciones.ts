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

export function esMovil(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

/* ───────────── Espacio libre de la página ───────────── */

/**
 * Lo que tapa el asistente cuando está acoplado: a la derecha (columna en
 * escritorio) o abajo (hoja en móvil). Arriba, el encabezado fijo del sitio.
 * Con esto el scroll centra la sección en el espacio que queda visible.
 */
const insets = { derecha: 0, abajo: 0 };
export function definirInsetsGuia(i: Partial<typeof insets>) {
  Object.assign(insets, i);
}

function altoEncabezado(): number {
  const h = document.querySelector<HTMLElement>("header.fixed, header.sticky");
  const r = h?.getBoundingClientRect();
  return r && r.top <= 1 && r.height < 160 ? r.bottom : 0;
}

/** Área visible de la página (sin encabezado ni asistente), en px del viewport. */
export function areaLibre() {
  const arriba = altoEncabezado();
  const abajo = window.innerHeight - insets.abajo;
  return { arriba, abajo, alto: Math.max(120, abajo - arriba), derecha: window.innerWidth - insets.derecha };
}

/** Desplaza para que el elemento quede centrado en el área libre (o arriba si no cabe). */
export function desplazarA(el: HTMLElement) {
  const { arriba, alto } = areaLibre();
  const r = el.getBoundingClientRect();
  const margen = 16;
  const destino =
    r.height + margen * 2 <= alto
      ? window.scrollY + r.top - arriba - (alto - r.height) / 2
      : window.scrollY + r.top - arriba - margen;
  window.scrollTo({ top: Math.max(0, destino), behavior: prefiereMenosMovimiento() ? "auto" : "smooth" });
}

/* ───────────── Halo visible ───────────── */

let haloActual: { quitar: () => void } | null = null;

/**
 * Halo azul de marca dibujado encima de la página (no toca el elemento): un
 * marco que sigue al elemento mientras se desplaza y una etiqueta opcional.
 * El marco se limita al área libre para que no quede debajo del asistente.
 */
function mostrarHalo(el: HTMLElement, nota: string | undefined, duracion: number) {
  haloActual?.quitar();
  const reducido = prefiereMenosMovimiento();
  const capa = document.createElement("div");
  capa.setAttribute("aria-hidden", "true");
  capa.setAttribute("data-asistente-halo", "");
  capa.className =
    "pointer-events-none fixed z-[55] rounded-2xl border-2 border-[#4d74ff] shadow-[0_0_0_6px_rgba(35,72,212,0.18),0_0_60px_10px_rgba(35,72,212,0.35)] transition-opacity duration-500 opacity-0";
  if (nota) {
    const chip = document.createElement("span");
    chip.className =
      "absolute -top-3.5 left-4 max-w-[min(26rem,80%)] truncate rounded-full border border-[#4d74ff] bg-[#020a18] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#cdd8ff] shadow-lg";
    chip.textContent = nota;
    capa.appendChild(chip);
  }
  document.body.appendChild(capa);

  let raf = 0;
  const seguir = () => {
    const r = el.getBoundingClientRect();
    const { arriba, abajo, derecha } = areaLibre();
    const top = Math.max(r.top, arriba + 6);
    const bottom = Math.min(r.bottom, abajo - 6);
    const left = Math.max(r.left, 6);
    const right = Math.min(r.right, derecha - 6);
    const s = capa.style;
    s.top = `${top - 4}px`;
    s.left = `${left - 4}px`;
    s.width = `${Math.max(0, right - left + 8)}px`;
    s.height = `${Math.max(0, bottom - top + 8)}px`;
    s.visibility = bottom - top > 24 ? "visible" : "hidden";
    raf = requestAnimationFrame(seguir);
  };
  seguir();
  requestAnimationFrame(() => (capa.style.opacity = "1"));

  let fin = 0;
  const quitar = () => {
    window.clearTimeout(fin);
    capa.style.opacity = "0";
    window.setTimeout(
      () => {
        cancelAnimationFrame(raf);
        capa.remove();
      },
      reducido ? 0 : 500,
    );
    if (haloActual?.quitar === quitar) haloActual = null;
  };
  fin = window.setTimeout(quitar, duracion);
  haloActual = { quitar };
}

export function quitarHalo() {
  haloActual?.quitar();
}

export type OpcionesResaltar = {
  /** Etiqueta sobre el halo (p. ej. «Paso 2/6 · Central de monitoreo»). */
  nota?: string;
  /** Cuánto dura el halo (ms). */
  duracion?: number;
  /** Espera antes de desplazar (p. ej. mientras el panel se acopla). */
  retraso?: number;
};

/** Desplaza hasta un elemento por id, centrado en el área libre, y lo resalta. */
export async function resaltarElemento(id: string, op: OpcionesResaltar = {}): Promise<boolean> {
  const el = await esperarElemento(id);
  if (!el) return false;
  if (op.retraso) await new Promise((r) => window.setTimeout(r, op.retraso));
  desplazarA(el);
  mostrarHalo(el, op.nota, op.duracion ?? 3200);
  return true;
}
