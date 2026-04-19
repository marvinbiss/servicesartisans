"""
Convertit tous les CSV Ahrefs/GSC exportés (UTF-16 LE, tab-separated)
en CSV UTF-8 avec virgule, pour analyse ultérieure.
"""
import csv
import os
from pathlib import Path

DOWNLOADS = Path(r"C:\Users\USER\Downloads")
OUTPUT = Path(__file__).parent / "normalized"
OUTPUT.mkdir(exist_ok=True)

FILES = [
    "Notice-Pages_to_submit_to_IndexNow.csv",
    "Warning-indexable-Low_word_count.csv",
    "Error-indexable-Orphan_page_(has_no_incoming_internal_links).csv",
    "Warning-indexable-H1_tag_missing_or_empty.csv",
    "Error-indexable-Page_has_no_outgoing_links.csv",
    "Warning-indexable-Meta_description_too_short.csv",
    "Warning-Open_Graph_tags_incomplete.csv",
    "Warning-indexable-Title_too_long.csv",
    "Notice-Page_in_multiple_sitemaps.csv",
    "Warning-indexable-Meta_description_too_long.csv",
    "Pages.csv",
    "Requêtes.csv",
    "Warning-Slow_page.csv",
    "Notice-indexable-Page_and_SERP_titles_do_not_match.csv",
    "Warning-3XX_redirect.csv",
    "Error-3XX_redirect_in_sitemap.csv",
    "Warning-3XX_redirect-links.csv",
    "Warning-Sitemap_in_the_wrong_format.csv",
    "Notice-HTTP_to_HTTPS_redirect.csv",
    "Notice-Redirect_chain.csv",
    "Graphique.csv",
    "Warning-indexable-Redirected_page_has_no_incoming_internal_links.csv",
    "Apparence dans les résultats de recherche.csv",
    "Filtres.csv",
]

def detect_and_convert(src: Path, dst: Path) -> tuple[int, str]:
    raw = src.read_bytes()
    # Detect encoding
    if raw[:2] == b"\xff\xfe":
        text = raw.decode("utf-16-le")
        enc = "utf-16-le"
    elif raw[:2] == b"\xfe\xff":
        text = raw.decode("utf-16-be")
        enc = "utf-16-be"
    elif raw[:3] == b"\xef\xbb\xbf":
        text = raw.decode("utf-8-sig")
        enc = "utf-8-bom"
    else:
        # Try utf-8, fallback to latin-1
        try:
            text = raw.decode("utf-8")
            enc = "utf-8"
        except UnicodeDecodeError:
            text = raw.decode("latin-1")
            enc = "latin-1"

    # Detect delimiter: if tabs dominate, convert to comma
    sample = text[:5000]
    delim = "\t" if sample.count("\t") > sample.count(",") else ","

    rows = list(csv.reader(text.splitlines(), delimiter=delim, quotechar='"'))
    with dst.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL)
        for row in rows:
            writer.writerow(row)
    return len(rows), enc

results = []
for name in FILES:
    src = DOWNLOADS / name
    if not src.exists():
        results.append((name, "MISSING", "-", "-"))
        continue
    safe_name = name.replace(" ", "_").replace("é", "e").replace("è", "e").replace("à", "a")
    dst = OUTPUT / safe_name
    try:
        rows, enc = detect_and_convert(src, dst)
        results.append((name, "OK", rows, enc))
    except Exception as e:
        results.append((name, f"ERR: {e}", "-", "-"))

print(f"{'File':<75} {'Status':<10} {'Rows':<8} {'Encoding':<10}")
print("-" * 105)
for name, status, rows, enc in results:
    print(f"{name:<75} {status:<10} {str(rows):<8} {enc:<10}")
