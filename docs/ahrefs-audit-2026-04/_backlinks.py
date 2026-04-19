"""Convertit + analyse les backlinks Ahrefs."""
import csv
from pathlib import Path
from collections import Counter, defaultdict
from urllib.parse import urlparse

DOWNLOADS = Path(r"C:\Users\USER\Downloads")
NORM = Path(__file__).parent / "normalized"

src = DOWNLOADS / "servicesartisans.fr-backlinks-subdomains_2026-04-18_15-44-46.csv"
dst = NORM / "ahrefs-backlinks.csv"

# Convert UTF-16
raw = src.read_bytes()
text = raw.decode("utf-16-le") if raw[:2] == b"\xff\xfe" else raw.decode("utf-8")
rows = list(csv.reader(text.splitlines(), delimiter="\t", quotechar='"'))
with dst.open("w", encoding="utf-8", newline="") as f:
    w = csv.writer(f, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in rows: w.writerow(row)
print(f"Converted: {len(rows)} rows")

# Analyze
def num(x):
    try: return int(x or 0)
    except: return 0
def fnum(x):
    try: return float((x or "0").replace(",", "."))
    except: return 0.0

backlinks = []
with dst.open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        if not r.get("Referring page URL"): continue
        backlinks.append({
            "ref_url": r.get("Referring page URL", ""),
            "ref_title": r.get("Referring page title", ""),
            "lang": r.get("Language", ""),
            "platform": r.get("Platform", ""),
            "ref_http": r.get("Referring page HTTP code", ""),
            "dr": num(r.get("Domain rating")),
            "ur": fnum(r.get("UR")),
            "domain_traffic": num(r.get("Domain traffic")),
            "ref_domains": num(r.get("Referring domains")),
            "page_traffic": num(r.get("Page traffic")),
            "target_url": r.get("Target URL", ""),
            "anchor": r.get("Anchor", ""),
            "type": r.get("Type", ""),
            "is_spam": r.get("Is spam") == "true",
            "nofollow": r.get("Nofollow") == "true",
            "ugc": r.get("UGC") == "true",
            "sponsored": r.get("Sponsored") == "true",
            "rendered": r.get("Rendered") == "true",
            "raw": r.get("Raw") == "true",
            "lost_status": r.get("Lost status", ""),
            "drop_reason": r.get("Drop reason", ""),
            "first_seen": r.get("First seen", ""),
            "last_seen": r.get("Last seen", ""),
            "lost": r.get("Lost", ""),
            "page_type": r.get("Page type", ""),
            "page_category": r.get("Page category", ""),
        })

print(f"\nTotal backlinks: {len(backlinks)}")

# By status
spam_count = sum(1 for b in backlinks if b["is_spam"])
nofollow_count = sum(1 for b in backlinks if b["nofollow"])
ugc_count = sum(1 for b in backlinks if b["ugc"])
sponsored_count = sum(1 for b in backlinks if b["sponsored"])
lost_count = sum(1 for b in backlinks if b["lost"])
print(f"Spam (Ahrefs flag): {spam_count}")
print(f"Nofollow: {nofollow_count} ({100*nofollow_count/len(backlinks):.0f}%)")
print(f"UGC: {ugc_count}")
print(f"Sponsored: {sponsored_count}")
print(f"Lost: {lost_count}")

# Quality breakdown
print(f"\n=== Top 20 backlinks par DR du domaine référent ===")
print(f"{'DR':>3} {'UR':>4} {'Spam':>4} {'NoFol':>5} {'Lost':>4}  Domain")
for b in sorted(backlinks, key=lambda x: -x["dr"])[:20]:
    domain = urlparse(b["ref_url"]).netloc.replace("www.", "")
    spam_flag = "S" if b["is_spam"] else "-"
    nofol_flag = "N" if b["nofollow"] else "-"
    lost_flag = "L" if b["lost"] else "-"
    print(f"  {b['dr']:>3} {b['ur']:>4.1f}    {spam_flag}     {nofol_flag}    {lost_flag}  {domain}  -> {b['target_url'][:60]}")

# By unique domain
print(f"\n=== Backlinks par DOMAINE UNIQUE (top 30) ===")
domain_stats = defaultdict(lambda: {"count": 0, "dr": 0, "max_dr": 0, "is_spam": False, "any_dofollow": False})
for b in backlinks:
    domain = urlparse(b["ref_url"]).netloc.replace("www.", "")
    d = domain_stats[domain]
    d["count"] += 1
    d["max_dr"] = max(d["max_dr"], b["dr"])
    d["is_spam"] = d["is_spam"] or b["is_spam"]
    d["any_dofollow"] = d["any_dofollow"] or not b["nofollow"]
print(f"Total domaines uniques: {len(domain_stats)}")
print(f"\n{'Domain':<40} {'#Links':>6} {'MaxDR':>5} {'Spam':>4} {'AnyDF':>5}")
for domain, d in sorted(domain_stats.items(), key=lambda x: (-x[1]["max_dr"], -x[1]["count"]))[:30]:
    spam_flag = "Y" if d["is_spam"] else "-"
    df_flag = "Y" if d["any_dofollow"] else "-"
    print(f"  {domain[:38]:<38} {d['count']:>6} {d['max_dr']:>5} {spam_flag:>4} {df_flag:>5}")

# Anchors distribution
print(f"\n=== Top anchor texts ===")
anchors = Counter(b["anchor"][:60] for b in backlinks if b["anchor"])
for a, c in anchors.most_common(15):
    print(f"  {c:>3}  '{a}'")

# Target URLs receiving links
print(f"\n=== Pages cibles recevant des backlinks (top 20) ===")
targets = Counter(b["target_url"] for b in backlinks)
for t, c in targets.most_common(20):
    print(f"  {c:>3}  {t}")

# Lost backlinks
print(f"\n=== Backlinks PERDUS récemment ===")
for b in backlinks:
    if b["lost"]:
        domain = urlparse(b["ref_url"]).netloc.replace("www.", "")
        print(f"  DR={b['dr']:>2}  Lost={b['lost']:<20}  reason={b['drop_reason']}  {domain} -> {b['target_url']}")
