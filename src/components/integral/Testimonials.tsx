"use client";

import { useI18n } from "@/lib/i18n/context";
import { RevealOnScroll } from "./RevealOnScroll";

/**
 * Testimonios de clientes — placeholders editables.
 *
 * El array `testimonials` está pensado para que el usuario reemplace los
 * datos por testimonios reales (con autorización). Cada testimonio incluye:
 *  - quote (texto)        → traducible ({ es, en })
 *  - author (nombre)      → nombre propio, no se traduce
 *  - role (cargo)         → traducible ({ es, en })
 *  - company (empresa)    → no se traduce
 *  - vertical (categoría) → traducible ({ es, en })
 */

type Localized = { es: string; en: string };

type Testimonial = {
  quote: Localized;
  author: string;
  role: Localized;
  company: string;
  vertical: Localized;
};

const testimonials: Testimonial[] = [
  {
    quote: {
      es: "Mostrarle al cliente una sola plataforma donde ve cámaras, rondas y alertas en vivo cambió por completo nuestras propuestas comerciales.",
      en: "Showing clients a single platform where they see cameras, patrols and live alerts completely transformed our sales proposals.",
    },
    author: "Renzo Zegarra",
    role: { es: "Gerente Comercial", en: "Commercial Manager" },
    company: "ARS Intelligence",
    vertical: { es: "Comercial", en: "Commercial" },
  },
  {
    quote: {
      es: "Hoy podemos demostrar valor desde la primera reunión: el cliente ve la IA detectando en tiempo real, no una promesa.",
      en: "Today we can prove value from the very first meeting: the client sees AI detecting in real time, not just a promise.",
    },
    author: "Olga Barón",
    role: { es: "Directora Comercial", en: "Commercial Director" },
    company: "ARS Intelligence",
    vertical: { es: "Comercial", en: "Commercial" },
  },
  {
    quote: {
      es: "Activamos nuevos sitios en menos de 48 horas sobre la infraestructura que el cliente ya tiene. Eso acelera cada cierre.",
      en: "We bring new sites online in under 48 hours on the infrastructure the client already has. That accelerates every deal.",
    },
    author: "Neify Cristancho",
    role: { es: "Directora Comercial", en: "Commercial Director" },
    company: "ARS Intelligence",
    vertical: { es: "Comercial", en: "Commercial" },
  },
  {
    quote: {
      es: "Integramos edge y nube para que los modelos corran donde tienen que correr, sin reemplazar el hardware existente del cliente.",
      en: "We integrate edge and cloud so models run wherever they need to, without replacing the client's existing hardware.",
    },
    author: "Maikol Vergara",
    role: {
      es: "Gerente de Innovación y Tecnología",
      en: "Innovation & Technology Manager",
    },
    company: "ARS Intelligence",
    vertical: {
      es: "Innovación & Tecnología",
      en: "Innovation & Technology",
    },
  },
  {
    quote: {
      es: "Nuestros modelos detectan personas, vehículos, EPP y comportamientos en tiempo real, con la evidencia lista para la central de monitoreo.",
      en: "Our models detect people, vehicles, PPE and behaviors in real time, with evidence ready for the monitoring center.",
    },
    author: "Juan Lizcano",
    role: { es: "Director de IA", en: "AI Director" },
    company: "ARS Intelligence",
    vertical: {
      es: "Inteligencia Artificial",
      en: "Artificial Intelligence",
    },
  },
];

export function Testimonials() {
  const { locale } = useI18n();
  const c =
    locale === "en"
      ? {
          eyebrow: "The team behind the platform",
          titleLine1: "Real operations,",
          titleLine2: "measurable results.",
        }
      : {
          eyebrow: "El equipo detrás de la plataforma",
          titleLine1: "Operaciones reales,",
          titleLine2: "resultados medibles.",
        };
  return (
    <section className="relative border-b border-border/40 px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <header className="mb-12 max-w-3xl">
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/55">
              <span className="mr-3 inline-block size-1.5 align-middle bg-accent" />
              {c.eyebrow}
            </div>
            <h2 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight md:text-5xl">
              {c.titleLine1}
              <br />
              <span className="text-foreground/80">{c.titleLine2}</span>
            </h2>
          </header>
        </RevealOnScroll>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <RevealOnScroll key={i} delay={i * 100}>
              <article className="flex h-full flex-col border border-border/50 bg-background/40 p-6 backdrop-blur transition-colors hover:border-accent">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                  {t.vertical[locale]}
                </div>

                <blockquote className="mt-5 flex-1 text-base leading-relaxed text-foreground/85 md:text-[15px]">
                  <span className="mr-1 align-top text-2xl text-accent/60">“</span>
                  {t.quote[locale]}
                  <span className="ml-1 align-baseline text-2xl text-accent/60">”</span>
                </blockquote>

                <footer className="mt-6 border-t border-border/40 pt-4 font-mono text-[11px] uppercase tracking-[0.2em]">
                  <div className="font-bold text-foreground">{t.author}</div>
                  <div className="mt-0.5 text-foreground/55">{t.role[locale]}</div>
                  <div className="mt-0.5 text-foreground/45">{t.company}</div>
                </footer>
              </article>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
}
