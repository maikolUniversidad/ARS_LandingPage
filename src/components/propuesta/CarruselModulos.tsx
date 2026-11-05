"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { ModuloPropuesto } from "@/data/propuesta/tipos";
import { moduloPorId } from "@/data/servicios";
import { rgba } from "@/components/servicios/ui";
import { cn } from "@/lib/utils";
import { VideoEnVista } from "./Medios";

/** «Así se ve en su operación»: capturas reales (y clip) de cada módulo propuesto, en carrusel. */
export function CarruselModulos({ modulos }: { modulos: ModuloPropuesto[] }) {
  const items = modulos
    .map((m) => ({ m, info: moduloPorId(m.modulo) }))
    .filter((x): x is { m: ModuloPropuesto; info: NonNullable<ReturnType<typeof moduloPorId>> } => Boolean(x.info && (x.info.modulo.capturas.length || x.info.modulo.clip)));
  const [sel, setSel] = useState(0);
  const pista = useRef<HTMLUListElement>(null);
  if (!items.length) return null;
  const actual = items[Math.min(sel, items.length - 1)];
  const { area, modulo } = actual.info;

  const mover = (d: number) => {
    const el = pista.current;
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]" role="group" aria-label="Elija un módulo">
        {items.map(({ m, info }, i) => {
          const on = i === sel;
          return (
            <button
              key={m.modulo}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setSel(i);
                pista.current?.scrollTo({ left: 0 });
              }}
              className={cn(
                "min-h-10 shrink-0 border px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]/60",
                on ? "text-white" : "border-white/12 text-white/65 hover:text-white",
              )}
              style={on ? { borderColor: info.area.color, background: rgba(info.area.color, 0.14) } : undefined}
            >
              {info.modulo.nombre}
            </button>
          );
        })}
      </div>

      <div className="relative mt-3">
        <ul
          ref={pista}
          key={modulo.id}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:thin] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
          aria-label={`Capturas de ${modulo.nombre}`}
        >
          {modulo.clip && (
            <li className="w-[88%] shrink-0 snap-start @2xl:w-[62%]">
              <figure>
                <div className="relative aspect-video overflow-hidden border border-white/10 bg-[#060f24]">
                  <VideoEnVista src={modulo.clip.mp4} poster={modulo.clip.poster} aria-label={modulo.clip.titulo} className="h-full w-full object-cover" />
                  <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 bg-[#020a18]/80 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/85">
                    <Play className="size-3" aria-hidden="true" /> Clip real
                  </span>
                </div>
                <figcaption className="mt-2 text-[12.5px] leading-relaxed text-[#9eb0c0]">{modulo.clip.descripcion}</figcaption>
              </figure>
            </li>
          )}
          {modulo.capturas.map((c) => (
            <li key={c.src} className="w-[88%] shrink-0 snap-start @2xl:w-[62%]">
              <figure>
                <div className="relative aspect-video overflow-hidden border border-white/10 bg-[#060f24]">
                  <Image src={c.src} alt={c.alt} fill sizes="(min-width: 1024px) 50vw, 90vw" className="object-cover object-top" />
                </div>
                <figcaption className="mt-2 flex gap-2 text-[12.5px] leading-relaxed text-[#9eb0c0]">
                  <span className="mt-[8px] inline-block h-px w-3 shrink-0" style={{ background: area.color }} aria-hidden="true" />
                  {c.pie}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-[13px] leading-snug text-[#c5d2ee]/85">
            <span className="font-bold text-white">{modulo.nombre}:</span> {actual.m.porQue}
          </p>
          <div className="flex shrink-0 gap-1.5">
            <button type="button" onClick={() => mover(-1)} aria-label="Anterior" className="grid size-10 place-items-center border border-white/15 text-white/80 hover:bg-white/10">
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => mover(1)} aria-label="Siguiente" className="grid size-10 place-items-center border border-white/15 text-white/80 hover:bg-white/10">
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
