import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

/** Cabecera de /servicios y /servicios/[area]: navegación principal compartida. */
export function ServiciosHeader() {
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
        <SiteNav contacto="#cierre" />
      </div>
    </header>
  );
}
