/* ───────────────────────── simulación del salón ───────────────────────── */
const Sim = (() => {
  /* Mundo en unidades de piso: x 0..600, y 0..780 (la pared del fondo se ve de frente, y < 0).
     La vista es oblicua: el piso se dibuja desde arriba y todo lo que tiene altura sube en pantalla. */
  const WW = 600, WH = 780, CX = 300, BAR_Y = 66, TOP = -66;
  const VW = WW, VH = WH - TOP;
  const TS = 20; // segundos del café por segundo de simulación, para mostrar esperas en minutos
  const AY = { a0: 132, a1: 293, a2: 456, a3: 628 };
  const P = {
    caja: { x: 112, y: 128, ay: AY.a0 }, cajaIn: { x: 96, y: BAR_Y }, wait: { x: 330, y: 146, ay: AY.a0 }, pick: { x: 372, y: 126, ay: AY.a0 },
    mozoHome: { x: 420, y: 150, ay: AY.a0 }, barHome: { x: 262, y: BAR_Y }, bar2Home: { x: 312, y: BAR_Y },
    grinder: { x: 232, y: BAR_Y }, machine: { x: 150, y: BAR_Y }, machine2: { x: 184, y: BAR_Y }, wand: { x: 116, y: BAR_Y },
    fridge: { x: 388, y: BAR_Y }, vitrina: { x: 226, y: BAR_Y }, grill: { x: 46, y: BAR_Y }, v60: { x: 274, y: BAR_Y },
    pass: { x: 372, y: BAR_Y }, bus: { x: 30, y: 132, ay: AY.a0 }, back: { x: 22, y: BAR_Y }
  };
  const STATION_X = { grill: 46, wand: 116, machine: 150, machine2: 184, grinder: 232, vitrina: 226, v60: 274, fridge: 388, pass: 372 };

  /* lugares posibles para mesas: filas entre pasillos, columnas a los costados del pasillo central */
  const ROWS = [
    { y: 207, up: AY.a0, dn: AY.a1, xs: [100, 205, 410, 515] },
    { y: 372, up: AY.a1, dn: AY.a2, xs: [108, 212, 398, 512] },
    { y: 537, up: AY.a2, dn: AY.a3, xs: [88, 200, 410, 514] },
    { y: 690, up: AY.a3, dn: AY.a3, xs: [150, 455], side: 'up' }
  ];
  const SLOTS = [];
  ROWS.forEach((r, ri) => r.xs.forEach((x, ci) => SLOTS.push({ id: ri + '-' + ci, row: ri, x, y: r.y, up: r.up, dn: r.dn, side: r.side })));
  const DEFAULT_LAYOUT = [
    ['0-0', 'round', 1], ['0-1', 'round', 2], ['0-2', 'square', 3],
    ['1-0', 'square', 4], ['1-1', 'round', 5], ['1-2', 'round', 6], ['1-3', 'square', 9],
    ['2-0', 'round', 7], ['2-2', 'square', 10],
    ['3-0', 'round', 11], ['3-1', 'round', 12]
  ];
  let layout = DEFAULT_LAYOUT.map(([slot, k, n]) => ({ slot, k, n }));
  let TB = [];
  const LOUNGE = { n: 8, x: 515, y: 84, k: 'lounge', up: AY.a0, dn: AY.a0 };

  function buildTables() {
    const list = layout.map(l => {
      const s = SLOTS.find(q => q.id === l.slot);
      return { n: l.n, slot: l.slot, x: s.x, y: s.y, k: l.k, up: s.up, dn: s.dn, side: s.side, row: s.row };
    });
    list.push(Object.assign({}, LOUNGE));
    list.forEach(t => {
      if (t.k === 'round') t.seats = [{ x: t.x - 33, y: t.y, a: 0, ay: t.dn }, { x: t.x + 33, y: t.y, a: Math.PI, ay: t.dn }];
      else if (t.k === 'square') t.seats = [{ x: t.x - 38, y: t.y, a: 0, ay: t.dn }, { x: t.x + 38, y: t.y, a: Math.PI, ay: t.dn }, { x: t.x, y: t.y - 36, a: Math.PI / 2, ay: t.up }, { x: t.x, y: t.y + 38, a: -Math.PI / 2, ay: t.dn }];
      else t.seats = [{ x: 470, y: 88, a: 0, ay: AY.a0, arm: 1 }, { x: 560, y: 88, a: Math.PI, ay: AY.a0, arm: 1 }, { x: 497, y: 40, a: Math.PI / 2, ay: AY.a0, sofa: 1 }, { x: 533, y: 40, a: Math.PI / 2, ay: AY.a0, sofa: 1 }];
      if (t.side === 'up') t.seats.forEach(st => (st.ay = t.up));
      t.serve = t.side === 'up' ? { x: t.x + 6, y: t.y - 30, ay: t.up } : t.k === 'round' ? { x: t.x, y: t.y + 30, ay: t.dn } : t.k === 'square' ? { x: t.x + 30, y: t.y + 30, ay: t.dn } : { x: 515, y: 120, ay: AY.a0 };
      t.qr = t.k === 'lounge' ? { x: t.x + 6, y: t.y - 2 } : { x: t.x + (t.k === 'round' ? 0 : 9), y: t.y - (t.k === 'round' ? 7 : 9) };
      t.group = null; t.dirty = null;
    });
    TB = list;
  }
  buildTables();

  /* aspecto de las personas */
  const SKIN = ['#F1C7A5', '#E8B894', '#D49B74', '#B97A55', '#8C5A3C', '#F6D7C3', '#C98E6B'];
  const HAIR = ['#2A1B12', '#3D2A1C', '#5C3B22', '#8A5A33', '#C79A5F', '#1E1E1E', '#7A2E22', '#B9B2A8', '#4A3020'];
  const SHIRT = ['#C2313B', '#2F5D73', '#E3A558', '#5E7D4E', '#7A5A9E', '#D9866E', '#3A3A3A', '#EDE6DA', '#4D6A8C', '#B4741A', '#8A3B5C', '#2E6E64', '#9FB7C9', '#F2D36B'];
  const PANTS = ['#2F3B52', '#3E4C66', '#2A2A2A', '#5A4636', '#7C6A55', '#46505C', '#22324A'];
  const HS = ['short', 'short', 'long', 'bun', 'curly', 'cap', 'long', 'short', 'pony', 'bob'];
  const FIRST = ['Lucía', 'Tomás', 'Ana', 'Mateo', 'Valen', 'Juan', 'Sofi', 'Nico', 'Cami', 'Fran', 'Pilar', 'Bruno', 'Mica', 'Lauti', 'Abril', 'Joaco', 'Delfi', 'Santi', 'Emma', 'Lola', 'Benja', 'Rocío', 'Agus', 'Maite', 'Ramiro', 'Paz'];
  const DRINKS = [['flatwhite', 5], ['cortado', 5], ['cappuccino', 4], ['espresso', 2], ['iced', 2], ['submarino', 2], ['v60', 1], ['coldbrew', 1], ['jugo', 1]];
  const FOOD = [['medialunas', 6], ['tostado', 2], ['alfajor', 2], ['cookie', 2], ['palta', 2], ['cheesecake', 1], ['budin', 1]];
  const KIND = { espresso: 'cup', cortado: 'cup', flatwhite: 'cup', cappuccino: 'glasscap', submarino: 'glassmilk', v60: 'cup', chemex: 'cup', iced: 'glass', coldbrew: 'glassd', jugo: 'juice', medialunas: 'medialunas', alfajor: 'alfajor', cookie: 'cookie', cheesecake: 'cake', budin: 'budin', tostado: 'tostado', palta: 'toast' };
  const DRINK_K = ['cup', 'glass', 'glassd', 'juice', 'glasscap', 'glassmilk'];
  const isDrink = id => DRINK_K.includes(KIND[id]);
  const ART = { flatwhite: 'rosetta', cortado: 'heart', cappuccino: 'cocoa', v60: 'black', espresso: 'crema', chemex: 'black' };
  const REVIEWS = ['Muy rico todo, volvemos.', 'El flat white, impecable.', 'Atención de diez.', 'Las medialunas, recién hechas.', 'Lindo lugar para trabajar un rato.', 'Pedir desde la mesa es comodísimo.'];
  const BAD = ['Tardaron mucho en tomarnos el pedido.', 'Nadie venía a la mesa.', 'Esperamos demasiado la cuenta.'];

  /* estado */
  let cv, ctx, dpr = 1, cssW = 0, cssH = 0, base = 1;
  let running = true, speed = 1, visible = true, last = 0, clock = 0, active = false, built = false;
  let people = [], groups = [], fx = [], feed = [], sel = null, hover = null, gid = 1, spawnT = 4, peakT = 0, pid = 1;
  let barista, barista2 = null, mozo, vos = null, doorA = 0, doors = 0;
  let mode = 'sys';               // 'sys' con NOVANTIQ, 'nosys' sin sistema
  let paper = [], paperSeq = 0;    // comandas en papel del modo sin sistema
  let day = null;                  // { t, end } en segundos del día
  let game = null;                 // modo barista
  let editing = false;             // editor de mesas
  let featured = null;             // grupo que muestra el celular flotante
  const stats = { atendidos: 0, pedidos: 0, sellos: 0, resenas: 0, ventas: 0 };
  const blankMetrics = () => ({ t: 0, waitSum: 0, waitN: 0, orders: 0, good: 0, bad: 0, walk: 0, stamps: 0, sales: 0, served: 0 });
  const metrics = { sys: blankMetrics(), nosys: blankMetrics() };
  const dayStats = { clientes: 0, pedidos: 0, sellos: 0, resenas: 0, ventas: 0, hours: {} };

  let seed = (Date.now() ^ 0x9e3779b9) >>> 0;
  const R = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rr = (a, b) => a + R() * (b - a);
  const rp = a => a[Math.floor(R() * a.length)];
  const wpick = list => { const tot = list.reduce((s, x) => s + x[1], 0); let r = R() * tot; for (const x of list) { r -= x[1]; if (r <= 0) return x[0]; } return list[0][0]; };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const vosTable = () => TB.find(t => t.n === S.mesa && t.k !== 'lounge') || TB.find(t => t.k !== 'lounge');
  const tableN = n => TB.find(t => t.n === n);
  const tOf = o => (o.mine ? (vos && vos.t) : tableN(o.mesa)) || null;
  const nearAisle = y => [AY.a0, AY.a1, AY.a2, AY.a3].reduce((b, a) => (Math.abs(a - y) < Math.abs(b - y) ? a : b));
  const brand = () => (typeof SKINS !== 'undefined' && SKINS[S.cafe.skin]) || { accent: '#B3202E', font: 'Georgia,serif', fw: 400 };
  const mm = s => { const c = Math.round(s * TS); return Math.floor(c / 60) + ':' + String(c % 60).padStart(2, '0'); };
