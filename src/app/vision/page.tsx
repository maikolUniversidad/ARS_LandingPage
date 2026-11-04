"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { Scramble } from "@/components/Scramble";
import { FAMILIA_COLOR, useAnaliticaElegida, VisorAnaliticas } from "@/components/vision/VisorAnaliticas";
import { analiticas, familias, PPTX_URL, PRESENTACION_URL } from "@/data/analiticas";
import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * /vision — Módulo de Visión: las 45 analíticas de video, lámina por lámina
 * (como la presentación comercial): la simulación 3D y la prueba real lado a
 * lado, qué hace y cómo se activa. Todo cabe en un par de pantallas; cambiar de
 * analítica es un clic o una flecha, sin recargar el motor 3D.
 *
 * El contenido del catálogo (nombres, descripciones, pasos) viene en español
 * de la presentación comercial; la interfaz alrededor sí cambia de idioma.
 */
export default function VisionPage() {
  const { locale } = useI18n();
  const [actual, elegir] = useAnaliticaElegida();
  const conVideo = analiticas.filter((a) => a.video?.src && !a.video.ia).length;

  const c =
    locale === "en"
      ? {
          navPlatform: "Platform",
          navLab: "Lab",
          navProjects: "Projects",
          navHome: "Home",
          requestDemo: "Request a demo",
          eyebrow: "Vision module · Video analytics",
          titleA: "Every analytic,",
          titleB: "seen working.",
          lead: "Each analytic is shown twice, side by side and in sync: the video and a 3D simulation seen from the same camera, where you can follow what the analytic sees and the exact second it alerts.",
          leadNote: "The catalog is in Spanish, as presented to our clients.",
          ctaDeck: "Open the 3D presentation",
          stats: [
            { n: String(analiticas.length), t: "analytics" },
            { n: String(familias.length), t: "families" },
            { n: String(conVideo), t: "with real video" },
            { n: "0", t: "new equipment" },
          ],
          visor: {
            simulacion: "3D simulation",
            videoReal: "Real video",
            imagenReal: "Real image",
            sinVideo: "Real video in production",
            sinVideoNota: "This analytic is shown with its simulation for now; the real footage processed by our models is being produced.",
            comoSeActiva: "How it triggers",
            anterior: "Previous",
            siguiente: "Next",
            girar: "Drag to rotate",
            videoIa: "AI-generated video",
            vistaCamara: "Camera view",
            vistaMaqueta: "3D model",
            mismaCamara: "Same camera, same second as the video",
            momento: "The event",
            reproducir: "Play",
            pausar: "Pause",
            fuente: "Source",
            analiticas: "analytics",
            de: "of",
          },
          indiceEyebrow: "The full portfolio",
          indiceTitleA: "All 45 at a glance.",
          indiceTitleB: "One click opens each one above.",
          creditos:
            "Video credits: MEVA dataset cameras (mevadata.org, Kitware/IARPA, CC BY 4.0); Pexels, Pixabay and Mixkit (commercial licenses); own laboratory. Clips marked “AI-generated video” are reference footage made with ElevenLabs, not model evidence. Each 3D simulation reproduces the camera, space and timing of its clip. Full list in /analiticas-3d/evidencia-publica/CREDITS.md.",
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
          eyebrow: "Módulo de Visión · Analíticas de video",
          titleA: "Cada analítica,",
          titleB: "vista funcionando.",
          lead: "Cada analítica se ve dos veces, lado a lado y al mismo tiempo: el video y una simulación 3D vista desde la misma cámara, donde se sigue lo que la analítica ve y el segundo exacto en que avisa.",
          leadNote: "",
          ctaDeck: "Abrir la presentación 3D",
          stats: [
            { n: String(analiticas.length), t: "analíticas" },
            { n: String(familias.length), t: "familias" },
            { n: String(conVideo), t: "con video real" },
            { n: "0", t: "equipos nuevos" },
          ],
          visor: {
            simulacion: "Simulación 3D",
            videoReal: "Video real",
            imagenReal: "Imagen real",
            sinVideo: "Video real en producción",
            sinVideoNota: "Esta analítica se muestra por ahora con su simulación; el video real procesado por nuestros modelos está en producción.",
            comoSeActiva: "Cómo se activa",
            anterior: "Anterior",
            siguiente: "Siguiente",
            girar: "Arrastre para girar",
            videoIa: "Video generado con IA",
            vistaCamara: "Vista cámara",
            vistaMaqueta: "Maqueta 3D",
            mismaCamara: "Misma cámara, mismo segundo que el video",
            momento: "El evento",
            reproducir: "Reproducir",
            pausar: "Pausar",
            fuente: "Fuente",
            analiticas: "analíticas",
            de: "de",
          },
          indiceEyebrow: "El portafolio completo",
          indiceTitleA: "Las 45 de un vistazo.",
          indiceTitleB: "Un clic abre cada una arriba.",
          creditos:
            "Créditos de video: cámaras del dataset MEVA (mevadata.org, Kitware/IARPA, CC BY 4.0); Pexels, Pixabay y Mixkit (licencias de uso comercial); laboratorio propio. Los clips rotulados «video generado con IA» son de referencia, hechos con ElevenLabs, no evidencia de un modelo. Cada simulación 3D reproduce la cámara, el espacio y los tiempos de su clip. Lista completa en /analiticas-3d/evidencia-publica/CREDITS.md.",
          closingEyebrow: "Sin equipo nuevo",
          closingTitle: `${analiticas.length} analíticas. Las mismas cámaras.`,
          closingBody: "Todo corre en el propio servidor del sitio, sobre el circuito que ya está instalado. Cada analítica se presenta igual: qué hace, cómo se activa y el video que lo demuestra.",
          talkToAdvisor: "Hablar con un asesor",
          whatsappMessage: "Hola ARS Intelligence, quiero conocer el módulo de analíticas de video.",
          downloadDeck: "Descargar el PowerPoint",
          openDeck: "Abrir la presentación 3D completa",
          footerTagline: "La forma simple de hacer que todo funcione.",
        };

  // Desde el índice: elige la analítica y sube al visor.
  const abrirEnVisor = useCallback(
    (id: string) => {
      elegir(id);
      document.getElementById("visor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [elegir],
  );

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
              href="/servicios"
              className="bevel-btn group hidden items-center gap-2 border border-border bg-background/40 px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-foreground/80 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground lg:flex"
            >
              <span className="text-accent">✦</span> {locale === "en" ? "Services" : "Servicios"}
            </Link>
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
                { label: locale === "en" ? "Services" : "Servicios", href: "/servicios" },
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

      <main>
        {/* Intro corta: el visor empieza enseguida */}
        <section className="relative isolate overflow-hidden px-4 pb-6 pt-28 sm:px-6 md:px-10 md:pb-8 md:pt-36">
          <div className="absolute inset-0 -z-10">
            <div className="grid-bg absolute inset-0 opacity-30" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 15% 10%, rgba(35,72,212,0.35), transparent 50%)," +
                  "radial-gradient(circle at 85% 90%, rgba(214,171,76,0.10), transparent 50%)",
              }}
            />
          </div>
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-12">
            <div>
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/65">
                <span className="mr-3 inline-block size-1.5 align-middle bg-accent" />
                <Scramble text={c.eyebrow} />
              </div>
              <h1 className="mt-4 font-heading text-4xl font-black uppercase leading-[1.02] tracking-tight md:text-6xl">
                {c.titleA}
                <br />
                <span className="text-foreground/85">{c.titleB}</span>
              </h1>
            </div>
            <div>
              <p className="max-w-xl text-base leading-relaxed text-foreground/75">{c.lead}</p>
              {c.leadNote && <p className="mt-2 font-serif text-sm italic text-foreground/50">{c.leadNote}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={PRESENTACION_URL}
                  target="_blank"
                  rel="noopener"
                  className="bevel-btn inline-flex items-center gap-3 border border-border bg-background/40 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foreground backdrop-blur transition-colors hover:border-accent hover:bg-background/60"
                >
                  <span className="text-accent">⤢</span>
                  {c.ctaDeck}
                </a>
                <dl className="flex gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                  {c.stats.slice(0, 3).map((s) => (
                    <div key={s.t}>
                      <dd className="font-heading text-2xl font-black tabular-nums tracking-tight text-foreground">{s.n}</dd>
                      <dt className="mt-0.5">{s.t}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Visor: una analítica por lámina, 3D y prueba real lado a lado */}
        <VisorAnaliticas actual={actual} onElegir={elegir} textos={c.visor} />

        {/* Índice de las 45 */}
        <section id="indice" className="relative border-b border-border/40 px-4 py-16 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/55">
                  <span className="mr-3 inline-block size-1.5 align-middle bg-accent" />
                  {c.indiceEyebrow}
                </div>
                <h2 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight md:text-5xl">
                  {c.indiceTitleA}
                  <br />
                  <span className="text-foreground/80">{c.indiceTitleB}</span>
                </h2>
              </div>
              <p className="max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-foreground/45">
                ▶ {c.visor.videoReal} · {conVideo}/{analiticas.length}
              </p>
            </header>
            <div className="grid gap-px bg-border/40 md:grid-cols-2 xl:grid-cols-4">
              {familias.map((f) => {
                const items = analiticas.filter((a) => a.familia === f.id);
                return (
                  <div key={f.id} className="flex flex-col bg-background p-5 md:p-6">
                    <h3 className="flex items-center gap-2.5 font-heading text-base font-black uppercase leading-tight tracking-tight">
                      <span className="size-2.5 rounded-full" style={{ background: FAMILIA_COLOR[f.id] }} aria-hidden />
                      {f.nombre}
                      <span className="ml-auto font-mono text-xs font-normal tabular-nums text-foreground/45">{items.length}</span>
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-foreground/55">{f.descripcion}</p>
                    <ol className="mt-4 flex flex-col">
                      {items.map((a) => {
                        const activa = a.id === actual.id;
                        return (
                          <li key={a.id}>
                            <button
                              type="button"
                              onClick={() => abrirEnVisor(a.id)}
                              aria-current={activa ? "true" : undefined}
                              className={cn(
                                "flex w-full items-center justify-between gap-3 border-b border-border/30 py-2 text-left text-sm transition-colors hover:text-foreground",
                                activa ? "text-foreground" : "text-foreground/70",
                              )}
                            >
                              <span className="flex items-center gap-2">
                                <span className="size-1.5 shrink-0" style={{ background: activa ? FAMILIA_COLOR[f.id] : "transparent", outline: activa ? undefined : "1px solid rgba(127,140,180,0.4)" }} aria-hidden />
                                {a.nombre}
                              </span>
                              {a.video && <span className="text-[9px] text-foreground/40" aria-label={a.video.ia ? c.visor.videoIa : c.visor.videoReal}>▶</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
            <p className="mt-8 max-w-3xl text-xs leading-relaxed text-foreground/45">{c.creditos}</p>
          </div>
        </section>

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
    </div>
  );
}
