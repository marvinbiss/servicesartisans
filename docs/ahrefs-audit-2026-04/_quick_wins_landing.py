"""
Pour chaque quick win (pos 11-20, impr >= 50, 0 clic) on essaie d'inférer
sur quelle URL Google atterrit en croisant avec Pages.csv.
Mais GSC ne lie pas requête→page dans cet export → on infère en faisant
correspondre les mots-clés de la requête au pattern d'URL.
"""
import csv
import re
from pathlib import Path
from collections import Counter, defaultdict

NORM = Path(__file__).parent / "normalized"

def num(x): return int(x or 0)
def fnum(x): return float((x or "0").replace(",", "."))
def pct(x): return float(x.replace(",", ".").replace("%", "")) if x else 0.0

# Load queries
queries = []
with (NORM / "Requêtes.csv").open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        kw = r.get("Requêtes les plus fréquentes", "")
        if not kw: continue
        queries.append({
            "kw": kw, "clicks": num(r.get("Clics")),
            "impr": num(r.get("Impressions")),
            "ctr": pct(r.get("CTR", "0%")),
            "pos": fnum(r.get("Position")),
        })

# Categorize quick wins by intent
quick_wins = [q for q in queries if 11 <= q["pos"] <= 20 and q["impr"] >= 50]
print(f"Total quick wins (pos 11-20, impr >= 50): {len(quick_wins)}")
print(f"Total impressions à risque: {sum(q['impr'] for q in quick_wins)}")
print(f"Total clics actuels: {sum(q['clicks'] for q in quick_wins)}")

# Categorization
def categorize(kw):
    kw_l = kw.lower()
    if re.match(r"^[a-z\-éèà ]+ \d{2,3}\b", kw_l) or len(kw_l.split()) <= 2 and any(p in kw_l for p in ["sébastien", "marie", "thomas", "arnaud", "kevin", "ashley", "michel", "philippe"]):
        return "nom_propre"
    metiers = ["plombier", "électricien", "electricien", "chauffagiste", "serrurier", "peintre", "carreleur", "maçon", "macon", "menuisier", "couvreur", "jardinier", "climaticien", "cuisiniste", "déménageur", "demenageur", "vitrier", "alarme", "alarmiste", "antenniste", "ratiseur", "deratiseur", "terrassier", "geometre", "géomètre", "ferronnier", "miroitier", "metallier", "métallier", "paysagiste"]
    has_metier = any(m in kw_l for m in metiers)
    has_ville = bool(re.search(r"(paris|lyon|marseille|bordeaux|toulouse|nice|lille|nantes|rennes|strasbourg|montpellier|grenoble|annecy|cagnes|ostwald|grasse|mougins|annemasse|thonon|villejuif|nanterre|villeurbanne|brest|metz|colomiers|montataire|aix|bagnolet|gennevilliers|brive|saint|sainte|cazouls|angouleme|talaudiere|geispolsheim|charvieu|martigues|issoudun|meyzieu|bron|millau)", kw_l)) or re.search(r"\b\w{4,}-\w{2,}\b", kw_l)
    has_prix = "prix" in kw_l or "tarif" in kw_l or "coût" in kw_l or "devis" in kw_l
    has_urgence = "urgenc" in kw_l or "panne" in kw_l or "fuite" in kw_l or "depannage" in kw_l
    has_install = "installation" in kw_l or "pose" in kw_l or "remplacement" in kw_l
    has_action = "comment" in kw_l or "guide" in kw_l or "choisir" in kw_l

    if has_action:
        return "guide"
    if has_urgence:
        return "urgence_metier_ville" if has_ville else "urgence_metier"
    if has_prix and has_metier and has_ville:
        return "prix_metier_ville"
    if has_prix and has_metier:
        return "prix_metier"
    if has_prix:
        return "prix_other"
    if has_install and has_ville:
        return "install_ville"
    if has_metier and has_ville:
        return "metier_ville"
    if has_metier:
        return "metier"
    if has_ville:
        return "ville_only"
    return "other"

stats = defaultdict(lambda: {"queries": 0, "impr": 0, "clicks": 0, "examples": []})
for q in quick_wins:
    cat = categorize(q["kw"])
    stats[cat]["queries"] += 1
    stats[cat]["impr"] += q["impr"]
    stats[cat]["clicks"] += q["clicks"]
    if len(stats[cat]["examples"]) < 3:
        stats[cat]["examples"].append(f"{q['kw']} (impr={q['impr']}, pos={q['pos']:.1f})")

print(f"\n{'='*100}\nQUICK WINS — répartition par INTENT\n{'='*100}")
print(f"{'Intent':<25} {'Req':>5} {'Impr':>6} {'Clics':>5}  Exemples")
for cat, d in sorted(stats.items(), key=lambda x: -x[1]["impr"]):
    print(f"  {cat:<23} {d['queries']:>5} {d['impr']:>5} {d['clicks']:>5}  {d['examples'][0]}")
    for ex in d["examples"][1:]:
        print(f"  {'':<23} {'':<5} {'':<5} {'':<5}  {ex}")
    print()
