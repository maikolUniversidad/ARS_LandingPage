// Registro de la «Propuesta ARS» (tipo propuesta, PROP-…):  npm run test:registros
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TEXTOS_AUTORIZACION_PROPUESTA,
  TEXTO_AUTORIZACION_PROPUESTA,
  VERSION_AUTORIZACION_PROPUESTA,
  autorizacionPropuesta,
} from "../../../data/propuesta/autorizacion.ts";
import { cuerpoPropuesta } from "../propuesta.ts";

const respuestas = () => ({
  nombre: "Laura Gómez",
  cargo: "Gerente de operaciones",
  empresa: "Seguridad Andina",
  ciudad: "Medellín",
  vigilantes: "201-1000",
  sedes: "40",
  servicios: ["Vigilancia física"],
  central: "si",
  aplicaciones: ["Excel", "WhatsApp"],
  erp: "Software contable",
  datos: ["Excel suelto"],
  integraciones: "Nómina con el software contable",
  dolores: ["Rondas sin evidencia"],
  reportes: ["Informe mensual al cliente"],
  plazo: "Este trimestre",
  notas: "Llamar en la tarde",
  email: "laura@andina.co",
  telefono: "3001234567",
  autoriza: true,
});

const propuesta = () => ({
  id: "ARS-2611-7K3Q",
  fecha: "2026-11-05T13:20:00.000Z",
  empresa: "Seguridad Andina",
  contacto: { nombre: "Laura Gómez", cargo: "Gerente de operaciones", email: "laura@andina.co", telefono: "3001234567", ciudad: "Medellín" },
  situacion: "Hoy controlan las rondas en papel.",
  titular: "De la minuta en papel a la operación en una sola traza",
  arsSuple: ["Rondas con evidencia"],
  seQueda: ["Su software contable"],
  modulos: [
    { area: "operacion-en-campo", modulo: "rondas", porQue: "No hay evidencia" },
    { area: "operacion-en-campo", modulo: "minuta", porQue: "Minuta en papel" },
    { area: "finanzas-y-erp", modulo: "nomina", porQue: "Nómina a mano" },
  ],
  lineaDeTrabajo: [
    { nombre: "Fase 1", duracion: "4 semanas", objetivo: "Campo", entregables: ["App"], modulos: ["rondas", "minuta"] },
    { nombre: "Fase 2", duracion: "6 semanas", objetivo: "Nómina", entregables: ["Nómina"], modulos: ["nomina", "facturacion"] },
  ],
  integraciones: [{ sistema: "Software contable", modo: "convive", detalle: "Cada quincena" }],
  reportes: [],
  impacto: [],
  siguientesPasos: ["Reunión con un asesor"],
  aviso: "Propuesta preliminar.",
});

const datos = (extra = {}) => ({
  propuesta: propuesta(),
  respuestas: respuestas(),
  seguimiento: [{ id: "q1", pregunta: "¿Quién revisa las rondas?", respuesta: "El coordinador" }],
  autorizacion: { texto: "t", version: "v", fecha: "2026-11-05T13:25:00.000Z" },
  pdf: true,
  vistas3d: 2,
  nombreArea: (id) => `Área ${id}`,
  nombreModulo: (id) => `Módulo ${id}`,
  ...extra,
});

describe("registro de la Propuesta ARS", () => {
  it("los datos de la persona van una sola vez, en contacto", () => {
    const c = cuerpoPropuesta(datos());
    assert.deepEqual(c.contacto, { nombre: "Laura Gómez", cargo: "Gerente de operaciones", email: "laura@andina.co", telefono: "3001234567" });
    assert.equal(c.empresa, "Seguridad Andina");
    assert.equal(c.ciudad, "Medellín");
    assert.equal(c.referencia, "ARS-2611-7K3Q");
    // Ni en respuestas ni dentro de la propuesta queda otra copia.
    for (const campo of ["nombre", "cargo", "empresa", "ciudad", "email", "telefono", "autoriza"]) assert.ok(!(campo in c.respuestas), campo);
    assert.ok(!("contacto" in c.propuesta));
    const resto = JSON.stringify({ respuestas: c.respuestas, propuesta: c.propuesta, seguimiento: c.seguimiento, resumen: c.resumen, nombres: c.nombres });
    assert.ok(!resto.includes("laura@andina.co") && !resto.includes("3001234567") && !resto.includes("Laura"));
  });

  it("conserva lo que respondió, el seguimiento y la propuesta completa", () => {
    const c = cuerpoPropuesta(datos());
    assert.equal(c.respuestas.vigilantes, "201-1000");
    assert.deepEqual(c.respuestas.dolores, ["Rondas sin evidencia"]);
    assert.equal(c.respuestas.notas, "Llamar en la tarde");
    assert.equal(c.seguimiento[0].respuesta, "El coordinador");
    assert.equal(c.propuesta.lineaDeTrabajo.length, 2);
    assert.equal(c.propuesta.titular, "De la minuta en papel a la operación en una sola traza");
    assert.deepEqual(c.autorizacion, { texto: "t", version: "v", fecha: "2026-11-05T13:25:00.000Z" });
    assert.deepEqual(c.entrega, { pdf: true, vistas3d: 2 });
  });

  it("resumen y nombres legibles: áreas y módulos sin repetir, incluidos los de las fases", () => {
    const c = cuerpoPropuesta(datos());
    assert.deepEqual(c.resumen, {
      titular: "De la minuta en papel a la operación en una sola traza",
      areas: ["operacion-en-campo", "finanzas-y-erp"],
      modulos: ["Módulo rondas", "Módulo minuta", "Módulo nomina"],
      plazo: "Este trimestre",
      fases: 2,
    });
    assert.deepEqual(c.nombres.areas, { "operacion-en-campo": "Área operacion-en-campo", "finanzas-y-erp": "Área finanzas-y-erp" });
    // «facturacion» solo aparece en una fase: también lleva nombre.
    assert.deepEqual(Object.keys(c.nombres.modulos), ["rondas", "minuta", "nomina", "facturacion"]);
  });

  it("si la persona no repitió un dato en el último paso, toma el de la propuesta; lo vacío queda null", () => {
    const r = { ...respuestas(), nombre: "  ", cargo: "", telefono: "", ciudad: "", empresa: "", plazo: "" };
    const p = { ...propuesta(), contacto: { nombre: "Laura G.", cargo: "", email: "laura@andina.co", telefono: "", ciudad: "" } };
    const c = cuerpoPropuesta(datos({ respuestas: r, propuesta: p }));
    assert.deepEqual(c.contacto, { nombre: "Laura G.", cargo: null, email: "laura@andina.co", telefono: null });
    assert.equal(c.ciudad, null);
    assert.equal(c.empresa, "Seguridad Andina");
    assert.equal(c.resumen.plazo, null);
  });

  it("no altera lo que recibe", () => {
    const d = datos();
    const antes = JSON.stringify({ p: d.propuesta, r: d.respuestas });
    cuerpoPropuesta(d);
    assert.equal(JSON.stringify({ p: d.propuesta, r: d.respuestas }), antes);
  });
});

describe("autorización de datos de la propuesta", () => {
  it("la versión vigente tiene texto publicado y cita la ley", () => {
    assert.equal(TEXTOS_AUTORIZACION_PROPUESTA[VERSION_AUTORIZACION_PROPUESTA], TEXTO_AUTORIZACION_PROPUESTA);
    assert.match(TEXTO_AUTORIZACION_PROPUESTA, /Ley 1581 de 2012/);
    assert.match(TEXTO_AUTORIZACION_PROPUESTA, /supresión de mis datos/);
  });

  it("solo hay evidencia si la aceptó (true exacto)", () => {
    const ahora = new Date("2026-11-05T13:25:00Z");
    assert.deepEqual(autorizacionPropuesta(true, ahora), {
      texto: TEXTO_AUTORIZACION_PROPUESTA,
      version: VERSION_AUTORIZACION_PROPUESTA,
      fecha: "2026-11-05T13:25:00.000Z",
    });
    for (const v of [false, "true", 1, null, undefined, {}]) assert.equal(autorizacionPropuesta(v, ahora), null, String(v));
  });
});
