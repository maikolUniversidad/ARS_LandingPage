const fs=require('fs'),vm=require('vm');
const dir=process.argv[2];
const win={MOTOR:{COL:{vigila:1,detecta:2,alerta:3,ok:4,oro:5,marino:6,staff:7,cliente:8}},matchMedia:()=>({matches:false}),location:{search:''},navigator:{}};
const ctx={window:win,document:{querySelector:()=>null,getElementById:()=>null},console};
ctx.self=ctx.window; vm.createContext(ctx);
for(const f of ['escenas.js','escenas2.js','evidencia-publica/evidencia-publica.js']){vm.runInContext(fs.readFileSync(dir+'/'+f,'utf8'),ctx,{filename:f});}
const ES=win.ESCENAS,GR=win.GRUPOS;
const out={grupos:GR,escenas:ES.map(s=>({id:s.id,grupo:s.grupo,nombre:s.nombre,corta:s.corta,desc:s.desc,estado:s.estado||null,dur:s.dur||16,sinPip:!!s.sinPip,fases:(s.fases||[]).map(f=>({t:f[0],estado:f[1],texto:f[2]})),video:s.video||null,camara:s.camara?s.camara.id||null:null}))};
fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));
console.log('grupos',GR.length,'escenas',ES.length,'con video',ES.filter(s=>s.video).length);
