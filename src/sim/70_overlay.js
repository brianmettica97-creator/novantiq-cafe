
  /* ── comandas colgadas en el riel ── */
  function railList() {
    if (mode !== 'sys') return [];
    return S.orders.filter(o => (o.sim || o.mine) && o.railIn != null && o.status !== 'entregado' && !(o.status === 'listo' && (o.picked || o.where === 'llevar') && clock - (o.readyAt || clock) > 2.2))
      .sort((a, b) => a.t0 - b.t0).slice(0, 6);
  }
  function railSlot(o) {
    const l = S.orders.filter(x => (x.sim || x.mine) && x.railIn != null && x.status !== 'entregado' && x !== o).sort((a, b) => a.t0 - b.t0);
    const i = Math.min(5, l.filter(x => x.t0 <= o.t0).length);
    return { x: 296 + i * 23 + 9.5, y: -36 };
  }
  function drawRail(g) {
    const acc = brand().accent;
    railList().forEach((o, i) => {
      const x = 296 + i * 23, y = -44;
      const age = clock - o.railIn;
      const col = o.status === 'listo' ? '#4C7A36' : age < 12 ? '#5E8F4A' : age < 22 ? '#D08A1E' : '#C2313B';
      const sway = Math.sin(clock * 2 + i) * 0.03;
      g.save(); g.translate(x + 9.5, y); g.rotate(sway);
      g.fillStyle = 'rgba(40,22,12,.25)'; g.fillRect(-8.5, 1.6, 19, 18);
      g.fillStyle = '#FFFDF7'; g.fillRect(-9.5, 0, 19, 18);
      g.fillStyle = o.status === 'listo' ? '#4C7A36' : o.status === 'preparando' ? '#B4741A' : acc; g.fillRect(-9.5, 0, 19, 5);
      g.fillStyle = '#FFFFFF'; g.font = '800 3.8px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(o.mine ? 'VOS' : o.where === 'mesa' ? 'MESA ' + o.mesa : 'LLEVAR', 0, 2.6);
      g.fillStyle = '#3A2419'; g.font = '600 2.9px Figtree, system-ui, sans-serif'; g.textAlign = 'left';
      o.items.slice(0, 3).forEach((it, k) => { const nm = (byId(it.id) || {}).name || it.name; g.fillText(`${it.qty} ${nm.length > 12 ? nm.slice(0, 11) + '.' : nm}`, -8, 7.6 + k * 3.2); });
      g.fillStyle = col; g.fillRect(-9.5, 16, 19 * (o.status === 'listo' ? 1 : clamp(age / 30, 0.12, 1)), 2);
      if (o.status === 'listo') { g.strokeStyle = '#4C7A36'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(3, 12); g.lineTo(5, 14); g.lineTo(8.4, 10.4); g.stroke(); }
      g.fillStyle = '#7C838A'; g.fillRect(-2, -1.6, 4, 2.6);
      g.restore();
    });
  }
  /* ── reloj de pared ── */
  function drawClock(g) {
    let h, m;
    if (day) { h = day.t / 3600; m = (day.t / 60) % 60; } else { const d = new Date(); h = d.getHours() + d.getMinutes() / 60; m = d.getMinutes() + d.getSeconds() / 60; }
    g.strokeStyle = '#3A2419'; g.lineCap = 'round';
    const ah = (h % 12) / 12 * 6.283 - Math.PI / 2, am = m / 60 * 6.283 - Math.PI / 2;
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(258, -46); g.lineTo(258 + Math.cos(ah) * 3.8, -46 + Math.sin(ah) * 3.8); g.stroke();
    g.lineWidth = 0.8; g.beginPath(); g.moveTo(258, -46); g.lineTo(258 + Math.cos(am) * 5.8, -46 + Math.sin(am) * 5.8); g.stroke();
    g.fillStyle = '#B3202E'; g.beginPath(); g.arc(258, -46, 0.9, 0, 7); g.fill();
  }
  /* ── anillos de progreso y el primer plano del latte art ── */
  const RING_FX = { brew: 'cup', steam: 'milk', pour: 'drop', grill: 'fire' };
  function drawWork(g) {
    [barista, barista2, game && game.b].forEach(b => {
      if (!b || !b.work || b.gone) return;
      const st = b.workSt, x = STATION_X[st] + (b === barista2 && st === 'pass' ? 14 : 0);
      if (RING_FX[b.work]) {
        const y = st === 'vitrina' ? 40 : -22, k = b.workK || 0;
        g.save(); g.translate(x, y);
        g.fillStyle = 'rgba(255,251,245,.96)'; g.beginPath(); g.arc(0, 0, 7.4, 0, 7); g.fill(); outline(g, 0.6);
        g.strokeStyle = 'rgba(58,36,25,.18)'; g.lineWidth = 1.8; g.beginPath(); g.arc(0, 0, 5.6, 0, 7); g.stroke();
        g.strokeStyle = brand().accent; g.beginPath(); g.arc(0, 0, 5.6, -Math.PI / 2, -Math.PI / 2 + k * 6.283); g.stroke();
        miniIcon(g, RING_FX[b.work]);
        g.restore();
      }
      if (b.work === 'art') latteArt(g, x, -30, b.workK || 0, b.art);
      if (b.work === 'steam' && R() < 0.5) puff(116 + rr(-3, 3), 14, true);
    });
  }
  function miniIcon(g, k) {
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (k === 'cup') { g.fillStyle = '#6E3B1C'; rrect(g, -2.6, -1.6, 5.2, 3.6, 1.2); g.fill(); g.strokeStyle = '#6E3B1C'; g.lineWidth = 0.7; g.beginPath(); g.arc(2.9, 0, 1, -1.3, 1.3); g.stroke(); }
    if (k === 'milk') { g.fillStyle = '#9EA4AA'; g.beginPath(); g.moveTo(-2.2, -2.6); g.lineTo(2.4, -2.6); g.lineTo(2, 2.6); g.lineTo(-2, 2.6); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.fillRect(-1.6, -1.6, 3.2, 1); }
    if (k === 'drop') { g.fillStyle = '#5B3219'; g.beginPath(); g.moveTo(0, -3); g.quadraticCurveTo(2.6, 0.4, 0, 2.6); g.quadraticCurveTo(-2.6, 0.4, 0, -3); g.fill(); }
    if (k === 'fire') { g.fillStyle = '#E0552A'; g.beginPath(); g.moveTo(0, -3); g.quadraticCurveTo(3, 0, 1.4, 2.6); g.lineTo(-1.4, 2.6); g.quadraticCurveTo(-3, 0, 0, -3); g.fill(); g.fillStyle = '#F2B544'; g.beginPath(); g.arc(0, 1.2, 1.1, 0, 7); g.fill(); }
  }
  function latteArt(g, x, y, k, art) {
    const R0 = 19, a = clamp(k * 1.4, 0, 1);
    g.save(); g.translate(x, y); g.globalAlpha = clamp(k * 6, 0, 1) * clamp((1 - k) * 8, 0, 1);
    g.shadowColor = 'rgba(40,22,12,.4)'; g.shadowBlur = 6 * scl() * dpr; g.shadowOffsetY = 2 * scl() * dpr;
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, R0, 0, 7); g.fill();
    g.shadowColor = 'transparent';
    g.fillStyle = '#F3EEE7'; g.beginPath(); g.arc(0, 0, R0 - 2, 0, 7); g.fill();
    g.fillStyle = '#9C5B2E'; g.beginPath(); g.arc(0, 0, R0 - 4.4, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(0, 0, R0 - 4.4, 0, 7); g.clip();
    g.fillStyle = '#F7EEE2';
    if (art === 'rosetta') {
      const n = Math.ceil(a * 7);
      for (let i = 0; i < n; i++) { const yy = 8 - i * 2.6, w = 9.5 - i * 1.05; g.beginPath(); g.ellipse(0, yy, w, 2.1, 0, 0, Math.PI); g.fill(); }
      if (a > 0.92) { g.strokeStyle = '#F7EEE2'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(0, -11); g.lineTo(0, 10); g.stroke(); }
    } else if (art === 'cocoa') {
      g.beginPath(); g.arc(0, 0, (R0 - 5) * Math.min(1, a * 1.2), 0, 7); g.fill();
      g.fillStyle = 'rgba(110,59,28,.8)'; for (let i = 0; i < Math.floor(a * 40); i++) { const r = ((i * 7.31) % 1) * 12, an = i * 2.4; g.fillRect(Math.cos(an) * r, Math.sin(an) * r, 0.7, 0.7); }
    } else {
      const s = 0.4 + a * 0.6;
      g.beginPath(); g.arc(-3.6 * s, -1.6 * s, 4.8 * s, 0, 7); g.arc(3.6 * s, -1.6 * s, 4.8 * s, 0, 7); g.fill();
      g.beginPath(); g.moveTo(-8.2 * s, 0); g.lineTo(0, 9 * s); g.lineTo(8.2 * s, 0); g.closePath(); g.fill();
    }
    g.restore();
    if (k < 0.9) { g.strokeStyle = 'rgba(247,238,226,.95)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(10, -R0 - 6); g.quadraticCurveTo(6, -R0 + 2, 1, -2); g.stroke(); g.fillStyle = '#C9CED2'; rrect(g, 8, -R0 - 13, 9, 8, 2); g.fill(); }
    g.lineWidth = 1.2; g.strokeStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, R0, 0, 7); g.stroke();
    g.restore();
  }
  /* ── globitos, nombres y textos que suben ── */
  function drawIcon(g, k, x, y) {
    g.save(); g.translate(x, y); g.lineCap = 'round'; g.lineJoin = 'round';
    const ink = '#2B1A12';
    if (k === 'qr') qrMini(g, -4.5, -4.5, 9, ink, '#fff');
    else if (k === 'dots') { g.fillStyle = ink; [-3.4, 0, 3.4].forEach((d, i) => { g.globalAlpha = 0.45 + 0.55 * ((Math.floor(clock * 3) % 3) === i ? 1 : 0); g.beginPath(); g.arc(d, 0, 1.3, 0, 7); g.fill(); }); g.globalAlpha = 1; }
    else if (k === 'check') { g.strokeStyle = '#4C7A36'; g.lineWidth = 1.9; g.beginPath(); g.moveTo(-3.6, 0.2); g.lineTo(-1, 2.8); g.lineTo(3.8, -2.6); g.stroke(); }
    else if (k === 'heart') { g.fillStyle = '#C2313B'; g.beginPath(); g.moveTo(0, 3.6); g.bezierCurveTo(-5, 0, -3, -4.4, 0, -1.6); g.bezierCurveTo(3, -4.4, 5, 0, 0, 3.6); g.fill(); }
    else if (k === 'stamp') { g.strokeStyle = '#B3202E'; g.lineWidth = 1.1; g.beginPath(); g.arc(0, 0, 4.2, 0, 7); g.stroke(); g.fillStyle = '#B3202E'; g.save(); g.rotate(0.6); g.beginPath(); g.ellipse(0, 0, 1.7, 2.6, 0, 0, 7); g.fill(); g.restore(); }
    else if (k === 'wheel') { const cs = ['#D98BAA', '#C9383A', '#E8A33A', '#768F3B']; for (let i = 0; i < 4; i++) { g.fillStyle = cs[i]; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 4.4, clock * 7 + i * Math.PI / 2, clock * 7 + (i + 1) * Math.PI / 2); g.closePath(); g.fill(); } }
    else if (k === 'star') { g.fillStyle = '#E3A558'; g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 1.9 : 4.4, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); }
    else if (k === 'cash') { g.fillStyle = '#4C7A36'; g.font = '800 9px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 0.5); }
    else if (k === 'bell') { g.fillStyle = '#E3A558'; g.beginPath(); g.moveTo(-3.6, 2); g.quadraticCurveTo(-3.6, -4, 0, -4); g.quadraticCurveTo(3.6, -4, 3.6, 2); g.closePath(); g.fill(); g.fillRect(-4.4, 2, 8.8, 1.2); }
    else if (k === 'hand') { g.fillStyle = '#E8B894'; rrect(g, -2.6, -2, 5.2, 6, 1.6); g.fill(); [-2, -0.6, 0.8, 2.2].forEach((fx2, i) => { rrect(g, fx2 - 0.6, -5.2 + (i === 0 || i === 3 ? 1 : 0), 1.3, 4, 0.6); g.fill(); }); g.fillStyle = '#B3202E'; g.font = '900 6px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText('!', 4.6, -1.5); }
    else if (k === 'angry') { g.fillStyle = '#E8A33A'; g.beginPath(); g.arc(0, 0, 4.2, 0, 7); g.fill(); g.strokeStyle = ink; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-2.6, -1.8); g.lineTo(-0.8, -1); g.moveTo(2.6, -1.8); g.lineTo(0.8, -1); g.moveTo(-1.6, 2); g.quadraticCurveTo(0, 0.8, 1.6, 2); g.stroke(); }
    else if (k === 'clock') { g.strokeStyle = ink; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, 4, 0, 7); g.stroke(); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -2.6); g.moveTo(0, 0); g.lineTo(2, 1); g.stroke(); }
    else if (k === 'bill') { g.fillStyle = '#FFFDF7'; g.strokeStyle = ink; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-3, -4.4); g.lineTo(3, -4.4); g.lineTo(3, 4); g.lineTo(1.5, 3); g.lineTo(0, 4); g.lineTo(-1.5, 3); g.lineTo(-3, 4); g.closePath(); g.fill(); g.stroke(); g.fillStyle = ink; g.font = '800 4.4px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, -0.4); }
    else if (k === 'pad') { g.fillStyle = '#FFFDF7'; g.fillRect(-3.4, -4, 6.8, 8); g.strokeStyle = '#8A5733'; g.lineWidth = 0.6; [-2, 0, 2].forEach(yy => { g.beginPath(); g.moveTo(-2.4, yy); g.lineTo(2.4, yy); g.stroke(); }); }
    else if (k === 'talk') { g.fillStyle = ink; g.font = '800 5px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('¡Listo!', 0, 0.3); }
    else if (k === 'hi') { g.fillStyle = ink; g.font = '800 5px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('¡Hola!', 0, 0.3); }
    g.restore();
  }
  function drawBubbles(g) {
    people.forEach(p => {
      if (!p.bubble || p.delay > 0 || p.gone) return;
      const b = p.bubble, t = Math.min(1, b.t / 0.18), s = t < 1 ? 0.6 + 0.5 * Math.sin(t * Math.PI * 0.75) : 1, out = b.t > b.dur - 0.2 ? (b.dur - b.t) / 0.2 : 1;
      const wide = b.icon === 'talk' || b.icon === 'hi';
      const x = p.x, y = headY(p) - 13;
      g.save(); g.globalAlpha = Math.max(0, out); g.translate(x, y); g.scale(s, s);
      g.fillStyle = 'rgba(40,22,12,.25)'; rrect(g, (wide ? -13 : -9.5) + 0.6, -8.5 + 1.4, wide ? 26 : 19, 15, 5); g.fill();
      g.fillStyle = '#FFFFFF'; rrect(g, wide ? -13 : -9.5, -8.5, wide ? 26 : 19, 15, 5); g.fill(); outline(g, 0.5);
      g.beginPath(); g.moveTo(-2.5, 6.4); g.lineTo(0, 10); g.lineTo(2.5, 6.4); g.fill();
      drawIcon(g, b.icon, 0, -1); g.restore();
    });
  }
  function label(g, x, y, text, bg, fg, small) {
    g.save(); g.font = `800 ${small ? 6.6 : 7.6}px Figtree, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const w = g.measureText(text).width + 8; g.fillStyle = bg; rrect(g, x - w / 2, y - 5.2, w, 10.4, 5.2); g.fill(); g.fillStyle = fg; g.fillText(text, x, y + 0.4); g.restore();
  }
  function drawFx(g) {
    fx.forEach(f => {
      const k = f.t / f.life;
      if (f.k === 'puff') { g.fillStyle = `rgba(255,255,255,${0.5 * (1 - k)})`; g.beginPath(); g.arc(f.x + Math.sin(f.t * 5) * 2, f.y - k * 24, f.r * (1 + k * 1.2), 0, 7); g.fill(); }
      else if (f.k === 'grain') { g.fillStyle = `rgba(80,45,20,${1 - k})`; g.fillRect(f.x, f.y + k * 7, 1.1, 1.1); }
      else if (f.k === 'ding') {
        const s = 1 + Math.sin(Math.min(1, k * 3) * Math.PI) * 0.25;
        g.save(); g.translate(f.x, f.y - k * 10); g.globalAlpha = 1 - Math.max(0, (k - 0.6) / 0.4); g.scale(s, s);
        g.strokeStyle = '#E3A558'; g.lineWidth = 1.2; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; g.beginPath(); g.moveTo(Math.cos(a) * 9, Math.sin(a) * 9); g.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); g.stroke(); }
        g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, 7.5, 0, 7); g.fill(); outline(g, 0.6); drawIcon(g, 'bell', 0, 0.4);
        g.restore();
      } else if (f.k === 'paperdrop') { g.save(); g.translate(f.x, f.y - (1 - k) * 18); g.rotate((1 - k) * 2); g.fillStyle = '#FFFDF7'; g.fillRect(-4, -3, 8, 6); outline(g, 0.4); g.restore(); }
      else if (f.k === 'txt') {
        const y = f.y - k * 24, al = k < 0.12 ? k / 0.12 : 1 - Math.max(0, (k - 0.62) / 0.38);
        g.save(); g.globalAlpha = al; g.font = '800 9.4px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 3.2; g.strokeStyle = 'rgba(255,251,245,.95)'; g.strokeText(f.text, f.x, y); g.fillStyle = f.color; g.fillText(f.text, f.x, y); g.restore();
      } else if (f.k === 'fly') drawFlight(g, f, k);
    });
  }
  function flyPos(f, k) {
    const to = typeof f.to === 'function' ? f.to() : f.to;
    const e = ease(k), mx = (f.from.x + to.x) / 2, my = Math.min(f.from.y, to.y) - 60 - Math.abs(f.from.x - to.x) * 0.12;
    const u = 1 - e;
    return { x: u * u * f.from.x + 2 * u * e * mx + e * e * to.x, y: u * u * f.from.y + 2 * u * e * my + e * e * to.y };
  }
  function drawFlight(g, f, k) {
    const p = flyPos(f, k);
    f.trail.push(p); if (f.trail.length > 9) f.trail.shift();
    f.trail.forEach((q, i) => { g.fillStyle = f.kind === 'bell' ? `rgba(227,165,88,${i / 14})` : `rgba(255,251,245,${i / 12})`; g.beginPath(); g.arc(q.x, q.y, 1 + i * 0.25, 0, 7); g.fill(); });
    g.save(); g.translate(p.x, p.y); g.rotate(Math.sin(k * 7) * 0.15);
    if (f.kind === 'ticket') {
      g.fillStyle = 'rgba(40,22,12,.3)'; g.fillRect(-5.6, -3.6, 12, 10);
      g.fillStyle = '#FFFDF7'; g.fillRect(-6.4, -4.6, 12.8, 10); outline(g, 0.5);
      g.fillStyle = brand().accent; g.fillRect(-6.4, -4.6, 12.8, 3.4);
      g.fillStyle = '#fff'; g.font = '800 2.6px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(f.label || '', 0, -2.9);
      g.fillStyle = '#B9A88E'; g.fillRect(-4.6, 0.4, 9, 0.8); g.fillRect(-4.6, 2.4, 6, 0.8);
    } else { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill(); outline(g, 0.6); drawIcon(g, 'bell', 0, 0.3); }
    g.restore();
  }
  function drawBeams(g) {
    people.forEach(p => {
      if (!p.scan || !p.group) return;
      const t = p.group.t;
      const tgt = t ? { x: t.k === 'lounge' ? t.x + 9 : t.qr.x, y: t.k === 'lounge' ? 70 : t.qr.y - 17 } : { x: 120, y: 74 };
      const dx = Math.cos(p.a) > 0.3 ? 1 : Math.cos(p.a) < -0.3 ? -1 : 0;
      const hx = p.x + dx * 7, hy = p.y - (p.pose === 'sit' ? 20 : 21);
      g.save(); g.strokeStyle = 'rgba(227,165,88,.95)'; g.lineWidth = 1.2; g.setLineDash([2.6, 2.6]); g.lineDashOffset = -clock * 30;
      g.beginPath(); g.moveTo(hx, hy); g.lineTo(tgt.x, tgt.y); g.stroke(); g.restore();
    });
  }
  function drawRings(g) {
    const ring = (x, y, rx, ry, color, dash) => { g.save(); g.strokeStyle = color; g.lineWidth = 2; if (dash) { g.setLineDash([5, 4]); g.lineDashOffset = -clock * 8; } g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.stroke(); g.restore(); };
    const vt = vos && vos.t;
    if (vt) ring(vt.x, vt.y + 2, 50, 36, '#E3A558', true);
    const st = sel ? (sel.staff ? null : sel.t || (sel.members && sel.members[0] && { x: sel.members[0].x, y: sel.members[0].y })) : null;
    if (st) ring(st.x, st.y + 2, st.k === 'lounge' ? 66 : 52, st.k === 'lounge' ? 46 : 38, 'rgba(194,49,59,.95)');
    if (sel && sel.staff) ring(sel.staff.x, sel.staff.y + 1, 14, 7, 'rgba(194,49,59,.95)');
    const ht = hover && hover !== st && !hover.kind ? hover : null;
    if (ht && ht.x != null) ring(ht.x, ht.y + 2, ht.k === 'lounge' ? 66 : 52, ht.k === 'lounge' ? 46 : 38, 'rgba(43,26,18,.32)');
  }
  function drawEditor(g) {
    SLOTS.forEach(s => {
      const used = layout.find(l => l.slot === s.id);
      g.save(); g.translate(s.x, s.y);
      g.strokeStyle = used ? 'rgba(227,165,88,.95)' : 'rgba(43,26,18,.45)'; g.lineWidth = 1.6; g.setLineDash(used ? [] : [4, 3]);
      g.beginPath(); g.ellipse(0, -6, 40, 32, 0, 0, 7); g.stroke(); g.setLineDash([]);
      if (!used) { g.fillStyle = 'rgba(255,251,245,.9)'; g.beginPath(); g.arc(0, -6, 9, 0, 7); g.fill(); g.strokeStyle = '#3A2419'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-4, -6); g.lineTo(4, -6); g.moveTo(0, -10); g.lineTo(0, -2); g.stroke(); }
      g.restore();
    });
  }
