/**
 * Guiones de narración de Ars para /plataforma (id → texto). Ver src/lib/narracion/contrato.ts.
 * Incluye un paso corto por cada área del recorrido automático (idRecorridoArea).
 * Audio en public/audio/narracion/<id>.mp3.
 */
export const GUIONES_PLATAFORMA: Record<string, string> = {
  "plataforma/hero":
    "Bienvenido a la plataforma. Soy Ars, y le acompaño en este recorrido. Esto que ve detrás no es una maqueta: son pantallas reales del sistema en operación. Acérquese a cualquiera; ahí está todo, de los turnos a las finanzas.",
  "plataforma/en-movimiento":
    "Ahora véalas trabajar. Estos clips están grabados directamente en la plataforma, sin animaciones de mentira: así se mueve la operación del día a día. Si alguno le llama la atención, tóquelo y lo ve en grande.",
  "plataforma/recorrido":
    "Le propongo un recorrido por las once áreas. Voy a pasar por cada una y le cuento en una frase qué resuelve. Si quiere detenerse en alguna, elíjala y le espero.",
  "plataforma/recorrido/operacion-en-campo":
    "Operación en campo: todo lo que pasa en el puesto, de la marcación a la ronda, registrado desde el celular del vigilante y convertido en reportes.",
  "plataforma/recorrido/centro-de-operaciones":
    "Centro de operaciones: la sala de control con el mapa en vivo, las zonas de cada sede y el cumplimiento, persona por persona.",
  "plataforma/recorrido/comunicacion-y-emergencias":
    "Comunicación y emergencias: radio en el celular, chat con la central y botón de pánico, en una sola aplicación.",
  "plataforma/recorrido/monitoreo-inteligente":
    "Monitoreo inteligente: visión artificial sobre las cámaras que ya existen, acceso inteligente, sensores y el modelo en tres dimensiones de cada sede.",
  "plataforma/recorrido/realidad-virtual":
    "Realidad virtual: la central viva en tres dimensiones, que se recorre desde el navegador o con gafas de realidad virtual.",
  "plataforma/recorrido/gestion-humana":
    "Gestión humana: de la selección y la contratación a la nómina, que se calcula a partir de los turnos trabajados.",
  "plataforma/recorrido/formacion":
    "Formación: cursos virtuales, evaluaciones y certificados con código QR, conectados a la ficha de cada colaborador.",
  "plataforma/recorrido/finanzas-y-erp":
    "Finanzas: Ars también es su ERP, con clientes, contratos, facturación y contabilidad conectados con la operación. Y si ya tiene otros sistemas, todo se centraliza aquí o fluye entre ellos.",
  "plataforma/recorrido/productividad-e-ia":
    "Productividad e inteligencia artificial: tareas, reuniones con transcripción, tickets y automatizaciones, con asistentes que proponen y personas que deciden.",
  "plataforma/recorrido/gobierno-y-seguridad":
    "Gobierno y seguridad: la torre de control, la auditoría de cada acción y la configuración de cada empresa, con ingreso de doble factor.",
  "plataforma/recorrido/infraestructura":
    "Infraestructura: nuestro propio centro de datos en Colombia, con tarjetas gráficas para la inteligencia artificial en local, y un monitor que vigila también su nube o el equipo que dejamos en su sede.",
  "plataforma/arquitecto-ia":
    "Aquí puede hacer algo distinto. Cuéntele a nuestro arquitecto, con sus propias palabras, cómo opera hoy y qué le duele, y le arma una propuesta: qué módulos resuelven cada problema y en qué orden implementarlos. Es orientativa, y la ajustamos juntos con su equipo.",
  "plataforma/ciclo":
    "Ahora vea el hilo que une todo. Un turno que se programa termina siendo una marcación, una evidencia y un reporte, sin pasar por planillas sueltas en el camino. Cada paso alimenta al siguiente.",
  "plataforma/pilares":
    "Debajo de todo esto hay una decisión de diseño. Cada empresa con sus propios clientes y permisos, multiagentes de inteligencia artificial trabajando en cada área, y una trazabilidad que registra quién hizo qué, y cuándo.",
  "plataforma/antes-despues":
    "Esta es la diferencia en la práctica. Antes, la operación vivía en llamadas, planillas y grupos de chat, y la evidencia se perdía en el camino. Con nosotros, cada evento queda registrado con su contexto, y usted puede demostrar lo que pasó.",
  "plataforma/cierre":
    "Hasta aquí el recorrido. Si quiere ver cómo se vería su propia operación en la plataforma, hable con un asesor y le preparamos una demostración a su medida. Yo sigo aquí para lo que necesite.",
};
