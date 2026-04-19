"""Synthese KW depuis fichiers normalises."""
import csv
import sys
from pathlib import Path
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

NORM = Path(r"C:\Users\USER\Downloads\servicesartisans\docs\ahrefs-audit-2026-04\normalized")


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


def read(name):
    with (NORM / name).open(encoding="utf-8") as f:
        return list(csv.reader(f))


# ========== 1) KEYWORDS ==========
print("=" * 90)
print("1) KEYWORDS — 262 KW actuels")
print("=" * 90)
rows = read("kw-kw1.csv")
hdr = [h.replace("\ufeff", "").strip('"') for h in rows[0]]
print(f"Colonnes: {hdr[:12]}")

kws = []
for r in rows[1:]:
    if len(r) < 8:
        continue
    kws.append({
        "keyword": r[0],
        "volume": num(r[1]),
        "prev_traffic": num(r[2]),
        "curr_traffic": num(r[3]),
        "change": num(r[4]),
        "prev_pos": fnum(r[6]) if len(r) > 6 and r[6] else 0,
        "curr_pos": fnum(r[7]) if len(r) > 7 and r[7] else 0,
    })
print(f"Parses: {len(kws)}")

# Top 30 par volume
print("\n=== Top 30 KW par VOLUME ===")
print(f"{'Volume':>7} {'PrevPos':>7} {'CurrPos':>7} {'PrevT':>6} {'CurrT':>6} {'Chg':>5}  KW")
for k in sorted(kws, key=lambda x: -x["volume"])[:30]:
    print(f"{k['volume']:>7} {k['prev_pos']:>7.1f} {k['curr_pos']:>7.1f} {k['prev_traffic']:>6} {k['curr_traffic']:>6} {k['change']:>5}  {k['keyword'][:58]}")

# LOST (curr=0, prev>0, vol>=50)
lost = [k for k in kws if k["curr_pos"] == 0 and k["prev_pos"] > 0 and k["volume"] >= 50]
total_lost_vol = sum(k["volume"] for k in lost)
total_lost_traf = sum(k["prev_traffic"] for k in lost)
print(f"\n=== KW PERDUS vol>=50: {len(lost)} | vol total={total_lost_vol:,} | trafic perdu={total_lost_traf:,} ===")
for k in sorted(lost, key=lambda x: -x["volume"])[:15]:
    print(f"  {k['volume']:>6}  {k['prev_pos']:>5.1f}>out  {k['prev_traffic']:>4} lost  {k['keyword']}")

# NEW (curr>0, prev=0)
new = [k for k in kws if k["curr_pos"] > 0 and k["prev_pos"] == 0 and k["curr_traffic"] > 0]
print(f"\n=== NEW KW avec trafic ({len(new)}) — top 20 par curr_traffic ===")
for k in sorted(new, key=lambda x: -x["curr_traffic"])[:20]:
    print(f"  {k['volume']:>6}  pos {k['curr_pos']:>4.1f}  +{k['curr_traffic']:>4}  {k['keyword']}")

# Pos buckets
pb = Counter()
for k in kws:
    p = k["curr_pos"]
    if p == 0: pb["lost"] += 1
    elif p <= 3: pb["1-3"] += 1
    elif p <= 10: pb["4-10"] += 1
    elif p <= 20: pb["11-20"] += 1
    elif p <= 50: pb["21-50"] += 1
    else: pb["51+"] += 1
print(f"\n=== Distribution positions actuelle ===")
for b in ["1-3", "4-10", "11-20", "21-50", "51+", "lost"]:
    print(f"  {b:<8}: {pb[b]}")

# ========== 2) INTENT ==========
print("\n" + "=" * 90)
print("2) INTENT — 266 KW")
print("=" * 90)
rows_i = read("organic-positions.csv")
hdr_i = [h.replace("\ufeff", "").strip('"') for h in rows_i[0]]
print(f"Colonnes ({len(hdr_i)}): {hdr_i}")

intents = {"Branded": 0, "Local": 0, "Navigational": 0, "Informational": 0, "Commercial": 0, "Transactional": 0}
for r in rows_i[1:]:
    if len(r) < 8: continue
    if r[4] == "true": intents["Branded"] += 1
    if r[5] == "true": intents["Local"] += 1
    if r[6] == "true": intents["Navigational"] += 1
    if r[7] == "true": intents["Informational"] += 1
    if len(r) > 8 and r[8] == "true": intents["Commercial"] += 1
    if len(r) > 9 and r[9] == "true": intents["Transactional"] += 1

total_kw = len(rows_i[1:])
print(f"\nIntent breakdown sur {total_kw} KW :")
for i, c in intents.items():
    print(f"  {i:<15}: {c:>4} ({100*c/total_kw:.0f}%)")

# ========== 3) TOP PAGES ==========
print("\n" + "=" * 90)
print("3) TOP PAGES")
print("=" * 90)
rows_tp = read("top-pages-v2.csv")
tps = []
for r in rows_tp[1:]:
    if len(r) < 6: continue
    tps.append({
        "url": r[0],
        "status": r[1],
        "ur": num(r[2]),
        "prev_traffic": num(r[3]),
        "curr_traffic": num(r[4]),
        "change": num(r[5]),
    })
status_cnt = Counter(t["status"] for t in tps)
print(f"Status breakdown ({len(tps)} pages):")
for s, c in status_cnt.most_common():
    print(f"  {s:<15}: {c}")

# Top 20 current
print(f"\n=== Top 20 par TRAFIC ACTUEL ===")
for t in sorted(tps, key=lambda x: -x["curr_traffic"])[:20]:
    print(f"  T={t['curr_traffic']:>4} (was {t['prev_traffic']:>4}) [{t['status']:<10}] {t['url'][:85]}")

# Pages perdues (Lost)
lost_pages = [t for t in tps if t["status"] == "Lost"]
total_lost_traffic = sum(t["prev_traffic"] for t in lost_pages)
print(f"\n=== PAGES LOST ({len(lost_pages)}) — trafic perdu total: {total_lost_traffic} ===")
for t in sorted(lost_pages, key=lambda x: -x["prev_traffic"])[:15]:
    print(f"  -{t['prev_traffic']:>4}  {t['url'][:95]}")

# Pages new (avec trafic)
new_pages = [t for t in tps if t["status"] == "New" and t["curr_traffic"] > 0]
print(f"\n=== PAGES NEW ({len(new_pages)}) ===")
for t in sorted(new_pages, key=lambda x: -x["curr_traffic"])[:15]:
    print(f"  +{t['curr_traffic']:>4}  {t['url'][:95]}")

# ========== 4) COMPETITORS ==========
print("\n" + "=" * 90)
print("4) CONCURRENTS — 21 domaines identifies par Ahrefs")
print("=" * 90)
rows_c = read("competitors-v2.csv")
print(f"{'Domain':<28} {'theirKW':>7} {'Common':>6} {'Share':>6} {'DR':>3} {'PrevT':>6} {'CurrT':>6} {'Chg%':>6} {'PagesChg':>8}")
for r in rows_c[1:]:
    if len(r) < 15: continue
    prevT = num(r[6]); currT = num(r[7]); chg = num(r[8])
    chg_pct = (100*chg/prevT) if prevT else 0
    print(f"  {r[0][:27]:<27} {r[1]:>7} {r[2]:>6} {r[3]:>6} {r[5]:>3} {prevT:>6} {currT:>6} {chg_pct:>5.0f}% {r[14]:>8}")

# ========== 5) MATRICE KW COMMUNS ==========
print("\n" + "=" * 90)
print("5) MATRICE KW COMMUNS")
print("=" * 90)
rows_m = read("common-keywords-v2.csv")
for r in rows_m:
    print("  " + " ".join(r))
