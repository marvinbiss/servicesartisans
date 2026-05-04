# KW Gap Attack Plan — Action #7 (Sprint C)

**Date** : 2026-05-03
**Source** : `kw_gap_attack_top100.csv` + `competitor_url_patterns.csv`
**Méthode** : reverse-engineering de 5 concurrents (effy, france_renov, hellio, selectra, sonergia) — top 1000 KW chacun, croisé avec les 141 KW SA, filtres scope sectoriels.

## Volume capturable

| Bucket                              | KW  | Vol mensuel cumulé          |
| ----------------------------------- | --- | --------------------------- |
| Gap total (filtré scope rénovation) | 554 | 813 200/mois                |
| **Top 100 attack**                  | 100 | **519 200/mois**            |
| Top 100 avec page existante         | 92  | ~480K (à optimiser on-page) |
| Top 100 sans page (création)        | 8   | ~38K (input Sprint F #8)    |

**Effet à M+3 si capture top 10 sur les 100 KW** (CTR 4-6% pos 5-10) : **+25-35K clics/mois**.

## Distribution par cluster (top 100 attack)

| Cluster            | KW                        | Hub SA                                 | Status          |
| ------------------ | ------------------------- | -------------------------------------- | --------------- |
| isolation          | 148 univers / top 100 ~25 | `/services/isolation-thermique`        | ✅ existant     |
| pompe-a-chaleur    | 85 univers / top 100 ~20  | `/services/pompe-a-chaleur`            | ✅ existant     |
| solaire            | 69 / top 100 ~10          | `/services/panneaux-solaires`          | ✅ existant     |
| audit-energetique  | 51 / top 100 ~7           | `/renovation-energetique`              | ✅ hub fallback |
| chauffe-eau        | 29 / top 100 ~6           | `/cee/bar-th-148`                      | ✅ existant     |
| chauffage          | 38 / top 100 ~6           | `/services/chauffagiste`               | ✅ existant     |
| ventilation        | 26 / top 100 ~5           | `/cee/bar-th-127`                      | ✅ existant     |
| poele              | 23 / top 100 ~4           | `/cee/bar-th-112`                      | ✅ existant     |
| isolation-phonique | 15 / top 100 ~5           | ❌ **manque hub**                      | Sprint F        |
| travaux            | 49 / top 100 ~3           | ❌ **manque hub `/renovation-{type}`** | Sprint F        |
| irve               | 4 / top 100 ~1            | ❌ **manque hub borne recharge**       | Sprint F        |

## Patterns d'URL gagnants (concurrents)

Top 5 patterns par volume capturé sur le top 50 KW :

| Concurrent       | Pattern                                             | nKw | Vol cumulé | Sample                                                              |
| ---------------- | --------------------------------------------------- | --- | ---------- | ------------------------------------------------------------------- |
| **france_renov** | `/renovation/{cluster}/{detail}`                    | 4   | 73 300     | "installation pompe a chaleur", "pompe a chaleur"                   |
| france_renov     | `/renovation/chauffage/[long-slug]`                 | 2   | 49 000     | "chauffe eau thermodynamique", "ballon thermodynamique"             |
| effy             | `/travaux-energetique/{cluster}/{sub}/{detail}`     | 1   | 39 000     | "chauffe eau"                                                       |
| **france_renov** | `/renovation/isolation/murs-maison`                 | 4   | 38 600     | "isolation exterieur", "isolation par l'extérieur", "isolation"     |
| **hellio**       | `/blog/conseils/[long-slug]`                        | 3   | 22 100     | "seche linge pompe a chaleur", "prise renforcée voiture électrique" |
| **sonergia**     | `/conseils-travaux/{cluster}/{subcluster}/{topic}/` | 5   | 20 000     | "pompe à chaleur prix", "pompe a chaleur air eau"                   |

**Structure dominante adoptée par tous les concurrents** :

```
/{vertical-hub}/{cluster}/{topic-detail}
```

avec articles long-form 1500-3000 mots + FAQ + prix + photos.

> 🎯 **Application SA** : Sprint F #8 (4 pillars restants) doit s'inspirer de cette structure. Notre `/cee/{op}` actuel est plus court que les concurrents (~600 mots vs 2000+). Renforcer chaque page CEE prioritaire avec section topic-detail (ex: `/cee/bar-th-148/installation` pour "installation chauffe-eau thermodynamique").

## Top 20 KW à attaquer immédiatement (page existante — Sprint C suite)

| Rank | KW                           | Vol    | KD  | Page SA                                            | Action on-page                                                                                           |
| ---- | ---------------------------- | ------ | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1    | seche linge pompe a chaleur  | 17 000 | 1   | `/services/pompe-a-chaleur`                        | Hors scope artisan strict — passer ou rediriger vers blog produit                                        |
| 2    | isolation mur intérieur      | 7 800  | 1   | `/services/isolation-thermique`                    | Ajouter section H2 "Isolation murs intérieurs" + comparatif épaisseurs                                   |
| 3    | isolation exterieur          | 14 000 | 2   | `/services/isolation-thermique`                    | Ajouter section H2 "ITE" + tableau prix m²                                                               |
| 4    | pompe à chaleur prix         | 4 700  | 1   | `/services/pompe-a-chaleur`                        | ✅ Title déjà optimisé (8000-18000 €) — ajouter tableau prix par marque                                  |
| 5    | chauffe eau                  | 39 000 | 5   | `/cee/bar-th-148`                                  | ✅ Title rewrite Action #9 livré ("Chauffe-eau thermodynamique") — vérifier H1 + ajouter section "types" |
| 6    | vmc simple flux              | 15 000 | 2   | `/cee/bar-th-127`                                  | ✅ Title rewrite livré — ajouter section "VMC simple vs double flux"                                     |
| 7    | installation pompe a chaleur | 3 300  | 1   | `/services/pompe-a-chaleur`                        | Ajouter H2 "Installation PAC : étapes + délai"                                                           |
| 8    | dpe d                        | 2 100  | 1   | `/renovation-energetique`                          | Ajouter section "Comprendre les classes DPE" + lien guide DPE                                            |
| 9    | pompe a chaleur              | 56 000 | 13  | `/services/pompe-a-chaleur`                        | Top KW racine — vérifier title/H1/FAQ déjà optimaux                                                      |
| 10   | chauffage                    | 20 000 | 10  | `/services/chauffagiste`                           | KW générique — ajouter intro "guide chauffage 2026" + 3 H2 (PAC/chaudière/poêle)                         |
| 11   | panneau solaire camping car  | 3 500  | 1   | `/services/panneaux-solaires`                      | Hors scope strict, mais peut générer trafic via lien blog dédié                                          |
| 12   | isolation par l'extérieur    | 13 000 | 5   | `/services/isolation-thermique`                    | Doublon rank 3 — voir si page séparée dédiée ITE justifiée                                               |
| 13   | chauffe-eau thermodynamique  | 7 100  | 7   | `/cee/bar-th-148`                                  | ✅ Title rewrite livré                                                                                   |
| 14   | pergola solaire              | 5 900  | 1   | `/services/panneaux-solaires`                      | Ajouter H2 "Pergola solaire / bioclimatique"                                                             |
| 15   | ventilation                  | 4 300  | 4   | `/cee/bar-th-127`                                  | KW générique — ajouter intro hub "Guide ventilation maison 2026"                                         |
| 16   | chauffage solaire            | 3 200  | 7   | `/cee/bar-th-148` ou `/services/panneaux-solaires` | Page dédiée à créer (cluster chauffe-eau-solaire)                                                        |
| 17   | poêle à granulés             | 16 000 | 11  | `/cee/bar-th-112`                                  | ✅ Title rewrite livré                                                                                   |
| 18   | granulés de bois             | 13 000 | 8   | `/cee/bar-th-112`                                  | ✅ Title rewrite livré (couvert mapping BAR-TH-112)                                                      |
| 19   | isolation phonique           | 8 300  | 7   | ❌ pas de page                                     | Sprint F input                                                                                           |
| 20   | isolant thermique            | 8 200  | 1   | `/services/isolation-thermique`                    | Ajouter section H2 "Choisir son isolant" + comparatif (laine roche/verre/biosourcé)                      |

## Top 8 KW SANS page (priorisation Sprint F #8)

Ces KW imposent la création de nouveaux hubs. Inputs prioritaires pour Sprint F.

| Rank | KW                                 | Vol   | KD  | Cluster            | Recommandation route                                               |
| ---- | ---------------------------------- | ----- | --- | ------------------ | ------------------------------------------------------------------ |
| 1    | isolation phonique mur             | 3 500 | 0   | isolation-phonique | `/guides/isolation-phonique`                                       |
| 2    | prise renforcée voiture électrique | 2 900 | 1   | irve               | `/guides/borne-recharge-irve` ou pillar `/services/borne-recharge` |
| 3    | entreprise de rénovation           | 2 600 | 1   | travaux            | `/services/entreprise-renovation` ou hub `/renovation`             |
| 4    | isolant phonique mur               | 2 300 | 0   | isolation-phonique | identique #1                                                       |
| 5    | isolation phonique                 | 8 300 | 7   | isolation-phonique | identique #1                                                       |
| 6    | refaire isolation maison           | 2 500 | 1   | travaux            | section dans `/renovation-energetique`                             |
| 7    | refaire toiture                    | 2 100 | 1   | travaux            | `/services/couvreur` ou `/guides/refaire-toiture`                  |
| 8    | rénovation entreprise              | 1 700 | 1   | travaux            | identique #3                                                       |

**Total volume non capturé** : 26 300 vol/mois. Création de 2-3 nouveaux hubs (isolation-phonique, IRVE, entreprise-renovation) débloque ce volume.

## Actions immédiates Sprint C (1-2j)

Optimisation on-page sur 5 pages stratégiques (déjà existantes, juste enrichir) :

| Page                            | Sections H2 à ajouter                                                               | KW capturés           | Vol estimé |
| ------------------------------- | ----------------------------------------------------------------------------------- | --------------------- | ---------- |
| `/services/isolation-thermique` | "Isolation murs intérieurs" + "ITE" + "Choisir son isolant" + comparatif épaisseurs | 4 KW (rank 2/3/12/20) | 43 000     |
| `/services/pompe-a-chaleur`     | "Installation PAC étapes/délai" + tableau prix par marque                           | 3 KW (rank 4/7/9)     | 64 000     |
| `/cee/bar-th-148`               | H2 "Types de chauffe-eau (CET/solaire/électrique)" + comparatif                     | 2 KW (rank 5/13)      | 46 100     |
| `/cee/bar-th-127`               | "VMC simple vs double flux" + critères choix                                        | 2 KW (rank 6/15)      | 19 300     |
| `/services/chauffagiste`        | Intro "Guide chauffage 2026" + H2 PAC/Chaudière/Poêle                               | 1 KW (rank 10)        | 20 000     |

**Total capturable on-page Sprint C** : ~190 000 vol/mois (37% des 519K top 100).

## Suite Sprint F #8 — 4 pillars restants

Les 4 pillars manquants identifiés via cette analyse :

1. **Hub `/renovation`** (cluster travaux) — vol cumulé ~30K (entreprise-renovation, refaire-isolation, etc.)
2. **Hub `/guides/isolation-phonique`** — vol cumulé ~14K
3. **Pillar `/services/borne-recharge`** ou `/guides/irve` — vol cumulé ~17K
4. **Pillar `/cee` index enrichi** (déjà existant mais pauvre) — capture KW racine "cee", "certificats économies énergie" — ~5K

**Volume total Sprint F estimé** : ~66K vol/mois.

## Maintenance

- Re-pull Ahrefs `top_keywords_1000.json` par concurrent prévu **2026-05-18** (post reset cycle)
- Mesure delta couverture SA J+30 et J+60 sur top 20 KW
- Si après 3 mois le ratio "page existante non rankée top 20" reste >40% → revoir la qualité on-page (probablement contenu trop court ou mal structuré FS-bait)

## Re-run

```bash
npx tsx scripts/analyze-competitor-kw-gap.ts
# → idempotent, regenère kw_gap_attack_top100.csv + competitor_url_patterns.csv
```
