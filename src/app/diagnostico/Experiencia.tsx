"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CloudCheck, History, PlayCircle, X } from "lucide-react";
import { DIAGNOSTICO_EJEMPLO } from "@/data/diagnostico/ejemplo";
import type { Diagnostico, RegistroGuardado } from "@/data/diagnostico/tipos";
import { cn } from "@/lib/utils";
import { leerDiagnostico } from "@/components/diagnostico/entrevista/cliente";
import { Entrevista } from "@/components/diagnostico/entrevista/Entrevista";
import { refCorta } from "@/components/diagnostico/entrevista/Analizando";
// Puntos de montaje de las etapas 2 y 3 (implementadas por otras sesiones).
import { HistoriaDiagnostico } from "@/components/diagnostico/historia/HistoriaDiagnostico";
import { ReporteDiagnostico } from "@/components/diagnostico/reporte/ReporteDiagnostico";

type Etapa = "entrevista" | "historia" | "reporte";

const ETAPAS: { id: Etapa; n: string; nombre: string }[] = [
  { id: "entrevista", n: "01", nombre: "Entrevista" },
  { id: "historia", n: "02", nombre: "Tu historia" },
  { id: "reporte", n: "03", nombre: "Reporte" },
];

/** Orquesta las tres etapas del diagnóstico: entrevista → historia 3D → reporte. */
export function Experiencia({ ejemplo }: { ejemplo: boolean }) {
  const [etapa, setEtapa] = useState<Etapa>(ejemplo ? "historia" : "entrevista");
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(ejemplo ? DIAGNOSTICO_EJEMPLO : null);
  const [previo, setPrevio] = useState<Diagnostico | null>(null);
  const [registro, setRegistro] = useState<RegistroGuardado | null>(null);

  // El aviso de «guardado» se queda unos segundos al pasar a la historia.
  useEffect(() => {
    if (!registro) return;
    const t = window.setTimeout(() => setRegistro(null), 9000);
    return () => window.clearTimeout(t);
  }, [registro]);

  // Diagnóstico de esta sesión del navegador (sessionStorage), para retomarlo.
  useEffect(() => {
    if (ejemplo) return;
    const d = leerDiagnostico();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de sessionStorage tras montar
    if (d) setPrevio(d);
  }, [ejemplo]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [etapa]);

  const abrir = (d: Diagnostico, e: Etapa = "historia") => {
    setDiagnostico(d);
    setPrevio(null);
    setEtapa(e);
  };

  return (
    <div className="relative min-h-screen bg-[#020a18] text-white">
      {/* Fondo: brillo de marca */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(35,72,212,0.22),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(20,38,100,0.35),transparent_55%)]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#020a18]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <Link href="/" aria-label="ARS Intelligence — inicio" className="shrink-0">
            <Image src="/images/logos/horizontal-blanco.png" alt="ARS Intelligence" width={1672} height={941} sizes="64px" priority className="h-7 w-auto md:h-8" />
          </Link>
          <nav aria-label="Etapas del diagnóstico" className="mx-auto hidden items-center gap-1 sm:flex">
            {ETAPAS.map((e, i) => {
              const activa = etapa === e.id;
              const disponible = e.id === "entrevista" ? !ejemplo : Boolean(diagnostico);
              return (
                <div key={e.id} className="flex items-center gap-1">
                  {i > 0 && <span className="h-px w-6 bg-white/15" aria-hidden="true" />}
                  <button
                    type="button"
                    disabled={!disponible || activa}
                    onClick={() => setEtapa(e.id)}
                    aria-current={activa ? "step" : undefined}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] transition-colors",
                      activa ? "text-white" : disponible ? "text-white/60 hover:text-white" : "text-white/25",
                    )}
                  >
                    <span className={cn("grid size-5 place-items-center border text-[9px]", activa ? "border-[#6b8aff] bg-[#2348d4] text-white" : "border-white/20")}>{e.n}</span>
                    {e.nombre}
                  </button>
                </div>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            {ejemplo ? (
              <Link href="/diagnostico" className="flex items-center gap-1.5 px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/75 hover:text-white">
                <ArrowLeft className="size-3.5" aria-hidden="true" /> Hacer el mío
              </Link>
            ) : (
              <Link href="/diagnostico?ejemplo=1" className="flex items-center gap-1.5 px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/75 hover:text-white">
                <PlayCircle className="size-3.5" aria-hidden="true" /> Ver ejemplo
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative">
        {etapa === "entrevista" && (
          <>
            <section className="mx-auto max-w-6xl px-4 pb-6 pt-8 md:px-6 md:pt-12">
              <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0] md:text-[11px]">
                <span className="inline-block size-2 bg-[#6b8aff] shadow-[0_0_12px_#6b8aff]" />
                Diagnóstico ARS · 5 minutos
              </p>
              <h1 className="mt-3 max-w-3xl font-serif text-3xl leading-[1.1] text-white md:text-5xl">
                ¿Cómo se vería tu empresa <span className="italic text-[#9eb0c0]">con ARS?</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#9eb0c0] md:text-base">
                Cuéntale a Ars cómo opera tu empresa: escríbele, háblale o muéstrale fotos, videos y documentos. Mientras conversan verás tu perfil llenarse y qué partes de ARS te sirven; al final nuestros agentes por área arman tu diagnóstico, tu historia en 3D y un reporte para compartir.
              </p>
              {previo && (
                <div className="mt-5 flex flex-wrap items-center gap-3 border border-[#6b8aff]/30 bg-[#2348d4]/10 px-4 py-3 animate-in fade-in">
                  <History className="size-4 text-[#6b8aff]" aria-hidden="true" />
                  <p className="text-sm text-white/90">
                    Ya tienes un diagnóstico de <strong>{previo.perfil.nombre}</strong>.
                  </p>
                  <div className="ml-auto flex gap-2">
                    <button type="button" onClick={() => abrir(previo, "historia")} className="px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white hover:text-[#d5e0ff]">
                      Ver historia
                    </button>
                    <button type="button" onClick={() => abrir(previo, "reporte")} className="bevel-btn bg-white px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#020a18]">
                      Ver reporte
                    </button>
                  </div>
                </div>
              )}
            </section>
            <Entrevista
              onDiagnostico={(d, r) => {
                if (r?.guardado) setRegistro(r);
                abrir(d);
              }}
            />
          </>
        )}

        {etapa === "historia" && diagnostico && (
          <section aria-label="Historia de tu diagnóstico">
            <HistoriaDiagnostico diagnostico={diagnostico} onTerminar={() => setEtapa("reporte")} />
          </section>
        )}

        {etapa === "reporte" && diagnostico && (
          <section aria-label="Reporte del diagnóstico">
            <ReporteDiagnostico diagnostico={diagnostico} />
            <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-3 px-4 pb-16">
              <button type="button" onClick={() => setEtapa("historia")} className="px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/70 hover:text-white">
                ↺ Ver la historia otra vez
              </button>
              <Link href="/servicios" className="px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/70 hover:text-white">
                Explorar todos los servicios →
              </Link>
            </div>
          </section>
        )}
      </main>

      {registro && (
        <div role="status" className="fixed bottom-4 left-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2.5 border border-[#35e0a1]/35 bg-[#03122a]/95 px-3.5 py-2.5 text-[13px] text-white shadow-[0_0_30px_rgba(53,224,161,0.15)] backdrop-blur animate-in fade-in slide-in-from-bottom-3">
          <CloudCheck className="size-4 shrink-0 text-[#35e0a1]" aria-hidden="true" />
          <span>
            Tu diagnóstico quedó guardado · <span className="font-mono text-[12px] tracking-wider text-[#35e0a1]">ref {refCorta(registro.id)}</span>
          </span>
          <button type="button" onClick={() => setRegistro(null)} className="ml-1 text-white/50 hover:text-white" aria-label="Cerrar aviso">
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
