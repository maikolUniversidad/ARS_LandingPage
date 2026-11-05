"use client";

import { useEffect, useRef } from "react";
import type { ChapterStore } from "./chapter-store";
import type { BoardStrings, ErpStrings } from "./models";
import { ERP_TINT, LAYER_TINT } from "./story";
import { ANCHOR_IDS, UnifiedScene, type Anchor, type AnchorId } from "./UnifiedScene";

/** Color de la etiqueta de cada ancla (capa a la que pertenece). */
const ANCHOR_TINT: Record<AnchorId, string> = {
  p0: LAYER_TINT[0],
  p1: LAYER_TINT[1],
  p2: LAYER_TINT[2],
  p3: LAYER_TINT[3],
  p4: LAYER_TINT[4],
  guard: LAYER_TINT[0],
  camera: LAYER_TINT[1],
  sensor: LAYER_TINT[2],
  robot: LAYER_TINT[3],
  central: LAYER_TINT[4],
  board: "#35e0a1",
  erp: ERP_TINT,
};

export type CanvasLabel = { text: string; meta?: string };

/**
 * Canvas WebGL del home (se carga con `next/dynamic`, sin SSR).
 * Crea UNA UnifiedScene, la pausa cuando no se ve y pinta etiquetas HTML
 * ancladas a objetos 3D moviendo `transform` por ref (sin re-render).
 */
export default function HomeCanvas({
  store,
  reducedMotion,
  lowPower,
  active,
  labels,
  board,
  erp,
  onFail,
  onListo,
}: {
  store: ChapterStore;
  reducedMotion: boolean;
  lowPower: boolean;
  /** false cuando la historia salió de pantalla → se detiene el render. */
  active: boolean;
  labels: Record<AnchorId, CanvasLabel>;
  board: BoardStrings;
  erp: ErpStrings;
  onFail: () => void;
  /** El primer cuadro ya está pintado: el padre funde el cargador hacia la escena. */
  onListo?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<UnifiedScene | null>(null);
  const labelRefs = useRef<Partial<Record<AnchorId, HTMLDivElement | null>>>({});
  const onFailRef = useRef(onFail);
  const onListoRef = useRef(onListo);
  const activeRef = useRef(active);
  const boardRef = useRef(board);

  useEffect(() => {
    onFailRef.current = onFail;
    onListoRef.current = onListo;
  }, [onFail, onListo]);

  const erpRef = useRef(erp);
  const boardKey = JSON.stringify([board, erp]);
  useEffect(() => {
    boardRef.current = board;
    erpRef.current = erp;
  }, [board, erp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const placeLabel = (key: AnchorId, a: Anchor) => {
      const el = labelRefs.current[key];
      if (!el) return;
      // En escritorio no tapar la columna de texto (izq.) ni el riel de capas (der.).
      const w = wrap.clientWidth;
      const blocked = w >= 900 && (a.x < w * 0.46 || (w >= 1280 && a.x > w - 240 && !key.startsWith("p")));
      const show = a.visible && !blocked;
      el.style.opacity = show ? "1" : "0";
      const half = el.offsetWidth / 2 + 8;
      const x = Math.min(Math.max(a.x, half), w - half);
      if (show) el.style.transform = `translate3d(${x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    };

    let scene: UnifiedScene;
    try {
      scene = UnifiedScene.create(canvas, {
        lowPower,
        reducedMotion,
        board: boardRef.current,
        erp: erpRef.current,
        // El contexto se perdió y no volvió en ~3 s (si vuelve antes, la escena sigue sola).
        onFatal: () => onFailRef.current(),
        onListo: () => onListoRef.current?.(),
        onAnchors: (anchors) => {
          for (const id of ANCHOR_IDS) placeLabel(id, anchors[id]);
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
    // boardKey: recrea la escena si cambia el idioma del tablero o del cimiento ERP.
  }, [store, reducedMotion, lowPower, boardKey]);

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
        {ANCHOR_IDS.map((key) => (
          <div
            key={key}
            ref={(el) => {
              labelRefs.current[key] = el;
            }}
            style={{ borderColor: `${ANCHOR_TINT[key]}aa`, color: ANCHOR_TINT[key] }}
            className="absolute left-0 top-0 whitespace-nowrap border bg-[#020a18]/80 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] opacity-0 backdrop-blur-sm transition-opacity duration-300 will-change-transform md:text-[10px]"
          >
            <span className="mr-1.5 inline-block size-1.5 animate-pulse bg-current align-middle motion-reduce:animate-none" />
            {labels[key].meta && <span className="mr-1.5 text-white/60">{labels[key].meta}</span>}
            <span className="text-white/90">{labels[key].text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
