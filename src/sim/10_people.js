
  /* ── personas y caminos ── */
  function look(fixed) {
    return Object.assign({ skin: rp(SKIN), hair: rp(HAIR), hs: rp(HS), shirt: rp(SHIRT), pants: rp(PANTS), name: rp(FIRST), glasses: R() < 0.16, beard: R() < 0.12, h: rr(0.95, 1.05) }, fixed || {});
  }
  function mk(x, y, kind, lk) {
    return {
      id: pid++, x, y, a: -Math.PI / 2, kind, lk: lk || look(), path: [], spd: kind === 'mozo' ? 92 : kind === 'barista' ? 70 : kind === 'dog' ? 70 : 64,
      pose: 'walk', ph: R() * 10, phone: 0, scan: 0, sip: 0, sipT: rr(2, 6), bubble: null, hold: null, delay: 0, ay: nearAisle(y),
      seat: null, group: null, alpha: 1, act: null, actT: 0, blink: rr(1, 4), mood: 0, gest: null, gestT: 0, work: 0, look: 0
    };
  }
  function route(p, to, toAy) {
    const ay1 = p.ay != null ? p.ay : nearAisle(p.y), pts = [];
    pts.push({ x: p.x, y: ay1 });
    if (ay1 !== toAy) { pts.push({ x: CX, y: ay1 }); pts.push({ x: CX, y: toAy }); }
    pts.push({ x: to.x, y: toAy }); pts.push({ x: to.x, y: to.y });
    p.path = pts.filter((q, i) => i === 0 ? Math.hypot(q.x - p.x, q.y - p.y) > 0.5 : Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) > 0.5);
    p.ay = toAy; p.pose = 'walk'; p.arrived = false;
  }
  function barTo(p, x) { p.path = [{ x, y: BAR_Y }]; p.arrived = false; p.pose = 'walk'; }
  function toDoor(p) {
    const ay = p.seat ? p.seat.ay : (p.ay || AY.a0);
    p.path = [{ x: p.x, y: ay }, { x: CX, y: ay }, { x: CX, y: 742 }, { x: CX + rr(-4, 4), y: WH + 34 }];
    p.pose = 'walk'; p.arrived = false; p.leaving = true;
    if (p.dog) toDoorDog(p.dog, p);
  }
  function toDoorDog(d, owner) { d.path = owner.path.map(q => ({ x: q.x + 10, y: q.y + 6 })); d.pose = 'walk'; d.arrived = false; d.leaving = true; d.delay = owner.delay + 0.25; }
  function movePerson(p, dt) {
    if (p.delay > 0) { p.delay -= dt; return; }
    if (!p.path.length) { if (!p.arrived) { p.arrived = true; if (p.onArrive) { const f = p.onArrive; p.onArrive = null; f(); } } return; }
    const q = p.path[0], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy), step = p.spd * dt;
    if (d > 0.01) p.a = Math.atan2(dy, dx);
    if (d <= step) { p.x = q.x; p.y = q.y; p.path.shift(); } else { p.x += dx / d * step; p.y += dy / d * step; }
    p.ph += dt * (p.kind === 'dog' ? 14 : 9.5);
  }
  function say(p, icon, dur) { p.bubble = { icon, t: 0, dur: dur || 1.8 }; }
  function float(x, y, text, color) {
    const near = fx.filter(f => f.k === 'txt' && Math.abs(f.x - x) < 46 && Math.abs(f.y - y) < 30 && f.t < f.life * 0.75).length;
    fx.push({ k: 'txt', x, y: y - near * 15, text, color: color || '#2B1A12', t: 0, life: 2.1 });
  }
  function puff(x, y, big) { fx.push({ k: 'puff', x: x + rr(-3, 3), y, t: 0, life: rr(0.9, 1.5), r: big ? rr(4, 6) : rr(2.4, 3.6) }); }
  function gesture(p, g, dur) { p.gest = g; p.gestT = dur || 1.4; }
  const headY = p => p.y - (p.pose === 'sit' ? 30 : 36) * (p.kid ? 0.72 : 1);

  /* ── vuelos: el ticket que viaja a la barra y el aviso que vuelve ── */
  function flight(kind, from, to, opts) {
    fx.push(Object.assign({ k: 'fly', kind, from: { x: from.x, y: from.y }, to, t: 0, life: 1.15, trail: [] }, opts || {}));
  }

  /* ── feed y números ── */
  const FEED_IC = { door: 'users', qr: 'qr', order: 'ticket', bar: 'cup', ready: 'bell', serve: 'check', stamp: 'stamp', wheel: 'wheel', star: 'star', pay: 'percent', bag: 'bag', you: 'pin', alert: 'alert', clock: 'clock' };
  function addFeed(icon, text, warn) {
    feed.unshift({ icon, text, warn, t: day ? dayClock() : hhmm(Date.now()) });
    if (feed.length > 7) feed.pop();
    const ol = document.getElementById('sim-feed'); if (!ol) return;
    ol.innerHTML = feed.map((f, i) => `<li class="${i === 0 ? 'new' : ''} ${f.warn ? 'warn' : ''}"><span class="fi2">${ic(FEED_IC[f.icon] || 'cup')}</span><span>${esc(f.text)}</span><time>${f.t}</time></li>`).join('');
  }
  const M = () => metrics[mode];
  function noteWait(g) {
    if (g.waitDone || g.sitAt == null) return;
    g.waitDone = true; const w = clock - g.sitAt; const m = M(); m.waitSum += w; m.waitN++;
  }
  function renderStats() {
    const el = document.getElementById('sim-stats'); if (!el) return;
    const ms = metrics.sys, mn = metrics.nosys;
    const avg = m => m.waitN ? mm(m.waitSum / m.waitN) : '—';
    const perH = m => m.t > 20 ? Math.round(m.orders / (m.t * TS / 3600)) : '—';
    if (mn.t > 6 || mode === 'nosys') {
      const rows = [
        ['Espera hasta recibir el pedido', avg(mn) + (mn.waitN ? ' min' : ''), avg(ms) + (ms.waitN ? ' min' : '')],
        ['Pedidos por hora', perH(mn), perH(ms)],
        ['Se fueron sin pedir', mn.walk, ms.walk],
        ['Calificaciones de 5 estrellas', mn.good, ms.good],
        ['Reseñas malas', mn.bad, ms.bad],
        ['Sellos entregados', mn.stamps, ms.stamps]
      ];
      el.className = 'sim-stats cmp';
      el.innerHTML = `<div class="cmp-h"><span></span><span class="${mode === 'nosys' ? 'on' : ''}">Sin sistema</span><span class="${mode === 'sys' ? 'on' : ''}">Con NOVANTIQ</span></div>` +
        rows.map(([k, a, b]) => `<div class="cmp-r"><span>${k}</span><b class="${mode === 'nosys' ? 'on' : ''}">${a}</b><b class="${mode === 'sys' ? 'on' : ''}">${b}</b></div>`).join('') +
        `<p class="cmp-note">${mode === 'nosys' ? 'Midiendo el salón sin sistema. Volvé a Con NOVANTIQ para comparar.' : 'Números medidos en esta simulación, en minutos del café.'}</p>`;
      return;
    }
    el.className = 'sim-stats';
    el.innerHTML = [['Clientes atendidos', stats.atendidos], ['Pedidos por QR', stats.pedidos], ['Espera promedio', avg(ms) + (ms.waitN ? ' min' : '')], ['Sellos entregados', stats.sellos], ['Calificaciones', stats.resenas], ['Ventas del turno', fmt(stats.ventas)]]
      .map(([k, v]) => `<div class="ss"><b>${v}</b><span>${k}</span></div>`).join('');
  }
  const list = arr => arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
  const itemsText = items => list(items.map(it => `${it.qty} ${it.name.toLowerCase()}`));
