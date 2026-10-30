"use client";

import { analiticas } from "@/data/analiticas";

type Textos = {
  eyebrow: string;
  titleA: string;
  titleB: string;
  lead: string;
  creditos: string;
  ver: string;
};

/** Las analíticas que ya tienen video o imagen real procesada por los modelos. */
export function EvidenciaReal({ onAbrir, textos }: { onAbrir: (id: string) => void; textos: Textos }) {
  const conVideo = analiticas.filter((a) => a.video);
  return (
    <section id="evidencia" className="relative border-b border-border/40 px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 max-w-3xl">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/55">
            <span className="mr-3 inline-block size-1.5 align-middle bg-accent" />
            {textos.eyebrow}
          </div>
          <h2 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight md:text-5xl">
            {textos.titleA}
            <br />
            <span className="text-foreground/80">{textos.titleB}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-foreground/70 md:text-lg">{textos.lead}</p>
        </header>

        <ul className="grid gap-px bg-border/40 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {conVideo.map((a) => (
            <li key={a.id} className="bg-background">
              <button
                type="button"
                onClick={() => onAbrir(a.id)}
                className="group relative block w-full text-left"
                aria-label={`${textos.ver}: ${a.nombre}`}
              >
                <span className="relative block aspect-video w-full overflow-hidden bg-[#0B1530]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.video!.poster ?? a.video!.img}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020a18]/90 to-transparent" />
                  <span className="absolute left-3 top-3 border border-white/30 bg-[#020a18]/60 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/85">
                    {a.video!.chapa}
                  </span>
                  <span className="absolute bottom-3 left-3 right-3 font-heading text-sm font-black uppercase leading-tight tracking-tight text-white">
                    {a.nombre}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-4xl text-xs leading-relaxed text-foreground/45">{textos.creditos}</p>
      </div>
    </section>
  );
}
