"use client";

import { useState } from "react";
import { Calculator, Check, ChevronDown, ClipboardList, Columns3, Copy, ScanSearch } from "lucide-react";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import type {
  Accion,
  Tarjeta,
  TarjetaComparacion,
  TarjetaEstimacion,
  TarjetaHallazgos,
  TarjetaResumenVisita,
} from "@/lib/asistente/tipos";
import { TEXTOS_EXTRA } from "./textos";

export type TarjetaExtra = TarjetaEstimacion | TarjetaComparacion | TarjetaResumenVisita | TarjetaHallazgos;

const TIPOS_EXTRA = new Set<Tarjeta["tipo"]>(["estimacion", "comparacion", "resumen_visita", "hallazgos"]);

/** true para las tarjetas que dibuja este módulo (para filtrarlas del renderer base). */
export function esTarjetaExtra(t: Tarjeta): t is TarjetaExtra {
  return TIPOS_EXTRA.has(t.tipo);
}

type Props = {
  tarjetas: Tarjeta[];
  ejecutar: (a: Accion) => void;
  /** Envía un mensaje como si lo escribiera la persona. Sin ella no se muestran los botones de seguir. */
  alEnviar?: (texto: string) => void;
};

const caja = "rounded-xl border border-white/10 bg-gradient-to-br from-[#142664]/50 to-[#020a18]/70 p-3";
const etiqueta = "font-mono text-[9px] uppercase tracking-[0.25em] text-[#9eb0c0]";
const chip =
  "rounded-full border border-[#2348d4]/45 bg-[#2348d4]/10 px-2.5 py-1 text-left text-[11px] text-[#cdd8ff] transition-colors hover:border-[#2348d4] hover:bg-[#2348d4]/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]";

function useTx() {
  const { idioma } = useTextosAsistente();
  return TEXTOS_EXTRA[idioma === "en" ? "en" : "es"];
}

/**
 * Tarjetas de las herramientas nuevas: estimación, comparación, resumen de
 * visita y hallazgos. Ignora los demás tipos (los dibuja `Tarjetas`).
 */
export function TarjetasExtra({ tarjetas, ejecutar, alEnviar }: Props) {
  const extra = tarjetas.filter(esTarjetaExtra);
  if (!extra.length) return null;
  return (
    <ul className="mt-2 space-y-2">
      {extra.map((t, i) => (
        <li key={`${t.tipo}-${i}`}>
          {t.tipo === "estimacion" ? (
            <Estimacion t={t} ejecutar={ejecutar} alEnviar={alEnviar} />
          ) : t.tipo === "comparacion" ? (
            <Comparacion t={t} ejecutar={ejecutar} />
          ) : t.tipo === "resumen_visita" ? (
            <ResumenVisita t={t} />
          ) : (
            <Hallazgos t={t} ejecutar={ejecutar} />
          )}
        </li>
      ))}
    </ul>
  );
}

function Encabezado({ icono: Icono, texto, extra }: { icono: typeof Calculator; texto: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#2348d4]/25 text-[#9fb6ff]">
        <Icono className="size-3.5" aria-hidden="true" />
      </span>
      <span className={`${etiqueta} min-w-0 truncate`}>{texto}</span>
      {extra && <span className="ml-auto shrink-0 whitespace-nowrap">{extra}</span>}
    </div>
  );
}

function Estimacion({ t, ejecutar, alEnviar }: { t: TarjetaEstimacion; ejecutar: Props["ejecutar"]; alEnviar?: Props["alEnviar"] }) {
  const tx = useTx();
  const [supuestos, setSupuestos] = useState(false);
  return (
    <section className={caja} aria-label={t.titulo}>
      <Encabezado
        icono={Calculator}
        texto={tx.estimacion}
        extra={
          <span className="rounded-full bg-[#2348d4]/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#cdd8ff]">
            {tx.nivel[t.nivel]}
          </span>
        }
      />
      <h3 className="mt-2 text-sm font-bold text-foreground">{t.titulo}</h3>
      <p className="mt-0.5 text-xs text-foreground/70">{t.resumen}</p>

      <p className={`${etiqueta} mt-3`}>{tx.unidades}</p>
      <dl className="mt-1 grid grid-cols-2 gap-1.5">
        {t.unidades.map((u) => (
          <div key={u.concepto} className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5">
            <dt className="text-[10px] leading-tight text-foreground/55">{u.concepto}</dt>
            <dd className="text-xs font-semibold text-foreground">{u.cantidad}</dd>
          </div>
        ))}
      </dl>

      {t.analiticas.length > 0 && (
        <>
          <p className={`${etiqueta} mt-3`}>{tx.analiticas}</p>
          <ul className="mt-1 space-y-1">
            {t.analiticas.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => ejecutar({ tipo: "mostrar_analitica", id: a.id })}
                  className="flex w-full items-baseline gap-2 rounded-md px-1.5 py-1 text-left text-xs hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
                >
                  <span className="font-semibold text-foreground">{a.nombre}</span>
                  <span className="truncate text-[11px] text-foreground/50">{a.motivo}</span>
                  <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-[#9fb6ff]">{tx.ver} →</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className={`${etiqueta} mt-3`}>{tx.modulos}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {t.modulos.map((m) => (
          <button key={m.id} type="button" className={chip} onClick={() => ejecutar({ tipo: "ir_a", ruta: "/plataforma", ancla: `feature-${m.id}` })}>
            {m.titulo}
          </button>
        ))}
      </div>

      <p className={`${etiqueta} mt-3`}>{tx.etapas}</p>
      <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-xs text-foreground/75">
        {t.etapas.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ol>

      <p className={`${etiqueta} mt-3`}>{tx.indicadores}</p>
      <p className="mt-1 text-xs text-foreground/75">{t.indicadores.join(" · ")}</p>

      <button
        type="button"
        onClick={() => setSupuestos((v) => !v)}
        aria-expanded={supuestos}
        className={`${etiqueta} mt-3 flex items-center gap-1 hover:text-foreground`}
      >
        {tx.supuestos}
        <ChevronDown className={`size-3 transition-transform ${supuestos ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {supuestos && (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[11px] text-foreground/60">
          {t.supuestos.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}

      <p className="mt-3 border-t border-white/10 pt-2 text-[11px] italic text-foreground/55">{t.aviso}</p>
      {alEnviar && (
        <button
          type="button"
          onClick={() => alEnviar(tx.mensajePasar)}
          className="mt-2 w-full rounded-lg bg-[#2348d4] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#2f57ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {tx.pasarEquipo}
        </button>
      )}
    </section>
  );
}

function Comparacion({ t, ejecutar }: { t: TarjetaComparacion; ejecutar: Props["ejecutar"] }) {
  const tx = useTx();
  return (
    <section className={caja} aria-label={t.titulo}>
      <Encabezado icono={Columns3} texto={tx.comparacion} />
      <div className="mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label={t.titulo}>
        <table className="w-full min-w-max border-collapse text-left text-[11px]">
          <caption className="sr-only">{t.titulo}</caption>
          <thead>
            <tr>
              <th scope="col" className="sr-only">
                {tx.criterio}
              </th>
              {t.columnas.map((c) => (
                <th key={c.id} scope="col" className="w-40 max-w-40 px-1.5 pb-2 align-bottom">
                  <button
                    type="button"
                    onClick={() => ejecutar({ tipo: "mostrar_analitica", id: c.id })}
                    className="text-left text-xs font-bold text-foreground underline-offset-2 hover:text-[#cdd8ff] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
                  >
                    {c.nombre}
                  </button>
                  <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-[#9eb0c0]">{c.familia}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.filas.map((f) => (
              <tr key={f.criterio} className="border-t border-white/10">
                <th scope="row" className="w-20 py-1.5 pr-1.5 align-top font-mono text-[8px] font-normal uppercase tracking-[0.18em] text-[#9eb0c0]">
                  {f.criterio}
                </th>
                {f.valores.map((v, i) => (
                  <td key={i} className="w-40 max-w-40 whitespace-normal px-1.5 py-1.5 align-top text-foreground/75">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {t.nota && <p className="mt-2 border-t border-white/10 pt-2 text-xs text-foreground/80">{t.nota}</p>}
    </section>
  );
}

function ResumenVisita({ t }: { t: TarjetaResumenVisita }) {
  const tx = useTx();
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(t.motivo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* sin permiso de portapapeles: no pasa nada */
    }
  }
  const colorEtapa =
    t.etapa === "listo" ? "bg-emerald-400/15 text-emerald-200" : t.etapa === "evaluando" ? "bg-[#2348d4]/25 text-[#cdd8ff]" : "bg-white/10 text-foreground/70";
  return (
    <section className={caja} aria-label={tx.resumen}>
      <Encabezado
        icono={ClipboardList}
        texto={tx.resumen}
        extra={<span className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] ${colorEtapa}`}>{tx.etapa[t.etapa]}</span>}
      />
      <dl className="mt-2 space-y-1 text-xs">
        {t.campos.map((c) => (
          <div key={c.etiqueta} className="grid grid-cols-[7.5rem_1fr] gap-2">
            <dt className="text-foreground/50">{c.etiqueta}</dt>
            <dd className="text-foreground/85">{c.valor}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[7.5rem_1fr] gap-2">
          <dt className="text-foreground/50">{tx.siguiente}</dt>
          <dd className="font-semibold text-foreground">{t.siguientePaso}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] text-foreground/55">{tx.resumenNota}</p>
      <button
        type="button"
        onClick={copiar}
        className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9fb6ff] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2348d4]"
      >
        {copiado ? <Check className="size-3" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
        <span aria-live="polite">{copiado ? tx.copiado : tx.copiar}</span>
      </button>
    </section>
  );
}

const PUNTO = { alta: "bg-red-400", media: "bg-amber-300", baja: "bg-sky-300" } as const;

function Hallazgos({ t, ejecutar }: { t: TarjetaHallazgos; ejecutar: Props["ejecutar"] }) {
  const tx = useTx();
  return (
    <section className={caja} aria-label={`${tx.hallazgos}: ${t.fuente}`}>
      <Encabezado icono={ScanSearch} texto={tx.hallazgos} />
      <p className="mt-1 text-xs font-semibold text-foreground">{t.fuente}</p>
      <ul className="mt-2 space-y-1.5">
        {t.items.map((h, i) => (
          <li key={i} className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.03] p-2">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${PUNTO[h.prioridad]}`} aria-hidden="true" />
            <span className="min-w-0 flex-1 text-xs">
              <span className="block text-foreground/85">
                {h.momento && <span className="mr-1.5 font-mono text-[10px] text-[#9eb0c0]">{h.momento}</span>}
                {h.observacion}
              </span>
              <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/45">
                {tx.prioridad[h.prioridad]}
              </span>
            </span>
            <button type="button" className={`${chip} shrink-0`} onClick={() => ejecutar({ tipo: "mostrar_analitica", id: h.analiticaId })}>
              {h.analitica} →
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
