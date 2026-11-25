// Carrozzeria Cecconi — script del sito (nessuna dipendenza esterna)
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Header pieno dopo lo scroll
  const header = $('#header');
  const onScroll = () => header.classList.toggle('pieno', header.classList.contains('fisso') || window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile
  const nav = $('#nav'), menuBtn = $('#menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const aperto = nav.classList.toggle('aperto');
      menuBtn.setAttribute('aria-expanded', aperto);
      header.classList.add('pieno');
    });
    $$('a', nav).forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('aperto');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  // Anno nel footer
  const anno = $('#anno');
  if (anno) anno.textContent = new Date().getFullYear();

  // Aperto/chiuso adesso (ora italiana)
  const stato = $('#stato');
  if (stato) {
    const parti = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const p = Object.fromEntries(parti.map(x => [x.type, x.value]));
    const giorni = { dom: 0, lun: 1, mar: 2, mer: 3, gio: 4, ven: 5, sab: 6 };
    const g = giorni[p.weekday.slice(0, 3).toLowerCase()];
    const min = +p.hour * 60 + +p.minute;
    const fasce = g === 0 ? [] : g === 6 ? [[510, 780]] : [[510, 780], [900, 1140]];
    const aperto = fasce.some(([a, b]) => min >= a && min < b);
    const hhmm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
    let testo;
    if (aperto) {
      const fine = fasce.find(([a, b]) => min >= a && min < b)[1];
      testo = `Aperto ora · chiude alle ${hhmm(fine)}`;
    } else {
      const prossima = fasce.find(([a]) => min < a);
      testo = prossima ? `Chiuso ora · riapre alle ${hhmm(prossima[0])}` : (g === 6 || g === 0 ? 'Chiuso ora · riapre lunedì alle 8:30' : 'Chiuso ora · riapre domani alle 8:30');
    }
    stato.classList.add(aperto ? 'aperto' : 'chiuso');
    $('span', stato).textContent = testo;
    const riga = $(`#orari tr[data-g="${g}"]`);
    if (riga) riga.classList.add('oggi');
  }

  // Animazioni d'ingresso
  const rivela = $$('.rivela');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(voci => voci.forEach(v => {
      if (v.isIntersecting) { v.target.classList.add('visto'); io.unobserve(v.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    rivela.forEach(el => io.observe(el));
  } else rivela.forEach(el => el.classList.add('visto'));

  // Galleria con lightbox
  const lb = $('#lightbox');
  const foto = $$('#galleria button');
  if (lb && foto.length) {
    const img = $('#lb-img'), cap = $('#lb-cap');
    let i = 0;
    const mostra = n => {
      i = (n + foto.length) % foto.length;
      const b = foto[i], alt = $('img', b).alt;
      img.src = b.dataset.full; img.alt = alt; cap.textContent = alt;
    };
    foto.forEach((b, n) => b.addEventListener('click', () => { mostra(n); lb.showModal(); }));
    $('#lb-chiudi').addEventListener('click', () => lb.close());
    $('#lb-prev').addEventListener('click', () => mostra(i - 1));
    $('#lb-next').addEventListener('click', () => mostra(i + 1));
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') mostra(i - 1);
      if (e.key === 'ArrowRight') mostra(i + 1);
    });
    let x0 = null;
    lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mostra(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  // Mappa Google caricata solo su richiesta (nessun cookie finché non si clicca)
  const mappaBtn = $('#mappa-btn');
  if (mappaBtn) mappaBtn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=' + encodeURIComponent("Carrozzeria Cecconi, Via Sant'Antioco 2, 56021 Cascina PI") + '&output=embed';
    f.title = 'Mappa: Carrozzeria Cecconi, Via Sant\'Antioco 2, Cascina';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    const box = $('#mappa');
    box.innerHTML = '';
    box.style.background = 'none';
    box.appendChild(f);
  });

  // Modulo contatti (invio tramite FormSubmit, senza ricaricare la pagina)
  const form = $('#form');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault();
    const esito = $('#esito');
    esito.className = 'esito';
    if (!form.checkValidity()) {
      const primo = $$(':invalid', form).find(el => el.name);
      esito.textContent = 'Compila i campi obbligatori (*) e accetta l\'informativa privacy.';
      esito.classList.add('ko');
      if (primo) primo.focus();
      return;
    }
    if (form._honey && form._honey.value) return;
    const btn = $('button[type=submit]', form);
    btn.disabled = true; btn.textContent = 'Invio in corso…';
    try {
      const r = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === 'false' || j.success === false) throw new Error(j.message || 'errore');
      form.reset();
      esito.textContent = 'Grazie! Richiesta inviata: ti risponderemo al più presto.';
      esito.classList.add('ok');
    } catch {
      esito.innerHTML = 'Invio non riuscito. Chiamaci allo <a href="tel:+39050775082">050 775082</a> o scrivi a <a href="mailto:cecconi.mi@virgilio.it">cecconi.mi@virgilio.it</a>.';
      esito.classList.add('ko');
    } finally {
      btn.disabled = false; btn.textContent = 'Invia la richiesta';
    }
  });
})();
