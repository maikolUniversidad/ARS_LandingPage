import Image from "next/image";

/**
 * Fondo estático (sin WebGL): se ve mientras carga el canvas, si el navegador
 * no soporta WebGL o si el contexto se pierde. Es una ilustración de la sede
 * con sus capas unidas por la traza (generada y optimizada en `public/home/`).
 */
export function StaticBackdrop({ note }: { note?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020a18]">
      <Image
        src="/home/hero-poster.webp"
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 100vw, 1px"
        className="hidden object-cover object-right md:block"
      />
      <Image src="/home/hero-poster-mobile.webp" alt="" fill priority sizes="(max-width: 767px) 100vw, 1px" className="object-cover object-top md:hidden" />
      <div className="absolute inset-0 bg-[#020a18]/25" />
      {note && (
        <div className="absolute right-4 top-20 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/40">{note}</div>
      )}
    </div>
  );
}
