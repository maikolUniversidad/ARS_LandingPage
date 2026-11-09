"use client";

import { useEffect, useRef, useState } from "react";
import { analiticas, type EstadoSim } from "@/data/analiticas";
import { Sim3D } from "./Sim3D";
import { OverlayDeteccion, type OverlayDatos } from "./OverlayDeteccion";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  pip?: boolean;
  className?: string;
  title?: string;
  onFase?: (fase: EstadoSim, idx: number, id: string) => void;
  onListo?: () => void;
  lazy?: boolean;
};

/** Render con física real por analítica (generado en local con el molde «Animacion 3D Fisica»). */
type Render = { src: string; poster?: string; dur: number; overlay?: string };
type Manifiesto = Record<string, Render>;

const BASE = "/analiticas-3d/fisica";
let cache: Manifiesto | null = null;
let cargando: Promise<Manifiesto> | null = null;

function cargarManifiesto(): Promise<Manifiesto> {
  if (cache) return Promise.resolve(cache);
  if (!cargando) {
    cargando = fetch(`${BASE}/manifest.json`, { cache: "force-cache" })
      .then((r) => (r.ok ? (r.json() as Promise<Manifiesto>) : {}))
      .catch(() => ({}) as Manifiesto)
      .then((m) => (cache = m));
  }
  return cargando;
}

/**
 * Animación 3D de una analítica. Si existe el render con física real
 * (public/analiticas-3d/fisica/<id>.mp4, listado en manifest.json) lo reproduce
 * en bucle y avisa las fases por tiempo, con el mismo contrato que Sim3D.
 * Si no existe, cae a la simulación three.js de siempre.
 */
export function Anim3D({ id, pip = true, className, title, onFase, onListo, lazy = true }: Props) {
  const [man, setMan] = useState<Manifiesto | null>(cache);
  const [overlay, setOverlay] = useState<OverlayDatos | null>(null);
  const [estado, setEstado] = useState<EstadoSim>("vigila");
  const videoRef = useRef<HTMLVideoElement>(null);
  const idxRef = useRef(-2);
  const faseRef = useRef(onFase);
  faseRef.current = onFase;

  useEffect(() => {
    let vivo = true;
    cargarManifiesto().then((m) => vivo && setMan(m));
    return () => {
      vivo = false;
    };
  }, []);

  const render = man?.[id];
  const fases = analiticas.find((a) => a.id === id)?.fases ?? [];

  // Cajas 2D del render (overlay.json), si existen para esta analítica.
  useEffect(() => {
    let vivo = true;
    setOverlay(null);
    if (!render?.overlay) return;
    fetch(render.overlay, { cache: "force-cache" })
      .then((r) => (r.ok ? (r.json() as Promise<OverlayDatos>) : null))
      .then((d) => vivo && setOverlay(d))
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [render?.overlay]);

  // Reinicio al cambiar de analítica.
  useEffect(() => {
    idxRef.current = -2;
    const v = videoRef.current;
    if (v && render) {
      v.currentTime = 0;
      void v.play().catch(() => undefined);
    }
  }, [id, render]);

  if (man === null) {
    return <div className={cn("relative overflow-hidden bg-[#DDE3EE]", className)} aria-busy="true" />;
  }
  if (!render) {
    return <Sim3D id={id} pip={pip} className={className} title={title} onFase={onFase} onListo={onListo} lazy={lazy} />;
  }

  const onTime = () => {
    const v = videoRef.current;
    if (!v || !fases.length) return;
    let i = -1;
    for (let k = 0; k < fases.length; k++) if (v.currentTime >= fases[k].t) i = k;
    if (i === idxRef.current) return;
    if (i < idxRef.current) faseRef.current?.(fases[0].estado, -1, id); // reinició el ciclo
    idxRef.current = i;
    if (i >= 0) {
      faseRef.current?.(fases[i].estado, i, id);
      setEstado(fases[i].estado);
    }
  };

  return (
    <div className={cn("relative overflow-hidden bg-[#DDE3EE]", className)}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={render.src}
        poster={render.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={title ?? "Animación 3D"}
        onTimeUpdate={onTime}
        onLoadedData={() => onListo?.()}
      />
      {overlay && <OverlayDeteccion datos={overlay} video={videoRef} estado={estado} className="pointer-events-none absolute inset-0 h-full w-full" />}
    </div>
  );
}
