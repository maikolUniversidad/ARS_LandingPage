/**
 * Guion de la entrevista de «Propuesta ARS»: bloques, pantallas, opciones y
 * validación. Todo en español, trato de usted.
 */
import type { RangoVigilantes, Respuestas } from "@/data/propuesta/tipos";

export const RESPUESTAS_VACIAS: Respuestas = {
  nombre: "",
  cargo: "",
  empresa: "",
  ciudad: "",
  vigilantes: "",
  sedes: "",
  servicios: [],
  central: "",
  aplicaciones: [],
  erp: "",
  datos: [],
  integraciones: "",
  dolores: [],
  reportes: [],
  plazo: "",
  notas: "",
  email: "",
  telefono: "",
  autoriza: false,
};

export const RANGOS: { valor: RangoVigilantes; etiqueta: string }[] = [
  { valor: "1-50", etiqueta: "Hasta 50" },
  { valor: "51-200", etiqueta: "51 a 200" },
  { valor: "201-1000", etiqueta: "201 a 1.000" },
  { valor: "1000+", etiqueta: "Más de 1.000" },
];

export const CENTRAL: { valor: Respuestas["central"]; etiqueta: string }[] = [
  { valor: "si", etiqueta: "Sí, propia" },
  { valor: "no", etiqueta: "No tenemos" },
  { valor: "en-proyecto", etiqueta: "Está en proyecto" },
];

export const OPCIONES = {
  servicios: ["Vigilancia física", "Escoltas", "Medios tecnológicos", "Monitoreo remoto", "Conjuntos residenciales", "Seguridad empresarial"],
  aplicaciones: [
    "Excel",
    "WhatsApp",
    "Radio análoga",
    "ERP",
    "Software contable",
    "Software de nómina",
    "App de rondas",
    "VMS / grabadores",
    "Control de acceso",
    "Papel y minutas",
  ],
  datos: ["Papel", "Excel suelto", "Nube (Drive/OneDrive)", "Servidor propio", "Dentro del ERP", "En la app de cada proveedor", "No lo tenemos claro"],
  dolores: [
    "No sé quién llegó al puesto",
    "Rondas sin evidencia",
    "Reportes al cliente a mano",
    "Nómina con horas extra en Excel",
    "Todo pasa por WhatsApp",
    "Novedades que se pierden",
    "Rotación de personal",
    "Información en muchos sistemas",
    "Auditorías y Supervigilancia",
    "Capacitación sin control",
  ],
  reportes: [
    "Informe mensual al cliente",
    "Novedades diarias para gerencia",
    "Cumplimiento de rondas",
    "Asistencia y ausentismo",
    "Horas extra y nómina",
    "Reportes para Supervigilancia",
    "Indicadores por sede",
    "Costos por contrato",
  ],
  plazo: ["Este mes", "Este trimestre", "Este año", "Explorando"],
} as const;

/** Apps que hacen aparecer la pregunta por el nombre del ERP / software contable. */
export const APPS_CON_ERP = ["ERP", "Software contable", "Software de nómina"];

export type BloqueId = "quien" | "operacion" | "aplicaciones" | "dolores" | "contacto";

export const BLOQUES: { id: BloqueId; titulo: string }[] = [
  { id: "quien", titulo: "Quién es usted" },
  { id: "operacion", titulo: "Su operación" },
  { id: "aplicaciones", titulo: "Sus aplicaciones y datos" },
  { id: "dolores", titulo: "Lo que le duele y los reportes" },
  { id: "contacto", titulo: "Contacto" },
];

export type PantallaId =
  | "persona"
  | "empresa"
  | "tamano"
  | "servicios"
  | "central"
  | "aplicaciones"
  | "datos"
  | "integraciones"
  | "dolores"
  | "reportes"
  | "plazo"
  | "contacto";

export type Pantalla = { id: PantallaId; bloque: BloqueId; titulo: string; ayuda?: string };

export const PANTALLAS: Pantalla[] = [
  { id: "persona", bloque: "quien", titulo: "Para empezar, ¿con quién tenemos el gusto?" },
  { id: "empresa", bloque: "quien", titulo: "¿Qué empresa representa?" },
  { id: "tamano", bloque: "operacion", titulo: "¿De qué tamaño es su operación?", ayuda: "Un aproximado es suficiente." },
  { id: "servicios", bloque: "operacion", titulo: "¿Qué servicios prestan?", ayuda: "Puede marcar varios." },
  { id: "central", bloque: "operacion", titulo: "¿Tienen central de monitoreo propia?" },
  { id: "aplicaciones", bloque: "aplicaciones", titulo: "¿Con qué trabajan hoy?", ayuda: "Marque todo lo que usen, aunque sea poco." },
  { id: "datos", bloque: "aplicaciones", titulo: "¿Dónde viven hoy sus datos?", ayuda: "Turnos, novedades, hojas de vida, nómina…" },
  {
    id: "integraciones",
    bloque: "aplicaciones",
    titulo: "¿Qué le gustaría que se conectara?",
    ayuda: "Por ejemplo: «que la nómina salga de los turnos sin digitar dos veces». Si no lo tiene claro, siga adelante.",
  },
  { id: "dolores", bloque: "dolores", titulo: "¿Qué es lo que más le duele hoy?", ayuda: "Marque lo que aplique; también puede escribirlo." },
  { id: "reportes", bloque: "dolores", titulo: "¿Qué reportes le piden o necesita?", ayuda: "Al cliente, a gerencia, a Supervigilancia…" },
  { id: "plazo", bloque: "dolores", titulo: "¿Para cuándo lo necesita?" },
  { id: "contacto", bloque: "contacto", titulo: "¿Cómo le hacemos llegar la propuesta?" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(v: string) {
  return EMAIL.test(v.trim());
}

/** Errores amables por campo de la pantalla; vacío = puede avanzar. */
export function validar(id: PantallaId, r: Respuestas): Partial<Record<keyof Respuestas, string>> {
  const e: Partial<Record<keyof Respuestas, string>> = {};
  switch (id) {
    case "persona":
      if (r.nombre.trim().length < 2) e.nombre = "¿Cómo le llamamos? Con su nombre basta.";
      break;
    case "empresa":
      if (r.empresa.trim().length < 2) e.empresa = "Cuéntenos el nombre de la empresa para armar la propuesta.";
      break;
    case "tamano":
      if (!r.vigilantes) e.vigilantes = "Elija el rango que más se acerque.";
      break;
    case "servicios":
      if (!r.servicios.length) e.servicios = "Marque al menos uno, o escríbalo en «Otro».";
      break;
    case "central":
      if (!r.central) e.central = "Elija una opción.";
      break;
    case "aplicaciones":
      if (!r.aplicaciones.length) e.aplicaciones = "Marque al menos una; si es solo papel, también cuenta.";
      break;
    case "dolores":
      if (!r.dolores.length) e.dolores = "Marque al menos uno: es lo que más pesa en la propuesta.";
      break;
    case "contacto":
      if (!emailValido(r.email)) e.email = "Revise el correo: parece que le falta algo.";
      if (r.telefono.trim() && r.telefono.replace(/\D/g, "").length < 7) e.telefono = "El teléfono parece incompleto.";
      if (!r.autoriza) e.autoriza = "Necesitamos su autorización para tratar sus datos y enviarle la propuesta.";
      break;
  }
  return e;
}
