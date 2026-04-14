# Barèmes MaPrimeRénov' 2026 — Sources officielles

**Date de compilation**: 2026-04-14
**Opposabilité**: document destiné à alimenter le simulateur `/simulateur-aides-renovation`. Chaque ligne est sourcée. Les zones ⚠️ nécessitent vérification complémentaire sur arrêté publié au JO avant mise en production.

## 1. Cadre réglementaire

### Textes de base (Légifrance)

| Texte                     | Date                 | Objet                                                    | URL                                                         |
| ------------------------- | -------------------- | -------------------------------------------------------- | ----------------------------------------------------------- |
| Décret n° 2020-26         | 14 janvier 2020      | Création prime de transition énergétique (MaPrimeRénov') | https://www.legifrance.gouv.fr/loda/id/LEGITEXT000041414918 |
| Arrêté du 14 janvier 2020 | 14 janv. 2020        | Modalités, plafonds, forfaits                            | https://www.legifrance.gouv.fr/loda/id/LEGITEXT000041415098 |
| Arrêté du 4 décembre 2024 | JO 13 déc. 2024      | Modification de l'arrêté du 14 janvier 2020              | https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000050731904 |
| **Décret n° 2025-956**    | **8 septembre 2025** | **Modifications MPR applicables au 1er janvier 2026**    | https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052212707 |

### Changements clés au 1er janvier 2026 (décret 2025-956)

- Parcours par geste: **isolation des murs (ITE/ITI) et chaudières biomasse SUPPRIMÉES** des dépenses éligibles.
- Parcours accompagné: recentré sur logements classés **E à G** avant travaux.
- Bonus "sortie de passoire énergétique" **supprimé** (nouveaux dossiers déposés ≥ 30 sept. 2025).
- Parcours par geste maintenu pour maisons individuelles classées **F et G** (métropole) jusqu'au **31 décembre 2026** (dérogation).
- Obligation de geste de chauffage levée jusqu'au 31 décembre 2026.
- Dépôts rouverts depuis le **23 février 2026** pour tous profils.

**Source**: https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052212707 (JO 10 sept. 2025)
**Commentaire officiel**: https://www.economie.gouv.fr/particuliers/faire-des-economies-denergie/maprimerenov-parcours-par-geste-la-prime-pour-la-renovation-energetique

---

## 2. Plafonds de ressources 2026 (Revenu Fiscal de Référence)

Base: avis d'imposition 2025 (revenus 2024).

### 2.1 Hors Île-de-France et Outre-mer

| Nombre de personnes  | Bleu (Très modeste) | Jaune (Modeste) | Violet (Intermédiaire) | Rose (Supérieur) |
| -------------------- | ------------------- | --------------- | ---------------------- | ---------------- |
| 1                    | ≤ 17 363 €          | ≤ 22 259 €      | ≤ 31 185 €             | > 31 185 €       |
| 2                    | ≤ 25 393 €          | ≤ 32 553 €      | ≤ 45 842 €             | > 45 842 €       |
| 3                    | ≤ 30 540 €          | ≤ 39 148 €      | ≤ 55 196 €             | > 55 196 €       |
| 4                    | ≤ 35 676 €          | ≤ 45 735 €      | ≤ 64 550 €             | > 64 550 €       |
| 5                    | ≤ 40 835 €          | ≤ 52 348 €      | ≤ 73 907 €             | > 73 907 €       |
| Pers. supplémentaire | + 5 151 €           | + 6 598 €       | + 9 357 €              | + 9 357 €        |

**Source**: https://www.service-public.gouv.fr/particuliers/vosdroits/F35083
**Guide ANAH 2026**: https://www.anah.gouv.fr/sites/default/files/2026-03/202602_guide-aides-financieres_WEB.pdf
**Bulletin officiel circulaire**: https://www.bulletin-officiel.developpement-durable.gouv.fr/documents/Bulletinofficiel-0034327/VLOL2534404C.pdf

### 2.2 Île-de-France

| Nombre de personnes | Bleu                 | Jaune      | Violet     | Rose       |
| ------------------- | -------------------- | ---------- | ---------- | ---------- |
| 1                   | ≤ 24 031 €           | ≤ 29 253 € | ≤ 40 851 € | > 40 851 € |
| 2                   | ⚠️ À vérifier arrêté | ⚠️         | ⚠️         | ⚠️         |
| 3                   | ⚠️ À vérifier arrêté | ⚠️         | ⚠️         | ⚠️         |
| 4                   | ⚠️ À vérifier arrêté | ⚠️         | ⚠️         | ⚠️         |
| 5                   | ⚠️ À vérifier arrêté | ⚠️         | ⚠️         | ⚠️         |
| Pers. suppl.        | ⚠️                   | ⚠️         | ⚠️         | ⚠️         |

⚠️ **CRITIQUE — Plafonds IdF 2+ personnes**: source officielle non retrouvée via recherche (seul le foyer 1 personne confirmé). AVANT mise en production, consulter la circulaire ANAH 2026 (PDF) et/ou l'annexe de l'arrêté du 14 janvier 2020 dans sa version consolidée au 1er janvier 2026 sur Légifrance. Ne PAS utiliser de valeurs de sites tiers (Effy, Hellio, etc.) comme référence opposable.

---

## 3. Barèmes Parcours par geste 2026

### 3.1 Table complète par geste × tranche de revenus

**Convention ID stable**: `MPR.<GESTE>.<TRANCHE>.2026-01`

| ID stable                               | Geste                                           | Tranche      | Montant €                                                                                   | Plafond dépense éligible | Source                                           | Date applicabilité | Expiration |
| --------------------------------------- | ----------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------ | ------------------ | ---------- |
| MPR.PAC_AIREAU.BLEU.2026-01             | PAC air/eau                                     | Bleu         | 5 000 €                                                                                     | —                        | economie.gouv.fr ; service-public.gouv.fr F35083 | 2026-01-01         | 2026-12-31 |
| MPR.PAC_AIREAU.JAUNE.2026-01            | PAC air/eau                                     | Jaune        | 4 000 €                                                                                     | —                        | economie.gouv.fr                                 | 2026-01-01         | 2026-12-31 |
| MPR.PAC_AIREAU.VIOLET.2026-01           | PAC air/eau                                     | Violet       | 3 000 €                                                                                     | —                        | economie.gouv.fr                                 | 2026-01-01         | 2026-12-31 |
| MPR.PAC_AIREAU.ROSE.2026-01             | PAC air/eau                                     | Rose         | **Non éligible** (parcours par geste)                                                       | —                        | Décret 2025-956                                  | 2026-01-01         | 2026-12-31 |
| MPR.PAC_GEOTHERMIE.BLEU.2026-01         | PAC géothermique / eau-eau / solarothermique    | Bleu         | 11 000 €                                                                                    | —                        | economie.gouv.fr ; Effy                          | 2026-01-01         | 2026-12-31 |
| MPR.PAC_GEOTHERMIE.JAUNE.2026-01        | PAC géothermique                                | Jaune        | 9 000 €                                                                                     | —                        | economie.gouv.fr                                 | 2026-01-01         | 2026-12-31 |
| MPR.PAC_GEOTHERMIE.VIOLET.2026-01       | PAC géothermique                                | Violet       | 6 000 €                                                                                     | —                        | economie.gouv.fr                                 | 2026-01-01         | 2026-12-31 |
| MPR.PAC_GEOTHERMIE.ROSE.2026-01         | PAC géothermique                                | Rose         | Non éligible                                                                                | —                        | —                                                | 2026-01-01         | 2026-12-31 |
| MPR.CET.BLEU.2026-01                    | Chauffe-eau thermodynamique (CET)               | Bleu         | 1 200 €                                                                                     | —                        | economie.gouv.fr                                 | 2026-01-01         | 2026-12-31 |
| MPR.CET.JAUNE.2026-01                   | CET                                             | Jaune        | 800 €                                                                                       | —                        | economie.gouv.fr                                 | 2026-01-01         | 2026-12-31 |
| MPR.CET.VIOLET.2026-01                  | CET                                             | Violet       | 400 €                                                                                       | —                        | economie.gouv.fr                                 | 2026-01-01         | 2026-12-31 |
| MPR.CET.ROSE.2026-01                    | CET                                             | Rose         | Non éligible                                                                                | —                        | —                                                | 2026-01-01         | 2026-12-31 |
| MPR.CESI.BLEU.2026-01                   | Chauffe-eau solaire individuel (CESI)           | Bleu         | 4 000 € ⚠️                                                                                  | —                        | Qualit'EnR ; Hellio (à confirmer arrêté)         | 2026-01-01         | 2026-12-31 |
| MPR.CESI.JAUNE.2026-01                  | CESI                                            | Jaune        | 3 000 €                                                                                     | —                        | lesfurets ; Effy                                 | 2026-01-01         | 2026-12-31 |
| MPR.CESI.VIOLET.2026-01                 | CESI                                            | Violet       | 2 000 € ⚠️                                                                                  | —                        | tiers (à confirmer arrêté)                       | 2026-01-01         | 2026-12-31 |
| MPR.CESI.ROSE.2026-01                   | CESI                                            | Rose         | Non éligible                                                                                | —                        | —                                                | 2026-01-01         | 2026-12-31 |
| MPR.POELE_GRANULES.BLEU.2026-01         | Poêle à granulés / cuisinière granulés          | Bleu         | 1 250 €                                                                                     | —                        | economie.gouv.fr ; Effy                          | 2026-01-01         | 2026-12-31 |
| MPR.POELE_GRANULES.JAUNE.2026-01        | Poêle à granulés                                | Jaune        | 1 000 €                                                                                     | —                        | economie.gouv.fr                                 | 2026-01-01         | 2026-12-31 |
| MPR.POELE_GRANULES.VIOLET.2026-01       | Poêle à granulés                                | Violet       | 750 €                                                                                       | —                        | economie.gouv.fr                                 | 2026-01-01         | 2026-12-31 |
| MPR.POELE_GRANULES.ROSE.2026-01         | Poêle à granulés                                | Rose         | Non éligible                                                                                | —                        | —                                                | 2026-01-01         | 2026-12-31 |
| MPR.POELE_BUCHES.BLEU.2026-01           | Poêle à bûches / cuisinière bûches              | Bleu         | 1 000 € ⚠️                                                                                  | —                        | sources tierces (à confirmer arrêté)             | 2026-01-01         | 2026-12-31 |
| MPR.POELE_BUCHES.JAUNE.2026-01          | Poêle à bûches                                  | Jaune        | 800 € ⚠️                                                                                    | —                        | sources tierces                                  | 2026-01-01         | 2026-12-31 |
| MPR.POELE_BUCHES.VIOLET.2026-01         | Poêle à bûches                                  | Violet       | 500 € ⚠️                                                                                    | —                        | sources tierces                                  | 2026-01-01         | 2026-12-31 |
| MPR.POELE_BUCHES.ROSE.2026-01           | Poêle à bûches                                  | Rose         | Non éligible                                                                                | —                        | —                                                | 2026-01-01         | 2026-12-31 |
| MPR.CHAUDIERE_BOIS.TOUS.2026-01         | Chaudière bois (granulés ou bûches)             | Tous profils | **SUPPRIMÉE du parcours par geste au 01/01/2026** — éligible uniquement Parcours accompagné | —                        | Décret 2025-956 ; economie.gouv.fr               | 2026-01-01         | —          |
| MPR.ITE.TOUS.2026-01                    | Isolation murs par l'extérieur (ITE)            | Tous profils | **SUPPRIMÉE du parcours par geste au 01/01/2026** — éligible uniquement Parcours accompagné | —                        | Décret 2025-956                                  | 2026-01-01         | —          |
| MPR.ITI.TOUS.2026-01                    | Isolation murs par l'intérieur (ITI)            | Tous profils | **SUPPRIMÉE du parcours par geste au 01/01/2026** — éligible uniquement Parcours accompagné | —                        | Décret 2025-956                                  | 2026-01-01         | —          |
| MPR.ISO_TOITURE_RAMPANTS.BLEU.2026-01   | Isolation toiture (rampants / combles aménagés) | Bleu         | 25 €/m² ⚠️                                                                                  | 75 €/m²                  | kazamea ; Hellio (à confirmer arrêté)            | 2026-01-01         | 2026-12-31 |
| MPR.ISO_TOITURE_RAMPANTS.JAUNE.2026-01  | Isolation toiture rampants                      | Jaune        | 20 €/m² ⚠️                                                                                  | 75 €/m²                  | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.ISO_TOITURE_RAMPANTS.VIOLET.2026-01 | Isolation toiture rampants                      | Violet       | 15 €/m² ⚠️                                                                                  | 75 €/m²                  | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.ISO_TOITURE_RAMPANTS.ROSE.2026-01   | Isolation toiture rampants                      | Rose         | 7 €/m² ⚠️                                                                                   | 75 €/m²                  | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.ISO_TOITURE_TERRASSE.BLEU.2026-01   | Isolation toiture terrasse                      | Bleu         | 75 €/m² ⚠️                                                                                  | 180 €/m²                 | Hellio (à confirmer arrêté)                      | 2026-01-01         | 2026-12-31 |
| MPR.ISO_TOITURE_TERRASSE.JAUNE.2026-01  | Isolation toiture terrasse                      | Jaune        | 60 €/m² ⚠️                                                                                  | 180 €/m²                 | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.ISO_TOITURE_TERRASSE.VIOLET.2026-01 | Isolation toiture terrasse                      | Violet       | 40 €/m² ⚠️                                                                                  | 180 €/m²                 | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.ISO_TOITURE_TERRASSE.ROSE.2026-01   | Isolation toiture terrasse                      | Rose         | 15 €/m² ⚠️                                                                                  | 180 €/m²                 | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.ISO_PLANCHERS_BAS.BLEU.2026-01      | Isolation planchers bas                         | Bleu         | 15 €/m²                                                                                     | —                        | sources tierces ; Hellio                         | 2026-01-01         | 2026-12-31 |
| MPR.ISO_PLANCHERS_BAS.JAUNE.2026-01     | Isolation planchers bas                         | Jaune        | 10 €/m² ⚠️                                                                                  | —                        | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.ISO_PLANCHERS_BAS.VIOLET.2026-01    | Isolation planchers bas                         | Violet       | 5 €/m²                                                                                      | —                        | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.ISO_PLANCHERS_BAS.ROSE.2026-01      | Isolation planchers bas                         | Rose         | Non éligible ⚠️                                                                             | —                        | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.VMC_2FLUX.BLEU.2026-01              | VMC double flux                                 | Bleu         | 2 500 €                                                                                     | —                        | Hellio ; kazamea                                 | 2026-01-01         | 2026-12-31 |
| MPR.VMC_2FLUX.JAUNE.2026-01             | VMC double flux                                 | Jaune        | 2 000 €                                                                                     | —                        | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.VMC_2FLUX.VIOLET.2026-01            | VMC double flux                                 | Violet       | 1 500 €                                                                                     | —                        | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.VMC_2FLUX.ROSE.2026-01              | VMC double flux                                 | Rose         | Non éligible                                                                                | —                        | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.AUDIT_ENERGETIQUE.BLEU.2026-01      | Audit énergétique incitatif                     | Bleu         | 500 €                                                                                       | —                        | Hellio ; laprimeenergie                          | 2026-01-01         | 2026-12-31 |
| MPR.AUDIT_ENERGETIQUE.JAUNE.2026-01     | Audit énergétique                               | Jaune        | 400 €                                                                                       | —                        | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.AUDIT_ENERGETIQUE.VIOLET.2026-01    | Audit énergétique                               | Violet       | 300 €                                                                                       | —                        | idem                                             | 2026-01-01         | 2026-12-31 |
| MPR.AUDIT_ENERGETIQUE.ROSE.2026-01      | Audit énergétique                               | Rose         | Non éligible                                                                                | —                        | idem                                             | 2026-01-01         | 2026-12-31 |

⚠️ **Toutes les lignes avec ⚠️ doivent être vérifiées contre l'arrêté du 14 janvier 2020 dans sa version consolidée au 1er janvier 2026** (Légifrance: https://www.legifrance.gouv.fr/loda/id/LEGITEXT000041415098) AVANT usage contractuel ou affichage public opposable. Les valeurs proposées viennent de sites tiers (Hellio, Effy, Qualit'EnR, kazamea) qui reprennent habituellement l'arrêté mais ne constituent pas une source primaire.

### 3.2 Plafonds transverses parcours par geste

- Plafond global parcours par geste: **20 000 € de MaPrimeRénov' sur 5 ans glissants** par logement (à reconfirmer arrêté 2026).
- Écrêtement (cumul MPR + CEE + autres aides publiques) plafonné à un pourcentage du montant TTC des travaux (voir §5).

---

## 4. Parcours Accompagné (Rénovation d'ampleur) 2026

### 4.1 Plafonds de dépense éligible

| Gain DPE       | Plafond 2025 | Plafond 2026          |
| -------------- | ------------ | --------------------- |
| 2 classes      | 40 000 €     | **30 000 €**          |
| 3 classes      | 55 000 €     | **40 000 €**          |
| 4 classes et + | 70 000 € ⚠️  | ⚠️ à confirmer arrêté |

**Source**: https://www.economie.gouv.fr/particuliers/faire-des-economies-denergie/maprimerenov-renovation-dampleur-tout-savoir-sur-cette-aide ; Décret 2025-956

### 4.2 Taux de subvention par tranche (2026)

| Profil                 | Taux 2025                           | Taux 2026                     |
| ---------------------- | ----------------------------------- | ----------------------------- |
| Bleu (Très modeste)    | 80%                                 | **80%**                       |
| Jaune (Modeste)        | 60%                                 | **60%**                       |
| Violet (Intermédiaire) | 45% ⚠️ (presse évoque baisse à 45%) | **45%** ⚠️ à confirmer arrêté |
| Rose (Supérieur)       | 20% → 10%                           | **10%** ⚠️ à confirmer arrêté |

⚠️ **Contradiction sources**: certaines sources (CAPEB, ecair.eco) évoquent un maintien à 60%/40% et d'autres une baisse à 45%/10%. Vérifier la délibération CA ANAH et l'arrêté modificatif publié au JO 2026. Priorité: Légifrance.

### 4.3 Conditions

- Logement résidence principale construit **≥ 15 ans**.
- Classe DPE avant travaux **E, F ou G** (recentrage décret 2025-956).
- Accompagnement obligatoire par un **Mon Accompagnateur Rénov'** agréé.
- Gain minimum: **2 classes DPE**.
- Au moins **2 gestes d'isolation** parmi murs, toitures, planchers bas, menuiseries.
- Bonus "sortie de passoire" (F/G → D ou mieux): **SUPPRIMÉ pour dossiers ≥ 30 sept. 2025**.
- Bonus BBC (atteinte classe A ou B): **10%** du plafond de dépense ⚠️ à confirmer arrêté 2026.

---

## 5. Écrêtement 2026 (plafond cumul aides publiques)

Le total MPR + CEE + aides publiques ne peut excéder un % du coût TTC des travaux:

| Profil                 | Taux d'écrêtement 2026                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Bleu (Très modeste)    | **100%** (travaux entièrement subventionnables)                                             |
| Jaune (Modeste)        | **80%** ⚠️ (source lagazettedescommunes évoque 90%)                                         |
| Violet (Intermédiaire) | **80%** ⚠️ (contradiction: certaines sources 60% → 80% en 2024, d'autres 80% confirmé 2026) |
| Rose (Supérieur)       | **50%** ⚠️ (ex-40%)                                                                         |

⚠️ **CRITIQUE**: les chiffres d'écrêtement font l'objet de fortes contradictions dans la presse. **Ne pas mettre en production sans lecture directe de l'article 15 du décret 2020-26 dans sa version consolidée 1er janvier 2026** (Légifrance).

---

## 6. Conditions transverses (tous gestes)

### 6.1 Éligibilité du logement

- Résidence principale (occupation ≥ 8 mois/an).
- Construit **≥ 15 ans** à la date de demande (règle durcie — avant: 2 ans pour certains travaux chauffage).
- Logement situé en France métropolitaine ou DOM.
- Propriétaire occupant, bailleur (sous conditions), ou usufruitier.

### 6.2 Professionnel RGE obligatoire

- Toute prestation doit être réalisée par une entreprise titulaire d'une qualification **RGE (Reconnu Garant de l'Environnement)** correspondant au geste posé.
- Annuaire officiel: https://france-renov.gouv.fr/annuaire-rge

### 6.3 Délais

- Dépôt du dossier en ligne sur https://www.maprimerenov.gouv.fr **avant le début des travaux** (sauf exceptions).
- Engagement de réalisation: **2 ans** après acceptation.

### 6.4 Cumul autorisé

- CEE (Coup de pouce Chauffage, Isolation).
- Éco-PTZ.
- TVA réduite à 5,5%.
- Aides locales.
- Chèque énergie.

---

## 7. Bonus 2026

| Bonus                                 | Montant                      | Conditions          | Statut 2026                   |
| ------------------------------------- | ---------------------------- | ------------------- | ----------------------------- |
| Sortie de passoire (F/G → E ou mieux) | 10% du plafond de dépense    | Parcours accompagné | **SUPPRIMÉ** au 30 sept. 2025 |
| BBC (atteinte A ou B après travaux)   | 10% du plafond de dépense ⚠️ | Parcours accompagné | ⚠️ À confirmer arrêté 2026    |

---

## 8. Sources — Index

### Sources primaires (opposables)

1. **Légifrance — Décret 2020-26 du 14 janvier 2020 consolidé**: https://www.legifrance.gouv.fr/loda/id/LEGITEXT000041414918
2. **Légifrance — Arrêté du 14 janvier 2020 consolidé**: https://www.legifrance.gouv.fr/loda/id/LEGITEXT000041415098
3. **Légifrance — Décret 2025-956 du 8 septembre 2025**: https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052212707
4. **Légifrance — Arrêté du 4 décembre 2024**: https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000050731904
5. **ANAH — Guide des aides financières édition février 2026 (PDF)**: https://www.anah.gouv.fr/sites/default/files/2026-03/202602_guide-aides-financieres_WEB.pdf
6. **Bulletin officiel — Circulaire plafonds ressources 2026**: https://www.bulletin-officiel.developpement-durable.gouv.fr/documents/Bulletinofficiel-0034327/VLOL2534404C.pdf

### Sources secondaires (administration)

7. **Service-Public.fr — MaPrimeRénov'**: https://www.service-public.gouv.fr/particuliers/vosdroits/F35083
8. **Economie.gouv.fr — MPR Parcours par geste**: https://www.economie.gouv.fr/particuliers/faire-des-economies-denergie/maprimerenov-parcours-par-geste-la-prime-pour-la-renovation-energetique
9. **Economie.gouv.fr — MPR Rénovation d'ampleur**: https://www.economie.gouv.fr/particuliers/faire-des-economies-denergie/maprimerenov-renovation-dampleur-tout-savoir-sur-cette-aide
10. **ANIL — Parcours accompagné**: https://www.anil.org/aj-maprimerenov-parcours-accompagne/
11. **France Rénov' — Annuaire RGE**: https://france-renov.gouv.fr/annuaire-rge

---

## 9. Checklist de validation avant mise en production

- [ ] Lire l'arrêté du 14 janvier 2020 consolidé au 1er janvier 2026 sur Légifrance (annexe tarifs)
- [ ] Extraire les plafonds IdF 2-5 personnes depuis guide ANAH PDF officiel (§2.2)
- [ ] Résoudre contradiction écrêtement Jaune/Violet (§5)
- [ ] Confirmer taux Parcours accompagné Violet (45% vs 60%) et Rose (10% vs 40%)
- [ ] Confirmer bonus BBC 10% maintenu en 2026
- [ ] Confirmer tous les montants marqués ⚠️ en §3.1
- [ ] Vérifier plafond cumulé parcours par geste sur 5 ans (20 000 € ?)
- [ ] Traçabilité: chaque montant du simulateur doit exposer son ID stable et lien vers arrêté

---

_Fin du document `01-maprimerenov-2026.md`_
