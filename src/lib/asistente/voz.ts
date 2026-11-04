"use client";

import type { Idioma } from "./tipos";

/* ───────────────────────── Utilidades ───────────────────────── */

let ctxAudio: AudioContext | null = null;
function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctxAudio) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctxAudio = new C();
  }
  if (ctxAudio.state === "suspended") void ctxAudio.resume();
  return ctxAudio;
}

/** Nivel 0..1 (RMS) de un analizador. */
function nivelDe(an: AnalyserNode, buf: Uint8Array<ArrayBuffer>): number {
  an.getByteTimeDomainData(buf);
  let suma = 0;
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i] - 128) / 128;
    suma += v * v;
  }
  return Math.min(1, Math.sqrt(suma / buf.length) * 3);
}

/** Limpia Markdown/URLs para leer en voz alta. */
export function textoHablable(t: string): string {
  return t
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>|]/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ───────────────────────── Reproductor (TTS) ───────────────────────── */

type EstadoReproductor = "inactivo" | "hablando";

/**
 * Cola de frases → ElevenLabs TTS (vía /api/asistente/tts) con precarga de la
 * siguiente frase. Si ElevenLabs no está configurado, usa speechSynthesis.
 */
export class ReproductorVoz {
  private cola: string[] = [];
  private pendiente = "";
  private actual: HTMLAudioElement | null = null;
  private precarga: Promise<string | null> | null = null;
  private analizador: AnalyserNode | null = null;
  private buf: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(512));
  private trabajando = false;
  private generacion = 0;
  private urls = new Set<string>();
  estado: EstadoReproductor = "inactivo";
  onEstado?: (e: EstadoReproductor) => void;

  constructor(
    private usarElevenLabs: boolean,
    private idioma: Idioma,
  ) {}

  configurar(usarElevenLabs: boolean, idioma: Idioma) {
    this.usarElevenLabs = usarElevenLabs;
    this.idioma = idioma;
  }

  /** Desbloquea el audio en iOS/Safari: llamar dentro de un gesto del usuario. */
  desbloquear() {
    audioCtx();
  }

  /** Añade texto en streaming; se habla por frases completas. */
  empujar(fragmento: string) {
    this.pendiente += fragmento;
    const re = /[^.!?¿¡\n]*[.!?\n]+["”»)]?\s*/g;
    let m: RegExpExecArray | null;
    let corte = 0;
    while ((m = re.exec(this.pendiente)) && m[0]) {
      if (m.index + m[0].length - corte >= 2) {
        const frase = textoHablable(this.pendiente.slice(corte, m.index + m[0].length));
        if (frase.length > 1) this.cola.push(frase);
        corte = m.index + m[0].length;
      }
    }
    this.pendiente = this.pendiente.slice(corte);
    void this.procesar();
  }

  /** Cierra el texto: habla lo que quede. */
  cerrar() {
    const resto = textoHablable(this.pendiente);
    this.pendiente = "";
    if (resto.length > 1) this.cola.push(resto);
    void this.procesar();
  }

  decir(texto: string) {
    this.empujar(`${texto} `);
    this.cerrar();
  }

  detener() {
    this.generacion++;
    this.cola = [];
    this.pendiente = "";
    this.precarga = null;
    if (this.actual) {
      this.actual.pause();
      this.actual.src = "";
      this.actual = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    for (const u of this.urls) URL.revokeObjectURL(u);
    this.urls.clear();
    this.trabajando = false;
    this.cambiar("inactivo");
  }

  /** Nivel de salida 0..1 para la visualización. */
  nivel(): number {
    if (this.estado !== "hablando") return 0;
    if (this.analizador) return nivelDe(this.analizador, this.buf);
    // speechSynthesis no expone audio: pulso sintético.
    return 0.35 + 0.25 * Math.sin(performance.now() / 120);
  }

  private cambiar(e: EstadoReproductor) {
    if (this.estado !== e) {
      this.estado = e;
      this.onEstado?.(e);
    }
  }

  private async pedirAudio(texto: string): Promise<string | null> {
    try {
      const r = await fetch("/api/asistente/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, idioma: this.idioma }),
      });
      if (!r.ok) return null;
      const url = URL.createObjectURL(await r.blob());
      this.urls.add(url);
      return url;
    } catch {
      return null;
    }
  }

  private async procesar() {
    if (this.trabajando) return;
    this.trabajando = true;
    const gen = this.generacion;
    try {
      while (this.cola.length && gen === this.generacion) {
        const frase = this.cola.shift() as string;
        this.cambiar("hablando");
        if (this.usarElevenLabs) {
          const url = await (this.precarga ?? this.pedirAudio(frase));
          this.precarga = this.cola.length ? this.pedirAudio(this.cola[0]) : null;
          if (gen !== this.generacion) break;
          if (url) {
            await this.reproducir(url, gen);
            continue;
          }
          // Falló ElevenLabs: seguimos con la voz del navegador.
        }
        await this.hablarNavegador(frase, gen);
      }
    } finally {
      if (gen === this.generacion) {
        this.trabajando = false;
        if (!this.cola.length) this.cambiar("inactivo");
      }
    }
  }

  private reproducir(url: string, gen: number): Promise<void> {
    return new Promise((ok) => {
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      this.actual = audio;
      const ctx = audioCtx();
      if (ctx) {
        try {
          const src = ctx.createMediaElementSource(audio);
          const an = ctx.createAnalyser();
          an.fftSize = 512;
          src.connect(an);
          an.connect(ctx.destination);
          this.analizador = an;
        } catch {
          this.analizador = null;
        }
      }
      const fin = () => {
        URL.revokeObjectURL(url);
        this.urls.delete(url);
        if (this.actual === audio) this.actual = null;
        ok();
      };
      audio.onended = fin;
      audio.onerror = fin;
      audio.play().catch(fin);
      if (gen !== this.generacion) fin();
    });
  }

  private hablarNavegador(frase: string, gen: number): Promise<void> {
    return new Promise((ok) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || gen !== this.generacion) return ok();
      this.analizador = null;
      const u = new SpeechSynthesisUtterance(frase);
      u.lang = this.idioma === "en" ? "en-US" : "es-419";
      const voces = window.speechSynthesis.getVoices();
      const preferida =
        voces.find((v) => v.lang.toLowerCase().startsWith(this.idioma === "en" ? "en" : "es-") && /natural|online|google/i.test(v.name)) ??
        voces.find((v) => v.lang.toLowerCase().startsWith(this.idioma));
      if (preferida) u.voice = preferida;
      u.rate = 1.03;
      u.onend = () => ok();
      u.onerror = () => ok();
      window.speechSynthesis.speak(u);
    });
  }
}

/* ───────────────────────── Grabadora (STT) ───────────────────────── */

type Reconocimiento = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function claseReconocimiento(): (new () => Reconocimiento) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Reconocimiento; webkitSpeechRecognition?: new () => Reconocimiento };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function vozDisponible(): { grabar: boolean; reconocer: boolean; sintetizar: boolean } {
  if (typeof window === "undefined") return { grabar: false, reconocer: false, sintetizar: false };
  return {
    grabar: Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined",
    reconocer: claseReconocimiento() !== null,
    sintetizar: "speechSynthesis" in window,
  };
}

export type ResultadoEscucha = { texto: string } | { error: "microfono" | "vacio" | "stt" | "cancelado" };

/**
 * Escucha una intervención: graba con MediaRecorder y corta sola tras ~1.2 s de
 * silencio (o 30 s). Transcribe con ElevenLabs Scribe; si no está configurado,
 * usa el reconocimiento de voz del navegador.
 */
export class GrabadoraVoz {
  private stream: MediaStream | null = null;
  private rec: MediaRecorder | null = null;
  private reco: Reconocimiento | null = null;
  private analizador: AnalyserNode | null = null;
  private buf: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(512));
  private cancelado = false;
  private terminarYa: (() => void) | null = null;
  private nivelSintetico = 0;

  constructor(
    private usarElevenLabs: boolean,
    private idioma: Idioma,
  ) {}

  nivel(): number {
    if (this.analizador) return nivelDe(this.analizador, this.buf);
    return this.nivelSintetico;
  }

  /** Termina la escucha ya (el usuario volvió a tocar el botón). */
  terminar() {
    this.terminarYa?.();
  }

  cancelar() {
    this.cancelado = true;
    this.terminarYa?.();
    this.reco?.abort();
  }

  async escuchar(alTranscribir?: () => void): Promise<ResultadoEscucha> {
    this.cancelado = false;
    if (!this.usarElevenLabs || !vozDisponible().grabar) return this.escucharNavegador();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      return { error: "microfono" };
    }
    const ctx = audioCtx();
    if (ctx) {
      const src = ctx.createMediaStreamSource(this.stream);
      this.analizador = ctx.createAnalyser();
      this.analizador.fftSize = 512;
      src.connect(this.analizador);
    }
    const tipo = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t));
    this.rec = new MediaRecorder(this.stream, tipo ? { mimeType: tipo } : undefined);
    const trozos: Blob[] = [];
    this.rec.ondataavailable = (e) => e.data.size && trozos.push(e.data);

    await new Promise<void>((ok) => {
      const inicio = performance.now();
      let ultimaVoz = 0;
      let hablo = false;
      let raf = 0;
      const fin = () => {
        cancelAnimationFrame(raf);
        this.terminarYa = null;
        if (this.rec && this.rec.state !== "inactive") {
          this.rec.onstop = () => ok();
          this.rec.stop();
        } else ok();
      };
      this.terminarYa = fin;
      const vigilar = () => {
        const ahora = performance.now();
        const n = this.nivel();
        if (n > 0.08) {
          hablo = true;
          ultimaVoz = ahora;
        }
        const silencio = hablo && ahora - ultimaVoz > 1200;
        const sinVoz = !hablo && ahora - inicio > 8000;
        if (silencio || sinVoz || ahora - inicio > 30_000) return fin();
        raf = requestAnimationFrame(vigilar);
      };
      this.rec?.start(250);
      raf = requestAnimationFrame(vigilar);
    });

    this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.analizador = null;
    if (this.cancelado) return { error: "cancelado" };
    const blob = new Blob(trozos, { type: this.rec?.mimeType || "audio/webm" });
    if (blob.size < 2_000) return { error: "vacio" };

    alTranscribir?.();
    const form = new FormData();
    const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
    form.append("audio", blob, `voz.${ext}`);
    form.append("idioma", this.idioma);
    try {
      const r = await fetch("/api/asistente/stt", { method: "POST", body: form });
      const j = (await r.json()) as { ok: boolean; texto?: string };
      if (!r.ok || !j.ok) return { error: "stt" };
      return j.texto ? { texto: j.texto } : { error: "vacio" };
    } catch {
      return { error: "stt" };
    }
  }

  private escucharNavegador(): Promise<ResultadoEscucha> {
    const C = claseReconocimiento();
    if (!C) return Promise.resolve({ error: "stt" });
    return new Promise((ok) => {
      const reco = new C();
      this.reco = reco;
      reco.lang = this.idioma === "en" ? "en-US" : "es-419";
      reco.interimResults = true;
      reco.continuous = false;
      let texto = "";
      let pulso = 0;
      const anim = setInterval(() => {
        pulso += 0.4;
        this.nivelSintetico = 0.15 + Math.abs(Math.sin(pulso)) * 0.25;
      }, 60);
      reco.onresult = (e) => {
        texto = Array.from(e.results)
          .map((r) => r[0]?.transcript ?? "")
          .join(" ");
      };
      reco.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          clearInterval(anim);
          ok({ error: "microfono" });
        }
      };
      reco.onend = () => {
        clearInterval(anim);
        this.nivelSintetico = 0;
        this.reco = null;
        if (this.cancelado) return ok({ error: "cancelado" });
        ok(texto.trim() ? { texto: texto.trim() } : { error: "vacio" });
      };
      this.terminarYa = () => reco.stop();
      try {
        reco.start();
      } catch {
        clearInterval(anim);
        ok({ error: "stt" });
      }
    });
  }
}
