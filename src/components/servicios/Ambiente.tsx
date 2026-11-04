"use client";

import { Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EVENTO_VOZ_ACTIVA } from "./eventos";

const CLAVE = "ars:servicios:ambiente";
const VOLUMEN = 0.35;
const VOLUMEN_VOZ = 0.1;
const FUNDIDO_MS = 1500;
export const AMBIENTE_HUB = "/servicios/ambiente/hub.mp3";

type Props = {
  /** id de área → ruta del MP3 de ambiente (si el área tiene). */
  pistas: Record<string, string>;
};

function leerPreferencia() {
  try {
    return window.localStorage.getItem(CLAVE) === "on";
  } catch {
    return false;
  }
}
function guardarPreferencia(on: boolean) {
  try {
    window.localStorage.setItem(CLAVE, on ? "on" : "off");
  } catch {
    /* almacenamiento bloqueado: se ignora */
  }
}

/** Lleva el volumen de un <audio> a `destino` en `ms`; resuelve al terminar o si se cancela. */
function fundir(audio: HTMLAudioElement, destino: number, ms: number, cancelado: () => boolean) {
  return new Promise<void>((resolve) => {
    const desde = audio.volume;
    const t0 = performance.now();
    const paso = (t: number) => {
      if (cancelado()) return resolve();
      const k = Math.min(1, (t - t0) / ms);
      audio.volume = Math.max(0, Math.min(1, desde + (destino - desde) * k));
      if (k < 1) requestAnimationFrame(paso);
      else resolve();
    };
    requestAnimationFrame(paso);
  });
}

/**
 * Sonido de ambiente de /servicios: apagado por defecto, recuerda la elección,
 * funde entre pistas al cambiar de área y baja el volumen mientras Ars habla.
 * Si la pista no existe (404), el botón no aparece.
 */
export function Ambiente({ pistas }: Props) {
  const pathname = usePathname();
  const areaId = pathname?.startsWith("/servicios/") ? pathname.split("/")[2] : null;
  const pista = areaId ? pistas[areaId] ?? null : pathname === "/servicios" ? AMBIENTE_HUB : null;

  const [chequeo, setChequeo] = useState<{ src: string; ok: boolean } | null>(null);
  const disponible = Boolean(pista && chequeo?.src === pista && chequeo.ok);
  const [activo, setActivo] = useState(false);
  const [voz, setVoz] = useState(false);
  const actualRef = useRef<{ audio: HTMLAudioElement; src: string } | null>(null);
  const genRef = useRef(0);
  const vozRef = useRef(false);

  // Preferencia guardada (tras montar, para no romper la hidratación).
  useEffect(() => {
    const on = leerPreferencia();
    if (on) queueMicrotask(() => setActivo(true));
  }, []);

  // ¿Existe la pista? HEAD barato; si falla, se oculta el botón.
  useEffect(() => {
    if (!pista) return;
    let vivo = true;
    fetch(pista, { method: "HEAD" })
      .then((r) => vivo && setChequeo({ src: pista, ok: r.ok }))
      .catch(() => vivo && setChequeo({ src: pista, ok: false }));
    return () => {
      vivo = false;
    };
  }, [pista]);

  // Ars hablando → volumen bajo.
  useEffect(() => {
    const onVoz = (e: WindowEventMap["ars:voz-activa"]) => setVoz(Boolean(e.detail?.activa));
    window.addEventListener(EVENTO_VOZ_ACTIVA, onVoz);
    return () => window.removeEventListener(EVENTO_VOZ_ACTIVA, onVoz);
  }, []);

  const apagarActual = useCallback(() => {
    const prev = actualRef.current;
    actualRef.current = null;
    if (!prev) return;
    void fundir(prev.audio, 0, FUNDIDO_MS, () => false).then(() => {
      prev.audio.pause();
      prev.audio.removeAttribute("src");
      prev.audio.load();
    });
  }, []);

  // Reproduce / funde según pista, preferencia y disponibilidad.
  useEffect(() => {
    if (!activo || !disponible || !pista) {
      apagarActual();
      return;
    }
    if (actualRef.current?.src === pista) return;
    apagarActual();

    const gen = ++genRef.current;
    const audio = new Audio(pista);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    actualRef.current = { audio, src: pista };
    const objetivo = () => (vozRef.current ? VOLUMEN_VOZ : VOLUMEN);
    const cancelado = () => genRef.current !== gen || actualRef.current?.audio !== audio;

    let esperandoGesto: (() => void) | null = null;
    const arrancar = () =>
      audio
        .play()
        .then(() => fundir(audio, objetivo(), FUNDIDO_MS, cancelado))
        .catch((err: unknown) => {
          // Autoplay bloqueado: se reintenta con el primer gesto del usuario.
          if (err instanceof DOMException && err.name === "NotAllowedError" && !esperandoGesto) {
            esperandoGesto = () => {
              quitarGesto();
              if (!cancelado()) void arrancar();
            };
            window.addEventListener("pointerdown", esperandoGesto, { once: true });
            window.addEventListener("keydown", esperandoGesto, { once: true });
          } else if (!(err instanceof DOMException && err.name === "AbortError")) {
            setChequeo({ src: pista, ok: false });
          }
        });
    const quitarGesto = () => {
      if (!esperandoGesto) return;
      window.removeEventListener("pointerdown", esperandoGesto);
      window.removeEventListener("keydown", esperandoGesto);
      esperandoGesto = null;
    };
    audio.addEventListener("error", () => !cancelado() && setChequeo({ src: pista, ok: false }), { once: true });
    void arrancar();
    return quitarGesto;
  }, [activo, disponible, pista, apagarActual]);

  // Ducking con fundido corto.
  useEffect(() => {
    vozRef.current = voz;
    const a = actualRef.current;
    if (!a) return;
    let cancel = false;
    void fundir(a.audio, voz ? VOLUMEN_VOZ : VOLUMEN, 400, () => cancel);
    return () => {
      cancel = true;
    };
  }, [voz]);

  // Al salir de /servicios por completo.
  useEffect(() => () => apagarActual(), [apagarActual]);

  if (!disponible) return null;

  const alternar = () => {
    const on = !activo;
    setActivo(on);
    guardarPreferencia(on);
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={activo}
      aria-label={activo ? "Apagar sonido de ambiente" : "Encender sonido de ambiente"}
      className={cn(
        "group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-[55] flex items-center gap-2 border bg-[#020a18]/80 px-3 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] backdrop-blur-md transition-colors md:bottom-6 md:left-6",
        activo ? "border-[#6b8aff]/60 text-white" : "border-white/15 text-white/60 hover:text-white"
      )}
    >
      {activo ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
      <span className="hidden sm:inline">{activo ? "Ambiente" : "Sonido"}</span>
      {activo && (
        <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[2px] animate-pulse bg-[#6b8aff] motion-reduce:animate-none"
              style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 180}ms` }}
            />
          ))}
        </span>
      )}
    </button>
  );
}
