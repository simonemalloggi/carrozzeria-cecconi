#!/usr/bin/env python3
"""Scarica le immagini dal vecchio sito Wix (una sola volta) e crea le versioni ottimizzate.

- Originali salvati in site/img/originali/<name>.<ext> (archivio, non usati dalle pagine)
- Foto: site/img/<name>-480.webp, -960.webp, -1600.webp e <name>-1600.jpg (anteprima social)
- Loghi: site/img/<name>.webp e <name>.png (max 400px)

Idempotente: se un file esiste già non viene riscaricato né rigenerato.
"""
import json
import pathlib
import sys
import urllib.request

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMG = ROOT / "site" / "img"
ORIG = IMG / "originali"
WIDTHS = (480, 960, 1600)


def download(url: str, dest: pathlib.Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (migrazione sito)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        dest.write_bytes(r.read())


def resized(im: Image.Image, width: int) -> Image.Image:
    if im.width <= width:
        return im.copy()
    h = round(im.height * width / im.width)
    return im.resize((width, h), Image.LANCZOS)


def main() -> int:
    cfg = json.loads((ROOT / "scripts" / "images.json").read_text(encoding="utf-8"))
    ORIG.mkdir(parents=True, exist_ok=True)
    changed = False
    failed = 0
    for item in cfg["images"]:
        name, wix = item["name"], item["wix"]
        ext = pathlib.Path(wix).suffix.lower() if wix else ".jpg"
        src = next((p for p in ORIG.glob(name + ".*")), None)
        if src is None and not wix:
            print(f"ATTENZIONE: manca site/img/originali/{name}.*, la salto")
            continue
        if src is None:
            src = ORIG / (name + ext)
            print(f"Scarico {name} ...")
            try:
                download(cfg["base"] + wix, src)
            except Exception as e:  # rete non disponibile: riprova al prossimo avvio
                print(f"ATTENZIONE: download di {name} non riuscito ({e})")
                src.unlink(missing_ok=True)
                failed += 1
                continue
            changed = True
        im = Image.open(src)
        im.load()
        if item.get("logo"):
            out_png, out_webp = IMG / f"{name}.png", IMG / f"{name}.webp"
            if not out_webp.exists():
                small = resized(im.convert("RGBA"), 400)
                small.save(out_png, optimize=True)
                small.save(out_webp, "WEBP", quality=90, method=6)
                changed = True
            continue
        rgb = im.convert("RGB")
        for w in WIDTHS:
            out = IMG / f"{name}-{w}.webp"
            if not out.exists():
                resized(rgb, w).save(out, "WEBP", quality=78, method=6)
                changed = True
        jpg = IMG / f"{name}-1600.jpg"
        if not jpg.exists():
            resized(rgb, 1600).save(jpg, "JPEG", quality=80, optimize=True, progressive=True)
            changed = True
    print("Immagini aggiornate." if changed else "Nessuna immagine da aggiornare.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
