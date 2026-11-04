"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown, FileText, ScanEye } from "lucide-react";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import type { Accion, Cita, Tarjeta } from "@/lib/asistente/tipos";
import { FormularioContacto } from "./FormularioContacto";

type Props = {
  tarjetas: Tarjeta[];
  ejecutar: (a: Accion) => void;
  /** Envía una respuesta rápida. Sin ella (mensajes antiguos) no se muestran. */
  alEnviar?: (texto: string) => void;
};

const clave = (x: Tarjeta) =>
  x.tipo === "analitica" ? `a:${x.id}` : x.tipo === "enlace" ? `e:${x.ruta}#${x.ancla ?? ""}` : x.tipo;

/** Tarjetas enriquecidas bajo un mensaje: analíticas, enlaces, contacto y respuestas rápidas. */
export function Tarjetas({ tarjetas, ejecutar, alEnviar }: Props) {
  const { t } = useTextosAsistente();
  if (!tarjetas.length) return null;
  // Sin duplicados (una misma tarjeta puede venir de dos herramientas).
  const vistas = new Set<string>();
  const unicas = tarjetas.filter((x) => {
    const k = clave(x);
    if (vistas.has(k)) return false;
    vistas.add(k);
    return true;
  });
  const sugerencias = unicas.filter((x): x is Extract<Tarjeta, { tipo: "sugerencias" }> => x.tipo === "sugerencias");
  const resto = unicas.filter((x) => x.tipo !== "sugerencias");

  return (
    <>
      {resto.length > 0 && (
        <ul className="mt-2 space-y-2" aria-label={t("asistente.sugerencias")}>
          {resto.map((x, i) => (
            <li key={i}>
              {x.tipo === "contacto" ? (
                <FormularioContacto motivo={x.motivo} />
              ) : x.tipo === "analitica" ? (
                <button
                  type="button"
                  onClick={() => ejecutar({ tipo: "mostrar_analitica", id: x.id })}
                  className="group flex w-full items-start gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-[#142664]/60 to-[#020a18]/60 p-3 text-left transition-colors hover:border-[#2348d4]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#2348d4]/25 text-[#9fb6ff]">
                    <ScanEye className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-[#9eb0c0]">
                      {t("asistente.tarjeta.analitica")} · {x.familia}
                    </span>
                    <span className="mt-0.5 block text-sm font-bold text-foreground">{x.nombre}</span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-foreground/60">{x.corta}</span>
                  </span>
                  <span className="self-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#9fb6ff] group-hover:text-white">
                    {t("asistente.tarjeta.ver")} →
                  </span>
                </button>
              ) : x.tipo === "enlace" ? (
                <button
                  type="button"
                  onClick={() => ejecutar({ tipo: "ir_a", ruta: x.ruta, ancla: x.ancla })}
                  className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-[#2348d4]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-[#9eb0c0]">
                      {x.ruta}
                      {x.ancla ? `#${x.ancla}` : ""}
                    </span>
                    <span className="mt-0.5 block text-sm font-bold text-foreground">{x.titulo}</span>
                    {x.descripcion && <span className="mt-0.5 line-clamp-2 block text-xs text-foreground/60">{x.descripcion}</span>}
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-[#9fb6ff] transition-transform group-hover:-translate-x-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {alEnviar && sugerencias.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={t("asistente.respuestasRapidas")}>
          {sugerencias.flatMap((s) => s.opciones).slice(0, 3).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => alEnviar(o)}
              className="rounded-full border border-[#2348d4]/45 bg-[#2348d4]/10 px-3 py-1.5 text-left text-xs text-[#cdd8ff] transition-colors hover:border-[#2348d4] hover:bg-[#2348d4]/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/** Fragmentos citados de los documentos adjuntos (plegables). */
export function Citas({ citas }: { citas: Cita[] }) {
  const { t } = useTextosAsistente();
  const [abierto, setAbierto] = useState(false);
  if (!citas.length) return null;
  const unicas = citas.filter((c, i) => citas.findIndex((d) => d.texto === c.texto && d.documento === c.documento) === i);
  return (
    <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[#9eb0c0] hover:text-foreground"
      >
        <FileText className="size-3.5" aria-hidden="true" />
        {t("asistente.fuentes")} · {unicas.length}
        <ChevronDown className={`ml-auto size-3.5 transition-transform ${abierto ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {abierto && (
        <ol className="space-y-2 px-3 pb-3">
          {unicas.map((c, i) => (
            <li key={i} className="border-l-2 border-[#2348d4]/60 pl-2.5 text-xs">
              <span className="block font-semibold text-foreground/85">
                {c.documento}
                {c.pagina ? ` · ${t("asistente.pagina")} ${c.pagina}` : ""}
              </span>
              <span className="mt-0.5 block italic text-foreground/60">«{c.texto.trim()}»</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
