# Alineación 3D ↔ video · familia Operativo y de eficiencia (grupo 1)

Archivo de emparejamiento: `public/analiticas-3d/sync/operativo.js` · clips: `public/analiticas-3d/evidencia-publica/operativo/` · créditos: `CREDITS-operativo.md`.
Trabajo y scripts (fuera del repo): `D:\ARS_Landing\vision-trabajo\operativo\` (`scripts/`, `pistas/`, `cfg/`, `cuadros/`).

## Método

1. **Material real primero.** Se usaron cámaras del conjunto MEVA (CC BY 4.0; ya era la fuente de aforo y guardián):
   G421 (vestíbulo-cafetería) para filas, staff, aforo y guardián; G326 (puerta de acceso con escalera) para listas blancas y
   cierre; G506 (entrada de la terminal) para apertura. Los tramos se escogieron con las anotaciones de actividad de MEVA
   (`person_opens_facility_door`, `person_closes_facility_door`, `person_purchases`).
2. **Calibración de cada cámara** (modelo pinhole: altura H, inclinación p, fov vertical F) con las cajas de personas de pie
   (ajuste de altura 1,68 m) y, en G326, con el marco de la puerta. G421: H 2,28 · p 19,7° · F 55°. G326: H 1,8 · p 15° · F 57°
   (lente con mucho barril: es un compromiso). G506: H 3,57 · p 18,3° · F 35,2°.
3. **Escenografía desde los píxeles.** En `operativo.js` la función `camCal().piso(x,y,h)` proyecta un píxel del cuadro de
   1920×1072 al piso; muros, puertas, mesas, mostrador, pilares, bancas y zonas se colocan con coordenadas de píxel, así que
   el 3D vuelve a caer en el mismo lugar del video. `K.camara` usa la misma calibración.
4. **Personas con la ruta del video.** Detector local EfficientDet-Lite0 (MediaPipe, `public/mediapipe/models`, leído con
   OpenCV 5 en modo clásico) sobre el cuadro completo + 4 mosaicos, seguimiento por IoU, proyección del pie (o de la cabeza a
   1,68 m si el pie está cortado/tapado) y simplificación de la ruta. Color de camisa/pantalón tomado de cada caja.
   Se apagan los obstáculos del A* en estos sets (las rutas reales ya rodean los muebles).
5. **Reloj.** `dur` = duración del clip y `fases`/eventos en segundos del clip. Las marcas (`marcas`) usan las mismas coordenadas
   de píxel que la zona 3D, con el mismo color y texto por tramo (`desde`/`hasta`).
6. Verificación: capturas del 3D en vista cctv (Chrome sin cabeza, 1280×720) mezcladas 50 % con el cuadro del video en los
   mismos segundos (`scripts/comparar.py`), y el visor real `/vision#<id>` (sin errores de consola).

## Tabla

Puntajes 0–3: encuadre · espacio · actores · objetos · momento.

| id | video antes | antes | video nuevo (fuente · licencia) | qué cambió en el 3D | después | pendientes |
|---|---|---|---|---|---|---|
| blancas | ninguno (el de `evidencia/` no es público) | 0·0·0·0·0 | MEVA G326 s 98–114, 16 s, 0,53 MB · CC BY 4.0 | Set nuevo «escalera G326»: muro de bloque, puerta naranja con bisagra a la derecha que abre hacia afuera, escalera con baranda, luminaria y tapete; dos personas suben por la derecha, la de uniforme queda «autorizada» y el acompañante «sin coincidencia»; la puerta abre a los 6,7 s y cierra a los 12 s como en el video | 2·2·2·2·3 | Sin detector de rostro local: el clip no lleva cajas (rotulado «escena de referencia»). Lente ojo de pez: los bordes no calzan. |
| filas | ninguno | 0·0·0·0·0 | MEVA G421 s 0–18, 18 s, 1,64 MB · CC BY 4.0 · detector EfficientDet-Lite0 quemado | Set nuevo «sala G421» (paredes, puertas de vidrio, sofá, mesas, mostrador con termos y canasta verde, mesas altas, atril); 16 personas con la ruta del detector; zona «Fila caja» frente al mostrador; aviso a los 2 s (5 en fila) y cierre a los 7 s | 2·2·2·2·3 | El detector junta personas en las filas densas: el conteo 3D baja antes que la fila real. |
| aforo | aforo.mp4 (G421, 40 s) vs. tienda con puerta | 0·0·1·0·0 | Mismo clip recortado s 18–36 (G421 2018-03-13 s 167,9–185,9), 18 s, 0,91 MB · CC BY 4.0 · D-FINE-S quemado | Sala G421 en lugar de la tienda; zona «Aforo · vestíbulo» con el polígono del clip; personas con rutas del detector; contador tomado del conteo quemado (4→15, límite 12) y alerta a los 12,5 s | 2·2·2·2·3 | El detector local ve menos personas lejanas que D-FINE-S: el 3D tiene menos gente que el conteo. Distinta disposición de mesas ese día. |
| placas | placas.mp4 (Pexels) vs. parqueadero cenital | 0·0·0·1·0 | Mismo clip sin cabecera, s 0–11,5, 0,53 MB · Pexels License · lpr_v2 quemado | Escena nueva frontal: fachada de ladrillo con el garaje «KUNDENPARKPLÄTZE», condensadoras, edificio crema «2», bolardos; carro gris BGY 888 a la salida, moto que entra por la izquierda, peatón que cruza, auto oscuro que pasa por delante (6,6–7,7 s) y el carro que sale al final; lectura de placa a 1 s | 2·2·2·2·2 | El clip de Pexels tiene cortes de montaje (el carro salta de posición); el 3D es continuo. |
| staff | ninguno | 0·0·0·0·0 | MEVA G421 s 24–42, 18 s, 1,60 MB · CC BY 4.0 · detector quemado | Sala G421; cajera (beige, detrás del mostrador) y persona de limpieza (magenta, con trapero) como «personal»; el resto «cliente»; contadores separados | 2·2·2·2·3 | Los roles se asignaron a mano sobre las pistas (no hay clasificador de uniforme local). |
| derrames | imagen `piso-alerta.jpg` (oficina) vs. tienda | 0·0·0·1·0 | **Generado con IA** (ElevenLabs · Seedance 2.5, texto a video, 1 generación), 15 s, 0,67 MB · rotulado `ia:true`, «video generado con IA · referencia» | Escena nueva ajustada al video: pasillo largo de bebidas con góndolas altas a ambos lados y letrero azul al fondo, cámara baja al inicio del pasillo (fov 70°); el cliente de azul se acerca, el envase cae a los 4,5 s y el charco queda donde está en el video; aviso a los 8 s; empleado de rojo con trapero limpia 10,2–12,6 s y se va | 3·2·2·2·3 | Es IA: no es evidencia del modelo. El empleado «salta» del fondo al charco entre 9 y 10 s (defecto del generador). |
| guardian | guardian.mp4 (G421, 31 s) vs. oficina | 0·0·1·0·0 | Mismo clip recortado s 12–30 (G421 2018-03-07 11:05 s 282–300), 18 s, 0,87 MB · CC BY 4.0 · Guardián v2 quemado | Sala G421; zona «Puesto · caja» sobre la caja; titular (magenta) hasta 7,5 s, caja en espera, otra persona la ocupa y alerta a los 14 s | 2·1·2·1·3 | Ese día la cafetería tenía más mesas y gente sentada; el set usa la disposición de la tarde del 07-mar. |
| apertura | ninguno | 0·0·0·0·0 | MEVA G506 s 26–42, 16 s, 0,55 MB · CC BY 4.0 · detector quemado | Set nuevo «entrada G506»: fachada de lámina, puerta doble de vidrio oscuro, pilares de piedra con columnas blancas, andén, bancas, autos al fondo; «encargado» llega a la puerta a los 6 s y abre a los 10,1 s | 2·2·2·2·3 | El rótulo de hora (06:58) es del ejemplo, no del video (tarde). Se quitó el alero porque tapaba la vista. |
| cierre | ninguno | 0·0·0·0·0 | MEVA G326 s 254–272, 18 s, 1,16 MB · CC BY 4.0 · detector quemado | Mismo set G326; la puerta abierta mientras entra el grupo, empieza a cerrar a los 8 s y queda cerrada a los 12,6 s (alerta) | 2·2·1·2·3 | En el video entra un grupo grande; el detector ve 3–5 personas. |

## Lo que no fue posible

- Total añadido: 9 clips + 9 pósters ≈ 9,2 MB en `evidencia-publica/operativo/`.
- **Subir el cuadro del 3D a ElevenLabs como cuadro inicial**: la subida de archivos del flujo requiere que el usuario elija el
  archivo en un selector; no se pudo automatizar. Para derrames se generó **texto a video** y el 3D se ajustó al resultado.
- No hay clips públicos de derrames reales en supermercado en las fuentes permitidas que pudiéramos descargar (Pexels bloquea
  la búsqueda automática; Mixkit no tiene tomas fijas de este tipo).
- Pexels no se pudo navegar de forma automática (HTTP 403), por eso se priorizó MEVA.
