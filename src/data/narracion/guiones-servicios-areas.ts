/**
 * Guiones de narración de Ars (id → texto). Ver src/lib/narracion/contrato.ts.
 *
 * /servicios/[area]: una intro por área (`idIntroArea`) y un capítulo por módulo
 * (`idModulo`), con los ids reales de src/data/servicios/catalogo.ts.
 * Audio en public/audio/narracion/servicios/<areaId>/<intro|moduloId>.mp3.
 * Escritos para el oído: frases cortas, «Ars» como palabra, sin Markdown.
 */
import { idIntroArea, idModulo } from "@/lib/narracion/contrato";

const A = "operacion-en-campo";
const B = "centro-de-operaciones";
const C = "comunicacion-y-emergencias";
const D = "monitoreo-inteligente";
const E = "realidad-virtual";
const F = "gestion-humana";
const G = "formacion";
const H = "finanzas-y-erp";
const I = "productividad-e-ia";
const J = "gobierno-y-seguridad";

export const GUIONES_SERVICIOS_AREAS: Record<string, string> = {
  // ─── A · Operación en campo ───
  [idIntroArea(A)]:
    "Soy Ars, y empiezo por donde empieza todo: el puesto. Aquí el trabajo de campo deja de ser un cuaderno y una llamada. Su vigilante marca, hace sus rondas y reporta desde el celular, aun sin señal, y cada registro llega con foto, firma, ubicación y hora.",
  [idModulo(A, "turnos-y-programacion")]:
    "Programar el mes de cientos de puestos ya no le toma días. Armo la programación con domingos, festivos y el pliego de cada cliente, y le muestro en todo momento quién estaba de verdad en el puesto y quién debía estar.",
  [idModulo(A, "control-de-asistencia-y-relevos")]:
    "Cada turno empieza con una selfie y la ubicación del vigilante. En el relevo comparo el rostro de quien entrega con su foto registrada, y la Central ve en tiempo real quién está en cada puesto. Si alguien se fue sin cerrar, el relevo forzado deja constancia.",
  [idModulo(A, "rondas-qr")]:
    "En cada ronda, su vigilante escanea los puntos de control con el celular y deja la evidencia que el punto pida: una foto, una firma o un documento. Si en el sótano no hay señal, todo se guarda en el teléfono y se envía al volver la conexión.",
  [idModulo(A, "reportes-operativos-y-supervision")]:
    "La revista de supervisión, la minuta, las actas y el pre-operacional del vehículo se llenan paso a paso desde el celular. Cada registro queda con quién, cuándo y dónde, y se convierte en tableros y PDF listos para el cliente.",
  [idModulo(A, "visitantes-y-bicicletas")]:
    "En la portería, quien ya vino no vuelve a dictar sus datos. Se le busca por nombre o cédula, se toma la foto del día y entra. Las bicicletas se validan escaneando su sticker QR.",
  [idModulo(A, "recursos-operativos")]:
    "Armas por serial, vehículos por placa y caninos, en un solo inventario. Y no se actualiza a mano: cuando el supervisor cuenta los cartuchos en la revista, el inventario se llena solo y le avisa si algo no coincide.",

  // ─── B · Centro de operaciones ───
  [idIntroArea(B)]:
    "En la Central, el operador, el coordinador y la dirección miran el mismo mapa vivo. Quién está en turno, qué sede quedó sin cubrir y qué supervisor salió de su zona. Todo, sin abrir una sola hoja de Excel.",
  [idModulo(B, "sala-de-control")]:
    "En la Sala de Control usted ve cada sede y cada persona sobre el mapa: qué está cubierto, qué quedó sin cubrir y quién entra en menos de dos horas. Desde la misma pantalla habla por radio, chatea o atiende un pánico, sin cambiar de herramienta.",
  [idModulo(B, "zonas-y-salida-de-zona")]:
    "Si un supervisor sale de su zona, le aviso a la Central y al coordinador con la dirección aproximada y el recorrido listo para reproducir. Así se decide con evidencia y no por teléfono, y la salida queda documentada como un caso.",
  [idModulo(B, "sala-del-coordinador")]:
    "Son las seis de la mañana y un puesto quedó sin supervisor. En la sala del coordinador eso aparece primero, y decidir quién cubre toma un solo clic, con opción de deshacer.",
  [idModulo(B, "recorridos-y-tiempo-en-el-puesto")]:
    "Reconstruyo la jornada de cada supervisor sobre el mapa, parada por parada: qué sedes visitó, dónde se detuvo y qué quedó pendiente. Y para los vigilantes, mido cuánto tiempo pasaron de verdad dentro de su puesto.",
  [idModulo(B, "cumplimiento-supervisores-y-vigilantes")]:
    "¿Cuántas revistas le tocaban a cada supervisor y cuántas hizo? Aquí lo ve sin armar un Excel, con lo más urgente primero. Y cada porcentaje se abre en la jornada real de esa persona, con su evidencia.",
  [idModulo(B, "alias-de-clientes-y-sedes")]:
    "Su equipo no dice el nombre legal del cliente; dice la torre norte o la bodega del puerto. Ese nombre corto aparece en el mapa, la radio y las revistas, mientras los informes conservan el nombre oficial.",

  // ─── C · Comunicación y emergencias ───
  [idIntroArea(C)]:
    "Muchas operaciones se comunican por radio y por grupos de WhatsApp, y casi nada queda registrado. Yo le propongo un canal propio: se sabe quién habló, a quién y desde dónde, cada transmisión queda grabada y cada emergencia deja su bitácora.",
  [idModulo(C, "radio-ptt")]:
    "Su celular se convierte en un radio. Con un botón grande de hablar, el vigilante llama a una persona, a una sede o a un grupo, y si varios hablan a la vez, se escucha primero al coordinador. Lo que nadie alcanzó a oír queda grabado para después.",
  [idModulo(C, "chat-corporativo")]:
    "Mensajes, fotos, notas de voz y archivos, dentro de la plataforma y no en el celular personal de nadie. Los grupos del puesto, la sede y el cliente se arman solos, y cuando alguien cambia de turno, entra y sale de ellos sin que nadie lo haga a mano.",
  [idModulo(C, "conversacion-con-la-central")]:
    "Cualquier vigilante llega a la Central con un toque, sin buscar un número. Y las llamadas entran a pantalla completa aunque la aplicación esté cerrada.",
  [idModulo(C, "consola-de-radio")]:
    "Cada transmisión de radio queda en una bitácora de voz: quién habló, a quién, desde dónde y quién la escuchó después. Si mañana hay que aclarar una orden, usted abre la grabación y la escucha con todo su contexto.",
  [idModulo(C, "reporte-por-sede")]:
    "El pase de lista por radio se vuelve un registro con evidencia. La Central le pide a un grupo de puestos un audio, una foto o un texto con plazo, y en una sola pantalla ve quién respondió y quién falta.",
  [idModulo(C, "boton-de-panico")]:
    "El vigilante mantiene presionado el botón un segundo y la Central recibe la alerta al instante, con sonido y ubicación. El operador atiende en el orden que la emergencia pida, mientras la bitácora se escribe sola hasta el informe de cierre.",
  [idModulo(C, "notificaciones-y-telegram")]:
    "Nadie se entera tarde. La campana separa lo urgente de lo que llegó por chat, las alertas importantes suenan aunque la aplicación esté cerrada, y cada una tiene su propio tono, para que una salida de zona no se confunda con un mensaje.",

  // ─── D · Monitoreo inteligente ───
  [idIntroArea(D)]:
    "Las cámaras que su cliente ya tiene graban todo, pero casi nadie las está mirando. Yo las convierto en alertas con foto, video y ubicación. Y hay una regla que no cambia: la inteligencia artificial prioriza, pero la última palabra la tiene siempre una persona.",
  [idModulo(D, "vision-artificial")]:
    "Sobre los grabadores que ya existen, configuro analíticas por cámara: intrusión, cruce de línea, merodeo u objetos olvidados, con su horario y sus zonas. Si algo pasa a las tres de la mañana, el operador recibe primero la evidencia y decide si confirma, descarta o escala.",
  [idModulo(D, "acceso-inteligente")]:
    "Un directorio de rostros con listas de personas permitidas y restringidas. Cuando una cámara ve a alguien de una lista, o a un desconocido, genero una alerta para que un operador la verifique. Nunca identifico a nadie de forma automática, y cada consentimiento queda registrado.",
  [idModulo(D, "puertas-reconocimiento-facial")]:
    "Una puerta con cámara que abre al reconocer a una persona autorizada y hace sonar la sirena ante alguien de la lista restringida. A la plataforma solo viaja el nombre, ni cédulas ni fotos, y si se cae la conexión, la puerta sigue funcionando sola.",
  [idModulo(D, "iot-y-domotica")]:
    "Cámaras, alarmas, controles de acceso, luces y redes de todas sus sedes, en un solo panel. Un agente en la sede descubre los equipos de la red, y un modo prueba le permite preparar todo antes de tocar un solo equipo real.",
  [idModulo(D, "levantamiento-2d-3d-de-sedes")]:
    "Cada sede con su plano por piso y sus cámaras ubicadas. Calculo qué parte del piso está cubierta, le muestro las zonas y los accesos sin cámara, y su cliente ve la última versión en Mis sedes.",
  [idModulo(D, "escaneo-3d-de-sedes")]:
    "Suba las fotos, el video o las tomas de dron de un recorrido por la sede, y obtenga su modelo 3D, la planta y las medidas. El procesamiento corre en los servidores de la empresa y retira a las personas que aparecían en el recorrido.",

  // ─── E · Realidad virtual ───
  [idIntroArea(E)]:
    "Hay cosas que se entienden mejor recorriéndolas que leyéndolas. En realidad virtual, la central rodea al operador con sus tableros, el edificio se abre por pisos y los indicadores de la empresa se discuten en una mesa con directores simulados por inteligencia artificial.",
  [idModulo(E, "sala-vr-central-viva")]:
    "Póngase en el puesto del operador: los eventos al frente, el mapa a la izquierda, la radio a la derecha y el muro de cámaras arriba. No es una maqueta; es la misma radio y los mismos datos de Ars, vistos en trescientos sesenta grados.",
  [idModulo(E, "sede-inteligente")]:
    "Una sede de ejemplo, con datos simulados, de tres pisos con puertas, sensores y cámaras. Simulo seis eventos con y sin respuesta automática, para que su cliente compare el daño y el costo antes de invertir.",
  [idModulo(E, "mesa-directiva-con-ia")]:
    "Los indicadores de ventas, nómina, operaciones y contabilidad, sobre una mesa redonda en 3D. Pida que opine la junta, y nueve directores simulados por inteligencia artificial debaten y entregan un acta cuyo plan de acción llega a sus tareas.",
  [idModulo(E, "vigia-asistente-de-voz")]:
    "Vigía es la voz de la Sala VR. Usted le dice llévame a la sede, o abre las cámaras, y lo lleva sin pulsar nada. Se deja interrumpir, y todo lo que se dijo queda escrito en el chat de la sala.",
  [idModulo(E, "sala-vr-nativa-meta-quest")]:
    "Hoy la Sala VR corre en el navegador, también en el de las gafas. Está planeada una aplicación nativa para Meta Quest, ajustada a cada modelo y con realidad mixta donde el equipo lo permita.",

  // ─── F · Gestión humana ───
  [idIntroArea(F)]:
    "En una empresa de seguridad, la gente es la operación. Aquí acompaño todo el camino: del aviso de empleo al contrato, la nómina y el expediente. La nómina sale de los turnos que de verdad se trabajaron, y los documentos se ordenan con inteligencia artificial en servidores propios.",
  [idModulo(F, "seleccion-y-contratacion")]:
    "El candidato se postula desde el celular, sin crear cuenta, sube sus documentos y presenta las pruebas en línea. Su equipo lo lleva por psicología, seguridad, exámenes médicos y contratación en un tablero que se arrastra.",
  [idModulo(F, "colaboradores-y-mis-datos")]:
    "Cada colaborador completa su propia hoja de vida desde el celular: seguridad social, curso de vigilancia, tallas de dotación y documentos. Gestión humana ve de un vistazo quién está completo y quién no.",
  [idModulo(F, "empleados-prestamos-y-contratos")]:
    "La ficha de cada persona con toda su historia laboral: contratos, préstamos con su tabla de cuotas y novedades, sincronizada con otro sistema si su empresa lo tiene. Y cada consulta de datos personales queda registrada: quién, cuándo y de quién.",
  [idModulo(F, "nomina")]:
    "La nómina sale de la programación y de las marcas reales, con recargos nocturnos, dominicales y festivos. Si ya liquida en otro sistema, la información se centraliza aquí o fluye entre los dos. Antes de liquidar, una vista previa lo valida todo, y cada corrida deja sus desprendibles congelados.",
  [idModulo(F, "nomina-de-administrativos-y-ajuste")]:
    "No todos trabajan por turnos. El personal administrativo se liquida en la misma plataforma, y si un periodo cerrado quedó mal, la nómina de ajuste paga o descuenta solo la diferencia y deja escrita la causa.",
  [idModulo(F, "prima-vacaciones-y-liquidacion")]:
    "La prima, las vacaciones y la liquidación de quienes se retiran se calculan como nóminas propias. Y si también liquida en otro sistema, se comparan línea a línea antes de pagar, no después.",
  [idModulo(F, "costos-y-comparacion-con-el-erp")]:
    "¿Cuánto le cuesta de verdad cada cliente, cada centro de costo y cada puesto? Aquí lo ve, y si tiene otro sistema de nómina, con su devengado al lado: las diferencias aparecen persona por persona antes de cerrar el mes.",
  [idModulo(F, "area-documental-inicio")]:
    "Al empezar el día, el equipo documental ve qué parte del personal tiene sus documentos completos y vigentes, por contrato y por sede. Y de cada cifra llega a la persona exacta con un clic.",
  [idModulo(F, "cargue-inteligente-de-documentos")]:
    "Arrastre una carpeta o un PDF de cientos de hojas, y la inteligencia artificial separa cada documento, identifica de quién es y de qué tipo. Usted solo confirma, y las cédulas y hojas de vida no salen de los servidores de la empresa.",
  [idModulo(F, "expedientes-y-descargas-masivas")]:
    "Su cliente pide los expedientes de quinientas personas para mañana. Pegue la lista de cédulas y descargue un archivo ordenado como él lo pida, con un informe de quién está completo y qué falta.",
  [idModulo(F, "auditoria-de-gestion-humana")]:
    "Persona por persona, le digo qué documento falta o está vencido y si su contrato coincide con el de la nómina. Con un botón, la inteligencia artificial redacta la novedad y crea la tarea para el equipo.",
  [idModulo(F, "arbol-documental-3d")]:
    "Defina qué documentos exige cada cargo y cuándo vence cada uno. El árbol documental en 3D le muestra qué tan bien está clasificando la inteligencia artificial, y le deja simular un cambio antes de aplicarlo.",
  [idModulo(F, "reporte-y-analitica-documental")]:
    "El tablero del dueño del archivo: gráficas y un informe en lenguaje claro con hallazgos, riesgos y recomendaciones. Puede hacerle preguntas al reporte, y hasta medir cuántas veces se aceptó lo que propuso la inteligencia artificial.",
  [idModulo(F, "portal-documental-para-el-cliente")]:
    "Su cliente entra con su propio usuario y consulta los documentos del personal que le presta servicio, sin llamar a nadie. Si algo le falta, lo pide por la plataforma con plazo, y cada consulta queda registrada.",
  [idModulo(F, "juridica-no-conformes-y-descargos")]:
    "La falta se reporta desde campo, la inteligencia artificial ayuda a clasificarla, y la citación, los descargos y la decisión quedan en un solo expediente. Operaciones ve la decisión, y gestión humana sabe qué días no pagar.",

  // ─── G · Formación ───
  [idIntroArea(G)]:
    "Capacitar a cientos de vigilantes repartidos en muchas sedes parece imposible. Aquí los cursos llegan solos al celular según el cargo y la sede, un video largo se vuelve un curso con capítulos, y cada certificado se verifica con un código QR.",
  [idModulo(G, "capacitacion-virtual")]:
    "Los cursos se asignan solos por cargo, cliente o sede, con vencimientos y recordatorios. El vigilante los descarga para repasar sin señal, y quien escanee el QR de su certificado sabe al instante si es válido.",
  [idModulo(G, "disenador-de-cursos-con-ia")]:
    "Cuénteme qué quiere enseñar o suba sus documentos, y armo el curso módulo por módulo. Usted revisa, acepta cada cambio uno por uno y publica: yo propongo, pero la decisión es suya.",
  [idModulo(G, "video-por-temas")]:
    "Suba la grabación de una capacitación de una hora. La transcribo en los servidores de la empresa, la divido por temas y ligo cada tema a su lección, con animaciones cortas para los pasos de cada proceso.",
  [idModulo(G, "auditoria-de-capacitacion-y-reglas")]:
    "¿Quién debe un curso obligatorio y no lo ha hecho? Lo reviso en toda la estructura, de la organización al vigilante, y le envío el recordatorio. El mapa de reglas le muestra cómo llega cada curso a cada persona.",
  [idModulo(G, "evaluaciones-de-conocimiento")]:
    "Evalúe a su gente donde esté, incluso sin señal. Las preguntas se sortean y cambian de orden para cada persona, y el tiempo se controla desde el servidor, así que copiar no sirve de mucho.",

  // ─── H · Finanzas y ERP ───
  [idIntroArea(H)]:
    "Lo contratado, lo programado, lo pagado en nómina y lo facturado viven aquí, en un mismo ERP. Y si su empresa ya tiene otro sistema, no empieza de cero: Ars lo centraliza o hace que la información fluya entre los dos, según los módulos que contrate.",
  [idModulo(H, "clientes-contratos-y-planes")]:
    "Dé de alta a un cliente con su contrato, sus fechas y su valor mensual, y entréguele exactamente los módulos que pagó. Lo que no está en su plan, sencillamente no aparece en el menú.",
  [idModulo(H, "ordenes-de-servicio-del-erp")]:
    "La orden de servicio que se vendió, en Ars o en el sistema que usted ya usa, llega sola a la operación, con cliente, sede, puesto y personal. Usted revisa una vista previa, y nada cambia hasta que pulsa aplicar.",
  [idModulo(H, "contabilidad-conectada")]:
    "Su contabilidad, centralizada aquí. Si la lleva en otro sistema, la traigo en una copia de solo lectura que se actualiza cada quince minutos. Y le muestro lo que solo se ve cuando todo está en un mismo lugar: lo contratado frente a lo facturado por cliente.",
  [idModulo(H, "asistente-contable-con-ia")]:
    "Pregúntele a sus números en español, por ejemplo: ¿cuánto nos deben los clientes? Le respondo en palabras claras con la tabla de donde salió el dato, y reviso por usted asientos descuadrados o facturas duplicadas.",
  [idModulo(H, "facturas-dian-y-radian")]:
    "Las facturas electrónicas de sus proveedores, recibidas, ordenadas y cruzadas con la contabilidad, con los eventos de RADIAN dentro de sus plazos. Este módulo está en piloto y pasa a producción en los próximos meses.",
  [idModulo(H, "agente-interoperador-de-datos")]:
    "¿Y si ya tiene su propio sistema, u otros contratados? Para eso está el agente interoperador de datos. Reúne la información de sus sistemas, sus bases de datos y sus archivos, la organiza y la homologa, y se conecta por API, por conexión directa o por cargas programadas, para que todo se centralice en Ars o fluya entre sistemas.",
  [idModulo(H, "su-erp-dentro-de-ars")]:
    "Nómina, contabilidad, compras y comercial, en una sola puerta dentro de Ars, con una pantalla más clara. Si parte de esa información vive en otro sistema, la centralizo aquí sin duplicar datos, y cada tabla le dice si está igual al sistema de origen.",
  [idModulo(H, "cotizador-y-crm-propios")]:
    "Cotice con las mismas modalidades y tarifas con las que luego programa y factura. Ars trae su propio cotizador y un embudo de ventas, y si usted ya vende en otro sistema, también lo consulta desde aquí.",

  // ─── I · Productividad e IA ───
  [idIntroArea(I)]:
    "Un ticket, una solicitud de un cliente o un acuerdo de reunión se pierden fácil entre correos y chats. Aquí cada uno se vuelve una tarea con responsable y fecha. La inteligencia artificial propone los pasos, y una persona los revisa antes de que algo se cree.",
  [idModulo(I, "seguimiento-de-tareas")]:
    "Las solicitudes de los clientes, las novedades de documentos y los acuerdos de reunión caen solos como tareas con dueño y fecha. Describa un proyecto y le propongo columnas y tareas, pero nada se crea hasta que usted lo revisa.",
  [idModulo(I, "reuniones-con-transcripcion-ia")]:
    "Grabe el comité de operaciones y reciba la transcripción con tiempos, el resumen y los acuerdos. Cada compromiso se vuelve una tarea de seguimiento, y todo se procesa en los servidores de la empresa.",
  [idModulo(I, "tickets-de-soporte")]:
    "Si algo falla, se reporta desde la misma pantalla donde pasó, con la captura y los datos técnicos incluidos. Los administradores siguen cada ticket y miden cuánto tardan en responder y en resolver.",
  [idModulo(I, "formularios-dinamicos")]:
    "Arme su propio formato arrastrando campos: fotos, firma digital, ubicación GPS y más, sin programar. Las respuestas llegan desde el celular o con un enlace público, y se ven en vivo.",
  [idModulo(I, "automatizaciones-y-procedimientos")]:
    "Si se dispara una alarma y nadie contesta, avise al supervisor. Así se arman los procedimientos de la central, y antes de encenderlos se prueban en modo observación, para ver qué habrían hecho con eventos reales.",
  [idModulo(I, "centro-de-ia")]:
    "Pregunte en español y le respondo con la fuente, consultando documentos, novedades y personal con los mismos permisos que usted tiene. Además, hay herramientas para transcribir audio, tapar rostros o redactar informes en borrador.",

  // ─── J · Gobierno, seguridad y canales ───
  [idIntroArea(J)]:
    "Una plataforma que usa toda la empresa necesita orden. Aquí cada persona ve solo lo que le corresponde, cada acción sensible deja rastro, y la misma plataforma llega al vigilante en su celular, a la oficina en la web y a la central en su propia ventana.",
  [idModulo(J, "torre-de-control")]:
    "En una sola pantalla: quién está conectado, desde qué equipo y con qué segundo factor. Y la adopción se mide en dos niveles, quién ingresó y quién de verdad opera, para saber dónde acompañar.",
  [idModulo(J, "auditoria-y-trazabilidad")]:
    "¿Quién cambió ese registro, cuándo y desde dónde? Cada acción sensible queda con su antes y su después, y el expediente de una persona se exporta con una huella de integridad que demuestra que nadie lo alteró.",
  [idModulo(J, "configuracion-multiempresa")]:
    "Cada empresa con sus propios clientes, roles, menú y portada, configurados sin programar. Y al asignar roles, solo se puede dar lo que el plan de la empresa incluye.",
  [idModulo(J, "ingreso-y-doble-factor")]:
    "Para el personal operativo, entrar es tan simple como la cédula y la huella del celular, con un segundo factor. Y si alguien reporta un problema, el administrador puede ver la plataforma exactamente como esa persona la ve, con todo auditado.",
  [idModulo(J, "app-android")]:
    "Turnos, rondas, revistas, radio, chat y botón de pánico, en el bolsillo del vigilante. Si no hay señal, todo se guarda y se envía al volver la conexión, y la aplicación se actualiza sola.",
  [idModulo(J, "app-web-instalable-pwa")]:
    "Sin pasar por una tienda de aplicaciones: Ars se instala desde el navegador en cualquier teléfono o computador. Un solo enlace basta para que una persona nueva la tenga en su pantalla de inicio.",
  [idModulo(J, "app-de-escritorio-para-la-central")]:
    "La central siempre abierta en su propia ventana de Windows, con el muro de video, notificaciones del sistema y micrófono para la radio. Está pensada para trabajar día y noche, y se actualiza sola.",
};
