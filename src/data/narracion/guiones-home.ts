/**
 * Guiones de narración de Ars para la home (id → texto). Ver src/lib/narracion/contrato.ts.
 * Escritos para el oído: complementan el texto en pantalla y enlazan cada capítulo
 * con el siguiente. Audio en public/audio/narracion/<id>.mp3.
 */
export const GUIONES_HOME: Record<string, string> = {
  "home/hero":
    "Hola, soy Ars, la inteligencia artificial de este sitio. Si quieres, te acompaño con mi voz mientras bajas. Te voy a contar cómo una empresa de seguridad privada puede ver todas sus capas, del puesto a la gerencia, en una sola línea de tiempo. Empecemos por donde empieza todo.",
  "home/fisica":
    "Aquí nace la traza. Cada vez que un vigilante inicia su turno, marca un punto de ronda o anota una novedad, ese registro sale de su celular con hora y lugar, y ya no se queda en un cuaderno. Es la primera línea de luz, y sobre ella se van a sumar las demás capas.",
  "home/vision":
    "Ahora sumamos los ojos. Sobre las cámaras que la sede ya tiene, nuestras analíticas vigilan sin cansarse y avisan cuando algo se sale de lo normal; cuáles se activan depende del equipo de cada sede. Y fíjate en algo importante: la inteligencia artificial propone, pero es una persona quien confirma antes de actuar.",
  "home/iot":
    "El edificio también tiene voz. Puertas, accesos, alarmas y relojes biométricos dejan de vivir en pantallas separadas y entran a la misma traza. Así, una puerta que se abre a deshoras ya no es un pitido aislado: es un evento con contexto.",
  "home/robotica":
    "Esta capa es distinta, y te lo digo con honestidad: está en desarrollo en nuestro laboratorio. Trabajamos en perros robot que recorren y verifican con las mismas analíticas de las cámaras. Lo importante es que la plataforma ya está pensada para sumarlos, sin cambiar la forma de operar.",
  "home/central":
    "Y todo llega aquí. La central ve cada sede y cada persona en un mapa en vivo, y desde la misma pantalla habla por radio, responde el chat y atiende un pánico. La gerencia no espera el informe de mañana: lo ve mientras pasa. Ahora mira cómo funciona todo junto.",
  "home/traza":
    "Te muestro un escenario de demostración. Son las dos y catorce de la madrugada: el vigilante escanea el punto siete de la cerca norte y reporta una novedad con foto. Segundos después, la cámara cuatro confirma a una persona en zona restringida, y el operador valida la alerta. La puerta de la bodega dos se abre fuera de horario, y el robot, todavía en desarrollo, verifica el sector y envía video. A las dos y quince, la central despacha por radio al supervisor más cercano. Y a las dos y treinta y uno, el evento se cierra con evidencia, responsable y tiempos, directo al tablero de gerencia.",
  "home/escala":
    "Ahora multiplica esa traza por cada sede, cada cliente y cada turno de tu empresa. Esa es la nueva era de la seguridad privada: multiagentes de inteligencia artificial que proponen, y personas que deciden. La construimos desde Colombia, para Latinoamérica y el mundo.",
  "home/recap":
    "Haz una pausa y mira el conjunto. Cada capa funciona por sí sola, así que no tienes que encenderlas todas el primer día. Puedes empezar por la que más te urge hoy, y la traza crece contigo.",
  "home/despliegue":
    "Ahora, una pregunta que siempre llega: ¿dónde viven tus datos? Tú decides. ARS puede correr en nuestro centro de datos en Colombia, con la inteligencia artificial en tarjetas gráficas propias; en la nube que tu empresa ya tiene; en un equipo dentro de tu sede, para que el video no salga del edificio; o mezclando la sede y la nube. Hoy nuestra nube está en operación, y las otras formas, en piloto. Elijas la que elijas, cumples tu gobierno de datos, y todo se vigila desde un solo lugar: servidores, respaldos verificados, publicaciones con bitácora y los conectores con lo que ya usas.",
  "home/capacitacion":
    "Antes de despedirme, mira cómo formamos a la gente que cuida. En la plataforma, cada curso le llega solo a quien lo necesita, por cargo y por sede, con evaluaciones y un certificado con código QR que cualquiera puede comprobar. Y en la Academia ARS, que hoy está en piloto, el vigilante se pone las gafas de realidad virtual y practica lo que no se puede practicar en la calle: atender a la gente, revisar su dotación, manejar el arma con seguridad y decidir si puede o no usar la fuerza. No es un sistema aparte: es una actividad más dentro de los cursos.",
  "home/contacto":
    "Aquí termina nuestro recorrido, o mejor, empieza el tuyo. Cuéntanos cuántas sedes, puestos y cámaras tienes, y en una demo te mostramos tu propia operación en una sola traza. Gracias por recorrer esto conmigo; si tienes una pregunta, aquí sigo.",
};
