"use client";

import { useState } from "react";
import {
  visionModels,
  modelCategories,
  badgeMeta,
  type VisionModel,
  type SourceType,
} from "@/data/vision-models";
import type { Event, PredictResponse, Rules } from "@/lib/vision-mock";
import { countNoun, type DetectionStats } from "@/lib/detection-stats";

// ─────────────────────────── ModelSelector ───────────────────────────

export function ModelSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const filtered =
    filter === "all"
      ? visionModels
      : visionModels.filter((m) => m.category === filter);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label="Todos" count={visionModels.length} />
        {(Object.keys(modelCategories) as Array<keyof typeof modelCategories>).map((c) => (
          <FilterPill
            key={c}
            active={filter === c}
            onClick={() => setFilter(c)}
            label={modelCategories[c]}
            count={visionModels.filter((m) => m.category === c).length}
          />
        ))}
      </div>

      <ul className="max-h-[480px] space-y-1 overflow-y-auto pr-1">
        {filtered.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onSelect(m.id)}
              className={`group flex w-full flex-col gap-2 border p-3 text-left transition-colors ${
                selectedId === m.id
                  ? "border-accent bg-secondary text-foreground"
                  : "border-border/40 bg-background/40 text-foreground/75 hover:border-border hover:bg-secondary/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/45">
                  {modelCategories[m.category]}
                </span>
                <div className="flex flex-wrap gap-1">
                  {m.badges.map((b) => (
                    <Badge key={b} kind={b} />
                  ))}
                </div>
              </div>
              <h4 className="font-heading text-sm font-bold uppercase leading-tight tracking-tight">
                {m.name}
              </h4>
              <p className="font-mono text-[10px] leading-relaxed text-foreground/55">
                {m.shortDescription}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
        active ? "border-accent bg-accent/25 text-foreground" : "border-border/50 bg-background/40 text-foreground/55 hover:bg-secondary"
      }`}
    >
      {label}
      <span className={active ? "text-foreground/80" : "text-foreground/40"}>{count}</span>
    </button>
  );
}

function Badge({ kind }: { kind: keyof typeof badgeMeta }) {
  const m = badgeMeta[kind];
  return (
    <span
      title={m.description}
      className="border px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em]"
      style={{ borderColor: m.color, color: m.color }}
    >
      {m.label}
    </span>
  );
}

// ─────────────────────────── SourceSelector ───────────────────────────

export function SourceSelector({
  available,
  selected,
  onSelect,
  onFile,
  onWebcamToggle,
  webcamOn,
}: {
  available: SourceType[];
  selected: SourceType;
  onSelect: (s: SourceType) => void;
  onFile: (f: File) => void;
  onWebcamToggle: () => void;
  webcamOn: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
        {(["image", "video", "webcam", "rtsp"] as SourceType[]).map((s) => {
          const isAvail = available.includes(s);
          const isSelected = selected === s;
          return (
            <button
              key={s}
              type="button"
              disabled={!isAvail}
              onClick={() => onSelect(s)}
              className={`border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                isSelected
                  ? "border-accent bg-accent/25 text-foreground"
                  : isAvail
                  ? "border-border/50 bg-background/40 text-foreground/65 hover:bg-secondary"
                  : "cursor-not-allowed border-border/30 bg-background/20 text-foreground/30"
              }`}
            >
              {sourceLabel(s)}
            </button>
          );
        })}
      </div>

      {(selected === "image" || selected === "video") && (
        <label className="flex cursor-pointer items-center justify-center border border-dashed border-border/60 bg-background/40 px-4 py-6 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/55 hover:border-accent hover:bg-secondary/40">
          <input
            type="file"
            accept={selected === "image" ? "image/*" : "video/*"}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
            className="hidden"
          />
          ◇ Click para subir {selected === "image" ? "imagen" : "video"} (drag&drop)
        </label>
      )}

      {selected === "webcam" && (
        <button
          type="button"
          onClick={onWebcamToggle}
          className={`w-full border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.22em] transition-colors ${
            webcamOn
              ? "border-red-400 bg-red-400/10 text-red-300 hover:bg-red-400/20"
              : "border-accent bg-accent/15 text-foreground hover:bg-accent/25"
          }`}
        >
          <span className="mr-2">{webcamOn ? "■" : "●"}</span>
          {webcamOn ? "Apagar cámara" : "Activar cámara"}
        </button>
      )}

      {selected === "rtsp" && (
        <div className="border border-border/40 bg-secondary/30 p-3 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
          ◇ RTSP requiere backend con FFmpeg/GStreamer · ver{" "}
          <code className="text-foreground/80">docs/vision-demo-api.md</code>
        </div>
      )}
    </div>
  );
}

function sourceLabel(s: SourceType): string {
  return { image: "▤ Imagen", video: "▶ Video", webcam: "● Webcam", rtsp: "⌬ RTSP" }[s];
}

// ─────────────────────────── RulesPanel ───────────────────────────

export function RulesPanel({
  rules,
  onChange,
  onEditRoi,
  onEditLine,
  onClearRoi,
  onClearLine,
}: {
  rules: Rules;
  onChange: (r: Rules) => void;
  onEditRoi: () => void;
  onEditLine: () => void;
  onClearRoi: () => void;
  onClearLine: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Confidence threshold */}
      <div>
        <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">
          <span>Confianza mínima</span>
          <span className="text-accent">{(rules.confidenceThreshold * 100).toFixed(0)}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={rules.confidenceThreshold}
          onChange={(e) => onChange({ ...rules, confidenceThreshold: parseFloat(e.target.value) })}
          className="mt-2 w-full accent-[var(--accent)]"
        />
      </div>

      {/* ROI */}
      <div className="border border-border/40 bg-background/40 p-3">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">
          <span>ROI · Polígono</span>
          <span className={rules.roi && rules.roi.length >= 3 ? "text-accent" : "text-foreground/30"}>
            {rules.roi?.length ?? 0} pts
          </span>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onEditRoi}
            className="flex-1 border border-accent/50 bg-accent/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-accent/20"
          >
            ▦ Dibujar
          </button>
          <button
            type="button"
            onClick={onClearRoi}
            disabled={!rules.roi || rules.roi.length === 0}
            className="border border-border/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 transition-colors hover:border-red-400 hover:text-red-400 disabled:opacity-30"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/35">
          Click para añadir puntos · doble click para cerrar
        </p>
      </div>

      {/* Line */}
      <div className="border border-border/40 bg-background/40 p-3">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">
          <span>Línea de cruce</span>
          <span className={rules.line ? "text-accent" : "text-foreground/30"}>
            {rules.line ? "definida" : "—"}
          </span>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onEditLine}
            className="flex-1 border border-accent/50 bg-accent/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-accent/20"
          >
            ⟍ Dibujar
          </button>
          <button
            type="button"
            onClick={onClearLine}
            disabled={!rules.line}
            className="border border-border/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 transition-colors hover:border-red-400 hover:text-red-400 disabled:opacity-30"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/35">
          2 clicks · primer punto inicio, segundo fin
        </p>
      </div>

      {/* Loitering */}
      <div>
        <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">
          <span>Permanencia (s)</span>
          <span className="text-accent">{rules.loiteringSec ?? 0}</span>
        </label>
        <input
          type="range"
          min={0}
          max={120}
          step={5}
          value={rules.loiteringSec ?? 0}
          onChange={(e) => onChange({ ...rules, loiteringSec: parseInt(e.target.value) })}
          className="mt-2 w-full accent-[var(--accent)]"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-2 border-t border-border/40 pt-3 font-mono text-[10px] uppercase tracking-[0.22em]">
        <Toggle label="Alertar EPP faltante" value={rules.alertPpe ?? false} onChange={(v) => onChange({ ...rules, alertPpe: v })} />
        <Toggle label="Alertar por persona" value={rules.alertPerson ?? false} onChange={(v) => onChange({ ...rules, alertPerson: v })} />
        <Toggle label="Alertar por objeto" value={rules.alertObject ?? false} onChange={(v) => onChange({ ...rules, alertObject: v })} />
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between text-left text-foreground/65 transition-colors hover:text-foreground"
    >
      <span>{label}</span>
      <span
        className={`relative inline-block h-4 w-7 border transition-colors ${
          value ? "border-accent bg-accent/40" : "border-border/50 bg-background/40"
        }`}
      >
        <span
          className={`absolute top-[2px] size-2.5 transition-all ${
            value ? "left-[14px] bg-accent" : "left-[2px] bg-foreground/40"
          }`}
        />
      </span>
    </button>
  );
}

// ─────────────────────────── CountingPanel (conteo acumulado) ───────────────────────────

const CLASS_LABELS: Record<string, string> = {
  person: "Personas",
  car: "Autos",
  truck: "Camiones",
  bus: "Buses",
  motorcycle: "Motos",
  bicycle: "Bicicletas",
  rostro: "Rostros",
  plate: "Placas",
  backpack: "Mochilas",
};

function prettyClass(label: string): string {
  return CLASS_LABELS[label] ?? label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Conteo acumulado: cuántas personas/objetos DIFERENTES vio el modelo a lo largo
 * del video, además del pico simultáneo y el desglose por clase. Cada objeto cuenta
 * una sola vez por su track ID (las reapariciones no inflan el total).
 */
export function CountingPanel({
  stats,
  model,
  isLive,
  onReset,
}: {
  stats: DetectionStats;
  model: VisionModel;
  isLive: boolean;
  onReset: () => void;
}) {
  const noun = countNoun(model);
  const word = stats.uniqueTotal === 1 ? noun.singular : noun.plural;
  const adj = `únic${noun.fem ? "a" : "o"}${stats.uniqueTotal === 1 ? "" : "s"}`;

  return (
    <div className="border border-accent/40 bg-background/40 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight">
          Conteo acumulado
        </h2>
        <button
          type="button"
          onClick={onReset}
          disabled={stats.frames === 0}
          className="border border-border/50 bg-background/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/55 transition-colors hover:border-accent hover:text-foreground disabled:opacity-30"
        >
          ↺ Reiniciar
        </button>
      </div>

      {/* Titular — total de únicos a lo largo de la sesión */}
      <div className="flex items-baseline gap-2 border border-accent/30 bg-accent/10 px-4 py-3">
        <span className="font-heading text-4xl font-bold leading-none text-accent tabular-nums">
          {stats.uniqueTotal}
        </span>
        <span className="font-mono text-[11px] uppercase leading-tight tracking-[0.18em] text-foreground/70">
          {word} {adj}
        </span>
      </div>

      {/* Métricas secundarias */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatCell label="En pantalla" value={stats.onScreen} />
        <StatCell label="Pico" value={stats.peak} />
        <StatCell label="Frames" value={stats.frames} />
      </div>

      {/* Desglose por clase — sólo cuando hay más de una (p.ej. autos vs camiones) */}
      {stats.byClass.length > 1 && (
        <ul className="mt-3 space-y-1.5 border-t border-border/40 pt-3">
          {stats.byClass.map((c) => (
            <li
              key={c.label}
              className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70"
            >
              <span>{prettyClass(c.label)}</span>
              <span className="text-accent tabular-nums">{c.count}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-foreground/40">
        {isLive
          ? "Conteo en vivo · cada objeto cuenta una vez por su track ID"
          : "Demo simulado · activá «IA real» sobre un video para conteo verídico"}
      </p>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border/40 bg-background/40 px-2 py-2 text-center">
      <div className="font-heading text-lg font-bold leading-none text-foreground tabular-nums">
        {value}
      </div>
      <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-foreground/45">
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────── EventsPanel ───────────────────────────

const SEVERITY_COLORS: Record<Event["severity"], string> = {
  low: "rgb(107, 138, 255)",
  medium: "rgb(234, 179, 8)",
  high: "rgb(239, 68, 68)",
  critical: "rgb(239, 68, 68)",
};

export function EventsPanel({
  events,
  onCreateAlert,
  onExportSnapshot,
}: {
  events: Event[];
  onCreateAlert: (e: Event) => void;
  onExportSnapshot: () => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">
        <span>Eventos · {events.length}</span>
        <button
          type="button"
          onClick={onExportSnapshot}
          className="border border-border/50 bg-background/40 px-2.5 py-1 transition-colors hover:bg-secondary hover:text-foreground"
        >
          ▤ Snapshot
        </button>
      </div>
      <ul className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
        {events.length === 0 && (
          <li className="border border-dashed border-border/40 p-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/35">
            No hay eventos · ajustá las reglas
          </li>
        )}
        {events.map((e, i) => (
          <li
            key={i}
            className="border bg-background/40 p-3"
            style={{ borderColor: `${SEVERITY_COLORS[e.severity]}55` }}
          >
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em]">
              <span style={{ color: SEVERITY_COLORS[e.severity] }}>
                {e.severity}
              </span>
              <span className="text-foreground/40">
                {new Date(e.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="mt-1.5 font-mono text-[11px] font-bold text-foreground">
              {e.type}
            </div>
            <div className="mt-1 font-mono text-[10px] leading-relaxed text-foreground/70">
              {e.message}
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em]">
              <span className="text-foreground/45">
                {e.trackId && <>#{e.trackId} · </>}
                conf {(e.confidence * 100).toFixed(0)}%
              </span>
              <button
                type="button"
                onClick={() => onCreateAlert(e)}
                className="border border-accent/50 bg-accent/15 px-2.5 py-1 text-foreground transition-colors hover:bg-accent/25"
              >
                ▸ Alerta demo
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────── FaceAnalysisPanel (acciones faciales) ───────────────────────────

export function FaceAnalysisPanel({ result }: { result: PredictResponse | null }) {
  const faces = (result?.predictions ?? []).filter(
    (p) => p.faceMesh && p.faceMesh.length > 0
  );
  const primary = faces[0];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">
        <span>Acciones faciales</span>
        <span className={faces.length ? "text-accent" : "text-foreground/30"}>
          {faces.length} {faces.length === 1 ? "rostro" : "rostros"}
        </span>
      </div>

      {!primary ? (
        <div className="border border-dashed border-border/40 p-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/35">
          Activá la cámara o subí una imagen con un rostro
        </div>
      ) : (
        <div className="space-y-3">
          {/* Emoción / expresión dominante */}
          <div className="flex items-center gap-3 border border-accent/40 bg-accent/10 px-3 py-3">
            <span className="text-3xl leading-none">
              {EMOTION_EMOJI[primary.expression ?? ""] ?? "🙂"}
            </span>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/55">
                Emoción detectada
              </div>
              <div className="font-heading text-base font-bold uppercase tracking-tight text-[rgb(34,211,238)]">
                {primary.expression ?? "—"}
              </div>
            </div>
          </div>

          {/* Desglose de emociones básicas */}
          <div>
            <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/45">
              Emociones básicas
            </div>
            <ul className="space-y-1.5">
              {(primary.emotions ?? []).map((e) => (
                <li key={e.name}>
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70">
                    <span>{EMOTION_EMOJI[e.name] ?? "•"} {e.name}</span>
                    <span className="text-foreground/45">{(e.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-background/60">
                    <div
                      className="h-full bg-[rgb(34,211,238)] transition-[width] duration-150"
                      style={{ width: `${Math.min(100, e.score * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Señales faciales (blendshapes) — la evidencia detrás de la emoción */}
          {(primary.blendshapes ?? []).length > 0 && (
            <div className="border-t border-border/40 pt-3">
              <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/45">
                Señales faciales
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(primary.blendshapes ?? []).slice(0, 4).map((b) => (
                  <span
                    key={b.name}
                    className="border border-border/50 bg-background/40 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground/65"
                  >
                    {b.name} {(b.score * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.22em] text-foreground/35">
            478 puntos de malla · 52 blendshapes · 100% local en tu navegador
          </p>
        </div>
      )}
    </div>
  );
}

const EMOTION_EMOJI: Record<string, string> = {
  Feliz: "😀",
  Riendo: "😄",
  Triste: "😢",
  Enojado: "😠",
  Sorprendido: "😮",
  Disgustado: "🤢",
  Hablando: "🗣️",
  "Ojos cerrados": "😑",
  Neutral: "😐",
};

// ─────────────────────────── JSONViewer ───────────────────────────

export function JSONViewer({ data }: { data: PredictResponse | null }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const text = JSON.stringify(data, null, 2);

  function copy() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  }

  return (
    <div className="border border-border/50 bg-background/40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-3 text-left font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/65 transition-colors hover:text-foreground"
      >
        <span>JSON · {data.predictions.length} pred · {data.events.length} eventos</span>
        <span className="text-accent">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="border-t border-border/40 bg-deep p-3">
          <div className="flex items-center justify-between pb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/45">
            <span>{data.model} · {data.source}</span>
            <button
              type="button"
              onClick={copy}
              className="border border-border/50 px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
            >
              ⎘ Copiar
            </button>
          </div>
          <pre className="max-h-[240px] overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed text-foreground/70">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── Selected model card (info) ───────────────────────────

export function ModelInfoCard({ model }: { model: VisionModel }) {
  return (
    <div className="border border-accent/40 bg-secondary/40 p-4 backdrop-blur">
      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/55">
        <span>Qué demuestra</span>
        <div className="flex gap-1">
          {model.badges.map((b) => (
            <Badge key={b} kind={b} />
          ))}
        </div>
      </div>
      <h3 className="mt-2 font-heading text-base font-bold uppercase leading-tight tracking-tight">
        {model.name}
      </h3>
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-foreground/75">
        {model.whatItDemonstrates}
      </p>
      <div className="mt-3 border-t border-border/40 pt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
        Provider: <span className="text-foreground/85">{model.provider}</span>
      </div>
      {model.envKeyName && (
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">
          Env: <code className="text-amber-400">{model.envKeyName}</code>
        </div>
      )}
      {model.warning && (
        <div className="mt-3 border border-amber-400/40 bg-amber-400/10 p-2.5 font-mono text-[10px] leading-relaxed text-amber-200">
          ⚠ {model.warning}
        </div>
      )}
    </div>
  );
}
