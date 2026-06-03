"use client";

import { useEffect, useRef, useState } from "react";
import { LiveAIOverlay } from "./LiveAIOverlay";
import type { DemoType } from "@/data/ai-capabilities";

/**
 * Live webcam capture + DETECCIÓN REAL de IA en el navegador.
 *
 * Pide permiso con `getUserMedia` (disparado por el botón = gesto del usuario).
 * Da feedback inmediato ("Solicitando permiso…"), tiene timeout, detecta permiso
 * bloqueado y siempre permite reintentar. Sobre el video corre LiveAIOverlay
 * (MediaPipe): cajas/esqueleto reales, sin servidor, sin costo por frame.
 */

type Props = {
  demoType: DemoType;
};

type Phase = "idle" | "requesting" | "live";

const REQUEST_TIMEOUT_MS = 20000;

export function CameraStream({ demoType }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const busyRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const streaming = phase === "live";

  // Teardown seguro: esperar el play() pendiente y pausar ANTES de soltar el
  // srcObject, para evitar el AbortError "media resource was aborted".
  async function teardown() {
    const v = videoRef.current;
    if (v) {
      try {
        await playPromiseRef.current?.catch(() => {});
        v.pause();
        v.srcObject = null;
      } catch {
        /* ignora abortos de media */
      }
    }
    playPromiseRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function mapError(e: unknown): string {
    if (e instanceof Error) {
      switch (e.name) {
        case "NotAllowedError":
        case "SecurityError":
          return "Permiso denegado. Tocá el ícono de cámara/candado en la barra de direcciones, permití la cámara para este sitio y reintentá.";
        case "NotFoundError":
        case "DevicesNotFoundError":
          return "No se encontró ninguna cámara conectada.";
        case "NotReadableError":
        case "TrackStartError":
          return "La cámara está en uso por otra app (Zoom, Meet, otra pestaña). Cerrala y reintentá.";
        case "OverconstrainedError":
          return "La cámara no soporta la resolución pedida. Reintentá.";
        case "TimeoutError":
          return "El navegador no respondió al pedido de cámara. Revisá el ícono de permiso en la barra de direcciones. Si estás viéndolo dentro de VS Code, abrilo en Chrome/Edge (http://localhost).";
        default:
          return e.message || "No se pudo acceder a la cámara.";
      }
    }
    return "No se pudo acceder a la cámara.";
  }

  async function start() {
    if (busyRef.current) return; // evita doble-click concurrente (no queda pegado)
    setError(null);

    // getUserMedia sólo existe en contexto seguro (HTTPS o localhost).
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      const insecure =
        typeof window !== "undefined" && window.isSecureContext === false;
      setError(
        insecure
          ? "La cámara necesita un contexto seguro: abrí el sitio por HTTPS o en http://localhost (no por una IP de red como 192.168.x.x)."
          : "Tu navegador no expone la cámara (getUserMedia). Probá en Chrome, Edge o Safari actualizados."
      );
      setPhase("idle");
      return;
    }

    // Si ya hay un stream vivo, sólo asegurar el estado.
    if (streamRef.current) {
      setPhase("live");
      return;
    }

    busyRef.current = true;
    setPhase("requesting");

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new DOMException("timeout", "TimeoutError")),
        REQUEST_TIMEOUT_MS
      )
    );

    try {
      const stream = (await Promise.race([
        navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: false,
        }),
        timeout,
      ])) as MediaStream;

      streamRef.current = stream;
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        playPromiseRef.current = v.play();
        await playPromiseRef.current.catch(() => {});
      }
      setPhase("live");
    } catch (e) {
      console.error("[CameraStream] getUserMedia falló:", e);
      setError(mapError(e));
      setPhase("idle");
      // Limpiar cualquier track que haya quedado a medias.
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    } finally {
      busyRef.current = false;
    }
  }

  function stop() {
    void teardown();
    setPhase("idle");
  }

  // Detectar proactivamente si el permiso ya está bloqueado.
  useEffect(() => {
    const perms = navigator.permissions;
    if (!perms?.query) return;
    perms
      .query({ name: "camera" as PermissionName })
      .then((status) => {
        if (status.state === "denied") {
          setError(
            "El permiso de cámara está bloqueado para este sitio. Habilitalo desde el ícono de la barra de direcciones y reintentá."
          );
        }
      })
      .catch(() => {
        /* algunos navegadores no soportan query de 'camera' */
      });
  }, []);

  // Detener la cámara al desmontar (cambiar de pestaña / salir).
  useEffect(() => {
    return () => {
      void teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative aspect-video w-full overflow-hidden border border-border/60 bg-deep">
      {/* Estado apagado / solicitando */}
      {!streaming && (
        <div className="absolute inset-0 z-30 grid place-items-center text-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-foreground/55">
              {error
                ? "⚠ Error"
                : phase === "requesting"
                  ? "Cámara · Solicitando"
                  : "Cámara · Apagada"}
            </div>
            <div className="mt-3 font-heading text-2xl font-black uppercase tracking-tight text-foreground/85">
              {error
                ? "No se pudo iniciar"
                : phase === "requesting"
                  ? "Esperando permiso…"
                  : "Listo para activar"}
            </div>
            {error && (
              <div className="mx-auto mt-3 max-w-md font-mono text-[11px] leading-relaxed text-foreground/60">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={() => void start()}
              disabled={phase === "requesting"}
              className="bevel-btn mt-6 inline-flex items-center gap-3 border border-accent bg-accent/15 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-accent/25 disabled:cursor-wait disabled:opacity-60"
            >
              <span className={`text-accent ${phase === "requesting" ? "animate-pulse" : ""}`}>
                ●
              </span>
              {phase === "requesting"
                ? "Solicitando…"
                : error
                  ? "Reintentar"
                  : "Activar cámara"}
            </button>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40">
              El navegador te pedirá permiso. La imagen no sale de tu computadora.
            </div>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        playsInline
        muted
        onError={() => {
          /* Ignora errores de media (abortos al soltar el stream). */
        }}
        className={`pointer-events-none size-full object-cover ${streaming ? "opacity-100" : "opacity-0"}`}
      />

      {/* Detección de IA REAL en vivo (MediaPipe, en el navegador) */}
      <LiveAIOverlay videoRef={videoRef} demoType={demoType} active={streaming} />

      {/* HUD */}
      {streaming && (
        <>
          {/* Top status bar */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/85">
            <div className="flex items-center gap-2 border border-accent/50 bg-deep/70 px-3 py-1.5 backdrop-blur">
              <span className="size-1.5 animate-pulse bg-red-500" />
              <span>REC · LIVE</span>
            </div>
            <div className="flex items-center gap-2 border border-border/40 bg-deep/70 px-3 py-1.5 backdrop-blur">
              <span className="text-accent">◉</span>
              <span>ARS · {demoType.toUpperCase()}</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between p-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50">
              Local · 1280×720 · Procesado en navegador
            </div>
            <button
              type="button"
              onClick={stop}
              className="border border-border/50 bg-deep/70 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/70 backdrop-blur transition-colors hover:border-red-400 hover:text-red-400"
            >
              ✕ Apagar cámara
            </button>
          </div>
        </>
      )}
    </div>
  );
}
