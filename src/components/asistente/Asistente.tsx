"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { analiticas } from "@/data/analiticas";
import { prefiereMenosMovimiento, quitarHalo, resaltarElemento } from "@/lib/asistente/acciones";
import { extraerFotogramas, formatoBytes, imagenDesdeUrl, prepararAdjunto } from "@/lib/asistente/adjuntos";
import { borrarHistorial, cargarHistorial, enviarChat, ErrorChat, guardarHistorial, leerEstado } from "@/lib/asistente/cliente";
import { leerContexto, tituloSeccion, type PasoGuia } from "@/lib/asistente/contexto-pagina";
import { useTextosAsistente, type ClaveAsistente } from "@/lib/asistente/i18n";
import { borrarMemoria, cargarPerfil, guardarPerfil, partirHistorial, recorridoReciente, registrarPaso, type Perfil } from "@/lib/asistente/memoria";
import type { Accion, Cita, ClavePerfil, DocumentoAdjunto, EstadoServicios, MensajeChat, Tarjeta } from "@/lib/asistente/tipos";
import { LIMITES } from "@/lib/asistente/tipos";
import { GrabadoraVoz, ReproductorVoz, VigiaInterrupcion, vozDisponible } from "@/lib/asistente/voz";
import { AgenteVoz } from "@/lib/asistente/voz-agente";
import { BotonFlotante } from "./BotonFlotante";
import { ControlRecorrido } from "./guia/ControlRecorrido";
import { DURACION_ACOPLE, EstilosGuia } from "./guia/EstilosGuia";
import { HojaGuia } from "./guia/HojaGuia";
import { PistaSeccion } from "./guia/PistaSeccion";
import { CONSULTA_MOVIL, useMedia } from "./guia/useMedia";
import { useRecorrido } from "./guia/useRecorrido";
import { useSeguirSeccion } from "./guia/useSeguirSeccion";
import type { FaseVoz } from "./OrbeVoz";
import { PanelAsistente, type ModoVoz, type Subtitulo, type Sugerencia } from "./PanelAsistente";

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const porIdAnalitica = new Map(analiticas.map((a) => [a.id, a]));
const SIN_SERVICIOS: EstadoServicios = { chat: false, modelo: "", voz: { tts: false, stt: false, agente: false } };

/** Evento global para abrir el asistente desde cualquier parte del sitio. */
export const EVENTO_ABRIR = "ars:asistente";
export type DetalleAbrir = { mensaje?: string; voz?: boolean; recorrido?: boolean };

/** Texto plano de la última frase de Ars (para la hoja móvil). */
function ultimaFrase(texto: string): string {
  const plano = texto.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`#>]/g, "").replace(/\s+/g, " ").trim();
  return plano.length > 150 ? `…${plano.slice(-150).replace(/^\S*\s/, "")}` : plano;
}

const FASES_OCUPADAS = new Set<FaseVoz>(["conectando", "transcribiendo", "pensando", "hablando"]);

type OpcionesEnvio = { docsExtra?: DocumentoAdjunto[]; porVoz?: boolean };

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
  /** Modo guía: Ars se corre a un lado (columna en escritorio, hoja en móvil). */
  const [acoplado, setAcoplado] = useState(false);
  const [borrador, setBorrador] = useState("");
  const [rastro, setRastro] = useState<string | null>(null);
  const movil = useMedia(CONSULTA_MOVIL);

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
  const acopladoRef = useRef(false);
  const faseVozRef = useRef<FaseVoz>("inactivo");
  const borradorRef = useRef("");
  const subtituloRef = useRef<Subtitulo | null>(null);
  const rastroTimer = useRef(0);

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
    acopladoRef.current = acoplado;
    faseVozRef.current = faseVoz;
    borradorRef.current = borrador;
    subtituloRef.current = subtitulo;
  }, [abierto, acoplado, faseVoz, borrador, subtitulo]);

  /* ───────────── Modo guía: acompañar mientras navega ───────────── */

  /** Ars no se interrumpe si la persona escribe, o si Ars piensa o habla. */
  const ocupado = useCallback(
    () => enCursoRef.current || borradorRef.current.trim() !== "" || FASES_OCUPADAS.has(faseVozRef.current),
    [],
  );
  const seguir = useSeguirSeccion({ activo: abierto && acoplado, ocupado, ruta: pathname });

  /**
   * Acopla el panel a un lado para que la página quede a la vista. Devuelve
   * cuánto esperar antes de desplazar (lo que tarda la transición).
   */
  const acoplar = useCallback((): number => {
    const ya = abiertoRef.current && acopladoRef.current;
    abiertoRef.current = true;
    acopladoRef.current = true;
    setAbierto(true);
    setAcoplado(true);
    setBurbuja(null);
    return ya || prefiereMenosMovimiento() ? 0 : DURACION_ACOPLE + 120;
  }, []);

  const mostrarRastro = useCallback((texto: string) => {
    window.clearTimeout(rastroTimer.current);
    setRastro(texto);
    setAnuncio(texto);
    rastroTimer.current = window.setTimeout(() => setRastro(null), 4500);
  }, []);

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

  /**
   * Navegación con ancla: el router de Next se lleva mal con los hash entre
   * páginas, así que navegamos a la ruta y aplicamos el ancla al llegar.
   */
  const pendiente = useRef<{ ruta: string; ancla?: string; resaltar: string | null; retraso: number } | null>(null);
  const aplicarAncla = useCallback(
    (ruta: string, a: string | undefined, resaltar: string | null, retraso: number) => {
      if (a) {
        window.history.replaceState(window.history.state, "", `${ruta}#${a}`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
      if (resaltar) {
        seguir.marcar(resaltar);
        void resaltarElemento(resaltar, { retraso }).then((ok) => {
          const titulo = ok ? tituloSeccion(resaltar) : "";
          if (titulo) mostrarRastro(`${t("asistente.guia.llevando")} ${titulo}`);
        });
      } else window.scrollTo({ top: 0, behavior: prefiereMenosMovimiento() ? "auto" : "smooth" });
    },
    [seguir, mostrarRastro, t],
  );

  useEffect(() => {
    const p = pendiente.current;
    if (p && p.ruta === pathname) {
      pendiente.current = null;
      aplicarAncla(p.ruta, p.ancla, p.resaltar, p.retraso);
    }
  }, [pathname, aplicarAncla]);

  const navegar = useCallback(
    (ruta: string, a: string | undefined, resaltar: string | null, retraso = 0) => {
      if (ruta === window.location.pathname) aplicarAncla(ruta, a, resaltar, retraso);
      else {
        pendiente.current = { ruta, ancla: a, resaltar, retraso };
        mostrarRastro(`${t("asistente.guia.llevando")} ${ruta}`);
        router.push(ruta);
      }
    },
    [router, aplicarAncla, mostrarRastro, t],
  );

  const ejecutar = useCallback(
    (a: Accion) => {
      switch (a.tipo) {
        case "ir_a":
          navegar(a.ruta, a.ancla, a.ancla ?? null, acoplar());
          break;
        case "mostrar_analitica":
          navegar("/vision", a.id, "visor", acoplar());
          break;
        case "resaltar": {
          const retraso = acoplar();
          seguir.marcar(a.ancla);
          void resaltarElemento(a.ancla, { nota: a.nota ?? t("asistente.guia.resaltando"), retraso, duracion: 4200 });
          break;
        }
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
    [navegar, acoplar, seguir, t],
  );

  const iniciarRecorridoRef = useRef<() => void>(() => undefined);
  const enlaceInterno = useCallback(
    (href: string) => {
      const [ruta, a] = href.split("#");
      if (!ruta && a === "recorrido") iniciarRecorridoRef.current();
      else if (ruta === "/vision" && a) ejecutar({ tipo: "mostrar_analitica", id: a });
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
              ...leerContexto(window.location.pathname, idioma),
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

  /* ───────────── Recorrido guiado y narración ───────────── */

  /** Narra en voz una frase corta, sin pisar a la persona si está hablando. */
  const narrar = useCallback(
    (texto: string) => {
      if (modoVozRef.current !== "manos-libres" || enCursoRef.current) return;
      if (subtituloRef.current?.rol === "user" && faseVozRef.current === "escuchando") return;
      grabadora.current?.cancelar();
      grabadora.current = null;
      obtenerReproductor().decir(texto);
    },
    [obtenerReproductor],
  );

  const retrasoTour = useRef(0);
  const alPaso = useCallback(
    (paso: PasoGuia, i: number, n: number, duracion: number) => {
      seguir.marcar(paso.id);
      const etiqueta = t("asistente.recorrido.paso").replace("{n}", String(i + 1)).replace("{t}", String(n));
      void resaltarElemento(paso.id, { nota: `${etiqueta} · ${paso.titulo}`, duracion: duracion + 1500, retraso: retrasoTour.current });
      retrasoTour.current = 0;
      setAnuncio(`${etiqueta}: ${paso.titulo}`);
      const frase = `${paso.titulo}. ${paso.texto}`;
      narrar(i === 0 ? t("asistente.recorrido.inicioVoz").replace("{s}", frase) : frase);
    },
    [seguir, t, narrar],
  );
  const ocupadoTour = useCallback(() => enCursoRef.current || FASES_OCUPADAS.has(faseVozRef.current), []);
  const tour = useRecorrido({ ocupado: ocupadoTour, alPaso });

  const iniciarRecorrido = useCallback(() => {
    retrasoTour.current = acoplar();
    if (!tour.iniciar()) setAviso(t("asistente.recorrido.vacio"));
  }, [acoplar, tour, t]);
  useEffect(() => {
    iniciarRecorridoRef.current = iniciarRecorrido;
  }, [iniciarRecorrido]);

  // Al cambiar de página, el recorrido de la anterior ya no aplica.
  const salirTour = tour.salir;
  useEffect(() => {
    salirTour();
  }, [pathname, salirTour]);

  // Pista de sección en voz: una frase breve («Estás en…, ¿te la explico?»).
  const pista = seguir.pista;
  useEffect(() => {
    if (pista) narrar(t("asistente.guia.narrar").replace("{s}", pista.titulo));
  }, [pista, narrar, t]);

  const aceptarPista = useCallback(() => {
    if (!pista) return;
    seguir.descartar();
    void enviar(t("asistente.guia.pistaMsg").replace("{s}", pista.titulo), modoVozRef.current === "manos-libres" ? "voz" : "texto");
  }, [pista, seguir, enviar, t]);

  const masDetalle = useCallback(
    (titulo: string) => {
      tour.pausar();
      void enviar(t("asistente.recorrido.masDetalleMsg").replace("{s}", titulo), modoVozRef.current === "manos-libres" ? "voz" : "texto");
    },
    [tour, enviar, t],
  );

  // Limpieza al desmontar.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      grabadora.current?.cancelar();
      reproductor.current?.detener();
      vigia.current?.detener();
      void agente.current?.terminar();
      window.clearTimeout(rastroTimer.current);
      quitarHalo();
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
    setAcoplado(false);
    setBurbuja(null);
  }, []);

  const cerrar = useCallback(() => {
    setAbierto(false);
    setAcoplado(false);
    tour.salir();
  }, [tour]);

  useEffect(() => {
    const alAbrir = (e: Event) => {
      const d = (e as CustomEvent<DetalleAbrir>).detail ?? {};
      abrir();
      if (d.voz) void cambiarModoVoz("manos-libres");
      else if (d.recorrido) window.setTimeout(() => iniciarRecorridoRef.current(), 50);
      else if (d.mensaje) window.setTimeout(() => void enviar(d.mensaje ?? ""), 50);
    };
    window.addEventListener(EVENTO_ABRIR, alAbrir);
    return () => window.removeEventListener(EVENTO_ABRIR, alAbrir);
  }, [abrir, cambiarModoVoz, enviar]);

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
  const hoja = abierto && acoplado && movil;
  const ultimoArs = [...mensajes].reverse().find((m) => m.rol === "assistant" && m.texto.trim());
  const lineaHoja = modoVoz !== "apagado" && subtitulo ? subtitulo.texto : ultimaFrase(ultimoArs?.texto ?? "");
  const r = tour.recorrido;
  const pistaUI = pista && !r ? <PistaSeccion pista={pista} alAceptar={aceptarPista} alDescartar={seguir.descartar} compacta={hoja} /> : null;
  const controlTour = (compacto: boolean) =>
    r ? (
      <ControlRecorrido
        recorrido={r}
        alAnterior={tour.anterior}
        alSiguiente={tour.siguiente}
        alPausa={tour.alternarPausa}
        alSalir={tour.salir}
        alMasDetalle={masDetalle}
        compacto={compacto}
      />
    ) : null;

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
      <EstilosGuia acopladoEscritorio={abierto && acoplado && !movil} />
      {hoja && (
        <HojaGuia
          linea={lineaHoja}
          enCurso={enCurso}
          vozOn={modoVoz !== "apagado"}
          faseVoz={faseVoz}
          nivelVoz={nivelVoz}
          alExpandir={() => setAcoplado(false)}
          alCerrar={cerrar}
          alMic={() => void cambiarModoVoz(modoVoz === "apagado" ? "manos-libres" : "apagado")}
          arriba={pistaUI}
          recorrido={controlTour(true)}
        />
      )}
      {abierto && !hoja && (
        <PanelAsistente
          alCerrar={cerrar}
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
          acoplado={acoplado && !movil}
          alAcoplar={(a) => {
            if (a) acoplar();
            else setAcoplado(false);
          }}
          borrador={borrador}
          alBorrador={setBorrador}
          alIniciarRecorrido={iniciarRecorrido}
          recorridoActivo={Boolean(r)}
          rastro={rastro}
          guia={
            pistaUI || r ? (
              <>
                {controlTour(false)}
                {pistaUI}
              </>
            ) : undefined
          }
        />
      )}
      <p className="sr-only" aria-live="polite" role="status">
        {anuncio}
      </p>
    </div>
  );
}
