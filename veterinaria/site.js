// Huellitas · funciones compartidas por las 3 páginas.
const WHATSAPP = '520000000000';
// Domingo a sábado: [abre, cierra] en horas
const HORARIO = [[10, 14], [9, 20], [9, 20], [9, 20], [9, 20], [9, 20], [9, 20]];
// Calendario de vacunas (orientativo): semanas de edad y qué se aplica. Después del año, refuerzo cada año.
const VACUNAS = {
  perro: [[6, 'Puppy', 'Parvovirus y moquillo'], [9, 'Múltiple · 1ª dosis', 'Séxtuple'], [12, 'Múltiple · 2ª dosis', 'Refuerzo séxtuple'], [16, 'Rabia', 'Primera dosis'], [52, 'Refuerzo anual', 'Múltiple y rabia']],
  gato: [[8, 'Triple felina · 1ª dosis', 'Rinotraqueítis, calicivirus y panleucopenia'], [12, 'Triple felina · 2ª dosis', 'Refuerzo'], [16, 'Rabia', 'Primera dosis'], [52, 'Refuerzo anual', 'Triple felina y rabia']],
};

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hoyISO = () => iso(new Date());
const largo = d => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
const abrirWA = msg => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Menú en celular
const drawer = document.querySelector('.drawer');
document.querySelectorAll('[data-drawer]').forEach(btn =>
  btn.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    drawer.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  })
);

// Día de hoy en la tabla de horarios y «Abierto ahora»
document.querySelector(`.hours tr[data-day="${new Date().getDay()}"]`)?.classList.add('is-today');
const hora = h => `${((Math.floor(h) + 11) % 12) + 1} ${h < 12 ? 'am' : 'pm'}`;
const estado = (d = new Date()) => {
  const r = HORARIO[d.getDay()], h = d.getHours() + d.getMinutes() / 60;
  if (h >= r[0] && h < r[1]) return { abierto: true, texto: `Abierto ahora · cierra ${hora(r[1])}` };
  return { abierto: false, texto: 'Consultorio cerrado · urgencias 24 h' };
};
const pintarEstado = () => document.querySelectorAll('[data-abierto]').forEach(el => {
  const e = estado();
  el.textContent = e.texto;
  el.classList.toggle('is-open', e.abierto);
  el.hidden = false;
});
pintarEstado();
setInterval(pintarEstado, 60000);

// ---------- Calendario de vacunas ----------
// Devuelve la lista de vacunas con su fecha y si ya pasó, es la siguiente o falta
function calendario(especie, nacioISO, hoy = hoyISO()) {
  const nacio = new Date(nacioISO + 'T12:00');
  const lista = (VACUNAS[especie] || VACUNAS.perro).map(([sem, nombre, detalle]) => {
    const d = new Date(nacio);
    d.setDate(d.getDate() + sem * 7);
    return { nombre, detalle, fecha: iso(d) };
  });
  // Ya tiene más de un año: el refuerzo anual toca en su próximo cumpleaños
  const anual = lista[lista.length - 1];
  while (anual.fecha < hoy) {
    const d = new Date(anual.fecha + 'T12:00');
    d.setFullYear(d.getFullYear() + 1);
    anual.fecha = iso(d);
  }
  const sig = lista.findIndex(v => v.fecha >= hoy);
  return lista.map((v, i) => ({ ...v, estado: v.fecha < hoy ? 'pasada' : i === sig ? 'siguiente' : 'falta' }));
}
window.__calendario = calendario; // para las pruebas

const edadTexto = (nacioISO, hoy = new Date()) => {
  const n = new Date(nacioISO + 'T12:00');
  const meses = (hoy.getFullYear() - n.getFullYear()) * 12 + hoy.getMonth() - n.getMonth() - (hoy.getDate() < n.getDate() ? 1 : 0);
  if (meses < 1) return `${Math.max(Math.floor((hoy - n) / 6048e5), 0)} semanas`;
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  const a = Math.floor(meses / 12);
  return `${a} ${a === 1 ? 'año' : 'años'}`;
};

const fv = document.querySelector('[data-vacunas]');
if (fv) {
  fv.nacio.max = hoyISO();
  const caja = document.querySelector('[data-resultado]');
  fv.addEventListener('submit', e => {
    e.preventDefault();
    const err = document.querySelector('[data-vac-error]');
    const n = fv.nacio.value, especie = fv.especie.value === 'gato' ? 'gato' : 'perro';
    const nombre = fv.nombre.value.trim().slice(0, 30) || (especie === 'gato' ? 'tu gato' : 'tu perro');
    const minimo = iso(new Date(new Date().getFullYear() - 25, 0, 1));
    const falla = !/^\d{4}-\d{2}-\d{2}$/.test(n) ? '¿Cuándo nació? Aunque sea aproximado.' : n > hoyISO() ? 'La fecha de nacimiento no puede ser en el futuro.' : n < minimo ? 'Revisa la fecha: parece de hace muchos años.' : '';
    err.textContent = falla;
    err.hidden = !falla;
    if (falla) return fv.nacio.focus();
    const cal = calendario(especie, n);
    const sig = cal.find(v => v.estado === 'siguiente');
    caja.innerHTML = `
      <h2>El calendario de ${esc(nombre)}</h2>
      <p class="sub">${especie === 'gato' ? 'Gato' : 'Perro'} · ${edadTexto(n)}</p>
      <ol class="timeline">${cal.map(v => `
        <li class="is-${v.estado === 'pasada' ? 'past' : v.estado === 'siguiente' ? 'next' : 'todo'}">
          <span class="dot">${v.estado === 'pasada' ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-syringe"></i>'}</span>
          <div><strong>${v.nombre}</strong><small>${v.detalle}</small>${v.estado === 'siguiente' ? '<br /><span class="tag-next">Le toca</span>' : ''}</div>
          <time datetime="${v.fecha}">${largo(new Date(v.fecha + 'T12:00'))}</time>
        </li>`).join('')}</ol>
      ${cal.some(v => v.estado === 'pasada') ? '<p class="note"><i class="fa-solid fa-circle-info"></i> Si alguna de las que ya pasaron no la tiene, no pasa nada: la ponemos al día en consulta.</p>' : ''}
      <button type="button" class="btn btn--orange btn--block" data-agendar-vacuna style="margin-top: 16px"><i class="fa-brands fa-whatsapp"></i> Agendar ${sig ? sig.nombre.toLowerCase() : 'su vacuna'}</button>`;
    caja.querySelector('[data-agendar-vacuna]').addEventListener('click', () => abrirWA(
      `Hola, quiero agendar una vacuna para ${nombre} (${especie}, ${edadTexto(n)}).` +
      (sig ? `\nLe toca: ${sig.nombre}, el ${largo(new Date(sig.fecha + 'T12:00'))}.` : '')
    ));
  });
}

// ---------- Cita ----------
const form = document.querySelector('#cita-form');
if (form) {
  form.fecha.min = hoyISO();
  form.fecha.value = hoyISO();
  const m = new URLSearchParams(location.search).get('m');
  const opcion = [...form.motivo.options].find(o => o.value === m);
  if (opcion) opcion.selected = true;
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const error = form.querySelector('.form-error');
    const dia = new Date(d.fecha + 'T12:00');
    const falla = !d.dueno.trim() ? 'Escribe tu nombre.' : !d.mascota.trim() ? '¿Cómo se llama tu mascota?'
      : !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha) || d.fecha < hoyISO() ? 'Elige un día a partir de hoy.'
      : dia.getDay() === 0 && d.turno === 'Tarde' ? 'Los domingos solo abrimos en la mañana.' : '';
    error.textContent = falla;
    error.hidden = !falla;
    if (falla) return form.querySelector(!d.dueno.trim() ? '[name=dueno]' : !d.mascota.trim() ? '[name=mascota]' : falla.startsWith('Elige') ? '[name=fecha]' : '[name=turno]')?.focus();
    const fechaTxt = dia.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    let msg = `Hola, quiero agendar una cita en Huellitas 🐾\n\nDueño: ${d.dueno.trim()}\nMascota: ${d.mascota.trim()} (${d.especie})\nMotivo: ${form.motivo.selectedOptions[0].textContent}\nDía: ${fechaTxt}, en la ${d.turno.toLowerCase()}`;
    if (d.nota.trim()) msg += `\nNota: ${d.nota.trim()}`;
    abrirWA(msg);
  });
}

// ---------- Efectos ----------
const header = document.querySelector('.header');
const sombra = () => header?.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', sombra, { passive: true });
sombra();
if (window.motion) {
  motion.reveal('.section-head, .band, .vet, .quote, .box, .map, .cta, .form, .urgent');
  motion.stagger('.cards, .trust');
}
