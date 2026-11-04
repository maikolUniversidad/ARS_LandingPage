/**
 * Utilidades de entorno para las escenas 3D (solo cliente).
 *
 * `supportsWebGL()` se usa como `getSnapshot` de `useSyncExternalStore`, así que
 * se llama en CADA render: debe ser barata y no crear contextos. Antes cada
 * llamada creaba un canvas + contexto WebGL nuevo; con re-renders frecuentes
 * Chrome superaba su límite (~16 contextos) y mataba el de la escena real.
 * Ahora se sondea una sola vez por sesión y el contexto de prueba se libera.
 */

let cache: boolean | undefined;

export function supportsWebGL(): boolean {
  if (cache !== undefined) return cache;
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") ?? c.getContext("webgl")) as WebGLRenderingContext | WebGL2RenderingContext | null;
    cache = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cache = false;
  }
  return cache;
}

/** Suscripción vacía para `useSyncExternalStore` (el soporte no cambia en la sesión). */
export const noopSubscribe = () => () => {};

/** Memoria del equipo en GB (Chrome/Edge); undefined si el navegador no la expone. */
export function deviceMemory(): number | undefined {
  const n = navigator as Navigator & { deviceMemory?: number };
  return typeof n.deviceMemory === "number" ? n.deviceMemory : undefined;
}

/** Equipo modesto: pocos núcleos o ≤ 4 GB de memoria. */
export function isModestDevice(): boolean {
  const mem = deviceMemory();
  return (navigator.hardwareConcurrency || 8) <= 4 || (mem !== undefined && mem <= 4);
}

/** Modo bajo consumo: puntero grueso / pantalla angosta o equipo modesto. */
export function isLowPower(): boolean {
  return window.matchMedia("(pointer: coarse), (max-width: 767px)").matches || isModestDevice();
}
