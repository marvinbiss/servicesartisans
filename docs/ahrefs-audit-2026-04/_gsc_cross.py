"""
Croise GSC Pages.csv avec les issues Ahrefs:
- Pages indexées qui rankent (clics > 0)
- Pages avec impressions mais 0 clic (potentiel sous-exploité)
- Quels patterns ramènent du trafic ?
- Quelles pages "à fort impressions" sont aussi cassées (issues Ahrefs) ?
"""
import csv
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

NORM = Path(__file__).parent / "normalized"

def url_pattern(url: str) -> str:
    try:
        path = urlparse(url).path
    except Exception:
        return url
    parts = path.strip("/").split("/")
    if not parts or parts == [""]:
        return "/"
    pattern_parts = []
    for i, p in enumerate(parts):
        if i == 0:
            pattern_parts.append(p)
        else:
            if re.fullmatch(r"[a-z0-9\-]+", p) and len(p) > 1:
                pattern_parts.append("{slug}")
            else:
                pattern_parts.append(p)
    return "/" + "/".join(pattern_parts)

def pct(x): return float(x.replace(",", ".").replace("%", "")) if x else 0.0
def num(x): return int(x or 0)
def fnum(x): return float((x or "0").replace(",", "."))

# ── Charger GSC Pages ──
pages = []
with (NORM / "Pages.csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        url = r.get("Pages les plus populaires", "")
        if not url:
            continue
        pages.append({
            "url": url,
            "clicks": num(r.get("Clics")),
            "impr": num(r.get("Impressions")),
            "ctr": pct(r.get("CTR", "0%")),
            "pos": fnum(r.get("Position")),
            "pattern": url_pattern(url),
        })

print(f"GSC Pages: {len(pages)} URLs indexées (avec clics ou impressions)")
total_clicks = sum(p["clicks"] for p in pages)
total_impr = sum(p["impr"] for p in pages)
print(f"  Total clics: {total_clicks}    Total impressions: {total_impr}")
print(f"  CTR moyen: {100*total_clicks/total_impr if total_impr else 0:.2f}%")

# ── Patterns par trafic ──
by_pattern = defaultdict(lambda: {"urls": 0, "clicks": 0, "impr": 0})
for p in pages:
    by_pattern[p["pattern"]]["urls"] += 1
    by_pattern[p["pattern"]]["clicks"] += p["clicks"]
    by_pattern[p["pattern"]]["impr"] += p["impr"]

print(f"\n{'='*80}\nPatterns par CLICS (top 20)\n{'='*80}")
print(f"{'Pattern':<55} {'URLs':>6} {'Clics':>8} {'Impr':>8} {'CTR':>6}")
for pat, d in sorted(by_pattern.items(), key=lambda x: -x[1]["clicks"])[:20]:
    ctr = 100 * d["clicks"] / d["impr"] if d["impr"] else 0
    print(f"  {pat[:53]:<53} {d['urls']:>6} {d['clicks']:>8} {d['impr']:>8} {ctr:>5.1f}%")

print(f"\n{'='*80}\nPatterns par IMPRESSIONS sans clics (potentiel) (top 20)\n{'='*80}")
print(f"{'Pattern':<55} {'URLs':>6} {'Clics':>8} {'Impr':>8} {'CTR':>6}")
for pat, d in sorted(by_pattern.items(), key=lambda x: -x[1]["impr"])[:20]:
    if d["clicks"] / max(d["impr"], 1) < 0.02:  # CTR < 2%
        ctr = 100 * d["clicks"] / d["impr"] if d["impr"] else 0
        print(f"  {pat[:53]:<53} {d['urls']:>6} {d['clicks']:>8} {d['impr']:>8} {ctr:>5.1f}%")

# ── Pages avec clics réels ──
print(f"\n{'='*80}\nTop 30 pages avec CLICS réels\n{'='*80}")
print(f"{'Clics':>5} {'Impr':>6} {'CTR':>6} {'Pos':>5}  URL")
for p in sorted(pages, key=lambda x: -x["clicks"])[:30]:
    print(f"  {p['clicks']:>5} {p['impr']:>5} {p['ctr']:>5.1f}% {p['pos']:>5.1f}  {p['url']}")

# ── Pages avec gros impressions mais 0 clic ──
print(f"\n{'='*80}\nTop 30 pages SUR-EXPOSÉES (impressions élevées, 0 clic)\n{'='*80}")
zero_click = [p for p in pages if p["clicks"] == 0 and p["impr"] >= 5]
print(f"({len(zero_click)} pages avec >=5 impressions et 0 clic)")
print(f"{'Impr':>6} {'Pos':>6}  URL")
for p in sorted(zero_click, key=lambda x: -x["impr"])[:30]:
    print(f"  {p['impr']:>5} {p['pos']:>6.1f}  {p['url']}")

# ── Croisement: pages GSC qui sont AUSSI dans les issues critiques ──
print(f"\n{'='*80}\nCROISEMENT — Pages GSC indexées qui sont AUSSI orphelines (Ahrefs)\n{'='*80}")
orphans = set()
with (NORM / "Error-indexable-Orphan_page_(has_no_incoming_internal_links).csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        if r.get("URL"):
            orphans.add(r["URL"].rstrip("/"))

gsc_urls_norm = {p["url"].rstrip("/"): p for p in pages}
intersection = orphans & set(gsc_urls_norm.keys())
print(f"{len(intersection)} pages GSC indexées sont orphelines selon Ahrefs")
intersection_sorted = sorted(intersection, key=lambda u: -gsc_urls_norm[u]["impr"])
print(f"\nTop 20 par impressions:")
print(f"{'Clics':>5} {'Impr':>6} {'Pos':>5}  URL")
for u in intersection_sorted[:20]:
    p = gsc_urls_norm[u]
    print(f"  {p['clicks']:>5} {p['impr']:>5} {p['pos']:>5.1f}  {u}")

# ── Slow pages dans GSC ? ──
print(f"\n{'='*80}\nPages LENTES (Ahrefs) qui sont aussi indexées GSC\n{'='*80}")
slow = set()
with (NORM / "Warning-Slow_page.csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        if r.get("URL"):
            slow.add(r["URL"].rstrip("/"))
slow_in_gsc = [gsc_urls_norm[u] for u in slow if u in gsc_urls_norm]
print(f"{len(slow_in_gsc)} pages lentes sont indexées et reçoivent du trafic GSC")
for p in sorted(slow_in_gsc, key=lambda x: -x["impr"]):
    print(f"  Clics={p['clicks']} Impr={p['impr']} Pos={p['pos']:.1f}  {p['url']}")
