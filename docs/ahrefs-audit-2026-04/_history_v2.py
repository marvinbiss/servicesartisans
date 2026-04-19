"""Deep analysis — trajectoire du site sur 5 ans."""
import csv
from pathlib import Path

DOWNLOADS = Path(r"C:\Users\USER\Downloads")


def read_utf16_tsv(path: Path):
    raw = path.read_bytes()
    if raw[:2] == b"\xff\xfe":
        text = raw.decode("utf-16-le")
    else:
        text = raw.decode("utf-8")
    rows = list(csv.reader(text.splitlines(), delimiter="\t", quotechar='"'))
    return rows


def num(x):
    try:
        return float((x or "0").replace(",", "."))
    except Exception:
        return 0.0


# Daily subdomain perf — 5 years
print("=" * 90)
print("TRAJECTOIRE 5 ANS — Organic pages + Organic traffic (daily)")
print("=" * 90)
f = next(DOWNLOADS.glob("servicesartisans.fr-perf-subdomains_year5_dai_*.csv"))
rows = read_utf16_tsv(f)
# rows[0] = header
data = rows[1:]
print(f"Total days: {len(data)}")
print(f"Period: {data[0]} -> {data[-1]}")

# Find when site stopped being 0
activated = None
peak_pages = 0
peak_date = None
for r in data:
    if len(r) < 3:
        continue
    try:
        pages = int(r[1])
        traffic = int(r[2])
    except Exception:
        continue
    if pages > 0 and not activated:
        activated = r[0]
        print(f"\n>>> Premier jour avec pages indexees (Ahrefs voit): {activated} pages={pages}")
    if pages > peak_pages:
        peak_pages = pages
        peak_date = r[0]

print(f"\nPEAK ALL-TIME: {peak_date} -> {peak_pages} pages ranking")

# Monthly summary
from collections import defaultdict
monthly = defaultdict(lambda: {"pages": [], "traffic": []})
for r in data:
    if len(r) < 3:
        continue
    try:
        month = r[0][:7]
        pages = int(r[1])
        traffic = int(r[2])
        monthly[month]["pages"].append(pages)
        monthly[month]["traffic"].append(traffic)
    except Exception:
        continue

print(f"\n--- Evolution MENSUELLE (moyenne) ---")
print(f"{'Month':<8} {'PagesAvg':>9} {'PagesMax':>9} {'TrafAvg':>8} {'TrafMax':>8}")
sorted_months = sorted(monthly.keys())
# Only show non-zero months + a few before
first_nonzero = None
for m in sorted_months:
    avg_p = sum(monthly[m]["pages"]) / len(monthly[m]["pages"]) if monthly[m]["pages"] else 0
    if avg_p > 0 and not first_nonzero:
        first_nonzero = m
# Show 3 months before first_nonzero + all after
idx = sorted_months.index(first_nonzero) if first_nonzero else 0
for m in sorted_months[max(0, idx - 3):]:
    pages_list = monthly[m]["pages"]
    traf_list = monthly[m]["traffic"]
    avg_p = sum(pages_list) / len(pages_list) if pages_list else 0
    max_p = max(pages_list) if pages_list else 0
    avg_t = sum(traf_list) / len(traf_list) if traf_list else 0
    max_t = max(traf_list) if traf_list else 0
    print(f"{m:<8} {avg_p:>9.0f} {max_p:>9} {avg_t:>8.0f} {max_t:>8}")

# Monthly perf (rich data)
print("\n" + "=" * 90)
print("PERF MENSUEL — metrics riches (referring domains, positions, intent)")
print("=" * 90)
f2 = next(DOWNLOADS.glob("servicesartisans.fr_perf_*.csv"))
rows2 = read_utf16_tsv(f2)
hdr = rows2[0][0].split(", ")
print(f"Headers ({len(hdr)}): {hdr}")
print()
# data rows - first row is Volume marker
print(f"{'Month':<8} {'RD':>4} {'Traf':>5} {'Pos1-3':>7} {'4-10':>5} {'11-20':>6} {'21-50':>6} {'51+':>5} {'TotKW':>6}")
for r in rows2[2:]:
    if not r or not r[0]:
        continue
    parts = r[0].split(", ")
    if len(parts) < 9:
        continue
    month = parts[0]
    rd = parts[1]
    traf = parts[2]
    p13, p410, p1120, p2150, p51 = parts[4], parts[5], parts[6], parts[7], parts[8]
    try:
        total_kw = int(p13) + int(p410) + int(p1120) + int(p2150) + int(p51)
    except Exception:
        total_kw = "?"
    print(f"{month:<8} {rd:>4} {traf:>5} {p13:>7} {p410:>5} {p1120:>6} {p2150:>6} {p51:>5} {str(total_kw):>6}")

# Monthly keywords history (positions buckets)
print("\n" + "=" * 90)
print("ORGANIC KEYWORDS MONTHLY (par bucket de position)")
print("=" * 90)
for f3 in sorted(DOWNLOADS.glob("servicesartisans.fr-organic-keywords-history_*")):
    rows3 = read_utf16_tsv(f3)
    if not rows3:
        continue
    header = rows3[0][0]
    print(f"\n{f3.name}")
    print(f"Headers: {header}")
    for r in rows3[1:]:
        if r and r[0]:
            print(f"  {r[0]}")
