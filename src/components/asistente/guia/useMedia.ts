"use client";

import { useSyncExternalStore } from "react";

function suscribir(consulta: string) {
  return (aviso: () => void) => {
    const mq = window.matchMedia(consulta);
    mq.addEventListener("change", aviso);
    return () => mq.removeEventListener("change", aviso);
  };
}

/** `matchMedia` reactivo y seguro en SSR (en el servidor devuelve `false`). */
export function useMedia(consulta: string): boolean {
  return useSyncExternalStore(
    suscribir(consulta),
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}

export const CONSULTA_MOVIL = "(max-width: 767px)";
