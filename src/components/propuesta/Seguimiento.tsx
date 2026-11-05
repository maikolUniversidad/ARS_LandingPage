"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { PreguntaSeguimiento, RespuestaSeguimiento } from "@/data/propuesta/tipos";
import { cn } from "@/lib/utils";
import { SIN_CONTORNO } from "./util";

/** Indicador de Ars «pensando» (mientras llegan las preguntas de seguimiento). */
export function ArsLeyendo({ nombre }: { nombre: string }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-2 py-14 text-center" role="status">
      <OrbeArs />
      <p className="mt-6 font-heading text-2xl font-black text-white">Ars está leyendo sus respuestas…</p>
      <p className="mt-2 font-serif text-lg italic text-[#b9c8ff]">Un momento{nombre ? `, ${nombre}` : ""}: quizá quiera precisar un par de cosas.</p>
    </div>
  );
}

export function OrbeArs({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid size-14 place-items-center", className)} aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#6b8aff_0%,#2348d4_45%,transparent_70%)] opacity-80 motion-safe:animate-pulse" />
      <span className="absolute inset-1 rounded-full border border-[#9fb4ff]/50 motion-safe:animate-spin [animation-duration:6s] [border-style:dashed]" />
      <Sparkles className="relative size-5 text-white" />
    </span>
  );
}

/** Ars hace sus preguntas de seguimiento una a una, con su «por qué» y opciones sugeridas. */
export function Seguimiento({
  preguntas,
  valor,
  onCambio,
  onTerminar,
}: {
  preguntas: PreguntaSeguimiento[];
  valor: RespuestaSeguimiento[];
  onCambio: (v: RespuestaSeguimiento[]) => void;
  onTerminar: () => void;
}) {
  const [i, setI] = useState(0);
  const p = preguntas[i];
  const actual = valor.find((v) => v.id === p?.id)?.respuesta ?? "";
  const [texto, setTexto] = useState(p && !p.opciones.includes(actual) ? actual : "");
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus({ preventScroll: true });
  }, [i]);

  if (!p) return null;

  const responder = (respuesta: string) => {
    const resto = valor.filter((v) => v.id !== p.id);
    onCambio(respuesta.trim() ? [...resto, { id: p.id, pregunta: p.pregunta, respuesta: respuesta.trim().slice(0, 300) }] : resto);
  };

  const avanzar = (e?: FormEvent) => {
    e?.preventDefault();
    if (i >= preguntas.length - 1) onTerminar();
    else {
      const sig = preguntas[i + 1];
      const prev = valor.find((v) => v.id === sig.id)?.respuesta ?? "";
      setTexto(sig.opciones.includes(prev) ? "" : prev);
      setI(i + 1);
    }
  };

  return (
    <section aria-labelledby="propuesta-seguimiento" className="mx-auto max-w-2xl border border-white/15 bg-[#020a18]/55 p-4 backdrop-blur sm:p-6 md:p-8">
      <div className="flex items-center gap-3">
        <OrbeArs className="size-10" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#6b8aff]">Ars pregunta</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            {i + 1} de {preguntas.length}
          </p>
        </div>
      </div>

      <form onSubmit={avanzar} key={p.id} className="mt-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
        <h3 id="propuesta-seguimiento" ref={tituloRef} tabIndex={-1} style={SIN_CONTORNO} className="font-heading text-2xl font-black leading-tight text-white outline-none md:text-3xl">
          {p.pregunta}
        </h3>
        {p.porQue && <p className="mt-2 font-serif text-[15px] italic text-[#b9c8ff]">{p.porQue}</p>}

        {p.opciones.length > 0 && (
          <fieldset className="mt-5">
            <legend className="sr-only">Opciones sugeridas</legend>
            <div className="flex flex-wrap gap-2">
              {p.opciones.map((o) => {
                const on = actual === o;
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setTexto("");
                      responder(on ? "" : o);
                    }}
                    className={cn(
                      "min-h-11 border px-3.5 py-2 text-left text-[14px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]/60",
                      on ? "border-[#6b8aff] bg-[#6b8aff]/20 text-white" : "border-white/15 bg-white/[0.03] text-white/80 hover:border-white/35 hover:text-white",
                    )}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <label htmlFor="propuesta-seguimiento-texto" className="mt-5 block font-mono text-[10px] uppercase tracking-[0.24em] text-[#9eb0c0]">
          O cuénteselo con sus palabras
        </label>
        <input
          id="propuesta-seguimiento-texto"
          value={texto}
          maxLength={300}
          onChange={(e) => {
            setTexto(e.target.value);
            responder(e.target.value);
          }}
          className="mt-2 w-full border border-white/15 bg-[#020a18]/70 px-3.5 py-3 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-[#6b8aff] focus-visible:ring-2 focus-visible:ring-[#6b8aff]/40"
          placeholder="Escriba aquí…"
        />

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          {actual ? (
            <span />
          ) : (
            <button type="button" onClick={() => avanzar()} className="min-h-11 px-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60 hover:text-white">
              Saltar<span className="sr-only"> esta pregunta</span>
            </button>
          )}
          <button
            type="submit"
            className="bevel-btn inline-flex min-h-11 items-center gap-3 bg-[#d5e0ff] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#020a18] hover:bg-white"
          >
            {i >= preguntas.length - 1 ? "Armar mi propuesta" : "Siguiente"} <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}
