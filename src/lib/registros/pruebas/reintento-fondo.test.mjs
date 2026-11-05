// Pruebas del reintento de fondo de los registros:  npm run test:registros
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { entornoRegistro } from "../config.ts";
import { detenerReintentoFondo, iniciarReintentoFondo, intervaloReintento, rechazoDefinitivo } from "../reintento-fondo.ts";

const silencio = () => {
  const lineas = [];
  const g = (nivel) => (...a) => void lineas.push(`${nivel}: ${a.join(" ")}`);
  return { lineas, info: g("info"), warn: g("warn"), error: g("error") };
};
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

describe("intervalo del reintento de fondo (REGISTROS_REINTENTO_MS)", () => {
  it("5 min por defecto; mínimo 30 s; 0 lo apaga", () => {
    assert.equal(intervaloReintento(undefined), 300_000);
    assert.equal(intervaloReintento(""), 300_000);
    assert.equal(intervaloReintento("abc"), 300_000);
    assert.equal(intervaloReintento("60000"), 60_000);
    assert.equal(intervaloReintento("10"), 30_000);
    assert.equal(intervaloReintento("0"), 0);
    assert.equal(intervaloReintento("-5"), 0);
    assert.equal(intervaloReintento("999999999999"), 86_400_000);
  });
});

describe("entorno del registro (REGISTROS_ENTORNO)", () => {
  it("REGISTROS_ENTORNO manda sobre VERCEL_ENV y NODE_ENV; un valor inválido se ignora", () => {
    assert.equal(entornoRegistro({ NODE_ENV: "production" }), "production");
    assert.equal(entornoRegistro({ NODE_ENV: "production", REGISTROS_ENTORNO: "development" }), "development");
    assert.equal(entornoRegistro({ VERCEL_ENV: "preview", NODE_ENV: "production" }), "preview");
    assert.equal(entornoRegistro({ VERCEL_ENV: "production", REGISTROS_ENTORNO: " Preview " }), "preview");
    assert.equal(entornoRegistro({ NODE_ENV: "production", REGISTROS_ENTORNO: "pruebas" }), "production");
    assert.equal(entornoRegistro({}), "development");
  });
});

describe("rechazos definitivos (no se reenvían solos)", () => {
  it("4xx salvo 408 y 429; los errores de red y 5xx sí se reintentan", () => {
    for (const e of ["HTTP 400", "HTTP 401: token", "HTTP 403", "HTTP 422: {\"error\":\"id\"}"]) assert.equal(rechazoDefinitivo(e), true, e);
    for (const e of ["HTTP 408", "HTTP 429: lento", "HTTP 500", "HTTP 503: caído", "Red/timeout: fetch failed", "", null, undefined]) {
      assert.equal(rechazoDefinitivo(e), false, String(e));
    }
  });
});

describe("ciclo de reintento de fondo", () => {
  afterEach(() => detenerReintentoFondo());

  it("arranca una sola vez por proceso y reintenta en cada vuelta", async () => {
    let llamadas = 0;
    const log = silencio();
    const op = { intervaloMs: 25, log, reintentar: async () => (llamadas++, { revisados: 1, enviados: ["CONT-2026-AAAAAA"], fallidos: [] }) };
    assert.equal(iniciarReintentoFondo(op), true);
    assert.equal(iniciarReintentoFondo(op), false, "no arranca dos ciclos");
    await dormir(400);
    assert.ok(llamadas >= 2, `llamadas = ${llamadas}`);
    assert.ok(log.lineas.some((l) => l.includes("Reintento de fondo cada 0 s")));
    assert.ok(log.lineas.some((l) => l.includes("1 enviado(s) y 0 fallido(s) de 1")));
  });

  it("no se solapa: si una pasada tarda más que el intervalo, la siguiente espera", async () => {
    let enCurso = 0;
    let maximo = 0;
    let llamadas = 0;
    iniciarReintentoFondo({
      intervaloMs: 10,
      log: silencio(),
      reintentar: async () => {
        llamadas++;
        enCurso++;
        maximo = Math.max(maximo, enCurso);
        await dormir(60);
        enCurso--;
        return { revisados: 0, enviados: [], fallidos: [] };
      },
    });
    await dormir(400);
    assert.equal(maximo, 1);
    // En 400 ms caben a lo sumo ~6 pasadas de 60 ms; sin el candado serían ~40 llamadas.
    assert.ok(llamadas >= 2 && llamadas <= 8, `llamadas = ${llamadas}`);
  });

  it("un error en una pasada se registra y el ciclo sigue", async () => {
    let llamadas = 0;
    const log = silencio();
    iniciarReintentoFondo({
      intervaloMs: 15,
      log,
      reintentar: async () => {
        llamadas++;
        if (llamadas === 1) throw new Error("ARS remoto no configurado");
        return { revisados: 0, enviados: [], fallidos: [] };
      },
    });
    await dormir(300);
    assert.ok(llamadas >= 2);
    assert.ok(log.lineas.some((l) => l.startsWith("error:") && l.includes("ARS remoto no configurado")));
  });

  it("intervalo 0 = apagado", () => {
    assert.equal(iniciarReintentoFondo({ intervaloMs: 0, log: silencio(), reintentar: async () => ({ revisados: 0, enviados: [], fallidos: [] }) }), false);
  });

  it("no mantiene vivo el proceso (unref)", async () => {
    iniciarReintentoFondo({ intervaloMs: 60_000, log: silencio(), reintentar: async () => ({ revisados: 0, enviados: [], fallidos: [] }) });
    const ciclo = globalThis[Symbol.for("ars.registros.reintento-fondo")];
    assert.equal(ciclo.reloj.hasRef(), false);
  });
});
