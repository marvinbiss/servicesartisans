"""Génère le fichier disavow.txt pour Google Search Console."""
import csv
from pathlib import Path
from collections import defaultdict
from urllib.parse import urlparse

NORM = Path(__file__).parent / "normalized"
OUT = Path(__file__).parent / "disavow.txt"

# Aggregate per domain — keep only spammy ones
domain_status = defaultdict(lambda: {"is_spam": False, "max_dr": 0, "any_dofollow": False, "count": 0})
with (NORM / "ahrefs-backlinks.csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        url = r.get("Referring page URL", "")
        if not url: continue
        domain = urlparse(url).netloc.replace("www.", "")
        d = domain_status[domain]
        d["count"] += 1
        d["is_spam"] = d["is_spam"] or (r.get("Is spam") == "true")
        d["any_dofollow"] = d["any_dofollow"] or (r.get("Nofollow") != "true")
        try: d["max_dr"] = max(d["max_dr"], int(r.get("Domain rating") or 0))
        except: pass

# Filter: domains flagged spam
spam_domains = sorted(d for d, v in domain_status.items() if v["is_spam"])

# Build disavow file
lines = [
    "# Disavow file for servicesartisans.fr",
    "# Generated 2026-04-18 from Ahrefs backlinks export",
    "# Source: 50/64 backlinks flagged as spam by Ahrefs",
    "# Pattern: PBN classics (.shop, .icu, .top, .party, .fyi, .xyz)",
    "# Upload via: Google Search Console > Tools > Disavow links",
    "",
]
for d in spam_domains:
    info = domain_status[d]
    flag = "DOFOLLOW" if info["any_dofollow"] else "nofollow"
    lines.append(f"# DR={info['max_dr']} {flag} count={info['count']}")
    lines.append(f"domain:{d}")
    lines.append("")

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Disavow file written: {OUT}")
print(f"Spam domains to disavow: {len(spam_domains)}")
print(f"\nFirst 10 entries:")
for d in spam_domains[:10]:
    info = domain_status[d]
    print(f"  domain:{d}   (DR={info['max_dr']})")
