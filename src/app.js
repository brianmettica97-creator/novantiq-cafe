'use strict';
(function () {
/* ───────────────────────── Configuración comercial (editar acá) ───────────────────────── */
const CONFIG = {
  novantiqWhatsapp: '5491100000000',      // número de WhatsApp de Novantiq, sin + ni espacios
  novantiqWhatsappText: '+54 9 11 0000-0000',
  instagram: 'novantiq.sa',
  usdArs: 1560,                            // cambio de referencia para la calculadora
  usdArsLabel: 'fines de octubre de 2026',
  publicUrl: '{{PUBLIC_URL}}',             // link público de esta demo (para los QR de mesa)
  install: 120,
  plans: [
    { id: 'Espresso', for: 'Para arrancar con la carta digital', m: 29,
      feats: ['Carta con QR en cada mesa', 'Pedidos a la barra y para llevar', 'Cambios de precio sin límite', 'Pantalla de comandas para la barra', 'Soporte por WhatsApp'],
      off: ['Tarjeta de sellos', 'Ruleta de premios', 'Campañas por WhatsApp'] },
    { id: 'Doble', for: 'Para que los clientes vuelvan', m: 49, rec: true,
      feats: ['Todo lo del plan Espresso', 'Tarjeta de sellos digital', 'Ruleta de premios con topes por día', 'Opiniones privadas e invitación a Google', 'Panel con tus números', 'Soporte en 4 horas hábiles'],
      off: ['Campañas por WhatsApp'] },
    { id: 'Tostadero', for: 'Para cafés con más de un local', m: 79,
      feats: ['Todo lo del plan Doble', 'Campañas por WhatsApp a tus clientes', 'Varias sucursales', 'Pantalla de retiro para pedidos para llevar', 'Visita mensual y soporte prioritario'],
      off: [] }
  ]
};

const IMG = {{IMAGES}};
const ICONS = {{ICONS}};

/* ───────────────────────── utilidades ───────────────────────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const ic = (n, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => '$' + Math.round(n).toLocaleString('es-AR');
const wait = ms => new Promise(r => setTimeout(r, ms));
const pad = n => String(n).padStart(2, '0');
const hhmm = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const slugify = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const titleCase = s => s.split(' ').filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function copyText(text, btn) {
  const done = ok => { if (!btn) return; const o = btn.textContent; btn.textContent = ok ? 'Copiado' : 'Seleccioná y copiá'; setTimeout(() => (btn.textContent = o), 1600); };
  try { navigator.clipboard.writeText(text).then(() => done(true), () => done(false)); } catch (e) { done(false); }
}

/* ───────────────────────── datos del café de ejemplo ───────────────────────── */
const CATS = [
  { id: 'espresso', name: 'Espresso bar', note: 'Blend de la casa' },
  { id: 'clasicos', name: 'Clásicos' },
  { id: 'frios', name: 'Fríos' },
  { id: 'filtrados', name: 'Filtrados', note: 'De origen único' },
  { id: 'dulce', name: 'Pastelería', note: 'Horneada acá' },
  { id: 'salado', name: 'Salado' }
];
const COFFEE_CATS = ['espresso', 'clasicos', 'filtrados'];
const ORIGIN_ET = { pais: 'Etiopía', region: 'Guji', proceso: 'Lavado', altura: '1.950 msnm', notas: ['Durazno', 'Jazmín', 'Té negro'], puntaje: 87 };
const ORIGIN_CO = { pais: 'Colombia', region: 'Huila', proceso: 'Lavado', altura: '1.750 msnm', notas: ['Panela', 'Cereza', 'Cacao'], puntaje: 86 };
const PRODUCTS_BASE = [
  { id: 'espresso', cat: 'espresso', name: 'Espresso', desc: 'Corto e intenso, con crema color avellana. Notas a chocolate amargo y nuez.', price: 3600, img: 'espresso', opts: ['extra'], recipe: true },
  { id: 'cortado', cat: 'espresso', name: 'Cortado', desc: 'Espresso con un toque de leche texturizada.', price: 4200, img: 'cortado', opts: ['milk', 'temp'], recipe: true },
  { id: 'flatwhite', cat: 'espresso', name: 'Flat white', desc: 'Doble espresso con leche sedosa y poca espuma. El favorito de la barra.', price: 5900, img: 'flatwhite', opts: ['milk', 'extra', 'temp'], recipe: true, hot: true },
  { id: 'cappuccino', cat: 'espresso', name: 'Cappuccino', desc: 'Mitad leche, mitad espuma, con cacao amargo por arriba.', price: 5700, img: 'cappuccino', opts: ['size', 'milk', 'extra', 'temp'], recipe: true },
  { id: 'submarino', cat: 'clasicos', name: 'Submarino', desc: 'Leche bien caliente con una barra de chocolate semiamargo para hundir.', price: 5200, img: 'submarino', opts: ['milk'] },
  { id: 'iced', cat: 'frios', name: 'Iced latte', desc: 'Doble espresso, leche fría y mucho hielo.', price: 6400, img: 'iced', opts: ['milk', 'extra'], recipe: true },
  { id: 'coldbrew', cat: 'frios', name: 'Cold brew', desc: 'Café infusionado en frío durante 18 horas, servido con mucho hielo.', price: 6200, img: 'coldbrew', opts: [], tags: ['Vegano'] },
  { id: 'jugo', cat: 'frios', name: 'Jugo de naranja', desc: 'Exprimido en el momento.', price: 4800, img: 'jugo', opts: [], tags: ['Vegano'] },
  { id: 'v60', cat: 'filtrados', name: 'V60 de Etiopía', desc: 'Filtrado a mano. Liviano y floral, con final a té negro.', price: 6900, img: 'filtrado_et', opts: [], origin: ORIGIN_ET, tags: ['Vegano'] },
  { id: 'chemex', cat: 'filtrados', name: 'Chemex de Colombia', desc: 'Para compartir entre dos. Dulce, con cuerpo medio y notas a panela.', price: 8900, img: 'filtrado_co', opts: [], origin: ORIGIN_CO, tags: ['Vegano'] },
  { id: 'medialunas', cat: 'dulce', name: 'Medialunas de manteca', desc: 'Recién horneadas, con almíbar y azúcar impalpable.', price: 3200, img: 'medialunas', opts: [], hot: true },
  { id: 'alfajor', cat: 'dulce', name: 'Alfajor de chocolate', desc: 'Relleno de dulce de leche y bañado en chocolate semiamargo.', price: 3400, img: 'alfajores', opts: [] },
  { id: 'cookie', cat: 'dulce', name: 'Cookie de chocolate', desc: 'Con trozos de chocolate y escamas de sal.', price: 3300, img: 'cookie', opts: [] },
  { id: 'cheesecake', cat: 'dulce', name: 'Cheesecake de frutos rojos', desc: 'Base de galletita, queso crema y salsa de frutos rojos.', price: 7200, img: 'cheesecake', opts: [] },
  { id: 'budin', cat: 'dulce', name: 'Budín de limón', desc: 'Húmedo, con glaseado de limón.', price: 4300, img: 'budin', opts: [], tags: ['Sin TACC'] },
  { id: 'tostado', cat: 'salado', name: 'Tostado de jamón y queso', desc: 'En pan de miga, bien dorado en la plancha.', price: 8900, img: 'tostado', opts: [] },
  { id: 'palta', cat: 'salado', name: 'Tostada con palta y huevo', desc: 'Pan de masa madre, palta pisada y huevo poché.', price: 11500, img: 'avocado', opts: [], tags: ['Veggie'] }
];
const OPTS = {
  size: { t: 'Tamaño', one: true, def: 1, items: [['Chico', -500], ['Mediano', 0], ['Grande', 900]] },
  milk: { t: 'Leche', one: true, def: 0, items: [['Entera', 0], ['Descremada', 0], ['Deslactosada', 0], ['Avena', 700], ['Almendras', 900]] },
  extra: { t: 'Extras', one: false, items: [['Shot extra', 900], ['Vainilla', 500], ['Caramelo', 500], ['Canela', 0]] },
  temp: { t: 'Temperatura', one: true, def: 0, items: [['Normal', 0], ['Bien caliente', 0], ['Tibia', 0]] }
};
const PRIZES_BASE = [
  { id: 'medialuna', short: 'Medialuna', label: 'una medialuna', kind: 'coupon', flavor: 'Floral', color: '#D98BAA', w: 18, cap: 20, given: 6 },
  { id: 'off10', short: '10% off', label: '10% en tu próximo pedido', kind: 'coupon', flavor: 'Frutal', color: '#C9383A', w: 22, cap: 999, given: 11 },
  { id: 'sello', short: '+1 sello', label: 'un sello extra', kind: 'stamp', n: 1, flavor: 'Cítrico', color: '#E8A33A', w: 20, cap: 999, given: 9 },
  { id: 'shot', short: 'Shot extra', label: 'un shot extra', kind: 'coupon', flavor: 'Caramelo', color: '#B87430', w: 14, cap: 40, given: 4 },
  { id: 'cookie', short: 'Cookie', label: 'una cookie', kind: 'coupon', flavor: 'Chocolate', color: '#5E3423', w: 8, cap: 10, given: 3 },
  { id: '2x1', short: '2x1 café', label: 'un 2x1 en café', kind: 'coupon', flavor: 'Nueces', color: '#9C7556', w: 6, cap: 8, given: 1 },
  { id: 'alfajor', short: 'Alfajor', label: 'un alfajor', kind: 'coupon', flavor: 'Especiado', color: '#8A2D2A', w: 7, cap: 10, given: 2 },
  { id: 'sellos2', short: '+2 sellos', label: 'dos sellos extra', kind: 'stamp', n: 2, flavor: 'Herbal', color: '#768F3B', w: 5, cap: 999, given: 1 }
];
const SKINS = {
  cereza: { name: 'Cereza', desc: 'Tostado y rojo cereza', accent: '#B3202E', ink: '#FFFFFF', bg: '#FBFAF7', text: '#2A1B16', card: '#F3EAE0', font: "'Young Serif',Georgia,serif", fw: 400 },
  nordico: { name: 'Nórdico', desc: 'Blanco y negro, mínimo', accent: '#151515', ink: '#FFFFFF', bg: '#F4F4F2', text: '#151515', card: '#E9E7E1', font: "'Bricolage Grotesque',system-ui,sans-serif", fw: 750 },
  barrio: { name: 'Barrio', desc: 'Mostaza y naranja', accent: '#E0552A', ink: '#FFFFFF', bg: '#FFF8E7', text: '#1C2742', card: '#FBE7A8', font: 'Caprasimo,Georgia,serif', fw: 400 }
};
const BARISTA = 'Juli';
const NAMES = ['Agus', 'Fede', 'Caro', 'Nico', 'Sofi', 'Mati', 'Lu', 'Pedro', 'Vale', 'Tomi', 'Flor', 'Santi'];
const COMBOS = [
  [['cappuccino', 1, ['Avena']], ['medialunas', 1, []]],
  [['cortado', 2, []], ['alfajor', 1, []]],
  [['flatwhite', 1, ['Almendras', 'Shot extra']]],
  [['tostado', 1, []], ['jugo', 1, []]],
  [['cappuccino', 1, ['Grande']], ['cookie', 1, []]],
  [['iced', 2, []]],
  [['espresso', 1, ['Shot extra']], ['budin', 1, []]],
  [['v60', 1, []], ['cheesecake', 1, []]],
  [['submarino', 1, []], ['medialunas', 1, []]]
];

/* ───────────────────────── estado ───────────────────────── */
let S;
function freshState(keep) {
  return {
    cafe: keep ? keep.cafe : { name: 'Cereza', tagline: 'Café de especialidad', skin: 'cereza', custom: false },
    mesa: keep ? keep.mesa : 7,
    view: 'inicio',
    products: PRODUCTS_BASE.map(p => Object.assign({ on: true }, p)),
    delDia: 'v60',
    q: '', catFilter: 'todo',
    cart: [], where: 'mesa', pickup: 'En 15 min', takeName: 'Martina', useReward: false,
    draft: null,
    orders: [], seq: 11, myLast: null,
    club: { member: 'Martina', memberNo: '0482', stamps: 7, goal: 10, spins: 1, newStamps: 0, rewards: [
      { id: 'r0', title: 'Café de cumpleaños', sub: 'Vence el 30 de noviembre', code: 'CUMPLE-0482', used: false }
    ] },
    prizes: PRIZES_BASE.map(p => Object.assign({ on: true }, p)),
    wheelRot: 0, spinning: false, lastWin: null,
    fb: null, googleInvites: 14,
    feedback: [
      { r: 5, tags: ['Café', 'Atención'], text: 'El flat white con avena, impecable. Volvemos el sábado.', where: 'Mesa 4', t: '16:58' },
      { r: 2, tags: ['Tiempo de espera'], text: 'Tardaron bastante con los tostados.', where: 'Mesa 9', t: '16:21', low: true },
      { r: 5, tags: ['Café'], text: 'El mejor cortado de la zona. Las medialunas, de otro planeta.', where: 'Mesa 2', t: '15:52' },
      { r: 4, tags: ['Ambiente'], text: 'Muy lindo el lugar. Un poco de ruido a la tarde.', where: 'Para llevar', t: '15:40' },
      { r: 5, tags: ['Atención'], text: 'Súper amables, nos guardaron la mesa del fondo.', where: 'Mesa 6', t: '14:17' }
    ],
    stats: { ventas: 846300, pedidos: 86, hours: [3, 7, 12, 9, 6, 8, 11, 10, 7, 9, 12, 8, 4] },
    members: [
      { name: 'Lucas Fernández', stamps: 4, last: 'Ayer', visits: 31, st: 'ok' },
      { name: 'Sofía Romero', stamps: 9, last: 'Hoy', visits: 18, st: 'ok' },
      { name: 'Julián Paz', stamps: 2, last: 'Hace 26 días', visits: 7, st: 'warn' },
      { name: 'Camila Ortiz', stamps: 6, last: 'Hace 3 días', visits: 12, st: 'ok' },
      { name: 'Tomás Herrera', stamps: 1, last: 'Hace 34 días', visits: 3, st: 'warn' },
      { name: 'Valentina Ruiz', stamps: 3, last: 'Hace 2 días', visits: 2, st: 'new' }
    ],
    campaign: { text: 'Hola {nombre}, te extrañamos en {cafe}. Tu próximo café va por nuestra cuenta: mostrá este mensaje en la caja hasta el domingo.', sent: 0, sending: false },
    panelTab: 'barra', badge: { barra: 0, ruleta: 0 },
    tentMesa: 7
  };
}
const byId = id => S.products.find(p => p.id === id);
const cafeSlug = () => slugify(S.cafe.name) || 'cafe';

/* ───────────────────────── marca del café ───────────────────────── */
function applyCafe() {
  const name = S.cafe.name;
  const sk = SKINS[S.cafe.skin];
  const app = $('#app');
  if (app) app.dataset.skin = S.cafe.skin;
  $$('[data-cafe-name]').forEach(el => (el.textContent = S.cafe.custom ? name : 'tu café'));
  const initial = (name.replace(/^caf[eé]\s+/i, '')[0] || 'C').toUpperCase();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('a-name', name); set('a-logo', initial); set('a-tag', S.cafe.tagline);
  set('p-name', name); set('p-logo', initial);
  const pl = $('#p-logo');
  if (pl) { pl.style.background = sk.accent; pl.style.color = sk.ink; pl.style.fontFamily = sk.font; }
  const m = $('#a-mesa'); if (m) m.innerHTML = `${ic('pin')}Mesa ${S.mesa}`;
}
function parseHash() {
  const h = decodeURIComponent((location.hash || '').slice(1));
  let m = h.match(/^cafe-([a-z0-9-]+?)(?:-mesa-(\d{1,2}))?$/);
  if (m) {
    if (slugify(S.cafe.name) !== m[1]) { S.cafe.name = titleCase(m[1].replace(/-/g, ' ')); }
    S.cafe.custom = true;
    if (m[2]) S.mesa = +m[2];
    return true;
  }
  m = h.match(/^mesa-(\d{1,2})$/);
  if (m) { S.mesa = +m[1]; return true; }
  return false;
}
function setCafeName(raw, fromForm) {
  const name = String(raw || '').trim().replace(/\s+/g, ' ').slice(0, 32);
  if (!name) return false;
  S.cafe.name = name; S.cafe.custom = true;
  applyCafe(); renderAppAll(); renderPanelBody();
  const hi = $('#cafe-input'); if (hi && !fromForm) hi.value = name;
  const bi = $('#b-name'); if (bi && document.activeElement !== bi) bi.value = name;
  return true;
}

/* ───────────────────────── íconos de la app ───────────────────────── */
const SYS = `<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>
<svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><path d="M8 11.5l2.4-2.6a3.4 3.4 0 0 0-4.8 0zM3.2 6.4a6.8 6.8 0 0 1 9.6 0l1.6-1.7a9.2 9.2 0 0 0-12.8 0zM.2 3.2a11 11 0 0 1 15.6 0" fill="currentColor"/></svg>
<svg width="26" height="12" viewBox="0 0 26 12" aria-hidden="true"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2.5" y="2.5" width="16" height="7" rx="2" fill="currentColor"/><path d="M24 4.2v3.6c.8-.3 1.3-1 1.3-1.8s-.5-1.5-1.3-1.8z" fill="currentColor" opacity=".5"/></svg>`;
function stampMark(i, isNew, delay) {
  const r = [-12, 8, -5, 14, -9, 4, -14, 10, -3, 6][i % 10];
  return `<svg class="mark${isNew ? ' new' : ''}" viewBox="0 0 40 40" style="--r:${r}deg;transform:rotate(${r}deg);${isNew ? `animation-delay:${delay}ms` : ''}" aria-hidden="true"><circle cx="20" cy="20" r="16.5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="20" cy="20" r="13.2" fill="none" stroke="currentColor" stroke-width=".9" stroke-dasharray="2 2.2"/><g transform="rotate(32 20 20)"><ellipse cx="20" cy="20" rx="6.4" ry="8.8" fill="currentColor"/><path d="M19.2 11.8c2.8 3.4-1.8 9.6 1.4 16.4" fill="none" stroke="var(--a-card)" stroke-width="1.7" stroke-linecap="round"/></g></svg>`;
}

/* ───────────────────────── app: estructura ───────────────────────── */
function renderAppShell() {
  const app = $('#app');
  app.innerHTML = `
  <div class="app-status"><span id="st-time">17:42</span><span class="sys">${SYS}</span></div>
  <header class="app-head">
    <div class="app-brand"><span class="app-logo" id="a-logo">C</span><div><b id="a-name">Cereza</b><small id="a-tag"></small></div></div>
    <span class="mesa-chip" id="a-mesa"></span>
  </header>
  <div class="app-views">
    <section class="view" id="v-inicio" aria-label="Inicio"></section>
    <section class="view" id="v-carta" aria-label="Carta" hidden></section>
    <section class="view" id="v-sellos" aria-label="Tarjeta de sellos" hidden></section>
    <section class="view" id="v-premios" aria-label="Ruleta de premios" hidden></section>
  </div>
  <button class="cart-bar" id="cart-bar" type="button" data-act="open-cart" hidden></button>
  <nav class="app-tabs" aria-label="Secciones de la app">
    <button type="button" data-act="go" data-v="inicio">${ic('home')}Inicio</button>
    <button type="button" data-act="go" data-v="carta">${ic('menu')}Carta</button>
    <button type="button" data-act="go" data-v="sellos">${ic('stamp')}Sellos<span class="tab-dot" id="dot-sellos" hidden></span></button>
    <button type="button" data-act="go" data-v="premios">${ic('gift')}Premios<span class="tab-dot" id="dot-premios" hidden></span></button>
  </nav>
  <div class="sheet" id="sheet" hidden></div>
  <div class="app-toast" id="app-toast" role="status" aria-live="polite"></div>
  <canvas class="confetti" id="confetti" aria-hidden="true"></canvas>
  <div class="home-bar" aria-hidden="true"></div>`;
  applyCafe();
}
function renderAppAll() {
  renderHome(); renderCarta(true); renderSellos(); renderPremios(); renderCartBar(); renderDots();
  $$('.app-tabs button').forEach(b => b.setAttribute('aria-current', b.dataset.v === S.view ? 'page' : 'false'));
}
function go(v) {
  if (!['inicio', 'carta', 'sellos', 'premios'].includes(v)) return;
  closeSheet();
  S.view = v;
  $$('.view', $('#app')).forEach(el => {
    const on = el.id === 'v-' + v;
    el.hidden = !on;
    if (on) { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); el.scrollTop = 0; }
  });
  if (v === 'sellos') renderSellos();
  if (v === 'premios') renderPremios();
  if (v === 'inicio') renderHome();
  $$('.app-tabs button').forEach(b => b.setAttribute('aria-current', b.dataset.v === v ? 'page' : 'false'));
  renderDots();
}
function greet() { const h = new Date().getHours(); return h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches'; }
function beansHTML() { let s = ''; for (let i = 0; i < S.club.goal; i++) s += `<i class="${i < S.club.stamps ? 'on' : ''}"></i>`; return s; }
function myActive() { return S.orders.find(o => o.mine && o.status !== 'entregado'); }

/* inicio */
function renderHome() {
  const v = $('#v-inicio'); if (!v) return;
  const o = myActive();
  const dd = byId(S.delDia);
  const spins = S.club.spins;
  v.innerHTML = `
  <div class="greet"><small>${greet()}, ${esc(S.club.member)}</small><h3>¿Qué tomamos hoy?</h3></div>
  <div class="home-stack">
    ${o ? orderLiveHTML(o) : ''}
    <div class="quick">
      <button type="button" data-act="go" data-v="sellos"><span class="k">Tus sellos</span><span class="v">${S.club.stamps} de ${S.club.goal}</span><span class="beans">${beansHTML()}</span></button>
      <button type="button" data-act="go" data-v="premios"><span class="k">Ruleta de premios</span><span class="v">${spins ? (spins === 1 ? 'Tenés 1 giro' : `Tenés ${spins} giros`) : 'Sin giros por ahora'}</span><span class="spin-badge">${ic('wheel')}${spins ? 'Girar ahora' : 'Pedí y ganás uno'}</span></button>
    </div>
    <article class="a-card feature">
      <img src="${IMG[dd.img]}" alt="Etiqueta del café de origen: ${esc(dd.origin.pais)}, ${esc(dd.origin.region)}">
      <div class="body">
        <span class="kicker">Café de hoy</span>
        <h4>${dd.origin.pais} ${dd.origin.region}, ${dd.origin.proceso.toLowerCase()}</h4>
        <div class="notes">${dd.origin.notas.map(n => `<span>${n}</span>`).join('')}</div>
        <div class="row"><span class="meta">${dd.origin.altura}, ${dd.origin.puntaje} puntos de catación</span><button class="add" type="button" data-act="open-prod" data-id="${dd.id}" aria-label="Ver ${esc(dd.name)}">${ic('plus')}</button></div>
      </div>
    </article>
  </div>
  <div class="sec-t"><h4>Lo más pedido</h4><button type="button" data-act="go" data-v="carta">Ver la carta</button></div>
  <div class="hscroll">${['flatwhite', 'medialunas', 'cappuccino', 'tostado', 'cheesecake', 'iced'].map(id => {
    const p = byId(id);
    return `<button class="pcard" type="button" data-act="open-prod" data-id="${p.id}" ${p.on ? '' : 'disabled'}><img src="${IMG[p.img]}" alt=""><span>${esc(p.name)}</span><b>${p.on ? fmt(p.price) : 'Agotado'}</b></button>`;
  }).join('')}</div>
  <div class="promo">${ic('clock')}<div><b>De 17 a 19 h, medialunas 2x1</b><span>Con cualquier café de la barra.</span></div></div>
  <div class="cafe-info"><span>${esc(S.cafe.name)}, La Plata. Abierto hasta las 20 h.</span><span>Wi-Fi: ${cafeSlug()}-invitados</span></div>`;
}
function orderLiveHTML(o) {
  const st = { nuevo: 0, preparando: 1, listo: 2 }[o.status];
  const title = o.status === 'nuevo' ? 'Recibimos tu pedido' : o.status === 'preparando' ? `${BARISTA} lo está preparando` : (o.where === 'mesa' ? 'Listo, va para tu mesa' : 'Listo para retirar');
  return `<button class="a-card order-live" type="button" data-act="open-track">
    <div class="top"><span>Pedido ${o.id}, ${o.where === 'mesa' ? 'mesa ' + o.mesa : 'para llevar'}</span><span>${o.status === 'listo' ? '¡Ya está!' : 'Ver estado'}</span></div>
    <b>${title}</b>
    <div class="mini-steps"><i class="${st >= 0 ? 'on' : ''}"></i><i class="${st >= 1 ? 'on' : ''} ${st === 0 ? 'run' : ''}"></i><i class="${st >= 2 ? 'on' : ''} ${st === 1 ? 'run' : ''}"></i></div>
  </button>`;
}

/* carta */
function renderCarta(full) {
  renderReel();
  const v = $('#v-carta'); if (!v) return;
  if (full || !$('#carta-list', v)) {
    v.innerHTML = `
    <div class="carta-top">
      <label class="search">${ic('search')}<span class="sr">Buscar en la carta</span><input id="q" type="search" placeholder="Buscar en la carta" value="${esc(S.q)}" autocomplete="off"></label>
      <div class="chips" role="group" aria-label="Filtrar la carta">
        ${[['todo', 'Todo'], ...CATS.map(c => [c.id, c.name]), ['vegano', 'Vegano']].map(([id, n]) => `<button type="button" class="chip" data-act="cat" data-c="${id}" aria-pressed="${S.catFilter === id}">${n}</button>`).join('')}
      </div>
    </div>
    <div id="carta-list"></div>`;
  }
  const list = $('#carta-list', v);
  const q = S.q.trim().toLowerCase();
  const match = p => (!q || (p.name + ' ' + p.desc).toLowerCase().includes(q)) &&
    (S.catFilter === 'todo' || p.cat === S.catFilter || (S.catFilter === 'vegano' && (p.tags || []).includes('Vegano')));
  let html = '';
  CATS.forEach(c => {
    const items = S.products.filter(p => p.cat === c.id && match(p));
    if (!items.length) return;
    html += `<div class="cat"><h4>${c.name}${c.note ? `<small>${c.note}</small>` : ''}</h4>${items.map(prowHTML).join('')}</div>`;
  });
  list.innerHTML = html || `<p class="empty">No encontramos "${esc(S.q)}" en la carta. Probá con otra palabra.</p>`;
}
function prowHTML(p) {
  const tags = [p.hot ? '<span class="tag hot">Más pedido</span>' : '', ...(p.tags || []).map(t => `<span class="tag">${t}</span>`)].join('');
  return `<div class="prow ${p.on ? '' : 'off'}" role="button" tabindex="${p.on ? 0 : -1}" data-act="open-prod" data-id="${p.id}" aria-disabled="${!p.on}">
    <img src="${IMG[p.img]}" alt="">
    <div><div class="nm">${esc(p.name)} ${tags}</div><div class="ds">${esc(p.desc)}</div><div class="pr">${p.on ? fmt(p.price) : '<span class="soldout">Agotado por hoy</span>'}</div></div>
    <span class="add" aria-hidden="true">${ic('plus')}</span>
  </div>`;
}

/* producto */
function draftPrice(d) {
  d = d || S.draft; const p = byId(d.id); let u = p.price;
  for (const k of p.opts) {
    const o = OPTS[k];
    if (o.one) u += o.items[d.opts[k]][1];
    else (d.multi[k] || []).forEach(i => (u += o.items[i][1]));
  }
  return u;
}
function draftMods(d) {
  const p = byId(d.id); const mods = [];
  for (const k of p.opts) {
    const o = OPTS[k];
    if (o.one) { if (d.opts[k] !== o.def) mods.push(k === 'milk' ? 'Leche de ' + o.items[d.opts[k]][0].toLowerCase() : o.items[d.opts[k]][0]); }
    else (d.multi[k] || []).forEach(i => mods.push(o.items[i][0]));
  }
  return mods;
}
function openProduct(id) {
  const p = byId(id); if (!p || !p.on) return;
  const opts = {}; const multi = {};
  p.opts.forEach(k => { if (OPTS[k].one) opts[k] = OPTS[k].def; else multi[k] = []; });
  S.draft = { id, opts, multi, note: '', qty: 1 };
  openSheet(productSheetHTML(p), 'product');
  if (flipFrom) flipOpen(flipFrom);
  flipFrom = null;
}
function productSheetHTML(p) {
  const recipe = p.recipe ? `<p class="recipe-t">Receta de la barra</p><div class="recipe"><div><b>18 g</b><span>Dosis</span></div><div><b>36 g</b><span>Rinde</span></div><div><b>28 s</b><span>Extracción</span></div><div><b>93 °C</b><span>Agua</span></div></div>` : '';
  const origin = p.origin ? `<div class="origin"><div><span>Origen</span><b>${p.origin.pais}, ${p.origin.region}</b></div><div><span>Proceso</span><b>${p.origin.proceso}</b></div><div><span>Altura</span><b>${p.origin.altura}</b></div><div><span>Puntaje</span><b>${p.origin.puntaje} puntos</b></div></div><div class="notes" style="margin-top:8px">${p.origin.notas.map(n => `<span>${n}</span>`).join('')}</div>` : '';
  return `<div class="sheet-panel" role="dialog" aria-modal="true" aria-label="${esc(p.name)}">
    <button class="sheet-x" type="button" data-act="close-sheet" aria-label="Cerrar">${ic('close')}</button>
    <div class="ph"><img id="ph-img" src="${IMG[p.img]}" alt="${esc(p.name)}"></div>
    <div class="ph-name"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p></div>
    ${recipe}${origin}
    <div id="opt-groups">${p.opts.map(optGroupHTML).join('')}</div>
    <div class="og"><div class="og-t">Aclaraciones para la barra <small>Opcional</small></div><textarea class="note" id="d-note" rows="2" placeholder="Ej: sin azúcar, en vaso para llevar"></textarea></div>
    <div class="sheet-cta"><div class="qty"><button type="button" data-act="dqty" data-d="-1" aria-label="Uno menos">${ic('minus')}</button><b id="d-qty">1</b><button type="button" data-act="dqty" data-d="1" aria-label="Uno más">${ic('plus')}</button></div>
    <button class="cta" type="button" data-act="add-draft" id="d-add">Agregar ${fmt(draftPrice())}</button></div>
  </div>`;
}
function optGroupHTML(k) {
  const o = OPTS[k]; const d = S.draft;
  return `<div class="og" data-k="${k}"><div class="og-t">${o.t}<small>${o.one ? 'Elegí una' : 'Podés sumar varios'}</small></div><div class="opts">${o.items.map(([n, pr], i) => {
    const on = o.one ? d.opts[k] === i : (d.multi[k] || []).includes(i);
    const price = pr > 0 ? `<small>+${fmt(pr)}</small>` : pr < 0 ? `<small>−${fmt(-pr)}</small>` : '';
    return `<button type="button" class="opt" data-act="opt" data-k="${k}" data-i="${i}" aria-pressed="${on}">${n}${price}</button>`;
  }).join('')}</div></div>`;
}
function setOpt(k, i) {
  const d = S.draft; if (!d) return; const o = OPTS[k];
  if (o.one) d.opts[k] = i;
  else { const a = d.multi[k]; const at = a.indexOf(i); if (at >= 0) a.splice(at, 1); else a.push(i); }
  const g = $(`.og[data-k="${k}"]`, $('#sheet')); if (g) g.outerHTML = optGroupHTML(k);
  updateDraftCTA();
}
function updateDraftCTA() { const b = $('#d-add'); if (b) b.textContent = 'Agregar ' + fmt(draftPrice() * S.draft.qty); const q = $('#d-qty'); if (q) q.textContent = S.draft.qty; }
function addDraft() {
  const d = S.draft; if (!d) return;
  const noteEl = $('#d-note'); d.note = noteEl ? noteEl.value.trim() : '';
  const unit = draftPrice(d); const mods = draftMods(d);
  const key = d.id + '|' + mods.join(',') + '|' + d.note;
  const ex = S.cart.find(c => c.key === key);
  if (ex) ex.qty += d.qty; else S.cart.push({ key, id: d.id, qty: d.qty, unit, mods, note: d.note });
  flyToCart();
  S.draft = null;
  closeSheet(true);
  renderCartBar(true);
}
function flyToCart() {
  if (reduced) return;
  const from = $('#ph-img'); const bar = $('#cart-bar'); if (!from || !bar) return;
  const a = from.getBoundingClientRect();
  const fly = document.createElement('img'); fly.src = from.src; fly.className = 'fly'; fly.alt = '';
  document.body.appendChild(fly);
  const appR = $('#app').getBoundingClientRect();
  const tx = appR.left + appR.width / 2 - 28, ty = appR.bottom - 140;
  const sx = a.left + a.width / 2 - 28, sy = a.top + a.height / 2 - 28;
  const anim = fly.animate([
    { transform: `translate(${sx}px,${sy}px) scale(2.2)`, opacity: 1 },
    { transform: `translate(${(sx + tx) / 2}px,${Math.min(sy, ty) - 60}px) scale(1.2)`, opacity: 1, offset: .55 },
    { transform: `translate(${tx}px,${ty}px) scale(.4)`, opacity: .2 }
  ], { duration: 700, easing: 'cubic-bezier(.3,.1,.3,1)' });
  fly.style.left = '0'; fly.style.top = '0';
  anim.onfinish = () => fly.remove();
}

/* carrito */
const cartCount = () => S.cart.reduce((a, c) => a + c.qty, 0);
const cartSub = () => S.cart.reduce((a, c) => a + c.qty * c.unit, 0);
function availableReward() { return S.club.rewards.find(r => !r.used && r.type === 'cafe'); }
function rewardDiscount() {
  if (!S.useReward || !availableReward()) return 0;
  const cof = S.cart.filter(c => COFFEE_CATS.includes(byId(c.id).cat));
  if (!cof.length) return 0;
  return Math.min(...cof.map(c => byId(c.id).price));
}
function renderCartBar(bump) {
  const b = $('#cart-bar'); if (!b) return;
  const n = cartCount();
  b.hidden = !n || !$('#sheet').hidden;
  b.innerHTML = `<span class="cb-n">${n}</span><span>Ver pedido</span><span class="cb-t">${fmt(cartSub())}</span>`;
  if (bump && !reduced) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
}
function openCart() { if (!S.cart.length) return; openSheet(cartSheetHTML(), 'cart'); }
function cartSheetHTML() {
  const rw = availableReward();
  const disc = rewardDiscount();
  const items = S.cart.map((c, i) => {
    const p = byId(c.id);
    return `<div class="citem"><img src="${IMG[p.img]}" alt=""><div><div class="nm">${esc(p.name)}</div><div class="md">${esc([...c.mods, c.note].filter(Boolean).join(', ') || 'Como viene')}</div></div>
      <div class="r"><b>${fmt(c.unit * c.qty)}</b><div class="qty sm"><button type="button" data-act="cqty" data-i="${i}" data-d="-1" aria-label="Uno menos">${ic('minus')}</button><b>${c.qty}</b><button type="button" data-act="cqty" data-i="${i}" data-d="1" aria-label="Uno más">${ic('plus')}</button></div></div></div>`;
  }).join('');
  const llevar = S.where === 'llevar';
  return `<div class="sheet-panel" role="dialog" aria-modal="true" aria-label="Tu pedido">
    <div class="grab"></div>
    <button class="sheet-x" type="button" data-act="close-sheet" aria-label="Cerrar">${ic('close')}</button>
    <h3 class="sheet-h">Tu pedido</h3>
    ${items}
    <div class="og"><div class="og-t">¿Dónde lo tomás?</div>
      <div class="seg"><button type="button" data-act="where" data-w="mesa" aria-pressed="${!llevar}">En la mesa ${S.mesa}</button><button type="button" data-act="where" data-w="llevar" aria-pressed="${llevar}">Para llevar</button></div>
      ${llevar ? `<label class="field-a">Nombre para llamarte<input id="take-name" value="${esc(S.takeName)}" maxlength="20"></label>
      <div class="og-t" style="margin-top:12px">¿Cuándo pasás?</div><div class="opts">${['Ahora', 'En 15 min', 'En 30 min'].map(t => `<button type="button" class="opt" data-act="pickup" data-t="${t}" aria-pressed="${S.pickup === t}">${t}</button>`).join('')}</div>` : ''}
    </div>
    ${rw ? `<button type="button" class="reward-toggle" data-act="toggle-reward">${ic('gift')}<span><b>Usar mi ${rw.title.toLowerCase()}</b><br><small>Se descuenta el café más económico del pedido.</small></span><span class="sw ${S.useReward ? 'on' : ''}"></span></button>` : ''}
    <div class="sum"><div><span>Subtotal</span><span>${fmt(cartSub())}</span></div>${disc ? `<div class="disc"><span>${esc(rw.title)}</span><span>−${fmt(disc)}</span></div>` : ''}<div class="tot"><span>Total</span><span>${fmt(cartSub() - disc)}</span></div></div>
    <p class="pay">Pagás en la caja como siempre: efectivo, tarjeta o Mercado Pago.</p>
    <div class="sheet-cta"><button class="cta" type="button" data-act="send-order">${ic('send')}Enviar pedido a la barra</button></div>
    <a class="wa-alt" href="https://wa.me/?text=${encodeURIComponent(waOrderText())}" target="_blank" rel="noopener">Prefiero mandarlo por WhatsApp</a>
  </div>`;
}
function waOrderText() {
  const lines = S.cart.map(c => `${c.qty} x ${byId(c.id).name}${c.mods.length ? ' (' + c.mods.join(', ') + ')' : ''}`);
  return `Hola ${S.cafe.name}, quiero pedir:\n${lines.join('\n')}\nTotal: ${fmt(cartSub() - rewardDiscount())}`;
}
function sendOrder() {
  if (!S.cart.length) return;
  const nameEl = $('#take-name'); if (nameEl) S.takeName = nameEl.value.trim() || 'Martina';
  const disc = rewardDiscount();
  if (disc) { const rw = availableReward(); rw.used = true; }
  const o = createOrder({
    mine: true, where: S.where, mesa: S.mesa, name: S.where === 'llevar' ? S.takeName : S.club.member, pickup: S.pickup,
    items: S.cart.map(c => ({ id: c.id, name: byId(c.id).name, qty: c.qty, mods: c.mods, note: c.note })),
    total: cartSub() - disc
  });
  S.cart = []; S.useReward = false; S.myLast = o.id;
  renderCartBar();
  openTrack();
  renderHome();
  return o;
}

/* seguimiento */
function openTrack() { const o = myActive() || S.orders.find(x => x.id === S.myLast); if (!o) return; openSheet(trackHTML(o), 'track'); }
function trackHTML(o) {
  const st = { nuevo: 0, preparando: 1, listo: 2, entregado: 3 }[o.status];
  const title = st === 0 ? 'Recibimos tu pedido' : st === 1 ? 'Lo estamos preparando' : (o.where === 'mesa' ? '¡Listo! Va para tu mesa' : '¡Listo para retirar!');
  const step = (i, t, s, icn) => `<div class="tstep ${st > i || st >= 2 && i === 2 ? 'done' : st === i ? 'now' : ''}"><span class="b">${ic(st > i || (st >= 2 && i === 2) ? 'check' : icn)}</span><div><b>${t}</b><span>${s}</span></div></div>`;
  const coffees = o.items.filter(it => COFFEE_CATS.includes(byId(it.id).cat)).reduce((a, it) => a + it.qty, 0);
  return `<div class="sheet-panel" role="dialog" aria-modal="true" aria-label="Estado del pedido">
    <div class="grab"></div>
    <button class="sheet-x" type="button" data-act="close-sheet" aria-label="Cerrar">${ic('close')}</button>
    <div class="track-h"><small>Pedido ${o.id}, ${o.where === 'mesa' ? 'mesa ' + o.mesa : 'para llevar, a nombre de ' + esc(o.name)}</small><h3>${title}</h3></div>
    ${st < 2 ? `<div class="eta">${ic('clock')}<span>Tiempo estimado</span><b>${st === 0 ? '6 min' : '3 min'}</b></div>` : ''}
    <div class="tsteps">
      ${step(0, 'Recibido', 'A las ' + hhmm(o.t0) + ', ya está en la barra', 'ticket')}
      ${step(1, 'En preparación', `${BARISTA} está con tu pedido`, 'cup')}
      ${step(2, o.where === 'mesa' ? 'Va para tu mesa' : 'Listo para retirar', o.where === 'mesa' ? 'Te lo llevamos en un momento' : `Retiralo en la barra, ${o.pickup.toLowerCase()}`, 'bell')}
    </div>
    ${st >= 2 ? `<div class="ready"><h4>¡Que lo disfrutes!</h4><div class="gains">${coffees ? `<span class="gain">${ic('stamp')}+${coffees} ${coffees === 1 ? 'sello' : 'sellos'}</span>` : ''}<span class="gain">${ic('wheel')}+1 giro en la ruleta</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%"><button class="cta ghost" type="button" data-act="go" data-v="sellos">Ver mis sellos</button><button class="cta" type="button" data-act="go" data-v="premios">Girar la ruleta</button></div></div>` : ''}
    <div class="og"><div class="og-t">Tu pedido</div>${o.items.map(it => `<div class="citem" style="grid-template-columns:44px 1fr auto"><img src="${IMG[byId(it.id).img]}" alt="" style="width:44px;height:44px"><div><div class="nm">${it.qty} × ${esc(it.name)}</div><div class="md">${esc(it.mods.join(', ') || 'Como viene')}</div></div></div>`).join('')}</div>
  </div>`;
}

/* hojas, avisos y confeti */
let sheetKind = null;
function openSheet(html, kind) {
  const sh = $('#sheet'); sh.classList.remove('flip'); sh.innerHTML = html; sh.hidden = false; sheetKind = kind;
  renderCartBar();
}
function closeSheet(keepDraft) {
  const sh = $('#sheet'); if (!sh || sh.hidden) return;
  sh.hidden = true; sh.innerHTML = ''; sheetKind = null; if (!keepDraft) S.draft = null;
  stopCodeTimer();
  renderCartBar();
}
let toastT;
function toast(title, text, icon) {
  const t = $('#app-toast'); if (!t) return;
  t.innerHTML = `<span class="ti">${ic(icon || 'bell')}</span><span><b>${esc(title)}</b>${esc(text || '')}</span>`;
  t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3800);
}
function confetti() {
  if (reduced) return;
  const cv = $('#confetti'); if (!cv) return;
  const r = cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = r.width * dpr; cv.height = r.height * dpr;
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  const css = getComputedStyle($('#app'));
  const cols = [css.getPropertyValue('--a-accent').trim() || '#B3202E', '#E8A33A', '#768F3B', '#D98BAA', '#ffffff', '#5E3423'];
  const parts = Array.from({ length: 110 }, () => ({ x: r.width / 2 + rand(-40, 40), y: r.height * 0.42, vx: rand(-5.5, 5.5), vy: rand(-9, -3), s: rand(5, 9), c: pick(cols), a: rand(0, 6.28), va: rand(-.3, .3), shape: Math.random() < .4 ? 'bean' : 'rect' }));
  const t0 = Date.now();
  (function frame() {
    const el = Date.now() - t0;
    ctx.clearRect(0, 0, r.width, r.height);
    parts.forEach(p => {
      p.vy += 0.22; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - el / 2600);
      if (p.shape === 'bean') { ctx.beginPath(); ctx.ellipse(0, 0, p.s * .45, p.s * .65, 0, 0, 6.29); ctx.fill(); }
      else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    });
    if (el < 2600) requestAnimationFrame(frame); else ctx.clearRect(0, 0, r.width, r.height);
  })();
}

/* sellos */
function renderSellos() {
  const v = $('#v-sellos'); if (!v) return;
  const c = S.club; const full = c.stamps >= c.goal;
  const fresh = S.view === 'sellos' ? c.newStamps : 0;
  let slots = '';
  for (let i = 0; i < c.goal; i++) {
    const has = i < c.stamps;
    const isNew = has && i >= c.stamps - fresh;
    if (i === c.goal - 1) slots += `<div class="slot gift ${full ? 'full' : ''}">${full ? '' : ''}<svg class="gi" viewBox="0 0 24 24" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round">${ICONS.gift}</svg></div>`;
    else slots += `<div class="slot">${has ? stampMark(i, isNew, (i - (c.stamps - fresh)) * 260) : ''}</div>`;
  }
  const left = c.goal - c.stamps;
  const rewards = c.rewards.slice().reverse();
  v.innerHTML = `
    <div class="greet"><small>Tarjeta de sellos</small><h3>${full ? '¡Completaste la tarjeta!' : `Te ${left === 1 ? 'falta 1 sello' : `faltan ${left} sellos`}`}</h3></div>
    <div class="club-card" aria-label="Tarjeta de sellos con ${c.stamps} de ${c.goal}">
      <div class="club-top"><div><b>Club ${esc(S.cafe.name)}</b><small>${esc(c.member)}, socia desde marzo</small></div><div class="club-no">SOCIA<br>Nº ${c.memberNo}</div></div>
      <div class="stamps">${slots}</div>
      <div class="club-foot"><span>${full ? 'Tu próximo café va de regalo' : 'El décimo café va de regalo'}</span><b>${c.stamps}/${c.goal}</b></div>
    </div>
    <div class="club-actions">
      <button class="cta alt" type="button" data-act="show-code">${ic('qr')}Mostrar mi código en la caja</button>
      <button class="demo-ctl" type="button" data-act="sim-stamp"><span class="tagd">DEMO</span>Simular una compra en la caja</button>
    </div>
    <div class="sec-t"><h4>Mis premios</h4></div>
    <div class="rewards">${rewards.length ? rewards.map(couponHTML).join('') : '<p class="empty">Todavía no tenés premios. Girá la ruleta después de tu próxima compra.</p>'}</div>
    <div class="sec-t"><h4>Cómo funciona</h4></div>
    <div class="howto">
      <div>${ic('cup')}<span>Cada café de la barra suma un sello. El décimo va por cuenta de la casa.</span></div>
      <div>${ic('qr')}<span>Los sellos los suma la barra escaneando tu código, que cambia cada 30 segundos.</span></div>
      <div>${ic('gift')}<span>En tu cumpleaños te regalamos un café, y si traés a alguien nuevo suman dos sellos los dos.</span></div>
    </div>`;
  c.newStamps = S.view === 'sellos' ? 0 : c.newStamps;
  bindSwipes(v);
}
function couponHTML(r) {
  return `<div class="coupon ${r.used ? 'used' : ''}" data-rid="${r.id}">
    <span class="ci">${ic(r.type === 'cafe' ? 'cup' : 'gift')}</span>
    <div><b>${esc(r.title)}</b><small>${esc(r.sub)}</small><div class="code">${esc(r.code)}</div></div>
    ${r.used ? '' : `<div class="swipe" data-rid="${r.id}"><span>Deslizá frente a la caja para canjear</span><div class="knob" role="slider" aria-label="Deslizá para canjear ${esc(r.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">${ic('arrow')}</div></div>`}
  </div>`;
}
function bindSwipes(root) {
  $$('.swipe', root).forEach(sw => {
    const knob = $('.knob', sw); let sx = 0, x = 0, drag = false;
    const max = () => sw.clientWidth - knob.offsetWidth - 8;
    const done = () => { const r = S.club.rewards.find(r => r.id === sw.dataset.rid); if (r) { r.used = true; toast('Premio canjeado', `${r.title}. Que lo disfrutes.`, 'check'); renderSellos(); renderPanelBody(); } };
    knob.addEventListener('pointerdown', e => { drag = true; sx = e.clientX - x; knob.setPointerCapture(e.pointerId); });
    knob.addEventListener('pointermove', e => { if (!drag) return; x = Math.max(0, Math.min(max(), e.clientX - sx)); knob.style.transform = `translateX(${x}px)`; });
    const end = () => { if (!drag) return; drag = false; if (x > max() * 0.86) done(); else { x = 0; knob.style.transition = 'transform .25s'; knob.style.transform = ''; setTimeout(() => (knob.style.transition = ''), 260); } };
    knob.addEventListener('pointerup', end); knob.addEventListener('pointercancel', end);
    knob.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); done(); } });
  });
}
function addStamps(n, why) {
  const c = S.club;
  for (let i = 0; i < n; i++) {
    if (c.stamps >= c.goal) { c.stamps = 0; }
    c.stamps++;
    c.newStamps++;
    if (c.stamps === c.goal) {
      c.rewards.push({ id: 'r' + Date.now() + i, type: 'cafe', title: 'Café de regalo', sub: 'Completaste la tarjeta. Vence en 30 días', code: 'REGALO-' + Math.floor(rand(1000, 9999)), used: false });
      setTimeout(() => { confetti(); toast('¡Completaste la tarjeta!', 'Tu próximo café va de regalo.', 'gift'); }, 700);
    }
  }
  const me = S.members.find(m => m.me); if (me) me.stamps = c.stamps;
  if (S.view === 'sellos') renderSellos(); else renderDots();
  renderHome(); renderPanelBody();
  return why;
}
function renderDots() {
  const ds = $('#dot-sellos'), dp = $('#dot-premios');
  if (ds) { const n = S.club.newStamps; ds.hidden = !(n && S.view !== 'sellos'); ds.textContent = '+' + n; }
  if (dp) { const n = S.club.spins; dp.hidden = !(n && S.view !== 'premios'); dp.textContent = n; }
}

/* código de socio */
let codeTimer = null, codeLeft = 30;
function newCode() { return String(Math.floor(rand(100000, 999999))); }
function openCode() {
  openSheet(`<div class="sheet-panel" role="dialog" aria-modal="true" aria-label="Tu código de socio">
    <div class="grab"></div><button class="sheet-x" type="button" data-act="close-sheet" aria-label="Cerrar">${ic('close')}</button>
    <h3 class="sheet-h">Tu código de socia</h3>
    <div class="qr-box"><div class="qr" id="member-qr"></div><div class="code6" id="code6"></div>
      <div class="ring"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="var(--a-line)" stroke-width="3"/><circle id="code-ring" cx="12" cy="12" r="9.5" fill="none" stroke="var(--a-accent)" stroke-width="3" stroke-dasharray="59.7" stroke-dashoffset="0" stroke-linecap="round"/></svg><span id="code-left">Se renueva en 30 s</span></div>
      <p class="fine">Mostráselo a quien te cobra: la barra lo escanea y suma tus sellos. Una captura de pantalla no sirve porque el código cambia.</p>
    </div></div>`, 'code');
  rotateCode(); stopCodeTimer();
  codeTimer = setInterval(() => {
    codeLeft--; if (codeLeft <= 0) rotateCode();
    const r = $('#code-ring'), l = $('#code-left');
    if (r) r.setAttribute('stroke-dashoffset', String(59.7 * (1 - codeLeft / 30)));
    if (l) l.textContent = `Se renueva en ${codeLeft} s`;
  }, 1000);
}
function rotateCode() {
  codeLeft = 30; const code = newCode();
  const c6 = $('#code6'); if (c6) c6.textContent = code.slice(0, 3) + ' ' + code.slice(3);
  qrInto($('#member-qr'), `NOVANTIQ-CLUB:${cafeSlug()}:${S.club.memberNo}:${code}`, '#1A1411');
}
function stopCodeTimer() { if (codeTimer) { clearInterval(codeTimer); codeTimer = null; } }
function qrInto(el, text, fg) {
  if (!el) return;
  if (typeof window.qrcode !== 'function') { el.innerHTML = `<svg viewBox="0 0 10 10" aria-label="Código QR"><rect width="10" height="10" fill="#fff"/><path d="M1 1h3v3H1zM6 1h3v3H6zM1 6h3v3H1z" fill="${fg}"/><path d="M6 6h1v1H6zM8 6h1v1H8zM7 7h1v1H7zM6 8h1v1H6zM8 8h1v1H8z" fill="${fg}"/></svg>`; return; }
  const qr = window.qrcode(0, 'M'); qr.addData(text); qr.make();
  const n = qr.getModuleCount(); let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c},${r}h1v1h-1z`;
  el.innerHTML = `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" role="img" aria-label="Código QR" shape-rendering="crispEdges"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#fff"/><path d="${d}" fill="${fg}"/></svg>`;
}

/* ───────────────────────── ruleta ───────────────────────── */
const lum = hex => { const v = parseInt(hex.slice(1), 16); const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
function activePrizes() { return S.prizes.filter(p => p.on); }
function wheelSVG() {
  const P = activePrizes(); const n = P.length; const seg = 360 / n; const C = 150;
  const pt = (r, a) => { const t = (a - 90) * Math.PI / 180; return [C + r * Math.cos(t), C + r * Math.sin(t)]; };
  const arc = (r0, r1, a0, a1) => {
    const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r1, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0);
    const L = a1 - a0 > 180 ? 1 : 0;
    return `M${x0.toFixed(2)},${y0.toFixed(2)}A${r1},${r1} 0 ${L} 1 ${x1.toFixed(2)},${y1.toFixed(2)}L${x2.toFixed(2)},${y2.toFixed(2)}A${r0},${r0} 0 ${L} 0 ${x3.toFixed(2)},${y3.toFixed(2)}Z`;
  };
  let defs = '', g = '';
  P.forEach((p, i) => {
    const a0 = i * seg, a1 = a0 + seg, mid = a0 + seg / 2;
    const light = lum(p.color) > 0.55;
    const tc = light ? '#2A1B16' : '#FFFFFF';
    g += `<path d="${arc(30, 121, a0, a1)}" fill="${p.color}"/>`;
    g += `<path d="${arc(123, 147, a0, a1)}" fill="${p.color}" opacity=".55"/>`;
    const [tx, ty] = pt(114, mid);
    g += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" transform="rotate(${(mid - 90).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)})" text-anchor="end" dominant-baseline="central" font-family="Figtree,system-ui,sans-serif" font-weight="800" font-size="13" fill="${tc}">${esc(p.short)}</text>`;
    const [sx, sy] = pt(135, a0 + 2), [ex, ey] = pt(135, a1 - 2);
    defs += `<path id="fl${i}" d="M${sx.toFixed(2)},${sy.toFixed(2)}A135,135 0 0 1 ${ex.toFixed(2)},${ey.toFixed(2)}"/>`;
    g += `<text font-family="Figtree,system-ui,sans-serif" font-weight="700" font-size="10" letter-spacing=".04em" fill="${light ? '#3A2A22' : '#FFFFFF'}" dominant-baseline="central"><textPath href="#fl${i}" startOffset="50%" text-anchor="middle">${p.flavor}</textPath></text>`;
  });
  for (let i = 0; i < n; i++) { const [x0, y0] = pt(30, i * seg), [x1, y1] = pt(147, i * seg); g += `<line x1="${x0.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${x1.toFixed(2)}" y2="${y1.toFixed(2)}" stroke="#FFFFFF" stroke-width="2"/>`; }
  return `<svg class="wheel" id="wheel" viewBox="0 0 300 300" style="transform:rotate(${S.wheelRot}deg)" role="img" aria-label="Ruleta con ${n} premios"><defs>${defs}</defs><circle cx="150" cy="150" r="149" fill="#FFFFFF"/>${g}<circle cx="150" cy="150" r="122" fill="none" stroke="#FFFFFF" stroke-width="2"/><circle cx="150" cy="150" r="147.5" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1"/></svg>`;
}
function renderPremios() {
  const v = $('#v-premios'); if (!v) return;
  const sp = S.club.spins;
  v.innerHTML = `
    <div class="greet"><small>Ruleta de premios</small><h3>${sp ? 'Girá y ganá' : 'Pedí y ganás un giro'}</h3></div>
    <div class="spins-left">Giros disponibles <b id="spins-n">${sp}</b></div>
    <div class="wheel-wrap">
      <div class="pointer" id="pointer"><svg viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39C9 28 3 22 3 14a12 12 0 0 1 24 0c0 8-6 14-12 25z" fill="var(--a-accent)"/><circle cx="15" cy="14" r="5" fill="#FFFFFF"/></svg></div>
      ${wheelSVG()}
      <button class="spin-btn" type="button" data-act="spin" ${sp && !S.spinning ? '' : 'disabled'}>${S.spinning ? '…' : 'Girar'}</button>
    </div>
    <p class="fine" style="text-align:center">Cada compra te da un giro. El premio sale por tu compra, no por dejar una reseña.</p>
    <div id="win-area">${S.lastWin ? winHTML(S.lastWin) : ''}${fbHTML()}</div>
    ${sp ? '' : `<div style="margin-top:14px"><button class="cta" type="button" data-act="go" data-v="carta">${ic('menu')}Ir a la carta</button></div>`}`;
}
function winHTML(w) {
  return `<div class="win"><span class="gain">${ic('sparkle')}Premio</span><h4>¡Ganaste ${esc(w.label)}!</h4><p>${w.kind === 'stamp' ? 'Ya lo sumamos a tu tarjeta de sellos.' : `Lo guardamos en Mis premios con el código <b>${w.code}</b>. Vence mañana a las 20 h.`}</p></div>`;
}
function fbHTML() {
  const f = S.fb; if (!f) return '';
  if (f.stage === 'rate') {
    const tags = ['Café', 'Atención', 'Ambiente', 'Tiempo de espera', 'Precio'];
    return `<div class="win fb" style="margin-top:12px"><h4>¿Cómo estuvo hoy?</h4><p>Tu opinión le llega directo al equipo de ${esc(S.cafe.name)}.</p>
      <div class="cups" role="radiogroup" aria-label="Calificación">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="${n <= f.rating ? 'on' : ''}" data-act="rate" data-n="${n}" role="radio" aria-checked="${n === f.rating}" aria-label="${n} de 5">${ic('cup')}</button>`).join('')}</div>
      ${f.rating ? `<div class="fb-tags">${tags.map(t => `<button type="button" class="chip" data-act="fbtag" data-t="${t}" aria-pressed="${f.tags.includes(t)}">${t}</button>`).join('')}</div>
      <textarea class="note" id="fb-text" rows="2" placeholder="Contanos algo más (opcional)">${esc(f.text)}</textarea>
      <button class="cta" type="button" data-act="fb-send">Enviar opinión</button>` : ''}
      <button type="button" class="wa-alt" style="border:0;background:none;cursor:pointer;margin-top:0" data-act="fb-skip">Ahora no</button></div>`;
  }
  if (f.stage === 'thanks') {
    return `<div class="win fb" style="margin-top:12px"><h4>¡Gracias por contarnos!</h4><p>${f.rating >= 4 ? 'Nos alegra un montón.' : 'Ya se lo pasamos al equipo para mejorar.'} ¿Lo contarías también en Google? Ayuda a que más gente nos encuentre.</p>
      <button class="google-btn" type="button" data-act="google"><span class="g-dot" aria-hidden="true"></span>Escribir una reseña en Google</button>
      ${f.text ? `<button class="cta ghost" type="button" data-act="copy-fb">${ic('copy')}Copiar lo que escribí</button>` : ''}
      <p class="fine" id="g-note">Es opcional y no cambia tu premio. Se lo proponemos a todos los clientes por igual.</p></div>`;
  }
  return '';
}
let pointerT;
function spin() {
  if (S.spinning || S.club.spins < 1) return;
  const P = activePrizes(); const n = P.length; if (!n) return;
  const avail = P.filter(p => p.given < p.cap && p.w > 0);
  const pool = avail.length ? avail : P;
  const tot = pool.reduce((a, p) => a + p.w, 0);
  let r = Math.random() * tot, prize = pool[0];
  for (const p of pool) { r -= p.w; if (r <= 0) { prize = p; break; } }
  if (window.__forcePrize) prize = P.find(p => p.id === window.__forcePrize) || prize;
  const idx = P.indexOf(prize); const seg = 360 / n;
  const target = -(idx * seg + seg / 2) + rand(-seg * 0.28, seg * 0.28);
  const cur = S.wheelRot;
  const delta = (((target - cur) % 360) + 360) % 360;
  const end = cur + 360 * 6 + delta;
  S.spinning = true; S.club.spins--; S.lastWin = null; S.fb = null;
  renderPremios(); renderDots(); renderHome();
  const wheel = $('#wheel'); const ptr = $('#pointer');
  const dur = reduced ? 600 : 5400; const t0 = Date.now();
  let lastSeg = Math.floor(cur / seg);
  const ease = t => 1 - Math.pow(1 - t, 4);
  (function frame() {
    const t = Math.min(1, (Date.now() - t0) / dur);
    const rot = cur + (end - cur) * ease(t);
    S.wheelRot = rot;
    if (wheel) wheel.style.transform = `rotate(${rot}deg)`;
    const sg = Math.floor((rot + seg / 2) / seg);
    if (sg !== lastSeg && ptr && !reduced) { lastSeg = sg; ptr.style.transition = 'none'; ptr.style.transform = 'rotate(-16deg)'; clearTimeout(pointerT); pointerT = setTimeout(() => { ptr.style.transition = 'transform .18s ease-out'; ptr.style.transform = ''; }, 40); }
    if (t < 1) requestAnimationFrame(frame); else finishSpin(prize);
  })();
}
function finishSpin(prize) {
  S.spinning = false; S.wheelRot = S.wheelRot % 360;
  prize.given++;
  const code = prize.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) + '-' + Math.floor(rand(1000, 9999));
  S.lastWin = { label: prize.label, kind: prize.kind, code };
  if (prize.kind === 'stamp') addStamps(prize.n || 1);
  else S.club.rewards.push({ id: 'w' + Date.now(), type: 'prize', title: prize.label[0].toUpperCase() + prize.label.slice(1), sub: 'Premio de la ruleta. Vence mañana a las 20 h', code, used: false });
  S.fb = { stage: 'rate', rating: 0, tags: [], text: '' };
  renderPremios(); renderSellos(); renderPanelBody();
  confetti();
  setTimeout(() => { const w = $('#win-area'), v = $('#v-premios'); if (w && v) v.scrollTo({ top: Math.max(0, w.offsetTop - 12), behavior: reduced ? 'auto' : 'smooth' }); }, 400);
}
function sendFeedback() {
  const f = S.fb; if (!f || !f.rating) return;
  const te = $('#fb-text'); f.text = te ? te.value.trim() : f.text;
  S.feedback.unshift({ r: f.rating, tags: f.tags.slice(), text: f.text || (f.rating >= 4 ? 'Todo muy rico.' : 'Sin comentario.'), where: S.where === 'mesa' ? 'Mesa ' + S.mesa : 'Para llevar', t: hhmm(Date.now()), low: f.rating <= 3, fresh: true, mine: true });
  f.stage = 'thanks';
  if (S.panelTab !== 'ruleta') S.badge.ruleta++;
  renderPremios(); renderPanelTabs(); renderPanelBody();
}

/* ───────────────────────── pedidos ───────────────────────── */
function createOrder(o) {
  const order = Object.assign({ id: 'A' + (++S.seq), t0: Date.now(), status: 'nuevo', fresh: true }, o);
  S.orders.push(order);
  if (S.panelTab !== 'barra') S.badge.barra++;
  if (order.mine || order.sim) {
    S.stats.ventas += order.total; S.stats.pedidos++;
    const h = new Date().getHours(); const hi = Math.max(0, Math.min(12, h - 8)); S.stats.hours[hi]++;
  }
  if (order.mine) scheduleAuto(order, Sim.isActive() && Sim.running() ? 60000 : 20000);
  else if (!order.sim) scheduleAuto(order, rand(9000, 15000));
  renderPanelTabs(); if (S.panelTab === 'barra') renderBoard(); else if (S.panelTab === 'numeros') renderPanelBody();
  return order;
}
function scheduleAuto(o, ms) {
  clearTimeout(o.auto);
  if (o.status === 'entregado') return;
  o.auto = setTimeout(() => {
    if (tour.running && o.mine) return;
    const next = { nuevo: 'preparando', preparando: 'listo', listo: 'entregado' }[o.status];
    advance(o.id, next, true);
  }, ms);
}
function advance(oid, to, auto) {
  const o = S.orders.find(x => x.id === oid); if (!o || o.status === 'entregado') return;
  o.status = to || { nuevo: 'preparando', preparando: 'listo', listo: 'entregado' }[o.status];
  if (o.status === 'preparando' && !o.sim) scheduleAuto(o, o.mine ? (Sim.isActive() && Sim.running() ? 60000 : 24000) : rand(18000, 28000));
  if (o.status === 'listo' && !o.sim) scheduleAuto(o, o.mine ? 45000 : rand(12000, 18000));
  if (o.status === 'listo' && o.mine && o.where === 'mesa' && Sim.isActive()) clearTimeout(o.auto);
  if (o.status === 'entregado') { clearTimeout(o.auto); setTimeout(() => { S.orders = S.orders.filter(x => x !== o || x.mine); renderBoard(); }, 300); }
  if (o.mine) {
    if (o.status === 'preparando') toast(`${BARISTA} está preparando tu pedido`, 'Te avisamos cuando esté listo.', 'cup');
    if (o.status === 'listo' && !o.rewarded) {
      o.rewarded = true;
      const coffees = o.items.filter(it => COFFEE_CATS.includes(byId(it.id).cat)).reduce((a, it) => a + it.qty, 0);
      toast(o.where === 'mesa' ? '¡Tu pedido está listo!' : '¡Listo para retirar!', o.where === 'mesa' ? 'Te lo llevamos a la mesa.' : 'Pasá por la barra cuando quieras.', 'bell');
      if (coffees) addStamps(coffees);
      S.club.spins++;
      renderDots(); renderPremios();
    }
    if (sheetKind === 'track') { const sh = $('#sheet'); sh.innerHTML = trackHTML(o); }
    renderHome();
  }
  if (S.panelTab === 'barra') renderBoard(); else renderPanelTabs();
}
function bgOrder() {
  const active = S.orders.filter(o => !o.mine && o.status !== 'entregado').length;
  if (active < 5 && !document.hidden) {
    const combo = pick(COMBOS);
    const llevar = Math.random() < 0.35;
    createOrder({
      mine: false, where: llevar ? 'llevar' : 'mesa', mesa: pick([2, 3, 4, 5, 6, 8, 9, 11, 12]), name: pick(NAMES), pickup: pick(['Ahora', 'En 15 min', 'En 30 min']),
      items: combo.map(([id, q, mods]) => ({ id, name: byId(id).name, qty: q, mods: mods.map(m => (OPTS.milk.items.some(x => x[0] === m) ? 'Leche de ' + m.toLowerCase() : m)), note: '' })),
      total: combo.reduce((a, [id, q]) => a + byId(id).price * q, 0)
    });
  }
  setTimeout(bgOrder, rand(26000, 42000));
}
function seedOrders() {
  const now = Date.now();
  const sim = Sim.isActive();
  const mk = (st, ago, data) => { const o = Object.assign({ id: 'A' + (++S.seq), t0: now - ago, status: st, fresh: false, mine: false, sim }, data); S.orders.push(o); if (!sim) scheduleAuto(o, st === 'listo' ? 14000 : rand(10000, 18000)); };
  mk('listo', 6.2 * 60e3, { where: 'mesa', mesa: 9, name: 'Caro', items: [{ id: 'cappuccino', name: 'Cappuccino', qty: 2, mods: ['Grande'], note: '' }, { id: 'medialunas', name: 'Medialunas de manteca', qty: 1, mods: [], note: '' }], total: 15800 });
  mk('preparando', 3.1 * 60e3, { where: 'llevar', mesa: 0, name: 'Agus', pickup: 'En 15 min', items: [{ id: 'iced', name: 'Iced latte', qty: 1, mods: ['Leche de avena'], note: 'Con poco hielo' }, { id: 'cookie', name: 'Cookie de chocolate', qty: 1, mods: [], note: '' }], total: 10400 });
  mk('nuevo', 0.6 * 60e3, { where: 'mesa', mesa: 3, name: 'Fede', items: [{ id: 'cortado', name: 'Cortado', qty: 2, mods: [], note: '' }, { id: 'tostado', name: 'Tostado de jamón y queso', qty: 1, mods: [], note: 'Bien tostado' }], total: 17300 });
}

/* ───────────────────────── panel del local ───────────────────────── */
const TABS = [['barra', 'Barra', 'ticket'], ['numeros', 'Números', 'chart'], ['clientes', 'Clientes', 'users'], ['ruleta', 'Ruleta y reseñas', 'wheel'], ['carta', 'Carta', 'menu'], ['marca', 'Tu marca', 'brush']];
function renderPanel() {
  const p = $('#panel');
  p.innerHTML = `<div class="panel-top"><div class="p-brand"><span class="p-logo" id="p-logo">C</span><div><b id="p-name">Cereza</b><small>Sucursal La Plata</small></div></div>
    <div class="p-meta"><span class="live"><i></i>En vivo</span><span class="clock" id="p-clock"></span></div></div>
    <div class="p-tabs" role="tablist" aria-label="Secciones del panel" id="p-tabs"></div>
    <div class="p-body" id="p-body" role="tabpanel"></div>`;
  renderPanelTabs(); renderPanelBody(); applyCafe();
}
function renderPanelTabs() {
  const t = $('#p-tabs'); if (!t) return;
  const nuevos = S.orders.filter(o => o.status === 'nuevo').length;
  t.innerHTML = TABS.map(([id, name, icn]) => {
    let cnt = '';
    if (id === 'barra' && nuevos) cnt = `<span class="cnt">${nuevos}</span>`;
    if (id === 'ruleta' && S.badge.ruleta) cnt = `<span class="cnt">${S.badge.ruleta}</span>`;
    return `<button type="button" role="tab" id="pt-${id}" aria-selected="${S.panelTab === id}" data-act="ptab" data-t="${id}">${ic(icn)}${name}${cnt}</button>`;
  }).join('');
}
function panelTab(id) { S.panelTab = id; if (id === 'barra') S.badge.barra = 0; if (id === 'ruleta') S.badge.ruleta = 0; renderPanelTabs(); renderPanelBody(); }
function renderPanelBody() {
  const b = $('#p-body'); if (!b) return;
  const t = S.panelTab;
  if (t === 'barra') return renderBoard();
  if (t === 'numeros') b.innerHTML = numerosHTML();
  if (t === 'clientes') b.innerHTML = clientesHTML();
  if (t === 'ruleta') b.innerHTML = ruletaHTML();
  if (t === 'carta') b.innerHTML = cartaAdminHTML();
  if (t === 'marca') { b.innerHTML = marcaHTML(); renderTent(); }
  if (t === 'numeros') bindCharts(b);
  S.feedback.forEach(f => (f.fresh = false));
}
/* barra */
function ticketHTML(o) {
  const btn = o.status === 'nuevo' ? `<button class="t-btn" type="button" data-act="adv" data-oid="${o.id}">Empezar</button>` : o.status === 'preparando' ? `<button class="t-btn ok" type="button" data-act="adv" data-oid="${o.id}">Listo</button>` : `<button class="t-btn" type="button" data-act="adv" data-oid="${o.id}">Entregado</button>`;
  const where = o.where === 'mesa' ? `MESA ${o.mesa}<small>${esc(o.name)}</small>` : `PARA LLEVAR<small>${esc(o.name)}, pasa ${esc((o.pickup || 'ahora').toLowerCase())}</small>`;
  const items = o.items.map(it => `<div class="t-it"><b>${it.qty}×</b> ${esc(it.name)}</div>${it.mods.map(m => `<div class="t-mod">+ ${esc(m)}</div>`).join('')}${it.note ? `<div class="t-note">${esc(it.note)}</div>` : ''}`).join('');
  const html = `<article class="ticket ${o.fresh ? 'fresh' : ''}" data-oid="${o.id}" aria-label="Pedido ${o.id}">
    <div class="t-head"><div class="t-where">${where}${o.mine ? '<span class="mine-tag">Tu pedido de la demo</span>' : ''}</div><div class="t-time">#${o.id}<br>${hhmm(o.t0)}</div></div>
    <div class="t-items">${items}</div>
    <div class="t-foot"><span class="t-timer" data-t0="${o.t0}">${elapsed(o.t0)}</span>${btn}</div>
  </article>`;
  o.fresh = false;
  return html;
}
function elapsed(t0) { const s = Math.max(0, Math.floor((Date.now() - t0) / 1000)); return Math.floor(s / 60) + ':' + pad(s % 60); }
function renderBoard() {
  const b = $('#p-body'); if (!b || S.panelTab !== 'barra') { renderPanelTabs(); return; }
  const cols = [['nuevo', 'Nuevos'], ['preparando', 'En preparación'], ['listo', 'Listos']];
  const scroll = $('.board', b) ? $('.board', b).scrollLeft : 0;
  b.innerHTML = `<div class="p-h"><h4>Comandas</h4><small>Tocá los botones como si fueras la barra</small></div>
    <div class="board">${cols.map(([st, name]) => {
      const list = S.orders.filter(o => o.status === st).sort((a, c) => a.t0 - c.t0);
      return `<div class="col" aria-label="${name}"><div class="col-h">${name}<span>${list.length}</span></div>${list.length ? list.map(ticketHTML).join('') : `<p class="col-empty">${st === 'nuevo' ? 'Sin pedidos nuevos' : st === 'preparando' ? 'Nada en preparación' : 'Nada para entregar'}</p>`}</div>`;
    }).join('')}</div>
    <p class="board-tip">${ic('check')}Cuando marcás "Listo", al cliente le llega el aviso en el celular y suma sus sellos.</p>`;
  const bd = $('.board', b); if (bd) bd.scrollLeft = scroll;
  tickTimers(); renderPanelTabs();
}
/* números */
function numerosHTML() {
  const st = S.stats;
  const avg = st.ventas / st.pedidos;
  return `<div class="p-h"><h4>Hoy en ${esc(S.cafe.name)}<span class="ex">Datos de ejemplo</span></h4><small>Se actualiza con cada pedido</small></div>
  <div class="kpis">
    <div class="kpi"><span>Ventas de hoy</span><b>${fmt(st.ventas)}</b><small>+12% que el sábado pasado</small></div>
    <div class="kpi"><span>Pedidos</span><b>${st.pedidos}</b><small>31 desde las mesas</small></div>
    <div class="kpi"><span>Ticket promedio</span><b>${fmt(avg)}</b><small>+8% con la ruleta</small></div>
    <div class="kpi"><span>Clientes que volvieron</span><b>41%</b><small>+9 puntos desde el club</small></div>
  </div>
  <div class="charts">
    <div class="chart-card"><h5>Pedidos por hora</h5><span class="sub">El pico es a la tarde: buen momento para el 2x1 de medialunas.</span>${barChart(st.hours)}<div class="tip" role="tooltip"></div></div>
    <div class="chart-card"><h5>Calificación en Google</h5><span class="sub">Promedio de los últimos seis meses, con 64 reseñas nuevas.</span>${lineChart()}<div class="tip" role="tooltip"></div></div>
    <div class="chart-card wide"><h5>Lo más vendido esta semana</h5><div class="hbars">${[['Flat white', 182], ['Medialunas', 164], ['Cappuccino', 121], ['Cortado', 98], ['Tostado', 76]].map(([n, v]) => `<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${(v / 182 * 100).toFixed(1)}%"></i></span><b>${v}</b></div>`).join('')}</div></div>
  </div>`;
}
function barChart(vals) {
  const W = 520, H = 190, L = 30, B = 24, T = 14, R = 6;
  const max = 15; const n = vals.length; const bw = (W - L - R) / n;
  const y = v => T + (H - T - B) * (1 - v / max);
  const nowIdx = Math.max(0, Math.min(12, new Date().getHours() - 8));
  let g = '';
  [0, 5, 10, 15].forEach(v => { g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; });
  vals.forEach((v, i) => {
    const x = L + i * bw + 3, w = bw - 6, top = y(v), h = (H - B) - top;
    const r = Math.min(4, w / 2, h);
    g += `<path d="M${x},${H - B}V${top + r}a${r},${r} 0 0 1 ${r},${-r}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}V${H - B}z" fill="var(--chart)" opacity="${i === nowIdx ? 1 : 0.55}" data-tip="${8 + i} h: ${v} pedidos"/>`;
    if (i % 2 === 0) g += `<text x="${x + w / 2}" y="${H - 7}" text-anchor="middle">${8 + i}</text>`;
    g += `<rect x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}" fill="transparent" data-tip="${8 + i} h: ${v} pedidos" data-hx="${x + w / 2}" data-hy="${top}"/>`;
  });
  const nx = L + nowIdx * bw + bw / 2;
  g += `<text x="${nx}" y="${y(vals[nowIdx]) - 6}" text-anchor="middle" class="lbl-strong">${vals[nowIdx]}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pedidos por hora de 8 a 20 h">${g}</svg>`;
}
function lineChart() {
  const W = 420, H = 190, L = 34, B = 24, T = 18, R = 28;
  const ms = ['may', 'jun', 'jul', 'ago', 'sep', 'oct'], vs = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7];
  const x = i => L + (W - L - R) * i / (ms.length - 1);
  const y = v => T + (H - T - B) * (1 - (v - 4) / 1);
  let g = '';
  [4, 4.5, 5].forEach(v => { g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v.toFixed(1).replace('.', ',')}</text>`; });
  const pts = vs.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  g += `<polygon points="${x(0)},${H - B} ${pts} ${x(ms.length - 1)},${H - B}" fill="var(--chart)" opacity=".1"/>`;
  g += `<polyline points="${pts}" fill="none" stroke="var(--chart)" stroke-width="2.2" stroke-linejoin="round"/>`;
  vs.forEach((v, i) => {
    g += `<text x="${x(i)}" y="${H - 7}" text-anchor="middle">${ms[i]}</text>`;
    const last = i === vs.length - 1;
    g += `<circle cx="${x(i)}" cy="${y(v)}" r="${last ? 5 : 3}" fill="${last ? 'var(--chart)' : 'var(--surface)'}" stroke="var(--chart)" stroke-width="2"/>`;
    g += `<rect x="${x(i) - 20}" y="${T}" width="40" height="${H - T - B}" fill="transparent" data-tip="${ms[i]}: ${v.toFixed(1).replace('.', ',')} estrellas" data-hx="${x(i)}" data-hy="${y(v)}"/>`;
  });
  g += `<text x="${x(ms.length - 1)}" y="${y(4.7) - 11}" text-anchor="middle" class="lbl-strong">4,7</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Calificación en Google de mayo a octubre, de 4,2 a 4,7">${g}</svg>`;
}
function bindCharts(root) {
  $$('.chart-card', root).forEach(card => {
    const svg = $('svg', card), tip = $('.tip', card); if (!svg || !tip) return;
    svg.addEventListener('pointermove', e => {
      const t = e.target.closest('[data-hx]'); if (!t) { tip.classList.remove('on'); return; }
      const vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect(), cr = card.getBoundingClientRect();
      const sx = r.width / vb.width;
      tip.textContent = t.dataset.tip;
      tip.style.left = (r.left - cr.left + (+t.dataset.hx) * sx) + 'px';
      tip.style.top = (r.top - cr.top + (+t.dataset.hy) * sx - 4) + 'px';
      tip.classList.add('on');
    });
    svg.addEventListener('pointerleave', () => tip.classList.remove('on'));
  });
}
/* clientes */
function clientesHTML() {
  const c = S.campaign;
  const preview = c.text.replace('{nombre}', 'Julián').replace('{cafe}', S.cafe.name);
  const rows = [{ name: S.club.member + ' (vos)', stamps: S.club.stamps, last: 'Hoy', visits: 23, st: 'ok', me: true }, ...S.members];
  const stl = { ok: ['ok', 'Frecuente'], warn: ['warn', 'Inactivo'], new: ['new', 'Nueva'] };
  return `<div class="p-h"><h4>Club ${esc(S.cafe.name)}<span class="ex">Datos de ejemplo</span></h4><small>1.284 socios, 57 sellos dados hoy</small></div>
  <div class="cl-grid">
    <div class="camp">
      <div class="risk"><b>48</b><span>clientes del club no vienen hace más de 21 días. Mandales un motivo para volver.</span></div>
      <label class="b-field" for="camp-text" style="margin:0">Mensaje por WhatsApp<textarea id="camp-text">${esc(c.text)}</textarea></label>
      <div class="wa-prev"><div class="wa-bubble" id="camp-prev">${esc(preview)}</div></div>
      ${c.sent ? `<div class="progress"><i style="width:${c.sent / 48 * 100}%"></i></div><p class="fine" style="color:var(--muted);font-size:13px">${c.sending ? `Enviando… ${c.sent} de 48` : 'Enviado a 48 clientes. Te avisamos en el panel cuando vuelvan.'}</p>` : ''}
      <button class="btn btn-ink btn-sm" type="button" data-act="camp-send" ${c.sending || c.sent >= 48 ? 'disabled' : ''}>${ic('send')}${c.sent >= 48 ? 'Campaña enviada' : 'Enviar a 48 clientes'}</button>
      <p style="font-size:12.5px;color:var(--muted)">En esta demo no se envía ningún mensaje.</p>
    </div>
    <div class="tbl-scroll"><table class="mtable"><thead><tr><th>Socio</th><th>Sellos</th><th>Última visita</th><th>Estado</th></tr></thead><tbody>
      ${rows.map(m => `<tr class="${m.me ? 'me' : ''}"><td><b>${esc(m.name)}</b><br><span style="color:var(--muted);font-size:12px">${m.visits} visitas</span></td><td><div class="mini">${Array.from({ length: 10 }, (_, i) => `<i class="${i < m.stamps ? 'on' : ''}"></i>`).join('')}</div></td><td class="nw">${m.last}</td><td><span class="st ${stl[m.st][0]}">${stl[m.st][1]}</span></td></tr>`).join('')}
    </tbody></table></div>
  </div>`;
}
async function sendCampaign() {
  const c = S.campaign; if (c.sending) return;
  c.sending = true; c.sent = 0;
  for (let i = 1; i <= 48; i++) { c.sent = i; if (i % 4 === 0 || i === 48) { if (S.panelTab === 'clientes') renderPanelBody(); } await wait(55); }
  c.sending = false; if (S.panelTab === 'clientes') renderPanelBody();
}
/* ruleta y reseñas */
function ruletaHTML() {
  const P = S.prizes; const tot = P.filter(p => p.on).reduce((a, p) => a + p.w, 0) || 1;
  const avg = (S.feedback.reduce((a, f) => a + f.r, 0) / S.feedback.length).toFixed(1).replace('.', ',');
  return `<div class="p-h"><h4>Ruleta de premios</h4><small>Los cambios se ven al instante en la ruleta del cliente</small></div>
  <div class="rz-grid">
    <div>
      <div class="prize-head"><span></span><span>Premio</span><span>Chances</span><span style="text-align:right">%</span><span>Tope</span></div>
      ${P.map((p, i) => `<div class="prize-row"><span class="c" style="background:${p.color}"></span>
        <input type="text" value="${esc(p.short)}" data-act="pz-name" data-i="${i}" aria-label="Nombre del premio ${i + 1}" maxlength="12">
        <input type="range" min="0" max="40" value="${p.w}" data-act="pz-w" data-i="${i}" aria-label="Chances de ${esc(p.short)}">
        <span class="pct" id="pz-pct-${i}">${Math.round(p.w / tot * 100)}%</span>
        <input type="number" min="0" max="999" value="${p.cap >= 999 ? '' : p.cap}" placeholder="Sin" data-act="pz-cap" data-i="${i}" aria-label="Tope por día de ${esc(p.short)}">
      </div>`).join('')}
      <div class="policy">${ic('shield')}<span>El giro sale por la compra, nunca por dejar una reseña, y la invitación a opinar en Google les llega a todos por igual. Así se cumplen las reglas de Google y tus reseñas no corren riesgo.</span></div>
    </div>
    <div>
      <div class="fb-stats"><div class="kpi"><span>Calificación de hoy</span><b>${avg}</b></div><div class="kpi"><span>Invitados a Google hoy</span><b>${S.googleInvites}</b></div></div>
      <div class="p-h" style="margin-bottom:10px"><h4 style="font-size:16px">Opiniones privadas</h4><small>Solo las ves vos</small></div>
      <div class="fb-list">${S.feedback.map((f, i) => `<div class="fb-item ${f.low ? 'low' : ''} ${f.fresh ? 'fresh' : ''}">
        <div class="fb-top"><span class="cupsr" aria-label="${f.r} de 5">${[1, 2, 3, 4, 5].map(n => `<span class="${n <= f.r ? '' : 'off'}">${ic('cup')}</span>`).join('')}</span><span>${f.where}, ${f.t}${f.mine ? ', desde la demo' : ''}</span></div>
        <p>${esc(f.text)}</p>
        ${f.tags.length ? `<div class="fb-top" style="justify-content:flex-start">${f.tags.map(t => `<span class="st new">${t}</span>`).join('')}</div>` : ''}
        ${f.low && !f.done ? `<div class="acts"><button type="button" data-act="fb-done" data-i="${i}">Marcar resuelto</button><button type="button" data-act="fb-done" data-i="${i}">Ofrecer un café</button></div>` : ''}
        ${f.done ? `<span class="st ok" style="justify-self:start">${f.done}</span>` : ''}
      </div>`).join('')}</div>
    </div>
  </div>`;
}
/* carta admin */
function cartaAdminHTML() {
  return `<div class="p-h"><h4>Carta</h4><small>Lo que cambies acá se ve al instante en todas las mesas</small></div>
  <div class="menu-tools">
    <div class="tool"><label for="m-dia">Café de hoy</label><div class="row"><select id="m-dia" data-act="m-dia">${S.products.filter(p => p.cat === 'filtrados').map(p => `<option value="${p.id}" ${S.delDia === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div><span class="note-ok"></span></div>
    <div class="tool"><label for="m-pct">Aumento general</label><div class="row"><input type="number" id="m-pct" min="1" max="100" value="8" aria-label="Porcentaje de aumento"><span>%</span><button class="btn btn-ink btn-sm" type="button" data-act="m-raise">Aplicar a toda la carta</button></div><span class="note-ok" id="m-raise-note"></span></div>
  </div>
  <div class="mlist">${CATS.map(c => `<p class="cat-h">${c.name}</p>${S.products.filter(p => p.cat === c.id).map(p => `<div class="mrow"><img src="${IMG[p.img]}" alt=""><div><div class="nm">${esc(p.name)}</div><div class="ct">${p.on ? 'Visible en la carta' : 'Marcado como agotado'}</div></div>
    <label class="price-in" id="pi-${p.id}"><span>$</span><input type="number" min="0" step="100" value="${p.price}" data-act="m-price" data-id="${p.id}" aria-label="Precio de ${esc(p.name)}"></label>
    <button class="toggle" type="button" data-act="m-on" data-id="${p.id}" aria-pressed="${p.on}"><span class="sw ${p.on ? 'on' : ''}"></span>${p.on ? 'Hay' : 'Agotado'}</button></div>`).join('')}`).join('')}</div>`;
}
/* tu marca */
function shareLink(mesa) {
  const base = CONFIG.publicUrl && CONFIG.publicUrl.indexOf('{{') < 0 ? CONFIG.publicUrl : (/^https?:$/.test(location.protocol) && !/claude/.test(location.hostname) ? location.origin + location.pathname : 'https://claude.ai');
  return `${base}#cafe-${cafeSlug()}${mesa ? '-mesa-' + mesa : ''}`;
}
function marcaHTML() {
  return `<div class="p-h"><h4>Tu marca</h4><small>Nombre, colores y QR de las mesas</small></div>
  <div class="brand-grid">
    <div>
      <label class="b-field" for="b-name">Nombre del café<input id="b-name" value="${esc(S.cafe.name)}" maxlength="32" data-act="b-name"></label>
      <label class="b-field" for="b-tag">Frase debajo del nombre<input id="b-tag" value="${esc(S.cafe.tagline)}" maxlength="34" data-act="b-tag"></label>
      <p class="b-field" style="margin-bottom:8px">Estilo</p>
      <div class="skins">${Object.entries(SKINS).map(([k, s]) => `<button type="button" class="skin" data-act="skin" data-s="${k}" aria-pressed="${S.cafe.skin === k}"><span class="sp" style="background:${s.bg};color:${s.text};font-family:${s.font};font-weight:${s.fw};box-shadow:inset 0 -14px 0 ${s.accent}">Aa</span><span>${s.name}<br><small style="font-weight:500;color:var(--muted)">${s.desc}</small></span></button>`).join('')}</div>
      <p class="b-field" style="margin:16px 0 0">Link de tu carta para Instagram y WhatsApp</p>
      <div class="linkbox"><input id="b-link" readonly value="${esc(shareLink())}" aria-label="Link de tu carta"><button class="copy" type="button" data-act="copy-link">Copiar</button></div>
    </div>
    <div class="tent">
      <div class="mesa-pick"><label for="tent-mesa">QR para la mesa</label><select id="tent-mesa" data-act="tent-mesa">${Array.from({ length: 12 }, (_, i) => `<option ${S.tentMesa === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></div>
      <div class="tent-card" id="tent-card"></div>
      <p style="font-size:12.5px;color:var(--muted)">Escaneá el código con tu celular: abre esta carta en la mesa ${S.tentMesa}.</p>
    </div>
  </div>`;
}
function renderTent() {
  const el = $('#tent-card'); if (!el) return;
  const s = SKINS[S.cafe.skin];
  el.style.background = s.bg; el.style.color = s.text;
  el.innerHTML = `<span class="tn" style="font-family:${s.font};font-weight:${s.fw}">${esc(S.cafe.name)}</span><span class="ts">Escaneá para ver la carta y pedir</span><div class="tq" id="tent-qr"></div><span class="tm" style="color:${s.accent}">MESA ${S.tentMesa}</span>`;
  qrInto($('#tent-qr'), shareLink(S.tentMesa), s.text);
}

/* ───────────────────────── eventos ───────────────────────── */
function onAppClick(e) {
  const b = e.target.closest('[data-act]'); if (!b || !$('#app').contains(b)) return;
  const a = b.dataset.act;
  if (a === 'go') return go(b.dataset.v);
  if (a === 'open-prod') { if (b.getAttribute('aria-disabled') === 'true' || b.disabled) return; flipFrom = $('img', b); return openProduct(b.dataset.id); }
  if (a === 'close-sheet') return closeSheet();
  if (a === 'opt') return setOpt(b.dataset.k, +b.dataset.i);
  if (a === 'dqty') { S.draft.qty = Math.max(1, Math.min(9, S.draft.qty + +b.dataset.d)); return updateDraftCTA(); }
  if (a === 'add-draft') return addDraft();
  if (a === 'open-cart') return openCart();
  if (a === 'cqty') { const c = S.cart[+b.dataset.i]; c.qty += +b.dataset.d; if (c.qty <= 0) S.cart.splice(+b.dataset.i, 1); if (!S.cart.length) { closeSheet(); return renderCartBar(); } return openSheet(cartSheetHTML(), 'cart'); }
  if (a === 'where') { const n = $('#take-name'); if (n) S.takeName = n.value; S.where = b.dataset.w; return openSheet(cartSheetHTML(), 'cart'); }
  if (a === 'pickup') { const n = $('#take-name'); if (n) S.takeName = n.value; S.pickup = b.dataset.t; return openSheet(cartSheetHTML(), 'cart'); }
  if (a === 'toggle-reward') { S.useReward = !S.useReward; return openSheet(cartSheetHTML(), 'cart'); }
  if (a === 'send-order') return sendOrder();
  if (a === 'open-track') return openTrack();
  if (a === 'cat') { S.catFilter = b.dataset.c; $$('.chip[data-act="cat"]', $('#app')).forEach(c => c.setAttribute('aria-pressed', c.dataset.c === S.catFilter)); return renderCarta(); }
  if (a === 'show-code') return openCode();
  if (a === 'sim-stamp') { addStamps(1); toast('Sumaste un sello', 'La barra escaneó tu código.', 'stamp'); return; }
  if (a === 'spin') return spin();
  if (a === 'rate') { S.fb.rating = +b.dataset.n; return renderPremios(); }
  if (a === 'fbtag') { const te = $('#fb-text'); if (te) S.fb.text = te.value; const t = b.dataset.t; const i = S.fb.tags.indexOf(t); if (i >= 0) S.fb.tags.splice(i, 1); else S.fb.tags.push(t); return renderPremios(); }
  if (a === 'fb-send') return sendFeedback();
  if (a === 'fb-skip') { S.fb = null; return renderPremios(); }
  if (a === 'google') { S.googleInvites++; const n = $('#g-note'); if (n) n.textContent = `En tu café, este botón abre directo el perfil de ${S.cafe.name} en Google para escribir la reseña.`; if (S.panelTab === 'ruleta') renderPanelBody(); return; }
  if (a === 'copy-fb') return copyText(S.fb.text, b);
}
function onAppKey(e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.prow[data-act]')) { e.preventDefault(); onAppClick({ target: e.target }); }
  if (e.key === 'Escape') closeSheet();
}
function onPanelClick(e) {
  const b = e.target.closest('[data-act]'); if (!b || !$('#panel').contains(b)) return;
  const a = b.dataset.act;
  if (a === 'ptab') return panelTab(b.dataset.t);
  if (a === 'adv') { const o = S.orders.find(x => x.id === b.dataset.oid); if (o) { clearTimeout(o.auto); advance(o.id); } return; }
  if (a === 'camp-send') return sendCampaign();
  if (a === 'fb-done') { const f = S.feedback[+b.dataset.i]; f.done = b.textContent.includes('café') ? 'Le ofreciste un café' : 'Resuelto'; return renderPanelBody(); }
  if (a === 'm-raise') {
    const pct = Math.max(1, Math.min(100, +($('#m-pct').value || 0)));
    S.products.forEach(p => (p.price = Math.round(p.price * (1 + pct / 100) / 100) * 100));
    renderPanelBody(); $$('.price-in', $('#panel')).forEach(el => el.classList.add('flash'));
    const n = $('#m-raise-note'); if (n) n.textContent = `Listo: subiste ${pct}% toda la carta, redondeado a $100.`;
    setTimeout(() => $$('.price-in.flash').forEach(el => el.classList.remove('flash')), 1200);
    renderHome(); renderCarta(); return;
  }
  if (a === 'm-on') { const p = byId(b.dataset.id); p.on = !p.on; renderPanelBody(); renderCarta(); renderHome(); return; }
  if (a === 'skin') { S.cafe.skin = b.dataset.s; applyCafe(); renderPanelBody(); return; }
  if (a === 'copy-link') return copyText($('#b-link').value, b);
}
function onPanelInput(e) {
  const t = e.target; const a = t.dataset.act; if (!a) return;
  if (a === 'pz-name') { S.prizes[+t.dataset.i].short = t.value || '—'; return renderPremiosWheelOnly(); }
  if (a === 'pz-w') {
    S.prizes[+t.dataset.i].w = +t.value;
    const tot = S.prizes.filter(p => p.on).reduce((x, p) => x + p.w, 0) || 1;
    S.prizes.forEach((p, i) => { const el = $('#pz-pct-' + i); if (el) el.textContent = Math.round(p.w / tot * 100) + '%'; });
    return;
  }
  if (a === 'pz-cap') { S.prizes[+t.dataset.i].cap = t.value === '' ? 999 : Math.max(0, +t.value); return; }
  if (a === 'm-price') { const p = byId(t.dataset.id); const v = Math.max(0, Math.round(+t.value || 0)); p.price = v; renderCarta(); renderHome(); return; }
  if (a === 'b-name') { if (t.value.trim()) { S.cafe.name = t.value.trim().slice(0, 32); S.cafe.custom = true; applyCafe(); renderAppAll(); const l = $('#b-link'); if (l) l.value = shareLink(); renderTent(); const hi = $('#cafe-input'); if (hi) hi.value = S.cafe.name; } return; }
  if (a === 'b-tag') { S.cafe.tagline = t.value; applyCafe(); return; }
  if (t.id === 'camp-text') { S.campaign.text = t.value; const pv = $('#camp-prev'); if (pv) pv.textContent = t.value.replace('{nombre}', 'Julián').replace('{cafe}', S.cafe.name); }
}
function onPanelChange(e) {
  const t = e.target; const a = t.dataset.act;
  if (a === 'm-dia') { S.delDia = t.value; renderHome(); const n = t.closest('.tool').querySelector('.note-ok'); if (n) n.textContent = 'Ya se ve en la pantalla de inicio.'; }
  if (a === 'tent-mesa') { S.tentMesa = +t.value; renderPanelBody(); }
}
function renderPremiosWheelOnly() { const w = $('#wheel'); if (w) w.outerHTML = wheelSVG(); }

/* ───────────────────────── landing ───────────────────────── */
function bindLanding() {
  const waUrl = t => `https://wa.me/${CONFIG.novantiqWhatsapp}?text=${encodeURIComponent(t)}`;
  $$('.wa-link').forEach(a => (a.href = waUrl('Hola Novantiq, quiero saber más de NOVANTIQ Café para mi cafetería.')));
  const wt = $('#wa-text'); if (wt) wt.textContent = CONFIG.novantiqWhatsappText;
  const ig = $('#ig-link'); if (ig) { ig.href = `https://www.instagram.com/${CONFIG.instagram}/`; ig.textContent = '@' + CONFIG.instagram; }
  $('#cafe-form').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#cafe-input').value;
    if (!setCafeName(v, true)) { $('#cafe-hint').textContent = 'Escribí el nombre de tu café para verlo en la demo.'; $('#cafe-input').focus(); return; }
    $('#cafe-hint').textContent = `Listo. Bajá a la demo: la carta, los sellos y el panel ya dicen "${S.cafe.name}".`;
    try { location.hash = 'cafe-' + cafeSlug(); } catch (err) { }
    setTimeout(() => $('#demo').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }), 250);
  });
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => copyText($(b.dataset.copy).textContent, b)));
  // calculadora
  const ids = ['clientes', 'ticket', 'vuelven', 'apps', 'comision'];
  const calc = () => {
    const v = Object.fromEntries(ids.map(k => [k, +$('#c-' + k).value]));
    $('#o-clientes').textContent = v.clientes;
    $('#o-ticket').textContent = fmt(v.ticket);
    $('#o-vuelven').textContent = v.vuelven + ' de 100';
    $('#o-apps').textContent = v.apps;
    $('#o-comision').textContent = v.comision + '%';
    const extra = Math.round(v.clientes * 26 * v.vuelven / 100);
    const visitas = extra * v.ticket;
    const comis = v.apps * 4.3 * v.ticket * v.comision / 100;
    const plan = CONFIG.plans[1].m * CONFIG.usdArs;
    const max = Math.max(visitas, comis, plan, 1);
    $('#r-total').textContent = fmt(visitas + comis);
    $('#r-visitas').textContent = fmt(visitas); $('#b-visitas').style.width = (visitas / max * 100) + '%';
    $('#r-comis').textContent = fmt(comis); $('#b-comis').style.width = (comis / max * 100) + '%';
    $('#r-plan').textContent = fmt(plan); $('#b-plan').style.width = (plan / max * 100) + '%';
    $('#r-cafes').textContent = Math.ceil(plan / v.ticket);
    $('#r-extra').textContent = extra.toLocaleString('es-AR');
    $('#calc-note').textContent = `Calculado con 26 días de atención y 4,3 semanas por mes. Plan Doble: USD ${CONFIG.plans[1].m} por mes, unos ${fmt(plan)} al cambio de ${CONFIG.usdArsLabel}.`;
  };
  ids.forEach(k => $('#c-' + k).addEventListener('input', calc)); calc();
  // precios
  let annual = false;
  const plans = () => {
    $('#plans').innerHTML = CONFIG.plans.map(p => {
      const price = annual ? p.m * 10 : p.m;
      return `<article class="plan ${p.rec ? 'rec' : ''}">${p.rec ? '<span class="rec-tag">El más elegido</span>' : ''}
        <div><h3>${p.id}</h3><p class="for">${p.for}</p></div>
        <div><div class="price"><b>USD ${price}</b><span>${annual ? 'por año' : 'por mes'}</span></div><p class="price-sub">${annual ? `Equivale a USD ${(p.m * 10 / 12).toFixed(2).replace('.', ',')} por mes` : `Unos ${fmt(p.m * CONFIG.usdArs)} por mes`}</p></div>
        <ul>${p.feats.map(f => `<li>${f}</li>`).join('')}${p.off.map(f => `<li class="off">${f}</li>`).join('')}</ul>
        <a class="btn ${p.rec ? 'btn-ink' : 'btn-quiet'}" href="#fundadores" data-plan="${p.id}">Elegir ${p.id}</a></article>`;
    }).join('');
    const ex = CONFIG.plans.find(p => p.rec) || CONFIG.plans[0];
    const row = (k, v) => `<li><span>${k}</span><b>${v}</b></li>`;
    $('#price-notes').innerHTML = `<h3>Cómo se paga</h3>
      <div class="pay-cols">
        <div class="pay-col found"><p class="pay-h">Cafetería fundadora <span>10 lugares</span></p><ul>${row('Instalación', 'Sin cargo')}${row('Mes 1', 'Sin cargo')}${row('Desde el mes 2', `USD ${ex.m} por mes`)}${row('Precio del abono', 'Congelado 12 meses')}</ul></div>
        <div class="pay-col"><p class="pay-h">Cualquier cafetería</p><ul>${row('Instalación', `USD ${CONFIG.install}, una sola vez`)}${row('Mes 1', `USD ${ex.m}`)}${row('Desde el mes 2', `USD ${ex.m} por mes`)}${row('Precio del abono', 'El de la lista vigente')}</ul></div>
      </div>
      <p class="pay-foot">Ejemplo con el plan ${ex.id}. Para todos: plazo mínimo de 3 meses y después seguís mes a mes, con baja cuando quieras. Se cobra en pesos, al cambio del día 1 de cada mes.</p>`;
    $$('#plans [data-plan]').forEach(a => a.addEventListener('click', () => { const s = $('#l-plan'); if (s) s.value = a.dataset.plan; }));
  };
  $('#bill-m').addEventListener('click', () => { annual = false; $('#bill-m').setAttribute('aria-pressed', 'true'); $('#bill-a').setAttribute('aria-pressed', 'false'); plans(); });
  $('#bill-a').addEventListener('click', () => { annual = true; $('#bill-a').setAttribute('aria-pressed', 'true'); $('#bill-m').setAttribute('aria-pressed', 'false'); plans(); });
  plans();
  // formulario
  $('#lead-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = id => ($('#' + id).value || '').trim();
    const out = $('#lead-out');
    if (!f('l-nombre') || !f('l-cafe')) { out.textContent = 'Completá tu nombre y el de la cafetería para armar el mensaje.'; (f('l-nombre') ? $('#l-cafe') : $('#l-nombre')).focus(); return; }
    const msg = `Hola Novantiq, soy ${f('l-nombre')} de ${f('l-cafe')}${f('l-loc') ? ' (' + f('l-loc') + ')' : ''}. Tenemos ${f('l-mesas').toLowerCase()} mesas y me interesa el plan ${f('l-plan')}. Quiero mi demo de NOVANTIQ Café.`;
    out.innerHTML = `Tu mensaje está listo: <a href="${waUrl(msg)}" target="_blank" rel="noopener">abrir WhatsApp con el mensaje</a> o <button class="copy" type="button" id="copy-msg">copiarlo</button>.`;
    $('#copy-msg').addEventListener('click', ev => copyText(msg, ev.currentTarget));
    if (!S.cafe.custom) setCafeName(f('l-cafe'));
  });
  $('#reset-btn').addEventListener('click', resetDemo);
  $('#tour-btn').addEventListener('click', () => (tour.running ? tourStop() : tourStart()));
}
function resetDemo() {
  const keep = { cafe: S.cafe, mesa: S.mesa };
  S.orders.forEach(o => clearTimeout(o.auto));
  S = freshState(keep);
  seedOrders(); Sim.reset();
  renderAppShell(); renderAppAll(); go('inicio'); renderPanel();
}

/* ───────────────────────── recorrido guiado ───────────────────────── */
const tour = { running: false, paused: false, i: 0, token: 0 };
const TOUR = [
  { text: 'Tu cliente escanea el QR de la mesa y se abre la carta de tu café, con fotos y precios del día.', target: '#phone', act: async () => { closeSheet(); go('carta'); await wait(900); const v = $('#v-carta'); if (v) v.scrollTo({ top: 180, behavior: 'smooth' }); } },
  { text: 'Elige un flat white y lo arma a su gusto: leche de avena y un shot extra.', target: '#phone', act: async () => { openProduct('flatwhite'); await wait(1100); setOpt('milk', 3); await wait(900); setOpt('extra', 0); } },
  { text: 'Lo suma al pedido y lo manda a la barra. Sin esperar a que lo atiendan.', target: '#phone', act: async () => { addDraft(); await wait(1000); openCart(); await wait(1600); sendOrder(); } },
  { text: 'La comanda sale al instante en la tablet de la barra, con la leche y el extra bien marcados.', target: '#panel', act: async () => { panelTab('barra'); } },
  { text: 'La barra lo marca listo y al cliente le llega el aviso en el celular.', target: '#phone', act: async () => { const o = myActive(); if (o) { clearTimeout(o.auto); advance(o.id, 'preparando'); await wait(1500); advance(o.id, 'listo'); } } },
  { text: 'Cada café suma un sello. Al décimo, el café va por cuenta de la casa.', target: '#phone', act: async () => { closeSheet(); await wait(300); go('sellos'); } },
  { text: 'Y cada compra le da un giro en la ruleta de premios.', target: '#phone', act: async () => { go('premios'); await wait(800); window.__forcePrize = 'medialuna'; spin(); window.__forcePrize = null; await wait(reduced ? 900 : 6000); } },
  { text: 'Después cuenta cómo le fue. Vos lo leés primero, y a todos los invitamos a contarlo en Google.', target: '#phone', act: async () => { if (!S.fb) S.fb = { stage: 'rate', rating: 0, tags: [], text: '' }; S.fb.rating = 5; renderPremios(); await wait(700); S.fb.tags = ['Café', 'Atención']; S.fb.text = 'El flat white con avena, buenísimo.'; renderPremios(); await wait(900); sendFeedback(); } },
  { text: 'Vos ves todo en números: ventas, horarios pico y cuántos clientes vuelven.', target: '#panel', act: async () => { panelTab('numeros'); } },
  { text: 'Y lo dejás con la cara de tu café en un minuto: nombre, colores y los QR de las mesas.', target: '#panel', act: async () => { panelTab('marca'); } }
];
function placeRing() {
  if (!tour.running) return;
  const st = TOUR[tour.i]; const el = st && $(st.target); const ring = $('#tour-ring'); if (!el || !ring) return;
  const r = el.getBoundingClientRect(); const pad = 8;
  ring.style.left = (r.left - pad) + 'px'; ring.style.top = (r.top - pad) + 'px'; ring.style.width = (r.width + pad * 2) + 'px'; ring.style.height = (r.height + pad * 2) + 'px';
}
async function tourStep(i) {
  const my = ++tour.token;
  tour.i = i; const st = TOUR[i];
  $('#tour-step').textContent = `Paso ${i + 1} de ${TOUR.length}`;
  $('#tour-text').textContent = st.text;
  $('#tour-next').textContent = i === TOUR.length - 1 ? 'Terminar' : 'Siguiente';
  const el = $(st.target);
  if (el) { const r = el.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight - 40) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: r.height > innerHeight - 160 ? 'start' : 'center' }); }
  placeRing(); setTimeout(placeRing, 450); setTimeout(placeRing, 900);
  const bar = $('#tour-progress'); bar.style.transition = 'none'; bar.style.width = '0';
  await st.act();
  if (my !== tour.token || !tour.running) return;
  placeRing();
  const dwell = 3600;
  void bar.offsetWidth; bar.style.transition = `width ${dwell}ms linear`; bar.style.width = '100%';
  await wait(dwell);
  if (my !== tour.token || !tour.running) return;
  if (tour.paused) return;
  if (i < TOUR.length - 1) tourStep(i + 1); else tourStop();
}
function tourStart() {
  resetDemo();
  tour.running = true; tour.paused = false;
  $('#tour').hidden = false; $('#tour-pause').textContent = 'Pausar';
  $('#tour-btn').innerHTML = `${ic('close')}Cortar recorrido`;
  window.addEventListener('scroll', placeRing, { passive: true }); window.addEventListener('resize', placeRing);
  tourStep(0);
}
function tourStop() {
  tour.running = false; tour.token++;
  $('#tour').hidden = true;
  $('#tour-btn').innerHTML = `${ic('play')}Ver recorrido guiado`;
  window.removeEventListener('scroll', placeRing); window.removeEventListener('resize', placeRing);
}
function bindTour() {
  $('#tour-close').addEventListener('click', tourStop);
  $('#tour-next').addEventListener('click', () => { if (tour.i < TOUR.length - 1) { tour.paused = false; $('#tour-pause').textContent = 'Pausar'; tourStep(tour.i + 1); } else tourStop(); });
  $('#tour-pause').addEventListener('click', () => {
    tour.paused = !tour.paused; $('#tour-pause').textContent = tour.paused ? 'Seguir' : 'Pausar';
    if (!tour.paused) tourStep(Math.min(tour.i + 1, TOUR.length - 1));
  });
  const prev = $('#tour-prev'); if (prev) prev.hidden = true;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && tour.running) tourStop(); });
}

/* ───────────────────────── reloj ───────────────────────── */
function tickTimers() {
  $$('.t-timer').forEach(el => {
    const s = (Date.now() - +el.dataset.t0) / 1000;
    el.textContent = elapsed(+el.dataset.t0);
    el.classList.toggle('warn', s >= 300 && s < 480); el.classList.toggle('late', s >= 480);
  });
}
function tick() {
  const now = new Date(); const t = pad(now.getHours()) + ':' + pad(now.getMinutes());
  const a = $('#st-time'); if (a) a.textContent = t;
  const p = $('#p-clock'); if (p) p.textContent = t;
  tickTimers();
}

/*{{MOTION}}*/

/*{{SIM}}*/

/* ───────────────────────── inicio ───────────────────────── */
function init() {
  S = freshState();
  parseHash();
  renderAppShell(); renderAppAll(); go('inicio');
  const simOn = Sim.init();
  seedOrders(); renderPanel(); Sim.reset();
  const app = $('#app');
  app.addEventListener('click', onAppClick); app.addEventListener('keydown', onAppKey);
  app.addEventListener('input', e => { if (e.target.id === 'q') { S.q = e.target.value; renderCarta(); } });
  const panel = $('#panel');
  panel.addEventListener('click', onPanelClick); panel.addEventListener('input', onPanelInput); panel.addEventListener('change', onPanelChange);
  bindLanding(); bindTour(); bindMotion();
  window.addEventListener('hashchange', () => { if (parseHash()) { applyCafe(); renderAppAll(); renderPanelBody(); } });
  tick(); setInterval(tick, 1000);
  if (!window.__VIDEO && !simOn) setTimeout(bgOrder, 18000);
  window.NQ = { Sim, S: () => S, go, openProduct, setOpt, addDraft, openCart, sendOrder, advance, myActive, panelTab, spin, addStamps, openCode, closeSheet, tourStart, tourStop, sendFeedback, renderPremios, setCafeName, resetDemo, openTrack };
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
