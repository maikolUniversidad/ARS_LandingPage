"use client";

import { X } from "lucide-react";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import { AvatarMini } from "./AvatarArs";
import type { FaseVoz } from "./OrbeVoz";

type Props = {
  abierto: boolean;
  alAbrir: () => void;
  burbuja: string | null;
  alCerrarBurbuja: () => void;
  vozActiva: boolean;
  faseVoz: FaseVoz;
  /** Clic sobre la burbuja (por defecto abre el panel). */
  alAbrirBurbuja?: () => void;
};

/** Botón flotante (con el avatar de Ars) y burbuja con la última respuesta cuando el panel está cerrado. */
export function BotonFlotante({ abierto, alAbrir, burbuja, alCerrarBurbuja, vozActiva, faseVoz, alAbrirBurbuja }: Props) {
  const { t } = useTextosAsistente();
  if (abierto) return null;
  return (
    <div className="pointer-events-none fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-[60] flex flex-col items-end gap-2 md:bottom-20 md:right-6">
      {burbuja && (
        <div className="pointer-events-auto relative max-w-[min(20rem,calc(100vw-2rem))] rounded-2xl rounded-br-sm border border-white/10 bg-[#0a1430]/95 p-3 pr-8 text-sm text-foreground/90 shadow-2xl shadow-black/40 backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
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
        className="group pointer-events-auto relative grid size-16 place-items-center rounded-full border border-[#2348d4]/50 bg-[#020a18] shadow-[0_10px_40px_-8px_rgba(35,72,212,0.7)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2348d4]/60 motion-reduce:transition-none"
      >
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(35,72,212,0.45),transparent_65%)]" aria-hidden="true" />
        <AvatarMini fase={vozActiva ? faseVoz : "inactivo"} tamano={56} animado className="relative" />
        <span className="pointer-events-none absolute -left-1 top-1/2 hidden -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#0a1430]/95 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
          {t("asistente.hablar")}
        </span>
      </button>
    </div>
  );
}
