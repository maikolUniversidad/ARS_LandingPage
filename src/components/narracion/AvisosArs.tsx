"use client";

import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Puntos } from "./AreaVivo";
import { avisoTieneDestino, destinoDeAviso, textoCorto, type AvisoArs } from "./useConversacionArs";

type Props = {
  avisos: AvisoArs[];
  alCerrar: (id: string) => void;
  alAbrir: (a: AvisoArs) => void;
  className?: string;
};

/**
 * Respuestas de Ars como notificaciones pequeñas apiladas: subtítulo corto
 * mientras habla y resumen al terminar. Se ocultan solas (no mientras el
 * puntero o el foco estén encima); si traen tarjeta o enlace, un toque lo abre.
 */
export function AvisosArs({ avisos, alCerrar, alAbrir, className }: Props) {
  const ultimoListo = [...avisos].reverse().find((a) => a.listo);
  return (
    <>
      {avisos.length > 0 && (
        <ol aria-label="Respuestas de Ars" className={cn("pointer-events-none flex flex-col items-start gap-1.5", className)}>
          {avisos.map((a) => (
            <Aviso key={a.id} aviso={a} alCerrar={alCerrar} alAbrir={alAbrir} />
          ))}
        </ol>
      )}
      {/* Solo la respuesta terminada se anuncia (no cada fragmento del streaming). */}
      <p className="sr-only" role="status" aria-live="polite">
        {ultimoListo ? `Ars: ${textoCorto(ultimoListo.texto, 400)}` : ""}
      </p>
    </>
  );
}

function Aviso({ aviso: a, alCerrar, alAbrir }: { aviso: AvisoArs; alCerrar: (id: string) => void; alAbrir: (a: AvisoArs) => void }) {
  const [fijo, setFijo] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const destino = a.listo && avisoTieneDestino(a) ? destinoDeAviso(a) : null;
  const conDestino = destino !== null;

  // Se oculta sola un rato después de terminar (más si trae algo que abrir).
  useEffect(() => {
    if (!a.listo || fijo) return;
    const ms = Math.min(16000, Math.max(6500, a.texto.length * 45)) + (conDestino ? 4000 : 0);
    const id = window.setTimeout(() => alCerrar(a.id), ms);
    return () => window.clearTimeout(id);
  }, [a.listo, a.id, a.texto.length, fijo, conDestino, alCerrar]);

  const linea = a.frase ? a.frase : textoCorto(a.texto);

  return (
    <li
      ref={ref}
      onPointerEnter={() => setFijo(true)}
      onPointerLeave={() => setFijo(false)}
      onFocus={() => setFijo(true)}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) setFijo(false);
      }}
      className={cn(
        "pointer-events-auto relative w-[min(19rem,calc(100vw-2rem))] rounded-xl border bg-[#020a18]/92 py-2 pl-3 pr-8 shadow-xl shadow-black/40 backdrop-blur-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
        a.error ? "border-amber-400/40" : "border-[#2348d4]/45"
      )}
    >
      {a.pregunta && (
        <p className="mb-1.5 ml-auto w-fit max-w-[92%] rounded-2xl rounded-br-sm bg-[#2348d4]/35 px-2.5 py-1 text-[12px] leading-snug text-white/90">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7fd1ff]">Usted · </span>
          {textoCorto(a.pregunta, 90)}
        </p>
      )}
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#6b8aff]">Ars</p>
      {a.texto || a.frase ? (
        <p className="mt-0.5 line-clamp-3 text-[12.5px] leading-snug text-[#dce5f7]">{linea}</p>
      ) : (
        <p className="mt-0.5 text-[12.5px] leading-snug text-white/70">
          Ars está pensando
          <Puntos />
        </p>
      )}
      {destino && (
        <button
          type="button"
          onClick={() => alAbrir(a)}
          className="mt-1.5 inline-flex min-h-8 items-center gap-1 rounded-full border border-[#6b8aff]/50 px-2.5 text-[11.5px] font-semibold text-white hover:bg-[#2348d4]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
        >
          {destino.etiqueta.length > 34 ? `${destino.etiqueta.slice(0, 32)}…` : destino.etiqueta}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={() => alCerrar(a.id)}
        aria-label="Cerrar esta respuesta"
        className="absolute right-1 top-1 grid size-7 place-items-center rounded-full text-white/45 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </li>
  );
}
