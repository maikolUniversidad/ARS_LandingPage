/**
 * Contenido del módulo "Seguridad integral en una sola plataforma".
 *
 * Centraliza todas las constantes (ciclo operativo, funcionalidades, casos
 * de uso, comparativa antes/después) para que la UI sólo se preocupe de
 * renderizar — el contenido vive acá.
 *
 * i18n: cada export con texto visible está keyed por locale ("es" | "en").
 * Las claves estructurales (`group`, `id`, `icon`, `tier`, `num`, `letter`)
 * NO se traducen — sólo labels/títulos/descripciones/textos visibles.
 */

export type CycleStep = {
  num: string;
  title: string;
  body: string;
  icon: string; // SVG path data
};

export type Feature = {
  letter: string;
  id: string;
  title: string;
  description: string;
  bullets: string[];
  /** Optional: sub-grouped bullets (sub-acordeón). Si está, reemplaza la lista plana. */
  bulletGroups?: Array<{ label: string; items: string[] }>;
  group: "operacion" | "monitoreo" | "inteligencia" | "reportes";
  icon: string;
};

export type UseCase = {
  id: string;
  title: string;
  industry: string;
  bullets: string[];
  icon: string;
};

type Locale = "es" | "en";

// ─────────────────────────── SVG icon paths (24×24) ───────────────────────────
// Minimal line icons, no emoji, no external library.
const ICONS = {
  calendar: "M8 2v3M16 2v3M3.5 9h17M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z",
  users:    "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  route:    "M9 11a3 3 0 100-6 3 3 0 000 6zM18 18l-3-3M21 19a3 3 0 11-6 0 3 3 0 016 0zM12 11v8",
  monitor:  "M2 4h20v12H2zM2 16l4 4M22 16l-4 4M8 20h8",
  bell:     "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  camera:   "M23 7l-7 5 7 5V7zM1 5h15v14H1z",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  chart:    "M3 3v18h18M7 14l4-4 4 4 5-5",
  brain:    "M12 5C9 5 6 7 6 11c-2 1-2 3-1 4 0 3 3 5 5 5h4c2 0 5-2 5-5 1-1 1-3-1-4 0-4-3-6-6-6z",
  map:      "M9 4l-7 3v13l7-3 6 3 7-3V4l-7 3-6-3zM9 4v13M15 7v13",
  radio:    "M5 12a7 7 0 0114 0M9 12a3 3 0 016 0M12 12v.01M3 12a9 9 0 0118 0",
  bolt:     "M13 2L3 14h8l-1 8 10-12h-8l1-8z",
  building: "M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 13v.01M9 17v.01M14 12v.01M14 16v.01",
  doc:      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  layers:   "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  zap:      "M13 2L3 14h8l-1 8 10-12h-8l1-8z",
};

// ─────────────────────────── 1. Ciclo operativo ───────────────────────────

export const cycleSteps: Record<Locale, CycleStep[]> = {
  es: [
    {
      num: "01",
      title: "Programación",
      body: "Planifica turnos, servicios, sedes, zonas y responsables desde una estructura clara y centralizada.",
      icon: ICONS.calendar,
    },
    {
      num: "02",
      title: "Asignación",
      body: "Asigna personal según cliente, sede, puesto, horario, rol, disponibilidad y necesidades operativas.",
      icon: ICONS.users,
    },
    {
      num: "03",
      title: "Ejecución en campo",
      body: "Los guardas ejecutan rondas, tareas, registros y novedades desde dispositivos móviles o estaciones operativas.",
      icon: ICONS.route,
    },
    {
      num: "04",
      title: "Monitoreo en tiempo real",
      body: "La central visualiza ubicación, estado del personal, cámaras, eventos y actividad operativa en vivo.",
      icon: ICONS.monitor,
    },
    {
      num: "05",
      title: "Alertas y novedades",
      body: "Cada evento relevante puede generar una alerta con contexto, prioridad, ubicación y responsable.",
      icon: ICONS.bell,
    },
    {
      num: "06",
      title: "Evidencia",
      body: "Fotos, videos, formularios, hora, ubicación, cámara y usuario quedan asociados al evento.",
      icon: ICONS.camera,
    },
    {
      num: "07",
      title: "Reportes",
      body: "Convierte la operación diaria en indicadores, bitácoras, auditoría y reportes gerenciales.",
      icon: ICONS.chart,
    },
    {
      num: "08",
      title: "Decisiones",
      body: "Permite mejorar tiempos de respuesta, cumplimiento, cobertura y calidad del servicio.",
      icon: ICONS.bolt,
    },
  ],
  en: [
    {
      num: "01",
      title: "Scheduling",
      body: "Plan shifts, services, sites, zones and supervisors from a clear, centralized structure.",
      icon: ICONS.calendar,
    },
    {
      num: "02",
      title: "Assignment",
      body: "Assign staff by client, site, post, schedule, role, availability and operational needs.",
      icon: ICONS.users,
    },
    {
      num: "03",
      title: "Field execution",
      body: "Guards run patrols, tasks, logs and reports from mobile devices or operational stations.",
      icon: ICONS.route,
    },
    {
      num: "04",
      title: "Real-time monitoring",
      body: "The control room sees location, staff status, cameras, events and live operational activity.",
      icon: ICONS.monitor,
    },
    {
      num: "05",
      title: "Alerts and incidents",
      body: "Every relevant event can trigger an alert with context, priority, location and assignee.",
      icon: ICONS.bell,
    },
    {
      num: "06",
      title: "Evidence",
      body: "Photos, videos, forms, time, location, camera and user are all linked to the event.",
      icon: ICONS.camera,
    },
    {
      num: "07",
      title: "Reports",
      body: "Turns daily operations into indicators, logbooks, audit trails and management reports.",
      icon: ICONS.chart,
    },
    {
      num: "08",
      title: "Decisions",
      body: "Helps improve response times, compliance, coverage and service quality.",
      icon: ICONS.bolt,
    },
  ],
};

// ─────────────────────────── 2. Funcionalidades principales ───────────────────────────

export const features: Record<Locale, Feature[]> = {
  es: [
    {
      letter: "A",
      id: "turnos",
      title: "Control de turnos y programación",
      group: "operacion",
      icon: ICONS.calendar,
      description:
        "Permite planificar, organizar y supervisar turnos de vigilancia por cliente, sede, zona, puesto y horario. Facilita la asignación de personal, control de cobertura y validación de cumplimiento operativo.",
      bullets: [
        "Programación de turnos por cliente y sede",
        "Asignación de guardas por puesto",
        "Control de horarios",
        "Validación de cobertura",
        "Identificación de ausencias o retrasos",
        "Historial de programación",
        "Vista calendario o agenda operativa",
      ],
    },
    {
      letter: "B",
      id: "personal",
      title: "Gestión de personal operativo",
      group: "operacion",
      icon: ICONS.users,
      description:
        "Centraliza la información del personal de seguridad, sus roles, turnos, ubicación, estado operativo y actividad en campo.",
      bullets: [
        "Perfil del guarda",
        "Estado en turno",
        "Ubicación en tiempo real",
        "Historial de actividad",
        "Asignación a zonas o sedes",
        "Control de disponibilidad",
        "Relación con reportes, novedades y tareas",
      ],
    },
    {
      letter: "C",
      id: "rondas",
      title: "Rondas inteligentes",
      group: "operacion",
      icon: ICONS.route,
      description:
        "Permite crear rondas de vigilancia con puntos de control, rutas, horarios, tareas personalizadas y validación de cumplimiento.",
      bullets: [
        "Rondas por sede, zona o cliente",
        "Puntos de control",
        "Tareas por punto",
        "Validación por ubicación",
        "Evidencia fotográfica",
        "Observaciones y novedades",
        "Control de rondas incompletas",
        "Alertas por incumplimiento",
        "Historial de ejecución",
      ],
    },
    {
      letter: "D",
      id: "tareas",
      title: "Rondas con tareas personalizadas",
      group: "operacion",
      icon: ICONS.shield,
      description:
        "Cada ronda puede incluir tareas específicas según el tipo de instalación, riesgo o necesidad del cliente.",
      bullets: [
        "Verificar puerta cerrada",
        "Revisar perímetro",
        "Confirmar iluminación",
        "Reportar vehículos sospechosos",
        "Validar presencia de personal autorizado",
        "Tomar fotografía del punto",
        "Completar formulario de inspección",
        "Reportar novedad con evidencia",
      ],
    },
    {
      letter: "E",
      id: "formularios",
      title: "Formularios dinámicos",
      group: "operacion",
      icon: ICONS.doc,
      description:
        "ARS permite crear formularios adaptados a cada operación, cliente o tipo de evento, evitando formatos rígidos y facilitando la captura de información estructurada.",
      bullets: [
        "Formularios personalizados",
        "Campos de texto, selección, fecha, evidencia, firma o ubicación",
        "Formularios por tipo de novedad",
        "Formularios por ronda",
        "Formularios por cliente",
        "Validaciones obligatorias",
        "Relación con reportes y auditoría",
      ],
    },
    {
      letter: "F",
      id: "mapa",
      title: "Seguimiento en mapa en tiempo real",
      group: "monitoreo",
      icon: ICONS.map,
      description:
        "Visualiza en un mapa la ubicación del personal, zonas, sedes, cámaras, rutas, eventos y puntos críticos de la operación.",
      bullets: [
        "Ubicación de guardas en tiempo real",
        "Visualización por cliente, sede o zona",
        "Rutas de ronda",
        "Puntos de control",
        "Cámaras georreferenciadas",
        "Alertas sobre el mapa",
        "Historial de recorridos",
        "Segmentación por operación",
      ],
    },
    {
      letter: "G",
      id: "ptt",
      title: "PTT · Push To Talk",
      group: "operacion",
      icon: ICONS.radio,
      description:
        "Conecta a la central de monitoreo, supervisores y personal en campo mediante comunicación operativa rápida tipo radio digital.",
      bullets: [
        "Comunicación inmediata",
        "Canales por cliente, sede, zona o equipo",
        "Comunicación central-campo",
        "Soporte para supervisores",
        "Registro de actividad si aplica",
        "Integración con eventos o alertas",
        "Apoyo a respuesta coordinada",
      ],
    },
    {
      letter: "H",
      id: "pot",
      title: "POT · Acción operativa rápida",
      group: "operacion",
      icon: ICONS.zap,
      description:
        "Permite ejecutar acciones rápidas desde la operación: reportar una novedad, activar una alerta, solicitar apoyo, confirmar presencia o marcar una tarea crítica.",
      bullets: [
        "Botón de acción rápida",
        "Reporte de emergencia o novedad",
        "Confirmación de tarea",
        "Solicitud de apoyo",
        "Activación de protocolo",
        "Asociación con ubicación y usuario",
        "Registro en trazabilidad",
      ],
    },
    {
      letter: "I",
      id: "central",
      title: "Central de monitoreo",
      group: "monitoreo",
      icon: ICONS.monitor,
      description:
        "La central de monitoreo concentra cámaras, eventos, personal, alertas, mapas y comunicación en una sola vista operativa.",
      bullets: [
        "Video wall",
        "Monitoreo de cámaras",
        "Alertas en tiempo real",
        "Seguimiento de eventos",
        "Visualización de personal",
        "Comunicación con campo",
        "Evidencia asociada",
        "Priorización de riesgos",
      ],
    },
    {
      letter: "J",
      id: "ia",
      title: "Cámaras e IA",
      group: "inteligencia",
      icon: ICONS.brain,
      description:
        "ARS integra cámaras CCTV con capacidades de inteligencia artificial para detectar eventos relevantes y apoyar al operador en la priorización de riesgos.",
      bullets: [
        "Detección de personas",
        "Detección de vehículos",
        "Reconocimiento facial según listas autorizadas o restringidas",
        "Reconocimiento de placas",
        "Cruce de línea",
        "Intrusión en zona",
        "Merodeo o permanencia",
        "Objetos abandonados",
        "Uso de elementos de protección personal",
        "Caídas o eventos críticos",
        "Reglas por cámara",
        "ROI o zonas de interés",
      ],
      bulletGroups: [
        {
          label: "Personas",
          items: [
            "Detección de personas",
            "Reconocimiento facial (listas autorizadas/restringidas)",
            "Caídas y eventos críticos",
            "Merodeo o permanencia",
          ],
        },
        {
          label: "Vehículos",
          items: [
            "Detección de vehículos",
            "Reconocimiento de placas (LPR)",
            "Clasificación por tipo y color",
          ],
        },
        {
          label: "Comportamiento y zonas",
          items: [
            "Cruce de línea",
            "Intrusión en zona",
            "ROI o zonas de interés",
            "Objetos abandonados",
          ],
        },
        {
          label: "Industrial y operación",
          items: [
            "Uso de elementos de protección personal (EPP)",
            "Reglas por cámara",
            "Aglomeración y densidad",
            "Detección de fuego y humo",
          ],
        },
      ],
    },
    {
      letter: "K",
      id: "alertas",
      title: "Alertas inteligentes",
      group: "inteligencia",
      icon: ICONS.bell,
      description:
        "Las alertas no son simples notificaciones. Llegan con contexto: qué ocurrió, dónde, cuándo, quién estaba asignado, qué cámara lo detectó y qué evidencia existe.",
      bullets: [
        "Tipo de evento",
        "Nivel de prioridad",
        "Cámara asociada",
        "Zona o sede",
        "Usuario o guarda relacionado",
        "Snapshot",
        "Video clip",
        "Ubicación",
        "Estado de atención",
        "Historial de seguimiento",
      ],
    },
    {
      letter: "L",
      id: "evidencia",
      title: "Evidencia y trazabilidad",
      group: "monitoreo",
      icon: ICONS.camera,
      description:
        "Cada acción importante dentro de ARS queda registrada para auditoría, seguimiento y respaldo ante el cliente.",
      bullets: [
        "Evidencia fotográfica",
        "Video de evento",
        "Fecha y hora",
        "Usuario responsable",
        "Ubicación",
        "Cámara asociada",
        "Historial de cambios",
        "Estado del evento",
        "Cierre de novedad",
        "Reporte descargable",
      ],
    },
    {
      letter: "M",
      id: "reportes",
      title: "Reportes e indicadores",
      group: "reportes",
      icon: ICONS.chart,
      description:
        "ARS convierte la operación diaria en información útil para gerentes, supervisores y clientes.",
      bullets: [
        "Cumplimiento de turnos",
        "Rondas completadas",
        "Rondas fallidas",
        "Tiempo de respuesta",
        "Novedades por sede",
        "Alertas por tipo",
        "Eventos por cámara",
        "Actividad por guarda",
        "Cobertura por cliente",
        "Evidencia generada",
        "Riesgos recurrentes",
        "Reportes por periodo",
      ],
    },
    {
      letter: "N",
      id: "multisite",
      title: "Multi-cliente · multi-sede · multi-zona",
      group: "reportes",
      icon: ICONS.layers,
      description:
        "ARS está pensada para operar múltiples clientes, sedes, zonas, cámaras, guardas y servicios desde una arquitectura ordenada y escalable.",
      bullets: [
        "Organización → Cliente → Sede / Zona",
        "Puesto → Cámara → Guarda",
        "Turno → Ronda → Tarea",
        "Evento → Evidencia → Reporte",
      ],
    },
  ],
  en: [
    {
      letter: "A",
      id: "turnos",
      title: "Shift control and scheduling",
      group: "operacion",
      icon: ICONS.calendar,
      description:
        "Plan, organize and supervise security shifts by client, site, zone, post and schedule. Makes it easy to assign staff, control coverage and validate operational compliance.",
      bullets: [
        "Shift scheduling by client and site",
        "Guard assignment by post",
        "Schedule control",
        "Coverage validation",
        "Detection of absences or delays",
        "Scheduling history",
        "Calendar or operational agenda view",
      ],
    },
    {
      letter: "B",
      id: "personal",
      title: "Field staff management",
      group: "operacion",
      icon: ICONS.users,
      description:
        "Centralizes security staff information, including their roles, shifts, location, operational status and field activity.",
      bullets: [
        "Guard profile",
        "On-shift status",
        "Real-time location",
        "Activity history",
        "Assignment to zones or sites",
        "Availability control",
        "Linkage to reports, incidents and tasks",
      ],
    },
    {
      letter: "C",
      id: "rondas",
      title: "Smart patrols",
      group: "operacion",
      icon: ICONS.route,
      description:
        "Create security patrols with checkpoints, routes, schedules, custom tasks and compliance validation.",
      bullets: [
        "Patrols by site, zone or client",
        "Checkpoints",
        "Tasks per checkpoint",
        "Location-based validation",
        "Photographic evidence",
        "Observations and incidents",
        "Control of incomplete patrols",
        "Alerts on non-compliance",
        "Execution history",
      ],
    },
    {
      letter: "D",
      id: "tareas",
      title: "Patrols with custom tasks",
      group: "operacion",
      icon: ICONS.shield,
      description:
        "Each patrol can include specific tasks based on the type of facility, risk level or client need.",
      bullets: [
        "Verify door is locked",
        "Check perimeter",
        "Confirm lighting",
        "Report suspicious vehicles",
        "Validate presence of authorized staff",
        "Take a photo of the checkpoint",
        "Complete inspection form",
        "Report incident with evidence",
      ],
    },
    {
      letter: "E",
      id: "formularios",
      title: "Dynamic forms",
      group: "operacion",
      icon: ICONS.doc,
      description:
        "ARS lets you create forms tailored to each operation, client or event type, avoiding rigid formats and making it easy to capture structured information.",
      bullets: [
        "Custom forms",
        "Text, selection, date, evidence, signature or location fields",
        "Forms by incident type",
        "Forms by patrol",
        "Forms by client",
        "Required validations",
        "Linkage to reports and audit trail",
      ],
    },
    {
      letter: "F",
      id: "mapa",
      title: "Real-time map tracking",
      group: "monitoreo",
      icon: ICONS.map,
      description:
        "Visualize on a map the location of staff, zones, sites, cameras, routes, events and critical points of the operation.",
      bullets: [
        "Real-time guard location",
        "View by client, site or zone",
        "Patrol routes",
        "Checkpoints",
        "Geo-referenced cameras",
        "Alerts on the map",
        "Route history",
        "Segmentation by operation",
      ],
    },
    {
      letter: "G",
      id: "ptt",
      title: "PTT · Push To Talk",
      group: "operacion",
      icon: ICONS.radio,
      description:
        "Connects the monitoring center, supervisors and field staff through fast, digital-radio-style operational communication.",
      bullets: [
        "Instant communication",
        "Channels by client, site, zone or team",
        "Control-room-to-field communication",
        "Support for supervisors",
        "Activity logging where applicable",
        "Integration with events or alerts",
        "Support for coordinated response",
      ],
    },
    {
      letter: "H",
      id: "pot",
      title: "POT · Rapid operational action",
      group: "operacion",
      icon: ICONS.zap,
      description:
        "Lets you trigger quick actions from the field: report an incident, raise an alert, request backup, confirm presence or flag a critical task.",
      bullets: [
        "Quick-action button",
        "Emergency or incident report",
        "Task confirmation",
        "Backup request",
        "Protocol activation",
        "Association with location and user",
        "Recorded in the audit trail",
      ],
    },
    {
      letter: "I",
      id: "central",
      title: "Monitoring center",
      group: "monitoreo",
      icon: ICONS.monitor,
      description:
        "The monitoring center brings together cameras, events, staff, alerts, maps and communication in a single operational view.",
      bullets: [
        "Video wall",
        "Camera monitoring",
        "Real-time alerts",
        "Event tracking",
        "Staff visualization",
        "Communication with the field",
        "Linked evidence",
        "Risk prioritization",
      ],
    },
    {
      letter: "J",
      id: "ia",
      title: "Cameras and AI",
      group: "inteligencia",
      icon: ICONS.brain,
      description:
        "ARS integrates CCTV cameras with artificial intelligence capabilities to detect relevant events and help operators prioritize risks.",
      bullets: [
        "People detection",
        "Vehicle detection",
        "Facial recognition against authorized or restricted lists",
        "License plate recognition",
        "Line crossing",
        "Zone intrusion",
        "Loitering or lingering",
        "Abandoned objects",
        "Personal protective equipment usage",
        "Falls or critical events",
        "Per-camera rules",
        "ROI or regions of interest",
      ],
      bulletGroups: [
        {
          label: "People",
          items: [
            "People detection",
            "Facial recognition (authorized/restricted lists)",
            "Falls and critical events",
            "Loitering or lingering",
          ],
        },
        {
          label: "Vehicles",
          items: [
            "Vehicle detection",
            "License plate recognition (LPR)",
            "Classification by type and color",
          ],
        },
        {
          label: "Behavior and zones",
          items: [
            "Line crossing",
            "Zone intrusion",
            "ROI or regions of interest",
            "Abandoned objects",
          ],
        },
        {
          label: "Industrial and operations",
          items: [
            "Personal protective equipment (PPE) usage",
            "Per-camera rules",
            "Crowding and density",
            "Fire and smoke detection",
          ],
        },
      ],
    },
    {
      letter: "K",
      id: "alertas",
      title: "Smart alerts",
      group: "inteligencia",
      icon: ICONS.bell,
      description:
        "Alerts are not just notifications. They arrive with context: what happened, where, when, who was assigned, which camera detected it and what evidence exists.",
      bullets: [
        "Event type",
        "Priority level",
        "Associated camera",
        "Zone or site",
        "Related user or guard",
        "Snapshot",
        "Video clip",
        "Location",
        "Response status",
        "Follow-up history",
      ],
    },
    {
      letter: "L",
      id: "evidencia",
      title: "Evidence and traceability",
      group: "monitoreo",
      icon: ICONS.camera,
      description:
        "Every important action within ARS is recorded for audit, follow-up and accountability toward the client.",
      bullets: [
        "Photographic evidence",
        "Event video",
        "Date and time",
        "Responsible user",
        "Location",
        "Associated camera",
        "Change history",
        "Event status",
        "Incident closure",
        "Downloadable report",
      ],
    },
    {
      letter: "M",
      id: "reportes",
      title: "Reports and indicators",
      group: "reportes",
      icon: ICONS.chart,
      description:
        "ARS turns daily operations into useful information for managers, supervisors and clients.",
      bullets: [
        "Shift compliance",
        "Completed patrols",
        "Failed patrols",
        "Response time",
        "Incidents by site",
        "Alerts by type",
        "Events by camera",
        "Activity by guard",
        "Coverage by client",
        "Generated evidence",
        "Recurring risks",
        "Reports by period",
      ],
    },
    {
      letter: "N",
      id: "multisite",
      title: "Multi-client · multi-site · multi-zone",
      group: "reportes",
      icon: ICONS.layers,
      description:
        "ARS is built to run multiple clients, sites, zones, cameras, guards and services from an orderly, scalable architecture.",
      bullets: [
        "Organization → Client → Site / Zone",
        "Post → Camera → Guard",
        "Shift → Patrol → Task",
        "Event → Evidence → Report",
      ],
    },
  ],
};

export const featureGroups: Record<
  Locale,
  Record<Feature["group"], { label: string; description: string }>
> = {
  es: {
    operacion: {
      label: "Operación",
      description: "Gestión humana, programación y ejecución en campo",
    },
    monitoreo: {
      label: "Monitoreo",
      description: "Visualización, central y trazabilidad",
    },
    inteligencia: {
      label: "Inteligencia",
      description: "IA y alertas con contexto",
    },
    reportes: {
      label: "Reportes",
      description: "Indicadores, multisede y arquitectura",
    },
  },
  en: {
    operacion: {
      label: "Operations",
      description: "People management, scheduling and field execution",
    },
    monitoreo: {
      label: "Monitoring",
      description: "Visualization, control room and traceability",
    },
    inteligencia: {
      label: "Intelligence",
      description: "AI and context-rich alerts",
    },
    reportes: {
      label: "Reports",
      description: "Indicators, multi-site and architecture",
    },
  },
};

// ─────────────────────────── 4. Arquitectura operativa ───────────────────────────

export const architectureLevels: Record<
  Locale,
  Array<{ label: string; sub: string; tier: "root" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7" }>
> = {
  es: [
    { label: "ARS Intelligence",            sub: "Plataforma raíz",            tier: "root" },
    { label: "Clientes",                    sub: "Empresas y organizaciones",  tier: "L1"   },
    { label: "Sedes / Zonas",               sub: "Puntos físicos cubiertos",   tier: "L2"   },
    { label: "Cámaras · Puestos · Guardas", sub: "Recursos operativos",        tier: "L3"   },
    { label: "Turnos · Rondas · Tareas",    sub: "Actividad programada",       tier: "L4"   },
    { label: "Alertas · Novedades · Formularios", sub: "Eventos en tiempo real", tier: "L5" },
    { label: "Evidencia · Mapa · Central",  sub: "Visualización y respaldo",   tier: "L6"   },
    { label: "Reportes · Indicadores · Decisiones", sub: "Información útil",   tier: "L7"   },
  ],
  en: [
    { label: "ARS Intelligence",              sub: "Root platform",               tier: "root" },
    { label: "Clients",                       sub: "Companies and organizations", tier: "L1"   },
    { label: "Sites / Zones",                 sub: "Physical points covered",     tier: "L2"   },
    { label: "Cameras · Posts · Guards",      sub: "Operational resources",       tier: "L3"   },
    { label: "Shifts · Patrols · Tasks",      sub: "Scheduled activity",          tier: "L4"   },
    { label: "Alerts · Incidents · Forms",    sub: "Real-time events",            tier: "L5"   },
    { label: "Evidence · Map · Control room", sub: "Visualization and backup",    tier: "L6"   },
    { label: "Reports · Indicators · Decisions", sub: "Useful information",       tier: "L7"   },
  ],
};

// ─────────────────────────── 5. Flujo operativo (timeline) ───────────────────────────

export const flowSteps: Record<Locale, Array<{ title: string; body: string }>> = {
  es: [
    { title: "Inicio de turno",          body: "El guarda inicia su turno y queda asociado a sede, puesto y horario." },
    { title: "Validación de puesto",     body: "Confirma presencia con biometría, ubicación o token operativo." },
    { title: "Ronda asignada",           body: "Recibe la ruta con puntos de control, tareas y horarios." },
    { title: "Tareas en campo",          body: "Ejecuta las tareas específicas según el tipo de instalación o riesgo." },
    { title: "Formulario / novedad",     body: "Reporta hallazgos en formularios dinámicos por tipo de evento." },
    { title: "Evidencia",                body: "Foto, video, ubicación y hora quedan asociados al evento." },
    { title: "Alerta o seguimiento",     body: "Si aplica, se dispara una alerta priorizada hacia la central." },
    { title: "Central de monitoreo",     body: "Operadores ven cámaras, mapa, personal y eventos en vivo." },
    { title: "Cierre del evento",        body: "Confirmación de atención, observaciones y trazabilidad final." },
    { title: "Reporte gerencial",        body: "Indicadores, KPIs y bitácoras para gerencia y cliente." },
  ],
  en: [
    { title: "Shift start",              body: "The guard starts their shift and is linked to site, post and schedule." },
    { title: "Post validation",          body: "Confirms presence via biometrics, location or operational token." },
    { title: "Assigned patrol",          body: "Receives the route with checkpoints, tasks and schedules." },
    { title: "Field tasks",              body: "Runs the specific tasks based on the type of facility or risk." },
    { title: "Form / incident",          body: "Reports findings in dynamic forms by event type." },
    { title: "Evidence",                 body: "Photo, video, location and time are linked to the event." },
    { title: "Alert or follow-up",       body: "When applicable, a prioritized alert is triggered to the control room." },
    { title: "Monitoring center",        body: "Operators see cameras, map, staff and events live." },
    { title: "Event closure",            body: "Response confirmation, observations and final traceability." },
    { title: "Management report",        body: "Indicators, KPIs and logbooks for management and the client." },
  ],
};

// ─────────────────────────── 6. Casos de uso ───────────────────────────

export const useCases: Record<Locale, UseCase[]> = {
  es: [
    {
      id: "residencial",
      title: "Conjunto residencial",
      industry: "Residencial · Administración",
      icon: ICONS.building,
      bullets: [
        "Control de porterías",
        "Rondas perimetrales",
        "Registro de novedades",
        "Cámaras por torre o zona",
        "Alertas por intrusión",
        "Reportes al administrador",
      ],
    },
    {
      id: "campus",
      title: "Universidad o campus",
      industry: "Educación · Acceso",
      icon: ICONS.users,
      bullets: [
        "Múltiples entradas",
        "Cámaras por edificios",
        "Monitoreo de estudiantes, visitantes y zonas críticas",
        "Detección de permanencia o cruce de línea",
        "Control de eventos y reportes",
      ],
    },
    {
      id: "logistica",
      title: "Centro logístico",
      industry: "Logística · Industrial",
      icon: ICONS.layers,
      bullets: [
        "Control de acceso vehicular",
        "Reconocimiento de placas",
        "Rondas en bodegas",
        "EPP",
        "Alertas por zonas restringidas",
        "Evidencia ante incidentes",
      ],
    },
    {
      id: "seguridad",
      title: "Empresa de seguridad",
      industry: "Servicios · Multi-cliente",
      icon: ICONS.shield,
      bullets: [
        "Gestión de múltiples clientes",
        "Programación de turnos",
        "Supervisión de guardas",
        "Rondas y tareas",
        "Reportes automáticos",
        "Trazabilidad para facturación o cumplimiento",
      ],
    },
  ],
  en: [
    {
      id: "residencial",
      title: "Residential complex",
      industry: "Residential · Administration",
      icon: ICONS.building,
      bullets: [
        "Gatehouse control",
        "Perimeter patrols",
        "Incident logging",
        "Cameras per tower or zone",
        "Intrusion alerts",
        "Reports to the administrator",
      ],
    },
    {
      id: "campus",
      title: "University or campus",
      industry: "Education · Access",
      icon: ICONS.users,
      bullets: [
        "Multiple entrances",
        "Cameras per building",
        "Monitoring of students, visitors and critical zones",
        "Loitering or line-crossing detection",
        "Event control and reports",
      ],
    },
    {
      id: "logistica",
      title: "Logistics center",
      industry: "Logistics · Industrial",
      icon: ICONS.layers,
      bullets: [
        "Vehicle access control",
        "License plate recognition",
        "Warehouse patrols",
        "PPE",
        "Alerts on restricted zones",
        "Evidence for incidents",
      ],
    },
    {
      id: "seguridad",
      title: "Security company",
      industry: "Services · Multi-client",
      icon: ICONS.shield,
      bullets: [
        "Management of multiple clients",
        "Shift scheduling",
        "Guard supervision",
        "Patrols and tasks",
        "Automatic reports",
        "Traceability for billing or compliance",
      ],
    },
  ],
};

// ─────────────────────────── 7. Antes vs. Con ARS ───────────────────────────

export const beforeAfter: Record<Locale, { before: string[]; after: string[] }> = {
  es: {
    before: [
      "Información dispersa entre Excel, WhatsApp y radios",
      "Reportes manuales con horas de demora",
      "Cámaras desconectadas de la operación",
      "Rondas sin trazabilidad real",
      "Comunicación informal entre central y campo",
      "Poca evidencia ante reclamos del cliente",
      "Difícil supervisión de múltiples sedes",
      "Reportes lentos y sin contexto",
    ],
    after: [
      "Operación centralizada en una sola plataforma",
      "Turnos y rondas controlados con validación automática",
      "Cámaras + IA + personal conectados en tiempo real",
      "Evidencia automática asociada a cada evento",
      "Mapa con ubicación viva de personal y zonas",
      "Comunicación operativa con PTT y trazabilidad",
      "Alertas que llegan con contexto y evidencia",
      "Reportes ejecutivos para tomar decisiones",
    ],
  },
  en: {
    before: [
      "Information scattered across Excel, WhatsApp and radios",
      "Manual reports with hours of delay",
      "Cameras disconnected from the operation",
      "Patrols with no real traceability",
      "Informal communication between control room and field",
      "Little evidence when clients raise complaints",
      "Hard to supervise multiple sites",
      "Slow reports with no context",
    ],
    after: [
      "Operation centralized in a single platform",
      "Shifts and patrols controlled with automatic validation",
      "Cameras + AI + staff connected in real time",
      "Automatic evidence linked to every event",
      "Map with live location of staff and zones",
      "Operational communication with PTT and traceability",
      "Alerts that arrive with context and evidence",
      "Executive reports to drive decisions",
    ],
  },
};

// ─────────────────────────── 8. Microcopy verbs ───────────────────────────

export const operatingVerbs: Record<Locale, string[]> = {
  es: ["Opera", "Monitorea", "Comunica", "Evidencia", "Reporta", "Decide"],
  en: ["Operate", "Monitor", "Communicate", "Document", "Report", "Decide"],
};

export const guidingPhrase: Record<Locale, string> = {
  es: "ARS conecta la operación completa de seguridad: personas, cámaras, IA, turnos, rondas, alertas, mapas, evidencia y reportes en una sola plataforma.",
  en: "ARS connects the entire security operation: people, cameras, AI, shifts, patrols, alerts, maps, evidence and reports in a single platform.",
};
