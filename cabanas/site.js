// Casa Niebla · funciones compartidas por las 3 páginas.
const WHATSAPP = '520000000000';
// Precio por noche: semana (dom a jue) y fin (noches de viernes y sábado)
const CABANAS = {
  neblina: { nombre: 'Neblina', max: 2, semana: 1900, fin: 2400 },
  ocote: { nombre: 'Ocote', max: 4, semana: 2600, fin: 3200 },
  roble: { nombre: 'Roble', max: 6, semana: 3400, fin: 4200 },
};
const MASCOTA = 300;

const $ = (s, el = document) => el.querySelector(s);
const pesos = n => '$' + n.toLocaleString('es-MX');
// Fecha local yyyy-mm-dd (no UTC: después de las 18:00 en México, UTC ya es mañana)
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return iso(d); };

// Menú en celular
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

// Fechas: no antes de hoy, y la salida siempre después de la llegada
document.querySelectorAll('form').forEach(form => {
  const llegada = $('[name="llegada"]', form);
  const salida = $('[name="salida"]', form);
  if (!llegada || !salida) return;
  llegada.min = iso(new Date());
  const sync = () => {
    if (!llegada.value) return;
    salida.min = addDays(llegada.value, 1);
    if (!salida.value || salida.value <= llegada.value) salida.value = addDays(llegada.value, 1);
  };
  llegada.addEventListener('change', sync);
});

// ---------- Página de reservar ----------
const form = $('#reserva-form');
if (form) {
  const params = new URLSearchParams(location.search);
  const llegada = $('[name="llegada"]', form);
  const salida = $('[name="salida"]', form);
  const huespedes = $('[name="huespedes"]', form);
  const mascota = $('[name="mascota"]', form);
  const summary = $('.summary');
  const error = $('.form-error');

  // Llenar con lo que viene del buscador o de la página de cabañas
  if (params.get('llegada')) llegada.value = params.get('llegada');
  if (params.get('salida')) salida.value = params.get('salida');
  if (params.get('huespedes')) huespedes.value = params.get('huespedes');
  const pedida = params.get('c');
  const elegida = (pedida && CABANAS[pedida] ? pedida : null) || Object.keys(CABANAS).find(k => CABANAS[k].max >= +huespedes.value);
  // Solo valores conocidos: un enlace alterado no rompe la página
  const radio = [...form.querySelectorAll('[name="cabana"]')].find(r => r.value === elegida);
  if (radio) radio.checked = true;
  if (llegada.value) salida.min = addDays(llegada.value, 1);

  const calcular = () => {
    const c = CABANAS[$('[name="cabana"]:checked', form)?.value];
    if (!c || !llegada.value || !salida.value || salida.value <= llegada.value) return null;
    let noches = 0, finde = 0, total = 0;
    for (let d = llegada.value; d < salida.value; d = addDays(d, 1)) {
      const dia = new Date(d + 'T12:00').getDay();
      const esFin = dia === 5 || dia === 6;
      noches++;
      if (esFin) finde++;
      total += esFin ? c.fin : c.semana;
    }
    if (mascota.checked) total += MASCOTA;
    return { c, noches, finde, total };
  };

  const pintar = () => {
    const r = calcular();
    const g = +huespedes.value;
    error.hidden = true;
    if (!r) {
      $('[data-sum="detalle"]', summary).hidden = true;
      $('[data-sum="vacio"]', summary).hidden = false;
      return;
    }
    $('[data-sum="detalle"]', summary).hidden = false;
    $('[data-sum="vacio"]', summary).hidden = true;
    $('[data-sum="cabana"]', summary).textContent = r.c.nombre;
    $('[data-sum="noches"]', summary).textContent = `${r.noches} ${r.noches === 1 ? 'noche' : 'noches'}` + (r.finde ? ` (${r.finde} de fin de semana)` : '');
    $('[data-sum="mascota"]', summary).parentElement.hidden = !mascota.checked;
    $('[data-sum="total"]', summary).textContent = pesos(r.total);
    $('[data-sum="anticipo"]', summary).textContent = pesos(Math.round(r.total / 2));
    if (g > r.c.max) {
      error.textContent = `La cabaña ${r.c.nombre} es para máximo ${r.c.max} personas.`;
      error.hidden = false;
    }
  };
  form.addEventListener('input', pintar);
  form.addEventListener('change', pintar);
  pintar();

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const r = calcular();
    if (!r) {
      error.textContent = 'Elige tus fechas de llegada y salida.';
      error.hidden = false;
      return form.querySelector(form.llegada?.value ? '[name=salida]' : '[name=llegada]')?.focus();
    }
    if (+huespedes.value > r.c.max) return pintar();
    const d = Object.fromEntries(new FormData(form));
    const f = s => new Date(s + 'T12:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
    let msg = `Hola, quiero reservar en Casa Niebla.\n\nCabaña: ${r.c.nombre}\nLlegada: ${f(d.llegada)}\nSalida: ${f(d.salida)} (${r.noches} ${r.noches === 1 ? 'noche' : 'noches'})\nHuéspedes: ${d.huespedes}${mascota.checked ? '\nCon mascota' : ''}\nNombre: ${d.nombre}\nTotal: ${pesos(r.total)}`;
    if (d.nota.trim()) msg += `\nNota: ${d.nota.trim()}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
}

// ---------- Efectos ----------
// Sombra en el encabezado al bajar
const header = document.querySelector('.header');
const sombra = () => header?.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', sombra, { passive: true });
sombra();

// Aparecen al bajar (motion.js)
motion.reveal('.section .eyebrow, .section .h2, .section .lead, .section-head, .dark .wrap > *, .closing .wrap > *, .room-gallery, .room-body, .form, .summary, .rules');
motion.stagger('.cabins, .amenities, .exp, .routes, .reviews, .faq, .stats');
motion.count('.stats strong');
