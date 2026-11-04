"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { analiticas } from "@/data/analiticas";
import { enfocarServicio, esMovil, resaltarElemento } from "@/lib/asistente/acciones";
import { extraerFotogramas, formatoBytes, imagenDesdeUrl, prepararAdjunto } from "@/lib/asistente/adjuntos";
import { borrarHistorial, cargarHistorial, enviarChat, ErrorChat, guardarHistorial, leerEstado } from "@/lib/asistente/cliente";
import { leerContexto } from "@/lib/asistente/contexto-pagina";
import { EVENTO_PREGUNTAR, EVENTO_VOZ_ACTIVA, type DetallePreguntar, type DetalleVozActiva } from "@/lib/asistente/eventos-servicios";
import { useTextosAsistente, type ClaveAsistente } from "@/lib/asistente/i18n";
import { borrarMemoria, cargarPerfil, guardarPerfil, partirHistorial, recorridoReciente, registrarPaso, type Perfil } from "@/lib/asistente/memoria";
import type { Accion, Cita, ClavePerfil, DocumentoAdjunto, EstadoServicios, MensajeChat, Tarjeta } from "@/lib/asistente/tipos";
import { LIMITES } from "@/lib/asistente/tipos";
import { GrabadoraVoz, ReproductorVoz, VigiaInterrupcion, vozDisponible } from "@/lib/asistente/voz";
import { AgenteVoz } from "@/lib/asistente/voz-agente";
import { BotonFlotante } from "./BotonFlotante";
import type { FaseVoz } from "./OrbeVoz";
import { PanelAsistente, type ModoVoz, type Subtitulo, type Sugerencia } from "./PanelAsistente";

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const porIdAnalitica = new Map(analiticas.map((a) => [a.id, a]));
const SIN_SERVICIOS: EstadoServicios = { chat: false, modelo: "", voz: { tts: false, stt: false, agente: false } };

/** Evento global para abrir el asistente desde cualquier parte del sitio. */
export const EVENTO_ABRIR = "ars:asistente";
export type DetalleAbrir = { mensaje?: string; voz?: boolean };

type OpcionesEnvio = {
  docsExtra?: DocumentoAdjunto[];
  porVoz?: boolean;
  /** Módulo de /servicios por el que se pregunta (botón «Pregúntale a Ars sobre esto»). */
  moduloPregunta?: string;
};

/** Área de /servicios/<area> en una ruta, si aplica. */
const areaDeRuta = (ruta: string) => /^\/servicios\/([^/?#]+)/.exec(ruta)?.[1];

/**
 * Asistente de IA de ARS: botón flotante + panel. Vive en el layout raíz, así
 * que conserva la conversación al navegar (y la persiste en localStorage),
 * junto con el perfil de la persona y su recorrido por el sitio.
 */
export function Asistente() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { t, idioma } = useTextosAsistente();

  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>(() => (typeof window === "undefined" ? [] : cargarHistorial()));
  const [perfil, setPerfil] = useState<Perfil>(() => cargarPerfil());
  const [estado, setEstado] = useState<EstadoServicios | null>(null);
  const [enCurso, setEnCurso] = useState(false);
  const [docs, setDocs] = useState<DocumentoAdjunto[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [modoVoz, setModoVoz] = useState<ModoVoz>("apagado");
  const [faseVoz, setFaseVoz] = useState<FaseVoz>("inactivo");
  const [subtitulo, setSubtitulo] = useState<Subtitulo | null>(null);
  const [burbuja, setBurbuja] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState("");
  const [ancla, setAncla] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const reproductor = useRef<ReproductorVoz | null>(null);
  const grabadora = useRef<GrabadoraVoz | null>(null);
  const agente = useRef<AgenteVoz | null>(null);
  const vigia = useRef<VigiaInterrupcion | null>(null);
  const modoVozRef = useRef<ModoVoz>("apagado");
  const mensajesRef = useRef(mensajes);
  const perfilRef = useRef(perfil);
  const abiertoRef = useRef(abierto);
  const enCursoRef = useRef(false);
  const escucharRef = useRef<() => void>(() => undefined);
  const videoPendiente = useRef<string | null>(null);
  const analizarRef = useRef<(id: string) => void>(() => undefined);

  useEffect(() => {
    mensajesRef.current = mensajes;
    guardarHistorial(mensajes);
  }, [mensajes]);
  useEffect(() => {
    perfilRef.current = perfil;
    guardarPerfil(perfil);
  }, [perfil]);
  useEffect(() => {
    modoVozRef.current = modoVoz;
  }, [modoVoz]);
  useEffect(() => {
    abiertoRef.current = abierto;
  }, [abierto]);

  // Estado de los servicios (claves configuradas) al abrir por primera vez.
  const pidioEstado = useRef(false);
  useEffect(() => {
    if (!abierto || pidioEstado.current) return;
    pidioEstado.current = true;
    void leerEstado().then((e) => setEstado(e ?? SIN_SERVICIOS));
  }, [abierto]);

  // Recorrido: cada página o analítica vista queda en la memoria local.
  useEffect(() => {
    const registrar = () => {
      const a = decodeURIComponent(window.location.hash.slice(1));
      setAncla(a);
      const ctx = leerContexto(window.location.pathname, idioma);
      registrarPaso(window.location.pathname, a, ctx.analitica?.nombre ?? ctx.seccion?.titulo ?? document.title);
    };
    const id = window.setTimeout(registrar, 700);
    window.addEventListener("hashchange", registrar);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("hashchange", registrar);
    };
  }, [pathname, idioma]);

  // El agente de tiempo real se entera de cada cambio de página.
  useEffect(() => {
    if (agente.current?.activo()) {
      const id = window.setTimeout(() => agente.current?.contexto(leerContexto(pathname, idioma)), 600);
      return () => window.clearTimeout(id);
    }
  }, [pathname, ancla, idioma]);

  /* ───────────── Acciones sobre la web ───────────── */

  const cerrarEnMovil = useCallback(() => {
    if (esMovil()) setAbierto(false);
  }, []);

  /**
   * Navegación con ancla: el router de Next se lleva mal con los hash entre
   * páginas, así que navegamos a la ruta y aplicamos el ancla al llegar.
   */
  const pendiente = useRef<{ ruta: string; ancla?: string; resaltar: string | null } | null>(null);
  const aplicarAncla = useCallback((ruta: string, a: string | undefined, resaltar: string | null) => {
    if (a) {
      window.history.replaceState(window.history.state, "", `${ruta}#${a}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    if (resaltar) void resaltarElemento(resaltar);
    else window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const p = pendiente.current;
    if (p && p.ruta === pathname) {
      pendiente.current = null;
      aplicarAncla(p.ruta, p.ancla, p.resaltar);
    }
  }, [pathname, aplicarAncla]);

  const navegar = useCallback(
    (ruta: string, a: string | undefined, resaltar: string | null) => {
      if (ruta === window.location.pathname) aplicarAncla(ruta, a, resaltar);
      else {
        pendiente.current = { ruta, ancla: a, resaltar };
        router.push(ruta);
      }
    },
    [router, aplicarAncla],
  );

  const ejecutar = useCallback(
    (a: Accion) => {
      switch (a.tipo) {
        case "ir_a":
          cerrarEnMovil();
          navegar(a.ruta, a.ancla, a.ancla ?? null);
          break;
        case "mostrar_analitica":
          cerrarEnMovil();
          navegar("/vision", a.id, "visor");
          break;
        case "mostrar_servicio": {
          cerrarEnMovil();
          const ruta = `/servicios/${a.area}`;
          navegar(ruta, a.modulo, a.modulo ?? null);
          void enfocarServicio(ruta, a.modulo, a.foco);
          break;
        }
        case "resaltar":
          cerrarEnMovil();
          void resaltarElemento(a.ancla);
          break;
        case "abrir_contacto":
          setAbierto(true);
          break;
        case "recordar":
          setPerfil((p) => ({ ...p, [a.clave]: a.valor }));
          break;
        case "olvidar":
          if (a.clave === "todo") {
            setPerfil({});
            borrarMemoria();
          } else
            setPerfil((p) => {
              const copia = { ...p };
              delete copia[a.clave as ClavePerfil];
              return copia;
            });
          break;
        case "analizar_video":
          // Se procesa al terminar la respuesta en curso.
          videoPendiente.current = a.id;
          break;
      }
    },
    [navegar, cerrarEnMovil],
  );

  const enlaceInterno = useCallback(
    (href: string) => {
      const [ruta, a] = href.split("#");
      const area = areaDeRuta(ruta);
      if (ruta === "/vision" && a) ejecutar({ tipo: "mostrar_analitica", id: a });
      else if (area) ejecutar({ tipo: "mostrar_servicio", area, modulo: a || undefined });
      else ejecutar({ tipo: "ir_a", ruta: ruta || window.location.pathname, ancla: a });
    },
    [ejecutar],
  );

  /* ───────────── Voz: reproducción ───────────── */

  const usarEleven = Boolean(estado?.voz.tts);
  const obtenerReproductor = useCallback(() => {
    if (!reproductor.current) {
      reproductor.current = new ReproductorVoz(usarEleven, idioma);
    }
    reproductor.current.configurar(usarEleven, idioma);
    reproductor.current.onFrase = (frase) => setSubtitulo({ rol: "assistant", texto: frase });
    reproductor.current.onEstado = (e) => {
      if (e === "hablando") setFaseVoz("hablando");
      else if (modoVozRef.current === "manos-libres") {
        // Terminó de hablar: volvemos a escuchar (conversación manos libres).
        setFaseVoz("inactivo");
        window.setTimeout(() => escucharRef.current(), 250);
      } else setFaseVoz("inactivo");
    };
    return reproductor.current;
  }, [usarEleven, idioma]);

  /* ───────────── Chat ───────────── */

  const actualizarUltimo = useCallback((fn: (m: MensajeChat) => MensajeChat) => {
    setMensajes((prev) => {
      if (!prev.length) return prev;
      const copia = prev.slice();
      copia[copia.length - 1] = fn(copia[copia.length - 1]);
      return copia;
    });
  }, []);

  const enviar = useCallback(
    async (texto: string, modo: "texto" | "voz" = "texto", opciones: OpcionesEnvio = {}) => {
      const limpio = texto.trim();
      if (!limpio || enCursoRef.current) return;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setAviso(null);

      const documentos = [...docs, ...(opciones.docsExtra ?? [])];
      const ctxPagina = leerContexto(window.location.pathname, idioma);
      if (opciones.moduloPregunta) {
        const area = ctxPagina.servicio?.area ?? areaDeRuta(window.location.pathname);
        if (area) ctxPagina.servicio = { area, modulo: opciones.moduloPregunta, pregunta: true };
      }
      const usuario: MensajeChat = {
        id: uid(),
        rol: "user",
        texto: limpio.slice(0, LIMITES.mensajeCaracteres),
        adjuntos: documentos.length ? documentos.map((d) => ({ nombre: d.nombre, tipo: d.tipo, bytes: d.bytes })) : undefined,
        porVoz: opciones.porVoz || undefined,
        ts: Date.now(),
      };
      const respuesta: MensajeChat = { id: uid(), rol: "assistant", texto: "", tarjetas: [], ts: Date.now() };
      const { recientes, resumen } = partirHistorial([...mensajesRef.current.filter((m) => !m.error && m.texto.trim()), usuario]);
      setMensajes((prev) => [...prev, usuario, respuesta]);
      enCursoRef.current = true;
      setEnCurso(true);
      if (modo === "voz") setFaseVoz("pensando");

      const hablar = modo === "voz" || modoVozRef.current === "manos-libres";
      const rep = hablar ? obtenerReproductor() : null;
      let acumulado = "";

      try {
        await enviarChat(
          {
            mensajes: recientes.map((m) => ({
              rol: m.rol,
              texto:
                m.adjuntos?.length && m.rol === "user"
                  ? `${m.texto}\n[${t("asistente.adjuntoEn")}: ${m.adjuntos.map((a) => a.nombre).join(", ")}]`
                  : m.texto,
            })),
            contexto: {
              ...ctxPagina,
              perfil: perfilRef.current,
              recorrido: recorridoReciente(),
              resumenPrevio: resumen || undefined,
            },
            documentos,
            modo: hablar ? "voz" : "texto",
          },
          (ev) => {
            if (ev.t === "texto") {
              acumulado += ev.d;
              actualizarUltimo((m) => ({ ...m, texto: m.texto + ev.d }));
              rep?.empujar(ev.d);
              if (!abiertoRef.current) setBurbuja(acumulado.trim().slice(-160));
            } else if (ev.t === "tarjeta") {
              const tj: Tarjeta = ev.tarjeta;
              actualizarUltimo((m) => ({ ...m, tarjetas: [...(m.tarjetas ?? []), tj] }));
            } else if (ev.t === "cita") {
              const c: Cita = ev.cita;
              actualizarUltimo((m) => ({ ...m, citas: [...(m.citas ?? []), c] }));
            } else if (ev.t === "accion") {
              ejecutar(ev.accion);
            } else if (ev.t === "error") {
              actualizarUltimo((m) => ({ ...m, texto: m.texto ? `${m.texto}\n\n${ev.mensaje}` : ev.mensaje, error: !m.texto }));
              if (ev.codigo === "sin_clave") setEstado((e) => (e ? { ...e, chat: false } : e));
            }
          },
          ctrl.signal,
        );
        rep?.cerrar();
        if (!acumulado.trim()) actualizarUltimo((m) => (m.texto || m.tarjetas?.length ? m : { ...m, texto: t("asistente.error.generico"), error: true }));
        setAnuncio(acumulado.slice(0, 300));
        // Los documentos ya enviados se conservan para preguntas de seguimiento;
        // los extra (video de una analítica) no.
      } catch (err) {
        if (ctrl.signal.aborted) {
          actualizarUltimo((m) => (m.texto ? m : { ...m, texto: "…", error: true }));
        } else {
          if (err instanceof ErrorChat && err.codigo === "sin_clave") setEstado((e) => ({ ...(e ?? SIN_SERVICIOS), chat: false }));
          const msg = err instanceof ErrorChat ? err.message : t("asistente.error.red");
          actualizarUltimo((m) => ({ ...m, texto: msg, error: true }));
          rep?.detener();
          if (modoVozRef.current === "manos-libres") setFaseVoz("inactivo");
        }
      } finally {
        enCursoRef.current = false;
        setEnCurso(false);
        if (abortRef.current === ctrl) abortRef.current = null;
        if (!rep || rep.estado === "inactivo") {
          if (modoVozRef.current === "manos-libres" && rep) {
            window.setTimeout(() => escucharRef.current(), 400);
          } else if (modo === "voz") setFaseVoz("inactivo");
        }
        const v = videoPendiente.current;
        videoPendiente.current = null;
        if (v) window.setTimeout(() => analizarRef.current(v), 50);
      }
    },
    [docs, idioma, t, actualizarUltimo, ejecutar, obtenerReproductor],
  );

  const detener = useCallback(() => {
    abortRef.current?.abort();
    reproductor.current?.detener();
  }, []);

  /* ───────────── Video de una analítica ───────────── */

  const analizarVideoAnalitica = useCallback(
    async (id: string) => {
      const a = porIdAnalitica.get(id);
      if (!a?.video) return;
      setProcesando(t("asistente.extrayendo"));
      try {
        const doc = a.video.src
          ? await extraerFotogramas(a.video.src, `${a.nombre} — prueba real`, (h, n) => setProcesando(`${t("asistente.extrayendo")} ${h}/${n}`))
          : await imagenDesdeUrl(a.video.img ?? "", `${a.nombre} — prueba real.jpg`);
        setProcesando(null);
        await enviar(t("asistente.analizarVideoMsg").replace("{n}", a.nombre), modoVozRef.current === "manos-libres" ? "voz" : "texto", {
          docsExtra: [doc],
        });
      } catch {
        setProcesando(null);
        setAviso(t("asistente.error.video"));
      }
    },
    [enviar, t],
  );

  useEffect(() => {
    analizarRef.current = (id) => void analizarVideoAnalitica(id);
  }, [analizarVideoAnalitica]);

  /* ───────────── Voz: escucha manos libres ───────────── */

  const escuchar = useCallback(async () => {
    if (modoVozRef.current !== "manos-libres" || grabadora.current || enCursoRef.current) return;
    const g = new GrabadoraVoz(Boolean(estado?.voz.stt), idioma);
    grabadora.current = g;
    g.onParcial = (texto) => setSubtitulo({ rol: "user", texto });
    setSubtitulo(null);
    setFaseVoz("escuchando");
    const r = await g.escuchar(() => setFaseVoz("transcribiendo"));
    if (grabadora.current === g) grabadora.current = null;
    if (modoVozRef.current !== "manos-libres") return;
    if ("texto" in r) {
      void enviar(r.texto, "voz", { porVoz: true });
    } else if (r.error === "microfono") {
      setAviso(t("asistente.sinMicrofono"));
      modoVozRef.current = "apagado";
      setModoVoz("apagado");
      setFaseVoz("inactivo");
    } else if (r.error === "stt") {
      setAviso(t("asistente.sinVoz"));
      setFaseVoz("inactivo");
    } else {
      // Silencio o cancelado: el orbe queda en espera hasta que la persona toque.
      setFaseVoz("inactivo");
    }
  }, [estado, idioma, enviar, t]);

  useEffect(() => {
    escucharRef.current = () => void escuchar();
  }, [escuchar]);

  // Barge-in: mientras Ars habla en manos libres, hablar encima lo interrumpe.
  useEffect(() => {
    if (modoVoz !== "manos-libres" || faseVoz !== "hablando") {
      vigia.current?.detener();
      return;
    }
    const v = (vigia.current ??= new VigiaInterrupcion());
    void v.iniciar(() => {
      abortRef.current?.abort();
      reproductor.current?.detener();
    });
    return () => v.detener();
  }, [modoVoz, faseVoz]);

  const terminarTiempoReal = useCallback(async () => {
    await agente.current?.terminar();
    agente.current = null;
  }, []);

  const cambiarModoVoz = useCallback(
    async (m: ModoVoz) => {
      grabadora.current?.cancelar();
      grabadora.current = null;
      reproductor.current?.detener();
      vigia.current?.detener();
      await terminarTiempoReal();
      setAviso(null);
      setSubtitulo(null);
      modoVozRef.current = m;
      setModoVoz(m);
      setFaseVoz("inactivo");
      if (m === "manos-libres") {
        obtenerReproductor().desbloquear();
        const d = vozDisponible();
        if (!d.grabar && !d.reconocer) {
          setAviso(t("asistente.sinVoz"));
          modoVozRef.current = "apagado";
          setModoVoz("apagado");
          return;
        }
        void escuchar();
      } else if (m === "tiempo-real") {
        const a = new AgenteVoz();
        agente.current = a;
        const resumen = mensajesRef.current
          .slice(-8)
          .map((x) => `${x.rol === "user" ? "Persona" : "Ars"}: ${x.texto.slice(0, 200)}`)
          .join("\n");
        let parte = "";
        try {
          await a.iniciar(leerContexto(window.location.pathname, idioma), resumen, perfilRef.current, {
            onEstado: (e) => {
              if (e === "desconectado") {
                if (agente.current === a) {
                  agente.current = null;
                  modoVozRef.current = "apagado";
                  setModoVoz("apagado");
                }
                setFaseVoz("inactivo");
                setSubtitulo(null);
              } else {
                if (e === "escuchando") parte = "";
                setFaseVoz(e);
              }
            },
            onParte: (delta) => {
              parte += delta;
              setSubtitulo({ rol: "assistant", texto: parte.slice(-220) });
            },
            onMensaje: (rol, texto) => {
              if (rol === "user") setSubtitulo({ rol: "user", texto });
              setMensajes((prev) => [...prev, { id: uid(), rol, texto, porVoz: rol === "user" || undefined, ts: Date.now() }]);
            },
            onAccion: (acc) => {
              ejecutar(acc);
              if (acc.tipo === "abrir_contacto") {
                setMensajes((prev) => [
                  ...prev,
                  { id: uid(), rol: "assistant", texto: "", tarjetas: [{ tipo: "contacto", motivo: acc.motivo }], ts: Date.now() },
                ]);
              }
            },
            onError: (msg) => console.warn("[asistente/voz]", msg),
          });
        } catch (err) {
          agente.current = null;
          modoVozRef.current = "apagado";
          setModoVoz("apagado");
          setFaseVoz("inactivo");
          setAviso(err instanceof Error && err.message !== "voz-sesion" ? err.message : t("asistente.sinMicrofono"));
        }
      }
    },
    [escuchar, ejecutar, idioma, obtenerReproductor, t, terminarTiempoReal],
  );

  /** Toque sobre el orbe: interrumpe, corta la escucha o vuelve a escuchar. */
  const tocarOrbe = useCallback(() => {
    if (modoVoz !== "manos-libres") return;
    if (faseVoz === "hablando") {
      abortRef.current?.abort();
      reproductor.current?.detener();
    } else if (faseVoz === "escuchando") {
      grabadora.current?.terminar();
    } else if (faseVoz === "inactivo") {
      void escuchar();
    }
  }, [modoVoz, faseVoz, escuchar]);

  const nivelVoz = useCallback(() => {
    if (agente.current?.activo()) {
      return faseVoz === "hablando" ? agente.current.nivelSalida() : agente.current.nivelEntrada();
    }
    if (faseVoz === "hablando") return reproductor.current?.nivel() ?? 0;
    return grabadora.current?.nivel() ?? 0;
  }, [faseVoz]);

  // Limpieza al desmontar.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      grabadora.current?.cancelar();
      reproductor.current?.detener();
      vigia.current?.detener();
      void agente.current?.terminar();
    },
    [],
  );

  /* ───────────── Adjuntos ───────────── */

  const adjuntar = useCallback(
    async (archivos: FileList | File[]) => {
      setAviso(null);
      let actuales = docs.slice();
      for (const f of Array.from(archivos)) {
        const usados = actuales.reduce((n, d) => n + d.bytes, 0);
        try {
          if (f.type.startsWith("video/")) setProcesando(`${t("asistente.extrayendo")} ${f.name}`);
          const r = await prepararAdjunto(f, usados, actuales.length);
          setProcesando(null);
          if (typeof r === "string") {
            const clave: Record<typeof r, ClaveAsistente> = {
              tipo: "asistente.error.archivoTipo",
              grande: "asistente.error.archivoGrande",
              max: "asistente.error.archivoMax",
            };
            setAviso(`${f.name}: ${t(clave[r])}`);
            continue;
          }
          actuales = [...actuales, r];
        } catch {
          setProcesando(null);
          setAviso(`${f.name}: ${t(f.type.startsWith("video/") ? "asistente.error.video" : "asistente.error.generico")}`);
        }
      }
      setDocs(actuales);
    },
    [docs, t],
  );

  const quitarDoc = useCallback((id: string) => setDocs((d) => d.filter((x) => x.id !== id)), []);

  const nuevaConversacion = useCallback(() => {
    detener();
    setMensajes([]);
    setDocs([]);
    borrarHistorial();
  }, [detener]);

  const olvidar = useCallback((clave: ClavePerfil | "todo") => ejecutar({ tipo: "olvidar", clave }), [ejecutar]);

  /* ───────────── Apertura / atajos ───────────── */

  const abrir = useCallback(() => {
    setAbierto(true);
    setBurbuja(null);
  }, []);

  useEffect(() => {
    const alAbrir = (e: Event) => {
      const d = (e as CustomEvent<DetalleAbrir>).detail ?? {};
      abrir();
      if (d.voz) void cambiarModoVoz("manos-libres");
      else if (d.mensaje) window.setTimeout(() => void enviar(d.mensaje ?? ""), 50);
    };
    window.addEventListener(EVENTO_ABRIR, alAbrir);
    return () => window.removeEventListener(EVENTO_ABRIR, alAbrir);
  }, [abrir, cambiarModoVoz, enviar]);

  // «Pregúntale a Ars sobre esto» desde un módulo de /servicios.
  useEffect(() => {
    const alPreguntar = (e: Event) => {
      const d = (e as CustomEvent<DetallePreguntar>).detail;
      const texto = d?.texto?.trim();
      if (!texto) return;
      abrir();
      if (enCursoRef.current) abortRef.current?.abort();
      const inicio = Date.now();
      const intentar = () => {
        if (enCursoRef.current && Date.now() - inicio < 3000) {
          window.setTimeout(intentar, 100);
          return;
        }
        const modo = modoVozRef.current === "manos-libres" ? "voz" : "texto";
        void enviar(texto, modo, { moduloPregunta: d.modulo });
      };
      window.setTimeout(intentar, 50);
    };
    window.addEventListener(EVENTO_PREGUNTAR, alPreguntar);
    return () => window.removeEventListener(EVENTO_PREGUNTAR, alPreguntar);
  }, [abrir, enviar]);

  // Avisa al sitio cuando Ars habla (TTS o agente de voz) para atenuar la música ambiente.
  const hablando = faseVoz === "hablando";
  useEffect(() => {
    window.dispatchEvent(new CustomEvent<DetalleVozActiva>(EVENTO_VOZ_ACTIVA, { detail: { activa: hablando } }));
  }, [hablando]);

  /* ───────────── Bienvenida y sugerencias según la página ───────────── */

  const analiticaAbierta = pathname === "/vision" ? porIdAnalitica.get(ancla) : undefined;

  const bienvenida = useMemo(() => {
    const k: ClaveAsistente =
      pathname === "/vision"
        ? "asistente.bienvenida.vision"
        : pathname === "/plataforma"
          ? "asistente.bienvenida.plataforma"
          : pathname === "/proyectos"
            ? "asistente.bienvenida.proyectos"
            : pathname === "/laboratorio" || pathname === "/vision-lab"
              ? "asistente.bienvenida.laboratorio"
              : pathname === "/servicios" || pathname.startsWith("/servicios/")
                ? "asistente.bienvenida.servicios"
                : "asistente.bienvenida";
    return t(k);
  }, [pathname, t]);

  const sugerencias = useMemo<Sugerencia[]>(() => {
    const texto = (k: ClaveAsistente): Sugerencia => ({ texto: t(k), alElegir: () => void enviar(t(k)) });
    if (pathname === "/vision") {
      const lista: Sugerencia[] = [texto("asistente.sug.esta")];
      if (analiticaAbierta?.video) {
        lista.push({ texto: t("asistente.analizarVideo"), destacada: true, alElegir: () => void analizarVideoAnalitica(analiticaAbierta.id) });
      }
      lista.push(texto("asistente.sug.parecidas"), texto("asistente.sug.retail"), texto("asistente.sug.demo"));
      return lista;
    }
    if (pathname === "/plataforma") {
      return [texto("asistente.sug.modulos"), texto("asistente.sug.rondas"), texto("asistente.sug.tamano"), texto("asistente.sug.documento"), texto("asistente.sug.demo")];
    }
    if (pathname === "/proyectos") {
      return [texto("asistente.sug.ciudades"), texto("asistente.sug.retail"), texto("asistente.sug.queEs"), texto("asistente.sug.demo")];
    }
    if (pathname === "/servicios" || pathname.startsWith("/servicios/")) {
      const lista: Sugerencia[] = [];
      if (pathname !== "/servicios") lista.push(texto("asistente.sug.esteModulo"));
      lista.push(texto("asistente.sug.diaArs"), texto("asistente.sug.conecta"), texto("asistente.sug.tamano"), texto("asistente.sug.demo"));
      return lista;
    }
    if (pathname === "/laboratorio" || pathname === "/vision-lab") {
      return [texto("asistente.sug.probar"), texto("asistente.sug.analitica"), texto("asistente.sug.queEs")];
    }
    return [
      texto("asistente.sug.queEs"),
      texto("asistente.sug.tamano"),
      texto("asistente.sug.analitica"),
      texto("asistente.sug.plataforma"),
      texto("asistente.sug.documento"),
      texto("asistente.sug.demo"),
    ];
  }, [pathname, analiticaAbierta, t, enviar, analizarVideoAnalitica]);

  const bytesDocs = docs.reduce((n, d) => n + d.bytes, 0);

  return (
    <div data-asistente-raiz="" className="contents">
      <BotonFlotante
        abierto={abierto}
        alAbrir={abrir}
        burbuja={burbuja}
        alCerrarBurbuja={() => setBurbuja(null)}
        vozActiva={modoVoz !== "apagado"}
        faseVoz={faseVoz}
        nivel={nivelVoz}
      />
      {abierto && (
        <PanelAsistente
          alCerrar={() => setAbierto(false)}
          bienvenida={bienvenida}
          mensajes={mensajes}
          enCurso={enCurso}
          estado={estado}
          alEnviar={(txt) => void enviar(txt)}
          alDetener={detener}
          alNueva={nuevaConversacion}
          ejecutar={ejecutar}
          alEnlaceInterno={enlaceInterno}
          docs={docs.map((d) => ({
            id: d.id,
            nombre: d.nombre,
            detalle: d.codificacion === "fotogramas" ? `${d.fotogramas?.length ?? 0} fotogramas · ${formatoBytes(d.bytes)}` : formatoBytes(d.bytes),
            esVideo: d.codificacion === "fotogramas",
          }))}
          bytesDocs={bytesDocs}
          alAdjuntar={(f) => void adjuntar(f)}
          alQuitarDoc={quitarDoc}
          aviso={aviso}
          procesando={procesando}
          alCerrarAviso={() => setAviso(null)}
          sugerencias={sugerencias}
          perfil={perfil}
          alOlvidar={olvidar}
          modoVoz={modoVoz}
          faseVoz={faseVoz}
          nivelVoz={nivelVoz}
          subtitulo={subtitulo}
          alCambiarModoVoz={(m) => void cambiarModoVoz(m)}
          alTocarOrbe={tocarOrbe}
        />
      )}
      <p className="sr-only" aria-live="polite" role="status">
        {anuncio}
      </p>
    </div>
  );
}
