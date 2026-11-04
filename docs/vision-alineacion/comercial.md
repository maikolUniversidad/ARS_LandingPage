# Alineación 3D ↔ video · familia Comercial y comportamental

Archivo de emparejamiento: `public/analiticas-3d/sync/comercial.js` · clips: `public/analiticas-3d/evidencia-publica/comercial/` · créditos: `CREDITS-comercial.md`.

## Método

1. **Clip**: se recorta el video del portafolio al tramo del evento (8–20 s), se quita la banda superior de estado
   (54 px; el visor ya tiene su propia pastilla), se lleva a 960×540, sin audio, H.264 CRF 28, y se funden los últimos 0.5 s
   con los 0.5 s previos al inicio para que el loop no salte (`vision-trabajo/comercial/scripts/clip.sh`).
2. **Cámara calibrada**: con 3–5 personas de pie se anotan píxel del pie y de la cabeza; se ajusta altura, inclinación y FOV
   vertical de una cámara estenopeica (`scripts/calib2.py`, mínimos cuadrados). Esa cámara es la de `K.camara` (vista cctv).
3. **Todo en coordenadas del video**: `camVid(...).W(u,v,y)` lleva un punto del cuadro (0–1) al plano de altura `y`.
   Muros, muebles, zona/línea y recorridos se escriben en (u,v) del video y por construcción caen en el mismo píxel.
   Para quien tiene los pies fuera de cuadro, la ruta usa la cabeza (`"c0.42"` → plano a 1.70 m); sentado, la cadera (`"s0.8"`).
4. **Tiempo**: `dur` = duración del clip; fases, eventos y rutas en segundos del clip.
5. **Verificación**: en la pestaña propia del navegador integrado se congela el segundo (`vigias-sim-t`), se renderiza la
   cámara cctv a 16:9 y se superpone el cuadro del video al 50 % (inicio, evento y final).

Puntajes 0–3: encuadre · espacio · actores · objetos · momento.

| id | video antes | antes | video nuevo (fuente / licencia) | qué cambió en el 3D | después | pendientes |
|---|---|---|---|---|---|---|
| seguimiento | `evidencia-publica/seguimiento.mp4` (MEVA 0421, 40 s, 9.6 MB) | 0·0·1·0·0 | `comercial/seguimiento.mp4` · MEVA cámara 0421, s 22.5–38.5 · CC BY 4.0 · 16 s · 1.41 MB | Escena nueva: vestíbulo/cafetería MEVA (puertas y ventanales de vidrio, mostrador del café en diagonal, mesas altas, sillas y sofá del fondo, papelera). Cámara h 2.52 m, 21.2°, FOV 45°. 10 personas con los recorridos del video (ID 23 entra por la puerta del fondo, ID 6 cruza por delante a los 6.4–8.6 s, ID 24 va al mostrador, ID 84 entra al final) y sus mismos números. | 3·3·2·2·3 | Personas sentadas del fondo (ID 29, 31, 64, 11) no se modelan (el motor no tiene pose sentada en reposo para mesas); ropa aproximada. |
| conteo | `evidencia-publica/conteo.mp4` (Pexels 30138510, 29 s) | 0·0·0·0·0 | `comercial/conteo.mp4` · Pexels 30138510, s 18.9–28.9 · Pexels License · 10 s · 0.67 MB | Escena nueva: cruce peatonal (antes era la puerta de una tienda). Cámara baja h 1.04 m, 3.1°, FOV 50°. Cebra cercana a la izquierda, cebra lejana con la multitud, edificio, árboles, autos (taxi). Línea de conteo en v = 0.665, la misma del video. ID 78 cruza a los 8.5 s e ID 102 a los 9.3 s, como en el video. | 3·2·2·2·3 | Autor de Pexels sin confirmar (la página devuelve 403); moto/bus/ciclista no modelados. |
| demografia | sin video | — | `comercial/demografia.mp4` · **generado con IA** (ElevenLabs · Seedance 2.5, texto a video, 720p) s 0.5–10 · `ia:true` · 9.5 s · 0.27 MB | Escena nueva: entrada de tienda vista desde arriba (fachada y puerta de vidrio con calle luminosa, estanterías oscuras a la izquierda, canastas junto a la puerta, tapete). Cámara h 2.23 m, 26.9°, FOV 60°. Las tres visitas del clip (mujer 0.2 s, hombre 3.5 s, adolescente 6.5 s) entran por la puerta y salen abajo a la izquierda con sus etiquetas de edad/género. | 3·2·2·2·3 | Sin detecciones quemadas (no hay detector facial local en Python; el rótulo es el del 3D). En el video se ve el domo de una cámara en el techo; el 3D no lo modela. |
| calor | `evidencia-publica/calor.mp4` (MEVA 0421, 40 s) | 0·0·0·0·0 | `comercial/calor.mp4` · MEVA 0421, s 22.5–38.5 (mismo tramo que seguimiento) · CC BY 4.0 · 16 s · 1.03 MB | Mismo vestíbulo y mismas personas que seguimiento; el plano de calor se acumula con los pasos reales (y se rehace si el reloj salta atrás). | 3·3·2·2·2 | En el video el calor más fuerte está en los sentados del fondo, que el 3D no tiene. |
| permanencia | `evidencia-publica/permanencia.mp4` (MEVA G507, 40 s) | 0·1·1·0·0 | `comercial/permanencia.mp4` · MEVA G507, s 3–19 · CC BY 4.0 · 16 s · 0.67 MB | Escena nueva: sala de espera (bancas negras, bancas naranjas al fondo, fila de sillas, puertas de vidrio). Cámara h 2.68 m, 38.4°, FOV 55°. Zona = el mismo polígono del video. ID 2 entra a la zona a los 5.6 s, ID 4 a los 7.9 s; ambos se sientan (pose sentada hecha con huesos); ID 1 sentado todo el clip. Marcas del visor con el color de la zona en cada fase (vigila → detecta → ok). | 3·3·2·2·3 | Paredes sin textura; la fila de sillas de ID 1 es un bloque simple. |
| cruce | `evidencia-publica/cruce.mp4` (MEVA G423, 40 s) | 1·1·1·0·0 | `comercial/cruce.mp4` · MEVA G423, s 12–28 · CC BY 4.0 · 16 s · 0.39 MB | Escena nueva: pasillo largo con casilleros a la derecha, esquina de muro cercano a la izquierda y abertura lateral junto a la línea. Cámara h 2.72 m, 9.7°, FOV 50°. Línea en v = 0.575 (la del video). ID 1 y ID 5 cruzan hacia la cámara (3.4 y 4.7 s) y salen por la izquierda; ID 31 sale de la abertura y cruza alejándose a los 13.2 s (alerta). | 3·2·2·2·3 | El fondo del pasillo es plano (no hay puertas del final); las personas lejanas del fondo son genéricas. |
| comprador | sin video | — | `comercial/comprador.mp4` · **generado con IA** (ElevenLabs · Seedance 2.5, texto a video, 720p) s 0.5–10 · `ia:true` · 9.5 s · 0.19 MB | Escena nueva: pasillo de supermercado visto casi cenital (góndola de cajas al fondo, góndola baja abajo). Cámara h 2.72 m, 71.4°, FOV 55°. La compradora entra por la izquierda (1 s), se detiene frente a la góndola (2.5 s), toma la caja roja (5.5–6 s) y la examina; a los 7 s queda marcada como comprador activo. Zona «Frente a la góndola» igual en video y 3D (vigila → detecta → oro). | 3·3·2·2·3 | Las cajas del clip IA muestran empaques parecidos a marcas reales (generados por el modelo); si molesta, regenerar pidiendo empaques genéricos. Sin detecciones quemadas. |

## Lo que no fue posible

- **Stock CCTV para demografía y comprador**: en Mixkit los clips de compradores son primeros planos con cámara en mano
  (49289, 49358, 49343 revisados), no tomas fijas de seguridad; no sirven para emparejar con una cámara CCTV.
- **Imagen del 3D como cuadro inicial (image-to-video)**: subir un archivo al flujo de ElevenLabs requiere que la persona
  elija el archivo en un selector; como agente no puedo hacerlo, así que se generó **texto a video** y luego el 3D se
  ajustó al video generado con el mismo método de calibración.

## Generaciones con IA (2 de un máximo de ~6)

| id | modelo | duración | costo aprox. | resultado |
|---|---|---|---|---|
| comprador | bytedance-seedance-v2.5 (texto a video, 720p, 10 s, sin audio) | 10 s (se usan 9.5 s) | ~28 000 créditos (≈ USD 5.1) | Bueno: cámara fija casi cenital, una compradora toma una caja roja. |
| demografia | bytedance-seedance-v2.5 (texto a video, 720p, 10 s, sin audio) | 10 s (se usan 9.5 s) | ~28 000 créditos (≈ USD 5.1) | Bueno: cámara fija sobre la puerta, tres visitas con la cara visible. |

Flujo: https://elevenlabs.io/app/flows/oyZ7cYL0a6uZMXjZyCjS (ElevenLabs Creative). Rotulados `ia:true`,
chapa «video generado con IA · referencia»; en ningún caso dicen «modelo real».

## Total añadido

7 clips (lista en `CREDITS-comercial.md`). Clips: 1.41 + 0.67 + 0.27 + 1.03 + 0.67 + 0.39 + 0.19 = **4.63 MB**; pósters ≈ 0.42 MB.
