"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { analiticas as CATALOGO } from "@/data/analiticas";
import { ANALITICAS_PROHIBIDAS, type AnaliticaPropuesta } from "@/data/propuesta/tipos";
import { VideoEnVista } from "./Medios";
import { Revelar } from "./Revelar";

/** Analíticas de video aplicadas a su operación, con la evidencia real en bucle (solo en vista). */
export function AnaliticasPropuesta({ items }: { items: AnaliticaPropuesta[] }) {
  const lista = items
    .filter((x) => !ANALITICAS_PROHIBIDAS.has(x.id))
    .map((x) => ({ x, a: CATALOGO.find((c) => c.id === x.id) }))
    .filter((r): r is { x: AnaliticaPropuesta; a: NonNullable<typeof r.a> } => Boolean(r.a?.video && (r.a.video.src || r.a.video.img)))
    .slice(0, 4);
  if (!lista.length) return null;
  return (
    <ul className="grid gap-4 @2xl:grid-cols-2">
      {lista.map(({ x, a }, i) => {
        const v = a.video!;
        return (
          <Revelar as="li" key={x.id} retraso={(i % 2) * 120} className="overflow-hidden border border-white/10 bg-white/[0.03]">
            <div className="relative aspect-video bg-[#060f24]">
              {v.src ? (
                <VideoEnVista src={v.src} poster={v.poster} aria-label={`Ejemplo de evidencia: ${a.nombre}`} className="h-full w-full object-cover" />
              ) : (
                <Image src={v.img!} alt={`Ejemplo de evidencia: ${a.nombre}`} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
              )}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap gap-1.5 p-2">
                <span className="bg-[#020a18]/80 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/90">Ejemplo de evidencia</span>
                {v.ia && (
                  <span className="inline-flex items-center gap-1 bg-[#b78bff]/85 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#140a2a]">
                    <Sparkles className="size-3" aria-hidden="true" /> Generado con IA
                  </span>
                )}
              </div>
              <span className="pointer-events-none absolute bottom-2 left-2 max-w-[85%] truncate bg-[#020a18]/75 px-2 py-0.5 font-mono text-[9px] text-white/70">{v.chapa}</span>
            </div>
            <div className="p-4">
              <p className="text-[15px] font-bold text-white">{a.nombre}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#9fb4ff]">Dónde: {x.donde}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#c5d2ee]/85">{x.porQue}</p>
            </div>
          </Revelar>
        );
      })}
    </ul>
  );
}
