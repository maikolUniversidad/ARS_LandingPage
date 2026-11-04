"use client";

import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * Carrusel continuo de clientes / entidades.
 *
 * Logos de Wikimedia Commons en /public/images/logos/clients/. ALFA y Mundo
 * Aventura no tienen logo de uso libre → se dibujan como marca tipográfica.
 *
 * Cada logo trae proporciones y aire interno distintos, así que `alto` ajusta su
 * tamaño para que todos pesen parecido. Van sin tarjeta, en monocromo claro
 * (escala de grises + inversión, que conserva el contraste interno de cada logo). Dos filas
 * en sentidos opuestos, bordes difuminados, pausa al pasar el mouse y, con
 * «reducir movimiento», una sola fila estática que se puede desplazar.
 */

type Client = { name: string; logo?: string; alto?: string };

const BASE = "/images/logos/clients";

const FILA_A: Client[] = [
  { name: "Ecopetrol", logo: `${BASE}/ecopetrol.png`, alto: "h-7 md:h-8" },
  { name: "UNAD", logo: `${BASE}/unad.svg`, alto: "h-12 md:h-14" },
  { name: "DIAN", logo: `${BASE}/dian.svg`, alto: "h-9 md:h-10" },
  { name: "Universidad de La Sabana", logo: `${BASE}/unisabana.svg`, alto: "h-12 md:h-14" },
  { name: "Fiscalía General de la Nación", logo: `${BASE}/fiscalia.svg`, alto: "h-9 md:h-10" },
  { name: "Ministerio de Educación", logo: `${BASE}/mineducacion.svg`, alto: "h-14 md:h-16" },
  { name: "TransMilenio", logo: `${BASE}/transmilenio.svg`, alto: "h-6 md:h-7" },
  { name: "ALFA" },
];

const FILA_B: Client[] = [
  { name: "Repsol", logo: `${BASE}/repsol.svg`, alto: "h-8 md:h-9" },
  { name: "Universidad Militar Nueva Granada", logo: `${BASE}/umng.png`, alto: "h-[4.5rem] md:h-20" },
  { name: "DANE", logo: `${BASE}/dane.svg`, alto: "h-10 md:h-11" },
  { name: "FNA · Fondo Nacional del Ahorro", logo: `${BASE}/fna.svg`, alto: "h-11 md:h-12" },
  { name: "Ministerio de Transporte", logo: `${BASE}/mintransporte.svg`, alto: "h-14 md:h-16" },
  { name: "Corferias Bogotá", logo: `${BASE}/corferias.svg`, alto: "h-11 md:h-12" },
  { name: "Mundo Aventura" },
];

function Tarjeta({ c, oculta }: { c: Client; oculta?: boolean }) {
  return (
    <li
      aria-hidden={oculta || undefined}
      className="group/logo relative mr-4 flex h-20 w-44 shrink-0 items-center justify-center px-4 md:mr-8 md:h-24 md:w-52"
    >
      {c.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.logo}
          alt={oculta ? "" : c.name}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={cn("w-auto max-w-[90%] object-contain opacity-55 [filter:grayscale(1)_invert(1)_brightness(1.2)] transition-opacity duration-300 group-hover/logo:opacity-100", c.alto)}
        />
      ) : (
        <span className="text-center font-heading text-lg font-extrabold uppercase leading-none tracking-[0.12em] text-white/55 transition-colors duration-300 group-hover/logo:text-white">
          {c.name}
        </span>
      )}
    </li>
  );
}

function Fila({ items, reversa }: { items: Client[]; reversa?: boolean }) {
  return (
    <div className="group/fila relative overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:overflow-x-auto">
      <ul
        className={cn(
          "flex w-max group-hover/fila:[animation-play-state:paused] motion-reduce:animate-none",
          reversa ? "animate-[logos-marquee_55s_linear_infinite_reverse]" : "animate-[logos-marquee_50s_linear_infinite]",
        )}
      >
        {items.map((c) => (
          <Tarjeta key={c.name} c={c} />
        ))}
        {/* Copia para el bucle sin costura (la animación recorre exactamente la mitad). */}
        {items.map((c) => (
          <Tarjeta key={`${c.name}-copia`} c={c} oculta />
        ))}
      </ul>
    </div>
  );
}

export function ClientLogos() {
  const { locale } = useI18n();
  const heading =
    locale === "en"
      ? "Organizations and companies that trust us"
      : "Entidades y empresas que confían en nosotros";
  return (
    <section className="relative overflow-hidden border-b border-border/40 py-16 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(35,72,212,0.18),transparent)]"
      />
      <p className="relative flex items-center justify-center gap-3 px-6 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/55">
        <span className="h-px w-8 bg-foreground/25" />
        {heading}
        <span className="h-px w-8 bg-foreground/25" />
      </p>
      <div className="relative mt-10 space-y-3 md:space-y-4">
        <Fila items={FILA_A} />
        <Fila items={FILA_B} reversa />
      </div>
    </section>
  );
}
