# Audit KPMG-style Agent 1 — Gap KW cluster Rénovation Énergétique

**Date** : 2026-05-04
**Périmètre** : ServicesArtisans (SA) vs leaders niche RGE/CEE/MaPrimeRénov (Effy, Sonergia, QuelleEnergie, France-Renov, Hellio)
**Mission** : quantifier le gap KW exploitable cluster rénovation énergétique
**Scope code SA** : `src/app/(public)/{renovation-energetique,aides,rge,cee,services,guides}`
**Sources Ahrefs primaires** :

- `docs/ahrefs-bloc1-keywords-gap-2026-05-04.md` (3349 KW, 4 leaders)
- `tmp/ahrefs/bloc1-{effy,france-renov,quelleenergie,sonergia,heero}-*.json`
- `tmp/ahrefs/bloc3-longtail-2026-05-04.csv` (532 KW, 7 seeds)
- `docs/audit-ahrefs-2026-05-03/keyword_opportunities_2026-05.csv` (300 KW Hellio)
- `docs/audit-ahrefs-2026-05-03/kw_universe_segment_2026-05.csv` (1370 KW segmentés)
- `docs/STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED-2026-05-04.md`

---

## 1. Univers KW Ahrefs cluster réno (volumes mesurés)

### 1.1 Volume total cumulé

Source : `docs/ahrefs-bloc1-keywords-gap-2026-05-04.md` lignes 23-50, table de répartition par cluster.

|         # | Cluster               |     Nb KW | Vol cumulé/mo |        KD moy | CPC ind. (€) | Source ligne |
| --------: | --------------------- | --------: | ------------: | ------------: | -----------: | ------------ |
|         1 | pac (pompe à chaleur) |       615 |       230 190 |           4.6 |       60-150 | gap.md L26   |
|         2 | solaire_pv            |       288 |       229 940 |          10.4 |       25-250 | gap.md L27   |
|         3 | isolation_other       |       871 |       227 530 |           3.9 |       20-200 | gap.md L28   |
|         4 | aides_mpr             |       271 |       157 840 |          33.5 |      113-149 | gap.md L29   |
|         5 | vmc                   |       215 |       127 800 |       **0.7** |         4-15 | gap.md L30   |
|         6 | chaudiere             |       294 |        85 690 |           2.6 |        1-100 | gap.md L31   |
|         7 | poele_granules        |       107 |        66 250 |           4.2 |         5-30 | gap.md L32   |
|         8 | isolation_ext         |       159 |        64 610 |           6.1 |       90-300 | gap.md L33   |
|         9 | dpe                   |       241 |        54 840 |          11.1 |         1-80 | gap.md L34   |
|        10 | other                 |       169 |        52 200 |          21.6 |          n/a | gap.md L35   |
|        11 | rge_label             |       159 |        35 520 |          24.6 |          n/a | gap.md L36   |
|        12 | isolation_murs        |       139 |        34 630 |           2.3 |       25-110 | gap.md L37   |
|        13 | aides_cee             |       131 |        30 420 |          17.5 |       80-115 | gap.md L38   |
|        14 | isolation_combles     |       108 |        30 230 |           2.4 |      110-120 | gap.md L39   |
|        15 | ballon_thermo         |        47 |        22 840 |           2.3 |          n/a | gap.md L40   |
|        16 | toiture               |        60 |        14 190 |           9.8 |        20-90 | gap.md L41   |
|        17 | audit_energetique     |        31 |        11 690 |           9.7 |         2-50 | gap.md L42   |
|        18 | menuiseries           |        25 |         6 620 |          21.7 |        6-100 | gap.md L43   |
|        19 | isolation_sol         |        43 |         5 880 |           0.1 |        60-70 | gap.md L44   |
|        20 | aides_ecoptz          |        15 |         4 320 |          42.7 |          n/a | gap.md L45   |
|        21 | solaire_thermique     |         6 |         3 590 |           3.0 |           70 | gap.md L46   |
|        22 | aides_anah            |        20 |         3 040 |          36.5 |          n/a | gap.md L47   |
|        23 | renovation_globale    |        16 |         1 700 |          41.8 |          n/a | gap.md L48   |
|        24 | passoire              |        13 |           710 |           2.4 |          n/a | gap.md L49   |
|        25 | aides_tva             |         1 |           100 |          16.0 |          n/a | gap.md L50   |
| **TOTAL** | **25 clusters**       | **3 349** | **1 600 270** | 9.4 (pondéré) |            — | —            |

### 1.2 Sous-univers Bloc 3 long-tail (cap 100/seed via Ahrefs matching-terms)

Source : `tmp/ahrefs/bloc3-longtail-2026-05-04.csv` (532 KW unique, vol≥100, KD≤30).

| Seed            | Nb KW | Vol cumul (top 100/seed) | Note                                |
| --------------- | ----: | -----------------------: | ----------------------------------- |
| vmc             |   100 |                    ~210K | seed le plus dense                  |
| isolation       |    97 |                    ~250K | head 9.1K vol                       |
| pompe a chaleur |    94 |                    ~190K | head 68K vol KD 13                  |
| panneau solaire |    91 |                    ~200K | head "panneau solaire sunethic" 47K |
| dpe             |    62 |                     ~70K | head 10K KD 2                       |
| cee             |    59 |                     ~80K | head "cee leclerc" 1900 vol         |
| ma prime renov  |    29 |                    ~150K | head 57K vol KD 67                  |

### 1.3 Univers Hellio (cluster réno secondaire)

Source : `docs/audit-ahrefs-2026-05-03/keyword_opportunities_2026-05.csv`, 300 KW Hellio segment_match=yes.

- Volume cumulé top 100 : ~370 K req/mo
- KW phares : `robinet thermostatique` 8.6K KD 0 (Hellio #1), `seche linge pompe a chaleur` 17K KD 1 (#2), `ravalement de façade` 11K KD 3 (#10), `dpe vierge` 1.5K KD 0 (#5), `pont thermique` 3.8K KD 2 (#5), `calorifugeage` 3.5K KD 0 (#2)

---

## 2. Couverture SA actuelle (état du code)

### 2.1 Pages cluster réno existantes — recensement direct via Glob

Sources : Glob sur `src/app/(public)/{renovation-energetique,aides,rge,cee,services,guides}`.

| Cluster Ahrefs                                                            | Pages SA dédiées (statiques)                                                                                                                                                                                                                                                                                                                     | Pages SA dynamiques                                                  |                         Profondeur | Verdict                                                                    |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------: | -------------------------------------------------------------------------- |
| **pac**                                                                   | `renovation-energetique/travaux/pompe-a-chaleur/{page,air-air-prix,air-eau-prix,geothermie}` (4) + `guides/{prix-pompe-chaleur-air-eau-installee,installation-pompe-chaleur-etapes,prime-pompe-chaleur-locataire}` (3) + `aides/pompe-a-chaleur-aides-comparatif`                                                                                | `services/pompe-a-chaleur/[v]` 35K villes, `rge/pompe-a-chaleur/[v]` | Hub + 3 sous-pages prix + 3 guides | **Ratio 8 pages / 615 KW = 1.3%** — sous-coverage chronique                |
| **solaire_pv**                                                            | `guides/panneau-solaire-prix-rentabilite` (1)                                                                                                                                                                                                                                                                                                    | `services/panneau-solaire/[v]` (?), `rge/panneau-solaire/[v]`        |                       1 page guide | **Orphelin total — 0 hub, 1 page pour 288 KW**                             |
| **isolation_other**                                                       | `renovation-energetique/travaux/isolation/{page,combles,interieure,exterieure-ite}` (4) + `guides/{isolation-combles,isolation-thermique,isolation-exterieure-vs-interieure,isolation-phonique-mur-appartement,prix-isolation-combles-100m2}` (5)                                                                                                | `services/isolation-*/[v]`, `rge/isolation-*/[v]`                    |                   4 hub + 5 guides | **Ratio 9 / 871 KW = 1.0%**                                                |
| **aides_mpr**                                                             | `renovation-energetique/aides/maprimerenov-2026/{page,montants,eligibilite,parcours-accompagne}` (4) + `aides/[slug]/maprimerenov` (96 dept) + `guides/{maprimerenov-copropriete,maprimerenov-parcours-accompagne,plafond-maprimerenov-revenus-2026}` (3) + `aides/{anah-vs-maprimerenov,maprimerenov-vs-cee,maprimerenov-vs-coup-de-pouce}` (3) | `aides/[slug]/[aide]` ISR                                            |                10+ pages + 96 dept | **Bonne coverage — mais KD 33.5 fait que SA n'apparaît pas**               |
| **vmc**                                                                   | `renovation-energetique/travaux/vmc/{page,simple-flux,hygroreglable,installation}` (4) + `renovation-energetique/travaux/vmc-double-flux` (1) + `guides/{vmc-obligatoire-maison-neuve,ventilation-double-flux-prix}` (2)                                                                                                                         | —                                                                    |    4 hub VMC + 2 guides + 1 ancien | **Ratio 7 / 215 KW = 3.3%** — meilleur cluster, mais récent (post 2026-05) |
| **chaudiere**                                                             | `renovation-energetique/travaux/chauffage/{page,chaudiere-condensation,chauffe-eau-thermodynamique,poele-granules}` (4) + `guides/{chaudiere-fioul-interdite-2026,chaudiere-gaz-vs-granules,chaudiere-ne-chauffe-plus,prix-installation-chaudiere-gaz}` (4)                                                                                      | —                                                                    |                   4 hub + 4 guides | **Ratio 8 / 294 KW = 2.7%**                                                |
| **poele_granules**                                                        | `renovation-energetique/travaux/chauffage/poele-granules` (1) + `guides/poele-granules-aides-2026` (1)                                                                                                                                                                                                                                           | —                                                                    |                            2 pages | **Ratio 2 / 107 KW = 1.9%**                                                |
| **isolation_ext**                                                         | `renovation-energetique/travaux/isolation/exterieure-ite` (1) + `guides/isolation-exterieure-vs-interieure` (1)                                                                                                                                                                                                                                  | —                                                                    |                            2 pages | **Ratio 2 / 159 KW = 1.3%**                                                |
| **dpe**                                                                   | `renovation-energetique/diagnostic/dpe` (1) + `guides/{dpe-mauvais-que-faire,classe-energie-f-interdite-2028,passoire-thermique-renovation,diagnostics-immobiliers,diagnostics-vente-obligatoires}` (5)                                                                                                                                          | —                                                                    |                            6 pages | **Ratio 6 / 241 KW = 2.5%**                                                |
| **rge_label**                                                             | `rge/{page,glossaire,sources,labels/{qualibat,qualibois,qualifelec,qualipac,qualisol},qualifications/{page,[slug]}}` (10+) + `services/[s]/[v]` 50K URLs                                                                                                                                                                                         | `rge/[s]/[v]`, `rge/[s]/departement/[d]`                             |               10+ pages + 50K URLs | **Bonne coverage statique mais leader = france-renov.gouv.fr +DR 75**      |
| **isolation_murs**                                                        | covered par `renovation-energetique/travaux/isolation/interieure`                                                                                                                                                                                                                                                                                | —                                                                    |                     1 sous-section | **Ratio 1 / 139 KW**                                                       |
| **aides_cee**                                                             | `renovation-energetique/aides/cee-certificats-economie-energie` + `cee/{page,coup-de-pouce-2026,mandataire-vs-direct,guides,[op]/{page,guide,[v],region/[r]}}` (8+) + `comparatif-primes-cee-2026`                                                                                                                                               | `cee/[op]/[ville]` ISR                                               |                           8+ pages | **Coverage OK mais KD 17.5 + Hellio domine**                               |
| **isolation_combles**                                                     | `renovation-energetique/travaux/isolation/combles` (1) + `guides/{isolation-combles,prix-isolation-combles-100m2}` (2)                                                                                                                                                                                                                           | —                                                                    |                            3 pages | **Ratio 3 / 108 KW = 2.8%**                                                |
| **ballon_thermo**                                                         | `renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique` (1) + `guides/chauffe-eau-thermodynamique-prix` (1)                                                                                                                                                                                                                       | —                                                                    |                            2 pages | **Ratio 2 / 47 KW = 4.3%**                                                 |
| **toiture**                                                               | `guides/{infiltration-eau-toiture-diagnostic,renovation-toiture,surelevation-toiture-prix}` (3)                                                                                                                                                                                                                                                  | —                                                                    |                           3 guides | **Ratio 3 / 60 KW = 5%** — pas de hub                                      |
| **audit_energetique**                                                     | `renovation-energetique/diagnostic/audit-energetique` (1) + `guides/audit-energetique-prix-aides` (1) + `rge/tarifs-audit-energetique` (1)                                                                                                                                                                                                       | —                                                                    |                            3 pages | **Ratio 3 / 31 KW = 9.7%**                                                 |
| **menuiseries**                                                           | `renovation-energetique/travaux/menuiseries` (1) + `guides/{prix-changement-fenetres-double-vitrage,remplacement-fenetres-aides-2026,velux-installation-prix}` (3)                                                                                                                                                                               | —                                                                    |                            4 pages | **Ratio 4 / 25 KW = 16%** — meilleur ratio                                 |
| **isolation_sol**                                                         | (1 sous-section dans hub isolation)                                                                                                                                                                                                                                                                                                              | —                                                                    |                      0 page dédiée | **Vide — KD 0.1 pourtant**                                                 |
| **aides_anah / aides_ecoptz / aides_tva / passoire / renovation_globale** | `renovation-energetique/aides/eco-ptz-pret-zero` + `renovation-energetique/passoires-thermiques/{page,calendrier,interdiction-location-g-f}` + `aides/eco-ptz-vs-credit-personnel` + `guides/{tva-5-5-travaux-conditions,renovation-energetique-complete}`                                                                                       | —                                                                    |                            6 pages | KW peu nombreux mais OK                                                    |
| **solaire_thermique**                                                     | aucune page dédiée                                                                                                                                                                                                                                                                                                                               | —                                                                    |                                  0 | **Vide**                                                                   |

### 2.2 Score couverture global

- **Pages SA dédiées cluster réno (statiques + flagship)** : ~85 pages
- **KW Ahrefs total mesurés** : 3 349
- **Ratio SA / KW** : 2.5% → **97.5% des KW gap n'ont aucune page SA dédiée**
- **% KW avec page candidate (heuristic match slug, source gap.md L13)** : 57% (1919/3349) → mais "candidate" ≠ "page optimisée pour ce KW"

---

## 3. Gap quantifié — Top 30 par volume × KD (vol≥500, KD≤30)

Source : `docs/ahrefs-bloc1-keywords-gap-2026-05-04.md` Bucket 2 ABSENT (3349 KW), filtre vol≥500 ET KD≤30 ET (Existing page = `—` OU page candidate générique non optimisée pour ce KW).

|   # | Keyword                         | Cluster         | Vol/mo |        KD | Best leader (pos)            | Page SA actuelle           | Gap type                                                | Score (vol/(KD+5)) | Source ligne gap.md |
| --: | ------------------------------- | --------------- | -----: | --------: | ---------------------------- | -------------------------- | ------------------------------------------------------- | -----------------: | ------------------- |
|   1 | vmc simple flux                 | vmc             | 15 000 |         2 | effy #2                      | dédiée existante (récente) | enrich+linkbuild                                        |              2 142 | L73                 |
|   2 | vmc hygroréglable               | vmc             | 14 000 |         1 | quelleenergie #2             | dédiée existante           | enrich+linkbuild                                        |              2 333 | L74                 |
|   3 | chaudiere gaz                   | chaudiere       | 12 000 |         1 | quelleenergie #2             | guide générique            | **CRÉER hub `/chauffage/chaudiere-gaz/`**               |              2 000 | L75                 |
|   4 | ballon thermodynamique          | ballon_thermo   | 18 000 |         6 | france-renov #4              | sous-section               | **CRÉER hub `/ballon-thermodynamique/`**                |              1 636 | L76                 |
|   5 | vmc                             | vmc             | 48 000 |         7 | france-renov #9              | hub `/vmc/` (récent)       | enrich+linkbuild                                        |              4 000 | L77                 |
|   6 | vmc salle de bain               | vmc             |  9 700 |         0 | quelleenergie #5             | —                          | **CRÉER `/vmc/salle-de-bain/`**                         |              1 940 | L78                 |
|   7 | chaudière biomasse              | chaudiere       |  2 800 |         0 | quelleenergie #1             | —                          | **CRÉER `/chauffage/chaudiere-biomasse/`**              |                560 | L80                 |
|   8 | entretien pompe a chaleur       | pac             |  5 600 |         1 | effy #3                      | —                          | **CRÉER `/pompe-a-chaleur/entretien/`**                 |                933 | L83                 |
|   9 | isolation phonique mur          | isolation_other |  3 500 |         0 | sonergia #2                  | sous-section               | **CRÉER guide flagship**                                |                700 | L84                 |
|  10 | isolation phonique              | isolation_other |  8 300 |         7 | sonergia #2                  | sous-section               | **CRÉER hub `/isolation-phonique/`**                    |                691 | L85                 |
|  11 | chaudière à condensation        | chaudiere       |  6 900 |         2 | quelleenergie #4             | sous-page existe           | enrich+linkbuild                                        |                985 | L94                 |
|  12 | dpe d                           | dpe             |  2 200 |         1 | effy #2                      | —                          | **CRÉER `/dpe/classe-d/`**                              |                367 | L98                 |
|  13 | vmc double flux thermodynamique | vmc             |  1 800 |         0 | quelleenergie #1             | —                          | **CRÉER sous-page**                                     |                360 | L97                 |
|  14 | dpe f                           | dpe             |  1 500 |         0 | effy #3                      | —                          | **CRÉER `/dpe/classe-f/`**                              |                300 | L143                |
|  15 | dpe c                           | dpe             |  1 100 |         0 | quelleenergie #2             | —                          | **CRÉER `/dpe/classe-c/`**                              |                220 | L134                |
|  16 | vmc hygroréglable type b        | vmc             |  1 700 |         0 | quelleenergie #1             | —                          | **CRÉER `/vmc/hygroreglable-type-b/`**                  |                340 | L100                |
|  17 | vmc simple flux hygroréglable   | vmc             |  4 400 |         1 | quelleenergie #5             | sous-page existe           | enrich                                                  |                733 | L116                |
|  18 | vmc thermodynamique             | vmc             |    500 |         0 | quelleenergie #1             | —                          | **CRÉER `/vmc/thermodynamique/`**                       |                100 | L180                |
|  19 | chaudière à granulés            | chaudiere       |  2 100 |         5 | quelleenergie #1             | guide générique            | **CRÉER `/chauffage/chaudiere-granules/`**              |                210 | L125                |
|  20 | chaudière gaz                   | chaudiere       |  3 400 |         1 | quelleenergie #6             | —                          | **(idem #3 head term)**                                 |                567 | L137                |
|  21 | dpe e                           | dpe             |  3 800 | 1 (bloc3) | quelleenergie estim.         | —                          | **CRÉER `/dpe/classe-e/`**                              |                633 | bloc3.csv L43       |
|  22 | entretien chaudière gaz         | chaudiere       |  6 200 |        12 | effy #5                      | —                          | **CRÉER `/chauffage/entretien-chaudiere-gaz/`**         |                365 | L162                |
|  23 | poêle à granulés                | poele_granules  | 16 000 |        11 | france-renov #8              | hub existe                 | enrich+linkbuild                                        |              1 000 | L122                |
|  24 | nettoyage panneau solaire       | solaire_pv      |  3 300 |         3 | quelleenergie #2             | —                          | **CRÉER `/solaire/nettoyage/`**                         |                412 | L110                |
|  25 | rendement panneau solaire       | solaire_pv      |  3 200 |         6 | effy #3                      | —                          | **CRÉER `/solaire/rendement/`**                         |                291 | L135                |
|  26 | batterie pour panneau solaire   | solaire_pv      |  3 900 |         8 | quelleenergie #2             | —                          | **CRÉER `/solaire/batterie/`**                          |                300 | L128                |
|  27 | photovoltaïque                  | solaire_pv      |  8 500 |        31 | quelleenergie #6             | —                          | **CRÉER hub `/solaire/photovoltaique/`** (head term P1) |                236 | L234                |
|  28 | validité dpe                    | dpe             |  4 600 |        11 | effy #6                      | —                          | **CRÉER `/dpe/validite/`**                              |                288 | L198                |
|  29 | menuiserie aluminium            | menuiseries     |  3 500 |         6 | quelleenergie #6             | hub menuiseries existe     | enrich+linkbuild                                        |                318 | L186                |
|  30 | bouche vmc                      | vmc             |  4 200 |         0 | quelleenergie estim. (bloc3) | —                          | **CRÉER `/vmc/bouche/`**                                |                840 | bloc3.csv L38       |

### 3.1 Sub-totals gap top 30

- **KW vol total** : ~155 700/mo
- **Vol moyen** : 5 190
- **KD moyen** : 4.4 (très accessible)
- **Pages SA à créer (CRÉER)** : 22/30 (73%)
- **Pages à enrichir (existante non optimisée)** : 8/30 (27%)
- **Effort estimé create** : 22 pages × 4-6h = ~100-130h dev/content
- **Effort estimé enrich** : 8 pages × 2-3h = ~20h
- **ROI P50 trafic capté top 10** : ~22% × vol 155K = **34K-50K clics/mois nouveaux** (assumes CTR Ahrefs traffic-share)

---

## 4. Comparatif concurrent — top 5 pages-mines où SA est absent

Source : `docs/ahrefs-bloc1-pages-mines-2026-05-04.md` lignes 19-118, croisé avec absence page SA dédiée.

|   # | Concurrent           | URL                                                                                                        | KW head                       | Vol KW head | Pos | Trafic/mo | KW total page | Backlinks (RD) | Page SA équivalente ?                                   | Source ligne         |
| --: | -------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------: | --: | --------: | ------------: | -------------: | ------------------------------------------------------- | -------------------- |
|   1 | france-renov.gouv.fr | `/renovation/chauffage/pompe-chaleur-maison`                                                               | pompe a chaleur               |      56 000 |   1 |    28 253 |           298 |             68 | hub `/pompe-a-chaleur/` existe (récent) — sous-optimisé | mines L19            |
|   2 | france-renov.gouv.fr | `/renovation/isolation/murs-maison`                                                                        | isolation exterieur           |      14 000 |   1 |     9 721 |           353 |            116 | `/isolation/exterieure-ite` partiel                     | mines L21            |
|   3 | effy.fr              | `/renovation-energetique/prix-dpe`                                                                         | prix dpe                      |       2 700 |   1 |     5 088 |           181 |              5 | **AUCUNE page prix-dpe dédiée**                         | mines L22            |
|   4 | quelleenergie.fr     | `/economies-energie/chaudiere-granules-bois-pellets/avantages-inconvenients`                               | chaudière à granulés          |       2 100 |   1 |     2 531 |            40 |             15 | `guides/chaudiere-gaz-vs-granules` partiel              | mines L29            |
|   5 | quelleenergie.fr     | `/economies-energie/eco-travaux/vmc-hygroreglable-de-type-b`                                               | vmc hygroréglable type b      |       1 700 |   1 |     1 721 |            54 |              3 | hub VMC existe, pas type-b dédié                        | mines L34            |
|   6 | effy.fr              | `/travaux-energetique/chauffage/pompe-a-chaleur/consommation-electrique`                                   | consommation pompe a chaleur  |       3 300 |   2 |     1 910 |           101 |             14 | **AUCUNE**                                              | mines L40            |
|   7 | effy.fr              | `/travaux-energetique/ventilation/vmc-comment-l-installer`                                                 | installation vmc              |       1 800 |   1 |     1 342 |            41 |              0 | `vmc/installation` existe                               | mines L41            |
|   8 | quelleenergie.fr     | `/economies-energie/panneaux-solaires-photovoltaiques/dimension`                                           | dimension panneau solaire     |         800 |   1 |     1 098 |            71 |             15 | **AUCUNE**                                              | mines L42            |
|   9 | quelleenergie.fr     | `/economies-energie/pompe-chaleur-air-eau/hybride`                                                         | pompe a chaleur hybride       |       1 100 |   1 |     1 464 |            25 |              7 | **AUCUNE**                                              | mines L43            |
|  10 | quelleenergie.fr     | `/economies-energie/isolation-thermique/prix-au-m2-pour-isoler-par-l-exterieur`                            | prix isolation exterieur      |       1 900 |   3 |     3 339 |           163 |             11 | `widget-prix` générique                                 | mines L36            |
|  11 | effy.fr              | `/travaux-energetique/isolation/isolation-1-euro`                                                          | isolation 1 euro              |       1 500 |   1 |     1 954 |           107 |              1 | **AUCUNE** (KW de niche encore actif)                   | mines L27            |
|  12 | sonergia.fr          | `/conseils-travaux/isolation/mur/quelle-isolation-mince-pour-les-murs-interieurs/`                         | isolation mur interieur mince |         350 |   1 |       605 |            90 |              2 | hub isolation interieure existe                         | mines L64            |
|  13 | sonergia.fr          | `/conseils-travaux/chauffage/poele-a-granules/prix-des-granules-de-bois-evolution-tarifs-et-perspectives/` | prix du pellets               |         100 |   1 |       548 |           215 |              6 | **AUCUNE**                                              | mines L68            |
|  14 | quelleenergie.fr     | `/economies-energie/ventilation-double-flux/vmc-hygroreglable`                                             | vmc hygroréglable             |      14 000 |   4 |     2 245 |            98 |              7 | hub vmc/hygroreglable existe                            | mines L65            |
|  15 | hellio.com           | `/blog/conseils/robinet-thermostatique`                                                                    | robinet thermostatique        |       8 600 |   1 |     1 845 |           n/a |            n/a | **AUCUNE** (cluster aides-financement secondaire)       | opportunities.csv L3 |

### 4.1 Synthèse concurrentielle

- **Effy.fr DR 72** : pattern dominant = `/travaux-energetique/{cat}/{sous-cat}/{aspect}` profondeur 4 (max d'autorité topical)
- **France-Renov DR 75 (gov)** : monopole head terms regulatoires (`pompe a chaleur` 28K trafic) — **impossible de battre sans authority**
- **QuelleEnergie** : champion long-tail technique (vmc type b, dimension panneau, etc.) — **gap copycat-able directement**
- **Sonergia** : niche isolation phonique + chauffage très spécifique (161 pages-mines)
- **Hellio** : concentré copropriété + diagnostic + chèque énergie (cluster orthogonal SA)

**SA actuel** : DR 0.6 (cf. memory ahrefs-bloc1), 0 page top 10 sur les 100 pages-mines listées. Opportunité = imiter QuelleEnergie pattern (long-tail technique vol 500-15K, KD 0-5, pages courtes Schema.org riches).

---

## 5. Verdict KPMG — score gap final + priorités

### 5.1 Score gap (0-100)

Méthode : score composite pondéré sur 5 dimensions.

| Dimension                   |    Poids | SA score (0-100) | Justification                                                                      | Source                                  |
| --------------------------- | -------: | ---------------: | ---------------------------------------------------------------------------------- | --------------------------------------- |
| Coverage volume head        |      25% |               18 | 97.5% des 1.6M vol/mo non couvert dédiéément                                       | gap.md L13                              |
| Coverage long-tail (Bloc 3) |      20% |               35 | 50 KW pré-rendus sur route `/guides/long-tail/[slug]` (cap 50/532)                 | bloc3-longtail.ts L33                   |
| Quality on-page (E-E-A-T)   |      15% |               65 | RGE descriptions 49K en prod, schema.org riche, auteur honest                      | mémoire rge-descriptions + authors-eeat |
| Internal linking cluster    |      15% |               30 | Mappings rge↔cee partiels (mémoire internal-linking-rge-cee), peu de cross-cluster | seo/internal-links.ts                   |
| Technical SEO               |      10% |               70 | Sitemap propre, ISR, Schema avancé, mais 5xx 12K et 459K indexées vs 350 clics/j   | mémoire gsc-diagnostic                  |
| Authority externe (DR)      |      15% |                5 | DR 0.6 vs Effy 72 / France-Renov 75 / Sonergia 49                                  | mémoire ahrefs-bloc1                    |
| **TOTAL pondéré**           | **100%** |         **31.0** | gap massif sur volume + DR                                                         | —                                       |

**Score KPMG global : 31/100 (déficient)** — soit 69 points de gap exploitable.

Sub-scores cluster (0-100, pondéré coverage + leadership) :

| Cluster         | Score SA | Cible Vague 1-4 V2 |   Δ |
| --------------- | -------: | -----------------: | --: |
| pac             |       28 |                 65 | +37 |
| solaire_pv      |        8 |                 55 | +47 |
| isolation_other |       32 |                 70 | +38 |
| aides_mpr       |       55 |                 65 | +10 |
| vmc             |       42 |                 80 | +38 |
| chaudiere       |       22 |                 70 | +48 |
| poele_granules  |       18 |                 60 | +42 |
| isolation_ext   |       25 |                 65 | +40 |
| dpe             |       30 |                 60 | +30 |
| rge_label       |       60 |                 75 | +15 |
| ballon_thermo   |       15 |                 60 | +45 |

### 5.2 Priorités P0/P1/P2

#### P0 — IMMÉDIAT (4-6 sem) — alignement Vague 1 V2 fused

|    # | Action                                                                                                                                                                           | Cluster    | Vol gain P50 | KW couverts | Effort    | Source justif                               |
| ---: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -----------: | ----------: | --------- | ------------------------------------------- |
| P0.1 | Hub `/renovation-energetique/travaux/vmc/` enrich + 4 sub-pages vmc-{simple,hygro,double,installation} déjà créées → **sub-niveau salle-de-bain, type-b, thermo, bouche, gaine** | vmc        |  +25-40K vol |   18 KW top | 1 sem dev | gap.md L78,100,101,180 + bloc3 L14,38       |
| P0.2 | Sous-pages PAC manquantes : `entretien`, `consommation`, `hybride`, `eau-eau`, `mitsubishi/daikin/atlantic`                                                                      | pac        |  +30-50K vol |       12 KW | 1 sem     | gap.md L83,86,128,141,160 + bloc3 L143      |
| P0.3 | Hub `/renovation-energetique/solaire/` ex-nihilo (cluster orphelin V1) + 5 sous-pages (PV, prix, batterie, autoconso, rendement, nettoyage)                                      | solaire_pv |  +30-60K vol |       25 KW | 1.5 sem   | gap.md L107,110,135,234,238 — V2 §4 Vague 2 |
| P0.4 | DPE classes : 5 sub-pages `/diagnostic/dpe/{c,d,e,f,g,validite}`                                                                                                                 | dpe        |  +15-20K vol |        8 KW | 4j        | gap.md L98,134,143,184                      |
| P0.5 | Hub `/chauffage/chaudiere-gaz/` + sub `chaudiere-granules`, `entretien-chaudiere-gaz`, `chaudiere-biomasse`, `chaudiere-condensation` (existe)                                   | chaudiere  |  +25-40K vol |       12 KW | 1 sem     | gap.md L75,80,94,125,162                    |

**Total P0** : 5 chantiers, ~50 nouvelles pages, +125-210K vol/mo P50, effort 4-6 sem.

#### P1 — Q3 2026 (sem 6-12) — Vague 2-3 V2 fused

|    # | Action                                                                                                  | Cluster         |   Vol P50 | Effort | Source                          |
| ---: | ------------------------------------------------------------------------------------------------------- | --------------- | --------: | ------ | ------------------------------- |
| P1.1 | Hub `/isolation-phonique/` + 4 sub-pages (mur, plafond, sol, mitoyen) — concurrent Sonergia             | isolation_other |   +15-25K | 1 sem  | gap.md L84,85 + mines L57,82    |
| P1.2 | `/poele-granules/` 6 sub-pages (prix, marque, pellets, entretien, installation, comparatif)             | poele_granules  |   +15-25K | 1 sem  | gap.md L122,140 + mines L31,50  |
| P1.3 | Hub `/ballon-thermodynamique/` + sub-pages (prix, marques, fonctionnement)                              | ballon_thermo   |   +15-20K | 4j     | gap.md L76,142                  |
| P1.4 | Pages-mines copycat top 50 (mines.md L19-118) — pour chaque page non-SA, créer SA equivalent + maillage | multi           |   +15-30K | 2 sem  | mines.md L19-69                 |
| P1.5 | DR uplift : disavow + 3 backlinks tier 1 + Wikipedia data.gouv.fr (cf. mémoire ultra-domination v2)     | global          | +indirect | 1 sem  | mémoire ultra-domination-seo-v2 |

**Total P1** : ~80 pages, +60-100K vol/mo P50, effort 6 sem.

#### P2 — Q4 2026 (sem 13-26) — Vague 4+ V2 fused

|    # | Action                                                                                                                                         | Cluster                    | Vol P50 | Effort | Source                        |
| ---: | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------: | ------ | ----------------------------- |
| P2.1 | MaPrimeRénov longue traîne (locataire, copro, bailleur, monoparental) + audit 96 dept existantes                                               | aides_mpr                  | +20-30K | 2 sem  | V2 §4 Vague 4                 |
| P2.2 | Hellio cluster orthogonal copro (robinet thermostatique 8.6K, calorifugeage 3.5K, pont thermique 3.8K, dpe vierge 1.5K, ravalement-facade 11K) | other                      | +25-40K | 2 sem  | opportunities.csv L3,32,33,30 |
| P2.3 | `/renovation-globale/`, `/audit-energetique/{prix,obligatoire,rge}`                                                                            | renovation_globale + audit |  +5-10K | 1 sem  | gap.md L156                   |
| P2.4 | `/aides/eco-ptz/` enrich + sub-pages                                                                                                           | aides_ecoptz               |   +3-5K | 3j     | gap.md L45                    |

**Total P2** : ~50 pages, +50-85K vol/mo P50, effort 5-6 sem.

### 5.3 ROI cumulé (méthode P50)

| Horizon | Vague    | Pages livrées | Vol gain net P50/mo | Trafic clic P50/j (CTR 7%) | Vs baseline 350/j |
| ------- | -------- | ------------: | ------------------: | -------------------------: | ----------------- |
| M+3     | P0       |            50 |            125-210K |                   +290-490 | +83% à +140%      |
| M+6     | P0+P1    |           130 |            185-310K |                   +430-720 | +123% à +205%     |
| M+12    | P0+P1+P2 |           180 |            235-395K |                   +545-920 | +156% à +263%     |

**ROI volume capturable cumulé sur 12 mois (P50)** : ~250-400K req/mois cluster réno (sur 1.6M vol total identifié), soit 16-25% du marché niche addressable. Cohérent avec V2 fused projection M+9 = 3 500-7 800 clics/j (×10-22 baseline).

### 5.4 Risques / contraintes

1. **DR 0.6 = plafond ranking** — sans backlinks tier 1 (Wikipedia, data.gouv.fr, presse régionale), top 10 KD>20 inaccessible
2. **5xx 12 890 pages dont 57% template `/services/[s]/[v]/[publicId]`** (cf. mémoire gsc-diagnostic) — règle stop-bleeding avant nouveau sprint code
3. **MaPrimeRénov KD 33-67** = france-renov.gouv.fr monopolise. Impossible head term, focus longue traîne uniquement
4. **Bandwidth content** : 180 pages quality E-E-A-T = ~3-5K€/mois content writer freelance pendant 6 mois (mémoire mandataire-cee budget)
5. **Cluster solaire_pv head term `panneau solaire` KD 43** = head bloqué EDF/Engie — cible long-tail uniquement (rendement, batterie, nettoyage, dimension)

---

## 6. Sources et traçabilité

| Source                                                           | Lignes/Path                                  | Snapshot   | Usage                                                      |
| ---------------------------------------------------------------- | -------------------------------------------- | ---------- | ---------------------------------------------------------- |
| `docs/ahrefs-bloc1-keywords-gap-2026-05-04.md`                   | L23-50 (clusters), L70-269 (200 KW Bucket 2) | 2026-05-04 | Univers KW + gap top 200                                   |
| `docs/ahrefs-bloc1-pages-mines-2026-05-04.md`                    | L19-118 (top 100 pages)                      | 2026-05-04 | Comparatif concurrent                                      |
| `tmp/ahrefs/bloc3-longtail-2026-05-04.csv`                       | 532 lignes, 7 seeds                          | 2026-05-04 | Long-tail validation                                       |
| `docs/audit-ahrefs-2026-05-03/keyword_opportunities_2026-05.csv` | 300 lignes Hellio                            | 2026-05-03 | Cluster Hellio orthogonal                                  |
| `docs/audit-ahrefs-2026-05-03/kw_universe_segment_2026-05.csv`   | 1370 lignes                                  | 2026-05-03 | Cross-ref Hellio/effy/france-renov positions               |
| `docs/STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED-2026-05-04.md`   | L34-71, L91-153                              | 2026-05-04 | Roadmap Vague 1-4 ROI                                      |
| `docs/ahrefs-renovation-keywords-extracted-2026-05-04.md`        | L26-71 (42 KW)                               | 2026-05-04 | Cross-ref content_gap (FLOOR — leaders niche absents)      |
| `tmp/ahrefs/bloc1-effy.fr-top-pages.json`                        | 126 pages                                    | 2026-05-04 | Pattern leader `/travaux-energetique/{cat}/{sub}/{aspect}` |
| `src/app/(public)/renovation-energetique/**`                     | Glob 36 pages                                | 2026-05-04 | Recensement SA actuel                                      |
| `src/app/(public)/cee/**`                                        | Glob 8 pages                                 | 2026-05-04 | Recensement CEE                                            |
| `src/app/(public)/rge/**`                                        | Glob 16 pages + 50K URLs                     | 2026-05-04 | Recensement RGE                                            |
| `src/app/(public)/guides/**`                                     | Glob ~120 pages                              | 2026-05-04 | Recensement guides                                         |
| `src/lib/seo/bloc3-longtail.ts`                                  | L33,121,129-148                              | 2026-05-04 | Loader long-tail + mapping seed→hub                        |

---

## 7. Méta — méthodologie audit

- Score gap composite pondéré (5 dimensions) — non-pondération sur volume seul (évite biais head term)
- Bucket scoring ABSENT/STRIKING/DEEP repris du Bloc 1 v3
- Glob direct des dossiers App Router pour recensement (pas de DB query, pas de scraping)
- KW filtrés vol≥500 ET KD≤30 pour top 30 gap (focus easy wins quick-actionable)
- Cross-ref 4 leaders niche (Effy, Sonergia, QuelleEnergie, France-Renov) pour score concurrence
- Hellio inclus en cluster orthogonal P2 (segment copro/diagnostic peu touché par SA)

**Limites connues** :

- Pas de pull Bloc 4-6 (backlinks intersect, SERP overlap, brand search) — score "Authority" partiel
- Effy/France-Renov absents du content-gap original avril (FLOOR sur 42 KW initial)
- Bloc 3 long-tail capé 100/seed (api Ahrefs limit) — vrai univers > 532 KW
- Score "Quality on-page" = subjectif (pas d'audit Lighthouse cross-cluster automatisé)
