
  /* ── bucle ── */
  let bus = 0, busT = 0, statT = 0;
  function update(dt) {
    clock += dt; M().t += dt;
    if (mode === 'nosys' && S.orders.some(o => o.mine && !o.simSeen && o.status !== 'entregado')) { setMode('sys', true); banner('Volvimos a Con NOVANTIQ', 'Entró tu pedido desde el celular de la demo: mirá cómo llega a la barra.', 3.6); }
    if (day) dayTick(dt);
    if (game) gameTick(dt);
    spawnT -= dt;
    if (spawnT <= 0) {
      const closing = day && day.t > 19.4 * 3600;
      if (!closing) spawn();
      spawnT = (peakT > 0 ? rr(1.2, 2.2) : rr(6, 10)) / (day ? Math.max(0.35, dayRate()) : 1) / (game ? 1.8 : 1);
    }
    if (peakT > 0) peakT -= dt;
    people.forEach(p => {
      movePerson(p, dt);
      if (p.bubble) { p.bubble.t += dt; if (p.bubble.t > p.bubble.dur) p.bubble = null; }
      if (p.sip > 0) p.sip = Math.max(0, p.sip - dt);
      if (p.gest) { p.gestT -= dt; if (p.gestT <= 0) p.gest = null; }
    });
    groups.forEach(g => updGroup(g, dt));
    groups = groups.filter(g => !g.dead);
    if (barista && !barista.gone) updBarista(barista, dt);
    if (game && game.b) updBarista(game.b, dt);
    updSecond(dt);
    people.forEach(p => { if (p.leavingBar && p.arrived && !p.path.length) p.gone = true; });
    people = people.filter(p => !(p.gone && p.kind !== 'cust' && p.kind !== 'dog'));
    updMozo(mozo, dt);
    fx.forEach(f => { f.t += dt; if (f.k === 'fly' && f.t >= f.life && !f.done) { f.done = true; if (f.onDone) f.onDone(); } });
    fx = fx.filter(f => f.t < f.life);
    busT += dt; if (bus > 0 && busT > 7) { bus--; busT = 0; }
    const near = people.some(p => Math.abs(p.x - CX) < 40 && p.y > 700 && p.y < WH + 30);
    doorA += ((near ? 1 : 0) - doorA) * Math.min(1, dt * 6);
    if (snd.on && R() < dt * 0.18) sfx('clink');
  }
  function frame() {
    const now = Date.now();
    const dtR = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
    if (running && !editing) { let rem = dtR * speed; while (rem > 1e-6) { const st = Math.min(0.05, rem); update(st); rem -= st; } }
    updCamera(dtR);
    statT += dtR; if (statT > 1) { statT = 0; renderStats(); }
    if (visible) { draw(); updPhone(); hud(); if (sel) renderCard(); }
    requestAnimationFrame(frame);
  }

  /* ── luz y puerta ── */
  function drawWindowLight(g, L) {
    const a = 0.24 * L.sun * (1 - L.dusk);
    if (a <= 0.01) return;
    const len = 110 + (L.h - 8) * 9 + L.golden * 60, drop = 34 + (L.h - 8) * 5;
    const warm = L.golden;
    const col = `rgba(255,${Math.round(240 - warm * 70)},${Math.round(205 - warm * 120)},`;
    [[150, 260], [320, 430], [480, 600]].forEach(([y0, y1]) => {
      const gr = g.createLinearGradient(14, 0, 14 + len, 0); gr.addColorStop(0, col + (a + warm * 0.08).toFixed(3) + ')'); gr.addColorStop(1, col + '0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(14, y0); g.lineTo(14, y1); g.lineTo(14 + len, y1 + drop); g.lineTo(14 + len, y0 + drop); g.closePath(); g.fill();
    });
    [[40, 230], [370, 560]].forEach(([x0, x1]) => {
      const gr = g.createLinearGradient(0, WH - 14, 0, WH - 120); gr.addColorStop(0, col + (a * 0.8).toFixed(3) + ')'); gr.addColorStop(1, col + '0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, WH - 14); g.lineTo(x1, WH - 14); g.lineTo(x1 + 50 - L.h * 2, WH - 120); g.lineTo(x0 + 50 - L.h * 2, WH - 120); g.closePath(); g.fill();
    });
  }
  function drawLighting(g, L) {
    if (L.golden > 0.02) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,140,50,${(0.38 * L.golden).toFixed(3)})`; g.fillRect(0, TOP, VW, VH); g.restore(); }
    if (L.dusk > 0.02) {
      g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(120,118,170,${(0.42 * L.dusk).toFixed(3)})`; g.fillRect(0, TOP, VW, VH); g.restore();
      g.fillStyle = `rgba(22,30,58,${(0.7 * L.dusk).toFixed(3)})`; [[150, 260], [320, 430], [480, 600]].forEach(([y0, y1]) => g.fillRect(3, y0, 8, y1 - y0)); [[40, 230], [370, 560]].forEach(([x0, x1]) => g.fillRect(x0, WH - 11, x1 - x0, 8));
    }
    const la = 0.1 + 0.16 * L.lamps;
    g.save(); g.globalCompositeOperation = 'lighter';
    TB.forEach(t => { const y = t.y - 14, gr = g.createRadialGradient(t.x, y, 3, t.x, y, 60); gr.addColorStop(0, `rgba(255,205,140,${la.toFixed(3)})`); gr.addColorStop(1, 'rgba(255,205,140,0)'); g.fillStyle = gr; g.beginPath(); g.arc(t.x, y, 60, 0, 7); g.fill(); });
    [120, 236, 360].forEach(x => { const gr = g.createRadialGradient(x, 30, 3, x, 30, 70); gr.addColorStop(0, `rgba(255,210,150,${(la * 0.8).toFixed(3)})`); gr.addColorStop(1, 'rgba(255,210,150,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, 30, 70, 0, 7); g.fill(); });
    g.restore();
  }
  function drawDoor(g) {
    g.save(); g.translate(268, WH - 7); g.rotate(-doorA * 1.35);
    g.fillStyle = '#6B4630'; rrect(g, 0, -3, 62, 6, 2); g.fill(); g.fillStyle = 'rgba(168,204,214,.8)'; g.fillRect(8, -1.6, 46, 3.2);
    g.fillStyle = '#E3A558'; g.beginPath(); g.arc(56, 0, 1.6, 0, 7); g.fill(); g.restore();
  }

  /* ── dibujo: todo ordenado por profundidad ── */
  const PLANTS = [[578, 138, 9], [438, 46, 7.5], [30, 742, 13], [570, 742, 13], [30, 628, 10], [570, 628, 10]];
  function draw() {
    const Rz = clamp(dpr * base * 1.9, 1, 2.6);
    if (!floorCv || floorSig !== S.cafe.name + '|' + S.cafe.skin + '|' + Rz) buildFloor();
    const g = ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#24160F'; g.fillRect(0, 0, cv.width, cv.height);
    const s = scl();
    g.setTransform(s * dpr, 0, 0, s * dpr, (cssW / 2 - cam.x * s) * dpr, (cssH / 2 - cam.y * s) * dpr);
    g.drawImage(floorCv, 0, TOP, VW, VH);
    const L = light();
    drawWindowLight(g, L);
    drawClock(g); drawRail(g); drawDoor(g);
    drawRings(g);
    const D = [];
    D.push([48, drawBackCounter], [114, drawFrontCounter], [142, drawBus], [30, drawLoungeBack], [41, drawSofaFront], [600, drawBooks], [744, drawCoatRack], [731, drawSign]);
    PLANTS.forEach(([x, y, r]) => D.push([y, () => drawPlant(g, x, y, r)]));
    TB.forEach(t => {
      if (t.k === 'lounge') { D.push([84, () => drawTable(g, t)]); t.seats.forEach(s2 => { if (s2.arm) D.push([s2.y - 0.2, () => drawArmchair(g, s2)]); }); return; }
      D.push([t.y, () => drawTable(g, t)]);
      t.seats.forEach(s2 => { D.push([s2.y - 0.2, () => drawChairBase(g, s2)]); if (s2.a === -Math.PI / 2) D.push([s2.y + 0.6, () => drawChairFront(g, s2)]); });
    });
    people.forEach(p => { if (p.delay > 0 || p.gone) return; D.push([p.pose === 'sit' ? p.y + 0.3 : p.y + (p.kind === 'dog' ? -0.1 : 0), () => drawPerson(g, p)]); });
    D.sort((a, b) => a[0] - b[0]).forEach(d => d[1](g));
    drawWork(g); drawBeams(g);
    drawLighting(g, L);
    drawFx(g); drawBubbles(g);
    if (vos && vos.members[0]) { const p = vos.members[0]; label(g, p.x, p.y + 9, 'Vos', '#E3A558', '#2B1A12'); }
    if (sel && sel.members && !(sel.t && sel.t === (vos && vos.t))) sel.members.forEach(m => { if (m.kind === 'cust') label(g, m.x, m.y + 9, m.lk.name, '#2B1A12', '#FFF8EE'); });
    [barista, barista2, mozo, game && game.b].filter(p => p && !p.gone && people.includes(p)).forEach(p => { if (p.y < 86 && p.bubble) return; label(g, p.x, p.y < 86 ? headY(p) - 11 : p.y + 8.5, p.lk.name, p.player ? brand().accent : 'rgba(43,26,18,.78)', '#FFF8EE', true); });
    if (editing) drawEditor(g);
  }

  /* ── tamaño y arranque ── */
  function resize() {
    const box = cv.parentElement.getBoundingClientRect();
    const w = Math.max(240, Math.floor(box.width));
    cssW = w; cssH = Math.round(w * (window.__simAspect || 1.25));
    base = Math.min(cssW / VW, cssH / VH);
    dpr = Math.min(3, window.__simDpr || window.devicePixelRatio || 1);
    cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px';
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    floorCv = null; clampCam(cam);
    draw();
  }
  function init() {
    cv = document.getElementById('sim'); if (!cv) return false;
    ctx = cv.getContext('2d');
    active = true;
    resize();
    let lw = cv.parentElement.getBoundingClientRect().width;
    if (window.ResizeObserver) new ResizeObserver(() => { const w = cv.parentElement.getBoundingClientRect().width; if (Math.abs(w - lw) > 2) { lw = w; resize(); } }).observe(cv.parentElement);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { floorCv = null; });
    if (window.IntersectionObserver) new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '160px' }).observe(cv);
    bindInput(); bindUI(); renderStats(); renderCamUI(); syncSpeedUI();
    last = Date.now();
    requestAnimationFrame(frame);
    return true;
  }
  function reset() {
    if (!active) return;
    Object.keys(stats).forEach(k => (stats[k] = 0));
    metrics.sys = blankMetrics(); metrics.nosys = blankMetrics();
    if (game) endGame(true); if (day) endDay(true);
    if (editing) { editing = false; const s = $s('salon'); if (s) s.classList.remove('editing'); const eb = $s('sim-edit-bar'); if (eb) eb.hidden = true; }
    if (mode !== 'sys') { mode = 'sys'; document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === 'sys'))); const s = $s('salon'); if (s) s.classList.remove('nosys'); }
    feed = []; addFeed('door', `Abrió ${S.cafe.name}`);
    seedScene(S.orders.filter(o => o.sim));
    renderStats();
  }
  function spawnTable(n, k) { const t = tableN(n); if (!t || t.group || t.dirty) return null; const g = newGroup(t, k); addFeed('door', `Llegaron ${k} clientes a la mesa ${t.n}`); return g.id; }
  function snapshot() {
    return {
      b: barista && { x: barista.x, y: barista.y, job: barista.job && barista.job.o ? barista.job.o.id : null, work: barista.work || null },
      m: mozo && { x: mozo.x, y: mozo.y, job: mozo.job && mozo.job.o ? mozo.job.o.id : null, step: mozo.job ? mozo.job.step || mozo.job.k : null },
      g: groups.map(g => ({ id: g.id, t: g.t ? g.t.n : 0, s: g.state, st: g.step, o: g.order && g.order.id ? g.order.id : null, os: g.order && g.order.status, x: g.members.length ? g.members.reduce((a, m) => a + m.x, 0) / g.members.length : 0, y: g.members.length ? g.members.reduce((a, m) => a + m.y, 0) / g.members.length : 0 })),
      cam: { x: cam.x, y: cam.y, z: cam.z, mode: cam.mode }, mode, day: day ? day.t : null, game: game ? { t: game.t, done: game.done } : null,
      stats: Object.assign({}, stats), tables: TB.map(t => ({ n: t.n, x: t.x, y: t.y }))
    };
  }
  return {
    init, reset, isActive: () => active, running: () => running && !editing,
    setSeed: s => (seed = s >>> 0), peak: () => { peakT = 9; spawnT = 0; spawn(true); }, setSpeed: s => { speed = s; syncSpeedUI(); },
    spawn, spawnTable, snapshot, holdSpawns: v => (spawnT = v), setMode: m => setMode(m), startDay, endDay, startGame, endGame, playerAct,
    follow: who => { const p = who === 'mozo' ? mozo : who === 'barista' ? barista : null; if (p) { setCam('follow'); cam.follow = p; cam.fz = 2.4; } }, dayRate: r => { if (day) day.rate = r; },
    setCam: m => setCam(m), feature: n => { const t = tableN(n); const g = t && t.group; if (g) { featured = g; cam.shot = null; cue(g, 2.4, 8, 9); } return !!g; }, focus: (x, y, z, d) => { cam.shot = null; startShot({ target: { x, y }, z: z || 2.2, dur: d || 3, pri: 9, at: clock }); }, startEdit, endEdit, editAt: id => { const s = SLOTS.find(q => q.id === id); if (s) editSlot(s); }
  };
})();
