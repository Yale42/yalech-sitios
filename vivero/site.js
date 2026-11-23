// Verdor · funciones compartidas por las 3 páginas (catálogo, carrito y pedido por WhatsApp).
const WHATSAPP = '520000000000';
const ENVIO = 99;            // costo de envío
const ENVIO_GRATIS = 799;    // a partir de este subtotal el envío es gratis

// Catálogo. Para agregar una planta copia un renglón; "top" la muestra en Inicio.
// Etiquetas: poca-luz, mucha-luz, faciles, grandes, cactus
const PRODUCTOS = [
  { id: 'monstera', nombre: 'Monstera deliciosa', precio: 690, luz: 'Luz media', tam: '60 cm · maceta de cerámica', tags: ['grandes', 'faciles'], top: true },
  { id: 'aglaonema', nombre: 'Aglaonema plateada', precio: 450, luz: 'Poca luz', tam: '40 cm · maceta crema', tags: ['poca-luz', 'faciles'], top: true },
  { id: 'sansevieria', nombre: 'Lengua de suegra', precio: 390, luz: 'Poca luz', tam: '45 cm · maceta de cemento', tags: ['poca-luz', 'faciles'], top: true },
  { id: 'ave-paraiso', nombre: 'Ave del paraíso', precio: 1250, luz: 'Mucha luz', tam: '110 cm · maceta blanca', tags: ['grandes', 'mucha-luz'], top: true },
  { id: 'monstera-variegada', nombre: 'Monstera variegada', precio: 1890, luz: 'Luz media', tam: '45 cm · cada hoja es distinta', tags: ['grandes'], badge: 'Quedan 3' },
  { id: 'pothos', nombre: 'Esqueje de pothos', precio: 149, luz: 'Poca luz', tam: '15 cm · maceta de 8 cm', tags: ['poca-luz', 'faciles'] },
  { id: 'alocasia', nombre: 'Alocasia dragón', precio: 520, luz: 'Luz media', tam: '50 cm · maceta gris', tags: [] },
  { id: 'ficus', nombre: 'Ficus lyrata', precio: 980, luz: 'Mucha luz', tam: '90 cm · maceta blanca', tags: ['grandes', 'mucha-luz'] },
  { id: 'filodendro', nombre: 'Filodendro', precio: 340, luz: 'Luz media', tam: '35 cm · maceta de barro', tags: ['faciles'] },
  { id: 'cactus', nombre: 'Cactus erizo', precio: 220, luz: 'Mucha luz', tam: '20 cm · maceta negra', tags: ['cactus', 'mucha-luz', 'faciles'] },
  { id: 'cactus-barro', nombre: 'Dúo de cactus', precio: 290, luz: 'Mucha luz', tam: '2 piezas · macetas de barro', tags: ['cactus', 'mucha-luz'] },
];

const $ = (s, el = document) => el.querySelector(s);
const pesos = n => '$' + n.toLocaleString('es-MX');
const porId = id => PRODUCTOS.find(p => p.id === id);

// ---------- Tarjeta de producto ----------
const tarjeta = p => `
  <li class="product">
    <div class="product-img">
      <img src="assets/p-${p.id}.jpg" alt="${p.nombre}" loading="lazy" width="700" height="875" />
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
    </div>
    <div class="product-info">
      <h3 class="product-name">${p.nombre}</h3>
      <p class="product-meta"><i class="fa-solid fa-sun"></i> ${p.luz} · ${p.tam}</p>
      <div class="product-buy">
        <span class="product-price">${pesos(p.precio)}</span>
        <button class="add" data-add="${p.id}" aria-label="Agregar ${p.nombre} al carrito"><i class="fa-solid fa-plus"></i><span>Agregar</span></button>
      </div>
    </div>
  </li>`;

// Inicio: las más vendidas
const masVendidas = $('[data-top]');
if (masVendidas) masVendidas.innerHTML = PRODUCTOS.filter(p => p.top).map(tarjeta).join('');

// Tienda: filtros y orden
const grid = $('[data-shop]');
if (grid) {
  const params = new URLSearchParams(location.search);
  let filtro = params.get('c') || 'todas';
  let orden = 'destacadas';
  const pintar = () => {
    let lista = PRODUCTOS.filter(p => filtro === 'todas' || p.tags.includes(filtro));
    if (orden === 'menor') lista = [...lista].sort((a, b) => a.precio - b.precio);
    if (orden === 'mayor') lista = [...lista].sort((a, b) => b.precio - a.precio);
    grid.innerHTML = lista.map(tarjeta).join('');
    $('[data-count]').textContent = `${lista.length} ${lista.length === 1 ? 'planta' : 'plantas'}`;
    document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.filter === filtro));
  };
  document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
    filtro = c.dataset.filter;
    history.replaceState(null, '', filtro === 'todas' ? location.pathname : `?c=${filtro}`);
    pintar();
  }));
  $('[data-sort]').addEventListener('change', e => { orden = e.target.value; pintar(); });
  pintar();
}

// ---------- Carrito (se guarda en este navegador) ----------
let carrito = {};
try { carrito = JSON.parse(localStorage.getItem('verdor-carrito')) || {}; } catch { carrito = {}; }
if (typeof carrito !== 'object' || Array.isArray(carrito)) carrito = {};
// Solo productos que existen y cantidades enteras entre 1 y 99 (por si lo guardado viene alterado)
Object.keys(carrito).forEach(id => {
  const n = Math.floor(Number(carrito[id]));
  if (!porId(id) || !(n >= 1)) delete carrito[id];
  else carrito[id] = Math.min(n, 99);
});
const guardar = () => { try { localStorage.setItem('verdor-carrito', JSON.stringify(carrito)); } catch {} };

const cart = $('.cart');
const piezas = () => Object.values(carrito).reduce((a, b) => a + b, 0);
const subtotal = () => Object.entries(carrito).reduce((s, [id, n]) => s + porId(id).precio * n, 0);

const pintarCarrito = () => {
  const n = piezas();
  document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = n; el.hidden = !n; });
  const lista = $('.cart-items', cart);
  const vacio = !n;
  $('.cart-empty', cart).hidden = !vacio;
  $('.cart-foot', cart).hidden = vacio;
  lista.innerHTML = Object.entries(carrito).map(([id, q]) => {
    const p = porId(id);
    return `<li class="cart-item">
      <img src="assets/p-${id}.jpg" alt="" />
      <div><strong>${p.nombre}</strong><span>${pesos(p.precio)}</span></div>
      <div class="qty">
        <button data-qty="${id}" data-d="-1" aria-label="Quitar uno">−</button>
        <span>${q}</span>
        <button data-qty="${id}" data-d="1" aria-label="Agregar uno">+</button>
      </div>
    </li>`;
  }).join('');
  const sub = subtotal();
  const envio = sub >= ENVIO_GRATIS ? 0 : ENVIO;
  $('[data-sum="sub"]', cart).textContent = pesos(sub);
  $('[data-sum="envio"]', cart).textContent = envio ? pesos(envio) : 'Gratis';
  $('[data-sum="total"]', cart).textContent = pesos(sub + envio);
  const falta = ENVIO_GRATIS - sub;
  $('[data-free]', cart).textContent = falta > 0 ? `Te faltan ${pesos(falta)} para envío gratis` : '¡Tu envío es gratis!';
  $('.free-bar span', cart).style.width = Math.min(sub / ENVIO_GRATIS, 1) * 100 + '%';
};

const abrir = open => {
  cart.classList.toggle('open', open);
  cart.setAttribute('aria-hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
};
document.querySelectorAll('[data-cart-open]').forEach(b => b.addEventListener('click', () => abrir(true)));
document.querySelectorAll('[data-cart-close]').forEach(b => b.addEventListener('click', () => abrir(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') abrir(false); });

document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if (add) {
    const id = add.dataset.add;
    carrito[id] = Math.min((carrito[id] || 0) + 1, 99);
    guardar(); pintarCarrito();
    // Confirmación en el botón y brinco del contador
    add.classList.add('is-added');
    add.querySelector('span').textContent = 'Agregada';
    setTimeout(() => { add.classList.remove('is-added'); add.querySelector('span').textContent = 'Agregar'; }, 1400);
    document.querySelectorAll('.cart-btn').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
  }
  const q = e.target.closest('[data-qty]');
  if (q) {
    const id = q.dataset.qty;
    carrito[id] += +q.dataset.d;
    if (carrito[id] <= 0) delete carrito[id];
    guardar(); pintarCarrito();
  }
});

// Pedido: arma el mensaje y abre WhatsApp
const fecha = $('[name="dia"]', cart);
const manana = new Date(); manana.setDate(manana.getDate() + 1);
fecha.min = `${manana.getFullYear()}-${String(manana.getMonth() + 1).padStart(2, '0')}-${String(manana.getDate()).padStart(2, '0')}`;
$('#pedido-form').addEventListener('submit', ev => {
  ev.preventDefault();
  const d = Object.fromEntries(new FormData(ev.target));
  const sub = subtotal();
  const envio = sub >= ENVIO_GRATIS ? 0 : ENVIO;
  const lineas = Object.entries(carrito).map(([id, q]) => `• ${q} × ${porId(id).nombre} (${pesos(porId(id).precio * q)})`).join('\n');
  const dia = new Date(d.dia + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  let msg = `Hola Verdor, quiero hacer un pedido:\n\n${lineas}\n\nEnvío: ${envio ? pesos(envio) : 'gratis'}\nTotal: ${pesos(sub + envio)}\n\nNombre: ${d.nombre}\nColonia: ${d.colonia}\nEntrega: ${dia}`;
  if (d.nota.trim()) msg += `\nNota: ${d.nota.trim()}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
});
pintarCarrito();

// ---------- Menú en celular ----------
// ---------- Menú del celular (igual en los 8 sitios) ----------
// Se abre con ☰ y se cierra con la X, con Esc, tocando fuera o al elegir una opción.
// Al abrir, el cursor entra al menú y no se sale con Tab; al cerrar, regresa al botón ☰.
// Cerrado, sus enlaces no se alcanzan con el teclado (inert).
const drawer = document.querySelector('.drawer');
if (drawer) {
  const botones = [...document.querySelectorAll('[data-drawer]')];
  const abrirBtn = botones.find(b => !drawer.contains(b));
  drawer.id ||= 'menu-movil';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'Menú');
  botones.filter(b => !drawer.contains(b)).forEach(b => b.setAttribute('aria-controls', drawer.id));
  const enfocables = () => [...drawer.querySelectorAll('a[href], button:not([disabled]), input, select, textarea')].filter(el => el.getClientRects().length);
  const poner = (abierto, regresar = true) => {
    drawer.classList.toggle('open', abierto);
    drawer.setAttribute('aria-hidden', String(!abierto));
    drawer.inert = !abierto;
    document.body.style.overflow = abierto ? 'hidden' : '';
    botones.forEach(b => b.setAttribute('aria-expanded', String(abierto)));
    if (abierto) {
      // Algunos menús aparecen con animación y aún están ocultos este instante: se reintenta un momento
      const meta = drawer.querySelector('[data-drawer]') || enfocables()[0];
      let n = 0;
      const entrar = () => { meta?.focus(); if (document.activeElement !== meta && ++n < 10) setTimeout(entrar, 40); };
      entrar();
    }
    else if (regresar && drawer.contains(document.activeElement)) abrirBtn?.focus();
  };
  poner(false, false);
  botones.forEach(b => b.addEventListener('click', () => poner(!drawer.classList.contains('open'))));
  drawer.addEventListener('click', e => {
    if (e.target === drawer) poner(false); // tocar fuera de las opciones
    else if (e.target.closest('a[href]')) poner(false, false); // eligió una opción
  });
  document.addEventListener('keydown', e => {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); poner(false); }
    if (e.key === 'Tab') {
      const l = enfocables(); if (!l.length) return;
      const [primero, ultimo] = [l[0], l[l.length - 1]];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
  });
  // Si la pantalla crece a computadora con el menú abierto, se cierra
  matchMedia('(min-width: 1000px)').addEventListener('change', e => { if (e.matches && drawer.classList.contains('open')) poner(false, false); });
}

// ---------- Efectos ----------
const header = $('.header');
const sombra = () => header.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', sombra, { passive: true });
sombra();
motion.reveal('.section .eyebrow, .section .h2, .section .lead, .section-head, .story-img, .band .wrap > *, .guide, .faq, .pickup');
motion.stagger('.cats, .products:not([data-shop]), .steps, .reviews, .perks');
