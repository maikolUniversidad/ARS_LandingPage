"use client";

import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { urlAudioPersonaje, type AudioPersonajeId } from "@/data/academia/contenido";
import { cn } from "@/lib/utils";

/**
 * Reproductor de las voces de los personajes de la Academia.
 *
 * - Un solo audio a la vez en toda la página (al empezar uno, se detiene el anterior).
 * - Tolera que el MP3 aún no exista: `reproducir` resuelve "faltante" y el botón muestra
 *   «audio en preparación».
 */

export type ResultadoAudio = "terminado" | "faltante" | "detenido";

let actual: { audio: HTMLAudioElement; fin: (r: ResultadoAudio) => void } | null = null;
const faltantes = new Set<AudioPersonajeId>();

export function detenerAudio() {
  if (!actual) return;
  const { audio, fin } = actual;
  actual = null;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  fin("detenido");
}

export function reproducir(id: AudioPersonajeId): Promise<ResultadoAudio> {
  detenerAudio();
  if (faltantes.has(id)) return Promise.resolve("faltante");
  return new Promise((resolve) => {
    const audio = new Audio(urlAudioPersonaje(id));
    let resuelto = false;
    const fin = (r: ResultadoAudio) => {
      if (resuelto) return;
      resuelto = true;
      if (actual?.audio === audio) actual = null;
      if (r === "faltante") faltantes.add(id);
      resolve(r);
    };
    actual = { audio, fin };
    audio.addEventListener("ended", () => fin("terminado"));
    audio.addEventListener("error", () => fin("faltante"));
    audio.play().catch((e: unknown) => {
      // NotAllowedError/AbortError: no es que falte el archivo.
      const nombre = e instanceof DOMException ? e.name : "";
      fin(nombre === "NotSupportedError" ? "faltante" : "detenido");
    });
  });
}

/** Estado de reproducción de un id, para pintar el botón. */
export function useAudio() {
  const [sonando, setSonando] = useState<AudioPersonajeId | null>(null);
  const [sinArchivo, setSinArchivo] = useState<ReadonlySet<AudioPersonajeId>>(new Set());
  const vivo = useRef(true);

  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
    };
  }, []);

  const tocar = useCallback(async (id: AudioPersonajeId): Promise<ResultadoAudio> => {
    setSonando(id);
    const r = await reproducir(id);
    if (!vivo.current) return r;
    setSonando((s) => (s === id ? null : s));
    if (r === "faltante") setSinArchivo((prev) => new Set(prev).add(id));
    return r;
  }, []);

  const parar = useCallback(() => {
    detenerAudio();
    setSonando(null);
  }, []);

  return { sonando, sinArchivo, tocar, parar };
}

export function BotonAudio({
  id,
  etiqueta,
  tint = "#b78bff",
  className,
  compacto = false,
}: {
  id: AudioPersonajeId;
  etiqueta: string;
  tint?: string;
  className?: string;
  compacto?: boolean;
}) {
  const { sonando, sinArchivo, tocar, parar } = useAudio();
  const activo = sonando === id;
  const falta = sinArchivo.has(id);

  return (
    <button
      type="button"
      onClick={() => (activo ? parar() : void tocar(id))}
      aria-label={activo ? `Detener: ${etiqueta}` : `Oír: ${etiqueta}`}
      aria-pressed={activo}
      className={cn(
        "inline-flex items-center gap-2 border font-mono uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        compacto ? "px-2 py-1 text-[9px] tracking-[0.16em]" : "px-3 py-2 text-[10px] tracking-[0.2em]",
        activo ? "bg-white/10 text-white" : "bg-white/[0.03] text-white/80 hover:bg-white/10",
        className
      )}
      style={{ borderColor: `${tint}66` }}
    >
      {activo ? (
        <Pause className="size-3.5 shrink-0" style={{ color: tint }} aria-hidden="true" />
      ) : (
        <Play className="size-3.5 shrink-0" style={{ color: tint }} aria-hidden="true" />
      )}
      <span>{falta ? "Audio en preparación" : activo ? "Sonando…" : "Oír"}</span>
    </button>
  );
}
