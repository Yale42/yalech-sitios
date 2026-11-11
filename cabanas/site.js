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
const drawer = $('.drawer');
document.querySelectorAll('[data-drawer]').forEach(btn =>
  btn.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    drawer.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  })
);

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
  const elegida = params.get('c') || Object.keys(CABANAS).find(k => CABANAS[k].max >= +huespedes.value);
  const radio = $(`[name="cabana"][value="${elegida}"]`, form);
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
      return;
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
