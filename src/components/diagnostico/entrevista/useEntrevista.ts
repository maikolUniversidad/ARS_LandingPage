"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdjuntoAnalizado, AdjuntoTurno, AreaId, CampoPerfil, TipoAdjunto, TurnoEntrevista } from "@/data/diagnostico/tipos";
import { extraerFotogramas, reducirImagen, tipoDe } from "./adjuntos";
import { analizarAdjunto, turnoEntrevista } from "./cliente";
import { CHIPS_INICIALES, SALUDO, type DatoEmpresa } from "./eventos";
import { camposCambiados, fusionar, INFO_CAMPO, type FuenteCampo, type Origenes, type Perfil } from "./perfil";

export type PedidoAdjunto = { tipo: "imagen" | "video" | "documento"; motivo: string };

export type Mensaje = {
  id: string;
  rol: "user" | "assistant";
  texto: string;
  areas: AreaId[];
  modulos: string[];
  error?: boolean;
  /** Mensaje del usuario que representa un adjunto (se pinta como tarjeta). */
  adjuntoId?: string;
  /** No se pinta (p. ej. «te compartí la foto»), pero viaja en la conversación. */
  oculto?: boolean;
  /** Texto extra que viaja a la IA pero no se muestra (correcciones manuales). */
  nota?: string;
  /** La IA pidió un archivo en este mensaje. */
  pedido?: PedidoAdjunto;
  porVoz?: boolean;
};

export type EstadoAdjunto = "preparando" | "mirando" | "listo" | "error";

export type AdjuntoLocal = {
  id: string;
  nombre: string;
  tipo: TipoAdjunto;
  mime: string;
  bytes: number;
  miniatura?: string;
  estado: EstadoAdjunto;
  /** Avance de la preparación (fotogramas de video) 0..1. */
  avance?: number;
  resultado?: AdjuntoAnalizado;
  llenados?: CampoPerfil[];
  error?: string;
  /** Ya se le contó a la IA (para avanzar la conversación una sola vez). */
  anunciado?: boolean;
};

export type Progreso = { pregunta: number; total: number; enfoque: CampoPerfil | null; faltan: CampoPerfil[] };
export type Chips = { opciones: string[]; multiple: boolean };

/** Quien escucha las respuestas en streaming (el modo conversación las habla). */
export type Oyente = { alEmpezar?: () => void; alTexto: (d: string) => void; alFin: (ok: boolean) => void };

export type OpcionesEnvio = { fuente?: "chat" | "voz"; voz?: boolean; oculto?: boolean };

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const nuevo = (rol: Mensaje["rol"], texto = "", extra: Partial<Mensaje> = {}): Mensaje => ({ id: uid(), rol, texto, areas: [], modulos: [], ...extra });

const conversacionDe = (lista: Mensaje[]): TurnoEntrevista[] =>
  lista
    .filter((m) => (m.texto.trim() || m.nota) && !m.error && !(m.adjuntoId && !m.texto))
    .map((m) => ({ rol: m.rol, texto: [m.texto.trim(), m.nota].filter(Boolean).join(" ") }));

const NOMBRE_TIPO: Record<TipoAdjunto, string> = { imagen: "una foto", video: "un video", documento: "un documento", audio: "un audio" };

/** Estado y acciones de la entrevista multimodal (texto, voz y adjuntos). */
export function useEntrevista() {
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => [nuevo("assistant", SALUDO)]);
  const [perfil, setPerfil] = useState<Perfil>({});
  const [origenes, setOrigenes] = useState<Origenes>({});
  const [chips, setChips] = useState<Chips>({ opciones: CHIPS_INICIALES, multiple: false });
  const [datos, setDatos] = useState<DatoEmpresa[]>([]);
  const [areasVistas, setAreasVistas] = useState<AreaId[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [listo, setListo] = useState(false);
  const [progreso, setProgreso] = useState<Progreso | null>(null);
  const [adjuntos, setAdjuntos] = useState<AdjuntoLocal[]>([]);

  // Espejos para callbacks asíncronos (streaming, voz, subida de archivos).
  const mensajesRef = useRef(mensajes);
  const perfilRef = useRef(perfil);
  const adjuntosRef = useRef(adjuntos);
  const ocupadoRef = useRef(false);
  const manuales = useRef<CampoPerfil[]>([]);
  const oyente = useRef<Oyente | null>(null);
  const abort = useRef<AbortController | null>(null);
  const subidas = useRef(new Map<string, AbortController>());
  const urls = useRef<string[]>([]);
  const vozActiva = useRef(false);

  useEffect(() => {
    mensajesRef.current = mensajes;
  }, [mensajes]);
  useEffect(() => {
    adjuntosRef.current = adjuntos;
  }, [adjuntos]);

  useEffect(() => {
    const lista = urls.current;
    const subs = subidas.current;
    return () => {
      abort.current?.abort();
      subs.forEach((c) => c.abort());
      lista.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const aplicarPerfil = useCallback((cambios: Perfil, fuente: FuenteCampo["fuente"], detalle?: string): CampoPerfil[] => {
    const antes = perfilRef.current;
    const despues = fusionar(antes, cambios);
    const cambiados = camposCambiados(antes, despues);
    perfilRef.current = despues;
    setPerfil(despues);
    if (cambiados.length) {
      const en = Date.now();
      setOrigenes((o) => {
        const n = { ...o };
        for (const c of cambiados) n[c] = { fuente, detalle, en };
        return n;
      });
    }
    return cambiados;
  }, []);

  const adjuntosTurno = useCallback((): AdjuntoTurno[] =>
    adjuntosRef.current
      .filter((a) => a.estado === "listo" && a.resultado)
      .map((a) => {
        const r = a.resultado as AdjuntoAnalizado;
        return { id: r.id, nombre: r.nombre, tipo: r.tipo, resumen: r.resumen, hallazgos: r.hallazgos };
      }), []);

  const enviarRef = useRef<(texto: string, op?: OpcionesEnvio) => Promise<void>>(async () => undefined);

  /** Si hay adjuntos analizados que la IA no conoce, avanza la conversación con ellos. */
  const anunciarAdjuntos = useCallback(() => {
    if (ocupadoRef.current) return;
    const lista = adjuntosRef.current;
    if (lista.some((a) => a.estado === "preparando" || a.estado === "mirando")) return;
    const nuevos = lista.filter((a) => a.estado === "listo" && !a.anunciado);
    if (!nuevos.length) return;
    const ids = new Set(nuevos.map((a) => a.id));
    adjuntosRef.current = lista.map((a) => (ids.has(a.id) ? { ...a, anunciado: true } : a));
    setAdjuntos(adjuntosRef.current);
    const texto =
      nuevos.length === 1
        ? `Te compartí ${NOMBRE_TIPO[nuevos[0].tipo]}: «${nuevos[0].nombre}».`
        : `Te compartí ${nuevos.length} archivos: ${nuevos.map((a) => `«${a.nombre}»`).join(", ")}.`;
    void enviarRef.current(texto, { oculto: true, voz: vozActiva.current });
  }, []);

  const enviar = useCallback(
    async (texto: string, op: OpcionesEnvio = {}) => {
      const limpio = texto.trim();
      if (!limpio || ocupadoRef.current) return;
      ocupadoRef.current = true;
      setOcupado(true);

      const nota = manuales.current.length
        ? `(Corregí a mano: ${manuales.current.map((c) => INFO_CAMPO[c].etiqueta).join(", ")}.)`
        : undefined;
      manuales.current = [];
      const usuario = nuevo("user", limpio, { oculto: op.oculto, nota, porVoz: op.fuente === "voz" || op.voz });
      const respuesta = nuevo("assistant");
      const historial = [...mensajesRef.current, usuario];
      mensajesRef.current = [...historial, respuesta];
      setMensajes(mensajesRef.current);
      setChips({ opciones: [], multiple: false });

      const editar = (f: (m: Mensaje) => Mensaje) => setMensajes((ms) => ms.map((m) => (m.id === respuesta.id ? f(m) : m)));
      const ctrl = new AbortController();
      abort.current = ctrl;
      const escucha = oyente.current;
      escucha?.alEmpezar?.();
      const fuente: FuenteCampo["fuente"] = op.fuente === "voz" || op.voz ? "voz" : "chat";
      let ok = true;
      try {
        await turnoEntrevista(
          { conversacion: conversacionDe(historial), perfil: perfilRef.current, adjuntos: adjuntosTurno(), voz: op.voz || undefined },
          (e) => {
            switch (e.t) {
              case "texto":
                editar((m) => ({ ...m, texto: m.texto + e.d }));
                escucha?.alTexto(e.d);
                break;
              case "perfil":
                aplicarPerfil(e.cambios, fuente);
                break;
              case "mostrar":
                editar((m) => ({ ...m, areas: e.areas, modulos: e.modulos }));
                setAreasVistas((v) => [...new Set([...v, ...e.areas])]);
                break;
              case "chips":
                setChips({ opciones: e.opciones, multiple: e.multiple });
                break;
              case "dato":
                setDatos((d) => [...d, e.dato].slice(-6));
                break;
              case "progreso":
                setProgreso({ pregunta: e.pregunta, total: e.total, enfoque: e.enfoque, faltan: e.faltan });
                break;
              case "pedirAdjunto":
                editar((m) => ({ ...m, pedido: { tipo: e.tipo, motivo: e.motivo } }));
                break;
              case "listo":
                setListo(true);
                break;
              case "error":
                ok = false;
                editar((m) => ({ ...m, texto: m.texto || e.mensaje, error: !m.texto }));
                break;
            }
          },
          ctrl.signal,
        );
      } catch {
        ok = false;
        if (!ctrl.signal.aborted) editar((m) => ({ ...m, texto: m.texto || "Se cortó la conexión. ¿Lo intentamos otra vez?", error: !m.texto }));
      } finally {
        ocupadoRef.current = false;
        setOcupado(false);
        if (!ctrl.signal.aborted) escucha?.alFin(ok);
        // Si llegaron archivos mientras Ars respondía, ahora sí se los contamos.
        window.setTimeout(anunciarAdjuntos, 0);
      }
    },
    [aplicarPerfil, anunciarAdjuntos, adjuntosTurno],
  );

  useEffect(() => {
    enviarRef.current = enviar;
  }, [enviar]);

  const editarAdjunto = useCallback((id: string, f: (a: AdjuntoLocal) => AdjuntoLocal) => {
    adjuntosRef.current = adjuntosRef.current.map((a) => (a.id === id ? f(a) : a));
    setAdjuntos(adjuntosRef.current);
  }, []);

  const procesar = useCallback(
    async (archivo: File, id: string, tipo: TipoAdjunto) => {
      const ctrl = new AbortController();
      subidas.current.set(id, ctrl);
      try {
        let envio = archivo;
        let fotogramas: Blob[] | undefined;
        if (tipo === "imagen") envio = await reducirImagen(archivo);
        if (tipo === "video") {
          try {
            fotogramas = await extraerFotogramas(archivo, (h, t) => editarAdjunto(id, (a) => ({ ...a, avance: h / t })));
            const mini = URL.createObjectURL(fotogramas[0]);
            urls.current.push(mini);
            editarAdjunto(id, (a) => ({ ...a, miniatura: mini }));
          } catch {
            fotogramas = undefined; // el navegador no pudo decodificarlo: que el servidor lo intente
          }
        }
        editarAdjunto(id, (a) => ({ ...a, estado: "mirando", avance: undefined }));
        const r = await analizarAdjunto(envio, perfilRef.current, fotogramas, ctrl.signal);
        if (!r.ok) {
          editarAdjunto(id, (a) => ({ ...a, estado: "error", error: r.mensaje }));
          return;
        }
        const llenados = aplicarPerfil(r.adjunto.cambios ?? {}, "adjunto", archivo.name);
        if (r.adjunto.areas?.length) setAreasVistas((v) => [...new Set([...v, ...r.adjunto.areas])]);
        editarAdjunto(id, (a) => ({ ...a, estado: "listo", resultado: r.adjunto, llenados }));
        anunciarAdjuntos();
      } catch {
        if (!ctrl.signal.aborted) editarAdjunto(id, (a) => ({ ...a, estado: "error", error: "No pude procesar este archivo." }));
      } finally {
        subidas.current.delete(id);
      }
    },
    [aplicarPerfil, anunciarAdjuntos, editarAdjunto],
  );

  /** Agrega archivos (botón, arrastrar, pegar o cámara): cada uno se analiza al instante. */
  const agregarArchivos = useCallback(
    (lista: FileList | File[]) => {
      const archivos = Array.from(lista).slice(0, 6);
      for (const archivo of archivos) {
        const id = uid();
        const tipo = tipoDe(archivo);
        let miniatura: string | undefined;
        if (tipo === "imagen" && !/heic|heif/i.test(archivo.type + archivo.name)) {
          miniatura = URL.createObjectURL(archivo);
          urls.current.push(miniatura);
        }
        const local: AdjuntoLocal = {
          id,
          nombre: archivo.name || "archivo",
          tipo: tipo ?? "documento",
          mime: archivo.type,
          bytes: archivo.size,
          miniatura,
          estado: tipo ? "preparando" : "error",
          error: tipo ? undefined : "Ese tipo de archivo no lo puedo leer. Prueba con una foto, un video, un PDF o una hoja de cálculo.",
        };
        adjuntosRef.current = [...adjuntosRef.current, local];
        setAdjuntos(adjuntosRef.current);
        const msg = nuevo("user", "", { adjuntoId: id });
        mensajesRef.current = [...mensajesRef.current, msg];
        setMensajes(mensajesRef.current);
        if (tipo) void procesar(archivo, id, tipo);
      }
    },
    [procesar],
  );

  const quitarAdjunto = useCallback((id: string) => {
    subidas.current.get(id)?.abort();
    adjuntosRef.current = adjuntosRef.current.filter((a) => a.id !== id);
    setAdjuntos(adjuntosRef.current);
    setMensajes((ms) => {
      mensajesRef.current = ms.filter((m) => m.adjuntoId !== id);
      return mensajesRef.current;
    });
  }, []);

  /** Edición manual de un campo desde el panel (viaja en el siguiente turno). */
  const editarCampo = useCallback((campo: CampoPerfil, valor: Perfil) => {
    const antes = perfilRef.current;
    const despues: Perfil = { ...antes, ...valor };
    for (const [k, v] of Object.entries(valor)) {
      if (v === undefined || (Array.isArray(v) && !v.length) || v === "") delete despues[k as keyof Perfil];
    }
    perfilRef.current = despues;
    setPerfil(despues);
    setOrigenes((o) => ({ ...o, [campo]: { fuente: "manual", en: Date.now() } }));
    if (!manuales.current.includes(campo)) manuales.current.push(campo);
  }, []);

  const cancelar = useCallback(() => abort.current?.abort(), []);

  return {
    mensajes,
    perfil,
    origenes,
    chips,
    datos,
    areasVistas,
    ocupado,
    listo,
    progreso,
    adjuntos,
    enviar,
    agregarArchivos,
    quitarAdjunto,
    editarCampo,
    cancelar,
    adjuntosTurno,
    conversacion: () => conversacionDe(mensajesRef.current),
    perfilActual: () => perfilRef.current,
    /** Registra quién escucha las respuestas (modo conversación). */
    escuchar: (o: Oyente | null, voz: boolean) => {
      oyente.current = o;
      vozActiva.current = voz;
    },
  };
}
