// Autorización de datos (Ley 1581) del diagnóstico:  npm run test:registros
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TEXTOS_AUTORIZACION, VERSION_AUTORIZACION, autorizacionDe, textoAutorizacion } from "../../../data/diagnostico/autorizacion.ts";

describe("autorización de datos del diagnóstico", () => {
  const ahora = new Date("2026-11-05T05:00:00Z");

  it("la versión vigente tiene texto publicado con la ley y el correo para ejercer derechos", () => {
    assert.ok(TEXTOS_AUTORIZACION[VERSION_AUTORIZACION]);
    const t = textoAutorizacion(VERSION_AUTORIZACION, "datos@ars.co");
    assert.match(t, /Ley 1581 de 2012/);
    assert.match(t, /datos@ars\.co/);
    assert.ok(!t.includes("{correo}"));
  });

  it("guarda el texto OFICIAL de la versión, no lo que mande el navegador", () => {
    const a = autorizacionDe({ version: VERSION_AUTORIZACION, aceptada: true, texto: "otro texto inventado" }, "datos@ars.co", ahora);
    assert.deepEqual(a, { texto: textoAutorizacion(VERSION_AUTORIZACION, "datos@ars.co"), version: VERSION_AUTORIZACION, fecha: "2026-11-05T05:00:00.000Z" });
  });

  it("sin aceptar, con versión desconocida o con basura → null", () => {
    for (const raw of [undefined, null, "si", {}, { version: VERSION_AUTORIZACION }, { version: VERSION_AUTORIZACION, aceptada: "true" }, { version: "1999-01-01", aceptada: true }, { aceptada: true }, { version: "__proto__", aceptada: true }, { version: "toString", aceptada: true }, { version: "constructor", aceptada: true }]) {
      assert.equal(autorizacionDe(raw, "datos@ars.co", ahora), null, JSON.stringify(raw));
    }
  });
});
