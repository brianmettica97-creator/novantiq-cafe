
  /* ── muebles y barra (se dibujan ordenados por profundidad junto con la gente) ── */
  function workAt(st) { return [barista, barista2, game && game.b].find(b => b && b.work && b.workSt === st && !b.gone) || null; }
  function drawBackCounter(g) {
    // mueble
    const { yt } = box(g, 22, 14, 408, 34, 0, 20, '#EDE5D8', '#6B4630', 2);
    g.strokeStyle = 'rgba(160,145,130,.35)'; g.lineWidth = 0.6;
    for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(30 + i * 46, yt + 2); g.bezierCurveTo(50 + i * 46, yt + 12, 40 + i * 46, yt + 22, 62 + i * 46, yt + 30); g.stroke(); }
    g.strokeStyle = 'rgba(30,16,10,.45)'; g.lineWidth = 0.7;
    for (let x = 62; x < 348; x += 48) { g.beginPath(); g.moveTo(x, 30); g.lineTo(x, 46); g.stroke(); g.fillStyle = '#C9A27E'; g.fillRect(x - 5, 34, 2, 5); g.fillRect(x + 3, 34, 2, 5); }
    g.fillStyle = '#3A2419'; g.fillRect(22, 46, 408, 2);
    // heladera bajo mesada con puerta de vidrio
    const fr = workAt('fridge');
    g.fillStyle = '#C9CED2'; rrect(g, 350, 29, 78, 17, 1.5); g.fill(); outline(g, 0.6);
    if (fr && fr.workK < 0.92) {
      g.fillStyle = '#F3FAFF'; g.fillRect(353, 31, 72, 13);
      g.fillStyle = 'rgba(160,200,215,.5)'; rrect(g, 345, 30, 10, 18, 1); g.fill();
      if (R() < 0.3) puff(390 + rr(-20, 20), 36);
    } else { g.fillStyle = 'rgba(150,195,210,.55)'; g.fillRect(353, 31, 72, 13); }
    [[358, '#F8F4EA'], [366, '#F8F4EA'], [376, '#F39A2B'], [384, '#F39A2B'], [394, '#3D1A0A'], [402, '#3D1A0A'], [412, '#F8F4EA']].forEach(([x, c]) => { g.fillStyle = c; rrect(g, x - 2.6, 33, 5.2, 9, 1.4); g.fill(); });
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(356, 31, 8, 13);
    g.fillStyle = '#8E959B'; g.fillRect(420, 33, 1.6, 9);
    // plancha
    const gr = workAt('grill');
    box(g, 28, 22, 36, 18, 20, 5, '#3A3A3A', '#2A2A2A', 2);
    if (gr) { box(g, 28, 22, 36, 18, 25, 4, '#4A4A4A', '#333', 2); g.fillStyle = `rgba(255,140,40,${0.5 + 0.3 * Math.sin(clock * 9)})`; g.fillRect(30, 21 - 25 + 18, 32, 1.2); }
    else { g.fillStyle = '#444'; g.beginPath(); g.moveTo(28, -3); g.lineTo(64, -3); g.lineTo(62, -16); g.lineTo(30, -16); g.closePath(); g.fill(); outline(g, 0.6); g.strokeStyle = 'rgba(255,255,255,.15)'; for (let x = 33; x < 62; x += 4) { g.beginPath(); g.moveTo(x, -4); g.lineTo(x + 0.6, -15); g.stroke(); } }
    // máquina de espresso
    const acc = brand().accent;
    const mb = box(g, 104, 16, 102, 24, 20, 25, '#DADFE3', '#B9C0C6', 3);
    g.fillStyle = acc; g.fillRect(104, mb.yf, 102, 3);
    const metal = g.createLinearGradient(0, mb.yf + 3, 0, mb.yf + 25); metal.addColorStop(0, 'rgba(255,255,255,.35)'); metal.addColorStop(1, 'rgba(0,0,0,.08)'); g.fillStyle = metal; g.fillRect(104, mb.yf + 3, 102, 22);
    for (let i = 0; i < 6; i++) { const cx = 116 + i * 15; g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(cx, mb.yt + 9, 4.2, 3.2, 0, 0, 7); g.fill(); outline(g, 0.5); g.fillStyle = '#E8E2D8'; g.beginPath(); g.ellipse(cx, mb.yt + 8.4, 2.6, 1.8, 0, 0, 7); g.fill(); }
    [148, 162].forEach(x => { g.fillStyle = '#F7F7F2'; g.beginPath(); g.arc(x, mb.yf + 8, 2.8, 0, 7); g.fill(); outline(g, 0.5); g.strokeStyle = '#B3202E'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(x, mb.yf + 8); g.lineTo(x + 1.6, mb.yf + 6.6); g.stroke(); });
    g.fillStyle = '#3B3F44'; rrect(g, 112, mb.yf + 19, 86, 4, 1); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 0.5; for (let x = 115; x < 196; x += 3) { g.beginPath(); g.moveTo(x, mb.yf + 19.6); g.lineTo(x, mb.yf + 22.4); g.stroke(); }
    const mw = workAt('machine');
    [134, 176].forEach((x, i) => {
      g.fillStyle = '#5A6066'; g.beginPath(); g.ellipse(x, mb.yf + 13, 5.2, 2.6, 0, 0, 7); g.fill();
      g.strokeStyle = '#1E1D1A'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 2, mb.yf + 14); g.lineTo(x + 9, mb.yf + 19); g.stroke(); g.lineCap = 'butt';
      if (mw && (mw.work === 'brew' || mw.work === 'art' || mw.work === 'choco') && i === (mw === barista2 ? 1 : 0)) {
        g.fillStyle = '#FFFFFF'; rrect(g, x - 3.4, mb.yf + 16.5, 6.8, 5, 1.4); g.fill(); outline(g, 0.5);
        if (mw.work === 'brew') { g.strokeStyle = `rgba(92,52,22,${0.7 + 0.3 * Math.sin(clock * 30)})`; g.lineWidth = 0.7; [-1, 1].forEach(d => { g.beginPath(); g.moveTo(x + d, mb.yf + 14.6); g.lineTo(x + d * 0.6, mb.yf + 17.6); g.stroke(); }); }
      }
    });
    [110, 200].forEach(x => { g.strokeStyle = '#8E959B'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, mb.yf + 4); g.lineTo(x + (x < 150 ? -3 : 3), mb.yf + 17); g.stroke(); });
    const sw = workAt('wand');
    if (sw) { g.fillStyle = '#CDD2D6'; rrect(g, 101, mb.yf + 14, 9, 9, 2); g.fill(); outline(g, 0.6); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(102, mb.yf + 15, 2, 7); }
    // molino
    const gw = workAt('grinder'), jit = gw ? Math.sin(clock * 70) * 0.5 : 0;
    g.save(); g.translate(jit, 0);
    const gb = box(g, 216, 22, 30, 16, 20, 22, '#3A3A3A', '#2A2A2A', 3);
    g.fillStyle = 'rgba(205,160,110,.45)'; g.beginPath(); g.moveTo(219, gb.yt + 4); g.lineTo(243, gb.yt + 4); g.lineTo(247, gb.yt - 14); g.lineTo(215, gb.yt - 14); g.closePath(); g.fill(); outline(g, 0.6);
    g.fillStyle = '#5B3219'; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(219 + (i % 7) * 3.8, gb.yt - 2 - Math.floor(i / 7) * 4 - (i % 2), 1.6, 1.1, i, 0, 7); g.fill(); }
    g.fillStyle = '#1E1D1A'; rrect(g, 226, gb.yf + 6, 10, 9, 1.5); g.fill();
    g.fillStyle = gw ? '#E3A558' : '#7A7F84'; g.beginPath(); g.arc(231, gb.yf + 3, 1.4, 0, 7); g.fill();
    g.restore();
    // estación de filtrados
    const pw = workAt('v60');
    g.fillStyle = '#8A5733'; g.fillRect(258, 0, 2, 10); g.fillRect(286, 0, 2, 10); g.fillRect(256, -1, 34, 2.4);
    [264, 280].forEach(x => { g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(x - 6, -5); g.lineTo(x + 6, -5); g.lineTo(x + 2, 1); g.lineTo(x - 2, 1); g.closePath(); g.fill(); outline(g, 0.5); g.fillStyle = 'rgba(200,225,235,.6)'; rrect(g, x - 4, 3, 8, 7, 2); g.fill(); outline(g, 0.4); g.fillStyle = '#5B3219'; g.fillRect(x - 3, 7, 6, 2.6); });
    if (pw) { g.strokeStyle = 'rgba(200,225,240,.95)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(268, -14); g.quadraticCurveTo(266, -10, 264, -6); g.stroke(); }
    else { g.fillStyle = '#2A2A2A'; rrect(g, 293, -6, 7, 8, 2); g.fill(); g.strokeStyle = '#2A2A2A'; g.lineWidth = 1; g.beginPath(); g.moveTo(293, -4); g.quadraticCurveTo(288, -8, 287, -12); g.stroke(); }
    // bacha
    g.fillStyle = '#9EA4AA'; rrect(g, 302, 0, 38, 15, 3); g.fill(); g.fillStyle = '#7C838A'; rrect(g, 305, 2.5, 32, 10, 2.5); g.fill();
    g.strokeStyle = '#B9BEC3'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(321, 1); g.lineTo(321, -9); g.quadraticCurveTo(321, -12, 324, -12); g.lineTo(326, -9); g.stroke();
  }
  function drawFrontCounter(g) {
    const acc = brand().accent;
    const { yt, yf } = box(g, 22, 86, 372, 28, 0, 18, '#F2EBE1', '#7A4E31', 2);
    g.strokeStyle = 'rgba(160,145,130,.3)'; g.lineWidth = 0.6; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(30 + i * 48, yt + 3); g.bezierCurveTo(46 + i * 48, yt + 12, 38 + i * 48, yt + 18, 58 + i * 48, yt + 25); g.stroke(); }
    g.fillStyle = 'rgba(40,20,10,.25)'; for (let x = 30; x < 392; x += 9) g.fillRect(x, yf + 4, 1, 13);
    g.fillStyle = acc; g.fillRect(22, yf, 372, 2.4);
    g.fillStyle = '#F3E3C8'; g.font = '800 4.4px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RETIRO', 368, yf + 9);
    // caja y QR
    g.fillStyle = '#2B1A12'; rrect(g, 80, yt + 4, 26, 15, 2.5); g.fill(); g.fillStyle = '#F3EADB'; g.fillRect(82.5, yt + 6, 21, 10); g.fillStyle = acc; g.fillRect(82.5, yt + 6, 21, 2.2);
    g.fillStyle = '#FFFFFF'; rrect(g, 113, yt - 4, 14, 17, 2); g.fill(); outline(g, 0.6); qrMini(g, 114.6, yt - 2.4, 10.8);
    g.fillStyle = 'rgba(60,40,30,.5)'; g.fillRect(118, yt + 13, 4, 3);
    // vitrina
    drawVitrina(g, yt);
    // tablet de comandas
    const nNew = S.orders.filter(o => o.status === 'nuevo').length, nPrep = S.orders.filter(o => o.status === 'preparando').length, nOk = S.orders.filter(o => o.status === 'listo').length;
    g.fillStyle = '#1E1D1A'; rrect(g, 314, yt + 1, 24, 16, 2.5); g.fill(); g.fillStyle = '#FFFBF5'; g.fillRect(316, yt + 3, 20, 11.5);
    if (mode === 'sys') [[nNew, '#C2313B'], [nPrep, '#B4741A'], [nOk, '#4C7A36']].forEach(([n, c], i) => { g.fillStyle = c; for (let k = 0; k < Math.min(3, n); k++) g.fillRect(317 + i * 6.6, yt + 4 + k * 3.4, 5.4, 2.4); });
    else { g.fillStyle = '#B9B2A8'; g.font = '700 3.6px Figtree, system-ui, sans-serif'; g.fillText('apagada', 326, yt + 9); }
    // retiro: bandejas listas y campanita
    g.fillStyle = '#C9A27E'; rrect(g, 344, yt + 3, 44, 21, 2); g.fill();
    const ready = (mode === 'sys' ? S.orders.filter(o => o.status === 'listo' && !o.picked && o.where === 'mesa') : paper.filter(o => o.status === 'listo' && !o.picked)).slice(0, 2);
    ready.forEach((o, i) => { const x = 356 + i * 20, y = yt + 13; g.fillStyle = '#B9BEC3'; g.beginPath(); g.ellipse(x, y, 9, 7, 0, 0, 7); g.fill(); outline(g, 0.5); o.items.slice(0, 3).forEach((it, k) => drawItem(g, KIND[it.id] || 'cup', x + Math.cos(k * 2.1) * 4, y - 1 + Math.sin(k * 2.1) * 2.6, 0.7, ART[it.id])); });
    if (mode === 'nosys') { const n = paper.filter(o => o.dropped && o.status !== 'listo').length; g.fillStyle = '#8E959B'; g.fillRect(338, yt - 8, 1, 10); for (let i = 0; i < Math.min(5, n); i++) { g.fillStyle = '#FFFDF7'; g.save(); g.translate(338.5, yt - 6 + i * 1.6); g.rotate(-0.2 + i * 0.15); g.fillRect(-4, -3, 8, 6); g.restore(); } }
    g.fillStyle = '#D8A637'; g.beginPath(); g.ellipse(386, yt + 7, 3.6, 2.4, 0, Math.PI, 0); g.fill(); g.fillStyle = '#B0852A'; g.fillRect(382, yt + 7, 8, 1.4);
  }
  function drawVitrina(g, yt) {
    const open = workAt('vitrina');
    const x0 = 144, x1 = 306, top = yt - 15;
    g.fillStyle = '#FFFFFF'; g.fillRect(x0, yt + 3, x1 - x0, 22);
    const items = [['medialunas', 156], ['medialunas', 172], ['alfajor', 190], ['alfajor', 204], ['cookie', 222], ['cookie', 236], ['cake', 256], ['budin', 276], ['cake', 292]];
    items.forEach(([k, x], i) => { if (open && i === 1 && open.workK > 0.3) return; drawItem(g, k, x, yt + 12 + (i % 2) * 5, 0.78); });
    g.fillStyle = 'rgba(214,236,244,.28)'; g.fillRect(x0, top + 3, x1 - x0, 15); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 0.8; g.strokeRect(x0, top + 3, x1 - x0, 15);
    g.fillStyle = 'rgba(214,236,244,.22)'; g.fillRect(x0 + (open ? 22 : 0), top - 9, x1 - x0, 12); g.strokeRect(x0 + (open ? 22 : 0), top - 9, x1 - x0, 12);
    g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = 0.6; for (let x = x0 + 10; x < x1; x += 34) { g.beginPath(); g.moveTo(x, top + 4); g.lineTo(x + 6, top + 16); g.stroke(); }
    g.fillStyle = '#6B4630'; g.fillRect(x0 - 1, top - 10, 2, 28); g.fillRect(x1 - 1, top - 10, 2, 28);
  }
  function drawBus(g) {
    box(g, 20, 128, 22, 14, 0, 13, '#8A5733', '#6B4630', 1.5);
    g.fillStyle = '#9EA4AA'; rrect(g, 21, 110, 20, 9, 2); g.fill(); outline(g, 0.5);
    const n = Math.min(4, bus); for (let i = 0; i < n; i++) drawItem(g, 'cupd', 25 + (i % 2) * 8, 113 + Math.floor(i / 2) * 3, 0.6);
  }
  function drawLoungeBack(g) {
    box(g, 470, 18, 92, 12, 0, 26, '#8A5238', '#7C4A31', 4);
    box(g, 470, 30, 92, 22, 0, 11, '#9A5E40', '#7C4A31', 4);
    g.strokeStyle = 'rgba(40,20,10,.35)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(516, 19); g.lineTo(516, 41); g.stroke();
    box(g, 462, 22, 10, 30, 0, 18, '#8A5238', '#6E412B', 3); box(g, 560, 22, 10, 30, 0, 18, '#8A5238', '#6E412B', 3);
  }
  function drawSofaFront(g) {
    g.fillStyle = '#7C4A31'; rrect(g, 470, 41, 92, 11, 2); g.fill(); outline(g, 0.7);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(470, 49, 92, 3);
    g.fillStyle = '#6E412B'; rrect(g, 462, 34, 10, 18, 2); g.fill(); outline(g, 0.6); rrect(g, 560, 34, 10, 18, 2); g.fill(); outline(g, 0.6);
  }
  function drawLoungeTable(g) {
    floorShadow(g, 515, 88, 18, 8, 0.22);
    g.fillStyle = '#3A2419'; g.fillRect(513, 80, 4, 8);
    g.fillStyle = '#5A3A27'; g.beginPath(); g.ellipse(515, 78, 16, 11, 0, 0, 7); g.fill();
    g.fillStyle = '#6B4630'; g.beginPath(); g.ellipse(515, 76.6, 16, 11, 0, 0, 7); g.fill(); outline(g, 0.6);
  }
  function drawArmchair(g, s) {
    const left = s.a === 0;
    const x = s.x;
    floorShadow(g, x, s.y + 4, 15, 8, 0.25);
    box(g, x - 13, s.y - 11, 26, 24, 0, 10, '#D2A445', '#B5862F', 5);
    box(g, left ? x - 15 : x + 9, s.y - 12, 6, 26, 0, 22, '#C99A3E', '#A87D2A', 3);
    box(g, x - 13, s.y - 14, 26, 5, 0, 15, '#C99A3E', '#A87D2A', 2);
  }
  function drawChairBase(g, s) {
    if (s.arm || s.sofa) return;
    floorShadow(g, s.x + 1, s.y + 3, 11, 6, 0.24);
    const wood = '#87573A', dark = '#5E3B26';
    g.fillStyle = dark; [[-6.5, 5], [5, 5]].forEach(([dx, dy]) => g.fillRect(s.x + dx, s.y + dy - 9, 1.6, 9));
    if (s.a === Math.PI / 2) box(g, s.x - 8, s.y - 9, 16, 3, 11, 14, wood, dark, 1);
    box(g, s.x - 8, s.y - 7, 16, 14, 9, 2.6, wood, dark, 2);
    if (s.a === 0) box(g, s.x - 9.5, s.y - 7, 3, 14, 11, 13, wood, dark, 1);
    if (s.a === Math.PI) box(g, s.x + 6.5, s.y - 7, 3, 14, 11, 13, wood, dark, 1);
  }
  function drawChairFront(g, s) {
    if (s.a !== -Math.PI / 2 || s.arm || s.sofa) return;
    box(g, s.x - 8, s.y + 5, 16, 3, 11, 14, '#87573A', '#5E3B26', 1);
  }
  function drawTable(g, t) {
    if (t.k === 'lounge') { drawLoungeTable(g); drawTableItems(g, t, 515, 76.6, 10, 6); drawTableQR(g, t, 515 + 9, 72); return; }
    if (t.k === 'round') {
      floorShadow(g, t.x + 2, t.y + 4, 24, 12, 0.26);
      g.fillStyle = '#2E2A28'; g.beginPath(); g.ellipse(t.x, t.y + 1, 9, 4, 0, 0, 7); g.fill(); g.fillRect(t.x - 1.8, t.y - 14, 3.6, 15);
      g.fillStyle = '#C9BFB2'; g.beginPath(); g.ellipse(t.x, t.y - 13.4, 21, 16.5, 0, 0, 7); g.fill();
      const gr = g.createRadialGradient(t.x - 7, t.y - 22, 2, t.x, t.y - 15, 24); gr.addColorStop(0, '#FCFAF6'); gr.addColorStop(1, '#DDD3C6');
      g.fillStyle = gr; g.beginPath(); g.ellipse(t.x, t.y - 15.4, 21, 16.5, 0, 0, 7); g.fill(); outline(g, 0.6);
      g.strokeStyle = 'rgba(160,140,120,.35)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(t.x - 14, t.y - 20); g.bezierCurveTo(t.x - 4, t.y - 17, t.x + 2, t.y - 9, t.x + 13, t.y - 8); g.stroke();
      drawTableItems(g, t, t.x, t.y - 15.4, 11, 7.5); drawTableQR(g, t, t.qr.x, t.qr.y - 15);
    } else {
      floorShadow(g, t.x + 2, t.y + 6, 30, 14, 0.26);
      g.fillStyle = '#4E3222'; [[-21, 17], [18, 17]].forEach(([dx, dy]) => g.fillRect(t.x + dx, t.y + dy - 13, 3, 14));
      box(g, t.x - 24, t.y - 20, 48, 38, 13, 3, '#8D5C3B', '#6B4630', 3);
      g.strokeStyle = 'rgba(60,35,20,.22)'; g.lineWidth = 0.6; [-10, 1, 12].forEach(dy => { g.beginPath(); g.moveTo(t.x - 22, t.y + dy - 16); g.lineTo(t.x + 22, t.y + dy - 16); g.stroke(); });
      drawTableItems(g, t, t.x, t.y - 17, 13, 9); drawTableQR(g, t, t.qr.x, t.qr.y - 16);
    }
    if (t.group && t.group.laptop) drawLaptop(g, t);
  }
  function drawTableItems(g, t, cx, cy, rx, ry) {
    const its = t.group ? t.group.items : t.dirty ? t.dirty.items : [];
    its.forEach((it, i) => {
      const n = its.length, a = (i / Math.max(1, n)) * 6.283 + 0.7;
      const x = cx + Math.cos(a) * rx * (n > 1 ? 0.8 : 0.3), y = cy + Math.sin(a) * ry * (n > 1 ? 0.8 : 0.3);
      drawItem(g, t.dirty ? (DRINK_K.includes(it.k) ? 'cupd' : 'plated') : it.k, x, y, 1, it.art);
      if (t.group && !t.dirty && (it.k === 'cup' || it.k === 'glassmilk')) steam(g, x, y - 5, i);
    });
  }
  function drawTableQR(g, t, x, y) {
    g.save(); g.translate(x, y);
    g.fillStyle = 'rgba(40,22,12,.25)'; g.fillRect(-4, 4, 9, 2);
    g.fillStyle = '#FFFFFF'; rrect(g, -4.5, -6, 9, 10, 1.2); g.fill(); outline(g, 0.5); qrMini(g, -3.5, -5, 7);
    const scanning = t.group && t.group.members.some(m => m.scan);
    if (scanning) { const k = (clock * 2) % 1; g.strokeStyle = `rgba(227,165,88,${1 - k})`; g.lineWidth = 1; g.strokeRect(-5 - k * 6, -6.5 - k * 6, 10 + k * 12, 11 + k * 12); }
    g.restore();
    const bx = t.k === 'lounge' ? 452 : t.x - (t.k === 'round' ? 14 : 16), byy = t.k === 'lounge' ? 112 : t.y - (t.k === 'round' ? 27 : 30);
    g.fillStyle = 'rgba(43,26,18,.82)'; g.beginPath(); g.arc(bx, byy, 6.6, 0, 7); g.fill();
    g.fillStyle = '#F7ECDF'; g.font = '800 7.6px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(t.n), bx, byy + 0.4);
  }
  function drawLaptop(g, t) {
    const m = t.group.members[0]; if (!m || !m.seat) return;
    const dx = Math.cos(m.seat.a) * 13, dy = Math.sin(m.seat.a) * 9;
    const x = m.seat.x + dx * 1.3, y = m.seat.y - 17 + dy;
    g.fillStyle = '#B9BEC3'; rrect(g, x - 7, y - 2, 14, 8, 1.4); g.fill(); outline(g, 0.5);
    g.fillStyle = '#2A2E33'; rrect(g, x - 7, y - 11, 14, 9, 1.2); g.fill();
    g.fillStyle = '#7FB2C7'; g.fillRect(x - 5.6, y - 9.6, 11.2, 6.4);
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x, y - 6.5, 1.1, 0, 7); g.fill();
  }
  function drawPlant(g, x, y, r) {
    floorShadow(g, x + 2, y + 3, r * 1.1, r * 0.6, 0.25);
    const h = r * 1.15;
    g.fillStyle = '#A55A38'; g.beginPath(); g.moveTo(x - r * 0.62, y - h); g.lineTo(x + r * 0.62, y - h); g.lineTo(x + r * 0.48, y); g.lineTo(x - r * 0.48, y); g.closePath(); g.fill(); outline(g, 0.6);
    g.fillStyle = '#C06D45'; g.beginPath(); g.ellipse(x, y - h, r * 0.64, r * 0.24, 0, 0, 7); g.fill();
    const greens = ['#3F6B34', '#5A8A43', '#4C7A3A', '#6E9C50'];
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI / 2 + (i - 5) * 0.32 + Math.sin(clock * 0.8 + x + i) * 0.03, len = r * (1.1 + (i % 3) * 0.28);
      g.fillStyle = greens[i % 4]; g.save(); g.translate(x, y - h); g.rotate(a); g.beginPath(); g.ellipse(len * 0.5, 0, len * 0.55, r * 0.2, 0, 0, 7); g.fill(); g.restore();
    }
  }
  function drawCoatRack(g) {
    floorShadow(g, 238, 744, 8, 4, 0.25);
    g.fillStyle = '#3A2419'; g.fillRect(235, 704, 2.4, 40); g.beginPath(); g.ellipse(236, 744, 7, 2.6, 0, 0, 7); g.fill();
    g.strokeStyle = '#3A2419'; g.lineWidth = 1.4; [[-7, 706], [7, 708]].forEach(([dx, y]) => { g.beginPath(); g.moveTo(236, y + 2); g.lineTo(236 + dx, y - 2); g.stroke(); });
    g.fillStyle = '#2F5D73'; rrect(g, 238, 706, 8, 18, 3); g.fill(); outline(g, 0.5);
  }
  function drawSign(g) {
    floorShadow(g, 367, 732, 14, 5, 0.25);
    g.save(); g.translate(366, 730);
    g.fillStyle = '#6B4630'; g.beginPath(); g.moveTo(-12, 0); g.lineTo(-9, -26); g.lineTo(9, -26); g.lineTo(12, 0); g.lineTo(10, 0); g.lineTo(7.6, -23.5); g.lineTo(-7.6, -23.5); g.lineTo(-10, 0); g.closePath(); g.fill();
    g.fillStyle = '#2E3230'; g.beginPath(); g.moveTo(-9.6, -2); g.lineTo(-7.6, -23.5); g.lineTo(7.6, -23.5); g.lineTo(9.6, -2); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '700 3.6px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText('PEDÍ', 0, -19); g.fillText('CON EL QR', 0, -15);
    g.fillStyle = '#fff'; g.fillRect(-3.6, -13, 7.2, 7.2); qrMini(g, -3.2, -12.6, 6.4, '#2E3230', '#fff');
    g.restore();
  }
  function drawBooks(g) {
    g.fillStyle = '#5A3A27'; g.fillRect(578, 430, 10, 170);
    let by = 432; let s3 = 11; const r3 = () => { s3 = (s3 * 16807) % 2147483647; return s3 / 2147483647; };
    const bc = ['#C2313B', '#2F5D73', '#E3A558', '#5E7D4E', '#EDE6DA', '#8A3B5C', '#B4741A'];
    while (by < 596) { const h = 6 + r3() * 6; g.fillStyle = bc[Math.floor(r3() * bc.length)]; g.fillRect(579, by, 8, h - 1); by += h; }
  }
