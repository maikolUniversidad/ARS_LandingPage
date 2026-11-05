"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { ArrowRight, Check, Mic, Sparkles, X } from "lucide-react";
import type { AceptacionAutorizacion } from "@/data/diagnostico/autorizacion";
import type { AdjuntoTurno, CampoPerfil, ContactoDiagnostico, Diagnostico, PerfilEmpresa, RegistroGuardado, TurnoEntrevista } from "@/data/diagnostico/tipos";
import { cn } from "@/lib/utils";
import { Analizando } from "./Analizando";
import { Compositor } from "./Compositor";
import { ModoConversacion } from "./ModoConversacion";
import { PasoDatos } from "./PasoDatos";
import { INFO_CAMPO, porcentaje } from "./perfil";
import { BarraPerfil, PerfilVivo } from "./PerfilVivo";
import { CapaSoltar, TarjetaAdjunto, TarjetaPedido } from "./TarjetaAdjunto";
import { TarjetasServicio } from "./TarjetasServicio";
import { useEntrevista } from "./useEntrevista";
import { useVozEntrevista } from "./useVozEntrevista";

type Analisis = { perfil: Partial<PerfilEmpresa>; conversacion: TurnoEntrevista[]; adjuntos: AdjuntoTurno[]; autorizacion?: AceptacionAutorizacion };

/** Entrevista multimodal con IA (texto, voz, fotos, video y documentos) que arma el perfil y lanza el diagnóstico. */
export function Entrevista({ onDiagnostico }: { onDiagnostico: (d: Diagnostico, registro?: RegistroGuardado) => void }) {
  const e = useEntrevista();
  const voz = useVozEntrevista({ enviar: e.enviar, escuchar: e.escuchar, ocupado: e.ocupado });
  const [entrada, setEntrada] = useState("");
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  /** Paso de datos y autorización (Ley 1581) entre «Analizar» y el análisis. */
  const [pidiendoDatos, setPidiendoDatos] = useState(false);
  const [hoja, setHoja] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const profundidad = useRef(0);
  const dictado = useRef(false);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [e.mensajes, e.chips, e.adjuntos]);

  // Al terminar un turno, el foco vuelve al campo (salvo en modo conversación).
  useEffect(() => {
    if (!e.ocupado && voz.fase === "apagado") requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  }, [e.ocupado, voz.fase]);

  const enviarTexto = useCallback(
    (texto: string) => {
      const porVoz = dictado.current;
      dictado.current = false;
      setEntrada("");
      setSeleccion([]);
      void e.enviar(texto, { fuente: porVoz ? "voz" : "chat" });
    },
    [e],
  );

  const analizar = useCallback(() => {
    e.cancelar();
    voz.colgar();
    setPidiendoDatos(true);
  }, [e, voz]);

  /** Sin autorización, el contacto no viaja: el servidor guarda el registro con `contacto: null`. */
  const conDatos = useCallback(
    (contacto: ContactoDiagnostico | undefined, autorizacion: AceptacionAutorizacion | undefined) => {
      const { contacto: _previo, ...resto } = e.perfilActual();
      void _previo;
      const perfil: Partial<PerfilEmpresa> = autorizacion && contacto ? { ...resto, contacto } : resto;
      setPidiendoDatos(false);
      setAnalisis({ perfil, conversacion: e.conversacion(), adjuntos: e.adjuntosTurno(), autorizacion });
    },
    [e],
  );

  const alElegirChip = (c: string) => {
    if (e.listo && /diagn[oó]stico/i.test(c)) return analizar();
    if (!e.chips.multiple) return enviarTexto(c);
    setSeleccion((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  };

  const alEnviar = () => {
    const texto = [...seleccion, entrada.trim()].filter(Boolean).join(", ");
    if (texto && !e.ocupado) enviarTexto(texto);
  };

  const preguntarPor = (c: CampoPerfil) => {
    setHoja(false);
    enviarTexto(`Pregúntame por ${INFO_CAMPO[c].pregunta}.`);
  };

  /* Arrastrar y soltar sobre toda la conversación */
  const conArchivos = (ev: DragEvent) => Array.from(ev.dataTransfer.types).includes("Files");
  const drag = {
    onDragEnter: (ev: DragEvent) => {
      if (!conArchivos(ev)) return;
      ev.preventDefault();
      profundidad.current++;
      setArrastrando(true);
    },
    onDragOver: (ev: DragEvent) => {
      if (conArchivos(ev)) ev.preventDefault();
    },
    onDragLeave: () => {
      profundidad.current = Math.max(0, profundidad.current - 1);
      if (!profundidad.current) setArrastrando(false);
    },
    onDrop: (ev: DragEvent) => {
      ev.preventDefault();
      profundidad.current = 0;
      setArrastrando(false);
      if (ev.dataTransfer.files.length) e.agregarArchivos(ev.dataTransfer.files);
    },
  };

  if (pidiendoDatos) {
    return <PasoDatos empresa={e.perfil.nombre} inicial={e.perfil.contacto} onContinuar={conDatos} onVolver={() => setPidiendoDatos(false)} />;
  }

  if (analisis) {
    return (
      <Analizando
        perfil={analisis.perfil}
        conversacion={analisis.conversacion}
        adjuntos={analisis.adjuntos}
        autorizacion={analisis.autorizacion}
        areasVistas={e.areasVistas}
        onListo={onDiagnostico}
        onVolver={() => setAnalisis(null)}
      />
    );
  }

  const pct = porcentaje(e.perfil);
  const puedeAnalizar = e.listo || (Boolean(e.perfil.nombre || e.perfil.sector) && pct >= 55);
  const turnosUsuario = e.mensajes.filter((m) => m.rol === "user" && !m.adjuntoId && !m.oculto).length;
  const pregunta = e.progreso ? `Pregunta ${e.progreso.pregunta} de ~${e.progreso.total}` : `Pregunta ${Math.min(turnosUsuario + 1, 8)} de ~8`;
  const enConversacion = voz.fase !== "apagado";
  const panel = (
    <PerfilVivo
      perfil={e.perfil}
      origenes={e.origenes}
      progreso={e.progreso}
      datos={e.datos}
      areasVistas={e.areasVistas}
      turnos={turnosUsuario}
      ocupado={e.ocupado}
      onEditar={e.editarCampo}
      onPreguntar={preguntarPor}
    />
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-10 md:px-6 lg:grid-cols-[minmax(0,1fr)_350px]">
      {/* ── Conversación ── */}
      <section
        {...drag}
        className="relative flex h-[calc(100svh-12.5rem)] min-h-[460px] scroll-mt-16 flex-col overflow-hidden border border-white/10 bg-[#050f24]/80 backdrop-blur lg:h-[calc(100vh-11rem)] lg:min-h-[600px]"
        aria-label="Entrevista"
      >
        <header className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
          <span className="relative grid size-9 place-items-center bg-gradient-to-br from-[#2348d4] to-[#142664]">
            <Sparkles className={cn("size-4 text-white", e.ocupado && "animate-pulse motion-reduce:animate-none")} aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#050f24] bg-[#35e0a1]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">Ars · consultora de diagnóstico</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9eb0c0]" aria-live="polite">
              {e.ocupado ? "escribiendo…" : pregunta}
            </p>
          </div>
          {voz.soporte.microfono && !enConversacion && (
            <button
              type="button"
              onClick={voz.conversar}
              className="ml-auto hidden items-center gap-1.5 border border-[#6b8aff]/40 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#d5e0ff] transition-colors hover:bg-[#2348d4]/25 sm:inline-flex"
            >
              <Mic className="size-3.5" aria-hidden="true" /> Hablar con Ars
            </button>
          )}
        </header>
        <BarraPerfil pct={pct} pregunta={pregunta} onAbrir={() => setHoja(true)} />

        <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
          {e.mensajes.map((m) => {
            if (m.oculto) return null;
            if (m.adjuntoId) {
              const a = e.adjuntos.find((x) => x.id === m.adjuntoId);
              return a ? (
                <div key={m.id} className="flex justify-end">
                  <TarjetaAdjunto a={a} onQuitar={() => e.quitarAdjunto(a.id)} />
                </div>
              ) : null;
            }
            return (
              <div
                key={m.id}
                className={cn("flex animate-in fade-in slide-in-from-bottom-3 duration-500 motion-reduce:animate-none", m.rol === "user" ? "justify-end" : "justify-start")}
              >
                <div className={cn("max-w-[88%]", m.rol === "user" && "max-w-[80%]")}>
                  {m.rol === "assistant" ? (
                    <div className={cn("border-l-2 pl-3 text-[15px] leading-relaxed text-white/90", m.error ? "border-[#ff6b6b]" : "border-[#2348d4]")}>
                      {m.texto || (
                        <span className="inline-flex items-center gap-1 py-2" aria-label="Ars está escribiendo">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="size-1.5 animate-bounce rounded-full bg-[#6b8aff] motion-reduce:animate-none" style={{ animationDelay: `${i * 150}ms` }} />
                          ))}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="bg-gradient-to-br from-[#1d3885] to-[#142664] px-3.5 py-2 text-[14.5px] leading-relaxed text-white">
                      {m.porVoz && <Mic className="mr-1.5 inline size-3 -translate-y-px text-[#9eb0c0]" aria-label="por voz" />}
                      {m.texto}
                    </p>
                  )}
                  {m.rol === "assistant" && <TarjetasServicio areas={m.areas} modulos={m.modulos} />}
                  {m.pedido && <TarjetaPedido pedido={m.pedido} onArchivos={e.agregarArchivos} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Respuestas rápidas + entrada ── */}
        <div className="border-t border-white/[0.07] p-3">
          {voz.aviso && (
            <p className="mb-2 flex items-center gap-2 border border-[#ffd166]/30 bg-[#ffd166]/[0.06] px-3 py-1.5 text-[12px] text-[#ffe3a3] animate-in fade-in">
              {voz.aviso}
              <button type="button" onClick={voz.cerrarAviso} className="ml-auto text-white/50 hover:text-white" aria-label="Cerrar aviso">
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </p>
          )}
          {puedeAnalizar && !e.ocupado && (
            <button
              type="button"
              onClick={analizar}
              className="bevel-btn mb-3 flex w-full items-center justify-center gap-2 bg-white px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#020a18] transition-colors animate-in fade-in zoom-in-95 hover:bg-[#d5e0ff]"
            >
              Analizar mi empresa <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
          {e.chips.opciones.length > 0 && !e.ocupado && (
            <div className="mb-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Respuestas rápidas">
              {e.chips.opciones.map((c, i) => {
                const on = seleccion.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => alElegirChip(c)}
                    aria-pressed={e.chips.multiple ? on : undefined}
                    className={cn(
                      "inline-flex items-center gap-1.5 border px-3 py-1.5 text-[12.5px] transition-all animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300 hover:-translate-y-px motion-reduce:hover:translate-y-0",
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
          <Compositor
            entrada={entrada}
            setEntrada={setEntrada}
            onEnviar={alEnviar}
            onArchivos={e.agregarArchivos}
            ocupado={e.ocupado}
            seleccionadas={seleccion.length}
            dictando={voz.dictando}
            onDictar={() => {
              dictado.current = true;
              void voz.dictar(entrada, setEntrada);
            }}
            onConversar={voz.conversar}
            vozDisponible={voz.soporte.microfono}
            inputRef={input}
          />
          <p className="mt-1.5 hidden text-[10.5px] text-white/35 sm:block">Puedes arrastrar o pegar fotos, videos y documentos aquí. Ars los mira y llena tu perfil.</p>
        </div>

        {arrastrando && <CapaSoltar />}
        {enConversacion && (
          <ModoConversacion fase={voz.fase} nivel={voz.nivel} parcial={voz.parcial} subtitulo={voz.subtitulo} onOrbe={voz.tocarOrbe} onColgar={voz.colgar} />
        )}
      </section>

      {/* ── Perfil en construcción (escritorio) ── */}
      <div className="hidden lg:block lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto lg:pr-1">{panel}</div>

      {/* ── Hoja plegable (móvil) ── */}
      {hoja && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Perfil en construcción">
          <button type="button" className="absolute inset-0 bg-black/60 animate-in fade-in" onClick={() => setHoja(false)} aria-label="Cerrar perfil" />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto border-t border-[#6b8aff]/30 bg-[#030c1f] px-3 pb-6 pt-2 animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 z-10 -mx-3 mb-2 flex items-center justify-center bg-[#030c1f] px-3 pb-2 pt-1">
              <span className="h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
              <button type="button" onClick={() => setHoja(false)} className="absolute right-3 top-0 p-1.5 text-white/60 hover:text-white" aria-label="Cerrar">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}
    </div>
  );
}
