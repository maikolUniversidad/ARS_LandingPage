"use client";

import Image from "next/image";
import { useEffect, useImperativeHandle, useMemo, useRef, useState, useSyncExternalStore, type Ref } from "react";
import { Layers, RotateCcw, X } from "lucide-react";
import { isLowPower, isModestDevice, noopSubscribe, supportsWebGL } from "@/lib/three/webgl";
import { CargaTecnologica } from "@/components/carga/CargaTecnologica";
import { cn } from "@/lib/utils";
import type { ControlEscena3D, PropsEscena3D } from "./index";
import { MODOS, planDesdePropuesta, type ModoIntegracion, type PlanEscena } from "./plan";
import type { InstanciaEscena3D } from "./escena";

const prefiereMenosMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * «Su operación en 3D»: el campus de ARS con las áreas de la propuesta encendiéndose
 * por fases y sus sistemas conectados al núcleo. Ocupa el tamaño de su contenedor
 * (pásale `className` con alto o `absolute inset-0`).
 * `ref.capturar()` → 2–3 JPEG dataURL (1600×900) para el PDF; `[]` sin WebGL.
 */
export function EscenaPropuesta3D({ propuesta, className, ref }: PropsEscena3D & { ref?: Ref<ControlEscena3D> }) {
  const plan = useMemo(() => planDesdePropuesta(propuesta), [propuesta]);
  const webgl = useSyncExternalStore(noopSubscribe, supportsWebGL, () => true);
  const reducedMotion = useSyncExternalStore(noopSubscribe, prefiereMenosMovimiento, () => false);
  const [fallo, setFallo] = useState(false);
  // El motor (three) aún baja/construye: se muestra el cargador encima del canvas.
  const [listo, setListo] = useState(false);
  const [fase, setFase] = useState(-1);
  const [leyenda, setLeyenda] = useState(false);

  const contRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instRef = useRef<InstanciaEscena3D | null>(null);
  const usa3dRef = useRef(true);
  const usa3d = webgl && !fallo;
  useEffect(() => {
    usa3dRef.current = usa3d;
  }, [usa3d]);

  useImperativeHandle(
    ref,
    () => ({
      async capturar() {
        // Si la escena aún se está cargando (import dinámico), se espera un poco.
        for (let i = 0; i < 40 && usa3dRef.current && !instRef.current; i++) await esperar(100);
        if (!usa3dRef.current) return [];
        const inst = instRef.current;
        if (!inst) return [];
        try {
          return inst.capturar();
        } catch {
          return [];
        }
      },
    }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const cont = contRef.current;
    if (!canvas || !cont || !usa3d) return;
    let vivo = true;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    let visible = document.visibilityState === "visible";
    let enPantalla = false;
    const onVis = () => {
      visible = document.visibilityState === "visible";
      instRef.current?.setActiva(visible && enPantalla);
    };

    import("./escena")
      .then(({ crearEscena3D }) => {
        if (!vivo) return;
        const inst = crearEscena3D({
          canvas,
          plan,
          lowPower: isLowPower(),
          calidadBaja: isModestDevice(),
          reducedMotion: prefiereMenosMovimiento(),
          onFase: (f) => vivo && setFase(f),
          onFallo: () => vivo && setFallo(true),
        });
        instRef.current = inst;
        const r = cont.getBoundingClientRect();
        inst.resize(r.width, r.height);
        // Dos cuadros: el primero lo pinta la escena, el segundo ya está en pantalla.
        requestAnimationFrame(() => requestAnimationFrame(() => vivo && setListo(true)));
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
      setListo(false);
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      instRef.current?.dispose();
      instRef.current = null;
    };
  }, [usa3d, plan]);

  const nFases = plan.fases.length;
  const titulo =
    !usa3d || fase < 0
      ? "Su operación con ARS"
      : fase >= nFases
        ? "Conectado con sus sistemas"
        : `${plan.fases[fase].rotulo} · ${plan.fases[fase].titulo}`;
  const descripcion = `Vista 3D de la propuesta para ${propuesta.empresa}: ${plan.fases
    .map((f) => `${f.rotulo}, ${f.titulo}`)
    .join("; ")}. Sistemas conectados: ${plan.satelites.map((s) => `${s.sistema} (${MODOS[s.modo].etiqueta.toLowerCase()})`).join(", ") || "ninguno"}.`;

  return (
    <div ref={contRef} className={cn("@container relative isolate h-full min-h-[320px] w-full overflow-hidden bg-[#020a18] text-[#e6eeff]", className)}>
      {usa3d ? (
        <canvas ref={canvasRef} role="img" aria-label={descripcion} className="absolute inset-0 block size-full" />
      ) : (
        <Respaldo plan={plan} descripcion={descripcion} />
      )}
      {usa3d && <CargaTecnologica variante="caja" etiqueta="Cargando su operación en 3D" listo={listo} />}

      {/* Rótulo de la fase actual */}
      <div className="pointer-events-none absolute top-3 left-3 right-14 @md:top-4 @md:left-4">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#6b8aff] uppercase">Su operación en 3D</p>
        <p key={titulo} aria-live="polite" className="mt-1 text-sm font-semibold text-balance @md:text-base">
          {titulo}
        </p>
      </div>

      {/* Controles */}
      <div className="absolute top-3 right-3 flex gap-1.5 @md:top-4 @md:right-4">
        {usa3d && !reducedMotion && (
          <button
            type="button"
            onClick={() => instRef.current?.reiniciar()}
            className="grid size-8 place-items-center rounded-full border border-white/15 bg-[#020a18]/70 text-[#a9bcff] backdrop-blur transition hover:border-[#6b8aff]/60 hover:text-white"
            aria-label="Ver de nuevo la animación por fases"
            title="Ver de nuevo"
          >
            <RotateCcw className="size-3.5" aria-hidden />
          </button>
        )}
        <button
          type="button"
          onClick={() => setLeyenda((v) => !v)}
          className="grid size-8 place-items-center rounded-full border border-white/15 bg-[#020a18]/70 text-[#a9bcff] backdrop-blur transition hover:border-[#6b8aff]/60 hover:text-white @xl:hidden"
          aria-label={leyenda ? "Ocultar leyenda" : "Mostrar leyenda"}
          aria-expanded={leyenda}
        >
          {leyenda ? <X className="size-3.5" aria-hidden /> : <Layers className="size-3.5" aria-hidden />}
        </button>
      </div>

      <Leyenda plan={plan} fase={usa3d ? fase : -1} abierta={leyenda} />

      {usa3d && (
        <p className="pointer-events-none absolute right-3 bottom-3 hidden text-[10px] text-[#9eb0c0]/70 @xl:block">Arrastre para mirar alrededor</p>
      )}
    </div>
  );
}

function Leyenda({ plan, fase, abierta }: { plan: PlanEscena; fase: number; abierta: boolean }) {
  const modos = [...new Set(plan.satelites.map((s) => s.modo))] as ModoIntegracion[];
  const erp = plan.satelites.find((s) => s.erp);
  return (
    <div
      className={cn(
        "absolute inset-x-3 bottom-3 max-h-[70%] overflow-y-auto rounded-xl border border-white/10 bg-[#020a18]/80 p-3 text-[11px] leading-snug backdrop-blur-md",
        "@xl:inset-x-auto @xl:left-4 @xl:bottom-4 @xl:block @xl:w-72",
        abierta ? "block" : "hidden",
      )}
    >
      <p className="mb-1.5 text-[10px] font-semibold tracking-[0.16em] text-[#9eb0c0] uppercase">Línea de trabajo</p>
      <ol className="space-y-1">
        {plan.fases.map((f, k) => {
          const activa = fase === k;
          const hecha = fase > k || fase < 0;
          return (
            <li key={k} className={cn("flex items-start gap-2 transition-opacity", !activa && !hecha && "opacity-45")}>
              <span
                aria-hidden
                className={cn("mt-1 size-2 shrink-0 rounded-full", activa && "ring-2 ring-white/40")}
                style={{ backgroundColor: f.color }}
              />
              <span>
                <span className="font-semibold">{f.rotulo}</span> · {f.titulo}
                {f.duracion && <span className="block text-[10px] text-[#9eb0c0]">{f.duracion}</span>}
              </span>
            </li>
          );
        })}
      </ol>
      {modos.length > 0 && (
        <>
          <p className="mt-2.5 mb-1.5 text-[10px] font-semibold tracking-[0.16em] text-[#9eb0c0] uppercase">Sus sistemas</p>
          <ul className="space-y-1">
            {modos.map((m) => (
              <li key={m} className="flex items-center gap-2">
                <span aria-hidden className="h-0.5 w-4 shrink-0 rounded-full" style={{ backgroundColor: MODOS[m].color }} />
                <span>
                  <span className="font-semibold">{MODOS[m].etiqueta}</span> <span className="text-[#9eb0c0]">— {MODOS[m].descripcion}</span>
                </span>
              </li>
            ))}
            {erp && (
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full border-2 border-[#ffb547]" />
                <span>
                  <span className="font-semibold">ERP</span> <span className="text-[#9eb0c0]">— {erp.sistema}</span>
                </span>
              </li>
            )}
          </ul>
        </>
      )}
      {plan.camaras > 0 && (
        <p className="mt-2 flex items-center gap-2 text-[#9eb0c0]">
          <span aria-hidden className="size-2 shrink-0 rotate-45 bg-[#5fd8ff]/70" />
          Analíticas de video en monitoreo
        </p>
      )}
    </div>
  );
}

function Respaldo({ plan, descripcion }: { plan: PlanEscena; descripcion: string }) {
  return (
    <div className="absolute inset-0">
      <Image src={`/servicios/arte/${plan.areaPrincipal}.jpg`} alt={descripcion} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover opacity-70" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#020a18] via-[#020a18]/40 to-[#020a18]/60" />
    </div>
  );
}
