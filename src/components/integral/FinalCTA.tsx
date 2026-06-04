"use client";

import Link from "next/link";
import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { useI18n } from "@/lib/i18n/context";

export function FinalCTA() {
  const { locale } = useI18n();
  const c =
    locale === "en"
      ? {
          eyebrow: "Final result",
          titleLine1: "Transform traditional security",
          titleLine2: "into an intelligent operation.",
          body: "ARS Intelligence connects human, technological and managerial operations to deliver more control, more evidence and better response times.",
          requestDemo: "Request a demo",
          talkToAdvisor: "Talk to an advisor",
          whatsappMessage: "Hi ARS Intelligence, I'd like to talk to an advisor.",
          seeModules: "See platform modules",
          metricDeploymentLabel: "Deployment",
          metricOperationLabel: "Operation",
          metricCoverageLabel: "Coverage",
          metricModelsLabel: "AI models",
        }
      : {
          eyebrow: "Resultado final",
          titleLine1: "Transforma la seguridad tradicional",
          titleLine2: "en una operación inteligente.",
          body: "ARS Intelligence permite conectar la operación humana, tecnológica y gerencial para ofrecer más control, más evidencia y mejores tiempos de respuesta.",
          requestDemo: "Solicitar demo",
          talkToAdvisor: "Hablar con un asesor",
          whatsappMessage: "Hola ARS Intelligence, quiero hablar con un asesor.",
          seeModules: "Ver módulos de la plataforma",
          metricDeploymentLabel: "Despliegue",
          metricOperationLabel: "Operación",
          metricCoverageLabel: "Cobertura",
          metricModelsLabel: "Modelos IA",
        };
  return (
    <section
      id="cierre"
      className="relative isolate overflow-hidden border-b border-border/40 px-6 py-24 md:px-10 md:py-32"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="brand-gradient absolute inset-0 opacity-90" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(34,211,238,0.28), transparent 55%)," +
              "radial-gradient(circle at 75% 70%, rgba(35,72,212,0.45), transparent 55%)",
          }}
        />
        <div className="grid-bg absolute inset-0 opacity-15" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center text-white">
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-white/70">
          <span className="mr-3 inline-block size-1.5 align-middle bg-white" />
          {c.eyebrow}
        </div>

        <h2 className="mt-6 font-heading text-4xl font-black uppercase leading-[1.05] tracking-tight md:text-6xl">
          {c.titleLine1}
          <br />
          <span className="text-white/85">{c.titleLine2}</span>
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-white/85 md:text-lg">
          {c.body}
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <a
            href={mailtoUrl()}
            className="bevel-btn inline-flex items-center gap-3 bg-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary shadow-2xl transition-all hover:bg-white/95 hover:shadow-white/20"
          >
            <span>▸</span>
            {c.requestDemo}
          </a>
          <a
            href={whatsappUrl(c.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="bevel-btn inline-flex items-center gap-3 border border-white/40 bg-white/10 px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/20"
          >
            <span className="text-white/80">◇</span>
            {c.talkToAdvisor}
          </a>
          <Link
            href="/laboratorio"
            className="bevel-btn inline-flex items-center gap-3 border border-white/40 px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/10"
          >
            <span className="text-white/80">◎</span>
            {c.seeModules}
          </Link>
        </div>

        {/* Trust strip */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 border-t border-white/20 pt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70 md:grid-cols-4">
          <TrustMetric label={c.metricDeploymentLabel} value="< 48h" />
          <TrustMetric label={c.metricOperationLabel} value="24/7" />
          <TrustMetric label={c.metricCoverageLabel} value="LATAM" />
          <TrustMetric label={c.metricModelsLabel} value="12+" />
        </div>
      </div>
    </section>
  );
}

function TrustMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-heading text-2xl font-black tracking-tight text-white md:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-[9px] tracking-[0.3em]">{label}</div>
    </div>
  );
}
