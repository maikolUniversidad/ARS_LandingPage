"use client";

import { MessageCircleQuestion, Sparkles } from "lucide-react";
import type { Modulo } from "@/data/servicios";
import { cn } from "@/lib/utils";
import { ClipVisible } from "./ClipVisible";
import { preguntarAArs } from "./eventos";
import { Galeria } from "./Galeria";
import { RevealOnScroll } from "@/components/integral/RevealOnScroll";
import { CtaLink, EstadoBadge, Pildora, rgba } from "./ui";

type Props = {
  modulo: Modulo;
  indice: number;
  total: number;
  acento: string;
  /** Etiqueta legible del foco 3D (FOCOS_ESCENA). */
  etiquetaFoco?: string;
  activo: boolean;
  /** id del clip de narración de Ars para este módulo. */
  narracion?: string;
};

/** Un «capítulo» de la página de área: un módulo completo. */
export function SeccionModulo({ modulo, indice, total, acento, etiquetaFoco, activo, narracion }: Props) {
  const num = String(indice + 1).padStart(2, "0");
  return (
    <section
      id={modulo.id}
      data-modulo={modulo.id}
      data-narracion={narracion}
      data-foco={modulo.foco}
      aria-labelledby={`${modulo.id}-titulo`}
      className="relative min-h-[70svh] scroll-mt-[calc(42svh+5rem)] border-t border-white/[0.07] py-16 md:py-24 lg:scroll-mt-20"
    >
      {/* Marca de progreso lateral */}
      <span
        className={cn(
          "absolute -left-px top-0 hidden h-24 w-[2px] transition-opacity duration-700 lg:block",
          activo ? "opacity-100" : "opacity-0"
        )}
        style={{ background: `linear-gradient(${acento}, transparent)` }}
        aria-hidden="true"
      />

      <RevealOnScroll>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#9eb0c0]">
          <span className="tabular-nums" style={{ color: acento }}>
            {num}
            <span className="text-white/30"> / {String(total).padStart(2, "0")}</span>
          </span>
          {etiquetaFoco && <span className="text-white/45">◇ {etiquetaFoco}</span>}
        </div>

        <h2
          id={`${modulo.id}-titulo`}
          className="mt-4 text-balance font-heading text-3xl font-black leading-[1.05] tracking-tight text-white md:text-[2.6rem]"
        >
          {modulo.nombre}
        </h2>
        <p className="mt-3 text-balance font-serif text-lg italic leading-snug text-[#d5e0ff]/85 md:text-xl">
          {modulo.frase}
        </p>
        {(modulo.estado !== "vivo" || modulo.notaEstado) && (
          <div className="mt-4">
            <EstadoBadge estado={modulo.estado} nota={modulo.notaEstado} />
          </div>
        )}
        <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-[#c5d2ee] md:text-base">{modulo.resumen}</p>
      </RevealOnScroll>

      {/* Innovación */}
      <RevealOnScroll delay={80}>
        <aside
          className="relative mt-8 overflow-hidden border p-5 md:p-6"
          style={{ borderColor: rgba(acento, 0.35), background: `linear-gradient(135deg, ${rgba(acento, 0.12)}, rgba(2,10,24,0.4) 70%)` }}
        >
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: acento }}>
            <Sparkles className="size-3.5" aria-hidden="true" />
            Innovación
          </div>
          <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-white md:text-lg">{modulo.innovacion}</p>
        </aside>
        {modulo.enlace && (
          <div className="mt-5">
            <CtaLink href={modulo.enlace.href}>{modulo.enlace.texto}</CtaLink>
          </div>
        )}
      </RevealOnScroll>

      {/* Funciones */}
      {modulo.funciones.length > 0 && (
        <RevealOnScroll delay={120}>
          <h3 className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">Qué hace</h3>
          <ul className="mt-4 grid gap-px overflow-hidden border border-white/10 bg-white/10 xl:grid-cols-2">
            {modulo.funciones.map((f) => (
              <li key={f.titulo} className="bg-[#020a18]/92 p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[15px] font-bold leading-snug text-white">{f.titulo}</span>
                  {f.nuevo && (
                    <span
                      className="shrink-0 px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#020a18]"
                      style={{ background: acento }}
                    >
                      Nuevo
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#9eb0c0]">{f.detalle}</p>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      )}

      {/* Roles y canales */}
      {(modulo.roles.length > 0 || modulo.canales.length > 0) && (
        <RevealOnScroll delay={80}>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {modulo.roles.length > 0 && (
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">Quién lo usa</h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {modulo.roles.map((r) => (
                    <Pildora key={r} tint={acento}>
                      {r}
                    </Pildora>
                  ))}
                </ul>
              </div>
            )}
            {modulo.canales.length > 0 && (
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">Dónde</h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {modulo.canales.map((c) => (
                    <Pildora key={c}>{c}</Pildora>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </RevealOnScroll>
      )}

      {/* Evidencia: clip y capturas */}
      {(modulo.clip || modulo.capturas.length > 0) && (
        <div className="mt-10 space-y-6">
          {modulo.clip && <ClipVisible clip={modulo.clip} acento={acento} />}
          <Galeria capturas={modulo.capturas} acento={acento} />
        </div>
      )}

      <button
        type="button"
        onClick={() => preguntarAArs({ texto: `Explícame ${modulo.nombre} de ARS`, modulo: modulo.id })}
        className="bevel-btn mt-10 inline-flex items-center gap-3 border border-white/20 bg-white/[0.04] px-5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-white/40 hover:bg-white/10"
      >
        <MessageCircleQuestion className="size-4" style={{ color: acento }} aria-hidden="true" />
        Pregúntale a Ars sobre esto
      </button>
    </section>
  );
}
