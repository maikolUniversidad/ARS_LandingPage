"use client";

import type { Accion, ClavePerfil, ContextoPagina } from "./tipos";

/**
 * Conversación en tiempo real con el agente de ElevenLabs (voz ↔ voz, baja
 * latencia). Usa las mismas herramientas que el chat de texto como "client
 * tools", así que también puede navegar, abrir analíticas y el contacto.
 * El SDK se carga bajo demanda para no pesar en el resto del sitio.
 */

type ConversacionEL = {
  endSession(): Promise<void>;
  getInputVolume(): number;
  getOutputVolume(): number;
  sendContextualUpdate(text: string): void;
  setMicMuted(m: boolean): void;
};

export type EventosAgente = {
  onEstado: (e: "conectando" | "escuchando" | "hablando" | "desconectado") => void;
  onMensaje: (rol: "user" | "assistant", texto: string) => void;
  /** Fragmentos de la respuesta del agente mientras se genera (subtítulos). */
  onParte: (delta: string) => void;
  onAccion: (a: Accion) => void;
  onError: (mensaje: string) => void;
};

export function describirContexto(c: ContextoPagina): string {
  return [
    `La persona está en ${c.ruta}${c.ancla ? `#${c.ancla}` : ""} (${c.tituloDocumento}).`,
    c.seccion ? `Sección visible: ${c.seccion.titulo || c.seccion.id}.` : "",
    c.analitica ? `Tiene abierta la analítica ${c.analitica.nombre} (id ${c.analitica.id}).` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export class AgenteVoz {
  private conv: ConversacionEL | null = null;

  async iniciar(contexto: ContextoPagina, historialResumen: string, perfil: Partial<Record<ClavePerfil, string>>, ev: EventosAgente) {
    const perfilTexto = Object.entries(perfil)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
    ev.onEstado("conectando");
    const r = await fetch("/api/asistente/voz-sesion", { cache: "no-store" });
    const j = (await r.json()) as { ok: boolean; signedUrl?: string; prompt?: string; mensaje?: string };
    if (!r.ok || !j.signedUrl) {
      ev.onEstado("desconectado");
      throw new Error(j.mensaje ?? "voz-sesion");
    }
    const { Conversation } = await import("@elevenlabs/client");
    const ok = (txt: string) => txt;
    this.conv = (await Conversation.startSession({
      signedUrl: j.signedUrl,
      connectionType: "websocket",
      overrides: j.prompt
        ? {
            agent: {
              prompt: {
                prompt: `${j.prompt}

# Estado al iniciar
${describirContexto(contexto)}
Idioma de la interfaz: ${contexto.idioma}.
Lo que la persona contó de sí misma: ${perfilTexto || "(nada todavía)"}
Conversación previa en el chat:
${historialResumen.slice(0, 1500) || "(sin conversación previa)"}`,
              },
              language: contexto.idioma,
              firstMessage:
                contexto.idioma === "en" ? "Hi, I'm Ars. I'm listening — what would you like to know about ARS?" : "Hola, soy Ars. Te escucho: ¿qué quieres conocer de ARS?",
            },
          }
        : undefined,
      dynamicVariables: {
        pagina_actual: describirContexto(contexto),
        idioma: contexto.idioma,
        historial: historialResumen.slice(0, 1500) || "(sin conversación previa)",
      },
      clientTools: {
        ir_a: (p: Record<string, unknown>) => {
          ev.onAccion({ tipo: "ir_a", ruta: s(p.ruta) || "/", ancla: s(p.ancla) || undefined });
          return ok(`Listo, la persona ya está en ${s(p.ruta)}.`);
        },
        mostrar_analitica: (p: Record<string, unknown>) => {
          ev.onAccion({ tipo: "mostrar_analitica", id: s(p.id) });
          return ok("Listo, la analítica está abierta en el visor.");
        },
        abrir_contacto: (p: Record<string, unknown>) => {
          ev.onAccion({ tipo: "abrir_contacto", motivo: s(p.motivo) || undefined });
          return ok("Listo, el formulario de contacto está abierto en el chat.");
        },
        resaltar: (p: Record<string, unknown>) => {
          ev.onAccion({ tipo: "resaltar", ancla: s(p.ancla), nota: s(p.nota) || undefined });
          return ok("Listo, sección resaltada.");
        },
      },
      onConnect: () => ev.onEstado("escuchando"),
      onDisconnect: () => {
        this.conv = null;
        ev.onEstado("desconectado");
      },
      onModeChange: ({ mode }) => ev.onEstado(mode === "speaking" ? "hablando" : "escuchando"),
      onMessage: ({ role, message }) => {
        if (message?.trim()) ev.onMensaje(role === "agent" ? "assistant" : "user", message);
      },
      onAgentChatResponsePart: (p: { text: string; type: "start" | "delta" | "stop" }) => {
        if (p.type === "delta" && p.text) ev.onParte(p.text);
      },
      onError: (m: string) => ev.onError(m),
    })) as unknown as ConversacionEL;
  }

  activo() {
    return this.conv !== null;
  }

  contexto(c: ContextoPagina) {
    this.conv?.sendContextualUpdate(describirContexto(c));
  }

  nivelEntrada() {
    return this.conv?.getInputVolume() ?? 0;
  }

  nivelSalida() {
    return this.conv?.getOutputVolume() ?? 0;
  }

  async terminar() {
    const c = this.conv;
    this.conv = null;
    await c?.endSession().catch(() => undefined);
  }
}
