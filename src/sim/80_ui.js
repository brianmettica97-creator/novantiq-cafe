
  /* ── tarjeta de información ── */
  const $s = id => document.getElementById(id);
  const TASK_TXT = { grind: 'Moliendo el café', brew: 'Sacando el espresso', steam: 'Espumando la leche', art: 'Haciendo el latte art', choco: 'Sumando la barra de chocolate', pour: 'Preparando el filtrado', ice: 'Sirviendo bebidas frías', grill: 'Tostando en la plancha', tongs: 'Sacando algo de la vitrina', pass: 'Dejando el pedido en el retiro', write: 'Tomando un pedido' };
  function staffCard(p) {
    if (p.kind === 'mozo') {
      const j = p.job;
      const txt = !j ? 'Esperando el próximo pedido listo' : j.k === 'deliver' ? (j.step === 'pick' ? 'Buscando un pedido en el retiro' : `Llevando el pedido a la mesa ${j.o.mesa || (vos && vos.t.n)}`) : j.k === 'clear' ? 'Levantando una mesa' : j.k === 'take' ? `Tomando el pedido de la mesa ${j.g.t.n}` : j.k === 'bill' ? 'Llevando la cuenta' : j.k === 'drop' ? 'Dejando las comandas en la barra' : 'Atendiendo el salón';
      return `<b>${esc(p.lk.name)}, moza</b><p>${txt}.</p>${mode === 'nosys' ? '<p class="tk">Sin sistema, cada pedido y cada cuenta pasan por ella.</p>' : '<p class="tk">Con NOVANTIQ solo lleva y levanta: los pedidos llegan solos a la barra.</p>'}`;
    }
    const q = prepQueue().length;
    const doing = p.work ? TASK_TXT[p.work] || 'Trabajando' : 'Lista para la próxima comanda';
    const who = p.job && p.job.o ? (p.job.o.mine ? ' para vos' : p.job.o.where === 'mesa' ? ` para la mesa ${p.job.o.mesa}` : ` para ${esc(p.job.o.name)}`) : '';
    return `<b>${esc(p.lk.name)}, ${p.player ? 'vos en la barra' : 'barista'}</b><p>${doing}${who}.</p><p class="tk">${q ? `${q} ${q === 1 ? 'comanda' : 'comandas'} en espera` : 'Sin comandas en espera'}</p>`;
  }
  function renderCard() {
    const el = $s('sim-card'); if (!el) return;
    if (!sel) { el.hidden = true; el.dataset.k = ''; return; }
    let html = '';
    if (sel.staff) html = staffCard(sel.staff);
    else {
      const t = sel.t ? sel.t : null, g = sel.t ? sel.t.group : sel;
      const states = { arrive: 'Llegando a la mesa', scan: 'Escaneando el QR', browse: 'Mirando la carta en el celular', wait: 'Esperando el pedido', eat: 'Desayunando', loyalty: 'Sumando sellos y girando la ruleta', leave: 'Pagando y yéndose', idle: 'Mirando la carta', menu: 'Mirando la carta de papel', call: 'Llamando a la moza', taking: 'Dictando el pedido', bill: 'Pidiendo la cuenta', paying: 'Pagando', queue: 'Haciendo la fila en la caja' };
      if (t && t === (vos && vos.t)) html = `<b>Mesa ${t.n}: vos</b><p>Pedí desde el celular de la demo y mirá cómo la barra lo prepara y Sol te lo trae.</p><button class="btn btn-ink btn-sm" type="button" data-sim="demo">Pedir desde el celular</button>`;
      else if (t && !g) html = `<b>Mesa ${t.n} libre</b><p>${t.dirty ? 'Sol está por levantar la mesa.' : 'Cuando llegue alguien, escanea el QR y pide desde acá.'}</p>`;
      else if (g) {
        const o = g.order && g.order.id ? g.order : null;
        const stTxt = { nuevo: o && o.paper ? 'En papel, esperando a la barra' : 'Nueva en la barra', preparando: 'En preparación', listo: 'Lista para llevar', entregado: 'Entregada' };
        const wait = g.sitAt != null && !g.waitDone && g.state !== 'leave' ? `<p class="tk">Esperando hace ${mm(clock - g.sitAt)} min</p>` : '';
        html = `<b>${g.takeaway ? 'Para llevar' : 'Mesa ' + t.n}</b><p class="who">${esc(list(g.members.filter(m => m.kind === 'cust').map(m => m.lk.name)))}${g.members.some(m => m.dog) ? ' y su perro' : ''}</p><p>${states[g.state] || ''}</p>${wait}`;
        if (g.order && g.order.items) html += `<p class="ords">${g.order.items.map(it => `${it.qty}× ${esc((byId(it.id) || {}).name || it.name)}${it.mods && it.mods.length ? ' (' + esc(it.mods.join(', ').toLowerCase()) + ')' : ''}`).join('<br>')}</p>`;
        if (o) html += `<p class="tk">Comanda ${o.paper ? 'en papel' : '#' + o.id}: <strong>${stTxt[o.status] || ''}</strong></p>${!o.paper && S.orders.includes(o) && o.status !== 'entregado' ? '<button class="btn btn-quiet btn-sm" type="button" data-sim="ticket">Ver la comanda en el panel</button>' : ''}`;
      }
    }
    if (cam.mode === 'follow') html += `<button class="sim-unfollow" type="button" data-sim="unfollow">Dejar de seguir</button>`;
    if (el.dataset.k !== html) { el.innerHTML = `<button class="icon-btn sim-x" type="button" data-sim="close" aria-label="Cerrar">${ic('close')}</button>${html}`; el.dataset.k = html; }
    el.hidden = false;
  }
  function renderCamUI() {
    document.querySelectorAll('[data-cam]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.cam === 'auto' && (cam.mode === 'auto' || cam.mode === 'follow')) || (b.dataset.cam === 'all' && cam.mode === 'all'))));
  }

  /* ── el celular flotante: lo que ve el cliente en la mesa ── */
  let phoneKey = '';
  const PH_DUR = { scan: 1.9, carta: 6, sent: 2.4, sellos: 1.6, ruleta: 1.6, stars: 1.5, pay: 2 };
  function phoneHTML(g) {
    const ph = g.ph, b = brand(), name = esc(S.cafe.name), where = g.takeaway ? 'Para llevar' : 'Mesa ' + g.t.n;
    const top = `<div class="fp-top" style="--acc:${b.accent}"><span style="font-family:${b.font};font-weight:${b.fw || 400}">${name}</span><small>${where}</small></div>`;
    const its = g.pre || (g.order && g.order.items) || [];
    if (ph.scr === 'scan') return `<div class="fp-scr fp-cam"><div class="fp-qr"><i></i><i></i><i></i></div><b class="fp-line"></b><span>Apuntá al QR de la mesa</span></div>`;
    if (ph.scr === 'carta') {
      const pick = its[0] ? its[0].id : 'flatwhite';
      const ids = [pick].concat(['medialunas', 'cortado', 'cappuccino', 'tostado'].filter(i => i !== pick)).slice(0, 3);
      return `<div class="fp-scr">${top}<div class="fp-list">${ids.map((id, i) => { const p = byId(id); return p ? `<div class="fp-row ${i === 0 ? 'pick' : ''}"><img src="${IMG[p.img]}" alt=""><span>${esc(p.name)}<small>${fmt(p.price)}</small></span><i>+</i></div>` : ''; }).join('')}</div><div class="fp-cart"><span>${its.reduce((s, it) => s + it.qty, 0) || 1} en tu pedido</span><b>Pedir</b></div></div>`;
    }
    if (ph.scr === 'sent') return `<div class="fp-scr">${top}<div class="fp-ok"><span class="fp-check"></span><b>Pedido enviado</b><small>La barra ya lo tiene</small><ul>${its.slice(0, 3).map(it => `<li>${it.qty}× ${esc((byId(it.id) || {}).name || it.name)}</li>`).join('')}</ul></div></div>`;
    if (ph.scr === 'sellos') { const n = ph.n || 0, have = Math.min(9, 3 + (g.id % 5)); return `<div class="fp-scr">${top}<div class="fp-stamps"><b>${n ? `+${n} ${n === 1 ? 'sello' : 'sellos'}` : 'Tu tarjeta'}</b><div class="fp-grid">${Array.from({ length: 10 }, (_, i) => `<i class="${i < have ? 'on' : i < have + n ? 'on new' : ''}"></i>`).join('')}</div><small>Al décimo café, uno de regalo</small></div></div>`; }
    if (ph.scr === 'ruleta') return `<div class="fp-scr">${top}<div class="fp-wheel"><div class="fp-w"></div><i class="fp-pin"></i><b>${esc(ph.prize ? 'Ganaste: ' + ph.prize : 'Girando…')}</b></div></div>`;
    if (ph.scr === 'stars') return `<div class="fp-scr">${top}<div class="fp-stars"><b>¿Qué tal estuvo?</b><div>${Array.from({ length: 5 }, (_, i) => `<i class="${i < (ph.r || 5) ? 'on' : ''}" style="animation-delay:${i * 0.1}s"></i>`).join('')}</div><small>Gracias por contarnos</small></div></div>`;
    if (ph.scr === 'pay') return `<div class="fp-scr">${top}<div class="fp-ok"><span class="fp-check"></span><b>Pagado</b><small>${fmt(ph.tot || 0)}</small><ul><li>Te esperamos de nuevo</li></ul></div></div>`;
    return '';
  }
  function updPhone() {
    const el = $s('sim-phone'); if (!el) return;
    const g = featured;
    const ok = g && !g.dead && g.ph && !game && !editing && mode === 'sys' && clock - g.ph.t < (g.ph.scr === 'carta' ? (g.browse || 3) + 0.4 : PH_DUR[g.ph.scr] || 2);
    if (!ok) { if (!el.hidden) { el.hidden = true; phoneKey = ''; } return; }
    const key = g.id + g.ph.scr + (g.ph.prize || '') + S.cafe.name;
    if (key !== phoneKey) { el.innerHTML = phoneHTML(g); phoneKey = key; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
    el.hidden = false;
    const anchor = g.t ? { x: g.t.x, y: g.t.y - 30 } : tgtPos(g) || { x: 300, y: 120 };
    const s = w2s(anchor.x, anchor.y);
    const k = clamp((cssW < 480 ? 0.62 : 0.8) + (cam.z - 1) * 0.1, 0.6, 1.02);
    const pw = 118 * k, phh = 206 * k;
    const right = s.x < cssW * 0.58;
    const off = (g.t && g.t.k === 'square' ? 56 : 50) * scl();
    let x = right ? s.x + off : s.x - pw - off;
    let y = s.y - phh * 0.62;
    x = clamp(x, 6, cssW - pw - 6); y = clamp(y, 6, cssH - phh - 6);
    el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${k.toFixed(3)})`;
    el.classList.toggle('left', !right);
  }

  /* ── carteles ── */
  let bannerT = 0;
  function banner(title, text, dur) {
    const el = $s('sim-banner'); if (!el) return;
    el.innerHTML = `<b>${esc(title)}</b>${text ? `<span>${esc(text)}</span>` : ''}`;
    el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    clearTimeout(bannerT); bannerT = setTimeout(() => { el.hidden = true; }, (dur || 3.6) * 1000);
  }
  let hudKey = '';
  function hud() {
    const el = $s('sim-hud'); if (!el) return;
    let html = '';
    if (day) html = `<b>${dayClock()}</b><span>${day.t < 12 * 3600 ? 'Mañana' : day.t < 17 * 3600 ? 'Tarde' : day.t < 19.2 * 3600 ? 'Merienda' : 'Cierre'}</span>`;
    else if (game && !game.over) { const left = Math.max(0, Math.ceil(game.dur - game.t)); html = `<b>${left} s</b><span>${game.done} ${game.done === 1 ? 'pedido' : 'pedidos'}</span>`; }
    if (html === hudKey) return;
    hudKey = html; el.hidden = !html; if (html) el.innerHTML = html;
  }

  /* ── con y sin sistema ── */
  function setMode(m, quiet) {
    if (m === mode || editing) return;
    if (game) endGame(true);
    if (day) endDay(true);
    mode = m;
    metrics[m] = blankMetrics();
    if (m === 'nosys') { S.orders.filter(o => o.sim).forEach(o => clearTimeout(o.auto)); S.orders = S.orders.filter(o => !o.sim); if (typeof renderBoard === 'function' && S.panelTab === 'barra') renderBoard(); }
    seedScene(m === 'sys' ? S.orders.filter(o => o.sim) : []);
    sel = null; renderCard(); setCam('auto');
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    $s('salon') && $s('salon').classList.toggle('nosys', m === 'nosys');
    if (!quiet) banner(m === 'nosys' ? 'El mismo salón, sin sistema' : 'Con NOVANTIQ', m === 'nosys' ? 'La moza toma cada pedido en papel, la barra recién se entera cuando se lo llevan y la cuenta llega al final.' : 'Cada mesa pide por QR, la comanda llega sola a la barra y el cliente paga desde el celular.', 4.6);
    addFeed(m === 'nosys' ? 'alert' : 'qr', m === 'nosys' ? 'Modo sin sistema: pedidos en papel' : 'Volvió el sistema: pedidos por QR', m === 'nosys');
    renderStats();
  }

  /* ── un día completo en cámara rápida ── */
  function dayRate() {
    if (!day) return 1;
    const h = day.t / 3600, bump = (c, w, a) => a * Math.exp(-((h - c) ** 2) / (2 * w * w));
    return 0.42 + bump(9.6, 0.8, 1.35) + bump(13.1, 0.8, 0.75) + bump(17.9, 0.85, 1.45) - (h > 19.4 ? 0.4 : 0);
  }
  const pad2 = n => String(Math.floor(n)).padStart(2, '0');
  function dayClock() { const t = day ? day.t : 8 * 3600; return pad2(t / 3600) + ':' + pad2((t / 60) % 60); }
  let spdBefore = 1;
  function startDay() {
    if (editing) return;
    if (game) endGame(true);
    if (mode !== 'sys') setMode('sys', true);
    day = { t: 8 * 3600, end: 20 * 3600, rate: 90 };
    Object.assign(dayStats, { clientes: 0, pedidos: 0, sellos: 0, resenas: 0, ventas: 0, hours: {} });
    spdBefore = speed; speed = 4; running = true; syncSpeedUI();
    S.orders.filter(o => o.sim).forEach(o => clearTimeout(o.auto)); S.orders = S.orders.filter(o => !o.sim);
    seedScene([], true); setCam('auto');
    const sb = $s('sim-sum'); if (sb) sb.hidden = true;
    banner('Un día en ' + S.cafe.name, 'De 8 a 20 h en cámara rápida. Mirá cómo cambian la luz y el ritmo del salón.', 4);
    addFeed('door', `Abrió ${S.cafe.name}: 8:00`);
    $s('sim-day') && $s('sim-day').setAttribute('aria-pressed', 'true');
  }
  function dayTick(dt) {
    if (!day.closing) { day.t = Math.min(day.end, day.t + dt * day.rate); if (day.t >= day.end) { day.closing = clock; addFeed('door', 'Son las 20: cierra la puerta, terminan los últimos'); } return; }
    // al cierre, los que quedan terminan y se van; recién ahí sale el resumen
    groups.forEach(g => { if (!g.vos && g.state === 'eat') g.eatT = Math.min(g.eatT || 12, g.timer + 0.5); });
    const left = groups.filter(g => !g.vos && !g.dead && g.state !== 'leave').length;
    if (!left || clock - day.closing > 30) endDay();
  }
  function endDay(silent) {
    if (!day) return;
    day = null; speed = spdBefore || 1; syncSpeedUI();
    $s('sim-day') && $s('sim-day').setAttribute('aria-pressed', 'false');
    if (silent) return;
    const hs = Object.entries(dayStats.hours).sort((a, b) => b[1] - a[1])[0];
    const sum = $s('sim-sum'); if (!sum) return;
    sum.innerHTML = `<div class="sum-card"><span class="sum-k">Cierre del día</span><h3>Así terminó el día en ${esc(S.cafe.name)}</h3>
      <div class="sum-grid"><div><b>${dayStats.clientes}</b><span>clientes en el día</span></div><div><b>${dayStats.pedidos}</b><span>pedidos por QR</span></div><div><b>${fmt(dayStats.ventas)}</b><span>vendido en el día</span></div><div><b>${dayStats.sellos}</b><span>sellos entregados</span></div><div><b>${dayStats.resenas}</b><span>calificaciones nuevas</span></div><div><b>${hs ? hs[0] + ' a ' + (+hs[0] + 1) + ' h' : '—'}</b><span>la hora con más pedidos</span></div></div>
      <p>Todo esto lo ves en el panel del local, con nombre, mesa y ticket de cada pedido.</p>
      <div class="sum-act"><button class="btn btn-accent btn-sm" type="button" data-sum="again">Ver otro día</button><button class="btn btn-quiet btn-sm" type="button" data-sum="close">Volver al salón</button></div></div>`;
    sum.hidden = false;
  }

  /* ── modo barista ── */
  function startGame() {
    if (editing) return;
    if (day) endDay(true);
    if (mode !== 'sys') setMode('sys', true);
    game = { t: 0, dur: 75, done: 0, times: [], stars: [], miss: 0, over: false, b: null };
    speed = 1; running = true; syncSpeedUI();
    [barista, barista2].forEach(b => { if (!b) return; if (b.job && b.job.task) b.job.task.by = null; b.job = null; b.work = 0; b.leavingBar = true; barTo(b, P.back.x); });
    const b = mk(P.back.x, BAR_Y, 'player', look({ name: 'Vos', shirt: '#F3EADB', pants: '#2A2A2A', hs: 'short', glasses: false, beard: false, h: 1 }));
    b.player = true; b.entering = true; barTo(b, P.barHome.x); people.push(b); game.b = b;
    S.orders.filter(o => (o.sim || o.mine) && o.plan).forEach(o => { o.plan.forEach(t => (t.by = null)); });
    spawnT = 1;
    sel = null; renderCard();
    const sum = $s('sim-sum'); if (sum) sum.hidden = true;
    $s('sim-game').hidden = false; $s('salon').classList.add('playing');
    renderGame();
    const w = document.querySelector('.sim-wrap'); if (w) w.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    banner('Juli se tomó un recreo', 'La barra es tuya por 75 segundos. Mirá la comanda del riel y tocá los pasos; cuando esté todo, Entregar.', 5);
  }
  function renderGame() {
    const el = $s('sim-game'); if (!el || !game) return;
    const o = gameOrder(); const steps = o ? gameSteps(o) : [];
    const need = new Set(steps.filter(s => !s.done).map(s => s.st));
    const rest = steps.filter(s => s.st !== 'pass').every(s => s.done);
    const head = o ? `<div class="gm-ticket"><b>${o.mine ? 'Tu pedido' : o.where === 'mesa' ? 'Mesa ' + o.mesa : 'Para llevar'}</b><span>${esc(itemsText(o.items))}</span></div>` : `<div class="gm-ticket wait"><b>Esperando comandas</b><span>Ya llegan los primeros pedidos por QR.</span></div>`;
    el.innerHTML = `${head}<div class="gm-st">${GAME_ST.map(([st, lbl, key]) => { const on = need.has(st) && (st !== 'pass' || rest); const done = steps.some(s => s.st === st && s.done); return `<button type="button" data-st="${st}" class="${on ? 'need' : ''} ${done ? 'done' : ''}" aria-keyshortcuts="${key}"><kbd>${key}</kbd>${lbl}</button>`; }).join('')}</div><p class="gm-msg" id="gm-msg" aria-live="polite"></p><button class="gm-exit" type="button" data-st="exit">Terminar</button>`;
  }
  function gameMsg(t) { const m = $s('gm-msg'); if (m) m.textContent = t; }
  function shakeBtn(st) { const b = document.querySelector(`#sim-game [data-st="${st}"]`); if (b) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); } }
  function gameDone(o) {
    if (!game) return;
    const tm = clock - (o.railIn || clock);
    const st = tm < 18 ? 5 : tm < 26 ? 4 : tm < 36 ? 3 : 2;
    game.done++; game.times.push(tm); game.stars.push(st);
    float(P.pass.x, 20, `+1 pedido, ${'★'.repeat(st)}`, '#4C7A36');
    gameMsg(st >= 4 ? '¡Bien! Salió rápido.' : 'Listo, aunque tardó un poco.');
  }
  function gameTick(dt) { if (!game.over) { game.t += dt; if (game.t >= game.dur) endGame(); } }
  function endGame(silent) {
    if (!game) return;
    const g0 = game; game = null;
    const pb = g0.b; if (pb) { if (pb.job && pb.job.o) { /* lo que quedó lo sigue Juli */ } pb.job = null; pb.work = 0; pb.player = false; pb.leavingBar = true; pb.kind = 'barista'; barTo(pb, P.back.x); }
    [barista].forEach(b => { b.gone = false; b.leavingBar = false; b.x = P.back.x; b.y = BAR_Y; if (!people.includes(b)) people.push(b); barTo(b, P.barHome.x); });
    S.orders.filter(o => o.plan).forEach(o => o.plan.forEach(t => { if (!t.done) t.by = null; }));
    $s('sim-game').hidden = true; $s('salon').classList.remove('playing');
    if (silent) return;
    const n = g0.done, avg = n ? g0.times.reduce((a, b) => a + b, 0) / n : 0, stars = n ? g0.stars.reduce((a, b) => a + b, 0) / n : 0;
    const title = n >= 6 && stars >= 4.4 ? 'Barista de especialidad' : n >= 4 ? 'Buen pulso en la barra' : n >= 2 ? 'Vas tomando ritmo' : 'La barra tiene lo suyo';
    const sum = $s('sim-sum'); if (!sum) return;
    sum.innerHTML = `<div class="sum-card"><span class="sum-k">Fin del turno</span><h3>${title}</h3>
      <div class="sum-grid three"><div><b>${n}</b><span>${n === 1 ? 'pedido despachado' : 'pedidos despachados'}</span></div><div><b>${n ? Math.round(avg) + ' s' : '—'}</b><span>por pedido, desde que entró la comanda</span></div><div><b>${n ? stars.toFixed(1).replace('.', ',') : '—'}</b><span>estrellas de los clientes</span></div></div>
      <p>Cada comanda te llegó sola al riel, con la mesa y lo que pidieron. Eso hace el sistema en tu barra todos los días.</p>
      <div class="sum-act"><button class="btn btn-accent btn-sm" type="button" data-sum="replay">Jugar de nuevo</button><button class="btn btn-quiet btn-sm" type="button" data-sum="close">Volver al salón</button></div></div>`;
    sum.hidden = false;
  }

  /* ── editor de mesas ── */
  function hitSlot(pt) { return SLOTS.find(s => Math.hypot(pt.x - s.x, pt.y - (s.y - 6)) < 40) || null; }
  function renumber() {
    const ord = id => { const [r, c] = id.split('-').map(Number); return r * 10 + c; };
    layout.sort((a, b) => ord(a.slot) - ord(b.slot)).forEach((l, i) => (l.n = i + 1));
    LOUNGE.n = layout.length + 1;
  }
  function editSlot(s) {
    const l = layout.find(x => x.slot === s.id);
    if (!l) layout.push({ slot: s.id, k: 'round', n: 0 });
    else if (l.k === 'round' && s.row !== 3) l.k = 'square';
    else { if (layout.length <= 2) { editNote('Dejá al menos dos mesas.'); return; } layout = layout.filter(x => x !== l); }
    renumber(); buildTables(); editNote();
    sfx('clink');
  }
  function editNote(extra) {
    const el = $s('sim-edit-bar'); if (!el) return;
    const n = layout.length + 1;
    el.querySelector('.ed-n').textContent = `Tu salón: ${n} mesas, ${TB.reduce((a, t) => a + t.seats.length, 0)} lugares`;
    el.querySelector('.ed-x').textContent = extra || '';
  }
  function startEdit() {
    if (game) endGame(true); if (day) endDay(true);
    editing = true; sel = null; renderCard();
    S.orders.filter(o => o.sim).forEach(o => clearTimeout(o.auto)); S.orders = S.orders.filter(o => !o.sim);
    people = people.filter(p => p.kind !== 'cust' && p.kind !== 'dog'); groups = []; vos = null; featured = null; fx = [];
    TB.forEach(t => { t.group = null; t.dirty = null; });
    setCam('auto');
    $s('salon').classList.add('editing'); $s('sim-edit-bar').hidden = false; editNote();
    banner('Acomodá tus mesas', 'Tocá un lugar vacío para sumar una mesa. Tocá una mesa para pasarla a cuadrada o sacarla.', 5);
  }
  function endEdit(reset) {
    if (reset) { layout = DEFAULT_LAYOUT.map(([slot, k, n]) => ({ slot, k, n })); LOUNGE.n = 8; buildTables(); editNote(); return; }
    editing = false;
    $s('salon').classList.remove('editing'); $s('sim-edit-bar').hidden = true;
    if (!tableN(S.mesa) || tableN(S.mesa).k === 'lounge') { S.mesa = vosTable().n; if (typeof renderAppAll === 'function') renderAppAll(); }
    seedScene([]);
    const n = layout.length + 1, sel2 = $s('l-mesas');
    if (sel2) sel2.value = n <= 6 ? 'Hasta 6' : n <= 15 ? '7 a 15' : n <= 30 ? '16 a 30' : 'Más de 30';
    banner('Listo, este es tu salón', `${n} mesas. Ahora mirá cómo funciona con tus lugares.`, 3.4);
  }

  /* ── sonido opcional, sintetizado en el navegador ── */
  const snd = { on: false, ctx: null, master: null, last: {} };
  function soundToggle() {
    const b = $s('sim-sound');
    if (snd.on) { snd.on = false; if (snd.ctx) snd.master.gain.setTargetAtTime(0, snd.ctx.currentTime, 0.12); }
    else {
      try {
        if (!snd.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) throw new Error('sin audio'); snd.ctx = new AC(); snd.master = snd.ctx.createGain(); snd.master.gain.value = 0; snd.master.connect(snd.ctx.destination); ambience(); }
        snd.ctx.resume(); snd.on = true; snd.master.gain.setTargetAtTime(0.5, snd.ctx.currentTime, 0.25);
      } catch (e) { snd.on = false; }
    }
    if (b) { b.setAttribute('aria-pressed', String(snd.on)); b.innerHTML = `${ic(snd.on ? 'sound' : 'mute')}${snd.on ? 'Sonido activado' : 'Sonido'}`; }
  }
  function noiseBuf(sec, brown) {
    const c = snd.ctx, n = Math.floor(c.sampleRate * sec), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    let l = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; if (brown) { l = (l + 0.02 * w) / 1.02; d[i] = l * 3.4; } else d[i] = w; }
    return b;
  }
  function ambience() {
    const c = snd.ctx;
    const src = c.createBufferSource(); src.buffer = noiseBuf(5, true); src.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 480; bp.Q.value = 0.6;
    const gn = c.createGain(); gn.gain.value = 0.22;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.19; const lg = c.createGain(); lg.gain.value = 0.07; lfo.connect(lg); lg.connect(gn.gain); lfo.start();
    src.connect(bp); bp.connect(gn); gn.connect(snd.master); src.start();
  }
  function tone(freqs, dur, vol, delay) {
    const c = snd.ctx, t0 = c.currentTime + (delay || 0);
    freqs.forEach((f, i) => { const o = c.createOscillator(), g2 = c.createGain(); o.type = 'sine'; o.frequency.value = f; g2.gain.setValueAtTime(0, t0); g2.gain.linearRampToValueAtTime(vol / (i + 1), t0 + 0.005); g2.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g2); g2.connect(snd.master); o.start(t0); o.stop(t0 + dur + 0.05); });
  }
  function noiseHit(dur, type, f, vol, trem) {
    const c = snd.ctx, t0 = c.currentTime, s = c.createBufferSource(); s.buffer = noiseBuf(dur, false);
    const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = 0.9;
    const g2 = c.createGain(); g2.gain.setValueAtTime(0, t0); g2.gain.linearRampToValueAtTime(vol, t0 + 0.04); g2.gain.setValueAtTime(vol, t0 + dur * 0.7); g2.gain.linearRampToValueAtTime(0, t0 + dur);
    if (trem) { const o = c.createOscillator(); o.frequency.value = trem; const og = c.createGain(); og.gain.value = vol * 0.5; o.connect(og); og.connect(g2.gain); o.start(t0); o.stop(t0 + dur); }
    s.connect(fl); fl.connect(g2); g2.connect(snd.master); s.start(t0);
  }
  function sfx(name) {
    if (!snd.on || !snd.ctx || !visible || document.hidden) return;
    const now = snd.ctx.currentTime; if (snd.last[name] && now - snd.last[name] < 0.15) return; snd.last[name] = now;
    if (name === 'bell') tone([1318.5, 2637, 1975.5], 1.4, 0.2);
    else if (name === 'print') { tone([2350], 0.06, 0.06); tone([2790], 0.06, 0.06, 0.08); }
    else if (name === 'grind') noiseHit(0.85, 'bandpass', 1500, 0.09, 38);
    else if (name === 'steam') noiseHit(1.4, 'highpass', 4200, 0.06);
    else if (name === 'clink') tone([3150 + Math.random() * 500, 4400], 0.22, 0.04);
    else if (name === 'ice') [0, 0.09, 0.17].forEach(d => tone([2500 + Math.random() * 900], 0.08, 0.05, d));
    else if (name === 'cash') { tone([1568], 0.18, 0.08); tone([2093], 0.4, 0.08, 0.1); }
    else if (name === 'wheel') for (let i = 0; i < 10; i++) tone([1500], 0.03, 0.04, i * (0.045 + i * 0.012));
  }

  /* ── controles ── */
  function syncSpeedUI() { document.querySelectorAll('[data-sp]').forEach(x => { x.setAttribute('aria-pressed', String(+x.dataset.sp === speed)); x.disabled = !!day || !!game; }); const p = $s('sim-play'); if (p) { p.innerHTML = running ? `${ic('pause')}Pausar` : `${ic('play')}Seguir`; p.setAttribute('aria-pressed', String(!running)); } }
  function bindUI() {
    $s('sim-card').addEventListener('click', e => {
      const b = e.target.closest('[data-sim]'); if (!b) return;
      if (b.dataset.sim === 'close') { sel = null; renderCard(); if (cam.mode === 'follow') setCam('auto'); }
      if (b.dataset.sim === 'unfollow') { setCam('auto'); renderCard(); }
      if (b.dataset.sim === 'demo') { $s('phone').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); go('carta'); }
      if (b.dataset.sim === 'ticket') { panelTab('barra'); $s('panel').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
    });
    const play = $s('sim-play');
    play.addEventListener('click', () => { running = !running; syncSpeedUI(); });
    document.querySelectorAll('[data-sp]').forEach(b => b.addEventListener('click', () => { speed = +b.dataset.sp; syncSpeedUI(); }));
    const peak = $s('sim-peak');
    peak.addEventListener('click', () => { if (game || editing) return; peakT = 10; spawnT = 0; spawn(true); addFeed('door', 'Hora pico: empieza a llenarse el salón'); banner('Hora pico', mode === 'sys' ? 'Entran muchos clientes juntos. Mirá cómo se ordenan las comandas en el riel.' : 'Entran muchos clientes juntos y la moza no da abasto.', 3); peak.disabled = true; setTimeout(() => (peak.disabled = false), 20000); });
    document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    document.querySelectorAll('[data-cam]').forEach(b => b.addEventListener('click', () => { setCam(b.dataset.cam === 'all' ? (cam.mode === 'all' ? 'auto' : 'all') : 'auto'); sel = null; renderCard(); }));
    $s('z-in').addEventListener('click', () => zoomAt(1.35, cssW / 2, cssH / 2));
    $s('z-out').addEventListener('click', () => zoomAt(1 / 1.35, cssW / 2, cssH / 2));
    $s('sim-day').addEventListener('click', () => (day ? endDay(true) : startDay()));
    $s('sim-game-btn').addEventListener('click', () => (game ? endGame() : startGame()));
    $s('sim-sound').addEventListener('click', soundToggle);
    $s('sim-edit').addEventListener('click', () => (editing ? endEdit() : startEdit()));
    $s('sim-edit-bar').addEventListener('click', e => { const b = e.target.closest('[data-ed]'); if (!b) return; if (b.dataset.ed === 'done') endEdit(); if (b.dataset.ed === 'reset') endEdit(true); });
    $s('sim-game').addEventListener('click', e => { const b = e.target.closest('[data-st]'); if (!b) return; if (b.dataset.st === 'exit') return endGame(); playerAct(b.dataset.st); });
    $s('sim-sum').addEventListener('click', e => { const b = e.target.closest('[data-sum]'); if (!b) return; $s('sim-sum').hidden = true; if (b.dataset.sum === 'again') startDay(); if (b.dataset.sum === 'replay') startGame(); });
    document.addEventListener('keydown', e => {
      if (!game || game.over || e.target.closest('input,textarea,select')) return;
      const st = GAME_ST.find(s => s[2] === e.key); if (st) { e.preventDefault(); playerAct(st[0]); }
    });
  }
