"""
Convertit les nouveaux exports Ahrefs Site Explorer + GA4
en UTF-8 dans normalized/.
"""
import csv
from pathlib import Path

DOWNLOADS = Path(r"C:\Users\USER\Downloads")
OUTPUT = Path(__file__).parent / "normalized"
OUTPUT.mkdir(exist_ok=True)

FILES = {
    "ahrefs-top-pages.csv":              "servicesartisans.fr-top-pages-subdomains-al_2026-04-18_14-55-48.csv",
    "ahrefs-organic-positions.csv":      "servicesartisans.fr-organic-positions-subdo_2026-04-18_14-56-24.csv",
    "ahrefs-organic-keywords.csv":       "servicesartisans.fr-organic-keywords-subdom_2026-04-18_14-56-34.csv",
    "ahrefs-competitors.csv":            "servicesartisans.fr_orgcompetitors_subdomain_2026-04-18_14-56-49.csv",
    "ahrefs-content-gap.csv":            "servicesartisans.fr-content-gap-subdomains-f_2026-04-18_14-59-51.csv",
    "Requêtes_v2.csv":                   "Requêtes.csv",
    "Pages_v2.csv":                      "Pages.csv",
    "ga4-snapshot.csv":                  "Instantané_des_rapports.csv",
    "ga4-engagement-retention.csv":      "Vue_d'ensemble_Voir_l'engagement_et_la_rétention_des_utilisateurs_.csv",
    "ga4-events.csv":                    "Événements_Nom_de_l'événement.csv",
}

def detect_and_convert(src: Path, dst: Path) -> tuple[int, str]:
    raw = src.read_bytes()
    if raw[:2] == b"\xff\xfe":
        text = raw.decode("utf-16-le"); enc = "utf-16-le"
    elif raw[:2] == b"\xfe\xff":
        text = raw.decode("utf-16-be"); enc = "utf-16-be"
    elif raw[:3] == b"\xef\xbb\xbf":
        text = raw.decode("utf-8-sig"); enc = "utf-8-bom"
    else:
        try:    text = raw.decode("utf-8"); enc = "utf-8"
        except UnicodeDecodeError: text = raw.decode("latin-1"); enc = "latin-1"
    sample = text[:5000]
    delim = "\t" if sample.count("\t") > sample.count(",") else ","
    rows = list(csv.reader(text.splitlines(), delimiter=delim, quotechar='"'))
    with dst.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL)
        for row in rows:
            writer.writerow(row)
    return len(rows), enc

print(f"{'Output name':<40} {'Status':<8} {'Rows':>7} {'Encoding':<10}")
print("-" * 75)
for safe_name, src_name in FILES.items():
    src = DOWNLOADS / src_name
    if not src.exists():
        print(f"{safe_name:<40} MISSING")
        continue
    dst = OUTPUT / safe_name
    try:
        rows, enc = detect_and_convert(src, dst)
        print(f"{safe_name:<40} OK       {rows:>7} {enc:<10}")
    except Exception as e:
        print(f"{safe_name:<40} ERR: {e}")
