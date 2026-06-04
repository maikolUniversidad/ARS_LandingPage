"use client";

import { useI18n } from "@/lib/i18n/context";
import { RevealOnScroll } from "./RevealOnScroll";

/**
 * Strip de clientes / entidades.
 *
 * Logos descargados de Wikimedia Commons en /public/images/logos/clients/.
 * ALFA y Mundo Aventura no tienen logo de uso libre disponible → se muestran
 * como texto (fallback automático cuando `logo` no está).
 *
 * Cada logo se renderiza sobre un tile blanco para que los logos de color/oscuros
 * se vean bien sobre el fondo oscuro de la página.
 */

type Client = { name: string; logo?: string };

const BASE = "/images/logos/clients";

const clients: Client[] = [
  { name: "UNAD", logo: `${BASE}/unad.svg` },
  { name: "Universidad de La Sabana", logo: `${BASE}/unisabana.svg` },
  { name: "Universidad Militar Nueva Granada", logo: `${BASE}/umng.png` },
  { name: "Ministerio de Educación", logo: `${BASE}/mineducacion.svg` },
  { name: "Ministerio de Transporte", logo: `${BASE}/mintransporte.svg` },
  { name: "DANE", logo: `${BASE}/dane.svg` },
  { name: "DIAN", logo: `${BASE}/dian.svg` },
  { name: "Fiscalía General de la Nación", logo: `${BASE}/fiscalia.svg` },
  { name: "FNA · Fondo Nacional del Ahorro", logo: `${BASE}/fna.svg` },
  { name: "Ecopetrol", logo: `${BASE}/ecopetrol.png` },
  { name: "Repsol", logo: `${BASE}/repsol.svg` },
  { name: "TransMilenio", logo: `${BASE}/transmilenio.svg` },
  { name: "ALFA" },
  { name: "Corferias Bogotá", logo: `${BASE}/corferias.svg` },
  { name: "Mundo Aventura" },
];

export function ClientLogos() {
  const { locale } = useI18n();
  const heading =
    locale === "en"
      ? "Organizations and companies that trust us"
      : "Entidades y empresas que confían en nosotros";
  return (
    <section className="relative border-b border-border/40 px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <div className="text-center font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/45">
            {heading}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {clients.map((c) => (
              <li
                key={c.name}
                className="group flex aspect-[3/2] items-center justify-center rounded-md border border-border/40 bg-white px-5 py-5 transition-colors hover:border-accent/60"
              >
                {c.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.logo}
                    alt={c.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-12 w-auto max-w-full object-contain"
                  />
                ) : (
                  <span className="text-center font-heading text-sm font-bold uppercase leading-tight tracking-tight text-neutral-700">
                    {c.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  );
}
