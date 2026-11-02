
  /* ── cámara tipo transmisión ── */
  const cam = { x: VW / 2, y: TOP + VH / 2, z: 1, mode: 'auto', follow: null, idle: 0, shot: null, pend: [], breathe: 0 };
  const scl = () => base * cam.z;
  function w2s(x, y) { const s = scl(); return { x: (x - cam.x) * s + cssW / 2, y: (y - cam.y) * s + cssH / 2 }; }
  function s2w(sx, sy) { const s = scl(); return { x: (sx - cssW / 2) / s + cam.x, y: (sy - cssH / 2) / s + cam.y }; }
  function clampCam(c) {
    const s = base * c.z, hw = cssW / (2 * s), hh = cssH / (2 * s);
    c.x = VW > 2 * hw ? clamp(c.x, hw, VW - hw) : VW / 2;
    c.y = VH > 2 * hh ? clamp(c.y, TOP + hh, WH - hh) : TOP + VH / 2;
  }
  const ZMAX = () => (cssW < 480 ? 3.4 : 2.9);
  function tgtPos(t) {
    if (!t) return null;
    if (t.members) {
      const ms = t.members.filter(m => m.kind !== 'dog' && !m.gone);
      if (t.t && t.state !== 'leave' && t.state !== 'arrive') return { x: t.t.x, y: t.t.y - 18 };
      if (!ms.length) return null;
      return { x: ms.reduce((a, m) => a + m.x, 0) / ms.length, y: ms.reduce((a, m) => a + m.y, 0) / ms.length - 20 };
    }
    if (t.kind) return { x: t.x, y: t.y - 22 };
    return { x: t.x, y: t.y };
  }
  /* los momentos piden cámara; el director elige cuál mostrar */
  function cue(target, z, dur, pri) {
    if (!active || game || editing) return;
    const c = { target, z: Math.min(z, ZMAX()), dur: dur || 2.5, pri: pri || 1, at: clock };
    if (target && target.vos) c.pri += 2;
    const cur = cam.shot;
    if (!cur || (clock > cur.until) || (c.pri > cur.pri && clock - cur.start > 0.9) || (c.pri >= cur.pri && clock - cur.start > 2.2 && cur.target !== target)) startShot(c);
    else if (cur.target === target) cur.until = Math.max(cur.until, clock + c.dur * 0.7);
    else { cam.pend = cam.pend.filter(p => p.target !== target && clock - p.at < 3); cam.pend.push(c); cam.pend.sort((a, b) => b.pri - a.pri); cam.pend.length = Math.min(cam.pend.length, 4); }
  }
  function startShot(c) {
    cam.shot = { target: c.target, z: c.z, until: clock + c.dur, pri: c.pri, start: clock };
    if (c.target && c.target.members && !c.target.vos) featured = c.target;
  }
  function director(dt) {
    let sh = cam.shot;
    if (sh && clock > sh.until) {
      cam.shot = null; sh = null;
      cam.pend = cam.pend.filter(p => clock - p.at < 3.5);
      if (cam.pend.length && cam.breathe <= 0) { startShot(cam.pend.shift()); sh = cam.shot; }
      else cam.breathe = 2.2;
    }
    if (cam.breathe > 0) { cam.breathe -= dt; if (cam.breathe <= 0 && cam.pend.length) { startShot(cam.pend.shift()); sh = cam.shot; } }
    if (sh) {
      const p = tgtPos(sh.target);
      if (!p || (sh.target.dead)) { cam.shot = null; return { x: VW / 2, y: TOP + VH / 2, z: 1 }; }
      return { x: p.x, y: p.y, z: sh.z };
    }
    return { x: VW / 2, y: TOP + VH / 2, z: 1 };
  }
  function updCamera(dtReal) {
    let t;
    if (game) t = { x: 236, y: 30, z: Math.min(ZMAX(), cssW < 480 ? 2.5 : 1.95) };
    else if (editing) t = { x: VW / 2, y: TOP + VH / 2, z: 1 };
    else if (cam.mode === 'follow' && cam.follow) {
      const p = tgtPos(cam.follow);
      if (!p || cam.follow.dead) { cam.follow = null; cam.mode = 'auto'; renderCamUI(); t = director(dtReal * speed); }
      else t = { x: p.x, y: p.y, z: Math.max(2.1, cam.fz || 2.3) };
    } else if (cam.mode === 'free' || cam.mode === 'all') {
      cam.idle += dtReal;
      if (cam.mode === 'free' && cam.idle > 16) { cam.mode = 'auto'; renderCamUI(); }
      if (cam.mode === 'all') t = { x: VW / 2, y: TOP + VH / 2, z: 1 };
      else return;
    } else t = director(dtReal * speed);
    if (!t) return;
    const c = { x: t.x, y: t.y, z: clamp(t.z, 1, ZMAX()) }; clampCam(c);
    const k = 1 - Math.exp(-dtReal * (reduced ? 30 : 2.6));
    const kz = 1 - Math.exp(-dtReal * (reduced ? 30 : 2.0));
    cam.z += (c.z - cam.z) * kz;
    const c2 = { x: cam.x + (c.x - cam.x) * k, y: cam.y + (c.y - cam.y) * k, z: cam.z }; clampCam(c2);
    cam.x = c2.x; cam.y = c2.y;
  }
  function setCam(m) {
    cam.mode = m; cam.idle = 0;
    if (m !== 'follow') cam.follow = null;
    renderCamUI();
  }
  function zoomAt(f, sx, sy) {
    const before = s2w(sx, sy);
    cam.z = clamp(cam.z * f, 1, ZMAX());
    const after = s2w(sx, sy);
    cam.x += before.x - after.x; cam.y += before.y - after.y; clampCam(cam);
    if (cam.mode !== 'free') setCam('free'); cam.idle = 0;
  }

  /* ── entrada: tocar, arrastrar, pellizcar ── */
  const ptrs = new Map(); let drag = null, pinch = null;
  function localPt(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function bindInput() {
    cv.addEventListener('pointerdown', e => {
      const p = localPt(e); ptrs.set(e.pointerId, p);
      if (ptrs.size === 1) drag = { sx: p.x, sy: p.y, cx: cam.x, cy: cam.y, t: performance.now(), moved: false, id: e.pointerId };
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: cam.z, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; drag = null; }
    });
    cv.addEventListener('pointermove', e => {
      const p = localPt(e);
      if (!ptrs.has(e.pointerId)) { const h = hitAny(s2w(p.x, p.y)); hover = h ? (h.t || h) : null; cv.style.cursor = editing ? (hitSlot(s2w(p.x, p.y)) ? 'pointer' : 'default') : h ? 'pointer' : (cam.z > 1.05 ? 'grab' : 'default'); return; }
      ptrs.set(e.pointerId, p);
      if (pinch && ptrs.size === 2) {
        const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const before = s2w(mx, my); cam.z = clamp(pinch.z * d / Math.max(10, pinch.d), 1, ZMAX());
        const after = s2w(mx, my); cam.x += before.x - after.x; cam.y += before.y - after.y; clampCam(cam);
        if (cam.mode !== 'free') setCam('free'); cam.idle = 0; return;
      }
      if (drag && e.pointerId === drag.id) {
        const dx = p.x - drag.sx, dy = p.y - drag.sy;
        if (Math.hypot(dx, dy) > 6) drag.moved = true;
        if (drag.moved && cam.z > 1.02 && !editing) {
          const s = scl(); cam.x = drag.cx - dx / s; cam.y = drag.cy - dy / s; clampCam(cam);
          if (cam.mode !== 'free') setCam('free'); cam.idle = 0; cv.style.cursor = 'grabbing';
        }
      }
    });
    const up = e => {
      const p = localPt(e);
      const wasDrag = drag && drag.moved, wasPinch = !!pinch;
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch = null;
      if (drag && e.pointerId === drag.id) { if (!wasDrag && !wasPinch && e.type === 'pointerup') tap(s2w(p.x, p.y)); drag = null; }
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', e => { if (!ptrs.size) hover = null; });
    cv.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); const p = localPt(e); zoomAt(Math.exp(-e.deltaY * 0.01), p.x, p.y); }, { passive: false });
    cv.addEventListener('dblclick', e => { const p = localPt(e); zoomAt(1.6, p.x, p.y); });
  }
  function hitAny(pt) {
    if (editing) return null;
    // personal primero
    const staff = [barista, barista2, mozo, game && game.b].filter(Boolean).find(p => Math.hypot(pt.x - p.x, pt.y - (p.y - 18)) < 18);
    if (staff) return staff;
    let best = null, bd = 1e9;
    TB.forEach(t => { const d = Math.hypot(pt.x - t.x, pt.y - (t.y - 10)); if (d < (t.k === 'lounge' ? 72 : 56) && d < bd) { bd = d; best = t; } });
    if (best) return best;
    return groups.find(g => g.takeaway && g.members.some(m => Math.hypot(pt.x - m.x, pt.y - (m.y - 18)) < 18)) || null;
  }
  function tap(pt) {
    if (editing) { const s = hitSlot(pt); if (s) editSlot(s); return; }
    const h = hitAny(pt);
    if (!h) { sel = null; renderCard(); if (cam.mode === 'follow') setCam('auto'); return; }
    let follow;
    if (h.kind) { sel = { staff: h }; follow = h; }
    else if (h.members) { sel = h; follow = h; }
    else { sel = { t: h, members: h.group ? h.group.members : [] }; follow = h.group || { x: h.x, y: h.y - 18 }; }
    cam.fz = h.kind ? 2.5 : 2.3; setCam('follow'); cam.follow = follow;
    const g = h.members ? h : h.group; if (g && !g.vos) featured = g;
    renderCard();
  }
