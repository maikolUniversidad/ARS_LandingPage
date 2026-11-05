/**
 * Guiones de narración de Ars para /vision, /laboratorio y /proyectos (id → texto).
 * Ver src/lib/narracion/contrato.ts. Audio en public/audio/narracion/<id>.mp3.
 */
export const GUIONES_VISION: Record<string, string> = {
  "vision/hero":
    "Este es el módulo de visión. Aquí cada analítica de video se ve funcionando dos veces, lado a lado: el video y una simulación en tres dimensiones vista desde la misma cámara, para que siga exactamente qué ve y en qué segundo avisa.",
  "vision/visor":
    "En este visor va una analítica por lámina: la simulación y la prueba, al mismo tiempo. Debajo le cuento qué hace y cómo se activa. Para pasar a la siguiente, use las flechas o toque la que le interese.",
  "vision/planificador":
    "¿Quiere ver cómo quedaría en su sitio? Cuénteme cómo es: qué tipo de lugar, de qué tamaño y qué le preocupa. Con eso le propongo zonas, cámaras y analíticas, y lo ve en una maqueta donde puede mirar a través de cada cámara.",
  "vision/indice":
    "Aquí está el portafolio completo, organizado en cuatro familias. Toque cualquiera y se la abro arriba, en el visor.",
  "vision/cierre":
    "Y lo más importante: todo esto corre sobre las cámaras que su empresa ya tiene instaladas, sin equipo nuevo. Si quiere verlo con sus propias cámaras, conversemos.",
};

export const GUIONES_LABORATORIO: Record<string, string> = {
  "laboratorio/hero":
    "Bienvenido al laboratorio. Aquí puede ver los modelos de inteligencia artificial en acción, y probarlos con su propia cámara o con un video suyo. Use los filtros de arriba para ir directo a lo que le interesa.",
  "laboratorio/modelos":
    "Estos son los modelos disponibles. Toque cualquiera y se lo muestro funcionando en el escenario de demostración.",
  "laboratorio/demo":
    "Este es el escenario de prueba. Puede ver el ejemplo, encender su cámara o subir un video. La detección corre en su propio navegador: su video no se envía a ningún servidor.",
  "laboratorio/cierre":
    "Si quiere probarlo sobre sus cámaras reales, nos conectamos a la infraestructura que ya tiene, sin reemplazar equipos. Pida una demostración guiada y lo vemos juntos.",
};

export const GUIONES_PROYECTOS: Record<string, string> = {
  "proyectos/intro":
    "Esta es la red de ARS: centrales inteligentes que ya están operando en Colombia y Perú, conectando cámaras y sensores en una sola red de decisión. Entre al mapa y le muestro dónde estamos.",
  "proyectos/mapa":
    "Aquí está el mapa. Acerque o aleje con la rueda o con los dedos, arrástrelo para moverse y toque una ciudad para ver sus proyectos. También puede filtrar por país y por región.",
};

/** Ars acompaña la «Propuesta ARS» (cierre de la home) en cada cambio de fase. */
export const GUIONES_PROPUESTA: Record<string, string> = {
  "propuesta/entrevista":
    "Empecemos. Le hago unas preguntas cortas sobre su empresa y su operación, y con eso armo una propuesta a su medida. Responda con calma: puede volver atrás cuando quiera.",
  "propuesta/seguimiento":
    "Gracias. Ya leí sus respuestas, y quiero precisar un par de cosas antes de armar su propuesta. Son solo unas pocas.",
  "propuesta/armando":
    "Perfecto, ya tengo lo que necesito. Estoy armando su propuesta con lo que me contó: lo que le sirve, cómo se conecta con lo que ya usa y por dónde empezar. Deme un momento.",
  "propuesta/lista":
    "Listo, aquí está su propuesta. Recórrala con calma: verá qué resolvemos primero, cómo se integra con su operación y los siguientes pasos. Puede descargarla o enviársela a un asesor.",
  "propuesta/enviada":
    "Recibido. Un asesor de ARS revisará su propuesta y se pondrá en contacto muy pronto. Gracias por contarnos de su operación.",
};

/** Frases puente: Ars retoma el recorrido después de una conversación. */
export const GUIONES_PUENTE: Record<string, string> = {
  "puente/1": "Sigamos con el recorrido.",
  "puente/2": "Bueno, retomemos donde íbamos.",
  "puente/3": "Listo. Sigamos con el recorrido.",
};
