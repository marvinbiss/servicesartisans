"""Convertit les nouveaux exports."""
import csv
from pathlib import Path

DOWNLOADS = Path(r"C:\Users\USER\Downloads")
OUTPUT = Path(__file__).parent / "normalized"
OUTPUT.mkdir(exist_ok=True)

FILES = {
    "ahrefs-top-target-pages.csv":   "servicesartisans.fr-Top target pages-2026-04-18.csv",
    "gsc-graphique-indexation.csv":  "Graphique.csv",
    "gsc-metadonnees.csv":           "Métadonnées.csv",
    "gsc-problemes-critiques.csv":   "Problèmes critiques.csv",
    "gsc-problemes-non-critiques.csv":"Problèmes non critiques.csv",
    "gsc-tableau.csv":               "Tableau.csv",
    "gsc-graphique-https.csv":       "Graphique - copie.csv",
}

def detect_and_convert(src, dst):
    raw = src.read_bytes()
    if raw[:2] == b"\xff\xfe":   text = raw.decode("utf-16-le"); enc = "utf-16-le"
    elif raw[:2] == b"\xfe\xff": text = raw.decode("utf-16-be"); enc = "utf-16-be"
    elif raw[:3] == b"\xef\xbb\xbf": text = raw.decode("utf-8-sig"); enc = "utf-8-bom"
    else:
        try: text = raw.decode("utf-8"); enc = "utf-8"
        except: text = raw.decode("latin-1"); enc = "latin-1"
    sample = text[:5000]
    delim = "\t" if sample.count("\t") > sample.count(",") else ","
    rows = list(csv.reader(text.splitlines(), delimiter=delim, quotechar='"'))
    with dst.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL)
        for row in rows: w.writerow(row)
    return len(rows), enc

for safe_name, src_name in FILES.items():
    src = DOWNLOADS / src_name
    if not src.exists():
        print(f"MISSING: {src_name}")
        continue
    dst = OUTPUT / safe_name
    rows, enc = detect_and_convert(src, dst)
    print(f"{safe_name:<40} OK  rows={rows:<6} enc={enc}")
