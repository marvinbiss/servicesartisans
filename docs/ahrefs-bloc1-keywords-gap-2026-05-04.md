# Keyword gap niche RGE/CEE/MPR v3 — leaders rank top 10, SA pos > 20

**Date** : 2026-05-04
**Leaders pullés** : effy.fr, sonergia.fr, quelleenergie.fr, france-renov.gouv.fr (Heero exclu : 6% reno-relevant)
**Filtre** : KW matche RGE/CEE/MPR, ≥1 leader top 10, SA absente ou pos > 20
**Pagination** : 4 batches × 500 = jusqu'à 2000 KW/leader (cap API 500/call)
**Cross-ref SA** : pos≤50 limit 1000
**Total keywords actionnables** : 3349

- **0 striking distance** (SA pos 21-50, × 1.5 boost)
- **3349 absent** (SA totalement hors top 50)
- **0 deep** (SA pos > 50, × 0.8 boost)
  **Pages SA existantes détectées** : 1919/3349 (57%)

## Répartition par intent

- **informational** : 3349
- **commercial** : 582
- **branded** : 293
- **transactional** : 72

## Répartition par cluster thématique (trié par volume cumulé)

| Cluster            | Nb KW | Vol cumulé/mo | KD moyen |
| ------------------ | ----- | ------------- | -------- |
| pac                | 615   | 230190        | 4.6      |
| solaire_pv         | 288   | 229940        | 10.4     |
| isolation_other    | 871   | 227530        | 3.9      |
| aides_mpr          | 271   | 157840        | 33.5     |
| vmc                | 215   | 127800        | 0.7      |
| chaudiere          | 294   | 85690         | 2.6      |
| poele_granules     | 107   | 66250         | 4.2      |
| isolation_ext      | 159   | 64610         | 6.1      |
| dpe                | 241   | 54840         | 11.1     |
| other              | 169   | 52200         | 21.6     |
| rge_label          | 159   | 35520         | 24.6     |
| isolation_murs     | 139   | 34630         | 2.3      |
| aides_cee          | 131   | 30420         | 17.5     |
| isolation_combles  | 108   | 30230         | 2.4      |
| ballon_thermo      | 47    | 22840         | 2.3      |
| toiture            | 60    | 14190         | 9.8      |
| audit_energetique  | 31    | 11690         | 9.7      |
| menuiseries        | 25    | 6620          | 21.7     |
| isolation_sol      | 43    | 5880          | 0.1      |
| aides_ecoptz       | 15    | 4320          | 42.7     |
| solaire_thermique  | 6     | 3590          | 3.0      |
| aides_anah         | 20    | 3040          | 36.5     |
| renovation_globale | 16    | 1700          | 41.8     |
| passoire           | 13    | 710           | 2.4      |
| aides_tva          | 1     | 100           | 16.0     |

---

## 🎯 BUCKET 1 — STRIKING DISTANCE (top 100, 0 total)

**Push prioritaire** : SA déjà sur la page, juste optimisation/maillage à faire pour passer top 10.

| #   | Keyword | Clusters | Vol | KD  | Best leader (pos) | #lead top10 | SA status | Existing page | Score |
| --- | ------- | -------- | --- | --- | ----------------- | ----------- | --------- | ------------- | ----- |

---

## 🚀 BUCKET 2 — ABSENT (top 200, 3349 total)

**Pages-mines à créer** : SA totalement absente. Effort flagship complet.
**Existing page** : si non `—`, page candidate dans `src/app/` à enrichir au lieu de créer.

| #   | Keyword                                            | Clusters                                  | Vol   | KD  | Best leader (pos)         | #lead top10 | SA status | Existing page                                                | Score   |
| --- | -------------------------------------------------- | ----------------------------------------- | ----- | --- | ------------------------- | ----------- | --------- | ------------------------------------------------------------ | ------- |
| 1   | pompe a chaleur                                    | pac                                       | 56000 | 13  | france-renov.gouv.fr (#1) | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 2488.89 |
| 2   | isolation exterieur                                | isolation_ext,isolation_other             | 14000 | 2   | france-renov.gouv.fr (#1) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 1900.0  |
| 3   | isolation par l'extérieur                          | isolation_ext,isolation_other             | 12000 | 2   | effy.fr (#1)              | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 1371.43 |
| 4   | vmc simple flux                                    | vmc                                       | 15000 | 2   | effy.fr (#2)              | 2           | absent    | —                                                            | 1142.86 |
| 5   | vmc hygroréglable                                  | vmc                                       | 14000 | 1   | quelleenergie.fr (#2)     | 1           | absent    | —                                                            | 1011.11 |
| 6   | chaudiere gaz                                      | chaudiere                                 | 12000 | 1   | quelleenergie.fr (#2)     | 1           | absent    | src/app/(public)/guides/chaudiere-gaz-vs-granules/page.tsx   | 866.67  |
| 7   | ballon thermodynamique                             | ballon_thermo                             | 18000 | 6   | france-renov.gouv.fr (#4) | 2           | absent    | —                                                            | 523.64  |
| 8   | vmc                                                | vmc                                       | 48000 | 7   | france-renov.gouv.fr (#9) | 1           | absent    | —                                                            | 520.0   |
| 9   | vmc salle de bain                                  | vmc                                       | 9700  | 0   | quelleenergie.fr (#5)     | 1           | absent    | —                                                            | 420.33  |
| 10  | isolation mur intérieur                            | isolation_murs,isolation_other            | 7800  | 1   | france-renov.gouv.fr (#5) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 411.67  |
| 11  | isolation exterieur maison                         | isolation_ext,isolation_other             | 3700  | 4   | france-renov.gouv.fr (#1) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 390.56  |
| 12  | chaudière biomasse                                 | chaudiere                                 | 2800  | 0   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 364.0   |
| 13  | isolation combles                                  | isolation_combles,isolation_other         | 4100  | 5   | france-renov.gouv.fr (#1) | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 328.0   |
| 14  | pompe a chaleur air eau                            | pac                                       | 11000 | 12  | quelleenergie.fr (#3)     | 3           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 307.35  |
| 15  | entretien pompe a chaleur                          | pac                                       | 5600  | 1   | effy.fr (#3)              | 1           | absent    | —                                                            | 303.33  |
| 16  | isolation phonique mur                             | isolation_other                           | 3500  | 0   | sonergia.fr (#2)          | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 303.33  |
| 17  | isolation phonique                                 | isolation_other                           | 8300  | 7   | sonergia.fr (#2)          | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 299.72  |
| 18  | poele a granule                                    | poele_granules                            | 29000 | 21  | france-renov.gouv.fr (#5) | 2           | absent    | src/app/(public)/guides/poele-granules-aides-2026/page.tsx   | 297.44  |
| 19  | installation pompe a chaleur                       | pac                                       | 3300  | 1   | effy.fr (#2)              | 2           | absent    | src/app/(public)/guides/alarme-maison-installation-prix/page | 293.33  |
| 20  | installation vmc                                   | vmc                                       | 1800  | 0   | effy.fr (#1)              | 2           | absent    | src/app/(public)/guides/alarme-maison-installation-prix/page | 288.0   |
| 21  | isolation                                          | isolation_other                           | 7900  | 4   | france-renov.gouv.fr (#3) | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 285.28  |
| 22  | panneau photovoltaique                             | solaire_pv                                | 21000 | 27  | quelleenergie.fr (#2)     | 1           | absent    | src/app/(public)/guides/panneau-solaire-prix-rentabilite/pag | 284.38  |
| 23  | pompe à chaleur                                    | pac                                       | 18000 | 21  | france-renov.gouv.fr (#3) | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 276.92  |
| 24  | installation pompe à chaleur                       | pac                                       | 3000  | 1   | effy.fr (#2)              | 2           | absent    | src/app/(public)/guides/alarme-maison-installation-prix/page | 266.67  |
| 25  | isolation des combles                              | isolation_combles,isolation_other         | 3600  | 6   | france-renov.gouv.fr (#1) | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 261.82  |
| 26  | chaudière à condensation                           | chaudiere                                 | 6900  | 2   | quelleenergie.fr (#4)     | 1           | absent    | —                                                            | 256.29  |
| 27  | ma prime renov                                     | aides_mpr                                 | 57000 | 67  | france-renov.gouv.fr (#4) | 2           | absent    | —                                                            | 253.33  |
| 28  | consommation pompe a chaleur                       | pac                                       | 3300  | 1   | effy.fr (#2)              | 1           | absent    | —                                                            | 238.33  |
| 29  | vmc double flux thermodynamique                    | vmc                                       | 1800  | 0   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 234.0   |
| 30  | dpe d                                              | dpe                                       | 2200  | 1   | effy.fr (#2)              | 3           | absent    | —                                                            | 232.22  |
| 31  | panneau solaire thermique                          | solaire_pv,solaire_thermique              | 3200  | 4   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/guides/panneau-solaire-prix-rentabilite/pag | 231.11  |
| 32  | vmc hygroréglable type b                           | vmc                                       | 1700  | 0   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 221.0   |
| 33  | pompe a chaleur air air                            | pac                                       | 7100  | 8   | quelleenergie.fr (#3)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 218.46  |
| 34  | isolation extérieure maison                        | isolation_ext,isolation_other             | 1600  | 2   | france-renov.gouv.fr (#1) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 217.14  |
| 35  | panneau solaire                                    | solaire_pv                                | 87000 | 43  | quelleenergie.fr (#10)    | 1           | absent    | src/app/(public)/guides/panneau-solaire-prix-rentabilite/pag | 214.2   |
| 36  | prix pompe a chaleur air air                       | pac                                       | 1600  | 0   | effy.fr (#1)              | 1           | absent    | src/app/(public)/widget-prix/page.tsx                        | 208.0   |
| 37  | pompe a chaleur daikin                             | pac                                       | 2400  | 0   | effy.fr (#2)              | 1           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 208.0   |
| 38  | panneaux solaires                                  | other                                     | 20000 | 38  | quelleenergie.fr (#2)     | 1           | absent    | —                                                            | 201.55  |
| 39  | chaudière                                          | chaudiere                                 | 3900  | 4   | effy.fr (#2)              | 1           | absent    | —                                                            | 187.78  |
| 40  | isolation combles perdus                           | isolation_combles,isolation_other         | 2000  | 2   | france-renov.gouv.fr (#1) | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 185.71  |
| 41  | pompe à chaleur air air                            | pac                                       | 3400  | 5   | quelleenergie.fr (#2)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 181.33  |
| 42  | nettoyage panneau solaire                          | solaire_pv                                | 3300  | 3   | quelleenergie.fr (#2)     | 1           | absent    | —                                                            | 178.75  |
| 43  | isolation extérieure                               | isolation_ext,isolation_other             | 2200  | 2   | quelleenergie.fr (#2)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 167.62  |
| 44  | chaudiere gaz condensation                         | chaudiere                                 | 1900  | 0   | quelleenergie.fr (#2)     | 1           | absent    | src/app/(public)/guides/chaudiere-gaz-vs-granules/page.tsx   | 164.67  |
| 45  | vmc hygro b                                        | vmc                                       | 1500  | 1   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 162.5   |
| 46  | isolation exterieur prix                           | isolation_ext,isolation_other             | 1600  | 3   | effy.fr (#1)              | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 160.0   |
| 47  | prix dpe                                           | dpe                                       | 2700  | 6   | effy.fr (#1)              | 1           | absent    | src/app/(public)/widget-prix/page.tsx                        | 159.55  |
| 48  | vmc simple flux hygroréglable                      | vmc                                       | 4400  | 1   | quelleenergie.fr (#5)     | 1           | absent    | —                                                            | 158.89  |
| 49  | isolation interieur                                | isolation_murs,isolation_other            | 3600  | 4   | france-renov.gouv.fr (#4) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 152.0   |
| 50  | isolation thermique                                | isolation_other                           | 5700  | 10  | france-renov.gouv.fr (#3) | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 152.0   |
| 51  | panneau solaire 1000w                              | solaire_pv                                | 2100  | 1   | effy.fr (#2)              | 1           | absent    | src/app/(public)/guides/panneau-solaire-prix-rentabilite/pag | 151.67  |
| 52  | isolation 1 euro                                   | isolation_other                           | 1500  | 3   | effy.fr (#1)              | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 150.0   |
| 53  | prix m2 isolation extérieure crépi                 | isolation_ext,isolation_other             | 1300  | 2   | effy.fr (#1)              | 2           | absent    | src/app/(public)/widget-prix/page.tsx                        | 148.57  |
| 54  | poêle à granulés                                   | poele_granules                            | 16000 | 11  | france-renov.gouv.fr (#8) | 1           | absent    | —                                                            | 144.44  |
| 55  | isolation sous toiture entre chevrons              | isolation_other,toiture                   | 1100  | 0   | effy.fr (#1)              | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 143.0   |
| 56  | rge                                                | rge_label                                 | 13000 | 56  | france-renov.gouv.fr (#1) | 1           | absent    | —                                                            | 138.52  |
| 57  | chaudière à granulés                               | chaudiere                                 | 2100  | 5   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 136.5   |
| 58  | prix chaudiere gaz                                 | chaudiere                                 | 1200  | 1   | effy.fr (#1)              | 1           | absent    | src/app/(public)/widget-prix/page.tsx                        | 130.0   |
| 59  | disconnecteur chaudière                            | chaudiere                                 | 1500  | 0   | effy.fr (#2)              | 1           | absent    | —                                                            | 130.0   |
| 60  | batterie pour panneau solaire                      | solaire_pv                                | 3900  | 8   | quelleenergie.fr (#2)     | 1           | absent    | —                                                            | 130.0   |
| 61  | pompe à chaleur prix                               | pac                                       | 4700  | 1   | sonergia.fr (#9)          | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 125.33  |
| 62  | pompe a chaleur mitsubishi                         | pac                                       | 1900  | 0   | effy.fr (#3)              | 1           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 123.5   |
| 63  | isolation sous toiture                             | isolation_other,toiture                   | 1500  | 0   | quelleenergie.fr (#3)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 120.0   |
| 64  | isolation toiture                                  | isolation_combles,isolation_other,toiture | 4700  | 2   | quelleenergie.fr (#8)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 119.37  |
| 65  | prime renov                                        | aides_mpr                                 | 21000 | 66  | effy.fr (#3)              | 2           | absent    | src/app/(public)/comparatif-primes-cee-2026/page.tsx         | 118.31  |
| 66  | dpe c                                              | dpe                                       | 1100  | 0   | quelleenergie.fr (#2)     | 2           | absent    | —                                                            | 117.33  |
| 67  | rendement panneau solaire                          | solaire_pv                                | 3200  | 6   | effy.fr (#3)              | 2           | absent    | —                                                            | 116.36  |
| 68  | isolation thermique extérieure                     | isolation_other                           | 1400  | 1   | france-renov.gouv.fr (#3) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 110.83  |
| 69  | chaudière gaz                                      | chaudiere                                 | 3400  | 1   | quelleenergie.fr (#6)     | 1           | absent    | —                                                            | 105.24  |
| 70  | isolation des combles perdus                       | isolation_combles,isolation_other         | 800   | 0   | france-renov.gouv.fr (#1) | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 104.0   |
| 71  | isolation phonique mur mitoyen                     | isolation_other                           | 800   | 0   | sonergia.fr (#1)          | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 104.0   |
| 72  | isolation 1 €                                      | isolation_other                           | 900   | 2   | effy.fr (#1)              | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 102.86  |
| 73  | panneau solaire piscine                            | solaire_pv                                | 2700  | 2   | quelleenergie.fr (#4)     | 1           | absent    | src/app/(public)/guides/panneau-solaire-prix-rentabilite/pag | 100.29  |
| 74  | pompe à chaleur air eau                            | pac                                       | 4100  | 17  | quelleenergie.fr (#2)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 99.39   |
| 75  | dpe f                                              | dpe                                       | 1500  | 0   | effy.fr (#3)              | 1           | absent    | —                                                            | 97.5    |
| 76  | chaudiere biomasse                                 | chaudiere                                 | 900   | 1   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/guides/chaudiere-gaz-vs-granules/page.tsx   | 97.5    |
| 77  | entretien pompe a chaleur air eau                  | pac                                       | 900   | 0   | quelleenergie.fr (#2)     | 2           | absent    | —                                                            | 96.0    |
| 78  | prix isolation exterieur                           | isolation_ext,isolation_other             | 1900  | 3   | quelleenergie.fr (#3)     | 2           | absent    | src/app/(public)/widget-prix/page.tsx                        | 95.0    |
| 79  | prix isolation extérieur maison 100m2              | isolation_ext,isolation_other             | 700   | 0   | effy.fr (#1)              | 1           | absent    | src/app/(public)/widget-prix/page.tsx                        | 91.0    |
| 80  | devis pompe a chaleur                              | pac                                       | 700   | 0   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/devis/page.tsx                              | 91.0    |
| 81  | installation chaudiere gaz                         | chaudiere                                 | 700   | 0   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/guides/alarme-maison-installation-prix/page | 91.0    |
| 82  | pompe a chaleur hybride                            | pac                                       | 1100  | 3   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 89.38   |
| 83  | pompe a chaleur eau eau                            | pac                                       | 1700  | 0   | sonergia.fr (#4)          | 1           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 88.4    |
| 84  | isolation mur                                      | isolation_murs,isolation_other            | 1300  | 2   | france-renov.gouv.fr (#3) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 88.21   |
| 85  | isolation mur exterieur                            | isolation_murs,isolation_other            | 2200  | 5   | france-renov.gouv.fr (#3) | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 88.0    |
| 86  | installation poele a granule                       | poele_granules                            | 1000  | 0   | effy.fr (#2)              | 1           | absent    | src/app/(public)/guides/alarme-maison-installation-prix/page | 86.67   |
| 87  | isolation thermique par l'extérieur                | isolation_other                           | 1300  | 7   | france-renov.gouv.fr (#1) | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 86.67   |
| 88  | isolation exterieur avant apres                    | isolation_ext,isolation_other             | 800   | 0   | effy.fr (#2)              | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 85.33   |
| 89  | panneau solaire avec batterie                      | solaire_pv                                | 3400  | 13  | quelleenergie.fr (#2)     | 1           | absent    | src/app/(public)/guides/panneau-solaire-prix-rentabilite/pag | 81.85   |
| 90  | chaudiere a granule                                | chaudiere                                 | 1500  | 2   | quelleenergie.fr (#4)     | 3           | absent    | src/app/(public)/guides/chaudiere-gaz-vs-granules/page.tsx   | 81.43   |
| 91  | fonctionnement pompe a chaleur                     | pac                                       | 2500  | 3   | france-renov.gouv.fr (#4) | 1           | absent    | —                                                            | 81.25   |
| 92  | pompe a chaleur 1€                                 | pac                                       | 500   | 0   | sonergia.fr (#1)          | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 80.0    |
| 93  | isolation comble                                   | isolation_combles,isolation_other         | 1100  | 4   | france-renov.gouv.fr (#1) | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 79.44   |
| 94  | entretien chaudière gaz                            | chaudiere                                 | 6200  | 12  | effy.fr (#5)              | 1           | absent    | —                                                            | 79.02   |
| 95  | combien coute un dpe                               | dpe                                       | 600   | 0   | effy.fr (#1)              | 1           | absent    | —                                                            | 78.0    |
| 96  | pompe a chaleur air air prix                       | pac                                       | 1500  | 0   | effy.fr (#4)              | 1           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 78.0    |
| 97  | panneau solaire souple                             | solaire_pv                                | 2100  | 0   | quelleenergie.fr (#6)     | 1           | absent    | src/app/(public)/guides/panneau-solaire-prix-rentabilite/pag | 78.0    |
| 98  | isolation garage                                   | isolation_other                           | 1500  | 0   | france-renov.gouv.fr (#4) | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 78.0    |
| 99  | pompe a chaleur prix                               | pac                                       | 1700  | 2   | effy.fr (#4)              | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 77.71   |
| 100 | isolation toit terrasse                            | isolation_other                           | 600   | 0   | france-renov.gouv.fr (#2) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 76.0    |
| 101 | installer une vmc                                  | vmc                                       | 700   | 0   | effy.fr (#2)              | 2           | absent    | —                                                            | 74.67   |
| 102 | isolation rampant                                  | isolation_other                           | 800   | 2   | effy.fr (#1)              | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 74.29   |
| 103 | isolation par l'exterieur                          | isolation_ext,isolation_other             | 1000  | 8   | france-renov.gouv.fr (#1) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 73.08   |
| 104 | prix pompe à chaleur maison 80m2                   | pac                                       | 450   | 0   | effy.fr (#1)              | 2           | absent    | src/app/(public)/widget-prix/page.tsx                        | 72.0    |
| 105 | aide panneau solaire 2024                          | solaire_pv                                | 4500  | 6   | sonergia.fr (#7)          | 1           | absent    | src/app/(public)/aides/page.tsx                              | 66.48   |
| 106 | isolation sous rampant                             | isolation_other                           | 600   | 1   | effy.fr (#1)              | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 65.0    |
| 107 | pose vmc                                           | vmc                                       | 500   | 0   | effy.fr (#1)              | 1           | absent    | src/app/(public)/guides/adoucisseur-eau-prix-pose/page.tsx   | 65.0    |
| 108 | isolation maison exterieur                         | isolation_other                           | 600   | 1   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 65.0    |
| 109 | prix pompe a chaleur air eau                       | pac                                       | 2400  | 1   | sonergia.fr (#7)          | 1           | absent    | src/app/(public)/widget-prix/page.tsx                        | 65.0    |
| 110 | remplacement chaudière gaz                         | chaudiere                                 | 600   | 1   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/guides/remplacement-fenetres-aides-2026/pag | 65.0    |
| 111 | installation chaudière gaz                         | chaudiere                                 | 500   | 0   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/guides/alarme-maison-installation-prix/page | 65.0    |
| 112 | vmc thermodynamique                                | vmc                                       | 500   | 0   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 65.0    |
| 113 | isolation comble perdu                             | isolation_combles,isolation_other         | 1200  | 1   | france-renov.gouv.fr (#4) | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 64.0    |
| 114 | isolation extérieur                                | isolation_ext,isolation_other             | 1200  | 4   | france-renov.gouv.fr (#3) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 63.33   |
| 115 | isolation thermique intérieur                      | isolation_other                           | 900   | 2   | france-renov.gouv.fr (#3) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 61.07   |
| 116 | isolation par l'intérieur                          | isolation_murs,isolation_other            | 900   | 2   | france-renov.gouv.fr (#3) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 61.07   |
| 117 | isolation par l'extérieur prix                     | isolation_ext,isolation_other             | 600   | 3   | effy.fr (#1)              | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 60.0    |
| 118 | menuiserie aluminium                               | menuiseries                               | 3500  | 6   | quelleenergie.fr (#6)     | 1           | absent    | src/app/(public)/renovation-energetique/travaux/menuiseries/ | 59.09   |
| 119 | isolation entre chevrons                           | isolation_other                           | 450   | 0   | effy.fr (#1)              | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 58.5    |
| 120 | entretien pompe a chaleur air air                  | pac                                       | 450   | 0   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 58.5    |
| 121 | comment nettoyer les panneaux solaires             | other                                     | 900   | 0   | quelleenergie.fr (#3)     | 1           | absent    | src/app/(public)/comment-ca-marche/page.tsx                  | 58.5    |
| 122 | dimension panneau solaire                          | solaire_pv                                | 800   | 4   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 57.78   |
| 123 | isolation sous sol                                 | isolation_other                           | 900   | 0   | sonergia.fr (#4)          | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 57.6    |
| 124 | isolation plancher bas                             | isolation_sol,isolation_other             | 1000  | 2   | quelleenergie.fr (#3)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 57.14   |
| 125 | comment fonctionne une pompe a chaleur             | pac                                       | 300   | 0   | france-renov.gouv.fr (#1) | 3           | absent    | src/app/(public)/comment-ca-marche/page.tsx                  | 57.0    |
| 126 | pompe à chaleur hybride                            | pac                                       | 700   | 3   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 56.88   |
| 127 | isolation toiture terrasse                         | isolation_combles,isolation_other,toiture | 350   | 0   | france-renov.gouv.fr (#1) | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 56.0    |
| 128 | comment fonctionne une pompe à chaleur             | pac                                       | 1800  | 1   | quelleenergie.fr (#6)     | 1           | absent    | src/app/(public)/comment-ca-marche/page.tsx                  | 55.71   |
| 129 | isolation intérieure                               | isolation_murs,isolation_other            | 1200  | 2   | france-renov.gouv.fr (#4) | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 54.86   |
| 130 | validité dpe                                       | dpe                                       | 4600  | 11  | effy.fr (#6)              | 1           | absent    | —                                                            | 53.39   |
| 131 | combien coûte une pompe à chaleur                  | pac                                       | 1000  | 1   | effy.fr (#4)              | 2           | absent    | —                                                            | 53.33   |
| 132 | vmc installation                                   | vmc                                       | 600   | 1   | effy.fr (#2)              | 2           | absent    | —                                                            | 53.33   |
| 133 | pompe a chaleur geothermique                       | pac                                       | 600   | 4   | quelleenergie.fr (#1)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 53.33   |
| 134 | tarif entretien pompe à chaleur air-eau            | pac                                       | 400   | 0   | effy.fr (#1)              | 1           | absent    | src/app/(public)/tarifs/page.tsx                             | 52.0    |
| 135 | prix panneau solaire pour maison 150m2             | solaire_pv                                | 1300  | 3   | effy.fr (#4)              | 2           | absent    | src/app/(public)/widget-prix/page.tsx                        | 52.0    |
| 136 | pompe à chaleur air-air prix                       | pac                                       | 400   | 0   | effy.fr (#1)              | 1           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 52.0    |
| 137 | qualibois                                          | rge_label                                 | 600   | 0   | effy.fr (#2)              | 1           | absent    | src/app/(public)/rge/labels/qualibois/page.tsx               | 52.0    |
| 138 | isolation rampant par l'intérieur                  | isolation_other                           | 400   | 0   | effy.fr (#1)              | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 52.0    |
| 139 | changement chaudiere gaz                           | chaudiere                                 | 400   | 0   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/guides/prix-changement-fenetres-double-vitr | 52.0    |
| 140 | entretien poele a granule                          | poele_granules                            | 1000  | 0   | quelleenergie.fr (#4)     | 1           | absent    | —                                                            | 52.0    |
| 141 | branchement vmc                                    | vmc                                       | 600   | 0   | quelleenergie.fr (#2)     | 1           | absent    | —                                                            | 52.0    |
| 142 | prix pompe à chaleur air-air pour 80 m2            | pac                                       | 400   | 0   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/widget-prix/page.tsx                        | 52.0    |
| 143 | schema pompe a chaleur air eau                     | pac                                       | 600   | 0   | quelleenergie.fr (#2)     | 1           | absent    | —                                                            | 52.0    |
| 144 | pompe a chaleur maison                             | pac                                       | 400   | 0   | france-renov.gouv.fr (#1) | 1           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 52.0    |
| 145 | isolation plafond garage                           | isolation_other                           | 1800  | 0   | france-renov.gouv.fr (#8) | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 52.0    |
| 146 | isolation à 1 euro                                 | isolation_other                           | 450   | 2   | effy.fr (#1)              | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 51.43   |
| 147 | prix isolation exterieur m2                        | isolation_ext,isolation_other             | 500   | 3   | quelleenergie.fr (#1)     | 2           | absent    | src/app/(public)/widget-prix/page.tsx                        | 50.0    |
| 148 | isolation maison                                   | isolation_other                           | 1300  | 12  | france-renov.gouv.fr (#1) | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 49.71   |
| 149 | chaudiere granulés                                 | chaudiere                                 | 1100  | 4   | quelleenergie.fr (#3)     | 2           | absent    | src/app/(public)/guides/chaudiere-gaz-vs-granules/page.tsx   | 48.89   |
| 150 | panneaux solaires thermiques                       | other                                     | 900   | 7   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 48.75   |
| 151 | devis isolation                                    | isolation_other                           | 450   | 0   | effy.fr (#2)              | 2           | absent    | src/app/(public)/devis/page.tsx                              | 48.0    |
| 152 | chaudière à gaz : prix                             | chaudiere                                 | 900   | 0   | effy.fr (#4)              | 1           | absent    | —                                                            | 46.8    |
| 153 | prix isolation combles                             | isolation_combles,isolation_other         | 700   | 1   | effy.fr (#3)              | 2           | absent    | src/app/(public)/widget-prix/page.tsx                        | 46.67   |
| 154 | prix isolation interieur                           | isolation_murs,isolation_other            | 700   | 1   | effy.fr (#3)              | 2           | absent    | src/app/(public)/widget-prix/page.tsx                        | 46.67   |
| 155 | chauffage pompe à chaleur                          | pac                                       | 1100  | 14  | quelleenergie.fr (#1)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/chauffage/pa | 46.32   |
| 156 | audit énergétique tarif                            | audit_energetique                         | 1000  | 2   | quelleenergie.fr (#4)     | 2           | absent    | src/app/admin/(dashboard)/audit/page.tsx                     | 45.71   |
| 157 | isolation mur interieur mince                      | isolation_murs,isolation_other            | 350   | 0   | sonergia.fr (#1)          | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 45.5    |
| 158 | tarif entretien poêle à granulés                   | poele_granules                            | 350   | 0   | sonergia.fr (#1)          | 1           | absent    | src/app/(public)/tarifs/page.tsx                             | 45.5    |
| 159 | puissance pompe a chaleur                          | pac                                       | 350   | 0   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 45.5    |
| 160 | vmc hygroréglable type a                           | vmc                                       | 350   | 0   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 45.5    |
| 161 | prix ballon thermodynamique                        | ballon_thermo                             | 350   | 0   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/widget-prix/page.tsx                        | 45.5    |
| 162 | isolation mousse polyuréthane                      | isolation_other                           | 350   | 0   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 45.5    |
| 163 | ballon thermodynamique prix                        | ballon_thermo                             | 700   | 0   | quelleenergie.fr (#3)     | 1           | absent    | —                                                            | 45.5    |
| 164 | isolation par exterieur                            | isolation_other                           | 500   | 2   | quelleenergie.fr (#2)     | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 45.24   |
| 165 | isolation phonique sol                             | isolation_other                           | 700   | 0   | quelleenergie.fr (#4)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 44.8    |
| 166 | photovoltaïque                                     | solaire_pv                                | 8500  | 31  | quelleenergie.fr (#6)     | 1           | absent    | —                                                            | 43.85   |
| 167 | isolation par l'extérieur prix m2                  | isolation_ext,isolation_other             | 400   | 1   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 43.33   |
| 168 | quelle est la meilleure marque de poêle à granulés | poele_granules                            | 500   | 0   | quelleenergie.fr (#2)     | 1           | absent    | —                                                            | 43.33   |
| 169 | panneau solaire hybride                            | solaire_pv                                | 1400  | 4   | effy.fr (#5)              | 2           | absent    | src/app/(public)/guides/panneau-solaire-prix-rentabilite/pag | 41.48   |
| 170 | meilleur poele a granule                           | poele_granules                            | 500   | 3   | quelleenergie.fr (#1)     | 1           | absent    | —                                                            | 40.62   |
| 171 | isolation polyuréthane                             | isolation_other                           | 1300  | 1   | sonergia.fr (#6)          | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 40.24   |
| 172 | isolation 1 euros                                  | isolation_other                           | 350   | 2   | effy.fr (#1)              | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 40.0    |
| 173 | isolation par l'extérieur 1€                       | isolation_ext,isolation_other             | 250   | 0   | effy.fr (#1)              | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 40.0    |
| 174 | isolation exterieur a 1€                           | isolation_ext,isolation_other             | 250   | 0   | quelleenergie.fr (#1)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 40.0    |
| 175 | prix isolation extérieur maison 140m2              | isolation_ext,isolation_other             | 250   | 0   | quelleenergie.fr (#1)     | 2           | absent    | src/app/(public)/widget-prix/page.tsx                        | 40.0    |
| 176 | isolation 1€ condition gouvernement                | isolation_other                           | 350   | 2   | quelleenergie.fr (#1)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 40.0    |
| 177 | pompe à chaleur géothermique prix                  | pac                                       | 250   | 0   | quelleenergie.fr (#1)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 40.0    |
| 178 | prix pompe à chaleur air-air pour 120m2            | pac                                       | 250   | 0   | quelleenergie.fr (#1)     | 2           | absent    | src/app/(public)/widget-prix/page.tsx                        | 40.0    |
| 179 | chaudiere a pellet                                 | chaudiere                                 | 700   | 2   | quelleenergie.fr (#3)     | 2           | absent    | src/app/(public)/guides/chaudiere-gaz-vs-granules/page.tsx   | 40.0    |
| 180 | ma prime renov 2025                                | aides_mpr                                 | 8800  | 67  | france-renov.gouv.fr (#3) | 1           | absent    | —                                                            | 39.72   |
| 181 | isolation rampant de toiture                       | isolation_other,toiture                   | 300   | 0   | effy.fr (#1)              | 1           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 39.0    |
| 182 | dpe b                                              | dpe                                       | 300   | 0   | effy.fr (#1)              | 1           | absent    | —                                                            | 39.0    |
| 183 | prix chaudière gaz                                 | chaudiere                                 | 600   | 0   | effy.fr (#3)              | 1           | absent    | src/app/(public)/widget-prix/page.tsx                        | 39.0    |
| 184 | cout dpe maison                                    | dpe                                       | 300   | 0   | effy.fr (#1)              | 1           | absent    | —                                                            | 39.0    |
| 185 | panneau solaire prix                               | solaire_pv                                | 6300  | 25  | quelleenergie.fr (#6)     | 1           | absent    | src/app/(public)/guides/panneau-solaire-prix-rentabilite/pag | 39.0    |
| 186 | chaudiere hybride                                  | chaudiere                                 | 300   | 0   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/guides/chaudiere-gaz-vs-granules/page.tsx   | 39.0    |
| 187 | installation vmc double flux                       | vmc                                       | 600   | 0   | effy.fr (#4)              | 2           | absent    | src/app/(public)/guides/alarme-maison-installation-prix/page | 38.4    |
| 188 | prix installation pompe a chaleur                  | pac                                       | 700   | 1   | sonergia.fr (#4)          | 2           | absent    | src/app/(public)/widget-prix/page.tsx                        | 37.33   |
| 189 | isolation exterieure                               | isolation_ext,isolation_other             | 700   | 4   | france-renov.gouv.fr (#3) | 3           | absent    | src/app/(public)/renovation-energetique/travaux/isolation/pa | 36.94   |
| 190 | entreprise rge                                     | rge_label                                 | 2200  | 34  | france-renov.gouv.fr (#1) | 1           | absent    | —                                                            | 36.67   |
| 191 | cout dpe                                           | dpe                                       | 450   | 3   | effy.fr (#1)              | 1           | absent    | —                                                            | 36.56   |
| 192 | pompe à chaleur géothermique                       | pac                                       | 450   | 3   | quelleenergie.fr (#1)     | 1           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 36.56   |
| 193 | rénovation énergétique maison                      | other                                     | 1500  | 28  | france-renov.gouv.fr (#1) | 2           | absent    | —                                                            | 36.36   |
| 194 | pompes à chaleur                                   | pac                                       | 2000  | 17  | france-renov.gouv.fr (#3) | 2           | absent    | —                                                            | 36.36   |
| 195 | panneau solaire gratuit gouvernement               | solaire_pv                                | 1000  | 7   | effy.fr (#2)              | 1           | absent    | src/app/(public)/guides/panneau-solaire-prix-rentabilite/pag | 36.11   |
| 196 | angle panneau solaire                              | solaire_pv                                | 500   | 1   | quelleenergie.fr (#2)     | 1           | absent    | —                                                            | 36.11   |
| 197 | pompe chaleur                                      | pac                                       | 1500  | 22  | france-renov.gouv.fr (#1) | 1           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 36.11   |
| 198 | depannage pompe a chaleur                          | pac                                       | 450   | 0   | effy.fr (#3)              | 2           | absent    | —                                                            | 36.0    |
| 199 | pompe à chaleur à 1 euro vrai ou faux              | pac                                       | 450   | 0   | quelleenergie.fr (#3)     | 2           | absent    | src/app/(public)/renovation-energetique/travaux/pompe-a-chal | 36.0    |
| 200 | ma prime renov 2026                                | aides_mpr                                 | 12000 | 69  | france-renov.gouv.fr (#5) | 1           | absent    | —                                                            | 35.14   |

---

## ⚠️ BUCKET 3 — DEEP (top 50, 0 total)

**Effort lourd** : SA déjà rank > 50, page existe mais sous-performe. Audit avant rewrite.

| #   | Keyword | Clusters | Vol | KD  | Best leader (pos) | #lead top10 | SA status | Existing page | Score |
| --- | ------- | -------- | --- | --- | ----------------- | ----------- | --------- | ------------- | ----- |

## Action recommandée

- **Bucket 1 (striking)** : 1-2 sem effort = audit page existante + rewrite + maillage interne. ROI immédiat.
- **Bucket 2 (absent)** : flagship Sprint 3, 1 KW = 1 page. Cible top 50 vol >= 500.
- **Bucket 3 (deep)** : audit avant rewrite, possiblement page mal ciblée.
- KW avec ≥3 leaders top 10 = très fertiles (consensus = vraie demande).
- Si SERP features = `featured_snippet|paa` → câbler TldrBlock + EnBrefBox + FAQ Schema.
- **Cluster top 3 par volume cumulé** = candidats hub pages prioritaires.
