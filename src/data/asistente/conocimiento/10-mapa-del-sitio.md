---
id: mapa-del-sitio
titulo: Mapa del sitio y a dónde llevar al visitante
orden: 10
rutas: ["/", "/plataforma", "/vision", "/servicios", "/proyectos", "/laboratorio", "/vision-lab"]
---

Usa siempre rutas relativas del sitio (por ejemplo `/vision#intrusion`). Solo existen las rutas y anclas listadas aquí; no inventes otras.

## `/` — Portada (narrativa cinematográfica)

Recorrido con scroll en 8 escenas más un cierre. Anclas:

- `#integral` — 01 Seguridad integral conectada en tiempo real.
- `#terreno` — 02 Operación en campo: guardas, rondas, accesos, zonas críticas, novedades.
- `#monitoreo` — 03 Central de monitoreo que prioriza, interpreta y coordina.
- `#ia` — 04 IA para detectar, priorizar y actuar (personas, vehículos, placas, rostros autorizados o restringidos, ROI, cruce de línea, permanencia, EPP, eventos críticos).
- `#alertas` — 05 Alertas con contexto: snapshot, clip, historial.
- `#respuesta` — 06 Respuesta coordinada: de la alerta a la acción.
- `#control` — 07 Una plataforma para múltiples clientes, sedes y zonas.
- `#decisiones` — 08 Reportes, indicadores y confianza.
- `#cierre` — «Una sola plataforma. Toda tu seguridad.»: botón Solicitar demo (correo), formulario de contacto (nombre, empresa, correo, teléfono, mensaje) e indicadores (< 48h, 24/7, LATAM, 12+ modelos IA).

Enviar aquí: visitante que quiere la visión general o contactar. Para pedir demo, `/#cierre`.

## `/plataforma` — Seguridad integral en una sola plataforma

La plataforma de operación (ERP operativo de seguridad). Orden de secciones: hero, ciclo operativo de 8 pasos, capturas del producto, funcionalidades (A–N), arquitectura operativa por niveles, flujo de integración (del turno al reporte), casos de uso, comparativa antes/con ARS, testimonios del equipo, logos de entidades y empresas, cierre con demo.

Anclas:
- `#funcionalidades` — las 14 funcionalidades agrupadas en Operación, Monitoreo, Inteligencia y Reportes. Cada tarjeta tiene además su ancla `#feature-<id>`: `turnos`, `personal`, `rondas`, `tareas`, `formularios`, `mapa`, `ptt`, `pot`, `central`, `ia`, `alertas`, `evidencia`, `reportes`, `multisite` (p. ej. `/plataforma#feature-rondas`).
- `#capturas` — capturas: central de monitoreo, IA por cámara, reconocimiento facial, LPR, intrusión/ROI, EPP, alertas con evidencia.
- `#casos` — casos de uso: conjunto residencial, universidad o campus, centro logístico, empresa de seguridad.
- `#cierre` — Solicitar demo / Hablar con un asesor (WhatsApp).

Enviar aquí: preguntas sobre turnos, rondas, guardas, central, reportes, multisede, software de gestión u operación.

## `/vision` — Módulo de Visión · Analíticas de video

«Cada analítica, vista funcionando.» 45 analíticas en 4 familias, cada una con simulación 3D y, cuando existe, video o imagen real procesados por los modelos. Botones para abrir la presentación 3D completa y descargar el PowerPoint del portafolio.

Anclas:
- `#visor` — visor lámina por lámina: simulación 3D (se puede girar arrastrando), prueba real al lado, qué hace y «Cómo se activa» paso a paso. Se navega con clic, flechas o teclado.
- `#indice` — «Las 45 de un vistazo», agrupadas por familia; un clic abre cada una en el visor.
- `#cierre` — «45 analíticas. Las mismas cámaras.»: correo de demo, WhatsApp, presentación y PowerPoint.
- `#<id-analítica>` — abre esa analítica directamente en el visor, p. ej. `/vision#intrusion`, `/vision#aforo`, `/vision#huecos`. Si el id no existe se abre la analítica por defecto (Mapa de calor).

Nota técnica: existe una analítica con id `cierre` («Cierre de puerta sin autorización»), por eso `/vision#cierre` también selecciona esa analítica en el visor además de llevar a la sección de cierre. Para contacto en esta página es preferible decir «baja hasta el final de la página» o usar `/#cierre`.

Enviar aquí: preguntas sobre qué detectan las cámaras, analíticas para retail, prevención, operación, modelos de bajo costo.

## `/proyectos` — Mapa de proyectos en Latinoamérica

«Una red que ya está operando.» Mapa interactivo (scroll para zoom, arrastrar para mover, clic para ver detalles). Lista «Presencia ARS» con filtros por país, departamento/región y ciudad; cada proyecto abre una ficha con vertical, descripción, integraciones y métricas, y botón «Solicitar información». No tiene anclas.

Enviar aquí: preguntas sobre experiencia, ciudades, países, sectores.

## `/laboratorio` — Laboratorio · Modelos de IA

«Probá la IA con tus propios ojos.» Catálogo de 13 capacidades de IA filtrables por categoría (Personas, Vehículos, Industrial, Perímetro, Operación). Al elegir una se abre la demo con tres pestañas: Ejemplo, Cámara en vivo y Subir video. La detección corre en el navegador, sin enviar el video a ningún servidor.

Anclas:
- `#demo-stage` — escenario de la demo en vivo.

Al final: «¿Querés probarlo sobre tus cámaras reales?» con botón Solicitar demo guiada.

Enviar aquí: visitante que quiere ver la IA funcionando ya, con su cámara o un video propio.

## `/servicios` — Servicios: el sistema operativo de una empresa de seguridad

Catálogo completo de lo que hace ARS, organizado por áreas (operación en campo, centro de operaciones, comunicación, monitoreo inteligente, realidad virtual, gestión humana, formación, finanzas y ERP, productividad e IA, gobierno). El detalle de cada área y módulo está en el «Catálogo de servicios de ARS» al final de esta base de conocimiento.

Anclas del hub `/servicios`:
- `#dia` — «Un día en ARS»: una jornada que recorre todas las áreas.
- `#areas` — tarjetas de las áreas.
- `#por-que` — por qué ARS (pilares transversales).
- `#buscar` — buscador de servicios.
- `#cierre` — solicitar demo / hablar con un asesor.

Cada área tiene su página `/servicios/<área>` con una escena 3D que se puede girar y una sección por módulo con ancla `#<módulo>` (p. ej. `/servicios/monitoreo-inteligente#vision-artificial`). Al mostrar un módulo la escena 3D vuela a su punto (cámaras, puertas, radio, nómina…). En cada módulo hay un botón «Pregúntale a Ars sobre esto».

Enviar aquí: cualquier pregunta por un servicio o módulo concreto (mostrar_servicio), o la persona que quiere entender todo lo que hace ARS (ofrecer «un día en ARS»).

## `/vision-lab` — Playground técnico

Herramienta técnica: selector de 14 modelos, fuente (imagen, video, webcam), motor «IA real» en el navegador o «Demo» simulado, reglas (dibujar ROI o línea), panel de eventos, conteo, análisis facial y visor JSON de la respuesta. No tiene anclas. Pensado para perfiles técnicos o integradores.

## Reglas de navegación

- Pedir demo o hablar con alguien → `/#cierre` (formulario) o WhatsApp +57 318 0005654.
- Una analítica concreta → `/vision#<id>` usando el id exacto del catálogo.
- Una funcionalidad de la plataforma → `/plataforma#feature-<id>` o `/plataforma#funcionalidades`.
- Ver IA en vivo con su cámara → `/laboratorio#demo-stage`.
- Un servicio o módulo de ARS → `/servicios/<área>#<módulo>` con la herramienta mostrar_servicio (ids exactos del catálogo de servicios).
- Existe una ruta `/admin` interna (edición de datos del mapa); no es para visitantes, no la recomiendes.
