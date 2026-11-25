#!/usr/bin/env python3
"""Converte l'estrazione grezza da Google (scripts/recensioni-raw.json) nel file usato dal sito.

Formato grezzo: lista di {id, a (autore), s (stelle), m (AAAA-MM), t (testo), ph [url foto]}
Uscita: site/assets/recensioni.json

- I cognomi vengono abbreviati (Mario Rossi -> Mario R.).
- Media e totale sono calcolati dai dati.
- Le recensioni in evidenza in home sono quelle elencate in scripts/in_evidenza.json (per id o per autore).
- Le immagini del profilo NON vengono importate (scelta privacy): il sito mostra l'iniziale.
- Le foto già scaricate in locale vengono mantenute.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "scripts" / "recensioni-raw.json"
OUT = ROOT / "site" / "assets" / "recensioni.json"
EVID = ROOT / "scripts" / "in_evidenza.json"
PLACE_ID = "ChIJkbvuK9ON1RIRbkpmpVhqUSI"


def abbrevia(nome: str) -> str:
    parti = nome.strip().split()
    if len(parti) < 2:
        return nome.strip()
    return f"{parti[0].capitalize() if parti[0].islower() else parti[0]} {parti[-1][0].upper()}."


def main() -> int:
    if not RAW.exists():
        print("Nessun file grezzo: niente da importare.")
        return 0
    raw = json.loads(RAW.read_text(encoding="utf-8"))
    prima = {}
    if OUT.exists():
        prima = {r["id"]: r for r in json.loads(OUT.read_text(encoding="utf-8"))["recensioni"]}
    evid = json.loads(EVID.read_text(encoding="utf-8")) if EVID.exists() else []

    recensioni = []
    for r in raw:
        vecchia = prima.get(r["id"], {})
        recensioni.append({
            "id": r["id"],
            "autore": abbrevia(r["a"]),
            "voto": int(r["s"]),
            "mese": r["m"],
            "testo": r.get("t", "").strip(),
            "src_foto": r.get("ph", []),
            "foto": vecchia.get("foto", []),
            "evidenza": (evid.index(r["a"]) + 1) if r["a"] in evid else ((evid.index(r["id"]) + 1) if r["id"] in evid else 0),
        })

    media = sum(r["voto"] for r in recensioni) / len(recensioni)
    dati = {
        "aggiornato": max(r["mese"] for r in recensioni),
        "media": f"{media:.1f}".replace(".", ","),
        "totale": len(recensioni),
        "link_google": f"https://search.google.com/local/reviews?placeid={PLACE_ID}",
        "link_scrivi": f"https://search.google.com/local/writereview?placeid={PLACE_ID}",
        "recensioni": recensioni,
    }
    OUT.write_text(json.dumps(dati, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Importate {len(recensioni)} recensioni, media {dati['media']}, in evidenza {sum(1 for r in recensioni if r['evidenza'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
