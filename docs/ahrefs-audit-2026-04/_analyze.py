"""
Analyse les CSV normalisés et produit:
- patterns d'URL (préfixes les plus touchés)
- top issues par cluster d'URL
- statistiques agrégées
"""
import csv
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

NORM = Path(__file__).parent / "normalized"

def url_pattern(url: str) -> str:
    """Extrait un pattern d'URL pour grouper (ex: /services/{specialty}/{commune})"""
    try:
        path = urlparse(url).path
    except Exception:
        return url
    parts = path.strip("/").split("/")
    if not parts or parts == [""]:
        return "/"
    # Replace numeric IDs and slugs with placeholders
    pattern_parts = []
    for i, p in enumerate(parts):
        # Top-level segment kept as-is (route name)
        if i == 0:
            pattern_parts.append(p)
        else:
            # Slug-like (lowercase letters/digits/hyphens, length>1) → {slug}
            if re.fullmatch(r"[a-z0-9\-]+", p) and len(p) > 1:
                pattern_parts.append("{slug}")
            else:
                pattern_parts.append(p)
    return "/" + "/".join(pattern_parts)

def load_csv(name: str) -> list[dict]:
    p = NORM / name
    if not p.exists():
        return []
    with p.open("r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def analyze_file(name: str, label: str, top_n: int = 10):
    rows = load_csv(name)
    if not rows:
        print(f"\n{'='*70}\n{label}: NO DATA\n{'='*70}")
        return
    # Find URL column
    url_col = next((c for c in rows[0].keys() if c.lower() == "url"), None)
    if not url_col:
        print(f"\n{'='*70}\n{label}: no URL column found in {list(rows[0].keys())}\n{'='*70}")
        return
    patterns = Counter(url_pattern(r[url_col]) for r in rows if r.get(url_col))
    print(f"\n{'='*70}\n{label}  ({len(rows)} pages)\n{'='*70}")
    for pat, count in patterns.most_common(top_n):
        pct = 100 * count / len(rows)
        print(f"  {count:>6} ({pct:5.1f}%)  {pat}")

# ── ERRORS ──
analyze_file(
    "Error-indexable-Orphan_page_(has_no_incoming_internal_links).csv",
    "ERROR — Pages orphelines (zéro lien interne entrant)",
    top_n=15,
)
analyze_file(
    "Error-indexable-Page_has_no_outgoing_links.csv",
    "ERROR — Pages sans liens sortants",
    top_n=15,
)
analyze_file(
    "Error-3XX_redirect_in_sitemap.csv",
    "ERROR — 3XX redirect dans sitemap",
    top_n=10,
)

# ── WARNINGS ──
analyze_file(
    "Warning-indexable-Low_word_count.csv",
    "WARNING — Faible nombre de mots",
    top_n=15,
)
analyze_file(
    "Warning-indexable-H1_tag_missing_or_empty.csv",
    "WARNING — H1 manquant/vide",
    top_n=15,
)
analyze_file(
    "Warning-indexable-Meta_description_too_short.csv",
    "WARNING — Meta description trop courte",
    top_n=15,
)
analyze_file(
    "Warning-indexable-Meta_description_too_long.csv",
    "WARNING — Meta description trop longue",
    top_n=10,
)
analyze_file(
    "Warning-indexable-Title_too_long.csv",
    "WARNING — Title trop long",
    top_n=15,
)
analyze_file(
    "Warning-Open_Graph_tags_incomplete.csv",
    "WARNING — Open Graph incomplets",
    top_n=10,
)
analyze_file(
    "Warning-Slow_page.csv",
    "WARNING — Pages lentes",
    top_n=15,
)
analyze_file(
    "Notice-Page_in_multiple_sitemaps.csv",
    "NOTICE — Page dans plusieurs sitemaps",
    top_n=10,
)
analyze_file(
    "Notice-indexable-Page_and_SERP_titles_do_not_match.csv",
    "NOTICE — Title page != Title SERP",
    top_n=10,
)

# ── DETAIL: Slow pages (compact, on a tous les détails) ──
print(f"\n{'='*70}\nDÉTAIL — Top 20 pages les plus lentes (TTFB+Load)\n{'='*70}")
slow = load_csv("Warning-Slow_page.csv")
slow.sort(
    key=lambda r: int(r.get("Loading time (ms)", 0) or 0) + int(r.get("Time to first byte (ms)", 0) or 0),
    reverse=True,
)
for r in slow[:20]:
    ttfb = r.get("Time to first byte (ms)", "?")
    load = r.get("Loading time (ms)", "?")
    size_kb = int(r.get("Size (bytes)", 0) or 0) // 1024
    print(f"  TTFB={ttfb:>5}ms Load={load:>5}ms {size_kb:>4}KB  {r.get('URL', '?')}")
