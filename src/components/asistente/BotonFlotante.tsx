"use client";

import { X } from "lucide-react";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import { EstilosChat } from "./EstilosChat";
import { OrbeArs } from "./OrbeArs";
import type { FaseVoz } from "./OrbeVoz";
import { estadoArs } from "./tema";

type Props = {
  abierto: boolean;
  alAbrir: () => void;
  burbuja: string | null;
  alCerrarBurbuja: () => void;
  vozActiva: boolean;
  faseVoz: FaseVoz;
  /** Clic sobre la burbuja (por defecto abre el panel). */
  alAbrirBurbuja?: () => void;
  /** Ars está pensando una respuesta (consulta rápida con el panel cerrado). */
  pensando?: boolean;
};

/**
 * Orbe flotante de Ars: respira en reposo, se enciende al pasar el cursor y
 * reacciona cuando escucha, piensa o habla. Encima, una burbuja con la última
 * respuesta mientras el panel está cerrado. Los estilos del chat (orbe,
 * apertura, bloques) se montan aquí siempre, también con el panel abierto.
 */
export function BotonFlotante({ abierto, alAbrir, burbuja, alCerrarBurbuja, vozActiva, faseVoz, alAbrirBurbuja, pensando = false }: Props) {
  const { t } = useTextosAsistente();
  const estado = estadoArs(vozActiva ? faseVoz : "inactivo", pensando);
  return (
    <>
      <EstilosChat />
      {!abierto && (
        <div className="pointer-events-none fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-[60] flex flex-col items-end gap-2 md:bottom-20 md:right-6 [html[data-ars-dock]_&]:hidden">
          {burbuja && (
            <div className="pointer-events-auto relative max-w-[min(20rem,calc(100vw-2rem))] rounded-2xl rounded-br-sm border border-[#6b8aff]/25 bg-[#0a1430]/95 p-3 pr-8 text-sm text-[#d5e0ff] shadow-2xl shadow-black/40 backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
              <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-[#6b8aff]">Ars</span>
              <button type="button" onClick={alAbrirBurbuja ?? alAbrir} className="line-clamp-3 text-left">
                {burbuja}
              </button>
              <button
                type="button"
                onClick={alCerrarBurbuja}
                aria-label={t("asistente.cerrar")}
                className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full text-foreground/50 hover:bg-white/10 hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={alAbrir}
            aria-label={t("asistente.abrir")}
            aria-expanded={false}
            aria-controls="asistente-panel"
            aria-haspopup="dialog"
            data-estado={estado}
            className="ars-boton-entra group pointer-events-auto relative grid size-16 place-items-center rounded-full transition-transform duration-300 hover:scale-[1.07] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2348d4]/60 motion-reduce:transition-none"
          >
            <span className="absolute inset-0 rounded-full bg-[#020a18]/70 shadow-[0_12px_40px_-10px_rgba(35,72,212,0.85)] backdrop-blur" aria-hidden="true" />
            <OrbeArs estado={estado} tamano={64} className="relative" />
            <span className="pointer-events-none absolute -left-2 top-1/2 hidden -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-full border border-[#6b8aff]/25 bg-[#0a1430]/95 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-[#d5e0ff] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
              {estado === "pensando" ? t("asistente.pensando") : estado === "hablando" ? t("asistente.hablando") : t("asistente.hablar")}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
