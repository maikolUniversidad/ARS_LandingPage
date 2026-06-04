"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { IntegralSecurityHero } from "@/components/integral/IntegralSecurityHero";
import { OperationCycle } from "@/components/integral/OperationCycle";
import { ScreenshotShowcase } from "@/components/integral/ScreenshotShowcase";
import { FeatureGrid } from "@/components/integral/FeatureGrid";
import { OperationalArchitecture } from "@/components/integral/OperationalArchitecture";
import { IntegrationFlow } from "@/components/integral/IntegrationFlow";
import { UseCases } from "@/components/integral/UseCases";
import { BeforeAfterComparison } from "@/components/integral/BeforeAfterComparison";
import { Testimonials } from "@/components/integral/Testimonials";
import { ClientLogos } from "@/components/integral/ClientLogos";
import { FinalCTA } from "@/components/integral/FinalCTA";
import { RevealOnScroll } from "@/components/integral/RevealOnScroll";

/**
 * /plataforma — Módulo "Seguridad integral en una sola plataforma"
 *
 * Composición de bloques con scroll-reveal por sección.
 */
export default function PlataformaPage() {
  const { locale } = useI18n();
  const c =
    locale === "en"
      ? {
          navLab: "Lab",
          navProjects: "Projects",
          navHome: "Home",
          requestDemo: "Request a demo",
          anchorBadge: "Platform · Integral security",
          anchorFeatures: "Features",
          anchorScreens: "Screenshots",
          anchorCases: "Use cases",
          anchorDemo: "Request a demo",
          footerTagline: "The simple way to make everything work.",
        }
      : {
          navLab: "Laboratorio",
          navProjects: "Proyectos",
          navHome: "Inicio",
          requestDemo: "Solicitar demo",
          anchorBadge: "Plataforma · Seguridad integral",
          anchorFeatures: "Funcionalidades",
          anchorScreens: "Capturas",
          anchorCases: "Casos",
          anchorDemo: "Solicitar demo",
          footerTagline: "La forma simple de hacer que todo funcione.",
        };
  return (
    <div className="relative bg-background text-foreground">
      {/* Background decorative */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
        <div className="grid-bg absolute inset-0 opacity-25" />
        <div
          className="absolute -top-1/4 left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(35,72,212,0.18), transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4 md:px-10">
          <Link href="/" className="flex items-center gap-2">
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
          <nav className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/laboratorio"
              className="bevel-btn group hidden items-center gap-2 border border-border bg-background/40 px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-foreground/80 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground md:flex"
            >
              <span className="text-accent">◎</span> {c.navLab}
            </Link>
            <Link
              href="/proyectos"
              className="bevel-btn group hidden items-center gap-2 border border-border bg-background/40 px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-foreground/80 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground sm:flex"
            >
              <span className="text-accent">▣</span> {c.navProjects}
            </Link>
            <Link
              href="/"
              className="bevel-btn group hidden items-center gap-2 border border-border bg-background/40 px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-foreground/80 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground sm:flex"
            >
              <span className="text-accent">◀</span> {c.navHome}
            </Link>
            <a
              href="#cierre"
              className="bevel-btn hidden items-center gap-2 border border-border/60 bg-foreground px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-background sm:flex"
            >
              <span>▸</span> {c.requestDemo}
            </a>
            <MobileMenu
              links={[
                { label: c.navLab, href: "/laboratorio" },
                { label: c.navProjects, href: "/proyectos" },
                { label: c.navHome, href: "/" },
                { label: c.requestDemo, href: "#cierre", primary: true },
              ]}
            />
          </nav>
        </div>
      </header>

      {/* Anchor strip */}
      <div className="sticky top-[72px] z-40 hidden border-b border-border/30 bg-background/80 backdrop-blur md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55 md:px-10">
          <span className="flex items-center gap-2">
            <span className="size-1.5 bg-accent" />
            {c.anchorBadge}
          </span>
          <nav className="flex items-center gap-6">
            <a href="#funcionalidades" className="transition-colors hover:text-foreground">{c.anchorFeatures}</a>
            <a href="#capturas" className="transition-colors hover:text-foreground">{c.anchorScreens}</a>
            <a href="#casos" className="transition-colors hover:text-foreground">{c.anchorCases}</a>
            <a href="#cierre" className="transition-colors hover:text-foreground">{c.anchorDemo}</a>
          </nav>
        </div>
      </div>

      <main>
        <IntegralSecurityHero />

        <RevealOnScroll>
          <OperationCycle />
        </RevealOnScroll>

        <div id="capturas">
          <ScreenshotShowcase />
        </div>

        <RevealOnScroll>
          <FeatureGrid />
        </RevealOnScroll>

        <RevealOnScroll>
          <OperationalArchitecture />
        </RevealOnScroll>

        <RevealOnScroll>
          <IntegrationFlow />
        </RevealOnScroll>

        <div id="casos">
          <RevealOnScroll>
            <UseCases />
          </RevealOnScroll>
        </div>

        <RevealOnScroll>
          <BeforeAfterComparison />
        </RevealOnScroll>

        <Testimonials />

        <ClientLogos />

        <FinalCTA />

        <footer className="border-t border-border/40 bg-background py-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row md:px-10">
            <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.25em] text-foreground/70">
              <Image
                src="/images/logos/horizontal-blanco.png"
                alt="ARS Intelligence"
                width={120}
                height={28}
                className="h-7 w-auto opacity-80"
                style={{ height: "auto", width: "auto", maxHeight: "28px" }}
              />
              <span className="hidden sm:inline">arsintelligence.com</span>
            </div>
            <p className="font-serif text-sm italic text-foreground/55">
              {c.footerTagline}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40">
              © {new Date().getFullYear()} ARS Intelligence
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
