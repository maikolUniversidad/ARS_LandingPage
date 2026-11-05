"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import type { Propuesta, Respuestas, RespuestaSeguimiento } from "@/data/propuesta/tipos";
import { pedirPropuesta } from "./cliente";
import { OrbeArs } from "./Seguimiento";
import { SIN_CONTORNO } from "./util";

/** Segundo en que empieza cada paso (la IA real tarda 30–60 s; el último espera la respuesta). */
const INICIOS = [0, 3, 7, 12, 18, 25, 33, 42];
const MIN_MS = 3200;
const TIMEOUT_MS = 100_000;
const DATO_MS = 1700;

const RANGO: Record<string, string> = { "1-50": "hasta 50", "51-200": "51 a 200", "201-1000": "201 a 1.000", "1000+": "más de 1.000" };

function enLista(xs: string[], max = 3) {
  const v = xs.filter(Boolean).slice(0, max);
  if (!v.length) return "";
  if (v.length === 1) return v[0];
  return `${v.slice(0, -1).join(", ")} y ${v[v.length - 1]}`;
}

function pasosDe(r: Respuestas) {
  const apps = r.aplicaciones.map((a) => (a === "ERP" && r.erp.trim() ? r.erp.trim() : a));
  const tamano = [r.vigilantes ? `${RANGO[r.vigilantes]} vigilantes` : "", r.sedes.trim() ? `${r.sedes.trim()} sedes` : ""].filter(Boolean).join(" · ");
  return [
    { titulo: "Leyendo su operación", detalle: r.empresa.trim() || "Sus respuestas" },
    { titulo: "Dimensionando la operación", detalle: tamano || enLista(r.servicios) || "Tamaño y servicios" },
    { titulo: "Cruzando con las 10 áreas de ARS", detalle: "Campo, central, comunicación, monitoreo, gestión humana…" },
    { titulo: "Eligiendo módulos para lo que le duele", detalle: enLista(r.dolores, 2) || "Sus prioridades" },
    { titulo: "Diseñando la integración", detalle: enLista(apps) ? `Con ${enLista(apps)}` : "Con sus sistemas" },
    { titulo: "Definiendo reportes", detalle: enLista(r.reportes, 2) || "Para el cliente, la gerencia y los coordinadores" },
    { titulo: "Estimando indicadores y fases", detalle: r.plazo ? `Pensando en «${r.plazo.toLowerCase()}»` : "Tiempos y cifras estimadas" },
    { titulo: "Revisando y puliendo la propuesta", detalle: "Últimos detalles antes de mostrársela" },
  ];
}

/** Lo que Ars «va considerando»: datos sueltos de sus respuestas que aparecen mientras trabaja. */
function datosDe(r: Respuestas, seg: RespuestaSeguimiento[]) {
  return [
    ...r.servicios.map((x) => `Presta ${x.toLowerCase()}`),
    r.central === "si" ? "Tiene central de monitoreo propia" : r.central === "en-proyecto" ? "Su central está en proyecto" : "",
    ...r.aplicaciones.map((x) => `Hoy usa ${x === "ERP" && r.erp.trim() ? r.erp.trim() : x}`),
    ...r.datos.map((x) => `Datos en: ${x.toLowerCase()}`),
    ...r.dolores.map((x) => `Le duele: ${x.toLowerCase()}`),
    ...r.reportes.map((x) => `Necesita: ${x.toLowerCase()}`),
    r.integraciones.trim() ? `Quiere: ${r.integraciones.trim().slice(0, 90)}` : "",
    ...seg.map((s) => s.respuesta.slice(0, 80)),
  ].filter(Boolean);
}

/** «Ars está armando su propuesta»: pasos que avanzan y datos que aparecen mientras responde /api/propuesta. */
export function Armando({
  respuestas,
  seguimiento,
  onListo,
  onDejarDatos,
  onVolver,
}: {
  respuestas: Respuestas;
  seguimiento: RespuestaSeguimiento[];
  onListo: (p: Propuesta) => void;
  onDejarDatos: () => void;
  onVolver: () => void;
}) {
  const [pasos] = useState(() => pasosDe(respuestas));
  const [datos] = useState(() => datosDe(respuestas, seguimiento));
  const [seg, setSeg] = useState(0);
  const [resultado, setResultado] = useState<Propuesta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const inicio = useRef(0);
  const entrada = useRef({ respuestas, seguimiento });
  const onListoRef = useRef(onListo);
  useEffect(() => {
    onListoRef.current = onListo;
  });

  useEffect(() => {
    const ctrl = new AbortController();
    let vencido = false;
    inicio.current = Date.now();
    const t = setTimeout(() => {
      vencido = true;
      ctrl.abort();
    }, TIMEOUT_MS);
    pedirPropuesta(entrada.current, ctrl.signal)
      .then((r) => {
        if (r.ok) setResultado(r.propuesta);
        else setError(r.mensaje || "No pudimos armar la propuesta en este momento.");
      })
      .catch(() => {
        if (vencido) setError("Ars se está tomando más tiempo del normal.");
      })
      .finally(() => clearTimeout(t));
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [intento]);

  // Reloj en segundos (medio segundo de resolución) mientras se espera.
  useEffect(() => {
    if (error || resultado) return;
    const t = setInterval(() => setSeg((Date.now() - inicio.current) / 1000), 500);
    return () => clearInterval(t);
  }, [error, resultado, intento]);

  useEffect(() => {
    if (!resultado) return;
    const t = setTimeout(() => onListoRef.current(resultado), Math.max(700, MIN_MS - (Date.now() - inicio.current)));
    return () => clearTimeout(t);
  }, [resultado]);

  const terminado = Boolean(resultado);
  const avance = INICIOS.reduce((acc, ini, i) => (seg >= ini ? i : acc), 0);
  const pct = terminado ? 100 : Math.round(94 * (1 - Math.exp(-seg / 22)));
  // Los datos aparecen uno a uno y, si la espera es larga, vuelven a pasar (siempre se ve movimiento).
  const nDatos = datos.length ? Math.floor((seg * 1000) / DATO_MS) + 1 : 0;
  const visibles = Array.from({ length: Math.min(5, nDatos) }, (_, k) => nDatos - Math.min(5, nDatos) + k).map((j) => ({ j, d: datos[j % datos.length] }));
  const nombre = respuestas.empresa.trim() || "su empresa";

  const reintentar = () => {
    setError(null);
    setResultado(null);
    setSeg(0);
    setIntento((n) => n + 1);
  };

  return (
    <section className="mx-auto max-w-2xl px-1 py-8 md:py-12" aria-labelledby="propuesta-armando" aria-busy={!terminado && !error}>
      <div className="text-center">
        <OrbeArs className="mx-auto size-20" />
        <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.3em] text-[#6b8aff]">Propuesta en curso</p>
        <h3 id="propuesta-armando" tabIndex={-1} style={SIN_CONTORNO} className="mt-3 font-heading text-3xl font-black leading-tight text-white md:text-4xl">
          Ars está armando la propuesta de <span className="font-serif font-normal italic text-[#b9c8ff]">{nombre}</span>
        </h3>
        <div className="mx-auto mt-6 max-w-md">
          <div className="h-1 bg-white/[0.07]" role="progressbar" aria-label="Avance" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <div className="h-full bg-gradient-to-r from-[#2348d4] to-[#6b8aff] transition-[width] duration-700 ease-out" style={{ width: `${Math.max(3, pct)}%` }} />
          </div>
          <p className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/45" aria-hidden="true">
            <span>{pct}%</span>
            <span>{Math.floor(seg)} s</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 @2xl:grid-cols-[1.25fr_1fr]">
        <ol className="space-y-1.5" aria-live="polite">
          {pasos.map((p, i) => {
            const hecho = i < avance || terminado;
            const activo = i === avance && !terminado && !error;
            if (i > avance && !terminado) {
              return (
                <li key={i} className="border border-white/[0.05] px-3.5 py-2.5 text-[13.5px] text-white/25">
                  {p.titulo}
                </li>
              );
            }
            return (
              <li
                key={i}
                className={`flex items-center gap-3 border px-3.5 py-2.5 transition-colors duration-500 motion-safe:animate-in motion-safe:fade-in ${
                  activo ? "border-[#6b8aff]/50 bg-[#6b8aff]/[0.08]" : "border-white/[0.07] bg-white/[0.02]"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] text-white">{p.titulo}</span>
                  <span className="block truncate text-[12px] text-[#9eb0c0]">{p.detalle}</span>
                </span>
                {hecho ? (
                  <Check className="size-4 shrink-0 text-[#35e0a1]" aria-label="listo" />
                ) : activo ? (
                  <Loader2 className="size-4 shrink-0 text-white/70 motion-safe:animate-spin" aria-label="en curso" />
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="border border-white/10 bg-[#071229]/70 p-4" aria-hidden="true">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9eb0c0]">Ars está considerando</p>
          <ul className="mt-3 space-y-2">
            {visibles.map(({ j, d }, k) => (
              <li
                key={j}
                className="border-l-2 border-[#6b8aff]/60 pl-2.5 text-[12.5px] leading-snug text-white/85 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-500"
                style={{ opacity: 0.45 + (k + 1) / (visibles.length * 1.8) }}
              >
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {!terminado && !error && seg > 20 && (
        <p className="mt-6 text-center font-serif text-[15px] italic text-[#b9c8ff] motion-safe:animate-in motion-safe:fade-in">
          {seg > 50 ? "Ya casi. Ars está revisando que todo cuadre con su operación…" : "Ars lo piensa con calma: suele tomar entre 30 y 60 segundos."}
        </p>
      )}

      {error && (
        <div className="mx-auto mt-6 max-w-md border border-[#ff8fb1]/40 bg-[#ff8fb1]/[0.06] p-4 text-center" role="alert">
          <p className="text-[14px] text-white">{error}</p>
          <p className="mt-1 text-[13px] text-[#c5d2ee]/80">Sus respuestas siguen guardadas. Puede intentarlo de nuevo o dejarnos sus datos y un asesor le contacta.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={reintentar}
              className="bevel-btn inline-flex min-h-11 items-center gap-2 bg-[#d5e0ff] px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#020a18]"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> Reintentar
            </button>
            <button type="button" onClick={onDejarDatos} className="min-h-11 px-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/75 hover:text-white">
              Prefiero dejar mis datos
            </button>
            <button type="button" onClick={onVolver} className="min-h-11 px-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/55 hover:text-white">
              Revisar respuestas
            </button>
          </div>
        </div>
      )}
      {terminado && <p className="mt-6 text-center font-serif text-lg italic text-[#b9c8ff] motion-safe:animate-in motion-safe:fade-in">Listo. Esta es su propuesta…</p>}
    </section>
  );
}
