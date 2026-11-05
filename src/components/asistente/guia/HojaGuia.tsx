"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronUp, Mic, X } from "lucide-react";
import { definirInsetsGuia } from "@/lib/asistente/acciones";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import { OrbeArs } from "../OrbeArs";
import type { FaseVoz } from "../OrbeVoz";
import { estadoArs } from "../tema";

type Props = {
  /** Última línea de Ars (o lo que está diciendo en voz). */
  linea: string;
  enCurso: boolean;
  vozOn: boolean;
  faseVoz: FaseVoz;
  nivelVoz: () => number;
  alExpandir: () => void;
  alCerrar: () => void;
  alMic: () => void;
  /** Pista de sección o controles del recorrido, encima de la línea. */
  arriba?: ReactNode;
  recorrido?: ReactNode;
};

/**
 * Hoja inferior para móvil mientras Ars guía: una barra de vistazo con su
 * última frase y el micrófono, que deja ver la página. Se expande con un toque
 * o deslizando hacia arriba; deslizando hacia abajo se minimiza.
 */
export function HojaGuia(p: Props) {
  const { t } = useTextosAsistente();
  const ref = useRef<HTMLDivElement>(null);
  const inicioY = useRef<number | null>(null);

  // El scroll del asistente centra las secciones por encima de la hoja.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => definirInsetsGuia({ abajo: el.getBoundingClientRect().height });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => {
      ro.disconnect();
      definirInsetsGuia({ abajo: 0 });
    };
  }, []);

  return (
    <div
      ref={ref}
      role="region"
      aria-label={t("asistente.guia.acompanando")}
      onPointerDown={(e) => {
        inicioY.current = e.clientY;
      }}
      onPointerUp={(e) => {
        const y0 = inicioY.current;
        inicioY.current = null;
        if (y0 === null) return;
        const dy = e.clientY - y0;
        if (dy < -28) p.alExpandir();
        else if (dy > 48) p.alCerrar();
      }}
      className="fixed inset-x-0 bottom-0 z-[70] touch-pan-x rounded-t-3xl border-t border-[#2348d4]/40 bg-[#020a18]/95 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-1.5 text-foreground shadow-[0_-18px_50px_-20px_rgba(35,72,212,0.7)] backdrop-blur-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-300 md:hidden"
    >
      <button
        type="button"
        onClick={p.alExpandir}
        aria-label={t("asistente.guia.expandir")}
        className="mx-auto mb-1.5 block h-4 w-16 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
      >
        <span className="mx-auto block h-1 w-10 rounded-full bg-white/25" aria-hidden="true" />
      </button>
      {p.arriba && <div className="mb-2">{p.arriba}</div>}
      {p.recorrido && <div className="mb-2 rounded-2xl border border-[#2348d4]/40 bg-[#142664]/40 px-2.5 py-2">{p.recorrido}</div>}
      <div className="flex items-center gap-2">
        <OrbeArs estado={estadoArs(p.vozOn ? p.faseVoz : "inactivo", p.enCurso)} tamano={34} />
        <button type="button" onClick={p.alExpandir} className="min-w-0 flex-1 text-left" aria-label={`${t("asistente.guia.expandir")}: ${p.linea}`}>
          <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-[#7fa0ff]">
            {p.enCurso ? t("asistente.guia.escribiendo") : t("asistente.nombre")}
          </span>
          <span className="line-clamp-2 text-[13px] leading-snug text-foreground/85">{p.linea || t("asistente.guia.acompanando")}</span>
        </button>
        <button
          type="button"
          onClick={p.alMic}
          aria-pressed={p.vozOn}
          aria-label={p.vozOn ? t("asistente.salirVoz") : t("asistente.hablar")}
          className={`grid size-10 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4] ${
            p.vozOn ? "border-[#2348d4] bg-[#2348d4]/30 text-white" : "border-white/15 text-foreground/80"
          }`}
        >
          <Mic className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={p.alExpandir}
          aria-label={t("asistente.guia.expandir")}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[#2348d4] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronUp className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={p.alCerrar}
          aria-label={t("asistente.cerrar")}
          className="grid size-8 shrink-0 place-items-center rounded-full text-foreground/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
