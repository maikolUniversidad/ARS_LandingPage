// Parche único (ya aplicado) que dio a motor.js la «vista de cámara» y el reloj externo. Se conserva como registro.
const fs = require("fs");
const f = process.argv[2];
let s = fs.readFileSync(f, "utf8");
function rep(a, b) {
  if (!s.includes(a)) {
    console.error("NO ENCONTRADO:", a.slice(0, 80));
    process.exit(1);
  }
  s = s.replace(a, b);
}
// 1) K.camara recuerda mira, grupo y huella
rep("K.camara=function(pos,mira,o){o=o||{};", "K.camara=function(pos,mira,o){o=o||{};E.cctvMira=mira.slice();E.cctvOpc=o;");
rep(
  "var g=new THREE.Group();g.position.copy(cctv.position);g.quaternion.copy(cctv.quaternion);add(g);",
  "var g=new THREE.Group();g.position.copy(cctv.position);g.quaternion.copy(cctv.quaternion);add(g);E.camGrupo=g;E.huellas=[];",
);
rep("hm.userData.sinObst=true;add(hm);", "hm.userData.sinObst=true;add(hm);E.huellas.push(hm);");
rep("bl.renderOrder=3;g.userData.huella=hm}", "bl.renderOrder=3;E.huellas.push(bl);g.userData.huella=hm}");
// 2) montar: limpiar referencias
rep("E.tocado=false;E.cono=null;tamano();", "E.tocado=false;E.cono=null;E.camGrupo=null;E.huellas=[];tamano();");
// 3) tamano: en vista de cámara el recuadro ocupa todo y la cámara toma el aspecto del lienzo
rep(
  "pipRect={x:w-pw-m,y:m+Math.round(h*0.12),w:pw,h:ph};",
  'pipRect={x:w-pw-m,y:m+Math.round(h*0.12),w:pw,h:ph};if(M.vista==="cctv"){pipRect={x:0,y:0,w:w,h:h};pw=w;ph=h;cctv.aspect=w/h;cctv.updateProjectionMatrix()}else if(Math.abs(cctv.aspect-16/9)>1e-3){cctv.aspect=16/9;cctv.updateProjectionMatrix()}',
);
// 4) reloj externo: el video manda el segundo de la simulación
rep(
  "var dt=Math.min(0.05,reloj.getDelta());if(window.__PRUEBA||M._paso)dt=1/30;\n    E.t+=dt;if(E.t>=E.dur){if(M._paso){E.t=E.dur-1e-6}",
  "var dt=Math.min(0.05,reloj.getDelta());if(window.__PRUEBA||M._paso)dt=1/30;\n    if(M.tExt&&!M._paso){var tt=M.tExt();if(tt!=null&&isFinite(tt)){tt=Math.max(0,Math.min(E.dur-1e-3,tt));if(tt<E.t-0.12||tt>E.t+1.5){M.montar(E.raiz,actual);if(tt>0.02)M.saltar(tt);return}if(tt-E.t>0.06)M.saltar(tt-0.03);dt=Math.max(0,tt-E.t)}}\n    E.t+=dt;if(E.t>=E.dur){if(M._paso||M.tExt){E.t=E.dur-1e-6}",
);
// 5) render principal con la cámara CCTV en vista de cámara
rep(
  "R.setScissorTest(false);R.setViewport(0,0,w,h);R.clear();R.render(scene,camara);\n    if(E.pip&&!E.def.sinPip){",
  'var vc=M.vista==="cctv";if(E.camGrupo)E.camGrupo.visible=!vc;(E.huellas||[]).forEach(function(o){o.visible=!vc});\n    R.setScissorTest(false);R.setViewport(0,0,w,h);R.clear();R.render(scene,vc?cctv:camara);\n    if(vc){if(E.pip)dibujarPip(t)}else if(E.pip&&!E.def.sinPip){',
);
rep("proj.copy(p).project(camara);", "proj.copy(p).project(vc?cctv:camara);");
// 6) API de vista
rep(
  "M.fijar=function(raiz){M.fijo=raiz||null};",
  'M.fijar=function(raiz){M.fijo=raiz||null};\n  M.vista="maqueta";M.ponerVista=function(v){M.vista=v==="cctv"?"cctv":"maqueta";controles.enabled=M.vista!=="cctv";if(E.raiz)E.raiz.classList.toggle("vcctv",M.vista==="cctv");tamano()};',
);
fs.writeFileSync(f, s);
console.log("ok");
