"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CargaTecnologica } from "@/components/carga/CargaTecnologica";
import { useI18n } from "@/lib/i18n/context";
import { isModestDevice, noopSubscribe, supportsWebGL } from "@/lib/three/webgl";
import { cn } from "@/lib/utils";
import type { MuroApi } from "./MuroCanvas";
import { MuroCollage } from "./MuroCollage";
import { CIFRAS, PANTALLAS, PANTALLAS_MOVIL } from "./pantallas";

const MuroCanvas = dynamic(() => import("./MuroCanvas"), { ssr: false });

const PANTALLAS_COMPACTAS = PANTALLAS.slice(0, PANTALLAS_MOVIL);

const TEXTOS = {
  es: {
    eyebrow: "Plataforma ARS · Muro de mando",
    titulo1: "Toda su operación de seguridad,",
    titulo2: "en un solo muro de mando.",
    bajada:
      "Turnos, rondas, sala de control, visión artificial, gestión humana, documentos y finanzas conectados en una sola plataforma. Lo que ve aquí son pantallas reales del sistema.",
    ctaIa: "Diseña tu plataforma con IA",
    ctaDemo: "Solicitar demo",
    areas: "áreas",
    modulos: "módulos",
    capturas: "capturas reales",
    pistaMouse: "Pase el mouse por una pantalla · clic para acercarla",
    pistaTouch: "Toque una pantalla para acercarla",
    volver: "Volver",
    esc: "Esc",
    verPantalla: "Ver pantalla",
    region: "Muro de pantallas reales de la plataforma",
  },
  en: {
    eyebrow: "ARS Platform · Command wall",
    titulo1: "Your entire security operation,",
    titulo2: "on a single command wall.",
    bajada:
      "Shifts, patrols, control room, computer vision, people management, documents and finance connected in one platform. What you see here are real screens from the system.",
    ctaIa: "Design your platform with AI",
    ctaDemo: "Request a demo",
    areas: "areas",
    modulos: "modules",
    capturas: "real screenshots",
    pistaMouse: "Hover over a screen · click to bring it closer",
    pistaTouch: "Tap a screen to bring it closer",
    volver: "Back",
    esc: "Esc",
    verPantalla: "View screen",
    region: "Wall of real platform screens",
  },
} as const;

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

/**
 * Hero 3D de /plataforma: un «muro de mando» con capturas reales del catálogo.
 * WebGL detrás (Three.js, cargado en diferido) y, sin WebGL, un collage CSS 3D.
 */
export function HeroPlataforma3D() {
  const { locale } = useI18n();
  const t = TEXTOS[locale];

  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const webgl = useSyncExternalStore(noopSubscribe, supportsWebGL, () => false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const touch = useMediaQuery("(hover: none), (pointer: coarse)");
  const compact = useMediaQuery("(max-width: 767px)");
  const modest = useSyncExternalStore(noopSubscribe, isModestDevice, () => false);
  const lowPower = touch || compact || modest;
  const pantallas = compact ? PANTALLAS_COMPACTAS : PANTALLAS;

  // Primer fallo fatal: remonta el canvas una vez. Segundo: collage estático.
  const [failures, setFailures] = useState(0);
  const use3d = mounted && webgl && failures < 2;
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<MuroApi | null>(null);

  // Render solo con la sección en pantalla.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const seleccionar = useCallback((i: number | null) => {
    if (apiRef.current) apiRef.current.focus(i);
    else setFocused(i);
  }, []);

  // Esc vuelve a la vista general.
  useEffect(() => {
    if (focused === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") seleccionar(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, seleccionar]);

  const onFail = useCallback(() => {
    setReady(false);
    setHovered(null);
    setFocused(null);
    setFailures((f) => f + 1);
  }, []);
  const onReady = useCallback(() => setReady(true), []);

  const foco = focused !== null ? pantallas[focused] : undefined;
  const hov = hovered !== null ? pantallas[hovered] : undefined;

  return (
    <section
      ref={sectionRef}
      aria-label={t.region}
      className={cn(
        "relative isolate h-[100svh] min-h-[640px] w-full overflow-hidden bg-background text-foreground",
        hov && "cursor-pointer"
      )}
    >
      {use3d && (
        <MuroCanvas
          key={failures}
          pantallas={pantallas}
          lowPower={lowPower}
          reducedMotion={reducedMotion}
          touch={touch}
          active={active}
          labelRef={labelRef}
          apiRef={apiRef}
          onReady={onReady}
          onFail={onFail}
          onHover={setHovered}
          onFocus={setFocused}
        />
      )}
      {mounted && !use3d && (
        <MuroCollage pantallas={pantallas} locale={locale} focused={focused} onSelect={seleccionar} />
      )}
      {/* Mientras baja e inicia el 3D: la plataforma encendiéndose (se funde al primer cuadro). */}
      {(!mounted || use3d) && (
        <CargaTecnologica
          variante="pantalla"
          listo={ready}
          etiqueta={locale === "es" ? "Encendiendo el muro de mando" : "Powering up the command wall"}
        />
      )}

      {/* Velos para que el texto se lea sobre el muro. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-700",
          foco ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-background via-background/85 to-transparent lg:h-[40%] lg:via-background/40" />
        <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-r from-background via-background/80 to-transparent lg:block" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />

      {/* Etiqueta de hover: la mueve la escena por ref. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={labelRef}
          style={hov ? { borderColor: `${hov.color}aa`, color: hov.color } : undefined}
          className="absolute left-0 top-0 whitespace-nowrap border bg-[#020a18]/85 px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] opacity-0 backdrop-blur-sm transition-opacity duration-200 will-change-transform"
        >
          {hov && (
            <>
              <span className="mr-1.5 inline-block size-1.5 animate-pulse bg-current align-middle motion-reduce:animate-none" />
              <span className="mr-1.5">{hov.area[locale]}</span>
              <span className="text-white/90">· {hov.modulo[locale]}</span>
            </>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div
        className={cn(
          "pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10 pt-28 transition-opacity duration-500 md:px-10 md:pb-14 lg:justify-center lg:pb-0",
          foco ? "opacity-0" : "opacity-100"
        )}
      >
        <div className={cn("max-w-xl", foco ? "pointer-events-none" : "[&>*]:pointer-events-auto")}>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            <span className="mr-2 inline-block size-1.5 animate-pulse bg-accent align-middle motion-reduce:animate-none" />
            {t.eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {t.titulo1} <span className="text-accent">{t.titulo2}</span>
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-sm leading-relaxed text-foreground/75 sm:text-base">{t.bajada}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#arquitecto-ia"
              className="bevel-btn inline-flex items-center gap-3 border border-accent bg-accent/20 px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] sm:px-6 sm:text-xs sm:tracking-[0.22em] text-foreground transition-colors hover:bg-accent/35"
            >
              {t.ctaIa}
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="#cierre"
              className="bevel-btn inline-flex items-center gap-2 border border-border bg-background/40 px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] sm:px-6 sm:text-xs sm:tracking-[0.22em] text-foreground/85 backdrop-blur-sm transition-colors hover:bg-background/70"
            >
              {t.ctaDemo}
            </a>
          </div>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-border/40 pt-5">
            {[
              [CIFRAS.areas, t.areas],
              [CIFRAS.modulos, t.modulos],
              [CIFRAS.capturas, t.capturas],
            ].map(([v, l]) => (
              <div key={String(l)} className="flex flex-col-reverse">
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55">{l}</dt>
                <dd className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45 sm:block" aria-hidden="true">
            {touch ? t.pistaTouch : t.pistaMouse}
          </p>
        </div>
      </div>

      {/* Acceso por teclado / lector de pantalla a cada pantalla del muro. */}
      <ul className="sr-only">
        {pantallas.map((p, i) => (
          <li key={p.src}>
            <button type="button" onClick={() => seleccionar(i)}>
              {t.verPantalla}: {p.modulo[locale]} ({p.area[locale]})
            </button>
          </li>
        ))}
      </ul>

      {/* Pie de la captura enfocada. */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-6 transition-[opacity,transform] duration-500 md:pb-10",
          foco ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        )}
        aria-live="polite"
      >
        {foco && (
          <figure
            className="bevel-btn flex w-full max-w-2xl items-start gap-4 border bg-[#020a18]/90 px-5 py-4 backdrop-blur-md md:px-6"
            style={{ borderColor: `${foco.color}88` }}
          >
            <figcaption className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: foco.color }}>
                <span className="mr-1.5 inline-block size-1.5 bg-current align-middle" />
                {foco.area[locale]}
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">{foco.modulo[locale]}</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/75">{foco.pie[locale]}</p>
            </figcaption>
            <button
              type="button"
              onClick={() => seleccionar(null)}
              className="shrink-0 border border-border/70 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:bg-foreground/10"
            >
              {t.volver} <span className="ml-1 text-foreground/45">{t.esc}</span>
            </button>
          </figure>
        )}
      </div>
    </section>
  );
}
