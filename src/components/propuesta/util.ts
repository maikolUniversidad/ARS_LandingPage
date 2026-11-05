"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AREA_IDS, type AreaId } from "@/data/diagnostico/tipos";
import type { Respuestas } from "@/data/propuesta/tipos";
import { puntajeAreas } from "@/lib/diagnostico/catalogo";

/** Colores de las conexiones del mapa de integración, por `modo`. */
export const MODOS = {
  integra: { color: "#35e0a1", etiqueta: "Se integra" },
  migra: { color: "#5fd8ff", etiqueta: "Se migra" },
  convive: { color: "#ffd166", etiqueta: "Convive" },
  reemplaza: { color: "#ff8fb1", etiqueta: "Se reemplaza" },
  centraliza: { color: "#b78bff", etiqueta: "Se centraliza en ARS" },
} as const;

const consultaMovimiento = "(prefers-reduced-motion: reduce)";

function suscribirMovimiento(cb: () => void) {
  const mq = window.matchMedia(consultaMovimiento);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** true si la persona pidió reducir movimiento (en servidor: false). */
export function useMenosMovimiento() {
  return useSyncExternalStore(
    suscribirMovimiento,
    () => window.matchMedia(consultaMovimiento).matches,
    () => false,
  );
}

/** Se vuelve true (una sola vez) cuando el elemento entra en pantalla. */
export function useVisible<T extends Element>(margen = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: margen },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, margen]);
  return [ref, visible] as const;
}

/** Áreas de ARS que se «encienden» según lo que la persona ha respondido. */
export function areasEncendidas(r: Respuestas): AreaId[] {
  const texto = [
    ...r.servicios,
    ...r.aplicaciones,
    r.erp,
    ...r.datos,
    r.integraciones,
    ...r.dolores,
    ...r.reportes,
    r.notas,
    r.central === "si" || r.central === "en-proyecto" ? "central de monitoreo" : "",
    r.servicios.includes("Medios tecnológicos") || r.servicios.includes("Monitoreo remoto") ? "camara sensor" : "",
  ]
    .filter(Boolean)
    .join(". ");
  const puntos = puntajeAreas(texto);
  if (r.vigilantes) {
    puntos.set("operacion-en-campo", (puntos.get("operacion-en-campo") ?? 0) + 2);
    puntos.set("gestion-humana", (puntos.get("gestion-humana") ?? 0) + 1);
  }
  // «Gobierno» se enciende con casi cualquier «app»: pide más evidencia.
  return AREA_IDS.filter((id) => (puntos.get(id) ?? 0) >= (id === "gobierno-y-seguridad" ? 4 : 2));
}

/** Parte un texto en líneas de ~`max` caracteres (para etiquetas SVG). */
export function partirTexto(texto: string, max = 18, lineas = 2): string[] {
  const palabras = texto.split(/\s+/);
  const out: string[] = [];
  let actual = "";
  for (const p of palabras) {
    if ((actual + " " + p).trim().length > max && actual) {
      out.push(actual);
      actual = p;
    } else actual = (actual + " " + p).trim();
  }
  if (actual) out.push(actual);
  if (out.length > lineas) {
    const recorte = out.slice(0, lineas);
    recorte[lineas - 1] = recorte[lineas - 1].slice(0, max - 1) + "…";
    return recorte;
  }
  return out;
}

/** Para títulos que reciben foco por programa (tabIndex -1): sin el contorno global de :focus-visible. */
export const SIN_CONTORNO = { outline: "none" } as const;
