// Filo · funciones compartidas por las 3 páginas (estado abierto, agenda con horarios y WhatsApp).
const WHATSAPP = '520000000000';
// Horario (0 = domingo). null = cerrado.
const HORARIO = { 0: null, 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [9, 18] };
const SERVICIOS = {
  corte: { nombre: 'Corte clásico', precio: 250, min: 40 },
  fade: { nombre: 'Fade / degradado', precio: 280, min: 45 },
  combo: { nombre: 'Corte + barba', precio: 390, min: 70 },
  barba: { nombre: 'Arreglo de barba', precio: 180, min: 30 },
  navaja: { nombre: 'Afeitado con navaja', precio: 220, min: 35 },
  nino: { nombre: 'Corte niño', precio: 200, min: 30 },
};
const BARBEROS = {
  cualquiera: { nombre: 'El primero disponible' },
  rodrigo: { nombre: 'Rodrigo' },
  santi: { nombre: 'Santi' },
  memo: { nombre: 'Memo' },
};

const $ = (s, el = document) => el.querySelector(s);
const pesos = n => '$' + n.toLocaleString('es-MX');
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hhmm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

// ---------- Abierto / cerrado ----------
(() => {
  const now = new Date();
  const hoy = HORARIO[now.getDay()];
  const h = now.getHours() + now.getMinutes() / 60;
  let texto, abierto = false;
  if (hoy && h >= hoy[0] && h < hoy[1]) { abierto = true; texto = `Abierto · hasta las ${hoy[1]}:00`; }
  else if (hoy && h < hoy[0]) texto = `Cerrado · abrimos a las ${hoy[0]}:00`;
  else {
    for (let i = 1; i <= 7; i++) {
      const d = (now.getDay() + i) % 7;
      if (HORARIO[d]) { texto = `Cerrado · abrimos ${i === 1 ? 'mañana' : ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'][d]} a las ${HORARIO[d][0]}:00`; break; }
    }
  }
  document.querySelectorAll('[data-status]').forEach(el => { el.textContent = texto; el.classList.toggle('is-closed', !abierto); });
  document.querySelector(`.hours [data-day="${now.getDay()}"]`)?.classList.add('is-today');
})();

// ---------- Menú en celular ----------
const drawer = $('.drawer');
document.querySelectorAll('[data-drawer]').forEach(btn =>
  btn.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    drawer.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  })
);

// ---------- Agenda ----------
const form = $('#cita-form');
if (form) {
  const params = new URLSearchParams(location.search);
  const diasBox = $('[data-days]', form);
  const horasBox = $('[data-slots]', form);
  const resumen = $('.booking-sum');
  const error = $('.form-error', form);

  // Preselección desde los enlaces (?s=fade&b=santi)
  const s0 = params.get('s'), b0 = params.get('b');
  if (s0 && SERVICIOS[s0]) $(`[name="servicio"][value="${s0}"]`, form).checked = true;
  if (b0 && BARBEROS[b0]) $(`[name="barbero"][value="${b0}"]`, form).checked = true;

  // Próximos 10 días abiertos
  const hoy = new Date();
  const dias = [];
  for (let i = 0; dias.length < 10 && i < 20; i++) {
    const d = new Date(hoy); d.setDate(hoy.getDate() + i);
    if (!HORARIO[d.getDay()]) continue;
    if (i === 0 && hoy.getHours() >= HORARIO[d.getDay()][1] - 1) continue; // hoy ya casi cerramos
    dias.push(d);
  }
  diasBox.innerHTML = dias.map((d, i) => `
    <label class="day">
      <input type="radio" name="dia" value="${iso(d)}" ${i === 0 ? 'checked' : ''} />
      <span><small>${i === 0 && d.getDate() === hoy.getDate() ? 'Hoy' : d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '')}</small><strong>${d.getDate()}</strong><small>${d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '')}</small></span>
    </label>`).join('');

  // Horarios ocupados de ejemplo: siempre los mismos para el mismo día y barbero
  const ocupado = (dia, barbero, m) => {
    let h = 0;
    for (const c of dia + barbero + m) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % 100 < (barbero === 'cualquiera' ? 18 : 38);
  };

  const pintarHoras = () => {
    const dia = $('[name="dia"]:checked', form)?.value;
    const barbero = $('[name="barbero"]:checked', form).value;
    const s = SERVICIOS[$('[name="servicio"]:checked', form).value];
    if (!dia) return;
    const d = new Date(dia + 'T12:00');
    const [abre, cierra] = HORARIO[d.getDay()];
    const esHoy = dia === iso(new Date());
    const ahora = new Date().getHours() * 60 + new Date().getMinutes();
    const previa = $('[name="hora"]:checked', form)?.value;
    let html = '', libres = 0;
    for (let m = abre * 60; m + s.min <= cierra * 60; m += 30) {
      const pasada = esHoy && m <= ahora + 30;
      const tomada = !pasada && ocupado(dia, barbero, m);
      const off = pasada || tomada;
      if (!off) libres++;
      html += `<label class="slot${off ? ' is-off' : ''}"><input type="radio" name="hora" value="${hhmm(m)}" ${off ? 'disabled' : ''} ${previa === hhmm(m) && !off ? 'checked' : ''} /><span>${hhmm(m)}</span></label>`;
    }
    horasBox.innerHTML = libres ? html : '<p class="slots-empty">Ya no hay lugares este día. Elige otro, por favor.</p>';
    $('[data-free-count]').textContent = libres ? `${libres} horarios libres` : '';
    pintarResumen();
  };

  const pintarResumen = () => {
    const s = SERVICIOS[$('[name="servicio"]:checked', form).value];
    const b = BARBEROS[$('[name="barbero"]:checked', form).value];
    const dia = $('[name="dia"]:checked', form)?.value;
    const hora = $('[name="hora"]:checked', form)?.value;
    $('[data-sum="servicio"]', resumen).textContent = `${s.nombre} · ${s.min} min`;
    $('[data-sum="barbero"]', resumen).textContent = b.nombre;
    $('[data-sum="cuando"]', resumen).textContent = dia
      ? new Date(dia + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) + (hora ? ` · ${hora}` : ' · elige hora')
      : '—';
    $('[data-sum="precio"]', resumen).textContent = pesos(s.precio);
  };

  form.addEventListener('change', e => {
    if (['dia', 'barbero', 'servicio'].includes(e.target.name)) pintarHoras();
    else pintarResumen();
    error.hidden = true;
  });
  pintarHoras();

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.hora) {
      error.textContent = 'Elige un horario libre.';
      error.hidden = false;
      horasBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      horasBox.querySelector('input:not(:disabled), button:not(:disabled)')?.focus({ preventScroll: true });
      return;
    }
    const s = SERVICIOS[d.servicio];
    const dia = new Date(d.dia + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    const msg = `Hola Filo, quiero agendar una cita.\n\nServicio: ${s.nombre} (${pesos(s.precio)})\nBarbero: ${BARBEROS[d.barbero].nombre}\nDía: ${dia}\nHora: ${d.hora}\nNombre: ${d.nombre}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
}

// ---------- Efectos ----------
const header = $('.header');
const sombra = () => header.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', sombra, { passive: true });
sombra();
motion.reveal('.section .eyebrow, .section .h2, .section .lead, .section-head, .visit > *, .price-group');
motion.stagger('.services, .team, .gallery, .reviews');
motion.count('.rating strong');

// Botón fijo "Agendar cita" en celular: aparece al pasar la portada
const flotante = $('.float-cta');
if (flotante) {
  const portada = $('.hero, .page-head');
  const ver = () => flotante.classList.toggle('show', portada.getBoundingClientRect().bottom < 0 && innerHeight + scrollY < document.documentElement.scrollHeight - 160);
  addEventListener('scroll', ver, { passive: true });
  ver();
}
