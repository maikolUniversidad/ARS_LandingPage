---
id: que-es-ars
titulo: Qué es ARS Intelligence
orden: 0
rutas: ["/"]
---

## En una frase

ARS Intelligence es un **laboratorio de tecnología dedicado solo al desarrollo y la innovación en seguridad**, desde Colombia para Latinoamérica y el mundo. Trabaja para **empresas de seguridad privada** y las lleva a una nueva era en la que toda la operación es inteligente. Titular de la portada: «Todas las capas de la seguridad. Una sola traza.» Lema del sitio: «La forma simple de hacer que todo funcione».

## Posicionamiento: todas las capas, una sola traza

ARS no es un conjunto de programas separados: une en una sola plataforma con IA todas las capas de lo que pasa en un lugar de seguridad, y hace que todo fluya como debe.

1. **Vigilancia física** (en operación): el vigilante y sus turnos, relevos, rondas con QR, minuta desde el celular, radio PTT y botón de pánico en el mismo teléfono, y el supervisor visible en campo.
2. **Visión con IA sobre las cámaras** (en operación): las analíticas de `/vision` sobre las cámaras que la sede ya tiene; cada alerta llega con foto y video y **una persona confirma antes de actuar**. Las analíticas disponibles dependen del equipo de cada sede.
3. **Sensores, domótica e IoT** (en **operación**): sensores, controles de acceso, alarmas y relojes biométricos en el mismo panel que el resto de la operación.
4. **Robótica** (**en desarrollo** en nuestro laboratorio, no es un producto comercial todavía): perros robot que recorren y verifican con las mismas analíticas de las cámaras. La plataforma está pensada para sumar nuevos dispositivos. No prometas fechas, modelos ni disponibilidad; si preguntan, di que es una línea en desarrollo del laboratorio y ofrece hablar con el equipo.
5. **Central de operaciones y gerencia** (en operación): mapa en vivo de cada sede y cada persona, radio, chat y pánico en la misma pantalla; la gerencia ve en tiempo real qué está cubierto, qué falta y qué pasó.

**La base: un ERP de gestión hecho para la seguridad.** ARS no es solo la central ni solo lo operativo (lo que se ve en las cinco capas). Por debajo, todo se apoya en el ERP de gestión de ARS para el proceso base de una empresa de seguridad: contratos y turnos, personas y nómina, documental, formación, clientes, finanzas y facturación, y gobierno multiempresa con auditoría. Las cinco capas lo alimentan solas: el turno cumplido llega a la nómina, la ronda y el evento al informe del cliente, el servicio prestado a la prefactura y todo a la contabilidad. Operación encima + ERP debajo = una sola plataforma; el laboratorio de tecnología de seguridad está construido sobre esa base. Si la empresa ya usa otro ERP, el Agente interoperador de datos lo conecta con ARS, completo o por partes. Cada módulo tiene su estado real en `/servicios` (por ejemplo, Nómina y Contabilidad conectada están en producción; Facturas DIAN y RADIAN —bandeja de facturas recibidas— está «Próximamente»; el cotizador y CRM propios están en la hoja de ruta): no prometas lo que no está en producción. En la portada se ve en el capítulo `#erp` y en la sección `#la-base`.

**Todo es una traza**: cada evento queda trazado de punta a punta, del puesto a la gerencia. Ejemplo de la portada (escenario de demostración, ficticio): una ronda reporta una novedad en la cerca norte → la cámara 04 confirma con cruce de línea y el operador valida → el sensor de la puerta de la bodega avisa → el robot del laboratorio verifica → la central despacha al supervisor por radio → el cierre con evidencia, responsable y tiempos llega al tablero de gerencia.

Otras ideas que comunica el sitio:
- **La IA apoya al equipo humano**: multiagentes de IA que proponen y una persona que decide.
- **Alertas con evidencia**: foto, video, ubicación, cámara, hora y responsable asociados al evento.
- **Multi-cliente, multi-sede**: cada sede, cada cliente y cada turno en la misma plataforma.
- Cifras de la portada (salen del catálogo de `/servicios`): 10 áreas de servicio, los módulos del catálogo y cuántos están en operación, y 8 analíticas de video. No uses otras cifras (no hay respaldo para «< 48 h», «24/7», «12+ modelos» ni porcentajes de precisión).
- Plazos de despliegue, precios y alcance de cada proyecto: a confirmar con el equipo comercial.

## Presencia

El sitio indica que ARS opera centrales inteligentes en **Colombia y Perú** (Latinoamérica). El mapa de `/proyectos` muestra ciudades de ambos países (ver documento de proyectos).

## Ciclo operativo (8 pasos)

1. **Programación**: turnos, servicios, sedes, zonas y responsables desde una estructura centralizada.
2. **Asignación**: personal según cliente, sede, puesto, horario, rol, disponibilidad y necesidades.
3. **Ejecución en campo**: los guardas ejecutan rondas, tareas, registros y novedades desde móviles o estaciones operativas.
4. **Monitoreo en tiempo real**: la central ve ubicación, estado del personal, cámaras, eventos y actividad en vivo.
5. **Alertas y novedades**: cada evento relevante puede generar una alerta con contexto, prioridad, ubicación y responsable.
6. **Evidencia**: fotos, videos, formularios, hora, ubicación, cámara y usuario quedan asociados al evento.
7. **Reportes**: la operación diaria se convierte en indicadores, bitácoras, auditoría y reportes gerenciales.
8. **Decisiones**: mejorar tiempos de respuesta, cumplimiento, cobertura y calidad del servicio.

Verbos que resumen la plataforma: Opera · Monitorea · Comunica · Evidencia · Reporta · Decide.

## Los dos grandes bloques de producto

- **Operación y ERP de gestión en una sola plataforma**: la operación (capas de la portada) encima y el ERP de gestión debajo; el detalle de cada módulo está en `/servicios` (áreas Gestión humana, Formación, Finanzas y ERP, Productividad e IA, Gobierno y seguridad).
- **Plataforma de operación y ERP de la empresa de seguridad** en `/plataforma`: turnos, personal, rondas, formularios, mapa, PTT, central de monitoreo, alertas, evidencia, reportes, multisede, y el ERP (clientes y contratos, nómina, costos, facturación, contabilidad, cotizador y CRM). Si la empresa ya tiene otros sistemas, ARS los centraliza o hace que la información fluya entre ellos.
- **Módulo de Visión (analíticas de video)** en `/vision`: 45 analíticas en 4 familias que corren sobre las cámaras ya instaladas.

Además hay demos interactivas: `/laboratorio` (modelos de IA en acción, con cámara o video propio) y `/vision-lab` (playground técnico).

## Contacto

- Diagnóstico de la empresa con IA (llamado principal del menú): `/diagnostico`.
- Solicitar demo: formulario y botones en la sección `#contacto` de la portada (`/#contacto`), de `/plataforma#cierre` y de `/vision#cierre`.
- WhatsApp de la gerencia comercial: +57 312 462 3357.
- Correo: j.muriel@ars-group.co (asunto sugerido «Solicitud de demo - ARS Intelligence»).
- Dominio del sitio: ars-intelligence.com.

Precios, planes, licencias y condiciones contractuales no están publicados en el sitio: a confirmar con el equipo comercial.
