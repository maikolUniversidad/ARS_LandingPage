---
id: plataforma-erp
titulo: Plataforma ARS y ERP operativo
orden: 20
rutas: ["/plataforma"]
---

«Seguridad integral en una sola plataforma.» ARS conecta turnos, personal, rondas, cámaras, IA, alertas, comunicación, formularios, mapas y reportes para transformar la operación de seguridad en un sistema trazable, inteligente y en tiempo real. Página: `/plataforma`. Mensaje del cierre: «Transforma la seguridad tradicional en una operación inteligente»: conectar la operación humana, tecnológica y gerencial para tener más control, más evidencia y mejores tiempos de respuesta.

**ARS es un ERP, y además se adapta.** Además de la operación, ARS es el ERP de la empresa de seguridad: clientes, contratos y planes, órdenes de servicio, nómina, costos, facturación, contabilidad con asistente de IA, cotizador y CRM (detalle en `/servicios/finanzas-y-erp` y `/servicios/gestion-humana`). Si la empresa ya tiene su propio sistema u otros contratados, el Agente interoperador de datos y las integraciones hacen que todo se centralice en ARS o fluya entre sistemas, según los módulos que contrate.

## Funcionalidades (A–N) · ancla `/plataforma#feature-<id>`

Grupos: **Operación** (gestión humana, programación y ejecución en campo), **Monitoreo** (visualización, central y trazabilidad), **Inteligencia** (IA y alertas con contexto), **Reportes** (indicadores, multisede y arquitectura).

- **A · Control de turnos y programación** (`turnos`, Operación): turnos por cliente, sede, zona, puesto y horario; asignación de guardas por puesto; control de horarios; validación de cobertura; ausencias o retrasos; historial; vista calendario/agenda.
- **B · Gestión de personal operativo** (`personal`, Operación): perfil del guarda, estado en turno, ubicación en tiempo real, historial de actividad, asignación a zonas o sedes, disponibilidad, relación con reportes, novedades y tareas.
- **C · Rondas inteligentes** (`rondas`, Operación): rondas por sede, zona o cliente; puntos de control; tareas por punto; validación por ubicación; evidencia fotográfica; observaciones; control de rondas incompletas; alertas por incumplimiento; historial.
- **D · Rondas con tareas personalizadas** (`tareas`, Operación): según instalación o riesgo; p. ej. verificar puerta cerrada, revisar perímetro, confirmar iluminación, reportar vehículos sospechosos, validar personal autorizado, tomar foto del punto, formulario de inspección, novedad con evidencia.
- **E · Formularios dinámicos** (`formularios`, Operación): formularios por operación, cliente, ronda o tipo de novedad; campos de texto, selección, fecha, evidencia, firma o ubicación; validaciones obligatorias; enlazados a reportes y auditoría.
- **F · Seguimiento en mapa en tiempo real** (`mapa`, Monitoreo): ubicación de guardas, vista por cliente/sede/zona, rutas de ronda, puntos de control, cámaras georreferenciadas, alertas sobre el mapa, historial de recorridos, segmentación por operación.
- **G · PTT · Push To Talk** (`ptt`, Operación): comunicación inmediata tipo radio digital entre central, supervisores y campo; canales por cliente, sede, zona o equipo; soporte para supervisores; registro de actividad si aplica; integración con eventos o alertas; apoyo a la respuesta coordinada.
- **H · POT · Acción operativa rápida** (`pot`, Operación): botón de acción rápida (el equivalente operativo a un botón de emergencia o de pánico) para reportar novedad o emergencia, activar una alerta, solicitar apoyo, confirmar presencia o una tarea crítica, activar protocolo; queda asociado a ubicación, usuario y trazabilidad.
- **I · Central de monitoreo** (`central`, Monitoreo): video wall, monitoreo de cámaras, alertas en tiempo real, seguimiento de eventos, visualización de personal, comunicación con campo, evidencia, priorización de riesgos.
- **J · Cámaras e IA** (`ia`, Inteligencia): personas (detección, reconocimiento facial contra listas autorizadas/restringidas, caídas, merodeo); vehículos (detección, LPR, clasificación por tipo y color); comportamiento y zonas (cruce de línea, intrusión, ROI, objetos abandonados); industrial (EPP, reglas por cámara, aglomeración, fuego y humo). El detalle de analíticas está en `/vision`.
- **K · Alertas inteligentes** (`alertas`, Inteligencia): llegan con tipo de evento, prioridad, cámara, zona o sede, guarda relacionado, snapshot, video clip, ubicación, estado de atención e historial de seguimiento.
- **L · Evidencia y trazabilidad** (`evidencia`, Monitoreo): foto, video, fecha y hora, usuario responsable, ubicación, cámara, historial de cambios, estado y cierre de la novedad, reporte descargable.
- **M · Reportes e indicadores** (`reportes`, Reportes): cumplimiento de turnos, rondas completadas y fallidas, tiempo de respuesta, novedades por sede, alertas por tipo, eventos por cámara, actividad por guarda, cobertura por cliente, evidencia generada, riesgos recurrentes, reportes por periodo.
- **N · Multi-cliente · multi-sede · multi-zona** (`multisite`, Reportes): Organización → Cliente → Sede/Zona; Puesto → Cámara → Guarda; Turno → Ronda → Tarea; Evento → Evidencia → Reporte.

## Capturas del producto (`/plataforma#capturas`)

- Central de monitoreo: tablero único con cámaras, alertas y mapa en vivo; vista multipantalla configurable; priorización automática; asignación de operadores por turno.
- IA por cámara: activar modelos por cámara sin reemplazar hardware; reglas por cámara; varios modelos sobre la misma fuente; edge + cloud según la latencia requerida.
- Reconocimiento facial: listas blancas y negras por sede, búsqueda forense por rostro, confianza configurable.
- LPR: OCR de matrículas con cruce contra listas, soporte para placas LATAM, integración con barreras, reportes por flota o cliente.
- Intrusión/ROI: reglas perimetrales por cámara, cruce de línea con dirección.
- EPP: verificación automática, reporte para auditoría SST, alertas a supervisores.
- Alertas con evidencia: snapshot + clip, estado de atención por operador, cierre con observaciones y firma.

## Arquitectura operativa (niveles)

Raíz: ARS Intelligence (plataforma) → L1 Clientes (empresas y organizaciones) → L2 Sedes/Zonas (puntos físicos) → L3 Cámaras · Puestos · Guardas (recursos) → L4 Turnos · Rondas · Tareas (actividad programada) → L5 Alertas · Novedades · Formularios (eventos en tiempo real) → L6 Evidencia · Mapa · Central (visualización y respaldo) → L7 Reportes · Indicadores · Decisiones.

## Flujo de integración: del turno al reporte

1. Inicio de turno (guarda asociado a sede, puesto y horario). 2. Validación de puesto (biometría, ubicación o token operativo). 3. Ronda asignada (ruta, puntos, tareas, horarios). 4. Tareas en campo. 5. Formulario/novedad. 6. Evidencia (foto, video, ubicación, hora). 7. Alerta o seguimiento priorizado hacia la central. 8. Central de monitoreo en vivo. 9. Cierre del evento con observaciones y trazabilidad. 10. Reporte gerencial (indicadores, KPIs, bitácoras).

Resultado: «Cero desconexión entre operación humana, IA y supervisión».

## Casos de uso (`/plataforma#casos`)

- **Conjunto residencial**: porterías, rondas perimetrales, novedades, cámaras por torre o zona, alertas por intrusión, reportes al administrador.
- **Universidad o campus**: múltiples entradas, cámaras por edificio, estudiantes, visitantes y zonas críticas, permanencia o cruce de línea, eventos y reportes.
- **Centro logístico**: acceso vehicular, reconocimiento de placas, rondas en bodegas, EPP, zonas restringidas, evidencia ante incidentes.
- **Empresa de seguridad**: múltiples clientes, programación de turnos, supervisión de guardas, rondas y tareas, reportes automáticos, trazabilidad para facturación o cumplimiento.

## Antes vs. con ARS

Antes: información dispersa entre Excel, WhatsApp y radios; reportes manuales con horas de demora; cámaras desconectadas de la operación; rondas sin trazabilidad; comunicación informal central–campo; poca evidencia ante reclamos; difícil supervisión multisede.
Con ARS: operación centralizada; turnos y rondas con validación automática; cámaras + IA + personal conectados en tiempo real; evidencia automática por evento; mapa con ubicación viva; PTT con trazabilidad; alertas con contexto; reportes ejecutivos.

## Prueba social en la página

- Testimonios del equipo de ARS (gerencia y dirección comercial, dirección de IA): demostrar valor desde la primera reunión, activar sitios en menos de 48 horas sobre la infraestructura del cliente, edge + nube sin reemplazar hardware.
- Sección «Entidades y empresas que confían en nosotros» con logos: UNAD, Universidad de La Sabana, Universidad Militar Nueva Granada, Ministerio de Educación, Ministerio de Transporte, DANE, DIAN, Fiscalía General de la Nación, FNA, Ecopetrol, Repsol, TransMilenio, ALFA, Corferias Bogotá, Mundo Aventura. Puedes mencionar que aparecen en la web; el alcance de cada relación o proyecto es a confirmar con el equipo comercial.

## Lo que no está en el sitio

Integraciones con marcas concretas de cámaras/NVR, app móvil específica, requisitos de red, hosting, SLA formales, precios y licenciamiento: a confirmar con el equipo comercial.
