"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ErrorCamara } from "./textos";

/**
 * Ciclo de vida de la webcam para el escenario del laboratorio.
 *
 * - `iniciar()` se llama desde un gesto del usuario (botón), o sola cuando el
 *   permiso ya está concedido (en ese caso el navegador no muestra diálogo).
 * - Se apaga sola (suelta los tracks → se apaga la luz de la cámara) cuando la
 *   pestaña queda oculta o el escenario sale de la vista, y se reanuda al volver
 *   si el usuario la tenía encendida.
 * - Si falla (permiso denegado, sin cámara, contexto inseguro…) avisa por
 *   `onFallo` para que el escenario caiga al video de muestra.
 * - El stream nunca sale de este equipo: solo se asigna al `<video>` local.
 */

export type FaseCamara = "inactiva" | "solicitando" | "viva" | "pausada" | "error";
export type PermisoCamara = "granted" | "denied" | "prompt" | "desconocido";

const TIMEOUT_MS = 20000;

function clasificar(e: unknown): ErrorCamara {
  const name = e instanceof Error || e instanceof DOMException ? e.name : "";
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "denegado";
    case "SecurityError":
      return typeof window !== "undefined" && !window.isSecureContext ? "inseguro" : "denegado";
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
      return "sin-camara";
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
      return "en-uso";
    case "TimeoutError":
      return "timeout";
    default:
      return "otro";
  }
}

/** Diagnóstico previo (sin pedir permiso): ¿puede este navegador usar la cámara? */
export function soporteCamara(): ErrorCamara | null {
  if (typeof window === "undefined") return null;
  if (!window.isSecureContext) return "inseguro";
  if (!navigator.mediaDevices?.getUserMedia) return "no-soportado";
  return null;
}

type Opciones = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Elemento cuya visibilidad en pantalla decide si la cámara sigue encendida. */
  contenedorRef: React.RefObject<HTMLElement | null>;
  /** La fuente activa del escenario es la cámara. */
  habilitada: boolean;
  onFallo: (e: ErrorCamara) => void;
};

export function useCamara({ videoRef, contenedorRef, habilitada, onFallo }: Opciones) {
  const streamRef = useRef<MediaStream | null>(null);
  const quiereRef = useRef(false); // el usuario la quiere encendida
  const apagadaRef = useRef(false); // el usuario la apagó a mano: no auto‑arrancar
  const ocupadoRef = useRef(false);
  const visibleRef = useRef(true);
  const habilitadaRef = useRef(habilitada);
  const onFalloRef = useRef(onFallo);
  const [fase, setFase] = useState<FaseCamara>("inactiva");
  const [error, setError] = useState<ErrorCamara | null>(null);
  const [permiso, setPermiso] = useState<PermisoCamara>("desconocido");
  const [resolucion, setResolucion] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    habilitadaRef.current = habilitada;
    onFalloRef.current = onFallo;
  }, [habilitada, onFallo]);

  const soltar = useCallback(() => {
    const v = videoRef.current;
    if (v && v.srcObject) {
      try {
        v.pause();
        v.srcObject = null;
      } catch {
        /* abortos de media al soltar el stream */
      }
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, [videoRef]);

  const fallar = useCallback(
    (tipo: ErrorCamara) => {
      quiereRef.current = false;
      soltar();
      setError(tipo);
      setFase("error");
      onFalloRef.current(tipo);
    },
    [soltar]
  );

  const iniciar = useCallback(async (): Promise<void> => {
    const pre = soporteCamara();
    if (pre) return fallar(pre);
    if (ocupadoRef.current) return;
    quiereRef.current = true;
    apagadaRef.current = false;
    if (streamRef.current) {
      setFase("viva");
      return;
    }
    ocupadoRef.current = true;
    setError(null);
    setFase("solicitando");
    let timer = 0;
    try {
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: false,
        }),
        new Promise<never>((_, rej) => {
          timer = window.setTimeout(() => rej(new DOMException("timeout", "TimeoutError")), TIMEOUT_MS);
        }),
      ]);
      // Si mientras esperábamos el usuario se fue (pestaña oculta / cambió de fuente), soltamos.
      if (!quiereRef.current || !visibleRef.current || !habilitadaRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        setFase(quiereRef.current && habilitadaRef.current ? "pausada" : "inactiva");
        return;
      }
      streamRef.current = stream;
      const s = stream.getVideoTracks()[0]?.getSettings();
      setResolucion(s?.width && s?.height ? { w: s.width, h: s.height } : null);
      setPermiso("granted");
      setFase("viva");
    } catch (e) {
      const tipo = clasificar(e);
      if (tipo === "denegado") setPermiso("denied");
      fallar(tipo);
    } finally {
      window.clearTimeout(timer);
      ocupadoRef.current = false;
    }
  }, [fallar]);

  /** Apagado explícito (el usuario no la quiere más). */
  const detener = useCallback(() => {
    quiereRef.current = false;
    apagadaRef.current = true;
    soltar();
    setFase("inactiva");
  }, [soltar]);

  /** Pausa automática: suelta la cámara pero recuerda que el usuario la quiere. */
  const pausar = useCallback(() => {
    if (!streamRef.current) return;
    soltar();
    setFase("pausada");
  }, [soltar]);

  // Conectar el stream al <video> montado (el elemento cambia al cambiar de fuente).
  useEffect(() => {
    const v = videoRef.current;
    const s = streamRef.current;
    if (fase !== "viva" || !v || !s || v.srcObject === s) return;
    v.srcObject = s;
    void v.play().catch(() => {});
  }, [fase, habilitada, videoRef]);

  // Estado del permiso sin pedirlo (no todos los navegadores soportan 'camera').
  // Concedido → arranca sola; bloqueado → cae al video de muestra.
  useEffect(() => {
    let status: PermissionStatus | null = null;
    const leer = () => {
      if (!status) return;
      const st = status.state as PermisoCamara;
      setPermiso(st);
      if (!habilitadaRef.current || streamRef.current) return;
      if (st === "denied") fallar("denegado");
      else if (st === "granted" && !apagadaRef.current && !quiereRef.current) void iniciar();
    };
    navigator.permissions
      ?.query({ name: "camera" as PermissionName })
      .then((s) => {
        status = s;
        leer();
        s.addEventListener("change", leer);
      })
      .catch(() => {});
    return () => status?.removeEventListener("change", leer);
  }, [fallar, iniciar]);

  // Pestaña oculta / escenario fuera de la vista → apagar; al volver → reanudar.
  useEffect(() => {
    if (!habilitada) return;
    let enVista = true;
    const evaluar = () => {
      const visible = document.visibilityState === "visible" && enVista;
      visibleRef.current = visible;
      if (!visible) pausar();
      else if (quiereRef.current && !streamRef.current) void iniciar();
    };
    document.addEventListener("visibilitychange", evaluar);
    let io: IntersectionObserver | null = null;
    const el = contenedorRef.current;
    if (el && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([e]) => {
          enVista = e.isIntersecting;
          evaluar();
        },
        { threshold: 0.05 }
      );
      io.observe(el);
    }
    return () => {
      document.removeEventListener("visibilitychange", evaluar);
      io?.disconnect();
    };
  }, [habilitada, contenedorRef, iniciar, pausar]);

  // Cambiar de fuente (muestra/archivo) apaga la cámara.
  useEffect(() => {
    if (habilitada) return;
    quiereRef.current = false;
    soltar();
    setFase((f) => (f === "error" ? f : "inactiva"));
  }, [habilitada, soltar]);

  // Desmontar (salir de la página) apaga la cámara.
  useEffect(() => () => soltar(), [soltar]);

  return { fase, error, permiso, resolucion, iniciar, detener };
}
