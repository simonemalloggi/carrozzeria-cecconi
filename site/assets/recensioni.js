// Pagina recensioni: caricamento, filtri, ricerca, ordinamento e foto
(() => {
  const $ = s => document.querySelector(s);
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const mese = m => { const [a, n] = m.split('-'); return `${MESI[+n - 1]} ${a}`; };
  // Google indica solo "un anno fa", "3 anni fa": oltre i 6 mesi mostriamo solo l'anno per non inventare una precisione che non c'è
  let rif = '9999-12';
  const quando = m => { const [a, n] = m.split('-'); const [ra, rn] = rif.split('-'); const diff = (ra - a) * 12 + (rn - n); return diff > 6 ? a : mese(m); };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const PAGINA = 24;

  let tutte = [], visibili = [], mostrate = 0;
  const stato = { voto: 0, foto: false, testo: false, cerca: '', ordine: 'recenti' };

  const lista = $('#r-lista'), altre = $('#r-altre'), conteggio = $('#r-conteggio');

  function card(r) {
    const av = r.avatar
      ? `<img class="avatar" src="${esc(r.avatar)}" width="44" height="44" alt="" loading="lazy" decoding="async">`
      : `<span class="avatar" aria-hidden="true">${esc(r.autore.charAt(0).toUpperCase())}</span>`;
    const stelle = '★'.repeat(r.voto) + '<span class="vuote">' + '★'.repeat(5 - r.voto) + '</span>';
    const testo = r.testo
      ? `<blockquote class="${r.testo.length > 420 ? 'lunga' : ''}">${esc(r.testo).replace(/\n+/g, '<br>')}</blockquote>${r.testo.length > 420 ? '<button type="button" class="leggi">Leggi tutto</button>' : ''}`
      : '<p class="senza-testo">Ha lasciato solo il voto.</p>';
    const foto = r.foto && r.foto.length
      ? `<div class="rec-foto">${r.foto.map((f, i) => `<button type="button" data-full="${esc(f)}-1200.webp" data-cap="Foto di ${esc(r.autore)}" aria-label="Ingrandisci foto ${i + 1} di ${esc(r.autore)}"><img src="${esc(f)}-480.webp" alt="Foto della recensione di ${esc(r.autore)}" loading="lazy" decoding="async"></button>`).join('')}</div>`
      : '';
    return `<article class="recensione">
      <header>${av}<span><b>${esc(r.autore)}</b><small>${quando(r.mese)}</small></span><span class="stelle" aria-label="${r.voto} stelle su 5">${stelle}</span></header>
      ${testo}${foto}
    </article>`;
  }

  function applica() {
    const q = norm(stato.cerca.trim());
    visibili = tutte.filter(r =>
      (!stato.voto || r.voto === stato.voto) &&
      (!stato.foto || (r.foto && r.foto.length)) &&
      (!stato.testo || r.testo) &&
      (!q || norm(r.testo + ' ' + r.autore).includes(q))
    );
    const ord = {
      recenti: (a, b) => b.mese.localeCompare(a.mese),
      vecchie: (a, b) => a.mese.localeCompare(b.mese),
      lunghe: (a, b) => b.testo.length - a.testo.length,
      foto: (a, b) => (b.foto || []).length - (a.foto || []).length || b.mese.localeCompare(a.mese),
      alto: (a, b) => b.voto - a.voto || b.mese.localeCompare(a.mese),
      basso: (a, b) => a.voto - b.voto || b.mese.localeCompare(a.mese)
    }[stato.ordine];
    visibili.sort(ord);
    mostrate = 0;
    lista.innerHTML = '';
    conteggio.textContent = visibili.length === tutte.length
      ? `${tutte.length} recensioni`
      : `${visibili.length} recensioni su ${tutte.length}`;
    if (!visibili.length) lista.innerHTML = '<p class="rec-vuoto">Nessuna recensione corrisponde ai filtri scelti.</p>';
    altro();
  }

  function altro() {
    const blocco = visibili.slice(mostrate, mostrate + PAGINA);
    lista.insertAdjacentHTML('beforeend', blocco.map(card).join(''));
    mostrate += blocco.length;
    altre.hidden = mostrate >= visibili.length;
  }

  function barre(dati) {
    const n = [5, 4, 3, 2, 1].map(v => [v, dati.recensioni.filter(r => r.voto === v).length]);
    $('#r-barre').innerHTML = n.map(([v, c]) => `<button type="button" class="barra" data-voto="${v}" aria-label="${c} recensioni da ${v} stelle"><span>${v}</span><i><b style="width:${(c / dati.totale * 100).toFixed(1)}%"></b></i><small>${c}</small></button>`).join('');
  }

  function scegliVoto(v) {
    stato.voto = v;
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('attivo', +c.dataset.voto === v));
    applica();
  }

  // Eventi
  document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => scegliVoto(+c.dataset.voto)));
  $('#r-barre').addEventListener('click', e => { const b = e.target.closest('.barra'); if (b) scegliVoto(+b.dataset.voto); });
  $('#r-foto').addEventListener('change', e => { stato.foto = e.target.checked; applica(); });
  $('#r-testo').addEventListener('change', e => { stato.testo = e.target.checked; applica(); });
  $('#r-ordine').addEventListener('change', e => { stato.ordine = e.target.value; applica(); });
  let t;
  $('#r-cerca').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { stato.cerca = e.target.value; applica(); }, 200); });
  altre.addEventListener('click', altro);
  lista.addEventListener('click', e => {
    const l = e.target.closest('.leggi');
    if (l) { const q = l.previousElementSibling; q.classList.toggle('aperta'); l.textContent = q.classList.contains('aperta') ? 'Riduci' : 'Leggi tutto'; return; }
    const f = e.target.closest('.rec-foto button');
    if (f) apriFoto(f);
  });

  // Lightbox per le foto delle recensioni
  const lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  let gruppo = [], idx = 0;
  const mostra = n => { idx = (n + gruppo.length) % gruppo.length; const b = gruppo[idx]; lbImg.src = b.dataset.full; lbImg.alt = b.dataset.cap; lbCap.textContent = b.dataset.cap; };
  function apriFoto(btn) { gruppo = [...btn.parentElement.querySelectorAll('button')]; mostra(gruppo.indexOf(btn)); lb.showModal(); }
  $('#lb-chiudi').addEventListener('click', () => lb.close());
  $('#lb-prev').addEventListener('click', () => mostra(idx - 1));
  $('#lb-next').addEventListener('click', () => mostra(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') mostra(idx - 1); if (e.key === 'ArrowRight') mostra(idx + 1); });

  // Avvio
  fetch('assets/recensioni.json')
    .then(r => r.json())
    .then(dati => {
      tutte = dati.recensioni;
      rif = dati.aggiornato;
      $('#r-media').textContent = dati.media;
      $('#r-totale').textContent = `${dati.totale} recensioni su Google`;
      $('#r-agg').textContent = mese(dati.aggiornato);
      if (dati.link_scrivi) $('#r-scrivi').href = dati.link_scrivi;
      if (dati.link_google) $('#r-google').href = dati.link_google;
      barre(dati);
      applica();
    })
    .catch(() => { lista.innerHTML = '<p class="rec-vuoto">Impossibile caricare le recensioni. <a href="https://search.google.com/local/reviews?placeid=ChIJkbvuK9ON1RIRbkpmpVhqUSI">Leggile su Google</a>.</p>'; });
})();
