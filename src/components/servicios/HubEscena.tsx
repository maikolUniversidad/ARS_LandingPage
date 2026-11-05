"use client";

import { useEffect, useRef, useState } from "react";
import { FOCOS_ESCENA } from "./escenas/contrato";
import { EscenaArea } from "./escenas/EscenaArea";

const CLAVES = Object.keys(FOCOS_ESCENA.edificio);
const CICLO_MS = 7000;
const VIDEO = "/servicios/video/edificio-hero.mp4";
const POSTER = "/servicios/video/edificio-hero.jpg";

/**
 * Escena ambiental del hub: un video cinematográfico del edificio inteligente
 * como capa base y, fundido encima (screen), el edificio 3D recorriendo sus focos.
 * Con «reducir movimiento»: solo el póster y la escena quieta.
 */
export function HubEscena() {
  const [i, setI] = useState(-1);
  const [reducido, setReducido] = useState(false);
  const [videoFallo, setVideoFallo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueMicrotask(() => setReducido(true));
      return;
    }
    const t = window.setInterval(() => setI((x) => (x + 1) % CLAVES.length), CICLO_MS);
    return () => window.clearInterval(t);
  }, []);

  // El video solo corre mientras el hero está a la vista.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || reducido) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) void v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [reducido]);

  const foco = i < 0 ? null : CLAVES[i];
  return (
    <>
      {/* Capa cinematográfica */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url(${POSTER})` }}
        aria-hidden="true"
      >
        {!reducido && !videoFallo && (
          <video
            ref={videoRef}
            src={VIDEO}
            poster={POSTER}
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFallo(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_40%,rgba(35,72,212,0.25),transparent_70%)]" aria-hidden="true" />

      {/* Escena 3D fundida encima */}
      <div className="absolute inset-0 mix-blend-screen">
        <EscenaArea
          escena="edificio"
          acento="#6b8aff"
          foco={foco}
          className="absolute inset-0"
          conCarga={false}
          respaldo={<div className="grid-bg absolute inset-0 opacity-40" />}
        />
      </div>
      <div className="pointer-events-none absolute bottom-6 right-4 hidden font-mono text-[9px] uppercase tracking-[0.26em] text-white/45 md:right-10 md:block" aria-hidden="true">
        {foco ? FOCOS_ESCENA.edificio[foco] : "Edificio inteligente"}
      </div>
    </>
  );
}
