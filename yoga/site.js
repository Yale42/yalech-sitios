// Estudio Prana · funciones compartidas por las 2 páginas.
const WHATSAPP = '520000000000';
const CUPO = 12;
// Clases de la semana. dias: 1 = lunes … 6 = sábado. ocupados: lugares ya apartados (en la versión real vendría del sistema).
const CLASES = [
  { dias: [1, 3, 5], hora: '07:00', min: 60, tipo: 'Vinyasa', nivel: 'Intermedio', maestra: 'Ana Paula', ocupados: [9, 12, 7] },
  { dias: [2, 4], hora: '07:30', min: 50, tipo: 'Pilates mat', nivel: 'Todos', maestra: 'Mariel', ocupados: [10, 11] },
  { dias: [1, 2, 3, 4, 5], hora: '09:30', min: 60, tipo: 'Hatha', nivel: 'Principiante', maestra: 'Lucía', ocupados: [5, 6, 4, 8, 3] },
  { dias: [2, 4], hora: '11:00', min: 60, tipo: 'Prenatal', nivel: 'Todos', maestra: 'Lucía', ocupados: [6, 4] },
  { dias: [1, 3], hora: '13:30', min: 30, tipo: 'Meditación', nivel: 'Todos', maestra: 'Ana Paula', ocupados: [3, 5] },
  { dias: [1, 2, 3, 4], hora: '18:30', min: 60, tipo: 'Vinyasa', nivel: 'Todos', maestra: 'Ana Paula', ocupados: [12, 11, 10, 12] },
  { dias: [1, 3, 5], hora: '19:00', min: 50, tipo: 'Pilates mat', nivel: 'Intermedio', maestra: 'Mariel', ocupados: [8, 12, 6] },
  { dias: [2, 4], hora: '20:00', min: 75, tipo: 'Yin y restaurativa', nivel: 'Todos', maestra: 'Lucía', ocupados: [7, 9] },
  { dias: [6], hora: '09:00', min: 75, tipo: 'Vinyasa', nivel: 'Todos', maestra: 'Ana Paula', ocupados: [11] },
  { dias: [6], hora: '11:00', min: 60, tipo: 'Hatha', nivel: 'Principiante', maestra: 'Lucía', ocupados: [6] },
];
const TIPOS = [...new Set(CLASES.map(c => c.tipo))];

const abrirWA = msg => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
const hora12 = hhmm => { const [h, m] = hhmm.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };

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

// Clases de un día (Date) con sus lugares
function clasesDel(d, ahora = new Date()) {
  const dow = d.getDay();
  const mismoDia = d.toDateString() === ahora.toDateString();
  return CLASES.filter(c => c.dias.includes(dow)).map(c => {
    const ocupados = Math.min(c.ocupados[c.dias.indexOf(dow)] ?? 0, CUPO);
    const [h, m] = c.hora.split(':').map(Number);
    return { ...c, ocupados, libres: CUPO - ocupados, pasada: mismoDia && h * 60 + m <= ahora.getHours() * 60 + ahora.getMinutes() };
  }).sort((a, b) => a.hora.localeCompare(b.hora));
}
window.__clasesDel = clasesDel; // para las pruebas

// ---------- Horario ----------
const lista = document.querySelector('[data-clases]');
if (lista) {
  const semana = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
  let dia = semana.find(d => d.getDay() !== 0 && clasesDel(d).some(c => !c.pasada)) || semana[1];
  let tipo = '';
  const primera = document.querySelector('[data-primera]');
  if (new URLSearchParams(location.search).get('primera') === '1') primera.checked = true;
  const largo = d => d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  const pintar = () => {
    document.querySelector('[data-semana]').innerHTML = semana.map((d, i) => {
      const n = clasesDel(d).filter(c => !c.pasada).length;
      return `<button type="button" class="day${d === dia ? ' is-on' : ''}" data-dia="${i}" ${d.getDay() === 0 ? 'disabled' : ''}>
        <small>${i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '')}</small><b>${d.getDate()}</b><span class="n">${d.getDay() === 0 ? 'Cerrado' : n + (n === 1 ? ' clase' : ' clases')}</span></button>`;
    }).join('');
    document.querySelector('[data-tipos]').innerHTML = ['', ...TIPOS].map(t => `<button type="button" class="kind${t === tipo ? ' is-on' : ''}" data-tipo="${t}">${t || 'Todas'}</button>`).join('');
    const ver = clasesDel(dia).filter(c => !tipo || c.tipo === tipo);
    lista.innerHTML = ver.length ? ver.map((c, n) => {
      const estado = c.pasada ? ' is-past' : c.libres === 0 ? ' is-full' : c.libres <= 2 ? ' is-low' : '';
      return `<li class="cls${estado}">
        <time>${hora12(c.hora).replace(/ (am|pm)$/, '')}<small>${hora12(c.hora).slice(-2)} · ${c.min} min</small></time>
        <h3>${c.tipo}<span class="lvl">${c.nivel}</span></h3>
        <p class="meta">Con ${c.maestra}</p>
        <p class="spots"><span class="mini"><span style="width:${(c.ocupados / CUPO) * 100}%"></span></span>${c.pasada ? 'Ya pasó' : c.libres === 0 ? 'Llena' : c.libres === 1 ? 'Queda 1 lugar' : `Quedan ${c.libres} lugares`}</p>
        ${c.pasada ? '' : `<button type="button" class="btn ${c.libres ? 'btn--accent' : 'btn--line'}" data-apartar="${c.hora}|${c.tipo}">${c.libres ? 'Apartar mi lugar' : 'Avísame si se libera'}</button>`}
      </li>`;
    }).join('') : '<li class="empty">No hay clases de ese tipo este día. Prueba otro día.</li>';
  };
  document.addEventListener('click', e => {
    const d = e.target.closest('[data-dia]');
    if (d) { dia = semana[+d.dataset.dia]; pintar(); }
    const t = e.target.closest('[data-tipo]');
    if (t) { tipo = t.dataset.tipo; pintar(); }
    const a = e.target.closest('[data-apartar]');
    if (a) {
      const [h, tp] = a.dataset.apartar.split('|');
      const c = clasesDel(dia).find(x => x.hora === h && x.tipo === tp);
      if (!c) return;
      abrirWA([
        c.libres ? `Hola, quiero apartar mi lugar en Prana 🧘` : `Hola, la clase está llena: avísenme si se libera un lugar 🙏`,
        `${c.tipo} con ${c.maestra}`,
        `${largo(dia)}, ${hora12(c.hora)}`,
        primera.checked ? 'Es mi primera clase (gratis).' : '',
      ].filter(Boolean).join('\n'));
    }
  });
  pintar();
}

// ---------- Efectos ----------
const header = document.querySelector('.header');
const sombra = () => header?.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', sombra, { passive: true });
sombra();
if (window.motion) {
  motion.reveal('.section-head, .plan, .teacher, .quote, .cta');
  motion.stagger('.cards, .trust');
}
