
  /* ── dibujo: utilidades ── */
  const shade = (hex, f) => { const v = parseInt(hex.slice(1), 16); const c = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map(x => Math.max(0, Math.min(255, Math.round(x * f)))); return `rgb(${c[0]},${c[1]},${c[2]})`; };
  const mixHex = (a, b, k) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
  function rrect(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  const INK = '#3A2419';
  function outline(g, w) { g.strokeStyle = 'rgba(46,26,16,.55)'; g.lineWidth = w || 0.8; g.stroke(); }
  /* caja oblicua: base en el piso (x,y,w,d), elevada h0, con altura h */
  function box(g, x, y, w, d, h0, h, top, front, r) {
    const yt = y - h0 - h, yf = y + d - h0 - h;
    g.fillStyle = front; rrect(g, x, yf, w, h, Math.min(r || 0, 2)); g.fill(); outline(g, 0.7);
    g.fillStyle = top; rrect(g, x, yt, w, d, r || 0); g.fill(); outline(g, 0.7);
    return { yt, yf };
  }
  function floorShadow(g, x, y, rx, ry, a) {
    const gr = g.createRadialGradient(x, y, 0, x, y, rx);
    gr.addColorStop(0, `rgba(40,22,12,${a || 0.28})`); gr.addColorStop(1, 'rgba(40,22,12,0)');
    g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rx, 0, 7); g.fill(); g.restore();
  }
  function qrMini(g, x, y, s, fg, bg) {
    const n = 7, c = s / n;
    g.fillStyle = bg || '#FFFFFF'; g.fillRect(x, y, s, s);
    g.fillStyle = fg || '#2B1A12';
    [[0, 0], [1, 0], [0, 1], [1, 1], [5, 0], [6, 0], [5, 1], [6, 1], [0, 5], [1, 5], [0, 6], [1, 6], [3, 1], [3, 3], [4, 4], [2, 4], [4, 2], [6, 4], [5, 6], [3, 5], [4, 6], [6, 3]].forEach(([a, b]) => g.fillRect(x + a * c, y + b * c, c * 0.92, c * 0.92));
  }

  /* ── luz según la hora ── */
  function hourNow() { if (day) return day.t / 3600; const d = new Date(); const h = d.getHours() + d.getMinutes() / 60; return h < 7 || h > 20.2 ? 19.6 : clamp(h, 8, 20.2); }
  function light() {
    const h = hourNow();
    const golden = clamp(1 - Math.abs(h - 18) / 1.6, 0, 1);
    const dusk = clamp((h - 19.1) / 1.2, 0, 1);
    const morning = clamp(1 - (h - 8) / 2.2, 0, 1);
    return { h, golden, dusk, morning, lamps: clamp(0.35 + dusk * 0.65 + golden * 0.2, 0, 1), sun: clamp(1 - dusk * 0.9, 0, 1) };
  }

  /* ── capa fija: piso, alfombras, pared del fondo ── */
  let floorCv = null, floorSig = '';
  function buildFloor() {
    const Rz = clamp(dpr * base * 1.9, 1, 2.6);
    floorCv = document.createElement('canvas');
    floorCv.width = Math.round(VW * Rz); floorCv.height = Math.round(VH * Rz);
    const g = floorCv.getContext('2d');
    g.setTransform(Rz, 0, 0, Rz, 0, -TOP * Rz);
    let s2 = 7; const r2 = () => { s2 = (s2 * 16807) % 2147483647; return s2 / 2147483647; };
    // piso de madera
    g.fillStyle = '#A97C52'; g.fillRect(0, 0, WW, WH);
    const ph = 15;
    for (let y = 14; y < WH; y += ph) {
      let x = -r2() * 120;
      while (x < WW) {
        const len = 80 + r2() * 90, l = 0.94 + r2() * 0.09;
        g.fillStyle = shade('#C99C6E', l); g.fillRect(x, y, len - 0.9, ph - 0.9);
        g.strokeStyle = 'rgba(120,78,44,.12)'; g.lineWidth = 0.6;
        for (let k = 0; k < 2; k++) { const gy = y + 3 + r2() * (ph - 7); g.beginPath(); g.moveTo(x + 3, gy); g.bezierCurveTo(x + len * 0.35, gy + r2() * 2 - 1, x + len * 0.65, gy + r2() * 2 - 1, x + len - 5, gy + r2() - 0.5); g.stroke(); }
        if (r2() < 0.25) { g.fillStyle = 'rgba(110,70,40,.16)'; g.beginPath(); g.ellipse(x + len * r2(), y + ph / 2, 2.2, 1.4, 0, 0, 7); g.fill(); }
        x += len;
      }
    }
    // zona de la barra: piso de baldosas calcáreas
    for (let x = 22; x < 430; x += 12) for (let y = 48; y < 86; y += 12) {
      g.fillStyle = ((x + y) / 12) % 2 < 1 ? '#E9DFCF' : '#D8CBB6'; g.fillRect(x, y, 12, 12);
      g.strokeStyle = 'rgba(139,108,72,.35)'; g.lineWidth = 0.5; g.beginPath(); g.arc(x + 6, y + 6, 3.2, 0, 7); g.stroke();
    }
    // alfombras
    const rug = (x, y, w, h, base0, line) => { floorShadow(g, x + w / 2, y + h / 2 + 2, w * 0.6, h * 0.6, 0.12); g.fillStyle = base0; rrect(g, x, y, w, h, 6); g.fill(); g.strokeStyle = line; g.lineWidth = 1.6; rrect(g, x + 5, y + 5, w - 10, h - 10, 4); g.stroke(); g.lineWidth = 0.6; for (let yy = y + 10; yy < y + h - 8; yy += 6) { g.beginPath(); g.moveTo(x + 9, yy); g.lineTo(x + w - 9, yy); g.stroke(); } };
    g.fillStyle = '#B85F3F'; rrect(g, 446, 54, 136, 76, 8); g.fill();
    g.strokeStyle = '#F1E2C8'; g.lineWidth = 2; rrect(g, 452, 60, 124, 64, 6); g.stroke();
    g.strokeStyle = 'rgba(241,226,200,.45)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(458 + i * 20, 66); g.lineTo(458 + i * 20, 118); g.stroke(); }
    rug(56, 322, 214, 100, '#D8C29C', 'rgba(140,105,60,.45)');
    rug(372, 494, 140, 106, '#C7B08A', 'rgba(120,90,50,.45)');
    // felpudo con el nombre del café
    g.fillStyle = '#5A3A27'; rrect(g, 258, 738, 84, 26, 4); g.fill(); g.strokeStyle = '#A9784B'; g.lineWidth = 1; rrect(g, 261, 741, 78, 20, 3); g.stroke();
    g.fillStyle = '#E8CFA6'; g.font = `400 9px ${brand().font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const nm = (S.cafe.name || 'Café').toUpperCase(); g.fillText(nm.length > 14 ? nm.slice(0, 13) + '…' : nm, 300, 751.5);
    // paredes laterales y frente (en corte)
    g.fillStyle = '#3A2419';
    g.fillRect(0, TOP, 14, WH - TOP); g.fillRect(WW - 14, TOP, 14, WH - TOP); g.fillRect(0, WH - 14, 268, 14); g.fillRect(332, WH - 14, 268, 14);
    const glass = (x, y, w, h) => { g.fillStyle = '#A8CCD6'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + (w > h ? w * 0.15 : 1), y + (w > h ? 1 : h * 0.15), w > h ? w * 0.18 : w - 2, w > h ? h - 2 : h * 0.18); g.strokeStyle = '#2B1A12'; g.lineWidth = 1.4; g.strokeRect(x, y, w, h); };
    [[150, 260], [320, 430], [480, 600]].forEach(([y0, y1]) => glass(3, y0, 8, y1 - y0));
    [[40, 230], [370, 560]].forEach(([x0, x1]) => glass(x0, WH - 11, x1 - x0, 8));
    const sh = (x, y, w, h, dir) => { const gr = dir === 'v' ? g.createLinearGradient(x, 0, x + w, 0) : g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(40,22,12,.26)'); gr.addColorStop(1, 'rgba(40,22,12,0)'); g.fillStyle = gr; g.fillRect(x, y, w, h); };
    sh(14, 14, 10, WH - 28, 'v'); sh(14, 14, WW - 28, 10, 'h');
    // pared del fondo, vista de frente
    const wall = g.createLinearGradient(0, TOP, 0, 14); wall.addColorStop(0, '#E4D2B6'); wall.addColorStop(1, '#D7C2A2');
    g.fillStyle = wall; g.fillRect(14, TOP, WW - 28, 14 - TOP);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(120,90,60,${0.03 + r2() * 0.05})`; g.fillRect(14 + r2() * (WW - 28), TOP + r2() * (14 - TOP), 1 + r2() * 2, 1 + r2() * 2); }
    g.fillStyle = '#5A3A27'; g.fillRect(14, -2, WW - 28, 16); // zócalo de madera
    g.strokeStyle = 'rgba(30,16,10,.4)'; g.lineWidth = 0.6; for (let x = 20; x < WW - 14; x += 14) { g.beginPath(); g.moveTo(x, -1); g.lineTo(x, 13); g.stroke(); }
    g.fillStyle = 'rgba(40,22,12,.35)'; g.fillRect(14, 12, WW - 28, 3);
    // cartel con el nombre del café sobre la máquina
    const b = brand();
    g.save(); g.shadowColor = 'rgba(40,22,12,.35)'; g.shadowBlur = 4 * Rz; g.shadowOffsetY = 2 * Rz;
    g.fillStyle = '#2B1A12'; rrect(g, 40, -62, 190, 26, 4); g.fill(); g.restore();
    g.strokeStyle = '#8A5733'; g.lineWidth = 1.2; rrect(g, 43, -59, 184, 20, 3); g.stroke();
    g.fillStyle = '#F3E3C8'; g.font = `${b.fw || 400} 14px ${b.font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = 14; while (g.measureText(S.cafe.name).width > 168 && fs > 7) { fs -= 1; g.font = `${b.fw || 400} ${fs}px ${b.font}`; }
    g.fillText(S.cafe.name, 135, -49);
    g.fillStyle = b.accent; g.beginPath(); g.arc(52, -49, 2.4, 0, 7); g.fill(); g.beginPath(); g.arc(218, -49, 2.4, 0, 7); g.fill();
    // repisa con frascos y bolsas de café
    g.fillStyle = '#6B4630'; g.fillRect(36, -28, 60, 3);
    [[42, '#C9A27E'], [54, '#B3202E'], [66, '#2F5D73'], [78, '#C9A27E'], [88, '#5E7D4E']].forEach(([x, c], i) => { g.fillStyle = c; rrect(g, x - 4, -40 + (i % 2), 8, 12 - (i % 2), 1.5); g.fill(); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x - 2.5, -36, 5, 3); });
    // pizarra con la carta
    g.fillStyle = '#6B4630'; rrect(g, 452, -60, 64, 40, 3); g.fill(); g.fillStyle = '#2E3230'; rrect(g, 455, -57, 58, 34, 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 0.9; g.font = '700 6px Figtree, system-ui, sans-serif'; g.fillStyle = 'rgba(255,255,255,.88)'; g.textAlign = 'left';
    g.fillText('CARTA', 460, -50);
    [[-42, 'Flat white'], [-35, 'Cortado'], [-28, 'Medialunas']].forEach(([y, t]) => { g.font = '500 4.6px Figtree, system-ui, sans-serif'; g.fillText(t, 460, y); g.fillRect(492, y - 0.3, 14, 0.6); });
    g.fillStyle = '#fff'; g.fillRect(498, -55, 11, 11); qrMini(g, 498.6, -54.4, 9.8, '#2E3230', '#fff');
    // cuadros
    [[530, -56, '#9FB7C9'], [556, -50, '#E3A558']].forEach(([x, y, c]) => { g.fillStyle = '#6B4630'; g.fillRect(x, y, 20, 24); g.fillStyle = c; g.fillRect(x + 3, y + 3, 14, 18); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x + 10, y + 12, 4, 0, 7); g.fill(); });
    // aplique de luz y reloj (las agujas se dibujan aparte)
    g.fillStyle = '#F7EEDF'; g.beginPath(); g.arc(258, -46, 9, 0, 7); g.fill(); g.strokeStyle = '#3A2419'; g.lineWidth = 1.6; g.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.fillStyle = '#3A2419'; g.fillRect(258 + Math.cos(a) * 7 - 0.4, -46 + Math.sin(a) * 7 - 0.4, 0.8, 0.8); }
    // riel de comandas
    g.fillStyle = '#9EA4AA'; g.fillRect(286, -46, 152, 2.2); g.fillStyle = '#6E757B'; g.fillRect(286, -43.8, 152, 0.8);
    g.fillStyle = '#7C838A'; g.fillRect(284, -48, 3, 6); g.fillRect(437, -48, 3, 6);
    g.fillStyle = '#8A5733'; g.font = '800 4.6px Figtree, system-ui, sans-serif'; g.textAlign = 'right'; g.fillText('COMANDAS', 438, -51);
    floorSig = S.cafe.name + '|' + S.cafe.skin + '|' + Rz;
  }
