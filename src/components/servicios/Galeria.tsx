"use client";

import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Captura } from "@/data/servicios";
import { cn } from "@/lib/utils";

/** Capturas del módulo con visor a pantalla completa (teclado: ←/→ y Esc). */
export function Galeria({ capturas, acento }: { capturas: Captura[]; acento: string }) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const origenRef = useRef<HTMLButtonElement | null>(null);
  const n = capturas.length;

  const abrir = (i: number, el: HTMLButtonElement) => {
    origenRef.current = el;
    setAbierta(i);
  };
  const cerrar = useCallback(() => setAbierta(null), []);
  const mover = useCallback((d: number) => setAbierta((i) => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (abierta !== null && !dlg.open) dlg.showModal();
    if (abierta === null && dlg.open) {
      dlg.close();
      origenRef.current?.focus();
    }
  }, [abierta]);

  useEffect(() => {
    if (abierta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") mover(1);
      else if (e.key === "ArrowLeft") mover(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierta, mover]);

  if (n === 0) return null;
  const actual = abierta === null ? null : capturas[abierta];

  return (
    <>
      <ul className={cn("grid gap-3", n > 1 && "sm:grid-cols-2")}>
        {capturas.map((c, i) => (
          <li key={c.src} className={cn(n > 2 && i === 0 && "sm:col-span-2")}>
            <figure>
              <button
                type="button"
                onClick={(e) => abrir(i, e.currentTarget)}
                className="group relative block w-full overflow-hidden border border-white/10 bg-[#060f24] transition-colors hover:border-white/30"
                aria-label={`Ampliar captura: ${c.alt}`}
              >
                <Image
                  src={c.src}
                  alt={c.alt}
                  width={c.ancho}
                  height={c.alto}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  loading="lazy"
                  className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <span className="absolute right-2 top-2 grid size-8 place-items-center bg-[#020a18]/75 text-white/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Maximize2 className="size-3.5" aria-hidden="true" />
                </span>
              </button>
              <figcaption className="mt-2 flex gap-2 text-xs leading-relaxed text-[#9eb0c0]">
                <span className="mt-[7px] inline-block h-px w-3 shrink-0" style={{ background: acento }} aria-hidden="true" />
                {c.pie}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={cerrar}
        onClick={(e) => {
          if (e.target === e.currentTarget) cerrar();
        }}
        aria-label={actual ? actual.alt : "Captura"}
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 text-white backdrop:bg-[#020a18]/92 backdrop:backdrop-blur-sm"
      >
        {actual && (
          <div className="pointer-events-none flex h-full flex-col items-center justify-center gap-4 p-4 md:p-10">
            <Image
              src={actual.src}
              alt={actual.alt}
              width={actual.ancho}
              height={actual.alto}
              sizes="100vw"
              className="pointer-events-auto max-h-[78dvh] w-auto max-w-full border border-white/10 object-contain"
            />
            <p className="pointer-events-auto max-w-2xl text-center text-sm text-[#c5d2ee]">
              {actual.pie}
              {n > 1 && (
                <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                  {(abierta ?? 0) + 1} / {n}
                </span>
              )}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={cerrar}
          autoFocus
          aria-label="Cerrar"
          className="fixed right-4 top-4 grid size-11 place-items-center border border-white/20 bg-[#020a18]/80 text-white hover:bg-white/10"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => mover(-1)}
              aria-label="Captura anterior"
              className="fixed left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center border border-white/20 bg-[#020a18]/80 text-white hover:bg-white/10 md:left-6"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => mover(1)}
              aria-label="Captura siguiente"
              className="fixed right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center border border-white/20 bg-[#020a18]/80 text-white hover:bg-white/10 md:right-6"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
