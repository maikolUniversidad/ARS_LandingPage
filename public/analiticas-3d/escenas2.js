(function(){
  "use strict";
  var U=window.ESC_UTIL,C=window.MOTOR.COL,def=U.def,reloj=U.reloj,lerp=U.lerp,suave=U.suave,ROPA=U.ROPA,STAFF=U.STAFF,persona=U.persona,gente=U.gente,tienda=U.tienda,bodega=U.bodega,exterior=U.exterior,oficina=U.oficina,
    arma=U.arma,cuchillo=U.cuchillo,producto=U.producto,cabeza=U.cabeza,torso=U.torso,nervioso=U.nervioso,ventana=U.ventana,entradaTienda=U.entradaTienda,trastiendaFranq=U.trastiendaFranq;
  var OXD=window.MARCA==="franq"; // la marca se fija en el html antes de cargar las escenas: sirve para los textos de la lámina
  function recuadroRostro(K,P,o){var cab={raiz:new THREE.Object3D(),visible:true,alto:0.3,rot:0};var R=K.recuadro(cab,Object.assign({texto:"rostro",w:0.3,h:0.3,d:0.3},o||{}));
    R.seguir=function(){var p=P.raiz.position;cab.raiz.position.set(p.x,p.y+P.alto-0.32,p.z);cab.rot=P.rot;cab.visible=P.visible};R.seguir();return R}

  /* =====================================================================================================
     3 · PREVENCIÓN Y RIESGO
     ===================================================================================================== */
  def({id:"negras",grupo:2,nombre:"Listas negras",corta:"Avisa en el acto si entra alguien de una lista.",estado:"funcionando a diario",
    desc:"Compara cada rostro del acceso con una lista corta y avisa al puesto de monitoreo con la foto y el video ya guardados. Solo en accesos.",
    video:{src:"evidencia/facial-2.mp4",poster:"evidencia/facial-poster-2.jpg",chapa:"acceso real"},
    dur:14,camara:{pos:[7,7,10],mira:[0,0.8,1]},
    fases:[[0,"vigila","Cada rostro del acceso se compara con la lista"],[4,"alerta","Coincidencia con la lista negra: aviso inmediato"],[8,"detecta","Se sigue a la persona dentro del local"]],
    armar:function(K){entradaTienda(K);
      var P=gente(K,[{c:0x4A4F5C,ruta:[[0,4.6,8.4],[4.2,4.4,2],[8,1,0.6],[14,-4,0.4]],ropa:{chaqueta:0x4A4F5C,pantalon:0x26324A,zapatos:0x1C1E22}},{ruta:[[0,5.4,9],[5.6,5.4,1.6],[14,6,-3]]}]);var R=recuadroRostro(K,P[0]),Rc=K.recuadro(P[0],{texto:"",pip:false});Rc.visible=false;
      var lb=K.etiqueta("Lista negra · 0,93","rojo",K.sobre(P[0]));var e=reloj();
      return function(t){R.seguir();R.set(t>4?"alerta":"vigila",t>4?"coincidencia 0,93":"rostro");lb.el.style.opacity=t>4?1:0;Rc.visible=t>8;Rc.set("alerta");e(t,4,"a",function(){K.evento("Lista negra · entrada principal","alerta")});K.contador("Rostros comparados hoy","1.284")}}});

  def({id:"merodeo",grupo:2,nombre:"Merodeo",sinVideo:true,corta:"Avisa de quien da vueltas sin entrar ni irse.",
    desc:"Mide cuánto tiempo pasa una persona en una zona y cómo se mueve. Quien va y viene frente a una vitrina, un cajero o una puerta más de lo normal dispara el aviso.",
    dur:18,camara:{pos:[9,9,11],mira:[0,0.4,0]},
    fases:[[0,"vigila","Se vigila la zona frente a la vitrina"],[5,"detecta","Va y viene sin entrar: el reloj de permanencia corre"],[11,"alerta","Pasa el umbral de merodeo: aviso con su recorrido"]],
    armar:function(K){exterior(K,{bolardos:false});K.muro(-8,-5.5,8,-5.5,3.2,K.mat.muroAzul);K.muro(-3,-5.3,3,-5.3,2.4,K.mat.vidrio,0.06);K.cartel(0,2.8,-5.35,3,0.4,"JOYERÍA","#001441","#D6AB4C");
      for(var i=0;i<5;i++){var p=K.grupo(-2.2+i*1.1,-4.9,0);K.caja(0,0,0,0.6,0.9,0.4,K.std(0x1E2433),p);K.caja(0,0.9,0,0.62,0.04,0.42,K.mat.vidrio,p);K.cil(0,0.94,0,0.09,0.09,0.04,K.std(0xD6AB4C,{metalness:1,roughness:0.2}),p);var l=new THREE.PointLight(0xFFE7C2,0.3,2.5,2);l.position.set(0,1.6,0);p.add(l)}
      K.puerta(5.2,-5.4,1.6,0,{opaca:false});K.camara([6.6,3.2,-4.6],[0,0,-1],{id:"CAM FACHADA",fov:78});var Z=K.zona([[-4,-4.8],[4,-4.8],[4,-1.2],[-4,-1.2]],{estado:"vigila"});
      var P=persona(K,{color:0x4A4F5C,ropa:{chaqueta:0x4A4F5C,pantalon:0x1E2433,zapatos:0x1C1E22,gorra:0x2B3038},ruta:[[0,-7,0],[2.5,-2.4,-3],[4.5,2.4,-3.2],[6.5,-2,-3.4],[8.5,2.6,-2.8],[10.5,-1.6,-3.6],[12.5,1.8,-3],[18,1.8,-3,"idle",0,-6]]});
      P.sinMirada=true;P.post=function(t){cabeza(K,P,t>2.5?nervioso(t*0.8)*0.7:0,t>2.5?-0.15:0)};
      var tr=[],R=K.recuadro(P,{texto:"persona"}),et=K.etiqueta("","reloj",K.sobre(P));var e=reloj(),k=0,ln=null;persona(K,{ruta:[[0,7,2],[9,-8,2.4]]});
      return function(t){var s=Math.max(0,t-2.5)*14;et.set(t>2.5?Math.floor(s/60)+" min "+String(Math.floor(s%60)).padStart(2,"0")+" s":"",t>11?"reloj rojo":"reloj");et.el.hidden=t<2.5;
        if((k++)%6===0&&t>2.5){tr.push([P.raiz.position.x,0.04,P.raiz.position.z]);if(ln){ln.geometry.dispose();ln.parent.remove(ln)}if(tr.length>1)ln=K.linea3(tr,t>11?C.alerta:C.detecta)}
        R.set(t>11?"alerta":(t>5?"detecta":"vigila"));Z.set(t>11?"alerta":(t>5?"detecta":"vigila"),t>11);e(t,11,"a",function(){K.evento("Merodeo frente a la vitrina · 2 min 05 s","alerta")})}}});

  def({id:"intrusion",grupo:2,nombre:"Intrusión",corta:"La alarma suena distinto según cuánto se acercan.",estado:"funcionando a diario",
    desc:"La zona prohibida se dibuja sobre la cámara en tres franjas. El sistema mide qué tan adentro está la persona y el sonido cambia con ella: el operador entiende la gravedad sin mirar.",
    video:{src:"evidencia/intrusion.mp4",poster:"evidencia/intrusion-poster.jpg",chapa:"cámara perimetral real"},
    dur:15,camara:{pos:[10,9,10],mira:[0,0.3,0]},
    fases:[[0,"vigila","El perímetro tiene tres franjas dibujadas"],[3.5,"detecta","Toca el borde: nivel 1, dos pitidos"],[6,"alerta","Avanza: nivel 2, sirena breve"],[8.5,"alerta","Está adentro: nivel 3, sirena continua"]],
    armar:function(K){exterior(K,{bolardos:false,arboles:false});K.parche(0,-2.5,16,6,K.mat.pasto,2,0.007);K.cerca([[-8,0.6],[8,0.6]],2.1);K.caja(-4,0,-4,3,2.6,2.2,K.mat.muroAzul);K.caja(3,0,-4.2,2.2,2.2,2,K.mat.muroAzul);
      K.afiche(-4,1.5,-2.88,1.2,0.8,"BODEGA 4",215,0);K.caja(3,0,-3.18,0.9,1.9,0.04,K.std(0x5A6270));K.arbol(-7.2,-4.6,1);K.arbol(6.9,-1.8,0.8);
      K.camara([7.2,3.6,3.4],[0,0,-1.6],{id:"CAM PERÍMETRO"});var Z=[K.zona([[-6,0.2],[6,0.2],[6,-1],[-6,-1]],{estado:"detecta",op:0.18}),K.zona([[-6,-1],[6,-1],[6,-2.4],[-6,-2.4]],{estado:"detecta",op:0.24}),K.zona([[-6,-2.4],[6,-2.4],[6,-5.2],[-6,-5.2]],{estado:"alerta",op:0.22})];
      var P=persona(K,{color:0x3A3F4A,ropa:{chaqueta:0x3A3F4A,pantalon:0x1E2433,zapatos:0x1C1E22,gorra:0x1E2433},ruta:[[0,-1,5],[3,0.4,1.4],[3.6,0.4,1.4,"idle",0,0],[4.6,0.4,-0.4],[6.6,0.6,-1.8],[8.6,0.2,-3.4],[15,0.2,-3.4,"idle",-3,-4]]});P.evita=false;
      P.post=function(t){var tr=ventana(t,3.8,4.8,0.3,0.3);if(tr>0){K.ik(P,"Left",new THREE.Vector3(0.1,2.0,0.6),tr);K.ik(P,"Right",new THREE.Vector3(0.7,2.0,0.6),tr)}if(t>5)cabeza(K,P,nervioso(t)*0.5,0)};
      var R=K.recuadro(P,{texto:"persona"}),lb=K.etiqueta("","rojo",K.sobre(P));var e=reloj();
      return function(t){var n=P.raiz.position.z<-2.4?3:(P.raiz.position.z<-1?2:(P.raiz.position.z<0.2?1:0));P.raiz.position.y=t>3.9&&t<4.9?Math.sin((t-3.9)/1*Math.PI)*0.9:0;
        R.set(n>=2?"alerta":(n?"detecta":"vigila"),n?"nivel "+n:"persona");lb.set(n?"Nivel "+n:"");lb.el.style.opacity=n?1:0;Z.forEach(function(z,i){z.set(i<2?(n>i?(n>1?"alerta":"detecta"):"vigila"):(n>2?"alerta":"vigila"),n===i+1)});
        e(t,3.6,"a",function(){K.evento("Nivel 1 · tocó el borde","detecta")});e(t,6.2,"b",function(){K.evento("Nivel 2 · avanza hacia adentro","alerta")});e(t,8.6,"c",function(){K.evento("Nivel 3 · en el interior","alerta")});K.contador("Intrusiones en 30 días","176")}}});

  def({id:"acceso",grupo:2,nombre:"Acceso no autorizado",corta:"Avisa cuando alguien que no es del equipo cruza a una zona interna.",
    desc:"Combina la puerta de una zona interna con el reconocimiento de personal: el equipo pasa sin aviso, y si cruza alguien que no lo es, avisa al instante.",
    dur:15,camara:{pos:[8,8,10],mira:[0,0.6,0]},
    fases:[[0,"vigila","La puerta de bodega solo es para el personal"],[3,"ok","Pasa alguien con uniforme: sin aviso"],[8.4,"alerta","Cruza un cliente: aviso de acceso no autorizado"]],
    armar:function(K){tienda(K,{gondolas:false,pared:false});K.gondola(-3.5,1.4,4,0,{unaCara:true,letrero:"PASILLO 5"});K.muro(-8,-1.2,1.2,-1.2,2.8,K.mat.muroAzul);K.muro(3.4,-1.2,8,-1.2,2.8,K.mat.muroAzul);var pu=K.puerta(2.3,-1.2,2.2,0,{opaca:true});
      K.rack(-3.4,-4,4.4,0);K.rack(5.2,-4,3.2,0);K.estiba(-0.4,-3.6,0,3);
      K.cartel(2.3,2.55,-1.08,1.8,0.3,"SOLO PERSONAL","#E5484D","#fff");K.camara([4.6,2.6,-0.6],[2.2,0.4,0.6],{id:"CAM BODEGA"});var L=K.lineaCruce([1.1,-0.9],[3.5,-0.9],{estado:"oro"});
      var a=persona(K,{color:STAFF,ruta:[[0,6,3],[2.6,2.3,0.6],[4.4,2.3,-3.4],[15,2.3,-5]]}),b=persona(K,{color:0x5E9FB0,ruta:[[0,-6,3.6],[5.6,1,2.6],[7,2.3,0.4],[9,2.3,-3.4],[15,1,-5]]});
      var Ra=K.recuadro(a,{texto:"personal"}),Rb=K.recuadro(b,{texto:"cliente"});var e=reloj();
      return function(t){pu.userData.abrir(suave(t>2.2&&t<4.8?1:(t>7.6&&t<10?1:0)));Ra.set("staff","personal");Rb.set(t>8.4?"alerta":"cliente",t>8.4?"no autorizado":"cliente");
        L.set(t>8.4?"alerta":"oro");e(t,3.4,"a",function(){K.evento("Paso de personal · bodega","")});e(t,8.4,"b",function(){K.evento("Acceso no autorizado · bodega","alerta")})}}});

  def({id:"aglomeracion",grupo:2,nombre:"Aglomeración y tumulto",corta:"Avisa cuando se junta demasiada gente en un punto.",
    desc:"Mide la densidad de personas por zona y qué tan rápido crece. Una concentración repentina o un tumulto disparan el aviso antes de que se salga de control.",
    dur:15,camara:{pos:[8,11,12],mira:[0,0,0]},
    fases:[[0,"vigila","Densidad normal en la zona"],[4,"detecta","La gente converge rápido hacia un punto"],[8,"alerta","Pasa de 2 personas por m²: aviso de aglomeración"]],
    armar:function(K){exterior(K,{w:16,d:11,bolardos:false});K.camara([7,4.4,-4.6],[0,0,0.6],{id:"CAM PLAZOLETA",fov:80});var Z=K.zona([[-2.4,-1.6],[2.4,-1.6],[2.4,2.2],[-2.4,2.2]],{estado:"vigila"});
      var tar=K.grupo(0,0.1,0);K.caja(0,0,0,0.9,0.65,0.9,K.std(0x2B3038),tar);K.caja(0,0.65,0,1.0,0.5,0.4,K.std(0xE9EBEE),tar);K.caja(0,0.75,0.21,0.7,0.3,0.01,K.mat.pantalla,tar);tar.userData.obst=false;
      var P=[];for(var i=0;i<14;i++){var a=i/14*Math.PI*2,r=6+((i*7)%3),sx=Math.cos(a)*r,sz=Math.sin(a)*r*0.6,fx=Math.cos(a)*(0.9+(i%3)*0.45),fz=Math.sin(a)*(0.9+(i%3)*0.45)+0.3,ti=3+(i%5)*0.6;
        var p=persona(K,{color:ROPA[i%9],ruta:[[0,sx,sz],[ti,sx*0.9,sz*0.9],[ti+3.2,fx,fz,"corre"],[15,fx,fz,"idle",0,0.3]]});p.evita=false;P.push(p)}
      P.forEach(function(p,i){p.post=function(t){if(t>8){K.ik(p,i%2?"Right":"Left",K.local(p,i%2?-0.1:0.1,1.75,0.25),ventana(t,8,15,0.4,0.1)*(0.6+Math.sin(t*4+i)*0.4))}}});
      return function(t){var n=P.filter(function(p){return Math.abs(p.raiz.position.x)<2.4&&p.raiz.position.z>-1.6&&p.raiz.position.z<2.2}).length,d=(n/17.3).toFixed(1);
        K.contador("Personas en la zona",String(n));K.contador("Densidad",d.replace(".",",")+" por m²");Z.set(n>9?"alerta":(n>4?"detecta":"vigila"),n>9);if(n>9&&!Z.av){Z.av=1;K.evento("Aglomeración en la plazoleta","alerta")}}}});

  def({id:"epp",grupo:2,nombre:"Equipo de protección (EPP)",corta:"Avisa si alguien trabaja sin casco o chaleco.",estado:"con evidencia",
    desc:"Revisa casco, chaleco y overol según la regla de cada zona, y emite un aviso por persona y no uno por imagen. Si no ve bien, no opina.",
    video:{src:"evidencia/epp.mp4",poster:"evidencia/epp-poster.jpg",chapa:"cámara real"},
    dur:15,camara:{pos:[4.6,3.6,7.4],mira:[0.6,1,1.2]},
    fases:[[0,"vigila","En esta zona se exige casco y chaleco"],[4,"ok","Trabajador con casco y chaleco: en verde"],[7.5,"alerta","Otro entra sin casco: aviso por esa persona"]],
    armar:function(K){bodega(K);K.rack(-3,-3.6,5,0,{niveles:3});K.rack(3.4,-3.6,4,0);K.estiba(0,1.6,20,3);K.camara([6.8,3.6,3.8],[0,0.3,-0.8],{id:"CAM BODEGA 2"});
      var Z=K.zona([[-6.5,-2.4],[6.5,-2.4],[6.5,4.6],[-6.5,4.6]],{estado:"vigila",op:0.08});
      function pegar(b,m,y){if(!b)return;var ws=new THREE.Vector3();b.getWorldScale(ws);m.scale.multiplyScalar(1/ws.x);m.position.y=y/ws.x;b.add(m)}
      function equipar(P,casco){var am=K.std(0xF2C230,{roughness:0.35});
        if(casco){var g=new THREE.Group();var cu=new THREE.Mesh(new THREE.SphereGeometry(0.135,20,12,0,Math.PI*2,0,Math.PI*0.52),am);cu.castShadow=true;g.add(cu);
          var ala=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.012,24),am);ala.position.y=0.005;ala.scale.set(1,1,1.12);ala.position.z=0.025;g.add(ala);
          var cr=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.025,0.25),am);cr.position.y=0.13;g.add(cr);pegar(P.hueso("Head"),g,0.085)}}
      var a=persona(K,{color:0x22304D,ropa:{camisa:0x22304D,pantalon:0x26324A,zapatos:0x3A2F2A,chaleco:0xC6F03A},ruta:[[0,-6,1],[4,-1.4,1.2],[15,-1.4,1.2,"idle",0,1.6]]}),b=persona(K,{color:0x3A3F48,ropa:{camisa:0x3A3F48,pantalon:0x1E2433,zapatos:0x1C1E22,chaleco:0xC6F03A},ruta:[[0,7,3],[3.5,7,3],[7.5,2.6,2],[15,2.6,2,"idle",0,1.6]]});equipar(a,true);equipar(b,false);
      var tabla=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.3,0.015),K.std(0x8A6440));a.sostener(tabla,"Left",[0,0.12,0.08]);a.post=function(t){K.ik(a,"Left",K.local(a,0.22,1.1,0.3),0.9);if(t>5)K.ik(a,"Right",K.local(a,0.1,1.2,0.32),0.8*(0.5+0.5*Math.sin(t*2)))};
      var Ra=K.recuadro(a,{texto:"persona"}),Rb=K.recuadro(b,{texto:"persona"});var la=K.etiqueta("Casco ✓ · Chaleco ✓","ok",K.sobre(a)),lb=K.etiqueta("Casco ✗ · Chaleco ✓","rojo",K.sobre(b));var e=reloj();
      return function(t){Ra.set(t>4?"ok":"vigila",t>4?"EPP completo":"persona");Rb.set(t>7.5?"alerta":"vigila",t>7.5?"sin casco":"persona");la.el.style.opacity=t>4?1:0;lb.el.style.opacity=t>7.5?1:0;
        Z.set(t>7.5?"alerta":"vigila",t>7.5);e(t,7.5,"a",function(){K.evento("Sin casco · zona de bodega","alerta")});K.contador("Falsas alarmas en la prueba","0")}}});

  def({id:"caidas",grupo:2,nombre:"Detección de caídas",corta:"Avisa cuando una persona cae y no se levanta.",
    desc:"Sigue la postura de cada persona. Si cae y se queda en el piso más de unos segundos, avisa con la ubicación para que alguien acuda.",
    dur:15,camara:{pos:[8,7,10],mira:[0,0.4,0]},
    fases:[[0,"vigila","Sigue la postura de quien camina"],[4.2,"detecta","Pasa de vertical a horizontal: posible caída"],[8,"alerta","No se levanta: aviso para que alguien acuda"]],
    armar:function(K){tienda(K);K.camara([7,3,3],[0,0,-0.3],{id:"CAM PASILLO 3"});var P=persona(K,{color:0xC46F7D,ruta:[[0,-6,1.2],[4,0.4,1.2],[15,0.4,1.2]]});
      var ay=persona(K,{color:STAFF,ruta:[[0,7,-4],[9,7,-4],[11.6,1.5,1.9],[15,1.5,1.9,"agree",0.4,1.2]]});var R=K.recuadro(P,{texto:"de pie"}),lb=K.etiqueta("Persona en el piso","rojo",K.sobre(P,0.9));var e=reloj();
      P.post=function(t){var tr=ventana(t,3.6,4.6,0.3,0.4);if(tr>0){torso(K,P,0.5*tr,0.1*tr);K.ik(P,"Right",K.local(P,-0.3,0.6,0.6),tr);K.ik(P,"Left",K.local(P,0.3,0.6,0.6),tr)}};
      ay.post=function(t,dt,e){var ag=ventana(t,12,15,0.6,0.1);if(ag>0){K.gesto(ay,"agacharse",t,ag);K.ik(ay,"Right",K.local(ay,-0.2,0.5,0.5),ag)}if(e.a==="walk"&&t>9)K.gesto(ay,"prisa",t,1)};
      var tes=persona(K,{ruta:[[0,6,3.2],[4,2.6,2.6],[15,2.6,2.6,"idle",0.4,1.2]]});K.recuadro(tes,{texto:"persona"});tes.post=function(t){K.gesto(tes,"sorpresa",t,ventana(t,4.2,6,0.3,0.8));K.gesto(tes,"cabeza",t,ventana(t,6,9,0.6,0.6));K.gesto(tes,"telefono",t,ventana(t,9.5,15,0.6,0.2))};
      return function(t){P.caida=suave((t-4)/0.6);if(t>4){R.h=0.5;R.w=1.8;R.d=0.7}R.l.scale.set(t>4?2.2:1,t>4?0.3:1,1);R.set(t>8?"alerta":(t>4.2?"detecta":"vigila"),t>8?"caída · 4 s":(t>4.2?"horizontal":"de pie"));
        lb.el.style.opacity=t>8?1:0;e(t,8,"a",function(){K.evento("Caída en pasillo 3","alerta")})}}});

  def({id:"hurto",grupo:2,nombre:"Hurto",corta:"Distingue un hurto de una compra normal, y avisa.",estado:"en desarrollo",
    desc:"Lee la postura y los gestos de las manos de cada persona y les pone una puntuación. Mirar a los lados, tomar productos pequeños y llevarlos a la ropa en vez de a la canasta la hace subir; cuando cruza el umbral, avisa en el momento.",
    video:{src:"evidencia/hurto.mp4",poster:"evidencia/hurto-poster.jpg",chapa:"visor en vivo · en desarrollo"},
    dur:20,camara:{pos:[-3.0,1.75,-0.55],mira:[0.2,1.05,-1.35]},
    fases:[[0,"vigila","Llega a la góndola de productos pequeños: perfumes y cuchillas"],[3,"detecta","Mira a los lados antes de tomar nada"],[5.2,"detecta","Toma un producto, abre la chaqueta con la otra mano y lo guarda adentro"],[10.6,"alerta","Segundo producto a la chaqueta: la puntuación cruza el umbral y avisa"]],
    armar:function(K){tienda(K,{gondolas:false});var g=K.gondola(0,-2,5,0,{unaCara:true,familias:["cajas","latas","cajas","bolsas"],letrero:"PERFUMERÍA"});K.gondola(-4.6,1.2,4,90);K.camara([2.6,2.9,0.6],[-0.2,1,-1.5],{id:"CAM 06",fov:60});
      var cols=[0xD94F3D,0x2F7BEA,0x8E5BC8,0xF2C230,0x1E9AA8,0xC2185B],IT=[];
      [[-0.42,1.33],[-0.14,1.33],[0.14,1.33],[0.42,1.33],[-0.3,0.945],[0,0.945],[0.3,0.945]].forEach(function(p,i){var b=K.caja(p[0],p[1],-1.555,0.055,0.095,0.04,K.std(cols[i%6],{roughness:0.3,metalness:0.3}));IT.push(b)});
      var P=persona(K,{color:0x5A4632,ropa:{chaqueta:0x5A4632,cierre:false,abrir:3.4,camisa:0xBFC3CA,pantalon:0x1E2433,zapatos:0x1C1E22},ruta:[[0,5.5,0.9],[3,0,-0.98],[16,0,-0.98,"idle",0,-2],[20,5.5,1.6]]});P.sinMirada=true;P.sinAuto=true;
      var abrir=P.chaqueta?P.chaqueta.material.userData.abrir:{value:0},ABIERTA_BASE=3.4;
      var CIC=[[4.6,0,-1],[8.8,6,-1],[13,2,-1]],ocultos=0,suave=function(x){return x<0?0:x>1?1:x*x*(3-2*x)};
      P.post=function(t){var mira=0,pitch=0,der=0,izq=0,tg=null,ti=null,giro=0,inclina=0,abre=0,hombros=0;
        if(t>3&&t<4.6){mira=nervioso(t)*0.8;hombros=ventana(t,3.2,4.2,0.3,0.3)}
        CIC.forEach(function(c,k){var t0=c[0],it=IT[c[1]],lado=c[2];if(t>t0-0.1&&t<t0+3.2){var a=t-t0;
          if(a<0.7){ // 1. alcanza el producto despacio, mirándolo
            der=suave(a/0.5);tg=it.getWorldPosition(new THREE.Vector3());tg.y+=0.02;pitch=0.35*der}
          else if(a<1.25){ // 2. lo trae al vientre, gira el torso para dar la espalda a la cámara y mira por encima del hombro
            var b=suave((a-0.7)/0.45);der=1;tg=K.local(P,-0.04,1.02+0.1*b,0.2-0.06*b);giro=lado*0.55*b;mira=lado*0.9*b;pitch=0.1*(1-b);inclina=0.06*b}
          else if(a<2.1){ // 3. la mano libre separa la solapa y la otra desliza el producto adentro, pegado al pecho
            var cc=suave((a-1.25)/0.4);der=1;tg=K.local(P,-0.11*cc-0.04*(1-cc),1.12+0.06*cc,0.1-0.03*cc);izq=cc;ti=K.local(P,-0.19,1.27,0.2);abre=cc;giro=lado*0.55;inclina=0.06+0.14*cc;mira=lado*(0.9-0.5*cc);pitch=0.25*cc}
          else{ // 4. la mano sale vacía y vuelve al estante como si siguiera mirando; el cuerpo se endereza
            var d=suave((a-2.1)/0.6);der=1-d;tg=K.local(P,0.16,1.08,0.24);izq=1-d;ti=K.local(P,-0.19,1.25,0.2);abre=1-d;giro=lado*0.55*(1-d);inclina=0.2*(1-d);pitch=0.25*(1-d)}
          if(a>2.6)mira=nervioso(t+k)*0.9}});
        abrir.value=ABIERTA_BASE+abre*7.5;P._dbg=[t.toFixed(2),giro.toFixed(2),der.toFixed(2),izq.toFixed(2)].join("/");
        ["Spine","Spine1","Spine2"].forEach(function(n){var b=K.huesoC(P,n);if(b)b.rotation.y+=giro*0.7});var sh=K.huesoC(P,"RightShoulder");if(sh&&hombros)sh.rotation.z-=0.12*hombros;
        cabeza(K,P,mira,pitch);torso(K,P,inclina,giro*0.12);K.ik(P,"Right",tg,der);
        if(hombros)K.ik(P,"Left",K.local(P,0.1,1.55,-0.02),hombros*0.9);else K.ik(P,"Left",ti,izq*0.95)};
      var R=K.recuadro(P,{texto:"0,10"}),otro=persona(K,{ruta:[[0,6,3.4],[10,-5.5,3.6]]});K.recuadro(otro,{texto:"0,06"});var e=reloj();
      return function(t){CIC.forEach(function(c,k){var it=IT[c[1]],t0=c[0];if(t>t0+0.62&&!it.userData.tom){it.userData.tom=1;K.agarrar(it,P,"Right")}
          if(t>t0+2.05&&!it.userData.dentro){it.userData.dentro=1;it.visible=false;ocultos++;K.evento("Producto a la chaqueta · "+ocultos,ocultos>1?"alerta":"detecta")}});
        var sc=0.1+ocultos*0.36+(t>3&&t<4.6?0.1:0);sc=Math.min(0.97,sc);R.set(sc>0.8?"alerta":(sc>0.35?"detecta":"vigila"),sc.toFixed(2).replace(".",","));
        K.contador("Productos tomados",String(IT.filter(function(i){return i.userData.tom}).length));K.contador("Ocultos en la ropa",String(ocultos));e(t,10.6,"a",function(){K.evento("Posible hurto · 0,82 · góndola de perfumes","alerta")})}}});

  def({id:"ocultaProd",grupo:2,nombre:"Ocultamiento de producto",corta:"Ve cuando un producto se esconde en la ropa.",
    desc:"Sigue el producto desde que sale de la góndola. Si desaparece dentro de la ropa o de un bolso en vez de ir al carro o a la canasta, abre un caso.",
    video:{src:"evidencia/hurto-vivo.mp4",poster:"evidencia/hurto-vivo-poster.jpg",chapa:"prueba en sala · en desarrollo"},
    dur:15,camara:{pos:[6,6,8],mira:[0,1,-0.6]},
    fases:[[0,"vigila","Sigue cada producto que sale de la góndola"],[3.6,"detecta","El producto va a la mano"],[7.4,"alerta","Desaparece bajo la chaqueta: «manipulación sospechosa · esconde»"]],
    armar:function(K){tienda(K,{gondolas:false});var g=K.gondola(0,-2,6,0,{unaCara:true,familias:["cajas","cajas","latas","cajas"]});K.camara([3.4,2.8,0.8],[0,1,-1.4],{id:"CAM 07",fov:62});
      var P=persona(K,{color:0x2F3A4D,ropa:{chaqueta:0x2F3A4D,cierre:false,abrir:3,camisa:0xE8E4DA,pantalon:0x3A3F4A,zapatos:0x1C1E22},ruta:[[0,-6,0.6],[3.4,-0.4,-1],[15,-0.4,-1,"idle",-0.4,-2]]});P.sinAuto=true;var pr=producto(K,0xF2C230,5);var sl=g.userData.slots[8];
      var abrir=P.chaqueta?P.chaqueta.material.userData.abrir:{value:0};
      P.post=function(t){var a=ventana(t,2.9,3.7,0.4,0.2);if(a>0){var tg=sl.getWorldPosition(new THREE.Vector3());tg.y+=0.1;K.ik(P,"Right",tg,a);cabeza(K,P,0,0.3*a)}var b=ventana(t,5.8,8,0.6,0.5);abrir.value=3+6*b;
        if(b>0){var sp1=K.huesoC(P,"Spine1");if(sp1)sp1.rotation.y+=0.45*b;torso(K,P,0.15*b,0);K.ik(P,"Right",K.local(P,0.02,1.12,0.1),b);K.ik(P,"Left",K.local(P,0.22,1.24,0.2),b*0.9);cabeza(K,P,-0.8*b+nervioso(t)*0.4*b,0.15*b)}};
      var R=K.recuadro(P,{texto:"persona"}),Rp=K.recuadro({raiz:pr,visible:true,alto:0.2,rot:0},{texto:"producto",w:0.2,h:0.24,d:0.16});Rp.visible=false;var e=reloj();
      return function(t){if(t>3.6&&!(pr.parent&&(pr.parent&&pr.parent.isBone))){sl.visible=false;P.sostener(pr,"Right",[0,0.1,0.06])}var wp=new THREE.Vector3();pr.getWorldPosition(wp);Rp.fijo=[wp.x,wp.y-0.12,wp.z];Rp.visible=t>3.6&&t<7.4;
        if(t>6.4&&(pr.parent&&pr.parent.isBone)){pr.position.y=lerp(pr.position.y,-0.05,0.08)}if(t>7.4)pr.visible=false;R.set(t>7.4?"alerta":(t>3.6?"detecta":"vigila"),t>7.4?"esconde · 0,99":"persona");Rp.set("detecta");
        e(t,7.4,"a",function(){K.evento("Manipulación sospechosa · motivo: esconde","alerta")})}}});

  def({id:"armas",grupo:2,nombre:"Armas de fuego",corta:"Detecta un arma de fuego en menos de medio segundo.",estado:"en validación",
    desc:"Pistolas y armas largas, llevadas por alguien o dejadas sobre un mostrador. Toda alerta pide verificación humana; nunca confunde un teléfono con un arma.",
    video:{src:"evidencia/armas.mp4",poster:"evidencia/armas-poster.jpg",chapa:"clip de banco público"},
    dur:13,camara:{pos:[7,6.5,9],mira:[0,1,0]},camaraFranq:{pos:[1.8,3.4,1.6],mira:[6.2,1,-2.4]},
    fases:[[0,"vigila","Vigila manos y objetos en la escena"],[4,"detecta","Aparece un arma: espera varios cuadros seguidos"],[4.3,"alerta","Confirmada en 0,3 s: «arma de fuego · portada»"]],
    armar:function(K){var OX=window.MARCA==="franq";if(OX){tienda(K);K.camara([3.8,2.9,1.6],[6.4,1,-2.4],{id:"CAM CAJA",fov:72})}else{tienda(K,{gondolas:false});K.cajaRegistro(0,-1.6,0,{n:3});K.camara([3.4,2.8,-2.8],[0,1,1.4],{id:"CAM CAJA",fov:72})}
      var caj=persona(K,{color:STAFF,ruta:OX?[[0,7.05,-2.4,"idle",5,-2.4]]:[[0,0,-2.6,"idle",0,0]]});
      var P=persona(K,{color:0x2E2F33,ropa:{chaqueta:0x2E2F33,pantalon:0x1E2433,zapatos:0x1C1E22,gorra:0x1C1E22},ruta:OX?[[0,4.6,7],[3.6,5.4,-2.4],[13,5.4,-2.4,"idle",7,-2.4]]:[[0,6,4],[3.6,0.4,-0.6],[13,0.4,-0.6,"idle",0,-2]]}),ar=arma(K);ar.visible=false;P.sostener(ar,"Right",[0,0.08,0.05]);
      P.post=function(t){var a=ventana(t,3.6,13,0.4,0.1);if(a>0){K.ik(P,"Right",K.local(P,-0.2,1.15,0.5),a);K.ik(P,"Left",K.local(P,0.1,1.1,0.45),a*0.8);torso(K,P,0.08*a,0)}};caj.post=function(t){var a=ventana(t,4.3,13,0.5,0.1);if(a>0){K.ik(caj,"Right",K.local(caj,-0.3,1.7,0.1),a);K.ik(caj,"Left",K.local(caj,0.3,1.7,0.1),a);torso(K,caj,-0.1*a,0)}};
      var R=K.recuadro(P,{texto:"persona"}),Ra=K.recuadro({raiz:ar,visible:true,alto:0.2,rot:0},{texto:"arma",w:0.3,h:0.25,d:0.3,estado:"alerta"});Ra.visible=false;var e=reloj();
      return function(t){ar.visible=t>3.8;var wp=new THREE.Vector3();ar.getWorldPosition(wp);Ra.fijo=[wp.x,wp.y-0.12,wp.z];Ra.visible=t>4;Ra.set(t>4.3?"alerta":"detecta",t>4.3?"arma de fuego · portada":"evaluando");
        R.set(t>4.3?"alerta":"vigila");e(t,4.3,"a",function(){K.evento("Arma de fuego confirmada · 0,32 s","alerta")});K.contador("Del arma visible al aviso",t>4.3?"0,32 s":"—")}}});

  def({id:"blancas2",grupo:2,nombre:"Armas blancas",corta:"Cuchillos, machetes y objetos cortantes.",estado:"en validación",
    desc:"Cuando un cuchillo, una daga o un machete aparece y se sostiene unos fotogramas, salta la alarma en un tercio de segundo. Además sigue el comportamiento previo: mirar a todos lados y llevarse la mano a la cintura.",
    video:{src:"evidencia/blancas-vivo.mp4",poster:"evidencia/blancas-vivo-poster.jpg",chapa:"cámara propia, en vivo"},
    dur:15,camara:{pos:[4.2,3,4.6],mira:[0.4,1,0]},
    fases:[[0,"vigila","Entra a la recepción y se detiene"],[2.6,"detecta","Mira a todos lados, nervioso, y se lleva la mano a la cintura"],[6.6,"detecta","Saca un objeto cortante de entre la ropa"],[7,"alerta","Confirmado «cuchillo» en la mano: aviso para verificar"]],
    armar:function(K){oficina(K);K.puesto(-2.6,-2.4,0);K.puesto(1.6,-2.4,0);var rec=persona(K,{color:0x3F6FB5,ruta:[[0,-2.6,-1.75,"idle",-2.6,-1]]});K.camara([3.6,2.6,-3.4],[0,1,1.2],{id:"CAM RECEPCIÓN"});
      rec.post=function(t){var w=ventana(t,0,6,0.1,0.8);K.ik(rec,"Right",K.local(rec,-0.14,0.86,0.42),w);K.ik(rec,"Left",K.local(rec,0.14,0.86,0.42),w);if(t>6.5){K.ik(rec,"Right",K.local(rec,-0.3,1.55,0.2),ventana(t,6.5,15,0.4,0.1));K.ik(rec,"Left",K.local(rec,0.3,1.55,0.2),ventana(t,6.5,15,0.4,0.1))}};
      var P=persona(K,{color:0x2E2F33,ropa:{chaqueta:0x2E2F33,pantalon:0x1E2433,zapatos:0x1C1E22},ruta:[[0,5,4],[2.4,1.2,0.8],[3.2,1.2,0.8,"idle",0,-2],[4,0.8,0.5],[15,0.8,0.5,"idle",-1.2,-2]]}),cu=cuchillo(K);cu.visible=false;P.sostener(cu,"Right",[0,0.06,0.04]);P.sinMirada=true;
      P.post=function(t){var m=0;if(t>2.4&&t<7.6)m=nervioso(t)*1.05;if(t>8.4)m=nervioso(t*0.7)*0.6;cabeza(K,P,m,0);
        P.desp=P.desp||new THREE.Vector3();P.desp.x=t>2.4&&t<6?Math.sin(t*5)*0.05:0;
        var cin=ventana(t,4.6,7.2,0.5,0.5),fr=t>6.8?Math.min(1,(t-6.8)/0.5):0;if(cin>0&&t<6.8)K.ik(P,"Right",K.local(P,-0.2,0.98,-0.12),cin);
        if(fr>0)K.ik(P,"Right",K.local(P,-0.25,1.05+Math.sin(t*3)*0.03,0.38),fr);if(t>4.6&&t<6.8)K.ik(P,"Left",K.local(P,0.18,1.0,0.12),ventana(t,4.6,6.8,0.4,0.4)*0.6)};
      var R=K.recuadro(P,{texto:"persona",estado:"vigila"}),Ra=K.recuadro({raiz:cu,visible:true,alto:0.2,rot:0},{texto:"cuchillo",w:0.3,h:0.25,d:0.4,estado:"alerta"});Ra.visible=false;var e=reloj();
      return function(t){cu.visible=t>6.5;var wp=new THREE.Vector3();cu.getWorldPosition(wp);Ra.fijo=[wp.x,wp.y-0.12,wp.z];Ra.visible=t>6.6;Ra.set(t>7?"alerta":"detecta",t>7?"cuchillo":"evaluando");
        R.set(t>7?"alerta":(t>2.6?"detecta":"vigila"),t>7?"porta arma blanca":(t>2.6?"conducta nerviosa":"persona"));e(t,2.8,"n",function(){K.evento("Conducta nerviosa en recepción","detecta")});e(t,7,"a",function(){K.evento("Arma blanca confirmada · 0,35 s","alerta")})}}});

  def({id:"peleas",grupo:2,nombre:"Peleas",corta:"Avisa cuando dos personas empiezan a pelear.",
    desc:"Reconoce los movimientos bruscos y repetidos entre dos o más personas: empujones, golpes y caídas. Avisa al puesto de monitoreo mientras está pasando.",
    dur:16,camara:{pos:[4.6,3,5.2],mira:[0,1.1,0.2]},
    fases:[[0,"vigila","Dos personas discuten frente a frente"],[3.4,"detecta","Empujón: uno retrocede de golpe"],[5,"alerta","Golpes repetidos entre los dos: aviso de pelea"],[10.4,"alerta","Uno cae al piso: el aviso sube de prioridad"]],
    armar:function(K){exterior(K,{bolardos:false});K.muro(-8,-5.5,8,-5.5,3,K.mat.muroAzul);[-5.5,5].forEach(function(x){K.auto(x<0?0x2F64C8:0xB0B6BF,{tipo:x<0?"suv":"hatch"}).position.set(x,0,-2.8)});K.afiche(-2,1.6,-5.41,2.4,1.5,"PARQUEADERO",215,0);K.camara([6,3.4,-4.4],[0,0.8,0.6],{id:"CAM PARQUEADERO"});
      var A=persona(K,{color:0xA8445A,escala:1,ancho:1.08,ruta:[[0,-5,2],[2.4,-0.42,0.4],[16,-0.42,0.4,"idle",0.5,0.4]]}),B=persona(K,{color:0x2E8A9E,escala:1,ancho:0.98,ruta:[[0,5,2.6],[2.4,0.42,0.4],[16,0.42,0.4,"idle",-0.5,0.4]]});A.evita=B.evita=false;A.sinMirada=B.sinMirada=true;A.sinAuto=B.sinAuto=true;
      A.desp=new THREE.Vector3();B.desp=new THREE.Vector3();
      var G=[[5,"A","Right"],[5.7,"B","Left"],[6.3,"A","Left"],[6.9,"A","Right"],[7.6,"B","Right"],[8.3,"A","Right"],[9.0,"B","Left"],[9.7,"A","Right"],[10.2,"A","Left"]];
      function cab(P){var h=K.huesoC(P,"Head"),v=new THREE.Vector3();if(h)h.getWorldPosition(v);return v}
      function golpe(t,quien){var r=0,mano=null;G.forEach(function(g){if(g[1]===quien){var a=t-g[0];if(a>0&&a<0.42){var k=a<0.16?a/0.16:1-(a-0.16)/0.26;if(k>r){r=k;mano=g[2]}}}});return{k:r,mano:mano}}
      function recibe(t,quien){var r=0;G.forEach(function(g){if(g[1]!==quien){var a=t-g[0]-0.14;if(a>0&&a<0.5)r=Math.max(r,Math.sin(a/0.5*Math.PI))}});return r}
      function pelear(P,O,quien,t){var gu=t>4.4&&t<10.6?1:0,gp=golpe(t,quien),rc=recibe(t,quien),em=quien==="B"?ventana(t,3.4,3.9,0.12,0.4):0,emA=quien==="A"?ventana(t,3.25,3.6,0.12,0.2):0;
        var lado=quien==="A"?1:-1;P.desp.x=-lado*(rc*0.38+em*0.55+(quien==="B"&&t>3.9?0.35:0))+lado*gp.k*0.28+Math.sin(t*6+lado)*0.04*gu;P.desp.z=Math.cos(t*5+lado)*0.04*gu;
        if(quien==="B"&&t>10.4){var c=Math.min(1,(t-10.4)/0.5);P.caida=c;P.desp.x=0.9*c+0.35}
        torso(K,P,-rc*0.6+gp.k*0.35,rc*0.25*lado);cabeza(K,P,lado*rc*0.9,-rc*0.9);
        var ob=cab(O);["Right","Left"].forEach(function(m){if(gp.mano===m)K.ik(P,m,ob,gp.k);else if(emA>0)K.ik(P,m,K.local(O,m==="Right"?0.12:-0.12,1.3,0),emA);else if(gu)K.ik(P,m,K.local(P,m==="Right"?-0.14:0.14,1.48,0.28),0.85)});
        if(t<3.2){cabeza(K,P,Math.sin(t*2.2+lado)*0.15,0);K.ik(P,"Right",K.local(P,-0.25,1.2+Math.sin(t*3)*0.1,0.35),ventana(t,1.5,3.2,0.4,0.2)*0.8)}}
      A.post=function(t){pelear(A,B,"A",t)};B.post=function(t){pelear(B,A,"B",t)};
      var tes=persona(K,{ruta:[[0,-6,3.6],[3,-2.2,2.6],[16,-2.2,2.6,"idle",0,0.4]]});tes.evita=false;K.recuadro(tes,{texto:"persona"});
      tes.post=function(t){K.gesto(tes,"retroceder",t,ventana(t,3.4,5.5,0.3,1));K.gesto(tes,"telefono",t,ventana(t,6,16,0.8,0.1));if(t>5.5)K.gesto(tes,"nervioso",t,0.4)};
      var R=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:1.9,rot:0},{texto:"2 personas",w:2.6,h:1.95,d:1.1});var e=reloj();
      return function(t){R.fijo=[(A.raiz.position.x+B.raiz.position.x)/2,0,0.4];R.set(t>5?"alerta":(t>3.4?"detecta":"vigila"),t>10.4?"pelea · persona en el piso":(t>5?"pelea":(t>3.4?"empujón":"2 personas")));
        e(t,3.5,"e",function(){K.evento("Empujón en el parqueadero","detecta")});e(t,5.2,"a",function(){K.evento("Pelea en el parqueadero","alerta")});e(t,10.6,"c",function(){K.evento("Persona en el piso tras la pelea","alerta")});K.contador("Golpes contados",String(G.filter(function(g){return t>g[0]+0.15}).length))}}});

  def({id:"fuego",grupo:2,nombre:"Humo y fuego",corta:"Avisa de un incendio cuando todavía es una llama chica.",estado:"en validación",
    desc:"Busca humo y fuego en la imagen, sin sensores nuevos. En la prueba avisó a los 15 segundos, minuto y medio antes de que el humo tapara la cámara: ese margen es el que importa.",
    video:{src:"evidencia/fuego.mp4",poster:"evidencia/fuego-poster.jpg",chapa:"clip de archivo"},
    dur:20,camara:{pos:[7.5,4.6,8],mira:[-0.6,1.2,-1]},
    fases:[[0,"vigila","Bodega en calma"],[2.5,"detecta","Una chispa prende el cartón: llama pequeña y humo claro"],[5,"alerta","Humo + fuego confirmados: aviso con 87 s de margen"],[11,"alerta","El humo choca con el techo y baja en capa: la cámara empieza a perder la imagen"]],
    armar:function(K){bodega(K,{montacargas:false});var techo=3.8;K.rack(-3.6,-3.6,5,0);K.rack(2.6,-3.6,5,0);var e1=K.estiba(-0.8,-0.6,0,3,K.mat.carton),e2=K.estiba(0.7,-0.5,10,2,K.mat.carton);K.estiba(3.4,1.6,0,3);
      for(var x=-7;x<=7;x+=2.5)K.caja(x,techo,0,0.18,0.3,11,K.mat.aceroOsc);K.camara([6.6,3.5,3.4],[-0.4,0.6,-0.8],{id:"CAM BODEGA 1"});
      var arder=[];e1.traverse(function(m){if(m.isMesh)arder.push(m)});
      var F=K.incendio(-0.8,0.5,-0.6,{r:0.32,techo:techo,quemar:arder,capaW:16,capaD:11,niebla:true});
      var R=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:1,rot:0},{texto:"fuego",w:1.6,h:1.8,d:1.4,estado:"detecta"});R.fijo=[-0.8,0,-0.6];R.visible=false;
      var Rh=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:1,rot:0},{texto:"humo",w:3.2,h:1.6,d:2.6,estado:"detecta"});Rh.fijo=[-0.8,2,-0.6];Rh.visible=false;var e=reloj();
      return function(t){var k=Math.max(0,t-2.5);F.int=Math.min(1,0.15+k/3)*(t>2.5?1:0);F.r=0.2+Math.min(0.6,k*0.05);R.w=1.4+Math.min(1.2,k*0.08);
        R.visible=t>2.6;Rh.visible=t>3.4;R.set(t>5?"alerta":"detecta",t>5?"fuego "+Math.min(99,Math.round(62+k*4))+"%":"evaluando");Rh.set(t>5?"alerta":"detecta",t>5?"humo "+Math.min(99,Math.round(55+k*5))+"%":"humo");
        e(t,5,"a",function(){K.evento("Humo y fuego en bodega 1","alerta")});e(t,11,"b",function(){K.evento("Capa de humo bajo el techo · visibilidad bajando","alerta")});
        K.contador("Margen antes de perder la imagen",t>5?Math.max(0,Math.round(87-(t-5)*6))+" s":"—");K.contador("Visibilidad",Math.round(100-Math.min(85,Math.max(0,t-6)*7))+" %")}}});

  function abandonoFranq(K){tienda(K,{canastas:false});K.camara([-6.5,2.8,0.5],[-2.5,0.6,4.6],{id:"CAM BARRA",fov:75});
    var moc=new THREE.Group();K.add(moc);K.caja(0,0,0,0.34,0.46,0.2,K.std(0x2F3A4D,{roughness:0.55}),moc);K.caja(0,0.06,0.12,0.26,0.22,0.06,K.std(0x26324A),moc);[-0.1,0.1].forEach(function(x){K.caja(x,0.08,-0.12,0.05,0.34,0.03,K.mat.negro,moc)});K.caja(0,0.46,0,0.14,0.03,0.03,K.mat.negro,moc);
    var otro=persona(K,{color:0x3E8E5A,ruta:[[0,-5.0,3.9,"idle",-5.0,6]]});otro.post=function(t){cabeza(K,otro,0,0.35);torso(K,otro,0.12,0);K.ik(otro,"Right",K.local(otro,-0.2,1.02,0.28),0.9);K.ik(otro,"Left",K.local(otro,0.2,1.02,0.28),0.9)};
    var P=persona(K,{color:0xC8962E,ruta:[[0,4.0,2.6],[2.6,-3.1,3.9],[6.0,-3.1,3.9,"idle",-3.0,6],[9.5,2.0,2.4],[16,4.6,7]]});
    P.post=function(t){var a=ventana(t,2.4,3.3,0.4,0.4);if(a>0){K.ik(P,"Left",K.local(P,0.25,0.15,0.4),a);torso(K,P,0.5*a,0)}var b=ventana(t,3.4,6,0.3,0.3);if(b>0){K.ik(P,"Right",K.local(P,-0.15,1.05,0.35),b);K.ik(P,"Left",K.local(P,0.15,1.05,0.35),b);cabeza(K,P,0,0.45*b)}};
    var Rm=K.recuadro({raiz:moc,visible:true,alto:0.5,rot:0},{texto:"mochila",w:0.45,h:0.55,d:0.35,estado:"vigila"}),Rp=K.recuadro(P,{texto:"dueña"});
    var lb=K.etiqueta("Objeto abandonado","rojo",K.punto(-3.0,1.0,4.6)),et=K.etiqueta("","reloj",K.punto(-3.0,0.8,4.6));var e=reloj();
    return function(t){if(t<3.0){var hp=K.manoPos(P,"Left");moc.position.set(hp.x,Math.max(0,hp.y-0.25),hp.z);moc.rotation.set(0,P.rot,0)}else{moc.position.set(-3.0,0,4.6);moc.rotation.set(0,0.4,0)}Rm.fijo=[moc.position.x,0,moc.position.z];
      var lejos=t>3&&Math.hypot(P.raiz.position.x+3.0,P.raiz.position.z-4.6)>2.2,s=lejos?Math.max(0,t-7):0,al=lejos&&s>=5;Rm.set(al?"alerta":(lejos?"detecta":"vigila"),al?"objeto abandonado":(lejos?"sin dueño cerca":"mochila"));
      et.set(lejos&&!al?"solo · "+Math.min(5,s).toFixed(1).replace(".",",")+" s":"",s>4?"reloj rojo":"reloj");et.el.hidden=!(lejos&&!al);lb.el.style.opacity=al?1:0;Rp.visible=P.raiz.position.z<6.4;
      e(t,6.4,"a",function(){K.evento("La dueña se va · la mochila queda junto a la barra","detecta")});e(t,12,"b",function(){K.evento("Objeto abandonado · mochila · barra","alerta")})}}

  def({id:"abandono",grupo:2,nombre:"Abandono de objetos",corta:"Avisa del objeto que alguien deja y se va.",
    desc:"Asocia cada objeto con quien lo traía. Si la persona se aleja y el objeto se queda solo más del tiempo fijado, avisa con la imagen de quién lo dejó: sirve para objetos perdidos y para bultos sospechosos.",
    dur:16,camara:{pos:[5.6,4,5.4],mira:[0,0.8,-0.4]},camaraFranq:{pos:[0.6,3.4,1.4],mira:[-3.0,0.6,4.3]},
    fases:OXD?[[0,"vigila","Una clienta llega a la barra junto al vidrio con su mochila"],[2.6,"detecta","Deja la mochila en el piso junto a la barra y mira el celular"],[7,"detecta","Se va: ya nadie está cerca y empieza la cuenta de 5 segundos"],[12,"alerta","Pasan 5 s: «objeto abandonado · mochila»"]]
      :[[0,"vigila","Una persona lee en la mesa con su maleta y su celular"],[3,"detecta","Toma la maleta y se va; el celular se queda en la mesa"],[6,"detecta","Ya nadie está cerca: empieza la cuenta de 5 segundos"],[11,"alerta","Pasan 5 s: «objeto perdido · celular»"]],
    armar:function(K){var OX=window.MARCA==="franq";if(OX)return abandonoFranq(K);var W=16,D=11;K.piso(W,D,K.mat.madera,1.4);K.muro(-W/2,-D/2,W/2,-D/2,3.2,K.std(0xE9E2D6));K.muro(-W/2,-D/2,-W/2,D/2,3.2,K.std(0xE9E2D6));
      K.cartel(0,2.8,-5.4,3,0.45,"BIBLIOTECA","#001441","#D6AB4C");[-5,-2,1,4].forEach(function(x){K.libreria(x,-5.2,2.8,0)});K.libreria(-7.7,-1,3.6,90);K.libreria(-7.7,3,3.2,90);K.planta(7,-4.6,1.1);
      var mad=K.std(0x7A5434,{roughness:0.6});function mesa(x,z){var tp=K.caja(x,0.72,z,2.2,0.05,1,mad);K.obst(tp);[[-1,-0.4],[1,-0.4],[-1,0.4],[1,0.4]].forEach(function(p){K.caja(x+p[0],0,z+p[1],0.06,0.72,0.06,mad)});
        [-0.6,0.6].forEach(function(dx){[-0.75,0.75].forEach(function(dz){var s=K.grupo(x+dx,z+dz,dz>0?180:0);K.caja(0,0.44,0,0.44,0.05,0.42,mad,s);K.caja(0,0.49,-0.2,0.44,0.5,0.04,mad,s);[[-0.19,-0.18],[0.19,-0.18],[-0.19,0.18],[0.19,0.18]].forEach(function(q){K.caja(q[0],0,q[1],0.04,0.44,0.04,mad,s)})})});
        var l=K.grupo(x+0.8,z-0.3);K.cil(0,0.77,0,0.08,0.08,0.02,K.mat.aceroOsc,l);K.cil(0,0.79,0,0.012,0.012,0.36,K.mat.aceroOsc,l);K.cil(0,1.12,0,0.05,0.14,0.12,K.std(0x2E6A4A),l);K.sombra(x,z,2.4,1.4)}
      mesa(-1.6,0.2);mesa(2.6,0.2);mesa(-1.6,3.2);K.caja(-2.0,0.745,0.1,0.3,0.03,0.22,K.std(0x2E4A7A));K.caja(2.2,0.745,0.3,0.3,0.03,0.22,K.std(0x7A2E2E));K.caja(-1.2,0.745,3.2,0.3,0.03,0.22,K.std(0xC8962E));
      var lec=persona(K,{color:0x7A5CB0,ruta:[[0,2.6,1.05,"idle",2.6,0.2]]});lec.post=function(t){cabeza(K,lec,0,0.5);torso(K,lec,0.15,0);K.ik(lec,"Right",K.local(lec,-0.15,0.8,0.35),0.9);K.ik(lec,"Left",K.local(lec,0.15,0.8,0.35),0.9)};
      K.camara([6.4,3,-4.6],[-0.6,0.6,0.8],{id:"CAM SALA DE LECTURA",fov:72});
      var cel=K.caja(-1.25,0.745,0.05,0.075,0.012,0.15,K.std(0x15171B,{roughness:0.25,metalness:0.4}));
      var mal=new THREE.Group();K.add(mal);K.caja(0,0.1,0,0.42,0.6,0.25,K.std(0x2F3A4D,{roughness:0.5}),mal);K.caja(0,0.7,0,0.03,0.42,0.03,K.mat.aceroOsc,mal);K.caja(0,1.1,0,0.16,0.03,0.03,K.mat.negro,mal);[-0.15,0.15].forEach(function(x){K.cil(x,0,-0.08,0.04,0.04,0.06,K.mat.goma,mal)});K.caja(0,0.25,0.13,0.3,0.25,0.04,K.std(0x26324A),mal);
      var P=persona(K,{color:0xC8962E,ruta:[[0,-1.6,1.05,"idle",-1.6,0.2],[3,-1.6,1.05,"idle",-0.8,1.6],[3.6,-1.2,1.6],[8,6.5,4.6],[16,9,5]]});
      P.post=function(t){var lee=t<2.6?1:0;cabeza(K,P,0,lee*0.5);torso(K,P,lee*0.12,0);if(lee)K.ik(P,"Right",K.local(P,-0.15,0.8,0.35),0.9);if(t>2.8){var hp=K.local(P,0.3,0.98,-0.32);K.ik(P,"Left",hp,Math.min(1,(t-2.8)/0.4))}};
      var Rc=K.recuadro({raiz:cel,visible:true,alto:0.1,rot:0},{texto:"celular",w:0.22,h:0.07,d:0.26,estado:"vigila"}),Rm=K.recuadro({raiz:mal,visible:true,alto:0.8,rot:0},{texto:"maleta",w:0.55,h:1.2,d:0.45,estado:"ok"}),Rp=K.recuadro(P,{texto:"dueña"});
      var lb=K.etiqueta("Objeto perdido","rojo",K.punto(-1.25,1.15,0.05)),et=K.etiqueta("","reloj",K.punto(-1.25,0.95,0.05));var e=reloj();
      return function(t){if(t<3.2){mal.position.set(-0.95,0,1.25);mal.rotation.set(0,0,0)}else{var hp=K.manoPos(P,"Left");mal.position.set(hp.x,0.02,hp.z);mal.rotation.set(0,P.rot,0);mal.rotation.x=-0.32;
          var b=new THREE.Vector3(0,0,-0.18).applyAxisAngle(new THREE.Vector3(0,1,0),P.rot);mal.position.add(b)}Rm.fijo=[mal.position.x,0,mal.position.z];Rc.fijo=[-1.25,0.745,0.05];
        var lejos=Math.hypot(P.raiz.position.x+1.25,P.raiz.position.z-0.05)>2.6,s=lejos?Math.max(0,t-6):0;Rc.set(t>11?"alerta":(t>3?"detecta":"vigila"),t>11?"objeto perdido · celular":(t>3?"sin dueño cerca":"celular"));
        et.set(t>6&&t<11?"solo · "+Math.min(5,s).toFixed(1).replace(".",",")+" s":"",t>10?"reloj rojo":"reloj");et.el.hidden=!(t>6&&t<11);lb.el.style.opacity=t>11?1:0;Rp.visible=P.raiz.position.x<7.6;
        e(t,3.4,"a",function(){K.evento("La dueña se va · el celular queda en la mesa","detecta")});e(t,11,"b",function(){K.evento("Objeto perdido · celular · mesa 1","alerta")})}}});

  def({id:"rostro",grupo:2,nombre:"Ocultamiento de rostro",corta:"Avisa de quien entra con la cara cubierta.",
    desc:"Detecta caras tapadas con capucha, casco o pasamontañas en los accesos. Es una señal temprana: quien entra así a un local suele no querer ser visto.",
    dur:13,camara:{pos:[7,7,10],mira:[0,0.8,1]},
    fases:[[0,"vigila","La cámara de la entrada busca el rostro"],[3.6,"detecta","El rostro no se ve: está cubierto"],[5.4,"alerta","Casco puesto dentro del local: aviso en el acceso"]],
    armar:function(K){entradaTienda(K);
      var P=persona(K,{color:0x25272C,ropa:{chaqueta:0x25272C,pantalon:0x1E2433,zapatos:0x1C1E22},ruta:[[0,4.6,8.4],[4.4,4.4,2],[8,1,0.6],[13,-4,0.4]]});var h=P.hueso("Head");
      if(h){var g=new THREE.Group();var c=new THREE.Mesh(new THREE.SphereGeometry(0.17,20,14),K.std(0x111214,{roughness:0.22,metalness:0.35}));c.castShadow=true;g.add(c);var vis=new THREE.Mesh(new THREE.SphereGeometry(0.172,20,10,-0.9,1.8,0.95,0.55),K.std(0x2A3A4D,{roughness:0.05,metalness:0.6}));g.add(vis);
        var ws=new THREE.Vector3();h.getWorldScale(ws);g.scale.setScalar(1/ws.x);g.position.y=0.09/ws.x;h.add(g)}
      var R=recuadroRostro(K,P,{w:0.34,h:0.34,d:0.34}),lb=K.etiqueta("Rostro cubierto · casco","rojo",K.sobre(P));var e=reloj();var otro=persona(K,{ruta:[[0,-6,3.6],[9,6,3.4]]});
      P.post=function(t,dt,e){if(e.a==="walk")K.gesto(P,"prisa",t,0.8);K.gesto(P,"nervioso",t,0.35)};otro.post=function(t){var d=P.raiz.position.clone().sub(otro.raiz.position);var yaw=Math.atan2(d.x,d.z)-otro.rot;while(yaw>Math.PI)yaw-=2*Math.PI;while(yaw<-Math.PI)yaw+=2*Math.PI;cabeza(K,otro,Math.max(-1,Math.min(1,yaw))*ventana(t,3,8,0.5,0.5),0)};
      return function(t){R.seguir();R.set(t>5.4?"alerta":(t>3.6?"detecta":"vigila"),t>5.4?"rostro cubierto":(t>3.6?"sin rostro":"rostro"));lb.el.style.opacity=t>5.4?1:0;e(t,5.4,"a",function(){K.evento("Rostro cubierto en la entrada","alerta")})}}});

  def({id:"activos",grupo:2,nombre:"Retiro de activos",corta:"Cada equipo tiene su sitio, y avisa cuando sale de él.",estado:"funcionando en silencio",
    desc:"Vigila que cada equipo siga en su lugar. Una línea separa el lado del personal del lado del público. Si alguien estira la mano por encima y se lleva el equipo, verifica en ámbar y avisa en rojo, con el video desde 15 segundos antes.",
    video:{src:"evidencia/retiro-2.mp4",poster:"evidencia/retiro-poster-2.jpg",chapa:"puesto real"},
    dur:16,camara:{pos:[4.2,3.6,4.8],mira:[0.2,0.9,-1.2]},
    fases:[[0,"ok","El celular y el monitor vigilados, en verde; la línea magenta separa personal y público"],[4.2,"detecta","Alguien del lado del público estira la mano por encima de la línea"],[5.6,"detecta","El celular deja de verse: ámbar, verificando retiro"],[7.6,"alerta","Sigue sin estar: «activo retirado · celular», con video"]],
    armar:function(K){oficina(K);var gris=K.std(0xD9DCE0,{roughness:0.6});
      K.caja(0,0,-1.75,3.2,0.72,0.8,gris);K.caja(0,0.72,-1.75,3.3,0.04,0.86,K.mat.blanco);K.caja(-1.2,0,-1.75,0.45,0.66,0.7,K.mat.blanco);K.caja(0,0,-1.33,3.2,1.05,0.04,K.std(0x1E3A6E));
      K.pc(-0.6,0.76,-1.95,0);K.pc(0.9,0.76,-1.95,0);K.caja(0.9,0.76,-1.62,0.42,0.02,0.14,K.mat.negro);K.planta(-1.4,-2.3,0.7);
      var cel=K.caja(0.45,0.76,-1.38,0.08,0.012,0.16,K.std(0x15171B,{roughness:0.25,metalness:0.4}));
      var sil=K.grupo(0.1,-2.6,0);K.caja(0,0.42,0,0.5,0.08,0.48,K.mat.negro,sil);K.caja(0,0.5,-0.22,0.48,0.55,0.06,K.mat.negro,sil);K.cil(0,0,0,0.03,0.03,0.42,K.mat.aceroOsc,sil);
      var mag=K.std(0xE86AA6,{emissive:0xE86AA6,emissiveIntensity:0.6});for(var x=-1.6;x<1.6;x+=0.16)K.caja(x+0.05,0.761,-1.27,0.09,0.004,0.02,mag);
      K.cartel(-1.0,0.02,-0.7,1.2,0.3,"PÚBLICO","#E86AA6","#fff").rotation.x=-Math.PI/2;K.cartel(-1.0,0.02,-2.7,1.2,0.3,"PERSONAL","#30A46C","#fff").rotation.x=-Math.PI/2;
      K.camara([-2.6,2.6,0.4],[0.3,0.8,-1.6],{id:"CAM RECEPCIÓN",fov:66});
      var emp=persona(K,{color:0x3F6FB5,ruta:[[0,-0.6,-2.65,"idle",-0.6,-1.5],[2,-0.6,-2.65,"idle",-0.6,-1.5],[3.4,-3.6,-3.6],[16,-6,-4]]});
      var P=persona(K,{color:0x2A2D33,ropa:{chaqueta:0x2A2D33,pantalon:0x1E2433,zapatos:0x1C1E22},ruta:[[0,5,2.6],[3.6,0.62,-0.9],[6.6,0.62,-0.9,"idle",0.45,-1.4],[10,-2,3],[16,-6,4]]});
      var Rc=K.recuadro({raiz:cel,visible:true,alto:0.1,rot:0},{texto:"celular vigilado",w:0.24,h:0.08,d:0.3,estado:"ok"}),Rm=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:0.4,rot:0},{texto:"monitor vigilado",w:0.62,h:0.42,d:0.15,estado:"ok"});
      Rc.fijo=[0.45,0.76,-1.38];Rm.fijo=[-0.6,0.95,-1.92];var Rp=K.recuadro(P,{texto:"persona"});var e=reloj(),tom=false;
      P.post=function(t){var alc=t>3.9&&t<6.4?Math.min(1,(t-3.9)/0.6)*(t>5.8?Math.max(0,1-(t-5.8)/0.6):1):0;var e1=K.huesoC(P,"Spine"),e2=K.huesoC(P,"Spine1");if(e1)e1.rotation.x+=0.38*alc;if(e2)e2.rotation.x+=0.22*alc;
        if(t<5.1){var tg=cel.getWorldPosition(new THREE.Vector3());tg.y+=0.03;K.ik(P,"Right",tg,alc)}else K.ik(P,"Right",K.local(P,0.18,1.0,0.25),alc>0?Math.max(alc,0.6):0.0);if(t>6.4&&t<9)cabeza(K,P,nervioso(t)*0.5,0)};
      return function(t){if(t>5.1&&!tom){tom=true;K.agarrar(cel,P,"Right")}var hp=K.manoPos(P,"Right"),cruza=t>4.2&&t<6.2&&hp.z<-1.27;
        Rc.set(t>7.6?"alerta":(t>5.6?"detecta":"ok"),t>7.6?"ACTIVO RETIRADO · celular":(t>5.6?"verificando retiro · celular":"celular vigilado"));Rp.set(cruza?"detecta":(t>7.6?"alerta":"vigila"),cruza?"cruza la línea":(t>7.6?"se lleva el celular":"persona"));
        mag.emissiveIntensity=cruza?1.6+Math.sin(t*20):0.6;e(t,4.4,"a",function(){K.evento("Mano sobre el perímetro protegido","detecta")});e(t,7.6,"b",function(){K.evento("Activo retirado · celular de recepción","alerta")})}}});

  /* =====================================================================================================
     4 · MODELOS LITE · BAJO COSTO
     ===================================================================================================== */
  function gondolaCerca(K,o){tienda(K,{gondolas:false});var g=K.gondola(0,-1.6,6,0,Object.assign({unaCara:true},o||{}));K.camara([0,2.2,1.6],[0,0.9,-1.6],{id:"CAM GÓNDOLA",fov:70});return g}
  function pintarSlot(K,s,m){s.traverse(function(q){if(q.isMesh)q.material=m})}

  def({id:"fleje",grupo:3,nombre:"Verificación de etiqueta",corta:"Revisa que cada producto tenga su fleje y su precio.",
    desc:"Lee los flejes del borde de la góndola y los cruza con el producto que hay encima. Avisa del fleje que falta, del que no corresponde y del precio que no coincide.",
    dur:14,camara:{pos:[4,4,6],mira:[0,0.9,-1.4]},
    fases:[[0,"vigila","Lee cada fleje del borde de la góndola"],[4,"ok","Producto y fleje coinciden: en verde"],[8,"alerta","Fleje faltante y precio que no coincide: aviso para corregir"]],
    armar:function(K){var g=gondolaCerca(K,{fleje:false,familias:["cajas","cajas","latas","cajas"]});var R=[];for(var n=0;n<4;n++)for(var i=0;i<5;i++){var x=-2.6+i*1.3,y=0.14+n*(1.58/4)-0.05;var malo=(n===1&&i===3),falta=(n===2&&i===1);
        if(!falta)K.caja(x,y,-1.6+0.44,0.5,0.06,0.01,malo?K.std(0xF2C230):K.mat.blanco);var r=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:0.1,rot:0},{texto:"",w:0.56,h:0.1,d:0.05,pip:true});r.fijo=[x,y-0.02,-1.6+0.45];r.malo=malo;r.falta=falta;r.visible=false;R.push(r)}
      var e=reloj();return function(t){R.forEach(function(r,i){r.visible=t>1+i*0.12;var est=t>8&&(r.malo||r.falta)?"alerta":(t>4?"ok":"vigila");r.set(est,t>8&&r.falta?"falta":(t>8&&r.malo?"$ no coincide":""))});
        K.contador("Flejes revisados",String(Math.min(20,Math.max(0,Math.floor((t-1)/0.12)))));K.contador("Para corregir",t>8?"2":"0");e(t,8,"a",function(){K.evento("2 flejes por corregir · góndola 4","alerta")})}}});

  function canastillasFranq(K){tienda(K,{canastas:false});var pu=K.puerta(4.6,5.5,2.2,0);pu.userData.abrir(1);K.camara([4.6,2.8,1.4],[4.6,1,5],{id:"CAM ENTRADA",fov:80});
    var carro=K.grupo(4.6,0,10);carro.userData.sinObst=true;var ac=K.mat.aceroOsc,az=K.std(0x1E5BC6,{roughness:0.55});K.caja(0,0.1,0,0.6,0.05,0.8,ac,carro);[[-0.26,-0.34],[0.26,-0.34],[-0.26,0.34],[0.26,0.34]].forEach(function(p){K.cil(p[0],0,p[1],0.05,0.05,0.1,K.mat.goma,carro)});
    [-0.2,0.2].forEach(function(z){for(var k=0;k<6;k++)K.caja(0,0.15+k*0.075,z,0.46,0.07,0.32,az,carro)});[-0.26,0.26].forEach(function(x){K.caja(x,0.15,-0.38,0.03,0.82,0.03,ac,carro)});K.caja(0,0.95,-0.38,0.56,0.03,0.03,ac,carro);
    var P=persona(K,{color:0x2B3038,ropa:{camisa:0x2B3038,chaleco:0xFFD100,pantalon:0x1E2433,zapatos:0x1C1E22,gorra:0x1E5BC6},ruta:[[0,4.6,9.4],[4.2,4.6,5.9],[6.2,4.3,3.6],[14,4.3,3.6,"idle",5.5,-1.5]]});
    P.post=function(t){K.ik(P,"Right",K.local(P,-0.24,0.98,0.26),0.95);K.ik(P,"Left",K.local(P,0.24,0.98,0.26),0.95);torso(K,P,0.08,0)};
    var Rc=K.recuadro({raiz:carro,visible:true,alto:1,rot:0},{texto:"carro",w:0.8,h:1.05,d:0.95,estado:"vigila"}),Rp=K.recuadro(P,{texto:"proveedor",estado:"vigila"});var e=reloj();
    return function(t){var p=P.raiz.position;carro.position.set(p.x+Math.sin(P.rot)*0.62,0,p.z+Math.cos(P.rot)*0.62);carro.rotation.y=P.rot;Rc.P.rot=P.rot;
      var n=t>4.8?Math.min(12,Math.floor((t-4.8)/0.18)+1):0,ok=t>7.6;Rc.set(ok?"ok":(t>4.8?"detecta":"vigila"),ok?"12 canastillas · ok":(t>4.8?n+" canastillas":"carro"));Rp.set(ok?"ok":"vigila",ok?"proveedor · 08:42":"proveedor");
      K.contador("Canastillas recibidas",(ok?12:n)+" de 12");K.contador("Remisión 4471",ok?"coincide":(t>4.8?"leyendo…":"—"));e(t,7.6,"a",function(){K.evento("Ingreso de proveedor · 12 canastillas · remisión 4471","")})}}

  def({id:"canastillas",grupo:3,nombre:OXD?"Ingreso de canastillas":"Inventario de canastillas y cajas",corta:OXD?"Cuenta las canastillas que entra el proveedor y las cruza con la remisión.":"Cuenta canastillas y cajas sin que nadie las cuente.",
    desc:OXD?"Cuando el proveedor entra por la puerta con el carro, la cámara de la entrada cuenta las canastillas que trae y compara el número con la remisión. Queda registrado quién entró, a qué hora y cuántas canastillas, sin que nadie las cuente a mano.":"Cuenta las canastillas, gaveras o cajas apiladas en una zona y lleva el inventario solo. Avisa cuando bajan del mínimo o cuando salen sin registro.",
    dur:14,camara:{pos:[6,5.5,8],mira:[0,0.8,-0.5]},camaraFranq:{pos:[4.6,3.6,12.8],mira:[4.6,1.2,3.5]},
    fases:OXD?[[0,"vigila","El proveedor llega a la puerta con el carro de canastillas"],[4.2,"detecta","Entra: la cámara de la entrada cuenta las canastillas del carro"],[7.6,"ok","12 canastillas · coincide con la remisión 4471: ingreso registrado"]]
      :[[0,"vigila","Cuenta las canastillas de cada pila"],[5,"detecta","Se retiran 3 canastillas: el conteo baja solo"],[9,"alerta","Quedan menos del mínimo: aviso para reponer"]],
    armar:function(K){var OX=window.MARCA==="franq";if(OX)return canastillasFranq(K);bodega(K);K.camara([3,3,2.4],[0,0.4,-1.4],{id:"CAM ZONA DE CARGA",fov:70});var pilas=[];[-1.6,-0.4,0.8].forEach(function(x,j){var p=[];for(var k=0;k<7;k++){var c=K.canastilla(x,k*0.29,-1.4,[0xD94F3D,0x2F7BEA,0x3EA66B][j]);if(!k)K.obst(c);p.push(c)}pilas.push(p)});
      var P=persona(K,{color:STAFF,ruta:[[0,5,2],[4,1.6,-0.6],[7,1.6,-0.6,"idle",0.8,-1.4],[10,5,3]]});var lleva=null;
      P.post=function(t){var a=ventana(t,4.6,7.2,0.5,0.4);if(a>0){K.ik(P,"Right",K.local(P,-0.2,0.9,0.5),a);K.ik(P,"Left",K.local(P,0.2,0.9,0.5),a);torso(K,P,0.25*a,0)}if(t>7.2){K.ik(P,"Right",K.local(P,-0.22,0.95,0.42),0.9);K.ik(P,"Left",K.local(P,0.22,0.95,0.42),0.9)}};
      var R=pilas.map(function(p,j){var r=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:2,rot:0},{texto:"",w:0.6,h:2.1,d:0.45});r.fijo=[[-1.6,-0.4,0.8][j],0,-1.4];return r});var e=reloj();
      return function(t){var q=t>5?Math.min(3,Math.floor((t-5)/0.7)+1):0;for(var k=0;k<3;k++){var c=pilas[2][6-k];if(k<q){if(!c.userData.tom){c.userData.tom=1;K.agarrar(c,P,"Right");c.position.set(0,-0.3+k*0.3,0.25);c.rotation.set(0,0,0)}}}var n=21-q;
        R.forEach(function(r,j){var c=j===2?7-q:7;r.h=c*0.29+0.05;r.l.scale.y=c/7;r.set(n<19&&t>9?"alerta":(j===2&&q?"detecta":"ok"),c+" uds")});K.contador("Canastillas en zona",String(n));K.contador("Mínimo","19");e(t,9,"a",function(){K.evento("Canastillas bajo el mínimo · reponer","alerta")})}}});

  def({id:"puertas",grupo:3,nombre:"Puertas abiertas o cerradas",corta:"Vigila la puerta de entrada y las neveras: cuál está abierta y desde cuándo.",
    desc:"Sabe si cada puerta está abierta o cerrada: la de entrada de la tienda (apertura, cierre y horario), las neveras, cuartos fríos, bodegas o salidas de emergencia. Avisa cuando una se queda abierta más de lo permitido o se cierra cuando no debe.",
    dur:16,camara:{pos:[1.6,2.5,4.2],mira:[-0.7,1.1,-2.0]},camaraFranq:{pos:[-0.4,2.3,-1.2],mira:[-3.6,1.1,-4.9]},
    fases:[[0,"ok","Puerta de entrada abierta en horario; las cuatro neveras, cerradas"],[3,"detecta","Abre la puerta de la nevera 2 y toma una bebida"],[6,"detecta","Se va y la deja abierta: empieza a contar"],[10,"alerta","Lleva abierta más de lo permitido: aviso de cadena de frío"]],
    armar:function(K){var OX=window.MARCA==="franq";var N,XS,ZN;
      var pu=K.puerta(4.6,4.6,2.2,0);pu.userData.abrir(1);var Rpu=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:2.3,rot:0},{texto:"entrada · abierta 06:58",w:2.4,h:2.4,d:0.5,estado:"ok"});Rpu.fijo=[4.6,0,4.6];
      if(OX){tienda(K,{gondolas:false});N=K._neveras.slice(2,6);XS=N.map(function(n){return n.position.x});ZN=N[0].position.z;K.camara([-1.2,2.7,-2.2],[-3.8,1,-5],{id:"CAM NEVERAS",fov:70})}
      else{tienda(K,{gondolas:false,pared:false});var M=[{marca:"BEBIDAS",fondo:"#C8342B",bot:[0xC8342B,0x2F64C8,0xF2C230]},{marca:"AGUAS",fondo:"#2F64C8",bot:[0x9CD3F5,0x6FB7E8,0xE8F4FB]},{marca:"JUGOS",fondo:"#E0782A",bot:[0xF2A23A,0xD94F3D,0x8CC152]},{marca:"LÁCTEOS",fondo:"#3E8E5A",bot:[0xF4F4F2,0xEDE3CF,0xC9E2F0]}];
        XS=[-1.8,-0.9,0,0.9];ZN=-2.6;N=XS.map(function(x,i){return K.nevera(x,-2.6,M[i])});K.gondola(-5,-1.6,4,90);K.camara([2.2,2.6,0.6],[-0.4,1,-2.4],{id:"CAM NEVERAS",fov:70})}
      var nv=N[1],bot=nv.userData.bot[6],x1=XS[1],zp=ZN+1.4;
      var P=persona(K,{color:0x3F6FB5,ruta:OX?[[0,2.5,1.5],[2.8,x1-0.05,zp],[5.6,x1-0.05,zp,"idle",x1,ZN],[9,4,2],[16,5,4.5]]:[[0,-6,0.4],[2.8,-0.95,-1.2],[5.6,-0.95,-1.2,"idle",-0.9,-3],[9,6,2],[16,7,3]]});
      P.post=function(t){var h=nv.userData.man.getWorldPosition(new THREE.Vector3());var pr=ventana(t,2.9,4.1,0.35,0.3);if(pr>0)K.ik(P,"Left",h,pr);var tb=ventana(t,3.9,5.4,0.4,0.4);if(tb>0){var g=t<4.6?bot.getWorldPosition(new THREE.Vector3()):K.local(P,-0.25,1.05,0.25);K.ik(P,"Right",g,tb)}
        if(t>2.9&&t<4)torso(K,P,0.05,0);if(t>5.4)K.ik(P,"Right",K.local(P,-0.22,0.95,0.3),0.8)};
      var R=XS.map(function(x){var r=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:2,rot:0},{texto:"cerrada",w:0.95,h:2.1,d:0.85,estado:"ok"});r.fijo=[x,0,ZN];return r});
      var et=K.etiqueta("","reloj",K.punto(x1,2.35,ZN+0.4));var e=reloj();
      return function(t){var a=t>3.2?Math.min(1,(t-3.2)/0.8):0;nv.userData.abrir(suave(a));if(t>4.6&&!bot.userData.tom){bot.userData.tom=1;K.agarrar(bot,P,"Right")}
        var s=Math.max(0,t-6)*24;R[1].set(t>10?"alerta":(t>3.2?"detecta":"ok"),t>3.2?"abierta":"cerrada");et.set(t>6?"abierta · "+Math.floor(s/60)+" min "+String(Math.floor(s%60)).padStart(2,"0")+" s":"",t>10?"reloj rojo":"reloj");et.el.hidden=t<6;
        e(t,10,"a",function(){K.evento("Nevera 2 abierta · más de 1 min 30 s","alerta")});K.contador("Puerta de entrada","abierta · desde 06:58");K.contador("Neveras abiertas",t>3.2?"1 de 4":"0 de 4");K.contador("Temperatura nevera 2",(4+Math.max(0,t-6)*0.35).toFixed(1).replace(".",",")+" °C")}}});

  def({id:"huecos",grupo:3,nombre:"Huecos en góndola",corta:"Cuánto de la góndola está surtido, en vivo.",estado:"en validación",
    desc:"Marca los huecos de la estantería y calcula el porcentaje de disponibilidad de cada zona. Un hueco tiene que verse un minuto seguido para reportarse.",
    video:{src:"evidencia/gondola.mp4",poster:"evidencia/gondola-poster.jpg",chapa:"clip de banco público"},
    dur:15,camara:{pos:[4,4,6],mira:[0,0.9,-1.4]},
    fases:[[0,"ok","Góndola surtida: disponibilidad alta"],[4,"detecta","Se van abriendo huecos: candidatos en naranja"],[9,"alerta","Confirmados: la disponibilidad baja y avisa para reponer"]],
    armar:function(K){var g=gondolaCerca(K,{familias:["cajas","cajas","cajas","cajas"]});var S=g.userData.slots,quita=[3,4,5,11,12,18,19,20,21,27].filter(function(i){return i<S.length});var R=quita.map(function(i){var s=S[i],wp=new THREE.Vector3();s.getWorldPosition(wp);var r=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:0.3,rot:0},{texto:"",w:0.26,h:0.3,d:0.1,estado:"detecta"});r.fijo=[wp.x,wp.y-0.02,wp.z+0.25];r.visible=false;return r});
      var P=persona(K,{ruta:[[0,-6,1.4],[3,-1,0.4],[8,-1,0.4,"idle",-1,-2],[11,6,2]]});var cesta=K.canastilla(0,0,0,0x2F64C8);P.sostener(cesta,"Left",[0,-0.3,0.1]);
      P.post=function(t){K.ik(P,"Left",K.local(P,0.3,0.75,0.05),0.8);var a=ventana(t,3.4,8,0.5,0.5);if(a>0){var k=Math.floor((t-3.4)/0.9)%quita.length,s=S[quita[k]];var tg=s.getWorldPosition(new THREE.Vector3());tg.y+=0.1;K.ik(P,"Right",tg,a*(0.5+0.5*Math.sin((t-3.4)/0.9*Math.PI*2-Math.PI/2)));torso(K,P,0.1*a,0)}};var e=reloj();
      return function(t){var n=0;quita.forEach(function(i,k){var tq=3.4+k*0.45;S[i].visible=t<tq;if(t>tq){n++;R[k].visible=true;R[k].set(t>tq+4?"alerta":"detecta",t>tq+4?"hueco":"")}});
        var disp=Math.round(100*(S.length-n)/S.length);K.contador("Disponibilidad",disp+" %");K.contador("Huecos confirmados",String(R.filter(function(r){return r.estado==="alerta"}).length));e(t,9,"a",function(){K.evento("Reponer góndola 4 · "+disp+" %","alerta")})}}});

  def({id:"vencido",grupo:3,nombre:"Producto vencido o por vencer",corta:"Lee la fecha y avisa lo que vence pronto.",
    desc:"Lee la fecha de vencimiento de los productos en exhibición. Marca en ámbar lo que vence en los próximos días y en rojo lo que ya venció, para retirarlo a tiempo.",
    dur:14,camara:{pos:[4,4,6],mira:[0,0.9,-1.4]},
    fases:[[0,"vigila","Lee la fecha de cada producto visible"],[4.5,"detecta","Tres productos vencen esta semana"],[8.5,"alerta","Uno ya está vencido: aviso para retirarlo"]],
    armar:function(K){var g=gondolaCerca(K,{familias:["cajas","cajas","latas","cajas"]});var S=g.userData.slots,av=[6,14,23].filter(function(i){return i<S.length}),ve=[16];function marca(i,est,txt){var wp=new THREE.Vector3();S[i].getWorldPosition(wp);var r=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:0.3,rot:0},{texto:txt,w:0.26,h:0.32,d:0.1,estado:est});r.fijo=[wp.x,wp.y-0.02,wp.z+0.25];r.visible=false;return r}
      var A=av.map(function(i){return marca(i,"detecta","vence 3 d")}),V=ve.map(function(i){return marca(i,"alerta","vencido")});var e=reloj();persona(K,{color:STAFF,ruta:[[0,7,2],[5,2.4,0.6],[9,2.4,0.6,"idle",0,-1.6],[14,7,2]]});
      return function(t){A.forEach(function(r,k){r.visible=t>4.5+k*0.4});V.forEach(function(r){r.visible=t>8.5});K.contador("Fechas leídas",String(Math.min(S.length,Math.floor(t*6))));K.contador("Por vencer",t>4.5?"3":"0");K.contador("Vencidos",t>8.5?"1":"0");
        e(t,8.5,"a",function(){K.evento("Producto vencido en góndola 4 · retirar","alerta")})}}});

  def({id:"destruccion",grupo:3,nombre:"Vencimiento y destrucción",corta:"Registra el producto que se bota, y cuadra la pérdida.",estado:"en desarrollo",
    desc:"Fija el contenedor de destrucción y sigue las manos. Cada producto que alguien bota queda registrado con su hora y su lote. Así la pérdida de mercancía deja de ser un faltante sin explicar: se sabe cuánto se destruyó y cuándo.",
    video:{src:"evidencia/destruccion.mp4",poster:"evidencia/destruccion-poster.jpg",chapa:"video de archivo · sin veredicto"},
    dur:15,camara:{pos:[5.2,3.4,4.6],mira:[1.0,0.8,-0.4]},camaraFranq:{pos:[3.6,3.0,3.4],mira:[0.3,0.7,-0.8]},
    fases:[[0,"vigila","El contenedor de destrucción y su boca quedan fijados"],[3,"detecta","Toma un producto vencido del carro"],[5.5,"detecta","Lo bota al contenedor: la mano entra cargada y sale vacía"],[6.4,"ok","Se registra la destrucción y la tabla de pérdida suma uno: 3 → 4 de 25"]],
    armar:function(K){var OX=window.MARCA==="franq";if(OX)trastiendaFranq(K,{canastas:false});else bodega(K);var verde=K.std(0x3E8E5A,{roughness:0.55});var bin=K.grupo(-0.6,-1.2,0);K.obst(bin);K.caja(0,0,0,1,0.06,0.8,verde,bin);K.caja(0,0,-0.38,1,0.95,0.04,verde,bin);K.caja(0,0,0.38,1,0.95,0.04,verde,bin);K.caja(-0.48,0,0,0.04,0.95,0.8,verde,bin);K.caja(0.48,0,0,0.04,0.95,0.8,verde,bin);
      K.cartel(0,0.6,0.405,0.8,0.18,"DESTRUCCIÓN","#E5484D","#fff",0,bin);var tapa=K.caja(0,0.95,-0.42,1,0.03,0.05,verde,bin);[[-0.45,-0.3],[0.45,-0.3],[-0.45,0.3],[0.45,0.3]].forEach(function(p){K.cil(p[0],-0.06,p[1],0.05,0.05,0.06,K.mat.goma,bin)});
      var car=K.grupo(1.6,-0.9,0);K.obst(car);K.caja(0,0.35,0,1,0.04,0.6,K.mat.acero,car);K.caja(0,0.75,0,1,0.04,0.6,K.mat.acero,car);[[-0.45,-0.25],[0.45,-0.25],[-0.45,0.25],[0.45,0.25]].forEach(function(p){K.caja(p[0],0,p[1],0.04,0.95,0.04,K.mat.acero,car);K.cil(p[0],-0.04,p[1],0.04,0.04,0.04,K.mat.goma,car)});
      var prods=[];for(var i=0;i<6;i++){var pb=K.prodCaja(0.09,0.2,0.09,(i*3)%14);pb.position.set(1.25+(i%3)*0.25,0.89,-1.05+Math.floor(i/3)*0.25);prods.push(pb)}
      if(OX)K.camara([2.8,2.6,1.6],[0,0.6,-1.2],{id:"CAM BODEGA",fov:66});else K.camara([2.4,2.8,0.8],[0,0.6,-1.2],{id:"CAM DESTRUCCIÓN",fov:66});
      var pr=prods[4],F=K.fisica(pr,{alto:0.1,suelo:function(p){return Math.abs(p.x+0.6)<0.46&&Math.abs(p.z+1.2)<0.36?0.06:0}});
      var P=persona(K,{color:STAFF,ruta:OX?[[0,0.2,3.2],[2.6,0.9,-0.4],[3.2,0.9,-0.4,"idle",1.6,-1],[4.6,0.5,-0.35],[7,0.5,-0.35,"idle",-0.6,-1.2],[10,0.2,3.2]]:[[0,5,2.4],[2.6,0.9,-0.4],[3.2,0.9,-0.4,"idle",1.6,-1],[4.6,0.5,-0.35],[7,0.5,-0.35,"idle",-0.6,-1.2],[10,5,3]]});
      P.post=function(t){var a=ventana(t,3,4.2,0.4,0.4);if(a>0&&t<3.8){var g=pr.getWorldPosition(new THREE.Vector3());g.y+=0.06;K.ik(P,"Right",g,a)}
        var b=ventana(t,4.6,5.9,0.35,0.35);if(b>0){var atr=t<5.3?Math.min(1,(t-4.6)/0.5):0,tg=atr>0?K.local(P,-0.35,1.2+0.2*atr,-0.1*atr):K.local(P,-0.1,1.35,0.55);K.ik(P,"Right",tg,b);torso(K,P,t>5.3?0.15:-0.05,0)}};
      var Rb=K.recuadro({raiz:bin,visible:true,alto:1,rot:0},{texto:"contenedor",w:1.1,h:1.05,d:0.9,estado:"ok"});Rb.fijo=[-0.6,0,-1.2];var Rp=K.recuadro(P,{texto:"persona",estado:"vigila"});
      var perd=3,e=reloj();K.tabla("Leche entera 1 L · lote 0912",["","Unidades"],[{c:["Compradas","25"]},{c:["Vendidas","18"]},{c:["En góndola","4"]},{c:["Pérdida registrada","3"],cls:"ambar"}]);
      return function(t){if(t>3.7&&!pr.userData.tom){pr.userData.tom=1;K.agarrar(pr,P,"Right")}if(t>5.45&&!pr.userData.lan){pr.userData.lan=1;var d=new THREE.Vector3(-0.6,0.4,-1.2);F.lanzar(F.hacia(d,0.55),new THREE.Vector3(4,1,6))}
        e(t,6.4,"r",function(){perd=4;K.evento("Destrucción registrada · leche 1 L · lote 0912","")});
        Rp.set(t>6.4?"ok":(t>3.7?"detecta":"vigila"),t>6.4?"mano vacía":(t>3.7?"mano cargada":"persona"));Rb.set(t>5.5&&t<6.4?"detecta":"ok");
        K.tabla("Leche entera 1 L · lote 0912",["","Unidades"],[{c:["Compradas","25"]},{c:["Vendidas","18"]},{c:["En góndola",t>6.4?"3":"4"]},{c:["Pérdida registrada",perd===4?"3 → 4":"3"],cls:perd===4?"nuevo":"ambar"},{c:["Sin explicar",perd===4?"0":"0"]}]);
        K.contador("Destrucciones hoy",t>6.4?"12":"11")}}});

  def({id:"bodega",grupo:3,nombre:"Almacenamiento en bodega",corta:"Ocupación de racks y mercancía fuera de su lugar.",
    desc:"Calcula cuánto de cada rack está ocupado y avisa de la estiba que queda en un pasillo o en una zona que no le corresponde.",
    dur:15,camara:{pos:[10,9,11],mira:[0,0.6,-0.5]},
    fases:[[0,"vigila","Mide la ocupación de cada rack"],[5,"detecta","Una estiba queda fuera de su zona"],[9.5,"alerta","Sigue en el pasillo de circulación: aviso"]],
    armar:function(K){bodega(K,{montacargas:false});var r1=K.rack(-4,-3.6,5,0,{vacios:[2,5]}),r2=K.rack(2.4,-3.6,5,0,{vacios:[0,1,6,7,8]});K.camara([7,4,3.6],[0,0.4,-1.2],{id:"CAM BODEGA 3"});
      var est=K.estiba(0,0,0,2);est.userData.obst=false;var mc=K.montacargas(0,0,0);mc.userData.obst=false;K.caja(0,0.1,0,0.02,0.02,0.02,K.mat.goma);
      var Z=K.zona([[-7.4,0.8],[7.4,0.8],[7.4,4],[-7.4,4]],{estado:"vigila",op:0.08});var R=K.recuadro({raiz:est,visible:true,alto:1,rot:0},{texto:"estiba",w:1.3,h:0.85,d:1.1,estado:"vigila"});var e=reloj();
      var op=persona(K,{color:STAFF,ruta:[[0,-6,3.6],[6,-6,3.6,"idle",-5,2],[8,-5,2.2],[15,-5,2.2,"idle",0,2.2]]});
      return function(t){var x=t<3?6:(t<5?lerp(6,1,(t-3)/2):1);est.position.set(x,t<5.2?0.12:0,2.2);mc.position.set(x+1.5,0,2.2);mc.rotation.y=-Math.PI/2;if(t>5.2)mc.position.x=lerp(2.5,7,(t-5.2)/3);mc.visible=t<9;R.fijo=[x,0,2.2];R.set(t>9.5?"alerta":(t>5?"detecta":"vigila"),t>9.5?"en pasillo · 4 min":"estiba");Z.set(t>9.5?"alerta":"vigila",t>9.5);
        K.contador("Rack A",Math.round(100*13/15)+" %");K.contador("Rack B",Math.round(100*10/15)+" %");e(t,9.5,"a",function(){K.evento("Estiba en pasillo de circulación","alerta")})}}});

  def({id:"racks",grupo:3,nombre:"Sobrecarga en racks",corta:"Avisa cuando un rack queda sobrecargado.",estado:"en validación",
    desc:"Cajas apiladas por encima del último nivel o que sobresalen por los costados. La zona de cada rack se dibuja una vez y el sistema la vigila solo.",
    video:{img:"evidencia/rack.jpg",chapa:"bodega real"},
    dur:14,camara:{pos:[9,8,10],mira:[0,1.4,-2]},camaraFranq:{pos:[3.2,3.3,3.6],mira:[-0.8,1.0,-1.2]},
    fases:OXD?[[0,"ok","Racks de la trastienda con carga en orden; una torre de cajas mal apilada en el piso"],[4,"detecta","Se apilan cajas encima del último nivel del rack 1"],[7.5,"alerta","Invaden la franja prohibida bajo el techo: aviso"]]
      :[[0,"ok","Racks con carga en orden"],[4,"detecta","Se apilan cajas encima del último nivel"],[7.5,"alerta","Invaden la franja prohibida bajo el techo: aviso"]],
    armar:function(K){var OX=window.MARCA==="franq";var pila=[],R,Z,Rt;
      if(OX){trastiendaFranq(K,{rack:false,canastas:false});K.rack(-1.6,-1.6,3.0,0,{niveles:3,alto:2.2});K.rack(2.0,-1.6,2.4,0,{niveles:3,alto:2.2});K.camara([3.2,2.9,1.8],[-0.4,1.4,-1.6],{id:"CAM BODEGA",fov:70});
        for(var i=0;i<4;i++)pila.push(K.caja(-2.5+i*0.62,2.3,-1.6,0.58,0.45,0.8,K.mat.carton));var ct=K.caja(-1.9,2.75,-1.62,0.58,0.4,0.8,K.mat.carton);ct.rotation.z=0.12;pila.push(ct);
        R=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:1,rot:0},{texto:"rack 1",w:3.3,h:3.25,d:1.3,estado:"ok"});R.fijo=[-1.6,0,-1.6];Z=K.zona([[-3.2,-2.3],[0,-2.3],[0,-0.9],[-3.2,-0.9]],{estado:"alerta",op:0.12,y:2.3});
        var tp=K.grupo(-0.2,0.6,0);for(var k=0;k<4;k++){var b=K.prodCaja(0.55,0.45,0.5,(k*5)%14,tp);b.position.set(-0.28+k*0.1,0.225+k*0.44,k*0.04);b.rotation.set(0,k*0.18,k*0.07)}
        for(var k2=0;k2<2;k2++){var b2=K.prodCaja(0.55,0.45,0.5,(k2*3+7)%14,tp);b2.position.set(0.36-k2*0.07,0.225+k2*0.44,-0.06);b2.rotation.set(0,-0.25,-0.1*k2)}K.obst(tp);
        Rt=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:1.9,rot:0},{texto:"apilado inestable",w:1.5,h:1.9,d:0.9,estado:"alerta"});Rt.fijo=[-0.2,0,0.6];
        persona(K,{color:STAFF,ruta:[[0,0.4,3.2],[4,-1.9,0.3],[14,-1.9,0.3,"idle",-1.6,-1.6]]})}
      else{bodega(K);K.rack(-1.6,-3,5,0);K.rack(4,-3,4,0);K.camara([5,3.8,2],[-1,1.8,-3],{id:"CAM RACKS",fov:70});
        for(var i2=0;i2<3;i2++)pila.push(K.caja(-2.6+i2*0.9,3.25,-3,0.8,0.55,0.9,K.mat.carton));pila.push(K.caja(-2.2,3.8,-3,0.8,0.5,0.9,K.mat.carton));
        R=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:1,rot:0},{texto:"rack 1",w:5.2,h:4.6,d:1.3,estado:"ok"});R.fijo=[-1.6,0,-3];
        Z=K.zona([[-4.2,-3.7],[1,-3.7],[1,-2.3],[-4.2,-2.3]],{estado:"alerta",op:0.12,y:3.3});persona(K,{color:STAFF,ruta:[[0,6,3],[4,-1.6,0.2],[14,-1.6,0.2,"idle",-1.6,-3]]})}
      var e=reloj();
      return function(t){pila.forEach(function(c,i){c.visible=t>3.6+i*0.8});R.set(t>7.5?"alerta":(t>4?"detecta":"ok"),t>7.5?"sobrecarga · 0,97":"rack 1");Z.set(t>7.5?"alerta":"vigila",t>7.5);e(t,7.5,"a",function(){K.evento("Sobrecarga en rack 1","alerta")});
        if(OX){Rt.set(t>1.5?"alerta":"detecta","apilado inestable");K.contador("Pilas inestables en piso","1");e(t,1.5,"b",function(){K.evento("Cajas mal apiladas en el piso · riesgo de caída","alerta")})}}}});

  def({id:"pasillos",grupo:3,nombre:"Pasillos libres",corta:"Avisa de lo que se queda estorbando el paso.",estado:"en validación",
    desc:"Separa a las personas de los objetos y solo avisa de lo que se queda: cajas, carros o canastas en el suelo. Espera 30 segundos antes de confirmar.",
    video:{img:"evidencia/pasillo-4-camara-nueva.jpg",chapa:"cámara nunca vista"},
    dur:16,camara:{pos:[8,7,10],mira:[0,0.4,0]},
    fases:[[0,"vigila","El pasillo está libre"],[3.4,"detecta","Dejan una caja: candidato con su cuenta atrás"],[8.4,"alerta","Pasan 30 s: obstáculo confirmado"],[13,"ok","La retiran y el evento se cierra solo"]],
    armar:function(K){tienda(K);K.camara([7,3,3],[0,0,-0.3],{id:"CAM PASILLO 2"});var cj=K.caja(1.6,0,0.6,0.6,0.5,0.5,K.mat.carton);cj.userData.obst=false;var P=persona(K,{color:STAFF,ruta:[[0,-6,1],[3,1.2,0.9],[3.6,1.2,0.9,"idle",1.6,0.6],[6,6,3],[11,6,3],[12.6,1.4,0.9],[13.4,1.4,0.9,"idle",1.6,0.6],[16,-6,1]]});
      P.post=function(t){var c=ventana(t,0,3.2,0.1,0.4)+ventana(t,13.2,16,0.4,0.1);if(c>0){K.ik(P,"Right",K.local(P,-0.22,0.9,0.42),c);K.ik(P,"Left",K.local(P,0.22,0.9,0.42),c)}var ag=ventana(t,2.9,3.6,0.3,0.3)+ventana(t,12.6,13.4,0.3,0.3);if(ag>0){torso(K,P,0.45*ag,0)}};
      var R=K.recuadro({raiz:cj,visible:true,alto:0.5,rot:0},{texto:"",w:0.7,h:0.55,d:0.6,estado:"detecta"}),otro=persona(K,{ruta:[[4,6,2],[10,-6,2]]});K.recuadro(otro,{texto:"persona",estado:"vigila"});var e=reloj();
      return function(t){var on=t>3.4&&t<13.2;cj.visible=on||t<3.4;if(t<3.4||t>13.2){var hp=K.manoPos(P,"Right");cj.position.set(hp.x,hp.y-0.1,hp.z);cj.rotation.y=P.rot}else{cj.position.set(1.6,0.25,0.6);cj.rotation.y=0.3}if(t>13.2)cj.visible=t<16;R.fijo=[1.6,0,0.6];R.visible=on;
        var s=Math.max(0,(t-3.4)*6);R.set(t>8.4?"alerta":"detecta",t>8.4?"obstáculo · "+Math.round(s)+" s":Math.round(s)+" s");e(t,8.4,"a",function(){K.evento("Obstáculo en pasillo 2","alerta")});e(t,13.2,"b",function(){K.evento("Pasillo 2 despejado · 4 min 50 s","")})}}});

  def({id:"exhibicion",grupo:3,nombre:"Verificación de exhibición",corta:"Compara la exhibición con el planograma.",
    desc:"Compara cómo está armada la exhibición con la foto de referencia acordada: orden, frentes y material de punto de venta. Avisa de lo que no cumple.",
    dur:14,camara:{pos:[5,4.5,7],mira:[0,1,-1.4]},
    fases:[[0,"vigila","Se carga el planograma acordado"],[4,"ok","Frentes y orden coinciden"],[8,"alerta","Un producto está fuera de su lugar y falta el aviso de precio: no cumple"]],
    armar:function(K){var g=gondolaCerca(K,{color:0x2F7BEA});var S=g.userData.slots;pintarSlot(K,S[9],K.std(0xD94F3D,{roughness:0.5}));var cart=K.cartel(0,2.3,-1.55,2.4,0.4,"OFERTA","#D6AB4C","#001441");
      var R=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:1,rot:0},{texto:"planograma",w:6.2,h:2,d:0.9,estado:"vigila"});R.fijo=[0,0,-1.6];var wp=new THREE.Vector3();S[9].getWorldPosition(wp);
      var Rx=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:0.3,rot:0},{texto:"fuera de lugar",w:0.26,h:0.32,d:0.1,estado:"alerta"});Rx.fijo=[wp.x,wp.y-0.02,wp.z+0.25];Rx.visible=false;var e=reloj();persona(K,{color:STAFF,ruta:[[0,6,2],[4,2.6,0.4],[14,2.6,0.4,"idle",0,-1.6]]});
      return function(t){cart.visible=t<6;R.set(t>8?"alerta":(t>4?"ok":"vigila"),t>8?"no cumple · 92 %":(t>4?"cumple · 100 %":"planograma"));Rx.visible=t>8;K.contador("Cumplimiento",t>8?"92 %":(t>4?"100 %":"—"));e(t,8,"a",function(){K.evento("Exhibición no cumple el planograma","alerta")})}}});

  def({id:"trazabilidad",grupo:3,nombre:"Trazabilidad góndola–caja",corta:"Cruza lo que se tomó con lo que se pagó.",
    desc:"Sigue a la persona desde la góndola hasta la caja: cuenta los productos que tomó y los compara con los que pasaron por el registro.",
    dur:18,camara:{pos:[10,10,12],mira:[0,0.4,0]},camaraFranq:{pos:[8,8,9],mira:[1.5,0.4,-2.2]},
    fases:[[0,"vigila","Toma productos en la góndola: se cuentan"],[8,"detecta","Llega a la caja con lo que tomó"],[12,"alerta","Se registran 2 de 3: aviso de diferencia"]],
    armar:function(K){var OX=window.MARCA==="franq";var g;if(OX){tienda(K,{gondolas:false,exhibidor:false});g=K.gondola(-3,-2.6,5,0,{unaCara:true,alto:1.55,familias:["cajas","cajas","bolsas","cajas"],letrero:"GALLETAS"});persona(K,{color:STAFF,ruta:[[0,7.05,-2.4,"idle",5,-2.4]]});K.camara([1.6,3.4,2.4],[2,0.4,-2.4],{id:"CAM SALA",fov:82})}
      else{tienda(K,{gondolas:false});g=K.gondola(-3,-2.6,5,0,{unaCara:true,familias:["cajas","cajas","bolsas","cajas"]});K.cajaRegistro(3.4,1.6,0,{n:4});persona(K,{color:STAFF,ruta:[[0,3.4,0.8,"idle",3.4,3]]});K.camara([6.4,3.4,-3.6],[0,0,0.6],{id:"CAM SALA",fov:82})}
      var P=persona(K,{ruta:OX?[[0,-7,0],[2.4,-3.6,-1.6],[6,-3.6,-1.6,"idle",-3.6,-3],[9,5.4,-2.4],[14,5.4,-2.4,"idle",7,-2.4],[18,4.6,7]]:[[0,-7,0],[2.4,-3.6,-1.6],[6,-3.6,-1.6,"idle",-3.6,-3],[9,3.2,2.6],[14,3.2,2.6,"idle",3.4,1.6],[18,7,4]]});P.sinAuto=true;var cesta=K.canastilla(0,0,0,0xD94F3D);P.sostener(cesta,"Left",[0,-0.3,0.1]);
      P.post=function(t){K.ik(P,"Left",K.local(P,0.3,0.75,0.05),0.8);[2.8,4,5.2].forEach(function(tt,i){var a=ventana(t,tt-0.6,tt+0.5,0.4,0.4);if(a>0){var s=g.userData.slots[5+i];var tg=t<tt?s.getWorldPosition(new THREE.Vector3()):K.local(P,0.25,0.9,0.15);tg.y+=0.1;K.ik(P,"Right",tg,a)}});if(t>9.5&&t<13){K.ik(P,"Right",K.local(P,-0.2,0.95,0.45),ventana(t,9.5,13,0.5,0.5))}};
      var R=K.recuadro(P,{texto:"ID 31"});var e=reloj(),tomo=0,pago=0;
      return function(t){[2.8,4,5.2].forEach(function(tt,i){e(t,tt,"t"+i,function(){tomo++;g.userData.slots[5+i].visible=false;K.evento("ID 31 tomó un producto","")})});[10,11].forEach(function(tt,i){e(t,tt,"p"+i,function(){pago++})});
        K.contador("Tomó en góndola",String(tomo));K.contador("Registró en caja",String(pago));R.set(t>12?"alerta":(t>8?"detecta":"vigila"),t>12?"diferencia: 1":"ID 31");e(t,12,"a",function(){K.evento("Diferencia góndola–caja · 1 producto","alerta")})}}});

  def({id:"autopago",grupo:3,nombre:"Validación de autopago",corta:"Verifica que todo lo que pasa por el autopago se escanee.",
    desc:"Mira cada producto que pasa por la zona de escaneo del autopago y lo cruza con lo que registró la máquina. El que pasa sin escanear dispara el aviso.",
    dur:15,camara:{pos:[5,5,7],mira:[0,1,-0.6]},
    fases:[[0,"vigila","Cada producto que pasa por el lector se cruza con el registro"],[4,"ok","Escaneados: coinciden"],[8.6,"alerta","Un producto pasa por fuera del lector: aviso al supervisor"]],
    armar:function(K){tienda(K,{gondolas:false});[-2.2,2.2].forEach(function(x){var k=K.grupo(x,-1.2);K.caja(0,0,0,1.6,0.9,0.7,K.mat.blanco,k);K.caja(0,0.9,0,1.6,0.03,0.7,K.mat.negro,k);K.pc(0.5,0.93,-0.2,0,k);K.caja(-0.3,0.93,0,0.3,0.03,0.3,K.std(0x2F7BEA,{emissive:0x2F7BEA,emissiveIntensity:0.4}),k);K.caja(0.72,0.93,0.1,0.1,0.14,0.08,K.mat.negro,k)});
      var k=K.grupo(0,-1.2);K.caja(0,0,0,1.6,0.9,0.7,K.mat.blanco,k);K.caja(0,0.9,0,1.6,0.03,0.7,K.mat.negro,k);K.pc(0.5,0.93,-0.2,0,k);K.caja(-0.3,0.93,0,0.3,0.03,0.3,K.std(0x2F7BEA,{emissive:0x2F7BEA,emissiveIntensity:0.4}),k);K.caja(0.72,0.93,0.1,0.1,0.14,0.08,K.mat.negro,k);
      K.cartel(0,2.3,-1.6,1.4,0.3,"AUTOPAGO","#001441","#D6AB4C");K.cil(0,0,-1.6,0.02,0.02,2.3,K.mat.aceroOsc);
      K.camara([1.6,2.6,0.6],[0,0.9,-1.2],{id:"CAM AUTOPAGO",fov:62});var Z=K.zona([[-0.5,-1.4],[-0.1,-1.4],[-0.1,-1],[-0.5,-1]],{estado:"ok",y:0.93});
      var P=persona(K,{ruta:[[0,-5,2],[3,-0.2,-0.3],[15,-0.2,-0.3,"idle",-0.2,-2]]}),pr=producto(K,0xD94F3D,2);P.sostener(pr,"Right",[0,0.1,0.06]);var cesta=K.canastilla(0,0,0,0x3EA66B);P.sostener(cesta,"Left",[0,-0.3,0.1]);var R=K.recuadro(P,{texto:"cliente"});var e=reloj(),esc=0;
      P.post=function(t){K.ik(P,"Left",K.local(P,0.3,0.75,0.05),0.8);[4,5.4,6.8,8.6].forEach(function(tt){var a=ventana(t,tt-0.9,tt+0.5,0.4,0.4);if(a>0){var tg=t<tt-0.3?K.local(P,0.2,0.95,0.3):(tt<8?new THREE.Vector3(-0.3,1.05,-1.2):new THREE.Vector3(0.5,1.1,-1.0));K.ik(P,"Right",tg,a)}});};
      return function(t){[4,5.4,6.8].forEach(function(tt,i){e(t,tt,"s"+i,function(){esc++;K.evento("Escaneado · "+["leche","pan","café"][i],"")})});var idx=Math.min(3,Math.max(0,Math.floor((t-3.4)/1.4)));pr.material=K.std([0x3EA66B,0xF2C230,0x8E5BC8,0xD94F3D][idx]);
        K.contador("Pasaron por la zona",String(esc+(t>8.6?1:0)));K.contador("Registrados",String(esc));R.set(t>8.6?"alerta":"vigila",t>8.6?"sin escanear":"cliente");Z.set(t>8.6?"alerta":"ok",t>8.6);e(t,8.6,"a",function(){K.evento("Producto sin escanear · autopago 2","alerta")})}}});

  def({id:"zonaCiega",grupo:3,nombre:"Zona ciega",corta:"Muestra lo que ninguna cámara ve, y quién entra ahí.",
    desc:"Arma el mapa de cobertura de todas las cámaras sobre el plano y marca los puntos ciegos. Cuando alguien entra a uno, lo sigue por estimación y avisa si tarda en reaparecer.",
    dur:16,camara:{pos:[2,15,11],mira:[0,0,0]},sinPip:true,
    fases:[[0,"vigila","Se proyecta lo que cubre cada cámara"],[4,"detecta","Queda a la vista el punto que nadie ve"],[10,"alerta","Alguien entra y no reaparece: aviso de zona ciega"]],
    armar:function(K){tienda(K);K.camara([-7.6,3.2,4.8],[0,0,-1],{id:"CAM 01",alcance:9});
      var Z1=K.zona([[-7.6,-5.2],[0.6,-5.2],[0.6,5.2],[-7.6,5.2]],{estado:"ok",op:0.12}),Z2=K.zona([[3.8,-5.2],[7.8,-5.2],[7.8,5.2],[3.8,5.2]],{estado:"ok",op:0.12}),Zc=K.zona([[0.6,-5.2],[3.8,-5.2],[3.8,5.2],[0.6,5.2]],{estado:"alerta",op:0.0});
      var P=persona(K,{ruta:[[0,-6,3],[4,-0.2,1.4],[6,2.2,0.6],[16,2.2,0.6,"idle",2.2,-1]]});var R=K.recuadro(P,{texto:"ID 44"});var e=reloj();persona(K,{ruta:[[0,7,3.6],[8,-7,3.8]]});
      return function(t){Zc.op=t>4?0.28:0;Zc.set(t>10?"alerta":"detecta",t>10);var dentro=P.raiz.position.x>0.6&&P.raiz.position.x<3.8;R.set(dentro?"detecta":"vigila",dentro?"sin imagen · estimado":"ID 44");P.raiz.traverse(function(m){if(m.isMesh)m.material.opacity=dentro?0.35:1});
        K.contador("Cobertura del local",t>4?"71 %":"—");K.contador("Puntos ciegos",t>4?"1":"—");e(t,10,"a",function(){K.evento("ID 44 lleva 30 s en zona ciega","alerta")})}}});

  def({id:"apertura",grupo:1,nombre:"Apertura de tienda",corta:"Registra a qué hora abre cada tienda y si fue puntual.",hora:25075,
    desc:"La cámara de la entrada sabe si la puerta está cerrada o abierta y a qué hora cambia. Cada mañana registra la hora real de apertura, la compara con la meta de la tienda y guarda el video del momento; si a la hora pactada sigue cerrada, avisa.",
    dur:16,camara:{pos:[4.6,3.6,12.8],mira:[4.6,1.1,3.2]},camaraFranq:{pos:[4.6,3.4,12.8],mira:[4.6,1.2,3.5]},
    fases:[[0,"vigila","06:55 · puerta cerrada; la meta de apertura es 07:00"],[3,"detecta","Llega el encargado y abre la puerta"],[5.5,"ok","Apertura registrada a las 06:58 · puntual"],[10,"ok","Entran los primeros clientes: la tienda opera"]],
    armar:function(K){tienda(K,{canastas:false});var pu=K.puerta(4.6,4.6,2.2,0);pu.userData.abrir(0);K.antihurto(4.6,3.9,2.2,0);K.camara([4.6,2.8,1.4],[4.6,1,5],{id:"CAM ENTRADA",fov:80});
      var Z=K.zona([[3.4,3.6],[5.8,3.6],[5.8,5.4],[3.4,5.4]],{estado:"vigila"});
      var E1=persona(K,{color:STAFF,ruta:[[0,4.6,9],[3,4.6,6.3],[5.2,4.6,6.3,"idle",4.6,3],[7.5,4.6,2.4],[16,6.3,-0.6,"idle",6.3,-2.4]]});K.recuadro(E1,{texto:"personal"});
      var C=gente(K,[{ruta:[[0,-1.5,9.5],[9,4.2,6.8],[12.5,4.5,2.4],[16,1.6,0.4]]},{ruta:[[0,10.5,9.8],[11,5.2,7.0],[14.5,4.8,2.6],[16,3.8,0.5]]}]);C.forEach(function(p){K.recuadro(p,{texto:"cliente"})});var e=reloj();
      return function(t){var a=t<4.5?0:Math.min(1,(t-4.5)/1.0);pu.userData.abrir(suave(a));Z.set(t>5.5?"ok":(t>3?"detecta":"vigila"),false);
        e(t,3,"l",function(){K.evento("Encargado en la puerta · 06:58","detecta")});e(t,5.5,"a",function(){K.evento("Apertura registrada · 06:58 · meta 07:00 · puntual","ok")});e(t,12.5,"c",function(){K.evento("Primer cliente adentro · 07:06","")});
        K.contador("Estado de la puerta",t>5.5?"abierta":"cerrada");K.contador("Hora de apertura",t>5.5?"06:58":"—");K.contador("Meta","07:00");K.contador("Puntualidad del mes",t>5.5?"24 de 25 días":"23 de 24 días")}}});

  def({id:"cierre",grupo:1,nombre:"Cierre de puerta sin autorización",corta:"Avisa si la puerta se cierra en horario comercial.",hora:55316,
    desc:"Dentro del horario de atención la puerta debe estar abierta. Si se cierra y nadie lo autorizó, cuenta cuánto lleva cerrada, muestra a quién la cerró y avisa; además registra a los clientes que llegaron y no pudieron entrar.",
    dur:16,camara:{pos:[4.6,3.0,-1.2],mira:[4.6,1.1,5.2]},camaraFranq:{pos:[3.2,2.9,-0.6],mira:[4.8,1.1,5.4]},
    fases:[[0,"ok","15:18 · horario comercial, puerta abierta"],[4,"detecta","Un empleado cierra la puerta sin autorización"],[8,"detecta","Llega un cliente y no puede entrar"],[11,"alerta","Lleva 3 min cerrada en horario comercial: aviso al supervisor"]],
    armar:function(K){tienda(K,{canastas:false});var pu=K.puerta(4.6,4.6,2.2,0);pu.userData.abrir(1);K.antihurto(4.6,3.9,2.2,0);K.camara([4.6,2.8,1.4],[4.6,1,5],{id:"CAM ENTRADA",fov:80});
      var Z=K.zona([[3.4,3.6],[5.8,3.6],[5.8,5.4],[3.4,5.4]],{estado:"ok"});
      var E1=persona(K,{color:STAFF,ruta:[[0,6.3,-0.6],[3.5,5.6,3.4],[5.5,5.6,3.4,"idle",4.6,4.6],[8,6.6,0.2],[16,6.3,-0.6,"idle",6.3,-2.4]]});K.recuadro(E1,{texto:"personal"});
      var C1=persona(K,{ruta:[[0,4.6,12],[8,4.6,6.4],[11.5,4.6,6.4,"idle",4.6,4],[15,2,11]]});var R1=K.recuadro(C1,{texto:"cliente"});
      var otros=gente(K,[{ruta:[[0,-1.6,0.6],[6,-1.6,0.6,"idle",-1.6,-1.6],[16,-3.4,1.2]]},{ruta:[[0,1.4,0.5],[16,1.4,0.5,"idle",1.4,-1.6]]}]);var e=reloj();
      return function(t){var c=t<4.3?1:1-Math.min(1,(t-4.3)/1.0);pu.userData.abrir(suave(c));var mins=Math.max(0,t-5.3)*36;
        Z.set(t>11?"alerta":(t>5.3?"detecta":"ok"),t>11);R1.set(t>9?"detecta":"vigila",t>9?"no pudo entrar":"cliente");
        e(t,4.3,"c",function(){K.evento("Puerta cerrada por personal · 15:22 · horario comercial","detecta")});e(t,9,"k",function(){K.evento("Cliente en la puerta cerrada · 15:22","detecta")});e(t,11,"a",function(){K.evento("Cierre sin autorización · 3 min · aviso al supervisor","alerta")});
        K.contador("Estado de la puerta",t>5.3?"cerrada":"abierta");K.contador("Horario de atención","07:00 – 23:00");K.contador("Cerrada hace",t>5.3?Math.floor(mins/60)+" min "+String(Math.floor(mins%60)).padStart(2,"0")+" s":"—");K.contador("Clientes que no entraron",t>9?"1":"0")}}});

  window.GRUPOS=[
    {n:"Comercial y comportamental",d:"Quién entra, qué mira y cuánto se queda. Las cifras con las que se decide la tienda.",c:"oro"},
    {n:"Operativo y de eficiencia",d:"Filas, aforo, parqueadero, personal y piso limpio: la operación del día, medida sola.",c:"azul"},
    {n:"Prevención y riesgo",d:"Lo que tiene que avisar en el acto: intrusos, armas, caídas, peleas, fuego y hurto.",c:"rojo"},
    {n:"Modelos lite · bajo costo",d:"Analíticas livianas sobre una sola cámara: góndolas, bodega, puertas, autopago.",c:"verde"}];
})();
