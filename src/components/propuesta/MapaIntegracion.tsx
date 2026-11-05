"use client";

import type { Integracion, ReporteEntregable } from "@/data/propuesta/tipos";
import { MODOS, partirTexto, useMenosMovimiento, useVisible } from "./util";

const FILA = 56;
const ANCHO = 360;

/** Sus sistemas → ARS → reportes. Líneas que se dibujan al entrar en pantalla y luego «fluyen»; color por `modo`. */
export function MapaIntegracion({ integraciones, reportes }: { integraciones: Integracion[]; reportes: ReporteEntregable[] }) {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const quieto = useMenosMovimiento();
  const sis = integraciones.slice(0, 7);
  const rep = reportes.slice(0, 7);
  const filas = Math.max(sis.length, rep.length, 3);
  const alto = filas * FILA + 30;
  const cy = alto / 2 + 6;
  const cx = ANCHO / 2;
  const yDe = (i: number, n: number) => 30 + (filas - n) * (FILA / 2) + i * FILA + FILA / 2 - 6;
  const dibujado = visible || quieto;

  return (
    <div ref={ref}>
      <svg
        viewBox={`0 0 ${ANCHO} ${alto}`}
        className="mx-auto h-auto w-full max-w-[680px]"
        role="img"
        aria-label={`Mapa de integración: ${sis.map((s) => `${s.sistema} (${MODOS[s.modo].etiqueta.toLowerCase()})`).join(", ")} se conectan con ARS, que entrega ${rep.length} reportes.`}
      >
        <text x={8} y={14} className="fill-[#9eb0c0] font-mono text-[7.5px] uppercase tracking-[0.2em]">
          Sus sistemas
        </text>
        <text x={ANCHO - 8} y={14} textAnchor="end" className="fill-[#9eb0c0] font-mono text-[7.5px] uppercase tracking-[0.2em]">
          Reportes
        </text>

        {sis.map((s, i) => {
          const y = yDe(i, sis.length);
          const color = MODOS[s.modo].color;
          const d = `M 132 ${y} C 160 ${y}, 150 ${cy}, ${cx - 26} ${cy}`;
          return (
            <g key={`s-${i}`}>
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeOpacity="0.35"
                strokeWidth="1.3"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={dibujado ? 0 : 1}
                className="transition-[stroke-dashoffset] duration-[1200ms] ease-out"
                style={{ transitionDelay: `${i * 140}ms` }}
              />
              {dibujado && s.modo !== "centraliza" && (
                <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeDasharray="3 11" strokeLinecap="round">
                  {!quieto && <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.6s" repeatCount="indefinite" />}
                </path>
              )}
              {/* «Se centraliza en ARS»: paquetes que viajan, entran al núcleo y se quedan (se desvanecen dentro). */}
              {dibujado && s.modo === "centraliza" && (
                <>
                  <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeOpacity="0.8" />
                  {!quieto &&
                    [0, 0.8, 1.6].map((retraso) => (
                      <circle key={retraso} r="2.6" fill={color} opacity="0">
                        <animateMotion dur="2.4s" begin={`${retraso}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="2.4s" begin={`${retraso}s`} repeatCount="indefinite" />
                      </circle>
                    ))}
                </>
              )}
              <rect x={6} y={y - 19} width={126} height={38} fill="#071229" stroke={color} strokeOpacity="0.55" />
              <rect x={6} y={y - 19} width={3} height={38} fill={color} />
              {partirTexto(s.sistema, 21, 2).map((l, k, arr) => (
                <text key={k} x={15} y={y - (arr.length > 1 ? 6 : 1) + k * 10} className="fill-white text-[9px] font-bold">
                  {l}
                </text>
              ))}
              <text x={15} y={y + 14} className="font-mono text-[6.5px] uppercase tracking-[0.15em]" fill={color}>
                {MODOS[s.modo].etiqueta}
              </text>
            </g>
          );
        })}

        {rep.map((r, i) => {
          const y = yDe(i, rep.length);
          const d = `M ${cx + 26} ${cy} C 210 ${cy}, 200 ${y}, 228 ${y}`;
          return (
            <g key={`r-${i}`}>
              <path
                d={d}
                fill="none"
                stroke="#6b8aff"
                strokeOpacity="0.35"
                strokeWidth="1.3"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={dibujado ? 0 : 1}
                className="transition-[stroke-dashoffset] duration-[1200ms] ease-out"
                style={{ transitionDelay: `${600 + i * 140}ms` }}
              />
              {dibujado && (
                <path d={d} fill="none" stroke="#9fb4ff" strokeWidth="1.6" strokeDasharray="3 11" strokeLinecap="round">
                  {!quieto && <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.8s" repeatCount="indefinite" />}
                </path>
              )}
              <rect x={228} y={y - 19} width={126} height={38} fill="#071229" stroke="rgba(159,180,255,0.4)" />
              {partirTexto(r.nombre, 21, 2).map((l, k, arr) => (
                <text key={k} x={236} y={y - (arr.length > 1 ? 6 : 1) + k * 10} className="fill-white text-[9px] font-bold">
                  {l}
                </text>
              ))}
              <text x={236} y={y + 14} className="fill-[#9eb0c0] font-mono text-[6.5px] uppercase tracking-[0.12em]">
                {partirTexto(`${r.para} · ${r.frecuencia}`, 25, 1)[0]}
              </text>
            </g>
          );
        })}

        <circle cx={cx} cy={cy} r={34} fill="#2348d4" opacity="0.18">
          {!quieto && dibujado && <animate attributeName="r" values="30;38;30" dur="3s" repeatCount="indefinite" />}
        </circle>
        <circle cx={cx} cy={cy} r={26} fill="#020a18" stroke="#6b8aff" strokeWidth="1.5" />
        {sis.some((s) => s.modo === "centraliza") && (
          <circle cx={cx} cy={cy} r={20} fill={MODOS.centraliza.color} fillOpacity="0.12" stroke={MODOS.centraliza.color} strokeWidth="1" strokeDasharray="2 4">
            {!quieto && dibujado && <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="12s" repeatCount="indefinite" />}
          </circle>
        )}
        <text x={cx} y={cy + 4} textAnchor="middle" className="fill-white font-mono text-[11px] font-bold tracking-[0.15em]">
          ARS
        </text>
      </svg>

      <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2" aria-label="Tipos de conexión">
        {Object.entries(MODOS).map(([k, m]) => (
          <li key={k} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
            <span className="inline-block h-0.5 w-4" style={{ background: m.color }} aria-hidden="true" />
            {m.etiqueta}
          </li>
        ))}
      </ul>

      <dl className="mt-6 grid gap-3 @2xl:grid-cols-2">
        {integraciones.map((s, i) => (
          <div key={i} className="border-l-2 bg-white/[0.03] px-4 py-3" style={{ borderColor: MODOS[s.modo].color }}>
            <dt className="flex flex-wrap items-baseline gap-x-2 text-[14px] font-bold text-white">
              {s.sistema}
              <span className="font-mono text-[9.5px] font-normal uppercase tracking-[0.18em]" style={{ color: MODOS[s.modo].color }}>
                {MODOS[s.modo].etiqueta}
              </span>
            </dt>
            <dd className="mt-1 text-[13.5px] leading-relaxed text-[#c5d2ee]/85">{s.detalle}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
