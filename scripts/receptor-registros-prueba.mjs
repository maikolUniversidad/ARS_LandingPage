#!/usr/bin/env node
/**
 * Receptor MÍNIMO de prueba del push de registros (contrato §3.3–3.5), sin dependencias.
 * Solo para pruebas locales y de punta a punta: guarda en memoria. NO es el receptor del ERP.
 *
 *   ARS_REGISTROS_TOKEN=… ARS_REGISTROS_SECRET=… node scripts/receptor-registros-prueba.mjs [puerto=4599]
 *
 *   POST /api/registros-web  → 201 nuevo · 409 ya existía · 401 token/timestamp/firma · 422 id
 *   GET  /recibidos          → [{ id, tipo, recibido, cabeceras sin secretos, registro }]
 *   POST /control/retrasar?ms=1500&veces=1
 *                            → las próximas N altas se guardan pero responden tarde (simula que la
 *                              respuesta se pierde: el sitio reintenta y recibe 409 = éxito)
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import http from "node:http";
import { pathToFileURL } from "node:url";

const iguales = (a, b) => timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
const PATRON_ID = /^(CONT|DIAG|PROP)-\d{4}-[0-9A-HJKMNP-TV-Z]{6}$/;

/**
 * @param {{ token: string, secreto: string, log?: { info: (...a: unknown[]) => void } }} opciones
 */
export function crearReceptor({ token, secreto, log = console }) {
  const recibidos = new Map();
  const conteo = { creado: 0, duplicado: 0, token: 0, timestamp: 0, firma: 0, invalido: 0 };
  const retraso = { ms: 0, veces: 0 };
  const servidor = http.createServer((req, res) => {
    const responder = (status, cuerpo) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(cuerpo));
    };
    if (req.method === "GET" && req.url === "/recibidos") return responder(200, { conteo, recibidos: [...recibidos.values()] });
    if (req.method === "POST" && req.url?.startsWith("/control/retrasar")) {
      const q = new URL(req.url, "http://receptor").searchParams;
      retraso.ms = Number(q.get("ms") ?? 0) || 0;
      retraso.veces = Number(q.get("veces") ?? 1) || 0;
      return responder(200, { ok: true, retraso });
    }
    if (req.method !== "POST" || req.url !== "/api/registros-web") return responder(404, { ok: false });

    const trozos = [];
    let total = 0;
    req.on("data", (t) => {
      total += t.length;
      if (total > 1_048_576) req.destroy();
      else trozos.push(t);
    });
    req.on("end", () => {
      // 1. Cuerpo crudo, antes de parsear.
      const cuerpo = Buffer.concat(trozos).toString("utf8");
      // 2. Bearer en tiempo constante.
      if (!iguales(req.headers.authorization ?? "", `Bearer ${token}`)) return conteo.token++, responder(401, { ok: false, error: "token" });
      // 3. Timestamp ±300 s.
      const ts = String(req.headers["x-ars-timestamp"] ?? "");
      if (!/^\d+$/.test(ts) || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return conteo.timestamp++, responder(401, { ok: false, error: "timestamp" });
      // 4. HMAC sobre `${ts}.${cuerpo}`.
      const esperada = "sha256=" + createHmac("sha256", secreto).update(`${ts}.${cuerpo}`).digest("hex");
      if (!iguales(String(req.headers["x-ars-firma"] ?? ""), esperada)) return conteo.firma++, responder(401, { ok: false, error: "firma" });
      let evento;
      try {
        evento = JSON.parse(cuerpo);
      } catch {
        return conteo.invalido++, responder(400, { ok: false, error: "json" });
      }
      const r = evento?.registro;
      // 5. registro.id == Idempotency-Key, con el patrón del contrato.
      if (!r || r.id !== req.headers["idempotency-key"] || !PATRON_ID.test(r.id) || !["contacto", "diagnostico", "propuesta"].includes(r.tipo)) {
        return conteo.invalido++, responder(422, { ok: false, error: "id" });
      }
      // 6. Upsert por id: 201 nuevo, 409 ya existía.
      if (recibidos.has(r.id)) return conteo.duplicado++, responder(409, { ok: true, id: r.id });
      recibidos.set(r.id, {
        id: r.id,
        tipo: r.tipo,
        recibido: new Date().toISOString(),
        bytes: Buffer.byteLength(cuerpo),
        cabeceras: {
          version: req.headers["x-ars-version"],
          userAgent: req.headers["user-agent"],
          idempotencyKey: req.headers["idempotency-key"],
          contentType: req.headers["content-type"],
        },
        registro: r,
      });
      conteo.creado++;
      log.info(`[receptor] ${r.id} (${r.tipo}) guardado`);
      if (retraso.veces > 0) {
        retraso.veces--;
        return void setTimeout(() => responder(201, { ok: true, id: r.id }), retraso.ms);
      }
      return responder(201, { ok: true, id: r.id });
    });
  });
  return { servidor, recibidos, conteo };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const token = process.env.ARS_REGISTROS_TOKEN;
  const secreto = process.env.ARS_REGISTROS_SECRET;
  if (!token || !secreto) {
    console.error("Faltan ARS_REGISTROS_TOKEN y ARS_REGISTROS_SECRET");
    process.exit(1);
  }
  const puerto = Number(process.argv[2] ?? 4599);
  crearReceptor({ token, secreto }).servidor.listen(puerto, () => console.info(`[receptor] escuchando en :${puerto}`));
}
