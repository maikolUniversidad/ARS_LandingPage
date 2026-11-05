"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeft, ArrowRight, Clock, FileText, GitBranch, Network, PieChart, Sparkles } from "lucide-react";
import type { PreguntaSeguimiento, Propuesta, Respuestas, RespuestaSeguimiento } from "@/data/propuesta/tipos";
import { ContactForm } from "@/components/ContactForm";
import { useI18n } from "@/lib/i18n/context";
import { motorNarracion } from "@/lib/narracion/motor";
import { cn } from "@/lib/utils";
import { SIN_CONTORNO } from "./util";
import { Acciones } from "./Acciones";
import { Armando } from "./Armando";
import { borrarGuardado, escribirGuardado, leerGuardado, pedirPreguntas } from "./cliente";
import { Entrevista } from "./Entrevista";
import { PANTALLAS, RESPUESTAS_VACIAS } from "./guion";
import { GrafoApps } from "./PanelVivo";
import { ArsLeyendo, Seguimiento } from "./Seguimiento";
import type { ControlEscena3D } from "./escena3d";

/** La propuesta (galerías, analíticas, gráficos, 3D) se baja solo cuando hay una propuesta que mostrar. */
const VistaPropuesta = dynamic(() => import("./VistaPropuesta").then((m) => m.VistaPropuesta), {
  ssr: false,
  loading: () => <p className="py-16 text-center font-serif text-lg italic text-[#b9c8ff]" role="status">Abriendo su propuesta…</p>,
});

/** Capturas de la escena 3D para el PDF y el envío; nunca falla ni tarda más de 8 s. */
async function capturar3d(ref: RefObject<ControlEscena3D | null>): Promise<string[]> {
  const ctrl = ref.current;
  if (!ctrl) return [];
  try {
    return await Promise.race([ctrl.capturar(), new Promise<string[]>((r) => setTimeout(() => r([]), 8000))]);
  } catch {
    return [];
  }
}

type Fase = "inicio" | "entrevista" | "leyendo" | "seguimiento" | "armando" | "propuesta" | "datos";

const PASO_PLAZO = PANTALLAS.findIndex((p) => p.id === "plazo");

const RECIBE = [
  { icono: GitBranch, titulo: "Línea de trabajo", texto: "Fases, tiempos estimados y qué se entrega en cada una." },
  { icono: Network, titulo: "Integración con sus sistemas", texto: "Qué se conecta, qué se migra y qué se queda como está." },
  { icono: PieChart, titulo: "Reportes", texto: "Qué informe recibe cada quien: cliente, gerencia, coordinadores." },
  { icono: FileText, titulo: "Propuesta en PDF", texto: "Para compartirla con su equipo o enviarla a un asesor." },
];

/**
 * Módulo «Propuesta ARS» (cierre de la home): entrevista guiada → preguntas de
 * seguimiento de Ars → «armando» → propuesta animada → PDF / envío a un asesor.
 * En inglés muestra el formulario de contacto simple.
 */
type PropsExperiencia = {
  className?: string;
  /** Avisa si el módulo está en su pantalla de inicio (la home acomoda el formulario a su lado). */
  onEnInicio?: (enInicio: boolean) => void;
  /** El formulario de contacto ya se muestra aparte: oculta «Prefiero solo dejar mis datos». */
  formularioAparte?: boolean;
};

export function ExperienciaPropuesta({ className, onEnInicio, formularioAparte }: PropsExperiencia) {
  const { locale } = useI18n();
  if (locale === "en") {
    return (
      <div className={cn("w-full", className)}>
        <ContactForm />
      </div>
    );
  }
  return <ExperienciaEs className={className} onEnInicio={onEnInicio} formularioAparte={formularioAparte} />;
}

function ExperienciaEs({ className, onEnInicio, formularioAparte }: PropsExperiencia) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [respuestas, setRespuestas] = useState<Respuestas>(RESPUESTAS_VACIAS);
  const [paso, setPaso] = useState(0);
  const [seguimiento, setSeguimiento] = useState<RespuestaSeguimiento[]>([]);
  const [preguntas, setPreguntas] = useState<PreguntaSeguimiento[]>([]);
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null);
  const [enviada, setEnviada] = useState(false);
  const [cargado, setCargado] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const escenaRef = useRef<ControlEscena3D | null>(null);
  const preguntasEnCurso = useRef<Promise<PreguntaSeguimiento[]> | null>(null);

  // Ars acompaña por voz los cambios de fase que hace la persona (si la narración
  // está encendida; el motor no pisa al asistente ni una conversación en curso).
  const fasePrevia = useRef<Fase | null>(null);
  useEffect(() => {
    if (!cargado) return;
    const previa = fasePrevia.current;
    fasePrevia.current = fase;
    if (previa === null || previa === fase) return;
    const clip =
      fase === "entrevista" && previa === "inicio"
        ? "propuesta/entrevista"
        : fase === "seguimiento"
          ? "propuesta/seguimiento"
          : fase === "armando"
            ? "propuesta/armando"
            : fase === "propuesta" && previa === "armando"
              ? "propuesta/lista"
              : null;
    if (clip) motorNarracion.narrar(clip, { inmediato: true, forzar: true });
  }, [cargado, fase]);
  const enviadaPrevia = useRef<boolean | null>(null);
  useEffect(() => {
    if (!cargado) return;
    // La primera vez solo toma lo restaurado de la pestaña, sin narrar.
    if (enviadaPrevia.current === false && enviada) motorNarracion.narrar("propuesta/enviada", { inmediato: true, forzar: true });
    enviadaPrevia.current = enviada;
  }, [cargado, enviada]);

  // Restaura lo guardado en esta pestaña (después de hidratar, para no desajustar el HTML del servidor).
  useEffect(() => {
    const t = setTimeout(() => {
      const g = leerGuardado();
      if (g?.respuestas) {
        setRespuestas({ ...RESPUESTAS_VACIAS, ...g.respuestas });
        setPaso(Math.min(Math.max(0, g.paso ?? 0), PANTALLAS.length - 1));
        setSeguimiento(Array.isArray(g.seguimiento) ? g.seguimiento : []);
        if (g.propuesta) {
          setPropuesta(g.propuesta);
          setEnviada(Boolean(g.enviada));
          setFase("propuesta");
        }
      }
      setCargado(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (cargado) escribirGuardado({ respuestas, paso, seguimiento, propuesta, enviada });
  }, [cargado, respuestas, paso, seguimiento, propuesta, enviada]);

  /** Cambia de fase y lleva la vista al inicio del módulo si quedó arriba. */
  const ir = useCallback((f: Fase) => {
    setFase(f);
    requestAnimationFrame(() => {
      const el = raiz.current;
      if (!el) return;
      if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      if (!el.contains(document.activeElement)) el.querySelector<HTMLElement>("h3[tabindex='-1']")?.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    onEnInicio?.(fase === "inicio");
  }, [fase, onEnInicio]);

  const cambiar = useCallback((p: Partial<Respuestas>) => setRespuestas((r) => ({ ...r, ...p })), []);

  const cambiarPaso = (n: number) => {
    // Al pasar el bloque de dolores, Ars empieza a pensar sus preguntas mientras la persona deja su contacto.
    if (paso === PASO_PLAZO && n === PASO_PLAZO + 1) preguntasEnCurso.current = pedirPreguntas(respuestas);
    setPaso(n);
  };

  const terminarEntrevista = async () => {
    ir("leyendo");
    const promesa = preguntasEnCurso.current ?? pedirPreguntas(respuestas);
    preguntasEnCurso.current = null;
    const qs = await promesa;
    setPreguntas(qs);
    if (qs.length) ir("seguimiento");
    else ir("armando");
  };

  const nueva = () => {
    borrarGuardado();
    setRespuestas(RESPUESTAS_VACIAS);
    setPaso(0);
    setSeguimiento([]);
    setPreguntas([]);
    setPropuesta(null);
    setEnviada(false);
    ir("inicio");
  };

  return (
    <div ref={raiz} className={cn("@container w-full scroll-mt-24 text-white", className)}>
      {fase === "inicio" && (
        <Inicio
          continuar={cargado && paso > 0 && !propuesta ? respuestas.empresa || respuestas.nombre || "su entrevista" : null}
          onEmpezar={() => ir("entrevista")}
          onDatos={formularioAparte ? undefined : () => ir("datos")}
          verPropuesta={propuesta ? () => ir("propuesta") : undefined}
        />
      )}

      {fase === "entrevista" && (
        <Entrevista respuestas={respuestas} paso={paso} onCambio={cambiar} onPaso={cambiarPaso} onTerminar={terminarEntrevista} onSalir={() => ir("inicio")} />
      )}

      {fase === "leyendo" && <ArsLeyendo nombre={respuestas.nombre.trim().split(" ")[0]} />}

      {fase === "seguimiento" && <Seguimiento preguntas={preguntas} valor={seguimiento} onCambio={setSeguimiento} onTerminar={() => ir("armando")} />}

      {fase === "armando" && (
        <Armando
          respuestas={respuestas}
          seguimiento={seguimiento}
          onListo={(p) => {
            setPropuesta(p);
            setEnviada(false);
            ir("propuesta");
          }}
          onDejarDatos={() => ir("datos")}
          onVolver={() => ir("entrevista")}
        />
      )}

      {fase === "propuesta" && propuesta && (
        <VistaPropuesta
          propuesta={propuesta}
          escenaRef={escenaRef}
          acciones={
            <Acciones
              propuesta={propuesta}
              respuestas={respuestas}
              seguimiento={seguimiento}
              enviada={enviada}
              capturas3d={() => capturar3d(escenaRef)}
              onEnviada={() => setEnviada(true)}
              onEditar={() => {
                setPaso(0);
                ir("entrevista");
              }}
              onNueva={nueva}
            />
          }
        />
      )}

      {fase === "datos" && (
        <div className="border border-white/15 bg-[#020a18]/45 p-5 backdrop-blur md:p-8">
          <button
            type="button"
            onClick={() => ir(propuesta ? "propuesta" : "inicio")}
            className="mb-5 inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/65 hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> {propuesta ? "Volver a mi propuesta" : "Mejor quiero mi propuesta"}
          </button>
          <h3 tabIndex={-1} style={SIN_CONTORNO} className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-white/70 outline-none">
            Déjenos sus datos
          </h3>
          <ContactForm />
        </div>
      )}
    </div>
  );
}

function Inicio({ continuar, onEmpezar, onDatos, verPropuesta }: { continuar: string | null; onEmpezar: () => void; onDatos?: () => void; verPropuesta?: () => void }) {
  return (
    <section aria-labelledby="propuesta-inicio" className="relative overflow-hidden border border-white/15 bg-[#020a18]/55 p-5 backdrop-blur sm:p-7 md:p-10">
      <div className="grid gap-8 @4xl:grid-cols-[1.3fr_1fr] @4xl:items-center">
        <div>
          <span className="cta-latido inline-flex items-center gap-2 bg-[#2348d4] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white">
            <Sparkles className="size-3.5" aria-hidden="true" /> Recomendado · Autodiagnóstico con IA
          </span>
          <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.3em] text-[#6b8aff]">Propuesta ARS · con inteligencia artificial</p>
          <h3 id="propuesta-inicio" tabIndex={-1} style={SIN_CONTORNO} className="mt-4 font-heading text-3xl font-black leading-[1.05] tracking-tight text-white outline-none md:text-5xl">
            Cuéntenos su operación.{" "}
            <span className="font-serif font-normal italic text-[#b9c8ff]">Ars le arma la propuesta.</span>
          </h3>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#c5d2ee]/90 md:text-base">
            Responda unas preguntas sobre su empresa, sus sistemas y lo que le duele.{" "}
            <strong className="font-semibold text-white">Ars evalúa en qué áreas le podemos ayudar</strong> y al final recibe una propuesta hecha para usted:
          </p>
          <ul className="mt-6 grid gap-3 @xl:grid-cols-2">
            {RECIBE.map(({ icono: I, titulo, texto }, i) => (
              <li key={titulo} className="flex gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both motion-safe:duration-500" style={{ animationDelay: `${150 + i * 90}ms` }}>
                <span className="grid size-9 shrink-0 place-items-center border border-[#6b8aff]/35 bg-[#2348d4]/15 text-[#9fb4ff]">
                  <I className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[14px] font-bold text-white">{titulo}</span>
                  <span className="block text-[13px] leading-snug text-[#9eb0c0]">{texto}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onEmpezar}
              className="bevel-btn group inline-flex min-h-12 items-center justify-center gap-3 bg-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#020a18] shadow-[0_0_32px_rgba(107,138,255,0.55)] transition-colors hover:bg-[#d5e0ff]"
            >
              {continuar ? "Continuar donde iba" : "Hacer mi autodiagnóstico"}{" "}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/55">
              <Clock className="size-3.5" aria-hidden="true" /> Unos 3 minutos
            </span>
          </div>
          {continuar && <p className="mt-3 text-[13px] text-[#9eb0c0]">Guardamos sus respuestas de {continuar} en esta pestaña.</p>}
          {verPropuesta && (
            <button type="button" onClick={verPropuesta} className="mt-3 block text-[13.5px] text-[#b9c8ff] underline underline-offset-4 hover:text-white">
              Ver la propuesta que ya armó
            </button>
          )}
          {onDatos && <button type="button" onClick={onDatos} className="mt-5 block min-h-11 text-[13.5px] text-white/55 underline decoration-white/25 underline-offset-4 hover:text-white">
            Prefiero solo dejar mis datos
          </button>}
        </div>

        <div aria-hidden="true" className="hidden @4xl:block">
          <GrafoApps apps={["Excel", "WhatsApp", "Software contable", "Radio análoga", "Grabadores", "Nómina"]} className="opacity-90" />
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">Sus sistemas, conectados con ARS</p>
        </div>
      </div>
    </section>
  );
}
