
  /* ── grupos de clientes ── */
  function newGroup(t, n, opts) {
    const g = Object.assign({ id: gid++, t, members: [], state: 'arrive', timer: 0, step: 0, order: null, items: [], takeaway: !t, sitAt: null, waitDone: false, ph: null }, opts || {});
    if (t) {
      const seats = t.seats.slice().sort(() => R() - 0.5).slice(0, n);
      seats.forEach((s, i) => {
        const p = mk(CX + rr(-5, 5), WH + 18 + i * 20, 'cust');
        p.seat = s; p.group = g; p.delay = i * 0.55;
        p.path = [{ x: p.x, y: 742 }, { x: CX, y: s.ay }, { x: s.x, y: s.ay }, { x: s.x, y: s.y }];
        p.ay = s.ay;
        g.members.push(p); people.push(p);
      });
      t.group = g;
    }
    groups.push(g);
    return g;
  }
  function flavor(g) {
    // variedad: alguien con notebook, un perro, una nena con su familia
    const n = g.members.length;
    if (n === 1 && R() < 0.4) { g.laptop = true; g.members[0].lk.glasses = R() < 0.5; }
    if (n >= 3 && R() < 0.45) { const k = g.members[n - 1]; k.kid = true; k.lk.name = rp(['Cata', 'Juani', 'Mili', 'Teo']); k.spd = 58; }
    if (n <= 2 && R() < 0.22) {
      const o = g.members[0]; const d = mk(o.x + 10, o.y + 8, 'dog', { fur: rp(['#C69A6A', '#3B2A20', '#E9DCC8', '#8E6A4A']), name: rp(['Rulo', 'Lola', 'Toto', 'Mora']) });
      d.owner = o; o.dog = d; d.delay = o.delay + 0.3; d.path = o.path.map(q => ({ x: q.x + 10, y: q.y + 6 })); d.pose = 'walk'; people.push(d);
    }
  }
  function spawn(takeawayOnly) {
    const custs = people.filter(p => p.kind === 'cust').length;
    if (custs > 26) return false;
    if (takeawayOnly || R() < 0.17) {
      if (groups.filter(g => g.takeaway && !g.dead).length >= (mode === 'nosys' ? 3 : 2)) return false;
      const g = newGroup(null, 1);
      const p = mk(CX, WH + 18, 'cust'); p.group = g; g.members.push(p); people.push(p);
      if (day) dayStats.clientes++;
      if (R() < 0.35) { p.lk.rider = true; p.lk.name = rp(['Leo', 'Facu', 'Gonza']); g.rider = true; }
      p.path = [{ x: CX, y: 742 }, { x: CX, y: AY.a0 }];
      p.ay = AY.a0;
      const ahead = groups.filter(q => q.takeaway && q !== g && !q.dead && q.state !== 'leave').length;
      g.q = ahead;
      const spot = mode === 'nosys' ? { x: P.caja.x, y: P.caja.y + ahead * 22 } : { x: P.caja.x + ahead * 24, y: P.caja.y };
      p.path.push({ x: spot.x, y: AY.a0 }, { x: spot.x, y: spot.y });
      addFeed('door', g.rider ? `${p.lk.name} vino a retirar un pedido para llevar` : `${p.lk.name} entró a pedir para llevar`);
      return true;
    }
    const v = mode === 'sys' ? vosTable() : null;
    const free = TB.filter(t => !t.group && !t.dirty && t !== v);
    if (!free.length) return takeawayOnly ? false : spawn(true);
    const t = rp(free);
    const n = t.k === 'round' ? (R() < 0.62 ? 2 : 1) : t.k === 'lounge' ? 3 : (R() < 0.45 ? 2 : R() < 0.6 ? 3 : 4);
    const g = newGroup(t, n);
    flavor(g);
    if (day) dayStats.clientes += n;
    addFeed('door', n === 1 ? `${g.members[0].lk.name} se sentó en la mesa ${t.n}` : `Llegaron ${n} clientes a la mesa ${t.n}`);
    return true;
  }
  function makeItems(n) {
    const agg = {};
    for (let i = 0; i < n; i++) {
      const l2 = [wpick(DRINKS)]; if (R() < 0.6) l2.push(wpick(FOOD));
      l2.forEach(id => {
        const p = byId(id); if (!p || !p.on) return;
        const mods = (KIND[id] === 'cup' && id !== 'espresso' && id !== 'v60' && R() < 0.3) ? ['Leche de avena'] : [];
        const key = id + mods.join();
        if (agg[key]) agg[key].qty++; else agg[key] = { id, name: p.name, qty: 1, mods, note: '' };
      });
    }
    const items = Object.values(agg);
    return items.length ? items : [{ id: 'cortado', name: 'Cortado', qty: 1, mods: [], note: '' }];
  }
  function orderTotal(items) { return items.reduce((s, it) => s + (byId(it.id) ? byId(it.id).price : 4000) * it.qty, 0); }
  function placeOrder(g) {
    const lead = g.members[0];
    const items = g.pre || makeItems(g.members.filter(m => !m.kid).length + (g.members.some(m => m.kid) ? 1 : 0));
    if (day) { const h = Math.floor(day.t / 3600); dayStats.hours[h] = (dayStats.hours[h] || 0) + 1; }
    let o;
    if (mode === 'sys') {
      o = createOrder({ mine: false, sim: true, where: g.takeaway ? 'llevar' : 'mesa', mesa: g.t ? g.t.n : 0, name: lead.lk.name, pickup: 'Ahora', items, total: orderTotal(items) });
      stats.pedidos++;
      say(lead, 'check', 1.6); float(lead.x, headY(lead) - 10, 'Pedido enviado', '#4C7A36');
      flight('ticket', { x: lead.x, y: headY(lead) + 8 }, () => railSlot(o), { label: g.takeaway ? 'LL' : 'M' + g.t.n, o, onDone: () => { o.railIn = clock; sfx('print'); } });
      addFeed('order', g.takeaway ? `${lead.lk.name} pidió para llevar: ${itemsText(items)}` : `La mesa ${g.t.n} pidió ${itemsText(items)}`);
      g.ph = { scr: 'sent', t: clock };
      cue(g, 2.2, 2.4, 3);
    } else {
      o = { id: 'P' + (++paperSeq), paper: true, sim: true, where: g.takeaway ? 'llevar' : 'mesa', mesa: g.t ? g.t.n : 0, name: lead.lk.name, items, total: orderTotal(items), status: 'nuevo', t0: Date.now() };
      paper.push(o);
    }
    g.order = o; M().orders++; dayStats.pedidos++; if (day) dayStats.ventas += o.total;
    renderStats();
    return o;
  }
  function setState(g, s) { g.state = s; g.timer = 0; g.step = 0; }
  const live = o => o && (o.paper ? paper.includes(o) : S.orders.includes(o));
  function sitDown(g) {
    g.members.forEach(m => { if (m.kind === 'cust') { m.pose = 'sit'; m.a = m.seat.a; } if (m.dog) { const d = m.dog; d.pose = 'lie'; d.x = m.seat.x + (m.seat.a === 0 ? -14 : m.seat.a === Math.PI ? 14 : 12); d.y = m.seat.y + 12; d.path = []; } });
    g.sitAt = clock;
  }
  function updGroup(g, dt) {
    g.timer += dt;
    const lead = g.members[0];
    if (g.vos) return updVos(g, dt);
    if (mode === 'nosys' && !g.sysOld) return updGroupNoSys(g, dt);
    switch (g.state) {
      case 'arrive':
        if (g.members.every(m => m.arrived)) {
          if (g.takeaway) { lead.pose = 'stand'; lead.a = -Math.PI / 2; g.sitAt = clock; }
          else sitDown(g);
          setState(g, 'scan');
        }
        break;
      case 'scan':
        if (g.step === 0) {
          g.step = 1; lead.phone = 1; lead.scan = 1; say(lead, 'qr', 1.6); g.ph = { scr: 'scan', t: clock };
          addFeed('qr', g.takeaway ? `${lead.lk.name} escaneó el QR de la caja` : `La mesa ${g.t.n} escaneó el QR`);
          cue(g, 2.4, 3.2, 2);
        }
        if (g.timer > 1.7) { lead.scan = 0; g.members.forEach((m, i) => { if (i > 0 && !m.kid && R() < 0.6) m.phone = 1; }); g.browse = rr(2.4, 3.8); g.pre = makeItems(g.members.filter(m => m.kind === 'cust' && !m.kid).length + (g.members.some(m => m.kid) ? 1 : 0)); g.ph = { scr: 'carta', t: clock }; setState(g, 'browse'); say(lead, 'dots', g.browse); }
        break;
      case 'browse':
        if (g.timer > g.browse) {
          g.members.forEach(m => (m.phone = 0));
          placeOrder(g);
          setState(g, 'wait');
          if (g.takeaway) { route(lead, { x: P.wait.x + (g.q || 0) * 18, y: P.wait.y }, AY.a0); lead.onArrive = () => { lead.pose = 'stand'; lead.a = -Math.PI / 2; }; }
          else if (g.laptop) g.members[0].act = 'laptop';
        }
        break;
      case 'wait':
        if (g.takeaway && !live(g.order) && g.step === 0) { setState(g, 'loyalty'); break; }
        if (!g.takeaway && !g.delivered && !live(g.order)) { g.items = []; setState(g, 'eat'); g.eatT = 6; break; }
        if (g.takeaway) {
          if (g.order.status === 'listo' && g.step === 0 && lead.arrived) {
            g.step = 1;
            if (!g.order.avisoT) { g.order.avisoT = clock; flight('bell', { x: P.pass.x, y: 40 }, () => ({ x: lead.x, y: headY(lead) }), { onDone: () => { say(lead, 'bell', 1.6); lead.phone = 1; setTimeout(() => (lead.phone = 0), 1200); } }); }
            setTimeout(() => {
              route(lead, P.pick, AY.a0);
              lead.onArrive = () => { lead.a = -Math.PI / 2; lead.hold = 'bag'; advance(g.order.id, 'entregado'); noteWait(g); addFeed('bag', `${lead.lk.name} retiró su pedido para llevar`); setState(g, 'loyalty'); };
            }, 700 / Math.max(1, speed));
          }
        } else if (g.delivered) { noteWait(g); setState(g, 'eat'); g.eatT = g.laptop ? rr(22, 30) : rr(12, 18); }
        else if (g.timer > 2 && R() < dt * 0.25) { const m = rp(g.members); if (!m.kid && m.act !== 'laptop') m.phone = m.phone ? 0 : 1; }
        break;
      case 'eat': eatTick(g, dt); if (g.timer > (g.eatT || 12)) { g.members.forEach(m => { if (m.act === 'laptop') m.act = null; }); setState(g, 'loyalty'); } break;
      case 'loyalty': loyaltyTick(g, dt); break;
      case 'leave': leaveTick(g); break;
    }
  }
  function eatTick(g, dt) {
    g.members.forEach(m => {
      if (m.kind !== 'cust') return;
      m.sipT -= dt; if (m.sipT <= 0) { m.sip = 1.2; m.sipT = rr(2.5, 6); }
      if (!m.gest && R() < dt * 0.05) gesture(m, rp(['laugh', 'talk', 'talk', 'lean', 'stretch']), rr(1.2, 2));
    });
    if (g.members.length >= 2 && !g.toasted && g.timer > 2.5 && R() < dt * 0.2) { g.toasted = true; g.members.forEach(m => { if (m.kind === 'cust') gesture(m, 'toast', 1.5); }); say(g.members[0], 'heart', 1.4); }
    if (R() < dt * 0.05) say(rp(g.members), 'heart', 1.4);
  }
  function loyaltyTick(g, dt) {
    const lead = g.members[0];
    const coffees = g.order && g.order.items ? g.order.items.filter(it => isDrink(it.id) && KIND[it.id] !== 'juice').reduce((s, it) => s + it.qty, 0) : 0;
    if (g.step === 0) {
      g.step = 1; lead.phone = 1; g.ph = { scr: 'sellos', t: clock, n: coffees };
      if (coffees) { say(lead, 'stamp', 1.3); float(lead.x, headY(lead) - 10, `+${coffees} ${coffees === 1 ? 'sello' : 'sellos'}`, '#B3202E'); stats.sellos += coffees; M().stamps += coffees; dayStats.sellos += coffees; renderStats(); addFeed('stamp', g.takeaway ? `${lead.lk.name} sumó ${coffees} ${coffees === 1 ? 'sello' : 'sellos'}` : `La mesa ${g.t.n} sumó ${coffees} ${coffees === 1 ? 'sello' : 'sellos'}`); }
      cue(g, 2.4, 6, 2);
    }
    if (g.step === 1 && g.timer > 1.5) {
      g.step = 2; say(lead, 'wheel', 1.4);
      const pool = S.prizes.filter(p => p.on && p.w > 0 && p.given < p.cap);
      const tot = pool.reduce((s, p) => s + p.w, 0); let r = R() * tot, pz = pool[0];
      for (const p of pool) { r -= p.w; if (r <= 0) { pz = p; break; } }
      g.ph = { scr: 'ruleta', t: clock, prize: pz ? pz.short : '' };
      sfx('wheel');
      if (pz) { pz.given++; g.prizeAt = clock + 1.1; g.prize = pz; addFeed('wheel', `${lead.lk.name} ganó ${pz.label} en la ruleta`); }
    }
    if (g.prize && g.prizeAt && clock > g.prizeAt) { float(lead.x, headY(lead) - 10, 'Ganó: ' + g.prize.short, '#8A5733'); g.prizeAt = 0; gesture(lead, 'cheer', 1.2); }
    if (g.step === 2 && g.timer > 3) {
      g.step = 3;
      if (R() < 0.72) {
        const r5 = R() < 0.84 ? 5 : 4;
        g.ph = { scr: 'stars', t: clock, r: r5 };
        say(lead, 'star', 1.3); float(lead.x, headY(lead) - 10, '★'.repeat(r5), '#C98A1E');
        stats.resenas++; S.googleInvites++; dayStats.resenas++; if (r5 === 5) M().good++; renderStats();
        addFeed('star', g.takeaway ? `${lead.lk.name} calificó con ${r5} estrellas` : `La mesa ${g.t.n} calificó la visita con ${r5} estrellas`);
        if (R() < 0.35) { S.feedback.unshift({ r: r5, tags: [rp(['Café', 'Atención', 'Ambiente'])], text: rp(REVIEWS), where: g.takeaway ? 'Para llevar' : 'Mesa ' + g.t.n, t: hhmm(Date.now()) }); if (S.feedback.length > 14) S.feedback.pop(); if (S.panelTab !== 'ruleta') { S.badge.ruleta++; renderPanelTabs(); } }
      }
    }
    if (g.step === 3 && g.timer > 4.4) {
      g.step = 4;
      const tot = g.order ? g.order.total : 0;
      g.ph = { scr: 'pay', t: clock, tot };
      say(lead, 'cash', 1.2); float(lead.x, headY(lead) - 10, fmt(tot), '#2B1A12'); sfx('cash');
      stats.ventas += tot; M().sales += tot; renderStats();
      addFeed('pay', g.takeaway ? `${lead.lk.name} se llevó su café` : `La mesa ${g.t.n} pagó ${fmt(tot)} desde el celular`);
    }
    if (g.step === 4 && g.timer > 5.6) leaveNow(g);
  }
  function leaveNow(g) {
    g.members.forEach((m, i) => { m.phone = 0; m.act = null; m.delay = i * 0.35; if (m.kind === 'cust') toDoor(m); });
    if (g.t) { g.t.dirty = { items: g.items.length ? g.items : [{ k: 'cup' }] }; g.t.group = null; }
    stats.atendidos += g.members.length; M().served += g.members.length; renderStats();
    g.ph = null; if (featured === g) featured = null;
    setState(g, 'leave');
  }
  function leaveTick(g) {
    g.members.forEach(m => { if (m.y > WH + 10) m.gone = true; if (m.dog && m.dog.y > WH + 10) m.dog.gone = true; });
    if (g.members.every(m => m.gone)) {
      g.dead = true;
      const gone = new Set(); g.members.forEach(m => { gone.add(m); if (m.dog) gone.add(m.dog); });
      people = people.filter(p => !gone.has(p)); if (sel === g || (sel && sel.t === g.t && !g.t)) sel = null;
    }
  }

  /* ── sin sistema: el mozo toma el pedido, la barra recibe papel y la cuenta llega al final ── */
  function updGroupNoSys(g, dt) {
    const lead = g.members[0];
    if (g.state === 'call' || g.state === 'wait' || g.state === 'bill' || g.state === 'queue') g.waitTotal = (g.waitTotal || 0) + dt;
    switch (g.state) {
      case 'arrive':
        if (g.members.every(m => m.arrived)) {
          if (g.takeaway) { lead.pose = 'stand'; lead.a = -Math.PI / 2; g.sitAt = clock; setState(g, 'queue'); }
          else { sitDown(g); lead.hold = 'menu'; setState(g, 'menu'); g.menuT = rr(2.5, 4); }
        }
        break;
      case 'menu':
        if (g.timer > g.menuT) { lead.hold = null; setState(g, 'call'); g.callAt = clock; gesture(lead, 'raise', 2.2); say(lead, 'hand', 2); }
        break;
      case 'call': {
        const w = clock - g.callAt;
        if (g.timer > 3.4) { g.timer = 0; gesture(rp(g.members.filter(m => m.kind === 'cust')), 'raise', 2); say(lead, w > 14 ? 'angry' : 'hand', 1.8); if (w > 9) g.members.forEach(m => (m.mood = -1)); }
        if (w > 9 && !g.warned) { g.warned = true; addFeed('clock', `La mesa ${g.t.n} espera que le tomen el pedido`, true); cue(g, 2.2, 2.6, 2); }
        if (w > 24 && !g.taking) {
          M().walk++; renderStats();
          addFeed('alert', `La mesa ${g.t.n} se cansó de esperar y se fue`, true);
          float(lead.x, headY(lead) - 10, 'Se fueron sin pedir', '#B3362C');
          g.items = []; g.t.dirty = null;
          g.members.forEach((m, i) => { m.delay = i * 0.3; if (m.kind === 'cust') toDoor(m); });
          g.t.group = null; setState(g, 'leave');
        }
        break;
      }
      case 'taking': break; // el mozo está anotando
      case 'wait':
        if (g.takeaway) {
          if (g.order && g.order.status === 'listo' && g.step === 0) {
            g.step = 1; say(barista, 'talk', 1.4); float(P.pass.x, 30, '¡' + lead.lk.name + '!', '#2B1A12');
            route(lead, P.pick, AY.a0);
            lead.onArrive = () => { lead.hold = 'bag'; setPaper(g.order, 'entregado'); noteWait(g); addFeed('bag', `${lead.lk.name} retiró su pedido`); g.members.forEach(m => m.kind === 'cust' && toDoor(m)); stats.atendidos++; M().served++; setState(g, 'leave'); };
          }
        } else if (g.delivered) { noteWait(g); setState(g, 'eat'); g.eatT = g.laptop ? rr(20, 26) : rr(11, 16); }
        else if (g.timer > 5 && R() < dt * 0.3) { say(lead, 'clock', 1.4); }
        break;
      case 'eat': eatTick(g, dt); if (g.timer > g.eatT) { setState(g, 'bill'); g.callAt = clock; gesture(lead, 'raise', 2); say(lead, 'bill', 2); } break;
      case 'bill':
        if (g.timer > 4 && !g.billing) { g.timer = 0; gesture(lead, 'raise', 2); say(lead, clock - g.callAt > 12 ? 'angry' : 'bill', 1.8); }
        break;
      case 'paying':
        if (g.timer > 1.6) {
          const tot = g.order ? g.order.total : 0;
          float(lead.x, headY(lead) - 10, fmt(tot), '#2B1A12'); stats.ventas += tot; M().sales += tot;
          const waited = (g.waitTotal || 0);
          if (waited > 30 && R() < 0.45) { M().bad++; float(lead.x + 16, headY(lead) - 24, '★★', '#B3362C'); addFeed('star', `La mesa ${g.t.n} dejó 2 estrellas: "${rp(BAD)}"`, true); }
          else addFeed('pay', `La mesa ${g.t.n} pagó en efectivo y se fue`);
          renderStats(); leaveNow(g);
        }
        break;
      case 'queue':
        if (g.timer > 5 && R() < dt * 0.3) say(lead, 'clock', 1.4);
        break;
      case 'leave': leaveTick(g); break;
    }
  }
  function setPaper(o, st) { o.status = st; if (st === 'entregado') paper = paper.filter(x => x !== o); }

  /* ── vos: la mesa de la demo ── */
  function makeVos() {
    if (mode !== 'sys') return;
    const t = vosTable(); if (!t || t.group) return;
    const g = newGroup(t, 0, { vos: true, state: 'idle' });
    const p = mk(t.seats[0].x, t.seats[0].y, 'cust', look({ name: S.club.member, skin: '#E8B894', hair: '#5C3B22', hs: 'long', shirt: '#B3202E', pants: '#2F3B52', glasses: false, beard: false }));
    p.seat = t.seats[0]; p.group = g; p.pose = 'sit'; p.a = p.seat.a; p.arrived = true; p.ay = p.seat.ay;
    g.members.push(p); people.push(p); vos = g;
    g.items = [{ id: 'cortado', k: 'cup' }];
  }
  function updVos(g, dt) {
    const p = g.members[0];
    const o = S.orders.find(o => o.mine && !o.simSeen);
    if (o) {
      o.simSeen = true; g.order = o; g.delivered = false; g.sitAt = clock; g.waitDone = false;
      p.phone = 1; say(p, 'check', 1.8); float(p.x, headY(p) - 10, 'Pedido desde tu celular', '#4C7A36');
      setTimeout(() => (p.phone = 0), 1800);
      flight('ticket', { x: p.x, y: headY(p) + 8 }, () => railSlot(o), { label: 'VOS', o, onDone: () => { o.railIn = clock; sfx('print'); } });
      addFeed('you', `Pediste desde tu celular en la mesa ${g.t.n}`);
      stats.pedidos++; renderStats();
      cue(g, 2.3, 3, 4);
    }
    if (g.order && g.order.where === 'llevar' && g.order.status === 'listo' && !g.order.simBell) { g.order.simBell = true; say(p, 'bell', 2); addFeed('ready', 'Tu pedido para llevar está listo en la barra'); }
    p.sipT -= dt; if (p.sipT <= 0 && g.items.some(i => DRINK_K.includes(i.k))) { p.sip = 1.2; p.sipT = rr(3, 7); }
    if (!p.phone && R() < dt * 0.05) { p.phone = 1; setTimeout(() => (p.phone = 0), 2400); }
  }

  /* ── semilla inicial, coherente con el panel ── */
  function seedScene(orders, empty) {
    people = []; groups = []; fx = []; sel = null; vos = null; featured = null; paper = []; barista2 = null;
    TB.forEach(t => { t.group = null; t.dirty = null; });
    barista = mk(P.barHome.x, BAR_Y, 'barista', { skin: '#E8B894', hair: '#2A1B12', hs: 'bun', shirt: '#F3EADB', pants: '#2A2A2A', name: BARISTA, glasses: false, beard: false, h: 1 });
    mozo = mk(P.mozoHome.x, P.mozoHome.y, 'mozo', { skin: '#D49B74', hair: '#3D2A1C', hs: 'pony', shirt: '#2B1A12', pants: '#2A2A2A', name: 'Sol', glasses: false, beard: false, h: 1 });
    barista.pose = 'stand'; mozo.pose = 'stand'; barista.arrived = mozo.arrived = true; mozo.ay = AY.a0; barista.a = Math.PI / 2; mozo.a = Math.PI;
    people.push(barista, mozo);
    makeVos();
    const seatGroup = (n, k, opts) => {
      const t = tableN(n); if (!t || t.group) return null;
      const g = newGroup(t, 0, opts);
      t.seats.slice(0, k).forEach(s => { const p = mk(s.x, s.y, 'cust'); p.seat = s; p.group = g; p.pose = 'sit'; p.a = s.a; p.arrived = true; p.ay = s.ay; g.members.push(p); people.push(p); });
      g.sitAt = clock - rr(4, 9);
      return g;
    };
    if (mode === 'sys') {
      (orders || []).forEach(o => {
        if (o.where === 'mesa') {
          const g = seatGroup(o.mesa, o.mesa === 3 ? 3 : 2, { state: 'wait' });
          if (g) { g.order = o; g.members[0].lk.name = o.name; o.railIn = clock - rr(2, 6); }
        } else {
          const g = newGroup(null, 1, { state: 'wait', takeaway: true });
          const p = mk(P.wait.x, P.wait.y, 'cust'); p.lk.name = o.name; p.group = g; p.pose = 'stand'; p.a = -Math.PI / 2; p.arrived = true; p.ay = AY.a0;
          g.members.push(p); people.push(p); g.order = o; g.sitAt = clock - 5; o.railIn = clock - 4;
        }
      });
    } else {
      // sin sistema arranca con varias mesas esperando que les tomen el pedido
      [[3, 2, 9], [2, 2, 4], [7, 1, 6], [9, 3, 2], [12, 2, 7]].forEach(([n, k, ago]) => { const g = seatGroup(n, k, { state: 'call' }); if (g) { g.callAt = clock - ago; g.timer = ago % 3.4; g.waitTotal = ago; if (ago > 5) g.members.forEach(m => (m.mood = -1)); gesture(g.members[0], 'raise', 2); say(g.members[0], ago > 8 ? 'angry' : 'hand', 1.8); } });
      const g2 = seatGroup(5, 2, { state: 'menu' }); if (g2) { g2.menuT = 3; g2.members[0].hold = 'menu'; }
    }
    const eating = (n, k, ids) => {
      const g = seatGroup(n, k, { state: 'eat', delivered: true, waitDone: true }); if (!g) return;
      g.items = ids.map(id => ({ id, k: KIND[id] })); g.eatT = rr(8, 18); g.timer = rr(0, 6);
      g.order = { items: ids.map(id => ({ id, qty: 1, name: id })), total: orderTotal(ids.map(id => ({ id, qty: 1 }))) };
    };
    if (!empty && mode === 'sys') {
      eating(1, 2, ['flatwhite', 'cappuccino', 'medialunas']);
      eating(8, 3, ['cappuccino', 'cortado', 'iced', 'alfajor']);
      eating(6, 1, ['v60', 'budin']);
      eating(10, 2, ['submarino', 'cortado', 'tostado']);
    } else if (!empty) { eating(8, 3, ['cappuccino', 'cortado', 'iced', 'alfajor']); eating(10, 2, ['submarino', 'cortado', 'tostado']); }
    spawnT = 3;
  }
