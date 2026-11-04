"use client";

import { MessageCircleQuestion, X } from "lucide-react";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import type { Pista } from "./useSeguirSeccion";

type Props = {
  pista: Pista;
  alAceptar: () => void;
  alDescartar: () => void;
  compacta?: boolean;
};

/** Chip contextual «¿Te explico esta sección?» que aparece al detener el scroll. */
export function PistaSeccion({ pista, alAceptar, alDescartar, compacta }: Props) {
  const { t } = useTextosAsistente();
  return (
    <div
      role="status"
      className="flex items-center gap-1 rounded-2xl border border-[#2348d4]/60 bg-[#0a1430]/95 p-1 pl-1 shadow-[0_10px_30px_-12px_rgba(35,72,212,0.8)] backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
    >
      <button
        type="button"
        onClick={alAceptar}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-[#2348d4]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
      >
        <MessageCircleQuestion className="size-4 shrink-0 text-[#7fa0ff]" aria-hidden="true" />
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-foreground">{t("asistente.guia.pista")}</span>
          {!compacta && <span className="block truncate font-mono text-[9px] uppercase tracking-[0.2em] text-[#9eb0c0]">{pista.titulo}</span>}
        </span>
      </button>
      <button
        type="button"
        onClick={alDescartar}
        aria-label={t("asistente.guia.descartar")}
        title={t("asistente.guia.descartar")}
        className="grid size-7 shrink-0 place-items-center rounded-full text-foreground/50 hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
