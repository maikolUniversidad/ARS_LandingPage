"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ContactForm } from "@/components/ContactForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { isModestDevice, noopSubscribe, supportsWebGL } from "@/lib/three/webgl";
import { useI18n } from "@/lib/i18n/context";
import type { HomeDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { createChapterStore } from "./chapter-store";
import type { CanvasLabel } from "./HomeCanvas";
import { StaticBackdrop } from "./StaticBackdrop";
import { CHAPTERS, CHAPTER_LAYER, LAYER_TINT, TRACE_STEPS, traceStep, type ChapterId } from "./story";
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

export function HomeExperience({ counts }: { counts: HomeCounts }) {
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
      setChapterIdx(Math.round(c));
      setStep(traceStep(c));
      setInStory(y + window.innerHeight * 0.6 < storyEnd);
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

  const onFail = useCallback(() => setFailures((n) => n + 1), []);
  const use3D = mounted && webgl && !failed;
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

  return (
    <div className="relative text-foreground">
      <Header h={h} />

      {/* Escena fija detrás de la historia */}
      <div
        className={cn(
          "pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700",
          storyVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <StaticBackdrop note={mounted && !use3D ? h.staticNote : undefined} />
        {use3D && (
          <HomeCanvas
            key={failures}
            store={store}
            reducedMotion={reducedMotion}
            lowPower={lowPower}
            active={storyVisible}
            labels={labels}
            board={board}
            onFail={onFail}
          />
        )}
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
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              aria-labelledby={`${id}-title`}
              className={cn("relative", CHAPTER_HEIGHT[id])}
            >
              <div className="sticky top-0 flex h-[100svh] items-end px-4 pb-6 pt-32 md:items-center md:px-10 md:pb-0 lg:px-16">
                <ChapterContent id={id} h={h} counts={counts} />
              </div>
            </section>
          ))}
        </div>

        <Recap h={h} />
        <Contact h={h} />
        <Footer tagline={t.footer.tagline} />
      </main>
    </div>
  );
}

// ───────────────────────── Header ─────────────────────────

function Header({ h }: { h: HomeDict }) {
  const { t } = useI18n();
  const link =
    "hidden items-center gap-2 px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:text-white lg:flex";
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
        <nav className="flex items-center gap-1 md:gap-2">
          <Link href="/servicios" className={link}>
            <span className="text-[#6b8aff]">✦</span>
            {t.nav.services}
          </Link>
          <Link href="/vision" className={link}>
            <span className="text-[#6b8aff]">◉</span>
            {h.nav.vision}
          </Link>
          <Link href="/plataforma" className={link}>
            <span className="text-[#6b8aff]">◇</span>
            {h.nav.platform}
          </Link>
          <Link href="/laboratorio" className={link}>
            <span className="text-[#6b8aff]">◎</span>
            {h.nav.lab}
          </Link>
          <Link href="/proyectos" className={link}>
            <span className="text-[#6b8aff]">▣</span>
            {t.nav.projects}
          </Link>
          <LanguageSwitcher />
          <a
            href="#contacto"
            className="bevel-btn ml-1 hidden items-center gap-2 bg-white px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#020a18] transition-colors hover:bg-[#d5e0ff] sm:flex"
          >
            ▸ {h.nav.contact}
          </a>
          <MobileMenu
            links={[
              { label: t.nav.services, href: "/servicios" },
              { label: h.nav.vision, href: "/vision" },
              { label: h.nav.platform, href: "/plataforma" },
              { label: h.nav.lab, href: "/laboratorio" },
              { label: t.nav.projects, href: "/proyectos" },
              { label: h.nav.contact, href: "#contacto", primary: true },
            ]}
          />
        </nav>
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
          const on = active === i || active === 5;
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

function ChapterContent({ id, h, counts }: { id: ChapterId; h: HomeDict; counts: HomeCounts }) {
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

function Recap({ h }: { h: HomeDict }) {
  return (
    <section aria-labelledby="recap-title" className="relative border-t border-white/10 bg-[#020a18] py-20 md:py-28">
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
          <CtaLink href="/plataforma">{h.ctas.platform}</CtaLink>
          <CtaLink href="/servicios">{h.ctas.services}</CtaLink>
        </div>
      </div>
    </section>
  );
}

function Contact({ h }: { h: HomeDict }) {
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="relative isolate overflow-hidden bg-[#020a18] py-20 md:py-28">
      {/* Alias de la antigua ancla `/#cierre` (enlaces y asistente previos). */}
      <span id="cierre" aria-hidden="true" className="absolute top-0" />
      <div className="absolute inset-0 -z-10">
        <div className="brand-gradient absolute inset-0 opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(107,138,255,0.35),transparent_55%)]" />
        <div className="grid-bg absolute inset-0 opacity-20" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-[1fr_1.1fr] md:gap-16 md:px-10">
        <div className="text-white">
          <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/70">{h.contact.eyebrow}</div>
          <h2 id="contacto-title" className="mt-5 font-heading text-4xl font-black leading-[1.03] tracking-tight md:text-6xl">
            {h.contact.title1}
            <br />
            <span className="text-white/80">{h.contact.title2}</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">{h.contact.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappUrl("Hola ARS Intelligence, quiero hablar con un asesor.")}
              target="_blank"
              rel="noopener noreferrer"
              className="bevel-btn inline-flex items-center gap-3 bg-white px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#142664] hover:bg-white/90"
            >
              ▸ {h.contact.whatsapp}
            </a>
            <a
              href={mailtoUrl()}
              className="bevel-btn inline-flex items-center gap-3 border border-white/40 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white/10"
            >
              ◇ {h.contact.email}
            </a>
          </div>
          <ul className="mt-10 flex max-w-lg flex-wrap gap-2 border-t border-white/20 pt-6">
            {h.layers.map((l, i) => (
              <li key={l.tag} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80">
                <span className="inline-block size-1.5" style={{ background: LAYER_TINT[i] }} />
                {l.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-white/15 bg-[#020a18]/45 p-5 backdrop-blur md:p-8">
          <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">{h.contact.formTitle}</div>
          <ContactForm />
        </div>
      </div>
    </section>
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
