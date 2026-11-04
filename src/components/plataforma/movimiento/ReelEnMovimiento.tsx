"use client";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Expand,
  Film,
  MousePointerClick,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Clip } from "@/data/servicios";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { REEL, type ItemReel, type Tamano } from "./datos";
import { useEnVista, useMovimientoReducido } from "./hooks";
import { SecuenciaGif } from "./SecuenciaGif";
import { textos } from "./textos";

/** Celdas del bento: 1 columna en móvil, 2 en tableta, 4 en escritorio (24 celdas exactas). */
const CELDA: Record<Tamano, string> = {
  grande: "sm:col-span-2 sm:row-span-2",
  ancho: "sm:col-span-2",
  alto: "sm:row-span-2",
  normal: "",
};

const SIZES: Record<Tamano, string> = {
  grande: "(min-width: 1024px) 50vw, 100vw",
  ancho: "(min-width: 1024px) 50vw, 100vw",
  alto: "(min-width: 1024px) 50vw, (min-width: 640px) 60vw, 100vw",
  normal: "(min-width: 1024px) 35vw, (min-width: 640px) 60vw, 100vw",
};

/**
 * Sección «En movimiento» (#en-movimiento): bento de clips reales en bucle mudo y
 * «GIFs» armados con capturas reales y un cursor simulado. Clic → visor en grande.
 */
export function ReelEnMovimiento() {
  const { locale } = useI18n();
  const t = textos(locale).reel;
  const reducido = useMovimientoReducido();
  const [abierto, setAbierto] = useState<ItemReel | null>(null);
  const origen = useRef<HTMLElement | null>(null);

  const abrir = useCallback((item: ItemReel, el: HTMLElement) => {
    origen.current = el;
    setAbierto(item);
  }, []);
  const cerrar = useCallback(() => {
    setAbierto(null);
    origen.current?.focus();
  }, []);

  return (
    <section
      id="en-movimiento"
      aria-labelledby="en-movimiento-titulo"
      className="relative py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
            <Film className="size-3.5" aria-hidden="true" />
            {t.etiqueta}
          </p>
          <h2
            id="en-movimiento-titulo"
            className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl"
          >
            {t.titulo}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#9eb0c0] md:text-lg">
            {t.bajada}
          </p>
          {reducido && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              {t.reducido}
            </p>
          )}
        </header>

        <ul className="mt-10 grid auto-rows-[260px] grid-cols-1 gap-3 sm:auto-rows-[210px] sm:grid-cols-2 sm:grid-flow-dense md:gap-4 lg:auto-rows-[220px] lg:grid-cols-4">
          {REEL.map((item) => (
            <li key={item.id} className={CELDA[item.tamano]}>
              <TarjetaReel item={item} onAbrir={abrir} />
            </li>
          ))}
        </ul>
      </div>

      <VisorReel item={abierto} onCerrar={cerrar} />
    </section>
  );
}

/* ───────────────────────────── Tarjeta con tilt 3D ───────────────────────────── */

function TarjetaReel({
  item,
  onAbrir,
}: {
  item: ItemReel;
  onAbrir: (item: ItemReel, el: HTMLElement) => void;
}) {
  const { locale } = useI18n();
  const t = textos(locale).reel;
  const ref = useRef<HTMLDivElement>(null);
  const activo = useEnVista(ref, { umbral: 0.35 });
  const reducido = useMovimientoReducido();
  const { area } = item;

  const mover = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || reducido) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const soltar = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <div className="h-full [perspective:1100px]">
      <div
        ref={ref}
        onPointerMove={mover}
        onPointerLeave={soltar}
        className="group relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-[#060f24] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] transition-[transform,border-color,box-shadow] duration-300 ease-out [transform-style:preserve-3d] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:border-white/25 hover:shadow-[0_28px_70px_-28px_rgba(0,0,0,0.95)] has-[:focus-visible]:border-white/50"
      >
        {item.tipo === "clip" ? (
          <VideoEnBucle clip={item.clip} activo={activo} />
        ) : (
          <SecuenciaGif
            cuadros={item.cuadros}
            color={area.color}
            activo={activo}
            sizes={SIZES[item.tamano]}
          />
        )}

        {/* Brillo que sigue al puntero */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 [background:radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.13),transparent_55%)] group-hover:opacity-100"
        />
        {/* Degradado para legibilidad */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#020a18] via-[#020a18]/35 to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#020a18]/80 to-transparent"
        />

        {/* Área y tipo */}
        <span className="absolute inset-x-3 top-3 z-20 flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2 rounded-sm bg-[#020a18]/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/90 backdrop-blur">
            <span
              className="inline-block size-1.5 shrink-0 rounded-full"
              style={{ background: area.color }}
              aria-hidden="true"
            />
            <span className="truncate">
              {area.letra} · {area.corto}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-sm bg-[#020a18]/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/70 backdrop-blur">
            {item.tipo === "clip" ? (
              <span
                className="inline-block size-1.5 animate-pulse rounded-full bg-red-500"
                aria-hidden="true"
              />
            ) : (
              <MousePointerClick className="size-3" aria-hidden="true" />
            )}
            <span
              className={cn(
                item.tamano === "grande" || item.tamano === "ancho"
                  ? ""
                  : "sr-only max-sm:not-sr-only",
              )}
            >
              {item.tipo === "clip" ? t.clip : t.secuencia}
            </span>
          </span>
        </span>

        {/* Título y pie */}
        <span className="absolute inset-x-0 bottom-0 z-20 block p-4 [transform:translateZ(30px)]">
          <span
            className="block h-px w-8"
            style={{ background: area.color }}
            aria-hidden="true"
          />
          <span className="mt-2 block text-base font-bold leading-snug text-white md:text-lg">
            {item.titulo[locale]}
          </span>
          <span
            className={cn(
              "mt-1 text-xs leading-relaxed text-[#b5c3d4]",
              item.tamano === "grande" || item.tamano === "alto"
                ? "line-clamp-3"
                : "line-clamp-2",
            )}
          >
            {item.descripcion[locale]}
          </span>
        </span>

        <span
          aria-hidden="true"
          className="absolute bottom-4 right-4 z-20 grid size-8 place-items-center rounded-full border border-white/20 bg-[#020a18]/70 text-white/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
        >
          <Expand className="size-3.5" />
        </span>

        <button
          type="button"
          onClick={(e) => onAbrir(item, e.currentTarget)}
          aria-label={`${t.abrir}: ${item.titulo[locale]}`}
          className="absolute inset-0 z-30 cursor-pointer rounded-xl focus-visible:outline-offset-[-3px]"
        />
      </div>
    </div>
  );
}

/* ───────────────────────────── Video mudo en bucle ───────────────────────────── */

function VideoEnBucle({ clip, activo }: { clip: Clip; activo: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reducido = useMovimientoReducido();
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (activo && !reducido) {
      if (v.preload === "none") v.preload = "auto";
      void v.play().catch(() => {});
    } else v.pause();
  }, [activo, reducido]);

  if (fallo)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- póster de respaldo si el video no carga
      <img
        src={clip.poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    );

  return (
    <video
      ref={ref}
      src={clip.mp4}
      poster={clip.poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      onError={() => setFallo(true)}
      aria-hidden="true"
      tabIndex={-1}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/* ───────────────────────────── Visor (lightbox) ───────────────────────────── */

function VisorReel({
  item,
  onCerrar,
}: {
  item: ItemReel | null;
  onCerrar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (item && !dlg.open) dlg.showModal();
    if (!item && dlg.open) dlg.close();
  }, [item]);

  return (
    <dialog
      ref={ref}
      onClose={() => item && onCerrar()}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
      aria-labelledby="visor-reel-titulo"
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-y-auto bg-transparent p-0 text-white backdrop:bg-[#020a18]/92 backdrop:backdrop-blur-sm"
    >
      {item && <ContenidoVisor key={item.id} item={item} onCerrar={onCerrar} />}
    </dialog>
  );
}

function ContenidoVisor({
  item,
  onCerrar,
}: {
  item: ItemReel;
  onCerrar: () => void;
}) {
  const { locale } = useI18n();
  const t = textos(locale).reel;
  const reducido = useMovimientoReducido();
  const [j, setJ] = useState(0);
  const n = item.tipo === "secuencia" ? item.cuadros.length : 0;
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cerrarRef.current?.focus();
  }, []);

  const mover = useCallback(
    (d: number) => setJ((x) => (n ? (x + d + n) % n : 0)),
    [n],
  );

  // Teclado: ←/→ entre pantallas; Tab queda dentro del visor (además de lo que hace showModal()).
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" && n > 1) {
      e.preventDefault();
      mover(1);
    } else if (e.key === "ArrowLeft" && n > 1) {
      e.preventDefault();
      mover(-1);
    } else if (e.key === "Tab" && contenedor.current) {
      const focos = contenedor.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])',
      );
      if (!focos.length) return;
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
  };

  const { area } = item;
  const cuadro = item.tipo === "secuencia" ? item.cuadros[j] : null;

  return (
    <div
      ref={contenedor}
      onKeyDown={onKeyDown}
      className="pointer-events-none mx-auto flex min-h-full max-w-6xl flex-col justify-center gap-5 px-4 py-16 md:px-10"
    >
      <div className="pointer-events-auto relative overflow-hidden rounded-xl border border-white/10 bg-black">
        {item.tipo === "clip" ? (
          <video
            src={item.clip.mp4}
            poster={item.clip.poster}
            muted
            loop
            playsInline
            controls
            autoPlay={!reducido}
            aria-label={item.titulo[locale]}
            className="block max-h-[70dvh] w-full bg-black object-contain"
          />
        ) : (
          cuadro && (
            <>
              <Image
                key={cuadro.captura.src}
                src={cuadro.captura.src}
                alt={cuadro.captura.alt}
                width={cuadro.captura.ancho}
                height={cuadro.captura.alto}
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="mx-auto block h-auto max-h-[70dvh] w-auto max-w-full object-contain"
              />
              {n > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => mover(-1)}
                    aria-label={`${t.cuadro} ${((j - 1 + n) % n) + 1}`}
                    className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[#020a18]/80 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(1)}
                    aria-label={`${t.cuadro} ${((j + 1) % n) + 1}`}
                    className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[#020a18]/80 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </>
          )
        )}
      </div>

      <div className="pointer-events-auto grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">
            <span
              className="inline-block size-1.5 rounded-full"
              style={{ background: area.color }}
              aria-hidden="true"
            />
            {area.letra} · {area.nombre}
            {n > 1 && (
              <span className="ml-2 text-white/45">
                {t.cuadro} {j + 1} {t.de} {n}
              </span>
            )}
          </p>
          <h3
            id="visor-reel-titulo"
            className="mt-2 text-2xl font-bold text-white md:text-3xl"
          >
            {item.titulo[locale]}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#b5c3d4] md:text-base">
            {item.descripcion[locale]}
          </p>
          {cuadro && (
            <p className="mt-3 flex max-w-3xl gap-2 text-xs leading-relaxed text-[#9eb0c0]">
              <span
                className="mt-[7px] inline-block h-px w-3 shrink-0"
                style={{ background: area.color }}
                aria-hidden="true"
              />
              {cuadro.captura.pie}
            </p>
          )}
          {item.tipo === "secuencia" && n > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.cuadros.map((c, k) => (
                <button
                  key={c.captura.src}
                  type="button"
                  onClick={() => setJ(k)}
                  aria-label={`${t.cuadro} ${k + 1}: ${c.captura.alt}`}
                  aria-current={k === j}
                  className={cn(
                    "relative h-14 w-24 overflow-hidden rounded-md border transition-colors",
                    k === j
                      ? "border-white/70"
                      : "border-white/15 opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    src={c.captura.src}
                    alt=""
                    width={c.captura.ancho}
                    height={c.captura.alto}
                    sizes="96px"
                    className="h-full w-full object-cover object-left-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <Link
          href={`/servicios/${area.id}`}
          className="bevel-btn inline-flex items-center gap-2 self-start bg-white px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#020a18] transition-colors hover:bg-accent hover:text-white"
        >
          {t.verArea}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <button
        ref={cerrarRef}
        type="button"
        onClick={onCerrar}
        aria-label={t.cerrar}
        className="pointer-events-auto fixed right-4 top-4 grid size-11 place-items-center rounded-full border border-white/20 bg-[#020a18]/80 text-white hover:bg-white/10"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
