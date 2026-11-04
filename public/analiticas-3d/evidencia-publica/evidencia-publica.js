/* Evidencia por escena. Desde nov-2026 cada clip se declara junto a su escena emparejada en sync/<familia>.js
   (ESC_SYNC.video), con su fuente y licencia. Este archivo solo quita el video a las escenas que no tienen clip. */
(function(){(window.ESCENAS||[]).forEach(function(s){delete s.video})})();
