/**
 * Modo demo SOLO para desarrollo (ASISTENTE_DEMO=1 y sin ANTHROPIC_API_KEY):
 * respuestas guionadas que ejercitan el stream, las herramientas y las
 * tarjetas para probar la UI sin gastar ni tener claves. Nunca en producción.
 */
import { buscarAnalitica } from "@/data/asistente";
import { ejecutarHerramienta } from "./herramientas";
import type { EventoStream, PeticionChat } from "./tipos";

export function demoActivo(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.ASISTENTE_DEMO === "1";
}

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

type Paso = { nombre: string; entrada: unknown };
type Guion = { texto: string; herramienta?: Paso; extra?: Paso[]; despues?: string; cita?: { documento: string; texto: string } };

function guion(p: PeticionChat): Guion {
  const q = norm(p.mensajes[p.mensajes.length - 1]?.texto ?? "");
  const video = p.documentos.find((d) => d.codificacion === "fotogramas");
  if (video) {
    const marcas = (video.fotogramas ?? []).map((f) => `${f.t.toFixed(1)} s`).join(", ");
    return {
      texto: `**Modo demo** — recibí «${video.nombre}»: ${video.fotogramas?.length ?? 0} fotogramas (${marcas}) de un video de ${video.duracion ?? "?"} s. Con ANTHROPIC_API_KEY te describiría qué pasa en cada momento y qué analítica se dispara.`,
      herramienta: { nombre: "sugerir", entrada: { opciones: ["¿Qué analítica lo detecta?", "Muéstrame otra analítica"] } },
    };
  }
  const doc = p.documentos.find((d) => d.codificacion === "texto");
  if (doc) {
    return {
      texto: `**Modo demo** — leí «${doc.nombre}». Con la clave real te daría resumen, estado y qué módulo de ARS te sirve, con citas.`,
      cita: { documento: doc.nombre, texto: doc.datos.slice(0, 160) },
      herramienta: { nombre: "sugerir", entrada: { opciones: ["¿Qué le falta al documento?", "¿Qué módulo me sirve?"] } },
    };
  }
  const pagina = p.contexto.seccion?.titulo || p.contexto.ruta;
  if (/demo|precio|cotiz|asesor|contact/.test(q)) {
    return { texto: "¡Con gusto! Te dejo el formulario para que el equipo comercial te contacte.", herramienta: { nombre: "abrir_contacto", entrada: { motivo: "Quiero una demo de ARS" } } };
  }
  if (/plataforma|erp|turno|ronda/.test(q)) {
    return {
      texto: "La **plataforma ARS** conecta turnos, rondas, cámaras, IA, alertas y reportes en un solo lugar. Te llevo a sus funcionalidades.",
      herramienta: { nombre: "ir_a", entrada: { ruta: "/plataforma", ancla: "funcionalidades" } },
      despues: "Ahí ves las 14 funcionalidades agrupadas en Operación, Monitoreo, Inteligencia y Reportes.",
    };
  }
  if (/mediana|pequena|grande|tamano/.test(q)) {
    const tam = /mediana/.test(q) ? "mediana" : /pequena/.test(q) ? "pequeña" : "grande";
    return {
      extra: [
        { nombre: "recordar", entrada: { clave: "tamano", valor: `empresa ${tam}` } },
        { nombre: "sugerir", entrada: { opciones: ["Tengo 3 sedes y 40 cámaras", "Es una cadena de tiendas", "Quiero una demo"] } },
      ],
      texto: "Para una empresa mediana (orientativo): plataforma operativa con turnos, rondas y central de monitoreo, más analíticas según tu negocio:\n- Retail: filas, aforo, hurto\n- Logística: placas, EPP, pasillos\n\nEl alcance final se define con el equipo.",
      herramienta: { nombre: "recomendar", entrada: { analiticas: ["filas", "aforo", "epp"], paginas: [{ ruta: "/plataforma", ancla: "casos" }] } },
    };
  }
  const sedes = /(\d+)\s*sedes?/.exec(q);
  if (sedes || /tiendas|retail|bodega|logistic/.test(q)) {
    const extra: Paso[] = [];
    if (sedes) extra.push({ nombre: "recordar", entrada: { clave: "sedes", valor: sedes[1] } });
    const cam = /(\d+)\s*camaras?/.exec(q);
    if (cam) extra.push({ nombre: "recordar", entrada: { clave: "camaras", valor: cam[1] } });
    if (/tiendas|retail/.test(q)) extra.push({ nombre: "recordar", entrada: { clave: "sector", valor: "retail" } });
    extra.push({ nombre: "sugerir", entrada: { opciones: ["Muéstrame la analítica de filas", "¿Cómo controlo el hurto?"] } });
    return { texto: "Anotado. Con eso te recomiendo empezar por filas, aforo y hurto, y la central de monitoreo para ver todas las sedes.", extra, herramienta: { nombre: "recomendar", entrada: { analiticas: ["filas", "aforo", "hurto"] } } };
  }
  if (/esta pagina|estoy viendo|what am i/.test(q)) {
    return { texto: `Estás en ${p.contexto.ruta}${p.contexto.analitica ? `, con la analítica «${p.contexto.analitica.nombre}» abierta` : ""}. Lo que ves ahora: ${pagina}.` };
  }
  const pideAnalitica = /analitica|muestra|ensena|fila|camara|vision|show/.test(q);
  const hit = pideAnalitica ? buscarAnalitica(q.replace(/muestrame|una|analitica|de|ver/g, " "))[0] : undefined;
  if (pideAnalitica) {
    const id = hit?.id ?? "filas";
    return { texto: "Claro, te la muestro en el visor.", herramienta: { nombre: "mostrar_analitica", entrada: { id } }, despues: "A la izquierda está la simulación 3D y a la derecha la prueba real." };
  }
  if (p.documentos.length) {
    return { texto: `Recibí ${p.documentos.length} documento(s): ${p.documentos.map((d) => d.nombre).join(", ")}. (Modo demo: con ANTHROPIC_API_KEY te daría el resumen real.)` };
  }
  return {
    texto: "ARS Intelligence es una plataforma de **seguridad integral con IA**: une personas, cámaras, analíticas de video, alertas con evidencia y reportes en una sola operación, sin cambiar tus cámaras. ¿Quieres ver la plataforma o las analíticas?",
    herramienta: { nombre: "recomendar", entrada: { paginas: [{ ruta: "/plataforma" }, { ruta: "/vision", ancla: "indice" }] } },
  };
}

export function streamSimulado(p: PeticionChat): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  const g = guion(p);
  return new ReadableStream({
    async start(c) {
      const enviar = (e: EventoStream) => c.enqueue(enc.encode(`${JSON.stringify(e)}\n`));
      const escribir = async (t: string) => {
        for (const trozo of t.match(/[\s\S]{1,6}/g) ?? []) {
          enviar({ t: "texto", d: trozo });
          await new Promise((r) => setTimeout(r, 18));
        }
      };
      await escribir(g.texto);
      if (g.cita) enviar({ t: "cita", cita: g.cita });
      for (const paso of g.extra ?? []) {
        const r = ejecutarHerramienta(paso.nombre, paso.entrada);
        for (const accion of r.acciones) enviar({ t: "accion", accion });
        for (const tarjeta of r.tarjetas) enviar({ t: "tarjeta", tarjeta });
      }
      if (g.herramienta) {
        const r = ejecutarHerramienta(g.herramienta.nombre, g.herramienta.entrada);
        for (const accion of r.acciones) enviar({ t: "accion", accion });
        for (const tarjeta of r.tarjetas) enviar({ t: "tarjeta", tarjeta });
        if (g.despues) await escribir(`\n\n${g.despues}`);
      }
      enviar({ t: "fin", motivo: "demo" });
      c.close();
    },
  });
}
