
  /* ── personas en vista oblicua: cara, brazos y piernas ── */
  function dirOf(a) {
    const c = Math.cos(a), s = Math.sin(a);
    if (Math.abs(c) >= Math.abs(s) * 0.92) return c > 0 ? 'E' : 'W';
    return s > 0 ? 'S' : 'N';
  }
  function limb(g, x1, y1, x2, y2, w, color) { g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  function drawPerson(g, p) {
    if (p.delay > 0 || p.gone) return;
    if (p.kind === 'dog') return drawDog(g, p);
    const L = p.lk, sitting = p.pose === 'sit';
    const walking = !sitting && p.path.length > 0;
    const dir = sitting ? dirOf(p.seat.a) : (p.kind !== 'cust' && !walking && p.work && p.workSt) ? (facing(p.workSt) > 0 ? 'S' : 'N') : dirOf(p.a);
    const sc = (p.kid ? 0.72 : 1) * (L.h || 1);
    const ph = p.ph, sw = walking ? Math.sin(ph) : 0;
    const bob = walking ? Math.abs(Math.cos(ph)) * 0.9 : 0;
    const gest = p.gest, gk = gest ? clamp(p.gestT, 0, 1) : 0;
    g.save(); g.globalAlpha = p.alpha;
    g.translate(p.x, p.y);
    if (!sitting) floorShadow(g, 0, 0.5, 8.5 * sc, 3.6 * sc, 0.3);
    g.scale(sc, sc);
    g.translate(0, -bob);
    const dx = dir === 'E' ? 1 : dir === 'W' ? -1 : 0;
    const skin = L.skin, shirt = L.shirt, pants = L.pants || '#2F3B52', shoe = '#2A1E18';
    const staff = p.kind === 'barista' || p.kind === 'mozo' || p.kind === 'player';
    const apron = p.kind === 'mozo' ? '#E9D9BF' : brand().accent;
    const hipY = sitting ? -11 : -12, shY = sitting ? -24 : -25.5;
    const headY0 = sitting ? -30.5 : -32.5;
    const lean = gest === 'lean' ? 2 * Math.sin(gk * Math.PI) : 0;
    const laughY = gest === 'laugh' ? Math.abs(Math.sin(clock * 12)) * 0.8 : 0;
    // piernas
    if (!sitting) {
      if (dx === 0) {
        [-1, 1].forEach(s => { const lift = walking ? Math.max(0, s * sw) * 2 : 0; limb(g, s * 2.6, hipY + 1, s * 2.6, -1.2 - lift, 4, pants); g.fillStyle = shoe; g.beginPath(); g.ellipse(s * 2.7, -0.8 - lift, 2.4, 1.4, 0, 0, 7); g.fill(); });
      } else {
        [-1, 1].forEach(s => { const fx2 = walking ? s * sw * 3.4 * dx : s * 1.2; limb(g, 0, hipY + 1, fx2, -1.3, 4, pants); g.fillStyle = shoe; g.beginPath(); g.ellipse(fx2 + dx * 1.1, -0.8, 2.6, 1.3, 0, 0, 7); g.fill(); });
      }
    } else if (dir === 'S') {
      [-1, 1].forEach(s => { limb(g, s * 2.6, hipY, s * 3, -5, 4.2, pants); limb(g, s * 3, -5, s * 3.1, 2.4, 3.8, pants); g.fillStyle = shoe; g.beginPath(); g.ellipse(s * 3.2, 2.6, 2.4, 1.4, 0, 0, 7); g.fill(); });
    } else if (dx) {
      limb(g, 0, hipY + 0.5, dx * 7.5, hipY + 0.5, 4.4, pants); limb(g, dx * 7.5, hipY + 0.5, dx * 8, -0.5, 3.8, pants);
      g.fillStyle = shoe; g.beginPath(); g.ellipse(dx * 9, -0.2, 2.6, 1.3, 0, 0, 7); g.fill();
    }
    // mochila del repartidor (atrás)
    if (L.rider && dir !== 'S') { g.fillStyle = '#E0552A'; rrect(g, dx ? -dx * 9 - 5 : -7.5, shY - 1, dx ? 9 : 15, 15, 2); g.fill(); outline(g, 0.6); }
    // brazos de atrás
    const hands = armPose(p, dir, dx, sitting, sw, shY, gest, gk);
    hands.back.forEach(h => limb(g, h[0], h[1], h[2], h[3], 3.3, shade(shirt, 0.82)));
    // torso
    g.save(); g.translate(lean * (dx || 1), 0);
    const tw = dx ? 9.5 : 13.5;
    g.fillStyle = shirt; rrect(g, -tw / 2, shY, tw, hipY - shY + 2, dx ? 4 : 5); g.fill(); outline(g, 0.7);
    if (staff) {
      g.fillStyle = apron;
      if (dir === 'S') { rrect(g, -5, shY + 4, 10, hipY - shY + 6, 2); g.fill(); g.strokeStyle = apron; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-4, shY + 4); g.lineTo(-3, shY); g.moveTo(4, shY + 4); g.lineTo(3, shY); g.stroke(); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-3, shY + 11, 6, 3); }
      else if (dx) { g.fillRect(dx > 0 ? 1.8 : -4.6, shY + 5, 2.8, hipY - shY + 4); }
      else { g.strokeStyle = apron; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-5.5, hipY - 3); g.lineTo(5.5, hipY - 3); g.stroke(); g.beginPath(); g.moveTo(-1.2, hipY - 3); g.lineTo(-2.4, hipY + 1.5); g.moveTo(1.2, hipY - 3); g.lineTo(2.4, hipY + 1.5); g.stroke(); }
    } else if (dir === 'S') { g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.moveTo(-2.4, shY); g.lineTo(0, shY + 3); g.lineTo(2.4, shY); g.closePath(); g.fill(); }
    if (L.rider && dir === 'S') { g.strokeStyle = '#B8401C'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-4.5, shY); g.lineTo(-4.5, hipY); g.moveTo(4.5, shY); g.lineTo(4.5, hipY); g.stroke(); }
    // cabeza
    drawHead(g, p, L, dir, dx, headY0 - laughY, gest);
    g.restore();
    // brazos de adelante y lo que tiene en las manos
    hands.front.forEach(h => { limb(g, h[0], h[1], h[2], h[3], 3.3, shade(shirt, 0.92)); g.fillStyle = skin; g.beginPath(); g.arc(h[2], h[3], 1.7, 0, 7); g.fill(); });
    holdings(g, p, dir, dx, hands);
    g.restore();
  }
  function armPose(p, dir, dx, sitting, sw, shY, gest, gk) {
    const back = [], front = [];
    const sx = dx ? 0 : 6.4;
    const sh = s => [dx ? -dx * 0.5 : s * sx, shY + 2];
    let L2 = null, R2 = null;
    const up = (s, k) => { const [x, y] = sh(s); return [x, y, x + s * 2 + (dx ? dx * 2 : 0), y - 10 * k]; };
    if (gest === 'raise') R2 = up(1, 1.25);
    if (gest === 'cheer' || gest === 'stretch') { L2 = up(-1, 1.15); R2 = up(1, 1.15); }
    if (gest === 'toast') R2 = (() => { const [x, y] = sh(1); return [x, y, x + (dx || 1) * 5, y - 7]; })();
    if (p.hold === 'tray') { const [x, y] = sh(1); R2 = [x, y, (dx || 0.6) * 8, shY - 2]; if (!L2) L2 = (() => { const [x2, y2] = sh(-1); return [x2, y2, (dx || -0.6) * 6, shY + 2]; })(); }
    if ((p.phone || p.hold === 'menu' || p.hold === 'pad' || p.hold === 'bill' || p.work === 'write') && !R2 && !L2) {
      const fx2 = dx ? dx * 7 : 0, fy = sitting ? shY + 6 : shY + 7;
      L2 = [...sh(-1), fx2 - (dx ? 0 : 2.4), fy]; R2 = [...sh(1), fx2 + (dx ? 0 : 2.4), fy];
    }
    if (p.sip > 0 && !R2) { const k = Math.sin(clamp(1 - p.sip / 1.2, 0, 1) * Math.PI); const [x, y] = sh(1); R2 = [x, y, (dx || 0.4) * (6 - k * 3), shY + 6 - k * 6]; }
    if (p.work && p.work !== 'write' && !R2) {
      const w = Math.sin(clock * (p.work === 'grind' || p.work === 'steam' ? 22 : 9)) * 1.4;
      if (dir === 'N') { L2 = [...sh(-1), -5 + w, shY + 3]; R2 = [...sh(1), 5 - w, shY + 3]; }
      else { L2 = [...sh(-1), (dx || -0.5) * 7 - 2, shY + 7 + w]; R2 = [...sh(1), (dx || 0.5) * 7 + 2, shY + 7 - w]; }
    }
    if (sitting && !L2) L2 = [...sh(-1), dir === 'S' ? -4.5 : (dx ? dx * 8 : -4.5), dir === 'S' ? shY + 11 : shY + 8];
    if (sitting && !R2) R2 = [...sh(1), dir === 'S' ? 4.5 : (dx ? dx * 9 : 4.5), dir === 'S' ? shY + 11 : shY + 8];
    if (!L2) L2 = [...sh(-1), dx ? -sw * 3.6 * dx - dx * 0.5 : -7, shY + 12 + (dx ? 0 : -sw * 2)];
    if (!R2) R2 = [...sh(1), dx ? sw * 3.6 * dx + dx * 0.5 : 7, shY + 12 + (dx ? 0 : sw * 2)];
    if (dir === 'N') { back.push(L2, R2); }
    else if (dx) { back.push(L2); front.push(R2); }
    else { front.push(L2, R2); }
    if (dir === 'N' && p.work) return { back: [], front: [], l: L2, r: R2 };
    return { back, front, l: L2, r: R2 };
  }
  function drawHead(g, p, L, dir, dx, hy, gest) {
    const r = 6.7, skin = L.skin, hair = L.hair;
    g.fillStyle = shade(skin, 0.9); g.fillRect(-1.6, hy + 4.5, 3.2, 3);
    if (L.hs === 'long' && dir !== 'N') { g.fillStyle = hair; rrect(g, -7.3, hy - 2, 14.6, 12.5, 4); g.fill(); }
    g.fillStyle = skin; g.beginPath(); g.arc(0, hy, r, 0, 7); g.fill(); outline(g, 0.7);
    if (L.rider) {
      g.fillStyle = '#E0552A'; g.beginPath(); g.arc(0, hy - 0.8, r + 0.9, Math.PI, 0); g.lineTo(r + 0.9, hy + 1); g.lineTo(-r - 0.9, hy + 1); g.closePath(); g.fill(); outline(g, 0.6);
      g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-3, hy - 6.4, 4, 1.4);
    } else hairFor(g, L, dir, dx, hy, r);
    if (dir === 'N') return;
    // cara
    const blink = (clock + p.id * 0.37) % 4.2 < 0.12;
    const happy = gest === 'laugh' || gest === 'cheer' || (p.group && p.group.state === 'eat');
    const ex = dx ? [dx * 3] : [-2.4, 2.4], ey = hy + 0.6;
    g.fillStyle = '#2A1B12'; g.strokeStyle = '#2A1B12'; g.lineWidth = 0.7;
    ex.forEach(x => { if (blink || gest === 'laugh') { g.beginPath(); g.moveTo(x - 1, ey); g.quadraticCurveTo(x, ey - 1, x + 1, ey); g.stroke(); } else { g.beginPath(); g.ellipse(x, ey, 0.85, 1.15, 0, 0, 7); g.fill(); } });
    if (p.mood < 0) { g.lineWidth = 0.6; ex.forEach(x => { g.beginPath(); g.moveTo(x - 1.2, ey - 2.4 + (x < 0 ? -0.5 : 0.5)); g.lineTo(x + 1.2, ey - 2.4 + (x < 0 ? 0.5 : -0.5)); g.stroke(); }); }
    if (L.glasses) { g.strokeStyle = '#2A1B12'; g.lineWidth = 0.55; ex.forEach(x => { g.beginPath(); g.arc(x, ey, 1.9, 0, 7); g.stroke(); }); if (!dx) { g.beginPath(); g.moveTo(-0.5, ey); g.lineTo(0.5, ey); g.stroke(); } }
    g.fillStyle = 'rgba(224,110,100,.28)'; (dx ? [dx * 3.6] : [-4, 4]).forEach(x => { g.beginPath(); g.arc(x, hy + 2.6, 1.3, 0, 7); g.fill(); });
    const mx = dx ? dx * 3.4 : 0, my = hy + 3.4;
    const talking = gest === 'talk' || gest === 'laugh';
    g.strokeStyle = '#7A3B2A'; g.lineWidth = 0.7;
    if (talking && Math.sin(clock * 14 + p.id) > 0) { g.fillStyle = '#7A3B2A'; g.beginPath(); g.ellipse(mx, my, 1.1, 0.8, 0, 0, 7); g.fill(); }
    else if (p.mood < 0) { g.beginPath(); g.moveTo(mx - 1.3, my + 0.5); g.quadraticCurveTo(mx, my - 0.6, mx + 1.3, my + 0.5); g.stroke(); }
    else { g.beginPath(); g.moveTo(mx - (happy ? 1.6 : 1.1), my - 0.2); g.quadraticCurveTo(mx, my + (happy ? 1.5 : 0.9), mx + (happy ? 1.6 : 1.1), my - 0.2); g.stroke(); }
    if (L.beard) { g.fillStyle = hair; g.beginPath(); g.arc(dx ? dx * 1.5 : 0, hy + 1.6, r - 1.2, 0.15 * Math.PI, 0.85 * Math.PI); g.closePath(); g.fill(); }
  }
  function hairFor(g, L, dir, dx, hy, r) {
    const hair = L.hair; g.fillStyle = hair;
    if (L.hs === 'cap') {
      g.fillStyle = shade(L.shirt, 0.7);
      g.beginPath(); g.arc(0, hy - 1, r + 0.4, Math.PI, 0); g.closePath(); g.fill();
      if (dir === 'S') { g.beginPath(); g.ellipse(0, hy - 1, r + 1.5, 1.6, 0, 0, Math.PI); g.fill(); }
      else if (dx) { g.beginPath(); g.ellipse(dx * (r + 1.2), hy - 1.4, 4, 1.3, 0, 0, 7); g.fill(); }
      return;
    }
    if (dir === 'N') { g.beginPath(); g.arc(0, hy, r + 0.3, 0, 7); g.fill(); }
    else if (dx) { g.beginPath(); g.arc(0, hy, r + 0.3, Math.PI * (dx > 0 ? 0.62 : -0.38) + (dx > 0 ? 0 : 0), Math.PI * (dx > 0 ? 1.62 : 0.62) + 0.4 * dx * 0); g.lineTo(0, hy); g.closePath(); g.fill(); g.beginPath(); g.ellipse(-dx * 1, hy - 3.6, r * 0.95, r * 0.52, 0, 0, 7); g.fill(); }
    else { g.beginPath(); g.ellipse(0, hy - 3.2, r + 0.4, r * 0.62, 0, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(0, hy - 3.4, r * 0.98, r * 0.55, 0, 0, 7); g.fill(); g.fillRect(-r - 0.3, hy - 3.2, 2.2, 5); g.fillRect(r - 1.9, hy - 3.2, 2.2, 5); }
    if (L.hs === 'bun') { g.beginPath(); g.arc(dx ? -dx * 3 : 0, hy - r - 1.4, 3.3, 0, 7); g.fill(); }
    if (L.hs === 'pony' && dir !== 'S') { g.beginPath(); g.ellipse(dx ? -dx * 6.5 : 0, hy + (dx ? 1 : 3), 2.4, 5, dx ? -dx * 0.4 : 0, 0, 7); g.fill(); }
    if (L.hs === 'curly') { for (let i = 0; i < 8; i++) { const a = Math.PI * (1 + i / 7); g.beginPath(); g.arc(Math.cos(a) * r * 0.95, hy - 1 + Math.sin(a) * r * 0.95, 2.4, 0, 7); g.fill(); } }
    if (L.hs === 'long' && dir === 'N') { rrect(g, -7, hy - 2, 14, 12, 4); g.fill(); }
    if (L.hs === 'bob') { g.beginPath(); g.ellipse(0, hy + 1.4, r + 1, r * 0.75, 0, Math.PI * 1.05, Math.PI * 1.95, true); g.fill(); }
  }
  function holdings(g, p, dir, dx, hands) {
    const shY = p.pose === 'sit' ? -24 : -25.5;
    if (p.hold === 'tray') {
      const tx = (dx || 0.6) * 9, ty = shY - 3;
      g.fillStyle = '#B9BEC3'; g.beginPath(); g.ellipse(tx, ty, 10, 6, 0, 0, 7); g.fill(); outline(g, 0.6);
      const its = (p.tray || []).slice(0, 4);
      its.forEach((it, i) => drawItem(g, KIND[it.id] || 'cup', tx + Math.cos(i * 1.7) * 4.6, ty - 1 + Math.sin(i * 1.7) * 2.6, 0.62, ART[it.id]));
    }
    if (p.hold === 'dirty') { const tx = (dx || 0.6) * 9, ty = shY - 3; g.fillStyle = '#9EA4AA'; g.beginPath(); g.ellipse(tx, ty, 9, 5.4, 0, 0, 7); g.fill(); outline(g, 0.5); drawItem(g, 'cupd', tx - 3, ty - 1, 0.6); drawItem(g, 'plated', tx + 3, ty, 0.55); }
    const front = dir !== 'N';
    const hx = dx ? dx * 7 : 0, hy = p.pose === 'sit' ? shY + 5 : shY + 6;
    if (p.phone && p.hold !== 'tray' && front) {
      g.fillStyle = '#1E1D1A'; rrect(g, hx - 2.4, hy - 4.2, 4.8, 7.6, 1); g.fill();
      g.fillStyle = p.scan ? '#FFF2D6' : '#9FD0E0'; g.fillRect(hx - 1.7, hy - 3.4, 3.4, 5.8);
      g.fillStyle = 'rgba(255,240,200,.25)'; g.beginPath(); g.arc(hx, hy - 1, 6, 0, 7); g.fill();
    }
    if (p.hold === 'menu' && front) { g.fillStyle = '#F3E3C8'; g.save(); g.translate(hx, hy - 1); g.rotate(dx * 0.2); g.fillRect(-4.5, -5, 9, 8); g.fillStyle = '#8A5733'; g.fillRect(-3.4, -3.6, 6.8, 1); g.fillRect(-3.4, -1.4, 5, 0.8); g.fillRect(-3.4, 0.4, 5.6, 0.8); g.restore(); }
    if ((p.hold === 'pad' || p.work === 'write') && front) { g.fillStyle = '#FFFDF7'; g.fillRect(hx - 3, hy - 4, 6, 7); g.strokeStyle = '#8A5733'; g.lineWidth = 0.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(hx - 2, hy - 2.5 + i * 2); g.lineTo(hx + 2 * Math.abs(Math.sin(clock * 6 + i)), hy - 2.5 + i * 2); g.stroke(); } }
    if (p.hold === 'bill' && front) { g.fillStyle = '#2B1A12'; g.fillRect(hx - 3, hy - 4, 6, 8); g.fillStyle = '#F3E3C8'; g.fillRect(hx - 2, hy - 3, 4, 2); }
    if (p.hold === 'bag') drawItem(g, 'bag', dx ? dx * 6 : 6, shY + 14, 1);
    if (p.sip > 0 && front) { const k = Math.sin(clamp(1 - p.sip / 1.2, 0, 1) * Math.PI); drawItem(g, 'cuph', (dx || 0.4) * (6 - k * 3), shY + 5 - k * 6, 0.85); }
    if (p.gest === 'toast' && front && p.pose === 'sit') drawItem(g, 'cuph', (dx || 1) * 5, shY - 7, 0.85);
    if (p.work === 'tongs' && front) { g.strokeStyle = '#8E959B'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(3, hy); g.lineTo(9, hy + 5); g.stroke(); if (p.workK > 0.3) drawItem(g, 'medialuna1', 9, hy + 6, 0.8); }
    if (p.work === 'steam' || p.work === 'art') { /* la jarra la dibuja la máquina */ }
  }
  function drawDog(g, d) {
    const fur = d.lk.fur || '#C69A6A', walking = d.pose === 'walk' && d.path.length;
    const dirx = Math.cos(d.a) >= 0 ? 1 : -1;
    g.save(); g.translate(d.x, d.y);
    floorShadow(g, 0, 0.5, 9, 3.4, 0.28);
    g.scale(dirx, 1);
    if (d.pose === 'lie') {
      g.fillStyle = fur; g.beginPath(); g.ellipse(0, -3.2, 8, 3.6, 0, 0, 7); g.fill(); outline(g, 0.6);
      g.beginPath(); g.arc(7, -4.4, 3.4, 0, 7); g.fill(); outline(g, 0.6);
      g.fillStyle = shade(fur, 0.7); g.beginPath(); g.ellipse(6, -6.6, 1.4, 2.6, -0.5, 0, 7); g.fill();
      g.fillStyle = '#2A1B12'; g.beginPath(); g.arc(9.6, -4.4, 0.8, 0, 7); g.fill();
      g.strokeStyle = fur; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-8, -3); g.quadraticCurveTo(-11, -4 + Math.sin(clock * 5) * 1.6, -12, -2); g.stroke();
    } else {
      const s = walking ? Math.sin(d.ph) : 0;
      g.strokeStyle = shade(fur, 0.8); g.lineWidth = 1.8; g.lineCap = 'round';
      [[-4, 1], [-2.4, -1], [3.6, -1], [5.2, 1]].forEach(([x, k]) => { g.beginPath(); g.moveTo(x, -5); g.lineTo(x + s * 1.8 * k, 0); g.stroke(); });
      g.fillStyle = fur; g.beginPath(); g.ellipse(0.6, -6.6, 7, 3.6, 0, 0, 7); g.fill(); outline(g, 0.6);
      g.beginPath(); g.arc(7.6, -9.4, 3.3, 0, 7); g.fill(); outline(g, 0.6);
      g.fillStyle = shade(fur, 0.7); g.beginPath(); g.ellipse(6.4, -11.8, 1.3, 2.5, -0.4, 0, 7); g.fill();
      g.fillStyle = '#2A1B12'; g.beginPath(); g.arc(10.2, -9.6, 0.8, 0, 7); g.fill(); g.beginPath(); g.arc(8.4, -10.2, 0.55, 0, 7); g.fill();
      g.strokeStyle = fur; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-6, -7.4); g.quadraticCurveTo(-9, -11 + Math.sin(clock * 14) * 2, -10, -9); g.stroke();
    }
    g.restore();
  }

  /* ── cosas sobre las mesas y en las bandejas ── */
  function plate(g, rx) { g.fillStyle = '#FBF8F3'; g.beginPath(); g.ellipse(0, 0, rx, rx * 0.68, 0, 0, 7); g.fill(); outline(g, 0.45); g.fillStyle = 'rgba(200,185,165,.35)'; g.beginPath(); g.ellipse(0, -0.3, rx * 0.66, rx * 0.44, 0, 0, 7); g.fill(); }
  function glassCup(g, h, layers, rim) {
    g.fillStyle = 'rgba(230,242,246,.55)'; g.beginPath(); g.ellipse(0, 0, 3.4, 1.7, 0, 0, 7); g.fill();
    let y = 0; layers.forEach(([c, lh]) => { g.fillStyle = c; g.fillRect(-3.2, y - lh, 6.4, lh); y -= lh; });
    g.fillStyle = rim || layers[layers.length - 1][0]; g.beginPath(); g.ellipse(0, -h, 3.2, 1.5, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(-3.4, -h); g.lineTo(-3.4, 0); g.moveTo(3.4, -h); g.lineTo(3.4, 0); g.stroke();
    g.beginPath(); g.ellipse(0, -h, 3.4, 1.6, 0, 0, 7); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(-2.6, -h + 1, 0.9, h - 1.6);
  }
  function drawItem(g, k, x, y, sc, art) {
    g.save(); g.translate(x, y); if (sc) g.scale(sc, sc);
    if (k === 'cup' || k === 'cuph' || k === 'cupd') {
      if (k !== 'cuph') { g.fillStyle = '#FBF8F3'; g.beginPath(); g.ellipse(0, 0.6, 5.4, 3.3, 0, 0, 7); g.fill(); outline(g, 0.45); }
      g.fillStyle = '#FFFFFF'; rrect(g, -3.5, -3.4, 7, 4, 1.6); g.fill(); outline(g, 0.45);
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.1; g.beginPath(); g.arc(3.9, -1.6, 1.5, -1.2, 1.2); g.stroke();
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(0, -3.4, 3.5, 1.8, 0, 0, 7); g.fill(); outline(g, 0.4);
      if (k === 'cupd') { g.fillStyle = 'rgba(110,70,40,.45)'; g.beginPath(); g.ellipse(0, -3.3, 2.4, 1.1, 0, 0, 7); g.fill(); }
      else {
        g.fillStyle = art === 'black' ? '#3A1C0C' : art === 'crema' ? '#9A5A2A' : '#A8693A'; g.beginPath(); g.ellipse(0, -3.4, 2.8, 1.35, 0, 0, 7); g.fill();
        if (art === 'rosetta' || art === 'heart' || art === 'cocoa' || !art) { g.fillStyle = '#F5ECDF'; if (art === 'rosetta') { g.beginPath(); g.ellipse(0, -3.4, 1.7, 0.75, 0, 0, 7); g.fill(); g.fillStyle = '#A8693A'; g.fillRect(-1.5, -3.5, 3, 0.25); } else { g.beginPath(); g.arc(-0.55, -3.6, 0.65, 0, 7); g.arc(0.55, -3.6, 0.65, 0, 7); g.fill(); g.beginPath(); g.moveTo(-1.15, -3.45); g.lineTo(0, -2.6); g.lineTo(1.15, -3.45); g.fill(); } }
      }
    } else if (k === 'glasscap') { glassCup(g, 8, [['#6E3B1C', 2.4], ['#C9A27E', 2.6], ['#F6EEE2', 3]], '#F3E6D2'); g.fillStyle = '#6E3B1C'; [[-1, -8.2], [0.8, -7.9], [0.1, -8.4]].forEach(([a, b]) => g.fillRect(a, b, 0.6, 0.4)); }
    else if (k === 'glassmilk') { glassCup(g, 8, [['#5A2F16', 1.6], ['#FBF7EF', 6.4]], '#FFFDF8'); g.fillStyle = '#4A2614'; g.save(); g.rotate(0.3); g.fillRect(-0.4, -12.6, 3, 5.6); g.restore(); }
    else if (k === 'glass' || k === 'glassd' || k === 'juice') {
      const L2 = k === 'juice' ? [['#F39A2B', 7.4]] : k === 'glassd' ? [['#2E1407', 7.4]] : [['#EFE6D8', 3.4], ['#A0673C', 4]];
      glassCup(g, 8, L2, k === 'juice' ? '#F7B04A' : k === 'glassd' ? '#3D1A0A' : '#B88A5E');
      if (k !== 'juice') { g.fillStyle = 'rgba(240,250,252,.85)'; g.fillRect(-2.2, -8.6, 1.8, 1.4); g.fillRect(0.6, -8.2, 1.8, 1.4); }
      g.strokeStyle = k === 'juice' ? '#5E8F6A' : '#C9A27E'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(0.8, -8); g.lineTo(2.6, -12.4); g.stroke();
    } else if (k === 'medialunas' || k === 'medialuna1') {
      if (k === 'medialunas') plate(g, 6.4);
      const cres = (cx, cy, a) => { g.save(); g.translate(cx, cy); g.rotate(a); g.fillStyle = '#D18B3E'; g.beginPath(); g.arc(0, 0, 2.9, 0.15, Math.PI - 0.15); g.arc(0, -0.8, 1.7, Math.PI - 0.1, 0.1, true); g.closePath(); g.fill(); g.fillStyle = '#E8A85A'; g.beginPath(); g.arc(0, 0.6, 1.2, 0.3, Math.PI - 0.3); g.fill(); g.restore(); };
      if (k === 'medialunas') { cres(-1.8, -1.2, 0.3); cres(2, 0.2, 3.3); } else cres(0, 0, 0.3);
    } else if (k === 'alfajor') { plate(g, 5.6); g.fillStyle = '#2E1A10'; g.beginPath(); g.ellipse(0, -1.4, 3.4, 2.1, 0, 0, 7); g.fill(); g.fillStyle = '#3E2418'; g.fillRect(-3.4, -1.4, 6.8, 1.4); g.fillStyle = '#4A2C1E'; g.beginPath(); g.ellipse(0, -2.6, 3.2, 1.9, 0, 0, 7); g.fill(); }
    else if (k === 'cookie') { plate(g, 5.6); g.fillStyle = '#C99556'; g.beginPath(); g.ellipse(0, -0.6, 3.8, 2.4, 0, 0, 7); g.fill(); g.fillStyle = '#3B2015'; [[-1.4, -1.2], [1.2, -0.2], [-0.2, 0.6], [1, -1.6]].forEach(([a, b]) => g.fillRect(a, b, 0.9, 0.7)); }
    else if (k === 'cake') { plate(g, 6.2); g.fillStyle = '#F2E4C6'; g.beginPath(); g.moveTo(-3.6, 0.6); g.lineTo(3.2, 0.6); g.lineTo(0.4, -2.8); g.closePath(); g.fill(); g.fillStyle = '#E8D4AE'; g.fillRect(-3.6, 0.6, 6.8, 1.6); g.fillStyle = '#9C1830'; g.beginPath(); g.moveTo(-3, -0.2); g.lineTo(2.6, -0.2); g.lineTo(0.4, -3.2); g.closePath(); g.fill(); g.fillStyle = '#3B2A6A'; g.beginPath(); g.arc(0.4, -1.8, 0.7, 0, 7); g.fill(); }
    else if (k === 'budin') { plate(g, 6); g.fillStyle = '#E9C060'; rrect(g, -3.4, -3, 6.8, 3.6, 0.8); g.fill(); g.fillStyle = '#C8932E'; g.fillRect(-3.4, -3, 6.8, 1); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(-3, -3.2, 6, 0.5); }
    else if (k === 'tostado') { plate(g, 7); g.fillStyle = '#D9A85F'; g.beginPath(); g.moveTo(-4.6, -1.8); g.lineTo(1.8, -2.6); g.lineTo(-3.2, 1.6); g.closePath(); g.fill(); g.beginPath(); g.moveTo(4.6, 1.2); g.lineTo(-1.6, 1.8); g.lineTo(3.6, -2.2); g.closePath(); g.fill(); g.strokeStyle = '#8A4F1D'; g.lineWidth = 0.35; for (let i = -3; i < 4; i += 2) { g.beginPath(); g.moveTo(i - 0.8, -2); g.lineTo(i + 0.8, 1.4); g.stroke(); } g.fillStyle = '#F3D38A'; g.fillRect(-2.6, -0.4, 2, 0.6); }
    else if (k === 'toast') { plate(g, 7); g.fillStyle = '#B07A3C'; rrect(g, -4.6, -2.6, 9.2, 4.6, 1.6); g.fill(); g.fillStyle = '#93B33F'; rrect(g, -3.8, -2.2, 7.6, 3.6, 1.4); g.fill(); g.fillStyle = '#F7F3EA'; g.beginPath(); g.ellipse(0.6, -1.2, 2, 1.4, 0, 0, 7); g.fill(); g.fillStyle = '#F0A01A'; g.beginPath(); g.arc(0.6, -1.4, 0.8, 0, 7); g.fill(); }
    else if (k === 'plated') { plate(g, 5.8); g.fillStyle = 'rgba(190,140,80,.55)'; [[-1.4, -0.6], [1.2, 0.4], [0.2, -1.2]].forEach(([a, b]) => g.fillRect(a, b, 0.8, 0.6)); }
    else if (k === 'bag') { g.fillStyle = '#C9A27E'; rrect(g, -3.6, -9, 7.2, 9, 1); g.fill(); outline(g, 0.5); g.fillStyle = shade('#C9A27E', 0.85); g.fillRect(-3.6, -9, 7.2, 1.6); g.fillStyle = brand().accent; g.beginPath(); g.arc(0, -4.4, 1.5, 0, 7); g.fill(); }
    g.restore();
  }
  function steam(g, x, y, i) {
    g.save(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 0.9; g.lineCap = 'round';
    for (let k = 0; k < 2; k++) {
      const ph = (clock * 0.8 + i * 0.37 + k * 0.5) % 1;
      g.globalAlpha = Math.sin(ph * Math.PI) * 0.75;
      g.beginPath();
      for (let s = 0; s <= 6; s++) { const yy = y - ph * 9 - s * 1.5, xx = x - 1.2 + k * 2.4 + Math.sin(s * 0.9 + clock * 4 + k) * 1.1; s ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
      g.stroke();
    }
    g.restore();
  }
