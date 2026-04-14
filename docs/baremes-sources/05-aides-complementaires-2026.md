# Aides complémentaires rénovation énergétique 2026

**Version**: 1.0.0
**Date validité**: 2026-04-14
**Scope**: aides hors MPR/CEE (déjà documentés ailleurs)
**Principe**: aides nationales = montants certifiés. Aides régionales = ⚠️ vérifier site région (très volatiles).

---

## 1. Éco-PTZ (Éco-Prêt à Taux Zéro)

**Base légale**: Article 244 quater U CGI — prorogé jusqu'au 31/12/2027 par loi de finances 2024 (art. 71).
**Décret d'application**: Décret n° 2024-299 du 29 mars 2024.

| ID stable                                      | Cas                                                            | Plafond             | Durée max remboursement | Source                                                                                               |
| ---------------------------------------------- | -------------------------------------------------------------- | ------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `ecoptz.action_seule.isolation_parois_vitrees` | Action seule — isolation parois vitrées                        | 7 000 €             | 15 ans                  | [Légifrance art. 244 quater U](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023380703) |
| `ecoptz.action_seule.autres`                   | Action seule — autres travaux (1 catégorie)                    | 15 000 €            | 15 ans                  | idem                                                                                                 |
| `ecoptz.bouquet.2_actions`                     | Bouquet — 2 catégories de travaux                              | 25 000 €            | 15 ans                  | idem                                                                                                 |
| `ecoptz.bouquet.3_actions`                     | Bouquet — 3 catégories ou plus                                 | 30 000 €            | 15 ans                  | idem                                                                                                 |
| `ecoptz.performance_globale`                   | Performance énergétique globale (audit + gain ≥ 2 classes DPE) | 50 000 €            | 20 ans                  | idem                                                                                                 |
| `ecoptz.copropriete`                           | Copropriété — parties communes (gain ≥ 35 %)                   | 50 000 € / logement | 20 ans                  | [BOFiP BOI-BIC-RICI-10-110](https://bofip.impots.gouv.fr/bofip/6464-PGP.html)                        |

**Conditions générales**:

- Logement achevé depuis > 2 ans
- Résidence principale (propriétaire occupant, bailleur, ou SCI)
- Travaux obligatoirement réalisés par artisans RGE
- Éco-PTZ complémentaire possible quelle que soit la nature des travaux initialement financés

**Cumul MPR/CEE**: ✅ OUI, cumulable intégralement avec MaPrimeRénov' et CEE.

---

## 2. TVA à taux réduit 5,5 %

**Base légale**: Article 278-0 bis A CGI.
**Arrêté liste éligibles**: [Arrêté du 4 décembre 2024](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000050823106) relatif à la nature des prestations de rénovation énergétique.
**Doctrine**: [BOFiP BOI-TVA-LIQ-30-20-95](https://bofip.impots.gouv.fr/bofip/9417-PGP.html/identifiant=BOI-TVA-LIQ-30-20-95-20251022).

| ID stable                          | Type de travaux                                                             | Taux  |
| ---------------------------------- | --------------------------------------------------------------------------- | ----- |
| `tva.5_5.isolation_murs`           | Isolation thermique des murs                                                | 5,5 % |
| `tva.5_5.isolation_combles`        | Isolation des combles et toitures                                           | 5,5 % |
| `tva.5_5.isolation_planchers`      | Isolation des planchers bas                                                 | 5,5 % |
| `tva.5_5.isolation_parois_vitrees` | Remplacement fenêtres / parois vitrées performantes                         | 5,5 % |
| `tva.5_5.pac_air_eau`              | Pompe à chaleur air/eau                                                     | 5,5 % |
| `tva.5_5.pac_geothermique`         | Pompe à chaleur géothermique                                                | 5,5 % |
| `tva.5_5.chaudiere_biomasse`       | Chaudière biomasse / poêle à bois                                           | 5,5 % |
| `tva.5_5.solaire_thermique`        | Chauffe-eau solaire thermique                                               | 5,5 % |
| `tva.5_5.cet`                      | Chauffe-eau thermodynamique                                                 | 5,5 % |
| `tva.5_5.vmc_double_flux`          | VMC double flux                                                             | 5,5 % |
| `tva.5_5.raccordement_rcu`         | Raccordement réseau chaleur urbain                                          | 5,5 % |
| `tva.5_5.borne_irve`               | Borne de recharge véhicule électrique                                       | 5,5 % |
| `tva.5_5.travaux_induits`          | Travaux induits indissociables (plâtrerie, peinture sur paroi isolée, etc.) | 5,5 % |

**Exclusions 5,5 %** (relèvent de 10 % ou 20 %):

- Plaques à induction (hors performance énergétique)
- VMC simple flux (non éligible 5,5 %)
- Panneaux photovoltaïques → 10 % (puissance ≤ 3 kWc) ou 20 %
- **Chaudières à combustibles fossiles** (gaz, fioul) → taux normal 20 % depuis 01/03/2025

**Conditions**:

- Logement achevé depuis > 2 ans à la date de début des travaux
- Logement à usage d'habitation (principale ou secondaire)
- Facture établie par un artisan qui fournit ET pose les matériaux (pas d'auto-fourniture)
- Attestation simplifiée signée par le client à remettre à l'artisan

**Cumul MPR/CEE**: ✅ OUI, TVA réduite appliquée sur la facture indépendamment des autres aides.

---

## 3. TVA à 10 % (rénovation classique)

**Base légale**: Article 279-0 bis CGI.

| ID stable                             | Champ d'application                                               | Taux |
| ------------------------------------- | ----------------------------------------------------------------- | ---- |
| `tva.10.entretien`                    | Entretien et réparation (plomberie, électricité hors performance) | 10 % |
| `tva.10.amelioration_non_energetique` | Amélioration, transformation, aménagement                         | 10 % |
| `tva.10.photovoltaique_3kwc`          | Photovoltaïque ≤ 3 kWc                                            | 10 % |

**Exclusions 10 %** (relèvent de 20 %):

- Construction neuve / extension > 10 % surface
- Élévation / surélévation
- Gros œuvre (fondations, murs porteurs, charpente > 50 %)
- Équipements ménagers non encastrés

**Conditions**: identiques TVA 5,5 % (logement > 2 ans, facture artisan).

**Source**: [Service Public - Taux de TVA travaux](https://entreprendre.service-public.gouv.fr/vosdroits/F23568).

---

## 4. Aides des collectivités locales

⚠️ **ATTENTION**: les aides régionales sont volatiles (budgets votés annuellement, dispositifs parfois suspendus). Toujours vérifier le site officiel avant de présenter un montant à un utilisateur. Privilégier l'orientation via France Rénov' (`france-renov.gouv.fr`) qui tient le référentiel à jour.

| ID stable                       | Région                     | Dispositif                                                                                  | Statut / Montant                                                                                             | Source à vérifier                                                                                               |
| ------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `aide_reg.idf.aucune_regionale` | Île-de-France              | Aucun dispositif régional dédié rénovation énergétique                                      | ⚠️ Orienter vers aides départementales (75, 77, 78, 91, 92, 93, 94, 95)                                      | [ANIL IDF](https://www.anil.org/aides-locales-travaux/region/ile-de-france/)                                    |
| `aide_reg.occitanie.ecocheque`  | Occitanie                  | Éco-chèque logement                                                                         | ⚠️ **SUSPENDU depuis déc. 2022**. Anciennement 1 500 € occupant / 1 000 € bailleur                           | [laregion.fr](https://www.laregion.fr/Reduisez-votre-facture-energetique-avec-l-eco-cheque-logement)            |
| `aide_reg.grand_est.climaxion`  | Grand Est                  | Climaxion (ADEME + Région)                                                                  | Actif. Aides EnR (chaudière bois, poêle). Copros ≥ 50 % gain éligibles en 2026. Montants variables           | [climaxion.fr](https://www.climaxion.fr/particuliers-coproprietes)                                              |
| `aide_reg.hdf.pass_renovation`  | Hauts-de-France            | Pass Rénovation (SPEE régional)                                                             | Actif 2026. Accompagnement + éco-prêts (jusqu'à 25 ans). Remplace PELG et AREL. Sans condition de ressources | [pass-renovation.hautsdefrance.fr](https://www.pass-renovation.hautsdefrance.fr/)                               |
| `aide_reg.na.fragmenté`         | Nouvelle-Aquitaine         | ~101 aides locales fragmentées                                                              | ⚠️ Pas de dispositif régional unifié. Orienter vers France Rénov' local                                      | [les-aides.nouvelle-aquitaine.fr](https://les-aides.nouvelle-aquitaine.fr/transition-energetique-et-ecologique) |
| `aide_reg.ara.fragmenté`        | Auvergne-Rhône-Alpes       | Aides métropolitaines (Lyon: 3 000 € chauffage bois; Isère: 2 000-6 000 €)                  | ⚠️ Pas de dispositif régional unifié                                                                         | [Effy ARA](https://www.izi-by-edf-renov.fr/blog/aide-renovation-auvergne-rhone-alpes)                           |
| `aide_reg.bretagne.ecorenov`    | Bretagne                   | Écorenov' Habitat                                                                           | Jusqu'à 5 000 € + accompagnement                                                                             | [ANIL Bretagne](https://www.anil.org/aides-locales-travaux/region/bretagne/)                                    |
| `aide_reg.paca.opah`            | Provence-Alpes-Côte d'Azur | ~8 aides locales (compléments OPAH / Anah)                                                  | ⚠️ Très localisées, pas de dispositif régional                                                               | [ANIL PACA](https://www.anil.org/aides-locales-travaux/region/provence-alpes-cote-d-azur/)                      |
| `aide_reg.normandie.localisé`   | Normandie                  | Aides ciblées (Eure: 50 % plafond 10 000 € passoires; CC Pays Honfleur-Beuzeville: 4 000 €) | ⚠️ Dispositif variable par EPCI                                                                              | [ANIL Normandie](https://www.anil.org/aides-locales-travaux/region/normandie/)                                  |
| `aide_reg.pdl.regionale`        | Pays de la Loire           | Aide régionale rénovation                                                                   | Jusqu'à 4 000 €. Maine-et-Loire: 3 000 € F/G→A/B + 500 € biosourcés                                          | [anil pdl](https://www.anil.org/aides-locales-travaux/region/pays-de-la-loire/)                                 |
| `aide_reg.cvl.à_vérifier`       | Centre-Val de Loire        | Dispositifs locaux                                                                          | ⚠️ Vérifier site région                                                                                      | [ANIL CVL](https://www.anil.org/aides-locales-travaux/region/centre-val-de-loire/)                              |
| `aide_reg.bfc.à_vérifier`       | Bourgogne-Franche-Comté    | Effilogis                                                                                   | ⚠️ Actif 2026 — vérifier barèmes                                                                             | [ANIL BFC](https://www.anil.org/aides-locales-travaux/region/bourgogne-franche-comte/)                          |

**Règle produit**: dans le simulateur, afficher les aides régionales en **mention informative** (`Des aides régionales peuvent exister — votre conseiller France Rénov' vous oriente`), sans chiffre par défaut, pour éviter la désinformation. Ne chiffrer QUE si la base interne est mise à jour trimestriellement avec source URL vérifiée.

---

## 5. Chèque Énergie national 2026

**Base légale**: Articles L.124-1 et suivants du Code de l'énergie.
**Source officielle**: [Service-Public](https://www.service-public.gouv.fr/particuliers/actualites/A17885).

| ID stable                       | Paramètre                                  | Valeur 2026                                              |
| ------------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| `cheque_energie.plafond_rfr_uc` | Plafond RFR par unité de consommation (UC) | 11 000 € / UC                                            |
| `cheque_energie.uc_1p`          | Unités — 1ère personne                     | 1,0 UC                                                   |
| `cheque_energie.uc_2p`          | Unités — 2ème personne                     | 0,5 UC                                                   |
| `cheque_energie.uc_suiv`        | Unités — personnes suivantes               | 0,3 UC / personne                                        |
| `cheque_energie.montant_min`    | Montant minimum                            | 48 €                                                     |
| `cheque_energie.montant_max`    | Montant maximum                            | 277 €                                                    |
| `cheque_energie.envoi`          | Calendrier envoi                           | 1er avril → 20 avril 2026 (vague 1) + mai 2026 (vague 2) |

**⚠️ IMPORTANT — utilisation travaux**:

> Depuis le 15 février 2025, **le chèque énergie ne peut plus être utilisé pour payer des travaux de rénovation énergétique**. Il sert uniquement à régler les dépenses d'énergie du logement (électricité, gaz, fioul, bois).
>
> Les « chèques travaux » émis avant le 15/02/2025 restent utilisables jusqu'à leur date d'expiration.

**Impact simulateur**: NE PAS inclure le chèque énergie dans le calcul du reste-à-charge travaux. Mention possible pour information : « Éligible au chèque énergie pour vos factures ».

---

## 6. MaPrimeRénov' Copropriété (MPR Copro)

**Source officielle**: [France Rénov'](https://france-renov.gouv.fr/aides/maprimerenov-copropriete), [Service-Public F37827](https://www.service-public.gouv.fr/particuliers/vosdroits/F37827).

| ID stable                       | Paramètre                                      | Valeur 2026         |
| ------------------------------- | ---------------------------------------------- | ------------------- |
| `mpr_copro.immatriculation`     | Immatriculation registre national copropriétés | Obligatoire         |
| `mpr_copro.age_min`             | Âge bâtiment                                   | ≥ 15 ans            |
| `mpr_copro.rp_min_20lots`       | % résidences principales (copro ≤ 20 lots)     | ≥ 65 %              |
| `mpr_copro.rp_min_sup20`        | % résidences principales (copro > 20 lots)     | ≥ 75 %              |
| `mpr_copro.gain_min`            | Gain énergétique minimum                       | ≥ 35 %              |
| `mpr_copro.audit`               | Audit énergétique préalable                    | Obligatoire         |
| `mpr_copro.amo`                 | Assistance Maîtrise d'Ouvrage (AMO)            | Obligatoire         |
| `mpr_copro.rge`                 | Artisans RGE                                   | Obligatoire         |
| `mpr_copro.taux_35`             | Taux de subvention si gain ≥ 35 %              | 30 % HT             |
| `mpr_copro.taux_50`             | Taux de subvention si gain ≥ 50 %              | 45 % HT             |
| `mpr_copro.plafond`             | Plafond dépense éligible                       | 25 000 € / logement |
| `mpr_copro.bonus_passoire`      | Bonus sortie passoire thermique (F/G → D)      | +10 %               |
| `mpr_copro.bonus_copro_fragile` | Bonus copropriété fragile / en difficulté      | +20 %               |

**Cumul**: cumulable avec CEE (Coup de Pouce Rénovation Globale Copropriétés), Éco-PTZ copropriétés, aides régionales.

---

## 7. Exonération taxe foncière — travaux de rénovation énergétique

**Base légale**: [Article 1383-0 B CGI](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041579348).
**Doctrine**: [BOFiP BOI-IF-TFB-10-180-10](https://bofip.impots.gouv.fr/bofip/2677-PGP.html).
**Entrée en vigueur nouvelle rédaction**: 01/01/2025 (loi de finances 29/12/2023).

| ID stable                 | Paramètre                                   | Valeur                                          |
| ------------------------- | ------------------------------------------- | ----------------------------------------------- |
| `tf_exo.delib`            | Délibération commune / EPCI                 | **Obligatoire** — pas d'exonération automatique |
| `tf_exo.taux`             | Taux d'exonération (au choix de la commune) | 50 % ou 100 %                                   |
| `tf_exo.age_logement`     | Logement achevé avant le                    | 01/01/1989                                      |
| `tf_exo.seuil_1an`        | Seuil dépenses sur 1 année (N-1)            | > 10 000 € / logement                           |
| `tf_exo.seuil_3ans`       | Seuil dépenses sur 3 années (N-1 à N-3)     | > 15 000 € / logement                           |
| `tf_exo.duree`            | Durée exonération                           | 3 ans à compter de l'année suivant paiement     |
| `tf_exo.non_renouvelable` | Non renouvelable pendant                    | 10 ans après expiration                         |
| `tf_exo.declaration`      | Déclaration au SIP avant                    | 1er janvier année application                   |

**Dépenses éligibles**: travaux « économies d'énergie » au sens de l'article 200 quater CGI (liste alignée sur ex-CITE / MPR), pièces justificatives obligatoires.

**Impact simulateur**: afficher en **information conditionnelle** :

> « Votre commune peut exonérer partiellement ou totalement votre taxe foncière pendant 3 ans si vos dépenses dépassent 10 000 € (ou 15 000 € sur 3 ans) ET si elle a voté une délibération en ce sens. Vérifiez auprès de votre mairie. »

NE PAS intégrer dans le calcul de reste-à-charge (trop d'incertitude : délibération communale non connue à la maille nationale).

---

## Règles de cumul — synthèse

| Aide A × Aide B             | Cumul                                   |
| --------------------------- | --------------------------------------- |
| MPR × CEE                   | ✅ oui                                  |
| MPR × Éco-PTZ               | ✅ oui                                  |
| MPR × TVA 5,5 %             | ✅ oui (TVA indépendante)               |
| MPR × aides régionales      | ✅ oui (sauf mention contraire)         |
| MPR × MPR Copro             | ❌ non (parties privatives vs communes) |
| CEE × Éco-PTZ               | ✅ oui                                  |
| Chèque énergie × travaux    | ❌ plus possible depuis 15/02/2025      |
| Exo taxe foncière × MPR/CEE | ✅ oui (fiscalité indépendante)         |

---

## Sources officielles — index

- **Légifrance**:
  - [Art. 244 quater U CGI](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023380703) — Éco-PTZ
  - [Art. 1383-0 B CGI](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041579348) — Exo taxe foncière
  - [Arrêté 04/12/2024](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000050823106) — TVA 5,5 % liste
  - [Décret n° 2024-299](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049346187) — Éco-PTZ 2024
- **BOFiP**:
  - [BOI-TVA-LIQ-30-20-95](https://bofip.impots.gouv.fr/bofip/9417-PGP.html) — TVA énergétique
  - [BOI-BIC-RICI-10-110](https://bofip.impots.gouv.fr/bofip/6464-PGP.html) — Éco-PTZ crédit d'impôt
  - [BOI-IF-TFB-10-180-10](https://bofip.impots.gouv.fr/bofip/2677-PGP.html) — Exo TF énergétique
- **Service-Public / impots.gouv.fr**:
  - [Chèque énergie 2026](https://www.service-public.gouv.fr/particuliers/actualites/A17885)
  - [MPR Copropriété F37827](https://www.service-public.gouv.fr/particuliers/vosdroits/F37827)
  - [TVA travaux F23568](https://entreprendre.service-public.gouv.fr/vosdroits/F23568)
- **France Rénov'**: [france-renov.gouv.fr](https://france-renov.gouv.fr/aides/maprimerenov-copropriete)
- **ANIL**: [anil.org — aides locales par région](https://www.anil.org/aides-locales-travaux/)

---

**Date prochaine révision obligatoire**: 2026-07-14 (trimestrielle pour aides régionales + après chaque loi de finances pour aides nationales).
