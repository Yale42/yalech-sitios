// Puente English · funciones compartidas por las 3 páginas.
const WHATSAPP = '520000000000';
const CUPO = 8;
// Grupos: nivel, edad, modalidad, días, hora y cuántos lugares están ocupados
const GRUPOS = [
  { id: 'k1', nivel: 'A1', edad: 'Niños', modo: 'Presencial', dias: 'Lun y mié', hora: '16:00 – 17:00', ocupados: 6, inicio: 'Ya empezó · puedes entrar' },
  { id: 'k2', nivel: 'A2', edad: 'Niños', modo: 'Presencial', dias: 'Mar y jue', hora: '17:00 – 18:00', ocupados: 8, inicio: 'Ya empezó' },
  { id: 't1', nivel: 'A2', edad: 'Adolescentes', modo: 'Presencial', dias: 'Lun y mié', hora: '18:00 – 19:30', ocupados: 5, inicio: 'Empieza el 1 de diciembre' },
  { id: 't2', nivel: 'B1', edad: 'Adolescentes', modo: 'En línea', dias: 'Mar y jue', hora: '19:00 – 20:30', ocupados: 7, inicio: 'Empieza el 1 de diciembre' },
  { id: 'a1', nivel: 'A1', edad: 'Adultos', modo: 'Presencial', dias: 'Sábados', hora: '9:00 – 12:00', ocupados: 3, inicio: 'Empieza el 6 de diciembre' },
  { id: 'a2', nivel: 'A2', edad: 'Adultos', modo: 'En línea', dias: 'Lun, mié y vie', hora: '7:00 – 8:00', ocupados: 6, inicio: 'Empieza el 1 de diciembre' },
  { id: 'a3', nivel: 'B1', edad: 'Adultos', modo: 'Presencial', dias: 'Mar y jue', hora: '19:30 – 21:00', ocupados: 8, inicio: 'Ya empezó' },
  { id: 'a4', nivel: 'B1', edad: 'Adultos', modo: 'En línea', dias: 'Lun y mié', hora: '20:00 – 21:30', ocupados: 4, inicio: 'Empieza el 1 de diciembre' },
  { id: 'a5', nivel: 'B2', edad: 'Adultos', modo: 'En línea', dias: 'Mar y jue', hora: '7:00 – 8:30', ocupados: 2, inicio: 'Empieza el 2 de diciembre' },
  { id: 'a6', nivel: 'C1', edad: 'Adultos', modo: 'Presencial', dias: 'Viernes', hora: '18:00 – 21:00', ocupados: 5, inicio: 'Empieza el 5 de diciembre' },
];
// Examen: pregunta (con ___ donde va la respuesta), opciones y cuál es la buena (índice). De fácil a difícil.
const PREGUNTAS = [
  ['My name ___ Ana.', ['are', 'is', 'am', 'be'], 1],
  ['___ you like pizza?', ['Does', 'Are', 'Do', 'Is'], 2],
  ['She ___ to work every day.', ['go', 'goes', 'going', 'gone'], 1],
  ['Yesterday I ___ a movie with my friends.', ['see', 'seen', 'saw', 'seeing'], 2],
  ['There aren\u2019t ___ apples left.', ['some', 'any', 'no', 'many of'], 1],
  ['I have lived here ___ 2019.', ['for', 'since', 'from', 'during'], 1],
  ['If it rains tomorrow, we ___ at home.', ['stay', 'would stay', 'will stay', 'stayed'], 2],
  ['The report ___ by the manager last week.', ['was written', 'wrote', 'has written', 'is writing'], 0],
  ['I wish I ___ more time to travel.', ['have', 'had', 'will have', 'am having'], 1],
  ['By the time we arrived, the show ___.', ['already started', 'has already started', 'had already started', 'was already start'], 2],
];
const NIVELES = [
  [2, 'A1', 'Principiante', 'Vas a empezar con bases firmes: presentarte, pedir cosas y entender lo básico.'],
  [4, 'A2', 'Básico', 'Ya entiendes frases comunes. Ahora toca soltarte para platicar de tu día a día.'],
  [6, 'B1', 'Intermedio', 'Ya te defiendes. Te falta practicar tiempos pasados y condicionales para hablar con fluidez.'],
  [8, 'B2', 'Intermedio alto', 'Hablas bien. Te vamos a pulir para que suenes natural en el trabajo.'],
  [10, 'C1', 'Avanzado', '¡Muy bien! Te recomendamos conversación avanzada o preparación TOEFL.'],
];
const nivelDe = aciertos => NIVELES.find(([max]) => aciertos <= max);

const abrirWA = msg => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

// ---------- Examen de ubicación ----------
const quiz = document.querySelector('[data-quiz]');
if (quiz) {
  const resp = Array(PREGUNTAS.length).fill(null);
  let i = 0;
  const pintar = () => {
    const [q, ops] = PREGUNTAS[i];
    quiz.innerHTML = `
      <div class="progress"><span>${i + 1} de ${PREGUNTAS.length}</span><span class="bar"><span style="width:${(i / PREGUNTAS.length) * 100}%"></span></span></div>
      <p class="q-text">${esc(q).replace('___', '<u>&nbsp;___&nbsp;</u>')}</p>
      <div class="opts">${ops.map((o, n) => `<button type="button" class="opt${resp[i] === n ? ' is-picked' : ''}" data-op="${n}"><b>${'ABCD'[n]}</b>${esc(o)}</button>`).join('')}</div>
      <div class="q-foot"><button type="button" data-atras ${i ? '' : 'disabled'}><i class="fa-solid fa-arrow-left"></i> Anterior</button></div>`;
  };
  const resultado = () => {
    const aciertos = resp.filter((r, n) => r === PREGUNTAS[n][2]).length;
    const [, nv, nombre, texto] = nivelDe(aciertos);
    quiz.innerHTML = `
      <div class="progress"><span>Listo</span><span class="bar"><span style="width:100%"></span></span></div>
      <div class="result" data-nivel-resultado="${nv}">
        <span class="lvl">${nv}</span>
        <h2>Tu nivel: ${nombre}</h2>
        <p class="score">${aciertos} de ${PREGUNTAS.length} correctas</p>
        <p>${texto}</p>
        <div class="btns">
          <a class="btn btn--accent btn--block" href="grupos.html?nivel=${nv}">Ver grupos de ${nv}</a>
          <button type="button" class="btn btn--line btn--block" data-wa-nivel><i class="fa-brands fa-whatsapp"></i> Pedir mi clase muestra</button>
          <button type="button" class="btn btn--block" data-repetir style="background: none">Volver a empezar</button>
        </div>
        <details class="review"><summary>Ver mis respuestas</summary><ol>${PREGUNTAS.map(([q, ops, ok], n) => `
          <li class="${resp[n] === ok ? 'ok' : 'bad'}">${esc(q.replace('___', ops[ok]))}${resp[n] === ok ? ' ✓' : ` <small>(elegiste «${esc(ops[resp[n]] ?? '—')}»)</small>`}</li>`).join('')}</ol></details>
      </div>`;
    quiz.querySelector('[data-wa-nivel]').addEventListener('click', () => abrirWA(`Hola, hice el examen de ubicación de Puente English.\nMi resultado: ${nv} · ${nombre} (${aciertos} de ${PREGUNTAS.length}).\nQuiero agendar mi clase muestra gratis.`));
    quiz.querySelector('[data-repetir]').addEventListener('click', () => { resp.fill(null); i = 0; pintar(); });
  };
  quiz.addEventListener('click', e => {
    const op = e.target.closest('[data-op]');
    if (op) {
      resp[i] = +op.dataset.op;
      op.classList.add('is-picked');
      quiz.querySelectorAll('[data-op]').forEach(b => { b.disabled = true; });
      setTimeout(() => { i++; i < PREGUNTAS.length ? pintar() : resultado(); }, 350);
    }
    if (e.target.closest('[data-atras]') && i > 0) { i--; pintar(); }
  });
  window.__examen = { responder: arr => { arr.forEach((r, n) => { resp[n] = r; }); i = PREGUNTAS.length; resultado(); } }; // para las pruebas
  pintar();
}

// ---------- Grupos ----------
const lista = document.querySelector('[data-grupos]');
if (lista) {
  const F = { edad: '', modo: '' };
  const OPC = { edad: ['Niños', 'Adolescentes', 'Adultos'], modo: ['Presencial', 'En línea'] };
  const sel = document.querySelector('[data-nivel]');
  const q = new URLSearchParams(location.search).get('nivel');
  if ([...sel.options].some(o => o.value && o.value === q)) sel.value = q; // un enlace alterado no rompe nada
  const chips = () => Object.keys(OPC).forEach(k => {
    document.querySelector(`[data-filtro="${k}"]`).innerHTML = ['', ...OPC[k]].map(v =>
      `<button type="button" class="chip${F[k] === v ? ' is-on' : ''}" data-f="${k}" data-v="${v}">${v || (k === 'edad' ? 'Todas las edades' : 'Presencial y en línea')}</button>`).join('');
  });
  const pintar = () => {
    chips();
    const ver = GRUPOS.filter(g => (!F.edad || g.edad === F.edad) && (!F.modo || g.modo === F.modo) && (!sel.value || g.nivel === sel.value));
    lista.innerHTML = ver.length ? ver.map(g => {
      const libres = Math.max(CUPO - g.ocupados, 0);
      return `<li class="group" data-grupo="${g.id}">
        <div class="group-top"><span class="lv">${g.nivel}</span><div><h3>${g.edad}</h3><small>${g.modo === 'En línea' ? '<i class="fa-solid fa-video"></i>' : '<i class="fa-solid fa-school"></i>'} ${g.modo}</small></div></div>
        <ul><li><i class="fa-regular fa-calendar"></i> ${g.dias}</li><li><i class="fa-regular fa-clock"></i> ${g.hora}</li><li><i class="fa-solid fa-flag"></i> ${g.inicio}</li></ul>
        <div class="seats" aria-hidden="true">${Array.from({ length: CUPO }, (_, n) => `<i class="${n < g.ocupados ? '' : 'free'}"></i>`).join('')}</div>
        <p class="seats-txt${libres === 0 ? ' is-full' : libres <= 2 ? ' is-low' : ''}">${libres === 0 ? 'Lleno' : libres === 1 ? '¡Queda 1 lugar!' : `Quedan ${libres} lugares`}</p>
        <button type="button" class="btn ${libres ? 'btn--accent' : 'btn--line'} btn--block" data-apartar="${g.id}">${libres ? 'Apartar mi lugar' : 'Anotarme en lista de espera'}</button>
      </li>`;
    }).join('') : '<li class="empty">No hay grupos con esos filtros. <button type="button" class="chip" data-limpiar>Ver todos</button></li>';
  };
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-f]');
    if (c) { F[c.dataset.f] = c.dataset.v; pintar(); }
    if (e.target.closest('[data-limpiar]')) { F.edad = F.modo = ''; sel.value = ''; pintar(); }
    const a = e.target.closest('[data-apartar]');
    if (a) {
      const g = GRUPOS.find(x => x.id === a.dataset.apartar);
      const lleno = g.ocupados >= CUPO;
      abrirWA(`Hola, quiero ${lleno ? 'anotarme en la lista de espera del' : 'apartar un lugar en el'} grupo de inglés:\n${g.nivel} · ${g.edad} · ${g.modo}\n${g.dias}, ${g.hora}\n${g.inicio}`);
    }
  });
  sel.addEventListener('change', pintar);
  pintar();
}

// ---------- Efectos ----------
const header = document.querySelector('.header');
const sombra = () => header?.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', sombra, { passive: true });
sombra();
if (window.motion) {
  motion.reveal('.section-head, .band, .quote, .cta, .aside-tip');
  motion.stagger('.cards, .trust');
}
