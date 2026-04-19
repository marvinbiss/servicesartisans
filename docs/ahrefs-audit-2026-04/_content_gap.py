"""
Analyse Content Gap (75 000 keywords où concurrents rankent et pas nous).
- Volume cumulé
- KD distribution
- Top opportunités par cluster (KD<=30, vol>=100, intersection >= 2 concurrents)
- Patterns d'intent
"""
import csv
import re
from collections import Counter, defaultdict
from pathlib import Path

NORM = Path(__file__).parent / "normalized"

def num(x):
    try: return int(x or 0)
    except: return 0

rows = []
with (NORM / "ahrefs-content-gap.csv").open(encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        kw = r.get("Keyword") or list(r.values())[0]
        if not kw: continue
        # Determine which competitors rank
        comps_ranking = []
        for cname, cpos_field in [("pagesjaunes", "pagesjaunes.fr/: Organic Position"),
                                  ("travaux", "travaux.com/: Organic Position"),
                                  ("izi", "izi-by-edf.fr/: Organic Position")]:
            pos = num(r.get(cpos_field))
            if pos > 0: comps_ranking.append((cname, pos))
        rows.append({
            "kw": kw,
            "vol": num(r.get("Volume")),
            "kd": num(r.get("KD")),
            "cpc": float((r.get("CPC", "0") or "0").replace(",", ".") or "0"),
            "comps": comps_ranking,
            "n_comps": len(comps_ranking),
            "best_pos": min((p for _, p in comps_ranking), default=999),
        })

print(f"Total content gap keywords: {len(rows):,}")
print(f"Volume cumulé: {sum(r['vol'] for r in rows):,}")
print(f"Volume cumulé (vol>=100): {sum(r['vol'] for r in rows if r['vol']>=100):,}")
print(f"Volume cumulé (vol>=500): {sum(r['vol'] for r in rows if r['vol']>=500):,}")

# ── Filtre opportunités: KD <= 30, vol >= 50, >= 2 concurrents rank ──
oppor = [r for r in rows if r["kd"] <= 30 and r["vol"] >= 50 and r["n_comps"] >= 2]
print(f"\nOpportunités (KD<=30, vol>=50, n_comps>=2): {len(oppor)}")
print(f"Volume cumulé opportunités: {sum(r['vol'] for r in oppor):,}")

# ── Cluster par préfixe/intent ──
def categorize(kw):
    k = kw.lower()
    metiers = ["plombier", "électricien", "electricien", "chauffagiste", "serrurier", "peintre",
               "carreleur", "maçon", "macon", "menuisier", "couvreur", "jardinier", "climaticien",
               "cuisiniste", "déménageur", "demenageur", "vitrier", "alarme", "antenniste",
               "ratiseur", "deratiseur", "terrassier", "geometre", "géomètre", "ferronnier",
               "miroitier", "metallier", "métallier", "paysagiste", "platrier", "plâtrier",
               "diagnostiqueur", "domoticien", "ramoneur", "zingueur", "plaquiste", "ascensoriste"]
    has_metier = any(m in k for m in metiers)
    has_prix = re.search(r"\b(prix|tarif|coût|cout|combien|devis|gratuit)\b", k)
    has_urgence = re.search(r"\b(urgenc|panne|fuite|depannage|dépannage|24h|nuit)\b", k)
    has_aide = re.search(r"\b(maprimerenov|maprimer|cee|aide|prime|subvention|crédit|credit)\b", k)
    has_install = re.search(r"\b(installation|pose|remplacement|rénovation|renovation)\b", k)
    has_avis = re.search(r"\b(avis|recommandation|notation|note)\b", k)
    has_ville = bool(re.search(r"\b\w{4,}-\w{2,}\b", k)) or re.search(r"(paris|lyon|marseille|bordeaux|toulouse|nice|lille|nantes|rennes|strasbourg|montpellier|grenoble|brest|metz|reims|tours|orléans|orleans|caen|amiens|dijon|angers|le mans|annecy)", k)
    has_compare = re.search(r"\bvs\b|\bou\b|\bcontre\b|\bcomparatif\b|\bcomparaison\b", k)
    has_question = re.search(r"\b(comment|pourquoi|quand|combien|quel|quelle)\b", k)
    if has_aide: return "aides_subvention"
    if has_question: return "questions"
    if has_compare: return "comparatif"
    if has_avis: return "avis_reputation"
    if has_urgence: return "urgence"
    if has_prix and has_metier: return "prix_metier"
    if has_prix: return "prix_other"
    if has_install: return "install_renov"
    if has_metier and has_ville: return "metier_ville"
    if has_metier: return "metier_only"
    if has_ville: return "ville_only"
    return "other"

cluster_stats = defaultdict(lambda: {"queries": 0, "vol": 0, "examples": []})
for r in oppor:
    c = categorize(r["kw"])
    cluster_stats[c]["queries"] += 1
    cluster_stats[c]["vol"] += r["vol"]
    if len(cluster_stats[c]["examples"]) < 5:
        comps_str = ",".join(c[0][:4] for c in r["comps"])
        cluster_stats[c]["examples"].append(f"{r['kw']} (vol={r['vol']}, KD={r['kd']}, [{comps_str}])")

print(f"\n{'='*100}\nOPPORTUNITÉS par CLUSTER (top par volume)\n{'='*100}")
print(f"{'Cluster':<25} {'#KW':>6} {'Vol':>9}  Exemples")
for c, d in sorted(cluster_stats.items(), key=lambda x: -x[1]["vol"]):
    print(f"  {c:<23} {d['queries']:>6} {d['vol']:>8,}")
    for ex in d['examples']:
        print(f"      - {ex}")
    print()

# ── Top 30 opportunités absolues ──
print(f"\n{'='*100}\nTOP 30 OPPORTUNITÉS ABSOLUES (vol*precision/(KD+1))\n{'='*100}")
oppor.sort(key=lambda r: -r["vol"]*r["n_comps"]/(r["kd"]+1))
print(f"{'Vol':>5} {'KD':>3} {'NComp':>5}  Mot-clé")
for r in oppor[:30]:
    comps_str = ",".join(c[0][:4] for c in r["comps"])
    print(f"  {r['vol']:>5} {r['kd']:>3} {r['n_comps']:>5} [{comps_str:<14}]  {r['kw'][:80]}")

# ── Quel concurrent domine quoi? ──
print(f"\n{'='*100}\nDOMINATION par CONCURRENT\n{'='*100}")
comp_kw = defaultdict(int)
comp_vol = defaultdict(int)
for r in rows:
    for cname, _ in r["comps"]:
        comp_kw[cname] += 1
        comp_vol[cname] += r["vol"]
for c in sorted(comp_kw.keys(), key=lambda x: -comp_vol[x]):
    print(f"  {c:<12}  KW: {comp_kw[c]:>6,}  Volume cumulé: {comp_vol[c]:>10,}")
