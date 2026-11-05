"use client";

import { ArrowLeft, ArrowRight, Hand } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Area } from "@/data/servicios";
import { idIntroArea, idModulo } from "@/lib/narracion/contrato";
import { cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/integral/RevealOnScroll";
import { FOCOS_ESCENA } from "./escenas/contrato";
import { EscenaArea } from "./escenas/EscenaArea";
import { ArteArea } from "./ArteArea";
import { BloqueDestacado } from "./BloqueDestacado";
import { Cierre } from "./Cierre";
import { EVENTO_FOCO_SERVICIO } from "./eventos";
import { SeccionModulo } from "./SeccionModulo";
import { ServiciosHeader } from "./ServiciosHeader";
import { Eyebrow, Icono, PieServicios, rgba } from "./ui";

/** Resumen de otra área (navegación anterior/siguiente y relacionadas). */
export type AreaBreve = {
  id: string;
  letra: string;
  nombre: string;
  frase: string;
  color: string;
  icono: string;
  arte?: string;
  modulos: number;
};

type Props = {
  area: Area;
  /** null si el catálogo tiene una sola área. */
  anterior: AreaBreve | null;
  siguiente: AreaBreve | null;
  relacionadas: AreaBreve[];
  /** id de módulo → id de área, de todo el catálogo (para saltar a otra área). */
  indiceModulos: Record<string, string>;
};

/** Tiempo máximo que se ignoran los cambios por scroll durante un salto programado. */
const BLOQUEO_MS = 1800;

function prefiereReducir() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AreaExperiencia({ area, anterior, siguiente, relacionadas, indiceModulos }: Props) {
  const router = useRouter();
  const focos = FOCOS_ESCENA[area.escena];
  const [activoId, setActivoId] = useState<string | null>(null);
  const [focoManual, setFocoManual] = useState<string | null>(null);
  const [interactuo, setInteractuo] = useState(false);
  const activoRef = useRef<string | null>(null);
  const bloqueoRef = useRef<{ destino: string; hasta: number } | null>(null);
  const capitulosRef = useRef<HTMLDivElement>(null);

  const porId = useMemo(() => new Map(area.modulos.map((m, i) => [m.id, { m, i }])), [area.modulos]);
  const moduloActivo = activoId ? porId.get(activoId)?.m : undefined;
  const foco = focoManual ?? moduloActivo?.foco ?? null;
  const etiqueta = foco ? focos[foco] ?? foco : "Vista general";

  /** Lleva la página al módulo y la cámara a su foco (sin pasar por los intermedios). */
  const irAModulo = useCallback(
    (id: string, suave = true) => {
      const el = document.getElementById(id);
      if (!el || !porId.has(id)) return false;
      bloqueoRef.current = { destino: id, hasta: performance.now() + BLOQUEO_MS };
      activoRef.current = id;
      setActivoId(id);
      setFocoManual(null);
      el.scrollIntoView({ behavior: suave && !prefiereReducir() ? "smooth" : "auto", block: "start" });
      return true;
    },
    [porId]
  );

  // Módulo visible: el que cruza la franja central de la pantalla.
  useEffect(() => {
    const cont = capitulosRef.current;
    if (!cont) return;
    const visibles = new Set<string>();
    const orden = area.modulos.map((m) => m.id);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.modulo;
          if (!id) continue;
          if (e.isIntersecting) visibles.add(id);
          else visibles.delete(id);
        }
        const elegido = orden.find((id) => visibles.has(id)) ?? null;
        const b = bloqueoRef.current;
        if (b) {
          if (performance.now() < b.hasta && elegido !== b.destino) return;
          bloqueoRef.current = null;
        }
        if (activoRef.current !== elegido) {
          activoRef.current = elegido;
          setActivoId(elegido);
          setFocoManual(null);
        }
      },
      { rootMargin: "-52% 0px -38% 0px", threshold: 0 }
    );
    cont.querySelectorAll<HTMLElement>("[data-modulo]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [area.modulos]);

  // Ancla en la URL: al cargar y con cada hashchange.
  useEffect(() => {
    const desdeHash = (suave: boolean) => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) irAModulo(id, suave);
    };
    const raf = requestAnimationFrame(() => desdeHash(false));
    const onHash = () => desdeHash(true);
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", onHash);
    };
  }, [irAModulo]);

  // Pedidos del asistente: { modulo?, foco? }. Idempotente: el mismo pedido
  // repetido en menos de 1 s (el asistente puede emitirlo dos veces) se ignora.
  useEffect(() => {
    let ultimo = { clave: "", t: 0 };
    const onFoco = (e: WindowEventMap["ars:foco-servicio"]) => {
      const { modulo, foco: f } = e.detail ?? {};
      const clave = `${modulo ?? ""}|${f ?? ""}`;
      const ahora = performance.now();
      if (clave === ultimo.clave && ahora - ultimo.t < 1000) return;
      ultimo = { clave, t: ahora };
      if (modulo && !porId.has(modulo)) {
        const otra = indiceModulos[modulo];
        if (otra) router.push(`/servicios/${otra}#${modulo}`);
        return;
      }
      if (modulo) irAModulo(modulo, true);
      if (f && f in focos) setFocoManual(f);
    };
    window.addEventListener(EVENTO_FOCO_SERVICIO, onFoco);
    return () => window.removeEventListener(EVENTO_FOCO_SERVICIO, onFoco);
  }, [focos, indiceModulos, irAModulo, porId, router]);

  // Toque sobre un hotspot de la escena → primer módulo con ese foco.
  const onSeleccion = useCallback(
    (clave: string) => {
      setInteractuo(true);
      const m = area.modulos.find((x) => x.foco === clave);
      if (m) irAModulo(m.id, true);
      setFocoManual(clave);
    },
    [area.modulos, irAModulo]
  );

  const total = area.modulos.length;
  const indiceActivo = activoId ? porId.get(activoId)?.i ?? -1 : -1;
  const canales = useMemo(() => [...new Set(area.modulos.flatMap((m) => m.canales))], [area.modulos]);
  const enProduccion = area.modulos.filter((m) => m.estado === "vivo").length;
  const acento = area.color;

  return (
    <div className="relative bg-[#020a18] text-foreground">
      <ServiciosHeader />

      <main>
        {/* ───────── Hero ───────── */}
        <section data-narracion={idIntroArea(area.id)} aria-labelledby="area-titulo" className="relative isolate flex min-h-[92svh] items-end overflow-hidden pb-14 pt-28 md:pb-20">
          <ArteArea
            src={area.arte}
            alt={`Arte de ${area.nombre}`}
            color={acento}
            letra={area.letra}
            sizes="100vw"
            priority
            className="-z-10"
            imgClassName="opacity-60"
            letraGrande={false}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#020a18] via-[#020a18]/70 to-[#020a18]/20" aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 -z-10 w-full bg-gradient-to-r from-[#020a18]/90 via-[#020a18]/40 to-transparent md:w-3/4" aria-hidden="true" />
          <span
            className="pointer-events-none absolute -right-[0.06em] top-[6%] -z-10 select-none font-serif text-[clamp(14rem,42vw,34rem)] italic leading-none"
            style={{ color: rgba(acento, 0.13), textShadow: `0 0 120px ${rgba(acento, 0.25)}` }}
            aria-hidden="true"
          >
            {area.letra}
          </span>

          <div className="mx-auto w-full max-w-7xl px-4 md:px-10">
            <nav aria-label="Ruta" className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
              <Link href="/servicios" className="hover:text-white">
                Servicios
              </Link>
              <span className="mx-2 text-white/25">/</span>
              <span className="text-white/80">Área {area.letra}</span>
            </nav>

            <div className="mt-8 flex items-center gap-4">
              <span
                className="grid size-14 place-items-center border font-serif text-3xl italic text-white md:size-16 md:text-4xl"
                style={{ borderColor: rgba(acento, 0.6), background: rgba(acento, 0.12), boxShadow: `0 0 40px -10px ${acento}` }}
                aria-hidden="true"
              >
                {area.letra}
              </span>
              <Icono nombre={area.icono} className="size-6 text-white/70" />
            </div>

            <h1
              id="area-titulo"
              className="mt-6 max-w-4xl text-balance font-heading text-[2.6rem] font-black leading-[1] tracking-tight text-white md:text-7xl lg:text-[5.4rem]"
            >
              {area.nombre}
            </h1>
            <p className="mt-5 max-w-3xl text-balance font-serif text-xl italic leading-snug md:text-3xl" style={{ color: rgba(acento, 0.95) }}>
              {area.frase}
            </p>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-[#c5d2ee] md:text-lg">{area.esencia}</p>

            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { v: String(total), t: total === 1 ? "módulo" : "módulos" },
                { v: String(enProduccion), t: "en producción" },
                { v: String(canales.length), t: canales.length === 1 ? "canal" : "canales" },
              ].map((s) => (
                <div key={s.t} className="flex flex-col-reverse">
                  <dt className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9eb0c0]">{s.t}</dt>
                  <dd className="font-heading text-3xl font-black tabular-nums text-white md:text-4xl">{s.v}</dd>
                </div>
              ))}
            </dl>

            {/* Índice de módulos */}
            <nav aria-label="Módulos del área" className="mt-10">
              <ol className="flex flex-wrap gap-2">
                {area.modulos.map((m, i) => (
                  <li key={m.id}>
                    <a
                      href={`#${m.id}`}
                      className="group flex items-center gap-2 border border-white/12 bg-[#020a18]/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/80 backdrop-blur transition-colors hover:border-white/35 hover:text-white"
                    >
                      <span className="tabular-nums" style={{ color: acento }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {m.nombre}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </section>

        {area.destacado && <BloqueDestacado destacado={area.destacado} colorArea={acento} />}

        {/* ───────── Escena 3D + capítulos ───────── */}
        <div className="relative lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)]">
          <div
            onPointerDown={() => setInteractuo(true)}
            className="sticky top-16 z-20 h-[42svh] overflow-hidden border-b border-white/10 bg-[#020a18] lg:top-0 lg:h-svh lg:self-start lg:border-b-0 lg:border-r"
          >
            <EscenaArea
              escena={area.escena}
              acento={acento}
              foco={foco}
              onSeleccion={onSeleccion}
              className="absolute inset-0"
              respaldo={
                <ArteArea src={area.arte} alt="" color={acento} letra={area.letra} sizes="60vw" imgClassName="opacity-50" />
              }
            />
            {/* Velos */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#020a18]/80 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#020a18] to-transparent" aria-hidden="true" />

            {/* Chip: qué se está viendo */}
            <div className="pointer-events-none absolute left-3 top-3 md:left-6 md:top-6 lg:top-24">
              <div
                className="flex max-w-[78vw] items-center gap-2.5 border bg-[#020a18]/80 px-3 py-2 backdrop-blur-md"
                style={{ borderColor: rgba(acento, 0.35) }}
              >
                <span className="relative flex size-2 shrink-0" aria-hidden="true">
                  <span className="absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:animate-none" style={{ background: acento }} />
                  <span className="relative size-2 rounded-full" style={{ background: acento }} />
                </span>
                <span className="shrink-0 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.24em] text-white/55">Estás viendo:</span>
                <span className="truncate text-[12.5px] font-bold text-white" aria-live="polite">
                  {etiqueta}
                </span>
              </div>
            </div>

            {/* Progreso por módulo (escritorio) */}
            <ol className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-2.5 lg:flex" aria-label="Ir a un módulo">
              {area.modulos.map((m, i) => (
                <li key={m.id}>
                  <a
                    href={`#${m.id}`}
                    aria-label={`${String(i + 1).padStart(2, "0")} · ${m.nombre}`}
                    aria-current={i === indiceActivo ? "true" : undefined}
                    className="group flex items-center justify-end gap-2"
                  >
                    <span className="pointer-events-none whitespace-nowrap bg-[#020a18]/85 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      {m.nombre}
                    </span>
                    <span
                      className="block w-[3px] transition-all duration-500"
                      style={{
                        height: i === indiceActivo ? 26 : 10,
                        background: i === indiceActivo ? acento : i < indiceActivo ? rgba(acento, 0.45) : "rgba(213,224,255,0.22)",
                      }}
                    />
                  </a>
                </li>
              ))}
            </ol>

            {/* Pista de interacción */}
            <div
              className={cn(
                "pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-white/55 transition-opacity duration-700 md:bottom-6 md:left-6",
                interactuo && "opacity-0"
              )}
              aria-hidden="true"
            >
              <Hand className="size-3.5" />
              Arrastre para mirar
            </div>
            {indiceActivo >= 0 && (
              <div className="pointer-events-none absolute bottom-3 right-3 font-mono text-[10px] tabular-nums tracking-[0.2em] text-white/60 md:bottom-6 md:right-6 lg:hidden" aria-hidden="true">
                <span style={{ color: acento }}>{String(indiceActivo + 1).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
              </div>
            )}
          </div>

          <div
            ref={capitulosRef}
            className="relative z-10 px-4 md:px-10 lg:px-12 xl:px-16"
          >
            <div className="mx-auto max-w-2xl lg:max-w-none">
              {area.modulos.map((m, i) => (
                <SeccionModulo
                  key={m.id}
                  modulo={m}
                  indice={i}
                  total={total}
                  acento={acento}
                  etiquetaFoco={focos[m.foco]}
                  activo={m.id === activoId}
                  narracion={idModulo(area.id, m.id)}
                />
              ))}
              <div className="h-[20svh]" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* ───────── Navegación entre áreas ───────── */}
        <section aria-label="Más áreas" className="relative border-t border-white/10 bg-[#020a18] py-20 md:py-28">
          <div className="grid-bg absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 md:px-10">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { a: anterior, dir: "Área anterior", Icon: ArrowLeft },
                { a: siguiente, dir: "Área siguiente", Icon: ArrowRight },
              ].flatMap(({ a, dir, Icon }, k) => (a ? [{ a, dir, Icon, k }] : [])).map(({ a, dir, Icon, k }) => (
                <Link
                  key={dir}
                  href={`/servicios/${a.id}`}
                  className={cn(
                    "group relative flex min-h-44 flex-col justify-end overflow-hidden border border-white/10 p-6 transition-colors hover:border-white/30 md:p-8",
                    k === 1 && "md:items-end md:text-right"
                  )}
                >
                  <ArteArea src={a.arte} alt="" color={a.color} letra={a.letra} sizes="50vw" imgClassName="opacity-40 transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020a18] via-[#020a18]/70 to-transparent" aria-hidden="true" />
                  <span className="relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/60">
                    {k === 0 && <Icon className="size-3.5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />}
                    {dir}
                    {k === 1 && <Icon className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
                  </span>
                  <span className="relative mt-3 text-2xl font-black text-white md:text-3xl">
                    <span className="mr-2 font-serif italic" style={{ color: a.color }}>
                      {a.letra}
                    </span>
                    {a.nombre}
                  </span>
                  <span className="relative mt-2 max-w-md text-sm text-[#c5d2ee]">{a.frase}</span>
                </Link>
              ))}
            </div>

            {relacionadas.length > 0 && (
              <RevealOnScroll className="mt-16">
                <Eyebrow tint={acento}>
                  Se conecta con
                </Eyebrow>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {relacionadas.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/servicios/${r.id}`}
                        className="group flex h-full items-start gap-4 border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.05]"
                      >
                        <span
                          className="grid size-10 shrink-0 place-items-center border font-serif text-xl italic text-white"
                          style={{ borderColor: rgba(r.color, 0.5), background: rgba(r.color, 0.1) }}
                          aria-hidden="true"
                        >
                          {r.letra}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-bold text-white">{r.nombre}</span>
                          <span className="mt-1 block text-[13px] leading-relaxed text-[#9eb0c0]">{r.frase}</span>
                          <span className="mt-2 block font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/45">
                            {r.modulos} {r.modulos === 1 ? "módulo" : "módulos"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </RevealOnScroll>
            )}
            <div className="mt-12">
                <Link
                  href="/servicios#areas"
                  className="mt-8 inline-flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/70 hover:text-white"
                >
                  <span style={{ color: acento }}>▸</span> Ver todas las áreas
                </Link>
            </div>
          </div>
        </section>

        <Cierre
          eyebrow={`Área ${area.letra} · ${area.corto}`}
          titulo={`Véalo funcionando con sus propios datos.`}
          cuerpo={`Le mostramos ${area.nombre.toLowerCase()} en una demo guiada, conectado al resto de ARS: operación, central, gestión humana y finanzas en una sola plataforma.`}
          acento={acento}
          asunto={`Demo ARS — ${area.nombre}`}
          mensajeWhatsapp={`Hola ARS Intelligence, quiero una demo de ${area.nombre}.`}
        />
      </main>
      <PieServicios />
    </div>
  );
}
