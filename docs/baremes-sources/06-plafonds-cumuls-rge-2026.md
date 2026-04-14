# Plafonds de ressources, règles de cumul et RGE — 2026

> Source de vérité: arrêtés publiés au JORF + guides ANAH/France Rénov'. Ne jamais hardcoder ces valeurs sans date de dernière vérification. Révision annuelle au 1er janvier.

**Date d'établissement du document**: 2026-04-14
**Période de validité annoncée**: opérations engagées à partir du 1er janvier 2026
**Prochaine révision attendue**: 1er janvier 2027

---

## 1. Plafonds de ressources ANAH / MaPrimeRénov' 2026

Classification en 4 profils selon le Revenu Fiscal de Référence (RFR, année N-2 ou N-1 selon option la plus favorable):

| Profil | Libellé       | Couleur |
| ------ | ------------- | ------- |
| Bleu   | Très modeste  | #2563eb |
| Jaune  | Modeste       | #eab308 |
| Violet | Intermédiaire | #a855f7 |
| Rose   | Supérieur     | #ec4899 |

### 1.1 Île-de-France (plafonds majorés)

| Nb personnes     | Bleu (≤)   | Jaune (≤)  | Violet (≤) | Rose (>)   |
| ---------------- | ---------- | ---------- | ---------- | ---------- |
| 1                | 24 031 €   | 29 253 €   | 40 851 €   | > 40 851 € |
| 2                | À VÉRIFIER | À VÉRIFIER | À VÉRIFIER | —          |
| 3                | À VÉRIFIER | À VÉRIFIER | À VÉRIFIER | —          |
| 4                | À VÉRIFIER | À VÉRIFIER | À VÉRIFIER | —          |
| 5                | À VÉRIFIER | À VÉRIFIER | À VÉRIFIER | —          |
| Par pers. suppl. | + 5 151 €  | + 6 598 €  | + 9 357 €  | + 9 357 €  |

**Source CONFIRMÉE** (1 pers. + incréments): arrêté plafonds ANAH 2026; guide ANAH février 2026 (`anah.gouv.fr/sites/default/files/2026-03/202602_guide-aides-financieres_WEB.pdf`).

> Reconstituer les lignes 2-5 par addition depuis ligne 1 + incréments confirmés, puis valider contre le guide ANAH PDF avant mise en prod.

### 1.2 Hors Île-de-France et Outre-mer

| Nb personnes     | Bleu (≤)   | Jaune (≤)  | Violet (≤) | Rose (>)   |
| ---------------- | ---------- | ---------- | ---------- | ---------- |
| 1                | 17 363 €   | 22 259 €   | 31 185 €   | > 31 185 € |
| 2                | À VÉRIFIER | À VÉRIFIER | À VÉRIFIER | —          |
| 3                | À VÉRIFIER | À VÉRIFIER | À VÉRIFIER | —          |
| 4                | À VÉRIFIER | À VÉRIFIER | À VÉRIFIER | —          |
| 5                | À VÉRIFIER | À VÉRIFIER | À VÉRIFIER | —          |
| Par pers. suppl. | + 5 151 €  | + 6 598 €  | + 9 357 €  | + 9 357 €  |

**Source CONFIRMÉE** (1 pers. + incréments): guide ANAH 2026 édition février 2026.

**Évolution**: +1,105% vs. barème 2025.

---

## 2. Plafonds CEE précarité 2026

**Base légale**: Arrêté du 22 décembre 2025 portant actualisation des plafonds de revenus pour l'année 2026 dans le cadre du dispositif CEE — JORF 26 décembre 2025 (`legifrance.gouv.fr/jorf/id/JORFTEXT000053165580`).

### 2.1 Mapping officiel 2026 (réforme de dénomination)

| Nouvelle dénomination CEE 2026 | Équivalence ANAH    | Ancienne dénomination (pré-2026) |
| ------------------------------ | ------------------- | -------------------------------- |
| "Précarité énergétique"        | Très modeste (Bleu) | "Grande précarité"               |
| "Ménages modestes"             | Modeste (Jaune)     | "Précarité"                      |

**ATTENTION migration**: le seuil CEE précarité 2026 = ancien seuil "grande précarité". Code à auditer si existant pré-2026.

### 2.2 Plafonds confirmés (1 personne)

| Zone          | Précarité énergétique (≤) | Ménages modestes (≤) |
| ------------- | ------------------------- | -------------------- |
| Île-de-France | 24 031 €                  | 29 253 €             |
| Hors IdF      | 17 363 €                  | 22 259 €             |

> Les plafonds CEE 2026 sont **alignés** sur les plafonds ANAH MPR (Bleu et Jaune). Utiliser les mêmes tables. Vérifier néanmoins à chaque révision.

### 2.3 Conséquence opérationnelle

Seuls les ménages "en précarité énergétique" (ex-Bleu ANAH) peuvent prétendre aux CEE précarité bonifiés à partir de 2026. Les ex-"précaires" deviennent "ménages modestes" — CEE standard uniquement.

---

## 3. Règles de cumul — Matrice 2026

### 3.1 Matrice de compatibilité

| Aide A                             | Aide B                               | Cumulable | Condition / Règle                                                                                              |
| ---------------------------------- | ------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------- |
| MPR Parcours par geste (décarboné) | CEE standard                         | OUI       | CEE déduit de l'assiette éligible MPR; somme soumise à écrêtement                                              |
| MPR Parcours par geste             | Coup de pouce chauffage              | OUI mais  | Coup de pouce **remplace** le CEE standard (exclusion A/B). MPR calculé sur reste à charge après Coup de pouce |
| Coup de pouce                      | CEE standard même geste              | NON       | Exclusion mutuelle sur un même geste                                                                           |
| MPR Parcours Accompagné            | MPR par geste                        | NON       | Exclusion (dossier unique)                                                                                     |
| MPR Parcours Accompagné            | CEE                                  | OUI       | CEE déduit; écrêtement global appliqué                                                                         |
| MPR Parcours Accompagné            | Coup de pouce rénovation performante | OUI       | Selon modalités arrêté Coup de pouce en vigueur                                                                |
| MPR (tout parcours)                | Éco-PTZ                              | OUI       | Pas d'écrêtement par Éco-PTZ (prêt, pas subvention)                                                            |
| MPR (tout parcours)                | TVA 5,5%                             | OUI       | Auto: applicable par l'installateur RGE                                                                        |
| MPR (tout parcours)                | Aides locales (région/dépt/commune)  | OUI       | Comptées dans l'écrêtement global                                                                              |
| MPR (tout parcours)                | Chèque énergie                       | OUI       | Non considéré comme aide travaux ordinaire                                                                     |
| CEE                                | Éco-PTZ                              | OUI       | —                                                                                                              |
| CEE                                | Aides locales                        | OUI       | Selon règle locale (vérifier doublon)                                                                          |

### 3.2 Plafond d'écrêtement global MPR par geste (décarboné) — 2026

Plafond = aides cumulées (MPR + CEE + Coup de pouce + aides locales) / montant TTC travaux éligibles.

| Profil                 | Plafond cumul | Reste à charge min. |
| ---------------------- | ------------- | ------------------- |
| Bleu (très modeste)    | 90%           | 10%                 |
| Jaune (modeste)        | 75%           | 25%                 |
| Violet (intermédiaire) | 60%           | 40%                 |
| Rose (supérieur)       | 40%           | 60%                 |

> ⚠️ **Divergence de sources publiques**: certains sites (Hellio, Ithaque) annoncent respectivement 100%/90%/80%/50% pour le Parcours Accompagné, et 90%/75%/60%/40% pour le Parcours décarboné/par geste. **Confirmer contre l'arrêté MPR 2026 avant implémentation du simulateur**.

### 3.3 Plafond d'écrêtement Parcours Accompagné 2026

| Profil | Taux d'écrêtement (aides cumulées ≤ %TTC) |
| ------ | ----------------------------------------- |
| Bleu   | 100%                                      |
| Jaune  | 90%                                       |
| Violet | 80%                                       |
| Rose   | 50%                                       |

**Source**: Hellio FAQ écrêtement 2026, Ithaque. À confirmer sur arrêté.

### 3.4 Règle ultime

Aucune aide, en tout état de cause, ne peut faire dépasser **100% du TTC** travaux éligibles. L'administration ANAH applique l'écrêtement automatiquement lors de l'instruction.

---

## 4. Conditions RGE obligatoires

### 4.1 Règle générale

RGE **obligatoire** pour déclencher:

- MaPrimeRénov' (tous parcours)
- CEE (Fiches BAR, BAT, IND)
- Éco-PTZ (pour le volet travaux financés)
- TVA 5,5% (sauf auto-installation non-éligible)

**Base légale**: Arrêté du 1er décembre 2015 relatif aux critères de qualifications requis pour le bénéfice du CIDD, modifié — étendu aux autres aides.

### 4.2 Table des mentions RGE par geste

| Geste                              | Organisme  | Mention / Code                    | Notes                                  |
| ---------------------------------- | ---------- | --------------------------------- | -------------------------------------- |
| Isolation combles/toiture          | Qualibat   | 7141, 7142, 7143                  | Qualifications isolation thermique     |
| Isolation murs par extérieur (ITE) | Qualibat   | 7131, 7132                        | ITE                                    |
| Isolation murs par intérieur (ITI) | Qualibat   | 7141 / équivalent                 | —                                      |
| Isolation planchers bas            | Qualibat   | 7141                              | —                                      |
| Menuiseries extérieures (fenêtres) | Qualibat   | 3521, 3523, 3525                  | Selon matériau                         |
| PAC air/eau                        | Qualit'EnR | QualiPAC module Chauffage+ECS     |                                        |
| PAC géothermique / eau-eau         | Qualit'EnR | QualiPAC module Sondes / Capteurs |                                        |
| PAC air/air                        | Qualifelec | Mention RGE SFR PAC               | Vérifier code exact en prod            |
| Chauffe-eau thermodynamique        | Qualit'EnR | QualiPAC CET                      |                                        |
| Chaudière biomasse / poêle bois    | Qualit'EnR | Qualibois module Air / Eau        | Qualibois Eau = chaudière; Air = poêle |
| Solaire thermique (CESI/SSC)       | Qualit'EnR | QualiSol (CESI, Combi, Collectif) |                                        |
| Photovoltaïque                     | Qualit'EnR | QualiPV (module Élec, module Bât) |                                        |
| Ventilation VMC double flux        | Qualibat   | 5721                              | —                                      |
| Borne de recharge IRVE             | Qualifelec | Mention IRVE                      | Non-MPR mais aide spécifique ADVENIR   |

### 4.3 Validité des mentions RGE

- **Validité initiale**: 4 ans
- **Audits de chantier**: obligatoires (contrôle annuel ou bisannuel selon organisme)
- **Renouvellement**: sur dossier + vérification FAC (formation, assurance, chantiers réalisés)
- **Vérification en ligne**: `france-renov.gouv.fr/annuaire-rge`

**Source**: `france-renov.gouv.fr/recrutement/qualifications-rge`, arrêté du 1er décembre 2015 modifié.

---

## 5. Critères techniques opposables par geste (2026)

### 5.1 Pompes à chaleur

| Type PAC                       | Critère | Valeur minimale                                        |
| ------------------------------ | ------- | ------------------------------------------------------ |
| PAC air/eau — moyenne/haute T° | ETAS    | ≥ 126%                                                 |
| PAC air/eau — basse T°         | ETAS    | ≥ 111%                                                 |
| PAC eau/eau (géothermie)       | ETAS    | ≥ 126% (À VÉRIFIER arrêté 2026)                        |
| PAC air/air                    | SCOP    | ≥ 3,9 (classe A++ minimum — À VÉRIFIER)                |
| Chauffe-eau thermodynamique    | COP     | ≥ 2,5 (profil de soutirage M ou L — À VÉRIFIER arrêté) |

### 5.2 Isolation (R = résistance thermique m².K/W)

| Paroi                                          | R minimal |
| ---------------------------------------------- | --------- |
| Combles perdus                                 | ≥ 7,0     |
| Rampants de toiture / plafonds de combles      | ≥ 6,0     |
| Toitures-terrasses                             | ≥ 4,5     |
| Murs (intérieur ou extérieur)                  | ≥ 3,7     |
| Planchers bas sur sous-sol/vide sanitaire/ext. | ≥ 3,0     |

**⚠️ Note 2026**: L'isolation des murs est **exclue du Parcours par geste 2026** pour MPR. Elle reste éligible en Parcours Accompagné (rénovation d'ampleur ≥ 2 classes DPE) et en CEE.

### 5.3 Menuiseries extérieures

| Type                        | Critère | Valeur            |
| --------------------------- | ------- | ----------------- |
| Fenêtre / porte-fenêtre     | Uw      | ≤ 1,3 W/m².K      |
| Fenêtre / porte-fenêtre     | Sw      | ≥ 0,3             |
| Remplacement simple vitrage | Uw      | ≤ 1,3 et Sw ≥ 0,3 |

### 5.4 Chaudière biomasse / appareils bois

| Appareil                          | Rendement                            | Émissions CO     | Émissions particules (PM)      |
| --------------------------------- | ------------------------------------ | ---------------- | ------------------------------ |
| Chaudière bois (bûches, granulés) | ≥ 77% (manuel) / ≥ 87% (automatique) | ≤ 0,3% / ≤ 0,02% | Classe 5 EN 303-5              |
| Poêle à bûches                    | ≥ 70%                                | ≤ 0,12%          | Flamme Verte 7\* ou équivalent |
| Poêle à granulés                  | ≥ 87%                                | ≤ 0,02%          | Flamme Verte 7\*               |
| Insert / foyer fermé              | ≥ 70%                                | ≤ 0,12%          | Flamme Verte 7\*               |

> **Valeurs indicatives**. Toujours vérifier contre l'arrêté MPR en vigueur et la fiche CEE BAR-TH-112 (poêle) / BAR-TH-113 (chaudière biomasse) à jour 6e période.

### 5.5 Solaire thermique / photovoltaïque

| Dispositif                                   | Critère                                                       |
| -------------------------------------------- | ------------------------------------------------------------- |
| CESI (chauffe-eau solaire)                   | Capteurs certifiés CSTBat ou SolarKeymark                     |
| SSC (système solaire combiné)                | Idem + dimensionnement logement                               |
| Photovoltaïque (autoconso + revente surplus) | Modules certifiés IEC 61215 + IEC 61730; onduleur NF EN 50549 |

### 5.6 Ventilation

| Dispositif                    | Critère                                   |
| ----------------------------- | ----------------------------------------- |
| VMC simple flux hygroréglable | Type B hygro                              |
| VMC double flux               | Rendement ≥ 85% (à confirmer arrêté 2026) |

---

## 6. Sources officielles (à intégrer en footer simulateur)

| Thème                           | URL canonique                                                                               | Date consultation |
| ------------------------------- | ------------------------------------------------------------------------------------------- | ----------------- |
| Arrêté CEE plafonds 2026        | https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053165580                                 | 2026-04-14        |
| Guide ANAH 2026 (PDF officiel)  | https://www.anah.gouv.fr/sites/default/files/2026-03/202602_guide-aides-financieres_WEB.pdf | 2026-04-14        |
| Barème France Rénov'            | https://france-renov.gouv.fr/bareme                                                         | 2026-04-14        |
| Qualifications RGE              | https://france-renov.gouv.fr/recrutement/qualifications-rge                                 | 2026-04-14        |
| Annuaire RGE                    | https://france-renov.gouv.fr/annuaire-rge                                                   | 2026-04-14        |
| Qualibat                        | https://www.qualibat.com                                                                    | 2026-04-14        |
| Qualit'EnR                      | https://www.qualit-enr.org                                                                  | 2026-04-14        |
| Qualifelec                      | https://www.qualifelec.fr                                                                   | 2026-04-14        |
| Service Public MPR              | https://www.service-public.gouv.fr/particuliers/vosdroits/F35083                            | 2026-04-14        |
| AIDA / INERIS (arrêtés énergie) | https://aida.ineris.fr                                                                      | 2026-04-14        |

---

## 7. Checklist pré-implémentation simulateur

- [ ] **Télécharger le PDF ANAH 2026** (`202602_guide-aides-financieres_WEB.pdf`) et extraire les tableaux complets 2-5 personnes IdF et hors IdF
- [ ] **Télécharger l'arrêté CEE 22 déc 2025** depuis Légifrance (PDF signé) et archiver dans `docs/baremes-sources/legifrance/`
- [ ] **Télécharger l'arrêté MPR 2026** — valider les taux d'écrêtement 3.2/3.3
- [ ] **Confirmer les critères techniques** (§5) contre l'arrêté MPR 2026 + fiches CEE 6e période à jour
- [ ] **Stocker les barèmes en base** avec ID stable + `effective_from` + `effective_to` (traçabilité <30s)
- [ ] **Test unitaire du calculateur** avec au moins 1 cas par profil × zone × type de geste
- [ ] **Footer légal** sur le simulateur: "Montants indicatifs au [date]. Seule la décision ANAH fait foi."

---

## 8. Risques identifiés

1. **Plafonds 2-5 personnes non confirmés par source primaire**. Bloquant avant mise en prod.
2. **Divergence sources secondaires sur écrêtement** (100/90/80/50 vs 90/75/60/40). Arrêté MPR 2026 doit trancher.
3. **Réforme dénomination CEE 2026** (ex-"grande précarité" → "précarité énergétique"). Auditer tout code legacy.
4. **Isolation murs exclue Parcours par geste 2026**. Vérifier que le simulateur redirige vers Parcours Accompagné dans ce cas.
5. **Validité des RGE des artisans** — intégration avec base ADEME RGE déjà en place (cf. `servicesartisans-rge-integration`). Vérifier fraîcheur à chaque simulation.

---

_Document établi le 2026-04-14. À re-vérifier au 1er janvier 2027 et à chaque publication d'arrêté MPR/CEE entre-temps._
