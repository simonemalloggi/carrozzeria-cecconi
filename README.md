# Sito Carrozzeria Cecconi

Sito statico (HTML, CSS, JS senza framework) pubblicato gratis con GitHub Pages.
Realizzato da BeeStudio.

## Struttura

- `site/` tutto ciò che viene pubblicato
  - `index.html` home (unica pagina con tutte le sezioni)
  - `privacy.html`, `cookie.html`, `grazie.html`, `404.html`
  - `assets/style.css`, `assets/main.js`, `assets/fonts/` (font in locale, nessuna chiamata a Google Fonts)
  - `img/` immagini ottimizzate (webp 480/960/1600 px) e `img/originali/` archivio
- `scripts/images.json` elenco foto; `scripts/fetch_images.py` scarica da Wix quelle mancanti e genera le versioni ottimizzate
- `.github/workflows/deploy.yml` a ogni modifica su `main` ottimizza le immagini e pubblica il sito

## Prima pubblicazione

1. Crea un repository su GitHub (es. `carrozzeria-cecconi`) e carica tutto il contenuto di questa cartella, compresa la cartella nascosta `.github`.
2. Nel repository: Settings > Pages > Build and deployment > Source: **GitHub Actions**.
3. Settings > Actions > General > Workflow permissions: **Read and write permissions**.
4. Scheda Actions: avvia "Pubblica sito" (o fai una modifica qualsiasi). Tutte le foto sono già nel repository: il sito non dipende da Wix.
5. Il sito è visibile su `https://<utente>.github.io/carrozzeria-cecconi/` per il controllo.

## Passaggio del dominio

1. Settings > Pages > Custom domain: `www.carrozzeria-cecconi.it`, poi spunta "Enforce HTTPS" quando disponibile.
2. Dal pannello DNS del dominio:
   - `www` record CNAME verso `<utente>.github.io`
   - dominio nudo `@` record A verso 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
3. Solo dopo che il sito risponde sul dominio, disdici il piano Wix.

Se il dominio è stato acquistato tramite Wix va prima trasferito a un registrar esterno (es. Aruba, Register.it, Cloudflare), altrimenti con la disdetta si perde.

## Modulo contatti

Usa FormSubmit (gratuito, nessun account). Alla prima richiesta inviata dal sito arriva a `cecconi.mi@virgilio.it` una mail di attivazione da confermare: fino ad allora i messaggi non vengono consegnati. Fai tu un invio di prova subito dopo la pubblicazione.

## Modifiche frequenti

- Testi, orari, telefono: `site/index.html` (gli orari compaiono anche nei dati strutturati in testa alla pagina e nel calcolo "Aperto ora" in `assets/main.js`).
- Nuova foto: copiala in `site/img/originali/nome-foto.jpg`, aggiungi `{"name": "nome-foto", "wix": null}` a `scripts/images.json` e il riquadro corrispondente nella galleria di `index.html`.

## Recensioni

Nessun servizio esterno: tutte le recensioni Google stanno nel sito.
- `scripts/recensioni-raw.json` (NON nel repository: sta in Dropbox) estrazione da Google Maps (autore, voto, mese, testo, url foto; le immagini del profilo non vengono usate)
- `scripts/in_evidenza.json` autori delle recensioni mostrate in home, in ordine
- Ad ogni pubblicazione il workflow esegue `import_reviews.py` (crea `site/assets/recensioni.json`, abbrevia i cognomi), `fetch_review_media.py` (scarica una volta le foto in `site/img/recensioni/`) e `build_reviews.py` (aggiorna la sezione in home).
- Pagina completa con filtri e ordinamento: `site/recensioni.html` + `site/assets/recensioni.js`.
