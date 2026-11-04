"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { ESTADOS, PAISES, type ProyectoVista } from "@/data/proyectos";
import { whatsappUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { ESTADO_CLASES, claseArea } from "./estilos";

const ESTADO_MODULO: Record<string, string> = {
  piloto: "En piloto",
  proximamente: "Próximamente",
  "hoja-de-ruta": "Hoja de ruta",
};

/** Ficha completa de un proyecto, en un <dialog> modal (Esc y clic fuera cierran). */
export function FichaProyecto({ proyecto, onCerrar }: { proyecto: ProyectoVista | null; onCerrar: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (proyecto && !d.open) d.showModal();
    if (!proyecto && d.open) d.close();
  }, [proyecto]);

  const clicFuera = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) onCerrar();
  };

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={clicFuera}
      aria-labelledby="ficha-titulo"
      className="fixed inset-0 m-0 ml-auto h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-foreground backdrop:bg-[#020a18]/75 backdrop:backdrop-blur-sm open:flex md:w-[min(46rem,92vw)]"
    >
      {proyecto && <Contenido p={proyecto} onCerrar={onCerrar} />}
    </dialog>
  );
}

function Contenido({ p, onCerrar }: { p: ProyectoVista; onCerrar: () => void }) {
  const estado = ESTADOS[p.estado];
  const ec = ESTADO_CLASES[p.estado];
  const mensaje = `Hola, vi el caso «${p.titulo}» en la web de ARS y quiero algo similar para mi empresa.`;

  return (
    <article className="flex h-full w-full flex-col overflow-y-auto overscroll-contain border-l border-white/10 bg-[#04122b]">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#04122b]/95 px-5 py-3 backdrop-blur md:px-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0]">Ficha de proyecto</span>
        <button
          type="button"
          onClick={onCerrar}
          className="grid size-10 place-items-center border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white"
          aria-label="Cerrar ficha"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </header>

      <div className="px-5 pb-10 pt-6 md:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white", ec.caja)}>
            <span className={cn("size-1.5 rounded-full", ec.punto)} aria-hidden="true" />
            {estado.texto}
          </span>
          {!p.verificado && (
            <span className="border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
              Caso de referencia
            </span>
          )}
        </div>

        <h2 id="ficha-titulo" className="mt-5 text-balance font-heading text-3xl font-black leading-[1.05] tracking-tight text-white md:text-4xl">
          {p.titulo}
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-white/10 py-4 font-mono text-[10px] uppercase tracking-[0.2em] sm:grid-cols-4">
          <Dato t="Cliente" v={p.cliente} />
          <Dato t="Sector" v={p.sectorNombre} />
          <Dato t="Ubicación" v={`${p.ciudad.nombre} · ${PAISES[p.ciudad.pais]}`} />
          <Dato t="Escala" v={p.escala} />
        </dl>

        {p.portada && (
          <figure className="mt-6">
            <Image
              src={p.portada.src}
              alt={p.portada.alt}
              width={p.portada.ancho}
              height={p.portada.alto}
              sizes="(min-width: 768px) 46rem, 100vw"
              className="h-auto w-full border border-white/10"
            />
            <figcaption className="mt-2 text-xs text-white/50">Captura de la plataforma · {p.portada.pie}</figcaption>
          </figure>
        )}

        <Bloque titulo="El reto">{p.reto}</Bloque>
        <Bloque titulo="Cómo se resolvió">{p.solucion}</Bloque>

        <section className="mt-8">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0]">Lo que cambia</h3>
          <ul className="mt-3 space-y-2">
            {p.resultados.map((r) => (
              <li key={r} className="flex gap-3 text-[15px] leading-relaxed text-[#d5e0ff]">
                <span className="mt-2 size-1.5 shrink-0 bg-[#6b8aff]" aria-hidden="true" />
                {r}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0]">
            Módulos de la plataforma · {p.modulosVista.length}
          </h3>
          <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
            {p.modulosVista.map((m) => {
              const c = claseArea(m.areaId);
              return (
                <li key={m.id}>
                  <Link
                    href={m.href}
                    className="group flex items-start gap-3 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <span className={cn("mt-1.5 size-2 shrink-0", c.punto)} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-heading text-sm font-bold text-white">{m.nombre}</span>
                        {ESTADO_MODULO[m.estado] && (
                          <span className="border border-[#ffb547]/40 bg-[#ffb547]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#ffd59a]">
                            {ESTADO_MODULO[m.estado]}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-white/60">{m.frase}</span>
                      <span className={cn("mt-1 block font-mono text-[9.5px] uppercase tracking-[0.2em]", c.texto)}>{m.area}</span>
                    </span>
                    <ArrowUpRight className="mt-1 size-4 shrink-0 text-white/35 transition-colors group-hover:text-white" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {p.estado !== "operacion" && (
          <p className={cn("mt-6 border px-4 py-3 text-sm leading-relaxed text-white/80", ec.caja)}>
            <strong className="font-semibold text-white">{estado.texto}.</strong> {estado.detalle}
            {p.laboratorio === "robotica" && (
              <>
                {" "}
                Conozca el trabajo del{" "}
                <Link href="/laboratorio" className="underline underline-offset-4 hover:text-white">
                  laboratorio
                </Link>
                .
              </>
            )}
          </p>
        )}

        {!p.verificado && (
          <p className="mt-4 text-xs leading-relaxed text-white/45">
            Caso de referencia: describe una operación real de la plataforma con sus módulos, sin nombre del cliente ni cifras
            mientras no estén confirmadas.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/diagnostico"
            className="bevel-btn inline-flex items-center justify-center gap-3 bg-white px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#020a18] transition-colors hover:bg-[#d5e0ff]"
          >
            <span className="text-[#2348d4]" aria-hidden="true">▸</span> Hacer el diagnóstico
          </Link>
          <a
            href={whatsappUrl(mensaje)}
            target="_blank"
            rel="noopener noreferrer"
            className="bevel-btn inline-flex items-center justify-center gap-3 border border-white/25 bg-white/[0.04] px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-[#6b8aff] hover:bg-white/10"
          >
            <span className="text-[#6b8aff]" aria-hidden="true">▸</span> Quiero algo así
          </a>
          <Link
            href="/plataforma"
            className="inline-flex items-center justify-center gap-2 px-2 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
          >
            Ver la plataforma <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Dato({ t, v }: { t: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[#9eb0c0]/80">{t}</dt>
      <dd className="mt-1 normal-case tracking-normal text-[13px] leading-snug text-white">{v}</dd>
    </div>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: string }) {
  return (
    <section className="mt-8">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0]">{titulo}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-[#d5e0ff]">{children}</p>
    </section>
  );
}
