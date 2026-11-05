"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, AudioLines, Cable, Database, FileSpreadsheet, Mic } from "lucide-react";
import { moduloPorId } from "@/data/servicios";
import type { Locale } from "@/lib/i18n/dictionaries";
import { RevealOnScroll } from "@/components/integral/RevealOnScroll";
import { Eyebrow, rgba } from "@/components/servicios/ui";
import type { Copy } from "./contenido";
import { COPY_VOZ_INTEROP, type RutaId } from "./contenido-voz-interop";
import { EstadoChip } from "./PanelNodo";

const titulo = "text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl";
const acento = "font-serif font-normal italic text-[#b9c8ff]";

const VIOLETA = "#b78bff";
const TURQUESA = "#4fd1c5";
const COLOR_RUTA: Record<RutaId, string> = { api: "#35e0a1", backend: "#5fd8ff", carga: "#ffd166" };
const ICONO_RUTA = { api: Cable, backend: Database, carga: FileSpreadsheet } as const;
const ORDEN_RUTAS: RutaId[] = ["api", "backend", "carga"];

/** Abre la conversación de voz con Ars (mismo evento global que usa el resto del sitio). */
function hablarConArs() {
  window.dispatchEvent(new CustomEvent("ars:asistente", { detail: { voz: true } }));
}

/** Ondas decorativas para la sección de voz. */
function Onda({ color }: { color: string }) {
  const barras = [0.35, 0.6, 0.9, 0.55, 1, 0.7, 0.4, 0.8, 0.5, 0.95, 0.6, 0.3];
  return (
    <span className="flex h-8 items-end gap-[3px]" aria-hidden="true">
      {barras.map((h, k) => (
        <span
          key={k}
          className="w-[3px] rounded-full motion-safe:animate-[arq-onda_1.4s_ease-in-out_infinite]"
          style={{ height: `${h * 100}%`, background: color, animationDelay: `${k * 0.09}s`, opacity: 0.85 }}
        />
      ))}
    </span>
  );
}

export function SeccionVoz({ l, t }: { l: Locale; t: Copy }) {
  const c = COPY_VOZ_INTEROP[l];
  return (
    <section id="voz" aria-labelledby="voz-titulo" className="relative isolate scroll-mt-20 overflow-hidden border-t border-white/10 py-20 md:py-28">
      <style>{`@keyframes arq-onda{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}`}</style>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(55%_70%_at_85%_10%,rgba(183,139,255,0.18),transparent_70%)]" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        <RevealOnScroll>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Eyebrow tint={VIOLETA}>{c.vozEyebrow}</Eyebrow>
            <span className="inline-flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#9eb0c0]">
              <AudioLines className="size-3.5" style={{ color: VIOLETA }} aria-hidden="true" />
              {c.vozMotor}
            </span>
          </div>
          <h2 id="voz-titulo" className={`mt-5 max-w-3xl ${titulo}`}>
            {c.vozTitulo} <span className={acento}>{c.vozTitulo2}</span>
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#c5d2ee]">{c.vozLead}</p>
        </RevealOnScroll>

        {/* Flujo de una frase */}
        <RevealOnScroll delay={80}>
          <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.24em] text-[#9eb0c0]">{c.vozFlujoLabel}</p>
          <ol className="mt-4 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
            {c.vozFlujo.map((p, k) => (
              <li key={p.t} className="relative bg-[#020a18]/95 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl italic" style={{ color: rgba(VIOLETA, 0.85) }}>
                    0{k + 1}
                  </span>
                  {k === 0 && <Mic className="size-4 text-white/60" aria-hidden="true" />}
                  {k === c.vozFlujo.length - 1 && <Onda color={VIOLETA} />}
                </div>
                <h3 className="mt-3 text-base font-black text-white">{p.t}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#c5d2ee]">{p.d}</p>
              </li>
            ))}
          </ol>
        </RevealOnScroll>

        {/* Capacidades */}
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {c.vozCapacidades.map((cap, k) => {
            const m = cap.modulo ? moduloPorId(cap.modulo) : undefined;
            return (
              <li key={cap.id}>
                <RevealOnScroll delay={(k % 2) * 90} className="h-full">
                  <article className="flex h-full flex-col border border-white/10 bg-[#020a18]/90 p-6" style={{ boxShadow: `inset 0 2px 0 ${VIOLETA}` }}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-lg font-black text-white">{cap.t}</h3>
                      {m ? (
                        <EstadoChip estado={m.modulo.estado} t={t} />
                      ) : cap.enSitio ? (
                        <span className="inline-flex items-center gap-1.5 border border-[#b78bff]/45 bg-[#b78bff]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/85">
                          <span className="inline-block size-1.5 rounded-full bg-[#b78bff]" aria-hidden="true" />
                          {c.vozEnSitio}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[#c5d2ee]">{cap.d}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#9eb0c0]">{cap.detalle}</span>
                      {m && (
                        <Link
                          href={`/servicios/${m.area.id}#${m.modulo.id}`}
                          className="inline-flex items-center gap-1 text-[12.5px] text-[#d5e0ff] underline decoration-white/20 underline-offset-4 hover:decoration-white"
                        >
                          {m.modulo.nombre}
                          <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </article>
                </RevealOnScroll>
              </li>
            );
          })}
        </ul>

        <RevealOnScroll delay={60}>
          <div className="mt-10 flex flex-col gap-5 border border-[#b78bff]/30 bg-[#b78bff]/[0.06] p-6 md:flex-row md:items-center md:justify-between md:p-7">
            <div className="max-w-xl">
              <button
                type="button"
                onClick={hablarConArs}
                className="bevel-btn inline-flex items-center gap-3 border border-[#b78bff] bg-[#b78bff]/20 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#b78bff]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b78bff]"
              >
                <Mic className="size-4" aria-hidden="true" />
                {c.vozCta}
              </button>
              <p className="mt-3 text-[13px] text-[#c5d2ee]">{c.vozCtaAyuda}</p>
            </div>
            <p className="max-w-md text-[12.5px] leading-relaxed text-[#9eb0c0]">{c.vozNotaSeguridad}</p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

export function SeccionInteroperabilidad({ l, t }: { l: Locale; t: Copy }) {
  const c = COPY_VOZ_INTEROP[l];
  const [sistemaId, setSistemaId] = useState(c.intSistemas[0].id);
  const sistema = c.intSistemas.find((s) => s.id === sistemaId) ?? c.intSistemas[0];
  const agente = moduloPorId("agente-interoperador-de-datos");

  return (
    <section id="interoperabilidad" aria-labelledby="interop-titulo" className="relative isolate scroll-mt-20 overflow-hidden border-t border-white/10 py-20 md:py-28">
      <div className="grid-bg absolute inset-0 -z-10 opacity-20" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(55%_70%_at_10%_20%,rgba(79,209,197,0.14),transparent_70%)]" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        <RevealOnScroll>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Eyebrow tint={TURQUESA}>{c.intEyebrow}</Eyebrow>
            {agente && <EstadoChip estado={agente.modulo.estado} t={t} />}
          </div>
          <h2 id="interop-titulo" className={`mt-5 max-w-3xl ${titulo}`}>
            {c.intTitulo} <span className={acento}>{c.intTitulo2}</span>
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-[#c5d2ee]">{c.intLead}</p>
        </RevealOnScroll>

        {/* Tres rutas */}
        <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.24em] text-[#9eb0c0]">{c.intRutasLabel}</p>
        <ol className="mt-4 grid gap-4 lg:grid-cols-3">
          {ORDEN_RUTAS.map((id, k) => {
            const r = c.intRutas[id];
            const Icono = ICONO_RUTA[id];
            const color = COLOR_RUTA[id];
            return (
              <li key={id}>
                <RevealOnScroll delay={k * 90} className="h-full">
                  <article className="flex h-full flex-col border border-white/10 bg-[#020a18]/90 p-6" style={{ boxShadow: `inset 0 2px 0 ${color}` }}>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-4xl italic" style={{ color: rgba(color, 0.85) }}>
                        {r.n}
                      </span>
                      <span className="grid size-10 place-items-center border" style={{ borderColor: rgba(color, 0.45), background: rgba(color, 0.1) }}>
                        <Icono className="size-5" style={{ color }} aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-black text-white">{r.t}</h3>
                    <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[#c5d2ee]">{r.d}</p>
                    <p className="mt-4 border-t border-white/10 pt-4 text-[12.5px] leading-relaxed text-white/70">{r.tecnico}</p>
                    <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9eb0c0]">
                      {c.intFrecuencia}: <span className="text-white/85">{r.frecuencia}</span>
                    </p>
                  </article>
                </RevealOnScroll>
              </li>
            );
          })}
        </ol>

        {/* Selector de sistema */}
        <RevealOnScroll delay={60}>
          <div className="mt-14 border border-white/10 bg-[#020a18]/90 p-6 md:p-8">
            <h3 id="interop-sistemas" className="font-heading text-2xl font-black text-white md:text-3xl">
              {c.intSistemasTitulo}
            </h3>
            <p className="mt-2 text-[14px] text-[#c5d2ee]">{c.intSistemasAyuda}</p>
            <div role="radiogroup" aria-labelledby="interop-sistemas" className="mt-6 flex flex-wrap gap-2">
              {c.intSistemas.map((s) => {
                const activo = s.id === sistema.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => setSistemaId(s.id)}
                    className={`min-h-10 border px-3.5 py-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4fd1c5] ${
                      activo ? "border-[#4fd1c5] bg-[#4fd1c5]/15 text-white" : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {s.nombre}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid gap-5 border-t border-white/10 pt-6 md:grid-cols-[auto_1fr]" aria-live="polite">
              <div>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#9eb0c0]">{c.intRutaLabel}</p>
                <p
                  className="mt-2 inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white"
                  style={{ borderColor: rgba(COLOR_RUTA[sistema.ruta], 0.6), background: rgba(COLOR_RUTA[sistema.ruta], 0.12) }}
                >
                  <span className="inline-block size-1.5 rounded-full" style={{ background: COLOR_RUTA[sistema.ruta] }} aria-hidden="true" />
                  {c.intRutas[sistema.ruta].n} · {c.intRutas[sistema.ruta].t}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#9eb0c0]">{c.intViaLabel}</p>
                <p className="mt-2 text-[15px] font-bold text-white">{sistema.via}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[#c5d2ee]">{sistema.nota}</p>
              </div>
            </div>
            <p className="mt-5 text-[12px] text-[#9eb0c0]">{c.intNotaSistemas}</p>
          </div>
        </RevealOnScroll>

        {/* Protocolo de importación */}
        <RevealOnScroll>
          <h3 className="mt-16 font-heading text-2xl font-black text-white md:text-3xl">{c.intProtocoloTitulo}</h3>
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[#c5d2ee]">{c.intProtocoloLead}</p>
        </RevealOnScroll>
        <ol className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
          {c.intProtocolo.map((p, k) => (
            <li key={p.t} className="bg-[#020a18]/95">
              <RevealOnScroll delay={k * 70} className="h-full p-5">
                <span
                  className="grid size-7 place-items-center border font-mono text-[11px] text-white"
                  style={{ borderColor: rgba(COLOR_RUTA.carga, 0.5), background: rgba(COLOR_RUTA.carga, 0.12) }}
                  aria-hidden="true"
                >
                  {k + 1}
                </span>
                <h4 className="mt-3 text-[15px] font-black text-white">{p.t}</h4>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#c5d2ee]">{p.d}</p>
              </RevealOnScroll>
            </li>
          ))}
        </ol>

        {/* Qué fluye y modos */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <RevealOnScroll>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9eb0c0]">{c.intDatosTitulo}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {c.intDatos.map((d) => (
                <li key={d} className="border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[13px] text-white/85">
                  {d}
                </li>
              ))}
            </ul>
          </RevealOnScroll>
          <RevealOnScroll delay={90}>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9eb0c0]">{c.intModosTitulo}</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {c.intModos.map((m) => (
                <li key={m.t} className="border border-white/10 bg-[#020a18]/90 p-4" style={{ boxShadow: `inset 2px 0 0 ${TURQUESA}` }}>
                  <p className="text-[15px] font-black text-white">{m.t}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#c5d2ee]">{m.d}</p>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>

        {agente && (
          <div className="mt-10">
            <Link
              href={`/servicios/${agente.area.id}#${agente.modulo.id}`}
              className="bevel-btn inline-flex items-center gap-3 border border-white/25 bg-white/[0.04] px-5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-[#4fd1c5] hover:bg-white/10"
            >
              {c.intVerModulo}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
