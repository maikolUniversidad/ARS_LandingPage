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

function guion(p: PeticionChat): { texto: string; herramienta?: { nombre: string; entrada: unknown }; despues?: string } {
  const q = norm(p.mensajes[p.mensajes.length - 1]?.texto ?? "");
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
    return {
      texto: "Para una empresa mediana (orientativo): plataforma operativa con turnos, rondas y central de monitoreo, más analíticas según tu negocio:\n- Retail: filas, aforo, hurto\n- Logística: placas, EPP, pasillos\n\nEl alcance final se define con el equipo.",
      herramienta: { nombre: "recomendar", entrada: { analiticas: ["filas", "aforo", "epp"], paginas: [{ ruta: "/plataforma", ancla: "casos" }] } },
    };
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
