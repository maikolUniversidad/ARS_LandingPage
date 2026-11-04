import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CIUDADES, PAISES, proyectosVista } from "@/data/proyectos";
import { AREAS } from "@/data/servicios";
import { RevealOnScroll } from "@/components/integral/RevealOnScroll";
import { Cierre } from "@/components/servicios/Cierre";
import { CtaLink, Eyebrow, PieServicios } from "@/components/servicios/ui";
import { ExploradorProyectos } from "@/components/proyectos/ExploradorProyectos";
import { geometriaMapa } from "@/components/proyectos/geometria";
import { ProyectosHeader } from "@/components/proyectos/ProyectosHeader";

const DESCRIPCION =
  "Cómo opera ARS en Colombia y Perú: proyectos por sector y ciudad, con los módulos de la plataforma que usa cada uno, su estado y un mapa interactivo.";

export const metadata: Metadata = {
  title: "Proyectos",
  description: DESCRIPCION,
  alternates: { canonical: "/proyectos" },
  openGraph: {
    title: "Proyectos — ARS Intelligence",
    description: "Proyectos por sector y ciudad en Colombia y Perú, con los módulos de la plataforma que usa cada uno.",
    url: "/proyectos",
  },
};

const PASOS = [
  {
    n: "01",
    titulo: "Diagnóstico",
    detalle: "Una conversación de cinco minutos con la IA de ARS ubica sus dolores en la operación y propone los módulos que los resuelven.",
    href: "/diagnostico",
    cta: "Hacer el diagnóstico",
  },
  {
    n: "02",
    titulo: "Piloto en una sede",
    detalle: "Se activan los módulos elegidos en una sede o un grupo de puestos, con el ERP y las cámaras que la empresa ya tiene.",
    href: "/servicios",
    cta: "Ver los módulos",
  },
  {
    n: "03",
    titulo: "Operación y escala",
    detalle: "Lo que funciona se extiende al resto de sedes; cada evento queda trazado del puesto a la gerencia.",
    href: "/plataforma",
    cta: "Conocer la plataforma",
  },
] as const;

export default function ProyectosPage() {
  const proyectos = proyectosVista();
  const ciudades = CIUDADES.filter((c) => proyectos.some((p) => p.ciudadId === c.id));
  const geometria = geometriaMapa(ciudades);
  const idsAreas = new Set(proyectos.flatMap((p) => p.areas.map((a) => a.id)));
  const areas = AREAS.filter((a) => idsAreas.has(a.id)).map((a) => ({ id: a.id, corto: a.corto }));
  const paises = new Set(ciudades.map((c) => c.pais));
  const portadas = proyectos.flatMap((p) => (p.portada ? [{ ...p.portada, id: p.id }] : [])).slice(0, 3);

  // Mientras haya fichas sin confirmar, la cifra no se presenta como «proyectos» a secas.
  const sinConfirmar = proyectos.some((p) => !p.verificado);
  const totalModulos = new Set(proyectos.flatMap((p) => p.modulos)).size;

  const cifras = [
    { v: proyectos.length, t: sinConfirmar ? "casos de referencia" : "proyectos" },
    { v: totalModulos, t: "módulos en juego" },
    { v: paises.size, t: paises.size === 1 ? "país" : "países" },
    { v: idsAreas.size, t: `de ${AREAS.length} áreas` },
  ];

  return (
    <div className="relative bg-[#020a18] text-foreground">
      <ProyectosHeader />

      <main>
        {/* ───────── Hero ───────── */}
        <section aria-labelledby="proyectos-titulo" className="relative isolate overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36">
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="grid-bg absolute inset-0 opacity-30" />
            <div className="absolute -top-1/3 left-1/4 size-[70vh] rounded-full bg-[radial-gradient(closest-side,rgba(35,72,212,0.28),transparent_70%)]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020a18] to-transparent" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <Eyebrow>ARS Intelligence · Proyectos</Eyebrow>
              <h1
                id="proyectos-titulo"
                className="mt-5 text-balance font-heading text-[2.4rem] font-black leading-[1.02] tracking-tight text-white md:mt-7 md:text-6xl lg:text-7xl"
              >
                La plataforma,{" "}
                <span className="font-serif font-normal italic text-[#b9c8ff]">operando en terreno</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#c5d2ee] md:mt-7 md:text-xl">
                Cada proyecto combina módulos reales del catálogo según el tipo de cliente: universidades, entidades públicas,
                energía, transporte, recintos y empresas de seguridad en {[...paises].map((p) => PAISES[p]).join(" y ")}.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 md:mt-10">
                <CtaLink href="#mapa" primary>
                  Explorar el mapa
                </CtaLink>
                <CtaLink href="/diagnostico">Diagnóstico de su empresa</CtaLink>
              </div>
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 md:mt-12">
                {cifras.map((s) => (
                  <div key={s.t} className="flex flex-col-reverse">
                    <dt className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9eb0c0]">{s.t}</dt>
                    <dd className="font-heading text-3xl font-black tabular-nums text-white md:text-4xl">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Mosaico de capturas reales de la plataforma */}
            <div className="relative hidden h-[26rem] lg:block" aria-hidden="true">
              {portadas.map((c, i) => (
                <div
                  key={c.id}
                  className={
                    [
                      "absolute left-0 top-0 w-[78%] -rotate-3",
                      "absolute right-0 top-[30%] w-[72%] rotate-2",
                      "absolute bottom-0 left-[12%] w-[70%] -rotate-1",
                    ][i] + " overflow-hidden border border-white/15 bg-[#04122b] shadow-2xl shadow-black/60"
                  }
                >
                  <Image src={c.src} alt="" width={c.ancho} height={c.alto} sizes="28rem" className="h-auto w-full opacity-85" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Mapa + casos ───────── */}
        <section id="mapa" aria-labelledby="mapa-titulo" className="relative scroll-mt-20 border-t border-white/10 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-10">
            <RevealOnScroll>
              <Eyebrow>Mapa de proyectos</Eyebrow>
              <h2 id="mapa-titulo" className="mt-5 max-w-3xl text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                Filtre por área, país o estado{" "}
                <span className="font-serif font-normal italic text-[#b9c8ff]">y abra cada ficha.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/65">
                Cada ficha enlaza a los módulos que usa en el catálogo de servicios. Toque una ciudad en el mapa para ver solo sus
                proyectos.
              </p>
            </RevealOnScroll>
            <div className="mt-10 md:mt-14">
              <ExploradorProyectos proyectos={proyectos} ciudades={ciudades} areas={areas} geometria={geometria} />
            </div>
          </div>
        </section>

        {/* ───────── Cómo empieza un proyecto ───────── */}
        <section id="como-empieza" aria-labelledby="como-titulo" className="relative scroll-mt-20 border-t border-white/10 py-20 md:py-28">
          <div className="grid-bg absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 md:px-10">
            <RevealOnScroll>
              <Eyebrow>Cómo empieza un proyecto</Eyebrow>
              <h2 id="como-titulo" className="mt-5 max-w-3xl text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                De una conversación{" "}
                <span className="font-serif font-normal italic text-[#b9c8ff]">a toda la operación.</span>
              </h2>
            </RevealOnScroll>
            <ol className="mt-12 grid gap-5 md:grid-cols-3">
              {PASOS.map((p) => (
                <li key={p.n} className="flex flex-col border border-white/10 bg-[#04122b]/60 p-6">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-[#6b8aff]">{p.n}</span>
                  <h3 className="mt-4 font-heading text-xl font-black text-white">{p.titulo}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/65">{p.detalle}</p>
                  <Link
                    href={p.href}
                    className="mt-6 inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-white"
                  >
                    <span className="text-[#6b8aff]" aria-hidden="true">▸</span> {p.cta}
                  </Link>
                </li>
              ))}
            </ol>
            <p className="mt-10 max-w-3xl border-l-2 border-white/15 pl-4 text-xs leading-relaxed text-white/50">
              Sobre las fichas: describen operaciones de la plataforma con sus módulos reales, sin nombres de clientes ni cifras
              mientras no estén confirmadas. Las marcadas «Caso de referencia» están pendientes de validación con el cliente. El
              estado de cada proyecto sigue al catálogo: «Piloto» si usa módulos en piloto y «En desarrollo» para líneas de nuestro
              laboratorio.
            </p>
          </div>
        </section>

        <Cierre
          eyebrow="Su proyecto"
          titulo="¿Cómo se vería su operación en este mapa?"
          cuerpo="Cuéntenos cuántas sedes y puestos maneja y qué le duele hoy. Le mostramos los módulos que lo resuelven en una demo con su caso."
          asunto="Proyecto con ARS Intelligence"
          mensajeWhatsapp="Hola, vi los proyectos de ARS y quiero conversar sobre mi operación."
        />
      </main>

      <PieServicios />
    </div>
  );
}
