/**
 * Consulta rápida a Ars sin abrir el chat (solo cliente).
 *
 * El «cerebro» del asistente vive en `Asistente.tsx` (contexto de la página,
 * historial, perfil, herramientas que mueven el sitio y la voz). Al montarse,
 * registra aquí una función; quien quiera preguntarle algo a Ars sin abrir el
 * panel (la narración, el dock móvil) usa `useConsultaArs()` y recibe la
 * respuesta en streaming. Así hay una sola lógica de chat, no dos.
 */

import { useCallback, useSyncExternalStore } from "react";
import type { Accion, Tarjeta } from "./tipos";

export type EventoConsulta =
  /** Fragmento de texto de la respuesta (streaming). */
  | { t: "texto"; d: string }
  /** Frase que empieza a sonar en voz (subtítulo). */
  | { t: "frase"; texto: string }
  | { t: "tarjeta"; tarjeta: Tarjeta }
  /** Acción que el asistente ya ejecutó sobre el sitio (navegar, resaltar…). */
  | { t: "accion"; accion: Accion }
  | { t: "error"; mensaje: string };

export type ResultadoConsulta = { ok: true; texto: string } | { ok: false; motivo: "ocupado" | "sin-cerebro" | "error" | "cancelado" };

export type OpcionesConsulta = {
  /** La pregunta llegó por voz (el historial lo marca así). */
  porVoz?: boolean;
  /** Ars responde en voz (por defecto sí). */
  hablar?: boolean;
};

export type Cerebro = {
  /**
   * Envía la pregunta con el contexto de la página. Resuelve cuando terminó el
   * texto **y** la voz (o al cancelarse).
   */
  consultar: (texto: string, opciones: OpcionesConsulta, alEvento: (e: EventoConsulta) => void) => Promise<ResultadoConsulta>;
  /** Corta la respuesta y la voz en curso. */
  detener: () => void;
  /** Desbloquea el audio de la respuesta: llamar dentro de un gesto. */
  prepararVoz: () => void;
  /** ¿Hay transcripción del servidor (ElevenLabs Scribe)? */
  sttServidor: () => Promise<boolean>;
  /** Nivel 0..1 de la voz de Ars (para animar el orbe). */
  nivelVoz: () => number;
  /** Ejecuta una acción del asistente (p. ej. al tocar una tarjeta de un aviso). */
  ejecutar: (a: Accion) => void;
  /** Sigue un enlace interno de una respuesta (`/ruta#ancla`). */
  enlace: (href: string) => void;
  /** Abre el chat completo (con la conversación ya cargada). */
  abrirChat: () => void;
};

let cerebro: Cerebro | null = null;
const oyentes = new Set<() => void>();

/** Lo llama `Asistente.tsx` al montarse. Devuelve la función para darse de baja. */
export function registrarCerebro(c: Cerebro) {
  cerebro = c;
  oyentes.forEach((fn) => fn());
  return () => {
    if (cerebro !== c) return;
    cerebro = null;
    oyentes.forEach((fn) => fn());
  };
}

export function obtenerCerebro() {
  return cerebro;
}

const suscribir = (fn: () => void) => {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
};

/** Hook: ¿está disponible el cerebro de Ars? + atajos. */
export function useConsultaArs() {
  const disponible = useSyncExternalStore(
    suscribir,
    () => cerebro !== null,
    () => false,
  );
  const consultar = useCallback(
    (texto: string, opciones: OpcionesConsulta, alEvento: (e: EventoConsulta) => void): Promise<ResultadoConsulta> =>
      cerebro ? cerebro.consultar(texto, opciones, alEvento) : Promise.resolve({ ok: false, motivo: "sin-cerebro" }),
    [],
  );
  return { disponible, consultar, cerebro: obtenerCerebro };
}
