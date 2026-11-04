/**
 * Genera src/data/analiticas.generado.json desde las escenas 3D de public/analiticas-3d
 * (escenas.js, escenas2.js, evidencia-publica.js y los emparejamientos sync/*.js).
 *
 *   node scripts/generar-analiticas.cjs [public/analiticas-3d] [src/data/analiticas.generado.json]
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = process.argv[2] || path.join(__dirname, "..", "public", "analiticas-3d");
const salida = process.argv[3] || path.join(__dirname, "..", "src", "data", "analiticas.generado.json");
const FAMILIAS = ["comercial", "operativo", "prevencion", "lite"];

const win = {
  MOTOR: { COL: { vigila: 1, detecta: 2, alerta: 3, ok: 4, oro: 5, marino: 6, staff: 7, cliente: 8 } },
  matchMedia: () => ({ matches: false }),
  location: { search: "" },
  navigator: {},
};
const ctx = { window: win, document: { querySelector: () => null, getElementById: () => null }, console };
ctx.self = ctx.window;
vm.createContext(ctx);
const archivos = ["escenas.js", "escenas2.js", "evidencia-publica/evidencia-publica.js", "sync/base.js", ...FAMILIAS.map((f) => `sync/${f}.js`)];
for (const f of archivos) {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
}

const ES = win.ESCENAS;
const GR = win.GRUPOS;
const COLOR = { oro: "oro", azul: "azul", rojo: "rojo", verde: "verde" };
const abs = (r) => (r ? (r.startsWith("/") || r.startsWith("http") ? r : `/analiticas-3d/${r}`) : undefined);

function video(v) {
  if (!v) return null;
  const o = { src: abs(v.src), poster: abs(v.poster), img: abs(v.img), chapa: v.chapa };
  for (const k of ["fuente", "autor", "url", "licencia", "evento", "marcas", "ia"]) if (v[k] != null) o[k] = v[k];
  for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k];
  return o;
}

const out = {
  familias: GR.map((g, i) => ({ id: FAMILIAS[i], nombre: g.n, descripcion: g.d, color: COLOR[g.c] })),
  analiticas: ES.map((s) => ({
    id: s.id,
    familia: FAMILIAS[s.grupo],
    nombre: s.nombre,
    corta: s.corta,
    desc: s.desc,
    estado: s.estado || null,
    dur: s.dur || 16,
    fases: (s.fases || []).map((f) => ({ t: f[0], estado: f[1], texto: f[2] })),
    video: video(s.video),
  })),
};
fs.writeFileSync(salida, JSON.stringify(out, null, 1) + "\n");
console.log("familias", out.familias.length, "analíticas", out.analiticas.length, "con video", out.analiticas.filter((a) => a.video).length, "→", salida);
