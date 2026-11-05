"use client";

import Link from "next/link";
import { useState } from "react";
import { Languages } from "lucide-react";
import { moduloPorId, todosLosModulos } from "@/data/servicios";
import { useI18n } from "@/lib/i18n/context";
import { RevealOnScroll } from "@/components/integral/RevealOnScroll";
import { CtaLink, Eyebrow, rgba } from "@/components/servicios/ui";
import { COPY, NODO_POR_ID, NODOS, RECORRIDOS, tx, type Vista } from "./contenido";
import { DiagramaArquitectura, EstilosArquitectura } from "./DiagramaArquitectura";
import { EstadoChip } from "./PanelNodo";
import { SeccionInteroperabilidad, SeccionVoz } from "./SeccionesVozInterop";
import { useMenosMovimiento, useRecorrido } from "./recorrido";

const unicos = (capa: string) => new Set(NODOS.filter((n) => n.capa === capa).flatMap((n) => n.modulos)).size;
const N_GESTION = unicos("erp");
const N_OPERACION = unicos("operativa");
const N_VIVOS = todosLosModulos().filter((x) => x.modulo.estado === "vivo").length;

const titulo = "text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl";
const acento = "font-serif font-normal italic text-[#b9c8ff]";

export function ArquitecturaPagina() {
  const { locale: l, setLocale } = useI18n();
  const t = COPY[l];
  const [vista, setVista] = useState<Vista>("integral");
  const rec = useRecorrido();
  const menosMovimiento = useMenosMovimiento();

  const verEnDiagrama = (id: string) => {
    setVista("integral");
    rec.iniciar(id);
    document.getElementById("diagrama")?.scrollIntoView({ behavior: menosMovimiento ? "auto" : "smooth", block: "start" });
  };

  return (
    <main>
      <EstilosArquitectura />

      {/* ───────── Hero ───────── */}
      <section data-narracion="arquitectura/hero" aria-labelledby="arq-titulo" className="relative isolate overflow-hidden pb-20 pt-32 md:pb-28 md:pt-44">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(55%_70%_at_75%_30%,rgba(35,72,212,0.32),transparent_70%)]" />
          <div className="grid-bg absolute inset-0 opacity-25" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020a18] to-transparent" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Eyebrow>{t.eyebrow}</Eyebrow>
              <button
                type="button"
                onClick={() => setLocale(l === "es" ? "en" : "es")}
                aria-label={t.idiomaAria}
                lang={l === "es" ? "en" : "es"}
                className="inline-flex items-center gap-2 border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Languages className="size-3.5" aria-hidden="true" />
                {t.idioma}
              </button>
            </div>
            <h1 id="arq-titulo" className="mt-6 text-balance font-heading text-[2.5rem] font-black leading-[1.02] tracking-tight text-white md:mt-8 md:text-7xl">
              {t.titulo1} <span className={acento}>{t.titulo2}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-[#c5d2ee] md:mt-8 md:text-lg">{t.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3 md:mt-10">
              <CtaLink href="#diagrama" primary>
                {t.ctaDiagrama}
              </CtaLink>
              <CtaLink href="#sigue-un-dato">{t.ctaDato}</CtaLink>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 md:mt-12">
              {[
                { v: N_GESTION, k: t.stats.gestion },
                { v: N_OPERACION, k: t.stats.operacion },
                { v: N_VIVOS, k: t.stats.vivos },
                { v: 1, k: t.stats.fuente },
              ].map((s) => (
                <div key={s.k} className="flex flex-col-reverse">
                  <dt className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9eb0c0]">{s.k}</dt>
                  <dd className="font-heading text-3xl font-black tabular-nums text-white md:text-4xl">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Pila etiquetas={t.pila} />
        </div>
      </section>

      {/* ───────── Diagrama ───────── */}
      <section id="diagrama" data-narracion="arquitectura/diagrama" aria-labelledby="diagrama-titulo" className="relative scroll-mt-20 border-t border-white/10 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <Eyebrow>{t.diagramaEyebrow}</Eyebrow>
          <h2 id="diagrama-titulo" className={`mt-5 max-w-3xl ${titulo}`}>
            {t.diagramaTitulo} <span className={acento}>{t.diagramaTitulo2}</span>
          </h2>
          <div className="mt-10 md:mt-14">
            <DiagramaArquitectura l={l} t={t} vista={vista} setVista={setVista} rec={rec} />
          </div>
        </div>
      </section>

      {/* ───────── Sigue un dato ───────── */}
      <section id="sigue-un-dato" data-narracion="arquitectura/sigue-un-dato" aria-labelledby="dato-titulo" className="relative scroll-mt-20 border-t border-white/10 py-20 md:py-28">
        <div className="grid-bg absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-10">
          <RevealOnScroll>
            <Eyebrow>{t.datoEyebrow}</Eyebrow>
            <h2 id="dato-titulo" className={`mt-5 max-w-3xl ${titulo}`}>
              {t.datoTitulo} <span className={acento}>{t.datoTitulo2}</span>
            </h2>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#c5d2ee]">{t.datoLead}</p>
          </RevealOnScroll>
          <ul className="mt-12 grid gap-4 md:grid-cols-2">
            {RECORRIDOS.map((r, k) => {
              const pendiente = r.pasos.some((p) => {
                const m = p.modulo ? moduloPorId(p.modulo) : undefined;
                return m && (m.modulo.estado === "proximamente" || m.modulo.estado === "hoja-de-ruta");
              });
              return (
                <li key={r.id}>
                  <RevealOnScroll delay={(k % 2) * 90} className="h-full">
                    <article className="flex h-full flex-col border border-white/10 bg-[#020a18]/90 p-6 md:p-7" style={{ boxShadow: `inset 0 2px 0 ${r.color}` }}>
                      <h3 className="text-xl font-black text-white">{tx(r.titulo, l)}</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-[#c5d2ee]">{tx(r.resumen, l)}</p>
                      {pendiente && (
                        <p className="mt-3 inline-flex w-fit items-center gap-2 border border-[#6b8aff]/40 bg-[#6b8aff]/10 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/85">
                          <span className="inline-block size-1.5 rounded-full bg-[#6b8aff]" aria-hidden="true" />
                          {t.proximo}
                        </p>
                      )}
                      <ol className="mt-5 flex-1 space-y-3">
                        {r.pasos.map((p, i) => {
                          const n = NODO_POR_ID.get(p.nodo);
                          const m = p.modulo ? moduloPorId(p.modulo) : undefined;
                          return (
                            <li key={i} className="flex gap-3">
                              <span
                                className="mt-0.5 grid size-6 shrink-0 place-items-center border font-mono text-[10px] text-white"
                                style={{ borderColor: rgba(r.color, 0.5), background: rgba(r.color, 0.12) }}
                                aria-hidden="true"
                              >
                                {i + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-[13.5px] leading-snug text-white/90">{tx(p.texto, l)}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  {n && <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#9eb0c0]">{tx(n.titulo, l)}</span>}
                                  {m && <EstadoChip estado={m.modulo.estado} t={t} />}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                      <button
                        type="button"
                        onClick={() => verEnDiagrama(r.id)}
                        className="bevel-btn mt-6 inline-flex w-fit items-center gap-3 border border-white/25 bg-white/[0.04] px-5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-[#6b8aff] hover:bg-white/10"
                      >
                        <span style={{ color: r.color }} aria-hidden="true">
                          ▸
                        </span>
                        {t.verEnDiagrama}
                      </button>
                    </article>
                  </RevealOnScroll>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ───────── Interoperabilidad y voz ───────── */}
      <div data-narracion="arquitectura/interoperabilidad">
        <SeccionInteroperabilidad l={l} t={t} />
      </div>
      <div data-narracion="arquitectura/voz">
        <SeccionVoz l={l} t={t} />
      </div>

      {/* ───────── Por qué un ERP propio ───────── */}
      <section id="por-que-erp" data-narracion="arquitectura/por-que-erp" aria-labelledby="porque-titulo" className="relative isolate scroll-mt-20 overflow-hidden border-t border-white/10 py-20 md:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_15%_0%,rgba(35,72,212,0.25),transparent_70%)]" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <RevealOnScroll>
            <Eyebrow>{t.porQueEyebrow}</Eyebrow>
            <h2 id="porque-titulo" className={`mt-5 max-w-3xl ${titulo}`}>
              {t.porQueTitulo} <span className={acento}>{t.porQueTitulo2}</span>
            </h2>
          </RevealOnScroll>
          <ul className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {t.pilares.map((p, k) => (
              <li key={p.t} className="bg-[#020a18]/95">
                <RevealOnScroll delay={k * 80} className="h-full p-6 md:p-7">
                  <span className="font-serif text-4xl italic text-[#6b8aff]/80">0{k + 1}</span>
                  <h3 className="mt-4 text-lg font-black text-white">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#c5d2ee]">{p.d}</p>
                </RevealOnScroll>
              </li>
            ))}
          </ul>

          <h3 id="tabla-titulo" className="mt-20 font-heading text-2xl font-black text-white md:text-3xl">
            {t.tablaTitulo}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#9eb0c0]">{t.tablaNota}</p>
          <div className="mt-8 overflow-x-auto border border-white/10" role="region" aria-labelledby="tabla-titulo" tabIndex={0}>
            <table className="w-full min-w-[720px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="bg-white/[0.04]">
                  {t.tablaCols.map((c, k) => (
                    <th key={c} scope="col" className={`px-4 py-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] ${k === 2 ? "text-white" : "text-[#9eb0c0]"}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.tabla.map((f) => {
                  const m = moduloPorId(f.modulo);
                  return (
                    <tr key={f.necesidad} className="border-t border-white/10 align-top">
                      <th scope="row" className="px-4 py-4 font-bold text-white">
                        {f.necesidad}
                      </th>
                      <td className="px-4 py-4 text-white/50">{f.sueltas}</td>
                      <td className="bg-[#2348d4]/[0.07] px-4 py-4 text-[#d5e0ff]">
                        {m ? (
                          <Link href={`/servicios/${m.area.id}#${m.modulo.id}`} className="underline decoration-white/20 underline-offset-4 hover:decoration-white">
                            {f.ars}
                          </Link>
                        ) : (
                          f.ars
                        )}
                      </td>
                      <td className="px-4 py-4">{m && <EstadoChip estado={m.modulo.estado} t={t} />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ───────── Cierre ───────── */}
      <section id="cierre" data-narracion="arquitectura/cierre" aria-labelledby="cierre-titulo" className="relative isolate scroll-mt-16 overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="brand-gradient absolute inset-0 opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_90%_at_15%_10%,rgba(107,138,255,0.4),transparent_60%)]" />
          <div className="grid-bg absolute inset-0 opacity-25" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020a18] to-transparent" />
        </div>
        <RevealOnScroll className="mx-auto max-w-5xl px-4 text-center md:px-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/70">{t.cierreEyebrow}</div>
          <h2 id="cierre-titulo" className="mx-auto mt-6 max-w-4xl text-balance font-heading text-4xl font-black leading-[1.03] tracking-tight text-white md:text-6xl">
            {t.cierreTitulo}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">{t.cierreCuerpo}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <CtaLink href="/#contacto" primary>
              {t.cierreDemo}
            </CtaLink>
            <CtaLink href="/servicios">{t.cierreServicios}</CtaLink>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}

/** Pila holográfica de las cuatro capas (decorativa). */
function Pila({ etiquetas }: { etiquetas: readonly string[] }) {
  const colores = ["#cfd8e3", "#5fd8ff", "#a3e635", "#2348d4"];
  return (
    <div className="relative mx-auto hidden aspect-square w-full max-w-[460px] [perspective:1400px] md:block" aria-hidden="true">
      <div className="arq-flota absolute inset-0" style={{ animation: "arq-flota 7s ease-in-out infinite" }}>
        <div className="absolute inset-[12%] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-40deg)]">
          {etiquetas.map((e, k) => {
            const z = (etiquetas.length - 1 - k) * 62;
            const c = colores[k];
            const base = k === etiquetas.length - 1;
            return (
              <div
                key={e}
                className="absolute inset-0 border"
                style={{
                  transform: `translateZ(${z}px)`,
                  borderColor: rgba(c, base ? 0.9 : 0.55),
                  background: base
                    ? `linear-gradient(135deg, ${rgba(c, 0.55)}, ${rgba("#142664", 0.7)})`
                    : `linear-gradient(135deg, ${rgba(c, 0.16)}, ${rgba(c, 0.03)}), repeating-linear-gradient(0deg, ${rgba(c, 0.12)} 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, ${rgba(c, 0.12)} 0 1px, transparent 1px 28px)`,
                  boxShadow: `0 0 40px ${rgba(c, base ? 0.45 : 0.18)}`,
                }}
              >
                <span className="absolute bottom-3 left-3 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-white">
                  0{k + 1} · {e}
                </span>
                {[0.25, 0.5, 0.75].map((p) => (
                  <span key={p} className="absolute size-2 rounded-full" style={{ left: `${p * 100}%`, top: `${(1 - p) * 70 + 10}%`, background: c, boxShadow: `0 0 10px ${c}` }} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
