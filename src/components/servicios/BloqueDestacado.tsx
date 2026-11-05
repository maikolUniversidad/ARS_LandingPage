"use client";

import { ArrowUpRight, Glasses } from "lucide-react";
import Link from "next/link";
import type { Destacado } from "@/data/servicios";
import { RanuraEscena } from "@/components/academia/RanuraEscena";
import { RevealOnScroll } from "@/components/integral/RevealOnScroll";
import { CtaLink, Eyebrow, rgba } from "./ui";

type Props = {
  destacado: Destacado;
  /** Color del área (si el destacado no trae uno propio). */
  colorArea: string;
};

/**
 * Acceso evidente a una página propia del área (p. ej. la Academia ARS),
 * entre el hero y los módulos. Dos variantes: banner grande con escena o
 * franja compacta con CTA.
 */
export function BloqueDestacado({ destacado: d, colorArea }: Props) {
  const color = d.color ?? colorArea;
  return d.variante === "grande" ? <Grande d={d} color={color} /> : <Compacto d={d} color={color} />;
}

function Grande({ d, color }: { d: Destacado; color: string }) {
  return (
    <section aria-labelledby="destacado-titulo" className="relative bg-[#020a18] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        <RevealOnScroll>
          <div
            className="relative isolate overflow-hidden border"
            style={{
              borderColor: rgba(color, 0.45),
              background: `linear-gradient(135deg, ${rgba(color, 0.18)}, rgba(2,10,24,0.92) 55%), #020a18`,
              boxShadow: `0 0 80px -30px ${color}`,
            }}
          >
            <div className="grid-bg absolute inset-0 -z-10 opacity-20" aria-hidden="true" />
            <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
              <div className="p-6 sm:p-8 md:p-10 xl:p-12">
                <Eyebrow tint={color}>{d.eyebrow}</Eyebrow>
                <h2
                  id="destacado-titulo"
                  className="mt-5 text-balance font-heading text-[1.9rem] font-black leading-[1.05] tracking-tight text-white sm:text-4xl xl:text-[2.75rem]"
                >
                  {d.titulo}
                </h2>
                <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-[#c5d2ee] md:text-base">{d.texto}</p>

                {d.chips && d.chips.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Módulos">
                    {d.chips.map((c) => (
                      <li key={c.texto}>
                        <Chip texto={c.texto} href={c.href} color={color} />
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <CtaLink href={d.cta.href} primary>
                    {d.cta.texto}
                  </CtaLink>
                  {d.secundario && <CtaLink href={d.secundario.href}>{d.secundario.texto}</CtaLink>}
                </div>

                {d.nota && (
                  <p className="mt-6 flex max-w-[62ch] gap-2 text-[12.5px] leading-relaxed text-[#9eb0c0]">
                    <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[#ffb547]" aria-hidden="true" />
                    {d.nota}
                  </p>
                )}
              </div>

              {d.escena === "academia-portal" && (
                <div className="relative border-t lg:border-l lg:border-t-0" style={{ borderColor: rgba(color, 0.25) }}>
                  <RanuraEscena foco="portal" className="aspect-[16/10] border-0 lg:absolute lg:inset-0 lg:aspect-auto lg:h-full" />
                </div>
              )}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Chip({ texto, href, color }: { texto: string; href?: string; color: string }) {
  const cls =
    "flex items-center gap-2 border bg-[#020a18]/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/85 transition-colors";
  const estilo = { borderColor: rgba(color, 0.35) };
  const punto = <span className="inline-block size-1.5 shrink-0" style={{ background: color }} aria-hidden="true" />;
  if (!href) {
    return (
      <span className={cls} style={estilo}>
        {punto}
        {texto}
      </span>
    );
  }
  return (
    <Link href={href} className={`${cls} hover:bg-white/[0.06] hover:text-white`} style={estilo}>
      {punto}
      {texto}
    </Link>
  );
}

function Compacto({ d, color }: { d: Destacado; color: string }) {
  return (
    <section aria-label={d.titulo} className="relative bg-[#020a18] py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        <RevealOnScroll>
          <Link
            href={d.cta.href}
            className="group flex flex-col gap-5 border p-5 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between md:p-6"
            style={{
              borderColor: rgba(color, 0.4),
              background: `linear-gradient(110deg, ${rgba(color, 0.14)}, rgba(2,10,24,0.6) 60%)`,
            }}
          >
            <span className="flex min-w-0 items-start gap-4">
              <span
                className="grid size-11 shrink-0 place-items-center border"
                style={{ borderColor: rgba(color, 0.55), background: rgba(color, 0.12), color }}
                aria-hidden="true"
              >
                <Glasses className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-black leading-tight text-white md:text-xl">{d.titulo}</span>
                <span className="mt-1.5 block max-w-[70ch] text-[13.5px] leading-relaxed text-[#c5d2ee]">{d.texto}</span>
              </span>
            </span>
            <span
              className="inline-flex shrink-0 items-center gap-2 self-start font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-white sm:self-center"
            >
              <span style={{ color }}>{d.cta.texto}</span>
              <ArrowUpRight
                className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                style={{ color }}
                aria-hidden="true"
              />
            </span>
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
