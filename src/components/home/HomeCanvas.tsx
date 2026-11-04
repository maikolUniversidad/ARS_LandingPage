"use client";

import { useEffect, useRef } from "react";
import type { ChapterStore } from "./chapter-store";
import { SecurityScene, type Anchor, type Anchors } from "./SecurityScene";

type LabelKey = keyof Anchors;

const LABEL_STYLE: Record<LabelKey, string> = {
  intruder: "border-[#ffb547]/70 text-[#ffd391]",
  core: "border-[#6b8aff]/70 text-[#c9d6ff]",
  control: "border-[#ff3b5c]/70 text-[#ff9aab]",
  guard: "border-[#5fd8ff]/70 text-[#aeeaff]",
};

/**
 * Canvas WebGL del home (se carga con `next/dynamic`, sin SSR).
 * Crea UNA SecurityScene, la pausa cuando no se ve y pinta etiquetas HTML
 * ancladas a objetos 3D moviendo `transform` por ref (sin re-render).
 */
export default function HomeCanvas({
  store,
  reducedMotion,
  lowPower,
  active,
  labels,
  onFail,
}: {
  store: ChapterStore;
  reducedMotion: boolean;
  lowPower: boolean;
  /** false cuando la historia salió de pantalla → se detiene el render. */
  active: boolean;
  labels: Record<LabelKey, string>;
  onFail: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SecurityScene | null>(null);
  const labelRefs = useRef<Partial<Record<LabelKey, HTMLDivElement | null>>>({});
  const onFailRef = useRef(onFail);
  const activeRef = useRef(active);

  useEffect(() => {
    onFailRef.current = onFail;
  }, [onFail]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const placeLabel = (key: LabelKey, a: Anchor) => {
      const el = labelRefs.current[key];
      if (!el) return;
      // En escritorio no tapar la columna de texto (izq.) ni el riel de capas (der.).
      const w = wrap.clientWidth;
      const blocked = w >= 900 && (a.x < w * 0.47 || (w >= 1280 && a.x > w - 250));
      const show = a.visible && !blocked;
      el.style.opacity = show ? "1" : "0";
      // Mantiene la etiqueta entera dentro de la pantalla.
      const half = el.offsetWidth / 2 + 8;
      const x = Math.min(Math.max(a.x, half), w - half);
      if (show) el.style.transform = `translate3d(${x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    };

    let scene: SecurityScene;
    try {
      scene = new SecurityScene(canvas, {
        lowPower,
        reducedMotion,
        onContextLost: () => onFailRef.current(),
        onAnchors: (a) => {
          placeLabel("intruder", a.intruder);
          placeLabel("core", a.core);
          placeLabel("control", a.control);
          placeLabel("guard", a.guard);
        },
      });
    } catch {
      onFailRef.current();
      return;
    }
    sceneRef.current = scene;

    const toScene = (c: number) => (reducedMotion ? Math.round(c) : c);
    scene.setChapter(toScene(store.get()));
    const unsub = store.subscribe((c) => scene.setChapter(toScene(c)));

    const resize = () => scene.setSize(wrap.clientWidth, wrap.clientHeight);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Pausa: fuera de pantalla o pestaña oculta.
    const sync = () => {
      if (activeRef.current && document.visibilityState === "visible") scene.start();
      else scene.stop();
    };
    sync();
    document.addEventListener("visibilitychange", sync);

    return () => {
      unsub();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [store, reducedMotion, lowPower]);

  useEffect(() => {
    activeRef.current = active;
    const scene = sceneRef.current;
    if (!scene) return;
    if (active && document.visibilityState === "visible") scene.start();
    else scene.stop();
  }, [active]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block size-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {(Object.keys(LABEL_STYLE) as LabelKey[]).map((key) => (
          <div
            key={key}
            ref={(el) => {
              labelRefs.current[key] = el;
            }}
            className={`absolute left-0 top-0 whitespace-nowrap border bg-[#020a18]/75 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] opacity-0 backdrop-blur-sm transition-opacity duration-300 will-change-transform md:text-[10px] ${LABEL_STYLE[key]}`}
          >
            <span className="mr-1.5 inline-block size-1.5 animate-pulse bg-current align-middle" />
            {labels[key]}
          </div>
        ))}
      </div>
    </div>
  );
}
