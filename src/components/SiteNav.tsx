"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { useI18n } from "@/lib/i18n/context";
import { CONTACTO_PORTADA, NAV_PRINCIPAL, RUTA_DIAGNOSTICO, esRutaActual } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

type Props = {
  /** Ancla o ruta de contacto de la página (p. ej. "#cierre"). Por defecto, el formulario de la portada. */
  contacto?: string;
  /** Muestra el selector ES/EN (solo en páginas traducidas). */
  idioma?: boolean;
};

/**
 * Navegación principal compartida: enlaces de escritorio, CTA de diagnóstico,
 * contacto y menú móvil con exactamente los mismos destinos.
 * Va dentro del `<header>` de cada página (que define su fondo y posición).
 */
export function SiteNav({ contacto = CONTACTO_PORTADA, idioma = false }: Props) {
  const { t } = useI18n();
  const ruta = usePathname();
  const enDiagnostico = esRutaActual(RUTA_DIAGNOSTICO, ruta);

  const link =
    "hidden items-center gap-2 whitespace-nowrap px-2 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:text-white lg:flex xl:px-3 xl:tracking-[0.2em]";

  return (
    <nav aria-label="Principal" className="flex items-center gap-1 md:gap-2">
      {NAV_PRINCIPAL.map((l) => {
        const actual = esRutaActual(l.href, ruta);
        return (
          <Link key={l.href} href={l.href} className={cn(link, actual && "text-white")} aria-current={actual ? "page" : undefined}>
            <span className="hidden text-[#6b8aff] xl:inline" aria-hidden="true">
              {l.marca}
            </span>
            {t.nav[l.clave]}
          </Link>
        );
      })}
      {idioma && <LanguageSwitcher />}
      <a
        href={contacto}
        className="hidden whitespace-nowrap px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:text-white xl:flex"
      >
        {t.nav.contact}
      </a>
      {!enDiagnostico && (
        <Link
          href={RUTA_DIAGNOSTICO}
          className="bevel-btn ml-1 hidden shrink-0 items-center gap-2 whitespace-nowrap bg-white px-4 py-2.5 xl:px-5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#020a18] transition-colors hover:bg-[#d5e0ff] sm:flex"
        >
          ▸ {t.nav.diagnostic}
        </Link>
      )}
      <MobileMenu
        links={[
          { label: t.nav.home, href: "/" },
          ...NAV_PRINCIPAL.map((l) => ({ label: t.nav[l.clave], href: l.href })),
          { label: t.nav.contact, href: contacto },
          { label: t.nav.diagnostic, href: RUTA_DIAGNOSTICO, primary: true },
        ]}
      />
    </nav>
  );
}
