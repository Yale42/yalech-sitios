// Dental Arce · funciones compartidas por las 3 páginas.
const WHATSAPP = '520000000000';
// Fecha local yyyy-mm-dd (no UTC: después de las 18:00 en México, UTC ya es mañana)
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

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

// Día de hoy en la tabla de horarios
document.querySelector(`.hours tr[data-day="${new Date().getDay()}"]`)?.classList.add('is-today');

// Agenda: arma el mensaje y abre WhatsApp (no se envía nada a un servidor)
const form = document.querySelector('#cita-form');
if (form) {
  const fecha = form.querySelector('[name="fecha"]');
  fecha.min = hoyISO();

  // Si llegan desde un tratamiento (agenda.html?t=ortodoncia), lo dejamos elegido
  const t = new URLSearchParams(location.search).get('t');
  // Se compara contra las opciones existentes: un enlace alterado no rompe la página
  const opcion = [...form.querySelectorAll('[name="motivo"] option')].find(o => o.value === t);
  if (t && opcion) opcion.selected = true;

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const error = form.querySelector('.form-error');
    const dia = new Date(d.fecha + 'T12:00');
    if (dia.getDay() === 0) {
      error.textContent = 'Los domingos no abrimos. Elige otro día, por favor.';
      error.hidden = false;
      return form.querySelector('[name=fecha]')?.focus();
    }
    if (dia.getDay() === 6 && d.turno === 'Tarde') {
      error.textContent = 'Los sábados solo atendemos en la mañana.';
      error.hidden = false;
      return form.querySelector('[name=turno]')?.focus();
    }
    error.hidden = true;
    const motivo = form.querySelector('[name="motivo"]').selectedOptions[0].textContent;
    const fechaTxt = dia.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    let msg = `Hola, quiero agendar una cita en Dental Arce.\n\nNombre: ${d.nombre}\nTeléfono: ${d.tel}\nMotivo: ${motivo}\nDía: ${fechaTxt}, en la ${d.turno.toLowerCase()}\nPrimera vez: ${d.primera}`;
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
motion.reveal('.section .eyebrow, .section .h2, .section .lead, .section-head, .price-tag, .testimonial, .clinic, .visit-box, .cta, .treat, .info-card, .map, .form, .hours');
motion.stagger('.cards, .team, .steps, .quotes, .faq, .pay');
motion.count('.google strong');
