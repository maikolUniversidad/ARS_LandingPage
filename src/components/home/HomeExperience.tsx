"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SiteNav } from "@/components/SiteNav";
import { CargaTecnologica } from "@/components/carga/CargaTecnologica";
import { RUTA_DIAGNOSTICO } from "@/lib/navegacion";
import { ExperienciaPropuesta } from "@/components/propuesta/ExperienciaPropuesta";
import { ContactForm } from "@/components/ContactForm";
import { Mail, MessageSquare } from "lucide-react";
import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { isModestDevice, noopSubscribe, supportsWebGL } from "@/lib/three/webgl";
import { useI18n } from "@/lib/i18n/context";
import type { HomeDict } from "@/lib/i18n/dictionaries";
import { motorNarracion } from "@/lib/narracion/motor";
import { cn } from "@/lib/utils";
import { createChapterStore } from "./chapter-store";
import type { CanvasLabel } from "./HomeCanvas";
import { StaticBackdrop } from "./StaticBackdrop";
import type { ErpGroup } from "./erp-groups";
import { CHAPTERS, CHAPTER_LAYER, ERP_LAYER, ERP_TINT, LAYER_TINT, TRACE_STEPS, erpStep, traceStep, type ChapterId } from "./story";
import type { AnchorId } from "./UnifiedScene";

const HomeCanvas = dynamic(() => import("./HomeCanvas"), { ssr: false });

/** Altura de cada capítulo (el contenido queda sticky mientras la escena anima). */
const CHAPTER_HEIGHT: Record<ChapterId, string> = {
  hero: "h-[160vh]",
  fisica: "h-[180vh]",
  vision: "h-[180vh]",
  iot: "h-[170vh]",
  robotica: "h-[180vh]",
  central: "h-[190vh]",
  erp: "h-[210vh]",
  traza: "h-[200vh]",
  escala: "h-[190vh]",
};

const LAYER_CHAPTER: ChapterId[] = ["fisica", "vision", "iot", "robotica", "central"];
const LAYER_LINKS = [
  "/servicios/operacion-en-campo",
  "/vision",
  "/servicios/monitoreo-inteligente#iot-y-domotica",
  "/laboratorio",
  "/servicios/centro-de-operaciones",
];
const STEP_TINT = [...LAYER_TINT, "#35e0a1"];
const STATUS_STYLE: Record<HomeDict["layers"][number]["status"], string> = {
  live: "border-[#35e0a1]/50 text-[#7ff0c4]",
  pilot: "border-[#ffb547]/50 text-[#ffd391]",
  lab: "border-dashed border-[#a88bff]/60 text-[#cdbbff]",
};
/** Color de cada estado del catálogo (mismo código que /servicios). */
const CATALOG_STATUS_COLOR: Record<ErpGroup["modules"][number]["estado"], string> = {
  vivo: "#35e0a1",
  piloto: "#ffb547",
  proximamente: "#6b8aff",
  "hoja-de-ruta": "#9eb0c0",
};
/** Tinte de cada bloque del ERP (mismo orden que las baldosas del cimiento 3D). */
const ERP_GROUP_TINT = ["#5fd8ff", "#6b8aff", "#a88bff", "#35e0a1", "#ffb547", "#4fd1c5", "#d5e0ff"];

/** Re menor pentatónica (semitonos sobre el ping en Re): cada paso de la traza sube. */
const PING_ESCALA = [0, 3, 5, 7, 10, 12];

/** Capa de pulso de la música: entra con la traza, se sostiene en la escala y queda leve después. */
function pulsoDe(c: number, dentro: boolean) {
  if (!dentro) return 0.3;
  if (c < 5.3) return 0;
  if (c < 6) return (c - 5.3) / 0.7;
  return c < 7.2 ? 1 : 0.6;
}

export type HomeCounts = { areas: number; modules: number; live: number; analytics: number };

// ───────────────────────── Entorno del navegador ─────────────────────────


function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

// ───────────────────────── Componente principal ─────────────────────────

export function HomeExperience({ counts, erpGroups }: { counts: HomeCounts; erpGroups: ErpGroup[] }) {
  const { t } = useI18n();
  const h = t.home;
  const store = useMemo(() => createChapterStore(0), []);

  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const webgl = useSyncExternalStore(noopSubscribe, supportsWebGL, () => false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarse = useMediaQuery("(pointer: coarse), (max-width: 767px)");
  const fewCores = useSyncExternalStore(noopSubscribe, isModestDevice, () => false);
  const lowPower = coarse || fewCores;

  // Fallos fatales del 3D (contexto perdido sin restaurar o error al crear la escena).
  // El primero remonta el canvas una vez; el segundo deja el respaldo estático.
  const [failures, setFailures] = useState(0);
  const failed = failures >= 2;
  const [chapterIdx, setChapterIdx] = useState(0);
  const [step, setStep] = useState(-1);
  const [erpIdx, setErpIdx] = useState(-1);
  const [storyVisible, setStoryVisible] = useState(true);
  const [inStory, setInStory] = useState(true);

  const storyRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  // Scroll → capítulo continuo. Cada capítulo "vive" en el centro de su tramo sticky.
  useEffect(() => {
    let mids: number[] = [];
    let storyEnd = Infinity;
    let frame = 0;
    const measure = () => {
      const vh = window.innerHeight;
      const story = storyRef.current;
      if (story) storyEnd = story.getBoundingClientRect().bottom + window.scrollY;
      mids = sectionRefs.current.map((el) => {
        if (!el) return 0;
        const top = el.getBoundingClientRect().top + window.scrollY;
        return top + Math.max(0, el.offsetHeight - vh) / 2;
      });
    };
    const compute = () => {
      frame = 0;
      const y = window.scrollY;
      let c = 0;
      if (mids.length > 1 && y > mids[0]) {
        c = mids.length - 1;
        for (let i = 0; i < mids.length - 1; i++) {
          if (y < mids[i + 1]) {
            c = i + (y - mids[i]) / Math.max(1, mids[i + 1] - mids[i]);
            break;
          }
        }
      }
      store.set(c);
      const dentro = y + window.innerHeight * 0.6 < storyEnd;
      motorNarracion.parametros({ brillo: dentro ? 0.15 + 0.85 * (c / 7) : 0.75, pulso: pulsoDe(c, dentro) });
      setChapterIdx(Math.round(c));
      setStep(traceStep(c));
      setErpIdx(erpStep(c));
      setInStory(dentro);
    };
    // Cálculo directo (barato): no depende de rAF, que el navegador pausa en pestañas ocultas.
    const onScroll = () => {
      cancelAnimationFrame(frame);
      compute();
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    frame = requestAnimationFrame(compute);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [store]);

  useEffect(() => {
    const el = storyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStoryVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Efectos sonoros: barrido al cambiar de capítulo, ping por cada paso de la traza.
  const prevChapter = useRef(chapterIdx);
  useEffect(() => {
    if (prevChapter.current === chapterIdx) return;
    prevChapter.current = chapterIdx;
    motorNarracion.sfx("transicion", { volumen: 0.6 });
  }, [chapterIdx]);
  const prevStep = useRef(step);
  useEffect(() => {
    const antes = prevStep.current;
    prevStep.current = step;
    if (step <= antes || step < 0) return;
    if (step === TRACE_STEPS - 1) motorNarracion.sfx("cierre");
    else motorNarracion.sfx("ping", { semitonos: PING_ESCALA[step] ?? 0, volumen: 0.8 });
  }, [step]);

  const onFail = useCallback(() => setFailures((n) => n + 1), []);
  const use3D = mounted && webgl && !failed;
  // Intento (failures) cuyo canvas ya pintó su primer cuadro: si se remonta, vuelve el cargador.
  const [listoEn, setListoEn] = useState(-1);
  const onListo = useCallback(() => setListoEn(failures), [failures]);
  const listo3D = use3D && listoEn === failures;
  const activeLayer = CHAPTER_LAYER[CHAPTERS[Math.min(chapterIdx, CHAPTERS.length - 1)]];

  const labels = useMemo<Record<AnchorId, CanvasLabel>>(() => {
    const s = h.trace.steps;
    const layer = (i: number): CanvasLabel => ({ text: h.layers[i].name, meta: h.status[h.layers[i].status] });
    return {
      p0: layer(0),
      p1: layer(1),
      p2: layer(2),
      p3: layer(3),
      p4: layer(4),
      guard: { text: h.labels.guard, meta: s[0].time },
      camera: { text: h.labels.camera, meta: s[1].time },
      sensor: { text: h.labels.sensor, meta: s[2].time },
      robot: { text: h.labels.robot, meta: s[3].time },
      central: { text: h.labels.central, meta: s[4].time },
      board: { text: h.labels.board, meta: s[5].time },
      erp: { text: h.labels.erp, meta: h.erp.tag },
    };
  }, [h]);

  const board = useMemo(
    () => ({
      title: h.board.title,
      live: h.board.live,
      done: h.board.done,
      sites: h.board.sites,
      rows: h.trace.steps.map((s) => s.short),
      times: h.trace.steps.map((s) => s.time),
    }),
    [h]
  );

  const erpScene = useMemo(() => ({ title: h.erp.sceneTitle, subtitle: h.erp.sceneSubtitle, modules: h.erp.modules }), [h]);

  return (
    <div className="relative text-foreground">
      <Header />

      {/* Escena fija detrás de la historia */}
      <div
        className={cn(
          "pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700",
          storyVisible ? "opacity-100" : "opacity-0"
        )}
      >
        {mounted && !use3D && <StaticBackdrop note={h.staticNote} />}
        {use3D && (
          <div
            className={cn(
              "absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-out motion-reduce:transition-opacity",
              listo3D ? "scale-100 opacity-100" : "scale-[1.04] opacity-0 motion-reduce:scale-100"
            )}
          >
            <HomeCanvas
              key={failures}
              store={store}
              reducedMotion={reducedMotion}
              lowPower={lowPower}
              active={storyVisible}
              labels={labels}
              board={board}
              erp={erpScene}
              onFail={onFail}
              onListo={onListo}
            />
          </div>
        )}
        {/* Mientras baja e inicia el 3D (también antes de hidratar): la plataforma encendiéndose. */}
        {(!mounted || use3D) && <CargaTecnologica variante="pantalla" listo={listo3D} />}
        {/* Velos para legibilidad del texto */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020a18]/90 to-transparent" />
        <div className="absolute inset-y-0 left-0 hidden w-[56%] bg-gradient-to-r from-[#020a18]/95 via-[#020a18]/55 to-transparent md:block" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#020a18] via-[#020a18]/75 to-transparent md:hidden" />
      </div>

      <LayerRail h={h} active={activeLayer} visible={inStory && chapterIdx > 0} />
      <TraceHud h={h} step={inStory ? step : -1} />

      <main>
        <div ref={storyRef} className="relative">
          {CHAPTERS.map((id, i) => (
            <section
              key={id}
              id={id}
              data-narracion={`home/${id}`}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              aria-labelledby={`${id}-title`}
              className={cn("relative", CHAPTER_HEIGHT[id])}
            >
              <div className="sticky top-0 flex h-[100svh] items-end px-4 pb-6 pt-32 md:items-center md:px-10 md:pb-0 lg:px-16">
                <ChapterContent id={id} h={h} counts={counts} erpIdx={erpIdx} />
              </div>
            </section>
          ))}
        </div>

        <ErpBase h={h} groups={erpGroups} />
        <Recap h={h} />
        <Contact h={h} />
        <Footer tagline={t.footer.tagline} />
      </main>
    </div>
  );
}

// ───────────────────────── Header ─────────────────────────

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-10">
        <Link href="/" aria-label="ARS Intelligence" className="flex shrink-0 items-center">
          <Image
            src="/images/logos/horizontal-blanco.png"
            alt="ARS Intelligence"
            width={1672}
            height={941}
            sizes="64px"
            priority
            className="h-8 w-auto md:h-9"
          />
        </Link>
        <SiteNav contacto="#contacto" idioma />
      </div>
    </header>
  );
}

// ───────────────────────── HUD: capas y traza ─────────────────────────

function StatusChip({ h, status, className }: { h: HomeDict; status: HomeDict["layers"][number]["status"]; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block border px-1.5 py-0.5 font-mono text-[8.5px] font-semibold uppercase leading-none tracking-[0.18em]",
        STATUS_STYLE[status],
        className
      )}
    >
      {h.status[status]}
    </span>
  );
}

function LayerRail({ h, active, visible }: { h: HomeDict; active: number; visible: boolean }) {
  return (
    <aside
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed right-10 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 xl:block",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <ol className="flex flex-col gap-4">
        {h.layers.map((layer, i) => {
          const on = active === i || active >= 5;
          const current = active === i;
          const tint = LAYER_TINT[i];
          return (
            <li key={layer.tag} className="flex items-center justify-end gap-3 text-right">
              <div className={cn("transition-all duration-500", on || active > i ? "opacity-100" : "opacity-35")}>
                <div className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: tint }}>
                  {layer.tag}
                </div>
                <div className="mt-0.5 text-sm font-bold text-white">{layer.name}</div>
              </div>
              <span
                className="block w-[3px] transition-all duration-500"
                style={{ height: current ? 40 : 18, background: on || active > i ? tint : "rgba(213,224,255,0.25)" }}
              />
            </li>
          );
        })}
      </ol>
      {/* La traza une todas las capas */}
      <div className={cn("mr-px mt-4 flex justify-end transition-opacity duration-500", active === 5 ? "opacity-100" : "opacity-0")}>
        <span className="h-10 w-[3px] bg-gradient-to-b from-[#d5e0ff] to-[#35e0a1]" />
      </div>
      {/* La base: el ERP de gestión, debajo de las cinco capas */}
      <div className="mt-4 flex items-center justify-end gap-3 border-t border-white/10 pt-4 text-right">
        <div className={cn("transition-all duration-500", active >= 5 ? "opacity-100" : "opacity-35")}>
          <div className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: ERP_TINT }}>
            {h.erp.tag}
          </div>
          <div className="mt-0.5 text-sm font-bold text-white">{h.erp.name}</div>
        </div>
        <span
          className="block w-[3px] transition-all duration-500"
          style={{ height: active === ERP_LAYER ? 40 : 18, background: active >= 5 ? ERP_TINT : "rgba(213,224,255,0.25)" }}
        />
      </div>
    </aside>
  );
}

function TraceHud({ h, step }: { h: HomeDict; step: number }) {
  const visible = step >= 0;
  const cur = Math.max(0, step);
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-x-4 top-[72px] z-40 transition-all duration-500 md:inset-x-auto md:bottom-8 md:right-10 md:top-auto",
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 md:translate-y-2"
      )}
    >
      <div className="border border-white/10 bg-[#020a18]/80 px-3 py-2.5 backdrop-blur-md md:px-4 md:py-3">
        <div className="mb-2 flex items-center justify-between gap-6 font-mono text-[9px] uppercase tracking-[0.28em] text-[#9eb0c0]">
          <span className="flex items-center gap-2">
            <span className="inline-block size-1.5 animate-pulse bg-[#d5e0ff] motion-reduce:animate-none" />
            {h.trace.label}
          </span>
          <span className="tabular-nums text-white/80">{h.trace.steps[cur].time}</span>
        </div>
        <ol className="grid grid-cols-6 gap-1 md:flex md:gap-1.5">
          {h.trace.steps.map((s, i) => {
            const done = step > i;
            const on = step === i;
            return (
              <li key={s.time} className="min-w-0 md:w-[6.6rem]">
                <div
                  className="h-[3px] transition-colors duration-500"
                  style={{ background: on || done ? STEP_TINT[i] : "rgba(255,255,255,0.12)", opacity: done && !on ? 0.6 : 1 }}
                />
                <div
                  className={cn(
                    "mt-1.5 hidden truncate font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors md:block",
                    on ? "text-white" : done ? "text-white/60" : "text-white/30"
                  )}
                >
                  {s.short}
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white md:hidden">
          <span className="mr-1.5 text-white/40">
            {String(cur + 1).padStart(2, "0")}/{String(TRACE_STEPS).padStart(2, "0")}
          </span>
          {h.trace.steps[cur].short}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Capítulos ─────────────────────────

function Panel({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={cn(
        "w-full border border-white/10 bg-[#020a18]/80 p-5 backdrop-blur-md md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none",
        wide ? "max-w-2xl" : "max-w-[34rem]"
      )}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, tint, extra }: { children: ReactNode; tint: string; extra?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#9eb0c0] md:mb-5 md:text-[11px]">
      <span className="inline-block size-2" style={{ background: tint, boxShadow: `0 0 12px ${tint}` }} />
      {children}
      {extra}
    </div>
  );
}

function Title({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={`${id}-title`}
      className="text-balance font-heading text-[1.6rem] font-black leading-[1.06] tracking-tight text-white md:text-5xl lg:text-[3.3rem]"
    >
      {children}
    </h2>
  );
}

function Body({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm leading-relaxed text-[#c5d2ee] md:mt-6 md:text-lg">{children}</p>;
}

function Points({ items, tint }: { items: string[]; tint: string }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5 md:mt-7 md:gap-2">
      {items.map((p) => (
        <li
          key={p}
          className="flex items-center gap-2 border border-white/12 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/85 md:px-3 md:text-[10.5px]"
        >
          <span className="inline-block size-1" style={{ background: tint }} />
          {p}
        </li>
      ))}
    </ul>
  );
}

function CtaLink({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  const cls = cn(
    "bevel-btn inline-flex items-center gap-3 px-5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] transition-colors md:px-7 md:py-4 md:text-xs",
    primary
      ? "bg-white text-[#020a18] hover:bg-[#d5e0ff]"
      : "border border-white/25 bg-white/[0.04] text-white hover:border-[#6b8aff] hover:bg-white/10"
  );
  const inner = (
    <>
      <span className={primary ? "text-[#2348d4]" : "text-[#6b8aff]"}>▸</span>
      {children}
    </>
  );
  return href.startsWith("#") ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

function ChapterContent({ id, h, counts, erpIdx }: { id: ChapterId; h: HomeDict; counts: HomeCounts; erpIdx: number }) {
  if (id === "hero") {
    return (
      <div className="w-full max-w-3xl">
        <Eyebrow tint="#6b8aff">{h.hero.eyebrow}</Eyebrow>
        <h1
          id="hero-title"
          className="text-balance font-heading text-[2.3rem] font-black leading-[1.02] tracking-tight text-white md:text-7xl lg:text-[5rem]"
        >
          {h.hero.title1}
          <br />
          <span className="brand-gradient-text">{h.hero.title2}</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#c5d2ee] md:mt-7 md:text-xl">{h.hero.body}</p>
        {/* Las cinco capas, de un vistazo */}
        <ol className="mt-5 flex max-w-xl flex-wrap gap-1.5 md:mt-7">
          {h.layers.map((l, i) => (
            <li
              key={l.tag}
              className="flex items-center gap-1.5 border border-white/12 bg-[#020a18]/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/85 md:text-[10px]"
            >
              <span className="inline-block size-1.5" style={{ background: LAYER_TINT[i] }} />
              {l.name}
            </li>
          ))}
          {/* La base: el ERP de gestión sostiene las cinco capas */}
          <li
            className="flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white md:text-[10px]"
            style={{ borderColor: `${ERP_TINT}99`, background: `${ERP_TINT}1f` }}
          >
            <span className="inline-block h-1.5 w-3" style={{ background: ERP_TINT }} />
            {h.erp.tag} · {h.erp.name}
          </li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-3 md:mt-9">
          <CtaLink href="#contacto" primary>
            {h.hero.ctaPrimary}
          </CtaLink>
          <CtaLink href="#traza">{h.hero.ctaSecondary}</CtaLink>
        </div>
        <ul className="mt-6 hidden max-w-xl flex-wrap gap-x-6 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#9eb0c0] md:mt-9 md:flex">
          {h.hero.trust.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-[#35e0a1]">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 md:flex">
          <span className="relative block h-9 w-[2px] overflow-hidden bg-white/15">
            <span className="absolute inset-x-0 top-0 block h-1/2 animate-[home-scroll_1.8s_ease-in-out_infinite] bg-[#6b8aff] motion-reduce:animate-none" />
          </span>
          {h.hero.scroll}
        </div>
      </div>
    );
  }

  const c = h.chapters[id];
  const layerIdx = LAYER_CHAPTER.indexOf(id);
  if (layerIdx >= 0) {
    const layer = h.layers[layerIdx];
    const tint = LAYER_TINT[layerIdx];
    return (
      <Panel>
        <Eyebrow tint={tint} extra={<StatusChip h={h} status={layer.status} />}>
          {c.eyebrow}
        </Eyebrow>
        <Title id={id}>{c.title}</Title>
        <Body>{c.body}</Body>
        {id === "vision" && <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">* {h.visionNote}</p>}
        <Points items={c.points} tint={tint} />
        {(id === "vision" || id === "robotica") && (
          <div className="mt-5 hidden md:mt-8 md:block">
            <CtaLink href={LAYER_LINKS[layerIdx]}>{id === "vision" ? h.ctas.vision : h.ctas.lab}</CtaLink>
          </div>
        )}
      </Panel>
    );
  }

  if (id === "erp") {
    return (
      <Panel wide>
        <Eyebrow tint={ERP_TINT}>{c.eyebrow}</Eyebrow>
        <Title id={id}>{c.title}</Title>
        <p className="mt-3 hidden text-sm leading-relaxed text-[#c5d2ee] sm:block md:mt-5 md:text-lg">{c.body}</p>
        <div className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9eb0c0] md:mt-6 md:text-[10.5px]">{h.erp.flowLabel}</div>
        <ol className="mt-2 grid gap-1.5 md:gap-2">
          {h.erp.flow.map((f, i) => {
            const on = erpIdx >= i;
            return (
              <li
                key={f.to}
                className={cn(
                  "border px-3 py-2 transition-colors duration-500 md:px-4 md:py-2.5",
                  on ? "border-[#6b8aff]/60 bg-[#6b8aff]/10" : "border-white/10 bg-[#020a18]/50"
                )}
              >
                <div className="flex flex-wrap items-center gap-x-2 font-mono text-[9.5px] uppercase tracking-[0.14em] md:text-[10.5px]">
                  <span className={on ? "text-white/80" : "text-white/40"}>{f.from}</span>
                  <span style={{ color: on ? ERP_TINT : "rgba(255,255,255,0.3)" }}>→</span>
                  <span className={cn("font-bold", on ? "text-white" : "text-white/45")}>{f.to}</span>
                </div>
                <p className={cn("mt-0.5 hidden text-[13px] leading-snug md:block", on ? "text-[#c5d2ee]" : "text-[#c5d2ee]/50")}>{f.text}</p>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 hidden font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.16em] text-white/45 md:block">{h.erp.note}</p>
        <div className="mt-4 hidden md:mt-6 md:block">
          <CtaLink href="#la-base">{h.erpSection.title.split(":")[0]}</CtaLink>
        </div>
      </Panel>
    );
  }

  if (id === "traza") {
    return (
      <Panel wide>
        <Eyebrow tint="#d5e0ff">{c.eyebrow}</Eyebrow>
        <Title id={id}>{c.title}</Title>
        <p className="mt-3 hidden text-sm leading-relaxed text-[#c5d2ee] sm:block md:mt-5 md:text-lg">{c.body}</p>
        <ol className="relative mt-4 space-y-2 border-l border-white/15 pl-4 md:mt-6 md:space-y-2.5">
          {h.trace.steps.map((s, i) => (
            <li key={s.time} className="relative">
              <span className="absolute -left-[1.32rem] top-1 inline-block size-2" style={{ background: STEP_TINT[i] }} />
              <div className="flex flex-wrap items-baseline gap-x-3 font-mono text-[9.5px] uppercase tracking-[0.16em] md:text-[10.5px]">
                <span className="tabular-nums text-white">{s.time}</span>
                <span style={{ color: STEP_TINT[i] }}>{s.layer}</span>
              </div>
              <p className="mt-0.5 hidden text-[13px] leading-snug text-[#c5d2ee] md:block">{s.text}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-[#c5d2ee] md:hidden">{s.short}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/40">{h.trace.demo}</p>
      </Panel>
    );
  }

  // escala
  const stats = [
    { value: counts.areas, label: h.stats.areas },
    { value: counts.modules, label: h.stats.modules },
    { value: counts.live, label: h.stats.live },
    { value: counts.analytics, label: h.stats.analytics },
  ];
  return (
    <Panel wide>
      <Eyebrow tint="#6b8aff">{c.eyebrow}</Eyebrow>
      <Title id={id}>{c.title}</Title>
      <Body>{c.body}</Body>
      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 md:mt-8 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse bg-[#020a18]/85 p-3 md:p-4">
            <dt className="mt-1 font-mono text-[8.5px] uppercase leading-snug tracking-[0.18em] text-[#9eb0c0] md:text-[9.5px]">{s.label}</dt>
            <dd className="font-heading text-2xl font-black tracking-tight text-white md:text-3xl">{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex flex-wrap gap-3 md:mt-8">
        <CtaLink href="#contacto" primary>
          {h.hero.ctaPrimary}
        </CtaLink>
        <CtaLink href="/servicios">{h.ctas.services}</CtaLink>
      </div>
    </Panel>
  );
}

// ───────────────────────── Después de la historia ─────────────────────────

function ErpBase({ h, groups }: { h: HomeDict; groups: ErpGroup[] }) {
  const s = h.erpSection;
  return (
    <section id="la-base" aria-labelledby="la-base-title" className="relative scroll-mt-20 border-t border-white/10 bg-[#020a18] py-20 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(107,138,255,0.14),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-10">
        <Eyebrow tint={ERP_TINT}>{s.eyebrow}</Eyebrow>
        <h2 id="la-base-title" className="max-w-3xl text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
          {s.title}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#c5d2ee] md:text-lg">{s.body}</p>

        {/* Nivel 1 · Operación (arriba) */}
        <div className="mt-10 border border-white/10 bg-white/[0.02] p-4 md:mt-14 md:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0]">{s.opsTag}</div>
              <h3 className="mt-1 text-lg font-black text-white md:text-xl">{s.opsTitle}</h3>
            </div>
          </div>
          <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {h.layers.map((l, i) => (
              <li key={l.tag}>
                <Link
                  href={LAYER_LINKS[i]}
                  className="flex h-full flex-col gap-2 border border-white/10 bg-[#020a18]/70 p-3 transition-colors hover:border-white/25 hover:bg-white/[0.05]"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em]" style={{ color: LAYER_TINT[i] }}>
                      {l.tag}
                    </span>
                    <StatusChip h={h} status={l.status} />
                  </span>
                  <span className="text-sm font-bold text-white">{l.name}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        {/* Flujo: la operación alimenta la gestión */}
        <div className="flex items-center justify-center gap-3 py-4 md:py-5" aria-hidden="false">
          <span className="h-8 w-px bg-gradient-to-b from-white/30 to-[#6b8aff]" />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-[#c5d2ee] md:text-[10.5px]">
            <span className="text-[#6b8aff]">↓</span> {s.feeds} <span className="text-[#6b8aff]">↓</span>
          </span>
          <span className="h-8 w-px bg-gradient-to-b from-white/30 to-[#6b8aff]" />
        </div>

        {/* Nivel 2 · Gestión (abajo): módulos reales del catálogo */}
        <div className="border p-4 md:p-6" style={{ borderColor: `${ERP_TINT}55`, background: `${ERP_TINT}0d` }}>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: ERP_TINT }}>
              {s.mgmtTag}
            </div>
            <h3 className="mt-1 text-lg font-black text-white md:text-xl">
              {s.mgmtTitle} · <span className="text-[#c5d2ee]">{h.erp.name}</span>
            </h3>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map((g, i) => {
              const tint = ERP_GROUP_TINT[i % ERP_GROUP_TINT.length];
              return (
                <li key={h.erp.modules[i]} className="relative border border-white/10 bg-[#020a18]/80 p-4">
                  <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: tint }} />
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-white/40">{String(i + 1).padStart(2, "0")}</span>
                    <h4 className="text-base font-black text-white">{h.erp.modules[i]}</h4>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {g.modules.map((m) => (
                      <li key={m.id}>
                        <Link
                          href={`/servicios/${m.area}#${m.id}`}
                          className="group flex items-start gap-2 text-[13px] leading-snug text-[#c5d2ee] transition-colors hover:text-white"
                          title={m.nota}
                        >
                          <span
                            className="mt-[5px] inline-block size-1.5 shrink-0 rounded-full"
                            style={{ background: CATALOG_STATUS_COLOR[m.estado] }}
                            aria-hidden="true"
                          />
                          <span>
                            {m.nombre}
                            {m.estado !== "vivo" && (
                              <span
                                className="ml-1.5 whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.16em]"
                                style={{ color: CATALOG_STATUS_COLOR[m.estado] }}
                              >
                                · {s.status[m.estado]}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
            {/* ¿Ya tiene un ERP? */}
            <li className="flex flex-col justify-between gap-4 border border-dashed border-white/20 p-4">
              <p className="text-[13px] leading-relaxed text-[#c5d2ee]">{s.interop}</p>
              <Link
                href="/servicios/finanzas-y-erp#agente-interoperador-de-datos"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white"
              >
                <span style={{ color: ERP_TINT }}>▸</span> {h.ctas.services}
              </Link>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/55">
            {(Object.keys(CATALOG_STATUS_COLOR) as Array<keyof typeof CATALOG_STATUS_COLOR>).map((k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full" style={{ background: CATALOG_STATUS_COLOR[k] }} />
                {s.status[k]}
              </span>
            ))}
            <span className="normal-case tracking-normal text-white/40">{s.catalogNote}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 md:mt-10">
          <CtaLink href="/arquitectura" primary>
            {s.cta}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}

function Recap({ h }: { h: HomeDict }) {
  return (
    <section data-narracion="home/recap" aria-labelledby="recap-title" className="relative border-t border-white/10 bg-[#020a18] py-20 md:py-28">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-10">
        <Eyebrow tint="#6b8aff">{h.recap.eyebrow}</Eyebrow>
        <h2 id="recap-title" className="max-w-3xl text-balance font-heading text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
          {h.recap.title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#c5d2ee] md:text-lg">{h.recap.body}</p>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 md:mt-14 lg:grid-cols-5">
          {h.layers.map((item, i) => {
            const tint = LAYER_TINT[i];
            return (
              <li key={item.tag}>
                <Link
                  href={LAYER_LINKS[i]}
                  className="group relative flex h-full flex-col border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.05] md:p-6"
                >
                  <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: tint }} />
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: tint }}>
                      {item.tag}
                    </span>
                    <StatusChip h={h} status={item.status} />
                  </span>
                  <span className="mt-3 text-lg font-black text-white md:text-xl">{item.name}</span>
                  <span className="mt-3 flex-1 text-sm leading-relaxed text-[#c5d2ee]">{item.body}</span>
                  <span className="mt-6 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/80 group-hover:text-white">
                    <span style={{ color: tint }}>▸</span> {item.cta}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 flex flex-wrap justify-end gap-3 md:mt-10">
          <CtaLink href={RUTA_DIAGNOSTICO} primary>
            {h.ctas.diagnostic}
          </CtaLink>
          <CtaLink href="/plataforma">{h.ctas.platform}</CtaLink>
          <CtaLink href="/servicios">{h.ctas.services}</CtaLink>
        </div>
      </div>
    </section>
  );
}

function Contact({ h }: { h: HomeDict }) {
  const { locale } = useI18n();
  const conExperiencia = locale === "es";
  // Mientras la experiencia está en su inicio, el formulario va a su lado; al empezar, la experiencia toma todo el ancho.
  const [enInicio, setEnInicio] = useState(true);
  const lado = conExperiencia && enInicio;
  return (
    <section id="contacto" data-narracion="home/contacto" aria-labelledby="contacto-title" className="relative isolate overflow-hidden bg-[#020a18] py-20 md:py-28">
      {/* Alias de la antigua ancla `/#cierre` (enlaces y asistente previos). */}
      <span id="cierre" aria-hidden="true" className="absolute top-0" />
      <div className="absolute inset-0 -z-10">
        <div className="brand-gradient absolute inset-0 opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(107,138,255,0.35),transparent_55%)]" />
        <div className="grid-bg absolute inset-0 opacity-20" />
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        <div className="grid gap-8 text-white md:grid-cols-[1.2fr_1fr] md:items-end md:gap-16">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/70">{h.contact.eyebrow}</div>
            <h2 id="contacto-title" className="mt-5 font-heading text-4xl font-black leading-[1.03] tracking-tight md:text-6xl">
              {h.contact.title1}
              <br />
              <span className="text-white/80">{h.contact.title2}</span>
            </h2>
          </div>
          <div>
            <p className="max-w-lg text-base leading-relaxed text-white/85 md:text-lg">{h.contact.body}</p>
            {conExperiencia && (
              <ol className="mt-6 grid gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/80 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center bg-white text-[10px] font-bold text-[#142664]">1</span>
                  Autodiagnóstico con IA
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center border border-white/50 text-[10px] font-bold">2</span>
                  Contacto directo
                </li>
              </ol>
            )}
          </div>
        </div>

        <div className={cn("mt-10 grid gap-6 md:mt-14", lado && "lg:grid-cols-[1.55fr_1fr] lg:items-stretch")}>
          {conExperiencia && (
            /* Propuesta ARS: entrevista guiada → propuesta con IA → PDF → asesor. */
            <div id="propuesta" className={cn("scroll-mt-20", enInicio && "cta-destacado")}>
              <ExperienciaPropuesta className="h-full [&>section]:h-full [&>section]:bg-[#020a18]/85" onEnInicio={setEnInicio} formularioAparte />
            </div>
          )}
          {(lado || !conExperiencia) && <ContactoDirecto h={h} />}
        </div>
        {conExperiencia && !enInicio && (
          <div className="mt-6 flex flex-wrap items-center gap-3 border border-white/15 bg-[#020a18]/45 px-5 py-4 text-white backdrop-blur">
            <span className="mr-auto text-sm text-white/80">¿Prefiere hablar directo con un asesor?</span>
            <CanalesDirectos h={h} compacto />
          </div>
        )}
      </div>
    </section>
  );
}

function CanalesDirectos({ h, compacto }: { h: HomeDict; compacto?: boolean }) {
  const base = cn(
    "bevel-btn inline-flex items-center justify-center gap-3 whitespace-nowrap font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors",
    compacto ? "px-5 py-3" : "min-h-12 flex-1 basis-[13rem] px-5 py-3.5",
  );
  return (
    <div className={cn("flex flex-wrap gap-3", !compacto && "w-full")}>
      <a
        href={whatsappUrl("Hola ARS Intelligence, quiero hablar con un asesor.")}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, "bg-[#25d366] text-[#04210f] hover:bg-[#3ee07a]")}
      >
        <WhatsAppIcon className="size-4" /> {h.contact.whatsapp}
      </a>
      <a href={mailtoUrl()} className={cn(base, "border border-white/50 text-white hover:bg-white/10")}>
        <Mail className="size-4" aria-hidden="true" /> {h.contact.email}
      </a>
    </div>
  );
}

function ContactoDirecto({ h }: { h: HomeDict }) {
  const es = useI18n().locale === "es";
  return (
    <aside aria-labelledby="contacto-directo" className="flex flex-col border border-white/20 bg-[#020a18]/70 p-5 text-white backdrop-blur sm:p-7 md:p-8">
      <span className="inline-flex w-fit items-center gap-2 border border-white/30 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white/80">
        <MessageSquare className="size-3.5" aria-hidden="true" /> {es ? "Contacto directo" : "Direct contact"}
      </span>
      <h3 id="contacto-directo" className="mt-5 font-heading text-2xl font-black leading-tight tracking-tight md:text-3xl">
        {h.contact.formTitle}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[#c5d2ee]/90">
        {es ? "Escríbanos ahora o déjenos sus datos y un asesor lo contacta." : "Message us now or leave your details and an advisor will reach out."}
      </p>
      <div className="mt-5">
        <CanalesDirectos h={h} />
      </div>
      <div className="my-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
        <span className="h-px flex-1 bg-white/20" /> {es ? "o déjenos sus datos" : "or leave your details"} <span className="h-px flex-1 bg-white/20" />
      </div>
      <ContactForm sinWhatsapp />
    </aside>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29-.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 9.89 9.89c0 5.45-4.44 9.88-9.9 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.17-1.24-6.16-3.48-8.4" />
    </svg>
  );
}

function Footer({ tagline }: { tagline: string }) {
  return (
    <footer className="border-t border-white/10 bg-[#020a18] py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 md:flex-row md:px-10">
        <Image src="/images/logos/horizontal-blanco.png" alt="ARS Intelligence" width={1672} height={941} sizes="50px" className="h-7 w-auto opacity-80" />
        <p className="font-serif text-sm italic text-foreground/55">{tagline}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40">© {new Date().getFullYear()} ARS Intelligence</p>
      </div>
    </footer>
  );
}
