"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { aiCapabilities, categoryLabels, type AICapability } from "@/data/ai-capabilities";
import { ICONO_DEMO } from "./iconos";
import { CATEGORIAS_EN, type TextosLab } from "./textos";

type Categoria = AICapability["category"];
export type Filtro = Categoria | "ALL";

const CATEGORIAS: Categoria[] = ["people", "vehicle", "industrial", "perimeter", "ops"];

type Props = {
  t: TextosLab;
  isES: boolean;
  seleccionado: string;
  filtro: Filtro;
  onFiltro: (f: Filtro) => void;
  onElegir: (id: string) => void;
};

/**
 * Tira de tarjetas de modelos con filtro por categoría. Elegir un modelo cambia
 * el overlay del escenario en vivo (sin reiniciar la cámara).
 */
export function SelectorModelos({ t, isES, seleccionado, filtro, onFiltro, onElegir }: Props) {
  const tiraRef = useRef<HTMLDivElement>(null);
  const lista = filtro === "ALL" ? aiCapabilities : aiCapabilities.filter((c) => c.category === filtro);
  const cat = (c: Categoria) => (isES ? categoryLabels[c] : CATEGORIAS_EN[c]);

  // Mantener visible la tarjeta activa dentro de la tira (sin mover la página).
  useEffect(() => {
    const tira = tiraRef.current;
    const el = tira?.querySelector<HTMLElement>(`[data-modelo="${seleccionado}"]`);
    if (!tira || !el) return;
    const izq = el.offsetLeft - tira.offsetLeft;
    if (izq < tira.scrollLeft || izq + el.offsetWidth > tira.scrollLeft + tira.clientWidth) {
      tira.scrollTo({ left: izq - 16, behavior: "smooth" });
    }
  }, [seleccionado, filtro]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">
          <span className="mr-2 inline-block size-1.5 align-middle bg-accent" />
          {t.elegir} · {lista.length}/{aiCapabilities.length}
        </div>
        <div className="-mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label={t.elegir}>
          {(["ALL", ...CATEGORIAS] as const).map((c) => {
            const n = c === "ALL" ? aiCapabilities.length : aiCapabilities.filter((m) => m.category === c).length;
            const on = filtro === c;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onFiltro(c)}
                className={`shrink-0 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  on
                    ? "border-accent bg-accent/25 text-foreground"
                    : "border-border/60 bg-background/40 text-foreground/55 hover:bg-secondary hover:text-foreground"
                }`}
              >
                {c === "ALL" ? t.todas : cat(c)}
                <span className="ml-1.5 text-foreground/40">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={tiraRef}
        className="relative -mx-6 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-3 md:-mx-10 md:px-10 [scrollbar-width:thin]"
      >
        {lista.map((cap) => {
          const Icono = ICONO_DEMO[cap.demoType];
          const on = cap.id === seleccionado;
          return (
            <button
              key={cap.id}
              type="button"
              data-modelo={cap.id}
              aria-pressed={on}
              onClick={() => onElegir(cap.id)}
              className={`group relative flex w-[210px] shrink-0 snap-start flex-col overflow-hidden border text-left transition-all motion-safe:hover:-translate-y-0.5 sm:w-[230px] ${
                on ? "border-accent bg-accent/10 shadow-[0_0_0_1px_var(--accent)]" : "border-border/60 bg-background/40 hover:border-accent/70"
              }`}
            >
              <div className="relative h-20 w-full overflow-hidden bg-deep">
                <Image
                  src={cap.hero}
                  alt=""
                  fill
                  sizes="230px"
                  className={`object-cover transition-all duration-500 ${on ? "opacity-70" : "opacity-35 grayscale group-hover:opacity-60 group-hover:grayscale-0"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/30 to-transparent" />
                <div className="grid-bg absolute inset-0 opacity-30" />
                <div
                  className={`absolute left-3 top-3 grid size-8 place-items-center border backdrop-blur ${
                    on ? "border-accent bg-accent/30 text-white" : "border-border/60 bg-deep/70 text-foreground/80"
                  }`}
                >
                  <Icono className="size-4" aria-hidden />
                </div>
                {on && (
                  <div className="absolute right-2 top-2 flex items-center gap-1.5 border border-red-500/60 bg-deep/80 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-red-300">
                    <span className="size-1.5 bg-red-500 motion-safe:animate-pulse" />
                    {isES ? "En escenario" : "On stage"}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.28em] text-foreground/50">
                  <span>{cat(cap.category)}</span>
                  <span className="text-accent">{cap.metric.value}</span>
                </div>
                <div className="mt-1.5 font-heading text-[13px] font-bold uppercase leading-tight tracking-tight text-foreground">
                  {cap.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
