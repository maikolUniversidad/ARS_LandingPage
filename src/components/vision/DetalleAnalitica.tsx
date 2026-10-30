"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { analiticas, familias, type EstadoSim } from "@/data/analiticas";
import { EstadoPill, ESTADO_COLOR } from "./EstadoPill";
import { Sim3D } from "./Sim3D";
import { cn } from "@/lib/utils";

type Textos = {
  cerrar: string;
  anterior: string;
  siguiente: string;
  comoSeActiva: string;
  videoReal: string;
  imagenReal: string;
  sinVideo: string;
  simulacion: string;
  segundo: string;
  estado: string;
};

/**
 * Ficha completa de una analítica, en un <dialog> nativo:
 * simulación 3D viva, los pasos que recorre (iluminados al ritmo de la
 * simulación) y el video real cuando existe.
 */
export function DetalleAnalitica({
  id,
  onCerrar,
  onIr,
  textos,
}: {
  id: string | null;
  onCerrar: () => void;
  onIr: (id: string) => void;
  textos: Textos;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [fase, setFase] = useState<EstadoSim>("vigila");
  // Al cambiar de analítica la simulación arranca en "vigila" (reinicio durante el render, sin efecto).
  const [idPrevio, setIdPrevio] = useState(id);
  if (idPrevio !== id) {
    setIdPrevio(id);
    setFase("vigila");
  }
  const idx = analiticas.findIndex((a) => a.id === id);
  const a = idx >= 0 ? analiticas[idx] : null;
  const anterior = idx > 0 ? analiticas[idx - 1] : null;
  const siguiente = idx >= 0 && idx < analiticas.length - 1 ? analiticas[idx + 1] : null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (id && !d.open) d.showModal();
    if (!id && d.open) d.close();
  }, [id]);

  // Bloquea el scroll de la página mientras la ficha está abierta.
  useEffect(() => {
    if (!id) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && siguiente) onIr(siguiente.id);
      if (e.key === "ArrowLeft" && anterior) onIr(anterior.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, anterior, siguiente, onIr]);

  const onFase = useCallback((f: EstadoSim) => setFase(f), []);

  const familia = a ? familias.find((f) => f.id === a.familia) : null;
  const faseIdx = a ? a.fases.reduce((acc, f, i) => (f.estado === fase && acc < 0 ? i : acc), -1) : -1;

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === ref.current) onCerrar();
      }}
      className="m-auto w-[min(100vw-1.5rem,1180px)] max-w-none bg-transparent p-0 text-foreground backdrop:bg-[#020a18]/85 backdrop:backdrop-blur-sm open:flex open:flex-col"
      aria-label={a?.nombre}
    >
      {a && (
        <article className="flex max-h-[calc(100vh-1.5rem)] flex-col overflow-hidden border border-border/60 bg-card shadow-2xl">
          {/* Cabecera */}
          <header className="flex items-start justify-between gap-4 border-b border-border/40 px-5 py-4 md:px-8">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                {familia?.nombre}
              </p>
              <h2 className="mt-1 font-heading text-xl font-black uppercase leading-tight tracking-tight md:text-3xl">
                {a.nombre}
              </h2>
              {a.estado && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#D6AB4C]">{a.estado}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="bevel-btn shrink-0 border border-border bg-background/40 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground"
            >
              ✕ {textos.cerrar}
            </button>
          </header>

          {/* Cuerpo */}
          <div className="grid gap-6 overflow-y-auto px-5 py-5 md:px-8 md:py-7 lg:grid-cols-[1.45fr_1fr]">
            <div className="flex flex-col gap-5">
              <figure className="m-0">
                <Sim3D key={a.id} id={a.id} lazy={false} onFase={onFase} className="aspect-[16/10] w-full" title={`${textos.simulacion}: ${a.nombre}`} />
                <figcaption className="mt-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">
                  <span>{textos.simulacion}</span>
                  <EstadoPill estado={fase} />
                </figcaption>
              </figure>

              {a.video ? (
                <figure className="m-0">
                  <div className="relative aspect-video w-full overflow-hidden bg-[#0B1530]">
                    {a.video.src ? (
                      <video
                        key={a.video.src}
                        className="absolute inset-0 h-full w-full object-contain"
                        controls
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                        poster={a.video.poster}
                      >
                        <source src={a.video.src} type="video/mp4" />
                      </video>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.video.img} alt={`${textos.imagenReal}: ${a.nombre}`} className="absolute inset-0 h-full w-full object-contain" />
                    )}
                  </div>
                  <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">
                    {a.video.src ? textos.videoReal : textos.imagenReal}: {a.video.chapa}
                  </figcaption>
                </figure>
              ) : (
                <p className="border border-dashed border-border/60 px-4 py-3 text-sm text-foreground/55">{textos.sinVideo}</p>
              )}
            </div>

            <div>
              <p className="text-base leading-relaxed text-foreground/80">{a.desc}</p>

              <h3 className="mt-8 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/55">
                {textos.comoSeActiva}
              </h3>
              <ol className="mt-4 flex flex-col">
                {a.fases.map((f, i) => {
                  const activo = i === faseIdx;
                  const pasado = faseIdx > i;
                  return (
                    <li
                      key={`${f.t}-${i}`}
                      className={cn(
                        "relative flex gap-4 border-l-2 py-3 pl-5 transition-colors",
                        activo ? "bg-foreground/[0.05]" : "",
                      )}
                      style={{ borderColor: activo || pasado ? ESTADO_COLOR[f.estado] : "rgba(213,224,255,0.15)" }}
                    >
                      <span
                        className="absolute -left-[7px] top-4 size-3 rounded-full border-2 border-card"
                        style={{ background: activo || pasado ? ESTADO_COLOR[f.estado] : "rgba(213,224,255,0.25)" }}
                      />
                      <span className="w-14 shrink-0 font-mono text-[11px] tabular-nums text-foreground/45">
                        {f.t.toFixed(1).replace(".", ",")} {textos.segundo}
                      </span>
                      <span className={cn("text-sm leading-snug", activo ? "text-foreground" : "text-foreground/65")}>
                        {f.texto}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Pie: anterior / siguiente */}
          <footer className="flex items-center justify-between gap-3 border-t border-border/40 px-5 py-3 md:px-8">
            <button
              type="button"
              disabled={!anterior}
              onClick={() => anterior && onIr(anterior.id)}
              className="bevel-btn inline-flex max-w-[45%] items-center gap-2 border border-border bg-background/40 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground disabled:opacity-30"
            >
              ‹ <span className="truncate">{anterior ? anterior.nombre : textos.anterior}</span>
            </button>
            <span className="font-mono text-[10px] tabular-nums text-foreground/40">
              {idx + 1} / {analiticas.length}
            </span>
            <button
              type="button"
              disabled={!siguiente}
              onClick={() => siguiente && onIr(siguiente.id)}
              className="bevel-btn inline-flex max-w-[45%] items-center gap-2 border border-border bg-background/40 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground disabled:opacity-30"
            >
              <span className="truncate">{siguiente ? siguiente.nombre : textos.siguiente}</span> ›
            </button>
          </footer>
        </article>
      )}
    </dialog>
  );
}
