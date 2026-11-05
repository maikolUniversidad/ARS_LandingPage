export type Locale = "es" | "en";

type SectionDict = {
  label: string;
  eyebrow: string;
  title1: string;
  title2: string;
  body: string;
  cta: string;
};

export type Dict = {
  nav: {
    login: string;
    menu: string;
    changeLang: string;
    home: string;
    projects: string;
    services: string;
    vision: string;
    platform: string;
    architecture: string;
    lab: string;
    diagnostic: string;
    contact: string;
  };
  bottomBar: { sound: string; scroll: string; chat: string };
  sections: {
    integral: SectionDict;
    terreno: SectionDict;
    monitoreo: SectionDict;
    ia: SectionDict;
    alertas: SectionDict;
    respuesta: SectionDict;
    control: SectionDict;
    decisiones: SectionDict;
  };
  closing: {
    eyebrow: string;
    title1: string;
    title2: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: { tagline: string; rights: string };
  projectsPage: {
    title1: string;
    title2: string;
    intro: string;
    howTo: string;
    cards: {
      scroll: { title: string; body: string };
      drag: { title: string; body: string };
      click: { title: string; body: string };
    };
    enter: string;
    listTitle: string;
    listSubtitle: string;
    bottomBar: {
      filters: string;
      openList: string;
      back: string;
    };
    panel: {
      country: string;
      region: string;
      vertical: string;
      scale: string;
      cameras: string;
      requestInfo: string;
    };
  };
  home: HomeDict;
};

type HomeChapterDict = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
};

/** Estado público de un módulo del catálogo (mismas claves que `EstadoModulo`). */
type CatalogStatusDict = { vivo: string; piloto: string; proximamente: string; "hoja-de-ruta": string };

/**
 * Home 3D — "Todas las capas de la seguridad. Una sola traza." (claves `home.*`).
 * Lo operativo (cinco capas) encima y el ERP de gestión de ARS debajo: una sola plataforma.
 */
export type HomeDict = {
  nav: { vision: string; platform: string; lab: string; contact: string; architecture: string };
  hero: {
    eyebrow: string;
    title1: string;
    title2: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scroll: string;
    trust: string[];
  };
  status: { live: string; pilot: string; lab: string };
  layers: Array<{ tag: string; name: string; status: "live" | "pilot" | "lab"; body: string; cta: string }>;
  trace: {
    label: string;
    demo: string;
    steps: Array<{ time: string; layer: string; text: string; short: string }>;
  };
  chapters: {
    fisica: HomeChapterDict;
    vision: HomeChapterDict;
    iot: HomeChapterDict;
    robotica: HomeChapterDict;
    central: HomeChapterDict;
    erp: HomeChapterDict;
    traza: HomeChapterDict;
    escala: HomeChapterDict;
  };
  /** La base: ERP de gestión (capítulo `erp`, cimiento 3D y sección «La base»). */
  erp: {
    tag: string;
    name: string;
    /** Módulos del cimiento, en el orden de las baldosas 3D y de los grupos de la sección. */
    modules: string[];
    sceneTitle: string;
    sceneSubtitle: string;
    flowLabel: string;
    /** Conversiones de la operación a la gestión (capítulo `erp`). */
    flow: Array<{ from: string; to: string; text: string }>;
    note: string;
  };
  erpSection: {
    eyebrow: string;
    title: string;
    body: string;
    opsTag: string;
    opsTitle: string;
    mgmtTag: string;
    mgmtTitle: string;
    feeds: string;
    interop: string;
    cta: string;
    catalogNote: string;
    status: CatalogStatusDict;
  };
  visionNote: string;
  labels: { guard: string; camera: string; sensor: string; robot: string; central: string; board: string; erp: string };
  board: { title: string; live: string; done: string; sites: string };
  stats: { areas: string; modules: string; live: string; analytics: string };
  ctas: { vision: string; platform: string; lab: string; services: string; trace: string; diagnostic: string };
  recap: { eyebrow: string; title: string; body: string };
  /** Sección «Capacitación»: plataforma de Formación (G) + Academia en realidad virtual. */
  training: {
    eyebrow: string;
    title: string;
    body: string;
    platform: { tag: string; status: string; title: string; body: string; points: string[]; cta: string };
    academy: { tag: string; status: string; title: string; body: string; points: string[]; cta: string };
    flowLabel: string;
    flow: { title: string; body: string }[];
    note: string;
    sceneLabel: string;
  };
  contact: {
    eyebrow: string;
    title1: string;
    title2: string;
    body: string;
    formTitle: string;
    whatsapp: string;
    email: string;
  };
  staticNote: string;
};

export const dictionaries: Record<Locale, Dict> = {
  es: {
    nav: {
      login: "Login",
      menu: "Menú",
      changeLang: "Idioma",
      home: "Inicio",
      projects: "Proyectos",
      services: "Servicios",
      vision: "Visión IA",
      platform: "Plataforma",
      architecture: "Arquitectura",
      lab: "Laboratorio",
      diagnostic: "Diagnóstico",
      contact: "Contacto",
    },
    bottomBar: {
      sound: "Sonido off",
      scroll: "Scroll para explorar",
      chat: "Hablar con un asesor",
    },
    sections: {
      integral: {
        label: "Plataforma",
        eyebrow: "01 / Seguridad integral",
        title1: "Seguridad integral",
        title2: "conectada en tiempo real.",
        body: "Centraliza cámaras, personal, alertas, evidencia y operación para que cada evento tenga contexto, trazabilidad y respuesta. ARS conecta vigilancia, tecnología, operadores y clientes en una sola plataforma.",
        cta: "Conocer la plataforma",
      },
      terreno: {
        label: "Operación",
        eyebrow: "02 / Operación en campo",
        title1: "Del terreno",
        title2: "a la plataforma.",
        body: "La seguridad empieza en el territorio: guardas, rondas, accesos, zonas críticas y novedades. Cada punto de vigilancia, cámara, zona y operador se convierte en parte activa de la operación.",
        cta: "Ver operación en campo",
      },
      monitoreo: {
        label: "Monitoreo",
        eyebrow: "03 / Central de monitoreo",
        title1: "Una central que",
        title2: "entiende lo que ocurre.",
        body: "La central de monitoreo no solo observa: prioriza, interpreta y coordina. ARS ayuda a los operadores a visualizar eventos, priorizar riesgos y coordinar respuestas con mayor velocidad.",
        cta: "Ver capacidades",
      },
      ia: {
        label: "Inteligencia",
        eyebrow: "04 / IA aplicada a la seguridad",
        title1: "IA para detectar,",
        title2: "priorizar y actuar.",
        body: "La IA detecta eventos relevantes y siempre opera como apoyo del equipo humano. Personas, vehículos, placas, rostros autorizados o restringidos, zonas ROI, cruces de línea, permanencia, EPP y eventos críticos.",
        cta: "Ver capacidades de IA",
      },
      alertas: {
        label: "Alertas",
        eyebrow: "05 / Alertas con evidencia",
        title1: "Alertas que llegan",
        title2: "con contexto.",
        body: "Cada alerta debe tener prueba visual, ubicación, cámara, hora, evento y trazabilidad. Snapshots, clips, historial y datos del evento para actuar con información, no con suposiciones.",
        cta: "Ver alertas en acción",
      },
      respuesta: {
        label: "Respuesta",
        eyebrow: "06 / Respuesta coordinada",
        title1: "De la alerta",
        title2: "a la acción.",
        body: "ARS conecta la central con el personal en campo, supervisores y responsables. Comunicación, seguimiento y respuesta operativa para cerrar el ciclo de seguridad.",
        cta: "Ver flujo de respuesta",
      },
      control: {
        label: "Control",
        eyebrow: "07 / Clientes · sedes · zonas",
        title1: "Una plataforma",
        title2: "para múltiples operaciones.",
        body: "ARS permite operar múltiples clientes, sedes, zonas, cámaras y servicios desde una sola arquitectura. Organiza clientes, sedes, zonas, cámaras, reglas IA, operadores y reportes bajo una estructura clara y escalable.",
        cta: "Ver arquitectura multisede",
      },
      decisiones: {
        label: "Decisiones",
        eyebrow: "08 / Reportes y confianza",
        title1: "Más control. Más evidencia.",
        title2: "Mejores decisiones.",
        body: "La seguridad integral termina en información útil para gerencia, auditoría y mejora continua. Convierte la operación diaria en indicadores, trazabilidad, reportes y decisiones estratégicas.",
        cta: "Ver reportes ejecutivos",
      },
    },
    closing: {
      eyebrow: "Cierre del ciclo",
      title1: "Una sola plataforma.",
      title2: "Toda tu seguridad.",
      body: "ARS Intelligence se integra con tu operación actual sin reemplazar tu hardware. Conectamos cámaras, guardas, NVRs y sistemas existentes en menos de 48 horas y entregamos un tablero único para gerencia, supervisión y respuesta.",
      ctaPrimary: "Solicitar demo",
      ctaSecondary: "Ver capacidades de la plataforma",
    },
    footer: {
      tagline: "La forma simple de hacer que todo funcione.",
      rights: "Todos los derechos reservados.",
    },
    projectsPage: {
      title1: "Una red",
      title2: "que ya está operando.",
      intro:
        "ARS Intelligence opera centrales inteligentes en Colombia y Perú, conectando cámaras y sensores en una sola red de decisión.",
      howTo: "Cómo usar el mapa",
      cards: {
        scroll: { title: "Scroll", body: "Acerca y aleja el mapa" },
        drag: { title: "Arrastra", body: "Mueve el mapa con el mouse" },
        click: { title: "Click", body: "Ver detalles del proyecto" },
      },
      enter: "Entrar al mapa",
      listTitle: "Presencia ARS",
      listSubtitle: "Ciudades operativas en Latinoamérica",
      bottomBar: {
        filters: "Filtros",
        openList: "Abrir lista de proyectos",
        back: "Volver",
      },
      panel: {
        country: "País",
        region: "Departamento / Región",
        vertical: "Verticales",
        scale: "Escala",
        cameras: "cámaras",
        requestInfo: "Solicitar información",
      },
    },
    home: {
      nav: { vision: "Visión IA", platform: "Plataforma", lab: "Laboratorio", contact: "Solicitar demo", architecture: "Arquitectura" },
      hero: {
        eyebrow: "Laboratorio de tecnología para la seguridad privada",
        title1: "Todas las capas de la seguridad.",
        title2: "Una sola traza.",
        body: "Vigilancia física, cámaras con IA, sensores, robótica y central de operaciones, sobre un ERP propio que gestiona la empresa. Una sola plataforma: cada evento queda trazado, del puesto a la gerencia.",
        ctaPrimary: "Solicitar demo",
        ctaSecondary: "Ver cómo fluye un evento",
        scroll: "Desliza · mira cómo se encienden las capas",
        trust: ["Hecho en Colombia", "Para empresas de seguridad privada", "Latinoamérica y el mundo"],
      },
      status: { live: "En operación", pilot: "Piloto", lab: "En desarrollo" },
      layers: [
        { tag: "Capa 01", name: "Vigilancia física", status: "live", body: "Turnos, rondas con QR, minuta, radio y botón de pánico desde el celular del vigilante, con el supervisor visible en campo.", cta: "Operación en campo" },
        { tag: "Capa 02", name: "Visión con IA", status: "live", body: "Analíticas sobre las cámaras de cada sede: intrusión, cruce de línea, merodeo, objetos olvidados, conteo y aforo.", cta: "Ver Visión IA" },
        { tag: "Capa 03", name: "Sensores e IoT", status: "live", body: "Sensores, accesos, alarmas y relojes biométricos en el mismo panel que el resto de la operación.", cta: "Monitoreo inteligente" },
        { tag: "Capa 04", name: "Robótica", status: "lab", body: "Perros robot que recorren y verifican con las mismas analíticas de las cámaras. En desarrollo en nuestro laboratorio.", cta: "Ir al laboratorio" },
        { tag: "Capa 05", name: "Central y gerencia", status: "live", body: "Mapa en vivo, radio, chat y pánico en una pantalla; la gerencia ve en tiempo real qué está cubierto y qué pasó.", cta: "Centro de operaciones" },
      ],
      trace: {
        label: "Traza del evento",
        demo: "Escenario de demostración.",
        steps: [
          { time: "02:14:07", layer: "Vigilancia física", text: "Ronda: el vigilante escanea el punto 7 de la cerca norte y reporta una novedad con foto.", short: "Ronda reporta" },
          { time: "02:14:19", layer: "Visión IA", text: "Cámara 04: la analítica de cruce de línea confirma una persona en zona restringida; el operador valida la alerta.", short: "Cámara confirma" },
          { time: "02:14:31", layer: "Sensores", text: "Sensor: puerta de la bodega 2 abierta fuera de horario.", short: "Puerta abierta" },
          { time: "02:14:58", layer: "Robótica · En desarrollo", text: "Robot: verifica el sector con las mismas analíticas y envía video a la central.", short: "Robot verifica" },
          { time: "02:15:24", layer: "Central", text: "Central: despacha por radio al supervisor más cercano desde el mapa en vivo.", short: "Central despacha" },
          { time: "02:31:46", layer: "Gerencia", text: "Cierre: informe con evidencia, responsable y tiempos; la gerencia lo ve en su tablero.", short: "Cierre en gerencia" },
        ],
      },
      chapters: {
        fisica: { eyebrow: "Capa 01 · Vigilancia física", title: "Todo empieza en el puesto.", body: "Turnos, relevos, rondas con QR y minuta desde el celular, con foto, firma, ubicación y hora. Radio y botón de pánico en el mismo teléfono, y el supervisor siempre visible en campo.", points: ["Rondas con QR", "Minuta digital", "Radio PTT", "Botón de pánico"] },
        vision: { eyebrow: "Capa 02 · Visión con IA", title: "Las cámaras ya no solo graban. Avisan.", body: "Intrusión, cruce de línea, merodeo, objetos olvidados, conteo y aforo sobre las cámaras que la sede ya tiene. Cada alerta llega con foto y video, y una persona confirma antes de actuar.", points: ["Cruce de línea", "Merodeo", "Objetos olvidados", "Aforo"] },
        iot: { eyebrow: "Capa 03 · Sensores e IoT", title: "El edificio también reporta.", body: "Sensores, controles de acceso, alarmas y relojes biométricos de todas las sedes en un solo panel. Una puerta abierta fuera de horario se vuelve un evento más de la misma traza.", points: ["Accesos", "Alarmas", "Relojes biométricos"] },
        robotica: { eyebrow: "Capa 04 · Robótica", title: "La próxima ronda puede tener cuatro patas.", body: "En nuestro laboratorio desarrollamos perros robot que recorren y verifican con las mismas analíticas de las cámaras. La plataforma está pensada para sumar nuevos dispositivos sin cambiar la forma de operar.", points: ["Mismas analíticas", "Extensible a nuevos dispositivos"] },
        central: { eyebrow: "Capa 05 · Central y gerencia", title: "Una central que ve todo. Una gerencia que lo sabe al instante.", body: "Mapa en vivo de cada sede y cada persona, radio, chat y pánico en la misma pantalla. La gerencia ve en tiempo real qué está cubierto, qué falta y qué pasó.", points: ["Mapa en vivo", "Despacho por radio", "Tablero de gerencia"] },
        erp: { eyebrow: "La base · ERP de gestión", title: "Debajo de todo, un ERP hecho para la seguridad.", body: "Lo operativo es lo que se ve. Por debajo, el ERP de ARS administra la empresa de seguridad: contratos y turnos, personas y nómina, documentos, formación, clientes, finanzas y gobierno. Cada capa lo alimenta sola.", points: [] },
        traza: { eyebrow: "02:14 a. m. · Todo es una traza", title: "Un evento. Cinco capas. Ningún cabo suelto.", body: "Así fluye una alerta en ARS: cada capa suma su evidencia a la misma línea de tiempo, y nada se pierde entre un radio, un chat y una planilla.", points: [] },
        escala: { eyebrow: "Operación + gestión · todas las sedes", title: "La nueva era de la seguridad privada ya opera.", body: "Cada sede, cada cliente y cada turno en la misma plataforma: la operación encima, el ERP de gestión debajo y multiagentes de IA que proponen mientras una persona decide. Desde Colombia para Latinoamérica y el mundo.", points: [] },
      },
      erp: {
        tag: "La base",
        name: "ERP de gestión",
        modules: ["Contratos y turnos", "Personas y nómina", "Documental", "Formación", "Clientes", "Finanzas y facturación", "Gobierno y auditoría"],
        sceneTitle: "ARS · ERP de gestión",
        sceneSubtitle: "La base de toda la operación",
        flowLabel: "De la operación a la gestión",
        flow: [
          { from: "Turno cumplido", to: "Nómina", text: "Lo programado y las marcas reales llegan a la liquidación, sin volver a digitarlos." },
          { from: "Ronda y evento", to: "Informe al cliente", text: "La evidencia de la operación arma el reporte que recibe cada cliente." },
          { from: "Servicio prestado", to: "Prefactura", text: "Lo contratado y lo cumplido se convierten en líneas para facturar." },
          { from: "Nómina y facturación", to: "Contabilidad", text: "Todo se cruza con la contabilidad y queda en la auditoría." },
        ],
        note: "Con el ERP de ARS o con el que ya usa: el Agente interoperador los conecta, completo o por partes.",
      },
      erpSection: {
        eyebrow: "La base · una sola plataforma",
        title: "La base: un ERP hecho para la seguridad.",
        body: "Lo que impresiona está arriba: vigilancia, cámaras con IA, sensores, robótica y central. Lo que sostiene la empresa está abajo: el ERP de ARS para el proceso base de una compañía de seguridad, alimentado por toda la operación. No son dos sistemas: es la misma plataforma.",
        opsTag: "Arriba · Operación",
        opsTitle: "Lo que pasa en cada sede",
        mgmtTag: "Abajo · Gestión",
        mgmtTitle: "Lo que administra la empresa",
        feeds: "Cada turno, ronda y evento alimenta la gestión",
        interop: "¿Ya tiene un ERP? El Agente interoperador de datos lo conecta con ARS, completo o solo en las partes que necesite.",
        cta: "Ver la arquitectura completa",
        catalogNote: "Estados reales del catálogo de servicios.",
        status: { vivo: "En producción", piloto: "En piloto", proximamente: "Próximamente", "hoja-de-ruta": "Hoja de ruta" },
      },
      visionNote: "Analíticas según el equipo de cada sede",
      labels: { guard: "Ronda · punto 7", camera: "Cámara 04 · IA", sensor: "Puerta bodega 2", robot: "Robot · en desarrollo", central: "Central de operaciones", board: "Tablero de gerencia", erp: "ERP de gestión ARS" },
      board: { title: "ARS · Operación", live: "En vivo", done: "Evento cerrado", sites: "Sedes" },
      stats: { areas: "áreas de servicio en una plataforma", modules: "módulos en el catálogo", live: "módulos en operación", analytics: "analíticas de video" },
      ctas: { vision: "Ver Visión IA", platform: "Ver la plataforma", lab: "Ir al laboratorio", services: "Ver todos los servicios", trace: "Ver cómo fluye un evento", diagnostic: "Hacer mi diagnóstico" },
      recap: {
        eyebrow: "Una plataforma · cinco capas + la base",
        title: "No son cinco programas. Es una sola operación.",
        body: "Cada capa trabaja sola y, al mismo tiempo, alimenta la misma traza y el mismo ERP de gestión. Elige por dónde empezar: la plataforma crece con tu operación.",
      },
      training: {
        eyebrow: "Capacitación · Formación + Academia en realidad virtual",
        title: "Aquí se forma a la gente que cuida. Y cada certificado se puede comprobar.",
        body: "La plataforma de capacitación del ARS lleva los cursos a toda la plantilla. La Academia ARS suma la práctica en realidad virtual: lo que no se puede practicar en la calle, sin riesgo y con un instructor que explica el porqué. La VR no es un sistema paralelo: es una actividad más dentro de los cursos del ARS.",
        platform: {
          tag: "G · Formación",
          status: "En operación",
          title: "Plataforma de capacitación",
          body: "Cursos desde el celular, asignados solos a quien los necesita, con evaluaciones y un certificado que cualquiera puede verificar.",
          points: [
            "Asignación automática por cargo, sede, cliente o puesto",
            "Diseñador de cursos con IA",
            "Video largo convertido en temas",
            "Evaluaciones de conocimiento",
            "Certificados con QR verificable",
          ],
          cta: "Ver la plataforma de capacitación",
        },
        academy: {
          tag: "Academia ARS · VR",
          status: "Piloto",
          title: "Academia en realidad virtual",
          body: "El vigilante se pone las gafas, entra a la escuela de su empresa y aprende haciendo.",
          points: [
            "Atención a residentes, visitantes y domicilios",
            "Dotación: se viste y pasa revista",
            "Manejo seguro del arma en el polígono",
            "Uso de la fuerza: ¿puede o no puede?",
            "Un turno de doce horas en pocos minutos",
          ],
          cta: "Entrar a la Academia",
        },
        flowLabel: "Cómo funciona",
        flow: [
          { title: "Se asigna desde el ARS", body: "Por cargo, sede o cliente, con fecha límite. El curso le llega solo a quien lo necesita." },
          { title: "Se practica en las gafas", body: "Con mandos o con las manos, hablando en voz alta. La persona del otro lado responde según el trato." },
          { title: "Se certifica con QR", body: "El acta la firma un instructor y lleva un código QR que cualquiera puede comprobar." },
        ],
        note: "La Academia está en piloto: hoy se vive el recorrido de demostración (portal, polígono y certificado). La conexión que lleva la nota de las gafas a la plataforma está en diseño. La práctica en VR complementa la formación presencial; no la reemplaza.",
        sceneLabel: "Vista de la Academia ARS",
      },
      contact: {
        eyebrow: "Hablemos de tu operación",
        title1: "Lleva tu empresa de seguridad",
        title2: "a la nueva era.",
        body: "Cuéntanos cómo opera hoy tu empresa (sedes, puestos, cámaras, central) y te mostramos cómo se ve todo en una sola traza.",
        formTitle: "Cuéntanos qué necesitas",
        whatsapp: "Escribir por WhatsApp",
        email: "Enviar correo",
      },
      staticNote: "Vista simplificada",
    },
  },
  en: {
    nav: {
      login: "Login",
      menu: "Menu",
      changeLang: "Language",
      home: "Home",
      projects: "Projects",
      services: "Services",
      vision: "AI Vision",
      platform: "Platform",
      architecture: "Architecture",
      lab: "Lab",
      diagnostic: "Assessment",
      contact: "Contact",
    },
    bottomBar: {
      sound: "Sound off",
      scroll: "Scroll to explore",
      chat: "Talk to an advisor",
    },
    sections: {
      integral: {
        label: "Platform",
        eyebrow: "01 / Integrated security",
        title1: "Integrated security,",
        title2: "connected in real time.",
        body: "Centralize cameras, personnel, alerts, evidence and operations so every event has context, traceability and response. ARS connects surveillance, technology, operators and clients on a single platform.",
        cta: "Discover the platform",
      },
      terreno: {
        label: "Field ops",
        eyebrow: "02 / Field operations",
        title1: "From the ground",
        title2: "to the platform.",
        body: "Security starts on the ground: guards, patrols, access points, critical zones and incidents. Every watch point, camera, zone and operator becomes an active part of the operation.",
        cta: "See field operations",
      },
      monitoreo: {
        label: "Monitoring",
        eyebrow: "03 / Operations center",
        title1: "An operations center",
        title2: "that understands what's happening.",
        body: "The operations center doesn't just watch — it prioritizes, interprets and coordinates. ARS helps operators visualize events, rank risks and coordinate response with greater speed.",
        cta: "See capabilities",
      },
      ia: {
        label: "Intelligence",
        eyebrow: "04 / AI applied to security",
        title1: "AI to detect,",
        title2: "prioritize and act.",
        body: "AI detects relevant events and always operates as support to the human team. People, vehicles, plates, authorized or restricted faces, ROI zones, line-cross, dwell time, PPE and critical events.",
        cta: "See AI capabilities",
      },
      alertas: {
        label: "Alerts",
        eyebrow: "05 / Alerts with evidence",
        title1: "Alerts that arrive",
        title2: "with full context.",
        body: "Every alert needs visual proof, location, camera, time, event and traceability. Snapshots, clips, history and event data so your team acts on information — not assumptions.",
        cta: "See alerts in action",
      },
      respuesta: {
        label: "Response",
        eyebrow: "06 / Coordinated response",
        title1: "From the alert",
        title2: "to the action.",
        body: "ARS connects the operations center with field personnel, supervisors and decision makers. Communication, tracking and operational response to close the security loop.",
        cta: "See response flow",
      },
      control: {
        label: "Control",
        eyebrow: "07 / Clients · sites · zones",
        title1: "One platform",
        title2: "for many operations.",
        body: "ARS lets you operate multiple clients, sites, zones, cameras and services from a single architecture. Organize clients, sites, zones, cameras, AI rules, operators and reports under a clear, scalable structure.",
        cta: "See multi-site architecture",
      },
      decisiones: {
        label: "Decisions",
        eyebrow: "08 / Reports and trust",
        title1: "More control. More evidence.",
        title2: "Better decisions.",
        body: "Integrated security ends in actionable information for management, audit and continuous improvement. Turn daily operations into KPIs, traceability, reports and strategic decisions.",
        cta: "See executive reports",
      },
    },
    closing: {
      eyebrow: "Closing the loop",
      title1: "One platform.",
      title2: "All your security.",
      body: "ARS Intelligence integrates with your existing operation without replacing your hardware. We connect cameras, guards, NVRs and existing systems in under 48 hours and deliver a single dashboard for management, supervision and response.",
      ctaPrimary: "Request demo",
      ctaSecondary: "See platform capabilities",
    },
    footer: {
      tagline: "The simple way to make everything work.",
      rights: "All rights reserved.",
    },
    projectsPage: {
      title1: "A network",
      title2: "already in operation.",
      intro:
        "ARS Intelligence runs intelligent operations centers across Colombia and Peru, connecting cameras and sensors into a single decision network.",
      howTo: "How to use the map",
      cards: {
        scroll: { title: "Scroll", body: "Zoom in and out of the map" },
        drag: { title: "Drag", body: "Move the map around" },
        click: { title: "Click", body: "View project details" },
      },
      enter: "Enter the map",
      listTitle: "ARS presence",
      listSubtitle: "Operating cities across Latin America",
      bottomBar: {
        filters: "Filters",
        openList: "Open project list",
        back: "Back",
      },
      panel: {
        country: "Country",
        region: "Region / State",
        vertical: "Verticals",
        scale: "Scale",
        cameras: "cameras",
        requestInfo: "Request information",
      },
    },
    home: {
      nav: { vision: "AI Vision", platform: "Platform", lab: "Lab", contact: "Request demo", architecture: "Architecture" },
      hero: {
        eyebrow: "Technology lab for private security",
        title1: "Every layer of security.",
        title2: "One trace.",
        body: "Guarding, AI on cameras, sensors, robotics and the operations center, on top of our own ERP that runs the company. One platform: every event is traced, from the post to management.",
        ctaPrimary: "Request a demo",
        ctaSecondary: "See how an event flows",
        scroll: "Scroll · watch the layers come alive",
        trust: ["Made in Colombia", "For private security companies", "Latin America and the world"],
      },
      status: { live: "Live", pilot: "Pilot", lab: "In development" },
      layers: [
        { tag: "Layer 01", name: "Physical guarding", status: "live", body: "Shifts, QR rounds, logbook, radio and panic button from the guard's phone, with the field supervisor always in view.", cta: "Field operations" },
        { tag: "Layer 02", name: "AI vision", status: "live", body: "Analytics on each site's cameras: intrusion, line crossing, loitering, left objects, people counting and occupancy.", cta: "See AI Vision" },
        { tag: "Layer 03", name: "Sensors and IoT", status: "live", body: "Sensors, access control, alarms and biometric clocks on the same panel as the rest of the operation.", cta: "Smart monitoring" },
        { tag: "Layer 04", name: "Robotics", status: "lab", body: "Robot dogs that patrol and verify using the same camera analytics. In development in our lab.", cta: "Visit the lab" },
        { tag: "Layer 05", name: "Operations and management", status: "live", body: "Live map, radio, chat and panic on one screen; management sees in real time what is covered and what happened.", cta: "Operations center" },
      ],
      trace: {
        label: "Event trace",
        demo: "Demo scenario.",
        steps: [
          { time: "02:14:07", layer: "Physical guarding", text: "Patrol: the guard scans checkpoint 7 on the north fence and reports an incident with a photo.", short: "Patrol reports" },
          { time: "02:14:19", layer: "AI vision", text: "Camera 04: line-crossing analytics confirms a person in a restricted zone; the operator validates the alert.", short: "Camera confirms" },
          { time: "02:14:31", layer: "Sensors", text: "Sensor: warehouse 2 door opened after hours.", short: "Door opened" },
          { time: "02:14:58", layer: "Robotics · In development", text: "Robot: checks the area with the same analytics and streams video to the center.", short: "Robot verifies" },
          { time: "02:15:24", layer: "Operations center", text: "Operations center: dispatches the nearest supervisor by radio from the live map.", short: "Center dispatches" },
          { time: "02:31:46", layer: "Management", text: "Closure: report with evidence, owner and timings; management sees it on its dashboard.", short: "Closed for management" },
        ],
      },
      chapters: {
        fisica: { eyebrow: "Layer 01 · Physical guarding", title: "It all starts at the post.", body: "Shifts, handovers, QR rounds and logbook from the phone, with photo, signature, location and time. Radio and panic button on the same phone, and the field supervisor always in view.", points: ["QR rounds", "Digital logbook", "PTT radio", "Panic button"] },
        vision: { eyebrow: "Layer 02 · AI vision", title: "Cameras no longer just record. They alert.", body: "Intrusion, line crossing, loitering, left objects, people counting and occupancy on the cameras a site already has. Every alert arrives with photo and video, and a person confirms before acting.", points: ["Line crossing", "Loitering", "Left objects", "Occupancy"] },
        iot: { eyebrow: "Layer 03 · Sensors and IoT", title: "The building reports too.", body: "Sensors, access controls, alarms and biometric clocks from every site in a single panel. A door opened after hours becomes one more event in the same trace.", points: ["Access", "Alarms", "Biometric clocks"] },
        robotica: { eyebrow: "Layer 04 · Robotics", title: "The next patrol may walk on four legs.", body: "In our lab we are developing robot dogs that patrol and verify using the same camera analytics. The platform is built to add new devices without changing the way you operate.", points: ["Same analytics", "Extensible to new devices"] },
        central: { eyebrow: "Layer 05 · Operations and management", title: "A center that sees everything. Management that knows instantly.", body: "A live map of every site and every person, with radio, chat and panic alerts on the same screen. Management sees in real time what is covered, what is missing and what happened.", points: ["Live map", "Radio dispatch", "Management dashboard"] },
        erp: { eyebrow: "The base · Management ERP", title: "Underneath it all, an ERP built for security.", body: "Operations is what you see. Underneath, the ARS ERP runs the security company: contracts and shifts, people and payroll, documents, training, clients, finance and governance. Every layer feeds it on its own.", points: [] },
        traza: { eyebrow: "2:14 a.m. · Everything is a trace", title: "One event. Five layers. No loose ends.", body: "This is how an alert flows in ARS: each layer adds its evidence to the same timeline, and nothing gets lost between a radio, a chat and a spreadsheet.", points: [] },
        escala: { eyebrow: "Operations + management · every site", title: "The new era of private security is already running.", body: "Every site, every client and every shift on the same platform: operations on top, the management ERP underneath, and AI multi-agents that propose while a person decides. From Colombia to Latin America and the world.", points: [] },
      },
      erp: {
        tag: "The base",
        name: "Management ERP",
        modules: ["Contracts and shifts", "People and payroll", "Documents", "Training", "Clients", "Finance and billing", "Governance and audit"],
        sceneTitle: "ARS · Management ERP",
        sceneSubtitle: "The base of every operation",
        flowLabel: "From operations to management",
        flow: [
          { from: "Shift worked", to: "Payroll", text: "Scheduled shifts and real clock-ins reach payroll without being typed again." },
          { from: "Patrol and event", to: "Client report", text: "Evidence from the field builds the report each client receives." },
          { from: "Service delivered", to: "Pre-invoice", text: "What was contracted and delivered becomes lines ready to bill." },
          { from: "Payroll and billing", to: "Accounting", text: "Everything is matched against accounting and stays in the audit trail." },
        ],
        note: "With the ARS ERP or the one you already use: the data interoperability agent connects them, fully or in parts.",
      },
      erpSection: {
        eyebrow: "The base · one platform",
        title: "The base: an ERP built for security.",
        body: "The impressive part is on top: guarding, AI cameras, sensors, robotics and the operations center. What holds the company together is underneath: the ARS ERP for the core processes of a security company, fed by every operation. Not two systems: one platform.",
        opsTag: "Top · Operations",
        opsTitle: "What happens at every site",
        mgmtTag: "Bottom · Management",
        mgmtTitle: "What runs the company",
        feeds: "Every shift, patrol and event feeds management",
        interop: "Already have an ERP? The data interoperability agent connects it to ARS, fully or only in the parts you need.",
        cta: "See the full architecture",
        catalogNote: "Real statuses from our service catalog (module names in Spanish).",
        status: { vivo: "Live", piloto: "Pilot", proximamente: "Coming soon", "hoja-de-ruta": "Roadmap" },
      },
      visionNote: "Analytics depend on each site's equipment",
      labels: { guard: "Patrol · checkpoint 7", camera: "Camera 04 · AI", sensor: "Warehouse 2 door", robot: "Robot · in development", central: "Operations center", board: "Management dashboard", erp: "ARS management ERP" },
      board: { title: "ARS · Operations", live: "Live", done: "Event closed", sites: "Sites" },
      stats: { areas: "service areas in one platform", modules: "modules in the catalog", live: "modules live today", analytics: "video analytics" },
      ctas: { vision: "See AI Vision", platform: "See the platform", lab: "Visit the lab", services: "See all services", trace: "See how an event flows", diagnostic: "Get my assessment" },
      recap: {
        eyebrow: "One platform · five layers + the base",
        title: "Not five programs. One operation.",
        body: "Each layer works on its own and, at the same time, feeds the same trace and the same management ERP. Choose where to start: the platform grows with your operation.",
      },
      training: {
        eyebrow: "Training · Courses + virtual reality Academy",
        title: "This is where the people who protect are trained. And every certificate can be checked.",
        body: "The ARS training platform brings courses to the entire workforce. The ARS Academy adds practice in virtual reality: what can't be practiced on the street, risk-free and with an instructor who explains why. VR isn't a parallel system: it's one more activity inside ARS courses.",
        platform: {
          tag: "G · Training",
          status: "Live",
          title: "Training platform",
          body: "Courses on the phone, assigned automatically to whoever needs them, with assessments and a certificate anyone can verify.",
          points: [
            "Automatic assignment by role, site, client or post",
            "AI course designer",
            "Long videos turned into topics",
            "Knowledge assessments",
            "Certificates with a verifiable QR code",
          ],
          cta: "See the training platform",
        },
        academy: {
          tag: "ARS Academy · VR",
          status: "Pilot",
          title: "Virtual reality Academy",
          body: "The guard puts on the headset, walks into their company's school and learns by doing.",
          points: [
            "Serving residents, visitors and deliveries",
            "Gear: dressing up and passing inspection",
            "Safe firearm handling at the range",
            "Use of force: can they or can't they?",
            "A twelve-hour shift in a few minutes",
          ],
          cta: "Enter the Academy",
        },
        flowLabel: "How it works",
        flow: [
          { title: "Assigned from ARS", body: "By role, site or client, with a deadline. The course reaches only those who need it." },
          { title: "Practiced in the headset", body: "With controllers or hands, speaking out loud. The person on the other side reacts to how they're treated." },
          { title: "Certified with a QR code", body: "The record is signed by an instructor and carries a QR code anyone can check." },
        ],
        note: "The Academy is in pilot: today you can try the demo tour (portal, range and certificate). The link that sends the headset score to the platform is in design. VR practice complements in-person training; it doesn't replace it.",
        sceneLabel: "View of the ARS Academy",
      },
      contact: {
        eyebrow: "Let's talk about your operation",
        title1: "Take your security company",
        title2: "into the new era.",
        body: "Tell us how your company runs today (sites, posts, cameras, control room) and we'll show you what it looks like as a single trace.",
        formTitle: "Tell us what you need",
        whatsapp: "Message on WhatsApp",
        email: "Send email",
      },
      staticNote: "Simplified view",
    },
  },
};

export const sectionKeys = [
  "integral",
  "terreno",
  "monitoreo",
  "ia",
  "alertas",
  "respuesta",
  "control",
  "decisiones",
] as const;

export type SectionKey = (typeof sectionKeys)[number];
