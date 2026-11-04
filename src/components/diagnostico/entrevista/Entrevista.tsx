"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, SendHorizontal, Sparkles } from "lucide-react";
import type { AreaId, Diagnostico, PerfilEmpresa, TurnoEntrevista } from "@/data/diagnostico/tipos";
import { cn } from "@/lib/utils";
import { completitud, fusionarPerfil } from "@/lib/diagnostico/catalogo";
import { Analizando } from "./Analizando";
import { turnoEntrevista } from "./cliente";
import { CHIPS_INICIALES, SALUDO, type DatoEmpresa } from "./eventos";
import { PerfilVivo } from "./PerfilVivo";
import { TarjetasServicio } from "./TarjetasServicio";

type Mensaje = { id: string; rol: "user" | "assistant"; texto: string; areas: AreaId[]; modulos: string[]; error?: boolean };
type Chips = { opciones: string[]; multiple: boolean };


const nuevo = (rol: Mensaje["rol"], texto = ""): Mensaje => ({ id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, rol, texto, areas: [], modulos: [] });

/** Entrevista conversacional con IA que arma el perfil y lanza el diagnóstico. */
export function Entrevista({ onDiagnostico }: { onDiagnostico: (d: Diagnostico) => void }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => [nuevo("assistant", SALUDO)]);
  const [perfil, setPerfil] = useState<Partial<PerfilEmpresa>>({});
  const [chips, setChips] = useState<Chips>({ opciones: CHIPS_INICIALES, multiple: false });
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [datos, setDatos] = useState<DatoEmpresa[]>([]);
  const [areasVistas, setAreasVistas] = useState<AreaId[]>([]);
  const [entrada, setEntrada] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [listo, setListo] = useState(false);
  const [analisis, setAnalisis] = useState<{ perfil: Partial<PerfilEmpresa>; conversacion: TurnoEntrevista[] } | null>(null);
  const [verPerfil, setVerPerfil] = useState(false);

  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [mensajes, chips]);

  const conversacionDe = (lista: Mensaje[]): TurnoEntrevista[] =>
    lista.filter((m) => m.texto.trim() && !m.error).map((m) => ({ rol: m.rol, texto: m.texto }));

  const enviar = useCallback(
    async (texto: string) => {
      const limpio = texto.trim();
      if (!limpio || ocupado) return;
      const usuario = nuevo("user", limpio);
      const respuesta = nuevo("assistant");
      const historial = [...mensajes, usuario];
      setMensajes([...historial, respuesta]);
      setEntrada("");
      setChips({ opciones: [], multiple: false });
      setSeleccion([]);
      setOcupado(true);

      const editar = (f: (m: Mensaje) => Mensaje) => setMensajes((ms) => ms.map((m) => (m.id === respuesta.id ? f(m) : m)));
      const ctrl = new AbortController();
      abort.current = ctrl;
      try {
        await turnoEntrevista(
          { conversacion: conversacionDe(historial), perfil },
          (e) => {
            switch (e.t) {
              case "texto":
                editar((m) => ({ ...m, texto: m.texto + e.d }));
                break;
              case "perfil":
                setPerfil((p) => fusionarPerfil(p, e.cambios));
                break;
              case "mostrar":
                editar((m) => ({ ...m, areas: e.areas, modulos: e.modulos }));
                setAreasVistas((v) => [...new Set([...v, ...e.areas])]);
                break;
              case "chips":
                setChips({ opciones: e.opciones, multiple: e.multiple });
                break;
              case "dato":
                setDatos((d) => [...d, e.dato].slice(-6));
                break;
              case "listo":
                setListo(true);
                break;
              case "error":
                editar((m) => ({ ...m, texto: m.texto || e.mensaje, error: !m.texto }));
                break;
            }
          },
          ctrl.signal,
        );
      } catch {
        if (!ctrl.signal.aborted) editar((m) => ({ ...m, texto: m.texto || "Se cortó la conexión. ¿Lo intentamos otra vez?", error: !m.texto }));
      } finally {
        setOcupado(false);
        requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
      }
    },
    [mensajes, ocupado, perfil],
  );

  const analizar = useCallback(() => {
    abort.current?.abort();
    setAnalisis({ perfil, conversacion: conversacionDe(mensajes) });
  }, [mensajes, perfil]);

  const alElegirChip = (c: string) => {
    if (listo && /diagn[oó]stico/i.test(c)) return analizar();
    if (!chips.multiple) return void enviar(c);
    setSeleccion((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  };

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    const extra = entrada.trim();
    void enviar([...seleccion, extra].filter(Boolean).join(", "));
  };

  if (analisis) {
    return (
      <Analizando
        perfil={analisis.perfil}
        conversacion={analisis.conversacion}
        areasVistas={areasVistas}
        onListo={onDiagnostico}
        onVolver={() => setAnalisis(null)}
      />
    );
  }

  const pct = Math.round(completitud(perfil) * 100);
  const puedeAnalizar = listo || (Boolean(perfil.nombre || perfil.sector) && pct >= 70);
  const turnosUsuario = mensajes.filter((m) => m.rol === "user").length;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-10 md:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* ── Conversación ── */}
      <section className="flex min-h-[70vh] flex-col border border-white/10 bg-[#050f24]/80 backdrop-blur lg:h-[calc(100vh-11rem)] lg:min-h-[560px]" aria-label="Entrevista">
        <header className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
          <span className="relative grid size-9 place-items-center bg-gradient-to-br from-[#2348d4] to-[#142664]">
            <Sparkles className="size-4 text-white" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#050f24] bg-[#35e0a1]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">Ars · consultora de diagnóstico</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9eb0c0]">{ocupado ? "escribiendo…" : `Pregunta ${Math.min(turnosUsuario + 1, 7)} de ~7`}</p>
          </div>
          <button
            type="button"
            onClick={() => setVerPerfil((v) => !v)}
            className="ml-auto border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 lg:hidden"
            aria-expanded={verPerfil}
          >
            Perfil {pct}%
          </button>
        </header>

        {verPerfil && (
          <div className="max-h-[50vh] overflow-y-auto border-b border-white/[0.07] p-3 lg:hidden">
            <PerfilVivo perfil={perfil} datos={datos} areasVistas={areasVistas} />
          </div>
        )}

        <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
          {mensajes.map((m) => (
            <div key={m.id} className={cn("flex animate-in fade-in slide-in-from-bottom-2 duration-300", m.rol === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[88%]", m.rol === "user" && "max-w-[80%]")}>
                {m.rol === "assistant" ? (
                  <div className={cn("border-l-2 pl-3 text-[15px] leading-relaxed text-white/90", m.error ? "border-[#ff6b6b]" : "border-[#2348d4]")}>
                    {m.texto || (
                      <span className="inline-flex gap-1 py-2" aria-label="escribiendo">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="size-1.5 animate-bounce rounded-full bg-[#6b8aff]" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="bg-gradient-to-br from-[#1d3885] to-[#142664] px-3.5 py-2 text-[14.5px] leading-relaxed text-white">{m.texto}</p>
                )}
                {m.rol === "assistant" && <TarjetasServicio areas={m.areas} modulos={m.modulos} />}
              </div>
            </div>
          ))}
        </div>

        {/* ── Respuestas rápidas + entrada ── */}
        <div className="border-t border-white/[0.07] p-3">
          {puedeAnalizar && !ocupado && (
            <button
              type="button"
              onClick={analizar}
              className="bevel-btn mb-3 flex w-full items-center justify-center gap-2 bg-white px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#020a18] transition-colors animate-in fade-in zoom-in-95 hover:bg-[#d5e0ff]"
            >
              Analizar mi empresa <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
          {chips.opciones.length > 0 && !ocupado && (
            <div className="mb-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Respuestas rápidas">
              {chips.opciones.map((c, i) => {
                const on = seleccion.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => alElegirChip(c)}
                    aria-pressed={chips.multiple ? on : undefined}
                    className={cn(
                      "inline-flex items-center gap-1.5 border px-3 py-1.5 text-[12.5px] transition-colors animate-in fade-in slide-in-from-bottom-1 fill-mode-both",
                      on ? "border-[#6b8aff] bg-[#2348d4]/30 text-white" : "border-white/15 bg-white/[0.03] text-white/85 hover:border-[#6b8aff]/60 hover:text-white",
                    )}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {on && <Check className="size-3" aria-hidden="true" />}
                    {c}
                  </button>
                );
              })}
            </div>
          )}
          <form onSubmit={alEnviar} className="flex items-end gap-2">
            <label htmlFor="diag-entrada" className="sr-only">
              Tu respuesta
            </label>
            <textarea
              id="diag-entrada"
              ref={input}
              rows={1}
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={chips.multiple && seleccion.length ? `${seleccion.length} elegidas · agrega algo más o envía` : "Escribe tu respuesta…"}
              maxLength={1200}
              disabled={ocupado}
              className="max-h-32 min-h-[44px] flex-1 resize-none border border-white/15 bg-[#020a18] px-3 py-2.5 text-[14.5px] text-white outline-none placeholder:text-white/35 focus:border-[#6b8aff] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={ocupado || (!entrada.trim() && !seleccion.length)}
              className="grid size-11 shrink-0 place-items-center bg-[#2348d4] text-white transition-colors hover:bg-[#3358e4] disabled:opacity-40"
              aria-label="Enviar"
            >
              <SendHorizontal className="size-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      {/* ── Perfil en construcción ── */}
      <div className="hidden lg:block lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto">
        <PerfilVivo perfil={perfil} datos={datos} areasVistas={areasVistas} />
      </div>
    </div>
  );
}
