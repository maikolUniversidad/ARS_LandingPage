/**
 * Propuesta de ejemplo (empresa ficticia). Sirve de fixture para la UI y el PDF
 * mientras no hay IA configurada, y de base al modo demo del servidor.
 */
import type { Propuesta, Respuestas } from "./tipos";

export const RESPUESTAS_EJEMPLO: Respuestas = {
  nombre: "Laura Gómez",
  cargo: "Gerente de operaciones",
  empresa: "Seguridad Andina",
  ciudad: "Medellín",
  vigilantes: "201-1000",
  sedes: "48",
  servicios: ["Vigilancia física", "Medios tecnológicos"],
  central: "si",
  aplicaciones: ["Excel", "WhatsApp", "Radio análoga", "VMS / grabadores"],
  erp: "",
  datos: ["Excel suelto", "Dentro del ERP", "Papel"],
  integraciones: "Que la nómina salga de los turnos y que turnos, nómina, contabilidad y facturación estén en un solo lugar.",
  dolores: ["No sé quién llegó al puesto", "Reportes al cliente a mano", "Nómina con horas extra en Excel"],
  reportes: ["Informe mensual al cliente", "Novedades diarias para gerencia"],
  plazo: "Este trimestre",
  notas: "",
  email: "laura@seguridadandina.co",
  telefono: "+57 300 000 0000",
  autoriza: true,
};

export const PROPUESTA_EJEMPLO: Propuesta = {
  id: "ARS-2611-7K3Q",
  fecha: "2026-11-04T15:00:00.000Z",
  empresa: "Seguridad Andina",
  contacto: { nombre: "Laura Gómez", cargo: "Gerente de operaciones", email: "laura@seguridadandina.co", telefono: "+57 300 000 0000", ciudad: "Medellín" },
  situacion:
    "Hoy Seguridad Andina opera 48 sedes con Excel, WhatsApp y radio análoga. La programación y la nómina viven en hojas distintas, y el informe al cliente se arma a mano cada mes.",
  titular: "De 48 sedes en Excel y WhatsApp a una sola operación trazada, con la nómina y la contabilidad en el ERP de ARS.",
  arsSuple: [
    "Marcación con rostro y rondas con QR en el celular de cada vigilante, aun sin señal.",
    "Un mapa vivo en su central con quién está en cada puesto.",
    "Radio en el teléfono que queda grabada, en lugar de radio análoga y WhatsApp.",
    "Nómina calculada desde los turnos que de verdad se trabajaron.",
    "Informes al cliente que se arman solos con la evidencia de cada turno.",
  ],
  seQueda: ["El contador externo, que recibe de ARS la contabilidad al día en lugar de planillas sueltas.", "Sus cámaras y grabadores actuales."],
  modulos: [
    { area: "operacion-en-campo", modulo: "turnos-y-programacion", porQue: "Para programar las 48 sedes en un solo lugar y saber quién debía estar." },
    { area: "operacion-en-campo", modulo: "control-de-asistencia-y-relevos", porQue: "Para dejar de llamar puesto por puesto a las seis de la mañana." },
    { area: "operacion-en-campo", modulo: "rondas-qr", porQue: "Para demostrarle al cliente que la ronda sí se hizo." },
    { area: "centro-de-operaciones", modulo: "sala-de-control", porQue: "Para que la central vea todas las sedes en un mapa." },
    { area: "comunicacion-y-emergencias", modulo: "radio-ptt", porQue: "Para reemplazar la radio análoga y el grupo de WhatsApp." },
    { area: "gestion-humana", modulo: "nomina", porQue: "Para que las horas extra salgan de los turnos y no del Excel." },
    { area: "finanzas-y-erp", modulo: "agente-interoperador-de-datos", porQue: "Para traer una sola vez a ARS los datos que hoy están regados en hojas de Excel." },
  ],
  lineaDeTrabajo: [
    {
      nombre: "Fase 1 · El campo en el teléfono",
      duracion: "4 a 6 semanas (estimado)",
      objetivo: "Que cada turno, marcación y ronda quede con evidencia.",
      entregables: ["Programación de las 48 sedes cargada", "App del vigilante en todos los puestos", "Rondas con QR en las sedes piloto"],
      modulos: ["turnos-y-programacion", "control-de-asistencia-y-relevos", "rondas-qr"],
    },
    {
      nombre: "Fase 2 · Central y comunicación",
      duracion: "3 a 4 semanas (estimado)",
      objetivo: "Una central que ve y coordina todo en vivo.",
      entregables: ["Mapa vivo con todas las sedes", "Radio en el teléfono para supervisores y central"],
      modulos: ["sala-de-control", "radio-ptt"],
    },
    {
      nombre: "Fase 3 · Nómina y contabilidad en el ERP de ARS",
      duracion: "4 a 6 semanas (estimado)",
      objetivo: "De los turnos a la nómina, la contabilidad y la factura en un solo sistema.",
      entregables: ["Nómina desde turnos trabajados", "Contabilidad y facturación en el ERP de ARS", "Informe mensual al cliente automático"],
      modulos: ["nomina", "agente-interoperador-de-datos"],
    },
  ],
  integraciones: [
    { sistema: "Excel de nómina", modo: "centraliza", detalle: "La nómina pasa a calcularse en el ERP de ARS desde los turnos trabajados." },
    { sistema: "Excel de turnos", modo: "migra", detalle: "Se carga una vez la programación actual y desde ahí vive en ARS." },
    { sistema: "Grabadores de las sedes", modo: "convive", detalle: "Las cámaras actuales se pueden sumar después con analíticas." },
    { sistema: "WhatsApp y radio análoga", modo: "reemplaza", detalle: "La comunicación operativa pasa a un canal propio y grabado." },
  ],
  reportes: [
    { nombre: "Informe mensual al cliente", para: "Cliente final", frecuencia: "Mensual", contenido: "Turnos cumplidos, rondas, novedades y evidencia por sede." },
    { nombre: "Novedades del día", para: "Gerencia", frecuencia: "Diario", contenido: "Qué pasó en cada sede, qué falta cubrir y quién respondió." },
    { nombre: "Cumplimiento de supervisores", para: "Coordinadores", frecuencia: "Semanal", contenido: "Revistas hechas contra las programadas." },
    { nombre: "Nómina por centro de costo", para: "Gestión humana y finanzas", frecuencia: "Quincenal", contenido: "Horas trabajadas, extras y recargos liquidados en el ERP de ARS." },
  ],
  impacto: [
    { indicador: "Confirmar quién llegó al turno", hoy: "Llamadas uno a uno", conArs: "En vivo en el mapa (estimado)" },
    { indicador: "Armar el informe al cliente", hoy: "Varios días al mes", conArs: "Se genera solo (estimado)" },
    { indicador: "Liquidar horas extra", hoy: "Excel manual", conArs: "Desde los turnos (estimado)" },
  ],
  siguientesPasos: [
    "Un asesor de ARS le llama para validar esta propuesta.",
    "Demo de 30 minutos con sus sedes y sus turnos.",
    "Plan piloto con dos o tres sedes.",
  ],
  analiticas: [
    { id: "intrusion", donde: "Perímetro de las bodegas industriales", porQue: "Avisa con foto y video cuando alguien entra a una zona restringida de noche." },
    { id: "merodeo", donde: "Parqueaderos de los conjuntos residenciales", porQue: "Detecta a quien se queda dando vueltas antes de que pase algo." },
    { id: "guardian", donde: "Puestos fijos de portería", porQue: "Confirma que el puesto no quedó solo durante el turno." },
    { id: "abandono", donde: "Lobbies de las sedes corporativas", porQue: "Alerta por objetos olvidados o dejados a propósito." },
  ],
  indicadores: [
    { nombre: "Tiempo para confirmar quién llegó al turno", unidad: "minutos", hoy: 90, conArs: 5, mejorEsMayor: false, nota: "Llamadas a 48 sedes hoy contra marcación con rostro en el celular." },
    { nombre: "Rondas con evidencia verificable", unidad: "%", hoy: 20, conArs: 95, mejorEsMayor: true, nota: "Hoy se reportan por WhatsApp; con QR quedan con foto, hora y ubicación." },
    { nombre: "Horas al mes armando informes al cliente", unidad: "horas al mes", hoy: 40, conArs: 4, mejorEsMayor: false, nota: "El informe se genera desde los turnos y novedades registradas." },
    { nombre: "Horas liquidando la nómina", unidad: "horas por quincena", hoy: 16, conArs: 2, mejorEsMayor: false, nota: "La nómina sale de los turnos dentro del ERP de ARS." },
  ],
  estrategiaErp: {
    modo: "ars-centraliza",
    sistemas: [],
    explicacion:
      "ARS tiene su propio ERP: turnos, nómina, contabilidad, facturación y clientes viven en el mismo sistema. Hoy esa información está en hojas de Excel, así que la cargamos una vez y desde ahí todo se centraliza en ARS; su contador recibe la contabilidad al día.",
  },
  escenario: "mixto",
  aviso:
    "Propuesta preliminar generada con inteligencia artificial a partir de lo que nos contó. Tiempos y cifras son estimados; un asesor de ARS la revisa y la ajusta con usted.",
};
