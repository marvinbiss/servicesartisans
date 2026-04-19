"""
Analyse Ahrefs Site Explorer:
- top pages (qui rank pour Ahrefs vs ce que GSC voit)
- organic keywords (lost / new / position changes)
- competitors (qui sont vraiment nos concurrents)
"""
import csv
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

NORM = Path(__file__).parent / "normalized"

def num(x):
    try: return int(x or 0)
    except: return 0
def fnum(x):
    try: return float((x or "0").replace(",", "."))
    except: return 0.0

def url_pattern(url):
    try: path = urlparse(url).path
    except: return url
    parts = path.strip("/").split("/")
    if not parts or parts == [""]: return "/"
    out = []
    for i, p in enumerate(parts):
        if i == 0: out.append(p)
        else: out.append("{slug}" if re.fullmatch(r"[a-z0-9\-]+", p) and len(p) > 1 else p)
    return "/" + "/".join(out)

# ── 1. TOP PAGES ──
print("="*90)
print("AHREFS TOP PAGES — vue trafic externe (organic)")
print("="*90)
pages = []
with (NORM / "ahrefs-top-pages.csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        pages.append({
            "url": r.get("URL") or list(r.values())[0],
            "status": r.get("Status", ""),
            "ur": num(r.get("UR", 0)),
            "prev_traf": num(r.get("Previous traffic")),
            "curr_traf": num(r.get("Current traffic")),
            "change": num(r.get("Traffic change")),
            "prev_kw": num(r.get("Previous # of keywords")),
            "curr_kw": num(r.get("Current # of keywords")),
            "kw_change": num(r.get("Keywords change")),
            "top_kw": r.get("Current top keyword") or r.get("Previous top keyword", ""),
            "top_kw_vol": num(r.get("Current top keyword: Volume") or r.get("Previous top keyword: Volume")),
            "top_kw_pos": fnum(r.get("Current top keyword: Position") or r.get("Previous top keyword: Position")),
            "page_type": r.get("Page type", ""),
        })

print(f"\nTotal pages Ahrefs voit: {len(pages)}")
status_count = Counter(p["status"] for p in pages)
print(f"Status: {dict(status_count)}")
total_curr = sum(p["curr_traf"] for p in pages)
total_prev = sum(p["prev_traf"] for p in pages)
print(f"Trafic Ahrefs estim: prev={total_prev}, curr={total_curr}, delta={total_curr-total_prev:+d}")

print(f"\n{'='*90}\nPages PERDUES (status = Lost) — ce qu'on a perdu\n{'='*90}")
lost = sorted([p for p in pages if p["status"] == "Lost"], key=lambda x: -x["prev_traf"])
print(f"Total pages lost: {len(lost)}, perte trafic Ahrefs: {sum(p['prev_traf'] for p in lost):+d}")
print(f"\n{'PrevTraf':>8} {'TopKW':<35} {'Vol':>6} {'Pos':>5}  URL")
for p in lost[:25]:
    print(f"  {p['prev_traf']:>6} {p['top_kw'][:33]:<33} {p['top_kw_vol']:>5} {p['top_kw_pos']:>5.1f}  {p['url']}")

print(f"\n{'='*90}\nPages NOUVELLES (status = New) — gains récents\n{'='*90}")
new = sorted([p for p in pages if p["status"] == "New"], key=lambda x: -x["curr_traf"])
print(f"Total pages new: {len(new)}, gain trafic Ahrefs: {sum(p['curr_traf'] for p in new):+d}")
for p in new[:15]:
    print(f"  curr={p['curr_traf']:>4}  {p['top_kw'][:35]:<35}  {p['url']}")

print(f"\n{'='*90}\nPages STABLES par CURRENT TRAFFIC\n{'='*90}")
stable = sorted([p for p in pages if p["status"] not in ("Lost", "New") and p["curr_traf"] > 0], key=lambda x: -x["curr_traf"])
for p in stable[:15]:
    print(f"  curr={p['curr_traf']:>4} (delta={p['change']:+4d}) UR={p['ur']:>2}  {p['top_kw'][:30]:<30}  {p['url']}")

# Pattern aggregation
print(f"\n{'='*90}\nPATTERNS d'URL — qui ramène le trafic Ahrefs\n{'='*90}")
patterns = defaultdict(lambda: {"pages": 0, "traf": 0, "kw": 0})
for p in pages:
    pat = url_pattern(p["url"])
    patterns[pat]["pages"] += 1
    patterns[pat]["traf"] += p["curr_traf"] or p["prev_traf"]
    patterns[pat]["kw"] += p["curr_kw"] or p["prev_kw"]
for pat, d in sorted(patterns.items(), key=lambda x: -x[1]["traf"])[:20]:
    print(f"  pages={d['pages']:>3}  traf={d['traf']:>4}  kw={d['kw']:>3}  {pat}")

# ── 2. ORGANIC KEYWORDS ──
print(f"\n{'='*90}\nAHREFS ORGANIC KEYWORDS — détail des positions\n{'='*90}")
kws = []
with (NORM / "ahrefs-organic-keywords.csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        kws.append({
            "kw": r.get("Keyword") or list(r.values())[0],
            "vol": num(r.get("Volume")),
            "kd": num(r.get("KD")),
            "cpc": fnum(r.get("CPC")),
            "prev_traf": num(r.get("Previous organic traffic")),
            "curr_traf": num(r.get("Current organic traffic")),
            "change": num(r.get("Organic traffic change")),
            "prev_pos": fnum(r.get("Previous position")),
            "curr_pos": fnum(r.get("Current position")),
            "pos_change": r.get("Position change"),
            "prev_kind": r.get("Previous position kind", ""),
            "curr_kind": r.get("Current position kind", ""),
            "url": r.get("Current URL") or r.get("Previous URL", ""),
            "branded": r.get("Branded") == "true",
            "local": r.get("Local") == "true",
            "informational": r.get("Informational") == "true",
            "commercial": r.get("Commercial") == "true",
            "transactional": r.get("Transactional") == "true",
            "navigational": r.get("Navigational") == "true",
        })

print(f"Total keywords Ahrefs voit: {len(kws)}")
status = Counter(k["pos_change"] or "stable" for k in kws)
print(f"Position changes: {dict(status)}")
total_vol = sum(k["vol"] for k in kws)
print(f"Volume total: {total_vol:,}")

# Intent breakdown
print(f"\nIntents (nombre de keywords) :")
print(f"  Branded         : {sum(1 for k in kws if k['branded'])}")
print(f"  Local           : {sum(1 for k in kws if k['local'])}")
print(f"  Informational   : {sum(1 for k in kws if k['informational'])}")
print(f"  Commercial      : {sum(1 for k in kws if k['commercial'])}")
print(f"  Transactional   : {sum(1 for k in kws if k['transactional'])}")
print(f"  Navigational    : {sum(1 for k in kws if k['navigational'])}")

# Top keywords PERDUS
print(f"\n{'='*90}\nKEYWORDS PERDUS — étaient en top 100, plus là\n{'='*90}")
lost_kw = sorted([k for k in kws if k["pos_change"] == "Lost"], key=lambda x: -x["vol"])
print(f"Total: {len(lost_kw)} keywords perdus, volume cumulé: {sum(k['vol'] for k in lost_kw):,}")
for k in lost_kw[:25]:
    print(f"  vol={k['vol']:>5} KD={k['kd']:>2} prev_pos={k['prev_pos']:>5.1f}  '{k['kw'][:50]}'  -> {k['url']}")

# Top keywords actuels
print(f"\n{'='*90}\nKEYWORDS ACTUELS top 30 par VOLUME\n{'='*90}")
for k in sorted([k for k in kws if k["curr_pos"] > 0], key=lambda x: -x["vol"])[:30]:
    print(f"  vol={k['vol']:>5} KD={k['kd']:>2} pos={k['curr_pos']:>5.1f} traf={k['curr_traf']:>3}  '{k['kw'][:50]}'")

# ── 3. COMPETITORS ──
print(f"\n{'='*90}\nVRAIS CONCURRENTS Ahrefs (top 20 par share)\n{'='*90}")
comps = []
with (NORM / "ahrefs-competitors.csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        comps.append({
            "domain": r.get("Domain") or list(r.values())[0],
            "comp_kw": num(r.get("Competitor's keywords")),
            "common": num(r.get("Common keywords")),
            "share": fnum((r.get("Share", "") or "0").replace("%", "")),
            "target_kw": num(r.get("Target's keywords")),
            "dr": num(r.get("DR")),
            "curr_traf": num(r.get("Current  traffic") or r.get("Current traffic")),
            "prev_traf": num(r.get("Previous traffic")),
            "curr_pages": num(r.get("Current # of pages")),
        })
print(f"{'Domain':<35} {'DR':>4} {'CommonKW':>9} {'Share':>6} {'CurrTraf':>9} {'Pages':>6}")
for c in sorted(comps, key=lambda x: -x["share"]):
    print(f"  {c['domain'][:33]:<33} {c['dr']:>4} {c['common']:>9} {c['share']:>5.1f}% {c['curr_traf']:>9} {c['curr_pages']:>6}")
