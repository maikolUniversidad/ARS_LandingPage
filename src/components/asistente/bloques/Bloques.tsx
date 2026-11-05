"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Boxes, Check, ChevronLeft, ChevronRight, Footprints, MapPin, Navigation, ScanEye, Sparkles } from "lucide-react";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import type {
  Accion,
  Tarjeta,
  TarjetaAntesDespues,
  TarjetaGaleria,
  TarjetaGrafico,
  TarjetaPasos,
} from "@/lib/asistente/tipos";
import { SERIES } from "../tema";
import { MedioEvidencia } from "./MedioEvidencia";
import { useTextosBloques, type TextosBloques } from "./textos";

type Ejecutar = (a: Accion) => void;

/** Marco común de los bloques: borde de cristal, etiqueta mono y llegada animada. */
export function Marco({
  etiqueta,
  icono,
  children,
  acento = "#6b8aff",
  className = "",
  indice = 0,
}: {
  etiqueta: ReactNode;
  icono?: ReactNode;
  children: ReactNode;
  acento?: string;
  className?: string;
  indice?: number;
}) {
  return (
    <section
      className={`ars-bloque relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(20,38,100,0.55),rgba(2,10,24,0.75))] shadow-[0_18px_40px_-28px_rgba(35,72,212,0.9)] ${className}`}
      style={{ "--retraso": `${indice * 90}ms`, "--acento": acento } as CSSProperties}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--acento),transparent)] opacity-70" />
      <header className="flex items-center gap-2 px-3.5 pt-3 font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--acento)]">
        {icono}
        <span className="min-w-0 truncate">{etiqueta}</span>
      </header>
      {children}
    </section>
  );
}

const traducirRotulo = (r: string, tx: TextosBloques) =>
  r === "Ejemplo de evidencia" ? tx.evidencia : r === "Generado con IA" ? tx.generadoIa : r;

/* ───────────── Analítica con video de evidencia ───────────── */

type TAnalitica = Extract<Tarjeta, { tipo: "analitica" }>;

export function BloqueAnalitica({ x, ejecutar, indice }: { x: TAnalitica; ejecutar: Ejecutar; indice: number }) {
  const { t } = useTextosAsistente();
  const tx = useTextosBloques();
  const ev = x.evidencia;
  return (
    <Marco etiqueta={`${t("asistente.tarjeta.analitica")} · ${x.familia}`} icono={<ScanEye className="size-3" aria-hidden="true" />} indice={indice}>
      <div className="p-3.5 pt-2">
        {ev && (
          <MedioEvidencia
            video={ev.video}
            poster={ev.poster}
            imagen={ev.imagen}
            alt={`${x.nombre} — ${ev.chapa}`}
            rotulos={[tx.evidencia, ...(ev.ia ? [tx.generadoIa] : [])]}
            className="mb-3 aspect-video rounded-xl border border-white/10"
          />
        )}
        <h4 className="text-[15px] font-black leading-tight text-[#e8eefc]">{x.nombre}</h4>
        <p className="mt-1 text-xs leading-relaxed text-[#c5d2ee]/75">{x.corta}</p>
        <BotonLlevame alTocar={() => ejecutar({ tipo: "mostrar_analitica", id: x.id })} texto={tx.llevame} />
      </div>
    </Marco>
  );
}

/* ───────────── Módulo / servicio con captura real ───────────── */

type TServicio = Extract<Tarjeta, { tipo: "servicio" }>;

const ESTILO_ESTADO: Record<TServicio["estado"], string> = {
  vivo: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  piloto: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  proximamente: "border-sky-300/40 bg-sky-300/10 text-sky-100",
  "hoja-de-ruta": "border-white/20 bg-white/5 text-foreground/70",
};

export function BloqueServicio({ x, ejecutar, indice }: { x: TServicio; ejecutar: Ejecutar; indice: number }) {
  const { t } = useTextosAsistente();
  const tx = useTextosBloques();
  return (
    <Marco etiqueta={`${t("asistente.tarjeta.servicio")} · ${x.nombreArea}`} icono={<Boxes className="size-3" aria-hidden="true" />} acento={x.color} indice={indice}>
      <div className="p-3.5 pt-2">
        {x.imagen ? (
          <div className="relative mb-3 overflow-hidden rounded-xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={x.imagen.src} alt={x.imagen.alt} loading="lazy" className="aspect-[16/9] w-full object-cover object-top" />
            <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(2,10,24,0.85))]" />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5">
          <h4 className="text-[15px] font-black leading-tight text-[#e8eefc]">{x.nombre}</h4>
          <span title={x.notaEstado} className={`rounded-full border px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.15em] ${ESTILO_ESTADO[x.estado]}`}>
            {t(`asistente.estado.${x.estado}`)}
          </span>
        </div>
        <p className="mt-1 font-serif text-[13px] italic leading-snug text-[#b9c8ff]">{x.frase}</p>
        {x.notaEstado && <p className="mt-1 text-[11px] text-[#c5d2ee]/55">{x.notaEstado}</p>}
        <BotonLlevame alTocar={() => ejecutar({ tipo: "mostrar_servicio", area: x.area, modulo: x.modulo, foco: x.foco })} texto={tx.llevame} />
      </div>
    </Marco>
  );
}

function BotonLlevame({ alTocar, texto }: { alTocar: () => void; texto: string }) {
  return (
    <button
      type="button"
      onClick={alTocar}
      className="group/b mt-3 inline-flex items-center gap-2 rounded-full bg-[#2348d4] px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-10px_rgba(35,72,212,1)] transition-colors hover:bg-[#2f57ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      {texto}
      <ArrowRight className="size-3.5 transition-transform group-hover/b:translate-x-0.5" aria-hidden="true" />
    </button>
  );
}

/* ───────────── Navegación «Te llevo a…» ───────────── */

type TEnlace = Extract<Tarjeta, { tipo: "enlace" }>;

export function BloqueNavegacion({ x, ejecutar, indice, reciente }: { x: TEnlace; ejecutar: Ejecutar; indice: number; reciente: boolean }) {
  const tx = useTextosBloques();
  return (
    <div
      className="ars-bloque flex items-center gap-3 rounded-2xl border border-[#6b8aff]/35 bg-[#2348d4]/10 p-2.5 pr-3"
      style={{ "--retraso": `${indice * 90}ms` } as CSSProperties}
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-full bg-[#2348d4] text-white ${reciente ? "ars-rastro-nuevo" : ""}`}>
        <Navigation className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-[#6b8aff]">{reciente ? tx.teLlevo : tx.teLleve}</span>
        <span className="block truncate text-sm font-bold text-[#e8eefc]">{x.titulo}</span>
        <span className="block truncate font-mono text-[10px] text-[#c5d2ee]/50">
          {x.ruta}
          {x.ancla ? `#${x.ancla}` : ""}
        </span>
      </span>
      <button
        type="button"
        onClick={() => ejecutar({ tipo: "ir_a", ruta: x.ruta, ancla: x.ancla })}
        className="shrink-0 rounded-full border border-[#6b8aff]/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#d5e0ff] transition-colors hover:bg-[#2348d4] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
      >
        {tx.volver}
      </button>
    </div>
  );
}

/* ───────────── Galería ───────────── */

export function BloqueGaleria({ x, ejecutar, indice }: { x: TarjetaGaleria; ejecutar: Ejecutar; indice: number }) {
  const tx = useTextosBloques();
  const pista = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const mover = (d: number) => {
    const el = pista.current;
    if (!el) return;
    const i = Math.max(0, Math.min(x.items.length - 1, actual + d));
    const hijo = el.children[i] as HTMLElement | undefined;
    if (hijo) el.scrollTo({ left: hijo.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };
  return (
    <Marco etiqueta={`${tx.galeria} · ${x.titulo}`} icono={<Sparkles className="size-3" aria-hidden="true" />} indice={indice}>
      <div
        ref={pista}
        tabIndex={0}
        role="region"
        aria-label={x.titulo}
        onScroll={(e) => {
          const el = e.currentTarget;
          const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
          setActual(Math.round(el.scrollLeft / (w + 10)));
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            mover(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            mover(-1);
          }
        }}
        className="mt-2 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-3.5 pb-2 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6b8aff] [&::-webkit-scrollbar]:hidden"
      >
        {x.items.map((it, i) => (
          <figure key={`${it.src}-${i}`} className="w-[84%] shrink-0 snap-start">
            <MedioEvidencia
              video={it.medio === "video" ? it.src : undefined}
              poster={it.poster}
              imagen={it.medio === "imagen" ? it.src : undefined}
              alt={it.alt}
              rotulos={it.rotulos?.map((r) => traducirRotulo(r, tx))}
              className="aspect-video rounded-xl border border-white/10"
            />
            <figcaption className="mt-1.5 flex items-start gap-2">
              <span className="line-clamp-2 flex-1 text-[11px] leading-snug text-[#c5d2ee]/75">{it.pie}</span>
              {it.accion && (
                <button
                  type="button"
                  onClick={() => it.accion && ejecutar(it.accion)}
                  className="shrink-0 rounded-full border border-[#6b8aff]/45 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#d5e0ff] hover:bg-[#2348d4] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
                >
                  {tx.llevame} →
                </button>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      {x.items.length > 1 && (
        <div className="flex items-center justify-between px-3.5 pb-3">
          <div className="flex gap-1" aria-hidden="true">
            {x.items.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all duration-300 ${i === actual ? "w-5 bg-[#6b8aff]" : "w-1.5 bg-white/20"}`} />
            ))}
          </div>
          <div className="flex gap-1">
            <BotonFlecha alTocar={() => mover(-1)} etiqueta={tx.anterior} deshabilitado={actual === 0}>
              <ChevronLeft className="size-3.5" aria-hidden="true" />
            </BotonFlecha>
            <BotonFlecha alTocar={() => mover(1)} etiqueta={tx.siguiente} deshabilitado={actual >= x.items.length - 1}>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </BotonFlecha>
          </div>
        </div>
      )}
    </Marco>
  );
}

function BotonFlecha({ alTocar, etiqueta, deshabilitado, children }: { alTocar: () => void; etiqueta: string; deshabilitado: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={alTocar}
      disabled={deshabilitado}
      aria-label={etiqueta}
      className="grid size-7 place-items-center rounded-full border border-white/15 text-[#d5e0ff] transition-colors hover:border-[#6b8aff] hover:bg-[#2348d4]/30 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff]"
    >
      {children}
    </button>
  );
}

/* ───────────── Gráfico ───────────── */

const formato = (n: number) => (Math.abs(n) >= 1000 ? n.toLocaleString("es-CO", { maximumFractionDigits: 0 }) : n.toLocaleString("es-CO", { maximumFractionDigits: 1 }));

export function BloqueGrafico({ x, indice }: { x: TarjetaGrafico; indice: number }) {
  const tx = useTextosBloques();
  const resumen = x.datos.map((d) => `${d.etiqueta}: ${formato(d.valor)}${x.unidad ? ` ${x.unidad}` : ""}`).join("; ");
  return (
    <Marco
      etiqueta={
        <>
          {tx.grafico} · {x.titulo}
        </>
      }
      icono={<span className="size-1.5 rounded-full bg-[#35e0a1]" aria-hidden="true" />}
      acento="#35e0a1"
      indice={indice}
    >
      <div className="px-3.5 pb-3.5 pt-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-black leading-tight text-[#e8eefc]">{x.titulo}</h4>
          {x.estimado && (
            <span className="shrink-0 rounded-full border border-[#ffb547]/45 bg-[#ffb547]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#ffd59a]">
              {tx.estimado}
            </span>
          )}
        </div>
        <figure className="mt-3" role="img" aria-label={`${x.titulo}${x.estimado ? ` (${tx.estimado})` : ""}. ${resumen}`}>
          {x.forma === "donut" ? <Donut x={x} /> : x.forma === "linea" ? <Linea x={x} /> : <Barras x={x} />}
        </figure>
        {(x.supuestos?.length || x.estimado) && (
          <div className="mt-3 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#9eb0c0]">{tx.supuestos}</p>
            <ul className="mt-1 space-y-0.5 text-[11px] leading-snug text-[#c5d2ee]/70">
              {x.supuestos?.map((s) => (
                <li key={s}>· {s}</li>
              ))}
              {x.estimado && <li className="text-[#ffd59a]/80">· {tx.orientativo}</li>}
            </ul>
          </div>
        )}
        {x.fuente && (
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#9eb0c0]">
            {tx.fuente}: {x.fuente}
          </p>
        )}
      </div>
    </Marco>
  );
}

function Barras({ x }: { x: TarjetaGrafico }) {
  const max = Math.max(...x.datos.map((d) => Math.abs(d.valor)), 1);
  return (
    <ul className="space-y-2">
      {x.datos.map((d, i) => (
        <li key={d.etiqueta} className="grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-2 text-[11px]">
          <span className="truncate text-[#c5d2ee]/80" title={d.etiqueta}>
            {d.etiqueta}
          </span>
          <span className="flex items-center gap-2">
            <span className="relative h-3.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
              <span
                className="ars-barra-h absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${(Math.abs(d.valor) / max) * 100}%`, background: `linear-gradient(90deg, ${SERIES[i % SERIES.length]}55, ${SERIES[i % SERIES.length]})`, "--i": i } as CSSProperties}
              />
            </span>
            <span className="w-16 shrink-0 text-right font-mono tabular-nums text-[#e8eefc]">
              {formato(d.valor)}
              {x.unidad ? <span className="ml-0.5 text-[9px] text-[#9eb0c0]">{x.unidad}</span> : null}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Linea({ x }: { x: TarjetaGrafico }) {
  const W = 300;
  const H = 120;
  const pad = 14;
  const vals = x.datos.map((d) => d.valor);
  const min = Math.min(0, ...vals);
  const max = Math.max(...vals, 1);
  const px = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, x.datos.length - 1);
  const py = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
  const d = x.datos.map((p, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(p.valor).toFixed(1)}`).join(" ");
  const area = `${d} L${px(x.datos.length - 1)},${H - pad} L${px(0)},${H - pad} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="ars-linea-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6b8aff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#6b8aff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={pad} x2={W - pad} y1={pad + f * (H - pad * 2)} y2={pad + f * (H - pad * 2)} stroke="rgba(255,255,255,0.06)" />
        ))}
        <path d={area} fill="url(#ars-linea-area)" className="ars-punto" style={{ "--i": 0 } as CSSProperties} />
        <path d={d} pathLength={1} fill="none" stroke="#6b8aff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ars-trazo" />
        {x.datos.map((p, i) => (
          <g key={p.etiqueta} className="ars-punto" style={{ "--i": i, transformOrigin: `${px(i)}px ${py(p.valor)}px` } as CSSProperties}>
            <circle cx={px(i)} cy={py(p.valor)} r="4" fill="#020a18" stroke="#5fd8ff" strokeWidth="2" />
            <text x={px(i)} y={py(p.valor) - 9} textAnchor="middle" className="fill-[#e8eefc] font-mono text-[9px]">
              {formato(p.valor)}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#9eb0c0]">
        {x.datos.map((p) => (
          <span key={p.etiqueta} className="min-w-0 truncate">
            {p.etiqueta}
          </span>
        ))}
      </div>
      {x.unidad && <p className="mt-1 text-right font-mono text-[9px] text-[#9eb0c0]">{x.unidad}</p>}
    </div>
  );
}

function Donut({ x }: { x: TarjetaGrafico }) {
  const tx = useTextosBloques();
  const total = x.datos.reduce((n, d) => n + d.valor, 0) || 1;
  const R = 15.9155; // circunferencia ≈ 100
  const pcts = x.datos.map((d) => (d.valor / total) * 100);
  const inicios = pcts.map((_, i) => pcts.slice(0, i).reduce((n, v) => n + v, 0));
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-28 shrink-0">
        <svg viewBox="0 0 42 42" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="21" cy="21" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          {x.datos.map((d, i) => {
            const pct = pcts[i];
            const inicio = inicios[i];
            return (
              <circle
                key={d.etiqueta}
                cx="21"
                cy="21"
                r={R}
                fill="none"
                stroke={SERIES[i % SERIES.length]}
                strokeWidth="5"
                pathLength={100}
                strokeDasharray={`${Math.max(0, pct - 0.6)} 100`}
                className="ars-arco"
                style={{ "--i": i, "--largo": pct, transform: `rotate(${(inicio / 100) * 360}deg)`, transformOrigin: "21px 21px" } as CSSProperties}
              />
            );
          })}
        </svg>
        <span className="absolute inset-0 grid place-items-center text-center">
          <span>
            <span className="block font-mono text-sm font-bold tabular-nums text-[#e8eefc]">{formato(total)}</span>
            <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-[#9eb0c0]">{x.unidad ?? tx.total}</span>
          </span>
        </span>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5 text-[11px]">
        {x.datos.map((d, i) => (
          <li key={d.etiqueta} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[#c5d2ee]/80">{d.etiqueta}</span>
            <span className="font-mono tabular-nums text-[#e8eefc]">{Math.round((d.valor / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────── Pasos / guía ───────────── */

export function BloquePasos({ x, ejecutar, indice }: { x: TarjetaPasos; ejecutar: Ejecutar; indice: number }) {
  const tx = useTextosBloques();
  const [vistos, setVistos] = useState<Set<number>>(() => new Set());
  const [actual, setActual] = useState<number | null>(null);
  return (
    <Marco etiqueta={x.titulo} icono={<Footprints className="size-3" aria-hidden="true" />} acento="#5fd8ff" indice={indice}>
      <ol className="relative px-3.5 pb-3.5 pt-2">
        {x.pasos.map((p, i) => {
          const visto = vistos.has(i);
          const esActual = actual === i;
          const contenido = (
            <>
              <span
                className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full border font-mono text-[11px] font-bold transition-colors ${
                  esActual ? "border-[#5fd8ff] bg-[#5fd8ff] text-[#020a18]" : visto ? "border-[#35e0a1]/60 bg-[#35e0a1]/15 text-[#35e0a1]" : "border-white/20 bg-[#06112a] text-[#d5e0ff]"
                }`}
              >
                {visto && !esActual ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1 pb-3">
                <span className="block text-[13px] font-bold leading-snug text-[#e8eefc]">{p.titulo}</span>
                {p.detalle && <span className="mt-0.5 block text-[11.5px] leading-snug text-[#c5d2ee]/70">{p.detalle}</span>}
                {p.destino && (
                  <span className="mt-1 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#5fd8ff]">
                    <MapPin className="size-3" aria-hidden="true" />
                    {p.destinoTexto ?? tx.ir}
                    <span className="sr-only">
                      {" "}
                      — {tx.ir}
                      {visto ? ` (${tx.visto})` : ""}
                    </span>
                  </span>
                )}
              </span>
            </>
          );
          return (
            <li key={i} className="relative">
              {i < x.pasos.length - 1 && <span aria-hidden="true" className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-[linear-gradient(#5fd8ff55,#ffffff14)]" />}
              {p.destino ? (
                <button
                  type="button"
                  aria-current={esActual ? "step" : undefined}
                  onClick={() => {
                    if (!p.destino) return;
                    setActual(i);
                    setVistos((v) => new Set(v).add(i));
                    ejecutar(p.destino);
                  }}
                  className="group/p -mx-1.5 flex w-[calc(100%+0.75rem)] items-start gap-3 rounded-xl px-1.5 pt-1 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5fd8ff]"
                >
                  {contenido}
                </button>
              ) : (
                <div className="flex items-start gap-3 pt-1">{contenido}</div>
              )}
            </li>
          );
        })}
      </ol>
    </Marco>
  );
}

/* ───────────── Antes / después ───────────── */

export function BloqueAntesDespues({ x, indice }: { x: TarjetaAntesDespues; indice: number }) {
  const tx = useTextosBloques();
  return (
    <Marco etiqueta={x.titulo} icono={<span className="font-bold">⇄</span>} acento="#a88bff" indice={indice}>
      <div className="px-3.5 pb-3.5 pt-2">
        <div className="grid grid-cols-2 gap-2 font-mono text-[9px] uppercase tracking-[0.22em]">
          <span className="text-[#c5d2ee]/50">{tx.antes}</span>
          <span className="flex items-center gap-1.5 text-[#35e0a1]">
            <span className="size-1.5 rounded-full bg-[#35e0a1]" aria-hidden="true" />
            {tx.conArs}
          </span>
        </div>
        <dl className="mt-2 space-y-2">
          {x.filas.map((f, i) => (
            <div key={f.aspecto} className="ars-bloque rounded-xl border border-white/8 bg-white/[0.02] p-2.5" style={{ "--retraso": `${indice * 90 + 120 + i * 80}ms` } as CSSProperties}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a88bff]">{f.aspecto}</dt>
              <dd className="mt-1.5 grid grid-cols-2 gap-2 text-[11.5px] leading-snug">
                <span className="text-[#c5d2ee]/55 line-through decoration-white/15">{f.antes}</span>
                <span className="text-[#e8eefc]">{f.despues}</span>
              </dd>
            </div>
          ))}
        </dl>
        {(x.nota || x.estimado) && (
          <p className="mt-2 text-[11px] leading-snug text-[#c5d2ee]/60">
            {x.estimado && <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#ffd59a]">{tx.estimado} ·</span>}
            {x.nota}
          </p>
        )}
      </div>
    </Marco>
  );
}
