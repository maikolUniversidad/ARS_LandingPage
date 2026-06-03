"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserVisionEngine } from "@/lib/vision-browser";
import type { Prediction } from "@/lib/vision-mock";
import type { DemoType } from "@/data/ai-capabilities";

/**
 * Overlay de DETECCIÓN REAL en vivo sobre un <video> (cámara o archivo).
 *
 * Corre MediaPipe en el navegador (vision-browser.ts) y dibuja cajas + esqueleto
 * de pose sobre un canvas encima del video. Sin servidor, sin costo por frame.
 * Es lo que hace que se vea IA de verdad (no las cajas sintéticas del DemoOverlay).
 */

type Props = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  demoType: DemoType;
  active: boolean;
};

// Mapea el "tipo de demo" del laboratorio al modelo real que corre en navegador.
// Los que no tienen modelo en navegador (lpr, ppe, thermal, fire) caen a pose,
// para que igual se vea IA siguiendo a la persona frente a la cámara.
function browserModelForDemo(demoType: DemoType): string {
  switch (demoType) {
    case "face":
      return "face_detection";
    case "vehicle":
      return "vehicle_detection";
    case "fall":
    case "behavior":
      // Comportamiento se demuestra con pose (esqueleto) en vivo.
      return "pose_detection";
    case "people-count":
    case "intrusion":
    case "crowd":
    case "object":
      return "people_detection";
    default:
      return "pose_detection";
  }
}

// 17 keypoints COCO → aristas del esqueleto (igual que VisionCanvas).
const POSE_EDGES: Array<[number, number]> = [
  [5, 6],
  [5, 7], [7, 9],
  [6, 8], [8, 10],
  [11, 12],
  [5, 11], [6, 12],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
];

const ACCENT = "rgb(35, 72, 212)";
const ACCENT_LIGHT = "rgb(107, 138, 255)";

export function LiveAIOverlay({ videoRef, demoType, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BrowserVisionEngine | null>(null);
  const [status, setStatus] = useState<"loading" | "running" | "error">("loading");
  const [fps, setFps] = useState(0);
  const [backend, setBackend] = useState<"GPU" | "CPU">("GPU");
  const [count, setCount] = useState(0);

  const modelId = browserModelForDemo(demoType);
  const showCounter = demoType === "people-count" || demoType === "crowd";

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let cancelled = false;
    let frames = 0;
    let fpsWindow = performance.now();
    let lastPreds: Prediction[] = [];

    const engine = engineRef.current ?? new BrowserVisionEngine();
    engineRef.current = engine;

    (async () => {
      setStatus("loading");
      try {
        await engine.ensure(modelId, true);
        if (cancelled) return;
        setBackend(engine.backend);
        setStatus("running");

        const loop = () => {
          if (cancelled) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
            // Ajustar el canvas al tamaño mostrado del video.
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            if (canvas.width !== Math.round(rect.width * dpr)) {
              canvas.width = Math.round(rect.width * dpr);
              canvas.height = Math.round(rect.height * dpr);
            }
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
              try {
                const now = performance.now();
                lastPreds = engine.detect(modelId, video, now);
              } catch {
                /* frame aún no listo */
              }
              draw(ctx, lastPreds, rect.width, rect.height);
              setCount(lastPreds.length);

              frames += 1;
              const t = performance.now();
              if (t - fpsWindow >= 1000) {
                setFps(Math.round((frames * 1000) / (t - fpsWindow)));
                frames = 0;
                fpsWindow = t;
              }
            }
          }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      } catch (e) {
        console.error("LiveAIOverlay error", e);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, modelId, videoRef]);

  // Liberar el engine al desmontar.
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  if (!active) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
        style={{ zIndex: 10 }}
        aria-label="Detección de IA en vivo"
      />

      {/* Contador de personas en escena (conteo / aglomeración) */}
      {showCounter && status === "running" && (
        <div className="absolute left-1/2 top-14 z-20 -translate-x-1/2 border border-accent/60 bg-deep/80 px-5 py-2 text-center backdrop-blur">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/55">
            Personas en escena
          </div>
          <div className="font-heading text-4xl font-black leading-none tracking-tight text-accent tabular-nums">
            {count}
          </div>
        </div>
      )}
      {/* Estado del motor */}
      <div
        className="absolute left-3 top-14 z-20 border bg-deep/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] backdrop-blur"
        style={{
          borderColor:
            status === "running"
              ? "rgba(74,222,128,0.5)"
              : status === "error"
                ? "rgba(248,113,113,0.5)"
                : "rgba(234,179,8,0.5)",
          color:
            status === "running"
              ? "rgb(134,239,172)"
              : status === "error"
                ? "rgb(252,165,165)"
                : "rgb(253,224,71)",
        }}
      >
        {status === "loading" && "⟳ cargando modelo de IA…"}
        {status === "running" && `◉ IA real · ${backend} · ${fps} fps · ${count} det`}
        {status === "error" && "✕ no se pudo iniciar el modelo"}
      </div>
    </>
  );
}

// ─────────────────────────── Dibujo ───────────────────────────

function draw(
  ctx: CanvasRenderingContext2D,
  preds: Prediction[],
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);
  for (const p of preds) {
    const px = p.bbox.x * w;
    const py = p.bbox.y * h;
    const pw = p.bbox.width * w;
    const ph = p.bbox.height * h;
    const color = p.label.includes("fall") ? "rgb(239,68,68)" : ACCENT;

    // Caja + relleno suave
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);
    ctx.fillStyle = color.replace("rgb(", "rgba(").replace(")", ", 0.08)");
    ctx.fillRect(px, py, pw, ph);

    // Esquinas tipo HUD
    const len = 12;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, py + len); ctx.lineTo(px, py); ctx.lineTo(px + len, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + pw - len, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw, py + len); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py + ph - len); ctx.lineTo(px, py + ph); ctx.lineTo(px + len, py + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + pw - len, py + ph); ctx.lineTo(px + pw, py + ph); ctx.lineTo(px + pw, py + ph - len); ctx.stroke();

    // Etiqueta
    const text = `${p.label} · ${(p.confidence * 100).toFixed(0)}%`;
    ctx.font = "bold 11px ui-monospace, monospace";
    const tw = ctx.measureText(text).width + 12;
    const ly = py > 20 ? py - 20 : py;
    ctx.fillStyle = "rgba(2,10,24,0.92)";
    ctx.fillRect(px, ly, tw, 18);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(px, ly, tw, 18);
    ctx.fillStyle = "rgba(213,224,255,0.95)";
    ctx.fillText(text, px + 6, ly + 13);

    // Esqueleto de pose
    if (p.keypoints && p.keypoints.length > 0) {
      ctx.strokeStyle = ACCENT_LIGHT;
      ctx.lineWidth = 2;
      for (const [a, b] of POSE_EDGES) {
        const ka = p.keypoints[a];
        const kb = p.keypoints[b];
        if (!ka || !kb || ka[2] < 0.5 || kb[2] < 0.5) continue;
        ctx.beginPath();
        ctx.moveTo(ka[0] * w, ka[1] * h);
        ctx.lineTo(kb[0] * w, kb[1] * h);
        ctx.stroke();
      }
      ctx.fillStyle = ACCENT_LIGHT;
      for (const k of p.keypoints) {
        if (k[2] < 0.5) continue;
        ctx.beginPath();
        ctx.arc(k[0] * w, k[1] * h, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
