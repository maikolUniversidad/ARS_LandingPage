"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { MODULO_1, ROJO, VERDE } from "@/data/academia/contenido";
import { cn } from "@/lib/utils";

/** Mini‑quiz de las 12 tarjetas «¿Puede o no puede?» del Módulo 1. */
export function QuizPuedeNoPuede() {
  const tarjetas = MODULO_1.tarjetas;
  const [respuestas, setRespuestas] = useState<(boolean | null)[]>(() => tarjetas.map(() => null));

  const contestadas = respuestas.filter((r) => r !== null).length;
  const aciertos = respuestas.filter((r, i) => r !== null && r === tarjetas[i].puede).length;

  const elegir = (i: number, puede: boolean) =>
    setRespuestas((prev) => prev.map((r, j) => (j === i ? puede : r)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/55">
          Usted decide · {contestadas} / {tarjetas.length}
        </p>
        <div className="flex items-center gap-3">
          <p aria-live="polite" className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/80">
            Aciertos: <span className="text-white">{aciertos}</span>
          </p>
          {contestadas > 0 && (
            <button
              type="button"
              onClick={() => setRespuestas(tarjetas.map(() => null))}
              className="inline-flex items-center gap-1.5 border border-white/15 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:bg-white/10"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              Reiniciar
            </button>
          )}
        </div>
      </div>

      <ol className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tarjetas.map((t, i) => {
          const r = respuestas[i];
          const acerto = r !== null && r === t.puede;
          const color = t.puede ? VERDE : ROJO;
          return (
            <li
              key={t.situacion}
              className={cn(
                "flex flex-col border bg-[#050d22]/80 p-4 transition-colors",
                r === null ? "border-white/10" : acerto ? "border-[#35e0a1]/50" : "border-[#ff6b7a]/50"
              )}
            >
              <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-white/40">
                Tarjeta {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 flex-1 text-[15px] leading-snug text-white">{t.situacion}</p>

              {r === null ? (
                <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label={`¿Puede o no puede? ${t.situacion}`}>
                  <button
                    type="button"
                    onClick={() => elegir(i, true)}
                    className="border border-[#35e0a1]/50 bg-[#35e0a1]/10 px-2 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#9df2cf] transition-colors hover:bg-[#35e0a1]/20"
                  >
                    Puede
                  </button>
                  <button
                    type="button"
                    onClick={() => elegir(i, false)}
                    className="border border-[#ff6b7a]/50 bg-[#ff6b7a]/10 px-2 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffb3bb] transition-colors hover:bg-[#ff6b7a]/20"
                  >
                    No puede
                  </button>
                </div>
              ) : (
                <div className="mt-4 border-t border-white/10 pt-3" aria-live="polite">
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                    {acerto ? (
                      <Check className="size-3.5 text-[#35e0a1]" aria-hidden="true" />
                    ) : (
                      <X className="size-3.5 text-[#ff6b7a]" aria-hidden="true" />
                    )}
                    <span className="text-white/60">{acerto ? "Correcto" : "No es así"} ·</span>
                    <span className="font-bold" style={{ color }}>
                      {t.respuesta}
                    </span>
                  </p>
                  {t.porque && <p className="mt-1.5 text-[13.5px] leading-snug text-[#c5d2ee]">{t.porque}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
