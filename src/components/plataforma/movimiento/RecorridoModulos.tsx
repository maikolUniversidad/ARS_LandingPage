"use client";

import { ArrowUpRight, Compass, Pause, Play } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AREAS } from "@/data/servicios";
import { useI18n } from "@/lib/i18n/context";
import { useEstadoNarracion } from "@/components/narracion/useNarracion";
import { idRecorridoArea } from "@/lib/narracion/contrato";
import { motorNarracion } from "@/lib/narracion/motor";
import { cn } from "@/lib/utils";
import { AREAS_DE_CAMPO, capturasDeArea, modulosDestacados } from "./datos";
import { Dispositivos, TIEMPO_PANTALLA } from "./Dispositivos";
import { useEnVista, useMovimientoReducido } from "./hooks";
import s from "./movimiento.module.css";
import { textos } from "./textos";

/** Tiempo que el recorrido se queda en cada área antes de pasar a la siguiente. */
const tiempoArea = (capturas: number) =>
  Math.min(15000, Math.max(9000, capturas * TIEMPO_PANTALLA));

/**
 * Sección «Recorrido» (#recorrido): las 11 áreas en un riel (pestañas), un portátil
 * en perspectiva 3D con sus capturas reales y, al lado, la frase y los módulos
 * destacados. Avanza solo hasta que la persona interactúa; flechas, Inicio y Fin.
 */
export function RecorridoModulos() {
  const { locale } = useI18n();
  const t = textos(locale).recorrido;
  const reducido = useMovimientoReducido();
  const seccion = useRef<HTMLElement>(null);
  const visible = useEnVista(seccion, { umbral: 0.25 });
  const pestanas = useRef<(HTMLButtonElement | null)[]>([]);

  const [indice, setIndice] = useState(0);
  const [auto, setAuto] = useState(true);
  const area = AREAS[indice];
  const capturas = capturasDeArea(area);
  const destacados = modulosDestacados(area, 4);
  const conTelefono = AREAS_DE_CAMPO.has(area.id);
  const corre = visible && !reducido;
  const narracion = useEstadoNarracion();
  // Mientras Ars narra un área, el recorrido espera a que termine.
  const autoCorre = auto && corre && !(narracion.encendido && narracion.hablando);
  const duracion = tiempoArea(capturas.length);

  useEffect(() => {
    if (!autoCorre) return;
    const id = window.setTimeout(
      () => setIndice((i) => (i + 1) % AREAS.length),
      duracion,
    );
    return () => window.clearTimeout(id);
  }, [autoCorre, indice, duracion]);

  // Cada área nueva: ping y Ars la presenta (en cola, sin cortar la intro de la sección).
  useEffect(() => {
    if (!visible) return;
    motorNarracion.sfx("ping", { semitonos: [0, 3, 5, 7, 10][indice % 5], volumen: 0.6 });
    motorNarracion.narrar(idRecorridoArea(AREAS[indice].id), { cola: true });
  }, [indice, visible]);

  const elegir = (i: number, enfocar = false) => {
    setAuto(false);
    setIndice(i);
    if (enfocar) pestanas.current[i]?.focus();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const n = AREAS.length;
    const mapa: Record<string, number> = {
      ArrowDown: (indice + 1) % n,
      ArrowRight: (indice + 1) % n,
      ArrowUp: (indice - 1 + n) % n,
      ArrowLeft: (indice - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    if (e.key in mapa) {
      e.preventDefault();
      elegir(mapa[e.key], true);
    }
  };

  return (
    <section
      ref={seccion}
      id="recorrido"
      aria-labelledby="recorrido-titulo"
      data-pausa={!corre}
      className="relative py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              <Compass className="size-3.5" aria-hidden="true" />
              {t.etiqueta}
            </p>
            <h2
              id="recorrido-titulo"
              className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl"
            >
              {t.titulo}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#9eb0c0] md:text-lg">
              {t.bajada}
            </p>
          </div>
          {!reducido && (
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              aria-pressed={auto}
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/75 transition-colors hover:border-white/35 hover:text-white md:self-end"
            >
              {auto ? (
                <Pause className="size-3.5" aria-hidden="true" />
              ) : (
                <Play className="size-3.5" aria-hidden="true" />
              )}
              {auto ? t.pausar : t.reanudar}
              <span className="sr-only">· {t.auto}</span>
            </button>
          )}
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
          {/* Riel de áreas */}
          <div
            role="tablist"
            aria-label={t.areas}
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {AREAS.map((a, i) => {
              const sel = i === indice;
              return (
                <button
                  key={a.id}
                  ref={(el) => {
                    pestanas.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`recorrido-tab-${a.id}`}
                  aria-selected={sel}
                  aria-controls="recorrido-panel"
                  tabIndex={sel ? 0 : -1}
                  onClick={() => elegir(i)}
                  className={cn(
                    "group relative flex shrink-0 snap-start items-center gap-3 overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-colors lg:w-full",
                    sel
                      ? "border-white/20 bg-white/[0.06]"
                      : "border-transparent hover:bg-white/[0.03]",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-md border font-mono text-xs font-bold transition-colors",
                      sel ? "text-[#020a18]" : "text-white/80",
                    )}
                    style={{
                      borderColor: a.color,
                      background: sel ? a.color : "transparent",
                    }}
                    aria-hidden="true"
                  >
                    {a.letra}
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-sm font-semibold transition-colors lg:whitespace-normal",
                      sel
                        ? "text-white"
                        : "text-white/60 group-hover:text-white/85",
                    )}
                  >
                    {a.nombre}
                  </span>
                  {sel && autoCorre && (
                    <span
                      key={`${a.id}-${visible}`}
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-0 bottom-0 h-0.5",
                        s.progreso,
                      )}
                      style={{
                        background: a.color,
                        ["--dur" as string]: `${duracion}ms`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Panel del área */}
          <div
            id="recorrido-panel"
            role="tabpanel"
            aria-labelledby={`recorrido-tab-${area.id}`}
            className="grid items-center gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
          >
            <Dispositivos
              key={area.id}
              area={area}
              capturas={capturas}
              modulos={destacados}
              conTelefono={conTelefono}
              activo={corre}
              etiquetas={{
                pantalla: t.pantalla,
                telefono: t.telefono,
                arte: t.arte,
              }}
            />

            <div key={`info-${area.id}`} className={cn("min-w-0", s.entrada)}>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-white/70">
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{ background: area.color }}
                  aria-hidden="true"
                />
                {area.letra} · {area.nombre}
              </p>
              <h3 className="mt-3 text-2xl font-bold leading-snug text-white md:text-[1.7rem]">
                {area.frase}
              </h3>

              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                {t.modulos}
              </p>
              <ul className="mt-3 space-y-3">
                {destacados.map((m) => (
                  <li
                    key={m.id}
                    className="border-l-2 pl-3"
                    style={{ borderColor: area.color }}
                  >
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">
                      {m.nombre}
                      {m.estado === "piloto" && (
                        <span className="rounded-sm border border-white/20 px-1.5 py-0.5 font-mono text-[8px] font-normal uppercase tracking-[0.2em] text-white/70">
                          {t.piloto}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#9eb0c0] md:text-sm">
                      {m.frase}
                    </p>
                  </li>
                ))}
              </ul>

              <Link
                href={`/servicios/${area.id}`}
                className="bevel-btn mt-8 inline-flex items-center gap-2 bg-white px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#020a18] transition-colors hover:bg-accent hover:text-white"
              >
                {t.verArea}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
