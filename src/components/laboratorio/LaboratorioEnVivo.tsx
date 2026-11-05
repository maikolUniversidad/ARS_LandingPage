"use client";

import { Camera, CameraOff, Download, Film, RotateCcw, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiveAIOverlay, type LiveStats } from "@/components/LiveAIOverlay";
import { aiCapabilities } from "@/data/ai-capabilities";
import { capturarCuadro, marcaTiempo } from "./captura";
import { PanelVivo, type Evento } from "./PanelVivo";
import { SelectorModelos, type Filtro } from "./SelectorModelos";
import { TEXTOS, type ErrorCamara, type TextosLab } from "./textos";
import { soporteCamara, useCamara, type FaseCamara } from "./useCamara";
import css from "./laboratorio.module.css";

type Fuente = "camara" | "muestra" | "archivo";

/** Clip real sin detecciones quemadas: personas entrando y saliendo de un edificio. */
const VIDEO_MUESTRA = "/analiticas-3d/evidencia-publica/operativo/blancas.mp4";
const POSTER_MUESTRA = "/analiticas-3d/evidencia-publica/operativo/blancas-poster.jpg";
const MAX_BYTES = 500 * 1024 * 1024;

const ETIQUETA_ES: Record<string, string> = {
  person: "persona",
  "person · fall": "persona caída",
  car: "auto",
  motorcycle: "moto",
  truck: "camión",
  bus: "bus",
  bicycle: "bicicleta",
  pistol: "pistola",
  rifle: "fusil",
  fire: "fuego",
  smoke: "humo",
};

const hhmmss = () => marcaTiempo().slice(11);

type Props = { isES: boolean };

export function LaboratorioEnVivo({ isES }: Props) {
  const t: TextosLab = isES ? TEXTOS.es : TEXTOS.en;
  const [modeloId, setModeloId] = useState(aiCapabilities[0].id);
  const [filtro, setFiltro] = useState<Filtro>("ALL");
  const [fuente, setFuente] = useState<Fuente>("camara");
  const [aviso, setAviso] = useState<ErrorCamara | null>(null);
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [serie, setSerie] = useState<number[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [archivo, setArchivo] = useState<{ url: string; nombre: string } | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [flash, setFlash] = useState(0);
  const [reloj, setReloj] = useState("");

  const modelo = aiCapabilities.find((c) => c.id === modeloId) ?? aiCapabilities[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  const escenarioRef = useRef<HTMLDivElement>(null);
  const lienzoRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const eventoId = useRef(0);
  /** labels: etiqueta → último instante en que se vio. */
  const previoRef = useRef<{ labels: Map<string, number>; alarm: string | null; ultimo: Map<string, number> }>({
    labels: new Map(),
    alarm: null,
    ultimo: new Map(),
  });

  const registrar = useCallback((texto: string, tipo: Evento["tipo"] = "info") => {
    const ahora = performance.now();
    const ult = previoRef.current.ultimo.get(texto) ?? -Infinity;
    if (ahora - ult < 4000) return; // no repetir el mismo evento en ráfaga
    previoRef.current.ultimo.set(texto, ahora);
    eventoId.current += 1;
    const ev = { id: eventoId.current, hora: hhmmss(), texto, tipo };
    setEventos((l) => [ev, ...l].slice(0, 7));
  }, []);

  const reiniciarTelemetria = useCallback(() => {
    setStats(null);
    setSerie([]);
    previoRef.current.labels = new Map();
    previoRef.current.alarm = null;
  }, []);

  // ── Cámara ──
  const alFallar = useCallback(
    (e: ErrorCamara) => {
      setAviso(e);
      setFuente("muestra");
      reiniciarTelemetria();
    },
    [reiniciarTelemetria]
  );
  const cam = useCamara({ videoRef, contenedorRef: escenarioRef, habilitada: fuente === "camara", onFallo: alFallar });

  // Sin contexto seguro / sin API de cámara: directo a la muestra, con aviso.
  useEffect(() => {
    const pre = soporteCamara();
    if (!pre) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- diagnóstico único del navegador tras montar
    setAviso(pre);
    setFuente("muestra");
  }, []);

  // Reloj del HUD.
  useEffect(() => {
    const tick = () => setReloj(marcaTiempo());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Liberar el blob del video subido.
  useEffect(() => () => {
    if (archivo) URL.revokeObjectURL(archivo.url);
  }, [archivo]);

  const activo =
    (fuente === "camara" && cam.fase === "viva") || fuente === "muestra" || (fuente === "archivo" && !!archivo);
  const objectFit = fuente === "archivo" ? "contain" : "cover";

  const onStats = useCallback(
    (s: LiveStats) => {
      setStats(s);
      setSerie((l) => [...l, s.count].slice(-40));
      // Presencia con histéresis: una etiqueta "sale" solo tras 2,5 s sin verse,
      // para que el parpadeo normal de un detector no llene el registro.
      const prev = previoRef.current;
      const t0 = performance.now();
      const nombre = (l: string) => (isES ? (ETIQUETA_ES[l] ?? l) : l);
      for (const { label } of s.labels) {
        if (!prev.labels.has(label)) registrar(t.evEntra(nombre(label)));
        prev.labels.set(label, t0);
      }
      for (const [l, visto] of prev.labels) {
        if (t0 - visto > 2500) {
          prev.labels.delete(l);
          registrar(t.evSale(nombre(l)));
        }
      }
      if (s.alarm && s.alarm !== prev.alarm) registrar(t.evAlarma(s.alarm), "alarma");
      prev.alarm = s.alarm;
    },
    [isES, registrar, t]
  );

  // ── Acciones ──
  function elegirModelo(id: string) {
    if (id === modeloId) return;
    const m = aiCapabilities.find((c) => c.id === id);
    setModeloId(id);
    reiniciarTelemetria();
    if (m) registrar(t.evModelo(m.name));
  }

  function cambiarFuente(f: Fuente) {
    if (f === fuente && f !== "archivo") return;
    reiniciarTelemetria();
    if (f === "archivo" && !archivo) inputRef.current?.click();
    setFuente(f);
    if (f === "camara") {
      setAviso(null);
      void cam.iniciar(); // gesto del usuario → el navegador puede mostrar el diálogo
    }
  }

  function reintentar() {
    setAviso(null);
    reiniciarTelemetria();
    setFuente("camara");
    void cam.iniciar();
  }

  function cargarArchivo(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("video/")) return setErrorArchivo(t.subirNoVideo);
    if (file.size > MAX_BYTES) return setErrorArchivo(t.subirGrande);
    setErrorArchivo(null);
    reiniciarTelemetria();
    setArchivo({ url: URL.createObjectURL(file), nombre: file.name });
    setFuente("archivo");
  }

  async function capturar() {
    const v = videoRef.current;
    const el = escenarioRef.current;
    if (!v || !el) return;
    const r = el.getBoundingClientRect();
    const lienzo = lienzoRef.current?.getBoundingClientRect() ?? r;
    const cuando = marcaTiempo();
    const ok = await capturarCuadro({
      video: v,
      overlay: el.querySelector("canvas"),
      ancho: r.width,
      alto: r.height,
      contenido: { w: lienzo.width, h: lienzo.height },
      objectFit,
      sello: `ARS INTELLIGENCE · LABORATORIO · ${modelo.name.toUpperCase()} · ${cuando} · ${stats?.count ?? 0} DET`,
      archivo: `ars-laboratorio-${modelo.id}-${cuando.replace(/[: ]/g, "-")}.png`,
    });
    if (ok) {
      setFlash((n) => n + 1);
      registrar(t.evCaptura);
    }
  }

  const cargando = activo && (!stats || stats.status === "loading");
  const errorModelo = activo && stats?.status === "error";

  return (
    <div>
      <section data-narracion="laboratorio/modelos" className="mt-10">
        <SelectorModelos
          t={t}
          isES={isES}
          seleccionado={modeloId}
          filtro={filtro}
          onFiltro={setFiltro}
          onElegir={elegirModelo}
        />
      </section>

      <section id="demo-stage" data-narracion="laboratorio/demo" className="mt-6 scroll-mt-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            {/* Fuente */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex w-full sm:w-auto" role="tablist" aria-label="Fuente de video">
                {(
                  [
                    { id: "camara", label: t.fuenteCamara, Icono: Camera },
                    { id: "muestra", label: t.fuenteMuestra, Icono: Film },
                    { id: "archivo", label: t.fuenteArchivo, Icono: Upload },
                  ] as const
                ).map(({ id, label, Icono }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={fuente === id}
                    onClick={() => cambiarFuente(id)}
                    className={`flex flex-1 items-center justify-center gap-2 border-y border-r border-border/60 px-2 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition-colors first:border-l sm:flex-none sm:px-4 sm:text-[10px] sm:tracking-[0.18em] ${
                      fuente === id ? "bg-accent/25 text-foreground" : "bg-background/40 text-foreground/55 hover:bg-secondary"
                    }`}
                  >
                    <Icono className="size-3.5" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
              <div className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/45 sm:block">
                ARS · {modelo.demoType.toUpperCase()}
              </div>
            </div>

            {/* Aviso de respaldo */}
            {aviso && fuente === "muestra" && (
              <div
                role="status"
                className="mb-3 flex flex-col gap-3 border border-amber-400/50 bg-amber-400/10 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3">
                  <CameraOff className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden />
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200">
                      {t.avisoTitulo}
                    </div>
                    <p className="mt-1 text-[13px] leading-snug text-foreground/80">
                      {t.errores[aviso]} {t.avisoMuestra}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={reintentar}
                    className="flex items-center gap-2 border border-amber-300/60 bg-amber-300/15 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100 transition-colors hover:bg-amber-300/25"
                  >
                    <RotateCcw className="size-3.5" aria-hidden /> {t.reintentar}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAviso(null)}
                    aria-label={t.cerrar}
                    className="grid size-9 place-items-center border border-border/60 text-foreground/60 hover:text-foreground"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            )}

            {/* Escenario */}
            <div
              ref={escenarioRef}
              onDragOver={(e) => {
                e.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastrando(false);
                cargarArchivo(e.dataTransfer.files?.[0]);
              }}
              className={`relative w-full overflow-hidden border bg-deep aspect-[3/4] sm:aspect-video ${arrastrando ? "border-accent" : "border-border/60"}`}
            >
              {/* Lienzo de video + detecciones. En la muestra es 9 % más alto para
                  dejar fuera de cuadro el rótulo quemado del clip original. */}
              <div ref={lienzoRef} className={`absolute inset-x-0 top-0 ${fuente === "muestra" ? "h-[109%]" : "h-full"}`}>
              {fuente === "camara" && (
                <video key="camara" ref={videoRef} playsInline muted className={`size-full object-cover ${cam.fase === "viva" ? "opacity-100" : "opacity-0"}`} />
              )}
              {fuente === "muestra" && (
                <video
                  key="muestra"
                  ref={videoRef}
                  src={VIDEO_MUESTRA}
                  poster={POSTER_MUESTRA}
                  playsInline
                  muted
                  loop
                  autoPlay
                  className="size-full object-cover"
                />
              )}
              {fuente === "archivo" && archivo && (
                <video key={archivo.url} ref={videoRef} src={archivo.url} playsInline muted loop autoPlay controls={false} className="size-full object-contain" />
              )}

              <LiveAIOverlay
                videoRef={videoRef}
                demoType={modelo.demoType}
                active={activo}
                objectFit={objectFit}
                onStats={onStats}
                mostrarEstado={false}
              />
              </div>

              <div className={`pointer-events-none absolute inset-0 z-[5] ${css.lineas}`} />

              {activo && <Hud t={t} fuente={fuente} reloj={reloj} stats={stats} cargando={cargando} errorModelo={errorModelo} resolucion={cam.resolucion} nombreArchivo={archivo?.nombre} />}

              {activo && (
                <div className="absolute bottom-3 right-3 z-30 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void capturar()}
                    className="flex items-center gap-2 border border-border/50 bg-deep/75 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/85 backdrop-blur transition-colors hover:border-accent hover:text-white"
                  >
                    <Download className="size-3.5" aria-hidden />
                    <span className="hidden sm:inline">{t.capturar}</span>
                  </button>
                  {fuente === "camara" && (
                    <button
                      type="button"
                      onClick={cam.detener}
                      className="flex items-center gap-2 border border-border/50 bg-deep/75 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/70 backdrop-blur transition-colors hover:border-red-400 hover:text-red-300"
                    >
                      <CameraOff className="size-3.5" aria-hidden />
                      <span className="hidden sm:inline">{t.apagar}</span>
                    </button>
                  )}
                  {fuente === "archivo" && (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="flex items-center gap-2 border border-border/50 bg-deep/75 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/70 backdrop-blur hover:border-accent"
                    >
                      <Upload className="size-3.5" aria-hidden />
                      <span className="hidden sm:inline">{t.cambiar}</span>
                    </button>
                  )}
                </div>
              )}

              {flash > 0 && <div key={flash} className={`pointer-events-none absolute inset-0 z-40 bg-white ${css.flash}`} />}

              {fuente === "camara" && cam.fase !== "viva" && (
                <PantallaPermiso t={t} fase={cam.fase} onActivar={() => void cam.iniciar()} onMuestra={() => cambiarFuente("muestra")} />
              )}

              {fuente === "archivo" && !archivo && (
                <div className="absolute inset-0 z-30 grid place-items-center p-6 text-center">
                  <div>
                    <Upload className="mx-auto size-8 text-accent" aria-hidden />
                    <div className="mt-3 font-heading text-2xl font-black uppercase tracking-tight">{t.subirTitulo}</div>
                    <p className="mx-auto mt-2 max-w-md font-mono text-[11px] leading-relaxed text-foreground/60">{t.subirCuerpo}</p>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="bevel-btn mt-5 inline-flex items-center gap-3 border border-accent bg-accent/15 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.22em] transition-colors hover:bg-accent/25"
                    >
                      <span className="text-accent">▤</span> {t.subirBoton}
                    </button>
                    {errorArchivo && (
                      <div className="mx-auto mt-4 max-w-md border border-red-400/40 bg-red-400/10 p-2 font-mono text-[11px] text-red-300">⚠ {errorArchivo}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
              className="hidden"
              onChange={(e) => {
                cargarArchivo(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            <div className="mt-3 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45 sm:flex-row sm:justify-between">
              <span>{t.pie}</span>
              {fuente === "muestra" && <span className="shrink-0 normal-case tracking-normal">{t.creditoMuestra}</span>}
            </div>
          </div>

          <PanelVivo t={t} isES={isES} modelo={modelo} stats={stats} serie={serie} eventos={eventos} activo={activo} />
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────── HUD de monitoreo ───────────────────────────

function Hud({
  t,
  fuente,
  reloj,
  stats,
  cargando,
  errorModelo,
  resolucion,
  nombreArchivo,
}: {
  t: TextosLab;
  fuente: Fuente;
  reloj: string;
  stats: LiveStats | null;
  cargando: boolean;
  errorModelo: boolean;
  resolucion: { w: number; h: number } | null;
  nombreArchivo?: string;
}) {
  const corriendo = stats?.status === "running";
  const etiqueta =
    fuente === "camara" ? `${t.enVivo} · CAM-01` : fuente === "muestra" ? `${t.muestra} · MEVA G326` : `${t.archivo} · ${(nombreArchivo ?? "").slice(0, 22)}`;
  const esquina = "absolute size-6 border-accent/80";
  return (
    <div className="pointer-events-none absolute inset-0 z-20 font-mono uppercase">
      {/* Esquinas */}
      <span className={`${esquina} left-2 top-2 border-l-2 border-t-2`} />
      <span className={`${esquina} right-2 top-2 border-r-2 border-t-2`} />
      <span className={`${esquina} bottom-2 left-2 border-b-2 border-l-2`} />
      <span className={`${esquina} bottom-2 right-2 border-b-2 border-r-2`} />

      {/* Barra superior */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4 text-[10px] tracking-[0.22em] text-foreground/85">
        <div className="flex items-center gap-2 border border-red-500/50 bg-deep/75 px-2.5 py-1.5 backdrop-blur">
          <span className={`size-1.5 bg-red-500 ${fuente === "camara" ? "motion-safe:animate-pulse" : ""}`} />
          <span className="max-w-[46vw] truncate sm:max-w-none">{etiqueta}</span>
        </div>
        <div className="border border-border/40 bg-deep/75 px-2.5 py-1.5 tabular-nums tracking-[0.15em] backdrop-blur">
          <span className="hidden sm:inline">{reloj.slice(0, 11)}</span>{reloj.slice(11) || "—"}
        </div>
      </div>

      {/* Estado del modelo */}
      {(cargando || errorModelo) && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-yellow-400/50 bg-deep/85 px-4 py-2 text-[10px] tracking-[0.22em] text-yellow-200 backdrop-blur">
          {errorModelo ? `✕ ${t.errorModelo}` : <span className="motion-safe:animate-pulse">⟳ {t.cargandoModelo}</span>}
        </div>
      )}

      {/* Métricas inferiores */}
      <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-7.5rem)] flex-wrap gap-1.5 text-[9px] tracking-[0.18em] sm:max-w-[calc(100%-14rem)]">
        {(
          [
            ["FPS", corriendo ? String(stats.fps) : "—", true],
            [t.latencia, corriendo && stats.latencyMs ? `${Math.round(stats.latencyMs)}ms` : "—", false],
            [t.detecciones, corriendo && stats.motor !== "thermal" ? String(stats.count) : "—", true],
            [t.confianza, corriendo && stats.avgConf != null ? `${Math.round(stats.avgConf * 100)}%` : "—", false],
          ] as const
        ).map(([k, v, siempre]) => (
          <div key={k} className={`${siempre ? "block" : "hidden sm:block"} border border-border/40 bg-deep/75 px-2 py-1 backdrop-blur`}>
            <span className="text-foreground/50">{k}</span> <span className="tabular-nums text-accent">{v}</span>
          </div>
        ))}
        {corriendo && (
          <div className="hidden border border-border/40 bg-deep/75 px-2 py-1 text-foreground/50 backdrop-blur md:block">
            {stats.backend}
            {resolucion && fuente === "camara" ? ` · ${resolucion.w}×${resolucion.h}` : ""}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────── Pantalla previa al permiso ───────────────────────────

function PantallaPermiso({
  t,
  fase,
  onActivar,
  onMuestra,
}: {
  t: TextosLab;
  fase: FaseCamara;
  onActivar: () => void;
  onMuestra: () => void;
}) {
  const solicitando = fase === "solicitando";
  const pausada = fase === "pausada";
  return (
    <div className="absolute inset-0 z-30 overflow-hidden bg-deep">
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 45%, rgba(35,72,212,0.35), transparent 60%)" }}
      />
      <div className={css.barrido} />

      <div className="relative flex size-full flex-col items-center justify-center gap-4 overflow-y-auto p-5 pt-8 text-center sm:flex-row sm:gap-10 sm:p-10 sm:text-left">
        {/* Retícula */}
        <svg viewBox="0 0 200 200" className="hidden size-44 shrink-0 text-accent sm:block" aria-hidden>
          <g className={css.reticula}>
            <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="4 10" />
          </g>
          <g className={css.reticulaInversa}>
            <circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" strokeOpacity="0.6" strokeDasharray="60 20" strokeWidth="1.5" />
          </g>
          <g className={css.latido}>
            <rect x="62" y="56" width="76" height="92" fill="none" stroke="rgb(107,138,255)" strokeWidth="2" />
            <circle cx="100" cy="90" r="16" fill="none" stroke="rgb(107,138,255)" strokeWidth="1.5" />
            <path d="M74 140 q26 -30 52 0" fill="none" stroke="rgb(107,138,255)" strokeWidth="1.5" />
          </g>
          <path d="M100 2v18M100 180v18M2 100h18M180 100h18" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        <div className="max-w-md">
          <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/55">
            <span className="mr-2 inline-block size-1.5 bg-accent align-middle" />
            {pausada ? t.pausada : t.gateEyebrow}
          </div>
          <h3 className="mt-2 font-heading text-2xl font-black uppercase leading-[1.05] tracking-tight sm:text-4xl">
            {pausada ? t.pausada : t.gateTitulo}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">{pausada ? t.pausadaCuerpo : t.gateCuerpo}</p>
          {!pausada && (
            <ul className="mt-3 space-y-1.5 text-left">
              {t.gatePuntos.map((p) => (
                <li key={p} className="flex gap-2 font-mono text-[11px] leading-snug text-foreground/70">
                  <span className="text-accent">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onActivar}
              disabled={solicitando}
              className="bevel-btn inline-flex items-center gap-3 bg-white px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary shadow-xl transition-all hover:bg-white/90 disabled:cursor-wait disabled:bg-white/85"
            >
              <Camera className={`size-4 ${solicitando ? "motion-safe:animate-pulse" : ""}`} aria-hidden />
              {solicitando ? t.gateSolicitando : pausada ? t.reanudar : t.gateBoton}
            </button>
            <button
              type="button"
              onClick={onMuestra}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 underline-offset-4 hover:text-foreground hover:underline"
            >
              {t.gateAlt}
            </button>
          </div>
          {!pausada && <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40">{t.gateNota}</p>}
        </div>
      </div>
    </div>
  );
}
