# Liste blanche — Filet de sécurité G3

**Généré 2026-04-30** depuis GSC export 90j (29-01 → 28-04). Top 1000 pages.

## Règle

Pour chaque URL candidate aux vagues V1–V2 du plan 140K :

```
IF (clics_GSC_90j ≥ 1) OR (impressions_GSC_90j ≥ 100)
THEN EXCLURE de la purge (whitelist)
```

Seuil impressions retenu : **100 / 90j** (prudent, recommandé).
Le plan v1 mentionne « ≥100 imp 28j » — équivalent ≈ 322 imp / 90j. On garde la version prudente pour limiter la perte de signaux faibles.

## Synthèse

- URLs whitelistées (top 1000 GSC) : **885**
- Clics 90j préservés : **2 447**
- Impressions 90j préservées : **25 839**

⚠️ **Limite de l'export Numbers** : top 1000 pages uniquement.
Les URLs avec 1-3 clics rares hors top 1000 ne sont pas couvertes ici.
**Action complémentaire** : exporter GSC Pages CSV non tronqué (16 mois) avant V1 J+3 pour couverture complète.

## Détail par template (templates ciblés par vagues V1–V2)

| Template                 | URLs whitelist | Clics 90j | Imp 90j | Vague concernée            |
| ------------------------ | -------------: | --------: | ------: | -------------------------- |
| `/avis/*`                |              1 |         2 |      24 | V1 J+15 — NOINDEX          |
| `/avis/[s]/[v]`          |             28 |        72 |     624 | V1 J+15 — NOINDEX          |
| `/devis/[s]`             |              0 |         0 |       0 | V1 J+5 — 301               |
| `/devis/[s]/[v]`         |              3 |         9 |      44 | V1 J+5 — 301               |
| `/problemes/*`           |              2 |         5 |      25 | V2 J+50 — 301 hors top 10K |
| `/services/[s]/[v]`      |            714 |     2 026 |  19 158 | V2 J+45 — 301 hors-tiered  |
| `/tarifs/[s]/[v]`        |             34 |        90 |   2 362 | V1 J+10 — 301              |
| `/tarifs/[s]/[v]/[task]` |            100 |       236 |   3 545 | V1 J+3 — DELETE 410        |
| `/urgence/[s]`           |              0 |         0 |       0 | V2 J+40 — 301              |
| `/urgence/[s]/[v]`       |              3 |         7 |      57 | V2 J+40 — 301              |

### `/avis/*` — 1 URL(s) à exclure

| URL     | Clics | Imp |   CTR | Pos |
| ------- | ----: | --: | ----: | --: |
| `/avis` |     2 |  24 | 8.33% | 6.1 |

### `/avis/[s]/[v]` — 28 URL(s) à exclure

| URL                                    | Clics | Imp |    CTR |  Pos |
| -------------------------------------- | ----: | --: | -----: | ---: |
| `/avis/demenageur/grenoble`            |     5 |  35 | 14.29% | 29.2 |
| `/avis/couvreur/ploufragan`            |     5 |   8 | 62.50% |  7.9 |
| `/avis/vitrier/noumea`                 |     3 |  56 |  5.36% | 10.0 |
| `/avis/plombier/papeete`               |     3 |  42 |  7.14% |  8.9 |
| `/avis/couvreur/clermont-ferrand`      |     3 |  33 |  9.09% | 49.4 |
| `/avis/geometre/baie-mahault`          |     3 |  21 | 14.29% |  6.1 |
| `/avis/serrurier/saint-joseph`         |     3 |  19 | 15.79% |  4.8 |
| `/avis/deratisation/angouleme`         |     3 |  17 | 17.65% | 22.7 |
| `/avis/demenageur/la-ferte-mace`       |     3 |  10 | 30.00% | 20.0 |
| `/avis/antenniste/saint-jean-d-angely` |     3 |   7 | 42.86% |  3.4 |
| `/avis/carreleur/schiltigheim`         |     3 |   6 | 50.00% |  3.8 |
| `/avis/geometre/dunkerque`             |     3 |   6 | 50.00% | 10.7 |
| `/avis/electricien/cambrai`            |     2 |  48 |  4.17% | 22.8 |
| `/avis/carreleur/senlis`               |     2 |  44 |  4.55% |  6.1 |
| `/avis/cuisiniste/noumea`              |     2 |  36 |  5.56% | 11.9 |
| `/avis/salle-de-bain/clermont-ferrand` |     2 |  34 |  5.88% | 56.2 |
| `/avis/zingueur/beziers`               |     2 |  30 |  6.67% | 33.7 |
| `/avis/plombier/joue-les-tours`        |     2 |  30 |  6.67% | 50.6 |
| `/avis/peintre-en-batiment/royan`      |     2 |  24 |  8.33% | 40.0 |
| `/avis/serrurier/nyons`                |     2 |  16 | 12.50% | 25.4 |
| `/avis/climaticien/noumea`             |     2 |  14 | 14.29% |  6.4 |
| `/avis/geometre/montreuil`             |     2 |  14 | 14.29% | 10.3 |
| `/avis/deratisation/castres`           |     2 |  14 | 14.29% | 16.7 |
| `/avis/electricien/landerneau`         |     2 |  14 | 14.29% | 19.1 |
| `/avis/geometre/albi`                  |     2 |  13 | 15.38% | 25.3 |
| `/avis/decorateur/nice`                |     2 |  12 | 16.67% | 37.5 |
| `/avis/geometre/aubagne`               |     2 |  11 | 18.18% | 20.7 |
| `/avis/carreleur/limoges`              |     2 |  10 | 20.00% |  6.8 |

### `/devis/[s]/[v]` — 3 URL(s) à exclure

| URL                                         | Clics | Imp |    CTR |  Pos |
| ------------------------------------------- | ----: | --: | -----: | ---: |
| `/devis/deratisation/toul/centre-ville`     |     4 |  15 | 26.67% |  5.3 |
| `/devis/demenageur/riviere-pilote/le-marin` |     3 |  12 | 25.00% |  4.2 |
| `/devis/demenageur/plerin/saint-brieuc`     |     2 |  17 | 11.76% | 29.8 |

### `/problemes/*` — 2 URL(s) à exclure

| URL                                      | Clics | Imp |    CTR |  Pos |
| ---------------------------------------- | ----: | --: | -----: | ---: |
| `/problemes/interphone-panne/echirolles` |     3 |  15 | 20.00% |  6.2 |
| `/problemes/fuite-eau/tarnos`            |     2 |  10 | 20.00% | 15.0 |

### `/services/[s]/[v]` — 714 URL(s) à exclure

| URL                                                                                                                          | Clics |  Imp |     CTR |  Pos |
| ---------------------------------------------------------------------------------------------------------------------------- | ----: | ---: | ------: | ---: |
| `/services/couvreur/cagnes-sur-mer/mark-mitri-marc-couverture-et-toiture-989179890`                                          |    14 |   24 |  58.33% |  3.9 |
| `/services/chauffagiste/vesoul/chaleur-boreale-100475730`                                                                    |    11 |   46 |  23.91% |  2.7 |
| `/services/plombier/la-villedieu-du-clain/sylvain-blanchard-992592121`                                                       |    11 |   45 |  24.44% |  6.8 |
| `/services/charpentier/bouc-bel-air/ddd84300c9cbaa5c`                                                                        |    10 |   65 |  15.38% |  2.8 |
| `/services/menuisier/lorient/yann-maillot-881013510`                                                                         |    10 |   18 |  55.56% |  3.5 |
| `/services/solier/forbach/deny-lehmann-828651638`                                                                            |    10 |   13 |  76.92% |  5.4 |
| `/services/jardinier/punaauia`                                                                                               |     9 |  137 |   6.57% |  5.3 |
| `/services/carreleur/marseille/mohammad-hadi-rasooli-jumadi-891132466`                                                       |     9 |   10 |  90.00% |  4.0 |
| `/services/carreleur/auriol/julien-brun-picarreaux-881774210`                                                                |     8 |   24 |  33.33% |  1.7 |
| `/services/peintre-en-batiment/nice/0c5dad4e5a608529`                                                                        |     8 |    9 |  88.89% |  1.1 |
| `/services/plombier/saint-dizier/brandon-marx-marx-marx-plomberie-et-depannage-932572118`                                    |     7 |  143 |   4.90% |  3.4 |
| `/services/terrassier/villers-le-lac/laurent-lapprand-524430212`                                                             |     7 |   59 |  11.86% |  4.7 |
| `/services/electricien/grasse/z-elec-concept-800947079`                                                                      |     7 |   42 |  16.67% |  5.7 |
| `/services/electricien/urrugne/sebastien-miura-949242697`                                                                    |     7 |   17 |  41.18% |  3.6 |
| `/services/plombier/matoury/richard-sellali-r-d-plomberie-973-989640883`                                                     |     7 |   14 |  50.00% |  3.1 |
| `/services/macon/cagnes-sur-mer/c72ca08250e4a988`                                                                            |     7 |   10 |  70.00% |  5.2 |
| `/services/macon/auxonne`                                                                                                    |     6 |   76 |   7.89% | 12.9 |
| `/services/plombier/bezons/etablissement-gaillard-999085459`                                                                 |     6 |   68 |   8.82% | 12.2 |
| `/services/couvreur/le-haillan/ea67e7f8ca45a656`                                                                             |     6 |   52 |  11.54% |  4.1 |
| `/services/peintre-en-batiment/tregueux/elodie-le-breton-elodie-le-breton-880247093`                                         |     6 |   40 |  15.00% |  3.6 |
| `/services/solier/chateau-gontier-sur-mayenne/djino-delorme-delorme-902302504`                                               |     6 |   22 |  27.27% |  2.8 |
| `/services/plombier/queven/nicolas-martinez-mz-plomberie-chauffage-830520078`                                                |     6 |   18 |  33.33% |  3.8 |
| `/services/decorateur/nice/4450e8bfce1466d2`                                                                                 |     6 |   17 |  35.29% | 15.0 |
| `/services/plombier/ploubazlanec/mathieu-peltier-852590579`                                                                  |     6 |   16 |  37.50% |  3.2 |
| `/services/couvreur/nice/jacky-zemouri-couvrazur-st-gerand-toiture-408499291`                                                |     6 |   16 |  37.50% |  8.6 |
| `/services/charpentier/parempuyre/dawson-deplace-france-renov-toiture-992215756`                                             |     5 |   91 |   5.49% |  5.3 |
| `/services/plombier/brest`                                                                                                   |     5 |   88 |   5.68% | 12.6 |
| `/services/peintre-en-batiment/cholet`                                                                                       |     5 |   88 |   5.68% | 26.7 |
| `/services/plombier/villeurbanne/mea-multiservices-943524736`                                                                |     5 |   68 |   7.35% |  7.3 |
| `/services/menuisier/sevremoine/saint-christophe-du-bois`                                                                    |     5 |   66 |   7.58% |  6.7 |
| `/services/couvreur/aix-en-provence`                                                                                         |     5 |   65 |   7.69% |  8.8 |
| `/services/plombier/la-ravoire/abad0612179f91c6`                                                                             |     5 |   52 |   9.62% |  5.4 |
| `/services/peintre-en-batiment/billere`                                                                                      |     5 |   51 |   9.80% | 13.7 |
| `/services/charpentier/bergerac/david-fouilleul-883361263`                                                                   |     5 |   38 |  13.16% |  4.9 |
| `/services/plombier/lys-lez-lannoy/francois-hellin-a-l-energies-903213098`                                                   |     5 |   34 |  14.71% |  7.0 |
| `/services/menuisier/anglet/1c5698bdc870b2fb`                                                                                |     5 |   21 |  23.81% |  3.6 |
| `/services/carreleur/villefranche-d-albigeois/alain-reynes-occitanie-carrelage-379998511`                                    |     5 |   21 |  23.81% | 10.7 |
| `/services/plombier/saint-mande/patrice-dubois-504151978`                                                                    |     5 |   20 |  25.00% |  4.9 |
| `/services/climaticien/la-chapelle-saint-ursin/vincent-ballaire-my-climat-813791282`                                         |     5 |   19 |  26.32% |  2.7 |
| `/services/geometre/sada`                                                                                                    |     5 |   19 |  26.32% |  5.7 |
| `/services/plombier/chaumont/loic-maubert-lm-plomberie-891433468`                                                            |     5 |   15 |  33.33% |  4.3 |
| `/services/couvreur/gond-pontouvre/joseph-cassagrand-c-a-s-renovation-940956832`                                             |     5 |   15 |  33.33% |  5.4 |
| `/services/architecte-interieur/milly-la-foret/laura-pillis-932151244`                                                       |     5 |   14 |  35.71% |  4.4 |
| `/services/electricien/fourques/anthony-trouchaud-ninho-elec-798254793`                                                      |     5 |   14 |  35.71% |  6.1 |
| `/services/plombier/bedarrides/0e61f7b480dacded`                                                                             |     5 |   13 |  38.46% |  4.9 |
| `/services/solier/faches-thumesnil/kevin-beaunat-kb-renovation-983656380`                                                    |     5 |   12 |  41.67% |  9.8 |
| `/services/peintre-en-batiment/luneville/dominique-cligny-348753997`                                                         |     5 |   10 |  50.00% |  4.0 |
| `/services/electricien/ceret/jean-michel-vicens-448531343`                                                                   |     5 |   10 |  50.00% |  4.3 |
| `/services/isolation-thermique/montlucon/mario-de-ponte-mario-2-ponte-892482324`                                             |     4 |  179 |   2.23% |  7.9 |
| `/services/plombier/athis-mons`                                                                                              |     4 |  155 |   2.58% | 23.7 |
| `/services/peintre-en-batiment/vitrolles/centre-ville`                                                                       |     4 |   79 |   5.06% |  6.0 |
| `/services/geometre/saint-baldoph/rene-orset-333298693`                                                                      |     4 |   68 |   5.88% |  6.6 |
| `/services/plombier/orleans`                                                                                                 |     4 |   64 |   6.25% | 29.2 |
| `/services/peintre-en-batiment/le-pont-de-claix/seyssins`                                                                    |     4 |   63 |   6.35% |  4.5 |
| `/services/peintre-en-batiment/montauban`                                                                                    |     4 |   61 |   6.56% | 39.9 |
| `/services/macon/brive-la-gaillarde/f41515c0983abb34`                                                                        |     4 |   58 |   6.90% |  9.2 |
| `/services/carreleur/bruguieres/maison-grenaux-992065466`                                                                    |     4 |   54 |   7.41% |  3.9 |
| `/services/terrassier/draguignan/centre-ville`                                                                               |     4 |   54 |   7.41% |  4.9 |
| `/services/electricien/valenton/adama-niakate-niakate-cfa-cfo-994945517`                                                     |     4 |   41 |   9.76% |  3.1 |
| `/services/menuisier/saint-priest/centre-ville`                                                                              |     4 |   41 |   9.76% | 18.3 |
| `/services/plombier/chambery`                                                                                                |     4 |   39 |  10.26% | 15.6 |
| `/services/electricien/le-raincy/artisan-electricien-claude`                                                                 |     4 |   38 |  10.53% |  1.8 |
| `/services/peintre-en-batiment/gerzat/bertrand-poinas-518009477`                                                             |     4 |   36 |  11.11% |  4.4 |
| `/services/carreleur/forcalquier/claude-freani-378093645`                                                                    |     4 |   36 |  11.11% |  5.8 |
| `/services/electricien/nice`                                                                                                 |     4 |   34 |  11.76% |  6.1 |
| `/services/peintre-en-batiment/angers/1b8cb841e53f5c17`                                                                      |     4 |   32 |  12.50% |  4.4 |
| `/services/menuisier/ouistreham`                                                                                             |     4 |   29 |  13.79% |  9.3 |
| `/services/macon/sanary-sur-mer/73922dd3dd2adb6c`                                                                            |     4 |   29 |  13.79% | 30.1 |
| `/services/macon/saint-chamond/la-grand-croix`                                                                               |     4 |   28 |  14.29% |  7.7 |
| `/services/terrassier/montastruc-la-conseillere/denis-bayssieres-390494540`                                                  |     4 |   28 |  14.29% | 13.5 |
| `/services/architecte-interieur/villiers-sur-orge/jean-luc-serra-498649920`                                                  |     4 |   28 |  14.29% | 33.7 |
| `/services/menuisier/merignac`                                                                                               |     4 |   26 |  15.38% |  6.0 |
| `/services/electricien/barlin/sebastien-gosse-s-a-2-j-electricite-942207226`                                                 |     4 |   25 |  16.00% |  3.7 |
| `/services/macon/cornebarrieu/0d73fb302d7dd4aa`                                                                              |     4 |   25 |  16.00% |  3.7 |
| `/services/carreleur/saint-gregoire/ewen-le-quellec-roazhon-carrelage-983079427`                                             |     4 |   25 |  16.00% | 10.8 |
| `/services/solier/paris/gheorghe-ionut-hoban-885079673`                                                                      |     4 |   24 |  16.67% |  3.1 |
| `/services/couvreur/fabregues/tolmos-toitures-993456540`                                                                     |     4 |   24 |  16.67% |  3.9 |
| `/services/couvreur/reze/aa176deed1bd893e`                                                                                   |     4 |   24 |  16.67% |  5.5 |
| `/services/couvreur/dijon/jonathan-castagna-jc-couverture-481652741`                                                         |     4 |   24 |  16.67% |  6.5 |
| `/services/plombier/villers-cotterets/brhservices-939249421`                                                                 |     4 |   24 |  16.67% | 12.0 |
| `/services/peintre-en-batiment/wingles/f49f98a671d2dd77`                                                                     |     4 |   23 |  17.39% |  3.0 |
| `/services/electricien/la-farlede/la-valette-du-var`                                                                         |     4 |   23 |  17.39% |  8.3 |
| `/services/peintre-en-batiment/les-clayes-sous-bois/trappes`                                                                 |     4 |   22 |  18.18% |  9.1 |
| `/services/solier/drancy/william-even-520530536`                                                                             |     4 |   22 |  18.18% |  9.4 |
| `/services/macon/bordeaux/kimbel-metbach-les-compagnons-bordelais-990704090`                                                 |     4 |   21 |  19.05% |  4.9 |
| `/services/jardinier/le-robert`                                                                                              |     4 |   21 |  19.05% |  6.3 |
| `/services/chauffagiste/hericourt/2c9cf2d334834b7e`                                                                          |     4 |   19 |  21.05% |  8.3 |
| `/services/carreleur/bar-le-duc/alexis-datry-a-d-carrelage-942786765`                                                        |     4 |   18 |  22.22% |  3.5 |
| `/services/climaticien/bastia/profroid-distribution-994998292`                                                               |     4 |   18 |  22.22% |  4.1 |
| `/services/couvreur/pont-sainte-maxence/f8730213a98c01b9`                                                                    |     4 |   18 |  22.22% |  4.9 |
| `/services/couvreur/rainvillers/arnaud-bolle-arnaud-bolle-couverture-a-b-c-809943541`                                        |     4 |   18 |  22.22% |  7.0 |
| `/services/carreleur/lorient/7cb1df724362db5d`                                                                               |     4 |   17 |  23.53% |  4.4 |
| `/services/couvreur/barentin/9c2bc4903721271a`                                                                               |     4 |   17 |  23.53% |  6.3 |
| `/services/electricien/paray-vieille-poste`                                                                                  |     4 |   17 |  23.53% |  7.9 |
| `/services/couvreur/change-53/amg-toiture-992831487`                                                                         |     4 |   17 |  23.53% |  9.3 |
| `/services/menuisier/le-monetier-les-bains/gregoire-sangnier-atelier-1550-334788338`                                         |     4 |   16 |  25.00% |  4.4 |
| `/services/chauffagiste/rueil-malmaison/igts-ibrahima-gandega-thermique-sanitaire-949327977`                                 |     4 |   16 |  25.00% |  5.9 |
| `/services/peintre-en-batiment/longwy/kevin-damar-dtk-renovation-construction-834842114`                                     |     4 |   15 |  26.67% |  4.9 |
| `/services/solier/caves/frederic-lescot-gmp-multiservices-947995437`                                                         |     4 |   15 |  26.67% |  6.1 |
| `/services/facadier/thiers/maringues`                                                                                        |     4 |   15 |  26.67% |  6.9 |
| `/services/architecte-interieur/saint-martin-d-heres/gieres`                                                                 |     4 |   14 |  28.57% |  4.2 |
| `/services/plombier/la-seyne-sur-mer/cyril-tarditi-523770832`                                                                |     4 |   14 |  28.57% |  7.5 |
| `/services/plombier/la-couronne/thomas-brunaud-s2t-820864171`                                                                |     4 |   14 |  28.57% |  7.8 |
| `/services/geometre/dembeni/sada`                                                                                            |     4 |   13 |  30.77% |  5.4 |
| `/services/chauffagiste/perpignan/54a8b957153e0819`                                                                          |     4 |   12 |  33.33% |  1.8 |
| `/services/solier/saint-aubin-de-lanquais/jerome-melon-melon-mj-renov-929528164`                                             |     4 |   12 |  33.33% |  3.1 |
| `/services/chauffagiste/sollies-pont/romain-nicolas-nr-confort-83-943905463`                                                 |     4 |   12 |  33.33% |  4.2 |
| `/services/plombier/roquemaure/0264f3d90d92747e`                                                                             |     4 |   12 |  33.33% |  4.3 |
| `/services/peintre-en-batiment/douvres-la-delivrande/thomas-asselin-clj-services-833294531`                                  |     4 |   12 |  33.33% |  5.5 |
| `/services/couvreur/meudon/stephane-falck-stephane-falck-couverture-444389548`                                               |     4 |   12 |  33.33% | 13.2 |
| `/services/etancheiste/montoir-de-bretagne`                                                                                  |     4 |   12 |  33.33% | 18.2 |
| `/services/electricien/neuilly-plaisance`                                                                                    |     4 |   11 |  36.36% |  7.8 |
| `/services/plombier/quimper/samuel-nicolas-npqc-999578156`                                                                   |     4 |   10 |  40.00% |  2.1 |
| `/services/plombier/les-deserts/julien-chaffardon-chaff-plomberie-climatisation-914467543`                                   |     4 |   10 |  40.00% |  2.7 |
| `/services/electricien/cucq/romain-manet-man-elec-994654978`                                                                 |     4 |   10 |  40.00% |  3.5 |
| `/services/electricien/chateauneuf-du-rhone/dominique-piegay-400796033`                                                      |     4 |   10 |  40.00% |  7.8 |
| `/services/plombier/pornic/christophe-le-disez-837705615`                                                                    |     4 |    9 |  44.44% |  2.1 |
| `/services/serrurier/troyes/jean-michel-lemeur-jml-service-942698291`                                                        |     4 |    9 |  44.44% |  2.3 |
| `/services/metallier/montberaud/mickael-abba-steel-art-design-soudure-992520650`                                             |     4 |    8 |  50.00% |  1.9 |
| `/services/electricien/pornic/guillaume-porcher-990147548`                                                                   |     4 |    8 |  50.00% |  3.4 |
| `/services/macon/embrun/gl-btp-100348317`                                                                                    |     4 |    8 |  50.00% |  3.9 |
| `/services/peintre-en-batiment/cusset/3d588bff84325cea`                                                                      |     4 |    8 |  50.00% |  5.2 |
| `/services/solier/bauvin/david-fernandez-fd-renov-488268277`                                                                 |     4 |    7 |  57.14% |  2.3 |
| `/services/macon/la-seyne-sur-mer/jean-cortes-j-c-renov-523864270`                                                           |     4 |    7 |  57.14% |  4.1 |
| `/services/macon/montussan/nicolas-brito-z-e-n-949083760`                                                                    |     4 |    6 |  66.67% |  2.5 |
| `/services/solier/givors/samir-gahaz-935157073`                                                                              |     4 |    6 |  66.67% |  5.2 |
| `/services/solier/gleize/abderrahmane-ghellab-ag-amenagement-917770828`                                                      |     4 |    6 |  66.67% |  5.3 |
| `/services/solier/villeurbanne/estelle-halimi-habermann-984570150`                                                           |     4 |    5 |  80.00% |  1.6 |
| `/services/menuisier/manosque/julien-louis-roc-habitat-931272546`                                                            |     4 |    5 |  80.00% |  2.2 |
| `/services/peintre-en-batiment/le-havre/f8e72b9bc77dfbd6`                                                                    |     4 |    5 |  80.00% |  2.4 |
| `/services/electricien/soissons/bernard-manesse-429307721`                                                                   |     4 |    5 |  80.00% |  3.8 |
| `/services/plombier/villeparisis/jonathan-marchand-ejm-521424705`                                                            |     4 |    4 | 100.00% |  2.0 |
| `/services/plombier/marseille`                                                                                               |     3 | 1148 |   0.26% | 45.2 |
| `/services/peintre-en-batiment/les-sables-d-olonne/l-ile-d-olonne`                                                           |     3 |  132 |   2.27% | 12.4 |
| `/services/carreleur/saint-priest/menival`                                                                                   |     3 |   96 |   3.12% |  7.9 |
| `/services/macon/macon`                                                                                                      |     3 |   91 |   3.30% | 32.1 |
| `/services/plombier/antibes`                                                                                                 |     3 |   87 |   3.45% |  7.1 |
| `/services/chauffagiste/thionville/gazeo-depannage-gazeo-depannage-813746633`                                                |     3 |   87 |   3.45% |  8.3 |
| `/services/couvreur/vanves/les-couvreurs-d-elite-983449554`                                                                  |     3 |   83 |   3.61% |  6.2 |
| `/services/peintre-en-batiment/boulazac-isle-manoire`                                                                        |     3 |   67 |   4.48% | 10.8 |
| `/services/electricien/miribel/sarl-trebelec-429785165`                                                                      |     3 |   63 |   4.76% |  9.4 |
| `/services/peintre-en-batiment/la-ciotat`                                                                                    |     3 |   61 |   4.92% | 27.4 |
| `/services/couvreur/colombes`                                                                                                |     3 |   59 |   5.08% |  6.5 |
| `/services/desinsectisation/bernac/gaetan-sourisseau-charente-guepes-frelons-751848326`                                      |     3 |   57 |   5.26% |  7.2 |
| `/services/plombier/roissy-en-brie/kevin-senekerimian-etablissement-ksp-842875239`                                           |     3 |   57 |   5.26% | 10.1 |
| `/services/paysagiste/cayenne/macouria`                                                                                      |     3 |   56 |   5.36% |  8.7 |
| `/services/electricien/tourcoing/030e152f63cb8a09`                                                                           |     3 |   53 |   5.66% |  6.6 |
| `/services/peintre-en-batiment/pont-du-chateau/0a20151573a18a68`                                                             |     3 |   51 |   5.88% |  9.4 |
| `/services/couvreur/orleans`                                                                                                 |     3 |   48 |   6.25% |  7.4 |
| `/services/macon/saint-malo`                                                                                                 |     3 |   47 |   6.38% | 13.4 |
| `/services/chauffagiste/annecy/cyprien-benois-cyp-climatisation-chauffage-943522813`                                         |     3 |   46 |   6.52% |  4.5 |
| `/services/couvreur/bergerac/david-jayat-technique-toit-facade-805316072`                                                    |     3 |   46 |   6.52% |  5.6 |
| `/services/platrier/dijon`                                                                                                   |     3 |   46 |   6.52% | 29.0 |
| `/services/geometre/chalette-sur-loing/montargis`                                                                            |     3 |   45 |   6.67% |  6.8 |
| `/services/chauffagiste/baie-mahault/6a44cf44fdc17dcd`                                                                       |     3 |   45 |   6.67% |  7.5 |
| `/services/chauffagiste/sarcelles/rs-ecologie-rs-ecologie-921653069`                                                         |     3 |   44 |   6.82% |  6.8 |
| `/services/macon/saint-joseph/saint-philippe`                                                                                |     3 |   44 |   6.82% |  7.4 |
| `/services/electricien/arras`                                                                                                |     3 |   43 |   6.98% | 11.8 |
| `/services/platrier/metz/queuleu`                                                                                            |     3 |   42 |   7.14% |  5.3 |
| `/services/plombier/dijon/laurent-finck-mon-plombier-dijon-520113770`                                                        |     3 |   40 |   7.50% |  4.3 |
| `/services/geometre/fort-de-france`                                                                                          |     3 |   38 |   7.89% |  8.7 |
| `/services/peintre-en-batiment/montbeliard`                                                                                  |     3 |   37 |   8.11% | 15.8 |
| `/services/macon/vitrolles/yes-renov-993442466`                                                                              |     3 |   36 |   8.33% | 20.3 |
| `/services/solier/passy/stephane-daulin-lucky-services-902446905`                                                            |     3 |   35 |   8.57% |  7.0 |
| `/services/menuisier/perpignan`                                                                                              |     3 |   35 |   8.57% | 28.5 |
| `/services/electricien/clamart`                                                                                              |     3 |   34 |   8.82% |  8.0 |
| `/services/plombier/evreux`                                                                                                  |     3 |   34 |   8.82% | 16.4 |
| `/services/chauffagiste/thionville`                                                                                          |     3 |   34 |   8.82% | 19.7 |
| `/services/couvreur/bailleul`                                                                                                |     3 |   33 |   9.09% |  6.7 |
| `/services/solier/villeurbanne`                                                                                              |     3 |   33 |   9.09% |  6.8 |
| `/services/couvreur/le-mans`                                                                                                 |     3 |   33 |   9.09% |  7.1 |
| `/services/peintre-en-batiment/bras-panon/jean-christopher-ponama-488684861`                                                 |     3 |   32 |   9.38% |  4.1 |
| `/services/solier/fleury-les-aubrais/nicolas-manceau-nd-bat-952503084`                                                       |     3 |   31 |   9.68% |  7.9 |
| `/services/peintre-en-batiment/bras-panon/7afffdae0c0fe1b4`                                                                  |     3 |   30 |  10.00% |  3.8 |
| `/services/plombier/la-ciotat/cassis`                                                                                        |     3 |   30 |  10.00% | 24.8 |
| `/services/couvreur/toulon`                                                                                                  |     3 |   29 |  10.34% | 19.0 |
| `/services/couvreur/drancy`                                                                                                  |     3 |   28 |  10.71% |  7.6 |
| `/services/couvreur/le-raincy`                                                                                               |     3 |   28 |  10.71% | 17.6 |
| `/services/peintre-en-batiment/vitrolles/829f03e44a1cc31d`                                                                   |     3 |   28 |  10.71% | 36.7 |
| `/services/plombier/tarbes`                                                                                                  |     3 |   27 |  11.11% | 17.6 |
| `/services/terrassier/billere/bastien-billaud-wood-concept-833580277`                                                        |     3 |   26 |  11.54% |  6.2 |
| `/services/serrurier/toulouse`                                                                                               |     3 |   26 |  11.54% |  8.8 |
| `/services/chauffagiste/perpignan/didier-mingot-mdenergies-343667358`                                                        |     3 |   24 |  12.50% |  2.5 |
| `/services/electricien/briancon/1c71066026269723`                                                                            |     3 |   24 |  12.50% |  5.3 |
| `/services/plombier/plouzane/enzo-landauer-technique-plomberie-849230677`                                                    |     3 |   24 |  12.50% |  6.0 |
| `/services/plombier/thiais/rungis`                                                                                           |     3 |   24 |  12.50% |  7.2 |
| `/services/electricien/gimont/marco-fabre-fabre-marco-921459491`                                                             |     3 |   24 |  12.50% |  7.9 |
| `/services/macon/toulon/sogebat-construction-sogebat-construction-952449619`                                                 |     3 |   24 |  12.50% | 10.2 |
| `/services/serrurier/grabels/d771ea979ea6c0f1`                                                                               |     3 |   24 |  12.50% | 29.2 |
| `/services/peintre-en-batiment/saint-jean-de-vedas/b64c2a0378097a9b`                                                         |     3 |   23 |  13.04% |  2.2 |
| `/services/macon/grabels/c86f0d0d5ed0d3be`                                                                                   |     3 |   23 |  13.04% |  8.1 |
| `/services/menuisier/saint-maurice-l-exil`                                                                                   |     3 |   23 |  13.04% | 16.8 |
| `/services/chauffagiste/creteil/ecolia-887865574`                                                                            |     3 |   21 |  14.29% |  4.2 |
| `/services/plombier/grasse`                                                                                                  |     3 |   21 |  14.29% |  9.5 |
| `/services/ramoneur/hyeres`                                                                                                  |     3 |   21 |  14.29% | 14.6 |
| `/services/couvreur/albi`                                                                                                    |     3 |   21 |  14.29% | 15.4 |
| `/services/couvreur/bergerac/mickael-coiffard-mc-couverture-980779490`                                                       |     3 |   19 |  15.79% |  4.0 |
| `/services/macon/la-seyne-sur-mer/e78602937a8ce68f`                                                                          |     3 |   19 |  15.79% |  4.3 |
| `/services/carreleur/toulouse/4c96415a156f4d75`                                                                              |     3 |   19 |  15.79% |  5.1 |
| `/services/carreleur/vaudrey/alexandre-monnot-alex-renovation-478598493`                                                     |     3 |   19 |  15.79% |  5.6 |
| `/services/plombier/clermont-ferrand`                                                                                        |     3 |   19 |  15.79% |  9.7 |
| `/services/peintre-en-batiment/le-taillan-medoc/saint-aubin-de-medoc`                                                        |     3 |   19 |  15.79% | 27.2 |
| `/services/charpentier/villiers-saint-benoit/samuel-rooney-889595435`                                                        |     3 |   18 |  16.67% |  2.9 |
| `/services/architecte-interieur/toulouse/nathalie-destoc-488735093`                                                          |     3 |   18 |  16.67% |  4.7 |
| `/services/peintre-en-batiment/bretigny-sur-orge/8f5df8aecfdb6832`                                                           |     3 |   18 |  16.67% |  7.9 |
| `/services/couvreur/frossay/mscz-44-951616580`                                                                               |     3 |   18 |  16.67% |  8.2 |
| `/services/serrurier/echirolles/e25adec7f5c9976e`                                                                            |     3 |   18 |  16.67% | 33.3 |
| `/services/peintre-en-batiment/le-mans/adel-haouas-renova-decors-882018526`                                                  |     3 |   17 |  17.65% |  4.3 |
| `/services/couvreur/pessac`                                                                                                  |     3 |   17 |  17.65% |  9.1 |
| `/services/serrurier/luc-la-primaube/cedric-marre-448202234`                                                                 |     3 |   17 |  17.65% |  9.3 |
| `/services/deratisation/issy-les-moulineaux/421a06bb63a49c37`                                                                |     3 |   16 |  18.75% |  4.6 |
| `/services/carreleur/mouguerre/jean-luc-lautrie-leo-841149479`                                                               |     3 |   15 |  20.00% |  2.8 |
| `/services/carreleur/hettange-grande/davy-roser-onyx-carrelages-991485731`                                                   |     3 |   15 |  20.00% |  3.1 |
| `/services/diagnostiqueur/saint-lo/6055d13b0f8af7eb`                                                                         |     3 |   15 |  20.00% |  4.1 |
| `/services/solier/lille`                                                                                                     |     3 |   15 |  20.00% |  5.8 |
| `/services/electricien/divatte-sur-loire/snbe-snbe-850181694`                                                                |     3 |   15 |  20.00% |  6.5 |
| `/services/climaticien/amberieu-en-bugey/lucas-gennaro-gennaro-froid-et-climatisation-949412852`                             |     3 |   15 |  20.00% |  6.8 |
| `/services/cuisiniste/saint-laurent-du-var/5a87a0f56f7f2d86`                                                                 |     3 |   15 |  20.00% |  8.0 |
| `/services/climaticien/mtsamboro`                                                                                            |     3 |   15 |  20.00% |  8.1 |
| `/services/macon/cornebarrieu/michel-pouville-batitech-sud-ouest-943329664`                                                  |     3 |   14 |  21.43% |  3.6 |
| `/services/solier/ploermel/loic-palot-lapal-renov-finition-883761645`                                                        |     3 |   14 |  21.43% |  3.9 |
| `/services/plombier/ezanville/jeremy-ballanger-mg2l-823586516`                                                               |     3 |   14 |  21.43% |  4.1 |
| `/services/solier/yutz/d08d8cef5a0483cc`                                                                                     |     3 |   14 |  21.43% | 14.4 |
| `/services/electricien/scionzier/922996d909c1b299`                                                                           |     3 |   13 |  23.08% |  3.0 |
| `/services/electricien/saint-saturnin-les-avignon/74d1859e079a12b6`                                                          |     3 |   13 |  23.08% |  3.7 |
| `/services/electricien/guingamp/benjamin-quere-querelec-944547819`                                                           |     3 |   13 |  23.08% |  5.2 |
| `/services/terrassier/montlucon`                                                                                             |     3 |   13 |  23.08% |  5.7 |
| `/services/menuisier/le-lorrain`                                                                                             |     3 |   13 |  23.08% |  6.5 |
| `/services/plombier/saint-mande/jhm-renovation-912700721`                                                                    |     3 |   13 |  23.08% |  6.7 |
| `/services/menuisier/saint-apollinaire/eddie-guincetre-m-a-e-g-819381971`                                                    |     3 |   13 |  23.08% |  7.5 |
| `/services/macon/dax`                                                                                                        |     3 |   13 |  23.08% |  8.5 |
| `/services/platrier/la-rochelle/marvin-fournier-mf-plaquiste-904933587`                                                      |     3 |   12 |  25.00% |  4.2 |
| `/services/plombier/queven/de38f5b08f104f31`                                                                                 |     3 |   12 |  25.00% |  5.4 |
| `/services/menuisier/rennes/richard-le-roux-atelier-du-noroit-813819125`                                                     |     3 |   12 |  25.00% |  5.9 |
| `/services/chauffagiste/hombourg-haut/didier-chagnon-827517079`                                                              |     3 |   12 |  25.00% |  6.6 |
| `/services/menuisier/grigny-sur-rhone`                                                                                       |     3 |   12 |  25.00% |  7.6 |
| `/services/paysagiste/saint-leu/frederic-babinger-studio-b-500643077`                                                        |     3 |   11 |  27.27% |  3.7 |
| `/services/ascensoriste/mehun-sur-yevre/tjK0Km8DkxHhVHn7`                                                                    |     3 |   11 |  27.27% |  4.0 |
| `/services/macon/aix-en-provence/39eb1a6afdc1db55`                                                                           |     3 |   11 |  27.27% |  4.0 |
| `/services/serrurier/strasbourg/daniel-pariente-la-compagnie-des-plombiers-serruriers-519291074`                             |     3 |   11 |  27.27% |  6.7 |
| `/services/solier/schiltigheim`                                                                                              |     3 |   11 |  27.27% |  7.0 |
| `/services/plombier/betheny/kevin-fleury-elite-klean-plomb-art-des-sacres-849331483`                                         |     3 |   11 |  27.27% |  7.1 |
| `/services/macon/lagnieu/ozer-construction-880230214`                                                                        |     3 |   11 |  27.27% |  7.9 |
| `/services/carreleur/andrezieux-boutheon/a3a9a18f8639eff9`                                                                   |     3 |   11 |  27.27% | 23.0 |
| `/services/electricien/clermont-ferrand/vincent-lefebvre-veleca-889117743`                                                   |     3 |   10 |  30.00% |  2.3 |
| `/services/electricien/anglet/b63592cfe1b5c732`                                                                              |     3 |   10 |  30.00% |  2.5 |
| `/services/ascensoriste/roubaix/60dc0ab92985ffd2`                                                                            |     3 |   10 |  30.00% |  2.8 |
| `/services/electricien/balan/eric-sanduku-s-eric-elec-821962651`                                                             |     3 |   10 |  30.00% |  3.4 |
| `/services/serrurier/massy/paul-sanchez-sinier-sinier-sp-depannage-auto-24-7-838265452`                                      |     3 |   10 |  30.00% |  4.6 |
| `/services/macon/toulon/imed-jelassi-528313893`                                                                              |     3 |   10 |  30.00% |  5.1 |
| `/services/electricien/reze/jeremie-touret-so-watt-478046378`                                                                |     3 |   10 |  30.00% |  5.3 |
| `/services/ramoneur/le-tampon`                                                                                               |     3 |   10 |  30.00% |  6.5 |
| `/services/electricien/le-tampon/dimitri-casse-mon-petit-electricien-930089230`                                              |     3 |   10 |  30.00% |  6.8 |
| `/services/electricien/wattrelos/c5319a7cb69d6640`                                                                           |     3 |   10 |  30.00% |  8.0 |
| `/services/geometre/la-possession/gildas-ali-523440618`                                                                      |     3 |    9 |  33.33% |  2.8 |
| `/services/plombier/mondeville/patrick-perruc-ajbl-507848083`                                                                |     3 |    9 |  33.33% |  3.0 |
| `/services/plombier/cahors/sylvain-joly-entreprise-joly-plomberie-501531461`                                                 |     3 |    9 |  33.33% |  4.7 |
| `/services/facadier/coueron/hugo-valente-goncalves-hg-enduits-44-981018369`                                                  |     3 |    9 |  33.33% |  4.9 |
| `/services/plombier/jardres/jerome-picard-pj-plomberie-940865272`                                                            |     3 |    9 |  33.33% |  6.0 |
| `/services/carreleur/luxeuil-les-bains/khalid-jammou-jk-carrelage-819315904`                                                 |     3 |    9 |  33.33% |  6.8 |
| `/services/metallier/merle-leignec/sebastien-roiron-concept-soudure-850322462`                                               |     3 |    8 |  37.50% |  1.0 |
| `/services/architecte-interieur/rabastens/mami-architecture-urbanisme-100984053`                                             |     3 |    8 |  37.50% |  2.4 |
| `/services/macon/salon-de-provence/loic-sinibaldi-vaguet-prestige-maconnerie-929885705`                                      |     3 |    8 |  37.50% |  3.1 |
| `/services/macon/bagnols-sur-ceze/ludovic-bourdelas-ludo-renov-438543084`                                                    |     3 |    8 |  37.50% |  3.4 |
| `/services/macon/paris/best-travaux-batiment-bestbat-942533365`                                                              |     3 |    8 |  37.50% |  4.4 |
| `/services/ramoneur/marignane/stephan-jacquet-piscine-services-532253499`                                                    |     3 |    8 |  37.50% |  4.5 |
| `/services/couvreur/saint-germain-les-arpajon/stevin-adelle-mr-adelle-stevin-900156605`                                      |     3 |    8 |  37.50% |  5.1 |
| `/services/menuisier/vallet/maxime-bertrand-bertrand-maxime-menuiserie-901019596`                                            |     3 |    8 |  37.50% |  5.2 |
| `/services/plombier/jeanmenil/loic-mangeolle-hnt-renov-908070618`                                                            |     3 |    8 |  37.50% |  5.4 |
| `/services/macon/fos-sur-mer/bcs13-884164583`                                                                                |     3 |    8 |  37.50% |  5.5 |
| `/services/carreleur/desnes/jeremy-michelin-851612523`                                                                       |     3 |    8 |  37.50% |  5.8 |
| `/services/peintre-en-batiment/la-chapelle-saint-luc/sebastien-michon-524733953`                                             |     3 |    8 |  37.50% |  6.2 |
| `/services/menuisier/garchizy/michael-joly-mika-menuiserie-538670472`                                                        |     3 |    8 |  37.50% |  6.6 |
| `/services/peintre-en-batiment/paillet/delphine-delamour-wery-deldeco-534379532`                                             |     3 |    8 |  37.50% |  6.9 |
| `/services/macon/angouleme/abdelhalim-ben-youssef-bati-pro-532503372`                                                        |     3 |    8 |  37.50% |  7.4 |
| `/services/couvreur/bazet/steven-bengler-sb-couverture-893011049`                                                            |     3 |    8 |  37.50% |  8.8 |
| `/services/terrassier/saint-jory/franck-deveze-918594029`                                                                    |     3 |    8 |  37.50% |  9.5 |
| `/services/peintre-en-batiment/longwy/lexy`                                                                                  |     3 |    8 |  37.50% | 11.0 |
| `/services/menuisier/lorient/pierre-brouck-pierre-deco-490269719`                                                            |     3 |    7 |  42.86% |  2.1 |
| `/services/macon/lunel/3bddd8708547bcc3`                                                                                     |     3 |    7 |  42.86% |  3.0 |
| `/services/solier/castelginest/frederic-tortorella-503571689`                                                                |     3 |    7 |  42.86% |  3.0 |
| `/services/solier/cornebarrieu/alexis-martinez-martinez-rodriguez-martinez-renovation-general-847525177`                     |     3 |    7 |  42.86% |  3.3 |
| `/services/solier/valence/steven-ollmann-752805507`                                                                          |     3 |    7 |  42.86% |  4.0 |
| `/services/electricien/argenteuil/73a32dc0a042edc6`                                                                          |     3 |    7 |  42.86% |  4.7 |
| `/services/serrurier/vigneux-de-bretagne/dominique-chartier-527947022`                                                       |     3 |    7 |  42.86% |  5.0 |
| `/services/plombier/morzine/rui-carvalho-peixoto-peixoto-plomberie-988552808`                                                |     3 |    7 |  42.86% |  5.9 |
| `/services/architecte-interieur/courbevoie/philippe-girou-351421680`                                                         |     3 |    7 |  42.86% |  6.9 |
| `/services/carreleur/draguignan/a43a4eb69d548a2e`                                                                            |     3 |    6 |  50.00% |  1.3 |
| `/services/macon/antibes/1038db0e9d30abdd`                                                                                   |     3 |    6 |  50.00% |  1.5 |
| `/services/macon/pont-de-vaux/stephane-drevet-448580084`                                                                     |     3 |    6 |  50.00% |  2.2 |
| `/services/platrier/dijon/andre-cattet-310149703`                                                                            |     3 |    6 |  50.00% |  2.3 |
| `/services/solier/arles/jeremy-martin-la-luz-953215605`                                                                      |     3 |    6 |  50.00% |  2.3 |
| `/services/couvreur/woippy/ismael-aissa-abdi-dahra-ccz-531243707`                                                            |     3 |    6 |  50.00% |  2.5 |
| `/services/couvreur/castelsarrasin/tony-emmanuel-521675710`                                                                  |     3 |    6 |  50.00% |  3.0 |
| `/services/menuisier/thones/56a8e58e18f2b655`                                                                                |     3 |    6 |  50.00% |  3.8 |
| `/services/peintre-en-batiment/le-mans/d20d1dcc6be8ca91`                                                                     |     3 |    6 |  50.00% |  3.8 |
| `/services/macon/vence/mouza-501372700`                                                                                      |     3 |    6 |  50.00% |  4.0 |
| `/services/menuisier/quimper/artur-papinyan-papinyan-artur-811425982`                                                        |     3 |    6 |  50.00% |  4.2 |
| `/services/geometre/schiltigheim/yamine-lamamra-899820914`                                                                   |     3 |    6 |  50.00% |  4.7 |
| `/services/menuisier/tergnier/gregory-milliot-mg-menuiserie-898162326`                                                       |     3 |    6 |  50.00% |  4.8 |
| `/services/terrassier/saint-pierre-de-chandieu/quentin-roux-ambiance-nature-844956169`                                       |     3 |    6 |  50.00% |  4.8 |
| `/services/plombier/rabastens/nicolas-carena-494299068`                                                                      |     3 |    6 |  50.00% |  5.2 |
| `/services/solier/villard-sur-doron/olivier-lacroix-bric-ol-en-beaufortain-920830577`                                        |     3 |    6 |  50.00% |  5.5 |
| `/services/macon/talence/mohamed-yaakoubi-839029824`                                                                         |     3 |    6 |  50.00% |  6.2 |
| `/services/carreleur/rimogne/yoann-antoine-antoine-yoann-991792045`                                                          |     3 |    6 |  50.00% |  6.3 |
| `/services/macon/saint-laurent-du-var/adam-sachot-adam-services-852402940`                                                   |     3 |    6 |  50.00% |  7.0 |
| `/services/macon/altier/sebastien-gourdouze-sg-maconnerie-899401210`                                                         |     3 |    6 |  50.00% |  8.0 |
| `/services/solier/luri/gregory-robert-robert-et-mazotti-renov-et-depannage-841741515`                                        |     3 |    5 |  60.00% |  2.0 |
| `/services/plombier/corbeil-essonnes/abdelmajid-tabib-tsp-plomberie-chauffage-999815855`                                     |     3 |    5 |  60.00% |  2.2 |
| `/services/ascensoriste/cessy/f7d0cb6f64631900`                                                                              |     3 |    5 |  60.00% |  3.0 |
| `/services/electricien/bordeaux/nomadys-energies-935065268`                                                                  |     3 |    5 |  60.00% |  3.0 |
| `/services/electricien/saint-germain-en-laye/thierry-brunoro-488760216`                                                      |     3 |    5 |  60.00% |  3.2 |
| `/services/desinsectisation/briec/49f2f7e91e94ed09`                                                                          |     3 |    5 |  60.00% |  3.8 |
| `/services/climaticien/la-valette-du-var/abderrahmane-aider-clim-family-989567458`                                           |     3 |    5 |  60.00% |  4.0 |
| `/services/peintre-en-batiment/simiane-collongue/stephane-rubio-maison-en-couleur-918449208`                                 |     3 |    5 |  60.00% |  4.0 |
| `/services/macon/amboise/1d1deb353b1f7e94`                                                                                   |     3 |    5 |  60.00% |  4.2 |
| `/services/carreleur/saint-maur-des-fosses/dinis-tavares-750283145`                                                          |     3 |    5 |  60.00% |  4.4 |
| `/services/carreleur/saint-joseph/b307c32e87b80a13`                                                                          |     3 |    5 |  60.00% |  4.8 |
| `/services/menuisier/montreuil/51af6807632817cf`                                                                             |     3 |    5 |  60.00% |  5.0 |
| `/services/peintre-en-batiment/vernet/franck-mazzolo-435130067`                                                              |     3 |    5 |  60.00% |  6.2 |
| `/services/macon/origny-le-roux/portais-maconnerie-995197399`                                                                |     3 |    5 |  60.00% |  6.4 |
| `/services/ramoneur/noumea`                                                                                                  |     3 |    5 |  60.00% |  7.0 |
| `/services/geometre/val-d-arry/frederic-le-bouette-399381730`                                                                |     3 |    5 |  60.00% |  7.6 |
| `/services/antenniste/thouare-sur-loire/carquefou`                                                                           |     3 |    5 |  60.00% |  9.6 |
| `/services/menuisier/bayonne/david-beunza-791936370`                                                                         |     3 |    4 |  75.00% |  1.0 |
| `/services/platrier/saint-ouen-sur-seine/timofei-butnaru-944049287`                                                          |     3 |    4 |  75.00% |  1.0 |
| `/services/peintre-en-batiment/margny-les-compiegne/7eacf4754567f376`                                                        |     3 |    4 |  75.00% |  1.2 |
| `/services/plombier/francheville/mathieu-riviere-tim-service-802729913`                                                      |     3 |    4 |  75.00% |  2.2 |
| `/services/electricien/la-voge-les-bains/romain-dugravot-rd-multitech-934172818`                                             |     3 |    4 |  75.00% |  3.0 |
| `/services/macon/angouleme/c605e5dc772e0e31`                                                                                 |     3 |    4 |  75.00% |  3.0 |
| `/services/electricien/dax/563da892420d218f`                                                                                 |     3 |    4 |  75.00% |  3.2 |
| `/services/peintre-en-batiment/le-cannet/nicolas-piromalli-monsieur-peinture-914171632`                                      |     3 |    4 |  75.00% |  3.2 |
| `/services/peintre-en-batiment/rennes/regis-sourdril-regis-le-peintre-494249113`                                             |     3 |    4 |  75.00% |  3.5 |
| `/services/menuisier/strasbourg/d4a1b697f858c1d4`                                                                            |     3 |    4 |  75.00% |  4.0 |
| `/services/plombier/carmaux/clement-borie-cb-confort-929748754`                                                              |     3 |    4 |  75.00% |  4.2 |
| `/services/couvreur/elbeuf/malcolm-fruish-513413724`                                                                         |     3 |    4 |  75.00% |  4.5 |
| `/services/couvreur/forbach/cameron-denis-100971886`                                                                         |     3 |    4 |  75.00% |  4.5 |
| `/services/plombier/toulon/guy-fauchez-381574326`                                                                            |     3 |    4 |  75.00% |  5.5 |
| `/services/diagnostiqueur/avignon/afd84-852510676`                                                                           |     3 |    4 |  75.00% |  6.5 |
| `/services/macon/montesson/f2ee852e0226cb6b`                                                                                 |     3 |    3 | 100.00% |  1.3 |
| `/services/electricien/la-garde/789995c68a122054`                                                                            |     3 |    3 | 100.00% |  2.0 |
| `/services/geometre/champagne-au-mont-d-or/jean-luc-anderlini-881823413`                                                     |     3 |    3 | 100.00% |  2.0 |
| `/services/menuisier/lorient/boussad-moussaoui-929390060`                                                                    |     3 |    3 | 100.00% |  2.3 |
| `/services/platrier/ugine/c0fe6d841972047d`                                                                                  |     3 |    3 | 100.00% |  2.3 |
| `/services/geometre/roquebrune-sur-argens/laurence-lopez-montarges-449928068`                                                |     3 |    3 | 100.00% |  3.0 |
| `/services/plombier/saint-ouen-l-aumone/mulot-cpc-411882541`                                                                 |     3 |    3 | 100.00% |  4.0 |
| `/services/plombier/vienne/arthur-fontmorin-931872741`                                                                       |     3 |    3 | 100.00% |  5.0 |
| `/services/electricien/lyon`                                                                                                 |     2 |  305 |   0.66% | 48.1 |
| `/services/macon/saint-dizier/389b2d756b3d82c8`                                                                              |     2 |  169 |   1.18% |  3.8 |
| `/services/peintre-en-batiment/merignac`                                                                                     |     2 |  158 |   1.27% | 11.5 |
| `/services/plombier/nantes`                                                                                                  |     2 |  155 |   1.29% | 30.3 |
| `/services/plombier/besancon`                                                                                                |     2 |  138 |   1.45% | 33.9 |
| `/services/carreleur/mulhouse`                                                                                               |     2 |  125 |   1.60% |  5.2 |
| `/services/terrassier/nimes`                                                                                                 |     2 |  117 |   1.71% |  9.7 |
| `/services/couvreur/maubeuge`                                                                                                |     2 |  114 |   1.75% | 23.7 |
| `/services/couvreur/montauban`                                                                                               |     2 |  111 |   1.80% | 34.7 |
| `/services/macon/hyeres`                                                                                                     |     2 |  105 |   1.90% | 17.0 |
| `/services/peintre-en-batiment/gap`                                                                                          |     2 |   96 |   2.08% |  6.5 |
| `/services/serrurier/paris/laurent-rouche-352303432`                                                                         |     2 |   85 |   2.35% |  5.5 |
| `/services/peintre-en-batiment/talence`                                                                                      |     2 |   76 |   2.63% | 15.2 |
| `/services/electricien/beaupreau-en-mauges/bm-depannage-et-renovation-100177161`                                             |     2 |   74 |   2.70% |  5.5 |
| `/services/peintre-en-batiment/tarbes`                                                                                       |     2 |   72 |   2.78% |  6.5 |
| `/services/peintre-en-batiment/caussade`                                                                                     |     2 |   72 |   2.78% | 21.7 |
| `/services/menuisier/cannes`                                                                                                 |     2 |   71 |   2.82% | 36.6 |
| `/services/plombier/poitiers`                                                                                                |     2 |   70 |   2.86% | 32.8 |
| `/services/macon/arles`                                                                                                      |     2 |   68 |   2.94% | 14.2 |
| `/services/solier/poix-du-nord/anthony-rogier-ar-facade-992807123`                                                           |     2 |   61 |   3.28% |  6.2 |
| `/services/plombier/la-seyne-sur-mer`                                                                                        |     2 |   61 |   3.28% | 13.7 |
| `/services/architecte-interieur/le-pradet/la-valette-du-var`                                                                 |     2 |   61 |   3.28% | 47.2 |
| `/services/peintre-en-batiment/draguignan/centre-ville`                                                                      |     2 |   60 |   3.33% | 10.4 |
| `/services/serrurier/albi`                                                                                                   |     2 |   60 |   3.33% | 29.7 |
| `/services/couvreur/cherbourg-en-cotentin`                                                                                   |     2 |   59 |   3.39% | 19.1 |
| `/services/plombier/lorient`                                                                                                 |     2 |   58 |   3.45% |  7.3 |
| `/services/plombier/albi`                                                                                                    |     2 |   58 |   3.45% |  9.5 |
| `/services/serrurier/clamart/msd-serrurerie-837959659`                                                                       |     2 |   57 |   3.51% |  6.7 |
| `/services/electricien/dunkerque`                                                                                            |     2 |   57 |   3.51% | 11.5 |
| `/services/couvreur/carcassonne/b345f9186def0be4`                                                                            |     2 |   56 |   3.57% |  4.2 |
| `/services/peintre-en-batiment/aulnay-sous-bois/dc2000f806c59ad9`                                                            |     2 |   56 |   3.57% |  8.6 |
| `/services/couvreur/talence`                                                                                                 |     2 |   53 |   3.77% |  8.0 |
| `/services/plombier/le-havre`                                                                                                |     2 |   52 |   3.85% | 13.4 |
| `/services/couvreur/boulogne-sur-mer`                                                                                        |     2 |   51 |   3.92% | 19.2 |
| `/services/couvreur/lorient`                                                                                                 |     2 |   51 |   3.92% | 26.9 |
| `/services/carreleur/metz/guy-pauline-g-p-pro-menuisier-483259479`                                                           |     2 |   50 |   4.00% |  3.5 |
| `/services/geometre/montmelian/biaxion-100258359`                                                                            |     2 |   50 |   4.00% |  6.1 |
| `/services/plombier/roubaix`                                                                                                 |     2 |   48 |   4.17% | 12.1 |
| `/services/platrier/limoges/beaubreuil`                                                                                      |     2 |   48 |   4.17% | 19.2 |
| `/services/platrier/saint-pierre/reunion-plaquiste-pro-reunion-plaquiste-pro-917953804`                                      |     2 |   47 |   4.26% |  4.4 |
| `/services/serrurier/gex/iskender-tok-sos-leman-serrurerie-992554196`                                                        |     2 |   47 |   4.26% |  6.9 |
| `/services/chauffagiste/venissieux/atout-prestat-atp-919438879`                                                              |     2 |   47 |   4.26% |  8.7 |
| `/services/peintre-en-batiment/blois`                                                                                        |     2 |   47 |   4.26% |  9.7 |
| `/services/peintre-en-batiment/noves/centre-ville`                                                                           |     2 |   46 |   4.35% |  7.0 |
| `/services/paysagiste/brignoles/gareoult`                                                                                    |     2 |   45 |   4.44% |  6.7 |
| `/services/electricien/vigneux-sur-seine/juvisy-sur-orge`                                                                    |     2 |   45 |   4.44% |  7.2 |
| `/services/peintre-en-batiment/saint-alban/centre-ville`                                                                     |     2 |   45 |   4.44% |  7.8 |
| `/services/menuisier/ajaccio`                                                                                                |     2 |   45 |   4.44% |  9.6 |
| `/services/solier/bourgoin-jallieu/l-isle-d-abeau`                                                                           |     2 |   45 |   4.44% | 13.3 |
| `/services/couvreur/nanterre`                                                                                                |     2 |   44 |   4.55% |  6.9 |
| `/services/peintre-en-batiment/vigneux-sur-seine/crosne`                                                                     |     2 |   44 |   4.55% |  8.9 |
| `/services/couvreur/cergy/centre`                                                                                            |     2 |   44 |   4.55% |  9.4 |
| `/services/couvreur/forbach/mike-luxembourger-luxembourger-top-renov-520781832`                                              |     2 |   43 |   4.65% |  5.7 |
| `/services/macon/muzillac/2ae54d29009b1bc1`                                                                                  |     2 |   43 |   4.65% |  6.4 |
| `/services/electricien/reims`                                                                                                |     2 |   43 |   4.65% |  9.0 |
| `/services/platrier/niort/centre-ville`                                                                                      |     2 |   43 |   4.65% | 10.0 |
| `/services/couvreur/villeneuve-sur-lot`                                                                                      |     2 |   43 |   4.65% | 17.9 |
| `/services/jardinier/darnetal`                                                                                               |     2 |   43 |   4.65% | 27.0 |
| `/services/jardinier/montauban`                                                                                              |     2 |   42 |   4.76% | 20.8 |
| `/services/cuisiniste/ludres/1f46c737d5e4c47d`                                                                               |     2 |   41 |   4.88% |  6.0 |
| `/services/peintre-en-batiment/dinard/saint-briac-sur-mer`                                                                   |     2 |   41 |   4.88% | 14.6 |
| `/services/plombier/nimes`                                                                                                   |     2 |   41 |   4.88% | 26.7 |
| `/services/macon/saint-andre-de-cubzac/centre-ville`                                                                         |     2 |   40 |   5.00% |  8.3 |
| `/services/climaticien/marseille`                                                                                            |     2 |   40 |   5.00% | 10.2 |
| `/services/macon/perpignan`                                                                                                  |     2 |   40 |   5.00% | 11.5 |
| `/services/peintre-en-batiment/saint-brieuc`                                                                                 |     2 |   40 |   5.00% | 11.7 |
| `/services/peintre-en-batiment/verdun`                                                                                       |     2 |   40 |   5.00% | 30.8 |
| `/services/peintre-en-batiment/hendaye`                                                                                      |     2 |   39 |   5.13% |  9.5 |
| `/services/couvreur/argenteuil`                                                                                              |     2 |   39 |   5.13% | 15.4 |
| `/services/electricien/merignac`                                                                                             |     2 |   39 |   5.13% | 15.5 |
| `/services/geometre/miribel/centre-ville`                                                                                    |     2 |   38 |   5.26% |  6.9 |
| `/services/platrier/saint-pierre`                                                                                            |     2 |   38 |   5.26% |  8.5 |
| `/services/peintre-en-batiment/ajaccio`                                                                                      |     2 |   38 |   5.26% | 32.3 |
| `/services/electricien/montmagny/montmorency`                                                                                |     2 |   37 |   5.41% |  6.0 |
| `/services/electricien/borgo/lucciana`                                                                                       |     2 |   37 |   5.41% |  6.8 |
| `/services/couvreur/rennes/villejean`                                                                                        |     2 |   37 |   5.41% |  8.8 |
| `/services/geometre/le-francois/le-robert`                                                                                   |     2 |   37 |   5.41% |  8.8 |
| `/services/electricien/gap`                                                                                                  |     2 |   37 |   5.41% | 11.7 |
| `/services/plombier/tourcoing`                                                                                               |     2 |   37 |   5.41% | 12.7 |
| `/services/peintre-en-batiment/bourgoin-jallieu/l-isle-d-abeau`                                                              |     2 |   36 |   5.56% |  9.9 |
| `/services/plombier/colombes`                                                                                                |     2 |   36 |   5.56% | 11.1 |
| `/services/menuisier/le-havre`                                                                                               |     2 |   36 |   5.56% | 30.1 |
| `/services/electricien/le-havre`                                                                                             |     2 |   35 |   5.71% |  6.5 |
| `/services/macon/cernay/lutterbach`                                                                                          |     2 |   34 |   5.88% |  5.3 |
| `/services/charpentier/le-lamentin/ducos`                                                                                    |     2 |   34 |   5.88% |  8.4 |
| `/services/couvreur/nancy`                                                                                                   |     2 |   34 |   5.88% | 17.8 |
| `/services/peintre-en-batiment/castelsarrasin`                                                                               |     2 |   34 |   5.88% | 24.7 |
| `/services/charpentier/montech`                                                                                              |     2 |   34 |   5.88% | 42.1 |
| `/services/chauffagiste/courbevoie/02d8669e5a38de36`                                                                         |     2 |   33 |   6.06% |  7.2 |
| `/services/platrier/auterive/nailloux`                                                                                       |     2 |   33 |   6.06% |  7.3 |
| `/services/climaticien/val-de-scie/le-froid-altifagien-931379150`                                                            |     2 |   33 |   6.06% |  9.4 |
| `/services/couvreur/nimes`                                                                                                   |     2 |   33 |   6.06% | 10.3 |
| `/services/menuisier/cholet`                                                                                                 |     2 |   33 |   6.06% | 29.0 |
| `/services/electricien/vence`                                                                                                |     2 |   31 |   6.45% |  6.3 |
| `/services/macon/limoges`                                                                                                    |     2 |   31 |   6.45% | 11.0 |
| `/services/paysagiste/saint-andre`                                                                                           |     2 |   31 |   6.45% | 12.9 |
| `/services/macon/agen`                                                                                                       |     2 |   31 |   6.45% | 16.2 |
| `/services/electricien/papara/fenua-cool-elec`                                                                               |     2 |   30 |   6.67% |  2.8 |
| `/services/macon/mery-sur-oise/centre-ville`                                                                                 |     2 |   30 |   6.67% |  6.3 |
| `/services/electricien/narbonne`                                                                                             |     2 |   30 |   6.67% |  8.9 |
| `/services/peintre-en-batiment/arras`                                                                                        |     2 |   30 |   6.67% | 29.5 |
| `/services/electricien/bastia`                                                                                               |     2 |   29 |   6.90% |  6.2 |
| `/services/couvreur/saint-medard-en-jalles/le-taillan-medoc`                                                                 |     2 |   29 |   6.90% |  6.2 |
| `/services/climaticien/nice`                                                                                                 |     2 |   29 |   6.90% |  9.7 |
| `/services/plombier/merignac/barret-eau-933835530`                                                                           |     2 |   29 |   6.90% | 10.7 |
| `/services/geometre/vauvert/saint-laurent-d-aigouze`                                                                         |     2 |   29 |   6.90% | 16.2 |
| `/services/plombier/chabeuil/83c191bdec117015`                                                                               |     2 |   29 |   6.90% | 22.0 |
| `/services/plombier/cusset/68af80f8c7461eb9`                                                                                 |     2 |   28 |   7.14% |  8.8 |
| `/services/architecte-interieur/pezenas`                                                                                     |     2 |   28 |   7.14% | 15.1 |
| `/services/peintre-en-batiment/ales`                                                                                         |     2 |   28 |   7.14% | 16.2 |
| `/services/couvreur/vannes`                                                                                                  |     2 |   28 |   7.14% | 23.7 |
| `/services/jardinier/nantes`                                                                                                 |     2 |   28 |   7.14% | 31.4 |
| `/services/menuisier/gerzat/clermont-ferrand`                                                                                |     2 |   28 |   7.14% | 41.6 |
| `/services/serrurier/avon/christian-ambielle-414228155`                                                                      |     2 |   27 |   7.41% | 12.0 |
| `/services/peintre-en-batiment/montelimar/montboucher-sur-jabron`                                                            |     2 |   27 |   7.41% | 18.4 |
| `/services/electricien/marseille/le-panier`                                                                                  |     2 |   26 |   7.69% |  7.5 |
| `/services/menuisier/brest`                                                                                                  |     2 |   26 |   7.69% |  8.1 |
| `/services/jardinier/frejus`                                                                                                 |     2 |   26 |   7.69% | 10.0 |
| `/services/carreleur/clermont-ferrand`                                                                                       |     2 |   26 |   7.69% | 11.5 |
| `/services/nettoyage/montlucon/d4f7d7e0e0dec206`                                                                             |     2 |   26 |   7.69% | 16.0 |
| `/services/serrurier/onet-le-chateau/rodez`                                                                                  |     2 |   26 |   7.69% | 25.3 |
| `/services/geometre/fonsorbes`                                                                                               |     2 |   26 |   7.69% | 31.2 |
| `/services/paysagiste/saint-pierre`                                                                                          |     2 |   25 |   8.00% |  6.4 |
| `/services/paysagiste/saint-joseph/saint-philippe`                                                                           |     2 |   25 |   8.00% |  7.1 |
| `/services/menuisier/montauban`                                                                                              |     2 |   25 |   8.00% |  7.6 |
| `/services/macon/portet-sur-garonne/gso-batiment-943458463`                                                                  |     2 |   25 |   8.00% |  9.1 |
| `/services/electricien/villeurbanne/grandclement`                                                                            |     2 |   24 |   8.33% |  6.6 |
| `/services/borne-recharge/paea/papeete`                                                                                      |     2 |   24 |   8.33% |  7.2 |
| `/services/jardinier/mahina`                                                                                                 |     2 |   24 |   8.33% |  7.5 |
| `/services/serrurier/alenya/virginie-caignon-destock-travaux-510214539`                                                      |     2 |   24 |   8.33% |  8.9 |
| `/services/plombier/asnieres-sur-seine/benjamin-ettouati-blancpain-plomberie-903550481`                                      |     2 |   24 |   8.33% |  9.1 |
| `/services/peintre-en-batiment/terres-de-caux/gaylord-nouet-n-g-peinture-888453784`                                          |     2 |   24 |   8.33% |  9.2 |
| `/services/peintre-en-batiment/chambery`                                                                                     |     2 |   24 |   8.33% | 10.8 |
| `/services/plombier/champagnier/sebastien-rey-521263509`                                                                     |     2 |   24 |   8.33% | 16.8 |
| `/services/couvreur/toulouse`                                                                                                |     2 |   24 |   8.33% | 23.5 |
| `/services/serrurier/valenciennes`                                                                                           |     2 |   24 |   8.33% | 27.5 |
| `/services/macon/nice/mihai-mirel-irimia-irimia-renovation-987944030`                                                        |     2 |   23 |   8.70% |  4.3 |
| `/services/plombier/jonquerettes/klc-84-help-confort-vaucluse-999838139`                                                     |     2 |   23 |   8.70% |  5.3 |
| `/services/platrier/flers/ozkan-ozturk-bati-orne-447757865`                                                                  |     2 |   23 |   8.70% |  5.5 |
| `/services/plombier/metz/queuleu`                                                                                            |     2 |   23 |   8.70% |  5.6 |
| `/services/peintre-en-batiment/sete/centre-ville`                                                                            |     2 |   23 |   8.70% |  8.1 |
| `/services/diagnostiqueur/paris/evolis-habitat-991882176`                                                                    |     2 |   23 |   8.70% |  9.3 |
| `/services/peintre-en-batiment/antibes`                                                                                      |     2 |   23 |   8.70% | 10.0 |
| `/services/peintre-en-batiment/roubaix`                                                                                      |     2 |   23 |   8.70% | 11.2 |
| `/services/menuisier/montmagny/montmorency`                                                                                  |     2 |   23 |   8.70% | 18.0 |
| `/services/electricien/chalette-sur-loing/montargis`                                                                         |     2 |   23 |   8.70% | 29.4 |
| `/services/electricien/toulouse`                                                                                             |     2 |   23 |   8.70% | 30.7 |
| `/services/couvreur/pluvigner/a3503c48a9d169da`                                                                              |     2 |   22 |   9.09% |  3.7 |
| `/services/carreleur/colombes`                                                                                               |     2 |   22 |   9.09% |  5.4 |
| `/services/peintre-en-batiment/saint-martin-d-heres/gieres`                                                                  |     2 |   22 |   9.09% |  6.0 |
| `/services/macon/vauvert`                                                                                                    |     2 |   22 |   9.09% |  6.0 |
| `/services/plombier/saint-etienne-du-rouvray/belbeuf`                                                                        |     2 |   22 |   9.09% |  7.1 |
| `/services/plombier/segre-en-anjou-bleu/centre-ville`                                                                        |     2 |   22 |   9.09% | 10.2 |
| `/services/macon/ajaccio`                                                                                                    |     2 |   22 |   9.09% | 12.3 |
| `/services/peintre-en-batiment/tourcoing`                                                                                    |     2 |   22 |   9.09% | 15.5 |
| `/services/electricien/sucy-en-brie`                                                                                         |     2 |   21 |   9.52% |  4.5 |
| `/services/macon/mezidon-vallee-d-auge/748d07616ea607e9`                                                                     |     2 |   21 |   9.52% |  4.7 |
| `/services/macon/brest`                                                                                                      |     2 |   21 |   9.52% |  7.2 |
| `/services/plombier/torcieu/e-l-plomberie-939958302`                                                                         |     2 |   21 |   9.52% |  8.4 |
| `/services/plombier/yebleron/monville-antoine-509355541`                                                                     |     2 |   21 |   9.52% | 10.1 |
| `/services/carreleur/dunkerque`                                                                                              |     2 |   21 |   9.52% | 13.7 |
| `/services/menuisier/nice`                                                                                                   |     2 |   21 |   9.52% | 19.7 |
| `/services/carreleur/charleville-mezieres`                                                                                   |     2 |   21 |   9.52% | 20.6 |
| `/services/menuisier/lorient`                                                                                                |     2 |   21 |   9.52% | 21.1 |
| `/services/solier/aubagne/mathieu-forcetti-force-renov-925195109`                                                            |     2 |   20 |  10.00% |  1.9 |
| `/services/chauffagiste/vesoul/f8f7b7fcc2fb2d44`                                                                             |     2 |   20 |  10.00% |  4.3 |
| `/services/peintre-en-batiment/caudebec-les-elbeuf/mathieu-mathieu-432585727`                                                |     2 |   20 |  10.00% |  5.0 |
| `/services/jardinier/pirae`                                                                                                  |     2 |   20 |  10.00% |  5.3 |
| `/services/terrassier/saint-maurice-de-gourdans/jeremy-verchere-jerem-espaces-verts-952799104`                               |     2 |   20 |  10.00% |  5.7 |
| `/services/solier/le-havre`                                                                                                  |     2 |   20 |  10.00% |  7.8 |
| `/services/couvreur/lys-lez-lannoy/eric-guaine-guaine-eric-entreprise-de-couverture-zinguerie-537918294`                     |     2 |   20 |  10.00% |  8.3 |
| `/services/platrier/bourgoin-jallieu`                                                                                        |     2 |   20 |  10.00% |  8.9 |
| `/services/carreleur/frontignan/balaruc-les-bains`                                                                           |     2 |   20 |  10.00% |  9.2 |
| `/services/architecte-interieur/le-robert`                                                                                   |     2 |   20 |  10.00% |  9.3 |
| `/services/plombier/annecy`                                                                                                  |     2 |   20 |  10.00% | 20.0 |
| `/services/chauffagiste/toulon`                                                                                              |     2 |   20 |  10.00% | 21.4 |
| `/services/paysagiste/cancale`                                                                                               |     2 |   20 |  10.00% | 24.1 |
| `/services/plombier/dinard/saint-briac-sur-mer`                                                                              |     2 |   20 |  10.00% | 26.1 |
| `/services/charpentier/savigny-le-temple`                                                                                    |     2 |   20 |  10.00% | 33.1 |
| `/services/serrurier/montpellier/hassan-boutahir-bth-serrure-840784615`                                                      |     2 |   19 |  10.53% |  4.0 |
| `/services/chauffagiste/narbonne/4bbc1111ff964005`                                                                           |     2 |   19 |  10.53% |  5.3 |
| `/services/macon/echirolles/bati-38-maconnerie-984584532`                                                                    |     2 |   19 |  10.53% |  6.4 |
| `/services/solier/theziers/guillaume-lambert-au-fer-et-a-mesure-788741890`                                                   |     2 |   19 |  10.53% |  8.1 |
| `/services/macon/cholet/dafc6069ebbb22bf`                                                                                    |     2 |   19 |  10.53% |  9.5 |
| `/services/menuisier/vauvert/aimargues`                                                                                      |     2 |   19 |  10.53% | 14.9 |
| `/services/solier/miramas/jean-luc-di-domizio-753434844`                                                                     |     2 |   18 |  11.11% |  6.0 |
| `/services/peintre-en-batiment/bezons/cormeilles-en-parisis`                                                                 |     2 |   18 |  11.11% |  6.9 |
| `/services/carreleur/chaumont`                                                                                               |     2 |   18 |  11.11% |  9.2 |
| `/services/serrurier/somain/auberchicourt`                                                                                   |     2 |   18 |  11.11% | 13.1 |
| `/services/carreleur/corte/lb-carrelage-892321605`                                                                           |     2 |   18 |  11.11% | 14.2 |
| `/services/electricien/saint-etienne`                                                                                        |     2 |   18 |  11.11% | 15.1 |
| `/services/menuisier/six-fours-les-plages/b029b022bbdc2f0f`                                                                  |     2 |   18 |  11.11% | 30.1 |
| `/services/couvreur/verdun`                                                                                                  |     2 |   18 |  11.11% | 37.6 |
| `/services/carreleur/mauvezin-sur-gupie/bruno-michaud-912598224`                                                             |     2 |   17 |  11.76% |  3.8 |
| `/services/electricien/saint-marc-jaumegarde/valente-electricite-generale-978310381`                                         |     2 |   17 |  11.76% |  5.2 |
| `/services/geometre/nohic/ridha-boukhili-archi-diag-conseil-397832304`                                                       |     2 |   17 |  11.76% |  5.8 |
| `/services/isolation-thermique/arinthod/ali-eren-tufekci-tufex-910292127`                                                    |     2 |   17 |  11.76% |  7.2 |
| `/services/electricien/hyeres`                                                                                               |     2 |   17 |  11.76% |  7.7 |
| `/services/electricien/chalon-sur-saone/bfd5a7e8c18eb1f9`                                                                    |     2 |   17 |  11.76% |  7.7 |
| `/services/plombier/hericourt/7edc2d0814135058`                                                                              |     2 |   17 |  11.76% |  8.2 |
| `/services/menuisier/caluire-et-cuire`                                                                                       |     2 |   17 |  11.76% |  8.3 |
| `/services/plombier/heillecourt/f2e-532712163`                                                                               |     2 |   17 |  11.76% |  8.8 |
| `/services/ascensoriste/les-sables-d-olonne/eda98fb6a2d3f664`                                                                |     2 |   17 |  11.76% | 12.2 |
| `/services/macon/royan`                                                                                                      |     2 |   17 |  11.76% | 13.8 |
| `/services/climaticien/le-muy`                                                                                               |     2 |   17 |  11.76% | 22.2 |
| `/services/solier/bellevigne-en-layon/guillaume-sauloup-home-tech-services-835194960`                                        |     2 |   16 |  12.50% |  2.6 |
| `/services/solier/agen`                                                                                                      |     2 |   16 |  12.50% |  4.1 |
| `/services/paysagiste/bras-panon/sebastien-marimoutou-eden-garden-974-897744082`                                             |     2 |   16 |  12.50% |  4.9 |
| `/services/solier/berck/arthur-grecourt-927979773`                                                                           |     2 |   16 |  12.50% |  5.1 |
| `/services/terrassier/la-possession/saint-denis`                                                                             |     2 |   16 |  12.50% |  6.5 |
| `/services/macon/bonneville/a63ffc7959d5d738`                                                                                |     2 |   16 |  12.50% |  6.8 |
| `/services/cuisiniste/les-abymes/petit-canal`                                                                                |     2 |   16 |  12.50% |  7.0 |
| `/services/plombier/vitry-le-francois/5f4fba2058a4f1b6`                                                                      |     2 |   16 |  12.50% |  7.8 |
| `/services/paysagiste/trappes/bois-d-arcy`                                                                                   |     2 |   16 |  12.50% |  7.9 |
| `/services/architecte-interieur/le-francois/ducos`                                                                           |     2 |   16 |  12.50% |  8.8 |
| `/services/macon/savigny-sur-orge/morangis`                                                                                  |     2 |   16 |  12.50% |  8.9 |
| `/services/charpentier/le-passage/eric-barrere-385027370`                                                                    |     2 |   16 |  12.50% | 10.3 |
| `/services/solier/montendre/anthony-jaillant-aj-batiment-919620468`                                                          |     2 |   16 |  12.50% | 11.1 |
| `/services/desinsectisation/caussade/dafbba136b1202c1`                                                                       |     2 |   16 |  12.50% | 14.9 |
| `/services/plombier/malzeville/a0733a7c94de123c`                                                                             |     2 |   16 |  12.50% | 17.9 |
| `/services/charpentier/le-tampon/jean-patrick-maillot-jpm-charpente-couverture-491837712`                                    |     2 |   16 |  12.50% | 23.3 |
| `/services/menuisier/chelles/f59daf9512863623`                                                                               |     2 |   15 |  13.33% |  2.9 |
| `/services/plombier/argenteuil/c9041360c5527bd5`                                                                             |     2 |   15 |  13.33% |  4.0 |
| `/services/macon/rennes/dc689274459269f7`                                                                                    |     2 |   15 |  13.33% |  4.3 |
| `/services/carreleur/sene/kasim-bozkurt-bozkurt-carrelage-maconnerie-510790488`                                              |     2 |   15 |  13.33% |  5.0 |
| `/services/electricien/castanet-tolosan/ramzi-ghammouri-ramzi-elec-753373075`                                                |     2 |   15 |  13.33% |  5.5 |
| `/services/geometre/orsay/gif-sur-yvette`                                                                                    |     2 |   15 |  13.33% |  5.5 |
| `/services/macon/vierzon/antonio-cesar-485392427`                                                                            |     2 |   15 |  13.33% |  5.9 |
| `/services/geometre/offranville/jean-pierre-caron-788371417`                                                                 |     2 |   15 |  13.33% |  5.9 |
| `/services/climaticien/saint-jean-de-monts/elric-pajot-a-c-climatic-882259500`                                               |     2 |   15 |  13.33% |  6.9 |
| `/services/peintre-en-batiment/enghien-les-bains/anis-haba-madeco-489450304`                                                 |     2 |   15 |  13.33% |  7.0 |
| `/services/chauffagiste/tarbes/eurl-christian-depannage-797857976`                                                           |     2 |   15 |  13.33% |  7.1 |
| `/services/plombier/mazamet/alexandre-garcia-982492407`                                                                      |     2 |   15 |  13.33% |  7.1 |
| `/services/electricien/savigny-sur-orge/morangis`                                                                            |     2 |   15 |  13.33% |  7.9 |
| `/services/pisciniste/toulouse/adel-mhamdi-adel-piscine-habitat-447857517`                                                   |     2 |   15 |  13.33% |  8.4 |
| `/services/cuisiniste/aulnay-sous-bois`                                                                                      |     2 |   15 |  13.33% |  8.6 |
| `/services/peintre-en-batiment/boulogne-billancourt`                                                                         |     2 |   15 |  13.33% |  9.1 |
| `/services/carreleur/saint-evarzec/kerne-carrelage-880403209`                                                                |     2 |   15 |  13.33% |  9.3 |
| `/services/carreleur/ales`                                                                                                   |     2 |   15 |  13.33% |  9.4 |
| `/services/peintre-en-batiment/chartres`                                                                                     |     2 |   15 |  13.33% | 15.3 |
| `/services/electricien/dammarie-les-lys`                                                                                     |     2 |   15 |  13.33% | 18.7 |
| `/services/menuisier/ambert/82e08a1d91c62f89`                                                                                |     2 |   14 |  14.29% |  2.4 |
| `/services/paysagiste/draguignan/mustapha-dja-yahia-adm-paysage-835230186`                                                   |     2 |   14 |  14.29% |  2.9 |
| `/services/electricien/marseille/francois-recanatesi-logic-renov-789734431`                                                  |     2 |   14 |  14.29% |  3.4 |
| `/services/macon/bergerac/24cc0c494c900949`                                                                                  |     2 |   14 |  14.29% |  3.4 |
| `/services/plombier/villeurbanne/9a916ee68de0fa24`                                                                           |     2 |   14 |  14.29% |  4.4 |
| `/services/plombier/champigny-sur-marne/a-j-d-907466916`                                                                     |     2 |   14 |  14.29% |  6.0 |
| `/services/peintre-en-batiment/chaumont`                                                                                     |     2 |   14 |  14.29% |  6.8 |
| `/services/poseur-de-parquet/montrevault-sur-evre/sylvain-grimaud-ponce-parquet-800164501`                                   |     2 |   14 |  14.29% |  6.9 |
| `/services/solier/paris/ilibat-989770243`                                                                                    |     2 |   14 |  14.29% |  7.2 |
| `/services/peintre-en-batiment/vigneux-de-bretagne/jean-luc-bretecher-851037754`                                             |     2 |   14 |  14.29% |  7.3 |
| `/services/macon/blois`                                                                                                      |     2 |   14 |  14.29% |  7.6 |
| `/services/plombier/calvi/denis-serra-810568642`                                                                             |     2 |   14 |  14.29% |  7.7 |
| `/services/plombier/cusset/eurl-rattat-938904711`                                                                            |     2 |   14 |  14.29% |  7.9 |
| `/services/carreleur/lormont/yvrac`                                                                                          |     2 |   14 |  14.29% |  8.1 |
| `/services/menuisier/metz`                                                                                                   |     2 |   14 |  14.29% |  8.6 |
| `/services/macon/souvigny/alberto-da-costa-447937012`                                                                        |     2 |   14 |  14.29% |  9.9 |
| `/services/platrier/les-pavillons-sous-bois/jp-renovation-2000-524873353`                                                    |     2 |   14 |  14.29% | 11.4 |
| `/services/plombier/chalons-en-champagne`                                                                                    |     2 |   14 |  14.29% | 16.9 |
| `/services/plombier/remire-montjoly/guyane-detection-933144420`                                                              |     2 |   14 |  14.29% | 22.2 |
| `/services/peintre-en-batiment/avrille/333256c7f1467123`                                                                     |     2 |   14 |  14.29% | 23.6 |
| `/services/peintre-en-batiment/vigneux-de-bretagne/guillaume-boullery-gb-peinture-911777530`                                 |     2 |   13 |  15.38% |  2.7 |
| `/services/macon/cusset/tom-cellier-cellier-bati-822838421`                                                                  |     2 |   13 |  15.38% |  3.5 |
| `/services/climaticien/alencon/a0fccd2b7bd052e2`                                                                             |     2 |   13 |  15.38% |  4.2 |
| `/services/electricien/cagnes-sur-mer/pascal-duhem-d-p-s-412272536`                                                          |     2 |   13 |  15.38% |  4.2 |
| `/services/plombier/bron/isa-kurnaz-plombier-69-912588597`                                                                   |     2 |   13 |  15.38% |  4.5 |
| `/services/plombier/monistrol-sur-loire/loic-mallard-slr-solutions-933376568`                                                |     2 |   13 |  15.38% |  4.5 |
| `/services/couvreur/narbonne/samuel-ortis-999401771`                                                                         |     2 |   13 |  15.38% |  5.5 |
| `/services/carreleur/peronnas/mister-carrelages-893116699`                                                                   |     2 |   13 |  15.38% |  5.8 |
| `/services/menuisier/perigueux`                                                                                              |     2 |   13 |  15.38% |  5.9 |
| `/services/antenniste/limoges/fibre-co-831605175`                                                                            |     2 |   13 |  15.38% |  6.1 |
| `/services/electricien/baie-mahault/charles-bibrac-491547097`                                                                |     2 |   13 |  15.38% |  6.9 |
| `/services/electricien/rennes`                                                                                               |     2 |   13 |  15.38% |  7.6 |
| `/services/plombier/bastia`                                                                                                  |     2 |   13 |  15.38% |  8.3 |
| `/services/menuisier/clermont-ferrand`                                                                                       |     2 |   13 |  15.38% |  8.5 |
| `/services/serrurier/bout-du-pont-de-larn/karim-bouziane-bk-serrurerie-899186126`                                            |     2 |   13 |  15.38% |  9.0 |
| `/services/carreleur/illkirch-graffenstaden/geispolsheim`                                                                    |     2 |   13 |  15.38% |  9.7 |
| `/services/electricien/saint-lo`                                                                                             |     2 |   13 |  15.38% | 12.4 |
| `/services/couvreur/morsang-sur-orge`                                                                                        |     2 |   13 |  15.38% | 14.7 |
| `/services/couvreur/chauny`                                                                                                  |     2 |   13 |  15.38% | 17.8 |
| `/services/peintre-en-batiment/bergerac/rode-908931074`                                                                      |     2 |   13 |  15.38% | 17.9 |
| `/services/pompe-a-chaleur/pau/5dbaaed1717538c3`                                                                             |     2 |   13 |  15.38% | 18.5 |
| `/services/solier/saran/patrice-sornique-sornique-352210470`                                                                 |     2 |   12 |  16.67% |  2.8 |
| `/services/menuisier/montreuil/zala-981885072`                                                                               |     2 |   12 |  16.67% |  3.4 |
| `/services/electricien/bourges/jean-philippe-mazer-jpm-renovation-515351559`                                                 |     2 |   12 |  16.67% |  4.2 |
| `/services/isolation-thermique/vendargues/5df1b06636587ad2`                                                                  |     2 |   12 |  16.67% |  4.6 |
| `/services/couvreur/rennes/rocky-sauzer-rs-toiture-799473475`                                                                |     2 |   12 |  16.67% |  5.2 |
| `/services/macon/saint-cyprien/c8871b5399a1173b`                                                                             |     2 |   12 |  16.67% |  5.8 |
| `/services/macon/wambrechies/gaetan-beddelem-513563072`                                                                      |     2 |   12 |  16.67% |  5.8 |
| `/services/carreleur/schiltigheim/centre-ville`                                                                              |     2 |   12 |  16.67% |  5.9 |
| `/services/plombier/metz/adrien-gilbert-ad-plomberie-977519263`                                                              |     2 |   12 |  16.67% |  6.0 |
| `/services/couvreur/villenave-d-ornon/c9b7ae05decfa444`                                                                      |     2 |   12 |  16.67% |  6.2 |
| `/services/nettoyage/porto-vecchio/VpHyp20kz6ScDv6I`                                                                         |     2 |   12 |  16.67% |  6.3 |
| `/services/geometre/vichy/a23864de6fb92d54`                                                                                  |     2 |   12 |  16.67% |  6.4 |
| `/services/peintre-en-batiment/antibes/m-bk-renovation-910234814`                                                            |     2 |   12 |  16.67% |  6.4 |
| `/services/plombier/saint-mande/all-renov-star-all-renov-star-451369367`                                                     |     2 |   12 |  16.67% |  6.4 |
| `/services/serrurier/biarritz/zms-zabala-metallerie-serrurerie-zms-824087977`                                                |     2 |   12 |  16.67% |  6.9 |
| `/services/menuisier/gap`                                                                                                    |     2 |   12 |  16.67% |  7.1 |
| `/services/electricien/nevers/921656ea8c9bd0f3`                                                                              |     2 |   12 |  16.67% |  8.5 |
| `/services/couvreur/guernes/florian-gomez-751837568`                                                                         |     2 |   12 |  16.67% | 10.6 |
| `/services/peintre-en-batiment/saint-priest/construction-batiment-services-rhone-alpes-900211541`                            |     2 |   12 |  16.67% | 13.6 |
| `/services/plombier/lys-lez-lannoy/selim-recham-recham-selim-plomberie-750145815`                                            |     2 |   12 |  16.67% | 22.8 |
| `/services/macon/la-ciotat/cassis`                                                                                           |     2 |   12 |  16.67% | 23.9 |
| `/services/plombier/magny-les-hameaux/marc-faia-415151091`                                                                   |     2 |   12 |  16.67% | 27.8 |
| `/services/electricien/poulx/guy-giboin-789031192`                                                                           |     2 |   11 |  18.18% |  2.8 |
| `/services/menuisier/ales/morgan-bastide-mb-menuiserie-915073571`                                                            |     2 |   11 |  18.18% |  4.1 |
| `/services/macon/drancy/bate-renov-833639966`                                                                                |     2 |   11 |  18.18% |  5.0 |
| `/services/peintre-en-batiment/saint-aignan-sur-ry/kevin-van-hooland-981332943`                                              |     2 |   11 |  18.18% |  5.2 |
| `/services/electricien/annecy/1e7f15f6134c5da9`                                                                              |     2 |   11 |  18.18% |  5.3 |
| `/services/architecte-interieur/nice/alison-tartary-l-immobilier-pour-elle-844575704`                                        |     2 |   11 |  18.18% |  5.8 |
| `/services/peintre-en-batiment/grenade/7cad08ef4e4d1aee`                                                                     |     2 |   11 |  18.18% |  6.1 |
| `/services/solier/les-angles`                                                                                                |     2 |   11 |  18.18% |  6.7 |
| `/services/carreleur/grasse`                                                                                                 |     2 |   11 |  18.18% |  6.8 |
| `/services/plombier/toulon/a8eebfdca1d179f9`                                                                                 |     2 |   11 |  18.18% |  7.4 |
| `/services/plombier/bras-panon/sainte-marie`                                                                                 |     2 |   11 |  18.18% |  7.5 |
| `/services/ascensoriste/seyssinet-pariset/f1d70ef61c6ee2ad`                                                                  |     2 |   11 |  18.18% |  7.8 |
| `/services/climaticien/la-seyne-sur-mer`                                                                                     |     2 |   11 |  18.18% |  8.1 |
| `/services/platrier/peillac/hemery-camille-931426837`                                                                        |     2 |   11 |  18.18% |  8.4 |
| `/services/architecte-interieur/villebon-sur-yvette/samy-zaidi-844000430`                                                    |     2 |   11 |  18.18% |  8.4 |
| `/services/solier/le-pecq/atelier-k-paris-atelier-k-paris-992580118`                                                         |     2 |   11 |  18.18% |  8.4 |
| `/services/peintre-en-batiment/vernon/saint-marcel`                                                                          |     2 |   11 |  18.18% |  8.6 |
| `/services/architecte-interieur/les-lilas/syntaxe-architecture-849151345`                                                    |     2 |   11 |  18.18% |  8.6 |
| `/services/macon/tignieu-jameyzieu`                                                                                          |     2 |   11 |  18.18% |  8.8 |
| `/services/electricien/saintes`                                                                                              |     2 |   11 |  18.18% | 11.4 |
| `/services/geometre/villefranche-sur-saone`                                                                                  |     2 |   11 |  18.18% | 12.1 |
| `/services/serrurier/strasbourg/f4bd985bc52b4426`                                                                            |     2 |   11 |  18.18% | 12.2 |
| `/services/electricien/chevillon/frederic-collin-home-connexion-992554311`                                                   |     2 |   11 |  18.18% | 17.3 |
| `/services/architecte-interieur/la-celle-saint-cloud/luc-cremades-418018602`                                                 |     2 |   11 |  18.18% | 31.6 |
| `/services/couvreur/frouzins/af8310552b61cdcf`                                                                               |     2 |   11 |  18.18% | 36.0 |
| `/services/carreleur/divonne-les-bains/7301410f6a4d4550`                                                                     |     2 |   10 |  20.00% |  2.3 |
| `/services/cuisiniste/aubignan/71b4b7c4211f0749`                                                                             |     2 |   10 |  20.00% |  2.3 |
| `/services/peintre-en-batiment/longwy/melanie-maiolo-sztuka-l-atelier-de-la-matiere-grise-504475658`                         |     2 |   10 |  20.00% |  2.6 |
| `/services/peintre-en-batiment/tregueux/603462563c34a0ec`                                                                    |     2 |   10 |  20.00% |  2.6 |
| `/services/macon/cormoz/arnaud-dominici-art-now-construction-913440103`                                                      |     2 |   10 |  20.00% |  2.7 |
| `/services/couvreur/pluvigner/anthony-gueguin-restez-couvert-ure-991082454`                                                  |     2 |   10 |  20.00% |  3.5 |
| `/services/geometre/montanges/melanie-portier-labelfenetre01-881285290`                                                      |     2 |   10 |  20.00% |  3.5 |
| `/services/plombier/narbonne/19e72a49194224b9`                                                                               |     2 |   10 |  20.00% |  3.5 |
| `/services/solier/le-pecq/laurent-villejoubert-arbustes-et-jardins-518843347`                                                |     2 |   10 |  20.00% |  3.5 |
| `/services/macon/la-ciotat/michael-laissus-ciotat-bati-788589760`                                                            |     2 |   10 |  20.00% |  3.8 |
| `/services/zingueur/privas/31d89ceb23745528`                                                                                 |     2 |   10 |  20.00% |  3.8 |
| `/services/plombier/cabries/f69183968eff46ca`                                                                                |     2 |   10 |  20.00% |  3.9 |
| `/services/peintre-en-batiment/cadaujac/34d138e2a729a91a`                                                                    |     2 |   10 |  20.00% |  4.0 |
| `/services/macon/chambery/adem-yilmaz-828745786`                                                                             |     2 |   10 |  20.00% |  4.2 |
| `/services/etancheiste/saint-priest/baran-etancheite-999534860`                                                              |     2 |   10 |  20.00% |  4.3 |
| `/services/macon/saint-dizier/658dc456f81abe36`                                                                              |     2 |   10 |  20.00% |  4.6 |
| `/services/couvreur/outreau/7d71f4231b9e4b8f`                                                                                |     2 |   10 |  20.00% |  5.0 |
| `/services/electricien/realville/sebastien-sancha-494677867`                                                                 |     2 |   10 |  20.00% |  5.0 |
| `/services/macon/le-cannet/france-intelex-524172491`                                                                         |     2 |   10 |  20.00% |  5.0 |
| `/services/couvreur/valensole/anthony-haubois-couvreur-de-provence-521412726`                                                |     2 |   10 |  20.00% |  5.1 |
| `/services/electricien/clisson/0eca9de845258aaa`                                                                             |     2 |   10 |  20.00% |  5.1 |
| `/services/chauffagiste/lorry-les-metz/raphael-matusiak-rm-chauf-943946210`                                                  |     2 |   10 |  20.00% |  5.9 |
| `/services/menuisier/saint-trivier-sur-moignans/thierry-lysowec-479916587`                                                   |     2 |   10 |  20.00% |  6.0 |
| `/services/chauffagiste/frejus`                                                                                              |     2 |   10 |  20.00% |  6.4 |
| `/services/menuisier/metz/francois-bardin-bf-multiservices-507961688`                                                        |     2 |   10 |  20.00% |  6.5 |
| `/services/serrurier/montpellier/oumarou-camara-serrurier-montpellier-svps-depannage-serrure-en-urgence-a-montpel-810673368` |     2 |   10 |  20.00% |  7.2 |
| `/services/charpentier/oyonnax/efb-charpente-818355810`                                                                      |     2 |   10 |  20.00% |  7.3 |
| `/services/plombier/saint-mande/sacha-partouche-sacha-partouche-898074794`                                                   |     2 |   10 |  20.00% |  7.4 |
| `/services/serrurier/cormeilles-en-parisis/artur-service-505163865`                                                          |     2 |   10 |  20.00% |  7.5 |
| `/services/plombier/arnouville/624988325f045c33`                                                                             |     2 |   10 |  20.00% |  7.9 |
| `/services/solier/vence/eric-corniglion-327758421`                                                                           |     2 |   10 |  20.00% |  8.0 |
| `/services/electricien/manosque`                                                                                             |     2 |   10 |  20.00% |  9.6 |
| `/services/architecte-interieur/brie-comte-robert/niels-brinjean-824231179`                                                  |     2 |   10 |  20.00% | 10.8 |
| `/services/terrassier/laruscade/piscines-lnc-840267157`                                                                      |     2 |   10 |  20.00% | 11.2 |
| `/services/plombier/puymeras/thomas-dupont-501771737`                                                                        |     2 |   10 |  20.00% | 11.5 |
| `/services/plombier/ambilly/jhs-plomberie-chauffage-949757504`                                                               |     2 |   10 |  20.00% | 13.9 |
| `/services/plombier/ales`                                                                                                    |     2 |   10 |  20.00% | 14.0 |
| `/services/macon/lormont/yvrac`                                                                                              |     2 |   10 |  20.00% | 16.6 |

### `/tarifs/[s]/[v]` — 34 URL(s) à exclure

| URL                                          | Clics | Imp |    CTR |  Pos |
| -------------------------------------------- | ----: | --: | -----: | ---: |
| `/tarifs/jardinier/punaauia`                 |     6 |  74 |  8.11% |  5.5 |
| `/tarifs/nettoyage/noumea`                   |     5 | 113 |  4.42% |  5.9 |
| `/tarifs/borne-recharge/cagnes-sur-mer`      |     5 |  21 | 23.81% |  6.2 |
| `/tarifs/paysagiste/rennes`                  |     4 |  86 |  4.65% | 14.2 |
| `/tarifs/macon/baie-mahault`                 |     4 |  46 |  8.70% |  3.8 |
| `/tarifs/carreleur/les-abymes`               |     3 |  59 |  5.08% |  4.3 |
| `/tarifs/carreleur/toulouse`                 |     3 |  46 |  6.52% | 12.7 |
| `/tarifs/jardinier/les-abymes`               |     3 |  40 |  7.50% |  3.9 |
| `/tarifs/borne-recharge/evry-courcouronnes`  |     3 |  17 | 17.65% |  5.9 |
| `/tarifs/macon/limoges`                      |     3 |  15 | 20.00% | 13.0 |
| `/tarifs/macon/riviere-salee`                |     3 |   6 | 50.00% |  3.2 |
| `/tarifs/borne-recharge/longuenesse`         |     3 |   4 | 75.00% |  3.2 |
| `/tarifs/couvreur/montaigu-vendee`           |     3 |   4 | 75.00% |  6.2 |
| `/tarifs/plombier/paris`                     |     2 | 891 |  0.22% | 30.4 |
| `/tarifs/peintre-en-batiment/toulouse`       |     2 | 154 |  1.30% |  5.6 |
| `/tarifs/carreleur/marseille`                |     2 | 129 |  1.55% |  6.9 |
| `/tarifs/demenageur/brest`                   |     2 | 118 |  1.69% | 12.6 |
| `/tarifs/panneaux-solaires/papeete`          |     2 | 116 |  1.72% |  5.0 |
| `/tarifs/nettoyage/caen`                     |     2 |  71 |  2.82% | 10.1 |
| `/tarifs/desinsectisation/le-havre`          |     2 |  38 |  5.26% | 23.1 |
| `/tarifs/peintre-en-batiment/perpignan`      |     2 |  36 |  5.56% | 14.1 |
| `/tarifs/nettoyage/porto-vecchio`            |     2 |  35 |  5.71% |  9.0 |
| `/tarifs/paysagiste/caen`                    |     2 |  33 |  6.06% | 27.1 |
| `/tarifs/jardinier/lens`                     |     2 |  30 |  6.67% |  6.5 |
| `/tarifs/cuisiniste/le-marin`                |     2 |  27 |  7.41% |  6.7 |
| `/tarifs/plombier/fort-de-france`            |     2 |  24 |  8.33% |  3.5 |
| `/tarifs/carreleur/papeete`                  |     2 |  22 |  9.09% |  4.5 |
| `/tarifs/borne-recharge/poitiers`            |     2 |  20 | 10.00% |  7.3 |
| `/tarifs/borne-recharge/saint-brieuc`        |     2 |  19 | 10.53% | 12.9 |
| `/tarifs/jardinier/bordeaux`                 |     2 |  18 | 11.11% |  6.4 |
| `/tarifs/peintre-en-batiment/fort-de-france` |     2 |  14 | 14.29% |  3.8 |
| `/tarifs/nettoyage/roanne`                   |     2 |  13 | 15.38% | 19.8 |
| `/tarifs/peintre-en-batiment/narbonne`       |     2 |  12 | 16.67% |  8.2 |
| `/tarifs/jardinier/haguenau`                 |     2 |  11 | 18.18% |  4.5 |

### `/tarifs/[s]/[v]/[task]` — 100 URL(s) à exclure

| URL                                                                                          | Clics | Imp |     CTR |  Pos |
| -------------------------------------------------------------------------------------------- | ----: | --: | ------: | ---: |
| `/tarifs/macon/noumea/construction-d-une-extension`                                          |     5 |  39 |  12.82% |  3.7 |
| `/tarifs/menuisier/vitrolles/pose-d-une-fenetre-double-vitrage-pvc`                          |     5 |   6 |  83.33% |  4.7 |
| `/tarifs/carreleur/montauban/pose-de-carrelage-au-sol-format-standard`                       |     4 |  56 |   7.14% | 19.2 |
| `/tarifs/demenageur/papeete/garde-meubles`                                                   |     4 |  18 |  22.22% |  7.1 |
| `/tarifs/vitrier/noumea/installation-d-une-paroi-de-douche-en-verre`                         |     4 |  12 |  33.33% |  5.5 |
| `/tarifs/jardinier/ales/installation-d-arrosage-automatique`                                 |     4 |  10 |  40.00% | 12.8 |
| `/tarifs/couvreur/toulouse/nettoyage-et-demoussage-de-toiture`                               |     3 | 456 |   0.66% | 50.9 |
| `/tarifs/jardinier/paris/tonte-de-pelouse-jardin-de-200-m`                                   |     3 | 162 |   1.85% | 37.3 |
| `/tarifs/solier/saint-pierre/pose-de-sol-pvc-vinyle-en-lames-ou-dalles`                      |     3 | 121 |   2.48% | 11.4 |
| `/tarifs/jardinier/noumea/entretien-mensuel-d-un-jardin-200-m`                               |     3 |  69 |   4.35% |  4.5 |
| `/tarifs/jardinier/marseille/elagage-d-arbre-hauteur-moyenne`                                |     3 |  56 |   5.36% | 21.7 |
| `/tarifs/vitrier/marseille/remplacement-d-une-vitre-cassee-standard`                         |     3 |  48 |   6.25% |  8.7 |
| `/tarifs/serrurier/amiens/copie-de-cle-standard-ou-haute-securite`                           |     3 |  39 |   7.69% | 16.5 |
| `/tarifs/vitrier/nimes/installation-d-un-garde-corps-en-verre-balcon-terrasse`               |     3 |  32 |   9.38% | 14.0 |
| `/tarifs/climaticien/perpignan/entretien-annuel-d-une-climatisation`                         |     3 |  31 |   9.68% |  3.6 |
| `/tarifs/jardinier/nice/entretien-mensuel-d-un-jardin-200-m`                                 |     3 |  30 |  10.00% |  4.5 |
| `/tarifs/diagnostiqueur/lyon/diagnostic-termites-zones-a-arrete-prefectoral`                 |     3 |  26 |  11.54% | 14.8 |
| `/tarifs/couvreur/noumea/reparation-de-fuite-de-toiture`                                     |     3 |  24 |  12.50% |  8.7 |
| `/tarifs/macon/perpignan/ravalement-de-facade-enduit-ou-crepi`                               |     3 |  18 |  16.67% |  9.8 |
| `/tarifs/vitrier/massy/remplacement-d-un-simple-vitrage`                                     |     3 |  16 |  18.75% | 23.3 |
| `/tarifs/peintre-en-batiment/dijon/peinture-de-plafond-seul`                                 |     3 |  15 |  20.00% | 12.1 |
| `/tarifs/plombier/rouen/detection-de-fuite-non-destructive-gaz-traceur-ou-camera-thermique`  |     3 |  14 |  21.43% | 27.9 |
| `/tarifs/chauffagiste/belfort/desembouage-d-un-circuit-de-chauffage`                         |     3 |   9 |  33.33% |  7.8 |
| `/tarifs/nettoyage/dijon/nettoyage-de-vitres-logement`                                       |     3 |   9 |  33.33% |  9.3 |
| `/tarifs/jardinier/saint-brieuc/entretien-mensuel-d-un-jardin-200-m`                         |     3 |   8 |  37.50% |  4.1 |
| `/tarifs/chauffagiste/strasbourg/desembouage-d-un-circuit-de-chauffage`                      |     3 |   7 |  42.86% |  7.7 |
| `/tarifs/cuisiniste/agen/cuisine-sur-mesure-haut-de-gamme`                                   |     3 |   6 |  50.00% | 15.7 |
| `/tarifs/terrassier/strasbourg/remblaiement-et-compactage-de-terrain`                        |     3 |   3 | 100.00% |  3.0 |
| `/tarifs/couvreur/les-sables-d-olonne/nettoyage-et-demoussage-de-toiture`                    |     2 | 205 |   0.98% | 37.3 |
| `/tarifs/menuisier/antibes/pose-d-une-fenetre-double-vitrage-pvc`                            |     2 | 140 |   1.43% | 52.1 |
| `/tarifs/vitrier/neuilly-sur-seine/remplacement-d-une-vitre-cassee-standard`                 |     2 | 136 |   1.47% | 26.6 |
| `/tarifs/carreleur/marseille/pose-de-carrelage-au-sol-format-standard`                       |     2 |  93 |   2.15% | 36.7 |
| `/tarifs/couvreur/marseille/refection-complete-de-toiture-100-m`                             |     2 |  80 |   2.50% | 15.9 |
| `/tarifs/serrurier/lyon/changement-de-serrure-standard`                                      |     2 |  60 |   3.33% | 19.5 |
| `/tarifs/zingueur/change/cheneau-zinc-sur-mesure`                                            |     2 |  59 |   3.39% | 12.4 |
| `/tarifs/chauffagiste/chelles/desembouage-d-un-circuit-de-chauffage`                         |     2 |  52 |   3.85% | 10.6 |
| `/tarifs/menuisier/lille/pose-d-une-porte-interieure`                                        |     2 |  49 |   4.08% | 22.2 |
| `/tarifs/nettoyage/nancy/nettoyage-de-copropriete-parties-communes`                          |     2 |  45 |   4.44% | 21.4 |
| `/tarifs/nettoyage/strasbourg/nettoyage-de-fin-de-chantier-appartement-60-m`                 |     2 |  45 |   4.44% | 47.9 |
| `/tarifs/macon/toulon/construction-d-une-extension`                                          |     2 |  44 |   4.55% | 46.5 |
| `/tarifs/peintre-en-batiment/noumea/peinture-de-plafond-seul`                                |     2 |  43 |   4.65% |  5.4 |
| `/tarifs/macon/perpignan/construction-d-un-mur-en-parpaings`                                 |     2 |  38 |   5.26% |  5.7 |
| `/tarifs/jardinier/marseille/entretien-mensuel-d-un-jardin-200-m`                            |     2 |  37 |   5.41% |  6.2 |
| `/tarifs/plombier/noumea/detection-de-fuite-non-destructive-gaz-traceur-ou-camera-thermique` |     2 |  37 |   5.41% |  7.4 |
| `/tarifs/jardinier/lorient/entretien-mensuel-d-un-jardin-200-m`                              |     2 |  37 |   5.41% | 31.8 |
| `/tarifs/nettoyage/toulouse/debarras-et-nettoyage-de-locaux`                                 |     2 |  35 |   5.71% |  5.7 |
| `/tarifs/zingueur/paris/remplacement-de-cheneaux`                                            |     2 |  35 |   5.71% | 25.9 |
| `/tarifs/carreleur/annecy/pose-de-carrelage-au-sol-format-standard`                          |     2 |  31 |   6.45% |  6.8 |
| `/tarifs/jardinier/blois/taille-de-haie`                                                     |     2 |  31 |   6.45% | 27.5 |
| `/tarifs/vitrier/bordeaux/remplacement-d-un-simple-vitrage`                                  |     2 |  30 |   6.67% | 11.3 |
| `/tarifs/jardinier/saint-quentin/entretien-mensuel-d-un-jardin-200-m`                        |     2 |  30 |   6.67% | 51.1 |
| `/tarifs/couvreur/dijon/nettoyage-et-demoussage-de-toiture`                                  |     2 |  29 |   6.90% |  8.4 |
| `/tarifs/peintre-en-batiment/caen/peinture-d-une-piece-murs-plafond-12-m`                    |     2 |  28 |   7.14% | 11.6 |
| `/tarifs/jardinier/meudon/elagage-d-arbre-hauteur-moyenne`                                   |     2 |  27 |   7.41% |  2.7 |
| `/tarifs/jardinier/brive-la-gaillarde/tonte-de-pelouse-jardin-de-200-m`                      |     2 |  26 |   7.69% | 48.4 |
| `/tarifs/serrurier/marseille/blindage-de-porte-existante`                                    |     2 |  25 |   8.00% |  7.0 |
| `/tarifs/electricien/tours/installation-d-un-interphone-ou-visiophone`                       |     2 |  25 |   8.00% |  9.7 |
| `/tarifs/jardinier/la-roche-sur-yon/entretien-mensuel-d-un-jardin-200-m`                     |     2 |  24 |   8.33% | 14.5 |
| `/tarifs/peintre-en-batiment/cannes/peinture-d-une-piece-murs-plafond-12-m`                  |     2 |  23 |   8.70% |  3.9 |
| `/tarifs/plombier/noumea/remplacement-d-un-chauffe-eau`                                      |     2 |  23 |   8.70% |  7.0 |
| `/tarifs/couvreur/caen/nettoyage-et-demoussage-de-toiture`                                   |     2 |  23 |   8.70% | 28.4 |
| `/tarifs/nettoyage/lorient/nettoyage-de-facade-karcher-professionnel`                        |     2 |  23 |   8.70% | 45.8 |
| `/tarifs/platrier/vitry-sur-seine/enduit-platre-traditionnel`                                |     2 |  22 |   9.09% |  7.7 |
| `/tarifs/etancheiste/noumea/etancheite-toiture-terrasse-membrane-bitume`                     |     2 |  20 |  10.00% |  3.9 |
| `/tarifs/nettoyage/caen/entretien-regulier-de-bureaux-et-locaux-professionnels`              |     2 |  20 |  10.00% | 21.9 |
| `/tarifs/couvreur/colomiers/refection-complete-de-toiture-100-m`                             |     2 |  20 |  10.00% | 59.6 |
| `/tarifs/jardinier/angouleme/entretien-mensuel-d-un-jardin-200-m`                            |     2 |  19 |  10.53% | 11.3 |
| `/tarifs/jardinier/papeete/entretien-mensuel-d-un-jardin-200-m`                              |     2 |  18 |  11.11% |  3.4 |
| `/tarifs/terrassier/noumea/creation-de-tranchees-pour-reseaux`                               |     2 |  18 |  11.11% |  5.3 |
| `/tarifs/jardinier/nantes/abattage-d-arbre-avec-dessouchage`                                 |     2 |  18 |  11.11% | 16.7 |
| `/tarifs/couvreur/aix-en-provence/refection-complete-de-toiture-100-m`                       |     2 |  18 |  11.11% | 24.9 |
| `/tarifs/peintre-en-batiment/orleans/ravalement-de-facade-enduit-peinture`                   |     2 |  17 |  11.76% |  6.0 |
| `/tarifs/serrurier/troyes/changement-de-serrure-standard`                                    |     2 |  17 |  11.76% | 64.7 |
| `/tarifs/climaticien/lille/desembouage-et-nettoyage-du-circuit-frigorifique`                 |     2 |  16 |  12.50% | 25.1 |
| `/tarifs/carreleur/ajaccio/pose-de-carrelage-au-sol-format-standard`                         |     2 |  15 |  13.33% |  2.5 |
| `/tarifs/electricien/noumea/pose-de-volets-roulants-electriques-par-volet`                   |     2 |  15 |  13.33% |  4.2 |
| `/tarifs/charpentier/avignon/traitement-charpente-par-injection-anti-termites-capricornes`   |     2 |  15 |  13.33% | 45.3 |
| `/tarifs/couvreur/brive-la-gaillarde/nettoyage-et-demoussage-de-toiture`                     |     2 |  15 |  13.33% | 57.1 |
| `/tarifs/peintre-en-batiment/brest/ravalement-de-facade-enduit-peinture`                     |     2 |  14 |  14.29% |  4.9 |
| `/tarifs/couvreur/perpignan/nettoyage-et-demoussage-de-toiture`                              |     2 |  14 |  14.29% | 14.6 |
| `/tarifs/jardinier/la-roche-sur-yon/tonte-de-pelouse-jardin-de-200-m`                        |     2 |  13 |  15.38% |  3.9 |
| `/tarifs/macon/brest/construction-d-une-extension`                                           |     2 |  13 |  15.38% |  7.7 |
| `/tarifs/couvreur/perpignan/refection-complete-de-toiture-100-m`                             |     2 |  13 |  15.38% | 17.2 |
| `/tarifs/peintre-en-batiment/pau/ravalement-de-facade-enduit-peinture`                       |     2 |  13 |  15.38% | 28.0 |
| `/tarifs/peintre-en-batiment/ales/ravalement-de-facade-enduit-peinture`                      |     2 |  12 |  16.67% |  2.5 |
| `/tarifs/jardinier/angers/tonte-de-pelouse-jardin-de-200-m`                                  |     2 |  12 |  16.67% |  3.9 |
| `/tarifs/climaticien/ajaccio/entretien-annuel-d-une-climatisation`                           |     2 |  12 |  16.67% |  4.2 |
| `/tarifs/solier/caen/pose-de-sol-souple-linoleum`                                            |     2 |  12 |  16.67% |  4.8 |
| `/tarifs/solier/versailles/pose-de-parquet-massif-colle`                                     |     2 |  11 |  18.18% |  3.8 |
| `/tarifs/jardinier/annecy/tonte-de-pelouse-jardin-de-200-m`                                  |     2 |  11 |  18.18% |  4.3 |
| `/tarifs/macon/troyes/reparation-de-fissures-structurelles`                                  |     2 |  11 |  18.18% |  7.1 |
| `/tarifs/carreleur/arras/pose-de-carrelage-au-sol-format-standard`                           |     2 |  11 |  18.18% | 14.1 |
| `/tarifs/nettoyage/le-chesnay-rocquencourt/nettoyage-de-vitres-logement`                     |     2 |  11 |  18.18% | 14.6 |
| `/tarifs/couvreur/brest/refection-complete-de-toiture-100-m`                                 |     2 |  11 |  18.18% | 31.4 |
| `/tarifs/serrurier/mulhouse/copie-de-cle-standard-ou-haute-securite`                         |     2 |  10 |  20.00% |  4.0 |
| `/tarifs/charpentier/noumea/construction-d-un-carport-ou-auvent-en-bois`                     |     2 |  10 |  20.00% |  5.8 |
| `/tarifs/nettoyage/romorantin-lanthenay/nettoyage-de-vitres-logement`                        |     2 |  10 |  20.00% |  7.8 |
| `/tarifs/solier/montlucon/pose-de-sol-souple-linoleum`                                       |     2 |  10 |  20.00% |  8.3 |
| `/tarifs/charpentier/montauban/construction-d-un-carport-ou-auvent-en-bois`                  |     2 |  10 |  20.00% |  8.6 |
| `/tarifs/climaticien/nantes/recharge-de-gaz-refrigerant`                                     |     2 |  10 |  20.00% | 12.5 |

### `/urgence/[s]/[v]` — 3 URL(s) à exclure

| URL                               | Clics | Imp |    CTR |  Pos |
| --------------------------------- | ----: | --: | -----: | ---: |
| `/urgence/electricien/noumea`     |     3 |  17 | 17.65% |  9.2 |
| `/urgence/plombier/quimperle`     |     2 |  25 |  8.00% | 19.1 |
| `/urgence/antenniste/saint-andre` |     2 |  15 | 13.33% |  6.5 |

## Alertes plan v1

Templates où la purge sèche perdrait des clics actifs :

| Template                 | Pages avec clics | Clics 90j en jeu |
| ------------------------ | ---------------: | ---------------: |
| `/services/[s]/[v]`      |              714 |             2026 |
| `/tarifs/[s]/[v]/[task]` |              100 |              236 |
| `/tarifs/[s]/[v]`        |               34 |               90 |
| `/avis/[s]/[v]`          |               28 |               72 |
| `/devis/[s]/[v]`         |                3 |                9 |
| `/urgence/[s]/[v]`       |                3 |                7 |
| `/problemes/*`           |                2 |                5 |
| `/avis/*`                |                1 |                2 |

**Total clics à risque** : 2447 / 14 054 (= **17.41%** du trafic 90j)

## Fichiers machine (à plugger dans `evaluateGonePath()`)

Liste plate, une URL par ligne :

```
/avis
/avis/demenageur/grenoble
/avis/couvreur/ploufragan
/avis/vitrier/noumea
/avis/plombier/papeete
/avis/couvreur/clermont-ferrand
/avis/geometre/baie-mahault
/avis/serrurier/saint-joseph
/avis/deratisation/angouleme
/avis/demenageur/la-ferte-mace
/avis/antenniste/saint-jean-d-angely
/avis/carreleur/schiltigheim
/avis/geometre/dunkerque
/avis/electricien/cambrai
/avis/carreleur/senlis
/avis/cuisiniste/noumea
/avis/salle-de-bain/clermont-ferrand
/avis/zingueur/beziers
/avis/plombier/joue-les-tours
/avis/peintre-en-batiment/royan
/avis/serrurier/nyons
/avis/climaticien/noumea
/avis/geometre/montreuil
/avis/deratisation/castres
/avis/electricien/landerneau
/avis/geometre/albi
/avis/decorateur/nice
/avis/geometre/aubagne
/avis/carreleur/limoges
/devis/deratisation/toul/centre-ville
/devis/demenageur/riviere-pilote/le-marin
/devis/demenageur/plerin/saint-brieuc
/problemes/interphone-panne/echirolles
/problemes/fuite-eau/tarnos
/services/couvreur/cagnes-sur-mer/mark-mitri-marc-couverture-et-toiture-989179890
/services/chauffagiste/vesoul/chaleur-boreale-100475730
/services/plombier/la-villedieu-du-clain/sylvain-blanchard-992592121
/services/charpentier/bouc-bel-air/ddd84300c9cbaa5c
/services/menuisier/lorient/yann-maillot-881013510
/services/solier/forbach/deny-lehmann-828651638
/services/jardinier/punaauia
/services/carreleur/marseille/mohammad-hadi-rasooli-jumadi-891132466
/services/carreleur/auriol/julien-brun-picarreaux-881774210
/services/peintre-en-batiment/nice/0c5dad4e5a608529
/services/plombier/saint-dizier/brandon-marx-marx-marx-plomberie-et-depannage-932572118
/services/terrassier/villers-le-lac/laurent-lapprand-524430212
/services/electricien/grasse/z-elec-concept-800947079
/services/electricien/urrugne/sebastien-miura-949242697
/services/plombier/matoury/richard-sellali-r-d-plomberie-973-989640883
/services/macon/cagnes-sur-mer/c72ca08250e4a988
/services/macon/auxonne
/services/plombier/bezons/etablissement-gaillard-999085459
/services/couvreur/le-haillan/ea67e7f8ca45a656
/services/peintre-en-batiment/tregueux/elodie-le-breton-elodie-le-breton-880247093
/services/solier/chateau-gontier-sur-mayenne/djino-delorme-delorme-902302504
/services/plombier/queven/nicolas-martinez-mz-plomberie-chauffage-830520078
/services/decorateur/nice/4450e8bfce1466d2
/services/plombier/ploubazlanec/mathieu-peltier-852590579
/services/couvreur/nice/jacky-zemouri-couvrazur-st-gerand-toiture-408499291
/services/charpentier/parempuyre/dawson-deplace-france-renov-toiture-992215756
/services/plombier/brest
/services/peintre-en-batiment/cholet
/services/plombier/villeurbanne/mea-multiservices-943524736
/services/menuisier/sevremoine/saint-christophe-du-bois
/services/couvreur/aix-en-provence
/services/plombier/la-ravoire/abad0612179f91c6
/services/peintre-en-batiment/billere
/services/charpentier/bergerac/david-fouilleul-883361263
/services/plombier/lys-lez-lannoy/francois-hellin-a-l-energies-903213098
/services/menuisier/anglet/1c5698bdc870b2fb
/services/carreleur/villefranche-d-albigeois/alain-reynes-occitanie-carrelage-379998511
/services/plombier/saint-mande/patrice-dubois-504151978
/services/climaticien/la-chapelle-saint-ursin/vincent-ballaire-my-climat-813791282
/services/geometre/sada
/services/plombier/chaumont/loic-maubert-lm-plomberie-891433468
/services/couvreur/gond-pontouvre/joseph-cassagrand-c-a-s-renovation-940956832
/services/architecte-interieur/milly-la-foret/laura-pillis-932151244
/services/electricien/fourques/anthony-trouchaud-ninho-elec-798254793
/services/plombier/bedarrides/0e61f7b480dacded
/services/solier/faches-thumesnil/kevin-beaunat-kb-renovation-983656380
/services/peintre-en-batiment/luneville/dominique-cligny-348753997
/services/electricien/ceret/jean-michel-vicens-448531343
/services/isolation-thermique/montlucon/mario-de-ponte-mario-2-ponte-892482324
/services/plombier/athis-mons
/services/peintre-en-batiment/vitrolles/centre-ville
/services/geometre/saint-baldoph/rene-orset-333298693
/services/plombier/orleans
/services/peintre-en-batiment/le-pont-de-claix/seyssins
/services/peintre-en-batiment/montauban
/services/macon/brive-la-gaillarde/f41515c0983abb34
/services/carreleur/bruguieres/maison-grenaux-992065466
/services/terrassier/draguignan/centre-ville
/services/electricien/valenton/adama-niakate-niakate-cfa-cfo-994945517
/services/menuisier/saint-priest/centre-ville
/services/plombier/chambery
/services/electricien/le-raincy/artisan-electricien-claude
/services/peintre-en-batiment/gerzat/bertrand-poinas-518009477
/services/carreleur/forcalquier/claude-freani-378093645
/services/electricien/nice
/services/peintre-en-batiment/angers/1b8cb841e53f5c17
/services/menuisier/ouistreham
/services/macon/sanary-sur-mer/73922dd3dd2adb6c
/services/macon/saint-chamond/la-grand-croix
/services/terrassier/montastruc-la-conseillere/denis-bayssieres-390494540
/services/architecte-interieur/villiers-sur-orge/jean-luc-serra-498649920
/services/menuisier/merignac
/services/electricien/barlin/sebastien-gosse-s-a-2-j-electricite-942207226
/services/macon/cornebarrieu/0d73fb302d7dd4aa
/services/carreleur/saint-gregoire/ewen-le-quellec-roazhon-carrelage-983079427
/services/solier/paris/gheorghe-ionut-hoban-885079673
/services/couvreur/fabregues/tolmos-toitures-993456540
/services/couvreur/reze/aa176deed1bd893e
/services/couvreur/dijon/jonathan-castagna-jc-couverture-481652741
/services/plombier/villers-cotterets/brhservices-939249421
/services/peintre-en-batiment/wingles/f49f98a671d2dd77
/services/electricien/la-farlede/la-valette-du-var
/services/peintre-en-batiment/les-clayes-sous-bois/trappes
/services/solier/drancy/william-even-520530536
/services/macon/bordeaux/kimbel-metbach-les-compagnons-bordelais-990704090
/services/jardinier/le-robert
/services/chauffagiste/hericourt/2c9cf2d334834b7e
/services/carreleur/bar-le-duc/alexis-datry-a-d-carrelage-942786765
/services/climaticien/bastia/profroid-distribution-994998292
/services/couvreur/pont-sainte-maxence/f8730213a98c01b9
/services/couvreur/rainvillers/arnaud-bolle-arnaud-bolle-couverture-a-b-c-809943541
/services/carreleur/lorient/7cb1df724362db5d
/services/couvreur/barentin/9c2bc4903721271a
/services/electricien/paray-vieille-poste
/services/couvreur/change-53/amg-toiture-992831487
/services/menuisier/le-monetier-les-bains/gregoire-sangnier-atelier-1550-334788338
/services/chauffagiste/rueil-malmaison/igts-ibrahima-gandega-thermique-sanitaire-949327977
/services/peintre-en-batiment/longwy/kevin-damar-dtk-renovation-construction-834842114
/services/solier/caves/frederic-lescot-gmp-multiservices-947995437
/services/facadier/thiers/maringues
/services/architecte-interieur/saint-martin-d-heres/gieres
/services/plombier/la-seyne-sur-mer/cyril-tarditi-523770832
/services/plombier/la-couronne/thomas-brunaud-s2t-820864171
/services/geometre/dembeni/sada
/services/chauffagiste/perpignan/54a8b957153e0819
/services/solier/saint-aubin-de-lanquais/jerome-melon-melon-mj-renov-929528164
/services/chauffagiste/sollies-pont/romain-nicolas-nr-confort-83-943905463
/services/plombier/roquemaure/0264f3d90d92747e
/services/peintre-en-batiment/douvres-la-delivrande/thomas-asselin-clj-services-833294531
/services/couvreur/meudon/stephane-falck-stephane-falck-couverture-444389548
/services/etancheiste/montoir-de-bretagne
/services/electricien/neuilly-plaisance
/services/plombier/quimper/samuel-nicolas-npqc-999578156
/services/plombier/les-deserts/julien-chaffardon-chaff-plomberie-climatisation-914467543
/services/electricien/cucq/romain-manet-man-elec-994654978
/services/electricien/chateauneuf-du-rhone/dominique-piegay-400796033
/services/plombier/pornic/christophe-le-disez-837705615
/services/serrurier/troyes/jean-michel-lemeur-jml-service-942698291
/services/metallier/montberaud/mickael-abba-steel-art-design-soudure-992520650
/services/electricien/pornic/guillaume-porcher-990147548
/services/macon/embrun/gl-btp-100348317
/services/peintre-en-batiment/cusset/3d588bff84325cea
/services/solier/bauvin/david-fernandez-fd-renov-488268277
/services/macon/la-seyne-sur-mer/jean-cortes-j-c-renov-523864270
/services/macon/montussan/nicolas-brito-z-e-n-949083760
/services/solier/givors/samir-gahaz-935157073
/services/solier/gleize/abderrahmane-ghellab-ag-amenagement-917770828
/services/solier/villeurbanne/estelle-halimi-habermann-984570150
/services/menuisier/manosque/julien-louis-roc-habitat-931272546
/services/peintre-en-batiment/le-havre/f8e72b9bc77dfbd6
/services/electricien/soissons/bernard-manesse-429307721
/services/plombier/villeparisis/jonathan-marchand-ejm-521424705
/services/plombier/marseille
/services/peintre-en-batiment/les-sables-d-olonne/l-ile-d-olonne
/services/carreleur/saint-priest/menival
/services/macon/macon
/services/plombier/antibes
/services/chauffagiste/thionville/gazeo-depannage-gazeo-depannage-813746633
/services/couvreur/vanves/les-couvreurs-d-elite-983449554
/services/peintre-en-batiment/boulazac-isle-manoire
/services/electricien/miribel/sarl-trebelec-429785165
/services/peintre-en-batiment/la-ciotat
/services/couvreur/colombes
/services/desinsectisation/bernac/gaetan-sourisseau-charente-guepes-frelons-751848326
/services/plombier/roissy-en-brie/kevin-senekerimian-etablissement-ksp-842875239
/services/paysagiste/cayenne/macouria
/services/electricien/tourcoing/030e152f63cb8a09
/services/peintre-en-batiment/pont-du-chateau/0a20151573a18a68
/services/couvreur/orleans
/services/macon/saint-malo
/services/chauffagiste/annecy/cyprien-benois-cyp-climatisation-chauffage-943522813
/services/couvreur/bergerac/david-jayat-technique-toit-facade-805316072
/services/platrier/dijon
/services/geometre/chalette-sur-loing/montargis
/services/chauffagiste/baie-mahault/6a44cf44fdc17dcd
/services/chauffagiste/sarcelles/rs-ecologie-rs-ecologie-921653069
/services/macon/saint-joseph/saint-philippe
/services/electricien/arras
/services/platrier/metz/queuleu
/services/plombier/dijon/laurent-finck-mon-plombier-dijon-520113770
/services/geometre/fort-de-france
/services/peintre-en-batiment/montbeliard
/services/macon/vitrolles/yes-renov-993442466
/services/solier/passy/stephane-daulin-lucky-services-902446905
/services/menuisier/perpignan
/services/electricien/clamart
/services/plombier/evreux
/services/chauffagiste/thionville
/services/couvreur/bailleul
/services/solier/villeurbanne
/services/couvreur/le-mans
/services/peintre-en-batiment/bras-panon/jean-christopher-ponama-488684861
/services/solier/fleury-les-aubrais/nicolas-manceau-nd-bat-952503084
/services/peintre-en-batiment/bras-panon/7afffdae0c0fe1b4
/services/plombier/la-ciotat/cassis
/services/couvreur/toulon
/services/couvreur/drancy
/services/couvreur/le-raincy
/services/peintre-en-batiment/vitrolles/829f03e44a1cc31d
/services/plombier/tarbes
/services/terrassier/billere/bastien-billaud-wood-concept-833580277
/services/serrurier/toulouse
/services/chauffagiste/perpignan/didier-mingot-mdenergies-343667358
/services/electricien/briancon/1c71066026269723
/services/plombier/plouzane/enzo-landauer-technique-plomberie-849230677
/services/plombier/thiais/rungis
/services/electricien/gimont/marco-fabre-fabre-marco-921459491
/services/macon/toulon/sogebat-construction-sogebat-construction-952449619
/services/serrurier/grabels/d771ea979ea6c0f1
/services/peintre-en-batiment/saint-jean-de-vedas/b64c2a0378097a9b
/services/macon/grabels/c86f0d0d5ed0d3be
/services/menuisier/saint-maurice-l-exil
/services/chauffagiste/creteil/ecolia-887865574
/services/plombier/grasse
/services/ramoneur/hyeres
/services/couvreur/albi
/services/couvreur/bergerac/mickael-coiffard-mc-couverture-980779490
/services/macon/la-seyne-sur-mer/e78602937a8ce68f
/services/carreleur/toulouse/4c96415a156f4d75
/services/carreleur/vaudrey/alexandre-monnot-alex-renovation-478598493
/services/plombier/clermont-ferrand
/services/peintre-en-batiment/le-taillan-medoc/saint-aubin-de-medoc
/services/charpentier/villiers-saint-benoit/samuel-rooney-889595435
/services/architecte-interieur/toulouse/nathalie-destoc-488735093
/services/peintre-en-batiment/bretigny-sur-orge/8f5df8aecfdb6832
/services/couvreur/frossay/mscz-44-951616580
/services/serrurier/echirolles/e25adec7f5c9976e
/services/peintre-en-batiment/le-mans/adel-haouas-renova-decors-882018526
/services/couvreur/pessac
/services/serrurier/luc-la-primaube/cedric-marre-448202234
/services/deratisation/issy-les-moulineaux/421a06bb63a49c37
/services/carreleur/mouguerre/jean-luc-lautrie-leo-841149479
/services/carreleur/hettange-grande/davy-roser-onyx-carrelages-991485731
/services/diagnostiqueur/saint-lo/6055d13b0f8af7eb
/services/solier/lille
/services/electricien/divatte-sur-loire/snbe-snbe-850181694
/services/climaticien/amberieu-en-bugey/lucas-gennaro-gennaro-froid-et-climatisation-949412852
/services/cuisiniste/saint-laurent-du-var/5a87a0f56f7f2d86
/services/climaticien/mtsamboro
/services/macon/cornebarrieu/michel-pouville-batitech-sud-ouest-943329664
/services/solier/ploermel/loic-palot-lapal-renov-finition-883761645
/services/plombier/ezanville/jeremy-ballanger-mg2l-823586516
/services/solier/yutz/d08d8cef5a0483cc
/services/electricien/scionzier/922996d909c1b299
/services/electricien/saint-saturnin-les-avignon/74d1859e079a12b6
/services/electricien/guingamp/benjamin-quere-querelec-944547819
/services/terrassier/montlucon
/services/menuisier/le-lorrain
/services/plombier/saint-mande/jhm-renovation-912700721
/services/menuisier/saint-apollinaire/eddie-guincetre-m-a-e-g-819381971
/services/macon/dax
/services/platrier/la-rochelle/marvin-fournier-mf-plaquiste-904933587
/services/plombier/queven/de38f5b08f104f31
/services/menuisier/rennes/richard-le-roux-atelier-du-noroit-813819125
/services/chauffagiste/hombourg-haut/didier-chagnon-827517079
/services/menuisier/grigny-sur-rhone
/services/paysagiste/saint-leu/frederic-babinger-studio-b-500643077
/services/ascensoriste/mehun-sur-yevre/tjK0Km8DkxHhVHn7
/services/macon/aix-en-provence/39eb1a6afdc1db55
/services/serrurier/strasbourg/daniel-pariente-la-compagnie-des-plombiers-serruriers-519291074
/services/solier/schiltigheim
/services/plombier/betheny/kevin-fleury-elite-klean-plomb-art-des-sacres-849331483
/services/macon/lagnieu/ozer-construction-880230214
/services/carreleur/andrezieux-boutheon/a3a9a18f8639eff9
/services/electricien/clermont-ferrand/vincent-lefebvre-veleca-889117743
/services/electricien/anglet/b63592cfe1b5c732
/services/ascensoriste/roubaix/60dc0ab92985ffd2
/services/electricien/balan/eric-sanduku-s-eric-elec-821962651
/services/serrurier/massy/paul-sanchez-sinier-sinier-sp-depannage-auto-24-7-838265452
/services/macon/toulon/imed-jelassi-528313893
/services/electricien/reze/jeremie-touret-so-watt-478046378
/services/ramoneur/le-tampon
/services/electricien/le-tampon/dimitri-casse-mon-petit-electricien-930089230
/services/electricien/wattrelos/c5319a7cb69d6640
/services/geometre/la-possession/gildas-ali-523440618
/services/plombier/mondeville/patrick-perruc-ajbl-507848083
/services/plombier/cahors/sylvain-joly-entreprise-joly-plomberie-501531461
/services/facadier/coueron/hugo-valente-goncalves-hg-enduits-44-981018369
/services/plombier/jardres/jerome-picard-pj-plomberie-940865272
/services/carreleur/luxeuil-les-bains/khalid-jammou-jk-carrelage-819315904
/services/metallier/merle-leignec/sebastien-roiron-concept-soudure-850322462
/services/architecte-interieur/rabastens/mami-architecture-urbanisme-100984053
/services/macon/salon-de-provence/loic-sinibaldi-vaguet-prestige-maconnerie-929885705
/services/macon/bagnols-sur-ceze/ludovic-bourdelas-ludo-renov-438543084
/services/macon/paris/best-travaux-batiment-bestbat-942533365
/services/ramoneur/marignane/stephan-jacquet-piscine-services-532253499
/services/couvreur/saint-germain-les-arpajon/stevin-adelle-mr-adelle-stevin-900156605
/services/menuisier/vallet/maxime-bertrand-bertrand-maxime-menuiserie-901019596
/services/plombier/jeanmenil/loic-mangeolle-hnt-renov-908070618
/services/macon/fos-sur-mer/bcs13-884164583
/services/carreleur/desnes/jeremy-michelin-851612523
/services/peintre-en-batiment/la-chapelle-saint-luc/sebastien-michon-524733953
/services/menuisier/garchizy/michael-joly-mika-menuiserie-538670472
/services/peintre-en-batiment/paillet/delphine-delamour-wery-deldeco-534379532
/services/macon/angouleme/abdelhalim-ben-youssef-bati-pro-532503372
/services/couvreur/bazet/steven-bengler-sb-couverture-893011049
/services/terrassier/saint-jory/franck-deveze-918594029
/services/peintre-en-batiment/longwy/lexy
/services/menuisier/lorient/pierre-brouck-pierre-deco-490269719
/services/macon/lunel/3bddd8708547bcc3
/services/solier/castelginest/frederic-tortorella-503571689
/services/solier/cornebarrieu/alexis-martinez-martinez-rodriguez-martinez-renovation-general-847525177
/services/solier/valence/steven-ollmann-752805507
/services/electricien/argenteuil/73a32dc0a042edc6
/services/serrurier/vigneux-de-bretagne/dominique-chartier-527947022
/services/plombier/morzine/rui-carvalho-peixoto-peixoto-plomberie-988552808
/services/architecte-interieur/courbevoie/philippe-girou-351421680
/services/carreleur/draguignan/a43a4eb69d548a2e
/services/macon/antibes/1038db0e9d30abdd
/services/macon/pont-de-vaux/stephane-drevet-448580084
/services/platrier/dijon/andre-cattet-310149703
/services/solier/arles/jeremy-martin-la-luz-953215605
/services/couvreur/woippy/ismael-aissa-abdi-dahra-ccz-531243707
/services/couvreur/castelsarrasin/tony-emmanuel-521675710
/services/menuisier/thones/56a8e58e18f2b655
/services/peintre-en-batiment/le-mans/d20d1dcc6be8ca91
/services/macon/vence/mouza-501372700
/services/menuisier/quimper/artur-papinyan-papinyan-artur-811425982
/services/geometre/schiltigheim/yamine-lamamra-899820914
/services/menuisier/tergnier/gregory-milliot-mg-menuiserie-898162326
/services/terrassier/saint-pierre-de-chandieu/quentin-roux-ambiance-nature-844956169
/services/plombier/rabastens/nicolas-carena-494299068
/services/solier/villard-sur-doron/olivier-lacroix-bric-ol-en-beaufortain-920830577
/services/macon/talence/mohamed-yaakoubi-839029824
/services/carreleur/rimogne/yoann-antoine-antoine-yoann-991792045
/services/macon/saint-laurent-du-var/adam-sachot-adam-services-852402940
/services/macon/altier/sebastien-gourdouze-sg-maconnerie-899401210
/services/solier/luri/gregory-robert-robert-et-mazotti-renov-et-depannage-841741515
/services/plombier/corbeil-essonnes/abdelmajid-tabib-tsp-plomberie-chauffage-999815855
/services/ascensoriste/cessy/f7d0cb6f64631900
/services/electricien/bordeaux/nomadys-energies-935065268
/services/electricien/saint-germain-en-laye/thierry-brunoro-488760216
/services/desinsectisation/briec/49f2f7e91e94ed09
/services/climaticien/la-valette-du-var/abderrahmane-aider-clim-family-989567458
/services/peintre-en-batiment/simiane-collongue/stephane-rubio-maison-en-couleur-918449208
/services/macon/amboise/1d1deb353b1f7e94
/services/carreleur/saint-maur-des-fosses/dinis-tavares-750283145
/services/carreleur/saint-joseph/b307c32e87b80a13
/services/menuisier/montreuil/51af6807632817cf
/services/peintre-en-batiment/vernet/franck-mazzolo-435130067
/services/macon/origny-le-roux/portais-maconnerie-995197399
/services/ramoneur/noumea
/services/geometre/val-d-arry/frederic-le-bouette-399381730
/services/antenniste/thouare-sur-loire/carquefou
/services/menuisier/bayonne/david-beunza-791936370
/services/platrier/saint-ouen-sur-seine/timofei-butnaru-944049287
/services/peintre-en-batiment/margny-les-compiegne/7eacf4754567f376
/services/plombier/francheville/mathieu-riviere-tim-service-802729913
/services/electricien/la-voge-les-bains/romain-dugravot-rd-multitech-934172818
/services/macon/angouleme/c605e5dc772e0e31
/services/electricien/dax/563da892420d218f
/services/peintre-en-batiment/le-cannet/nicolas-piromalli-monsieur-peinture-914171632
/services/peintre-en-batiment/rennes/regis-sourdril-regis-le-peintre-494249113
/services/menuisier/strasbourg/d4a1b697f858c1d4
/services/plombier/carmaux/clement-borie-cb-confort-929748754
/services/couvreur/elbeuf/malcolm-fruish-513413724
/services/couvreur/forbach/cameron-denis-100971886
/services/plombier/toulon/guy-fauchez-381574326
/services/diagnostiqueur/avignon/afd84-852510676
/services/macon/montesson/f2ee852e0226cb6b
/services/electricien/la-garde/789995c68a122054
/services/geometre/champagne-au-mont-d-or/jean-luc-anderlini-881823413
/services/menuisier/lorient/boussad-moussaoui-929390060
/services/platrier/ugine/c0fe6d841972047d
/services/geometre/roquebrune-sur-argens/laurence-lopez-montarges-449928068
/services/plombier/saint-ouen-l-aumone/mulot-cpc-411882541
/services/plombier/vienne/arthur-fontmorin-931872741
/services/electricien/lyon
/services/macon/saint-dizier/389b2d756b3d82c8
/services/peintre-en-batiment/merignac
/services/plombier/nantes
/services/plombier/besancon
/services/carreleur/mulhouse
/services/terrassier/nimes
/services/couvreur/maubeuge
/services/couvreur/montauban
/services/macon/hyeres
/services/peintre-en-batiment/gap
/services/serrurier/paris/laurent-rouche-352303432
/services/peintre-en-batiment/talence
/services/electricien/beaupreau-en-mauges/bm-depannage-et-renovation-100177161
/services/peintre-en-batiment/tarbes
/services/peintre-en-batiment/caussade
/services/menuisier/cannes
/services/plombier/poitiers
/services/macon/arles
/services/solier/poix-du-nord/anthony-rogier-ar-facade-992807123
/services/plombier/la-seyne-sur-mer
/services/architecte-interieur/le-pradet/la-valette-du-var
/services/peintre-en-batiment/draguignan/centre-ville
/services/serrurier/albi
/services/couvreur/cherbourg-en-cotentin
/services/plombier/lorient
/services/plombier/albi
/services/serrurier/clamart/msd-serrurerie-837959659
/services/electricien/dunkerque
/services/couvreur/carcassonne/b345f9186def0be4
/services/peintre-en-batiment/aulnay-sous-bois/dc2000f806c59ad9
/services/couvreur/talence
/services/plombier/le-havre
/services/couvreur/boulogne-sur-mer
/services/couvreur/lorient
/services/carreleur/metz/guy-pauline-g-p-pro-menuisier-483259479
/services/geometre/montmelian/biaxion-100258359
/services/plombier/roubaix
/services/platrier/limoges/beaubreuil
/services/platrier/saint-pierre/reunion-plaquiste-pro-reunion-plaquiste-pro-917953804
/services/serrurier/gex/iskender-tok-sos-leman-serrurerie-992554196
/services/chauffagiste/venissieux/atout-prestat-atp-919438879
/services/peintre-en-batiment/blois
/services/peintre-en-batiment/noves/centre-ville
/services/paysagiste/brignoles/gareoult
/services/electricien/vigneux-sur-seine/juvisy-sur-orge
/services/peintre-en-batiment/saint-alban/centre-ville
/services/menuisier/ajaccio
/services/solier/bourgoin-jallieu/l-isle-d-abeau
/services/couvreur/nanterre
/services/peintre-en-batiment/vigneux-sur-seine/crosne
/services/couvreur/cergy/centre
/services/couvreur/forbach/mike-luxembourger-luxembourger-top-renov-520781832
/services/macon/muzillac/2ae54d29009b1bc1
/services/electricien/reims
/services/platrier/niort/centre-ville
/services/couvreur/villeneuve-sur-lot
/services/jardinier/darnetal
/services/jardinier/montauban
/services/cuisiniste/ludres/1f46c737d5e4c47d
/services/peintre-en-batiment/dinard/saint-briac-sur-mer
/services/plombier/nimes
/services/macon/saint-andre-de-cubzac/centre-ville
/services/climaticien/marseille
/services/macon/perpignan
/services/peintre-en-batiment/saint-brieuc
/services/peintre-en-batiment/verdun
/services/peintre-en-batiment/hendaye
/services/couvreur/argenteuil
/services/electricien/merignac
/services/geometre/miribel/centre-ville
/services/platrier/saint-pierre
/services/peintre-en-batiment/ajaccio
/services/electricien/montmagny/montmorency
/services/electricien/borgo/lucciana
/services/couvreur/rennes/villejean
/services/geometre/le-francois/le-robert
/services/electricien/gap
/services/plombier/tourcoing
/services/peintre-en-batiment/bourgoin-jallieu/l-isle-d-abeau
/services/plombier/colombes
/services/menuisier/le-havre
/services/electricien/le-havre
/services/macon/cernay/lutterbach
/services/charpentier/le-lamentin/ducos
/services/couvreur/nancy
/services/peintre-en-batiment/castelsarrasin
/services/charpentier/montech
/services/chauffagiste/courbevoie/02d8669e5a38de36
/services/platrier/auterive/nailloux
/services/climaticien/val-de-scie/le-froid-altifagien-931379150
/services/couvreur/nimes
/services/menuisier/cholet
/services/electricien/vence
/services/macon/limoges
/services/paysagiste/saint-andre
/services/macon/agen
/services/electricien/papara/fenua-cool-elec
/services/macon/mery-sur-oise/centre-ville
/services/electricien/narbonne
/services/peintre-en-batiment/arras
/services/electricien/bastia
/services/couvreur/saint-medard-en-jalles/le-taillan-medoc
/services/climaticien/nice
/services/plombier/merignac/barret-eau-933835530
/services/geometre/vauvert/saint-laurent-d-aigouze
/services/plombier/chabeuil/83c191bdec117015
/services/plombier/cusset/68af80f8c7461eb9
/services/architecte-interieur/pezenas
/services/peintre-en-batiment/ales
/services/couvreur/vannes
/services/jardinier/nantes
/services/menuisier/gerzat/clermont-ferrand
/services/serrurier/avon/christian-ambielle-414228155
/services/peintre-en-batiment/montelimar/montboucher-sur-jabron
/services/electricien/marseille/le-panier
/services/menuisier/brest
/services/jardinier/frejus
/services/carreleur/clermont-ferrand
/services/nettoyage/montlucon/d4f7d7e0e0dec206
/services/serrurier/onet-le-chateau/rodez
/services/geometre/fonsorbes
/services/paysagiste/saint-pierre
/services/paysagiste/saint-joseph/saint-philippe
/services/menuisier/montauban
/services/macon/portet-sur-garonne/gso-batiment-943458463
/services/electricien/villeurbanne/grandclement
/services/borne-recharge/paea/papeete
/services/jardinier/mahina
/services/serrurier/alenya/virginie-caignon-destock-travaux-510214539
/services/plombier/asnieres-sur-seine/benjamin-ettouati-blancpain-plomberie-903550481
/services/peintre-en-batiment/terres-de-caux/gaylord-nouet-n-g-peinture-888453784
/services/peintre-en-batiment/chambery
/services/plombier/champagnier/sebastien-rey-521263509
/services/couvreur/toulouse
/services/serrurier/valenciennes
/services/macon/nice/mihai-mirel-irimia-irimia-renovation-987944030
/services/plombier/jonquerettes/klc-84-help-confort-vaucluse-999838139
/services/platrier/flers/ozkan-ozturk-bati-orne-447757865
/services/plombier/metz/queuleu
/services/peintre-en-batiment/sete/centre-ville
/services/diagnostiqueur/paris/evolis-habitat-991882176
/services/peintre-en-batiment/antibes
/services/peintre-en-batiment/roubaix
/services/menuisier/montmagny/montmorency
/services/electricien/chalette-sur-loing/montargis
/services/electricien/toulouse
/services/couvreur/pluvigner/a3503c48a9d169da
/services/carreleur/colombes
/services/peintre-en-batiment/saint-martin-d-heres/gieres
/services/macon/vauvert
/services/plombier/saint-etienne-du-rouvray/belbeuf
/services/plombier/segre-en-anjou-bleu/centre-ville
/services/macon/ajaccio
/services/peintre-en-batiment/tourcoing
/services/electricien/sucy-en-brie
/services/macon/mezidon-vallee-d-auge/748d07616ea607e9
/services/macon/brest
/services/plombier/torcieu/e-l-plomberie-939958302
/services/plombier/yebleron/monville-antoine-509355541
/services/carreleur/dunkerque
/services/menuisier/nice
/services/carreleur/charleville-mezieres
/services/menuisier/lorient
/services/solier/aubagne/mathieu-forcetti-force-renov-925195109
/services/chauffagiste/vesoul/f8f7b7fcc2fb2d44
/services/peintre-en-batiment/caudebec-les-elbeuf/mathieu-mathieu-432585727
/services/jardinier/pirae
/services/terrassier/saint-maurice-de-gourdans/jeremy-verchere-jerem-espaces-verts-952799104
/services/solier/le-havre
/services/couvreur/lys-lez-lannoy/eric-guaine-guaine-eric-entreprise-de-couverture-zinguerie-537918294
/services/platrier/bourgoin-jallieu
/services/carreleur/frontignan/balaruc-les-bains
/services/architecte-interieur/le-robert
/services/plombier/annecy
/services/chauffagiste/toulon
/services/paysagiste/cancale
/services/plombier/dinard/saint-briac-sur-mer
/services/charpentier/savigny-le-temple
/services/serrurier/montpellier/hassan-boutahir-bth-serrure-840784615
/services/chauffagiste/narbonne/4bbc1111ff964005
/services/macon/echirolles/bati-38-maconnerie-984584532
/services/solier/theziers/guillaume-lambert-au-fer-et-a-mesure-788741890
/services/macon/cholet/dafc6069ebbb22bf
/services/menuisier/vauvert/aimargues
/services/solier/miramas/jean-luc-di-domizio-753434844
/services/peintre-en-batiment/bezons/cormeilles-en-parisis
/services/carreleur/chaumont
/services/serrurier/somain/auberchicourt
/services/carreleur/corte/lb-carrelage-892321605
/services/electricien/saint-etienne
/services/menuisier/six-fours-les-plages/b029b022bbdc2f0f
/services/couvreur/verdun
/services/carreleur/mauvezin-sur-gupie/bruno-michaud-912598224
/services/electricien/saint-marc-jaumegarde/valente-electricite-generale-978310381
/services/geometre/nohic/ridha-boukhili-archi-diag-conseil-397832304
/services/isolation-thermique/arinthod/ali-eren-tufekci-tufex-910292127
/services/electricien/hyeres
/services/electricien/chalon-sur-saone/bfd5a7e8c18eb1f9
/services/plombier/hericourt/7edc2d0814135058
/services/menuisier/caluire-et-cuire
/services/plombier/heillecourt/f2e-532712163
/services/ascensoriste/les-sables-d-olonne/eda98fb6a2d3f664
/services/macon/royan
/services/climaticien/le-muy
/services/solier/bellevigne-en-layon/guillaume-sauloup-home-tech-services-835194960
/services/solier/agen
/services/paysagiste/bras-panon/sebastien-marimoutou-eden-garden-974-897744082
/services/solier/berck/arthur-grecourt-927979773
/services/terrassier/la-possession/saint-denis
/services/macon/bonneville/a63ffc7959d5d738
/services/cuisiniste/les-abymes/petit-canal
/services/plombier/vitry-le-francois/5f4fba2058a4f1b6
/services/paysagiste/trappes/bois-d-arcy
/services/architecte-interieur/le-francois/ducos
/services/macon/savigny-sur-orge/morangis
/services/charpentier/le-passage/eric-barrere-385027370
/services/solier/montendre/anthony-jaillant-aj-batiment-919620468
/services/desinsectisation/caussade/dafbba136b1202c1
/services/plombier/malzeville/a0733a7c94de123c
/services/charpentier/le-tampon/jean-patrick-maillot-jpm-charpente-couverture-491837712
/services/menuisier/chelles/f59daf9512863623
/services/plombier/argenteuil/c9041360c5527bd5
/services/macon/rennes/dc689274459269f7
/services/carreleur/sene/kasim-bozkurt-bozkurt-carrelage-maconnerie-510790488
/services/electricien/castanet-tolosan/ramzi-ghammouri-ramzi-elec-753373075
/services/geometre/orsay/gif-sur-yvette
/services/macon/vierzon/antonio-cesar-485392427
/services/geometre/offranville/jean-pierre-caron-788371417
/services/climaticien/saint-jean-de-monts/elric-pajot-a-c-climatic-882259500
/services/peintre-en-batiment/enghien-les-bains/anis-haba-madeco-489450304
/services/chauffagiste/tarbes/eurl-christian-depannage-797857976
/services/plombier/mazamet/alexandre-garcia-982492407
/services/electricien/savigny-sur-orge/morangis
/services/pisciniste/toulouse/adel-mhamdi-adel-piscine-habitat-447857517
/services/cuisiniste/aulnay-sous-bois
/services/peintre-en-batiment/boulogne-billancourt
/services/carreleur/saint-evarzec/kerne-carrelage-880403209
/services/carreleur/ales
/services/peintre-en-batiment/chartres
/services/electricien/dammarie-les-lys
/services/menuisier/ambert/82e08a1d91c62f89
/services/paysagiste/draguignan/mustapha-dja-yahia-adm-paysage-835230186
/services/electricien/marseille/francois-recanatesi-logic-renov-789734431
/services/macon/bergerac/24cc0c494c900949
/services/plombier/villeurbanne/9a916ee68de0fa24
/services/plombier/champigny-sur-marne/a-j-d-907466916
/services/peintre-en-batiment/chaumont
/services/poseur-de-parquet/montrevault-sur-evre/sylvain-grimaud-ponce-parquet-800164501
/services/solier/paris/ilibat-989770243
/services/peintre-en-batiment/vigneux-de-bretagne/jean-luc-bretecher-851037754
/services/macon/blois
/services/plombier/calvi/denis-serra-810568642
/services/plombier/cusset/eurl-rattat-938904711
/services/carreleur/lormont/yvrac
/services/menuisier/metz
/services/macon/souvigny/alberto-da-costa-447937012
/services/platrier/les-pavillons-sous-bois/jp-renovation-2000-524873353
/services/plombier/chalons-en-champagne
/services/plombier/remire-montjoly/guyane-detection-933144420
/services/peintre-en-batiment/avrille/333256c7f1467123
/services/peintre-en-batiment/vigneux-de-bretagne/guillaume-boullery-gb-peinture-911777530
/services/macon/cusset/tom-cellier-cellier-bati-822838421
/services/climaticien/alencon/a0fccd2b7bd052e2
/services/electricien/cagnes-sur-mer/pascal-duhem-d-p-s-412272536
/services/plombier/bron/isa-kurnaz-plombier-69-912588597
/services/plombier/monistrol-sur-loire/loic-mallard-slr-solutions-933376568
/services/couvreur/narbonne/samuel-ortis-999401771
/services/carreleur/peronnas/mister-carrelages-893116699
/services/menuisier/perigueux
/services/antenniste/limoges/fibre-co-831605175
/services/electricien/baie-mahault/charles-bibrac-491547097
/services/electricien/rennes
/services/plombier/bastia
/services/menuisier/clermont-ferrand
/services/serrurier/bout-du-pont-de-larn/karim-bouziane-bk-serrurerie-899186126
/services/carreleur/illkirch-graffenstaden/geispolsheim
/services/electricien/saint-lo
/services/couvreur/morsang-sur-orge
/services/couvreur/chauny
/services/peintre-en-batiment/bergerac/rode-908931074
/services/pompe-a-chaleur/pau/5dbaaed1717538c3
/services/solier/saran/patrice-sornique-sornique-352210470
/services/menuisier/montreuil/zala-981885072
/services/electricien/bourges/jean-philippe-mazer-jpm-renovation-515351559
/services/isolation-thermique/vendargues/5df1b06636587ad2
/services/couvreur/rennes/rocky-sauzer-rs-toiture-799473475
/services/macon/saint-cyprien/c8871b5399a1173b
/services/macon/wambrechies/gaetan-beddelem-513563072
/services/carreleur/schiltigheim/centre-ville
/services/plombier/metz/adrien-gilbert-ad-plomberie-977519263
/services/couvreur/villenave-d-ornon/c9b7ae05decfa444
/services/nettoyage/porto-vecchio/VpHyp20kz6ScDv6I
/services/geometre/vichy/a23864de6fb92d54
/services/peintre-en-batiment/antibes/m-bk-renovation-910234814
/services/plombier/saint-mande/all-renov-star-all-renov-star-451369367
/services/serrurier/biarritz/zms-zabala-metallerie-serrurerie-zms-824087977
/services/menuisier/gap
/services/electricien/nevers/921656ea8c9bd0f3
/services/couvreur/guernes/florian-gomez-751837568
/services/peintre-en-batiment/saint-priest/construction-batiment-services-rhone-alpes-900211541
/services/plombier/lys-lez-lannoy/selim-recham-recham-selim-plomberie-750145815
/services/macon/la-ciotat/cassis
/services/plombier/magny-les-hameaux/marc-faia-415151091
/services/electricien/poulx/guy-giboin-789031192
/services/menuisier/ales/morgan-bastide-mb-menuiserie-915073571
/services/macon/drancy/bate-renov-833639966
/services/peintre-en-batiment/saint-aignan-sur-ry/kevin-van-hooland-981332943
/services/electricien/annecy/1e7f15f6134c5da9
/services/architecte-interieur/nice/alison-tartary-l-immobilier-pour-elle-844575704
/services/peintre-en-batiment/grenade/7cad08ef4e4d1aee
/services/solier/les-angles
/services/carreleur/grasse
/services/plombier/toulon/a8eebfdca1d179f9
/services/plombier/bras-panon/sainte-marie
/services/ascensoriste/seyssinet-pariset/f1d70ef61c6ee2ad
/services/climaticien/la-seyne-sur-mer
/services/platrier/peillac/hemery-camille-931426837
/services/architecte-interieur/villebon-sur-yvette/samy-zaidi-844000430
/services/solier/le-pecq/atelier-k-paris-atelier-k-paris-992580118
/services/peintre-en-batiment/vernon/saint-marcel
/services/architecte-interieur/les-lilas/syntaxe-architecture-849151345
/services/macon/tignieu-jameyzieu
/services/electricien/saintes
/services/geometre/villefranche-sur-saone
/services/serrurier/strasbourg/f4bd985bc52b4426
/services/electricien/chevillon/frederic-collin-home-connexion-992554311
/services/architecte-interieur/la-celle-saint-cloud/luc-cremades-418018602
/services/couvreur/frouzins/af8310552b61cdcf
/services/carreleur/divonne-les-bains/7301410f6a4d4550
/services/cuisiniste/aubignan/71b4b7c4211f0749
/services/peintre-en-batiment/longwy/melanie-maiolo-sztuka-l-atelier-de-la-matiere-grise-504475658
/services/peintre-en-batiment/tregueux/603462563c34a0ec
/services/macon/cormoz/arnaud-dominici-art-now-construction-913440103
/services/couvreur/pluvigner/anthony-gueguin-restez-couvert-ure-991082454
/services/geometre/montanges/melanie-portier-labelfenetre01-881285290
/services/plombier/narbonne/19e72a49194224b9
/services/solier/le-pecq/laurent-villejoubert-arbustes-et-jardins-518843347
/services/macon/la-ciotat/michael-laissus-ciotat-bati-788589760
/services/zingueur/privas/31d89ceb23745528
/services/plombier/cabries/f69183968eff46ca
/services/peintre-en-batiment/cadaujac/34d138e2a729a91a
/services/macon/chambery/adem-yilmaz-828745786
/services/etancheiste/saint-priest/baran-etancheite-999534860
/services/macon/saint-dizier/658dc456f81abe36
/services/couvreur/outreau/7d71f4231b9e4b8f
/services/electricien/realville/sebastien-sancha-494677867
/services/macon/le-cannet/france-intelex-524172491
/services/couvreur/valensole/anthony-haubois-couvreur-de-provence-521412726
/services/electricien/clisson/0eca9de845258aaa
/services/chauffagiste/lorry-les-metz/raphael-matusiak-rm-chauf-943946210
/services/menuisier/saint-trivier-sur-moignans/thierry-lysowec-479916587
/services/chauffagiste/frejus
/services/menuisier/metz/francois-bardin-bf-multiservices-507961688
/services/serrurier/montpellier/oumarou-camara-serrurier-montpellier-svps-depannage-serrure-en-urgence-a-montpel-810673368
/services/charpentier/oyonnax/efb-charpente-818355810
/services/plombier/saint-mande/sacha-partouche-sacha-partouche-898074794
/services/serrurier/cormeilles-en-parisis/artur-service-505163865
/services/plombier/arnouville/624988325f045c33
/services/solier/vence/eric-corniglion-327758421
/services/electricien/manosque
/services/architecte-interieur/brie-comte-robert/niels-brinjean-824231179
/services/terrassier/laruscade/piscines-lnc-840267157
/services/plombier/puymeras/thomas-dupont-501771737
/services/plombier/ambilly/jhs-plomberie-chauffage-949757504
/services/plombier/ales
/services/macon/lormont/yvrac
/tarifs/jardinier/punaauia
/tarifs/nettoyage/noumea
/tarifs/borne-recharge/cagnes-sur-mer
/tarifs/paysagiste/rennes
/tarifs/macon/baie-mahault
/tarifs/carreleur/les-abymes
/tarifs/carreleur/toulouse
/tarifs/jardinier/les-abymes
/tarifs/borne-recharge/evry-courcouronnes
/tarifs/macon/limoges
/tarifs/macon/riviere-salee
/tarifs/borne-recharge/longuenesse
/tarifs/couvreur/montaigu-vendee
/tarifs/plombier/paris
/tarifs/peintre-en-batiment/toulouse
/tarifs/carreleur/marseille
/tarifs/demenageur/brest
/tarifs/panneaux-solaires/papeete
/tarifs/nettoyage/caen
/tarifs/desinsectisation/le-havre
/tarifs/peintre-en-batiment/perpignan
/tarifs/nettoyage/porto-vecchio
/tarifs/paysagiste/caen
/tarifs/jardinier/lens
/tarifs/cuisiniste/le-marin
/tarifs/plombier/fort-de-france
/tarifs/carreleur/papeete
/tarifs/borne-recharge/poitiers
/tarifs/borne-recharge/saint-brieuc
/tarifs/jardinier/bordeaux
/tarifs/peintre-en-batiment/fort-de-france
/tarifs/nettoyage/roanne
/tarifs/peintre-en-batiment/narbonne
/tarifs/jardinier/haguenau
/tarifs/macon/noumea/construction-d-une-extension
/tarifs/menuisier/vitrolles/pose-d-une-fenetre-double-vitrage-pvc
/tarifs/carreleur/montauban/pose-de-carrelage-au-sol-format-standard
/tarifs/demenageur/papeete/garde-meubles
/tarifs/vitrier/noumea/installation-d-une-paroi-de-douche-en-verre
/tarifs/jardinier/ales/installation-d-arrosage-automatique
/tarifs/couvreur/toulouse/nettoyage-et-demoussage-de-toiture
/tarifs/jardinier/paris/tonte-de-pelouse-jardin-de-200-m
/tarifs/solier/saint-pierre/pose-de-sol-pvc-vinyle-en-lames-ou-dalles
/tarifs/jardinier/noumea/entretien-mensuel-d-un-jardin-200-m
/tarifs/jardinier/marseille/elagage-d-arbre-hauteur-moyenne
/tarifs/vitrier/marseille/remplacement-d-une-vitre-cassee-standard
/tarifs/serrurier/amiens/copie-de-cle-standard-ou-haute-securite
/tarifs/vitrier/nimes/installation-d-un-garde-corps-en-verre-balcon-terrasse
/tarifs/climaticien/perpignan/entretien-annuel-d-une-climatisation
/tarifs/jardinier/nice/entretien-mensuel-d-un-jardin-200-m
/tarifs/diagnostiqueur/lyon/diagnostic-termites-zones-a-arrete-prefectoral
/tarifs/couvreur/noumea/reparation-de-fuite-de-toiture
/tarifs/macon/perpignan/ravalement-de-facade-enduit-ou-crepi
/tarifs/vitrier/massy/remplacement-d-un-simple-vitrage
/tarifs/peintre-en-batiment/dijon/peinture-de-plafond-seul
/tarifs/plombier/rouen/detection-de-fuite-non-destructive-gaz-traceur-ou-camera-thermique
/tarifs/chauffagiste/belfort/desembouage-d-un-circuit-de-chauffage
/tarifs/nettoyage/dijon/nettoyage-de-vitres-logement
/tarifs/jardinier/saint-brieuc/entretien-mensuel-d-un-jardin-200-m
/tarifs/chauffagiste/strasbourg/desembouage-d-un-circuit-de-chauffage
/tarifs/cuisiniste/agen/cuisine-sur-mesure-haut-de-gamme
/tarifs/terrassier/strasbourg/remblaiement-et-compactage-de-terrain
/tarifs/couvreur/les-sables-d-olonne/nettoyage-et-demoussage-de-toiture
/tarifs/menuisier/antibes/pose-d-une-fenetre-double-vitrage-pvc
/tarifs/vitrier/neuilly-sur-seine/remplacement-d-une-vitre-cassee-standard
/tarifs/carreleur/marseille/pose-de-carrelage-au-sol-format-standard
/tarifs/couvreur/marseille/refection-complete-de-toiture-100-m
/tarifs/serrurier/lyon/changement-de-serrure-standard
/tarifs/zingueur/change/cheneau-zinc-sur-mesure
/tarifs/chauffagiste/chelles/desembouage-d-un-circuit-de-chauffage
/tarifs/menuisier/lille/pose-d-une-porte-interieure
/tarifs/nettoyage/nancy/nettoyage-de-copropriete-parties-communes
/tarifs/nettoyage/strasbourg/nettoyage-de-fin-de-chantier-appartement-60-m
/tarifs/macon/toulon/construction-d-une-extension
/tarifs/peintre-en-batiment/noumea/peinture-de-plafond-seul
/tarifs/macon/perpignan/construction-d-un-mur-en-parpaings
/tarifs/jardinier/marseille/entretien-mensuel-d-un-jardin-200-m
/tarifs/plombier/noumea/detection-de-fuite-non-destructive-gaz-traceur-ou-camera-thermique
/tarifs/jardinier/lorient/entretien-mensuel-d-un-jardin-200-m
/tarifs/nettoyage/toulouse/debarras-et-nettoyage-de-locaux
/tarifs/zingueur/paris/remplacement-de-cheneaux
/tarifs/carreleur/annecy/pose-de-carrelage-au-sol-format-standard
/tarifs/jardinier/blois/taille-de-haie
/tarifs/vitrier/bordeaux/remplacement-d-un-simple-vitrage
/tarifs/jardinier/saint-quentin/entretien-mensuel-d-un-jardin-200-m
/tarifs/couvreur/dijon/nettoyage-et-demoussage-de-toiture
/tarifs/peintre-en-batiment/caen/peinture-d-une-piece-murs-plafond-12-m
/tarifs/jardinier/meudon/elagage-d-arbre-hauteur-moyenne
/tarifs/jardinier/brive-la-gaillarde/tonte-de-pelouse-jardin-de-200-m
/tarifs/serrurier/marseille/blindage-de-porte-existante
/tarifs/electricien/tours/installation-d-un-interphone-ou-visiophone
/tarifs/jardinier/la-roche-sur-yon/entretien-mensuel-d-un-jardin-200-m
/tarifs/peintre-en-batiment/cannes/peinture-d-une-piece-murs-plafond-12-m
/tarifs/plombier/noumea/remplacement-d-un-chauffe-eau
/tarifs/couvreur/caen/nettoyage-et-demoussage-de-toiture
/tarifs/nettoyage/lorient/nettoyage-de-facade-karcher-professionnel
/tarifs/platrier/vitry-sur-seine/enduit-platre-traditionnel
/tarifs/etancheiste/noumea/etancheite-toiture-terrasse-membrane-bitume
/tarifs/nettoyage/caen/entretien-regulier-de-bureaux-et-locaux-professionnels
/tarifs/couvreur/colomiers/refection-complete-de-toiture-100-m
/tarifs/jardinier/angouleme/entretien-mensuel-d-un-jardin-200-m
/tarifs/jardinier/papeete/entretien-mensuel-d-un-jardin-200-m
/tarifs/terrassier/noumea/creation-de-tranchees-pour-reseaux
/tarifs/jardinier/nantes/abattage-d-arbre-avec-dessouchage
/tarifs/couvreur/aix-en-provence/refection-complete-de-toiture-100-m
/tarifs/peintre-en-batiment/orleans/ravalement-de-facade-enduit-peinture
/tarifs/serrurier/troyes/changement-de-serrure-standard
/tarifs/climaticien/lille/desembouage-et-nettoyage-du-circuit-frigorifique
/tarifs/carreleur/ajaccio/pose-de-carrelage-au-sol-format-standard
/tarifs/electricien/noumea/pose-de-volets-roulants-electriques-par-volet
/tarifs/charpentier/avignon/traitement-charpente-par-injection-anti-termites-capricornes
/tarifs/couvreur/brive-la-gaillarde/nettoyage-et-demoussage-de-toiture
/tarifs/peintre-en-batiment/brest/ravalement-de-facade-enduit-peinture
/tarifs/couvreur/perpignan/nettoyage-et-demoussage-de-toiture
/tarifs/jardinier/la-roche-sur-yon/tonte-de-pelouse-jardin-de-200-m
/tarifs/macon/brest/construction-d-une-extension
/tarifs/couvreur/perpignan/refection-complete-de-toiture-100-m
/tarifs/peintre-en-batiment/pau/ravalement-de-facade-enduit-peinture
/tarifs/peintre-en-batiment/ales/ravalement-de-facade-enduit-peinture
/tarifs/jardinier/angers/tonte-de-pelouse-jardin-de-200-m
/tarifs/climaticien/ajaccio/entretien-annuel-d-une-climatisation
/tarifs/solier/caen/pose-de-sol-souple-linoleum
/tarifs/solier/versailles/pose-de-parquet-massif-colle
/tarifs/jardinier/annecy/tonte-de-pelouse-jardin-de-200-m
/tarifs/macon/troyes/reparation-de-fissures-structurelles
/tarifs/carreleur/arras/pose-de-carrelage-au-sol-format-standard
/tarifs/nettoyage/le-chesnay-rocquencourt/nettoyage-de-vitres-logement
/tarifs/couvreur/brest/refection-complete-de-toiture-100-m
/tarifs/serrurier/mulhouse/copie-de-cle-standard-ou-haute-securite
/tarifs/charpentier/noumea/construction-d-un-carport-ou-auvent-en-bois
/tarifs/nettoyage/romorantin-lanthenay/nettoyage-de-vitres-logement
/tarifs/solier/montlucon/pose-de-sol-souple-linoleum
/tarifs/charpentier/montauban/construction-d-un-carport-ou-auvent-en-bois
/tarifs/climaticien/nantes/recharge-de-gaz-refrigerant
/urgence/electricien/noumea
/urgence/plombier/quimperle
/urgence/antenniste/saint-andre
```

## Intégration plan 140K

1. Avant V1 J+3 : pull GSC Pages **non tronqué** (16 mois, export CSV via API ou Looker Studio) pour couverture complète.
2. Charger cette liste dans `src/lib/seo/gone-paths.ts` comme `WHITELIST_GSC_RECENT` (Set<string>).
3. `evaluateGonePath()` court-circuite `gone:true` si `WHITELIST_GSC_RECENT.has(pathname)`.
4. Pour les vagues 301, mêmes URLs gardées en /sitemap mais avec rewrite content + canonical (pas de redirect).
5. Retirer manuellement de la liste IndexNow purge.

## Audit complémentaire à exécuter

- [ ] Re-pull GSC Pages 90j non tronqué (URL Inspector API ou export 25K via Looker)
- [ ] Re-pull GSC Pages 28j (alignement strict avec règle plan v1)
- [ ] Cross-check avec `lead_request_logs` 90j (pages qui génèrent leads même sans clic GSC ?)
- [ ] Cross-check avec backlinks Ahrefs (URL avec backlink = whitelist auto)
