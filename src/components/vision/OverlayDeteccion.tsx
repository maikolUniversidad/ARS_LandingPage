"use client";

import { useEffect, useRef } from "react";

/** Caja 2D en coordenadas normalizadas [0..1] (x0, y0, x1, y1), origen arriba-izquierda. */
type Caja = { tipo: string; id: string; rol?: string | null; caja: [number, number, number, number] };
export type OverlayDatos = { fps: number; T: number; cuadros: { f: number; cajas: Caja[] }[] };

type Props = {
  datos: OverlayDatos | null;
  /** Video al que se sincroniza (se lee currentTime en cada frame de animación). */
  video: React.RefObject<HTMLVideoElement | null>;
  /** Estado actual de la analítica: colorea las cajas de persona. */
  estado?: "vigila" | "detecta" | "alerta" | "ok";
  className?: string;
};

const COLOR = { vigila: "#5F6883", detecta: "#D9A400", alerta: "#D63B3B", ok: "#2F9E63" };

/**
 * Dibuja sobre el render 3D las cajas que "ve" la analítica (personas y objetos), leídas del
 * overlay.json que produce el render físico. Nada se inventa: solo se proyectan las posiciones reales.
 */
export function OverlayDeteccion({ datos, video, estado = "vigila", className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || !datos) return;
    let raf = 0;
    const porCuadro = new Map(datos.cuadros.map((c) => [c.f, c.cajas]));
    const dibujar = () => {
      const v = video.current;
      const ctx = cv.getContext("2d");
      if (v && ctx) {
        const w = cv.clientWidth, h = cv.clientHeight;
        if (cv.width !== w * devicePixelRatio || cv.height !== h * devicePixelRatio) {
          cv.width = w * devicePixelRatio; cv.height = h * devicePixelRatio;
        }
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const f = Math.min(datos.T - 1, Math.round(v.currentTime * datos.fps));
        const cajas = porCuadro.get(f) ?? [];
        for (const c of cajas) {
          const [x0, y0, x1, y1] = c.caja;
          const persona = c.tipo === "persona";
          ctx.lineWidth = persona ? 2 : 1.25;
          ctx.strokeStyle = persona ? COLOR[estado] : "rgba(255,255,255,0.75)";
          ctx.setLineDash(persona ? [] : [4, 3]);
          ctx.strokeRect(x0 * w, y0 * h, (x1 - x0) * w, (y1 - y0) * h);
          if (persona) {
            ctx.setLineDash([]);
            ctx.font = "600 10px ui-monospace, monospace";
            const txt = (c.rol ?? "persona").toUpperCase() + " · " + c.id;
            const tw = ctx.measureText(txt).width + 8;
            ctx.fillStyle = COLOR[estado];
            ctx.fillRect(x0 * w, y0 * h - 14, tw, 14);
            ctx.fillStyle = "#fff";
            ctx.fillText(txt, x0 * w + 4, y0 * h - 4);
          }
        }
      }
      raf = requestAnimationFrame(dibujar);
    };
    raf = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(raf);
  }, [datos, video, estado]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
