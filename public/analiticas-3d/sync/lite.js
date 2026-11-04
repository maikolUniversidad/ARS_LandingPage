/* Emparejamiento 3D ↔ video · familia lite (parte A: fleje, canastillas, puertas, huecos, vencido, destruccion, bodega).
   Ver sync/base.js y docs/vision-alineacion/lite.md. Cada escena copia el encuadre, el lugar y los tiempos de su clip:
   dur = duración del clip y los segundos de fases = segundos del clip. */
(function(){
  "use strict";
  var U=window.ESC_UTIL,S=window.ESC_SYNC,C=window.MOTOR.COL;
  var reloj=U.reloj,lerp=U.lerp,suave=U.suave,ventana=U.ventana,torso=U.torso,persona=U.persona;
  var CARPETA="evidencia-publica/lite/";

  /* Punto del mundo que se ve en (xi,yi) del cuadro 16:9 de una cámara, cortando el plano eje=valor.
     Sirve para poner recuadros y zonas 3D exactamente donde están las marcas del video. */
  function enCuadro(cam,xi,yi,eje,valor){var p=new THREE.Vector3().fromArray(cam.pos),m=new THREE.Vector3().fromArray(cam.mira),d=m.clone().sub(p).normalize(),
      r=new THREE.Vector3().crossVectors(d,new THREE.Vector3(0,1,0)).normalize(),u=new THREE.Vector3().crossVectors(r,d),tv=Math.tan(cam.fov*Math.PI/360),th=tv*16/9;
    var ray=d.clone().addScaledVector(r,(2*xi-1)*th).addScaledVector(u,(1-2*yi)*tv),k=(valor-p.getComponent(eje))/ray.getComponent(eje);return p.addScaledVector(ray,k)}
  function caja2D(K,cam,x0,y0,x1,y1,zp,o){var a=enCuadro(cam,x0,y1,2,zp),b=enCuadro(cam,x1,y0,2,zp);var r=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:b.y-a.y,rot:0},Object.assign({w:b.x-a.x,h:b.y-a.y,d:0.04},o||{}));r.fijo=[(a.x+b.x)/2,a.y,zp];return r}

  /* ============ Tienda de barrio (clip Pixabay 208777): una cámara frente a la estantería del mostrador ============
     La usan huecos (clip con detecciones del modelo v3 quemadas), fleje y vencido (mismo clip, limpio). */
  var CAM_TB={pos:[0,1.55,2.0],mira:[0,1.55,-1.0],fov:40};
  var REP=[0.38,0.79,1.33,1.70,2.10,2.56],ZP=-0.82; // repisas (altura) y frente de la repisa
  function tiendaBarrio(K,o){o=o||{};var cam=o.cam||CAM_TB;
    K.piso(8,6,K.std(0xB9B2A6,{roughness:0.9}));
    var blanco=K.std(0xF1EEE4,{roughness:0.85}),crema=K.std(0xE7E1D2,{roughness:0.9});
    K.caja(0,0,-1.0,5.4,3.1,0.06,crema);K.caja(-2.7,0,-0.4,0.06,3.1,1.2,crema);K.caja(2.05,0,-0.5,0.08,3.1,1.0,K.std(0x2B2E33,{roughness:0.8}));
    REP.forEach(function(y){K.caja(0,y-0.035,ZP+0.18-0.18,5.3,0.035,0.38,blanco)});K.caja(0,3.0,ZP,5.3,0.05,0.4,blanco);
    [-0.97,-0.11,0.77,1.85].forEach(function(x){K.caja(x,0.1,ZP,0.05,2.95,0.38,blanco)});
    var rnd=(function(){var s=7;return function(){s=(s*9301+49297)%233280;return s/233280}})();
    function fila(x0,x1,y,tipo,cols,alto){var x=x0+0.03,i=0;var lim=Math.min(alto||0.36,0.38);
      while(x<x1-0.06){var c=cols[i%cols.length],w;
        if(tipo==="lata"){w=0.064;for(var q=0;q<Math.floor((lim-0.02)/0.1);q++){var l=K.prodLata(0.03,0.095,(i*3+q)%14);l.position.set(x+w/2,y+q*0.098,ZP+0.02)}}
        else if(tipo==="botella"){w=0.06;var b=K.prodBotella(0.027,Math.min(0.22,lim-0.05),c);b.position.set(x+w/2,y,ZP+0.04)}
        else if(tipo==="galon"){w=0.14;K.caja(x+w/2,y,ZP+0.02,0.13,0.27,0.12,K.std(c,{roughness:0.35,transparent:true,opacity:0.92}));K.caja(x+w/2,y+0.1,ZP+0.082,0.1,0.08,0.005,K.std(0x2E8A3E,{roughness:0.6}))}
        else if(tipo==="bolsa"){w=0.085;var g=K.prodBolsa(0.08,Math.min(0.2,lim-0.06),0.06,(i*5)%14);g.position.set(x+w/2,y+Math.min(0.2,lim-0.06)/2,ZP+0.03);g.material=K.std(c,{roughness:0.6})}
        else if(tipo==="sobre"){w=0.058;var sb=K.caja(x+w/2,y+0.16,ZP+0.08,0.052,0.13,0.01,K.std(c,{roughness:0.5}));sb.rotation.x=-0.35;sb.rotation.z=(rnd()-0.5)*0.3}
        else {w=0.06+((i*7)%3)*0.015;var h=Math.min(0.12+((i*5)%3)*0.04,lim-0.06);K.caja(x+w/2,y,ZP+0.02,w-0.012,h,0.09,K.std(c,{roughness:0.55}))}
        x+=w+0.008;i++}}
    var Y=0xF2C230,R=0xC8342B,G=0x3E8E3E,B=0x2F5FB0,W=0xEDEDE6,P=0x6A3A8C,N=0xE07A2A;
    // repisas de arriba abajo, por tramos: izq (-2.6…-1.03) | centro (-1.03…0.80) | der (0.80…1.95), como en el video
    fila(-2.6,1.93,2.56,"lata",[Y,W,R,G],0.4);
    fila(-2.6,-2.15,2.10,"bolsa",[0xF4E04A,0xE8D23A],0.42);fila(-2.15,-1.06,2.10,"lata",[R,G,W,R],0.42);fila(-0.95,0.15,2.10,"sobre",[P,W,0x2A2A7A,P]);fila(0.2,1.85,2.10,"sobre",[B,W,0x2A4AA0,W]);fila(0.85,1.93,1.82,"botella",[0x1E5A2A,0x2A6A3A],0.28);
    fila(-2.6,-1.06,1.70,"botella",[Y,0xF0D040]);fila(-1.0,-0.25,1.70,"lata",[W,W,0xD8D8D0]);fila(-0.25,0.0,1.70,"botella",[R,0x8A3A20]);fila(0.02,0.78,1.70,"caja",[Y,B,0x4A9AE0,Y]);fila(0.85,1.93,1.70,"botella",[0x8A3A20,R,0xB02A4A,R,G,G]);
    fila(-2.6,-1.06,1.33,"galon",[0xF2C64A]);fila(-1.0,0.0,1.33,"botella",[Y,0xF0D040],0.3);fila(0.02,0.78,1.33,"botella",[0x8A3A20,0x5A3A20,R]);fila(0.85,1.93,1.33,"lata",[W,B,0xE9A0B0,W]);
    fila(-2.6,-1.6,0.79,"bolsa",[R,0xE96A8A,R,W],0.5);fila(-1.6,-0.6,0.79,"caja",[0xF2A23A,0xF4E04A,0xE0D0B0],0.5);fila(-0.6,0.02,0.79,"bolsa",[0x9AD04A,0xB8E060,W],0.5);fila(0.02,0.78,0.79,"bolsa",[B,0x3A5AA0,Y],0.5);fila(0.85,1.93,0.79,"caja",[0x2F64C8,W,0x2F64C8,R,G],0.45);
    fila(-2.6,-1.06,0.38,"caja",[0x3A3A4A,R,B],0.4);fila(0.2,0.78,0.38,"caja",[R,W],0.4);fila(0.85,1.93,0.38,"caja",[0x2F64C8,W,0x9CC8F0,0x2F64C8],0.4);
    // balanza colgante
    var cro=K.mat.cromo||K.std(0xC9CDD3,{metalness:0.8,roughness:0.3});
    var dial=K.cil(0,1.80,0.6,0.115,0.115,0.04,K.std(0xF7F7F2,{roughness:0.4}));dial.rotation.x=Math.PI/2;var aro=K.cil(0,1.80,0.59,0.125,0.125,0.035,cro);aro.rotation.x=Math.PI/2;
    K.caja(0,2.02,0.59,0.015,0.9,0.015,cro);K.caja(0,1.62,0.6,0.012,0.16,0.012,K.std(0x6B4A2A));
    var plato=K.grupo(0.0,0.62,0);K.cil(0,1.25,0,0.17,0.14,0.03,K.std(0x8C8E86,{metalness:0.6,roughness:0.5}),plato);
    [[-0.16,0],[0.16,0]].forEach(function(p){var c=K.caja(p[0]*0.35,1.27,0,0.006,0.36,0.006,K.std(0x5A4030),plato);c.rotation.z=p[0]>0?-0.25:0.25});
    // tendero detrás del mostrador
    var T=persona(K,{piel:0x5A3A28,ancho:1.15,ropa:{camisa:0xF4F4F0,pantalon:0x2B3038,zapatos:0x1C1E22,gorra:0xE8E04A},
      escala:0.97,ruta:[[0,0.13,0.3,"idle",0.13,3],[11.6,0.13,0.3,"idle",0.13,3],[12.9,0.24,0.32,"idle",0.2,3]]});
    var bolsa=K.caja(0,0,0,0.16,0.22,0.1,K.std(0xEAF2F4,{transparent:true,opacity:0.55,roughness:0.2}));bolsa.castShadow=false;
    T.post=function(t){var a=ventana(t,0.7,12.6,0.5,0.4);if(a>0){var s=Math.sin(t*2.1)*0.05;K.ik(T,"Right",new THREE.Vector3(-0.02,1.32+s,0.62),a);K.ik(T,"Left",new THREE.Vector3(0.2,1.42-s,0.6),a*0.9)}
      var h=K.manoPos(T,"Right");bolsa.position.set(h.x+0.04,h.y-0.16,h.z+0.02);bolsa.visible=a>0.3};
    K.camara(cam.pos,cam.mira,{id:o.id||"CAM MOSTRADOR",fov:cam.fov});
    return{cam:cam,T:T}}

  /* ---------- huecos: clip con el modelo v3 quemado (H1 y H2 confirmados en el segundo 2,7) ---------- */
  var CAM_HU={pos:[0,1.55,2.0],mira:[0,1.63,-1.0],fov:42.4}; // el clip de huecos está un poco más abierto (medido con ORB contra el limpio)
  S.ajustar("huecos",function(d){d.dur=12.9;d.camara={pos:[2.6,2.4,3.6],mira:[0,1.4,-0.8]};delete d.camaraFranq;
    d.desc="Marca los huecos de la estantería y calcula el porcentaje de disponibilidad. En el video, el modelo confirma dos huecos (H1 arriba, junto a la balanza, y H2 abajo a la izquierda) mientras el tendero atiende: la disponibilidad baja a 97 %.";
    d.fases=[[0,"ok","Estantería surtida: disponibilidad 100 %"],[2.7,"alerta","Dos huecos confirmados (H1 y H2): disponibilidad 97 %"],[7.5,"detecta","H1 se tapa al reacomodar; sigue confirmado H2 · 98 %"]];
    d.armar=function(K){var B=tiendaBarrio(K,{cam:CAM_HU,id:"CAM MOSTRADOR"}),cam=B.cam;
      var H1=caja2D(K,cam,0.338,0.18,0.375,0.25,ZP+0.05,{texto:"H1",estado:"alerta"}),H2=caja2D(K,cam,0.155,0.925,0.21,0.995,ZP+0.05,{texto:"H2",estado:"alerta"});H1.visible=H2.visible=false;
      var e=reloj();return function(t){H1.visible=t>2.7&&t<7.5;H2.visible=t>2.7;var n=(H1.visible?1:0)+(H2.visible?1:0);
        K.contador("Disponibilidad",t<2.7?"100 %":(n===2?"97 %":"98 %"));K.contador("Huecos confirmados",String(n));
        e(t,2.7,"a",function(){K.evento("Hueco en góndola confirmado · H1 y H2","alerta")})}}});
  S.video("huecos",{src:CARPETA+"huecos.mp4",poster:CARPETA+"huecos-poster.jpg",chapa:"video público (Pixabay) · modelo real v3",
    fuente:"Pixabay",autor:"modoflai",url:"https://pixabay.com/videos/man-store-shop-supermarket-208777/",licencia:"Pixabay Content License",evento:2.7,
    marcas:[{tipo:"zona",pts:[[0.338,0.18],[0.375,0.18],[0.375,0.25],[0.338,0.25]],color:"alerta",etiqueta:"H1",desde:2.7,hasta:7.5},
            {tipo:"zona",pts:[[0.155,0.925],[0.21,0.925],[0.21,0.995],[0.155,0.995]],color:"alerta",etiqueta:"H2",desde:2.7}]});

  /* ---------- fleje: mismo mostrador, clip limpio. Esta tienda no tiene flejes en el borde de las repisas ---------- */
  var BORDES=[[0.25,0.285,"repisa 2"],[0.425,0.445,"repisa 3"],[0.605,0.59,"repisa 4"],[0.86,0.80,"repisa 5"]];
  S.ajustar("fleje",function(d){d.dur=12.9;d.camara={pos:[2.6,2.4,3.6],mira:[0,1.4,-0.8]};delete d.camaraFranq;
    d.desc="Lee el borde de cada repisa buscando el fleje con el precio y lo cruza con el producto de encima. En este video la estantería no tiene ningún fleje: cada tramo sale «sin fleje» y queda el aviso para rotular antes de abrir.";
    d.fases=[[0,"vigila","Recorre el borde de cada repisa buscando el fleje"],[3,"detecta","Tramos leídos sin encontrar fleje"],[7,"alerta","4 repisas sin fleje: aviso para rotular precios"]];
    d.armar=function(K){var B=tiendaBarrio(K,{id:"CAM MOSTRADOR"}),cam=B.cam;
      var R=[];BORDES.forEach(function(b,j){[[0.0,0.235],[0.235,0.5],[0.5,0.72],[0.72,1.0]].forEach(function(s,k){var ym=lerp(b[0],b[1],(s[0]+s[1])/2);var r=caja2D(K,cam,s[0]+0.004,ym-0.012,s[1]-0.004,ym+0.012,ZP+0.19,{texto:"",estado:"vigila"});r.k=j*4+k;r.visible=false;R.push(r)})});
      var e=reloj();return function(t){var leidos=0;R.forEach(function(r){var t0=0.8+r.k*0.22;r.visible=t>t0;if(t>t0)leidos++;r.set(t>7?"alerta":(t>t0+1.2?"detecta":"vigila"),t>7&&r.k%4===0?"sin fleje":"")});
        K.contador("Tramos leídos",leidos+" de 16");K.contador("Sin fleje",t>3?String(Math.min(16,Math.max(0,Math.floor((t-3)/0.22)))):"0");e(t,7,"a",function(){K.evento("4 repisas sin fleje · rotular precios","alerta")})}}});
  S.video("fleje",{src:CARPETA+"fleje.mp4",poster:CARPETA+"fleje-poster.jpg",chapa:"video público (Pixabay) · marcas de referencia, sin modelo",
    fuente:"Pixabay",autor:"modoflai",url:"https://pixabay.com/videos/man-store-shop-supermarket-208777/",licencia:"Pixabay Content License",evento:7,
    marcas:[].concat.apply([],BORDES.map(function(b){var pts=[[0.0,b[0]],[1.0,b[1]]];return[{tipo:"linea",pts:pts,color:"vigila",etiqueta:"leyendo · "+b[2],desde:0.8,hasta:3},{tipo:"linea",pts:pts,color:"detecta",etiqueta:"sin fleje · "+b[2],desde:3,hasta:7},{tipo:"linea",pts:pts,color:"alerta",etiqueta:"sin fleje · "+b[2],desde:7}]}))});

  /* ---------- vencido: mismo clip; marcas sobre las cajas de leche y jugo de la repisa baja a la derecha ---------- */
  var VEN=[{p:[0.855,0.655,0.905,0.79],e:"detecta",t:"vence 3 d",t0:4.5},{p:[0.91,0.655,0.96,0.79],e:"detecta",t:"vence 3 d",t0:4.9},{p:[0.76,0.86,0.82,0.995],e:"detecta",t:"vence 5 d",t0:5.3},{p:[0.88,0.86,0.94,0.995],e:"alerta",t:"vencido",t0:8.5}];
  S.ajustar("vencido",function(d){d.dur=12.9;d.camara={pos:[2.6,2.4,3.6],mira:[0,1.4,-0.8]};delete d.camaraFranq;
    d.desc="Lee la fecha de vencimiento de lo que está a la vista. Marca en ámbar lo que vence en los próximos días y en rojo lo que ya venció, para retirarlo a tiempo. En el video: jugos y leches de la repisa baja, detrás del mostrador.";
    d.fases=[[0,"vigila","Lee la fecha de cada producto visible"],[4.5,"detecta","Tres productos vencen esta semana"],[8.5,"alerta","Una leche ya está vencida: aviso para retirarla"]];
    d.armar=function(K){var B=tiendaBarrio(K,{id:"CAM MOSTRADOR"}),cam=B.cam;
      var R=VEN.map(function(v){var r=caja2D(K,cam,v.p[0],v.p[1],v.p[2],v.p[3],ZP+0.1,{texto:v.t,estado:v.e});r.visible=false;r.t0=v.t0;return r});
      var e=reloj();return function(t){R.forEach(function(r){r.visible=t>r.t0});K.contador("Fechas leídas",String(Math.min(64,Math.floor(t*6))));K.contador("Por vencer",String(R.filter(function(r){return r.visible&&r.estado==="detecta"}).length));K.contador("Vencidos",t>8.5?"1":"0");
        e(t,8.5,"a",function(){K.evento("Producto vencido · leche 1 L · retirar","alerta")})}}});
  S.video("vencido",{src:CARPETA+"fleje.mp4",poster:CARPETA+"vencido-poster.jpg",chapa:"video público (Pixabay) · marcas de referencia, sin modelo",
    fuente:"Pixabay",autor:"modoflai",url:"https://pixabay.com/videos/man-store-shop-supermarket-208777/",licencia:"Pixabay Content License",evento:8.5,
    marcas:VEN.map(function(v){return{tipo:"zona",pts:[[v.p[0],v.p[1]],[v.p[2],v.p[1]],[v.p[2],v.p[3]],[v.p[0],v.p[3]]],color:v.e,etiqueta:v.t,desde:v.t0}})});
  /* ============ puertas: Mixkit 49350 · hombre abre un congelador combinado, saca una bandeja y lo cierra ============
     Cámara resuelta con solvePnP sobre los marcos de las puertas del cuadro 0,5 s (cámara baja, mirando a lo largo de la fila). */
  var CAM_PU={pos:[0.69,1.15,0.62],mira:[-1.228,1.50,0.174],fov:36};
  S.ajustar("puertas",function(d){d.dur=11;d.camara={pos:[1.6,2.3,2.6],mira:[-1.6,1.2,0.0]};delete d.camaraFranq;
    d.desc="Sabe si cada puerta está abierta o cerrada y desde cuándo: congeladores, neveras, cuartos fríos, bodegas o la entrada. En el video el cliente abre un congelador, saca una bandeja y lo cierra a los 5 segundos: queda registrado y, como no pasó del límite, no hay aviso.";
    d.fases=[[0,"ok","Congeladores cerrados"],[1.6,"detecta","Abre la puerta 3: empieza a contar el tiempo"],[4.4,"detecta","Saca una bandeja con la puerta abierta"],[6.8,"ok","La cierra a los 5 s: dentro del límite, sin aviso"]];
    d.armar=function(K){var cam=CAM_PU;K.piso(16,10,K.std(0xE9E7E2,{roughness:0.35}));
      var alu=K.std(0xD5D9DE,{metalness:0.6,roughness:0.3}),oscuro=K.std(0x1E2226,{metalness:0.4,roughness:0.4}),W=0.525,yb=1.15,yt=2.13,hinge=-0.92;
      K.caja(-4,yt,-0.25,10,0.28,0.6,K.std(0xF2F4F6,{roughness:0.5}));K.caja(-4,0,-0.5,10,2.6,0.08,K.std(0xE8ECEF));
      K.caja(-4,0,0.16,10,0.95,0.44,K.std(0xDCE0E4,{metalness:0.55,roughness:0.22}));K.caja(-4,0.95,0.37,10,0.04,0.05,alu);K.caja(-4,0.95,-0.2,10,yb-0.95,0.4,K.std(0xC9CED4,{metalness:0.4,roughness:0.3}));
      var P0=null;
      for(var k=-10;k<3;k++){var xa=hinge+k*W-W;   // puerta k: de xa (borde libre, lejos) a xa+W (bisagra, cerca)
        K.caja(xa+W/2,yb,-0.42,W-0.02,yt-yb,0.02,K.std(0xEEF3F8,{emissive:0xDDE8FF,emissiveIntensity:0.6}));
        for(var n=0;n<2;n++){var y=yb+0.05+n*0.45;K.caja(xa+W/2,y,-0.2,W-0.04,0.012,0.4,K.std(0xCFE6F5,{transparent:true,opacity:0.5}));
          for(var i=0;i<3;i++)K.caja(xa+0.09+i*0.16,y+0.012,-0.22,0.13,0.12+((i+n+k)&1)*0.1,0.12,K.std([0xE24A2E,0xF2C230,0x2F7BEA,0xE8E8E8,0x3E8E3E][(i+n*2+k+20)%5],{roughness:0.5}))}
        K.caja(xa+W,yb,0,0.04,yt-yb,0.05,alu);
        var piv=new THREE.Group();piv.position.set(xa+W-0.02,0,0.03);K.add(piv);var pw=W-0.04,mt=k===0?oscuro:alu;
        K.caja(-pw/2,yb+0.01,0,pw,0.05,0.035,mt,piv);K.caja(-pw/2,yt-0.06,0,pw,0.05,0.035,mt,piv);K.caja(-0.025,yb,0,0.05,yt-yb,0.035,mt,piv);K.caja(-pw+0.025,yb,0,0.05,yt-yb,0.035,mt,piv);
        K.caja(-pw/2,yb+0.06,0,pw-0.08,yt-yb-0.12,0.008,K.std(0xD8ECF8,{transparent:true,opacity:0.25,roughness:0.03,metalness:0.2,depthWrite:false}),piv);
        var man=K.caja(-pw+0.06,1.45,0.035,0.02,0.4,0.02,alu,piv);piv.userData.man=man;if(k===0)P0=piv}
      var bandeja=K.caja(0,0,0,0.24,0.035,0.17,K.std(0xE8461E,{roughness:0.45}));bandeja.position.set(hinge-0.3,yb+0.5,-0.22);
      var Pp=persona(K,{piel:0xE2B48C,escala:0.93,ancho:0.95,ropa:{camisa:0x4A5A2E,pantalon:0x2E3A2A,zapatos:0x2B2B2B},
        ruta:[[0,-0.78,0.6,"idle",-0.78,-1],[6.9,-0.78,0.6,"idle",-0.78,-1],[7.6,-0.8,0.62,"idle",0.6,1.2],[11,-0.8,0.62,"idle",0.6,1.2]]});
      function ang(t){return t<1.6?0:(t<2.6?suave(t-1.6)*1.45:(t<5.8?1.45:(t<6.8?1.45*(1-suave(t-5.8)):0)))}
      Pp.post=function(t){var mp=P0.userData.man.getWorldPosition(new THREE.Vector3());
        var a=ventana(t,0.3,2.7,0.4,0.3);if(a>0)K.ik(Pp,"Right",mp,a);
        var b=ventana(t,2.8,5.0,0.4,0.4);if(b>0){var tg=t<4.5?new THREE.Vector3(hinge-0.3,yb+0.55,-0.15):K.local(Pp,-0.1,1.2,0.35);K.ik(Pp,"Right",tg,b)}
        var c=ventana(t,5.6,6.9,0.3,0.3);if(c>0)K.ik(Pp,"Left",mp,c);
        var dd=ventana(t,4.8,11.2,0.4,0.2);if(dd>0){K.ik(Pp,"Right",K.local(Pp,-0.12,1.18,0.33),dd);if(t>6.9)K.ik(Pp,"Left",K.local(Pp,0.14,1.16,0.33),dd)}};
      var Rp=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:yt-yb,rot:0},{texto:"cerrada",w:W,h:yt-yb,d:0.08,estado:"ok"});Rp.fijo=[hinge-W/2,yb,0.02];
      var et=K.etiqueta("","reloj",K.punto(hinge-W/2,yt+0.12,0.1));var e=reloj();K.camara(cam.pos,cam.mira,{id:"CAM CONGELADOS",fov:cam.fov});
      return function(t){P0.rotation.y=ang(t);if(t>4.5&&!bandeja.userData.tom){bandeja.userData.tom=1;K.agarrar(bandeja,Pp,"Right")}
        var ab=t>=1.6&&t<6.8,s=ab?t-1.6:(t>=6.8?5.2:0);Rp.set(ab?"detecta":"ok",ab?"abierta · "+Math.floor(s)+" s":(t>=6.8?"cerrada · 5 s":"cerrada"));
        et.set(ab?"abierta · "+Math.floor(s)+" s de 60":"","reloj");et.el.hidden=!ab;
        e(t,6.8,"c",function(){K.evento("Congelador 3 · abierto 5 s · cerrado dentro del límite","")});
        K.contador("Puertas abiertas",ab?"1 de 12":"0 de 12");K.contador("Congelador 3",ab?"abierto "+Math.floor(s)+" s":(t>=6.8?"cerrado · 5 s":"cerrado"));K.contador("Límite","60 s")}}});
  S.video("puertas",{src:CARPETA+"puertas.mp4",poster:CARPETA+"puertas-poster.jpg",chapa:"video público (Mixkit) · marcas de referencia, sin modelo",
    fuente:"Mixkit",autor:"Mixkit",url:"https://mixkit.co/free-stock-video/man-chooses-products-from-supermarket-refrigerators-49350/",licencia:"Mixkit Stock Video Free License",evento:6.8,
    marcas:[{tipo:"zona",pts:[[0.56,0.02],[0.67,0.0],[0.67,0.78],[0.56,0.76]],color:"detecta",etiqueta:"congelador 3 · abierto",desde:1.6,hasta:6.8},
            {tipo:"zona",pts:[[0.56,0.02],[0.67,0.0],[0.67,0.78],[0.56,0.76]],color:"ok",etiqueta:"congelador 3 · cerrado",hasta:1.6},
            {tipo:"zona",pts:[[0.56,0.02],[0.67,0.0],[0.67,0.78],[0.56,0.76]],color:"ok",etiqueta:"cerrado · 5 s",desde:6.8}]});

  /* ============ bodega: Pixabay 209883 · pasillo entre racks; un carro con mercancía queda en el pasillo
     y el montacargas trabaja al fondo ============ */
  var CAM_BO={pos:[0,1.35,0],mira:[-0.2,2.4,-10],fov:45};
  S.ajustar("bodega",function(d){d.dur=16;d.camara={pos:[6,6,4],mira:[0.2,1,-8]};delete d.camaraFranq;
    d.desc="Calcula cuánto de cada rack está ocupado y avisa de la mercancía que queda en un pasillo o fuera de su zona. En el video, un carro cargado se queda en el pasillo de circulación mientras el montacargas trabaja al fondo: pasa el tiempo permitido y salta el aviso.";
    d.fases=[[0,"vigila","Mide la ocupación de cada rack y vigila el pasillo"],[2,"detecta","Carro con mercancía detenido en el pasillo"],[9.5,"alerta","Sigue en el pasillo de circulación: aviso"]];
    d.armar=function(K){var cam=CAM_BO;K.piso(14,40,K.mat.concreto,3);
      K.caja(0,0,-18,14,7,0.2,K.std(0xC9CDD2,{roughness:0.9}));K.caja(0,7,-8,14,0.1,40,K.std(0xB8BDC4,{roughness:0.9}));
      for(var z=-2;z>-18;z-=3){K.caja(0,6.6,z,0.25,0.06,2.2,K.std(0xFFFFFF,{emissive:0xFFFFFF,emissiveIntensity:1}))}
      var nar=K.std(0xE0601E,{roughness:0.55,metalness:0.2}),MAD=[0xD9B98A,0xE3CFA6,0xCDAA74,0xEDE3CC],AZ=0x2F6FD0,BL=0xE8E4DA;
      var cnt=0,ocup=[0,0],tot=[0,0];
      [[-2.1,-1,0],[1.5,1,1]].forEach(function(lado){var xf=lado[0],sg=lado[1],id=lado[2];
        for(var zc=0.5;zc>-12.8;zc-=2.6){[0,1.2].forEach(function(dz){K.caja(xf+sg*0.6,0,zc-dz*0+0,0.12,5.4,0.12,nar)})}
        for(var lv=0;lv<9;lv++){var y=0.12+lv*0.6;K.caja(xf+sg*0.06,y,-6,0.1,0.08,13.5,nar);
          for(var zc2=0.2;zc2>-12.2;zc2-=1.3){tot[id]++;var h=((lv*7+Math.round(zc2*3)+id*5)%11+11)%11;if(h===3||h===8)continue;ocup[id]++;
            var c=(id===0&&lv>=5&&lv<=7)?(lv===6&&zc2>-4?0x2BA39A:AZ):(h%4===0?BL:MAD[h%4]);var hh=0.25+((h*3)%4)*0.06;
            K.caja(xf+sg*0.6,y+0.08,zc2-0.6,1.1,hh,1.15,K.std(c,{roughness:0.8}))}}});
      // montacargas al fondo y carro cargado en el pasillo
      var mc=K.montacargas(0,0,0);mc.userData.obst=false;mc.scale.setScalar(0.9);
      var pal=K.caja(0,0,0,1.0,0.25,1.0,K.std(0xD9B98A,{roughness:0.8}));
      var carro=K.grupo(-1.85,-9.5,0);carro.userData.sinObst=true;var ac=K.std(0x707884,{metalness:0.6,roughness:0.4});
      K.caja(0,0.25,0,0.6,0.04,1.1,ac,carro);K.caja(0,0.25,-0.55,0.6,0.8,0.03,ac,carro);K.caja(0,0.25,0.55,0.6,0.8,0.03,ac,carro);
      [[-0.27,-0.5],[0.27,-0.5],[-0.27,0.5],[0.27,0.5]].forEach(function(p){K.cil(p[0],0,p[1],0.06,0.06,0.25,K.mat.goma,carro)});
      for(var i=0;i<6;i++){var b=K.caja((i%2-0.5)*0.25,0.3+Math.floor(i/2)*0.18,((i%3)-1)*0.3,0.25,0.18,0.3,K.std([0x8CC152,0xE8E4DA,0x6FAF3A][i%3],{roughness:0.7}),carro);b.rotation.y=i*0.4}
      var Z=K.zona([[-2.05,-1.0],[1.45,-1.0],[1.45,-12.3],[-2.05,-12.3]],{estado:"vigila",op:0.08});
      var R=K.recuadro({raiz:carro,visible:true,alto:1.1,rot:0},{texto:"carro",w:0.75,h:1.15,d:1.2,estado:"vigila"});R.fijo=[-1.85,0,-9.5];
      var Rm=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:2.3,rot:0},{texto:"montacargas",w:1.2,h:2.3,d:2,estado:"ok"});
      var e=reloj();K.camara(cam.pos,cam.mira,{id:"CAM PASILLO 4",fov:cam.fov,alcance:14});
      return function(t){var x,zf=-14.2,ry,lev=0;
        if(t<5){x=-0.6;ry=-Math.PI/2}else if(t<9){var k=suave((t-5)/4);x=lerp(-0.6,0.3,k);ry=lerp(-Math.PI/2,0,k)}else{x=0.3;ry=0;lev=suave((t-9)/4)*2.2;zf=lerp(-14.2,-13.4,(t-9)/7)}
        mc.position.set(x,0,zf);mc.rotation.y=ry;pal.position.set(x+Math.sin(ry)*1.25,0.15+lev,zf+Math.cos(ry)*1.25);pal.rotation.y=ry;
        Rm.fijo=[x,0,zf];Rm.set("ok",lev>0.2?"montacargas · subiendo carga":"montacargas");
        var min=t<2?0:Math.floor((t-2)*0.45);R.set(t>9.5?"alerta":(t>2?"detecta":"vigila"),t>9.5?"en pasillo · 4 min":(t>2?"carro detenido · "+min+" min":"carro"));Z.set(t>9.5?"alerta":"vigila",t>9.5);
        K.contador("Rack izquierdo",Math.round(100*ocup[0]/tot[0])+" %");K.contador("Rack derecho",Math.round(100*ocup[1]/tot[1])+" %");K.contador("Pasillo",t>9.5?"obstruido":"libre");
        e(t,9.5,"a",function(){K.evento("Carro con mercancía en el pasillo de circulación · 4 min","alerta")})}}});
  S.video("bodega",{src:CARPETA+"bodega.mp4",poster:CARPETA+"bodega-poster.jpg",chapa:"video público (Pixabay) · marcas de referencia, sin modelo",
    fuente:"Pixabay",autor:"GreenCardShow",url:"https://pixabay.com/videos/forklift-machinery-loading-209883/",licencia:"Pixabay Content License",evento:9.5,
    marcas:[{tipo:"zona",pts:[[0.06,1.0],[0.80,1.0],[0.58,0.71],[0.36,0.72]],color:"vigila",etiqueta:"pasillo de circulación",hasta:9.5},
            {tipo:"zona",pts:[[0.06,1.0],[0.80,1.0],[0.58,0.71],[0.36,0.72]],color:"alerta",etiqueta:"pasillo obstruido",desde:9.5},
            {tipo:"zona",pts:[[0.30,0.60],[0.40,0.60],[0.40,0.79],[0.30,0.79]],color:"detecta",etiqueta:"carro detenido",desde:2,hasta:9.5},
            {tipo:"zona",pts:[[0.30,0.60],[0.40,0.60],[0.40,0.79],[0.30,0.79]],color:"alerta",etiqueta:"en pasillo · 4 min",desde:9.5}]});

  /* ============ destruccion: clip de cámara de seguridad ya existente (pasillo con dos papeleras), tramo 5,5–19,5 s
     del original. Cámara resuelta con solvePnP sobre las dos papeleras y el fondo del pasillo. ============ */
  var CAM_DE={pos:[-1.83,2.14,-0.3],mira:[0.1,1.67,-2.54],fov:59};
  S.ajustar("destruccion",function(d){d.dur=14;d.camara={pos:[-4.5,4.2,2.5],mira:[-0.6,0.6,-4]};delete d.camaraFranq;
    d.desc="Fija el contenedor de destrucción y su boca, y sigue las manos. Cada producto que alguien bota queda registrado con su hora: la mano entra cargada y sale vacía. Así la pérdida deja de ser un faltante sin explicar. En el video, una persona se levanta de la banca, va al contenedor y deposita algo.";
    d.fases=[[0,"vigila","Contenedor y boca fijados; una persona en la banca"],[3.4,"detecta","Se acerca al contenedor con la mano cargada"],[5.3,"detecta","La mano entra en la boca del contenedor"],[6,"ok","Sale vacía: depósito registrado · pérdida 3 → 4"]];
    d.armar=function(K){var cam=CAM_DE;K.piso(8,30,K.std(0xC9C2B2,{roughness:0.85}));
      var muro=K.std(0x3E464E,{roughness:0.8});K.caja(0.05,0,-6,0.1,3.0,22,muro);K.caja(-2,3.0,-6,4.4,0.12,22,K.std(0x3A2E26,{roughness:0.8}));
      for(var z=-1;z>-13;z-=3.2)K.caja(-1.2,2.86,z,0.25,0.06,1.6,K.std(0xFFFFFF,{emissive:0xFFFFFF,emissiveIntensity:1}));
      K.caja(-1.2,0,-13.2,2.4,3,0.05,K.std(0xF4F6F8,{emissive:0xFFFFFF,emissiveIntensity:0.9}));for(var i=0;i<8;i++)K.caja(-1.2,i*0.18,-12.8-i*0.25,2.0,0.06,0.25,K.std(0xBFC3C8));
      K.caja(-2.5,0,-12.6,0.3,3,1.2,K.std(0x2E3238));K.caja(0.0,0,-12.6,0.3,3,1.2,K.std(0x2E3238));
      var afiche=K.caja(0.0,1.1,-4.6,0.02,1.05,1.3,K.std(0x2F6FC8,{roughness:0.6}));K.caja(-0.02,1.18,-4.6,0.02,0.85,1.1,K.std(0xC89A6A,{roughness:0.7}));
      var barra=K.caja(-0.05,1.6,-9,0.04,0.05,4.5,K.std(0x9AA0A8,{metalness:0.6,roughness:0.4}));barra.rotation.x=-0.12;
      function banca(x,z,ry){var g=K.grupo(x,z,ry||0),m=K.std(0x8A5A34,{roughness:0.7});K.caja(0,0.42,0,0.45,0.05,1.6,m,g);K.caja(-0.2,0.47,0,0.05,0.4,1.6,m,g);[-0.7,0.7].forEach(function(zz){K.caja(0,0,zz,0.42,0.42,0.05,K.std(0x2B2E33),g)});return g}
      banca(-0.85,-2.55,0);var bl=banca(-1.25,-7.1,0);bl.children.forEach(function(q){if(q.material)q.material=K.std(0xD8DCE0,{metalness:0.5,roughness:0.4})});
      function papelera(x,z){var g=K.grupo(x,z,0);K.cil(0,0,0,0.2,0.2,0.85,K.std(0x2A3A2E,{metalness:0.3,roughness:0.5}),g);var tapa=K.cil(0,0.85,0,0.21,0.21,0.1,K.std(0x9AA0A8,{metalness:0.8,roughness:0.25}),g);return g}
      var bin=papelera(-0.22,-3.0);papelera(-0.22,-11.0);
      var prod=K.caja(0,0,0,0.12,0.18,0.08,K.std(0xEDEDE6,{roughness:0.5}));prod.position.set(-1.1,0.6,-2.4);
      var P=persona(K,{piel:0x8A5A40,escala:0.97,ropa:{camisa:0x1E2024,pantalon:0x1E2024,zapatos:0x141414},
        ruta:[[0,-1.42,-3.25,"idle",-2.6,-3.3],[1.2,-1.42,-3.25,"idle",-1.0,-1.0],[3.4,-1.37,-3.6,"idle",-0.6,-3.3],[4.8,-0.68,-3.34],[5.0,-0.68,-3.34,"idle",0.5,-3.1],[14,-0.68,-3.34,"idle",0.5,-3.1]]});
      K.agarrar(prod,P,"Right");prod.position.set(0,-0.08,0.05);
      var F=null;
      P.post=function(t){var ag=ventana(t,0,1.4,0.01,0.6);if(ag>0)K.gesto(P,"agacharse",t,ag);
        var a=ventana(t,5.0,6.4,0.35,0.4);if(a>0)K.ik(P,"Right",new THREE.Vector3(-0.3,0.98,-3.05),a);
        var b=ventana(t,8.6,9.4,0.3,0.3);if(b>0)K.ik(P,"Right",new THREE.Vector3(-0.32,1.0,-3.05),b)};
      var Rb=K.recuadro({raiz:bin,visible:true,alto:0.95,rot:0},{texto:"contenedor (ancla)",w:0.45,h:0.95,d:0.45,estado:"ok"});Rb.fijo=[-0.22,0,-3.0];
      var Rm=K.recuadro({raiz:new THREE.Object3D(),visible:true,alto:0.5,rot:0},{texto:"boca",w:0.6,h:0.5,d:0.6,estado:"oro"});Rm.fijo=[-0.22,0.85,-3.0];
      var Rp=K.recuadro(P,{texto:"persona",estado:"vigila"});
      var perd=3,e=reloj();K.camara(cam.pos,cam.mira,{id:"CAM DESTRUCCIÓN",fov:cam.fov,alcance:14});
      return function(t){if(t>5.9&&!prod.userData.lan){prod.userData.lan=1;K.soltar(prod);F=1}
        if(F){var p=prod.position;p.x=lerp(p.x,-0.22,0.2);p.z=lerp(p.z,-3.0,0.2);p.y=Math.max(0.5,p.y-0.06)}
        var mano=t>5.3&&t<6.4;Rm.set(mano?"alerta":"oro",mano?"mano en boca":"boca");
        Rp.set(t>6?"ok":(t>3.4?"detecta":"vigila"),t>6?"mano vacía":(t>1.2?"persona · mano cargada":"persona"));
        e(t,6,"r",function(){perd=4;K.evento("Producto depositado en contenedor · mano cargada 0,87 → 0,05","")});
        K.tabla("Contenedor de destrucción · hoy",["","Unidades"],[{c:["Recibidas","25"]},{c:["Vendidas","18"]},{c:["En góndola",t>6?"3":"4"]},{c:["Pérdida registrada",perd===4?"3 → 4":"3"],cls:perd===4?"nuevo":"ambar"},{c:["Sin explicar","0"]}]);
        K.contador("Depósitos hoy",t>6?"12":"11")}}});
  S.video("destruccion",{src:CARPETA+"destruccion.mp4",poster:CARPETA+"destruccion-poster.jpg",chapa:"cámara de seguridad real · modelo real",
    fuente:"clip ya existente en evidencia-publica/destruccion.mp4 (recortado)",autor:"—",url:"",licencia:"la del clip original (procedencia no documentada en el repo)",evento:6,
    marcas:[{tipo:"zona",pts:[[0.37,0.70],[0.42,0.70],[0.42,0.90],[0.37,0.90]],color:"ok",etiqueta:"contenedor (ancla)"},
            {tipo:"zona",pts:[[0.355,0.59],[0.435,0.59],[0.435,0.78],[0.355,0.78]],color:"oro",etiqueta:"boca",hasta:5.3},
            {tipo:"zona",pts:[[0.355,0.59],[0.435,0.59],[0.435,0.78],[0.355,0.78]],color:"alerta",etiqueta:"mano en boca",desde:5.3,hasta:6.4},
            {tipo:"zona",pts:[[0.355,0.59],[0.435,0.59],[0.435,0.78],[0.355,0.78]],color:"oro",etiqueta:"boca",desde:6.4}]});

})();
