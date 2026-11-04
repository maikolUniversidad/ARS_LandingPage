import type { Metadata } from "next";
import Link from "next/link";
import { AppWindow, Glasses, Globe, Monitor, Smartphone } from "lucide-react";
import { AREAS, PILARES, type Area, type EscenaId } from "@/data/servicios";
import { RevealOnScroll } from "@/components/integral/RevealOnScroll";
import { ArteArea } from "@/components/servicios/ArteArea";
import { BuscadorModulos } from "@/components/servicios/BuscadorModulos";
import { Cierre } from "@/components/servicios/Cierre";
import { EscuchaFocoHub } from "@/components/servicios/EscuchaFocoHub";
import { HubEscena } from "@/components/servicios/HubEscena";
import { ServiciosHeader } from "@/components/servicios/ServiciosHeader";
import { CtaLink, Eyebrow, Icono, PieServicios, rgba } from "@/components/servicios/ui";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Toda su empresa de seguridad en una sola plataforma: operación en campo, central de monitoreo, gestión humana, nómina y finanzas, conectadas y con IA.",
  alternates: { canonical: "/servicios" },
  openGraph: {
    title: "Servicios — ARS Intelligence",
    description: "Operación en campo, central de monitoreo, gestión humana, nómina y finanzas, conectadas y con IA.",
    url: "/servicios",
  },
};

/** «Un día en ARS»: cada paso enlaza a las áreas (por escena) que lo resuelven. */
const DIA: { n: string; titulo: string; detalle: string; escenas: EscenaId[] }[] = [
  {
    n: "01",
    titulo: "Programar",
    detalle: "Contratos, puestos y turnos quedan definidos una vez; el personal sabe dónde y cuándo estar.",
    escenas: ["humana", "centro", "finanzas"],
  },
  {
    n: "02",
    titulo: "Marcar y supervisar",
    detalle: "El vigilante marca con selfie y rostro, hace sus rondas y el supervisor pasa revista desde el teléfono.",
    escenas: ["campo", "centro", "formacion"],
  },
  {
    n: "03",
    titulo: "Vigilar y responder",
    detalle: "Las cámaras avisan, la central coordina por radio y chat, y cada evento queda con evidencia.",
    escenas: ["edificio", "comunicacion", "inmersiva"],
  },
  {
    n: "04",
    titulo: "Pagar y rendir cuentas",
    detalle: "Los turnos trabajados se vuelven nómina, factura y contabilidad, con trazabilidad para el cliente.",
    escenas: ["finanzas", "humana", "gobierno", "productividad"],
  },
];

const CANALES = [
  { nombre: "Web", detalle: "La operación completa desde el navegador", Icon: Globe },
  { nombre: "Android", detalle: "En campo: marcación, rondas, radio", Icon: Smartphone },
  { nombre: "PWA", detalle: "Instalable, sin tienda de apps", Icon: AppWindow },
  { nombre: "Escritorio", detalle: "Para la central y la consola", Icon: Monitor },
  { nombre: "Gafas VR", detalle: "La central en 3D, inmersiva", Icon: Glasses },
] as const;

function areasDe(escenas: EscenaId[]): Area[] {
  const vistas = new Set<string>();
  const out: Area[] = [];
  for (const e of escenas)
    for (const a of AREAS)
      if (a.escena === e && !vistas.has(a.id)) {
        vistas.add(a.id);
        out.push(a);
      }
  return out.slice(0, 3);
}

export default function ServiciosPage() {
  const totalModulos = AREAS.reduce((s, a) => s + a.modulos.length, 0);
  const indiceModulos: Record<string, string> = {};
  for (const a of AREAS) for (const m of a.modulos) indiceModulos[m.id] = a.id;

  return (
    <div className="relative bg-[#020a18] text-foreground">
      <ServiciosHeader />
      <EscuchaFocoHub indiceModulos={indiceModulos} />

      <main>
        {/* ───────── Hero ───────── */}
        <section aria-labelledby="hub-titulo" className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-16 pt-28 md:items-center md:pb-0">
          <div className="absolute inset-0 -z-10">
            <HubEscena />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020a18]/90 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-[#020a18]/95 via-[#020a18]/60 to-transparent md:block" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#020a18] via-[#020a18]/80 to-transparent md:h-40 md:via-transparent" />
          </div>

          <div className="pointer-events-none mx-auto w-full max-w-7xl px-4 md:px-10">
            <div className="max-w-3xl">
              <Eyebrow>ARS Intelligence · Servicios</Eyebrow>
              <h1
                id="hub-titulo"
                className="mt-5 text-balance font-heading text-[2.4rem] font-black leading-[1.02] tracking-tight text-white md:mt-7 md:text-7xl lg:text-[5.2rem]"
              >
                Toda su empresa de seguridad,{" "}
                <span className="font-serif font-normal italic text-[#b9c8ff]">en una sola plataforma</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#c5d2ee] md:mt-7 md:text-xl">
                Operación en campo, central de monitoreo, gestión humana, nómina y finanzas, conectadas y con IA.
              </p>
              <div className="pointer-events-auto mt-7 flex flex-wrap gap-3 md:mt-10">
                <CtaLink href="#areas" primary>
                  Explorar las {AREAS.length} áreas
                </CtaLink>
                <CtaLink href="#buscar">Buscar un módulo</CtaLink>
              </div>
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 md:mt-12">
                {[
                  { v: String(AREAS.length), t: AREAS.length === 1 ? "área" : "áreas" },
                  { v: String(totalModulos), t: "módulos" },
                  { v: String(CANALES.length), t: "canales" },
                  { v: "1", t: "sola plataforma" },
                ].map((s) => (
                  <div key={s.t} className="flex flex-col-reverse">
                    <dt className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9eb0c0]">{s.t}</dt>
                    <dd className="font-heading text-3xl font-black tabular-nums text-white md:text-4xl">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ───────── Un día en ARS ───────── */}
        <section id="dia" aria-labelledby="dia-titulo" className="relative scroll-mt-16 border-t border-white/10 py-24 md:py-32">
          <div className="grid-bg absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 md:px-10">
            <RevealOnScroll>
              <Eyebrow>Un día en ARS</Eyebrow>
              <h2 id="dia-titulo" className="mt-5 max-w-3xl text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                Del turno programado a la factura,{" "}
                <span className="font-serif font-normal italic text-[#b9c8ff]">sin cambiar de sistema.</span>
              </h2>
            </RevealOnScroll>
            <ol className="relative mt-14 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
              {DIA.map((paso, k) => {
                const areas = areasDe(paso.escenas);
                return (
                  <li key={paso.n} className="bg-[#020a18]">
                    <RevealOnScroll delay={k * 90} className="flex h-full flex-col p-6 md:p-8">
                      <span className="font-serif text-5xl italic text-[#6b8aff]/80">{paso.n}</span>
                      <h3 className="mt-5 text-xl font-black text-white">{paso.titulo}</h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-[#c5d2ee]">{paso.detalle}</p>
                      {areas.length > 0 && (
                        <ul className="mt-6 space-y-1.5">
                          {areas.map((a) => (
                            <li key={a.id}>
                              <Link
                                href={`/servicios/${a.id}`}
                                className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white"
                              >
                                <span style={{ color: a.color }}>▸</span>
                                {a.corto}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </RevealOnScroll>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ───────── Áreas ───────── */}
        <section id="areas" aria-labelledby="areas-titulo" className="relative scroll-mt-16 py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-4 md:px-10">
            <RevealOnScroll className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <Eyebrow>Las áreas</Eyebrow>
                <h2 id="areas-titulo" className="mt-5 max-w-3xl text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                  {AREAS.length} áreas, {totalModulos} módulos.{" "}
                  <span className="font-serif font-normal italic text-[#b9c8ff]">Una sola operación.</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-[#9eb0c0]">
                Cada área se recorre en 3D, módulo por módulo, con capturas y clips reales de la plataforma.
              </p>
            </RevealOnScroll>

            <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AREAS.map((a, k) => (
                <li key={a.id} className={k === 0 && AREAS.length > 3 ? "lg:col-span-2" : undefined}>
                  <RevealOnScroll delay={(k % 3) * 80} className="h-full">
                    <TarjetaArea area={a} grande={k === 0 && AREAS.length > 3} />
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── Por qué ARS ───────── */}
        {PILARES.length > 0 && (
          <section id="por-que" aria-labelledby="por-que-titulo" className="relative isolate scroll-mt-16 overflow-hidden border-y border-white/10 py-24 md:py-32">
            <div className="absolute inset-0 -z-10" aria-hidden="true">
              <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_0%,rgba(35,72,212,0.28),transparent_70%)]" />
              <div className="grid-bg absolute inset-0 opacity-25" />
            </div>
            <div className="mx-auto max-w-7xl px-4 md:px-10">
              <RevealOnScroll>
                <Eyebrow>Por qué ARS</Eyebrow>
                <h2 id="por-que-titulo" className="mt-5 max-w-3xl text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                  Hecho para empresas de seguridad,{" "}
                  <span className="font-serif font-normal italic text-[#b9c8ff]">por quien las opera.</span>
                </h2>
              </RevealOnScroll>
              <ul className="mt-14 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                {PILARES.map((p, k) => (
                  <li key={p.titulo} className="bg-[#020a18]/95">
                    <RevealOnScroll delay={(k % 3) * 80} className="h-full p-6 md:p-8">
                      <Icono nombre={p.icono} className="size-6 text-[#6b8aff]" />
                      <h3 className="mt-5 text-lg font-black text-white">{p.titulo}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#c5d2ee]">{p.detalle}</p>
                    </RevealOnScroll>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ───────── Buscador ───────── */}
        <section id="buscar" aria-labelledby="buscar-titulo" className="relative scroll-mt-16 py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-4 md:px-10">
            <RevealOnScroll>
              <Eyebrow>Buscar</Eyebrow>
              <h2 id="buscar-titulo" className="mt-5 text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                Dígalo con sus palabras.{" "}
                <span className="font-serif font-normal italic text-[#b9c8ff]">Lo llevamos al módulo.</span>
              </h2>
            </RevealOnScroll>
            <div className="mt-10">
              <BuscadorModulos />
            </div>
          </div>
        </section>

        {/* ───────── Canales ───────── */}
        <section aria-labelledby="canales-titulo" className="border-t border-white/10 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-10">
            <h2 id="canales-titulo" className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0]">
              Donde trabaja su gente
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-5">
              {CANALES.map(({ nombre, detalle, Icon }) => (
                <li key={nombre} className="flex flex-col gap-3 bg-[#020a18] p-5 md:p-6">
                  <Icon className="size-6 text-[#6b8aff]" aria-hidden="true" />
                  <span className="text-base font-black text-white">{nombre}</span>
                  <span className="text-[12.5px] leading-relaxed text-[#9eb0c0]">{detalle}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Cierre
          eyebrow="Demo guiada"
          titulo="Veamos su operación funcionando en ARS."
          cuerpo="En una demo de 30 minutos recorremos las áreas que más le importan, con sus sedes, sus turnos y sus cámaras."
          asunto="Solicitud de demo - Servicios ARS"
          mensajeWhatsapp="Hola ARS Intelligence, quiero una demo de la plataforma completa."
        />
      </main>
      <PieServicios />
    </div>
  );
}

function TarjetaArea({ area, grande }: { area: Area; grande: boolean }) {
  const n = area.modulos.length;
  return (
    <Link
      href={`/servicios/${area.id}`}
      className="group relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden border border-white/10 transition-colors duration-500 hover:border-white/30"
      style={{ boxShadow: `inset 0 1px 0 ${rgba(area.color, 0.25)}` }}
    >
      <ArteArea
        src={area.arte}
        alt=""
        color={area.color}
        letra={area.letra}
        sizes={grande ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
        imgClassName="opacity-55 transition-transform duration-[1.2s] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020a18] via-[#020a18]/75 to-[#020a18]/10" aria-hidden="true" />
      <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100" style={{ background: area.color }} aria-hidden="true" />

      <div className="relative p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <span
            className="grid size-11 place-items-center border font-serif text-2xl italic text-white"
            style={{ borderColor: rgba(area.color, 0.55), background: rgba(area.color, 0.12) }}
            aria-hidden="true"
          >
            {area.letra}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
            {n} {n === 1 ? "módulo" : "módulos"}
          </span>
        </div>
        <h3 className={grande ? "mt-6 text-3xl font-black text-white md:text-4xl" : "mt-6 text-2xl font-black text-white"}>{area.nombre}</h3>
        <p className="mt-2 font-serif text-[17px] italic leading-snug text-[#d5e0ff]/85">{area.frase}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {area.modulos.slice(0, 4).map((m) => (
            <li key={m.id} className="border border-white/12 bg-[#020a18]/50 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/75">
              {m.nombre}
            </li>
          ))}
          {n > 4 && <li className="px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/45">+{n - 4}</li>}
        </ul>
        <span className="mt-6 inline-flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/80 group-hover:text-white">
          <span style={{ color: area.color }}>▸</span> Recorrer en 3D
        </span>
      </div>
    </Link>
  );
}
