"use client";

import Image from "next/image";
import { useCallback, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { ESTADOS, PAISES, type Ciudad, type EstadoProyecto, type PaisId, type ProyectoVista } from "@/data/proyectos";
import { cn } from "@/lib/utils";
import { ESTADO_CLASES, claseArea } from "./estilos";
import { FichaProyecto } from "./FichaProyecto";
import type { GeometriaMapa } from "./geometria-tipos";
import { MapaProyectos } from "./MapaProyectos";

type Props = {
  proyectos: ProyectoVista[];
  ciudades: Ciudad[];
  areas: { id: string; corto: string }[];
  geometria: GeometriaMapa;
};

type Filtros = { area: string | null; pais: PaisId | null; estado: EstadoProyecto | null; ciudad: string | null };
const SIN_FILTROS: Filtros = { area: null, pais: null, estado: null, ciudad: null };

const EVENTO_HASH = "proyectos:hash";
function suscribirHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener(EVENTO_HASH, cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener(EVENTO_HASH, cb);
  };
}
/** Cambia la URL sin saltar de scroll ni sumar entradas al historial. */
function fijarHash(url: string) {
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(EVENTO_HASH));
}

/** Mapa + filtros (área, país, estado, ciudad) + tarjetas + ficha. La ficha abierta vive en el hash: /proyectos#<id>. */
export function ExploradorProyectos({ proyectos, ciudades, areas, geometria }: Props) {
  const [f, setF] = useState<Filtros>(SIN_FILTROS);
  // La ficha abierta se lee del hash (enlace compartido, atrás/adelante).
  const hash = useSyncExternalStore(suscribirHash, () => window.location.hash, () => "");
  const activoId = decodeURIComponent(hash.slice(1));

  const abrir = useCallback((id: string) => fijarHash(`#${id}`), []);
  const cerrar = useCallback(() => {
    if (window.location.hash) fijarHash(window.location.pathname + window.location.search);
  }, []);

  const pasa = useCallback(
    (p: ProyectoVista, ignorar?: keyof Filtros) =>
      (ignorar === "area" || !f.area || p.areas.some((a) => a.id === f.area)) &&
      (ignorar === "pais" || !f.pais || p.ciudad.pais === f.pais) &&
      (ignorar === "estado" || !f.estado || p.estado === f.estado) &&
      (ignorar === "ciudad" || !f.ciudad || p.ciudadId === f.ciudad),
    [f]
  );

  const visibles = useMemo(() => proyectos.filter((p) => pasa(p)), [proyectos, pasa]);

  const ciudadesMapa = useMemo(
    () =>
      ciudades.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        pais: c.pais,
        total: proyectos.filter((p) => p.ciudadId === c.id).length,
        visibles: proyectos.filter((p) => p.ciudadId === c.id && pasa(p, "ciudad")).length,
      })),
    [ciudades, proyectos, pasa]
  );

  const cuenta = (k: keyof Filtros, v: string) =>
    proyectos.filter((p) => pasa(p, k) && (k === "area" ? p.areas.some((a) => a.id === v) : k === "pais" ? p.ciudad.pais === v : k === "estado" ? p.estado === v : p.ciudadId === v)).length;

  const hayFiltros = Object.values(f).some(Boolean);
  const ciudadSel = ciudades.find((c) => c.id === f.ciudad);
  const activo = proyectos.find((p) => p.id === activoId) ?? null;

  const setPais = (pais: PaisId | null) =>
    setF((x) => ({ ...x, pais, ciudad: pais && ciudadSel && ciudadSel.pais !== pais ? null : x.ciudad }));

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        {/* ───── Mapa ───── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative mx-auto max-w-md border border-white/10 bg-[#04122b]/60 p-3 lg:max-w-none">
            <MapaProyectos
              geometria={geometria}
              ciudades={ciudadesMapa}
              seleccionada={f.ciudad}
              pais={f.pais}
              onSeleccionar={(ciudad) => setF((x) => ({ ...x, ciudad }))}
            />
            <div className="pointer-events-none absolute left-4 top-4 font-mono text-[9.5px] uppercase tracking-[0.25em] text-white/45">
              {ciudadSel ? `${ciudadSel.nombre} · ${PAISES[ciudadSel.pais]}` : "Toque una ciudad"}
            </div>
          </div>
          <ul className="mx-auto mt-4 flex max-w-md flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 lg:max-w-none">
            {(Object.keys(ESTADOS) as EstadoProyecto[]).map((e) => (
              <li key={e} className="flex items-center gap-2">
                <span className={cn("size-1.5 rounded-full", ESTADO_CLASES[e].punto)} aria-hidden="true" />
                {ESTADOS[e].texto}
              </li>
            ))}
          </ul>
        </div>

        {/* ───── Filtros + tarjetas ───── */}
        <div>
          <div className="space-y-5 border-y border-white/10 py-5">
            <GrupoFiltro titulo="Estado">
              <Chip activo={!f.estado} onClick={() => setF((x) => ({ ...x, estado: null }))}>
                Todos
              </Chip>
              {(Object.keys(ESTADOS) as EstadoProyecto[]).map((e) => (
                <Chip
                  key={e}
                  activo={f.estado === e}
                  n={cuenta("estado", e)}
                  punto={ESTADO_CLASES[e].punto}
                  onClick={() => setF((x) => ({ ...x, estado: x.estado === e ? null : e }))}
                >
                  {ESTADOS[e].texto}
                </Chip>
              ))}
            </GrupoFiltro>

            <GrupoFiltro titulo="País">
              <Chip activo={!f.pais} onClick={() => setPais(null)}>
                Todos
              </Chip>
              {(Object.keys(PAISES) as PaisId[]).map((p) => (
                <Chip key={p} activo={f.pais === p} n={cuenta("pais", p)} onClick={() => setPais(f.pais === p ? null : p)}>
                  {PAISES[p]}
                </Chip>
              ))}
              {ciudadSel && (
                <Chip activo onClick={() => setF((x) => ({ ...x, ciudad: null }))} quitar>
                  {ciudadSel.nombre}
                </Chip>
              )}
            </GrupoFiltro>

            <GrupoFiltro titulo="Área de servicio">
              <label className="sr-only" htmlFor="filtro-area">
                Área de servicio
              </label>
              <select
                id="filtro-area"
                value={f.area ?? ""}
                onChange={(e) => setF((x) => ({ ...x, area: e.target.value || null }))}
                className="w-full border border-white/15 bg-[#04122b] px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white focus:border-[#6b8aff] focus:outline-none sm:w-auto"
              >
                <option value="">Todas las áreas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.corto} ({cuenta("area", a.id)})
                  </option>
                ))}
              </select>
            </GrupoFiltro>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/55" aria-live="polite">
            <span>
              <span className="font-bold text-white">{visibles.length}</span> de {proyectos.length} proyectos
            </span>
            {hayFiltros && (
              <button
                type="button"
                onClick={() => setF(SIN_FILTROS)}
                className="inline-flex items-center gap-2 py-2 text-white/70 transition-colors hover:text-white"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" /> Limpiar filtros
              </button>
            )}
          </div>

          {visibles.length === 0 ? (
            <div className="mt-6 border border-dashed border-white/15 px-6 py-12 text-center">
              <p className="text-white/70">No hay proyectos con esa combinación.</p>
              <button
                type="button"
                onClick={() => setF(SIN_FILTROS)}
                className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#9fb4ff] underline underline-offset-4 hover:text-white"
              >
                Ver todos
              </button>
            </div>
          ) : (
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {visibles.map((p) => (
                <li key={p.id}>
                  <Tarjeta p={p} onAbrir={() => abrir(p.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <FichaProyecto proyecto={activo} onCerrar={cerrar} />
    </>
  );
}

function Tarjeta({ p, onAbrir }: { p: ProyectoVista; onAbrir: () => void }) {
  const ec = ESTADO_CLASES[p.estado];
  return (
    <article id={p.id} className="group relative flex h-full scroll-mt-28 flex-col border border-white/10 bg-[#04122b]/70 transition-colors hover:border-white/25">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-[#020a18]">
        {p.portada && (
          <Image
            src={p.portada.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 22rem, (min-width: 768px) 45vw, 100vw"
            className="object-cover object-top opacity-80 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04122b] via-transparent to-transparent" aria-hidden="true" />
        <span className={cn("absolute left-3 top-3 inline-flex items-center gap-2 border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white backdrop-blur", ec.caja)}>
          <span className={cn("size-1.5 rounded-full", ec.punto)} aria-hidden="true" />
          {ESTADOS[p.estado].texto}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9eb0c0]">
          {p.sectorNombre} · {p.ciudad.nombre}
        </div>
        <h3 className="mt-2 text-balance font-heading text-lg font-black leading-tight text-white">
          <button type="button" onClick={onAbrir} className="text-left after:absolute after:inset-0 focus:outline-none">
            {p.titulo}
          </button>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{p.resumen}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Áreas">
          {p.areas.map((a) => (
            <li
              key={a.id}
              className={cn("flex items-center gap-1.5 border bg-white/[0.02] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/80", claseArea(a.id).borde)}
            >
              <span className={cn("size-1", claseArea(a.id).punto)} aria-hidden="true" />
              {a.corto}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 font-mono text-[10px] uppercase tracking-[0.2em]">
          <span className="text-white/40">{p.verificado ? p.cliente : "Caso de referencia"}</span>
          <span className="inline-flex items-center gap-1.5 text-white/80 transition-colors group-hover:text-white">
            Ver ficha <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
      <span className="pointer-events-none absolute inset-0 ring-[#6b8aff] group-has-[:focus-visible]:ring-2" aria-hidden="true" />
    </article>
  );
}

function GrupoFiltro({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#9eb0c0]">{titulo}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({
  activo,
  onClick,
  children,
  n,
  punto,
  quitar,
}: {
  activo: boolean;
  onClick: () => void;
  children: ReactNode;
  n?: number;
  punto?: string;
  quitar?: boolean;
}) {
  const vacio = n === 0 && !activo;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      disabled={vacio}
      className={cn(
        "inline-flex min-h-9 items-center gap-2 border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors disabled:cursor-not-allowed disabled:opacity-35",
        activo ? "border-white bg-white text-[#020a18]" : "border-white/15 bg-white/[0.03] text-white/80 hover:border-white/40 hover:text-white"
      )}
    >
      {punto && <span className={cn("size-1.5 rounded-full", punto)} aria-hidden="true" />}
      {children}
      {n !== undefined && <span className={activo ? "text-[#020a18]/60" : "text-white/40"}>{n}</span>}
      {quitar && <span aria-label="quitar filtro">×</span>}
    </button>
  );
}
