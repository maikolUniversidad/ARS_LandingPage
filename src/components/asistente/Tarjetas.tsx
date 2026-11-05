"use client";

import { useState } from "react";
import { ArrowUpRight, Boxes, ChevronDown, FileText, ScanEye } from "lucide-react";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import type { Accion, Cita, Tarjeta } from "@/lib/asistente/tipos";
import { FormularioContacto } from "./FormularioContacto";
import { TarjetasExtra, esTarjetaExtra } from "./extra";
import { BloqueAnalitica, BloqueAntesDespues, BloqueGaleria, BloqueGrafico, BloqueNavegacion, BloquePasos, BloqueServicio } from "./bloques/Bloques";

type Props = {
  tarjetas: Tarjeta[];
  ejecutar: (a: Accion) => void;
  /** Envía una respuesta rápida. Sin ella (mensajes antiguos) no se muestran. */
  alEnviar?: (texto: string) => void;
  /** Mensaje más reciente (la navegación se muestra como «Te llevo a…» en curso). */
  reciente?: boolean;
};

const clave = (x: Tarjeta) =>
  x.tipo === "analitica"
    ? `a:${x.id}`
    : x.tipo === "enlace"
      ? `e:${x.ruta}#${x.ancla ?? ""}`
      : x.tipo === "servicio"
        ? `s:${x.modulo}`
        : x.tipo === "galeria" || x.tipo === "grafico" || x.tipo === "pasos" || x.tipo === "antes_despues"
          ? `${x.tipo}:${x.titulo}`
          : x.tipo;

type TarjetaDeServicio = Extract<Tarjeta, { tipo: "servicio" }>;

/** Color del rótulo de estado (vivo / piloto / próximamente / hoja de ruta). */
const ESTILO_ESTADO: Record<TarjetaDeServicio["estado"], string> = {
  vivo: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  piloto: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  proximamente: "border-sky-300/40 bg-sky-300/10 text-sky-100",
  "hoja-de-ruta": "border-white/20 bg-white/5 text-foreground/70",
};

/** Módulo del catálogo de servicios: color del área, estado y primera captura. Al tocarla lo muestra en 3D. */
function TarjetaServicio({ tarjeta: x, ejecutar }: { tarjeta: TarjetaDeServicio; ejecutar: (a: Accion) => void }) {
  const { t } = useTextosAsistente();
  return (
    <button
      type="button"
      onClick={() => ejecutar({ tipo: "mostrar_servicio", area: x.area, modulo: x.modulo, foco: x.foco })}
      style={{ "--acento": x.color } as React.CSSProperties}
      className="ars-bloque group relative flex w-full items-stretch gap-3 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#142664]/60 to-[#020a18]/70 p-3 text-left transition-colors hover:border-[var(--acento)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acento)]"
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--acento)]" />
      {x.imagen ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={x.imagen.src}
          alt={x.imagen.alt}
          loading="lazy"
          className="h-16 w-24 shrink-0 rounded-lg border border-white/10 object-cover"
        />
      ) : (
        <span className="grid h-16 w-10 shrink-0 place-items-center rounded-lg bg-[var(--acento)]/15 text-[var(--acento)]">
          <Boxes className="size-4" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--acento)]">
            {t("asistente.tarjeta.servicio")} · {x.nombreArea}
          </span>
          <span
            title={x.notaEstado}
            className={`rounded-full border px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.15em] ${ESTILO_ESTADO[x.estado]}`}
          >
            {t(`asistente.estado.${x.estado}`)}
          </span>
        </span>
        <span className="mt-0.5 block text-sm font-bold text-foreground">{x.nombre}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs text-foreground/60">{x.frase}</span>
      </span>
      <span className="self-center font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--acento)] group-hover:text-white">
        {t("asistente.tarjeta.ver")} →
      </span>
    </button>
  );
}

function TarjetaAnaliticaCompacta({ x, ejecutar }: { x: Extract<Tarjeta, { tipo: "analitica" }>; ejecutar: (a: Accion) => void }) {
  const { t } = useTextosAsistente();
  return (
    <button
      type="button"
      onClick={() => ejecutar({ tipo: "mostrar_analitica", id: x.id })}
      className="ars-bloque group flex w-full items-start gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-[#142664]/60 to-[#020a18]/60 p-3 text-left transition-colors hover:border-[#2348d4]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
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
  );
}

function TarjetaEnlace({ x, ejecutar }: { x: Extract<Tarjeta, { tipo: "enlace" }>; ejecutar: (a: Accion) => void }) {
  return (
    <button
      type="button"
      onClick={() => ejecutar({ tipo: "ir_a", ruta: x.ruta, ancla: x.ancla })}
      className="ars-bloque group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-[#2348d4]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
    >
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-[#9eb0c0]">
          {x.ruta}
          {x.ancla ? `#${x.ancla}` : ""}
        </span>
        <span className="mt-0.5 block text-sm font-bold text-foreground">{x.titulo}</span>
        {x.descripcion && <span className="mt-0.5 line-clamp-2 block text-xs text-foreground/60">{x.descripcion}</span>}
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-[#9fb6ff] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </button>
  );
}

/** Tarjetas enriquecidas bajo un mensaje: analíticas, enlaces, contacto y respuestas rápidas. */
export function Tarjetas({ tarjetas, ejecutar, alEnviar, reciente = false }: Props) {
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
  const resto = unicas.filter((x) => x.tipo !== "sugerencias" && !esTarjetaExtra(x));

  return (
    <>
      <TarjetasExtra tarjetas={unicas} ejecutar={ejecutar} alEnviar={alEnviar} />
      {resto.length > 0 && (
        <ul className="mt-2.5 space-y-2.5" aria-label={t("asistente.sugerencias")}>
          {resto.map((x, i) => (
            <li key={i}>
              {x.tipo === "contacto" ? (
                <FormularioContacto motivo={x.motivo} />
              ) : x.tipo === "analitica" ? (
                x.evidencia ? (
                  <BloqueAnalitica x={x} ejecutar={ejecutar} indice={i} />
                ) : (
                  <TarjetaAnaliticaCompacta x={x} ejecutar={ejecutar} />
                )
              ) : x.tipo === "servicio" ? (
                x.imagen ? <BloqueServicio x={x} ejecutar={ejecutar} indice={i} /> : <TarjetaServicio tarjeta={x} ejecutar={ejecutar} />
              ) : x.tipo === "enlace" ? (
                x.navegado ? (
                  <BloqueNavegacion x={x} ejecutar={ejecutar} indice={i} reciente={reciente} />
                ) : (
                  <TarjetaEnlace x={x} ejecutar={ejecutar} />
                )
              ) : x.tipo === "galeria" ? (
                <BloqueGaleria x={x} ejecutar={ejecutar} indice={i} />
              ) : x.tipo === "grafico" ? (
                <BloqueGrafico x={x} indice={i} />
              ) : x.tipo === "pasos" ? (
                <BloquePasos x={x} ejecutar={ejecutar} indice={i} />
              ) : x.tipo === "antes_despues" ? (
                <BloqueAntesDespues x={x} indice={i} />
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
