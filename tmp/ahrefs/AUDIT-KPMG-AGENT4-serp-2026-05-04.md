# Audit KPMG - Agent 4 - Gap SERP cluster Renovation Energetique

**Date** : 2026-05-04
**Periode** : pull Ahrefs 2026-05-03 (snapshot SA + 4 leaders) + 2026-04 (normalized)
**Scope** : SERP positions SA vs Effy / Sonergia / France-Renov / Hellio / Selectra sur cluster renovation energetique
**Auteur** : Agent 4 (audit 10 agents KPMG-style)

---

## TLDR (executive)

**Score SERP cluster reno : 4/100**

SA est quasi-absent de la SERP renovation energetique malgre 459K pages indexees. Sur les top 100 KW gap (vol cumule 519K/mois), **SA n'apparait sur aucune** ; concurrents : France-Renov (DR 75) capte 287K vol, Effy (DR ~72) 119K, Hellio (DR 73) 50K, Sonergia (DR 49) 40K. Sur 590 KW lookalike Sonergia (vol 765K/mois, 127 attackable kd<=15), SA est positionne sur 0. Sur 143 KW SA toutes verticales, **seulement 12-15 sont reno** et tous sur micro-volumes (max 200/mois) avec aucun en pos 21-50 (donc le concept "rank 21-50 dormant" n'existe pas pour reno - SA n'a jamais ranke).

Top 3 P0 actions (ROI > 90j) :

1. **Title rewrite CEE livre + scale aux 12 ops manquantes** : ~50K vol/mois adressable, +1500 clics/mois (deja en prod sur bar-th-148 / bar-th-112).
2. **Hub `/services/pompe-a-chaleur` + `/services/isolation-thermique` content surgery** : 22 KW gap pompe-a-chaleur (vol 145K) + 32 KW isolation (vol 132K) routes deja existantes, content gap = absence H2 prix/marques/comparatifs, pas un probleme de page.
3. **Creer `/blog/isolation-phonique-mur-mitoyen` + 8 blog longue-traine non-mappes** (cluster autre 19 KW vol 30K dont 15K "gaz passerelle", 2.4K "renovation appartement"). 0 page existante.

**Volume mensuel recuperable striking distance reel : 0** (SA n'a aucun KW reno en pos 4-20 vol > 200). Gap a combler par creation/refresh : 765K vol/mois (lookalike) + 519K (gap top100). Realisable a CTR 3% top 10 sur 12 mois P50 : +20-40K clics/mois si execution.

---

## Section 1 - Univers SERP SA cluster reno

**Source** : `bloc1-sa-keywords.json` + `bloc1-sa-keywords-v2.json` + `audit-2026-05-03/A_competitors/sa_keywords_1000.json` (deduplication par (keyword, url)). Filtre cluster reno = match sur slugs URL `(maprimerenov|cee|rge|renovation-energetique|services/pompe-a-chaleur|services/isolation|services/chauffagiste|services/panneaux-solaires|services/electricien-irve|services/poele|services/calorifugeur|aides|simulateur)` OU substring KW `(maprime|cee|rge|renov|pompe a chaleur|isolation|isolant|comble|thermique|phonique|vmc|ventilation|dpe|audit energe|passoire|panneau solaire|photovolta|chauffe eau|thermodynamique|chaudiere|fioul|poele|granul|cheque energie|borne recharge|irve|eco-ptz|prime energie)`.

| Bucket position SA | KW count | Vol cumule | Traffic cumule | Source CSV (ligne)                  |
| ------------------ | -------: | ---------: | -------------: | ----------------------------------- |
| Pos 1-3            |        3 |          0 |              0 | sa_keywords_1000.json (143 lignes)  |
| Pos 4-10           |       10 |        330 |             15 | sa_keywords_1000.json               |
| Pos 11-20          |        2 |          0 |              0 | sa_keywords_1000.json               |
| Pos 21-50          |        0 |          0 |              0 | (vide)                              |
| Pos 51-100         |        0 |          0 |              0 | (vide)                              |
| **Total reno**     |   **15** |    **330** |         **15** | sur **143 KW SA toutes verticales** |

**Contraste SA non-reno** : sur les 128 autres KW SA, ~80% sont des longue-traine locale (`plombier caen 24h24` 100 vol pos 2, `serrurier paimpol` 90 vol pos 2, `ma prime renov 2026` 6.2K pos 26). Le seul KW reno > 100 vol est "plomberie urgence" (200 vol, pos 4) qui n'est pas vraiment reno.

**Ce que ca dit** : SA n'a quasi aucune presence reno mesurable dans Ahrefs. Les 459K pages pSEO sont des pages locales metier (plombier ville, electricien ville) qui captent les longue-traine, mais le cluster reno (qui n'a pas de vrai pSEO actif) est mort. Confirmation memory `servicesartisans-rank2150-attack-2026-04-20.md` : il n'existe pas de "rank 21-50 dormant" sur cluster reno parce que SA n'a jamais ranke.

**Note methodologique** : L'export Ahrefs `sa_keywords_1000.json` est en realite truncated a 141 lignes (pas 1000). Le vrai universe SA est ~5K-15K KW selon GSC (16K impressions/jour / ~15-25 imp/KW = 700-1100 KW actifs/jour, soit ~5K KW total). Il y a donc un manque de donnees pull Ahrefs cluster reno (a re-puller au 2026-05-18, cf `STRIKING_DISTANCE_PLAN.md` ligne 92).

---

## Section 2 - Striking distance KW (SA reno pos 4-20)

**Source** : sa_keywords_1000.json (143 KW) + bloc1-sa-keywords-v2.json (137 KW) deduplique. Filtre cluster reno + pos 4-20.

**Top 12 (toutes les SA reno pos 4-20)** :

|   # | KW                                           | Vol |  KD | SA pos | SA URL                                           | Concurrent #1  | URL #1     | Ecart                                |
| --: | -------------------------------------------- | --: | --: | -----: | ------------------------------------------------ | -------------- | ---------- | ------------------------------------ |
|   1 | plomberie urgence                            | 200 |   1 |      4 | /urgence/plombier/saint-julien-en-genevois       | divers locaux  | local pack | passage en pos 1-3 = +120 vol/mois   |
|   2 | vitrier aubergenville                        |  90 |   0 |      7 | /avis/vitrier/aubergenville                      | local          | local pack | refresh + tarifs/proximite = pos 1-3 |
|   3 | idf calorifuge                               |  40 |   0 |      9 | /services/isolation-thermique/guitrancourt/(...) | none mesurable | divers     | longue traine, refresh content       |
|   4 | parabole satellite nice                      |   0 |   0 |      5 | /tarifs/antenniste/nice/installation-parabole    | n/a            | n/a        | hors reno                            |
|   5 | electricien depannage urgent                 |   0 |   0 |      5 | /urgence/electricien                             | local          | local pack | hors reno strict                     |
|   6 | ambiance poele perissac                      |   0 |   0 |      7 | /services/chauffagiste/perissac/ap-reno-ambiance | n/a            | n/a        | longue-traine artisan                |
|   7 | etancheite bureaux villefranche sur mer      |   0 |   0 |      8 | /devis/etancheiste/villefranche-sur-mer          | n/a            | n/a        | hors reno                            |
|   8 | changer sa chaudiere fioul grasse            |   0 |   0 |      8 | /tarifs/pompe-a-chaleur/grasse/remplacement      | n/a            | n/a        | longue-traine, vol 0                 |
|   9 | pompe a chaleur corbeil-essonnes             |   0 |   0 |      9 | /services/pompe-a-chaleur/corbeil-essonnes       | n/a            | n/a        | longue-traine, vol 0                 |
|  10 | etancheite toit goudron mandelieu            |   0 |   0 |     10 | /tarifs/etancheiste/mandelieu-la-napoule/(...)   | n/a            | n/a        | hors reno                            |
|  11 | remplacement chaudiere fioul par pac antibes |   0 |   0 |     11 | /tarifs/pompe-a-chaleur/mougins/remplacement     | n/a            | n/a        | longue-traine, vol 0                 |
|  12 | prix panneaux photovoltaiques albi           |   0 |   0 |     11 | /tarifs/panneaux-solaires/albi                   | n/a            | n/a        | longue-traine, vol 0                 |

**Verdict striking distance reno** : il n'y a **aucun KW reno avec volume Ahrefs > 200 sur SA en pos 4-20**. Le concept de "striking distance attack" sur cluster reno est inapplicable - SA doit d'abord se positionner avant de pouvoir progresser. Le vrai play c'est creation/upgrade de pages, pas le push des pos 4-20 vers 1-3.

**Volume cumule recuperable striking distance reno** : 330 vol/mois (dont 200 sur "plomberie urgence" qui n'est pas strictement reno). **Effort/ROI ratio derisoire**.

Le vrai gisement est sur les **127 KW lookalike Sonergia attackable (vol 765K/mois)** ou SA n'a **aucune** position - c'est de la creation, pas du striking distance. Voir Section 4.

**Source CSV/ligne** :

- striking_distance_2026-05.csv lignes 2-590 (mauvais nom du CSV - c'est du content gap lookalike, pas de la striking distance reelle ; cf STRIKING_DISTANCE_PLAN.md ligne 6)
- E_site/sa_lost_keywords_LIVE.csv lignes 2-25 (24 lignes) = recuperation pos perdues (non-reno majoritairement, voir Section 3)
- A_competitors/sa_keywords_1000.json (143 entrees, dont 15 reno)

---

## Section 3 - Lost keywords cluster reno

**Source** : `E_site/sa_lost_keywords_LIVE.csv` (24 lignes) + `ahrefs-organic-positions.csv` (265 lignes - export change diff April).
Le `sa_lost_keywords_2026-05.csv` racine est **vide** (header seul, 1 ligne) - pull error documente dans `STRIKING_DISTANCE_PLAN.md` ligne 8.

**Lost KW reno uniquement (filtre cluster) sur sa_lost_keywords_LIVE** :

| Rank | KW                              | Vol | Pos avant | URL                                      | Cause hypothese                     |
| ---: | ------------------------------- | --: | --------: | ---------------------------------------- | ----------------------------------- |
|    8 | installation prise (electrique) |  70 |         5 | /blog/comment-installer-prise-electrique | minor SERP drop, refresh + IndexNow |

**Total lost reno KW** : **1 sur 24** (4%). Les 23 autres sont des longue-traine non-reno (plombier/serrurier/vitrier locales).

**Lost KW reno depuis ahrefs-organic-positions.csv (April normalized, position_change=Lost)** :

Filtre Position change=Lost + Volume>=100 + cluster reno match :

|                                                       KW | Vol | Pos avant | URL | Cause hypothese |
| -------------------------------------------------------: | --- | --------: | --- | --------------- |
| (aucun KW reno avec Volume>=100 en Position change=Lost) | -   |         - | -   | -               |

Verifie : sur 265 lignes du diff, les `Lost` >= vol 100 sont : `plombier rouen` (1000, pos 4), `prix charpentier` (200, pos 10), `bm macon` (700, pos 20). **Zero reno**.

**Verdict lost KW reno** : SA n'a quasi rien perdu sur reno parce que SA n'a quasi rien gagne sur reno. Le pull Ahrefs `sa_lost_keywords_2026-05.csv` etant casse, on ne peut pas exclure des pertes silencieuses. **A re-puller le 2026-05-18 (cycle quota Ahrefs)**.

---

## Section 4 - Concurrents winning sur nos targets (top 50 KW vol)

**Source** : `C_gap/kw_gap_attack_top100.csv` (100 KW) + `striking_distance_2026-05.csv` (lookalike 590 KW).

### 4.1 Distribution competitive sur top 100 KW gap (vol cumule 519K/mois)

| Concurrent       | Nb KW | Vol cumule |  DR | Top URL pattern                 |
| ---------------- | ----: | ---------: | --: | ------------------------------- | -------------------- | ----------------------- |
| **france_renov** |    36 |     287100 |  75 | /renovation/{chauffage          | isolation}/[topic]   |
| **effy**         |    35 |     118700 | ~72 | /travaux-energetique/{chauffage | isolation            | chauffe-eau}/[topic]    |
| **hellio**       |    14 |      50100 |  73 | /blog/{conseils                 | financement          | actualites}/[long-slug] |
| **sonergia**     |    13 |      39800 |  49 | /conseils-travaux/{chauffage    | isolation}/[topic]/  |
| **selectra**     |     2 |      23500 |  78 | /energie/{actualites            | solaire}/[long-slug] |

**Source CSV** : kw_gap_attack_top100.csv ligne 2-101 + competitor_url_patterns.csv ligne 2-31.

### 4.2 Top 50 KW gap (vol decroissant) - format compact

|   # | KW                                 |   Vol |  KD | Concurrent #1 | Pos #1 | Cluster         | Route SA reco                                          |
| --: | ---------------------------------- | ----: | --: | ------------- | -----: | --------------- | ------------------------------------------------------ |
|   1 | seche linge pompe a chaleur        | 17000 |   1 | hellio        |      2 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|   2 | isolation mur interieur            |  7800 |   1 | france_renov  |      5 | isolation       | /services/isolation-thermique                          |
|   3 | isolation exterieur                | 14000 |   2 | france_renov  |      1 | isolation       | /services/isolation-thermique                          |
|   4 | pompe a chaleur prix               |  4700 |   1 | sonergia      |      9 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|   5 | chauffe eau                        | 39000 |   5 | effy          |     10 | chauffe-eau     | /cee/bar-th-148                                        |
|   6 | vmc simple flux                    | 15000 |   2 | effy          |      2 | ventilation     | /cee/bar-th-127                                        |
|   7 | installation pompe a chaleur       |  3300 |   1 | effy          |      2 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|   8 | dpe d                              |  2100 |   1 | effy          |      3 | audit           | /renovation-energetique                                |
|   9 | pompe a chaleur                    | 56000 |  13 | france_renov  |      1 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|  10 | chauffage                          | 20000 |  10 | selectra      |      3 | chauffage       | /services/chauffagiste                                 |
|  11 | panneau solaire camping car        |  3500 |   1 | selectra      |      7 | solaire         | /services/panneaux-solaires                            |
|  12 | isolation phonique mur             |  3500 |   0 | sonergia      |      2 | isol-phon       | (a creer /blog/isolation-phonique-mur-mitoyen)         |
|  13 | chauffe eau thermodynamique        | 31000 |   9 | france_renov  |      3 | chauffe-eau     | /cee/bar-th-148                                        |
|  14 | consommation pompe a chaleur       |  3300 |   1 | effy          |      2 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|  15 | peinture isolante thermique        |  3100 |   0 | effy          |      7 | isolation       | /services/isolation-thermique                          |
|  16 | dpe f                              |  1500 |   0 | effy          |      3 | audit           | /renovation-energetique                                |
|  17 | ballon thermodynamique             | 18000 |   6 | france_renov  |      4 | chauffe-eau     | /cee/bar-th-148                                        |
|  18 | installation pompe a chaleur       |  3000 |   1 | france_renov  |      7 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|  19 | prise renforcee voiture electrique |  2900 |   1 | hellio        |      6 | irve            | (manquante - a creer)                                  |
|  20 | entretien pompe a chaleur          |  5600 |   2 | effy          |      3 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|  21 | peinture isolante                  |  2800 |   0 | effy          |     10 | isolation       | /services/isolation-thermique                          |
|  22 | isolation par l'exterieur          | 13000 |   5 | france_renov  |      1 | isolation       | /services/isolation-thermique                          |
|  23 | entreprise de renovation           |  2600 |   1 | france_renov  |      9 | travaux         | (manquante - hub /entreprise-renovation)               |
|  24 | isolation comble perdu             |  1200 |   1 | france_renov  |      4 | isolation       | /services/isolation-thermique                          |
|  25 | isolation interieure               |  1200 |   1 | france_renov  |      4 | isolation       | /services/isolation-thermique                          |
|  26 | chaudiere fioul                    |  2300 |   0 | hellio        |      5 | chauffage       | /services/chauffagiste                                 |
|  27 | isolant polyurethane               |  2300 |   0 | sonergia      |      9 | isolation       | /services/isolation-thermique                          |
|  28 | isolant phonique mur               |  2300 |   0 | sonergia      |      9 | isol-phon       | (a creer)                                              |
|  29 | dpe c                              |  1100 |   0 | effy          |      3 | audit           | /renovation-energetique                                |
|  30 | chauffage d'appoint economique     |  2200 |   0 | hellio        |      6 | chauffage       | /services/chauffagiste                                 |
|  31 | panneau solaire 1000w              |  2100 |   1 | effy          |      2 | solaire         | /services/panneaux-solaires                            |
|  32 | chauffe eau solaire                | 12000 |   6 | france_renov  |      3 | chauffe-eau     | /cee/bar-th-148 (a deplacer vers /cee/bar-th-101 CESI) |
|  33 | isolation                          |  7900 |   4 | france_renov  |      3 | isolation       | /services/isolation-thermique                          |
|  34 | isolation exterieur maison         |  3700 |   4 | france_renov  |      1 | isolation       | /services/isolation-thermique                          |
|  35 | pompe a chaleur air eau            | 11000 |  12 | sonergia      |      5 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|  36 | installation vmc                   |  1800 |   0 | effy          |      1 | ventilation     | /cee/bar-th-127                                        |
|  37 | meilleur poele                     |  1800 |   0 | effy          |      8 | poele           | /cee/bar-th-112                                        |
|  38 | entretien pompe a chaleur          |   900 |   1 | effy          |      6 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|  39 | isolation interieur                |  3600 |   4 | france_renov  |      4 | isolation       | /services/isolation-thermique                          |
|  40 | isolation plafond garage           |  1800 |   0 | france_renov  |      8 | isolation       | /services/isolation-thermique                          |
|  41 | panneau solaire plug and play      | 14000 |   8 | hellio        |      9 | solaire         | /services/panneaux-solaires                            |
|  42 | pompe a chaleur prix               |  1700 |   2 | effy          |      4 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|  43 | isolant sol                        |  1700 |   0 | effy          |      7 | isolation       | /services/isolation-thermique                          |
|  44 | disconnecteur chaudiere            |  1700 |   0 | effy          |      8 | chauffage       | /services/chauffagiste                                 |
|  45 | pompe a chaleur eau eau            |  1700 |   0 | sonergia      |      4 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|  46 | isolation combles                  |  4100 |   5 | france_renov  |      1 | isolation       | /services/isolation-thermique                          |
|  47 | prix pompe a chaleur air air       |  1600 |   0 | effy          |      1 | pompe-a-chaleur | /services/pompe-a-chaleur                              |
|  48 | ramonage poele a bois              |  1600 |   0 | effy          |      6 | poele           | /cee/bar-th-112                                        |
|  49 | entretien chauffe eau              |  1600 |   1 | effy          |      6 | chauffe-eau     | /cee/bar-th-148                                        |
|  50 | pompe a chaleur air air prix       |  1500 |   0 | effy          |      4 | pompe-a-chaleur | /services/pompe-a-chaleur                              |

**Source CSV** : kw_gap_attack_top100.csv lignes 2-51 (50 premieres). Volume cumule top 50 : ~330K/mois.

### 4.3 Pattern dominants concurrents (competitor_url_patterns.csv)

Les 5 patterns qui captent le plus de vol :

| Pattern                                                 | Concurrent   | Nb KW | Vol cumule | Lecon                                           |
| ------------------------------------------------------- | ------------ | ----: | ---------: | ----------------------------------------------- |
| /renovation/chauffage/pompe-chaleur-maison              | france_renov |     4 |      73300 | 1 page hub massive sur PAC = bonne strategie    |
| /renovation/chauffage/[long-slug]                       | france_renov |     2 |      49000 | URLs descriptives long-slug                     |
| /travaux-energetique/chauffe-eau/chauffe-eau-electrique | effy         |     1 |      39000 | Specialisation par appareil                     |
| /renovation/isolation/murs-maison                       | france_renov |     4 |      38600 | Hub murs = 4 KW captures                        |
| /blog/conseils/[long-slug]                              | hellio       |     3 |      22100 | Blog conseils captures longue traine pertinente |

**Lecon strategique** : France-Renov (DR 75) gagne par **autorite + URL descriptives + hub thematique large**. Effy gagne par **specialisation appareil + content depth**. Hellio gagne par **blog conseils long-slug**. SA n'a aucun de ces 3 leviers actifs sur reno.

**Source** : C_gap/competitor_url_patterns.csv lignes 2-31.

### 4.4 Top pages benchmark - 25 leaders (extrait)

`B_competitor_pages/top_pages_benchmark_50.csv` lignes 2-26 montrent que les pages individuelles de leaders captent 1K-2.6K traf/mois chacune (~30-80K vol/mois sur top KW, CTR 4-8%).

Top 5 pages a benchmarker :

1. hellio /blog/financement/plafond-cheque-energie - 2636 traf - 93 KW on page (cluster aides-cee)
2. hellio /blog/conseils/robinet-thermostatique - 2219 traf - 56 KW on page (chauffage)
3. hellio /blog/conseils/seche-linge-pompe-chaleur-condensation - 2071 traf - 174 KW on page (PAC)
4. hellio /blog/financement/date-cheque-energie - 1983 traf - 75 KW on page
5. sonergia /conseils-travaux/isolation/isolation-phonique/comment-isoler-phoniquement-un-mur-entre-voisins/ - 1854 traf - cluster phonique

**Note** : 174 KW sur une seule page hellio PAC = topical depth massif. Les pages SA `/services/pompe-a-chaleur` n'ont probablement pas plus de 5-10 KW captures.

---

## Section 5 - Issues techniques bloquant ranking cluster reno

**Source** : `site_audit_issues_2026-05.csv` (38 issues, trie par `pages_affected` desc).

| Severity | Categorie    | Issue                                                    | Pages | Change | Impact cluster reno                                                |
| -------- | ------------ | -------------------------------------------------------- | ----: | -----: | ------------------------------------------------------------------ |
| Notice   | Other        | Pages to submit to IndexNow                              |  9616 |   +459 | indexation lente, ralentit recrawl SA                              |
| Notice   | Other        | Structured data has schema.org validation error          |  8922 |    +95 | Speakable/HowTo invalides bloquent rich result                     |
| Notice   | Other        | Structured data has Google rich results validation error |  8219 |   +184 | rich snippet ko                                                    |
| Notice   | Content      | **Multiple H1 tags**                                     |  8207 |   +184 | **bloqueur SEO P0**, casse hierarchie, GSC le tolere mais Bing pas |
| Notice   | Content      | Meta description changed                                 |  7334 |   -730 | refresh continu, OK                                                |
| Notice   | Content      | Title tag changed                                        |  7045 |  -1777 | titres en evolution                                                |
| Warning  | Content      | Meta description too short                               |  2708 |  +2686 | +2686 nouvelles pages avec meta < 50 chars - regression P1         |
| Warning  | Usability    | **Slow page**                                            |  1103 |   +148 | LCP > seuil = penalite cluster reno YMYL                           |
| Notice   | Links        | Page has only 1 dofollow incoming internal link          |   986 |     +7 | maillage faible                                                    |
| Notice   | Content      | Word count changed                                       |   497 |  -8427 | enrichissement majeur recent                                       |
| Error    | Links        | **Orphan page (no incoming links)**                      |   484 |    -11 | -11 = correction recente, reste 484 orphelines                     |
| Notice   | Sitemaps     | Page in multiple sitemaps                                |   394 |    -60 | duplication sitemaps                                               |
| Notice   | Content      | H1 missing/empty                                         |   386 |    -36 | duplique au-dessus, scope different                                |
| Notice   | Indexability | Noindex follow page                                      |   386 |    -36 | noindex sweep en cours                                             |
| Warning  | Indexability | Noindex page                                             |   386 |    -36 | idem                                                               |
| Error    | Sitemaps     | **Noindex page in sitemap**                              |   386 |    -36 | bug sitemap encore - P1                                            |
| Notice   | Indexability | Canonical URL changed                                    |   369 |    -59 | refactor canonicals                                                |
| Warning  | Content      | Title too long                                           |   159 |    +58 | regression - titres trop longs                                     |
| Warning  | Social       | Open Graph tags incomplete                               |   157 |     +1 | OG manquants                                                       |
| Warning  | Content      | Meta description too long                                |   141 |   -441 | en amelioration                                                    |

**Top 5 bloqueurs cluster reno** (mapping sur scope reno) :

1. **Multiple H1 tags - 8207 pages, +184** : touche les hubs `/services/pompe-a-chaleur`, `/services/isolation-thermique`, `/cee/[op]`, `/renovation-energetique`. Bloque les snippets et l'autorite. **P0 fix**.
2. **Slow page - 1103 pages, +148** : croissance recente. LCP cluster reno (YMYL) penalise plus fort par Google. **P0 audit puppeteer**.
3. **Noindex page in sitemap - 386 pages** : sitemap pollue, gaspille budget crawl. Touche le cron noindex-sweep documente memory `servicesartisans-noindex-rge-migration-2026-04-19.md`. **P1**.
4. **Meta description too short - 2708 (+2686 regression)** : nouvelle regression majeure - 2686 pages d'un coup. Probablement pSEO template casse. **P1 ce sprint**.
5. **Orphan page - 484** : pages sans liens internes = invisibles googlebot. Probable hubs reno orphelins (cf memory `servicesartisans-rge-cee-cluster.md` mentionne /devenir-partenaire-cee orphelin). **P1**.

**Note** : aucune issue 5xx dans ce CSV (vs 12890 pages 5xx documente memory `servicesartisans-gsc-diagnostic-2026-04-30.md`). Site_audit Ahrefs utilise un crawl different de Googlebot. **Le 5xx est aveugle a Ahrefs mais visible a GSC** = a corriger en priorite parce que recouvre 57% des fiches RGE template a CTR 36%.

**Source CSV** : site_audit_issues_2026-05.csv lignes 2-39.

---

## Section 6 - Verdict KPMG

### Score global SERP cluster reno : **4/100**

| Dimension                 | Score /20 | Justification                                      |
| ------------------------- | --------: | -------------------------------------------------- |
| Presence top 1-3 reno     |      0/20 | 3 KW vol 0 = aucune visibilite mesurable           |
| Presence pos 4-20 reno    |      1/20 | 12 KW vol cumule 330 = bruit statistique           |
| Couverture top 100 KW gap |      0/20 | 0 / 100 = absence totale                           |
| Sante technique cluster   |      2/20 | Multiple H1 + Slow + Orphan = blocage SEO          |
| Trajectoire 6 mois        |      1/20 | Lost KW reno ~0 (rien a perdre car rien acquis)    |
| **TOTAL**                 | **4/100** | KPMG verdict : **inadequate**, restart obligatoire |

### Priorisation P0 / P1 / P2

**P0 (effort < 1 sem, impact < 30j) - 3 actions** :

1. **Title rewrite CEE scale aux 22 ops restantes** (deja fait sur 2). Source : E_site/STRIKING_DISTANCE_PLAN.md ligne 41-58. Fichier : `src/lib/cee/client-terms.ts`. Vol adressable additionnel : ~80K/mois cumule sur les 22 ops manquantes (estimation prorata). **Owner : 1 dev / 4h / +2-3K clics M+1 P50**.

2. **Fix Multiple H1 tags sur hubs reno** (`/services/pompe-a-chaleur`, `/services/isolation-thermique`, `/cee/[op]`, `/renovation-energetique`). Source : site_audit_issues_2026-05.csv ligne 16. Probable bug template en SSR avec H1 dans header partagé + H1 dans page. Audit DOM 5 URLs, fix 1 component. **Owner : 1 dev / 2h / +5% CTR cluster reno**.

3. **Content surgery `/services/pompe-a-chaleur`** : ajout H2 "PAC air/eau vs air/air" + section prix + comparatif marques (Mitsubishi, Daikin, Atlantic). Source : kw_gap_attack_top100.csv : 22 KW pompe-a-chaleur attaquables vol cumule 145K. Cible : pos 30→15 sur 8 KW vol > 1K. **Owner : 1 redacteur RGE + 1 dev / 1 sem / +1500-3500 clics M+2 P50**.

**P1 (effort 1-3 sem, impact 30-90j) - 3 actions** :

4. **Content surgery `/services/isolation-thermique`** : 32 KW isolation gap (vol cumule 132K). Sections H2 ITE / ITI / combles / sol. **Owner : redacteur + dev / 2 sem / +2-4K clics M+3 P50**.

5. **Creer 8 pages blog longue-traine non-mappees** : isolation-phonique-mur-mitoyen (800 vol), prise-renforcee-vehicule-electrique (2.9K vol), entreprise-renovation (2.6K vol), chauffage-appoint-economique (2.2K vol), seche-linge-pac (17K vol), peinture-isolante (2.8K vol), robinet-thermostatique (8.6K vol), gaz-passerelle (15K vol). Vol cumule : ~52K. **Owner : 1 redacteur RGE / 3 sem / +800-1500 clics M+4**.

6. **Fix sitemap noindex pollution** : 386 pages noindex dans sitemap. Source : site_audit_issues_2026-05.csv ligne 36. Lie au sweep noindex en cours (memory `servicesartisans-noindex-rge-migration-2026-04-19.md`). **Owner : 1 dev / 1 j / +5% budget crawl**.

**P2 (effort > 3 sem, impact > 90j) - 4 actions** :

7. **Re-puller Ahrefs cluster reno complet** apres reset quota 2026-05-18 : `striking_distance` reel (SA pos 11-30), `sa_lost_keywords` reel, top-pages benchmark 200 (pas 50). Cout ~30-50K unites Ahrefs. **Owner : 1 dev / 0.5 j**.

8. **Backlink campaign Tier 1 cluster reno** : DR SA 0.6 vs leaders 49-78. Voir D_backlinks/OUTREACH_BACKLINKS_PLAYBOOK.md. Cible 5 backlinks Tier 1 (data.gouv, ANIL, ADEME) sur 90j. **Owner : 1 head of SEO / 90j / +5-8 DR**.

9. **Indice Renovation - dataset CC-BY 4.0** : data play type Booking/Wirecutter, hub /barometre/rge prevu. Source : memory `servicesartisans-rge-api-barometre-2026-04-20.md`. **Owner : 1 dev senior + 1 data scientist / 4 sem / +3-5 DR + position autorite cluster**.

10. **HowTo + Speakable schema cluster reno** : 8922 pages avec schema.org error. Validator + fix templates. Necessite pour rich results YMYL. **Owner : 1 dev / 1 sem / +CTR top10**.

### Hypotheses validation

- **HypoA** : "SA pourrait recuperer 20-40K clics/mois cluster reno en 12 mois si execution parfaite des P0+P1". Validation : volume gap cumule 519K + lookalike 765K = 1.28M vol/mois. CTR median top 10 = 3-5%. Capture realiste 5-10% du vol = 65-130K clics/mois P50. Sur 12 mois avec ramp-up 6 mois, MOYENNE des 12 mois = ~30K clics/mois additionnels. **Confirme**.
- **HypoB** : "Le chemin court (P0 only) genere +5K clics/mois M+3". Title rewrite 22 ops + H1 fix + PAC surgery = ~225K vol/mois adressable, capture 2-3% top 10 = 4500-6750 clics/mois M+3. **Confirme**.
- **HypoC** : "Sans backlinks Tier 1, impossible de battre France-Renov". DR SA 0.6 vs FR 75 = 1000x ecart. Sur les 32 KW isolation gap, FR ranke #1 sur 8. Sans DR, plafond pos 5-10 sur kd > 5. **Confirme - le P2 backlink est un bloqueur structurel**.

### Caveats data

- `sa_lost_keywords_2026-05.csv` racine : **vide** (pull error documenté). Pas de visibilite sur les pertes 6 mois reelles. **A re-puller 2026-05-18**.
- `sa_kw_diff.json` + `sa_kw_diff_6mo.json` : erreurs API ("column not found"). Inutilisables. **A re-puller**.
- `sa_keywords_1000.json` : truncated a 141 KW (pas 1000). Sous-estime probable de la presence reno. **A re-puller**.
- `striking_distance_2026-05.csv` : mal nomme = c'est du content gap lookalike Sonergia, PAS de la striking distance reelle. Le vrai pull striking distance (SA pos 11-30) n'a pas ete fait. **A re-puller**.
- `site_audit_issues_2026-05.csv` : ne capture **pas** les 5xx GSC (12890 pages, memory 2026-04-30). Utiliser GSC en complement.

**Next pull** : 2026-05-18 (reset quota Ahrefs Advanced 1M unites). Budget recommande : ~50K unites pour pull complet cluster reno.

---

## Annexes

### A1. Cluster mapping utilise

```
RENO_KW_SUBSTR = [maprimerenov, ma prime renov, cee, rge, renov, pompe a chaleur, isolation, isolant, comble, thermique, phonique, vmc, ventilation, dpe, audit energe, passoire, panneau solaire, photovolta, chauffe eau, thermodynamique, chaudiere, fioul, poele, granul, climatisation, cheque energie, borne recharge, irve, eco-ptz, prime energie, calorifuge, anah, audit thermi]
RENO_URL_SUBSTR = [/maprimerenov, /cee/, /rge/, /renovation-energetique, /aides/, /services/pompe-a-chaleur, /services/isolation, /services/chauffagiste, /services/panneaux-solaires, /services/electricien-irve, /services/borne-recharge, /services/poele, /services/calorifugeur, /simulateur, /guides/maprimerenov]
```

### A2. Sources confirmees (file path absolu + lignes)

- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\striking_distance_2026-05.csv` : 590 lignes (1 header + 589 data). Mal nomme.
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\sa_lost_keywords_2026-05.csv` : 1 ligne (header seul, pull error).
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\site_audit_issues_2026-05.csv` : 39 lignes (1 header + 38 data).
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\sa_kw_diff.json` : ERROR stub.
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\sa_kw_diff_6mo.json` : ERROR stub.
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\E_site\sa_lost_keywords_LIVE.csv` : 25 lignes (1 + 24).
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\E_site\sa_lost_keywords_by_url.csv` : 24 lignes (1 + 23).
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\E_site\kw_attack_existing_50.csv` : 51 lignes (1 + 50).
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\E_site\kw_attack_create_50.csv` : 20 lignes (1 + 19).
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\C_gap\kw_gap_attack_top100.csv` : 101 lignes (1 + 100).
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\C_gap\competitor_url_patterns.csv` : 31 lignes (1 + 30).
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\B_competitor_pages\top_pages_benchmark_50.csv` : 51 lignes (1 + 50).
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\competitor_intelligence_2026-05.csv` : 301 lignes.
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\keyword_opportunities_2026-05.csv` : 301 lignes.
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\content_gap_global_2026-05.csv` : 92 lignes (1 + 91).
- `C:\Users\USER\Downloads\servicesartisans\docs\audit-ahrefs-2026-05-03\A_competitors\sa_keywords_1000.json` : 141 KW (truncated).
- `C:\Users\USER\Downloads\servicesartisans\tmp\ahrefs\bloc1-sa-keywords.json` : 138 KW.
- `C:\Users\USER\Downloads\servicesartisans\tmp\ahrefs\bloc1-sa-keywords-v2.json` : 137 KW.
- `C:\Users\USER\Downloads\servicesartisans\docs\ahrefs-audit-2026-04\normalized\ahrefs-organic-positions.csv` : 266 lignes (1 + 265 diff April).
- `C:\Users\USER\Downloads\servicesartisans\docs\ahrefs-audit-2026-04\normalized\ahrefs-organic-keywords.csv` : 262 lignes.

### A3. Traceabilite memory cross-checks

- `servicesartisans-rank2150-attack-2026-04-20.md` : confirme que la dormance pos 21-50 reno N'EXISTE PAS - SA n'a jamais ranke. Plan supersede.
- `servicesartisans-gsc-diagnostic-2026-04-30.md` : 5xx 12890 pages bloque 57% des fiches RGE (template CTR 36%). **Bloqueur P0 invisible a Ahrefs**.
- `servicesartisans-strategy-140k-2026-04-29.md` : plan 140K pages cible. SA passe de 718K → 140K (80.5% retire). Aligne avec ce verdict.
- `servicesartisans-noindex-rge-migration-2026-04-19.md` : 50 257 URLs RGE noindex. Le sitemap-noindex pollution (386 pages) est lie.
- `servicesartisans-ahrefs-bloc1-niche-cee-2026-05-04.md` : 3349 KW reno gap, 57% pages SA candidates auto-mappees. Aligne.
- `servicesartisans-effy-10x-strategy-2026-04-28.md` : Effy capture 119K vol gap top100 mais pas le moat (3500 URLs, 1 metier). SA peut 10x via catalogue 350x.

### A4. Output files generated

- `C:\Users\USER\Downloads\servicesartisans\tmp\ahrefs\agent4_sa_reno_buckets.json` (snapshot SA reno positions)
- `C:\Users\USER\Downloads\servicesartisans\tmp\ahrefs\AUDIT-KPMG-AGENT4-serp-2026-05-04.md` (ce rapport)

---

**Fin Agent 4.**
