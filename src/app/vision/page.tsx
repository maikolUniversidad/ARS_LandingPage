"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { Scramble } from "@/components/Scramble";
import { CatalogoAnaliticas, FAMILIA_COLOR } from "@/components/vision/CatalogoAnaliticas";
import { DetalleAnalitica } from "@/components/vision/DetalleAnalitica";
import { EstadoPill } from "@/components/vision/EstadoPill";
import { EvidenciaReal } from "@/components/vision/EvidenciaReal";
import { Sim3D } from "@/components/vision/Sim3D";
import { analiticas, familias, PPTX_URL, PRESENTACION_URL, type EstadoSim } from "@/data/analiticas";
import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { useI18n } from "@/lib/i18n/context";

/**
 * /vision — Módulo de Visión: las 45 analíticas de video, cada una con su
 * simulación 3D y, cuando existe, el video real procesado por los modelos.
 *
 * El contenido del catálogo (nombres, descripciones, pasos) viene en español
 * de la presentación comercial; la interfaz alrededor sí cambia de idioma.
 */
export default function VisionPage() {
  const { locale } = useI18n();
  const [abierto, setAbierto] = useState<string | null>(null);
  const [faseHero, setFaseHero] = useState<EstadoSim>("vigila");
  const onFaseHero = useCallback((f: EstadoSim) => setFaseHero(f), []);
  const conVideo = analiticas.filter((a) => a.video).length;

  const c =
    locale === "en"
      ? {
          navPlatform: "Platform",
          navLab: "Lab",
          navProjects: "Projects",
          navHome: "Home",
          requestDemo: "Request a demo",
          anchorBadge: "Vision · Video analytics",
          anchorFamilies: "Families",
          anchorCatalog: "Catalog",
          anchorEvidence: "Real video",
          anchorDemo: "Request a demo",
          eyebrow: "Vision module · Video analytics",
          titleA: "Every analytic,",
          titleB: "seen working.",
          lead: "One simulation per analytic: the camera already installed, what it sees and the exact moment it alerts. Next to it, the real video whenever it already exists.",
          leadNote: "The catalog is in Spanish, as presented to our clients.",
          ctaCatalog: "See the catalog",
          ctaDeck: "Open the 3D presentation",
          heroCaption: "Live 3D simulation. Drag to rotate.",
          heroSim: "Heat map, live",
          stats: [
            { n: String(analiticas.length), t: "analytics" },
            { n: String(familias.length), t: "families" },
            { n: String(conVideo), t: "with real video" },
            { n: "0", t: "new equipment" },
          ],
          familiesEyebrow: "The full portfolio",
          familiesTitleA: "Four families,",
          familiesTitleB: "one single installation.",
          analytics: "analytics",
          catalog: {
            eyebrow: "Catalog",
            titleA: "Open any analytic",
            titleB: "and watch it alert.",
            todas: "All",
            conVideo: "With real video",
            videoReal: "Real video",
            abrir: "Open",
            resultado: (n: number) => `${n} analytics`,
          },
          evidence: {
            eyebrow: "Already proven",
            titleA: "Real video,",
            titleB: "processed by our models.",
            lead: "No mock-ups and no hand-drawn boxes: public or lab footage run through the same models that operate in production, with the alert strip switched on by the model's own event.",
            creditos:
              "Video credits: MEVA dataset cameras (mevadata.org, Kitware/IARPA, CC BY 4.0); Pexels and Mixkit (commercial licenses); own laboratory. All processed by our models, unedited.",
            ver: "Open",
          },
          detail: {
            cerrar: "Close",
            anterior: "Previous",
            siguiente: "Next",
            comoSeActiva: "How it triggers",
            videoReal: "Real video",
            imagenReal: "Real image",
            sinVideo: "This analytic is shown with its simulation only; the real video is still being produced.",
            simulacion: "3D simulation",
            segundo: "s",
            estado: "State",
          },
          closingEyebrow: "No new equipment",
          closingTitle: `${analiticas.length} analytics. The same cameras.`,
          closingBody: "Everything runs on the site's own server, over the circuit already installed. Each analytic is presented the same way: what it does, how it triggers and the video that proves it.",
          talkToAdvisor: "Talk to an advisor",
          whatsappMessage: "Hi ARS Intelligence, I'd like to see the video analytics module.",
          downloadDeck: "Download the PowerPoint",
          openDeck: "Open the full 3D presentation",
          footerTagline: "The simple way to make everything work.",
        }
      : {
          navPlatform: "Plataforma",
          navLab: "Laboratorio",
          navProjects: "Proyectos",
          navHome: "Inicio",
          requestDemo: "Solicitar demo",
          anchorBadge: "Visión · Analíticas de video",
          anchorFamilies: "Familias",
          anchorCatalog: "Catálogo",
          anchorEvidence: "Video real",
          anchorDemo: "Solicitar demo",
          eyebrow: "Módulo de Visión · Analíticas de video",
          titleA: "Cada analítica,",
          titleB: "vista funcionando.",
          lead: "Una simulación por analítica: la cámara que ya está instalada, lo que ve y el momento exacto en que avisa. Al lado, el video real cuando ya existe.",
          leadNote: "",
          ctaCatalog: "Ver el catálogo",
          ctaDeck: "Abrir la presentación 3D",
          heroCaption: "Simulación 3D en vivo. Arrastre para girar.",
          heroSim: "Mapa de calor, en vivo",
          stats: [
            { n: String(analiticas.length), t: "analíticas" },
            { n: String(familias.length), t: "familias" },
            { n: String(conVideo), t: "con video real" },
            { n: "0", t: "equipos nuevos" },
          ],
          familiesEyebrow: "El portafolio completo",
          familiesTitleA: "Cuatro familias,",
          familiesTitleB: "una sola instalación.",
          analytics: "analíticas",
          catalog: {
            eyebrow: "Catálogo",
            titleA: "Abra cualquier analítica",
            titleB: "y véala avisar.",
            todas: "Todas",
            conVideo: "Con video real",
            videoReal: "Video real",
            abrir: "Abrir",
            resultado: (n: number) => `${n} analíticas`,
          },
          evidence: {
            eyebrow: "Ya probado",
            titleA: "Video real,",
            titleB: "procesado por nuestros modelos.",
            lead: "Sin maquetas ni cuadros dibujados a mano: tomas públicas o de laboratorio pasadas por los mismos modelos que operan en producción, con la franja de alarma encendida por el evento real del modelo.",
            creditos:
              "Créditos de video: cámaras del dataset MEVA (mevadata.org, Kitware/IARPA, CC BY 4.0); Pexels y Mixkit (licencias de uso comercial); laboratorio propio. Todos procesados por nuestros modelos, sin retoques.",
            ver: "Abrir",
          },
          detail: {
            cerrar: "Cerrar",
            anterior: "Anterior",
            siguiente: "Siguiente",
            comoSeActiva: "Cómo se activa",
            videoReal: "Video real",
            imagenReal: "Imagen real",
            sinVideo: "Esta analítica se muestra solo con su simulación; el video real está en producción.",
            simulacion: "Simulación 3D",
            segundo: "s",
            estado: "Estado",
          },
          closingEyebrow: "Sin equipo nuevo",
          closingTitle: `${analiticas.length} analíticas. Las mismas cámaras.`,
          closingBody: "Todo corre en el propio servidor del sitio, sobre el circuito que ya está instalado. Cada analítica se presenta igual: qué hace, cómo se activa y el video que lo demuestra.",
          talkToAdvisor: "Hablar con un asesor",
          whatsappMessage: "Hola ARS Intelligence, quiero conocer el módulo de analíticas de video.",
          downloadDeck: "Descargar el PowerPoint",
          openDeck: "Abrir la presentación 3D completa",
          footerTagline: "La forma simple de hacer que todo funcione.",
        };

  const abrir = useCallback((id: string) => setAbierto(id), []);
  const cerrar = useCallback(() => setAbierto(null), []);

  return (
    <div className="relative bg-background text-foreground">
      {/* Fondo */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
        <div className="grid-bg absolute inset-0 opacity-25" />
        <div
          className="absolute -top-1/4 left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(35,72,212,0.18), transparent 70%)" }}
        />
      </div>

      {/* Cabecera */}
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
              href="/plataforma"
              className="bevel-btn group hidden items-center gap-2 border border-border bg-background/40 px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-foreground/80 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground md:flex"
            >
              <span className="text-accent">◇</span> {c.navPlatform}
            </Link>
            <Link
              href="/laboratorio"
              className="bevel-btn group hidden items-center gap-2 border border-border bg-background/40 px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-foreground/80 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground lg:flex"
            >
              <span className="text-accent">◎</span> {c.navLab}
            </Link>
            <Link
              href="/proyectos"
              className="bevel-btn group hidden items-center gap-2 border border-border bg-background/40 px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-foreground/80 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground lg:flex"
            >
              <span className="text-accent">▣</span> {c.navProjects}
            </Link>
            <a
              href="#cierre"
              className="bevel-btn hidden items-center gap-2 border border-border/60 bg-foreground px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-background sm:flex"
            >
              <span>▸</span> {c.requestDemo}
            </a>
            <MobileMenu
              links={[
                { label: c.navPlatform, href: "/plataforma" },
                { label: c.navLab, href: "/laboratorio" },
                { label: c.navProjects, href: "/proyectos" },
                { label: c.navHome, href: "/" },
                { label: c.requestDemo, href: "#cierre", primary: true },
              ]}
            />
          </nav>
        </div>
      </header>

      {/* Franja de anclas */}
      <div className="sticky top-[72px] z-40 hidden border-b border-border/30 bg-background/80 backdrop-blur md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55 md:px-10">
          <span className="flex items-center gap-2">
            <span className="size-1.5 bg-accent" />
            {c.anchorBadge}
          </span>
          <nav className="flex items-center gap-6">
            <a href="#familias" className="transition-colors hover:text-foreground">{c.anchorFamilies}</a>
            <a href="#catalogo" className="transition-colors hover:text-foreground">{c.anchorCatalog}</a>
            <a href="#evidencia" className="transition-colors hover:text-foreground">{c.anchorEvidence}</a>
            <a href="#cierre" className="transition-colors hover:text-foreground">{c.anchorDemo}</a>
          </nav>
        </div>
      </div>

      <main>
        {/* Portada: la simulación viva es la protagonista */}
        <section className="relative isolate overflow-hidden border-b border-border/40 px-6 pb-16 pt-32 md:px-10 md:pb-24 md:pt-44">
          <div className="absolute inset-0 -z-10">
            <div className="grid-bg absolute inset-0 opacity-30" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(35,72,212,0.35), transparent 55%)," +
                  "radial-gradient(circle at 80% 75%, rgba(214,171,76,0.10), transparent 55%)",
              }}
            />
          </div>

          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <div>
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/65">
                <span className="mr-3 inline-block size-1.5 align-middle bg-accent" />
                <Scramble text={c.eyebrow} />
              </div>
              <h1 className="mt-6 font-heading text-4xl font-black uppercase leading-[1.02] tracking-tight md:text-6xl lg:text-[4.6rem]">
                <Scramble as="span" text={c.titleA} durationMs={900} />
                <br />
                <span className="text-foreground/85">
                  <Scramble as="span" text={c.titleB} durationMs={900} delayMs={200} />
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/75 md:text-lg">{c.lead}</p>
              {c.leadNote && <p className="mt-2 font-serif text-sm italic text-foreground/50">{c.leadNote}</p>}

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#catalogo"
                  className="bevel-btn group inline-flex items-center gap-3 border border-border bg-foreground px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-background shadow-xl transition-opacity hover:opacity-90"
                >
                  <span>▸</span>
                  {c.ctaCatalog}
                </a>
                <a
                  href={PRESENTACION_URL}
                  target="_blank"
                  rel="noopener"
                  className="bevel-btn group inline-flex items-center gap-3 border border-border bg-background/40 px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-foreground backdrop-blur transition-colors hover:border-accent hover:bg-background/60"
                >
                  <span className="text-accent">⤢</span>
                  {c.ctaDeck}
                </a>
              </div>

              <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {c.stats.map((s) => (
                  <div key={s.t} className="border-l border-border/60 pl-4">
                    <dd className="font-heading text-3xl font-black tabular-nums tracking-tight md:text-4xl">{s.n}</dd>
                    <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50">{s.t}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <figure className="m-0">
              <div className="relative border border-border/60 bg-[#DDE3EE] p-1.5 shadow-[0_40px_80px_-40px_rgba(0,12,40,0.9)]">
                <Sim3D id="calor" pip={false} lazy={false} onFase={onFaseHero} className="aspect-[4/3] w-full" title={c.heroSim} />
              </div>
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50">{c.heroCaption}</span>
                <span className="flex flex-wrap gap-1.5">
                  {(["vigila", "detecta", "alerta", "ok"] as EstadoSim[]).map((e) => (
                    <EstadoPill key={e} estado={e} activo={faseHero === e} />
                  ))}
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Familias */}
        <section id="familias" className="relative border-b border-border/40 px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <header className="mb-10">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/55">
                <span className="mr-3 inline-block size-1.5 align-middle bg-accent" />
                {c.familiesEyebrow}
              </div>
              <h2 className="mt-4 max-w-3xl font-heading text-3xl font-black uppercase tracking-tight md:text-5xl">
                {c.familiesTitleA}
                <br />
                <span className="text-foreground/80">{c.familiesTitleB}</span>
              </h2>
            </header>
            <div className="grid gap-px bg-border/40 md:grid-cols-2 xl:grid-cols-4">
              {familias.map((f) => {
                const items = analiticas.filter((a) => a.familia === f.id);
                return (
                  <article key={f.id} className="flex flex-col bg-background p-6 md:p-8">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="size-3 rounded-full" style={{ background: FAMILIA_COLOR[f.id] }} aria-hidden />
                      <span className="font-heading text-4xl font-black tabular-nums tracking-tight text-foreground/90">{items.length}</span>
                    </div>
                    <h3 className="mt-4 font-heading text-xl font-black uppercase leading-tight tracking-tight">{f.nombre}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/65">{f.descripcion}</p>
                    <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-foreground/55">
                      {items.map((a) => (
                        <li key={a.id}>
                          <button type="button" onClick={() => abrir(a.id)} className="underline-offset-4 hover:text-foreground hover:underline">
                            {a.nombre}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <CatalogoAnaliticas onAbrir={abrir} textos={c.catalog} />

        <EvidenciaReal onAbrir={abrir} textos={c.evidence} />

        {/* Cierre */}
        <section id="cierre" className="relative isolate overflow-hidden border-b border-border/40 px-6 py-24 md:px-10 md:py-32">
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
              {c.closingEyebrow}
            </div>
            <h2 className="mt-6 font-heading text-3xl font-black uppercase leading-tight tracking-tight md:text-5xl">{c.closingTitle}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">{c.closingBody}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <a
                href={mailtoUrl("Demo del módulo de analíticas de video - ARS Intelligence")}
                className="bevel-btn inline-flex items-center gap-3 border border-white/30 bg-white px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#020a18] shadow-xl transition-opacity hover:opacity-90"
              >
                <span>▸</span> {c.requestDemo}
              </a>
              <a
                href={whatsappUrl(c.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="bevel-btn inline-flex items-center gap-3 border border-white/40 bg-white/10 px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <span>◎</span> {c.talkToAdvisor}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">
              <a href={PRESENTACION_URL} target="_blank" rel="noopener" className="underline-offset-4 hover:text-white hover:underline">
                {c.openDeck}
              </a>
              <a href={PPTX_URL} download className="underline-offset-4 hover:text-white hover:underline">
                {c.downloadDeck} (73 MB)
              </a>
            </div>
          </div>
        </section>

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
            <p className="font-serif text-sm italic text-foreground/55">{c.footerTagline}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40">© {new Date().getFullYear()} ARS Intelligence</p>
          </div>
        </footer>
      </main>

      <DetalleAnalitica id={abierto} onCerrar={cerrar} onIr={abrir} textos={c.detail} />
    </div>
  );
}
