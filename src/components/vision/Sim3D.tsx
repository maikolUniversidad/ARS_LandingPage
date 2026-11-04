"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { simUrl, type EstadoSim } from "@/data/analiticas";
import { cn } from "@/lib/utils";

type Props = {
  /** id de la analítica (coincide con la escena de public/analiticas-3d). */
  id: string;
  /** Mostrar el recuadro "lo que ve la cámara". */
  pip?: boolean;
  className?: string;
  title?: string;
  /**
   * Avisa cada cambio de fase de la simulación: el estado (vigila → detecta →
   * alerta → ok) y el índice del paso dentro de `fases` (-1 al reiniciar el ciclo).
   */
  onFase?: (fase: EstadoSim, idx: number, id: string) => void;
  /** Avisa cuando el motor 3D terminó de cargar (una sola vez por iframe). */
  onListo?: () => void;
  /** Cargar recién cuando entra en pantalla (por defecto sí). */
  lazy?: boolean;
  /** "cctv": la escena se ve desde la cámara que grabó el video real; "maqueta": vista libre para girar. */
  vista?: "cctv" | "maqueta";
  /**
   * Video que manda el reloj: la simulación sigue su segundo (play, pausa, salto y loop),
   * así el 3D y el video muestran el mismo momento. Sin video, la simulación corre sola.
   */
  relojRef?: RefObject<HTMLVideoElement | null>;
  /** Cambia cuando cambia el elemento de video (p. ej. el id de la analítica), para re-enganchar el reloj. */
  relojClave?: string | null;
};

/** Vista con la que arrancó el iframe (va en su URL). */
function vista0(src: string): "cctv" | "maqueta" {
  return src.includes("vista=cctv") ? "cctv" : "maqueta";
}

type Mensaje = {
  tipo?: string;
  id?: string;
  fase?: EstadoSim;
  idx?: number;
  listo?: boolean;
  montado?: boolean;
  error?: string;
};

/**
 * Simulación 3D de una analítica, embebida desde public/analiticas-3d/sim.html.
 *
 * El iframe se crea UNA vez: al cambiar `id` se le pide por postMessage que
 * monte otra escena, sin recargar el motor three.js ni el modelo de la persona
 * (~4 MB). El contenedor debe tener tamaño propio (p. ej. `aspect-[16/10]`).
 */
export function Sim3D({ id, pip = true, className, title, onFase, onListo, lazy = true, vista = "maqueta", relojRef, relojClave }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const listoRef = useRef(false);
  const pedidoRef = useRef({ id, pip, vista });
  const [src] = useState(() => simUrl(id, { pip, vista }));
  const [listo, setListo] = useState(false);
  const [visible, setVisible] = useState(!lazy);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lazy || visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy, visible]);

  // Mensajes del iframe (solo los de ESTE iframe, por ev.source).
  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const w = iframeRef.current?.contentWindow;
      if (!w || ev.source !== w) return;
      const d = ev.data as Mensaje | null;
      if (!d || d.tipo !== "vigias-sim") return;
      if (d.error === "sin-webgl") {
        setError(d.error);
        return;
      }
      if (d.listo) {
        listoRef.current = true;
        const p = pedidoRef.current;
        if (d.id !== p.id || p.vista !== vista0(src)) w.postMessage({ tipo: "vigias-sim-ir", id: p.id, pip: p.pip, vista: p.vista }, "*");
        setListo(true);
        onListo?.();
      }
      if (d.fase && d.id === pedidoRef.current.id) onFase?.(d.fase, d.idx ?? -1, d.id);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [onFase, onListo, src]);

  // Cambio de analítica: se lo pedimos al motor ya cargado.
  useEffect(() => {
    pedidoRef.current = { id, pip, vista };
    const w = iframeRef.current?.contentWindow;
    if (listoRef.current && w) w.postMessage({ tipo: "vigias-sim-ir", id, pip, vista }, "*");
  }, [id, pip, vista]);

  // Reloj compartido: el segundo del video viaja a la simulación (4 veces por segundo y en cada evento del video).
  useEffect(() => {
    const w = iframeRef.current?.contentWindow;
    if (!listo || !w) return;
    const v = relojRef?.current ?? null;
    const enviar = () => {
      if (!v || !Number.isFinite(v.currentTime) || v.readyState < 1) {
        w.postMessage({ tipo: "vigias-sim-t", t: v ? 0 : null, play: false }, "*");
        return;
      }
      w.postMessage({ tipo: "vigias-sim-t", t: v.currentTime, play: !v.paused && !v.ended, rate: v.playbackRate }, "*");
    };
    enviar();
    if (!v) return;
    const evs = ["play", "pause", "seeked", "seeking", "loadedmetadata", "ratechange", "timeupdate"] as const;
    evs.forEach((e) => v.addEventListener(e, enviar));
    const iv = window.setInterval(enviar, 250);
    return () => {
      evs.forEach((e) => v.removeEventListener(e, enviar));
      window.clearInterval(iv);
      w.postMessage({ tipo: "vigias-sim-t", t: null }, "*");
    };
  }, [listo, relojRef, relojClave, id]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-[#DDE3EE]", className)}>
      {visible && !error && (
        <iframe
          ref={iframeRef}
          src={src}
          title={title ?? "Simulación 3D"}
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen"
        />
      )}
      {!visible && (
        <div className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#5F6883]">
          Simulación 3D
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-[#0A1330]">
          La vista 3D no cargó en este navegador. Puede abrir la presentación completa desde el final de la página.
        </div>
      )}
    </div>
  );
}
