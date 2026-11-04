import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { RevealOnScroll } from "@/components/integral/RevealOnScroll";
import { rgba } from "./ui";

type Props = {
  eyebrow: string;
  titulo: string;
  acento?: string;
  cuerpo: string;
  asunto: string;
  mensajeWhatsapp: string;
};

/** CTA de cierre (#cierre): demo por WhatsApp o correo. */
export function Cierre({ eyebrow, titulo, acento = "#6b8aff", cuerpo, asunto, mensajeWhatsapp }: Props) {
  return (
    <section id="cierre" aria-labelledby="cierre-titulo" className="relative isolate scroll-mt-16 overflow-hidden bg-[#020a18] py-24 md:py-36">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="brand-gradient absolute inset-0 opacity-70" />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(70% 90% at 15% 10%, ${rgba(acento, 0.4)}, transparent 60%)` }}
        />
        <div className="grid-bg absolute inset-0 opacity-25" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020a18] to-transparent" />
      </div>
      <RevealOnScroll className="mx-auto max-w-5xl px-4 text-center md:px-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/70">{eyebrow}</div>
        <h2 id="cierre-titulo" className="mx-auto mt-6 max-w-4xl text-balance font-heading text-4xl font-black leading-[1.03] tracking-tight text-white md:text-6xl">
          {titulo}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">{cuerpo}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappUrl(mensajeWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="bevel-btn inline-flex items-center gap-3 bg-white px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#142664] transition-colors hover:bg-[#d5e0ff]"
          >
            ▸ Agendar demo por WhatsApp
          </a>
          <a
            href={mailtoUrl(asunto)}
            className="bevel-btn inline-flex items-center gap-3 border border-white/40 px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
          >
            ◇ Escribir por correo
          </a>
        </div>
      </RevealOnScroll>
    </section>
  );
}
