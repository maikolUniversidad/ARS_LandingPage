"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

const CONSULTA_REDUCIDO = "(prefers-reduced-motion: reduce)";

function suscribirReducido(cb: () => void) {
  const mq = window.matchMedia(CONSULTA_REDUCIDO);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** `true` si el sistema pide reducir movimiento (en el servidor, `false`). */
export function useMovimientoReducido(): boolean {
  return useSyncExternalStore(
    suscribirReducido,
    () => window.matchMedia(CONSULTA_REDUCIDO).matches,
    () => false
  );
}

function suscribirVisibilidadPagina(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

/** `true` mientras la pestaña está visible (las animaciones se detienen en segundo plano). */
export function usePaginaVisible(): boolean {
  return useSyncExternalStore(
    suscribirVisibilidadPagina,
    () => document.visibilityState === "visible",
    () => true
  );
}

/**
 * `true` mientras el elemento está en pantalla (y la pestaña visible).
 * Sirve para pausar video, temporizadores y animaciones fuera de la vista.
 */
export function useEnVista(
  ref: RefObject<Element | null>,
  { umbral = 0.2, margen = "0px" }: { umbral?: number; margen?: string } = {}
): boolean {
  const [visible, setVisible] = useState(false);
  const paginaVisible = usePaginaVisible();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: umbral,
      rootMargin: margen,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, umbral, margen]);

  return visible && paginaVisible;
}

/** Tamaño (px) de un elemento, actualizado con ResizeObserver. */
export function useTamano(ref: RefObject<Element | null>): { ancho: number; alto: number } {
  const [tam, setTam] = useState({ ancho: 0, alto: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setTam((t) => (t.ancho === width && t.alto === height ? t : { ancho: width, alto: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return tam;
}
