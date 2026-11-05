"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { useI18n } from "@/lib/i18n/context";
import { HeroPlataforma3D } from "@/components/plataforma/hero/HeroPlataforma3D";
import { ReelEnMovimiento } from "@/components/plataforma/movimiento/ReelEnMovimiento";
import { RecorridoModulos } from "@/components/plataforma/movimiento/RecorridoModulos";
import { ArquitectoPlataformaIA } from "@/components/plataforma/ia/ArquitectoPlataformaIA";
import { Pilares } from "@/components/plataforma/Pilares";
import { OperationCycle } from "@/components/integral/OperationCycle";
import { BeforeAfterComparison } from "@/components/integral/BeforeAfterComparison";
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
          navVision: "Vision",
          navProjects: "Projects",
          navHome: "Home",
          requestDemo: "Request a demo",
          anchorBadge: "Platform · Integral security",
          anchorFeatures: "Tour",
          anchorScreens: "In motion",
          anchorCases: "AI architect",
          anchorDemo: "Request a demo",
          footerTagline: "The simple way to make everything work.",
        }
      : {
          navLab: "Laboratorio",
          navVision: "Visión",
          navProjects: "Proyectos",
          navHome: "Inicio",
          requestDemo: "Solicitar demo",
          anchorBadge: "Plataforma · Seguridad integral",
          anchorFeatures: "Recorrido",
          anchorScreens: "En movimiento",
          anchorCases: "Arquitecto IA",
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

      {/* Anchor strip */}
      <div className="sticky top-[72px] z-40 hidden border-b border-border/30 bg-background/80 backdrop-blur md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55 md:px-10">
          <span className="flex items-center gap-2">
            <span className="size-1.5 bg-accent" />
            {c.anchorBadge}
          </span>
          <nav className="flex items-center gap-6">
            <a href="#en-movimiento" className="transition-colors hover:text-foreground">{c.anchorScreens}</a>
            <a href="#recorrido" className="transition-colors hover:text-foreground">{c.anchorFeatures}</a>
            <a href="#arquitecto-ia" className="flex items-center gap-1.5 text-accent transition-colors hover:text-foreground">
              <span>✦</span> {c.anchorCases}
            </a>
            <a href="#cierre" className="transition-colors hover:text-foreground">{c.anchorDemo}</a>
          </nav>
        </div>
      </div>

      <main className="[&_section[id]]:scroll-mt-28">
        <div data-narracion="plataforma/hero">
          <HeroPlataforma3D />
        </div>

        <div data-narracion="plataforma/en-movimiento">
          <ReelEnMovimiento />
        </div>

        <div data-narracion="plataforma/recorrido">
          <RecorridoModulos />
        </div>

        <div data-narracion="plataforma/arquitecto-ia">
          <ArquitectoPlataformaIA />
        </div>

        <div data-narracion="plataforma/ciclo">
          <RevealOnScroll>
            <OperationCycle />
          </RevealOnScroll>
        </div>

        <div data-narracion="plataforma/pilares">
          <Pilares />
        </div>

        <div data-narracion="plataforma/antes-despues">
          <RevealOnScroll>
            <BeforeAfterComparison />
          </RevealOnScroll>
        </div>

        <ClientLogos />

        <div data-narracion="plataforma/cierre">
          <FinalCTA />
        </div>

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
