"use client";

import type { EstrategiaErp } from "@/data/propuesta/tipos";
import { partirTexto, useMenosMovimiento, useVisible } from "./util";

const COLOR = { centraliza: "#b78bff", fluye: "#4fd1c5" };

function enLista(xs: string[]) {
  const v = xs.filter(Boolean).slice(0, 3);
  if (!v.length) return "sus sistemas";
  if (v.length === 1) return v[0];
  return `${v.slice(0, -1).join(", ")} y ${v[v.length - 1]}`;
}

/** Titular según la estrategia: ARS es un ERP completo que centraliza o fluye con lo que ya tienen. */
export function titularErp(e: EstrategiaErp) {
  if (e.modo === "ars-centraliza") return "ARS centraliza su operación";
  if (e.modo === "fluye-con-su-sistema") return `ARS fluye con ${enLista(e.sistemas)}`;
  return `Mixto: ARS centraliza y fluye con ${enLista(e.sistemas)}`;
}

/** Mini diagrama: centralizar = todo converge en ARS; fluir = ida y vuelta. Mixto alterna ambos. */
function Diagrama({ e }: { e: EstrategiaErp }) {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const quieto = useMenosMovimiento();
  const nombres = e.sistemas.length ? e.sistemas.slice(0, 4) : ["Nómina", "Contabilidad", "Facturación"];
  const n = nombres.length;
  const cx = 196;
  const cy = 70;
  const filas = nombres.map((nombre, i) => {
    const y = n === 1 ? cy : 18 + (i * (140 - 36)) / (n - 1);
    const fluye = e.modo === "fluye-con-su-sistema" || (e.modo === "mixto" && i % 2 === 1);
    return { nombre, y, fluye, d: `M 86 ${y} C 130 ${y}, 140 ${cy}, ${cx - 24} ${cy}` };
  });
  const anim = visible && !quieto;

  return (
    <div ref={ref}>
      <svg viewBox="0 0 240 140" className="h-auto w-full" role="img" aria-label={`${titularErp(e)}: ${filas.map((f) => `${f.nombre} ${f.fluye ? "intercambia información con ARS" : "se centraliza en ARS"}`).join("; ")}.`}>
        {filas.map((f, i) => {
          const color = f.fluye ? COLOR.fluye : COLOR.centraliza;
          return (
            <g key={f.nombre}>
              <path d={f.d} fill="none" stroke={color} strokeOpacity={visible || quieto ? 0.5 : 0} strokeWidth="1.2" className="transition-[stroke-opacity] duration-700" />
              {anim && (
                <>
                  <circle r="2.4" fill={color} opacity="0">
                    <animateMotion dur="2.2s" begin={`${i * 0.35}s`} repeatCount="indefinite" path={f.d} />
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="2.2s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
                  </circle>
                  {f.fluye && (
                    <circle r="2.4" fill="#d5e0ff" opacity="0">
                      <animateMotion dur="2.2s" begin={`${i * 0.35 + 1.1}s`} repeatCount="indefinite" path={f.d} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="2.2s" begin={`${i * 0.35 + 1.1}s`} repeatCount="indefinite" />
                    </circle>
                  )}
                </>
              )}
              <rect x="4" y={f.y - 12} width="82" height="24" fill="#071229" stroke={color} strokeOpacity="0.6" />
              {partirTexto(f.nombre, 17, 2).map((l, k, arr) => (
                <text key={k} x="45" y={f.y + 3 + (k - (arr.length - 1) / 2) * 9} textAnchor="middle" className="fill-white text-[7.5px]">
                  {l}
                </text>
              ))}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="30" fill={COLOR.centraliza} opacity="0.1">
          {anim && <animate attributeName="r" values="27;33;27" dur="3s" repeatCount="indefinite" />}
        </circle>
        <circle cx={cx} cy={cy} r="24" fill="#020a18" stroke="#6b8aff" strokeWidth="1.4" />
        <text x={cx} y={cy - 1} textAnchor="middle" className="fill-white font-mono text-[10px] font-bold tracking-[0.12em]">
          ARS
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" className="fill-[#9fb4ff] font-mono text-[4.6px] uppercase">
          ERP completo
        </text>
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/65" aria-hidden="true">
        {e.modo !== "fluye-con-su-sistema" && (
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ background: COLOR.centraliza }} /> Converge en ARS
          </li>
        )}
        {e.modo !== "ars-centraliza" && (
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ background: COLOR.fluye }} /> Ida y vuelta
          </li>
        )}
      </ul>
    </div>
  );
}

/** «Su ERP y sus sistemas»: cómo encaja ARS (un ERP completo) con lo que ya tienen. */
export function BloqueErp({ estrategia: e }: { estrategia: EstrategiaErp }) {
  return (
    <div className="grid gap-6 border border-[#b78bff]/30 bg-[linear-gradient(135deg,rgba(183,139,255,0.08),rgba(79,209,197,0.05))] p-4 md:p-6 @2xl:grid-cols-[1.1fr_1fr] @2xl:items-center">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#cdb6ff]">
          {e.modo === "ars-centraliza" ? "Centraliza" : e.modo === "fluye-con-su-sistema" ? "Fluye" : "Centraliza y fluye"}
          {e.sistemas.length > 0 && <span className="text-white/55"> · {e.sistemas.join(", ")}</span>}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-white/90">{e.explicacion}</p>
        <p className="mt-3 text-[12.5px] leading-relaxed text-[#9eb0c0]">
          ARS es un ERP completo —nómina, contabilidad, facturación, CRM— y se adapta a lo que ya usa: lo centraliza todo o hace que la información fluya entre sistemas,
          según los módulos que contrate.
        </p>
      </div>
      <Diagrama e={e} />
    </div>
  );
}
