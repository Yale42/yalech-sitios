// Comal · funciones compartidas por las 3 páginas.
// Para cambiar horarios, edita HORARIO (0 = domingo). null = cerrado. 24 = medianoche.
const HORARIO = {
  0: [13, 19],
  1: null,
  2: [13, 23],
  3: [13, 23],
  4: [13, 23],
  5: [13, 24],
  6: [13, 24],
};
const WHATSAPP = '520000000000';
// Fecha local yyyy-mm-dd (no UTC: después de las 18:00 en México, UTC ya es mañana)
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

const hora = h => (h === 24 ? '00:00' : `${h}:00`);

// Abierto ahora / cerrado
function estado() {
  const now = new Date();
  const hoy = HORARIO[now.getDay()];
  const h = now.getHours() + now.getMinutes() / 60;
  if (hoy && h >= hoy[0] && h < hoy[1]) return { abierto: true, texto: `Abierto · cierra a las ${hora(hoy[1])}` };
  if (hoy && h < hoy[0]) return { abierto: false, texto: `Cerrado · abre hoy a las ${hora(hoy[0])}` };
  for (let i = 1; i <= 7; i++) {
    const d = (now.getDay() + i) % 7;
    if (HORARIO[d]) {
      const dia = i === 1 ? 'mañana' : ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'][d];
      return { abierto: false, texto: `Cerrado · abre ${dia} a las ${hora(HORARIO[d][0])}` };
    }
  }
}
const e = estado();
document.querySelectorAll('[data-status]').forEach(el => {
  el.textContent = e.texto;
  el.classList.toggle('is-closed', !e.abierto);
});

// Día de hoy en la tabla de horarios
document.querySelector(`.hours tr[data-day="${new Date().getDay()}"]`)?.classList.add('is-today');

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

// Pestañas del menú: marca la sección visible
const tabs = document.querySelectorAll('.tab');
if (tabs.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      tabs.forEach(t => {
        const on = t.getAttribute('href') === '#' + en.target.id;
        t.classList.toggle('is-active', on);
        if (on) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('.menu-section').forEach(s => io.observe(s));
}

// Reservación: arma el mensaje y abre WhatsApp
const form = document.querySelector('#reservar-form');
if (form) {
  const fecha = form.querySelector('[name="fecha"]');
  fecha.min = hoyISO();
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const error = form.querySelector('#form-error');
    const dow = new Date(d.fecha + 'T12:00').getDay();
    const [hh, mm] = d.hora.split(':').map(Number);
    if (!HORARIO[dow] || hh + mm / 60 > HORARIO[dow][1] - 1) {
      error.textContent = HORARIO[dow]
        ? `Ese día cerramos a las ${hora(HORARIO[dow][1])}. La última reservación es una hora antes.`
        : 'Ese día estamos cerrados. Elige otro, por favor.';
      error.hidden = false;
      return form.querySelector(HORARIO[dow] ? '[name=hora]' : '[name=fecha]')?.focus();
    }
    error.hidden = true;
    const dia =new Date(d.fecha + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    let msg = `Hola, quiero reservar en Comal.\n\nNombre: ${d.nombre}\nDía: ${dia}\nHora: ${d.hora}\nPersonas: ${d.personas}`;
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
motion.reveal('.section .eyebrow, .section .h2, .section .lead, .picks-head, .story img, .signature, .rating, .band .wrap > *, .menu-section-head, .visit > *, .form, .hours');
motion.stagger('.picks, .gallery, .reviews, .dishes');
motion.count('.rating strong');
