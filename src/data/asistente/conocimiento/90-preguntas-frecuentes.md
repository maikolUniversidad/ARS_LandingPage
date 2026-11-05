---
id: preguntas-frecuentes
titulo: Preguntas frecuentes
orden: 90
rutas: ["/", "/plataforma", "/vision", "/laboratorio"]
---

**¿Tengo que cambiar mis cámaras?**
No según lo que comunica el sitio: ARS se integra con la operación actual sin reemplazar hardware y conecta cámaras, guardas, NVRs y sistemas existentes. El módulo de Visión indica «0 equipos nuevos»: corre sobre el circuito ya instalado. La compatibilidad específica de cada marca o modelo se valida en la demo: a confirmar con el equipo comercial.

**¿Cuánto tarda la implementación?**
El sitio comunica despliegue en menos de 48 horas sobre la infraestructura existente. El plazo de un proyecto concreto depende de su alcance: a confirmar con el equipo comercial.

**¿Cuánto cuesta?**
No hay precios publicados. Existe una familia de «modelos lite · bajo costo» sobre una sola cámara. Cualquier cotización: a confirmar con el equipo comercial.

**¿La IA reemplaza a los guardas o al operador?**
No. La IA detecta y prioriza; opera como apoyo del equipo humano. La central, los supervisores y el personal en campo deciden y responden.

**¿Qué pasa con la privacidad y los datos personales?**
- En `/laboratorio` y en el motor «IA real» de `/vision-lab` la detección corre en el navegador: el video del visitante no se envía a ningún servidor.
- El reconocimiento facial y la lectura de placas son sensibles: requieren autorización del responsable de datos y, en el caso facial, consentimiento y cumplimiento normativo (el sitio cita Habeas Data en Colombia y la Ley 29733 en Perú). La malla facial del laboratorio analiza geometría y expresión sin identificar a la persona.
- En operación, la evidencia (foto, video, usuario, hora, ubicación) queda registrada para auditoría.
Políticas de retención, alojamiento de datos y certificaciones: a confirmar con el equipo comercial. No afirmes certificaciones.

**¿Funciona en la nube o en sitio?**
El sitio menciona edge + nube según la latencia requerida, y que las analíticas de Visión corren en el propio servidor del sitio. Arquitectura exacta por cliente: a confirmar con el equipo comercial.

**¿Qué detectan las cámaras?**
Personas, vehículos y placas, rostros contra listas, intrusión y cruce de línea, merodeo, aglomeración, EPP, caídas, armas, peleas, fuego y humo, objetos abandonados, hurto, y analíticas comerciales y de inventario. Ver el catálogo completo en `/vision#indice`.

**¿Las analíticas están todas disponibles hoy?**
Todas están disponibles; algunas muestran además un sello del equipo de Visión (p. ej. «funcionando a diario» o «con evidencia»). Lo que se confirma en la visita técnica es el equipo de cada sede.

**¿Sirve para empresas de seguridad con muchos clientes?**
Sí: la plataforma es multi-cliente, multi-sede y multi-zona, con turnos, supervisión de guardas, reportes automáticos y trazabilidad para facturación o cumplimiento. Ver `/plataforma#arquitecto-ia`.

**¿ARS es un ERP? ¿Tengo que dejar el sistema que ya uso?**
ARS es un ERP completo para la empresa de seguridad: clientes, contratos y planes, órdenes de servicio, nómina, costos, facturación, contabilidad con asistente de IA, cotizador y CRM, junto con toda la operación. Y además se adapta: si la empresa ya tiene su propio sistema u otros contratados, creamos los mecanismos (Agente interoperador de datos, integraciones y sincronización) para que todo se centralice en ARS o fluya entre sistemas, según los módulos que contrate. Ver `/servicios/finanzas-y-erp`.

**¿Se integra con mis sistemas (barreras, alarmas, control de acceso, otro software de gestión)?**
Los casos de /proyectos combinan control de acceso, alarmas e IoT dentro de la plataforma; con el software de gestión que la empresa ya use, el Agente interoperador de datos conecta por API, por backend o por cargas programadas. Integraciones con un sistema o equipo concreto (barreras, control de acceso): a confirmar con el equipo comercial.

**¿Dónde operan?**
Colombia y Perú, según el sitio. Ver `/proyectos`.

**¿Puedo ver una demo?**
Sí, cuatro opciones:
1. Probar ya la IA con tu cámara o un video: `/laboratorio#demo-stage`.
2. Ver cada analítica funcionando: `/vision#visor`.
3. Un diagnóstico de tu empresa con IA (5 minutos): `/diagnostico`.
4. Demo guiada con el equipo: formulario en `/#contacto`, WhatsApp +57 312 462 3357 o correo j.muriel@ars-group.co.

**¿Hay versión en inglés?**
El sitio tiene selector de idioma (ES/EN). El catálogo de analíticas de `/vision` se presenta en español.

**¿Me pueden dar un estimado?**
Ars puede armar un alcance orientativo (funcionalidades, analíticas, unidades a cotizar y etapas) con el sector, las sedes, las cámaras y el objetivo. No incluye precios. La cotización formal la hace el equipo comercial después de la demo o del levantamiento.

**¿Puedo mostrarle una foto o un video de mis cámaras?**
Sí, se adjunta en el chat. Ars explica qué detectaría ARS y con qué analítica. El archivo se usa solo en esa conversación y no se guarda en el servidor; en un video, el navegador envía solo unos fotogramas. Para ver los modelos corriendo en vivo sobre tu propia cámara está `/laboratorio#demo-stage`.

**¿En qué se diferencian dos analíticas parecidas (p. ej. intrusión, merodeo y acceso no autorizado)?**
Ars puede compararlas en una tabla: qué detecta cada una, cómo se activa, estado y prueba real. Resumen rápido: **intrusión** mide qué tan adentro de una zona prohibida está la persona (tres franjas, con aviso según la gravedad); **merodeo** avisa de quien da vueltas sin entrar ni irse; **acceso no autorizado** combina la puerta de una zona interna con el reconocimiento de personal y avisa si cruza alguien que no es del equipo. Ver `/vision#intrusion`, `/vision#merodeo` y `/vision#acceso`.
