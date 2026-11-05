"use client";

import type { ReactNode, RefObject } from "react";
import { ArrowRight, Check, Minus } from "lucide-react";
import type { AreaId, ModuloPropuesto, Propuesta } from "@/data/propuesta/tipos";
import { moduloPorId } from "@/data/servicios";
import { Icono, rgba } from "@/components/servicios/ui";
import { areaInfo } from "@/lib/diagnostico/catalogo";
import { cn } from "@/lib/utils";
import type { ControlEscena3D } from "./escena3d";
import { AnaliticasPropuesta } from "./AnaliticasPropuesta";
import { BloqueErp, titularErp } from "./BloqueErp";
import { CarruselModulos } from "./CarruselModulos";
import { GanttTrabajo, GraficoIndicadores } from "./Graficos";
import { MapaIntegracion } from "./MapaIntegracion";
import { ImagenRespaldo, rutasEscenario } from "./Medios";
import { Revelar } from "./Revelar";
import { Seccion3D } from "./Seccion3D";
import { SIN_CONTORNO, useVisible } from "./util";

const nombreModulo = (id: string) =>
  moduloPorId(id)?.modulo.nombre ??
  id
    .split("-")
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());

function Seccion({ eyebrow, titulo, children, id, fondo }: { eyebrow: string; titulo: string; children: ReactNode; id: string; fondo?: string[] }) {
  return (
    <section aria-labelledby={id} className="relative isolate border-t border-white/10 pt-8 md:pt-10">
      {fondo && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent)]">
          <ImagenRespaldo rutas={fondo} className="opacity-[0.13] saturate-50" sizes="(min-width: 1024px) 70vw, 100vw" />
        </div>
      )}
      <Revelar>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#6b8aff]">{eyebrow}</p>
        <h4 id={id} className="mt-2 font-heading text-2xl font-black leading-tight text-white md:text-3xl">
          {titulo}
        </h4>
      </Revelar>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function agrupar(modulos: ModuloPropuesto[]) {
  const m = new Map<AreaId, ModuloPropuesto[]>();
  for (const x of modulos) m.set(x.area, [...(m.get(x.area) ?? []), x]);
  return [...m.entries()];
}

function LineaDeTrabajo({ fases }: { fases: Propuesta["lineaDeTrabajo"] }) {
  const [ref, visible] = useVisible<HTMLOListElement>();
  return (
    <ol ref={ref} className="relative space-y-6 pl-8">
      <span aria-hidden="true" className="absolute bottom-2 left-[11px] top-2 w-px bg-white/10" />
      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-2 left-[11px] top-2 w-px origin-top bg-gradient-to-b from-[#6b8aff] via-[#2348d4] to-[#35e0a1] transition-transform duration-[1600ms] ease-out motion-reduce:transition-none",
          visible ? "scale-y-100" : "scale-y-0",
        )}
      />
      {fases.map((f, i) => (
        <Revelar as="li" key={i} retraso={i * 220} className="relative">
          <span aria-hidden="true" className="absolute -left-8 top-1 grid size-6 place-items-center border border-[#6b8aff] bg-[#020a18] font-mono text-[10px] font-bold text-white">
            {i + 1}
          </span>
          <div className="border border-white/10 bg-white/[0.03] p-4 md:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h5 className="text-[16px] font-bold text-white">{f.nombre}</h5>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#b9c8ff]">{f.duracion}</span>
            </div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#c5d2ee]/90">{f.objetivo}</p>
            {f.entregables.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {f.entregables.map((e) => (
                  <li key={e} className="flex gap-2 text-[13.5px] text-white/85">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-[#35e0a1]" aria-hidden="true" />
                    {e}
                  </li>
                ))}
              </ul>
            )}
            {f.modulos.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-1.5">
                {f.modulos.map((m) => {
                  const area = moduloPorId(m)?.area;
                  const color = area?.color ?? "#6b8aff";
                  return (
                    <span key={m} className="border px-2 py-0.5 text-[11.5px] text-white/85" style={{ borderColor: rgba(color, 0.4), background: rgba(color, 0.08) }}>
                      {nombreModulo(m)}
                    </span>
                  );
                })}
              </p>
            )}
          </div>
        </Revelar>
      ))}
    </ol>
  );
}

/** La propuesta animada: se revela por secciones a medida que la persona baja. */
export function VistaPropuesta({ propuesta: p, acciones, escenaRef }: { propuesta: Propuesta; acciones: ReactNode; escenaRef: RefObject<ControlEscena3D | null> }) {
  const area0 = p.modulos[0]?.area;
  const areaCampo = p.modulos.find((m) => m.area === "operacion-en-campo")?.area ?? area0;
  const areaCentral = p.modulos.find((m) => m.area === "centro-de-operaciones")?.area ?? area0;
  const fecha = (() => {
    try {
      return new Date(p.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return "";
    }
  })();

  return (
    <article aria-labelledby="propuesta-titular" className="overflow-hidden border border-white/15 bg-[#020a18]/60 p-4 backdrop-blur sm:p-6 md:p-10">
      {/* Portada con la imagen del escenario */}
      <header className="relative isolate -mx-4 -mt-4 px-4 pb-8 pt-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 md:-mx-10 md:-mt-10 md:px-10 md:pb-12 md:pt-10">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <ImagenRespaldo rutas={rutasEscenario(p.escenario, "portada", area0)} prioridad className="opacity-80 motion-safe:animate-in motion-safe:zoom-in-105 motion-safe:fade-in motion-safe:duration-[1600ms]" sizes="(min-width: 1280px) 1200px, 100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,10,24,0.35)_0%,rgba(2,10,24,0.7)_55%,#020a18_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(35,72,212,0.35),transparent_60%)]" />
        </div>
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#9eb0c0]">
          <span className="text-[#6b8aff]">Propuesta ARS · {p.empresa}</span>
          <span>
            {p.id}
            {fecha ? ` · ${fecha}` : ""}
          </span>
        </div>
        <h3 id="propuesta-titular" tabIndex={-1} style={SIN_CONTORNO} className="mt-5 font-heading text-3xl font-black leading-[1.08] tracking-tight text-white outline-none md:text-5xl">
          {p.titular}
        </h3>
        <p className="mt-5 max-w-3xl font-serif text-lg italic leading-relaxed text-[#b9c8ff] md:text-xl">{p.situacion}</p>
        {p.contacto.nombre && (
          <p className="mt-4 text-[13px] text-[#9eb0c0]">
            Preparada para {p.contacto.nombre}
            {p.contacto.cargo ? `, ${p.contacto.cargo}` : ""}
            {p.contacto.ciudad ? ` · ${p.contacto.ciudad}` : ""}
          </p>
        )}
        <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Ilustración generada con IA</p>
        </div>
      </header>

      <div className="mt-10 space-y-10 md:space-y-14">
        <Seccion id="prop-suple" eyebrow="Qué cambia" titulo="Lo que ARS asume en su operación">
          <div className="grid gap-4 @2xl:grid-cols-[1.4fr_1fr]">
            <Revelar className="border border-[#6b8aff]/30 bg-[#2348d4]/[0.08] p-4 md:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9fb4ff]">ARS suple</p>
              <ul className="mt-3 space-y-2.5">
                {p.arsSuple.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[14.5px] leading-relaxed text-white">
                    <ArrowRight className="mt-1 size-3.5 shrink-0 text-[#6b8aff]" aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
            </Revelar>
            <Revelar retraso={150} className="border border-white/10 bg-white/[0.03] p-4 md:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9eb0c0]">Convive mientras usted lo decida</p>
              <ul className="mt-3 space-y-2.5">
                {p.seQueda.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[14.5px] leading-relaxed text-[#c5d2ee]">
                    <Minus className="mt-1 size-3.5 shrink-0 text-[#9eb0c0]" aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
            </Revelar>
          </div>
        </Seccion>

        <Seccion id="prop-modulos" eyebrow={`${p.modulos.length} módulos`} titulo="Lo que encendemos para usted">
          <div className="grid gap-4 @2xl:grid-cols-2">
            {agrupar(p.modulos).map(([area, mods], i) => {
              const a = areaInfo(area);
              return (
                <Revelar key={area} retraso={(i % 2) * 120} className="h-full border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2.5" style={{ color: a.color }}>
                    <span className="grid size-8 place-items-center" style={{ background: rgba(a.color, 0.14) }}>
                      <Icono nombre={a.icono} className="size-4" />
                    </span>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.2em]">{a.nombre}</p>
                  </div>
                  <ul className="mt-3 space-y-3">
                    {mods.map((m) => (
                      <li key={m.modulo} className="border-l-2 pl-3" style={{ borderColor: rgba(a.color, 0.6) }}>
                        <a href={`/servicios/${area}#${m.modulo}`} className="text-[15px] font-bold text-white underline-offset-4 hover:underline">
                          {nombreModulo(m.modulo)}
                        </a>
                        <p className="mt-0.5 text-[13.5px] leading-relaxed text-[#c5d2ee]/85">{m.porQue}</p>
                      </li>
                    ))}
                  </ul>
                </Revelar>
              );
            })}
          </div>
        </Seccion>

        <Seccion id="prop-asi-se-ve" eyebrow="Así se ve en su operación" titulo="La plataforma real, módulo por módulo">
          <CarruselModulos modulos={p.modulos} />
        </Seccion>

        {p.analiticas && p.analiticas.length > 0 && (
          <Seccion id="prop-analiticas" eyebrow="Analíticas de video" titulo="Analíticas aplicadas a su operación">
            <AnaliticasPropuesta items={p.analiticas} />
          </Seccion>
        )}

        {p.indicadores && p.indicadores.length > 0 && (
          <Seccion id="prop-indicadores" eyebrow="Indicadores estimados" titulo="Lo que se mueve con ARS">
            <GraficoIndicadores indicadores={p.indicadores} />
          </Seccion>
        )}

        <Seccion id="prop-3d" eyebrow="Vista 3D" titulo="Su operación en 3D">
          <Seccion3D propuesta={p} escenaRef={escenaRef} />
        </Seccion>

        <Seccion id="prop-linea" eyebrow="Línea de trabajo" titulo="Cómo lo hacemos, por fases" fondo={rutasEscenario(p.escenario, "campo", areaCampo)}>
          <Revelar className="mb-8 border border-white/10 bg-[#020a18]/70 p-4 md:p-5">
            <GanttTrabajo fases={p.lineaDeTrabajo} />
          </Revelar>
          <LineaDeTrabajo fases={p.lineaDeTrabajo} />
        </Seccion>

        {p.estrategiaErp && (
          <Seccion id="prop-erp" eyebrow="Su ERP y sus sistemas" titulo={titularErp(p.estrategiaErp)}>
            <Revelar>
              <BloqueErp estrategia={p.estrategiaErp} />
            </Revelar>
          </Seccion>
        )}

        <Seccion id="prop-integracion" eyebrow="Integración" titulo="Sus sistemas, conectados con ARS" fondo={rutasEscenario(p.escenario, "central", areaCentral)}>
          <MapaIntegracion integraciones={p.integraciones} reportes={p.reportes} />
        </Seccion>

        <Seccion id="prop-reportes" eyebrow="Reportes" titulo="Lo que recibe, y para quién">
          <ul className="grid gap-3 @2xl:grid-cols-2">
            {p.reportes.map((r, i) => (
              <Revelar as="li" key={r.nombre} retraso={(i % 2) * 120} className="border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[15px] font-bold text-white">{r.nombre}</p>
                <p className="mt-2 flex flex-wrap gap-1.5">
                  <span className="border border-[#6b8aff]/40 bg-[#6b8aff]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#c9d5ff]">Para: {r.para}</span>
                  <span className="border border-[#35e0a1]/35 bg-[#35e0a1]/[0.08] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#a8f0d2]">{r.frecuencia}</span>
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#c5d2ee]/85">{r.contenido}</p>
              </Revelar>
            ))}
          </ul>
        </Seccion>

        {p.impacto.length > 0 && (
          <Seccion id="prop-impacto" eyebrow="Impacto estimado" titulo="Hoy, y con ARS">
            <ul className="grid gap-3 @3xl:grid-cols-3">
              {p.impacto.map((x, i) => (
                <Revelar as="li" key={x.indicador} retraso={i * 120} className="border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9eb0c0]">{x.indicador}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Hoy</p>
                      <p className="mt-1 text-[14px] leading-snug text-white/60">{x.hoy}</p>
                    </div>
                    <div className="border-l border-[#35e0a1]/30 pl-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#35e0a1]">Con ARS</p>
                      <p className="mt-1 text-[14px] font-bold leading-snug text-white">{x.conArs}</p>
                    </div>
                  </div>
                </Revelar>
              ))}
            </ul>
          </Seccion>
        )}

        <Seccion id="prop-pasos" eyebrow="Siguientes pasos" titulo="Lo que sigue">
          <ol className="space-y-2.5">
            {p.siguientesPasos.map((s, i) => (
              <Revelar as="li" key={s} retraso={i * 120} className="flex items-start gap-3 text-[15px] text-white">
                <span className="grid size-6 shrink-0 place-items-center bg-[#2348d4] font-mono text-[11px] font-bold">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </Revelar>
            ))}
          </ol>
          <div className="mt-8">{acciones}</div>
          <p className="mt-6 text-[12px] leading-relaxed text-[#9eb0c0]/80">{p.aviso}</p>
        </Seccion>
      </div>
    </article>
  );
}
