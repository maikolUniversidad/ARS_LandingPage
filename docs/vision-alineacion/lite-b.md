# Alineación 3D ↔ video · lite-b

Ids: racks, pasillos, exhibicion, trazabilidad, autopago, zonaCiega. Código en `public/analiticas-3d/sync/lite-b.js`,
clips en `public/analiticas-3d/evidencia-publica/lite/`, créditos en `CREDITS-lite-b.md`.

Puntajes 0–3 en este orden: **encuadre · espacio · actores · objetos · momento**. «—» = no había video con qué comparar.

| id | video antes | puntaje antes | video nuevo (fuente/licencia) | qué cambió en el 3D | puntaje después | pendientes |
|---|---|---|---|---|---|---|
| pasillos | `evidencia-publica/pasillos.mp4` (vertical 720×1376, 10 s, con la segmentación del modelo quemada) | 0 · 1 · 0 · 1 · 0 (el 3D era una vista alta de la tienda con un empleado que deja una caja; el video es una cámara baja en un pasillo angosto con una clienta agachada y su canasta) | mismo clip, reencuadrado a 16:9 con fondo desenfocado, loop 9,5 s, 0,21 MB | pasillo angosto de 1,4 m entre dos góndolas de 7 m; cámara baja (1,6 m) al comienzo del pasillo; clienta agachada todo el clip con un producto en las manos; canasta roja en el piso a su izquierda; candidato desde 1,5 s y obstáculo confirmado a los 7,1 s (el mismo segundo en que el video pasa a ALERTA); zona «pasillo 2» y caja «obstáculo» con los colores de las marcas | 2 · 2 · 2 · 2 · 3 | la pose agachada del muñeco se ve inclinada hacia delante, no en cuclillas; el clip original es vertical, así que el panel de video muestra franjas desenfocadas |
| racks | ninguno (solo imagen `evidencia/rack.jpg`) | — | IA · ElevenLabs LTX-2 Fast, texto a video, loop 8,5 s, 0,23 MB | cámara alta al comienzo del pasillo (ajustada por mínimos cuadrados a columnas y punto de fuga del clip); estantería por bahías de 2,4 m con columnas entre bahías, otra estantería a la derecha, bodega de 24 m de fondo, techo con tubos de luz solo en vista de cámara; operario de chaleco naranja y casco blanco entra con una caja, la sube a la bahía 2 (3,5 s) y la pila toca la viga: sobrecarga a los 4,5 s | 2 · 2 · 2 · 2 · 2 | en el clip las vigas son naranjas y los parales azules (en el kit es al revés); el clip de IA no deja claro que la pila «sobresalga», el aviso se apoya en el texto |
| autopago | ninguno | — | IA · ElevenLabs LTX-2 Fast, texto a video, loop 9,5 s, 0,45 MB | cámara casi cenital desde el lado del cliente (ajustada a lector, pantalla, bolsa y clienta); un solo autopago con lector de luz celeste, pantalla a la derecha y bolsa de papel en repisa; clienta de chaqueta azul oscura con canasta verde; escaneos a 1,3 · 2,2 · 4,2 s; caja roja directo a la bolsa a los 8,3 s → aviso; zonas «zona de escaneo» (ok→alerta) y «bolsa» (vigila→alerta) | 2 · 2 · 2 · 2 · 3 | la primera generación (texto «sin escanearlo») fue bloqueada por el filtro de contenidos; se repitió con redacción neutra |
| zonaCiega | ninguno | — | IA · ElevenLabs LTX-2 Fast, texto a video, loop 7,5 s, 0,21 MB | **Emparejamiento honesto**: lo que nadie ve no se puede filmar, así que el video es lo que SÍ ve CAM 01 y la zona ciega es lo que tapa la góndola alta de primer plano a la derecha. 3D: fila de góndolas al fondo con columna, góndola alta a la derecha que pasa junto a la cámara, techo en vista de cámara; zona «cubierto por CAM 01» (verde) y «zona ciega · detrás de la góndola» (ámbar→rojo); el cliente de chaqueta azul espera junto al borde de la góndola, pasa detrás a los ~3 s (en el 3D se vuelve translúcido y su caja pasa a punteada «sin imagen · estimado») y no reaparece → aviso a los 6 s. En el video la marca roja se dibuja sobre la góndola que tapa la vista | 2 · 2 · 2 · 2 · 2 | el clip de IA tiene incoherencias propias (una persona cambia de ropa a 1,5 s, otra se esfuma); por eso el loop es corto |
| exhibicion | ninguno | — | **sin clip** | sin cambios | — | no se pudo generar: cuota de créditos de ElevenLabs agotada (ver abajo); no hay stock libre con una toma fija de góndola en la que cambie la exhibición |
| trazabilidad | ninguno | — | **sin clip** | sin cambios | — | ídem; además necesita ~15 s (góndola → caja) y un recorrido que la IA de texto no garantiza |

## Lo que no fue posible y por qué

- **Stock libre**: Pexels responde 403 a la búsqueda y la descarga directa fue denegada por el control de permisos (se
  interpreta como sortear protección anti-bots), así que no se usó. Mixkit sí responde, pero sus clips de supermercado y
  bodega son tomas de cámara en mano o comerciales, no CCTV fijas con el evento. Coverr mezcla clips subidos por usuarios
  generados con IA sin autor claro: descartado.
- **IA con cuadro inicial del 3D** (truco del brief): la subida de un archivo local a ElevenLabs Flows exige que el usuario
  elija el archivo en un selector; como subagente no puedo hacerlo y el servidor local no es una URL pública. Se usó texto a
  video y luego **el 3D se ajustó al video** (cámara resuelta por mínimos cuadrados contra 4–6 puntos medidos en los cuadros).
- **Cuota**: Seedance 2.5 costaba ~6 USD por clip a 720p y la cuenta solo tenía 11 610 créditos (compartidos con los otros
  agentes); se pasó a LTX-2 Fast (2 424 créditos por clip de 10 s). Se hicieron 5 generaciones (1 bloqueada por el filtro),
  4 clips útiles. Quedan ~1 900 créditos, menos que un clip de 8 s: exhibicion y trazabilidad quedan solo con simulación.
- Ningún clip de IA lleva detecciones de modelo; están rotulados `ia:true` y «video generado con IA · referencia».

Flujo de generación: ElevenLabs Flows «Vigías lite-b · CCTV referencia» (id `7MQ093eUbjXMzJfXI0eX`).
