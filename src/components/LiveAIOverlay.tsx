"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserVisionEngine } from "@/lib/vision-browser";
import { BehaviorAnalyzer } from "@/lib/behavior-heuristics";
import { PlateOcrController, type OcrStatus } from "@/lib/plate-ocr";
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
  /** Cómo se muestra el video: "cover" (cámara) o "contain" (video subido). */
  objectFit?: "cover" | "contain";
};

/** Rectángulo del contenido de video dentro del canvas, según object-fit. */
type FitMap = { ox: number; oy: number; dw: number; dh: number };

function fitMapping(
  vw: number,
  vh: number,
  W: number,
  H: number,
  fit: "cover" | "contain"
): FitMap {
  if (!vw || !vh) return { ox: 0, oy: 0, dw: W, dh: H };
  const scale = fit === "contain" ? Math.min(W / vw, H / vh) : Math.max(W / vw, H / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  return { ox: (W - dw) / 2, oy: (H - dh) / 2, dw, dh };
}

// Mapea el "tipo de demo" del laboratorio al modelo real que corre en navegador.
// Los que no tienen modelo en navegador (lpr, ppe, thermal, fire) caen a pose,
// para que igual se vea IA siguiendo a la persona frente a la cámara.
function browserModelForDemo(demoType: DemoType): string {
  switch (demoType) {
    case "face":
      return "face_detection";
    case "vehicle":
      return "vehicle_detection";
    case "lpr":
      // Placas: detectamos el vehículo y hacemos OCR de la placa en el navegador.
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
const RED = "rgb(239,68,68)";

/** Texto del estado del OCR para el HUD. */
function ocrBadge(o: { status: OcrStatus; progress: number; vehicles: number }): string {
  if (o.status === "loading") return `OCR descargando ${o.progress}%`;
  if (o.status === "error") return "OCR error";
  if (o.status === "ready") return o.vehicles === 0 ? "OCR listo · sin vehículo" : "OCR leyendo";
  return "OCR…";
}

export function LiveAIOverlay({ videoRef, demoType, active, objectFit = "cover" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BrowserVisionEngine | null>(null);
  const analyzerRef = useRef<BehaviorAnalyzer | null>(null);
  const plateOcrRef = useRef<PlateOcrController | null>(null);
  const [status, setStatus] = useState<"loading" | "running" | "error">("loading");
  const [fps, setFps] = useState(0);
  const [backend, setBackend] = useState<"GPU" | "CPU">("GPU");
  const [count, setCount] = useState(0);
  const [fightAlarm, setFightAlarm] = useState(false);
  const [ocrState, setOcrState] = useState<{
    status: OcrStatus;
    progress: number;
    vehicles: number;
    framePlate?: string;
    frameScan?: string;
  }>({ status: "idle", progress: 0, vehicles: 0 });

  const modelId = browserModelForDemo(demoType);
  const showCounter = demoType === "people-count" || demoType === "crowd";
  // Heurísticas de comportamiento (brazos arriba 10 s + puño/pelea) sobre pose.
  const runHeuristics = demoType === "behavior";
  // OCR de placas (tesseract.js) sobre los vehículos detectados.
  const enableOcr = demoType === "lpr";

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let cancelled = false;
    let frames = 0;
    let fpsWindow = performance.now();
    let lastPreds: Prediction[] = [];

    const engine = engineRef.current ?? new BrowserVisionEngine();
    engineRef.current = engine;
    const analyzer = analyzerRef.current ?? new BehaviorAnalyzer();
    analyzerRef.current = analyzer;
    analyzer.reset();
    let lastFight = false;
    setFightAlarm(false);

    // OCR de placas: inicializar tesseract solo en el demo de placas.
    let lastOcrKey = "";
    setOcrState({ status: "idle", progress: 0, vehicles: 0 });
    if (enableOcr) {
      const ocr = plateOcrRef.current ?? new PlateOcrController();
      plateOcrRef.current = ocr;
      void ocr.init();
    }

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
              const now = performance.now();
              try {
                lastPreds = engine.detect(modelId, video, now);
              } catch {
                lastPreds = []; // frame no listo → limpiar (evita overlay congelado)
              }

              // OCR de placas → corre throttled por vehículo y anota p.text.
              if (enableOcr) {
                const ocr = plateOcrRef.current;
                if (ocr) {
                  const vehicles = lastPreds.length;
                  if (vehicles > 0) {
                    for (const p of lastPreds) {
                      ocr.schedule(video, p, now);
                      const plate = ocr.plateFor(p.trackId);
                      if (plate) p.text = plate; // confirmada → verde
                      else p.note = ocr.scanLabel(p.trackId); // escaneando → ámbar
                    }
                  } else {
                    // Sin vehículo: escanear una banda del frame (probar con una placa cerca).
                    ocr.scheduleFrame(video, now);
                  }
                  ocr.prune(now);
                  const framePlate = ocr.plateFor("_frame");
                  const frameScan = framePlate ? undefined : ocr.scanLabel("_frame");
                  const key = `${ocr.status}:${ocr.progress}:${vehicles}:${framePlate ?? frameScan ?? ""}`;
                  if (key !== lastOcrKey) {
                    lastOcrKey = key;
                    setOcrState({ status: ocr.status, progress: ocr.progress, vehicles, framePlate, frameScan });
                  }
                }
              }

              // Heurísticas de comportamiento → anota alarma/nota por caja.
              if (runHeuristics) {
                const res = analyzer.analyze(lastPreds, now);
                for (const p of lastPreds) {
                  if (!p.trackId) continue;
                  p.alarm = res.alarms.get(p.trackId);
                  const prog = res.armsProgress.get(p.trackId);
                  p.note =
                    prog != null && p.alarm !== "arms" && p.alarm !== "fight"
                      ? `BRAZOS ${Math.min(10, Math.ceil(prog * 10))}/10s`
                      : undefined;
                }
                if (res.anyFight !== lastFight) {
                  lastFight = res.anyFight;
                  setFightAlarm(res.anyFight);
                }
              }

              const map = fitMapping(
                video.videoWidth,
                video.videoHeight,
                rect.width,
                rect.height,
                objectFit
              );
              draw(ctx, lastPreds, rect.width, rect.height, map);
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
  }, [active, modelId, videoRef, runHeuristics, enableOcr, objectFit]);

  // Liberar el engine al desmontar.
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
      analyzerRef.current?.reset();
      analyzerRef.current = null;
      void plateOcrRef.current?.dispose();
      plateOcrRef.current = null;
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

      {/* Banner de PELEA detectada (heurística de demo) */}
      {runHeuristics && fightAlarm && status === "running" && (
        <div className="absolute left-1/2 top-14 z-30 -translate-x-1/2 animate-pulse border-2 border-red-500 bg-red-600/85 px-5 py-2 text-center backdrop-blur">
          <div className="font-heading text-lg font-black uppercase tracking-tight text-white">
            ⚠ Pelea detectada
          </div>
          <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/80">
            Heurística de demo · no apto para seguridad real
          </div>
        </div>
      )}

      {/* Demo de placas sin vehículo en cuadro: muestra el escaneo del frame. */}
      {enableOcr && status === "running" && ocrState.status === "ready" && ocrState.vehicles === 0 && (
        <div
          className="absolute left-1/2 top-14 z-20 -translate-x-1/2 border bg-deep/85 px-5 py-2 text-center backdrop-blur"
          style={{ borderColor: ocrState.framePlate ? "rgba(22,163,74,0.8)" : "rgba(35,72,212,0.5)" }}
        >
          {ocrState.framePlate ? (
            <>
              <div className="font-mono text-[8px] uppercase tracking-[0.3em] text-foreground/55">Placa leída</div>
              <div className="font-heading text-2xl font-black tracking-tight text-green-400 tabular-nums">
                ▣ {ocrState.framePlate}
              </div>
            </>
          ) : (
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/65">
              {ocrState.frameScan ?? "Acercá una placa o subí un video con autos · de frente"}
            </div>
          )}
        </div>
      )}

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
        {status === "running" &&
          `◉ IA real · ${backend} · ${fps} fps · ${count} det${
            enableOcr ? ` · ${ocrBadge(ocrState)}` : ""
          }`}
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
  h: number,
  m: FitMap
) {
  ctx.clearRect(0, 0, w, h);
  for (const p of preds) {
    // Coords normalizadas [0..1] → rectángulo real del video (según object-fit).
    const px = m.ox + p.bbox.x * m.dw;
    const py = m.oy + p.bbox.y * m.dh;
    const pw = p.bbox.width * m.dw;
    const ph = p.bbox.height * m.dh;
    const isAlarm = p.alarm === "arms" || p.alarm === "fight";
    const color = isAlarm || p.label.includes("fall") ? RED : ACCENT;

    // Caja + relleno suave (más fuerte si hay alarma)
    ctx.strokeStyle = color;
    ctx.lineWidth = isAlarm ? 3 : 2;
    ctx.strokeRect(px, py, pw, ph);
    ctx.fillStyle = color.replace("rgb(", "rgba(").replace(")", isAlarm ? ", 0.18)" : ", 0.08)");
    ctx.fillRect(px, py, pw, ph);

    // Esquinas tipo HUD
    const len = 12;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, py + len); ctx.lineTo(px, py); ctx.lineTo(px + len, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + pw - len, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw, py + len); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py + ph - len); ctx.lineTo(px, py + ph); ctx.lineTo(px + len, py + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + pw - len, py + ph); ctx.lineTo(px + pw, py + ph); ctx.lineTo(px + pw, py + ph - len); ctx.stroke();

    // Etiqueta principal
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

    // Tag de ALARMA sobre la etiqueta
    if (isAlarm) {
      const atext = p.alarm === "fight" ? "⚠ PELEA" : "⚠ ALARMA · BRAZOS 10s";
      const aw = ctx.measureText(atext).width + 12;
      const ay = ly - 20;
      ctx.fillStyle = RED;
      ctx.fillRect(px, ay, aw, 18);
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.fillText(atext, px + 6, ay + 13);
    }

    // Nota de cuenta regresiva (brazos arriba antes de disparar) — ámbar
    if (p.note) {
      const ny = py + ph + 4;
      const nw = ctx.measureText(p.note).width + 12;
      ctx.fillStyle = "rgba(2,10,24,0.92)";
      ctx.fillRect(px, ny, nw, 18);
      ctx.strokeStyle = "rgb(234,179,8)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px, ny, nw, 18);
      ctx.fillStyle = "rgb(253,224,71)";
      ctx.fillText(p.note, px + 6, ny + 13);
    }

    // Placa leída por OCR (verde) — bajo la caja
    if (p.text) {
      const ptext = `▣ ${p.text}`;
      ctx.font = "bold 13px ui-monospace, monospace";
      const ptw = ctx.measureText(ptext).width + 14;
      const pty = py + ph + 4;
      ctx.fillStyle = "rgba(22,163,74,0.92)";
      ctx.fillRect(px, pty, ptw, 22);
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.fillText(ptext, px + 7, pty + 16);
      ctx.font = "bold 11px ui-monospace, monospace";
    }

    // Esqueleto de pose (rojo si alarma)
    if (p.keypoints && p.keypoints.length > 0) {
      ctx.strokeStyle = isAlarm ? "rgba(248,113,113,0.95)" : ACCENT_LIGHT;
      ctx.lineWidth = 2;
      for (const [a, b] of POSE_EDGES) {
        const ka = p.keypoints[a];
        const kb = p.keypoints[b];
        if (!ka || !kb || ka[2] < 0.5 || kb[2] < 0.5) continue;
        ctx.beginPath();
        ctx.moveTo(m.ox + ka[0] * m.dw, m.oy + ka[1] * m.dh);
        ctx.lineTo(m.ox + kb[0] * m.dw, m.oy + kb[1] * m.dh);
        ctx.stroke();
      }
      ctx.fillStyle = isAlarm ? "rgba(248,113,113,0.95)" : ACCENT_LIGHT;
      for (const k of p.keypoints) {
        if (k[2] < 0.5) continue;
        ctx.beginPath();
        ctx.arc(m.ox + k[0] * m.dw, m.oy + k[1] * m.dh, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
