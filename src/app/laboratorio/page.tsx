"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cpu, EyeOff, Layers } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { Scramble } from "@/components/Scramble";
import { LaboratorioEnVivo } from "@/components/laboratorio/LaboratorioEnVivo";
import { TEXTOS } from "@/components/laboratorio/textos";
import { aiCapabilities } from "@/data/ai-capabilities";
import { mailtoUrl } from "@/lib/contact";
import { useI18n } from "@/lib/i18n/context";

/**
 * /laboratorio — los modelos de IA de ARS aplicados en vivo sobre la cámara
 * del visitante (por defecto), un video de muestra o un video propio.
 * Toda la inferencia corre en el navegador.
 */
export default function LaboratorioPage() {
  const { locale } = useI18n();
  const isES = locale === "es";
  const t = isES ? TEXTOS.es : TEXTOS.en;
  const iconosSello = [Cpu, EyeOff, Layers];

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div
          className="glow-blob absolute -top-1/4 left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(35,72,212,0.22), transparent 70%)" }}
        />
      </div>

      <header className="sticky inset-x-0 top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-10">
          <Link href="/" aria-label="ARS Intelligence — inicio" className="flex shrink-0 items-center gap-2">
            <Image
              src="/images/logos/horizontal-blanco.png"
              alt="ARS Intelligence"
              width={160}
              height={36}
              priority
              className="h-9 w-auto"
              style={{ height: "auto", width: "auto", maxHeight: "36px" }}
            />
          </Link>
          <SiteNav contacto="#cierre" idioma />
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 pb-24 pt-8 md:px-10 md:pt-14">
        {/* Hero */}
        <section data-narracion="laboratorio/hero" className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/55">
              <span className="mr-3 inline-block size-1.5 bg-accent align-middle" />
              <Scramble text={t.eyebrow} trigger={locale} />
            </div>
            <h1 className="mt-4 font-heading text-[2.4rem] font-black sm:text-4xl uppercase leading-[1.02] tracking-tight md:text-6xl">
              <Scramble as="span" text={t.titulo1} trigger={`${locale}-1`} />
              <br />
              <span className="brand-gradient-text">
                <Scramble as="span" text={t.titulo2} trigger={`${locale}-2`} delayMs={200} />
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-foreground/75 md:text-lg">{t.intro}</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="hidden items-baseline gap-3 border-l-2 border-accent pl-4 lg:flex">
              <span className="font-heading text-6xl font-black tabular-nums tracking-tight">{aiCapabilities.length}</span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-foreground/55">{t.modelos}</span>
            </div>
            <ul className="flex flex-wrap gap-2 lg:grid lg:grid-cols-1">
              {t.sellos.map((s, i) => {
                const Icono = iconosSello[i];
                return (
                  <li
                    key={s}
                    className="flex items-center gap-2 border border-border/50 bg-background/40 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] lg:gap-3 lg:px-3 lg:py-2.5 lg:text-[10px] lg:tracking-[0.2em] text-foreground/75 backdrop-blur"
                  >
                    <Icono className="size-4 shrink-0 text-accent" aria-hidden />
                    {s}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <LaboratorioEnVivo isES={isES} />

        {/* Cierre */}
        <section
          id="cierre"
          data-narracion="laboratorio/cierre"
          className="relative isolate mt-20 scroll-mt-24 overflow-hidden border border-border/40"
        >
          <div className="absolute inset-0 -z-10">
            <div className="brand-gradient absolute inset-0 opacity-90" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 25% 30%, rgba(34,211,238,0.25), transparent 55%), radial-gradient(circle at 80% 75%, rgba(35,72,212,0.45), transparent 55%)",
              }}
            />
            <div className="grid-bg absolute inset-0 opacity-15" />
          </div>
          <div className="px-6 py-14 text-center text-white md:py-20">
            <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/70">
              <span className="mr-3 inline-block size-1.5 bg-white align-middle" />
              {t.cierreEyebrow}
            </div>
            <h2 className="mt-5 font-heading text-3xl font-black uppercase tracking-tight md:text-5xl">
              <Scramble text={t.cierreTitulo} trigger={locale} />
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/85">{t.cierreCuerpo}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/diagnostico"
                className="bevel-btn inline-flex items-center gap-3 bg-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary shadow-xl transition-all hover:bg-white/95"
              >
                {t.cierreDiagnostico}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a
                href={mailtoUrl()}
                className="inline-flex items-center gap-3 border border-white/60 px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/10"
              >
                <span>▸</span>
                {t.cierreDemo}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
