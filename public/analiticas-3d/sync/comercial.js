/* Emparejamiento 3D ↔ video · familia comercial (nov-2026). Ver sync/base.js y docs/vision-alineacion/comercial.md.
   Método: cada clip tiene una cámara calibrada (altura, inclinación y FOV ajustados con pares pie/cabeza de personas del
   video). Con esa misma cámara, cada punto del cuadro (u,v ∈ 0–1) se lleva al piso 3D (CAM.W) → muebles, muros y recorridos
   se escriben en coordenadas del video y caen en el mismo píxel en la vista cctv. Segundos = segundos del clip. */
(function(){
  "use strict";
  var U=window.ESC_UTIL,S=window.ESC_SYNC;if(!U||!S)return;
  var GRAD=Math.PI/180;

  /* Cámara de video: {x,z,h,pitch,fov,yaw} (pitch en grados hacia abajo, fov vertical, yaw en grados, 0 = mira hacia −z). */
  function camVid(o){var ry=(o.yaw||0)*GRAD,p=o.pitch*GRAD,cp=Math.cos(p),sp=Math.sin(p),cy=Math.cos(ry),sy=Math.sin(ry),t=Math.tan(o.fov*GRAD/2),A=16/9;
    var pos=[o.x,o.h,o.z],dir=[-sy*cp,-sp,-cy*cp];
    function W(u,v,y){y=y||0;var x=(2*u-1)*t*A,yy=(1-2*v)*t,dx=x,dy=cp*yy-sp,dz=-sp*yy-cp;var X=dx*cy+dz*sy,Z=-dx*sy+dz*cy;
      if(dy>-1e-4)dy=-1e-4;var k=(o.h-y)/(-dy);return[o.x+X*k,o.z+Z*k]}
    return{pos:pos,mira:[pos[0]+dir[0]*10,pos[1]+dir[1]*10,pos[2]+dir[2]*10],fov:o.fov,W:W,
      /* ruta en coordenadas del video: [[t,u,v,accion?,miraU?,miraV?],…] → ruta del motor */
      /* v numérico = pie en el piso; v como "c0.42" = cabeza (a 1.70 m) cuando los pies quedan fuera del cuadro; "s0.8" = cadera sentada (0.5 m). Puntos casi iguales = quieto. */
      ruta:function(r,alto){alto=alto||1.70;var ant=null;return r.map(function(q){var a=typeof q[2]==="string"?W(q[1],parseFloat(q[2].slice(1)),q[2][0]==="s"?0.5:alto):W(q[1],q[2]);
        if(ant&&Math.hypot(a[0]-ant[0],a[1]-ant[1])<0.3)a=ant;ant=a;var o2=[q[0],a[0],a[1]];if(q[3]!=null||q[4]!=null){o2.push(q[3]||"idle");if(q[4]!=null){var m=W(q[4],q[5]);o2.push(m[0],m[1])}}return o2})},
      /* muro entre dos puntos del video (base en el piso) */
      muro:function(K,a,b,h,m,e,obst){var p=W(a[0],a[1]),q=W(b[0],b[1]),o=K.muro(p[0],p[1],q[0],q[1],h,m,e);if(!obst)o.userData.obst=false;return o},
      /* ángulo (grados del motor) y centro de un tramo dado por dos puntos del video a la altura y */
      tramo:function(a,b,y){var p=W(a[0],a[1],y),q=W(b[0],b[1],y);return{x:(p[0]+q[0])/2,z:(p[1]+q[1])/2,largo:Math.hypot(q[0]-p[0],q[1]-p[1]),ry:-Math.atan2(q[1]-p[1],q[0]-p[0])/GRAD}}}}
  function sinObs(o){o.userData.obst=false;return o}
  function ponerCam(K,C,id,o){return K.camara(C.pos,C.mira,Object.assign({fov:C.fov,id:id},o||{}))}
  function gente(K,C,lista){return lista.map(function(r){return K.persona({ruta:C.ruta(r.ruta,1.70*(r.s||0.99)),escala:r.s||0.99,ropa:r.ropa,color:r.c,piel:r.piel,rot:r.rot})})}
  window.ESC_COMERCIAL={camVid:camVid};
  /* Sentarse sin animación propia: dobla caderas y rodillas y baja el cuerpo; w(t) = 0…1. */
  function sentar(K,P,w,extra){var ul=P.hueso("LeftUpLeg"),ur=P.hueso("RightUpLeg"),ll=P.hueso("LeftLeg"),lr=P.hueso("RightLeg"),sp=P.hueso("Spine");
    P.post=function(t,dt,e){var k=w(t);if(k<=0){P.agacha=0;if(extra)extra(t,0);return}[ul,ur].forEach(function(b){if(b)b.rotation.x-=1.45*k});[ll,lr].forEach(function(b){if(b)b.rotation.x+=1.45*k});if(sp)sp.rotation.x+=0.12*k;P.agacha=1.25*k;if(extra)extra(t,k)}}
  /* Banca de sala de espera: dos puntos del borde delantero del asiento (video), respaldo hacia atrás. */
  function banca(K,C,a,b,o){o=o||{};var tr=C.tramo(a,b,0.45),g=K.grupo(tr.x,tr.z,tr.ry),L=tr.largo,lado=o.lado||1,m=K.std(o.color||0x22252B,{roughness:0.45,metalness:0.2}),pata=K.std(0x3A3D44,{metalness:0.6,roughness:0.4});
    K.caja(0,0.42,lado*0.25,L,0.06,0.5,m,g);K.caja(0,0.48,lado*0.52,L,0.5,0.05,m,g);[-L/2+0.15,L/2-0.15].forEach(function(x){K.caja(x,0,lado*0.25,0.06,0.42,0.45,pata,g)});sinObs(g);return g}


  /* ============ MEVA · cafetería (vestíbulo) — mismo plano para Seguimiento y Mapa de calor ============
     Calibración (pares pie/cabeza, 5 personas, error 0.7 % del alto): altura 2.52 m, 21.2° hacia abajo, FOV vertical 45°. */
  var CAF=camVid({x:0,z:6,h:2.52,pitch:21.2,fov:45});
  function cafeteria(K){var C=CAF,W=C.W;
    K.piso(20,18,K.pbr("tiles",{roughness:0.55,env:0.8,color:0xEDE6D6}));
    var crema=K.std(0xEFE7D6,{roughness:0.9}),franja=K.std(0xB8865A,{roughness:0.8}),marco=K.std(0x23262B,{metalness:0.4,roughness:0.4}),vid=K.mat.vidrio;
    // muro del fondo izquierdo (puerta de madera) y su retranqueo con las puertas de vidrio
    C.muro(K,[-0.25,0.385],[0.30,0.325],3.6,crema);C.muro(K,[0.30,0.325],[0.44,0.315],3.6,crema);
    C.muro(K,[0.44,0.315],[0.60,0.315],3.6,vid,0.05);C.muro(K,[0.60,0.315],[0.625,0.40],3.6,crema,0.3);
    // fachada derecha de ventanales
    C.muro(K,[0.625,0.40],[1.25,0.67],3.6,vid,0.05);
    var pf=[[0.44,0.315],[0.48,0.315],[0.52,0.315],[0.56,0.315],[0.60,0.315],[0.66,0.415],[0.72,0.44],[0.78,0.465],[0.86,0.5],[0.94,0.535],[1.02,0.57]];
    pf.forEach(function(q){var p=W(q[0],q[1]);K.caja(p[0],0,p[1],0.08,3.6,0.08,marco)});
    [[0.44,0.315,0.60,0.315],[0.625,0.40,1.25,0.67]].forEach(function(s){var a=W(s[0],s[1]),b=W(s[2],s[3]),g=K.grupo((a[0]+b[0])/2,(a[1]+b[1])/2,-Math.atan2(b[1]-a[1],b[0]-a[0])/GRAD),L=Math.hypot(b[0]-a[0],b[1]-a[1]);
      K.caja(0,0,0,L,0.12,0.1,marco,g);K.caja(0,2.3,0,L,0.08,0.1,marco,g);K.caja(0,3.5,0,L,0.1,0.1,marco,g)});
    // franja café a media altura sobre los muros macizos
    [[-0.25,0.385,0.30,0.325],[0.30,0.325,0.44,0.315]].forEach(function(s){var a=W(s[0],s[1]),b=W(s[2],s[3]),g=K.grupo((a[0]+b[0])/2,(a[1]+b[1])/2,-Math.atan2(b[1]-a[1],b[0]-a[0])/GRAD),L=Math.hypot(b[0]-a[0],b[1]-a[1]);
      K.caja(0,1.05,0.1,L,0.12,0.02,franja,g);K.caja(0,0,0.1,L,0.1,0.02,franja,g)});
    // puerta de madera con vidrio del fondo izquierdo
    var pd=C.tramo([0.105,0.34],[0.185,0.335],0),gp=K.grupo(pd.x,pd.z,pd.ry);K.caja(0,0,0.1,pd.largo,2.2,0.05,K.std(0xB07A45,{roughness:0.7}),gp);K.caja(-pd.largo*0.22,0.9,0.13,pd.largo*0.3,1.1,0.01,K.std(0xBFD9F0,{roughness:0.1}),gp);K.caja(pd.largo*0.22,0.9,0.13,pd.largo*0.3,1.1,0.01,K.std(0xBFD9F0,{roughness:0.1}),gp);
    // columna y salida de emergencia entre puertas
    var col=W(0.45,0.318);K.caja(col[0],0,col[1]+0.15,0.5,3.6,0.4,crema);
    // techo
    K.techoRejilla(20,18,3.6);var lz=W(0.5,0.5);[[-2,-1],[2,-1],[-2,-6],[2,-6]].forEach(function(q){K.lampara(q[0],3.5,q[1])});
    // mostrador del café (izquierda, en diagonal): borde del lado de la sala a 0.95 m
    var m1=C.tramo([0.12,0.55],[0.245,1.06],0.95);var gm=K.grupo(m1.x,m1.z,m1.ry);sinObs(K.caja(0,0,0.35,m1.largo,0.95,0.7,K.std(0xF2F0EA,{roughness:0.8}),gm));K.caja(0,0.95,0.35,m1.largo+0.06,0.05,0.78,K.std(0xE9E6DD),gm);
    for(var i=0;i<7;i++){var f=i/6-0.5;K.caja(f*m1.largo*0.8,1.0,0.3,0.16,0.06+((i*37)%3)*0.04,0.18,K.std([0xD94F3D,0xF2C230,0x3EA66B,0xE8E2D5,0x8E5BC8,0xF08A2E,0xC8342B][i],{roughness:0.6}),gm)}
    K.cil(-m1.largo*0.38,1.0,0.45,0.12,0.12,0.4,K.std(0x2B3038,{metalness:0.6,roughness:0.35}),gm);K.cil(-m1.largo*0.28,1.0,0.45,0.12,0.12,0.4,K.std(0x2B3038,{metalness:0.6,roughness:0.35}),gm);
    // nevera/estantería oscura al fondo izquierdo
    var nv=W(0.02,0.47);K.caja(nv[0],0,nv[1],0.9,2.0,0.7,K.std(0x1E2228,{roughness:0.5}));
    // mesas altas redondas (derecha) y zona de sillas del fondo
    var t1=W(0.815,0.83,1.05),t2=W(0.965,0.66,1.05);[t1,t2].forEach(function(p){K.mesa(p[0],p[1],{alta:true,r:0.4,sillas:0,mat:K.std(0x1F2A3A,{roughness:0.35})})});
    [[0.30,0.42],[0.43,0.40],[0.49,0.46],[0.38,0.47]].forEach(function(q,i){var p=W(q[0],q[1],0.74);K.mesa(p[0],p[1],{r:0.4,sillas:i%2?3:2,silla:0xC9CDD4,mat:K.std(0xF2F0EA)})});
    var so=C.tramo([0.18,0.355],[0.27,0.35],0),gs=K.grupo(so.x,so.z,so.ry);sinObs(K.caja(0,0,0,so.largo,0.45,0.8,K.std(0x2F4A7A,{roughness:0.9}),gs));K.caja(0,0.45,-0.32,so.largo,0.45,0.16,K.std(0x2F4A7A,{roughness:0.9}),gs);
    var pl=W(0.27,0.3);K.planta(pl[0],pl[1],1.6);
    var bt=W(0.82,0.53);K.caja(bt[0],0,bt[1],0.55,0.95,0.55,K.std(0x6B7078,{roughness:0.6}));
    return C}
  function genteCafeteria(K,C){
    var NEGRO={camisa:0x1A1C20,chaqueta:0x1A1C20,pantalon:0x1C1E22,zapatos:0x111111},
        AZUL={chaqueta:0x1E2A44,pantalon:0x5B78A8,zapatos:0x2A2C30},
        CUADROS={camisa:0x8E8A3A,chaleco:0x6E6A2C,pantalon:0x5B78A8,zapatos:0x2A2C30,gorra:0x3A4A3A},
        GRIS={chaqueta:0x30343A,pantalon:0x2A2C30,zapatos:0x1C1E22};
    return gente(K,C,[
      {ruta:[[0,0.50,0.30],[1.5,0.53,0.47],[3.5,0.63,0.565],[5.5,0.62,0.70],[7.5,0.53,"c0.30"],[9.5,0.47,"c0.40"],[11.5,0.44,"c0.42"],[13.5,0.45,"c0.42"],[16,0.44,"c0.42","idle",0.3,0.9]],ropa:AZUL,s:1.0},      // ID 23
      {ruta:[[0,0.25,"c0.42"],[5.5,0.26,"c0.42","idle",0.1,0.8],[7.5,0.62,"c0.42"],[9.5,0.70,"c0.44"],[16,0.71,"c0.435","idle",0.82,0.84]],ropa:NEGRO,s:1.0},                                     // ID 6
      {ruta:[[0,0.41,"c0.36"],[1.5,0.465,"c0.33"],[5.5,0.46,"c0.33","idle",0.2,0.8],[7.5,0.34,"c0.36"],[9.5,0.21,"c0.40"],[16,0.20,"c0.41","idle",0.05,0.9]],ropa:CUADROS,s:1.0},                   // ID 24
      {ruta:[[0,0.37,0.62],[16,0.37,0.62,"idle",0.3,0.4]],ropa:NEGRO,s:0.96},                                                                                                   // ID 10
      {ruta:[[0,0.42,0.31],[16,0.42,0.31,"idle",0.42,0.5]],ropa:CUADROS,s:0.99},                                                                                                 // ID 5
      {ruta:[[0,0.03,"c0.62"],[16,0.03,"c0.62","idle",0.3,0.9]],ropa:{camisa:0x8FB4D8,pantalon:0x2A2C30,zapatos:0x1C1E22},s:0.95},                                                  // ID 2
      {ruta:[[0,0.47,0.46],[3.5,0.49,0.63],[5.5,0.50,0.60,"idle",0.6,0.7],[8,0.47,0.50],[16,0.47,0.50,"idle",0.5,0.4]],ropa:GRIS,s:0.97},                                        // ID 1
      {ruta:[[0,0.89,0.49],[1.5,0.9,0.5],[3.5,1.08,0.56]],ropa:GRIS,s:0.98},                                                                                                     // ID 9
      {ruta:[[0,0.84,0.76],[1.5,0.74,0.85],[3.2,0.70,1.12]],ropa:NEGRO,s:0.99},                                                                                                  // ID 7
      {ruta:[[0,0.33,0.12],[11.5,0.375,0.25],[13.5,0.33,0.27],[16,0.30,0.265,"idle",0.3,0.4]],ropa:{camisa:0xC8547A,pantalon:0x2A2C30,zapatos:0x1C1E22},s:0.95}               // ID 84
    ])}
  var IDS_CAF=["ID 23","ID 6","ID 24","ID 10","ID 5","ID 2","ID 1","ID 9","ID 7","ID 84"];

  /* ---------- Seguimiento de personas · clip MEVA (seg. 22.5–38.5 del video del portafolio) ---------- */
  S.ajustar("seguimiento",function(d){
    d.dur=16;d.camara={pos:[7,9,13],mira:[0,0.6,-1]};
    d.fases=[[0,"vigila","Cada persona del vestíbulo recibe un número (ID 23, ID 6, ID 24…)"],[6.4,"detecta","ID 6 pasa por delante de ID 23 y lo tapa: el número no se intercambia"],[9.5,"ok","Cada uno sigue con su número después del cruce"]];
    d.armar=function(K){var C=cafeteria(K);ponerCam(K,C,"CAM VESTÍBULO");var P=genteCafeteria(K,C);
      var RQ=P.map(function(p,i){return K.recuadro(p,{texto:IDS_CAF[i]})});
      var ver=function(i,t){if(i===7)return t<3.2;if(i===8)return t<3.0;if(i===9)return t>10.5;return true};
      return function(t){RQ.forEach(function(r,i){var v=ver(i,t);P[i].visible=v;r.visible=v;var cruce=t>6.4&&t<8.6&&(i===0||i===1);r.set(cruce?"detecta":(t>8.6&&(i===0||i===1)&&t<11?"ok":"vigila"))});
        K.contador("Personas en cuadro",String(P.filter(function(p){return p.visible}).length));K.contador("Números asignados","10");K.contador("Cambios de número","0")}};
  });
  S.video("seguimiento",{src:"evidencia-publica/comercial/seguimiento.mp4",poster:"evidencia-publica/comercial/seguimiento-poster.jpg",chapa:"CCTV real (MEVA) · tracker real",
    fuente:"MEVA · Multiview Extended Video with Activities (cámara 0421, vestíbulo)",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:7});

  /* ---------- Mapa de calor · mismo plano MEVA, mismo tramo ---------- */
  S.ajustar("calor",function(d){
    d.dur=16;d.camara={pos:[2,14,9],mira:[0,0,-1.5]};d.sinPip=false;
    d.fases=[[0,"vigila","Cada paso de cada persona del vestíbulo se suma al plano"],[5,"detecta","Se encienden el mostrador del café y el paso hacia las mesas"],[11,"ok","Queda a la vista dónde se detiene la gente y qué zona nadie pisa"]];
    d.armar=function(K){var C=cafeteria(K);ponerCam(K,C,"CAM VESTÍBULO");var P=genteCafeteria(K,C);
      var c0=C.W(0.5,0.62);var H=K.calor(14,12,{x:c0[0],z:c0[1]});
      var ver=function(i,t){if(i===7)return t<3.2;if(i===8)return t<3.0;if(i===9)return t>10.5;return true};
      var k=0,prim=true,tAnt=-1;return function(t,dt){if(prim||t<tAnt-1){prim=false;H.limpiar();P.forEach(function(p,i){for(var tt=0;tt<Math.min(t,16);tt+=0.2){if(!ver(i,tt))continue;var q=p.donde(tt);H.sumar(q.x,q.z,0.5)}});H.pintar()}tAnt=t;
        P.forEach(function(p,i){p.visible=ver(i,t);if(p.visible)H.sumar(p.raiz.position.x,p.raiz.position.z,dt*2.5)});if((k++)%4===0)H.pintar();
        K.contador("Zona más visitada","Mostrador del café");K.contador("Zona sin paso","Junto a los ventanales")}};
  });
  S.video("calor",{src:"evidencia-publica/comercial/calor.mp4",poster:"evidencia-publica/comercial/calor-poster.jpg",chapa:"CCTV real (MEVA) · modelo real",
    fuente:"MEVA · Multiview Extended Video with Activities (cámara 0421, vestíbulo)",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:5});
  /* ---------- Tiempo de permanencia · MEVA sala de espera (cámara G507), seg. 3–19 ---------- */
  var SAL=camVid({x:0,z:4,h:2.68,pitch:38.4,fov:55});
  var ZONA_SAL=[[0.295,0.70],[0.625,0.70],[0.70,1.0],[0.28,1.0]];
  S.ajustar("permanencia",function(d){
    d.dur=16;d.camara={pos:[6,6.5,8],mira:[0,0.5,0]};
    d.fases=[[0,"vigila","Se dibuja la zona frente a la banca de espera"],[5.6,"detecta","ID 2 entra a la zona y su reloj empieza a correr; ID 4 la sigue"],[10,"ok","Se sientan: ya no es paso, es espera (ID 2 lleva más de 4 s)"]];
    d.armar=function(K){var C=SAL,W=C.W;ponerCam(K,C,"CAM SALA");K.piso(16,14,K.pbr("concreto",{roughness:0.85,color:0xA9A59A}));
      var bl=K.std(0xF1EFEA,{roughness:0.9}),vid=K.mat.vidrio,marco=K.std(0xDADCDF,{metalness:0.3,roughness:0.5});
      C.muro(K,[-0.3,0.30],[0.29,0.275],3.2,bl);C.muro(K,[0.29,0.275],[0.60,0.29],3.2,bl);C.muro(K,[0.60,0.29],[0.70,0.36],3.2,bl);C.muro(K,[0.70,0.36],[1.2,0.56],3.2,bl);
      // puertas de vidrio (izq. y der.), puerta oscura y ventanas
      [[[0.155,0.27],[0.27,0.265]],[[0.735,0.385],[0.875,0.445]]].forEach(function(s2){var tr=C.tramo(s2[0],s2[1],0),g=K.grupo(tr.x,tr.z,tr.ry);K.caja(0,0,0.1,tr.largo,2.2,0.04,K.std(0xF7F8FA,{emissive:0xFFFFFF,emissiveIntensity:0.35,roughness:0.2}),g);K.caja(0,1.0,0.13,tr.largo,0.05,0.02,marco,g)});
      var pd=C.tramo([0.535,0.28],[0.59,0.285],0),gd=K.grupo(pd.x,pd.z,pd.ry);K.caja(0,0,0.1,pd.largo,2.1,0.04,K.std(0x2E2A28,{roughness:0.6}),gd);
      var vn=C.tramo([0.61,0.30],[0.69,0.345],0),gv=K.grupo(vn.x,vn.z,vn.ry);K.caja(0,1.1,0.1,vn.largo,1.0,0.04,K.std(0xF7F8FA,{emissive:0xFFFFFF,emissiveIntensity:0.35}),gv);
      K.techoRejilla(16,14,3.2);
      // bancas: naranja al fondo, negras en la sala, y la de la zona
      banca(K,C,[0.41,0.32],[0.56,0.32],{color:0xE07A5F});banca(K,C,[0.0,0.32],[0.07,0.31],{color:0xE07A5F});
      banca(K,C,[0.06,0.43],[0.19,0.37]);banca(K,C,[0.15,0.62],[0.34,0.50]);banca(K,C,[0.55,0.43],[0.69,0.36]);
      banca(K,C,[0.31,1.0],[0.60,0.76],{lado:1});banca(K,C,[0.80,1.02],[0.92,0.86]);
      // fila de sillas de ID 1
      var sl=C.tramo([0.75,0.585],[0.86,0.535],0),gs=K.grupo(sl.x,sl.z,sl.ry);K.caja(0,0.4,0.2,sl.largo,0.06,0.45,K.std(0xE07A5F,{roughness:0.6}),gs);K.caja(0,0.45,0.45,sl.largo,0.5,0.05,K.std(0xE07A5F,{roughness:0.6}),gs);sinObs(gs);
      var rev=W(0.70,0.28);K.caja(rev[0],0,rev[1],0.4,1.6,0.3,K.std(0x5A4A3A,{roughness:0.8}));
      var Zw=ZONA_SAL.map(function(q){return W(q[0],q[1])}),Z=K.zona(Zw,{estado:"vigila"});
      var P=gente(K,C,[
        {ruta:[[0,1.08,0.80],[3.5,1.02,0.80],[4,0.87,0.80],[6,0.64,0.80],[8,0.44,0.81],[9.6,0.385,"s0.86","idle",0.2,1.0],[16,0.385,"s0.86","idle",0.2,1.0]],ropa:{camisa:0xE8789A,pantalon:0x3A2F45,zapatos:0x2A2C30},s:0.88,piel:0x6B4A35},
        {ruta:[[0,1.12,0.86],[4.5,1.03,0.86],[6,0.83,0.85],[8,0.62,0.79],[10,0.50,0.78],[11.2,0.52,"s0.76","idle",0.3,0.95],[16,0.52,"s0.76","idle",0.3,0.95]],ropa:{camisa:0xD9607E,pantalon:0x24324F,zapatos:0x3A2A20,gorra:0xD8C9A8},s:0.98},
        {ruta:[[0,0.79,"s0.56","idle",0.5,0.6],[16,0.79,"s0.56","idle",0.5,0.6]],ropa:{camisa:0x2E3E5C,pantalon:0x5B78A8,zapatos:0x2A2C30},s:0.98}]);
      sentar(K,P[0],function(t){return Math.max(0,Math.min(1,(t-9.3)/0.8))});sentar(K,P[1],function(t){return Math.max(0,Math.min(1,(t-10.9)/0.8))});sentar(K,P[2],function(){return 1});
      var R=[K.recuadro(P[0],{texto:"ID 2"}),K.recuadro(P[1],{texto:"ID 4"}),K.recuadro(P[2],{texto:"ID 1"})];var et=[K.etiqueta("","reloj",K.sobre(P[0])),K.etiqueta("","reloj",K.sobre(P[1]))];var e=U.reloj();
      return function(t){var a=Math.max(0,t-5.6),b=Math.max(0,t-7.9);
        R[0].set(t>=10?"ok":(t>=5.6?"detecta":"vigila"),t>=5.6?"ID 2 · "+a.toFixed(1)+" s":"ID 2");R[1].set(t>=10?"ok":(t>=7.9?"detecta":"vigila"),t>=7.9?"ID 4 · "+b.toFixed(1)+" s":"ID 4");R[2].set("vigila","ID 1");
        et[0].set(t>=5.6?a.toFixed(1)+" s en zona":"",t>=10?"reloj ok":"reloj");et[0].el.hidden=t<5.6;et[1].set(t>=7.9?b.toFixed(1)+" s en zona":"",t>=10?"reloj ok":"reloj");et[1].el.hidden=t<7.9;
        Z.set(t>=10?"ok":(t>=5.6?"detecta":"vigila"));e(t,5.6,"a",function(){K.evento("ID 2 entra a la zona de espera","")});e(t,7.9,"b",function(){K.evento("ID 4 entra a la zona de espera","")});
        K.contador("En la zona ahora",String((t>=5.6?1:0)+(t>=7.9?1:0)));K.contador("ID 2 en zona",a.toFixed(1)+" s");K.contador("ID 4 en zona",b.toFixed(1)+" s")}};
  });
  S.video("permanencia",{src:"evidencia-publica/comercial/permanencia.mp4",poster:"evidencia-publica/comercial/permanencia-poster.jpg",chapa:"CCTV real (MEVA) · modelo real",
    fuente:"MEVA · Multiview Extended Video with Activities (cámara G507, sala de espera)",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:5.6,
    marcas:[{tipo:"zona",pts:ZONA_SAL,color:"vigila",etiqueta:"Zona de espera",hasta:5.6},{tipo:"zona",pts:ZONA_SAL,color:"detecta",etiqueta:"Zona de espera",desde:5.6,hasta:10},{tipo:"zona",pts:ZONA_SAL,color:"ok",etiqueta:"Zona de espera",desde:10}]});
  /* ---------- Cruce de líneas · MEVA pasillo (cámara G423), seg. 12–28 ---------- */
  var PAS=camVid({x:-0.6,z:5,h:2.72,pitch:9.7,fov:50});
  var LINEA_PAS=[[0.43,0.575],[0.66,0.575]];
  S.ajustar("cruce",function(d){
    d.dur=16;d.camara={pos:[8,8,9],mira:[0,0.4,-3]};
    d.fases=[[0,"vigila","Se traza la línea del pasillo y su sentido (hacia la cámara)"],[3.4,"detecta","ID 1 y ID 5 cruzan hacia la cámara: suman al flujo"],[13.2,"alerta","ID 31 cruza en sentido contrario (se aleja): aviso"]];
    d.armar=function(K){var C=PAS,W=C.W;ponerCam(K,C,"CAM PASILLO");K.piso(14,110,K.pbr("tiles",{roughness:0.35,env:1,color:0xB4B8C2}));
      var gr=K.std(0x9EA2AE,{roughness:0.85}),locker=K.std(0xD8D3C4,{roughness:0.6,metalness:0.15}),ranura=K.std(0x55524A,{roughness:0.8});
      var c0=W(0.42,1.0),l1=W(0.435,0.55),r0=W(0.95,1.05),r1=W(0.65,0.55);
      var dl=[l1[0]-c0[0],l1[1]-c0[1]],nl=Math.hypot(dl[0],dl[1]);dl=[dl[0]/nl,dl[1]/nl];var dr=[r1[0]-r0[0],r1[1]-r0[1]],nr=Math.hypot(dr[0],dr[1]);dr=[dr[0]/nr,dr[1]/nr];
      var fondo=50;
      // muro cercano a la izquierda (esquina en u≈0.42) y muro izquierdo del pasillo con la abertura lateral junto a la línea
      K.muro(c0[0]-8,c0[1],c0[0],c0[1],3.2,gr).userData.obst=false;
      var lin=W(0.43,0.575);var dAb=Math.hypot(lin[0]-c0[0],lin[1]-c0[1]);
      K.muro(c0[0],c0[1],c0[0]+dl[0]*(dAb-1.4),c0[1]+dl[1]*(dAb-1.4),3.2,gr).userData.obst=false;
      K.muro(c0[0]+dl[0]*(dAb+0.4),c0[1]+dl[1]*(dAb+0.4),c0[0]+dl[0]*fondo,c0[1]+dl[1]*fondo,3.2,gr).userData.obst=false;
      // muro de casilleros (derecha)
      var ex=[r0[0]-dr[0]*3,r0[1]-dr[1]*3],ef=[r0[0]+dr[0]*fondo,r0[1]+dr[1]*fondo];K.muro(ex[0],ex[1],ef[0],ef[1],3.2,K.std(0xE4E2DC,{roughness:0.9})).userData.obst=false;
      var ang=-Math.atan2(dr[1],dr[0])/GRAD,glk=K.grupo((ex[0]+ef[0])/2,(ex[1]+ef[1])/2,ang),Lk=Math.hypot(ef[0]-ex[0],ef[1]-ex[1]);
      sinObs(K.caja(0,0,-0.3,Lk,1.95,0.42,locker,glk));for(var i=0;i<Lk/0.32;i++){K.caja(-Lk/2+i*0.32,0.1,-0.51,0.015,1.8,0.01,ranura,glk);K.caja(-Lk/2+i*0.32+0.16,1.55,-0.51,0.07,0.03,0.01,ranura,glk);K.caja(-Lk/2+i*0.32+0.16,0.7,-0.51,0.07,0.03,0.01,ranura,glk)}
      // fondo iluminado y puertas
      var fz=[c0[0]+dl[0]*fondo,c0[1]+dl[1]*fondo],fr=[r0[0]+dr[0]*fondo,r0[1]+dr[1]*fondo];K.muro(fz[0],fz[1],fr[0],fr[1],3.2,K.std(0xF4F6FA,{emissive:0xFFFFFF,emissiveIntensity:0.5}));
      K.techoRejilla(14,110,3.2);for(var z=0;z<fondo;z+=4){var q=[c0[0]+dl[0]*z+1.6,c0[1]+dl[1]*z];K.lampara(q[0],3.1,q[1])}
      var L=K.lineaCruce(W(0.43,0.575),W(0.66,0.575),{estado:"oro"});
      var P=gente(K,C,[
        {ruta:[[0,0.47,0.44],[3.4,0.465,0.575],[4.0,0.46,0.59],[4.8,0.40,0.585]],ropa:{chaqueta:0x1E2228,pantalon:0x2A2C30,zapatos:0x1C1E22},s:1.0},
        {ruta:[[0,0.50,0.43],[3.6,0.51,0.53],[4.7,0.47,0.578],[5.5,0.465,0.60],[6.3,0.40,0.59]],ropa:{chaqueta:0x2E3440,pantalon:0x1C1E22,zapatos:0x1C1E22},s:0.97},
        {ruta:[[0,0.40,0.60],[11,0.40,0.60],[12,0.445,0.61],[13.2,0.46,0.575],[16,0.50,0.47]],ropa:{camisa:0x6B7A90,pantalon:0x2A2C30,zapatos:0x1C1E22},s:0.97},
        {ruta:[[0,0.455,0.432],[16,0.455,0.432,"idle",0.46,0.5]],ropa:{chaqueta:0x3A2F45,pantalon:0x2A2C30},s:0.95},
        {ruta:[[0,0.495,0.43],[16,0.495,0.43,"idle",0.5,0.5]],ropa:{chaqueta:0x5A3030,pantalon:0x2A2C30},s:0.95},
        {ruta:[[0,0.525,0.433],[16,0.525,0.433,"idle",0.5,0.5]],ropa:{camisa:0x2F64C8,pantalon:0x2A2C30},s:0.95}]);
      var ver=[function(t){return t<4.8},function(t){return t<6.3},function(t){return t>11.3},null,null,null];
      var R=P.map(function(p,i){return K.recuadro(p,{texto:["ID 1","ID 5","ID 31","ID 4","ID 2","ID 6"][i]})});var e=U.reloj();
      return function(t){P.forEach(function(p,i){var v=ver[i]?ver[i](t):true;p.visible=v;R[i].visible=v});
        R[0].set(t>=3.4?"ok":"vigila",t>=3.4?"ID 1 · hacia la cámara":"ID 1");R[1].set(t>=4.7?"ok":"vigila",t>=4.7?"ID 5 · hacia la cámara":"ID 5");R[2].set(t>=13.2?"alerta":"vigila",t>=13.2?"ID 31 · se aleja":"ID 31");
        L.set(t>=13.2&&t<15.5?"alerta":(t>=3.4&&t<6?"ok":"oro"));
        e(t,3.4,"a",function(){K.evento("Cruce · ID 1 hacia la cámara","")});e(t,4.7,"b",function(){K.evento("Cruce · ID 5 hacia la cámara","")});e(t,13.2,"c",function(){K.evento("Cruce en sentido contrario · ID 31","alerta")});
        K.contador("Hacia la cámara",String((t>=3.4?1:0)+(t>=4.7?1:0)));K.contador("Se aleja",t>=13.2?"1":"0");K.contador("Cruces totales",String((t>=3.4?1:0)+(t>=4.7?1:0)+(t>=13.2?1:0)))}};
  });
  S.video("cruce",{src:"evidencia-publica/comercial/cruce.mp4",poster:"evidencia-publica/comercial/cruce-poster.jpg",chapa:"CCTV real (MEVA) · modelo real",
    fuente:"MEVA · Multiview Extended Video with Activities (cámara G423, pasillo)",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:13.2,
    marcas:[{tipo:"linea",pts:LINEA_PAS,color:"oro",etiqueta:"Línea de paso",hasta:13.2},{tipo:"linea",pts:LINEA_PAS,color:"alerta",etiqueta:"Sentido contrario",desde:13.2,hasta:15.5},{tipo:"linea",pts:LINEA_PAS,color:"oro",etiqueta:"Línea de paso",desde:15.5}]});
  /* ---------- Conteo de personas · cruce peatonal (Pexels 30138510), seg. 18.9–28.9 ---------- */
  var CAL=camVid({x:0,z:20,h:1.04,pitch:3.1,fov:50});
  var LINEA_CON=[[0,0.665],[1,0.665]];
  S.ajustar("conteo",function(d){
    d.dur=10;d.camara={pos:[10,7,30],mira:[0,0.5,12]};
    d.fases=[[0,"vigila","La línea de conteo atraviesa el cruce peatonal"],[8.5,"ok","ID 78 cruza la línea hacia la cámara: suma una entrada"],[9.3,"ok","ID 102 cruza detrás: segunda entrada en un segundo"]];
    d.armar=function(K){var C=CAL,W=C.W;ponerCam(K,C,"CAM CRUCE",{alcance:30});K.piso(80,80,K.mat.asfalto,3);
      var bl=K.std(0xE9E6DE,{roughness:0.7});
      // cebra cercana (mitad izquierda) y cebra lejana por donde pasa la gente
      [0.535,0.56,0.59,0.625,0.705,0.79,0.93].forEach(function(v){var a=W(0.0,v),b=W(0.49,v),c=W(0.0,v+0.012);K.parche((a[0]+b[0])/2,a[1],b[0]-a[0],Math.max(0.25,Math.abs(c[1]-a[1])*1.8),bl,1,0.008)});
      var zf=W(0.5,0.505);for(var x=-22;x<24;x+=1.1)K.parche(x,zf[1],0.5,3.2,bl,1,0.007);
      // acera y edificio de la izquierda, árboles, postes y autos de la derecha
      var ac=W(0.2,0.478);K.caja(-10,0,ac[1]-3,40,0.15,6,K.std(0x9A958C,{roughness:0.9}));
      var ed=W(0.42,0.472),gE=K.grupo(ed[0]-18,ed[1]-9,0);K.caja(0,0,0,36,26,12,K.std(0x6E5E52,{roughness:0.85}),gE);
      for(var y=2;y<25;y+=3.2)K.caja(0,y,6.02,36,1.4,0.05,K.std(0x2A2E36,{roughness:0.3,metalness:0.3}),gE);
      [[0.44,0.475,2.2],[0.52,0.47,1.8],[0.40,0.47,1.6]].forEach(function(q){var p2=W(q[0],q[1]);K.arbol(p2[0],p2[1]-3,q[2]*1.6)});
      [[0.47,0.47],[0.90,0.47]].forEach(function(q){var p2=W(q[0],q[1]);K.poste(p2[0],p2[1]-2)});
      [[0.86,0.495,0xF4F4F2],[0.68,0.495,0x3A3F48],[0.59,0.488,0xF4F4F2],[0.97,0.47,0xE5E5E5]].forEach(function(q){var p2=W(q[0],q[1]),a=K.auto(q[2],{tipo:"sedan"});a.position.set(p2[0],0,p2[1]-1);a.rotation.y=-Math.PI/2;a.userData.obst=false});
      var L=K.lineaCruce(W(0.0,0.665),W(1.0,0.665),{estado:"oro"});
      var P=gente(K,C,[
        {ruta:[[0,0.265,0.485],[2.1,0.27,0.50],[6.1,0.28,0.56],[8.1,0.29,0.64],[9.1,0.37,0.77],[10,0.42,0.92]],ropa:{chaqueta:0x1A1C20,pantalon:0x1C1E22,zapatos:0xF2F2F0,gorra:0x1A1C20},s:1.0},
        {ruta:[[0,0.30,0.485],[2.1,0.30,0.505],[6.1,0.32,0.55],[8.1,0.35,0.61],[9.1,0.45,0.70],[10,0.50,0.80]],ropa:{camisa:0x2A2C30,pantalon:0xBFC3C8,zapatos:0x2A2C30},s:0.97},
        {ruta:[[0,0.02,0.555],[10,0.24,0.54]],ropa:{camisa:0xE8E4D8,pantalon:0x2A2C30}},
        {ruta:[[0,0.45,0.50],[10,0.12,0.495]]},{ruta:[[0,0.20,0.49],[10,0.44,0.50]]},{ruta:[[0,0.38,0.50],[10,0.10,0.50]]},
        {ruta:[[0,0.56,0.51],[10,0.33,0.50]]},{ruta:[[0,0.11,0.50],[10,0.37,0.50]]},{ruta:[[0,0.49,0.52],[10,0.49,0.52,"idle",0.3,0.5]]},{ruta:[[0,0.42,0.505],[10,0.42,0.505,"idle",0.5,0.6]]}]);
      var R=P.map(function(p,i){return K.recuadro(p,{texto:i===0?"ID 78":(i===1?"ID 102":"persona")})});var e=U.reloj();
      return function(t){R[0].set(t>=8.5?"ok":"vigila");R[1].set(t>=9.3?"ok":"vigila");L.set(t>=8.5?"ok":"oro");
        e(t,8.5,"a",function(){K.evento("Entrada · ID 78 hacia la cámara","")});e(t,9.3,"b",function(){K.evento("Entrada · ID 102 hacia la cámara","")});
        var n=(t>=8.5?1:0)+(t>=9.3?1:0);K.contador("Hacia la cámara",String(4+n));K.contador("Se aleja","2");K.contador("Cruces totales",String(6+n))}};
  });
  S.video("conteo",{src:"evidencia-publica/comercial/conteo.mp4",poster:"evidencia-publica/comercial/conteo-poster.jpg",chapa:"video público (Pexels) · modelo real",
    fuente:"Pexels · video 30138510 (cruce peatonal, Ciudad de México)",autor:"Pexels (ver página del video)",url:"https://www.pexels.com/video/30138510/",licencia:"Pexels License",evento:8.5,
    marcas:[{tipo:"linea",pts:LINEA_CON,color:"oro",etiqueta:"Línea de conteo",hasta:8.5},{tipo:"linea",pts:LINEA_CON,color:"ok",etiqueta:"Entrada +1",desde:8.5}]});

  /* ---------- Comprador activo · clip generado con IA (Seedance 2.5, texto a video), s 0.5–10 ---------- */
  var PAS2=camVid({x:0,z:1.5,h:2.72,pitch:71.4,fov:55});
  var ZONA_COMP=[[0.22,0.43],[0.62,0.43],[0.62,0.72],[0.22,0.72]];
  S.ajustar("comprador",function(d){
    d.dur=9.5;d.camara={pos:[4.6,3.6,4.6],mira:[0,0.8,-0.4]};
    d.fases=[[0,"vigila","Gente de paso por el pasillo"],[2.5,"detecta","Se detiene frente a la góndola y la recorre con la mirada"],[5.5,"detecta","Toma una caja roja del estante y la examina"],[7,"ok","Comprador activo: se avisa al asesor del pasillo"]];
    d.armar=function(K){var C=PAS2,W=C.W;ponerCam(K,C,"CAM PASILLO 5");K.piso(14,10,K.pbr("tiles",{roughness:0.6,color:0xC9C2B2}));
      var b=W(0.5,0.405),g=K.gondola(0,b[1]-0.46,12,0,{unaCara:true,niveles:5,alto:1.8,familias:["cajas","cajas","cajas","cajas"]});
      var f=W(0.5,0.93,1.4);K.gondola(0,f[1]+0.46,12,180,{unaCara:true,niveles:5,alto:1.4,familias:["botellas","latas","bolsas","cajas"]});
      var Zw=ZONA_COMP.map(function(q){return W(q[0],q[1])}),Z=K.zona(Zw,{estado:"vigila"});
      var P=gente(K,C,[
        {ruta:[[0,-0.12,0.55],[1.0,0.0,0.56],[2.5,0.27,0.58],[4.0,0.40,0.585,"idle",0.40,0.3],[9.5,0.42,0.60,"idle",0.40,0.3]],ropa:{camisa:0x8E2A33,pantalon:0x3A4A6A,zapatos:0x2A2C30},s:0.93},
        {ruta:[[0,0.10,0.62],[0.8,-0.15,0.62]],ropa:{camisa:0x9AA08A,chaleco:0x7A7F6A,pantalon:0xBDB39A,zapatos:0x2A2C30},s:1.0},
        {ruta:[[0,0.06,0.45],[0.6,-0.12,0.44]],ropa:{chaqueta:0x8E2A33,pantalon:0x3A5A8A},s:0.95},
        {ruta:[[0,1.15,0.62],[8.4,1.15,0.62],[9.5,0.92,0.62]],ropa:{chaqueta:0x3E6A54,pantalon:0x1C1E22},s:0.97}]);
      var C_=P[0],pr=U.producto(K,0xD94F3D,3),sl=null,bx=1e9;var hx=W(0.42,0.3)[0];g.userData.slots.forEach(function(q){var wp=q.getWorldPosition(new THREE.Vector3()),dd=Math.abs(wp.x-hx)+Math.abs(q.userData.n-2)*0.6;if(dd<bx){bx=dd;sl=q}});
      C_.post=function(t){var mira=t>2.5&&t<5.4;if(mira)U.cabeza(K,C_,Math.sin(t*2.2)*0.5,0.15+Math.sin(t*1.3)*0.25);
        var al=U.ventana(t,5.0,6.2,0.5,0.3);if(al>0&&t<6){var tg=sl.getWorldPosition(new THREE.Vector3());tg.y+=0.1;K.ik(C_,"Right",tg,al)}
        if(t>6){var k=Math.min(1,(t-6)/0.6);K.ik(C_,"Right",K.local(C_,-0.1,1.3,0.32),k);K.ik(C_,"Left",K.local(C_,0.12,1.25,0.3),k*0.8);U.cabeza(K,C_,0,0.35*k)}};
      var R=[K.recuadro(P[0],{texto:"persona"}),K.recuadro(P[1],{texto:"de paso"}),K.recuadro(P[2],{texto:"de paso"}),K.recuadro(P[3],{texto:"de paso"})];var et=K.etiqueta("Comprador activo","oro",K.sobre(C_));var e=U.reloj();
      return function(t){if(t>6&&!(pr.parent&&pr.parent.isBone)){sl.visible=false;C_.sostener(pr,"Right",[0,0.1,0.06])}if(t<5.9&&pr.parent&&pr.parent.isBone){pr.parent.remove(pr);sl.visible=true}
        P[1].visible=t<0.8;P[2].visible=t<0.6;R[1].visible=P[1].visible;R[2].visible=P[2].visible;
        R[0].set(t>=7?"oro":(t>=2.5?"detecta":"vigila"),t>=7?"comprador activo":(t>=5.5?"examina":(t>=2.5?"recorre la góndola":"persona")));et.el.style.opacity=t>=7?1:0;
        Z.set(t>=7?"oro":(t>=2.5?"detecta":"vigila"));e(t,7,"a",function(){K.evento("Comprador activo · pasillo 5 → asesor","")});K.contador("Tiempo frente a la góndola",(t>=2.5?(t-2.5).toFixed(1):"0.0")+" s");K.contador("Compradores activos ahora",t>=7?"1":"0")}};
  });
  S.video("comprador",{src:"evidencia-publica/comercial/comprador.mp4",poster:"evidencia-publica/comercial/comprador-poster.jpg",chapa:"video generado con IA · referencia",ia:true,
    fuente:"Generado con IA (ElevenLabs · Seedance 2.5, texto a video) para esta lámina",autor:"ARS · generado con IA",licencia:"Contenido generado para uso propio",evento:7,
    marcas:[{tipo:"zona",pts:ZONA_COMP,color:"vigila",etiqueta:"Frente a la góndola",hasta:2.5},{tipo:"zona",pts:ZONA_COMP,color:"detecta",etiqueta:"Frente a la góndola",desde:2.5,hasta:7},{tipo:"zona",pts:ZONA_COMP,color:"oro",etiqueta:"Comprador activo",desde:7}]});

  /* ---------- Demografía · clip generado con IA (Seedance 2.5, texto a video), s 0.5–10 ---------- */
  var ENT=camVid({x:0,z:4,h:2.23,pitch:26.9,fov:60});
  S.ajustar("demografia",function(d){
    d.dur=9.5;d.camara={pos:[6,5,9],mira:[0,1,1]};
    d.fases=[[0,"vigila","La cámara de la entrada ve a cada visitante de frente"],[0.2,"detecta","Estima rango de edad y género al entrar, sin guardar la cara"],[7.5,"ok","Suma cada visita al perfil de la hora"]];
    d.armar=function(K){var C=ENT,W=C.W;ponerCam(K,C,"CAM ENTRADA");K.piso(16,14,K.pbr("tiles",{roughness:0.6,color:0x8A8274}));
      var luz=K.std(0xF7F8FA,{emissive:0xFFFFFF,emissiveIntensity:0.7,roughness:0.3}),marco=K.std(0x9AA0A8,{metalness:0.6,roughness:0.35}),osc=K.std(0x4A4640,{roughness:0.9});
      var a=W(0.40,0.64),bq=W(0.88,0.40);K.muro(a[0],a[1],bq[0],bq[1],3.0,luz).userData.obst=false;var c=W(0.80,1.05);K.muro(bq[0],bq[1],c[0],c[1],3.0,luz).userData.obst=false;
      var izq=W(0.0,0.62);K.muro(izq[0]-3,a[1]-0.3,a[0],a[1],3.0,osc).userData.obst=false;
      [[0.445,0.62],[0.575,0.57],[0.80,0.44]].forEach(function(q){var p2=W(q[0],q[1]);K.caja(p2[0],0,p2[1],0.08,2.6,0.08,marco)});var hj=C.tramo([0.47,0.78],[0.58,0.93],0),gh=K.grupo(hj.x,hj.z,hj.ry);K.caja(0,0,0,hj.largo,2.2,0.04,K.std(0xC9E0F2,{transparent:true,opacity:0.3}),gh);
      [[[0.0,0.60],[0.30,0.50]],[[-0.2,0.85],[0.18,0.70]]].forEach(function(s2){var tr=C.tramo(s2[0],s2[1],0);K.gondola(tr.x,tr.z,tr.largo,tr.ry,{niveles:5,alto:1.9,unaCara:true,color_estructura:0x3A3A40}).userData.obst=false});
      var cs=W(0.40,0.78);K.canastas(cs[0],cs[1],9);var tp=W(0.42,0.97);K.parche(tp[0],tp[1],1.1,0.7,K.std(0x2A2A2E,{roughness:1}),1,0.01);
      K.techoRejilla(16,14,3.0);
      var P=gente(K,C,[
        {ruta:[[0,0.62,0.72],[0.5,0.645,0.92],[1.0,0.59,"c0.53"],[1.5,0.45,"c0.75"],[2.1,0.2,"c1.1"]],ropa:{camisa:0xF0D8CC,pantalon:0x2A3550,zapatos:0x6A4A30},s:0.93},
        {ruta:[[0,0.62,0.30],[2.5,0.62,0.32],[3.0,0.62,0.45],[3.5,0.62,0.65],[4.0,0.66,0.78],[4.5,0.68,0.93],[5.0,0.57,"c0.55"],[5.5,0.42,"c0.85"],[6.1,0.3,"c1.1"]],ropa:{camisa:0x3A2438,pantalon:0xC9B99A,zapatos:0x5A4A3A},s:0.99,piel:0xD9B49A},
        {ruta:[[0,0.62,0.28],[5.5,0.62,0.30],[6.0,0.60,0.45],[6.5,0.61,0.62],[7.0,0.63,0.78],[7.5,0.64,0.86],[8.0,0.60,"c0.55"],[8.5,0.5,"c0.75"],[9.0,0.35,"c1.0"]],ropa:{chaqueta:0x5A4048,pantalon:0x2A2C30,zapatos:0xF2F2F0},s:0.9}]);
      var tx=["Mujer · 25–34","Hombre · 45–54","Mujer · 13–17"],ini=[0.2,3.5,6.5],R=P.map(function(p){return K.recuadro(p,{texto:"rostro",h:0.3,w:0.3,d:0.3,y:p.alto-0.32})});
      var lb=P.map(function(p,i){return K.etiqueta(tx[i],"id",K.sobre(p))});var e=U.reloj();
      return function(t){P[0].visible=t<2.1;P[1].visible=t>2.4&&t<6.1;P[2].visible=t>5.4;
        R.forEach(function(r,i){r.visible=P[i].visible;var ok=t>=ini[i];r.set(ok?"ok":"vigila",ok?tx[i]:"rostro");lb[i].el.style.opacity=ok&&P[i].visible?1:0});
        e(t,0.2,"a",function(){K.evento("Visita · mujer 25–34","")});e(t,3.5,"b",function(){K.evento("Visita · hombre 45–54","")});e(t,6.5,"c",function(){K.evento("Visita · mujer 13–17","")});
        var n=ini.filter(function(x){return t>=x}).length;K.contador("Mujeres hoy",String(231+(t>=0.2?1:0)+(t>=6.5?1:0)));K.contador("Hombres hoy",String(198+(t>=3.5?1:0)));K.contador("Visitas en esta hora",String(36+n))}};
  });
  S.video("demografia",{src:"evidencia-publica/comercial/demografia.mp4",poster:"evidencia-publica/comercial/demografia-poster.jpg",chapa:"video generado con IA · referencia",ia:true,
    fuente:"Generado con IA (ElevenLabs · Seedance 2.5, texto a video) para esta lámina",autor:"ARS · generado con IA",licencia:"Contenido generado para uso propio",evento:3.5});
})();
