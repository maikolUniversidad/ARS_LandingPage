/* Emparejamiento 3D ↔ video · lite-b (racks, pasillos, exhibicion, trazabilidad, autopago, zonaCiega). Ver sync/base.js.
   Regla: dur = duración del clip, fases en segundos del clip, K.camara con el encuadre del video, zonas/etiquetas con el
   mismo color y texto que las `marcas` del video. Auditoría en docs/vision-alineacion/lite-b.md. */
(function(){
  "use strict";
  var U=window.ESC_UTIL,S=window.ESC_SYNC,C=window.MOTOR.COL;
  var persona=U.persona,tienda=U.tienda,bodega=U.bodega,reloj=U.reloj,ventana=U.ventana,STAFF=U.STAFF;
  var DIR="evidencia-publica/lite/";
  function enCctv(){return !!(window.MOTOR&&window.MOTOR.vista==="cctv")}
  // cielo raso con tubos de luz: en los videos CCTV se ve el techo; solo se muestra en la vista de cámara (en la maqueta taparía todo)
  function techoCctv(K,w,d,y){var g=new THREE.Group();K.add(g);var mt=K.std(0xD9DCE1,{roughness:0.9,side:THREE.DoubleSide}),lz=K.std(0xFFFFFF,{emissive:0xFFFFFF,emissiveIntensity:1});
    var p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mt);p.rotation.x=PI2;p.position.y=y;g.add(p);
    for(var x=-w/2+1.5;x<w/2;x+=3)for(var z=-d/2+1;z<d/2;z+=2.2){var l=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.03,0.14),lz);l.position.set(x,y-0.02,z);g.add(l)}
    g.visible=enCctv();return g}
  var PI2=Math.PI/2;
  function lerpN(a,b,k){return a+(b-a)*k}

  /* ---------------------------------------------------------------------------------------------
     PASILLOS · clip público existente (evidencia-publica/pasillos.mp4, vertical 720×1376, con la
     segmentación del modelo quemada). Se reencuadra a 16:9 con fondo desenfocado y se recorta a un loop
     de 9,5 s (orig. 0,5–10 s, fundido de 0,5 s al inicio). Lo que muestra: cámara baja al comienzo de un
     pasillo angosto; una clienta agachada a ~2 m, a la derecha, revisa un producto; su canasta roja queda
     en el piso a su izquierda. El modelo la toma como candidato y a los 7,1 s del clip confirma el obstáculo.
     --------------------------------------------------------------------------------------------- */
  S.redef({id:"pasillos",grupo:3,nombre:"Pasillos libres",corta:"Avisa de lo que se queda estorbando el paso.",estado:"en validación",
    desc:"Separa a las personas de los objetos y solo avisa de lo que se queda: cajas, carros o canastas en el suelo. En el video, la canasta que la clienta deja en el piso queda como candidata y se confirma como obstáculo a los 7 segundos; ella no cuenta, es una persona.",
    dur:9.5,camara:{pos:[3.4,3.2,5.4],mira:[0,0.6,0]},
    fases:[[0,"vigila","Una clienta se agacha en el pasillo 2 y deja la canasta en el piso"],[1.5,"detecta","La canasta no se mueve: candidata a obstáculo, corre la cuenta"],[7.1,"alerta","Se confirma: obstáculo en el pasillo 2 (la persona no cuenta)"]],
    armar:function(K){tienda(K,{gondolas:false,exhibidor:false,canastas:false,pared:false});
      // pasillo angosto de 1,4 m entre dos góndolas largas, como en el video (la cámara mira a lo largo del pasillo)
      K.gondola(-1.15,-1.2,7,90,{niveles:5,alto:2.0,familias:["bolsas","cajas","bolsas","latas","cajas"]});
      K.gondola(1.15,-1.2,7,90,{niveles:5,alto:2.0,familias:["botellas","cajas","botellas","latas","botellas"]});
      K.gondola(0,-5,2.6,0,{niveles:5,alto:2.0,unaCara:true,familias:["botellas","botellas","cajas","botellas"]});
      // cámara baja (≈1,6 m) al comienzo del pasillo, inclinada hacia el piso, igual que el clip
      K.camara([0.05,1.6,2.3],[0.12,0.45,-0.4],{id:"CAM PASILLO 2",fov:50});
      var Z=K.zona([[-0.68,-3.6],[0.68,-3.6],[0.68,2.6],[-0.68,2.6]],{estado:"vigila",op:0.14});
      // la clienta, agachada todo el clip, mirando el producto que tiene en las manos
      var P=persona(K,{color:0x5B5FA8,ruta:[[0,0.32,0.15,"idle",-0.4,1.6]],escala:0.95});P.sinAuto=true;P.sinMirada=true;
      var pr=K.prodCaja(0.16,0.22,0.08,6);P.sostener(pr,"Right",[0,0.06,0.05]);
      P.post=function(t){K.agachar(P,1);var o=Math.sin(t*1.3)*0.04;K.ik(P,"Right",K.local(P,-0.06+o,0.78,0.34),1);K.ik(P,"Left",K.local(P,0.12,0.74,0.32+o),0.9)};
      var cn=K.canastilla(-0.3,0,0.85,0xD94F3D,0.35);cn.userData.obst=false;
      var Rp=K.recuadro(P,{texto:"persona",estado:"vigila",h:1.25,w:0.8,d:0.8});
      var R=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:0.4,rot:0},{texto:"",w:0.62,h:0.42,d:0.5,estado:"detecta"});R.fijo=[-0.3,0,0.85];R.visible=false;
      K.etiqueta("pasillo 2","",K.punto(0,0.05,-2.2));var e=reloj();
      return function(t){R.visible=t>1.5;var s=Math.max(0,t-1.5);R.set(t>7.1?"alerta":"detecta",t>7.1?"obstáculo":"candidato · "+s.toFixed(0)+" s");
        Z.set(t>7.1?"alerta":"vigila",t>7.1);K.contador("Obstáculos confirmados",t>7.1?"1":"0");
        e(t,1.5,"c",function(){K.evento("Canasta quieta en pasillo 2 · candidato","")});e(t,7.1,"a",function(){K.evento("Obstáculo en pasillo 2","alerta")})}}});
  S.video("pasillos",{src:DIR+"pasillos.mp4",poster:DIR+"pasillos-poster.jpg",chapa:"video público · modelo real",
    fuente:"Clip público ya publicado en evidencia-publica/pasillos.mp4 (procesado con el modelo de pasillos)",licencia:"ver CREDITS-lite-b.md",evento:7.1,
    marcas:[{tipo:"zona",pts:[[0.43,0.44],[0.6,0.44],[0.64,0.88],[0.37,0.88]],color:"vigila",etiqueta:"pasillo 2",hasta:7.1},
            {tipo:"zona",pts:[[0.43,0.5],[0.53,0.5],[0.53,0.64],[0.43,0.64]],color:"alerta",etiqueta:"obstáculo",desde:7.1}]});

  /* ---------------------------------------------------------------------------------------------
     RACKS · clip generado con IA (texto a video, LTX-2 Fast), 8,5 s en loop. Cámara alta al comienzo del
     pasillo de una bodega, mirando a lo largo: estantería naranja/azul por bahías a la izquierda (separadas
     por columnas), otra estantería a la derecha. Un operario con chaleco naranja y casco blanco entra con una
     caja, la sube a la bahía 2 —que ya estaba llena— y se queda mirando. La pila llega a la viga de arriba y
     sobresale del frente: sobrecarga a los 4,5 s del clip.
     --------------------------------------------------------------------------------------------- */
  S.redef({id:"racks",grupo:3,nombre:"Sobrecarga en racks",corta:"Avisa cuando un rack queda sobrecargado.",estado:"en validación",
    desc:"Cajas apiladas por encima del último nivel o que sobresalen por el frente o los costados. La zona de cada rack se dibuja una vez y el sistema la vigila solo. En el video, el operario sube una caja más a una bahía llena y la pila toca la viga de arriba.",
    dur:8.5,camara:{pos:[7,5.5,6.5],mira:[0,1.2,0]},
    fases:[[0,"ok","Racks con la carga en orden; entra un operario con una caja"],[3.5,"detecta","Sube la caja a la bahía 2, que ya estaba llena"],[4.5,"alerta","La pila toca la viga y sobresale del frente: sobrecarga en rack 1"]],
    armar:function(K){bodega(K,{montacargas:false,d:24});
      // estantería por bahías (2,4 m) a la izquierda del pasillo, con columnas entre bahías; otra estantería a la derecha
      var zs=[3.0,0.4,-2.2,-4.8,-7.4,-10.0],bah=zs.map(function(z,i){return K.rack(-1.4,z,2.4,90,{niveles:6,alto:4.2,vacios:i===1?[4,5]:null})});
      [1.7,-0.9,-3.5,-6.1,-8.7].forEach(function(z){K.caja(-0.72,0,z,0.32,4.5,0.32,K.mat.muro)});
      zs.forEach(function(z){K.rack(3.6,z,2.4,90,{niveles:6,alto:4.2})});
      var techo=techoCctv(K,16,24,4.5);
      K.camara([2.07,2.8,4.39],[-0.63,0,0.19],{id:"CAM RACKS",fov:56});
      // la caja que trae el operario y las que completan la pila hasta la viga (sobresalen 0,25 m del frente)
      var cj=K.caja(0,0,0,0.55,0.4,0.5,K.mat.carton);cj.userData.obst=false;
      var pila=[[-1.0,1.56,-0.05],[-1.0,1.56,0.75],[-1.05,1.92,-0.1]].map(function(q){var b=K.caja(q[0],q[1],q[2],0.6,0.36,0.55,K.mat.carton);b.userData.obst=false;b.visible=false;return b});
      var P=persona(K,{color:0xF26A1B,ropa:{camisa:0x1C2A44,chaleco:0xF26A1B,pantalon:0x1C1E22,zapatos:0x1C1E22,gorra:0xF2F2F0},
        ruta:[[0,1.1,4.6],[2.2,-0.3,1.0,"idle",-1.6,0.6],[3.6,-0.3,1.0,"idle",-1.6,0.6],[4.6,-0.25,1.8,"idle",-1.6,0.6],[7.4,-0.25,1.8,"idle",-1.6,0.6],[8.5,0.6,3.6]]});
      P.post=function(t){var c=ventana(t,0,3.7,0.1,0.3);if(c>0){var y=t<2.6?1.05:lerpN(1.05,1.75,Math.min(1,(t-2.6)/0.8));K.ik(P,"Right",K.local(P,-0.22,y,0.42),c);K.ik(P,"Left",K.local(P,0.22,y,0.42),c)}};
      var R=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:1,rot:0},{texto:"rack 1",w:1.4,h:4.3,d:2.5,estado:"ok"});R.fijo=[-1.3,0,0.4];
      var Z=K.zona([[-0.75,-0.8],[-0.4,-0.8],[-0.4,1.6],[-0.75,1.6]],{estado:"ok",op:0.18});var e=reloj();
      return function(t){techo.visible=enCctv();
        if(t<3.6){var a=K.manoPos(P,"Right"),b=K.manoPos(P,"Left");cj.position.set((a.x+b.x)/2,(a.y+b.y)/2-0.12,(a.z+b.z)/2);cj.rotation.y=P.rot}else{cj.position.set(-0.92,1.92,0.42);cj.rotation.y=0.12}
        pila.forEach(function(b,i){b.visible=t>3.4-0.0*i});
        R.set(t>4.5?"alerta":(t>3.5?"detecta":"ok"),t>4.5?"sobrecarga · 0,97":"rack 1");Z.set(t>4.5?"alerta":(t>3.5?"detecta":"ok"),t>4.5);
        e(t,3.5,"d",function(){K.evento("Carga nueva en rack 1 · bahía 2","")});e(t,4.5,"a",function(){K.evento("Sobrecarga en rack 1","alerta")})}}});
  S.video("racks",{src:DIR+"racks.mp4",poster:DIR+"racks-poster.jpg",ia:true,chapa:"video generado con IA · referencia",
    fuente:"ElevenLabs · LTX-2 Fast (texto a video)",autor:"generado para Vigías",licencia:"contenido generado; uso como referencia ilustrativa",evento:4.5,
    marcas:[{tipo:"zona",pts:[[0.34,0.0],[0.58,0.0],[0.58,0.5],[0.34,0.6]],color:"ok",etiqueta:"rack 1",hasta:3.5},
            {tipo:"zona",pts:[[0.34,0.0],[0.58,0.0],[0.58,0.5],[0.34,0.6]],color:"detecta",etiqueta:"rack 1",desde:3.5,hasta:4.5},
            {tipo:"zona",pts:[[0.34,0.0],[0.58,0.0],[0.58,0.5],[0.34,0.6]],color:"alerta",etiqueta:"sobrecarga · 0,97",desde:4.5}]});

  /* ---------------------------------------------------------------------------------------------
     AUTOPAGO · clip generado con IA (texto a video, LTX-2 Fast), 9,5 s en loop. Cámara cenital sobre un
     autopago: lector con luz azul arriba al centro, mostrador blanco, pantalla a la derecha y la bolsa de
     papel abajo a la derecha. La clienta (canasta verde) pasa leche, pan y café por el lector; al final mete
     una caja roja directo en la bolsa, sin pasarla por el lector → aviso a los 8,3 s del clip.
     --------------------------------------------------------------------------------------------- */
  S.redef({id:"autopago",grupo:3,nombre:"Validación de autopago",corta:"Verifica que todo lo que pasa por el autopago se escanee.",
    desc:"Mira cada producto que pasa por la zona de escaneo del autopago y lo cruza con lo que registró la máquina. El que llega a la bolsa sin pasar por el lector dispara el aviso.",
    dur:9.5,camara:{pos:[4,4.4,4.6],mira:[0,0.9,-1]},
    fases:[[0,"vigila","Cada producto que pasa por el lector se cruza con el registro"],[1.3,"ok","Leche, pan y café pasan por el lector: coinciden"],[8.3,"alerta","Una caja roja va directo a la bolsa sin pasar por el lector: aviso"]],
    armar:function(K){tienda(K,{gondolas:false,exhibidor:false,canastas:false});
      var k=K.grupo(0,-1.2);K.caja(0,0,0,1.6,0.9,0.7,K.mat.blanco,k);K.caja(0,0.9,0,1.6,0.03,0.7,K.mat.blanco,k);K.caja(-0.3,0.93,0.05,0.34,0.012,0.12,K.std(0x22D3EE,{emissive:0x22D3EE,emissiveIntensity:0.9}),k);K.caja(-0.3,0.93,-0.12,0.36,0.01,0.16,K.mat.negro,k);
      K.pc(0.5,0.93,-0.2,0,k);K.caja(0.62,0,-0.72,0.4,0.85,0.3,K.mat.aceroOsc);var bolsa=K.caja(0.62,0.86,-0.72,0.32,0.34,0.22,K.std(0xB08A5A,{roughness:0.9}));
      K.gondola(0,-3.4,4,0,{niveles:4,alto:1.6,familias:["cajas","latas","cajas","bolsas"]});K.gondola(3.6,-1.2,3,90,{niveles:4,alto:1.6});
      K.camara([0.32,2.73,0.64],[-0.23,0.8,-1.17],{id:"CAM AUTOPAGO",fov:50});
      var Z=K.zona([[-0.5,-1.3],[-0.1,-1.3],[-0.1,-1.05],[-0.5,-1.05]],{estado:"ok",y:0.93,op:0.3}),Zb=K.zona([[0.44,-0.85],[0.8,-0.85],[0.8,-0.6],[0.44,-0.6]],{estado:"vigila",y:0.86,op:0.2});
      K.etiqueta("zona de escaneo","ok",K.punto(-0.3,1.0,-1.35));K.etiqueta("bolsa","",K.punto(0.62,1.25,-0.75));
      var P=persona(K,{color:0x1F2F55,ropa:{chaqueta:0x1F2F55,cierre:true,pantalon:0x1C1E22,zapatos:0x1C1E22},ruta:[[0,-0.95,-0.55,"idle",-0.3,-1.2]]});P.sinAuto=true;
      var pr=U.producto(K,0xD94F3D,2);P.sostener(pr,"Right",[0,0.1,0.06]);var cesta=K.canastilla(0,0,0,0x3EA66B);P.sostener(cesta,"Left",[0,-0.3,0.1]);var R=K.recuadro(P,{texto:"cliente"});var e=reloj(),esc=0;
      var T=[1.3,2.2,4.2,8.3];
      P.post=function(t){K.ik(P,"Left",K.local(P,0.3,0.75,0.05),0.8);T.forEach(function(tt,i){var a=ventana(t,tt-0.9,tt+0.5,0.4,0.4);if(a>0){var tg=t<tt-0.3?K.local(P,0.2,0.95,0.3):(i<3?new THREE.Vector3(-0.3,1.05,-1.2):new THREE.Vector3(0.62,1.15,-0.75));K.ik(P,"Right",tg,a)}})};
      return function(t){T.slice(0,3).forEach(function(tt,i){e(t,tt,"s"+i,function(){esc++;K.evento("Escaneado · "+["leche","pan","café"][i],"")})});var idx=t<1.6?0:(t<2.6?1:(t<5?2:3));pr.material=K.std([0xF2F2F0,0xC8893B,0x5A3A22,0xD94F3D][idx]);
        K.contador("Productos vistos",String(esc+(t>8.3?1:0)));K.contador("Registrados",String(esc));R.set(t>8.3?"alerta":"vigila",t>8.3?"sin escanear":"cliente");Z.set(t>8.3?"alerta":"ok",t>8.3);Zb.set(t>8.3?"alerta":"vigila",t>8.3);
        e(t,8.3,"a",function(){K.evento("Producto sin escanear · autopago 2","alerta")})}}});
  S.video("autopago",{src:DIR+"autopago.mp4",poster:DIR+"autopago-poster.jpg",ia:true,chapa:"video generado con IA · referencia",
    fuente:"ElevenLabs · LTX-2 Fast (texto a video)",autor:"generado para Vigías",licencia:"contenido generado; uso como referencia ilustrativa",evento:8.3,
    marcas:[{tipo:"zona",pts:[[0.4,0.38],[0.57,0.38],[0.57,0.56],[0.4,0.56]],color:"ok",etiqueta:"zona de escaneo",hasta:8.3},
            {tipo:"zona",pts:[[0.4,0.38],[0.57,0.38],[0.57,0.56],[0.4,0.56]],color:"alerta",etiqueta:"zona de escaneo",desde:8.3},
            {tipo:"zona",pts:[[0.62,0.62],[0.78,0.62],[0.78,0.88],[0.62,0.88]],color:"vigila",etiqueta:"bolsa",hasta:8.3},
            {tipo:"zona",pts:[[0.62,0.62],[0.78,0.62],[0.78,0.88],[0.62,0.88]],color:"alerta",etiqueta:"sin escanear",desde:8.3}]});

  /* ---------------------------------------------------------------------------------------------
     ZONA CIEGA · lo que ninguna cámara ve no puede filmarse. Emparejamiento honesto: el video es lo que
     SÍ ve CAM 01 (esquina alta, gran angular, piso de ventas con la fila de góndolas al fondo y una góndola
     alta en primer plano a la derecha). La zona ciega es lo que queda DETRÁS de esa góndola: en el video se
     marca sobre la góndola que tapa la vista; en el 3D es el piso detrás de ella. El cliente de chaqueta azul
     espera junto al borde de la góndola, pasa detrás a los ~3 s y ya no reaparece. Clip generado con IA
     (texto a video, LTX-2 Fast), 7,5 s en loop.
     --------------------------------------------------------------------------------------------- */
  S.redef({id:"zonaCiega",grupo:3,nombre:"Zona ciega",corta:"Muestra lo que ninguna cámara ve, y quién entra ahí.",
    desc:"Arma el mapa de cobertura de todas las cámaras sobre el plano y marca los puntos ciegos. Cuando alguien entra a uno, lo sigue por estimación y avisa si tarda en reaparecer. En el video se ve lo que sí cubre CAM 01; la zona ciega queda detrás de la góndola de la derecha.",
    dur:7.5,camara:{pos:[2,15,11],mira:[0,0,0]},sinPip:true,
    fases:[[0,"vigila","CAM 01 cubre el piso de ventas; el mapa marca lo que no ve"],[1,"detecta","Detrás de la góndola de la derecha queda una zona ciega"],[3,"detecta","El cliente de chaqueta azul pasa detrás de la góndola: se sigue por estimación"],[6,"alerta","No reaparece: aviso de zona ciega"]],
    armar:function(K){tienda(K,{gondolas:false,exhibidor:false,canastas:false});
      var fam=[["cajas","latas","cajas","botellas"],["latas","cajas","latas","cajas"],["botellas","latas","cajas","latas"]];
      // fila de góndolas de frente a la cámara, al fondo, con pasos entre ellas y una columna (encuadre ajustado a los cuadros del clip)
      K.gondola(-5.4,-2.26,3.2,0,{niveles:5,alto:2.0,familias:fam[0]});K.gondola(-1.1,-2.26,2.6,0,{niveles:5,alto:2.0,familias:fam[1]});K.gondola(2.6,-2.26,4.2,0,{niveles:5,alto:2.0,familias:fam[2]});
      K.gondola(-4,-3.9,4,0,{niveles:5,alto:2.0,familias:fam[1]});K.gondola(1.6,-3.9,4.6,0,{niveles:5,alto:2.0,familias:fam[0]});
      K.caja(-2.9,0,-1.9,0.4,3.3,0.4,K.mat.blanco);
      // la góndola alta de primer plano, a la derecha (pasa junto a la cámara): es la que tapa la vista
      K.gondola(1.95,1.8,4.5,90,{niveles:5,alto:2.3,familias:["cajas","bolsas","cajas","cajas","bolsas"]});
      var techo=techoCctv(K,16,11,3.3);
      K.camara([0.02,2.6,2.26],[-1.07,0.5,-3.9],{id:"CAM 01",fov:62,alcance:9});
      var Zv=K.zona([[-7.6,-1.8],[1.4,-1.8],[1.4,5.2],[-7.6,5.2]],{estado:"ok",op:0.2}),Zc=K.zona([[2.45,-1.8],[7.8,-1.8],[7.8,5.2],[2.45,5.2]],{estado:"detecta",op:0.0});
      K.etiqueta("cubierto por CAM 01","ok",K.punto(-2.4,0.05,0.4));var Ec=K.etiqueta("zona ciega · detrás de la góndola","ambar",K.punto(1.5,2.45,-0.7));
      var P=persona(K,{color:0x2F64C8,ropa:{chaqueta:0x2F64C8,cierre:true,pantalon:0x1C1E22,zapatos:0x1C1E22},ruta:[[0,1.25,-1.15,"idle",3,-1.15],[2.5,1.25,-1.15,"idle",3,-1.15],[3.4,3.4,-1.15],[7.5,4.6,0.6,"idle",6,0.6]]});
      var R=K.recuadro(P,{texto:"ID 44"});
      persona(K,{color:0x6B4A2E,ropa:{chaqueta:0x6B4A2E,pantalon:0x1C1E22,zapatos:0x1C1E22},ruta:[[0,0.3,-1.0],[3.0,-2.6,1.1],[7.5,-6.6,1.6]]});
      var e=reloj();
      return function(t){techo.visible=enCctv();Zc.op=t>1?0.26:0;Zc.set(t>6?"alerta":"detecta",t>6);Ec.set(null,t>6?"rojo":"ambar");var dentro=P.raiz.position.x>2.45;
        R.set(dentro?(t>6?"alerta":"detecta"):"vigila",dentro?(t>6?"no reaparece":"sin imagen · estimado"):"ID 44");R.ocultar(dentro);P.raiz.traverse(function(m){if(m.isMesh)m.material.opacity=dentro?0.35:1});
        K.contador("Cobertura del local",t>1?"71 %":"—");K.contador("Puntos ciegos",t>1?"1":"—");
        e(t,3,"z",function(){K.evento("ID 44 entra a la zona ciega","")});e(t,6,"a",function(){K.evento("ID 44 no reaparece · zona ciega","alerta")})}}});
  S.video("zonaCiega",{src:DIR+"zonaCiega.mp4",poster:DIR+"zonaCiega-poster.jpg",ia:true,chapa:"video generado con IA · referencia",
    fuente:"ElevenLabs · LTX-2 Fast (texto a video)",autor:"generado para Vigías",licencia:"contenido generado; uso como referencia ilustrativa",evento:6,
    marcas:[{tipo:"zona",pts:[[0.03,0.7],[0.79,0.72],[0.79,1],[0.03,1]],color:"ok",etiqueta:"cubierto por CAM 01"},
            {tipo:"zona",pts:[[0.83,0.33],[1,0.29],[1,1],[0.8,1]],color:"detecta",etiqueta:"zona ciega · detrás de la góndola",desde:1,hasta:6},
            {tipo:"zona",pts:[[0.83,0.33],[1,0.29],[1,1],[0.8,1]],color:"alerta",etiqueta:"zona ciega · detrás de la góndola",desde:6}]});
})();
