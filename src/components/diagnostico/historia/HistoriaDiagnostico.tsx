"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { AREA_IDS, type AreaId, type Capitulo, type Diagnostico, type Recomendacion } from "@/data/diagnostico/tipos";
import { areaPorId } from "@/data/servicios";
import { ReproductorVoz } from "@/lib/asistente/voz";
import { isLowPower, noopSubscribe as noop, supportsWebGL } from "@/lib/three/webgl";
import { cn } from "@/lib/utils";
import type { DistritoCampus, InstanciaCampus } from "./campus";
import { PanelDiferencia } from "./PanelDiferencia";
import { NotificacionReporte } from "./NotificacionReporte";
import { Escritura } from "./Escritura";

export type HistoriaDiagnosticoProps = {
  diagnostico: Diagnostico;
  onTerminar: () => void;
};

const MOMENTO: Record<Capitulo["momento"], { texto: string; clase: string }> = {
  antes: { texto: "Hoy", clase: "border-[#ff3b5c]/40 bg-[#ff3b5c]/10 text-[#ff8da0]" },
  transicion: { texto: "Con ARS", clase: "border-[#2348d4]/60 bg-[#2348d4]/15 text-[#a9bcff]" },
  despues: { texto: "Después", clase: "border-[#35e0a1]/40 bg-[#35e0a1]/10 text-[#7cf0c4]" },
};

const PRIORIDAD: Record<Recomendacion["prioridad"], string> = { alta: "Prioridad alta", media: "Prioridad media", baja: "Prioridad baja" };

const prefiereMenosMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Puntero = { id: AreaId; x: number; y: number };

export function HistoriaDiagnostico({ diagnostico, onTerminar }: HistoriaDiagnosticoProps) {
  const capitulos = diagnostico.capitulos;
  const total = capitulos.length;
  const [indice, setIndice] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [voz, setVoz] = useState(false);
  const [hablando, setHablando] = useState(false);
  const [escritoEn, setEscritoEn] = useState(-1);
  const [hover, setHover] = useState<Puntero | null>(null);
  const [seleccion, setSeleccion] = useState<Puntero | null>(null);
  const [fallo, setFallo] = useState(false);
  const webgl = useSyncExternalStore(noop, supportsWebGL, () => true);
  const reducedMotion = useSyncExternalStore(noop, prefiereMenosMovimiento, () => false);

  const contRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instRef = useRef<InstanciaCampus | null>(null);
  const vozRef = useRef<ReproductorVoz | null>(null);
  const capRef = useRef<Capitulo | undefined>(capitulos[0]);

  const cap = capitulos[Math.min(indice, total - 1)];
  const esUltimo = indice >= total - 1;
  const escrito = escritoEn === indice;

  const recPorArea = useMemo(() => new Map(diagnostico.recomendaciones.map((r) => [r.areaId, r])), [diagnostico.recomendaciones]);
  const distritos = useMemo<DistritoCampus[]>(
    () =>
      AREA_IDS.flatMap(
        (id) => {
          const a = areaPorId(id);
          return a ? [{ id, nombre: a.nombre, corto: a.corto, color: a.color, escena: a.escena }] : [];
        },
      ),
    [],
  );

  /* ───────────── Escena 3D ───────────── */

  const relativo = useCallback((x: number, y: number) => {
    const r = contRef.current?.getBoundingClientRect();
    return r ? { x: x - r.left, y: y - r.top } : { x, y };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cont = contRef.current;
    if (!canvas || !cont || !webgl) return;
    let vivo = true;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    let visible = true;
    let enPantalla = true;
    const onVis = () => {
      visible = document.visibilityState === "visible";
      instRef.current?.setActiva(visible && enPantalla);
    };
    const lowPower = isLowPower();

    import("./campus")
      .then(({ crearCampus }) => {
        if (!vivo) return;
        const inst = crearCampus({
          canvas,
          distritos,
          recomendadas: diagnostico.recomendaciones.map((r) => r.areaId),
          madurez: diagnostico.madurez,
          lowPower,
          reducedMotion: prefiereMenosMovimiento(),
          onHover: (id, x, y) => setHover(id ? { id, ...relativo(x, y) } : null),
          onSeleccion: (id, x, y) => setSeleccion({ id, ...relativo(x, y) }),
          onFallo: () => vivo && setFallo(true),
        });
        instRef.current = inst;
        const r = cont.getBoundingClientRect();
        inst.resize(r.width, r.height);
        if (capRef.current) inst.setCapitulo(capRef.current);
        ro = new ResizeObserver(([e]) => inst.resize(e.contentRect.width, e.contentRect.height));
        ro.observe(cont);
        io = new IntersectionObserver(([e]) => {
          enPantalla = e.isIntersecting;
          inst.setActiva(visible && enPantalla);
        });
        io.observe(cont);
        document.addEventListener("visibilitychange", onVis);
      })
      .catch(() => vivo && setFallo(true));

    return () => {
      vivo = false;
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      instRef.current?.dispose();
      instRef.current = null;
    };
  }, [webgl, distritos, diagnostico.recomendaciones, diagnostico.madurez, relativo]);

  useEffect(() => {
    capRef.current = cap;
    if (cap) instRef.current?.setCapitulo(cap);
  }, [cap]);

  /* ───────────── Voz ───────────── */

  useEffect(() => {
    const r = vozRef.current;
    if (!r) return;
    r.detener();
    if (voz && cap) r.decir(cap.narracion);
  }, [cap, voz]);

  useEffect(() => () => vozRef.current?.detener(), []);

  const alternarVoz = () => {
    if (!vozRef.current) {
      const r = new ReproductorVoz(true, "es");
      r.onEstado = (e) => setHablando(e === "hablando");
      vozRef.current = r;
      // Sondeo gratuito: con texto vacío la ruta responde 503 si no hay clave de
      // ElevenLabs (y 400 si la hay) sin generar audio. Sin clave → voz del navegador.
      fetch("/api/asistente/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"texto":""}' })
        .then((res) => res.status === 503 && r.configurar(false, "es"))
        .catch(() => r.configurar(false, "es"));
    }
    vozRef.current.desbloquear();
    setVoz((v) => !v);
  };

  /* ───────────── Navegación ───────────── */

  const ir = useCallback(
    (i: number) => {
      setSeleccion(null);
      setIndice(Math.max(0, Math.min(total - 1, i)));
    },
    [total],
  );

  const alternarReproduccion = () => {
    if (reproduciendo && !esUltimo) return setReproduciendo(false);
    if (esUltimo) ir(0);
    setReproduciendo(true);
  };

  const largoNarracion = cap?.narracion.length ?? 0;
  useEffect(() => {
    if (!reproduciendo || esUltimo || !escrito) return;
    // Con voz se espera a que termine de hablar (con un tope por si el navegador no avisa).
    const espera = voz && hablando ? largoNarracion * 85 + 4000 : voz ? 1200 : 2800;
    const id = window.setTimeout(() => ir(indice + 1), espera);
    return () => window.clearTimeout(id);
  }, [reproduciendo, esUltimo, escrito, voz, hablando, indice, ir, largoNarracion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowRight") ir(indice + 1);
      else if (e.key === "ArrowLeft") ir(indice - 1);
      else if (e.key === "Escape") setSeleccion(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [indice, ir]);

  if (!cap) return null;

  const tarjeta = seleccion ?? hover;
  const areaTarjeta = tarjeta ? distritos.find((d) => d.id === tarjeta.id) : undefined;
  const recTarjeta = tarjeta ? recPorArea.get(tarjeta.id) : undefined;
  const momento = MOMENTO[cap.momento];
  const reproduciendoAhora = reproduciendo && !esUltimo;

  return (
    <section
      className="relative isolate w-full overflow-hidden bg-[#020a18] text-white lg:h-[100svh] lg:min-h-[680px]"
      aria-roledescription="historia narrada"
      aria-label={`Historia del diagnóstico de ${diagnostico.perfil.nombre}`}
    >
      {/* ── Lienzo 3D ── */}
      <div ref={contRef} className="relative h-[58svh] min-h-[360px] touch-pan-y lg:absolute lg:inset-0 lg:h-auto">
        {webgl && !fallo ? (
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        ) : (
          <RespaldoCampus distritos={distritos} activas={cap.activas} />
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#020a18] via-[#020a18]/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#020a18] to-transparent lg:h-56" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[38%] bg-gradient-to-r from-[#020a18]/85 to-transparent lg:block" />

        {tarjeta && areaTarjeta && (
          <TarjetaArea
            puntero={tarjeta}
            fija={Boolean(seleccion)}
            nombre={areaTarjeta.nombre}
            color={areaTarjeta.color}
            rec={recTarjeta}
            onCerrar={() => setSeleccion(null)}
          />
        )}
      </div>

      {/* ── Encabezado ── */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 px-4 pt-5 md:px-8 md:pt-7">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0] md:text-[11px]">
            Diagnóstico · {diagnostico.perfil.nombre}
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs text-[#9eb0c0]">
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", momento.clase)}>{momento.texto}</span>
            Capítulo {indice + 1} de {total}
          </p>
        </div>
        <button
          type="button"
          onClick={onTerminar}
          className="pointer-events-auto shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-[#cfd8e3] backdrop-blur transition hover:bg-white/10"
        >
          Saltar al reporte
        </button>
      </header>

      {/* ── Narración ── */}
      <div className="relative z-10 -mt-16 px-4 md:px-8 lg:absolute lg:bottom-32 lg:left-8 lg:mt-0 lg:w-[min(460px,40vw)] lg:px-0">
        <article className="rounded-2xl border border-white/10 bg-[#071631]/80 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md md:p-6">
          <h2 key={`t-${indice}`} className="text-balance text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
            {cap.titulo}
          </h2>
          <p className="sr-only" aria-live="polite">
            {cap.narracion}
          </p>
          <Escritura
            key={`n-${indice}`}
            texto={cap.narracion}
            instantaneo={reducedMotion}
            onFin={() => setEscritoEn(indice)}
            className="mt-3 text-[15px] leading-relaxed text-[#cfd8e3] md:text-base"
          />
          {esUltimo && (
            <button
              type="button"
              onClick={onTerminar}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2348d4] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(35,72,212,0.55)] transition hover:bg-[#2c56f0]"
            >
              Ver mi reporte <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </article>
      </div>

      {/* ── Controles y progreso ── */}
      <nav
        aria-label="Capítulos"
        className="relative z-10 px-4 py-4 md:px-8 lg:absolute lg:inset-x-8 lg:bottom-6 lg:px-0 lg:py-0"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex shrink-0 items-center gap-1.5">
            <BotonControl etiqueta="Capítulo anterior" onClick={() => ir(indice - 1)} disabled={indice === 0}>
              <ChevronLeft className="size-5" />
            </BotonControl>
            <BotonControl etiqueta={reproduciendoAhora ? "Pausar" : "Reproducir automático"} onClick={alternarReproduccion} activo={reproduciendoAhora}>
              {reproduciendoAhora ? <Pause className="size-5" /> : <Play className="size-5" />}
            </BotonControl>
            <BotonControl etiqueta="Capítulo siguiente" onClick={() => (esUltimo ? onTerminar() : ir(indice + 1))}>
              <ChevronRight className="size-5" />
            </BotonControl>
            <BotonControl etiqueta={voz ? "Silenciar narración" : "Narrar en voz alta"} onClick={alternarVoz} activo={voz}>
              {voz ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            </BotonControl>
          </div>
          <ol className="flex min-w-0 flex-1 items-center gap-1.5">
            {capitulos.map((c, i) => (
              <li key={i} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => ir(i)}
                  aria-label={`Capítulo ${i + 1}: ${c.titulo}`}
                  aria-current={i === indice ? "step" : undefined}
                  className="group block w-full py-2"
                >
                  <span className="relative block h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700",
                        i < indice ? "w-full bg-[#6b8aff]" : i === indice ? "w-full bg-gradient-to-r from-[#2348d4] to-[#7cf0c4]" : "w-0",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "mt-1.5 hidden truncate text-left text-[11px] transition-colors lg:block",
                      i === indice ? "text-white" : "text-[#9eb0c0]/70 group-hover:text-[#cfd8e3]",
                    )}
                  >
                    {c.titulo}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* ── Notificación del último capítulo ── */}
      {esUltimo && (
        <div className="relative z-10 px-4 pb-4 md:px-8 lg:absolute lg:bottom-28 lg:left-1/2 lg:w-[330px] lg:-translate-x-[15%] lg:px-0 lg:pb-0">
          <NotificacionReporte key={`noti-${indice}`} reporte={diagnostico.reporteDiario} onVer={onTerminar} reducedMotion={reducedMotion} />
        </div>
      )}

      {/* ── La diferencia ── */}
      <div className="relative z-10 px-4 pb-8 md:px-8 lg:absolute lg:right-8 lg:top-24 lg:w-[320px] lg:px-0 lg:pb-0">
        <PanelDiferencia key={`d-${indice}`} diagnostico={diagnostico} capitulo={cap} reducedMotion={reducedMotion} />
      </div>
    </section>
  );
}

/* ───────────── Piezas ───────────── */

function BotonControl({
  etiqueta,
  onClick,
  disabled,
  activo,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  disabled?: boolean;
  activo?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={etiqueta}
      title={etiqueta}
      aria-pressed={activo}
      className={cn(
        "grid size-10 place-items-center rounded-full border text-white backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-35",
        activo ? "border-[#6b8aff]/70 bg-[#2348d4]/40 shadow-[0_0_18px_rgba(35,72,212,0.6)]" : "border-white/15 bg-[#071631]/70 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

function TarjetaArea({
  puntero,
  fija,
  nombre,
  color,
  rec,
  onCerrar,
}: {
  puntero: Puntero;
  fija: boolean;
  nombre: string;
  color: string;
  rec?: Recomendacion;
  onCerrar: () => void;
}) {
  return (
    <div
      role={fija ? "dialog" : "tooltip"}
      aria-label={nombre}
      className={cn(
        "absolute z-20 w-[min(300px,calc(100%-2rem))] rounded-xl border border-white/15 bg-[#061229]/92 p-4 text-sm shadow-2xl backdrop-blur-md",
        fija ? "pointer-events-auto" : "pointer-events-none",
      )}
      style={{
        left: `clamp(1rem, ${puntero.x + 16}px, calc(100% - min(300px, 100% - 2rem) - 1rem))`,
        top: `clamp(4.5rem, ${puntero.y - 20}px, calc(100% - 12rem))`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold text-white">
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
          {nombre}
        </p>
        {fija && (
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="-m-1 rounded p-1 text-[#9eb0c0] hover:text-white">
            <X className="size-4" />
          </button>
        )}
      </div>
      {rec ? (
        <>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider" style={{ color }}>
            Recomendada · {PRIORIDAD[rec.prioridad]}
          </p>
          <p className="mt-2 text-[#cfd8e3]">{rec.porque}</p>
          <p className="mt-2 text-[#9eb0c0]">
            <span className="text-white">Qué cambia:</span> {rec.cambio}
          </p>
        </>
      ) : (
        <p className="mt-2 text-[#9eb0c0]">No es prioritaria para tu empresa en esta etapa; queda lista para cuando la necesites.</p>
      )}
    </div>
  );
}

function RespaldoCampus({ distritos, activas }: { distritos: DistritoCampus[]; activas: AreaId[] }) {
  const on = new Set(activas);
  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,#142664_0%,#020a18_70%)] p-6 pt-24">
      <ul className="grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-5">
        {distritos.map((d) => (
          <li
            key={d.id}
            className="rounded-lg border px-2 py-3 text-center text-xs transition"
            style={{ borderColor: on.has(d.id) ? d.color : "rgba(255,255,255,0.1)", color: on.has(d.id) ? d.color : "#9eb0c0" }}
          >
            {d.corto}
          </li>
        ))}
      </ul>
    </div>
  );
}
