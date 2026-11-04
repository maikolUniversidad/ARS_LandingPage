"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import type { AreaId, Diagnostico, PerfilEmpresa, TurnoEntrevista } from "@/data/diagnostico/tipos";
import { Icono, rgba } from "@/components/servicios/ui";
import { areaInfo, areasCandidatas, perfilCompleto } from "@/lib/diagnostico/catalogo";
import { guardarDiagnostico, pedirDiagnostico } from "./cliente";

const PASO_MS = 850;
const MIN_MS = 6500;

type Paso = { clave: string; titulo: string; detalle: string; color: string; icono: string };

/**
 * Pantalla «analizando»: muestra a los agentes por área revisando la empresa
 * mientras /api/diagnostico trabaja; al terminar guarda en sessionStorage.
 */
export function Analizando({
  perfil,
  conversacion,
  areasVistas,
  onListo,
  onVolver,
}: {
  perfil: Partial<PerfilEmpresa>;
  conversacion: TurnoEntrevista[];
  areasVistas: AreaId[];
  onListo: (d: Diagnostico) => void;
  onVolver: () => void;
}) {
  const nombre = perfil.nombre || "tu empresa";
  const pasos = useMemo<Paso[]>(() => {
    const areas = [...new Set([...areasCandidatas(perfil, 3, 6), ...areasVistas])].slice(0, 7);
    return [
      { clave: "lectura", titulo: "Leyendo la entrevista", detalle: `Ordenando lo que nos contaste de ${nombre}`, color: "#9eb0c0", icono: "MessagesSquare" },
      ...areas.map((id) => {
        const a = areaInfo(id);
        return { clave: id, titulo: `Agente de ${a.nombre}`, detalle: "Evaluando encaje, módulos y cifras antes → después", color: a.color, icono: a.icono };
      }),
      { clave: "sintesis", titulo: "Sintetizador", detalle: "Armando hallazgos, plan por fases y tu historia", color: "#6b8aff", icono: "BrainCircuit" },
    ];
  }, [perfil, areasVistas, nombre]);

  const [avance, setAvance] = useState(0);
  const [resultado, setResultado] = useState<Diagnostico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const inicio = useRef(0);

  // Petición al motor multiagente.
  useEffect(() => {
    const ctrl = new AbortController();
    inicio.current = Date.now();
    pedirDiagnostico({ perfil: perfilCompleto(perfil), conversacion }, ctrl.signal)
      .then((r) => {
        if (r.ok) {
          guardarDiagnostico(r.diagnostico);
          setResultado(r.diagnostico);
        } else setError(r.mensaje);
      })
      .catch(() => {
        /* abortado */
      });
    return () => ctrl.abort();
  }, [perfil, conversacion, intento]);

  // Avance visual de los pasos: el último espera a que llegue el resultado.
  useEffect(() => {
    if (error) return;
    const t = setInterval(() => {
      setAvance((a) => (a < pasos.length - 1 ? a + 1 : a));
    }, PASO_MS);
    return () => clearInterval(t);
  }, [pasos.length, error]);

  useEffect(() => {
    if (!resultado || avance < pasos.length - 1) return;
    const falta = Math.max(400, MIN_MS - (Date.now() - inicio.current));
    const t = setTimeout(() => onListo(resultado), falta);
    return () => clearTimeout(t);
  }, [resultado, avance, pasos.length, onListo]);

  const terminado = Boolean(resultado) && avance >= pasos.length - 1;
  const pct = Math.round(((terminado ? pasos.length : avance + 0.5) / pasos.length) * 100);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-16" aria-live="polite">
      <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.3em] text-[#6b8aff]">Diagnóstico en curso</p>
      <h2 className="mt-3 text-center font-serif text-3xl leading-tight text-white md:text-4xl">
        Nuestros agentes están revisando <span className="italic text-[#9eb0c0]">{nombre}</span>
      </h2>

      <div className="relative mx-auto mt-8 grid size-28 place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="url(#grad-diag)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - pct / 100)}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
          <defs>
            <linearGradient id="grad-diag" x1="0" x2="1">
              <stop offset="0" stopColor="#2348d4" />
              <stop offset="1" stopColor="#6b8aff" />
            </linearGradient>
          </defs>
        </svg>
        <span className="font-mono text-xl tabular-nums text-white">{pct}%</span>
        {!error && !terminado && <span className="absolute inset-0 animate-ping rounded-full border border-[#2348d4]/30" aria-hidden="true" />}
      </div>

      <ol className="mt-8 space-y-2">
        {pasos.map((p, i) => {
          const hecho = i < avance || terminado;
          const activo = i === avance && !terminado && !error;
          const visible = i <= avance;
          return (
            <li
              key={p.clave}
              className={`flex items-center gap-3 border px-3 py-2.5 transition-all duration-500 ${visible ? "opacity-100" : "opacity-25"}`}
              style={{ borderColor: activo ? rgba(p.color, 0.5) : "rgba(255,255,255,0.07)", background: activo ? rgba(p.color, 0.07) : "rgba(255,255,255,0.02)" }}
            >
              <span className="grid size-8 shrink-0 place-items-center" style={{ background: rgba(p.color, 0.14), color: p.color }}>
                <Icono nombre={p.icono} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-white">{p.titulo}</p>
                <p className="truncate text-[12px] text-[#9eb0c0]">{p.detalle}</p>
              </div>
              {hecho ? (
                <Check className="size-4 shrink-0 text-[#35e0a1]" aria-label="listo" />
              ) : activo ? (
                <Loader2 className="size-4 shrink-0 animate-spin text-white/70" aria-label="trabajando" />
              ) : null}
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="mt-6 border border-[#ff6b6b]/40 bg-[#ff6b6b]/[0.06] p-4 text-center">
          <p className="text-sm text-white">{error}</p>
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setResultado(null);
                setAvance(0);
                setIntento((n) => n + 1);
              }}
              className="bevel-btn inline-flex items-center gap-2 bg-white px-4 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#020a18]"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> Reintentar
            </button>
            <button type="button" onClick={onVolver} className="px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/70 hover:text-white">
              Volver a la conversación
            </button>
          </div>
        </div>
      )}
      {terminado && <p className="mt-6 text-center font-serif text-lg italic text-[#9eb0c0] animate-in fade-in">Listo. Prepárate para ver tu empresa transformarse…</p>}
    </div>
  );
}
