"use client";

import { ArrowRight, Check, Mail, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { preguntarAArs } from "@/components/servicios/eventos";
import { moduloPorId, todosLosModulos, type Area, type Modulo } from "@/data/servicios";
import { CONTACT_EMAIL, whatsappUrl } from "@/lib/contact";
import { useI18n } from "@/lib/i18n/context";
import type { PeticionArquitecto, PrioridadOp, PropuestaPlataforma, RespuestaArquitecto, TamanoOp } from "@/lib/plataforma/tipos";
import { cn } from "@/lib/utils";

const CATALOGO = todosLosModulos();
const TOTAL = CATALOGO.length;
const MIN_PENSANDO_MS = 2600;

const PRIORIDADES: PrioridadOp[] = ["turnos", "puesto", "sala-control", "comunicacion", "video", "nomina", "documentos", "finanzas", "formacion"];
const TAMANOS: TamanoOp[] = ["pequena", "mediana", "grande", "muy-grande"];

const TEXTOS = {
  es: {
    eyebrow: "Arquitecto IA de plataforma",
    tituloA: "Cuéntanos tu operación.",
    tituloB: "La IA arma tu plataforma.",
    lead: `Describe cómo trabajas hoy y qué te duele. La IA lo cruza con los ${TOTAL} módulos de ARS, elige solo los que necesitas y te propone por dónde empezar, en fases.`,
    etiquetaTexto: "Tu operación, con tus palabras",
    placeholder:
      "Ej.: Empresa de vigilancia con 400 guardas en 60 sedes. Programamos los turnos en Excel, no sabemos quién está en el puesto y la nómina de recargos nos toma días.",
    ejemplos: "Probar con un ejemplo",
    ejemplosLista: [
      { t: "Vigilancia · 400 guardas", d: "Empresa de vigilancia con 400 guardas en 60 sedes. Programamos los turnos en Excel, no sabemos quién está en el puesto y la nómina de horas extra y recargos nos toma días." },
      { t: "Central de monitoreo", d: "Tenemos una central de monitoreo para 25 clientes con cámaras y radios. Los supervisores hacen rondas pero no hay forma de verificarlas, y ante un atraco dependemos de que contesten el teléfono." },
      { t: "Gestión humana", d: "Somos 150 vigilantes y las hojas de vida y cursos están en carpetas. Los vencimientos se nos pasan, las auditorías del cliente nos toman días y la nómina y la contabilidad van por otro lado en Excel." },
    ],
    prioridades: "Lo que más te importa",
    prioridadesLista: {
      turnos: "Turnos",
      puesto: "¿Quién está en el puesto?",
      "sala-control": "Sala de control",
      comunicacion: "Comunicación",
      video: "Cámaras e IA",
      nomina: "Nómina",
      documentos: "Documentos",
      finanzas: "Finanzas y ERP",
      formacion: "Capacitación",
    } as Record<PrioridadOp, string>,
    tamano: "Tamaño de la operación",
    tamanos: { pequena: "< 50", mediana: "50–300", grande: "300–1.000", "muy-grande": "> 1.000" } as Record<TamanoOp, string>,
    tamanoNota: "personas en campo",
    disenar: "Armar mi plataforma",
    rediseñar: "Armar de nuevo",
    faltaTexto: "Cuéntanos un poco más de tu operación (al menos una frase).",
    errorRed: "No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.",
    pasos: ["Leyendo tu operación", `Cruzando con ${TOTAL} módulos`, "Armando fases", "Escribiendo el antes y después"],
    pensando: "El arquitecto está trabajando",
    fuenteIa: "Diseñada con IA",
    fuenteReglas: "Propuesta automática",
    avisoReglas: "",
    modulos: "módulos",
    fases: "fases",
    semanas: "semanas estimadas",
    mapa: "Tu mapa: dolor → módulo",
    mapaNota: "Cada problema que nos contaste, con el módulo que lo resuelve.",
    tusModulos: "Los módulos de tu plataforma",
    alta: "Prioridad alta",
    media: "Complementa",
    piloto: "En piloto",
    verModulo: "Ver el módulo",
    ruta: "Ruta de implementación",
    rutaNota: "Duraciones orientativas: se ajustan con tu equipo.",
    aprox: (n: number) => `~${n} ${n === 1 ? "semana" : "semanas"}`,
    antesDespues: "Antes y después",
    indicador: "Indicador",
    antes: "Hoy",
    despues: "Con ARS",
    siguiente: "Siguiente paso",
    whatsapp: "Hablar por WhatsApp",
    mail: "Enviar por correo",
    asistente: "Preguntar al asistente",
    ajustar: "Ajustar la descripción",
    resumen: (p: PropuestaPlataforma) =>
      `Hola ARS Intelligence. Armé mi plataforma en su web: ${p.titulo}.\nMódulos: ${nombres(p.modulos.map((m) => m.id))}.\nFases: ${p.fases
        .map((f) => f.nombre)
        .join(" → ")}.\nQuiero agendar una demostración.`,
    asunto: (p: PropuestaPlataforma) => `Mi plataforma ARS: ${p.titulo}`,
    pregunta: (p: PropuestaPlataforma) =>
      `El arquitecto IA me propuso esta plataforma: ${p.titulo}. Módulos: ${nombres(p.modulos.map((m) => m.id))}. ¿Me explicas cómo funcionaría la primera fase (${p.fases[0]?.nombre ?? ""}) en mi operación?`,
  },
  en: {
    eyebrow: "AI platform architect",
    tituloA: "Tell us about your operation.",
    tituloB: "AI builds your platform.",
    lead: `Describe how you work today and what hurts. The AI cross-checks it against ARS's ${TOTAL} modules, picks only the ones you need and proposes where to start, in phases.`,
    etiquetaTexto: "Your operation, in your words",
    placeholder:
      "E.g.: Security company with 400 guards across 60 sites. We schedule shifts in Excel, we don't know who's actually at each post, and overtime payroll takes us days.",
    ejemplos: "Try an example",
    ejemplosLista: [
      { t: "Guarding · 400 guards", d: "Security company with 400 guards across 60 sites. We schedule shifts in Excel, we don't know who is actually at each post, and overtime payroll takes us days." },
      { t: "Monitoring center", d: "We run a monitoring center for 25 clients with cameras and radios. Supervisors do patrols but we can't verify them, and in a robbery we depend on someone answering the phone." },
      { t: "HR & documents", d: "We have 150 guards and their résumés and course certificates live in folders. Expirations slip by, client audits take days and accounting runs separately in our ERP." },
    ],
    prioridades: "What matters most",
    prioridadesLista: {
      turnos: "Shifts",
      puesto: "Who's at the post?",
      "sala-control": "Control room",
      comunicacion: "Communication",
      video: "Cameras & AI",
      nomina: "Payroll",
      documentos: "Documents",
      finanzas: "Finance & ERP",
      formacion: "Training",
    } as Record<PrioridadOp, string>,
    tamano: "Operation size",
    tamanos: { pequena: "< 50", mediana: "50–300", grande: "300–1,000", "muy-grande": "> 1,000" } as Record<TamanoOp, string>,
    tamanoNota: "people in the field",
    disenar: "Build my platform",
    rediseñar: "Build again",
    faltaTexto: "Tell us a bit more about your operation (at least one sentence).",
    errorRed: "We couldn't connect. Check your connection and try again.",
    pasos: ["Reading your operation", `Cross-checking ${TOTAL} modules`, "Laying out phases", "Writing the before & after"],
    pensando: "The architect is working",
    fuenteIa: "Designed with AI",
    fuenteReglas: "Automatic proposal",
    avisoReglas: "Automatic proposal built by our rules engine from your keywords (written in Spanish). An advisor will fine-tune it with you.",
    modulos: "modules",
    fases: "phases",
    semanas: "estimated weeks",
    mapa: "Your map: pain → module",
    mapaNota: "Each problem you told us about, with the module that solves it.",
    tusModulos: "Your platform's modules",
    alta: "High priority",
    media: "Complements",
    piloto: "Pilot",
    verModulo: "See the module",
    ruta: "Rollout path",
    rutaNota: "Durations are indicative and get adjusted with your team.",
    aprox: (n: number) => `~${n} ${n === 1 ? "week" : "weeks"}`,
    antesDespues: "Before and after",
    indicador: "Indicator",
    antes: "Today",
    despues: "With ARS",
    siguiente: "Next step",
    whatsapp: "Talk on WhatsApp",
    mail: "Send by email",
    asistente: "Ask the assistant",
    ajustar: "Edit the description",
    resumen: (p: PropuestaPlataforma) =>
      `Hi ARS Intelligence. I built my platform on your website: ${p.titulo}.\nModules: ${nombres(p.modulos.map((m) => m.id))}.\nPhases: ${p.fases
        .map((f) => f.nombre)
        .join(" → ")}.\nI'd like to schedule a demo.`,
    asunto: (p: PropuestaPlataforma) => `My ARS platform: ${p.titulo}`,
    pregunta: (p: PropuestaPlataforma) =>
      `The AI architect proposed this platform for me: ${p.titulo}. Modules: ${nombres(p.modulos.map((m) => m.id))}. Can you explain how the first phase (${p.fases[0]?.nombre ?? ""}) would work in my operation?`,
  },
};

function nombres(ids: string[]): string {
  return ids
    .map((id) => moduloPorId(id)?.modulo.nombre)
    .filter(Boolean)
    .join(", ");
}

type Resultado = { propuesta: PropuestaPlataforma; aviso?: string };

/**
 * «Arquitecto IA de plataforma»: el visitante cuenta su operación y recibe su
 * plataforma ARS a la medida (dolores → módulos reales, fases e indicadores
 * cualitativos), con CTA a WhatsApp/correo y al asistente «Ars».
 */
export function ArquitectoPlataformaIA() {
  const { locale } = useI18n();
  const t = TEXTOS[locale];
  const [descripcion, setDescripcion] = useState("");
  const [prioridades, setPrioridades] = useState<PrioridadOp[]>([]);
  const [tamano, setTamano] = useState<TamanoOp | "">("");
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!cargando) return;
    const iv = window.setInterval(() => setPaso((p) => Math.min(p + 1, t.pasos.length - 1)), 900);
    return () => window.clearInterval(iv);
  }, [cargando, t.pasos.length]);

  const disenar = useCallback(async () => {
    const texto = descripcion.trim();
    if (texto.length < 12) {
      setError(t.faltaTexto);
      return;
    }
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setCargando(true);
    setPaso(0);
    setError(null);
    const inicio = Date.now();
    const cuerpo: PeticionArquitecto = { descripcion: texto, prioridades, tamano: tamano || undefined, idioma: locale };
    try {
      const r = await fetch("/api/plataforma/arquitecto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
        signal: ac.signal,
      });
      const j = (await r.json()) as RespuestaArquitecto;
      // El «pensando» se deja ver aunque la respuesta llegue al instante (motor de reglas).
      const resta = MIN_PENSANDO_MS - (Date.now() - inicio);
      if (resta > 0) await new Promise((ok) => window.setTimeout(ok, resta));
      if (ac.signal.aborted) return;
      if (!j.ok) {
        setError(j.mensaje);
        return;
      }
      setResultado({ propuesta: j.propuesta, aviso: j.aviso });
      requestAnimationFrame(() => resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(t.errorRed);
    } finally {
      if (abortRef.current === ac) setCargando(false);
    }
  }, [descripcion, locale, prioridades, tamano, t]);

  const p = resultado?.propuesta;

  return (
    <section id="arquitecto-ia" className="relative scroll-mt-20 overflow-hidden border-b border-border/40 px-4 py-16 sm:px-6 md:px-10 md:py-24">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl glow-blob" />
      <div className="relative mx-auto max-w-7xl">
        <header className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-12">
          <div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/55">
              <span className="mr-3 inline-block size-1.5 bg-accent align-middle" />
              {t.eyebrow}
            </div>
            <h2 className="mt-4 font-heading text-3xl font-black uppercase leading-[1.02] tracking-tight md:text-5xl">
              {t.tituloA}
              <br />
              <span className="text-foreground/80">{t.tituloB}</span>
            </h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-foreground/70">{t.lead}</p>
        </header>

        {/* Formulario */}
        <form
          className="mt-10 grid gap-px border border-border/50 bg-border/40 lg:grid-cols-[1.4fr_1fr]"
          onSubmit={(e) => {
            e.preventDefault();
            void disenar();
          }}
        >
          <div className="flex flex-col bg-background p-5 md:p-6">
            <label htmlFor="arquitecto-desc" className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/55">
              {t.etiquetaTexto}
            </label>
            <textarea
              id="arquitecto-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void disenar();
              }}
              maxLength={1500}
              rows={6}
              placeholder={t.placeholder}
              className="mt-3 min-h-40 w-full resize-y border border-border/60 bg-background/40 p-4 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-foreground/35 focus:border-accent"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">{t.ejemplos}:</span>
              {t.ejemplosLista.map((ej) => (
                <button
                  key={ej.t}
                  type="button"
                  onClick={() => {
                    setDescripcion(ej.d);
                    setError(null);
                  }}
                  className="border border-border/60 px-3 py-1.5 text-xs text-foreground/70 transition-colors hover:border-accent hover:text-foreground"
                >
                  {ej.t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5 bg-background p-5 md:p-6">
            <Campo titulo={t.prioridades}>
              <div className="flex flex-wrap gap-1">
                {PRIORIDADES.map((x) => {
                  const activo = prioridades.includes(x);
                  return (
                    <Chip key={x} activo={activo} onClick={() => setPrioridades(activo ? prioridades.filter((y) => y !== x) : [...prioridades, x])}>
                      {t.prioridadesLista[x]}
                    </Chip>
                  );
                })}
              </div>
            </Campo>
            <Campo titulo={`${t.tamano} · ${t.tamanoNota}`}>
              <div className="flex flex-wrap gap-1">
                {TAMANOS.map((s) => (
                  <Chip key={s} activo={tamano === s} onClick={() => setTamano(tamano === s ? "" : s)}>
                    {t.tamanos[s]}
                  </Chip>
                ))}
              </div>
            </Campo>
            <div className="mt-auto">
              <button
                type="submit"
                disabled={cargando}
                className="bevel-btn inline-flex w-full items-center justify-center gap-3 border border-border/60 bg-foreground px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
              >
                {cargando ? (
                  <>
                    <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden />
                    {t.pasos[paso]}…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 text-accent" aria-hidden /> {resultado ? t.rediseñar : t.disenar}
                  </>
                )}
              </button>
              {error && (
                <p role="alert" className="mt-3 text-sm text-[#FF8A8E]">
                  {error}
                </p>
              )}
            </div>
          </div>
        </form>

        {cargando && <Pensando pasos={t.pasos} paso={paso} titulo={t.pensando} />}

        {/* Resultado */}
        {!cargando && resultado && p && (
          <div ref={resultadoRef} className="mt-12 scroll-mt-24" aria-live="polite">
            <div className="flex flex-wrap items-end justify-between gap-6 duration-700 animate-in fade-in slide-in-from-bottom-4">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
                  <Sparkles className="size-3.5" aria-hidden />
                  {p.fuente === "ia" ? t.fuenteIa : t.fuenteReglas}
                </div>
                <h3 className="mt-2 font-heading text-2xl font-black uppercase tracking-tight md:text-4xl">{p.titulo}</h3>
                <p className="mt-4 text-base leading-relaxed text-foreground/75 md:text-lg">{p.diagnostico}</p>
                {resultado.aviso && (
                  <p className="mt-3 font-serif text-sm italic text-foreground/50">{locale === "en" ? t.avisoReglas : resultado.aviso}</p>
                )}
              </div>
              <dl className="flex gap-8 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                {[
                  { n: p.modulos.length, l: t.modulos },
                  { n: p.fases.length, l: t.fases },
                  { n: p.fases.reduce((s, f) => s + f.semanas, 0), l: t.semanas },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col-reverse">
                    <dt className="mt-0.5">{s.l}</dt>
                    <dd className="font-heading text-4xl font-black tabular-nums tracking-tight text-foreground">{s.n}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {p.dolores.length > 0 && (
              <Bloque titulo={t.mapa} nota={t.mapaNota}>
                <ol className="flex flex-col gap-px border border-border/50 bg-border/40">
                  {p.dolores.map((d, i) => (
                    <li
                      key={d.dolor}
                      className="grid gap-3 bg-background p-4 duration-500 animate-in fade-in slide-in-from-left-4 [animation-fill-mode:both] md:grid-cols-[1fr_4rem_1.15fr] md:items-center md:gap-0 md:p-5"
                      style={{ animationDelay: `${i * 120}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 font-mono text-[10px] font-bold tabular-nums text-[#FF8A8E]">{String(i + 1).padStart(2, "0")}</span>
                        <p className="text-sm leading-relaxed text-foreground/85">{d.dolor}</p>
                      </div>
                      <div aria-hidden className="hidden items-center md:flex">
                        <span className="h-px flex-1 bg-gradient-to-r from-[#FF8A8E]/60 to-accent" />
                        <ArrowRight className="-ml-1 size-4 text-accent" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {d.moduloIds.map((id) => {
                          const x = moduloPorId(id);
                          if (!x) return null;
                          return (
                            <a
                              key={id}
                              href={`#arq-mod-${id}`}
                              className="border border-border/50 bg-background/40 px-2 py-1 text-xs text-foreground/85 transition-colors hover:border-foreground/40 hover:text-foreground"
                              style={{ borderLeft: `3px solid ${x.area.color}` }}
                            >
                              {x.modulo.nombre}
                            </a>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ol>
              </Bloque>
            )}

            <Bloque titulo={t.tusModulos}>
              <div className="grid gap-px border border-border/50 bg-border/40 sm:grid-cols-2 xl:grid-cols-3">
                {p.modulos.map((m, i) => {
                  const x = moduloPorId(m.id);
                  if (!x) return null;
                  return <TarjetaModulo key={m.id} area={x.area} modulo={x.modulo} porQue={m.por_que} prioridad={m.prioridad} indice={i} t={t} />;
                })}
              </div>
            </Bloque>

            {p.fases.length > 0 && (
              <Bloque titulo={t.ruta} nota={t.rutaNota}>
                <LineaFases propuesta={p} aprox={t.aprox} />
              </Bloque>
            )}

            {p.indicadores.length > 0 && (
              <Bloque titulo={t.antesDespues}>
                <div className="overflow-x-auto border border-border/50">
                  <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/50 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                        <th scope="col" className="px-4 py-3 font-bold">
                          {t.indicador}
                        </th>
                        <th scope="col" className="px-4 py-3 font-bold">
                          {t.antes}
                        </th>
                        <th scope="col" className="px-4 py-3 font-bold text-accent">
                          {t.despues}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.indicadores.map((ind) => (
                        <tr key={ind.nombre} className="border-b border-border/30 last:border-b-0">
                          <th scope="row" className="px-4 py-3 align-top font-heading text-sm font-black uppercase tracking-tight">
                            {ind.nombre}
                          </th>
                          <td className="px-4 py-3 align-top text-foreground/55">
                            <span className="mr-2 text-[#FF8A8E]" aria-hidden>
                              ✕
                            </span>
                            {ind.antes}
                          </td>
                          <td className="bg-accent/5 px-4 py-3 align-top text-foreground/90">
                            <Check className="mr-2 inline size-3.5 text-accent" aria-hidden />
                            {ind.despues}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Bloque>
            )}

            {/* Cierre */}
            <div className="mt-12 grid gap-6 border border-border/50 bg-background/60 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-accent">{t.siguiente}</div>
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/85">{p.siguientePaso}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={whatsappUrl(t.resumen(p))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bevel-btn inline-flex items-center gap-3 border border-border/60 bg-foreground px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="size-4" aria-hidden /> {t.whatsapp}
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.asunto(p))}&body=${encodeURIComponent(t.resumen(p))}`}
                  className="bevel-btn inline-flex items-center gap-3 border border-border bg-background/40 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-foreground transition-colors hover:border-accent"
                >
                  <Mail className="size-4" aria-hidden /> {t.mail}
                </a>
                <button
                  type="button"
                  onClick={() => preguntarAArs({ texto: t.pregunta(p), modulo: p.modulos[0]?.id })}
                  className="bevel-btn inline-flex items-center gap-3 border border-border bg-background/40 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-foreground transition-colors hover:border-accent"
                >
                  <Sparkles className="size-4 text-accent" aria-hidden /> {t.asistente}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("arquitecto-ia")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    window.setTimeout(() => document.getElementById("arquitecto-desc")?.focus({ preventScroll: true }), 400);
                  }}
                  className="px-2 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 underline-offset-4 hover:text-foreground hover:underline"
                >
                  {t.ajustar}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────── Pensando ─────────────────────────────── */

/** Estado de espera: pasos que avanzan y una rejilla del catálogo que se «escanea». */
function Pensando({ pasos, paso, titulo }: { pasos: string[]; paso: number; titulo: string }) {
  const [foco, setFoco] = useState(0);
  useEffect(() => {
    const iv = window.setInterval(() => setFoco((f) => (f + 7) % TOTAL), 110);
    return () => window.clearInterval(iv);
  }, []);
  const actual = CATALOGO[foco];

  return (
    <div className="mt-10 grid gap-px border border-border/50 bg-border/40 duration-500 animate-in fade-in lg:grid-cols-[1fr_1.3fr]" role="status" aria-live="polite">
      <div className="bg-background p-6 md:p-8">
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
          <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
          {titulo}
        </div>
        <ol className="mt-6 flex flex-col gap-4">
          {pasos.map((s, i) => {
            const hecho = i < paso;
            const activo = i === paso;
            return (
              <li key={s} className={cn("flex items-center gap-3 transition-opacity duration-500", i > paso && "opacity-35")}>
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center border font-mono text-[10px] font-bold",
                    hecho ? "border-accent bg-accent text-background" : activo ? "border-accent text-accent" : "border-border/60 text-foreground/50",
                  )}
                  aria-hidden
                >
                  {hecho ? <Check className="size-3.5" /> : activo ? <span className="size-2 animate-ping rounded-full bg-accent" /> : i + 1}
                </span>
                <span className={cn("text-sm", activo ? "font-semibold text-foreground" : "text-foreground/75")}>{s}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 h-1 w-full bg-border/50" aria-hidden>
          <div className="h-full bg-accent transition-[width] duration-700 ease-out" style={{ width: `${((paso + 1) / pasos.length) * 100}%` }} />
        </div>
      </div>
      <div className="relative overflow-hidden bg-background p-6 md:p-8" aria-hidden>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(1.6rem,1fr))] gap-1.5">
          {CATALOGO.map(({ area, modulo }, i) => {
            const cerca = Math.abs(i - foco) <= 2 || Math.abs(i - foco) >= TOTAL - 2;
            return (
              <span
                key={modulo.id}
                className="aspect-square border transition-all duration-300"
                style={{
                  borderColor: i === foco ? area.color : `${area.color}33`,
                  background: i === foco ? area.color : cerca ? `${area.color}55` : `${area.color}14`,
                  boxShadow: i === foco ? `0 0 18px ${area.color}` : undefined,
                }}
              />
            );
          })}
        </div>
        <div className="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/70">
          <span className="size-2 shrink-0 rounded-full" style={{ background: actual?.area.color }} />
          <span className="truncate">
            {actual?.area.corto} · {actual?.modulo.nombre}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Piezas ─────────────────────────────── */

type Textos = (typeof TEXTOS)["es"] | (typeof TEXTOS)["en"];

function TarjetaModulo({ area, modulo, porQue, prioridad, indice, t }: { area: Area; modulo: Modulo; porQue: string; prioridad: "alta" | "media"; indice: number; t: Textos }) {
  const cap = modulo.capturas[0];
  const img = cap?.src ?? area.arte;
  return (
    <article
      id={`arq-mod-${modulo.id}`}
      className="group flex scroll-mt-24 flex-col bg-background duration-500 animate-in fade-in slide-in-from-bottom-4 [animation-fill-mode:both]"
      style={{ animationDelay: `${indice * 70}ms`, borderTop: `2px solid ${area.color}` }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#000a20]">
        {img && (
          <Image
            src={img}
            alt={cap?.alt ?? area.nombre}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn("object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]", !cap && "opacity-70")}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" aria-hidden />
        <span
          className="absolute left-3 top-3 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-background"
          style={{ background: area.color }}
        >
          {area.corto}
        </span>
        {modulo.estado === "piloto" && (
          <span className="absolute right-3 top-3 border border-white/30 bg-[#000a20]/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/85">
            {t.piloto}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className={cn("font-mono text-[9px] font-bold uppercase tracking-[0.2em]", prioridad === "alta" ? "text-accent" : "text-foreground/45")}>
          {prioridad === "alta" ? t.alta : t.media}
        </span>
        <h4 className="mt-1.5 font-heading text-base font-black uppercase leading-tight tracking-tight">{modulo.nombre}</h4>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">{porQue}</p>
        <Link
          href={`/servicios/${area.id}#${modulo.id}`}
          className="mt-4 inline-flex w-fit items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
        >
          {t.verModulo} <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/** Línea de tiempo de fases: la línea crece al aparecer y cada fase entra en cascada. */
function LineaFases({ propuesta, aprox }: { propuesta: PropuestaPlataforma; aprox: (n: number) => string }) {
  const ref = useRef<HTMLOListElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const n = propuesta.fases.length;
  const columnas = useMemo(() => ({ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }), [n]);

  return (
    <ol ref={ref} className="relative flex flex-col gap-8 lg:grid lg:gap-6" style={columnas}>
      <span aria-hidden className="absolute left-[11px] top-3 bottom-3 w-px bg-border/60 lg:left-0 lg:right-0 lg:top-[11px] lg:bottom-auto lg:h-px lg:w-auto" />
      <span
        aria-hidden
        className={cn(
          "absolute left-[11px] top-3 bottom-3 w-px origin-top bg-accent transition-transform duration-[1600ms] ease-out lg:left-0 lg:right-0 lg:top-[11px] lg:bottom-auto lg:h-px lg:w-auto lg:origin-left",
          visible ? "scale-100" : "scale-y-0 lg:scale-x-0 lg:scale-y-100",
        )}
      />
      {propuesta.fases.map((f, i) => (
        <li
          key={f.nombre}
          className={cn("relative pl-10 transition-all duration-700 ease-out lg:pl-0 lg:pt-10", visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}
          style={{ transitionDelay: `${300 + i * 300}ms` }}
        >
          <span aria-hidden className="absolute left-0 top-0 flex size-6 items-center justify-center border border-accent bg-background font-mono text-[10px] font-bold text-accent">
            {i + 1}
          </span>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50">{aprox(f.semanas)}</div>
          <h4 className="mt-1 font-heading text-lg font-black uppercase leading-tight tracking-tight">{f.nombre}</h4>
          {f.resultado && <p className="mt-2 text-sm leading-relaxed text-foreground/70">{f.resultado}</p>}
          <ul className="mt-3 flex flex-wrap gap-1">
            {f.moduloIds.map((id) => {
              const x = moduloPorId(id);
              if (!x) return null;
              return (
                <li key={id} className="border border-border/50 px-1.5 py-0.5 text-[11px] text-foreground/75" style={{ borderLeft: `3px solid ${x.area.color}` }}>
                  {x.modulo.nombre}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function Bloque({ titulo, nota, children }: { titulo: string; nota?: string; children: ReactNode }) {
  return (
    <div className="mt-12">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/55">{titulo}</h4>
        {nota && <p className="text-xs text-foreground/45">{nota}</p>}
      </div>
      {children}
    </div>
  );
}

function Campo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/55">{titulo}</div>
      {children}
    </div>
  );
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-colors",
        activo ? "border-foreground/40 bg-foreground text-background" : "border-border/60 text-foreground/65 hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
