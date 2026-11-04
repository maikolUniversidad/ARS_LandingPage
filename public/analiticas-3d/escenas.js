/* ---------- Las escenas del portafolio · parte 1: ayudas, sets y familias 1 y 2 (21-oct-2026) ----------
   Cada una: el set (tienda, bodega, parqueadero, exterior, oficina), quién se mueve y qué hace, y lo que dibuja la analítica.
   fases: [segundo, estado, texto] → mueven la pastilla de estado y los pasos de la lámina.
   Las rutas se escriben como siempre; el motor rodea los muebles por su cuenta. */
(function(){
  "use strict";
  var C=window.MOTOR.COL,ES=[];window.ESCENAS=ES;
  function def(o){ES.push(o);return o}
  function reloj(){var h={};return function(t,t0,id,fn){if(t>=t0&&!h[id]){h[id]=1;fn()}}}
  function lerp(a,b,k){return a+(b-a)*Math.max(0,Math.min(1,k))}
  function suave(k){k=Math.max(0,Math.min(1,k));return k*k*(3-2*k)}
  var ROPA=[0x3F6FB5,0xB5543F,0x3E8E5A,0x7A5CB0,0xC8962E,0x4A5F80,0xA8445A,0x2E8A9E,0x8A6A48];
  var STAFF=0xD9442E; // uniforme rojo
  function uniforme(o){if(o.color===STAFF&&!o.ropa)o.ropa={camisa:STAFF,pantalon:0x1E2433,zapatos:0x1C1E22,gorra:STAFF};return o}
  function persona(K,o){return K.persona(uniforme(o))}
  function gente(K,lista){return lista.map(function(r,i){return persona(K,{color:r.c!=null?r.c:ROPA[i%ROPA.length],ruta:r.ruta,escala:r.s,rot:r.rot,ropa:r.ropa})})}

  var ROJO_FRANQ=0xE30613,AMARILLO_FRANQ=0xFFD100;
  function franq(K,o){o=o||{};var w=o.w||16,d=o.d||11;K.piso(w,d,K.pbr("tiles",{roughness:0.7,env:0.9,color:0xF4F4F2}));
    var rojo=K.std(ROJO_FRANQ,{roughness:0.55}),amar=K.std(AMARILLO_FRANQ,{roughness:0.5}),blanco=K.std(0xF4F4F2,{roughness:0.85}),gris=K.std(0xB9BEC8,{roughness:0.8}),vino=K.std(0x7B1F4F,{roughness:0.7});
    K.muro(-w/2,-d/2,w/2,-d/2,2.8,blanco);K.muro(-w/2,-d/2,-w/2,d/2,2.8,blanco);K.muro(w/2,-d/2,w/2,d/2,2.8,blanco);
    K.techoRejilla(w,d,2.8);
    K.caja(0,2.05,-d/2+0.09,w,0.6,0.03,vino);K.caja(0,0,-d/2+0.09,w,0.12,0.03,gris);K.caja(-w/2+0.09,0,0,0.03,0.12,d,gris);K.caja(w/2-0.09,0,0,0.03,0.12,d,gris);
    [["S/ 14.99","Combo Almuerzos + gaseosa 300 ml"],["S/ 1.90","4 panes horneados"],["S/ 5.90","2 empanadas pollo o carne"],["S/ 2.50","Café del día + pan"]].forEach(function(a,i){K.afichePrecio(-6.0+i*2.2,2.35,-d/2+0.12,1.5,0.5,a[0],a[1],0)});
    K.imagen("marca/franq.png",4.8,2.35,-d/2+0.12,1.2,0.6,0);K.cartel(6.4,2.35,-d/2+0.12,1.6,0.3,"","#7B1F4F","#FFD100",0);
    var M=[{marca:"TU ALMUERZO",fondo:"#7B1F4F",bot:[0xF4F4F2],comida:true},{marca:"BEBIDAS",fondo:"#C8342B",bot:[0xC8342B,0x2F64C8,0xF2C230]},{marca:"AGUAS",fondo:"#2F64C8",bot:[0x9CD3F5,0x6FB7E8,0xE8F4FB]},{marca:"JUGOS",fondo:"#E0782A",bot:[0xF2A23A,0xD94F3D,0x8CC152]},{marca:"CERVEZAS",fondo:"#3E8E5A",bot:[0xD9A63A,0x8A6A48,0x2E6A4A]},{marca:"LÁCTEOS",fondo:"#1E3A6E",bot:[0xF4F4F2,0xEDE3CF,0xC9E2F0]},{marca:"ENERGÉTICAS",fondo:"#1C1E22",bot:[0x2B3038,0x9ACD6B,0xE86AA6]},{marca:"BEBIDAS",fondo:"#C8342B",bot:[0xC8342B,0x2F64C8,0xF2C230]}];
    K._neveras=[];if(o.neveras!==false)for(var i=0;i<8;i++)K._neveras.push(K.nevera(-6.6+i*0.92,-d/2+0.48,Object.assign({marco:0xEEF0F3},M[i%M.length])));
    if(o.cafe!==false)K.estacionBarra(-w/2+0.34,-0.9,90);
    if(o.gondolas!==false){[-4.3,-2.4,-0.5,1.4,3.3].forEach(function(x,i){K.gondola(x,-1.6,4.2,90,{niveles:4,alto:1.45,familias:[["bolsas","bolsas","cajas","bolsas"],["cajas","latas","cajas","bolsas"],["bolsas","cajas","latas","cajas"],["cajas","bolsas","cajas","latas"],["cajas","cajas","bolsas","cajas"]][i],letrero:["SNACKS","GALLETAS","ABARROTES","DULCES","PANADERÍA"][i]})})}
    if(o.exhibidor!==false){K.exhibidor(-6.0,2.9,3,15);K.torreSnacks(2.3,3.6)}
    if(o.cajas!==false){var mo=K.grupo(6.3,-2.4,-90);mo.userData.obst=K.caja(0,0,0,4.4,0.95,0.7,blanco,mo);K.caja(0,0.02,0.36,4.4,0.92,0.03,rojo,mo);K.caja(0,0.62,0.37,4.4,0.08,0.02,amar,mo);K.caja(0,0.95,0,4.5,0.05,0.78,K.std(0x2B3038,{roughness:0.4}),mo);
      K.pc(-1.55,1.0,-0.15,180,mo);K.pc(0.85,1.0,-0.15,180,mo);K.caja(-1.2,1.0,0.1,0.14,0.1,0.1,K.mat.negro,mo);K.caja(1.2,1.0,0.1,0.14,0.1,0.1,K.mat.negro,mo);
      K.vitrinaCaliente(-0.3,1.0,0.0,0,mo);K.caja(1.6,1.0,-0.05,0.5,0.45,0.4,K.std(0x2B3038,{metalness:0.4,roughness:0.4}),mo);K.caja(1.6,1.1,0.17,0.16,0.08,0.06,K.mat.cromo,mo);
      for(var k=0;k<8;k++)K.caja(-2.05+k*0.14,0.97,0.28,0.11,0.07,0.12,K.std([0x2F64C8,0xC8342B,0xF2C230,0x3E8E5A][k%4],{roughness:0.5}),mo);
      K.sombra(0,0,4.6,0.9,mo);
      var tras=K.grupo(7.75,-2.4,90);tras.userData.obst=true;K.caja(0,0,0,4.4,2.1,0.35,blanco,tras);for(var n=0;n<4;n++){K.caja(0,0.35+n*0.45,0.18,4.3,0.03,0.02,K.mat.acero,tras);for(var j=0;j<17;j++)K.prodCaja(0.12,0.2,0.08,(n*5+j)%14,tras).position.set(-2.05+j*0.25,0.47+n*0.45,0.12)}
      K.caja(0,2.1,0,4.5,0.5,0.4,rojo,tras);K.cartel(0,2.35,-0.21,2.6,0.3,"CAFÉ · COMIDA CALIENTE · RECARGAS","#E30613","#FFD100",180,tras);
      K.expendedora(6.5,d/2-0.55,180);K.kioscoAmarillo(7.45,d/2-0.45,180)}
    if(o.canastas!==false)K.canastas(w/2-0.9,2.3,7);
    if(o.frente!==false){var alu=K.std(0xC4C9CF,{metalness:0.6,roughness:0.35});K.muro(-w/2,d/2,3.3,d/2,2.8,K.mat.vidrio,0.04);K.muro(5.9,d/2,w/2,d/2,2.8,K.mat.vidrio,0.04);for(var x=-w/2;x<=w/2;x+=1.6){if(x>3.2&&x<6)continue;K.caja(x,0,d/2,0.08,2.8,0.1,alu)}
      K.caja(0,0,d/2,w,0.1,0.1,alu);K.caja(0,2.75,d/2,w,0.06,0.1,alu);
      K.afichePromo(-5.7,1.5,d/2-0.03,1.1,1.5,"MARTES","2 × S/ 6.00","Helado vainilla sándwich · precio regular S/ 9.90",0);K.afichePromo(-2.5,1.5,d/2-0.03,1.1,1.5,"VIERNES","2 × S/ 5.90","Empanadas de pollo o carne",0);
      K.imagen("marca/franq.png",0.9,2.3,d/2-0.03,0.7,0.35,0);K.cartel(0.9,2.05,d/2-0.03,0.7,0.1,"","#F4F4F2","#E30613",0);
      K.caja(4.6,2.5,d/2,2.8,0.55,0.12,rojo);K.caja(4.6,2.45,d/2+0.02,2.8,0.06,0.12,amar);K.imagen("marca/franq.png",4.6,2.78,d/2+0.08,1.4,0.7,0);[3.2,6.0].forEach(function(x){K.caja(x,0,d/2,0.1,2.8,0.12,alu)});
      K.cartel(4.6,2.3,d/2+0.08,1.2,0.16,"24 HORAS","#E30613","#fff",0);
      if(o.barra!==false)K.barraVentana(-2.6,d/2-0.5,8.5,180)}
    K.lampara(-2,2.6,-1);K.lampara(4,2.6,1);K.lampara(-6,2.6,2);return{w:w,d:d}}
  function trastiendaFranq(K,o){o=o||{};var w=o.w||7,d=o.d||5;K.piso(w,d,K.pbr("concreto",{roughness:0.9,w:w,d:d}));var blanco=K.std(0xF4F4F2,{roughness:0.85}),rojo=K.std(ROJO_FRANQ,{roughness:0.55}),amar=K.std(AMARILLO_FRANQ,{roughness:0.5});
    K.muro(-w/2,-d/2,w/2,-d/2,2.8,blanco);K.muro(-w/2,-d/2,-w/2,d/2,2.8,blanco);K.muro(w/2,-d/2,w/2,d/2,2.8,blanco);
    K.caja(0,2.15,-d/2+0.09,w,0.5,0.03,rojo);K.caja(0,2.1,-d/2+0.1,w,0.06,0.03,amar);K.caja(0,0,-d/2+0.09,w,0.12,0.03,K.std(0xB9BEC8));
    K.cartel(-1.2,2.38,-d/2+0.12,2.6,0.3,"BODEGA · SOLO PERSONAL","#E30613","#FFD100",0);K.imagen("marca/franq.png",1.9,2.38,-d/2+0.12,0.9,0.45,0);
    if(o.rack!==false)K.rack(-2.6,-0.6,2.4,90,{niveles:3,alto:2.2});if(o.canastas!==false){K.canastas(2.6,-1.9,10);K.canastas(2.0,-1.9,7)}
    K.extintor(w/2-0.12,0.9,1.2,-90);K.puerta(0,d/2,1.1,0,{opaca:true});K.cartel(0,2.45,d/2-0.08,1.4,0.26,"SALA DE VENTAS","#001441","#F1F3F8",180);K.lampara(0,2.6,0);K.lampara(-2,2.6,-1);return{w:w,d:d}}
  function tienda(K,o){o=o||{};if(window.MARCA==="franq")return franq(K,o);var w=o.w||16,d=o.d||11;K.piso(w,d);K.muro(-w/2,-d/2,w/2,-d/2,2.8);K.muro(-w/2,-d/2,-w/2,d/2,2.8);
    var pint=K.std(o.pintura||0x1E3A6E,{roughness:0.9}),zoc=K.std(0xB9BEC8,{roughness:0.8});K.caja(0,2.2,-d/2+0.09,w,0.6,0.03,pint);K.caja(-w/2+0.09,2.2,0,0.03,0.6,d,pint);K.caja(0,0,-d/2+0.09,w,0.12,0.03,zoc);K.caja(-w/2+0.09,0,0,0.03,0.12,d,zoc);
    K.caja(-w/2+0.2,0,-d/2+0.2,0.4,2.8,0.4,K.std(0xD6AB4C,{roughness:0.7}));K.parche(0,d/2-1.2,w,1.6,K.std(0xCFD6E2,{roughness:0.5}),1,0.0045);
    K.afiche(-w/2+0.09,1.2,-d/2+2.6,2.6,1.6,"FRUTAS · VERDURAS",120,90);
    K.cartel(-w/2+0.1,2.3,-d/2+3,2.6,0.5,o.cartel||"MERCADO",null,null,90);K.lampara(-2,2.6,-1);
    if(o.pared!==false){K.gondola(-w/2+0.6+(w-1.2)/2*0.5-0.1,-d/2+0.52,w/2-1.4,0,{unaCara:true,familias:["botellas","cajas","latas","bolsas"]});}
    K.afiche(-w/2+0.09,1.6,2.2,1.3,1.0,"FRESCO HOY",150,90);K.afiche(-w/2+0.09,1.6,3.8,1.3,1.0,"2 × 1",28,90);K.extintor(-w/2+0.12,0.9,0.4,90);
    if(o.exhibidor!==false)K.exhibidor(-w/2+2.2,d/2-1.6,3,15);if(o.canastas!==false)K.canastas(w/2-0.7,d/2-0.6,7);
    if(o.gondolas!==false){[-4.4,-2.2,0,2.2].forEach(function(x,i){K.gondola(x,-1.6,4.2,90,{niveles:4,familias:[["cajas","bolsas","cajas","latas"],["botellas","botellas","cajas","bolsas"],["latas","cajas","bolsas","cajas"],["cajas","latas","bolsas","cajas"]][i],letrero:"PASILLO "+(i+1)})});
      if(o.cajas!==false){K.cajaRegistro(6.1,-3.3,90,{n:1});K.cajaRegistro(6.1,-0.6,90,{n:2});K.carrito(w/2-0.8,-4.6,0);K.carrito(w/2-0.8,-5.3,0)}}
    return{w:w,d:d}}
  function bodega(K,o){o=o||{};var w=o.w||16,d=o.d||11;K.piso(w,d,K.mat.concreto,3);K.muro(-w/2,-d/2,w/2,-d/2,3.6,K.mat.muro);K.muro(-w/2,-d/2,-w/2,d/2,3.6,K.mat.muro);
    var fr=K.std(0xF2C230,{roughness:0.8});K.caja(0,0,-d/2+0.09,w,0.9,0.03,K.std(0x8A929E,{roughness:0.8}));K.caja(0,0.9,-d/2+0.09,w,0.12,0.03,fr);K.caja(-w/2+0.09,0,0,0.03,0.9,d,K.std(0x8A929E,{roughness:0.8}));K.caja(-w/2+0.09,0.9,0,0.03,0.12,d,fr);
    [[-w/2+0.6,1.2,w-1.2,0.1],[-w/2+0.6,3.6,w-1.2,0.1]].forEach(function(r){K.parche(r[0]+r[2]/2,r[1],r[2],r[3],K.std(0xF2C230,{roughness:0.6}),1,0.006)});
    [-w/2+0.2,w/2-0.2].forEach(function(x){K.caja(x,0,-d/2+0.2,0.4,3.6,0.4,K.std(0xD9DCE0))});
    var pm=K.grupo(w/2-2.4,-d/2+0.1,0);K.caja(0,0,0,2.6,3.2,0.06,K.std(0x8A929E,{metalness:0.4,roughness:0.5}),pm);for(var y=0.25;y<3.1;y+=0.32)K.caja(0,y,0.03,2.6,0.03,0.02,K.std(0x5A6270),pm);K.cartel(0,3.35,0.04,1.6,0.26,"MUELLE 2","#001441","#F1F3F8",0,pm);
    K.extintor(-w/2+0.12,0.9,0.6,90);K.cartel(-w/2+0.09,2.2,2.8,1.6,0.4,"ZONA DE CARGUE","#D6AB4C","#001441",90);
    if(o.montacargas!==false)K.montacargas(-w/2+1.1,-d/2+2.6,0);if(o.estibas!==false){for(var k=0;k<4;k++){var e=K.grupo(-w/2+0.8,d/2-0.8,0);e.position.y=k*0.15;[-0.5,0,0.5].forEach(function(zz){K.caja(0,0,zz,1.2,0.1,0.1,K.mat.estiba,e)});[-0.5,0,0.5].forEach(function(xx){K.caja(xx,0.1,0,0.1,0.04,1,K.mat.estiba,e)})}}
    K.cil(w/2-0.5,0,d/2-0.5,0.03,0.2,0.55,K.std(0xF08A2E,{roughness:0.5}));return{w:w,d:d}}
  function exterior(K,o){o=o||{};var w=o.w||16,d=o.d||11;K.piso(w,d,K.mat.asfalto,3);K.parche(0,-d/2+2.2,w,4.4,K.mat.concreto,2.5,0.006);K.caja(0,0,-d/2+4.4,w,0.12,0.16,K.std(0xC9CDD4,{roughness:0.7}));
    for(var x=-w/2+1;x<w/2-0.5;x+=2.2)K.parche(x,2.6,1.2,0.1,K.std(0xF4F4F2,{roughness:0.6}),1,0.008);
    if(o.bolardos!==false)[-6,-3,0,3,6].forEach(function(x){if(Math.abs(x)<=w/2-1)K.bolardo(x,-d/2+4.0)});
    if(o.arboles!==false){K.arbol(-w/2+0.9,-d/2+1.0,0.9);K.arbol(w/2-0.9,-d/2+1.0,1.05)}if(o.postes!==false)K.poste(w/2-1.6,-d/2+3.6);return{w:w,d:d}}
  function oficina(K,o){o=o||{};var w=o.w||14,d=o.d||10;K.piso(w,d,K.mat.alfombra,1.2);K.muro(-w/2,-d/2,w/2,-d/2,2.8,K.mat.muro);K.muro(-w/2,-d/2,-w/2,d/2,2.8,K.mat.muro);
    for(var x=-w/2+1.4;x<w/2-1.5;x+=2.2){K.caja(x,1.0,-d/2+0.1,1.9,1.3,0.04,K.std(0xBFD9F0,{transparent:true,opacity:0.45,roughness:0.05,metalness:0.2}));K.caja(x,0.98,-d/2+0.08,2.0,0.05,0.06,K.std(0xD9DCE0));K.caja(x,2.3,-d/2+0.08,2.0,0.05,0.06,K.std(0xD9DCE0))}
    K.caja(-w/2+0.08,1.1,1.2,0.03,1.1,2.2,K.std(0xFBFBFA,{roughness:0.3}));K.caja(-w/2+0.1,1.05,1.2,0.04,0.04,2.3,K.mat.aceroOsc);
    K.caja(-w/2+0.5,0,-d/2+0.6,0.5,1.3,0.6,K.std(0xC7CCD4,{metalness:0.3,roughness:0.5}));var ag=K.grupo(-w/2+0.5,-d/2+1.6,0);K.caja(0,0,0,0.32,0.95,0.32,K.std(0xE9EBEE),ag);K.cil(0,0.95,0,0.14,0.14,0.42,K.std(0x9CD3F5,{transparent:true,opacity:0.5,roughness:0.1}),ag);
    K.planta(w/2-0.7,-d/2+0.7,1.2);return{w:w,d:d}}
  function arma(K){var g=new THREE.Group();var m=K.std(0x15171B,{metalness:0.5,roughness:0.35});var a=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.05,0.2),m);a.position.z=0.06;g.add(a);var b=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.11,0.05),m);b.position.set(0,-0.06,-0.02);b.rotation.x=0.3;g.add(b);var gat=new THREE.Mesh(new THREE.TorusGeometry(0.018,0.004,6,12),m);gat.position.set(0,-0.03,0.03);g.add(gat);return g}
  function cuchillo(K){var g=new THREE.Group();g.scale.setScalar(1.35);var h=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.03,0.11),K.std(0x2A1E14));g.add(h);var b=new THREE.Mesh(new THREE.BoxGeometry(0.006,0.045,0.24),K.mat.cromo);b.position.z=0.17;g.add(b);return g}
  function producto(K,c,i){return K.prodCaja(0.12,0.18,0.08,i!=null?i:((c>>8)%14))}
  function cabeza(K,P,yaw,pitch){var h=K.huesoC(P,"Head"),n=K.huesoC(P,"Neck");if(h){h.rotation.y+=yaw*0.6;h.rotation.x+=(pitch||0)*0.6}if(n){n.rotation.y+=yaw*0.4;n.rotation.x+=(pitch||0)*0.3}}
  function torso(K,P,adelante,lado){var a=K.huesoC(P,"Spine"),b=K.huesoC(P,"Spine1");if(a){a.rotation.x+=adelante*0.6;a.rotation.z+=(lado||0)*0.5}if(b){b.rotation.x+=adelante*0.4;b.rotation.z+=(lado||0)*0.3}}
  function nervioso(t){var q=Math.floor(t*1.6),f=t*1.6-q,obj=[0.9,-0.8,0.3,-1,0.7,-0.4,1,-0.6][q%8],ant=[0.9,-0.8,0.3,-1,0.7,-0.4,1,-0.6][(q+7)%8];return ant+(obj-ant)*Math.min(1,f*4)}
  function ventana(t,a,b,sube,baja){sube=sube||0.3;baja=baja||sube;if(t<a||t>b)return 0;return Math.min(1,(t-a)/sube,(b-t)/baja)}
  function moto(K,color,placa,piloto){var g=new THREE.Group();K.add(g);var c=K.std(color,{metalness:0.4,roughness:0.35}),n=K.mat.negro;
    [[0,0.33,0.72],[0,0.33,-0.68]].forEach(function(p){var r=new THREE.Mesh(new THREE.TorusGeometry(0.29,0.08,10,24),K.mat.goma);r.rotation.y=Math.PI/2;r.position.set(p[0],p[1],p[2]);r.castShadow=true;g.add(r);var rin=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.06,16),K.mat.cromo);rin.rotation.z=Math.PI/2;rin.position.set(p[0],p[1],p[2]);g.add(rin)});
    function b(x,y,z,w,h,d,m,rx){var o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;o.castShadow=true;g.add(o);return o}
    b(0,0.55,0,0.18,0.18,1.0,n);b(0,0.72,0.2,0.3,0.24,0.5,c);b(0,0.8,-0.3,0.26,0.1,0.6,n);b(0,0.6,0.62,0.06,0.5,0.06,K.mat.cromo,0.35);b(0,0.92,0.72,0.7,0.04,0.04,K.mat.cromo);b(0,0.82,0.82,0.16,0.14,0.08,K.std(0xFFF6D8,{emissive:0xFFF0C0,emissiveIntensity:0.8}));
    var tp=K.tex(128,64,function(x,w,h){x.fillStyle="#F7D23A";x.fillRect(0,0,w,h);x.strokeStyle="#111";x.lineWidth=4;x.strokeRect(2,2,w-4,h-4);x.fillStyle="#111";x.font="800 26px Archivo,Arial";x.textAlign="center";x.textBaseline="middle";x.fillText(placa,w/2,h/2+2)});
    var pl=new THREE.Mesh(new THREE.PlaneGeometry(0.26,0.13),new THREE.MeshBasicMaterial({map:tp}));pl.position.set(0,0.62,-1.0);pl.rotation.y=Math.PI;g.add(pl);
    if(piloto){var ch=K.std(0x22304D);var tr=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.2,0.62,12),ch);tr.position.set(0,1.18,-0.22);tr.rotation.x=0.35;g.add(tr);
      var cas=new THREE.Mesh(new THREE.SphereGeometry(0.16,16,12),K.std(0xE5484D,{roughness:0.3}));cas.position.set(0,1.62,-0.05);g.add(cas);
      [-0.22,0.22].forEach(function(x){var br=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.62,8),ch);br.position.set(x,1.2,0.25);br.rotation.x=1.05;g.add(br);var pi=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.06,0.7,8),ch);pi.position.set(x*0.9,0.8,-0.1);pi.rotation.x=-0.9;g.add(pi)})}
    g.userData.placa=placa;return g}
  function furgon(K,color){var g=new THREE.Group();K.add(g);var c=K.std(color,{metalness:0.3,roughness:0.4});
    var a=new THREE.Mesh(new THREE.BoxGeometry(2.0,2.2,3.4),c);a.position.set(0,1.45,-0.7);a.castShadow=true;g.add(a);var cb=new THREE.Mesh(new THREE.BoxGeometry(2.0,1.5,1.6),c);cb.position.set(0,1.1,1.75);cb.castShadow=true;g.add(cb);
    var v=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.6,0.05),K.mat.vidrioAuto);v.position.set(0,1.45,2.56);g.add(v);
    [[-0.95,1.6],[0.95,1.6],[-0.95,-1.5],[0.95,-1.5]].forEach(function(p){var r=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.26,18),K.mat.goma);r.rotation.z=Math.PI/2;r.position.set(p[0],0.38,p[1]);g.add(r)});return g}
  window.ESC_UTIL={def:def,reloj:reloj,lerp:lerp,suave:suave,ROPA:ROPA,STAFF:STAFF,uniforme:uniforme,persona:persona,gente:gente,tienda:tienda,trastiendaFranq:trastiendaFranq,bodega:bodega,exterior:exterior,oficina:oficina,arma:arma,cuchillo:cuchillo,producto:producto,cabeza:cabeza,torso:torso,nervioso:nervioso,ventana:ventana,moto:moto,furgon:furgon};

  /* =====================================================================================================
     1 · COMERCIAL Y COMPORTAMENTAL
     ===================================================================================================== */
  def({id:"seguimiento",grupo:0,nombre:"Seguimiento de personas",corta:"Cada persona conserva su número mientras está.",estado:"en validación",
    desc:"Quien entra recibe un número y lo conserva hasta que se va, aunque se cruce con otra persona o pase a otra cámara. Es la base de todas las demás.",
    video:{src:"evidencia/seguimiento.mp4",poster:"evidencia/poster.jpg",chapa:"cámara real · 39 s"},
    dur:16,camara:{pos:[9,10,13],mira:[0,0.5,0]},
    fases:[[0,"vigila","Cada persona que entra recibe un número"],[6,"detecta","Dos se cruzan y se tapan: el número no se intercambia"],[11,"ok","Sale de cuadro, vuelve y recupera su número"]],
    armar:function(K){tienda(K);K.camara([7.6,3.1,4.6],[0,0,-0.5],{id:"CAM 01"});
      var P=gente(K,[{ruta:[[0,7,3.8],[6,0,3.6],[9,-2.5,3.2],[12,-5,3.4],[16,-7,3]]},{ruta:[[0,-6,3.2],[6,0.4,3.6],[9,3,3.9],[16,7,3.6]]},
        {ruta:[[0,1.6,-0.4],[2,1.6,-0.4,"idle",1.6,-1],[5,1.6,1.4],[8,4.6,1.6],[10.5,8.4,1.6],[12,8.4,1.6],[14.5,5,1.8],[16,3,1.8]]},{ruta:[[0,-5.4,0.6],[16,-5.4,0.6,"idle",-4,-1]]}]);
      var ids=["ID 07","ID 12","ID 15","ID 21"],RQ=P.map(function(p,i){var r=K.recuadro(p,{texto:ids[i]});K.etiqueta(ids[i],"id",K.sobre(p));return r});
      P[3].post=function(t){K.gesto(P[3],"telefono",t,1)};P[0].post=function(t,dt,e){if(e.a==="walk")K.gesto(P[0],"prisa",t,0.6)};
      return function(t){RQ.forEach(function(r,i){var cruce=t>7.4&&t<9.2&&i<2;r.set(cruce?"detecta":(t>11&&i===2?"ok":"vigila"))});
        RQ[2].visible=!(t>10.4&&t<12.2);K.contador("Personas en sala",String(P.filter(function(p,i){return RQ[i].visible}).length));K.contador("Números distintos","4")}}});

  def({id:"conteo",grupo:0,nombre:"Conteo de personas",corta:"Cuenta quién entra y quién sale por la puerta.",
    desc:"Una línea en la puerta cuenta cada cruce y su sentido. Con eso salen las visitas por hora, el pico del día y cuántas personas hay adentro en cada momento.",
    dur:16,camara:{pos:[8,8.5,12],mira:[0,0.5,0.5]},
    fases:[[0,"vigila","La línea de la puerta espera el primer cruce"],[3.4,"detecta","Cruza hacia adentro: suma una entrada"],[9.4,"ok","Cruza hacia afuera: suma una salida y ajusta el aforo"]],
    armar:function(K){tienda(K,{gondolas:false,canastas:false});K.gondola(-3,-2.2,4,90,{letrero:"PASILLO 1"});K.gondola(0.4,-2.2,4,90,{letrero:"PASILLO 2"});K.mostrador(-5.6,2.6,2.4,90);K.canastas(6.6,3.2,7);
      var pu=K.puerta(4.6,4,2.2,0);K.antihurto(4.6,3.3,2.2,0);K.muro(-8,5.4,3.3,5.4,0.9,K.mat.vidrio);K.muro(5.9,5.4,8,5.4,0.9,K.mat.vidrio);K.parche(4.6,3.1,2.2,1.2,K.std(0x3A3F4A,{roughness:1}),1,0.006);K.camara([4.6,2.9,1.6],[4.6,0,4.4],{id:"CAM PUERTA",fov:80});
      var L=K.lineaCruce([3.2,4.3],[6,4.3],{estado:"oro"});
      var P=gente(K,[{ruta:[[0,4.6,7],[1.5,4.6,6.4],[4.5,4.4,2.6],[7,1.8,0.6],[16,1.8,0.6,"idle",1.8,-2]]},{ruta:[[0,5.2,8],[3.2,5,6.2],[6,4.9,2.2],[9,2.4,-0.2],[16,2.4,-0.2,"idle",0.4,-0.2]]},
        {ruta:[[0,-1.6,0.8],[5,-1.6,0.8,"idle",-1.6,-1],[8,3.8,2.2],[11,4.5,6.2],[13,4.5,8.2]]}]);
      P.forEach(function(p){K.recuadro(p,{texto:"persona"})});var ent=0,sal=0,e=reloj();
      return function(t){pu.userData.abrir(suave(Math.max(t>1.5&&t<6.5?(t-1.5)/0.8:0,t>8.4&&t<12.4?(t-8.4)/0.8:0)*(1)));
        e(t,3.4,"a",function(){ent++;L.set("ok");K.evento("Entrada · persona 1","")});e(t,4.6,"b",function(){ent++;K.evento("Entrada · persona 2","")});e(t,9.6,"c",function(){sal++;L.set("detecta");K.evento("Salida · persona 3","")});
        K.contador("Entraron hoy",String(412+ent));K.contador("Salieron",String(398+sal));K.contador("Adentro ahora",String(14+ent-sal))}}});

  function entradaTienda(K){tienda(K,{gondolas:false,canastas:false});K.gondola(-3,-2.6,4,90,{letrero:"PASILLO 1"});K.gondola(0.6,-2.6,4,90,{letrero:"PASILLO 2"});K.canastas(6.6,3.0,7);K.carrito(7.0,1.4,0);K.carrito(7.0,0.5,0);
    K.puerta(4.6,4.5,2.2,0).userData.abrir(1);K.antihurto(4.6,3.9,2.2,0);K.muro(-8,5.5,3.3,5.5,0.9,K.mat.vidrio);K.muro(5.9,5.5,8,5.5,0.9,K.mat.vidrio);K.parche(4.6,3.6,2.2,1.2,K.std(0x3A3F4A,{roughness:1}),1,0.006);K.camara([4.6,2.8,1.4],[4.6,1,5],{id:"CAM ENTRADA"})}
  window.ESC_UTIL.entradaTienda=entradaTienda;

  def({id:"demografia",grupo:0,nombre:"Demografía",corta:"Rango de edad y género de quien visita.",
    desc:"Estima el rango de edad y el género de cada visitante al entrar, sin guardar caras ni nombres. Sirve para saber a quién le está vendiendo cada hora.",
    dur:15,camara:{pos:[7,7.5,11],mira:[0,0.8,1]},
    fases:[[0,"vigila","La cámara de la entrada ve a cada visitante"],[3,"detecta","Estima rango de edad y género, sin guardar la cara"],[9,"ok","Arma el perfil de quién visita, hora por hora"]],
    armar:function(K){entradaTienda(K);
      var P=gente(K,[{c:0xC46F7D,s:0.95,ruta:[[0,4.6,8],[5,3.6,1.6],[8,0.8,0.4],[15,-3,0.6]]},{c:0x5E9FB0,ruta:[[1.6,5.2,8],[6.4,4.6,1.2],[9.6,1.4,-0.6],[15,-1.6,-0.6]]},{c:0xB7A4D6,s:0.9,ruta:[[4,4.2,8.4],[9.4,4,1.8],[15,0,1.6]]}]);
      var tx=["Mujer · 25–34","Hombre · 45–54","Mujer · 18–24"],R=P.map(function(p,i){return K.recuadro(p,{texto:"rostro",h:0.3,w:0.3,d:0.3,y:p.alto-0.32})});
      var lb=P.map(function(p,i){return K.etiqueta(tx[i],"id",K.sobre(p))});
      return function(t){R.forEach(function(r,i){r.set(t>2+i*1.6?"ok":"vigila",t>2+i*1.6?tx[i]:"rostro");lb[i].el.style.opacity=t>2.6+i*1.6?1:0});
        var n=Math.min(3,Math.max(0,Math.floor((t-2)/1.6)+1));K.contador("Mujeres hoy",String(231+(n>0?1:0)+(n>2?1:0)));K.contador("Hombres hoy",String(198+(n>1?1:0)));K.contador("Franja con más visitas","25–34")}}});

  def({id:"calor",grupo:0,nombre:"Mapa de calor",corta:"Dónde se detiene la gente y cuánto rato.",
    desc:"Acumula sobre el plano del local dónde pasa la gente y dónde se queda. Muestra qué exhibición atrae, qué pasillo nadie recorre y cómo cambia por hora.",
    video:{img:"evidencia/mapa-3d.jpg",chapa:"plano 3D real"},
    dur:18,camara:{pos:[2,15,12],mira:[0,0,0]},sinPip:false,
    fases:[[0,"vigila","Cada paso de cada persona se suma al plano"],[6,"detecta","Las zonas donde se detienen se encienden"],[12,"ok","Queda a la vista qué atrae y qué nadie visita"]],
    armar:function(K){tienda(K,{exhibidor:false});K.camara([7.6,3.4,-5],[0,0,0.5],{id:"CAM 02",fov:85});K.mostrador(5.4,2.6,2.6,90);
      var H=K.calor(15.6,10.6);var P=gente(K,[{ruta:[[0,6,4.5],[3,1.4,3.8],[5,1.4,0.4],[9,1.4,0.4,"idle",0.4,0.4],[12,1.6,-3.6],[18,-6,-4]]},{ruta:[[0,7,3],[3,4.6,2.6],[8,4.6,2.6,"idle",5.4,2.6],[11,-2,3.6],[14,-2,0.2],[18,-2,0.2,"idle",-0.2,0.2]]},
        {ruta:[[0,-6,4],[4,-2,3.5],[6,1.4,0.8],[11,1.4,0.8,"idle",0.4,0.8],[18,4.6,2.6,"idle",5.4,2.6]]},{ruta:[[0,7,-4],[5,4.6,-3.4],[7,4.6,2.4],[13,4.6,2.4,"idle",5.4,2.4],[18,-6,4]]},{ruta:[[0,-7,0],[18,-7,0.4,"idle",-8,0]]}]);
      var k=0,prim=true;return function(t,dt){if(prim){prim=false;P.forEach(function(p){for(var tt=0;tt<18;tt+=0.1){var q=p.donde(tt);H.sumar(q.x,q.z,0.25)}});H.pintar()}
        P.forEach(function(p,i){H.sumar(p.raiz.position.x,p.raiz.position.z,dt*4)});if((k++)%4===0)H.pintar();
        K.contador("Zona más visitada","Exhibición central");K.contador("Pasillo sin visitas","Pasillo 1")}}});

  def({id:"permanencia",grupo:0,nombre:"Tiempo de permanencia",corta:"Cuánto se queda cada persona frente a cada zona.",
    desc:"Mide cuánto tiempo pasa cada persona en una zona: frente a una góndola, en una exhibición o en una mesa. Separa a quien pasa de largo de quien se detiene a decidir.",
    dur:16,camara:{pos:[8,8,10],mira:[0,0.6,0]},
    fases:[[0,"vigila","Se dibuja la zona frente a la exhibición"],[3.5,"detecta","Una persona se detiene y el reloj empieza a correr"],[10,"ok","Pasa de 3 minutos: cuenta como interés real"]],
    armar:function(K){tienda(K,{gondolas:false});var g=K.gondola(0,-1.8,5,0,{unaCara:true,letrero:"EXHIBICIÓN"});K.gondola(-5.5,1.6,4,90);K.camara([5,3,3.4],[0,0.6,-0.8],{id:"CAM 04"});
      var Z=K.zona([[-2.6,-1.2],[2.6,-1.2],[2.6,1.2],[-2.6,1.2]],{estado:"vigila"});var A=K.anillo(0.3,0.1,0.75);
      var P=gente(K,[{ruta:[[0,6,3],[3.4,0.3,-0.4],[14,0.3,-0.4,"idle",0.3,-2],[16,-6,2]]},{ruta:[[0,-7,2.6],[6,7,2.6]]},{ruta:[[5,7,3.4],[12,-7,3.2]]}]);var R=K.recuadro(P[0],{texto:"en zona"});
      var et=K.etiqueta("","reloj",K.sobre(P[0]));var sl=g.userData.slots[9];
      P[0].post=function(t){var a=ventana(t,6,9,0.6,0.6);if(a>0){var tg=sl.getWorldPosition(new THREE.Vector3());tg.y+=0.1;K.ik(P[0],"Right",tg,a);torso(K,P[0],0.08*a,0)}cabeza(K,P[0],0,(t>3.5&&t<14?0.25:0)+Math.sin(t*1.3)*0.08)};
      return function(t){var s=Math.max(0,t-3.5),min=s*18;A.m.position.set(P[0].raiz.position.x,0.03,P[0].raiz.position.z);A.arco(Math.min(1,s/6.5));
        var m=Math.floor(min/60),ss=Math.floor(min%60);et.set(t>3.5&&t<14?m+" min "+String(ss).padStart(2,"0")+" s":"",t>10?"reloj ok":"reloj");et.el.hidden=!(t>3.5&&t<14);
        R.set(t>10?"ok":(t>3.5?"detecta":"vigila"));A.set(t>10?"ok":"detecta");Z.set(t>3.5?(t>10?"ok":"detecta"):"vigila");K.contador("Promedio en esta zona","2 min 40 s");K.contador("Se detuvieron hoy","63")}}});

  def({id:"cruce",grupo:0,nombre:"Cruce de líneas",corta:"Cuenta pasos por un punto y en qué sentido.",
    desc:"Una línea dibujada sobre la cámara cuenta cada cruce y su sentido. Sirve para medir flujo entre zonas o para avisar cuando alguien pasa por donde no debe.",
    dur:15,camara:{pos:[8,9,11],mira:[0,0.4,0]},
    fases:[[0,"vigila","Se traza la línea y el sentido permitido"],[3,"detecta","Cada cruce en el sentido normal suma al flujo"],[9.5,"alerta","Alguien cruza en el sentido prohibido: aviso"]],
    armar:function(K){tienda(K,{gondolas:false});K.gondola(-3.4,-0.4,6,90,{letrero:"PASILLO 3"});K.gondola(3.4,-0.4,6,90,{letrero:"PASILLO 4"});K.camara([0,3.2,4.4],[0,0,-0.6],{id:"CAM PASILLO",fov:75});
      var L=K.lineaCruce([-2.4,0],[2.4,0],{estado:"oro"});K.cartel(0,0.02,0.9,1.4,0.35,"→ SALIDA","#D6AB4C","#001441").rotation.x=-Math.PI/2;
      var P=gente(K,[{ruta:[[0,-0.8,-4.5],[5,-0.6,4.5]]},{ruta:[[1.5,0.6,-4.5],[6.5,0.8,4.6]]},{ruta:[[6,0.2,5.2],[12,0,-4.6]]}]);var R=P.map(function(p){return K.recuadro(p,{texto:"persona"})});var e=reloj(),n=0;
      return function(t){e(t,2.9,"a",function(){n++;K.evento("Cruce · sentido permitido","")});e(t,4.3,"b",function(){n++;K.evento("Cruce · sentido permitido","")});
        e(t,9.4,"c",function(){R[2].set("alerta","contravía");L.set("alerta");K.evento("Cruce en sentido prohibido","alerta")});K.contador("Cruces en la hora",String(86+n));K.contador("En contravía",t>9.4?"1":"0")}}});

  def({id:"comprador",grupo:0,nombre:"Comprador activo",corta:"Separa a quien está comprando de quien pasa.",
    desc:"Reconoce los gestos de compra: detenerse, recorrer la góndola con la mirada, comparar marcas, tomar un producto. Marca al comprador activo para que el personal lo atienda a tiempo.",
    dur:17,camara:{pos:[4.6,3.4,4.4],mira:[-0.6,1,-1.2]},
    fases:[[0,"vigila","Varias personas en el pasillo"],[3,"detecta","Se detiene y recorre la góndola con la mirada, arriba y abajo, entre varias marcas"],[8,"detecta","Toma un producto y lo examina"],[10,"ok","Se marca como comprador activo y se avisa al asesor"]],
    armar:function(K){tienda(K,{gondolas:false});var g=K.gondola(0,-2,6,0,{unaCara:true,familias:["cajas","cajas","bolsas","cajas"]});K.gondola(0,2.6,6,0,{unaCara:true,familias:["botellas","latas","botellas","cajas"]});K.camara([4.6,3,0.4],[0,0.6,-1.2],{id:"CAM 05"});
      var P=gente(K,[{ruta:[[0,-6,0.2],[2.6,-1.5,-0.9],[4.8,-1.5,-0.9,"idle",-1.5,-2],[5.5,-0.7,-0.9],[7,-0.7,-0.9,"idle",-0.7,-2],[7.6,0.2,-0.9],[13,0.2,-0.9,"idle",0.2,-2],[17,5,0.4]]},
        {ruta:[[0,6,0.8],[8,-6,0.6]]},{ruta:[[3,-6,1],[12,6,0.8]]},{c:STAFF,ruta:[[0,6.5,-4],[10.6,6.5,-4],[13.6,1.4,-0.6,"idle",0.2,-0.9]]}]);
      var C_=P[0],cab=C_.hueso("Head"),cue=C_.hueso("Neck"),esp=C_.hueso("Spine2"),esp1=C_.hueso("Spine1");C_.sinMirada=true;C_.sinAuto=true;
      var MIRADAS=[[-0.45,0.25],[0.55,0.3],[0.1,-0.3],[-0.3,-0.35],[0.6,-0.1],[0.2,0.35],[-0.4,0.05],[0.45,-0.3]];
      function mirada(t){var q=(t-2.6)/0.85,i=Math.floor(q),f=q-i,a=MIRADAS[((i%8)+8)%8],b=MIRADAS[(((i+1)%8)+8)%8],k=f<0.55?0:suave((f-0.55)/0.45);return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]}
      var ex=0;C_.post=function(t,dt,e){var mira=t>2.6&&t<8.2&&e.a!=="walk",el=t>8&&t<13;var w=mira?1:0;C_.extra.w=(C_.extra.w||0)+(w-(C_.extra.w||0))*Math.min(1,dt*4);ex+=((el?1:0)-ex)*Math.min(1,dt*4);
        var m=mirada(t),k=C_.extra.w,pit=m[0]*k+0.32*ex,yaw=m[1]*k;
        if(cab){cab.rotation.x+=pit*0.55;cab.rotation.y+=yaw*0.6}if(cue){cue.rotation.x+=pit*0.25;cue.rotation.y+=yaw*0.25}
        var ag=Math.max(0,m[0]-0.2)*k;if(esp){esp.rotation.x+=ag*0.55}if(esp1){esp1.rotation.x+=ag*0.35}
        var al=ventana(t,7.3,8.2,0.5,0.3);if(al>0&&t<8){var tg=sl.getWorldPosition(new THREE.Vector3());tg.y+=0.1;K.ik(C_,"Right",tg,al)}if(el){K.ik(C_,"Right",K.local(C_,-0.1,1.35,0.3),ex)}};
      var pr=producto(K,0xD94F3D,3),sl=null,bx=1e9;g.userData.slots.forEach(function(q,i){var d=Math.abs(q.position.x-0.2)+Math.abs(q.userData.n-2)*3;if(d<bx){bx=d;sl=q}});
      var R=K.recuadro(P[0],{texto:"persona"});[1,2].forEach(function(i){K.recuadro(P[i],{texto:"de paso"})});var et=K.etiqueta("Comprador activo","oro",K.sobre(P[0]));var e=reloj();
      return function(t){if(t>8&&!(pr.parent&&pr.parent.isBone)){sl.visible=false;P[0].sostener(pr,"Right",[0,0.1,0.06])}
        R.set(t>10?"oro":(t>8?"detecta":(t>3?"detecta":"vigila")),t>10?"comprador activo":(t>8?"examina":(t>3?"compara marcas":"persona")));et.el.style.opacity=t>10?1:0;
        e(t,10,"a",function(){K.evento("Comprador activo · pasillo 2 → asesor","")});K.contador("Compradores activos ahora",t>10?"3":"2")}}});

  /* =====================================================================================================
     2 · OPERATIVO Y DE EFICIENCIA
     ===================================================================================================== */
  def({id:"blancas",grupo:1,nombre:"Listas blancas",corta:"Reconoce a quien tiene acceso y le abre.",estado:"funcionando a diario",
    desc:"Reconoce a las personas autorizadas en un acceso y habilita el paso sin tarjeta. A quien no está en la lista no le abre y pide validación.",
    video:{src:"evidencia/facial-1.mp4",poster:"evidencia/facial-poster-1.jpg",chapa:"acceso real"},
    dur:15,camara:{pos:[7,7,10],mira:[0,1,0]},
    fases:[[0,"vigila","La cámara del acceso ve llegar a alguien"],[3,"ok","Está en la lista blanca: la puerta se abre"],[9,"detecta","Alguien que no está: la puerta sigue cerrada y pide validación"]],
    armar:function(K){oficina(K);K.muro(-7,0,-1.2,0,2.8,K.mat.muroAzul);K.muro(1.2,0,7,0,2.8,K.mat.muroAzul);var pu=K.puerta(0,0,2.2,0,{opaca:true});K.cartel(0,2.55,0.1,1.6,0.3,"SOLO PERSONAL","#001441","#D6AB4C");
      K.caja(1.35,1.1,0.1,0.1,0.16,0.04,K.std(0x2B3038));K.caja(1.35,1.14,0.13,0.06,0.02,0.01,K.std(0x30A46C,{emissive:0x30A46C,emissiveIntensity:1}));K.puesto(-4,-3,0);K.puesto(4,-3,0);
      K.camara([1.6,2.6,0.4],[0,1.4,3.8],{id:"CAM ACCESO"});
      var P=gente(K,[{c:STAFF,ruta:[[0,1,6],[2.6,0.2,1.2],[3.4,0.2,1.2,"idle",0,-1],[6,0,-3],[15,-3,-4]]},{ruta:[[5,-3,6.4],[8.5,0.2,1.3],[12,0.2,1.3,"headShake",0,-1],[15,3,5]]}]);
      var R=P.map(function(p){return K.recuadro(p,{texto:"rostro",h:0.3,w:0.3,d:0.3,y:p.alto-0.32})});
      var lb=[K.etiqueta("Lista blanca · autorizado","ok",K.sobre(P[0])),K.etiqueta("Sin coincidencia · validar","ambar",K.sobre(P[1]))];var e=reloj();
      return function(t){pu.userData.abrir(suave(t>2.8&&t<6.5?(t-2.8)*1.5:(t>=6.5&&t<7.5?1-(t-6.5):0)));
        R[0].set(t>2.6?"ok":"vigila",t>2.6?"autorizado":"rostro");R[1].set(t>8.6?"detecta":"vigila",t>8.6?"sin coincidencia":"rostro");lb[0].el.style.opacity=t>2.6&&t<6?1:0;lb[1].el.style.opacity=t>8.6?1:0;
        e(t,2.8,"a",function(){K.evento("Acceso autorizado · lista blanca","")});e(t,8.8,"b",function(){K.evento("Sin coincidencia en acceso · validar","detecta")})}}});

  def({id:"filas",grupo:1,nombre:"Gestión de filas y cajas",corta:"Avisa cuando la fila crece y hay que abrir otra caja.",
    desc:"Cuenta cuántas personas hay en cada fila y cuánto llevan esperando. Cuando pasa el umbral avisa para abrir otra caja, antes de que el cliente se vaya.",
    dur:18,camara:{pos:[9,9,10],mira:[0,0.5,0]},camaraFranq:{pos:[9.5,6.5,6.5],mira:[4.4,0.5,-2.4]},
    fases:[[0,"vigila","Cuenta la fila de cada caja"],[6,"alerta","Cinco personas y más de 6 minutos: abrir otra caja"],[11,"ok","Abre la caja 2 y la fila se reparte"]],
    armar:function(K){var OX=window.MARCA==="franq";if(OX){tienda(K,{exhibidor:false});K.camara([2.6,3.2,1.2],[6,0.6,-2.4],{id:"CAM CAJAS",fov:78})}else{tienda(K,{gondolas:false,exhibidor:false});K.gondola(-2,-3.4,6,0,{unaCara:true});K.cajaRegistro(-2.4,0.2,0,{n:1});K.cajaRegistro(2.4,0.2,0,{n:2});K.camara([0,3.2,-2.4],[0,0,2.6],{id:"CAM CAJAS",fov:78})}
      var Z1=OX?K.zona([[1.4,-4.1],[5.6,-4.1],[5.6,-2.8],[1.4,-2.8]],{estado:"vigila"}):K.zona([[-3.4,0.8],[-1.4,0.8],[-1.4,5.2],[-3.4,5.2]],{estado:"vigila"}),Z2=OX?K.zona([[1.4,-2.0],[5.6,-2.0],[5.6,-0.7],[1.4,-0.7]],{estado:"vigila"}):K.zona([[1.4,0.8],[3.4,0.8],[3.4,5.2],[1.4,5.2]],{estado:"vigila"});
      var cajero1=persona(K,{color:STAFF,ruta:OX?[[0,7.05,-3.4,"idle",5,-3.4]]:[[0,-2.4,-0.75,"idle",-2.4,1]]}),cajero2=persona(K,{color:STAFF,ruta:OX?[[0,7.05,0.6,"idle",7.05,-1],[10.6,7.05,0.6,"idle",7.05,-1],[12.4,7.05,-1.4,"idle",5,-1.4]]:[[0,6,-2],[10.6,6,-2],[12.4,2.4,-0.75,"idle",2.4,1]]});
      var Q=[];for(var i=0;i<5;i++)(function(i){var r;if(OX){var x=5.3-i*0.8,llega=i*1.1;r=[[0,-2+(i%2)*0.3,9],[llega+0.2,-2+(i%2)*0.3,9],[llega+3.4,x,-3.4+(i%2)*0.1]];if(i>=3)r.push([11.6+i*0.3,x,-3.4],[13.4+i*0.3,5.3-(i-3)*0.8,-1.4,"idle",7,-1.4]);else r.push([18,x,-3.4+(i%2)*0.1,"idle",7,-3.4])}
        else{var z=1.3+i*0.8,llega2=i*1.1;r=[[0,-2.6+(i%2)*0.3,9],[llega2+0.2,-2.6+(i%2)*0.3,9],[llega2+3,-2.5+(i%2)*0.2,z]];if(i>=3)r.push([11.6+i*0.3,-2.5,z],[13.4+i*0.3,2.5,1.3+(i-3)*0.8,"idle",2.5,0]);else r.push([18,-2.5+(i%2)*0.2,z,"idle",-2.5,0])}
        var p=persona(K,{color:ROPA[i],ruta:r});if(i%2){var ces=K.canastilla(0,0,0,ROPA[(i+3)%9]);p.sostener(ces,"Left",[0,-0.3,0.1]);p.canasta=ces}Q.push(p)})(i);
      Q.forEach(function(p,i){K.recuadro(p,{texto:"en fila"});p.post=function(t,dt,e){if(e.a!=="idle")return;var k=K.ventana(t,2+i*0.7,18,0.6,0.1);var g=[["celular",1],["nervioso",0.8],["telefono",1],["escuchar",1],["nervioso",0.6]][i%5];K.gesto(p,g[0],t+i,k*g[1])}});
      cajero1.post=function(t){K.gesto(cajero1,"hablar",t,0.6);};cajero2.post=function(t,dt,e){if(e.a==="idle")K.gesto(cajero2,"saludar",t,K.ventana(t,12.6,14.5,0.3,0.5))};var e=reloj();
      return function(t){var n1=OX?Q.filter(function(p){return p.raiz.position.z<-2.6&&p.raiz.position.x>1}).length:Q.filter(function(p){return p.raiz.position.x<0&&p.raiz.position.z<5.4}).length,n2=OX?Q.filter(function(p){return p.raiz.position.z>-2.6&&p.raiz.position.z<0&&p.raiz.position.x>1}).length:Q.filter(function(p){return p.raiz.position.x>0&&p.raiz.position.z<5.4}).length;
        K.contador("Fila caja 1",n1+" personas");K.contador("Fila caja 2",t>12?n2+" personas":"cerrada");K.contador("Espera estimada",(t>11?2:Math.min(7,Math.round(n1*1.3)))+" min");
        Z1.set(t>6&&t<11?"alerta":(t>11?"ok":"vigila"),t>6&&t<11);Z2.set(t>11?"ok":"vigila");e(t,6,"a",function(){K.evento("Fila larga en caja 1 · abrir caja 2","alerta")});e(t,12.4,"b",function(){K.evento("Caja 2 abierta · fila repartida","")})}}});

  def({id:"aforo",grupo:1,nombre:"Control de aforo",corta:"Lleva cuántos hay adentro y avisa al llegar al límite.",
    desc:"Suma entradas y resta salidas en todas las puertas para saber cuántas personas hay adentro. Al llegar al límite avisa para frenar el ingreso.",
    dur:15,camara:{pos:[6,13,13],mira:[0,0,0]},
    fases:[[0,"vigila","Cuenta a quien entra y a quien sale"],[5,"detecta","Se acerca al límite: 19 de 20"],[8,"alerta","Aforo completo: aviso para frenar el ingreso"]],
    armar:function(K){tienda(K,{canastas:false});K.camara([4.6,2.9,1.6],[4.6,0,4.4],{id:"CAM PUERTA",fov:80});var pu=K.puerta(4.6,4.6,2.2,0);K.antihurto(4.6,4.0,2.2,0);K.muro(-8,5.5,3.3,5.5,0.9,K.mat.vidrio);K.muro(5.9,5.5,8,5.5,0.9,K.mat.vidrio);var Zp=K.zona([[3.4,3.6],[5.8,3.6],[5.8,5.4],[3.4,5.4]],{estado:"vigila"});
      var ad=[[-5,3],[-2,3.6],[1.4,3.2],[-5.6,-4],[-2,0.8],[1.6,-4],[5.2,-4.4],[-6.4,0.2],[5.4,1.6],[-1.4,-4.4],[2,1.2],[-4.4,1.4],[6.2,-2],[-6.8,-2.6],[0.4,4.2],[4.4,-1],[-3.2,-4.2],[6.4,3.4]];
      var P=ad.map(function(p,i){var par=ad[i%2?i-1:i+1]||[0,0];return persona(K,{color:ROPA[i%9],ruta:[[0,p[0],p[1],"idle",i%3===2?0:par[0],i%3===2?0:par[1]]],rot:i*40})});
      P.forEach(function(p,i){p.post=function(t){var g=["hablar","escuchar","celular"][i%3];K.gesto(p,g,t+i*1.3,0.9)}});
      var e=reloj();var nuevo=persona(K,{color:0xD9B45A,ruta:[[0,4.6,8],[3,4.6,3.6],[5,4.4,2.2],[15,4.4,2.2,"idle",0,0]]}),otro=persona(K,{color:0x5E9FB0,ruta:[[0,5.2,8.6],[6.4,5,6.4],[9,5,5.6,"idle",5,3]]});
      return function(t){var n=18+(t>3?1:0)+(t>7.2?1:0);pu.userData.abrir(t>1.5&&t<4?1:0);K.contador("Adentro",n+" / 20");K.contador("Disponible",String(20-n));
        Zp.set(n>=20?"alerta":(n>=19?"detecta":"vigila"),n>=20);e(t,3,"a",function(){K.evento("Entrada · 19 de 20","detecta")});e(t,7.2,"b",function(){K.evento("Aforo completo · 20 de 20","alerta")})}}});

  def({id:"placas",grupo:1,nombre:"Lectura de placas y parqueo",corta:"Placa, tipo, color, cajón y tiempo de cada vehículo.",
    desc:"Lee la placa al entrar y abre la barrera. Además reconoce si es carro o moto, su color y en qué cajón quedó, y cuenta cuánto lleva cada uno. Si algo lo tapa, el vehículo sigue en el registro: no se pierde ni se cuenta dos veces.",
    dur:22,camara:{pos:[13,13,15],mira:[0,0,0.4]},
    fases:[[0,"vigila","Cada vehículo del parqueadero con su placa, tipo, color, cajón y tiempo"],[3.4,"detecta","Un carro llega a la barrera: lee KTV 482 · rojo · carro"],[5,"ok","Está registrado: entra a un cajón libre y empieza a contar"],[12.5,"detecta","Un furgón tapa la fila de autos y motos: los recuadros se mantienen punteados"],[16,"ok","Entra una moto al cajón de motos: se suma al registro"]],
    armar:function(K){var W=22,D=14;K.piso(W,D,K.mat.asfalto,3);K.parche(0,D/2-1.1,W,2.2,K.mat.concreto,2.5,0.006);K.parche(0,-D/2+0.5,W,1,K.mat.pasto,2,0.006);K.caja(0,0,D/2-2.2,W,0.12,0.16,K.std(0xC9CDD4));
      var am=K.std(0xF2C230,{roughness:0.6}),bl=K.std(0xF4F4F2,{roughness:0.6});K.parche(2,2.6,18,0.1,bl,1,0.008);K.parche(2,4.6,18,0.1,bl,1,0.008);
      for(var x=-9.8;x<=1.41;x+=2.8)K.parche(x,-3.6,0.1,5,am,1,0.008);for(x=1.4;x<=5.01;x+=1.2)K.parche(x,-4.4,0.08,3.4,am,1,0.008);K.parche(-3,-1.1,14,0.1,am,1,0.008);
      K.cartel(3.2,0.03,-2.4,1.6,0.35,"MOTOS","#001441","#D6AB4C").rotation.x=-Math.PI/2;[-9,-3,3,9].forEach(function(xx){K.arbol(xx,-6.4,0.9)});K.poste(8.5,-6.2);K.poste(-7.5,-6.2);
      var cas=K.grupo(7.2,5.6,0);K.caja(0,0,0,1.6,2.4,1.4,K.std(0xE9EBEE),cas);K.caja(0,1.0,0.71,1.2,0.9,0.02,K.mat.vidrio,cas);K.caja(0,2.4,0,1.8,0.08,1.6,K.std(0x1E3A6E),cas);K.cartel(0,2.15,0.72,1.2,0.26,"CONTROL","#001441","#D6AB4C",0,cas);
      var V=[{id:"HJM 210",tipo:"carro",mod:"suv",col:"azul",hex:0x2F64C8,caj:"A1",x:-8.4,z:-3.6,min:42},{id:"QSA 774",tipo:"carro",mod:"hatch",col:"gris",hex:0xB0B6BF,caj:"A2",x:-5.6,z:-3.6,min:18},{id:"WEL 903",tipo:"carro",mod:"pickup",col:"verde",hex:0x3E8E5A,caj:"A4",x:0,z:-3.6,min:65},
        {id:"ABC 12D",tipo:"moto",col:"negra",hex:0x22242A,caj:"M1",x:2,z:-4.4,min:7},{id:"XYZ 34E",tipo:"moto",col:"roja",hex:0xC8342B,caj:"M2",x:3.2,z:-4.4,min:25}];
      K.auto(0xF4F4F2,{tipo:"van",placa:"DRT 551"}).position.set(-9.2,0,2.2);
      V.forEach(function(v){var o=v.tipo==="carro"?K.auto(v.hex,{placa:v.id,tipo:v.mod}):moto(K,v.hex,v.id,false);o.position.set(v.x,0,v.z);o.rotation.y=Math.PI;v.o=o;
        v.R=K.recuadro({raiz:o,visible:true,alto:1,rot:0},{texto:v.id,w:v.tipo==="carro"?2:0.75,h:v.tipo==="carro"?1.55:1.15,d:v.tipo==="carro"?4.5:2.1,estado:"ok"});v.R.fijo=[v.x,0,v.z]});
      var b=K.barrera(4.2,5.1,90);K.caja(5.4,0,5.4,0.6,1.2,0.5,K.mat.aceroOsc);K.camara([9.6,4.2,-6.2],[0,0,0.4],{id:"CAM PARQUEADERO",fov:72});
      var a=K.auto(0xC8342B,{placa:"KTV 482"}),ruta=new THREE.CatmullRomCurve3([[8.2,3.6],[3.6,3.6],[0,3.2],[-1.8,2.2],[-2.7,0.4],[-2.8,-1.6],[-2.8,-3.6]].map(function(p){return new THREE.Vector3(p[0],0,p[1])}),false,"centripetal");a.userData.obst=false;
      var mo=moto(K,0xF2C230,"KTV 88E",true),rm=new THREE.CatmullRomCurve3([[11,3.6],[7,3.6],[5.4,2.4],[4.5,0.4],[4.4,-2.2],[4.4,-4.4]].map(function(p){return new THREE.Vector3(p[0],0,p[1])}),false,"centripetal");
      var fu=furgon(K,0xF4F4F2);var Ra=K.recuadro({raiz:a,visible:true,alto:1,rot:0},{texto:"",w:2,h:1.55,d:4.5,estado:"vigila"}),Rmo=K.recuadro({raiz:mo,visible:true,alto:1,rot:0},{texto:"",w:0.8,h:1.8,d:2.1,estado:"vigila"});Rmo.visible=false;
      var Rf=K.recuadro({raiz:fu,visible:true,alto:1,rot:0},{texto:"furgón · de paso",w:2.1,h:2.7,d:5.2,estado:"vigila"});Rf.visible=false;var e=reloj();
      function mover(o,R,cur,t0,t1,xi,zi,h0,t){var x,z,h;if(t<t0){x=xi;z=zi;h=h0}else{var u=suave(Math.min(1,(t-t0)/(t1-t0))),p=cur.getPointAt(u),tg=cur.getTangentAt(u);x=p.x;z=p.z;h=Math.atan2(tg.x,tg.z)}o.position.set(x,0,z);o.rotation.y=h;R.fijo=[x,0,z];R.l.rotation.y=h}
      return function(t){var xa=t<3?lerp(13,8.2,suave(t/3)):8.2;if(t<6)mover(a,Ra,ruta,99,100,xa,3.6,-Math.PI/2,t);else mover(a,Ra,ruta,6,12,0,0,0,t);
        Ra.set(t>5?"ok":(t>3.2?"detecta":"vigila"),t>3.2?"KTV 482 · rojo · carro":"vehículo");b.userData.abrir(suave(t>5?(t-5)/1:0)*(t<9?1:Math.max(0,1-(t-9))));
        mo.visible=t>14.6;Rmo.visible=t>14.6;if(t>14.6){mover(mo,Rmo,rm,14.6,19.5,11,3.6,-Math.PI/2,t);if(t>16.6)b.userData.abrir(1-Math.abs(t-17.6)/1);Rmo.set(t>16?"ok":"detecta",t>16?"KTV 88E · amarilla · moto":"moto")}
        var xf=lerp(14,-14,(t-11)/7);fu.visible=t>11&&t<18;Rf.visible=fu.visible;fu.position.set(xf,0,-0.1);fu.rotation.y=-Math.PI/2;Rf.fijo=[xf,0,-0.1];Rf.l.rotation.y=-Math.PI/2;
        var fila=[];V.forEach(function(v){var tap=fu.visible&&Math.abs(xf-v.x)<4.2;v.R.ocultar(tap);var m=v.min+Math.floor(t*0.8);v.R.set(tap?"detecta":"ok",tap?v.id+" · tapado, se mantiene":v.id);
          fila.push({c:[v.id,v.tipo,v.col,v.caj,m+" min"],cls:tap?"ambar":""})});
        if(t>5)fila.push({c:["KTV 482","carro","rojo","A3",Math.floor((t-5)*0.8)+" min"],cls:t<9?"nuevo":""});if(t>16)fila.push({c:["KTV 88E","moto","amarilla","M3",Math.floor((t-16)*0.8)+" min"],cls:t<20?"nuevo":""});
        K.tabla("Registro del parqueadero",["Placa","Tipo","Color","Cajón","Tiempo"],fila);
        K.contador("Carros",String(3+(t>5?1:0)));K.contador("Motos",String(2+(t>16?1:0)));K.contador("Cajones libres",(t>12?0:1)+" autos · "+(t>19?0:1)+" motos");
        e(t,3.4,"a",function(){K.evento("Placa leída · KTV 482 · rojo · carro","")});e(t,12.6,"b",function(){K.evento("3 vehículos tapados por un furgón · se mantienen","detecta")});e(t,16,"c",function(){K.evento("Placa leída · KTV 88E · amarilla · moto","")})}}});

  def({id:"staff",grupo:1,nombre:"Detección de personal",corta:"Separa al personal de los clientes en sala.",estado:"listo para instalar",
    desc:"Decide si quien aparece es del equipo o es un cliente, por el uniforme y sin reconocer a nadie. Así los conteos de clientes no se inflan con el personal.",
    video:{src:"evidencia/staff.mp4",poster:"evidencia/staff-poster.jpg",chapa:"cámara real · día no visto"},
    dur:16,camara:{pos:[9,9.5,11],mira:[0,0.5,-0.4]},camaraFranq:{pos:[6,9,13],mira:[0,0.6,0]},
    fases:[[0,"vigila","Ve a todas las personas del local"],[3,"detecta","Mira el uniforme: personal en amarillo, clientes en azul"],[7,"ok","Cuenta cuántos hay de cada uno, en todo momento"]],
    armar:function(K){var OX=window.MARCA==="franq";
      if(OX){tienda(K);K.camara([4.6,2.8,1.4],[4.6,1,5],{id:"CAM ENTRADA",fov:80});
        var caj=persona(K,{color:STAFF,ruta:[[0,7.05,-1.0,"idle",6.3,-1.0]]});
        var sup=persona(K,{color:0x1E3A6E,ropa:{camisa:0xF4F4F2,chaleco:0x1E3A6E,pantalon:0x1E2433,zapatos:0x1C1E22},ruta:[[0,4.6,9],[2.5,4.6,3.4],[5.5,0.45,0.4],[8.5,-3.4,0.2],[12.5,5.4,0.4,"idle",6.3,-1],[16,5.4,0.4,"idle",6.3,-1]]});
        var cli=gente(K,[{c:0x3F6FB5,ruta:[[0,-3.35,0.4],[5,-3.35,-3.4,"idle",-4.3,-3.4],[9,-3.35,-3.4,"idle",-4.3,-3.4],[14,-3.35,0.2]]},
          {c:0x7A5CB0,ruta:[[0,-1.45,-3.6],[4,-1.45,-1.2,"idle",-0.5,-1.2],[10,-1.45,-1.2,"idle",-0.5,-1.2],[16,-1.45,0.4]]},
          {c:0x2E8A9E,ruta:[[0,0.45,-2.6,"idle",1.4,-2.6],[7,0.45,-2.6,"idle",1.4,-2.6],[11,0.45,-3.6,"idle",1.4,-3.6]]},
          {c:0xC8962E,ruta:[[0,2.35,-1.0,"idle",3.3,-1],[6,2.35,-3.4],[12,2.35,0.2,"idle",3.3,0.2]]}]);
        var P=[caj,sup].concat(cli),es=[1,1,0,0,0,0],R=P.map(function(p){return K.recuadro(p,{texto:"persona"})});
        var lb=P.map(function(p,i){return K.etiqueta(es[i]?"personal":"cliente",es[i]?"amarilla":"celeste",K.sobre(p))});var e=reloj(),T0=1.6;
        return function(t){R.forEach(function(r,i){var ok=t>3+i*0.35;r.set(ok?(es[i]?"staff":"cliente"):"vigila",ok?(es[i]?"personal "+(96+i%3)+"%":"cliente "+(91+i%6)+"%"):"persona");lb[i].el.style.opacity=ok?1:0});
          e(t,T0,"a",function(){K.evento("Supervisor zonal registrado · 09:41","")});
          var k=R.filter(function(r){return r.estado!=="vigila"});K.contador("Personal en sala",String(k.filter(function(r){return r.estado==="staff"}).length));K.contador("Clientes",String(k.filter(function(r){return r.estado==="cliente"}).length));
          K.contador("Supervisor zonal · llegada 09:41",t>T0?"en tienda":"por llegar");var s=Math.max(0,t-T0)*20,m=Math.floor(s/60),ss=Math.floor(s%60);K.contador("Duración de visita",t>T0?m+" min "+String(ss).padStart(2,"0")+" s":"—")}}
      var W=16,D=11;K.piso(W,D,K.mat.madera,1.6);K.muro(-W/2,-D/2,W/2,-D/2,2.8,K.std(0x2B3A4F,{roughness:0.85}));K.muro(-W/2,-D/2,-W/2,D/2,2.8,K.std(0x2B3A4F,{roughness:0.85}));
      K.cartel(-1,2.2,-5.4,3.4,0.6,"CAFÉ · PANADERÍA","#D6AB4C","#001441");K.afiche(-7.91,1.6,2.4,1.2,0.9,"CAFÉ DEL DÍA",28,90);K.afiche(-7.91,1.6,0.6,1.2,0.9,"PAN FRESCO",40,90);
      K.mostrador(-1,-3.6,6,0,K.mat.madera);K.caja(-2.6,0.98,-3.6,1.6,0.5,0.6,K.mat.vidrio);for(var i=0;i<6;i++)K.caja(-3.2+i*0.25,1.0,-3.6,0.2,0.1,0.3,K.std([0xD6A35C,0xB87333,0xEBD5A6][i%3],{roughness:0.8}));
      var maq=K.grupo(1.2,-3.7,0);K.caja(0,0.98,0,0.6,0.55,0.45,K.mat.acero,maq);K.caja(0,1.1,0.2,0.2,0.1,0.1,K.mat.negro,maq);K.caja(-0.15,0.98,0.26,0.12,0.12,0.04,K.mat.cromo,maq);
      K.caja(-1,0,-5.1,6,1.9,0.4,K.std(0x5A3E2B));for(var k=0;k<4;k++){K.caja(-3.5+k*1.7,0.9,-5.1,1.5,0.03,0.42,K.std(0x7A5434),null);for(var j=0;j<3;j++)K.prodBotella(0.05,0.3,[0xD94F3D,0x2F7BEA,0x3EA66B][j]).position.set(-3.9+k*1.7+j*0.3,0.93,-5.05)}
      [[-5.5,0.5],[-5.5,3.4],[-2.4,2],[3.6,3.4],[5.8,1]].forEach(function(m){K.mesa(m[0],m[1],{r:0.5})});K.mesa(1.4,0.4,{r:0.35,alta:true});K.mesa(4.2,-1.2,{r:0.35,alta:true});K.planta(7,-4.6,1.2);K.planta(-7.2,4.6,1);
      K.camara([6.8,2.7,-4.4],[0,0,0.8],{id:"CAM SALÓN",fov:84});
      var bandeja=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.02,20),K.mat.acero);var taza=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.03,0.07,12),K.mat.blanco);taza.position.set(0.06,0.045,0);bandeja.add(taza);
      var P=gente(K,[{c:STAFF,ruta:[[0,-2.4,-4.4,"idle",-2.4,-3],[5,0.6,-4.4,"idle",1.2,-3.7],[9,-2.4,-4.4,"idle",-2.4,-3],[16,-2.4,-4.4,"idle",-2.4,-3]]},
        {c:STAFF,ruta:[[0,3.4,-2.2],[3.4,-1.8,1],[4.6,-1.8,1,"idle",-2.4,2],[7.6,3.6,2.6],[9,3.6,2.6,"idle",3.6,3.4],[13,-0.8,-2.6],[16,3.4,-2.2]]},
        {c:STAFF,ruta:[[0,2.6,-4.3,"idle",2.6,-3]]},
        {c:0x2E8A9E,ruta:[[0,2.6,-2.6,"idle",2.6,-3.6]]},{c:0x7A5CB0,ruta:[[0,2.7,-1.6,"idle",2.6,-3.6],[8,2.7,-1.6,"idle",2.6,-3.6],[10,2.6,-2.6,"idle",2.6,-3.6]]},
        {c:0xA8445A,ruta:[[0,1.0,0.9,"idle",1.4,0.4]]},{c:0x4A5F80,ruta:[[0,1.9,0.0,"idle",1.4,0.4]]},{c:0xC8962E,ruta:[[0,8.6,4.6],[5,4.8,4.4],[9,-4,4.6],[16,-7,1.6]]}]);
      P[1].sostener(bandeja,"Right",[0,0.06,0.1]);P[1].post=function(t){K.ik(P[1],"Right",K.local(P[1],-0.25,1.15,0.3),0.9)};
      P[3].post=function(t){K.gesto(P[3],"hablar",t,0.9)};P[4].post=function(t,dt,e){if(e.a==="idle")K.gesto(P[4],"escuchar",t,0.9)};P[5].post=function(t){K.gesto(P[5],"celular",t,1)};P[6].post=function(t){K.gesto(P[6],"hablar",t+2,0.8)};P[0].post=function(t,dt,e){if(e.a==="idle")K.gesto(P[0],"hablar",t,0.5)};
      var es=[1,1,1,0,0,0,0,0],R=P.map(function(p){return K.recuadro(p,{texto:"persona"})});
      var lb=P.map(function(p,i){return K.etiqueta(es[i]?"Personal":"Cliente",es[i]?"amarilla":"celeste",K.sobre(p))});
      return function(t){R.forEach(function(r,i){var ok=t>3+i*0.35;r.set(ok?(es[i]?"staff":"cliente"):"vigila",ok?(es[i]?"personal "+(96+i%3)+"%":"cliente "+(91+i%6)+"%"):"persona");lb[i].el.style.opacity=ok?1:0});
        var k=R.filter(function(r){return r.estado!=="vigila"});K.contador("Personal en el local",String(k.filter(function(r){return r.estado==="staff"}).length));K.contador("Clientes en el local",String(k.filter(function(r){return r.estado==="cliente"}).length))}}});

  def({id:"derrames",grupo:1,nombre:"Detección de derrames",corta:"Avisa cuando el piso deja de estar limpio.",estado:"en validación",
    desc:"Cada cámara aprende cómo se ve su piso limpio. Si aparece un derrame, una mancha o basura y sigue ahí 45 segundos, avisa con el tipo y la ubicación.",
    video:{img:"evidencia/piso-alerta.jpg",chapa:"cámara real"},
    dur:16,camara:{pos:[8,8,10],mira:[0,0.3,0]},
    fases:[[0,"vigila","El piso limpio es la referencia"],[2.4,"detecta","Cae un envase y aparece un charco: empieza la espera"],[6.5,"alerta","Sigue ahí: aviso de derrame con su foto"],[12,"ok","Lo limpian y el evento se cierra solo"]],
    armar:function(K){tienda(K);K.camara([7,3,3],[0,0,-0.3],{id:"CAM PASILLO 2"});
      var ch=K.add(new THREE.Mesh(new THREE.CircleGeometry(1,40),K.std(0x8FB7D9,{transparent:true,opacity:0.7,roughness:0.03,metalness:0.3})));ch.rotation.x=-Math.PI/2;ch.position.set(1.6,0.012,0.6);ch.scale.setScalar(0.01);ch.castShadow=false;
      var env=K.prodBotella(0.045,0.3,0x2FA8C8);env.position.set(1.6,1.2,0.4);
      var cl=persona(K,{ruta:[[0,-6,1.4],[2,1.2,1],[4,6,1.6]]}),li=persona(K,{color:STAFF,ruta:[[0,7,-4],[8.8,7,-4],[11,2.6,0.8],[12.4,2.6,0.8,"agree",1.6,0.6],[16,7,4]]});
      var trap=new THREE.Group();K.add(trap);K.cil(0,0,0,0.015,0.015,1.3,K.mat.aceroOsc,trap);K.caja(0,0,0,0.4,0.04,0.08,K.std(0x8A929E),trap);K.caja(0,-0.06,0,0.42,0.06,0.1,K.std(0xB9BCC2,{roughness:1}),trap);trap.visible=false;
      cl.post=function(t){var a=ventana(t,1.4,2.3,0.4,0.3);if(a>0)K.ik(cl,"Right",K.local(cl,-0.25,1.0,0.3),a)};li.post=function(t){var a=ventana(t,11,13,0.5,0.5);if(a>0){K.ik(li,"Right",K.local(li,-0.15,0.95,0.55),a);K.ik(li,"Left",K.local(li,0.2,1.05,0.4),a);torso(K,li,0.2*a,0)}};
      var R=K.recuadro({raiz:ch,visible:true,alto:0.1,rot:0},{texto:"derrame",w:1.6,h:0.06,d:1.2,estado:"detecta"});R.visible=false;var e=reloj();
      return function(t){var k=suave((t-2.2)/1.2);if(t<2.0){var hp=K.manoPos(cl,"Right");env.position.set(hp.x,hp.y-0.05,hp.z)}else{env.position.y=lerp(1.2,0.012,(t-2.0)/0.4);env.rotation.z=t>2.1?1.45:0;env.position.x=1.6;env.position.z=0.4}ch.scale.setScalar(Math.max(0.01,0.75*k*(t>11.6?Math.max(0,1-(t-11.6)/0.8):1)));env.visible=t<12;
        trap.visible=t>11;if(trap.visible){var hp2=K.manoPos(li,"Right");trap.position.set(hp2.x,0.06,hp2.z+0.3);trap.rotation.y=li.rot}
        R.fijo=[1.6,0.01,0.6];R.visible=t>2.4&&t<12.4;R.set(t>6.5?"alerta":"detecta",t>6.5?"derrame · 45 s":"evaluando");e(t,6.5,"a",function(){K.evento("Derrame en pasillo 2","alerta")});e(t,12.4,"b",function(){K.evento("Pasillo 2 limpio · 6 min","")});
        K.contador("Tiempo sin incidencias hoy","97 %")}}});

  def({id:"guardian",grupo:1,nombre:"Guardián de puestos",corta:"Vigila que el puesto lo atienda la misma persona.",estado:"en validación",
    desc:"Avisa cuando alguien distinto ocupa un puesto con la sesión de otro, cuando la misma persona figura en dos puestos o cuando un puesto queda abierto sin nadie.",
    video:{src:"evidencia/guardian.mp4",poster:"evidencia/guardian-poster.jpg",chapa:"3 horas comprimidas"},
    dur:16,camara:{pos:[7,7,9],mira:[0,0.6,0]},
    fases:[[0,"vigila","Cada puesto con su titular y su sesión"],[4,"detecta","El titular se levanta: el puesto queda en espera"],[8,"alerta","Otra persona se sienta con la sesión abierta: aviso de relevo"]],
    armar:function(K){oficina(K);K.puesto(-2,-1.2,0);K.puesto(2,-1.2,0);K.puesto(-2,2.6,180);K.puesto(2,2.6,180);K.camara([0,2.6,2.6],[0,0.6,-1.6],{id:"CAM PUESTOS",fov:78});
      var a=persona(K,{color:0x5E9FB0,ruta:[[0,-2,-0.55,"idle",-2,-2],[4,-2,-0.55,"idle",-2,-2],[6,-5,2],[16,-6,3]]}),b=persona(K,{color:0xC98B6B,ruta:[[0,2,-0.55,"idle",2,-2]]}),c=persona(K,{color:0xB7A4D6,ruta:[[0,6,3],[6,6,3],[8,-2,-0.5,"idle",-2,-2],[16,-2,-0.5,"idle",-2,-2]]});
      function teclea(P,on){P.post=function(t){var w=on(t);if(w>0){K.ik(P,"Right",K.local(P,-0.14,0.86+Math.sin(t*9)*0.01,0.42),w);K.ik(P,"Left",K.local(P,0.14,0.86+Math.cos(t*8)*0.01,0.42),w);torso(K,P,0.1*w,0);cabeza(K,P,0,0.2*w)}}}
      teclea(a,function(t){return ventana(t,0,4.2,0.1,0.6)});teclea(b,function(t){return 1});teclea(c,function(t){return ventana(t,8.6,16,0.6,0.1)});
      var Ra=K.recuadro(a,{texto:"titular P1"}),Rb=K.recuadro(b,{texto:"titular P2",estado:"ok"}),Rc=K.recuadro(c,{texto:"persona"});var Z=K.zona([[-2.8,-0.3],[-1.2,-0.3],[-1.2,0.6],[-2.8,0.6]],{estado:"ok"});var e=reloj();
      return function(t){Ra.set(t>4?"vigila":"ok");Z.set(t>8?"alerta":(t>4?"detecta":"ok"),t>8);Rc.set(t>8?"alerta":"vigila",t>8?"no es el titular":"persona");
        e(t,4,"a",function(){K.evento("Puesto 1 en espera · titular ausente","")});e(t,8,"b",function(){K.evento("Relevo sin sesión propia · puesto 1","alerta")});K.contador("Puesto 1",t>8?"otra persona":(t>4?"en espera":"titular"));K.contador("Puesto 2","titular")}}});
})();
