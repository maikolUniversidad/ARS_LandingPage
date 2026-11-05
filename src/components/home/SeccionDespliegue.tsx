"use client";

/**
 * Home · «Despliegue y gobernanza de datos»: las cuatro formas de desplegar ARS (nube ARS en
 * Colombia, nube del cliente, on premise en la sede, híbrida), el plano de control único y los
 * conectores. Copy en `contenido-despliegue.ts` (fuente: área K del catálogo y
 * `arquitectura/contenido-voz-interop.ts`); nombres y estados de los módulos llegan del catálogo
 * resueltos en build (`modulos-despliegue.ts`), con el mismo código de color que el home.
 */

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { EstadoModulo } from "@/data/servicios/tipos";
import { useI18n } from "@/lib/i18n/context";
import type { HomeDict } from "@/lib/i18n/dictionaries";
import { RUTA_DIAGNOSTICO } from "@/lib/navegacion";
import { cn } from "@/lib/utils";
import { COPY_DESPLIEGUE, type ModuloDespliegueId, type ModoId } from "./contenido-despliegue";
import { MapaDespliegue } from "./despliegue/MapaDespliegue";
import type { ModulosDespliegue } from "./modulos-despliegue";

const TINTE = "#3fe0c5";
/** Mismo código de color de estados que el resto del home y /servicios. */
const COLOR_ESTADO: Record<EstadoModulo, string> = {
  vivo: "#35e0a1",
  piloto: "#ffb547",
  proximamente: "#6b8aff",
  "hoja-de-ruta": "#9eb0c0",
};
const ORDEN_ESTADO: EstadoModulo[] = ["vivo", "piloto", "proximamente", "hoja-de-ruta"];

function peorEstado(estados: EstadoModulo[]): EstadoModulo {
  return estados.reduce<EstadoModulo>((peor, e) => (ORDEN_ESTADO.indexOf(e) > ORDEN_ESTADO.indexOf(peor) ? e : peor), "vivo");
}

function hrefModulo(ref: { area: string; id: string }) {
  return `/servicios/${ref.area}#${ref.id}`;
}

function Chip({ estado, label }: { estado: EstadoModulo; label: string }) {
  const c = COLOR_ESTADO[estado];
  return (
    <span
      className="inline-block border px-1.5 py-0.5 font-mono text-[8.5px] font-semibold uppercase leading-none tracking-[0.18em]"
      style={{ borderColor: `${c}80`, color: c }}
    >
      {label}
    </span>
  );
}

function Enlace({ href, children, primario = false }: { href: string; children: ReactNode; primario?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "bevel-btn inline-flex max-w-full items-center gap-3 px-5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] transition-colors md:px-7 md:py-4 md:text-xs",
        primario
          ? "bg-white text-[#020a18] hover:bg-[#d5e0ff]"
          : "border border-white/25 bg-white/[0.04] text-white hover:border-[#3fe0c5] hover:bg-white/10"
      )}
    >
      <span className={primario ? "text-[#2348d4]" : "text-[#3fe0c5]"}>▸</span>
      <span className="min-w-0">{children}</span>
    </Link>
  );
}

function Subtitulo({ eyebrow, titulo, lead, id }: { eyebrow: string; titulo: string; lead: string; id: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] md:text-[11px]" style={{ color: TINTE }}>
        {eyebrow}
      </p>
      <h3 id={id} className="mt-3 max-w-3xl text-balance font-heading text-2xl font-black leading-tight text-white md:text-4xl">
        {titulo}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#c5d2ee] md:text-base">{lead}</p>
    </div>
  );
}

export function SeccionDespliegue({ h, modulos }: { h: HomeDict; modulos: ModulosDespliegue }) {
  const { locale } = useI18n();
  const t = COPY_DESPLIEGUE[locale];
  const estadoLabel = h.erpSection.status;
  const [activo, setActivo] = useState<ModoId>("ars");
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const base = useId();

  const estadoDe = (ids: ModuloDespliegueId[]) =>
    peorEstado(ids.flatMap((id) => (modulos[id] ? [modulos[id].estado] : [])));

  const modo = t.modos.find((m) => m.id === activo) ?? t.modos[0];
  const idx = t.modos.indexOf(modo);

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = t.modos.length;
    const destino =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (i + 1) % n
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (i - 1 + n) % n
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : -1;
    if (destino < 0) return;
    e.preventDefault();
    setActivo(t.modos[destino].id);
    tabs.current[destino]?.focus();
  }

  const estadoModo = estadoDe(modo.clave);

  return (
    <section
      id="despliegue"
      data-narracion="home/despliegue"
      aria-labelledby="despliegue-title"
      className="relative overflow-hidden border-t border-white/10 bg-[#020a18] py-20 md:py-28"
    >
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-24 size-[28rem] rounded-full opacity-15 blur-3xl"
        style={{ background: `radial-gradient(circle, ${TINTE}, transparent 70%)` }}
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-10">
        {/* Encabezado */}
        <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#9eb0c0] md:mb-5 md:text-[11px]">
          <span className="inline-block size-2" style={{ background: TINTE, boxShadow: `0 0 12px ${TINTE}` }} />
          {t.eyebrow}
        </div>
        <h2
          id="despliegue-title"
          className="max-w-4xl text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl"
        >
          {t.titulo}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#c5d2ee] md:text-lg">{t.lead}</p>

        {/* 1 · Selector de modos */}
        <div role="tablist" aria-label={t.selectorLabel} className="mt-10 grid grid-cols-2 gap-2 md:mt-14 lg:grid-cols-4">
          {t.modos.map((m, i) => {
            const sel = m.id === activo;
            const e = estadoDe(m.clave);
            return (
              <button
                key={m.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${base}-tab-${m.id}`}
                aria-selected={sel}
                aria-controls={`${base}-panel`}
                tabIndex={sel ? 0 : -1}
                onClick={() => setActivo(m.id)}
                onKeyDown={(ev) => onKey(ev, i)}
                className={cn(
                  "relative flex min-h-[4.5rem] flex-col items-start justify-between gap-2 border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3fe0c5] md:p-4",
                  sel ? "border-[#3fe0c5]/70 bg-[#3fe0c5]/10" : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
                )}
              >
                {sel && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px]" style={{ background: TINTE }} />}
                <span className="font-mono text-[9.5px] uppercase tracking-[0.24em]" style={{ color: sel ? TINTE : "#9eb0c0" }}>
                  0{i + 1}
                </span>
                <span className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <span className="text-sm font-black text-white md:text-base">{m.nombre}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden="true" className="inline-block size-1.5 rounded-full" style={{ background: COLOR_ESTADO[e] }} />
                    <span className="sr-only">{estadoLabel[e]}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`${base}-panel`}
          aria-labelledby={`${base}-tab-${modo.id}`}
          tabIndex={0}
          className="mt-3 grid overflow-hidden border border-white/10 bg-[#060f22]/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3fe0c5] grid-cols-1 lg:grid-cols-[1.1fr_1fr]"
        >
          <div role="group" aria-label={`${t.labels.mapa}: ${modo.nombre}`} className="relative min-w-0 border-b border-white/10 lg:border-b-0 lg:border-r">
            <MapaDespliegue modo={modo.id} className="h-full min-h-[15rem]" />
          </div>
          <div className="flex min-w-0 flex-col p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: TINTE }}>
                {`0${idx + 1} · ${modo.corto}`}
              </span>
              <Chip estado={estadoModo} label={estadoLabel[estadoModo]} />
            </div>
            <p className="mt-3 text-xl font-black leading-snug text-white md:text-2xl">{modo.frase}</p>
            <dl className="mt-5 grid gap-4">
              {(
                [
                  [t.labels.datos, modo.datos],
                  [t.labels.corre, modo.corre],
                  [t.labels.administra, modo.administra],
                ] as const
              ).map(([dt, dd]) => (
                <div key={dt} className="border-l-2 pl-3" style={{ borderColor: `${TINTE}55` }}>
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-[#9eb0c0]">{dt}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[#dbe4f6]">{dd}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-[#9eb0c0]">{t.labels.modulos}</p>
              <ul className="mt-2.5 grid gap-1.5">
                {modo.modulos.map((id) => {
                  const ref = modulos[id];
                  if (!ref) return null;
                  return (
                    <li key={id}>
                      <Link
                        href={hrefModulo(ref)}
                        title={ref.nota}
                        className="group flex items-start gap-2 text-[13px] leading-snug text-[#c5d2ee] transition-colors hover:text-white"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[5px] inline-block size-1.5 shrink-0 rounded-full"
                          style={{ background: COLOR_ESTADO[ref.estado] }}
                        />
                        <span>
                          {ref.nombre}
                          {ref.estado !== "vivo" && (
                            <span
                              className="ml-1.5 whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.16em]"
                              style={{ color: COLOR_ESTADO[ref.estado] }}
                            >
                              · {estadoLabel[ref.estado]}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* 2 · Plano de control */}
        <div className="mt-16 md:mt-24">
          <Subtitulo id="despliegue-control" eyebrow={t.controlEyebrow} titulo={t.controlTitulo} lead={t.controlLead} />
          <ul aria-labelledby="despliegue-control" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.control.map((c) => {
              const ref = modulos[c.modulo];
              const estado = ref?.estado ?? "vivo";
              return (
                <li key={c.t}>
                  <Link
                    href={ref ? hrefModulo(ref) : "/servicios/infraestructura"}
                    className="group relative flex h-full flex-col border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/25 hover:bg-white/[0.05] md:p-5"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white">{c.t}</span>
                      <span
                        aria-hidden="true"
                        className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full"
                        style={{ background: COLOR_ESTADO[estado] }}
                      />
                    </span>
                    <span className="mt-2 flex-1 text-sm leading-relaxed text-[#c5d2ee]">{c.d}</span>
                    <span
                      className="mt-3 font-mono text-[8.5px] uppercase tracking-[0.16em]"
                      style={{ color: COLOR_ESTADO[estado] }}
                    >
                      {estadoLabel[estado]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 max-w-3xl font-mono text-[10.5px] leading-relaxed tracking-[0.04em] text-[#8ea0b8] md:text-[11px]">
            {t.controlNota}
          </p>
        </div>

        {/* 3 · Conectores */}
        <div className="mt-16 md:mt-24">
          <Subtitulo id="despliegue-conectores" eyebrow={t.conectoresEyebrow} titulo={t.conectoresTitulo} lead={t.conectoresLead} />
          <ul aria-labelledby="despliegue-conectores" className="mt-8 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {t.conectores.map((c) => {
              const ref = modulos[c.modulo];
              const estado = ref?.estado ?? "vivo";
              return (
                <li key={c.t} className="flex flex-col bg-[#020a18] p-4 md:p-5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{c.t}</span>
                    {estado !== "vivo" && <Chip estado={estado} label={estadoLabel[estado]} />}
                  </span>
                  <span className="mt-2.5 flex flex-wrap gap-1.5">
                    {c.items.map((it) => (
                      <span
                        key={it}
                        className="border border-white/12 bg-white/[0.03] px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/85"
                      >
                        {it}
                      </span>
                    ))}
                  </span>
                  {c.nota && <span className="mt-2.5 text-[12.5px] leading-snug text-[#9eb0c0]">{c.nota}</span>}
                  {ref && (
                    <Link
                      href={hrefModulo(ref)}
                      className="mt-auto inline-flex items-start gap-2 pt-3 text-[12px] leading-snug text-[#c5d2ee] transition-colors hover:text-white"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[4px] inline-block size-1.5 shrink-0 rounded-full"
                        style={{ background: COLOR_ESTADO[estado] }}
                      />
                      {ref.nombre}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-5 max-w-3xl font-mono text-[10.5px] leading-relaxed tracking-[0.04em] text-[#8ea0b8] md:text-[11px]">
            {t.conectoresNota}
          </p>
        </div>

        {/* 4 · CTA */}
        <div className="mt-10 flex flex-wrap justify-end gap-3 md:mt-12">
          <Enlace href={RUTA_DIAGNOSTICO} primario>
            {h.ctas.diagnostic}
          </Enlace>
          <Enlace href="/servicios/infraestructura">{t.ctaInfra}</Enlace>
          <Enlace href="/arquitectura#interoperabilidad">{t.conectoresCta}</Enlace>
        </div>
      </div>
    </section>
  );
}
