"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, CornerDownLeft } from "lucide-react";
import type { Respuestas } from "@/data/propuesta/tipos";
import { cn } from "@/lib/utils";
import { SIN_CONTORNO } from "./util";
import { CampoTexto, Casilla, ChipsMultiples, ChipsUnicos } from "./Campos";
import { APPS_CON_ERP, BLOQUES, CENTRAL, OPCIONES, PANTALLAS, RANGOS, validar, type PantallaId } from "./guion";
import { PanelVivo } from "./PanelVivo";

type Errores = Partial<Record<keyof Respuestas, string>>;

export function Entrevista({
  respuestas: r,
  paso,
  onCambio,
  onPaso,
  onTerminar,
  onSalir,
}: {
  respuestas: Respuestas;
  paso: number;
  onCambio: (p: Partial<Respuestas>) => void;
  onPaso: (n: number) => void;
  onTerminar: () => void;
  onSalir: () => void;
}) {
  const pantalla = PANTALLAS[Math.min(paso, PANTALLAS.length - 1)];
  const [errores, setErrores] = useState<Errores>({});
  const [intentado, setIntentado] = useState<PantallaId | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Al cambiar de pantalla: foco al primer campo de texto (Enter avanza) o, si son chips, al título.
  useEffect(() => {
    const campo = formRef.current?.querySelector<HTMLElement>("input, textarea");
    const destino = campo && !campo.closest("fieldset") ? campo : tituloRef.current;
    destino?.focus({ preventScroll: true });
    const seccion = tituloRef.current?.closest("section");
    if (seccion && seccion.getBoundingClientRect().top < 0) seccion.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [paso]);

  const erroresVisibles = intentado === pantalla.id ? errores : {};

  const cambiar = (p: Partial<Respuestas>) => {
    onCambio(p);
    if (intentado === pantalla.id) setErrores(validar(pantalla.id, { ...r, ...p }));
  };

  const siguiente = (e?: FormEvent) => {
    e?.preventDefault();
    const errs = validar(pantalla.id, r);
    if (Object.keys(errs).length) {
      setErrores(errs);
      setIntentado(pantalla.id);
      requestAnimationFrame(() => {
        const invalido = formRef.current?.querySelector<HTMLElement>("[aria-invalid=true], fieldset[aria-describedby] input");
        invalido?.focus();
      });
      return;
    }
    setIntentado(null);
    setErrores({});
    if (paso >= PANTALLAS.length - 1) onTerminar();
    else onPaso(paso + 1);
  };

  const atras = () => {
    setIntentado(null);
    if (paso === 0) onSalir();
    else onPaso(paso - 1);
  };

  // Enter avanza desde cualquier parte de la pantalla (chips, título…); en un textarea, Ctrl/⌘+Enter.
  // Los botones y los campos de texto conservan su comportamiento nativo (el texto ya envía el formulario).
  const teclas = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter" || e.defaultPrevented) return;
    const t = e.target as HTMLElement;
    if (t instanceof HTMLButtonElement || t instanceof HTMLAnchorElement) return;
    if (t instanceof HTMLTextAreaElement && !(e.ctrlKey || e.metaKey)) return;
    if (t instanceof HTMLInputElement && t.type !== "checkbox" && t.type !== "radio") return;
    e.preventDefault();
    siguiente();
  };

  const bloqueActual = BLOQUES.findIndex((b) => b.id === pantalla.bloque);
  const pct = Math.round((paso / PANTALLAS.length) * 100);
  const ultimo = paso >= PANTALLAS.length - 1;

  return (
    <div className="grid gap-5 @4xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] @4xl:gap-8">
      <section aria-labelledby="propuesta-pregunta" className="border border-white/15 bg-[#020a18]/55 p-4 backdrop-blur sm:p-6 md:p-8">
        {/* Progreso por bloque */}
        <ol className="grid grid-cols-5 gap-1.5" aria-label="Avance de la entrevista">
          {BLOQUES.map((b, i) => {
            const delBloque = PANTALLAS.map((p, k) => ({ p, k })).filter(({ p }) => p.bloque === b.id);
            const hechas = delBloque.filter(({ k }) => k < paso).length;
            const llenado = i < bloqueActual ? 1 : i > bloqueActual ? 0 : (hechas + 0.35) / delBloque.length;
            return (
              <li key={b.id} aria-current={i === bloqueActual ? "step" : undefined}>
                <div className="h-1 bg-white/10">
                  <div className="h-full bg-[#6b8aff] transition-[width] duration-500 ease-out" style={{ width: `${llenado * 100}%` }} />
                </div>
                <span className="sr-only">
                  {b.titulo}: {i < bloqueActual ? "completo" : i === bloqueActual ? "en curso" : "pendiente"}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#6b8aff]">
          {bloqueActual + 1} de 5 · {BLOQUES[bloqueActual].titulo}
        </p>

        <form ref={formRef} onSubmit={siguiente} onKeyDown={teclas} noValidate className="mt-3">
          <div key={pantalla.id} className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-safe:duration-500">
            <h3 id="propuesta-pregunta" ref={tituloRef} tabIndex={-1} style={SIN_CONTORNO} className="font-heading text-2xl font-black leading-tight text-white outline-none md:text-3xl">
              {pantalla.id === "empresa" && r.nombre.trim() ? `Mucho gusto, ${r.nombre.trim().split(" ")[0]}. ${pantalla.titulo}` : pantalla.titulo}
            </h3>
            {pantalla.ayuda && <p className="mt-2 text-[14px] leading-relaxed text-[#c5d2ee]/80">{pantalla.ayuda}</p>}
            <div className="mt-6 space-y-5">
              <CamposPantalla id={pantalla.id} r={r} cambiar={cambiar} e={erroresVisibles} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={atras}
              className="inline-flex min-h-11 items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/65 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> Atrás
            </button>
            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 sm:inline-flex" aria-hidden="true">
                Enter <CornerDownLeft className="size-3" />
              </span>
              <button
                type="submit"
                className="bevel-btn inline-flex min-h-11 items-center gap-3 bg-[#d5e0ff] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#020a18] transition-colors hover:bg-white"
              >
                {ultimo ? "Armar mi propuesta" : "Siguiente"} <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>
      </section>

      <PanelVivo respuestas={r} pct={pct} />
    </div>
  );
}

function CamposPantalla({ id, r, cambiar, e }: { id: PantallaId; r: Respuestas; cambiar: (p: Partial<Respuestas>) => void; e: Errores }) {
  switch (id) {
    case "persona":
      return (
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto etiqueta="Su nombre" valor={r.nombre} onCambio={(v) => cambiar({ nombre: v })} error={e.nombre} autoComplete="name" autoFocus />
          <CampoTexto etiqueta="Su cargo" valor={r.cargo} onCambio={(v) => cambiar({ cargo: v })} autoComplete="organization-title" placeholder="Gerente de operaciones…" opcional />
        </div>
      );
    case "empresa":
      return (
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto etiqueta="Empresa" valor={r.empresa} onCambio={(v) => cambiar({ empresa: v })} error={e.empresa} autoComplete="organization" autoFocus />
          <CampoTexto etiqueta="Ciudad principal" valor={r.ciudad} onCambio={(v) => cambiar({ ciudad: v })} autoComplete="address-level2" placeholder="Bogotá, Medellín, Cali…" opcional />
        </div>
      );
    case "tamano":
      return (
        <>
          <ChipsUnicos etiqueta="Número de vigilantes" opciones={RANGOS} valor={r.vigilantes} onCambio={(v) => cambiar({ vigilantes: v })} error={e.vigilantes} />
          <div className="max-w-xs">
            <CampoTexto etiqueta="Sedes o puestos (aprox.)" valor={r.sedes} onCambio={(v) => cambiar({ sedes: v.replace(/[^\d.,+ -]/g, "") })} inputMode="numeric" placeholder="Ej. 40" opcional />
          </div>
        </>
      );
    case "servicios":
      return <ChipsMultiples etiqueta="Servicios" opciones={OPCIONES.servicios} valor={r.servicios} onCambio={(v) => cambiar({ servicios: v })} error={e.servicios} />;
    case "central":
      return <ChipsUnicos etiqueta="Central de monitoreo" opciones={CENTRAL} valor={r.central} onCambio={(v) => cambiar({ central: v })} error={e.central} />;
    case "aplicaciones": {
      const conErp = r.aplicaciones.some((a) => APPS_CON_ERP.includes(a));
      return (
        <>
          <ChipsMultiples etiqueta="Aplicaciones y herramientas" opciones={OPCIONES.aplicaciones} valor={r.aplicaciones} onCambio={(v) => cambiar({ aplicaciones: v })} error={e.aplicaciones} />
          <div className={cn("max-w-md transition-opacity", conErp ? "opacity-100" : "hidden")}>
            <CampoTexto etiqueta="¿Cuál sistema administrativo o contable?" valor={r.erp} onCambio={(v) => cambiar({ erp: v })} placeholder="Ej.: software contable, sistema propio…" opcional />
          </div>
        </>
      );
    }
    case "datos":
      return <ChipsMultiples etiqueta="Dónde están sus datos" opciones={OPCIONES.datos} valor={r.datos} onCambio={(v) => cambiar({ datos: v })} tint="#5fd8ff" />;
    case "integraciones":
      return (
        <CampoTexto
          etiqueta="Integraciones que le importan"
          valor={r.integraciones}
          onCambio={(v) => cambiar({ integraciones: v })}
          multilinea
          opcional
          autoFocus
          placeholder="Que los turnos alimenten la nómina, que el cliente vea sus informes…"
        />
      );
    case "dolores":
      return <ChipsMultiples etiqueta="Lo que más le duele" opciones={OPCIONES.dolores} valor={r.dolores} onCambio={(v) => cambiar({ dolores: v })} error={e.dolores} tint="#ff8fb1" />;
    case "reportes":
      return <ChipsMultiples etiqueta="Reportes" opciones={OPCIONES.reportes} valor={r.reportes} onCambio={(v) => cambiar({ reportes: v })} tint="#35e0a1" />;
    case "plazo":
      return (
        <>
          <ChipsUnicos
            etiqueta="Plazo"
            opciones={OPCIONES.plazo.map((p) => ({ valor: p, etiqueta: p }))}
            valor={r.plazo}
            onCambio={(v) => cambiar({ plazo: v })}
          />
          <CampoTexto etiqueta="¿Algo más que debamos saber?" valor={r.notas} onCambio={(v) => cambiar({ notas: v })} multilinea opcional />
        </>
      );
    case "contacto":
      return (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto etiqueta="Correo corporativo" tipo="email" inputMode="email" valor={r.email} onCambio={(v) => cambiar({ email: v })} error={e.email} autoComplete="email" autoFocus />
            <CampoTexto etiqueta="Teléfono / WhatsApp" tipo="tel" inputMode="tel" valor={r.telefono} onCambio={(v) => cambiar({ telefono: v })} error={e.telefono} autoComplete="tel" opcional />
          </div>
          <Casilla marcado={r.autoriza} onCambio={(v) => cambiar({ autoriza: v })} error={e.autoriza}>
            Autorizo a ARS Intelligence a tratar mis datos personales para preparar esta propuesta y contactarme, conforme a la Ley 1581 de 2012 y su política de
            tratamiento de datos. Puedo consultar, actualizar o pedir la supresión de mis datos en cualquier momento.
          </Casilla>
        </>
      );
  }
}
