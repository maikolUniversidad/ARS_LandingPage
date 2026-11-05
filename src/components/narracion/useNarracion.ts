"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motorNarracion } from "@/lib/narracion/motor";

/** Estado reactivo del motor de narración (voz, música, quién habla). */
export function useEstadoNarracion() {
  return useSyncExternalStore(motorNarracion.suscribir, motorNarracion.obtener, motorNarracion.obtenerServidor);
}

/** Declara la cama musical de la página mientras el componente está montado. */
export function useEscenaMusical(pista: string | null, pulso: string | null = null) {
  useEffect(() => motorNarracion.escena(pista, pulso), [pista, pulso]);
}

/**
 * Observa los elementos `[data-narracion="<id>"]` de la página: el que cruza la
 * franja central de la pantalla pasa a ser la sección narrada. Se re-escanea
 * cuando cambia el DOM (navegación entre rutas, contenido que aparece tarde).
 */
export function useObservadorSecciones(activo: boolean) {
  useEffect(() => {
    if (!activo) return;
    const vistos = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const id = (e.target as HTMLElement).dataset.narracion;
          if (id) motorNarracion.seccionVisible(id);
        }
      },
      { rootMargin: "-46% 0px -46% 0px", threshold: 0 }
    );
    const escanear = () => {
      document.querySelectorAll<HTMLElement>("[data-narracion]").forEach((el) => {
        if (vistos.has(el)) return;
        vistos.add(el);
        io.observe(el);
      });
    };
    let t = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(escanear, 250);
    });
    escanear();
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(t);
      mo.disconnect();
      io.disconnect();
    };
  }, [activo]);
}
