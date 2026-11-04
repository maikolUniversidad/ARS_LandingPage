/* ---------- Emparejamiento 3D ↔ video real (nov-2026) ----------
   Cada familia tiene su archivo (sync/comercial.js, operativo.js, prevencion.js, lite.js) que se carga DESPUÉS de
   escenas.js y escenas2.js y puede:
     ESC_SYNC.redef({id, ...})          reemplaza la escena completa con ese id (misma forma que def() en escenas*.js)
     ESC_SYNC.ajustar(id, fn)           modifica la escena existente: fn(def) puede cambiar dur, fases, desc, armar…
     ESC_SYNC.video(id, {...})          declara el clip real emparejado (lo lee scripts/generar-analiticas.cjs):
        src, poster              rutas relativas a /analiticas-3d/ (p. ej. "evidencia-publica/comercial/conteo.mp4")
        chapa                    texto corto de procedencia («CCTV real · modelo real», «video generado con IA»…)
        fuente, autor, url, licencia   crédito del clip (también en evidencia-publica/<familia>/CREDITS.md)
        evento                   segundo del clip donde ocurre el hecho clave (se resalta en la línea de tiempo)
        marcas                   [{tipo:"zona"|"linea", pts:[[x,y],…] normalizados 0–1 sobre el cuadro del video,
                                   color:"vigila"|"detecta"|"alerta"|"ok"|"oro", etiqueta:"…", desde?, hasta?}]
                                 → el visor las dibuja sobre el video con el MISMO color y texto que la zona/línea 3D.
        ia                       true si el clip se generó con IA (se rotula como tal)
   Regla de oro: la duración del clip = dur de la escena, y los segundos de fases = segundos del clip.
   El visor reproduce el video y le pasa su segundo a la simulación (mensaje vigias-sim-t), así que ambos van juntos. */
(function(){
  "use strict";
  var ES=window.ESCENAS||[];window.ESC_VIDEO=window.ESC_VIDEO||{};
  function idx(id){for(var i=0;i<ES.length;i++)if(ES[i].id===id)return i;return -1}
  window.ESC_SYNC={
    redef:function(o){var i=idx(o.id);if(i<0){ES.push(o)}else{var v=ES[i].video;ES[i]=o;if(v&&!o.video)o.video=v}return o},
    ajustar:function(id,fn){var i=idx(id);if(i<0){console.log("ESC_SYNC: no existe "+id);return null}fn(ES[i]);return ES[i]},
    video:function(id,v){window.ESC_VIDEO[id]=v;var i=idx(id);if(i>=0){ES[i].video=v;if(v.desc)ES[i].desc=v.desc}return v}
  };
})();
