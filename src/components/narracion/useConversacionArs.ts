"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerCerebro } from "@/lib/asistente/consulta";
import type { Accion, Tarjeta } from "@/lib/asistente/tipos";
import { GrabadoraVoz } from "@/lib/asistente/voz";
import { motorNarracion } from "@/lib/narracion/motor";

/**
 * Conversación corta con Ars dentro de la narración (sin abrir el chat).
 *
 *  - `inactiva`: la narración sigue su curso.
 *  - `escuchando` / `transcribiendo`: micrófono abierto (o `escribiendo` en modo texto).
 *  - `pensando` / `hablando`: Ars responde (voz + avisos pequeños).
 *  - `esperando`: Ars terminó; ventana corta para repreguntar antes de retomar.
 *
 * La respuesta sale del mismo cerebro del asistente (`useConsultaArs` /
 * `Asistente.tsx`): mismo contexto de página, herramientas, persona e historial.
 */
export type FaseConversacion = "inactiva" | "escuchando" | "transcribiendo" | "escribiendo" | "pensando" | "hablando" | "esperando";

export type AvisoArs = {
  id: string;
  pregunta: string;
  texto: string;
  /** Frase que suena ahora (subtítulo). */
  frase: string;
  tarjetas: Tarjeta[];
  acciones: Accion[];
  listo: boolean;
  error: boolean;
};

/**
 * - `continuo` (escritorio): al terminar de responder vuelve a escuchar una vez;
 *   si la persona no dice nada, retoma la narración.
 * - `ptt` (dock móvil, mantener presionado): espera un rato a que vuelva a
 *   presionar; si no, retoma.
 */
export type ModoConversacion = "continuo" | "ptt";

const ESPERA_PTT_MS = 6000;
const ESPERA_TEXTO_MS = 15000;
const MAX_AVISOS = 3;

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Háptica corta si el dispositivo la tiene. */
export function vibrar(ms: number) {
  try {
    // Sin activación previa Chrome bloquea la llamada y lo reporta como error.
    const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (ua && !ua.hasBeenActive) return;
    navigator.vibrate?.(ms);
  } catch {
    /* sin vibración */
  }
}

/** `?arsTexto=1`: escribir la pregunta en vez de hablarla (pruebas sin micrófono). */
function modoTextoPorUrl() {
  try {
    return new URLSearchParams(window.location.search).get("arsTexto") === "1";
  } catch {
    return false;
  }
}

export function useConversacionArs(modo: ModoConversacion) {
  const [fase, setFase] = useState<FaseConversacion>("inactiva");
  const [parcial, setParcial] = useState("");
  const [avisos, setAvisos] = useState<AvisoArs[]>([]);
  const [modoTexto, setModoTexto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const gen = useRef(0);
  const faseRef = useRef<FaseConversacion>("inactiva");
  const grabadora = useRef<GrabadoraVoz | null>(null);
  const soltarPendiente = useRef(false);
  const espera = useRef(0);
  const modoTextoRef = useRef(false);
  const modoRef = useRef(modo);

  useEffect(() => {
    const t = modoTextoPorUrl();
    modoTextoRef.current = t;
    // Lectura única de la URL al montar (no hay otra forma sin Suspense).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModoTexto(t);
  }, []);
  useEffect(() => {
    modoRef.current = modo;
  }, [modo]);

  const cambiarFase = useCallback((f: FaseConversacion) => {
    faseRef.current = f;
    setFase(f);
  }, []);

  const actualizarAviso = useCallback((id: string, fn: (a: AvisoArs) => AvisoArs) => {
    setAvisos((prev) => prev.map((a) => (a.id === id ? fn(a) : a)));
  }, []);

  const cerrarAviso = useCallback((id: string) => setAvisos((prev) => prev.filter((a) => a.id !== id)), []);

  /** Termina la conversación y la narración retoma con la frase puente. */
  const terminar = useCallback(() => {
    if (faseRef.current === "inactiva") return;
    gen.current++;
    window.clearTimeout(espera.current);
    grabadora.current?.cancelar();
    grabadora.current = null;
    const f = faseRef.current;
    if (f === "pensando" || f === "hablando") obtenerCerebro()?.detener();
    cambiarFase("inactiva");
    setParcial("");
    setAviso(null);
    motorNarracion.retomarTrasConversar();
  }, [cambiarFase]);

  const terminarRef = useRef(terminar);
  useEffect(() => {
    terminarRef.current = terminar;
  }, [terminar]);

  /** Ventana para repreguntar; pasada, retoma la narración. */
  const esperarSeguimiento = useCallback(
    (ms: number) => {
      window.clearTimeout(espera.current);
      espera.current = window.setTimeout(() => terminarRef.current(), ms);
    },
    [],
  );

  const escucharRef = useRef<() => void>(() => undefined);

  const preguntar = useCallback(
    async (texto: string, porVoz: boolean) => {
      const cerebro = obtenerCerebro();
      const limpio = texto.trim();
      if (!cerebro || !limpio) return;
      const g = gen.current;
      window.clearTimeout(espera.current);
      setParcial(limpio);
      setAviso(null);
      cambiarFase("pensando");
      const id = uid();
      setAvisos((prev) => [
        ...prev.slice(-(MAX_AVISOS - 1)),
        { id, pregunta: limpio, texto: "", frase: "", tarjetas: [], acciones: [], listo: false, error: false },
      ]);
      const r = await cerebro.consultar(limpio, { porVoz }, (ev) => {
        if (g !== gen.current) return;
        if (ev.t === "texto") actualizarAviso(id, (a) => ({ ...a, texto: a.texto + ev.d }));
        else if (ev.t === "frase") {
          if (faseRef.current !== "hablando") cambiarFase("hablando");
          actualizarAviso(id, (a) => ({ ...a, frase: ev.texto }));
        } else if (ev.t === "tarjeta") {
          if (ev.tarjeta.tipo !== "sugerencias") actualizarAviso(id, (a) => ({ ...a, tarjetas: [...a.tarjetas, ev.tarjeta] }));
        } else if (ev.t === "accion") actualizarAviso(id, (a) => ({ ...a, acciones: [...a.acciones, ev.accion] }));
        else if (ev.t === "error") actualizarAviso(id, (a) => ({ ...a, error: !a.texto, texto: a.texto || ev.mensaje }));
      });
      if (g !== gen.current) return;
      actualizarAviso(id, (a) => ({
        ...a,
        listo: true,
        frase: "",
        error: a.error || (!r.ok && r.motivo === "error"),
        texto: a.texto || (r.ok ? r.texto : r.motivo === "ocupado" ? "Ars está respondiendo otra pregunta en el chat." : "No pude responder ahora."),
      }));
      setParcial("");
      // Conversación corta: puede repreguntar seguido.
      cambiarFase("esperando");
      if (modoTextoRef.current) {
        cambiarFase("escribiendo");
        esperarSeguimiento(ESPERA_TEXTO_MS);
      } else if (modoRef.current === "continuo") {
        window.setTimeout(() => g === gen.current && escucharRef.current(), 350);
      } else esperarSeguimiento(ESPERA_PTT_MS);
    },
    [actualizarAviso, cambiarFase, esperarSeguimiento],
  );

  const escuchar = useCallback(async () => {
    const cerebro = obtenerCerebro();
    if (!cerebro || grabadora.current) return;
    const g = gen.current;
    window.clearTimeout(espera.current);
    const conServidor = await cerebro.sttServidor().catch(() => false);
    if (g !== gen.current) return;
    const rec = new GrabadoraVoz(conServidor, "es");
    grabadora.current = rec;
    rec.onParcial = (t) => g === gen.current && setParcial(t);
    setParcial("");
    cambiarFase("escuchando");
    vibrar(12);
    const promesa = rec.escuchar(() => g === gen.current && cambiarFase("transcribiendo"));
    if (soltarPendiente.current) {
      soltarPendiente.current = false;
      window.setTimeout(() => rec.terminar(), 400);
    }
    const r = await promesa;
    if (grabadora.current === rec) grabadora.current = null;
    if (g !== gen.current) return;
    vibrar(8);
    if ("texto" in r) {
      void preguntar(r.texto, true);
    } else if (r.error === "microfono" || r.error === "stt") {
      // Sin micrófono (o sin reconocimiento): se puede escribir la pregunta.
      modoTextoRef.current = true;
      setModoTexto(true);
      setAviso(r.error === "microfono" ? "No tengo acceso al micrófono: escríbame la pregunta." : "No pude reconocer la voz aquí: escríbame la pregunta.");
      cambiarFase("escribiendo");
      esperarSeguimiento(ESPERA_TEXTO_MS * 2);
    } else {
      // Silencio: no dijo nada (o soltó sin hablar) → retoma el recorrido.
      terminarRef.current();
    }
  }, [cambiarFase, preguntar, esperarSeguimiento]);

  useEffect(() => {
    escucharRef.current = () => void escuchar();
  }, [escuchar]);

  /**
   * Empieza (o continúa) la conversación: pausa la narración, baja la música y
   * abre el micrófono (o el campo de texto). Llamar dentro de un gesto.
   */
  const empezar = useCallback(() => {
    const cerebro = obtenerCerebro();
    if (!cerebro) return;
    window.clearTimeout(espera.current);
    soltarPendiente.current = false;
    const f = faseRef.current;
    // Interrumpe a Ars si estaba respondiendo: la persona quiere decir algo.
    if (f === "pensando" || f === "hablando") {
      gen.current++;
      cerebro.detener();
    }
    motorNarracion.pausarParaConversar();
    cerebro.prepararVoz();
    if (modoTextoRef.current) {
      cambiarFase("escribiendo");
      esperarSeguimiento(ESPERA_TEXTO_MS * 2);
      return;
    }
    if (f === "escuchando" || f === "transcribiendo") return;
    void escuchar();
  }, [cambiarFase, escuchar, esperarSeguimiento]);

  /** Soltar (push-to-talk) o «Listo»: deja de escuchar y envía lo dicho. */
  const soltar = useCallback(() => {
    if (grabadora.current) grabadora.current.terminar();
    else soltarPendiente.current = true;
  }, []);

  /** Corta la voz de Ars sin terminar la conversación (puede repreguntar). */
  const interrumpir = useCallback(() => obtenerCerebro()?.detener(), []);

  const enviarTexto = useCallback(
    (texto: string) => {
      if (!texto.trim()) return;
      motorNarracion.pausarParaConversar();
      obtenerCerebro()?.prepararVoz();
      void preguntar(texto, false);
    },
    [preguntar],
  );

  /** Mientras escribe, no se acaba la ventana de seguimiento. */
  const escribiendo = useCallback(() => {
    if (faseRef.current === "escribiendo") esperarSeguimiento(ESPERA_TEXTO_MS * 2);
  }, [esperarSeguimiento]);

  /** Nivel 0..1 para el orbe: micrófono al escuchar, voz de Ars al hablar. */
  const nivel = useCallback(() => {
    const f = faseRef.current;
    if (f === "escuchando") return grabadora.current?.nivel() ?? 0;
    if (f === "hablando") return obtenerCerebro()?.nivelVoz() ?? 0;
    return 0;
  }, []);

  /** Abre lo que trae un aviso: su tarjeta, su enlace o, si no, el chat completo. */
  const abrirAviso = useCallback(
    (a: AvisoArs) => {
      const cerebro = obtenerCerebro();
      if (!cerebro) return;
      const destino = destinoDeAviso(a);
      if (destino.tipo === "accion") cerebro.ejecutar(destino.accion);
      else if (destino.tipo === "enlace") cerebro.enlace(destino.href);
      else {
        terminar();
        cerebro.abrirChat();
      }
      cerrarAviso(a.id);
    },
    [cerrarAviso, terminar],
  );

  // Al desmontar: nada queda escuchando.
  useEffect(
    () => () => {
      gen.current++;
      window.clearTimeout(espera.current);
      grabadora.current?.cancelar();
    },
    [],
  );

  return {
    fase,
    activa: fase !== "inactiva",
    parcial,
    avisos,
    modoTexto,
    aviso,
    empezar,
    soltar,
    terminar,
    interrumpir,
    enviarTexto,
    escribiendo,
    nivel,
    cerrarAviso,
    abrirAviso,
  };
}

export type ConversacionArs = ReturnType<typeof useConversacionArs>;

type Destino = { tipo: "accion"; accion: Accion; etiqueta: string } | { tipo: "enlace"; href: string; etiqueta: string } | { tipo: "chat"; etiqueta: string };

/** Qué abre un aviso al tocarlo (y cómo se rotula). */
export function destinoDeAviso(a: AvisoArs): Destino {
  for (const t of a.tarjetas) {
    if (t.tipo === "enlace") return { tipo: "accion", accion: { tipo: "ir_a", ruta: t.ruta, ancla: t.ancla }, etiqueta: t.titulo };
    if (t.tipo === "servicio") return { tipo: "accion", accion: { tipo: "mostrar_servicio", area: t.area, modulo: t.modulo, foco: t.foco }, etiqueta: t.nombre };
    if (t.tipo === "analitica") return { tipo: "accion", accion: { tipo: "mostrar_analitica", id: t.id }, etiqueta: t.nombre };
  }
  if (a.tarjetas.length) return { tipo: "chat", etiqueta: a.tarjetas[0].tipo === "contacto" ? "Abrir contacto" : "Ver detalle en el chat" };
  if (a.acciones.some((x) => x.tipo === "abrir_contacto")) return { tipo: "chat", etiqueta: "Abrir contacto" };
  const enlace = /\[([^\]]+)\]\((\/[^)\s]*)\)/.exec(a.texto);
  if (enlace) return { tipo: "enlace", href: enlace[2], etiqueta: enlace[1] };
  return { tipo: "chat", etiqueta: "Seguir en el chat" };
}

/** ¿El aviso trae algo que abrir además del texto? */
export function avisoTieneDestino(a: AvisoArs) {
  return destinoDeAviso(a).tipo !== "chat" || a.tarjetas.length > 0 || a.acciones.some((x) => x.tipo === "abrir_contacto");
}

/** Texto plano corto de una respuesta (sin markdown) para el subtítulo. */
export function textoCorto(texto: string, max = 160) {
  const plano = texto.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`#>_]/g, "").replace(/\s+/g, " ").trim();
  return plano.length > max ? `${plano.slice(0, max).replace(/\s\S*$/, "")}…` : plano;
}
