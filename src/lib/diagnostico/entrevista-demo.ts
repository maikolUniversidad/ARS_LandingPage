/**
 * Guion del modo demo de la entrevista (sin clave de Anthropic): ejercita toda
 * la UI —perfil, tarjetas, chips, datos, progreso, pedirAdjunto y reacción a
 * adjuntos— con reglas simples y sin estado (todo se deduce de la petición).
 */
import type { EventoEntrevista, PeticionTurno } from "@/components/diagnostico/entrevista/eventos";
import type { AdjuntoTurno, AreaId, CampoPerfil, ContactoDiagnostico, PerfilEmpresa, TamanoEmpresa, TurnoEntrevista } from "@/data/diagnostico/tipos";
import { contactoParcial, fusionarPerfil, modulosPara, perfilParcial, perfilSuficiente, puntajeAreas } from "./catalogo";
import { progresoDe } from "./entrevista";

/** Pasos del guion (dolores se pregunta dos veces: hacen falta al menos 2). */
type Paso = "sector" | "nombre" | "tamano" | "sedes" | "servicios" | "dolores" | "dolores2" | "incidentes" | "herramientasActuales" | "prioridades" | "plazo" | "contacto";
const ORDEN: Paso[] = ["sector", "nombre", "tamano", "sedes", "servicios", "dolores", "dolores2", "incidentes", "herramientasActuales", "prioridades", "plazo", "contacto"];
/** Pasos que se preguntan una sola vez aunque la respuesta no llene el campo. */
const OPCIONALES: Paso[] = ["sedes", "servicios", "dolores2", "incidentes", "plazo", "contacto"];

const CAMPO: Record<Paso, CampoPerfil> = {
  sector: "sector",
  nombre: "nombre",
  tamano: "tamano",
  sedes: "sedes",
  servicios: "servicios",
  dolores: "dolores",
  dolores2: "dolores",
  incidentes: "incidentes",
  herramientasActuales: "herramientasActuales",
  prioridades: "prioridades",
  plazo: "plazo",
  contacto: "contacto",
};

/** Frase única de cada pregunta: sirve para saber qué se preguntó antes. */
const MARCA: Record<Paso, string> = {
  sector: "¿A qué se dedica la empresa?",
  nombre: "¿Cómo se llama la empresa?",
  tamano: "¿Cuántas personas trabajan con ustedes",
  sedes: "¿En cuántas sedes o puestos operan",
  servicios: "¿Qué servicios prestan hoy",
  dolores: "¿qué es lo que más les quita el sueño",
  dolores2: "¿Qué otra cosa les complica",
  incidentes: "¿Les ha pasado algo concreto",
  herramientasActuales: "¿Con qué herramientas lo manejan hoy?",
  prioridades: "¿qué te importa más?",
  plazo: "¿Para cuándo les gustaría",
  contacto: "para guardar tu diagnóstico",
};
const MARCA_ADJUNTO = "Ya revisé «";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const asistente = (c: TurnoEntrevista[]) => c.filter((t) => t.rol === "assistant").map((t) => t.texto);
const yaPreguntado = (paso: Paso, c: TurnoEntrevista[]) => asistente(c).some((t) => t.includes(MARCA[paso]));

function lleno(paso: Paso, p: Partial<PerfilEmpresa>): boolean {
  switch (paso) {
    case "sedes":
      return Boolean(p.sedes || p.ciudad);
    case "dolores":
      return Boolean(p.dolores?.length);
    case "dolores2":
      return (p.dolores?.length ?? 0) >= 2;
    case "contacto":
      return Boolean(p.contacto?.email || p.contacto?.telefono);
    default: {
      const v = p[CAMPO[paso]];
      return Array.isArray(v) ? v.length > 0 : Boolean(v);
    }
  }
}

function siguiente(p: Partial<PerfilEmpresa>, c: TurnoEntrevista[]): Paso | null {
  for (const paso of ORDEN) {
    if (lleno(paso, p)) continue;
    if (OPCIONALES.includes(paso) && yaPreguntado(paso, c)) continue;
    return paso;
  }
  return null;
}

/** Qué preguntó el último mensaje de Ars (el saludo de la UI pregunta nombre y sector). */
function preguntado(c: TurnoEntrevista[]): Paso | null {
  const ultimo = asistente(c).at(-1);
  if (!ultimo) return "sector";
  return ORDEN.find((paso) => ultimo.includes(MARCA[paso])) ?? null;
}

/* ───────────── Extracción simple ───────────── */

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

const sectorDe = (texto: string) => SECTORES.find(([claves]) => claves.some((c) => norm(texto).includes(c)))?.[1];

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

const numeros = (texto: string) => [...texto.replace(/(\d)\.(\d{3})/g, "$1$2").matchAll(/\d+/g)].map((m) => Number(m[0]));

function tamanoDe(texto: string): { tamano: TamanoEmpresa; personal?: number } {
  const t = norm(texto);
  const n = numeros(t);
  if (t.includes("mas de") && n[0] >= 1000) return { tamano: "1000+", personal: n[0] };
  const v = n.length ? Math.max(...n) : NaN;
  if (Number.isNaN(v)) {
    if (/pequen|poca/.test(t)) return { tamano: "1-50" };
    if (/grande/.test(t)) return { tamano: "201-1000" };
    return { tamano: "51-200" };
  }
  return { tamano: v <= 50 ? "1-50" : v <= 200 ? "51-200" : v <= 1000 ? "201-1000" : "1000+", personal: v };
}

function sedesDe(texto: string): number | undefined {
  const t = norm(texto);
  const n = numeros(t);
  if (!n.length) return /una sola|solo una|una sede/.test(t) ? 1 : undefined;
  if (t.includes("mas de")) return Math.round(n[0] * 1.2);
  return Math.round(n.reduce((a, b) => a + b, 0) / n.length);
}

const ciudadDe = (texto: string) => CIUDADES.find((c) => norm(texto).includes(norm(c)));

const partes = (texto: string) =>
  texto
    .split(/\s*(?:[,;·\n]|\by\b|\btambién\b)\s*/i)
    .map((x) => x.trim().replace(/\.$/, ""))
    .filter((x) => x.length > 1)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1));

/** Respuesta que solo dice «no» / «nada» (no confundir con «No sé si hacen las rondas»). */
const NEGATIVA = /^(no|nada|ninguno|ninguna|paso|despu[eé]s|luego|prefiero no( darlo)?|no,? nada( grave)?|nada m[aá]s( por ahora)?|no,? gracias)[\s.!,]*$/i;

function contactoDe(texto: string): ContactoDiagnostico | undefined {
  const email = /[^\s@<>,;]+@[^\s@<>,;]+\.[a-z]{2,}/i.exec(texto)?.[0];
  const telefono = /\+?\d[\d\s-]{5,}\d/.exec(texto)?.[0];
  const nombre = /(?:soy|me llamo|mi nombre es)\s+(\p{L}+(?:\s+\p{L}+){0,3}?)(?=\s*(?:,|\.|$|\s+y\s|\s+de\s|\s+mi\s|\s+el\s|\s+la\s))/iu.exec(texto)?.[1];
  const cargo = /\b(gerente|director[a]?|jef[ea]|coordinador[a]?|administrador[a]?|due[nñ][oa]|propietari[oa]|supervisor[a]?|analista|socio|socia)\b(?:\s+(?:de|del)\s+[\p{L}]+(?:\s+[\p{L}]+)?)?/iu.exec(texto)?.[0];
  return contactoParcial({ nombre, cargo, email, telefono });
}

function plazoDe(texto: string): string {
  const t = norm(texto);
  if (/inmediat|urgente|ya mismo|cuanto antes|este mes/.test(t)) return "inmediato";
  if (/semana|mes/.test(t)) return "1-3 meses";
  if (/ano|semestre/.test(t)) return "este año";
  return texto.trim().slice(0, 60);
}

/** Lo que entiende el guion del último mensaje, según lo que se preguntó. */
function extraer(paso: Paso | null, texto: string): Partial<PerfilEmpresa> {
  const out: Partial<PerfilEmpresa> = {};
  const negativa = NEGATIVA.test(texto.trim());
  switch (paso) {
    case "sector":
    case "nombre": {
      const sector = sectorDe(texto);
      if (sector) out.sector = sector;
      else if (paso === "sector") out.sector = texto.split(/[,.;]/)[0].trim().slice(0, 60);
      const nombre = nombreDe(texto, paso === "sector");
      if (nombre && (paso === "nombre" || nombre !== out.sector)) out.nombre = nombre;
      break;
    }
    case "tamano":
      Object.assign(out, tamanoDe(texto));
      break;
    case "sedes": {
      const s = sedesDe(texto);
      if (s) out.sedes = s;
      const c = ciudadDe(texto);
      if (c) out.ciudad = c;
      break;
    }
    case "servicios":
      if (!negativa) out.servicios = partes(texto).slice(0, 6);
      break;
    case "dolores":
    case "dolores2":
      if (!negativa) out.dolores = partes(texto).slice(0, 6);
      break;
    case "incidentes":
      if (!negativa) out.incidentes = [texto.trim().slice(0, 160)];
      break;
    case "herramientasActuales":
      out.herramientasActuales = partes(texto).slice(0, 8);
      break;
    case "prioridades":
      out.prioridades = partes(texto).map((x) => x.toLowerCase()).slice(0, 5);
      if (!out.prioridades.length) out.prioridades = ["control"];
      break;
    case "plazo":
      if (!negativa) out.plazo = plazoDe(texto);
      break;
    case "contacto": {
      const c = contactoDe(texto);
      if (c) out.contacto = c;
      break;
    }
    default:
      out.notas = texto.slice(0, 200);
  }
  return perfilParcial(out);
}

/* ───────────── Preguntas ───────────── */

type Salida = { texto: string; chips?: string[]; multiple?: boolean };

function pregunta(paso: Paso, p: Partial<PerfilEmpresa>): Salida {
  const n = p.nombre ?? "tu empresa";
  switch (paso) {
    case "sector":
      return { texto: `¡Encantada! ${MARCA.sector}`, chips: ["Vigilancia privada", "Conjuntos residenciales", "Industria", "Escoltas y valores"] };
    case "nombre":
      return { texto: `${p.sector ? `${p.sector}, perfecto: es justo el terreno donde ARS nació. ` : ""}${MARCA.nombre}` };
    case "tamano":
      return { texto: `Mucho gusto, ${n}. ${MARCA.tamano}, contando al personal en campo?`, chips: ["Hasta 50 personas", "51 a 200", "201 a 1.000", "Más de 1.000"] };
    case "sedes":
      return { texto: `${MARCA.sedes}, y en qué ciudad está la base principal?`, chips: ["1 sede", "2 a 10 sedes", "11 a 50 sedes", "Más de 50 sedes"] };
    case "servicios":
      return {
        texto: `${MARCA.servicios} a sus clientes?`,
        chips: ["Vigilancia fija", "Vigilancia móvil", "Escoltas", "Monitoreo de alarmas", "Control de acceso"],
        multiple: true,
      };
    case "dolores":
      return {
        texto: `Ahora lo importante: ${MARCA.dolores} hoy en la operación? Puedes elegir varias o contármelo con tus palabras.`,
        chips: ["No sé si hacen las rondas", "La nómina se hace a mano", "Los informes al cliente tardan", "La comunicación es por WhatsApp", "Mucha rotación de personal"],
        multiple: true,
      };
    case "dolores2":
      return {
        texto: `Anotado. ${MARCA.dolores2} el día a día, con el personal, los clientes o los informes?`,
        chips: ["Mucha rotación de personal", "Los informes al cliente tardan", "Los turnos se cruzan", "Nada más por ahora"],
        multiple: true,
      };
    case "incidentes":
      return { texto: `${MARCA.incidentes} en los últimos meses que les haya costado, como una novedad sin reportar o un reclamo de un cliente?`, chips: ["Un hurto en un puesto", "Un reclamo de un cliente", "Una ronda que no se hizo", "No, nada grave"] };
    case "herramientasActuales":
      return { texto: `Entiendo. ${MARCA.herramientasActuales}`, chips: ["Excel", "WhatsApp", "Radio análoga", "Papel y minuta", "ERP propio"], multiple: true };
    case "prioridades":
      return {
        texto: `Si ARS resolviera solo una cosa este trimestre, ${MARCA.prioridades}`,
        chips: ["Bajar costos", "Tener control", "Clientes felices", "Cuidar al personal", "Crecer"],
        multiple: true,
      };
    case "plazo":
      return { texto: `${MARCA.plazo} tener esto funcionando?`, chips: ["Lo antes posible", "En 1 a 3 meses", "Este año", "Solo estoy explorando"] };
    case "contacto":
      return {
        texto: `Ya casi. ¿Me dejas tu nombre, cargo y un correo o celular ${MARCA.contacto} y enviártelo?`,
        chips: ["Prefiero no darlo"],
      };
  }
}

function datosDe(paso: Paso | null, p: Partial<PerfilEmpresa>): { titulo: string; texto: string }[] {
  switch (paso) {
    case "sedes":
      return p.sedes && p.sedes > 5
        ? [{ titulo: "Escala", texto: `Con ${p.sedes} sedes, una sola central con mapa en vivo ahorra decenas de llamadas por turno (estimado).` }]
        : [{ titulo: "Punto de partida", texto: "Con pocas sedes, el primer mes se puede tener todo el campo digitalizado." }];
    case "dolores":
    case "dolores2":
      return [{ titulo: "Lo que más duele", texto: (p.dolores ?? []).slice(0, 2).join(" · ") || "Operación sin evidencia" }];
    case "herramientasActuales":
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

/** Pide una foto tras los dolores y un documento antes de prioridades (si aún no subió uno así). */
function pedido(sigue: Paso | null, p: PeticionTurno): Extract<EventoEntrevista, { t: "pedirAdjunto" }> | null {
  const adj = p.adjuntos ?? [];
  if (sigue === "incidentes" && !adj.some((a) => a.tipo === "imagen" || a.tipo === "video")) {
    const s = norm(p.perfil.sector ?? "");
    const motivo = s.includes("conjunto") ? "una foto de la portería o de los monitores de cámaras" : s.includes("industria") ? "una foto de un acceso o de la garita de la planta" : "una foto de tu central de monitoreo o de un puesto";
    return { t: "pedirAdjunto", tipo: "imagen", motivo };
  }
  if (sigue === "prioridades" && !adj.some((a) => a.tipo === "documento")) {
    return { t: "pedirAdjunto", tipo: "documento", motivo: "el cuadro de turnos o un informe que le envían al cliente, en PDF" };
  }
  return null;
}

/** El adjunto más reciente al que Ars aún no ha reaccionado (cuenta las reacciones previas). */
function adjuntoNuevo(p: PeticionTurno): AdjuntoTurno | null {
  const adj = p.adjuntos ?? [];
  const reacciones = asistente(p.conversacion).filter((t) => t.includes(MARCA_ADJUNTO)).length;
  return adj.length > reacciones ? adj[adj.length - 1] : null;
}

const HABLA_DE_ARCHIVO = /sub[ií]|adjunt|te (envi|mand|compart)|ah[ií] (va|est)|\b(foto|archivo|video|pdf|documento|imagen)\b/i;

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Stream NDJSON simulado: ejercita la UI sin clave de Anthropic. */
export function streamDemoEntrevista(p: PeticionTurno): ReadableStream<Uint8Array> {
  const cod = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enviar = (e: EventoEntrevista) => controller.enqueue(cod.encode(`${JSON.stringify(e)}\n`));
      const ultimo = p.conversacion[p.conversacion.length - 1].texto;
      const adjunto = adjuntoNuevo(p);
      // Si el mensaje solo acompaña un archivo, no se interpreta como respuesta.
      const soloArchivo = Boolean(adjunto) && ultimo.length < 120 && HABLA_DE_ARCHIVO.test(ultimo);
      const paso = preguntado(p.conversacion) ?? siguiente(p.perfil, p.conversacion);
      let cambios = soloArchivo ? {} : extraer(paso, ultimo);
      let perfil = fusionarPerfil(p.perfil, cambios);
      // Demo: si tras preguntar dos veces solo hay un dolor, se completa con uno genérico.
      if (paso === "dolores2" && (perfil.dolores?.length ?? 0) < 2) {
        cambios = fusionarPerfil(cambios, { dolores: [...(perfil.dolores ?? []), "Poca visibilidad de lo que pasa en campo"] });
        perfil = fusionarPerfil(p.perfil, cambios);
      }
      // Si solo comentó el archivo, se repite la pregunta pendiente en vez de saltarla.
      const sigue = soloArchivo && paso && !lleno(paso, perfil) ? paso : siguiente(perfil, p.conversacion);
      const listo = !sigue && perfilSuficiente(perfil);

      let salida: Salida;
      if (sigue) {
        salida = pregunta(sigue, perfil);
        if (!soloArchivo && (paso === "dolores" || paso === "dolores2")) salida.texto = `Eso lo vemos muchísimo, y tiene arreglo. ${salida.texto}`;
        if (!soloArchivo && paso === "herramientasActuales") salida.texto = `Perfecto, con eso ya sé desde dónde partimos. ${salida.texto}`;
      } else {
        const resumen = [perfil.sector?.toLowerCase(), perfil.sedes ? `${perfil.sedes} sedes` : perfil.ciudad, perfil.dolores?.[0]?.toLowerCase()].filter(Boolean).join(", ");
        const gracias = perfil.contacto?.nombre ? `¡Gracias, ${perfil.contacto.nombre.split(" ")[0]}!` : "¡Gracias!";
        salida = {
          texto: `${gracias} Ya tengo una buena foto de ${perfil.nombre}: ${resumen}. Mis agentes por área están listos para revisar tu operación y armar el diagnóstico.`,
          chips: ["Ver mi diagnóstico"],
        };
      }
      if (adjunto) {
        const primera = adjunto.resumen.split(/(?<=\.)\s/)[0];
        salida.texto = `${MARCA_ADJUNTO}${adjunto.nombre}»: ${primera.charAt(0).toLowerCase()}${primera.slice(1)} ${salida.texto}`;
      }
      const pide = listo ? null : pedido(sigue, { ...p, perfil });
      if (pide) salida.texto = `${salida.texto} Y si tienes a mano ${pide.motivo}, ${pide.tipo === "imagen" ? "súbela" : "súbelo"} con el clip; me ayuda mucho.`;

      await espera(350);
      const palabras = salida.texto.split(/(\s+)/);
      for (let i = 0; i < palabras.length; i += 4) {
        enviar({ t: "texto", d: palabras.slice(i, i + 4).join("") });
        await espera(p.voz ? 30 : 45);
      }
      if (Object.keys(cambios).length) enviar({ t: "perfil", cambios });

      // Tarjetas: por sector al presentarse; por lo que cuenta en dolores, incidentes, herramientas y prioridades; por el adjunto.
      const habla = paso === "dolores" || paso === "dolores2" || paso === "incidentes" || paso === "herramientasActuales" || paso === "prioridades";
      const fuente = [habla && !soloArchivo ? ultimo : "", adjunto ? `${adjunto.resumen} ${adjunto.hallazgos.join(" ")}` : ""].join(" ").trim();
      const puntos = fuente ? [...puntajeAreas(fuente).entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id) : [];
      const areas = (puntos.length ? puntos : paso === "sector" || paso === "nombre" ? areasPorSector(perfil.sector) : []).slice(0, 3);
      const modulos = fuente ? modulosPara(fuente, 3) : [];
      if (areas.length || modulos.length) enviar({ t: "mostrar", areas, modulos });
      if (!p.voz) for (const dato of datosDe(soloArchivo ? null : paso, perfil)) enviar({ t: "dato", dato });
      if (salida.chips) enviar({ t: "chips", opciones: p.voz ? salida.chips.slice(0, 3) : salida.chips, multiple: salida.multiple === true });
      if (pide) enviar(pide);
      enviar(progresoDe(perfil, p.conversacion, sigue ? CAMPO[sigue] : null, listo));
      if (listo) enviar({ t: "listo" });
      enviar({ t: "fin" });
      controller.close();
    },
  });
}
