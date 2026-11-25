#!/usr/bin/env python3
"""Rigenera la sezione recensioni della home (site/index.html) da site/assets/recensioni.json."""
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MESI = "gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre".split()
e = lambda s: html.escape(str(s), quote=True)


def mese(m: str) -> str:
    a, n = m.split("-")
    return f"{MESI[int(n) - 1]} {a}"


def main() -> int:
    dati = json.loads((ROOT / "site" / "assets" / "recensioni.json").read_text(encoding="utf-8"))
    scelte = sorted((r for r in dati["recensioni"] if r.get("evidenza")), key=lambda r: r["evidenza"])
    stelle = '<span class="stelle" aria-label="5 stelle su 5">★★★★★</span>'
    cards = []
    for r in scelte:
        av = (f'<img class="avatar" src="{e(r["avatar"])}" width="40" height="40" alt="" loading="lazy">'
              if r.get("avatar") else f'<span class="avatar" aria-hidden="true">{e(r["autore"][0].upper())}</span>')
        cards.append(f'''        <figure class="recensione rivela">
          {stelle}
          <blockquote>{e(r["testo"])}</blockquote>
          <figcaption>{av}<span><b>{e(r["autore"])}</b><small>{mese(r["mese"])} · Google</small></span></figcaption>
        </figure>''')
    blocco = f'''<!--RECENSIONI-INIZIO (generato da scripts/build_reviews.py, non modificare a mano)-->
      <div class="rec-sintesi">
        <span class="rec-voto">{e(dati["media"])}</span>
        <span>{stelle}<br><small>{e(dati["totale"])} recensioni su Google</small></span>
      </div>
      <div class="recensioni">
{chr(10).join(cards)}
      </div>
      <div class="recensioni-cta">
        <a class="btn btn-giallo" href="recensioni.html">Leggi tutte le {e(dati["totale"])} recensioni</a>
        <a class="btn btn-linea" href="{e(dati["link_scrivi"])}" target="_blank" rel="noopener">Lascia una recensione su Google</a>
      </div>
      <!--RECENSIONI-FINE-->'''
    p = ROOT / "site" / "index.html"
    src = p.read_text(encoding="utf-8")
    new, n = re.subn(r"<!--RECENSIONI-INIZIO.*?<!--RECENSIONI-FINE-->", lambda m: blocco, src, flags=re.S)
    if n != 1:
        sys.exit("Marcatori RECENSIONI non trovati in index.html")
    p.write_text(new, encoding="utf-8")
    print(f"Home aggiornata: {len(cards)} recensioni in evidenza, {dati['totale']} totali, media {dati['media']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
