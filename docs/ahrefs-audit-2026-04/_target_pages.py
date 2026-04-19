"""Analyse maillage interne (top target pages Ahrefs)."""
import csv
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

NORM = Path(__file__).parent / "normalized"

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

pages = []
with (NORM / "ahrefs-top-target-pages.csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        url = r.get("Page cible", "")
        try: links = int(r.get("Liens internes", 0) or 0)
        except: links = 0
        if not url: continue
        pages.append((url, links))

print(f"Total pages dans top-target (export limité): {len(pages)}")
print(f"Total liens internes cumulés (top 1000 pages): {sum(l for _,l in pages):,}")
print(f"Médiane liens/page: {sorted(l for _,l in pages)[len(pages)//2]:,}")
print(f"Max: {max(l for _,l in pages):,}")
print(f"Pages au plafond 40 000 (probable cap Ahrefs): {sum(1 for _,l in pages if l>=40000)}")
print(f"Pages avec 0 lien interne: {sum(1 for _,l in pages if l==0)}")

# Distribution par bucket
buckets = [(0,9), (10,49), (50,99), (100,499), (500,999), (1000,4999), (5000,9999), (10000,39999), (40000,99999999)]
print(f"\n{'Bucket':<20} {'Pages':>6} {'Total liens':>14}")
for lo, hi in buckets:
    in_b = [p for p in pages if lo <= p[1] <= hi]
    print(f"  {f'{lo:,}-{hi:,}':<18} {len(in_b):>6} {sum(p[1] for p in in_b):>14,}")

# Pattern aggregation
print(f"\n{'='*100}\nMAILLAGE par PATTERN (top 25 par liens cumulés)\n{'='*100}")
patterns = defaultdict(lambda: {"pages": 0, "links": 0})
for url, links in pages:
    pat = url_pattern(url)
    patterns[pat]["pages"] += 1
    patterns[pat]["links"] += links
print(f"{'Pattern':<55} {'Pages':>6} {'Liens cumulés':>14}")
for pat, d in sorted(patterns.items(), key=lambda x: -x[1]["links"])[:25]:
    print(f"  {pat[:53]:<53} {d['pages']:>6} {d['links']:>14,}")

# Spot DOM-TOM concentration
print(f"\n{'='*100}\nDOM-TOM dans le maillage (top pages)\n{'='*100}")
domtom_terms = ["martinique", "mayotte", "guadeloupe", "guyane", "nouvelle-caledonie", "cayenne", "mamoudzou", "lamentin", "noumea", "tahiti", "polynesie", "papeete", "papara", "pirae", "matoury", "kourou", "moule", "tsingoni", "remire", "ouangani", "bandrele", "bandraboua", "dumbea", "macouria", "apatou", "faaa"]
domtom_pages = [(url, links) for url, links in pages if any(t in url.lower() for t in domtom_terms)]
print(f"Pages DOM-TOM dans top-1000: {len(domtom_pages)} ({100*len(domtom_pages)/len(pages):.1f}%)")
print(f"Liens cumulés DOM-TOM: {sum(l for _,l in domtom_pages):,}")
print(f"\nTop 15 DOM-TOM par liens:")
for url, links in sorted(domtom_pages, key=lambda x: -x[1])[:15]:
    print(f"  {links:>6,}  {url}")
