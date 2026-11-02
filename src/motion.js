/* ───────────────────────── fotos en movimiento (landing) ───────────────────────── */
let flipFrom = null;
function flipOpen(src) {
  const sh = $('#sheet'); const to = $('#ph-img');
  if (!to || !src || !src.isConnected || reduced) return;
  const a = src.getBoundingClientRect(), b = to.getBoundingClientRect();
  if (!a.width || !b.width) return;
  sh.classList.add('flip');
  const fly = document.createElement('img');
  fly.src = to.src; fly.alt = ''; fly.className = 'flip-img';
  document.body.appendChild(fly);
  to.style.visibility = 'hidden';
  const r0 = getComputedStyle(src).borderRadius || '12px';
  const anim = fly.animate([
    { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', borderRadius: r0 },
    { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px', borderRadius: '0px' }
  ], { duration: 440, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
  const done = () => { to.style.visibility = ''; fly.remove(); };
  anim.onfinish = done; anim.oncancel = done;
}

/* vapor de la taza de la portada: un cinemagraph, todo lo demás queda quieto */
function heroSteam() {
  const cv = $('#hero-steam'); if (!cv) return;
  const g = cv.getContext('2d');
  const EM = { x: 0.378, y: 0.468, w: 0.15 };
  let W = 0, H = 0, dpr = 1, parts = [], last = 0, on = true, acc = 0;
  const size = () => {
    const r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  };
  size(); addEventListener('resize', size);
  const strands = [{ x: -0.034, ph: 0 }, { x: 0.004, ph: 2.2 }, { x: 0.038, ph: 4.1 }];
  const born = () => ({ s: strands[(Math.random() * 3) | 0], t: 0, life: 3.4 + Math.random() * 2.2, jit: (Math.random() - 0.5) * 0.014, r: 0.010 + Math.random() * 0.009, a: 0.26 + Math.random() * 0.16 });
  for (let i = 0; i < 64; i++) { const p = born(); p.t = Math.random() * p.life; parts.push(p); }
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { on = es[0].isIntersecting; }).observe(cv);
  const frame = () => {
    requestAnimationFrame(frame);
    const t = Date.now();
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    if (!on || document.hidden || reduced) return;
    acc += dt; if (acc < 1 / 40) return; const step = acc; acc = 0;
    const T = t / 1000;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.t += step;
      if (p.t > p.life) Object.assign(p, born());
      const k = p.t / p.life;
      const x = (EM.x + p.s.x + p.jit + Math.sin(p.s.ph + k * 5.2 + T * 0.8) * 0.019 * (0.25 + k * 1.5)) * W;
      const y = (EM.y - k * 0.27) * H;
      const rad = (p.r + k * 0.034) * W;
      const al = p.a * Math.min(1, k * 5) * (1 - k) * (1 - k * 0.2);
      if (al <= 0.004) continue;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, `rgba(255,252,246,${al.toFixed(3)})`);
      gr.addColorStop(1, 'rgba(255,252,246,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rad, rad * 1.6, 0, 0, 6.283); g.fill();
    }
  };
  requestAnimationFrame(frame);
}

/* puntos de la foto de portada: tocás el producto y se abre en la demo */
function openFromLanding(id) {
  const demo = $('#demo'); if (!demo) return;
  demo.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  go('carta');
  setTimeout(() => openProduct(id), reduced ? 0 : 700);
}
function bindSpots() {
  $$('.spot').forEach(b => {
    const p = byId(b.dataset.spot); if (!p) return;
    const pr = $('.sp-p', b); if (pr) pr.textContent = fmt(p.price);
    b.addEventListener('click', () => openFromLanding(p.id));
  });
}

/* tira de fotos de la carta */
let reelSig = '';
function renderReel() {
  const t = $('#reel-track'); if (!t) return;
  const items = S.products.filter(p => p.on && p.cat !== 'filtrados');
  const sig = items.map(p => p.id + p.price).join() + S.cafe.name;
  if (sig === reelSig) return; reelSig = sig;
  const card = (p, dup) => `<button class="reel-card" type="button" data-reel="${p.id}" ${dup ? 'aria-hidden="true" tabindex="-1"' : ''}><span class="rimg"><img src="${IMG[p.img]}" alt="" loading="lazy" decoding="async"></span><span class="rn">${esc(p.name)}</span><span class="rp">${fmt(p.price)}</span></button>`;
  t.innerHTML = items.map(p => card(p)).join('') + items.map(p => card(p, true)).join('');
}
function bindReel() {
  const t = $('#reel-track'); if (!t) return;
  renderReel();
  t.addEventListener('click', e => { const b = e.target.closest('[data-reel]'); if (b) openFromLanding(b.dataset.reel); });
}

/* fotos que se desplazan apenas con el scroll */
function bindParallax() {
  const els = $$('[data-parallax]'); if (!els.length || reduced) return;
  let raf = 0;
  const run = () => {
    raf = 0; const vh = innerHeight;
    els.forEach(el => {
      const box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -40 || box.top > vh + 40) return;
      const c = (box.top + box.height / 2 - vh / 2) / vh;
      el.style.transform = `translate3d(0,${(c * +el.dataset.parallax).toFixed(1)}px,0) scale(1.1)`;
    });
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(run); }, { passive: true });
  addEventListener('resize', run); run();
}

function bindMotion() {
  heroSteam(); bindSpots(); bindReel(); bindParallax();
}
