#!/usr/bin/env python3
"""Scarica in locale le foto delle recensioni (una sola volta) e aggiorna site/assets/recensioni.json.

Foto:   site/img/recensioni/f/<id>-<n>-480.webp e -1200.webp
Le immagini del profilo non vengono scaricate (scelta privacy). Se un download fallisce si riprova al giro successivo.
"""
import io
import json
import pathlib
import sys
import urllib.request

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "site" / "assets" / "recensioni.json"
F_DIR = ROOT / "site" / "img" / "recensioni" / "f"


def get(url: str) -> Image.Image:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        im = Image.open(io.BytesIO(r.read()))
        im.load()
        return im


def main() -> int:
    if not DATA.exists():
        return 0
    dati = json.loads(DATA.read_text(encoding="utf-8"))
    F_DIR.mkdir(parents=True, exist_ok=True)
    nuovi = errori = 0
    for r in dati["recensioni"]:
        rid = r["id"]
        foto = []
        for n, src in enumerate(r.get("src_foto", []), 1):
            big, small = F_DIR / f"{rid}-{n}-1200.webp", F_DIR / f"{rid}-{n}-480.webp"
            if not big.exists():
                try:
                    im = get(src + "=w1600").convert("RGB")
                    for w, p in ((1200, big), (480, small)):
                        c = im.copy()
                        c.thumbnail((w, w * 2))
                        c.save(p, "WEBP", quality=78)
                    nuovi += 1
                except Exception as e:
                    errori += 1
                    print(f"foto {rid}-{n}: {e}")
            if big.exists():
                foto.append(f"img/recensioni/f/{rid}-{n}")
        r["foto"] = foto
    DATA.write_text(json.dumps(dati, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Immagini recensioni: {nuovi} nuove, {errori} errori")
    return 0


if __name__ == "__main__":
    sys.exit(main())
