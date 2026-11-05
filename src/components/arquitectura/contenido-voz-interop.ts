/**
 * Copy de las secciones «La voz de ARS» e «Interoperabilidad» de /arquitectura
 * (español latino e inglés). Los estados de módulos se leen del catálogo
 * (`src/data/servicios`); aquí solo se referencian por id.
 */
import type { Locale } from "@/lib/i18n/dictionaries";

type Paso = { t: string; d: string };
type Capacidad = { id: string; t: string; d: string; detalle: string; modulo?: string; enSitio?: boolean };
type Ruta = { n: string; t: string; d: string; tecnico: string; frecuencia: string };
export type RutaId = "api" | "backend" | "carga";
type Sistema = { id: string; nombre: string; ruta: RutaId; via: string; nota: string };

type CopyVozInterop = {
  vozEyebrow: string;
  vozTitulo: string;
  vozTitulo2: string;
  vozLead: string;
  vozFlujoLabel: string;
  vozFlujo: Paso[];
  vozCapacidades: Capacidad[];
  vozEnSitio: string;
  vozCta: string;
  vozCtaAyuda: string;
  vozNotaSeguridad: string;
  vozMotor: string;

  intEyebrow: string;
  intTitulo: string;
  intTitulo2: string;
  intLead: string;
  intRutasLabel: string;
  intRutas: Record<RutaId, Ruta>;
  intFrecuencia: string;
  intSistemasTitulo: string;
  intSistemasAyuda: string;
  intSistemas: Sistema[];
  intViaLabel: string;
  intRutaLabel: string;
  intNotaSistemas: string;
  intProtocoloTitulo: string;
  intProtocoloLead: string;
  intProtocolo: Paso[];
  intDatosTitulo: string;
  intDatos: string[];
  intModosTitulo: string;
  intModos: Paso[];
  intVerModulo: string;
};

export const COPY_VOZ_INTEROP: Record<Locale, CopyVozInterop> = {
  es: {
    vozEyebrow: "Capa de voz · ElevenLabs",
    vozTitulo: "Háblele a la operación.",
    vozTitulo2: "Ella le responde.",
    vozLead:
      "La voz atraviesa todas las capas: Ars escucha, entiende con el mismo conocimiento y las mismas herramientas del chat, actúa sobre la pantalla o el sistema y responde con una voz natural. La conversación es en tiempo real, se deja interrumpir y todo lo dicho queda por escrito.",
    vozFlujoLabel: "Así viaja una frase",
    vozFlujo: [
      { t: "Escucha", d: "El micrófono capta la voz, sin pulsar nada o con pulsar para hablar en el celular." },
      { t: "Transcribe", d: "La voz se convierte en texto en tiempo real (ElevenLabs Scribe)." },
      { t: "Entiende", d: "Ars responde con la base de conocimiento de ARS y sabe en qué página o sala está la persona." },
      { t: "Actúa", d: "Navega, abre una analítica, enfoca un módulo o deja listo el contacto." },
      { t: "Responde", d: "Contesta con la voz de Ars, con subtítulos y baja latencia." },
    ],
    vozCapacidades: [
      {
        id: "tiempo-real",
        t: "Conversación en tiempo real",
        d: "Voz a voz con el agente de Ars: se interrumpe, retoma y ejecuta acciones mientras habla.",
        detalle: "Agente conversacional de ElevenLabs con URL firmada de un solo uso.",
        enSitio: true,
      },
      {
        id: "narracion",
        t: "Recorridos narrados",
        d: "Ars narra cada sección mientras la persona baja, con música que reacciona al recorrido. Como en esta página.",
        detalle: "Texto a voz de ElevenLabs con la voz de Ars.",
        enSitio: true,
      },
      {
        id: "dictado",
        t: "Dictado y entrevistas por voz",
        d: "Se le puede dictar al chat y responder por voz la entrevista del diagnóstico, sin escribir.",
        detalle: "Voz a texto de ElevenLabs con respaldo del navegador.",
        enSitio: true,
      },
      {
        id: "vigia",
        t: "Vigía en la Sala VR",
        d: "El asistente de voz de la central en realidad virtual: lleva a la persona a donde pide y mejora el micrófono para la radio.",
        detalle: "Módulo del catálogo de ARS.",
        modulo: "vigia-asistente-de-voz",
      },
    ],
    vozEnSitio: "Pruébelo aquí",
    vozCta: "Hablar con Ars ahora",
    vozCtaAyuda: "Se abre el micrófono. Pregúntele por cualquier capa de la arquitectura.",
    vozNotaSeguridad:
      "La clave de ElevenLabs vive solo en el servidor: el navegador recibe una URL firmada de corta duración o el audio ya generado.",
    vozMotor: "Motor de voz: ElevenLabs",

    intEyebrow: "Interoperabilidad · Agente interoperador de datos",
    intTitulo: "Su sistema actual se queda.",
    intTitulo2: "ARS se conecta a él.",
    intLead:
      "Si la empresa ya tiene un ERP, una contabilidad o simplemente hojas de cálculo, no tiene que cambiarlos. El Agente interoperador de datos recopila, analiza, homologa y sincroniza la información, y siempre busca la conexión más directa: primero por API; si no existe, por backend; y si ninguna es posible, por protocolos de carga masiva programados.",
    intRutasLabel: "Tres caminos, del más directo al más universal",
    intRutas: {
      api: {
        n: "01",
        t: "Por API",
        d: "La vía preferida cuando el sistema la ofrece. Sincronización continua y en ambos sentidos: lo que cambia en un lado aparece en el otro.",
        tecnico: "REST, OData, JSON-RPC / XML-RPC y webhooks, con credenciales de solo los permisos necesarios.",
        frecuencia: "Continua o casi en tiempo real",
      },
      backend: {
        n: "02",
        t: "Por backend",
        d: "Cuando no hay API, el agente se conecta a nivel de servicios o de base de datos, con un usuario de permisos controlados y preferiblemente de solo lectura.",
        tecnico: "Vistas o réplicas de base de datos, servicios internos y túnel seguro hacia instalaciones locales.",
        frecuencia: "Cada pocos minutos u horas",
      },
      carga: {
        n: "03",
        t: "Por cargas masivas programadas",
        d: "Si no hay conexión directa, el sistema exporta archivos y ARS los recoge en horarios definidos. Sirve para cualquier programa, incluso solo con Excel.",
        tecnico: "Excel, CSV, XML o archivos planos por carpeta compartida, SFTP o correo, con plantillas y validación.",
        frecuencia: "Diaria, nocturna o la que defina el proceso",
      },
    },
    intFrecuencia: "Frecuencia típica",
    intSistemasTitulo: "¿Qué sistema tiene hoy?",
    intSistemasAyuda: "Elija el suyo y le mostramos el camino habitual de conexión.",
    intSistemas: [
      { id: "odoo", nombre: "Odoo", ruta: "api", via: "API externa de Odoo (JSON-RPC / XML-RPC).", nota: "En Odoo Online el acceso a la API depende del plan; si no está disponible, se usan cargas programadas." },
      { id: "sap-b1", nombre: "SAP Business One", ruta: "api", via: "Service Layer (REST / OData) o DI API.", nota: "En instalaciones locales se habilita un acceso seguro al servidor." },
      { id: "dynamics", nombre: "Microsoft Dynamics 365", ruta: "api", via: "Web API de Dataverse / OData.", nota: "Con una aplicación registrada y permisos por entidad." },
      { id: "siigo", nombre: "Siigo", ruta: "api", via: "API de Siigo Nube.", nota: "En versiones de escritorio, exportes programados de Excel o planos." },
      { id: "alegra", nombre: "Alegra", ruta: "api", via: "API REST de Alegra.", nota: "Facturas, contactos, ítems y asientos." },
      { id: "world-office", nombre: "World Office", ruta: "carga", via: "Exportes programados de Excel o archivos planos.", nota: "En servidores locales puede evaluarse conexión de solo lectura a la base de datos." },
      { id: "helisa", nombre: "Helisa", ruta: "carga", via: "Exportes e importes de archivos planos programados.", nota: "Con plantillas homologadas de terceros, centros de costo y comprobantes." },
      { id: "propio", nombre: "Sistema propio o a la medida", ruta: "backend", via: "Su API si existe; si no, conexión a servicios o a la base de datos.", nota: "El agente documenta el esquema y homologa los datos con ARS." },
      { id: "excel", nombre: "Solo Excel / sin sistema", ruta: "carga", via: "Plantillas de importación de ARS y cargas validadas.", nota: "Desde el primer día; luego ARS puede ser el sistema principal." },
    ],
    intViaLabel: "Vía habitual",
    intRutaLabel: "Camino",
    intNotaSistemas: "Es el camino habitual; el definitivo se confirma en el diagnóstico técnico de su instalación.",
    intProtocoloTitulo: "El protocolo de importación",
    intProtocoloLead:
      "Cuando la conexión es por archivos, nada entra a ciegas. Cada carga, la inicial masiva o las periódicas, sigue el mismo protocolo.",
    intProtocolo: [
      { t: "Plantilla y mapeo", d: "Se acuerdan los archivos y el agente mapea cada columna con los campos de ARS." },
      { t: "Programación", d: "Se define cuándo y por dónde llegan: horario nocturno, carpeta, SFTP o correo." },
      { t: "Validación y homologación", d: "El agente revisa formatos, duplicados y referencias, y homologa clientes, empleados, sedes y centros de costo." },
      { t: "Vista previa", d: "Muestra qué se crea, actualiza o desactiva, con errores y advertencias, antes de escribir nada." },
      { t: "Aplicar e historial", d: "Se aplica con un clic y queda la corrida registrada para auditar o repetir." },
    ],
    intDatosTitulo: "Lo que suele fluir",
    intDatos: ["Empleados y novedades de nómina", "Clientes y contratos", "Sedes y puestos", "Órdenes de servicio", "Centros de costo", "Asientos contables", "Facturas y terceros", "Documentos y soportes"],
    intModosTitulo: "Completa o por partes",
    intModos: [
      { t: "Todo en ARS", d: "La información se centraliza en ARS y ARS pasa a ser el sistema principal." },
      { t: "ARS junto a su ERP", d: "ARS lleva turnos, operación o nómina, y los datos fluyen con el ERP contable que ya usa." },
    ],
    intVerModulo: "Ver el Agente interoperador",
  },
  en: {
    vozEyebrow: "Voice layer · ElevenLabs",
    vozTitulo: "Talk to the operation.",
    vozTitulo2: "It talks back.",
    vozLead:
      "Voice runs through every layer: Ars listens, understands with the same knowledge and tools as the chat, acts on the screen or the system and answers with a natural voice. The conversation is real-time, can be interrupted, and everything said is kept in writing.",
    vozFlujoLabel: "How a sentence travels",
    vozFlujo: [
      { t: "Listens", d: "The microphone picks up the voice, hands-free or push-to-talk on mobile." },
      { t: "Transcribes", d: "Speech becomes text in real time (ElevenLabs Scribe)." },
      { t: "Understands", d: "Ars answers from the ARS knowledge base and knows which page or room the person is in." },
      { t: "Acts", d: "Navigates, opens an analytic, focuses a module or prepares the contact form." },
      { t: "Answers", d: "Replies in Ars's voice, with captions and low latency." },
    ],
    vozCapacidades: [
      {
        id: "tiempo-real",
        t: "Real-time conversation",
        d: "Voice-to-voice with the Ars agent: interrupt it, resume, and it takes actions while it speaks.",
        detalle: "ElevenLabs conversational agent with a single-use signed URL.",
        enSitio: true,
      },
      {
        id: "narracion",
        t: "Narrated tours",
        d: "Ars narrates each section as the person scrolls, with music that reacts to the tour (Spanish).",
        detalle: "ElevenLabs text-to-speech with Ars's voice.",
        enSitio: true,
      },
      {
        id: "dictado",
        t: "Dictation and voice interviews",
        d: "Dictate to the chat and answer the assessment interview by voice, without typing.",
        detalle: "ElevenLabs speech-to-text with a browser fallback.",
        enSitio: true,
      },
      {
        id: "vigia",
        t: "Vigía in the VR Room",
        d: "The voice assistant of the virtual-reality control room: takes the person where they ask and cleans up the mic for radio.",
        detalle: "Module from the ARS catalog.",
        modulo: "vigia-asistente-de-voz",
      },
    ],
    vozEnSitio: "Try it here",
    vozCta: "Talk to Ars now",
    vozCtaAyuda: "The microphone opens. Ask about any layer of the architecture.",
    vozNotaSeguridad:
      "The ElevenLabs key lives only on the server: the browser receives a short-lived signed URL or the generated audio.",
    vozMotor: "Voice engine: ElevenLabs",

    intEyebrow: "Interoperability · Data interoperability agent",
    intTitulo: "Your current system stays.",
    intTitulo2: "ARS connects to it.",
    intLead:
      "If the company already has an ERP, an accounting system or just spreadsheets, it doesn't have to replace them. The data interoperability agent collects, analyzes, normalizes and syncs the information, always looking for the most direct connection: API first; if there is none, backend; and if neither is possible, scheduled bulk-load protocols.",
    intRutasLabel: "Three paths, from the most direct to the most universal",
    intRutas: {
      api: {
        n: "01",
        t: "Via API",
        d: "The preferred path when the system offers one. Continuous, two-way sync: what changes on one side shows up on the other.",
        tecnico: "REST, OData, JSON-RPC / XML-RPC and webhooks, with least-privilege credentials.",
        frecuencia: "Continuous or near real time",
      },
      backend: {
        n: "02",
        t: "Via backend",
        d: "When there's no API, the agent connects at the service or database level, with a controlled — ideally read-only — user.",
        tecnico: "Database views or replicas, internal services and a secure tunnel to on-premise servers.",
        frecuencia: "Every few minutes or hours",
      },
      carga: {
        n: "03",
        t: "Via scheduled bulk loads",
        d: "With no direct connection, the system exports files and ARS picks them up on a schedule. Works with any software, even plain Excel.",
        tecnico: "Excel, CSV, XML or flat files over a shared folder, SFTP or email, with templates and validation.",
        frecuencia: "Daily, nightly or as the process requires",
      },
    },
    intFrecuencia: "Typical frequency",
    intSistemasTitulo: "Which system do you use today?",
    intSistemasAyuda: "Pick yours and we'll show the usual connection path.",
    intSistemas: [
      { id: "odoo", nombre: "Odoo", ruta: "api", via: "Odoo external API (JSON-RPC / XML-RPC).", nota: "On Odoo Online, API access depends on the plan; if unavailable, scheduled loads are used." },
      { id: "sap-b1", nombre: "SAP Business One", ruta: "api", via: "Service Layer (REST / OData) or DI API.", nota: "On-premise installs get secure access to the server." },
      { id: "dynamics", nombre: "Microsoft Dynamics 365", ruta: "api", via: "Dataverse Web API / OData.", nota: "With a registered app and per-entity permissions." },
      { id: "siigo", nombre: "Siigo", ruta: "api", via: "Siigo Nube API.", nota: "Desktop versions use scheduled Excel or flat-file exports." },
      { id: "alegra", nombre: "Alegra", ruta: "api", via: "Alegra REST API.", nota: "Invoices, contacts, items and journal entries." },
      { id: "world-office", nombre: "World Office", ruta: "carga", via: "Scheduled Excel or flat-file exports.", nota: "On local servers, a read-only database connection can be evaluated." },
      { id: "helisa", nombre: "Helisa", ruta: "carga", via: "Scheduled flat-file exports and imports.", nota: "With normalized templates for third parties, cost centers and vouchers." },
      { id: "propio", nombre: "In-house or custom system", ruta: "backend", via: "Its API if any; otherwise a service or database connection.", nota: "The agent documents the schema and normalizes the data with ARS." },
      { id: "excel", nombre: "Excel only / no system", ruta: "carga", via: "ARS import templates and validated loads.", nota: "From day one; later ARS can become the main system." },
    ],
    intViaLabel: "Usual path",
    intRutaLabel: "Route",
    intNotaSistemas: "This is the usual path; the final one is confirmed in the technical assessment of your setup.",
    intProtocoloTitulo: "The import protocol",
    intProtocoloLead: "When the connection is file-based, nothing goes in blind. Every load — the initial bulk one or the recurring ones — follows the same protocol.",
    intProtocolo: [
      { t: "Template and mapping", d: "Files are agreed and the agent maps each column to ARS fields." },
      { t: "Scheduling", d: "When and how they arrive: nightly, shared folder, SFTP or email." },
      { t: "Validation and normalization", d: "The agent checks formats, duplicates and references, and normalizes clients, employees, sites and cost centers." },
      { t: "Preview", d: "Shows what will be created, updated or deactivated, with errors and warnings, before writing anything." },
      { t: "Apply and history", d: "Applied in one click, with the run logged to audit or repeat." },
    ],
    intDatosTitulo: "What usually flows",
    intDatos: ["Employees and payroll changes", "Clients and contracts", "Sites and posts", "Service orders", "Cost centers", "Journal entries", "Invoices and third parties", "Documents and attachments"],
    intModosTitulo: "Fully or in part",
    intModos: [
      { t: "Everything in ARS", d: "Information is centralized in ARS and ARS becomes the main system." },
      { t: "ARS next to your ERP", d: "ARS runs scheduling, operations or payroll, and data flows with the accounting ERP you already use." },
    ],
    intVerModulo: "See the interoperability agent",
  },
};
