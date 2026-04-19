"""Analyse des exports historiques Ahrefs — chute maillage 1M -> 200K."""
import csv
from pathlib import Path
from datetime import datetime

DOWNLOADS = Path(r"C:\Users\USER\Downloads")
NORM = Path(__file__).parent / "normalized"
NORM.mkdir(exist_ok=True)


def read_utf16_tsv(path: Path):
    """Ahrefs exports are UTF-16 LE with tab delimiter."""
    raw = path.read_bytes()
    if raw[:2] == b"\xff\xfe":
        text = raw.decode("utf-16-le")
    elif raw[:3] == b"\xef\xbb\xbf":
        text = raw.decode("utf-8-sig")
    else:
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            text = raw.decode("utf-16-le")
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
        return float((x or "0").replace(",", "."))
    except Exception:
        return 0.0


print("=" * 80)
print("ANALYSE EXPORTS HISTORIQUES AHREFS — 18/04/2026")
print("=" * 80)

# 1. Organic keywords history
print("\n[1] ORGANIC KEYWORDS HISTORY")
print("-" * 80)
for f in sorted(DOWNLOADS.glob("servicesartisans.fr-organic-keywords-history_*.csv")):
    rows = read_utf16_tsv(f)
    print(f"\nFile: {f.name}")
    print(f"Rows: {len(rows)}")
    if rows:
        print(f"Headers: {rows[0]}")
        if len(rows) > 1:
            print(f"First data row: {rows[1]}")
        if len(rows) > 5:
            print(f"Sample rows 2-5:")
            for r in rows[2:6]:
                print(f"  {r}")
    norm_write(rows, f"history-{f.stem.split('_')[-1]}.csv")

# 2. Perf (subdomain yearly daily)
print("\n\n[2] PERF SUBDOMAINS YEARLY DAILY")
print("-" * 80)
perf_files = sorted(DOWNLOADS.glob("servicesartisans.fr-perf-subdomains_year5_*.csv"))
# Check if identical
if len(perf_files) > 1:
    sizes = [f.stat().st_size for f in perf_files]
    print(f"File sizes: {sizes}")
    if len(set(sizes)) == 1:
        print("All files same size -> checking if identical...")
        contents = [f.read_bytes()[:1000] for f in perf_files]
        if len(set(contents)) == 1:
            print("FILES APPEAR IDENTICAL (4x same export) — processing first only")
            perf_files = perf_files[:1]

for f in perf_files:
    rows = read_utf16_tsv(f)
    print(f"\nFile: {f.name}")
    print(f"Rows: {len(rows)}")
    if rows:
        print(f"Headers: {rows[0]}")
        if len(rows) > 1:
            print(f"First data row: {rows[1]}")
        if len(rows) > 10:
            print(f"Sample last 10 rows (most recent):")
            for r in rows[-10:]:
                print(f"  {r}")

# 3. perf (no subdomain suffix)
print("\n\n[3] PERF (main)")
print("-" * 80)
for f in sorted(DOWNLOADS.glob("servicesartisans.fr_perf_*.csv")):
    rows = read_utf16_tsv(f)
    print(f"\nFile: {f.name}")
    print(f"Rows: {len(rows)}")
    if rows:
        print(f"Headers: {rows[0]}")
        if len(rows) > 1:
            print(f"First data row: {rows[1]}")
        if len(rows) > 10:
            print(f"Sample last 10 rows (most recent):")
            for r in rows[-10:]:
                print(f"  {r}")
    norm_write(rows, f"perf-{f.stem.split('_')[-1]}.csv")

print("\n" + "=" * 80)
print("DONE")
print("=" * 80)
