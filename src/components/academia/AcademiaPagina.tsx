import type { ReactNode } from "react";
import { Ban, CheckCircle2, CircleDashed, Clock, Lock, ShieldCheck, Users } from "lucide-react";
import { CtaLink, Eyebrow } from "@/components/servicios/ui";
import {
  AMBAR,
  AZUL,
  CIERRE,
  CURSO,
  ESTADO,
  ESTADO_MODULO,
  HERO,
  LEGAL,
  MODULO_1,
  MODULO_2,
  MODULO_3,
  MODULO_4,
  OPERATIVOS,
  PERSONAJES,
  PLATAFORMA,
  POR_QUE,
  VERDE,
  VIOLETA,
  type Estado,
} from "@/data/academia/contenido";
import { mailtoUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { BotonAudio } from "./audio";
import { DemoExesposo } from "./DemoExesposo";
import { FlujoPlataforma } from "./FlujoPlataforma";
import { QuizPuedeNoPuede } from "./QuizPuedeNoPuede";
import { RanuraEscena } from "./RanuraEscena";

/* ───────────────────────────── Piezas comunes ───────────────────────────── */

const ENVOLTURA = "mx-auto w-full max-w-7xl px-4 md:px-10";

function Encabezado({
  eyebrow,
  titulo,
  intro,
  tint = VIOLETA,
  id,
}: {
  eyebrow: string;
  titulo: ReactNode;
  intro?: ReactNode;
  tint?: string;
  id: string;
}) {
  return (
    <header className="max-w-3xl">
      <Eyebrow tint={tint}>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-4 text-balance font-heading text-3xl font-black leading-[1.05] tracking-tight text-white md:text-5xl">
        {titulo}
      </h2>
      {intro && <p className="mt-5 text-[15px] leading-relaxed text-[#c5d2ee] md:text-lg">{intro}</p>}
    </header>
  );
}

function Subtitulo({ children }: { children: ReactNode }) {
  return <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/55 md:text-[11px]">{children}</h3>;
}

function EstadoChip({ estado }: { estado: Estado }) {
  return (
    <span
      className="inline-flex max-w-full items-start gap-2 border px-2.5 py-1 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.16em] text-white/85"
      style={{ borderColor: `${estado.color}66`, background: `${estado.color}14` }}
    >
      <span className="mt-[0.45em] inline-block size-1.5 shrink-0 rounded-full" style={{ background: estado.color }} aria-hidden="true" />
      {estado.texto}
    </span>
  );
}

/** Barra apilada de una calificación de 100 puntos. */
function BarraPuntos({ partes }: { partes: readonly { nombre: string; puntos: number; color: string; nota?: string }[] }) {
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden border border-white/10" aria-hidden="true">
        {partes.map((p) => (
          <div key={p.nombre} style={{ width: `${p.puntos}%`, background: p.color }} />
        ))}
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {partes.map((p) => (
          <li key={p.nombre} className="flex items-start gap-3 text-[14px] text-[#dbe4f7]">
            <span className="mt-1.5 inline-block size-2 shrink-0" style={{ background: p.color }} aria-hidden="true" />
            <span>
              <span className="font-heading font-black tabular-nums text-white">{p.puntos}</span> · {p.nombre}
              {p.nota && <span className="block text-[12.5px] text-white/55">{p.nota}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Cabecera de cada bloque de módulo. */
function CabeceraModulo({
  n,
  nombre,
  sub,
  resumen,
  idTitulo,
}: {
  n: 1 | 2 | 3 | 4;
  nombre: string;
  sub: string;
  resumen: string;
  idTitulo: string;
}) {
  const m = CURSO.modulos[n - 1];
  return (
    <header>
      <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#d9c6ff] md:text-[11px]">
        <span className="font-heading text-4xl font-black leading-none tracking-tight text-[#b78bff] md:text-5xl">{n}</span>
        <span>Módulo {n} · {m.nombre}</span>
      </div>
      <h2 id={idTitulo} className="mt-4 text-balance font-heading text-3xl font-black leading-[1.05] tracking-tight text-white md:text-5xl">
        «{nombre}»
      </h2>
      <p className="mt-2 font-serif text-lg italic text-[#d5e0ff]/85 md:text-xl">{sub}</p>
      <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-[#c5d2ee] md:text-lg">{resumen}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <EstadoChip estado={ESTADO_MODULO[n]} />
        <span className="inline-flex items-center gap-2 border border-white/12 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/70">
          Nota mínima {m.nota}
        </span>
      </div>
    </header>
  );
}

const SECCION = "relative scroll-mt-20 border-t border-white/10 py-20 md:py-28";

/* ───────────────────────────── Página ───────────────────────────── */

export function AcademiaPagina() {
  return (
    <main id="contenido" className="overflow-x-clip">
      {/* 1 · Hero */}
      <section data-narracion="academia/hero" aria-labelledby="academia-titulo" className="relative isolate overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="grid-bg absolute inset-0 opacity-20" />
          <div
            className="absolute -top-1/4 left-1/2 h-[90vh] w-[90vh] max-w-[160vw] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(183,139,255,0.22), transparent 70%)" }}
          />
        </div>
        <div className={cn(ENVOLTURA, "grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]")}>
          <div>
            <Eyebrow tint={VIOLETA}>{HERO.eyebrow}</Eyebrow>
            <h1 id="academia-titulo" className="mt-5 text-balance font-heading text-[2.3rem] font-black leading-[1.02] tracking-tight text-white sm:text-5xl xl:text-6xl">
              {HERO.titulo}{" "}
              <span className="bg-gradient-to-r from-[#d9c6ff] via-[#b78bff] to-[#6b8aff] bg-clip-text text-transparent">{HERO.tituloAcento}</span>
            </h1>
            <p className="mt-6 max-w-[60ch] text-[15px] leading-relaxed text-[#c5d2ee] md:text-lg">{HERO.subtitulo}</p>
            <ul className="mt-6 space-y-2">
              {HERO.frases.map((f) => (
                <li key={f} className="flex gap-3 font-serif text-[17px] italic leading-snug text-white md:text-lg">
                  <span className="mt-2 inline-block h-px w-5 shrink-0 bg-[#b78bff]" aria-hidden="true" />
                  «{f}»
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="#curso" primary>
                Ver el curso
              </CtaLink>
              <CtaLink href="#modulo-3">Probar la demo de la garita</CtaLink>
            </div>
          </div>
          <RanuraEscena foco="portal" className="lg:aspect-[4/3.4]" />
        </div>

        {/* Todo lo que practica */}
        <div className={cn(ENVOLTURA, "mt-14 md:mt-20")}>
          <Subtitulo>Con las gafas puestas, el vigilante se capacita en todo</Subtitulo>
          <ul className="mt-4 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {HERO.practica.map((p, i) => (
              <li key={p.titulo} className="bg-[#030c1f] p-4 md:p-5">
                <span className="font-mono text-[10px] font-bold tabular-nums text-[#b78bff]">0{i + 1}</span>
                <p className="mt-1.5 font-heading text-lg font-black leading-tight text-white">{p.titulo}</p>
                <p className="mt-1 text-[13.5px] leading-snug text-[#c5d2ee]">{p.detalle}</p>
              </li>
            ))}
          </ul>
          <ul className="mt-4 flex flex-wrap gap-2">
            {HERO.sellos.map((s) => (
              <li key={s} className="border border-white/12 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/75">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2 · Por qué en VR */}
      <section id="por-que" data-narracion="academia/por-que" aria-labelledby="por-que-titulo" className={SECCION}>
        <div className={ENVOLTURA}>
          <Encabezado id="por-que-titulo" eyebrow="Por qué en VR" titulo={POR_QUE.titulo} intro={POR_QUE.intro} />
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {POR_QUE.razones.map((r, i) => (
              <li key={r.titulo} className="border border-white/10 bg-[#050d22]/70 p-5 md:p-6">
                <span className="font-heading text-3xl font-black text-[#b78bff]/80">0{i + 1}</span>
                <h3 className="mt-3 font-heading text-xl font-black leading-tight text-white">{r.titulo}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#c5d2ee]">{r.texto}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-[75ch] border-l-2 border-[#6b8aff] pl-4 text-[14px] leading-relaxed text-white/65">{POR_QUE.marca}</p>

          <div className="mt-16">
            <Subtitulo>Para quién</Subtitulo>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {POR_QUE.paraQuien.map((p) => (
                <li key={p.persona} className="flex flex-col border border-white/10 bg-[#050d22]/70 p-4">
                  <Users className="size-5 text-[#6b8aff]" aria-hidden="true" />
                  <p className="mt-3 font-heading text-[17px] font-black leading-tight text-white">{p.persona}</p>
                  <p className="mt-2 flex-1 text-[13.5px] leading-snug text-[#c5d2ee]">{p.hace}</p>
                  <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: p.gafas ? VIOLETA : AZUL }}>
                    {p.gafas ? "◇ Con las gafas" : "◇ Desde la web del ARS"}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-[75ch] text-[13.5px] leading-relaxed text-white/55">{POR_QUE.organizacion}</p>
          </div>
        </div>
      </section>

      {/* 3 · El curso */}
      <section id="curso" data-narracion="academia/curso" aria-labelledby="curso-titulo" className={SECCION}>
        <div className={ENVOLTURA}>
          <Encabezado id="curso-titulo" eyebrow="El curso" titulo={CURSO.titulo} intro={CURSO.portal} />

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            {/* Árbol */}
            <div>
              <Subtitulo>Cuatro módulos</Subtitulo>
              <div className="mt-4 border border-white/10 bg-[#050d22]/70 p-4 md:p-6">
                <p className="font-heading text-lg font-black text-white">Academia ARS · Vigilante</p>
                <ol className="mt-3 space-y-3 border-l border-[#b78bff]/40 pl-5">
                  {CURSO.modulos.map((m) => (
                    <li key={m.n} className="relative">
                      <span className="absolute -left-5 top-3 h-px w-4 bg-[#b78bff]/40" aria-hidden="true" />
                      <a
                        href={`#${m.ancla}`}
                        className="group block border border-transparent p-2 transition-colors hover:border-[#b78bff]/40 hover:bg-white/[0.03]"
                      >
                        <span className="flex items-baseline gap-3">
                          <span className="font-mono text-[10px] font-bold text-[#b78bff]">M{m.n}</span>
                          <span className="font-heading text-[17px] font-black leading-tight text-white group-hover:text-[#d9c6ff]">{m.nombre}</span>
                        </span>
                        <span className="mt-1 block pl-8 text-[13.5px] text-[#c5d2ee]">→ {m.actividad}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="mt-4 flex gap-3 text-[14.5px] leading-relaxed text-[#dbe4f7]">
                <Lock className="mt-1 size-4 shrink-0 text-[#b78bff]" aria-hidden="true" />
                <span>
                  <strong className="text-white">Orden.</strong> {CURSO.orden}
                </span>
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/60">{CURSO.asigna}</p>
            </div>

            {/* Ciclos y notas */}
            <div className="space-y-8">
              <div>
                <Subtitulo>Ciclos</Subtitulo>
                <ol className="mt-4 space-y-2">
                  {CURSO.ciclos.map((c) => (
                    <li key={c.nombre} className="border border-white/10 bg-[#050d22]/70 p-3.5">
                      <p className="font-heading font-black text-white">{c.nombre}</p>
                      <p className="mt-1 text-[13.5px] leading-snug text-[#c5d2ee]">{c.detalle}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-[12.5px] text-white/50">{CURSO.ciclosFuente}</p>
              </div>
              <div>
                <Subtitulo>Notas mínimas</Subtitulo>
                <dl className="mt-4 divide-y divide-white/10 border border-white/10">
                  {CURSO.modulos.map((m) => (
                    <div key={m.n} className="grid gap-1 p-3.5 sm:grid-cols-[auto_1fr] sm:gap-4">
                      <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#b78bff]">
                        M{m.n}
                        <span className="block font-sans text-[12.5px] font-normal normal-case tracking-normal text-white/55">{m.area}</span>
                      </dt>
                      <dd className="text-[14px] text-white sm:text-right">{m.nota}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-[12.5px] text-white/50">{CURSO.notasFuente}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.1 · Módulo 1 */}
      <section id="modulo-1" data-narracion="academia/modulo-1" aria-labelledby="m1-titulo" className={SECCION}>
        <div className={ENVOLTURA}>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <CabeceraModulo n={1} nombre={MODULO_1.nombre} sub={MODULO_1.sub} resumen={MODULO_1.resumen} idTitulo="m1-titulo" />
              <p className="mt-6 text-[14px] text-white/60">
                <strong className="text-white/85">Lugar:</strong> {MODULO_1.lugar}. <strong className="text-white/85">Guía:</strong> {MODULO_1.guia}.
              </p>
            </div>
            <RanuraEscena foco="dotacion" className="lg:sticky lg:top-24" />
          </div>

          <div className="mt-12">
            <Subtitulo>Las estaciones</Subtitulo>
            <ol className="mt-4 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
              {MODULO_1.estaciones.map((e, i) => (
                <li key={e.nombre} className="bg-[#030c1f] p-4 md:p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[10px] font-bold text-[#b78bff]">{i + 1}</span>
                    {"tiempo" in e && e.tiempo && (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                        <Clock className="size-3" aria-hidden="true" />
                        {e.tiempo}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-heading text-[17px] font-black leading-tight text-white">{e.nombre}</p>
                  <p className="mt-1.5 text-[13.5px] leading-snug text-[#c5d2ee]">{e.hace}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-14">
            <h3 className="font-heading text-2xl font-black tracking-tight text-white md:text-3xl">¿Puede o no puede? Pruébese usted</h3>
            <p className="mt-2 max-w-[65ch] text-[15px] leading-relaxed text-[#c5d2ee]">
              Las 12 tarjetas de la estación. En la gafa, el alumno las lanza a dos canastas; aquí, elija y vea la explicación.
            </p>
            <div className="mt-6">
              <QuizPuedeNoPuede />
            </div>
          </div>
        </div>
      </section>

      {/* 4.2 · Módulo 2 */}
      <section id="modulo-2" data-narracion="academia/modulo-2" aria-labelledby="m2-titulo" className={SECCION}>
        <div className={ENVOLTURA}>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <CabeceraModulo n={2} nombre={MODULO_2.nombre} sub={MODULO_2.sub} resumen={MODULO_2.resumen} idTitulo="m2-titulo" />
              <p className="mt-6 text-[14px] text-white/60">{MODULO_2.lugar}</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                {MODULO_2.armas.map((a) => (
                  <li key={a.nombre} className="border border-white/10 bg-[#050d22]/70 p-3">
                    <p className="font-heading text-[15px] font-black leading-tight text-white">{a.nombre}</p>
                    <p className="mt-1 text-[12.5px] leading-snug text-[#c5d2ee]">{a.detalle}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12.5px] text-white/50">{MODULO_2.armasNota}</p>
              <p className="mt-5 text-[14.5px] leading-relaxed text-[#c5d2ee]">{MODULO_2.realismo}</p>
            </div>
            <RanuraEscena foco="poligono" className="lg:sticky lg:top-24" />
          </div>

          {/* Guardián */}
          <div className="mt-14">
            <h3 className="flex items-center gap-3 font-heading text-2xl font-black tracking-tight text-white md:text-3xl">
              <ShieldCheck className="size-7 text-[#35e0a1]" aria-hidden="true" />
              El guardián de seguridad vigila todo el tiempo
            </h3>
            <ul className="mt-5 divide-y divide-white/10 border border-white/10">
              {MODULO_2.guardian.map((g) => (
                <li key={g.infraccion} className="grid gap-2 p-4 md:grid-cols-[1fr_1.2fr_auto] md:items-center md:gap-6">
                  <p className="text-[14.5px] leading-snug text-white">{g.infraccion}</p>
                  <p className="text-[14px] leading-snug text-[#ffd19a]">{g.consecuencia}</p>
                  <div className="md:justify-self-end">
                    {g.audio ? <BotonAudio id={g.audio} etiqueta={`Óscar: ${g.consecuencia}`} tint={AMBAR} compacto /> : <span className="hidden md:inline-block md:w-[1px]" />}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Lecciones */}
          <div className="mt-14">
            <Subtitulo>Las 10 lecciones</Subtitulo>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {MODULO_2.lecciones.map((l) => (
                <li key={l.id} className={cn("border bg-[#050d22]/70 p-4", "jugable" in l && l.jugable ? "border-[#35e0a1]/45" : "border-white/10")}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading text-2xl font-black text-[#b78bff]">{l.id}</span>
                    {"jugable" in l && l.jugable && (
                      <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#9df2cf]">Jugable hoy</span>
                    )}
                  </div>
                  <p className="mt-2 font-heading text-[15px] font-black leading-tight text-white">{l.nombre}</p>
                  <p className="mt-1.5 text-[13px] leading-snug text-[#c5d2ee]">{l.aprende}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[12.5px] text-white/50">«Jugable hoy»: P3 completa y la serie 2 de P7. Las demás lecciones están diseñadas.</p>
          </div>

          {/* Calificación */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <Subtitulo>Calificación del polígono · 100 puntos</Subtitulo>
              <div className="mt-5">
                <BarraPuntos partes={MODULO_2.calificacion} />
              </div>
            </div>
            <div className="border-l-2 border-[#35e0a1] pl-6">
              <p className="font-serif text-2xl italic leading-snug text-white md:text-3xl">«{MODULO_2.lema}»</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#9df2cf]">{MODULO_2.lemaNota}</p>
              <p className="mt-5 text-[14.5px] leading-relaxed text-[#c5d2ee]">
                <strong className="text-white">Lo que mide el tiro:</strong> {MODULO_2.mide}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.3 · Módulo 3 */}
      <section id="modulo-3" data-narracion="academia/modulo-3" aria-labelledby="m3-titulo" className={SECCION}>
        <div className={ENVOLTURA}>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <CabeceraModulo
                n={3}
                nombre={MODULO_3.nombre}
                sub={MODULO_3.sub}
                resumen="Doce situaciones reales desde la garita (calle, conjunto y fábrica), en cuatro niveles. Gana el que previene, reporta y protege la vida, casi siempre sin desenfundar."
                idTitulo="m3-titulo"
              />
              <aside className="mt-6 border border-[#b78bff]/35 bg-[#b78bff]/[0.08] p-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#d9c6ff]">La idea que tiene que quedar</p>
                <p className="mt-2 font-serif text-lg italic leading-snug text-white">{MODULO_3.idea}</p>
              </aside>
            </div>
            <RanuraEscena foco="garita" className="lg:sticky lg:top-24" />
          </div>

          {/* Acciones */}
          <div className="mt-14">
            <Subtitulo>Lo que puede hacer el vigilante dentro del escenario</Subtitulo>
            <ol className="mt-4 flex flex-wrap gap-2">
              {MODULO_3.acciones.map((a, i) => {
                const ultima = i === MODULO_3.acciones.length - 1;
                return (
                  <li
                    key={a}
                    className={cn(
                      "border px-3 py-2 text-[13.5px] leading-snug",
                      ultima ? "border-[#ff6b7a]/45 bg-[#ff6b7a]/[0.07] text-[#ffd0d5]" : "border-white/12 bg-white/[0.03] text-[#dbe4f7]"
                    )}
                  >
                    {a}
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-[13px] text-white/55">{MODULO_3.accionesNota}</p>
          </div>

          {/* 12 escenarios */}
          <div className="mt-14">
            <Subtitulo>Los 12 escenarios · 3 contextos × 4</Subtitulo>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {MODULO_3.contextos.map((c) => (
                <div key={c.letra} className="border border-white/10 bg-[#050d22]/70">
                  <div className="border-b border-white/10 p-4">
                    <p className="font-heading text-xl font-black text-white">
                      <span className="text-[#b78bff]">{c.letra}</span> · {c.nombre}
                    </p>
                    <p className="mt-1 text-[13px] text-white/55">{c.lugar}</p>
                  </div>
                  <ul className="divide-y divide-white/[0.06]">
                    {c.escenarios.map((e) => (
                      <li key={e.id} className={cn("flex gap-3 p-3.5", e.id === "B1" && "bg-[#b78bff]/[0.1]")}>
                        <span className="font-mono text-[11px] font-bold text-[#b78bff]">{e.id}</span>
                        <span className="text-[14px] leading-snug text-white">
                          «{e.nombre}»
                          {e.detalle && <span className="block text-[12.5px] text-[#c5d2ee]/80">{e.detalle}</span>}
                          {e.id === "B1" && <a href="#demo-b1" className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#d9c6ff] underline-offset-4 hover:underline">▸ Pruébelo abajo</a>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Demo B1 */}
          <div id="demo-b1" className="mt-14 scroll-mt-24">
            <DemoExesposo />
          </div>

          {/* Niveles y rúbrica */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <Subtitulo>Cuatro niveles de dificultad</Subtitulo>
              <ol className="mt-4 space-y-2">
                {MODULO_3.niveles.map((n) => (
                  <li key={n.n} className="flex gap-4 border border-white/10 bg-[#050d22]/70 p-3.5">
                    <span className="font-heading text-2xl font-black leading-none text-[#b78bff]">{n.n}</span>
                    <span>
                      <span className="font-heading font-black text-white">{n.nombre}</span>
                      <span className="mt-1 block text-[13.5px] leading-snug text-[#c5d2ee]">{n.cambia}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <Subtitulo>Calificación · 100 puntos en seis dimensiones</Subtitulo>
              <ul className="mt-4 space-y-2">
                {MODULO_3.rubrica.map((r) => (
                  <li key={r.nombre} className="border border-white/10 bg-[#050d22]/70 p-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 shrink-0 font-heading text-xl font-black tabular-nums text-white">{r.peso}</span>
                      <div className="h-1.5 flex-1 bg-white/[0.06]" aria-hidden="true">
                        <div className="h-full" style={{ width: `${(r.peso / 30) * 100}%`, background: r.color }} />
                      </div>
                    </div>
                    <p className="mt-2 font-heading font-black text-white">{r.nombre}</p>
                    <p className="mt-1 text-[13.5px] leading-snug text-[#c5d2ee]">{r.mira}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14.5px] leading-relaxed text-white">
                <strong>{MODULO_3.aprueba}</strong> <span className="text-[#c5d2ee]">{MODULO_3.repaso}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.4 · Módulo 4 */}
      <section id="modulo-4" data-narracion="academia/modulo-4" aria-labelledby="m4-titulo" className={SECCION}>
        <div className={ENVOLTURA}>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <CabeceraModulo n={4} nombre={MODULO_4.nombre} sub={MODULO_4.sub} resumen={MODULO_4.resumen} idTitulo="m4-titulo" />
              <ul className="mt-6 flex flex-wrap gap-2">
                {MODULO_4.puestos.map((p) => (
                  <li key={p} className="border border-white/12 bg-white/[0.03] px-3 py-2 text-[13.5px] text-[#dbe4f7]">
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12.5px] text-white/50">{MODULO_4.puestosNota}</p>
            </div>
            <RanuraEscena foco="porteria" className="lg:sticky lg:top-24" />
          </div>

          {/* Línea de tiempo */}
          <div className="mt-14">
            <Subtitulo>Las franjas del turno · 05:45 a 18:00</Subtitulo>
            <ol className="relative mt-6 grid gap-0 border-l border-[#b78bff]/40 pl-6 lg:grid-cols-6 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-6">
              {MODULO_4.franjas.map((f) => (
                <li key={f.hora} className="relative pb-6 lg:pb-0 lg:pr-4">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[29px] top-1 size-2.5 rounded-full border-2 border-[#020a18] bg-[#b78bff] lg:-top-[31px] lg:left-0"
                  />
                  <p className="font-mono text-[11px] font-bold tabular-nums text-[#d9c6ff]">{f.hora}</p>
                  <p className="mt-1 font-heading text-[16px] font-black text-white">{f.nombre}</p>
                  <p className="mt-1.5 text-[13.5px] leading-snug text-[#c5d2ee]">{f.pasa}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <p className="text-[15px] leading-relaxed text-[#c5d2ee]">{MODULO_4.cola}</p>
            <div>
              <Subtitulo>Calificación del turno · 100 puntos</Subtitulo>
              <div className="mt-5">
                <BarraPuntos partes={MODULO_4.calificacion} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · Personajes */}
      <section id="personajes" data-narracion="academia/personajes" aria-labelledby="personajes-titulo" className={SECCION}>
        <div className={ENVOLTURA}>
          <Encabezado id="personajes-titulo" eyebrow="Personajes e IA" titulo={PERSONAJES.titulo} intro={PERSONAJES.intro} />
          <p className="mt-4 font-serif text-xl italic text-white">«{PERSONAJES.frase}»</p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PERSONAJES.elenco.map((p) => (
              <li key={p.nombre} className="flex flex-col border border-white/10 bg-[#050d22]/70 p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: p.fijo ? VIOLETA : AZUL }}>
                  {p.fijo ? "Elenco fijo" : "Elenco rotativo"}
                </p>
                <p className="mt-2 font-heading text-lg font-black leading-tight text-white">{p.nombre}</p>
                <p className="mt-1 flex-1 text-[13.5px] leading-snug text-[#c5d2ee]">{p.rol}</p>
                {"frase" in p && p.frase && <p className="mt-2 font-serif text-[15px] italic text-white/85">{p.frase}</p>}
                {"audio" in p && p.audio && (
                  <div className="mt-3">
                    <BotonAudio id={p.audio} etiqueta={p.nombre} tint={p.fijo ? VIOLETA : AZUL} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[80ch] text-[14px] leading-relaxed text-white/60">{PERSONAJES.rotativo}</p>

          <div className="mt-14 grid gap-4 lg:grid-cols-2">
            <div className="border border-white/10 bg-[#050d22]/70 p-5 md:p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#d9c6ff]">{PERSONAJES.guionDeOro.quien}</p>
              <h3 className="mt-2 font-heading text-2xl font-black text-white">{PERSONAJES.guionDeOro.titulo}</h3>
              <ol className="mt-4 space-y-1.5">
                {PERSONAJES.guionDeOro.pasos.map((p, i) => (
                  <li key={p} className="flex gap-3 text-[14.5px] text-[#dbe4f7]">
                    <span className="font-mono text-[10px] font-bold text-[#b78bff]">{i + 1}</span>
                    {p}
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-[13px] text-white/55">{PERSONAJES.guionDeOro.dimensionesNota}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {PERSONAJES.guionDeOro.dimensiones.map((d) => (
                  <li key={d} className="border border-[#b78bff]/40 bg-[#b78bff]/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-white/10 bg-[#050d22]/70 p-5 md:p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#9eb0c0]">Trato igual para todos</p>
              <h3 className="mt-2 font-heading text-2xl font-black text-white">{PERSONAJES.sesgo.titulo}</h3>
              <p className="mt-4 text-[14.5px] leading-relaxed text-[#c5d2ee]">{PERSONAJES.sesgo.texto}</p>
              <p className="mt-3 border-l-2 border-[#6b8aff] pl-3 text-[14px] font-medium text-white">{PERSONAJES.sesgo.aclaracion}</p>
            </div>
          </div>

          <div className="mt-4 border border-white/10 p-5 md:p-6">
            <h3 className="font-heading text-lg font-black text-white">{PERSONAJES.motores.titulo}</h3>
            <ol className="mt-3 grid gap-2 md:grid-cols-3">
              {PERSONAJES.motores.lista.map((m, i) => (
                <li key={m} className="flex gap-3 text-[14px] leading-snug text-[#c5d2ee]">
                  <span className="font-mono text-[10px] font-bold text-[#6b8aff]">{i + 1}</span>
                  {m}
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <EstadoChip estado={{ texto: PERSONAJES.motores.estado, color: AMBAR }} />
            </div>
          </div>

          {/* 6 · Escenarios operativos y modos */}
          <div id="operativos" className="mt-20 scroll-mt-24">
            <Encabezado id="operativos-titulo" eyebrow="Central y sede" tint={AZUL} titulo={OPERATIVOS.titulo} intro={OPERATIVOS.intro} />
            <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {OPERATIVOS.escenarios.map((e) => (
                <li key={e.id} className="flex flex-col border border-white/10 bg-[#050d22]/70 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading text-2xl font-black text-[#6b8aff]">{e.id}</span>
                    <EstadoChip estado={{ texto: e.estado, color: e.estado === "Casi listo" ? AMBAR : AZUL }} />
                  </div>
                  <p className="mt-2 flex-1 text-[14.5px] leading-snug text-white">{e.nombre}</p>
                  <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/50">{e.rol}</p>
                  {"nota" in e && e.nota && <p className="mt-1 text-[12.5px] text-white/50">{e.nota}</p>}
                </li>
              ))}
            </ul>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <Subtitulo>Ejemplo de rúbrica · E1</Subtitulo>
                <ul className="mt-4 divide-y divide-white/10 border border-white/10">
                  {OPERATIVOS.rubricaE1.map((r) => (
                    <li key={r.nombre} className="flex items-baseline gap-4 p-3">
                      <span className="w-7 shrink-0 font-heading text-lg font-black tabular-nums text-white">{r.puntos}</span>
                      <span className="text-[14px] text-[#dbe4f7]">
                        {r.nombre}
                        {"nota" in r && r.nota && <span className="block text-[12.5px] text-white/50">{r.nota}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Subtitulo>Faltas graves en E1</Subtitulo>
                <ul className="mt-4 space-y-2">
                  {OPERATIVOS.faltasE1.map((f) => (
                    <li key={f} className="flex gap-3 border border-[#ff6b7a]/30 bg-[#ff6b7a]/[0.06] p-3 text-[14px] text-[#ffd0d5]">
                      <Ban className="mt-0.5 size-4 shrink-0 text-[#ff6b7a]" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12">
              <Subtitulo>Tres modos de uso</Subtitulo>
              <ul className="mt-4 grid gap-3 md:grid-cols-3">
                {OPERATIVOS.modos.map((m) => (
                  <li key={m.nombre} className="border border-white/10 bg-[#050d22]/70 p-4">
                    <p className="font-heading text-xl font-black text-white">{m.nombre}</p>
                    <p className="mt-1 text-[13.5px] text-[#c5d2ee]">{m.para}</p>
                    <dl className="mt-4 space-y-2 border-t border-white/10 pt-3 text-[13.5px]">
                      <div>
                        <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">¿Cuenta para el certificado?</dt>
                        <dd className="mt-0.5 text-white">{m.cuenta}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">¿Envía datos?</dt>
                        <dd className="mt-0.5 text-white">{m.envia}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7 · Plataforma */}
      <section id="plataforma" data-narracion="academia/plataforma" aria-labelledby="plataforma-titulo" className={SECCION}>
        <div className={ENVOLTURA}>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <Encabezado
                id="plataforma-titulo"
                eyebrow="De la gafa al ARS"
                tint={AZUL}
                titulo={PLATAFORMA.titulo}
                intro="De la asignación al certificado: el coordinador asigna en la web, el vigilante practica en la gafa y el resultado alimenta su hoja de vida, el acta con QR y la mesa directiva."
              />
              <div className="mt-6">
                <EstadoChip estado={{ texto: PLATAFORMA.aviso, color: AMBAR }} />
              </div>
            </div>
            <RanuraEscena foco="plataforma" className="lg:sticky lg:top-24" />
          </div>

          <div className="mt-12">
            <FlujoPlataforma />
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <Subtitulo>Los tres errores más comunes, por puesto</Subtitulo>
              <p className="mt-2 text-[13px] text-white/50">Ejemplos de lo que vería el coordinador:</p>
              <ul className="mt-3 space-y-2">
                {PLATAFORMA.errores.map((e) => (
                  <li key={e} className="border border-white/10 bg-[#050d22]/70 p-3 font-serif text-[16px] italic text-white">
                    {e}
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex gap-3 text-[14px] leading-relaxed text-[#dbe4f7]">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#35e0a1]" aria-hidden="true" />
                {PLATAFORMA.qr}
              </p>
            </div>
            <div className="border border-[#6b8aff]/30 bg-[#6b8aff]/[0.06] p-5 md:p-6">
              <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#b9c8ff]">
                <Lock className="size-3.5" aria-hidden="true" />
                Permisos y privacidad
              </p>
              <ul className="mt-4 space-y-3">
                {PLATAFORMA.privacidad.map((p) => (
                  <li key={p} className="flex gap-3 text-[14px] leading-relaxed text-[#dbe4f7]">
                    <span className="mt-2 inline-block size-1.5 shrink-0 bg-[#6b8aff]" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8 · Legal */}
      <section id="legal" data-narracion="academia/legal" aria-labelledby="legal-titulo" className={SECCION}>
        <div className={ENVOLTURA}>
          <Encabezado id="legal-titulo" eyebrow="Normativa colombiana" tint={AZUL} titulo={LEGAL.titulo} intro={LEGAL.enfoque} />

          <aside className="mt-8 border-2 border-[#ffb547]/50 bg-[#ffb547]/[0.07] p-5 md:p-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#ffd19a]">Importante</p>
            <p className="mt-2 text-[15.5px] leading-relaxed text-white md:text-lg">{LEGAL.complementa}</p>
          </aside>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <dl className="divide-y divide-white/10 border border-white/10">
              {LEGAL.normas.map((n) => (
                <div key={n.norma} className="grid gap-1 p-4 md:grid-cols-[14rem_1fr] md:gap-6">
                  <dt>
                    <span className="font-heading font-black text-white">{n.norma}</span>
                    {n.nombre && <span className="block text-[12.5px] text-white/55">{n.nombre}</span>}
                  </dt>
                  <dd className="text-[14px] leading-snug text-[#c5d2ee]">{n.uso}</dd>
                </div>
              ))}
            </dl>
            <div>
              <Subtitulo>Lo que la Academia NO enseña</Subtitulo>
              <ul className="mt-4 space-y-2">
                {LEGAL.noEnsena.map((n) => (
                  <li key={n} className="flex gap-3 border border-[#ff6b7a]/30 bg-[#ff6b7a]/[0.06] p-3 text-[14.5px] text-[#ffd0d5]">
                    <Ban className="mt-0.5 size-4 shrink-0 text-[#ff6b7a]" aria-hidden="true" />
                    {n}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px] leading-relaxed text-[#c5d2ee]">{LEGAL.sinSangre}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9 · Estado real y cierre */}
      <section id="cierre" data-narracion="academia/cierre" aria-labelledby="estado-titulo" className={SECCION}>
        <div className={ENVOLTURA}>
          <Encabezado id="estado-titulo" eyebrow="Estado real · noviembre de 2026" tint={AMBAR} titulo={ESTADO.titulo} intro={ESTADO.intro} />
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="border border-[#35e0a1]/30 p-5 md:p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#9df2cf]">Construido</p>
              <ul className="mt-4 space-y-3">
                {ESTADO.hecho.map((h) => (
                  <li key={h} className="flex gap-3 text-[14px] leading-snug text-[#dbe4f7]">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" style={{ color: VERDE }} aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-[#ffb547]/30 p-5 md:p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#ffd19a]">Falta</p>
              <ul className="mt-4 space-y-3">
                {ESTADO.falta.map((f) => (
                  <li key={f} className="flex gap-3 text-[14px] leading-snug text-[#dbe4f7]">
                    <CircleDashed className="mt-0.5 size-4 shrink-0" style={{ color: AMBAR }} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-5 font-serif text-lg italic text-white">{ESTADO.hoy}</p>

          <div className="relative isolate mt-16 overflow-hidden border border-[#b78bff]/30 px-5 py-14 text-center md:py-20">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(circle at 25% 30%, rgba(183,139,255,0.28), transparent 55%), radial-gradient(circle at 80% 75%, rgba(35,72,212,0.4), transparent 55%), #030c1f",
              }}
            />
            <div className="flex justify-center">
              <Eyebrow tint={VIOLETA}>Academia ARS</Eyebrow>
            </div>
            <h2 className="mx-auto mt-5 max-w-3xl text-balance font-heading text-3xl font-black tracking-tight text-white md:text-5xl">{CIERRE.titulo}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#c5d2ee] md:text-lg">{CIERRE.texto}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <CtaLink href="/#propuesta" primary>
                {CIERRE.diagnostico}
              </CtaLink>
              <CtaLink href={mailtoUrl("Demostración de la Academia ARS (capacitación VR)")}>{CIERRE.contacto}</CtaLink>
            </div>
            <p className="mt-6 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/40">
              Empresas, personas y datos de la demo son ficticios
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
