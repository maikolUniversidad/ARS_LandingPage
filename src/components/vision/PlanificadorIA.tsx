"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { analiticas, type FamiliaId } from "@/data/analiticas";
import { whatsappUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";
import type { EscenaPlan, PeticionPlan, PlanVision, Prioridad, Tamano, TipoSitio } from "@/lib/vision/plan";
import { Plano3D, type EventoPlan } from "./Plano3D";
import { FAMILIA_COLOR } from "./VisorAnaliticas";

const porId = new Map(analiticas.map((a) => [a.id, a]));
const colorDe = (id: string) => FAMILIA_COLOR[(porId.get(id)?.familia ?? "operativo") as FamiliaId];

type Respuesta = { ok: true; plan: PlanVision; escena: EscenaPlan; aviso?: string } | { ok: false; mensaje: string };

const TEXTOS = {
  es: {
    eyebrow: "Diseñe su sistema con IA",
    tituloA: "Cuéntenos su sitio.",
    tituloB: "La IA arma las cámaras.",
    lead: "Describa su negocio y lo que le preocupa. La IA elige las analíticas que le sirven, calcula cuántas cámaras hacen falta y dónde van, y le muestra en 3D lo que vería cada una.",
    placeholder: "Ej.: Tengo un supermercado de barrio con 3 cajas, una bodega atrás y parqueadero para 15 carros. Me preocupan los robos en góndola y las filas largas los fines de semana. Ya tengo 6 cámaras.",
    ejemplos: "Probar con un ejemplo",
    ejemplosLista: [
      { t: "Supermercado", d: "Supermercado de barrio con 3 cajas, bodega atrás y parqueadero para 15 carros. Me preocupan los robos en góndola y las filas largas los fines de semana. Ya tengo 6 cámaras." },
      { t: "Bodega logística", d: "Centro de distribución con racks altos, montacargas y patio de cargue. Queremos que todos usen casco y chaleco, que los pasillos estén libres y saber qué camión entra y sale." },
      { t: "Colegio", d: "Colegio de 800 estudiantes con portería, corredores, patio de descanso y una cerca perimetral larga. Nos preocupan las peleas, los desconocidos merodeando y quién entra." },
    ],
    sitio: "Tipo de sitio",
    sitioAuto: "Que lo deduzca la IA",
    sitios: { tienda: "Tienda", supermercado: "Supermercado", bodega: "Bodega", oficina: "Oficina", parqueadero: "Parqueadero", planta: "Planta", colegio: "Colegio", restaurante: "Restaurante", conjunto: "Conjunto residencial", otro: "Otro" } as Record<TipoSitio, string>,
    tamano: "Tamaño",
    tamanos: { pequena: "Pequeño", mediana: "Mediano", grande: "Grande" } as Record<Tamano, string>,
    prioridades: "Lo que más le importa",
    prioridadesLista: { seguridad: "Seguridad", ventas: "Ventas", operacion: "Operación", inventario: "Inventario", personal: "Personal" } as Record<Prioridad, string>,
    existentes: "Cámaras que ya tiene",
    existentesNota: "opcional",
    disenar: "Diseñar con IA",
    rediseñar: "Volver a diseñar",
    faltaTexto: "Cuéntenos un poco más de su sitio (al menos una frase).",
    pasos: ["Leyendo su sitio", "Eligiendo las analíticas", "Ubicando las cámaras", "Armando la maqueta 3D"],
    errorRed: "No pudimos conectarnos. Revise su conexión e intente de nuevo.",
    camaras: "cámaras",
    zonas: "zonas",
    analiticas: "analíticas",
    reutilizadas: "reutilizadas",
    vistaMaqueta: "Maqueta 3D",
    vistaCamara: "Vista de la cámara",
    recorrido: "Recorrido",
    recorridoNota: "Pasa por todas las cámaras",
    ilustrativa: "Simulación ilustrativa",
    cargando3d: "Armando la maqueta 3D",
    error3d: "La maqueta 3D no cargó en este navegador. La propuesta de abajo sigue siendo válida.",
    porZona: "Cámaras por zona",
    enVivo: "Lo que está detectando",
    enVivoVacio: "Los eventos de la simulación aparecen aquí.",
    porque: "Por qué estas analíticas",
    alta: "Prioridad alta",
    media: "Recomendada",
    verla: "Verla en acción",
    notas: "Supuestos y siguientes pasos",
    pedir: "Quiero esta propuesta",
    ajustar: "Ajustar la descripción",
    fuenteIa: "Diseñado con IA",
    fuenteReglas: "Diseñado con nuestro motor de reglas",
    mensajeWa: (p: PlanVision) =>
      `Hola ARS Intelligence. Diseñé una propuesta en su web: ${p.titulo}. ${p.camaras.length} cámaras en ${p.zonas.length} zonas con: ${p.analiticas
        .map((a) => porId.get(a.id)?.nombre)
        .filter(Boolean)
        .join(", ")}. Quiero agendar la visita técnica.`,
  },
  en: {
    eyebrow: "Design your system with AI",
    tituloA: "Tell us about your site.",
    tituloB: "AI places the cameras.",
    lead: "Describe your business and what worries you. The AI picks the analytics that fit, works out how many cameras you need and where, and shows you in 3D what each one would see. Proposals are written in Spanish.",
    placeholder: "E.g.: I run a neighborhood supermarket with 3 checkouts, a back warehouse and parking for 15 cars. I worry about shelf theft and long lines on weekends. I already have 6 cameras.",
    ejemplos: "Try an example",
    ejemplosLista: [
      { t: "Supermarket", d: "Supermercado de barrio con 3 cajas, bodega atrás y parqueadero para 15 carros. Me preocupan los robos en góndola y las filas largas los fines de semana. Ya tengo 6 cámaras." },
      { t: "Warehouse", d: "Centro de distribución con racks altos, montacargas y patio de cargue. Queremos que todos usen casco y chaleco, que los pasillos estén libres y saber qué camión entra y sale." },
      { t: "School", d: "Colegio de 800 estudiantes con portería, corredores, patio de descanso y una cerca perimetral larga. Nos preocupan las peleas, los desconocidos merodeando y quién entra." },
    ],
    sitio: "Site type",
    sitioAuto: "Let the AI decide",
    sitios: { tienda: "Store", supermercado: "Supermarket", bodega: "Warehouse", oficina: "Office", parqueadero: "Parking lot", planta: "Plant", colegio: "School", restaurante: "Restaurant", conjunto: "Residential complex", otro: "Other" } as Record<TipoSitio, string>,
    tamano: "Size",
    tamanos: { pequena: "Small", mediana: "Medium", grande: "Large" } as Record<Tamano, string>,
    prioridades: "What matters most",
    prioridadesLista: { seguridad: "Security", ventas: "Sales", operacion: "Operations", inventario: "Inventory", personal: "Staff" } as Record<Prioridad, string>,
    existentes: "Cameras you already have",
    existentesNota: "optional",
    disenar: "Design with AI",
    rediseñar: "Design again",
    faltaTexto: "Tell us a bit more about your site (at least one sentence).",
    pasos: ["Reading your site", "Choosing the analytics", "Placing the cameras", "Building the 3D model"],
    errorRed: "We couldn't connect. Check your connection and try again.",
    camaras: "cameras",
    zonas: "zones",
    analiticas: "analytics",
    reutilizadas: "reused",
    vistaMaqueta: "3D model",
    vistaCamara: "Camera view",
    recorrido: "Tour",
    recorridoNota: "Cycles through every camera",
    ilustrativa: "Illustrative simulation",
    cargando3d: "Building the 3D model",
    error3d: "The 3D model didn't load in this browser. The proposal below is still valid.",
    porZona: "Cameras by zone",
    enVivo: "What it's detecting",
    enVivoVacio: "Simulation events show up here.",
    porque: "Why these analytics",
    alta: "High priority",
    media: "Recommended",
    verla: "See it working",
    notas: "Assumptions and next steps",
    pedir: "I want this proposal",
    ajustar: "Edit the description",
    fuenteIa: "Designed with AI",
    fuenteReglas: "Designed by our rules engine",
    mensajeWa: (p: PlanVision) =>
      `Hi ARS Intelligence. I designed a proposal on your website: ${p.titulo}. ${p.camaras.length} cameras in ${p.zonas.length} zones with: ${p.analiticas
        .map((a) => porId.get(a.id)?.nombre)
        .filter(Boolean)
        .join(", ")}. I'd like to schedule the site visit.`,
  },
};

const SITIOS: TipoSitio[] = ["tienda", "supermercado", "bodega", "oficina", "parqueadero", "planta", "colegio", "restaurante", "conjunto"];
const TAMANOS: Tamano[] = ["pequena", "mediana", "grande"];
const PRIORIDADES: Prioridad[] = ["seguridad", "ventas", "operacion", "inventario", "personal"];

type Props = {
  locale: "es" | "en";
  /** Abre una analítica en el visor de arriba. */
  onVer: (id: string) => void;
};

/**
 * Planificador de video analítica con IA: el cliente cuenta su sitio y recibe
 * una propuesta (zonas, cámaras y analíticas) con su maqueta 3D, donde puede
 * mirar a través de cada cámara y ver la analítica funcionando.
 */
export function PlanificadorIA({ locale, onVer }: Props) {
  const t = TEXTOS[locale];
  const [descripcion, setDescripcion] = useState("");
  const [tipoSitio, setTipoSitio] = useState<TipoSitio | "">("");
  const [tamano, setTamano] = useState<Tamano | "">("");
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);
  const [existentes, setExistentes] = useState("");
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ plan: PlanVision; escena: EscenaPlan; aviso?: string } | null>(null);
  const [cam, setCam] = useState(-1);
  const [vista, setVista] = useState<"maqueta" | "cctv">("maqueta");
  const [eventos, setEventos] = useState<(EventoPlan & { k: number })[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const k = useRef(0);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Mientras espera, los pasos avanzan para que se note el trabajo (sin pasar del último).
  useEffect(() => {
    if (!cargando) return;
    const iv = window.setInterval(() => setPaso((p) => Math.min(p + 1, t.pasos.length - 1)), 1600);
    return () => window.clearInterval(iv);
  }, [cargando, t.pasos.length]);

  const disenar = useCallback(async () => {
    const texto = descripcion.trim();
    if (texto.length < 8) {
      setError(t.faltaTexto);
      return;
    }
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setCargando(true);
    setPaso(0);
    setError(null);
    const n = Number.parseInt(existentes, 10);
    const cuerpo: PeticionPlan = {
      descripcion: texto,
      tipoSitio: tipoSitio || undefined,
      tamano: tamano || undefined,
      prioridades,
      camarasExistentes: Number.isFinite(n) && n >= 0 ? n : undefined,
    };
    try {
      const r = await fetch("/api/vision/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo), signal: ac.signal });
      const j = (await r.json()) as Respuesta;
      if (!j.ok) {
        setError(j.mensaje);
        return;
      }
      setResultado({ plan: j.plan, escena: j.escena, aviso: j.aviso });
      setCam(-1);
      setVista("maqueta");
      setEventos([]);
      requestAnimationFrame(() => resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(t.errorRed);
    } finally {
      if (abortRef.current === ac) setCargando(false);
    }
  }, [descripcion, existentes, prioridades, tamano, tipoSitio, t]);

  const onEvento = useCallback((e: EventoPlan) => {
    k.current += 1;
    const item = { ...e, k: k.current };
    setEventos((prev) => [item, ...prev].slice(0, 6));
  }, []);

  const plan = resultado?.plan;
  const camarasPorZona = useMemo(() => {
    if (!resultado) return [];
    return resultado.escena.zonas.map((z) => ({
      zona: z,
      camaras: resultado.escena.camaras.map((c, i) => ({ c, i })).filter(({ c }) => c.zona === z.id),
    }));
  }, [resultado]);

  const elegirCam = (i: number) => {
    setCam(i);
    if (i >= 0) setVista("cctv");
  };

  return (
    <section id="planificador" className="relative scroll-mt-20 border-b border-border/40 px-4 py-16 sm:px-6 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-12">
          <div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.4em] text-foreground/55">
              <span className="mr-3 inline-block size-1.5 align-middle bg-accent" />
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
            <label htmlFor="plan-desc" className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/55">
              {locale === "en" ? "Your site, in your words" : "Su sitio, con sus palabras"}
            </label>
            <textarea
              id="plan-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void disenar();
              }}
              maxLength={1200}
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
            <Campo titulo={t.sitio}>
              <select
                value={tipoSitio}
                onChange={(e) => setTipoSitio(e.target.value as TipoSitio | "")}
                className="w-full border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              >
                <option value="">{t.sitioAuto}</option>
                {SITIOS.map((s) => (
                  <option key={s} value={s}>
                    {t.sitios[s]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo titulo={t.tamano}>
              <div className="flex gap-1">
                {TAMANOS.map((s) => (
                  <Chip key={s} activo={tamano === s} onClick={() => setTamano(tamano === s ? "" : s)}>
                    {t.tamanos[s]}
                  </Chip>
                ))}
              </div>
            </Campo>
            <Campo titulo={t.prioridades}>
              <div className="flex flex-wrap gap-1">
                {PRIORIDADES.map((p) => {
                  const activo = prioridades.includes(p);
                  return (
                    <Chip key={p} activo={activo} onClick={() => setPrioridades(activo ? prioridades.filter((x) => x !== p) : [...prioridades, p])}>
                      {t.prioridadesLista[p]}
                    </Chip>
                  );
                })}
              </div>
            </Campo>
            <Campo titulo={`${t.existentes} · ${t.existentesNota}`}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={500}
                value={existentes}
                onChange={(e) => setExistentes(e.target.value)}
                className="w-28 border border-border/60 bg-background px-3 py-2 text-sm tabular-nums text-foreground outline-none focus:border-accent"
              />
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
                    <span className="text-accent">✦</span> {resultado ? t.rediseñar : t.disenar}
                  </>
                )}
              </button>
              {error && (
                <p role="alert" className="mt-3 text-sm text-[#FF8A8E]">
                  {error}
                </p>
              )}
              {cargando && (
                <ol className="mt-4 grid grid-cols-4 gap-1" aria-hidden>
                  {t.pasos.map((p, i) => (
                    <li key={p} className={cn("h-1 transition-colors duration-500", i <= paso ? "bg-accent" : "bg-border/60")} />
                  ))}
                </ol>
              )}
            </div>
          </div>
        </form>

        {/* Resultado */}
        {resultado && plan && (
          <div ref={resultadoRef} className="mt-12 scroll-mt-24" aria-live="polite">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-3xl">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-accent">{plan.fuente === "ia" ? t.fuenteIa : t.fuenteReglas}</div>
                <h3 className="mt-2 font-heading text-2xl font-black uppercase tracking-tight md:text-3xl">{plan.titulo}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75 md:text-base">{plan.resumen}</p>
                {resultado.aviso && <p className="mt-2 font-serif text-sm italic text-foreground/50">{resultado.aviso}</p>}
              </div>
              <dl className="flex gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                {[
                  { n: plan.camaras.length, l: t.camaras },
                  { n: plan.zonas.length, l: t.zonas },
                  { n: plan.analiticas.length, l: t.analiticas },
                  ...(plan.reutilizadas ? [{ n: plan.reutilizadas, l: t.reutilizadas }] : []),
                ].map((s) => (
                  <div key={s.l}>
                    <dd className="font-heading text-3xl font-black tabular-nums tracking-tight text-foreground">{s.n}</dd>
                    <dt className="mt-0.5">{s.l}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 grid gap-px border border-border/50 bg-border/40 lg:grid-cols-[1.65fr_1fr]">
              {/* Maqueta */}
              <div className="flex flex-col bg-background">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-3 py-2">
                  <div className="flex gap-1" role="group" aria-label={t.vistaCamara}>
                    <Chip activo={vista === "maqueta"} onClick={() => setVista("maqueta")}>
                      {t.vistaMaqueta}
                    </Chip>
                    <Chip activo={vista === "cctv"} onClick={() => setVista("cctv")}>
                      {t.vistaCamara}
                    </Chip>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCam(-1)}
                    title={t.recorridoNota}
                    className={cn(
                      "flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors",
                      cam === -1 ? "border-accent text-foreground" : "border-border/60 text-foreground/60 hover:text-foreground",
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", cam === -1 ? "animate-pulse bg-accent" : "bg-foreground/40")} aria-hidden />
                    {t.recorrido}
                  </button>
                </div>
                <div className="relative">
                  <Plano3D
                    escena={resultado.escena}
                    cam={cam}
                    vista={vista}
                    onEvento={onEvento}
                    className="aspect-[16/10] w-full"
                    textos={{ cargando: t.cargando3d, error: t.error3d }}
                  />
                  <span className="pointer-events-none absolute bottom-2 left-2 bg-[#000a20]/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/80">
                    {t.ilustrativa}
                  </span>
                </div>
                {/* Eventos en vivo */}
                <div className="border-t border-border/40 p-4">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/50">{t.enVivo}</div>
                  {eventos.length === 0 ? (
                    <p className="mt-2 text-xs text-foreground/40">{t.enVivoVacio}</p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {eventos.map((e) => {
                        const c = resultado.escena.camaras[e.cam];
                        return (
                          <li key={e.k} className="flex items-start gap-2 text-xs leading-snug text-foreground/80 animate-in fade-in slide-in-from-top-1">
                            <span
                              className="mt-1 size-2 shrink-0 rounded-full"
                              style={{ background: e.nivel === "alerta" ? "#E5484D" : e.nivel === "detecta" ? "#F5A524" : "#30A46C" }}
                              aria-hidden
                            />
                            <button type="button" onClick={() => c && elegirCam(e.cam)} className="font-mono text-[10px] font-bold text-foreground/60 hover:text-foreground">
                              {c?.etiqueta ?? "CAM"}
                            </button>
                            <span>
                              <b className="font-semibold">{porId.get(e.analitica)?.nombre ?? e.analitica}</b> · {e.texto}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Cámaras por zona */}
              <div className="flex max-h-[44rem] flex-col bg-background">
                <div className="border-b border-border/40 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/55">{t.porZona}</div>
                <ol className="flex-1 overflow-y-auto">
                  {camarasPorZona.map(({ zona, camaras }) => (
                    <li key={zona.id} className="border-b border-border/30 px-4 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <h4 className="font-heading text-sm font-black uppercase tracking-tight">{zona.nombre}</h4>
                        <span className="font-mono text-[10px] tabular-nums text-foreground/45">
                          {camaras.length} {t.camaras}
                        </span>
                      </div>
                      {zona.motivo && <p className="mt-1 text-xs leading-relaxed text-foreground/55">{zona.motivo}</p>}
                      <ul className="mt-2 flex flex-col gap-1">
                        {camaras.map(({ c, i }) => {
                          const activa = cam === i;
                          return (
                            <li key={c.id}>
                              <button
                                type="button"
                                onClick={() => elegirCam(i)}
                                aria-pressed={activa}
                                className={cn(
                                  "w-full border px-3 py-2 text-left transition-colors",
                                  activa ? "border-accent bg-accent/10" : "border-border/40 hover:border-foreground/40",
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="size-2 rounded-full" style={{ background: `#${c.color.toString(16).padStart(6, "0")}` }} aria-hidden />
                                  <span className="font-mono text-[10px] font-bold tracking-[0.15em]">{c.etiqueta}</span>
                                  <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.15em] text-foreground/40">{activa ? "◉" : "◎"}</span>
                                </div>
                                {c.proposito && <p className="mt-1 text-xs leading-snug text-foreground/70">{c.proposito}</p>}
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {c.analiticas.map((id) => (
                                    <span key={id} className="border border-border/50 px-1.5 py-0.5 text-[10px] text-foreground/75" style={{ borderLeft: `3px solid ${colorDe(id)}` }}>
                                      {porId.get(id)?.nombre ?? id}
                                    </span>
                                  ))}
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Analíticas elegidas */}
            <h4 className="mt-12 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/55">{t.porque}</h4>
            <div className="mt-4 grid gap-px border border-border/50 bg-border/40 sm:grid-cols-2 xl:grid-cols-3">
              {plan.analiticas.map((a) => {
                const info = porId.get(a.id);
                if (!info) return null;
                return (
                  <article key={a.id} className="flex flex-col bg-background p-5">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: colorDe(a.id) }} aria-hidden />
                      <h5 className="font-heading text-base font-black uppercase leading-tight tracking-tight">{info.nombre}</h5>
                    </div>
                    <span className={cn("mt-2 w-fit font-mono text-[9px] font-bold uppercase tracking-[0.2em]", a.prioridad === "alta" ? "text-accent" : "text-foreground/45")}>
                      {a.prioridad === "alta" ? t.alta : t.media}
                    </span>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">{a.motivo}</p>
                    <button
                      type="button"
                      onClick={() => onVer(a.id)}
                      className="mt-4 w-fit font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
                    >
                      ▸ {t.verla}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/55">{t.notas}</h4>
                <ul className="mt-3 flex flex-col gap-1.5 text-sm text-foreground/70">
                  {plan.notas.map((n) => (
                    <li key={n} className="flex gap-2">
                      <span className="text-accent">·</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={whatsappUrl(t.mensajeWa(plan))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bevel-btn inline-flex items-center gap-3 border border-border/60 bg-foreground px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-90"
                >
                  <span>▸</span> {t.pedir}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("plan-desc")?.focus();
                    document.getElementById("planificador")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="bevel-btn inline-flex items-center gap-3 border border-border bg-background/40 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-foreground transition-colors hover:border-accent"
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
