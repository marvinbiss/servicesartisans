"""Analyse des 8 exports KW Ahrefs du 18/04/2026 18h."""
import csv
from pathlib import Path
from collections import Counter, defaultdict

DOWNLOADS = Path(r"C:\Users\USER\Downloads")
NORM = Path(__file__).parent / "normalized"
NORM.mkdir(exist_ok=True)

def read_utf16_tsv(path: Path):
    raw = path.read_bytes()
    if raw[:2] == b"\xff\xfe":
        text = raw.decode("utf-16-le")
    else:
        text = raw.decode("utf-8", errors="replace")
    rows = list(csv.reader(text.splitlines(), delimiter="\t", quotechar='"'))
    return rows


def norm_write(rows, name):
    dst = NORM / name
    with dst.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL)
        for row in rows:
            w.writerow(row)
    return dst


def num(x):
    try:
        return int(float((x or "0").replace(",", ".")))
    except Exception:
        return 0


def fnum(x):
    try:
        return float((x or "0").replace(",", "."))
    except Exception:
        return 0.0


files = {
    "kw1": "servicesartisans.fr-organic-keywords-subdom_2026-04-18_18-21-51.csv",
    "kw2": "servicesartisans.fr-organic-keywords-subdom_2026-04-18_18-26-12.csv",
    "positions": "servicesartisans.fr-organic-positions-subdo_2026-04-18_18-25-17.csv",
    "top_pages": "servicesartisans.fr-top-pages-subdomains-al_2026-04-18_18-26-45.csv",
    "competitors": "servicesartisans.fr_orgcompetitors_subdomain_2026-04-18_18-27-25.csv",
    "bbl_ext": "servicesartisans.fr-bbl-external-subdomains_2026-04-18_18-28-25.csv",
    "common_kw": "servicesartisans.fr_common-keywords_subdomain_2026-04-18_18-31-30.csv",
    "content_gap": "servicesartisans.fr-content-gap-subdomains-f_2026-04-18_18-32-01.csv",
}

print("=" * 90)
print("ANALYSE 8 EXPORTS KW AHREFS — 18/04/2026 18h")
print("=" * 90)

# ========== 1. ORGANIC KEYWORDS ==========
for key in ["kw1", "kw2"]:
    print(f"\n\n[{key.upper()}] {files[key]}")
    print("-" * 90)
    rows = read_utf16_tsv(DOWNLOADS / files[key])
    print(f"Total rows: {len(rows)}")
    if rows:
        print(f"Headers: {rows[0][:8]}...")
        if len(rows) > 1:
            print(f"Sample row 1: {rows[1][:8]}")
    norm_write(rows, f"kw-{key}.csv")

# ========== 2. ORGANIC POSITIONS ==========
print(f"\n\n[POSITIONS] {files['positions']}")
print("-" * 90)
rows = read_utf16_tsv(DOWNLOADS / files["positions"])
print(f"Total rows: {len(rows)}")
if rows:
    print(f"Headers: {rows[0][:8]}")
    if len(rows) > 1:
        print(f"Sample: {rows[1][:8]}")
norm_write(rows, "organic-positions.csv")

# ========== 3. TOP PAGES ==========
print(f"\n\n[TOP PAGES] {files['top_pages']}")
print("-" * 90)
rows = read_utf16_tsv(DOWNLOADS / files["top_pages"])
print(f"Total rows: {len(rows)}")
if rows:
    print(f"Headers: {rows[0][:8]}")
    if len(rows) > 1:
        print(f"Sample: {rows[1][:8]}")
norm_write(rows, "top-pages-v2.csv")

# ========== 4. COMPETITORS ==========
print(f"\n\n[COMPETITORS] {files['competitors']}")
print("-" * 90)
rows = read_utf16_tsv(DOWNLOADS / files["competitors"])
print(f"Total rows: {len(rows)}")
if rows:
    print(f"Headers: {rows[0]}")
    print("\nTop concurrents:")
    for r in rows[1:15]:
        print(f"  {r}")
norm_write(rows, "competitors-v2.csv")

# ========== 5. BEST BY LINKS EXTERNAL ==========
print(f"\n\n[BBL EXTERNAL] {files['bbl_ext']}")
print("-" * 90)
rows = read_utf16_tsv(DOWNLOADS / files["bbl_ext"])
print(f"Total rows: {len(rows)}")
if rows:
    print(f"Headers: {rows[0][:8]}")
    if len(rows) > 1:
        print("Top pages by external backlinks:")
        for r in rows[1:15]:
            print(f"  {r[:5]}")
norm_write(rows, "best-by-links-external.csv")

# ========== 6. COMMON KW ==========
print(f"\n\n[COMMON KW] {files['common_kw']}")
print("-" * 90)
rows = read_utf16_tsv(DOWNLOADS / files["common_kw"])
print(f"Total rows: {len(rows)}")
if rows:
    print(f"Headers: {rows[0]}")
    for r in rows[1:]:
        print(f"  {r}")
norm_write(rows, "common-keywords-v2.csv")

# ========== 7. CONTENT GAP ==========
print(f"\n\n[CONTENT GAP] {files['content_gap']} — LARGE FILE (51MB)")
print("-" * 90)
# Stream large file
path = DOWNLOADS / files["content_gap"]
raw_head = path.read_bytes()[:10000]
if raw_head[:2] == b"\xff\xfe":
    text_head = raw_head.decode("utf-16-le", errors="replace")
else:
    text_head = raw_head.decode("utf-8", errors="replace")
print(f"First 500 chars: {text_head[:500]}")

# Count rows without loading all
import io
with path.open("rb") as f:
    raw = f.read()
if raw[:2] == b"\xff\xfe":
    text = raw.decode("utf-16-le", errors="replace")
else:
    text = raw.decode("utf-8", errors="replace")
rows = list(csv.reader(text.splitlines(), delimiter="\t", quotechar='"'))
print(f"Total rows: {len(rows)}")
if rows:
    print(f"Headers: {rows[0]}")
    if len(rows) > 1:
        print(f"Sample row 1: {rows[1]}")

# Save normalized
with (NORM / "content-gap-v2.csv").open("w", encoding="utf-8", newline="") as f:
    w = csv.writer(f, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in rows:
        w.writerow(row)

print("\n" + "=" * 90)
print("DONE — fichiers normalisés dans docs/ahrefs-audit-2026-04/normalized/")
print("=" * 90)
