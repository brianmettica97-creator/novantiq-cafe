
  /* ── la barra: cada pedido se arma en pasos visibles ── */
  const HOT = ['espresso', 'cortado', 'flatwhite', 'cappuccino'];
  const COLD = ['iced', 'coldbrew', 'jugo'];
  const FILT = ['v60', 'chemex'];
  const GRILL = ['tostado', 'palta'];
  function planFor(o) {
    const its = o.items, has = ids => its.some(it => ids.includes(it.id));
    const nEsp = its.filter(it => HOT.includes(it.id)).reduce((s, it) => s + it.qty, 0);
    const milk = its.find(it => HOT.includes(it.id) && it.id !== 'espresso');
    const T = [];
    if (nEsp) { T.push({ st: 'grinder', dur: 0.9, fx: 'grind' }); T.push({ st: 'machine', dur: 1.9 + 0.45 * Math.min(3, nEsp - 1), fx: 'brew', ring: true }); }
    if (milk || has(['submarino'])) T.push({ st: 'wand', dur: 1.6, fx: 'steam', ring: true });
    if (milk) T.push({ st: 'machine', dur: 1.5, fx: 'art', art: ART[milk.id] || 'heart' });
    if (has(['submarino'])) T.push({ st: 'machine', dur: 0.7, fx: 'choco' });
    if (has(FILT)) T.push({ st: 'v60', dur: 2.4, fx: 'pour', ring: true, side: 1 });
    if (has(COLD)) T.push({ st: 'fridge', dur: 1.2, fx: 'ice', side: 1 });
    if (has(GRILL)) T.push({ st: 'grill', dur: 2.3, fx: 'grill', ring: true, side: 1 });
    if (its.some(it => !isDrink(it.id) && !GRILL.includes(it.id))) T.push({ st: 'vitrina', dur: 1, fx: 'tongs', side: 1 });
    T.forEach((t, i) => { t.i = i; t.by = null; t.done = false; });
    T.push({ st: 'pass', dur: 0.6, fx: 'pass', pass: true, i: T.length, by: null, done: false });
    return T;
  }
  const facing = st => (st === 'vitrina' || st === 'pass' ? Math.PI / 2 : -Math.PI / 2);
  function prepQueue() {
    if (mode === 'sys') return S.orders.filter(o => (o.sim || (o.mine && !window.__VIDEO)) && (o.status === 'nuevo' || o.status === 'preparando') && (o.railIn != null || o.mine)).sort((a, c) => (c.mine ? 1 : 0) - (a.mine ? 1 : 0) || a.t0 - c.t0);
    return paper.filter(o => o.dropped && (o.status === 'nuevo' || o.status === 'preparando')).sort((a, c) => a.t0 - c.t0);
  }
  function setStatus(o, st) { if (o.paper) setPaper(o, st); else advance(o.id, st); }
  function nextTask(b) {
    const q = prepQueue();
    const pick = pref => {
      for (const o of q) {
        if (!o.plan) o.plan = planFor(o);
        const c = o.plan.filter(t => !t.done && !t.by && !t.pass && pref(t));
        if (c.length) return { o, t: c[0] };
        const pass = o.plan.find(t => t.pass);
        if (!pass.by && !pass.done && o.plan.every(t => t.pass || t.done)) return { o, t: pass };
      }
      return null;
    };
    if (b === barista2) return pick(t => t.side);
    return pick(t => !barista2 || !t.side) || pick(() => true);
  }
  function updBarista(b, dt) {
    if (b.player) return updPlayer(b, dt);
    if (b.leavingBar) { if (!b.path.length && b.arrived) { b.gone = true; } return; }
    if (mode === 'nosys' && b === barista && !b.job) {
      const q = groups.find(g => g.takeaway && g.state === 'queue' && g.members[0].arrived && !g.taken);
      if (q) { q.taken = true; b.job = { k: 'caja', g: q, t: 0 }; barTo(b, P.cajaIn.x); return; }
    }
    if (!b.job) {
      const nt = nextTask(b);
      if (nt) {
        nt.t.by = b; b.job = { k: 'task', o: nt.o, task: nt.t, t: 0 };
        if (nt.o.status === 'nuevo') { setStatus(nt.o, 'preparando'); nt.o.prepAt = clock; addFeed('bar', `${b.lk.name} empezó el pedido ${nt.o.where === 'mesa' ? 'de la mesa ' + nt.o.mesa : 'de ' + nt.o.name}`); }
        barTo(b, STATION_X[nt.t.st] + (b === barista2 && nt.t.st === 'pass' ? 14 : 0));
        b.look = 1;
      } else {
        const home = b === barista2 ? P.bar2Home : P.barHome;
        if (!b.path.length && Math.abs(b.x - home.x) > 2) barTo(b, home.x);
        else if (!b.path.length) { b.pose = 'stand'; b.a = Math.PI / 2; b.work = 0; }
      }
      return;
    }
    const j = b.job;
    if (j.k === 'caja') {
      if (!b.arrived) return;
      j.t += dt; b.a = Math.PI / 2; b.pose = 'stand'; b.work = 'write';
      if (j.t > 2) {
        const g = j.g; const o = placeOrder(g); o.dropped = true; float(g.members[0].x, headY(g.members[0]) - 10, fmt(o.total), '#2B1A12');
        stats.ventas += o.total; M().sales += o.total;
        b.work = 0; b.job = null; setState(g, 'wait');
        const p0 = g.members[0]; route(p0, { x: P.wait.x + rr(-6, 18), y: P.wait.y }, AY.a0); p0.onArrive = () => { p0.pose = 'stand'; p0.a = -Math.PI / 2; };
        groups.filter(x => x.takeaway && x.state === 'queue').forEach((x, i) => { const m = x.members[0]; route(m, { x: P.caja.x, y: P.caja.y + i * 22 }, AY.a0); });
      }
      return;
    }
    if (!live(j.o) || j.o.status === 'listo' || j.o.status === 'entregado') { if (j.task) j.task.by = null; b.job = null; b.work = 0; return; }
    if (!b.arrived) return;
    const T = j.task;
    j.t += dt; b.pose = 'stand'; b.a = facing(T.st); b.work = T.fx; b.workK = Math.min(1, j.t / T.dur); b.workSt = T.st; b.art = T.art;
    taskFx(b, T, dt);
    if (j.t >= T.dur) {
      T.done = true; b.work = 0; b.job = null;
      if (T.pass) {
        setStatus(j.o, 'listo'); j.o.readyAt = clock; sfx('bell');
        fx.push({ k: 'ding', x: P.pass.x, y: 52, t: 0, life: 1.2 });
        addFeed('ready', `El pedido ${j.o.where === 'mesa' ? 'de la mesa ' + j.o.mesa : 'de ' + j.o.name} está listo`);
        if (j.o.where === 'mesa' && mode === 'sys') flight('bell', { x: P.pass.x, y: 40 }, () => ({ x: mozo.x, y: headY(mozo) }), { onDone: () => say(mozo, 'bell', 1.2) });
        if (game) gameDone(j.o);
        const g = groups.find(q => q.order === j.o); if (g) cue({ x: P.pass.x, y: 70 }, 2.4, 2, 2);
      }
    }
  }
  function taskFx(b, T, dt) {
    const x = STATION_X[T.st];
    if (T.fx === 'grind' && R() < dt * 16) fx.push({ k: 'grain', x: x + rr(-3, 3), y: 6, t: 0, life: 0.5 });
    if (T.fx === 'brew' && R() < dt * 5) puff(rr(x - 30, x + 30), -2);
    if (T.fx === 'steam' && R() < dt * 16) puff(x + rr(-4, 4), 14, true);
    if (T.fx === 'grill' && R() < dt * 6) puff(x + rr(-8, 8), 6);
    if (T.fx === 'pour' && R() < dt * 4) puff(x + rr(-3, 3), 4);
    if (b.workK > 0 && !b.sfxOn) { b.sfxOn = true; if (T.fx === 'grind') sfx('grind'); if (T.fx === 'steam') sfx('steam'); if (T.fx === 'ice') sfx('ice'); }
    if (b.workK >= 1) b.sfxOn = false;
    if (T.fx === 'brew' || T.fx === 'art') cue({ x, y: 30 }, 2.6, 1.4, 1);
  }
  function needSecond() {
    if (game || mode !== 'sys') return false;
    return prepQueue().length >= 3 || peakT > 0 || (day && dayRate() > 1.4);
  }
  function updSecond(dt) {
    if (!barista2 && needSecond() && !editing) {
      barista2 = mk(P.back.x, BAR_Y, 'barista', { skin: '#C98E6B', hair: '#1E1E1E', hs: 'short', shirt: '#F3EADB', pants: '#2A2A2A', name: 'Nico', glasses: false, beard: true, h: 1.03 });
      barista2.arrived = false; barTo(barista2, P.bar2Home.x); people.push(barista2); barista2.idleT = 0;
      addFeed('bar', 'Se sumó Nico a la barra para la hora pico');
      say(barista2, 'hi', 1.4);
    }
    if (barista2) {
      updBarista(barista2, dt);
      if (!barista2.job && !needSecond()) { barista2.idleT += dt; if (barista2.idleT > 12 && !barista2.leavingBar) { barista2.leavingBar = true; barTo(barista2, P.back.x); } }
      else barista2.idleT = 0;
      if (barista2.gone) { people = people.filter(p => p !== barista2); barista2 = null; }
    }
  }

  /* ── el mozo ── */
  function updMozo(m, dt) {
    if (mode === 'nosys' && !m.job) {
      const call = groups.filter(g => g.state === 'call' && !g.taking && !g.dead).sort((a, b) => a.callAt - b.callAt)[0];
      const ready = paper.find(o => o.status === 'listo' && o.where === 'mesa' && !o.picked);
      const bill = groups.filter(g => g.state === 'bill' && !g.billing).sort((a, b) => a.callAt - b.callAt)[0];
      if (m.notes && m.notes.length && (!call || m.notes.length >= 2)) { m.job = { k: 'drop', t: 0 }; route(m, P.pick, AY.a0); return; }
      if (ready) { ready.picked = true; m.job = { k: 'deliver', o: ready, step: 'pick', t: 0 }; route(m, P.pick, AY.a0); return; }
      if (call) { call.taking = true; m.job = { k: 'take', g: call, t: 0 }; route(m, call.t.serve, call.t.serve.ay); return; }
      if (bill) { bill.billing = true; m.job = { k: 'bill', g: bill, step: 'caja', t: 0 }; route(m, P.pick, AY.a0); return; }
    }
    if (!m.job) {
      const o = mode === 'sys' ? S.orders.filter(o => o.status === 'listo' && o.where === 'mesa' && !o.picked && tOf(o)).sort((a, c) => a.t0 - c.t0)[0] : null;
      if (o) { o.picked = true; m.job = { k: 'deliver', o, step: 'pick', t: 0 }; route(m, P.pick, AY.a0); return; }
      const tb = TB.find(t => t.dirty && !t.dirty.taken);
      if (tb) { tb.dirty.taken = true; m.job = { k: 'clear', tb, step: 'go', t: 0 }; route(m, tb.serve, tb.serve.ay); return; }
      if (!m.path.length && dist(m, P.mozoHome) > 2) route(m, P.mozoHome, AY.a0);
      else if (!m.path.length) { m.pose = 'stand'; m.a = Math.PI; }
      return;
    }
    const j = m.job;
    if (!m.path.length && m.arrived) j.t += dt; else return;
    m.pose = 'stand';
    if (j.k === 'take') {
      const g = j.g; m.a = Math.atan2(g.t.y - m.y, g.t.x - m.x); m.work = 'write'; m.hold = 'pad';
      if (g.dead || !g.t) { m.job = null; m.work = 0; m.hold = null; return; }
      if (j.t === dt || !g.takingSet) { g.takingSet = true; setState(g, 'taking'); say(m, 'pad', 2.2); }
      if (j.t > 2.4) {
        const o = placeOrder(g); m.notes = (m.notes || []).concat(o);
        setState(g, 'wait'); g.members.forEach(x => (x.mood = 0));
        addFeed('order', `Sol anotó el pedido de la mesa ${g.t.n} en papel`);
        m.work = 0; m.hold = null; m.job = null;
      }
      return;
    }
    if (j.k === 'drop') {
      m.a = -Math.PI / 2;
      if (j.t > 0.8) { (m.notes || []).forEach(o => { o.dropped = true; o.t0 = Date.now(); }); fx.push({ k: 'paperdrop', x: P.pass.x - 10, y: 74, t: 0, life: 1 }); addFeed('bar', `Sol dejó ${m.notes.length === 1 ? 'una comanda' : m.notes.length + ' comandas'} en la barra`); m.notes = []; m.job = null; }
      return;
    }
    if (j.k === 'bill') {
      const g = j.g;
      if (j.step === 'caja') { m.a = -Math.PI / 2; if (j.t > 1.2) { m.hold = 'bill'; j.step = 'go'; j.t = 0; route(m, g.t.serve, g.t.serve.ay); } return; }
      if (j.step === 'go') { m.a = Math.atan2(g.t.y - m.y, g.t.x - m.x); if (j.t > 0.4 && g.state === 'bill') { setState(g, 'paying'); } if (j.t > 2) { m.hold = null; m.job = null; route(m, P.mozoHome, AY.a0); } return; }
    }
    if (j.k === 'clear') {
      if (j.step === 'go') {
        m.a = Math.atan2(j.tb.y - m.y, j.tb.x - m.x); m.work = 'wipe';
        if (j.t > 0.7) {
          m.work = 0; m.hold = 'dirty'; m.tray = (j.tb.dirty && j.tb.dirty.items) || []; j.tb.dirty = null; j.n = (j.n || 0) + 1;
          const next = j.n < 2 && TB.filter(t => t.dirty && !t.dirty.taken).sort((a, b) => dist(a, j.tb) - dist(b, j.tb))[0];
          if (next && dist(next, j.tb) < 260) { next.dirty.taken = true; j.tb = next; j.t = 0; route(m, next.serve, next.serve.ay); }
          else { j.step = 'bus'; j.t = 0; route(m, P.bus, AY.a0); }
        }
      } else if (j.step === 'bus') { m.a = Math.PI; if (j.t > 0.5) { bus = Math.min(6, bus + 2); busT = 0; m.hold = null; m.tray = null; m.job = null; sfx('clink'); route(m, P.mozoHome, AY.a0); } }
      return;
    }
    if (j.step === 'pick') {
      m.a = -Math.PI / 2;
      if (j.t > 0.5) { m.hold = 'tray'; m.tray = j.o.items; j.step = 'go'; j.t = 0; const t = tOf(j.o); if (!t) { m.job = null; m.hold = null; return; } route(m, t.serve, t.serve.ay); }
      return;
    }
    if (j.step === 'go') {
      const t = tOf(j.o); if (!t) { m.job = null; m.hold = null; return; }
      m.a = Math.atan2(t.y - m.y, t.x - m.x); m.work = 'serve';
      const g = j.o.mine ? vos : groups.find(gg => gg.order === j.o);
      const its = [];
      j.o.items.forEach(it => { for (let q = 0; q < Math.min(it.qty, 4); q++) its.push({ id: it.id, k: KIND[it.id] || 'cup', art: ART[it.id] }); });
      const k = Math.min(its.length, Math.floor(j.t / 0.28));
      if (g && !g.vos) g.items = its.slice(0, k);
      if (j.t > Math.max(0.7, its.length * 0.28 + 0.2)) {
        if (g) { g.items = (j.o.mine ? g.items.concat(its) : its).slice(-6); g.delivered = true; g.members.forEach(x => { if (x.kind === 'cust') { gesture(x, 'cheer', 1); } }); say(g.members[0], 'heart', 1.4); }
        if (j.o.paper) setPaper(j.o, 'entregado'); else if (j.o.status === 'listo') advance(j.o.id, 'entregado');
        m.hold = null; m.tray = null; m.work = 0;
        addFeed('serve', j.o.mine ? 'Sol te llevó el pedido a la mesa' : `Sol llevó el pedido a la mesa ${j.o.mesa}`);
        if (j.o.mine) toast('Te dejamos el pedido en la mesa', 'Que lo disfrutes.', 'check');
        if (g) cue(g, 2.4, 2.2, 3);
        m.job = null; route(m, P.mozoHome, AY.a0);
      }
    }
  }

  /* ── modo barista: la barra queda en tus manos ── */
  const GAME_ST = [['grinder', 'Moler', '1'], ['machine', 'Espresso', '2'], ['wand', 'Leche', '3'], ['v60', 'Filtrado', '4'], ['fridge', 'Heladera', '5'], ['grill', 'Plancha', '6'], ['vitrina', 'Vitrina', '7'], ['pass', 'Entregar', '8']];
  function gameSteps(o) { if (!o.gsteps) { const sts = []; planFor(o).forEach(t => { if (!sts.includes(t.st)) sts.push(t.st); }); o.gsteps = sts.map(st => ({ st, done: false })); } return o.gsteps; }
  function gameOrder() { return S.orders.filter(o => (o.sim || o.mine) && (o.status === 'nuevo' || o.status === 'preparando') && o.railIn != null).sort((a, c) => a.t0 - c.t0)[0] || null; }
  function playerAct(st) {
    if (!game || game.over) return;
    const b = game.b; const o = gameOrder();
    if (!o) { gameMsg('Esperá: todavía no entró ningún pedido.'); return; }
    const steps = gameSteps(o);
    const step = steps.find(s => s.st === st && !s.done);
    const restDone = steps.filter(s => s.st !== 'pass').every(s => s.done);
    if (!step) { game.miss++; gameMsg('Ese paso no va en este pedido.'); shakeBtn(st); return; }
    if (st === 'pass' && !restDone) { game.miss++; gameMsg('Primero terminá el pedido, después entregalo.'); shakeBtn(st); return; }
    if (b.job) { b.queued = st; return; }
    startPlayerStep(b, o, step);
  }
  function startPlayerStep(b, o, step) {
    if (o.status === 'nuevo') { advance(o.id, 'preparando'); o.prepAt = clock; }
    const t = planFor(o).find(x => x.st === step.st) || { st: step.st, dur: 0.7, fx: 'pass' };
    b.job = { k: 'gstep', o, step, task: Object.assign({}, t, { dur: Math.min(1.1, t.dur * 0.55) }), t: 0 };
    barTo(b, STATION_X[step.st]);
    renderGame();
  }
  function updPlayer(b, dt) {
    if (b.entering) { if (b.arrived) b.entering = false; return; }
    const j = b.job;
    if (!j) { if (b.queued) { const st = b.queued; b.queued = null; playerAct(st); } else if (!b.path.length) { b.pose = 'stand'; b.a = Math.PI / 2; b.work = 0; } return; }
    if (!b.arrived) return;
    j.t += dt; b.pose = 'stand'; b.a = facing(j.task.st); b.work = j.task.fx; b.workK = Math.min(1, j.t / j.task.dur); b.workSt = j.task.st; b.art = j.task.art;
    taskFx(b, j.task, dt);
    if (j.t >= j.task.dur) {
      j.step.done = true; b.work = 0; b.job = null;
      if (j.step.st === 'pass') {
        advance(j.o.id, 'listo'); j.o.readyAt = clock; sfx('bell'); fx.push({ k: 'ding', x: P.pass.x, y: 52, t: 0, life: 1.2 });
        if (j.o.where === 'mesa') flight('bell', { x: P.pass.x, y: 40 }, () => ({ x: mozo.x, y: headY(mozo) }), { onDone: () => say(mozo, 'bell', 1.2) });
        gameDone(j.o);
      }
      renderGame();
    }
  }
