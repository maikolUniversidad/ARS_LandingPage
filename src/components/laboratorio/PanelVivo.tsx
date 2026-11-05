"use client";

import { categoryLabels, type AICapability } from "@/data/ai-capabilities";
import type { LiveStats } from "@/components/LiveAIOverlay";
import { Scramble } from "@/components/Scramble";
import { ICONO_DEMO } from "./iconos";
import { CATEGORIAS_EN, MOTOR_DEMO, type TextosLab } from "./textos";

export type Evento = { id: number; hora: string; texto: string; tipo: "info" | "alarma" };

type Props = {
  t: TextosLab;
  isES: boolean;
  modelo: AICapability;
  stats: LiveStats | null;
  /** Detecciones por muestra (últimos ~40 valores) para la mini‑serie. */
  serie: number[];
  eventos: Evento[];
  activo: boolean;
};

/** Panel lateral: telemetría medida, qué está viendo, registro y ficha del modelo. */
export function PanelVivo({ t, isES, modelo, stats, serie, eventos, activo }: Props) {
  const Icono = ICONO_DEMO[modelo.demoType];
  const motor = MOTOR_DEMO[modelo.demoType];
  const corriendo = activo && stats?.status === "running";
  const termica = stats?.motor === "thermal";
  const guion = "—";
  const max = Math.max(1, ...serie);

  const celdas = [
    { k: t.inferencias, v: corriendo ? String(stats.fps) : guion },
    { k: t.latenciaLarga, v: corriendo && stats.latencyMs ? `${stats.latencyMs.toFixed(stats.latencyMs < 10 ? 1 : 0)} ms` : guion },
    { k: t.deteccionesLarga, v: corriendo && !termica ? String(stats.count) : guion },
    {
      k: t.confianzaLarga,
      v: corriendo && stats.avgConf != null ? `${Math.round(stats.avgConf * 100)}%` : guion,
    },
  ];

  return (
    <aside className="flex flex-col gap-4" aria-live="off">
      {/* Cabecera del modelo */}
      <div className="border border-border/60 bg-background/40 p-5 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center border border-accent/60 bg-accent/15 text-accent">
            <Icono className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent">
              {isES ? categoryLabels[modelo.category] : CATEGORIAS_EN[modelo.category]}
            </div>
            <h3 className="mt-1 font-heading text-xl font-black uppercase leading-tight tracking-tight">
              <Scramble text={modelo.name} trigger={modelo.id} durationMs={500} />
            </h3>
            <p className="mt-1 font-serif text-sm italic text-foreground/60">{modelo.tagline}</p>
          </div>
        </div>
        <div className="mt-4 border-l-2 border-accent/50 bg-accent/5 px-3 py-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-foreground/50">{t.pista}</div>
          <p className="mt-1 text-[13px] leading-snug text-foreground/85">{isES ? motor.pista.es : motor.pista.en}</p>
        </div>
      </div>

      {/* Telemetría */}
      <div className="border border-border/60 bg-background/40 p-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70">{t.telemetria}</div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/45">
            <span className={`size-1.5 ${corriendo ? "bg-green-400 motion-safe:animate-pulse" : "bg-foreground/30"}`} />
            {corriendo ? `${stats.backend} · ${stats.motor}` : "standby"}
          </div>
        </div>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40">{t.medido}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {celdas.map((c) => (
            <div key={c.k} className="border border-border/40 bg-secondary/60 p-3">
              <div className="font-mono text-[8px] uppercase leading-tight tracking-[0.22em] text-foreground/50">{c.k}</div>
              <div className="mt-1 font-heading text-2xl font-black tabular-nums tracking-tight text-accent">{c.v}</div>
            </div>
          ))}
        </div>
        {/* Mini serie de detecciones */}
        <svg viewBox="0 0 120 28" preserveAspectRatio="none" className="mt-3 h-10 w-full" aria-hidden>
          <line x1="0" y1="27.5" x2="120" y2="27.5" stroke="currentColor" className="text-border" strokeWidth="0.5" />
          {serie.length > 1 && (
            <polyline
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
              points={serie.map((v, i) => `${(i / (serie.length - 1)) * 120},${26 - (v / max) * 22}`).join(" ")}
            />
          )}
        </svg>
      </div>

      {/* Qué está viendo */}
      <div className="border border-border/60 bg-background/40 p-5 backdrop-blur">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70">{t.queVe}</div>
        {stats?.alarm && corriendo && (
          <div className="mt-3 border border-red-500/60 bg-red-600/15 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-red-300 motion-safe:animate-pulse">
            ⚠ {stats.alarm}
          </div>
        )}
        <ul className="mt-3 space-y-2">
          {corriendo && stats.labels.length > 0 ? (
            stats.labels.slice(0, 5).map((l) => (
              <li key={l.label}>
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-foreground/85">
                  <span className="truncate">
                    <span className="text-accent">▸</span> {l.label}
                    {l.n > 1 && <span className="text-foreground/50"> ×{l.n}</span>}
                  </span>
                  <span className="tabular-nums text-foreground/60">{Math.round(l.conf * 100)}%</span>
                </div>
                <div className="mt-1 h-1 bg-foreground/10">
                  <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${Math.round(l.conf * 100)}%` }} />
                </div>
              </li>
            ))
          ) : (
            <li className="font-mono text-[11px] text-foreground/45">
              {corriendo && termica ? t.termicaVe : corriendo ? t.sinDetecciones : "—"}
            </li>
          )}
        </ul>
      </div>

      {/* Registro */}
      <div className="border border-border/60 bg-background/40 p-5 backdrop-blur">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70">{t.registro}</div>
        <ol className="mt-3 space-y-1.5 font-mono text-[10.5px]" aria-live="polite">
          {eventos.length === 0 && <li className="text-foreground/45">{t.sinEventos}</li>}
          {eventos.map((e) => (
            <li key={e.id} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="shrink-0 tabular-nums text-foreground/40">{e.hora}</span>
              <span className={e.tipo === "alarma" ? "text-red-300" : "text-foreground/75"}>{e.texto}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Ficha */}
      <div className="border border-border/60 bg-background/40 p-5 backdrop-blur">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70">{t.enNavegador}</div>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-foreground/70">{isES ? motor.motor.es : motor.motor.en}</p>
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">{modelo.description}</p>
        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">{t.casos}</div>
        <ul className="mt-2 space-y-1.5">
          {modelo.useCases.map((u) => (
            <li key={u} className="flex gap-2 border-l-2 border-accent/40 pl-3 font-mono text-[11.5px] text-foreground/75">
              <span className="text-accent">▸</span>
              <span>{u}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/40 pt-4">
          <div className="border border-border/40 bg-secondary/60 p-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-foreground/50">{modelo.metric.label}</div>
            <div className="mt-1 font-heading text-xl font-black tracking-tight text-accent">{modelo.metric.value}</div>
          </div>
          <div className="border border-border/40 bg-secondary/60 p-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-foreground/50">{t.procesamiento}</div>
            <div className="mt-1 font-heading text-xl font-black tracking-tight text-accent">Edge + Cloud</div>
          </div>
        </div>
        <p className="mt-2 font-mono text-[9px] leading-relaxed text-foreground/40">
          {t.ficha}: {t.fichaNota}
        </p>
      </div>
    </aside>
  );
}
