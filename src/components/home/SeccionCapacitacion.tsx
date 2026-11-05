"use client";

/**
 * Home · «Capacitación»: une las dos caras de la formación en ARS.
 *  - Plataforma de capacitación (área G · Formación, en operación): cursos, asignación
 *    automática por cargo y sede, diseñador con IA, video por temas, evaluaciones y
 *    certificados con QR verificable.
 *  - Academia ARS en realidad virtual (piloto): la VR es una actividad más dentro de
 *    esos cursos, no un sistema paralelo.
 * Fuente: docs/research/SALA-VR-ARS-CAPACITACION-PARA-WEB.md §2.1, §3.1 y §5.3; respeta §5.5
 * (no se promete que la nota de las gafas ya llega al ARS).
 *
 * 3D: la home ya tiene un canvas pesado (que se pausa al salir del relato). La escena de la
 * Academia solo se monta en escritorio con equipo holgado y cuando la sección se acerca a la
 * pantalla; en móvil, equipos modestos o mientras carga se usa el SVG `RespaldoAcademia`.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { RespaldoAcademia } from "@/components/academia/RespaldoAcademia";
import type { HomeDict } from "@/lib/i18n/dictionaries";
import { isModestDevice, noopSubscribe } from "@/lib/three/webgl";
import { cn } from "@/lib/utils";

const FOCO = "portal" as const;
const AMARILLO = "#ffd166";
const VIOLETA = "#b78bff";

const EscenaAcademia = dynamic(() => import("@/components/academia/EscenaAcademia"), {
  ssr: false,
  loading: () => <RespaldoAcademia foco={FOCO} className="absolute inset-0" />,
});

const CONSULTA_MOVIL = "(pointer: coarse), (max-width: 1023px)";
function suscribirMovil(cb: () => void) {
  const mq = window.matchMedia(CONSULTA_MOVIL);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const esMovil = () => window.matchMedia(CONSULTA_MOVIL).matches;

/** Marco de la escena: 3D solo si el equipo lo aguanta y la sección está cerca; si no, el SVG. */
function VistaAcademia({ etiqueta }: { etiqueta: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cerca, setCerca] = useState(false);
  const movil = useSyncExternalStore(suscribirMovil, esMovil, () => true);
  const modesto = useSyncExternalStore(noopSubscribe, isModestDevice, () => true);
  const con3D = !movil && !modesto;

  useEffect(() => {
    const el = ref.current;
    if (!el || !con3D || cerca) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setCerca(true), { rootMargin: "500px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [con3D, cerca]);

  return (
    <div
      ref={ref}
      aria-label={etiqueta}
      role="group"
      className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-[#020a18]"
    >
      {con3D && cerca ? (
        <EscenaAcademia foco={FOCO} className="absolute inset-0" />
      ) : (
        <RespaldoAcademia foco={FOCO} className="absolute inset-0" />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#060f22] to-transparent" />
    </div>
  );
}

/** Patrón fijo de 9×9 que evoca un código QR (decorativo). */
const QR = [
  "111111101", "100000101", "101110100", "101110111", "101110001",
  "100000110", "111111101", "001010011", "110101101",
];

/** Ilustración de la plataforma: un curso asignado y su certificado con QR verificable. */
function VistaPlataforma() {
  return (
    <div aria-hidden="true" className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-[#020a18]">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        {/* Teléfono con el curso asignado */}
        <g transform="translate(92 58)">
          <rect width="170" height="290" rx="20" fill="#071733" stroke="#ffffff30" />
          <rect x="14" y="34" width="142" height="80" rx="6" fill="#ffd16622" stroke="#ffd16660" />
          <path d="M77 60 l22 14 -22 14z" fill="#ffd166" />
          <rect x="14" y="128" width="110" height="9" rx="3" fill="#ffffffb0" />
          <rect x="14" y="144" width="80" height="7" rx="3" fill="#ffffff50" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(14 ${168 + i * 30})`}>
              <rect width="142" height="22" rx="4" fill="#ffffff0d" />
              <rect x="8" y="7" width="8" height="8" fill={i < 2 ? "#35e0a1" : "#b78bff"} />
              <rect x="24" y="8" width={i === 2 ? 70 : 90} height="6" rx="3" fill="#ffffff70" />
            </g>
          ))}
          <rect x="14" y="262" width="142" height="5" rx="2.5" fill="#ffffff18" />
          <rect x="14" y="262" width="96" height="5" rx="2.5" fill="#ffd166" />
        </g>
        {/* Flecha */}
        <path d="M282 203 h52" stroke="#ffd16690" strokeWidth="2" strokeDasharray="4 5" />
        <path d="M334 196 l9 7 -9 7z" fill="#ffd166" />
        {/* Certificado con QR */}
        <g transform="translate(360 88)">
          <rect width="200" height="232" rx="6" fill="#0b1d3d" stroke="#ffd16680" />
          <rect x="16" y="18" width="70" height="7" rx="3" fill="#ffd166" />
          <rect x="16" y="36" width="140" height="11" rx="3" fill="#ffffffc0" />
          <rect x="16" y="54" width="110" height="7" rx="3" fill="#ffffff50" />
          <g transform="translate(16 82)">
            {QR.flatMap((fila, y) =>
              [...fila].map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x * 10} y={y * 10} width="10" height="10" fill="#ffffff" /> : null))
            )}
          </g>
          <g transform="translate(116 102)">
            <circle cx="30" cy="30" r="28" fill="#35e0a11a" stroke="#35e0a1" />
            <path d="M18 31 l8 8 16 -18" stroke="#35e0a1" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <rect x="16" y="190" width="80" height="5" rx="2.5" fill="#ffffff40" />
          <path d="M120 200 q12 -16 22 -2 t24 -6" stroke="#ffffff90" strokeWidth="2" fill="none" />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#060f22] to-transparent" />
    </div>
  );
}

function Enlace({ href, children, tint, primario = false }: { href: string; children: ReactNode; tint: string; primario?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "bevel-btn inline-flex max-w-full items-center gap-3 px-5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] transition-colors md:px-6 md:py-3.5 md:text-[11px]",
        primario
          ? "bg-white text-[#020a18] hover:bg-[#ecdfff]"
          : "border border-white/25 bg-white/[0.04] text-white hover:border-[#ffd166] hover:bg-white/10"
      )}
    >
      <span style={{ color: primario ? "#6b3fd4" : tint }}>▸</span>
      <span className="min-w-0">{children}</span>
    </Link>
  );
}

type Cara = HomeDict["training"]["platform"];

function Tarjeta({
  cara,
  tint,
  href,
  primario,
  arriba,
}: {
  cara: Cara;
  tint: string;
  href: string;
  primario?: boolean;
  arriba?: ReactNode;
}) {
  return (
    <article className="relative flex h-full flex-col overflow-hidden border border-white/10 bg-[#060f22]/70">
      <span className="absolute inset-x-0 top-0 z-10 h-[2px]" style={{ background: tint }} />
      {arriba}
      <div className="flex flex-1 flex-col p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: tint }}>
            {cara.tag}
          </span>
          <span
            className="inline-block border px-1.5 py-0.5 font-mono text-[8.5px] font-semibold uppercase leading-none tracking-[0.18em]"
            style={{ borderColor: `${tint}80`, color: tint }}
          >
            {cara.status}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-black text-white md:text-2xl">{cara.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[#c5d2ee] md:text-base">{cara.body}</p>
        <ul className="mt-5 grid gap-2">
          {cara.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm leading-snug text-white/85">
              <span className="mt-[0.45em] inline-block size-1.5 shrink-0" style={{ background: tint }} />
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-7">
          <Enlace href={href} tint={tint} primario={primario}>
            {cara.cta}
          </Enlace>
        </div>
      </div>
    </article>
  );
}

const TINTE_PASO = [AMARILLO, VIOLETA, AMARILLO];

export function SeccionCapacitacion({ h }: { h: HomeDict }) {
  const t = h.training;
  return (
    <section
      id="capacitacion"
      data-narracion="home/capacitacion"
      aria-labelledby="capacitacion-title"
      className="relative overflow-hidden border-t border-white/10 bg-[#020a18] py-20 md:py-28"
    >
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 size-[28rem] rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${VIOLETA}, transparent 70%)` }}
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-10">
        <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#9eb0c0] md:mb-5 md:text-[11px]">
          <span className="inline-flex gap-1" aria-hidden="true">
            <span className="inline-block size-2" style={{ background: AMARILLO, boxShadow: `0 0 12px ${AMARILLO}` }} />
            <span className="inline-block size-2" style={{ background: VIOLETA, boxShadow: `0 0 12px ${VIOLETA}` }} />
          </span>
          {t.eyebrow}
        </div>
        <h2
          id="capacitacion-title"
          className="max-w-4xl text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl"
        >
          {t.title}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#c5d2ee] md:text-lg">{t.body}</p>

        <div className="mt-10 grid gap-4 md:mt-14 lg:grid-cols-2 lg:gap-5">
          <Tarjeta cara={t.platform} tint={AMARILLO} href="/servicios/formacion" arriba={<VistaPlataforma />} />
          <Tarjeta
            cara={t.academy}
            tint={VIOLETA}
            href="/academia"
            primario
            arriba={<VistaAcademia etiqueta={t.sceneLabel} />}
          />
        </div>

        <div className="mt-10 md:mt-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0] md:text-[11px]">{t.flowLabel}</p>
          <ol className="mt-4 grid gap-3 md:grid-cols-3 md:gap-0">
            {t.flow.map((paso, i) => {
              const tint = TINTE_PASO[i];
              return (
                <li key={paso.title} className="relative flex md:pr-8">
                  <div className="flex-1 border border-white/10 bg-white/[0.02] p-4 md:p-5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: tint }}>
                      0{i + 1}
                    </span>
                    <p className="mt-2 font-bold text-white">{paso.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#c5d2ee]">{paso.body}</p>
                  </div>
                  {i < t.flow.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute right-0 top-1/2 hidden w-8 -translate-y-1/2 text-center font-mono text-lg text-white/50 md:block"
                    >
                      →
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="mt-6 max-w-3xl font-mono text-[10.5px] leading-relaxed tracking-[0.04em] text-[#8ea0b8] md:text-[11px]">
            {t.note}
          </p>
        </div>
      </div>
    </section>
  );
}
