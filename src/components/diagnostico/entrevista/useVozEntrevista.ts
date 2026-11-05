"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { leerEstado } from "@/lib/asistente/cliente";
import { GrabadoraVoz, ReproductorVoz, VigiaInterrupcion, vozDisponible } from "@/lib/asistente/voz";
import type { OpcionesEnvio, Oyente } from "./useEntrevista";

export type FaseVoz = "apagado" | "conectando" | "escuchando" | "transcribiendo" | "pensando" | "hablando" | "pausa";

type Deps = {
  enviar: (texto: string, op?: OpcionesEnvio) => Promise<void>;
  escuchar: (o: Oyente | null, voz: boolean) => void;
  ocupado: boolean;
};

/**
 * Voz de la entrevista, sobre la infraestructura del asistente:
 * - dictar: micrófono → texto en el campo (Scribe de ElevenLabs o el
 *   reconocimiento del navegador si no hay clave);
 * - conversación: manos libres; Ars lee su respuesta (TTS) y vuelve a escuchar.
 */
export function useVozEntrevista({ enviar, escuchar, ocupado }: Deps) {
  const [soporte, setSoporte] = useState({ microfono: false, servidorStt: false, servidorTts: false });
  const [dictando, setDictando] = useState(false);
  const [parcial, setParcial] = useState("");
  const [fase, setFase] = useState<FaseVoz>("apagado");
  const [subtitulo, setSubtitulo] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  const grabadora = useRef<GrabadoraVoz | null>(null);
  const reproductor = useRef<ReproductorVoz | null>(null);
  const vigia = useRef<VigiaInterrupcion | null>(null);
  const activo = useRef(false);
  const escucharAlCallar = useRef(false);
  const sttServidor = useRef(false);
  const vacios = useRef(0);
  const ocupadoRef = useRef(ocupado);
  useEffect(() => {
    ocupadoRef.current = ocupado;
  }, [ocupado]);

  // Qué hay disponible: micrófono del navegador y claves de ElevenLabs en el servidor.
  useEffect(() => {
    let vivo = true;
    const v = vozDisponible();
    void leerEstado().then((e) => {
      if (!vivo) return;
      sttServidor.current = Boolean(e?.voz.stt);
      setSoporte({ microfono: v.grabar || v.reconocer, servidorStt: Boolean(e?.voz.stt), servidorTts: Boolean(e?.voz.tts) });
    });
    return () => {
      vivo = false;
    };
  }, []);

  /** Una intervención: si Scribe falla, reintenta con el reconocimiento del navegador. */
  const oir = useCallback(async (alParcial: (t: string) => void, alTranscribir?: () => void) => {
    const g = new GrabadoraVoz(sttServidor.current, "es");
    grabadora.current = g;
    g.onParcial = alParcial;
    let r = await g.escuchar(alTranscribir);
    if ("error" in r && r.error === "stt" && sttServidor.current && vozDisponible().reconocer) {
      sttServidor.current = false;
      const g2 = new GrabadoraVoz(false, "es");
      grabadora.current = g2;
      g2.onParcial = alParcial;
      r = await g2.escuchar(alTranscribir);
    }
    grabadora.current = null;
    return r;
  }, []);

  /* ───────────── Dictar ───────────── */

  const dictar = useCallback(
    async (base: string, alTexto: (t: string) => void) => {
      if (grabadora.current) {
        grabadora.current.terminar();
        return;
      }
      setAviso(null);
      setDictando(true);
      const pre = base.trim() ? `${base.trim()} ` : "";
      const r = await oir((t) => {
        setParcial(t);
        alTexto(pre + t);
      });
      setDictando(false);
      setParcial("");
      if ("texto" in r) alTexto(pre + r.texto);
      else if (r.error === "microfono") setAviso("No tengo acceso al micrófono. Revisa el permiso del navegador o escríbeme.");
      else if (r.error === "stt") setAviso("No pude reconocer la voz en este navegador. Puedes escribirme.");
      else if (r.error === "vacio") setAviso("No te escuché. Toca el micrófono y habla cuando quieras.");
    },
    [oir],
  );

  /* ───────────── Modo conversación ───────────── */

  const escucharTurno = useCallback(async () => {
    if (!activo.current || grabadora.current) return;
    vigia.current?.detener();
    setFase("escuchando");
    setParcial("");
    const r = await oir(
      (t) => activo.current && setParcial(t),
      () => activo.current && setFase("transcribiendo"),
    );
    if (!activo.current) return;
    if ("texto" in r) {
      vacios.current = 0;
      setParcial(r.texto);
      setFase("pensando");
      // Si Ars aún procesa (p. ej. un archivo), espera a que termine.
      while (ocupadoRef.current && activo.current) await new Promise((ok) => window.setTimeout(ok, 150));
      if (!activo.current) return;
      void enviar(r.texto, { fuente: "voz", voz: true });
    } else if (r.error === "microfono" || r.error === "stt") {
      setAviso(r.error === "microfono" ? "No tengo acceso al micrófono: seguimos por escrito." : "No pude reconocer la voz aquí: seguimos por escrito.");
      colgarRef.current();
    } else if (r.error === "vacio") {
      vacios.current++;
      if (vacios.current < 2) void escucharTurno();
      else setFase("pausa");
    }
  }, [enviar, oir]);

  const colgarRef = useRef<() => void>(() => undefined);

  const colgar = useCallback(() => {
    activo.current = false;
    escucharAlCallar.current = false;
    grabadora.current?.cancelar();
    grabadora.current = null;
    reproductor.current?.detener();
    vigia.current?.detener();
    escuchar(null, false);
    setFase("apagado");
    setParcial("");
    setSubtitulo("");
  }, [escuchar]);

  useEffect(() => {
    colgarRef.current = colgar;
  }, [colgar]);

  /** Empieza la conversación por voz (llamar dentro de un gesto: desbloquea el audio). */
  const conversar = useCallback(() => {
    if (activo.current) return;
    setAviso(null);
    activo.current = true;
    vacios.current = 0;
    const rep = (reproductor.current ??= new ReproductorVoz(soporte.servidorTts, "es"));
    rep.configurar(soporte.servidorTts, "es");
    rep.desbloquear();
    rep.onFrase = (f) => setSubtitulo(f);
    rep.onEstado = (e) => {
      if (!activo.current) return;
      if (e === "hablando") {
        setFase("hablando");
        // Si la persona habla encima, Ars se calla y escucha.
        const v = (vigia.current ??= new VigiaInterrupcion());
        void v.iniciar(() => {
          rep.detener();
          escucharAlCallar.current = false;
          void escucharTurno();
        });
      } else if (escucharAlCallar.current) {
        escucharAlCallar.current = false;
        vigia.current?.detener();
        void escucharTurno();
      }
    };
    escuchar(
      {
        alEmpezar: () => {
          setFase("pensando");
          setSubtitulo("");
        },
        alTexto: (d) => rep.empujar(d),
        alFin: (ok) => {
          if (!activo.current) return;
          rep.cerrar();
          if (!ok) return void setFase("pausa");
          if (rep.estado === "inactivo") void escucharTurno();
          else escucharAlCallar.current = true;
        },
      },
      true,
    );
    if (ocupadoRef.current) setFase("pensando");
    else void escucharTurno();
  }, [escuchar, escucharTurno, soporte.servidorTts]);

  /** Toque sobre el orbe: interrumpe a Ars, termina de escuchar o retoma tras una pausa. */
  const tocarOrbe = useCallback(() => {
    if (!activo.current) return;
    if (fase === "hablando") {
      reproductor.current?.detener();
      escucharAlCallar.current = false;
      void escucharTurno();
    } else if (fase === "escuchando") grabadora.current?.terminar();
    else if (fase === "pausa") {
      vacios.current = 0;
      void escucharTurno();
    }
  }, [fase, escucharTurno]);

  /** Nivel de audio 0..1 para la animación (entrada o salida según la fase). */
  const nivel = useCallback(() => {
    if (fase === "hablando") return reproductor.current?.nivel() ?? 0;
    return grabadora.current?.nivel() ?? 0;
  }, [fase]);

  useEffect(
    () => () => {
      activo.current = false;
      grabadora.current?.cancelar();
      reproductor.current?.detener();
      vigia.current?.detener();
    },
    [],
  );

  return {
    soporte,
    dictando,
    parcial,
    fase,
    subtitulo,
    aviso,
    cerrarAviso: () => setAviso(null),
    dictar,
    conversar,
    colgar,
    tocarOrbe,
    nivel,
  };
}
