"use client";

import { Headphones, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motorNarracion } from "@/lib/narracion/motor";
import { cn } from "@/lib/utils";
import type { FaseConversacion } from "./useConversacionArs";

export function etiquetaFase(f: FaseConversacion, ptt: boolean): string {
  switch (f) {
    case "escuchando":
      return ptt ? "Le escucho · suelte para enviar" : "Le escucho…";
    case "transcribiendo":
      return "Entendiendo…";
    case "pensando":
      return "Ars piensa…";
    case "hablando":
      return "Ars responde";
    case "esperando":
      return ptt ? "¿Algo más? Mantenga para hablar" : "¿Algo más?";
    case "escribiendo":
      return "Escriba su pregunta";
    default:
      return "";
  }
}

/** Campo para escribir la pregunta (modo `?arsTexto=1` o sin micrófono). */
export function CampoPregunta({
  alEnviar,
  alEscribir,
  className,
}: {
  alEnviar: (texto: string) => void;
  alEscribir?: () => void;
  className?: string;
}) {
  const [texto, setTexto] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <form
      className={cn("flex items-center gap-1.5", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (!texto.trim()) return;
        alEnviar(texto);
        setTexto("");
      }}
    >
      <label className="sr-only" htmlFor="ars-pregunta-rapida">
        Pregunta para Ars
      </label>
      <input
        id="ars-pregunta-rapida"
        ref={ref}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          alEscribir?.();
        }}
        maxLength={500}
        autoComplete="off"
        enterKeyHint="send"
        placeholder="Pregúntele a Ars…"
        className="min-h-10 min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-3.5 text-[13px] text-white placeholder:text-white/40 focus-visible:border-[#6b8aff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]/50"
      />
      <button
        type="submit"
        aria-label="Enviar la pregunta"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-[#2348d4] text-white hover:bg-[#2f57e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020a18] disabled:opacity-50"
        disabled={!texto.trim()}
      >
        <SendHorizontal className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}

/** Apagada: un botón discreto para volver a encenderla. */
export function BotonEscuchar({ narrada, className }: { narrada: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => motorNarracion.encender()}
      aria-label="Escuchar el recorrido narrado por Ars"
      className={cn(
        "pointer-events-auto flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-[#020a18]/85 px-3.5 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/70 backdrop-blur-md transition-colors hover:border-[#6b8aff]/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]",
        className
      )}
    >
      <Headphones className="size-4" aria-hidden="true" />
      <span>{narrada ? "Escuchar con Ars" : "Sonido"}</span>
    </button>
  );
}
