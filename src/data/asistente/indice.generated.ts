// GENERADO por src/data/asistente/generar.mjs (conocimiento/*.md + src/data/*.ts).
// No editar a mano: ejecute `node src/data/asistente/generar.mjs`.
// `v` = embedding text-embedding-3-small (512 dims) cuantizado a int8, en base64.
import type { IndiceConocimiento } from "./tipos";

export const INDICE: IndiceConocimiento = /*JSON*/{
 "modelo": "text-embedding-3-small",
 "dimensiones": 512,
 "trozos": [
  {
   "id": "kb:que-es-ars:0",
   "fuente": "kb",
   "titulo": "Qué es ARS Intelligence › En una frase",
   "ruta": "/",
   "texto": "ARS Intelligence es un **laboratorio de tecnología dedicado solo al desarrollo y la innovación en seguridad**, desde Colombia para Latinoamérica y el mundo. Trabaja para **empresas de seguridad privada** y las lleva a una nueva era en la que toda la operación es inteligente. Titular de la portada: «Todas las capas de la seguridad. Una sola traza.» Lema del sitio: «La forma simple de hacer que todo funcione».",
   "h": "5b87633460fec50b"
  },
  {
   "id": "kb:que-es-ars:1",
   "fuente": "kb",
   "titulo": "Qué es ARS Intelligence › Posicionamiento: todas las capas, una sola traza",
   "ruta": "/",
   "texto": "ARS no es un conjunto de programas separados: une en una sola plataforma con IA todas las capas de lo que pasa en un lugar de seguridad, y hace que todo fluya como debe.",
   "h": "9375ede6b8fdc96d"
  },
  {
   "id": "kb:que-es-ars:1.1",
   "fuente": "kb",
   "titulo": "Qué es ARS Intelligence › Posicionamiento: todas las capas, una sola traza",
   "ruta": "/",
   "texto": "1. **Vigilancia física** (en operación): el vigilante y sus turnos, relevos, rondas con QR, minuta desde el celular, radio PTT y botón de pánico en el mismo teléfono, y el supervisor visible en campo.\n2. **Visión con IA sobre las cámaras** (en operación): las analíticas de `/vision` sobre las cámaras que la sede ya tiene; cada alerta llega con foto y video y **una persona confirma antes de actuar**. Las analíticas disponibles dependen del equipo de cada sede.\n3. **Sensores, domótica e IoT** (en **operación**): sensores, controles de acceso, alarmas y relojes biométricos en el mismo panel que el resto de la operación.\n4. **Robótica** (**en desarrollo** en nuestro laboratorio, no es un producto comercial todavía): perros robot que recorren y verifican con las mismas analíticas de las cámaras. La plataforma está pensada para sumar nuevos dispositivos. No prometas fechas, modelos ni disponibilidad; si preguntan, di que es una línea en desarrollo del laboratorio y ofrece hablar con el equipo.\n5. **Central de operaciones y gerencia** (en operación): mapa en vivo de cada sede y cada persona, radio, chat y pánico en la misma pantalla; la gerencia ve en tiempo real qué está cubierto, qué falta y qué pasó.",
   "h": "80a6c502a9b1ab5b"
  },
  {
   "id": "kb:que-es-ars:1.2",
   "fuente": "kb",
   "titulo": "Qué es ARS Intelligence › Posicionamiento: todas las capas, una sola traza",
   "ruta": "/",
   "texto": "**La base: un ERP de gestión hecho para la seguridad.** ARS no es solo la central ni solo lo operativo (lo que se ve en las cinco capas). Por debajo, todo se apoya en el ERP de gestión de ARS para el proceso base de una empresa de seguridad: contratos y turnos, personas y nómina, documental, formación, clientes, finanzas y facturación, y gobierno multiempresa con auditoría. Las cinco capas lo alimentan solas: el turno cumplido llega a la nómina, la ronda y el evento al informe del cliente, el servicio prestado a la prefactura y todo a la contabilidad. Operación encima + ERP debajo = una sola plataforma; el laboratorio de tecnología de seguridad está construido sobre esa base. Si la empresa ya usa otro ERP, el Agente interoperador de datos lo conecta con ARS, completo o por partes. Cada módulo tiene su estado real en `/servicios` (por ejemplo, Nómina y Contabilidad conectada están en producción; Facturas DIAN y RADIAN —bandeja de facturas recibidas— está «Próximamente»; el cotizador y CRM propios están en la hoja de ruta): no prometas lo que no está en producción. En la portada se ve en el capítulo `#erp` y en la sección `#la-base`.",
   "h": "c149c45f88503e19"
  },
  {
   "id": "kb:que-es-ars:1.3",
   "fuente": "kb",
   "titulo": "Qué es ARS Intelligence › Posicionamiento: todas las capas, una sola traza",
   "ruta": "/",
   "texto": "**Todo es una traza**: cada evento queda trazado de punta a punta, del puesto a la gerencia. Ejemplo de la portada (escenario de demostración, ficticio): una ronda reporta una novedad en la cerca norte → la cámara 04 confirma con cruce de línea y el operador valida → el sensor de la puerta de la bodega avisa → el robot del laboratorio verifica → la central despacha al supervisor por radio → el cierre con evidencia, responsable y tiempos llega al tablero de gerencia.",
   "h": "767abbe65e006200"
  },
  {
   "id": "kb:que-es-ars:1.4",
   "fuente": "kb",
   "titulo": "Qué es ARS Intelligence › Posicionamiento: todas las capas, una sola traza",
   "ruta": "/",
   "texto": "Otras ideas que comunica el sitio:\n- **La IA apoya al equipo humano**: multiagentes de IA que proponen y una persona que decide.\n- **Alertas con evidencia**: foto, video, ubicación, cámara, hora y responsable asociados al evento.\n- **Multi-cliente, multi-sede**: cada sede, cada cliente y cada turno en la misma plataforma.\n- Cifras de la portada (salen del catálogo de `/servicios`): 10 áreas de servicio, los módulos del catálogo y cuántos están en operación, y 8 analíticas de video. No uses otras cifras (no hay respaldo para «< 48 h», «24/7», «12+ modelos» ni porcentajes de precisión).\n- Plazos de despliegue, precios y alcance de cada proyecto: a confirmar con el equipo comercial.",
   "h": "bb37ff53ae7bcaa6"
  },
  {
   "id": "kb:que-es-ars:2",
   "fuente": "kb",
   "titulo": "Qué es ARS Intelligence › Presencia",
   "ruta": "/",
   "texto": "El sitio indica que ARS opera centrales inteligentes en **Colombia y Perú** (Latinoamérica). El mapa de `/proyectos` muestra ciudades de ambos países (ver documento de proyectos).",
   "h": "d69b21fb8ceb8628",
   "v": "3OEmHuIz4QD10bz3Kcgf/+Pi8OcEFssAKe7KKdL5/8oEBOQWB+4W/f0H2wcb99DrKxnSARbq3fj2KyL28AMbCuMB0zn44+g6KOALCNhA7vrbEtvQ+b8B6Pn2BP388hkBHgkgRQnUCMnL9joqIeQJ6RUaEf7k0jEdEfrqGeQFEPL/5QUHD/UD3PvO/Pf6ARYtuerIBEAK7Bvh69Il0xcK09cc9+vzCu7uq/2b4eP+8c3kFPrXzRfu3PD93R3mPAsVPlQD488V2NnTAzIo2vUk+wANUgIjJA8M0CX089jx+BzlRuy1M9EkFBzf6eoM8fr1CgAdFCQICfwjGf05MhYN8NUA7dLrHQGyAscLHAPIDwwq+v0qQ/XvIN/t7C308u3zySBUBBf45uQ02wL4QBQF0PQuy/kT7vbrO9/NygHGDesL4fPJmtAOHATYSRg9Lg/ZDuvzCA7s7gQH9/3WHxsI3fH2vv3uCt0FyAUHEiDjBiJDyRvMAOwX3h8U7ADkE/W+EPDkD+vb/h0z0vTXJtD6DBXcxAPjIwQRBPX5gS8N4voL+ef5LSoy7goVEvj+1CkNMCXhPOgwxQjlEt/4ztskI9rk/ADiWeAMRxP4Jw0K2BsB3Ob3BhEXF80p6wsE7QDgCN3bHvQ670v2EfgSKPcQ4O3f2+z69uLl+A/1+w7z/x0="
  },
  {
   "id": "kb:que-es-ars:3",
   "fuente": "kb",
   "titulo": "Qué es ARS Intelligence › Ciclo operativo (8 pasos)",
   "ruta": "/",
   "texto": "1. **Programación**: turnos, servicios, sedes, zonas y responsables desde una estructura centralizada.\n2. **Asignación**: personal según cliente, sede, puesto, horario, rol, disponibilidad y necesidades.\n3. **Ejecución en campo**: los guardas ejecutan rondas, tareas, registros y novedades desde móviles o estaciones operativas.\n4. **Monitoreo en tiempo real**: la central ve ubicación, estado del personal, cámaras, eventos y actividad en vivo.\n5. **Alertas y novedades**: cada evento relevante puede generar una alerta con contexto, prioridad, ubicación y responsable.\n6. **Evidencia**: fotos, videos, formularios, hora, ubicación, cámara y usuario quedan asociados al evento.\n7. **Reportes**: la operación diaria se convierte en indicadores, bitácoras, auditoría y reportes gerenciales.\n8. **Decisiones**: mejorar tiempos de respuesta, cumplimiento, cobertura y calidad del servicio.\n\nVerbos que resumen la plataforma: Opera · Monitorea · Comunica · Evidencia · Reporta · Decide.",
   "h": "f8b73755ae3e81de",
   "v": "4SMV5/Qd8AABDufNEccq/dwHxgEGDs8BAAWqGMjZHtEN/BTw9+obDDIR0ubs3NncIDjDDwYz/f37Cy4L/s//MNH9zSgGzPBHFOgj9gAsB/30zAfvJOWN59ja9kgQJ10PMRICNDia+NzB5zIgEM35sQcLPwUf/zvuD/O2DQDvCPAK1wX6/cT75yft9B0P/voipOTQJgMQ8wkBFyENuhMU5hIPxQLU0sT/iha22t8IDMzNGf7ktSzXverk1QjURsNHDjUd2e8B7OcEDnjg4v4VA/LkbAk6B6oBxhHd2s7Av/7tf0q4KK7+FfL0/+cG9QLPEhoS/hQGHt8XBREsHhoH6ufo5MsYF+zf9AYUAf7o+EMiGu8VQ9kWNffdMi8rD+7Q9Rs+Jf7k788t+xsEIiUV6AVK5fcrvxEMIcLArzrCK8oSsgbOwK0VD/7AQdEbKRf8v/Io8urYqer4/9CqUyYv7OMjugv56s0OteNZCxQeBxAOxS/R6fz82wIoBDn5DOTHHwzLKBL59gP80fDwEwUe8ijilibj/i0UCRIzoj073M//5SQENgEW8/0w/hTW3x8bNAm8IAEN3S3xFN8L3P/zydLC9A7db8W9V+8EXvcr8jQqAL3e/y/yG+ni1wMV1+0DD8DoMBtc9Tz7PwouMfAg5NrUx+btDPYhGv8FDSmx7RI="
  },
  {
   "id": "kb:que-es-ars:4",
   "fuente": "kb",
   "titulo": "Qué es ARS Intelligence › Los dos grandes bloques de producto",
   "ruta": "/",
   "texto": "- **Operación y ERP de gestión en una sola plataforma**: la operación (capas de la portada) encima y el ERP de gestión debajo; el detalle de cada módulo está en `/servicios` (áreas Gestión humana, Formación, Finanzas y ERP, Productividad e IA, Gobierno y seguridad).\n- **Plataforma de operación y ERP de la empresa de seguridad** en `/plataforma`: turnos, personal, rondas, formularios, mapa, PTT, central de monitoreo, alertas, evidencia, reportes, multisede, y el ERP (clientes y contratos, nómina, costos, facturación, contabilidad, cotizador y CRM). Si la empresa ya tiene otros sistemas, ARS los centraliza o hace que la información fluya entre ellos.\n- **Módulo de Visión (analíticas de video)** en `/vision`: 45 analíticas en 4 familias que corren sobre las cámaras ya instaladas.\n\nAdemás hay demos interactivas: `/laboratorio` (modelos de IA en acción, con cámara o video propio) y `/vision-lab` (playground técnico).",
   "h": "06b9432659e64b48"
  },
  {
   "id": "kb:que-es-ars:5",
   "fuente": "kb",
   "titulo": "Qué es ARS Intelligence › Contacto",
   "ruta": "/",
   "texto": "- Diagnóstico de la empresa con IA (llamado principal del menú): `/diagnostico`.\n- Solicitar demo: formulario y botones en la sección `#contacto` de la portada (`/#contacto`), de `/plataforma#cierre` y de `/vision#cierre`.\n- WhatsApp de la gerencia comercial: +57 312 462 3357.\n- Correo: j.muriel@ars-group.co (asunto sugerido «Solicitud de demo - ARS Intelligence»).\n- Dominio del sitio: ars-intelligence.com.\n\nPrecios, planes, licencias y condiciones contractuales no están publicados en el sitio: a confirmar con el equipo comercial.",
   "h": "83f23b61e04e5e4b"
  },
  {
   "id": "kb:mapa-del-sitio:0",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante",
   "ruta": "/",
   "texto": "Usa siempre rutas relativas del sitio (por ejemplo `/vision#intrusion`). Solo existen las rutas y anclas listadas aquí; no inventes otras.",
   "h": "fe6615a5e31e635b",
   "v": "CyoWFd3ow8/f/vcNOrcE/8QPB08d9esW9gwJazb6CNX98PXiGCkQJighPRX6Dd4MDgvvsvNW5vEB1w8J/c/77RFBsiThFxj7+vMb4tck4KDkGdu/6/HQ9xbmCQTpFeMdMBnkH0qMA7ZL5jEY4N098DNRORAe2S7w+80XC/qg8xnU+C7ILNLz8c7x21oP+f4REv74K0MICyvz/tPv7szSEPvOD/Lq8d/LyT/bEfr8ByHM4C4yAiYB/QwV7//x99kUDTPO+dbTDfnKAVMXyxQ6DB3gL/Y6JftBtTXlFqvsu/YpSSWr1ycuKRXu5eb8uAMCFfnlAgv1+fEnS39CIAYLFL/SH9ABOffiAtjDPAPd/Ab46N/8Ic/z3OXu1hb0Ngwp4hv5MuwV7ypFzSIG/hEoDRkgNtn7CMrcvAMetS7VGOvy8P4K8urtBN3oTs8dEMkGBisSJ/3d9On9Df34LRLl/9rpxDLyCNYZ28ANAgQu8dcO1CXd8OIC9xoQIjjh79reBM5H+v3U+vkE+R8KbPkK+jEGrBDkLBjjxTMSySUB8RVUrQsFHha35QILNBnw1/U6+CTnDy/q/MQG3tsFEcwrFAO25QTaFfctIOn7Dxse5R80+rL8JMksF/fLuvu+5g7oDvve3iFcDSLr/sIi7e/p9/vd3AoLzuDm/Bfw8PX32Nk="
  },
  {
   "id": "kb:mapa-del-sitio:1",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/` — Portada (las capas de la seguridad unidas en una traza, sobre un ERP de gestión)",
   "ruta": "/",
   "texto": "Recorrido 3D con scroll: en la apertura las cinco capas flotan sobre una sede y caen hasta volverse una sola plataforma; luego cada capa se enciende y un mismo evento las recorre dejando una traza de luz hasta el tablero de gerencia. Después la cámara baja al cimiento: el ERP de gestión de ARS, la base que sostiene la operación. Anclas:",
   "h": "a4ba9cfcbbaf1f3d"
  },
  {
   "id": "kb:mapa-del-sitio:1.1",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/` — Portada (las capas de la seguridad unidas en una traza, sobre un ERP de gestión)",
   "ruta": "/",
   "texto": "- `#hero` — «Todas las capas de la seguridad. Una sola traza.»\n- `#fisica` — Capa 01 · Vigilancia física (turnos, rondas con QR, minuta, radio, pánico, supervisor). En operación.\n- `#vision` — Capa 02 · Visión con IA sobre las cámaras. En operación.\n- `#iot` — Capa 03 · Sensores e IoT (accesos, alarmas, relojes biométricos). En operación.\n- `#robotica` — Capa 04 · Robótica (perros robot con las mismas analíticas). En desarrollo.\n- `#central` — Capa 05 · Central de operaciones y gerencia en tiempo real. En operación.\n- `#erp` — «Debajo de todo, un ERP hecho para la seguridad.»: el suelo se abre y se ve el ERP de gestión (contratos y turnos, personas y nómina, documental, formación, clientes, finanzas y facturación, gobierno y auditoría) alimentado por las cinco capas; un turno cumplido llega a la nómina, la ronda y el evento al informe del cliente, el servicio prestado a la prefactura y todo a la contabilidad.\n- `#traza` — «Un evento. Cinco capas. Ningún cabo suelto.»: línea de tiempo de un evento de demostración, de la ronda al cierre en gerencia.\n- `#escala` — «La nueva era de la seguridad privada ya opera.»: todas las sedes en la misma plataforma (la operación encima, el ERP de gestión debajo), cifras del catálogo y botones a demo y a `/servicios`.\n- `#la-base` — sección «La base: un ERP hecho para la seguridad»: dos niveles (Operación arriba, Gestión abajo) con los módulos reales del catálogo y su estado, cada uno enlazado a `/servicios/<área>#<módulo>`, y el botón «Ver la arquitectura completa» (`/arquitectura`).\n- `#contacto` — formulario de contacto (nombre, empresa, correo, teléfono, mensaje), WhatsApp y correo. `/#cierre` también lleva aquí.",
   "h": "d76e512cb43929cc"
  },
  {
   "id": "kb:mapa-del-sitio:1.2",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/` — Portada (las capas de la seguridad unidas en una traza, sobre un ERP de gestión)",
   "ruta": "/",
   "texto": "Enviar aquí: visitante que quiere la visión general, entender cómo se integran las capas (y cómo la operación alimenta el ERP de gestión: `/#la-base`) o contactar. Para pedir demo, `/#contacto`.",
   "h": "9c59428db60abc43"
  },
  {
   "id": "kb:mapa-del-sitio:2",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/diagnostico` — Diagnóstico de tu empresa",
   "ruta": "/",
   "texto": "«¿Cómo se vería tu empresa con ARS?» Entrevista de unos 5 minutos con Ars: mientras la persona cuenta cómo opera, se van marcando las áreas de ARS que le sirven; al final los agentes por área arman el diagnóstico, una historia 3D de su operación y un reporte para compartir o descargar. `/diagnostico?ejemplo=1` muestra un diagnóstico de ejemplo. No tiene anclas.\n\nEnviar aquí: quien quiere saber qué le sirve de ARS a su empresa, un plan o un punto de partida antes de hablar con ventas. Es el llamado principal del sitio (botón «Diagnóstico» del menú).",
   "h": "e072112a37033097"
  },
  {
   "id": "kb:mapa-del-sitio:3",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/plataforma` — Seguridad integral en una sola plataforma",
   "ruta": "/",
   "texto": "La plataforma de operación (ERP operativo de seguridad), mostrada en movimiento. Orden de secciones: hero 3D con un muro de capturas reales, «En movimiento» (clips y recorridos con capturas reales), recorrido por los módulos de cada área de campo, Arquitecto IA (arma la plataforma a la medida de la empresa), ciclo operativo, pilares, comparativa antes/con ARS, logos de entidades y empresas, cierre con demo.\n\nAnclas:\n- `#en-movimiento` — clips y recorridos de la plataforma con capturas reales.\n- `#recorrido` — recorrido por los módulos de cada área (operación en campo, centro de operaciones, comunicación, monitoreo…), con enlace a cada área en `/servicios/<área>`.\n- `#arquitecto-ia` — la persona describe su operación y la IA propone los módulos y una ruta de implementación.\n- `#pilares` — pilares de la plataforma.\n- `#cierre` — Solicitar demo / Hablar con un asesor (WhatsApp).\n\nLas funcionalidades A–N (turnos, rondas, PTT, central, alertas…) no tienen ancla propia: para una funcionalidad concreta usa `/plataforma#recorrido` o el módulo equivalente en `/servicios/<área>#<módulo>`.",
   "h": "35372f3742330b95"
  },
  {
   "id": "kb:mapa-del-sitio:3.1",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/plataforma` — Seguridad integral en una sola plataforma",
   "ruta": "/",
   "texto": "Enviar aquí: preguntas sobre turnos, rondas, guardas, central, reportes, multisede, software de gestión u operación.",
   "h": "bd5871d7faada582"
  },
  {
   "id": "kb:mapa-del-sitio:4",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/vision` — Módulo de Visión · Analíticas de video",
   "ruta": "/",
   "texto": "«Cada analítica, vista funcionando.» 45 analíticas en 4 familias, cada una con simulación 3D y, cuando existe, video o imagen real procesados por los modelos. Botones para abrir la presentación 3D completa y descargar el PowerPoint del portafolio.\n\nAnclas:\n- `#visor` — visor lámina por lámina: simulación 3D (se puede girar arrastrando), prueba real al lado, qué hace y «Cómo se activa» paso a paso. Se navega con clic, flechas o teclado.\n- `#indice` — «Las 45 de un vistazo», agrupadas por familia; un clic abre cada una en el visor.\n- `#cierre` — «45 analíticas. Las mismas cámaras.»: correo de demo, WhatsApp, presentación y PowerPoint.\n- `#<id-analítica>` — abre esa analítica directamente en el visor, p. ej. `/vision#intrusion`, `/vision#aforo`, `/vision#huecos`. Si el id no existe se abre la analítica por defecto (Mapa de calor).",
   "h": "80814803bd52b136",
   "v": "8UX+4OL01+H51DLqKbspN9TmB1sU2/EWHOHqJjb3Cs8TBsrn4Rn8CjJSCDEv/vXxFA/oC/ZgBfDr+ucCCgYoKwkGmzsM4xgby/0SCMz26LcOIMoEDOwGEvUf2hjFBz5ZFBDZGEK++dwcFzD+8/so4BMiJAogzS/NxNxD89nH/fTa1Q/mIKAB7fwPvl8lDzLn/h8xESUFDSXe8wP/At7v7Ajj6f66R+HomAfN6BbpFgjx0BoXsjIP2gAV4N8CK9EVK1oK5d8Q8wrPJVbU6hIlIer0aONlAvYk4iL6UtX69/UtUFip/fMfI/UuA9UT4t7dKBYg5g817a0LLmsh6wUP95AXGsUM99fdAvIFJOLDDQ/5NNT3JuHnB/j18U7bPvQS1Q3u/gX43lE28P70F9hPFvdAJAoH9Nfh/uLCskPpOuvS/+vvzOrsQCXCVOn0O8jCASa4DcLjpNUZ4vrYNADvzekKBxHZ4uIh+OFiAxsRuulDyDjNFM4AyA8V9AjcBNXK8s4xLPMD9OTczAoHNg0z7eoKr+nbKBYjEAH9kwAQ+cwr5BZBGgrd/tMxQgwYsuIyMSXP5QLjAPDN/sYF3s384dOoCj7mJsbsOsQJFPgf4Csn+9byMgs0KhXkxvThzNfMLPrY/RB/2vAqD9MX/+7qDL7i+/E/+ugCE/QR4Q0R3/8="
  },
  {
   "id": "kb:mapa-del-sitio:4.1",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/vision` — Módulo de Visión · Analíticas de video",
   "ruta": "/",
   "texto": "Nota técnica: existe una analítica con id `cierre` («Cierre de puerta sin autorización»), por eso `/vision#cierre` también selecciona esa analítica en el visor además de llevar a la sección de cierre. Para contacto en esta página es preferible decir «baja hasta el final de la página» o usar `/#contacto`.\n\nEnviar aquí: preguntas sobre qué detectan las cámaras, analíticas para retail, prevención, operación, modelos de bajo costo.",
   "h": "3df177519bb71089"
  },
  {
   "id": "kb:mapa-del-sitio:5",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/proyectos` — Proyectos por sector y ciudad",
   "ruta": "/",
   "texto": "«La plataforma, operando en terreno.» Mapa de Colombia y Perú con un marcador por ciudad, filtros por estado (En operación, Piloto, En desarrollo), país y área de servicio, y tarjetas que abren la ficha de cada proyecto con los módulos del catálogo que usa (enlazados a `/servicios/<area>#<modulo>`) y CTA al diagnóstico. Cada ficha tiene enlace propio `/proyectos#<id>`.\n\nAnclas:\n- `#mapa` — mapa, filtros y tarjetas.\n- `#como-empieza` — diagnóstico → piloto → operación.\n- `#cierre` — contacto.\n\nEnviar aquí: preguntas sobre experiencia, ciudades, países, sectores.",
   "h": "699ae3850cb03f0c"
  },
  {
   "id": "kb:mapa-del-sitio:6",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/laboratorio` — Laboratorio · Modelos de IA",
   "ruta": "/",
   "texto": "«Probá la IA con tus propios ojos.» Catálogo de 13 capacidades de IA filtrables por categoría (Personas, Vehículos, Industrial, Perímetro, Operación). Al elegir una se abre la demo con tres pestañas: Ejemplo, Cámara en vivo y Subir video. La detección corre en el navegador, sin enviar el video a ningún servidor.\n\nAnclas:\n- `#demo-stage` — escenario de la demo en vivo.\n\nAl final: «¿Querés probarlo sobre tus cámaras reales?» con botón Solicitar demo guiada.\n\nEnviar aquí: visitante que quiere ver la IA funcionando ya, con su cámara o un video propio.",
   "h": "af8362d7a406ef3f",
   "v": "6QXvEPDH4B8C+y/GE8rrBtf/8T8A9t36Ibr5KfrhA9rR7c8NFhrkERMbCxXc+fDdFhXa/N5JAhXUFvMECvcPH+3xxTff9zD35ejqAcMs6dTp9+zu+QbV6+8PAxTxFj8wKPcOSTy9+PkYCh4O0e8Z9RwgGQMhzwy72f0a6+2pKN3K+wcAMeXi8v7otzwiy/n80Pz6BzIZDwi/89H3webR6QTO3AHJSvrvohLpBRIh7QoT1w7r0BHx58Xy7/3oH+kEQFEu4/UDNvvdEEsXAycyH+cAVfw//u0N0wbYP6v4AfUHHirD+fEGJB4JMv0X3ffaGyL86SgICN4mFzIIE98gILwLBsINK+LsLe/+CvTv/AoYLeQbKeH+Gd0f+wn0GwXV3xccDCHy7hJH9xTyBftA5t8+Awwe4coH+gX3yzTuKwLWDdfoxe8KAQO3FPoEAhD+4wvjQuf21CA9ATPUFe3k6PP42xfd4PP99QhQGgUB9N0a1Sq4Nszz0iYiDTID7/fzEOsWJufuAb7m0y4RNwcD7Pz2y/8CBygeFekHkiAO8Qk78BchF/Df9OcsSxH40eEbBxTUBxXk++gKAc/0CuLz/s7K5PrvKtrwMeAWERMM6VczOdEGKP338PHrzusC8erg+PnSBCt/1+odBegdCfIO8QX02CEYwLsQ4foF8SXo6f0="
  },
  {
   "id": "kb:mapa-del-sitio:7",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/servicios` — Servicios: el sistema operativo de una empresa de seguridad",
   "ruta": "/",
   "texto": "Catálogo completo de lo que hace ARS, organizado por áreas (operación en campo, centro de operaciones, comunicación, monitoreo inteligente, realidad virtual, gestión humana, formación, finanzas y ERP, productividad e IA, gobierno). El detalle de cada área y módulo está en el «Catálogo de servicios de ARS» al final de esta base de conocimiento.\n\nAnclas del hub `/servicios`:\n- `#dia` — «Un día en ARS»: una jornada que recorre todas las áreas.\n- `#areas` — tarjetas de las áreas.\n- `#por-que` — por qué ARS (pilares transversales).\n- `#buscar` — buscador de servicios.\n- `#cierre` — solicitar demo / hablar con un asesor.\n\nCada área tiene su página `/servicios/<área>` con una escena 3D que se puede girar y una sección por módulo con ancla `#<módulo>` (p. ej. `/servicios/monitoreo-inteligente#vision-artificial`). Al mostrar un módulo la escena 3D vuela a su punto (cámaras, puertas, radio, nómina…). En cada módulo hay un botón «Pregúntale a Ars sobre esto».",
   "h": "209fe66942160235"
  },
  {
   "id": "kb:mapa-del-sitio:7.1",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/servicios` — Servicios: el sistema operativo de una empresa de seguridad",
   "ruta": "/",
   "texto": "Enviar aquí: cualquier pregunta por un servicio o módulo concreto (mostrar_servicio), o la persona que quiere entender todo lo que hace ARS (ofrecer «un día en ARS»).",
   "h": "75dce5dc434e17ed"
  },
  {
   "id": "kb:mapa-del-sitio:8",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › `/vision-lab` — Playground técnico",
   "ruta": "/",
   "texto": "Herramienta técnica: selector de 14 modelos, fuente (imagen, video, webcam), motor «IA real» en el navegador o «Demo» simulado, reglas (dibujar ROI o línea), panel de eventos, conteo, análisis facial y visor JSON de la respuesta. No tiene anclas y no aparece en el menú: solo para perfiles técnicos o integradores; para visitantes, la demo es `/laboratorio`.",
   "h": "ff927b282764f5c8"
  },
  {
   "id": "kb:mapa-del-sitio:9",
   "fuente": "kb",
   "titulo": "Mapa del sitio y a dónde llevar al visitante › Reglas de navegación",
   "ruta": "/",
   "texto": "- Pedir demo o hablar con alguien → `/#contacto` (formulario) o WhatsApp +57 312 462 3357.\n- Saber qué le sirve de ARS a su empresa / un plan → `/diagnostico`.\n- Una analítica concreta → `/vision#<id>` usando el id exacto del catálogo.\n- Una funcionalidad de la plataforma → `/plataforma#recorrido`, o `/plataforma#arquitecto-ia` para armarla a la medida.\n- Ver IA en vivo con su cámara → `/laboratorio#demo-stage`.\n- Un servicio o módulo de ARS → `/servicios/<área>#<módulo>` con la herramienta mostrar_servicio (ids exactos del catálogo de servicios).\n- Existe una ruta `/admin` interna (edición de datos del mapa); no es para visitantes, no la recomiendes.",
   "h": "37b410d267b2bcbb"
  },
  {
   "id": "kb:plataforma-erp:0",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo",
   "ruta": "/plataforma",
   "texto": "**Relación con el ERP de gestión.** La portada (`/#erp`, `/#la-base`) presenta a ARS como operación encima + ERP de gestión propio debajo: contratos y turnos, personas y nómina, documental, formación, clientes, finanzas y facturación, gobierno y auditoría, todo alimentado por las capas operativas. Los módulos de gestión y su estado real están en `/servicios` (`gestion-humana`, `formacion`, `finanzas-y-erp`, `productividad-e-ia`, `gobierno-y-seguridad`). Con un ERP existente, el Agente interoperador de datos (`/servicios/finanzas-y-erp#agente-interoperador-de-datos`) lo conecta, completo o por partes; «Su ERP dentro de ARS» lo opera desde ARS sin duplicar datos.\n\n«Seguridad integral en una sola plataforma.» ARS conecta turnos, personal, rondas, cámaras, IA, alertas, comunicación, formularios, mapas y reportes para transformar la operación de seguridad en un sistema trazable, inteligente y en tiempo real. Página: `/plataforma`. Mensaje del cierre: «Transforma la seguridad tradicional en una operación inteligente»: conectar la operación humana, tecnológica y gerencial para tener más control, más evidencia y mejores tiempos de respuesta.",
   "h": "0bd93f67bf62c714"
  },
  {
   "id": "kb:plataforma-erp:0.1",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo",
   "ruta": "/plataforma",
   "texto": "**ARS es un ERP, y además se adapta.** Además de la operación, ARS es el ERP de la empresa de seguridad: clientes, contratos y planes, órdenes de servicio, nómina, costos, facturación, contabilidad con asistente de IA, cotizador y CRM (detalle en `/servicios/finanzas-y-erp` y `/servicios/gestion-humana`). Si la empresa ya tiene su propio sistema u otros contratados, el Agente interoperador de datos y las integraciones hacen que todo se centralice en ARS o fluya entre sistemas, según los módulos que contrate.",
   "h": "7c3d21a703492438"
  },
  {
   "id": "kb:plataforma-erp:1",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo › Funcionalidades (A–N) · se recorren en `/plataforma#recorrido`",
   "ruta": "/plataforma",
   "texto": "Grupos: **Operación** (gestión humana, programación y ejecución en campo), **Monitoreo** (visualización, central y trazabilidad), **Inteligencia** (IA y alertas con contexto), **Reportes** (indicadores, multisede y arquitectura).",
   "h": "72cb39c0bbb7a682"
  },
  {
   "id": "kb:plataforma-erp:1.1",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo › Funcionalidades (A–N) · se recorren en `/plataforma#recorrido`",
   "ruta": "/plataforma",
   "texto": "- **A · Control de turnos y programación** (`turnos`, Operación): turnos por cliente, sede, zona, puesto y horario; asignación de guardas por puesto; control de horarios; validación de cobertura; ausencias o retrasos; historial; vista calendario/agenda.\n- **B · Gestión de personal operativo** (`personal`, Operación): perfil del guarda, estado en turno, ubicación en tiempo real, historial de actividad, asignación a zonas o sedes, disponibilidad, relación con reportes, novedades y tareas.\n- **C · Rondas inteligentes** (`rondas`, Operación): rondas por sede, zona o cliente; puntos de control; tareas por punto; validación por ubicación; evidencia fotográfica; observaciones; control de rondas incompletas; alertas por incumplimiento; historial.\n- **D · Rondas con tareas personalizadas** (`tareas`, Operación): según instalación o riesgo; p. ej. verificar puerta cerrada, revisar perímetro, confirmar iluminación, reportar vehículos sospechosos, validar personal autorizado, tomar foto del punto, formulario de inspección, novedad con evidencia.\n- **E · Formularios dinámicos** (`formularios`, Operación): formularios por operación, cliente, ronda o tipo de novedad; campos de texto, selección, fecha, evidencia, firma o ubicación; validaciones obligatorias; enlazados a reportes y auditoría.\n- **F · Seguimiento en mapa en tiempo real** (`mapa`, Monitoreo): ubicación de guardas, vista por cliente/sede/zona, rutas de ronda, puntos de control, cámaras georreferenciadas, alertas sobre el mapa, historial de recorridos, segmentación por operación.\n- **G · PTT · Push To Talk** (`ptt`, Operación): comunicación inmediata tipo radio digital entre central, supervisores y campo; canales por cliente, sede, zona o equipo; soporte para supervisores; registro de actividad si aplica; integración con eventos o alertas; apoyo a la respuesta coordinada.\n- **H · POT · Acción operativa rápida** (`pot`, Operación): botón de acción rápida (el equivalente operativo a un botón de emergencia o de pánico) para reportar novedad o emergencia, activar una alerta, solicitar apoyo, confirmar presencia o una tarea crítica, activar protocolo; queda asociado a ubicación, usuario y trazabilidad.\n- **I · Central de monitoreo** (`central`, Monitoreo): video wall, monitoreo de cámaras, alertas en tiempo real, seguimiento de eventos, visualización de personal, comunicación con campo, evidencia, priorización de riesgos.\n- **J · Cámaras e IA** (`ia`, Inteligencia): personas (detección, reconocimiento facial contra listas autorizadas/restringidas, caídas, merodeo); vehículos (detección, LPR, clasificación por tipo y color); comportamiento y zonas (cruce de línea, intrusión, ROI, objetos abandonados); industrial (EPP, reglas por cámara, aglomeración, fuego y humo). El detalle de analíticas está en `/vision`.\n- **K · Alertas inteligentes** (`alertas`, Inteligencia): llegan con tipo de evento, prioridad, cámara, zona o sede, guarda relacionado, snapshot, video clip, ubicación, estado de atención e historial de seguimiento.\n- **L · Evidencia y trazabilidad** (`evidencia`, Monitoreo): foto, video, fecha y hora, usuario responsable, ubicación, cámara, historial de cambios, estado y cierre de la novedad, reporte descargable.\n- **M · Reportes e indicadores** (`reportes`, Reportes): cumplimiento de turnos, rondas completadas y fallidas, tiempo de respuesta, novedades por sede, alertas por tipo, eventos por cámara, actividad por guarda, cobertura por cliente, evidencia generada, riesgos recurrentes, reportes por periodo.\n- **N · Multi-cliente · multi-sede · multi-zona** (`multisite`, Reportes): Organización → Cliente → Sede/Zona; Puesto → Cámara → Guarda; Turno → Ronda → Tarea; Evento → Evidencia → Reporte.",
   "h": "5a0c299c8bae7586"
  },
  {
   "id": "kb:plataforma-erp:2",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo › Capturas del producto (`/plataforma#en-movimiento`)",
   "ruta": "/plataforma",
   "texto": "- Central de monitoreo: tablero único con cámaras, alertas y mapa en vivo; vista multipantalla configurable; priorización automática; asignación de operadores por turno.\n- IA por cámara: activar modelos por cámara sin reemplazar hardware; reglas por cámara; varios modelos sobre la misma fuente; edge + cloud según la latencia requerida.\n- Reconocimiento facial: listas blancas y negras por sede, búsqueda forense por rostro, confianza configurable.\n- Lectura de placas (LPR): se muestra en `/vision` y `/laboratorio`, pero no está en el catálogo de servicios; se evalúa caso a caso con el equipo comercial.\n- Intrusión/ROI: reglas perimetrales por cámara, cruce de línea con dirección.\n- EPP: verificación automática, reporte para auditoría SST, alertas a supervisores.\n- Alertas con evidencia: snapshot + clip, estado de atención por operador, cierre con observaciones y firma.",
   "h": "946eb8c3b9a7d324"
  },
  {
   "id": "kb:plataforma-erp:3",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo › Arquitectura operativa (niveles)",
   "ruta": "/plataforma",
   "texto": "Raíz: ARS Intelligence (plataforma) → L1 Clientes (empresas y organizaciones) → L2 Sedes/Zonas (puntos físicos) → L3 Cámaras · Puestos · Guardas (recursos) → L4 Turnos · Rondas · Tareas (actividad programada) → L5 Alertas · Novedades · Formularios (eventos en tiempo real) → L6 Evidencia · Mapa · Central (visualización y respaldo) → L7 Reportes · Indicadores · Decisiones.",
   "h": "c14ac0698c750c53",
   "v": "2RA9+gES6RvH/eD6F8owBgfNzQAkBf7QA/Tm9sP0OtYTFR3hFBYSHycIyuz4AtYLHyPD/iM0/OwF/CsGDOEcMe/0tgj9A/wzAwUn/fotGv3z3OPsJb/e+ODUAhISHCoEKOn6GCW6/8+95ioeAtTp3wYVJAb/4C32GiC6/9/5+f3+5QLyIOn1/yD56/wO9vEPogrZJw4SFRcC/BUBAPoT/RYOAhbz5dj/mjKc/O/w/tL+MQn13Arp6AgIvAHmTvU3LjkV4QMO5PwPGX/19xf8+g3wVfUV+8ARuRjy5uXN7+ngWDioLtT5GfIJIAQH+O7lFRMT7BkMEdwt7zEdERPp8Ojy48kUGQ0EFOYSE9Hh9DAgCugLMND0EPv1LywbAw/P7hgUEAzs7tgm2BEAAxgR3O4QDAYGz/4hN9LWxy7sMdoawv3H6cLxKQjDPtoVDw4A5iIX9QPM2gXx7tmyNjUF2ML80Rb1zOILvuMj7CYLAAoY2he78gb6xgYK2BACDPvdCBm9HenXCBwRwgfhH/ob6gbovRns+xwi5AH+tyox8+oW8voOIggWHP82/xHQ6RMZMRe1Iv3p2TwRCBcnz+fv27vaGCH4KrvVXdkPSRQq+B8Q5tgILgjrORH22Pvx4/j8OPz98jU89TkVJPUXJvUL197Az+3/9e3yMQbcGUfZ/BU="
  },
  {
   "id": "kb:plataforma-erp:4",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo › Flujo de integración: del turno al reporte",
   "ruta": "/plataforma",
   "texto": "1. Inicio de turno (guarda asociado a sede, puesto y horario). 2. Validación de puesto (biometría, ubicación o token operativo). 3. Ronda asignada (ruta, puntos, tareas, horarios). 4. Tareas en campo. 5. Formulario/novedad. 6. Evidencia (foto, video, ubicación, hora). 7. Alerta o seguimiento priorizado hacia la central. 8. Central de monitoreo en vivo. 9. Cierre del evento con observaciones y trazabilidad. 10. Reporte gerencial (indicadores, KPIs, bitácoras).\n\nResultado: «Cero desconexión entre operación humana, IA y supervisión».",
   "h": "1437f22c80f0573d",
   "v": "1Ds3+P4PGzAGJeP2B9scEfPxzzQICOoQ6e7WJcnjItoSAywbDyQWESAg5QUB/t3pSSTD+RQsB/UWBhYA9NUxMeDtuwcS5fUp+wcf8Psn8v3wuOLwGNmv7eHM9B4HKi8CI+31GyrKBtvp3RAfDNAi1gcQE+v070T5HAu0/L388fLVyfzzI+nh/CkWBO7Z7OD6rRz7IxkCAe36CTcR6xYe4f4F7grey+/vgUHE4twO9uTTIxzc1wbo6+LNuR7/X/RWFx4h5AcQyPQLB2UI+Rom6vT7UwYv9ML7wSX+2vnR6f7uXza6KLQJHP/mNQsl8PgH8xT56PYMAtJCAxAhFizt4uvx+tn6Fu0zIv04A+D+ETEhKdQJKb4C+w7+GCokCvb1BCDtMRXHBOs5BQj7ERAE3REg8tks3NIJL/bp3T4HNNoVtvzc8dXyEA3cGcf9CwQb0xcwJuzhzO/55fTTSBIS5NMK0hv27/vz5OUq+BMC9vQU2Tre9ArZz+0T+DIBDvv35C/fLQzpDQ8G3P/ZDwQb8ALewxjeBRIV4/f20icg7tjeCQobMRv9FNIb/fz9vPMJFRLLIgn98hcECgwO2vbmw97kAxb+N7/nQuIKXhYaBkkYHcMJ/SHiHir6yQQO5eP+Nd0I+URX8yTgOBwZFvT83trkwe7f+OftJfvwADLeIhI="
  },
  {
   "id": "kb:plataforma-erp:5",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo › Casos de uso (para armar el tuyo: `/plataforma#arquitecto-ia`)",
   "ruta": "/plataforma",
   "texto": "- **Conjunto residencial**: porterías, rondas perimetrales, novedades, cámaras por torre o zona, alertas por intrusión, reportes al administrador.\n- **Universidad o campus**: múltiples entradas, cámaras por edificio, estudiantes, visitantes y zonas críticas, permanencia o cruce de línea, eventos y reportes.\n- **Centro logístico**: control de acceso vehicular, rondas en bodegas, EPP, zonas restringidas, evidencia ante incidentes.\n- **Empresa de seguridad**: múltiples clientes, programación de turnos, supervisión de guardas, rondas y tareas, reportes automáticos, trazabilidad para facturación o cumplimiento.",
   "h": "47a47fee8e1460f7"
  },
  {
   "id": "kb:plataforma-erp:6",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo › Antes vs. con ARS",
   "ruta": "/plataforma",
   "texto": "Antes: información dispersa entre Excel, WhatsApp y radios; reportes manuales con horas de demora; cámaras desconectadas de la operación; rondas sin trazabilidad; comunicación informal central–campo; poca evidencia ante reclamos; difícil supervisión multisede.\nCon ARS: operación centralizada; turnos y rondas con validación automática; cámaras + IA + personal conectados en tiempo real; evidencia automática por evento; mapa con ubicación viva; PTT con trazabilidad; alertas con contexto; reportes ejecutivos.",
   "h": "3ec63d798d6e9b21",
   "v": "yw40FQ0X/xIEGefvINgiC/rltuUYEt/JCQfB/MTVA78tCPsgMhoh+T0X0vP+8rz8LiSyFxQa+djwDB4DE8csHNnBvSn0EeIrAxgO9Qs6JAbo0Mr6I7DW2wTPGjQJ/kkFF/sIFDbN3t6u7jIYDMNIvuQJA+3Ivl30H/mmD/vv28H8ugTxSPzcIBkFAPkF5M0WmRLYAA4A6wcDAigp2BAZy/kY5t/13c7qgSOt5Pj77KH9CRrC3A/33+zUwvvnOABLLycf5+0xsfwPBE8O7usj+N/hdPo/88vuqTYH1ObS3eS1TD+/PaT/H+0ELt8b7AgQ9wsG2vUk/tc/BBNJByT66Mfo2dr3HQoEL+oxCeEFAEcxEt8EO6z0CwPuFzEqAvHpHfkFGxfZ+9tF9PMCLSzu2wAn0/Pj28IbKNrc4iWnLMkHmM240Lv4ERvL69Q4/AcM2hsq2y3bvgj3+uC/PDwK1O4Z3Q3z6ufs1PgA6R4Z9y0gtSvL0gTzx/I59hfy7wrA6Da9LvDc8zID3fPx9vQb+vv2liD5Kvsw3hEG3TIJJN7pEeUFWSocA+At2ALVuP0aYA3aTt0J0C8JK/wYvcLY+LLZMSncPNHqXeTzdx4ABUku+NXyGSn2OwP9s+z98+XsLvcgEjAs8yncNeMmHvEd1evv5+b74/X+GPi6ETrMBQs="
  },
  {
   "id": "kb:plataforma-erp:7",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo › Prueba social en la página",
   "ruta": "/plataforma",
   "texto": "- Testimonios del equipo de ARS (gerencia y dirección comercial, dirección de IA): demostrar valor desde la primera reunión, activar sitios en menos de 48 horas sobre la infraestructura del cliente, edge + nube sin reemplazar hardware.\n- Sección «Entidades y empresas que confían en nosotros» con logos: UNAD, Universidad de La Sabana, Universidad Militar Nueva Granada, Ministerio de Educación, Ministerio de Transporte, DANE, DIAN, Fiscalía General de la Nación, FNA, Ecopetrol, Repsol, TransMilenio, ALFA, Corferias Bogotá, Mundo Aventura. Puedes mencionar que aparecen en la web; el alcance de cada relación o proyecto es a confirmar con el equipo comercial.",
   "h": "13b4ea162fb4def8",
   "v": "1NQSMf0gsSzh9QbpC7ARKPnZyfocG+n1GN3dEOLFNtn/JfowFgYSChT92s0IL+P3USbKBB4S8vD/Bfr02OMXKuD71iUHEAYsJv37+wAtCL/f1M3v++rDB/QJM/XZDDYADeojQDbj77nW91fxE97r8h07Iwze0kKu/wDnEfnS/O3k7/cQHRTzBQye4gnmstwLk+XYJhwIFCnpHvQG3QwPxP8E4wXzGOXUmzbI2/D+EO8RBzjF7fAiyObgwgXRMBgYKEvz0MgvzPKzAy7/7uDv/+Hhfw0OBuDxqQke9MHh8gIIagyqMLEvHQYO+/Ul/QcB/CAL+wsZCNdVNRE1LgkI6tzp+sf0LuHoCfr7Cv0BCycq+PIhHeDcBv0j7Qf3Ev/ayykzETTw/Okw6QvIACIQAvYSDBMP6N8KNfzGw0CdB/8OyvLc1aYS+AbhGPM2JRULEQ8kBQHb294a8P3jKywJ49ou4PH65c/88hcXBiIH9iUJxAbk+RrX4Ak3FAYX8u/OEfvjDvIFEPEavx4I8dUb0vzlsQnzGv0N4QDljCQX8Br1Lhb6FBL55/kiDgy27+XwVPm1KQARxxPNG/ko2tIS3ebTD9DlGM4BSe4TIScT02gzv8ohXQb+KeQUygbl9esCIvHhGU1bFTH2Kgc6L/TjxQPNv7YJ+uD8IPbH6CcD5BA="
  },
  {
   "id": "kb:plataforma-erp:8",
   "fuente": "kb",
   "titulo": "Plataforma ARS y ERP operativo › Lo que no está en el sitio",
   "ruta": "/plataforma",
   "texto": "Integraciones con marcas concretas de cámaras/NVR, app móvil específica, requisitos de red, hosting, SLA formales, precios y licenciamiento: a confirmar con el equipo comercial.",
   "h": "a4a02a8ce8576d64",
   "v": "yiEh6+cTDPTt/vUACdz4DQIJ4P4dIdLc9vzpD+fkFMgHDO4cGQYVDiol0QP1DMMCAfnWAwUSBtwLCiQT88ctBuzezwvl9/kUGvYR9ONB/ujI+dYCBNTKAPcXFRLz9xcEJ9wRIBG87MjZ3jMCJ+Qy6w77AwTpzwvxIP/eEAb57gL0yQgHQujk9BHp/gcN3fIHvB3O3fcPGfzX8/b++BwD4AcaHhvp/fjuoEzsEO8WEOY3ASbG4wb24+X6pwDqOdUoGygt2NL74d329mc/Ee0MAvbnX987AeMI1gTm8dPR9eX6SRu9OqULMt/9FA746Pj6+PT13Rz5Ec8u/CVDLQcU3djv2MEGK+boI+f9HxcXE/ALB+ogN73+A87v3g0bBz/W4CgMIfEAIt8sHQvwAT8X2sEvAw7kz/7h7MvT3w7yFNYh0Oy5ztX39CzZItoS5BAIDDQR8DXi0CgT8AS/KSv+3ebu9BAo47cG5v0d7gn55wEC0kfb7+nozQop7uoQ+xTs1Q+0DQrs+hTxv/r7Y9Md6OYV0y3kESMdzvv8oDL/3Pn9/Cv1XxIG/Msg+RG30eMVKuTlHc0J8jXwDQoQ3PD68eP16PreEOjpYPfwMPwGBCos3ucEHfnwOQED2PH499r3EBDYDjR/CCzn/98kE/je4QLYxxvl3w70CAbe5hoCESM="
  },
  {
   "id": "kb:servicios-ars:0",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo",
   "ruta": "/servicios",
   "texto": "Página `/servicios`: el catálogo completo de lo que hace ARS, en 10 áreas con una página cada una (`/servicios/<area>`) y un ancla por módulo (`/servicios/<area>#<modulo>`). **El catálogo de módulos (id, área, estado, frase y palabras clave) se incluye por separado**; úsalo para responder y enlazar siempre con el id exacto.",
   "h": "813a629b3c01e38c"
  },
  {
   "id": "kb:servicios-ars:1",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › La idea central",
   "ruta": "/servicios",
   "texto": "ARS no es «un producto de cámaras»: es **el sistema operativo de una empresa de seguridad privada**. En una sola plataforma la empresa contrata, programa, paga y capacita a su gente; la supervisa en campo con GPS, rondas, zonas y reportes con foto, firma, ubicación y hora; se comunica por radio desde el celular con cada transmisión grabada; vigila con cámaras, sensores y acceso facial; responde las emergencias desde una sala de control; le rinde cuentas al cliente con un portal propio; lleva sus clientes, contratos, facturación, costos y contabilidad en el mismo ERP, y puede recorrer su central y una sede de ejemplo en realidad virtual.",
   "h": "39f06f9b931d678d"
  },
  {
   "id": "kb:servicios-ars:2",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › Las 10 áreas",
   "ruta": "/servicios",
   "texto": "- **A · Operación en campo** (`operacion-en-campo`): turnos y programación, asistencia y relevos con selfie y verificación facial, rondas con QR, revistas y reportes de supervisión, visitantes y bicicletas, armas, vehículos y caninos.\n- **B · Centro de operaciones** (`centro-de-operaciones`): Sala de Control con mapa en vivo, zonas con alerta de salida de zona, sala del coordinador, recorridos GPS de supervisores, cumplimiento persona por persona y alias de clientes y sedes.\n- **C · Comunicación y emergencias** (`comunicacion-y-emergencias`): radio PTT en el celular y la web, chat corporativo, conversación con la Central, consola de grabaciones, reporte por sede, botón de pánico y notificaciones.\n- **D · Monitoreo inteligente** (`monitoreo-inteligente`): visión artificial sobre las cámaras existentes, acceso inteligente con listas y consentimientos, IoT, levantamiento 2D/3D de sedes.\n- **E · Realidad virtual** (`realidad-virtual`): Central Viva en 3D, demostración de la Sede Inteligente, Mesa Directiva con directores simulados por IA y Vigía, el asistente de voz.\n- **F · Gestión humana** (`gestion-humana`): selección, colaboradores, nómina desde los turnos, costos, Área Documental con IA, portal documental para el cliente y Jurídica.\n- **G · Formación** (`formacion`): cursos con certificados QR, diseñador de cursos con IA, video por temas, auditoría de reglas y evaluaciones.\n- **H · Finanzas y ERP** (`finanzas-y-erp`): clientes, contratos y planes por módulos, órdenes de servicio, contabilidad conectada, asistente contable con IA, facturas DIAN y RADIAN (en piloto; pasan a producción en los próximos meses), cotizador y CRM propios, y el **Agente interoperador de datos**, que centraliza en ARS o hace fluir la información de los sistemas que la empresa ya tenga.\n- **I · Productividad e IA** (`productividad-e-ia`): tareas, reuniones con transcripción, tickets, formularios dinámicos, automatizaciones y Centro de IA.\n- **J · Gobierno, seguridad y canales** (`gobierno-y-seguridad`): Torre de Control, auditoría, configuración multiempresa, ingreso con cédula y doble factor, app Android, app instalable (PWA) y app de escritorio para la central.",
   "h": "ea87bcae1d1a4224"
  },
  {
   "id": "kb:servicios-ars:3",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › Un día en ARS (cómo se encadenan las áreas)",
   "ruta": "/servicios",
   "texto": "1. **Programar.** Programación arma el mes sobre la estructura Cliente → Sede → Puesto (área A), con las órdenes de servicio vendidas en ARS o en el sistema que la empresa ya usa (área H). Cada vigilante ve su mes en el celular.\n2. **Marcar y supervisar.** El vigilante inicia el turno con selfie y ubicación, hace sus rondas con QR y su minuta; el supervisor recorre su zona y llena revistas con foto y firma (A). El coordinador ve en su sala qué turno quedó sin cubrir y decide quién cubre (B).\n3. **Vigilar y responder.** La Central mira el mapa vivo, las cámaras y sus alertas de IA (B, D), habla por radio y, si alguien presiona el botón de pánico, atiende la emergencia con una ventana que deja la bitácora escrita (C).\n4. **Pagar y rendir cuentas.** Lo trabajado alimenta la nómina (F), los documentos del personal quedan auditados y el cliente los consulta en su portal (F), la contabilidad muestra lo contratado frente a lo facturado (H) y la dirección revisa los indicadores, incluso en la Mesa Directiva en 3D (E). La auditoría (J) deja rastro de las acciones sensibles.",
   "h": "8b564a1138db3573"
  },
  {
   "id": "kb:servicios-ars:3.1",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › Un día en ARS (cómo se encadenan las áreas)",
   "ruta": "/servicios",
   "texto": "Con esto en mente, cuando alguien pregunte por un problema concreto, ubícalo en su paso del día y propone 2–4 módulos del catálogo con su enlace.",
   "h": "d97088a21dd80f0f"
  },
  {
   "id": "kb:servicios-ars:4",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › Por qué ARS (6 pilares)",
   "ruta": "/servicios",
   "texto": "1. **Multiempresa de verdad:** cada empresa con sus clientes, sedes, roles, plan, menú, portada y alias.\n2. **Cada persona ve solo lo que le toca:** permisos por módulo y acción cruzados con el plan; lo no contratado no aparece.\n3. **Multiagentes de IA en cada área:** contamos con multiagentes de inteligencia artificial trabajando dentro de cada área para complementar sus procesos; proponen, revisan y organizan, y la persona decide. Documentos del personal, reuniones y asistentes de nómina, contabilidad y tareas corren en servidores propios; la IA responde con los permisos de quien pregunta.\n4. **Un sistema, cuatro canales y las gafas:** web, app Android (funciona sin señal), app instalable, app de escritorio y Sala VR.\n5. **Trazabilidad de punta a punta:** doble factor, sesiones con IP y ubicación, auditoría con antes y después, registro de consultas de datos personales.\n6. **Agente interoperador de datos:** conecta cualquier sistema, dato u organización con ARS (ver abajo); además, cámaras y grabadores existentes, Telegram, Excel y PDF.",
   "h": "d0bad743880253aa"
  },
  {
   "id": "kb:servicios-ars:5",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › ARS es un ERP, y además se adapta (posicionamiento)",
   "ruta": "/servicios",
   "texto": "Cuando pregunten si ARS es un ERP, si reemplaza su sistema o si «funciona con lo que ya tenemos», el mensaje es este:",
   "h": "2178bd167493ad22"
  },
  {
   "id": "kb:servicios-ars:5.1",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › ARS es un ERP, y además se adapta (posicionamiento)",
   "ruta": "/servicios",
   "texto": "- **ARS es un ERP completo para la empresa de seguridad**: clientes, contratos y planes, órdenes de servicio, nómina (con prima, vacaciones y liquidación de contratos), costos por centro de costo, facturación, contabilidad con asistente de IA, cotizador y CRM, además de toda la operación (turnos, campo, central, documentos, formación). Una empresa puede llevar todo en ARS.\n- **Y además se adapta**: sin importar si la empresa tiene su propio sistema o ya tiene contratados otros, creamos los mecanismos (el Agente interoperador de datos, integraciones y sincronización) para que todo se **centralice en ARS** o **fluya** entre sistemas durante el proceso, según los módulos que contrate.\n- Nunca digas que ARS «no es un ERP», que «no reemplaza el ERP» ni que siempre se acomoda al sistema del cliente: ARS puede ser el ERP de la empresa o convivir con el que ya tiene; lo decide la empresa según los módulos que contrate.\n- Respeta los estados: las facturas electrónicas DIAN y RADIAN están en piloto; el detalle de cada módulo (por ejemplo, que la contabilidad se alimenta del sistema contable que la empresa conecta) sale del catálogo.",
   "h": "e379f94d353f2c37"
  },
  {
   "id": "kb:servicios-ars:6",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › Agente interoperador de datos (cómo explicarlo)",
   "ruta": "/servicios",
   "texto": "Cuando pregunten por integraciones, por el ERP, por migrar información o por «¿funciona con mi sistema?», explica el **Agente interoperador de datos**:",
   "h": "f84e1c64c316508e"
  },
  {
   "id": "kb:servicios-ars:6.1",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › Agente interoperador de datos (cómo explicarlo)",
   "ruta": "/servicios",
   "texto": "- Es un agente de IA que **recopila los datos y los documentos** de la empresa (su sistema propio o los que tenga contratados, bases de datos, Excel, CSV, XML, PDF y documentos escaneados), los **analiza, gestiona, organiza y homologa** (clientes, empleados, contratos, sedes, centros de costo) para que cualquier sistema, dato u organización **interopere fácilmente con ARS**.\n- **Cómo conecta**, en este orden de preferencia: 1) **por API**, con sincronización continua; 2) **por conexión de backend** (servicios o base de datos con permisos controlados) cuando no hay API; 3) si ninguna es posible, **protocolos de carga** programados y validados, con vista previa antes de aplicar. Así la información **se centraliza en ARS o fluye** entre sistemas.\n- **Integración completa o parcial:** ARS es el ERP y **además se adapta a lo que la empresa ya tiene**. Todo puede quedar centralizado en ARS, o ARS puede participar solo en algunas partes del proceso (por ejemplo turnos, nómina, facturación o contabilidad) mientras la información fluye con los demás sistemas, según los módulos que contrate.\n- Enlaza al módulo `/servicios/finanzas-y-erp#agente-interoperador-de-datos`.\n- **Nunca nombres un ERP, proveedor o producto de terceros concreto** (ni el de un cliente). Habla siempre de «el sistema que ya usa la empresa» o «los sistemas que tenga contratados».",
   "h": "63f98d839a35a8a6"
  },
  {
   "id": "kb:servicios-ars:7",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › Multiagentes por área",
   "ruta": "/servicios",
   "texto": "ARS cuenta con **multiagentes de inteligencia artificial trabajando dentro de cada una de las áreas** (campo, centro de operaciones, gestión humana, formación, finanzas, productividad…) para **complementar los procesos**: proponen, revisan, organizan y explican; la persona decide. Preséntalos como un complemento del trabajo del equipo, nunca como un reemplazo.",
   "h": "d28b595ddee8a4da"
  },
  {
   "id": "kb:servicios-ars:8",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › Cómo hablar de los estados",
   "ruta": "/servicios",
   "texto": "Cada módulo tiene un estado y a veces una nota; respétalos al pie de la letra:\n- **vivo** → en producción, se presenta como funcionalidad.\n- **piloto** → «está en piloto»; se puede mostrar en una demo acordada.\n- **proximamente** → «próximamente», sin fecha.\n- **hoja-de-ruta** → «está en nuestra hoja de ruta», sin fecha ni compromiso.\nSi un módulo trae `notaEstado` (por ejemplo «con gafas Meta Quest, en piloto»), menciónala cuando sea relevante.",
   "h": "a3ba48583adfb73c"
  },
  {
   "id": "kb:servicios-ars:9",
   "fuente": "kb",
   "titulo": "Servicios de ARS · el catálogo completo › Guía de lo que no se promete",
   "ruta": "/servicios",
   "texto": "- **Cámaras:** habla solo de las analíticas del catálogo de servicios (intrusión, cruce de línea, merodeo, objetos olvidados, conteo, aforo, mapa de calor, atributos estimados de persona). No ofrezcas en este catálogo lectura de placas, detección de armas, EPP, visión térmica, clasificación vehicular ni detección de fuego o humo; si preguntan, di que se evalúan caso a caso con el equipo comercial y remite a `/vision` para ver su estado. El reconocimiento facial por cámara es una **alerta de personas desconocidas o de una lista, que verifica un operador**, nunca una identificación automática. Las analíticas dependen del equipo instalado en cada sede.\n- **Turnos:** la verificación facial del relevo compara con la foto registrada; no hables de «antisuplantación». Los relojes biométricos ZKTeco se mencionan como **compatibilidad**. El relevo entre empresas es para supervisores de un mismo grupo empresarial.\n- **Radio:** en el teléfono funciona con la app Android, con varios perfiles en un teléfono y manos libres.\n- **Disponibilidad:** no prometas porcentajes de disponibilidad, SLA ni «cero caídas». No menciones certificaciones.\n- **Servidores propios:** dilo para documentos del personal, reuniones y datos de personal; no lo generalices a toda la plataforma.\n- **Realidad virtual:** la Sede Inteligente es una **demostración con datos simulados**; también se vive con gafas Meta Quest y con la app nativa para Quest. Los directores de la Mesa Directiva son **simulados por IA**: no los asocies con personas reales.\n- **Nómina y contabilidad:** son parte del ERP de ARS. Si la empresa ya liquida o contabiliza en otro sistema, el Agente interoperador de datos centraliza esa información en ARS o la hace fluir entre los dos, y ARS muestra las diferencias antes de pagar o cerrar; el módulo de contabilidad se alimenta del sistema contable que la empresa conecta (copia de consulta actualizada cada 15 minutos). No des cifras de coincidencia entre sistemas. Incluyen nómina quincenal, prima, vacaciones y liquidación de contratos. La facturación (líneas, aprobación, prefacturación y validación) está en ARS; la bandeja de facturas electrónicas DIAN y RADIAN está en piloto y pasa a producción en los próximos meses. No afirmes que ARS transmite facturas electrónicas a la DIAN: si lo preguntan, se confirma con el equipo comercial.\n- **Puertas con reconocimiento facial y escaneo 3D de sedes:** disponibles; el reconocimiento facial abre o alerta y una persona verifica.\n- **Cifras:** no des números de usuarios, vigilantes, clientes, sedes, documentos ni porcentajes de uso. No nombres clientes.\n- Si algo no está en el catálogo, di que se confirma con el equipo comercial y ofrece agendar una demo.",
   "h": "a453eda55195005b"
  },
  {
   "id": "kb:arquitectura-erp:0",
   "fuente": "kb",
   "titulo": "Arquitectura de soluciones ARS · la operación sobre un ERP base propio",
   "ruta": "/arquitectura",
   "texto": "Página `/arquitectura`: la vista corporativa completa de ARS. Mensaje central: **ARS no es solo la central ni solo lo operativo** (cámaras con IA, rondas, radio, IoT, realidad virtual: lo que más se ve). Todo eso se apoya en un **ERP base propio de ARS** que lleva la gestión del proceso base de una empresa de seguridad, y todo comparte los mismos datos: lo que pasa en el puesto llega solo a la gestión.",
   "h": "f086b60855b561f0"
  },
  {
   "id": "kb:arquitectura-erp:1",
   "fuente": "kb",
   "titulo": "Arquitectura de soluciones ARS · la operación sobre un ERP base propio › Las cinco capas del diagrama (`#diagrama`)",
   "ruta": "/arquitectura",
   "texto": "1. **Canales**: web, app Android (vigilante y supervisor, aun sin señal), PWA instalable, app de escritorio para la central (Windows) y gafas VR.\n2. **Capa operativa**: operación en campo, centro de operaciones, comunicación y emergencias, monitoreo inteligente (visión artificial e IoT), realidad virtual y el laboratorio (demos de visión IA y la línea de robótica, **en desarrollo, no es un producto comercial**).\n3. **Núcleo de datos e IA**: eventos y evidencia (cada marca, ronda, alerta, transmisión y reporte entra una sola vez, con foto, ubicación y hora), Centro de IA y automatizaciones (automatizaciones en piloto, en modo observación), trazabilidad y auditoría.\n4. **ERP base de ARS**: contratos y clientes, turnos y programación, gestión humana y nómina, gestión documental, formación, cotizador y CRM (**hoja de ruta**), gobierno multiempresa, finanzas y contabilidad, facturas DIAN y RADIAN (**próximamente**).\n5. **Integraciones externas**: las cámaras y grabadores que el cliente ya tiene, relojes biométricos ZKTeco (solo como compatibilidad; en piloto), Telegram (avisos por cliente y zona, en piloto), el ERP de la empresa vía el **Agente interoperador de datos** (API, backend o cargas programadas; completo o por partes) y la DIAN.",
   "h": "7e08f53b055ba797"
  },
  {
   "id": "kb:arquitectura-erp:1.1",
   "fuente": "kb",
   "titulo": "Arquitectura de soluciones ARS · la operación sobre un ERP base propio › Las cinco capas del diagrama (`#diagrama`)",
   "ruta": "/arquitectura",
   "texto": "Vistas del diagrama: **Operativa** (canales, operación y núcleo), **Corporativa (ERP)** (núcleo, ERP e integraciones) e **Integral** (todo). Al tocar un bloque se abre un panel con sus módulos del catálogo, su estado real y el enlace a `/servicios/<area>#<modulo>`.",
   "h": "bcb217120deb6cd1"
  },
  {
   "id": "kb:arquitectura-erp:2",
   "fuente": "kb",
   "titulo": "Arquitectura de soluciones ARS · la operación sobre un ERP base propio › Cómo explicarlo con honestidad",
   "ruta": "/arquitectura",
   "texto": "- La gestión humana, la nómina (desde los turnos realmente trabajados), lo documental, la formación, los turnos, los contratos y el gobierno multiempresa están en ARS.\n- La **contabilidad** es **conectada**: ARS lee el ERP contable de la empresa (copia de solo lectura actualizada cada 15 minutos) y la cruza con la operación —lo contratado frente a lo facturado por cliente, la nómina frente al gasto de personal—. **ARS no obliga a reemplazar el ERP contable**: el Agente interoperador lo conecta.\n- **Facturas DIAN y RADIAN** (bandeja de facturas de proveedores cruzada con la contabilidad): **próximamente**. **Cotizador y CRM propios**: **hoja de ruta**. No prometas fechas.\n- No inventes cifras de clientes, ahorros ni tiempos.",
   "h": "ab64f6aac90fe48f"
  },
  {
   "id": "kb:arquitectura-erp:3",
   "fuente": "kb",
   "titulo": "Arquitectura de soluciones ARS · la operación sobre un ERP base propio › Sigue un dato (`#sigue-un-dato`)",
   "ruta": "/arquitectura",
   "texto": "Recorridos que se iluminan en el diagrama de punta a punta:",
   "h": "8252d5804c0fc500"
  },
  {
   "id": "kb:arquitectura-erp:3.1",
   "fuente": "kb",
   "titulo": "Arquitectura de soluciones ARS · la operación sobre un ERP base propio › Sigue un dato (`#sigue-un-dato`)",
   "ruta": "/arquitectura",
   "texto": "1. **De la marcación a la contabilidad**: app Android → marcación con selfie y verificación facial → turno realizado frente a lo programado → nómina desde los turnos reales → contabilidad conectada (nómina frente al gasto de personal) → cuadre con el ERP contable de la empresa.\n2. **De la alerta de cámara al informe**: cámara existente → visión artificial (alerta con foto, video y ubicación) → Sala de Control confirma o escala → radio PTT al supervisor (grabado) → evidencia en la galería forense con reportes por cliente → auditoría.\n3. **Del contrato nuevo al mes facturado**: orden de servicio desde el ERP → cliente, contrato y plan → programación del mes → selección y contratación → cursos con certificado QR → portal documental del cliente → lo contratado frente a lo facturado.\n4. **Factura de proveedor, de la DIAN a la contabilidad** (próximamente): DIAN → bandeja de facturas y eventos RADIAN → comparación con lo contabilizado → ERP contable como libro de referencia.",
   "h": "5a91a224b63c56db"
  },
  {
   "id": "kb:arquitectura-erp:4",
   "fuente": "kb",
   "titulo": "Arquitectura de soluciones ARS · la operación sobre un ERP base propio › Por qué un ERP propio (`#por-que-erp`)",
   "ruta": "/arquitectura",
   "texto": "Una sola fuente de verdad, cero doble digitación, trazabilidad de punta a punta y multiempresa de verdad. La página incluye la tabla **«ARS frente a herramientas sueltas»** con el estado real de cada módulo (incluye las filas que aún no están en producción). Cierre (`#cierre`): solicitar demo en `/#contacto` o ver `/servicios`.",
   "h": "261baeefa36c5710"
  },
  {
   "id": "kb:vision-analiticas:0",
   "fuente": "kb",
   "titulo": "Módulo de Visión · Analíticas de video",
   "ruta": "/vision",
   "texto": "Página `/vision`: «Cada analítica, vista funcionando». El catálogo proviene del portafolio «Analíticas en 3D · Vigías». **El catálogo completo de las 45 analíticas (id, nombre, familia, estado, descripción corta) se incluye por separado al final de esta base de conocimiento**; úsalo para responder y enlazar siempre con el id exacto: `/vision#<id>`.",
   "h": "8950295c33f65ac4",
   "v": "9T7w2uMY6eMH8zLQM7oePgYGBigK2dcQD/DxDRjpIs8J8Njn+BoKDTso+RkJ6vn7+R3iB+tqGeLi//4E8/giHRfzmCzq2RUb8fz7CNIj3a8INcX7FfP0DAA31CjQEgE1F9/nLwno/+n9Cx/8/Pn90B8tMBQH/yHOxgUc1/zdGuna2QvlF8n63wHu30MT9kIM2f0WFTPv6P3b6Obh+tH17wbeHRHvIM4IqwzqJ/7gCOzl7wAA4Rf23SAF1PHpCeQzEjwn6toLC+rVHDrm3BHxDLjnTvNPFu8b5SPyG9ft//EGLzK48NANFQQL6+4FFue7Kwn1OPEfA8IIPk0s6usZ878cAvYWDMPW1AME+f4E+B0YAegYGPD4HAL8+UfsH+wVzg0IBBfG90cd7CURCvou9PpOJwjw/wrb6OPVxk32Gfr41Pjdt9TPCEjNRvDwGNvACCDr6NzYudYmHCH2HfQguvPq/A/t8NUW4fF0CyUL4+c3zxrY/7TnzvwM8RXlJ+/gHdQJMNzn7djM1/77QeokIfkKzQnQMwMqC+oOoh8CEtMYBQtLJBP++8oZNxXnzdk9Qv337ifzB/7dE8T31eUKAfu7FDS+KcvvEcT9FOos+S9A+cr4G/QvLf7u7hTZxejlJATvBix/5+UvBdD8/PLnG7zTGQ8rFfIIFvsazgYY/CA="
  },
  {
   "id": "kb:vision-analiticas:1",
   "fuente": "kb",
   "titulo": "Módulo de Visión · Analíticas de video › Cómo se presenta cada analítica",
   "ruta": "/vision",
   "texto": "- **Simulación 3D**: la cámara ya instalada, lo que ve y el momento exacto en que avisa; cada simulación recorre fases con estados Vigilando → Detectando → Alerta → Resuelto.\n- **Prueba real**: cuando existe, video o imagen real procesado por los modelos (CCTV del dataset MEVA bajo CC BY 4.0, Pexels y Mixkit con licencia comercial, o laboratorio propio), «sin retoques». Si no existe, se muestra «Video real en producción».\n- **Cómo se activa**: los pasos iluminados al ritmo de la simulación.\n- Recursos: presentación 3D completa (`/analiticas-3d/index.html`) y PowerPoint descargable del portafolio (`/analiticas-3d/Portafolio-Analiticas-Vigias.pptx`).",
   "h": "6c4e5ad4b065aaf2",
   "v": "ADP95t8LGvwdEjHtC78dIPUC9BoFCvUNGND5EBUOD+DS4vQH0BnhDUggxwoI8Qn65C/hKA1E/skDCf7vDAIYMg7PrCoQ5iEVEBfjJ/L58eL59dwR8ujM5Oob7yrbEh9EEdgSKgQK9vD/7RwP6PxF6SImMwcP6Ra5vAUM2xXkI+/T/OEFH+AI3vwQ1TsO8gwk5wr/Gyr89wbg/u7+8AD76Pjm9wnQD+YJtAwgDQrUKfgB2hXjyxHhBvcJ7wfkMcoc/yUo8ugWAeLsGGTdHwEaCsAfTeFM9uEt5Sb/MeH+EvvzHy/HJL74BwUeB+Ub9/vzIyX+BRMp9dwVGzkC1AcRDLUX3OMOC8HC7Azx6hcF9QMINu4aI/ANGujv+DvqIQTzyvIs5v3k+B8VD/UBBtoOF9FQ6vcB3eLiANbkxzXtGePt0/HTttb3DjzPHwP77wPUARLm6sPSxQI+DRLSLgUUt/YCBhrpDeQB5xNgHBsbzAUr4x/kCPPixigP+AP0CN/Z7/PrDPkD4OjU8e8TRwEvGQvuxQD9LiwREQAqrh3l7vwHARszEfPoGMInNQjx091ARxwF8gbN8Qvj97nzAfPl9fbT/zbeINfeLNP5COMv9zAjFu/yMP0RCiTo6vT6yeAGLwHtEiF/6uYhE+74FPMG/sfdGR0zBgv2Ge787xUp6Qo="
  },
  {
   "id": "kb:vision-analiticas:2",
   "fuente": "kb",
   "titulo": "Módulo de Visión · Analíticas de video › Mensaje clave: sin equipo nuevo",
   "ruta": "/vision",
   "texto": "«45 analíticas. Las mismas cámaras.» Según la página, todo corre en el propio servidor del sitio, sobre el circuito de cámaras ya instalado («0 equipos nuevos»). La compatibilidad concreta con cada cámara o servidor del cliente se valida en la demo: a confirmar con el equipo comercial.",
   "h": "3f203c155881111b",
   "v": "Fyf00voPGQH44SHS8eX2Dd/85hop5/b0K973GxnU99QLCu/08QUD8z8p4fbW59MI3RztFRROAvPuEgIMIeMjECrT1RP+EOrtFvTPG+//8c3tJcMEGfTt7Ac480rsAhAdMujzMiXA3N/k8xbv5/Yi1h8MEg4W7ATc5w/y/A/XEOvHyj3lJeMA+RTryzg21fr49iH49y7n/AvQ+8MD/PXc9fYFDRHRHw7nwAUJEQf2E+sG0gsA4ikg8OsH5x35A8QSAzAz2Ovc/eLUAlYH/u00BsoSUBI8AN4LsgXzDM0FAvfwOi/w9b0PBeAMK/8cCOjoD/0AFvT/7PAhEyYp5+UoDa7p+fwHEsrV/QAT6wIi+xf9HAIgKeTzCszt6DL95wcY3yccFvgP+iMVH+Lw9hIl0dtBAxzs594H0RPz7yDgMtvnvNzju+ng8k70FfEZFufX+g/k4/3m5/JFEhjhKf8awhTVEAkVGNIQ8/5LADIp0Akc2w3g/9/w3x4f3RTi/h7o/AXiFODm3fHPyAgpSdgb//0U0hf1KQgP8ggbpSr17Noi7wQmHgbKFuEMGvvb5dsOLwHyC9rn8gX0HMfs7e/aDRba7SDoDK/UQ+brHOsF5D85E+cFFfAyI/3x3ujw+uvz+fzc6xR/9f0R89Qj+fTx5dfm4xYM/+UQCffk3/XmDhE="
  },
  {
   "id": "kb:vision-analiticas:3",
   "fuente": "kb",
   "titulo": "Módulo de Visión · Analíticas de video › Las 4 familias",
   "ruta": "/vision",
   "texto": "1. **Comercial y comportamental** (`comercial`, 7 analíticas) — «Quién entra, qué mira y cuánto se queda. Las cifras con las que se decide la tienda.» Seguimiento de personas, conteo, demografía, mapa de calor, permanencia, cruce de líneas, comprador activo. Para retail, centros comerciales, marketing y operación de tienda.\n2. **Operativo y de eficiencia** (`operativo`, 9) — «Filas, aforo, parqueadero, personal y piso limpio: la operación del día, medida sola.» Listas blancas, filas y cajas, aforo, placas y parqueo, detección de personal, derrames, guardián de puestos, apertura de tienda, cierre de puerta sin autorización.\n3. **Prevención y riesgo** (`prevencion`, 16) — «Lo que tiene que avisar en el acto: intrusos, armas, caídas, peleas, fuego y hurto.» Listas negras, merodeo, intrusión, acceso no autorizado, aglomeración, EPP, caídas, hurto, ocultamiento de producto, armas de fuego, armas blancas, peleas, humo y fuego, abandono de objetos, ocultamiento de rostro, retiro de activos.\n4. **Modelos lite · bajo costo** (`lite`, 13) — «Analíticas livianas sobre una sola cámara: góndolas, bodega, puertas, autopago.» Verificación de etiqueta, canastillas y cajas, puertas abiertas/cerradas, huecos en góndola, producto vencido, vencimiento y destrucción, bodega, sobrecarga en racks, pasillos libres, exhibición vs. planograma, trazabilidad góndola–caja, validación de autopago, zona ciega.",
   "h": "6f3ce419f60d15ed",
   "v": "7Vj3wvwA5wfrBkjiEM8ZFPUAzzsdANrrIvLsAA/SK9T2993J4iceCC874NkF+w3n3yGtJQY66vDF+0//H74oFP0AtSAB4RP1CPz5HeL+zPQVGO8oFOTHCuIMvyTgEyMJB8fwDw/hC9b92v704w0n0xU+ORD+Bhy70hgizggDJujpuxHhAcn0BDAIzTkP3kcb2f0VBST6M/LV1vPgBgf0uB/bASrJHu3vjhQQOha73NjVxu7hvgDzyzbv2ObxHcMmHklA4O8XAPTk9mbbCP7/F7gbUfdEEq847R/9dQIIEev4Qz6k+q8WM+YV/uEU/eO+MTnxEAE44bYNHD4Rw+wK3wr61i0XB9TiBfMZAN3wEwsXLPXyEd39DMUCGSj4H+YAuT4e6Pa+GP8b2vAV/ggCxOpECAf51+ABG9jEvE3iPfPuvP384+HCEU29IvMWIeDSAE3gCPCv1+I8DEEHHA8Wr/sI3TLz4vIW6BN/CzH33uYr1FLIAdbbuvQtDQ7+J/YELvbrJ9b30P7QAd71WAYaKwTxqhzLRg0fDPw1sSgV+cokERcxMdT68Zc1J+u0vt0pTQfXvgsj8PLZCOf46dPJ+QiuCkKbMK3aMrIF9/c7Ajg1M7vpUSEdK/zv6/z95PH1I+zc8BZm9w0n9MgSKu3pGvDVCvU68+0XL94Pz/n28ws="
  },
  {
   "id": "kb:vision-analiticas:4",
   "fuente": "kb",
   "titulo": "Módulo de Visión · Analíticas de video › Estado de madurez",
   "ruta": "/vision",
   "texto": "Todas las analíticas del portafolio están disponibles. Algunas muestran además un sello del equipo de Visión («funcionando a diario», «funcionando en silencio», «listo para instalar», «con evidencia»). Lo que sí depende de cada sede es el equipo instalado: cámaras, resolución e iluminación se confirman en la visita técnica.",
   "h": "57cd16173b658d4c"
  },
  {
   "id": "kb:vision-analiticas:5",
   "fuente": "kb",
   "titulo": "Módulo de Visión · Analíticas de video › Cómo recomendar",
   "ruta": "/vision",
   "texto": "- Pregunta el sector y el problema (pérdidas, filas, seguridad perimetral, EPP, inventario…) y propone 2–4 analíticas del catálogo con su enlace `/vision#<id>`.\n- Retail/tienda: `calor`, `conteo`, `permanencia`, `filas`, `huecos`, `hurto`, `autopago`, `trazabilidad`.\n- Industrial/logística: `epp`, `intrusion`, `placas`, `racks`, `pasillos`, `bodega`, `fuego`.\n- Perímetro/seguridad física: `intrusion`, `merodeo`, `acceso`, `negras`, `armas`, `abandono`, `peleas`.\n- Presupuesto ajustado o una sola cámara: familia `lite`.\n- Para ver modelos funcionando con su propia cámara, sugiere también `/laboratorio`.",
   "h": "caacbc971ca983fd",
   "v": "BBv21eYH9gkJDyXkDbwbBwMT4EzqGcz0Cd0NGS3aFNTOzcn24zsLD0Et7+kI4+8E7vj0GvJOEObd5TAPHfMrKRX8uBn95QnoD+oBH/EH6O34GdYj/vHK2u4H4SP2/u87JbcIK/vc9soJ8RcBCgg+zhcxLP/5ByW90xcc4ODXAdry5hLsJeT95TsC5SwY2xID1PMR8SoQ+unD1eb07d3jvPH2+zHEJtMEtCbmNkDlFQD53gPctvT44zn3w/zeHtgjBDgl3eT6Ed3LB3gPBwkDIsEQOfJNFOsqBBTrMdDoEuAMREKz/bXxHvsREf8LAenMMR76BhMe/MQIKiQuB+cg2sT0teczIuHlBOPo2ggiBPoAM/0WGN0ADK/1/EwGG/L33jMTANHi/wf7DQQQ/P8U3PA8EQjj6//p//DfzEHGJdkAzQXayt73CTfJGRcFAuHVIhvh9f/d1Ok4HzIRPxP71fXR7SXg7dYP5w1/DkIB788XzSbc68vkxCEvBzX/HAYCGOftK/Hd5O7C5NwMRfscMe0FwCHWORQ/FeklkS0Y9ugxCgIlQQfuBccz+v/av+UvVQcMxxH5FOnlGdYI6OX5+/bfAym2QN3ZSdTzEO4tNT89LbzmGPw4PBHh4Ar28vLtDP3kAxpo/fol99MIEvLlAsroGiEa3/MNBhATzBH57xA="
  },
  {
   "id": "kb:segun-tamano-empresa:0",
   "fuente": "kb",
   "titulo": "Cómo opera ARS según el tamaño de la empresa (orientativo)",
   "ruta": "/plataforma",
   "texto": "**Importante**: el sitio no publica planes ni paquetes por tamaño de empresa. Lo que sigue es una orientación derivada de lo que sí muestra el sitio (casos de uso, familia de modelos lite, arquitectura multisede y proyectos de referencia por sector). Preséntalo siempre como orientativo y aclara que el alcance, los módulos incluidos y el costo de cada caso son a confirmar con el equipo comercial.",
   "h": "56b0207712a1150c"
  },
  {
   "id": "kb:segun-tamano-empresa:1",
   "fuente": "kb",
   "titulo": "Cómo opera ARS según el tamaño de la empresa (orientativo) › Principios comunes a cualquier tamaño",
   "ruta": "/plataforma",
   "texto": "- Se parte de la infraestructura existente: cámaras, NVRs, guardas y sistemas actuales, sin reemplazar hardware.\n- Los modelos se activan por cámara, con reglas por cámara, y pueden correr en edge o nube según la latencia requerida.\n- La IA apoya al equipo humano; las alertas llegan con evidencia a quien opera.\n- La misma plataforma escala por niveles: Cliente → Sede/Zona → Cámaras/Puestos/Guardas → Turnos/Rondas → Alertas → Evidencia → Reportes.",
   "h": "fddf79b6628b3c4d",
   "v": "3Bc39/YT8gniHdgDEuofA/Dvvc0BKOnWFO/YIwHtHtrk9AUJA/4nIDYYutvl6+ED4yTcBgAiAu4LCCkfFuMpEff21icF/f8ZAPkPDfYVCRj47PcNIs7L4N/yJjEI8BsTSeIfCATIEN3o0Rz7EvktyR0WBgEIDy7yIwnKEfv37vvk3QQALf8C7BLi+RIX7tYIxP3cBRg2BfvUA/4j2vb/4vUU6QTcB9HmsSvjAwrgId72+yze5hb34fn0uADfJPwe/yA47/MM//cG8n8HBgQkBe3rOAIo+8nmtRPy/OHf2ubKMyivN7/oF/MMA/0J6/Pq8RsC2gYGEuAdD/4kHhDz98wA5dwQG//kI9cE7gUiDyTl6PElQe/7LNYDISgn7vvBDPkgEubgBPEQDgH/DDQH2dMp1Q3/4AwKEe7kyizZJuAZ0fnG1Ocr5hTXIvcgBgHV6BYV7PfJ3A/4BNOzRysH5cLb8C0LztL6vedAAQ0N5CYs6S/q7ezxzhgP+B31D/zzABnRGujT6xjx7eTqM+IK9BwNxhXyHCAx5A8qvUoW7QkEAewAJ+/rCvoi5CXc8QscGe7nD/rw/CMSCf/y+wDk9tnZ5RHcQtviavMLNA8J+SsqCe4I9g4bDArq9swC6uwMHdwTAR1a60I4J+cSI/YW3wbi1P0ADPIB6hH6ESDVBhg="
  },
  {
   "id": "kb:segun-tamano-empresa:2",
   "fuente": "kb",
   "titulo": "Cómo opera ARS según el tamaño de la empresa (orientativo) › Empresa pequeña (una sede, pocas cámaras) — orientativo",
   "ruta": "/plataforma",
   "texto": "- Punto de entrada natural: **modelos lite · bajo costo**, analíticas livianas sobre una sola cámara (góndola, bodega, puertas, autopago). Ejemplos: `huecos`, `puertas`, `fleje`, `canastillas`, `vencido`, `autopago`, `zonaCiega`.\n- Analíticas puntuales de alto impacto sobre las cámaras que ya tiene: `conteo`, `intrusion`, `apertura`, `cierre`.\n- Perfil típico por casos del sitio: tienda, conjunto residencial pequeño, local comercial.\n- Plataforma: alertas con evidencia y reportes básicos; turnos y rondas si tiene vigilancia propia o contratada.",
   "h": "653508e0e1573d34",
   "v": "4Qs09+wQ0Pj7AM7xEssXK/Lys+kVL7vJKPrIAArnGdEL7dQKCA9NAS0pyc/87d73/Qi2CR0d8Mzn80APEtExDAIFvk3z/AUdAfwaCvkT+BT29c4aG7/P6N3uBiQgATwWFd0SCSbRIr3e4R35EPBDxwc1FQT3GyXbIg3sDQAH4/npv/jkGuj1+Rr14B0b8e4YqgnaDzEjDATa7A4k8+X2zgsB1hDMFM3omy7NDATiEMzg8gv2zBIZ1xflxQjlBuwVHjIo5Osh5v32838U4PQmEfT4VwAkDdIN0hUJDOPx7O/PVBeqRJv7GewG/SAF4ebgAgwF1hQF+LwbFAwiABn29Mrz5MAtGArpGcoL/gEP9yX9CvQcMtMBGtkDCDsgCAG+ADI2/ObPANYX1/HdJDYHwfQb2AP00uoYANXZ3iDdN9gXreXD3+0W9x6+IOMnMP/R/wUbAgXf0BIR+AfyQCYG4MT46ygezs8T2etFBxEV7Agi20jd6OP5zBQeEAT9HOj0BfrgOtXU6BIG0uryQf/50xTzpw/XMSAlBgsvxEYn4e0f++sFJNroFtsw2yjE2hgbC/jN8vnx8/7qH/IW3t/k2trN4R7FPOfpZuoKNwENESsyB8TmCxsjGg7+2u/47vICLtwIECF0/lMiGdoZMvEdDuXG4+347f0X+g7sAyDI7Rc="
  },
  {
   "id": "kb:segun-tamano-empresa:3",
   "fuente": "kb",
   "titulo": "Cómo opera ARS según el tamaño de la empresa (orientativo) › Empresa mediana (varias sedes o una sede grande) — orientativo",
   "ruta": "/plataforma",
   "texto": "- Combinación de plataforma operativa + analíticas por familia: control de turnos, rondas inteligentes con tareas, formularios dinámicos, central de monitoreo, mapa en tiempo real y PTT.\n- Analíticas según el negocio: retail (`calor`, `filas`, `aforo`, `hurto`), logística (`placas`, `epp`, `racks`, `pasillos`), campus (`acceso`, `merodeo`, `cruce`).\n- Perfil típico por casos del sitio: universidad o campus, centro logístico, conjunto residencial con varias torres, cadena de tiendas.\n- Reportes por sede y comparativos (cumplimiento de rondas, tiempos de respuesta, novedades por sede).",
   "h": "a52cde8da222dea0",
   "v": "3RpM+QEr2PXxBbLaEcwRE/7csd0XDsLXKBDWC/jnGs0h/O4IIyJTHxguzOML79brKxG3/RcK6OT/CXDzGMgtCOQUuDLk5O5OBvorA+wW+QIH4OANKZvk4OPo+RYQJULnLPEAGiDCDeHg4iIQJNUp4hw1IgL78DjsGfzlEuYa9/zl0drl8tT46hIG/xby/+8MnAfrIR0uAfrXAi0M3eMRsRILuQjy98D6gSau1PzpGrLMAhIJyhH4y/jxufIRL/seQDsNz/0cvvEC+3v52fAY8/v2XRQnM9/jsx0FBPfuwvW9biqYQaMYJvsPDAcL8+HYBRwR1xL98b0rGPMc6xXq8tUJ+sjzQPH8F/AgBPL1+Sn7CRceON/dAt35EDspCwfV4yU4C/qv9+spyvTyFRsVuRwR0QIi4dcwJtnEwzfbNNwqwQTr89kS+QPHJOYnPxLw7RYe8ufb1+3p1t7rRykXzdQK6gUYytEO2O0lBRwM9is4zErc3vj7wxAu5xj0Iu3WAwLiSMnF4R4kxPTwMff/1CLctfTsHSIZ4g0hvD45C94TBO4L/+j3CuMR9Seq/QI2GO2yKfwE9gL/JAf4vez97bvT8znXZcz0Y+ERVzAYCgYY/N3oAgsjHQnr3ADb1fEAJscDFyp4I2kIQ+UbLPIYFt3KxOMW/vEQJhPV/ivH4xA="
  },
  {
   "id": "kb:segun-tamano-empresa:4",
   "fuente": "kb",
   "titulo": "Cómo opera ARS según el tamaño de la empresa (orientativo) › Empresa grande / multi-cliente — orientativo",
   "ruta": "/plataforma",
   "texto": "- Arquitectura **multi-cliente · multi-sede · multi-zona** completa, central de monitoreo con video wall, priorización de riesgos y operadores por turno.\n- Empresas de seguridad que gestionan muchos clientes: programación de turnos, supervisión de guardas, reportes automáticos y trazabilidad para facturación o cumplimiento.\n- Analíticas de prevención y riesgo de alto valor: `negras`, `armas`, `aglomeracion`, `caidas`, `fuego`, `abandono`, y alertas de rostros contra listas que verifica un operador (la lectura de placas se evalúa caso a caso con el equipo comercial).\n- Proyectos de referencia en `/proyectos`: redes de sedes públicas, transporte masivo, energía, recintos de eventos y back-office de empresas de seguridad. Son casos de referencia sin cifras; no inventes escalas ni cantidades.",
   "h": "ce09e79e63519e1c"
  },
  {
   "id": "kb:segun-tamano-empresa:5",
   "fuente": "kb",
   "titulo": "Cómo opera ARS según el tamaño de la empresa (orientativo) › Qué preguntar al visitante para orientar",
   "ruta": "/plataforma",
   "texto": "1. Sector y tipo de instalación. 2. Número aproximado de sedes y cámaras. 3. Si ya tiene NVR/grabadores y vigilancia física. 4. El problema principal (pérdidas, filas, intrusión, EPP, control de guardas, reportes). 5. Si necesita gestión de turnos y rondas o solo analíticas de video.\n\nCon esas respuestas propone una ruta: analíticas concretas en `/vision#<id>`, la plataforma en `/plataforma#recorrido` (o a su medida en `/plataforma#arquitecto-ia`), el diagnóstico completo en `/diagnostico` y cierre con demo en `/#contacto`.",
   "h": "b213ed44fbe99070"
  },
  {
   "id": "kb:proyectos:0",
   "fuente": "kb",
   "titulo": "Proyectos por sector y ciudad",
   "ruta": "/proyectos",
   "texto": "Página `/proyectos`: «La plataforma, operando en terreno». Muestra cómo se combina el catálogo de servicios según el tipo de cliente, con un mapa de Colombia y Perú, filtros y una ficha por proyecto. Los datos viven en `src/data/proyectos`.",
   "h": "7de32559a7e1ad28"
  },
  {
   "id": "kb:proyectos:1",
   "fuente": "kb",
   "titulo": "Proyectos por sector y ciudad › Cómo se usa",
   "ruta": "/proyectos",
   "texto": "- **Mapa** (`#mapa`): un marcador por ciudad con su número de proyectos; tocar una ciudad filtra los casos y volver a tocarla quita el filtro.\n- **Filtros**: estado (En operación, Piloto, En desarrollo), país (Colombia, Perú) y área de servicio (las 10 áreas del catálogo).\n- **Ficha**: se abre desde cada tarjeta y tiene enlace propio (`/proyectos#<id>`). Muestra cliente (tipo, sin nombre), sector, ciudad, escala, el reto, cómo se resolvió, lo que cambia y la lista de **módulos del catálogo**, cada uno enlazado a `/servicios/<area>#<modulo>`. Cierra con «Hacer el diagnóstico» (`/diagnostico`), «Quiero algo así» (WhatsApp) y «Ver la plataforma» (`/plataforma`).\n- **Cómo empieza un proyecto** (`#como-empieza`): diagnóstico → piloto en una sede → operación y escala.",
   "h": "d7977772ed5b6d4e"
  },
  {
   "id": "kb:proyectos:2",
   "fuente": "kb",
   "titulo": "Proyectos por sector y ciudad › Los proyectos",
   "ruta": "/proyectos",
   "texto": "- `campus-universitario` · Universidad privada · Bogotá · En operación: rondas con QR, asistencia y relevos, visitantes y bicicletas, visión artificial, Sala de Control, botón de pánico.\n- `red-de-sedes-publicas` · Entidad pública del orden nacional · Bogotá · En operación: programación, acceso inteligente, reporte por sede, portal documental para el cliente, auditoría.\n- `instalaciones-industriales` · Compañía del sector energético · Medellín · En operación: recorridos y tiempo en el puesto, zonas y salida de zona, radio PTT, botón de pánico, recursos operativos.\n- `estaciones-de-transporte` · Sistema de transporte masivo · Bogotá · En operación: sala del coordinador, cumplimiento, radio PTT, consola de radio, visión artificial (conteo y aforo), notificaciones.\n- `recinto-de-eventos` · Recinto ferial y de eventos · Bogotá · En operación: programación, visitantes, visión artificial (aforo y mapa de calor), chat corporativo, reportes con foto.\n- `oficinas-corporativas` · Grupo corporativo · Lima · En operación: puertas con reconocimiento facial, acceso inteligente, IoT, Sala de Control, app de escritorio.\n- `back-office-conectado` · Empresa de seguridad privada · Cali · **Piloto** (incluye Facturas DIAN y RADIAN, en piloto): nómina, Agente interoperador de datos, contabilidad conectada, auditoría de Gestión Humana.\n- `formacion-del-personal` · Empresa de seguridad privada · Barranquilla · En operación: capacitación virtual con certificados QR, diseñador de cursos con IA, evaluaciones, Central Viva en VR.\n- `verificacion-con-robot` · Laboratorio ARS · Bogotá · **En desarrollo**: perros robot que verifican con las mismas analíticas y envían video a la central. No es un producto: no des fechas, modelos ni marcas.",
   "h": "ae668abb4196ac29"
  },
  {
   "id": "kb:proyectos:3",
   "fuente": "kb",
   "titulo": "Proyectos por sector y ciudad › Cautela",
   "ruta": "/proyectos",
   "texto": "- Todas las fichas están marcadas como **«Caso de referencia»**: describen operaciones reales de la plataforma, pero el cliente, la ciudad y la escala están pendientes de validación. No nombres clientes ni digas que una entidad concreta es cliente.\n- No hay cifras de proyectos (cámaras, sedes, vigilantes, disponibilidad). Si las piden, di que el detalle se confirma con el equipo comercial e invita al diagnóstico o a una demo.\n- Si preguntan por su sector, recomienda la ficha más parecida con su enlace (`/proyectos#<id>`) y 2–4 módulos del catálogo.",
   "h": "3fe4564a3b606bb1"
  },
  {
   "id": "kb:laboratorio:0",
   "fuente": "kb",
   "titulo": "Laboratorio y Vision Lab (demos de IA) › `/laboratorio` — «Probá la IA con tus propios ojos»",
   "ruta": "/laboratorio",
   "texto": "Cada modelo que ofrece ARS se puede ver en acción: detección de personas, lectura de placas, EPP, caídas, intrusión, fuego, aglomeración y más. Filtro por categoría (Todas, Personas, Vehículos, Industrial, Perímetro, Operación). Al elegir una capacidad, el escenario `#demo-stage` ofrece tres pestañas: **Ejemplo** (escena ilustrativa con detecciones animadas), **Cámara en vivo** (webcam del visitante) y **Subir video**. La detección corre en tiempo real en el navegador, sin enviar el video a ningún servidor; en producción los modelos avanzados corren sobre las cámaras conectadas a ARS. Cierre: «¿Querés probarlo sobre tus cámaras reales?» → Solicitar demo guiada (activación en menos de 48 horas, sin reemplazar hardware, según la página).",
   "h": "d2e57b0e3dda19cb",
   "v": "5wf0AvLd4RoADQXMHsn+FdUS3h33CtXiEcf4IwLnANjh9OIc//3m7SUR6wnoAvbl+RLE/fZB7PDQEQv7HQsNGOjtvzbpABXq/uPmGuMm7/r48uYNDePJ4vALEhL4/jYoJNYkOyfa8uj07CIR8gEb0hcPH/wY1xWv7CAK8h68IMnv9/4MLu3o6wje0TAR3vUL0xD0AisdAAfb8OH+1wHY3QHw6QjSPvQBoxvhKAr19vYY9xfY1AT66d/j5vTZEf8bHkc51/MUEPjuCUX+CCItEvIATwhKAe8H5ADpIbPsBfP3IDPIINzyHgIKI/sL6e7fEBQL5h0KB+EqCwcUDeMgGLwC1cYMJO7iHe8BCvD3FxMLGuIiPfUONd0UEgjsD+G+2Acx/iv0CQEzFfjkC/E369w28BsF2toECgLn0SzsOtr52ezardERBQu4FwQDDTHY+BH/B+4DxR4p+yfIIwDz3tr08xbg4fP85RFREAP49f84vy3MEN7xyiQVBB3rCvfwCfXqMO/fAtncyQ79NQIBC+sGyQMDGx81G/AjkioL5Rgw5wQdJfDt7vcpJxLl5uAaMRHXAPrg3QIQFeP77O/iA9zW7fjVKufVOfEeHAMQ71E6GvQRHAL9CPHo1er08PLm+grsCxt/1+j8CtoNCvMT7+3v9xYSx+UK7QL++h314RU="
  },
  {
   "id": "kb:laboratorio:0.1",
   "fuente": "kb",
   "titulo": "Laboratorio y Vision Lab (demos de IA) › `/laboratorio` — «Probá la IA con tus propios ojos»",
   "ruta": "/laboratorio",
   "texto": "Las 13 capacidades del laboratorio:\n- **Reconocimiento facial** (Personas): listas de interés y búsqueda histórica por rostro; accesos restringidos, watchlist, conteo de visitantes únicos.\n- **Lectura de placas (LPR)** (Vehículos): carros, motos y tracto-camiones; listas blancas/negras; entradas y salidas; parqueaderos, patios, puertos.\n- **Detección de armas** (Perímetro): pistola, cuchillo, fusil; alerta inmediata con evidencia; accesos, bancos, retail, educación.\n- **EPP** (Industrial): casco, chaleco reflectivo, guantes, gafas; auditoría SST y no-conformidades.\n- **Intrusión y cruce de línea** (Perímetro): ROI por cámara con horarios, tipos de objeto y severidad; alertas al CCO.\n- **Análisis de comportamiento** (Personas): peleas, merodeo, abandono de objetos, aglomeración inusual.\n- **Conteo de personas** (Personas): entradas/salidas, mapas de calor, picos, permanencia, reportes históricos.\n- **Visión térmica** (Perímetro): perímetros nocturnos, oscuridad total, focos de calor en plantas y subestaciones.\n- **Clasificación vehicular** (Vehículos): tipo, marca aproximada, color y dirección; tráfico y forensia.\n- **Detección y abandono de objetos** (Operación): mochilas y paquetes en aeropuertos, terminales, plazas, metro.\n- **Detección de caídas** (Personas): pasillos, escaleras; hospitales, geriátricos, plantas.\n- **Detección de fuego y humo** (Operación): complementa sensores físicos en bodegas, exteriores, túneles.\n- **Aglomeración y densidad** (Personas): estaciones, eventos, centros comerciales, estadios.",
   "h": "f65e981f78f26779",
   "v": "/iACBxH50Tf8A/3AO8AXG8oZ5CL1+9TX6LcRNf3rN9PB5OgK5yzs9SQTzcvCywDO3zSzENpV/RCwJwLi/gIcL7rwvCAJ3Eb+3s/zNdUbrN7x4v/3HeWtrdDq4Sr0AzUUPMfxYBfUCuz82wkWBQg5vAsuMfoizxm89vMU+OapPb/R6vrwQvgI8x/etvkU3Tce0ukDAmIpIgfBxu371wXksfC+1R0JQP8JgRfjMy3o3/wbGwC11fze2+myxg3ZXfw1M14svgr1587cEWv0ERREGdf3afxGMORMwhD3PLjoJfPuGku5/LbiEf73DvIV/QDQJz8d/g0S995I/lP5EvUDDNby7+AaSdjTD+YYK9LpGCE1+8r1EwXvRrk9L/3sINqyrwkeCTXTCQ8n+RT5F/c05PJaGAj/0OETNfynm0vWYdne0gvjr8f1FReSSC8GHvji30n3D8fymC1PASrRPhoS4LYDpRS53xAPzQ1eKw725RAswSq7NMbmxikx7TQRQBsiMtkdOdvuDavI0O3UGzgQHfT+xQXxLzhiDgNMsBXYDPRJDPspJhvl8vw0ROjssNg8RjDG2Akgzx8q9fX/7tPF8w6+DiXWQr7JP78P+xkL6FE5N7v6UDAHKu/35f3j4dcAGA/t6ERb8/PzHb74L+scAOrl/CFOwc0PBAcu5gHV/hA="
  },
  {
   "id": "kb:laboratorio:0.2",
   "fuente": "kb",
   "titulo": "Laboratorio y Vision Lab (demos de IA) › `/laboratorio` — «Probá la IA con tus propios ojos»",
   "ruta": "/laboratorio",
   "texto": "Las tarjetas muestran una métrica por capacidad (p. ej. precisión, latencia, alcance). Son cifras de presentación de la demo: no las ofrezcas como garantía de rendimiento; el desempeño en cada sitio es a confirmar con el equipo comercial.",
   "h": "56350a5539b3e10b",
   "v": "+wQV/Any3ykL+hPg8NcGELv6DBjv//v5GMsILT3QCOfr6ugr/PsB2eAC7xL19AnQBRPABgFBDAD2DBP6CA4WDM710S7s/B8G6Pf1+csk9ePk/vsIDfHm1gwN+v4PFA4fHOr7NCL9DQwH/AUD4gkX4voXHxYf4xHV5wkf8//FLef4CBHwLfb/7Pj72hMBAh328QD6BjUY+BPH5fT03v3l2gzp/wjqK/rzxQ7hFAjX8/oHDgD33hfx8c/z3woPDvAQLUoO3Pv7Au7XCDcWCv0N8QoKIhgu+e8H4CDxH9f8D/zxKBfQ/9j6CP8BABEF/PDVEQ799wsF5PQy+w3q6/IJDsoeE9v6F+nX9gT4FuLkIQv3Fgb7AQsBP9AbAgvmCA/q5xcJ7z3p+/cy4f70+d8j7tcyHBj34OYQGhfWxRHqPtXt8P/t0+73/wvYGxsBDwcR4yvjEdgG1x879Dn3Pvb56v/w6v3n7AD69PQlKvoCGPATxCTWEuPrzR8o9BMOFOsYGfkYMvX79/LZ1h8WDhgJBPz50hgSGhMXFQ8JxAn69/AqAwAgCPrf1RsUJvv61tceKwzq9xTk4vMUEv7qzgjr8DPF/xvhJOHnMPMEAg/p6TIvGQEdIPYEARPt8Az7AAb7BADL+SN/9uHoBOD2E/MPGAPqCQAnz+QaCvsG8Ajz9hE="
  },
  {
   "id": "kb:laboratorio:1",
   "fuente": "kb",
   "titulo": "Laboratorio y Vision Lab (demos de IA) › `/vision-lab` — Playground técnico",
   "ruta": "/laboratorio",
   "texto": "Para perfiles técnicos. Selector de modelo, fuente (imagen, video, webcam), motor **IA real** (inferencia en el navegador, sin servidor ni costo) o **Demo** (predicciones simuladas), dibujo de reglas (ROI con clics y doble clic para cerrar; línea con 2 clics), panel de eventos con «crear alerta» y snapshot, conteo acumulado de personas/objetos distintos, análisis facial y visor JSON de la respuesta.\n\n14 modelos por categoría:\n- Personas: detección de personas; malla facial de 478 puntos con 52 acciones faciales (sin identificar a la persona); reconocimiento facial demo contra lista blanca/negra (solo entorno demo controlado); detección de pose (17 puntos corporales); detección de caídas demo (pose + tiempo en horizontal).\n- Vehículos: detección de vehículos; detección de placas.\n- OCR: OCR de placas (en el navegador).\n- Industrial: EPP (casco, chaleco, guantes, botas, gafas).\n- Perímetro y reglas: intrusión en ROI, cruce de línea con dirección, merodeo/permanencia, objeto abandonado.\n- Experimental: descripción de escena con un modelo visión-lenguaje (VLM), solo para evaluación.",
   "h": "8e7b4433e756d3c6",
   "v": "7xT67ffo4B37AxrQKdYJH9IP5yoI+e3cIOYAJRnpCtzf5fYL+x7tBhbwCBXw+Qft8R3W9+tE+RDTEAQGAf4VH/cDxQXg6h3o++3+GuAq1Nj79PQC8uzN7+4U4gPqACYdDNsMPRLfCfoK+BX05CIV2w0XKP0m0wW94hUQ4gPQIuj48gEULOfx8AnqxyYF6AUM6A0C8BoXAvPc99v15/3f5ATf9grxJgIPuRcSHAnv6/wV+Anc5Qnu6uXO9fXvCvMYI0sy1PgN/tjwBD/q/BkrGvvrSQJC/+UO3gP+OcgACf4OETPF/MsJ/AYABesP8f/gDBsI/hYc9NgiCTAF8foTIc4A7N3xF/QDBPb/KeftDQMMCu4AHfz9Ht8oDg3qIfbVvgwg8RzSHhM2BBXoDO8h8d8vDQ0E28ryDgzWxyL/KOXw0/cBwenrABm/GxQAFw7t1CfjFc720w9C9h/wHvj92e/06RLO5vwJ4hIvDgQC4gA00R3r++fr1xwf+SYGH/MF/uwUG9r6/N3W5QX3HwwCHvIB2wb4DRU3C/kclwb++gNA9vg8Ffzd1fIlNwDp6+EKKRLW3Af/+QUODO//8uPjBfDXABbxHezbNN8NBQMSBjUsHt4EKQL2Bfz58AP23vf5BRfm6SB/6/f0Du/7DfML7On2/RIq09oV+fwN7gcABBc="
  },
  {
   "id": "kb:laboratorio:1.1",
   "fuente": "kb",
   "titulo": "Laboratorio y Vision Lab (demos de IA) › `/vision-lab` — Playground técnico",
   "ruta": "/laboratorio",
   "texto": "Algunos modelos marcados «API externa / requiere key» pueden no estar activos en la web pública. Los modelos sensibles (rostros, placas) muestran avisos legales.",
   "h": "14717b2a2c499f3f",
   "v": "ABn8/ff+6B7z5QXeJNHsFs4V7iAECvH9Cdz+ECr2Dtbe9uYdDRf39Q7uBy70Dfjl5v/o/vA39ADg/QMWEg0KH/z8xA7h8Qvv5fneDPNI8uTdEPf/+Pu5+PITAALmDhEmDuoRMRDr/e8D9wgH1BD/2gwLAQEG3ga49A0V4QHoHe3p5wn8J/Lm7/jyyxQJ/xEI3RAI+TMk/BHy/NL1/xHi/fcCAAbtPQ//xgj4IAX04P0Y+gHx9hzv8dru7PHzBuwOKEMc2N78E+va/CjtCgQRFf72OAUh+PYS7wUDL7f8DgYNGxTU8PMB/QkRBuYVAAPUCQTqAxUWANETDzYPBv4XHtgT6tH3BfTa9PD8K+LtHhUM9PEHEA8BKeYf+/bjG/bethgoBhnlARI34wPr9uwT3+kcFhgH4uL9Bufa0Qv5Kuvpy93kzOEF8BvPIAUIEyTb7yMFBdv57RAw8xzpHe8Gy+/i4Pjp7AIE4QIiHhT4/OQh0Bnr5/jr5Q0dBg4VHP8MAvIOF9j9Bvnk4yH6F/oADvX85jUHBgYjAukluAn+7v1B/vQrH/z51AEiKwLp0twSFfXg5/jn7fAK8e3p6fPi//vZ+gP0DATsK+ILGAvx+jsyFOcIIAgJBgDv5f3q4wLs/zTd1x9/99fvBuf59/IY+unmCwkl1eL96QwHAAcJCxA="
  },
  {
   "id": "kb:laboratorio:2",
   "fuente": "kb",
   "titulo": "Laboratorio y Vision Lab (demos de IA) › Laboratorio vs. Visión",
   "ruta": "/laboratorio",
   "texto": "- `/laboratorio` y `/vision-lab`: probar modelos en vivo con contenido propio.\n- `/vision`: portafolio comercial de 45 analíticas con simulación 3D y evidencia real.",
   "h": "8ed9e7205f64de7b",
   "v": "7AAM7u0A6iAC8RLRN7f1LcgC+hr37vUHCc32KhfWJcvQ7dsxBSkH/Q0FEAwI+QrUEwbFAgU/5djT9O7uFQsqIuHlsxbd5xzw5RDID+Ay5c3fEAMZBfL17+/zHAP9CSw4FPADRhT3AgwC/xEN8Q4W1gscCwQXwAiw6gIb0QbKMePn6A3lBfvf+NMBuTUJ8x747Rn+/EEg3//YANvq8wDP7AHkGAnwKegSsgXhNwHe//ER+SQD6RPf9Onp0/AAF+gSTm8S6OsbA+bdHjjuABQdFPDxRwA9CO8CzhoBLNT5GQHvJDGwGskJAfMA+N0G+vq4ECXx+PoQ9NUYCikD3/4dEMT++9zwFwXe7g7sF9flEQDvEvr4AhH3MsMjAfLTItnbxh8Y7D7TGB9HzQ7lFccr/eA6/h3p2NPhDPDQ1gHmJufzsevlxeD69w/FJxwGDBfs4Cjq6bTyxhZN41QJMw35wvbp0wLQ3AUI4QhLRPHsDeA+sivJAAPd1CIo7RX+N971B/r3PdPv+eHr4xULOykOH/zwswoXJhQnFQIlrBER/gJe/SVNNg8DzhYRNhLv264fLAjJ7wTZ3gYNHfLyzAfSBO69AhDcGfLyN9sqExMCGj1UHf8IFO4cBwzq1xzj6xThKiLP4fd/7ejtB+zv5u8dCvrqHhFHzt79D/4I8goICRI="
  },
  {
   "id": "kb:asistente-ars:0",
   "fuente": "kb",
   "titulo": "Qué puede hacer el asistente Ars por el visitante",
   "ruta": "/",
   "texto": "Úsalo para contestar «¿qué puedes hacer?» o «¿cómo me ayudas?». Ofrece una o dos de estas opciones, según la página y lo que la persona ya contó. No las recites todas.",
   "h": "cdf462f110a7dde4",
   "v": "Bdn4SNTmoiUQKN/hDufb4rgSDBDsHc49LBLGQvXi8dLvJ/8DF+kvACFNDO32EeP6SS7aECB9+tcF2fHk4sk5KtwUxkHVLuMK7dfhGgb9FN0H8bznFzLm9uKi/BIL7TkZMAEBaFm1vtgd9ikXGORH92IuQvTtrTHaIfEWEsvG1wfM78X9KAMByfXqzigzxssb3eUbCwjWDxDRA+n28uDA+wKbxOLMFxtT7kGUCusfPvjj4AAW0kJLwOumurfi7drqKwbezBnJ7NHoIx/u+/31AdfwS9YNQr1m9Amg67ANDRDu/javBdsmMP3y5t0fIN2+WdxH7f398qV/DDD77O/23OQNGfYYSfj/7t8EIeT7zvQzU8gTFvDoJOcH6ivkFdHv+CMS6Q0jFzsT+T5KySQ1/vkwDfIpzP8O3yTIjU+eQ+0WHta579MaF/XvILjqEhog7Q5RNc3m0Pb1zvsI7xEcHu/96TjT2QEY9c858tY51/A44PXQH+bD9Oz4CvHV38m8Lsz9H/e0Hfod3icu+zgHxkEmyk7ZGvD5/yk+lzUm/u0t6yij/f9C+iBGEfTF8gA1Xe7pBQkWLtHTD9r++vco9/vc//z7Ku8vSP0mJxjhLBLu9ron8AsXIO0jqc0aC8HRMM/tJCdDISUSDxU2//IMMRTVyOKo8/pFEBUp8gTkB+M="
  },
  {
   "id": "kb:asistente-ars:1",
   "fuente": "kb",
   "titulo": "Qué puede hacer el asistente Ars por el visitante › Capacidades",
   "ruta": "/",
   "texto": "- **Guiar por el sitio**: llevar a la página, sección o analítica correcta y resaltar lo que se está explicando.\n- **Recomendar según el caso**: con el sector, las sedes, las cámaras y el problema principal, proponer funcionalidades de `/plataforma` y analíticas de `/vision`.\n- **Alcance orientativo**: un borrador de alcance con tamaño de la operación, funcionalidades, analíticas, unidades a cotizar, etapas (demo → levantamiento → piloto → despliegue) e indicadores para medir el resultado. No es una cotización y no trae precios; el equipo comercial confirma alcance, compatibilidad, plazos y costo.\n- **Comparar analíticas**: una tabla lado a lado (qué detecta, cómo se activa, estado, prueba real, para qué sectores).\n- **Analizar una foto o un video propio**: la persona adjunta una foto de su instalación o un clip de cámara. Ars señala zonas ciegas, accesos, EPP o flujos, y qué analíticas lo detectarían y en qué segundo. El archivo se usa solo en esa conversación: no se guarda en el servidor y los videos ni siquiera se suben (el navegador extrae unos fotogramas). No identifica a personas.\n- **Leer documentos**: pliegos, términos de referencia o RFP en PDF o texto. Ars resume, cita la página y lo conecta con ARS.\n- **Preparar el contacto**: un resumen de la visita (necesidad, tamaño, intereses, plazo) que llega escrito en el formulario. La persona lo revisa, añade su nombre y correo y lo envía ella misma.\n- **Voz**: conversación hablada con subtítulos, si el sitio la tiene activa.",
   "h": "78ec1ef894711ac2",
   "v": "5Bz/AgDsvBQUBffhEMbxIrn80fkkL+YLHPLLPuHA7M/u/Af0Df0ABhNM1tfxBNEfQQ/MKf9U6dcEAfsBDc4hErQOykHU9x8V/b329vwVEtr17KLlFOzYzNjg7CwADVErIQD1NmO0zLYH3DL8FOgY7CEYKt0B0yLR9Q7iHQvA5eTOzvf1M9IT6Pu+5xYe2NI9pQf2GwEEF/PL5fYm6+/ZwhTZ4vfVFf0YtjiL2e4mJc/68hED0R8RyubH0d2zGfseLjMC4/j3/f/+A1Eb+v8yL9XlY+9JIapE2CrF7ar15+fPSSW/DrUYJ/7wBckeD/rdNeZI3hcA/6pyHjIY+CXw3dMPDc0QIvTzKdj9GOXr0SBBVd0HLtDvIeoH/C3oHPW7Ay0qADcCFxIn8hYWESlC6Q0v+vUcxAgt6trEujzOEeL76uSu1K4BN/rVYb8WCxEL5REPFtTHtxUBDfTPFSsQBPAq2SLhzc/72sYs6PQq2CMdvCbZL8v0tAD28xrv+c63BNj3IOjO7uT1xhUhFgQj2SQSxg7bHggEGBBXtTYODPtAAETgDBoDBfkiJg7e8PIkKAu8/+Ql/iDmB88EAe0f4cTCASbnP9zrS/YEIBYW9xj+3bUT6BwaQegdvfT21q/GIdn9JjJ/Dh0bIQUyJe8mBd7W1fbK7wIjAyDvAP7s2uI="
  },
  {
   "id": "kb:asistente-ars:2",
   "fuente": "kb",
   "titulo": "Qué puede hacer el asistente Ars por el visitante › Privacidad del asistente",
   "ruta": "/",
   "texto": "Lo que la persona cuenta para personalizar (sector, sedes, cámaras…) se guarda solo en su navegador y lo puede ver y borrar en el panel. Las búsquedas en la documentación envían solo el texto de la pregunta a un servicio de búsqueda semántica, nunca los archivos adjuntos.",
   "h": "f39504d054c08a90",
   "v": "Ev4cC/Xn4DYNBAblIsrbHun+AgAaN+sLCufeJB7O59YSH+sHIc4qBe1R1hwF8wkXJBkLExdL8gf8AvglBN/rKwzL1WriGfjt0rPy9zwP9+YOAdHc5C60AeboAyHL/lhQKOjuMl6C0Kbavw7c2+ko/g5EBNLS8Cb/FhHl++P00uKyqwj3TMf55RXX/f4s5dophhQ2Hx8O9ubmCuccFcm3/QXX18z6Oi/5uCGy7Br7FwoO4RoK1AFJ3QHb2e3PFPouIhv74Mrj8d4JOBIW2/FHGsT8Zf8xNKRr3AjN9cEJDPEaBQHL/OAvS/MXDtT48/jyBtsk+iUJ/rp6JBUt8/EK3bkMJe8gA/QCHgf3IdrfwykuSvI+CNvvOcAr6SnuF/r39w5HBRwUCiYW9B0h+BlRAuYxFxT6u94CvgLgpRzvN90i5cG93qndJAzFR8ECDwLU+z/vAMnFx9Ys3xDqEyAA9t/n1iLq3vH/FMRV3g4YsghIy++ZSLXj7ukVCAr16tjTNvYVM+PH1BIt8vMUHusS1uIn8wnwJujvPNo1uCMZ3NtF9Ce68SUa/h4FNA/O58MCCuHH8dEK6O8CxcojBdImDhTUCw37MPrlNgMQKBwK8j4My6gC4fQNHwALs9XaAb+SV+P+IBt/JS87AAQYIvQM69um+efX/r8a2xva7QL3Ahg="
  },
  {
   "id": "kb:preguntas-frecuentes:0",
   "fuente": "kb",
   "titulo": "Preguntas frecuentes",
   "ruta": "/",
   "texto": "**¿Tengo que cambiar mis cámaras?**\nNo según lo que comunica el sitio: ARS se integra con la operación actual sin reemplazar hardware y conecta cámaras, guardas, NVRs y sistemas existentes. El módulo de Visión indica «0 equipos nuevos»: corre sobre el circuito ya instalado. La compatibilidad específica de cada marca o modelo se valida en la demo: a confirmar con el equipo comercial.\n\n**¿Cuánto tarda la implementación?**\nEl sitio comunica despliegue en menos de 48 horas sobre la infraestructura existente. El plazo de un proyecto concreto depende de su alcance: a confirmar con el equipo comercial.\n\n**¿Cuánto cuesta?**\nNo hay precios publicados. Existe una familia de «modelos lite · bajo costo» sobre una sola cámara. Cualquier cotización: a confirmar con el equipo comercial.\n\n**¿La IA reemplaza a los guardas o al operador?**\nNo. La IA detecta y prioriza; opera como apoyo del equipo humano. La central, los supervisores y el personal en campo deciden y responden.",
   "h": "5532b0a3edb0ada5",
   "v": "1f8p59UA+w7/DfHy/Nr27LgLuOvhJsXc7dXSFenQCMzF8OAt/vstES9mt7a09s744UHR+vBeDe//BBoKH8Q4Bfbk5jPS7/L1JO7VNtMdAg3W9OYDK/vW093tEFPw5w0OIfsOFRKOGdMKzTMLQARKqQYM+gvJ7iHHLvrbFQfKJdi2vAjyOurcvCPa1QkdyMD75Bn71BgaEfnL6d8s4x7a4AUq+giyFdbQkFP4MRnxM7gP7T/Ovwv3+dneihehR/c0CSZP2NfsCtEA838xLAFVMNT4TONGCs0Zlf+y+tjg0fXpSxPGEp3PHv8DANwO1/3oBB7+Bg73F9dYFBYyM/UUB733wdgKPRG5FO8RAQ4cBw7z/d4hNcnwOq/nCRYJCuP62vwHPe4eFwEoU+kdHRwB1s1U7wvQ1frxCfzPsA/TMPkWzdCsocQv2EDQPeLy7M/+8iX87gLZkg83BxXBQj4dANTL3ycFALAAzftPEezo7SMj6EGb/N/VuDIP4hoM5fXw5xzKCiri4Qa87PoOceMV8woRi/zoJxUU3vBHgV0L1vP+/hz2WPPmE8wi9we8wusSLvUeLNwC/zMXEfD+/eH5/fns6DW9YrnkXwfsIwv9AUsiHMgJ8/PyPwUD4dkXBuPjHerRB1F+7SgaB+8iI/Qb1P/a1CbMEQnj3Bn2+RPsABo="
  },
  {
   "id": "kb:preguntas-frecuentes:0.1",
   "fuente": "kb",
   "titulo": "Preguntas frecuentes",
   "ruta": "/",
   "texto": "**¿Qué pasa con la privacidad y los datos personales?**\n- En `/laboratorio` y en el motor «IA real» de `/vision-lab` la detección corre en el navegador: el video del visitante no se envía a ningún servidor.\n- El reconocimiento facial y la lectura de placas son sensibles: requieren autorización del responsable de datos y, en el caso facial, consentimiento y cumplimiento normativo (el sitio cita Habeas Data en Colombia y la Ley 29733 en Perú). La malla facial del laboratorio analiza geometría y expresión sin identificar a la persona.\n- En operación, la evidencia (foto, video, usuario, hora, ubicación) queda registrada para auditoría.\nPolíticas de retención, alojamiento de datos y certificaciones: a confirmar con el equipo comercial. No afirmes certificaciones.\n\n**¿Funciona en la nube o en sitio?**\nEl sitio menciona edge + nube según la latencia requerida, y que las analíticas de Visión corren en el propio servidor del sitio. Arquitectura exacta por cliente: a confirmar con el equipo comercial.",
   "h": "496735e6b809a853",
   "v": "FCIkFioS0h3n/h/1IbLMOMv44//4G/Py8bUFRQSu9tDP4tkPDQ0RHv7v7fPe8N7T7Cet9t1lzxbcH+8eJNUpJ/QQ0SrSACjsFuDJHgwz2LXgAQoBEgLPAMAvCiXSHTAoOADwMxW25sAf5BAf+RBD2hk7F/UC7gPv4xgGAQaZI8TH5ykLTtTyzDK5xQES0vsUyRz9Ji84CRTDFL8CCRfN7u8I/u/+KwPUqi/rHRIG+vA/4kfasAL87s3MywXaSeFDGDESru3Y37jjKmElG91lItL7SRtRMMQtnxn3W7gpA+4DJVDBB7oV+QIDHdQ37w7UFCb1ACkB1rZwGzgAA8cN8r3sB8EXGuTLF97uB/YCBg4M/vMaDtm9LLQ+5fzsNOnWqgYpDwg3DP9SDvjvCvYf5s5k8TXQ0qr59BnEwy/xCrYT3dP+t7UU01G1X9oW+gjx4iLLANjHrhBs8ETPQxr7yMvh1Sza3MbM0wdMQxf1tBcgxy/BL+vW5hFGCksmO+rwHvkHG+Xd6PDX3RULYOwa4wUG0QjuGvId8ggGlzPZ8us1ESEoRge66N0WLBbx27sIJQ7DE/j27AML9+MM29YFAguq+x7sI9TYOugJ/Qbo8l0oB9UDLfgMIwIF5fTY5gvyNC/f+D5/FzwcD/EDQe8SA9Kv8zcP7PLuwie35PfjMxM="
  },
  {
   "id": "kb:preguntas-frecuentes:0.2",
   "fuente": "kb",
   "titulo": "Preguntas frecuentes",
   "ruta": "/",
   "texto": "**¿Qué detectan las cámaras?**\nPersonas, vehículos y placas, rostros contra listas, intrusión y cruce de línea, merodeo, aglomeración, EPP, caídas, armas, peleas, fuego y humo, objetos abandonados, hurto, y analíticas comerciales y de inventario. Ver el catálogo completo en `/vision#indice`.\n\n**¿Las analíticas están todas disponibles hoy?**\nTodas están disponibles; algunas muestran además un sello del equipo de Visión (p. ej. «funcionando a diario» o «con evidencia»). Lo que se confirma en la visita técnica es el equipo de cada sede.\n\n**¿Sirve para empresas de seguridad con muchos clientes?**\nSí: la plataforma es multi-cliente, multi-sede y multi-zona, con turnos, supervisión de guardas, reportes automáticos y trazabilidad para facturación o cumplimiento. Ver `/plataforma#arquitecto-ia`.",
   "h": "1c4a8961af4d7d76"
  },
  {
   "id": "kb:preguntas-frecuentes:0.3",
   "fuente": "kb",
   "titulo": "Preguntas frecuentes",
   "ruta": "/",
   "texto": "**¿ARS es un ERP? ¿Tengo que dejar el sistema que ya uso?**\nARS es un ERP completo para la empresa de seguridad: clientes, contratos y planes, órdenes de servicio, nómina, costos, facturación, contabilidad con asistente de IA, cotizador y CRM, junto con toda la operación. Y además se adapta: si la empresa ya tiene su propio sistema u otros contratados, creamos los mecanismos (Agente interoperador de datos, integraciones y sincronización) para que todo se centralice en ARS o fluya entre sistemas, según los módulos que contrate. Ver `/servicios/finanzas-y-erp`.\n\n**¿Se integra con mis sistemas (barreras, alarmas, control de acceso, otro software de gestión)?**\nLos casos de /proyectos combinan control de acceso, alarmas e IoT dentro de la plataforma; con el software de gestión que la empresa ya use, el Agente interoperador de datos conecta por API, por backend o por cargas programadas. Integraciones con un sistema o equipo concreto (barreras, control de acceso): a confirmar con el equipo comercial.\n\n**¿Dónde operan?**\nColombia y Perú, según el sitio. Ver `/proyectos`.",
   "h": "9885019dce722d46"
  },
  {
   "id": "kb:preguntas-frecuentes:0.4",
   "fuente": "kb",
   "titulo": "Preguntas frecuentes",
   "ruta": "/",
   "texto": "**¿Puedo ver una demo?**\nSí, cuatro opciones:\n1. Probar ya la IA con tu cámara o un video: `/laboratorio#demo-stage`.\n2. Ver cada analítica funcionando: `/vision#visor`.\n3. Un diagnóstico de tu empresa con IA (5 minutos): `/diagnostico`.\n4. Demo guiada con el equipo: formulario en `/#contacto`, WhatsApp +57 312 462 3357 o correo j.muriel@ars-group.co.\n\n**¿Hay versión en inglés?**\nEl sitio tiene selector de idioma (ES/EN). El catálogo de analíticas de `/vision` se presenta en español.\n\n**¿Me pueden dar un estimado?**\nArs puede armar un alcance orientativo (funcionalidades, analíticas, unidades a cotizar y etapas) con el sector, las sedes, las cámaras y el objetivo. No incluye precios. La cotización formal la hace el equipo comercial después de la demo o del levantamiento.",
   "h": "0d3de982c4573b21"
  },
  {
   "id": "kb:preguntas-frecuentes:0.5",
   "fuente": "kb",
   "titulo": "Preguntas frecuentes",
   "ruta": "/",
   "texto": "**¿Puedo mostrarle una foto o un video de mis cámaras?**\nSí, se adjunta en el chat. Ars explica qué detectaría ARS y con qué analítica. El archivo se usa solo en esa conversación y no se guarda en el servidor; en un video, el navegador envía solo unos fotogramas. Para ver los modelos corriendo en vivo sobre tu propia cámara está `/laboratorio#demo-stage`.\n\n**¿En qué se diferencian dos analíticas parecidas (p. ej. intrusión, merodeo y acceso no autorizado)?**\nArs puede compararlas en una tabla: qué detecta cada una, cómo se activa, estado y prueba real. Resumen rápido: **intrusión** mide qué tan adentro de una zona prohibida está la persona (tres franjas, con aviso según la gravedad); **merodeo** avisa de quien da vueltas sin entrar ni irse; **acceso no autorizado** combina la puerta de una zona interna con el reconocimiento de personal y avisa si cruza alguien que no es del equipo. Ver `/vision#intrusion`, `/vision#merodeo` y `/vision#acceso`.",
   "h": "5d4ed2c81e33681d"
  },
  {
   "id": "analitica:seguimiento",
   "fuente": "analitica",
   "titulo": "Analítica «Seguimiento de personas» (Comercial y comportamental)",
   "ruta": "/vision",
   "ancla": "seguimiento",
   "texto": "Cada persona conserva su número mientras está. Quien entra recibe un número y lo conserva hasta que se va, aunque se cruce con otra persona o pase a otra cámara. Es la base de todas las demás.\nCómo se activa: 0 s: Cada persona del vestíbulo recibe un número (ID 23, ID 6, ID 24…); 6.4 s: ID 6 pasa por delante de ID 23 y lo tapa: el número no se intercambia; 9.5 s: Cada uno sigue con su número después del cruce.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (CCTV real (MEVA) · tracker real).\nEnlace: /vision#seguimiento",
   "h": "b69f1af166b4acf0"
  },
  {
   "id": "analitica:conteo",
   "fuente": "analitica",
   "titulo": "Analítica «Conteo de personas» (Comercial y comportamental)",
   "ruta": "/vision",
   "ancla": "conteo",
   "texto": "Cuenta quién entra y quién sale por la puerta. Una línea en la puerta cuenta cada cruce y su sentido. Con eso salen las visitas por hora, el pico del día y cuántas personas hay adentro en cada momento.\nCómo se activa: 0 s: La línea de conteo atraviesa el cruce peatonal; 8.5 s: ID 78 cruza la línea hacia la cámara: suma una entrada; 9.3 s: ID 102 cruza detrás: segunda entrada en un segundo.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video público (Pexels) · modelo real).\nEnlace: /vision#conteo",
   "h": "3383441e80b2428e"
  },
  {
   "id": "analitica:demografia",
   "fuente": "analitica",
   "titulo": "Analítica «Demografía» (Comercial y comportamental)",
   "ruta": "/vision",
   "ancla": "demografia",
   "texto": "Rango de edad y género de quien visita. Estima el rango de edad y el género de cada visitante al entrar, sin guardar caras ni nombres. Sirve para saber a quién le está vendiendo cada hora.\nCómo se activa: 0 s: La cámara de la entrada ve a cada visitante de frente; 0.2 s: Estima rango de edad y género al entrar, sin guardar la cara; 7.5 s: Suma cada visita al perfil de la hora.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#demografia",
   "h": "183e0247c85b8c28"
  },
  {
   "id": "analitica:calor",
   "fuente": "analitica",
   "titulo": "Analítica «Mapa de calor» (Comercial y comportamental)",
   "ruta": "/vision",
   "ancla": "calor",
   "texto": "Dónde se detiene la gente y cuánto rato. Acumula sobre el plano del local dónde pasa la gente y dónde se queda. Muestra qué exhibición atrae, qué pasillo nadie recorre y cómo cambia por hora.\nCómo se activa: 0 s: Cada paso de cada persona del vestíbulo se suma al plano; 5 s: Se encienden el mostrador del café y el paso hacia las mesas; 11 s: Queda a la vista dónde se detiene la gente y qué zona nadie pisa.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (CCTV real (MEVA) · modelo real).\nEnlace: /vision#calor",
   "h": "bcd8362e6db556d9"
  },
  {
   "id": "analitica:permanencia",
   "fuente": "analitica",
   "titulo": "Analítica «Tiempo de permanencia» (Comercial y comportamental)",
   "ruta": "/vision",
   "ancla": "permanencia",
   "texto": "Cuánto se queda cada persona frente a cada zona. Mide cuánto tiempo pasa cada persona en una zona: frente a una góndola, en una exhibición o en una mesa. Separa a quien pasa de largo de quien se detiene a decidir.\nCómo se activa: 0 s: Se dibuja la zona frente a la banca de espera; 5.6 s: ID 2 entra a la zona y su reloj empieza a correr; ID 4 la sigue; 10 s: Se sientan: ya no es paso, es espera (ID 2 lleva más de 4 s).\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (CCTV real (MEVA) · modelo real).\nEnlace: /vision#permanencia",
   "h": "82a91b18cb3d4cb3"
  },
  {
   "id": "analitica:cruce",
   "fuente": "analitica",
   "titulo": "Analítica «Cruce de líneas» (Comercial y comportamental)",
   "ruta": "/vision",
   "ancla": "cruce",
   "texto": "Cuenta pasos por un punto y en qué sentido. Una línea dibujada sobre la cámara cuenta cada cruce y su sentido. Sirve para medir flujo entre zonas o para avisar cuando alguien pasa por donde no debe.\nCómo se activa: 0 s: Se traza la línea del pasillo y su sentido (hacia la cámara); 3.4 s: ID 1 y ID 5 cruzan hacia la cámara: suman al flujo; 13.2 s: ID 31 cruza en sentido contrario (se aleja): aviso.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (CCTV real (MEVA) · modelo real).\nEnlace: /vision#cruce",
   "h": "1a915ee446f02e85"
  },
  {
   "id": "analitica:comprador",
   "fuente": "analitica",
   "titulo": "Analítica «Comprador activo» (Comercial y comportamental)",
   "ruta": "/vision",
   "ancla": "comprador",
   "texto": "Separa a quien está comprando de quien pasa. Reconoce los gestos de compra: detenerse, recorrer la góndola con la mirada, comparar marcas, tomar un producto. Marca al comprador activo para que el personal lo atienda a tiempo.\nCómo se activa: 0 s: Gente de paso por el pasillo; 2.5 s: Se detiene frente a la góndola y la recorre con la mirada; 5.5 s: Toma una caja roja del estante y la examina; 7 s: Comprador activo: se avisa al asesor del pasillo.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#comprador",
   "h": "5b4327b3119caedb"
  },
  {
   "id": "analitica:blancas",
   "fuente": "analitica",
   "titulo": "Analítica «Listas blancas» (Operativo y de eficiencia)",
   "ruta": "/vision",
   "ancla": "blancas",
   "texto": "Reconoce a quien tiene acceso y le abre. Reconoce a las personas autorizadas en un acceso y habilita el paso sin tarjeta. A quien no está en la lista no le abre solo: pide validación.\nCómo se activa: 0 s: La cámara del acceso ve llegar a alguien por la escalera; 5 s: Está en la lista blanca: la puerta se libera y sale; 5.6 s: Su acompañante no está en la lista: queda registrado para validar; 12 s: La puerta vuelve a cerrar: el acceso queda en el registro.\nEstado declarado: funcionando a diario. Prueba real: sí (CCTV real · escena de referencia).\nEnlace: /vision#blancas",
   "h": "fcd84d99d726ba74"
  },
  {
   "id": "analitica:filas",
   "fuente": "analitica",
   "titulo": "Analítica «Gestión de filas y cajas» (Operativo y de eficiencia)",
   "ruta": "/vision",
   "ancla": "filas",
   "texto": "Avisa cuando la fila crece y hay que abrir otra caja. Cuenta cuántas personas hacen fila frente a la caja y cuánto llevan esperando. Cuando pasa el umbral avisa para abrir otra caja, antes de que el cliente se vaya.\nCómo se activa: 0 s: Cuenta a quien hace fila frente a la caja de la cafetería; 2 s: Cinco en fila: la espera pasa el umbral, abrir otra caja; 7 s: La caja despacha: la fila baja a dos y el aviso se cierra.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (CCTV real · detector real).\nEnlace: /vision#filas",
   "h": "8e22e568088b3837"
  },
  {
   "id": "analitica:aforo",
   "fuente": "analitica",
   "titulo": "Analítica «Control de aforo» (Operativo y de eficiencia)",
   "ruta": "/vision",
   "ancla": "aforo",
   "texto": "Lleva cuántos hay adentro y avisa al llegar al límite. Cuenta cuántas personas hay dentro del vestíbulo, cuadro a cuadro. Al pasar el límite que se fijó para el espacio avisa para frenar el ingreso.\nCómo se activa: 0 s: Cuenta a quien está en el vestíbulo: el límite es 12; 7 s: Entra un grupo por las puertas de vidrio: 7, 8, 11…; 12.5 s: 13 de 12: aforo superado, aviso para frenar el ingreso.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (CCTV real · modelo real).\nEnlace: /vision#aforo",
   "h": "a5f314d89baa436d"
  },
  {
   "id": "analitica:placas",
   "fuente": "analitica",
   "titulo": "Analítica «Lectura de placas y parqueo» (Operativo y de eficiencia)",
   "ruta": "/vision",
   "ancla": "placas",
   "texto": "Placa, tipo, color, cajón y tiempo de cada vehículo. Lee la placa de cada vehículo en la entrada o salida del parqueadero y lo registra con su tipo y color. Si algo lo tapa un momento —una moto, un peatón, otro auto que cruza—, el vehículo sigue en el registro: no se pierde ni se cuenta dos veces.\nCómo se activa: 0 s: Cámara de la salida del parqueadero: ve el carro y su placa; 1 s: Lee la placa: BGY 888 · gris · carro; 4 s: Pasan una moto y un peatón: cada uno con su recuadro, la placa se mantiene; 6.6 s: Un auto cruza delante y lo tapa: el registro no se pierde; 10.2 s: El carro sale: BGY 888 registrado una sola vez.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video público · modelo real).\nEnlace: /vision#placas",
   "h": "1708a4d6c4324daf"
  },
  {
   "id": "analitica:staff",
   "fuente": "analitica",
   "titulo": "Analítica «Detección de personal» (Operativo y de eficiencia)",
   "ruta": "/vision",
   "ancla": "staff",
   "texto": "Separa al personal de los clientes en sala. Decide si quien aparece es del equipo o es un cliente, por la ropa de trabajo y el puesto, sin reconocer a nadie. Así los conteos de clientes no se inflan con el personal.\nCómo se activa: 0 s: Ve a todas las personas de la cafetería; 2 s: Mira la ropa de trabajo y el puesto: la cajera y la persona de limpieza son personal; 6 s: Cuenta personal y clientes por separado, en todo momento.\nEstado declarado: listo para instalar. Prueba real: sí (CCTV real · detector real).\nEnlace: /vision#staff",
   "h": "e6e59ad6e57aceae"
  },
  {
   "id": "analitica:derrames",
   "fuente": "analitica",
   "titulo": "Analítica «Detección de derrames» (Operativo y de eficiencia)",
   "ruta": "/vision",
   "ancla": "derrames",
   "texto": "Avisa cuando el piso deja de estar limpio. Cada cámara aprende cómo se ve su piso limpio. Si aparece un derrame, una mancha o basura y sigue ahí, avisa con el tipo y la ubicación; cuando lo limpian, el evento se cierra solo.\nCómo se activa: 0 s: El piso limpio del pasillo es la referencia; 4.5 s: Se cae un envase y aparece un charco: empieza la espera; 8 s: Sigue ahí: aviso de derrame con su foto y ubicación; 12.6 s: Lo limpian y el evento se cierra solo.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#derrames",
   "h": "36dff67190fb441a"
  },
  {
   "id": "analitica:guardian",
   "fuente": "analitica",
   "titulo": "Analítica «Guardián de puestos» (Operativo y de eficiencia)",
   "ruta": "/vision",
   "ancla": "guardian",
   "texto": "Vigila que el puesto lo atienda la misma persona. Avisa cuando alguien distinto ocupa un puesto con la sesión de otro, cuando la misma persona figura en dos puestos o cuando un puesto queda abierto sin nadie. Aquí, la caja de la cafetería.\nCómo se activa: 0 s: La caja la atiende su titular; 7.5 s: La titular se va: la caja queda en espera; 14 s: Otra persona ocupa la caja: aviso de cambio de persona.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (CCTV real · modelo real).\nEnlace: /vision#guardian",
   "h": "2f5f895a821c6ec7"
  },
  {
   "id": "analitica:negras",
   "fuente": "analitica",
   "titulo": "Analítica «Listas negras» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "negras",
   "texto": "Avisa en el acto si entra alguien de una lista. Compara cada rostro del acceso con una lista corta y avisa al puesto de monitoreo con la foto y el video ya guardados. Solo en accesos.\nCómo se activa: 0 s: Cada rostro del acceso se compara con la lista; 3.2 s: Coincidencia con la lista negra: aviso inmediato; 6 s: Se sigue a la persona dentro del local.\nEstado declarado: funcionando a diario. Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#negras",
   "h": "e1a92ed668bcd651"
  },
  {
   "id": "analitica:merodeo",
   "fuente": "analitica",
   "titulo": "Analítica «Merodeo» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "merodeo",
   "texto": "Avisa de quien da vueltas sin entrar ni irse. Mide cuánto tiempo pasa una persona en una zona y cómo se mueve. Quien va y viene frente a una vitrina, un cajero o una puerta más de lo normal dispara el aviso.\nCómo se activa: 0 s: Se vigila el andén frente a la vitrina; 2.5 s: Se para frente a la vitrina sin entrar: el reloj de permanencia corre; 10.5 s: Vuelve a pasar: supera el umbral de merodeo y avisa con su recorrido.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#merodeo",
   "h": "fda95409f0c51f05"
  },
  {
   "id": "analitica:intrusion",
   "fuente": "analitica",
   "titulo": "Analítica «Intrusión» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "intrusion",
   "texto": "Avisa cuando alguien entra o se queda en una zona prohibida. La zona prohibida se dibuja sobre la cámara: aquí, el piso frente a la salida de emergencia. Si alguien entra y se queda, el sistema lo marca en amarillo y, pasado el tiempo permitido, dispara la alarma con su recuadro.\nCómo se activa: 0 s: Una persona está dentro de la zona frente a la salida de emergencia; 8.2 s: Se queda en la zona: alarma de intrusión.\nEstado declarado: funcionando a diario. Prueba real: sí (CCTV real (MEVA G507) · modelo real).\nEnlace: /vision#intrusion",
   "h": "b19bf5b18a5d1ab0"
  },
  {
   "id": "analitica:acceso",
   "fuente": "analitica",
   "titulo": "Analítica «Acceso no autorizado» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "acceso",
   "texto": "Avisa cuando alguien que no es del equipo cruza a una zona interna. Combina la puerta de una zona interna con el reconocimiento de personal: el equipo pasa sin aviso, y si cruza alguien que no lo es, avisa al instante.\nCómo se activa: 0 s: La puerta de bodega solo es para el personal; 1.2 s: Pasa alguien del equipo: sin aviso; 9.5 s: Cruza un cliente: aviso de acceso no autorizado.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#acceso",
   "h": "ee199df467d77699"
  },
  {
   "id": "analitica:aglomeracion",
   "fuente": "analitica",
   "titulo": "Analítica «Aglomeración y tumulto» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "aglomeracion",
   "texto": "Avisa cuando se junta demasiada gente en un punto. Mide la densidad de personas por zona y qué tan rápido crece. Una concentración repentina o un tumulto disparan el aviso antes de que se salga de control.\nCómo se activa: 0 s: Densidad normal en el vestíbulo; 4.5 s: Entra gente y se junta al fondo; 8.8 s: Pasa de 15 personas: aviso de aglomeración.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (CCTV real (MEVA G421) · modelo real).\nEnlace: /vision#aglomeracion",
   "h": "e600f9f49f00652c"
  },
  {
   "id": "analitica:epp",
   "fuente": "analitica",
   "titulo": "Analítica «Equipo de protección (EPP)» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "epp",
   "texto": "Avisa si alguien trabaja sin casco o chaleco. Revisa casco, chaleco y overol según la regla de cada zona, y emite un aviso por persona y no uno por imagen. Si no ve bien, no opina.\nCómo se activa: 0 s: En la losa se exige casco y chaleco; 1.6 s: Trabajadores sin casco: aviso por cada persona; 6.3 s: Los demás con casco: sin aviso.\nEstado declarado: con evidencia. Prueba real: sí (video público · modelo real).\nEnlace: /vision#epp",
   "h": "40a69b56681ad7a5"
  },
  {
   "id": "analitica:caidas",
   "fuente": "analitica",
   "titulo": "Analítica «Detección de caídas» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "caidas",
   "texto": "Avisa cuando una persona cae y no se levanta. Sigue la postura de cada persona. Si cae y se queda en el piso más de unos segundos, avisa con la ubicación para que alguien acuda.\nCómo se activa: 0 s: Sigue la postura de quien camina; 1.2 s: Pasa de vertical a horizontal: posible caída; 5 s: No se levanta: aviso para que alguien acuda; 8 s: Llega un empleado a ayudar.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#caidas",
   "h": "a25cc3ef262e5edb"
  },
  {
   "id": "analitica:hurto",
   "fuente": "analitica",
   "titulo": "Analítica «Hurto» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "hurto",
   "texto": "Distingue un hurto de una compra normal, y avisa. Lee la postura y los gestos de las manos de cada persona frente a una zona marcada (aquí, un mesón) y les pone una puntuación. Tomar algo y llevarlo a la ropa en vez de dejarlo la hace subir; cuando cruza el umbral, avisa en el momento.\nCómo se activa: 0 s: Detector activo: esperando interacción con el mesón; 4.4 s: Interacción con el mesón: analizando el gesto; 9.1 s: Manipulación sospechosa: lo esconde y se va.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (prueba en laboratorio propio · detector en desarrollo).\nEnlace: /vision#hurto",
   "h": "ce16713c8fc2c6e4"
  },
  {
   "id": "analitica:ocultaProd",
   "fuente": "analitica",
   "titulo": "Analítica «Ocultamiento de producto» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "ocultaProd",
   "texto": "Ve cuando un producto se esconde en la ropa. Sigue el producto desde que sale del mesón. Si desaparece dentro de la ropa o de un bolso en vez de ir al carro o a la canasta, abre un caso.\nCómo se activa: 0 s: Entra a la sala por el fondo; 4.9 s: Llega al mesón marcado y toma un producto; 8.6 s: El producto no vuelve al mesón: «manipulación sospechosa · esconde».\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (laboratorio propio · modelo real).\nEnlace: /vision#ocultaProd",
   "h": "7822099174e51547"
  },
  {
   "id": "analitica:armas",
   "fuente": "analitica",
   "titulo": "Analítica «Armas de fuego» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "armas",
   "texto": "Detecta un arma de fuego en menos de medio segundo. Pistolas y armas largas, llevadas por alguien o dejadas sobre un mostrador. Toda alerta pide verificación humana; nunca confunde un teléfono con un arma.\nCómo se activa: 0 s: Un hombre apunta hacia la barra: el modelo ve la pistola; 0.3 s: Confirmada en varios cuadros: «arma de fuego · pistola»; 1.8 s: Sigue el arma mientras el hombre se mueve; 3.8 s: Entra un segundo hombre armado por la izquierda: nueva alerta; 5.8 s: Los dos salen hacia la puerta de la izquierda.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video de banco (Mixkit) · modelo real).\nEnlace: /vision#armas",
   "h": "c9e337dde7dd193a"
  },
  {
   "id": "analitica:blancas2",
   "fuente": "analitica",
   "titulo": "Analítica «Armas blancas» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "blancas2",
   "texto": "Cuchillos, machetes y objetos cortantes. Cuando un cuchillo, una daga o un machete aparece y se sostiene unos fotogramas, salta la alarma en un tercio de segundo. Además sigue el comportamiento previo: mirar a todos lados y llevarse la mano a la cintura.\nCómo se activa: 0 s: Entra por el fondo de la sala, junto al ventanal; 3.2 s: Se detiene y se lleva la mano a la cintura; 5.6 s: Confirmado «cuchillo» en la mano: aviso para verificar; 9.5 s: Se acerca al puesto con el cuchillo a la vista.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (laboratorio propio · modelo real).\nEnlace: /vision#blancas2",
   "h": "f469c3f09ac25965"
  },
  {
   "id": "analitica:peleas",
   "fuente": "analitica",
   "titulo": "Analítica «Peleas» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "peleas",
   "texto": "Avisa cuando dos personas empiezan a pelear. Reconoce los movimientos bruscos y repetidos entre dos o más personas: empujones, golpes y caídas. Avisa al puesto de monitoreo mientras está pasando.\nCómo se activa: 0 s: Dos personas discuten frente a frente; 3.4 s: Empujón: uno retrocede de golpe; 5 s: Golpes repetidos entre los dos: aviso de pelea; 10.4 s: Uno cae al piso: el aviso sube de prioridad.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: todavía no; solo simulación 3D.\nEnlace: /vision#peleas",
   "h": "e35c084377016067",
   "v": "7UAOHM8j/PpCNTbvCdYjMd8V/f76SfLxKdgf3/8ER9X04vrpu07n7S3uyRu97/wD8wzPEPB9Odb6IjPv5gDwR/f6ww48AyYFCvTeM+4M2Rf4IM8NF+mDBv3syyLtFBn0S8wBKR3jz9bY4fdP7uBcGOpPHgkA+C2r0Rf/zNvoS83j7vPyHwjpHvkMuRgNAvsynf/7HDL6ECLr6grwAs7cy8rD5g3pGfQTtEEaG+X5J9wM+trMFCEC8vkKBR8D++8YBxAmrRMJ4dvnxz4ELQnUIe1AcwNEz88Y4B7Z/ND0DCHv6VG+CdjRISH9IQv5BA0A+u/43BMxCPQFAy0D/ATu6h7dygESE7nJCesm+QAZ3jYOJun8H9r/OODqAvQKLujs4CsM1jMxAvQC3vroKwTfySsQDQfw5+kI6sv4p38j+fUr3wW03LwiBkjSCQoHCBrfBTnjD+nI2iAC7hvGEQop5OXx3w/tsg4LBPkeABUjztMx5fcb9A0I9BguPynGEdETxwQBDsjQEQ3YC/IZT+0T/O/stBvSCg8y8g9H3SES/98S5+c4JvETI9VQCfQ/1elLTwYw7/4Q/ynC1Qo0ORTx4/7VFSHgKuLoSN0bOw0L/ikH/br7RzTh7ATt8AgC1eUzDdwy/2FnEfTV3tf7duwN7+3oR9DXHfXkLAoB6u3YDc4="
  },
  {
   "id": "analitica:fuego",
   "fuente": "analitica",
   "titulo": "Analítica «Humo y fuego» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "fuego",
   "texto": "Avisa de un incendio cuando todavía es una llama chica. Busca humo y fuego en la imagen, sin sensores nuevos. En el video, la alarma de humo saltó a los 2 segundos, con la columna todavía subiendo sobre la calle: ese margen es el que importa.\nCómo se activa: 0 s: Vista aérea de la calle: el techo empieza a echar humo; 1.5 s: Humo confirmado (0,85): aviso con la columna todavía subiendo; 6 s: La columna crece y el viento la lleva sobre la calle.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video público · modelo real).\nEnlace: /vision#fuego",
   "h": "d60b4ea73ef58b60"
  },
  {
   "id": "analitica:abandono",
   "fuente": "analitica",
   "titulo": "Analítica «Abandono de objetos» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "abandono",
   "texto": "Avisa del objeto que alguien deja y se va. Asocia cada objeto con quien lo traía. Si la persona se aleja y el objeto se queda solo más del tiempo fijado, avisa con la imagen de quién lo dejó: sirve para objetos perdidos y para bultos sospechosos.\nCómo se activa: 0 s: Una persona lee en la mesa con su maleta y su celular; 2.2 s: Se levanta, toma la maleta y se va; el celular se queda en la mesa; 5.5 s: Ya nadie está cerca: empieza la cuenta de 5 segundos; 10.5 s: Pasan 5 s: «objeto perdido · celular».\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#abandono",
   "h": "08a2b3ccb7cabf6e"
  },
  {
   "id": "analitica:rostro",
   "fuente": "analitica",
   "titulo": "Analítica «Ocultamiento de rostro» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "rostro",
   "texto": "Avisa de quien entra con la cara cubierta. Detecta caras tapadas con capucha, casco o pasamontañas en los accesos. Es una señal temprana: quien entra así a un local suele no querer ser visto.\nCómo se activa: 0 s: La cámara de la sala busca el rostro de quien entra; 1.6 s: El rostro no se ve: el modelo marca «cubierto»; 2.7 s: Pasamontañas confirmado en varios cuadros: aviso.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video de stock (Mixkit) · modelo real).\nEnlace: /vision#rostro",
   "h": "9957a9d219ee9fe1"
  },
  {
   "id": "analitica:activos",
   "fuente": "analitica",
   "titulo": "Analítica «Retiro de activos» (Prevención y riesgo)",
   "ruta": "/vision",
   "ancla": "activos",
   "texto": "Cada equipo tiene su sitio, y avisa cuando sale de él. Vigila que cada equipo siga en su lugar. Si algo lo tapa, verifica en ámbar; si el sitio queda vacío, avisa en rojo con el video desde 15 segundos antes.\nCómo se activa: 0 s: El celular y el monitor del escritorio, vigilados; 0.6 s: Una mochila tapa el celular: verificando; 15.5 s: El sitio del celular quedó vacío: «activo retirado · celular»; 18.4 s: Arrancan el monitor de la pared: «activo retirado · monitor».\nEstado declarado: funcionando en silencio. Prueba real: sí (video de stock (Mixkit) · detección de cambio real).\nEnlace: /vision#activos",
   "h": "5af559fd1ce8e4bf"
  },
  {
   "id": "analitica:fleje",
   "fuente": "analitica",
   "titulo": "Analítica «Verificación de etiqueta» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "fleje",
   "texto": "Revisa que cada producto tenga su fleje y su precio. Lee el borde de cada repisa buscando el fleje con el precio y lo cruza con el producto de encima. En este video la estantería no tiene ningún fleje: cada tramo sale «sin fleje» y queda el aviso para rotular antes de abrir.\nCómo se activa: 0 s: Recorre el borde de cada repisa buscando el fleje; 3 s: Tramos leídos sin encontrar fleje; 7 s: 4 repisas sin fleje: aviso para rotular precios.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video público (Pixabay) · marcas de referencia, sin modelo).\nEnlace: /vision#fleje",
   "h": "639dee633b0b645b"
  },
  {
   "id": "analitica:canastillas",
   "fuente": "analitica",
   "titulo": "Analítica «Inventario de canastillas y cajas» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "canastillas",
   "texto": "Cuenta canastillas y cajas sin que nadie las cuente. Cuenta las canastillas, gaveras o cajas apiladas en una zona y lleva el inventario solo. Avisa cuando bajan del mínimo o cuando salen sin registro.\nCómo se activa: 0 s: Cuenta las canastillas de cada pila; 5 s: Se retiran 3 canastillas: el conteo baja solo; 9 s: Quedan menos del mínimo: aviso para reponer.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: todavía no; solo simulación 3D.\nEnlace: /vision#canastillas",
   "h": "32482ef0360923c2",
   "v": "AjIE4/n9DPoA4SnrH901OtYG5ScDHPzmKfj43vLbBdL2EfAABz8j6AArBQM3Dfbv4x7QKfsdH+foCjcB89sYVAoQ0j7jHrwR0/jwA/b9ACTT9/jPK+/THdfM4wL5EUH1Mf/+JkAHHL0EKQUZ1O5Fzu4oDfr0ARzT+fsez+3EB973Bv3cL+Hx8ucA3EwwzA8S0xM5KCAGLg/y5yXu+wr92Pq3+OjJEO8UsSIQKx277/3L6PX95RUQ5R/T5vUCAd0L518KwP07Hd7I8SfuEgcCIAUaS//o+8k6+ynyJtYK/vb5Fx/eKsbv+fEGAS3UD/rr/u7i3xEu3N8qBCYH4v/+69P5NegC4rn6ChBF8uYW5gU0BhQPCtfyNsP5H0USGg81/wMx5w/yBPnr4/jkIRwZ2uwBEv31DuAS5gP7zyDcV+kXyQnf+e0MKi/17R8lBRO/IyTzEzfn3/s3Bw8gIvAo0g/u7AMTzvcc/SVOFR/q9eEj7UoI4Lbr1xEnVOoZ8eMaM/0MSsjW9vMKFhjwIwEJ9wgRlwHtOhcwGgA71R7o6OvvE/sc8t8y4+cm+Q/Trd0pIQkkygv0FtLu/tcc5M/YwB7Y+P3RHcYNMuwYDw4w+jgvJNUaPi7svQYH8w0ODuL4N/z4ByZ/6+sBF8koIu4K2vf4K/8Y8Pkh5OnfAADcAxs="
  },
  {
   "id": "analitica:puertas",
   "fuente": "analitica",
   "titulo": "Analítica «Puertas abiertas o cerradas» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "puertas",
   "texto": "Vigila la puerta de entrada y las neveras: cuál está abierta y desde cuándo. Sabe si cada puerta está abierta o cerrada y desde cuándo: congeladores, neveras, cuartos fríos, bodegas o la entrada. En el video el cliente abre un congelador, saca una bandeja y lo cierra a los 5 segundos: queda registrado y, como no pasó del límite, no hay aviso.\nCómo se activa: 0 s: Congeladores cerrados; 1.6 s: Abre la puerta 3: empieza a contar el tiempo; 4.4 s: Saca una bandeja con la puerta abierta; 6.8 s: La cierra a los 5 s: dentro del límite, sin aviso.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video público (Mixkit) · marcas de referencia, sin modelo).\nEnlace: /vision#puertas",
   "h": "b23d887a85decbb9"
  },
  {
   "id": "analitica:huecos",
   "fuente": "analitica",
   "titulo": "Analítica «Huecos en góndola» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "huecos",
   "texto": "Cuánto de la góndola está surtido, en vivo. Marca los huecos de la estantería y calcula el porcentaje de disponibilidad. En el video, el modelo confirma dos huecos (H1 arriba, junto a la balanza, y H2 abajo a la izquierda) mientras el tendero atiende: la disponibilidad baja a 97 %.\nCómo se activa: 0 s: Estantería surtida: disponibilidad 100 %; 2.7 s: Dos huecos confirmados (H1 y H2): disponibilidad 97 %; 7.5 s: H1 se tapa al reacomodar; sigue confirmado H2 · 98 %.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video público (Pixabay) · modelo real v3).\nEnlace: /vision#huecos",
   "h": "fd01a402ba54722c"
  },
  {
   "id": "analitica:vencido",
   "fuente": "analitica",
   "titulo": "Analítica «Producto vencido o por vencer» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "vencido",
   "texto": "Lee la fecha y avisa lo que vence pronto. Lee la fecha de vencimiento de lo que está a la vista. Marca en ámbar lo que vence en los próximos días y en rojo lo que ya venció, para retirarlo a tiempo. En el video: jugos y leches de la repisa baja, detrás del mostrador.\nCómo se activa: 0 s: Lee la fecha de cada producto visible; 4.5 s: Tres productos vencen esta semana; 8.5 s: Una leche ya está vencida: aviso para retirarla.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video público (Pixabay) · marcas de referencia, sin modelo).\nEnlace: /vision#vencido",
   "h": "a2b234483cf5378b"
  },
  {
   "id": "analitica:destruccion",
   "fuente": "analitica",
   "titulo": "Analítica «Vencimiento y destrucción» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "destruccion",
   "texto": "Registra el producto que se bota, y cuadra la pérdida. Fija el contenedor de destrucción y su boca, y sigue las manos. Cada producto que alguien bota queda registrado con su hora: la mano entra cargada y sale vacía. Así la pérdida deja de ser un faltante sin explicar. En el video, una persona se levanta de la banca, va al contenedor y deposita algo.\nCómo se activa: 0 s: Contenedor y boca fijados; una persona en la banca; 3.4 s: Se acerca al contenedor con la mano cargada; 5.3 s: La mano entra en la boca del contenedor; 6 s: Sale vacía: depósito registrado · pérdida 3 → 4.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (cámara de seguridad real · modelo real).\nEnlace: /vision#destruccion",
   "h": "9dfe30de7c3ce5cf"
  },
  {
   "id": "analitica:bodega",
   "fuente": "analitica",
   "titulo": "Analítica «Almacenamiento en bodega» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "bodega",
   "texto": "Ocupación de racks y mercancía fuera de su lugar. Calcula cuánto de cada rack está ocupado y avisa de la mercancía que queda en un pasillo o fuera de su zona. En el video, un carro cargado se queda en el pasillo de circulación mientras el montacargas trabaja al fondo: pasa el tiempo permitido y salta el aviso.\nCómo se activa: 0 s: Mide la ocupación de cada rack y vigila el pasillo; 2 s: Carro con mercancía detenido en el pasillo; 9.5 s: Sigue en el pasillo de circulación: aviso.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video público (Pixabay) · marcas de referencia, sin modelo).\nEnlace: /vision#bodega",
   "h": "181fab0e2c474594"
  },
  {
   "id": "analitica:racks",
   "fuente": "analitica",
   "titulo": "Analítica «Sobrecarga en racks» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "racks",
   "texto": "Avisa cuando un rack queda sobrecargado. Cajas apiladas por encima del último nivel o que sobresalen por el frente o los costados. La zona de cada rack se dibuja una vez y el sistema la vigila solo. En el video, el operario sube una caja más a una bahía llena y la pila toca la viga de arriba.\nCómo se activa: 0 s: Racks con la carga en orden; entra un operario con una caja; 3.5 s: Sube la caja a la bahía 2, que ya estaba llena; 4.5 s: La pila toca la viga y sobresale del frente: sobrecarga en rack 1.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#racks",
   "h": "a49121b97d2a4c23"
  },
  {
   "id": "analitica:pasillos",
   "fuente": "analitica",
   "titulo": "Analítica «Pasillos libres» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "pasillos",
   "texto": "Avisa de lo que se queda estorbando el paso. Separa a las personas de los objetos y solo avisa de lo que se queda: cajas, carros o canastas en el suelo. En el video, la canasta que la clienta deja en el piso queda como candidata y se confirma como obstáculo a los 7 segundos; ella no cuenta, es una persona.\nCómo se activa: 0 s: Una clienta se agacha en el pasillo 2 y deja la canasta en el piso; 1.5 s: La canasta no se mueve: candidata a obstáculo, corre la cuenta; 7.1 s: Se confirma: obstáculo en el pasillo 2 (la persona no cuenta).\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video público · modelo real).\nEnlace: /vision#pasillos",
   "h": "23da8eafecafef60"
  },
  {
   "id": "analitica:exhibicion",
   "fuente": "analitica",
   "titulo": "Analítica «Verificación de exhibición» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "exhibicion",
   "texto": "Compara la exhibición con el planograma. Compara cómo está armada la exhibición con la foto de referencia acordada: orden, frentes y material de punto de venta. Avisa de lo que no cumple.\nCómo se activa: 0 s: Se carga el planograma acordado; 4 s: Frentes y orden coinciden; 8 s: Un producto está fuera de su lugar y falta el aviso de precio: no cumple.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: todavía no; solo simulación 3D.\nEnlace: /vision#exhibicion",
   "h": "119e44da5edfd6dc",
   "v": "zSzn39IcBNoKEDPXEtz+H9z6+RsjHvTsEgH5/CLlHN0S+O0DAjIU8xQu+fYuJtkG7RDjHhUPCuYHAyEYHvYUUNEHzRsO8+3/CvPzEQsaF/raAesLGQLEFt7q+yL2DiQMA+YGJBgR/9sWFQMh4eox7AsmJfobAxnZ2PsFxOHxM/AF/fn+B9fDBgb61Cz/EAck0RMlDgcZH+UH6Afn5OEJ4Ojd9BXgIPMGxB0CHRXFFirz2xLa9Agq6izo9uv+6swF/SwiwPci8vbz4kryDhL4A/gKRfYb8fH/9xfzRuL6De77NiPO+7zwCRAa+gLmAN75EBXd4Rkg6NwTES4L4tAO+dUC2+XoD9zuDR9ADeACEAkSIPjo8QMKHuD6AwD7JPv30EAi0Pvx/fUo7xL3GxoP4vIbFg377QUB+c3k1yMLJfQG0v3e1tQCDUPuB/oT+yoB+D0OGwzW9Acd4BD7Ie4Q0RYQAhYK8P0LEgdCEPQY7O4p5yr+4ezy2hMZIAgG+N3yF/UDJtzmBu3o+AcaOQYTCwzE1CDWCwEO9hgm0STz7OgHESIZIfYoBsQdDBHOo9oXN/jq6v/iGOrSCOjJ+gTkAwjy9iXGF+IhM+AgDfonCSQWIt4FSQnY5zD/9gv14PftH/QW7Sx/59PwFN8OCfLn8wMBJfb/BPgIDevi7BDw9Rw="
  },
  {
   "id": "analitica:trazabilidad",
   "fuente": "analitica",
   "titulo": "Analítica «Trazabilidad góndola–caja» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "trazabilidad",
   "texto": "Cruza lo que se tomó con lo que se pagó. Sigue a la persona desde la góndola hasta la caja: cuenta los productos que tomó y los compara con los que pasaron por el registro.\nCómo se activa: 0 s: Toma productos en la góndola: se cuentan; 8 s: Llega a la caja con lo que tomó; 12 s: Se registran 2 de 3: aviso de diferencia.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: todavía no; solo simulación 3D.\nEnlace: /vision#trazabilidad",
   "h": "e52e7e425aea1757",
   "v": "3ib69PAGChoS+DT8/90PFuT74zIDHgXwBODx6OTNCOEN9+sIEEMyBvkrAf4iJPjh6RHq9O45A+z4FSQH3c4TJxAG1jTzDN/88gAADQYLE/Tw3fnyQ/3mBPPd/AX9HDnl+OMEADH6NtMPAAQL1/pW5fUXOQrdCRni6AP3wejhA+/8/vvvC/jv/Qn64S303A8P6ggJIQkNEAPf5Bb99Av54Nrf+wPRDOsEwAsIC/Pn5QDp1Qrt3P4P1ifq+AIHA+EdDysS1gUMDuzq7S3n8AAo/PPwTPPi+dQiCg8ZNvT37ewEITTLC9IJGwMIHSID7QfY/A3w8RMZ2dElEgAKy+kG8eoJDOcS0NAYEP47AucD/gkbF/HfAtYVGs77BwMCHiIb5Rgl/A7fHPgQ6f/8EzMR3eMZDwIhC8jj9/oU3Sn4JOAw2fH19vng+yjx/QMK4+4AGiD5GRjY6/QZBicDCeUd1wf3/yf+y/X26CM4HykT5Mv06Sz2++ntyAkpKwEaC/sFLQYCOOTY2vwN//j9RgYTDAjqswf8GPgoGhUn6BPpC/rqKxoPGQQI8tMa9yLgzfAOGPkG4hHvGefdCQD95+Hc2hbGDCfHGccqFuMS/AAeDisYIM0DPzPW4Ab17QgNAuz9FfwCECZ/Bfr++eYPGvLqAAzaGuoV7PX/7ej38gD3DQM="
  },
  {
   "id": "analitica:autopago",
   "fuente": "analitica",
   "titulo": "Analítica «Validación de autopago» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "autopago",
   "texto": "Verifica que todo lo que pasa por el autopago se escanee. Mira cada producto que pasa por la zona de escaneo del autopago y lo cruza con lo que registró la máquina. El que llega a la bolsa sin pasar por el lector dispara el aviso.\nCómo se activa: 0 s: Cada producto que pasa por el lector se cruza con el registro; 1.3 s: Leche, pan y café pasan por el lector: coinciden; 8.3 s: Una caja roja va directo a la bolsa sin pasar por el lector: aviso.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#autopago",
   "h": "744e8368f37580d2"
  },
  {
   "id": "analitica:zonaCiega",
   "fuente": "analitica",
   "titulo": "Analítica «Zona ciega» (Modelos lite · bajo costo)",
   "ruta": "/vision",
   "ancla": "zonaCiega",
   "texto": "Muestra lo que ninguna cámara ve, y quién entra ahí. Arma el mapa de cobertura de todas las cámaras sobre el plano y marca los puntos ciegos. Cuando alguien entra a uno, lo sigue por estimación y avisa si tarda en reaparecer. En el video se ve lo que sí cubre CAM 01; la zona ciega queda detrás de la góndola de la derecha.\nCómo se activa: 0 s: CAM 01 cubre el piso de ventas; el mapa marca lo que no ve; 1 s: Detrás de la góndola de la derecha queda una zona ciega; 3 s: El cliente de chaqueta azul pasa detrás de la góndola: se sigue por estimación; 6 s: No reaparece: aviso de zona ciega.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (video generado con IA · referencia).\nEnlace: /vision#zonaCiega",
   "h": "745effb223801942"
  },
  {
   "id": "analitica:apertura",
   "fuente": "analitica",
   "titulo": "Analítica «Apertura de tienda» (Operativo y de eficiencia)",
   "ruta": "/vision",
   "ancla": "apertura",
   "texto": "Registra a qué hora abre cada local y si fue puntual. La cámara de la entrada sabe si la puerta está cerrada o abierta y a qué hora cambia. Cada mañana registra la hora real de apertura, la compara con la meta del local y guarda el video del momento; si a la hora pactada sigue cerrada, avisa.\nCómo se activa: 0 s: 06:55 · puerta cerrada; la meta de apertura es 07:00; 6 s: Llega el encargado a la puerta; 10.1 s: Abre la puerta: apertura registrada a las 06:58, puntual; 12 s: Entran las primeras personas: el local opera.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (CCTV real · detector real).\nEnlace: /vision#apertura",
   "h": "c7ead96f353401f9"
  },
  {
   "id": "analitica:cierre",
   "fuente": "analitica",
   "titulo": "Analítica «Cierre de puerta sin autorización» (Operativo y de eficiencia)",
   "ruta": "/vision",
   "ancla": "cierre",
   "texto": "Avisa si la puerta se cierra en horario comercial. Dentro del horario de atención la puerta debe quedar abierta. Si se cierra y nadie lo autorizó, cuenta cuánto lleva cerrada, muestra quién pasó por última vez y avisa.\nCómo se activa: 0 s: Horario de atención: la puerta de acceso se abre y la gente entra; 8 s: Entra el último y la puerta empieza a cerrarse; 12.6 s: Puerta cerrada en horario de atención, sin autorización: aviso al supervisor.\nEstado declarado: sin estado declarado (disponibilidad a confirmar con el equipo comercial). Prueba real: sí (CCTV real · detector real).\nEnlace: /vision#cierre",
   "h": "6c7539aa986af13e"
  },
  {
   "id": "funcionalidad:turnos",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad A · Control de turnos y programación (grupo Operación)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "Permite planificar, organizar y supervisar turnos de vigilancia por cliente, sede, zona, puesto y horario. Facilita la asignación de personal, control de cobertura y validación de cumplimiento operativo.\nIncluye: Programación de turnos por cliente y sede, Asignación de guardas por puesto, Control de horarios, Validación de cobertura, Identificación de ausencias o retrasos, Historial de programación, Vista calendario o agenda operativa.\nEnlace: /plataforma#recorrido",
   "h": "6550d36d32057429"
  },
  {
   "id": "funcionalidad:personal",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad B · Gestión de personal operativo (grupo Operación)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "Centraliza la información del personal de seguridad, sus roles, turnos, ubicación, estado operativo y actividad en campo.\nIncluye: Perfil del guarda, Estado en turno, Ubicación en tiempo real, Historial de actividad, Asignación a zonas o sedes, Control de disponibilidad, Relación con reportes, novedades y tareas.\nEnlace: /plataforma#recorrido",
   "h": "1edc17de5f963424"
  },
  {
   "id": "funcionalidad:rondas",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad C · Rondas inteligentes (grupo Operación)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "Permite crear rondas de vigilancia con puntos de control, rutas, horarios, tareas personalizadas y validación de cumplimiento.\nIncluye: Rondas por sede, zona o cliente, Puntos de control, Tareas por punto, Validación por ubicación, Evidencia fotográfica, Observaciones y novedades, Control de rondas incompletas, Alertas por incumplimiento, Historial de ejecución.\nEnlace: /plataforma#recorrido",
   "h": "5302afe2b20e955d"
  },
  {
   "id": "funcionalidad:tareas",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad D · Rondas con tareas personalizadas (grupo Operación)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "Cada ronda puede incluir tareas específicas según el tipo de instalación, riesgo o necesidad del cliente.\nIncluye: Verificar puerta cerrada, Revisar perímetro, Confirmar iluminación, Reportar vehículos sospechosos, Validar presencia de personal autorizado, Tomar fotografía del punto, Completar formulario de inspección, Reportar novedad con evidencia.\nEnlace: /plataforma#recorrido",
   "h": "44fefd2f3a7ac868"
  },
  {
   "id": "funcionalidad:formularios",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad E · Formularios dinámicos (grupo Operación)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "ARS permite crear formularios adaptados a cada operación, cliente o tipo de evento, evitando formatos rígidos y facilitando la captura de información estructurada.\nIncluye: Formularios personalizados, Campos de texto, selección, fecha, evidencia, firma o ubicación, Formularios por tipo de novedad, Formularios por ronda, Formularios por cliente, Validaciones obligatorias, Relación con reportes y auditoría.\nEnlace: /plataforma#recorrido",
   "h": "748a3f2b8fc2c67f"
  },
  {
   "id": "funcionalidad:mapa",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad F · Seguimiento en mapa en tiempo real (grupo Monitoreo)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "Visualiza en un mapa la ubicación del personal, zonas, sedes, cámaras, rutas, eventos y puntos críticos de la operación.\nIncluye: Ubicación de guardas en tiempo real, Visualización por cliente, sede o zona, Rutas de ronda, Puntos de control, Cámaras georreferenciadas, Alertas sobre el mapa, Historial de recorridos, Segmentación por operación.\nEnlace: /plataforma#recorrido",
   "h": "a13ceabe7f1edb1b"
  },
  {
   "id": "funcionalidad:ptt",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad G · PTT · Push To Talk (grupo Operación)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "Conecta a la central de monitoreo, supervisores y personal en campo mediante comunicación operativa rápida tipo radio digital.\nIncluye: Comunicación inmediata, Canales por cliente, sede, zona o equipo, Comunicación central-campo, Soporte para supervisores, Registro de actividad si aplica, Integración con eventos o alertas, Apoyo a respuesta coordinada.\nEnlace: /plataforma#recorrido",
   "h": "9df0135fcbd7156e"
  },
  {
   "id": "funcionalidad:pot",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad H · POT · Acción operativa rápida (grupo Operación)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "Permite ejecutar acciones rápidas desde la operación: reportar una novedad, activar una alerta, solicitar apoyo, confirmar presencia o marcar una tarea crítica.\nIncluye: Botón de acción rápida, Reporte de emergencia o novedad, Confirmación de tarea, Solicitud de apoyo, Activación de protocolo, Asociación con ubicación y usuario, Registro en trazabilidad.\nEnlace: /plataforma#recorrido",
   "h": "fbe4e14e9f098fc8"
  },
  {
   "id": "funcionalidad:central",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad I · Central de monitoreo (grupo Monitoreo)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "La central de monitoreo concentra cámaras, eventos, personal, alertas, mapas y comunicación en una sola vista operativa.\nIncluye: Video wall, Monitoreo de cámaras, Alertas en tiempo real, Seguimiento de eventos, Visualización de personal, Comunicación con campo, Evidencia asociada, Priorización de riesgos.\nEnlace: /plataforma#recorrido",
   "h": "00e8317f132448a3"
  },
  {
   "id": "funcionalidad:ia",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad J · Cámaras e IA (grupo Inteligencia)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "ARS integra cámaras CCTV con capacidades de inteligencia artificial para detectar eventos relevantes y apoyar al operador en la priorización de riesgos.\nIncluye: Personas: Detección de personas, Reconocimiento facial (listas autorizadas/restringidas), Caídas y eventos críticos, Merodeo o permanencia. Vehículos: Detección de vehículos, Reconocimiento de placas (LPR), Clasificación por tipo y color. Comportamiento y zonas: Cruce de línea, Intrusión en zona, ROI o zonas de interés, Objetos abandonados. Industrial y operación: Uso de elementos de protección personal (EPP), Reglas por cámara, Aglomeración y densidad, Detección de fuego y humo.\nEnlace: /plataforma#recorrido",
   "h": "189f623f80eb59d0"
  },
  {
   "id": "funcionalidad:alertas",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad K · Alertas inteligentes (grupo Inteligencia)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "Las alertas no son simples notificaciones. Llegan con contexto: qué ocurrió, dónde, cuándo, quién estaba asignado, qué cámara lo detectó y qué evidencia existe.\nIncluye: Tipo de evento, Nivel de prioridad, Cámara asociada, Zona o sede, Usuario o guarda relacionado, Snapshot, Video clip, Ubicación, Estado de atención, Historial de seguimiento.\nEnlace: /plataforma#recorrido",
   "h": "4175aa7b6aca430c"
  },
  {
   "id": "funcionalidad:evidencia",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad L · Evidencia y trazabilidad (grupo Monitoreo)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "Cada acción importante dentro de ARS queda registrada para auditoría, seguimiento y respaldo ante el cliente.\nIncluye: Evidencia fotográfica, Video de evento, Fecha y hora, Usuario responsable, Ubicación, Cámara asociada, Historial de cambios, Estado del evento, Cierre de novedad, Reporte descargable.\nEnlace: /plataforma#recorrido",
   "h": "17de664e290e338b"
  },
  {
   "id": "funcionalidad:reportes",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad M · Reportes e indicadores (grupo Reportes)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "ARS convierte la operación diaria en información útil para gerentes, supervisores y clientes.\nIncluye: Cumplimiento de turnos, Rondas completadas, Rondas fallidas, Tiempo de respuesta, Novedades por sede, Alertas por tipo, Eventos por cámara, Actividad por guarda, Cobertura por cliente, Evidencia generada, Riesgos recurrentes, Reportes por periodo.\nEnlace: /plataforma#recorrido",
   "h": "af6710f310f846a8"
  },
  {
   "id": "funcionalidad:multisite",
   "fuente": "funcionalidad",
   "titulo": "Funcionalidad N · Multi-cliente · multi-sede · multi-zona (grupo Reportes)",
   "ruta": "/plataforma",
   "ancla": "recorrido",
   "texto": "ARS está pensada para operar múltiples clientes, sedes, zonas, cámaras, guardas y servicios desde una arquitectura ordenada y escalable.\nIncluye: Organización → Cliente → Sede / Zona, Puesto → Cámara → Guarda, Turno → Ronda → Tarea, Evento → Evidencia → Reporte.\nEnlace: /plataforma#recorrido",
   "h": "4d89c019491b1c11"
  },
  {
   "id": "caso:residencial",
   "fuente": "funcionalidad",
   "titulo": "Caso de uso: Conjunto residencial (Residencial · Administración)",
   "ruta": "/plataforma",
   "ancla": "arquitecto-ia",
   "texto": "Control de porterías, Rondas perimetrales, Registro de novedades, Cámaras por torre o zona, Alertas por intrusión, Reportes al administrador.\nPara armar el suyo: /plataforma#arquitecto-ia",
   "h": "17311aeaf603fa34"
  },
  {
   "id": "caso:campus",
   "fuente": "funcionalidad",
   "titulo": "Caso de uso: Universidad o campus (Educación · Acceso)",
   "ruta": "/plataforma",
   "ancla": "arquitecto-ia",
   "texto": "Múltiples entradas, Cámaras por edificios, Monitoreo de estudiantes, visitantes y zonas críticas, Detección de permanencia o cruce de línea, Control de eventos y reportes.\nPara armar el suyo: /plataforma#arquitecto-ia",
   "h": "25c1e6dd94d9acfb"
  },
  {
   "id": "caso:logistica",
   "fuente": "funcionalidad",
   "titulo": "Caso de uso: Centro logístico (Logística · Industrial)",
   "ruta": "/plataforma",
   "ancla": "arquitecto-ia",
   "texto": "Control de acceso vehicular, Reconocimiento de placas, Rondas en bodegas, EPP, Alertas por zonas restringidas, Evidencia ante incidentes.\nPara armar el suyo: /plataforma#arquitecto-ia",
   "h": "764fb9207ff0153b"
  },
  {
   "id": "caso:seguridad",
   "fuente": "funcionalidad",
   "titulo": "Caso de uso: Empresa de seguridad (Servicios · Multi-cliente)",
   "ruta": "/plataforma",
   "ancla": "arquitecto-ia",
   "texto": "Gestión de múltiples clientes, Programación de turnos, Supervisión de guardas, Rondas y tareas, Reportes automáticos, Trazabilidad para facturación o cumplimiento.\nPara armar el suyo: /plataforma#arquitecto-ia",
   "h": "afb4c6a9e21e4890"
  },
  {
   "id": "flujo:turno-reporte",
   "fuente": "funcionalidad",
   "titulo": "Flujo de integración: del turno al reporte",
   "ruta": "/plataforma",
   "texto": "1. Inicio de turno: El guarda inicia su turno y queda asociado a sede, puesto y horario.\n2. Validación de puesto: Confirma presencia con biometría, ubicación o token operativo.\n3. Ronda asignada: Recibe la ruta con puntos de control, tareas y horarios.\n4. Tareas en campo: Ejecuta las tareas específicas según el tipo de instalación o riesgo.\n5. Formulario / novedad: Reporta hallazgos en formularios dinámicos por tipo de evento.\n6. Evidencia: Foto, video, ubicación y hora quedan asociados al evento.\n7. Alerta o seguimiento: Si aplica, se dispara una alerta priorizada hacia la central.\n8. Central de monitoreo: Operadores ven cámaras, mapa, personal y eventos en vivo.\n9. Cierre del evento: Confirmación de atención, observaciones y trazabilidad final.\n10. Reporte gerencial: Indicadores, KPIs y bitácoras para gerencia y cliente.",
   "h": "0d259c9845add1b1",
   "v": "3k016LwYOB4ZM+0vAN0DDM8O1VD1EucdstONOun/NdQNCCggDhMdEkNLvuT01e/yIkAA9CInJfX0+gz+894lLPjTnw495BscBun/IfwL0+wUqdvtGgma0ObA5lULQDoMGuLkIkjU6KwB2+Yl8cpj1hws+uwOyynbD/PI+8beCvmnx+u5I8r96z8O5uXb+fbs0f0ALjr3BQvpDzki4hcb/u3rxfjSpOLrj2vj+wUDNO7EJBr20iXn6NXavEHwUtRdBxYF5BMA2frgBG0P+hc08ur1YyYX5p1hmAzyzxDX1+Lxfyu5GZL/Fw/jERco7PX6ChIJ9PEM78k7FisNMh775wLOCd81/scX+PM0+gYj4x/4QOAWKc8YAALuDxoe/uQE/iQETeOs7QMqE/wJ1xbe6CMmFc8vrOT5Iwro2W4jKecGtgjoD97gHf/TQd/oHAgP2gJFPNa30/8aARDyOQUG6sc4ui3w3//68+ZaGe8w1tzk6F3qASPE9hcTCEz7FPT54T7lNhjv8wEU8tPhHTAf5PrWsQ21GiPvCuoP5TX3APbdAxwyKCACNsDs6AXqwwMkEEHwFCn27RrJKgQU+wrsxgDqCDvuXZXSQPgULPY7B0QMOarWEDbkPTEYywIeyej6LeD53kJy1yD8LjIoIPMfw9Xx1+PGEev4RhD5+RjKHv8="
  },
  {
   "id": "laboratorio:facial",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Reconocimiento facial (Personas)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Listas de interés + búsqueda histórica por rostro. Identifica personas en tiempo real contra listas de empleados, visitantes o personas de interés. Búsqueda histórica por rostro en grabaciones, alertas instantáneas en accesos restringidos y trazabilidad de paso por zonas.\nUsos típicos: Control de acceso a zonas restringidas, Detección de personas en watchlist, Búsqueda histórica por rostro, Conteo de visitantes únicos.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "79e8551e53568bd2",
   "v": "AwgPGO3r0TLm7hTePrgUQ7cm9fj1HPXcJ8v4HxbM9dLeEuYNBwEHBxEA4Q/Nyuvf7xvR/sVm7QLv9fc1HvAqJdUKnjvpBz7xAeLSNAMiucET7u8N/e69wfby5RLtGiwe/eoPWwS/DbPq4AElwBYws/YeOhcizAzY2RvkyePZJ+rVtxLcHRPZEDjdtgQftDQt0RLlKlovDQDZEcTO4M/F4wC4/QzxY+b6o0z8CP3evwclHNS66/X5z9/C4uf2IfJWAkQgvRPpz8bJ7j0U1+hSE9UjXw9E8OhHv+fyNp0gJPYOB2Dl2LILEyr/PN/0+R3y+v8c/Cci88ZGIjYGFeQfM8X+B/Ur/Ofh863eJuwi8QQZ++YESuoANslJG+TsKgipthLy5SHwHR8z7g7x8dot/spvGQ7qxIzcDfcCtTLnHK/1sur/8ufy7i6nPvH8CeTWB1XyKu7gse1/9jXPAOcD7NLZ4Sjs1RIa4hM2DBz/qg0YngWwLOwBzS45EEYVCTraLeUKEqbZ89r1ygLYSBMEHvIi7fX+HvY0JysDyRMIKyRHAgMEMAX8+wMpI//s0bYLaQm2AxUh1wvhIPgf/dzX2vnVBisOQPfHNM3eCvv86lYwAdL8ZfwbNfXzwgv1y9wILCoRABp+CRUS8wUDI+8P/+3GKAcM2dAi+Ajh1A3sFxc="
  },
  {
   "id": "laboratorio:lpr",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Lectura de placas (LPR) (Vehículos)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "OCR de matrículas vehiculares en tiempo real. Lectura automática de placas de carros, motos y tracto-camiones en accesos vehiculares. Cruza contra listas blancas/negras, registra hora de entrada/salida, y genera reportes para auditoría y control de acceso.\nUsos típicos: Acceso vehicular automatizado, Auditoría de tránsito en patios, Control de tracto-camiones en puertos, Gestión de parqueaderos.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "ae2b154316ad5539",
   "v": "6CT77AP36Qr+6xgGBOgBAgEQ6jIs+gLI8LjvB+XG9d76F/IMEgwC+xrn9vTnBPfjAhTGDfI48Rj2Dxb8Bf4fChEEwiTzABoA+OzzHe809PEK7/8OBu3cAO3U/yjkESkP5t8eKffbBr3z8vQM3+5E0woANxIS0Qi93DgQxu7qBuzv3PzlMvr1BTXK0Qkm8SUkxe/h/TQlHBjREuP06RDh+ffw/xj5GwfttFfjDtjow/cXBw7XywTtA/Ty9Bb7MdQ4JkER5Rrr2rvyGTT7C/EkAhoFNgka8/sT6xk8Fd3lGfv4Ljb3I5ICGg0CIfID8/3hGxIV4A/7+NdADRf44/H+RsrpAOUVF+fxJMUaHe8BCPcc+b/1F+QGQ/ApASL6NQrm4Q0RFyjwGOAb9Q/xAhIk08JGBNTpvbQK/ukW+B3oG7wZzwfeEtv3+DnQGQsOExTu/ib3FPoR50Ev9CfpMxvy9vwI9i0BDA8V9Rz+IycTwAbyxyfWKP784xw2/BMTJxrzIAEVGNPe1fffxuXpLRgHCOn91TL0LhEOGh4v5ikiGPoV+BIAFiDqIwgjKfDgzPcQHBXQ+fsLz/boIA4i09Hv+w7cJRr8GubFIMrxCQEJ9AczG9b1SwD9LPoPyfnk2bnT7/oM5CR/Ah3o4AILNvTu6+nk/Q0M0ujrFh3z4hbe/fc="
  },
  {
   "id": "laboratorio:weapons",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Detección de armas (Perímetro)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Alerta temprana de pistolas, cuchillos y fusiles en escena. Detecta armas (pistola, cuchillo, fusil) en tiempo real sobre las cámaras y dispara una alerta inmediata con evidencia para la central de monitoreo. Pensado para accesos, perímetros y zonas sensibles donde cada segundo cuenta.\nUsos típicos: Alerta temprana en accesos y perímetros, Zonas sensibles (bancos, retail, educación), Escalamiento inmediato a la central, Evidencia en video del evento.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "87fd62931ce1439e",
   "v": "ATf//9MK3EX68SYPAts7IdE3w/zqK929EZgFETH1OdTI990d7BYF9vYijNjPqtLq2xzZIe9vHezaJSz/DfoOTPfRozMSD1nlE9XWV+vy6BAa8+Qj/u2k8QHT0xEmGxgnPdcbUSXfEpbs0A4iFxRk1fsvNQ4y5DjgvCf51ezZ+t/7uQvxCi4CQijCryow6jpFqvTYSH8s+/zk7RQAy/jR7tzU7hv+HvjQi0nsRAniBt8F/fO24/QAHeTo1wbTPPUNEDAex/UZBtfg8kgL5yYVHAAobws65Qgp9SAUEYHlFvXOKTPmEqz0Cx/qGjwF8e/OHP8X6fIUCwJBPhv/Jd8UC6YB2dFQDd6RBt4SGQcoJBQZ99YaO+ACU6oKGhfyEAPg8RYd9yAE+ODxBc3n+P8jxuxK+vCrwtbj/ekIojfpKKUz1AKyC9xDGzjZHxn92wjkMf/f++7V1SZrCjDuMAb53Mrp6f3w1Sry5hxhGxUBwOQLqRLMFu7+tzQxRyUF/BEQLxbfJNHY+gDj0tz/RzwhBdsepDkxOksrQh0j3zkFBzBC8/kKShrhQ/X78uzqqO4QXyHaCOsMzi7qBQNdz+jv2SXEGgwUWOfnTN8WMPgm2CgQFNb6ShsiG/cc0ej/1AkVGNEHBA1qxBMQ3dPzT+4bB+PnMRMU6cX+G/rs9gjcFws="
  },
  {
   "id": "laboratorio:ppe",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · EPP · Equipos de protección (Industrial)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Verificación automática de cumplimiento de seguridad industrial. Detecta uso correcto de casco, chaleco reflectivo, guantes, gafas y otros elementos de protección personal en zonas operativas. Genera evidencia para auditoría y alerta a supervisores en cumplimiento.\nUsos típicos: Cumplimiento en plantas industriales, Acceso a zonas peligrosas, Auditoría de SST, Reporte de no-conformidades.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "63faf3afec588f4b",
   "v": "Ax8PC+AB6jEa4CUHFN0aHeEG0x3nKQHt46MbOgrLMM3tFf0cEjrjFUEH1fO4wAHVG+r1Jzdl9ubpHPAHARwNQ+rkvCkK7kfy8PS1HOn46hj9/9AH7gS5yfT6yQABCS4cAOEKSADOAKvj/uUk5M9x4OVKTRFWnjfJwyUNqNTJCOT4vd/MLPAQNxi60A3/8TMUz9jwEFwx3wPbGe3zugj51wz8wB34FBzrs3TcBQkN5uv0G9TW3f72Aevl6enrBcUzMSDtwQD47wDm7VL8ARkbGQzxVjo4Dgk/+gc6CooTNvjMKTXbDYHfAen1+gwREAvgDicL+xgH7BAkCx3yCsILFuTmAOUaN9DOB/QmBegNNy39H/0GK9faTbwZBAX3HgbF1CYiDikXFtAdBt/Dzx7t9No0D+qxyqLsCgMBvAsCJocZuvywEgTXGyTcEhwfCyf3GFj5M8bxyy1U4THqaDcL46v12AQB6AYB6xUyEyc1rfTpuh/hOgDb8jI5BjMbUQouMhngXdHZ0djWvOHzGRIp7tT7sEsiPPcUJBIF4SIXGvc5Fd35Ef3nDw4RB9bV1OwFYRLFFgfi1i4MFxAi3sLDwOjmCSsQX+TbXdHyLBEfGUIWJ8nKYA74GADu9RXn/N71CwfZ3V189hrF3vjtPfAW+NvkSC4Z2bT7HRjX/RPY+Qw="
  },
  {
   "id": "laboratorio:intrusion",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Intrusión y cruce de línea (Perímetro)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Reglas perimetrales con áreas de interés (ROI). Detección de intrusión en perímetros y cruce de líneas virtuales. Define ROIs específicos por cámara con horarios, tipos de objeto permitidos y nivel de severidad. Alertas inmediatas al CCO.\nUsos típicos: Perímetros de plantas industriales, Zonas peligrosas restringidas, Detección nocturna, Control de acceso vehicular.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "b9b774edbe691ee0",
   "v": "6S4z++ECERPoFhQBGPoF894Q7SYKIO/R88MPMx3wF+Ha6gD48igIDggS4PDo4+TiDRTeFQgn7AT7BxACD/8uGO4TuQ0S8DQQAeUOBt8s4u0c5wD+5PDP0/Hh3BgDDgcb+O0pOgbFANYL5RITAvpi4PgES+0M2SHU3Bb61fnYEvb/9vj3EfT1KiPu4fD7AjoF5O/ILVIhAvvQBOjx7AsA9PXiAyH+BQUNsFLtA+Xl+A77/wPN0A8VFxHs9BjwJOcZIh8DxAb45PEH/mX/8BUeDPMVRQcg6AQeCCMYI7kGDwIBMjDPEKQBBQXTGgIAzfnqFRcH+QkV/gEQAgkPCvP+FM4P8t4e+9DUM9AEI/T2BvcE/fANNuQHGM0o/grkGAPrBgsGBQ0A8s0c/grr4R0K5Lwx+O/Fy8jtCPcA0yzrEL4sy/3L9vH/IyHOOQkK7vP/8jD1Dujx6yg/CzjcQg3f4t/19yL56BAP1/spFxIFxe0EvhbsD/H73h06DjQTGwUHIwUDKdX58A/37QPvOgAOE+sDwyP9GjAXICD/zhcKBQYh5QIMJSHPI+8oCwLorAwcVh3r8gYB1RD0/Qg56QD40RjF/CUTOgHdQ8nnEfIZATcXJNDxKhsKKQr58uv54evuDusGDw1/2xrs2e37NPIL8M4CIAsx4ucJCPLj3v/4EyY="
  },
  {
   "id": "laboratorio:behavior",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Análisis de comportamiento (Personas)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Detecta patrones anómalos: peleas, merodeo, aglomeración. Modelos de comportamiento que identifican peleas, merodeo, abandono de objetos, aglomeración inusual y patrones que se desvían del flujo normal. Alerta priorizada con clip de evidencia.\nUsos típicos: Detección de hurto en retail, Peleas en espacios públicos, Merodeo en perímetros, Aglomeración en filas.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "4f8d4632626b5b8e",
   "v": "ASYLBPb+4i0DDg3eCdweLt0n1CEAQPnADLr1MxbJG9n8+dMT1/cO7f7e2yDX3RbT9ES0GPl2IPLnETn4C/s3Mf7rgQ7qCV/sEeXvKN4Jzggg4gAxEvehz//B3gjnGi35DMc1OyDVGbvOqeUdz/1zwr0hLSUnAlPKyWIHvAfKOePo4vXtEv3jCRrkrQ8t60VFr9YKR2UtNha4BBLw8OTQxw/JzTTfPe/8qVr6KvHJwdTc2eLDzwbx1+3J3CDlRNYpLkokwCYb2P7XA2f7CQ8fDOgDUxRi3uI67DUUSb8VMPf2G3Kg64QQJQvRMCHcMffrBxocFRMj7+sqFQ/87AAIMcwQ1ukx/uje8Z/67vANEBPpFfAHFcwTFZQtKQEFLAPW5Dwb+AX5Bc8v+A726Ovz1/E7Ge/kvand8dUKmz8MJ6vwuBbd69YZDDvZIAwuEBnREDXgNtbU6xhQH0fzERQG8tjn2y3oujTxBipVPDIeocz+jwnJE+IQuT5QLlUJOSr1GzDPL5nh1QPSxbzsOxcrLAEHxEjxOiFCQhswzSUKAP0iAxwaLdPgOdYWFu3Rvew2WAne7yEL2Avk6vFl7fLS0SKmBhLhWNK0TLolCggY7ksnI7UBVTQuIPr8zfoh4+gIC+EPDhdt9hoT4873Z+v/JvgAavsZ0tQTBOD7z/jdFgw="
  },
  {
   "id": "laboratorio:people-count",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Conteo de personas (Personas)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Aforo, mapas de calor y línea de tiempo de circulación. Conteo en tiempo real de personas que entran/salen por una zona. Mapas de calor de circulación, picos de afluencia, tiempos promedio de permanencia y reportes históricos por hora/día/mes.\nUsos típicos: Aforo en centros comerciales, Filas en aeropuertos, Ocupación de oficinas, Mapas de calor en retail.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "919c18ac7c0aa2d5",
   "v": "Bg8k9vzgzBgR4hoGF9wgCb4b/yj4C/DvBcfpPgeyBNHpIvT/AyQb2+AN6jDp69nWNT7ECPQZFxzlAynTQQgoH/Imtir7FkAq/uHeFc/0wwUV7w0bI+Dm3/nZ+RUINUP7+OoXKDfNEsH06tAo2eFa4hAVNSou0CTL3R4n9OzOEOriBQmzFeXUEgYA0vo8/zcu8RjmZ1ITIR/TAPvu7gfP3BS97BL1M8LqmDnw/fAD6fvqAern4gIhyQTf5icVDtQqDXHnvR/1yunU8ELgA/0q/B8QUSUjBPhNyT39QcUhF/vtIT/K87kDOSD4PBv9Fuvs+f4M+gMQycpEGy3a6/kLHtIMNd0T2eTxDM0BKvDxFuoEHOQUJvz2ELIrGRXwGCD48iQlCQvmQQYqy/fb2tMJ8dZc/wrd1KIX+uvj8DwAIM74vfz3HPH8BfHHIf0dKhP+BDfrNwLozgxt4kzyN+flEtUN1igJ6iAI5w9CEST9wfPurRzNI9gAu0pJJkAQJxzrLhj2TarnDO0FzQPqT0UA6/sP6RoWFR/yUzYFsA0yIQwZDyYM5P0GHfgMF/C9z8QKKUXVEycC6R/2LgVB2ukA0yPFEyTzO8L6N9EG9wMV2i8eJ+L7XRMT/AYFwAcHC+b0Mt3eBBB/Af35680cOO37BcP5Kf4Wtcz6IQDp2P299P0="
  },
  {
   "id": "laboratorio:thermal",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Visión térmica (Perímetro)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Monitoreo nocturno y detección de calor. Imagen térmica para perímetros nocturnos, detección de personas/vehículos en oscuridad total, identificación de focos de calor anómalos en plantas industriales y monitoreo de equipos críticos.\nUsos típicos: Perímetros nocturnos, Detección en oscuridad total, Equipos sobrecalentándose, Monitoreo de subestaciones.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "44db4ce9d511e974",
   "v": "BArj3dcHAe0c3gsJBt0ZB9836CLs/OLZA8f3Nj68/Nns2/UP6h/u+goa1BHcrucKLPn8HQQ+8/v0MifsAggiGQbnxjbsFDvvDcfuIdzy+eL2+v41BN7c8fj88CUe8gMj9dIWIAf3AffvxtNGEvpNyyoKI/kdzCq80DcL9Pi6CujpEAXJF/Mj4jXm8P0JBlkfAA0MGHAcBuLN9fj16xHV0gfE/Cn+Lf8JlyXLFvvn9AM19tjwugAQ7/zhzA/+HrcvHyYBuA/3wAoLAG4C+QYsLN8EMh45Cv9F8gwpQav6HA3sMRzGErHw//8ABPIU/v3LDTARAvIZ9eg2CxUE4fIHHckj/8UdBcjYG8byGhgCIvwKKNoOMPn4HL0q/BrOHfjb5xETExcCEAkZAxPM0vX7BNpM+wLHydLTLREH4hHnC7wCwhXMAgffAxPTOAYX/vgF9Se7CebjyzFo5EDZTBn/4e360CT39BgH4h1kEDgPvQzqvBDuCgHrtUsY/zEIKxUaHtj9Ms3d9uK9wQQAHDgVDc8W1AQFNv86NgAGoAkZDOkb+e738RPqDvL+D+vouOQYJjHu//vtyy4LGuAizOjrEBHONhIFMvfqVdXRBg//8QsAI/4VQ+MXQwjQ4xn5AA3lGwTe+xB/3Rjz1+bkJPP2EL7wNCorAt78L/b929rkFCo="
  },
  {
   "id": "laboratorio:vehicle",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Clasificación vehicular (Vehículos)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Identifica tipo, marca, color y dirección del vehículo. Más allá de la placa: clasifica el vehículo por tipo (carro, moto, bus, camión), marca aproximada, color y dirección de marcha. Útil para flujos de tráfico, accesos y forensia.\nUsos típicos: Control de acceso por tipo, Conteo de tráfico vehicular, Búsqueda forense por color/tipo, Detección de vehículos sospechosos.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "0a1555f341c34ec6",
   "v": "5wjz5QX15+L4AgsIG+r3BO8p1xMR+/7PB74ACgjMEeMUB/X8CvYPBQkA+vf03fjA7AfLA/ZPAjHgCTzx3t0NKhL6tBYD9DMCGOrVOsQR7f/v9/cn/PLfx8609hTQOSwX9dgBD/YM/9b1vus4uf9evhI4Iywd3vnG0gsYu/HuLOnm893ECAvp+SjQvhEH2TIu0O3kI1kiLTjUFvbo5RDX4yDHCQHcLPvfxWHtIvnJywYH6hLo4BsH4OTd9Q36I8QpImoZAxD7zdTp+Uf7xf0qEQEGGO8AHOpGwzUhJ77RGN7FJjnb/YoiI//6BfQF8hbX9hsh4BEUBOFEECAEzvz/OeLqHdIAC+PrAs8lDdrz9esP6df9IQEdLO4mETjyMwj08wE9JBXKAOgeAiUF+fEZ489P9fDolNQC9tMIzA32Gc4U0hT1/ejKAjHIFSArDSjt3ybzD+z69To15SrsDf/tzdoC4jrEHPkMCR0oSwsRqQTqphXFHtz+0D41AhU6LCfeOfA4QLjj4PMB0eQBLR0MDu79szgeVwwHICMw4SIyCAosBwjzMi/vNA0cMwfM0uIuKjXnARH46f/MHCg45tnw9zq5CkrDLeW4Fs8b6vso8TEeJd3AcvMHQwX33QDe7eHv6+cG5QB/Bif48d7+J/Lr7uLnI/sY2+TmHxQo7e/cAwI="
  },
  {
   "id": "laboratorio:object",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Detección y abandono de objetos (Operación)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Mochilas, paquetes, equipajes — alerta de objeto abandonado. Detecta objetos abandonados en zonas críticas (aeropuertos, terminales, plazas). Discrimina entre objetos en posesión y abandonados con un timer configurable. Útil para anti-terrorismo y operación.\nUsos típicos: Aeropuertos y terminales, Plazas y espacios públicos, Estaciones de metro, Auditorios y eventos.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "46a4c4e08fdaf15e",
   "v": "BUQM9tr+CDUK5g/zGtcqOLYI0SABLtLjEo4CSCzcMNzqEhvo9gn5+eze8tfUCgPoHCDRJAxxAufeEB/y7RgvO/71lyTd9irw+7bWN/b90OfnwQYrFvCj0QfC2SgCMD4FKOMKUivXJLPZn+o09BAw09g5Ohcb1lzE0x/gxezKNOLWACr2I+wAL/fDpzAgtVNNpOcJaH9KJQ7hDwX71unm5vu63xIMGAMfkEz9GuPupf0X7OrI9OED4N+05wL0VuUUGln37wsdDsnLFGTw2gQfMD/tZwzqy+wxGEL6Eab/MvbxCyO1F4fvAwn7MyDY9Pj+K/cTzvcd7ftCEST3A9kGJcnnAtIZ/vPg8OQ1Dgwe1Pge5AgZE/nwLqomJuX1LPb47UdMBhXp89X36fDZBg0fzNwxN/zI8rfz0/z2oSQKMc8v0ynHB98YEPDhBwse/y7h+0AGIPz++CZ8EkbvHQkQ2MwJtQ3k5R4R3AdDHRkTywH8twLRIMLhyw4xLBw5EQkjURbXMu7h4+4Q1+jiJy8S+wgTriYBPkUjUQQq3z0HAx4p8wzyGBLhFAYkE/jzitr5PirX6RsLvunx/PB11ubI1EC6DfvvRN3RHbwsCAkp8T8/NOv8UR8mBQYb3NIS8gMAIO4K3/po5TPn8uQRNe0HCNX6ZRE2rOEMHM8Z4hzYHeM="
  },
  {
   "id": "laboratorio:fall",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Detección de caídas (Personas)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Caídas de personas, accidentes industriales y emergencias. Identifica caídas de personas en pasillos, escaleras y zonas de riesgo. Alerta inmediata al equipo médico/seguridad con clip de evidencia. Crítico en hospitales, geriátricos y plantas.\nUsos típicos: Hospitales y geriátricos, Plantas industriales, Estaciones de metro, Espacios públicos con escaleras.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "775cf970a6ab1154",
   "v": "6yUh+tQMwiAJ3gLhCvA5JOIJ3RjxLhu6M5gqCCftItnEPQwP4yre4SD40vazxRbuNBfoCRFmGO8BJBbiC+kTKwPzlToWAWPoAO7CEab9yCcTwdkd5vDYxPHdyv4aIxkCNez+EyvrKa/Qyfcs4gxj0MVmRRMz0CrVvB705Q3FHx/r4/LhJvYLHQbgrR0e4C9DuggSVnM8FCvUAuru0evl0wPI0DX7LePrr1/ZHgcG6vwZ79bf6+oX5eLDyyMKJeQlEykH7QoU+OHC71zw6hr5LxXbbjE6CQBnBvk1F6kIK+bXAE24K6n1/w8eCkL+BPHjFRIEAu4GzOk8RwzmF+EGMtHi5vNI0AK5ALIK8PshBgAN8PkfTNTeN7hD+tTUBOm9zRoJ+hPf6/oEHN3ivxoWCNIw/xDDvoL2LfgAsjHVGYEa1B681er7IhfyGiMQECf8FD76EgPEz2VK9DnMPAjN+sDk8y7h1Bj1ufYvGE4+ovUJvvbzLPLq0QsjTSkUWv3yMCH3TbHJxODt1PP2EhQg1O3pm180/yP9Jr8GxS35HP0+5+DoA+D8I+oi8d33rwP+SzXUDTnzy0HvCR9F2uXG9/jiISXrSLPhVJz93QEy/UL5GtrpYfIu/uPjDO0BAe0LBgcL3zZcCCv7+Nj5U+78FuQkOxcl8q5IRufRFwvYBAs="
  },
  {
   "id": "laboratorio:fire",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Detección de fuego y humo (Operación)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Identifica humo y llamas mucho antes que un sensor tradicional. Modelo visual que reconoce humo y llamas en imagen, complementando los detectores físicos. Útil donde un sensor de humo tradicional no llega: bodegas grandes, exteriores, túneles, espacios abiertos.\nUsos típicos: Bodegas y plantas, Bosques y exteriores, Túneles y subterráneos, Centros logísticos.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "58525d12dba0212e",
   "v": "BgDW3/oFxA8B7PfsHN0FGsgA9A3RCNL8+MLfPDD1Ht3c6vEU4v0A/fT6zxnz09/v8QX+BA879uXjIAci/w0VGefkszvq6kXv9c7rLdAD2PPR8/wA/Pji5uLCEgrw3QsCEc0ZPhj6FuDd3tI6FQBE1wkm9f8l8CnJxAAL9PjfK8USAsrRDA0ZEPzT4BIVwUMivPTPJVcI4NfX+vwJ1f/R2Qrf70fbFPz4q1rhKAryAQMp7uHmvwo3+P/IwQ7zJMYoBkMb3AUMwu7w+k3l4k8ME/z4PhY78Pgf/AZRSar/FNS4GSem7tjx/+71CBf4Ewrk4RAH5QoS+/E3CzL0BuAaIMEK+ckiIQrK+ccFDAgTGA4eAtgUMgwCLModGAzgA/zAyggP7fjfAPMBBQPh49/+/Ak0+CG81eH1JeQr2xTwG8EY3Smu28X7CgDpEzMrDv/t/RvPIurrvDZPGFgAPQAc8dX59yr89zkWvxguLQcK9vPy4hb3HebRxiEdCzM0KRoSD+TjIOT28ef46OznOEElEt7fzkshUD87FgIG4SLl8RIX5xkQC+cA/egKEt/2w7giShrO/+nf0Dv6BjEG1OPdCRfKMvznTurLYLUGHvQb9xANNgjufwH9AeTQ+OYc/wET9xb87T5v1Bnn4dbgNvP1/NrrOB80BavwNefp/93xDgU="
  },
  {
   "id": "laboratorio:crowd",
   "fuente": "laboratorio",
   "titulo": "Laboratorio · Aglomeración y densidad (Personas)",
   "ruta": "/laboratorio",
   "ancla": "demo-stage",
   "texto": "Estima multitudes, detecta saturación y congestión. Estimación de densidad de personas en escenas con multitudes. Detecta cuando una zona pasa de su límite seguro y alerta al operador para tomar acción. Esencial en estaciones, eventos, centros comerciales.\nUsos típicos: Estaciones de metro, Eventos masivos, Centros comerciales en temporada, Estadios y conciertos.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.",
   "h": "c12bec739732946b",
   "v": "JQYRHeHy+Cz02QIb8PQ8HK0C8N3oHv3DAKb1ayy7CNn27ekU3Tf44xP6xjf5wM67JEe1CA5CON36CzjEKBQ9QAANoxzpA0LtDdi2M6zypvsmyvcnEvni2dkK8/4CThffPwwvRE3vBKT2zcRM3+ht3PQ6SSRP2hfoyAsP9gq4TfXZBiTYIPX1Au0X6v4lDUhc5gyzf2keDRmq7feqwBf5wxy78CT5R7Hbt0fpD9rN3+7l4ejc2f842v3I4EUqCbQgG2retygc2vHhAnr0/dUk/iIkaTAt+fl2wUvRT9IhE/3g/kq/H6ARHvTtKTcGPNnPD/UV7v4k0/1IMw/P1Oz5KdUQEv0N8ty3EtIZLuAVEtYDBN4BF/f+K4cdJ/kH/ivn5T5T+e/wPcwe1//K+OwX57pq9DG8oqQ2Af7l2zX0C78XswTFFLrj7vTIFSk6DGQACyb0Fijt+eln83v5X//g58D9ExcN4j7i1/1ENv8evh3VkRPoRP/9mS9VGD4fPC/vLTH3U5vOCQT8xBDlOjYQBwscvkVHEyoNSCoe0SkMFjQdOA4r5gDtOe4aF+nD+M0hVjTgMDLu/AafFP5G9hH29ETX7CHtbK3IV+sE5PMV8CkRU/T6ZTEaAhUf18sMC/jsKMjrEgx2+QD548MQWOrxF7MATu8GpMD8Q83s3fO18/Y="
  },
  {
   "id": "modelo:people_detection",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Detección de personas (Personas)",
   "ruta": "/vision-lab",
   "texto": "Identifica personas y dibuja bounding boxes en cada frame. Cómo ARS detecta personas en escenas reales, asigna track IDs y mide confidence frame por frame. Base de modelos como conteo, comportamiento e intrusión.",
   "h": "055bab90fa7d8246",
   "v": "9SDw/sLo0iftBvPzPNcRPfkl6PzuIP/YHfj7HAr/6Njo4QL33izLARca+zDy7QwBxjDUH/Bt8QEFByQR+QIXJhYJjQgA7iX8EAf8C+4q3fgh4A8T79fjCe3cBQHgHRMXILs67BH9E8oE2yoo6jQDAAscJ9MgDiXkJyf+xirsGtHlBuYVNQPX7fX30xcD4vU7/yACLj4U/An5+cLzAfTh6wnKGiLwL9APtAv5GuXL9ugcBOaq2ALkzgjl6fXq8AQ09Uc76AUM5OPnIyCy7h0+/9jzc+gl9s80+RH7Is41QfLj3Vq08MvaER3mDvzv8RrlAfwV6RQp+99W/C8h6QwQJvYU5+cQ4+jo7Mz1IwkW8+kG4e07SQUXJ+A0Egzj/8qztSo88v4C/w0W3S73/PMt+bw+6wAO2tDd/+vbvS/pJeLeveXexPvvCCXZGBzyyx3A6BX/Cu7dxg1OGQ3BGOACxM7Lxx736Rv6tQRW9QHsuCApwiPE6RAFtUQOzjPwETDbAujmHtvd9uTc4Q3gXxMRK9MP2AnQCvdMOShCgRf3KwM/6uszFQLv1vUoIxXn3NkgMNXm5RD4xzoY9usJ8tfTBeDRBhXaL+jSLOcWAPz//zAiNPAQKPr4Dw0C7RDvzPMfLSMWEw9zABX6Ic4AHPL42foES/Md8goG7AMV+wQSBTI="
  },
  {
   "id": "modelo:vehicle_detection",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Detección de vehículos (Vehículos)",
   "ruta": "/vision-lab",
   "texto": "Identifica carros, motos, buses y camiones en escena. Detección y clasificación vehicular como base para LPR, control de acceso y conteo de tráfico.",
   "h": "05cd964166775096",
   "v": "8Qm83s/oqyTKHvzdE9oKFfQ64xr/B/Lb7coHMSC5Jdje2vUY3DPR/iMdHhn2+wzb0hHB4uUy/hbpAiQOyf0vNRwApwD/3RLoDfX+OOJB7eoL4QQA09Pg9O3m/SXJOgQ3EKQyF+4DAs7/1B4L/DwuyR4rPukd2BG/AwwXkxYWBt70EenrQg8M4Q/k1Sgk5yVMzf3271sd/CvuBLju9AjF7frRAwvlLOUHlSPdKBK91+4bFhK4uvPw8f/61PMCCM0oLG83DOUJ/areE0He9wYrFPwRXPMTBdg63igzH97rO+fsJkDJ36jY+foF6fUK6R3YEDwb2QsP/h0zEz4Q6fAhRcX09N8fItrt79okHw4a888p5M0UNfo3RPseFUMDOeXMvSUjCPTeAyIe7Ur2Jgb51Lps2tP+uOfu+M3fthTjMdsJ2vHc//Xi8jDQITQNyQet3g/lDOwKxjFHDgTSLvz2pOPFykvPGQcS2iM9I/X2tBABujPIDRUJqTEjviDrJSXlFwgXO9nW7Mnn0PvrXykIO+z6yDLXOfg0IghKnRwIAR0z+vQnPjTgFeQWRRTLu9olIBnA0gfx8AjyDSgrB7/RMBqwLzrLLNCkGM8S7wMREylHKQDZXwjSVfnsAQXexOcB5wb02xx/6DTO+e3uEfLK3dcEJv4Z3wDSMyslCwToAAg="
  },
  {
   "id": "modelo:ppe_detection",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo EPP · Detección de protección (Industrial)",
   "ruta": "/vision-lab",
   "texto": "Verifica casco, chaleco, guantes, botas y gafas. Cómo ARS valida cumplimiento de seguridad industrial. Detecta personas y verifica si llevan los EPPs requeridos.",
   "h": "d461796c04d04097",
   "v": "8yHeB9AEyxID7wz8KdoJHQsRyibdLfPz9N0wJRrkGsnv9+wIFj3XDjsk/Bj33iLu6u0P+hBMz+TwARQV4wwRKvsEyhb82zjv/QHEEQcO/yYJ89z7/PDe7PYG4/T39yI3GM8LHAnlAN/8DAcX6+ox8wdGLPwtvTnB5xcMhPHw5doDzdnbUAAEBSLU6BjwBQUU8vAN61cS4P0FAL3l5fTtxPEX4Ab8JPYCtzXCBwjq8NwOOO7J0fj74wD83OLQ5/oZQjAQ5Nz+DN/FCzjlDyQTJRHvaBcoGwk7FPQnCrkDLwXWDTPRAa/FCwMN6Af69RLMBjIg5gAB7wwaGRoP/fAgFPz/+NkHKenyDPEa9+fyJQcREeQbOO7/PuUV+RPzIs+8viMk/BkR/wUW9/3W/T8EDM02+uPe38Xn+M7RwPYKJKsO6gq+4gX0GB7dEx0T4hrY/kATFNv6xxYlCvfERCz9y8TfxPwO2e7+5BckCQMUowkEsBfR8Qj25RgS5fzrOwkCJvrtXd/S0dTL1AnzJwEPDtLt0zP1Ls09BQYjuxIZJBA4+ND4LgrgAv4HEenY4ekJN/fT8gED3h8mARED79XM/d31AyXWPuHZQPH6KyANGz0eQuHUTQvhH//uMyTp5dX6Axza2zV/7zm49ffoD/IU5PPkIhcR+/T0/j0AFf3+/B8="
  },
  {
   "id": "modelo:plate_detection",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Detección de placas (Vehículos)",
   "ruta": "/vision-lab",
   "texto": "Localiza placas vehiculares en la imagen. Primer paso del LPR — encuentra dónde están las placas. Suele combinarse con OCR.\nAviso: El reconocimiento de placas requiere autorización del responsable de datos.",
   "h": "5b7c4f5e6ce325e7",
   "v": "9iLP69360wO/Ew8ED9X2KAIe+C8f/fri9t77Hwfd/tryCef//T7PDicVFQYF/PDY3wLp99pG4Rb7AzMS8wArEBwIsSH2+QMI9vn1DwRG/ub66fsC29jl8gDiECTbCPgs9sweLPTr+LIM2wgd+hk4AAgVOAME7xnI5BkQzvsGBur+8O0JPQL65ynVyhgqABc81AD34zsnCBf7/a/vA/XcANz5IQ/mKP/xrVvMD9zN2AEwFAy7vAXj7wAQ4wgFFcsTGEgn7AAA5Y/WGCr8BwAgEyH9Nd0m9+ML6gA/HfX6Mwb0BE/Z/bHx+BYA/OMD5grlCxsO2SYACu1OESYUx+wOU+T/4N0VOtnpD80UOfcK5NQq99UHEukhQ/wb/TvzLt/Krhos6fsE8g4G4zgLFwAu3b8+/+L9yenrDs8J/RjlGcIC7wLU8e/z8DjtMzrs3gPMzB/lAxUM5DlEABHMIAT0zfDe1zzuBA0V8BEeAgELvw4I4yO4+RLr3xgWxiP6GwXuE+wRCdDi+9/tyQHwOB8HKe3u2STWHPAvEg9JqCEJFv4c+fETNjnw7/gTJgH2w+glGv7E4+0R7fTr/B8b9rj4DfroHSz2GPStE9EEChcHCBMqI9r9RQjZMBcF7QfXtsvoASYF0CZ/ASTn+PDzAvbu5+7xCxsf6/fjHzIXAPbqCSc="
  },
  {
   "id": "modelo:plate_ocr",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo OCR de placas (OCR)",
   "ruta": "/vision-lab",
   "texto": "Lee el texto de las placas detectadas. Cómo ARS extrae el texto de la matrícula y lo normaliza para comparar contra listas.\nAviso: El OCR de placas requiere autorización del responsable de datos.",
   "h": "92c349e66fe81ef1",
   "v": "9yfe+usJ6/Lf/w/qBAYHIAQO8hoLCA7iCO3x/Arn+uAEE9sFFBL88yEMChQT+Anl8Qv2BvMt8A36Fxb/CA0U+w0CyBj8Av0L/f7v4/M5CvcS8w3+9vPpBfno/hjh7xQX4+UZDfTlAugA9fv51gwV9xf8Lfjv7AjX8Qz/4gcCCu3q4u8BKgHn6h/s7xwL9/kO4ff59gkjFw/wAecBBQjs4+n3FAbwHQPx1TbX8dPW0gQT9wLa2QPg/gX9APgAFPQPFysl6AL568rrDxH4BPMdGQ/vQPIYDeQI8v4rE/bxEAH2CTz4FMsPFxLzAeb47gD89BwB+hEL+9I2GiIg5QD5KtsJAOgFH9TwJ+8DHPPs7/AZCdb4A+oQKAImBirwHO7X3ggp+BL+7REV7CD6/RMV7sEk/u8M3N8A/9r99QXoIOYY8ffu9PwCBSHuJQv++RHd5jYGBfv36SQY7wbnJwnwA/D74Cfp/gz9+BQqChf40hwG0BHa9wXx2voe6RcHBvzuJ/YSGOkC5Qvs3gAEGgcEGPgB5SjoIP0hAhQxvx/5GPUD9/P+FBrs4PYGHvXg1/MKAvDh5fog7OrwCPUG+uEFDPXjFhLpE/bRGdsAChT9AAQQGOgMNvvnHAYY9vvv18Lv7v0B9Bx/8wL0CggMBPgM9Q7X7PcO9u8F+RYF+wQKDQk="
  },
  {
   "id": "modelo:face_detection",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Malla facial · 478 puntos (Personas)",
   "ruta": "/vision-lab",
   "texto": "Malla de 478 puntos + análisis de acciones faciales. Reconstruye el rostro con 478 puntos de malla (incluido iris) y analiza 52 acciones faciales (blendshapes): sonrisa, sorpresa, ojos cerrados, mandíbula abierta y más. Sin identificar a la persona — sólo geometría y expresión. Corre 100% local en el navegador.\nAviso: El uso de análisis facial debe cumplir con las leyes de protección de datos del país (ej. Habeas Data en Colombia, Ley 29733 en Perú).",
   "h": "c213c6a79b2e9173",
   "v": "EDYbJ9/i+wL9BhTEKcr7M+jYDP8G7/TnKPf99gcF4uj/8+Ua4RDfGwYH9iAWrBX33BffM9p15BHh8vcsEfYWFOD+mQwKBeEHC/3U7CIa584O6ALt/x/e/NIb6BWdABUQ9hoCNhQBIwkrCCgU3yxE2wLvQwwk4fex/iYBqPvTLPzt3vIIIs7h+kz4xQH09QL05hzxMxcV/zQkC8en9Nvg0QvCAvf9R9gLygsE3+y28P0I7PP72Tb5+OTl+Q4D+PIhEzsb0hTatNOx9C+73Acz6e4gbQRa/ccw5AcFT9ElS/cv6mbUz+UF7BHsKdL0Ef/0DhcsFRoj6fFC8zg25QMMCswO+OH4BLj3B9jyLukB7Pk7DeULSN0LFswWKxkDChHMoQ4i5xDj8BL+9xobH/RB9MRfFhoh+6/jCBPl4iElE9jmzQbvq/nZDyXUSgL+3eLc3hTQEM/R7OdCACf0N7UA2Ozy9ybxvhn84OQ8J/Qyuw0Pr+bl+AkbvR8j2iIMHQvzHOY0E6jq/u3X3Ub9ZA3xFu0T4Q32ItIkGB/fgQbwLfc9CeorJeoN5PEiKBr+DOwHK/fj1RU/6gHJFvPv99rX/fvi8iLxMebRQ9f8DDgJ9zYTNtX5Kgzh1Rw2/wbuqgf3IvEY3RJC/RUuE/31O+4o7//nCtYF9sL57/8a9ukSAzw="
  },
  {
   "id": "modelo:face_recognition_demo",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Reconocimiento facial · Demo (Personas)",
   "ruta": "/vision-lab",
   "texto": "Compara rostros contra una lista demo blanca/negra. Cómo ARS valida acceso por rostro contra una lista. SOLO en modo demo, en entorno controlado.\nAviso: El reconocimiento facial requiere consentimiento explícito de las personas y cumplimiento normativo. Usar sólo en entornos demo controlados.",
   "h": "36a4ab40bf9021db",
   "v": "/RYBDvHo4w/xGgfaItj1IN4P8QXfHff7GeT/9CX4+N7rC/UnDQzn+gcM+ygDBQXx4xvR8PQ46fbp/ggdAwz+COoIyBT8CPr9AfTmGBUl7NL+/QX2CujD6wv1DQThByspCekhKgPr+vcEAB4U5BUA9h4SLAYY1RjO/A3v2AziL/0C8g4LJ/fTABfs3xgB5RQk/BH+BQ8yCAr/98zP9/Pd1vDbEOroJwANyCP7DwDb6Pg6F/TX5woG8Pbf8O/+7AkY7CUZzwkE6cXR+RD87hMZ9ef8T/wr5eIM//LzNOP6IAH86jTb+8L3GRYBItfz6f8M9xMU8Bga/OcpASAX9gYDJO4I5NPnD/Xv+vnzIfcHEPwcEe8KS/0aEPcVBAbuIuTIswUczhH4Dggn+yntDwUbB98s8g7+09XlF/v60xrnKuzq7+0Q1v/k7C3DCvMI8QnX8ULyGu7m2Qcc/CfdFufu3NLx6Rnb5AUQ8wgp+wr96PstxgfY9gf36BsQ+Pnn9vngAvwEE+Tf9eL88ScDGxX4IOgO5ADv+wc6FP4WrQgQBBUdAvQLG/fb0vwiDv3z4839JAvi7gYC7/bpBfzsAOPdCO7u+QDyG/fYIPcEDfzt90MgC/YQJvHXJPz08v363OkbDhwH8Ch/7BHuFPH88/cN6Q3tAP8E/fQT8Qv99PsP+Rk="
  },
  {
   "id": "modelo:pose_detection",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Detección de pose (Personas)",
   "ruta": "/vision-lab",
   "texto": "Estima 17 landmarks corporales por persona. Base para detección de caídas, posturas anómalas y análisis de comportamiento. Procesamiento local en navegador.",
   "h": "47a7aa55d3c129bd",
   "v": "9zECE8P11v37BBThKrgYNvAW9xoH4QHLH/cfGg7mCtnxCegc70TVHBcIADXpzyXw6SfYAPR23wICGxtG8/EvFAX4oQb70QEGDPz15+s45OkDzRYC7+bs7OINB/8BMBH/G9odACbmDeb52iIj8kYW9OgXLvse7S67Ey0UvAbl/RL+AvwgRQXlBiXesg4G6SAy4SgqVDYeDAf0AqzpAe+75Q7dJQIRU94JpgMF/hft3OFN9v7G5v4Q/dPg+BMRDegcNUwuz/wN7b/ZCjuz9SYYH/r1awU2Buk39eMBPuQpX/3k3HbO8rcJ7Q0eBAwE9wjlBAAC+Q4h3usgEi8C/+0USdb53eYJ/gDXAtkB/PMMBeoAA+kyJ/zdHNw2AgDqHru8jig4BAPn8zMB9UMJ9g0189ZK8/P+4sH2LPC+qRsPDdnq3wIAzQ3RCSTkMQAS5RjJ2hTtG8zA4BNlDwfAF8kA39np0Bjwxx4A0fNBACIWpQkf1wDC8xXzzQ485zHtMhLyCfMJFrvN0NHE0iffTwzzDPoS7wHv4e8pG9gjgRXcJwtZ6/QeHhXt6sYdF+/l6/gUJgfO6CUm7DHu8+4HD9XEDuTfFi77MurvJcUoESQU/igaM+0L+fQHCQ36+QzkvuAUGBIh3BV+8UADA/33HfH++wMiJ/9Az9IhDR/rDfP2Hx4="
  },
  {
   "id": "modelo:fall_detection_demo",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Detección de caídas · Demo (Personas)",
   "ruta": "/vision-lab",
   "texto": "Estima caídas analizando pose + tiempo en posición horizontal. Combina pose detection con un timer: si una persona queda horizontal por > N segundos, dispara alerta crítica.",
   "h": "afca33037c6e6ee2",
   "v": "7yoJ/cgG1ioFEPvvBtgwPuv12hrNCRrbSNQ2Cy/zKte+CAAW8zy+8SIPCTrY5BkI9EHl/Pd//9gHJj4T9vMuMAn0owwV5w7yDAAAGfQK6w0lz/MQ89rC4/r+8Bz/MvwHW8sh4BzzHuXi+xwu6jk2CM4oQfso8SzI/w8Euwbe5B/7IPsKTfLeBCD+r0AQ5gM07jU1I0wSEQX379Lw9uG4zgXMEgLtQeoCpicSGy39IOwoEvmz9+YQ9t3IBSQb7N0UFSUZ7PYX+rzBA1KyIjsIOOzjeQA68uQtEOINL+QRRvP44HPYFNLo4yUrDScB9/zr+g0C6egU1egZSSII7gsZKuzzw8cu4ezT/uAC3/wZA+wDHhdFUfTqK+E98vX9BMvOpQ8F6A/d9xziFhz26hIV8tkaCwLS27j6I/TRrTfwH78C0wHp1/MEGkX0EQQL5iPn3Cj9IuS4wT5M/vmrH+XY4/Hd9indxAr6rus48C8ksOU23/bv5R/Q2Q0EIx3XOuPt/Q8BJL+8xtO59RTrNAcNDPb2wDr85iAwBNMjnCLaKwA05uIvE+Tu28cRCe/gvP4JKggD6yYP7jX89wAaF97HBvr1GSjxJr3xKtEw+QEcAiAwD9IQG/XsCxni8RX55/MkAR4k6jJsBRoAHPj5Ku/m7QQsMvs07uYnP/btIvUaGR8="
  },
  {
   "id": "modelo:roi_intrusion",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Intrusión en ROI (Perímetro y reglas)",
   "ruta": "/vision-lab",
   "texto": "Persona/vehículo entra en zona poligonal definida. Regla de negocio aplicada sobre detecciones. Dibujá el polígono y movete dentro/fuera para ver eventos.",
   "h": "94b4976cd8ba6e2a",
   "v": "0zLxDdTz3xfgIRcEKuf8CPcV1ToOLe7i6/EZNB7wM9bsyeL5AzjeDAUkBjAnFPv91hDk9ANN3RAI+wsZ5u47Ig8anQ0l7hYYDf4p+vIz5usp4B7w5PnE9xDdCiDk7/4gFe0hIAHCB+4UEvsf9ww+6A0VLeEi3za9AfDtsgLs9NIR+f0GHeP6GB/63QLhCBICxxD8HTYTDgDdAOj4+QLuANf36gP0EPwNsyv/9+XqABMMEyPlzRr/CRoB+gj45O8tGDsozfoF7OUB+0Tg/BkeCPcLTuko0+ksGCkkOeMGF+z1PzjS8Mvu9xTnKPgC1vT7BSAY4AkNCBz6/BkZDgwXJ+YH8d0l9eP7F98jGfzn6NsAAuAHKPgbDuUv6gvrJ+fg4hQDCO8K9+kU2DwAGywC28o6Cdf61N3tDunS0jcREecJ3e7+8eb2GUTGN/38+Pne5CIHH+j2BRkOIQrOMADv0Mf89yr98AsZxQQXE+z9zeMW4hDg7BQI1B86+hznKf79BAUiLtfy//Dy7vHnRiAGLf7azxvTESUd8AwYqRQBFAIp0+owKRbs8tYUIR8CshYpMfTfzhzV9P787QkxI+Pl6RDHAyLlFO3IJu39HOcSDTE2IsboExvQIykV+QnmzuvgCwEa+wx/3gjI+uMABPEO6OoAOv4k3eUC7y3y1v0MECU="
  },
  {
   "id": "modelo:line_crossing",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Cruce de línea (Perímetro y reglas)",
   "ruta": "/vision-lab",
   "texto": "Track cruza una línea virtual con dirección detectada. Conteo de entrada/salida y detección de paso. Definí la línea con 2 clicks y movete a través de ella.",
   "h": "b6ccdc165429b059",
   "v": "1SEC8tr78grqMgnyJvLw+ukPDDAGDw7j9uQWFxbmDdTp4eoM/zbqGwMhLj0o/v0F+DLtBeYa4P39BDwFEhsaFhoxvhPl4vEe9hwj9vMwBQYs1fjf9ev34ybvBwLhJhQoDN8dAyDhA+AY8Sgc9xdJ/hcbYNU9uETK8gYXn+/R+OX2Cd8dLQbeIvAE0Cba6AQRBCvhOSgB9CPxCN8E9Abg2/rPFCz3/fUsuSz98vH3CfL2+vHx1iIP+ATuFQvx2r8o+kj9Cv8I8rXxGzPJ5CkT/vcQSf8C7uIbJRMvPdXnIekIHTm/8uMABzDnLwP1yCLO4AAN+QQN6wAkGCcc6CMkO9gSC7oU4efuGPsQPOHh5gX17vcPMOMn/wEu7hnrJsT3/usHA+8DByku7CPj/Rgf885P7Oj93KIQ7eTn0insD7Qf/Qb8/OnqGy3nTAPi6fbk0SXnFuL+7hUgDA25NdfLyeT7CArI8QwH0+8IGuD54cf73CndHRcHxiAR2iHtH/nrCQMVQ+HbGPUL+TL9ZxsNDffCuSvm7wUsECwH2Qf2DSIbziBAFRva4OUUHkLpsvAeWxvw6PzsBOkDARYd9eDX5AXV8SfpKv0BILMAGd8pFy0pMO7zPhrjGCT93jHT6vD+BBcWCyB/8wnV/+kI//T72dcmI/Mq+ekkFRUF/Q8ECAA="
  },
  {
   "id": "modelo:loitering",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Merodeo / Permanencia (Perímetro y reglas)",
   "ruta": "/vision-lab",
   "texto": "Track permanece en zona más de N segundos. Timer sobre tracks dentro de un ROI. Útil para detectar comportamiento sospechoso o filas largas.",
   "h": "85818960acf53c38",
   "v": "5yD77b4NAv3lJPv4FuwVAewSAD3xD+rqBu8IOibaDtzx2tQGFxrgBf8IAiE19OkV90HrK+ow/RAEDkH1BQJCCAUjnAz/5f0FBPsYBhUZ/ewm2/MI7ura3SD27//jBwX1DuUJKwTl+OkHBw8U3g1F8P4TSt0NBB7i9w/0zAjv/90G/gYNIfneCQ//3CHy/BgcCDj9Ih4F9/LtEPDtCPbl8fj4/hARHusSxAopFejMFP7yFADx2wILHgTt7wgD7tAoFjr52QIV4NHnHCrF9iUkEOYFOxUu7s0LGR04JPD8GBoEMjrd5NQZ8fzeHg0B3A3Y9R/57voZ4AQICBD+3AgWLOIa7u8Z0ewCBv0gDQHwD835/AUYLfD1CedB3hT/Gd0ZBwz45gv/7O4d0iXyChAS6MQh8cv26N7l+erkuzYGR8sKz+oaD+3vDTPvLwbr/PbW+hjUL+Ds4ydGEwbZLPDVyPH39gj42wMM4gQADfD84PYN+wjh8g776xou5hncDAAGHgX+M7rt4vf5BRL+LTQUIvHTsCvjERNFERgh0Q8HF/0D7vwiDAPY7NsGHwrgu/kfUALt5g3x3/QTAvk37e3XARHQECjnEufyLNIJCvz4CxAfHwT3H/b9Fifv8DHi6ujcHfoNEwh/CxTN+eQG+/H39s8DRgMp+/EpFgH09A4Z/CQ="
  },
  {
   "id": "modelo:abandoned_object",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Objeto abandonado (Perímetro y reglas)",
   "ruta": "/vision-lab",
   "texto": "Detecta objetos estáticos sin persona en proximidad. Mochilas, paquetes o equipajes que quedan solos por > N segundos. Crítico en aeropuertos y plazas.",
   "h": "3fc91502b3ceb048",
   "v": "3D3o7qcC4Q/6Fej9Kdn+R+sb4h7gJN/q9+0iUTPzN9fh5vMd2DLTDQoLFv4MGCwf+RvSEAtH/9rjDzsbDBMsZR4GogDX5QkP6r/oFS8r6gAO5hMR2Oey9gvq5CXsBxoVL8wVLQ3dHeP52gcH4yox/fQyEdgN+0TbGRT6nwbVAuXdCg/2O+j8GQHf1ScB9is87DxEP2pDFQEIA8z2+QLd+e+4/A8SLAEvngUDDQjZ4CEa+fTR+/z69Ani8vHkE9QdJHAcysn+DLnGAkGxERNONw75bOwR1+UWNDAXL9AZOwn+EDK49MLY4vr7HAzcCfD5HvsO3uwm3Rw1CkP6CwX/QeX7CcIZ8fj/+8s85xgt090M2eUvGeMJAMFEIg/tMdvoxURGDQQS9gD/2zDiGyYo46ApRvnZA67rw8y7qBgZOvUR2SnV69MrIynuCA0M9CC87U76Lf3w6iddGBfRLd/yxM78uQzn5hUY5/Y5CPkJ5/0R1/T38fz7uRIn9xEOK/cZNSH2IsXb4v/c3CrzTgXyIf340kbbBQ9CJgZGtRj1AB4iAPUjHBXlAucbJxHlkQ8BOvvh0wYP3NYP3uNZAdjjEjfREgfjHdvaIL8V/iUtGSlMPNDmMSIECSH3Bhjq3uTxFwMf3QZ/3ybm/NABCuwC7+H/X/NHwPv2AwIF/wrvER0="
  },
  {
   "id": "modelo:scene_description_vlm",
   "fuente": "modelo",
   "titulo": "Vision Lab · modelo Descripción de escena · VLM (Experimental)",
   "ruta": "/vision-lab",
   "texto": "Modelo multimodal describe la escena en lenguaje natural. Experimental. Un VLM (Vision-Language Model) describe lo que está pasando en la escena. Útil para auditoría y reportes.",
   "h": "0a8b5a38bf6f3476",
   "v": "yj2+3+cE/RHhDf7wFvTuH/AsDCzzBccl/eH2SRsBK8/x9dI2ABH4BgDyB1QtLx0E1i7S+xlT+9kd8QsQBPcNNwjnqCvtAA/58BTcHs0U/+MX6Aky6ubtFBnzCezfKjdSBMAmSQAHF+EGCBwS3wH8BB4bNNcX0hS14hMLlQTOG+kYFvMJEsDWDdQPskEK/z4YAkAiPRId3/HfLb/b1u/w6SrdMuvqK786ywXS/u+y4u8MzQzNu0rs+OPi7RoPt7oUOUQnAf0739L4KjyX9j36F+4ITTFUFMgkAA4BDfL4PAjYEyO+38ER3wPh7enoDe3xJRcfDxUu+ccqGzcGuO4iPqkf3+kT6/gZBwIME+7l6ccYLfHfOuRGVuQe/SvYI+vzxggc9BXf4zc4FS0KEfsxF+N37bry5/3YNOXEtQnsBOX+5uzN1BHiEBMDLggs+kmrqSYWEab+zSUzFBLwSvsAqBLu7Q31BBkGzfM+F+rq6fnuvivOy0XjzhX+uxDoL+rl/f8URtzq2evm6QoHQy0XHRjxvjPnExtLICs0jxXtFQ1NBzFTKBXw2QIaBOHS7dglSu4LwwTz8OgcIdbbDg3WFCDaLRIPFt+uWuIkCxEYAA4tI9rJJyH6HCf3AyH2uQ4ERDz31CF/8PkSIvHVyPD/9dYFPfIJ/tz2GRYeCwQ1/CE="
  }
 ]
}/*FIN*/;
