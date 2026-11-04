/* Emparejamiento 3D ↔ video · prevencion-b (ocultaProd, armas, blancas2, peleas, fuego, abandono, rostro, activos).
   Ver sync/base.js. Cada escena copia el encuadre, el lugar, los actores y los segundos de su clip en
   evidencia-publica/prevencion/<id>.mp4 (créditos en evidencia-publica/prevencion/CREDITS-prevencion-b.md). */
(function(){
  "use strict";
  var U=window.ESC_UTIL,S=window.ESC_SYNC,C=window.MOTOR.COL;
  if(!U||!S)return;
  var reloj=U.reloj,lerp=U.lerp,persona=U.persona,ventana=function(t,a,b,s,d){s=s||0.4;d=d||s;if(t<a||t>b)return 0;return Math.min(1,(t-a)/s,(b-t)/d)},
    cabeza=U.cabeza,torso=U.torso,nervioso=U.nervioso,cuchillo=U.cuchillo,arma=U.arma,producto=U.producto;
  var FRANQ=window.MARCA==="franq"; // la presentación de franquicia conserva sus escenas propias
  var DIR="evidencia-publica/prevencion/";
  function v(id,o){o.src=DIR+id+".mp4";o.poster=DIR+id+"-poster.jpg";return S.video(id,o)}

  /* ---------- sala de monitoreo del laboratorio propio (mismo cuarto en blancas2 y ocultaProd) ----------
     Cámara en la esquina delantera izquierda, alta, mirando en diagonal: a la izquierda el ventanal, al fondo el
     tablero blanco grande sobre patas, en el centro las mesas con monitores, a la derecha la pared con el extintor. */
  function laboratorio(K,o){o=o||{};var w=12,d=10;
    K.piso(w,d,K.pbr("tiles",{roughness:0.9,color:0xC9C5BC,w:w,d:d}));
    var blanco=K.std(0xEDEDEA,{roughness:0.85}),gris=K.std(0x3A3E46,{roughness:0.6}),vid=K.std(0xBFD3E6,{transparent:true,opacity:0.4,roughness:0.05,metalness:0.2});
    K.muro(-w/2,-d/2,w/2,-d/2,3.3,blanco);K.muro(-w/2,-d/2,-w/2,d/2,3.3,blanco);K.muro(w/2,-d/2,w/2,d/2,3.3,blanco);
    // ventanal a la izquierda y al fondo (marcos oscuros), ventanas altas a la derecha al fondo
    for(var z=-d/2+0.6;z<d/2-0.4;z+=1.3){K.caja(-w/2+0.1,0.5,z,0.04,2.4,1.2,vid);K.caja(-w/2+0.12,0.5,z-0.62,0.06,2.4,0.06,gris)}
    for(var x=-w/2+0.8;x<w/2-0.6;x+=1.5){K.caja(x,1.0,-d/2+0.1,1.4,1.9,0.04,vid);K.caja(x-0.72,1.0,-d/2+0.12,0.06,1.9,0.06,gris)}
    for(z=-d/2+0.8;z<-1;z+=1.4){K.caja(w/2-0.1,1.4,z,0.04,1.3,1.3,vid);K.caja(w/2-0.12,1.4,z-0.66,0.06,1.3,0.06,gris)}
    K.caja(0,3.3,0,w,0.06,d,K.std(0x2B2F36,{roughness:0.8}));// cielo raso oscuro
    K.caja(-5.55,0,0.4,0.7,3.3,0.8,blanco);// columna blanca junto al ventanal
    // mesón bajo a lo largo del ventanal, adelante a la izquierda (el «mesón marcado» del clip de hurto)
    var mes=K.caja(-5.55,0,1.7,0.7,0.8,2.6,K.std(0x8A6440,{roughness:0.6}));K.obst(mes);
    // tablero blanco grande sobre patas, de frente a la cámara
    var tb=K.grupo(-0.9,-2.9,0);K.caja(0,0.95,0,4.6,1.55,0.08,K.std(0xF7F7F5,{roughness:0.35}),tb);K.caja(0,0.92,0,4.7,0.05,0.12,gris,tb);K.caja(0,2.5,0,4.7,0.05,0.12,gris,tb);
    [-2.2,2.2].forEach(function(xx){K.caja(xx,0,0,0.06,2.55,0.06,gris,tb)});K.caja(0,0,0.3,1.2,0.75,0.5,gris,tb);K.obst(tb);
    // mesas de trabajo con monitores, en diagonal hacia el fondo a la derecha
    var mad=K.std(0xB98B5E,{roughness:0.6}),G=K.grupo(0.9,0.6,o.giro!=null?o.giro:-12);K.obst(G);
    function fila(z,x0,x1){var L=x1-x0,cx=(x0+x1)/2;K.caja(cx,0.72,z,L,0.04,1.2,mad,G);[x0+0.1,x1-0.1].forEach(function(xx){[z-0.5,z+0.5].forEach(function(zz){K.caja(xx,0,zz,0.05,0.72,0.05,gris,G)})});
      for(var xx=x0+0.6;xx<x1-0.3;xx+=1.2){K.pc(xx,0.76,z-0.2,180,G);var s=K.grupo(xx,z-0.85,0,G);K.caja(0,0.45,0,0.5,0.08,0.48,K.mat.negro,s);K.caja(0,0.5,-0.22,0.48,0.6,0.06,K.mat.negro,s);K.cil(0,0,0,0.03,0.03,0.45,K.mat.aceroOsc,s)}}
    fila(0,-3,3);fila(-2.2,-2.4,3.4);
    for(var k=0;k<8;k++)K.caja(-3.6+k*0.4,0,2.0,0.2,0.006,0.12,K.std(k%2?0x1C1E22:0xF2C230,{roughness:0.6}),G);// cinta amarilla y negra
    K.extintor(w/2-0.12,0.6,0.2,-90);
    G.updateMatrixWorld(true);
    return{w:w,d:d,pos:function(lx,lz){var p=new THREE.Vector3(lx,0,lz).applyMatrix4(G.matrixWorld);return[+p.x.toFixed(2),+p.z.toFixed(2)]}}}
  function camLab(K){K.camara([-4.7,3.0,4.2],[0.2,-0.3,-1.4],{id:"CAM SALA",fov:64})}

  /* ---------- blancas2 · clip del laboratorio propio, 15,7 s; alarma confirmada a los 5,6 s ---------- */
  if(!FRANQ)S.redef({id:"blancas2",grupo:2,nombre:"Armas blancas",corta:"Cuchillos, machetes y objetos cortantes.",estado:"en validación",
    desc:"Cuando un cuchillo, una daga o un machete aparece y se sostiene unos fotogramas, salta la alarma en un tercio de segundo. Además sigue el comportamiento previo: mirar a todos lados y llevarse la mano a la cintura.",
    dur:15.7,camara:{pos:[-2,7.5,9],mira:[1.5,0.6,-0.8]},
    fases:[[0,"vigila","Entra por el fondo de la sala, junto al ventanal"],[3.2,"detecta","Se detiene y se lleva la mano a la cintura"],[5.6,"alerta","Confirmado «cuchillo» en la mano: aviso para verificar"],[9.5,"alerta","Se acerca al puesto con el cuchillo a la vista"]],
    armar:function(K){laboratorio(K);camLab(K);
      var sen=persona(K,{color:0x2A2D33,ruta:[[0,1.6,1.7,"idle",2.6,0.6]]});sen.post=function(t){K.gesto(sen,"agacharse",t,0.55);torso(K,sen,0.2,0);K.ik(sen,"Right",K.local(sen,-0.18,0.95,0.38),0.9);K.ik(sen,"Left",K.local(sen,0.18,0.95,0.38),0.9)};
      var otro=persona(K,{color:0x3F6FB5,escala:0.95,ruta:[[0,3.0,-1.9,"idle",4,-3]]});
      var P=persona(K,{color:0x15171B,ropa:{chaqueta:0x15171B,pantalon:0x6A86A8,zapatos:0x1C1E22},ruta:[[0,5.0,-4.3],[3.0,4.7,-0.9],[5.2,4.6,-0.4,"idle",2,1],[7.6,3.2,2.4],[9.4,2.6,2.9,"idle",1.6,1.7],[15.7,2.5,2.7,"idle",1.6,1.7]]}),cu=cuchillo(K);cu.visible=false;P.sostener(cu,"Right",[0,0.06,0.04]);P.sinMirada=true;
      P.post=function(t){var m=t>3&&t<5.4?nervioso(t)*0.9:0;cabeza(K,P,m,0);var cin=ventana(t,3.2,5.2,0.4,0.3);if(cin>0)K.ik(P,"Right",K.local(P,-0.2,0.98,-0.1),cin);
        var fr=t>5.2?Math.min(1,(t-5.2)/0.4):0;if(fr>0)K.ik(P,"Right",K.local(P,-0.25,1.0+Math.sin(t*3)*0.03,0.34),fr)};
      var R=K.recuadro(P,{texto:"persona"}),Rs=K.recuadro(sen,{texto:"persona"}),Ra=K.recuadro({raiz:cu,visible:true,alto:0.2,rot:0},{texto:"cuchillo",w:0.3,h:0.25,d:0.4,estado:"alerta"});Ra.visible=false;var e=reloj();
      return function(t){cu.visible=t>5.1;var wp=new THREE.Vector3();cu.getWorldPosition(wp);Ra.fijo=[wp.x,wp.y-0.12,wp.z];Ra.visible=t>5.2;Ra.set(t>5.6?"alerta":"detecta",t>5.6?"cuchillo":"evaluando");
        R.set(t>5.6?"alerta":(t>3.2?"detecta":"vigila"),t>5.6?"porta arma blanca":(t>3.2?"mano a la cintura":"persona"));
        e(t,3.3,"n",function(){K.evento("Mano a la cintura en la sala","detecta")});e(t,5.6,"a",function(){K.evento("Arma blanca confirmada · cuchillo","alerta")})}}});
  v("blancas2",{chapa:"laboratorio propio · modelo real",fuente:"Cámara propia de Vigías (sala de monitoreo)",autor:"Vigías",url:"",licencia:"Material propio",evento:5.6,
    marcas:[{tipo:"zona",pts:[[0.62,0.18],[0.99,0.2],[0.99,0.98],[0.66,0.98]],color:"vigila",etiqueta:"Sala de monitoreo"}]});

  /* ---------- ocultaProd · mismo laboratorio: toma algo del mesón marcado y lo esconde (14,5 s; aviso a los 8,6 s) ---------- */
  if(!FRANQ)S.redef({id:"ocultaProd",grupo:2,nombre:"Ocultamiento de producto",corta:"Ve cuando un producto se esconde en la ropa.",
    desc:"Sigue el producto desde que sale del mesón. Si desaparece dentro de la ropa o de un bolso en vez de ir al carro o a la canasta, abre un caso.",
    dur:14.5,camara:{pos:[-2,7.5,9],mira:[-1.5,0.6,0.8]},
    fases:[[0,"vigila","Entra a la sala por el fondo"],[4.9,"detecta","Llega al mesón marcado y toma un producto"],[8.6,"alerta","El producto no vuelve al mesón: «manipulación sospechosa · esconde»"]],
    armar:function(K){laboratorio(K);camLab(K);
      var Z=K.zona([[-5.9,0.45],[-5.2,0.45],[-5.2,2.95],[-5.9,2.95]],{estado:"detecta",y:0.81,op:0.25});
      var pr=producto(K,0xF2C230,5);pr.position.set(-5.35,0.81,1.7);
      var P=persona(K,{color:0x2F3A4D,ropa:{chaqueta:0x2F3A4D,cierre:false,abrir:3,camisa:0x2B3038,pantalon:0x6A86A8,zapatos:0x1C1E22},
        ruta:[[0,1.4,-3.6],[1.5,0.4,-1.7],[3.5,-2.6,0.9],[4.8,-4.6,1.8,"idle",-5.5,1.7],[6.6,-4.5,2.0,"idle",-5.5,1.7],[8.0,0.4,3.0],[9.0,2.2,2.7],[11.5,4.4,-0.8],[14.5,3.4,-2.6]]});P.sinAuto=true;
      var abrir=P.chaqueta?P.chaqueta.material.userData.abrir:{value:0};
      P.post=function(t){var a=ventana(t,4.8,5.6,0.3,0.2);if(a>0){var tg=new THREE.Vector3(-5.35,0.9,1.7);K.ik(P,"Right",tg,a);cabeza(K,P,0,0.4*a)}var b=ventana(t,5.7,7.4,0.4,0.4);abrir.value=3+6*b;
        if(b>0){torso(K,P,0.15*b,0);K.ik(P,"Right",K.local(P,0.02,1.12,0.1),b);K.ik(P,"Left",K.local(P,0.22,1.24,0.2),b*0.9);cabeza(K,P,-0.8*b+nervioso(t)*0.4*b,0.15*b)}};
      var R=K.recuadro(P,{texto:"persona"}),Rp=K.recuadro({raiz:pr,visible:true,alto:0.2,rot:0},{texto:"producto",w:0.2,h:0.24,d:0.16});var e=reloj(),tom=false;
      return function(t){if(t>5.3&&!tom){tom=true;P.sostener(pr,"Right",[0,0.1,0.06])}var wp=new THREE.Vector3();pr.getWorldPosition(wp);Rp.fijo=[wp.x,wp.y-0.12,wp.z];Rp.visible=t>4.9&&t<7.2;
        if(t>7.2)pr.visible=false;Z.set(t>8.6?"alerta":"detecta");R.set(t>8.6?"alerta":(t>4.9?"detecta":"vigila"),t>8.6?"esconde · 0,97":(t>4.9?"interacción con el mesón":"persona"));Rp.set("detecta");
        e(t,4.9,"m",function(){K.evento("Interacción con el mesón marcado","detecta")});e(t,8.6,"a",function(){K.evento("Manipulación sospechosa · motivo: esconde","alerta")})}}});
  v("ocultaProd",{chapa:"laboratorio propio · modelo real",fuente:"Prueba en laboratorio propio de Vigías (detector C+ v1)",autor:"Vigías",url:"",licencia:"Material propio",evento:8.6,
    marcas:[{tipo:"zona",pts:[[0.03,0.75],[0.19,0.66],[0.29,0.93],[0.1,0.99]],color:"detecta",etiqueta:"Mesón vigilado"}]});

  /* ---------- armas · café del clip (Mixkit 23252, con detecciones del modelo de armas), 9,6 s ----------
     Cámara a la altura del pecho detrás de los sofás grises; la barra de baldosas al fondo, el barista detrás;
     un hombre armado apunta hacia la barra desde el centro, un segundo entra por la izquierda a los 3,8 s y los
     dos salen por la puerta de la izquierda. */
  function cafe(K){var W=13,D=10;K.piso(W,D,K.mat.madera,1.4);
    var oscuro=K.std(0x23262B,{roughness:0.7}),blanco=K.std(0xF1EFEA,{roughness:0.85}),mad=K.std(0x6B4A2E,{roughness:0.6});
    K.muro(-W/2,-D/2,W/2,-D/2,3,blanco);K.muro(-W/2,-D/2,-W/2,D/2,3,blanco);K.muro(W/2,-D/2,W/2,D/2,3,blanco);
    K.caja(0,2.75,0,W,0.25,D,K.std(0xF4F4F2,{roughness:0.9}));K.caja(0,2.6,-D/2+0.2,W,0.15,0.3,K.std(0x3A2A1E));// cornisa oscura
    // fondo de la barra: muro oscuro con repisas y productos
    K.caja(2.2,0,-D/2+0.25,6.4,2.6,0.3,oscuro);for(var n=0;n<3;n++){K.caja(2.2,1.3+n*0.42,-D/2+0.45,5.6,0.03,0.3,mad);for(var i=0;i<16;i++)K.caja(-0.4+i*0.34,1.33+n*0.42,-D/2+0.45,0.12,0.18+((i*7+n)%3)*0.05,0.12,K.std([0xC8962E,0x3E8E5A,0xC8342B,0xE8E2D5,0x2F64C8][(i+n)%5],{roughness:0.5}))}
    // barra con frente de baldosas estampadas
    var bar=K.grupo(2.4,-1.7,0);K.caja(0,0,0,6.4,0.95,0.7,K.std(0xE9DFC8,{roughness:0.7}),bar);K.caja(0,0.95,0,6.5,0.06,0.8,mad,bar);
    for(var b=0;b<5;b++)K.caja(-2.6+b*1.3,0.3,0.36,1.05,0.55,0.02,K.std([0xD8C48E,0xC9B27A][b%2],{roughness:0.6}),bar);K.obst(bar);
    K.caja(1.4,1.11,-1.6,0.5,0.35,0.35,K.std(0xC9B27A));K.caja(3.5,1.11,-1.7,0.7,0.25,0.4,K.std(0xD9C7A0));
    // a la izquierda: estantería con cosas, mesas con sillas amarillas, la puerta de salida
    K.libreria(-4.6,-4.7,2.2,0,2.2);K.caja(-6.42,0,-0.6,0.06,2.3,1.2,K.std(0x5A3A26,{roughness:0.6}));K.caja(-6.4,2.3,-0.6,0.1,0.12,1.4,oscuro);
    [[-3.4,-1.6],[-2.0,-3.2]].forEach(function(p){K.mesa(p[0],p[1],{r:0.45});[0,2.1,4.2].forEach(function(a){var s=K.grupo(p[0]+Math.cos(a)*0.75,p[1]+Math.sin(a)*0.75,-a*57.3+90);K.caja(0,0.44,0,0.45,0.06,0.45,K.std(0xD9A63A,{roughness:0.6}),s);K.caja(0,0.5,-0.2,0.45,0.5,0.05,K.std(0xD9A63A),s);[[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]].forEach(function(q){K.caja(q[0],0,q[1],0.04,0.44,0.04,mad,s)})})});
    // primer plano: sofás grises con cojines a cuadros naranja
    var gris=K.std(0xB9BCC0,{roughness:0.9}),nar=K.std(0xE0782A,{roughness:0.8});
    var s1=K.grupo(1.1,2.4,-60);K.caja(0,0,0,2.4,0.45,0.95,gris,s1);K.caja(0,0.45,0.38,2.4,0.55,0.2,gris,s1);K.obst(s1);
    var s2=K.grupo(3.6,1.7,-5);K.caja(0,0,0,2.4,0.42,0.95,nar,s2);K.caja(0,0.42,0.38,2.4,0.5,0.22,gris,s2);K.obst(s2);
    K.caja(4.6,0,0.2,1.2,0.42,0.7,mad);K.lampara(-1,2.6,-1);K.lampara(2.5,2.6,-2)}
  if(!FRANQ)S.redef({id:"armas",grupo:2,nombre:"Armas de fuego",corta:"Detecta un arma de fuego en menos de medio segundo.",estado:"en validación",
    desc:"Pistolas y armas largas, llevadas por alguien o dejadas sobre un mostrador. Toda alerta pide verificación humana; nunca confunde un teléfono con un arma.",
    dur:9.56,camara:{pos:[5,5.5,8],mira:[0,1,-1.5]},
    fases:[[0,"detecta","Un hombre apunta hacia la barra: el modelo ve la pistola"],[0.3,"alerta","Confirmada en varios cuadros: «arma de fuego · pistola»"],[1.8,"detecta","Sigue el arma mientras el hombre se mueve"],[3.8,"alerta","Entra un segundo hombre armado por la izquierda: nueva alerta"],[5.8,"detecta","Los dos salen hacia la puerta de la izquierda"]],
    armar:function(K){cafe(K);K.camara([1.8,1.45,3.9],[0.9,1.2,-2.0],{id:"CAM SALÓN",fov:62});
      var bar=persona(K,{color:0x3F6FB5,ropa:{camisa:0x4A6FA5,pantalon:0x1E2433,zapatos:0x1C1E22},ruta:[[0,2.4,-2.5,"idle",0,0.5]]});
      bar.post=function(t){var k=ventana(t,0.4,9.4,0.6,0.3);K.ik(bar,"Right",K.local(bar,-0.32,1.72,0.12),k);K.ik(bar,"Left",K.local(bar,0.32,1.72,0.12),k)};
      var ropaA={chaqueta:0x1C1E22,pantalon:0x1E2433,zapatos:0x1C1E22,gorra:0x1C1E22};
      var A=persona(K,{color:0x1C1E22,ropa:ropaA,ruta:[[0,-0.1,0.5,"idle",2.4,-2.5],[2.4,-0.5,0.7,"idle",2.4,-2.5],[5.6,-1.6,0.6,"idle",2.4,-2.5],[7.4,-4.4,-0.2],[9.56,-6.0,-0.6]]}),a1=arma(K);
      var B=persona(K,{color:0x2E2F33,ropa:{chaqueta:0x2E2F33,pantalon:0x3A3F4A,zapatos:0x1C1E22,gorra:0x1C1E22},ruta:[[0,-7.5,1.8],[3.2,-6.2,1.6],[4.0,-3.4,1.6,"idle",2.4,-2.5],[6.4,-3.6,1.2,"idle",2.4,-2.5],[8.2,-5.8,-0.2],[9.56,-7.2,-0.6]]}),a2=arma(K);
      function P1(P,ar,fk){P.sostener(ar,"Right",[0,0.08,0.05]);P.sinMirada=true;P.post=function(t){var k=fk(t);if(k>0){K.ik(P,"Right",K.local(P,-0.12,1.45,0.75),k);K.ik(P,"Left",K.local(P,0.02,1.4,0.55),k*0.7)}}}
      P1(A,a1,function(t){return t<7.2?1:Math.max(0,1-(t-7.2)/0.5)});P1(B,a2,function(t){return ventana(t,3.4,8,0.4,0.4)});
      var RA=K.recuadro(A,{texto:"persona"}),RB=K.recuadro(B,{texto:"persona"});K.recuadro(bar,{texto:"persona"});
      function cajaArma(ar){var r=K.recuadro({raiz:ar,visible:true,alto:0.2,rot:0},{texto:"pistola",w:0.3,h:0.25,d:0.3,estado:"alerta"});r.visible=false;return r}
      var R1=cajaArma(a1),R2=cajaArma(a2),e=reloj(),wp=new THREE.Vector3();
      return function(t){a1.getWorldPosition(wp);R1.fijo=[wp.x,wp.y-0.12,wp.z];R1.visible=t<7.4;var al1=t>0.3&&t<1.8;R1.set(al1?"alerta":"detecta",al1?"pistola 0,50":"pistola 0,64");
        a2.getWorldPosition(wp);R2.fijo=[wp.x,wp.y-0.12,wp.z];R2.visible=t>3.6&&t<8;var al2=t>3.8&&t<5.8;R2.set(al2?"alerta":"detecta",al2?"pistola 0,46":"pistola");
        RA.set(al1||al2?"alerta":"vigila");RB.set(al2?"alerta":"vigila");RB.visible=B.raiz.position.x>-6.4;
        e(t,0.3,"a",function(){K.evento("Arma de fuego confirmada · pistola","alerta")});e(t,3.8,"b",function(){K.evento("Segunda arma en el salón","alerta")});K.contador("Del arma visible al aviso",t>0.3?"0,3 s":"—")}}});
  v("armas",{chapa:"video de banco (Mixkit) · modelo real",fuente:"Mixkit · «A robbery in the coffee shop» (#23252), con detecciones del modelo de armas",autor:"Mixkit",url:"https://mixkit.co/free-stock-video/a-robbery-in-the-coffee-shop-23252/",licencia:"Mixkit Stock Video Free License",evento:3.8,
    marcas:[{tipo:"zona",pts:[[0.43,0.53],[0.98,0.55],[0.98,0.78],[0.45,0.74]],color:"vigila",etiqueta:"Barra"}]});

  /* ---------- fuego · incendio en el centro de un pueblo, toma aérea fija (16 s; alarma de humo a los 1,5 s) ---------- */
  function humoPluma(K,o){var N=o.n||70,tx=K.tex(128,128,function(c,w,h){var g=c.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,"rgba(255,255,255,.95)");g.addColorStop(0.5,"rgba(255,255,255,.45)");g.addColorStop(1,"rgba(255,255,255,0)");c.fillStyle=g;c.fillRect(0,0,w,h)});
    var L=[],sem=7;function rn(){sem=(sem*16807)%2147483647;return(sem-1)/2147483646}
    for(var i=0;i<N;i++){var m=new THREE.SpriteMaterial({map:tx,color:0x55565A,transparent:true,depthWrite:false,opacity:0});var s=new THREE.Sprite(m);s.renderOrder=8;K.add(s);L.push({s:s,f:i/N,r:rn(),q:rn()})}
    return{paso:function(t){var T=o.vida||9;L.forEach(function(p){var u=((t/T)+p.f)%1,x=o.x+u*o.viento*T+(p.r-0.5)*9*(0.4+u),y=o.y+u*o.sube*T*(1-0.35*u),z=o.z+(p.q-0.5)*4*(0.3+u);
      p.s.position.set(x,y,z);var tam=(o.t0||4)+u*(o.t1||22);p.s.scale.set(tam,tam,1);var g=0.16+0.26*u+p.r*0.1;p.s.material.color.setRGB(g,g,g*1.02);p.s.material.opacity=Math.min(1,u*6)*(1-u)*(o.op||0.9)})}}}
  function techo2(K,x,z,w,d,h,col,ry){var g=K.grupo(x,z,ry||0);K.caja(0,0,0,w,h,d,K.std(col,{roughness:0.85}),g);var r=new THREE.Mesh(new THREE.CylinderGeometry(d*0.6,d*0.6,w,3,1),K.std(0x5A4034,{roughness:0.8}));r.rotation.z=Math.PI/2;r.rotation.x=Math.PI/6;r.scale.set(0.5,1,1);r.position.set(0,h+d*0.18,0);r.castShadow=true;g.add(r);K.obst(g);return g}
  if(!FRANQ)S.redef({id:"fuego",grupo:2,nombre:"Humo y fuego",corta:"Avisa de un incendio cuando todavía es una llama chica.",estado:"en validación",
    desc:"Busca humo y fuego en la imagen, sin sensores nuevos. En el video, la alarma de humo saltó a los 2 segundos, con la columna todavía subiendo sobre la calle: ese margen es el que importa.",
    dur:16,camara:{pos:[30,30,40],mira:[-4,4,-8]},
    fases:[[0,"vigila","Vista aérea de la calle: el techo empieza a echar humo"],[1.5,"alerta","Humo confirmado (0,85): aviso con la columna todavía subiendo"],[6,"alerta","La columna crece y el viento la lleva sobre la calle"]],
    armar:function(K){K.piso(90,80,K.std(0x6E7468,{roughness:0.95}));
      // calle de izquierda a derecha al pie del cuadro, con andenes de adoquín
      K.parche(0,9,90,9,K.std(0x8B7F75,{roughness:0.9}),1,0.01);K.parche(0,9,90,6,K.std(0x55585D,{roughness:0.9}),1,0.012);K.parche(4,0,7,18,K.std(0x8B7F75,{roughness:0.9}),1,0.011);
      // a la izquierda: edificio de vidrio y fachada blanca, casa de ladrillo con frontón; a la derecha casas con frontón
      K.caja(-21,0,3,12,9,10,K.std(0xEDEDEA,{roughness:0.8}));for(var k=0;k<3;k++)K.caja(-21,2+k*2.6,8.05,11.6,1.2,0.1,K.std(0x2B3038,{roughness:0.3,metalness:0.4}));
      techo2(K,-11.5,1.5,6,8,9,0x6A3A2E);techo2(K,19,4,7,9,8,0xD9D2C4,90);techo2(K,21,-6,8,9,9,0xB9A48A,90);techo2(K,-28,-10,10,8,7,0x9C8B7A);
      K.caja(-8,0,-14,18,8,12,K.std(0x5A5650,{roughness:0.9}));K.caja(6,0,-22,16,7,12,K.std(0x8A8478));K.caja(-24,0,-26,14,8,12,K.std(0x9A9488));K.caja(18,0,-24,10,6,10,K.std(0xA49C90));[[-40,-40],[-20,-45],[0,-48],[22,-44],[40,-38],[34,-16],[-42,-14]].forEach(function(p,i){K.caja(p[0],0,p[1],12+(i%3)*3,6+(i%4)*2,10,K.std([0x9A9488,0x8A7A6A,0xB0A898,0x7A6A5A][i%4],{roughness:0.9}))});
      [[-4,3],[1,1],[8,0],[12,2],[-8,-30],[-30,-28],[-36,-20],[26,-30]].forEach(function(p){K.arbol(p[0],p[1],2.4)});
      // vehículos sobre la calle: autobombas a la izquierda, la de la escalera al centro, van de policía y ambulancia a la derecha
      [[-13,8.5],[-7.5,9.5]].forEach(function(p){var g=K.grupo(p[0],p[1],90);K.caja(0,0,0,2.5,2.9,8,K.std(0xC8342B,{roughness:0.5}),g)});
      var cam=K.grupo(4,8.2,90);K.caja(0,0,0,2.5,2.8,9,K.std(0xC8342B,{roughness:0.5}),cam);K.caja(0,2.8,0,2.2,0.5,5,K.std(0xD8D8D8,{metalness:0.5}),cam);
      var base=new THREE.Vector3(3.2,3.4,8.2),top=new THREE.Vector3(-2.5,24,-3),L=base.distanceTo(top);var esc=K.caja(0,0,0,0.6,0.6,L,K.std(0xD9442E,{roughness:0.5}));esc.geometry.translate(0,-0.3,0);esc.position.copy(base).lerp(top,0.5);esc.lookAt(top);
      K.caja(top.x,top.y-0.7,top.z,1.4,1.2,1.4,K.std(0xD9442E));
      var van=K.grupo(9,10,90);K.caja(0,0,0,2.2,2.3,5.2,K.std(0xF4F4F2),van);K.caja(1.11,1.0,0,0.02,0.4,5.0,K.std(0x2F64C8),van);
      var amb=K.grupo(14.5,10.5,80);K.caja(0,0,0,2.2,2.6,5.6,K.std(0xF2D230),amb);
      K.camara([2,30,64],[0,10,-6],{id:"CAM AÉREA",fov:42,alcance:70});
      var H=humoPluma(K,{x:-6,y:9,z:-12,viento:2.4,sube:2.4,vida:9,t0:8,t1:40,n:130,op:1});
      var F=K.fuego(-14,8.6,-9,{n:120,r:1.6});F.pts.material.size=1.8;
      var Rh=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:1,rot:0},{texto:"humo",w:26,h:17,d:4,estado:"detecta"});Rh.fijo=[12,12,-6];
      var e=reloj();
      return function(t){H.paso(t+9);F.int=0.9;Rh.visible=t>0.6;Rh.set(t>1.5?"alerta":"detecta",t>1.5?"humo 0,85":"humo 0,63");
        e(t,1.5,"a",function(){K.evento("Humo detectado sobre la calle · 0,85","alerta")});K.contador("Del humo visible al aviso",t>1.5?"1,5 s":"—")}}});
  v("fuego",{chapa:"video público · modelo real",fuente:"Video público de un incendio urbano, con detecciones del modelo de humo y fuego (yolox_s_fire)",autor:"",url:"",licencia:"Material de archivo ya publicado en el sitio",evento:1.5,
    marcas:[{tipo:"zona",pts:[[0.52,0.06],[0.98,0.06],[0.98,0.55],[0.52,0.55]],color:"alerta",etiqueta:"Humo",desde:1.5}]});

  /* ---------- abandono · sala de lectura (video generado con IA), 13,5 s ----------
     Una mujer lee en la mesa de adelante, toma su maleta, se va por la derecha y el celular se queda en la mesa. */
  function biblioteca(K){var W=12,D=10;K.piso(W,D,K.mat.madera,1.4);var muro=K.std(0x4A3424,{roughness:0.7});
    K.muro(-W/2,-D/2,W/2,-D/2,3.4,muro);K.muro(-W/2,-D/2,-W/2,D/2,3.4,muro);K.muro(W/2,-D/2,W/2,D/2,3.4,muro);
    for(var x=-5;x<=5;x+=1.4)K.libreria(x,-4.75,1.35,0,3.2);for(var z=-4;z<=4;z+=1.4){K.libreria(-5.75,z,1.35,90,3.2);if(z<-1||z>1.4)K.libreria(5.75,z,1.35,-90,3.2)}
    var mad=K.std(0xB07A45,{roughness:0.5}),silla=K.std(0x9A6A3A,{roughness:0.6});
    function mesa(x,z,L,A,ry){var g=K.grupo(x,z,ry||0);K.caja(0,0.72,0,L,0.06,A,mad,g);[[-L/2+0.15,-A/2+0.15],[L/2-0.15,-A/2+0.15],[-L/2+0.15,A/2-0.15],[L/2-0.15,A/2-0.15]].forEach(function(p){K.caja(p[0],0,p[1],0.08,0.72,0.08,mad,g)});K.obst(g);
      for(var sx=-L/2+0.5;sx<L/2;sx+=0.9)[-1,1].forEach(function(s){var c=K.grupo(sx,s*(A/2+0.35),s>0?180:0,g);K.caja(0,0.44,0,0.44,0.05,0.42,silla,c);K.caja(0,0.49,-0.2,0.44,0.4,0.04,silla,c);[[-0.19,-0.18],[0.19,-0.18],[-0.19,0.18],[0.19,0.18]].forEach(function(q){K.caja(q[0],0,q[1],0.04,0.44,0.04,silla,c)})});return g}
    mesa(-1.4,-2.0,4.6,1.1,-6);mesa(0.6,0.5,4.0,1.5,-8);K.lampara(0,3.2,0)}
  if(!FRANQ)S.redef({id:"abandono",grupo:2,nombre:"Abandono de objetos",corta:"Avisa del objeto que alguien deja y se va.",
    desc:"Asocia cada objeto con quien lo traía. Si la persona se aleja y el objeto se queda solo más del tiempo fijado, avisa con la imagen de quién lo dejó: sirve para objetos perdidos y para bultos sospechosos.",
    dur:13.54,camara:{pos:[6,6.5,8],mira:[0,0.6,-0.5]},
    fases:[[0,"vigila","Una persona lee en la mesa con su maleta y su celular"],[2.2,"detecta","Se levanta, toma la maleta y se va; el celular se queda en la mesa"],[5.5,"detecta","Ya nadie está cerca: empieza la cuenta de 5 segundos"],[10.5,"alerta","Pasan 5 s: «objeto perdido · celular»"]],
    armar:function(K){biblioteca(K);K.camara([-2.0,6.8,4.6],[0.5,0,-0.1],{id:"CAM SALA DE LECTURA",fov:56});
      var lec=persona(K,{color:0x4A5F80,ruta:[[0,1.0,-2.75,"idle",1.0,-2.0]]});lec.post=function(t){K.gesto(lec,"agacharse",t,0.55);cabeza(K,lec,0,0.5);K.ik(lec,"Right",K.local(lec,-0.15,0.82,0.35),0.9);K.ik(lec,"Left",K.local(lec,0.15,0.82,0.35),0.9)};
      var cel=K.caja(1.25,0.75,0.2,0.08,0.012,0.16,K.std(0x15171B,{roughness:0.25,metalness:0.4}));
      var mal=new THREE.Group();K.add(mal);K.caja(0,0.1,0,0.45,0.62,0.26,K.std(0x3A2A40,{roughness:0.5}),mal);K.caja(0,0.72,0,0.03,0.4,0.03,K.mat.aceroOsc,mal);K.caja(0,1.1,0,0.16,0.03,0.03,K.mat.negro,mal);[-0.15,0.15].forEach(function(x){K.cil(x,0,-0.08,0.04,0.04,0.06,K.mat.goma,mal)});
      var P=persona(K,{color:0xC8962E,ropa:{chaqueta:0xC8962E,pantalon:0x2B3038,zapatos:0x1C1E22},ruta:[[0,1.3,-0.55,"idle",1.3,0.5],[2.2,1.3,-0.55,"idle",1.0,0.5],[3.4,-1.0,1.55,"idle",-1.2,1.6],[4.0,-0.9,1.6,"idle",0,1.8],[6.2,2.4,2.6],[8.4,5.3,1.4],[13.54,7.5,1.0]]});P.sinAuto=true;
      P.post=function(t){if(t<2.0){K.gesto(P,"agacharse",t,0.55);cabeza(K,P,0,0.5);K.ik(P,"Right",K.local(P,-0.15,0.82,0.35),0.9)}if(t>3.6){K.ik(P,"Left",K.local(P,0.3,0.98,-0.32),Math.min(1,(t-3.6)/0.4))}};
      var Rc=K.recuadro({raiz:cel,visible:true,alto:0.1,rot:0},{texto:"celular",w:0.22,h:0.07,d:0.26,estado:"vigila"}),Rm=K.recuadro({raiz:mal,visible:true,alto:0.8,rot:0},{texto:"maleta",w:0.55,h:1.2,d:0.45,estado:"ok"}),Rp=K.recuadro(P,{texto:"dueña"});
      var Z=K.zona([[0.65,-0.15],[1.85,-0.15],[1.85,0.55],[0.65,0.55]],{estado:"vigila",y:0.76,op:0.25});
      var lb=K.etiqueta("Objeto perdido","rojo",K.punto(1.25,1.15,0.2)),et=K.etiqueta("","reloj",K.punto(1.25,0.95,0.2));var e=reloj();
      return function(t){if(t<3.8){mal.position.set(-1.0,0,1.55);mal.rotation.set(0,0,0)}else{var hp=K.manoPos(P,"Left");mal.position.set(hp.x,0.02,hp.z);mal.rotation.set(-0.3,P.rot,0);mal.position.add(new THREE.Vector3(0,0,-0.18).applyAxisAngle(new THREE.Vector3(0,1,0),P.rot))}
        Rm.fijo=[mal.position.x,0,mal.position.z];Rc.fijo=[1.25,0.75,0.2];var s=t>5.5?t-5.5:0;
        Rc.set(t>10.5?"alerta":(t>2.2?"detecta":"vigila"),t>10.5?"objeto perdido · celular":(t>2.2?"sin dueño cerca":"celular"));Z.set(t>10.5?"alerta":(t>5.5?"detecta":"vigila"));
        et.set(t>5.5&&t<10.5?"solo · "+Math.min(5,s).toFixed(1).replace(".",",")+" s":"",t>9.5?"reloj rojo":"reloj");et.el.hidden=!(t>5.5&&t<10.5);lb.el.style.opacity=t>10.5?1:0;Rp.visible=P.raiz.position.x<6;Rm.visible=mal.position.x<6;
        e(t,3.8,"a",function(){K.evento("La dueña se va · el celular queda en la mesa","detecta")});e(t,10.5,"b",function(){K.evento("Objeto perdido · celular · mesa 1","alerta")})}}});
  v("abandono",{ia:true,chapa:"video generado con IA · referencia",fuente:"Video generado con IA (Seedance 2.5, ElevenLabs) para ilustrar la analítica",autor:"Vigías (generado con IA)",url:"",licencia:"Generado con IA para Vigías",evento:10.5,
    marcas:[{tipo:"zona",pts:[[0.59,0.53],[0.66,0.53],[0.66,0.61],[0.59,0.61]],color:"vigila",etiqueta:"Celular",hasta:5.5},{tipo:"zona",pts:[[0.59,0.53],[0.66,0.53],[0.66,0.61],[0.59,0.61]],color:"detecta",etiqueta:"Sin dueño cerca",desde:5.5,hasta:10.5},{tipo:"zona",pts:[[0.59,0.53],[0.66,0.53],[0.66,0.61],[0.59,0.61]],color:"alerta",etiqueta:"Objeto perdido · celular",desde:10.5}]});

  /* ---------- rostro · sala de una vivienda vista desde la esquina (Mixkit 12830), 15,1 s ----------
     Entra un hombre con pasamontañas desde el fondo, camina hacia la cámara y se queda mirándola; a los 11 s alza las manos. */
  if(!FRANQ)S.redef({id:"rostro",grupo:2,nombre:"Ocultamiento de rostro",corta:"Avisa de quien entra con la cara cubierta.",
    desc:"Detecta caras tapadas con capucha, casco o pasamontañas en los accesos. Es una señal temprana: quien entra así a un local suele no querer ser visto.",
    dur:15.08,camara:{pos:[6,6,8],mira:[0,0.8,-1]},
    fases:[[0,"vigila","La cámara de la sala busca el rostro de quien entra"],[1.6,"detecta","El rostro no se ve: el modelo marca «cubierto»"],[2.7,"alerta","Pasamontañas confirmado en varios cuadros: aviso"]],
    armar:function(K){var W=10,D=9;K.piso(W,D,K.mat.madera,1.2);var blanco=K.std(0xEDEBE6,{roughness:0.85});K.muro(-W/2,-D/2,W/2,-D/2,2.7,blanco);K.muro(-W/2,-D/2,-W/2,D/2,2.7,blanco);K.muro(W/2,-D/2,W/2,D/2,2.7,blanco);
      // piso a cuadros a la derecha, en diagonal
      var g=K.grupo(1.6,0.2,45);for(var i=-3;i<3;i++)for(var j=-3;j<3;j++)K.caja(i*0.6+0.3,0,j*0.6+0.3,0.6,0.008,0.6,K.std((i+j)&1?0x2E3236:0xE8E6E0,{roughness:0.4}),g);
      // ventanal y radiador al fondo, sofá y sillón de cuero, mesa de centro, lámpara
      K.caja(0.6,0.9,-D/2+0.08,1.6,1.7,0.04,K.std(0xF6F7F8,{emissive:0xFFFFFF,emissiveIntensity:0.35}));K.caja(0.6,0.25,-D/2+0.12,1.2,0.55,0.08,K.std(0xF4F4F2));
      K.caja(3.6,0,-D/2+0.4,1.2,2.6,0.1,K.std(0xF6F7F8,{emissive:0xFFFFFF,emissiveIntensity:0.5}));
      var cu=K.std(0x4A2E24,{roughness:0.5});var so=K.grupo(-2.8,-3.6,0);K.caja(0,0,0,2.4,0.45,0.9,cu,so);K.caja(0,0.45,-0.35,2.4,0.45,0.2,cu,so);K.obst(so);
      var sl=K.grupo(-0.8,-3.4,-20);K.caja(0,0,0,1,0.45,0.9,cu,sl);K.caja(0,0.45,-0.35,1,0.45,0.2,cu,sl);K.obst(sl);
      K.caja(-2.4,0,-2.4,1.3,0.4,0.7,K.std(0x6B4A2E));K.cil(-2.0,0,-2.4,0.12,0.12,0.22,K.std(0xC8662E));
      var lp=K.grupo(0.4,-4.1,0);K.cil(0,0,0,0.03,0.03,1.5,K.mat.aceroOsc,lp);K.cil(0,1.5,0,0.12,0.2,0.25,K.std(0xF2E6C8,{emissive:0xFFE0A0,emissiveIntensity:0.4}),lp);
      K.caja(2.6,0,-1.6,0.9,0.45,0.9,K.std(0xC9E0F2,{transparent:true,opacity:0.5}));K.cil(2.6,0.45,-1.6,0.1,0.1,0.35,K.std(0xD26A8A));
      [[3.6,0.2],[3.8,1.4]].forEach(function(p){var c=K.grupo(p[0],p[1],-90);K.caja(0,0,0,0.6,0.45,0.6,K.std(0xC9A06A,{roughness:0.8}),c);K.caja(0,0.45,-0.27,0.6,0.5,0.06,K.std(0xC9A06A),c);K.obst(c)});
      var mo=K.grupo(3.4,3.0,0);K.cil(0,0,0,0.75,0.75,0.75,K.std(0x5A3A26,{roughness:0.5}),mo);K.obst(mo);
      K.caja(-4.6,0,2.2,0.8,1.0,2.6,K.std(0xD9DCE0,{roughness:0.6}));// mostrador blanco adelante a la izquierda
      K.camara([-0.3,3.1,1.9],[0.25,0.1,-2.2],{id:"CAM SALA",fov:62});
      var P=persona(K,{color:0x15171B,ropa:{chaqueta:0x15171B,pantalon:0x2B3038,zapatos:0x1C1E22},ruta:[[0,1.0,-3.4],[2.4,0.2,-0.9,"idle",-0.3,2],[11,0.2,-0.9,"idle",-0.3,2],[12.4,0.0,-0.6,"idle",-0.3,2],[15.08,0.0,-0.6,"idle",-0.3,2]]});P.sinMirada=true;
      var h=P.hueso("Head");if(h){var pm=new THREE.Mesh(new THREE.SphereGeometry(0.125,20,14),K.std(0x101114,{roughness:0.9}));var ws=new THREE.Vector3();h.getWorldScale(ws);pm.scale.setScalar(1/ws.x);pm.scale.y*=1.15;pm.position.y=0.1/ws.x;pm.position.z=0.01/ws.x;h.add(pm);
        var oj=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.035,0.02),K.std(0xC9A080));oj.scale.setScalar(1/ws.x);oj.position.set(0,0.12/ws.x,0.12/ws.x);h.add(oj)}
      P.post=function(t){if(t>2.4&&t<11){K.ik(P,"Right",K.local(P,-0.05,1.0,0.25),0.8);K.ik(P,"Left",K.local(P,0.05,1.0,0.25),0.8)}var u=ventana(t,11.2,15.08,0.6,0.1);if(u>0){K.ik(P,"Right",K.local(P,-0.45,1.55,0.2),u);K.ik(P,"Left",K.local(P,0.45,1.55,0.2),u)}};
      var cab={raiz:new THREE.Object3D(),visible:true,alto:0.3,rot:0},R=K.recuadro(cab,{texto:"rostro",w:0.34,h:0.36,d:0.34});var lb=K.etiqueta("Rostro cubierto · pasamontañas","rojo",K.sobre(P));var e=reloj();
      return function(t){var p=P.raiz.position;cab.raiz.position.set(p.x,p.y+P.alto-0.34,p.z);cab.rot=P.rot;R.set(t>2.7?"alerta":(t>1.6?"detecta":"vigila"),t>2.7?"rostro cubierto 0,76":(t>1.6?"rostro? 0,54":"rostro"));lb.el.style.opacity=t>2.7?1:0;
        e(t,2.7,"a",function(){K.evento("Rostro cubierto en la sala","alerta")})}}});
  v("rostro",{chapa:"video de stock (Mixkit) · modelo real",fuente:"Mixkit · «Thief creep through house and looks up at camera» (#12830), con detecciones del modelo EPP (clase Mask)",autor:"Mixkit",url:"https://mixkit.co/free-stock-video/thief-creep-through-house-and-looks-up-at-camera-12830/",licencia:"Mixkit Stock Video Free License",evento:2.7,
    marcas:[{tipo:"zona",pts:[[0.3,0.4],[0.72,0.4],[0.8,0.98],[0.22,0.98]],color:"vigila",etiqueta:"Entrada a la sala"}]});

  /* ---------- activos · cuarto con escritorio, celular y monitor vigilados (Mixkit 31372, CCTV B/N), 19,5 s ----------
     Dos encapuchados entran; uno deja la mochila sobre el celular y la llena, se la lleva (celular retirado a los 15,5 s)
     y al final arranca el monitor de la pared (18,4 s). */
  if(!FRANQ)S.redef({id:"activos",grupo:2,nombre:"Retiro de activos",corta:"Cada equipo tiene su sitio, y avisa cuando sale de él.",estado:"funcionando en silencio",
    desc:"Vigila que cada equipo siga en su lugar. Si algo lo tapa, verifica en ámbar; si el sitio queda vacío, avisa en rojo con el video desde 15 segundos antes.",
    dur:19.46,camara:{pos:[4.5,5,6],mira:[-0.6,0.5,-0.6]},
    fases:[[0,"ok","El celular y el monitor del escritorio, vigilados"],[0.6,"detecta","Una mochila tapa el celular: verificando"],[15.5,"alerta","El sitio del celular quedó vacío: «activo retirado · celular»"],[18.4,"alerta","Arrancan el monitor de la pared: «activo retirado · monitor»"]],
    armar:function(K){var W=6,D=6;K.piso(W,D,K.std(0xC9CACC,{roughness:0.5}));var gris=K.std(0xB8BABD,{roughness:0.85}),osc=K.std(0x1E2024,{roughness:0.8});
      K.muro(-W/2,-D/2,W/2,-D/2,2.7,gris);K.muro(-W/2,-D/2,-W/2,D/2,2.7,gris);K.muro(W/2,-D/2,W/2,D/2,2.7,gris);
      K.caja(-1.1,0,-D/2+0.1,1.0,2.2,0.06,osc);K.caja(0.7,0,-D/2+0.12,1.6,2.6,0.05,K.std(0x2A2C30,{roughness:0.95}));// puerta y cortina
      var bl=K.std(0xF2F2F0,{roughness:0.5});K.caja(-2.35,0,0.9,1.3,0.74,2.6,bl);K.caja(-1.3,0,2.0,0.8,0.74,0.9,bl);
      var mon=K.grupo(-2.95,0.6,90);K.caja(0,0.78,0,1.1,0.62,0.05,K.std(0x101114,{roughness:0.3}),mon);K.caja(0,0.5,0.15,0.3,0.03,0.2,K.mat.negro,mon);
      var cel=K.caja(-2.15,0.74,0.35,0.08,0.012,0.16,K.std(0x15171B,{roughness:0.25,metalness:0.4}));
      var sofa=K.grupo(2.55,0.4,-90);K.caja(0,0,0,4.6,0.42,0.85,K.std(0x3A3C40,{roughness:0.9}),sofa);K.caja(0,0.42,-0.35,4.6,0.45,0.2,K.std(0x3A3C40),sofa);for(var k=0;k<4;k++)K.caja(-1.6+k*1.05,0.42,-0.15,0.5,0.4,0.15,K.std(0x2F3135),sofa);K.obst(sofa);
      K.caja(-1.0,0,-1.5,0.5,0.42,0.5,K.std(0x5A5C60,{roughness:0.95}));K.caja(-0.6,0,-2.3,0.5,0.42,0.5,K.std(0x5A5C60,{roughness:0.95}));K.caja(0.1,0,-1.4,0.9,0.4,0.9,K.std(0x2A2B2E,{roughness:0.8}));K.planta(0.1,-1.4,0.8);
      K.camara([1.1,2.65,2.5],[-0.8,0.0,-0.9],{id:"CAM 2",fov:80});
      var Zd=K.zona([[-3.0,-0.4],[-1.7,-0.4],[-1.7,2.45],[-0.9,2.45],[-0.9,2.2],[-3.0,2.2]],{estado:"ok",y:0.75,op:0.2});
      var A=persona(K,{color:0x15171B,ropa:{chaqueta:0x15171B,pantalon:0x7A7C80,zapatos:0x1C1E22,gorra:0x15171B},ruta:[[0,-0.2,-1.6],[0.8,-1.25,0.5,"idle",-2.2,0.4],[14.6,-1.25,0.5,"idle",-2.2,0.4],[15.6,-0.6,-1.4],[16.6,-1.1,-0.4],[17.6,-1.9,0.9,"idle",-3,0.6],[18.4,-1.9,0.9,"idle",-3,0.6],[19.46,-0.6,2.6]]});A.sinAuto=true;
      var B=persona(K,{color:0x1C1E22,ropa:{chaqueta:0x1C1E22,pantalon:0x2B3038,zapatos:0x1C1E22,gorra:0x1C1E22},ruta:[[0,1.2,-1.4],[2.0,0.4,-2.4,"idle",0,-3],[5,0.4,-2.4,"idle",-1,0],[7,0.0,-1.6,"idle",-1.2,0.5],[13,0.0,-1.6,"idle",-1.2,0.5],[15,-0.6,-2.4],[19.46,-1.1,-2.9]]});
      var moch=new THREE.Group();K.add(moch);K.caja(0,0,0,0.42,0.5,0.25,K.std(0x2A2B2E,{roughness:0.7}),moch);
      A.post=function(t){var k=ventana(t,0.6,14.6,0.4,0.4);if(k>0){torso(K,A,0.25*k,0);K.ik(A,"Right",new THREE.Vector3(-2.1,0.95+Math.sin(t*3)*0.05,0.35),k);K.ik(A,"Left",new THREE.Vector3(-2.15,1.0,0.55),k*0.8)}var m=ventana(t,17.4,18.6,0.4,0.3);if(m>0){K.ik(A,"Right",new THREE.Vector3(-2.9,1.3,0.4),m);K.ik(A,"Left",new THREE.Vector3(-2.9,1.3,0.8),m)}};
      var Rc=K.recuadro({raiz:cel,visible:true,alto:0.1,rot:0},{texto:"celular vigilado",w:0.24,h:0.08,d:0.3,estado:"ok"}),Rm=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:0.6,rot:0},{texto:"monitor vigilado",w:0.15,h:0.66,d:1.15,estado:"ok"});
      Rc.fijo=[-2.15,0.74,0.35];Rm.fijo=[-2.93,1.05,0.6];K.recuadro(A,{texto:"persona"});K.recuadro(B,{texto:"persona"});var e=reloj(),tom=false;
      return function(t){// la mochila: sobre el celular de 0,6 a 14,8 s, después en la mano
        var hp;if(t<0.6){hp=K.manoPos(A,"Left");moch.position.set(hp.x,hp.y-0.45,hp.z)}else if(t<14.8){moch.position.set(-2.12,0.75,0.38)}else{hp=K.manoPos(A,"Right");moch.position.set(hp.x,Math.max(0.1,hp.y-0.45),hp.z)}
        cel.visible=t<10;if(t>18.4&&!tom){tom=true;K.agarrar(mon,A,"Right")}
        Rc.set(t>15.5?"alerta":(t>0.6?"detecta":"ok"),t>15.5?"ACTIVO RETIRADO · celular":(t>0.6?"verificando · celular":"celular vigilado"));
        Rm.set(t>18.4?"alerta":(t>17.4?"detecta":"ok"),t>18.4?"ACTIVO RETIRADO · monitor":(t>17.4?"verificando · monitor":"monitor vigilado"));Zd.set(t>15.5?"alerta":(t>0.6?"detecta":"ok"));
        e(t,0.6,"a",function(){K.evento("Celular tapado por una mochila · verificando","detecta")});e(t,15.5,"b",function(){K.evento("Activo retirado · celular del escritorio","alerta")});e(t,18.4,"c",function(){K.evento("Activo retirado · monitor de la pared","alerta")})}}});
  v("activos",{chapa:"video de stock (Mixkit) · detección de cambio real",fuente:"Mixkit · «Two thieves recorded on a security camera» (#31372), con detección de cambio por zona (OpenCV)",autor:"Mixkit",url:"https://mixkit.co/free-stock-video/two-thieves-recorded-on-a-security-camera-31372/",licencia:"Mixkit Stock Video Free License",evento:15.5,
    marcas:[{tipo:"zona",pts:[[0,0.54],[0.12,0.51],[0.31,0.68],[0.19,0.93],[0,0.8]],color:"ok",etiqueta:"Activos vigilados",hasta:15.5},{tipo:"zona",pts:[[0,0.54],[0.12,0.51],[0.31,0.68],[0.19,0.93],[0,0.8]],color:"alerta",etiqueta:"Activo retirado",desde:15.5}]});
})();
