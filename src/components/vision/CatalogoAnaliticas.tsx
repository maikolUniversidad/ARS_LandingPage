"use client";

import { useMemo, useState } from "react";
import { analiticas, familias, type FamiliaId } from "@/data/analiticas";
import { cn } from "@/lib/utils";

type Filtro = "todas" | "video" | FamiliaId;

/** Color de cada familia (el de la presentación original). */
export const FAMILIA_COLOR: Record<FamiliaId, string> = {
  comercial: "#D6AB4C",
  operativo: "#5BA4FF",
  prevencion: "#E5484D",
  lite: "#30A46C",
};

type Textos = {
  eyebrow: string;
  titleA: string;
  titleB: string;
  todas: string;
  conVideo: string;
  videoReal: string;
  abrir: string;
  resultado: (n: number) => string;
};

export function CatalogoAnaliticas({
  onAbrir,
  textos,
}: {
  onAbrir: (id: string) => void;
  textos: Textos;
}) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const lista = useMemo(() => {
    if (filtro === "todas") return analiticas;
    if (filtro === "video") return analiticas.filter((a) => a.video);
    return analiticas.filter((a) => a.familia === filtro);
  }, [filtro]);
  const conVideo = analiticas.filter((a) => a.video).length;

  return (
    <section id="catalogo" className="relative border-b border-border/40 px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/55">
              <span className="mr-3 inline-block size-1.5 align-middle bg-accent" />
              {textos.eyebrow}
            </div>
            <h2 className="mt-4 max-w-3xl font-heading text-3xl font-black uppercase tracking-tight md:text-5xl">
              {textos.titleA}
              <br />
              <span className="text-foreground/80">{textos.titleB}</span>
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/50">
            {textos.resultado(lista.length)}
          </p>
        </header>

        {/* Filtros: familia o "con video real" */}
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar analíticas">
          <Pill activo={filtro === "todas"} onClick={() => setFiltro("todas")} label={textos.todas} n={analiticas.length} />
          {familias.map((f) => (
            <Pill
              key={f.id}
              activo={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              label={f.nombre}
              n={analiticas.filter((a) => a.familia === f.id).length}
              color={FAMILIA_COLOR[f.id]}
            />
          ))}
          <Pill activo={filtro === "video"} onClick={() => setFiltro("video")} label={textos.conVideo} n={conVideo} icono="▶" />
        </div>

        {/* Lista densa: una fila por analítica */}
        <ul className="grid border-t border-border/40 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((a) => (
            <li key={a.id} className="border-b border-border/40 md:odd:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n+1)]:border-r xl:[&:nth-child(3n+2)]:border-r">
              <button
                type="button"
                onClick={() => onAbrir(a.id)}
                className="group flex h-full w-full items-stretch gap-4 px-4 py-5 text-left transition-colors hover:bg-foreground/[0.04] focus-visible:bg-foreground/[0.04]"
                aria-label={`${textos.abrir}: ${a.nombre}`}
              >
                <span
                  aria-hidden
                  className="mt-1 w-[3px] shrink-0 self-stretch"
                  style={{ background: FAMILIA_COLOR[a.familia] }}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-heading text-base font-black leading-tight tracking-tight text-foreground group-hover:text-white md:text-lg">
                      {a.nombre}
                    </span>
                    {a.video && (
                      <span
                        className="shrink-0 border border-foreground/25 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-foreground/70"
                        title={textos.videoReal}
                      >
                        ▶ {textos.videoReal}
                      </span>
                    )}
                  </span>
                  <span className="text-sm leading-snug text-foreground/60">{a.corta}</span>
                  {a.estado && (
                    <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#D6AB4C]">
                      {a.estado}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Pill({
  activo,
  onClick,
  label,
  n,
  color,
  icono,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
  n: number;
  color?: string;
  icono?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activo}
      onClick={onClick}
      className={cn(
        "bevel-btn inline-flex items-center gap-2 border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors",
        activo
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background/40 text-foreground/75 hover:border-foreground/60 hover:text-foreground",
      )}
    >
      {icono && <span>{icono}</span>}
      {color && !activo && <span className="size-2 rounded-full" style={{ background: color }} />}
      {label}
      <span className={cn("tabular-nums", activo ? "text-background/70" : "text-foreground/45")}>{n}</span>
    </button>
  );
}
