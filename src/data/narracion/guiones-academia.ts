/**
 * Guiones de narración de Ars para /academia (id → texto). Ver src/lib/narracion/contrato.ts.
 * Fuente: docs/research/SALA-VR-ARS-CAPACITACION-PARA-WEB.md (respeta §5.5: la conexión con el
 * servidor aún no existe, la Academia complementa las horas presenciales y la IA en tiempo real
 * está en diseño). Audio en public/audio/narracion/<id>.mp3.
 */
export const GUIONES_ACADEMIA: Record<string, string> = {
  "academia/hero":
    "Bienvenido a la Academia ARS. Soy Ars, y le cuento cómo se forma aquí a la gente que cuida. El vigilante se pone las gafas de realidad virtual, entra a la escuela de su empresa y aprende haciendo: atender a la gente, revisar su dotación, manejar el arma con seguridad, decidir sobre el uso de la fuerza y vivir un turno completo. Y cada certificado se puede comprobar.",
  "academia/por-que":
    "¿Por qué en realidad virtual? Porque hay cosas que no se pueden practicar en la calle sin riesgo: un atraco en la entrada, un visitante agresivo en la reja, la decisión de desenfundar o no. Aquí se practican cien veces, sin peligro, con un instructor que explica el porqué. Eso sí: la Academia complementa las horas presenciales que exige la norma; no las reemplaza.",
  "academia/curso":
    "El curso se llama Academia ARS, Vigilante, y tiene cuatro módulos. Primero, la inducción y la dotación. Después, el polígono y el uso de la fuerza, en el orden que se quiera. Y al final, un turno en la portería. Sigue los ciclos de la Resolución 4973: fundamentación, reentrenamiento y especialización, con notas mínimas que cada empresa puede ajustar.",
  "academia/modulo-1":
    "Módulo uno: su puesto, su dotación. Con el instructor Óscar, el vigilante se pone cada elemento en su lugar: uniforme, credencial, radio, linterna, libreta y el celular con los números de la central. Luego responde rápido qué puede y qué no puede hacer en el puesto, como retener una cédula o perseguir a un ladrón. Termina pasando revista y recibiendo el puesto en un relevo calificado.",
  "academia/modulo-2":
    "Módulo dos: el polígono. Revólver y escopeta de entrenamiento, con todas sus piezas: el tambor bascula, los cartuchos entran uno por uno y el gatillo distingue el dedo apoyado del dedo que aprieta. Un guardián de seguridad vigila el cañón y el dedo todo el tiempo. Aquí la seguridad vale tanto como la puntería: esto no es un juego de disparos.",
  "academia/modulo-3":
    "Módulo tres: ¿puede o no puede? Doce situaciones desde la garita, en la calle, en un conjunto y en una fábrica, con cuatro niveles de dificultad. El vigilante habla, llama a la central, marca el ciento veintitrés y escribe la minuta. Gana el que previene, reporta y protege la vida, casi siempre sin desenfundar. Ningún escenario premia disparar para proteger bienes.",
  "academia/modulo-4":
    "Módulo cuatro: un turno en la portería. Doce horas en pocos minutos: el relevo, residentes, domicilios, paquetes, un técnico que no es técnico, una emergencia y la minuta. La gente llega en cola, y se califica el control de acceso, el trato, los tiempos y la minuta. Al final de la tarde, el supervisor pasa revista y firma.",
  "academia/personajes":
    "Y aquí se habla de verdad. El vigilante le habla en voz alta a la persona que tiene enfrente, y esa persona cambia de ánimo según el trato. Doña Gloria, el doctor Zuluaga, Kevin el domiciliario, Edgar en la reja: cada uno con su nombre, su acento y su genio. Escúchelos. La conversación con inteligencia artificial en tiempo real está en diseño; estas voces le muestran cómo va a sonar.",
  "academia/plataforma":
    "Todo esto encaja con la plataforma ARS. El coordinador asigna el curso desde la web, por cargo, sede o cliente, con fecha límite, y le llega solo a quien lo necesita. La Academia está diseñada para que cada intento viaje al ARS y quede en la hoja de vida de capacitación, con sus notas y el repaso paso a paso. Esa conexión con el servidor todavía se está construyendo.",
  "academia/legal":
    "La base es la normativa colombiana: el Decreto 356 de 1994 y la Resolución 4973 de 2011, con un enfoque defensivo. No se enseñan tácticas ofensivas, persecuciones ni requisas, y no hay sangre. Es práctica complementaria: el acta la revisa y la firma un instructor humano, y cada certificado lleva un código QR que cualquiera puede comprobar.",
  "academia/cierre":
    "Hasta aquí la Academia. Hoy ya se puede vivir el recorrido de demostración: el portal, el polígono y el certificado con código QR. Si quiere ver cómo se formaría su propio personal, hable con un asesor y le preparamos una demostración a su medida. Yo sigo aquí para lo que necesite.",
};
