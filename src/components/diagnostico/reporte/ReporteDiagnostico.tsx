"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Download, Loader2, Mail, Printer, Share2, Signal, Wifi } from "lucide-react";
import type { Diagnostico, ItemReporte } from "@/data/diagnostico/tipos";
import { Icono } from "@/components/servicios/ui";
import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";
import {
  colorArea,
  fechaLarga,
  mapaAreas,
  nombreArchivo,
  nombreArea,
  PRIORIDAD_TEXTO,
  recomendacionesOrdenadas,
  resumenTexto,
  TAMANO_TEXTO,
} from "./datos";
import { Cronograma, Estimado, GraficoMetricas, MedidorMadurez } from "./Graficos";

type Props = { diagnostico: Diagnostico };

/** Vista previa del informe del Diagnóstico ARS + descarga en PDF, compartir e imprimir. */
export function ReporteDiagnostico({ diagnostico: d }: Props) {
  return (
    <div className="relative bg-[#020a18] text-white [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      <BarraAcciones diagnostico={d} />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-20 pt-6 md:space-y-8 md:px-8 md:pt-10">
        <Portada diagnostico={d} />
        <ResumenEjecutivo diagnostico={d} />
        <Hallazgos diagnostico={d} />
        <MapaAreas diagnostico={d} />
        <Seccion numero="04" eyebrow="Cifras antes y después" titulo="Lo que cambia en números">
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-white/70">
            Cada indicador tiene su propia escala. Son estimaciones ilustrativas a partir de lo que nos contó; las afinamos con datos reales en
            la primera semana.
          </p>
          <GraficoMetricas metricas={d.metricas} />
        </Seccion>
        <Seccion numero="05" eyebrow="Plan por fases" titulo="Cómo llegamos, paso a paso">
          <Cronograma diagnostico={d} />
        </Seccion>
        <ReporteQueLlegaria diagnostico={d} />
        <Cierre diagnostico={d} />
      </div>
    </div>
  );
}

/* ───────────────────────── Barra de acciones ───────────────────────── */

function BarraAcciones({ diagnostico: d }: Props) {
  const [estadoPdf, setEstadoPdf] = useState<"listo" | "generando" | "error">("listo");
  const [aviso, setAviso] = useState<string | null>(null);

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(null), 2600);
  };

  const descargar = async () => {
    if (estadoPdf === "generando") return;
    setEstadoPdf("generando");
    try {
      const { generarPdf } = await import("./DocumentoPdf");
      const blob = await generarPdf(d, window.location.origin);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo(d.perfil.nombre);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setEstadoPdf("listo");
      avisar("PDF descargado");
    } catch (e) {
      console.error("No se pudo generar el PDF", e);
      setEstadoPdf("error");
      avisar("No pudimos generar el PDF. Intente de nuevo.");
    }
  };

  const compartir = async () => {
    const texto = resumenTexto(d);
    const titulo = `Diagnóstico ARS · ${d.perfil.nombre}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: titulo, text: texto, url: window.location.href });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(texto);
      avisar("Resumen copiado al portapapeles");
    } catch {
      avisar("No se pudo copiar el resumen");
    }
  };

  const boton =
    "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:border-[#6b8aff] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6b8aff] md:px-4";

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-[#020a18]/85 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Image src="/images/logos/icono-blanco.png" alt="" width={28} height={28} className="size-7 shrink-0 object-contain" />
          <div className="hidden min-w-0 sm:block">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#9eb0c0]">Diagnóstico ARS</div>
            <div className="truncate text-sm font-bold">{d.perfil.nombre}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={compartir} className={boton} aria-label="Compartir el resumen">
            <Share2 className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
          <button type="button" onClick={() => window.print()} className={boton} aria-label="Imprimir">
            <Printer className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
          <button
            type="button"
            onClick={descargar}
            disabled={estadoPdf === "generando"}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#142664] transition-colors hover:bg-[#d5e0ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b8aff] disabled:cursor-wait disabled:opacity-80"
          >
            {estadoPdf === "generando" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
            {estadoPdf === "generando" ? "Generando…" : "Descargar PDF"}
          </button>
        </div>
      </div>
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-full flex justify-center">
        {aviso && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#0b1a3a] px-4 py-2 text-xs text-white shadow-xl">
            <Check className="size-3.5 text-[#35e0a1]" aria-hidden="true" />
            {aviso}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Piezas comunes ───────────────────────── */

function Seccion({
  numero,
  eyebrow,
  titulo,
  children,
  className,
}: {
  numero: string;
  eyebrow: string;
  titulo: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("break-inside-avoid rounded-3xl border border-white/10 bg-[#061229] p-5 sm:p-7 md:p-10", className)}>
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#9eb0c0] md:text-[11px]">
        <span className="text-[#6b8aff]">{numero}</span>
        <span className="h-px w-6 bg-white/20" aria-hidden="true" />
        {eyebrow}
      </div>
      <h2 className="mt-3 text-balance text-2xl font-black leading-tight tracking-tight md:text-[34px]">{titulo}</h2>
      <div className="mt-6 md:mt-8">{children}</div>
    </section>
  );
}

function ChipArea({ id }: { id: Parameters<typeof colorArea>[0] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/80">
      <span className="size-1.5 rounded-full" style={{ background: colorArea(id) }} aria-hidden="true" />
      {nombreArea(id)}
    </span>
  );
}

/* ───────────────────────── Portada ───────────────────────── */

function Portada({ diagnostico: d }: Props) {
  const p = d.perfil;
  const meta = [
    { k: "Sector", v: p.sector },
    p.ciudad ? { k: "Ciudad", v: p.ciudad } : null,
    { k: "Tamaño", v: TAMANO_TEXTO[p.tamano] },
    p.sedes ? { k: "Sedes", v: String(p.sedes) } : null,
  ].filter((x): x is { k: string; v: string } => x !== null);

  return (
    <header className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-[#0a1a45] px-6 py-10 sm:px-10 md:px-14 md:py-16">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_100%_0%,#2348d4_0%,transparent_60%),radial-gradient(70%_70%_at_0%_100%,#142664_0%,transparent_70%)] opacity-90" />
        <div className="grid-bg absolute inset-0 opacity-20" />
        <svg className="absolute -right-24 -top-24 size-[420px] opacity-25" viewBox="0 0 200 200" fill="none">
          {[90, 70, 50, 30].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} stroke="#9eb0c0" strokeWidth="0.6" strokeDasharray="2 4" />
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Image src="/images/logos/horizontal-blanco.png" alt="ARS Intelligence" width={1672} height={941} className="-my-3 -ml-3 h-16 w-auto md:-my-4 md:h-20" priority />
        <div className="flex items-center gap-2">
          {d.fuente === "demo" && (
            <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/70">Ejemplo ilustrativo</span>
          )}
          <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/85">{fechaLarga(d.fecha)}</span>
        </div>
      </div>

      <div className="mt-14 md:mt-20">
        <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#9eb0c0]">Diagnóstico de operación digital</div>
        <h1 className="mt-4 text-balance text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl md:text-7xl">{p.nombre}</h1>
        <p className="mt-6 max-w-3xl text-balance font-serif text-xl italic leading-snug text-white/90 md:text-[28px]">{d.titular}</p>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/15 pt-6 md:mt-16 md:grid-cols-4">
        {meta.map((m) => (
          <div key={m.k}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/55">{m.k}</dt>
            <dd className="mt-1 text-[15px] font-bold">{m.v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-sm text-white/70">
        Preparado por <span className="font-bold text-white">ARS Intelligence</span> para el equipo directivo de {p.nombre}.
      </p>
    </header>
  );
}

/* ───────────────────────── 01 · Resumen ejecutivo + madurez ───────────────────────── */

function ResumenEjecutivo({ diagnostico: d }: Props) {
  const p = d.perfil;
  const grupos = [
    { titulo: "Lo que duele hoy", items: p.dolores },
    { titulo: "Con qué trabajan", items: p.herramientasActuales },
    { titulo: "Lo que más importa", items: p.prioridades },
  ].filter((g) => g.items.length);

  return (
    <Seccion numero="01" eyebrow="Resumen ejecutivo" titulo="En una mirada">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
        <div>
          <p className="text-[17px] leading-relaxed text-white/90 md:text-lg">{d.resumen}</p>
          <div className="mt-8 space-y-5">
            {grupos.map((g) => (
              <div key={g.titulo}>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">{g.titulo}</div>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {g.items.map((it) => (
                    <li key={it} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/85 first-letter:uppercase">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {p.notas && <p className="mt-6 border-l-2 border-[#6b8aff] pl-4 text-sm italic text-white/70">«{p.notas}»</p>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d1f4d] to-[#071433] p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-bold">Madurez digital</h3>
            <Estimado />
          </div>
          <p className="mt-1 text-xs text-white/55">Índice de 0 a 100: registro, trazabilidad, integración y automatización.</p>
          <div className="mt-6">
            <MedidorMadurez hoy={d.madurez.hoy} conArs={d.madurez.conArs} />
          </div>
          <p className="mt-5 text-center text-sm text-white/80">
            <span className="font-bold text-white">+{Math.max(0, d.madurez.conArs - d.madurez.hoy)} puntos</span> al completar el plan.
          </p>
        </div>
      </div>
    </Seccion>
  );
}

/* ───────────────────────── 02 · Hallazgos ───────────────────────── */

function Hallazgos({ diagnostico: d }: Props) {
  return (
    <Seccion numero="02" eyebrow="Hallazgos" titulo="Lo que encontramos">
      <ol className="grid gap-4 md:grid-cols-3">
        {d.hallazgos.map((h, i) => (
          <li key={h.titulo} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm font-bold text-[#6b8aff]">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-lg font-black leading-tight">{h.titulo}</h3>
            </div>
            <div className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.25em] text-white/45">Hoy</div>
            <p className="mt-1 text-sm leading-relaxed text-white/85">{h.hoy}</p>
            <div className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.25em] text-white/45">Impacto</div>
            <p className="mt-1 text-sm leading-relaxed text-white/85">{h.impacto}</p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
              {h.areas.map((a) => (
                <ChipArea key={a} id={a} />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Seccion>
  );
}

/* ───────────────────────── 03 · Mapa de las 11 áreas ───────────────────────── */

const ESTILO_PRIORIDAD = {
  alta: "bg-white text-[#020a18]",
  media: "border border-white/60 text-white",
  baja: "border border-white/20 text-white/70",
} as const;

function MapaAreas({ diagnostico: d }: Props) {
  const mapa = mapaAreas(d);
  const recs = recomendacionesOrdenadas(d);
  return (
    <Seccion numero="03" eyebrow="Mapa de las 11 áreas" titulo="Dónde actuar primero">
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-white/70">
        ARS cubre once áreas de la operación. Encendimos las {recs.length} que más impacto tienen para {d.perfil.nombre}; las demás quedan
        listas para cuando las necesite.
      </p>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {mapa.map(({ area, rec }) => (
          <li
            key={area.id}
            className={cn(
              "relative flex min-h-[132px] flex-col rounded-2xl border p-3.5 transition-colors",
              rec ? "bg-white/[0.05]" : "border-white/[0.07] bg-transparent opacity-55"
            )}
            style={rec ? { borderColor: `${area.color}99`, boxShadow: `inset 0 0 40px ${area.color}1f, 0 0 24px ${area.color}14` } : undefined}
          >
            <div className="flex items-center justify-between">
              <span
                className="grid size-9 place-items-center rounded-xl"
                style={{ background: rec ? `${area.color}26` : "rgba(255,255,255,0.04)", color: rec ? area.color : "#9eb0c0" }}
              >
                <Icono nombre={area.icono} className="size-[18px]" />
              </span>
              <span className="font-mono text-[11px] font-bold text-white/40">{area.letra}</span>
            </div>
            <div className="mt-3 text-[13px] font-bold leading-tight">{area.nombre}</div>
            {rec ? (
              <div className="mt-auto pt-3">
                <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-bold", ESTILO_PRIORIDAD[rec.rec.prioridad])}>
                  {PRIORIDAD_TEXTO[rec.rec.prioridad]}
                </span>
              </div>
            ) : (
              <div className="mt-auto pt-3 text-[10.5px] text-white/50">Disponible más adelante</div>
            )}
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-lg font-black">Recomendaciones</h3>
      <ol className="mt-4 space-y-3">
        {recs.map(({ area, rec, modulos }) => (
          <li key={area.id} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-[220px_1fr] md:gap-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: `${area.color}26`, color: area.color }}>
                  <Icono nombre={area.icono} className="size-5" />
                </span>
                <div>
                  <div className="text-[15px] font-black leading-tight">{area.nombre}</div>
                  <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold", ESTILO_PRIORIDAD[rec.prioridad])}>
                    {PRIORIDAD_TEXTO[rec.prioridad]}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm leading-relaxed text-white/80">
                <span className="font-bold text-white">Por qué: </span>
                {rec.porque}
              </p>
              <p className="mt-2 flex gap-2 text-sm leading-relaxed text-white">
                <ArrowRight className="mt-0.5 size-4 shrink-0" style={{ color: area.color }} aria-hidden="true" />
                {rec.cambio}
              </p>
              {modulos.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {modulos.map((m) => (
                    <li key={m.id} className="rounded-xl border border-white/[0.08] bg-[#020a18]/60 px-3 py-2.5">
                      <div className="text-[13px] font-bold">{m.nombre}</div>
                      <div className="mt-0.5 text-xs leading-snug text-white/60">{m.frase}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Seccion>
  );
}

/* ───────────────────────── 06 · El reporte que le llegaría ───────────────────────── */

function ReporteQueLlegaria({ diagnostico: d }: Props) {
  const r = d.reporteDiario;
  return (
    <Seccion numero="06" eyebrow="El reporte que le llegaría" titulo="Cada mañana, la operación en su teléfono">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4 text-[15px] leading-relaxed text-white/80">
          <p>
            Sin pedirlo y sin armar nada: a las <span className="font-bold text-white">{r.hora}</span> le llega un resumen con lo que pasó en la
            operación, lo que va bien y lo que necesita su atención.
          </p>
          <p>Así se vería el de {d.perfil.nombre} con el plan en marcha. Lo recibe por correo, en la aplicación o por Telegram.</p>
          <ul className="space-y-2 pt-2 text-sm">
            {["Datos que salen del trabajo real, no de planillas", "Alertas solo cuando hay algo que decidir", "El mismo informe puede ir a sus clientes"].map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[#6b8aff]" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Maqueta de teléfono */}
        <div className="mx-auto w-full max-w-[320px]">
          <div className="rounded-[44px] border border-white/15 bg-gradient-to-b from-[#1b2a4d] to-[#0b1530] p-2.5 shadow-[0_30px_80px_-20px_rgba(35,72,212,0.55)]">
            <div className="overflow-hidden rounded-[36px] bg-[#f4f6fb] text-[#0b1530]">
              <div className="flex items-center justify-between bg-white px-6 pb-2 pt-3 text-[11px] font-bold">
                <span>{r.hora.replace(/\s?a\.\s?m\.|\s?p\.\s?m\./, "")}</span>
                <span className="h-5 w-20 rounded-full bg-[#0b1530]" aria-hidden="true" />
                <span className="flex items-center gap-1" aria-hidden="true">
                  <Signal className="size-3" />
                  <Wifi className="size-3" />
                </span>
              </div>
              <div className="flex items-center gap-2 border-b border-[#e3e8f2] bg-white px-4 py-3">
                <Mail className="size-4 text-[#2348d4]" aria-hidden="true" />
                <span className="text-[12px] font-bold">Bandeja de entrada</span>
              </div>
              <div className="space-y-3 p-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-full bg-[#142664]">
                      <Image src="/images/logos/icono-blanco.png" alt="" width={18} height={18} className="size-[18px] object-contain" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12px] font-black">ARS Intelligence</span>
                        <span className="shrink-0 text-[10px] text-[#5b6b85]">{r.hora}</span>
                      </div>
                      <div className="truncate text-[11px] text-[#5b6b85]">Reporte automático</div>
                    </div>
                  </div>
                  <div className="mt-3 text-[13.5px] font-black leading-snug">{r.titulo}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {r.items.map((it) => (
                      <div key={it.etiqueta} className="rounded-xl bg-[#f1f4fa] px-2.5 py-2">
                        <div className="text-[10px] leading-tight text-[#5b6b85]">{it.etiqueta}</div>
                        <div className="mt-0.5 flex items-baseline justify-between gap-1">
                          <span className="text-[15px] font-black tabular-nums">{it.valor}</span>
                          <TendenciaClara item={it} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {r.destacados.length > 0 && (
                    <div className="mt-3 border-t border-[#e3e8f2] pt-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5b6b85]">Destacados</div>
                      <ul className="mt-1.5 space-y-1.5">
                        {r.destacados.map((t) => (
                          <li key={t} className="flex gap-1.5 text-[11px] leading-snug text-[#26324a]">
                            <span className="mt-[5px] size-1.5 shrink-0 rounded-full bg-[#2348d4]" aria-hidden="true" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mx-auto h-1 w-24 rounded-full bg-[#0b1530]/80" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Seccion>
  );
}

/** Versión para fondo claro (dentro del teléfono): colores de estado más oscuros para contraste. */
function TendenciaClara({ item }: { item: ItemReporte }) {
  if (!item.tendencia) return null;
  const color = item.bueno === undefined ? "#5b6b85" : item.bueno ? "#0f8a5f" : "#c2410c";
  const Icon = item.tendencia === "sube" ? ArrowUpRight : item.tendencia === "baja" ? ArrowDownRight : ArrowRight;
  const texto = item.tendencia === "sube" ? "Sube" : item.tendencia === "baja" ? "Baja" : "Igual";
  return (
    <span className="inline-flex shrink-0 items-center text-[9.5px] font-bold" style={{ color }}>
      <Icon className="size-3" aria-hidden="true" />
      {texto}
      {item.bueno !== undefined && <span className="sr-only">{item.bueno ? " (buena noticia)" : " (requiere atención)"}</span>}
    </span>
  );
}

/* ───────────────────────── Cierre ───────────────────────── */

function Cierre({ diagnostico: d }: Props) {
  const mensaje = `Hola, soy de ${d.perfil.nombre}. Acabo de hacer el Diagnóstico ARS y quiero conversar sobre el plan.`;
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-[#0a1a45] px-6 py-12 text-center md:px-14 md:py-16">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(70%_90%_at_15%_10%,rgba(35,72,212,0.55),transparent_60%),radial-gradient(60%_70%_at_100%_100%,rgba(20,38,100,0.9),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/70">Siguiente paso</div>
      <h2 className="mx-auto mt-5 max-w-3xl text-balance text-3xl font-black leading-[1.05] tracking-tight md:text-5xl">
        Convirtamos este diagnóstico en su primera mejora visible
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/80 md:text-base">
        En una llamada de 30 minutos revisamos el plan con su equipo, ajustamos las cifras con datos reales y dejamos lista la Fase 1.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <a
          href={whatsappUrl(mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-black text-[#142664] transition-colors hover:bg-[#d5e0ff]"
        >
          Agendar por WhatsApp
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
        <a
          href={mailtoUrl(`Diagnóstico ARS · ${d.perfil.nombre}`)}
          className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          <Mail className="size-4" aria-hidden="true" />
          Escribir por correo
        </a>
      </div>
      <p className="mt-10 text-xs text-white/50">
        Diagnóstico generado el {fechaLarga(d.fecha)}. Cifras estimadas e ilustrativas; no constituyen una oferta comercial.
      </p>
    </section>
  );
}
