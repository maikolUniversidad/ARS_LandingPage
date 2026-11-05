/**
 * Guiones de narración de Ars para /arquitectura (id → texto). Ver src/lib/narracion/contrato.ts.
 * Audio en public/audio/narracion/<id>.mp3 (voz de Ars, ElevenLabs).
 */
export const GUIONES_ARQUITECTURA: Record<string, string> = {
  "arquitectura/hero":
    "Esta es la arquitectura de ARS. Arriba está la operación que se ve: cámaras con inteligencia artificial, rondas, radio, sensores y realidad virtual. Debajo, el ERP que la sostiene: contratos, turnos, personal, nómina, documentos y finanzas. Todo comparte los mismos datos.",
  "arquitectura/diagrama":
    "Aquí está el mapa completo, en cinco capas: canales, operación, datos e inteligencia artificial, el ERP base y las integraciones. Toque cualquier bloque y le muestro sus módulos y su estado real, sin adornos.",
  "arquitectura/sigue-un-dato":
    "La mejor forma de entenderlo es seguir un dato. Elija un recorrido, por ejemplo una marcación en el puesto, y véalo viajar por el diagrama hasta la nómina y la contabilidad, sin que nadie lo vuelva a digitar.",
  "arquitectura/interoperabilidad":
    "Si su empresa ya tiene un sistema, se queda. El Agente interoperador de datos se conecta a él por el camino más directo: primero por API, como en Odoo, SAP o Siigo Nube; si no hay API, por backend, con permisos controlados; y si nada de eso es posible, con cargas masivas programadas de Excel o archivos planos. Cada carga se valida y se muestra en vista previa antes de aplicar. Elija su sistema y le enseño el camino.",
  "arquitectura/voz":
    "Y la voz atraviesa todas las capas. Yo le escucho, entiendo con el mismo conocimiento del chat, actúo sobre la pantalla y le respondo, en tiempo real y dejándome interrumpir. Es la misma voz que le está hablando ahora. Si quiere, toque «Hablar con Ars» y pregúnteme lo que quiera de la arquitectura.",
  "arquitectura/por-que-erp":
    "¿Por qué un ERP propio? Porque cuando la operación y la gestión viven en sistemas sueltos, alguien tiene que copiar los datos de uno a otro. Aquí la comparación es honesta: la columna de estado sale directo del catálogo de ARS.",
  "arquitectura/cierre":
    "Esa es la arquitectura completa: lo que pasa en el puesto llega solo a la gestión, y se conecta con lo que su empresa ya usa. Si quiere verlo con sus datos, pida una demostración y lo armamos juntos.",
};
