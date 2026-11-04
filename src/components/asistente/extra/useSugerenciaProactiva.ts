"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import {
  ESPERA_PROACTIVA_MS,
  marcarProactivo,
  proactivoBloqueado,
  sugerenciaProactiva,
  type SugerenciaProactiva,
} from "./proactivo";

/**
 * Una sugerencia proactiva por sesión, tras ~30 s en la misma página y solo si
 * el panel está cerrado y la persona aún no habló con Ars. Pensado para
 * alimentar la `burbuja` de `BotonFlotante` cuando no hay otra burbuja.
 *
 * `aceptar()` abre el asistente con el mensaje sugerido (evento `ars:asistente`).
 */
export function useSugerenciaProactiva(abierto: boolean) {
  const ruta = usePathname();
  const { idioma } = useTextosAsistente();
  const [sugerencia, setSugerencia] = useState<SugerenciaProactiva | null>(null);

  useEffect(() => {
    // Con el panel abierto no se sugiere nada (y una sugerencia ya mostrada
    // quedó marcada en la sesión, así que no vuelve).
    if (abierto || proactivoBloqueado()) return;
    const id = window.setTimeout(() => {
      if (document.visibilityState !== "visible" || proactivoBloqueado()) return;
      const s = sugerenciaProactiva(ruta, window.location.hash.replace(/^#/, ""), idioma === "en" ? "en" : "es");
      if (!s) return;
      marcarProactivo("mostrado");
      setSugerencia(s);
    }, ESPERA_PROACTIVA_MS);
    return () => window.clearTimeout(id);
  }, [abierto, ruta, idioma]);

  const aceptar = useCallback(() => {
    if (!sugerencia) return;
    marcarProactivo("aceptado");
    window.dispatchEvent(new CustomEvent("ars:asistente", { detail: { mensaje: sugerencia.mensaje } }));
    setSugerencia(null);
  }, [sugerencia]);

  const cerrar = useCallback(() => {
    marcarProactivo("cerrado");
    setSugerencia(null);
  }, []);

  // Si el panel se abrió alguna vez, la sugerencia ya no vuelve (patrón de
  // estado derivado de props durante el render, sin efecto).
  const [panelUsado, setPanelUsado] = useState(false);
  if (abierto && !panelUsado) setPanelUsado(true);

  return { sugerencia: abierto || panelUsado ? null : sugerencia, aceptar, cerrar };
}
