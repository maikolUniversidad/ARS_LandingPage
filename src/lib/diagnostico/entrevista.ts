/**
 * Servidor de la entrevista del diagnóstico: prompt, esquema de salida
 * estructurada, validación del cuerpo y guion del modo demo.
 */
import type { EventoEntrevista, PeticionTurno } from "@/components/diagnostico/entrevista/eventos";
import { AREA_IDS, type AreaId, type PerfilEmpresa, type TamanoEmpresa, type TurnoEntrevista } from "@/data/diagnostico/tipos";
import { todosLosModulos } from "@/data/servicios";
import {
  TAMANOS,

  catalogoCompacto,
  esAreaId,
  fusionarPerfil,
  modulosPara,
  modulosValidos,
  perfilParcial,
  puntajeAreas,
} from "./catalogo";

export const MAX_TURNOS = 30;
const MAX_TEXTO = 1500;

/* ───────────── Validación del cuerpo ───────────── */

export function validarTurno(raw: unknown): PeticionTurno | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const lista = Array.isArray(r.conversacion) ? r.conversacion : [];
  const conversacion: TurnoEntrevista[] = lista
    .slice(-MAX_TURNOS)
    .map((m) => {
      const o = (m && typeof m === "object" ? m : {}) as Record<string, unknown>;
      const rol: TurnoEntrevista["rol"] = o.rol === "assistant" ? "assistant" : "user";
      return { rol, texto: typeof o.texto === "string" ? o.texto.trim().slice(0, MAX_TEXTO) : "" };
    })
    .filter((m) => m.texto);
  if (!conversacion.length || conversacion[conversacion.length - 1].rol !== "user") return null;
  return { conversacion, perfil: perfilParcial(r.perfil) };
}

/* ───────────── Prompt y esquema (modo IA) ───────────── */

export function systemEntrevista(): string {
  return `Eres «Ars», consultora de ARS Intelligence, una plataforma colombiana que conecta la operación de empresas de seguridad y servicios (campo, central, comunicación, monitoreo, gestión humana, formación, finanzas, productividad con IA y gobierno).

Estás haciendo una ENTREVISTA breve y cálida para armar el diagnóstico de la empresa de la persona. Español latino, tuteo, tono cercano y comercial, nada de tecnicismos.

Lo que necesitas saber (en este orden aproximado, sin sonar a formulario):
1. Nombre de la empresa y sector.
2. Tamaño (personas) → una de: 1-50, 51-200, 201-1000, 1000+.
3. Número de sedes o puestos y ciudad principal.
4. Dolores: qué les quita el sueño hoy (pide ejemplos concretos).
5. Herramientas actuales (Excel, WhatsApp, radio, papel, ERP...).
6. Prioridades (costos, control, clientes, personal, crecer...).

Reglas de cada turno:
- "respuesta": 1–3 frases (máx. 60 palabras). Reconoce lo que dijo con un detalle concreto (si encaja, menciona de pasada cómo lo resuelve ARS) y haz UNA sola pregunta. Sin listas ni markdown.
- "perfil": SOLO lo que la persona dijo en este turno o se deduce sin duda; null o [] en lo demás. Dolores en frases cortas en sus palabras.
- "areas" y "modulos": 1–3 áreas y 0–4 módulos del catálogo que respondan a lo que acaba de contar (para mostrarle tarjetas). [] si no aplica.
- "chips": 2–5 respuestas rápidas cortas (≤6 palabras) para la pregunta que haces; "chipsMultiples": true si tiene sentido elegir varias (dolores, herramientas, prioridades).
- "datos": 0–2 observaciones breves sobre su empresa (título ≤4 palabras + 1 frase), p. ej. una cifra estimada o un riesgo que notas. Marca las cifras como estimadas.
- "listo": true solo cuando ya tienes nombre, sector, tamaño, al menos un dolor, una herramienta y una prioridad (o tras ~8 turnos). En ese turno la respuesta agradece, resume en una frase lo que entendiste e invita a ver el diagnóstico; chips: ["Ver mi diagnóstico"].
- Si la persona se desvía, responde amable en una frase y vuelve a la entrevista. No inventes precios.

Catálogo de ARS (usa SOLO estos ids):
${catalogoCompacto()}`;
}

const MODULO_IDS = todosLosModulos().map((x) => x.modulo.id);
const cadenaONull = { anyOf: [{ type: "string" }, { type: "null" }] };
const listaCadenas = { type: "array", items: { type: "string" } };

export const ESQUEMA_TURNO: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["respuesta", "perfil", "areas", "modulos", "chips", "chipsMultiples", "datos", "listo"],
  properties: {
    respuesta: { type: "string" },
    perfil: {
      type: "object",
      additionalProperties: false,
      required: ["nombre", "sector", "ciudad", "tamano", "sedes", "dolores", "herramientasActuales", "prioridades", "notas"],
      properties: {
        nombre: cadenaONull,
        sector: cadenaONull,
        ciudad: cadenaONull,
        tamano: { anyOf: [{ type: "string", enum: TAMANOS }, { type: "null" }] },
        sedes: { anyOf: [{ type: "integer" }, { type: "null" }] },
        dolores: listaCadenas,
        herramientasActuales: listaCadenas,
        prioridades: listaCadenas,
        notas: cadenaONull,
      },
    },
    areas: { type: "array", items: { type: "string", enum: AREA_IDS } },
    modulos: { type: "array", items: { type: "string", enum: MODULO_IDS } },
    chips: listaCadenas,
    chipsMultiples: { type: "boolean" },
    datos: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["titulo", "texto"],
        properties: { titulo: { type: "string" }, texto: { type: "string" } },
      },
    },
    listo: { type: "boolean" },
  },
};

/** Convierte la salida estructurada del turno en eventos ya validados. */
export function eventosDeSalida(raw: unknown, perfilPrevio: Partial<PerfilEmpresa>, textoUsuario: string): EventoEntrevista[] {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: EventoEntrevista[] = [];
  const cambios = perfilParcial(o.perfil);
  if (Object.keys(cambios).length) out.push({ t: "perfil", cambios });

  let areas = (Array.isArray(o.areas) ? o.areas : []).filter(esAreaId).slice(0, 3);
  const modulos = modulosValidos(o.modulos).slice(0, 4);
  if (!areas.length && !modulos.length) areas = topAreas(textoUsuario, 2);
  if (areas.length || modulos.length) out.push({ t: "mostrar", areas, modulos });

  const chips = (Array.isArray(o.chips) ? o.chips : [])
    .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    .map((c) => c.trim().slice(0, 48))
    .slice(0, 5);
  if (chips.length) out.push({ t: "chips", opciones: chips, multiple: o.chipsMultiples === true });

  for (const d of Array.isArray(o.datos) ? o.datos.slice(0, 2) : []) {
    const r = (d && typeof d === "object" ? d : {}) as Record<string, unknown>;
    const titulo = typeof r.titulo === "string" ? r.titulo.trim().slice(0, 40) : "";
    const texto = typeof r.texto === "string" ? r.texto.trim().slice(0, 220) : "";
    if (titulo && texto) out.push({ t: "dato", dato: { titulo, texto } });
  }
  const final = fusionarPerfil(perfilPrevio, cambios);
  if (o.listo === true && final.nombre && final.sector) out.push({ t: "listo" });
  return out;
}

function topAreas(texto: string, n: number): AreaId[] {
  return [...puntajeAreas(texto).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id]) => id);
}

/**
 * Extrae progresivamente el valor de "respuesta" de un JSON que llega por partes.
 * Devuelve el texto decodificado hasta donde se pueda, o null si aún no empieza.
 */
export function respuestaParcial(json: string): string | null {
  const m = /"respuesta"\s*:\s*"/.exec(json);
  if (!m) return null;
  let i = m.index + m[0].length;
  let crudo = "";
  while (i < json.length) {
    const c = json[i];
    if (c === "\\") {
      // Secuencia de escape incompleta: esperar más datos.
      if (i + 1 >= json.length) break;
      if (json[i + 1] === "u") {
        if (i + 6 > json.length) break;
        crudo += json.slice(i, i + 6);
        i += 6;
      } else {
        crudo += json.slice(i, i + 2);
        i += 2;
      }
      continue;
    }
    if (c === '"') break;
    crudo += c;
    i++;
  }
  try {
    return JSON.parse(`"${crudo}"`) as string;
  } catch {
    return null;
  }
}

/* ───────────── Modo demo (guion sin IA) ───────────── */

type Campo = "nombre" | "sector" | "tamano" | "sedes" | "dolores" | "herramientas" | "prioridades";

function faltante(p: Partial<PerfilEmpresa>): Campo | null {
  if (!p.sector) return "sector";
  if (!p.nombre) return "nombre";
  if (!p.tamano) return "tamano";
  if (!p.sedes && !p.ciudad) return "sedes";
  if (!p.dolores?.length) return "dolores";
  if (!p.herramientasActuales?.length) return "herramientas";
  if (!p.prioridades?.length) return "prioridades";
  return null;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const SECTORES: [string[], string][] = [
  [["vigilancia", "seguridad privada", "guarda"], "Vigilancia privada"],
  [["conjunto", "propiedad horizontal", "residencial", "edificio"], "Conjuntos residenciales"],
  [["industria", "planta", "fabrica", "manufactura", "produccion"], "Industria"],
  [["escolta", "transporte de valores", "valores"], "Escoltas y transporte de valores"],
  [["aseo", "limpieza", "mantenimiento"], "Aseo y mantenimiento"],
  [["logistic", "bodega", "transporte"], "Logística y transporte"],
  [["hospital", "clinica", "salud"], "Salud"],
  [["universidad", "colegio", "educacion"], "Educación"],
  [["retail", "comercio", "tienda", "centro comercial"], "Comercio"],
];

const CIUDADES = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales", "Cúcuta", "Ibagué", "Santa Marta", "Villavicencio", "Pasto", "Montería", "Neiva", "Armenia", "Popayán", "Tunja", "Valledupar", "Sincelejo", "Ciudad de México", "Lima", "Quito", "Santiago", "Panamá"];

function sectorDe(texto: string): string | undefined {
  const t = norm(texto);
  return SECTORES.find(([claves]) => claves.some((c) => t.includes(c)))?.[1];
}

function nombreDe(texto: string, conSector: boolean): string | undefined {
  const t = texto.trim();
  const m = /(?:se llama|nos llamamos|somos|la empresa es)\s+([\p{L}0-9][\p{L}0-9&.\- ]{1,40})/iu.exec(t);
  if (m) return m[1].split(/[,.;]| y | una | que /i)[0].trim();
  if (conSector) {
    const antesDeComa = t.split(/[,;:—-]/)[0].trim();
    if (antesDeComa !== t && antesDeComa.split(/\s+/).length <= 5 && !sectorDe(antesDeComa)) return antesDeComa;
    return undefined;
  }
  return t.replace(/^(la empresa|mi empresa|nosotros)\s*/i, "").split(/[,.;]/)[0].trim().slice(0, 60) || undefined;
}

function numeros(texto: string): number[] {
  return [...texto.replace(/(\d)\.(\d{3})/g, "$1$2").matchAll(/\d+/g)].map((m) => Number(m[0]));
}

function tamanoDe(texto: string): TamanoEmpresa | undefined {
  const t = norm(texto);
  const n = numeros(t);
  if (t.includes("mas de") && n[0] >= 1000) return "1000+";
  const v = n.length ? Math.max(...n) : NaN;
  if (Number.isNaN(v)) {
    if (/pequen|poca/.test(t)) return "1-50";
    if (/median/.test(t)) return "51-200";
    if (/grande/.test(t)) return "201-1000";
    return undefined;
  }
  return v <= 50 ? "1-50" : v <= 200 ? "51-200" : v <= 1000 ? "201-1000" : "1000+";
}

function sedesDe(texto: string): number | undefined {
  const t = norm(texto);
  const n = numeros(t);
  if (!n.length) return /una sola|solo una|una sede/.test(t) ? 1 : undefined;
  if (t.includes("mas de")) return Math.round(n[0] * 1.2);
  return Math.round(n.reduce((a, b) => a + b, 0) / n.length);
}

function ciudadDe(texto: string): string | undefined {
  const t = norm(texto);
  return CIUDADES.find((c) => t.includes(norm(c)));
}

function partes(texto: string): string[] {
  return texto
    .split(/\s*(?:[,;·\n]|\by\b|\btambién\b)\s*/i)
    .map((x) => x.trim().replace(/\.$/, ""))
    .filter((x) => x.length > 1)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1));
}

type Paso = { texto: string; chips?: string[]; multiple?: boolean; datos?: { titulo: string; texto: string }[] };

function pregunta(campo: Campo, p: Partial<PerfilEmpresa>): Paso {
  const n = p.nombre ?? "tu empresa";
  switch (campo) {
    case "sector":
      return { texto: "¡Encantada! ¿A qué se dedica la empresa?", chips: ["Vigilancia privada", "Conjuntos residenciales", "Industria", "Escoltas y valores"] };
    case "nombre":
      return { texto: `${p.sector ? `${p.sector}, perfecto: es justo el terreno donde ARS nació. ` : ""}¿Cómo se llama la empresa?` };
    case "tamano":
      return {
        texto: `Mucho gusto, ${n}. ¿Cuántas personas trabajan con ustedes, contando al personal en campo?`,
        chips: ["Hasta 50 personas", "51 a 200", "201 a 1.000", "Más de 1.000"],
      };
    case "sedes":
      return {
        texto: "¿En cuántas sedes o puestos operan, y en qué ciudad está la base principal?",
        chips: ["1 sede", "2 a 10 sedes", "11 a 50 sedes", "Más de 50 sedes"],
      };
    case "dolores":
      return {
        texto: "Ahora lo importante: ¿qué es lo que más les quita el sueño hoy en la operación? Puedes elegir varias o contármelo con tus palabras.",
        chips: ["No sé si hacen las rondas", "La nómina se hace a mano", "Los informes al cliente tardan", "La comunicación es por WhatsApp", "Mucha rotación de personal"],
        multiple: true,
      };
    case "herramientas":
      return {
        texto: "Entiendo. ¿Con qué herramientas lo manejan hoy?",
        chips: ["Excel", "WhatsApp", "Radio análoga", "Papel y minuta", "ERP propio"],
        multiple: true,
      };
    case "prioridades":
      return {
        texto: "Última pregunta: si ARS resolviera solo una cosa este trimestre, ¿qué te importa más?",
        chips: ["Bajar costos", "Tener control", "Clientes felices", "Cuidar al personal", "Crecer"],
        multiple: true,
      };
  }
}

/** Lo que entiende el guion demo del último mensaje, según lo que se preguntó. */
function extraer(campo: Campo | null, texto: string): Partial<PerfilEmpresa> {
  const out: Partial<PerfilEmpresa> = {};
  const sector = sectorDe(texto);
  switch (campo) {
    case "sector":
    case "nombre": {
      if (sector) out.sector = sector;
      else if (campo === "sector") out.sector = texto.split(/[,.;]/)[0].trim().slice(0, 60);
      const nombre = nombreDe(texto, campo === "sector");
      if (nombre && (campo === "nombre" || nombre !== out.sector)) out.nombre = nombre;
      break;
    }
    case "tamano": {
      const t = tamanoDe(texto);
      if (t) out.tamano = t;
      else out.tamano = "51-200";
      break;
    }
    case "sedes": {
      const s = sedesDe(texto);
      if (s) out.sedes = s;
      const c = ciudadDe(texto);
      if (c) out.ciudad = c;
      if (!s && !c) out.notas = texto.slice(0, 200);
      break;
    }
    case "dolores":
      out.dolores = partes(texto).slice(0, 6);
      break;
    case "herramientas":
      out.herramientasActuales = partes(texto).slice(0, 8);
      break;
    case "prioridades":
      out.prioridades = partes(texto).map((x) => x.toLowerCase()).slice(0, 5);
      break;
    default:
      out.notas = texto.slice(0, 200);
  }
  return out;
}

function datosDe(campo: Campo | null, p: Partial<PerfilEmpresa>): { titulo: string; texto: string }[] {
  switch (campo) {
    case "sedes":
      return p.sedes && p.sedes > 5
        ? [{ titulo: "Escala", texto: `Con ${p.sedes} sedes, una sola central con mapa en vivo ahorra decenas de llamadas por turno (estimado).` }]
        : [{ titulo: "Punto de partida", texto: "Con pocas sedes, el primer mes se puede tener todo el campo digitalizado." }];
    case "dolores":
      return [{ titulo: "Lo que más duele", texto: (p.dolores ?? []).slice(0, 2).join(" · ") || "Operación sin evidencia" }];
    case "herramientas":
      return (p.herramientasActuales ?? []).some((h) => /excel|papel|whatsapp/i.test(h))
        ? [{ titulo: "Trabajo manual", texto: "Equipos así suelen dedicar 2–3 días al mes a cuadrar información (estimado)." }]
        : [];
    case "tamano":
      return p.tamano ? [{ titulo: "Tamaño", texto: `Equipo de ${p.tamano} personas: la nómina y los turnos ya pesan.` }] : [];
    default:
      return [];
  }
}

function areasPorSector(sector?: string): AreaId[] {
  const s = norm(sector ?? "");
  if (s.includes("conjunto")) return ["monitoreo-inteligente", "comunicacion-y-emergencias"];
  if (s.includes("industria")) return ["monitoreo-inteligente", "gestion-humana"];
  if (s.includes("escolta")) return ["centro-de-operaciones", "comunicacion-y-emergencias"];
  return ["operacion-en-campo", "centro-de-operaciones"];
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Stream NDJSON simulado: ejercita la UI sin clave de Anthropic. */
export function streamDemoEntrevista(p: PeticionTurno): ReadableStream<Uint8Array> {
  const cod = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enviar = (e: EventoEntrevista) => controller.enqueue(cod.encode(`${JSON.stringify(e)}\n`));
      const ultimo = p.conversacion[p.conversacion.length - 1].texto;
      const preguntado = faltante(p.perfil);
      const cambios = extraer(preguntado, ultimo);
      const perfil = fusionarPerfil(p.perfil, cambios);
      const sigue = faltante(perfil);

      let paso: Paso;
      if (sigue) {
        paso = pregunta(sigue, perfil);
        if (preguntado === "dolores") paso.texto = `Eso lo vemos muchísimo, y tiene arreglo. ${paso.texto}`;
        if (preguntado === "herramientas") paso.texto = `Perfecto, con eso ya sé desde dónde partimos. ${paso.texto}`;
      } else {
        const resumen = [perfil.sector?.toLowerCase(), perfil.sedes ? `${perfil.sedes} sedes` : perfil.ciudad, perfil.dolores?.[0]?.toLowerCase()]
          .filter(Boolean)
          .join(", ");
        paso = {
          texto: `¡Gracias! Ya tengo una buena foto de ${perfil.nombre}: ${resumen}. Mis agentes por área están listos para revisar tu operación y armar el diagnóstico.`,
          chips: ["Ver mi diagnóstico"],
        };
      }

      await espera(350);
      const palabras = paso.texto.split(/(\s+)/);
      for (let i = 0; i < palabras.length; i += 4) {
        enviar({ t: "texto", d: palabras.slice(i, i + 4).join("") });
        await espera(45);
      }
      if (Object.keys(cambios).length) enviar({ t: "perfil", cambios });

      // Tarjetas: por sector al presentarse; por lo que cuenta en dolores, herramientas y prioridades.
      const habla = preguntado === "dolores" || preguntado === "herramientas" || preguntado === "prioridades";
      const puntos = habla ? [...puntajeAreas(ultimo).entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id) : [];
      const areas = (habla ? puntos : preguntado === "sector" || preguntado === "nombre" ? areasPorSector(perfil.sector) : []).slice(0, 3);
      const modulos = habla ? modulosPara(ultimo, 3) : [];
      if (areas.length || modulos.length) enviar({ t: "mostrar", areas, modulos });
      for (const dato of datosDe(preguntado, perfil)) enviar({ t: "dato", dato });
      if (paso.chips) enviar({ t: "chips", opciones: paso.chips, multiple: paso.multiple === true });
      if (!sigue) enviar({ t: "listo" });
      enviar({ t: "fin" });
      controller.close();
    },
  });
}

