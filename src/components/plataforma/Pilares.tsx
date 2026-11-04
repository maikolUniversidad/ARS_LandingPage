"use client";

import { PILARES } from "@/data/servicios";
import { Icono } from "@/components/servicios/ui";
import { useI18n } from "@/lib/i18n/context";
import { RevealOnScroll } from "@/components/integral/RevealOnScroll";

/**
 * Lo que hace de ARS una sola plataforma: los pilares transversales del
 * catálogo (multiempresa, permisos, IA en cada área, canales, trazabilidad,
 * interoperabilidad). El contenido viene en español del inventario.
 */
export function Pilares() {
  const { locale } = useI18n();
  const t =
    locale === "en"
      ? {
          eyebrow: "Under the hood",
          title: "One platform, not ten systems stitched together.",
          note: "Pillar descriptions are in Spanish, as in our product inventory.",
        }
      : {
          eyebrow: "Debajo de todo",
          title: "Una sola plataforma, no diez sistemas pegados.",
          note: null,
        };

  return (
    <section id="pilares" className="relative border-t border-border/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <RevealOnScroll>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/55">
            <span className="size-1.5 bg-accent" />
            {t.eyebrow}
          </p>
          <h2 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight md:text-5xl">{t.title}</h2>
          {t.note && <p className="mt-3 font-mono text-[11px] text-foreground/45">{t.note}</p>}
        </RevealOnScroll>

        <div className="mt-14 grid gap-px overflow-hidden border border-border/40 bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
          {PILARES.map((p, i) => (
            <RevealOnScroll key={p.titulo}>
              <article className="group relative h-full bg-background p-7 transition-colors hover:bg-[#0a1630] md:p-8">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center border border-border/60 text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:border-accent/60">
                    <Icono nombre={p.icono} className="size-5" />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/35">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">{p.titulo}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/65">{p.detalle}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
