"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ESTADO_LABEL, type Analitica, type EstadoSim, type Marca } from "@/data/analiticas";
import { ESTADO_COLOR } from "./EstadoPill";
import { Sim3D } from "./Sim3D";
import { cn } from "@/lib/utils";

/** Colores de zonas y líneas: exactamente los del motor 3D (motor.js → COL), para que se reconozcan en los dos lados. */
export const MARCA_COLOR: Record<Marca["color"], string> = {
  vigila: "#3B82F6",
  detecta: "#F59E0B",
  alerta: "#E5484D",
  ok: "#22A06B",
  oro: "#D6AB4C",
};

export type TextosPareja = {
  simulacion: string;
  videoReal: string;
  videoIa: string;
  imagenReal: string;
  sinVideo: string;
  sinVideoNota: string;
  vistaCamara: string;
  vistaMaqueta: string;
  girar: string;
  mismaCamara: string;
  momento: string;
  reproducir: string;
  pausar: string;
  fuente: string;
};

type Props = {
  actual: Analitica;
  textos: TextosPareja;
  /** Paso activo (índice en `fases`) y su estado: lo lleva el reloj del video, o la simulación si no hay video. */
  onPaso: (idx: number, estado: EstadoSim) => void;
};

function pasoEn(a: Analitica, t: number) {
  let i = -1;
  a.fases.forEach((f, k) => {
    if (t >= f.t) i = k;
  });
  return i;
}

/** Puntos normalizados → atributo `points` de SVG (viewBox 0 0 100 100, sin conservar aspecto). */
const pts = (m: Marca) => m.pts.map(([x, y]) => `${(x * 100).toFixed(2)},${(y * 100).toFixed(2)}`).join(" ");

/**
 * La pareja de la lámina: la simulación 3D y el video real, del mismo tamaño (16:9),
 * vistos desde la misma cámara y con UN solo reloj (el del video). Debajo, una línea
 * de tiempo compartida con los pasos y el momento del evento; sobre el video, la zona
 * o línea de la analítica con el mismo color y texto que en el 3D.
 */
export function ParejaSimVideo({ actual, textos, onPaso }: Props) {
  const v = actual.video;
  const conVideo = !!v?.src;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [vistaElegida, setVistaElegida] = useState<{ id: string; vista: "cctv" | "maqueta" } | null>(null);
  const vista = vistaElegida?.id === actual.id ? vistaElegida.vista : conVideo ? "cctv" : "maqueta";
  const [reloj, setReloj] = useState({ id: actual.id, t: 0, play: false });
  const t = reloj.id === actual.id ? reloj.t : 0;
  const dur = actual.dur;

  // El reloj del video (rAF mientras corre) mueve la línea de tiempo, las marcas y los pasos.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !conVideo) return;
    let raf = 0;
    let ultimo = -1;
    const tick = () => {
      const tt = el.currentTime;
      if (Math.abs(tt - ultimo) > 0.04) {
        ultimo = tt;
        setReloj({ id: actual.id, t: tt, play: !el.paused });
      }
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => setReloj({ id: actual.id, t: el.currentTime, play: true });
    const onPause = () => setReloj({ id: actual.id, t: el.currentTime, play: false });
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [actual.id, conVideo]);

  const idxVideo = conVideo ? pasoEn(actual, t) : -1;
  useEffect(() => {
    if (conVideo && idxVideo >= 0) onPaso(idxVideo, actual.fases[idxVideo].estado);
  }, [conVideo, idxVideo, actual, onPaso]);

  // Sin video, la simulación es la que avisa sus pasos.
  const [pasoSim, setPasoSim] = useState<{ id: string; idx: number }>({ id: actual.id, idx: -1 });
  const onFase = useCallback(
    (fase: EstadoSim, i: number, id: string) => {
      setPasoSim({ id, idx: i });
      if (!conVideo) onPaso(i, fase);
    },
    [conVideo, onPaso],
  );
  const idx = conVideo ? idxVideo : pasoSim.id === actual.id ? pasoSim.idx : -1;
  const estado: EstadoSim = idx >= 0 ? actual.fases[idx].estado : "vigila";
  const evento = v?.evento;
  const enEvento = evento != null && t >= evento && t < evento + 2.2;

  const alternar = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  };
  const saltar = (seg: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(dur - 0.05, seg));
  };

  const chapaVideo = v?.ia ? textos.videoIa : v?.src ? textos.videoReal : v?.img ? textos.imagenReal : textos.sinVideo;
  const marcas = (v?.marcas ?? []).filter((m) => (m.desde == null || t >= m.desde) && (m.hasta == null || t < m.hasta));

  return (
    <div>
      <div className="grid grid-cols-1 gap-px bg-border/40 lg:grid-cols-2">
        {/* Simulación 3D */}
        <figure className="m-0 min-w-0 bg-card">
          <figcaption className="flex min-h-10 items-center justify-between gap-3 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] sm:min-h-11 sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.25em] text-foreground/60">
            <span className="flex items-center gap-2">
              <span className="size-1.5 bg-accent" aria-hidden />
              {textos.simulacion}
            </span>
            <span className="flex border border-border/60" role="group" aria-label={textos.simulacion}>
              {(["cctv", "maqueta"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={vista === k}
                  onClick={() => setVistaElegida({ id: actual.id, vista: k })}
                  className={cn(
                    "whitespace-nowrap px-2 py-1 text-[9px] font-bold tracking-[0.1em] transition-colors sm:px-2.5 sm:tracking-[0.18em]",
                    vista === k ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground",
                  )}
                >
                  {k === "cctv" ? textos.vistaCamara : textos.vistaMaqueta}
                </button>
              ))}
            </span>
          </figcaption>
          <div className={cn("relative transition-shadow duration-300", enEvento && "shadow-[inset_0_0_0_3px_#E5484D]")}>
            <Sim3D
              id={actual.id}
              lazy={false}
              vista={vista}
              onFase={onFase}
              relojRef={conVideo ? videoRef : undefined}
              relojClave={conVideo ? actual.id : null}
              className="aspect-video w-full"
              title={`${textos.simulacion}: ${actual.nombre}`}
            />
            {enEvento && <span className="pointer-events-none absolute inset-0 animate-pulse shadow-[inset_0_0_0_3px_#E5484D]" aria-hidden />}
          </div>
          <p className="hidden px-4 py-2 font-mono text-[9px] sm:block uppercase tracking-[0.2em] text-foreground/45">
            {vista === "cctv" && conVideo ? textos.mismaCamara : textos.girar}
          </p>
        </figure>

        {/* Video real */}
        <figure className="m-0 min-w-0 bg-card">
          <figcaption className="flex min-h-10 items-center justify-between gap-3 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] sm:min-h-11 sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.25em] text-foreground/60">
            <span className="flex shrink-0 items-center gap-2">
              <span
                className="size-1.5"
                style={{ background: v ? (v.ia ? "#D6AB4C" : "#E5484D") : "transparent", outline: v ? undefined : "1px solid currentColor" }}
                aria-hidden
              />
              {chapaVideo}
            </span>
            {v && <span className="truncate text-foreground/40">{v.chapa}</span>}
          </figcaption>
          <div className="relative aspect-video w-full overflow-hidden bg-[#060D22]">
            {v?.src && (
              <video
                key={actual.id}
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
                preload="auto"
                poster={v.poster}
                onClick={alternar}
                aria-label={`${chapaVideo}: ${actual.nombre}`}
              >
                <source src={v.src} type="video/mp4" />
              </video>
            )}
            {v && !v.src && v.img && (
              // eslint-disable-next-line @next/next/no-img-element -- evidencia servida tal cual desde /public
              <img src={v.img} alt={`${textos.imagenReal}: ${actual.nombre}`} className="absolute inset-0 h-full w-full object-cover" />
            )}
            {!v && (
              <div className="absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(135deg,#0a1530_0_12px,#0d1a3a_12px_24px)] p-8 text-center">
                <p className="max-w-xs text-sm leading-relaxed text-[#d5e0ff]/70">{textos.sinVideoNota}</p>
              </div>
            )}

            {/* Zona / línea de la analítica, con el color y el texto del 3D */}
            {marcas.length > 0 && (
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {marcas.map((m, i) =>
                  m.tipo === "zona" ? (
                    <polygon
                      key={i}
                      points={pts(m)}
                      fill={MARCA_COLOR[m.color]}
                      fillOpacity={estado === "alerta" && m.color === "alerta" ? 0.32 : 0.2}
                      stroke={MARCA_COLOR[m.color]}
                      strokeWidth={2}
                      vectorEffect="non-scaling-stroke"
                    />
                  ) : (
                    <polyline key={i} points={pts(m)} fill="none" stroke={MARCA_COLOR[m.color]} strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  ),
                )}
              </svg>
            )}
            {marcas.map((m, i) =>
              m.etiqueta ? (
                <span
                  key={i}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white sm:text-[10px]"
                  style={{
                    left: `${(m.pts.reduce((s, p) => s + p[0], 0) / m.pts.length) * 100}%`,
                    top: `${Math.min(...m.pts.map((p) => p[1])) * 100}%`,
                    background: MARCA_COLOR[m.color],
                    color: m.color === "detecta" || m.color === "oro" ? "#1a1200" : "#fff",
                  }}
                >
                  {m.etiqueta}
                </span>
              ) : null,
            )}

            {/* Mismo estado que la pastilla de la simulación */}
            {conVideo && (
              <span
                className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white sm:text-[10px]"
                style={{ background: estado === "alerta" ? "#E5484D" : "rgba(0,10,32,.7)" }}
              >
                <i className={cn("size-2 rounded-full", estado === "alerta" && "animate-pulse")} style={{ background: estado === "alerta" ? "#fff" : ESTADO_COLOR[estado] }} />
                {ESTADO_LABEL[estado]}
              </span>
            )}
            {enEvento && <span className="pointer-events-none absolute inset-0 animate-pulse shadow-[inset_0_0_0_3px_#E5484D]" aria-hidden />}
          </div>
          <p className="hidden truncate px-4 py-2 font-mono text-[9px] sm:block uppercase tracking-[0.2em] text-foreground/45">
            {v?.fuente ? `${textos.fuente}: ${v.fuente}${v.licencia ? ` · ${v.licencia}` : ""}` : " "}
          </p>
        </figure>
      </div>

      {/* Línea de tiempo compartida: un solo reloj para el 3D y el video */}
      <div className="flex items-center gap-3 border-t border-border/40 px-4 py-3">
        {conVideo && (
          <button
            type="button"
            onClick={alternar}
            aria-label={reloj.play ? textos.pausar : textos.reproducir}
            className="grid size-8 shrink-0 place-items-center border border-border/60 text-xs text-foreground/80 hover:border-foreground/50"
          >
            {reloj.play ? "❚❚" : "▶"}
          </button>
        )}
        <div className="relative h-8 flex-1">
          <div
            className={cn("absolute inset-x-0 top-1/2 flex h-2 -translate-y-1/2 overflow-hidden", conVideo && "cursor-pointer")}
            onClick={(e) => {
              if (!conVideo) return;
              const r = e.currentTarget.getBoundingClientRect();
              saltar(((e.clientX - r.left) / r.width) * dur);
            }}
            role={conVideo ? "slider" : undefined}
            aria-label={conVideo ? textos.momento : undefined}
            aria-valuemin={conVideo ? 0 : undefined}
            aria-valuemax={conVideo ? dur : undefined}
            aria-valuenow={conVideo ? Math.round(t * 10) / 10 : undefined}
          >
            {actual.fases.map((f, i) => {
              const fin = actual.fases[i + 1]?.t ?? dur;
              return (
                <span
                  key={i}
                  className="h-full transition-opacity"
                  style={{ width: `${((fin - f.t) / dur) * 100}%`, background: ESTADO_COLOR[f.estado], opacity: i === idx ? 1 : 0.35 }}
                />
              );
            })}
          </div>
          {actual.fases.map((f, i) => (
            <button
              key={i}
              type="button"
              disabled={!conVideo}
              onClick={() => saltar(f.t + 0.01)}
              className={cn(
                "absolute top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-mono text-[9px] font-bold tabular-nums",
                i === idx ? "text-white" : "bg-card text-foreground/70 ring-1 ring-border",
              )}
              style={{ left: `${Math.max(1.5, (f.t / dur) * 100)}%`, background: i === idx ? ESTADO_COLOR[f.estado] : undefined }}
              aria-label={`${i + 1}. ${f.texto}`}
            >
              {i + 1}
            </button>
          ))}
          {evento != null && (
            <span
              className="pointer-events-none absolute -top-1 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-[#E5484D]"
              style={{ left: `${(evento / dur) * 100}%` }}
            >
              ▼ {textos.momento}
            </span>
          )}
          {conVideo && <span className="pointer-events-none absolute inset-y-1 w-0.5 bg-foreground" style={{ left: `${(t / dur) * 100}%` }} aria-hidden />}
        </div>
        <span className="w-16 shrink-0 text-right font-mono text-[10px] tabular-nums text-foreground/60">
          {conVideo ? `${t.toFixed(1)} / ${dur}s` : `${dur}s`}
        </span>
      </div>
    </div>
  );
}
