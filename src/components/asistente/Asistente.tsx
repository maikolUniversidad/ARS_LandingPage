"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { esMovil, resaltarElemento } from "@/lib/asistente/acciones";
import { formatoBytes, prepararAdjunto } from "@/lib/asistente/adjuntos";
import { borrarHistorial, cargarHistorial, enviarChat, ErrorChat, guardarHistorial, leerEstado } from "@/lib/asistente/cliente";
import { leerContexto } from "@/lib/asistente/contexto-pagina";
import { useTextosAsistente, type ClaveAsistente } from "@/lib/asistente/i18n";
import type { Accion, DocumentoAdjunto, EstadoServicios, MensajeChat, Tarjeta } from "@/lib/asistente/tipos";
import { LIMITES } from "@/lib/asistente/tipos";
import { GrabadoraVoz, ReproductorVoz, vozDisponible } from "@/lib/asistente/voz";
import { AgenteVoz } from "@/lib/asistente/voz-agente";
import { BotonFlotante } from "./BotonFlotante";
import type { FaseVoz } from "./OrbeVoz";
import { PanelAsistente, type ModoVoz } from "./PanelAsistente";

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Evento global para abrir el asistente desde cualquier parte del sitio. */
export const EVENTO_ABRIR = "ars:asistente";
export type DetalleAbrir = { mensaje?: string; voz?: boolean };

/**
 * Asistente de IA de ARS: botón flotante + panel. Vive en el layout raíz, así
 * que conserva la conversación al navegar (y la persiste en localStorage).
 */
export function Asistente() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { t, idioma } = useTextosAsistente();

  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>(() => (typeof window === "undefined" ? [] : cargarHistorial()));
  const [estado, setEstado] = useState<EstadoServicios | null>(null);
  const [enCurso, setEnCurso] = useState(false);
  const [docs, setDocs] = useState<DocumentoAdjunto[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [modoVoz, setModoVoz] = useState<ModoVoz>("apagado");
  const [faseVoz, setFaseVoz] = useState<FaseVoz>("inactivo");
  const [burbuja, setBurbuja] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const reproductor = useRef<ReproductorVoz | null>(null);
  const grabadora = useRef<GrabadoraVoz | null>(null);
  const agente = useRef<AgenteVoz | null>(null);
  const modoVozRef = useRef<ModoVoz>("apagado");
  const mensajesRef = useRef(mensajes);
  const abiertoRef = useRef(abierto);
  const escucharRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    mensajesRef.current = mensajes;
    guardarHistorial(mensajes);
  }, [mensajes]);
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
    void leerEstado().then((e) => setEstado(e ?? { chat: false, modelo: "", voz: { tts: false, stt: false, agente: false } }));
  }, [abierto]);

  // El agente de tiempo real se entera de cada cambio de página.
  useEffect(() => {
    if (agente.current?.activo()) {
      const id = window.setTimeout(() => agente.current?.contexto(leerContexto(pathname, idioma)), 600);
      return () => window.clearTimeout(id);
    }
  }, [pathname, idioma]);

  /* ───────────── Acciones sobre la web ───────────── */

  const cerrarEnMovil = useCallback(() => {
    if (esMovil()) setAbierto(false);
  }, []);

  /**
   * Navegación con ancla: el router de Next se lleva mal con los hash entre
   * páginas, así que navegamos a la ruta y aplicamos el ancla al llegar.
   */
  const pendiente = useRef<{ ruta: string; ancla?: string; resaltar: string | null } | null>(null);
  const aplicarAncla = useCallback((ruta: string, ancla: string | undefined, resaltar: string | null) => {
    if (ancla) {
      window.history.replaceState(window.history.state, "", `${ruta}#${ancla}`);
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
    (ruta: string, ancla: string | undefined, resaltar: string | null) => {
      if (ruta === window.location.pathname) aplicarAncla(ruta, ancla, resaltar);
      else {
        pendiente.current = { ruta, ancla, resaltar };
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
        case "resaltar":
          cerrarEnMovil();
          void resaltarElemento(a.ancla);
          break;
        case "abrir_contacto":
          setAbierto(true);
          break;
      }
    },
    [navegar, cerrarEnMovil],
  );

  const enlaceInterno = useCallback(
    (href: string) => {
      const [ruta, ancla] = href.split("#");
      if (ruta === "/vision" && ancla) ejecutar({ tipo: "mostrar_analitica", id: ancla });
      else ejecutar({ tipo: "ir_a", ruta: ruta || window.location.pathname, ancla });
    },
    [ejecutar],
  );

  /* ───────────── Voz ───────────── */

  const usarEleven = Boolean(estado?.voz.tts);
  const obtenerReproductor = useCallback(() => {
    if (!reproductor.current) {
      reproductor.current = new ReproductorVoz(usarEleven, idioma);
    }
    reproductor.current.configurar(usarEleven, idioma);
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
    async (texto: string, modo: "texto" | "voz" = "texto") => {
      const limpio = texto.trim();
      if (!limpio || enCurso) return;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setAviso(null);

      const usuario: MensajeChat = {
        id: uid(),
        rol: "user",
        texto: limpio.slice(0, LIMITES.mensajeCaracteres),
        adjuntos: docs.length ? docs.map((d) => ({ nombre: d.nombre, tipo: d.tipo, bytes: d.bytes })) : undefined,
        ts: Date.now(),
      };
      const respuesta: MensajeChat = { id: uid(), rol: "assistant", texto: "", tarjetas: [], ts: Date.now() };
      const historial = [...mensajesRef.current.filter((m) => !m.error && m.texto.trim()), usuario];
      setMensajes((prev) => [...prev, usuario, respuesta]);
      setEnCurso(true);
      if (modo === "voz") setFaseVoz("pensando");

      const hablar = modo === "voz" || modoVozRef.current === "manos-libres";
      const rep = hablar ? obtenerReproductor() : null;
      let acumulado = "";

      try {
        await enviarChat(
          {
            mensajes: historial.map((m) => ({
              rol: m.rol,
              texto: m.adjuntos?.length && m.rol === "user" ? `${m.texto}\n[${t("asistente.adjuntoEn")}: ${m.adjuntos.map((a) => a.nombre).join(", ")}]` : m.texto,
            })),
            contexto: leerContexto(window.location.pathname, idioma),
            documentos: docs,
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
        if (!acumulado.trim()) actualizarUltimo((m) => (m.texto ? m : { ...m, texto: t("asistente.error.generico"), error: true }));
        setAnuncio(acumulado.slice(0, 300));
      } catch (err) {
        if (ctrl.signal.aborted) {
          actualizarUltimo((m) => (m.texto ? m : { ...m, texto: "…", error: true }));
        } else {
          const sinClave = err instanceof ErrorChat && err.codigo === "sin_clave";
          if (sinClave) setEstado((e) => (e ? { ...e, chat: false } : { chat: false, modelo: "", voz: { tts: false, stt: false, agente: false } }));
          const msg = err instanceof ErrorChat ? err.message : t("asistente.error.red");
          actualizarUltimo((m) => ({ ...m, texto: msg, error: true }));
          rep?.detener();
          if (modoVozRef.current === "manos-libres") setFaseVoz("inactivo");
        }
      } finally {
        setEnCurso(false);
        if (abortRef.current === ctrl) abortRef.current = null;
        if (!rep || rep.estado === "inactivo") {
          if (modoVozRef.current === "manos-libres" && rep) {
            // Nada que decir (p. ej. error): seguimos escuchando.
            window.setTimeout(() => escucharRef.current(), 400);
          } else if (modo === "voz") setFaseVoz("inactivo");
        }
      }
    },
    [docs, enCurso, idioma, t, actualizarUltimo, ejecutar, obtenerReproductor],
  );

  const detener = useCallback(() => {
    abortRef.current?.abort();
    reproductor.current?.detener();
  }, []);

  /* ───────────── Escucha (manos libres) ───────────── */

  const escuchar = useCallback(async () => {
    if (modoVozRef.current !== "manos-libres") return;
    const g = new GrabadoraVoz(Boolean(estado?.voz.stt), idioma);
    grabadora.current = g;
    setFaseVoz("escuchando");
    const r = await g.escuchar(() => setFaseVoz("transcribiendo"));
    if (grabadora.current === g) grabadora.current = null;
    if (modoVozRef.current !== "manos-libres") return;
    if ("texto" in r) {
      void enviar(r.texto, "voz");
    } else if (r.error === "microfono") {
      setAviso(t("asistente.sinMicrofono"));
      setModoVoz("apagado");
      setFaseVoz("inactivo");
    } else if (r.error === "vacio") {
      // Silencio: dejamos el orbe en espera hasta que la persona toque.
      setFaseVoz("inactivo");
    } else if (r.error === "stt") {
      setAviso(t("asistente.sinVoz"));
      setFaseVoz("inactivo");
    } else setFaseVoz("inactivo");
  }, [estado, idioma, enviar, t]);

  useEffect(() => {
    escucharRef.current = () => void escuchar();
  }, [escuchar]);

  const terminarTiempoReal = useCallback(async () => {
    await agente.current?.terminar();
    agente.current = null;
  }, []);

  const cambiarModoVoz = useCallback(
    async (m: ModoVoz) => {
      grabadora.current?.cancelar();
      grabadora.current = null;
      reproductor.current?.detener();
      await terminarTiempoReal();
      setAviso(null);
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
        try {
          await a.iniciar(leerContexto(window.location.pathname, idioma), resumen, {
            onEstado: (e) => {
              if (e === "desconectado") {
                if (agente.current === a) {
                  agente.current = null;
                  modoVozRef.current = "apagado";
                  setModoVoz("apagado");
                }
                setFaseVoz("inactivo");
              } else setFaseVoz(e);
            },
            onMensaje: (rol, texto) =>
              setMensajes((prev) => [...prev, { id: uid(), rol, texto, ts: Date.now() }]),
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
      reproductor.current?.detener();
      void escuchar();
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
          const r = await prepararAdjunto(f, usados, actuales.length);
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
          setAviso(`${f.name}: ${t("asistente.error.generico")}`);
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

  const sugerencias = useMemo<ClaveAsistente[]>(() => {
    const base: ClaveAsistente[] = ["asistente.sug.queEs", "asistente.sug.tamano", "asistente.sug.analitica", "asistente.sug.plataforma", "asistente.sug.demo"];
    return pathname === "/" ? base : ["asistente.sug.estaPagina", ...base.slice(0, 4)];
  }, [pathname]);

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
          mensajes={mensajes}
          enCurso={enCurso}
          estado={estado}
          alEnviar={(txt) => void enviar(txt)}
          alDetener={detener}
          alNueva={nuevaConversacion}
          ejecutar={ejecutar}
          alEnlaceInterno={enlaceInterno}
          docs={docs.map((d) => ({ id: d.id, nombre: d.nombre, detalle: formatoBytes(d.bytes) }))}
          bytesDocs={bytesDocs}
          alAdjuntar={(f) => void adjuntar(f)}
          alQuitarDoc={quitarDoc}
          aviso={aviso}
          alCerrarAviso={() => setAviso(null)}
          sugerencias={sugerencias.map((k) => t(k))}
          modoVoz={modoVoz}
          faseVoz={faseVoz}
          nivelVoz={nivelVoz}
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
