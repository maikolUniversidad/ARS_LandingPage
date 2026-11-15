/* Vigias IA — coreografia por scroll de Argos y la Reina Roja (sin dependencias).
   Cada escena fija tiene N pasos; el paso sale del avance del scroll. aplicar(paso) es idempotente (sirve hacia
   adelante y hacia atras) y las animaciones con tiempo se cancelan al cambiar de paso. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const yr = $("#anio"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- maquetas de tamano fijo escaladas al ancho del marco */
  // en telefono la maqueta se ve mas grande (760 px de ancho util) y se desplaza al sector de cada paso
  const MOVIL = () => innerWidth <= 700;
  const enfocar = (q, zona) => { q.dataset.zona = zona;
    if (!MOVIL()) { q.style.setProperty("--fx", "0px"); return; }
    const s = parseFloat(q.style.getPropertyValue("--s")) || .5, sobra = (1200 - 760) * s;
    q.style.setProperty("--fx", (-(zona === "der" ? sobra : zona === "centro" ? sobra / 2 : 0)).toFixed(1) + "px"); };
  const ajustar = () => $$(".marco").forEach(m => {
    const q = $(".maqueta", m);
    if (MOVIL()) { const s = m.clientWidth / 760; q.style.setProperty("--s", s.toFixed(4)); m.style.height = (760 * s).toFixed(0) + "px"; }
    else { m.style.height = ""; const s = Math.min(m.clientWidth / 1200, m.clientHeight / 760 || 9); q.style.setProperty("--s", s.toFixed(4)); }
    enfocar(q, q.dataset.zona || "centro");
  });
  addEventListener("resize", ajustar); ajustar();

  /* ---------- aparicion de bloques y contadores */
  const cuenta = el => {
    const fin = parseFloat(el.dataset.cuenta), dec = +(el.dataset.dec || 0), suf = el.dataset.suf || "";
    if (quieto) { el.textContent = fin.toFixed(dec).replace(".", ",") + suf; return; }
    const t0 = performance.now(), d = 1400;
    const f = t => { const u = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - u, 4);
      el.textContent = (fin * e).toFixed(dec).replace(".", ",") + suf; if (u < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visto"); $$("[data-cuenta]", e.target).forEach(cuenta);
    $$("video[data-src]", e.target).forEach(v => { v.src = v.dataset.src; v.removeAttribute("data-src"); v.play().catch(() => {}); });
    io.unobserve(e.target);
  }), { threshold: .25 });
  $$(".revela, .pieza").forEach(el => io.observe(el));

  /* zona de color del fondo (naranja Argos / vino Reina Roja) */
  const zonas = $$("[data-zona], [data-escena]");
  const io2 = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.body.dataset.zona = e.target.dataset.zona || e.target.dataset.escena;
  }), { rootMargin: "-45% 0px -45% 0px" });
  zonas.forEach(z => io2.observe(z));

  /* triaje que cicla */
  $$("[data-cicla]").forEach(c => { const s = $$("span", c); let i = 0;
    setInterval(() => { s.forEach(x => x.classList.remove("on")); s[i = (i + 1) % s.length].classList.add("on"); }, 1600); });

  /* creditos de las fotos de ejemplo */
  fetch("fotos/creditos.json").then(r => r.json()).then(cs => {
    const ul = $("#creditos"); if (!ul) return;
    ul.innerHTML = cs.map(c => `<li>${c.titulo.replace(/\.(jpe?g)$/i, "")} — ${c.autor || "autor en la fuente"} · ${c.licencia} · <a href="${c.pagina}" rel="noopener">fuente</a></li>`).join("");
  }).catch(() => {});

  /* ---------- utilidades de tiempo cancelables por escena */
  const reloj = () => { let ts = []; return { en: (ms, f) => ts.push(setTimeout(f, ms)), limpiar: () => { ts.forEach(clearTimeout); ts = []; } }; };
  const escribir = (el, texto, ms, R, fin) => {
    el.classList.add("escrito"); let i = 0; el.innerHTML = '<span class="cursor"></span>';
    const paso = () => { i++; el.innerHTML = texto.slice(0, i).replace(/</g, "&lt;") + '<span class="cursor"></span>';
      if (i < texto.length) R.en(ms, paso); else if (fin) fin(); };
    R.en(ms, paso);
  };
  const palabras = (el, R, ms = 45) => {
    if (!el.dataset.armado) { el.innerHTML = el.dataset.texto.split(" ").map(w => `<span>${w}</span>`).join(" "); el.dataset.armado = 1; }
    $$("span", el).forEach((s, k) => R.en(k * ms, () => s.classList.add("v")));
  };
  const palabrasYa = el => { if (!el.dataset.armado) { el.innerHTML = el.dataset.texto.split(" ").map(w => `<span class="v">${w}</span>`).join(" "); el.dataset.armado = 1; } else $$("span", el).forEach(s => s.classList.add("v")); };
  const palabrasNo = el => $$("span", el).forEach(s => s.classList.remove("v"));

  /* ================================================================ ARGOS */
  const au = $("#au"), chat = $("#au-chat"), txt = $("#au-txt"), env = $("#au-env"), r1 = $("#resp1"), r2 = $("#resp2");
  const RA = reloj(); const PREG = "¿Quien tenia chaqueta naranja?";
  const filtro = k => $$(".filtros span", au).forEach(s => s.classList.toggle("on", s.dataset.f === k));
  function argos(paso, prev) {
    RA.limpiar(); enfocar(au, paso <= 1 ? "centro" : paso === 2 ? "izq" : "der");
    au.classList.toggle("con-chat", paso >= 2); au.classList.toggle("panel", paso >= 3);
    au.classList.toggle("filtra", paso >= 4); au.classList.toggle("elige", paso >= 4); au.classList.toggle("recorre", paso >= 5);
    au.classList.remove("pensando");
    chat.classList.toggle("u1", paso >= 2); chat.classList.toggle("r1", paso >= 2);
    chat.classList.toggle("u2", paso >= 5); chat.classList.toggle("r2", paso >= 5);
    filtro(paso >= 4 ? "alto" : "todos");
    // campo de pregunta
    if (paso === 0) { txt.classList.remove("escrito"); txt.textContent = "Pregunte a Argos…"; env.classList.remove("listo"); }
    else if (paso === 1) {
      env.classList.remove("listo");
      if (quieto) { txt.classList.add("escrito"); txt.textContent = PREG; env.classList.add("listo"); }
      else escribir(txt, PREG, 55, RA, () => env.classList.add("listo"));
    } else { txt.classList.remove("escrito"); txt.textContent = "Pregunte a Argos…"; env.classList.remove("listo"); }
    // respuesta 1: piensa y luego escribe
    const t1 = $(".texto", r1), t2 = $(".texto", r2);
    if (paso === 2 && prev < 2 && !quieto) {
      r1.classList.remove("listo"); palabrasNo(t1); au.classList.add("pensando");
      RA.en(1300, () => { au.classList.remove("pensando"); r1.classList.add("listo"); palabras(t1, RA); });
    } else if (paso >= 2) { r1.classList.add("listo"); palabrasYa(t1); }
    else { r1.classList.remove("listo"); palabrasNo(t1); }
    if (paso === 5 && prev < 5 && !quieto) {
      r2.classList.remove("listo"); palabrasNo(t2); au.classList.add("pensando");
      RA.en(1100, () => { au.classList.remove("pensando"); r2.classList.add("listo"); palabras(t2, RA); });
    } else if (paso >= 5) { r2.classList.add("listo"); palabrasYa(t2); }
    else { r2.classList.remove("listo"); palabrasNo(t2); }
    // filtro en dos tiempos: primero se ve "Todos", luego cambia a "Parecido alto"
    if (paso === 4 && prev < 4 && !quieto) { filtro("todos"); au.classList.remove("filtra", "elige");
      RA.en(650, () => { filtro("alto"); au.classList.add("filtra"); }); RA.en(1700, () => au.classList.add("elige")); }
  }

  /* ================================================================ REINA ROJA */
  const rq = $("#rq"), lista = $("#rq-lista"), marca = $("#rq-marca"), puntero = $("#rq-puntero"), ficha = $("#rq-ficha"), fichaA = $("#rq-ficha-a"),
        lupa = $("#rq-lupa"), seg = $("#rq-seg"), segCam = $("#rq-seg-cam"), mem = $("#rq-mem"), voz = $("#rq-voz"), camLbl = $("#rq-cam");
  const RR = reloj(); let SEG = null, siguiendo = false, enEscena = false; const OBJ = "p2";   // persona de camiseta verde
  const tiles = $$(".tile", rq), vids = tiles.map(t => $("video", t)), principales = tiles.filter(t => t.dataset.cam);
  vids.forEach(v => { const d = +(v.dataset.desfase || 0); if (d) v.addEventListener("loadedmetadata", () => { try { v.currentTime = d; } catch (e) {} }, { once: true }); });
  fetch("camaras/seguir.json").then(r => r.json()).then(j => { SEG = j; }).catch(() => {});
  const decir = (texto, sub, alerta) => {
    const li = document.createElement("li"); if (alerta) li.className = "alerta";
    li.innerHTML = `${texto}${sub ? `<small>${sub}</small>` : ""}`; lista.prepend(li);
    requestAnimationFrame(() => requestAnimationFrame(() => li.classList.add("v")));
    while (lista.children.length > 5) lista.lastChild.remove();
  };
  const NARRA0 = [["Cam 2 · Pasillo central: 3 personas, ritmo normal.", "hace 4 s"], ["Cam 1 · Entrada: entra una persona con camiseta verde.", "hace 9 s"],
                  ["Cam 5 · Bodega: sin movimiento desde las 13:40.", "hace 1 min"]];
  // caja de una persona en una camara en el tiempo t (s), en fracciones del cuadro
  const caja = (cam, pid, t) => {
    if (!SEG || !SEG.cams[cam] || !SEG.cams[cam][pid]) return null;
    const L = SEG.cams[cam][pid], f = t * SEG.fps; let a = 0, b = L.length - 1;
    while (a < b) { const m = (a + b) >> 1; if (L[m][0] < f) a = m + 1; else b = m; }
    const k = L[a]; return Math.abs(k[0] - f) <= 3 ? k.slice(1) : null;
  };
  const dibujar = () => {
    if (!enEscena) return;
    principales.forEach(tile => {
      const cv = $("canvas", tile), v = $("video", tile), w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w * 2) { cv.width = w * 2; cv.height = h * 2; }
      const g = cv.getContext("2d"); g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, w, h);
      if (!SEG || !v.duration) return;
      for (const pid of ["p1", "p2", "p3"]) {
        const c = caja(tile.dataset.cam, pid, v.currentTime); if (!c) continue;
        const x = c[0] * w, y = c[1] * h, bw = (c[2] - c[0]) * w, bh = (c[3] - c[1]) * h, L = Math.min(14, bw * .3);
        const sel = siguiendo && pid === OBJ;
        g.strokeStyle = sel ? "#e0566c" : "rgba(232,237,242,.75)"; g.lineWidth = sel ? 3 : 1.5;
        g.beginPath();   // esquinas (estilo cinematico compacto)
        [[x, y, 1, 1], [x + bw, y, -1, 1], [x, y + bh, 1, -1], [x + bw, y + bh, -1, -1]].forEach(([px, py, sx, sy]) => {
          g.moveTo(px, py + sy * L); g.lineTo(px, py); g.lineTo(px + sx * L, py); });
        g.stroke();
        const et = sel ? "P7 · siguiendo" : "persona"; g.font = `600 ${sel ? 12 : 11}px Inter, system-ui`;
        const tw = g.measureText(et).width + 12;
        g.fillStyle = sel ? "rgba(185,61,80,.92)" : "rgba(5,8,11,.6)"; g.fillRect(x, y - 19, tw, 17);
        g.fillStyle = "#fff"; g.fillText(et, x + 6, y - 6);
      }
    });
    if (siguiendo && SEG) {   // camara donde mas se ve a P1
      let mejor = null, area = 0;
      principales.forEach(t => { const c = caja(t.dataset.cam, OBJ, $("video", t).currentTime);
        if (c) { const a = (c[2] - c[0]) * (c[3] - c[1]); if (a > area) { area = a; mejor = t; } } });
      if (mejor) { const nom = $(".rot", mejor).textContent.trim(); if (segCam.dataset.cam !== nom) {
        if (segCam.dataset.cam) decir(`P7 paso a ${nom}.`, "seguimiento por apariencia", true);
        segCam.dataset.cam = nom; segCam.textContent = "· " + nom; } }
    }
    requestAnimationFrame(dibujar);
  };
  const vPrin = principales.map(t => $("video", t));
  const sincronizar = () => { const v0 = vPrin[0]; if (!v0 || !v0.duration) return;
    vPrin.slice(1).forEach(v => { if (v.duration && Math.abs(v.currentTime - v0.currentTime) > .12) v.currentTime = v0.currentTime; }); };
  setInterval(() => { if (enEscena && !rq.classList.contains("zoom")) sincronizar(); }, 400);
  // rectangulo de P1 en la camara del foco, en pixeles de la maqueta
  const rectFoco = t => { const c = caja("cam2", OBJ, t) || [.42, .3, .52, .78];
    return { x: 4 + c[0] * 1192, y: 41 + c[1] * 677, w: (c[2] - c[0]) * 1192, h: (c[3] - c[1]) * 677 }; };
  const T_FOCO = () => (SEG && SEG.t_foco) || 6.0;
  const pon = (el, r) => Object.assign(el.style, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });

  function reina(paso, prev) {
    RR.limpiar(); enfocar(rq, "centro");
    rq.classList.toggle("zoom", paso >= 1 && paso <= 3);
    [marca, puntero, ficha, lupa, seg, mem, voz].forEach(e => e.classList.remove("v", "mejora", "r"));
    siguiendo = paso === 4;
    const foco = $('[data-cam="cam2"] video', rq);
    camLbl.textContent = paso >= 1 && paso <= 3 ? "· Cam 2 · Pasillo central" : "· todas las camaras";
    if (paso === 0) { vids.forEach(v => v.play().catch(() => {}));
      if (prev !== 0) { lista.innerHTML = ""; NARRA0.forEach(([a, b], k) => RR.en(300 + k * 900, () => decir(a, b))); } }
    if (paso === 1) { foco.play().catch(() => {}); if (prev < 1) RR.en(500, () => decir("Persona de camiseta verde camina hacia la gondola de aseo.", "Cam 2 · ahora")); }
    if (paso === 2 || paso === 3) {
      foco.pause(); try { foco.currentTime = T_FOCO(); } catch (e) {}
      const r = rectFoco(T_FOCO());
      if (paso === 2) {
        puntero.classList.add("v"); pon(puntero, { x: r.x - 10, y: r.y - 10, w: 22, h: 22 });
        marca.style.transition = "none"; pon(marca, { x: r.x, y: r.y, w: 4, h: 4 }); void marca.offsetWidth; marca.style.transition = "";
        RR.en(quieto ? 0 : 350, () => { marca.classList.add("v"); pon(marca, r); pon(puntero, { x: r.x + r.w - 6, y: r.y + r.h - 6, w: 22, h: 22 }); });
        RR.en(quieto ? 0 : 1500, () => { puntero.classList.remove("v");
          const fx = r.x + r.w + 330 > 1190 ? r.x - 320 : r.x + r.w + 18; Object.assign(ficha.style, { left: fx + "px", top: Math.max(70, r.y) + "px" });
          ficha.classList.add("v"); fichaA.innerHTML = "";
          const t = "Una persona de camiseta verde y pantalon oscuro, de pie frente a la gondola de aseo. No lleva productos en las manos.";
          fichaA.innerHTML = t.split(" ").map(w => `<span>${w}</span>`).join(" ");
          $$("span", fichaA).forEach((s, k) => RR.en(quieto ? 0 : 200 + k * 55, () => s.classList.add("v"))); });
      } else {
        marca.classList.add("v"); pon(marca, r);
        lupa.style.transition = "none"; pon(lupa, r); void lupa.offsetWidth; lupa.style.transition = "";
        lupa.classList.add("v");
        RR.en(60, () => pon(lupa, { x: 300, y: 80, w: 600, h: 600 }));
        RR.en(quieto ? 0 : 1000, () => lupa.classList.add("mejora"));
        if (prev < 3) RR.en(900, () => decir("Detalle ampliado de la zona marcada.", "Cam 2 · mejora de imagen"));
      }
    }
    if (paso === 4) {
      vids.forEach(v => { try { v.currentTime = 0; } catch (e) {} v.play().catch(() => {}); });
      segCam.dataset.cam = ""; seg.classList.add("v");
      RR.en(400, () => mem.classList.add("v"));
      $$(".tira i", mem).forEach((i, k) => { i.classList.remove("v"); RR.en(quieto ? 0 : 900 + k * 1300, () => i.classList.add("v")); });
      if (prev < 4) decir("Siguiendo a P7: camiseta verde, pantalon oscuro, cabello corto.", "la reconoce por apariencia en todas las camaras", true);
    }
    if (paso === 5) { vids.forEach(v => v.play().catch(() => {})); voz.classList.add("v"); RR.en(quieto ? 0 : 1500, () => voz.classList.add("r"));
      if (prev < 5) RR.en(1700, () => decir("Cam 4 · salud en silencio hasta que cambie algo.", "orden de voz · usted")); }
  }
  // fotos de memoria (recortes de P1 sacados de las camaras)
  $$(".tira i", mem).forEach((i, k) => { i.style.backgroundImage = `url(camaras/mem${k + 1}.jpg)`; });

  /* ================================================================ motor de escenas */
  const escenas = $$("[data-escena]").map(s => ({ el: s, n: +s.dataset.pasos, paso: -1, f: s.dataset.escena === "argos" ? argos : reina,
    leyendas: $$(".leyenda", s), barras: $$(".progreso i", s) }));
  const tic = () => {
    for (const e of escenas) {
      const r = e.el.getBoundingClientRect(), total = Math.max(1, e.el.offsetHeight - innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / total)); e.el.style.setProperty("--p", p.toFixed(3));
      const visible = r.bottom > 0 && r.top < innerHeight;
      if (visible) e.el.classList.add("vista");
      if (e.el.dataset.escena === "reina") { const antes = enEscena; enEscena = visible;
        if (visible && !antes) requestAnimationFrame(dibujar); if (!visible && antes) vids.forEach(v => v.pause()); }
      const paso = Math.min(e.n - 1, Math.floor(p * e.n * 0.999));
      if (paso !== e.paso && visible) { const prev = e.paso; e.paso = paso;
        e.leyendas.forEach((l, k) => l.classList.toggle("activa", k === paso));
        e.barras.forEach((b, k) => b.classList.toggle("si", k <= paso));
        e.f(paso, prev); }
    }
  };
  let pend = false; addEventListener("scroll", () => { if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; tic(); }); } }, { passive: true });
  addEventListener("resize", tic); tic();
  if (quieto) escenas.forEach(e => { e.leyendas.forEach(l => l.classList.add("activa")); e.f(e.n - 1, -1); });
})();
