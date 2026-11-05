/**
 * POST /api/propuesta/enviar — envía la Propuesta ARS a un asesor comercial.
 *
 * Valida y limpia la petición, genera el PDF en el servidor y hace dos cosas a la vez:
 *  - guarda la propuesta como registro en el ERP de ARS (`PROP-…`, ver src/lib/registros): quién la
 *    pidió, lo que respondió y la propuesta completa. Es lo que el equipo ve en «Interesados»;
 *  - la manda por Resend a CONTACT_TO (reply-to: la persona) con el PDF adjunto. Sin RESEND_API_KEY
 *    no hay correo y el registro es lo que queda (el log solo lleva los ids, sin datos personales).
 * Solo falla si no quedó en ningún lado: ni correo ni registro. Igual que /api/contact.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { generarBufferPropuesta } from "@/components/propuesta/pdf/DocumentoPropuesta";
import { MODO, fuentesDesdeOrigen, nombreArchivo, nombreArea, nombreModulo, type Recursos } from "@/components/propuesta/pdf/estilos";
import { TITULAR_ERP } from "@/components/propuesta/pdf/erp";
import { DATAURL_IMAGEN, pedidosImagenes, type FuenteImagen, type ImagenesPdf, type Pedido } from "@/components/propuesta/pdf/imagenes";
import type {
  EstrategiaErp,
  Escenario,
  Integracion,
  PeticionEnvio,
  Propuesta,
  RangoVigilantes,
  Respuestas,
  RespuestaEnvio,
  RespuestaSeguimiento,
} from "@/data/propuesta/tipos";
import { AREA_IDS, type AreaId } from "@/data/diagnostico/tipos";
import { autorizacionPropuesta } from "@/data/propuesta/autorizacion";
import { limitado } from "@/lib/asistente/servidor";
import { CONTACT_EMAIL } from "@/lib/contact";
import { guardarRegistro, registroPropuesta } from "@/lib/registros";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Texto de la propuesta (~200 KB) + hasta 3 vistas 3D de ~600 KB en base64. */
const MAX_BYTES = 3_000_000;
const MAX_3D = 3;
const MAX_3D_CHARS = 820_000; // ≈ 600 KB de imagen en base64
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

const responder = (r: RespuestaEnvio, status = 200) => NextResponse.json(r, { status });
const error = (mensaje: string, status: number) => responder({ ok: false, mensaje }, status);

/* ───────────── Limpieza ───────────── */

type Crudo = Record<string, unknown>;
const obj = (v: unknown): Crudo => (v && typeof v === "object" && !Array.isArray(v) ? (v as Crudo) : {});
const txt = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
        .trim()
        .slice(0, max)
    : "";
const lista = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v)
    ? v
        .map((x) => txt(x, maxLen))
        .filter(Boolean)
        .slice(0, maxItems)
    : [];
const filas = <T>(v: unknown, max: number, f: (o: Crudo) => T | null): T[] =>
  Array.isArray(v)
    ? v
        .slice(0, max)
        .map((x) => f(obj(x)))
        .filter((x): x is T => x !== null)
    : [];

const RANGOS: RangoVigilantes[] = ["1-50", "51-200", "201-1000", "1000+"];
const ESCENARIOS_OK: Escenario[] = ["residencial", "corporativo", "industrial", "comercial", "logistica", "mixto"];
const MODOS_ERP: EstrategiaErp["modo"][] = ["ars-centraliza", "fluye-con-su-sistema", "mixto"];

function limpiarErp(raw: unknown): EstrategiaErp | undefined {
  const e = obj(raw);
  const explicacion = txt(e.explicacion, 700);
  if (!explicacion) return undefined;
  const modo = txt(e.modo, 30) as EstrategiaErp["modo"];
  return { modo: MODOS_ERP.includes(modo) ? modo : "mixto", sistemas: lista(e.sistemas, 8, 80), explicacion };
}
const MODOS = Object.keys(MODO) as Integracion["modo"][];

function limpiarPropuesta(raw: unknown): Propuesta | null {
  const p = obj(raw);
  const c = obj(p.contacto);
  const empresa = txt(p.empresa, 120);
  const id = txt(p.id, 40);
  if (!empresa || !id) return null;
  return {
    id,
    fecha: Number.isNaN(Date.parse(txt(p.fecha, 40))) ? new Date().toISOString() : txt(p.fecha, 40),
    empresa,
    contacto: { nombre: txt(c.nombre, 120), cargo: txt(c.cargo, 120), email: txt(c.email, 160), telefono: txt(c.telefono, 40), ciudad: txt(c.ciudad, 80) },
    situacion: txt(p.situacion, 900),
    titular: txt(p.titular, 220),
    arsSuple: lista(p.arsSuple, 10, 260),
    seQueda: lista(p.seQueda, 8, 260),
    modulos: filas(p.modulos, 14, (m) => {
      const area = txt(m.area, 60) as AreaId;
      const modulo = txt(m.modulo, 80);
      return modulo && AREA_IDS.includes(area) ? { area, modulo, porQue: txt(m.porQue, 260) } : null;
    }),
    lineaDeTrabajo: filas(p.lineaDeTrabajo, 5, (f) => {
      const nombre = txt(f.nombre, 120);
      return nombre
        ? { nombre, duracion: txt(f.duracion, 60), objetivo: txt(f.objetivo, 260), entregables: lista(f.entregables, 6, 160), modulos: lista(f.modulos, 6, 80) }
        : null;
    }),
    integraciones: filas(p.integraciones, 7, (i) => {
      const sistema = txt(i.sistema, 80);
      const modo = txt(i.modo, 20) as Integracion["modo"];
      return sistema ? { sistema, modo: MODOS.includes(modo) ? modo : "integra", detalle: txt(i.detalle, 240) } : null;
    }),
    reportes: filas(p.reportes, 7, (r) => {
      const nombre = txt(r.nombre, 100);
      return nombre ? { nombre, para: txt(r.para, 80), frecuencia: txt(r.frecuencia, 40), contenido: txt(r.contenido, 260) } : null;
    }),
    impacto: filas(p.impacto, 6, (i) => {
      const indicador = txt(i.indicador, 120);
      return indicador ? { indicador, hoy: txt(i.hoy, 120), conArs: txt(i.conArs, 120) } : null;
    }),
    siguientesPasos: lista(p.siguientesPasos, 4, 200),
    analiticas: filas(p.analiticas, 6, (a) => {
      const id = txt(a.id, 40);
      return id ? { id, donde: txt(a.donde, 160), porQue: txt(a.porQue, 240) } : null;
    }),
    indicadores: filas(p.indicadores, 6, (i) => {
      const nombre = txt(i.nombre, 120);
      const hoy = Number(i.hoy);
      const conArs = Number(i.conArs);
      return nombre && Number.isFinite(hoy) && Number.isFinite(conArs) && hoy >= 0 && conArs >= 0
        ? { nombre, unidad: txt(i.unidad, 30), hoy, conArs, mejorEsMayor: i.mejorEsMayor === true, nota: txt(i.nota, 240) }
        : null;
    }),
    estrategiaErp: limpiarErp(p.estrategiaErp),
    escenario: ESCENARIOS_OK.includes(txt(p.escenario, 20) as Escenario) ? (txt(p.escenario, 20) as Escenario) : undefined,
    aviso:
      txt(p.aviso, 400) ||
      "Propuesta preliminar generada con inteligencia artificial. Tiempos y cifras son estimados; un asesor de ARS la revisa y la ajusta con usted.",
  };
}

function limpiarRespuestas(raw: unknown): Respuestas {
  const r = obj(raw);
  const central = txt(r.central, 20);
  const vigilantes = txt(r.vigilantes, 20) as RangoVigilantes;
  return {
    nombre: txt(r.nombre, 120),
    cargo: txt(r.cargo, 120),
    empresa: txt(r.empresa, 120),
    ciudad: txt(r.ciudad, 80),
    vigilantes: RANGOS.includes(vigilantes) ? vigilantes : "",
    sedes: txt(r.sedes, 40),
    servicios: lista(r.servicios, 12, 80),
    central: central === "si" || central === "no" || central === "en-proyecto" ? central : "",
    aplicaciones: lista(r.aplicaciones, 16, 80),
    erp: txt(r.erp, 80),
    datos: lista(r.datos, 12, 80),
    integraciones: txt(r.integraciones, 800),
    dolores: lista(r.dolores, 12, 160),
    reportes: lista(r.reportes, 12, 160),
    plazo: txt(r.plazo, 40),
    notas: txt(r.notas, 1500),
    email: txt(r.email, 160),
    telefono: txt(r.telefono, 40),
    autoriza: r.autoriza === true,
  };
}

const limpiarSeguimiento = (raw: unknown): RespuestaSeguimiento[] =>
  filas(raw, 6, (q) => {
    const pregunta = txt(q.pregunta, 300);
    return pregunta ? { id: txt(q.id, 40) || pregunta.slice(0, 20), pregunta, respuesta: txt(q.respuesta, 600) } : null;
  });

/* ───────────── PDF ───────────── */

const PUBLICO = path.join(process.cwd(), "public");

/** Fuentes desde el disco si están (dev / servidor propio); si no, desde el propio sitio. */
function fuentesServidor(origen: string): Recursos["fuente"] {
  return existsSync(path.join(PUBLICO, "fonts", "reporte", "Lato-Regular.ttf")) ? (a) => path.join(PUBLICO, "fonts", "reporte", a) : fuentesDesdeOrigen(origen);
}

/** Lee un archivo público del disco o, si no está (p. ej. en una función de Vercel), del propio sitio. */
async function leerPublico(ruta: string, origen: string): Promise<Buffer | null> {
  const local = path.join(PUBLICO, ...ruta.split("/").filter(Boolean));
  if (local.startsWith(PUBLICO) && existsSync(local)) return readFile(local).catch(() => null);
  try {
    const res = await fetch(new URL(ruta, origen), { signal: AbortSignal.timeout(8_000) });
    return res.ok && (res.headers.get("content-type") ?? "").startsWith("image/") ? Buffer.from(await res.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

type Sharp = typeof import("sharp");
let sharpCache: Sharp | null | undefined;
async function cargarSharp(): Promise<Sharp | null> {
  if (sharpCache === undefined) sharpCache = await import("sharp").then((m) => m.default).catch(() => null);
  return sharpCache;
}

/** Reduce y recomprime con sharp; sin sharp devuelve la imagen tal cual si react-pdf la entiende. */
async function comprimir(buf: Buffer, ancho: number, formato: "png" | "jpg"): Promise<FuenteImagen | null> {
  const sharp = await cargarSharp();
  if (sharp) {
    try {
      const base = sharp(buf).rotate().resize({ width: ancho, withoutEnlargement: true });
      return formato === "png"
        ? { data: await base.png({ compressionLevel: 9 }).toBuffer(), format: "png" }
        : { data: await base.flatten({ background: "#ffffff" }).jpeg({ quality: 76, mozjpeg: true }).toBuffer(), format: "jpg" };
    } catch (e) {
      console.warn("[propuesta/enviar] No se pudo comprimir una imagen:", e);
    }
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) return { data: buf, format: "jpg" };
  if (buf[0] === 0x89 && buf[1] === 0x50) return { data: buf, format: "png" };
  return null;
}

async function imagenesServidor(pedidos: Pedido[], origen: string): Promise<ImagenesPdf> {
  const out: ImagenesPdf = {};
  await Promise.all(
    pedidos.map(async (p) => {
      for (const ruta of p.rutas) {
        const buf = await leerPublico(ruta, origen);
        const img = buf && (await comprimir(buf, p.ancho, p.formato));
        if (img) {
          out[p.clave] = img;
          return;
        }
      }
    }),
  );
  return out;
}

/** Vistas 3D opcionales: máximo 3, dataURL de imagen de ~600 KB como mucho. `null` si vienen mal. */
function limpiarCapturas3d(raw: unknown): string[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_3D) return null;
  const ok = raw.every((d) => typeof d === "string" && d.length <= MAX_3D_CHARS && DATAURL_IMAGEN.test(d));
  return ok ? (raw as string[]) : null;
}

async function vistas3dServidor(datos: string[]): Promise<FuenteImagen[]> {
  const out: FuenteImagen[] = [];
  for (const d of datos) {
    const img = await comprimir(Buffer.from(d.slice(d.indexOf(",") + 1), "base64"), 1600, "jpg");
    if (img) out.push(img);
  }
  return out;
}

/* ───────────── Correo ───────────── */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fila = (k: string, v: string) =>
  v
    ? `<tr><td style="padding:4px 12px 4px 0;color:#5f6b84;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:4px 0;color:#0b1530">${esc(v)}</td></tr>`
    : "";
const items = (xs: string[]) => (xs.length ? `<ul style="margin:4px 0 0 18px;padding:0">${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "—");
const h = (t: string) => `<h3 style="margin:22px 0 6px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#2348d4">${esc(t)}</h3>`;

function correoHtml(p: Propuesta, r: Respuestas, seg: RespuestaSeguimiento[], conPdf: boolean, registroId: string): string {
  const modulos = p.modulos.map((m) => `${nombreModulo(m.modulo)} (${nombreArea(m.area)}): ${m.porQue}`);
  const fases = p.lineaDeTrabajo.map((f) => `${f.nombre} — ${f.duracion}: ${f.objetivo}`);
  const integ = p.integraciones.map((i) => `${i.sistema} · ${MODO[i.modo].texto}: ${i.detalle}`);
  return `<!doctype html><html><body style="margin:0;background:#f3f6fb;font-family:Lato,Arial,sans-serif;font-size:14px;line-height:1.5;color:#0b1530">
<div style="max-width:640px;margin:0 auto;padding:24px">
<div style="background:#142664;color:#ffffff;border-radius:10px;padding:20px 24px">
<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9eb0c0">Nueva propuesta ARS · ${esc(p.id)} · Registro ${esc(registroId)}</div>
<div style="font-size:22px;font-weight:900;margin-top:6px">${esc(p.empresa)}</div>
<div style="font-style:italic;color:#d5e0ff;margin-top:6px">${esc(p.titular)}</div>
</div>
<div style="background:#ffffff;border-radius:10px;padding:20px 24px;margin-top:12px">
${h("Contacto")}
<table style="border-collapse:collapse;font-size:14px">
${fila("Nombre", r.nombre || p.contacto.nombre)}${fila("Cargo", r.cargo || p.contacto.cargo)}${fila("Empresa", r.empresa || p.empresa)}${fila("Ciudad", r.ciudad || p.contacto.ciudad)}
${fila("Email", r.email)}${fila("Teléfono", r.telefono || p.contacto.telefono)}${fila("Plazo", r.plazo)}${fila("Autoriza datos", r.autoriza ? "Sí (Ley 1581 de 2012)" : "No")}
</table>
${h("Resumen")}
<p style="margin:0">${esc(p.situacion)}</p>
${h("Lo que ARS suple")}${items(p.arsSuple)}
${h("Convive mientras el cliente lo decida")}${items(p.seQueda)}${p.estrategiaErp ? `${h("Postura ERP")}<p style="margin:0"><strong>${esc(TITULAR_ERP[p.estrategiaErp.modo])}</strong>${p.estrategiaErp.sistemas.length ? ` · Sistemas: ${esc(p.estrategiaErp.sistemas.join(", "))}` : ""}</p><p style="margin:4px 0 0">${esc(p.estrategiaErp.explicacion)}</p>` : ""}
${h("Módulos")}${items(modulos)}
${h("Línea de trabajo")}${items(fases)}
${h("Integraciones")}${items(integ)}
${h("Respuestas")}
<table style="border-collapse:collapse;font-size:14px">
${fila("Vigilantes", r.vigilantes)}${fila("Sedes", r.sedes)}${fila("Central", { si: "Propia", no: "No tienen", "en-proyecto": "En proyecto", "": "" }[r.central])}${fila("Servicios", r.servicios.join(", "))}
${fila("Aplicaciones", r.aplicaciones.join(", "))}${fila("ERP", r.erp)}${fila("Datos", r.datos.join(", "))}${fila("Integraciones", r.integraciones)}
${fila("Dolores", r.dolores.join(", "))}${fila("Reportes", r.reportes.join(", "))}${fila("Notas", r.notas)}
</table>
${seg.length ? `${h("Preguntas de seguimiento")}${seg.map((q) => `<p style="margin:6px 0"><span style="color:#5f6b84">${esc(q.pregunta)}</span><br><strong>${esc(q.respuesta || "—")}</strong></p>`).join("")}` : ""}
<p style="margin:22px 0 0;font-size:12px;color:#5f6b84">${conPdf ? "La propuesta completa va adjunta en PDF." : "No se pudo generar el PDF; la propuesta va resumida en este correo."} Responder a este correo le escribe directamente a ${esc(r.email)}.</p>
</div></div></body></html>`;
}

function correoTexto(p: Propuesta, r: Respuestas, seg: RespuestaSeguimiento[], registroId: string): string {
  return [
    `Nueva propuesta ARS · ${p.empresa} · ${p.id}`,
    `Registro en ARS: ${registroId}`,
    "",
    `Contacto: ${r.nombre} (${r.cargo}) · ${r.email} · ${r.telefono || "—"} · ${r.ciudad}`,
    `Plazo: ${r.plazo || "—"}`,
    "",
    p.titular,
    p.situacion,
    "",
    `Módulos: ${p.modulos.map((m) => nombreModulo(m.modulo)).join(", ")}`,
    ...seg.map((q) => `· ${q.pregunta} → ${q.respuesta}`),
  ].join("\n");
}

/* ───────────── Handler ───────────── */

export async function POST(req: Request) {
  if (limitado(req, "propuesta-enviar", 6, 10 * 60_000)) {
    return error("Ya recibimos varias solicitudes desde aquí. Intente de nuevo en unos minutos.", 429);
  }

  const crudo = await req.text().catch(() => "");
  if (crudo.length > MAX_BYTES) return error("La solicitud es demasiado grande.", 413);
  let body: Crudo;
  try {
    body = obj(JSON.parse(crudo));
  } catch {
    return error("JSON inválido.", 400);
  }

  // Honeypot anti-spam opcional: si un bot llena este campo oculto, fingimos éxito.
  if (txt(body.website, 200)) return responder({ ok: true });

  const peticion = body as Partial<Record<keyof PeticionEnvio, unknown>>;
  const propuesta = limpiarPropuesta(peticion.propuesta);
  if (!propuesta) return error("Falta la propuesta.", 422);
  const respuestas = limpiarRespuestas(peticion.respuestas);
  const seguimiento = limpiarSeguimiento(peticion.seguimiento);
  const capturas3d = limpiarCapturas3d(body.capturas3d);
  if (!capturas3d) return error("Las vistas 3D no son válidas (máximo 3 imágenes PNG o JPEG de 600 KB).", 422);

  if (!respuestas.autoriza) return error("Necesitamos su autorización de tratamiento de datos para enviar la propuesta.", 422);
  if (!respuestas.email) respuestas.email = propuesta.contacto.email;
  if (!EMAIL_RE.test(respuestas.email)) return error("Revise el correo electrónico.", 422);
  if (respuestas.nombre.length < 2 && propuesta.contacto.nombre.length < 2) return error("Falta el nombre de contacto.", 422);

  const asunto = `Nueva propuesta ARS · ${propuesta.empresa} · ${propuesta.id}`;

  let pdf: Buffer | null = null;
  try {
    const origen = new URL(req.url).origin;
    const [imagenes, vistas] = await Promise.all([imagenesServidor(pedidosImagenes(propuesta), origen), vistas3dServidor(capturas3d)]);
    pdf = await generarBufferPropuesta({ propuesta, respuestas, seguimiento, capturas3d: vistas, recursos: { fuente: fuentesServidor(origen), imagenes } });
  } catch (e) {
    console.error("[propuesta/enviar] No se pudo generar el PDF:", e);
  }

  // El registro en ARS (más la copia local) arranca ya, sin esperar al correo.
  const registro = registroPropuesta(req, {
    propuesta,
    respuestas,
    seguimiento,
    autorizacion: autorizacionPropuesta(respuestas.autoriza),
    pdf: pdf !== null,
    vistas3d: capturas3d.length,
    nombreArea,
    nombreModulo,
    pagina: body.pagina,
  });
  const guardando = guardarRegistro(registro);

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    const guardado = await guardando;
    // Solo el id del registro (lo genera el servidor): los datos de la persona quedan en el registro, no en el log.
    console.info(
      `[propuesta/enviar] Nueva propuesta ${registro.id}; sin RESEND_API_KEY no se envió correo.` +
        (guardado.guardado ? "" : " El registro aún no se confirmó: ver [registros] en el log."),
    );
    return responder({ ok: true });
  }

  let correo = true;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "ARS Intelligence <onboarding@resend.dev>",
        to: process.env.CONTACT_TO ?? CONTACT_EMAIL,
        reply_to: respuestas.email,
        subject: asunto,
        html: correoHtml(propuesta, respuestas, seguimiento, pdf !== null, registro.id),
        text: correoTexto(propuesta, respuestas, seguimiento, registro.id),
        ...(pdf ? { attachments: [{ filename: nombreArchivo(propuesta.empresa), content: pdf.toString("base64") }] } : {}),
      }),
    });
    if (!res.ok) {
      console.error("[propuesta/enviar] Resend error:", res.status, await res.text());
      correo = false;
    }
  } catch (e) {
    console.error("[propuesta/enviar] Resend exception:", e);
    correo = false;
  }

  // Solo fallamos si la propuesta no quedó en ningún lado: ni correo ni registro.
  const guardado = await guardando;
  if (!correo && !guardado.guardado) {
    return error("No pudimos enviar la propuesta. Intente de nuevo o escríbanos por WhatsApp.", 502);
  }
  if (!correo) console.warn(`[propuesta/enviar] ${registro.id}: el correo falló, pero la propuesta quedó en el registro de ARS.`);

  return responder({ ok: true });
}
