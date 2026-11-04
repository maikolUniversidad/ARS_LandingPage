/* Emparejamiento 3D ↔ video · familia operativo (grupo 1). Ver sync/base.js.
   Las rutas de las personas salen del propio clip (detector EfficientDet-Lite0 + seguimiento por IoU) proyectadas al piso
   con la calibración de cada cámara; la escenografía se ubica con coordenadas de píxel del mismo cuadro, así calza con el
   video. Los bloques /*DATA:…*\/ los rellena vision-trabajo/operativo/scripts/build_sync.py. */
(function(){
  "use strict";
  var U=window.ESC_UTIL,S=window.ESC_SYNC,C=window.MOTOR.COL;if(!U||!S)return;
  var reloj=U.reloj,suave=U.suave,lerp=U.lerp,STAFF=U.STAFF,RAD=Math.PI/180;

  /* ---------- calibración de cámara (pinhole): H altura, p inclinación, F fov vertical, yaw giro; ox/oz ubican la cámara ---------- */
  function camCal(o){var t=Math.tan(o.F*RAD/2),pr=o.p*RAD,c=Math.cos(pr),s=Math.sin(pr),A=16/9,W=o.W||1920,Hh=o.Hh||1072,yw=(o.yaw||0)*RAD,cy=Math.cos(yw),sy=Math.sin(yw);
    function rot(x,z){return[x*cy-z*sy,x*sy+z*cy]}
    o.piso=function(x,y,h){var u=x/W,v=y/Hh,d0=(2*u-1)*t*A,d1=(1-2*v)*t,dy=c*d1-s,dz=-s*d1-c;if(dy>=-1e-6)return null;var k=(o.H-(h||0))/(-dy),r=rot(d0*k,dz*k);return[r[0]+o.ox,r[1]+o.oz]};
    o.m=function(q){var r=rot(q[0],q[1]);return[r[0]+o.ox,r[1]+o.oz]};
    var f=rot(0,-c*10);o.pos=[o.ox,o.H,o.oz];o.mira=[o.ox+f[0],o.H-s*10,o.oz+f[1]];
    o.uv=function(x,y){return[+(x/W).toFixed(4),+(y/Hh).toFixed(4)]};return o}
  function hex(s){return s?parseInt(String(s).replace("#",""),16):0x555555}
  function ang(a,b){return-Math.atan2(b[1]-a[1],b[0]-a[0])}
  function largo(a,b){return Math.hypot(b[0]-a[0],b[1]-a[1])}
  function medio(a,b,k){k=k==null?0.5:k;return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]}
  function tabla(K,a,b,y,h,e,m){var c=medio(a,b);return K.caja(c[0],y,c[1],largo(a,b),h,e||0.06,m,ang(a,b))}
  function perp(a,b,d,lado){var L=largo(a,b),nx=-(b[1]-a[1])/L*(lado||1),nz=(b[0]-a[0])/L*(lado||1);return[b[0]+nx*d,b[1]+nz*d]}
  function actores(K,L,cs,fn){if(/sinGente/.test(location.search))L=[];return L.map(function(a,i){var r=a.r.map(function(q){var w=cs.m([q[1],q[2]]);return[q[0],w[0],w[1]]});
      var o={ruta:r,escala:a.s||0.93,ancho:1,evita:false,ropa:{camisa:hex(a.camisa),pantalon:hex(a.pantalon),zapatos:0x1C1E22}};if(fn)fn(o,a,i);
      var P=K.persona(o);P.ap=a.ap;P.des=a.des;P.dato=a;return P})}
  /* las rutas vienen del video: ya rodean los muebles; se apagan los obstáculos para que el A* no las desvíe */
  function sinObstaculos(){var M=window.MOTOR;if(M&&M.scene)M.scene.traverse(function(o){if(o.userData&&o.userData.obst)delete o.userData.obst})}
  function visibles(L,t){L.forEach(function(P){P.visible=t>=P.ap-0.2&&t<=P.des+0.2})}
  function dentroPoli(x,z,pts){var d=false;for(var i=0,j=pts.length-1;i<pts.length;j=i++){var a=pts[i],b=pts[j];if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]))d=!d}return d}
  function zonaPx(cs,px){return px.map(function(q){return cs.piso(q[0],q[1],0)})}
  function marcaPx(cs,px){return px.map(function(q){return cs.uv(q[0],q[1])})}

  /* =====================================================================================================
     SALA G421 · vestíbulo-cafetería (MEVA, CC BY 4.0): la misma cámara sirve a filas, staff, aforo y guardián
     ===================================================================================================== */
  var G421=camCal(/*CAL:G421*/{H:2.28,p:19.7,F:55,ox:3.5,oz:11}/*FIN*/);
  function salaG421(K,cs){var P=function(x,y,h){return cs.piso(x,y,h||0)};
    var crema=K.std(0xEDE6D3,{roughness:0.9}),blanco=K.std(0xF4F1EA,{roughness:0.9}),marco=K.std(0x23272E,{roughness:0.5,metalness:0.3}),mad=K.std(0xC79B5B,{roughness:0.6}),
      alfo=K.std(0x2A3550,{roughness:1}),sofa=K.std(0x6F86A8,{roughness:0.95}),mesaB=K.std(0xE9DCC0,{roughness:0.6}),negro=K.std(0x22252B,{roughness:0.5}),
      vid=K.std(0xDCEAF5,{transparent:true,opacity:0.35,roughness:0.05,depthWrite:false});
    K.piso(34,34,K.pbr("tiles",{color:0xEFEBE2,roughness:0.8,env:0.7}),0.6);
    var A0=P(100,318),A1=P(722,292),R1=P(812,300),B0=P(925,342),B1=P(1555,522),Bp0=P(1090,389),Bp1=P(1250,435);
    var Dq=P(0,412),D1=medio(A0,Dq,3.2),Cq=P(1920,640),C1=medio(B1,Cq,2.2);
    K.muro(A0[0],A0[1],A1[0],A1[1],3.4,crema);K.muro(D1[0],D1[1],A0[0],A0[1],3.4,crema);
    tabla(K,A1,R1,0,2.4,0.03,vid);tabla(K,A1,R1,2.4,1.0,0.12,crema);
    K.muro(R1[0],R1[1],B0[0],B0[1],3.4,crema,0.5);
    tabla(K,B0,Bp0,0,2.6,0.03,vid);tabla(K,B0,Bp0,2.6,0.8,0.14,crema);K.muro(Bp0[0],Bp0[1],Bp1[0],Bp1[1],3.4,crema,0.45);
    tabla(K,Bp1,B1,0,2.7,0.03,vid);tabla(K,Bp1,B1,2.7,0.7,0.14,crema);
    [[925,342],[1005,365],[1090,389],[1250,435],[1330,457],[1410,480],[1555,522]].forEach(function(q){var c=P(q[0],q[1]);K.caja(c[0],0,c[1],0.09,2.75,0.12,marco)});
    tabla(K,Bp1,B1,1.05,0.06,0.1,marco);tabla(K,B0,Bp0,1.05,0.06,0.1,marco);
    K.muro(B1[0],B1[1],C1[0],C1[1],3.4,crema);var Cv0=medio(B1,C1,0.03),Cv1=medio(B1,C1,0.6);tabla(K,Cv0,Cv1,1.25,1.5,0.2,K.std(0x2B3442,{roughness:0.3}));
    tabla(K,B1,C1,0.95,0.12,0.2,mad);tabla(K,A0,A1,0.95,0.1,0.2,mad);tabla(K,D1,A0,0.95,0.1,0.2,mad);
    
    var Pm0=P(210,305),Pm1=P(360,300);tabla(K,Pm0,Pm1,0,2.15,0.2,mad);
    tabla(K,medio(Pm0,Pm1,0.1),medio(Pm0,Pm1,0.42),0.9,1.0,0.22,vid);tabla(K,medio(Pm0,Pm1,0.58),medio(Pm0,Pm1,0.9),0.9,1.0,0.22,vid);
    var a1=P(530,305),a2=P(810,300),a3=P(925,350),a4=P(1010,398);tabla(K,a1,a2,0,0.01,1.4,alfo);tabla(K,a3,a4,0,0.01,2.2,alfo);
    var sf=P(390,440),sw=K.grupo(sf[0],sf[1],ang(A0,A1)/RAD);K.caja(0,0,0,2.1,0.45,0.85,sofa,sw);K.caja(0,0.45,-0.32,2.1,0.4,0.22,sofa,sw);K.caja(-1.0,0.45,0,0.2,0.2,0.85,sofa,sw);K.caja(1.0,0.45,0,0.2,0.2,0.85,sofa,sw);
    var sl=P(190,495),sll=K.grupo(sl[0],sl[1],ang(A0,A1)/RAD+90);K.caja(0,0,0,0.95,0.45,0.85,sofa,sll);K.caja(0,0.45,-0.32,0.95,0.4,0.22,sofa,sll);
    var mc=P(447,412,0.45);K.caja(mc[0],0,mc[1],1.2,0.45,0.6,K.std(0x6B4530,{roughness:0.6}),ang(A0,A1));
    var cromo=K.std(0xE8E8E4,{roughness:0.4,metalness:0.5});
    function mesaR(c,r,h,m,pata){K.cil(c[0],h-0.03,c[1],r,r,0.03,m);K.cil(c[0],0,c[1],0.035,0.035,h-0.03,pata||m);K.cil(c[0],0,c[1],r*0.55,r*0.6,0.03,pata||m)}
    function silla(x,z,a){var g=K.grupo(x,z,a);K.caja(0,0.45,0,0.42,0.03,0.42,mesaB,g);K.caja(0,0.48,-0.2,0.42,0.42,0.025,cromo,g);[[-0.19,-0.19],[0.19,-0.19],[-0.19,0.19],[0.19,0.19]].forEach(function(q){K.caja(q[0],0,q[1],0.02,0.45,0.02,cromo,g)})}
    [[680,468],[887,425],[480,495]].forEach(function(q,i){var c=P(q[0],q[1],0.74);mesaR(c,i==2?0.35:0.45,0.74,mesaB,cromo);
      for(var k=0;k<3;k++){var a=(k*120+30+i*40);silla(c[0]+Math.cos(a*RAD)*0.62,c[1]+Math.sin(a*RAD)*0.62,-a+90)}});
    var pl=P(560,272);K.planta(pl[0],pl[1],1.3);var bq=P(435,255);K.caja(bq[0],0,bq[1],0.4,0.75,0.4,negro);
    var m1=P(300,690,0.95),m2=P(420,880,0.95);
    tabla(K,medio(m1,m2,-0.2),medio(m1,m2,2.6),0,0.95,0.62,negro);tabla(K,medio(m1,m2,-0.2),medio(m1,m2,2.6),0.95,0.05,0.7,blanco);
    [-0.75,-0.45].forEach(function(k){var q=medio(m1,m2,k);K.cil(q[0],1.0,q[1],0.13,0.13,0.45,K.mat.acero)});
    var cj=medio(m1,m2,0.85);K.caja(cj[0],1.0,cj[1],0.45,0.12,0.35,K.std(0x3FA37A,{roughness:0.7}));
    [[1540,900],[1820,650]].forEach(function(q){var c=P(q[0],q[1],1.02);mesaR(c,0.5,1.02,negro,cromo)});
    [[0.2,0.3],[0.55,0.25],[0.85,0.35]].forEach(function(k){var q=medio(medio(A0,B1,0.5),medio(D1,C1,0.5),k[0]);K.cil(q[0],3.3,q[1],0.9,0.9,0.06,K.std(0xF6F6F2,{emissive:0xFFFFFF,emissiveIntensity:0.5}))});
    var pz0=P(905,1072),pz1=P(1310,1020);if(pz0&&pz1)tabla(K,pz0,pz1,0,1.25,0.05,K.std(0xD9DCE0,{roughness:0.7}));
    var gb=P(60,600);K.caja(gb[0],0,gb[1],0.6,2.0,0.9,negro);
    sinObstaculos();return{P:P}}

  /* ---------------------------------------- GESTIÓN DE FILAS ---------------------------------------- */
  var FILAS=/*DATA:filas*/[{"id":2,"ap":0.0,"des":4.5,"r":[[0.0,0.18,-3.14],[1.0,0.11,-2.99],[2.5,-0.04,-2.84],[3.0,-0.19,-2.65],[3.5,-0.31,-2.59],[4.5,-0.45,-2.48]],"camisa":"#3A3F3B","pantalon":"#585D62"},{"id":3,"ap":0.0,"des":18.0,"r":[[0.0,2.09,-4.86],[1.0,2.08,-4.81],[1.5,2.13,-4.93],[3.5,2.14,-4.91],[4.0,2.08,-4.8],[7.0,2.01,-4.79],[7.5,1.95,-4.67],[8.0,1.86,-4.56],[9.0,1.67,-4.22],[9.5,1.61,-4.18],[10.0,1.67,-4.42],[11.5,1.77,-4.53],[12.0,1.8,-4.58],[12.5,1.73,-4.36],[16.5,1.85,-4.41],[17.5,1.85,-4.36],[18.0,1.86,-4.35]],"camisa":"#35383F","pantalon":"#9BC6EF"},{"id":4,"ap":0.0,"des":7.0,"r":[[0.0,-1.33,-1.52],[2.5,-1.41,-1.64],[6.0,-1.34,-1.53],[7.0,-1.32,-1.51]],"camisa":"#8E7E5F","pantalon":"#76684C"},{"id":5,"ap":0.0,"des":6.0,"r":[[0.0,-1.8,-8.49],[0.5,-1.87,-8.85],[1.0,-1.92,-8.87],[1.5,-2.09,-9.02],[2.0,-2.39,-9.41],[2.5,-2.7,-9.53],[3.0,-3.02,-9.42],[3.5,-3.41,-9.67],[4.0,-3.78,-10.06],[4.5,-4.15,-10.69],[5.0,-4.61,-11.71],[6.0,-5.09,-13.01]],"camisa":"#4E514A","pantalon":"#4F5D7A"},{"id":6,"ap":0.0,"des":18.0,"r":[[0.0,-0.52,-2.84],[2.0,-0.71,-2.66],[2.5,-0.8,-2.43],[3.5,-0.91,-2.37],[5.5,-0.75,-2.43],[13.0,-0.75,-2.34],[13.5,-1.34,-4.57],[15.5,-1.36,-4.56],[16.0,-0.78,-2.34],[17.5,-0.79,-2.39],[18.0,-0.79,-2.41]],"camisa":"#363C35","pantalon":"#56554D"},{"id":7,"ap":0.0,"des":11.5,"r":[[0.0,-0.66,-2.92],[0.5,-0.24,-2.78],[1.0,0.01,-2.69],[3.0,0.45,-2.37],[3.5,0.81,-2.3],[4.0,1.06,-2.36],[8.5,1.17,-2.55],[11.0,1.08,-2.44],[11.5,1.08,-2.43]],"camisa":"#4C4848","pantalon":"#3C3E37"},{"id":8,"ap":0.0,"des":9.0,"r":[[0.0,1.75,-2.6],[3.5,2.44,-3.16],[4.0,2.54,-3.35],[5.0,2.86,-4.13],[6.5,3.56,-5.94],[7.0,3.65,-6.19],[7.5,3.69,-6.38],[8.0,3.49,-6.15],[9.0,3.28,-5.88]],"camisa":"#565A57","pantalon":"#323B42"},{"id":12,"ap":0.5,"des":11.5,"r":[[0.5,-2.0,-4.63],[5.5,-2.09,-4.93],[6.0,-2.19,-5.18],[6.5,-2.4,-5.73],[11.5,-2.43,-5.93]],"camisa":"#44433F","pantalon":"#433A36"},{"id":10,"ap":1.3,"des":17.8,"r":[[1.3,-1.37,-3.07],[1.8,-1.38,-3.04],[2.3,-1.44,-3.23],[3.3,-1.46,-3.23],[3.8,-1.5,-3.52],[4.3,-1.5,-3.52],[4.8,-1.46,-3.33],[5.8,-1.59,-3.58],[6.3,-1.62,-3.6],[7.3,-1.73,-3.95],[9.8,-1.46,-3.25],[10.8,-1.46,-3.13],[11.3,-1.44,-3.01],[11.8,-1.44,-3.05],[12.8,-1.35,-2.83],[13.3,-1.35,-2.82],[13.8,-1.51,-3.36],[15.8,-1.54,-3.39],[16.3,-1.41,-3.02],[17.3,-1.41,-3.04],[17.8,-1.37,-2.99]],"camisa":"#3F403B","pantalon":"#333430"},{"id":1,"ap":1.5,"des":14.0,"r":[[1.5,-0.07,-11.96],[2.0,-0.06,-11.64],[2.5,-0.05,-11.11],[3.0,-0.05,-10.74],[4.5,0.03,-8.83],[5.0,0.11,-8.67],[5.5,0.18,-8.42],[6.0,0.26,-8.28],[7.0,0.39,-8.29],[7.5,0.4,-8.22],[8.0,0.39,-8.03],[9.5,0.23,-8.0],[10.5,0.08,-8.07],[11.0,0.07,-7.69],[11.5,0.04,-7.5],[12.0,-0.01,-7.55],[12.5,-0.25,-7.57],[13.0,-0.61,-7.5],[13.5,-0.81,-7.87],[14.0,-1.08,-8.23]],"camisa":"#5A3A56","pantalon":"#4E5B7A"},{"id":13,"ap":1.8,"des":17.3,"r":[[1.8,-7.91,-15.9],[2.3,-7.97,-15.8],[2.8,-8.19,-15.75],[3.3,-8.4,-15.47],[3.8,-8.7,-15.51],[4.8,-9.03,-15.33],[5.3,-9.05,-15.18],[6.3,-8.98,-14.48],[7.3,-9.02,-13.77],[7.8,-8.86,-13.22],[8.3,-8.78,-12.87],[8.8,-8.71,-12.72],[9.8,-8.48,-12.44],[10.3,-8.35,-12.35],[10.8,-8.31,-12.45],[11.3,-8.32,-12.77],[12.3,-8.25,-13.16],[12.8,-8.13,-13.69],[13.3,-8.14,-14.63],[13.8,-7.78,-14.99],[14.3,-7.08,-14.7],[14.8,-6.42,-14.04],[16.3,-6.07,-13.75],[17.3,-5.52,-12.9]],"camisa":"#3E4145","pantalon":"#454A53"},{"id":17,"ap":6.7,"des":17.7,"r":[[6.7,-4.96,-12.64],[7.2,-5.05,-12.82],[9.2,-5.04,-12.85],[10.7,-5.17,-13.28],[11.2,-5.13,-13.21],[11.7,-5.05,-13.11],[12.2,-5.06,-13.08],[12.7,-4.87,-12.91],[13.2,-4.8,-13.25],[13.7,-4.74,-13.88],[16.2,-4.68,-14.4],[17.2,-4.72,-15.57],[17.7,-4.63,-15.53]],"camisa":"#403E3F","pantalon":"#4F6073"},{"id":22,"ap":13.1,"des":17.6,"r":[[13.1,0.23,-10.97],[13.6,0.2,-10.79],[14.6,0.06,-10.18],[15.1,-0.04,-9.61],[15.6,-0.17,-9.57],[16.1,-0.24,-9.23],[16.6,-0.24,-9.16],[17.6,-0.23,-8.65]],"camisa":"#5B3A4D","pantalon":"#566481"},{"id":28,"ap":15.4,"des":17.4,"r":[[15.4,-3.62,-6.83],[15.9,-3.5,-6.2],[16.4,-3.56,-5.9],[16.9,-3.73,-5.74],[17.4,-3.77,-5.34]],"camisa":"#434641","pantalon":"#4F5057"},{"id":29,"ap":15.5,"des":18.0,"r":[[15.5,-1.41,-1.65],[17.0,-1.5,-1.77],[17.5,-1.52,-1.79],[18.0,-1.5,-1.77]],"camisa":"#836C55","pantalon":"#71644C"},{"id":31,"ap":15.9,"des":17.9,"r":[[15.9,1.16,-2.6],[17.4,1.19,-2.61],[17.9,1.17,-2.55]],"camisa":"#484547","pantalon":"#393C39"}]/*FIN*/;
  var FILA_PX=[[470,640],[1010,560],[1150,1072],[330,1072]];
  S.redef({id:"filas",grupo:1,nombre:"Gestión de filas y cajas",corta:"Avisa cuando la fila crece y hay que abrir otra caja.",
    desc:"Cuenta cuántas personas hacen fila frente a la caja y cuánto llevan esperando. Cuando pasa el umbral avisa para abrir otra caja, antes de que el cliente se vaya.",
    dur:18,camara:{pos:[G421.ox+5,8.5,G421.oz+3],mira:[G421.ox-1.5,0.6,G421.oz-5]},
    fases:[[0,"vigila","Cuenta a quien hace fila frente a la caja de la cafetería"],[2,"alerta","Cinco en fila: la espera pasa el umbral, abrir otra caja"],[7,"ok","La caja despacha: la fila baja a dos y el aviso se cierra"]],
    armar:function(K){var cs=G421;K.camara(cs.pos,cs.mira,{id:"CAM CAFETERÍA",fov:cs.F});salaG421(K,cs);
      var zp=zonaPx(cs,FILA_PX),Z=K.zona(zp,{estado:"vigila"}),et=K.etiqueta("Fila caja","",function(){return new THREE.Vector3(zp[1][0],1.0,zp[1][1])});
      var L=actores(K,FILAS,cs),R=L.map(function(p){return K.recuadro(p,{texto:"persona"})});var e=reloj();
      return function(t){visibles(L,t);var n=0,al=t>=2&&t<7;L.forEach(function(p,i){var d=p.visible&&dentroPoli(p.raiz.position.x,p.raiz.position.z,zp);if(d)n++;R[i].set(d?(al?"alerta":"detecta"):"vigila",d?"en fila":"persona")});
        Z.set(al?"alerta":(t>=7?"ok":"vigila"),al);et.set(null,al?"rojo":(t>=7?"ok":""));K.contador("En fila",n+" personas");K.contador("Espera estimada",(al?"6":(t<2?"4":"2"))+" min");
        e(t,2,"a",function(){K.evento("Fila larga en caja · 5 personas · abrir otra caja","alerta")});e(t,7,"b",function(){K.evento("Fila despachada · aviso cerrado","")})}}});
  S.video("filas",{src:"evidencia-publica/operativo/filas.mp4",poster:"evidencia-publica/operativo/filas-poster.jpg",chapa:"CCTV real · detector real",
    fuente:"MEVA (Multiview Extended Video with Activities), cámara G421, 2018-03-07 16:50, s 0–18",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:2,
    marcas:[{tipo:"zona",pts:marcaPx(G421,FILA_PX),color:"vigila",etiqueta:"Fila caja",hasta:2},{tipo:"zona",pts:marcaPx(G421,FILA_PX),color:"alerta",etiqueta:"Fila caja",desde:2,hasta:7},{tipo:"zona",pts:marcaPx(G421,FILA_PX),color:"ok",etiqueta:"Fila caja",desde:7}]});

  /* ---------------------------------------- DETECCIÓN DE PERSONAL ---------------------------------------- */
  var STAFFD=/*DATA:staff*/[{"id":1,"ap":0.0,"des":17.7,"r":[[0.0,-1.53,-1.8],[2.5,-1.45,-1.68],[5.0,-1.55,-1.83],[9.0,-1.28,-1.45],[14.2,-1.74,-2.06],[17.2,-1.79,-2.14],[17.7,-1.78,-2.13]],"camisa":"#867357","pantalon":"#6E614A","rol":"caja","ids":["1","27"]},{"id":3,"ap":0.0,"des":17.2,"r":[[0.0,0.54,-8.4],[0.5,0.63,-8.12],[1.0,0.72,-7.96],[1.5,0.88,-7.49],[2.0,1.12,-7.17],[2.5,1.39,-7.03],[3.0,1.61,-6.84],[3.5,1.78,-6.63],[4.5,1.95,-6.38],[7.7,3.32,-7.94],[8.7,2.86,-7.11],[10.7,2.62,-6.59],[11.2,2.46,-6.24],[11.7,2.37,-5.95],[12.2,2.48,-5.78],[12.7,2.62,-5.62],[14.2,2.63,-4.23],[15.2,2.5,-3.57],[15.7,2.57,-3.53],[16.2,2.73,-3.49],[17.2,2.91,-3.39]],"camisa":"#5C3D63","pantalon":"#7C7C7B","rol":"limpieza","ids":["3","19"]},{"id":4,"ap":0.0,"des":17.5,"r":[[0.0,1.88,-4.58],[1.5,1.82,-4.44],[6.5,1.78,-4.3],[7.5,1.63,-4.24],[8.5,1.46,-4.29],[9.0,1.37,-4.19],[10.0,1.15,-4.0],[11.0,0.9,-3.67],[13.0,0.93,-3.48],[14.5,0.88,-3.27],[17.0,0.93,-3.2],[17.5,0.91,-3.2]],"camisa":"#36363A","pantalon":"#383D51","rol":null},{"id":5,"ap":0.0,"des":18.0,"r":[[0.0,-1.3,-3.01],[1.0,-1.31,-3.0],[2.0,-1.2,-2.76],[3.5,-1.2,-2.62],[4.5,-1.3,-2.9],[5.0,-1.17,-2.61],[5.5,-1.02,-2.6],[6.0,-0.81,-2.47],[6.5,-0.45,-2.32],[7.0,-0.05,-1.98],[9.0,0.22,-1.81],[9.5,0.45,-1.66],[13.0,0.63,-1.59],[14.0,0.63,-1.42],[17.5,0.67,-1.54],[18.0,0.68,-1.59]],"camisa":"#413F37","pantalon":"#343939","rol":null},{"id":6,"ap":0.0,"des":2.5,"r":[[0.0,-1.21,-9.58],[0.5,-0.98,-9.74],[1.0,-0.8,-10.05],[1.5,-0.46,-10.07],[2.0,-0.26,-10.16],[2.5,-0.09,-10.57]],"camisa":"#444952","pantalon":"#323958","rol":null},{"id":7,"ap":0.0,"des":2.0,"r":[[0.0,3.44,-4.14],[0.5,3.55,-4.2],[1.0,3.67,-4.24],[2.0,3.9,-4.38]],"camisa":"#303539","pantalon":"#303336","rol":null},{"id":9,"ap":0.0,"des":9.5,"r":[[0.0,1.26,-2.64],[2.5,1.14,-2.48],[9.0,1.27,-2.44],[9.5,1.29,-2.34]],"camisa":"#474442","pantalon":"#3B3B38","rol":null},{"id":10,"ap":0.1,"des":17.6,"r":[[0.1,-0.9,-2.23],[2.1,-0.97,-2.38],[3.6,-0.99,-2.59],[4.1,-0.95,-2.64],[4.6,-0.95,-2.8],[6.1,-0.85,-2.65],[7.6,-0.82,-2.49],[8.1,-0.77,-2.24],[9.1,-0.81,-2.21],[9.6,-1.19,-3.7],[10.1,-1.47,-5.05],[11.6,-1.44,-5.22],[12.1,-1.04,-3.76],[12.6,-0.78,-2.57],[14.1,-0.72,-2.45],[14.6,-0.73,-2.44],[15.1,-1.16,-4.34],[16.1,-1.22,-4.49],[16.6,-1.23,-4.51],[17.1,-1.35,-5.05],[17.6,-0.81,-2.56]],"camisa":"#353732","pantalon":"#4E4D4A","rol":null},{"id":11,"ap":0.2,"des":6.2,"r":[[0.2,-4.62,-14.7],[0.7,-4.61,-14.57],[1.2,-4.64,-14.51],[1.7,-4.67,-14.38],[2.7,-4.64,-14.24],[3.2,-4.64,-14.26],[6.2,-4.14,-12.96]],"camisa":"#34383F","pantalon":"#414D71","rol":null},{"id":8,"ap":1.5,"des":6.0,"r":[[1.5,-2.86,-6.26],[5.5,-2.84,-6.26],[6.0,-2.81,-6.18]],"camisa":"#44403D","pantalon":"#5C4B46","rol":null},{"id":15,"ap":4.7,"des":7.7,"r":[[4.7,-1.33,-1.92],[5.2,-1.43,-2.11],[5.7,-1.46,-2.26],[6.2,-1.46,-2.39],[6.7,-1.45,-2.41],[7.2,-1.52,-2.58],[7.7,-1.44,-2.55]],"camisa":"#545040","pantalon":"#36362D","rol":null},{"id":16,"ap":6.9,"des":12.4,"r":[[6.9,-2.46,-8.22],[7.4,-2.2,-7.94],[7.9,-2.03,-8.0],[8.4,-1.68,-8.3],[8.9,-1.3,-8.38],[9.4,-1.07,-9.09],[9.9,-0.67,-11.41],[10.4,-0.49,-12.2],[12.4,-0.28,-13.03]],"camisa":"#32363A","pantalon":"#493E61","rol":null},{"id":18,"ap":7.7,"des":17.7,"r":[[7.7,-4.28,-12.87],[9.2,-4.27,-12.75],[9.7,-4.31,-12.78],[10.2,-4.2,-12.3],[11.2,-4.04,-11.85],[11.7,-3.89,-11.56],[12.2,-3.85,-11.93],[12.7,-3.66,-11.76],[13.2,-3.49,-11.7],[14.2,-2.93,-11.33],[14.7,-2.43,-10.22],[15.2,-2.08,-9.76],[16.2,-1.41,-9.36],[16.7,-1.05,-8.97],[17.2,-0.87,-8.91],[17.7,-0.72,-8.95]],"camisa":"#363846","pantalon":"#5873AD","rol":null},{"id":21,"ap":10.2,"des":17.7,"r":[[10.2,-1.63,-3.05],[10.7,-1.65,-3.09],[11.2,-1.62,-2.9],[11.7,-1.64,-2.8],[12.2,-1.7,-2.93],[14.2,-1.58,-2.79],[14.7,-1.58,-2.97],[16.2,-1.57,-3.11],[17.2,-1.61,-3.14],[17.7,-1.68,-3.27]],"camisa":"#524A3E","pantalon":"#847E60","rol":null},{"id":22,"ap":10.7,"des":12.2,"r":[[10.7,-0.2,-10.33],[11.7,-0.09,-10.33],[12.2,0.05,-10.28]],"camisa":"#323A48","pantalon":"#2F3C66","rol":null}]/*FIN*/;
  S.redef({id:"staff",grupo:1,nombre:"Detección de personal",corta:"Separa al personal de los clientes en sala.",estado:"listo para instalar",
    desc:"Decide si quien aparece es del equipo o es un cliente, por la ropa de trabajo y el puesto, sin reconocer a nadie. Así los conteos de clientes no se inflan con el personal.",
    dur:18,camara:{pos:[G421.ox+5,8.5,G421.oz+3],mira:[G421.ox-1.5,0.6,G421.oz-5]},
    fases:[[0,"vigila","Ve a todas las personas de la cafetería"],[2,"detecta","Mira la ropa de trabajo y el puesto: la cajera y la persona de limpieza son personal"],[6,"ok","Cuenta personal y clientes por separado, en todo momento"]],
    armar:function(K){var cs=G421;K.camara(cs.pos,cs.mira,{id:"CAM CAFETERÍA",fov:cs.F});salaG421(K,cs);
      var L=actores(K,STAFFD,cs,function(o,a){if(a.rol==="limpieza")o.ropa={camisa:0x8A3D6B,pantalon:0x5A5A66,zapatos:0x1C1E22};if(a.rol==="caja")o.ropa={camisa:0xD8C7A6,pantalon:0x8A7A5E,zapatos:0x1C1E22}});
      L.forEach(function(P){if(P.dato.rol==="limpieza"){var tr=new THREE.Group();K.cil(0,-0.9,0,0.015,0.015,1.35,K.mat.aceroOsc,tr);K.caja(0,-0.95,0,0.35,0.05,0.12,K.std(0xB9BCC2,{roughness:1}),tr);P.sostener(tr,"Right",[0,0.05,0.04])}});
      var R=L.map(function(p){return K.recuadro(p,{texto:"persona"})}),lb=L.map(function(p){var st=!!p.dato.rol;return K.etiqueta(st?"personal":"cliente",st?"amarilla":"celeste",K.sobre(p))});var e=reloj();
      return function(t){visibles(L,t);var np=0,nc=0;L.forEach(function(p,i){var st=!!p.dato.rol,ok=t>2+(i%4)*0.3;R[i].set(ok?(st?"staff":"cliente"):"vigila",ok?(st?"personal "+(94+i%4)+"%":"cliente "+(90+i%7)+"%"):"persona");lb[i].el.style.opacity=ok&&p.visible?1:0;if(ok&&p.visible){if(st)np++;else nc++}});
        e(t,2,"a",function(){K.evento("Personal identificado · cajera y limpieza","")});K.contador("Personal en sala",String(np));K.contador("Clientes",String(nc))}}});
  S.video("staff",{src:"evidencia-publica/operativo/staff.mp4",poster:"evidencia-publica/operativo/staff-poster.jpg",chapa:"CCTV real · detector real",
    fuente:"MEVA, cámara G421, 2018-03-07 16:50, s 24–42 (roles personal/cliente asignados a mano sobre las pistas del detector)",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:2,marcas:[]});

  /* ---------------------------------------- CONTROL DE AFORO ---------------------------------------- */
  var AFORO=/*DATA:aforo*/[{"id":1,"ap":0.0,"des":9.0,"r":[[0.0,-13.46,-25.08],[0.5,-13.37,-24.28],[1.0,-13.11,-23.25],[7.0,-13.03,-22.69],[9.0,-12.82,-21.76]],"camisa":"#542D2F","pantalon":"#3E3231"},{"id":3,"ap":0.0,"des":6.0,"r":[[0.0,-2.73,-11.62],[0.5,-2.46,-10.81],[1.0,-2.2,-10.17],[1.5,-1.75,-8.81],[2.0,-1.36,-8.09],[2.5,-1.06,-7.57],[3.0,-0.78,-7.22],[3.5,-0.52,-7.02],[4.5,0.05,-6.71],[5.0,0.33,-6.45],[5.5,0.46,-6.4],[6.0,0.59,-6.32]],"camisa":"#2A2C2F","pantalon":"#3D4252"},{"id":4,"ap":3.9,"des":12.4,"r":[[3.9,-4.32,-15.57],[4.4,-4.45,-15.27],[4.9,-4.61,-15.08],[5.4,-5.28,-15.73],[5.9,-5.66,-15.81],[6.4,-5.92,-16.01],[6.9,-6.29,-16.71],[7.4,-6.57,-17.04],[7.9,-6.79,-16.93],[8.4,-7.37,-17.6],[8.9,-7.95,-17.78],[9.4,-7.89,-16.76],[9.9,-7.75,-16.09],[10.4,-7.27,-15.11],[10.9,-7.03,-15.72],[11.4,-6.54,-15.21],[12.4,-6.6,-16.02]],"camisa":"#373531","pantalon":"#3B3F3B"},{"id":5,"ap":5.3,"des":8.8,"r":[[5.3,-3.91,-14.94],[5.8,-3.73,-13.92],[6.3,-3.63,-13.2],[6.8,-3.44,-12.02],[7.3,-3.23,-11.02],[7.8,-3.56,-11.51],[8.3,-3.64,-11.66],[8.8,-3.77,-12.11]],"camisa":"#2D2D2F","pantalon":"#414960"},{"id":6,"ap":7.8,"des":11.3,"r":[[7.8,-7.59,-14.12],[8.3,-7.52,-13.41],[8.8,-7.14,-12.3],[9.3,-6.65,-10.56],[9.8,-6.24,-9.33],[10.3,-6.02,-8.67],[10.8,-5.69,-8.02],[11.3,-5.71,-8.07]],"camisa":"#2D2D2D","pantalon":"#30313A"},{"id":8,"ap":9.1,"des":12.1,"r":[[9.1,-1.47,-7.44],[9.6,-1.27,-7.55],[10.1,-1.04,-7.36],[11.1,-0.05,-6.76],[11.6,0.18,-6.72],[12.1,0.46,-6.34]],"camisa":"#2A2B30","pantalon":"#3E4863"},{"id":10,"ap":10.8,"des":16.3,"r":[[10.8,-3.26,-16.07],[11.3,-3.36,-16.13],[11.8,-3.49,-16.32],[12.3,-3.11,-14.84],[12.8,-2.74,-13.05],[13.3,-2.24,-11.47],[13.8,-1.51,-9.6],[14.3,-0.57,-7.44],[14.8,0.05,-6.86],[15.3,0.34,-6.75],[16.3,0.68,-6.13]],"camisa":"#333436","pantalon":"#363C42"},{"id":11,"ap":10.8,"des":13.8,"r":[[10.8,-5.02,-13.57],[11.8,-5.0,-14.07],[12.8,-5.1,-14.52],[13.3,-4.79,-13.96],[13.8,-4.44,-13.56]],"camisa":"#3E3B39","pantalon":"#3C4245"},{"id":17,"ap":14.9,"des":17.9,"r":[[14.9,-3.55,-15.37],[15.9,-3.35,-14.24],[16.9,-2.84,-12.8],[17.4,-2.67,-11.78],[17.9,-2.49,-11.38]],"camisa":"#383035","pantalon":"#363E59"},{"id":18,"ap":14.9,"des":16.4,"r":[[14.9,-6.77,-11.44],[15.4,-6.74,-11.24],[15.9,-6.74,-11.24],[16.4,-6.45,-10.54]],"camisa":"#2F3134","pantalon":"#2B2D2F"},{"id":19,"ap":15.3,"des":17.8,"r":[[15.3,-2.8,-9.48],[15.8,-2.41,-9.17],[16.3,-2.07,-8.8],[16.8,-1.26,-7.88],[17.3,-0.93,-7.64],[17.8,-0.66,-7.59]],"camisa":"#303239","pantalon":"#363B50"},{"id":21,"ap":15.9,"des":17.9,"r":[[15.9,-6.81,-12.48],[16.4,-6.84,-12.72],[17.4,-6.84,-12.72],[17.9,-6.88,-12.65]],"camisa":"#2E2E2C","pantalon":"#2E2E35"},{"id":23,"ap":16.7,"des":17.7,"r":[[16.7,-5.97,-14.04],[17.2,-5.97,-14.04],[17.7,-5.97,-14.04]],"camisa":"#3A3B44","pantalon":"#2E2E37"}]/*FIN*/;
  var AFORO_PX=[[31,256],[1830,256],[1904,1054],[31,1054]];
  /* conteo que dibujó el detector D-FINE-S quemado en el clip (segundo del clip → personas en el vestíbulo) */
  var AFORO_N=[[0,4],[1,3],[5,4],[7,7],[9,8],[11,11],[12.5,13],[14,14],[15.5,13],[17.5,15]];
  S.redef({id:"aforo",grupo:1,nombre:"Control de aforo",corta:"Lleva cuántos hay adentro y avisa al llegar al límite.",
    desc:"Cuenta cuántas personas hay dentro del vestíbulo, cuadro a cuadro. Al pasar el límite que se fijó para el espacio avisa para frenar el ingreso.",
    dur:18,camara:{pos:[G421.ox+5,8.5,G421.oz+3],mira:[G421.ox-1.5,0.6,G421.oz-6]},
    fases:[[0,"vigila","Cuenta a quien está en el vestíbulo: el límite es 12"],[7,"detecta","Entra un grupo por las puertas de vidrio: 7, 8, 11…"],[12.5,"alerta","13 de 12: aforo superado, aviso para frenar el ingreso"]],
    armar:function(K){var cs=G421;K.camara(cs.pos,cs.mira,{id:"CAM VESTÍBULO",fov:cs.F});salaG421(K,cs);
      var zp=zonaPx(cs,[[31,330],[1830,420],[1904,1054],[31,1054]]),Z=K.zona(zp,{estado:"vigila",op:0.12}),et=K.etiqueta("Aforo · vestíbulo","",function(){return new THREE.Vector3((zp[0][0]+zp[1][0])/2,0.4,(zp[0][1]+zp[1][1])/2)});
      var L=actores(K,AFORO,cs),R=L.map(function(p){return K.recuadro(p,{texto:"persona"})});var e=reloj();
      return function(t){visibles(L,t);var n=4;AFORO_N.forEach(function(q){if(t>=q[0])n=q[1]});var al=n>12;
        L.forEach(function(p,i){R[i].set(al?"alerta":"detecta","persona")});Z.set(al?"alerta":(n>=10?"detecta":"vigila"),al);et.set(null,al?"rojo":(n>=10?"ambar":""));
        K.contador("En el vestíbulo",n+" / 12");K.contador("Disponible",al?"0 · superado":String(12-n));
        e(t,7,"a",function(){K.evento("Entra un grupo · 7 en el vestíbulo","detecta")});e(t,12.5,"b",function(){K.evento("Aforo superado · 13 de 12","alerta")})}}});
  S.video("aforo",{src:"evidencia-publica/operativo/aforo.mp4",poster:"evidencia-publica/operativo/aforo-poster.jpg",chapa:"CCTV real · modelo real",
    fuente:"MEVA, cámara G421, 2018-03-13 17:35, s 167.9–185.9 (recorte del clip anterior con el detector D-FINE-S quemado)",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:12.5,
    marcas:[{tipo:"zona",pts:marcaPx(G421,AFORO_PX),color:"vigila",etiqueta:"Aforo · vestíbulo",hasta:12.5},{tipo:"zona",pts:marcaPx(G421,AFORO_PX),color:"alerta",etiqueta:"Aforo · vestíbulo",desde:12.5}]});

  /* ---------------------------------------- GUARDIÁN DE PUESTOS ---------------------------------------- */
  var GUARD=/*DATA:guardian*/[{"id":1,"ap":10.5,"des":16.5,"r":[[10.5,-1.13,-1.78],[11.5,-1.32,-1.76],[12.0,-1.45,-1.86],[13.0,-1.63,-2.08],[13.5,-1.64,-2.09],[16.5,-1.16,-1.4]],"camisa":"#756F5D","pantalon":"#524E3D","rol":"relevo"},{"id":2,"ap":0.0,"des":18.0,"r":[[0.0,3.27,-3.51],[1.0,3.19,-3.4],[3.5,3.44,-3.71],[5.5,3.55,-3.83],[8.5,3.64,-3.95],[17.5,3.61,-3.93],[18.0,3.57,-3.9]],"camisa":"#3E3D49","pantalon":"#554048","rol":null},{"id":3,"ap":0.0,"des":8.5,"r":[[0.0,-5.83,-11.21],[0.5,-5.72,-10.98],[1.5,-5.63,-10.82],[3.5,-5.57,-10.7],[4.0,-5.41,-10.34],[4.5,-5.33,-10.28],[5.0,-5.22,-10.23],[5.5,-5.38,-10.98],[6.5,-4.7,-10.27],[7.5,-4.49,-9.99],[8.0,-4.44,-9.99],[8.5,-3.79,-8.51]],"camisa":"#323336","pantalon":"#353A41","rol":null},{"id":5,"ap":0.0,"des":2.5,"r":[[0.0,1.62,-4.89],[0.5,1.76,-5.14],[1.0,1.93,-5.37],[1.5,2.23,-5.78],[2.0,2.41,-6.06],[2.5,2.54,-6.19]],"camisa":"#4C4954","pantalon":"#37416A","rol":null},{"id":7,"ap":0.0,"des":1.0,"r":[[0.0,0.09,-4.08],[0.5,0.09,-4.08],[1.0,0.09,-4.08]],"camisa":"#2C3037","pantalon":"#2F2E36","rol":null},{"id":8,"ap":0.0,"des":7.3,"r":[[0.0,-1.63,-2.21],[1.5,-1.56,-2.11],[3.5,-1.45,-1.93],[4.5,-1.5,-1.9],[5.0,-1.47,-1.8],[7.3,-1.47,-1.8]],"camisa":"#682F4D","pantalon":"#303029","rol":"titular"},{"id":13,"ap":1.3,"des":9.3,"r":[[1.3,-3.64,-8.48],[2.3,-3.62,-8.42],[2.8,-3.5,-8.41],[3.3,-3.4,-8.42],[4.3,-3.2,-8.31],[4.8,-3.42,-9.32],[5.3,-3.56,-9.98],[6.3,-3.68,-10.05],[6.8,-3.71,-10.63],[7.3,-3.17,-9.82],[7.8,-2.4,-9.18],[8.3,-2.14,-9.29],[9.3,-1.84,-9.62]],"camisa":"#323029","pantalon":"#303030","rol":null},{"id":14,"ap":1.6,"des":17.6,"r":[[1.6,-1.85,-10.79],[2.1,-1.66,-10.25],[3.1,-1.49,-9.94],[4.1,-0.71,-9.07],[5.1,-0.34,-8.3],[7.1,1.52,-5.99],[7.6,1.96,-5.76],[8.6,2.5,-5.64],[9.1,2.6,-5.54],[10.1,2.72,-5.6],[10.6,2.86,-5.83],[11.6,2.9,-5.67],[12.1,2.89,-5.55],[12.6,2.85,-5.47],[13.1,2.75,-5.21],[15.1,2.71,-5.31],[15.6,2.69,-5.44],[16.1,2.62,-5.47],[17.1,2.39,-5.53],[17.6,2.3,-5.61]],"camisa":"#2F3540","pantalon":"#364160","rol":null},{"id":15,"ap":1.6,"des":11.1,"r":[[1.6,-3.74,-5.13],[3.6,-3.89,-5.39],[4.6,-3.83,-5.37],[5.1,-3.55,-5.09],[5.6,-3.14,-4.62],[6.6,-2.67,-4.11],[7.6,-1.83,-3.17],[8.1,-1.65,-3.0],[9.1,-1.37,-2.87],[10.1,-1.29,-3.01],[10.6,-1.25,-3.05],[11.1,-1.24,-3.01]],"camisa":"#302F30","pantalon":"#333336","rol":null},{"id":16,"ap":2.8,"des":3.8,"r":[[2.8,-3.15,-11.96],[3.3,-3.15,-11.96],[3.8,-3.15,-11.96]],"camisa":"#333337","pantalon":"#34373D","rol":null},{"id":30,"ap":7.6,"des":13.6,"r":[[7.6,-1.98,-5.72],[11.1,-2.0,-5.71],[11.6,-1.94,-5.55],[12.1,-1.95,-5.56],[13.6,-1.91,-5.46]],"camisa":"#313032","pantalon":"#313132","rol":null},{"id":31,"ap":8.6,"des":17.6,"r":[[8.6,0.57,-9.35],[9.6,0.6,-9.17],[10.1,0.69,-9.09],[10.6,0.76,-9.62],[11.1,0.72,-10.12],[11.6,0.56,-10.09],[12.1,0.37,-10.3],[12.6,0.01,-11.09],[13.1,-0.36,-11.36],[13.6,-0.54,-11.68],[14.1,-0.55,-11.48],[14.6,-0.48,-11.56],[15.6,-0.14,-10.79],[16.1,0.12,-11.49],[16.6,0.23,-11.85],[17.6,0.35,-12.67]],"camisa":"#2E2F36","pantalon":"#2C3038","rol":null},{"id":27,"ap":8.9,"des":9.9,"r":[[8.9,-3.68,-5.81],[9.4,-3.68,-5.81],[9.9,-3.68,-5.81]],"camisa":"#5E3638","pantalon":"#353034","rol":null},{"id":34,"ap":9.2,"des":10.7,"r":[[9.2,1.34,-7.15],[9.7,1.28,-7.03],[10.2,1.28,-7.03],[10.7,1.29,-6.73]],"camisa":"#595662","pantalon":"#94AAD0","rol":null},{"id":37,"ap":10.3,"des":12.8,"r":[[10.3,1.96,-6.3],[11.3,2.09,-6.41],[11.8,2.28,-6.63],[12.3,2.36,-6.74],[12.8,2.54,-6.87]],"camisa":"#384056","pantalon":"#3C4A7D","rol":null},{"id":32,"ap":10.9,"des":17.9,"r":[[10.9,-3.68,-5.55],[11.9,-3.74,-5.93],[12.9,-3.85,-6.76],[14.4,-3.76,-6.82],[15.4,-3.83,-7.19],[15.9,-3.92,-7.29],[16.9,-4.31,-7.97],[17.9,-4.51,-8.35]],"camisa":"#533742","pantalon":"#59324B","rol":null},{"id":43,"ap":15.7,"des":17.2,"r":[[15.7,-3.57,-7.58],[16.7,-3.57,-7.59],[17.2,-3.55,-7.58]],"camisa":"#323131","pantalon":"#4A4448","rol":null}]/*FIN*/;
  var CAJA_PX=[[9,509],[329,509],[329,1063],[9,1063]];
  S.redef({id:"guardian",grupo:1,nombre:"Guardián de puestos",corta:"Vigila que el puesto lo atienda la misma persona.",estado:"en validación",
    desc:"Avisa cuando alguien distinto ocupa un puesto con la sesión de otro, cuando la misma persona figura en dos puestos o cuando un puesto queda abierto sin nadie. Aquí, la caja de la cafetería.",
    dur:18,camara:{pos:[G421.ox+5,8.5,G421.oz+3],mira:[G421.ox-1.5,0.6,G421.oz-5]},
    fases:[[0,"ok","La caja la atiende su titular"],[7.5,"detecta","La titular se va: la caja queda en espera"],[14,"alerta","Otra persona ocupa la caja: aviso de cambio de persona"]],
    armar:function(K){var cs=G421;K.camara(cs.pos,cs.mira,{id:"CAM CAFETERÍA",fov:cs.F});salaG421(K,cs);
      var zp=zonaPx(cs,[[9,700],[329,700],[329,1063],[9,1063]]),Z=K.zona(zp,{estado:"ok"}),et=K.etiqueta("Puesto · caja","ok",function(){return new THREE.Vector3((zp[0][0]+zp[1][0])/2,1.6,(zp[0][1]+zp[1][1])/2)});
      var L=actores(K,GUARD,cs,function(o,a){if(a.rol==="titular")o.ropa={camisa:0xB0338A,pantalon:0x22252B,zapatos:0x1C1E22};if(a.rol==="relevo")o.ropa={camisa:0x9EA3A8,pantalon:0x4A5F80,zapatos:0x1C1E22}});
      var R=L.map(function(p){var r=p.dato.rol;return K.recuadro(p,{texto:r==="titular"?"titular caja":(r==="relevo"?"persona":"persona"),estado:r==="titular"?"ok":"vigila"})});var e=reloj();
      return function(t){visibles(L,t);var est=t<7.5?"ok":(t<14?"detecta":"alerta");Z.set(est,est==="alerta");et.set(t<7.5?"Puesto · caja · ocupada":(t<14?"Puesto · caja · en espera":"Puesto · caja · otra persona"),est==="ok"?"ok":(est==="detecta"?"ambar":"rojo"));
        L.forEach(function(p,i){var r=p.dato.rol;if(r==="relevo")R[i].set(t>=14?"alerta":"vigila",t>=14?"no es el titular":"persona")});
        K.contador("Caja",t<7.5?"titular":(t<14?"en espera":"otra persona"));K.contador("Eventos de hoy",t>=14?"2":"1");
        e(t,7.5,"a",function(){K.evento("Caja en espera · titular ausente","detecta")});e(t,14,"b",function(){K.evento("Cambio de persona en caja · aviso","alerta")})}}});
  S.video("guardian",{src:"evidencia-publica/operativo/guardian.mp4",poster:"evidencia-publica/operativo/guardian-poster.jpg",chapa:"CCTV real · modelo real",
    fuente:"MEVA, cámara G421, 2018-03-07 11:05, s 282–300 (recorte del clip anterior con Guardián v2 quemado)",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:14,
    marcas:[{tipo:"zona",pts:marcaPx(G421,CAJA_PX),color:"ok",etiqueta:"Puesto · caja",hasta:7.5},{tipo:"zona",pts:marcaPx(G421,CAJA_PX),color:"detecta",etiqueta:"Puesto · caja",desde:7.5,hasta:14},{tipo:"zona",pts:marcaPx(G421,CAJA_PX),color:"alerta",etiqueta:"Puesto · caja",desde:14}]});

  /* =====================================================================================================
     ESCALERA G326 · puerta de acceso del edificio administrativo (MEVA): listas blancas y cierre de puerta
     ===================================================================================================== */
  var G326=camCal(/*CAL:G326*/{H:1.8,p:15,F:57,ox:0,oz:1.5}/*FIN*/);
  function escaleraG326(K,cs){var P=function(x,y,h){return cs.piso(x,y,h||0)};
    var bloque=K.std(0xC4C1B6,{roughness:0.95}),naranja=K.std(0xC9542E,{roughness:0.7}),blanco=K.std(0xF2F2EE,{roughness:0.9}),negro=K.std(0x1E2024,{roughness:0.9}),
      vid=K.std(0xE6F0F8,{transparent:true,opacity:0.45,roughness:0.05,depthWrite:false}),luz=K.std(0xFFFFFF,{emissive:0xFFFFFF,emissiveIntensity:1.1});
    K.piso(16,16,K.std(0xA7A8A3,{roughness:0.85}));
    var d0=P(700,965),d1=P(1100,900),u=[(d1[0]-d0[0])/largo(d0,d1),(d1[1]-d0[1])/largo(d0,d1)],n=[u[1],-u[0]];
    function en(k,m){return[d0[0]+u[0]*k+n[0]*(m||0),d0[1]+u[1]*k+n[1]*(m||0)]}
    var Wd=largo(d0,d1),izq=en(-1.0),fin=en(Wd+3.2),ry=-Math.atan2(u[1],u[0]);
    K.muro(izq[0],izq[1],d0[0],d0[1],3.0,bloque);K.muro(d1[0],d1[1],fin[0],fin[1],3.0,bloque);tabla(K,d0,d1,2.15,0.85,0.16,bloque);
    var iz2=[izq[0]-n[0]*4,izq[1]-n[1]*4];K.muro(izq[0],izq[1],iz2[0],iz2[1],3.0,blanco,0.3);
    [0,Wd].forEach(function(k){var q=en(k);K.caja(q[0],0,q[1],0.1,2.2,0.2,naranja,ry)});tabla(K,en(0),en(Wd),2.15,0.1,0.2,naranja);
    /* exterior luminoso detrás de la puerta */
    tabla(K,en(-0.3,1.4),en(Wd+0.3,1.4),0,2.6,0.05,K.std(0xF4F7FA,{emissive:0xE8EEF5,emissiveIntensity:0.9}));
    var pis=en(Wd/2,0.75);K.caja(pis[0],-0.02,pis[1],Wd+0.6,0.02,1.4,K.std(0x9A9C98,{roughness:1}),ry);
    /* hoja con bisagra a la derecha, abre hacia afuera */
    var hj=K.grupo(d1[0],d1[1],-ry/RAD);var hoja=new THREE.Group();hj.add(hoja);
    K.caja(-Wd/2,0.02,0,Wd-0.06,2.08,0.05,naranja,hoja);K.caja(-Wd/2-0.05,1.0,0.03,Wd*0.68,1.05,0.02,vid,hoja);K.caja(-Wd/2,0.95,-0.05,Wd*0.8,0.04,0.04,K.mat.acero,hoja);K.caja(-Wd/2,0.02,0.03,Wd-0.1,0.2,0.02,negro,hoja);
    hj.userData.abrir=function(k){hoja.rotation.y=-k*1.75};
    var pp=en(-0.35,-0.02);K.caja(pp[0],1.1,pp[1],0.14,0.14,0.04,K.std(0x3A3530),ry);
    var lu=en(Wd*0.9,-1.0);K.caja(lu[0],2.62,lu[1],1.4,0.12,0.35,luz,ry);
    var pn=en(Wd+0.9,-0.03);K.caja(pn[0],1.9,pn[1],0.45,0.5,0.04,negro,ry);
    var ta=en(Wd/2,-0.55);K.caja(ta[0],0,ta[1],Wd*1.1,0.015,0.6,K.std(0x2A2D33,{roughness:1}),ry);
    /* hueco de la escalera con baranda naranja (baja a la derecha) */
    for(var i=0;i<7;i++){var a=en(Wd+0.45+i*0.28,-1.2);K.caja(a[0],-0.18*(i+1),a[1],0.28,0.06,2.0,K.std(0x8E908C),ry)}
    var ra=en(Wd+0.35,-0.25),rb=en(Wd+0.35,-2.2);tabla(K,ra,rb,0.95,0.05,0.05,naranja);[0,0.5,1].forEach(function(k){var q=medio(ra,rb,k);K.caja(q[0],0,q[1],0.06,1.0,0.06,naranja)});
    var ma0=en(Wd+0.2,-0.08),ma1=en(Wd+2.6,-0.08),mc=medio(ma0,ma1),bar=K.caja(mc[0],0.95,mc[1],largo(ma0,ma1)*1.15,0.04,0.04,naranja,ang(ma0,ma1));bar.rotation.z=-0.55;
    sinObstaculos();return{puerta:hj,en:en,Wd:Wd}}
  var PUERTA_UV=[[0.36,0.84],[0.58,0.81],[0.6,1],[0.33,1]];

  /* ---------------------------------------- LISTAS BLANCAS ---------------------------------------- */
  S.redef({id:"blancas",grupo:1,nombre:"Listas blancas",corta:"Reconoce a quien tiene acceso y le abre.",estado:"funcionando a diario",
    desc:"Reconoce a las personas autorizadas en un acceso y habilita el paso sin tarjeta. A quien no está en la lista no le abre solo: pide validación.",
    dur:16,camara:{pos:[G326.ox+2.6,3.6,G326.oz+1.4],mira:[G326.ox-0.2,0.9,G326.oz-3.4]},
    fases:[[0,"vigila","La cámara del acceso ve llegar a alguien por la escalera"],[5,"ok","Está en la lista blanca: la puerta se libera y sale"],[5.6,"detecta","Su acompañante no está en la lista: queda registrado para validar"],[12,"vigila","La puerta vuelve a cerrar: el acceso queda en el registro"]],
    armar:function(K){var cs=G326;K.camara(cs.pos,cs.mira,{id:"CAM ACCESO",fov:cs.F});var E=escaleraG326(K,cs),pu=E.puerta;
      var c=E.en(E.Wd/2,0.25),dl=E.en(E.Wd/2,-0.45),af=E.en(E.Wd/2,2.2),af2=E.en(E.Wd*0.2,3.2),ll=E.en(E.Wd+0.9,-0.9),ll0=E.en(E.Wd+1.8,-1.4);
      var A=K.persona({escala:0.95,evita:false,ropa:{camisa:0x1B2440,pantalon:0x161C2B,zapatos:0x1C1E22,chaleco:0xD8E04A},ruta:[[0,ll0[0],ll0[1]],[2.9,ll0[0],ll0[1]],[4.2,ll[0],ll[1]],[5.2,dl[0]-0.1,dl[1],"idle",c[0],c[1]],[7.2,dl[0]-0.1,dl[1]],[8.6,c[0],c[1]],[10,af[0],af[1]],[16,af2[0],af2[1]]]});
      var B=K.persona({escala:1.0,evita:false,ropa:{camisa:0x2A3346,pantalon:0x41608C,zapatos:0x3A2F2A},ruta:[[0,ll0[0]+0.3,ll0[1]],[3.2,ll0[0]+0.3,ll0[1]],[4.6,ll[0]+0.2,ll[1]+0.1],[5.6,dl[0]+0.45,dl[1]-0.1,"idle",c[0],c[1]],[8.4,dl[0]+0.4,dl[1]],[9.6,c[0]+0.1,c[1]],[10.8,af[0]+0.4,af[1]],[16,af2[0]+0.5,af2[1]]]});
      var RA=K.recuadro(A,{texto:"rostro",h:0.32,w:0.3,d:0.3,y:A.alto-0.34}),RB=K.recuadro(B,{texto:"rostro",h:0.32,w:0.3,d:0.3,y:B.alto-0.34});
      var la=K.etiqueta("Lista blanca · autorizada","ok",K.sobre(A)),lb=K.etiqueta("Sin coincidencia · validar","ambar",K.sobre(B));var e=reloj();
      return function(t){A.visible=t>2.9&&t<10.4;B.visible=t>3.2&&t<11.2;var k=t<6.7?0:(t<8.9?suave((t-6.7)/2.2):(t<10.6?1:(t<12.4?1-suave((t-10.6)/1.8):0)));pu.userData.abrir(k);
        RA.set(t>5?"ok":"vigila",t>5?"autorizada":"rostro");RB.set(t>5.6?"detecta":"vigila",t>5.6?"sin coincidencia":"rostro");la.el.style.opacity=t>5&&A.visible?1:0;lb.el.style.opacity=t>5.6&&B.visible?1:0;
        K.contador("Puerta",k>0.05?"abierta":"cerrada");K.contador("Accesos de hoy",t>6.7?"38":"37");
        e(t,5,"a",function(){K.evento("Acceso autorizado · lista blanca","")});e(t,5.6,"b",function(){K.evento("Acompañante sin coincidencia · validar","detecta")})}}});
  S.video("blancas",{src:"evidencia-publica/operativo/blancas.mp4",poster:"evidencia-publica/operativo/blancas-poster.jpg",chapa:"CCTV real · escena de referencia",
    fuente:"MEVA, cámara G326 (acceso del edificio administrativo), 2018-03-07 11:05, s 98–114",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:5,
    marcas:[{tipo:"zona",pts:PUERTA_UV,color:"vigila",etiqueta:"Acceso",hasta:5},{tipo:"zona",pts:PUERTA_UV,color:"ok",etiqueta:"Acceso",desde:5,hasta:12},{tipo:"zona",pts:PUERTA_UV,color:"vigila",etiqueta:"Acceso",desde:12}]});

  /* ---------------------------------------- CIERRE DE PUERTA ---------------------------------------- */
  var CIERRE=/*DATA:cierre*/[{"id":2,"ap":2.1,"des":10.1,"r":[[2.1,0.27,-4.61],[2.6,0.32,-3.63],[4.6,0.3,-2.97],[9.1,0.63,-2.2],[9.6,0.42,-0.57],[10.1,0.41,-0.53]],"camisa":"#51544F","pantalon":"#141D2A"},{"id":4,"ap":5.0,"des":8.0,"r":[[5.0,0.05,-2.23],[5.5,0.16,-1.97],[7.0,0.2,-1.73],[8.0,0.42,-1.56]],"camisa":"#292C41","pantalon":"#272A31"},{"id":6,"ap":6.2,"des":11.2,"r":[[6.2,-0.49,-8.51],[6.7,-0.29,-6.52],[10.2,-0.29,-6.52],[11.2,0.13,-6.39]],"camisa":"#151A26","pantalon":"#101625"}]/*FIN*/;
  S.redef({id:"cierre",grupo:1,nombre:"Cierre de puerta sin autorización",corta:"Avisa si la puerta se cierra en horario comercial.",hora:40140,
    desc:"Dentro del horario de atención la puerta debe quedar abierta. Si se cierra y nadie lo autorizó, cuenta cuánto lleva cerrada, muestra quién pasó por última vez y avisa.",
    dur:18,camara:{pos:[G326.ox+2.6,3.6,G326.oz+1.4],mira:[G326.ox-0.2,0.9,G326.oz-3.4]},
    fases:[[0,"ok","Horario de atención: la puerta de acceso se abre y la gente entra"],[8,"detecta","Entra el último y la puerta empieza a cerrarse"],[12.6,"alerta","Puerta cerrada en horario de atención, sin autorización: aviso al supervisor"]],
    armar:function(K){var cs=G326;K.camara(cs.pos,cs.mira,{id:"CAM ACCESO",fov:cs.F});var E=escaleraG326(K,cs),pu=E.puerta;
      var zp=[E.en(-0.05,0.1),E.en(E.Wd+0.05,0.1),E.en(E.Wd+0.05,-0.9),E.en(-0.05,-0.9)],Z=K.zona(zp,{estado:"ok"}),et=K.etiqueta("Puerta de acceso","ok",function(){var c=E.en(E.Wd/2,0);return new THREE.Vector3(c[0],2.4,c[1])});
      var L=actores(K,CIERRE,cs),R=L.map(function(p){return K.recuadro(p,{texto:"persona"})});var e=reloj();
      return function(t){visibles(L,t);var k=t<0.1?0:(t<3?suave(t/3):(t<8?1:(t<12.6?1-suave((t-8)/4.6):0)));pu.userData.abrir(k);var al=t>=12.6,mins=Math.max(0,t-12.6)*36;
        Z.set(al?"alerta":(t>=8?"detecta":"ok"),al);et.set(al?"Puerta cerrada · horario":"Puerta de acceso",al?"rojo":(t>=8?"ambar":"ok"));
        K.contador("Estado de la puerta",k>0.04?"abierta":"cerrada");K.contador("Horario de atención","07:00 – 19:00");K.contador("Cerrada hace",al?Math.floor(mins/60)+" min "+String(Math.floor(mins%60)).padStart(2,"0")+" s":"—");
        e(t,8,"c",function(){K.evento("La puerta empieza a cerrarse · 11:09","detecta")});e(t,12.6,"a",function(){K.evento("Cierre sin autorización en horario · aviso al supervisor","alerta")})}}});
  S.video("cierre",{src:"evidencia-publica/operativo/cierre.mp4",poster:"evidencia-publica/operativo/cierre-poster.jpg",chapa:"CCTV real · detector real",
    fuente:"MEVA, cámara G326, 2018-03-07 11:05, s 254–272",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:12.6,
    marcas:[{tipo:"zona",pts:PUERTA_UV,color:"ok",etiqueta:"Puerta de acceso",hasta:8},{tipo:"zona",pts:PUERTA_UV,color:"detecta",etiqueta:"Puerta de acceso",desde:8,hasta:12.6},{tipo:"zona",pts:PUERTA_UV,color:"alerta",etiqueta:"Puerta cerrada · horario",desde:12.6}]});

  /* =====================================================================================================
     ENTRADA G506 · edificio de la terminal de buses (MEVA): apertura de la puerta
     ===================================================================================================== */
  var G506=camCal(/*CAL:G506*/{H:3.57,p:18.3,F:35.2,ox:0,oz:12}/*FIN*/);
  function entradaG506(K,cs){var P=function(x,y,h){return cs.piso(x,y,h||0)};
    var lamina=K.std(0x737A82,{roughness:0.7,metalness:0.2}),piedra=K.std(0xB9AE98,{roughness:0.95}),conc=K.std(0xC9C6BE,{roughness:0.9}),blanco=K.std(0xF2F2F0,{roughness:0.6}),
      vidrio=K.std(0x1C232B,{roughness:0.15,metalness:0.3}),marco=K.std(0xC7CCD1,{roughness:0.4,metalness:0.6});
    K.piso(80,80,K.mat.asfalto,3);
    /* fachada (lámina corrugada sobre zócalo de piedra) */
    var A=P(330,392),B=P(1452,332),u=[(B[0]-A[0])/largo(A,B),(B[1]-A[1])/largo(A,B)],n=[u[1],-u[0]],ry=-Math.atan2(u[1],u[0]);
    function en(k,m){return[A[0]+u[0]*k+n[0]*(m||0),A[1]+u[1]*k+n[1]*(m||0)]}
    var L=largo(A,B),A2=en(-0.6),B2=en(L+0.4);K.muro(A2[0],A2[1],B2[0],B2[1],4.6,lamina,0.25);tabla(K,en(-0.6,-0.14),en(L+0.4,-0.14),0,0.75,0.05,piedra);
    var lado=[A2[0]+n[0]*8,A2[1]+n[1]*8];K.muro(A2[0],A2[1],lado[0],lado[1],4.6,lamina,0.25);
    /* puerta doble de vidrio oscuro con marco de aluminio */
    var d0=P(778,440),d1=P(1003,436),kd=((d0[0]+d1[0])/2-A[0])*u[0]+((d0[1]+d1[1])/2-A[1])*u[1];tabla(K,d0,d1,2.2,0.12,0.08,marco);[d0,d1].forEach(function(q){K.caja(q[0],0,q[1],0.08,2.3,0.08,marco,ry)});tabla(K,d0,d1,2.3,1.6,0.06,lamina);
    var hojas=[0,1].map(function(i){var piv=i?d1:d0,g=K.grupo(piv[0],piv[1],-ry/RAD+(i?180:0));var h=new THREE.Group();g.add(h);K.caja(0.43,0.04,0,0.84,2.12,0.05,vidrio,h);K.caja(0.43,0.04,-0.03,0.88,0.06,0.04,marco,h);K.caja(0.75,1.0,-0.05,0.03,0.3,0.03,marco,h);return h});
    var ven=en(kd+3.6,-0.13);K.caja(ven[0],1.0,ven[1],0.95,1.35,0.06,vidrio,ry);
    /* aleros, columnas blancas y pilares de piedra */
    [[790,555],[1110,525],[780,1040],[1390,915]].forEach(function(q,i){var c=P(q[0],q[1]);K.caja(c[0],0,c[1],0.8,i<2?1.0:1.1,0.8,piedra,ry);K.cil(c[0],1.0,c[1],0.11,0.11,3.4,blanco)});
    var a1=P(790,555),a2=P(1390,915),a3=P(780,1040);var ce=medio(a1,a2);
    
    /* andén de concreto y bancas */
    var w0=P(640,1072),w1=P(1700,1072),w2=P(1230,470),w3=P(700,560);var cw=medio(medio(w0,w1),medio(w2,w3));K.caja(cw[0],0,cw[1],largo(w0,w1)+0.5,0.06,largo(medio(w0,w1),medio(w2,w3))+0.8,conc,ry);
    var s0=P(140,600),s1=P(1680,430);var cs2=medio(s0,s1);K.caja(cs2[0],0,cs2[1],largo(s0,s1),0.05,3.0,conc,ry);
    function banca(q){var c=P(q[0],q[1]);var g=K.grupo(c[0],c[1],-ry/RAD);K.caja(0,0.42,0,1.9,0.05,0.45,blanco,g);K.caja(0,0.62,-0.2,1.9,0.28,0.04,blanco,g);[-0.8,0.8].forEach(function(x){K.caja(x,0,0,0.05,0.42,0.42,marco,g)})}
    banca([490,505]);banca([1285,430]);
    /* zona de pasto y autos estacionados al fondo */
    var gr=P(150,300);K.caja(gr[0]-8,0.01,gr[1]-10,20,0.02,26,K.mat.pasto?K.std(0x6F7F4A,{roughness:1}):K.std(0x6F7F4A),0);
    [[1520,205,0xE8EAEC],[1660,195,0x1F2226],[1530,85,0x3A3D42],[1860,95,0xF2F2F0]].forEach(function(q){var c=P(q[0],q[1]);if(!c)return;var a=K.auto(q[2],{});a.position.set(c[0],0,c[1]);a.rotation.y=Math.PI*0.95});
    sinObstaculos();return{hojas:hojas,en:en,kd:kd}}

  /* ---------------------------------------- APERTURA DE TIENDA ---------------------------------------- */
  var APERT=/*DATA:apertura*/[{"id":2,"ap":0.0,"des":7.0,"r":[[0.0,-5.36,-13.14],[1.5,-5.41,-13.33],[5.5,-5.37,-13.47],[6.5,-5.34,-13.41],[7.0,-5.35,-13.44]],"camisa":"#191826","pantalon":"#84827E"},{"id":6,"ap":1.9,"des":13.9,"r":[[1.9,5.97,-19.51],[2.4,5.96,-18.8],[2.9,5.95,-18.25],[3.9,5.77,-16.79],[4.4,5.8,-16.02],[4.9,5.93,-15.63],[5.4,5.98,-15.32],[5.9,5.96,-14.79],[6.9,6.15,-14.1],[7.4,6.04,-13.29],[7.9,6.17,-12.97],[8.4,6.21,-12.56],[8.9,6.1,-12.04],[9.4,5.94,-11.7],[9.9,5.84,-11.59],[10.4,5.38,-10.96],[10.9,5.08,-11.03],[11.4,4.78,-11.24],[13.4,4.65,-11.34],[13.9,4.43,-11.37]],"camisa":"#0E0E18","pantalon":"#625E5F"},{"id":8,"ap":2.8,"des":15.8,"r":[[2.8,16.79,-37.1],[3.8,16.15,-35.4],[4.3,15.41,-33.48],[4.8,14.77,-31.88],[6.3,13.43,-28.61],[7.8,12.55,-26.01],[8.3,12.15,-25.02],[11.8,9.88,-19.39],[12.8,8.94,-18.21],[13.3,8.6,-18.0],[13.8,8.37,-17.99],[14.3,8.24,-18.09],[15.8,8.25,-18.14]],"camisa":"#6B6E6B","pantalon":"#97939D"},{"id":4,"ap":3.1,"des":14.1,"r":[[3.1,0.85,-5.0],[3.6,0.81,-5.1],[4.1,0.76,-5.32],[5.6,0.42,-6.47],[6.1,0.29,-7.03],[6.6,0.18,-7.41],[7.6,-0.05,-8.5],[9.1,-0.14,-8.9],[9.6,-0.21,-9.4],[10.1,-0.27,-9.66],[10.6,-0.3,-9.74],[11.6,-0.35,-10.34],[12.1,-0.39,-10.46],[13.1,-0.52,-11.22],[13.6,-0.54,-11.32],[14.1,-0.59,-11.42]],"camisa":"#544336","pantalon":"#1C1E25"},{"id":13,"ap":4.5,"des":6.5,"r":[[4.5,17.37,-59.95],[5.0,17.47,-59.76],[5.5,17.5,-59.44],[6.0,17.61,-59.22],[6.5,17.75,-59.04]],"camisa":"#7D858A","pantalon":"#5B5F65"},{"id":15,"ap":5.2,"des":8.2,"r":[[5.2,1.5,-6.47],[6.2,1.21,-6.1],[6.7,0.94,-6.07],[7.2,0.67,-6.08],[7.7,0.49,-5.98],[8.2,0.39,-6.12]],"camisa":"#3B3B3F","pantalon":"#6A6A62"},{"id":14,"ap":6.0,"des":13.5,"r":[[6.0,7.51,-19.85],[7.0,7.8,-20.08],[7.5,7.99,-20.05],[8.0,8.64,-20.69],[9.0,8.8,-20.4],[10.0,8.94,-19.92],[10.5,8.99,-19.89],[11.0,8.94,-19.72],[13.0,8.7,-19.36],[13.5,8.66,-19.34]],"camisa":"#343339","pantalon":"#6C7E95"},{"id":24,"ap":11.5,"des":16.0,"r":[[11.5,6.0,-19.54],[12.0,6.03,-19.23],[12.5,6.02,-18.86],[14.5,5.96,-16.56],[15.0,5.99,-16.17],[16.0,6.0,-15.77]],"camisa":"#584E57","pantalon":"#494853"}]/*FIN*/;
  var PUERTA506_PX=[[760,445],[1015,438],[1050,520],[735,535]];
  S.redef({id:"apertura",grupo:1,nombre:"Apertura de tienda",corta:"Registra a qué hora abre cada local y si fue puntual.",hora:25075,
    desc:"La cámara de la entrada sabe si la puerta está cerrada o abierta y a qué hora cambia. Cada mañana registra la hora real de apertura, la compara con la meta del local y guarda el video del momento; si a la hora pactada sigue cerrada, avisa.",
    dur:16,camara:{pos:[G506.ox+9,9,G506.oz-1],mira:[G506.ox+1,0.8,G506.oz-12]},
    fases:[[0,"vigila","06:55 · puerta cerrada; la meta de apertura es 07:00"],[6,"detecta","Llega el encargado a la puerta"],[10.1,"ok","Abre la puerta: apertura registrada a las 06:58, puntual"],[12,"ok","Entran las primeras personas: el local opera"]],
    armar:function(K){var cs=G506;K.camara(cs.pos,cs.mira,{id:"CAM ENTRADA",fov:cs.F});var E=entradaG506(K,cs);
      var zp=zonaPx(cs,PUERTA506_PX),Z=K.zona(zp,{estado:"vigila"}),et=K.etiqueta("Puerta principal","",function(){var c=medio(zp[0],zp[1]);return new THREE.Vector3(c[0],2.6,c[1])});
      var L=actores(K,APERT,cs),R=L.map(function(p){return K.recuadro(p,{texto:p.dato.id===4?"persona":"persona"})});var e=reloj();
      return function(t){visibles(L,t);var a=t<10.1?0:Math.min(1,(t-10.1)/0.8)*(t<14.5?1:Math.max(0.0,1-(t-14.5)/1.2));E.hojas[0].rotation.y=-suave(a)*1.4;E.hojas[1].rotation.y=suave(a)*0.15;
        L.forEach(function(p,i){if(p.dato.id===4)R[i].set(t>6?"ok":"vigila",t>6?"encargado":"persona")});
        Z.set(t>=10.1?"ok":(t>6?"detecta":"vigila"),false);et.set(t>=10.1?"Puerta principal · abierta":"Puerta principal · cerrada",t>=10.1?"ok":(t>6?"ambar":""));
        e(t,6,"l",function(){K.evento("Encargado en la puerta · 06:58","detecta")});e(t,10.1,"a",function(){K.evento("Apertura registrada · 06:58 · meta 07:00 · puntual","ok")});
        K.contador("Estado de la puerta",t>=10.1?"abierta":"cerrada");K.contador("Hora de apertura",t>=10.1?"06:58":"—");K.contador("Meta","07:00");K.contador("Puntualidad del mes",t>=10.1?"24 de 25 días":"23 de 24 días")}}});
  S.video("apertura",{src:"evidencia-publica/operativo/apertura.mp4",poster:"evidencia-publica/operativo/apertura-poster.jpg",chapa:"CCTV real · detector real",
    fuente:"MEVA, cámara G506 (entrada de la terminal), 2018-03-07 17:00, s 26–42; la hora del rótulo es la del ejemplo, no la del video",autor:"Kitware / IARPA DIVA",url:"https://mevadata.org",licencia:"CC BY 4.0",evento:10.1,
    marcas:[{tipo:"zona",pts:marcaPx(G506,PUERTA506_PX),color:"vigila",etiqueta:"Puerta principal",hasta:6},{tipo:"zona",pts:marcaPx(G506,PUERTA506_PX),color:"detecta",etiqueta:"Puerta principal",desde:6,hasta:10.1},{tipo:"zona",pts:marcaPx(G506,PUERTA506_PX),color:"ok",etiqueta:"Puerta principal",desde:10.1}]});

  /* =====================================================================================================
     PLACAS · salida de parqueadero de clientes (Pexels 37508953): cámara frontal a la altura del auto
     ===================================================================================================== */
  S.redef({id:"placas",grupo:1,nombre:"Lectura de placas y parqueo",corta:"Placa, tipo, color, cajón y tiempo de cada vehículo.",
    desc:"Lee la placa de cada vehículo en la entrada o salida del parqueadero y lo registra con su tipo y color. Si algo lo tapa un momento —una moto, un peatón, otro auto que cruza—, el vehículo sigue en el registro: no se pierde ni se cuenta dos veces.",
    dur:11.5,camara:{pos:[4.5,3.2,9.5],mira:[-1.3,1.0,0.5]},
    fases:[[0,"vigila","Cámara de la salida del parqueadero: ve el carro y su placa"],[1,"detecta","Lee la placa: BGY 888 · gris · carro"],[4,"vigila","Pasan una moto y un peatón: cada uno con su recuadro, la placa se mantiene"],[6.6,"detecta","Un auto cruza delante y lo tapa: el registro no se pierde"],[10.2,"ok","El carro sale: BGY 888 registrado una sola vez"]],
    armar:function(K){K.camara([-1.2,1.3,6.0],[-1.2,1.44,0],{id:"CAM SALIDA PARQUEADERO",fov:38});
      var ladr=K.std(0x8C8276,{roughness:0.95}),crema=K.std(0xE9E2D3,{roughness:0.9}),osc=K.std(0x15171A,{roughness:1}),gris=K.std(0x5B6068,{roughness:0.6}),blanco=K.std(0xEDEDE8,{roughness:0.7});
      K.piso(40,30,K.mat.asfalto,3);K.caja(-1.2,0,-0.6,30,0.01,1.6,K.std(0x8B8C88,{roughness:1}));K.caja(4,0,2.5,8,0.12,3,K.std(0x9C9A92,{roughness:1}));
      /* fachada de ladrillo con el hueco del garaje */
      K.caja(-6.3,0,0,6.4,6,0.4,ladr);K.caja(1.9,0,0,1.8,6,0.4,ladr);K.caja(-1.45,2.75,0,4.3,3.3,0.4,ladr);K.caja(-1.45,0,-3,4.3,2.75,0.1,osc);K.caja(-1.45,0,-1.5,4.3,0.02,3,K.std(0x3A3C40));
      K.caja(-3.65,0,-1.5,0.1,2.75,3,osc);K.caja(0.75,0,-1.5,0.1,2.75,3,osc);
      /* letrero Netto · P · KUNDENPARKPLÄTZE */
      K.caja(-1.35,2.78,0.22,4.6,0.42,0.06,K.std(0x55606E,{roughness:0.6}));K.cartel(-2.75,2.99,0.27,0.75,0.33,"Netto","#F2C230","#C8342B",0);K.cartel(-2.08,2.99,0.27,0.34,0.34,"P","#3B6FB0","#ffffff",0);K.cartel(-0.65,2.99,0.27,2.4,0.3,"KUNDENPARKPLÄTZE","#55606E","#ffffff",0);
      /* dos condensadoras en el dintel */
      [-1.25,-0.25].forEach(function(x){K.caja(x,1.85,-0.15,0.98,0.72,0.5,K.std(0xD9D6CF,{roughness:0.6}));var f=K.cil(x,2.21,0.11,0.29,0.29,0.03,osc);f.rotation.x=Math.PI/2;f.position.set(x,2.21,0.11)});
      K.caja(-1.45,1.72,0.05,4.3,0.05,0.05,gris);
      /* edificio crema a la derecha con su vitrina «2» y la vitrina de la izquierda */
      K.caja(3.6,0,0.3,3.6,6,0.4,crema);K.caja(3.0,0.8,0.52,1.1,1.6,0.04,K.std(0x2B3442,{roughness:0.2}));K.cartel(3.4,1.55,0.56,0.35,0.5,"2","#2B3442","#ffffff",0);
      K.caja(-5.6,0.4,0.22,1.2,1.9,0.04,K.std(0x2B3442,{roughness:0.2}));K.cartel(-5.55,2.5,0.24,0.9,0.4,"Genthiner Straße 40","#3A3D42","#E8E8E0",0);K.caja(-4.6,0.6,0.24,0.55,0.7,0.03,blanco);
      [1.6,2.3].forEach(function(x){K.bolardo(x,1.5)});
      /* el carro de la placa */
      var car=K.auto(0x5E646B,{placa:"B GY 888",tipo:"sedan"});car.position.set(-2.28,0,-0.3);car.rotation.y=0;car.userData.obst=false;
      var Rc=K.recuadro({raiz:car,visible:true,alto:1,rot:0},{texto:"carro",w:1.9,h:1.45,d:4.4,estado:"vigila"});Rc.fijo=[-2.28,0,-0.3];
      /* moto con piloto que entra por la izquierda */
      var mo=U.moto(K,0xA0262E,"",true);mo.rotation.y=Math.PI/2;var Rm=K.recuadro({raiz:mo,visible:true,alto:1,rot:0},{texto:"moto",w:0.8,h:1.7,d:2.1,estado:"vigila"});
      /* peatón que cruza por el hueco del garaje, de derecha a izquierda */
      var pe=K.persona({escala:0.97,evita:false,ropa:{camisa:0x22252B,pantalon:0x3A4E78,zapatos:0x1C1E22},ruta:[[0,3.4,0.75],[3.5,3.4,0.75],[6.3,0.6,0.35],[7.4,-0.6,-0.6],[9.5,-2.2,-1.6],[12,-2.4,-2.6]]});var Rp=K.recuadro(pe,{texto:"persona"});
      /* auto oscuro que cruza rápido por delante */
      var cr=K.auto(0x1E2024,{tipo:"suv"});cr.userData.obst=false;cr.rotation.y=-Math.PI/2;var Rx=K.recuadro({raiz:cr,visible:true,alto:1,rot:0},{texto:"carro",w:2,h:1.7,d:4.6,estado:"vigila"});
      var e=reloj();
      return function(t){var zc=t<10.2?-0.3:lerp(-0.3,0.6,suave((t-10.2)/1.3));car.position.z=zc;Rc.fijo=[-2.28,0,zc];
        var leida=(t>=1&&t<12);Rc.set(leida?(t>=10.2?"ok":"detecta"):"vigila",leida?"carro · PLACA BGY888":"carro");Rc.ocultar(t>6.7&&t<7.6);
        var xm=t<0.8?-6.5:(t<4.2?lerp(-6.5,-3.9,suave((t-0.8)/3.4)):(t<6?-3.9:lerp(-3.9,-6.8,suave((t-6)/2))));mo.position.set(xm,0,1.0);mo.visible=t>0.8&&t<8.2;Rm.visible=mo.visible;Rm.fijo=[xm,0,1.0];Rm.l.rotation.y=Math.PI/2;
        pe.visible=t>3.6&&t<9.6;var xa=lerp(9,-12,(t-6.55)/1.1);cr.position.set(xa,0,3.0);cr.visible=t>6.5&&t<7.7;Rx.visible=cr.visible;Rx.fijo=[xa,0,3.0];Rx.l.rotation.y=-Math.PI/2;
        var fila=[{c:["BGY 888","carro","gris",t>=10.2?"salida":"en salida",t<1?"—":"leída"],cls:t>=1&&t<2.5?"nuevo":""}];K.tabla("Registro de placas",["Placa","Tipo","Color","Estado","Lectura"],fila);
        K.contador("Lecturas de la placa",String(t<1?0:(t<3?1:(t<6?2:(t<8?3:4)))));K.contador("Vehículos registrados",t<1?"0":"1");
        e(t,1,"a",function(){K.evento("Placa leída · BGY 888 · gris · carro","")});e(t,6.7,"b",function(){K.evento("Auto cruza delante · BGY 888 se mantiene","detecta")});e(t,10.2,"c",function(){K.evento("BGY 888 sale · registrado una vez","")})}}});
  S.video("placas",{src:"evidencia-publica/operativo/placas.mp4",poster:"evidencia-publica/operativo/placas-poster.jpg",chapa:"video público · modelo real",
    fuente:"Pexels, video 37508953 (salida de parqueadero, Berlín); detecciones de lpr_v2 (YOLOv9-t + CCT-S) quemadas",autor:"Pexels (autor del video 37508953)",url:"https://www.pexels.com/video/37508953/",licencia:"Pexels License",evento:1,
    marcas:[{tipo:"zona",pts:[[0.11,0.5],[0.44,0.5],[0.44,0.92],[0.11,0.92]],color:"detecta",etiqueta:"carro · PLACA BGY888",desde:1,hasta:10.2},{tipo:"zona",pts:[[0.11,0.5],[0.44,0.5],[0.44,0.92],[0.11,0.92]],color:"ok",etiqueta:"carro · PLACA BGY888",desde:10.2}]});

  /* =====================================================================================================
     DERRAMES · pasillo de supermercado: el video es generado con IA a partir de este mismo 3D (cuadro inicial)
     ===================================================================================================== */
  var DER=/*CAL:DER*/{dur:15,cae:4.5,aviso:8,llega:9.8,limpia0:10.2,limpia1:12.6,fin:13.2}/*FIN*/;
  S.redef({id:"derrames",grupo:1,nombre:"Detección de derrames",corta:"Avisa cuando el piso deja de estar limpio.",estado:"en validación",
    desc:"Cada cámara aprende cómo se ve su piso limpio. Si aparece un derrame, una mancha o basura y sigue ahí, avisa con el tipo y la ubicación; cuando lo limpian, el evento se cierra solo.",
    dur:DER.dur,camara:{pos:[4.8,4.4,7.5],mira:[0,0.4,0]},
    fases:[[0,"vigila","El piso limpio del pasillo es la referencia"],[DER.cae,"detecta","Se cae un envase y aparece un charco: empieza la espera"],[DER.aviso,"alerta","Sigue ahí: aviso de derrame con su foto y ubicación"],[DER.limpia1,"ok","Lo limpian y el evento se cierra solo"]],
    armar:function(K){K.camara([0,1.9,4.0],[0,1.9-5.77,-6.0],{id:"CAM PASILLO 2",fov:70});
      K.piso(14,24,K.pbr("tiles",{color:0xF1F1EE,roughness:0.55,env:0.9}),0.6);K.muro(-5,-12,5,-12,3.2,K.std(0xE8E6E0));K.muro(-5,-12,-5,8,3.2,K.std(0xE8E6E0));K.muro(5,-12,5,8,3.2,K.std(0xE8E6E0));
      K.caja(0,2.4,-11.9,10,0.6,0.03,K.std(0x5FB7E0,{emissive:0x5FB7E0,emissiveIntensity:0.4}));K.cartel(0,2.5,-11.85,1.6,0.35,"PASILLO 2 · BEBIDAS","#1E3A6E","#ffffff",0);
      K.gondola(-1.3,-3.5,15,90,{niveles:6,alto:2.1,familias:["botellas","botellas","latas","botellas","cajas"],letrero:"JUGOS"});K.gondola(1.3,-3.5,15,90,{niveles:6,alto:2.1,familias:["cajas","bolsas","botellas","latas","cajas"],letrero:"ABARROTES"});
      K.lampara(0,3.0,0);K.lampara(0,3.0,-5);
      var ch=K.add(new THREE.Mesh(new THREE.CircleGeometry(1,40),K.std(0x1E8FD0,{transparent:true,opacity:0.85,roughness:0.03,metalness:0.2})));ch.rotation.x=-Math.PI/2;ch.position.set(-0.25,0.012,2.3);ch.scale.set(0.01,0.01,0.01);ch.castShadow=false;
      var env=K.prodBotella(0.045,0.3,0x2F8FC8);env.position.set(-0.25,1.0,2.3);
      var sinG=/sinGente/.test(location.search);
      var cl=K.persona({escala:0.97,evita:false,ropa:{camisa:0x3F6FB5,pantalon:0x2B3447,zapatos:0x1C1E22},ruta:sinG?[[0,30,30]]:[[0,0.1,-11],[1.6,0.1,-6.5],[3,0.05,-0.8],[DER.cae,-0.05,1.9],[DER.cae+0.5,0.15,2.6],[DER.cae+2.2,0.45,5.2],[DER.dur,0.5,7]]});
      var li=K.persona({escala:1.0,evita:false,color:STAFF,ropa:{camisa:STAFF,pantalon:0x1E2433,zapatos:0x1C1E22,gorra:STAFF},ruta:sinG?[[0,30,30]]:[[0,0.2,-11],[DER.llega-1.2,0.2,-10],[DER.llega,0.15,1.5],[DER.limpia0,0.2,1.6,"idle",-0.25,2.3],[DER.limpia1,0.0,1.7,"idle",-0.25,2.3],[DER.fin,0.0,1.4],[DER.dur,0.2,-9]]});
      var trap=new THREE.Group();K.add(trap);K.cil(0,0,0,0.015,0.015,1.3,K.mat.aceroOsc,trap);K.caja(0,0,0,0.4,0.04,0.08,K.std(0x8A929E),trap);K.caja(0,-0.06,0,0.42,0.06,0.1,K.std(0xB9BCC2,{roughness:1}),trap);trap.visible=false;
      li.post=function(t){var a=U.ventana(t,DER.limpia0-0.4,DER.limpia1+0.2,0.5,0.5);if(a>0){K.ik(li,"Right",K.local(li,-0.15,0.95,0.55),a);K.ik(li,"Left",K.local(li,0.2,1.05,0.4),a)}};
      var R=K.recuadro({raiz:ch,visible:true,alto:0.1,rot:0},{texto:"derrame",w:1.3,h:0.06,d:1.0,estado:"detecta"});R.visible=false;var Rc=K.recuadro(cl,{texto:"persona"}),Rl=K.recuadro(li,{texto:"personal"});
      var et=K.etiqueta("Derrame · pasillo 2","rojo",function(){return R.visible?new THREE.Vector3(-0.25,0.5,2.3):null});var e=reloj();
      return function(t){cl.visible=!sinG&&t<DER.cae+3.6;li.visible=!sinG&&t>DER.llega-1.4;
        if(t<DER.cae){var hp=K.manoPos(cl,"Right");env.position.set(hp.x,hp.y-0.05,hp.z);env.rotation.z=0}else{env.position.set(-0.55,lerp(0.9,0.04,(t-DER.cae)/0.35),2.2);env.rotation.z=t>DER.cae+0.2?1.45:0}
        env.visible=!sinG&&t<DER.limpia1;var k=suave((t-DER.cae-0.1)/1.4),sale=t>DER.limpia0?Math.max(0,1-(t-DER.limpia0)/(DER.limpia1-DER.limpia0)):1;ch.scale.setScalar(Math.max(0.01,0.55*k*sale));
        trap.visible=li.visible&&t>DER.llega-0.6&&t<DER.fin+1.6;if(trap.visible){var hp2=K.manoPos(li,"Right");trap.position.set(hp2.x,0.06,hp2.z+0.25);trap.rotation.y=li.rot}
        R.fijo=[-0.25,0.01,2.3];R.visible=!sinG&&t>DER.cae+0.3&&t<DER.limpia1;R.l.visible=R.visible;R.set(t>DER.aviso?"alerta":"detecta",t>DER.aviso?"derrame · 45 s":"evaluando");Rl.set("staff","personal");
        e(t,DER.aviso,"a",function(){K.evento("Derrame en pasillo 2 · aviso con foto","alerta")});e(t,DER.limpia1,"b",function(){K.evento("Pasillo 2 limpio · evento cerrado","")});
        K.contador("Piso del pasillo 2",t<DER.cae?"limpio":(t<DER.limpia1?"derrame":"limpio"));K.contador("Tiempo sin incidencias hoy","97 %")}}});
  S.video("derrames",{src:"evidencia-publica/operativo/derrames.mp4",poster:"evidencia-publica/operativo/derrames-poster.jpg",chapa:"video generado con IA · referencia",ia:true,
    fuente:"Generado con IA (ElevenLabs · Seedance 2.5, texto a video); el 3D se ajustó a su cámara y a sus tiempos",autor:"ARS · generación propia",url:"",licencia:"uso propio",evento:8,
    marcas:[{tipo:"zona",pts:[[0.27,0.6],[0.62,0.6],[0.62,0.92],[0.27,0.92]],color:"detecta",etiqueta:"Derrame · pasillo 2",desde:4.8,hasta:8},{tipo:"zona",pts:[[0.27,0.6],[0.62,0.6],[0.62,0.92],[0.27,0.92]],color:"alerta",etiqueta:"Derrame · pasillo 2",desde:8,hasta:12.6}]});
})();
