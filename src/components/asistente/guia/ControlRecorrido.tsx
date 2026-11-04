"use client";

import { ChevronLeft, ChevronRight, MessageCircle, Pause, Play, Route, X } from "lucide-react";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import type { EstadoRecorrido } from "./useRecorrido";

type Props = {
  recorrido: EstadoRecorrido;
  alAnterior: () => void;
  alSiguiente: () => void;
  alPausa: () => void;
  alSalir: () => void;
  alMasDetalle: (titulo: string) => void;
  /** Versión de una línea para la hoja móvil. */
  compacto?: boolean;
};

const boton =
  "grid size-8 shrink-0 place-items-center rounded-full text-foreground/75 transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4] disabled:opacity-30";

/** Controles del recorrido guiado: paso n/N, texto, anterior / pausa / siguiente. */
export function ControlRecorrido({ recorrido: r, alAnterior, alSiguiente, alPausa, alSalir, alMasDetalle, compacto }: Props) {
  const { t } = useTextosAsistente();
  const paso = r.pasos[r.i];
  const n = r.pasos.length;
  const etiqueta = t("asistente.recorrido.paso").replace("{n}", String(r.i + 1)).replace("{t}", String(n));

  const controles = (
    <div className="flex items-center gap-0.5">
      <button type="button" className={boton} onClick={alAnterior} disabled={r.i === 0 && !r.terminado} aria-label={t("asistente.recorrido.anterior")} title={t("asistente.recorrido.anterior")}>
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      {!r.terminado && (
        <button
          type="button"
          className={boton}
          onClick={alPausa}
          aria-pressed={r.pausado}
          aria-label={r.pausado ? t("asistente.recorrido.reanudar") : t("asistente.recorrido.pausar")}
          title={r.pausado ? t("asistente.recorrido.reanudar") : t("asistente.recorrido.pausar")}
        >
          {r.pausado ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
        </button>
      )}
      <button type="button" className={boton} onClick={alSiguiente} disabled={r.terminado} aria-label={t("asistente.recorrido.siguiente")} title={t("asistente.recorrido.siguiente")}>
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
      <button type="button" className={boton} onClick={alSalir} aria-label={t("asistente.recorrido.salir")} title={t("asistente.recorrido.salir")}>
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );

  const barra = (
    <div className="flex gap-1" aria-hidden="true">
      {r.pasos.map((p, i) => (
        <span key={p.id} className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          {(i < r.i || r.terminado) && <span className="absolute inset-0 bg-[#4d74ff]" />}
          {i === r.i && !r.terminado && (
            <progress
              value={r.progreso}
              max={1}
              className="absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-progress-bar]:bg-[#4d74ff] [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-[#4d74ff] motion-safe:[&::-webkit-progress-value]:transition-[width] motion-safe:[&::-webkit-progress-value]:duration-200"
            />
          )}
        </span>
      ))}
    </div>
  );

  if (compacto) {
    return (
      <div className="space-y-1.5">
        {barra}
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-xs">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7fa0ff]">{r.terminado ? t("asistente.recorrido.titulo") : etiqueta}</span>{" "}
            <span className="text-foreground/85">{r.terminado ? t("asistente.recorrido.fin") : paso.titulo}</span>
          </p>
          {controles}
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label={t("asistente.recorrido.titulo")}
      className="rounded-2xl border border-[#2348d4]/50 bg-gradient-to-br from-[#142664]/70 to-[#020a18]/80 p-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
    >
      <div className="mb-2 flex items-center gap-2">
        <Route className="size-3.5 text-[#7fa0ff]" aria-hidden="true" />
        <p className="flex-1 font-mono text-[9px] uppercase tracking-[0.25em] text-[#9eb0c0]">
          {t("asistente.recorrido.titulo")} · {r.terminado ? `${n}/${n}` : etiqueta}
          {r.pausado && !r.terminado && <span className="ml-2 text-amber-200/80">· {t("asistente.recorrido.pausado")}</span>}
        </p>
        {controles}
      </div>
      {barra}
      <div aria-live="polite" className="mt-2.5">
        {r.terminado ? (
          <p className="text-sm text-foreground/90">{t("asistente.recorrido.fin")}</p>
        ) : (
          <>
            <p className="text-sm font-bold leading-snug text-foreground">{paso.titulo}</p>
            {paso.texto && <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-foreground/70">{paso.texto}</p>}
            <button
              type="button"
              onClick={() => alMasDetalle(paso.titulo)}
              className="mt-2 flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-foreground/80 transition-colors hover:border-[#2348d4]/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
            >
              <MessageCircle className="size-3" aria-hidden="true" /> {t("asistente.recorrido.masDetalle")}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
