"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ContactForm } from "@/components/ContactForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { useI18n } from "@/lib/i18n/context";
import type { HomeDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { createChapterStore } from "./chapter-store";
import { StaticBackdrop } from "./StaticBackdrop";
import { CHAPTERS, CHAPTER_LAYER, chainStep, type ChapterId } from "./story";

const HomeCanvas = dynamic(() => import("./HomeCanvas"), { ssr: false });

/** Altura de cada capítulo (el contenido queda sticky mientras la escena anima). */
const CHAPTER_HEIGHT: Record<ChapterId, string> = {
  hero: "h-[150vh]",
  capa1: "h-[180vh]",
  evento: "h-[170vh]",
  capa2: "h-[190vh]",
  alerta: "h-[180vh]",
  capa3: "h-[190vh]",
  escala: "h-[190vh]",
};

const LAYER_TINT = ["#9eb0c0", "#5fd8ff", "#6b8aff", "#35e0a1"] as const;
const CHAIN_TIMES = ["02:14:07", "02:14:07", "02:14:08", "02:15:30"];

// ───────────────────────── Entorno del navegador ─────────────────────────

const noopSubscribe = () => () => {};
let webglCache: boolean | undefined;
function detectWebGL() {
  if (webglCache === undefined) {
    try {
      const c = document.createElement("canvas");
      webglCache = Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}

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

export function HomeExperience() {
  const { t } = useI18n();
  const h = t.home;
  const store = useMemo(() => createChapterStore(0), []);

  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const webgl = useSyncExternalStore(noopSubscribe, detectWebGL, () => false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarse = useMediaQuery("(pointer: coarse), (max-width: 767px)");
  const fewCores = useSyncExternalStore(noopSubscribe, () => (navigator.hardwareConcurrency || 8) <= 4, () => false);
  const lowPower = coarse || fewCores;

  const [failed, setFailed] = useState(false);
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
      setStep(chainStep(c));
      setInStory(y + window.innerHeight * 0.6 < storyEnd);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
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

  // Pausa el WebGL cuando la historia sale de pantalla.
  useEffect(() => {
    const el = storyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStoryVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onFail = useCallback(() => setFailed(true), []);
  const use3D = mounted && webgl && !failed;
  const activeLayer = CHAPTER_LAYER[CHAPTERS[Math.min(chapterIdx, CHAPTERS.length - 1)]];

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
        <StaticBackdrop step={step} note={mounted && !use3D ? h.staticNote : undefined} />
        {use3D && (
          <HomeCanvas
            store={store}
            reducedMotion={reducedMotion}
            lowPower={lowPower}
            active={storyVisible}
            labels={h.labels}
            onFail={onFail}
          />
        )}
        {/* Velos para legibilidad del texto */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020a18]/90 to-transparent" />
        <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-r from-[#020a18]/95 via-[#020a18]/55 to-transparent md:block" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#020a18] via-[#020a18]/75 to-transparent md:hidden" />
      </div>

      <LayerRail h={h} active={activeLayer} visible={inStory && chapterIdx > 0} />
      <ChainHud h={h} step={inStory ? step : -1} />

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
              <div className="sticky top-0 flex h-[100svh] items-end px-4 pb-6 pt-28 md:items-center md:px-10 md:pb-0 lg:px-16">
                <ChapterContent id={id} h={h} />
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

// ───────────────────────── HUD: capas y cadena ─────────────────────────

function LayerRail({ h, active, visible }: { h: HomeDict; active: number; visible: boolean }) {
  return (
    <aside
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed right-10 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 xl:block",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <ol className="flex flex-col gap-5">
        {h.layers.map((layer, i) => {
          const on = active === i + 1;
          const tint = LAYER_TINT[i + 1];
          return (
            <li key={layer.tag} className="flex items-center justify-end gap-3 text-right">
              <div className={cn("transition-all duration-500", on ? "opacity-100" : "opacity-35")}>
                <div className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: tint }}>
                  {layer.tag}
                </div>
                <div className="mt-0.5 text-sm font-bold text-white">{layer.name}</div>
              </div>
              <span
                className="block w-[3px] transition-all duration-500"
                style={{ height: on ? 40 : 18, background: on ? tint : "rgba(213,224,255,0.25)" }}
              />
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function ChainHud({ h, step }: { h: HomeDict; step: number }) {
  const visible = step >= 0;
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
            <span className="inline-block size-1.5 animate-pulse bg-[#ff3b5c]" />
            {h.chain.label}
          </span>
          <span className="text-white/80">{CHAIN_TIMES[Math.max(0, step)]}</span>
        </div>
        <ol className="grid grid-cols-4 gap-1.5 md:flex md:gap-2">
          {h.chain.steps.map((label, i) => {
            const done = step > i;
            const on = step === i;
            return (
              <li key={label} className="min-w-0 md:w-36">
                <div
                  className={cn(
                    "h-[3px] transition-colors duration-500",
                    on ? "bg-[#ffb547]" : done ? "bg-[#6b8aff]" : "bg-white/12"
                  )}
                />
                <div
                  className={cn(
                    "mt-1.5 truncate font-mono text-[8.5px] uppercase tracking-[0.12em] transition-colors md:text-[10px] md:tracking-[0.16em]",
                    "hidden md:block",
                    on ? "text-white" : done ? "text-white/60" : "text-white/30"
                  )}
                >
                  <span className="mr-1 text-white/40">{String(i + 1).padStart(2, "0")}</span>
                  {label}
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white md:hidden">
          <span className="mr-1.5 text-white/40">{String(Math.max(0, step) + 1).padStart(2, "0")}/04</span>
          {h.chain.steps[Math.max(0, step)]}
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

function Eyebrow({ children, tint }: { children: ReactNode; tint: string }) {
  return (
    <div className="mb-3 flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#9eb0c0] md:mb-5 md:text-[11px]">
      <span className="inline-block size-2" style={{ background: tint, boxShadow: `0 0 12px ${tint}` }} />
      {children}
    </div>
  );
}

function Title({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={`${id}-title`}
      className="text-balance font-heading text-[1.65rem] font-black leading-[1.06] tracking-tight text-white md:text-5xl lg:text-[3.4rem]"
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

function ChapterContent({ id, h }: { id: ChapterId; h: HomeDict }) {
  switch (id) {
    case "hero":
      return (
        <div className="w-full max-w-3xl">
          <Eyebrow tint="#6b8aff">{h.hero.eyebrow}</Eyebrow>
          <h1
            id="hero-title"
            className="text-balance font-heading text-[2.35rem] font-black leading-[1.02] tracking-tight text-white md:text-7xl lg:text-[5.2rem]"
          >
            {h.hero.title1}
            <br />
            <span className="brand-gradient-text">{h.hero.title2}</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#c5d2ee] md:mt-7 md:text-xl">{h.hero.body}</p>
          <div className="mt-6 flex flex-wrap gap-3 md:mt-9">
            <CtaLink href="/vision" primary>
              {h.hero.ctaPrimary}
            </CtaLink>
            <CtaLink href="#contacto">{h.hero.ctaSecondary}</CtaLink>
          </div>
          <ul className="mt-6 grid max-w-xl grid-cols-2 gap-x-4 gap-y-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#9eb0c0] md:mt-10 md:flex md:flex-wrap md:gap-x-6 md:text-[10.5px]">
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
    case "capa1": {
      const c = h.chapters.capa1;
      return (
        <Panel>
          <Eyebrow tint={LAYER_TINT[1]}>{c.eyebrow}</Eyebrow>
          <Title id={id}>{c.title}</Title>
          <Body>{c.body}</Body>
          <Points items={c.points} tint={LAYER_TINT[1]} />
        </Panel>
      );
    }
    case "evento": {
      const c = h.chapters.evento;
      return (
        <Panel>
          <Eyebrow tint="#ff3b5c">{c.eyebrow}</Eyebrow>
          <div className="mb-2 font-mono text-4xl font-semibold tabular-nums tracking-tight text-[#ff6b84] md:mb-4 md:text-7xl">
            02:14:07
          </div>
          <Title id={id}>{c.title}</Title>
          <Body>{c.body}</Body>
          <Points items={c.points} tint="#ff3b5c" />
        </Panel>
      );
    }
    case "capa2": {
      const c = h.chapters.capa2;
      return (
        <Panel>
          <Eyebrow tint={LAYER_TINT[2]}>{c.eyebrow}</Eyebrow>
          <Title id={id}>{c.title}</Title>
          <Body>{c.body}</Body>
          <Points items={c.points} tint="#ffb547" />
          <div className="mt-5 md:mt-8">
            <CtaLink href="/vision">{h.ctas.vision}</CtaLink>
          </div>
        </Panel>
      );
    }
    case "alerta": {
      const c = h.chapters.alerta;
      return (
        <Panel>
          <Eyebrow tint="#ff3b5c">{c.eyebrow}</Eyebrow>
          <Title id={id}>{c.title}</Title>
          <p className="mt-3 hidden text-sm leading-relaxed text-[#c5d2ee] sm:block md:mt-6 md:text-lg">{c.body}</p>
          <EvidenceCard h={h} />
        </Panel>
      );
    }
    case "capa3": {
      const c = h.chapters.capa3;
      return (
        <Panel>
          <Eyebrow tint={LAYER_TINT[3]}>{c.eyebrow}</Eyebrow>
          <Title id={id}>{c.title}</Title>
          <Body>{c.body}</Body>
          <ol className="mt-5 hidden space-y-2 border-l border-white/15 pl-4 md:block">
            {h.chain.steps.map((s, i) => (
              <li key={s} className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/80">
                <span className="tabular-nums text-[#35e0a1]">{CHAIN_TIMES[i]}</span>
                {s}
              </li>
            ))}
          </ol>
          <Points items={c.points} tint={LAYER_TINT[3]} />
        </Panel>
      );
    }
    case "escala": {
      const c = h.chapters.escala;
      return (
        <Panel wide>
          <Eyebrow tint={LAYER_TINT[2]}>{c.eyebrow}</Eyebrow>
          <Title id={id}>{c.title}</Title>
          <Body>{c.body}</Body>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 md:mt-8 md:grid-cols-4">
            {h.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse bg-[#020a18]/85 p-3 md:p-4">
                <dt className="mt-1 font-mono text-[8.5px] uppercase leading-snug tracking-[0.18em] text-[#9eb0c0] md:text-[9.5px]">
                  {s.label}
                </dt>
                <dd className="font-heading text-2xl font-black tracking-tight text-white md:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-3 md:mt-8">
            <CtaLink href="/plataforma" primary>
              {h.ctas.platform}
            </CtaLink>
            <CtaLink href="/proyectos">{h.ctas.projects}</CtaLink>
          </div>
        </Panel>
      );
    }
  }
}

function EvidenceCard({ h }: { h: HomeDict }) {
  const e = h.evidence;
  return (
    <div className="mt-4 overflow-hidden border border-[#ff3b5c]/45 bg-[#0a0c1c]/90 shadow-[0_0_60px_-20px_rgba(255,59,92,0.6)] md:mt-7">
      <div className="flex items-center justify-between border-b border-[#ff3b5c]/30 bg-[#ff3b5c]/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em]">
        <span className="flex items-center gap-2 text-[#ff9aab]">
          <span className="inline-block size-1.5 animate-pulse bg-[#ff3b5c]" />
          {e.title}
        </span>
        <span className="bg-[#ff3b5c] px-1.5 py-0.5 font-bold text-white">{e.priority}</span>
      </div>
      <div className="grid grid-cols-[96px_1fr] gap-3 p-3 md:grid-cols-[150px_1fr] md:gap-4 md:p-4">
        {/* Snapshot sintético */}
        <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-[linear-gradient(160deg,#16244a,#050b1a)]">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_3px)]" />
          <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-[#0b1838]" />
          <div className="absolute bottom-[30%] left-0 right-0 h-[2px] bg-[#6b8aff]/60" />
          <div className="absolute bottom-[18%] left-[52%] h-[46%] w-[18%] border-2 border-[#ffb547]">
            <div className="absolute inset-x-[30%] bottom-0 top-[10%] rounded-t-full bg-[#ff3b5c]/80" />
          </div>
          <div className="absolute left-1 top-1 font-mono text-[7px] text-white/70">CAM-04 · REC</div>
        </div>
        <dl className="grid content-start gap-1 font-mono text-[9.5px] uppercase tracking-[0.12em] md:text-[10.5px]">
          {e.rows.map((r) => (
            <div key={r.k} className="flex justify-between gap-2 border-b border-white/5 pb-1">
              <dt className="text-white/45">{r.k}</dt>
              <dd className="text-right text-white/90">{r.v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.18em] md:text-[10px]">
        <span className="text-white/55">⧉ {e.attach}</span>
        <span className="text-[#35e0a1]">▸ {e.action}</span>
      </div>
    </div>
  );
}

// ───────────────────────── Después de la historia ─────────────────────────

const RECAP_LINKS = ["/plataforma#funcionalidades", "/vision", "/plataforma"];

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
        <ol className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3">
          {h.recap.items.map((item, i) => {
            const tint = LAYER_TINT[i + 1];
            return (
              <li key={item.tag}>
                <Link
                  href={RECAP_LINKS[i]}
                  className="group relative flex h-full flex-col border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.05] md:p-8"
                >
                  <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: tint }} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: tint }}>
                    {item.tag}
                  </span>
                  <span className="mt-3 text-xl font-black text-white md:text-2xl">{item.name}</span>
                  <span className="mt-3 flex-1 text-sm leading-relaxed text-[#c5d2ee]">{item.body}</span>
                  <span className="mt-6 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/80 group-hover:text-white">
                    <span style={{ color: tint }}>▸</span> {item.cta}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Contact({ h }: { h: HomeDict }) {
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="relative isolate overflow-hidden bg-[#020a18] py-20 md:py-28">
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
          <dl className="mt-10 grid max-w-lg grid-cols-2 gap-4 border-t border-white/20 pt-6">
            {h.stats.slice(0, 2).map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/70">{s.label}</dt>
                <dd className="font-heading text-3xl font-black text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
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
