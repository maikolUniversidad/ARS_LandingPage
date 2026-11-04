/* Emparejamiento 3D ↔ video · familia prevencion (parte A: negras, merodeo, intrusion, acceso, aglomeracion, epp, caidas, hurto).
   Ver sync/base.js. Cada escena se redefine copiando la original de escenas2.js y se acomoda al clip de
   evidencia-publica/prevencion/<id>.mp4: misma cámara, mismo lugar, mismas personas y el evento en el mismo segundo. */
(function(){
  "use strict";
  var U=window.ESC_UTIL,S=window.ESC_SYNC,C=window.MOTOR.COL;
  var persona=U.persona,reloj=U.reloj,suave=U.suave,cabeza=U.cabeza,torso=U.torso,nervioso=U.nervioso,ventana=U.ventana,STAFF=U.STAFF,ROPA=U.ROPA;
  var EV="evidencia-publica/prevencion/";
  var MEVA={fuente:"MEVA · Multiview Extended Video with Activities (Kitware / IARPA DIVA)",url:"https://mevadata.org",licencia:"CC BY 4.0"};
  var IA={fuente:"ElevenLabs (generación de video)",autor:"generado con IA para Vigías",licencia:"uso propio · referencia",ia:true,chapa:"video generado con IA · referencia"};
  function O(a,b){var o={},k;for(k in a)o[k]=a[k];for(k in b)o[k]=b[k];return o}

  /* --- ayudas --- */
  // Persona sentada: dobla caderas y rodillas y baja el cuerpo (el motor aplica P.agacha después del post).
  function sentar(K,P,k){if(k<=0.001)return;[["LeftUpLeg",1.45],["RightUpLeg",1.45]].forEach(function(q){var b=K.huesoC(P,q[0]);if(b)b.rotation.x-=q[1]*k});
    [["LeftLeg",1.5],["RightLeg",1.5]].forEach(function(q){var b=K.huesoC(P,q[0]);if(b)b.rotation.x+=q[1]*k});P.agacha=1.32*k*P.raiz.scale.y}
  function recuadroRostro(K,P,o){var cab={raiz:new THREE.Object3D(),visible:true,alto:0.3,rot:0};var R=K.recuadro(cab,O({texto:"rostro",w:0.3,h:0.3,d:0.3},o||{}));
    R.seguir=function(){var p=P.raiz.position;cab.raiz.position.set(p.x,p.y+P.alto-0.32,p.z);cab.rot=P.rot;cab.visible=P.visible};R.seguir();return R}
  // Banca de sala de espera: asiento y espaldar sobre patas (largo en x local).
  function banca(K,x,z,largo,ry,col){var g=K.grupo(x,z,ry),m=K.std(col,{roughness:0.55}),pata=K.mat.aceroOsc;
    K.caja(0,0.42,0,largo,0.05,0.48,m,g);var e=K.caja(0,0.5,-0.26,largo,0.5,0.05,m,g);e.rotation.x=-0.18;
    [-largo/2+0.2,largo/2-0.2].forEach(function(px){K.caja(px,0,0,0.06,0.42,0.42,pata,g);K.caja(px,0,0,0.06,0.04,0.6,pata,g)});g.userData.obst=true;return g}
  function silla(K,x,z,ry){var g=K.grupo(x,z,ry),m=K.std(0xB9BEC8,{metalness:0.5,roughness:0.4});K.cil(0,0.44,0,0.2,0.2,0.03,K.std(0xC8B79A,{roughness:0.6}),g);
    [[-0.15,-0.15],[0.15,-0.15],[-0.15,0.15],[0.15,0.15]].forEach(function(p){K.cil(p[0],0,p[1],0.012,0.012,0.45,m,g)});K.caja(0,0.45,-0.19,0.36,0.4,0.02,m,g);return g}
  function sofa(K,x,z,largo,ry,col){var g=K.grupo(x,z,ry),m=K.std(col,{roughness:0.9});K.caja(0,0,0,largo,0.42,0.85,m,g);K.caja(0,0.42,-0.33,largo,0.42,0.2,m,g);
    [-1,1].forEach(function(s){K.caja(s*(largo/2-0.1),0.42,0,0.2,0.22,0.85,m,g)});g.userData.obst=true;return g}
  function casco(K,P,col){var am=K.std(col,{roughness:0.35});var g=new THREE.Group();var cu=new THREE.Mesh(new THREE.SphereGeometry(0.135,20,12,0,Math.PI*2,0,Math.PI*0.52),am);cu.castShadow=true;g.add(cu);
    var ala=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.012,24),am);ala.position.y=0.005;ala.scale.set(1,1,1.12);ala.position.z=0.025;g.add(ala);
    var b=P.hueso("Head");if(!b)return;var ws=new THREE.Vector3();b.getWorldScale(ws);g.scale.multiplyScalar(1/ws.x);g.position.y=0.085/ws.x;b.add(g)}

  /* =====================================================================================================
     LISTAS NEGRAS · clip IA: cámara cenital sobre el acceso de vidrio con tres antenas antihurto.
     El hombre de chaqueta gris entra a los 1,5 s, pasa entre las antenas y sale por abajo; a los 8 s entra una mujer.
     ===================================================================================================== */
  S.redef({id:"negras",grupo:2,nombre:"Listas negras",corta:"Avisa en el acto si entra alguien de una lista.",estado:"funcionando a diario",
    desc:"Compara cada rostro del acceso con una lista corta y avisa al puesto de monitoreo con la foto y el video ya guardados. Solo en accesos.",
    dur:11.4,camara:{pos:[5.5,6.5,7],mira:[0,0.6,-1]},
    fases:[[0,"vigila","Cada rostro del acceso se compara con la lista"],[3.2,"alerta","Coincidencia con la lista negra: aviso inmediato"],[6,"detecta","Se sigue a la persona dentro del local"]],
    armar:function(K){K.piso(12,12,K.std(0xC9C6BE,{roughness:0.35}));
      var vid=K.std(0x9FB0B8,{transparent:true,opacity:0.32,roughness:0.05,metalness:0.2}),alu=K.std(0x9AA3AD,{metalness:0.6,roughness:0.35});
      // fachada de vidrio al fondo con la puerta automática abierta, y los dos muros de vidrio del vestíbulo que se abren hacia la cámara
      K.muro(-3,-3.1,-1.0,-3.1,2.7,vid,0.05);K.muro(1.0,-3.1,3,-3.1,2.7,vid,0.05);K.caja(0,2.35,-3.1,4,0.35,0.14,alu);[-1.0,1.0,-0.05,0.05].forEach(function(x){K.caja(x,0,-3.1,0.08,2.4,0.1,alu)});
      K.muro(-1.4,-3.1,-2.7,0.8,2.7,vid,0.05);K.muro(1.4,-3.1,2.7,0.8,2.7,vid,0.05);[[-1.4,-3.1],[-2.05,-1.15],[1.4,-3.1],[2.05,-1.15]].forEach(function(p){K.caja(p[0],0,p[1],0.09,2.7,0.09,alu)});
      
      // tres antenas antihurto en fila
      [-0.75,0,0.75].forEach(function(x){K.caja(x,0,-1.25,0.1,1.65,0.32,K.std(0x55595F,{roughness:0.45}))});
      // estanterías que se ven a través de los vidrios laterales
      K.gondola(-4.6,-3.4,4,90,{niveles:5,alto:2,familias:["botellas","latas","botellas","cajas"]});K.gondola(4.6,-3.4,4,90,{niveles:5,alto:2,familias:["cajas","botellas","latas","bolsas"]});
      K.camara([0,3.1,0.6],[0,0,-1.9],{id:"CAM ACCESO",fov:82});
      var P=persona(K,{color:0x4A4F5C,ropa:{chaqueta:0x4A4F5C,pantalon:0x26324A,zapatos:0x1C1E22,gorra:0x1C1E22},ruta:[[0,-0.4,-6],[1.3,-0.4,-3.6],[3.2,-0.4,-1.25],[4.8,-0.5,0.6],[11.4,-1.4,6]]});
      var M=persona(K,{color:0xD8C8B0,ropa:{chaqueta:0xD8C8B0,cierre:true,pantalon:0x26324A,zapatos:0x1C1E22},ruta:[[0,0.3,-7],[8.0,0.3,-4],[9.6,0.4,-2.6],[11.4,1.4,-1.4]]});
      var R=recuadroRostro(K,P),Rm=recuadroRostro(K,M),lb=K.etiqueta("Lista negra · 0,93","rojo",K.sobre(P));var e=reloj();
      return function(t){M.visible=t>7.2;R.seguir();Rm.seguir();Rm.visible=t>7.2;R.set(t>3.2?"alerta":"vigila",t>3.2?"coincidencia 0,93":"rostro");Rm.set("vigila","sin coincidencia");lb.el.style.opacity=t>3.2&&t<6?1:0;
        e(t,3.2,"a",function(){K.evento("Lista negra · entrada principal","alerta")});K.contador("Rostros comparados hoy","1.284")}}});
  S.video("negras",O(IA,{src:EV+"negras.mp4",poster:EV+"negras-poster.jpg",url:"https://elevenlabs.io",evento:3.2,
    marcas:[{tipo:"linea",pts:[[0.33,0.55],[0.69,0.55]],color:"vigila",etiqueta:"Acceso · se compara cada rostro"}]}));

  /* =====================================================================================================
     MERODEO · clip IA: andén frente a la vitrina de una joyería, cámara alta en la fachada mirando a lo largo.
     El hombre de buzo gris baja por la vitrina, se para a mirarla (2,5 s), sale por abajo y vuelve a pasar (10,5 s).
     ===================================================================================================== */
  S.redef({id:"merodeo",grupo:2,nombre:"Merodeo",corta:"Avisa de quien da vueltas sin entrar ni irse.",
    desc:"Mide cuánto tiempo pasa una persona en una zona y cómo se mueve. Quien va y viene frente a una vitrina, un cajero o una puerta más de lo normal dispara el aviso.",
    dur:11.6,camara:{pos:[8,7,6],mira:[-1,0.4,-3]},
    fases:[[0,"vigila","Se vigila el andén frente a la vitrina"],[2.5,"detecta","Se para frente a la vitrina sin entrar: el reloj de permanencia corre"],[10.5,"alerta","Vuelve a pasar: supera el umbral de merodeo y avisa con su recorrido"]],
    armar:function(K){K.piso(14,26,K.std(0xA9AEB0,{roughness:0.8}));var piedra=K.std(0x5E6467,{roughness:0.85});
      K.muro(-3.2,6,-3.2,-20,4,K.std(0x2A2E31),0.3);K.caja(-2.2,2.6,-7,0.5,1.4,26,piedra);
      // vitrina corrida de la joyería: zócalo, vidrio, mostradores iluminados con piezas, y pilares de piedra
      K.caja(-2.2,0,-7,0.35,0.5,26,piedra);K.caja(-2.06,0.5,-7,0.03,2.1,26,K.std(0x40484C,{transparent:true,opacity:0.28,roughness:0.05,metalness:0.3}));
      for(var z=3.4;z>-18;z-=1.1){K.caja(-2.6,0,z,0.7,0.85,0.95,K.std(0x2B2620,{roughness:0.6}));K.caja(-2.6,0.85,z,0.7,0.04,0.95,K.std(0xE6D7A8,{roughness:0.3,emissive:0xE6D7A8,emissiveIntensity:0.25}));
        for(var j=0;j<3;j++)K.caja(-2.75+j*0.18,0.89,z-0.2+j*0.15,0.07,0.05,0.07,K.std(0xD6AB4C,{metalness:1,roughness:0.25}));K.caja(-2.9,1.4,z,0.3,0.04,0.9,K.std(0xC9B98E,{roughness:0.4}))}
      for(z=4.5;z>-20;z-=3.4)K.caja(-2.1,0,z,0.5,4,0.5,piedra);
      // bolardos, rejilla y canal del andén
      [-3.5,-9,-14.5].forEach(function(z){K.cil(0.2,0,z,0.07,0.08,0.9,K.std(0x2B2F33))});K.parche(0.9,0.2,0.9,1.3,K.std(0x6E7376,{roughness:0.6}),1,0.006);K.parche(1.8,-6,0.12,26,K.std(0x8E9396),1,0.006);K.parche(-0.6,-6,0.08,26,K.std(0x8E9396),1,0.006);
      K.camara([-0.9,3.3,1.9],[-1.15,0,-1.5],{id:"CAM FACHADA",fov:60});
      var Z=K.zona([[-1.9,-7],[-0.3,-7],[-0.3,2.4],[-1.9,2.4]],{estado:"vigila",op:0.16});
      var P=persona(K,{color:0x3C4046,escala:1,ropa:{chaqueta:0x3C4046,cierre:true,pantalon:0x1E2226,zapatos:0x1C1E22,gorra:0x1C1E22},ruta:[[0,-1.4,-4.6],[2.3,-1.45,-1.2],[2.6,-1.45,-1.1,"idle",-2.4,-1.0],[6.2,-1.45,-1.1,"idle",-2.4,-1.6],[8.4,-1.2,2.8],[9.8,-1.2,2.8],[11.6,-1.0,0.6]]});
      P.sinMirada=true;P.post=function(t){if(t>2.5&&t<6.4)cabeza(K,P,nervioso(t*0.8)*0.6,-0.1)};
      persona(K,{color:0x2B2F36,ruta:[[0,0.6,-14],[3,0.8,-8],[7.6,1.2,-0.6],[11.6,1.4,4]]});
      var tr=[],R=K.recuadro(P,{texto:"persona"}),et=K.etiqueta("","reloj",K.sobre(P));var e=reloj(),k=0,ln=null;
      return function(t){var s=Math.max(0,t-0.6)*11;et.set(Math.floor(s/60)+" min "+String(Math.floor(s%60)).padStart(2,"0")+" s",t>10.5?"reloj rojo":"reloj");et.el.hidden=t<0.6;
        if((k++)%6===0){tr.push([P.raiz.position.x,0.04,P.raiz.position.z]);if(ln){ln.geometry.dispose();ln.parent.remove(ln);ln=null}if(tr.length>1)ln=K.linea3(tr,t>10.5?C.alerta:C.detecta)}
        R.set(t>10.5?"alerta":(t>2.5?"detecta":"vigila"));Z.set(t>10.5?"alerta":(t>2.5?"detecta":"vigila"),t>10.5);e(t,10.5,"a",function(){K.evento("Merodeo frente a la vitrina · 2 min 05 s","alerta")})}}});
  S.video("merodeo",O(IA,{src:EV+"merodeo.mp4",poster:EV+"merodeo-poster.jpg",url:"https://elevenlabs.io",evento:10.5,
    marcas:[{tipo:"zona",pts:[[0.13,0.2],[0.36,0.2],[0.42,1],[0.0,1]],color:"detecta",etiqueta:"Frente a la vitrina"}]}));

  /* =====================================================================================================
     INTRUSIÓN · MEVA G507: sala de espera; la zona prohibida es el piso frente a la salida de emergencia.
     Un hombre se sienta en la banca dentro de la zona: en zona desde el inicio, alarma a los 8,2 s del clip.
     ===================================================================================================== */
  S.redef({id:"intrusion",grupo:2,nombre:"Intrusión",corta:"Avisa cuando alguien entra o se queda en una zona prohibida.",estado:"funcionando a diario",
    desc:"La zona prohibida se dibuja sobre la cámara: aquí, el piso frente a la salida de emergencia. Si alguien entra y se queda, el sistema lo marca en amarillo y, pasado el tiempo permitido, dispara la alarma con su recuadro.",
    dur:18,camara:{pos:[-9,8,9],mira:[0,0.4,-1]},
    fases:[[0,"detecta","Una persona está dentro de la zona frente a la salida de emergencia"],[8.2,"alerta","Se queda en la zona: alarma de intrusión"]],
    armar:function(K){K.piso(11,10,K.std(0xA9A69E,{roughness:0.55}));var pared=K.std(0xE8E6E0,{roughness:0.9});
      K.muro(-5.5,-4.2,4.6,-4.2,3.6,pared);K.muro(4.6,-4.2,4.6,5,3.6,pared);K.muro(-5.5,-4.2,-5.5,5,3.6,pared);
      // fondo: puerta de vidrio a la izquierda, puerta café y ventanas
      K.caja(-3.2,0,-4.1,1.4,2.3,0.04,K.std(0xF4F6F8,{roughness:0.2,emissive:0xFFFFFF,emissiveIntensity:0.35}));K.caja(-3.2,0,-4.13,1.5,2.4,0.02,K.mat.aceroOsc);
      K.caja(1.5,0,-4.1,0.95,2.2,0.05,K.std(0x3A2E28,{roughness:0.6}));K.caja(3.1,1.1,-4.1,1.0,1.1,0.04,K.std(0xF4F6F8,{emissive:0xFFFFFF,emissiveIntensity:0.5}));
      K.caja(-0.6,1.75,-4.1,0.9,0.6,0.03,K.std(0xD9874A));K.caja(-1.5,1.75,-4.1,0.6,0.55,0.03,K.std(0x202226));
      // pared derecha: ventana y salida de emergencia doble con letrero EXIT
      K.caja(4.5,1.0,-2.9,0.04,1.2,1.1,K.std(0xF4F6F8,{emissive:0xFFFFFF,emissiveIntensity:0.5}));
      K.caja(4.5,0,-0.4,0.05,2.3,1.9,K.std(0xF4F6F8,{roughness:0.2,emissive:0xFFFFFF,emissiveIntensity:0.45}));K.caja(4.53,0,-0.4,0.02,2.4,2.0,K.mat.aceroOsc);K.caja(4.45,1.0,-0.4,0.05,0.05,1.8,K.mat.aceroOsc);
      K.cartel(4.48,2.55,-0.8,0.4,0.18,"EXIT","#F4F4F2","#C8342B",-90);K.caja(4.3,0,-1.9,0.4,1.6,0.4,K.std(0x5A3A2A,{roughness:0.7}));
      // bancas: naranjas contra el fondo, negras en filas diagonales, y la banca junto a la salida
      banca(K,0.2,-3.7,2.2,0,0xD9785E);banca(K,-4.9,-2.6,1.6,90,0xD9785E);
      banca(K,-3.3,-1.6,2.2,-30,0x26282C);banca(K,1.4,-2.2,2.0,-30,0x26282C);banca(K,-2.0,0.9,2.6,-30,0x26282C);banca(K,0.8,3.4,3.2,-30,0x26282C);
      banca(K,3.9,-0.3,2.2,-90,0xD9785E);
      K.camara([-1.8,4.0,1.9],[1.2,-0.6,-2.4],{id:"CAM SALA",fov:84});
      var Z=K.zona([[2.6,-1.6],[4.5,-1.6],[4.5,1.4],[2.6,1.4]],{estado:"detecta",op:0.22});
      var P=persona(K,{color:0x3A4250,escala:1,ropa:{camisa:0x3A4250,pantalon:0x5E7393,zapatos:0x2A2A2A,gorra:0x2B2F38},ruta:[[0,3.6,-0.3,"idle",2.6,-0.3]]});P.evita=false;P.sinAuto=true;
      P.post=function(t){sentar(K,P,1);K.ik(P,"Right",K.local(P,-0.05,1.0,0.35),0.85);K.ik(P,"Left",K.local(P,0.08,1.0,0.35),0.85);cabeza(K,P,0,0.45)};
      var R=K.recuadro(P,{texto:"ID 1 · en zona",h:1.4}),e=reloj();
      return function(t){var al=t>=8.2;R.set(al?"alerta":"detecta",al?"ID 1 · ALARMA":"ID 1 · en zona");Z.set(al?"alerta":"detecta",al);
        K.contador("En zona de la salida","1");K.contador("Alarmas",al?"1":"0");e(t,8.2,"a",function(){K.evento("Intrusión · frente a la salida de emergencia","alerta")})}}});
  S.video("intrusion",O(MEVA,{src:EV+"intrusion.mp4",poster:EV+"intrusion-poster.jpg",chapa:"CCTV real (MEVA G507) · modelo real",autor:"Kitware / IARPA DIVA · MEVA KF1, cámara G507",evento:8.2,
    marcas:[{tipo:"zona",pts:[[0.711,0.393],[0.924,0.393],[0.986,0.674],[0.702,0.674]],color:"detecta",etiqueta:"Frente a la salida de emergencia",hasta:8.2},
            {tipo:"zona",pts:[[0.711,0.393],[0.924,0.393],[0.986,0.674],[0.702,0.674]],color:"alerta",etiqueta:"Frente a la salida de emergencia",desde:8.2}]}));

  /* =====================================================================================================
     ACCESO NO AUTORIZADO · clip IA: puerta gris «SOLO PERSONAL» en la pared azul; el pasillo de góndolas a la izquierda.
     Pasa un empleado de azul (0–3 s, sin aviso); a los 9,5 s abre y cruza un cliente de camisa celeste.
     ===================================================================================================== */
  S.redef({id:"acceso",grupo:2,nombre:"Acceso no autorizado",corta:"Avisa cuando alguien que no es del equipo cruza a una zona interna.",
    desc:"Combina la puerta de una zona interna con el reconocimiento de personal: el equipo pasa sin aviso, y si cruza alguien que no lo es, avisa al instante.",
    dur:11.4,camara:{pos:[7,6,7],mira:[0,0.8,-1]},
    fases:[[0,"vigila","La puerta de bodega solo es para el personal"],[1.2,"ok","Pasa alguien del equipo: sin aviso"],[9.5,"alerta","Cruza un cliente: aviso de acceso no autorizado"]],
    armar:function(K){K.piso(16,16,K.std(0xC9C5BB,{roughness:0.45}));var azul=K.std(0x3E6FA8,{roughness:0.85});
      // bloque azul de la bodega con la puerta gris; a su izquierda sigue la tienda con sus góndolas; a la derecha el muro que tapa la esquina
      K.muro(-0.5,0,0.45,0,3.4,azul,0.24);K.muro(1.65,0,3.1,0,3.4,azul,0.24);K.caja(1.05,2.3,0,1.2,1.1,0.24,azul);K.muro(-0.5,0,-0.5,-6,3.4,azul,0.24);K.muro(3.1,0,3.1,4.5,3.4,K.std(0x35629A,{roughness:0.85}),0.24);
      var pu=K.puerta(1.05,0.14,1.05,0,{opaca:true,alto:2.15});K.cartel(1.0,2.75,0.14,0.85,0.16,"SOLO PERSONAL","#C8342B","#fff");
      K.caja(-3,3.4,-2,12,0.05,16,K.std(0xE9EBEE,{roughness:0.9}));for(var z=4;z>-9;z-=2.2)K.caja(-3.6,3.33,z,0.18,0.06,1.6,K.std(0xFFFFFF,{emissive:0xFFFFFF,emissiveIntensity:1}));
      [[-1.6,["cajas","bolsas","cajas","latas","cajas"]],[-3.6,["botellas","cajas","botellas","latas","cajas"]],[-5.6,["cajas","botellas","bolsas","cajas","latas"]]].forEach(function(g){K.gondola(g[0],-3.2,8,90,{niveles:6,alto:2,familias:g[1]})});
      K.camara([2.2,2.7,3.3],[0.5,1.2,0],{id:"CAM BODEGA",fov:72});var L=K.lineaCruce([0.5,0.4],[1.6,0.4],{estado:"oro"});
      var a=persona(K,{color:0x22304D,ropa:{camisa:0x22304D,pantalon:0x1E2433,zapatos:0x1C1E22},ruta:[[0,1.9,1.3],[1.2,1.15,0.8],[2.6,1.1,-1.4],[11.4,1.1,-4]]}),
          b=persona(K,{color:0x9DB7D0,ropa:{camisa:0x9DB7D0,pantalon:0x3D4F6E,zapatos:0x3A2F2A},ruta:[[0,-2.6,3],[5.4,-2.6,3],[7.4,-0.2,2.0],[8.6,0.8,1.0,"idle",1.05,0],[9.4,1.0,0.8],[10.8,1.1,-1.4],[11.4,1.1,-2.2]]});
      b.post=function(t){if(t>6&&t<8.6)cabeza(K,b,nervioso(t)*0.6,0);if(t>8.4&&t<9.6)K.ik(b,"Right",K.local(b,-0.25,1.0,0.45),ventana(t,8.4,9.6,0.3,0.3))};
      var Ra=K.recuadro(a,{texto:"personal"}),Rb=K.recuadro(b,{texto:"cliente"});var e=reloj();
      return function(t){pu.userData.abrir(suave(t>0.7&&t<2.8?1:(t>8.9&&t<11.2?1:0)));Ra.set("staff","personal");Ra.visible=t<2.5;Rb.visible=t>5.6&&t<10.9;b.visible=t>5.4;Rb.set(t>9.5?"alerta":"cliente",t>9.5?"no autorizado":"cliente");
        L.set(t>9.5?"alerta":"oro");e(t,1.3,"a",function(){K.evento("Paso de personal · bodega","")});e(t,9.5,"b",function(){K.evento("Acceso no autorizado · bodega","alerta")})}}});
  S.video("acceso",O(IA,{src:EV+"acceso.mp4",poster:EV+"acceso-poster.jpg",url:"https://elevenlabs.io",evento:9.5,
    marcas:[{tipo:"linea",pts:[[0.52,0.98],[0.75,0.98]],color:"oro",etiqueta:"Puerta · solo personal",hasta:9.5},{tipo:"linea",pts:[[0.52,0.98],[0.75,0.98]],color:"alerta",etiqueta:"Puerta · solo personal",desde:9.5}]}));

  /* =====================================================================================================
     AGLOMERACIÓN · MEVA G421: vestíbulo con puertas de vidrio al fondo, sofás a la izquierda y mesas redondas.
     La gente entra por las puertas y se junta al fondo a la izquierda; pasa de 15 personas a los 8,8 s del clip.
     ===================================================================================================== */
  S.redef({id:"aglomeracion",grupo:2,nombre:"Aglomeración y tumulto",corta:"Avisa cuando se junta demasiada gente en un punto.",
    desc:"Mide la densidad de personas por zona y qué tan rápido crece. Una concentración repentina o un tumulto disparan el aviso antes de que se salga de control.",
    dur:18,camara:{pos:[-8,9,10],mira:[0,0,-1]},
    fases:[[0,"vigila","Densidad normal en el vestíbulo"],[4.5,"detecta","Entra gente y se junta al fondo"],[8.8,"alerta","Pasa de 15 personas: aviso de aglomeración"]],
    armar:function(K){K.piso(12,10,K.std(0xD8D2C4,{roughness:0.3}));var pared=K.std(0xE2DDD2,{roughness:0.9}),marco=K.std(0x2B2F33,{metalness:0.4,roughness:0.4});
      K.muro(-6,-4.6,6,-4.6,4,pared);K.muro(6,-4.6,6,5,4,pared);K.muro(-6,-4.6,-6,5,4,pared);
      // fachada de vidrio con puertas al fondo a la derecha y el pasillo del fondo a la izquierda
      for(var x=0.2;x<5.6;x+=0.9){K.caja(x,0,-4.5,0.82,2.6,0.03,K.std(0xEAF0F4,{emissive:0xFFFFFF,emissiveIntensity:0.45,roughness:0.1}));K.caja(x-0.43,0,-4.48,0.06,2.7,0.08,marco)}
      K.caja(2.8,2.6,-4.48,5.4,0.1,0.08,marco);K.caja(-1.2,0,-4.5,0.5,3.4,0.5,pared);K.cartel(0.9,2.9,-4.45,0.5,0.2,"EXIT","#C8342B","#fff");
      K.parche(2.2,-3.4,2.2,1.4,K.std(0x3A3F46,{roughness:1}),1,0.006);
      sofa(K,-3.4,-2.6,2.4,0,0x5C6670);sofa(K,-4.6,-0.6,1.0,90,0x5C6670);K.caja(-3.2,0,-1.4,1.2,0.42,0.6,K.std(0x6B4A30,{roughness:0.6}));
      [[-1.2,0.2],[0.6,-0.6],[1.0,1.0],[-0.6,2.0]].forEach(function(p,i){K.mesa(p[0],p[1],{r:0.45,mat:K.std(0xC8A878,{roughness:0.5})});[0,1,2].forEach(function(j){var a=j*2.1+i;silla(K,p[0]+Math.cos(a)*0.62,p[1]+Math.sin(a)*0.62,-a*57.3+90)})});
      K.caja(-4.6,0,3.6,1.4,1.0,2.6,K.std(0xEDEBE6,{roughness:0.5}));K.cil(4.9,0,-1.6,0.25,0.25,0.95,K.std(0xB0B4B8,{metalness:0.6,roughness:0.3}));
      K.caja(-4,1.0,-4.45,1.2,0.6,0.03,K.std(0xE86AA6));K.caja(-2.8,1.0,-4.45,0.8,0.6,0.03,K.std(0x8CC152));
      K.camara([-2.4,3.8,3.9],[2.6,-0.6,-1.8],{id:"CAM VESTÍBULO",fov:80});
      var Z=K.zona([[-5.6,-4.2],[5.6,-4.2],[5.6,4.6],[-5.6,4.6]],{estado:"vigila",op:0.12});
      // quienes ya están al fondo a la izquierda y quienes entran por las puertas
      var P=[],i,dest=[[-4.2,-3.7],[-3.6,-3.9],[-2.8,-3.7],[-2.1,-3.9],[-1.6,-3.3],[-4.4,-3.2],[-2.4,-3.1],[-0.6,-3.6],[-3.1,-3.2],[-1.0,-2.9],[0.0,-3.0],[-4.0,-1.9],[-2.8,-2.0],[-1.8,-2.4],[0.6,-2.6],[-0.4,-2.2],[1.2,-3.2],[-3.6,-1.6],[0.4,-1.6],[-1.3,-1.7]];
      for(i=0;i<20;i++){var d=dest[i],r;if(i<4)r=[[0,d[0],d[1],"idle",0,0]];else{var t0=(i-4)*0.62,px=1+((i*7)%5)*0.9;r=[[0,px,-7],[t0,px,-6.2],[t0+1.2,px,-4.2],[t0+4.4,d[0],d[1]],[18,d[0]+((i%3)-1)*0.2,d[1],"idle",0,0]]}
        var p=persona(K,{color:ROPA[i%9],ruta:r});P.push(p)}
      var lb=K.etiqueta("","rojo",function(){return new THREE.Vector3(-2.4,2.6,-3)});
      return function(t){var n=P.filter(function(p){return p.raiz.position.z>-4.4&&p.raiz.position.z<4.6&&Math.abs(p.raiz.position.x)<5.8}).length;
        K.contador("Personas en el vestíbulo",String(n));K.contador("Umbral de aviso","15");Z.set(n>=15?"alerta":(n>7?"detecta":"vigila"),n>=15);lb.set(n>=15?"Aglomeración · "+n+" personas":"");lb.el.style.opacity=n>=15?1:0;
        if(n>=15&&!Z.av){Z.av=1;K.evento("Aglomeración en el vestíbulo · 15 personas","alerta")}}}});
  S.video("aglomeracion",O(MEVA,{src:EV+"aglomeracion.mp4",poster:EV+"aglomeracion-poster.jpg",chapa:"CCTV real (MEVA G421) · modelo real",autor:"Kitware / IARPA DIVA · MEVA KF1, cámara G421",evento:8.8,
    marcas:[{tipo:"zona",pts:[[0.03,0.235],[0.947,0.23],[0.99,0.98],[0.015,0.98]],color:"vigila",etiqueta:"Vestíbulo · umbral 15",hasta:8.8},{tipo:"zona",pts:[[0.03,0.235],[0.947,0.23],[0.99,0.98],[0.015,0.98]],color:"alerta",etiqueta:"Vestíbulo · umbral 15",desde:8.8}]}));

  /* =====================================================================================================
     EPP · video público de obra: fila de trabajadores fundiendo una losa entre columnas de varilla.
     El modelo marca a 1,6 s a los que trabajan sin casco; la alerta dura hasta los 6,3 s.
     ===================================================================================================== */
  S.redef({id:"epp",grupo:2,nombre:"Equipo de protección (EPP)",corta:"Avisa si alguien trabaja sin casco o chaleco.",estado:"con evidencia",
    desc:"Revisa casco, chaleco y overol según la regla de cada zona, y emite un aviso por persona y no uno por imagen. Si no ve bien, no opina.",
    dur:13,camara:{pos:[6,5,9],mira:[0,0.8,-4]},
    fases:[[0,"vigila","En la losa se exige casco y chaleco"],[1.6,"alerta","Trabajadores sin casco: aviso por cada persona"],[6.3,"ok","Los demás con casco: sin aviso"]],
    armar:function(K){K.piso(30,24,K.mat.concreto,3);K.parche(0,-2,16,7,K.std(0xBFC2C0,{roughness:0.35}),1,0.01);K.parche(0,-5.6,16,0.9,K.std(0x6E6A62,{roughness:1}),1,0.012);
      K.caja(0,-1,-10.5,40,9,0.4,K.std(0x46593A,{roughness:1}));K.caja(0,-1,-11.5,40,13,0.4,K.std(0x7F8C7A,{roughness:1}));
      var vari=K.std(0x5A3A2A,{roughness:0.8,metalness:0.4});
      function columna(x,z,h){for(var i=0;i<4;i++)for(var j=0;j<4;j++)K.cil(x+i*0.13,0,z+j*0.13,0.012,0.012,h,vari);for(var y=0.3;y<h;y+=0.25)K.caja(x+0.2,y,z+0.2,0.46,0.015,0.46,vari)}
      columna(-3.3,-3.6,3.4);columna(0.5,-6.6,3.6);columna(3.2,-4.6,3.6);columna(-3.6,-1.4,2.6);
      K.caja(-3,0.05,-4.9,6,0.08,0.12,K.std(0xC9B98E));K.caja(3,0.05,-4.6,6,0.08,0.12,K.std(0xC9B98E));
      K.camara([0,2.4,1.4],[0,1.15,-5.3],{id:"CAM LOSA",fov:38});
      var Z=K.zona([[-3.4,-6.2],[3.4,-6.2],[3.4,-3.6],[-3.4,-3.6]],{estado:"vigila",op:0.1});
      var TR=[{x:-2.6,z:-4.8,c:0xE8E0D0,cas:null,ag:true},{x:-1.7,z:-5.2,c:0xE0C030,cas:0xF2C230,chal:true},{x:-1.15,z:-5.6,c:0x3A4A6A,cas:0xF4F4F2},{x:-0.55,z:-5.0,c:0x3A3F48,cas:null},
        {x:0.0,z:-5.3,c:0x6B6A5A,cas:0x2F7BEA},{x:0.45,z:-5.6,c:0xA03838,cas:0xF2C230},{x:0.95,z:-5.2,c:0x2E8A9E,cas:0x2F7BEA},{x:1.5,z:-5.5,c:0x3A3F48,cas:null},{x:1.95,z:-5.3,c:0xE9EBEE,cas:0x2F7BEA},{x:2.6,z:-5.7,c:0x3A8A4A,cas:0x2F7BEA}];
      var R=[];TR.forEach(function(w,i){var p=persona(K,{color:w.c,ropa:{camisa:w.c,pantalon:0x2E3A52,zapatos:w.chal?0xF2D23A:0x1C1E22,chaleco:w.chal?0xF2D23A:undefined},ruta:[[0,w.x,w.z,"idle",w.x+((i%3)-1)*0.6,2]]});if(w.cas)casco(K,p,w.cas);p.evita=false;
        p.post=function(t){if(w.ag)K.gesto(p,"agacharse",t,0.9);else{K.ik(p,i%2?"Right":"Left",K.local(p,i%2?-0.15:0.15,0.9+0.15*Math.sin(t*1.7+i),0.45),0.6)}};
        R.push({r:K.recuadro(p,{texto:"persona"}),w:w})});
      var e=reloj();
      return function(t){var al=t>=1.6&&t<6.3;R.forEach(function(q){var sin=!q.w.cas;q.r.set(t<1.6?"vigila":(sin&&al?"alerta":(sin?"detecta":"ok")),t<1.6?"persona":(sin?"sin casco":"casco ✓"))});
        Z.set(al?"alerta":"vigila",al);e(t,1.6,"a",function(){K.evento("Sin casco · losa · 3 personas","alerta")});K.contador("Personas en la losa",String(TR.length));K.contador("Sin casco","3")}}});
  S.video("epp",{src:EV+"epp.mp4",poster:EV+"epp-poster.jpg",chapa:"video público · modelo real",fuente:"video público de obra (recorte de evidencia-publica/epp.mp4)",autor:"sin registrar en el repo (ver CREDITS-prevencion.md)",licencia:"por confirmar",evento:1.6,
    marcas:[{tipo:"zona",pts:[[0.07,0.62],[0.97,0.62],[0.99,0.86],[0.05,0.86]],color:"vigila",etiqueta:"Losa · casco y chaleco",hasta:1.6},{tipo:"zona",pts:[[0.07,0.62],[0.97,0.62],[0.99,0.86],[0.05,0.86]],color:"alerta",etiqueta:"Losa · casco y chaleco",desde:1.6,hasta:6.3},{tipo:"zona",pts:[[0.07,0.62],[0.97,0.62],[0.99,0.86],[0.05,0.86]],color:"vigila",etiqueta:"Losa · casco y chaleco",desde:6.3}]});

  /* =====================================================================================================
     CAÍDAS · clip IA: pasillo de góndolas altas visto desde una esquina del techo.
     La mujer de blusa roja cae a 1,2 s, sigue en el piso a los 5 s (alerta) y un empleado llega a ayudarla a los 8 s.
     ===================================================================================================== */
  S.redef({id:"caidas",grupo:2,nombre:"Detección de caídas",corta:"Avisa cuando una persona cae y no se levanta.",
    desc:"Sigue la postura de cada persona. Si cae y se queda en el piso más de unos segundos, avisa con la ubicación para que alguien acuda.",
    dur:9.7,camara:{pos:[7,6,6],mira:[0,0.4,-2]},
    fases:[[0,"vigila","Sigue la postura de quien camina"],[1.2,"detecta","Pasa de vertical a horizontal: posible caída"],[5,"alerta","No se levanta: aviso para que alguien acuda"],[8,"ok","Llega un empleado a ayudar"]],
    armar:function(K){K.piso(12,20,K.pbr?K.std(0xF1F1EE,{roughness:0.25}):null);
      K.gondola(-1.95,-1,17,90,{niveles:6,alto:2.3,familias:["botellas","cajas","latas","botellas","cajas"]});K.gondola(1.95,-1,17,90,{niveles:6,alto:2.3,familias:["latas","botellas","cajas","latas","bolsas"]});
      K.gondola(0,-12.4,5,0,{niveles:5,alto:1.9,unaCara:true});K.gondola(-3.6,-12.4,2,0,{niveles:5,alto:1.9,unaCara:true});K.gondola(3.6,-12.4,2,0,{niveles:5,alto:1.9,unaCara:true});
      K.lampara(0,3,-2);K.lampara(0,3,-7);
      K.camara([0.2,2.75,2.6],[0,0,-2.4],{id:"CAM PASILLO 3",fov:74});
      var P=persona(K,{color:0xC23A4A,escala:0.95,ropa:{camisa:0xC23A4A,pantalon:0x2E4A7A,zapatos:0xE9EBEE},ruta:[[0,0.2,1.2],[0.9,-0.3,-1.5],[1.0,-0.3,-1.55,"idle",-1,-1.5]]});
      var ay=persona(K,{color:0x22304D,ropa:{camisa:0x22304D,pantalon:0x1E2433,zapatos:0x1C1E22},ruta:[[0,-0.6,-10.5],[3.4,-0.6,-10],[7.6,0.4,-1.5],[9.7,0.4,-1.5,"idle",-0.4,-1.1]]});
      var R=K.recuadro(P,{texto:"de pie"}),lb=K.etiqueta("Persona en el piso","rojo",K.sobre(P,0.9));var e=reloj();
      ay.post=function(t,dt,ev){var ag=ventana(t,7.8,9.7,0.6,0.1);if(ag>0){K.gesto(ay,"agacharse",t,ag);K.ik(ay,"Right",K.local(ay,-0.2,0.5,0.5),ag)}if(ev.a==="walk"&&t>4)K.gesto(ay,"prisa",t,1)};
      var Ra=K.recuadro(ay,{texto:"personal"});
      return function(t){P.caida=suave((t-1.0)/0.5);if(t>1.1){R.h=0.5;R.w=0.75;R.d=1.3}else{R.h=P.alto;R.w=0.75;R.d=0.6}R.l.scale.set(1,t>1.1?0.3:1,t>1.1?2.2:1);
        R.set(t>5?"alerta":(t>1.2?"detecta":"vigila"),t>5?"caída · 4 s":(t>1.2?"horizontal":"de pie"));Ra.set("staff","personal");Ra.visible=t>3.4;
        lb.el.style.opacity=t>5?1:0;e(t,5,"a",function(){K.evento("Caída en pasillo 3","alerta")})}}});
  S.video("caidas",O(IA,{src:EV+"caidas.mp4",poster:EV+"caidas-poster.jpg",url:"https://elevenlabs.io",evento:5}));

  /* =====================================================================================================
     HURTO · prueba en el laboratorio propio: oficina con tablero blanco, isla de escritorios y el mesón marcado abajo a la izquierda.
     La persona llega al mesón (4,4 s), toma algo y lo esconde; la alerta de manipulación sospechosa salta a los 9,1 s.
     ===================================================================================================== */
  S.redef({id:"hurto",grupo:2,nombre:"Hurto",corta:"Distingue un hurto de una compra normal, y avisa.",estado:"en desarrollo",
    desc:"Lee la postura y los gestos de las manos de cada persona frente a una zona marcada (aquí, un mesón) y les pone una puntuación. Tomar algo y llevarlo a la ropa en vez de dejarlo la hace subir; cuando cruza el umbral, avisa en el momento.",
    dur:16,camara:{pos:[-7,7,7],mira:[0,0.6,-1]},
    fases:[[0,"vigila","Detector activo: esperando interacción con el mesón"],[4.4,"detecta","Interacción con el mesón: analizando el gesto"],[9.1,"alerta","Manipulación sospechosa: lo esconde y se va"]],
    armar:function(K){K.piso(12,10,K.std(0xC9C2B4,{roughness:0.45}));var pared=K.std(0xE9E9E6,{roughness:0.9}),oscuro=K.std(0x2A2D32,{roughness:0.8});
      K.muro(-6,-4.4,6,-4.4,3,oscuro);K.muro(-4.2,-4.4,-4.2,5,3,K.std(0x8A8D90,{roughness:0.9}));K.muro(6,-4.4,6,5,3,pared);
      K.caja(-1.2,0.5,-4.25,5.2,2.2,0.06,K.std(0xF4F4F2,{roughness:0.3}));K.caja(-1.2,0.45,-4.2,5.3,0.06,0.12,K.mat.aceroOsc);
      // isla de escritorios con monitores y sillas
      var mad=K.std(0xC8925A,{roughness:0.55});K.caja(0.6,0.74,-0.4,1.4,0.05,4.4,mad,0.6);K.caja(0.6,0,-0.4,1.2,0.74,0.1,K.mat.aceroOsc,0.6);
      [[0.3,-1.6],[0.6,-0.6],[0.9,0.4]].forEach(function(p){K.caja(p[0],0.79,p[1],0.06,0.42,0.6,K.std(0x15171B),0.35)});
      [[-0.4,-1.2],[-0.1,0.2],[1.6,-1.8],[1.9,-0.4]].forEach(function(p){K.cil(p[0],0,p[1],0.25,0.25,0.95,K.std(0x1E2024))});
      K.caja(3.6,0.74,-3.0,2.6,0.05,1.0,K.std(0x8A8F96));K.caja(3.4,0.79,-3.2,0.6,0.4,0.05,K.std(0x3A7BD5,{emissive:0x2F64C8,emissiveIntensity:0.6}));K.caja(4.2,0.79,-3.2,0.6,0.4,0.05,K.std(0x3A7BD5,{emissive:0x2F64C8,emissiveIntensity:0.6}));
      // el mesón vigilado, con la cinta amarilla y negra en el piso
      var me=K.caja(-3.65,0,0.7,0.6,0.9,1.0,K.std(0x8A5A34,{roughness:0.6}));K.parche(-2.4,2.0,0.12,3.0,K.std(0xF2C230),1,0.008);
      K.cil(-3.7,0.9,0.4,0.05,0.05,0.25,K.std(0xD6E4EA,{transparent:true,opacity:0.7}));var obj=K.caja(-3.5,0.9,1.0,0.12,0.08,0.18,K.std(0xD94F3D));
      K.camara([-1.3,3.1,3.4],[-0.3,0,-1.8],{id:"CAM LAB",fov:86});
      var Z=K.zona([[-4.0,0.0],[-3.2,0.0],[-3.2,1.4],[-4.0,1.4]],{estado:"oro",op:0.3,y:0.91});
      var P=persona(K,{color:0x4A6A9A,ropa:{chaqueta:0x4A6A9A,cierre:false,camisa:0x1E2433,pantalon:0x7C93B5,zapatos:0x3A2F2A},ruta:[[0,-1.6,-3.8],[4.2,-2.6,0.6],[4.6,-2.75,0.7,"idle",-3.6,0.7],[7.8,-2.75,0.7,"idle",-3.6,0.9],[9.4,1.0,2.2],[12.2,2.6,-1.0],[16,2.4,-3.2]]});
      P.post=function(t){var k=ventana(t,4.8,7.6,0.4,0.4);if(k>0)K.ik(P,"Right",obj.getWorldPosition(new THREE.Vector3()),k);var g=ventana(t,7.4,8.6,0.3,0.3);if(g>0)K.ik(P,"Right",K.local(P,-0.08,1.15,0.15),g)};
      var R=K.recuadro(P,{texto:"frente"}),e=reloj();
      return function(t){if(t>7.4&&!obj.userData.tom){obj.userData.tom=1;K.agarrar(obj,P,"Right")}if(t>8.4&&obj.userData.tom&&obj.visible)obj.visible=false;
        var est=t>=9.1?"alerta":(t>=4.4?"detecta":"vigila");R.set(est==="alerta"?"alerta":(est==="detecta"?"ok":"vigila"),t>=9.1?"esconde · 0,97":(t>=4.4?"cerca OK":"frente"));Z.set(t>=9.1?"alerta":"oro",t>=9.1);
        e(t,4.4,"a",function(){K.evento("Interacción con el mesón","detecta")});e(t,9.1,"b",function(){K.evento("Manipulación sospechosa · esconde (0,97)","alerta")})}}});
  S.video("hurto",{src:EV+"hurto.mp4",poster:EV+"hurto-poster.jpg",chapa:"prueba en laboratorio propio · detector en desarrollo",fuente:"grabación propia del laboratorio Vigías (visor en vivo)",autor:"Vigías",licencia:"propia",evento:9.1,
    marcas:[{tipo:"zona",pts:[[0.14,0.79],[0.225,0.725],[0.32,0.99],[0.2,0.99]],color:"oro",etiqueta:"Mesón vigilado",hasta:9.1},{tipo:"zona",pts:[[0.14,0.79],[0.225,0.725],[0.32,0.99],[0.2,0.99]],color:"alerta",etiqueta:"Mesón vigilado",desde:9.1}]});
})();
