"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUp, AudioLines, FileText, Mic, Paperclip, RotateCcw, Square, X, Zap } from "lucide-react";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import type { Accion, EstadoServicios, MensajeChat } from "@/lib/asistente/tipos";
import { LIMITES } from "@/lib/asistente/tipos";
import { OrbeVoz, type FaseVoz } from "./OrbeVoz";
import { Tarjetas } from "./Tarjetas";
import { TextoRico } from "./TextoRico";

export type ModoVoz = "apagado" | "manos-libres" | "tiempo-real";

type Props = {
  alCerrar: () => void;
  mensajes: MensajeChat[];
  enCurso: boolean;
  estado: EstadoServicios | null;
  alEnviar: (t: string) => void;
  alDetener: () => void;
  alNueva: () => void;
  ejecutar: (a: Accion) => void;
  alEnlaceInterno: (href: string) => void;
  docs: { id: string; nombre: string; detalle: string }[];
  bytesDocs: number;
  alAdjuntar: (f: FileList | File[]) => void;
  alQuitarDoc: (id: string) => void;
  aviso: string | null;
  alCerrarAviso: () => void;
  sugerencias: string[];
  modoVoz: ModoVoz;
  faseVoz: FaseVoz;
  nivelVoz: () => number;
  alCambiarModoVoz: (m: ModoVoz) => void;
  alTocarOrbe: () => void;
};

const ETIQUETA_FASE = {
  inactivo: "asistente.pulsaHablar",
  conectando: "asistente.conectando",
  escuchando: "asistente.escuchando",
  transcribiendo: "asistente.transcribiendo",
  pensando: "asistente.pensando",
  hablando: "asistente.interrumpir",
} as const;

const ACEPTA = "application/pdf,image/jpeg,image/png,image/webp,image/gif,text/plain,text/markdown,text/csv,application/json,.md,.txt,.csv,.json";

export function PanelAsistente(p: Props) {
  const { t } = useTextosAsistente();
  const [texto, setTexto] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const entrada = useRef<HTMLTextAreaElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const tituloId = useId();
  const sinChat = p.estado !== null && !p.estado.chat;
  const vozOn = p.modoVoz !== "apagado";

  // Foco al abrir; al cerrar, devolverlo al botón flotante.
  useEffect(() => {
    entrada.current?.focus({ preventScroll: true });
    return () => {
      window.setTimeout(() => document.querySelector<HTMLButtonElement>('[aria-controls="asistente-panel"]')?.focus(), 0);
    };
  }, []);

  // Escape cierra.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") p.alCerrar();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [p]);

  // Siempre al final de la conversación.
  const ultimo = p.mensajes[p.mensajes.length - 1];
  useEffect(() => {
    const el = lista.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [p.mensajes.length, ultimo?.texto, ultimo?.tarjetas?.length]);

  // Altura automática del textarea.
  useEffect(() => {
    const el = entrada.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [texto]);

  const enviar = () => {
    if (!texto.trim() || p.enCurso) return;
    p.alEnviar(texto);
    setTexto("");
  };

  const boton =
    "grid size-9 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4] disabled:opacity-40";

  return (
    <section
      id="asistente-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby={tituloId}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setArrastrando(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setArrastrando(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setArrastrando(false);
        if (e.dataTransfer.files.length) p.alAdjuntar(e.dataTransfer.files);
      }}
      className="fixed inset-0 z-[70] flex h-[100dvh] flex-col overflow-hidden bg-[#020a18] text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 md:inset-auto md:bottom-6 md:right-6 md:h-[min(720px,calc(100dvh-3rem))] md:w-[420px] md:rounded-3xl md:border md:border-white/10 md:shadow-[0_30px_90px_-20px_rgba(35,72,212,0.55)]"
    >
      {/* Fondo de marca */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_100%_0%,rgba(35,72,212,0.28),transparent_60%),radial-gradient(80%_50%_at_0%_100%,rgba(20,38,100,0.5),transparent_70%)]" />

      {/* Encabezado */}
      <header className="relative flex items-center gap-3 border-b border-white/10 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:pt-3">
        <OrbeVoz fase={vozOn ? p.faseVoz : "inactivo"} nivel={p.nivelVoz} tamano={36} />
        <div className="min-w-0 flex-1">
          <h2 id={tituloId} className="font-heading text-base font-black uppercase leading-none tracking-tight">
            {t("asistente.nombre")}
          </h2>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-[#9eb0c0]">{t("asistente.subtitulo")}</p>
        </div>
        <button
          type="button"
          className={boton}
          onClick={() => p.alCambiarModoVoz(vozOn ? "apagado" : "manos-libres")}
          aria-pressed={vozOn}
          aria-label={vozOn ? t("asistente.salirVoz") : t("asistente.vozModo")}
          title={vozOn ? t("asistente.salirVoz") : t("asistente.vozModo")}
          disabled={sinChat && !p.estado?.voz.agente}
        >
          <AudioLines className={`size-4 ${vozOn ? "text-[#7fa0ff]" : ""}`} aria-hidden="true" />
        </button>
        {p.mensajes.length > 0 && (
          <button
            type="button"
            className={boton}
            onClick={() => {
              if (window.confirm(t("asistente.confirmarBorrar"))) p.alNueva();
            }}
            aria-label={t("asistente.nuevaConversacion")}
            title={t("asistente.nuevaConversacion")}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
        )}
        <button type="button" className={boton} onClick={p.alCerrar} aria-label={t("asistente.cerrar")} title={t("asistente.cerrar")}>
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      {/* Escenario de voz */}
      {vozOn && (
        <div className="relative flex flex-col items-center gap-2 border-b border-white/10 px-4 py-4">
          <button
            type="button"
            onClick={p.alTocarOrbe}
            disabled={p.modoVoz === "tiempo-real"}
            aria-label={t(ETIQUETA_FASE[p.faseVoz])}
            className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2348d4]/60 disabled:cursor-default"
          >
            <OrbeVoz fase={p.faseVoz} nivel={p.nivelVoz} tamano={148} />
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0]" aria-live="polite">
            {p.modoVoz === "tiempo-real" && p.faseVoz === "escuchando"
              ? t("asistente.escuchando")
              : p.modoVoz === "tiempo-real" && p.faseVoz === "hablando"
                ? t("asistente.hablando")
                : t(ETIQUETA_FASE[p.faseVoz])}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {p.estado?.voz.agente && (
              <button
                type="button"
                onClick={() => p.alCambiarModoVoz(p.modoVoz === "tiempo-real" ? "manos-libres" : "tiempo-real")}
                aria-pressed={p.modoVoz === "tiempo-real"}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  p.modoVoz === "tiempo-real" ? "border-[#2348d4] bg-[#2348d4]/25 text-white" : "border-white/15 text-foreground/70 hover:border-[#2348d4]/70"
                }`}
              >
                <Zap className="size-3" aria-hidden="true" /> {t("asistente.tiempoReal")}
              </button>
            )}
            <button
              type="button"
              onClick={() => p.alCambiarModoVoz("apagado")}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:border-red-400/60 hover:text-red-200"
            >
              <Square className="size-3" aria-hidden="true" /> {t("asistente.salirVoz")}
            </button>
          </div>
          {p.estado && !p.estado.voz.tts && p.modoVoz === "manos-libres" && (
            <p className="text-center text-[11px] text-foreground/45">{t("asistente.vozNavegador")}</p>
          )}
        </div>
      )}

      {/* Conversación */}
      <div
        ref={lista}
        role="log"
        aria-label={t("asistente.historial")}
        aria-busy={p.enCurso}
        className="relative flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
      >
        {sinChat && (
          <div className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-4 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-200">{t("asistente.sinClave.titulo")}</p>
            <p className="mt-2 text-foreground/75">{t("asistente.sinClave.cuerpo")}</p>
            <div className="mt-3">
              <Tarjetas tarjetas={[{ tipo: "contacto" }]} ejecutar={p.ejecutar} />
            </div>
          </div>
        )}

        {!sinChat && (
          <div className="flex gap-3">
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm leading-relaxed text-foreground/90">
              {t("asistente.bienvenida")}
            </div>
          </div>
        )}

        {p.mensajes.map((m, i) => {
          const esUltimo = i === p.mensajes.length - 1;
          if (m.rol === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#2348d4] px-3.5 py-2.5 text-sm leading-relaxed text-white">
                  <span className="sr-only">{t("asistente.tu")}: </span>
                  <span className="whitespace-pre-wrap break-words">{m.texto}</span>
                  {m.adjuntos?.length ? (
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      {m.adjuntos.map((a) => (
                        <span key={a.nombre} className="inline-flex items-center gap-1 rounded-md bg-white/15 px-1.5 py-0.5 text-[11px]">
                          <FileText className="size-3" aria-hidden="true" /> {a.nombre}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          }
          const escribiendo = esUltimo && p.enCurso && !m.texto;
          return (
            <div key={m.id} className="flex flex-col">
              {(m.texto || escribiendo) && (
                <div
                  className={`max-w-[92%] rounded-2xl rounded-tl-sm border px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.error ? "border-red-400/30 bg-red-400/[0.07] text-red-100" : "border-white/10 bg-white/[0.04] text-foreground/90"
                  }`}
                >
                  {escribiendo ? (
                    <span className="flex items-center gap-1 py-1" aria-label={t("asistente.pensando")}>
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className={`size-1.5 rounded-full bg-[#7fa0ff] motion-safe:animate-bounce ${d === 1 ? "[animation-delay:120ms]" : d === 2 ? "[animation-delay:240ms]" : ""}`}
                        />
                      ))}
                    </span>
                  ) : (
                    <TextoRico texto={m.texto} alEnlaceInterno={p.alEnlaceInterno} />
                  )}
                </div>
              )}
              {m.tarjetas?.length ? <Tarjetas tarjetas={m.tarjetas} ejecutar={p.ejecutar} /> : null}
            </div>
          );
        })}

        {!sinChat && p.mensajes.length === 0 && (
          <div>
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/40">{t("asistente.sugerencias")}</p>
            <div className="flex flex-wrap gap-2">
              {p.sugerencias.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => p.alEnviar(s)}
                  className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-left text-xs text-foreground/80 transition-colors hover:border-[#2348d4]/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {arrastrando && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-3 z-10 grid place-items-center rounded-2xl border-2 border-dashed border-[#2348d4] bg-[#020a18]/85 text-sm text-foreground/80">
          <Paperclip className="mb-2 size-6 text-[#7fa0ff]" />
        </div>
      )}

      {/* Compositor */}
      <div className="relative border-t border-white/10 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 md:pb-3">
        {p.aviso && (
          <div role="alert" className="mb-2 flex items-start gap-2 rounded-lg border border-amber-300/25 bg-amber-300/[0.07] px-3 py-2 text-xs text-amber-100">
            <span className="flex-1">{p.aviso}</span>
            <button type="button" onClick={p.alCerrarAviso} aria-label={t("asistente.cerrar")} className="text-amber-100/70 hover:text-amber-50">
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
        {p.docs.length > 0 && (
          <div className="mb-2">
            <ul className="flex flex-wrap gap-1.5">
              {p.docs.map((d) => (
                <li key={d.id} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] py-1 pl-2 pr-1 text-xs">
                  <FileText className="size-3.5 text-[#7fa0ff]" aria-hidden="true" />
                  <span className="max-w-[10rem] truncate">{d.nombre}</span>
                  <span className="text-foreground/40">{d.detalle}</span>
                  <button
                    type="button"
                    onClick={() => p.alQuitarDoc(d.id)}
                    aria-label={`${t("asistente.quitarAdjunto")} ${d.nombre}`}
                    className="grid size-5 place-items-center rounded text-foreground/50 hover:bg-white/10 hover:text-foreground"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[10px] text-foreground/40">
              {t("asistente.adjuntosNota")} · {Math.round((p.bytesDocs / LIMITES.documentosBytes) * 100)}%
            </p>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
          className="flex items-end gap-1.5 rounded-2xl border border-white/12 bg-white/[0.04] p-1.5 focus-within:border-[#2348d4]/70 focus-within:ring-2 focus-within:ring-[#2348d4]/30"
        >
          <input
            ref={archivo}
            type="file"
            accept={ACEPTA}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) p.alAdjuntar(e.target.files);
              e.target.value = "";
            }}
          />
          <button type="button" className={boton} onClick={() => archivo.current?.click()} aria-label={t("asistente.adjuntar")} title={t("asistente.adjuntar")} disabled={sinChat}>
            <Paperclip className="size-4" aria-hidden="true" />
          </button>
          <label htmlFor={`${tituloId}-entrada`} className="sr-only">
            {t("asistente.escribeOHabla")}
          </label>
          <textarea
            id={`${tituloId}-entrada`}
            ref={entrada}
            rows={1}
            value={texto}
            maxLength={LIMITES.mensajeCaracteres}
            disabled={sinChat}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                enviar();
              }
            }}
            onPaste={(e) => {
              const files = Array.from(e.clipboardData.files);
              if (files.length) {
                e.preventDefault();
                p.alAdjuntar(files);
              }
            }}
            placeholder={p.faseVoz === "escuchando" ? t("asistente.placeholderVoz") : t("asistente.placeholder")}
            className="max-h-[140px] min-h-9 flex-1 resize-none bg-transparent px-1.5 py-2 text-[16px] leading-5 text-foreground placeholder:text-foreground/35 focus:outline-none! md:text-sm"
          />
          {!texto.trim() && !p.enCurso ? (
            <button
              type="button"
              className={`${boton} ${vozOn ? "bg-[#2348d4]/25 text-white" : ""}`}
              onClick={() => p.alCambiarModoVoz(vozOn ? "apagado" : "manos-libres")}
              aria-pressed={vozOn}
              aria-label={vozOn ? t("asistente.salirVoz") : t("asistente.hablar")}
              title={vozOn ? t("asistente.salirVoz") : t("asistente.hablar")}
              disabled={sinChat && !p.estado?.voz.agente}
            >
              <Mic className="size-4" aria-hidden="true" />
            </button>
          ) : p.enCurso ? (
            <button type="button" onClick={p.alDetener} aria-label={t("asistente.detener")} title={t("asistente.detener")} className="grid size-9 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25">
              <Square className="size-3.5 fill-current" aria-hidden="true" />
            </button>
          ) : (
            <button type="submit" aria-label={t("asistente.enviar")} title={t("asistente.enviar")} className="grid size-9 place-items-center rounded-full bg-[#2348d4] text-white transition-colors hover:bg-[#2f57ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <ArrowUp className="size-4" aria-hidden="true" />
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
