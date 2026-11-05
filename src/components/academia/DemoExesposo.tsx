"use client";

import { MessageSquareQuote, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AMBAR, DEMO_B1, ROJO, VERDE } from "@/data/academia/contenido";
import { cn } from "@/lib/utils";
import { detenerAudio, reproducir } from "./audio";

type Fase = "elegir" | "vigilante" | "edgar" | "fin";

const colorAnimo = (v: number) => (v >= 70 ? ROJO : v >= 45 ? AMBAR : VERDE);
const textoAnimo = (v: number) => (v >= 70 ? "Alterado" : v >= 45 ? "Tenso" : "Más calmado");

/**
 * Demo interactiva del escenario B1 «El exesposo» (Módulo 3): el usuario elige lo que
 * dice el vigilante, suena su voz y luego la de Edgar, y el medidor de ánimo sube o baja.
 */
export function DemoExesposo() {
  const [elegida, setElegida] = useState<number | null>(null);
  const [fase, setFase] = useState<Fase>("elegir");
  const [animo, setAnimo] = useState<number>(DEMO_B1.animoInicial);
  const [faltan, setFaltan] = useState(false);
  const turno = useRef(0);

  useEffect(() => () => detenerAudio(), []);

  const elegir = async (i: number) => {
    const t = ++turno.current;
    const op = DEMO_B1.opciones[i];
    setElegida(i);
    setFaltan(false);
    setAnimo(DEMO_B1.animoInicial);
    setFase("vigilante");
    const r1 = await reproducir(op.audioVigilante);
    if (t !== turno.current) return;
    setFase("edgar");
    setAnimo(Math.max(0, Math.min(100, DEMO_B1.animoInicial + op.delta)));
    const r2 = await reproducir(op.audioEdgar);
    if (t !== turno.current) return;
    if (r1 === "faltante" || r2 === "faltante") setFaltan(true);
    setFase("fin");
  };

  const reiniciar = () => {
    turno.current++;
    detenerAudio();
    setElegida(null);
    setFase("elegir");
    setFaltan(false);
    setAnimo(DEMO_B1.animoInicial);
  };

  const op = elegida !== null ? DEMO_B1.opciones[elegida] : null;
  const color = colorAnimo(animo);

  return (
    <div className="border border-[#b78bff]/30 bg-gradient-to-br from-[#b78bff]/[0.08] to-[#020a18]/40 p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#d9c6ff]">Demo interactiva</p>
          <h4 className="mt-2 font-heading text-2xl font-black tracking-tight text-white md:text-3xl">{DEMO_B1.titulo}</h4>
        </div>
        {elegida !== null && (
          <button
            type="button"
            onClick={reiniciar}
            className="inline-flex items-center gap-1.5 border border-white/15 px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:bg-white/10"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Otra respuesta
          </button>
        )}
      </div>
      <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-[#c5d2ee]">{DEMO_B1.situacion}</p>

      {/* Medidor de ánimo */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
          <span className="text-white/55">Ánimo de Edgar</span>
          <span aria-live="polite" style={{ color }}>
            {textoAnimo(animo)}
            {op && fase !== "vigilante" && (
              <span className="ml-2 text-white/70">
                {op.delta < 0 ? `baja ${-op.delta}` : `sube ${op.delta}`}
              </span>
            )}
          </span>
        </div>
        <div
          role="meter"
          aria-label="Ánimo de Edgar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={animo}
          aria-valuetext={textoAnimo(animo)}
          className="relative mt-2 h-3 overflow-hidden border border-white/10 bg-white/[0.04]"
        >
          <div
            className="absolute inset-y-0 left-0 motion-safe:transition-[width,background-color] motion-safe:duration-700 motion-safe:ease-out"
            style={{ width: `${animo}%`, background: `linear-gradient(90deg, ${VERDE}, ${color})` }}
          />
          <div className="absolute inset-y-0 w-px bg-white/50" style={{ left: `${DEMO_B1.animoInicial}%` }} aria-hidden="true" />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
          <span>Calmado</span>
          <span>Alterado</span>
        </div>
      </div>

      {/* Opciones */}
      <div className="mt-6 grid gap-2.5 md:grid-cols-2" role="group" aria-label="Lo que dice el vigilante">
        {DEMO_B1.opciones.map((o, i) => (
          <button
            key={o.audioVigilante}
            type="button"
            onClick={() => void elegir(i)}
            aria-pressed={elegida === i}
            className={cn(
              "flex gap-3 border p-3.5 text-left text-[14.5px] leading-snug transition-colors md:p-4",
              elegida === i
                ? "border-[#b78bff] bg-[#b78bff]/15 text-white"
                : "border-white/12 bg-[#050d22]/70 text-[#dbe4f7] hover:border-[#b78bff]/60 hover:bg-white/[0.06]"
            )}
          >
            <span className="font-mono text-[10px] font-bold text-[#b78bff]">{i + 1}</span>
            <span className={cn(o.esAccion && "italic text-white/75")}>{o.vigilante}</span>
          </button>
        ))}
      </div>

      {/* Respuesta */}
      <div className="mt-5 min-h-[7.5rem] border-t border-white/10 pt-5" aria-live="polite">
        {!op ? (
          <p className="text-[14px] text-white/50">Elija una respuesta: suena el vigilante y luego Edgar.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                <MessageSquareQuote className="size-3.5 text-[#b78bff]" aria-hidden="true" />
                Edgar responde
                {fase === "vigilante" && (
                  <span className="inline-flex items-center gap-1 text-[#d9c6ff]">
                    <Volume2 className="size-3 motion-safe:animate-pulse" aria-hidden="true" /> habla el vigilante…
                  </span>
                )}
                {fase === "edgar" && (
                  <span className="inline-flex items-center gap-1 text-[#d9c6ff]">
                    <Volume2 className="size-3 motion-safe:animate-pulse" aria-hidden="true" /> habla Edgar…
                  </span>
                )}
              </p>
              {fase !== "vigilante" && (
                <p className="mt-2 font-serif text-lg italic leading-snug text-white">
                  {op.edgar}
                  {op.acotacion && <span className="ml-2 not-italic text-[13px] text-white/50">({op.acotacion})</span>}
                </p>
              )}
            </div>
            {fase === "fin" && (
              <div className="border-l-2 pl-4" style={{ borderColor: color }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">Por qué</p>
                <p className="mt-2 text-[14.5px] leading-snug text-[#dbe4f7]">{op.lectura}</p>
              </div>
            )}
          </div>
        )}
        {faltan && (
          <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/40">Audio en preparación: por ahora, el texto.</p>
        )}
      </div>
      <p className="mt-4 text-[12.5px] leading-snug text-white/45">{DEMO_B1.notaMedidor}</p>
    </div>
  );
}
