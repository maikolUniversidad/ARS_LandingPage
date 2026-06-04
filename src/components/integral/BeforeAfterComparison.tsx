"use client";

import { beforeAfter } from "@/data/integral-security";
import { useI18n } from "@/lib/i18n/context";

export function BeforeAfterComparison() {
  const { locale } = useI18n();
  const data = beforeAfter[locale];
  const c =
    locale === "en"
      ? {
          eyebrow: "Before vs. With ARS",
          titleA: "The difference between watching",
          titleB: "and operating with intelligence.",
          beforeLabel: "Before ARS",
          afterLabel: "With ARS Intelligence",
          m1: "alert latency",
          m2: "traceability per event",
          m3: "deployment on your infrastructure",
        }
      : {
          eyebrow: "Antes vs. Con ARS",
          titleA: "La diferencia entre vigilar",
          titleB: "y operar con inteligencia.",
          beforeLabel: "Antes de ARS",
          afterLabel: "Con ARS Intelligence",
          m1: "latencia de alertas",
          m2: "trazabilidad por evento",
          m3: "despliegue sobre tu infraestructura",
        };

  return (
    <section className="relative border-b border-border/40 px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 max-w-3xl">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/55">
            <span className="mr-3 inline-block size-1.5 align-middle bg-accent" />
            {c.eyebrow}
          </div>
          <h2 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight md:text-5xl">
            {c.titleA}
            <br />
            <span className="text-foreground/80">{c.titleB}</span>
          </h2>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Antes */}
          <div className="border border-border/40 bg-background/30 p-6 backdrop-blur md:p-8">
            <div className="flex items-center gap-3 border-b border-border/40 pb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/45">
              <span className="size-1.5 bg-foreground/40" />
              {c.beforeLabel}
            </div>
            <ul className="mt-5 space-y-3 font-mono text-[12px] leading-relaxed text-foreground/55">
              {data.before.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-foreground/30">✕</span>
                  <span className="line-through decoration-foreground/20 decoration-1">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Con ARS */}
          <div className="relative border border-accent bg-secondary/40 p-6 backdrop-blur md:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 90% 10%, rgba(35,72,212,0.18), transparent 60%)",
              }}
            />
            <div className="relative flex items-center gap-3 border-b border-accent/40 pb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
              <span className="size-1.5 bg-accent" />
              {c.afterLabel}
            </div>
            <ul className="relative mt-5 space-y-3 font-mono text-[12px] leading-relaxed text-foreground/85">
              {data.after.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Result strip */}
        <div className="mt-10 grid gap-4 border-y border-border/40 py-6 md:grid-cols-3">
          <ResultMetric value="< 1s" label={c.m1} />
          <ResultMetric value="100%" label={c.m2} />
          <ResultMetric value="48h" label={c.m3} />
        </div>
      </div>
    </section>
  );
}

function ResultMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline justify-center gap-3 text-center md:flex-col md:items-center md:gap-1">
      <span className="font-heading text-2xl font-black tracking-tight text-accent md:text-3xl">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55">
        {label}
      </span>
    </div>
  );
}
