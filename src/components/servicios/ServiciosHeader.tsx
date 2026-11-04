import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "@/components/MobileMenu";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/servicios", label: "Servicios", marca: "✦" },
  { href: "/vision", label: "Visión IA", marca: "◉" },
  { href: "/plataforma", label: "Plataforma", marca: "◇" },
  { href: "/laboratorio", label: "Laboratorio", marca: "◎" },
  { href: "/proyectos", label: "Proyectos", marca: "▣" },
] as const;

/** Cabecera de /servicios y /servicios/[area]. */
export function ServiciosHeader({ enHub = false }: { enHub?: boolean }) {
  const link =
    "hidden items-center gap-2 whitespace-nowrap px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:text-white lg:flex";
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#020a18]/70 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-10 md:py-4">
        <Link href="/" aria-label="ARS Intelligence — inicio" className="flex shrink-0 items-center">
          <Image
            src="/images/logos/horizontal-blanco.png"
            alt="ARS Intelligence"
            width={1672}
            height={941}
            sizes="64px"
            priority
            className="h-8 w-auto md:h-9"
          />
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1 md:gap-2">
          {LINKS.map((l) => {
            const actual = l.href === "/servicios";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(link, actual && "text-white")}
                aria-current={actual && enHub ? "page" : undefined}
              >
                <span className="text-[#6b8aff]" aria-hidden="true">
                  {l.marca}
                </span>
                {l.label}
              </Link>
            );
          })}
          <a
            href="#cierre"
            className="bevel-btn ml-1 hidden items-center gap-2 whitespace-nowrap bg-white px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#020a18] transition-colors hover:bg-[#d5e0ff] sm:flex"
          >
            ▸ Solicitar demo
          </a>
          <MobileMenu
            links={[
              ...LINKS.map((l) => ({ label: l.label, href: l.href })),
              { label: "Inicio", href: "/" },
              { label: "Solicitar demo", href: "#cierre", primary: true },
            ]}
          />
        </nav>
      </div>
    </header>
  );
}
