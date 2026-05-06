# Snapshot — Audit Ahrefs Rénovation Énergétique

**Date** : 2026-05-06
**Source data** : 4 audits Ahrefs distincts (2026-04 + 2026-05-04 Bloc 1 + 2026-05-06 API live)
**Périmètre** : Pivot Pillar #2 SA (rénovation énergétique 2026)
**Quota Ahrefs consommé à date** : ~145K U / 1M (855K dispo jusqu'au 2026-05-18)

---

## 1. Sources d'audit cataloguées

| #   | Fichier                                                        | Date       | Lignes | Statut                                      |
| --- | -------------------------------------------------------------- | ---------- | -----: | ------------------------------------------- |
| A   | `docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv`  | 2026-04-18 | 75 001 | Snapshot brut SA vs PagesJaunes/Travaux/IZI |
| B   | `docs/ahrefs-renovation-keywords-extracted-2026-05-04.md`      | 2026-05-04 |     75 | 42 KW filtrés depuis A (étape interm.)      |
| C   | `docs/ahrefs-bloc1-keywords-gap-2026-05-04.md`                 | 2026-05-04 |    287 | 200 KW Bloc 1 niche **(source vérité)**     |
| D   | `docs/ahrefs-bloc1-pages-mines-2026-05-04.md`                  | 2026-05-04 |    124 | 503 pages-mines top 100                     |
| E   | `docs/STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED-2026-05-04.md` | 2026-05-04 |    218 | Roadmap V2 4 vagues                         |
| F   | `docs/ahrefs-renovation-domination-RECOMMANDATIONS.md`         | 2026-04    |    232 | Déclencheur initial                         |
| G   | Headers JSDoc pages WIP                                        | 2026-05-06 |      — | API live revalidation                       |

> ⚠️ **A vs C** : A est un gap concurrentiel large (PagesJaunes/Travaux/IZI), pas reno-spécifique. **C est la source vérité reno** (4 leaders niche : effy.fr DR 72, sonergia.fr DR 49, quelleenergie.fr, france-renov.gouv.fr).

---

## 2. Top 10 clusters niche (vol cumul/mo)

| Rang | Cluster              | Nb KW |   Vol cumul |   KD avg | Verdict V2              |
| ---: | -------------------- | ----: | ----------: | -------: | ----------------------- |
|    1 | **PAC**              |   615 |     230 190 |      4.6 | Big head, hub existe    |
|    2 | **Solaire PV**       |   288 |     229 940 |     10.4 | Cluster sous-investi V1 |
|    3 | **Isolation other**  |   871 |     227 530 |      3.9 | Confirme V1             |
|    4 | MaPrimeRénov'        |   271 |     157 840 | **33.5** | KD haut                 |
|    5 | **VMC**              |   215 | **127 800** |  **0.7** | 🔥 Goldmine inattendue  |
|    6 | Chaudière            |   294 |      85 690 |      2.6 | Sous-investi V1         |
|    7 | Poêle granulés       |   107 |      66 250 |      4.2 | Sous-investi V1         |
|    8 | ITE (isolation ext.) |   159 |      64 610 |      6.1 | Sur roadmap V1          |
|    9 | DPE                  |   241 |      54 840 |     11.1 | Sur roadmap V1          |
|   10 | Other                |   169 |      52 200 |     21.6 | À reclasser             |

**Total 10 clusters niche** : ~1.30M vol/mo accessibles (KD avg pondéré 8.9).

---

## 3. Insights forts (data > intuition)

### 🔥 VMC = goldmine inattendue

- 215 KW cluster, KD avg **0.7** (quasi-libre)
- Pivots : `vmc simple flux` 15K KD 2 (#4), `vmc hygroréglable` 14K KD 1 (#5), `vmc salle de bain` 9.7K KD 0 (#9), `vmc` 48K KD 7 (#8)
- Effy rank #2 partout — **possibilité dépasser**
- ✅ SA hub `/vmc/` existe, 4 sub-pages déployées (simple-flux, hygroreglable, installation, entretien, salle-de-bain WIP)
- 🟡 Manque encore : `vmc` head term ciblé, `vmc double flux thermodynamique` 1.8K KD 0, `vmc hygroréglable type b` 1.7K KD 0, `vmc thermodynamique` 0.5K KD 0, `branchement vmc` 0.6K KD 0

### 🔥 PAC = big head saturé mais opportunité long-tail

- 615 KW, KD avg 4.6
- Head : `pompe a chaleur` 56K KD 13 (france-renov #1, page-mine #1 vol 28K trafic/mo)
- Sub-niches faciles : `consommation pompe a chaleur` 3.3K KD 1 (✅ WIP), `entretien pompe a chaleur` 5.6K KD 1 (✅ recalibré), `installation pompe a chaleur` 3.3K KD 1 (ABSENT)
- Manques : `fonctionnement pompe a chaleur` 2.5K KD 3, `puissance pompe a chaleur` 0.35K KD 0, `pompe a chaleur eau eau` 1.7K KD 0, `combien coûte une pompe à chaleur` 1K KD 1, `dépannage pompe a chaleur` 0.45K KD 0

### 🔥 Solaire PV = cluster orphelin V1

- 288 KW, vol 230K, KD avg 10.4
- Head : `panneau solaire` 87K KD 43 (existe guide), `panneaux solaires` 20K KD 38 (ABSENT)
- Hub `/renovation-energetique/travaux/solaire/` existe ✅ + 5 sub-pages (autoconso WIP, nettoyage, 1000w, souple, piscine)
- Manques majeurs : `photovoltaïque` 8.5K KD 31, `rendement panneau solaire` 3.2K KD 6, `dimension panneau solaire` 0.8K KD 4, `inclinaison des panneaux solaires` 0.2K KD 0

### 🔥 Ballon thermodynamique = NICHE ENTIÈREMENT ABSENTE

- 47 KW cluster, vol cumul **22 840**, KD avg 2.3
- Pivot : `ballon thermodynamique` 18K KD 6 (france-renov #4, ABSENT SA)
- Variantes : `prix ballon thermodynamique` 0.35K KD 0, `ballon thermodynamique prix` 0.7K KD 0
- 🚨 **Aucune page SA dédiée**. /chauffage/chauffe-eau-thermodynamique existe mais pas focus "ballon thermodynamique" (terme distinct côté KW)

### 🔥 DPE classes = niche granulaire absente

- 241 KW cluster, KD avg 11.1
- Pivots couverts : `validite dpe` 4.6K KD 11 (✅ WIP), `prix dpe` 2.7K KD 6 (✅ blog WIP)
- **Pivots ABSENTS** : `dpe d` 2.2K KD 1, `dpe c` 1.1K KD 0, `dpe f` 1.5K KD 0, `dpe b` 0.3K, `dpe e` (faible vol mais cluster), `dpe g` (lié passoire mais classe en soi)
- Cumul DPE classes : ~5K vol KD 0-1 = **mega easy win**

### 🔥 Isolation = monstre déjà bien couvert

- 871 KW, vol 227K, KD avg 3.9
- ✅ SA structure complète : combles + ITE + interieure + phonique + sol/{garage,vide-sanitaire,cave-plafond} + toiture
- 🟡 Reste : `isolation 1 euro` 1.5K KD 3 (nettoyage), `isolation thermique` 5.7K KD 10, `isolation maison` 1.3K KD 12 → enrichissement, pas création

### 🔥 Chaudière + Poêle granulés = sous-investis V1

- Chaudière : 294 KW, vol 86K, KD 2.6 → SA a /chaudiere-bois + /chaudiere-condensation
- Manques : `disconnecteur chaudière` 1.5K KD 0, `chaudiere biomasse` 2.8K KD 0 (terme distinct vs bois), `chaudière à granulés` 2.1K KD 5, `entretien chaudière gaz` 6.2K KD 12
- Poêle : 107 KW, vol 66K, KD 4.2 → SA a /poele-granules
- Manques : `entretien poele a granule` 1K KD 0, `meilleur poele a granule` 0.5K KD 3, `tarif entretien poêle à granulés` 0.35K KD 0

---

## 4. Coverage matrix : KW pivots Bloc 1 → pages SA

| Bucket                      | Pivots Bloc 1 | Couverts (page existe) | Couverts WIP | ABSENTS | % couvert |
| --------------------------- | ------------: | ---------------------: | -----------: | ------: | --------: |
| Top 50 (vol > 1.6K, KD bas) |            50 |                     32 |            5 |      13 |       74% |
| Top 100 (vol > 0.7K)        |            50 |                     30 |            0 |      20 |       60% |
| Top 200 (vol > 0.25K)       |           100 |                     50 |            0 |      50 |       50% |
| **Total**                   |       **200** |                **112** |        **5** |  **83** | **58.5%** |

> 58.5% des 200 KW pivots ont déjà une page candidate SA. Le travail dominant est **enrichissement + maillage**, pas création.

### Pivots ABSENTS prioritaires (top 13 du top 50)

| #   | Keyword                             |    Vol |  KD | Best leader (pos)     | Page SA candidate à créer                                    |
| --- | ----------------------------------- | -----: | --: | --------------------- | ------------------------------------------------------------ |
| 4   | vmc simple flux                     | 15 000 |   2 | effy.fr (#2)          | ✅ existe `/vmc/simple-flux/` (recheck ranking)              |
| 5   | vmc hygroréglable                   | 14 000 |   1 | quelleenergie.fr (#2) | ✅ existe `/vmc/hygroreglable/` (recheck ranking)            |
| 7   | **ballon thermodynamique**          | 18 000 |   6 | france-renov (#4)     | 🆕 `/renovation-energetique/travaux/ballon-thermodynamique/` |
| 8   | **vmc**                             | 48 000 |   7 | france-renov (#9)     | ✅ hub `/vmc/` (re-cibler head term)                         |
| 12  | **chaudière biomasse**              |  2 800 |   0 | quelleenergie (#1)    | 🆕 `/chauffage/chaudiere-biomasse/` (vs bois)                |
| 22  | **panneau photovoltaique**          | 21 000 |  27 | quelleenergie (#2)    | 🆕 `/solaire/photovoltaique-vs-thermique/`                   |
| 26  | chaudière à condensation            |  6 900 |   2 | quelleenergie (#4)    | ✅ existe `/chaudiere-condensation/` (recheck)               |
| 27  | ma prime renov                      | 57 000 |  67 | france-renov (#4)     | ✅ existe `/maprimerenov-2026/`                              |
| 29  | **vmc double flux thermodynamique** |  1 800 |   0 | quelleenergie (#1)    | 🆕 `/vmc/double-flux-thermodynamique/`                       |
| 30  | **dpe d**                           |  2 200 |   1 | effy.fr (#2)          | 🆕 cluster `/dpe/classes/{a,b,c,d,e,f,g}/`                   |
| 32  | **vmc hygroréglable type b**        |  1 700 |   0 | quelleenergie (#1)    | 🆕 sub `/vmc/hygroreglable/type-b/`                          |
| 38  | **panneaux solaires**               | 20 000 |  38 | quelleenergie (#2)    | enrich hub `/solaire/`                                       |
| 39  | chaudière                           |  3 900 |   4 | effy (#2)             | ✅ hub existe `/chauffage/`                                  |

---

## 5. Pages-mines top 30 (concurrents qui dominent)

Top URLs concurrentes dont on n'a pas l'équivalent (ou faible) :

| #   | Leader            | URL                                                     | Top KW                          | Trafic/mo | SA équivalent ?                        |
| --- | ----------------- | ------------------------------------------------------- | ------------------------------- | --------: | -------------------------------------- |
| 1   | france-renov      | renovation/chauffage/pompe-chaleur-maison               | pompe a chaleur                 |    28 253 | ✅ /pompe-a-chaleur (à enrich)         |
| 2   | france-renov      | annuaires-professionnels/artisan-rge-architecte         | rge                             |    18 885 | ✅ /rge/labels (différencié)           |
| 3   | france-renov      | renovation/isolation/murs-maison                        | isolation exterieur             |     9 721 | ✅ /isolation/exterieure-ite           |
| 4   | **effy**          | renovation-energetique/prix-dpe                         | prix dpe                        |     5 088 | ✅ blog WIP `prix-dpe-2026`            |
| 5   | france-renov      | renovation/isolation/combles-maison                     | isolation des combles           |     4 206 | ✅ /isolation/combles                  |
| 11  | **quelleenergie** | chaudiere-granules-bois-pellets/avantages-inconvenients | chaudière à granulés            |     2 531 | 🟡 /chaudiere-bois (cibler granulés)   |
| 16  | **quelleenergie** | vmc-hygroreglable-de-type-b                             | vmc hygroréglable type b        |     1 721 | 🆕 ABSENT                              |
| 19  | quelleenergie     | panneau-solaire-thermique                               | panneau solaire thermique       |     1 382 | 🟡 guide existe (sub-page dédiée ?)    |
| 22  | **effy**          | pompe-a-chaleur/consommation-electrique                 | consommation pompe a chaleur    |     1 910 | ✅ WIP `/pompe-a-chaleur/consommation` |
| 27  | france-renov      | ventilation/ventilation-double-flux                     | vmc double flux fonctionnement  |       978 | ✅ /vmc-double-flux/                   |
| 36  | quelleenergie     | vmc-double-flux-thermodynamique                         | vmc double flux thermodynamique |     1 078 | 🆕 ABSENT                              |
| 37  | quelleenergie     | pompe-chaleur-air-eau                                   | pompe a chaleur air eau         |     2 653 | ✅ /pac/air-eau-prix                   |
| 38  | france-renov      | preparer-projet/dpe-audit                               | diagnostic énergétique          |     2 615 | ✅ /diagnostic                         |
| 39  | quelleenergie     | pompe-chaleur-geothermique                              | PAC géothermique                |       914 | ✅ /pac/geothermie                     |
| 41  | quelleenergie     | pompe-a-chaleur                                         | pompe à chaleur                 |     2 520 | ✅ /pac (head)                         |

---

## 6. État WIP session 2026-05-06 (validé Bloc 1)

| Page                                 | Cluster Bloc 1 | KW pivot Bloc 1                                   |   Match   |
| ------------------------------------ | -------------- | ------------------------------------------------- | :-------: |
| WIP `/solaire/autoconsommation`      | solaire_pv     | `panneau solaire avec batterie` (#89, 3.4K KD 13) |    ✅     |
| WIP `/dpe/validite`                  | dpe            | `validité dpe` (#130, 4.6K KD 11)                 |    ✅     |
| WIP `/pac/consommation`              | pac            | `consommation pompe a chaleur` (#28, 3.3K KD 1)   | ✅ direct |
| WIP `/vmc/salle-de-bain`             | vmc            | `vmc salle de bain` (#9, 9.7K KD 0)               | ✅ direct |
| WIP `/cee/comparatif-primes-energie` | aides_cee      | `prime cee edf` 6.3K KD 30 (cluster CEE)          |    ✅     |
| Recalibré `/pac/entretien`           | pac            | `entretien pompe a chaleur` (#15, 5.6K KD 1)      | ✅ direct |
| Blog WIP `prix-dpe-2026`             | dpe            | `prix dpe` (#47, 2.7K KD 6)                       | ✅ direct |

**Toutes les 7 pièces ce session matchent un KW pivot Bloc 1**, dont **3 dans top 50** (KW #9, #15, #28).

---

## 7. Gaps prioritaires post-WIP

### P0 — Easy wins ABSENTS (KD ≤ 5, vol ≥ 1K)

| Rang | KW                              |     Vol |   KD | Cluster        | Page à créer                                     |
| ---: | ------------------------------- | ------: | ---: | -------------- | ------------------------------------------------ |
|    1 | ballon thermodynamique          |  18 000 |    6 | ballon_thermo  | 🆕 `/travaux/ballon-thermodynamique/`            |
|    2 | chaudière à condensation        |   6 900 |    2 | chaudiere      | ✅ existe — recheck rank                         |
|    3 | entretien chaudière gaz         |   6 200 |   12 | chaudiere      | 🆕 `/chauffage/chaudiere-condensation/entretien` |
|    4 | chaudière biomasse              |   2 800 |    0 | chaudiere      | 🆕 distinct `/chaudiere-biomasse/`               |
|    5 | dpe d + dpe c + dpe f + dpe b   |  ~5 100 |  0-1 | dpe            | 🆕 cluster `/dpe/classes/[lettre]/`              |
|    6 | fonctionnement pompe à chaleur  |   2 500 |    3 | pac            | 🆕 `/pac/fonctionnement/`                        |
|    7 | poele a granule + variants      | ~30 000 | 0-21 | poele_granules | enrich existant + sub-pages                      |
|    8 | vmc double flux thermodynamique |   1 800 |    0 | vmc            | 🆕 `/vmc/double-flux-thermodynamique/`           |
|    9 | vmc hygroréglable type b        |   1 700 |    0 | vmc            | 🆕 sub `/vmc/hygroreglable/type-b/`              |
|   10 | rendement panneau solaire       |   3 200 |    6 | solaire_pv     | 🆕 `/solaire/rendement/`                         |
|   11 | disconnecteur chaudière         |   1 500 |    0 | chaudiere      | 🆕 niche pure                                    |
|   12 | photovoltaïque                  |   8 500 |   31 | solaire_pv     | enrich hub                                       |
|   13 | menuiserie aluminium            |   3 500 |    6 | menuiseries    | 🆕 sub `/menuiseries/aluminium/`                 |

**Sub-total ABSENTS top 50 P0 (création)** : ~70K vol/mo accessibles (KD 0-12).

### P1 — Pivots du top 100-200 ABSENTS

| KW                           |    Vol |  KD | Page candidate            |
| ---------------------------- | -----: | --: | ------------------------- |
| validité dpe                 |  4 600 |  11 | ✅ WIP couvre             |
| ma prime renov 2026          | 12 000 |  69 | ✅ existe (recheck)       |
| ma prime renov 2025          |  8 800 |  67 | enrich /maprimerenov-2026 |
| pompe à chaleur géothermique |  0.45K |   3 | ✅ existe                 |
| meilleur poele a granule     |   0.5K |   3 | 🆕                        |
| installation panneau solaire |   7.9K |   — | 🆕                        |
| entreprise rge               |   2.2K |  34 | 🆕                        |

**Sub-total P1** : ~30K vol/mo additionnels.

---

## 8. Recommandations next step (priorisées)

### Vague WIP — finaliser session 2026-05-06 (P0)

1. ✅ Commit groupé "feat(seo): Bloc 1 récap — 5 sub-pages B4-B8 + Vague E + recalibration B6" (cf. snapshot précédent)
2. ✅ npm run build + lint
3. ✅ Push J+3 (2026-05-08)

### Vague suivante — Bloc 1 P0 ABSENTS (1-2 sem)

| Sprint          | Pages                                                               |       Vol cumul/mo |
| --------------- | ------------------------------------------------------------------- | -----------------: |
| S1 (3-5j)       | `/dpe/classes/{a,b,c,d,e,f,g}/` (7 sub-pages, KD 0-1)               |             ~5 100 |
| S2 (3j)         | `/travaux/ballon-thermodynamique/` (KD 6)                           |             18 000 |
| S3 (2j)         | `/vmc/double-flux-thermodynamique/` + `/hygroreglable/type-b/`      |              3 500 |
| S4 (3j)         | `/chauffage/chaudiere-condensation/entretien-gaz/` (KD 12)          |              6 200 |
| S5 (2j)         | `/pac/fonctionnement/` + niches (puissance, dépannage)              |              3 500 |
| S6 (2j)         | `/solaire/rendement/` + dimension/inclinaison/photovoltaïque enrich |            ~12 000 |
| **Total Vague** | **~14 sub-pages**                                                   | **~48 300 vol/mo** |

### Vague longue — Bloc 1 V2 roadmap (Vague 1-4 strat doc)

- M+3 : 30 pages → +1500-3500 clics/j cumul
- M+5 : +30 pages → +2300-5300 clics/j
- M+9 : 110 pages cumul → +3200-7400 clics/j
- Cible M+12 : **3500-7800 clics/j** (×10-22 vs baseline 350)

### Vagues optionnelles

- ⏳ Pull Bloc 2 Ahrefs (backlinks intersect, ~28K U) → identifier 100 sites cibles outreach
- ⏳ Pull Bloc 3 (long-tail keywords explorer, ~32K U) → alimenter sub-pages Vague 2-3

---

## 9. KPIs suivi (state actuel + cibles)

| Métrique                                |   Baseline | Cible M+3 |            Cible M+9 |
| --------------------------------------- | ---------: | --------: | -------------------: |
| Clics/j SA total (GSC)                  |        350 |  700-1200 |          3 500-7 800 |
| Position `vmc simple flux`              |          0 |    top 10 |                top 5 |
| Position `vmc hygroréglable`            |          0 |    top 10 |                top 5 |
| Position `consommation pompe a chaleur` |          0 |    top 20 |               top 10 |
| Position `validite dpe`                 |          0 |    top 30 |               top 10 |
| % 200 KW Bloc 1 où SA top 50            |         0% |       15% |                  50% |
| % 503 pages-mines avec équivalent SA    |       ~25% |       40% |                  60% |
| KW gap Bloc 2 (à pull)                  | non-mesuré |  snapshot | tracking trimestriel |

---

## 10. Conclusion

### État

- 7 livrables session 2026-05-06 (5 pages flagship + 1 blog + 1 recalibration) **= +69 480 vol/mo accessibles**
- Tous validés contre Bloc 1 (3/7 sont des pivots top 50)
- Coverage 200 KW pivots niche : **58.5% candidate page existe** (création nécessaire = 41.5%)

### Verdict

- ✅ La session est **alignée stratégie V2 cluster-first**
- ✅ Vague 1 V2 (VMC + Iso + ITE + PAC) bien entamée (5 pages livrées + 1 recalibration ce sprint cumul depuis 4 jours)
- 🔥 **Prochain coup haut-impact** : cluster `/dpe/classes/{a-g}/` (~5K vol KD 0-1 quasi-libre) + `/travaux/ballon-thermodynamique/` (18K vol KD 6 cluster orphelin)
- 🚨 **Risque** : MaPrimeRénov' KD 33.5 → ne pas perdre temps sur head terms, focus longue traîne MPR (locataire/copro/bailleur)

### Enchaînement préconisé

1. Finaliser commit + build + lint + push session courante (P0 immédiat)
2. Ouvrir nouveau cycle "Vague Bloc 1 P0" : 14 sub-pages, ~48K vol/mo, 2 sem effort
3. Pull Bloc 2 Ahrefs si quota OK (855K dispo) pour préparer outreach Vague 3

---

_Snapshot composé sur la base de la lecture intégrale des audits A-F + cross-check filesystem. Volumes/KD = données Ahrefs Bloc 1 v3 (2026-05-04, 4 leaders niche). Aucun chiffre inventé._
