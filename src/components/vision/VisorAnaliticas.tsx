"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { analiticas, familias, type Analitica, type EstadoSim, type FamiliaId } from "@/data/analiticas";
import { EstadoPill, ESTADO_COLOR } from "./EstadoPill";
import { ParejaSimVideo, type TextosPareja } from "./ParejaSimVideo";
import { cn } from "@/lib/utils";

/** Color de cada familia (los mismos de la presentación original). */
export const FAMILIA_COLOR: Record<FamiliaId, string> = {
  comercial: "#D6AB4C",
  operativo: "#5BA4FF",
  prevencion: "#E5484D",
  lite: "#30A46C",
};

const porId = new Map(analiticas.map((a) => [a.id, a]));
const POR_DEFECTO = porId.has("calor") ? "calor" : analiticas[0].id;

function suscribirHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
const leerHash = () => decodeURIComponent(window.location.hash.slice(1));
const hashServidor = () => "";

/**
 * Qué analítica está abierta en el visor. Se comparte por la URL (`/vision#intrusion`)
 * para que un asesor pueda mandar el enlace directo a una analítica.
 */
export function useAnaliticaElegida(): [Analitica, (id: string) => void] {
  const hash = useSyncExternalStore(suscribirHash, leerHash, hashServidor);
  const id = porId.has(hash) ? hash : POR_DEFECTO;
  const elegir = useCallback((nuevo: string) => {
    if (!porId.has(nuevo)) return;
    try {
      // replaceState no dispara hashchange: lo avisamos nosotros para que el almacén se actualice.
      window.history.replaceState(null, "", `#${nuevo}`);
    } catch {
      window.location.hash = nuevo;
    }
    window.dispatchEvent(new Event("hashchange"));
  }, []);
  return [porId.get(id)!, elegir];
}

export type TextosVisor = TextosPareja & {
  comoSeActiva: string;
  anterior: string;
  siguiente: string;
  analiticas: string;
  de: string;
};

type Props = {
  actual: Analitica;
  onElegir: (id: string) => void;
  textos: TextosVisor;
};

/**
 * Visor lámina por lámina: la simulación 3D y el video real lado a lado, con un solo reloj,
 * debajo qué hace la analítica y los pasos que recorre, iluminados al ritmo
 * de la simulación. Un clic (familia, chip, flecha o tecla) cambia de analítica
 * sin recargar el motor 3D.
 */
export function VisorAnaliticas({ actual, onElegir, textos }: Props) {
  const idx = analiticas.findIndex((a) => a.id === actual.id);
  const anterior = analiticas[(idx - 1 + analiticas.length) % analiticas.length];
  const siguiente = analiticas[(idx + 1) % analiticas.length];
  const familia = familias.find((f) => f.id === actual.familia)!;
  const hermanas = analiticas.filter((a) => a.familia === actual.familia);
  const nroEnFamilia = hermanas.findIndex((a) => a.id === actual.id) + 1;

  // Paso activo de la simulación; se reinicia al cambiar de analítica (durante el render, sin efecto).
  const [paso, setPaso] = useState<{ id: string; idx: number; fase: EstadoSim }>({ id: actual.id, idx: -1, fase: "vigila" });
  const pasoActual = paso.id === actual.id ? paso : { id: actual.id, idx: -1, fase: "vigila" as EstadoSim };
  const actualId = actual.id;
  const onPaso = useCallback((i: number, fase: EstadoSim) => setPaso({ id: actualId, idx: i, fase }), [actualId]);

  // Teclado: ← → cambian de analítica (salvo escribiendo en un campo).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = (e.target as HTMLElement | null)?.tagName;
      if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key === "ArrowRight") onElegir(siguiente.id);
      else if (e.key === "ArrowLeft") onElegir(anterior.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anterior.id, siguiente.id, onElegir]);


  return (
    <section id="visor" className="scroll-mt-20 border-b border-border/40 px-4 pb-10 pt-6 sm:px-6 md:px-10 md:pb-14">
      <div className="mx-auto max-w-7xl">
        {/* Familias + contador + flechas */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Familias" className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {familias.map((f) => {
              const activa = f.id === actual.familia;
              const n = analiticas.filter((a) => a.familia === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={activa}
                  onClick={() => {
                    if (!activa) onElegir(analiticas.find((a) => a.familia === f.id)!.id);
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-2 border px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors",
                    activa ? "border-foreground/40 bg-foreground text-background" : "border-border/60 text-foreground/65 hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  <span className="size-2 rounded-full" style={{ background: FAMILIA_COLOR[f.id] }} aria-hidden />
                  {f.nombre}
                  <span className={cn("tabular-nums", activa ? "text-background/60" : "text-foreground/40")}>{n}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-foreground/60">
              <b className="text-foreground">{String(idx + 1).padStart(2, "0")}</b> {textos.de} {analiticas.length}
            </span>
            <button
              type="button"
              onClick={() => onElegir(anterior.id)}
              aria-label={`${textos.anterior}: ${anterior.nombre}`}
              className="grid size-9 place-items-center border border-border/60 text-foreground/80 transition-colors hover:border-foreground/50 hover:text-foreground"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => onElegir(siguiente.id)}
              aria-label={`${textos.siguiente}: ${siguiente.nombre}`}
              className="grid size-9 place-items-center border border-border/60 text-foreground/80 transition-colors hover:border-foreground/50 hover:text-foreground"
            >
              →
            </button>
          </div>
        </div>

        {/* Analíticas de la familia */}
        <div role="tablist" aria-label={familia.nombre} className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
          {hermanas.map((a) => {
            const activa = a.id === actual.id;
            return (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => onElegir(a.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border px-3 py-1.5 text-xs transition-colors",
                  activa ? "border-transparent text-[#020a18]" : "border-border/50 text-foreground/70 hover:border-foreground/40 hover:text-foreground",
                )}
                style={activa ? { background: FAMILIA_COLOR[actual.familia] } : undefined}
              >
                {a.nombre}
                {a.video && <span className={cn("text-[9px]", activa ? "opacity-70" : "text-foreground/40")} aria-label={a.video.ia ? textos.videoIa : textos.videoReal}>▶</span>}
              </button>
            );
          })}
        </div>

        {/* Lámina */}
        <article className="mt-3 border border-border/60 bg-card shadow-[0_40px_80px_-50px_rgba(0,12,40,0.9)]" aria-live="polite">
          <ParejaSimVideo key={actual.id} actual={actual} textos={textos} onPaso={onPaso} />

          {/* Qué hace + cómo se activa */}
          <div className="grid gap-8 border-t border-border/40 px-5 py-6 md:px-8 md:py-7 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            <div>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: FAMILIA_COLOR[actual.familia] }} aria-hidden />
                  {familia.nombre}
                </span>
                <span className="tabular-nums text-foreground/35">
                  {String(nroEnFamilia).padStart(2, "0")}/{String(hermanas.length).padStart(2, "0")}
                </span>
              </p>
              <h2 className="mt-3 font-heading text-2xl font-black uppercase leading-tight tracking-tight md:text-4xl">{actual.nombre}</h2>
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-foreground/75 md:text-base">{actual.desc}</p>
              {actual.estado && (
                <p className="mt-4 inline-block border border-[#D6AB4C]/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#D6AB4C]">{actual.estado}</p>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">{textos.comoSeActiva}</h3>
                <span className="flex flex-wrap gap-1">
                  {(["vigila", "detecta", "alerta", "ok"] as EstadoSim[]).map((e) => (
                    <EstadoPill key={e} estado={e} activo={pasoActual.fase === e} className="px-2 py-1 text-[9px]" />
                  ))}
                </span>
              </div>
              <ol className="mt-4 flex flex-col gap-1.5">
                {actual.fases.map((f, i) => {
                  const en = i === pasoActual.idx;
                  const ya = i < pasoActual.idx;
                  const color = ESTADO_COLOR[f.estado];
                  return (
                    <li
                      key={i}
                      className={cn(
                        "grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-3 border-l-2 py-2 pl-3 pr-3 text-sm leading-snug transition-colors duration-300",
                        en ? "bg-foreground/[0.06] text-foreground" : ya ? "text-foreground/45" : "text-foreground/70",
                      )}
                      style={{ borderLeftColor: en ? color : "transparent" }}
                      aria-current={en ? "step" : undefined}
                    >
                      <span
                        className="grid size-7 place-items-center rounded-full font-mono text-[11px] font-bold tabular-nums"
                        style={en ? { background: color, color: f.estado === "detecta" ? "#1a1200" : "#fff" } : { background: "rgba(127,140,180,0.15)", color: "inherit" }}
                      >
                        {i + 1}
                      </span>
                      <span>{f.texto}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
