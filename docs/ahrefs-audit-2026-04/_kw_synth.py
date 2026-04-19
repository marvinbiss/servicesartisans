"""Synthese keywords avec handling UTF safe."""
import csv
import sys
from pathlib import Path
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

DOWNLOADS = Path(r"C:\Users\USER\Downloads")
NORM = Path(r"C:\Users\USER\Downloads\servicesartisans\docs\ahrefs-audit-2026-04\normalized")


def read_utf16_tsv(path: Path):
    raw = path.read_bytes()
    if raw[:2] == b"\xff\xfe":
        text = raw.decode("utf-16-le")
    else:
        text = raw.decode("utf-8", errors="replace")
    return list(csv.reader(text.splitlines(), delimiter="\t", quotechar='"'))


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


# ========== ORGANIC KEYWORDS (le plus complet: kw1 = 262 rows) ==========
print("=" * 90)
print("1) KEYWORDS — 262 KW actuels")
print("=" * 90)
f = DOWNLOADS / "servicesartisans.fr-organic-keywords-subdom_2026-04-18_18-21-51.csv"
rows = read_utf16_tsv(f)
hdr = [h.replace("\ufeff", "").strip('"') for h in rows[0]]
print(f"Colonnes: {hdr[:10]}")

# Parse rows
kws = []
for r in rows[1:]:
    if len(r) < 8:
        continue
    kw = {
        "keyword": r[0],
        "volume": num(r[1]),
        "prev_traffic": num(r[2]),
        "curr_traffic": num(r[3]),
        "change": num(r[4]),
        "prev_pos": fnum(r[6]) if r[6] else 0,
        "curr_pos": fnum(r[7]) if r[7] else 0,
    }
    kws.append(kw)

print(f"Total KW parses: {len(kws)}")

# Top 30 par volume
print("\n=== Top 30 KW par VOLUME ===")
print(f"{'Volume':>7} {'PrevPos':>7} {'CurrPos':>7} {'PrevTraf':>8} {'CurrTraf':>8} {'Change':>7}  KW")
for k in sorted(kws, key=lambda x: -x["volume"])[:30]:
    print(f"{k['volume']:>7} {k['prev_pos']:>7.1f} {k['curr_pos']:>7.1f} {k['prev_traffic']:>8} {k['curr_traffic']:>8} {k['change']:>7}  {k['keyword'][:60]}")

# Top 20 KW PERDUS (curr_pos = 0 mais prev_pos > 0)
lost = [k for k in kws if k["curr_pos"] == 0 and k["prev_pos"] > 0 and k["volume"] >= 50]
lost_sorted = sorted(lost, key=lambda x: -x["volume"])
print(f"\n=== KW PERDUS (actuellement hors top 100, avant pos {'<100'}): {len(lost)} ===")
print(f"Top 20 par volume:")
print(f"{'Volume':>7} {'PrevPos':>7} {'PrevTraf':>8}  KW")
for k in lost_sorted[:20]:
    print(f"{k['volume']:>7} {k['prev_pos']:>7.1f} {k['prev_traffic']:>8}  {k['keyword'][:60]}")
total_lost_vol = sum(k["volume"] for k in lost)
total_lost_traffic = sum(k["prev_traffic"] for k in lost)
print(f"\nTOTAL: {total_lost_vol:,} volume perdu, {total_lost_traffic:,} trafic perdu")

# Top 20 GAINS (curr_pos > 0 et prev_pos = 0 OR prev_pos > curr_pos)
new = [k for k in kws if k["curr_pos"] > 0 and k["prev_pos"] == 0 and k["volume"] >= 50]
new_sorted = sorted(new, key=lambda x: -x["curr_traffic"])
print(f"\n=== NEW KW (ranking pour la premiere fois): {len(new)} ===")
print(f"Top 20 par trafic actuel:")
print(f"{'Volume':>7} {'CurrPos':>7} {'CurrTraf':>8}  KW")
for k in new_sorted[:20]:
    print(f"{k['volume']:>7} {k['curr_pos']:>7.1f} {k['curr_traffic']:>8}  {k['keyword'][:60]}")

# Position distribution
pos_buckets = Counter()
for k in kws:
    p = k["curr_pos"]
    if p == 0:
        pos_buckets["lost/out"] += 1
    elif p <= 3:
        pos_buckets["1-3"] += 1
    elif p <= 10:
        pos_buckets["4-10"] += 1
    elif p <= 20:
        pos_buckets["11-20"] += 1
    elif p <= 50:
        pos_buckets["21-50"] += 1
    else:
        pos_buckets["51+"] += 1
print(f"\n=== Distribution des positions ===")
for bucket in ["1-3", "4-10", "11-20", "21-50", "51+", "lost/out"]:
    print(f"  {bucket:<10}: {pos_buckets[bucket]}")

# Intent analysis (from positions file)
print("\n" + "=" * 90)
print("2) INTENT — sur 266 KW")
print("=" * 90)
f_pos = DOWNLOADS / "servicesartisans.fr-organic-positions-subdo_2026-04-18_18-25-17.csv"
rows_pos = read_utf16_tsv(f_pos)
hdr_pos = [h.replace("\ufeff", "").strip('"') for h in rows_pos[0]]
print(f"Colonnes: {hdr_pos}")

intents = {"Branded": 0, "Local": 0, "Navigational": 0, "Informational": 0, "Commercial": 0, "Transactional": 0}
for r in rows_pos[1:]:
    if len(r) < 8:
        continue
    # Columns: Keyword, Country, Language, Entities, Branded, Local, Navigational, Informational, [Commercial, Transactional, ...]
    if r[4] == "true": intents["Branded"] += 1
    if r[5] == "true": intents["Local"] += 1
    if r[6] == "true": intents["Navigational"] += 1
    if r[7] == "true": intents["Informational"] += 1
    if len(r) > 8 and r[8] == "true": intents["Commercial"] += 1
    if len(r) > 9 and r[9] == "true": intents["Transactional"] += 1

print("Intent breakdown (un KW peut avoir plusieurs intents) :")
for i, c in intents.items():
    pct = 100 * c / len(rows_pos[1:]) if len(rows_pos) > 1 else 0
    print(f"  {i:<15}: {c:>4} ({pct:.1f}%)")

# ========== TOP PAGES ==========
print("\n" + "=" * 90)
print("3) TOP PAGES — qui ranke?")
print("=" * 90)
f_tp = DOWNLOADS / "servicesartisans.fr-top-pages-subdomains-al_2026-04-18_18-26-45.csv"
rows_tp = read_utf16_tsv(f_tp)
hdr_tp = [h.replace("\ufeff", "").strip('"') for h in rows_tp[0]]
print(f"Colonnes: {hdr_tp[:8]}")

tps = []
for r in rows_tp[1:]:
    if len(r) < 8:
        continue
    tp = {
        "url": r[0],
        "status": r[1],
        "ur": num(r[2]),
        "prev_traffic": num(r[3]),
        "curr_traffic": num(r[4]),
        "change": num(r[5]),
    }
    tps.append(tp)

# Status breakdown
status_cnt = Counter(t["status"] for t in tps)
print(f"\nStatus breakdown ({len(tps)} pages):")
for s, c in status_cnt.most_common():
    print(f"  {s:<20}: {c}")

# Top 20 par traffic actuel
print(f"\n=== Top 20 pages par TRAFIC ACTUEL ===")
print(f"{'CurrT':>6} {'PrevT':>6} {'Chg':>6}  Status       URL")
for t in sorted(tps, key=lambda x: -x["curr_traffic"])[:20]:
    print(f"{t['curr_traffic']:>6} {t['prev_traffic']:>6} {t['change']:>6}  {t['status']:<12} {t['url'][:80]}")

# Lost pages
lost_pages = [t for t in tps if t["status"] == "Lost"]
print(f"\n=== PAGES PERDUES ({len(lost_pages)}) ===")
total_lost_traffic = sum(t["prev_traffic"] for t in lost_pages)
print(f"Trafic total perdu: {total_lost_traffic}")
print(f"Top 20 par trafic perdu:")
for t in sorted(lost_pages, key=lambda x: -x["prev_traffic"])[:20]:
    print(f"  {t['prev_traffic']:>4} <-- {t['url'][:90]}")

# ========== COMPETITORS ==========
print("\n" + "=" * 90)
print("4) CONCURRENTS — 21 identifies par Ahrefs")
print("=" * 90)
f_c = DOWNLOADS / "servicesartisans.fr_orgcompetitors_subdomain_2026-04-18_18-27-25.csv"
rows_c = read_utf16_tsv(f_c)
hdr_c = [h.replace("\ufeff", "").strip('"') for h in rows_c[0]]
print(f"Colonnes: {hdr_c}")

print(f"\n{'Domain':<28} {'Comp.KW':>7} {'Comm':>5} {'Share':>6} {'Ours':>5} {'DR':>3} {'PrevT':>6} {'CurrT':>6} {'Chg':>7} {'Pages':>6}")
comps = []
for r in rows_c[1:]:
    if len(r) < 15:
        continue
    c = {
        "domain": r[0],
        "their_kw": num(r[1]),
        "common_kw": num(r[2]),
        "share": r[3],
        "our_kw": num(r[4]),
        "dr": num(r[5]),
        "prev_traffic": num(r[6]),
        "curr_traffic": num(r[7]),
        "change": num(r[8]),
        "prev_pages": num(r[12]),
        "curr_pages": num(r[13]),
        "pages_change": num(r[14]),
    }
    comps.append(c)
    print(f"  {c['domain'][:27]:<27} {c['their_kw']:>7} {c['common_kw']:>5} {c['share']:>6} {c['our_kw']:>5} {c['dr']:>3} {c['prev_traffic']:>6} {c['curr_traffic']:>6} {c['change']:>7} {c['pages_change']:>6}")

# ========== COMMON KW MATRIX ==========
print("\n" + "=" * 90)
print("5) MATRICE KW COMMUNS avec concurrents")
print("=" * 90)
f_m = DOWNLOADS / "servicesartisans.fr_common-keywords_subdomain_2026-04-18_18-31-30.csv"
rows_m = read_utf16_tsv(f_m)
for r in rows_m:
    print("  " + " ".join(r))

# ========== CONTENT GAP ==========
print("\n" + "=" * 90)
print("6) CONTENT GAP — 51 MB file")
print("=" * 90)
f_g = DOWNLOADS / "servicesartisans.fr-content-gap-subdomains-f_2026-04-18_18-32-01.csv"
raw = f_g.read_bytes()
if raw[:2] == b"\xff\xfe":
    text = raw.decode("utf-16-le", errors="replace")
else:
    text = raw.decode("utf-8", errors="replace")
rows_g = list(csv.reader(text.splitlines(), delimiter="\t", quotechar='"'))
print(f"Total rows: {len(rows_g):,}")
hdr_g = [h.replace("\ufeff", "").strip('"') for h in rows_g[0]] if rows_g else []
print(f"Colonnes ({len(hdr_g)}): {hdr_g[:10]}")
if len(rows_g) > 1:
    print(f"Sample row 1: {rows_g[1][:10]}")

# Save
with (NORM / "content-gap-v2.csv").open("w", encoding="utf-8", newline="") as f:
    w = csv.writer(f, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in rows_g:
        w.writerow(row)
print(f"Saved to {NORM}/content-gap-v2.csv")

# Parse content gap: find KW where we DONT rank but concurrents do
# Typical columns: Keyword, Volume, KD, Competitor URL 1-N, Position 1-N
gap_kws = []
for r in rows_g[1:]:
    if len(r) < 3:
        continue
    try:
        kw = r[0]
        vol = num(r[1]) if len(r) > 1 else 0
        kd = num(r[2]) if len(r) > 2 else 0
        gap_kws.append({"kw": kw, "vol": vol, "kd": kd})
    except Exception:
        continue

# Filter: actionable (vol >= 100, KD <= 30)
actionable = [g for g in gap_kws if g["vol"] >= 100 and g["kd"] <= 30]
print(f"\nContent gap total: {len(gap_kws):,} KW")
print(f"Actionnable (vol>=100, KD<=30): {len(actionable):,}")

# Top 50 actionnable par volume
print(f"\n=== TOP 50 opportunites actionnables (vol>=100, KD<=30) par VOLUME ===")
print(f"{'Vol':>6} {'KD':>3}  Keyword")
for g in sorted(actionable, key=lambda x: -x["vol"])[:50]:
    print(f"{g['vol']:>6} {g['kd']:>3}  {g['kw'][:70]}")

total_actionable_vol = sum(g["vol"] for g in actionable)
print(f"\nTotal volume actionnable: {total_actionable_vol:,} vol/mois")
