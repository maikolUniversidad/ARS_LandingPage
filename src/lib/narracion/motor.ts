/**
 * Motor de audio de la narración de Ars (solo cliente).
 *
 * Mezcla en Web Audio tres buses hacia un limitador maestro:
 *  - Voz: paso-alto 100 Hz → presencia +2.5 dB @ 3.2 kHz → compresor suave.
 *  - Música: camas en bucle (con fundido cruzado entre pistas) + capa de pulso,
 *    por un paso-bajo cuyo corte sigue el avance de la historia ("brillo").
 *    Baja sola (ducking) mientras Ars habla o mientras habla el asistente.
 *  - Efectos: transición, ping tonal y cierre.
 *
 * Cada archivo se nivela al decodificarlo (RMS objetivo por bus), así la mezcla
 * se mantiene pareja aunque las pistas vengan con sonoridades distintas.
 * Pensado para el celular: limitador maestro, sin graves que el parlante no da,
 * se suspende con la pestaña oculta y se desbloquea con el gesto del usuario.
 */

import { EVENTO_CONVERSACION, EVENTO_VOZ_ACTIVA } from "@/components/servicios/eventos";
import { IDS_PUENTE, MUSICA, urlNarracion } from "./contrato";

export type EstadoNarracion = {
  /** El navegador soporta Web Audio. */
  soportado: boolean;
  /** La experiencia sonora está sonando (ya hubo gesto y el audio arrancó). */
  encendido: boolean;
  /**
   * Viene encendida por defecto, pero el navegador aún no deja sonar: espera el
   * primer gesto de la persona (toque, clic o tecla) para arrancar.
   */
  esperandoGesto: boolean;
  /** Hay una conversación por voz con Ars en curso: la narración está en pausa. */
  conversando: boolean;
  voz: boolean;
  musica: boolean;
  /** Ars está narrando un clip ahora mismo. */
  hablando: boolean;
  /** id del clip en curso (o el último). */
  idActual: string | null;
  /** La persona pausó la narración (toque corto en el dock): la música sigue. */
  pausada: boolean;
  /** Capítulo (`data-narracion`) que está al frente de la pantalla. */
  seccion: string | null;
};

/** `encendido`: la persona la quiere encendida (sí por defecto; no solo si la apagó). */
type Prefs = { voz: boolean; musica: boolean; encendido: boolean };
type Sfx = "transicion" | "ping" | "cierre";

const CLAVE_PREFS = "ars:narracion";
const DWELL_MS = 650; // la sección debe quedarse en pantalla este tiempo antes de narrarla
const MUSICA_BASE = 0.55;
const MUSICA_BAJO_VOZ = 0.17;
const RMS_MUSICA = 0.075; // ≈ −22.5 dBFS
const RMS_VOZ = 0.13; // ≈ −17.7 dBFS
const RMS_SFX = 0.06;

function leerPrefs(): Prefs {
  try {
    const raw = window.localStorage.getItem(CLAVE_PREFS);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Prefs>;
      return { voz: p.voz !== false, musica: p.musica !== false, encendido: p.encendido !== false };
    }
  } catch {
    /* almacenamiento bloqueado */
  }
  // Encendida por defecto: arranca con el primer gesto de la persona.
  return { voz: true, musica: true, encendido: true };
}

function guardarPrefs(p: Prefs) {
  try {
    window.localStorage.setItem(CLAVE_PREFS, JSON.stringify(p));
  } catch {
    /* almacenamiento bloqueado */
  }
}

/** RMS aproximado (muestreado) de un buffer, para nivelarlo. */
function rms(buf: AudioBuffer) {
  let suma = 0;
  let n = 0;
  const paso = 32;
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < d.length; i += paso) {
      suma += d[i] * d[i];
      n++;
    }
  }
  return n ? Math.sqrt(suma / n) : 0;
}

type Cama = { src: string; nodo: AudioBufferSourceNode; gain: GainNode; pulso?: { nodo: AudioBufferSourceNode; gain: GainNode } };

class MotorNarracion {
  private ctx: AudioContext | null = null;
  private maestro!: GainNode;
  private busMusica!: GainNode;
  private filtroMusica!: BiquadFilterNode;
  private busVoz!: GainNode;
  private busSfx!: GainNode;
  private analizador!: AnalyserNode;
  private datosNivel = new Uint8Array(256);

  private buffers = new Map<string, Promise<{ buf: AudioBuffer; trim: number } | null>>();
  private cama: Cama | null = null;
  private escenaDeseada: { pista: string | null; pulso: string | null; dueno: number } = { pista: null, pulso: null, dueno: 0 };
  private nivelPulso = 0;
  private brillo = 0.3;

  private vozActual: { nodo: AudioBufferSourceNode; gain: GainNode; id: string; inicio: number; duracion: number } | null = null;
  private pendiente: { id: string; timer: number } | null = null;
  private enCola: { id: string; forzar: boolean } | null = null;
  private genVoz = 0;
  private asistenteHablando = false;
  private enConversacion = false;
  private arrancando = false;

  private prefs: Prefs = { voz: true, musica: true, encendido: true };
  private estado: EstadoNarracion = {
    soportado: false,
    encendido: false,
    esperandoGesto: false,
    conversando: false,
    voz: true,
    musica: true,
    hablando: false,
    idActual: null,
    pausada: false,
    seccion: null,
  };
  private oyentes = new Set<() => void>();
  private iniciado = false;
  private contadorDuenos = 0;

  // ───────────── Estado observable (useSyncExternalStore) ─────────────

  suscribir = (fn: () => void) => {
    this.iniciar();
    this.oyentes.add(fn);
    return () => this.oyentes.delete(fn);
  };
  obtener = () => this.estado;
  private static readonly ESTADO_SERVIDOR: EstadoNarracion = {
    soportado: false,
    encendido: false,
    esperandoGesto: false,
    conversando: false,
    voz: true,
    musica: true,
    hablando: false,
    idActual: null,
    pausada: false,
    seccion: null,
  };
  obtenerServidor = () => MotorNarracion.ESTADO_SERVIDOR;

  private emitir(parcial: Partial<EstadoNarracion>) {
    this.estado = { ...this.estado, ...parcial };
    this.oyentes.forEach((fn) => fn());
  }

  /**
   * Avance del clip que suena (para el subtítulo en vivo): id, segundos
   * transcurridos y duración. null si Ars no está narrando.
   */
  progresoVoz(): { id: string; transcurrido: number; duracion: number } | null {
    const v = this.vozActual;
    if (!v || !this.ctx) return null;
    return { id: v.id, transcurrido: Math.max(0, this.ctx.currentTime - v.inicio), duracion: v.duracion };
  }

  /** Nivel 0..1 de la voz (para animar el orbe). */
  nivel() {
    if (!this.ctx || !this.estado.hablando) return 0;
    this.analizador.getByteTimeDomainData(this.datosNivel);
    let max = 0;
    for (const v of this.datosNivel) max = Math.max(max, Math.abs(v - 128));
    return Math.min(1, max / 70);
  }

  private iniciar() {
    if (this.iniciado || typeof window === "undefined") return;
    this.iniciado = true;
    const soportado = "AudioContext" in window || "webkitAudioContext" in window;
    this.prefs = leerPrefs();
    // No arranca sola: el navegador exige un gesto para sonar. Queda «esperando
    // gesto» y el primer toque o tecla en la página la enciende.
    this.estado = {
      ...this.estado,
      soportado,
      voz: this.prefs.voz,
      musica: this.prefs.musica,
      esperandoGesto: soportado && this.prefs.encendido,
    };

    document.addEventListener("visibilitychange", () => {
      if (!this.ctx || !this.estado.encendido) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    });
    window.addEventListener(EVENTO_VOZ_ACTIVA, (e) => {
      this.asistenteHablando = Boolean(e.detail?.activa);
      if (this.asistenteHablando) this.callar();
      this.ajustarDucking();
    });
    window.addEventListener(EVENTO_CONVERSACION, (e) => {
      if (e.detail?.activa) this.pausarParaConversar();
      else this.retomarTrasConversar();
    });
  }

  /**
   * Al entrar: intenta sonar sin esperar un gesto. Chrome lo permite si el sitio
   * ya tiene «engagement» (visitas previas con interacción), Firefox/Safari si la
   * persona lo autorizó. Si el navegador lo bloquea, el contexto queda
   * suspendido y el primer gesto lo reanuda (`arrancarConGesto`).
   */
  async intentarArranqueAutomatico() {
    this.iniciar();
    if (!this.estado.esperandoGesto || this.estado.encendido) return;
    const politica = (navigator as Navigator & { getAutoplayPolicy?: (t: string) => string }).getAutoplayPolicy?.("audiocontext");
    if (politica === "disallowed") return;
    try {
      const ctx = this.crearContexto();
      if (ctx.state !== "running") await Promise.race([ctx.resume().catch(() => undefined), new Promise((r) => window.setTimeout(r, 600))]);
      // ¿Sonó? (y la persona no lo apagó mientras tanto)
      if ((ctx.state as AudioContextState) === "running" && this.prefs.encendido && !this.estado.encendido) this.encender();
    } catch {
      /* sin audio: queda esperando el gesto */
    }
  }

  /**
   * Arranque con el primer gesto: desbloquea el audio dentro del gesto y solo
   * enciende si el navegador de verdad dejó sonar (en el celular, soltar el dedo
   * tras un scroll no cuenta como gesto). Devuelve si arrancó.
   */
  async arrancarConGesto(): Promise<boolean> {
    this.iniciar();
    if (!this.estado.soportado || this.estado.encendido) return this.estado.encendido;
    if (this.arrancando) return false;
    this.arrancando = true;
    try {
      const ctx = this.crearContexto();
      const mudo = ctx.createBufferSource();
      mudo.buffer = ctx.createBuffer(1, 1, 22050);
      mudo.connect(ctx.destination);
      mudo.start();
      const resumido = ctx.resume().catch(() => undefined);
      await Promise.race([resumido, new Promise((r) => window.setTimeout(r, 450))]);
      if (ctx.state !== "running" || !this.prefs.encendido) return false;
      if (!this.estado.encendido) this.encender();
      return true;
    } finally {
      this.arrancando = false;
    }
  }

  /** La persona dijo «ahora no» antes de que arrancara: no insistir. */
  descartar() {
    this.iniciar();
    this.prefs = { ...this.prefs, encendido: false };
    guardarPrefs(this.prefs);
    this.emitir({ esperandoGesto: false });
  }

  /** Pausa la narración (no la música). Toque corto en el botón de Ars del dock. */
  pausar() {
    if (this.estado.pausada) return;
    this.callar();
    this.emitir({ pausada: true });
  }

  /** Reanuda la narración con el capítulo en pantalla. */
  reanudar() {
    if (!this.estado.pausada) return;
    this.emitir({ pausada: false });
    const id = this.idVisible ?? this.estado.idActual;
    if (id) this.narrar(id, { inmediato: true, forzar: true });
  }

  // ───────────── Conversación con Ars ─────────────

  /** Pausa la narración (sin olvidar la sección) mientras la persona habla con Ars. */
  pausarParaConversar() {
    if (this.enConversacion) return;
    this.enConversacion = true;
    this.callar();
    this.emitir({ conversando: true });
  }

  /** Terminó la conversación: frase puente corta y luego la sección en pantalla. */
  retomarTrasConversar() {
    if (!this.enConversacion) return;
    this.enConversacion = false;
    this.emitir({ conversando: false });
    this.ajustarDucking();
    if (!this.estado.encendido || !this.prefs.voz || this.estado.pausada) return;
    const puente = IDS_PUENTE[Math.floor(Math.random() * IDS_PUENTE.length)];
    const seccion = this.idVisible;
    window.setTimeout(() => {
      if (this.enConversacion || this.asistenteHablando || !this.estado.encendido) return;
      this.narrar(puente, { inmediato: true, forzar: true });
      if (seccion) this.enCola = { id: seccion, forzar: true };
    }, 600);
  }

  // ───────────── Grafo de audio ─────────────

  private crearContexto() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor({ latencyHint: "playback" });
    this.ctx = ctx;

    // iOS: que suene aunque el interruptor de silencio esté activo (Safari 16.4+).
    const sesion = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (sesion) {
      try {
        sesion.type = "playback";
      } catch {
        /* no soportado */
      }
    }

    const limitador = ctx.createDynamicsCompressor();
    limitador.threshold.value = -4;
    limitador.knee.value = 2;
    limitador.ratio.value = 20;
    limitador.attack.value = 0.002;
    limitador.release.value = 0.2;
    this.maestro = ctx.createGain();
    this.maestro.gain.value = 0;
    this.maestro.connect(limitador).connect(ctx.destination);

    // Música
    const celular = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
    const pasoAltoMusica = ctx.createBiquadFilter();
    pasoAltoMusica.type = "highpass";
    pasoAltoMusica.frequency.value = celular ? 80 : 35; // el parlante del celular no da graves: no gastar headroom
    this.filtroMusica = ctx.createBiquadFilter();
    this.filtroMusica.type = "lowpass";
    this.filtroMusica.Q.value = 0.5;
    this.filtroMusica.frequency.value = this.corte(this.brillo);
    this.busMusica = ctx.createGain();
    this.busMusica.gain.value = MUSICA_BASE;
    this.filtroMusica.connect(pasoAltoMusica).connect(this.busMusica).connect(this.maestro);

    // Voz
    const pasoAltoVoz = ctx.createBiquadFilter();
    pasoAltoVoz.type = "highpass";
    pasoAltoVoz.frequency.value = 100;
    const presencia = ctx.createBiquadFilter();
    presencia.type = "peaking";
    presencia.frequency.value = 3200;
    presencia.Q.value = 1;
    presencia.gain.value = 2.5;
    const compVoz = ctx.createDynamicsCompressor();
    compVoz.threshold.value = -22;
    compVoz.ratio.value = 3;
    compVoz.knee.value = 6;
    compVoz.attack.value = 0.005;
    compVoz.release.value = 0.15;
    this.busVoz = ctx.createGain();
    this.busVoz.gain.value = 1.15;
    this.analizador = ctx.createAnalyser();
    this.analizador.fftSize = 256;
    pasoAltoVoz.connect(presencia).connect(compVoz).connect(this.busVoz).connect(this.maestro);
    this.busVoz.connect(this.analizador);
    this.entradaVoz = pasoAltoVoz;

    // Efectos
    this.busSfx = ctx.createGain();
    this.busSfx.gain.value = 0.5;
    this.busSfx.connect(this.maestro);
    return ctx;
  }
  private entradaVoz!: AudioNode;

  private corte(brillo: number) {
    const b = Math.max(0, Math.min(1, brillo));
    return 700 * Math.pow(18000 / 700, b);
  }

  private cargar(src: string, rmsObjetivo: number) {
    let p = this.buffers.get(src);
    if (!p) {
      const ctx = this.crearContexto();
      p = fetch(src)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => {
          const r = rms(buf);
          return { buf, trim: r > 0 ? Math.min(4, rmsObjetivo / r) : 1 };
        })
        .catch(() => null);
      this.buffers.set(src, p);
    }
    return p;
  }

  // ───────────── Encendido ─────────────

  /** Debe llamarse dentro de un gesto (click/tap). */
  encender(opciones?: { voz?: boolean; musica?: boolean }) {
    this.iniciar();
    if (!this.estado.soportado) return;
    const ctx = this.crearContexto();
    // Desbloqueo explícito para iOS: un buffer mudo dentro del gesto.
    const mudo = ctx.createBufferSource();
    mudo.buffer = ctx.createBuffer(1, 1, 22050);
    mudo.connect(ctx.destination);
    mudo.start();
    void ctx.resume();

    this.prefs = {
      voz: opciones?.voz ?? this.prefs.voz,
      musica: opciones?.musica ?? this.prefs.musica,
      encendido: true,
    };
    guardarPrefs(this.prefs);
    const t = ctx.currentTime;
    this.maestro.gain.cancelScheduledValues(t);
    this.maestro.gain.setTargetAtTime(1, t, 0.25);
    this.emitir({ encendido: true, esperandoGesto: false, voz: this.prefs.voz, musica: this.prefs.musica });
    this.aplicarEscena();
    // Narra lo que esté en pantalla ahora mismo.
    if (this.prefs.voz && this.idVisible) this.narrar(this.idVisible, { inmediato: true, forzar: true });
  }

  apagar() {
    this.prefs = { ...this.prefs, encendido: false };
    guardarPrefs(this.prefs);
    this.callar();
    this.emitir({ encendido: false, esperandoGesto: false, pausada: false });
    const ctx = this.ctx;
    if (!ctx) return;
    this.maestro.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    window.setTimeout(() => {
      if (!this.estado.encendido) {
        this.detenerCama(0);
        void ctx.suspend();
      }
    }, 900);
  }

  setVoz(on: boolean) {
    this.prefs = { ...this.prefs, voz: on };
    guardarPrefs(this.prefs);
    this.emitir({ voz: on });
    if (!on) this.callar();
    else if (this.idVisible) this.narrar(this.idVisible, { inmediato: true, forzar: true });
  }

  setMusica(on: boolean) {
    this.prefs = { ...this.prefs, musica: on };
    guardarPrefs(this.prefs);
    this.emitir({ musica: on });
    this.aplicarEscena();
  }

  // ───────────── Música ─────────────

  /** Declara la cama musical de la página. Devuelve una función para liberarla. */
  escena(pista: string | null, pulso: string | null = null) {
    this.iniciar();
    const dueno = ++this.contadorDuenos;
    this.escenaDeseada = { pista, pulso, dueno };
    this.nivelPulso = 0;
    this.aplicarEscena();
    return () => {
      if (this.escenaDeseada.dueno !== dueno) return;
      this.escenaDeseada = { pista: null, pulso: null, dueno: 0 };
      this.aplicarEscena();
    };
  }

  /** Parámetros reactivos de la música (0..1). Barato: se puede llamar en cada scroll. */
  parametros({ brillo, pulso }: { brillo?: number; pulso?: number }) {
    if (brillo !== undefined) this.brillo = brillo;
    if (pulso !== undefined) this.nivelPulso = Math.max(0, Math.min(1, pulso));
    const ctx = this.ctx;
    if (!ctx || !this.estado.encendido) return;
    const t = ctx.currentTime;
    if (brillo !== undefined) this.filtroMusica.frequency.setTargetAtTime(this.corte(brillo), t, 0.35);
    if (pulso !== undefined && this.cama?.pulso) {
      this.cama.pulso.gain.gain.setTargetAtTime(this.nivelPulso * (this.trimPulso ?? 1), t, 0.6);
    }
  }
  private trimPulso: number | null = null;

  private aplicarEscena() {
    const ctx = this.ctx;
    if (!ctx || !this.estado.encendido) return;
    const { pista, pulso } = this.escenaDeseada;
    const quiere = this.prefs.musica ? pista : null;
    if ((this.cama?.src ?? null) === quiere) return;
    this.detenerCama(2.2);
    if (!quiere) return;
    const deseada = this.escenaDeseada;
    void Promise.all([this.cargar(quiere, RMS_MUSICA), pulso ? this.cargar(pulso, RMS_MUSICA * 0.8) : Promise.resolve(null)]).then(
      ([cama, capa]) => {
        // ¿Sigue siendo la escena pedida y no arrancó otra mientras cargaba?
        if (!cama || this.escenaDeseada !== deseada || !this.estado.encendido || !this.prefs.musica || this.cama) return;
        const t = ctx.currentTime + 0.05;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(cama.trim, t + 2.2);
        gain.connect(this.filtroMusica);
        const nodo = ctx.createBufferSource();
        nodo.buffer = cama.buf;
        nodo.loop = true;
        nodo.connect(gain);
        nodo.start(t);
        const nueva: Cama = { src: quiere, nodo, gain };
        if (capa) {
          const g = ctx.createGain();
          this.trimPulso = capa.trim;
          g.gain.setValueAtTime(this.nivelPulso * capa.trim, t);
          g.connect(this.filtroMusica);
          const n = ctx.createBufferSource();
          n.buffer = capa.buf;
          n.loop = true;
          n.connect(g);
          n.start(t); // mismo instante: quedan en fase
          nueva.pulso = { nodo: n, gain: g };
        }
        this.cama = nueva;
        this.filtroMusica.frequency.setTargetAtTime(this.corte(this.brillo), t, 0.35);
        this.ajustarDucking();
      }
    );
  }

  private detenerCama(seg: number) {
    const c = this.cama;
    const ctx = this.ctx;
    this.cama = null;
    this.trimPulso = null;
    if (!c || !ctx) return;
    const t = ctx.currentTime;
    for (const { nodo, gain } of [c, ...(c.pulso ? [c.pulso] : [])]) {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + Math.max(0.02, seg));
      nodo.stop(t + seg + 0.1);
    }
  }

  private ajustarDucking() {
    const ctx = this.ctx;
    if (!ctx) return;
    const abajo = this.estado.hablando || this.asistenteHablando || this.enConversacion;
    const t = ctx.currentTime;
    this.busMusica.gain.cancelScheduledValues(t);
    // Baja rápido al hablar; sube despacio cuando termina.
    this.busMusica.gain.setTargetAtTime(abajo ? MUSICA_BAJO_VOZ : MUSICA_BASE, t, abajo ? 0.12 : 0.6);
  }

  // ───────────── Efectos ─────────────

  sfx(nombre: Sfx, { semitonos = 0, volumen = 1 }: { semitonos?: number; volumen?: number } = {}) {
    const ctx = this.ctx;
    if (!ctx || !this.estado.encendido || !this.prefs.musica || document.hidden) return;
    void this.cargar(MUSICA[nombre], RMS_SFX).then((s) => {
      if (!s || !this.estado.encendido) return;
      const g = ctx.createGain();
      g.gain.value = s.trim * volumen * (this.estado.hablando ? 0.5 : 1);
      g.connect(this.busSfx);
      const n = ctx.createBufferSource();
      n.buffer = s.buf;
      n.playbackRate.value = Math.pow(2, semitonos / 12);
      n.connect(g);
      n.start();
    });
  }

  // ───────────── Voz ─────────────

  /** Último capítulo visible (aunque la voz esté apagada), para narrarlo al encender. */
  private idVisible: string | null = null;
  private narrados = new Map<string, number>();

  /** La sección `id` quedó al frente de la pantalla. */
  seccionVisible(id: string) {
    this.idVisible = id;
    if (this.estado.seccion !== id) this.emitir({ seccion: id });
    this.narrar(id);
  }

  /**
   * Narra el clip `id`. Por defecto espera a que la sección se quede en pantalla
   * (DWELL_MS) y corta lo que esté sonando. Con `cola`, espera a que termine.
   */
  narrar(id: string, opciones: { cola?: boolean; inmediato?: boolean; forzar?: boolean } = {}) {
    if (!this.estado.encendido || !this.prefs.voz || this.asistenteHablando || this.enConversacion || this.estado.pausada) return;
    // No repetir el mismo clip si se narró hace poco (scroll de ida y vuelta).
    const ultima = this.narrados.get(id);
    if (!opciones.forzar && ultima && Date.now() - ultima < 90_000) return;
    if (this.vozActual?.id === id || this.pendiente?.id === id) return;

    if (opciones.cola && this.vozActual) {
      this.enCola = { id, forzar: Boolean(opciones.forzar) };
      return;
    }
    if (this.pendiente) window.clearTimeout(this.pendiente.timer);
    const timer = window.setTimeout(() => {
      this.pendiente = null;
      void this.reproducir(id);
    }, opciones.inmediato ? 0 : DWELL_MS);
    this.pendiente = { id, timer };
  }

  private async reproducir(id: string) {
    const ctx = this.ctx;
    if (!ctx) return;
    const gen = ++this.genVoz;
    const clip = await this.cargar(urlNarracion(id), RMS_VOZ);
    if (gen !== this.genVoz || !this.estado.encendido || !this.prefs.voz || this.asistenteHablando || this.enConversacion || this.estado.pausada) return;
    if (!clip) {
      // Clip faltante: que no trabe la cola (p. ej. la frase puente antes de la sección).
      const s = this.enCola;
      this.enCola = null;
      if (s) this.narrar(s.id, { inmediato: true, forzar: s.forzar });
      return;
    }
    this.cortarVoz(0.18);
    const t = ctx.currentTime + 0.05;
    const gain = ctx.createGain();
    gain.gain.value = clip.trim;
    gain.connect(this.entradaVoz);
    const nodo = ctx.createBufferSource();
    nodo.buffer = clip.buf;
    nodo.connect(gain);
    nodo.onended = () => {
      if (this.vozActual?.nodo !== nodo) return;
      this.vozActual = null;
      this.emitir({ hablando: false });
      this.ajustarDucking();
      const siguiente = this.enCola;
      this.enCola = null;
      if (siguiente) window.setTimeout(() => this.narrar(siguiente.id, { inmediato: true, forzar: siguiente.forzar }), 350);
    };
    nodo.start(t);
    this.vozActual = { nodo, gain, id, inicio: t, duracion: clip.buf.duration };
    this.narrados.set(id, Date.now());
    this.emitir({ hablando: true, idActual: id });
    this.ajustarDucking();
  }

  private cortarVoz(seg: number) {
    const v = this.vozActual;
    const ctx = this.ctx;
    this.vozActual = null;
    if (!v || !ctx) return;
    const t = ctx.currentTime;
    v.gain.gain.setTargetAtTime(0, t, seg / 3);
    v.nodo.onended = null;
    v.nodo.stop(t + seg + 0.05);
  }

  /** Detiene la voz (y lo pendiente) sin tocar la música. */
  callar() {
    this.genVoz++;
    if (this.pendiente) window.clearTimeout(this.pendiente.timer);
    this.pendiente = null;
    this.enCola = null;
    this.cortarVoz(0.25);
    if (this.estado.hablando) this.emitir({ hablando: false });
    this.ajustarDucking();
  }

  /** Vuelve a narrar el capítulo actual. */
  repetir() {
    const id = this.estado.idActual ?? this.idVisible;
    if (id) this.narrar(id, { inmediato: true, forzar: true });
  }
}

export const motorNarracion = new MotorNarracion();
