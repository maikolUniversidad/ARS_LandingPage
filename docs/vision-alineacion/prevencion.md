# Alineación 3D ↔ video · Prevención y riesgo (parte A)

Ids: negras, merodeo, intrusion, acceso, aglomeracion, epp, caidas, hurto. Código: `public/analiticas-3d/sync/prevencion.js`
(cada escena redefinida con `ESC_SYNC.redef`, copiando la original de `escenas2.js`). Clips: `evidencia-publica/prevencion/`.
Créditos: `evidencia-publica/prevencion/CREDITS-prevencion.md`.

Método: cuadros del clip con ffmpeg contra la vista `sim.html?id=<id>&vista=cctv` congelada en el mismo segundo
(capturas con Chrome sin cabeza por CDP: `MOTOR.manual`, `MOTOR.saltar(t)`, `MOTOR.cuadroManual()`), 3–4 segundos por id
(inicio, evento, final). Sin errores de consola en la simulación ni en `/vision#intrusion`.

Puntajes 0–3 en el orden **encuadre · espacio · actores · objetos · momento**.

| id | video antes | puntajes antes | video nuevo (fuente / licencia) | qué cambió en el 3D | puntajes después | pendientes |
|---|---|---|---|---|---|---|
| negras | ninguno (la ruta `evidencia/facial-2.mp4` no se publica) | — | IA · Seedance 2.5 · 11,4 s · 0,36 MB | vestíbulo de vidrio cenital con puerta automática al fondo y 3 antenas antihurto; hombre de chaqueta gris y gorra que entra a 1,3 s y pasa entre las antenas; mujer de abrigo claro desde 7,2 s; coincidencia a 3,2 s; `dur` 11,4 | 2·2·2·2·3 | el video es IA (no hay caras reales); las góndolas detrás de los vidrios laterales se ven más claras que en el clip |
| merodeo | ninguno (`sinVideo`) | — | IA · LTX 2 Fast · 11,6 s · 0,62 MB (venía 4:3 con barras, recortado a 16:9) | andén con fachada de piedra y vitrina corrida a la izquierda, bolardos y rejilla; cámara alta en la fachada mirando a lo largo; el hombre baja por la vitrina, se para a mirarla 2,5–6,2 s, sale por abajo y vuelve a 10,5 s (alerta); peatón por la derecha | 2·2·2·2·2 | el clip IA tiene reflejos «fantasma» en el vidrio; el loop no es perfecto (el hombre reaparece desde abajo) |
| intrusion | `intrusion.mp4` (MEVA G507, sala de espera) contra un 3D de cerca perimetral exterior | 0·0·1·0·0 | recorte 4–22 s del mismo MEVA G507 · CC BY 4.0 · 18 s · 0,50 MB | sala de espera: muro de fondo con puerta de vidrio, puerta café y ventanas; muro derecho con salida de emergencia doble y EXIT; bancas naranjas y negras en filas; hombre sentado en la banca junto a la salida; zona en el piso frente a la salida (amarilla → roja a 8,2 s); descripción ajustada a «zona frente a la salida» en vez de 3 franjas | 2·2·3·2·3 | el lente del clip es más gran angular; la sala 3D se ve un poco más profunda |
| acceso | ninguno | — | IA · Seedance 2.5 · 11,4 s · 0,50 MB | pared azul con puerta gris «SOLO PERSONAL» y la tienda con góndolas a la izquierda, techo con luminarias; empleado de azul cruza 0,7–2,6 s (sin aviso); cliente de camisa celeste entra por la izquierda, mira a los lados y cruza a 9,5 s (alerta) | 2·2·2·2·3 | la puerta del clip abre hacia la cámara; la del motor gira hacia adentro |
| aglomeracion | `aglomeracion.mp4` (MEVA G421, vestíbulo) contra una plazoleta exterior | 0·0·1·0·0 | recorte 5–23 s del mismo MEVA G421 · CC BY 4.0 · 18 s · 1,51 MB | vestíbulo interior: fachada de vidrio con puertas al fondo, sofás y mesa de centro a la izquierda, mesas redondas con sillas, mostrador; 4 personas al fondo y 16 que entran por las puertas y se juntan al fondo a la izquierda; umbral 15 personas a ~8,8 s; zona de todo el vestíbulo | 2·2·2·2·3 | en el clip la gente se acumula más arriba (detrás de los sofás); el conteo 3D es aproximado al del modelo |
| epp | `epp.mp4` (obra, losa) contra una bodega con 2 personas | 0·0·1·0·0 | recorte 0,6–13,6 s del mismo video público · 13 s · 1,31 MB | losa de concreto con columnas de varilla y fondo de cerro; fila de 10 trabajadores con cascos amarillos/blancos/azules, uno agachado; 3 sin casco en rojo de 1,6 a 6,3 s; cámara tele a la altura de la losa | 2·2·2·1·3 | **autor/licencia del video EPP original no están en el repo** (por confirmar); el clip tiene más trabajadores y tablones que el 3D |
| caidas | ninguno | — | IA · LTX 2 Fast · 9,7 s · 0,74 MB | pasillo de góndolas altas (6 niveles) visto desde la esquina del techo, góndolas transversales al fondo; mujer de blusa roja que camina, cae a 1,0–1,5 s y queda tendida; alerta a 5 s; empleado de azul que llega corriendo desde el fondo y se agacha a 7,8 s | 2·2·3·2·3 | el clip IA tiene un pequeño salto de posición de la mujer hacia los 3 s |
| hurto | `hurto-vivo.mp4` (grabación del visor del laboratorio, 920×440 con paneles) contra una góndola de perfumería | 0·0·1·0·0 | recorte 6–22 s del panel «vista en vivo» ampliado a 960×540 · propio · 16 s · 0,44 MB | oficina del laboratorio: tablero blanco al fondo, isla de escritorios con monitores, mesón vigilado abajo a la izquierda con cinta amarilla y negra; la persona llega al mesón a 4,4 s, toma el objeto y lo esconde, alerta a 9,1 s, se va hacia la derecha y al fondo; zona del mesón oro → roja | 2·2·2·2·3 | el clip es de baja resolución (ampliado 2×); la descripción se ajustó a «zona marcada (mesón)» |

## Lo que no fue posible y por qué
- **Stock real** para negras, merodeo, acceso y caídas: no encontré tomas fijas tipo CCTV con licencia libre que mostraran
  ese hecho (Mixkit «cctv»/«fall» solo trae escenas dramatizadas con cámara en mano). Se usaron 4 clips de IA.
- **Créditos ElevenLabs**: dos generaciones con Seedance 2.5 (negras, acceso) agotaron la cuota (33 600 créditos c/u);
  merodeo y caídas se hicieron con LTX 2 Fast (~2 400–2 900 créditos c/u). Quedan ~7 800 créditos en la cuenta compartida.
- No se generó image-to-video desde la captura 3D (exige subir el archivo); en cambio se escribió el prompt pensando en una
  geometría simple y luego se acomodó el 3D al video.
- No se dibujaron detecciones nuevas sobre los clips de IA (son referencia, no evidencia del modelo).
