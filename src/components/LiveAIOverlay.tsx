"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserVisionEngine } from "@/lib/vision-browser";
import { drawFaceMesh } from "@/lib/face-mesh";
import { BehaviorAnalyzer } from "@/lib/behavior-heuristics";
import { PlateLprController, type OcrStatus } from "@/lib/plate-lpr";
import {
  YoloxDetector,
  EPP_CONFIG,
  WEAPONS_CONFIG,
  FIRE_CONFIG,
  type YoloxConfig,
} from "@/lib/yolox-detector";
import { ThermalFilter } from "@/lib/thermal-filter";
import {
  analyzeCrowd,
  CROWD_LEVEL_META,
  type CrowdAnalysis,
  type CrowdLevel,
} from "@/lib/crowd-analysis";
import type { Prediction } from "@/lib/vision-mock";
import type { DemoType } from "@/data/ai-capabilities";

// Demos que corren con un modelo YOLOX (ONNX) en el navegador. Para agregar uno
// nuevo (p.ej. fuego) basta sumar su config acá: el wiring se activa solo.
const YOLOX_BY_DEMO: Partial<Record<DemoType, YoloxConfig>> = {
  ppe: EPP_CONFIG,
  weapons: WEAPONS_CONFIG,
  fire: FIRE_CONFIG, // YOLOX-S fuego/humo en public/models/fire/ — inferencia real
};

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
// EPP/armas usan YOLOX (efecto aparte) y térmico usa un filtro de color (efecto
// aparte). El resto cae a pose/personas para que igual se vea IA en vivo.
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

/** Límite seguro de personas para la zona encuadrada en el demo de aglomeración. */
const CROWD_CAPACITY = 10;

/** Datos ligeros del análisis de aglomeración para el HUD (el dibujo usa el análisis completo). */
type CrowdHud = {
  count: number;
  level: CrowdLevel;
  densityPct: number;
  closeRatio: number;
  peakCluster: number;
  alert: boolean;
  capacity: number;
};

/** Texto del estado del OCR para el HUD. */
function ocrBadge(o: { status: OcrStatus; progress: number; vehicles: number; engine?: string }): string {
  if (o.status === "loading") return o.progress > 0 ? `OCR descargando ${o.progress}%` : "OCR cargando…";
  if (o.status === "error") return "OCR error";
  const eng = o.engine ? ` (${o.engine})` : "";
  if (o.status === "ready") return o.vehicles === 0 ? `OCR listo${eng}` : `OCR leyendo${eng}`;
  return "OCR…";
}

export function LiveAIOverlay({ videoRef, demoType, active, objectFit = "cover" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BrowserVisionEngine | null>(null);
  const analyzerRef = useRef<BehaviorAnalyzer | null>(null);
  const plateOcrRef = useRef<PlateLprController | null>(null);
  const yoloxRef = useRef<YoloxDetector | null>(null);
  const thermalRef = useRef<ThermalFilter | null>(null);
  const [status, setStatus] = useState<"loading" | "running" | "error">("loading");
  const [fps, setFps] = useState(0);
  const [backend, setBackend] = useState<"GPU" | "CPU">("GPU");
  const [count, setCount] = useState(0);
  const [fightAlarm, setFightAlarm] = useState(false);
  const [crowd, setCrowd] = useState<CrowdHud | null>(null);
  const [ocrState, setOcrState] = useState<{
    status: OcrStatus;
    progress: number;
    vehicles: number;
    engine?: string;
    framePlate?: string;
    frameScan?: string;
  }>({ status: "idle", progress: 0, vehicles: 0 });

  const modelId = browserModelForDemo(demoType);
  const showCounter = demoType === "people-count";
  // Aglomeración: análisis de densidad/proximidad/saturación sobre las personas.
  const isCrowd = demoType === "crowd";
  // Heurísticas de comportamiento (brazos arriba 10 s + puño/pelea) sobre pose.
  const runHeuristics = demoType === "behavior";
  // OCR de placas (tesseract.js) sobre los vehículos detectados.
  const enableOcr = demoType === "lpr";
  // Detector YOLOX (ONNX) en el navegador (EPP, armas, fuego… según YOLOX_BY_DEMO).
  const usesYolox = !!YOLOX_BY_DEMO[demoType];
  // Visión térmica: filtro de color (paleta ironbow), sin modelo.
  const usesThermal = demoType === "thermal";

  useEffect(() => {
    if (!active || usesYolox || usesThermal) return; // EPP/armas/térmico tienen efecto aparte
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

    // Aglomeración: throttle del HUD para no re-renderizar React cada frame.
    let lastCrowdKey = "";
    setCrowd(null);

    // OCR de placas: inicializar tesseract solo en el demo de placas.
    let lastOcrKey = "";
    setOcrState({ status: "idle", progress: 0, vehicles: 0 });
    if (enableOcr) {
      const ocr = plateOcrRef.current ?? new PlateLprController();
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

              // LPR de placas → detecta la placa, la recorta, la lee (ONNX) y
              // anota p.text. Corre throttled con una sola inferencia en vuelo.
              if (enableOcr) {
                const ocr = plateOcrRef.current;
                if (ocr) {
                  const vehicles = lastPreds.length;
                  ocr.process(video, lastPreds, now);
                  for (const p of lastPreds) {
                    const plate = ocr.plateFor(p.trackId);
                    if (plate) p.text = plate; // confirmada → verde
                    else p.note = ocr.scanLabel(p.trackId); // escaneando → ámbar
                  }
                  const framePlate = ocr.plateFor("_frame");
                  const frameScan = framePlate ? undefined : ocr.scanLabel("_frame");
                  const key = `${ocr.status}:${ocr.progress}:${ocr.engineLabel}:${vehicles}:${framePlate ?? frameScan ?? ""}`;
                  if (key !== lastOcrKey) {
                    lastOcrKey = key;
                    setOcrState({
                      status: ocr.status,
                      progress: ocr.progress,
                      vehicles,
                      engine: ocr.engineLabel,
                      framePlate,
                      frameScan,
                    });
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
                      ? `BRAZOS ${Math.min(5, Math.ceil(prog * 5))}/5s`
                      : undefined;
                }
                if (res.anyFight !== lastFight) {
                  lastFight = res.anyFight;
                  setFightAlarm(res.anyFight);
                }
              }

              // Análisis de AGLOMERACIÓN (densidad, proximidad, saturación).
              let crowdA: CrowdAnalysis | undefined;
              if (isCrowd) {
                crowdA = analyzeCrowd(lastPreds, { capacity: CROWD_CAPACITY });
                const key = `${crowdA.level}|${crowdA.count}|${Math.round(
                  crowdA.densityIndex * 100
                )}|${crowdA.peakCluster}|${crowdA.alert}`;
                if (key !== lastCrowdKey) {
                  lastCrowdKey = key;
                  setCrowd({
                    count: crowdA.count,
                    level: crowdA.level,
                    densityPct: Math.round(crowdA.densityIndex * 100),
                    closeRatio: crowdA.closeRatio,
                    peakCluster: crowdA.peakCluster,
                    alert: crowdA.alert,
                    capacity: crowdA.capacity,
                  });
                }
              }

              const map = fitMapping(
                video.videoWidth,
                video.videoHeight,
                rect.width,
                rect.height,
                objectFit
              );
              draw(ctx, lastPreds, rect.width, rect.height, map, crowdA);
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
  }, [active, modelId, videoRef, runHeuristics, enableOcr, objectFit, usesYolox, usesThermal, isCrowd]);

  // ── Filtro de VISIÓN TÉRMICA (paleta ironbow, sin modelo) ──
  useEffect(() => {
    if (!active || !usesThermal) return;
    let raf = 0;
    let cancelled = false;
    let frames = 0;
    let fpsWindow = performance.now();

    const filter = thermalRef.current ?? new ThermalFilter();
    thermalRef.current = filter;
    filter.reset();
    setStatus("running");

    const loop = () => {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== Math.round(rect.width * dpr)) {
          canvas.width = Math.round(rect.width * dpr);
          canvas.height = Math.round(rect.height * dpr);
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          const map = fitMapping(video.videoWidth, video.videoHeight, rect.width, rect.height, objectFit);
          filter.render(video, ctx, rect.width, rect.height, map);
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

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, usesThermal, videoRef, objectFit]);

  // ── Detección YOLOX (EPP / armas, modelos ONNX en el navegador) ──
  useEffect(() => {
    if (!active || !usesYolox) return;
    let raf = 0;
    let cancelled = false;
    let infs = 0;
    let fpsWindow = performance.now();
    let lastPreds: Prediction[] = [];
    let lastRun = 0;
    let inflight = false;
    const THROTTLE = 350;

    const cfg = YOLOX_BY_DEMO[demoType];
    if (!cfg) return;
    // Recrear si cambió de modelo (EPP ↔ armas ↔ fuego).
    if (yoloxRef.current && yoloxRef.current.modelUrl !== cfg.modelUrl) {
      yoloxRef.current.dispose();
      yoloxRef.current = null;
    }
    const det = yoloxRef.current ?? new YoloxDetector(cfg);
    yoloxRef.current = det;

    (async () => {
      setStatus("loading");
      await det.init();
      if (cancelled) return;
      setBackend(det.backend);
      setStatus(det.ready ? "running" : "error");
      if (!det.ready) return;

      const loop = () => {
        if (cancelled) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
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
            // Inferencia throttled, sin bloquear el dibujo.
            if (!inflight && now - lastRun >= THROTTLE) {
              inflight = true;
              lastRun = now;
              det
                .detect(video)
                .then((r) => {
                  if (cancelled || !r) return;
                  lastPreds = r;
                  infs += 1;
                  const t = performance.now();
                  if (t - fpsWindow >= 1000) {
                    setFps(Math.round((infs * 1000) / (t - fpsWindow)));
                    infs = 0;
                    fpsWindow = t;
                  }
                })
                .finally(() => {
                  inflight = false;
                });
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
          }
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, usesYolox, demoType, videoRef, objectFit]);

  // Liberar el engine al desmontar.
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
      analyzerRef.current?.reset();
      analyzerRef.current = null;
      void plateOcrRef.current?.dispose();
      plateOcrRef.current = null;
      yoloxRef.current?.dispose();
      yoloxRef.current = null;
      thermalRef.current?.reset();
      thermalRef.current = null;
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

      {/* Contador simple de personas en escena (demo de conteo) */}
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

      {/* Panel de AGLOMERACIÓN: nivel de afluencia, densidad, proximidad y saturación */}
      {isCrowd && status === "running" && crowd && (
        <div
          className="absolute left-1/2 top-14 z-20 w-[248px] -translate-x-1/2 border bg-deep/85 px-4 py-3 backdrop-blur"
          style={{ borderColor: `${CROWD_LEVEL_META[crowd.level].color}99` }}
        >
          <div className="flex items-center justify-center gap-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: CROWD_LEVEL_META[crowd.level].color }}
            />
            <span
              className="font-heading text-sm font-black uppercase tracking-tight"
              style={{ color: CROWD_LEVEL_META[crowd.level].color }}
            >
              Afluencia {CROWD_LEVEL_META[crowd.level].short}
            </span>
          </div>

          <div className="mt-2 flex items-end justify-center gap-5">
            <div className="text-center">
              <div className="font-heading text-3xl font-black leading-none tracking-tight text-accent tabular-nums">
                {crowd.count}
              </div>
              <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.22em] text-foreground/50">
                personas
              </div>
            </div>
            <div className="text-center">
              <div
                className="font-heading text-3xl font-black leading-none tracking-tight tabular-nums"
                style={{ color: CROWD_LEVEL_META[crowd.level].color }}
              >
                {crowd.densityPct}%
              </div>
              <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.22em] text-foreground/50">
                densidad
              </div>
            </div>
          </div>

          {/* Barra de densidad */}
          <div className="mt-2 h-1.5 w-full overflow-hidden bg-background/60">
            <div
              className="h-full transition-[width] duration-300"
              style={{
                width: `${crowd.densityPct}%`,
                background: CROWD_LEVEL_META[crowd.level].color,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-foreground/50">
            <span>Cercanía {Math.round(crowd.closeRatio * 100)}%</span>
            <span>Grupo máx {crowd.peakCluster}</span>
            <span>Límite {crowd.capacity}</span>
          </div>

          {crowd.alert && (
            <div className="mt-2 animate-pulse border border-red-500/70 bg-red-600/20 px-2 py-1 text-center font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-red-300">
              ⚠ Zona saturada · supera límite seguro
            </div>
          )}
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
          (usesThermal
            ? `◐ visión térmica · ${fps} fps`
            : `◉ IA real · ${backend} · ${fps} fps · ${count} det${
                enableOcr ? ` · ${ocrBadge(ocrState)}` : ""
              }`)}
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
  m: FitMap,
  crowd?: CrowdAnalysis
) {
  ctx.clearRect(0, 0, w, h);

  // En modo aglomeración: heatmap de densidad por debajo de los marcadores.
  if (crowd) drawCrowdHeat(ctx, preds, m, CROWD_LEVEL_META[crowd.level].color);

  for (const p of preds) {
    // Coords normalizadas [0..1] → rectángulo real del video (según object-fit).
    const px = m.ox + p.bbox.x * m.dw;
    const py = m.oy + p.bbox.y * m.dh;
    const pw = p.bbox.width * m.dw;
    const ph = p.bbox.height * m.dh;
    const isAlarm =
      p.alarm === "arms" ||
      p.alarm === "fight" ||
      p.alarm === "violation" ||
      p.alarm === "weapon" ||
      p.alarm === "fire";
    const color = isAlarm || p.label.includes("fall") ? RED : ACCENT;

    // Aglomeración: marcador liviano (caja fina + punto) para no tapar el heatmap.
    if (crowd) {
      ctx.strokeStyle = color.replace("rgb(", "rgba(").replace(")", ", 0.55)");
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px, py, pw, ph);
      ctx.fillStyle = ACCENT_LIGHT;
      ctx.beginPath();
      ctx.arc(px + pw / 2, py + ph / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

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
      const atext =
        p.alarm === "fight"
          ? "⚠ PELEA"
          : p.alarm === "weapon"
            ? "⚠ ARMA DETECTADA"
            : p.alarm === "fire"
              ? "🔥 FUEGO DETECTADO"
              : p.alarm === "violation"
                ? "⚠ SIN EPP"
                : "⚠ ALARMA · BRAZOS 5s";
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

    // Malla facial (478 puntos + iris) y expresión dominante
    if (p.faceMesh && p.faceMesh.length > 0) {
      drawFaceMesh(ctx, p.faceMesh, (x) => m.ox + x * m.dw, (y) => m.oy + y * m.dh);
      if (p.expression) {
        const etext = `◉ ${p.expression}`;
        ctx.font = "bold 12px ui-monospace, monospace";
        const ew = ctx.measureText(etext).width + 14;
        const ey = py + ph + 4;
        ctx.fillStyle = "rgba(2,10,24,0.92)";
        ctx.fillRect(px, ey, ew, 20);
        ctx.strokeStyle = "rgb(34,211,238)";
        ctx.lineWidth = 1;
        ctx.strokeRect(px, ey, ew, 20);
        ctx.fillStyle = "rgb(34,211,238)";
        ctx.fillText(etext, px + 7, ey + 14);
        ctx.font = "bold 11px ui-monospace, monospace";
      }
    }
  }

  // Foco de aglomeración: región del grupo más denso, por encima de todo.
  if (crowd?.hotspot) drawHotspot(ctx, crowd, m);
}

// ── Heatmap de densidad: blobs radiales aditivos centrados en cada persona.
// El solapamiento de blobs hace que las zonas concurridas "ardan" más fuerte,
// el truco clásico de los mapas de calor. El tono sigue el nivel de afluencia.
function drawCrowdHeat(
  ctx: CanvasRenderingContext2D,
  preds: Prediction[],
  m: FitMap,
  levelColor: string
) {
  const rgb = levelColor.slice(levelColor.indexOf("(") + 1, levelColor.indexOf(")"));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const p of preds) {
    const cx = m.ox + (p.bbox.x + p.bbox.width / 2) * m.dw;
    const cy = m.oy + (p.bbox.y + p.bbox.height / 2) * m.dh;
    const radius = Math.max(p.bbox.width * m.dw, p.bbox.height * m.dh) * 0.85 + 26;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    g.addColorStop(0, `rgba(${rgb}, 0.26)`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ── Región del cluster más denso, con etiqueta del tamaño del grupo.
function drawHotspot(ctx: CanvasRenderingContext2D, crowd: CrowdAnalysis, m: FitMap) {
  const h = crowd.hotspot;
  if (!h) return;
  const pad = 8;
  const x = m.ox + h.x * m.dw - pad;
  const y = m.oy + h.y * m.dh - pad;
  const w = h.width * m.dw + pad * 2;
  const ph = h.height * m.dh + pad * 2;
  const col = crowd.alert ? RED : "rgb(234,179,8)";

  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([9, 5]);
  ctx.strokeRect(x, y, w, ph);
  ctx.setLineDash([]);

  const text = `◎ AGLOMERACIÓN · ${h.count}`;
  ctx.font = "bold 12px ui-monospace, monospace";
  const tw = ctx.measureText(text).width + 14;
  const ty = y > 20 ? y - 20 : y;
  ctx.fillStyle = col;
  ctx.fillRect(x, ty, tw, 18);
  ctx.fillStyle = "rgba(255,255,255,0.98)";
  ctx.fillText(text, x + 7, ty + 13);
  ctx.restore();
}
