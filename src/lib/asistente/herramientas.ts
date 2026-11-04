/**
 * Herramientas (tool use) del asistente. Se usan en el servidor para Claude y
 * sus nombres/parámetros se repiten en el agente de voz de ElevenLabs como
 * "client tools", así que ambos cerebros mueven la web igual.
 *
 * Las acciones de navegación se ejecutan en el navegador: el servidor valida
 * la llamada, emite un evento `accion` en el stream y le responde a Claude que
 * la acción quedó hecha.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { analiticas, familias } from "@/data/analiticas";
import { RUTAS_SITIO, buscarAnalitica } from "@/data/asistente";
import { CLAVES_PERFIL, type Accion, type ClavePerfil, type Tarjeta } from "./tipos";

export const RUTAS_VALIDAS = RUTAS_SITIO.map((r) => r.ruta);

const porId = new Map(analiticas.map((a) => [a.id, a]));
const nombreFamilia = new Map(familias.map((f) => [f.id, f.nombre]));

/** Orden fijo: cambiar el orden invalida la caché de prompt. */
export const HERRAMIENTAS: Anthropic.Beta.BetaTool[] = [
  {
    name: "ir_a",
    description:
      "Lleva a la persona a una página del sitio de ARS (y opcionalmente a una sección por su ancla). Úsala cuando pida ver, abrir o ir a algo, o cuando acompañarla a la sección correcta sea claramente útil. No la uses para analíticas de video: para eso está mostrar_analitica.",
    input_schema: {
      type: "object",
      properties: {
        ruta: { type: "string", enum: RUTAS_VALIDAS, description: "Ruta del sitio." },
        ancla: {
          type: "string",
          description: "Id de la sección dentro de la página (sin #), solo si existe en el mapa del sitio.",
        },
      },
      required: ["ruta"],
      additionalProperties: false,
    },
  },
  {
    name: "mostrar_analitica",
    description:
      "Abre una analítica de video concreta en el visor de /vision (simulación 3D + prueba real). Usa el id exacto del catálogo.",
    input_schema: {
      type: "object",
      properties: { id: { type: "string", description: "Id de la analítica, tal como aparece en el catálogo." } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "abrir_contacto",
    description:
      "Muestra en el chat el formulario de contacto con el equipo comercial de ARS (demo, cotización, propuesta). Úsala cuando la persona quiera hablar con alguien, pedir una demo o precios.",
    input_schema: {
      type: "object",
      properties: {
        motivo: { type: "string", description: "Resumen breve de lo que la persona necesita, para prellenar el mensaje." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "resaltar",
    description:
      "Resalta y desplaza hasta una sección de la página ACTUAL (por su id) para señalarle algo a la persona sin cambiar de página.",
    input_schema: {
      type: "object",
      properties: {
        ancla: { type: "string", description: "Id de la sección en la página actual." },
        nota: { type: "string", description: "Texto corto opcional que acompaña el resaltado." },
      },
      required: ["ancla"],
      additionalProperties: false,
    },
  },
  {
    name: "recomendar",
    description:
      "Muestra tarjetas con enlaces (analíticas y/o páginas) debajo de tu respuesta SIN navegar. Úsala para sugerir 1 a 4 lugares relevantes.",
    input_schema: {
      type: "object",
      properties: {
        analiticas: { type: "array", items: { type: "string" }, description: "Ids de analíticas a sugerir." },
        paginas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              ruta: { type: "string", enum: RUTAS_VALIDAS },
              ancla: { type: "string" },
            },
            required: ["ruta"],
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "recordar",
    description:
      "Guarda un dato que la persona contó de sí misma o de su empresa para personalizar el resto de la visita (queda solo en su navegador). Úsala en cuanto lo diga, sin anunciarlo. Nunca guardes datos sensibles (documentos de identidad, contraseñas, datos financieros o de salud).",
    input_schema: {
      type: "object",
      properties: {
        clave: { type: "string", enum: [...CLAVES_PERFIL], description: "Qué dato es." },
        valor: { type: "string", description: "El dato, breve (p. ej. 'retail', 'mediana · 3 sedes', '40 cámaras')." },
      },
      required: ["clave", "valor"],
      additionalProperties: false,
    },
  },
  {
    name: "olvidar",
    description: "Borra un dato guardado con recordar (o todos con clave 'todo') cuando la persona lo pida.",
    input_schema: {
      type: "object",
      properties: { clave: { type: "string", enum: [...CLAVES_PERFIL, "todo"] } },
      required: ["clave"],
      additionalProperties: false,
    },
  },
  {
    name: "analizar_video",
    description:
      "Extrae fotogramas del video (o imagen) de prueba real de una analítica de /vision y te los envía en el siguiente mensaje para que describas qué pasa, segundo a segundo. Úsala cuando pidan analizar, explicar o 'ver' el video real de una analítica. Solo funciona con analíticas marcadas [evidencia real].",
    input_schema: {
      type: "object",
      properties: { id: { type: "string", description: "Id de la analítica con evidencia real." } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "sugerir",
    description:
      "Muestra 2 o 3 respuestas rápidas (botones) que la persona podría decir a continuación, en su idioma y en primera persona (p. ej. 'Muéstrame el video real', 'Tengo 3 sedes'). Úsala al final de casi todas tus respuestas, salvo en modo voz.",
    input_schema: {
      type: "object",
      properties: { opciones: { type: "array", items: { type: "string" }, description: "2 o 3 opciones de máx. 50 caracteres." } },
      required: ["opciones"],
      additionalProperties: false,
    },
  },
  {
    name: "buscar_analiticas",
    description:
      "Busca en el catálogo de analíticas de video por palabras clave (p. ej. 'casco', 'fila', 'placa'). Devuelve hasta 5 coincidencias con id, nombre y descripción corta.",
    input_schema: {
      type: "object",
      properties: { consulta: { type: "string" } },
      required: ["consulta"],
      additionalProperties: false,
    },
  },
];

export type ResultadoHerramienta = {
  /** Texto que vuelve a Claude como tool_result. */
  resultado: string;
  esError: boolean;
  acciones: Accion[];
  tarjetas: Tarjeta[];
};

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const str = (v: unknown, max = 300): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

function anclaValida(ruta: string, ancla: string | undefined): string | undefined {
  if (!ancla) return undefined;
  const limpia = ancla.replace(/^#/, "");
  const r = RUTAS_SITIO.find((x) => x.ruta === ruta);
  return r?.anclas.some((a) => a.id === limpia) ? limpia : undefined;
}

function tarjetaAnalitica(id: string): Tarjeta | null {
  const a = porId.get(id);
  if (!a) return null;
  return { tipo: "analitica", id: a.id, nombre: a.nombre, corta: a.corta, familia: nombreFamilia.get(a.familia) ?? a.familia };
}

function tarjetaRuta(ruta: string, ancla?: string): Tarjeta | null {
  const r = RUTAS_SITIO.find((x) => x.ruta === ruta);
  if (!r) return null;
  const a = ancla ? r.anclas.find((x) => x.id === ancla) : undefined;
  // Textos de tarjeta para personas: sin notas técnicas del mapa del sitio.
  const limpio = (t: string) =>
    t
      .replace(/\([^)]*\)/g, "")
      .replace(/^\d+\s*·\s*/, "")
      .split(/[:—]/)[0]
      .trim();
  const resumen = (t: string) => {
    const frase = t.replace(/\([^)]*\)/g, "").split(/(?<=\.)\s/)[0].trim();
    return frase.length > 120 ? `${frase.slice(0, 117)}…` : frase;
  };
  return {
    tipo: "enlace",
    ruta,
    ancla,
    titulo: a ? limpio(a.descripcion) : r.titulo,
    descripcion: a ? r.titulo : resumen(r.descripcion),
  };
}

const error = (resultado: string): ResultadoHerramienta => ({ resultado, esError: true, acciones: [], tarjetas: [] });

/** Valida y ejecuta (o traduce a acción de cliente) una llamada de herramienta. */
export function ejecutarHerramienta(nombre: string, entrada: unknown): ResultadoHerramienta {
  const e = obj(entrada);
  switch (nombre) {
    case "ir_a": {
      const ruta = str(e.ruta, 80);
      if (!ruta || !RUTAS_VALIDAS.includes(ruta)) return error(`Ruta inválida. Rutas válidas: ${RUTAS_VALIDAS.join(", ")}`);
      const ancla = anclaValida(ruta, str(e.ancla, 80));
      const t = tarjetaRuta(ruta, ancla);
      return {
        resultado: `Listo: el navegador de la persona ya está en ${ruta}${ancla ? `#${ancla}` : ""}.`,
        esError: false,
        acciones: [{ tipo: "ir_a", ruta, ancla }],
        tarjetas: t ? [t] : [],
      };
    }
    case "mostrar_analitica": {
      const id = str(e.id, 80);
      const t = id ? tarjetaAnalitica(id) : null;
      if (!id || !t) {
        const sug = id ? buscarAnalitica(id).map((x) => x.id) : [];
        return error(`No existe la analítica "${id ?? ""}".${sug.length ? ` Quizá: ${sug.join(", ")}` : ""}`);
      }
      return {
        resultado: `Listo: el visor de /vision ya muestra «${porId.get(id)?.nombre}».`,
        esError: false,
        acciones: [{ tipo: "mostrar_analitica", id }],
        tarjetas: [t],
      };
    }
    case "abrir_contacto": {
      const motivo = str(e.motivo, 500);
      return {
        resultado: "Listo: el formulario de contacto está abierto en el chat. Invita a la persona a completarlo.",
        esError: false,
        acciones: [{ tipo: "abrir_contacto", motivo }],
        tarjetas: [{ tipo: "contacto", motivo }],
      };
    }
    case "resaltar": {
      const ancla = str(e.ancla, 80)?.replace(/^#/, "");
      if (!ancla) return error("Falta el ancla.");
      return {
        resultado: `Listo: la sección #${ancla} quedó resaltada (si existe en la página actual).`,
        esError: false,
        acciones: [{ tipo: "resaltar", ancla, nota: str(e.nota, 160) }],
        tarjetas: [],
      };
    }
    case "recomendar": {
      const tarjetas: Tarjeta[] = [];
      const ids = Array.isArray(e.analiticas) ? e.analiticas : [];
      for (const id of ids.slice(0, 4)) {
        const t = typeof id === "string" ? tarjetaAnalitica(id) : null;
        if (t) tarjetas.push(t);
      }
      const paginas = Array.isArray(e.paginas) ? e.paginas : [];
      for (const p of paginas.slice(0, 4)) {
        const po = obj(p);
        const ruta = str(po.ruta, 80);
        if (!ruta || !RUTAS_VALIDAS.includes(ruta)) continue;
        const t = tarjetaRuta(ruta, anclaValida(ruta, str(po.ancla, 80)));
        if (t) tarjetas.push(t);
      }
      if (!tarjetas.length) return error("Ningún id o ruta era válido.");
      return { resultado: `Mostradas ${tarjetas.length} tarjetas.`, esError: false, acciones: [], tarjetas: tarjetas.slice(0, 6) };
    }
    case "recordar": {
      const clave = str(e.clave, 40) as ClavePerfil | undefined;
      const valor = str(e.valor, 160);
      if (!clave || !(CLAVES_PERFIL as readonly string[]).includes(clave) || !valor) return error("Clave o valor inválido.");
      return { resultado: "Guardado.", esError: false, acciones: [{ tipo: "recordar", clave, valor }], tarjetas: [] };
    }
    case "olvidar": {
      const clave = str(e.clave, 40);
      if (!clave || (clave !== "todo" && !(CLAVES_PERFIL as readonly string[]).includes(clave))) return error("Clave inválida.");
      return { resultado: "Borrado.", esError: false, acciones: [{ tipo: "olvidar", clave: clave as ClavePerfil | "todo" }], tarjetas: [] };
    }
    case "analizar_video": {
      const id = str(e.id, 80);
      const a = id ? porId.get(id) : undefined;
      if (!a) return error(`No existe la analítica "${id ?? ""}".`);
      if (!a.video?.src && !a.video?.img) return error(`«${a.nombre}» no tiene video ni imagen real todavía; solo simulación 3D.`);
      const t = tarjetaAnalitica(a.id);
      return {
        resultado: `Listo: el navegador está extrayendo los fotogramas de la prueba real de «${a.nombre}» (${a.video.chapa}). Llegarán en el próximo mensaje: avisa en una frase que lo vas a analizar y espera.`,
        esError: false,
        acciones: [{ tipo: "mostrar_analitica", id: a.id }, { tipo: "analizar_video", id: a.id }],
        tarjetas: t ? [t] : [],
      };
    }
    case "sugerir": {
      const lista = Array.isArray(e.opciones) ? e.opciones : [];
      const opciones = lista
        .map((o) => str(o, 60))
        .filter((o): o is string => Boolean(o))
        .slice(0, 3);
      if (!opciones.length) return error("Sin opciones.");
      return { resultado: "Mostradas.", esError: false, acciones: [], tarjetas: [{ tipo: "sugerencias", opciones }] };
    }
    case "buscar_analiticas": {
      const q = str(e.consulta, 120);
      if (!q) return error("Falta la consulta.");
      const r = buscarAnalitica(q);
      return {
        resultado: r.length ? JSON.stringify(r) : "Sin coincidencias. Revisa el catálogo del system prompt.",
        esError: false,
        acciones: [],
        tarjetas: [],
      };
    }
    default:
      return error(`Herramienta desconocida: ${nombre}`);
  }
}
