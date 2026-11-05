/**
 * Contenido de /academia — «Academia ARS · Capacitación de vigilantes en realidad virtual».
 *
 * Fuente única: `docs/research/SALA-VR-ARS-CAPACITACION-PARA-WEB.md` (5-nov-2026, app «ARS» 0.2.0),
 * Partes 2, 3, 4 y 5, y para las 12 tarjetas del Módulo 1 su origen en el diseño de la gafa
 * (`kit/docs/academia/02-INDUCCION-Y-DOTACION.md`, estación 4).
 *
 * Reglas de §5.5 que este archivo respeta:
 * - No se dice que la nota de la VR ya llega al ARS (el módulo `/vr/*` del servidor no existe aún).
 * - No se dice que reemplaza las horas presenciales ni que el acta vale ante Supervigilancia.
 * - No se dice que los cuatro módulos ya son jugables ni que la IA ya conversa en tiempo real.
 * - Nada de sangre, de táctica ofensiva ni de detección de armas por cámara.
 */

// ───────────────────────────── Audios de personajes ─────────────────────────────
// Los MP3 los produce la sesión de audios (`src/data/academia/audios.ts` define ids y textos).
// Aquí solo se referencian por id; el reproductor tolera que un archivo falte.

export const IDS_AUDIO_PERSONAJE = [
  "oscar-bienvenida",
  "oscar-canon",
  "oscar-dedo",
  "oscar-alto",
  "oscar-vacio",
  "vigilante-b1-1",
  "vigilante-b1-2",
  "vigilante-b1-3",
  "vigilante-b1-4",
  "edgar-b1-1",
  "edgar-b1-2",
  "edgar-b1-3",
  "edgar-b1-4",
  "yamile-guion",
  "gloria",
  "zuluaga",
  "kevin",
  "diana-radio",
  "ramiro",
] as const;

export type AudioPersonajeId = (typeof IDS_AUDIO_PERSONAJE)[number];

export const urlAudioPersonaje = (id: AudioPersonajeId) => `/audio/academia/personajes/${id}.mp3`;

// ───────────────────────────── Colores ─────────────────────────────

export const VIOLETA = "#b78bff";
export const AZUL = "#6b8aff";
export const VERDE = "#35e0a1";
export const ROJO = "#ff6b7a";
export const AMBAR = "#ffb547";

// ───────────────────────────── 1 · Hero ─────────────────────────────

export const HERO = {
  eyebrow: "Academia ARS · Capacitación de vigilantes en realidad virtual",
  titulo: "Aquí se forma a la gente que cuida.",
  tituloAcento: "Y cada certificado se puede comprobar.",
  // §5.1, con la última frase ajustada a §5.5 (la conexión con el ARS está diseñada, no construida).
  subtitulo:
    "Su personal practica lo que no se puede practicar en la calle: el atraco en la entrada, el visitante agresivo, la decisión de desenfundar o no. Sin riesgo, con un instructor que explica el porqué, y con la Academia diseñada para llevar cada resultado a la hoja de vida de capacitación del ARS.",
  frases: [
    "Lo que no se puede practicar en la calle, se practica aquí.",
    "Gana el que previene, reporta y protege la vida.",
    "Basada en la normativa colombiana de vigilancia privada.",
  ],
  /** Todo lo que el vigilante practica con las gafas puestas (§2.1, §2.2 y los cuatro módulos). */
  practica: [
    { titulo: "Atención y servicio", detalle: "Saludar, pedir el documento con cortesía y negar el ingreso sin humillar" },
    { titulo: "Dotación y revista", detalle: "Vestirse, revisar el equipo y recibir el puesto en el relevo" },
    { titulo: "Manejo seguro del arma", detalle: "Revólver y escopeta de entrenamiento, con un guardián de seguridad" },
    { titulo: "Uso de la fuerza", detalle: "Decidir desde la garita si puede o no, casi siempre sin desenfundar" },
    { titulo: "Turno en la portería", detalle: "Doce horas en pocos minutos: residentes, domicilios, paquetes y emergencias" },
    { titulo: "Reporte y minuta", detalle: "Radio a la central primero, 123 si hay riesgo para la vida, minuta al final" },
  ],
  sellos: ["Meta Quest 3 / 3S y Quest 2", "Con mandos o con las manos", "Demo sin internet"],
} as const;

// ───────────────────────────── 2 · Por qué en VR ─────────────────────────────

export const POR_QUE = {
  titulo: "Por qué en realidad virtual",
  intro:
    "La Academia ARS es el módulo de capacitación de la plataforma ARS en realidad virtual. El vigilante se pone las gafas, entra a la escuela de su empresa y aprende haciendo.",
  razones: [
    {
      titulo: "Lo que no se puede practicar en la calle",
      texto:
        "Un atraco en la entrada, un borracho agresivo en la reja, un paquete que gotea, la decisión de desenfundar o no. En VR se practican cien veces, sin peligro y con un instructor que explica el porqué.",
    },
    {
      titulo: "Todo queda medido",
      texto:
        "Cuánto tardó en reportar a la central, si habló con respeto, si el dedo estuvo fuera del gatillo, si dejó entrar a quien no debía.",
    },
    {
      titulo: "Encaja con los cursos del ARS",
      texto:
        "El ARS ya hace cursos, evaluaciones, certificados con QR y auditoría de quién debe qué curso. La VR es una actividad más dentro de esos cursos, no un sistema paralelo.",
    },
  ],
  marca:
    "ARS Intelligence es una empresa de tecnología: la escuela, el uniforme y los instructores son de la empresa de seguridad. ARS pone la herramienta. En la demo, la empresa es ficticia: «Seguridad Andina».",
  paraQuien: [
    { persona: "Vigilante / guarda", hace: "Dotación, revista y relevo, manejo seguro del arma, uso de la fuerza, control de acceso, servicio, minuta, rondas", gafas: true },
    { persona: "Supervisor", hace: "Revista de puestos, respuesta a novedades, cobertura", gafas: true },
    { persona: "Operador de central", hace: "Atender alertas de video y de pánico de punta a punta: radio, minuta, escalamiento", gafas: true },
    { persona: "Coordinador / jefe de capacitación", hace: "No se pone las gafas: asigna, ve resultados y certifica desde la web del ARS", gafas: false },
    { persona: "Instructor", hace: "Dirige la sesión en el salón, elige quién se pone la gafa, revisa el repaso y firma el acta", gafas: false },
  ],
  organizacion:
    "Cada empresa de seguridad cliente es una organización del ARS: sus vigilantes, sus resultados y sus certificados quedan aislados de las demás, como en el resto de la plataforma.",
} as const;

// ───────────────────────────── 3 · El curso ─────────────────────────────

export type ModuloCurso = {
  n: 1 | 2 | 3 | 4;
  ancla: string;
  nombre: string;
  actividad: string;
  area: string;
  nota: string;
};

export const CURSO = {
  titulo: "El curso: «Academia ARS · Vigilante»",
  portal:
    "Se entra por un portal en el vestíbulo: un remolino verde de 2,2 m a través del cual ya se ve el patio de formación, con cadetes trotando y el instructor Óscar. Antes de verlo se oye: el silbato, las órdenes, los pasos en formación. El patio tiene las puertas a cada actividad (aula, polígono, garita, portería) y el tablero del curso con el avance. Siempre hay Repetir, Pausa, Salir al patio y la salida al vestíbulo.",
  modulos: [
    { n: 1, ancla: "modulo-1", nombre: "Inducción y dotación", actividad: "Actividad calificada: revista y relevo", area: "Procedimientos de seguridad privada", nota: "80" },
    { n: 2, ancla: "modulo-2", nombre: "Manejo seguro y polígono", actividad: "Lecciones P1 a P10", area: "Armamento y tiro", nota: "70 fundamentación · 75 reentrenamiento · 80 especialización" },
    { n: 3, ancla: "modulo-3", nombre: "Uso de la fuerza", actividad: "12 escenarios × 4 niveles de dificultad", area: "Legal + procedimientos", nota: "80, y cero faltas graves en los escenarios obligatorios" },
    { n: 4, ancla: "modulo-4", nombre: "Turno en la portería", actividad: "Turno de día o de noche, 3 tipos de puesto, 4 niveles", area: "Procedimientos + socio-humanística", nota: "80" },
  ] satisfies ModuloCurso[],
  orden: "Primero el Módulo 1. Después el 2 y el 3, en cualquier orden. El Módulo 4 se abre al final.",
  ciclos: [
    { nombre: "Fundamentación", detalle: "El que empieza" },
    { nombre: "Reentrenamiento", detalle: "El anual" },
    { nombre: "Especialización", detalle: "Elige su contexto: residencial (conjunto), comercial (calle o local) o industrial (fábrica o bodega), y la Academia le da prioridad a esos escenarios" },
  ],
  ciclosFuente: "Los ciclos son los de la Resolución 4973 de 2011.",
  asigna: "El administrador de la empresa en el ARS asigna módulos, niveles mínimos y fechas límite.",
  notasFuente: "Notas mínimas por defecto, tomadas de la Res. 4973, art. 45. Cada empresa las puede ajustar.",
} as const;

// ───────────────────────────── Estado por módulo (Parte 4) ─────────────────────────────

export type Estado = { texto: string; color: string };

export const ESTADO_MODULO: Record<1 | 2 | 3 | 4, Estado> = {
  1: { texto: "Contenido escrito · el aula se ve hoy en el recorrido de feria", color: AMBAR },
  2: { texto: "Construido en parte · jugables hoy P3 y la serie 2 de P7", color: AMBAR },
  3: { texto: "Contenido escrito y validado · falta construir la garita jugable", color: AZUL },
  4: { texto: "Contenido escrito · falta construir la portería jugable", color: AZUL },
};

// ───────────────────────────── 4.1 · Módulo 1 ─────────────────────────────

export type Tarjeta = { situacion: string; puede: boolean; respuesta: string; porque?: string };

export const MODULO_1 = {
  nombre: "Su puesto, su dotación",
  sub: "Inducción y revista",
  lugar: "El aula-vestier de la escuela",
  guia: "Óscar, el instructor jefe",
  resumen:
    "El vigilante se viste, revisa su dotación y aprende qué puede y qué no puede hacer en el puesto. Termina con una revista y un relevo calificados.",
  estaciones: [
    { nombre: "Bienvenida", tiempo: "60 s", hace: "Óscar presenta la escuela y las reglas" },
    {
      nombre: "«Vístase»",
      hace: "Se pone cada elemento de la dotación en su lugar: uniforme (distinto al de la Policía y sin grados), gorra, credencial de Supervigilancia (vigente un año), carné de la empresa, radio con batería, linterna, pito, bastón si el puesto lo tiene, libreta y bolígrafo, y celular con los números de la central, el supervisor, el cuadrante, el 123, bomberos y Cruz Roja",
    },
    { nombre: "La mesa del puesto", hace: "Revisa la dotación del puesto" },
    { nombre: "«¿Puede o no puede?»", hace: "12 tarjetas rápidas que el alumno lanza a dos canastas: PUEDE o NO PUEDE" },
    { nombre: "Medio canino", tiempo: "opcional", hace: "Wilmer, el guía canino, y su perro Zeus enseñan el bienestar del animal, el mando y sus límites" },
    { nombre: "Actividad calificada: «Revista y relevo»", tiempo: "5–6 min", hace: "Le pasa revista a un compañero y recibe el puesto en el relevo: novedades, equipo y minuta" },
  ],
  tarjetas: [
    { situacion: "Pedir el documento a un visitante y registrarlo", puede: true, respuesta: "Puede" },
    { situacion: "Retener la cédula del visitante hasta que salga", puede: false, respuesta: "No puede", porque: "Se registra y se devuelve." },
    { situacion: "Requisar la maleta de un visitante", puede: false, respuesta: "No puede", porque: "Solo equipos sin contacto." },
    { situacion: "Negar la entrada a quien el residente no autoriza", puede: true, respuesta: "Puede" },
    { situacion: "Retener el trasteo de un residente que debe la administración", puede: false, respuesta: "No puede" },
    { situacion: "Perseguir a un ladrón fuera del puesto", puede: false, respuesta: "No puede", porque: "Informa y protege el puesto." },
    { situacion: "Disparar al aire para asustar", puede: false, respuesta: "No puede" },
    { situacion: "Informar un delito a la central y a la Policía", puede: true, respuesta: "Puede y debe" },
    { situacion: "Entregar un paquete a un niño", puede: false, respuesta: "No puede" },
    { situacion: "Dar el número de apartamento de un residente a un desconocido", puede: false, respuesta: "No puede", porque: "Ley 1581 de 2012: el vigilante no da datos de los residentes." },
    { situacion: "Usar el bastón contra quien lo está golpeando", puede: true, respuesta: "Puede", porque: "Defensa proporcionada." },
    { situacion: "Usar su arma personal en el servicio", puede: false, respuesta: "No puede", porque: "Solo la de la empresa, con permiso." },
  ] satisfies Tarjeta[],
} as const;

// ───────────────────────────── 4.2 · Módulo 2 ─────────────────────────────

export const MODULO_2 = {
  nombre: "Polígono seguro",
  sub: "Manejo seguro del arma y tiro defensivo",
  resumen:
    "Revólver y escopeta de entrenamiento con todas sus piezas. Un guardián de seguridad vigila el cañón y el dedo en el gatillo todo el tiempo.",
  lugar: "Un polígono cubierto con 6 carriles de 25 m, cabina del instructor y semáforo.",
  armas: [
    { nombre: "Revólver .38", detalle: "De 6 tiros" },
    { nombre: "Escopeta de bomba", detalle: "Calibre 12" },
    { nombre: "Revólver azul de práctica", detalle: "No dispara: sirve para practicar en seco" },
  ],
  armasNota: "Armas de entrenamiento, genéricas y sin marca.",
  realismo:
    "El tambor bascula, los cartuchos se meten uno por uno o con el cargador rápido, la varilla expulsa los casquillos, el martillo se monta con el pulgar y la bomba de la escopeta corre. El gatillo distingue entre dedo apoyado y dedo apretando. El retroceso mueve el arma y el mando vibra, pero la cámara no se mueve: así no marea.",
  guardian: [
    { infraccion: "Cañón hacia una persona (el instructor, otro carril o el propio cuerpo)", consecuencia: "Vibración y «¡Cañón al frente!». La 2.ª vez, alto de línea. La 3.ª, sale de la línea y repite las 4 reglas", audio: "oscar-canon" },
    { infraccion: "Dedo en el gatillo sin estar en posición de tiro", consecuencia: "«¡Dedo fuera!», −5 en seguridad", audio: "oscar-dedo" },
    { infraccion: "Arma cargada fuera de la línea de fuego", consecuencia: "Alto de línea, −15", audio: "oscar-alto" },
    { infraccion: "Disparar con semáforo rojo o después de «¡Alto el fuego!»", consecuencia: "−25 y sale de la línea" },
    { infraccion: "Dejar el arma cargada en la mesa", consecuencia: "−10 y «¡Muestre vacío!»", audio: "oscar-vacio" },
    { infraccion: "Sin protección de oídos y ojos", consecuencia: "La línea no se abre" },
  ] satisfies { infraccion: string; consecuencia: string; audio?: AudioPersonajeId }[],
  lecciones: [
    { id: "P1", nombre: "Las cuatro reglas", aprende: "Las reglas de seguridad, repetidas en voz alta" },
    { id: "P2", nombre: "Recibir el arma", aprende: "Abrir, verificar vacío mirando y tocando, cañón a zona segura, firmar el libro" },
    { id: "P3", nombre: "Cargar y descargar", aprende: "Revólver (a mano y con cargador rápido) y escopeta; contar cartuchos; mostrar vacío. Primero guiado, luego contra reloj", jugable: true },
    { id: "P4", nombre: "Postura y empuñadura", aprende: "Postura isósceles. La app mide el ángulo de las muñecas, la separación de las manos y la altura" },
    { id: "P5", nombre: "Miras y respiración", aprende: "Alinear mira trasera, delantera y blanco" },
    { id: "P6", nombre: "Control del gatillo", aprende: "Fuego en seco con una moneda sobre el cañón: si el cañón se mueve más de 1° antes del «clic», la moneda cae" },
    { id: "P7", nombre: "Tiro de precisión", aprende: "Series a 3, 7, 10 y 15 m con tiempo, y una serie con escopeta", jugable: true },
    { id: "P8", nombre: "Tiro de reacción", aprende: "Blancos que aparecen" },
    { id: "P9", nombre: "Disparar / no disparar", aprende: "Decidir en milésimas si el blanco es una amenaza o no" },
    { id: "P10", nombre: "Cierre de línea", aprende: "Descargar, mostrar vacío, entregar el arma y los cartuchos sobrantes, firmar" },
  ],
  calificacion: [
    { nombre: "Seguridad", puntos: 30, nota: "Empieza en 100 y se descuenta", color: VERDE },
    { nombre: "Manejo", puntos: 20, color: AZUL },
    { nombre: "Precisión", puntos: 25, color: VIOLETA },
    { nombre: "Reacción y decisión", puntos: 25, color: AMBAR },
  ],
  lema: "La seguridad vale tanto como la puntería.",
  lemaNota: "No es un juego de disparos.",
  mide:
    "Agrupación, sesgo de los impactos, estabilidad, «jalón» del gatillo y anticipación del retroceso. Con eso el instructor le dice al alumno por qué falla, no solo que falla. Los impactos son en papel.",
} as const;

// ───────────────────────────── 4.3 · Módulo 3 ─────────────────────────────

export const MODULO_3 = {
  nombre: "¿Puede o no puede?",
  sub: "El uso de la fuerza desde la garita",
  idea:
    "El vigilante está para prevenir, reportar y proteger la vida. Casi siempre gana el escenario sin desenfundar. Ningún escenario premia disparar para proteger bienes.",
  acciones: [
    "Hablar (lo escucha la IA)",
    "Llamar por radio a la central",
    "Marcar el 123 en el celular de la garita",
    "Usar el citófono",
    "Abrir o cerrar la puerta y la talanquera",
    "Revisar y marcar las cámaras",
    "Escribir la minuta en la tableta ARS",
    "Cubrirse detrás del muro",
    "Usar la linterna y el bastón",
    "Solo si de verdad toca: desenfundar, empuñar, apuntar y disparar",
  ],
  accionesNota: "Cada uno de esos pasos queda registrado con su hora.",
  contextos: [
    {
      letra: "A",
      nombre: "Calle",
      lugar: "Garita de un comercio sobre una avenida",
      escenarios: [
        { id: "A1", nombre: "El celular", detalle: "Hurto en moto frente a la garita" },
        { id: "A2", nombre: "La persona en la entrada", detalle: "Habitante de calle" },
        { id: "A3", nombre: "¿Arma o celular?", detalle: "Ambigüedad" },
        { id: "A4", nombre: "La marcha", detalle: "Manifestación" },
      ],
    },
    {
      letra: "B",
      nombre: "Conjunto residencial",
      lugar: "Portería de torres",
      escenarios: [
        { id: "B1", nombre: "El exesposo", detalle: "Un embriagado quiere entrar donde su ex" },
        { id: "B2", nombre: "El falso técnico", detalle: "" },
        { id: "B3", nombre: "El atraco en la entrada", detalle: "Armado" },
        { id: "B4", nombre: "La pelea del parqueadero", detalle: "" },
      ],
    },
    {
      letra: "C",
      nombre: "Fábrica / bodega",
      lugar: "Garita industrial",
      escenarios: [
        { id: "C1", nombre: "La lonchera", detalle: "Hurto hormiga" },
        { id: "C2", nombre: "El exempleado", detalle: "Vuelve de noche" },
        { id: "C3", nombre: "La camioneta de la madrugada", detalle: "Robo de carga" },
        { id: "C4", nombre: "El paquete que gotea", detalle: "Sospechoso" },
      ],
    },
  ],
  niveles: [
    { n: 1, nombre: "Básico", cambia: "Detonante claro, un solo personaje, pistas del instructor («Piense: ¿esto es una agresión actual?»), más tiempo" },
    { n: 2, nombre: "Intermedio", cambia: "Dos personajes, ruido, una distracción (el citófono suena en el peor momento)" },
    { n: 3, nombre: "Avanzado", cambia: "Ambigüedad (¿arma o celular?), terceros en la línea de tiro, noche o lluvia, la central demora en responder" },
    { n: 4, nombre: "Experto", cambia: "Varias amenazas, información falsa por radio, un residente que exige «¡dispárele!», menos tiempo, y consecuencias que se arrastran al siguiente escenario" },
  ],
  rubrica: [
    { nombre: "Legalidad y necesidad", peso: 30, mira: "¿Usó la fuerza solo cuando era necesaria? Desenfundar sin necesidad o disparar fuera de la legítima defensa deja esta dimensión en 0 y reprueba el escenario", color: VIOLETA },
    { nombre: "Reporte", peso: 20, mira: "Radio a la central primero, 123 directo si hay riesgo para la vida, a tiempo y completo (qué pasa, dónde, cuántos, armas, características, hacia dónde huyeron, heridos) y minuta al final", color: AZUL },
    { nombre: "Proporcionalidad", peso: 15, mira: "¿Subió y bajó de nivel según la conducta del otro? (presencia → palabra → control físico → arma)", color: VERDE },
    { nombre: "Comunicación", peso: 15, mira: "Tono, claridad, órdenes claras en peligro, si logró calmar a la persona", color: AMBAR },
    { nombre: "Seguridad propia y de terceros", peso: 15, mira: "Se cubrió, no salió del puesto, no puso a nadie en la línea de fuego, no persiguió", color: "#5fd8ff" },
    { nombre: "Evidencia y escena", peso: 5, mira: "Marcó las cámaras, no movió nada, le entregó la información a la Policía", color: "#9eb0c0" },
  ],
  aprueba: "Aprueba con 80 o más y ninguna falta grave.",
  repaso: "Al terminar hay un repaso: la línea de tiempo de lo que hizo, lo que se esperaba y no hizo, y la explicación de Óscar.",
} as const;

/** Demo del escenario B1 «El exesposo»: lo que dice el vigilante cambia el ánimo de Edgar (§2.7). */
export type OpcionB1 = {
  vigilante: string;
  /** Lo que el vigilante hace, sin hablar (para la opción del silencio). */
  esAccion?: boolean;
  edgar: string;
  acotacion?: string;
  /** Cambio de ánimo: negativo = baja (se calma), positivo = sube (se altera). */
  delta: number;
  audioVigilante: AudioPersonajeId;
  audioEdgar: AudioPersonajeId;
  lectura: string;
};

export const DEMO_B1 = {
  titulo: "Pruébelo: B1 «El exesposo»",
  situacion:
    "Noche en la portería de un conjunto. Llega Edgar, embriagado, a la reja: quiere entrar donde su ex. La residente no autorizó el ingreso. ¿Qué le dice el vigilante?",
  /** Punto de partida ilustrativo del medidor; los cambios son los de la tabla de §2.7. */
  animoInicial: 55,
  notaMedidor: "El punto de partida del medidor es ilustrativo; cuánto sube o baja es lo que define el escenario.",
  opciones: [
    {
      vigilante:
        "«Buenas noches, don Edgar. Le entiendo, pero no le puedo abrir: la señora no autorizó. ¿Quiere un vaso de agua mientras llamo a alguien que lo recoja?»",
      edgar: "«…Usted es buena gente, hermano, pero es que ella…»",
      acotacion: "baja la voz",
      delta: -20,
      audioVigilante: "vigilante-b1-1",
      audioEdgar: "edgar-b1-1",
      lectura: "Firme y con respeto: niega el ingreso sin humillar y ofrece una salida. Edgar se calma.",
    },
    {
      vigilante: "«Váyase que está borracho.»",
      edgar: "«¿Borracho? ¡Borracho su papá! ¡Ábrame!»",
      acotacion: "golpea la reja",
      delta: 25,
      audioVigilante: "vigilante-b1-2",
      audioEdgar: "edgar-b1-2",
      lectura: "Humillar enciende a la persona. La firmeza no necesita ofender.",
    },
    {
      vigilante: "«Ya llamé a la policía, se va a ir preso.»",
      edgar: "Se altera e intenta trepar la reja.",
      acotacion: "la llamada usada como amenaza",
      delta: 30,
      audioVigilante: "vigilante-b1-3",
      audioEdgar: "edgar-b1-3",
      lectura: "Reportar es un deber; usarlo como amenaza escala la situación.",
    },
    {
      vigilante: "(Silencio, mirando el celular)",
      esAccion: true,
      edgar: "«¿Me está ignorando? ¡Hey!»",
      delta: 10,
      audioVigilante: "vigilante-b1-4",
      audioEdgar: "edgar-b1-4",
      lectura: "Ignorar también comunica: Edgar se siente despreciado y sube el tono.",
    },
  ] satisfies OpcionB1[],
} as const;

// ───────────────────────────── 4.4 · Módulo 4 ─────────────────────────────

export const MODULO_4 = {
  nombre: "Un turno en la portería",
  sub: "El simulador del día del vigilante",
  resumen:
    "Un turno de 12 horas comprimido en pocos minutos: residentes, domicilios, paquetes, técnicos falsos, emergencias y la minuta. Cada persona tiene su nombre, su acento y su genio.",
  puestos: ["Conjunto residencial de 4 torres", "Edificio de oficinas", "Bodega de alimentos"],
  puestosNota: "Tres puestos, todos ficticios.",
  franjas: [
    { hora: "05:45", nombre: "Relevo", pasa: "El vigilante de la noche le entrega el puesto con sus novedades" },
    { hora: "06:00–08:30", nombre: "Salida", pasa: "Salida al trabajo y al colegio, rutas, domicilios, un niño que quiere salir solo" },
    { hora: "08:30–12:00", nombre: "Mañana", pasa: "Paquetes, técnicos (uno falso desde el nivel 2), una obra, un adulto mayor, ronda 1" },
    { hora: "12:00–14:00", nombre: "Almuerzo", pasa: "Pico de domicilios del almuerzo" },
    { hora: "14:00–17:00", nombre: "Tarde", pasa: "Visitas, mudanza, el vecino bravo, un abogado que pide datos, la novia sorpresa, ronda 2" },
    { hora: "17:00–18:00", nombre: "Cierre", pasa: "Entrega de paquetes; el supervisor pasa revista y firma la minuta; entrega de turno" },
  ],
  cola:
    "La gente llega en cola, con un catálogo de 36 casos que se combinan: residentes, visitas, domicilios, mensajería y paquetes, servicios, obras y mudanzas, emergencias (un adulto mayor que se cae, un niño perdido, olor a gas, incendio en el cuarto de basuras) y seguridad (un merodeador, alguien que filma la portería). Hay hilos narrativos que atraviesan el turno, como el de doña Gloria, la residente de 72 años.",
  calificacion: [
    { nombre: "Control de acceso", puntos: 30, color: VIOLETA },
    { nombre: "Servicio y trato", puntos: 25, color: AZUL },
    { nombre: "Minuta", puntos: 20, color: VERDE },
    { nombre: "Paquetería", puntos: 10, color: AMBAR },
    { nombre: "Tiempos de atención", puntos: 10, color: "#5fd8ff" },
    { nombre: "Rondas", puntos: 5, color: "#9eb0c0" },
  ],
} as const;

// ───────────────────────────── 5 · Personajes ─────────────────────────────

export type Personaje = {
  nombre: string;
  rol: string;
  frase?: string;
  audio?: AudioPersonajeId;
  fijo: boolean;
};

export const PERSONAJES = {
  titulo: "Los personajes y la conversación con IA",
  intro:
    "Así está diseñada la conversación: el vigilante le habla en voz alta a la persona que tiene enfrente y esta le responde con voz, boca sincronizada y gestos. Su ánimo sube o baja según cómo la traten.",
  frase: "Se habla de verdad: la persona responde según cómo la trate.",
  elenco: [
    { nombre: "Óscar Bermúdez", rol: "Instructor jefe. Bogotano, suboficial retirado", audio: "oscar-bienvenida", fijo: true },
    { nombre: "Yamile Cárdenas", rol: "Instructora de servicio y control de acceso. Paisa", audio: "yamile-guion", fijo: true },
    { nombre: "Wilmer Mosquera y Zeus", rol: "Guía canino y su perro", fijo: true },
    { nombre: "Diana", rol: "La central, por radio", audio: "diana-radio", fijo: true },
    { nombre: "Operador de la línea 123", rol: "Atiende cuando el vigilante marca desde la garita", fijo: true },
    { nombre: "Ramiro", rol: "El supervisor que llega en moto", audio: "ramiro", fijo: true },
    { nombre: "Doña Gloria", rol: "Residente de 72 años, con su propio hilo en el turno", frase: "«Mijito, qué pena con usted»", audio: "gloria", fijo: false },
    { nombre: "Dr. Zuluaga", rol: "Residente que exige", frase: "«¿Usted no sabe quién soy yo?»", audio: "zuluaga", fijo: false },
    { nombre: "Kevin", rol: "Domiciliario barranquillero", audio: "kevin", fijo: false },
    { nombre: "«Jhon Fredy»", rol: "El falso técnico", fijo: false },
    { nombre: "Samuel", rol: "Niño perdido de 7 años", fijo: false },
    { nombre: "Edgar", rol: "El exesposo embriagado del escenario B1", fijo: false },
  ] satisfies Personaje[],
  rotativo:
    "Elenco rotativo: unas 30 personas con nombre, edad, forma de hablar regional, objetivo y secreto. Habla colombiana real, con acentos de Bogotá, Medellín, Cali, Barranquilla, Pasto, Boyacá, Santander, el Pacífico y Venezuela (residentes venezolanos).",
  guionDeOro: {
    titulo: "El «guion de oro»",
    quien: "Lo que enseña Yamile",
    pasos: ["Saludar bien", "Pedir el documento con cortesía", "Explicar por qué se espera", "Negar el ingreso sin humillar"],
    dimensiones: ["Cortesía", "Firmeza", "Claridad", "Empatía", "Procedimiento"],
    dimensionesNota: "La IA califica cinco dimensiones del trato.",
  },
  sesgo: {
    titulo: "Control de sesgo",
    texto:
      "Hay «gemelos de sesgo»: casos iguales con personas de distinto origen o aspecto. Por ejemplo, Yorman es un residente venezolano legítimo y María José, una domiciliaria venezolana bajo la lluvia. Si el vigilante trata distinto a dos personas en la misma situación, queda un informe aparte para revisión humana.",
    aclaracion: "No es un castigo automático: lo revisa una persona.",
  },
  motores: {
    titulo: "Tres motores de conversación, con el mismo contrato",
    lista: [
      "Un agente de voz en tiempo real, con la llave guardada en el servidor y nunca en la gafa",
      "Una tubería en el servidor de ARS",
      "Un motor local sin internet, para la feria y la demo",
    ],
    estado: "Diseñada: falta la prueba de concepto en la gafa. Las voces de esta página son de muestra.",
  },
} as const;

// ───────────────────────────── 6 · Escenarios operativos y modos ─────────────────────────────

export const OPERATIVOS = {
  titulo: "Escenarios operativos: la otra mitad de la capacitación",
  intro:
    "Además de la Academia, las salas «de negocio» de la Sala VR (la Central y la sede del cliente) se pueden convertir en entrenamiento del día a día con la plataforma. Es una propuesta enviada al servidor.",
  escenarios: [
    { id: "E1", nombre: "Atender una alerta de intrusión detectada por IA de video", rol: "Operador de central", estado: "Casi listo", nota: "Ya existe el ciclo de alerta; falta el modo evaluación" },
    { id: "E2", nombre: "Botón de pánico de un guarda: tomar, verificar, radio, minuta, cerrar", rol: "Operador / supervisor", estado: "Propuesta" },
    { id: "E3", nombre: "Control de acceso: visitante sin cita, documento que no coincide, vehículo no autorizado", rol: "Guarda", estado: "Propuesta" },
    { id: "E4", nombre: "Conato de incendio: alarma, aviso a la central, extintor correcto (técnica PASS), evacuación", rol: "Guarda", estado: "Propuesta" },
    { id: "E5", nombre: "Ronda con puntos de control y 3 anomalías escondidas", rol: "Guarda / supervisor", estado: "Propuesta" },
    { id: "E6", nombre: "Entrega de turno: novedades, minuta y equipo", rol: "Guarda", estado: "Propuesta" },
  ],
  rubricaE1: [
    { nombre: "Tomar la alerta", puntos: 15, nota: "Plenos si es en 15 s o menos" },
    { nombre: "Verificar en video antes de actuar", puntos: 20 },
    { nombre: "Ubicar en el mapa", puntos: 10 },
    { nombre: "Comunicar por radio en el canal correcto", puntos: 20 },
    { nombre: "Minuta con el tipo y la prioridad correctos", puntos: 15 },
    { nombre: "Cerrar con resultado", puntos: 10 },
    { nombre: "Tiempo total", puntos: 10, nota: "Pleno si es en 90 s o menos" },
  ],
  faltasE1: [
    "Cerrar sin verificar",
    "No tomarla en 120 s",
    "Cerrar como «falsa alarma» una intrusión real",
    "Abandonar la sala con la alerta abierta",
  ],
  modos: [
    { nombre: "Práctica", para: "Aprender, con las ayudas del instructor y la guía", cuenta: "No", envia: "Sí, se registra" },
    { nombre: "Evaluación", para: "Sin ayudas, sin cierre automático, con rúbrica", cuenta: "Sí, suma al cumplimiento", envia: "Sí" },
    { nombre: "Demo / feria", para: "Mostrar", cuenta: "No", envia: "Nunca: todo queda en memoria y se borra con el siguiente visitante" },
  ],
} as const;

// ───────────────────────────── 7 · Cómo viaja a la plataforma ─────────────────────────────

export const PLATAFORMA = {
  titulo: "Cómo viaja la capacitación a la plataforma ARS",
  aviso:
    "Este es el diseño. El módulo del servidor que recibe los intentos (/vr/*) todavía no existe: hoy, en la demo, el progreso solo queda en las gafas.",
  pasos: [
    { n: 1, titulo: "Asignación", lugar: "Web del ARS", texto: "El coordinador asigna el curso o el escenario por persona, cargo, sede, cliente o grupo, con fecha límite, intentos máximos y nivel mínimo. Cada curso llega solo a quien lo necesita." },
    { n: 2, titulo: "Entra a la gafa", lugar: "Gafa compartida", texto: "Con el código de 6 letras que ve en la web del ARS en su celular, o lo elige el instructor de la lista del grupo. Nadie teclea en VR; sirve para grupos de 20 guardas." },
    { n: 3, titulo: "Practica y registra", lugar: "Academia o Central", texto: "La gafa registra eventos de alto nivel con su hora («llamó a la central», «desenfundó», «escribió la minuta») y muestra una nota provisional con el repaso." },
    { n: 4, titulo: "Envío con o sin señal", lugar: "Cola cifrada", texto: "El intento se guarda en una cola cifrada en la gafa y se envía cuando hay internet, sin duplicar nada." },
    { n: 5, titulo: "Nota oficial", lugar: "Servidor ARS", texto: "El servidor recalcula la nota con la rúbrica de la versión con que se hizo el intento. Si no coincide con la provisional, manda la del servidor." },
    { n: 6, titulo: "Hoja de vida y certificado", lugar: "ARS", texto: "Avance, notas, repaso paso a paso y radar de fortalezas. Al aprobar los cuatro módulos, acta digital de práctica en simulación con QR verificable, firmada por el instructor." },
    { n: 7, titulo: "Mesa directiva", lugar: "Indicadores", texto: "% de personal entrenado, nota media por escenario, vencimientos del reentrenamiento y los tres errores más comunes por puesto." },
  ],
  errores: ["«No reportan a la central»", "«Dejan entrar técnicos sin orden»", "«Dedo en el gatillo»"],
  privacidad: [
    "El vigilante ve solo lo suyo; el coordinador, su organización.",
    "Por defecto no sale de la gafa: ni el audio del micrófono, ni el video de la cámara, ni el mapa de la habitación, ni el seguimiento fino de la mirada o las manos. Solo los eventos de alto nivel.",
    "La transcripción va aparte, con consentimiento en pantalla y retención corta (Ley 1581). En la feria no se graba nada.",
    "Lo creado durante un entrenamiento no ensucia la operación real: queda marcado como entrenamiento.",
    "La gafa nunca lleva llaves de servicios: solo el token del usuario.",
  ],
  qr: "Los certificados del ARS ya llevan un código QR verificable: cualquiera lo puede comprobar en la página pública de verificación.",
} as const;

// ───────────────────────────── 8 · Base legal ─────────────────────────────

export const LEGAL = {
  titulo: "La base legal y lo que la Academia no enseña",
  enfoque: "Diseñada sobre el Decreto 356 de 1994 y la Resolución 4973 de 2011, con enfoque defensivo.",
  normas: [
    { norma: "Decreto Ley 356 de 1994", nombre: "Estatuto de Vigilancia y Seguridad Privada", uso: "Finalidad del servicio (prevenir sin afectar derechos), deberes del vigilante, credencial, armas de la empresa, uniforme. Prohíbe enseñar tácticas militares u ofensivas." },
    { norma: "Resolución 4973 de 2011", nombre: "Capacitación", uso: "Ciclos, horas mínimas, especializaciones, tiro defensivo (precisión y reacción), notas mínimas y acta firmada de las prácticas." },
    { norma: "Decreto Ley 2535 de 1993", nombre: "Armas", uso: "Tenencia y porte." },
    { norma: "Código Penal, art. 32 num. 6", nombre: "Legítima defensa", uso: "La regla con la que se califica el disparo." },
    { norma: "Uso diferenciado de la fuerza", nombre: "", uso: "La escalera presencia → palabra → control → arma." },
    { norma: "Ley 1581 de 2012", nombre: "Habeas data", uso: "Por qué el vigilante no da datos de los residentes, y cómo se tratan los datos del propio alumno." },
  ],
  noEnsena: [
    "Tácticas ofensivas o de asalto",
    "Desarme ni modificación de armas",
    "Persecuciones",
    "Retenciones ni requisas corporales",
  ],
  sinSangre: "Nada de sangre: los impactos son en papel, la persona que cae no sangra y la escena funde a negro.",
  complementa:
    "La Academia complementa las horas presenciales que exige la norma; no las reemplaza. El acta de la práctica la firma un instructor humano en el ARS, no la app. Los textos legales los revisa un abogado de la empresa antes de mostrarse.",
} as const;

// ───────────────────────────── 9 · Estado real ─────────────────────────────

export const ESTADO = {
  titulo: "Lo que ya existe y lo que falta",
  intro: "Preferimos decirlo claro.",
  hecho: [
    "El diseño completo de la Academia: normativa, 4 módulos, personajes, IA, calificación y producción",
    "El núcleo: motor de escenarios, calificación en 6 dimensiones, repaso, modelo de ánimo y cola de intentos sin duplicados, con pruebas automáticas en verde",
    "El contenido: 12 escenarios (96 rutas probadas), 49 casos del turno, 60 fichas de personajes y 355 frases de vigilante",
    "El polígono: revólver y escopeta con todas sus piezas, guardián de seguridad, blancos y estadísticas de tiro",
    "El portal en el vestíbulo y el patio de la Academia",
    "El recorrido de feria (≈ 4 min): bienvenida, tablero, mapa de reglas, aula, polígono, resultado y certificado con QR",
  ],
  falta: [
    "La garita (Módulo 3) y la portería (Módulo 4) como escenas jugables: el contenido ya está",
    "Las lecciones del polígono distintas de P3 y la serie 2 de P7: están diseñadas",
    "La conversación con IA en tiempo real: falta la prueba de concepto en la gafa",
    "La conexión con el servidor del ARS (/vr/*): no existe todavía; la propuesta está enviada",
    "La prueba con la gafa puesta (rendimiento, voces, comodidad) y los modelos 3D definitivos de los personajes",
  ],
  hoy: "Hoy se puede vivir en la feria el recorrido de demostración: el portal, el polígono y el certificado.",
} as const;

export const CIERRE = {
  titulo: "¿Cómo se capacita hoy su gente?",
  texto:
    "Haga el autodiagnóstico de su empresa de seguridad y le mostramos dónde encaja la Academia ARS, o escríbanos para verla en una demostración con las gafas.",
  diagnostico: "Hacer el autodiagnóstico",
  contacto: "Pedir una demostración",
} as const;
