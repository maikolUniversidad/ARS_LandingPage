"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { quitarHalo } from "@/lib/asistente/acciones";
import { pasosRecorrido, type PasoGuia } from "@/lib/asistente/contexto-pagina";

export type EstadoRecorrido = {
  pasos: PasoGuia[];
  i: number;
  pausado: boolean;
  terminado: boolean;
  /** 0..1 del tiempo del paso actual (avance automático). */
  progreso: number;
};

type Opciones = {
  /** true si Ars responde o habla: el reloj del paso se detiene. */
  ocupado: () => boolean;
  /** Muestra el paso: desplaza, resalta y (en voz) lo narra. */
  alPaso: (paso: PasoGuia, i: number, total: number, duracion: number) => void;
};

const TICK = 200;

/** Tiempo de lectura de un paso: ~300 ms por palabra, entre 6 y 15 s. */
export function duracionPaso(p: PasoGuia): number {
  const palabras = `${p.titulo} ${p.texto}`.split(/\s+/).length;
  return Math.min(15_000, Math.max(6_000, palabras * 300));
}

/**
 * Recorrido guiado por las secciones de la página actual: paso n/N con
 * anterior, siguiente y pausa. Avanza solo al terminar el tiempo de lectura,
 * se pausa si la persona toma el control (rueda, toque o teclado) y espera
 * mientras Ars está ocupado.
 */
export function useRecorrido({ ocupado, alPaso }: Opciones) {
  const [r, setR] = useState<EstadoRecorrido | null>(null);
  const ocupadoRef = useRef(ocupado);
  const alPasoRef = useRef(alPaso);
  useEffect(() => {
    ocupadoRef.current = ocupado;
    alPasoRef.current = alPaso;
  }, [ocupado, alPaso]);

  const iniciar = useCallback((): boolean => {
    const pasos = pasosRecorrido();
    if (!pasos.length) return false;
    setR({ pasos, i: 0, pausado: false, terminado: false, progreso: 0 });
    return true;
  }, []);

  const ir = useCallback((delta: number) => {
    setR((x) => {
      if (!x) return x;
      // Desde el final, «anterior» vuelve al último paso.
      if (x.terminado && delta < 0) return { ...x, terminado: false, pausado: true, progreso: 0 };
      const i = x.i + delta;
      if (i >= x.pasos.length) return { ...x, terminado: true, pausado: true, progreso: 1 };
      if (i < 0) return x;
      return { ...x, i, terminado: false, progreso: 0 };
    });
  }, []);

  const siguiente = useCallback(() => ir(1), [ir]);
  const anterior = useCallback(() => ir(-1), [ir]);
  const alternarPausa = useCallback(() => setR((x) => (x && !x.terminado ? { ...x, pausado: !x.pausado } : x)), []);
  const pausar = useCallback(() => setR((x) => (x && !x.pausado ? { ...x, pausado: true } : x)), []);
  const salir = useCallback(() => {
    setR(null);
    quitarHalo();
  }, []);

  // Mostrar cada paso al llegar a él.
  const paso = r && !r.terminado ? r.pasos[r.i] : null;
  const total = r?.pasos.length ?? 0;
  const indice = r?.i ?? -1;
  useEffect(() => {
    if (paso) alPasoRef.current(paso, indice, total, duracionPaso(paso));
  }, [paso, indice, total]);

  // Reloj del paso (al reanudar sigue desde donde iba).
  const progresoRef = useRef(0);
  useEffect(() => {
    progresoRef.current = r?.progreso ?? 0;
  }, [r?.progreso]);
  const corriendo = Boolean(r && !r.pausado && !r.terminado);
  useEffect(() => {
    if (!corriendo || !paso) return;
    const dur = duracionPaso(paso);
    let pasado = progresoRef.current >= 1 ? 0 : progresoRef.current * dur;
    const id = window.setInterval(() => {
      if (ocupadoRef.current()) return;
      pasado += TICK;
      if (pasado >= dur) {
        window.clearInterval(id);
        ir(1);
      } else setR((x) => (x ? { ...x, progreso: pasado / dur } : x));
    }, TICK);
    return () => window.clearInterval(id);
  }, [corriendo, paso, ir]);

  // Si la persona toma el control del scroll, el recorrido se pausa.
  useEffect(() => {
    if (!corriendo) return;
    const propio = (e: Event) => e.target instanceof Element && Boolean(e.target.closest("[data-asistente-raiz]"));
    const tomar = (e: Event) => {
      if (!propio(e)) pausar();
    };
    const teclas = new Set(["PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End", " "]);
    const tecla = (e: KeyboardEvent) => {
      if (teclas.has(e.key) && !propio(e) && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) pausar();
    };
    window.addEventListener("wheel", tomar, { passive: true });
    window.addEventListener("touchmove", tomar, { passive: true });
    window.addEventListener("keydown", tecla);
    return () => {
      window.removeEventListener("wheel", tomar);
      window.removeEventListener("touchmove", tomar);
      window.removeEventListener("keydown", tecla);
    };
  }, [corriendo, pausar]);

  return { recorrido: r, iniciar, siguiente, anterior, alternarPausa, pausar, salir };
}
