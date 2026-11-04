import * as THREE from "three";

/**
 * WebGLRenderer con el manejo de fallos que comparten todas las escenas 3D:
 *
 *  - Si el renderer no se puede crear (sin WebGL, GPU en lista negra, demasiados
 *    contextos) devuelve null en vez de lanzar.
 *  - Contexto perdido: avisa `onLost` (la escena detiene su bucle) y arranca un
 *    temporizador; si el navegador lo restaura a tiempo avisa `onRestored` (three
 *    re-sube geometrías y texturas solo) y si no, llama `onFatal` para que el
 *    componente padre muestre el respaldo estático en vez de un canvas muerto.
 *  - `dispose()` libera el renderer y, si el canvas ya salió del DOM (desmontaje
 *    real), también el contexto WebGL, en vez de esperar al recolector. Si el mismo
 *    canvas se reutiliza (cambio de escena) el contexto queda vivo.
 */

export type SafeRendererOptions = {
  canvas: HTMLCanvasElement;
  lowPower: boolean;
  /** Parámetros extra del renderer (alpha, etc.). */
  params?: Omit<THREE.WebGLRendererParameters, "canvas">;
  /** El contexto no volvió: la escena está muerta y hay que pasar al respaldo. */
  onFatal?: () => void;
  /** Espera máxima por `webglcontextrestored` antes de rendirse (ms). */
  restoreTimeoutMs?: number;
};

export type SafeRenderer = {
  renderer: THREE.WebGLRenderer;
  /** Tope de pixel ratio según el modo de consumo. */
  maxDpr: number;
  /** true mientras el contexto está perdido (no dibujar). */
  isLost(): boolean;
  /**
   * Ganchos que la escena asigna cuando ya construyó su bucle: `onLost` debe
   * detenerlo y `onRestored` reanudarlo (redibujando al menos un cuadro).
   */
  onLost?: () => void;
  onRestored?: () => void;
  /**
   * Libera el renderer. `force` libera el contexto aunque el canvas siga en el DOM
   * (p. ej. si la construcción de la escena falló y se va a mostrar el respaldo).
   */
  dispose(force?: boolean): void;
};

export function createSafeRenderer(opts: SafeRendererOptions): SafeRenderer | null {
  const { canvas, lowPower, restoreTimeoutMs = 3000 } = opts;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !lowPower,
      alpha: false,
      powerPreference: "high-performance",
      ...opts.params,
    });
  } catch {
    return null;
  }

  const maxDpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
  renderer.setPixelRatio(maxDpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  let lost = false;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const sr: SafeRenderer = {
    renderer,
    maxDpr,
    isLost: () => lost,
    dispose(force = false) {
      if (disposed) return;
      disposed = true;
      clearTimeout(timer);
      canvas.removeEventListener("webglcontextlost", onLost, false);
      canvas.removeEventListener("webglcontextrestored", onRestored, false);
      let gl: WebGLRenderingContext | null = null;
      try {
        gl = renderer.getContext();
      } catch {
        gl = null;
      }
      renderer.dispose();
      const liberar = () => {
        try {
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
        } catch {
          /* ya perdido */
        }
      };
      if (force) liberar();
      else
        setTimeout(() => {
          if (!canvas.isConnected) liberar();
        }, 0);
    },
  };
  const onLost = (e: Event) => {
    e.preventDefault(); // permite que el navegador intente restaurarlo
    if (lost) return;
    lost = true;
    sr.onLost?.();
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (lost && !disposed) opts.onFatal?.();
    }, restoreTimeoutMs);
  };
  const onRestored = () => {
    clearTimeout(timer);
    if (!lost) return;
    lost = false;
    sr.onRestored?.();
  };
  canvas.addEventListener("webglcontextlost", onLost, false);
  canvas.addEventListener("webglcontextrestored", onRestored, false);
  return sr;
}
