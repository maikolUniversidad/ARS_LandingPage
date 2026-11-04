"use client";

import { useEffect, useRef, type RefObject } from "react";
import { MuroScene } from "./MuroScene";
import type { Pantalla } from "./pantallas";

export type MuroApi = { focus: (index: number | null) => void };

/**
 * Canvas WebGL del muro de mando (se carga con `next/dynamic`, sin SSR).
 * Crea UNA MuroScene, la pausa cuando la sección no se ve o la pestaña está oculta
 * y mueve la etiqueta de hover por ref (sin re-render por cuadro).
 */
export default function MuroCanvas({
  pantallas,
  lowPower,
  reducedMotion,
  touch,
  active,
  labelRef,
  apiRef,
  onReady,
  onFail,
  onHover,
  onFocus,
}: {
  pantallas: Pantalla[];
  lowPower: boolean;
  reducedMotion: boolean;
  touch: boolean;
  /** false cuando la sección salió de pantalla → se detiene el render. */
  active: boolean;
  labelRef: RefObject<HTMLDivElement | null>;
  apiRef: RefObject<MuroApi | null>;
  onReady: () => void;
  onFail: () => void;
  onHover: (index: number | null) => void;
  onFocus: (index: number | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<MuroScene | null>(null);
  const activeRef = useRef(active);
  const cb = useRef({ onReady, onFail, onHover, onFocus });

  useEffect(() => {
    cb.current = { onReady, onFail, onHover, onFocus };
  }, [onReady, onFail, onHover, onFocus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let scene: MuroScene;
    try {
      scene = MuroScene.create(canvas, {
        pantallas,
        lowPower,
        reducedMotion,
        touch,
        onFatal: () => cb.current.onFail(),
        onReady: () => cb.current.onReady(),
        onHover: (i) => cb.current.onHover(i),
        onFocus: (i) => cb.current.onFocus(i),
        onLabel: (x, y, visible) => {
          const el = labelRef.current;
          if (!el) return;
          el.style.opacity = visible ? "1" : "0";
          if (visible) {
            const half = el.offsetWidth / 2 + 8;
            const cx = Math.min(Math.max(x, half), wrap.clientWidth - half);
            el.style.transform = `translate3d(${cx.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
          }
        },
      });
    } catch {
      cb.current.onFail();
      return;
    }
    sceneRef.current = scene;
    apiRef.current = { focus: (i) => scene.focus(i) };

    const resize = () => scene.setSize(wrap.clientWidth, wrap.clientHeight);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const sync = () => {
      if (activeRef.current && document.visibilityState === "visible") scene.start();
      else scene.stop();
    };
    sync();
    document.addEventListener("visibilitychange", sync);

    // Puntero: parallax + hover (escritorio) y clic/toque para enfocar.
    let downX = 0;
    let downY = 0;
    let downAt = 0;
    const rel = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, r };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const { x, y, r } = rel(e);
      scene.setPointer(x, y, x >= 0 && y >= 0 && x <= r.width && y <= r.height);
    };
    const onLeave = () => scene.setPointer(0, 0, false);
    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      downAt = performance.now();
    };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8 || performance.now() - downAt > 600) return;
      const { x, y } = rel(e);
      scene.click(x, y);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      apiRef.current = null;
      scene.dispose();
      sceneRef.current = null;
    };
  }, [pantallas, lowPower, reducedMotion, touch, labelRef, apiRef]);

  useEffect(() => {
    activeRef.current = active;
    const scene = sceneRef.current;
    if (!scene) return;
    if (active && document.visibilityState === "visible") scene.start();
    else scene.stop();
  }, [active]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block size-full cursor-default" aria-hidden="true" />
    </div>
  );
}
