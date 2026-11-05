# Narración de Ars · /servicios/[area]

Clips de voz de Ars para las 10 áreas de `/servicios/<area>`: una intro por área (`idIntroArea`) y un capítulo por módulo (`idModulo`), con los ids reales de `src/data/servicios/catalogo.ts`.

- **Guiones:** `src/data/narracion/guiones-servicios-areas.ts` (`GUIONES_SERVICIOS_AREAS`, 81 entradas).
- **Audio:** `public/audio/narracion/servicios/<areaId>/<intro|moduloId>.mp3` (ruta = `urlNarracion(id)`).
- **Voz:** «Sofía – Confianza & Calidez» (`b2htR0pMe28pYwCY9gnP`), modelo `eleven_v4`, una toma por clip.
- **Flow de ElevenLabs:** `38YscQmZrBp2G4qCmJZg` («ARS · Narración servicios por área»), donde están las 81 generaciones.
- **Post-proceso (ffmpeg 9.0.1):** mono, 44,1 kHz, 96 kbps CBR, `loudnorm=I=-16:TP=-1.5:LRA=7` (una pasada; medido ≈ -16,6 LUFS integrado), sin metadatos. Los silencios de borde de las tomas originales ya eran ≤0,10 s al inicio y ≤0,18 s al final, así que no hubo que recortar nada (umbral 0,3 s).

## Costo

| Concepto | Créditos | USD aprox. |
|---|---:|---:|
| Estimación previa (1 clip de 253 caracteres, `estimate_only`) | 253 | 0,046 |
| 81 clips TTS (`eleven_v4`, 1 toma c/u, sin regeneraciones) | **17.585** | **≈ 3,20** |
| 4 transcripciones de verificación (`eleven_scribe_v1`) | 0 | 0 |

La estimación no consume créditos. Tarifa observada: ≈1 crédito por carácter (≈0,018 ¢ por crédito).

## Verificación de pronunciación

Se transcribieron cuatro clips con `creative_transcribe_audio`. Los cuatro salen idénticos al guion:

| Clip | Resultado |
|---|---|
| `servicios/operacion-en-campo/intro` | «Soy Ars, …»: «Ars» es una sola palabra (0,32–0,96 s), no deletreada |
| `servicios/finanzas-y-erp/intro` | «Ars lo centraliza…»: una palabra (11,28–11,44 s); «ERP» como sigla; transcripción idéntica al guion (toma del 2026-11-04) |
| `servicios/gobierno-y-seguridad/app-web-instalable-pwa` | «Ars se instala…»: una palabra (2,76–2,96 s) |
| `servicios/finanzas-y-erp/facturas-dian-y-radian` | «RADIAN» es una palabra; dice «está en piloto y pasa a producción en los próximos meses» |

## Notas de contenido

- Trato de usted, primera persona de Ars, números en letras y nada de lo que no se promete (ni placas, armas, EPP, térmica ni fuego; facial solo como alerta que verifica un operador; sin SLA ni cifras de uso).
- **RADIAN** se narra como piloto. La **Sala VR nativa para Meta Quest** se narra como «planeada», tal como dice su resumen en el catálogo (su `estado` dice `vivo`, y eso no cuadra con el resumen). En /servicios no hay módulo de robótica.
- En los guiones se escribe «Ars» (no «ARS») para que la voz lo diga como palabra. Los subtítulos usan este mismo texto.

## Duraciones (id → segundos)

| id | s |
|---|---:|
| `servicios/operacion-en-campo/intro` | 17.92 |
| `servicios/operacion-en-campo/turnos-y-programacion` | 13.28 |
| `servicios/operacion-en-campo/control-de-asistencia-y-relevos` | 16.00 |
| `servicios/operacion-en-campo/rondas-qr` | 15.36 |
| `servicios/operacion-en-campo/reportes-operativos-y-supervision` | 15.28 |
| `servicios/operacion-en-campo/visitantes-y-bicicletas` | 12.24 |
| `servicios/operacion-en-campo/recursos-operativos` | 13.44 |
| `servicios/centro-de-operaciones/intro` | 13.76 |
| `servicios/centro-de-operaciones/sala-de-control` | 15.60 |
| `servicios/centro-de-operaciones/zonas-y-salida-de-zona` | 14.00 |
| `servicios/centro-de-operaciones/sala-del-coordinador` | 11.04 |
| `servicios/centro-de-operaciones/recorridos-y-tiempo-en-el-puesto` | 14.00 |
| `servicios/centro-de-operaciones/cumplimiento-supervisores-y-vigilantes` | 12.88 |
| `servicios/centro-de-operaciones/alias-de-clientes-y-sedes` | 13.84 |
| `servicios/comunicacion-y-emergencias/intro` | 16.00 |
| `servicios/comunicacion-y-emergencias/radio-ptt` | 15.52 |
| `servicios/comunicacion-y-emergencias/chat-corporativo` | 16.96 |
| `servicios/comunicacion-y-emergencias/conversacion-con-la-central` | 8.72 |
| `servicios/comunicacion-y-emergencias/consola-de-radio` | 13.76 |
| `servicios/comunicacion-y-emergencias/reporte-por-sede` | 13.20 |
| `servicios/comunicacion-y-emergencias/boton-de-panico` | 14.64 |
| `servicios/comunicacion-y-emergencias/notificaciones-y-telegram` | 14.72 |
| `servicios/monitoreo-inteligente/intro` | 17.04 |
| `servicios/monitoreo-inteligente/vision-artificial` | 18.32 |
| `servicios/monitoreo-inteligente/acceso-inteligente` | 17.84 |
| `servicios/monitoreo-inteligente/puertas-reconocimiento-facial` | 15.44 |
| `servicios/monitoreo-inteligente/iot-y-domotica` | 14.48 |
| `servicios/monitoreo-inteligente/levantamiento-2d-3d-de-sedes` | 11.84 |
| `servicios/monitoreo-inteligente/escaneo-3d-de-sedes` | 14.56 |
| `servicios/realidad-virtual/intro` | 15.76 |
| `servicios/realidad-virtual/sala-vr-central-viva` | 15.36 |
| `servicios/realidad-virtual/sede-inteligente` | 13.68 |
| `servicios/realidad-virtual/mesa-directiva-con-ia` | 15.76 |
| `servicios/realidad-virtual/vigia-asistente-de-voz` | 13.60 |
| `servicios/realidad-virtual/sala-vr-nativa-meta-quest` | 12.16 |
| `servicios/gestion-humana/intro` | 17.68 |
| `servicios/gestion-humana/seleccion-y-contratacion` | 13.60 |
| `servicios/gestion-humana/colaboradores-y-mis-datos` | 12.96 |
| `servicios/gestion-humana/empleados-prestamos-y-contratos` | 16.24 |
| `servicios/gestion-humana/nomina` | 18.72 |
| `servicios/gestion-humana/nomina-de-administrativos-y-ajuste` | 13.20 |
| `servicios/gestion-humana/prima-vacaciones-y-liquidacion` | 12.56 |
| `servicios/gestion-humana/costos-y-comparacion-con-el-erp` | 13.92 |
| `servicios/gestion-humana/area-documental-inicio` | 12.32 |
| `servicios/gestion-humana/cargue-inteligente-de-documentos` | 15.12 |
| `servicios/gestion-humana/expedientes-y-descargas-masivas` | 11.60 |
| `servicios/gestion-humana/auditoria-de-gestion-humana` | 12.56 |
| `servicios/gestion-humana/arbol-documental-3d` | 13.36 |
| `servicios/gestion-humana/reporte-y-analitica-documental` | 13.84 |
| `servicios/gestion-humana/portal-documental-para-el-cliente` | 13.12 |
| `servicios/gestion-humana/juridica-no-conformes-y-descargos` | 14.48 |
| `servicios/formacion/intro` | 16.08 |
| `servicios/formacion/capacitacion-virtual` | 13.84 |
| `servicios/formacion/disenador-de-cursos-con-ia` | 12.80 |
| `servicios/formacion/video-por-temas` | 12.56 |
| `servicios/formacion/auditoria-de-capacitacion-y-reglas` | 13.20 |
| `servicios/formacion/evaluaciones-de-conocimiento` | 12.48 |
| `servicios/finanzas-y-erp/intro` | 16.64 |
| `servicios/finanzas-y-erp/clientes-contratos-y-planes` | 11.92 |
| `servicios/finanzas-y-erp/ordenes-de-servicio-del-erp` | 14.72 |
| `servicios/finanzas-y-erp/contabilidad-conectada` | 15.36 |
| `servicios/finanzas-y-erp/asistente-contable-con-ia` | 13.04 |
| `servicios/finanzas-y-erp/facturas-dian-y-radian` | 13.36 |
| `servicios/finanzas-y-erp/agente-interoperador-de-datos` | 21.44 |
| `servicios/finanzas-y-erp/su-erp-dentro-de-ars` | 15.76 |
| `servicios/finanzas-y-erp/cotizador-y-crm-propios` | 12.40 |
| `servicios/productividad-e-ia/intro` | 17.12 |
| `servicios/productividad-e-ia/seguimiento-de-tareas` | 14.96 |
| `servicios/productividad-e-ia/reuniones-con-transcripcion-ia` | 11.92 |
| `servicios/productividad-e-ia/tickets-de-soporte` | 12.56 |
| `servicios/productividad-e-ia/formularios-dinamicos` | 13.12 |
| `servicios/productividad-e-ia/automatizaciones-y-procedimientos` | 13.20 |
| `servicios/productividad-e-ia/centro-de-ia` | 14.56 |
| `servicios/gobierno-y-seguridad/intro` | 16.56 |
| `servicios/gobierno-y-seguridad/torre-de-control` | 12.80 |
| `servicios/gobierno-y-seguridad/auditoria-y-trazabilidad` | 13.04 |
| `servicios/gobierno-y-seguridad/configuracion-multiempresa` | 10.48 |
| `servicios/gobierno-y-seguridad/ingreso-y-doble-factor` | 14.80 |
| `servicios/gobierno-y-seguridad/app-android` | 13.28 |
| `servicios/gobierno-y-seguridad/app-web-instalable-pwa` | 11.84 |
| `servicios/gobierno-y-seguridad/app-de-escritorio-para-la-central` | 12.16 |
| **Total (81 clips)** | **1139.8** (≈ 18 min 59 s) |

## Regeneración por posicionamiento ERP (2026-11-04)

El mensaje cambió a «ARS es un ERP y además se adapta: centraliza o hace fluir la información de los sistemas que la empresa ya tenga» (ver `docs/posicionamiento-erp.md`). Se reescribieron y regeneraron **solo** estos 11 clips de /servicios (más 1 de /plataforma, en `NARRACION-home-plataforma.md`), con la misma voz, modelo, flow (`38YscQmZrBp2G4qCmJZg`), una toma por clip y el mismo post-proceso ffmpeg. Las duraciones de la tabla de arriba ya están actualizadas.

- `servicios/finanzas-y-erp/`: `intro`, `ordenes-de-servicio-del-erp`, `contabilidad-conectada`, `agente-interoperador-de-datos`, `su-erp-dentro-de-ars`, `cotizador-y-crm-propios`.
- `servicios/gestion-humana/`: `empleados-prestamos-y-contratos`, `nomina`, `prima-vacaciones-y-liquidacion`, `costos-y-comparacion-con-el-erp`, `auditoria-de-gestion-humana`.
- Costo: estimación previa 249 créditos (`estimate_only`, no cobra); 12 clips en total ≈ **2.837 créditos (≈ USD 0,51)**; 1 transcripción de verificación (0 créditos).
