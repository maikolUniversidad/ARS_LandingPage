"use client";

import { useEffect, useRef, useState } from "react";
import { MSG_PLAN, type EscenaPlan } from "@/lib/vision/plan";
import { cn } from "@/lib/utils";

export type EventoPlan = { cam: number; analitica: string; texto: string; nivel: "detecta" | "alerta" | "ok" };

type Mensaje = { tipo?: string; listo?: boolean; montado?: boolean; cam?: number; evento?: EventoPlan; error?: string };

type Props = {
  escena: EscenaPlan;
  /** Cámara activa (índice en escena.camaras); −1 = recorrido automático. */
  cam: number;
  vista: "maqueta" | "cctv";
  onCam?: (cam: number) => void;
  onEvento?: (e: EventoPlan) => void;
  className?: string;
  textos: { cargando: string; error: string };
};

const SRC = "/analiticas-3d/plan.html";
const ESPERA_MS = 20_000;

/**
 * Maqueta 3D de la propuesta: un iframe con el mismo motor de las simulaciones
 * (public/analiticas-3d/plan.html). El iframe se crea una sola vez; cada nueva
 * propuesta, cámara o vista viaja por postMessage sin recargar el motor.
 */
export function Plano3D({ escena, cam, vista, onCam, onEvento, className, textos }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [listo, setListo] = useState(false);
  // Escena que el iframe ya terminó de montar (el aviso de carga se ve mientras no coincida con la pedida).
  const [montada, setMontada] = useState<EscenaPlan | null>(null);
  const [error, setError] = useState(false);
  const pedido = useRef({ escena, cam, vista });
  const cbs = useRef({ onCam, onEvento });
  useEffect(() => {
    pedido.current = { escena, cam, vista };
    cbs.current = { onCam, onEvento };
  });

  // Mensajes de ESTE iframe.
  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const w = iframeRef.current?.contentWindow;
      if (!w || ev.source !== w) return;
      const d = ev.data as Mensaje | null;
      if (!d || d.tipo !== MSG_PLAN) return;
      if (d.error) {
        setError(true);
        return;
      }
      if (d.listo) {
        setListo(true);
        const p = pedido.current;
        w.postMessage({ tipo: MSG_PLAN, escena: p.escena, cam: p.cam, vista: p.vista }, "*");
      }
      if (d.montado) setMontada(pedido.current.escena);
      if (typeof d.cam === "number") cbs.current.onCam?.(d.cam);
      if (d.evento) cbs.current.onEvento?.(d.evento);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Si el motor no avisa a tiempo (sin WebGL, red caída), se muestra el aviso en vez de un recuadro gris.
  useEffect(() => {
    if (listo || error) return;
    const t = window.setTimeout(() => setError(true), ESPERA_MS);
    return () => window.clearTimeout(t);
  }, [listo, error]);

  // Nueva propuesta → remonta la escena.
  const escenaPrev = useRef<EscenaPlan | null>(null);
  useEffect(() => {
    const w = iframeRef.current?.contentWindow;
    if (!listo || !w) return;
    if (escenaPrev.current === escena) return;
    const primera = escenaPrev.current === null;
    escenaPrev.current = escena;
    if (primera) return; // la primera ya se envió al recibir `listo`
    w.postMessage({ tipo: MSG_PLAN, escena, cam: pedido.current.cam, vista: pedido.current.vista }, "*");
  }, [escena, listo]);

  useEffect(() => {
    const w = iframeRef.current?.contentWindow;
    if (listo && w) w.postMessage({ tipo: `${MSG_PLAN}-cam`, cam }, "*");
  }, [cam, listo]);

  useEffect(() => {
    const w = iframeRef.current?.contentWindow;
    if (listo && w) w.postMessage({ tipo: `${MSG_PLAN}-vista`, vista }, "*");
  }, [vista, listo]);

  return (
    <div className={cn("relative overflow-hidden bg-[#DDE3EE]", className)}>
      {!error && (
        <iframe ref={iframeRef} src={SRC} title="Maqueta 3D de la propuesta de cámaras" className="absolute inset-0 h-full w-full border-0" allow="fullscreen" />
      )}
      {!error && montada !== escena && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#DDE3EE]/80 font-mono text-[10px] uppercase tracking-[0.3em] text-[#5F6883]">
          <span className="flex items-center gap-3">
            <span className="size-2 animate-pulse rounded-full bg-[#2348D4]" aria-hidden />
            {textos.cargando}
          </span>
        </div>
      )}
      {error && <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-[#0A1330]">{textos.error}</div>}
    </div>
  );
}
