/* ---------- Maqueta 3D del Planificador de video analítica (Vigías) ----------
   Recibe una EscenaPlan (src/lib/vision/plan.ts) ya resuelta en metros y la arma con el motor (motor.js):
   zonas con su mobiliario, muros con puertas y vanos, gente que camina con sentido, cada cámara con su cono y su huella,
   y lo que hace cada analítica (recuadros en la vista de cámara, líneas de cruce, zonas, mapa de calor, contadores, eventos).
   Protocolo (postMessage, origen "*", solo datos sin secretos):
     padre → iframe  {tipo:"vigias-plan", escena, cam?, vista?}     monta o remonta la escena completa
     padre → iframe  {tipo:"vigias-plan-cam", cam}                  cambia la cámara activa (−1 = recorrido cada 6 s)
     padre → iframe  {tipo:"vigias-plan-vista", vista}              "maqueta" | "cctv"
     iframe → padre  {tipo:"vigias-plan", listo|montado|cam|evento|error}
   ?demo=1 monta sola la escena de ejemplo (supermercado). */
(function(){
  "use strict";
  var raiz=document.getElementById("escena"),reposo=raiz.querySelector(".reposo"),chip=raiz.querySelector(".chip3d");
  var q=new URLSearchParams(location.search);
  var DUR=24,RAD=Math.PI/180;
  function avisar(m){var d=Object.assign({tipo:"vigias-plan"},m);(window.__planLog=window.__planLog||[]).push(d);if(window.__planLog.length>60)window.__planLog.shift();
    try{if(parent&&parent!==window)parent.postMessage(d,"*")}catch(e){}}
  var M=window.MOTOR;
  if(!window.THREE||!THREE.GLTFLoader||!THREE.SkeletonUtils||!M||typeof M.arrancar!=="function"||!M.K){reposo.textContent="No se pudo cargar la vista 3D. Revise la conexión y recargue.";avisar({error:"sin-webgl"});return}

  /* ------------------------------ catálogo: nombres de respaldo ------------------------------ */
  var NOMBRES={seguimiento:"Seguimiento de personas",conteo:"Conteo de personas",demografia:"Demografía",calor:"Mapa de calor",permanencia:"Tiempo de permanencia",cruce:"Cruce de líneas",comprador:"Comprador activo",
    blancas:"Listas blancas",filas:"Gestión de filas y cajas",aforo:"Control de aforo",placas:"Lectura de placas y parqueo",staff:"Detección de personal",derrames:"Detección de derrames",guardian:"Guardián de puestos",
    negras:"Listas negras",merodeo:"Merodeo",intrusion:"Intrusión",acceso:"Acceso no autorizado",aglomeracion:"Aglomeración y tumulto",epp:"Equipo de protección (EPP)",caidas:"Detección de caídas",hurto:"Hurto",
    ocultaProd:"Ocultamiento de producto",armas:"Armas de fuego",blancas2:"Armas blancas",peleas:"Peleas",fuego:"Humo y fuego",abandono:"Abandono de objetos",rostro:"Ocultamiento de rostro",activos:"Retiro de activos",
    fleje:"Verificación de etiqueta",canastillas:"Inventario de canastillas y cajas",puertas:"Puertas abiertas o cerradas",huecos:"Huecos en góndola",vencido:"Producto vencido o por vencer",destruccion:"Vencimiento y destrucción",
    bodega:"Almacenamiento en bodega",racks:"Sobrecarga en racks",pasillos:"Pasillos libres",exhibicion:"Verificación de exhibición",trazabilidad:"Trazabilidad góndola–caja",autopago:"Validación de autopago",
    zonaCiega:"Zona ciega",apertura:"Apertura de tienda",cierre:"Cierre de puerta sin autorización"};

  /* ------------------------------ escena de ejemplo (?demo=1) ------------------------------
     Es la salida real de escenaDesdePlan (src/lib/vision/disposicion.ts) para un supermercado. */
  var DEMO={version:1,piso:{w:27,d:45.5},nombres:{},
    zonas:[{id:"acceso",nombre:"Acceso principal",tipo:"acceso",tamano:"mediana",motivo:"Entradas y salidas",x:-4.5,z:2.75,w:7,d:5,puerta:"s",exterior:false},
      {id:"cajas",nombre:"Línea de cajas",tipo:"cajas",tamano:"mediana",motivo:"Filas",x:3.5,z:2.75,w:9,d:5,puerta:"s",exterior:false},
      {id:"ventas",nombre:"Sala de ventas",tipo:"ventas",tamano:"mediana",motivo:"Góndolas",x:0,z:-4.25,w:16,d:9,puerta:"s",exterior:false},
      {id:"bodega",nombre:"Bodega",tipo:"bodega",tamano:"mediana",motivo:"Inventario",x:0,z:-13.25,w:16,d:9,puerta:"s",exterior:false},
      {id:"parq",nombre:"Parqueadero",tipo:"parqueadero",tamano:"mediana",motivo:"Vehículos",x:0,z:12.25,w:17,d:11,puerta:"n",exterior:true}],
    camaras:[{id:"c1",zona:"acceso",analiticas:["conteo","rostro","negras"],proposito:"Cuenta entradas y reconoce rostros en la puerta",etiqueta:"CAM 01",pos:[-4.5,2.75,0.7],mira:[-4.5,0.9,5.25],fov:68,alcance:8.17,color:0xD6AB4C},
      {id:"c2",zona:"ventas",analiticas:["calor","permanencia"],proposito:"Mapa de calor de la sala",etiqueta:"CAM 02",pos:[-7.55,2.75,-8.3],mira:[1.89,0.5,-3.24],fov:74,alcance:16,color:0xD6AB4C},
      {id:"c3",zona:"ventas",analiticas:["hurto","ocultaProd"],proposito:"Hurto en góndolas",etiqueta:"CAM 03",pos:[7.55,2.75,-0.2],mira:[-1.89,0.5,-5.26],fov:74,alcance:16,color:0xE5484D},
      {id:"c4",zona:"ventas",analiticas:["huecos","exhibicion"],proposito:"Huecos en góndola",etiqueta:"CAM 04",pos:[7.55,2.75,-8.3],mira:[-1.89,0.5,-3.24],fov:74,alcance:16,color:0x30A46C},
      {id:"c5",zona:"cajas",analiticas:["filas","autopago"],proposito:"Filas en cajas",etiqueta:"CAM 05",pos:[-0.55,2.75,0.7],mira:[4.51,0.5,3.26],fov:74,alcance:9.78,color:0x3B82F6},
      {id:"c6",zona:"bodega",analiticas:["racks","pasillos"],proposito:"Racks y pasillos",etiqueta:"CAM 06",pos:[-7.55,2.75,-17.3],mira:[1.89,0.5,-12.24],fov:74,alcance:16,color:0x30A46C},
      {id:"c7",zona:"bodega",analiticas:["epp","caidas"],proposito:"EPP del personal",etiqueta:"CAM 07",pos:[7.55,2.75,-9.2],mira:[-1.89,0.5,-14.26],fov:74,alcance:16,color:0xE5484D},
      {id:"c8",zona:"parq",analiticas:["placas"],proposito:"Lectura de placas",etiqueta:"CAM 08",pos:[-8.2,4.6,7.05],mira:[2.05,0.5,13.55],fov:62,alcance:19.24,color:0x3B82F6},
      {id:"c9",zona:"parq",analiticas:["merodeo","intrusion"],proposito:"Merodeo nocturno",etiqueta:"CAM 09",pos:[8.2,4.6,17.45],mira:[-2.05,0.5,10.95],fov:62,alcance:19.24,color:0xE5484D}]};

  /* ------------------------------ qué hace cada analítica ------------------------------
     rol: a quién prefiere como objetivo · deco: lo que dibuja en el 3D · obj: el objetivo es un objeto (recuadro fijo)
     tag: texto del recuadro durante el evento · det/al/ok: textos del registro · niv: hasta dónde escala. */
  var A={
    seguimiento:{lbl:"id",tag:"{id} · trayecto",det:"Sigue a {id} entre zonas",ok:"Trayecto completo de {id}",niv:"detecta"},
    conteo:{rol:"entrante",lbl:"Persona",deco:"linea",tag:"+1 entrada",det:"Cruza la línea de la puerta: +1 entrada",ok:"Conteo del día actualizado",niv:"detecta"},
    demografia:{lbl:"demo",tag:"{demo}",det:"Visitante nuevo · {demo}",ok:"Perfil sumado al reporte",niv:"detecta"},
    calor:{lbl:"Visitante",deco:"calor",tag:"Zona caliente",det:"Punto caliente en {zona}",ok:"Mapa de calor actualizado",niv:"detecta"},
    permanencia:{rol:"comprando",lbl:"tiempo",deco:"anillo",tag:"+3 min aquí",det:"{id} lleva más de 3 min frente a la góndola",ok:"Tiempo de permanencia registrado",niv:"detecta"},
    cruce:{rol:"entrante",lbl:"Persona",deco:"linea",tag:"Cruce →",det:"Cruce de línea en sentido de entrada",ok:"Cruce contado",niv:"detecta"},
    comprador:{lbl:"comprador",tag:"Sin atención",det:"Comprador activo sin asesor en {zona}",ok:"Asesor avisado",niv:"detecta"},
    blancas:{rol:"staff",lbl:"blanca",deco:"puerta",tag:"Lista blanca ✓",det:"Rostro reconocido en lista blanca",ok:"Acceso abierto",niv:"detecta"},
    filas:{rol:"fila",lbl:"En fila",deco:"fila",tag:"Espera 6 min",det:"Fila larga en la caja 1",al:"Más de 6 min de espera: abrir otra caja",ok:"Caja 2 abierta, la fila baja",niv:"alerta"},
    aforo:{rol:"entrante",lbl:"Persona",deco:"linea",tag:"95 % del aforo",det:"Aforo al 95 %",al:"Aforo completo: frenar el ingreso",ok:"Aforo de vuelta a lo normal",niv:"alerta"},
    placas:{lbl:"Persona",deco:"autos",obj:"auto",tag:"{placa}",det:"Placa leída · {placa}",ok:"{placa} registrada en un cajón libre",niv:"detecta"},
    staff:{lbl:"staff",tag:"Sala sin personal",det:"Sala sin personal en {zona}",ok:"Personal de vuelta en sala",niv:"detecta"},
    derrames:{deco:"derrame",obj:"derrame",tag:"Derrame",det:"Mancha en el piso de {zona}",al:"Derrame sin atender hace 3 min",ok:"Piso limpio de nuevo",niv:"alerta"},
    guardian:{deco:"puesto",obj:"puesto",tag:"Puesto solo",det:"Puesto sin atender en {zona}",al:"Puesto solo más de 5 min",ok:"Puesto atendido",niv:"alerta"},
    negras:{rol:"entrante",lbl:"Rostro OK",deco:"puerta",tag:"Lista negra 91 %",det:"Coincidencia con lista negra",al:"Persona de lista negra en {zona}",ok:"Seguridad en camino",niv:"alerta"},
    merodeo:{rol:"merodeador",lbl:"Persona",deco:"anillo",tag:"Merodeo 3:40",det:"Da vueltas sin entrar ni irse",al:"Merodeo en {zona}",ok:"Vigilante verifica la zona",niv:"alerta"},
    intrusion:{rol:"merodeador",lbl:"Persona",deco:"borde",tag:"Intrusión",det:"Se acerca a la zona prohibida",al:"Intrusión en {zona}",ok:"Zona despejada",niv:"alerta"},
    acceso:{rol:"noStaff",lbl:"acceso",deco:"restringida",tag:"No autorizado",det:"Cruza a una zona interna",al:"Acceso no autorizado a {zona}",ok:"La persona sale de la zona",niv:"alerta"},
    aglomeracion:{lbl:"Persona",deco:"anillo",tag:"Aglomeración",det:"Se junta gente en {zona}",al:"Aglomeración en {zona}",ok:"La zona se despeja",niv:"alerta"},
    epp:{rol:"sinEpp",lbl:"epp",tag:"Sin casco",det:"Operario sin casco en {zona}",al:"Sin casco ni chaleco en {zona}",ok:"Se pone el equipo",niv:"alerta"},
    caidas:{rol:"quieto",lbl:"Persona",tag:"Caída",det:"Persona en el piso",al:"Caída: no se levanta",ok:"Persona asistida",niv:"alerta",caida:true},
    hurto:{rol:"comprando",lbl:"cliente",tag:"Posible hurto",det:"Toma producto y lo guarda",al:"Hurto en {zona}",ok:"Seguridad lo aborda en la salida",niv:"alerta"},
    ocultaProd:{rol:"comprando",lbl:"cliente",tag:"Oculta producto",det:"Producto escondido en la ropa",al:"Ocultamiento de producto en {zona}",ok:"Caso enviado a seguridad",niv:"alerta"},
    armas:{rol:"entrante",lbl:"Persona",deco:"puerta",tag:"Arma de fuego",det:"Objeto con forma de arma",al:"Arma de fuego en {zona}",ok:"Protocolo activado",niv:"alerta"},
    blancas2:{lbl:"Persona",tag:"Arma blanca",det:"Objeto cortante en la mano",al:"Arma blanca en {zona}",ok:"Protocolo activado",niv:"alerta"},
    peleas:{lbl:"Persona",tag:"Pelea",det:"Movimiento brusco entre dos personas",al:"Pelea en {zona}",ok:"Los separan, zona en calma",niv:"alerta",pelea:true},
    fuego:{deco:"fuego",obj:"fuego",tag:"Humo / fuego",det:"Humo en {zona}",al:"Fuego en {zona}: evacuar",ok:"Fuego controlado",niv:"alerta"},
    abandono:{deco:"abandono",obj:"abandono",tag:"Objeto solo 2 min",det:"Objeto sin dueño en {zona}",al:"Objeto abandonado hace 2 min",ok:"Objeto retirado",niv:"alerta"},
    rostro:{rol:"entrante",lbl:"Rostro visible",deco:"puerta",tag:"Rostro cubierto",det:"Entra con la cara cubierta",al:"Rostro oculto en la puerta",ok:"Se descubre el rostro",niv:"alerta"},
    activos:{deco:"puesto",obj:"puesto",tag:"Equipo fuera",det:"Equipo fuera de su sitio",al:"Retiro de activo sin registro",ok:"Equipo de vuelta en su sitio",niv:"alerta"},
    fleje:{deco:"gondola",obj:"gondola",tag:"Sin fleje",det:"Producto sin fleje de precio",ok:"Fleje puesto",niv:"detecta"},
    canastillas:{deco:"canastas",obj:"canastas",tag:"Faltan 6",det:"Faltan 6 canastillas en {zona}",ok:"Inventario de canastillas cuadrado",niv:"detecta"},
    puertas:{deco:"puertaObj",obj:"puerta",tag:"Abierta 4 min",det:"Puerta abierta hace 2 min",al:"Puerta abierta hace 5 min",ok:"Puerta cerrada",niv:"alerta"},
    huecos:{deco:"gondola",obj:"gondola",tag:"Surtido 72 %",det:"Hueco en góndola: surtido al 72 %",ok:"Góndola resurtida",niv:"detecta"},
    vencido:{deco:"gondola",obj:"gondola",tag:"Vence hoy",det:"Producto por vencer en exhibición",al:"Producto vencido a la venta",ok:"Producto retirado",niv:"alerta"},
    destruccion:{deco:"canastas",obj:"canastas",tag:"A destrucción",det:"Producto a destrucción registrado",ok:"Pérdida cuadrada",niv:"detecta"},
    bodega:{deco:"rack",obj:"rack",tag:"Fuera de lugar",det:"Mercancía fuera de su ubicación",ok:"Ubicación corregida",niv:"detecta"},
    racks:{deco:"rack",obj:"rack",tag:"Carga 112 %",det:"Rack al 112 % de su carga",al:"Sobrecarga en rack",ok:"Carga redistribuida",niv:"alerta"},
    pasillos:{deco:"pasillo",obj:"pasillo",tag:"Estorba el paso",det:"Mercancía estorbando el pasillo",al:"Pasillo bloqueado hace 3 min",ok:"Pasillo libre",niv:"alerta"},
    exhibicion:{deco:"gondola",obj:"gondola",tag:"≠ planograma",det:"Exhibición distinta al planograma",ok:"Exhibición corregida",niv:"detecta"},
    trazabilidad:{rol:"comprando",lbl:"cliente",tag:"Toma 3 · paga 2",det:"Toma 3 productos y paga 2",al:"Diferencia góndola–caja",ok:"Cuadre verificado en caja",niv:"alerta"},
    autopago:{rol:"fila",lbl:"cliente",deco:"autopago",tag:"Sin escanear",det:"Producto pasa sin escanear",al:"Autopago: producto sin pagar",ok:"Pago validado",niv:"alerta"},
    zonaCiega:{lbl:"Persona",deco:"restringida",tag:"Zona ciega",det:"Alguien entra a la zona sin cobertura",ok:"Sale de la zona ciega",niv:"detecta"},
    apertura:{deco:"puertaObj",obj:"puerta",tag:"Abre 07:58",det:"Local abierto a las 07:58",ok:"Apertura puntual registrada",niv:"detecta"},
    cierre:{deco:"puertaObj",obj:"puerta",tag:"Cerrada",det:"La puerta se cierra en horario comercial",al:"Cierre sin autorización",ok:"Puerta abierta de nuevo",niv:"alerta"}
  };
  var POR_DEFECTO={lbl:"Detectado",tag:"Detectado",det:"{nombre}: evento detectado",ok:"Evento revisado",niv:"detecta"};
  function ana(id){return A[id]||POR_DEFECTO}

  /* ------------------------------ estado ------------------------------ */
  var escena=null,pendiente=null,activa=0,recorrido=false,tRecorrido=0,vista=q.get("vista")==="cctv"?"cctv":"maqueta",def=null,S=null;

  function num(v,d){v=+v;return isFinite(v)?v:d}
  function sanear(e){if(!e||typeof e!=="object")return null;var zonas=Array.isArray(e.zonas)?e.zonas:[],cams=Array.isArray(e.camaras)?e.camaras:[];
    var Z=zonas.filter(function(z){return z&&typeof z==="object"}).map(function(z,i){return{id:String(z.id||("z"+i)),nombre:String(z.nombre||z.tipo||"Zona"),tipo:String(z.tipo||"ventas"),tamano:z.tamano,
      x:num(z.x,0),z:num(z.z,0),w:Math.max(2,num(z.w,6)),d:Math.max(2,num(z.d,5)),puerta:["n","s","e","o"].indexOf(z.puerta)>=0?z.puerta:(z.exterior?"n":"s"),exterior:!!z.exterior||z.tipo==="parqueadero"||z.tipo==="perimetro"}});
    var C=cams.filter(function(c){return c&&Array.isArray(c.pos)&&Array.isArray(c.mira)}).map(function(c,i){var an=(Array.isArray(c.analiticas)?c.analiticas:[]).map(String);
      return{id:String(c.id||("c"+i)),zona:String(c.zona||""),analiticas:an.length?an:["seguimiento"],proposito:String(c.proposito||""),etiqueta:String(c.etiqueta||("CAM "+String(i+1).padStart(2,"0"))),
        pos:[num(c.pos[0],0),num(c.pos[1],2.75),num(c.pos[2],0)],mira:[num(c.mira[0],0),num(c.mira[1],0.5),num(c.mira[2],1)],fov:Math.max(20,Math.min(110,num(c.fov,70))),alcance:Math.max(3,Math.min(30,num(c.alcance,12))),color:num(c.color,0x3B82F6)>>>0}});
    var ext=Z.reduce(function(a,z){return[Math.max(a[0],Math.abs(z.x)+z.w/2),Math.max(a[1],Math.abs(z.z)+z.d/2)]},[8,6]);
    var piso={w:Math.max(num(e.piso&&e.piso.w,0),ext[0]*2+8),d:Math.max(num(e.piso&&e.piso.d,0),ext[1]*2+8)};
    return{piso:piso,zonas:Z,camaras:C,nombres:Object.assign({},NOMBRES,e.nombres&&typeof e.nombres==="object"?e.nombres:{})}}

  /* ------------------------------ armado ------------------------------ */
  function construir(E0){
    var fases=[[0,"vigila","Todas las cámaras vigilan"]];
    return{id:"plan",dur:DUR,semilla:11,reiniciar:false,fases:fases,camara:{pos:[14,22,30],mira:[0,0,0],fov:34},armar:function(K){return armar(K,E0,fases)}};
  }

  function armar(K,E0,fases){
    var T=THREE,C=M.COL,E=M.E;
    S={K:K,E0:E0,fases:fases,zonas:[],cams:[],gente:[],puertas:[],vanos:[],etq:[],ini:false,tPrev:0,autos:[],extra:[]};
    S.E0camPoste=function(x,z){return E0.camaras.some(function(c){return c.pos[1]>3.5&&Math.hypot(c.pos[0]-x,c.pos[2]-z)<2.2})};
    var Zs=E0.zonas,porId={};
    /* --- marco local de cada zona: +z local apunta a su puerta --- */
    Zs.forEach(function(z){var r={s:0,n:180,e:90,o:-90}[z.puerta];var gira=r===90||r===-90;
      var Z=Object.assign({},z,{rot:r,lw:gira?z.d:z.w,ld:gira?z.w:z.d,hk:{},gente:[],cams:[],anas:{}});S.zonas.push(Z);porId[Z.id]=Z});
    E0.camaras.forEach(function(c){var Z=porId[c.zona];if(Z){Z.cams.push(c);c.analiticas.forEach(function(a){Z.anas[a]=1})}});
    function L(Z,lx,lz){var a=Z.rot*RAD,c=Math.cos(a),s=Math.sin(a);return[Z.x+lx*c+lz*s,Z.z-lx*s+lz*c]}
    function dentro(Z,x,z,m){m=m||0;return Math.abs(x-Z.x)<=Z.w/2-m&&Math.abs(z-Z.z)<=Z.d/2-m}
    function interiorEn(x,z){return S.zonas.some(function(Z){return !Z.exterior&&dentro(Z,x,z,0)})}
    S.L=L;S.dentro=dentro;

    /* --- piso general: pasto bajo, con el plano un poco hundido para que los pisos de zona no titilen de lejos --- */
    var W=E0.piso.w,D=E0.piso.d;
    var base=K.piso(W,D,K.pbr("pasto",{color:0xC9D6B8}));if(base&&base.parent){var hs=base.parent.children,ib=hs.indexOf(base);if(ib>0)hs[ib-1].position.y-=0.07;base.position.y=-0.028}
    var INT=S.zonas.filter(function(Z){return !Z.exterior});
    if(INT.length){var bx0=Math.min.apply(null,INT.map(function(Z){return Z.x-Z.w/2})),bx1=Math.max.apply(null,INT.map(function(Z){return Z.x+Z.w/2})),bz0=Math.min.apply(null,INT.map(function(Z){return Z.z-Z.d/2})),bz1=Math.max.apply(null,INT.map(function(Z){return Z.z+Z.d/2}));
      K.parche((bx0+bx1)/2,(bz0+bz1)/2+0.6,bx1-bx0+2.4,bz1-bz0+3.6,K.pbr("concreto",{color:0xE4E2DC}),2.5,-0.012);S.edif=[bx0,bx1,bz0,bz1]}
    var PISOS={acceso:K.mat.piso,ventas:K.mat.piso,cajas:K.mat.piso,recepcion:K.pbr("damero",{roughness:0.6}),comedor:K.pbr("maderaPiso"),oficina:K.mat.alfombra,bodega:K.mat.concreto,produccion:K.mat.concreto,pasillo:K.mat.piso,parqueadero:K.mat.asfalto,perimetro:K.mat.pasto};
    S.zonas.forEach(function(Z){K.parche(Z.x,Z.z,Z.w,Z.d,PISOS[Z.tipo]||K.mat.piso,2,0.004)});

    /* --- muros, puertas y vanos --- */
    muros(K,INT,interiorEn);
    function chocaVano(x,z,hx,hz){return S.vanos.some(function(o){var ax=o.eje==="h"?o.w/2+0.4:1.3,az=o.eje==="h"?1.3:o.w/2+0.4;return Math.abs(x-o.x)<ax+hx&&Math.abs(z-o.z)<az+hz})}
    function chocaCam(x,z,r){return E0.camaras.some(function(c){return c.pos[1]>3.5&&Math.hypot(c.pos[0]-x,c.pos[2]-z)<r+0.6})}
    /* pon: ubica un mueble en coordenadas locales; null si tapa una puerta o se sale de la zona */
    function pon(Z,lx,lz,hx,hz){var p=L(Z,lx,lz),g=Z.rot===90||Z.rot===-90,wx=g?hz:hx,wz=g?hx:hz;if(!dentro(Z,p[0],p[1],0)||Math.abs(p[0]-Z.x)+wx>Z.w/2+0.01||Math.abs(p[1]-Z.z)+wz>Z.d/2+0.01)return null;if(!Z.exterior&&chocaVano(p[0],p[1],wx,wz))return null;return p}
    S.pon=pon;

    /* --- mobiliario por tipo de zona --- */
    S.zonas.forEach(function(Z){try{(SETS[Z.tipo]||SETS.ventas)(K,Z,pon,L)}catch(e){console.log("plan: set "+Z.tipo+" "+(e&&e.message))}
      var y=Z.exterior?2.3:3.35;var nom=Z.nombre;var q2=K.etiqueta(nom,"zona",function(){return M.vista==="cctv"?null:new T.Vector3(Z.x,y,Z.z)});S.etq.push(q2)});
    var luces=INT.slice().sort(function(a,b){return b.w*b.d-a.w*a.d}).slice(0,3);luces.forEach(function(Z){K.lampara(Z.x,2.5,Z.z)});

    /* --- gente --- */
    gente(K,L,dentro);
    try{prepararAuto(K)}catch(e){console.log("plan: auto "+(e&&e.message))}

    /* --- cámaras --- */
    M.camara.layers.enable(1);
    E0.camaras.forEach(function(c,i){var Z=porId[c.zona]||null;
      if(c.pos[1]>3.5){K.poste(c.pos[0],c.pos[2]);K.cil(c.pos[0],4.2,c.pos[2],0.045,0.045,Math.max(0.1,c.pos[1]-4.3),K.mat.aceroOsc)}
      var g=K.camara(c.pos,c.mira,{fov:c.fov,alcance:c.alcance,color:c.color,op:0.05,huella:true,etiqueta:true,id:c.etiqueta,secundaria:true});
      var hu=(E.huellas||[]).slice(),cono=null,ar=null;g.children.forEach(function(o){if(o.isMesh&&o.material&&o.material.type==="MeshBasicMaterial")cono=o;if(o.isLineSegments)ar=o});
      g.traverse(function(o){o.layers.set(1)});hu.forEach(function(o){o.layers.set(1)});
      var vc=new T.PerspectiveCamera(c.fov,16/9,0.1,c.alcance*1.3);vc.position.set(c.pos[0],c.pos[1],c.pos[2]);vc.lookAt(c.mira[0],c.mira[1],c.mira[2]);vc.updateMatrixWorld();vc.updateProjectionMatrix();
      var etq=g.userData.etq;if(etq){var pp=new T.Vector3(c.pos[0],c.pos[1]+0.32,c.pos[2]);etq.fn=function(){return M.vista==="cctv"?null:pp}}
      var span=18,t0=1.5+i*span/Math.max(1,E0.camaras.length);
      var CAM={c:c,i:i,Z:Z,g:g,cono:cono,ar:ar,hu:hu,vc:vc,etq:etq,cajas:[],obj:null,deco:[],a:ana(c.analiticas[0]),idA:c.analiticas[0],t0:t0,est:"vigila",tgt:null};
      S.cams.push(CAM);if(Z)Z.camsS=(Z.camsS||[]).concat([CAM])});
    S.cams.forEach(function(CAM){try{analitica(K,CAM)}catch(e){console.log("plan: analítica "+CAM.idA+" "+(e&&e.message))}});
    if(!E0.zonas.length){var q3=K.etiqueta("Sin zonas en el plan","zona",K.punto(0,1.2,0));S.etq.push(q3)}
    chip.textContent="Maqueta del plan · "+E0.camaras.length+(E0.camaras.length===1?" cámara":" cámaras");
    ajustarSol(W,D);
    activa=Math.max(0,Math.min(S.cams.length-1,activa));aplicarActiva(false);
    return actualizar;
  }

  /* ------------------------------ muros ------------------------------ */
  function muros(K,INT,interiorEn){
    if(!INT.length)return;var r2=function(v){return Math.round(v*20)/20};
    function lado(Z,s){var x0=Z.x-Z.w/2,x1=Z.x+Z.w/2,z0=Z.z-Z.d/2,z1=Z.z+Z.d/2;
      return{s:{eje:"h",c:z1,a0:x0,a1:x1,n:[0,1]},n:{eje:"h",c:z0,a0:x0,a1:x1,n:[0,-1]},e:{eje:"v",c:x1,a0:z0,a1:z1,n:[1,0]},o:{eje:"v",c:x0,a0:z0,a1:z1,n:[-1,0]}}[s]}
    function pto(eje,c,a){return eje==="h"?[a,c]:[c,a]}
    function cortes(eje,c,a0,a1){var b=[a0,a1];INT.forEach(function(Z){var k=eje==="h"?[Z.x-Z.w/2,Z.x+Z.w/2]:[Z.z-Z.d/2,Z.z+Z.d/2],cc=eje==="h"?[Z.z-Z.d/2,Z.z+Z.d/2]:[Z.x-Z.w/2,Z.x+Z.w/2];
      if(Math.abs(cc[0]-c)<0.06||Math.abs(cc[1]-c)<0.06)k.forEach(function(v){if(v>a0+0.05&&v<a1-0.05)b.push(v)})});b.sort(function(a,b){return a-b});return b}
    function abrir(eje,c,cen,w,tipo,Z){S.vanos.push({eje:eje,c:c,x:eje==="h"?cen:c,z:eje==="h"?c:cen,w:w,tipo:tipo,Z:Z})}
    /* 1) la puerta de cada zona en su lado */
    INT.forEach(function(Z){var l=lado(Z,Z.puerta),mid=(l.a0+l.a1)/2,p=pto(l.eje,l.c,mid),fuera=!interiorEn(p[0]+l.n[0]*0.3,p[1]+l.n[1]*0.3);
      var w=fuera?2.0:1.6,b=cortes(l.eje,l.c,l.a0,l.a1),seg=null;for(var i=0;i<b.length-1;i++)if(mid>=b[i]&&mid<=b[i+1])seg=[b[i],b[i+1]];
      if(!seg||mid-w/2<seg[0]+0.4||mid+w/2>seg[1]-0.4){var mej=null;for(i=0;i<b.length-1;i++)if(!mej||b[i+1]-b[i]>mej[1]-mej[0])mej=[b[i],b[i+1]];seg=mej;mid=(seg[0]+seg[1])/2}
      w=Math.max(0.9,Math.min(w,seg[1]-seg[0]-0.8));abrir(l.eje,l.c,mid,w,fuera?"puerta":"vano",Z);Z.puertaVano=S.vanos[S.vanos.length-1];Z.salidaN=l.n});
    /* 2) vanos entre zonas vecinas que aún no se comunican */
    for(var i=0;i<INT.length;i++)for(var j=i+1;j<INT.length;j++){var a=INT[i],b=INT[j],sh=null;
      [["e","o"],["o","e"],["s","n"],["n","s"]].forEach(function(p){if(sh)return;var la=lado(a,p[0]),lb=lado(b,p[1]);if(la.eje!==lb.eje||Math.abs(la.c-lb.c)>0.06)return;var o0=Math.max(la.a0,lb.a0),o1=Math.min(la.a1,lb.a1);if(o1-o0>=2.2)sh={eje:la.eje,c:la.c,o0:o0,o1:o1}});
      if(!sh)continue;var ya=S.vanos.some(function(o){return o.eje===sh.eje&&Math.abs(o.c-sh.c)<0.06&&(o.eje==="h"?o.x:o.z)>sh.o0&&(o.eje==="h"?o.x:o.z)<sh.o1});
      if(!ya)abrir(sh.eje,sh.c,(sh.o0+sh.o1)/2,1.4,"vano",null)}
    /* 3) líneas de muro (unión de bordes), menos vanos, clasificadas: fachada / exterior / división */
    var lineas={};function sumar(eje,c,a0,a1){var k=eje+r2(c);(lineas[k]=lineas[k]||{eje:eje,c:c,iv:[]}).iv.push([a0,a1])}
    INT.forEach(function(Z){["s","n","e","o"].forEach(function(s){var l=lado(Z,s);sumar(l.eje,l.c,l.a0,l.a1)})});
    var alu=K.std(0xC4C9CF,{metalness:0.6,roughness:0.35}),franja=K.std(0x1E3A6E,{roughness:0.8});
    Object.keys(lineas).forEach(function(k){var Ln=lineas[k];Ln.iv.sort(function(a,b){return a[0]-b[0]});var un=[];Ln.iv.forEach(function(v){var u=un[un.length-1];if(u&&v[0]<=u[1]+0.05)u[1]=Math.max(u[1],v[1]);else un.push(v.slice())});
      un.forEach(function(v){var piezas=[v.slice()];S.vanos.forEach(function(o){if(o.eje!==Ln.eje||Math.abs(o.c-Ln.c)>0.06)return;var cen=o.eje==="h"?o.x:o.z,h0=cen-o.w/2,h1=cen+o.w/2,np=[];
          piezas.forEach(function(p){if(h1<=p[0]||h0>=p[1]){np.push(p);return}if(h0>p[0])np.push([p[0],h0]);if(h1<p[1])np.push([h1,p[1]])});piezas=np});
        piezas.forEach(function(p){var b=cortes(Ln.eje,Ln.c,p[0],p[1]);for(var i=0;i<b.length-1;i++){var a0=b[i],a1=b[i+1];if(a1-a0<0.05)continue;var m=(a0+a1)/2,
            s1=Ln.eje==="h"?interiorEn(m,Ln.c-0.25):interiorEn(Ln.c-0.25,m),s2=Ln.eje==="h"?interiorEn(m,Ln.c+0.25):interiorEn(Ln.c+0.25,m),
            p0=pto(Ln.eje,Ln.c,a0),p1=pto(Ln.eje,Ln.c,a1);
          if(s1&&s2){K.muro(p0[0],p0[1],p1[0],p1[1],2.4,K.mat.muro,0.14)}
          else if(Ln.eje==="h"&&s1&&!s2){K.muro(p0[0],p0[1],p1[0],p1[1],2.6,K.mat.vidrio,0.05);for(var x=a0;x<=a1+0.01;x+=Math.max(0.8,(a1-a0)/Math.max(1,Math.round((a1-a0)/1.6))))K.caja(x,0,Ln.c,0.07,2.6,0.1,alu);
            K.caja(m,0,Ln.c,a1-a0,0.1,0.1,alu);K.caja(m,2.6,Ln.c,a1-a0,0.45,0.18,franja)}
          else{K.muro(p0[0],p0[1],p1[0],p1[1],2.8,K.mat.muro,0.2)}}})})});
    /* 4) marcos: puerta de vidrio en fachada, dintel en los vanos */
    S.vanos.forEach(function(o){var ry=o.eje==="h"?0:90;
      if(o.tipo==="puerta"){var pu=K.puerta(o.x,o.z,o.w-0.26,ry);S.puertas.push({g:pu,x:o.x,z:o.z,f:0});
        if(o.Z){var nm=o.Z.nombre.toUpperCase();var cw=Math.min(3.4,Math.max(1.6,nm.length*0.16)),sx=o.Z.salidaN||[0,1];K.cartel(o.x+sx[0]*0.11,2.82,o.z+sx[1]*0.11,cw,0.34,nm,"#001441","#F1F3F8",ry);K.cartel(o.x-sx[0]*0.11,2.82,o.z-sx[1]*0.11,cw,0.34,nm,"#001441","#F1F3F8",ry+180)}}
      else{var hz=o.eje==="h";K.caja(o.x,2.2,o.z,hz?o.w+0.1:0.16,0.2,hz?0.16:o.w+0.1,K.mat.muro);[-1,1].forEach(function(s){K.caja(o.x+(hz?s*(o.w/2+0.03):0),0,o.z+(hz?0:s*(o.w/2+0.03)),hz?0.06:0.18,2.2,hz?0.18:0.06,K.mat.aceroOsc)})}});
  }

  /* ------------------------------ sets por tipo de zona ------------------------------ */
  var SETS={};
  /* prueba la posición y, si tapa un paso, la corre un poco */
  function ponAlt(pon,Z,lx,lz,hx,hz){var off=[[0,0],[0,1.2],[1.0,0],[-1.0,0],[0,-0.6],[1.0,1.2],[-1.0,1.2]];for(var i=0;i<off.length;i++){var p=pon(Z,lx+off[i][0],lz+off[i][1],hx,hz);if(p)return{p:p,x:lx+off[i][0],z:lz+off[i][1]}}return null}
  function rotW(Z,ry){return(Z.rot||0)+(ry||0)}
  SETS.acceso=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld;
    var t=pon(Z,0,ld/2-0.8,1.1,0.6);if(t)K.parche(t[0],t[1],(Z.rot%180?1.2:2.2),(Z.rot%180?2.2:1.2),K.std(0x3A3F4A,{roughness:1}),1,0.009);
    var an=pon(Z,0,ld/2-0.6,1.4,0.25);if(an)K.antihurto(an[0],an[1],1.6,rotW(Z,0));
    var ca=pon(Z,lw/2-0.6,ld/2-1.6,0.3,0.3);if(ca){K.canastas(ca[0],ca[1],7);Z.hk.canastas=[ca[0],ca[1],0.6]}
    for(var k=0;k<3;k++){var cr=pon(Z,lw/2-0.7,-ld/2+0.9+k*0.62,0.35,0.5);if(cr)K.carrito(cr[0],cr[1],rotW(Z,90))}
    var pl=pon(Z,-lw/2+0.55,ld/2-0.6,0.3,0.3);if(pl)K.planta(pl[0],pl[1],1.1);
    if(lw>=6.5){var mo=pon(Z,-lw/2+1.4,-ld/2+1.1,0.9,0.45);if(mo){K.mostrador(mo[0],mo[1],1.8,rotW(Z,0));Z.hk.puesto=[mo[0],mo[1],1.0,1.9,0.8,rotW(Z,0)]}}
    var ex=L(Z,-lw/2+0.12,0.4);K.extintor(ex[0],0.9,ex[1],rotW(Z,90));
    Z.hk.spots=[[0,0.2],[-lw/4,-ld/4],[lw/4,-0.2]];Z.hk.lado=[lw/2-1.3,ld/2-1.8]};
  SETS.recepcion=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld;var mo=pon(Z,0,-ld/2+1.5,1.6,0.45);if(mo){K.mostrador(mo[0],mo[1],Math.min(3.2,lw-2),rotW(Z,0));Z.hk.puesto=[mo[0],mo[1],1.0,3.2,0.8,rotW(Z,0)];Z.hk.atiende=[0,-ld/2+0.75];Z.hk.frente=[0.3,-ld/2+2.35]}
    var lb=pon(Z,0,-ld/2+0.3,1.2,0.25);if(lb)K.libreria(lb[0],lb[1],2.2,rotW(Z,0),2.0);
    var ms=pon(Z,-lw/2+1.3,ld/2-1.5,0.9,0.9);if(ms)K.mesa(ms[0],ms[1],{r:0.4,sillas:3,ry:rotW(Z,0)});
    [[lw/2-0.5,ld/2-0.5],[-lw/2+0.5,-ld/2+0.6]].forEach(function(p){var q=pon(Z,p[0],p[1],0.3,0.3);if(q)K.planta(q[0],q[1],1.2)});
    Z.hk.spots=[[0,0.4],[lw/4,ld/4]]};
  SETS.ventas=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld,an=0.9;
    var huecos=Z.anas.huecos||Z.anas.exhibicion||Z.anas.vencido||Z.anas.fleje;
    var atras=ld>=6.5,zb=-ld/2+(atras?2.25:1.2),zf=ld/2-1.9,largo=Math.max(2,Math.min(6,zf-zb)),zc=(zb+zf)/2;
    if(atras){var pg=pon(Z,0,-ld/2+0.5,(lw-2.4)/2,0.45);if(pg)K.gondola(pg[0],pg[1],Math.min(lw-2.4,9),rotW(Z,0),{unaCara:true,familias:["botellas","cajas","latas","bolsas"]})}
    var paso=2.35,n=Math.max(1,Math.min(6,Math.floor((lw-2.6)/paso)+1)),xs=[];for(var i=0;i<n;i++)xs.push((i-(n-1)/2)*paso);
    Z.hk.pasillos=[];Z.hk.gond=[];var fam=[["cajas","bolsas","cajas","latas"],["botellas","botellas","cajas","bolsas"],["latas","cajas","bolsas","cajas"],["cajas","latas","bolsas","cajas"],["bolsas","cajas","latas","cajas"],["cajas","cajas","bolsas","latas"]];
    xs.forEach(function(x,i){var p=pon(Z,x,zc,an/2,largo/2);if(!p)return;var o={niveles:4,familias:fam[i%6],letrero:"PASILLO "+(i+1)};if(huecos&&i===Math.floor(n/2))o.huecos=[2,3,4,9,10,17,18];
      K.gondola(p[0],p[1],largo,rotW(Z,90),o);Z.hk.gond.push({x:x,l:p,i:i})});
    for(i=0;i<xs.length-1;i++)Z.hk.pasillos.push([(xs[i]+xs[i+1])/2,zc]);
    if(!Z.hk.pasillos.length)Z.hk.pasillos.push([xs[0]+1.15,zc]);
    var g0=Z.hk.gond[Math.floor(Z.hk.gond.length/2)]||Z.hk.gond[0];if(g0){var gp=L(Z,g0.x,zc);Z.hk.gondola=[gp[0],gp[1],1.0,1.0,largo*0.6,rotW(Z,0)]}
    var ex=pon(Z,-lw/2+1.2,ld/2-1.3,0.55,0.55);if(ex&&lw>=8)K.exhibidor(ex[0],ex[1],3,rotW(Z,15));
    var ce=pon(Z,lw/2-0.45,zc,0.25,0.25);if(ce)K.extintor(L(Z,lw/2-0.12,zc)[0],0.9,L(Z,lw/2-0.12,zc)[1],rotW(Z,-90));
    Z.hk.frente=[0,ld/2-1.1];Z.hk.spots=Z.hk.pasillos.map(function(p){return[p[0],p[1]]})};
  SETS.cajas=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld,n=Math.max(1,Math.min(4,Math.floor((lw-0.6)/3.1))),rz=Math.min(0.55,ld/2-1.75);Z.hk.cajas=[];
    for(var i=0;i<n;i++){var x=(i-(n-1)/2)*3.1,p=pon(Z,x,rz,1.2,0.42);if(!p){p=pon(Z,x+0.8,rz,1.2,0.42);x+=0.8}if(!p)continue;K.cajaRegistro(p[0],p[1],rotW(Z,180),{n:Z.hk.cajas.length+1});Z.hk.cajas.push({x:x,z:rz})}
    var c0=Z.hk.cajas[0];if(c0){Z.hk.fila=[];for(var k=0;k<3;k++){var fz=rz-1.1-k*0.8;if(fz<-ld/2+0.45)break;Z.hk.fila.push([c0.x+0.1,fz])}
      Z.hk.atiende=[c0.x+0.3,rz+0.95];Z.hk.salida=[c0.x+1.7,rz+1.2];
      var a=L(Z,c0.x-0.8,rz-0.6),b=L(Z,c0.x+1.0,-ld/2+0.3);Z.hk.filaPol=[[Math.min(a[0],b[0]),Math.min(a[1],b[1])],[Math.max(a[0],b[0]),Math.min(a[1],b[1])],[Math.max(a[0],b[0]),Math.max(a[1],b[1])],[Math.min(a[0],b[0]),Math.max(a[1],b[1])]];
      var cinta=K.std(0xF2C230,{roughness:0.6});[-0.65,0.85].forEach(function(dx){var m=L(Z,c0.x+dx,(rz-0.6+(-ld/2+0.35))/2);var lz=Math.abs((rz-0.6)-(-ld/2+0.35));K.parche(m[0],m[1],Z.rot%180?lz:0.07,Z.rot%180?0.07:lz,cinta,1,0.009)})}
    if(Z.anas.autopago){var ap=pon(Z,lw/2-0.6,-ld/2+0.8,0.35,0.3);if(ap){var g=K.grupo(ap[0],ap[1],rotW(Z,-90));g.userData.obst=K.caja(0,0,0,0.6,1.05,0.5,K.std(0xEEF0F3,{roughness:0.5}),g);K.pc(0,1.05,0,0,g);K.cartel(0,1.75,0,0.6,0.16,"AUTOPAGO","#001441","#F1F3F8",0,g);Z.hk.autopago=[ap[0],ap[1],0,0.8,1.6,0.8]}}
    var ca=pon(Z,-lw/2+0.5,ld/2-0.5,0.3,0.3);if(ca){K.canastas(ca[0],ca[1],6);Z.hk.canastas=[ca[0],ca[1],0.6]}
    Z.hk.spots=[[0,-ld/2+0.8]]};
  SETS.bodega=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld;Z.hk.racks=[];
    var la=Math.min(lw-3.2,10.8);var ra=pon(Z,0,-ld/2+0.7,la/2,0.55);if(ra&&la>=2){K.rack(ra[0],ra[1],la,rotW(Z,0),{niveles:3,alto:2.5});Z.hk.racks.push([ra[0],ra[1],0,la,2.5,1.2,rotW(Z,0)])}
    var zb2=-ld/2+0.7+1.1+2.7;if(ld>=8){var lb=Math.min(lw-5,9.6);var rb=pon(Z,0,zb2,lb/2,0.55);if(rb&&lb>=2){K.rack(rb[0],rb[1],lb,rotW(Z,0),{niveles:3,alto:2.5,vacios:[1,6]});Z.hk.racks.push([rb[0],rb[1],0,lb,2.5,1.2,rotW(Z,0)])}
      var pz=(-ld/2+1.25+zb2-0.55)/2;Z.hk.pasillo=[0,pz,lb];var y1=K.std(0xF2C230,{roughness:0.6});[-ld/2+1.35,zb2-0.62].forEach(function(z){var m=L(Z,0,z);K.parche(m[0],m[1],Z.rot%180?0.08:lw-1.2,Z.rot%180?lw-1.2:0.08,y1,1,0.009)})}
    else Z.hk.pasillo=[0,0,lw-3];
    var fz=ld>=8?(zb2+0.55+ld/2)/2:ld/4;
    var mc=pon(Z,-lw/2+1.4,fz,0.65,1.3);if(mc)K.montacargas(mc[0],mc[1],rotW(Z,0));
    Z.hk.estibas=[];[[lw/2-1.2,fz-0.7],[lw/2-1.2,fz+0.7],[lw/2-2.7,fz]].forEach(function(p,i){var q=pon(Z,p[0],p[1],0.62,0.55);if(q){K.estiba(q[0],q[1],rotW(Z,0),[3,2,3][i]);Z.hk.estibas.push(p)}});
    if(Z.hk.estibas.length)Z.hk.canastas=(function(p){var w=L(Z,p[0],p[1]);return[w[0],w[1],1.3]})(Z.hk.estibas[0]);
    var ex=L(Z,-lw/2+0.12,fz+1.4);K.extintor(ex[0],0.9,ex[1],rotW(Z,90));
    var ct=L(Z,-lw/4,fz+0.6);var cc=K.cartel(ct[0],0.012,ct[1],2.0,0.4,"ZONA DE CARGUE","#D6AB4C","#001441");cc.rotation.x=-Math.PI/2;cc.rotation.z=Z.rot*RAD;
    Z.hk.frente=[lw/2-2.2,fz];Z.hk.spots=[[0,Z.hk.pasillo[1]],[lw/2-2.0,fz-1.7],[-lw/2+2.8,fz+0.8]]};
  SETS.produccion=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld,acero=K.std(0xC9CDD4,{metalness:0.7,roughness:0.35}),am=K.std(0xF2C230,{roughness:0.6}),az=K.std(0x2F64C8,{roughness:0.5});Z.hk.mesas=[];
    var nx=Math.max(1,Math.min(4,Math.floor((lw-2)/3.2))),nz=Math.max(1,Math.min(3,Math.floor((ld-2.6)/2.6)));
    for(var i=0;i<nx;i++)for(var j=0;j<nz;j++){var r=ponAlt(pon,Z,(i-(nx-1)/2)*3.2,-ld/2+1.6+j*2.6,1.1,0.45);if(!r)continue;var x=r.x,z=r.z,p=r.p;var g=K.grupo(p[0],p[1],rotW(Z,0));g.userData.obst=K.caja(0,0,0,2.2,0.86,0.9,acero,g);
      if((i+j)%2){K.caja(0.5,0.86,0,0.9,0.7,0.7,az,g);K.caja(0.5,1.56,0,0.5,0.2,0.4,am,g)}else{for(var k=0;k<4;k++)K.caja(-0.7+k*0.45,0.86,-0.1,0.3,0.18,0.3,K.mat.carton,g)}K.sombra(0,0,2.3,1,g);Z.hk.mesas.push([x,z+0.85])}
    var mq=pon(Z,lw/2-1.1,ld/2-1.6,0.7,0.8);if(mq){var g2=K.grupo(mq[0],mq[1],rotW(Z,0));g2.userData.obst=K.caja(0,0,0,1.3,1.7,1.5,am,g2);K.caja(0,1.7,0,0.8,0.3,0.8,az,g2);Z.hk.puesto=[mq[0],mq[1],0,1.5,2.1,1.7,rotW(Z,0)]}
    var ex=L(Z,-lw/2+0.12,ld/2-1.2);K.extintor(ex[0],0.9,ex[1],rotW(Z,90));
    Z.hk.spots=Z.hk.mesas.slice(0,3).concat([[0,ld/2-1.2]])};
  SETS.oficina=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld;Z.hk.mesas=[];var nx=Math.max(1,Math.min(4,Math.floor((lw-1.6)/2.3))),nz=Math.max(1,Math.min(3,Math.floor((ld-2.4)/2.4)));
    for(var i=0;i<nx;i++)for(var j=0;j<nz;j++){var r=ponAlt(pon,Z,(i-(nx-1)/2)*2.3,-ld/2+1.3+j*2.4,0.75,0.4);if(!r)continue;K.puesto(r.p[0],r.p[1],rotW(Z,0));Z.hk.mesas.push([r.x,r.z+0.75])}
    if(Z.hk.mesas.length){var m0=L(Z,Z.hk.mesas[0][0],Z.hk.mesas[0][1]-0.75);Z.hk.puesto=[m0[0],m0[1],0,1.5,1.2,0.8,rotW(Z,0)]}
    var pl=pon(Z,lw/2-0.5,ld/2-0.5,0.3,0.3);if(pl)K.planta(pl[0],pl[1],1.2);var lb=pon(Z,-lw/2+0.3,0,0.25,1.1);if(lb)K.libreria(lb[0],lb[1],2.0,rotW(Z,90),2.0);
    Z.hk.spots=Z.hk.mesas.slice(0,3).concat([[0,ld/2-1]])};
  SETS.comedor=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld;Z.hk.mesas=[];var nx=Math.max(1,Math.min(4,Math.floor((lw-1.4)/2.4))),nz=Math.max(1,Math.min(3,Math.floor((ld-2.4)/2.4)));
    for(var i=0;i<nx;i++)for(var j=0;j<nz;j++){var r=ponAlt(pon,Z,(i-(nx-1)/2)*2.4,-ld/2+1.5+j*2.4,0.9,0.9);if(!r)continue;K.mesa(r.p[0],r.p[1],{r:0.5,sillas:4,ry:rotW(Z,0)});Z.hk.mesas.push([r.x+0.95,r.z])}
    var mo=pon(Z,-lw/2+0.6,0,0.4,1.2);if(mo)K.mostrador(mo[0],mo[1],2.4,rotW(Z,-90));Z.hk.spots=Z.hk.mesas.slice(0,3).concat([[-lw/2+1.5,0]])};
  SETS.pasillo=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld;var ex=L(Z,0,-ld/2+0.12);K.extintor(ex[0],0.9,ex[1],rotW(Z,0));
    [[-lw/2+0.5,-ld/2+0.45],[lw/2-0.5,-ld/2+0.45]].forEach(function(p){var q=pon(Z,p[0],p[1],0.3,0.3);if(q)K.planta(q[0],q[1],1)});
    var c=L(Z,0,-ld/2+0.12);K.cartel(c[0],2.0,c[1]+0.02,1.2,0.3,"SALIDA →","#30A46C","#fff",rotW(Z,0));Z.hk.spots=[[-lw/2+1,0],[lw/2-1,0]]};
  SETS.parqueadero=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld,bl=K.std(0xF4F4F2,{roughness:0.6}),am=K.std(0xF2C230,{roughness:0.6});
    var anchoC=2.6,n=Math.max(2,Math.floor((lw-1.2)/anchoC)),fz0=-ld/2+0.35,fz1=Math.min(fz0+5,ld/2-4.6),prof=fz1-fz0,cz=(fz0+fz1)/2,x0=-(n*anchoC)/2;
    var dz0=fz1+0.3,dz1=ld/2-1.4,dc=(dz0+dz1)/2;Z.hk.calzada=dc;Z.hk.cajones=[];
    for(var i=0;i<=n;i++){var p=L(Z,x0+i*anchoC,cz);K.parche(p[0],p[1],Z.rot%180?prof:0.1,Z.rot%180?0.1:prof,bl,1,0.012)}
    var tope=L(Z,0,fz1);K.parche(tope[0],tope[1],Z.rot%180?0.1:n*anchoC,Z.rot%180?n*anchoC:0.1,bl,1,0.012);
    for(var x=-lw/2+1;x<lw/2-1;x+=2.2){var m=L(Z,x,dc);K.parche(m[0],m[1],Z.rot%180?0.12:1.1,Z.rot%180?1.1:0.12,am,1,0.012)}
    var ac=L(Z,0,(dz1+ld/2)/2);K.parche(ac[0],ac[1],Z.rot%180?ld/2-dz1:lw,Z.rot%180?lw:ld/2-dz1,K.pbr("concreto",{color:0xE4E2DC}),2,0.009);
    var PL=["JKS 104","HJM 210","QSA 774","WEL 903","DRT 551","MNB 318","GTR 627","PLO 045","ZXC 912","RFV 336","BGH 771","TYU 590"],TIP=["sedan","hatch","suv","sedan","pickup","hatch"];
    var libre=Math.min(n-1,Math.floor(n/2));Z.hk.libre=null;
    for(i=0;i<n;i++){var cx=x0+(i+0.5)*anchoC,w=L(Z,cx,cz+0.1);Z.hk.cajones.push([cx,cz]);if(i===libre){Z.hk.libre=[cx,cz+0.1];continue}if(i%4===3)continue;
      var a=K.auto(null,{tipo:TIP[i%TIP.length],placa:PL[i%PL.length]});a.position.set(w[0],0,w[1]);a.rotation.y=(Z.rot+180)*RAD;S.autos.push({o:a,placa:PL[i%PL.length],x:w[0],z:w[1],ry:a.rotation.y,cajon:"A"+(i+1)})}
    [[-lw/2+0.4,ld/2-0.4],[lw/2-0.4,ld/2-0.4],[-lw/2+0.4,-ld/2+0.4],[lw/2-0.4,-ld/2+0.4]].forEach(function(p,k){var w=L(Z,p[0],p[1]);if(!S.E0camPoste(w[0],w[1]))K.poste(w[0],w[1])});
    [[-lw/2-0.9,0],[lw/2+0.9,cz]].forEach(function(p){var w=L(Z,p[0],p[1]);if(Math.abs(w[0])<S.E0.piso.w/2-1&&Math.abs(w[1])<S.E0.piso.d/2-1)K.arbol(w[0],w[1],0.95)});
    [1,-1].forEach(function(sg){var e0=L(Z,sg*lw/2,dc),e1=L(Z,sg*(lw/2+1),dc),dx=e1[0]-e0[0],dzz=e1[1]-e0[1],lim=Math.abs(dx)>0.5?S.E0.piso.w/2-Math.abs(e0[0]):S.E0.piso.d/2-Math.abs(e0[1]);if(lim<0.3)return;
      var m=[e0[0]+dx*lim/2,e0[1]+dzz*lim/2],an=dz1-dz0+0.6;K.parche(m[0],m[1],Math.abs(dx)>0.5?lim:an,Math.abs(dx)>0.5?an:lim,K.mat.asfalto,2,0.004)});
    var bw=L(Z,lw/2-0.4,dz0+0.1);var br=K.barrera(bw[0],bw[1],rotW(Z,90));Z.hk.barrera=br;
    Z.hk.spots=[[0,dz1+0.6],[x0+anchoC*1.0,fz1+0.6],[lw/2-2,dz1+0.5]]};
  SETS.perimetro=function(K,Z,pon,L){var lw=Z.lw,ld=Z.ld;var e=[[-lw/2+0.2,ld/2-0.3],[-lw/2+0.2,-ld/2+0.2],[lw/2-0.2,-ld/2+0.2],[lw/2-0.2,ld/2-0.3]].map(function(p){return L(Z,p[0],p[1])});K.cerca(e,2.0);
    for(var x=-lw/2+2;x<lw/2-1;x+=4){var w=L(Z,x,-ld/2+1.0);K.arbol(w[0],w[1],0.8+((x*7)%3)*0.08)}
    [[-lw/2+1,ld/2-0.8],[lw/2-1,ld/2-0.8]].forEach(function(p){var w=L(Z,p[0],p[1]);if(!S.E0camPoste(w[0],w[1]))K.poste(w[0],w[1])});
    Z.hk.spots=[[-lw/3,-ld/2+2],[lw/3,-ld/2+2],[0,0]];Z.hk.borde=[-ld/2+0.3,-ld/2+1.6]};

  /* ------------------------------ gente ------------------------------ */
  var STAFF={camisa:0xD9442E,pantalon:0x1E2433,zapatos:0x1C1E22,gorra:0xD9442E};
  var EPP={camisa:0x3F5A7A,chaleco:0xD4E83A,pantalon:0x26324A,zapatos:0x3A2F2A,gorra:0xF2C230};
  var SIN_EPP={camisa:0x8A6A48,pantalon:0x3A3F4A,zapatos:0x1C1E22};
  var SOSPECHOSO={chaqueta:0x2B3038,cierre:true,pantalon:0x1F1F23,zapatos:0x1C1E22,gorra:0x1C1E22,camisa:0x2B3038};
  var ROPA=[0x3F6FB5,0xB5543F,0x3E8E5A,0x7A5CB0,0xC8962E,0x4A5F80,0xA8445A,0x2E8A9E,0x8A6A48];
  var CUOTA={acceso:2,ventas:3,cajas:3,bodega:2,parqueadero:2,perimetro:1,oficina:2,recepcion:2,produccion:3,pasillo:1,comedor:3};
  function gente(K,L,dentro){
    var Zs=S.zonas,c={};Zs.forEach(function(Z){c[Z.id]=Math.max(Z.cams.length?1:0,CUOTA[Z.tipo]||1)});
    var tot=function(){return Zs.reduce(function(s,Z){return s+c[Z.id]},0)};
    while(tot()>16){var mx=null;Zs.forEach(function(Z){if(c[Z.id]>1&&(!mx||c[Z.id]-(Z.cams.length?0.5:0)>c[mx.id]-(mx.cams.length?0.5:0)))mx=Z});if(!mx){var z0=Zs.filter(function(Z){return c[Z.id]>0&&!Z.cams.length})[0]||Zs.filter(function(Z){return c[Z.id]>0})[0];if(!z0)break;c[z0.id]--}else c[mx.id]--}
    var porTipo={};Zs.forEach(function(Z){(porTipo[Z.tipo]=porTipo[Z.tipo]||[]).push(Z)});
    var n=0;
    function W(Z,p){return L(Z,p[0],p[1])}
    function afuera(Z){var o=Z.puertaVano;if(!o)return W(Z,[0,Z.ld/2+1.2]);var nn=Z.salidaN||[0,1];return[o.x+nn[0]*1.3,o.z+nn[1]*1.3]}
    function entrada(Z){var o=Z.puertaVano;if(!o)return W(Z,[0,Z.ld/2-1]);var nn=Z.salidaN||[0,1];return[o.x-nn[0]*1.1,o.z-nn[1]*1.1]}
    function gondolaMira(V,k){var g=V.hk.gond||[];if(!g.length)return null;var pa=V.hk.pasillos[k%V.hk.pasillos.length],cand=g.slice().sort(function(a,b){return Math.abs(a.x-pa[0])-Math.abs(b.x-pa[0])})[0];
      var off=(((k*37)%5)-2)*0.55,lz=pa[1]+off;return{p:W(V,[pa[0],lz]),m:W(V,[cand.x,lz])}}
    function crear(Z,o,pasos,rol,fijo){var P=K.persona({color:o.color!=null?o.color:ROPA[n%ROPA.length],ropa:o.ropa,adulto:true,ruta:[[0,pasos[0].p[0],pasos[0].p[1]]]});n++;if(!P)return null;
      P._rol=rol;P._z=Z;P._n=n;P._pasos=pasos;P._fijo=!!fijo;P._epp=!!o.epp;P.ruta=ruta(pasos,fijo);P.tramos=null;P._visita=pasos.map(function(s){return s.p});
      if(o.canasta){var ces=K.canastilla(0,0,0,ROPA[(n+3)%9]);P.sostener(ces,"Left",[0,-0.3,0.1]);P.canasta=ces}
      P.post=function(t,dt,e){if(e.a!=="idle"||!e.mira||!e.mira._g)return;K.gesto(P,e.mira._g,t+P._n,0.85)};
      S.gente.push(P);Z.gente.push(P);return P}
    var V=(porTipo.ventas||[])[0];
    Zs.forEach(function(Z){try{gZona(Z)}catch(e){console.log("plan: gente "+Z.tipo+" "+(e&&e.message))}});
    function gZona(Z){var k=c[Z.id],lw=Z.lw,ld=Z.ld,h=Z.hk,sp=function(i){var s=(h.spots||[[0,0]]);return W(Z,s[i%s.length])};if(!k)return;
      var tip=Z.tipo;
      if(tip==="acceso"||tip==="recepcion"){
        var dentro1=V?gondolaMira(V,1):null;
        crear(Z,{canasta:!!V},[{p:afuera(Z),d:1.2},{p:entrada(Z),d:0},{p:dentro1?dentro1.p:sp(1),d:dentro1?9.5:4,m:dentro1?dentro1.m:null},{p:entrada(Z),d:0}],"entrante");
        if(k>1){if(tip==="recepcion"&&h.atiende)crear(Z,{ropa:STAFF},[{p:W(Z,h.atiende),d:30,m:W(Z,[0,ld/2])}],"staff",true);
          else crear(Z,{},[{p:W(Z,h.lado||[lw/2-1.3,0]),d:2.5,g:"celular"},{p:afuera(Z),d:4,g:"telefono"},{p:entrada(Z),d:0}],"cliente")}
        if(k>2&&tip==="recepcion"&&h.frente)crear(Z,{},[{p:afuera(Z),d:1},{p:W(Z,h.frente),d:7,m:W(Z,h.atiende||[0,-ld/2]),g:"hablar"}],"entrante")}
      else if(tip==="ventas"){for(var i=0;i<k;i++){var a=gondolaMira(Z,i),b=gondolaMira(Z,i+2);if(!a){crear(Z,{},[{p:sp(i),d:4},{p:sp(i+1),d:4}],"cliente");continue}
          var pas=[{p:W(Z,h.frente||[0,ld/2-1]),d:0.6},{p:a.p,d:9.4,m:a.m},{p:b.p,d:i===2?3:9.4,m:b.m,g:i===2?"celular":null}];if(i===2)pas.splice(1,1);crear(Z,{canasta:i!==2},pas,"comprando")}}
      else if(tip==="cajas"){var f=h.fila||[];
        if(h.atiende)crear(Z,{ropa:STAFF},[{p:W(Z,h.atiende),d:30,m:W(Z,[h.atiende[0],h.atiende[1]-2])}],"staff",true);
        if(k>1&&f[0])crear(Z,{canasta:true},[{p:W(Z,f[0]),d:8.5,m:W(Z,[f[0][0],f[0][1]+2]),g:"celular"},{p:W(Z,h.salida),d:0},{p:afuera(Z),d:3,g:"telefono"},{p:entrada(Z),d:0},{p:W(Z,[f[0][0]-1.4,f[0][1]-0.4]),d:0}],"fila");
        if(k>2&&f[1])crear(Z,{},[{p:W(Z,f[1]),d:30,m:W(Z,[f[1][0],f[1][1]+2]),g:"nervioso"}],"fila",true);
        if(k>3&&f[2])crear(Z,{canasta:true},[{p:W(Z,f[2]),d:30,m:W(Z,[f[2][0],f[2][1]+2]),g:"escuchar"}],"fila",true)}
      else if(tip==="bodega"){var epp=!!Z.anas.epp,sp0=h.spots||[[0,0]];
        crear(Z,{ropa:EPP,epp:true},[{p:W(Z,sp0[1]),d:4,g:"telefono"},{p:W(Z,sp0[0]),d:5,m:W(Z,[sp0[0][0],sp0[0][1]-1.5])},{p:W(Z,sp0[2]),d:3}],"operario");
        if(k>1)crear(Z,{ropa:epp?SIN_EPP:EPP,epp:!epp},[{p:W(Z,[sp0[1][0]-0.6,sp0[1][1]+1.6]),d:5,m:W(Z,[sp0[1][0]+1,sp0[1][1]+1.6]),g:"hablar"},{p:entrada(Z),d:0},{p:afuera(Z),d:3},{p:entrada(Z),d:0}],epp?"sinEpp":"operario")}
      else if(tip==="produccion"){var ms=h.mesas&&h.mesas.length?h.mesas:[[0,0]];for(i=0;i<k;i++){var m0=ms[i%ms.length];
          if(i<2)crear(Z,{ropa:i===1&&Z.anas.epp?SIN_EPP:EPP,epp:!(i===1&&Z.anas.epp)},[{p:W(Z,m0),d:30,m:W(Z,[m0[0],m0[1]-1]),g:i?"escuchar":null}],i===1&&Z.anas.epp?"sinEpp":"operario",true);
          else crear(Z,{ropa:EPP,epp:true},[{p:sp(3),d:3},{p:W(Z,[ms[0][0]+1.4,ms[0][1]]),d:4},{p:W(Z,[ms[ms.length-1][0]-1.4,ms[ms.length-1][1]]),d:4}],"operario")}}
      else if(tip==="oficina"){var me=h.mesas&&h.mesas.length?h.mesas:[[0,0]];crear(Z,{},[{p:W(Z,me[0]),d:30,m:W(Z,[me[0][0],me[0][1]-1])}],"staff",true);
        if(k>1)crear(Z,{},[{p:W(Z,me[me.length-1]),d:6,m:W(Z,[me[me.length-1][0],me[me.length-1][1]-1])},{p:entrada(Z),d:0},{p:afuera(Z),d:3,g:"telefono"},{p:entrada(Z),d:0},{p:W(Z,me[Math.min(1,me.length-1)]),d:3,g:"hablar"}],"staff")}
      else if(tip==="comedor"){var mm=h.mesas&&h.mesas.length?h.mesas:[[0,0]];for(i=0;i<k;i++){if(i<k-1)crear(Z,{},[{p:W(Z,mm[i%mm.length]),d:30,m:W(Z,[mm[i%mm.length][0]-1,mm[i%mm.length][1]]),g:["hablar","escuchar","celular"][i%3]}],"cliente",true);
          else crear(Z,{},[{p:afuera(Z),d:1},{p:sp(3),d:4,g:"hablar"},{p:W(Z,mm[0]),d:2}],"entrante")}}
      else if(tip==="pasillo"){crear(Z,{},[{p:sp(0),d:1.5},{p:sp(1),d:1.5,g:"telefono"}],"cliente")}
      else if(tip==="parqueadero"){var merodea=Z.anas.merodeo||Z.anas.intrusion||Z.anas.peleas||Z.anas.aglomeracion;
        if(h.libre){var lib=h.libre,ap=W(Z,[lib[0]+1.25,lib[1]+0.6]),ac=W(Z,[lib[0]+1.4,h.calzada+0.8]),dest=W(Z,[lib[0]+1.8,ld/2-0.9]);
          var P=K.persona({color:0x4A5F80,adulto:true,ruta:[[0,ap[0],ap[1]],[7.6,ap[0],ap[1]],[11.6,dest[0],dest[1]],[13.4,dest[0],dest[1],"idle",dest[0],dest[1]+1],[17.2,ap[0],ap[1]],[24,ap[0],ap[1]]]});n++;
          if(P){P._rol="conductor";P._z=Z;P._n=n;P._fijo=true;P._visita=[ap,dest];S.gente.push(P);Z.gente.push(P);S.conductor=P;P.post=function(t,dt,e){P.visible=t>7.5&&t<17.3;if(e.a==="idle"&&t>11.5&&t<13.6)K.gesto(P,"celular",t,0.9)}}}
        if(k>1||!h.libre){var s0=h.spots;crear(Z,{ropa:merodea?SOSPECHOSO:null},[{p:W(Z,s0[0]),d:3,g:merodea?"nervioso":"telefono"},{p:W(Z,s0[1]),d:4,g:merodea?"nervioso":null},{p:W(Z,s0[2]),d:3}],merodea?"merodeador":"cliente")}}
      else if(tip==="perimetro"){var s1=h.spots;crear(Z,{ropa:SOSPECHOSO},[{p:W(Z,s1[0]),d:3,g:"nervioso"},{p:W(Z,s1[1]),d:4,g:"nervioso"},{p:W(Z,s1[2]),d:2}],"merodeador")}
      else{crear(Z,{},[{p:sp(0),d:4},{p:sp(1),d:4}],"cliente")}
    }
  }
  /* pasos → ruta del motor: [t,x,z] llegada y [t,x,z,"idle",mx,mz] fin de la parada; el bucle vuelve al punto de partida */
  function ruta(pasos,fijo){var r=[],t=0,v=1.05,meta=[];if(fijo&&pasos.length===1){var s=pasos[0];var e=[0,s.p[0],s.p[1],"idle",s.m?s.m[0]:s.p[0],s.m?s.m[1]:s.p[1]+1];r.push(e);meta.push(s.g||null);r._meta=meta;return r}
    pasos.forEach(function(s,i){r.push([t,s.p[0],s.p[1]]);meta.push(null);if(s.d>0){t+=s.d;r.push(s.m?[t,s.p[0],s.p[1],"idle",s.m[0],s.m[1]]:[t,s.p[0],s.p[1],"idle",s.p[0]+0.01,s.p[1]+1]);meta.push(s.g||null)}
      var nx=pasos[(i+1)%pasos.length];t+=Math.hypot(nx.p[0]-s.p[0],nx.p[1]-s.p[1])*1.3/v});
    r.push([t,pasos[0].p[0],pasos[0].p[1]]);meta.push(null);var k=(DUR-0.05)/Math.max(1,t);r.forEach(function(e){e[0]*=k});r._meta=meta;return r}
  /* Con los caminos ya calculados por el motor (rodeando muebles), reparte el tiempo: caminar a ~1,1 m/s y el resto en las paradas. */
  function reprogramar(){S.gente.forEach(function(P){try{if(!P.tramos)P.compilar();var meta=P.ruta._meta||[];P.ruta.forEach(function(w,i){if(meta[i])w._g=meta[i]});
      var cerca=S.cams.some(function(C){return C.Z&&C.Z===P._z});P.ruta.forEach(function(w){if(w[3]==="idle"&&!w._g&&!w._gond&&!cerca)w._g=null});
      if(P._fijo||P.tramos.length<2)return;var tr=P.tramos,v=1.1*P.raiz.scale.y,cam=0,par=0;
      tr.forEach(function(T,i){if(i===tr.length-1)return;if(T.len>0)cam+=T.len/v;else par+=T.t1-T.t0});
      var libre=DUR-0.1-cam,kp=par>0?Math.max(0.3,libre/par):0,kc=1;if(par>0&&libre<0.3*par){kp=0.3;kc=(DUR-0.1-0.3*par)/Math.max(0.1,cam)}else if(par<=0)kc=(DUR-0.1)/Math.max(0.1,cam);
      var t=0;tr.forEach(function(T,i){if(i===tr.length-1){T.t0=t;T.t1=1e9;return}var d=T.len>0?T.len/v*kc:(T.t1-T.t0)*kp;T.t0=t;T.t1=t+Math.max(0.05,d);t=T.t1})}catch(e){console.log("plan: ruta "+(e&&e.message))}})}

  /* ------------------------------ analítica de cada cámara ------------------------------ */
  function analitica(K,CAM){var Z=CAM.Z,c=CAM.c,T=THREE;
    if(Z)S.gente.forEach(function(P){var visita=P._z===Z||(P._visita||[]).some(function(p){return S.dentro(Z,p[0],p[1],-0.2)});if(!visita)return;
      var R=K.recuadro(P,{texto:"",estado:"vigila"});R.visible=false;R.pip=false;CAM.cajas.push(R)});
    function fijo(x,y,z,w,h,d,ry,txt){var R=K.recuadro({raiz:{position:new T.Vector3(x,y,z)},visible:true,alto:h,rot:0},{texto:txt||"",w:w,h:h,d:d,estado:"vigila"});R.fijo=[x,y,z];R.l.rotation.y=(ry||0)*RAD;R.visible=false;R.pip=false;R.l.visible=false;return R}
    function fijoDe(hk,txt){if(!hk)return null;return fijo(hk[0],hk[2]||0,hk[1],hk[3]||1,hk[4]||1.2,hk[5]||1,hk[6]||0,txt)}
    var dz={c:CAM};CAM.dz=dz;
    c.analiticas.forEach(function(id,ix){var a=ana(id),h=Z?Z.hk:{};if(!Z&&a.deco!=="autos")return;var o=Z&&Z.puertaVano;
      switch(a.deco){
        case "linea":if(o&&!dz.linea){var nn=Z.salidaN||[0,1],w=o.w/2+0.3,cx=o.x-nn[0]*0.7,cz=o.z-nn[1]*0.7,pa=o.eje==="h"?[cx-w,cz]:[cx,cz-w],pb=o.eje==="h"?[cx+w,cz]:[cx,cz+w];
            var nrm=[-(pb[1]-pa[1]),pb[0]-pa[0]];if(nrm[0]*-nn[0]+nrm[1]*-nn[1]<0){var tt=pa;pa=pb;pb=tt}dz.linea=K.lineaCruce(pa,pb,{estado:"oro"});dz.lin={o:o,n:nn,cx:o.x,cz:o.z,w:o.w}}break;
        case "puerta":if(o&&!dz.zona){var n2=Z.salidaN||[0,1],ww=o.w/2+0.5,dd=1.7,x1=o.x-n2[0]*0.15,z1=o.z-n2[1]*0.15,x2=o.x-n2[0]*dd,z2=o.z-n2[1]*dd;
            dz.zona=o.eje==="h"?K.zona([[o.x-ww,z1],[o.x+ww,z1],[o.x+ww,z2],[o.x-ww,z2]],{estado:"vigila",op:0.14}):K.zona([[x1,o.z-ww],[x1,o.z+ww],[x2,o.z+ww],[x2,o.z-ww]],{estado:"vigila",op:0.14})}break;
        case "calor":if(!S.calorZ||S.calorZ.Z!==Z){var cal=K.calor(Z.w-0.3,Z.d-0.3,{x:Z.x,z:Z.z});cal.m.position.y=0.016;S.calores=(S.calores||[]).concat([{C:cal,Z:Z,t:0}]);
            (h.spots||[]).forEach(function(sp){var p=S.L(Z,sp[0],sp[1]);for(var k=0;k<60;k++)cal.sumar(p[0]+(K.rnd()-0.5)*1.2,p[1]+(K.rnd()-0.5)*3,0.5)});cal.pintar();S.calorZ={Z:Z}}break;
        case "anillo":if(!dz.anillo){var hp=h.spots&&h.spots[Z.tipo==="parqueadero"?1:0];var ap=hp?S.L(Z,hp[0],hp[1]):[Z.x,Z.z];dz.anillo=K.anillo(ap[0],ap[1],Z.tipo==="ventas"?0.9:1.6,{estado:"vigila",op:0.7})}break;
        case "fila":if(h.filaPol&&!dz.zona)dz.zona=K.zona(h.filaPol,{estado:"vigila",op:0.16});break;
        case "autopago":if(h.autopago&&!CAM.obj&&ix===0)CAM.obj=fijoDe(h.autopago,"Autopago");break;
        case "borde":if(!dz.zona){var b0=(h.borde||[-Z.ld/2+0.3,-Z.ld/2+1.6]),pts=[[-Z.lw/2+0.3,b0[0]],[Z.lw/2-0.3,b0[0]],[Z.lw/2-0.3,b0[1]],[-Z.lw/2+0.3,b0[1]]].map(function(p){return S.L(Z,p[0],p[1])});dz.zona=K.zona(pts,{estado:"detecta",op:0.12})}break;
        case "restringida":if(!dz.zona){var r0=Z.tipo==="bodega"?[-Z.ld/2+0.2,-Z.ld/2+2.0]:(Z.tipo==="parqueadero"?[-Z.ld/2+0.3,-Z.ld/2+5.2]:[-Z.ld/2+0.3,-Z.ld/4]),xx=Z.tipo==="parqueadero"?[-Z.lw/2+0.3,-Z.lw/2+5]:[-Z.lw/2+0.3,Z.lw/2-0.3];
            dz.zona=K.zona([[xx[0],r0[0]],[xx[1],r0[0]],[xx[1],r0[1]],[xx[0],r0[1]]].map(function(p){return S.L(Z,p[0],p[1])}),{estado:"detecta",op:0.12});dz.rest={x0:xx[0],x1:xx[1],z0:r0[0],z1:r0[1]}}break;
        case "derrame":if(!CAM.obj&&ix===0){var dp=h.pasillos?S.L(Z,h.pasillos[0][0],h.pasillos[0][1]+0.8):(h.spots?S.L(Z,h.spots[0][0]+0.8,h.spots[0][1]+0.6):[Z.x+0.8,Z.z+0.5]);
            var pm=K.parche(dp[0],dp[1],0.9,0.6,K.std(0x5BA4FF,{transparent:true,opacity:0.55,roughness:0.05,metalness:0.2}),1,0.012);pm.rotation.z=0.5;CAM.obj=fijo(dp[0],0,dp[1],1,0.12,0.8,0,"Derrame");dz.derrame=pm}break;
        case "fuego":if(!CAM.obj&&ix===0){var fp=h.estibas&&h.estibas[0]?S.L(Z,h.estibas[0][0],h.estibas[0][1]+0.8):S.L(Z,-Z.lw/2+1.2,-Z.ld/2+1.2);dz.fuego=K.fuego(fp[0],0.05,fp[1],{r:0.25});dz.humo=K.fuego(fp[0],0.6,fp[1],{humo:true,n:60,r:0.3});CAM.obj=fijo(fp[0],0,fp[1],1,1.6,1,0,"Humo")}break;
        case "abandono":if(!CAM.obj&&ix===0){var bp=h.spots?S.L(Z,h.spots[0][0]+0.6,h.spots[0][1]+0.9):[Z.x,Z.z];var maleta=K.grupo(bp[0],bp[1],25);K.caja(0,0,0,0.5,0.62,0.26,K.std(0x2B3038,{roughness:0.6}),maleta);K.caja(0,0.62,0,0.18,0.05,0.04,K.mat.negro,maleta);CAM.obj=fijo(bp[0],0,bp[1],0.75,0.85,0.55,25,"Objeto")}break;
        case "autos":S.autos.forEach(function(A2){if(Z&&!S.dentro(Z,A2.x,A2.z,-0.5))return;var R=K.recuadro({raiz:A2.o,visible:true,alto:1,rot:0},{texto:A2.placa,w:2,h:1.6,d:4.6,estado:"ok"});R.fijo=[A2.x,0,A2.z];R.l.rotation.y=A2.ry;R.visible=false;R.pip=false;R.l.visible=false;R._auto=A2;CAM.cajas.push(R)});
          if(S.movil&&(!Z||Z===S.movil.Z)){var Rm=K.recuadro({raiz:S.movil.o,visible:true,alto:1,rot:0},{texto:S.movil.placa,w:2,h:1.6,d:4.6,estado:"vigila"});Rm.fijo=[0,0,0];Rm.visible=false;Rm.pip=false;Rm.l.visible=false;Rm._movil=true;CAM.cajas.push(Rm);if(ix===0)CAM.obj=Rm}break;
        case "gondola":if(!CAM.obj&&ix===0)CAM.obj=fijoDe(h.gondola,"Góndola");break;
        case "rack":if(!CAM.obj&&ix===0&&h.racks&&h.racks.length)CAM.obj=fijoDe(h.racks[0],"Rack");break;
        case "canastas":if(!CAM.obj&&ix===0&&h.canastas)CAM.obj=fijo(h.canastas[0],0,h.canastas[1],h.canastas[2]+0.2,1.0,h.canastas[2],0,"Inventario");break;
        case "puesto":if(!CAM.obj&&ix===0)CAM.obj=fijoDe(h.puesto,"Puesto");break;
        case "puertaObj":if(!CAM.obj&&ix===0&&o)CAM.obj=fijo(o.x,0,o.z,o.eje==="h"?o.w+0.3:0.5,2.4,o.eje==="h"?0.5:o.w+0.3,0,"Puerta");break;
        case "pasillo":if(!dz.zona&&h.pasillo){var pz=h.pasillo,pl=Math.max(2,pz[2]),q1=[[-pl/2,pz[1]-0.9],[pl/2,pz[1]-0.9],[pl/2,pz[1]+0.9],[-pl/2,pz[1]+0.9]].map(function(p){return S.L(Z,p[0],p[1])});dz.zona=K.zona(q1,{estado:"vigila",op:0.12});
            if(ix===0){var cp=S.L(Z,pl/2-1.3,pz[1]);K.caja(cp[0],0,cp[1],0.55,0.5,0.5,K.mat.carton);CAM.obj=fijo(cp[0],0,cp[1],0.8,0.7,0.8,0,"Mercancía")}}break;
      }});
  }

  /* ------------------------------ cámara activa ------------------------------ */
  function aplicarActiva(suave){if(!S||!S.cams.length){M.E.camId="SIN CÁMARAS";return}var E=M.E,C=S.cams[activa],c=C.c,cv=M.cctv;
    cv.position.set(c.pos[0],c.pos[1],c.pos[2]);cv.fov=c.fov;cv.lookAt(c.mira[0],c.mira[1],c.mira[2]);cv.updateProjectionMatrix();cv.updateMatrixWorld();
    E.camId=c.etiqueta+" · "+(C.Z?C.Z.nombre:"");
    S.cams.forEach(function(K2,i){var on=i===activa;if(K2.cono){K2.cono.material.opacity=0.08;K2.cono.visible=on}if(K2.ar){K2.ar.material.opacity=on?0.7:0.05;K2.ar.visible=true}
      if(K2.hu[0])K2.hu[0].material.opacity=on?0.24:0.07;if(K2.hu[1])K2.hu[1].material.opacity=on?1:0.35;
      if(K2.etq)K2.etq.set(on?c.etiqueta+" · "+nombre(c.analiticas[0]):K2.c.etiqueta,on?"cam on":"cam");
      K2.cajas.forEach(function(R){if(!on){R.visible=false;R.pip=false;if(R.fijo)R.l.visible=false}});if(K2.obj&&!on){K2.obj.visible=false;K2.obj.pip=false;K2.obj.l.visible=false}});
    if(E.tab)E.tab.innerHTML="";
    var f=S.fases;f.length=0;f.push([0,"vigila",c.etiqueta+" vigila"]);var a=C.a,t0=C.t0;f.push([t0,"detecta",a.det]);if(a.niv==="alerta")f.push([t0+1.5,"alerta",a.al||a.det]);f.push([t0+3.3,"ok",a.ok]);if(t0+5.2<DUR)f.push([t0+5.2,"vigila",c.etiqueta+" vigila"]);E.fase=-2;
    if(suave!==false&&C.Z&&!recorrido)encuadrar([C.Z.x-C.Z.w/2,C.Z.x+C.Z.w/2,C.Z.z-C.Z.d/2,C.Z.z+C.Z.d/2],false);
    avisar({cam:activa})}
  function nombre(id){return(escena&&escena.nombres[id])||NOMBRES[id]||id}

  /* ------------------------------ encuadre de la cámara orbital ------------------------------ */
  var meta=null,tmp=null;
  function encuadrar(b,ya){if(!tmp)tmp=new THREE.PerspectiveCamera(34,1.6,0.1,400);var cam=M.camara;tmp.fov=cam.fov;tmp.aspect=cam.aspect||1.6;tmp.updateProjectionMatrix();
    var cx=(b[0]+b[1])/2,cz=(b[2]+b[3])/2,tg=new THREE.Vector3(cx,0.4,cz),az=28*RAD,el=44*RAD,dir=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)),pts=[];
    [b[0],b[1]].forEach(function(x){[b[2],b[3]].forEach(function(z){[0,2.8].forEach(function(y){pts.push(new THREE.Vector3(x,y,z))})})});
    function cabe(d){tmp.position.copy(tg).addScaledVector(dir,d);tmp.lookAt(tg);tmp.updateMatrixWorld();var v=new THREE.Vector3();return pts.every(function(p){v.copy(p).project(tmp);return Math.abs(v.x)<0.9&&v.y<0.78&&v.y>-0.86&&v.z<1})}
    var lo=4,hi=160;for(var i=0;i<30;i++){var m=(lo+hi)/2;if(cabe(m))hi=m;else lo=m}var d=Math.max(7,hi);
    M.controles.maxDistance=Math.max(40,d*1.6);meta={t:tg,p:tg.clone().addScaledVector(dir,d)};
    if(ya){M.controles.target.copy(meta.t);M.camara.position.copy(meta.p);if(M.E.camBase)M.E.camBase.copy(meta.p);M.controles.update()}
    M.E.tocado=false}
  function encuadreGeneral(ya){if(!S)return;var Zs=S.zonas;if(!Zs.length){encuadrar([-8,8,-6,6],ya);return}
    encuadrar([Math.min.apply(null,Zs.map(function(Z){return Z.x-Z.w/2})),Math.max.apply(null,Zs.map(function(Z){return Z.x+Z.w/2})),Math.min.apply(null,Zs.map(function(Z){return Z.z-Z.d/2})),Math.max.apply(null,Zs.map(function(Z){return Z.z+Z.d/2}))],ya)}
  function ajustarSol(W,D){var sol=null;M.scene.traverse(function(o){if(o.isDirectionalLight&&o.castShadow)sol=o});if(!sol)return;var r=Math.max(18,Math.hypot(W,D)/2*0.8);
    sol.position.set(-10,18,12).multiplyScalar(Math.max(1,r/18*1.6));var c=sol.shadow.camera;c.left=-r;c.right=r;c.top=r;c.bottom=-r;c.near=1;c.far=sol.position.length()+r*2;c.updateProjectionMatrix()}

  /* ------------------------------ cada cuadro ------------------------------ */
  var _v=new THREE.Vector3();
  function enVista(CAM,x,y,z){_v.set(x,y,z).project(CAM.vc);return _v.z<1&&Math.abs(_v.x)<0.95&&Math.abs(_v.y)<0.95}
  function texto(s,CAM,P){var Z=CAM.Z,a=CAM.a;return String(s||"").replace("{zona}",Z?Z.nombre.toLowerCase():"la zona").replace("{nombre}",nombre(CAM.idA)).replace("{id}",P&&P._n?"ID "+(10+P._n*7%90):"la persona")
    .replace("{demo}",P?demo(P):"").replace(/\{placa\}/g,P&&P._placa?P._placa:(S.movil?S.movil.placa:"KTV 482"))}
  function demo(P){return["Mujer · 25-34","Hombre · 35-44","Mujer · 18-24","Hombre · 45-54","Mujer · 35-44","Hombre · 25-34"][P._n%6]}
  function etiquetaPersona(CAM,P,t){var id=CAM.idA,a=CAM.a,l=a.lbl||"Persona",num="ID "+(10+P._n*7%90);
    if(l==="id")return num;if(l==="demo")return demo(P);if(l==="tiempo"){var s=Math.floor((P._enZona||0)+40+P._n*13);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")+" min"}
    if(l==="staff")return P._rol==="staff"||P._rol==="operario"?"Personal":"Cliente";if(l==="blanca")return P._rol==="staff"?"Autorizado":"Visitante";if(l==="acceso")return P._rol==="staff"||P._rol==="operario"?"Autorizado":"Visitante";
    if(P._rol==="staff"&&["Persona","En fila","Visitante","Rostro OK","Rostro visible","Detectado"].indexOf(l)>=0)return"Personal";if(l==="epp")return P._epp?"Casco ✓ Chaleco ✓":"Sin casco";if(l==="comprador")return P.canasta?"Comprador activo":"De paso";if(l==="cliente")return P._rol==="staff"?"Personal":"Cliente "+String(P._n).padStart(2,"0");return l}
  function estadoBase(CAM,P){var l=CAM.a.lbl;if(l==="staff")return P._rol==="staff"||P._rol==="operario"?"staff":"cliente";if(P._rol==="staff"&&["Persona","En fila","Visitante","Rostro OK","Rostro visible","Detectado"].indexOf(l)>=0)return"Personal";if(l==="epp")return P._epp?"ok":"detecta";return"vigila"}
  function fase(CAM,t){var k=t-CAM.t0,a=CAM.a;if(k<0||k>5.2)return"vigila";if(k<1.5)return"detecta";if(a.niv==="alerta"&&k<3.3)return"alerta";if(k<3.3)return"detecta";return"ok"}
  function elegir(CAM,t){var a=CAM.a;if(a.obj&&CAM.obj)return CAM.obj;var Z=CAM.Z;if(!Z)return null;var dentro=S.gente.filter(function(P){return P.visible!==false&&P.raiz.visible!==false&&S.dentro(Z,P.raiz.position.x,P.raiz.position.z,-0.1)});
    if(!dentro.length)return CAM.obj||null;function pref(P){var r=a.rol,s=0;if(r==="noStaff")s+=P._rol!=="staff"&&P._rol!=="operario"?2:0;else if(r==="quieto")s+=P.vel<0.1?2:0;else if(r&&P._rol===r)s+=3;
      if(enVista(CAM,P.raiz.position.x,1,P.raiz.position.z))s+=2;return s}
    dentro.sort(function(x,y){return pref(y)-pref(x)});var P=dentro[0];return CAM.cajas.filter(function(R){return R.P===P})[0]||null}
  function evento(CAM,niv,txt){var t=CAM.c.etiqueta+" · "+txt;M.K.evento(t,niv==="ok"?"ok":niv);avisar({evento:{cam:CAM.i,analitica:CAM.idA,texto:txt,nivel:niv}})}
  function cruces(t){S.cams.forEach(function(CAM){var L0=CAM.dz.lin;if(!L0)return;CAM.ent=CAM.ent||0;CAM.sal=CAM.sal||0;CAM.lado=CAM.lado||{};
    S.gente.forEach(function(P){var x=P.raiz.position.x,z=P.raiz.position.z,s=(x-L0.cx)*-L0.n[0]+(z-L0.cz)*-L0.n[1]-0.7,al=L0.o.eje==="h"?Math.abs(x-L0.cx):Math.abs(z-L0.cz);var ant=CAM.lado[P._n];CAM.lado[P._n]=s;
      if(ant==null||al>L0.w/2+0.6||!P.raiz.visible)return;if(ant<0&&s>=0){CAM.ent++;if(CAM.dz.linea)CAM.dz.linea.set("ok");CAM.tl=t}else if(ant>=0&&s<0){CAM.sal++;if(CAM.dz.linea)CAM.dz.linea.set("detecta");CAM.tl=t}});
    if(CAM.dz.linea&&CAM.tl!=null&&t-CAM.tl>1.2){CAM.dz.linea.set("oro");CAM.tl=null}})}
  function contadores(CAM,t){var K=M.K,Z=CAM.Z,n=Z?S.gente.filter(function(P){return P.raiz.visible&&S.dentro(Z,P.raiz.position.x,P.raiz.position.z,0)}).length:0,hechos={};
    CAM.c.analiticas.slice(0,3).forEach(function(id){var v=null;
      if(id==="conteo"||id==="cruce"){v=["Entraron hoy",String(412+(CAM.ent||0))];if(!hechos.sal){K.contador("Salieron",String(398+(CAM.sal||0)));hechos.sal=1}}
      else if(id==="aforo")v=["Adentro ahora",(14+(CAM.ent||0)-(CAM.sal||0))+" / 60"];
      else if(id==="filas"){var fp=Z&&Z.hk.filaPol,nf=fp?S.gente.filter(function(P){var x=P.raiz.position.x,z=P.raiz.position.z;return x>fp[0][0]&&x<fp[1][0]&&z>fp[0][1]&&z<fp[2][1]}).length:n;v=["En fila",nf+(nf===1?" persona":" personas")];K.contador("Espera estimada",Math.max(1,Math.round(nf*1.6+(fase(CAM,t)==="alerta"?3:0)))+" min")}
      else if(id==="placas")v=["Vehículos",String(S.autos.length+(S.movil&&S.movil.dentro?1:0))];
      else if(id==="epp"){var ops=Z?S.gente.filter(function(P){return P._z===Z}):[];v=["Con EPP",ops.filter(function(P){return P._epp}).length+" de "+ops.length]}
      else if(id==="calor")v=["Punto más visitado",Z&&Z.tipo==="ventas"?"Pasillo 2":(Z?Z.nombre:"—")];
      else if(id==="huecos")v=["Surtido",(fase(CAM,t)==="ok"?"98":"86")+" %"];
      else if(id==="racks"||id==="bodega")v=["Ocupación racks","78 %"];
      else if(id==="staff")v=["Personal en sala",String(S.gente.filter(function(P){return P._rol==="staff"&&Z&&P._z===Z}).length)];
      else if(id==="permanencia")v=["Permanencia media","2:40 min"];
      else if(id==="demografia")v=["Visitas hoy","412"];
      else v=["Personas en zona",String(n)];
      if(v&&!hechos[v[0]]){hechos[v[0]]=1;K.contador(v[0],v[1])}})}
  function actualizar(t,dt){if(!S)return;var E=M.E;
    if(!S.ini){S.ini=true;reprogramar();encuadreGeneral(true)}
    if(t<S.tPrev-1){S.cams.forEach(function(CAM){CAM.est="vigila";CAM.tgt=null});S.gente.forEach(function(P){P.caida=0;P.pelea=0})}S.tPrev=t;
    /* puertas que abren solas */
    S.puertas.forEach(function(D){var c=S.gente.some(function(P){return P.raiz.visible&&Math.hypot(P.raiz.position.x-D.x,P.raiz.position.z-D.z)<2.1});D.f+=((c?1:0)-D.f)*Math.min(1,dt*4);if(D.g.userData.abrir)D.g.userData.abrir(D.f)});
    /* auto que entra al parqueadero */
    if(S.movil)moverAuto(t);
    cruces(t);
    /* calor */
    (S.calores||[]).forEach(function(H){S.gente.forEach(function(P){if(P.raiz.visible&&S.dentro(H.Z,P.raiz.position.x,P.raiz.position.z,0.1))H.C.sumar(P.raiz.position.x,P.raiz.position.z,dt*1.5)});H.t+=dt;if(H.t>0.4){H.t=0;H.C.pintar()}});
    S.gente.forEach(function(P){if(P._z&&S.dentro(P._z,P.raiz.position.x,P.raiz.position.z,0))P._enZona=(P._enZona||0)+dt});
    /* eventos de cada cámara */
    S.cams.forEach(function(CAM,i){var f=fase(CAM,t),on=i===activa,a=CAM.a;
      if(f!==CAM.est){if(f==="detecta"&&CAM.est==="vigila"){CAM.tgt=elegir(CAM,t);evento(CAM,"detecta",texto(a.det,CAM,CAM.tgt&&CAM.tgt.P))}
        else if(f==="alerta")evento(CAM,"alerta",texto(a.al||a.det,CAM,CAM.tgt&&CAM.tgt.P));else if(f==="ok")evento(CAM,"ok",texto(a.ok,CAM,CAM.tgt&&CAM.tgt.P));
        CAM.est=f;if(f==="vigila")CAM.tgt=null}
      var dz=CAM.dz,est=f==="vigila"?"vigila":f;if(dz.zona)dz.zona.set(f==="vigila"?(a.deco==="borde"||a.deco==="restringida"?"detecta":"vigila"):est,f==="alerta");if(dz.anillo)dz.anillo.set(est);
      var kf=f==="detecta"?Math.min(1,(t-CAM.t0)/1.2):(f==="alerta"?1:(f==="ok"?Math.max(0,1-(t-CAM.t0-3.3)/1.2):0));if(dz.fuego){dz.fuego.int=kf;dz.humo.int=kf*0.8}if(dz.derrame)dz.derrame.visible=f!=="vigila"||((t-CAM.t0)<0&&false);
      var P=CAM.tgt&&CAM.tgt.P&&CAM.tgt.P.mx?CAM.tgt.P:null;if(P){if(a.caida)P.caida=f==="alerta"||f==="detecta"?Math.min(1,(t-CAM.t0)/0.6):Math.max(0,P.caida-dt*1.5);
        if(a.pelea){var otro=S.gente.filter(function(Q){return Q!==P&&Q._z===P._z})[0];P.pelea=f==="alerta"?1:0;if(otro)otro.pelea=P.pelea}}
      /* recuadros: solo los de la cámara activa, sobre lo que está en su zona */
      if(!on)return;
      CAM.cajas.forEach(function(R){var dentroZ;if(R._movil){var mv=S.movil;dentroZ=mv.o.visible;R.fijo=[mv.o.position.x,0,mv.o.position.z];R.l.rotation.y=mv.o.rotation.y;R.l.visible=dentroZ;R.visible=dentroZ;R.pip=dentroZ;
          if(R===CAM.tgt)R.set(est==="vigila"?"vigila":est,est==="vigila"?mv.placa:mv.placa+" · "+(mv.tipo||"carro"));else R.set(mv.parado?"ok":"detecta",mv.placa);return}
        if(R._auto){R.l.visible=true;R.visible=true;R.pip=true;R.set("ok",R._auto.placa+" · "+R._auto.cajon);return}
        var Q=R.P;dentroZ=CAM.Z&&Q.raiz.visible&&S.dentro(CAM.Z,Q.raiz.position.x,Q.raiz.position.z,-0.15);R.visible=!!dentroZ;R.pip=!!dentroZ;
        if(R===CAM.tgt&&f!=="vigila")R.set(f==="ok"?"ok":f,f==="ok"?(a.tagOk||"Resuelto"):texto(a.tag||a.det,CAM,Q));else R.set(estadoBase(CAM,Q),etiquetaPersona(CAM,Q,t))});
      if(CAM.obj&&!CAM.obj._movil){var O=CAM.obj,vis=a.obj?true:f!=="vigila";O.visible=vis;O.pip=vis;O.l.visible=vis;if(f!=="vigila"&&(CAM.tgt===O||a.obj))O.set(f,texto(a.tag,CAM,null));else O.set("vigila",nombre(CAM.idA))}
      contadores(CAM,t)});
    /* recorrido automático */
    if(recorrido&&S.cams.length>1){var ahora=performance.now();if(ahora-tRecorrido>6000){tRecorrido=ahora;activa=(activa+1)%S.cams.length;aplicarActiva(false)}}
    /* re-encuadre suave */
    if(meta&&!E.tocado&&E.camBase){var k=1-Math.exp(-dt*2.2);M.controles.target.lerp(meta.t,k);E.camBase.lerp(meta.p,k)}}

  /* auto: llega por la calzada, entra de frente al cajón libre, se queda y sale en reversa */
  function prepararAuto(K){var Z=S.zonas.filter(function(z){return z.tipo==="parqueadero"&&z.hk.libre})[0];if(!Z)return;var L=S.L,lb=Z.hk.libre,dc=Z.hk.calzada,lw=Z.lw;
    var a=K.auto(0xC8342B,{placa:"KTV 482"});a.userData.obst=false;
    function curva(pts){return new THREE.CatmullRomCurve3(pts.map(function(p){var w=L(Z,p[0],p[1]);return new THREE.Vector3(w[0],0,w[1])}),false,"centripetal")}
    S.movil={o:a,Z:Z,placa:"KTV 482",tipo:"carro rojo",ent:curva([[lw/2+5,dc],[lb[0]+4.5,dc],[lb[0]+1.4,dc-0.6],[lb[0]+0.1,lb[1]+2.2],[lb[0],lb[1]]]),
      rev:curva([[lb[0],lb[1]],[lb[0],lb[1]+2.3],[lb[0]-1.8,dc]]),sal:curva([[lb[0]-1.8,dc],[lb[0]-5,dc],[-lw/2-6,dc]])}}
  function moverAuto(t){var mv=S.movil,o=mv.o,u,p,tg,h,s=function(k){k=Math.max(0,Math.min(1,k));return k*k*(3-2*k)};
    function en(cur,k,rev){p=cur.getPointAt(k);tg=cur.getTangentAt(Math.min(0.999,Math.max(0.001,k)));o.position.set(p.x,0,p.z);h=rev?Math.atan2(-tg.x,-tg.z):Math.atan2(tg.x,tg.z);o.rotation.y=h}
    if(t<1){o.visible=false;en(mv.ent,0)}else if(t<7.2){o.visible=true;en(mv.ent,s((t-1)/6.2))}else if(t<17.8){en(mv.ent,1)}else if(t<20.2){en(mv.rev,s((t-17.8)/2.4),true)}else if(t<23.6){en(mv.sal,s((t-20.2)/3.4))}else{o.visible=false}
    mv.parado=t>=7.2&&t<17.8;mv.dentro=o.visible&&S.dentro(mv.Z,o.position.x,o.position.z,-1);
    var br=mv.Z.hk.barrera;if(br&&br.userData.abrir){var bp=br.position,d=Math.hypot(o.position.x-bp.x,o.position.z-bp.z);br._f=(br._f||0)+(((o.visible&&d<5.5)?1:0)-(br._f||0))*0.08;br.userData.abrir(br._f)}}

  /* ------------------------------ montar / protocolo ------------------------------ */
  function montar(){if(!escena||!M.listo)return false;def=construir(escena);M.vista=vista;try{M.montar(raiz,def)}catch(e){console.log("plan: montar "+(e&&e.message));M.detener();reposo.textContent="No se pudo armar la maqueta.";avisar({error:"sin-escena"});return false}M.ponerVista(vista);reposo.textContent="";return true}
  function recibir(d){if(!d||typeof d!=="object")return;
    if(d.tipo==="vigias-plan"&&d.escena){var e=sanear(d.escena);if(!e){avisar({error:"sin-escena"});return}escena=e;recorrido=false;activa=typeof d.cam==="number"&&d.cam>=0?Math.floor(d.cam):0;if(d.cam===-1){recorrido=true;tRecorrido=performance.now()}
      if(d.vista==="cctv"||d.vista==="maqueta")vista=d.vista;if(M.listo){if(montar())avisar({montado:true})}else pendiente=true;return}
    if(d.tipo==="vigias-plan"&&!d.escena&&!d.listo&&!d.montado&&d.cam==null&&!d.evento&&!d.error){avisar({error:"sin-escena"});return}
    if(d.tipo==="vigias-plan-cam"){var c=Math.floor(+d.cam);if(!isFinite(c))return;if(c<0){recorrido=true;tRecorrido=performance.now();if(S&&S.ini)encuadreGeneral(false);return}recorrido=false;
      if(!S||!S.cams||!S.cams.length){activa=c;return}activa=Math.max(0,Math.min(S.cams.length-1,c));aplicarActiva(true);return}
    if(d.tipo==="vigias-plan-vista"&&(d.vista==="cctv"||d.vista==="maqueta")){vista=d.vista;M.vista=vista;if(M.listo)M.ponerVista(vista)}}
  window.addEventListener("message",function(ev){if(ev.source!==window&&ev.source!==parent)return;var d=ev.data;if(d&&d.tipo==="vigias-plan"&&(d.listo||d.montado||d.evento||d.error||(d.cam!=null&&!d.escena)))return;recibir(d)});
  window.__plan={estado:function(){return{activa:activa,recorrido:recorrido,cams:S&&S.cams?S.cams.length:0,gente:S&&S.gente?S.gente.length:0,vanos:S&&S.vanos?S.vanos.map(function(o){return[o.tipo,o.x,o.z,o.w]}):[]}}};
  if(q.get("demo")==="1"){escena=sanear(DEMO);pendiente=true}
  M.arrancar(function(){avisar({listo:true});if(pendiente&&escena){pendiente=false;if(montar())avisar({montado:true})}else if(!escena)reposo.textContent="Esperando la propuesta de cámaras…";
    window.addEventListener("resize",function(){M.tamano();if(S&&S.ini&&recorrido)encuadreGeneral(false)})});
  document.addEventListener("visibilitychange",function(){if(document.hidden)M.detener();else if(M.listo&&escena)montar()});
})();
