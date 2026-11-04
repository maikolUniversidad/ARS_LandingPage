/* ---------- Motor 3D del portafolio de analíticas · versión 2 (Vigías, 21-oct-2026) ----------
   Un solo renderizador para toda la presentación: el lienzo se muda a la lámina que está en pantalla y ahí se arma su escena.
   Novedades de esta versión:
   · maqueta clara tipo estudio: fondo claro, sombras suaves y sombra de contacto bajo cada mueble;
   · obstáculos y navegación: todo mueble registra su huella y las personas calculan su camino rodeándolo (A* + suavizado);
   · caminata sin deslizar: la velocidad real de cada tramo manda sobre la animación;
   · ropa real sobre el maniquí (chaqueta, pantalón, calzado, gorra) con el mismo esqueleto;
   · kit de escenografía mucho más detallado (productos con etiqueta, botellas, latas, flejes, cajas registradoras, racks con estibas envueltas, autos, árboles…).
   Mundo: X a la derecha, Y arriba, Z hacia el espectador; metros. */
(function(){
  "use strict";
  if(!window.THREE||!THREE.OrbitControls||!THREE.GLTFLoader||!THREE.SkeletonUtils)return;
  var PI=Math.PI,RAD=PI/180;
  var COL={vigila:0x3B82F6,detecta:0xF59E0B,alerta:0xE5484D,ok:0x22A06B,oro:0xD6AB4C,marino:0x001441,staff:0xF2C94C,cliente:0x2BB5E0};
  var HEX=function(c){return"#"+("000000"+c.toString(16)).slice(-6)};
  var M=window.MOTOR={COL:COL,listo:false,version:2,cargando:false};
  THREE.DefaultLoadingManager.onStart=function(){M.cargando=true};THREE.DefaultLoadingManager.onLoad=function(){M.cargando=false};THREE.DefaultLoadingManager.onError=function(){M.cargando=false};
  var lento=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var semilla=1;function rnd(){semilla=(semilla*16807)%2147483647;return(semilla-1)/2147483646}
  function rndEntre(a,b){return a+(b-a)*rnd()}

  var R=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance",preserveDrawingBuffer:!!window.__PRUEBA});
  R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.0;
  R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.setScissorTest(false);R.autoClear=false;R.physicallyCorrectLights=false;
  var lienzo=R.domElement;lienzo.className="gl";
  var scene=new THREE.Scene();scene.background=new THREE.Color(0xE3E8F1);
  try{var pm=new THREE.PMREMGenerator(R);pm.compileEquirectangularShader();scene.environment=pm.fromScene(new THREE.RoomEnvironment(),0.04).texture;
    if(THREE.RGBELoader)new THREE.RGBELoader().setDataType(THREE.UnsignedByteType).load("texturas/brown_photostudio_02_1k.hdr",function(hdr){scene.environment=pm.fromEquirectangular(hdr).texture;hdr.dispose()},undefined,function(){})}catch(e){}
  var hemi=new THREE.HemisphereLight(0xFFFFFF,0xB7C2D8,0.48);scene.add(hemi);
  var sol=new THREE.DirectionalLight(0xFFF4E4,1.55);sol.position.set(-10,18,12);sol.castShadow=true;sol.shadow.mapSize.set(2048,2048);
  var sc=sol.shadow.camera;sc.left=-18;sc.right=18;sc.top=18;sc.bottom=-18;sc.near=1;sc.far=70;sol.shadow.bias=-0.00035;sol.shadow.normalBias=0.025;sol.shadow.radius=3;scene.add(sol);
  var relleno=new THREE.DirectionalLight(0xCFE0FF,0.32);relleno.position.set(14,9,-8);scene.add(relleno);
  (function(){var s=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.ShadowMaterial({opacity:0.16}));s.rotation.x=-PI/2;s.position.y=-0.66;s.receiveShadow=true;scene.add(s)})();
  var mundo=new THREE.Group();scene.add(mundo);
  var camara=new THREE.PerspectiveCamera(34,16/9,0.1,200);
  var cctv=new THREE.PerspectiveCamera(70,16/9,0.1,80);
  var controles=new THREE.OrbitControls(camara,lienzo);controles.enableDamping=true;controles.dampingFactor=0.08;controles.enablePan=false;controles.minDistance=3;controles.maxDistance=40;controles.maxPolarAngle=PI*0.47;

  var cacheMat={};
  function std(c,o){o=o||{};var k=c+"|"+JSON.stringify(o);if(cacheMat[k])return cacheMat[k];var m=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.72,metalness:0.02,envMapIntensity:0.55},o));m.color.convertSRGBToLinear();if(o.emissive!=null)m.emissive.convertSRGBToLinear();m._comp=true;return cacheMat[k]=m}
  function tex(w,h,fn){var c=document.createElement("canvas");c.width=w;c.height=h;fn(c.getContext("2d"),w,h);var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t}
  function ruido(x,w,h,n,a,claro){for(var i=0;i<n;i++){x.fillStyle="rgba("+(claro?"255,255,255":"20,24,32")+","+(Math.random()*a)+")";x.fillRect(Math.random()*w,Math.random()*h,2,2)}}
  var TX={};
  TX.baldosa=tex(512,512,function(x,w,h){x.fillStyle="#D9D6CF";x.fillRect(0,0,w,h);for(var i=0;i<4;i++)for(var j=0;j<4;j++){x.fillStyle="hsl(38,9%,"+(88+Math.random()*4)+"%)";x.fillRect(i*128+2,j*128+2,124,124)}ruido(x,w,h,2500,0.05,false);ruido(x,w,h,2500,0.25,true)});
  TX.baldosa.wrapS=TX.baldosa.wrapT=THREE.RepeatWrapping;
  TX.concreto=tex(512,512,function(x,w,h){x.fillStyle="#B4B8BF";x.fillRect(0,0,w,h);ruido(x,w,h,7000,0.09,false);ruido(x,w,h,5000,0.12,true);x.strokeStyle="rgba(60,65,75,.22)";x.lineWidth=3;x.strokeRect(0,0,w,h)});
  TX.concreto.wrapS=TX.concreto.wrapT=THREE.RepeatWrapping;
  TX.asfalto=tex(512,512,function(x,w,h){x.fillStyle="#454951";x.fillRect(0,0,w,h);ruido(x,w,h,9000,0.07,true);ruido(x,w,h,3000,0.2,false)});
  TX.asfalto.wrapS=TX.asfalto.wrapT=THREE.RepeatWrapping;
  TX.pasto=tex(256,256,function(x,w,h){x.fillStyle="#6E9E52";x.fillRect(0,0,w,h);for(var i=0;i<3500;i++){x.fillStyle="hsl("+(85+Math.random()*25)+",40%,"+(30+Math.random()*25)+"%)";x.fillRect(Math.random()*w,Math.random()*h,1.5,3)}});
  TX.pasto.wrapS=TX.pasto.wrapT=THREE.RepeatWrapping;
  TX.madera=tex(256,256,function(x,w,h){x.fillStyle="#B98B5E";x.fillRect(0,0,w,h);for(var i=0;i<40;i++){x.strokeStyle="rgba(90,55,25,"+(0.08+Math.random()*0.12)+")";x.lineWidth=1+Math.random()*2;x.beginPath();var y=Math.random()*h;x.moveTo(0,y);x.bezierCurveTo(w*.3,y+8,w*.6,y-8,w,y+3);x.stroke()}});
  TX.madera.wrapS=TX.madera.wrapT=THREE.RepeatWrapping;
  TX.alfombra=tex(256,256,function(x,w,h){x.fillStyle="#9AA3B4";x.fillRect(0,0,w,h);x.fillStyle="#8F99AB";x.fillRect(0,0,128,128);x.fillRect(128,128,128,128);ruido(x,w,h,4000,0.1,false)});
  TX.alfombra.wrapS=TX.alfombra.wrapT=THREE.RepeatWrapping;
  TX.carton=tex(256,256,function(x,w,h){x.fillStyle="#C9A06A";x.fillRect(0,0,w,h);ruido(x,w,h,2500,0.08,false);x.strokeStyle="rgba(80,50,20,.35)";x.lineWidth=3;x.strokeRect(0,0,w,h);x.fillStyle="rgba(80,50,20,.5)";x.fillRect(30,40,120,14);x.fillRect(30,66,80,10);x.strokeStyle="rgba(80,50,20,.6)";x.lineWidth=2;for(var i=0;i<14;i++){x.beginPath();x.moveTo(170+i*5,160);x.lineTo(170+i*5,200);x.stroke()}});
  TX.fleje=tex(512,64,function(x,w,h){x.fillStyle="#E9E7E0";x.fillRect(0,0,w,h);for(var i=0;i<4;i++){x.fillStyle="#fff";x.fillRect(i*128+6,6,116,52);x.fillStyle="#0A1330";x.font="700 26px Archivo,Arial";x.textAlign="left";x.fillText("$ "+[4900,12500,7200,3600][i].toLocaleString("es-CO"),i*128+12,42);x.fillStyle="#D6AB4C";x.fillRect(i*128+6,6,116,8)}});
  TX.fleje.wrapS=THREE.RepeatWrapping;
  TX.film=tex(128,128,function(x,w,h){x.fillStyle="rgba(255,255,255,.65)";x.fillRect(0,0,w,h);for(var i=0;i<12;i++){x.fillStyle="rgba(255,255,255,"+(0.1+Math.random()*0.3)+")";x.fillRect(0,i*11,w,4)}});
  var MARCAS=["NUTRI","FRESKA","ANDINA","CAMPO","DELTA","ORO","SOL","VITA","NORTE","LUNA","PRIMA","AZUL","MAXI","BRISA"];
  var SABORES=["Original","Natural","Clásico","Limón","Picante","Chocolate","Vainilla","Fresa","Integral","Familiar","Light","Extra","Queso","Miel"];
  var PESOS=["150 g","500 g","1 kg","250 g","400 g","75 g","350 ml","500 ml","1,5 L","200 g","330 ml","600 g","90 g","2 L"];
  var LABELS=[],LABELS_BOLSA=[];
  function barras(x,px,py,w,h){x.fillStyle="#fff";x.fillRect(px,py,w,h);x.fillStyle="#111";for(var k=0;k<Math.floor(w/3);k++)x.fillRect(px+3+k*3,py+3,k%3?1:1.8,h-6)}
  function etiquetaTex(i){if(LABELS[i])return LABELS[i];var hue=(i*47)%360,t=tex(256,256,function(x,w,h){var g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"hsl("+hue+",62%,"+(i%3?50:36)+"%)");g.addColorStop(1,"hsl("+hue+",58%,"+(i%3?38:26)+"%)");x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle="rgba(255,255,255,.14)";x.beginPath();x.ellipse(w*0.5,h*0.56,w*0.52,h*0.22,0,0,6.3);x.fill();
    x.fillStyle=i%2?"#fff":"hsl("+((hue+40)%360)+",70%,88%)";x.fillRect(0,46,w,70);x.fillStyle="#0A1330";x.font="900 42px Archivo,Arial";x.textAlign="center";x.fillText(MARCAS[i%MARCAS.length],w/2,98);
    x.fillStyle="rgba(255,255,255,.92)";x.font="700 22px Archivo,Arial";x.fillText(SABORES[i%SABORES.length].toUpperCase(),w/2,146);
    x.fillStyle="hsl("+((hue+180)%360)+",60%,55%)";x.beginPath();x.arc(w*0.5,h*0.74,34,0,6.3);x.fill();x.fillStyle="rgba(255,255,255,.9)";x.beginPath();x.arc(w*0.5-8,h*0.74-8,12,0,6.3);x.fill();
    x.fillStyle="#fff";x.font="800 18px Archivo,Arial";x.textAlign="right";x.fillText(PESOS[i%PESOS.length],w-12,h-14);barras(x,12,h-44,70,30);x.fillStyle="rgba(0,0,0,.18)";x.fillRect(0,h-6,w,6)});return LABELS[i]=t}
  function etiquetaBolsa(i){if(LABELS_BOLSA[i])return LABELS_BOLSA[i];var hue=(i*71+20)%360,t=tex(256,320,function(x,w,h){var g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,"hsl("+hue+",75%,48%)");g.addColorStop(0.55,"hsl("+hue+",80%,40%)");g.addColorStop(1,"hsl("+((hue+25)%360)+",70%,30%)");x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle="rgba(255,255,255,.18)";x.beginPath();x.moveTo(0,0);x.lineTo(w*0.45,0);x.lineTo(w*0.15,h);x.lineTo(0,h);x.fill();
    x.save();x.translate(w/2,h*0.3);x.rotate(-0.12);x.fillStyle="#FFD100";x.font="900 46px Archivo,Arial";x.textAlign="center";x.strokeStyle="#4a1a00";x.lineWidth=6;x.strokeText(MARCAS[(i+5)%MARCAS.length],0,0);x.fillText(MARCAS[(i+5)%MARCAS.length],0,0);x.restore();
    x.fillStyle="#fff";x.font="800 20px Archivo,Arial";x.textAlign="center";x.fillText(SABORES[(i+3)%SABORES.length].toUpperCase(),w/2,h*0.42);
    x.fillStyle="#E9C46A";x.beginPath();x.ellipse(w*0.5,h*0.66,74,52,0,0,6.3);x.fill();for(var k=0;k<9;k++){x.fillStyle="hsl(42,80%,"+(58+(k%3)*8)+"%)";x.beginPath();x.ellipse(w*0.5+Math.cos(k*2.1)*34,h*0.66+Math.sin(k*2.1)*22,22,13,k*0.7,0,6.3);x.fill()}
    x.fillStyle="#fff";x.font="800 18px Archivo,Arial";x.textAlign="right";x.fillText(PESOS[(i*3)%PESOS.length],w-12,h-16);barras(x,12,h-46,66,30)});return LABELS_BOLSA[i]=t}
  /* ---------------- texturas PBR reales (ambientCG, CC0): color + normales + rugosidad (+ oclusión) ----------------
     Cada textura cubre `metros` de lado; el material se pide con el tamaño de la pieza y se repite lo justo. */
  var TEXDIR="texturas/",cacheTex={},cachePbr={};
  var PBRS={tiles:["Tiles107",6],damero:["Tiles074",1.2],mosaico:["Tiles036",1.2],concreto:["Concrete034",3],asfalto:["Asphalt012",3],pasto:["Grass004",2,true],maderaPiso:["WoodFloor051",2,true],alfombra:["Carpet013",1.5,true],
    carton:["Cardboard004",0.6],metal:["Metal032",1],placas:["MetalPlates006",1],yeso:["PaintedPlaster017",2.5],goma:["Rubber004",0.6],cuero:["Leather037",0.8],madera:["Wood062",1.2,true],tela:["Fabric030",0.6,true],plastico:["Plastic010",0.6]};
  function cargarTex(ruta,srgb,rx,rz){var k=ruta+"|"+rx+"|"+rz;if(cacheTex[k])return cacheTex[k];var t=new THREE.TextureLoader().load(ruta);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.repeat.set(rx||1,rz||1);if(srgb)t.encoding=THREE.sRGBEncoding;t._comp=true;return cacheTex[k]=t}
  function pbr(nombre,o){o=o||{};var P=PBRS[nombre];if(!P)return std(o.color!=null?o.color:0xffffff,o);var w=o.w||P[1],d=o.d||P[1],rx=w/P[1],rz=d/P[1],k=nombre+"|"+rx.toFixed(2)+"|"+rz.toFixed(2)+"|"+JSON.stringify([o.color,o.roughness,o.metalness,o.env,o.normal,o.transparent,o.opacity]);
    if(cachePbr[k])return cachePbr[k];var base=TEXDIR+P[0]+"/"+P[0]+"_1K-JPG_";
    var m=new THREE.MeshStandardMaterial({color:o.color!=null?o.color:0xffffff,roughness:o.roughness!=null?o.roughness:1,metalness:o.metalness||0,envMapIntensity:o.env!=null?o.env:0.6,
      map:cargarTex(base+"Color.jpg",true,rx,rz),normalMap:cargarTex(base+"NormalGL.jpg",false,rx,rz),roughnessMap:cargarTex(base+"Roughness.jpg",false,rx,rz),transparent:!!o.transparent,opacity:o.opacity!=null?o.opacity:1,side:o.side||THREE.FrontSide});
    m.normalScale=new THREE.Vector2(o.normal||1,o.normal||1);if(o.color!=null)m.color.convertSRGBToLinear();m._comp=true;m._pbrNombre=nombre;m._pbrOpc=o;return cachePbr[k]=m}
  var MT={
    piso:pbr("tiles",{roughness:1,env:0.55}),concreto:pbr("concreto"),asfalto:pbr("asfalto"),pasto:pbr("pasto"),
    alfombra:pbr("alfombra"),muro:pbr("yeso",{color:0xF3F1EC}),muroAzul:pbr("yeso",{color:0x1E3A6E}),borde:std(0xCDD4E0,{roughness:0.55}),blanco:pbr("plastico",{color:0xF6F6F4,roughness:0.9}),negro:pbr("plastico",{color:0x1C1E22,roughness:0.9}),
    acero:pbr("metal",{color:0xC9CDD4,metalness:0.85,roughness:0.6,env:1}),aceroOsc:pbr("metal",{color:0x5A6068,metalness:0.75,roughness:0.7,env:0.8}),madera:pbr("maderaPiso"),
    vidrio:std(0xC9E0F2,{transparent:true,opacity:0.26,roughness:0.05,metalness:0.1,depthWrite:false}),pantalla:std(0x0E1626,{emissive:0x1E4FA8,emissiveIntensity:0.6,roughness:0.3}),
    naranja:pbr("plastico",{color:0xE0782A,roughness:0.8}),rojo:pbr("plastico",{color:0xC8342B,roughness:0.8}),amarillo:pbr("plastico",{color:0xF2C230,roughness:0.8}),verde:pbr("plastico",{color:0x3E8E5A,roughness:0.8}),azul:pbr("plastico",{color:0x2F64C8,roughness:0.8}),
    carton:pbr("carton"),estiba:pbr("madera",{color:0xC9A77A}),
    goma:pbr("goma",{color:0x2A2C30}),cromo:std(0xDDE2E8,{metalness:1,roughness:0.15}),hoja:std(0x3F7D3A,{roughness:0.8}),maceta:pbr("concreto",{color:0x7A5A43}),
    vidrioAuto:std(0x1A2533,{roughness:0.08,metalness:0.5}),luzRoja:std(0xff3b30,{emissive:0xff2a1e,emissiveIntensity:1.2}),film:std(0xffffff,{map:TX.film,transparent:true,opacity:0.5,roughness:0.25,metalness:0.1,depthWrite:false}),
    led:std(0xFFFFFF,{emissive:0xFFF6E0,emissiveIntensity:1.4,roughness:0.4}),tela:pbr("tela",{color:0x8A6A48}),cuero:pbr("cuero",{color:0x2B3038}),placas:pbr("placas")
  };
  var PROD=[0xD94F3D,0x2F7BEA,0xF2C230,0x3EA66B,0xE8E2D5,0x8E5BC8,0xF08A2E,0x1E9AA8,0xC2185B,0x6D8B30];

  function add(o,p){(p||mundo).add(o);return o}
  function mesh(g,m,p){var o=new THREE.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;return add(o,p)}
  function caja(x,y,z,w,h,d,m,p,ry){var o=mesh(new THREE.BoxGeometry(w,h,d),typeof m==="number"?std(m):m,p);o.position.set(x,y+h/2,z);if(ry)o.rotation.y=ry;return o}
  function cil(x,y,z,r1,r2,h,m,p,n){var o=mesh(new THREE.CylinderGeometry(r1,r2,h,n||24),typeof m==="number"?std(m):m,p);o.position.set(x,y+h/2,z);return o}
  function grupo(x,z,ry,p){var g=new THREE.Group();g.position.set(x||0,0,z||0);g.rotation.y=(ry||0)*RAD;return add(g,p)}
  function linea(pts,color,p,ancho){var g=new THREE.BufferGeometry().setFromPoints(pts.map(function(q){return new THREE.Vector3(q[0],q[1],q[2])}));var l=new THREE.Line(g,new THREE.LineBasicMaterial({color:color,transparent:true,opacity:0.95,linewidth:ancho||1}));return add(l,p)}
  var TXsombra=tex(128,128,function(x,w,h){var g=x.createRadialGradient(64,64,10,64,64,64);g.addColorStop(0,"rgba(0,0,0,.55)");g.addColorStop(0.6,"rgba(0,0,0,.22)");g.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g;x.fillRect(0,0,w,h)});
  var MTsombra=new THREE.MeshBasicMaterial({map:TXsombra,transparent:true,depthWrite:false,opacity:0.9});
  function sombra(x,z,w,d,p,y){var s=new THREE.Mesh(new THREE.PlaneGeometry(w*1.25,d*1.25),MTsombra);s.rotation.x=-PI/2;s.position.set(x,y||0.006,z);s.renderOrder=1;s.receiveShadow=false;s.castShadow=false;s.userData.sinObst=true;(p||mundo).add(s);return s}
  function obst(o){o.userData.obst=true;return o}

  var K={};
  function aMedida(m,w,d){if(!m||!m._pbr&&!m.map)return m;if(m._pbrNombre)return pbr(m._pbrNombre,Object.assign({},m._pbrOpc,{w:w,d:d}));
    var mm=m.clone();if(m.map){mm.map=m.map.clone();mm.map.needsUpdate=true;mm.map.repeat.set(w/2.4,d/2.4)}return mm}
  Object.keys(PBRS).forEach(function(n){});
  K.pbr=function(n,o){return pbr(n,o)};K.aMedida=aMedida;
  K.piso=function(w,d,m,rep){var t=(m||MT.piso),mm=aMedida(t,w,d);if(!t._pbrNombre&&t.map&&rep){mm=t.clone();mm.map=t.map.clone();mm.map.needsUpdate=true;mm.map.repeat.set(w/rep,d/rep)}
    var o=caja(0,-0.6,0,w,0.6,d,MT.borde);o.castShadow=true;var s=mesh(new THREE.PlaneGeometry(w,d),mm);s.rotation.x=-PI/2;s.position.y=0.002;E.piso={w:w,d:d};return s};
  K.parche=function(x,z,w,d,m,rep,y){var mm=aMedida(m,w,d);if(!m._pbrNombre&&m.map&&rep){mm=m.clone();mm.map=m.map.clone();mm.map.needsUpdate=true;mm.map.repeat.set(w/rep,d/rep)}var s=mesh(new THREE.PlaneGeometry(w,d),mm);s.rotation.x=-PI/2;s.position.set(x,y||0.004,z);s.castShadow=false;return s};
  K.muro=function(x1,z1,x2,z2,h,m,e){var l=Math.hypot(x2-x1,z2-z1),mt=m||MT.muro;if(mt._pbrNombre)mt=aMedida(mt,l,h||2.6);var o=caja((x1+x2)/2,0,(z1+z2)/2,l,h||2.6,e||0.16,mt);o.rotation.y=-Math.atan2(z2-z1,x2-x1);obst(o);return o};
  K.caja=function(x,y,z,w,h,d,m,ry){var o;if(ry&&ry.isObject3D)o=caja(x,y,z,w,h,d,m||MT.carton,ry,0);else o=caja(x,y,z,w,h,d,m||MT.carton,null,ry);if(w*d>=0.12&&h>=0.35&&y<0.3)obst(o);return o};
  K.mat=MT;K.std=std;K.tex=tex;K.cil=cil;K.grupo=grupo;K.linea3=linea;K.add=add;K.sombra=sombra;K.obst=obst;K.rnd=rnd;K.etiquetaTex=etiquetaTex;
  K.planta=function(x,z,s){s=s||1;var g=grupo(x,z);obst(g);cil(0,0,0,0.2*s,0.15*s,0.36*s,MT.maceta,g);cil(0,0.33*s,0,0.18*s,0.18*s,0.03*s,std(0x3A2A1E),g);
    for(var i=0;i<11;i++){var a=i*2.39,l=(0.45+rnd()*0.4)*s;var h=mesh(new THREE.ConeGeometry(0.07*s,l,6),std(0x3F7D3A+((i%3)*0x0A1206),{roughness:0.8}),g);h.position.set(Math.cos(a)*0.08*s,0.36*s+l/2*0.9,Math.sin(a)*0.08*s);h.rotation.z=Math.cos(a)*0.55;h.rotation.x=-Math.sin(a)*0.55;h.scale.set(1,1,0.35)}
    sombra(0,0,0.5*s,0.5*s,g);return g};
  function matEtiqueta(i,base){var k="etq"+i+"|"+base;if(cacheMat[k])return cacheMat[k];var lado=pbr("carton",{color:base,roughness:0.85,w:0.3,d:0.3}),fr=new THREE.MeshStandardMaterial({map:etiquetaTex(i),roughness:0.42,envMapIntensity:0.5});fr._comp=true;return cacheMat[k]=[lado,lado,lado,lado,fr,lado]}
  K.prodCaja=function(w,h,d,i,p){var o=mesh(new THREE.BoxGeometry(w,h,d),matEtiqueta(i,PROD[i%PROD.length]),p);return o};
  var GEOB={};
  function geoBotella(r,h){var k=r+"|"+h;if(GEOB[k])return GEOB[k];var pts=[];[[0,0],[r*0.85,0],[r,0.06],[r,0.62],[r*0.8,0.72],[r*0.45,0.8],[r*0.4,0.98],[0.0,0.98]].forEach(function(q){pts.push(new THREE.Vector2(q[0],q[1]*h))});return GEOB[k]=new THREE.LatheGeometry(pts,18)}
  var cacheFis={};
  function plasticoBrillante(color){var k="pb"+color;if(cacheFis[k])return cacheFis[k];var m=new THREE.MeshPhysicalMaterial({color:color,roughness:0.12,metalness:0.0,clearcoat:1,clearcoatRoughness:0.08,transparent:true,opacity:0.9,envMapIntensity:0.9});m.color.convertSRGBToLinear();m._comp=true;return cacheFis[k]=m}
  var cachePET=null;function matPET(){if(cachePET)return cachePET;var m=new THREE.MeshPhysicalMaterial({color:0xEAF4FF,roughness:0.06,metalness:0,transmission:0.0,transparent:true,opacity:0.32,clearcoat:1,clearcoatRoughness:0.05,envMapIntensity:1.1,depthWrite:false});m._comp=true;return cachePET=m}
  var cacheLiq={};function matLiquido(color){var k="lq"+color;if(cacheLiq[k])return cacheLiq[k];var m=new THREE.MeshPhysicalMaterial({color:color,roughness:0.2,metalness:0,transparent:true,opacity:0.82,envMapIntensity:0.6});m.color.convertSRGBToLinear();m._comp=true;return cacheLiq[k]=m}
  var cacheEtqMat={};function matEtqBanda(i,bolsa){var k=(bolsa?"b":"e")+i;if(cacheEtqMat[k])return cacheEtqMat[k];var m=new THREE.MeshStandardMaterial({map:bolsa?etiquetaBolsa(i):etiquetaTex(i),roughness:0.45,envMapIntensity:0.5,side:THREE.DoubleSide});m._comp=true;return cacheEtqMat[k]=m}
  K.prodBotella=function(r,h,color,p,tapa){var g=new THREE.Group();(p||mundo).add(g);var liq=mesh(geoBotella(r*0.93,h*0.68),matLiquido(color),g);liq.position.y=h*0.02;var b=mesh(geoBotella(r,h),matPET(),g);b.castShadow=true;b.renderOrder=2;
    var t=cil(0,h*0.97,0,r*0.44,r*0.44,h*0.08,std(tapa||[0xC8342B,0x2F64C8,0xF4F4F2,0x1C1E22][(color>>4)%4],{roughness:0.35}),g);cil(0,h*0.94,0,r*0.5,r*0.5,h*0.012,std(0xF4F4F2,{roughness:0.5}),g);
    var e=mesh(new THREE.CylinderGeometry(r*1.012,r*1.012,h*0.3,18,1,true),matEtqBanda((color>>8)%14,false),g);e.position.y=h*0.36;e.castShadow=false;return g};
  var geoAnilla=null;
  K.prodLata=function(r,h,i,p){var g=new THREE.Group();(p||mundo).add(g);var m=[new THREE.MeshStandardMaterial({map:etiquetaTex(i),roughness:0.28,metalness:0.6,envMapIntensity:1.1}),MT.cromo,MT.cromo];m[0]._comp=true;var o=mesh(new THREE.CylinderGeometry(r*0.97,r*0.97,h-0.012,20),m,g);o.position.y=h/2;
    [0.006,h-0.006].forEach(function(y){var b=mesh(new THREE.CylinderGeometry(r,r,0.012,20),MT.cromo,g);b.position.y=y});var tapa=mesh(new THREE.CylinderGeometry(r*0.9,r*0.9,0.004,20),std(0xC9CDD4,{metalness:0.9,roughness:0.3}),g);tapa.position.y=h;
    if(!geoAnilla)geoAnilla=new THREE.TorusGeometry(r*0.3,r*0.05,6,14);var an=mesh(geoAnilla,MT.cromo,g);an.rotation.x=PI/2;an.position.set(0,h+0.003,-r*0.15);an.castShadow=false;return g};
  var cacheBolsaMat={};
  function matBolsa(i){var k="bm"+i;if(cacheBolsaMat[k])return cacheBolsaMat[k];var fr=new THREE.MeshPhysicalMaterial({map:etiquetaBolsa(i),roughness:0.38,metalness:0.45,clearcoat:0.6,clearcoatRoughness:0.3,envMapIntensity:0.9});fr._comp=true;
    var lado=new THREE.MeshPhysicalMaterial({color:new THREE.Color("hsl("+((i*71+20)%360)+",75%,42%)").convertSRGBToLinear(),roughness:0.4,metalness:0.45,clearcoat:0.5,envMapIntensity:0.9});lado._comp=true;return cacheBolsaMat[k]=[lado,lado,lado,lado,fr,fr]}
  K.prodBolsa=function(w,h,d,i,p){var o=mesh(new THREE.BoxGeometry(w,h,d,6,10,3),matBolsa(i),p);var pos=o.geometry.attributes.position,s1=rnd()*9,s2=rnd()*9;
    for(var k=0;k<pos.count;k++){var x=pos.getX(k),y=pos.getY(k),z=pos.getZ(k),u=Math.abs(y)/(h/2);
      var inf=1-Math.pow(u,3.2),sello=u>0.86?(1-(u-0.86)/0.14):1;var fz=0.12+0.88*inf*sello,fx=0.78+0.22*inf;
      var arruga=(Math.sin(x*95+s1+y*40)*Math.cos(y*70+s2)+Math.sin((x+y)*130+s2))*0.0028*inf;
      pos.setX(k,x*fx+arruga*0.5);pos.setZ(k,z*fz+(z>0?1:-1)*arruga);if(u>0.86)pos.setY(k,y*(0.98+0.02*Math.sin(x*200+s1)))}
    o.geometry.computeVertexNormals();return o};
  var GOND=[];
  K.gondola=function(x,z,largo,ry,o){o=o||{};var g=grupo(x,z,ry);obst(g);var niv=o.niveles||4,h=o.alto||1.8,an=o.ancho||0.9,slots=[],fam=o.familias||["cajas","botellas","latas","bolsas","cajas"],est=pbr("plastico",{color:o.color_estructura||0xE9EBEE,roughness:0.7,w:1,d:1});
    caja(0,0,0,largo,0.1,an,MT.aceroOsc,g);caja(0,0,0,largo,h,0.05,est,g);[-largo/2,largo/2].forEach(function(xx){caja(xx,0,0,0.05,h+0.08,an,est,g)});caja(0,h,0,largo+0.02,0.06,an,std(0xDADDE2),g);
    g.userData.gondola={largo:largo,an:an,h:h,unaCara:!!o.unaCara};GOND.push(g);
    for(var n=0;n<niv;n++){var y=0.14+n*(h-0.22)/niv,alturaNivel=(h-0.22)/niv;[-1,1].forEach(function(cara){if(o.unaCara&&cara<0)return;caja(0,y,cara*an/4,largo,0.03,an/2-0.03,MT.acero,g);
      var f=o.color!=null?"color":fam[(n+(cara>0?0:2))%fam.length],i=0,xx=-largo/2+0.08,tope=largo/2-0.08;
      while(true){var idx=slots.length,col=PROD[(n*3+i+(cara>0?0:5))%PROD.length],w,pr,hh;
        var wSig=f==="botellas"?0.16:(f==="latas"?0.15:(f==="bolsas"?0.22:0.2+((i*7+n)%3)*0.04));if(xx+wSig>tope)break;
        if(f==="botellas"){w=0.16;hh=Math.min(0.34,alturaNivel-0.08);pr=new THREE.Group();g.add(pr);[0,1].forEach(function(k){K.prodBotella(0.045,hh,PROD[(n+i+k)%PROD.length],pr).position.set(0,0,(k-0.5)*0.17)});pr.position.set(xx+w/2,y+0.03,cara*an/4)}
        else if(f==="latas"){w=0.15;hh=Math.min(0.14,alturaNivel-0.1);pr=new THREE.Group();g.add(pr);[0,1].forEach(function(k){var l=K.prodLata(0.04,hh,(n*2+i)%14,pr);l.position.set(0,0,(k-0.5)*0.16)});if(hh<alturaNivel-0.26){[0,1].forEach(function(k){var l=K.prodLata(0.04,hh,(n*2+i)%14,pr);l.position.set(0,hh+0.004,(k-0.5)*0.16)})}pr.position.set(xx+w/2,y+0.03,cara*an/4)}
        else if(f==="bolsas"){w=0.22;hh=Math.min(0.3,alturaNivel-0.08);pr=new THREE.Group();g.add(pr);[0,1].forEach(function(k){var b=K.prodBolsa(w-0.03,hh,0.09,(n*3+i)%14,pr);b.position.set(0,hh/2,(k-0.5)*0.17);b.rotation.y=(k?-1:1)*0.08+(rnd()-0.5)*0.12;b.rotation.x=-0.08});pr.position.set(xx+w/2,y+0.03,cara*an/4)}
        else{w=0.2+((i*7+n)%3)*0.04;hh=Math.min(0.2+((i*5+n)%3)*0.05,alturaNivel-0.08);pr=new THREE.Group();g.add(pr);var cc=o.color!=null?o.color:col;[0,1].forEach(function(k){var b=mesh(new THREE.BoxGeometry(w-0.03,hh,0.14),o.color!=null?std(cc,{roughness:0.55}):matEtiqueta((n*4+i)%14,cc),pr);b.position.set(0,hh/2,(k-0.5)*0.18)});pr.position.set(xx+w/2,y+0.03,cara*an/4)}
        if(cara<0)pr.rotation.y=PI;pr.userData={n:n,i:i,cara:cara,w:w,h:hh};pr.position.y=y+0.03;slots.push(pr);xx+=w+0.012;i++}})}
    (o.huecos||[]).forEach(function(i){if(slots[i])slots[i].visible=false});
    if(o.fleje!==false)for(n=0;n<niv;n++){[-1,1].forEach(function(cara){if(o.unaCara&&cara<0)return;var mm=new THREE.MeshStandardMaterial({map:TX.fleje.clone(),roughness:0.5});mm.map.needsUpdate=true;mm.map.repeat.set(largo/0.5,1);var fl=mesh(new THREE.BoxGeometry(largo,0.05,0.012),[MT.blanco,MT.blanco,MT.blanco,MT.blanco,mm,MT.blanco],g);fl.position.set(0,0.14+n*(h-0.22)/niv+0.005,cara*(an/2-0.005));if(cara<0)fl.rotation.y=PI})}
    if(o.letrero){var lt=K.cartel(0,h+0.28,0,Math.min(largo,1.8),0.32,o.letrero,"#001441","#F1F3F8",0,g);caja(0,h,0,0.03,0.14,0.03,MT.aceroOsc,g)}
    sombra(0,0,largo,an,g);g.userData.slots=slots;g.userData.largo=largo;return g};
  K.exhibidor=function(x,z,i,ry){var g=grupo(x,z,ry);obst(g);var c=std(0xE9EBEE,{roughness:0.6});caja(0,0,0,1,0.06,1,MT.aceroOsc,g);[[0,-0.49],[0,0.49]].forEach(function(p){caja(p[0],0,p[1],1,0.62,0.02,c,g)});[[-0.49,0],[0.49,0]].forEach(function(p){caja(p[0],0,p[1],0.02,0.62,1,c,g)});
    for(var k=0;k<14;k++){var b=K.prodBolsa(0.2,0.26,0.1,(i+k)%14,g);b.position.set(rndEntre(-0.35,0.35),0.2+Math.floor(k/7)*0.2,rndEntre(-0.35,0.35));b.rotation.set(rndEntre(-0.4,0.4),rndEntre(0,3.1),rndEntre(-0.6,0.6))}
    K.cartel(0,0.78,0.52,0.9,0.22,"OFERTA","#D6AB4C","#001441",0,g);sombra(0,0,1,1,g);return g};
  K.canastas=function(x,z,n){var g=grupo(x,z);obst(g);for(var k=0;k<(n||6);k++){var c=mesh(new THREE.BoxGeometry(0.46,0.07,0.32),std(k%2?0xD94F3D:0x2F64C8,{roughness:0.55}),g);c.position.y=0.04+k*0.075;var a=caja(0,0.04+k*0.075,0,0.44,0.2,0.3,std(k%2?0xD94F3D:0x2F64C8,{transparent:true,opacity:0.35,roughness:0.5,depthWrite:false}),g)}caja(0,0,0,0.5,0.05,0.36,MT.aceroOsc,g);sombra(0,0,0.5,0.4,g);return g};
  K.carrito=function(x,z,ry){var g=grupo(x,z,ry);obst(g);var mt=std(0xB7BDC6,{metalness:0.7,roughness:0.3});var cuerpo=mesh(new THREE.BoxGeometry(0.58,0.46,0.92),std(0xC6CCD4,{metalness:0.6,roughness:0.35,transparent:true,opacity:0.55,depthWrite:false}),g);cuerpo.position.y=0.62;
    var ar=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.58,0.46,0.92)),new THREE.LineBasicMaterial({color:0x6B7280}));ar.position.y=0.62;g.add(ar);
    [[-0.26,-0.4],[0.26,-0.4],[-0.26,0.4],[0.26,0.4]].forEach(function(p){cil(p[0],0,p[1],0.045,0.045,0.07,MT.goma,g);var pata=mesh(new THREE.CylinderGeometry(0.012,0.012,0.36,8),mt,g);pata.position.set(p[0],0.25,p[1])});
    caja(0,0.32,0,0.56,0.02,0.9,mt,g);var man=mesh(new THREE.CylinderGeometry(0.014,0.014,0.6,8),std(0xC8342B,{roughness:0.4}),g);man.rotation.z=PI/2;man.position.set(0,0.98,0.5);[-0.27,0.27].forEach(function(xx){var b=mesh(new THREE.CylinderGeometry(0.012,0.012,0.32,8),mt,g);b.position.set(xx,0.92,0.47);b.rotation.x=0.5});sombra(0,0,0.6,0.95,g);return g};
  K.mostrador=function(x,z,largo,ry,m){var g=grupo(x,z,ry);obst(g);caja(0,0,0,largo,0.95,0.7,m||MT.madera,g);caja(0,0.95,0,largo+0.06,0.05,0.78,MT.blanco,g);caja(0,0.02,0.36,largo,0.86,0.02,std(0x0E1B3D,{roughness:0.6}),g);sombra(0,0,largo,0.8,g);return g};
  K.pc=function(x,y,z,ry,p){var g=grupo(x,z,ry,p);g.position.y=y;caja(0,0,0,0.14,0.015,0.2,MT.negro,g);caja(0,0.015,0,0.035,0.24,0.035,MT.aceroOsc,g);var s=caja(0,0.2,0.02,0.56,0.34,0.025,MT.negro,g);var pant=mesh(new THREE.PlaneGeometry(0.52,0.3),MT.pantalla,g);pant.position.set(0,0.37,0.034);caja(0,0,0.26,0.42,0.018,0.14,std(0xD9DCE0),g);caja(0.3,0,0.26,0.06,0.03,0.1,MT.negro,g);return g};
  K.cajaRegistro=function(x,z,ry,o){o=o||{};var g=grupo(x,z,ry);var n=o.n||1;g.userData.obst=caja(0,0,0,2.3,0.88,0.75,std(0xEEF0F3,{roughness:0.6}),g);caja(0,0.88,0,2.35,0.04,0.8,std(0xD2D7DF,{roughness:0.5}),g);caja(0,0.02,0.37,2.3,0.84,0.02,std(0x0E1B3D),g);
    caja(-0.55,0.92,0,1.0,0.03,0.52,MT.goma,g);caja(-0.05,0.92,0,0.03,0.05,0.52,MT.aceroOsc,g);caja(0.28,0.92,-0.05,0.36,0.015,0.36,std(0x30343A,{roughness:0.3,metalness:0.4}),g);
    K.pc(0.75,0.92,-0.18,180,g);caja(0.95,0.92,0.18,0.08,0.12,0.06,MT.negro,g);caja(0.4,0.92,0.22,0.14,0.05,0.1,std(0x2B3038),g);
    cil(-1.0,0,-0.6,0.025,0.025,2.2,MT.aceroOsc,g);var le=K.cartel(-1.0,2.3,-0.6,0.42,0.42,String(n),"#D6AB4C","#001441",0,g);var le2=K.cartel(-1.0,2.3,-0.61,0.42,0.42,String(n),"#D6AB4C","#001441",180,g);
    sombra(0,0,2.4,0.9,g);g.userData.n=n;return g};
  K.puesto=function(x,z,ry){var g=grupo(x,z,ry);g.userData.obst=caja(0,0,0,1.4,0.74,0.7,std(0xF2F2F0,{roughness:0.55}),g);caja(0,0.74,0,1.44,0.03,0.74,std(0xD9DCE0),g);caja(-0.5,0,0.1,0.38,0.6,0.5,std(0xE0E3E8),g);K.pc(0.05,0.77,-0.1,0,g);
    var s=grupo(0,0.68,0,g);s.userData.obst=false;cil(0,0,0,0.03,0.03,0.4,MT.aceroOsc,s);for(var k=0;k<5;k++){var b=mesh(new THREE.BoxGeometry(0.04,0.02,0.3),MT.aceroOsc,s);b.position.set(0,0.02,0);b.rotation.y=k*2*PI/5;b.translateZ(0.15)}
    caja(0,0.4,0,0.48,0.08,0.46,std(0x2B3038),g.children[g.children.length-1]);caja(0,0.5,0.22,0.46,0.52,0.06,std(0x2B3038),g.children[g.children.length-1]);sombra(0,0,1.5,1.4,g);return g};
  K.rack=function(x,z,largo,ry,o){o=o||{};var g=grupo(x,z,ry);obst(g);var niv=o.niveles||3,h=o.alto||3.2,f=1.1,cajas=[];
    [-largo/2,largo/2].forEach(function(xx){[-f/2,f/2].forEach(function(zz){caja(xx,0,zz,0.09,h,0.09,MT.naranja,g)});caja(xx,0,0,0.04,0.04,f,MT.naranja,g);caja(xx,h-0.08,0,0.04,0.04,f,MT.naranja,g)});
    for(var n=0;n<=niv;n++){var y=0.15+n*(h-0.3)/niv;[-f/2,f/2].forEach(function(zz){caja(0,y,zz,largo,0.1,0.07,MT.azul,g)});
      if(n<niv){var k=Math.max(1,Math.round(largo/1.2));for(var i=0;i<k;i++){if(o.vacios&&o.vacios.indexOf(n*k+i)>=0){cajas.push(null);continue}
        var cx=-largo/2+largo/k*(i+0.5),e=K.estiba(cx,0,0,2,MT.carton,g,true);e.position.y=y+0.1;cajas.push(e)}}}
    sombra(0,0,largo+0.2,f+0.2,g);g.userData.cajas=cajas;g.userData.h=h;return g};
  K.estiba=function(x,z,ry,alto,m,p,envuelta){var g=grupo(x,z,ry,p);if(!p)obst(g);var mad=MT.estiba;[-0.5,0,0.5].forEach(function(zz){caja(0,0,zz,1.2,0.1,0.1,mad,g)});[-0.5,0,0.5].forEach(function(xx){caja(xx,0.1,0,0.1,0.04,1,mad,g)});
    for(var k=0;k<(alto||3);k++)for(var i=0;i<2;i++)for(var j=0;j<2;j++){var b=caja(-0.29+i*0.58,0.14+k*0.32,-0.24+j*0.48,0.55,0.3,0.45,m||MT.carton,g);if(!m||m===MT.carton){b.rotation.y=(i+j+k)%2?PI/2:0}}
    if(envuelta){var fm=caja(0,0.13,0,1.17,(alto||3)*0.32+0.02,0.98,MT.film,g);fm.castShadow=false}if(!p)sombra(0,0,1.3,1.1,g);return g};
  K.canastilla=function(x,y,z,c,ry){var g=grupo(x,z,ry);g.position.y=y;var mt=std(c||0xD94F3D,{roughness:0.6});caja(0,0,0,0.5,0.03,0.36,mt,g);[[0,-0.17],[0,0.17]].forEach(function(p){caja(p[0],0,p[1],0.5,0.28,0.02,mt,g)});[[-0.24,0],[0.24,0]].forEach(function(p){caja(p[0],0,p[1],0.02,0.28,0.36,mt,g)});
    var rej=mesh(new THREE.BoxGeometry(0.5,0.26,0.36),std(c||0xD94F3D,{transparent:true,opacity:0.25,roughness:0.6,depthWrite:false}),g);rej.position.y=0.15;rej.castShadow=false;return g};
  K.puerta=function(x,z,ancho,ry,o){o=o||{};if(window.MARCA==="franq"&&!o.opaca)return K.puertaCorrediza(x,z,ancho,ry,o);var g=grupo(x,z,ry),h=o.alto||2.3;caja(-ancho/2-0.06,0,0,0.12,h+0.1,0.16,MT.aceroOsc,g);caja(ancho/2+0.06,0,0,0.12,h+0.1,0.16,MT.aceroOsc,g);caja(0,h,0,ancho+0.24,0.12,0.16,MT.aceroOsc,g);
    var hojas=[];[-1,1].forEach(function(s){var piv=new THREE.Group();piv.position.set(s*ancho/2,0,0);g.add(piv);var hj=caja(-s*ancho/4,0.02,0,ancho/2-0.02,h-0.04,0.05,o.opaca?std(0x5A6270,{roughness:0.5,metalness:0.3}):MT.vidrio,piv);hj.castShadow=!!o.opaca;caja(-s*ancho/4,0.02,0,ancho/2-0.02,0.08,0.06,MT.aceroOsc,piv);caja(-s*ancho/4,h-0.12,0,ancho/2-0.02,0.08,0.06,MT.aceroOsc,piv);caja(-s*(ancho/2-0.12),0.9,0.05,0.03,0.4,0.04,MT.cromo,piv);hojas.push([piv,s])});
    g.userData.abrir=function(f){hojas.forEach(function(h){h[0].rotation.y=h[1]*f*1.35})};return g};
  K.antihurto=function(x,z,ancho,ry){var g=grupo(x,z,ry);[-1,1].forEach(function(s){var p=caja(s*(ancho/2+0.35),0,0,0.08,1.5,0.4,std(0xDDE1E7,{roughness:0.4}),g);caja(s*(ancho/2+0.35),0,0,0.12,0.04,0.46,MT.aceroOsc,g);var led=mesh(new THREE.BoxGeometry(0.02,0.9,0.02),std(0x5BA4FF,{emissive:0x3B82F6,emissiveIntensity:1}),g);led.position.set(s*(ancho/2+0.31),0.9,0.21)});return g};
  var MODELOS={sedan:{marca:"ZENTRA",modelo:"Linea",w:1.78,perfil:[[2.25,0.32],[2.28,0.62],[2.1,0.74],[0.95,0.82],[0.55,1.32],[-0.95,1.38],[-1.7,1.05],[-2.2,0.9],[-2.28,0.55],[-2.25,0.32]],ruedas:[1.4,-1.4],r:0.33},
    hatch:{marca:"KAVO",modelo:"Puma",w:1.72,perfil:[[1.85,0.3],[1.9,0.62],[1.7,0.76],[0.75,0.86],[0.2,1.38],[-1.5,1.44],[-1.82,1.2],[-1.9,0.55],[-1.85,0.3]],ruedas:[1.15,-1.15],r:0.31},
    suv:{marca:"TORRA",modelo:"Andes",w:1.9,perfil:[[2.3,0.4],[2.35,0.82],[2.1,0.98],[0.95,1.05],[0.5,1.62],[-1.9,1.66],[-2.3,1.3],[-2.38,0.7],[-2.3,0.4]],ruedas:[1.5,-1.5],r:0.38,barras:true},
    pickup:{marca:"TORRA",modelo:"Cargo",w:1.9,perfil:[[2.6,0.42],[2.65,0.88],[2.4,1.02],[1.1,1.06],[0.6,1.68],[-0.5,1.7],[-0.6,1.1],[-2.6,1.08],[-2.65,0.5],[-2.6,0.42]],ruedas:[1.7,-1.7],r:0.4,platon:true},
    van:{marca:"BRUMA",modelo:"Flete",w:1.95,perfil:[[2.4,0.36],[2.45,0.9],[2.1,1.5],[1.6,1.95],[-2.35,2.0],[-2.45,0.6],[-2.4,0.36]],ruedas:[1.5,-1.4],r:0.36}};
  var COLORES_AUTO=[0xF4F4F2,0xC9CDD4,0x2B3038,0xC8342B,0x2F64C8,0x5A6270,0x2E6A4A,0x8A2E2E,0xD9A63A,0x1E3A6E];
  var cachePint={};function pinturaAuto(color){var k="pa"+color;if(cachePint[k])return cachePint[k];var m=new THREE.MeshPhysicalMaterial({color:color,metalness:0.6,roughness:0.35,clearcoat:1,clearcoatRoughness:0.06,envMapIntensity:1.2});m.color.convertSRGBToLinear();m._comp=true;return cachePint[k]=m}
  K.auto=function(color,o){o=o||{};var tipo=o.tipo||"sedan",M_=MODELOS[tipo]||MODELOS.sedan,g=new THREE.Group();add(g);obst(g);if(color==null)color=COLORES_AUTO[Math.floor(rnd()*COLORES_AUTO.length)];
    var c=pinturaAuto(color),w=M_.w;
    var sh=new THREE.Shape();M_.perfil.forEach(function(p,i){if(i)sh.lineTo(p[0],p[1]);else sh.moveTo(p[0],p[1])});sh.closePath();
    var geo=new THREE.ExtrudeGeometry(sh,{depth:w-0.16,bevelEnabled:true,bevelThickness:0.09,bevelSize:0.08,bevelSegments:3,curveSegments:4});geo.rotateY(-PI/2);geo.translate((w-0.16)/2,0,0);
    var cuerpo=mesh(geo,c,g);
    var cab=M_.perfil.filter(function(p){return p[1]>1.0}),zc=(Math.max.apply(null,cab.map(function(p){return p[0]}))+Math.min.apply(null,cab.map(function(p){return p[0]})))/2,lc=Math.max.apply(null,cab.map(function(p){return p[0]}))-Math.min.apply(null,cab.map(function(p){return p[0]}))-0.5,ymax=Math.max.apply(null,M_.perfil.map(function(p){return p[1]}));
    var vid=mesh(new THREE.BoxGeometry(w+0.02,ymax-1.0-0.16,lc),MT.vidrioAuto,g);vid.position.set(0,(ymax+1.0)/2-0.04,zc);vid.castShadow=false;
    if(tipo==="van"){var vl=mesh(new THREE.BoxGeometry(w+0.02,0.55,1.1),MT.vidrioAuto,g);vl.position.set(0,1.45,1.45);vl.castShadow=false}
    var bajo=mesh(new THREE.BoxGeometry(w-0.3,0.14,Math.abs(M_.perfil[0][0]-M_.perfil[M_.perfil.length-2][0])-0.4),MT.goma,g);bajo.position.y=M_.perfil[0][1]-0.02;
    M_.ruedas.forEach(function(zz){[-1,1].forEach(function(s){var r=mesh(new THREE.CylinderGeometry(M_.r,M_.r,0.24,22),MT.goma,g);r.rotation.z=PI/2;r.position.set(s*(w/2-0.1),M_.r,zz);var rin=mesh(new THREE.CylinderGeometry(M_.r*0.62,M_.r*0.62,0.26,10),MT.cromo,g);rin.rotation.z=PI/2;rin.position.set(s*(w/2-0.1),M_.r,zz)})});
    var zf=M_.perfil[0][0],zt=M_.perfil[M_.perfil.length-2][0];
    [-0.6,0.6].forEach(function(xx){var f=mesh(new THREE.BoxGeometry(0.34,0.14,0.05),std(0xFFF6D8,{emissive:0xFFF0C0,emissiveIntensity:0.8}),g);f.position.set(xx*w/1.8,M_.perfil[1][1]+0.02,zf+0.02);var t=mesh(new THREE.BoxGeometry(0.3,0.12,0.05),MT.luzRoja,g);t.position.set(xx*w/1.8,M_.perfil[M_.perfil.length-3][1]-0.2,zt-0.02)});
    [-1,1].forEach(function(s){var esp=mesh(new THREE.BoxGeometry(0.1,0.08,0.14),c,g);esp.position.set(s*(w/2+0.04),1.0,zc+lc/2-0.1);var man=mesh(new THREE.BoxGeometry(0.02,0.03,0.16),MT.cromo,g);man.position.set(s*(w/2+0.03),0.82,zc-0.2)});
    var rej=mesh(new THREE.BoxGeometry(w*0.55,0.16,0.04),std(0x1C1E22,{metalness:0.4,roughness:0.5}),g);rej.position.set(0,M_.perfil[1][1]-0.18,zf+0.02);
    if(M_.barras)[-0.5,0.5].forEach(function(xx){var b=mesh(new THREE.BoxGeometry(0.05,0.05,2.0),MT.aceroOsc,g);b.position.set(xx*w/1.8,ymax+0.06,zc-0.3)});
    if(M_.platon){var pl=mesh(new THREE.BoxGeometry(w-0.3,0.08,1.9),std(0x2B3038,{roughness:0.8}),g);pl.position.set(0,1.1,-1.6);pl.castShadow=false}
    var tp2=tex(256,64,function(x,W,H){x.fillStyle="rgba(0,0,0,0)";x.clearRect(0,0,W,H);x.fillStyle="#DDE2E8";x.font="800 40px Archivo,Arial";x.textAlign="center";x.textBaseline="middle";x.fillText(M_.marca+"  "+M_.modelo,W/2,H/2)});
    var ro=mesh(new THREE.PlaneGeometry(0.7,0.17),new THREE.MeshBasicMaterial({map:tp2,transparent:true}),g);ro.position.set(0.3,M_.perfil[M_.perfil.length-3][1]-0.02,zt-0.03);ro.rotation.y=PI;ro.castShadow=false;
    var placa=o.placa||"KTV 482";var tp=tex(256,96,function(x,W,H){x.fillStyle="#F7D23A";x.fillRect(0,0,W,H);x.strokeStyle="#111";x.lineWidth=6;x.strokeRect(3,3,W-6,H-6);x.fillStyle="#111";x.font="800 54px Archivo,Arial";x.textAlign="center";x.textBaseline="middle";x.fillText(placa,W/2,H/2+3)});
    [[zf+0.03,0],[zt-0.03,PI]].forEach(function(q){var pl=mesh(new THREE.PlaneGeometry(0.52,0.19),new THREE.MeshBasicMaterial({map:tp}),g);pl.position.set(0,0.46,q[0]);pl.rotation.y=q[1];pl.castShadow=false});
    sombra(0,0,w+0.1,zf-zt+0.2,g,0.008);g.userData.placa=placa;g.userData.tipo=tipo;g.userData.marca=M_.marca+" "+M_.modelo;return g};
  K.barrera=function(x,z,ry){var g=grupo(x,z,ry);caja(0,0,0,0.35,1.05,0.35,MT.amarillo,g);var piv=new THREE.Group();piv.position.set(0,0.95,0);g.add(piv);
    for(var i=0;i<8;i++)caja(0.25+i*0.42,-0.05,0,0.42,0.1,0.08,i%2?MT.rojo:MT.blanco,piv);g.userData.abrir=function(f){piv.rotation.z=f*PI*0.47};return g};
  K.cerca=function(pts,h){for(var i=0;i<pts.length-1;i++){var a=pts[i],b=pts[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(l/0.18));
    for(var k=0;k<=n;k++){var t=k/n;cil(a[0]+(b[0]-a[0])*t,0,a[1]+(b[1]-a[1])*t,0.02,0.02,h||1.9,MT.aceroOsc)}var r=caja((a[0]+b[0])/2,0,(a[1]+b[1])/2,l,0.06,0.05,MT.aceroOsc);r.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);r.position.y=(h||1.9)-0.08;var r2=caja((a[0]+b[0])/2,0,(a[1]+b[1])/2,l,0.05,0.05,MT.aceroOsc);r2.rotation.y=r.rotation.y;r2.position.y=0.3}};
  K.lampara=function(x,y,z){var l=new THREE.PointLight(0xFFE7C2,0.5,9,2);l.position.set(x,y,z);add(l);return l};
  K.luminaria=function(x,y,z,largo,ry){var g=grupo(x,z,ry);g.position.y=y;caja(0,0,0,largo,0.05,0.14,std(0xE1E4E9,{roughness:0.5}),g);var l=mesh(new THREE.BoxGeometry(largo-0.08,0.012,0.09),MT.led,g);l.position.y=-0.004;l.castShadow=false;[-largo/2+0.2,largo/2-0.2].forEach(function(xx){caja(xx,0.05,0,0.01,0.6,0.01,MT.aceroOsc,g)});return g};
  K.cartel=function(x,y,z,w,h,texto,fondo,color,ry,padre){var t=tex(512,Math.round(512*h/w),function(c,W,H){c.fillStyle=fondo||"#001441";c.fillRect(0,0,W,H);c.fillStyle=color||"#fff";c.font="800 "+Math.round(H*0.42)+"px Archivo,Arial";c.textAlign="center";c.textBaseline="middle";c.fillText(texto,W/2,H/2+2)});
    var o=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}),padre);o.castShadow=false;o.position.set(x,y,z);o.rotation.y=(ry||0)*RAD;return o};
  var cacheImg={};
  K.imagen=function(url,x,y,z,w,h,ry,padre,o){o=o||{};var t=cacheImg[url];if(!t){t=new THREE.TextureLoader().load(url);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;t._comp=true;cacheImg[url]=t}
    var m=new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:0.6,emissive:o.emissive||0x000000,emissiveMap:o.emissive?t:null,emissiveIntensity:o.emissiveIntensity||0});var p=mesh(new THREE.PlaneGeometry(w,h),m,padre);p.castShadow=false;p.position.set(x,y,z);p.rotation.y=(ry||0)*RAD;return p};
  K.afiche=function(x,y,z,w,h,titulo,hue,ry,padre){var t=tex(256,Math.round(256*h/w),function(c,W,H){c.fillStyle="hsl("+hue+",60%,52%)";c.fillRect(0,0,W,H);c.fillStyle="rgba(255,255,255,.9)";c.fillRect(16,H*0.55,W-32,H*0.3);c.fillStyle="#0A1330";c.font="800 "+Math.round(W*0.11)+"px Archivo,Arial";c.textAlign="center";c.fillText(titulo,W/2,H*0.75);c.beginPath();c.arc(W*0.5,H*0.3,W*0.17,0,6.3);c.fillStyle="rgba(255,255,255,.35)";c.fill()});
    var o=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:0.7}),padre);o.castShadow=false;o.position.set(x,y,z);o.rotation.y=(ry||0)*RAD;return o};
  K.arbol=function(x,z,s){s=s||1;var g=grupo(x,z);obst(g);cil(0,0,0,0.09*s,0.13*s,1.4*s,std(0x6B4E33,{roughness:0.9}),g);for(var i=0;i<6;i++){var r=(0.55+rnd()*0.3)*s,h=mesh(new THREE.SphereGeometry(r,14,10),std([0x3F7D3A,0x4E8A3E,0x377236][i%3],{roughness:0.85}),g);h.position.set((rnd()-0.5)*0.9*s,1.6*s+rnd()*0.7*s,(rnd()-0.5)*0.9*s)}sombra(0,0,1.6*s,1.6*s,g);return g};
  K.poste=function(x,z){var g=grupo(x,z);cil(0,0,0,0.05,0.07,4.2,MT.aceroOsc,g);var b=caja(0.35,4.1,0,0.8,0.08,0.08,MT.aceroOsc,g);var l=mesh(new THREE.BoxGeometry(0.5,0.08,0.22),MT.led,g);l.position.set(0.6,4.06,0);l.castShadow=false;return g};
  K.bolardo=function(x,z){var g=grupo(x,z);cil(0,0,0,0.08,0.09,0.9,std(0x2B3038,{metalness:0.4,roughness:0.4}),g);cil(0,0.5,0,0.085,0.085,0.08,MT.amarillo,g);return g};
  K.extintor=function(x,y,z,ry,padre){var g=grupo(x,z,ry,padre);g.position.y=y;cil(0,0,0,0.08,0.08,0.5,std(0xC8342B,{roughness:0.35}),g);cil(0,0.5,0,0.03,0.03,0.08,MT.aceroOsc,g);caja(0,0.2,-0.1,0.3,0.3,0.02,MT.rojo,g);return g};
  K.montacargas=function(x,z,ry){var g=grupo(x,z,ry);obst(g);var am=pbr("metal",{color:0xF2A51F,roughness:0.55,metalness:0.5,env:0.9,w:1,d:1});caja(0,0.35,0,1.1,0.5,1.9,am,g);caja(0,0.85,0.4,1.0,0.5,0.9,std(0x2B3038),g);[[-0.5,0.5],[0.5,0.5],[-0.5,-0.5],[0.5,-0.5]].forEach(function(p){caja(p[0],1.3,p[1],0.06,1.1,0.06,MT.aceroOsc,g)});caja(0,2.4,0,1.1,0.05,1.1,MT.aceroOsc,g);
    [[-0.5,0.7],[0.5,0.7],[-0.5,-0.6],[0.5,-0.6]].forEach(function(p){var r=mesh(new THREE.CylinderGeometry(0.28,0.28,0.24,16),MT.goma,g);r.rotation.z=PI/2;r.position.set(p[0],0.28,p[1])});
    [-0.3,0.3].forEach(function(xx){caja(xx,0.08,-1.2,0.12,0.05,1.2,MT.aceroOsc,g)});caja(0,0.1,-0.95,0.9,1.6,0.06,MT.aceroOsc,g);var asiento=caja(0,0.85,0,0.5,0.1,0.5,std(0x1C1E22),g);sombra(0,0,1.3,2.6,g);return g};
  K.libreria=function(x,z,largo,ry,alto){var g=grupo(x,z,ry);obst(g);var mad=std(0x8A6440,{roughness:0.7}),C_=[0x7A2E2E,0x2E4A7A,0x2E6A4A,0xC8962E,0x4A3A6A,0x8A8A8A,0x1E5A6A,0xA85A2E];alto=alto||2.2;
    caja(0,0,0,largo,alto,0.04,mad,g);[-largo/2,largo/2].forEach(function(xx){caja(xx,0,0.17,0.04,alto,0.36,mad,g)});
    for(var n=0;n<5;n++){var y=0.08+n*(alto-0.15)/5;caja(0,y,0.17,largo,0.03,0.36,mad,g);var xx=-largo/2+0.05;while(xx<largo/2-0.08){var w=0.03+rnd()*0.035,h=0.22+rnd()*0.12;caja(xx+w/2,y+0.03,0.18,w,h,0.24,std(C_[Math.floor(rnd()*8)],{roughness:0.8}),g);xx+=w+0.004}}sombra(0,0.17,largo,0.4,g);return g};
  K.mesa=function(x,z,o){o=o||{};var g=grupo(x,z,o.ry||0);var r=o.r||0.5,alta=!!o.alta,h=alta?1.05:0.74,mad=o.mat||pbr("madera",{color:0x8A5A34,roughness:0.6,env:0.7,w:1,d:1});
    if(o.cuadrada){g.userData.obst=caja(0,h-0.04,0,r*2,0.04,r*2*(o.largo||1),mad,g);[[-r+0.08,-r*(o.largo||1)+0.08],[r-0.08,-r*(o.largo||1)+0.08],[-r+0.08,r*(o.largo||1)-0.08],[r-0.08,r*(o.largo||1)-0.08]].forEach(function(p){caja(p[0],0,p[1],0.05,h-0.04,0.05,mad,g)})}
    else{cil(0,0,0,0.05,0.05,h-0.04,MT.aceroOsc,g);cil(0,0,0,0.25,0.3,0.03,MT.aceroOsc,g);g.userData.obst=cil(0,h-0.04,0,r,r,0.04,o.mat||MT.blanco,g)}
    var n=o.sillas!=null?o.sillas:(alta?2:4);for(var k=0;k<n;k++){var a=k*2*PI/n+(o.giro||0.4),dist=r+0.32,s=grupo(Math.cos(a)*dist,Math.sin(a)*dist,0,g);s.rotation.y=-a+PI/2;var sm=pbr("tela",{color:o.silla||0x8A6A48,roughness:1,w:0.5,d:0.5});
      caja(0,alta?0.72:0.42,0,0.42,0.05,0.42,sm,s);caja(0,alta?0.77:0.47,-0.19,0.42,alta?0.4:0.48,0.04,sm,s);[[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]].forEach(function(q){caja(q[0],0,q[1],0.03,alta?0.72:0.42,0.03,MT.aceroOsc,s)})}
    sombra(0,0,r*2+0.6,r*2+0.6,g);return g};
  K.vitrinaCaliente=function(x,y,z,ry,padre){var g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=(ry||0)*RAD;(padre||mundo).add(g);var W=1.0,D=0.5,H=0.5;
    var acero=std(0xC9CDD4,{metalness:0.85,roughness:0.3}),vid=new THREE.MeshPhysicalMaterial({color:0xDCEBF5,transparent:true,opacity:0.22,roughness:0.03,metalness:0.1,clearcoat:1,depthWrite:false,side:THREE.DoubleSide});vid._comp=true;
    caja(0,0,0,W,0.06,D,acero,g);caja(0,0.06,-D/2+0.03,W,H-0.06,0.06,acero,g);[-1,1].forEach(function(s){caja(s*(W/2-0.01),0.06,0,0.02,H-0.08,D,vid,g)});
    var fr=caja(0,0.06,D/2-0.08,W,H-0.08,0.012,vid,g);fr.rotation.x=0.22;fr.position.y=0.06;caja(0,H-0.02,-0.06,W,0.012,D-0.12,vid,g);
    var dorado=std(0xD9A045,{roughness:0.55}),tostado=std(0xB8762E,{roughness:0.6}),queso=std(0xF0C85A,{roughness:0.5}),salsa=std(0xB6361F,{roughness:0.6});
    [0.08,0.27].forEach(function(yy,nv){caja(0,yy,-0.02,W-0.08,0.015,D-0.16,acero,g);
      if(nv===0){ // empanadas: media luna de masa con borde repulgado
        for(var i=0;i<6;i++){var e=mesh(new THREE.CylinderGeometry(0.07,0.07,0.028,16,1,false,0,PI),dorado,g);e.rotation.y=-PI/2;e.position.set(-0.4+i*0.155,yy+0.03,-0.06);e.scale.z=0.75;e.castShadow=true;
          var rb=mesh(new THREE.TorusGeometry(0.068,0.009,6,14,PI),tostado,g);rb.rotation.x=PI/2;rb.rotation.z=0;rb.position.set(-0.4+i*0.155,yy+0.034,-0.06);rb.scale.set(0.75,1,1);rb.rotation.set(PI/2,0,PI/2)}
        for(var i=0;i<5;i++){var p=mesh(new THREE.CylinderGeometry(0.045,0.05,0.035,16),dorado,g);p.position.set(-0.32+i*0.16,yy+0.033,0.09);var d=mesh(new THREE.SphereGeometry(0.045,14,8,0,PI*2,0,PI/2),tostado,g);d.scale.y=0.5;d.position.set(-0.32+i*0.16,yy+0.05,0.09)}}
      else{ // porciones de pizza y pan francés
        for(var i=0;i<4;i++){var pz=mesh(new THREE.CylinderGeometry(0.15,0.15,0.014,12,1,false,0,0.7),dorado,g);pz.position.set(-0.36+i*0.22,yy+0.022,0.1);pz.rotation.y=-0.35+PI;var q=mesh(new THREE.CylinderGeometry(0.135,0.135,0.006,12,1,false,0.05,0.6),queso,g);q.position.set(-0.36+i*0.22,yy+0.032,0.1);q.rotation.y=-0.35+PI;
          for(var k=0;k<3;k++){var pe=mesh(new THREE.CylinderGeometry(0.014,0.014,0.004,10),salsa,g);var a=-0.35+PI+0.12+k*0.2,r=0.05+k*0.03;pe.position.set(-0.36+i*0.22+Math.sin(a)*r,yy+0.037,0.1+Math.cos(a)*r)}}
        for(var i=0;i<5;i++){var pan=mesh(geoCapsula(0.03,0.09),tostado,g);pan.rotation.z=PI/2;pan.position.set(-0.36+i*0.18,yy+0.045,-0.1);pan.scale.set(1,1,0.8)}}});
    var l=new THREE.PointLight(0xFFB873,0.6,1.6,2);l.position.set(0,H-0.08,0);g.add(l);
    K.cartel(0,H+0.02,-D/2+0.02,W-0.1,0.09,"COMIDA CALIENTE","#E30613","#FFD100",0,g);K.cartel(-0.3,0.21,D/2-0.02,0.3,0.05,"EMPANADA S/ 3.99","#FFD100","#001441",0,g);K.cartel(0.3,0.21,D/2-0.02,0.3,0.05,"PIZZA S/ 5.90","#FFD100","#001441",0,g);return g};
  K.cafeBarra=function(x,y,z,ry,padre){var g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=(ry||0)*RAD;(padre||mundo).add(g);var negro=std(0x1C1E22,{roughness:0.35,metalness:0.3}),amar=std(0xFFD100,{roughness:0.5});
    caja(0,0,0,0.5,0.62,0.45,negro,g);caja(0,0.3,0.226,0.44,0.26,0.01,amar,g);K.cartel(0,0.38,0.235,0.4,0.1,"barra","#FFD100","#1C1E22",0,g);caja(0,0.05,0.19,0.3,0.02,0.1,MT.cromo,g);
    [-0.07,0.07].forEach(function(xx){cil(xx,0.2,0.2,0.012,0.012,0.08,MT.cromo,g)});var taza=cil(0,0.07,0.2,0.035,0.028,0.09,std(0x2B2B2B,{roughness:0.6}),g);caja(0,0.1,0.2,0.07,0.012,0.07,amar,g);
    caja(0,0.62,-0.05,0.3,0.12,0.3,negro,g);K.cartel(0,0.72,0.1,0.26,0.05,"CAFÉ DEL DÍA S/ 2.50","#1C1E22","#FFD100",0,g);return g};
  K.techoRejilla=function(w,d,h,o){o=o||{};var t=tex(256,256,function(c,W,H){c.fillStyle="#F2F3F5";c.fillRect(0,0,W,H);c.strokeStyle="#C9CDD3";c.lineWidth=3;c.strokeRect(1,1,W-2,H-2)});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/0.6,d/0.6);
    var m=new THREE.MeshStandardMaterial({map:t,roughness:0.95,side:THREE.FrontSide});m._comp=true;var p=mesh(new THREE.PlaneGeometry(w,d),m);p.rotation.x=PI/2;p.position.y=h;p.receiveShadow=false;p.castShadow=false;p.userData.sinObst=true;
    var led=new THREE.MeshStandardMaterial({color:0xFFFFFF,emissive:0xFFFFFF,emissiveIntensity:1.0,roughness:1,side:THREE.FrontSide});led._comp=true;var paso=o.paso||2.4;
    for(var x=-w/2+paso/2;x<w/2;x+=paso)for(var z=-d/2+paso/2;z<d/2;z+=paso){var q=mesh(new THREE.PlaneGeometry(0.6,0.6),led);q.rotation.x=PI/2;q.position.set(x,h-0.006,z);q.castShadow=false;q.receiveShadow=false;q.userData.sinObst=true}
    return p};
  K.afichePrecio=function(x,y,z,w,h,precio,titulo,ry,padre){var t=tex(512,Math.round(512*h/w),function(c,W,H){c.fillStyle="#FFD100";c.fillRect(0,0,W,H);c.fillStyle="#E30613";c.fillRect(0,0,W*0.42,H*0.16);c.fillStyle="#fff";c.font="800 "+Math.round(H*0.1)+"px Archivo,Arial";c.textAlign="left";c.fillText("ANTOJO CONTUNDENTE",W*0.02,H*0.12);
      c.fillStyle="#E30613";c.font="900 "+Math.round(H*0.42)+"px Archivo,Arial";c.fillText(precio,W*0.02,H*0.62);c.fillStyle="#1C1E22";c.font="700 "+Math.round(H*0.11)+"px Archivo,Arial";c.fillText(titulo,W*0.02,H*0.82);c.font="600 "+Math.round(H*0.08)+"px Archivo,Arial";c.fillText("Precio regular S/ 17.40",W*0.02,H*0.94);
      c.fillStyle="#fff";c.beginPath();c.ellipse(W*0.78,H*0.52,W*0.17,H*0.3,0,0,6.3);c.fill();c.fillStyle="#E9D9A0";c.beginPath();c.ellipse(W*0.78,H*0.54,W*0.13,H*0.22,0,0,6.3);c.fill();c.fillStyle="#C8782A";c.beginPath();c.ellipse(W*0.75,H*0.5,W*0.07,H*0.14,0.5,0,6.3);c.fill();
      c.fillStyle="#2F64C8";c.fillRect(W*0.9,H*0.3,W*0.06,H*0.5);c.fillStyle="#C8342B";c.fillRect(W*0.9,H*0.45,W*0.06,H*0.18);c.fillStyle="#1C1E22";c.beginPath();c.arc(W*0.6,H*0.15,H*0.06,0,6.3);c.fill();c.fillStyle="#fff";c.font="700 "+Math.round(H*0.05)+"px Arial";c.textAlign="center";c.fillText("ALTO EN",W*0.6,H*0.14);c.fillText("SODIO",W*0.6,H*0.19)});
    var m=new THREE.MeshStandardMaterial({map:t,roughness:0.6});m._comp=true;var p=mesh(new THREE.PlaneGeometry(w,h),m,padre);p.position.set(x,y,z);p.rotation.y=(ry||0)*RAD;p.castShadow=false;return p};
  K.afichePromo=function(x,y,z,w,h,titulo,precio,sub,ry,padre){var t=tex(512,Math.round(512*h/w),function(c,W,H){c.fillStyle="#C2185B";c.fillRect(0,0,W,H);c.fillStyle="#fff";c.font="900 "+Math.round(H*0.09)+"px Archivo,Arial";c.textAlign="center";c.fillText("¡QUÉ BUENA PROMO!",W/2,H*0.12);c.font="900 "+Math.round(H*0.14)+"px Archivo,Arial";c.fillText(titulo,W/2,H*0.3);
      c.fillStyle="#FFD100";c.font="900 "+Math.round(H*0.2)+"px Archivo,Arial";c.fillText(precio,W/2,H*0.52);c.fillStyle="#fff";c.font="700 "+Math.round(H*0.07)+"px Archivo,Arial";c.fillText(sub,W/2,H*0.62);
      c.fillStyle="#F4E7D3";c.fillRect(W*0.2,H*0.7,W*0.6,H*0.18);c.fillStyle="#5A3A1E";c.fillRect(W*0.2,H*0.77,W*0.6,H*0.05);c.fillStyle="#fff";c.font="700 "+Math.round(H*0.06)+"px Arial";c.fillText("HELADO VAINILLA SANDWICH",W/2,H*0.96)});
    var m=new THREE.MeshStandardMaterial({map:t,roughness:0.6,side:THREE.DoubleSide});m._comp=true;var p=mesh(new THREE.PlaneGeometry(w,h),m,padre);p.position.set(x,y,z);p.rotation.y=(ry||0)*RAD;p.castShadow=false;return p};
  K.puertaCorrediza=function(x,z,ancho,ry,o){o=o||{};var g=grupo(x,z,ry),h=o.alto||2.3,alu=std(0xC4C9CF,{metalness:0.6,roughness:0.35}),vid=new THREE.MeshPhysicalMaterial({color:0xDCEBF5,transparent:true,opacity:0.14,roughness:0.03,metalness:0.1,clearcoat:1,depthWrite:false,side:THREE.DoubleSide});vid._comp=true;
    caja(-ancho/2-0.05,0,0,0.1,h+0.12,0.12,alu,g);caja(ancho/2+0.05,0,0,0.1,h+0.12,0.12,alu,g);caja(0,h,0,ancho+0.2,0.16,0.18,alu,g);caja(0,h+0.16,0,ancho+0.2,0.5,0.12,std(0xF4F4F2),g);
    var hojas=[-1,1].map(function(s){var hj=new THREE.Group();g.add(hj);hj.userData.s=s;var w2=ancho/2;caja(s*w2/2,0.02,0,w2-0.02,h-0.04,0.012,vid,hj);caja(s*w2/2,0.02,0,w2-0.02,0.08,0.03,alu,hj);caja(s*w2/2,h-0.1,0,w2-0.02,0.08,0.03,alu,hj);
      caja(s*(w2-0.03),0.02,0,0.04,h-0.04,0.03,alu,hj);caja(s*0.02,0.02,0,0.04,h-0.04,0.03,alu,hj);var lg=K.imagen("marca/franq.png",s*w2/2,1.35,0.012,0.36,0.18,0,hj);return hj});
    caja(0,h+0.02,0.1,0.14,0.05,0.08,std(0x1C1E22),g);var sen=mesh(new THREE.SphereGeometry(0.015,8,6),std(0x2F7BEA,{emissive:0x2F7BEA,emissiveIntensity:0.8}),g);sen.position.set(0,h+0.02,0.15);
    var tap=caja(0,0.004,0.25,ancho-0.1,0.008,0.5,std(0x3A3F4A,{roughness:1}),g);tap.userData.sinObst=true;var ac=caja(0,h+0.42,-0.22,0.95,0.3,0.24,std(0xF4F4F2,{roughness:0.5}),g);caja(0,h+0.44,-0.35,0.9,0.03,0.02,std(0xC4C9CF),g);
    g.userData.abrir=function(f){hojas.forEach(function(hj){hj.position.x=hj.userData.s*f*(ancho/2-0.05)})};g.userData.hojas=hojas;g.userData.obst=false;return g};
  K.granizadora=function(x,y,z,ry,padre){var g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=(ry||0)*RAD;(padre||mundo).add(g);var acero=std(0xC9CDD4,{metalness:0.8,roughness:0.3});caja(0,0,0,0.52,0.36,0.42,acero,g);caja(0,0.36,0,0.52,0.04,0.42,std(0x1C1E22),g);
    [[-0.13,0xD93A3A],[0.13,0x2F7BEA]].forEach(function(p){var liq=cil(p[0],0.4,0,0.1,0.085,0.3,std(p[1],{transparent:true,opacity:0.85,roughness:0.3}),g);var taz=cil(p[0],0.4,0,0.11,0.095,0.36,new THREE.MeshPhysicalMaterial({color:0xDCEBF5,transparent:true,opacity:0.2,roughness:0.03,clearcoat:1,depthWrite:false}),g);taz.material._comp=true;cil(p[0],0.76,0,0.115,0.115,0.03,std(0x1C1E22),g);
      caja(p[0],0.2,0.22,0.03,0.1,0.03,std(0x1C1E22),g);caja(p[0],0.28,0.24,0.06,0.02,0.08,std(0xC8342B),g)});K.cartel(0,0.1,0.212,0.46,0.1,"GRANIZADO 500 ml","#1C1E22","#FFD100",0,g);return g};
  K.microondas=function(x,y,z,ry,padre){var g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=(ry||0)*RAD;(padre||mundo).add(g);caja(0,0,0,0.5,0.3,0.38,std(0xF4F4F2,{roughness:0.4}),g);caja(-0.06,0.03,0.19,0.32,0.24,0.012,std(0x1C1E22,{roughness:0.2,metalness:0.3}),g);caja(0.18,0.05,0.19,0.08,0.2,0.012,std(0xDDE1E7),g);caja(0.18,0.2,0.2,0.05,0.025,0.01,std(0x2F7BEA,{emissive:0x2F7BEA,emissiveIntensity:0.5}),g);return g};
  K.estacionBarra=function(x,z,ry){var g=grupo(x,z,ry||0);obst(g);var L=3.6,D=0.65,negro=std(0x1C1E22,{roughness:0.5}),amar=std(0xFFD100,{roughness:0.55}),acero=std(0xC9CDD4,{metalness:0.85,roughness:0.3});
    var t=tex(1024,384,function(c,W,H){c.fillStyle="#FFD100";c.fillRect(0,0,W,H);c.strokeStyle="rgba(120,80,20,.35)";c.lineWidth=6;for(var k=0;k<7;k++){var cx=90+k*150,cy=250+(k%2)*40;c.beginPath();c.arc(cx,cy,34,0,6.3);c.stroke();c.beginPath();c.moveTo(cx-20,cy-50);c.quadraticCurveTo(cx-10,cy-80,cx-20,cy-100);c.stroke();c.beginPath();c.moveTo(cx+5,cy-50);c.quadraticCurveTo(cx+15,cy-80,cx+5,cy-100);c.stroke()}
      c.fillStyle="#1C1E22";c.font="900 96px Archivo,Arial";c.textAlign="left";c.fillText("barra",40,140);c.font="700 44px Archivo,Arial";c.fillText("migo",44,200);c.textAlign="right";c.font="900 54px Archivo,Arial";c.fillText("PONLE SABOR",W-40,110);c.fillText("A TU DÍA",W-40,170);
      c.fillStyle="#C2185B";c.beginPath();c.arc(W*0.62,120,56,0,6.3);c.fill();c.fillStyle="#fff";c.font="800 26px Archivo,Arial";c.textAlign="center";c.fillText("CAFÉ DEL",W*0.62,112);c.fillText("DÍA S/ 2.50",W*0.62,142)});
    var pm=new THREE.MeshStandardMaterial({map:t,roughness:0.7});pm._comp=true;var pan=mesh(new THREE.PlaneGeometry(L,1.35),pm,g);pan.position.set(0,1.72,-D/2-0.005);pan.castShadow=false;
    caja(0,0,0,L,0.92,D,negro,g);caja(0,0.5,D/2-0.004,L,0.12,0.01,amar,g);caja(0,0.92,0,L+0.04,0.04,D+0.06,acero,g);caja(0,0.05,0,L,0.03,D,amar,g);
    K.cafeBarra(-1.35,0.96,-0.08,0,g);K.cafeBarra(-0.72,0.96,-0.08,0,g);K.granizadora(0.05,0.96,-0.08,0,g);K.microondas(0.75,0.96,-0.1,0,g);K.rodilloPerros(1.4,0.96,-0.02,0,g);
    [[-1.65,0.045,0.12],[-1.55,0.04,0.1],[-1.45,0.035,0.08]].forEach(function(v){for(var k=0;k<4;k++)cil(v[0],0.96+k*0.012,0.18,v[1],v[1]*0.8,v[2],std(0xF2F2F0,{roughness:0.6}),g)});
    for(var k=0;k<6;k++)cil(-0.35,0.96+k*0.006,0.2,0.045,0.045,0.005,std(0x2B2B2B,{roughness:0.5}),g);caja(0.4,0.96,0.2,0.12,0.09,0.09,acero,g);for(var k=0;k<12;k++)caja(0.37+(k%4)*0.02,0.98,0.17+Math.floor(k/4)*0.025,0.012,0.07,0.012,[std(0xF4F4F2),std(0xE0782A),std(0x8CC152)][k%3],g);
    caja(-1.0,0.96,0.2,0.14,0.06,0.14,std(0xF4F4F2,{roughness:0.9}),g);
    K.cartel(0,0.3,D/2+0.002,1.4,0.14,"SÍRVETE TU CAFÉ · BARRA","#FFD100","#1C1E22",0,g);var bas=cil(L/2+0.3,0,0,0.18,0.15,0.7,std(0x3A3F48,{roughness:0.6}),g);cil(L/2+0.3,0.7,0,0.19,0.19,0.04,amar,g);
    var l=new THREE.PointLight(0xFFE2B0,0.45,4,2);l.position.set(0,1.9,0.5);g.add(l);sombra(0,0,L+0.8,D+0.3,g);return g};
  K.expendedora=function(x,z,ry){var g=grupo(x,z,ry||0);obst(g);var azul=std(0x1E5BC6,{roughness:0.45});caja(0,0,0,0.9,1.9,0.8,azul,g);caja(0,1.9,0,0.9,0.1,0.8,std(0x163F8A),g);
    caja(-0.12,0.25,0.395,0.56,1.45,0.012,new THREE.MeshPhysicalMaterial({color:0xDCEBF5,transparent:true,opacity:0.18,roughness:0.03,clearcoat:1,depthWrite:false}),g).material._comp=true;caja(-0.12,0.25,0.3,0.56,1.45,0.02,std(0x0E1B3D),g);
    for(var n=0;n<5;n++){caja(-0.12,0.32+n*0.28,0.34,0.54,0.012,0.1,std(0xC9CDD4,{metalness:0.6}),g);for(var i=0;i<5;i++){var b=K.prodBotella(0.03,0.22,[0xC8342B,0x2F64C8,0xF2C230,0x8CC152,0x9CD3F5][(i+n)%5],g);b.position.set(-0.34+i*0.11,0.33+n*0.28,0.34)}}
    caja(0.3,0.9,0.4,0.2,0.5,0.02,std(0x1C1E22),g);caja(0.3,1.2,0.41,0.14,0.08,0.01,std(0x2F7BEA,{emissive:0x2F7BEA,emissiveIntensity:0.6}),g);caja(0.3,0.5,0.4,0.16,0.18,0.03,std(0x0E1B3D),g);
    K.cartel(0,1.6,0.405,0.8,0.22,"BEBIDAS FRÍAS","#163F8A","#fff",0,g);var l=new THREE.PointLight(0xDDEAFF,0.3,2.5,2);l.position.set(-0.1,1.1,0.6);g.add(l);sombra(0,0,1,0.9,g);return g};
  K.kioscoAmarillo=function(x,z,ry){var g=grupo(x,z,ry||0);obst(g);caja(0,0,0,0.7,1.75,0.6,std(0xFFD100,{roughness:0.5}),g);caja(0,1.75,0,0.7,0.35,0.6,std(0x1E5BC6),g);K.cartel(0,1.92,0.305,0.62,0.22,"Cerca de ti","#1E5BC6","#FFD100",0,g);
    var p=mesh(new THREE.PlaneGeometry(0.42,0.32),MT.pantalla,g);p.position.set(0,1.25,0.305);p.rotation.x=-0.25;caja(0,0.95,0.3,0.46,0.04,0.12,std(0x1C1E22),g);K.cartel(0,0.5,0.305,0.5,0.16,"PAGA Y RECARGA","#1E5BC6","#fff",0,g);sombra(0,0,0.8,0.7,g);return g};
  K.barraVentana=function(x,z,largo,ry){var g=grupo(x,z,ry||0);obst(g);var mad=pbr("madera",{color:0xD8B98A,roughness:0.5,env:0.6,w:largo,d:0.45});caja(0,1.02,0,largo,0.04,0.45,mad,g);for(var k=0;k<=Math.floor(largo/1.6);k++){var xx=-largo/2+0.3+k*(largo-0.6)/Math.max(1,Math.floor(largo/1.6));caja(xx,0,-0.1,0.05,1.02,0.05,MT.aceroOsc,g)}
    var n=Math.max(2,Math.round(largo/0.9));for(var i=0;i<n;i++){var sx=-largo/2+0.45+i*(largo-0.9)/(n-1);var st=new THREE.Group();st.position.set(sx,0,0.45);g.add(st);cil(0,0.01,0,0.2,0.2,0.02,MT.aceroOsc,st);cil(0,0.03,0,0.025,0.025,0.72,MT.cromo,st);cil(0,0.75,0,0.17,0.17,0.05,std(0x2B3038,{roughness:0.5}),st);var ar=mesh(new THREE.TorusGeometry(0.16,0.012,6,16),MT.cromo,st);ar.rotation.x=PI/2;ar.position.y=0.3}
    sombra(0,0.3,largo,1.1,g);return g};
  K.torreSnacks=function(x,z){var g=grupo(x,z,0);obst(g);var rojo=std(0xC8102E,{roughness:0.5});caja(0,0,0,0.55,0.06,0.55,rojo,g);caja(0,0,0,0.06,1.7,0.06,rojo,g);for(var n=0;n<4;n++){caja(0,0.18+n*0.38,0,0.55,0.02,0.55,rojo,g);for(var i=0;i<6;i++){var a=i/6*2*PI,l=K.prodLata(0.035,0.26,(n*2+i)%14,g);l.position.set(Math.cos(a)*0.19,0.19+n*0.38,Math.sin(a)*0.19)}}
    caja(0,1.7,0,0.5,0.22,0.5,rojo,g);K.cartel(0,1.75,0.251,0.46,0.14,"SNACKS 2 × 1","#C8102E","#fff",0,g);sombra(0,0,0.7,0.7,g);return g};
  var cacheCap={};function geoCapsula(r,len){var k=r+"|"+len;if(cacheCap[k])return cacheCap[k];var pts=[];for(var i=0;i<=8;i++){var a=-PI/2+PI/2*i/8;pts.push(new THREE.Vector2(Math.cos(a)*r,-len/2+Math.sin(a)*r))}for(var i=0;i<=8;i++){var a=PI/2*i/8;pts.push(new THREE.Vector2(Math.cos(a)*r,len/2+Math.sin(a)*r))}return cacheCap[k]=new THREE.LatheGeometry(pts,12)}
  K.rodilloPerros=function(x,y,z,ry,padre){var g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=(ry||0)*RAD;(padre||mundo).add(g);var acero=std(0xC9CDD4,{metalness:0.85,roughness:0.3}),salch=std(0xB8402A,{roughness:0.45,metalness:0.05});
    caja(0,0,0,0.8,0.14,0.5,acero,g);var rod=[];for(var i=0;i<6;i++){var r=cil(0,0.15,-0.2+i*0.075,0.016,0.016,0.74,MT.cromo,g);r.rotation.z=PI/2;rod.push(r)}
    for(var i=0;i<5;i++)for(var k=0;k<3;k++){var s=mesh(geoCapsula(0.014,0.12),salch,g);s.rotation.z=PI/2;s.position.set(-0.3+k*0.3+(i%2)*0.02,0.18,-0.165+i*0.075);s.castShadow=true}
    caja(0,0.03,0.0,0.84,0.012,0.56,acero,g);var tapa=caja(0,0.2,-0.12,0.84,0.012,0.3,new THREE.MeshPhysicalMaterial({color:0xDCEBF5,transparent:true,opacity:0.2,roughness:0.03,clearcoat:1,depthWrite:false}),g);tapa.rotation.x=0.35;tapa.position.set(0,0.29,-0.33);
    for(var i=0;i<4;i++){var pan=mesh(geoCapsula(0.028,0.1),std(0xD9A045,{roughness:0.6}),g);pan.rotation.z=PI/2;pan.position.set(-0.27+i*0.18,0.07,-0.36)}
    var l=new THREE.PointLight(0xFF9A4A,0.35,1.2,2);l.position.set(0,0.3,0);g.add(l);
    [[0xC8342B,"KÉTCHUP"],[0xF2C230,"MOSTAZA"],[0xF4F0E0,"MAYONESA"],[0xE0782A,"AJÍ"]].forEach(function(c,i){var b=cil(0.5+i*0.07,0,0.1,0.028,0.024,0.14,std(c[0],{roughness:0.4}),g);cil(0.5+i*0.07,0.14,0.1,0.01,0.004,0.03,std(0x1C1E22),g)});
    K.cartel(0,0.34,-0.22,0.6,0.1,"PERROS 2 × 1","#E30613","#FFD100",0,g);return g};
  K.estacionCafe=function(x,z,ry){var g=grupo(x,z,ry||0);obst(g);var negro=std(0x1C1E22,{roughness:0.5}),amar=std(0xFFD100,{roughness:0.5}),acero=std(0xC9CDD4,{metalness:0.85,roughness:0.3});
    caja(0,0,0,2.0,0.92,0.65,negro,g);caja(0,0.5,0.33,2.0,0.12,0.01,amar,g);caja(0,0.92,0,2.06,0.04,0.7,acero,g);caja(0,0.05,0.0,2.0,0.03,0.65,amar,g);
    K.cafeBarra(-0.55,0.96,-0.05,0,g);K.cafeBarra(0.1,0.96,-0.05,0,g);
    [[0.6,0.045,0.12],[0.72,0.04,0.1],[0.84,0.035,0.08]].forEach(function(v){for(var k=0;k<4;k++)cil(v[0],0.96+k*0.012,-0.12,v[1],v[1]*0.8,v[2],std(0xF2F2F0,{roughness:0.6}),g)});
    for(var k=0;k<6;k++)cil(0.62,0.96+k*0.006,0.12,0.045,0.045,0.005,std(0x2B2B2B,{roughness:0.5}),g);
    caja(0.85,0.96,0.12,0.12,0.09,0.09,acero,g);for(var k=0;k<12;k++)caja(0.82+(k%4)*0.02,0.98,0.09+Math.floor(k/4)*0.025,0.012,0.07,0.012,[std(0xF4F4F2),std(0xE0782A),std(0x8CC152)][k%3],g);
    caja(-0.9,0.96,0.15,0.14,0.06,0.14,std(0xF4F4F2,{roughness:0.9}),g);cil(-0.9,0.96,-0.1,0.02,0.02,0.1,std(0xF4F4F2),g);
    K.cartel(0,1.0,0.335,1.2,0.14,"barra · café del día","#1C1E22","#FFD100",0,g);K.cartel(0,0.3,0.33,1.6,0.14,"SÍRVETE TU CAFÉ","#FFD100","#1C1E22",0,g);
    var bas=cil(-1.25,0,0.1,0.18,0.15,0.7,std(0x3A3F48,{roughness:0.6}),g);cil(-1.25,0.7,0.1,0.19,0.19,0.04,amar,g);sombra(0,0,2.2,0.8,g);return g};
  K.bandejaComida=function(p,i){var g=new THREE.Group();(p||mundo).add(g);var com=[[0xE9D9A0,0xC8782A],[0x6A8F3A,0xE9D9A0],[0xD9A045,0x8CC152],[0xB8402A,0xE9D9A0]][i%4];caja(0,0,0,0.19,0.035,0.14,std(com[0],{roughness:0.9}),g);caja(0.04,0.02,0.02,0.07,0.03,0.06,std(com[1],{roughness:0.8}),g);
    var t=caja(0,0,0,0.2,0.06,0.15,matPET(),g);t.renderOrder=2;caja(0,0.06,0,0.2,0.004,0.15,matPET(),g);var faja=caja(0.0,0.0,0,0.07,0.064,0.152,std(0xC8102E,{roughness:0.6}),g);K.cartel(0,0.03,0.077,0.066,0.03,"Almuerzos","#C8102E","#FFD100",0,g);return g};
  K.nevera=function(x,z,col,ry){var g=grupo(x,z,ry||0),W=0.86,H=2.05,Dp=0.72,marco=std(col.marco!=null?col.marco:0x3A3F48,{metalness:col.marco!=null?0.2:0.4,roughness:0.45});obst(g);
    caja(0,0,0,W,0.12,Dp,marco,g);caja(0,H-0.18,0,W,0.18,Dp,marco,g);caja(-W/2+0.03,0,0,0.06,H,Dp,marco,g);caja(W/2-0.03,0,0,0.06,H,Dp,marco,g);caja(0,0,-Dp/2+0.03,W,H,0.06,std(0xEEF3F8,{emissive:0xDDE8FF,emissiveIntensity:0.55}),g);
    K.cartel(0,H-0.09,Dp/2+0.005,W-0.1,0.12,col.marca,col.fondo,"#fff",0,g);
    var bot=[];for(var n=0;n<4;n++){var y=0.16+n*0.45;caja(0,y,0,W-0.12,0.015,Dp-0.12,std(0xCFE6F5,{transparent:true,opacity:0.5}),g);for(var q=-0.26;q<=0.26;q+=0.13)caja(q,y+0.015,0,0.004,0.004,Dp-0.14,MT.cromo,g);
      if(col.comida){for(var i=0;i<3;i++)for(var j=0;j<3;j++){var bd=K.bandejaComida(g,i+n+j);bd.position.set(-0.24+i*0.24,y+0.016+(j===2&&n<2?0.065:0),-0.2+j*0.18);if(j===2)bot.push(bd)}continue}
      var tipo=n===3?"lata":(n===0?"grande":"med"),nx=tipo==="lata"?6:(tipo==="grande"?4:5),paso=(W-0.16)/nx;
      for(var i=0;i<nx;i++)for(var j=0;j<3;j++){var cx=-(W-0.16)/2+paso*(i+0.5),cz=-0.2+j*0.17,c=col.bot[(i+n+j)%col.bot.length],b;
        if(tipo==="lata"){b=K.prodLata(0.033,0.12,(i*3+n+j)%14,g);b.position.set(cx,y+0.016,cz)}else{b=K.prodBotella(tipo==="grande"?0.046:0.036,tipo==="grande"?0.36:0.27,c,g);b.position.set(cx,y+0.016,cz);b.rotation.y=rnd()*0.6-0.3}
        if(j===2)bot.push(b)}}
    var piv=new THREE.Group();piv.position.set(-W/2+0.02,0,Dp/2+0.02);g.add(piv);var pw=W-0.04,alu=std(0x2B3038,{metalness:0.5,roughness:0.35});
    caja(pw/2,0.08,0,pw,0.09,0.05,alu,piv);caja(pw/2,H-0.27,0,pw,0.09,0.05,alu,piv);caja(0.035,0.08,0,0.07,H-0.26,0.05,alu,piv);caja(pw-0.035,0.08,0,0.07,H-0.26,0.05,alu,piv);
    caja(pw/2,0.16,0,pw-0.1,H-0.42,0.012,std(0xBFDDF2,{transparent:true,opacity:0.3,roughness:0.03,metalness:0.2,depthWrite:false}),piv);var man=caja(pw-0.09,0.75,0.05,0.03,0.55,0.03,MT.cromo,piv);
    var l=new THREE.PointLight(0xEAF3FF,0.25,2.2,2);l.position.set(0,1.2,0.1);g.add(l);sombra(0,0,W,Dp,g);
    g.userData={piv:piv,man:man,bot:bot,abrir:function(f){piv.rotation.y=-f*1.75}};return g};

  K.camara=function(pos,mira,o){o=o||{};E.cctvMira=mira.slice();E.cctvOpc=o;cctv.position.set(pos[0],pos[1],pos[2]);cctv.fov=o.fov||70;cctv.aspect=16/9;cctv.lookAt(mira[0],mira[1],mira[2]);cctv.updateProjectionMatrix();cctv.updateMatrixWorld();
    var g=new THREE.Group();g.position.copy(cctv.position);g.quaternion.copy(cctv.quaternion);add(g);E.camGrupo=g;E.huellas=[];
    var cuerpo=mesh(new THREE.BoxGeometry(0.18,0.16,0.42),MT.blanco,g);cuerpo.position.z=0.12;var lente=mesh(new THREE.CylinderGeometry(0.06,0.06,0.04,16),MT.negro,g);lente.rotation.x=PI/2;lente.position.z=-0.1;var vis=mesh(new THREE.CylinderGeometry(0.075,0.065,0.08,16,1,true),MT.blanco,g);vis.rotation.x=PI/2;vis.position.z=-0.08;
    var brazo=mesh(new THREE.BoxGeometry(0.05,0.05,0.3),MT.blanco,g);brazo.position.set(0,0.1,0.35);
    var led=mesh(new THREE.SphereGeometry(0.018,8,6),MT.luzRoja,g);led.position.set(0.06,0.05,-0.1);
    var lejos=o.alcance||12,hh=Math.tan(cctv.fov*RAD/2)*lejos,ww=hh*cctv.aspect;
    var geo=new THREE.BufferGeometry(),v=[0,0,0,-ww,-hh,-lejos,ww,-hh,-lejos,ww,hh,-lejos,-ww,hh,-lejos];
    geo.setAttribute("position",new THREE.Float32BufferAttribute(v,3));geo.setIndex([0,1,2,0,2,3,0,3,4,0,4,1]);
    var colC=o.color!=null?o.color:0x3B82F6;
    var cono=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:colC,transparent:true,opacity:o.op!=null?o.op:0.06,side:THREE.DoubleSide,depthWrite:false}));g.add(cono);
    var aristas=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:colC,transparent:true,opacity:o.op!=null?Math.min(1,o.op*5):0.3}));g.add(aristas);
    if(o.huella){var pts=[];[[-ww,-hh],[ww,-hh],[ww,hh],[-ww,hh]].forEach(function(c){var dir=new THREE.Vector3(c[0],c[1],-lejos).applyQuaternion(g.quaternion).normalize();var p0=g.position;var tt=dir.y<-0.02?-p0.y/dir.y:lejos/1;tt=Math.min(tt,lejos*1.2);pts.push([p0.x+dir.x*tt,p0.z+dir.z*tt])});
      var sh=new THREE.Shape();pts.forEach(function(p,i){if(i)sh.lineTo(p[0],-p[1]);else sh.moveTo(p[0],-p[1])});var hm=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:colC,transparent:true,opacity:0.16,depthWrite:false,side:THREE.DoubleSide}));hm.rotation.x=-PI/2;hm.position.y=0.014;hm.renderOrder=2;hm.userData.sinObst=true;add(hm);E.huellas.push(hm);
      var bl=linea(pts.concat([pts[0]]).map(function(p){return[p[0],0.022,p[1]]}),colC);bl.renderOrder=3;E.huellas.push(bl);g.userData.huella=hm}
    if(o.etiqueta&&E.capaEtq){var q=K.etiqueta((o.id||"CAM")+(o.sub?" · "+o.sub:""),o.clase||"cam",K.punto(pos[0],pos[1]+0.28,pos[2]));g.userData.etq=q}
    if(!o.secundaria){E.cono=cono;E.conoA=aristas;E.camId=o.id||"CAM 03"}return g};

  var NAV={obs:[],grid:null};
  function cajaReal(tg){var b=new THREE.Box3(),c=new THREE.Box3();tg.traverse(function(m){if(!m.isMesh||m.userData.sinObst||!m.geometry)return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();c.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);b.union(c)});return b}
  function recogerObstaculos(){NAV.obs=[];NAV.grid=null;mundo.updateMatrixWorld(true);mundo.traverse(function(o){var ob=o.userData&&o.userData.obst;if(!ob)return;var tg=ob===true?o:(ob.isObject3D?ob:null);if(!tg)return;var b=cajaReal(tg);if(!isFinite(b.min.x))return;if(b.max.y<0.25)return;NAV.obs.push({ax:b.min.x,az:b.min.z,bx:b.max.x,bz:b.max.z})})}
  var CEL=0.25,HOLG=0.3;
  function rejilla(){if(NAV.grid)return NAV.grid;var w=(E.piso?E.piso.w:16)+14,d=(E.piso?E.piso.d:11)+14,nx=Math.ceil(w/CEL),nz=Math.ceil(d/CEL),ox=-w/2,oz=-d/2,bl=new Uint8Array(nx*nz);
    NAV.obs.forEach(function(o){var i0=Math.max(0,Math.ceil((o.ax-HOLG-ox)/CEL)),i1=Math.min(nx-1,Math.floor((o.bx+HOLG-ox)/CEL)),j0=Math.max(0,Math.ceil((o.az-HOLG-oz)/CEL)),j1=Math.min(nz-1,Math.floor((o.bz+HOLG-oz)/CEL));for(var i=i0;i<=i1;i++)for(var j=j0;j<=j1;j++)bl[j*nx+i]=1});
    return NAV.grid={nx:nx,nz:nz,ox:ox,oz:oz,bl:bl}}
  function celda(G,x,z){return[Math.max(0,Math.min(G.nx-1,Math.round((x-G.ox)/CEL))),Math.max(0,Math.min(G.nz-1,Math.round((z-G.oz)/CEL)))]}
  function libre(x,z){var G=rejilla(),c=celda(G,x,z);return!G.bl[c[1]*G.nx+c[0]]}
  function dentroObs(x,z,h){h=h||HOLG;for(var i=0;i<NAV.obs.length;i++){var o=NAV.obs[i];if(x>o.ax-h&&x<o.bx+h&&z>o.az-h&&z<o.bz+h)return true}return false}
  function cercaLibre(x,z){if(!dentroObs(x,z,HOLG))return[x,z];var mejor=null,md=1e9;for(var r=0.1;r<=2.5;r+=0.1)for(var a=0;a<2*PI;a+=PI/16){var px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(!dentroObs(px,pz,HOLG*1.02)){var d=r;if(d<md){md=d;mejor=[px,pz]}}}return mejor||[x,z]}
  function celdaLibre(G,c){if(!G.bl[c[1]*G.nx+c[0]])return c;for(var r=1;r<12;r++)for(var dz=-r;dz<=r;dz++)for(var dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;var x=c[0]+dx,z=c[1]+dz;if(x<0||z<0||x>=G.nx||z>=G.nz)continue;if(!G.bl[z*G.nx+x])return[x,z]}return c}
  function visible(a,b){var n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/0.1));for(var k=0;k<=n;k++){var t=k/n;if(dentroObs(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,HOLG*0.9))return false}return true}
  function Monticulo(){this.a=[]}
  Monticulo.prototype.push=function(f,i){var a=this.a;a.push([f,i]);var k=a.length-1;while(k>0){var p=(k-1)>>1;if(a[p][0]<=a[k][0])break;var t=a[p];a[p]=a[k];a[k]=t;k=p}};
  Monticulo.prototype.pop=function(){var a=this.a,top=a[0],u=a.pop();if(a.length){a[0]=u;var k=0,n=a.length;for(;;){var l=2*k+1,r=l+1,m=k;if(l<n&&a[l][0]<a[m][0])m=l;if(r<n&&a[r][0]<a[m][0])m=r;if(m===k)break;var t=a[m];a[m]=a[k];a[k]=t;k=m}}return top};
  function aEstrella(a,b){var G=rejilla(),s=celda(G,a[0],a[1]),e=celda(G,b[0],b[1]),nx=G.nx,nz=G.nz,N=nx*nz,g=new Float32Array(N).fill(1e9),padre=new Int32Array(N).fill(-1),cer=new Uint8Array(N),abierto=new Monticulo(),si=s[1]*nx+s[0],ei=e[1]*nx+e[0];
    e=celdaLibre(G,e);ei=e[1]*nx+e[0];s=celdaLibre(G,s);si=s[1]*nx+s[0];
    function h(i){var x=i%nx,z=(i/nx)|0,dx=Math.abs(x-e[0]),dz=Math.abs(z-e[1]);return Math.max(dx,dz)+0.414*Math.min(dx,dz)}
    g[si]=0;abierto.push(h(si),si);var it=0;
    while(abierto.a.length&&it++<80000){var cur=abierto.pop()[1];if(cer[cur])continue;cer[cur]=1;if(cur===ei)break;
      var cx=cur%nx,cz=(cur/nx)|0;for(var dz=-1;dz<=1;dz++)for(var dx=-1;dx<=1;dx++){if(!dx&&!dz)continue;var x=cx+dx,z=cz+dz;if(x<0||z<0||x>=nx||z>=nz)continue;var ni=z*nx+x;if(G.bl[ni]||cer[ni])continue;if(dx&&dz&&(G.bl[cz*nx+x]||G.bl[z*nx+cx]))continue;
        var ng=g[cur]+(dx&&dz?1.414:1);if(ng<g[ni]){g[ni]=ng;padre[ni]=cur;abierto.push(ng+h(ni),ni)}}}
    if(padre[ei]<0&&ei!==si)return null;var ruta=[],i=ei;while(i>=0){ruta.push([G.ox+(i%nx)*CEL,G.oz+((i/nx)|0)*CEL]);if(i===si)break;i=padre[i]}ruta.reverse();ruta[0]=[a[0],a[1]];ruta[ruta.length-1]=[b[0],b[1]];return ruta}
  function simplificar(r){if(r.length<3)return r;var out=[r[0]],i=0;while(i<r.length-1){var j=r.length-1;while(j>i+1&&!visible(r[i],r[j]))j--;out.push(r[j]);i=j}return out}
  function redondear(r){if(r.length<3)return r;var out=[r[0]];for(var i=1;i<r.length-1;i++){var a=r[i-1],b=r[i],c=r[i+1],d1=Math.hypot(b[0]-a[0],b[1]-a[1]),d2=Math.hypot(c[0]-b[0],c[1]-b[1]),k=Math.min(0.45,d1*0.4,d2*0.4);if(k<0.05){out.push(b);continue}
    var p=[b[0]+(a[0]-b[0])/d1*k,b[1]+(a[1]-b[1])/d1*k],q=[b[0]+(c[0]-b[0])/d2*k,b[1]+(c[1]-b[1])/d2*k],arco=[],ok=true;for(var s=0;s<=4;s++){var t=s/4,u=1-t,px=u*u*p[0]+2*u*t*b[0]+t*t*q[0],pz=u*u*p[1]+2*u*t*b[1]+t*t*q[1];if(dentroObs(px,pz,HOLG*0.75))ok=false;arco.push([px,pz])}
    if(ok)out.push.apply(out,arco);else out.push(b)}out.push(r[r.length-1]);return out}
  function camino(a,b){if(visible(a,b))return[a,b];var r=aEstrella(a,b);
    if(!r){var h0=HOLG,g0=NAV.grid;[0.24,0.16].some(function(h){HOLG=h;NAV.grid=null;r=aEstrella(a,b);return !!r});HOLG=h0;NAV.grid=g0}
    if(!r){console.log("ERROR camino sin salida "+a+" -> "+b);return[a,b]}return redondear(simplificar(r))}
  K.camino=camino;K.libre=libre;K.cercaLibre=cercaLibre;K._visible=visible;K._astar=aEstrella;K._rejilla=rejilla;K._holg=function(){return HOLG};K._simpl=simplificar;K._red=redondear;K.dentro=function(x,z,h){return dentroObs(x,z,h||0)};

  var MODELO=null,CLIPS={},SUPERFICIE=null,ALTO_MODELO=180;
  function nombreHueso(b){return b.name.replace(/[:_]/g,"")}
  function huesoMano(o,lado){var b=null;o.traverse(function(n){if(n.isBone&&nombreHueso(n)==="mixamorig"+lado+"Hand")b=n});return b}
  var GRUPOS={chaqueta:["Hips","Spine","Spine1","Spine2","LeftShoulder","RightShoulder","LeftArm","RightArm","LeftForeArm","RightForeArm"],
    camisa:["Hips","Spine","Spine1","Spine2","LeftShoulder","RightShoulder","LeftArm","RightArm"],chaleco:["Hips","Spine","Spine1","Spine2","LeftShoulder","RightShoulder"],
    pantalon:["Hips","LeftUpLeg","RightUpLeg","LeftLeg","RightLeg"],zapatos:["LeftFoot","RightFoot","LeftToeBase","RightToeBase","LeftToeEnd","RightToeEnd"]};
  var cachePrenda={},SUAVIZADO={chaqueta:6,camisa:3,chaleco:6,pantalon:2,zapatos:0};
  function suavizar(g,pesos,iter){if(!iter)return;var pos=g.attributes.position,n=pos.count,idx=g.index?g.index.array:null,tri=idx?idx.length:n,key={},uni=new Int32Array(n),uc=0,px=pos.array;
    for(var i=0;i<n;i++){var k=(px[i*3]*1e4|0)+","+(px[i*3+1]*1e4|0)+","+(px[i*3+2]*1e4|0);if(key[k]==null)key[k]=uc++;uni[i]=key[k]}
    var vec=[];for(var u=0;u<uc;u++)vec.push([]);function liga(a,b){a=uni[a];b=uni[b];if(a!==b){vec[a].push(b);vec[b].push(a)}}
    for(var t=0;t<tri;t+=3){var a=idx?idx[t]:t,b=idx?idx[t+1]:t+1,c=idx?idx[t+2]:t+2;liga(a,b);liga(b,c);liga(c,a)}
    var rep=new Int32Array(uc);for(var i=0;i<n;i++)rep[uni[i]]=i;var P=new Float32Array(px),Q=new Float32Array(n*3);
    function paso(lam){for(var u=0;u<uc;u++){var vs=vec[u],r=rep[u];if(!vs.length){Q[r*3]=P[r*3];Q[r*3+1]=P[r*3+1];Q[r*3+2]=P[r*3+2];continue}var sx=0,sy=0,sz=0;for(var j=0;j<vs.length;j++){var q=rep[vs[j]];sx+=P[q*3];sy+=P[q*3+1];sz+=P[q*3+2]}
        var w=lam*Math.min(1,pesos[r]*1.6);Q[r*3]=P[r*3]+(sx/vs.length-P[r*3])*w;Q[r*3+1]=P[r*3+1]+(sy/vs.length-P[r*3+1])*w;Q[r*3+2]=P[r*3+2]+(sz/vs.length-P[r*3+2])*w}
      for(var i=0;i<n;i++){var r=rep[uni[i]];P[i*3]=Q[r*3];P[i*3+1]=Q[r*3+1];P[i*3+2]=Q[r*3+2]}}
    for(var it=0;it<iter;it++){paso(0.5);paso(-0.53)}
    pos.array.set(P);pos.needsUpdate=true;g.computeVertexNormals()}
  function geomPrenda(sk,grupo){var k=grupo;if(cachePrenda[k])return cachePrenda[k];var g=sk.geometry.clone(),si=g.attributes.skinIndex,sw=g.attributes.skinWeight,bones=sk.skeleton.bones,n=si.count,arr=new Float32Array(n),set={};
    GRUPOS[grupo].forEach(function(nm){bones.forEach(function(b,i){if(nombreHueso(b)==="mixamorig"+nm)set[i]=1})});
    var ia=si.array,wa=sw.array,is=si.itemSize,ws_=sw.itemSize;for(var i=0;i<n;i++){var s=0;for(var c=0;c<4;c++){if(set[ia[i*is+c]])s+=wa[i*ws_+c]}arr[i]=s}
    g.setAttribute("prenda",new THREE.BufferAttribute(arr,1));suavizar(g,arr,SUAVIZADO[grupo]||0);return cachePrenda[k]=g}
  var TEJIDOS={tela:["Fabric030",7],cuero:["Leather037",5],jean:["Fabric030",10]};
  function matPrenda(color,o){o=o||{};var tj=TEJIDOS[o.tejido||"tela"],base=TEXDIR+tj[0]+"/"+tj[0]+"_1K-JPG_";
    var m=new THREE.MeshStandardMaterial({color:color,roughness:o.roughness!=null?o.roughness:0.92,metalness:0,envMapIntensity:o.tejido==="cuero"?0.5:0.12,skinning:true,normalMap:cargarTex(base+"NormalGL.jpg",false,tj[1],tj[1]),roughnessMap:cargarTex(base+"Roughness.jpg",false,tj[1],tj[1])});
    m.normalScale=new THREE.Vector2(o.relieve||0.6,o.relieve||0.6);m.color.convertSRGBToLinear();var inflar=(o.inflar||1.2)*ALTO_MODELO/180,cierre=o.cierre?1:0,corte=o.corte||0.55,abrir={value:o.abrir||0};m.userData.abrir=abrir;
    m.onBeforeCompile=function(sh){sh.uniforms.uInflar={value:inflar};sh.uniforms.uCierre={value:cierre};sh.uniforms.uEsc={value:ALTO_MODELO/180};sh.uniforms.uAbrir=abrir;
      var caida=o.caida?"float yc=position.y/uEsc;float holg=1.0+"+o.caida.toFixed(2)+"*smoothstep(138.0,118.0,yc)*smoothstep(90.0,108.0,yc)*step(abs(position.x)/uEsc,22.0);\n":"float holg=1.0;\n";
      sh.vertexShader="attribute float prenda;varying float vPrenda;varying vec3 vLocal;uniform float uInflar;uniform float uEsc;\n"+sh.vertexShader.replace("#include <skinning_vertex>",caida+"#include <skinning_vertex>\ntransformed+=objectNormal*uInflar*holg;vPrenda=prenda;vLocal=position;");
      sh.fragmentShader="varying float vPrenda;varying vec3 vLocal;uniform float uCierre;uniform float uEsc;uniform float uAbrir;\n"+sh.fragmentShader.replace("#include <clipping_planes_fragment>",
          "if(vPrenda<"+corte.toFixed(2)+")discard;\n"+
          "float yy=vLocal.y/uEsc,xx=abs(vLocal.x)/uEsc;float enFrente=step(2.0,vLocal.z/uEsc)*step(92.0,yy)*step(yy,152.0);float vv=uAbrir*(0.55+0.45*clamp((yy-92.0)/60.0,0.0,1.0));\n"+
          "if(uAbrir>0.01&&enFrente>0.5&&xx<vv)discard;\n#include <clipping_planes_fragment>")
        .replace("#include <color_fragment>","#include <color_fragment>\nif(uCierre>0.5&&xx<0.9&&enFrente>0.5)diffuseColor.rgb*=0.42;\nif(uAbrir>0.01&&enFrente>0.5&&xx<vv+3.5)diffuseColor.rgb*=0.72;\nif(uAbrir>0.01&&enFrente>0.5&&xx<vv+0.6)diffuseColor.rgb*=0.55;\n"+
          (o.costuras?"if(vPrenda<"+(corte+0.08).toFixed(2)+")diffuseColor.rgb*=0.62;if(abs(vLocal.x)/uEsc>18.0&&abs(vLocal.x)/uEsc<19.5)diffuseColor.rgb*=0.8;\n":""))};
    m.customProgramCacheKey=function(){return"prenda"+corte+cierre};return m}
  K.vestir=function(P,ropa){ropa=ropa||{};var sk=P.piel;if(!sk)return;function capa(grupo,color,o){var g=geomPrenda(sk,grupo),m=new THREE.SkinnedMesh(g,matPrenda(color,o));m.bind(sk.skeleton,sk.bindMatrix);m.castShadow=true;m.frustumCulled=false;m.renderOrder=1;sk.parent.add(m);P.prendas.push(m);return m}
    if(ropa.pantalon!=null)capa("pantalon",ropa.pantalon,{inflar:1.5,roughness:0.9,tejido:"jean",relieve:0.5});
    if(ropa.zapatos!=null)capa("zapatos",ropa.zapatos,{inflar:0.8,roughness:0.5,tejido:"cuero",relieve:0.35});
    if(ropa.camisa!=null)capa("camisa",ropa.camisa,{inflar:1.8,roughness:0.85,relieve:0.45,corte:0.12});
    if(ropa.chaqueta!=null){var abierta=ropa.cierre===false;P.chaqueta=capa("chaqueta",ropa.chaqueta,{inflar:2.6,caida:0.45,corte:0.42,roughness:ropa.tejido==="cuero"?0.5:0.95,cierre:!abierta,abrir:abierta?(ropa.abrir||3.2):0,tejido:ropa.tejido||"tela",relieve:0.7,costuras:true});
      var nk=P.hueso("Neck");if(nk){var wn=new THREE.Vector3();nk.getWorldScale(wn);var cu=mesh(new THREE.TorusGeometry(0.072,0.024,10,24),P.chaqueta.material.clone(),nk);cu.material.skinning=false;cu.material.onBeforeCompile=function(){};cu.material.customProgramCacheKey=function(){return"cuello"};cu.scale.setScalar(1/wn.x);cu.rotation.x=PI/2;cu.position.y=-0.015/wn.x;cu.castShadow=true}}
    if(ropa.chaleco!=null)capa("chaleco",ropa.chaleco,{inflar:2.0,roughness:0.6,corte:0.6,relieve:0.8});
    if(ropa.gorra!=null){var h=P.hueso("Head");if(h){var ws=new THREE.Vector3();h.getWorldScale(ws);var g=new THREE.Group();g.scale.setScalar(1/ws.x);var mt=std(ropa.gorra,{roughness:0.7});var co=mesh(new THREE.SphereGeometry(0.115,18,12,0,PI*2,0,PI*0.5),mt,g);co.position.y=0.03;var vi=mesh(new THREE.BoxGeometry(0.16,0.012,0.11),mt,g);vi.position.set(0,0.035,0.13);vi.rotation.x=-0.15;g.position.y=0.08/ws.x;h.add(g)}}};
  var TONOS=[0xE8C3A3,0xD9A67E,0xC68B5E,0xA8714B,0x8B5A3C,0x6E4630,0xF1D4BD,0xB07A52],
    PANT=[0x2B3447,0x3A3F4A,0x4A4F5C,0x26324A,0x5A5147,0x1E2433,0x6B7B9A,0x8A7A5E,0x1F1F23,0x3F5A7A,0xB9B4A8,0x5C3A33],
    ZAP=[0x1C1E22,0x3A2F2A,0x2B3038,0xF2F2F0,0x8A6A48,0xC8342B,0x2F64C8],
    TOPS=[0x3F6FB5,0xB5543F,0x3E8E5A,0x7A5CB0,0xC8962E,0x4A5F80,0xA8445A,0x2E8A9E,0x8A6A48,0xF2F2F0,0x1C1E22,0xE0782A,0xF2C230,0x9ACD6B,0xE86AA6,0x6B4E33,0x9CD3F5,0x5C3A33];
  K.persona=function(o){o=o||{};if(!MODELO)return null;var obj=THREE.SkeletonUtils.clone(MODELO),piel=null;
    var tono=o.piel!=null?o.piel:TONOS[Math.floor(rnd()*TONOS.length)],tc=new THREE.Color(tono).convertSRGBToLinear(),jt=tc.clone().multiplyScalar(0.7);
    obj.traverse(function(m){if(m.isMesh){m.castShadow=true;m.frustumCulled=false;var mt=m.material.clone();if(/Joints/i.test(mt.name)){mt.color=jt;mt.envMapIntensity=0.3;mt.roughness=0.5}else{mt.color=tc;mt.roughness=0.62;mt.metalness=0;mt.envMapIntensity=0.3;if(m.isSkinnedMesh)piel=m}mt.transparent=true;m.material=mt}});
    var s=o.escala;if(s==null){var esNino=!o.ropa&&o.color!==0xD9442E&&!o.adulto&&rnd()<0.14;s=esNino?rndEntre(0.58,0.72):rndEntre(0.89,1.07);if(esNino)o.gorra=o.gorra||[0xE5484D,0x3B82F6,0xF2C230][Math.floor(rnd()*3)]}
    var ancho=o.ancho!=null?o.ancho:(o.escala!=null?1:rndEntre(0.86,1.22));var raiz=new THREE.Group();raiz.add(obj);add(raiz);raiz.scale.set(s*ancho,s,s*ancho);
    if(ancho>1.1){var hb=null;obj.traverse(function(q){if(!hb&&q.isBone&&nombreHueso(q)==="mixamorigSpine1")hb=q});if(hb)hb.scale.set(1,1,1+(ancho-1.1)*1.6)}
    var mx=new THREE.AnimationMixer(obj),A={};Object.keys(CLIPS).forEach(function(n){A[n]=mx.clipAction(CLIPS[n]);A[n].play();A[n].setEffectiveWeight(n==="idle"?1:0)});
    A.walk.timeScale=1.05;A.idle.time=rnd()*4;A.walk.time=rnd()*1.1;
    var P={raiz:raiz,obj:obj,piel:piel,prendas:[],mx:mx,A:A,w:{},ruta:o.ruta||[[0,0,0]],rot:o.rot!=null?o.rot*RAD:0,etiqueta:null,caja:null,estado:o.estado||"vigila",tipo:o.tipo||"persona",alto:1.8*s,visible:true,
      caida:0,pelea:0,extra:{},vel:0,evita:o.evita!==false};
    Object.keys(A).forEach(function(n){P.w[n]=n==="idle"?1:0});
    P.mano=function(lado){return huesoMano(obj,lado||"Right")};P.hueso=function(n){var b=null;obj.traverse(function(q){if(!b&&q.isBone&&nombreHueso(q)==="mixamorig"+n)b=q});return b};
    P.sostener=function(m,lado,off){var b=P.mano(lado);if(!b)return m;var ws=new THREE.Vector3();b.getWorldScale(ws);m.scale.multiplyScalar(1/ws.x);b.add(m);if(off)m.position.set(off[0]/ws.x,off[1]/ws.x,off[2]/ws.x);return m};
    var col=o.color!=null?o.color:TOPS[Math.floor(rnd()*TOPS.length)],ropa=o.ropa||{};
    if(!o.ropa){var ch=rnd(),ch2=rnd();ropa={pantalon:PANT[Math.floor(rnd()*PANT.length)],zapatos:ZAP[Math.floor(rnd()*ZAP.length)]};
      if(ch<0.4){ropa.chaqueta=col;ropa.cierre=ch2<0.5;if(ch2>0.75||!ropa.cierre)ropa.camisa=TOPS[Math.floor(rnd()*TOPS.length)];if(rnd()<0.25)ropa.tejido="cuero"}
      else if(ch<0.6){ropa.camisa=col;ropa.chaleco=ch2<0.5?TOPS[Math.floor(rnd()*TOPS.length)]:PANT[Math.floor(rnd()*PANT.length)]}
      else ropa.camisa=col;
      if(o.gorra||(rnd()<0.22&&!o.sinGorra))ropa.gorra=o.gorra||[col,0x1C1E22,0xF2F2F0,0xC8342B,0x2F64C8][Math.floor(rnd()*5)]}
    P.ropa=ropa;K.vestir(P,ropa);
    P.compilar=function(){var r=P.ruta,tr=[];
      for(var i=0;i<r.length;i++){var pa=cercaLibre(r[i][1],r[i][2]);if(!r[i]._copia){r[i]=r[i].slice();r[i]._copia=true}r[i][1]=pa[0];r[i][2]=pa[1]}
      for(i=0;i<r.length;i++){var a=r[i],b=r[i+1];
        if(!b){tr.push({t0:a[0],t1:1e9,pts:[[a[1],a[2],0]],len:0,accion:a[3]||"idle",mira:a});break}
        var dist=Math.hypot(b[1]-a[1],b[2]-a[2]);if(dist<0.02){var wp=(b[3]!=null||b[4]!=null)?b:a;tr.push({t0:a[0],t1:b[0],pts:[[a[1],a[2],0]],len:0,accion:wp[3]||"idle",mira:wp});continue}
        var c=camino([a[1],a[2]],[b[1],b[2]]),pts=[],acc=0;for(var k=0;k<c.length;k++){if(k)acc+=Math.hypot(c[k][0]-c[k-1][0],c[k][1]-c[k-1][1]);pts.push([c[k][0],c[k][1],acc])}
        tr.push({t0:a[0],t1:b[0],pts:pts,len:acc,accion:b[3]==="corre"?"run":"walk",mira:a})}P.tramos=tr};
    P.donde=function(t){var tr=P.tramos;if(!tr)P.compilar(),tr=P.tramos;var T=tr[0];if(t<=T.t0){return{x:T.pts[0][0],z:T.pts[0][1],a:"idle",dir:null,mira:T.mira,vel:0}}
      for(var i=0;i<tr.length;i++){T=tr[i];if(t<T.t1){if(T.len===0)return{x:T.pts[0][0],z:T.pts[0][1],a:T.accion,dir:null,mira:T.mira,vel:0};
        var k=(t-T.t0)/(T.t1-T.t0),d=T.len*k,vel=T.len/(T.t1-T.t0),p=T.pts,j=1;while(j<p.length-1&&p[j][2]<d)j++;var p0=p[j-1],p1=p[j],seg=p1[2]-p0[2],u=seg>1e-6?(d-p0[2])/seg:0;
        return{x:p0[0]+(p1[0]-p0[0])*u,z:p0[1]+(p1[1]-p0[1])*u,a:T.accion,dir:[p1[0]-p0[0],p1[1]-p0[1]],mira:T.mira,vel:vel}}}
      T=tr[tr.length-1];return{x:T.pts[0][0],z:T.pts[0][1],a:T.accion,dir:null,mira:T.mira,vel:0}};
    PER.push(P);return P};
  var PER=[];
  function animarPersona(P,t,dt){var e=P.donde(t);
    var ex=0,ez=0;if(P.evita&&P.caida<=0&&!P.pelea){var rp=0.33*P.raiz.scale.x;for(var i=0;i<PER.length;i++){var O=PER[i];if(O===P||!O.visible||O.evita===false)continue;var dx=e.x-O.raiz.position.x,dz=e.z-O.raiz.position.z,d=Math.hypot(dx,dz),lim=rp+0.33*O.raiz.scale.x;if(d<lim&&d>0.001){var f=(lim-d)/lim*(e.dir?0.45:0.2);ex+=dx/d*f;ez+=dz/d*f}else if(d<=0.001){ex+=0.2}}}
    if((ex||ez)&&dentroObs(e.x+ex,e.z+ez,0.24)){ex=0;ez=0}
    P.ev=P.ev||{x:0,z:0};P.ev.x+=(ex-P.ev.x)*Math.min(1,dt*5);P.ev.z+=(ez-P.ev.z)*Math.min(1,dt*5);
    if((P.ev.x||P.ev.z)&&dentroObs(e.x+P.ev.x,e.z+P.ev.z,0.22)){P.ev.x=0;P.ev.z=0}
    if(P.despG&&(P.despG.x||P.despG.z)&&dentroObs(e.x+P.ev.x+P.despG.x,e.z+P.ev.z+P.despG.z,0.24))P.despG.set(0,0,0);
    P.despG=P.despG||new THREE.Vector3();P.raiz.position.x=e.x+P.ev.x+(P.desp?P.desp.x:0)+P.despG.x;P.raiz.position.z=e.z+P.ev.z+(P.desp?P.desp.z:0)+P.despG.z;P.despG.set(0,0,0);var obj=null;
    if(e.dir){obj=Math.atan2(e.dir[0],e.dir[1])}else if(e.mira&&e.mira[4]!=null){obj=Math.atan2(e.mira[4]-e.x,e.mira[5]-e.z)}
    if(obj!=null){var d2=obj-P.rot;while(d2>PI)d2-=2*PI;while(d2<-PI)d2+=2*PI;P.rot+=d2*Math.min(1,dt*(e.dir?6:4))}P.raiz.rotation.y=P.rot;
    var tw={};Object.keys(P.A).forEach(function(n){tw[n]=0});var acc=e.a;
    if(acc==="walk"||acc==="run")tw[acc]=1;else if(acc==="agree"||acc==="headShake"){tw.idle=1;tw[acc]=0.9}else if(acc==="sneak_pose"||acc==="sad_pose"){tw[acc]=1}else tw.idle=1;
    P.vel+=(e.vel-P.vel)*Math.min(1,dt*6);var zan=P.raiz.scale.y;if(acc==="walk")P.A.walk.timeScale=Math.max(0.55,Math.min(1.9,P.vel/(1.25*zan)));if(acc==="run")P.A.run.timeScale=Math.max(0.7,Math.min(1.8,P.vel/(3.2*zan)));
    if(P.pelea>0){tw.idle=0;tw.run=0.55;tw.agree=0.6;P.A.run.timeScale=1.6}else if(acc!=="run")P.A.run.timeScale=1;
    if(P.caida>0){Object.keys(tw).forEach(function(n){tw[n]=0});tw.sad_pose=1}
    Object.keys(tw).forEach(function(n){P.w[n]+=(tw[n]-P.w[n])*Math.min(1,dt*7);P.A[n].setEffectiveWeight(P.w[n])});P.mx.update(dt);
    var hd=huesoC(P,"Head");if(hd&&P.caida<=0&&!P.pelea&&!P.sinMirada){var giro=0;if(e.dir){var ob2=Math.atan2(e.dir[0],e.dir[1]),dd=ob2-P.rot;while(dd>PI)dd-=2*PI;while(dd<-PI)dd+=2*PI;giro=Math.max(-0.5,Math.min(0.5,dd*0.8))}else{giro=Math.sin(t*0.7+P.rot*3)*0.18+Math.sin(t*0.23)*0.1}P.mirada=(P.mirada||0)+(giro-(P.mirada||0))*Math.min(1,dt*3);hd.rotation.y+=P.mirada}
    comportamiento(P,t,dt,e);
    if(P.post)P.post(t,dt,e);
    P.obj.rotation.x=-P.caida*PI/2*0.98;P.obj.position.y=P.caida*0.12-(P.agacha||0)*0.33;P.obj.position.z=-P.caida*0.05;
    if(P.pelea>0){P.obj.position.z=Math.sin(t*9+P.extra.fase)*0.12*P.pelea;P.obj.rotation.z=Math.sin(t*7+P.extra.fase)*0.06*P.pelea}else if(P.caida<=0){P.obj.position.z=0;P.obj.rotation.z=0}
    P.raiz.visible=P.visible;return e}

  /* ---------------- comportamiento: mirar una góndola como una persona ----------------
     Al compilar la ruta, cada parada que queda frente a una góndola (a menos de 1,3 m y mirándola) se marca. Mientras la persona
     está en esa parada: gira hacia la góndola, recorre los estantes con la vista (arriba, abajo, a los lados), se agacha para ver el
     estante bajo, estira la mano a un producto, lo acerca a la cara y, si lleva canasta, lo guarda; si no, lo devuelve. */
  function gondolaCerca(x,z,mx,mz){var mejor=null,md=1e9;GOND.forEach(function(g){var gd=g.userData.gondola;g.updateMatrixWorld();var inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),p=new THREE.Vector3(x,0,z).applyMatrix4(inv);
      var dz=Math.abs(p.z)-gd.an/2,dentroX=Math.abs(p.x)<gd.largo/2+0.2;if(!dentroX||dz<0||dz>1.3)return;if(gd.unaCara&&p.z<0)return;
      var m=new THREE.Vector3(mx,0,mz).applyMatrix4(inv);if(Math.sign(m.z-p.z)===Math.sign(p.z))return;
      if(dz<md){md=dz;mejor={g:g,cara:p.z>0?1:-1,px:p.x,dist:dz}}});return mejor}
  K.gondolaCerca=gondolaCerca;
  function agachar(P,c){if(c<=0.001)return;var s=P.raiz.scale.y;[["LeftUpLeg",0.95],["RightUpLeg",0.95]].forEach(function(q){var b=huesoC(P,q[0]);if(b)b.rotation.x-=q[1]*c});
    [["LeftLeg",1.9],["RightLeg",1.9]].forEach(function(q){var b=huesoC(P,q[0]);if(b)b.rotation.x+=q[1]*c});[["LeftFoot",0.9],["RightFoot",0.9]].forEach(function(q){var b=huesoC(P,q[0]);if(b)b.rotation.x-=q[1]*c});
    var sp=huesoC(P,"Spine");if(sp)sp.rotation.x+=0.35*c;var sp1=huesoC(P,"Spine1");if(sp1)sp1.rotation.x+=0.2*c;P.agacha=c*s}
  K.agachar=agachar;
  function comportamiento(P,t,dt,e){P.agacha=0;if(P.sinAuto||P.caida>0||P.pelea>0)return;var par=e.a==="idle"&&e.mira&&e.mira._gond?e.mira:null;
    if(!par){P.cmp=null;return}
    if(!P.cmp||P.cmp.par!==par){P.cmp={par:par,t0:t,gd:par._gond,tomado:false,devuelto:false,prod:null,slot:null}}
    var C=P.cmp,a=t-C.t0,gd=C.gd,G=gd.g.userData.gondola;
    var dir=new THREE.Vector3(0,0,gd.cara).applyQuaternion(gd.g.quaternion);var obj=Math.atan2(-dir.x,-dir.z);var d2=obj-P.rot;while(d2>PI)d2-=2*PI;while(d2<-PI)d2+=2*PI;P.rot+=d2*Math.min(1,dt*4);P.raiz.rotation.y=P.rot;
    var fase=Math.floor(a/0.9),f=a/0.9-fase,MIR=[[0.3,-0.25],[0.35,0.3],[0.05,0.0],[-0.25,-0.3],[-0.3,0.25],[0.1,0.35],[0.3,-0.1],[0.0,0.2]],m0=MIR[((fase%8)+8)%8],m1=MIR[(((fase+1)%8)+8)%8],k=f<0.6?0:(f-0.6)/0.4;
    var pit=m0[0]+(m1[0]-m0[0])*k,yaw=m0[1]+(m1[1]-m0[1])*k;
    var ag=0;if(a>2.6&&a<5.2){ag=Math.min(1,(a-2.6)/0.7)*Math.min(1,(5.2-a)/0.7)}
    var alc=0,tg=null,leer=0;if(a>5.4&&a<7.4){alc=Math.min(1,(a-5.4)/0.6)*Math.min(1,(7.4-a)/0.3);
      if(!C.slot){var slots=gd.g.userData.slots.filter(function(s){return s.visible&&s.userData.cara===gd.cara&&Math.abs(s.position.x-gd.px)<0.6&&s.userData.n>=1&&s.userData.n<=2});C.slot=slots.length?slots[Math.floor(slots.length/2)]:null}
      if(C.slot){tg=C.slot.getWorldPosition(new THREE.Vector3());tg.y+=0.08}}
    if(a>7.0&&!C.tomado&&C.slot){C.tomado=true;var hijo=C.slot.children[C.slot.children.length-1];if(hijo){C.prod=hijo;K.agarrar(hijo,P,"Right")}}
    if(a>7.2&&a<9.2){leer=Math.min(1,(a-7.2)/0.5)*Math.min(1,(9.2-a)/0.5)}
    if(a>9.2&&C.prod&&!C.devuelto){C.devuelto=true;if(P.canasta){K.pegarA(C.prod,P.canasta);C.prod.position.set((rnd()-0.5)*0.2,0.12,(rnd()-0.5)*0.12);C.prod.rotation.set(0,rnd()*3,0.4)}else{K.pegarA(C.prod,C.slot)}}
    var h=huesoC(P,"Head"),n=huesoC(P,"Neck");var pit2=pit*(1-ag)+0.55*ag+0.25*leer,yaw2=yaw*(1-ag)*(1-leer);if(h){h.rotation.x+=pit2*0.6;h.rotation.y+=yaw2*0.6}if(n){n.rotation.x+=pit2*0.3;n.rotation.y+=yaw2*0.3}
    var torso=huesoC(P,"Spine1");if(torso)torso.rotation.x+=Math.max(0,pit)*0.25*(1-ag);
    agachar(P,ag);
    if(alc>0&&tg)K.ik(P,"Right",tg,alc);if(leer>0)K.ik(P,"Right",K.local(P,-0.08,1.32*P.raiz.scale.y,0.3),leer);
    if(P.canasta)K.ik(P,"Left",K.local(P,0.3,0.75*P.raiz.scale.y,0.05),0.85)}
  function cab(P,yaw,pitch){var h=huesoC(P,"Head"),n=huesoC(P,"Neck");if(h){h.rotation.y+=yaw*0.6;h.rotation.x+=(pitch||0)*0.6}if(n){n.rotation.y+=yaw*0.4;n.rotation.x+=(pitch||0)*0.3}}
  function tor(P,adelante,lado){var a=huesoC(P,"Spine"),b=huesoC(P,"Spine1");if(a){a.rotation.x+=adelante*0.6;a.rotation.z+=(lado||0)*0.5}if(b){b.rotation.x+=adelante*0.4;b.rotation.z+=(lado||0)*0.3}}
  function L(P,x,y,z){var s=P.raiz.scale.y;return K.local(P,x*s,y*s,z*s)}
  var GESTOS={
    telefono:function(P,t,k){K.ik(P,"Right",L(P,-0.1,1.56,0.12),k);cab(P,0.15*Math.sin(t*0.7),0.08);tor(P,0,0.04*Math.sin(t*0.9)*k)},
    celular:function(P,t,k){K.ik(P,"Left",L(P,0.16,1.2,0.3),k);K.ik(P,"Right",L(P,-0.05,1.18,0.32),k*0.7);cab(P,0.12*Math.sin(t*0.5),0.45*k)},
    nervioso:function(P,t,k){var q=Math.floor(t*1.6),f=t*1.6-q,S=[0.9,-0.8,0.3,-1,0.7,-0.4,1,-0.6],a=S[(q+7)%8],b=S[q%8];cab(P,(a+(b-a)*Math.min(1,f*4))*0.9*k,-0.1*k);
      var m=0.5+0.5*Math.sin(t*0.6);if(m>0.6)K.ik(P,"Right",L(P,-0.08,1.5,0.08),(m-0.6)/0.4*k);P.despG.x+=Math.sin(t*2.1)*0.03*k},
    sorpresa:function(P,t,k){K.ik(P,"Right",L(P,-0.3,1.45,0.3),k);K.ik(P,"Left",L(P,0.3,1.45,0.3),k);tor(P,-0.25*k,0);cab(P,0,-0.2*k);var r=P.rot;P.despG.x-=Math.sin(r)*0.25*k;P.despG.z-=Math.cos(r)*0.25*k},
    hablar:function(P,t,k){var w=0.5+0.5*Math.sin(t*2.4);K.ik(P,"Right",L(P,-0.25,1.1+0.15*w,0.35),k*0.8);K.ik(P,"Left",L(P,0.28,1.05+0.12*(1-w),0.3),k*0.6);cab(P,0.08*Math.sin(t*1.7),0.1*Math.sin(t*3.1)*k)},
    escuchar:function(P,t,k){K.ik(P,"Right",L(P,0.12,1.05,0.22),k*0.8);K.ik(P,"Left",L(P,-0.12,1.1,0.22),k*0.8);cab(P,0.12*k,0.08*Math.max(0,Math.sin(t*2.2))*k)},
    saludar:function(P,t,k){K.ik(P,"Right",L(P,-0.35+0.1*Math.sin(t*9),1.75,0.2),k);cab(P,0,-0.08*k)},
    senalar:function(P,t,k,tgt){if(!tgt)return;var d=new THREE.Vector3().copy(tgt).sub(P.raiz.position);d.y=0;d.normalize();var p=new THREE.Vector3(P.raiz.position.x+d.x*0.7,1.4*P.raiz.scale.y,P.raiz.position.z+d.z*0.7);K.ik(P,"Right",p,k);cab(P,Math.atan2(d.x,d.z)-P.rot,0)},
    prisa:function(P,t,k){tor(P,0.18*k,0);cab(P,0,-0.08*k)},
    retroceder:function(P,t,k){K.ik(P,"Right",L(P,-0.2,1.2,0.4),k);K.ik(P,"Left",L(P,0.2,1.2,0.4),k);tor(P,-0.2*k,0);var r=P.rot;P.despG.x-=Math.sin(r)*0.35*k;P.despG.z-=Math.cos(r)*0.35*k},
    agacharse:function(P,t,k){agachar(P,k);cab(P,0,0.35*k)},
    cabeza:function(P,t,k){K.ik(P,"Right",L(P,-0.12,1.75,0.05),k);K.ik(P,"Left",L(P,0.12,1.75,0.05),k);cab(P,0,-0.15*k)}};
  K.gesto=function(P,nombre,t,k,extra){var g=GESTOS[nombre];if(g&&k>0.001)g(P,t,Math.min(1,k),extra)};
  K.ventana=function(t,a,b,sube,baja){sube=sube||0.4;baja=baja||sube;if(t<a||t>b)return 0;return Math.min(1,(t-a)/sube,(b-t)/baja)};
  function marcarParadas(P){P.ruta.forEach(function(w){delete w._gond;if(w[3]&&w[3]!=="idle")return;if(w[4]==null)return;var g=gondolaCerca(w[1],w[2],w[4],w[5]);if(g)w._gond=g})}

  var _a=new THREE.Vector3(),_b=new THREE.Vector3(),_c=new THREE.Vector3(),_q=new THREE.Quaternion(),_qw=new THREE.Quaternion(),_qp=new THREE.Quaternion();
  function huesoC(P,n){P._h=P._h||{};if(!(n in P._h))P._h[n]=P.hueso(n);return P._h[n]}
  K.huesoC=huesoC;
  K.ik=function(P,lado,tgt,w){if(!tgt||!(w>0.001))return;var hand=huesoC(P,lado+"Hand"),cad=[huesoC(P,lado+"ForeArm"),huesoC(P,lado+"Arm"),huesoC(P,lado+"Shoulder")].filter(Boolean);if(!hand||!cad.length)return;
    var orig=cad.map(function(b){return b.quaternion.clone()});P.raiz.updateMatrixWorld(true);
    for(var it=0;it<7;it++)cad.forEach(function(b,i){if(i===2&&it>2)return;b.getWorldPosition(_a);hand.getWorldPosition(_b);_b.sub(_a);_c.copy(tgt).sub(_a);if(_b.lengthSq()<1e-8||_c.lengthSq()<1e-8)return;_b.normalize();_c.normalize();
      _q.setFromUnitVectors(_b,_c);if(i===2){_q.slerp(new THREE.Quaternion(),0.7)}b.getWorldQuaternion(_qw);_qw.premultiply(_q);b.parent.getWorldQuaternion(_qp);b.quaternion.copy(_qp.invert().multiply(_qw));b.updateMatrixWorld(true)});
    if(w<1)cad.forEach(function(b,i){var nq=b.quaternion.clone();b.quaternion.copy(orig[i]).slerp(nq,w)});P.raiz.updateMatrixWorld(true)};
  K.local=function(P,x,y,z){var r=P.rot,fx=Math.sin(r),fz=Math.cos(r),rx=-Math.cos(r),rz=Math.sin(r);return new THREE.Vector3(P.raiz.position.x+rx*x+fx*z,P.raiz.position.y+y,P.raiz.position.z+rz*x+fz*z)};
  K.manoPos=function(P,lado){var h=huesoC(P,(lado||"Right")+"Hand"),v=new THREE.Vector3();if(h)h.getWorldPosition(v);return v};
  K.agarrar=function(obj,P,lado){var h=huesoC(P,(lado||"Right")+"Hand");if(h){P.raiz.updateMatrixWorld(true);h.attach(obj)}return obj};
  K.pegarA=function(obj,padre){padre.updateMatrixWorld(true);padre.attach(obj);return obj};
  K.soltar=function(obj){mundo.updateMatrixWorld(true);mundo.attach(obj);return obj};
  var FIS=[];
  K.fisica=function(m,o){o=o||{};var F={m:m,v:new THREE.Vector3(),w:new THREE.Vector3(),activo:false,suelo:o.suelo!=null?o.suelo:0,reb:o.reb!=null?o.reb:0.35,fr:o.fr!=null?o.fr:0.55,alto:o.alto||0};
    F.lanzar=function(v,w){K.soltar(m);F.v.copy(v);if(w)F.w.copy(w);F.activo=true};
    F.hacia=function(dest,T){m.getWorldPosition(_a);return new THREE.Vector3((dest.x-_a.x)/T,(dest.y-_a.y)/T+0.5*9.8*T,(dest.z-_a.z)/T)};FIS.push(F);return F};
  function pasoFisica(dt){FIS.forEach(function(F){if(!F.activo)return;F.v.y-=9.8*dt;F.m.position.addScaledVector(F.v,dt);F.m.rotation.x+=F.w.x*dt;F.m.rotation.y+=F.w.y*dt;F.m.rotation.z+=F.w.z*dt;
    var s=typeof F.suelo==="function"?F.suelo(F.m.position):F.suelo;if(F.m.position.y-F.alto<s){F.m.position.y=s+F.alto;if(Math.abs(F.v.y)>0.7){F.v.y=-F.v.y*F.reb;F.v.x*=F.fr;F.v.z*=F.fr;F.w.multiplyScalar(0.5)}else{F.v.set(0,0,0);F.w.set(0,0,0);F.activo=false;if(F.alParar)F.alParar()}}})}
  K.tabla=function(titulo,cab,filas){var t=E.raiz.querySelector(".tabla3d");if(!t){t=document.createElement("div");t.className="tabla3d";E.raiz.appendChild(t)}
    var h="<b>"+titulo+"</b><table><tr>"+cab.map(function(c){return"<th>"+c+"</th>"}).join("")+"</tr>"+filas.map(function(f){return"<tr"+(f.cls?' class="'+f.cls+'"':"")+">"+f.c.map(function(c){return"<td>"+c+"</td>"}).join("")+"</tr>"}).join("")+"</table>";
    if(t._h!==h){t.innerHTML=h;t._h=h}return t};
  K.incendio=function(x,y,z,o){o=o||{};var techo=o.techo||3.4,I={int:0,x:x,y:y,z:z,r:o.r||0.2,quemar:o.quemar||[],sis:[]};
    var spr=tex(64,64,function(c,w,h){var g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(0.35,"rgba(255,255,255,.55)");g.addColorStop(1,"rgba(255,255,255,0)");c.fillStyle=g;c.fillRect(0,0,w,h)});
    function sistema(n,tam,mezcla,op){var g=new THREE.BufferGeometry(),p=new Float32Array(n*3),c=new Float32Array(n*3),al=new Float32Array(n),sz=new Float32Array(n).fill(tam);
      g.setAttribute("position",new THREE.BufferAttribute(p,3));g.setAttribute("color",new THREE.BufferAttribute(c,3));g.setAttribute("alfa",new THREE.BufferAttribute(al,1));g.setAttribute("tam",new THREE.BufferAttribute(sz,1));
      var mat=new THREE.ShaderMaterial({uniforms:{map:{value:spr},esc:{value:520}},vertexColors:true,transparent:true,depthWrite:false,blending:mezcla,
        vertexShader:"attribute float alfa;attribute float tam;uniform float esc;varying vec3 vC;varying float vA;void main(){vC=color;vA=alfa;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=tam*esc/max(0.1,-mv.z);gl_Position=projectionMatrix*mv;}",
        fragmentShader:"uniform sampler2D map;varying vec3 vC;varying float vA;void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(vC,vA*t.a);}"});
      var pts=new THREE.Points(g,mat);pts.renderOrder=7;pts.frustumCulled=false;add(pts);
      var S={g:g,p:p,c:c,al:al,sz:sz,base:tam,op:op,n:n,vida:new Float32Array(n).map(function(){return Math.random()}),v:Array.from({length:n},function(){return new THREE.Vector3()})};I.sis.push(S);return S}
    var nuc=sistema(160,0.28,THREE.AdditiveBlending,1),lla=sistema(340,0.5,THREE.NormalBlending,0.85),bra=sistema(80,0.06,THREE.AdditiveBlending,1),hum=sistema(420,1.1,THREE.NormalBlending,0.42);
    var capa=mesh(new THREE.PlaneGeometry(o.capaW||10,o.capaD||8),new THREE.MeshBasicMaterial({color:0x2a2a2e,transparent:true,opacity:0,depthWrite:false}));capa.rotation.x=PI/2;capa.position.set(x,techo-0.05,z);capa.castShadow=false;capa.receiveShadow=false;
    var luz=new THREE.PointLight(0xFF8A3A,0,9,2);luz.position.set(x,y+0.8,z);add(luz);I.luz=luz;I.capa=capa;var tAcum=0;if(o.niebla)scene.fog=new THREE.Fog(0x9a9ca2,30,40);
    function nace(S,i,tipo){var r=I.r*(tipo==="hum"?1.4:1),a=Math.random()*2*PI,d=Math.sqrt(Math.random())*r;S.p[i*3]=x+Math.cos(a)*d;S.p[i*3+1]=y+(tipo==="hum"?0.5:0);S.p[i*3+2]=z+Math.sin(a)*d;
      if(tipo==="bra")S.v[i].set((Math.random()-0.5)*1.6,1.5+Math.random()*2.2,(Math.random()-0.5)*1.6);else if(tipo==="hum")S.v[i].set((Math.random()-0.5)*0.25,0.9+Math.random()*0.6,(Math.random()-0.5)*0.25);else S.v[i].set((Math.random()-0.5)*0.15,1.3+Math.random()*1.3,(Math.random()-0.5)*0.15)}
    I.paso=function(dt){var k=I.int;tAcum+=dt*k;luz.intensity=k*(2.4+Math.sin(tAcum*31)*0.5+Math.random()*0.7);capa.material.opacity=Math.min(0.72,tAcum*0.05);
      [[nuc,"nuc",1.9],[lla,"lla",1.1],[bra,"bra",0.6],[hum,"hum",0.22]].forEach(function(q){var S=q[0],tipo=q[1],vel=q[2];for(var i=0;i<S.n;i++){S.vida[i]+=dt*vel*(0.7+Math.random()*0.6);if(S.vida[i]>1){S.vida[i]=0;nace(S,i,tipo)}
        var L=S.vida[i],v=S.v[i],j=i*3;if(tipo==="bra")v.y-=9.8*dt*0.5;if(tipo==="hum"&&S.p[j+1]>techo-0.25){S.p[j+1]=techo-0.25;var dx=S.p[j]-x,dz=S.p[j+2]-z,dd=Math.hypot(dx,dz)+0.01;v.set(dx/dd*0.9,0,dz/dd*0.9)}
        if(tipo==="lla"||tipo==="nuc"){v.x+=(Math.random()-0.5)*dt*2;v.z+=(Math.random()-0.5)*dt*2;S.p[j]+=(x-S.p[j])*dt*1.2;S.p[j+2]+=(z-S.p[j+2])*dt*1.2}
        S.p[j]+=v.x*dt;S.p[j+1]+=v.y*dt;S.p[j+2]+=v.z*dt;var a=k*(1-L);
        if(tipo==="hum"){var gr=0.16+0.22*L;S.c[j]=gr;S.c[j+1]=gr;S.c[j+2]=gr*1.04;S.al[i]=S.op*Math.min(1,k*1.4)*Math.sin(Math.PI*Math.min(1,L*1.15));S.sz[i]=S.base*(0.6+L*2.6)}
        else if(tipo==="nuc"){S.c[j]=1;S.c[j+1]=0.88;S.c[j+2]=0.5;S.al[i]=a;S.sz[i]=S.base*(1-L*0.6)}else if(tipo==="bra"){S.c[j]=1;S.c[j+1]=0.55;S.c[j+2]=0.1;S.al[i]=a}
        else{S.c[j]=1;S.c[j+1]=0.62-L*0.45;S.c[j+2]=0.06;S.al[i]=S.op*a*(L<0.15?L/0.15:1);S.sz[i]=S.base*(1.15-L*0.75)}}
        S.g.attributes.position.needsUpdate=true;S.g.attributes.color.needsUpdate=true;S.g.attributes.alfa.needsUpdate=true;S.g.attributes.tam.needsUpdate=true});if(scene.fog){var nf=Math.max(2,26-tAcum*1.6);scene.fog.near=nf*0.3;scene.fog.far=nf+6}
      I.quemar.forEach(function(m){if(!m.material._q){m.material=m.material.clone();m.material._q=m.material.color.clone()}m.material.color.copy(m.material._q).lerp(new THREE.Color(0x15110d),Math.min(1,tAcum*0.07))})};
    PART.push(I);return I};

  var CAJAS=[];
  K.recuadro=function(P,o){o=o||{};var g=new THREE.BoxGeometry(o.w||0.75,o.h||(P.alto?P.alto+0.1:1),o.d||0.6);g.translate(0,(o.y||0)+(o.h||(P.alto?P.alto+0.1:1))/2,0);
    var l=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:COL[o.estado||"vigila"],transparent:true,opacity:0.95,depthTest:false}));l.renderOrder=10;add(l);
    var R_={l:l,P:P,estado:o.estado||"vigila",texto:o.texto||"",pip:o.pip!==false,w:o.w||0.75,h:o.h||(P.alto||1),d:o.d||0.6,visible:true,fijo:o.fijo||null};
    R_.set=function(est,txt){R_.estado=est;l.material.color.setHex(COL[est]||est);if(R_.dash)R_.dash.color.setHex(COL[est]||est);if(txt!=null)R_.texto=txt};
    R_.ocultar=function(b){if(b===R_.oculto)return;R_.oculto=b;if(!R_.dash){l.computeLineDistances();R_.dash=new THREE.LineDashedMaterial({color:l.material.color.getHex(),dashSize:0.12,gapSize:0.09,transparent:true,depthTest:false});R_.lin=l.material}l.material=b?R_.dash:R_.lin};CAJAS.push(R_);return R_};
  K.zona=function(pts,o){o=o||{};var sh=new THREE.Shape();pts.forEach(function(p,i){if(i)sh.lineTo(p[0],-p[1]);else sh.moveTo(p[0],-p[1])});
    var m=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:COL[o.estado||"vigila"],transparent:true,opacity:o.op||0.22,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-PI/2;m.position.y=(o.y||0)+0.012;m.renderOrder=2;add(m);
    var b=linea(pts.concat([pts[0]]).map(function(p){return[p[0],(o.y||0)+0.02,p[1]]}),COL[o.estado||"vigila"]);b.renderOrder=3;
    var Z={m:m,b:b,op:o.op||0.22,pulso:0};Z.set=function(est,pulso){var c=COL[est]||est;m.material.color.setHex(c);b.material.color.setHex(c);Z.pulso=pulso?1:0};ZONAS.push(Z);return Z};
  var ZONAS=[];
  K.lineaCruce=function(a,b,o){o=o||{};var c=COL[o.estado||"oro"]||COL.oro,y=0.03;var l=linea([[a[0],y,a[1]],[b[0],y,b[1]]],c);
    var dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),nx=-dz/L,nz=dx/L,mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
    var cinta=mesh(new THREE.PlaneGeometry(L,0.12),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.85,depthWrite:false}));cinta.rotation.x=-PI/2;cinta.rotation.z=Math.atan2(-dz,dx);cinta.position.set(mx,0.02,mz);cinta.castShadow=false;
    var fl=mesh(new THREE.ConeGeometry(0.22,0.5,3),new THREE.MeshBasicMaterial({color:c}));fl.position.set(mx+nx*0.6,0.05,mz+nz*0.6);fl.rotation.x=PI/2;fl.rotation.z=-Math.atan2(nx,nz);fl.scale.set(1,1,0.2);fl.castShadow=false;
    return{cinta:cinta,flecha:fl,set:function(est){var cc=COL[est]||est;cinta.material.color.setHex(cc);fl.material.color.setHex(cc)},n:[nx,nz],a:a,b:b}};
  K.anillo=function(x,z,r,o){o=o||{};var m=mesh(new THREE.RingGeometry(r*0.86,r,64),new THREE.MeshBasicMaterial({color:COL[o.estado||"vigila"],transparent:true,opacity:o.op||0.8,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-PI/2;m.position.set(x,0.03,z);m.renderOrder=4;m.castShadow=false;
    return{m:m,set:function(est){m.material.color.setHex(COL[est]||est)},arco:function(f){m.geometry.dispose();m.geometry=new THREE.RingGeometry(r*0.86,r,64,1,PI/2,-Math.max(0.001,f)*2*PI)}}};
  K.calor=function(w,d,o){o=o||{};var N=128,cv=document.createElement("canvas");cv.width=cv.height=N;var cx=cv.getContext("2d"),acc=new Float32Array(N*N),t=new THREE.CanvasTexture(cv);
    var m=mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,opacity:0.9}));m.rotation.x=-PI/2;m.position.set(o.x||0,0.015,o.z||0);m.renderOrder=1;m.castShadow=false;m.receiveShadow=false;
    var img=cx.createImageData(N,N),max=1;
    function lut(v){var s=[[0,[40,90,255,0]],[0.25,[40,180,255,150]],[0.5,[60,220,120,170]],[0.72,[255,210,40,200]],[1,[235,50,40,230]]];for(var i=1;i<s.length;i++)if(v<=s[i][0]){var a=s[i-1],b=s[i],k=(v-a[0])/(b[0]-a[0]);return a[1].map(function(q,j){return q+(b[1][j]-q)*k})}return s[4][1]}
    var C={m:m,sumar:function(x,z,p){var u=(x-(o.x||0))/w+0.5,v=(z-(o.z||0))/d+0.5,cx0=u*N,cy0=v*N,r=7;for(var i=-r;i<=r;i++)for(var j=-r;j<=r;j++){var xx=Math.round(cx0+i),yy=Math.round(cy0+j);if(xx<0||yy<0||xx>=N||yy>=N)continue;var g=Math.exp(-(i*i+j*j)/(r*r*0.35))*(p||1);acc[yy*N+xx]+=g;if(acc[yy*N+xx]>max)max=acc[yy*N+xx]}},
      pintar:function(){for(var k=0;k<N*N;k++){var c=lut(Math.min(1,Math.pow(acc[k]/max,0.45)));img.data[k*4]=c[0];img.data[k*4+1]=c[1];img.data[k*4+2]=c[2];img.data[k*4+3]=acc[k]>0.02?c[3]:0}cx.putImageData(img,0,0);t.needsUpdate=true},
      limpiar:function(){acc.fill(0);max=1}};return C};
  var PART=[];
  K.fuego=function(x,y,z,o){o=o||{};var n=o.n||140,g=new THREE.BufferGeometry(),p=new Float32Array(n*3),c=new Float32Array(n*3),vida=new Float32Array(n),v=[];for(var i=0;i<n;i++){vida[i]=Math.random();v.push([0,0,0])}
    g.setAttribute("position",new THREE.BufferAttribute(p,3));g.setAttribute("color",new THREE.BufferAttribute(c,3));
    var spr=tex(64,64,function(x_,w,h){var gr=x_.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(0.4,"rgba(255,255,255,.5)");gr.addColorStop(1,"rgba(255,255,255,0)");x_.fillStyle=gr;x_.fillRect(0,0,w,h)});
    var humo=!!o.humo,mat=new THREE.PointsMaterial({size:humo?1.1:0.35,map:spr,vertexColors:true,transparent:true,depthWrite:false,blending:humo?THREE.NormalBlending:THREE.AdditiveBlending,opacity:humo?0.55:1});
    var pts=new THREE.Points(g,mat);pts.renderOrder=6;add(pts);var F={pts:pts,int:0,x:x,y:y,z:z,humo:humo,r:o.r||0.25};
    F.paso=function(dt){for(var i=0;i<n;i++){vida[i]+=dt*(humo?0.35:1.4)*(0.6+Math.random()*0.8);if(vida[i]>1){vida[i]=0;p[i*3]=x+(Math.random()-0.5)*F.r*2;p[i*3+1]=y;p[i*3+2]=z+(Math.random()-0.5)*F.r*2}
        var L=vida[i];p[i*3+1]+=dt*(humo?0.9:1.6)*(1-L*0.3);p[i*3]+=Math.sin(L*9+i)*dt*(humo?0.25:0.1);
        var a=F.int*(1-L);if(humo){c[i*3]=c[i*3+1]=c[i*3+2]=0.35*a+0.0001}else{c[i*3]=1*a;c[i*3+1]=(0.75-L*0.6)*a;c[i*3+2]=0.15*(1-L)*a}}
      g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true};PART.push(F);return F};

  var E={};
  var ETQ=[];
  K.etiqueta=function(txt,cls,fn){var el=document.createElement("div");el.className="etq "+(cls||"");el.innerHTML=txt;E.capaEtq.appendChild(el);var q={el:el,fn:fn,txt:txt};q.set=function(t,c){if(t!=null&&t!==q.txt){q.txt=t;el.innerHTML=t}if(c!=null)el.className="etq "+c};ETQ.push(q);return q};
  K.sobre=function(P,h){return function(){return P.visible?new THREE.Vector3(P.raiz.position.x,(h||P.alto+0.35)+P.raiz.position.y,P.raiz.position.z):null}};
  K.punto=function(x,y,z){var v=new THREE.Vector3(x,y,z);return function(){return v}};
  K.contador=function(nombre,valor){var c=E.tab.querySelector('[data-k="'+nombre+'"]');if(!c){c=document.createElement("div");c.className="ct";c.dataset.k=nombre;c.innerHTML="<span></span><b></b>";E.tab.appendChild(c);c.firstChild.textContent=nombre}
    c.lastChild.textContent=valor;return c};
  K.evento=function(texto,nivel){var li=document.createElement("li");li.className=nivel||"";li.innerHTML="<time>"+E.reloj(E.t)+"</time>"+texto;E.reg.insertBefore(li,E.reg.firstChild);while(E.reg.children.length>3)E.reg.removeChild(E.reg.lastChild);
    if(nivel==="alerta"){E.banner.querySelector("b").textContent=texto;E.banner.classList.remove("ver");void E.banner.offsetWidth;E.banner.classList.add("ver");E.raiz.classList.add("roja");clearTimeout(E.tRoja);E.tRoja=setTimeout(function(){E.raiz.classList.remove("roja")},900)}};

  var actual=null,reloj=new THREE.Clock(),proj=new THREE.Vector3(),pipRect={x:0,y:0,w:0,h:0},vivo=false;
  function liberar(){mundo.traverse(function(o){if(o.geometry&&!o.isSkinnedMesh)o.geometry.dispose();if(o.material){[].concat(o.material).forEach(function(m){if(m._comp)return;if(m.map&&!m.map._comp&&m.map!==TX.baldosa)m.map.dispose();m.dispose()})}});
    scene.fog=null;while(mundo.children.length)mundo.remove(mundo.children[0]);PER.length=0;FIS.length=0;CAJAS.length=0;ZONAS.length=0;PART.length=0;ETQ.length=0;NAV.obs=[];NAV.grid=null;GOND.length=0}
  Object.keys(TX).forEach(function(k){TX[k]._comp=true});
  function montarDom(raiz){var q=function(s){return raiz.querySelector(s)};raiz.insertBefore(lienzo,raiz.firstChild);
    if(E.raiz&&E.raiz!==raiz)E.raiz.classList.remove("viva");raiz.classList.add("viva");E.raiz=raiz;E.capaEtq=q(".etqs");E.tab=q(".tablero");E.reg=q(".registro");E.banner=q(".banner");E.estado=q(".estado");E.pip=q(".pip");E.pipCv=q(".pip canvas");E.pipTxt=q(".pip .cam");E.barra=q(".tiempo i");
    E.capaEtq.innerHTML="";var tb=raiz.querySelector(".tabla3d");if(tb)tb.remove();E.tab.innerHTML="";E.reg.innerHTML="";E.banner.classList.remove("ver");raiz.classList.remove("roja");
    E.reloj=function(t){var b=E.horaBase||(14*3600+22*60),s=Math.floor(b+t);return String(Math.floor(s/3600)%24).padStart(2,"0")+":"+String(Math.floor(s/60)%60).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}}
  M.fijar=function(raiz){M.fijo=raiz||null};
  M.vista="maqueta";M.ponerVista=function(v){M.vista=v==="cctv"?"cctv":"maqueta";controles.enabled=M.vista!=="cctv";if(E.raiz)E.raiz.classList.toggle("vcctv",M.vista==="cctv");tamano()};
  M.montar=function(raiz,def){if(!M.listo)return false;if(M.fijo&&raiz!==M.fijo)return false;liberar();montarDom(raiz);E.def=def;E.t=0;E.fase=-1;E.horaBase=def.hora||null;E.piso=null;semilla=(def.semilla||7)+1;
    var c=(window.MARCA==="franq"&&def.camaraFranq)||def.camara||{pos:[9,9,13],mira:[0,0.6,0]};camara.position.set(c.pos[0],c.pos[1],c.pos[2]);controles.target.set(c.mira[0],c.mira[1],c.mira[2]);camara.fov=c.fov||34;camara.updateProjectionMatrix();controles.update();
    E.tocado=false;E.cono=null;E.camGrupo=null;E.huellas=[];tamano();var asp=camara.aspect||1.6,k=Math.max(1,1.62/asp)*1.04;camara.position.sub(controles.target).multiplyScalar(k).add(controles.target);controles.update();E.camBase=camara.position.clone();E.ang=0;
    E.upd=def.armar(K)||function(){};E.dur=def.dur||16;E.fases=def.fases||[];actual=def;
    recogerObstaculos();PER.forEach(function(P){try{P.compilar();marcarParadas(P)}catch(e){console.log("ERROR camino "+(e&&e.message))}});
    tamano();reloj.getDelta();vivo=true;
    raiz.dataset.fase="";var pasos=raiz.closest(".diapo")?raiz.closest(".diapo").querySelectorAll(".pasos li"):[];E.pasos=pasos;return true};
  M.detener=function(){vivo=false};
  controles.addEventListener("start",function(){E.tocado=true;clearTimeout(E.tVuelta);});
  controles.addEventListener("end",function(){clearTimeout(E.tVuelta);E.tVuelta=setTimeout(function(){E.tocado=false},6000)});
  function tamano(){if(!E.raiz)return;var w=E.raiz.clientWidth,h=E.raiz.clientHeight;if(!w||!h)return;R.setSize(w,h,false);lienzo.style.width=w+"px";lienzo.style.height=h+"px";camara.aspect=w/h;camara.updateProjectionMatrix();
    var pw=Math.round(Math.min(w*0.34,h*0.42*16/9)),ph=Math.round(pw*9/16),m=Math.round(Math.max(10,w*0.016));pipRect={x:w-pw-m,y:m+Math.round(h*0.12),w:pw,h:ph};if(M.vista==="cctv"){pipRect={x:0,y:0,w:w,h:h};pw=w;ph=h;cctv.aspect=w/h;cctv.updateProjectionMatrix()}else if(Math.abs(cctv.aspect-16/9)>1e-3){cctv.aspect=16/9;cctv.updateProjectionMatrix()}
    if(E.pip){E.pip.style.cssText="left:"+pipRect.x+"px;top:"+pipRect.y+"px;width:"+pw+"px;height:"+ph+"px";E.pipCv.width=pw*2;E.pipCv.height=ph*2}}
  window.addEventListener("resize",function(){tamano()});
  M.tamano=tamano;
  function pasoMundo(t,dt){PER.forEach(function(P){animarPersona(P,t,dt)});E.upd(t,dt);PART.forEach(function(F){F.paso(dt)});pasoFisica(dt)}
  function fase(t){var f=-1;E.fases.forEach(function(x,i){if(t>=x[0])f=i});return f}
  function cuadro(){if(!vivo||!actual){return}if(M.manual&&!M._paso)return;var dt=Math.min(0.05,reloj.getDelta());if(window.__PRUEBA||M._paso)dt=1/30;
    if(M.tExt&&!M._paso){var tt=M.tExt();if(tt!=null&&isFinite(tt)){tt=Math.max(0,Math.min(E.dur-1e-3,tt));if(tt<E.t-0.12||tt>E.t+1.5){M.montar(E.raiz,actual);if(tt>0.02)M.saltar(tt);return}if(tt-E.t>0.06)M.saltar(tt-0.03);dt=Math.max(0,tt-E.t)}}
    E.t+=dt;if(E.t>=E.dur){if(M._paso||M.tExt){E.t=E.dur-1e-6}else{E.t=0;if(actual.reiniciar!==false){M.montar(E.raiz,actual);return}}}var t=E.t;pasoMundo(t,dt);
    if(!E.tocado&&!lento){var a=Math.sin(t/E.dur*2*PI)*0.08,r=E.camBase.clone().sub(controles.target);r.applyAxisAngle(new THREE.Vector3(0,1,0),a-(E.ang||0));E.ang=a;camara.position.copy(controles.target).add(r)}
    controles.update();
    var ff=fase(t);if(ff!==E.fase){E.fase=ff;var est=ff>=0?E.fases[ff][1]:"vigila";E.estado.dataset.e=est;E.estado.querySelector("b").textContent={vigila:"Vigilando",detecta:"Detectando",alerta:"Alerta",ok:"Resuelto"}[est]||est;
      E.raiz.dataset.fase=est;[].forEach.call(E.pasos,function(li,i){li.classList.toggle("en",i===ff);li.classList.toggle("ya",i<ff)})}
    ZONAS.forEach(function(Z){if(Z.pulso)Z.m.material.opacity=Z.op+0.2*(0.5+0.5*Math.sin(t*8));else Z.m.material.opacity=Z.op});
    CAJAS.forEach(function(C){var P=C.P;if(C.fijo){C.l.position.set(C.fijo[0],C.fijo[1],C.fijo[2])}else if(P&&P.raiz){C.l.position.copy(P.raiz.position);C.l.rotation.y=P.rot;C.l.visible=C.visible&&P.visible;
      if(P.caida>0.3){C.l.rotation.x=0}}else C.l.visible=C.visible});
    E.barra.style.transform="scaleX("+(t/E.dur)+")";
    var w=lienzo.clientWidth,h=lienzo.clientHeight;var vc=M.vista==="cctv";if(E.camGrupo)E.camGrupo.visible=!vc;(E.huellas||[]).forEach(function(o){o.visible=!vc});
    R.setScissorTest(false);R.setViewport(0,0,w,h);R.clear();R.render(scene,vc?cctv:camara);
    if(vc){if(E.pip)dibujarPip(t)}else if(E.pip&&!E.def.sinPip){if(E.cono){E.cono.visible=false;E.conoA.visible=false}var pr=pipRect,y=h-pr.y-pr.h;R.setScissorTest(true);R.setScissor(pr.x,y,pr.w,pr.h);R.setViewport(pr.x,y,pr.w,pr.h);R.clear();R.render(scene,cctv);R.setScissorTest(false);
      if(E.cono){E.cono.visible=true;E.conoA.visible=true}dibujarPip(t)}
    var W=w,H=h;ETQ.forEach(function(q){var p=q.fn&&q.fn(t);if(!p){q.el.hidden=true;return}proj.copy(p).project(vc?cctv:camara);if(proj.z>1){q.el.hidden=true;return}q.el.hidden=false;q.el.style.transform="translate(-50%,-100%) translate("+((proj.x*0.5+0.5)*W).toFixed(1)+"px,"+((-proj.y*0.5+0.5)*H).toFixed(1)+"px)"});
  }
  function dibujarPip(t){var cv=E.pipCv,x=cv.getContext("2d"),W=cv.width,H=cv.height;x.clearRect(0,0,W,H);
    var fz=M.vista==="cctv"?0.55:1;x.font="700 "+Math.round(H*0.055*fz)+"px Archivo,Arial";x.textBaseline="bottom";var v=new THREE.Vector3();
    CAJAS.forEach(function(C){if(!C.pip||!C.l.visible)return;var mn=[1e9,1e9],mxv=[-1e9,-1e9],ok=false;C.l.updateMatrixWorld();
      var hw=C.w/2,hd=C.d/2;[[-hw,0,-hd],[hw,0,-hd],[-hw,0,hd],[hw,0,hd],[-hw,C.h,-hd],[hw,C.h,-hd],[-hw,C.h,hd],[hw,C.h,hd]].forEach(function(q){v.set(q[0],q[1],q[2]).applyMatrix4(C.l.matrixWorld).project(cctv);if(v.z<1&&v.z>-1){ok=true;var px=(v.x*0.5+0.5)*W,py=(-v.y*0.5+0.5)*H;mn[0]=Math.min(mn[0],px);mn[1]=Math.min(mn[1],py);mxv[0]=Math.max(mxv[0],px);mxv[1]=Math.max(mxv[1],py)}});
      if(!ok||mxv[0]<0||mn[0]>W||mxv[1]<0||mn[1]>H)return;var c=HEX(COL[C.estado]||C.estado);x.strokeStyle=c;x.lineWidth=Math.max(2,H*0.008);x.setLineDash(C.oculto?[8,6]:[]);x.strokeRect(mn[0],mn[1],mxv[0]-mn[0],mxv[1]-mn[1]);x.setLineDash([]);
      if(C.texto){var tw=x.measureText(C.texto).width+10,th=H*0.07*fz;x.fillStyle=c;x.fillRect(mn[0],mn[1]-th,tw,th);x.fillStyle=C.estado==="detecta"||C.estado==="staff"?"#1a1200":"#fff";x.fillText(C.texto,mn[0]+5,mn[1]-th*0.12)}});
    if(E.pipExtra)E.pipExtra(x,W,H,cctv,t);
    E.pipTxt.textContent=(E.camId||"CAM 03")+" · "+E.reloj(t)}
  M.pip=function(fn){E.pipExtra=fn};
  M.proyectarCctv=function(p){var v=new THREE.Vector3(p[0],p[1],p[2]).project(cctv);return[(v.x*0.5+0.5),(-v.y*0.5+0.5)]};
  function bucle(){requestAnimationFrame(bucle);try{cuadro()}catch(e){console.log("ERROR cuadro "+(e&&e.message)+" "+(e&&e.stack&&e.stack.split("\n")[1]));vivo=false}}
  function torsoNeutro(g){var p=g.attributes.position,a=p.array,n=p.count,esc=ALTO_MODELO/1.8,y0=1.13*esc,y1=1.44*esc,zb=0.088*esc;
    for(var i=0;i<n;i++){var x=a[i*3],y=a[i*3+1],z=a[i*3+2];if(y<y0||y>y1||z<=zb||Math.abs(x)>0.17*esc)continue;var w=Math.min(1,(y-y0)/(0.06*esc),(y1-y)/(0.06*esc));var k=1-0.72*w*(1-Math.min(1,Math.abs(x)/(0.17*esc)));a[i*3+2]=zb+(z-zb)*k}
    p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox()}
  M.arrancar=function(cb){var url=window.PERSONA_GLB||"persona.glb";
    var fin=function(gl){gl.animations.forEach(function(c){CLIPS[c.name]=c});["agree","headShake"].forEach(function(n){if(CLIPS[n]){CLIPS[n]=CLIPS[n].clone();THREE.AnimationUtils.makeClipAdditive(CLIPS[n])}});
      MODELO=gl.scene;MODELO.traverse(function(m){if(m.isSkinnedMesh&&!/Joints/i.test(m.material.name)){SUPERFICIE=m;m.geometry.computeBoundingBox();ALTO_MODELO=m.geometry.boundingBox.max.y-m.geometry.boundingBox.min.y;torsoNeutro(m.geometry)}});
      M.listo=true;bucle();cb&&cb()};
    var err=function(e){console.log("ERROR modelo "+(e&&e.message||e));M.listo=true;bucle();cb&&cb()};
    if(window.PERSONA_B64){try{var bin=atob(window.PERSONA_B64),buf=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);new THREE.GLTFLoader().parse(buf.buffer,"",fin,err)}catch(e){err(e)}}
    else new THREE.GLTFLoader().load(url,fin,undefined,err)};
  M.saltar=function(t){var dt=1/30;while(E.t+dt<t){E.t+=dt;pasoMundo(E.t,dt)}};M.manual=false;M.cuadroManual=function(){M._paso=true;try{cuadro()}finally{M._paso=false}return E.t};M.K=K;M.E=E;M.camara=camara;M.cctv=cctv;M.renderer=R;M.nav=NAV;M.PER=PER;M.scene=scene;M.controles=controles;
})();
