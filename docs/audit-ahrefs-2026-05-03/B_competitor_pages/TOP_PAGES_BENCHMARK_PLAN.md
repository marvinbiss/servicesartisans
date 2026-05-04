# Competitor Top Pages Benchmark — Chantier #B (Sprint complément)

**Date** : 2026-05-03
**Source** : `competitor_intelligence_2026-05.csv` (300 pages × hellio + selectra + sonergia + travaux) + `top_pages.json` × 3 concurrents (validation 100 pages chacun).
**Méthode** : isoler les 50 meilleures pages **scope rénovation énergétique** (segment_match=yes + traffic≥200 + volume≥200 + position top 10 + non-brand) → reverse-engineer leur structure et cluster pour informer Sprint éditorial SA.

## Pourquoi cette analyse

Les concurrents publient des centaines de pages, mais seules 5-10% performent vraiment. Identifier ces gagnants permet de :

1. **Copier la structure éditoriale validée** (titre, longueur, FAQ, ancrage Schema)
2. **Détecter les KW racine où SA est absente** ET où il existe une preuve qu'on peut ranker top 10
3. **Cartographier les patterns d'URL** par concurrent pour informer la nomenclature SA

## Volume capturable

| Bucket                                                           | Pages                   |
| ---------------------------------------------------------------- | ----------------------- |
| Pages pull (3 concurrents × 100 + travaux 1 concurrent)          | ~300                    |
| Après filtre (segment + traf≥200 + vol≥200 + pos≤10 + non-brand) | 92                      |
| **Top 50 benchmark**                                             | **50**                  |
| Traffic cumulé top 50                                            | **57 742 visites/mois** |
| Si SA capture 25% via reverse-engineering                        | **~14 400 clics/mois**  |

## Distribution top 50

### Par cluster (priorité Sprint éditorial)

| Cluster                  | N pages | Top concurrent     | Status SA                                                                                                        |
| ------------------------ | ------- | ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **autre** (off-scope SA) | 15      | selectra (90%)     | À ignorer — selectra est multi-secteur (énergie fournisseurs, finance, conversions)                              |
| **aides-cee**            | 9       | hellio             | ✅ `/aides` + `/cee` enrichis Action #8 — checker rank vs hellio sur "ma prime renov", "plafond chèque énergie"  |
| **diagnostic**           | 6       | hellio             | ✅ `/diagnostic` créé Action #8.3 — checker rank vs hellio sur "dpe e location", "interdiction location dpe f g" |
| **chauffage**            | 6       | selectra (propane) | À investiguer — selectra rank top 1 sur "prix bouteille de gaz" — hors verticale stricte SA                      |
| **solaire**              | 5       | hellio             | `/services/panneaux-solaires` — checker rank vs hellio sur "panneau plug-and-play"                               |
| **isolation**            | 4       | sonergia           | sonergia rank #4 sur "isolation phonique mur" 3500 vol → ✅ déjà en input KW gap Action #7                       |
| pompe-a-chaleur          | 2       | sonergia           | `/services/pompe-a-chaleur`                                                                                      |
| travaux                  | 2       | hellio             | ✅ `/travaux` créé Action #8.4                                                                                   |
| simulateur               | 1       | hellio             | ✅ `/simulateur-aides-renovation` existant                                                                       |

### Par concurrent (où ils gagnent)

| Concurrent   | DR  | Top 50 pages       | Stratégie observée                                                                           |
| ------------ | --- | ------------------ | -------------------------------------------------------------------------------------------- |
| **hellio**   | 73  | **25 pages** (50%) | Modèle blog `/blog/{cat}/{slug}` long-form pédagogique + sous-domaines `/copropriete` `/faq` |
| **selectra** | 78  | 19 pages (38%)     | Multi-segment (énergie/finance/eau/conversion) — partiellement off-scope SA                  |
| **sonergia** | 49  | 6 pages (12%)      | Modèle `/conseils-travaux/{vertical}/{sub}/{topic}` → reverse-engineerable directement       |

### Par priorité d'attaque SA

| Priorité | Critère                                     | N pages |
| -------- | ------------------------------------------- | ------- |
| **P0**   | Position 1-3 + volume ≥1000 + traffic ≥1000 | **6**   |
| **P1**   | Position ≤5 + volume ≥500                   | 26      |
| **P2**   | Reste éligible                              | 18      |

## Top 10 P0+P1 in-scope (Sprint immédiat)

| Rank | Cluster         | Concurrent | Top KW                                  | Volume     | Pos  | Traffic | Route SA cible                                                                          |
| ---- | --------------- | ---------- | --------------------------------------- | ---------- | ---- | ------- | --------------------------------------------------------------------------------------- |
| 2    | aides-cee       | hellio     | "plafond cheque energie"                | 2 600      | 1    | 2 636   | `/aides` (ajouter section H2 "Chèque énergie")                                          |
| 5    | aides-cee       | hellio     | "chèque énergie 2025 date de versement" | 18 000     | 5    | 1 983   | `/aides` (idem section "Chèque énergie")                                                |
| 6    | isolation       | sonergia   | "isolation phonique mur"                | 3 500      | 4    | 1 854   | `/guides/isolation-phonique` (Sprint F #8 si jamais réintroduit)                        |
| 7    | diagnostic      | hellio     | "dpe e location"                        | 1 400      | 1    | 1 791   | `/diagnostic` (✅ déjà couvert dans tableau classes)                                    |
| 10   | aides-cee       | hellio     | "ma prime renov"                        | **57 000** | 10   | 1 594   | `/aides` (KW racine — `/aides/maprimerenov` à créer ou redirect 301 vers /aides/[slug]) |
| 11   | diagnostic      | hellio     | "dpe f location"                        | 900        | 1    | 1 436   | `/diagnostic` (✅ couvert)                                                              |
| 18   | solaire         | hellio     | "panneau solaire plug and play"         | 14 000     | 9    | 1 009   | `/services/panneaux-solaires` (ajouter section H2 "Panneaux plug-and-play")             |
| 20   | travaux         | hellio     | "prix ravalement façade maison 100m2"   | 600        | 1    | 989     | `/travaux` (ajouter sous-section H3 "Prix ravalement façade" ou créer guide dédié)      |
| 23   | pompe-a-chaleur | sonergia   | "pompe a chaleur air eau"               | 11 000     | 5    | 959     | `/services/pompe-a-chaleur` (déjà cible Sprint C #7 KW gap)                             |
| —    | aides-cee       | hellio     | (autres pages chèque-énergie)           | divers     | 1-10 | varia   | `/aides` (cluster chèque énergie complet à enrichir)                                    |

## Patterns d'URL gagnants par concurrent

Top 10 patterns (cf. `competitor_url_taxonomy.csv`) :

1. **selectra** `/energie/{categorie}/[long-slug]` — multi-fournisseurs (mais off-scope SA majoritairement)
2. **hellio** `/blog/financement/{topic}` — articles aides chiffrées (3-4 pages top 50)
3. **hellio** `/blog/conseils/{topic}` — articles techniques pédagogiques
4. **sonergia** `/conseils-travaux/{vertical}/{cluster}/[topic-slug]` — guide hub > article (5-6 pages top 50)
5. **hellio** sous-domaines `/copropriete/blog/{cat}/{slug}` + `/faq.hellio.com/{topic}` — segmentation persona

> 🎯 **Application SA** :
>
> 1. Pattern hellio `/blog/financement/{topic-aide}` est le plus rentable → considérer `/aides/cheque-energie`, `/aides/maprimerenov-plafond` etc. si pas déjà couverts par catalog `/aides/[slug]`
> 2. Pattern sonergia `/conseils-travaux/{vertical}/{cluster}/[topic]` est exactement la structure SA `/services/{service}` → on est aligné
> 3. Aucun concurrent n'a de Schema.org Dataset ni de carto interactive — c'est notre différenciateur autorité (Action #4 + Action #3)

## Findings clés

### 1. Cluster « chèque énergie » sous-exploité chez SA

Hellio rank top 5 sur 4 KW chèque énergie cumulant ~7 400 clics/mois (cf. lignes 2, 5, 10 + autres). SA n'a actuellement pas de page dédiée chèque énergie hors `/aides/cheque-energie` (slug existant — vérifier qu'il rank bien).

**Action recommandée** : audit page `/aides/cheque-energie`, comparer structure vs hellio (longueur, FAQ, dates, montants), enrichir si gap.

### 2. KW « ma prime renov » massif (57 000 vol/mois) — hellio pos 10

Cluster prioritaire absolu. Hellio est seulement #10 → **opportunité d'attaque SA** sur la racine MaPrimeRénov (Sprint A déjà couvert via `/aides/maprimerenov` — checker indexation et CTR).

### 3. Sonergia rank #4 sur "isolation phonique mur" — confirme priorité Sprint F

Confirme l'input KW gap Action #7 : isolation-phonique = pillar manquant SA à créer (vol cumulé 14K). Hub `/guides/isolation-phonique` à prioriser si Sprint F étendu.

### 4. Pattern URL `/blog/financement/` est gold

Hellio domine ce pattern. SA n'a pas de blog `/blog/financement/{topic}`. Considérer rebrand interne : `/aides/{slug}` est déjà notre équivalent — vérifier qu'il n'y a pas de KW orphelin (chèque énergie date, plafond, montant) dans le catalog.

### 5. Pas de menace mandataire concurrent visible

Aucune des 50 pages top n'est positionnée sur "mandataire CEE". Sonergia est mandataire mais ne pousse pas la verticale en SEO. Confirme l'opportunité unique de SA Energy SAS sur cette niche.

## Sprint complémentaire recommandé (post-Action #8)

| Action                                                               | Effort | KW capturé                            | Vol estimé                        |
| -------------------------------------------------------------------- | ------ | ------------------------------------- | --------------------------------- |
| Audit + enrichissement `/aides/cheque-energie`                       | 0,5j   | 4 KW chèque énergie                   | ~7 400 vol/mois                   |
| Audit + enrichissement `/aides/maprimerenov`                         | 0,5j   | "ma prime renov" racine               | 57 000 vol (top 5 réaliste à M+3) |
| H2 "Panneau solaire plug-and-play" sur `/services/panneaux-solaires` | 1h     | "panneau solaire plug and play"       | 14 000 vol                        |
| H3 "Prix ravalement façade" sur `/travaux`                           | 1h     | "prix ravalement façade maison 100m2" | 600 vol (ROI/effort)              |
| Guide `/guides/isolation-phonique` (si Sprint F #8 réactivé)         | 2j     | 14K vol cluster isolation phonique    | 14K vol                           |

**Total ROI Sprint complémentaire** : ~2-3j-dev → 75-90K vol/mois capturable.

## Re-run

```bash
npx tsx scripts/analyze-competitor-top-pages.ts
# → idempotent, regenère top_pages_benchmark_50.csv + competitor_url_taxonomy.csv
```

## Maintenance

- Re-pull `top_pages.json` × 4 concurrents prévu **2026-08-03** (trimestriel)
- Re-pull `competitor_intelligence_2026-05.csv` consolidé prévu **2026-06-03** (mensuel)
- Si nouveau concurrent émerge (ex: nouveau mandataire CEE) → ajouter pull dédié
