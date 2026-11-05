"use client";

import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward, X } from "lucide-react";
import { moduloPorId } from "@/data/servicios";
import type { Locale } from "@/lib/i18n/dictionaries";
import { rgba } from "@/components/servicios/ui";
import { cn } from "@/lib/utils";
import {
  ARISTAS,
  CAPAS,
  COLOR_ESTADO,
  FILAS,
  NODO_POR_ID,
  RECORRIDOS,
  VISTAS,
  tx,
  type CapaId,
  type Copy,
  type Nodo,
  type Vista,
} from "./contenido";
import { PanelNodo } from "./PanelNodo";
import { useMenosMovimiento, type EstadoRecorrido } from "./recorrido";

type Caja = { x: number; y: number; w: number; h: number };

/** Curva entre dos cajas: vertical si están en filas distintas, horizontal si comparten fila. */
function camino(a: Caja, b: Caja, lateral: boolean): string {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const solapanY = a.y < b.y + b.h && b.y < a.y + a.h;
  const horizontal = solapanY || (lateral && Math.abs(bc.x - ac.x) > Math.abs(bc.y - ac.y));
  if (horizontal) {
    const der = bc.x > ac.x;
    const p1 = { x: der ? a.x + a.w : a.x, y: ac.y };
    const p2 = { x: der ? b.x : b.x + b.w, y: bc.y };
    const mx = (p1.x + p2.x) / 2;
    return `M${p1.x},${p1.y} C${mx},${p1.y} ${mx},${p2.y} ${p2.x},${p2.y}`;
  }
  const abajo = bc.y > ac.y;
  const p1 = { x: ac.x, y: abajo ? a.y + a.h : a.y };
  const p2 = { x: bc.x, y: abajo ? b.y : b.y + b.h };
  const my = (p1.y + p2.y) / 2;
  return `M${p1.x},${p1.y} C${p1.x},${my} ${p2.x},${my} ${p2.x},${p2.y}`;
}

const ESTILOS = `
@keyframes arq-flujo { to { stroke-dashoffset: -16; } }
@keyframes arq-traza { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes arq-pulso { 0%,100% { box-shadow: 0 0 0 0 var(--arq-c), 0 0 28px var(--arq-g); } 50% { box-shadow: 0 0 0 6px transparent, 0 0 44px var(--arq-g); } }
@keyframes arq-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes arq-sube { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
@keyframes arq-flota { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.arq-flujo { animation: arq-flujo 1.1s linear infinite; }
.arq-traza { animation: arq-traza .9s ease-out both; }
.arq-pulso { animation: arq-pulso 1.6s ease-in-out infinite; }
.arq-fade { animation: arq-fade .25s ease-out both; }
.arq-sube { animation: arq-sube .35s cubic-bezier(.2,.8,.2,1) both; }
@media (min-width: 1024px) { .arq-sube { animation-name: arq-fade; } }
@media (prefers-reduced-motion: reduce) {
  .arq-flujo, .arq-traza, .arq-pulso, .arq-fade, .arq-sube, .arq-flota { animation: none !important; }
}
`;

export function EstilosArquitectura() {
  return <style>{ESTILOS}</style>;
}

type Props = {
  l: Locale;
  t: Copy;
  vista: Vista;
  setVista: (v: Vista) => void;
  rec: EstadoRecorrido;
};

export function DiagramaArquitectura({ l, t, vista, setVista, rec }: Props) {
  const contRef = useRef<HTMLDivElement>(null);
  const nodosRef = useRef(new Map<string, HTMLButtonElement>());
  const abridorRef = useRef<HTMLButtonElement | null>(null);
  const [cajas, setCajas] = useState<Record<string, Caja>>({});
  const [tam, setTam] = useState({ w: 0, h: 0 });
  const [abierto, setAbierto] = useState<Nodo | null>(null);
  const menosMovimiento = useMenosMovimiento();

  useLayoutEffect(() => {
    const cont = contRef.current;
    if (!cont) return;
    let raf = 0;
    const medir = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const base = cont.getBoundingClientRect();
        const out: Record<string, Caja> = {};
        nodosRef.current.forEach((el, id) => {
          const r = el.getBoundingClientRect();
          out[id] = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
        });
        setCajas(out);
        setTam({ w: base.width, h: base.height });
      });
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cont);
    nodosRef.current.forEach((el) => ro.observe(el));
    document.fonts?.ready.then(medir).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const registrar = useCallback((id: string) => (el: HTMLButtonElement | null) => {
    if (el) nodosRef.current.set(id, el);
    else nodosRef.current.delete(id);
  }, []);

  const abrir = useCallback((n: Nodo, el: HTMLButtonElement) => {
    abridorRef.current = el;
    setAbierto(n);
  }, []);

  const cerrarPanel = useCallback(() => {
    setAbierto(null);
    abridorRef.current?.focus();
  }, []);

  // ── Qué está encendido ──
  const capasVista = new Set<CapaId>(VISTAS.find((v) => v.id === vista)?.capas ?? []);
  const r = rec.recorrido;
  const pasosVisibles = r ? r.pasos.slice(0, rec.paso + 1) : [];
  const enCamino = new Set(pasosVisibles.map((p) => p.nodo));
  const actual = r ? r.pasos[rec.paso]?.nodo : null;
  const atenuado = (id: string) => {
    const n = NODO_POR_ID.get(id);
    if (!n) return true;
    if (r) return !enCamino.has(id);
    return !capasVista.has(n.capa);
  };

  const listo = tam.w > 0;

  const nodoBtn = (id: string, compacto = false) => {
    const n = NODO_POR_ID.get(id);
    if (!n) return null;
    const Icon = n.Icon;
    const dim = atenuado(id);
    const esActual = actual === id;
    const encendido = r && enCamino.has(id);
    const estados = n.modulos.flatMap((m) => {
      const x = moduloPorId(m);
      return x ? [x.modulo.estado] : [];
    });
    const estilo = {
      borderColor: encendido ? (r?.color ?? n.color) : rgba(n.color, dim ? 0.18 : 0.42),
      background: `linear-gradient(160deg, ${rgba(n.color, dim ? 0.04 : 0.13)}, rgba(2,10,24,0.92) 70%)`,
      "--arq-c": rgba(r?.color ?? n.color, 0.55),
      "--arq-g": rgba(r?.color ?? n.color, 0.45),
      boxShadow: encendido ? `0 0 26px ${rgba(r?.color ?? n.color, 0.35)}` : undefined,
    } as CSSProperties;
    return (
      <button
        key={id}
        ref={registrar(id)}
        type="button"
        onClick={(e) => abrir(n, e.currentTarget)}
        aria-haspopup="dialog"
        aria-label={`${tx(n.titulo, l)} — ${t.modulosN(n.modulos.length)}`}
        data-nodo={id}
        className={cn(
          "group relative flex w-full items-center gap-3 border text-left backdrop-blur-sm transition-[opacity,transform,border-color,box-shadow] duration-500 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
          compacto ? "min-h-11 px-3 py-2" : "min-h-[76px] px-3 py-3 lg:flex-col lg:items-start lg:gap-2.5 lg:px-3.5 lg:py-3.5",
          dim && "opacity-30 hover:opacity-80",
          encendido && "z-30",
          esActual && "arq-pulso scale-[1.04]"
        )}
        style={estilo}
      >
        <span
          className={cn("grid shrink-0 place-items-center border", compacto ? "size-7" : "size-9")}
          style={{ borderColor: rgba(n.color, 0.5), background: rgba(n.color, 0.14), color: n.color }}
          aria-hidden="true"
        >
          <Icon className={compacto ? "size-3.5" : "size-[18px]"} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block font-bold leading-tight text-white", compacto ? "text-[12.5px]" : "text-[13.5px] lg:text-[13px]")}>
            {tx(n.titulo, l)}
          </span>
          {!compacto && (
            <span className="mt-1.5 flex flex-wrap items-center gap-1" aria-hidden="true">
              {estados.map((e, k) => (
                <span key={k} className="inline-block size-[5px] rounded-full" style={{ background: COLOR_ESTADO[e] }} />
              ))}
              <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
                {n.extras ? `${n.extras.length + n.modulos.length}` : n.modulos.length}
              </span>
            </span>
          )}
        </span>
      </button>
    );
  };

  const capa = (id: CapaId) => CAPAS.find((c) => c.id === id)!;
  const etiqueta = (id: CapaId, className?: string) => {
    const c = capa(id);
    const dim = r ? false : !capasVista.has(id);
    return (
      <div className={cn("relative mb-3 flex w-fit max-w-full items-baseline gap-3 pr-3 transition-opacity duration-500", id !== "erp" && "bg-[#020a18]/85", dim && "opacity-40", className)}>
        <span className="font-serif text-lg italic text-[#6b8aff]">{c.n}</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-white/85">{tx(c.titulo, l)}</span>
        <span className="hidden truncate text-[12px] text-[#9eb0c0] sm:inline">— {tx(c.sub, l)}</span>
      </div>
    );
  };

  return (
    <div>
      {/* ── Barra de controles ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div id="arq-vistas-label" className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.26em] text-[#9eb0c0]">
            {t.vistasLabel}
          </div>
          <div role="radiogroup" aria-labelledby="arq-vistas-label" className="inline-flex flex-wrap border border-white/15 bg-white/[0.03] p-1">
            {VISTAS.map((v) => {
              const on = vista === v.id && !r;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  title={tx(v.desc, l)}
                  onClick={() => {
                    rec.cerrar();
                    setVista(v.id);
                  }}
                  className={cn(
                    "px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors focus-visible:outline-2 focus-visible:outline-[#6b8aff] md:px-4",
                    on ? "bg-white text-[#020a18]" : "text-white/70 hover:text-white"
                  )}
                >
                  {tx(v.titulo, l)}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.26em] text-[#9eb0c0]">{t.datoLabel}</div>
          <div className="flex flex-wrap gap-1.5">
            {RECORRIDOS.map((x) => {
              const on = r?.id === x.id;
              return (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => (on ? rec.cerrar() : rec.iniciar(x.id))}
                  className={cn(
                    "flex items-center gap-2 border px-3 py-2 text-left text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#6b8aff]",
                    on ? "text-white" : "border-white/12 text-white/70 hover:border-white/30 hover:text-white"
                  )}
                  style={on ? { borderColor: x.color, background: rgba(x.color, 0.14) } : undefined}
                >
                  <span className="inline-block size-2 rounded-full" style={{ background: x.color, boxShadow: `0 0 8px ${x.color}` }} aria-hidden="true" />
                  {tx(x.titulo, l)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── HUD del recorrido ── */}
      <div className={cn("mt-5 min-h-[92px] md:min-h-[76px]", r && "sticky top-[60px] z-30 md:top-[72px]")}>
        {r ? (
          <div className="arq-fade flex flex-col gap-3 border bg-[#04112a]/80 p-4 backdrop-blur md:flex-row md:items-center md:gap-5" style={{ borderColor: rgba(r.color, 0.5) }}>
            <div className="min-w-0 flex-1" aria-live="polite">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.24em]" style={{ color: r.color }}>
                {tx(r.titulo, l)} · {t.paso} {rec.paso + 1} {t.de} {r.pasos.length}
              </div>
              <p className="mt-1 text-[14px] leading-snug text-white md:text-[15px]">{tx(r.pasos[rec.paso].texto, l)}</p>
              {(() => {
                const m = r.pasos[rec.paso].modulo ? moduloPorId(r.pasos[rec.paso].modulo!) : undefined;
                if (!m) return null;
                const c = COLOR_ESTADO[m.modulo.estado];
                return (
                  <div className="mt-1.5 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/55">
                    <span className="inline-block size-1.5 rounded-full" style={{ background: c }} aria-hidden="true" />
                    {m.modulo.nombre} · {t.estados[m.modulo.estado]}
                  </div>
                );
              })()}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="mr-2 hidden gap-1 sm:flex" aria-hidden="true">
                {r.pasos.map((_, k) => (
                  <span key={k} className="h-1 w-5 transition-colors" style={{ background: k <= rec.paso ? r.color : "rgba(255,255,255,0.15)" }} />
                ))}
              </div>
              <BotonIcono label={t.anterior} onClick={rec.anterior} disabled={rec.paso === 0}>
                <SkipBack className="size-4" />
              </BotonIcono>
              <BotonIcono
                label={rec.reproduciendo ? t.pausar : rec.paso >= r.pasos.length - 1 ? t.repetir : t.reanudar}
                onClick={rec.alternar}
              >
                {rec.reproduciendo ? (
                  <Pause className="size-4" />
                ) : rec.paso >= r.pasos.length - 1 ? (
                  <RotateCcw className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </BotonIcono>
              <BotonIcono label={t.siguiente} onClick={rec.siguiente} disabled={rec.paso >= r.pasos.length - 1}>
                <SkipForward className="size-4" />
              </BotonIcono>
              <BotonIcono label={t.cerrarRecorrido} onClick={rec.cerrar}>
                <X className="size-4" />
              </BotonIcono>
            </div>
          </div>
        ) : (
          <p className="flex h-full items-center gap-3 text-[13px] text-[#9eb0c0]">
            <span className="inline-block size-1.5 rounded-full bg-[#6b8aff] shadow-[0_0_10px_#6b8aff]" aria-hidden="true" />
            {t.diagramaAyuda}
          </p>
        )}
      </div>

      {/* ── Diagrama ── */}
      <div ref={contRef} className="relative mt-4">
        <svg
          className={cn("pointer-events-none absolute inset-0 transition-opacity duration-700", listo ? "opacity-100" : "opacity-0")}
          width={tam.w}
          height={tam.h}
          viewBox={`0 0 ${Math.max(tam.w, 1)} ${Math.max(tam.h, 1)}`}
          aria-hidden="true"
        >
          <defs>
            <filter id="arq-brillo" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Conexiones estructurales */}
          {ARISTAS.map(([a, b]) => {
            const ca = cajas[a];
            const cb = cajas[b];
            if (!ca || !cb) return null;
            const na = NODO_POR_ID.get(a)!;
            const lateral = na.capa === "externos" || NODO_POR_ID.get(b)?.capa === "externos";
            const d = camino(ca, cb, lateral);
            const dim = atenuado(a) || atenuado(b);
            const fluye = !r && !dim && vista === "integral" && !menosMovimiento;
            return (
              <g key={`${a}-${b}`}>
                <path d={d} fill="none" stroke={dim ? "rgba(158,176,192,0.08)" : rgba(na.color, 0.28)} strokeWidth={1} />
                {fluye && (
                  <path d={d} fill="none" stroke={rgba(na.color, 0.75)} strokeWidth={1.4} strokeDasharray="2 14" strokeLinecap="round" className="arq-flujo" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Recorrido «Sigue un dato» (encima de los nodos) */}
        <svg
          className="pointer-events-none absolute inset-0 z-20"
          width={tam.w}
          height={tam.h}
          viewBox={`0 0 ${Math.max(tam.w, 1)} ${Math.max(tam.h, 1)}`}
          aria-hidden="true"
        >
          {r &&
            pasosVisibles.slice(1).map((p, k) => {
              const ant = pasosVisibles[k];
              const ca = cajas[ant.nodo];
              const cb = cajas[p.nodo];
              if (!ca || !cb) return null;
              const lateral = NODO_POR_ID.get(ant.nodo)?.capa === "externos" || NODO_POR_ID.get(p.nodo)?.capa === "externos";
              const d = camino(ca, cb, lateral);
              const ultimo = k === pasosVisibles.length - 2;
              return (
                <g key={`${r.id}-${k}`} filter="url(#arq-brillo)">
                  <path
                    d={d}
                    fill="none"
                    stroke={r.color}
                    strokeWidth={2.4}
                    pathLength={1}
                    strokeDasharray="1"
                    className={ultimo && !menosMovimiento ? "arq-traza" : undefined}
                  />
                  {ultimo && !menosMovimiento && (
                    <circle r={4.5} fill="#fff">
                      <animateMotion dur="1.3s" repeatCount="indefinite" path={d} />
                    </circle>
                  )}
                </g>
              );
            })}
        </svg>

        <div className="relative grid gap-y-9 lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-x-10 lg:gap-y-12">
          {/* Columna de integraciones (decorativa, escritorio) */}
          <div
            className={cn(
              "pointer-events-none absolute -inset-y-4 right-0 hidden w-[200px] border border-dashed border-white/15 bg-white/[0.015] transition-opacity duration-500 lg:block",
              !r && !capasVista.has("externos") && "opacity-40"
            )}
            style={{ top: cajas["op-campo"] ? cajas["op-campo"].y - 52 : undefined }}
            aria-hidden="true"
          >
            <div className="-translate-y-1/2 bg-[#020a18] px-2 text-center font-mono text-[9.5px] font-bold uppercase tracking-[0.24em] text-white/70">
              05 · {t.externosTitulo}
            </div>
          </div>

          {/* 01 Canales */}
          <section aria-label={tx(capa("canales").titulo, l)} className="lg:col-start-1 lg:row-start-1">
            {etiqueta("canales")}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
              {FILAS.canales.map((id) => nodoBtn(id, true))}
            </div>
          </section>

          {/* 02 Operativa */}
          <section aria-label={tx(capa("operativa").titulo, l)} className="lg:col-start-1 lg:row-start-2">
            {etiqueta("operativa")}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
              {FILAS.operativa.map((id) => nodoBtn(id))}
            </div>
          </section>

          {/* 05a Integraciones de la operación */}
          <section aria-label={t.externosTitulo} className="lg:col-start-2 lg:row-start-2 lg:self-end">
            {etiqueta("externos", "lg:hidden")}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {FILAS.externosOp.map((id) => nodoBtn(id, true))}
            </div>
          </section>

          {/* 03 Núcleo */}
          <section aria-label={tx(capa("nucleo").titulo, l)} className="relative lg:col-start-1 lg:row-start-3">
            {etiqueta("nucleo")}
            <div className="relative">
              <div
                className={cn(
                  "absolute -inset-x-2 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#6b8aff] to-transparent transition-opacity duration-500 sm:block",
                  !r && !capasVista.has("nucleo") && "opacity-30"
                )}
                aria-hidden="true"
              />
              <div className="relative grid gap-2 sm:grid-cols-3 lg:gap-6 lg:px-[8%]">{FILAS.nucleo.map((id) => nodoBtn(id))}</div>
            </div>
          </section>

          {/* 04 ERP base */}
          <section
            aria-label={tx(capa("erp").titulo, l)}
            className={cn(
              "relative border p-3 transition-[opacity,border-color] duration-500 sm:p-4 lg:col-start-1 lg:row-start-4 lg:p-5",
              r || capasVista.has("erp") ? "border-[#2348d4]/60" : "border-white/10"
            )}
            style={{ background: "linear-gradient(180deg, rgba(35,72,212,0.14), rgba(20,38,100,0.06) 60%, rgba(2,10,24,0.2))" }}
          >
            {etiqueta("erp")}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
              {[...FILAS.erp1, ...FILAS.erp2].map((id) => nodoBtn(id))}
            </div>
          </section>

          {/* 05b Integraciones de la gestión */}
          <section aria-label={t.externosTitulo} className="lg:col-start-2 lg:row-start-4 lg:self-end lg:pb-5">
            {etiqueta("externos", "lg:hidden")}
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">{FILAS.externosErp.map((id) => nodoBtn(id, true))}</div>
          </section>
        </div>
      </div>

      {/* ── Leyenda ── */}
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-[#9eb0c0]">{t.leyenda}</span>
        {(Object.keys(COLOR_ESTADO) as (keyof typeof COLOR_ESTADO)[]).map((e) => (
          <span key={e} className="flex items-center gap-2 text-[12px] text-white/70">
            <span className="inline-block size-2 rounded-full" style={{ background: COLOR_ESTADO[e] }} aria-hidden="true" />
            {t.estados[e]}
          </span>
        ))}
      </div>

      {abierto && <PanelNodo nodo={abierto} l={l} t={t} onClose={cerrarPanel} />}
    </div>
  );
}

function BotonIcono({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center border border-white/15 text-white/85 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-[#6b8aff] disabled:opacity-30"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
