# Refdomains Overlap Attack Plan — Chantier #A (Sprint complément)

**Date** : 2026-05-03
**Source** : `refdomains_200.json` × 5 concurrents (effy, france_renov, hellio, selectra, sonergia)
**Méthode** : intersection des 200 plus gros refdomains de chaque concurrent → identifier les sites qui linkent déjà vers ≥2 acteurs du secteur rénovation énergétique = cibles outreach **chaudes** (preuve éditoriale qu'ils acceptent ces liens).

## Pourquoi cette analyse complète Action #10

Action #10 (50 cibles outreach 4 tiers) cible des sites identifiés via `outreach_targets_2026-05.csv` (DR + traffic + segment). **Ce chantier va plus loin** : il prouve que les cibles linkent déjà vers nos concurrents directs, donc :

1. **Probabilité de réponse plus haute** : ils ont déjà accepté un lien dans la verticale → on n'a pas à éduquer
2. **Pitch ready-made** : « Vous mentionnez Effy + Sonergia dans cet article — voici pourquoi ServicesArtisans complète l'angle data autorité (49K artisans RGE open-data, baromètre mensuel) »
3. **Asymétrie favorable** : si un site link 5/5 concurrents, il est éditorialement neutre — il publiera nous aussi

## Volume capturable

| Bucket                                                                                       | Domaines        |
| -------------------------------------------------------------------------------------------- | --------------- |
| Refdomains uniques après filtre (DR≥25 + traffic≥1K + dofollow≥1 + non-spam + non-générique) | 222             |
| **Linkant ≥2 concurrents** (Tier 2 warm minimum)                                             | **49**          |
| Linkant ≥3 concurrents (Tier 1+2 hot)                                                        | 13              |
| Linkant ≥4 concurrents (Tier 1 hot quasi-certain)                                            | 2               |
| Linkant les **5 concurrents** (gold standard)                                                | **1 — actu.fr** |
| Solo high-DR (DR≥40, 1 seul concurrent — cible exclusive)                                    | 173             |

## Top 13 cibles « hot » (≥3 concurrents)

| Rank | Domaine                | DR  | Traffic             | Concurrents linkés                                   | Pitch angle                                                                                       |
| ---- | ---------------------- | --- | ------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1    | **actu.fr**            | 87  | 2,1M                | 5/5 (effy, france_renov, hellio, selectra, sonergia) | **Gold standard** — angle local presse régionale (groupe Sipa/Ouest-France)                       |
| 2    | simplypsychology.org   | 85  | 1,8M                | 4/5                                                  | À écarter (off-topic — psychologie, lien probable parasite)                                       |
| 3    | **lemonde.fr**         | 91  | 7,4M                | 3/5 (effy, france_renov, selectra)                   | Tier 1 Press — pitch dataset RGE open-data + baromètre                                            |
| 4    | francetvinfo.fr        | 90  | (peu d'audience FR) | 3/5                                                  | Tier 1 Press TV — angle service public consommateurs                                              |
| 5    | **radiofrance.fr**     | 90  | 7,4M                | 3/5 (france_renov, hellio, selectra)                 | Tier 1 Audio — angle France Inter conso / La Quotidienne                                          |
| 6    | **leparisien.fr**      | 89  | 3,4M                | 3/5 (effy, france_renov, selectra)                   | Tier 1 Press — section éco / habitat                                                              |
| 7    | welcometothejungle.com | 86  | 486K                | 3/5                                                  | À écarter (off-topic — emploi)                                                                    |
| 8    | **ladepeche.fr**       | 86  | 2,6M                | 3/5 (effy, france_renov, selectra)                   | Presse régionale Sud-Ouest — angle local                                                          |
| 9    | avis-verifies.com      | 85  | 154K                | 3/5 (effy, hellio, sonergia)                         | Plateforme avis — partenariat à explorer (objectif : SA dispose déjà de Trustpilot, donc pivoter) |
| 10   | **latribune.fr**       | 84  | 307K                | 3/5 (effy, hellio, selectra)                         | Tier 1 Éco — angle data + marché RGE                                                              |
| 11   | **capital.fr**         | 84  | 502K                | 3/5 (effy, france_renov, hellio)                     | Tier 1 Éco — angle aides + ROI rénovation                                                         |
| 12   | **challenges.fr**      | 82  | 202K                | 3/5 (effy, france_renov, hellio)                     | Tier 1 Éco — angle dossier rénovation                                                             |
| 13   | **rtl.fr**             | 82  | 1,9M                | 3/5 (effy, france_renov, hellio)                     | Tier 1 Audio — angle conso / habitat                                                              |

→ **9 cibles utiles** (hors simplypsychology + welcometothejungle + avis-verifies = off-angle).

## Cibles institutionnelles repérées (Tier 3 dans Action #10)

| Domaine             | DR  | Concurrents linkés         | Statut                                   |
| ------------------- | --- | -------------------------- | ---------------------------------------- |
| ecologie.gouv.fr    | 90  | 2 (effy, france_renov)     | ✅ Déjà dans `outreach_targets` Tier 3   |
| theconversation.com | 91  | 2 (france_renov, selectra) | ✅ Déjà dans `outreach_targets` (Tier 1) |

## Solo high-DR (top 50, exclusivité)

173 domaines DR≥40 ne linkent qu'1 seul concurrent → **opportunité d'élargir le panel rénovation énergétique** : pitch « vous mentionnez X dans votre article, voici pourquoi ServicesArtisans complète l'angle ».

Top 5 solo high-DR (cf. `refdomains_solo_high_dr.csv` pour les 50) :

- À pitcher en Tier 2-3 selon angle éditorial (presse régionale, blog spécialisé, association consumériste, institutionnel mineur).

## Intégration avec Action #10 outreach

### Mise à jour V2 outreach (post-data.gouv.fr)

L'audit initial Action #10 listait 50 cibles via `outreach_targets_2026-05.csv`. Cette analyse **enrichit la priorisation** :

| Action | Quoi                                                                                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A1** | Croiser `refdomains_overlap_top100.csv` avec `outreach_targets_2026-05.csv` → identifier les cibles qui sont déjà dans Action #10 ET dans l'overlap = **double signal**, prioriser premier dans Lemlist |
| **A2** | Ajouter les 7 nouveaux domaines presse Tier 1 hot non-listés dans Action #10 : `actu.fr`, `radiofrance.fr`, `latribune.fr`, `capital.fr`, `challenges.fr`, `rtl.fr` (si pas déjà listés)                |
| **A3** | Pitch enrichi : « Vous citez {concurrent} dans cet article — voici un complément data exclusif (49K RGE open-data sur data.gouv.fr) qui complète l'angle »                                              |
| **A4** | Pour solo high-DR : campagne Lemlist V3 (post-V2) avec angle « élargissement panel » — ROI moindre mais volume conséquent                                                                               |

### Templates email enrichis

#### Tier 1 Press hot (overlap ≥3 concurrents)

**Subject** : `Data exclusive RGE en complément de votre article {concurrent}`

**Body** :

```
Bonjour {{firstName}},

J'ai vu que {{domain}} a récemment cité {{competitor}} dans un article sur la rénovation énergétique.

Pour compléter ce type d'angle, nous venons de publier sur data.gouv.fr l'annuaire complet des artisans RGE de France :
- 49 228 fiches actives (cumul ADEME + INSEE)
- Carto interactive géolocalisée
- Baromètre mensuel d'évolution du parc

Si une prochaine pige sur le sujet RGE / MaPrimeRénov / passoires thermiques mérite un complément data, nous pouvons préparer un brief sur-mesure (24h, format de votre choix).

Bien à vous,

Marvin Bissohong
Co-fondateur ServicesArtisans
```

KPIs cible : open ≥55%, reply ≥18%, backlink ≥4 sur 9 (44%).

## Re-run

```bash
npx tsx scripts/analyze-refdomains-overlap.ts
# → idempotent, regenère refdomains_overlap_top100.csv + refdomains_solo_high_dr.csv
```

## Maintenance

- Re-pull `refdomains_200.json` × 5 concurrents prévu **2026-08-03** (trimestriel, post-cycle Q3)
- Mesurer combien de cibles overlap obtenues comme backlinks SA à J+90 / J+180
- Si ratio reply hot lead ≥18% → étendre l'analyse aux refdomains_500 (au lieu de 200) sur quota Ahrefs
