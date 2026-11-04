---
id: laboratorio
titulo: Laboratorio y Vision Lab (demos de IA)
orden: 60
rutas: ["/laboratorio", "/vision-lab"]
---

## `/laboratorio` — «Probá la IA con tus propios ojos»

Cada modelo que ofrece ARS se puede ver en acción: detección de personas, lectura de placas, EPP, caídas, intrusión, fuego, aglomeración y más. Filtro por categoría (Todas, Personas, Vehículos, Industrial, Perímetro, Operación). Al elegir una capacidad, el escenario `#demo-stage` ofrece tres pestañas: **Ejemplo** (escena ilustrativa con detecciones animadas), **Cámara en vivo** (webcam del visitante) y **Subir video**. La detección corre en tiempo real en el navegador, sin enviar el video a ningún servidor; en producción los modelos avanzados corren sobre las cámaras conectadas a ARS. Cierre: «¿Querés probarlo sobre tus cámaras reales?» → Solicitar demo guiada (activación en menos de 48 horas, sin reemplazar hardware, según la página).

Las 13 capacidades del laboratorio:
- **Reconocimiento facial** (Personas): listas de interés y búsqueda histórica por rostro; accesos restringidos, watchlist, conteo de visitantes únicos.
- **Lectura de placas (LPR)** (Vehículos): carros, motos y tracto-camiones; listas blancas/negras; entradas y salidas; parqueaderos, patios, puertos.
- **Detección de armas** (Perímetro): pistola, cuchillo, fusil; alerta inmediata con evidencia; accesos, bancos, retail, educación.
- **EPP** (Industrial): casco, chaleco reflectivo, guantes, gafas; auditoría SST y no-conformidades.
- **Intrusión y cruce de línea** (Perímetro): ROI por cámara con horarios, tipos de objeto y severidad; alertas al CCO.
- **Análisis de comportamiento** (Personas): peleas, merodeo, abandono de objetos, aglomeración inusual.
- **Conteo de personas** (Personas): entradas/salidas, mapas de calor, picos, permanencia, reportes históricos.
- **Visión térmica** (Perímetro): perímetros nocturnos, oscuridad total, focos de calor en plantas y subestaciones.
- **Clasificación vehicular** (Vehículos): tipo, marca aproximada, color y dirección; tráfico y forensia.
- **Detección y abandono de objetos** (Operación): mochilas y paquetes en aeropuertos, terminales, plazas, metro.
- **Detección de caídas** (Personas): pasillos, escaleras; hospitales, geriátricos, plantas.
- **Detección de fuego y humo** (Operación): complementa sensores físicos en bodegas, exteriores, túneles.
- **Aglomeración y densidad** (Personas): estaciones, eventos, centros comerciales, estadios.

Las tarjetas muestran una métrica por capacidad (p. ej. precisión, latencia, alcance). Son cifras de presentación de la demo: no las ofrezcas como garantía de rendimiento; el desempeño en cada sitio es a confirmar con el equipo comercial.

## `/vision-lab` — Playground técnico

Para perfiles técnicos. Selector de modelo, fuente (imagen, video, webcam), motor **IA real** (inferencia en el navegador, sin servidor ni costo) o **Demo** (predicciones simuladas), dibujo de reglas (ROI con clics y doble clic para cerrar; línea con 2 clics), panel de eventos con «crear alerta» y snapshot, conteo acumulado de personas/objetos distintos, análisis facial y visor JSON de la respuesta.

14 modelos por categoría:
- Personas: detección de personas; malla facial de 478 puntos con 52 acciones faciales (sin identificar a la persona); reconocimiento facial demo contra lista blanca/negra (solo entorno demo controlado); detección de pose (17 puntos corporales); detección de caídas demo (pose + tiempo en horizontal).
- Vehículos: detección de vehículos; detección de placas.
- OCR: OCR de placas (en el navegador).
- Industrial: EPP (casco, chaleco, guantes, botas, gafas).
- Perímetro y reglas: intrusión en ROI, cruce de línea con dirección, merodeo/permanencia, objeto abandonado.
- Experimental: descripción de escena con un modelo visión-lenguaje (VLM), solo para evaluación.

Algunos modelos marcados «API externa / requiere key» pueden no estar activos en la web pública. Los modelos sensibles (rostros, placas) muestran avisos legales.

## Laboratorio vs. Visión

- `/laboratorio` y `/vision-lab`: probar modelos en vivo con contenido propio.
- `/vision`: portafolio comercial de 45 analíticas con simulación 3D y evidencia real.
