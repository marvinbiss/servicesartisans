"""
Analyse Requêtes.csv (mots-clés GSC):
- Top requêtes par clics
- Top requêtes par impressions sans clics (potentiel)
- Quick wins (position 11-20 = page 2)
- Brand vs non-brand
- Catégorisation par cluster (prix, urgence, choisir, etc.)
"""
import csv
from collections import Counter, defaultdict
from pathlib import Path
import re

NORM = Path(__file__).parent / "normalized"

def pct(x): return float(x.replace(",", ".").replace("%", "")) if x else 0.0
def num(x): return int(x or 0)
def fnum(x): return float((x or "0").replace(",", "."))

queries = []
with (NORM / "Requêtes.csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        kw = r.get("Requêtes les plus fréquentes", "")
        if not kw:
            continue
        queries.append({
            "kw": kw,
            "clicks": num(r.get("Clics")),
            "impr": num(r.get("Impressions")),
            "ctr": pct(r.get("CTR", "0%")),
            "pos": fnum(r.get("Position")),
        })

print(f"Total requêtes GSC: {len(queries)}")
total_clicks = sum(q["clicks"] for q in queries)
total_impr = sum(q["impr"] for q in queries)
print(f"  Total clics: {total_clicks}    Total impressions: {total_impr}")
print(f"  CTR moyen: {100*total_clicks/total_impr if total_impr else 0:.2f}%")
print(f"  Position moyenne pondérée par impressions: {sum(q['pos']*q['impr'] for q in queries)/total_impr:.1f}")

# ── Top par clics ──
print(f"\n{'='*90}\nTop 30 REQUÊTES par CLICS\n{'='*90}")
print(f"{'Clics':>6} {'Impr':>6} {'CTR':>6} {'Pos':>5}  Mot-clé")
for q in sorted(queries, key=lambda x: -x["clicks"])[:30]:
    print(f"  {q['clicks']:>5} {q['impr']:>5} {q['ctr']:>5.1f}% {q['pos']:>5.1f}  {q['kw']}")

# ── Top par impressions (=visibilité) ──
print(f"\n{'='*90}\nTop 30 REQUÊTES par IMPRESSIONS (= ce qui rank Google même si peu de clics)\n{'='*90}")
print(f"{'Impr':>6} {'Clics':>5} {'CTR':>6} {'Pos':>5}  Mot-clé")
for q in sorted(queries, key=lambda x: -x["impr"])[:30]:
    print(f"  {q['impr']:>5} {q['clicks']:>5} {q['ctr']:>5.1f}% {q['pos']:>5.1f}  {q['kw']}")

# ── QUICK WINS: position 11-20 (page 2) avec impressions >= 50 ──
print(f"\n{'='*90}\nQUICK WINS — Position 11-20 (page 2) avec impr >= 50 — TOP 30\n{'='*90}")
print(f"{'Pos':>5} {'Impr':>6} {'Clics':>6} {'CTR':>6}  Mot-clé")
quick_wins = [q for q in queries if 11 <= q["pos"] <= 20 and q["impr"] >= 50]
for q in sorted(quick_wins, key=lambda x: -x["impr"])[:30]:
    print(f"  {q['pos']:>4.1f} {q['impr']:>5} {q['clicks']:>5} {q['ctr']:>5.1f}%  {q['kw']}")
print(f"\n  Total quick wins: {len(quick_wins)} requêtes (potentiel énorme si on passe en page 1)")

# ── DEEP TAIL: position 21-50 avec impressions >= 100 (besoin de boost contenu/maillage) ──
print(f"\n{'='*90}\nMID-TAIL — Position 21-50 avec impr >= 100 — TOP 30\n{'='*90}")
print(f"{'Pos':>5} {'Impr':>6} {'Clics':>6} {'CTR':>6}  Mot-clé")
mid_tail = [q for q in queries if 21 <= q["pos"] <= 50 and q["impr"] >= 100]
for q in sorted(mid_tail, key=lambda x: -x["impr"])[:30]:
    print(f"  {q['pos']:>4.1f} {q['impr']:>5} {q['clicks']:>5} {q['ctr']:>5.1f}%  {q['kw']}")

# ── Pages 1 (top 10) déjà acquises ──
print(f"\n{'='*90}\nPAGES 1 — Position 1-10 déjà acquises — TOP 30 par impressions\n{'='*90}")
print(f"{'Pos':>5} {'Impr':>6} {'Clics':>6} {'CTR':>6}  Mot-clé")
page1 = [q for q in queries if q["pos"] <= 10]
for q in sorted(page1, key=lambda x: -x["impr"])[:30]:
    print(f"  {q['pos']:>4.1f} {q['impr']:>5} {q['clicks']:>5} {q['ctr']:>5.1f}%  {q['kw']}")
print(f"\n  Total page 1: {len(page1)} requêtes")

# ── Brand vs non-brand ──
brand_terms = ["servicesartisans", "services artisans", "services-artisans", "service artisans"]
brand = [q for q in queries if any(b in q["kw"].lower() for b in brand_terms)]
non_brand = [q for q in queries if not any(b in q["kw"].lower() for b in brand_terms)]
print(f"\n{'='*90}\nBRAND vs NON-BRAND\n{'='*90}")
print(f"BRAND ({len(brand)} req)    : {sum(q['clicks'] for q in brand):>5} clics, {sum(q['impr'] for q in brand):>6} impr")
print(f"NON-BRAND ({len(non_brand)} req): {sum(q['clicks'] for q in non_brand):>5} clics, {sum(q['impr'] for q in non_brand):>6} impr")

# ── Catégorisation par cluster Sprint 3 ──
clusters = {
    "1-prix": [r"\bprix\b", r"\btarif", r"\bcoût", r"\bcout\b", r"€", r"euros?\b"],
    "2-aides": [r"maprimer[eé]nov", r"\bcee\b", r"prime[s]? [eé]nergie", r"aides?\b.*r[eé]nov", r"[eé]co.?pr[eê]t", r"coup de pouce"],
    "3-choisir": [r"\bcomment\b.*(choisir|trouver|v[eé]rifier|reconna[iî]tre)", r"\bsiret\b", r"\barnaque\b", r"d[eé]cennale", r"comparer.*devis"],
    "4-urgence": [r"\burgenc[eé]\b", r"d[eé]pannage", r"24h", r"\bnuit\b", r"\bpanne\b", r"\bfuite\b"],
    "5-travaux": [r"\btravaux\b", r"\binstallation\b", r"\br[eé]novation\b(?! [eé]nerg)", r"\bextension\b", r"\bagrandissement\b"],
    "6-renov-energetique": [r"r[eé]nov.*[eé]nerg", r"\bdpe\b", r"passoire thermique", r"audit [eé]nerg", r"isolation"],
    "7-rge": [r"\brge\b", r"qualipac", r"qualibat", r"qualifelec"],
    "8-problemes": [r"humidit[eé]", r"moisissure", r"infiltration", r"fissure[s]?", r"condensation", r"pont thermique"],
    "9-reglementation": [r"d[eé]claration pr[eé]alable", r"permis de construire", r"\bnorme[s]?\b", r"\bdtu\b", r"copropri[eé]t[eé]"],
    "10-local": [r"\bparis\b", r"\blyon\b", r"\bmarseille\b", r"\bbordeaux\b", r"\btoulouse\b", r"\bnice\b", r"\blille\b", r"\bnantes\b", r"\brennes\b", r"\bstrasbourg\b"],
    "metier": [r"plombier", r"[eé]lectricien", r"chauffagiste", r"serrurier", r"peintre", r"carreleur", r"ma[çc]on", r"menuisier", r"couvreur", r"jardinier", r"climaticien"],
}
def classify(kw):
    kw_l = kw.lower()
    matches = []
    for name, patterns in clusters.items():
        for pat in patterns:
            if re.search(pat, kw_l):
                matches.append(name)
                break
    return matches or ["uncategorized"]

cluster_stats = defaultdict(lambda: {"queries": 0, "clicks": 0, "impr": 0})
for q in queries:
    cats = classify(q["kw"])
    for c in cats:
        cluster_stats[c]["queries"] += 1
        cluster_stats[c]["clicks"] += q["clicks"]
        cluster_stats[c]["impr"] += q["impr"]

print(f"\n{'='*90}\nCATÉGORISATION par CLUSTER Sprint 3\n{'='*90}")
print(f"{'Cluster':<25} {'Req':>5} {'Clics':>7} {'Impr':>7} {'CTR':>6}")
for c, d in sorted(cluster_stats.items(), key=lambda x: -x[1]["impr"]):
    ctr = 100 * d["clicks"] / d["impr"] if d["impr"] else 0
    print(f"  {c:<23} {d['queries']:>5} {d['clicks']:>6} {d['impr']:>6} {ctr:>5.1f}%")
