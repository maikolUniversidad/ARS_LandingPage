"use client";

import { useRef, type FormEvent, type RefObject } from "react";
import { AudioLines, Mic, Paperclip, SendHorizontal, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACEPTA_TODO } from "./adjuntos";
import css from "./entrevista.module.css";

type Props = {
  entrada: string;
  setEntrada: (t: string) => void;
  onEnviar: () => void;
  onArchivos: (f: FileList | File[]) => void;
  ocupado: boolean;
  seleccionadas: number;
  dictando: boolean;
  onDictar: () => void;
  onConversar: () => void;
  vozDisponible: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
};

/** Entrada multimodal: texto, adjuntar (o pegar) archivos, dictar y conversar por voz. */
export function Compositor({ entrada, setEntrada, onEnviar, onArchivos, ocupado, seleccionadas, dictando, onDictar, onConversar, vozDisponible, inputRef }: Props) {
  const archivo = useRef<HTMLInputElement>(null);

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    onEnviar();
  };

  const boton = "grid size-11 shrink-0 place-items-center border border-white/12 text-white/75 transition-all hover:border-[#6b8aff]/60 hover:text-white disabled:opacity-40";

  return (
    <form onSubmit={alEnviar} className="flex items-end gap-1.5 sm:gap-2">
      <button type="button" onClick={() => archivo.current?.click()} className={boton} aria-label="Adjuntar foto, video o documento" title="Adjuntar foto, video o documento">
        <Paperclip className="size-4" aria-hidden="true" />
      </button>
      <input
        ref={archivo}
        type="file"
        multiple
        accept={ACEPTA_TODO}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          if (e.target.files?.length) onArchivos(e.target.files);
          e.target.value = "";
        }}
      />
      <div className={cn("relative flex min-w-0 flex-1 items-end border bg-[#020a18] transition-colors focus-within:border-[#6b8aff]", dictando ? "border-[#35e0a1]/70" : "border-white/15")}>
        <label htmlFor="diag-entrada" className="sr-only">
          Tu respuesta
        </label>
        <textarea
          id="diag-entrada"
          ref={inputRef}
          rows={1}
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          onPaste={(e) => {
            const files = Array.from(e.clipboardData.files);
            if (files.length) {
              e.preventDefault();
              onArchivos(files);
            }
          }}
          placeholder={dictando ? "Te escucho…" : seleccionadas ? `${seleccionadas} elegidas · agrega algo más o envía` : "Escribe o dicta…"}
          maxLength={1200}
          className="field-sizing-content max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[14.5px] text-white outline-none placeholder:text-white/35"
        />
        {vozDisponible && (
          <button
            type="button"
            onClick={onDictar}
            className={cn("m-1 grid size-9 shrink-0 place-items-center transition-colors", dictando ? "bg-[#35e0a1]/15 text-[#35e0a1]" : "text-white/55 hover:text-white")}
            aria-label={dictando ? "Terminar de dictar" : "Dictar con la voz"}
            aria-pressed={dictando}
            title={dictando ? "Terminar de dictar" : "Dictar"}
          >
            {dictando ? (
              <span className={cn(css.onda, "flex h-4 items-center gap-[2px]")} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
            ) : (
              <Mic className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {vozDisponible && !entrada.trim() && !seleccionadas ? (
        <button
          type="button"
          onClick={onConversar}
          className="group relative grid size-11 shrink-0 place-items-center bg-gradient-to-br from-[#2348d4] to-[#142664] text-white transition-transform hover:scale-105 motion-reduce:hover:scale-100"
          aria-label="Hablar con Ars (modo conversación)"
          title="Hablar con Ars"
        >
          <span className="absolute inset-0 animate-ping bg-[#2348d4]/30 [animation-duration:2.4s] motion-reduce:hidden" aria-hidden="true" />
          {dictando ? <Square className="size-3.5" aria-hidden="true" /> : <AudioLines className="relative size-4" aria-hidden="true" />}
        </button>
      ) : (
        <button
          type="submit"
          disabled={ocupado || (!entrada.trim() && !seleccionadas)}
          className="grid size-11 shrink-0 place-items-center bg-[#2348d4] text-white transition-colors hover:bg-[#3358e4] disabled:opacity-40 animate-in zoom-in-75 duration-200"
          aria-label="Enviar"
        >
          <SendHorizontal className="size-4" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
