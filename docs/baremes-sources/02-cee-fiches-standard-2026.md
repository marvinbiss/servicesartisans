# CEE — Fiches d'opérations standardisées 2026 (6e période)

**Version**: 1.0.0
**Date validité**: 2026-04-14
**Scope**: fiches résidentiel rénovation énergétique, P6 (2026-2030)

---

## Contexte réglementaire 6e période (P6)

- **Période**: P6 = 2026-01-01 → 2030-12-31 (opérations achevables jusqu'au 2031-12-31)
- **Obligation globale**: ~1 050 TWhc/an, dont 280 TWhc/an précarité (coefficient obligation précarité P6 = 0,364, vs 0,620 en P5)
- **Cadre juridique**: arrêté du 22/12/2014 modifié (liste fiches), arrêté du 29/12/2014 (modalités), arrêté-cadre P6 publié fin 2025

## Prix kWh cumac — cotation marché EMMY (avril 2026) ⚠️ FLUCTUANT

| Type          | Fourchette €/MWhc | €/kWhc               |
| ------------- | ----------------- | -------------------- |
| CEE Classique | 8 – 10 €/MWhc     | 0,008 – 0,010 €/kWhc |
| CEE Précarité | 14 – 17 €/MWhc    | 0,014 – 0,017 €/kWhc |

**Source**: EMMY (registre national) — `emmy.fr/public/donnees-mensuelles`. La cotation est mensuelle; utiliser la dernière valeur publiée.

**Formule conversion prime ménage**: `prime_€ = kWh_cumac × taux_€/kWhc × bonification`

- Taux moyen reversé au ménage par l'obligé/mandataire: **0,003 à 0,008 €/kWhc** (marge obligé déduite)
- Bonification précarité = x2 (logique historique) mais en P6 la valorisation passe par le **volume supplémentaire** et non un coefficient direct; vérifier barème obligé

## Zones climatiques (arrêté 29/12/2014 annexe)

- **H1**: nord, est, IdF, altitude (Alsace, Lorraine, Bourgogne, etc.)
- **H2**: ouest, centre, Atlantique (Bretagne, Pays de Loire, Aquitaine hors littoral sud)
- **H3**: pourtour méditerranéen (Aude, Hérault, Gard, Bouches-du-Rhône, Var, Alpes-Maritimes, Corse)

---

## Tableau synthétique forfaits par fiche

### BAR-TH-171 — Pompe à chaleur air/eau ⚠️ REFONTE JANVIER 2026

**Arrêté applicable**: [Arrêté du 15/12/2025, JORF 18/12/2025](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053043176). Version: à partir du 1er janvier 2026.

**Conditions techniques opposables**:

- ETAS ≥ 126% (basse température) OU ≥ 111% (moyenne/haute température)
- Professionnel RGE obligatoire
- 2 classes ETAS: [111%-140%] et [>140%]
- Surfaces maison: <70 m² / 70-90 m² / >90 m²
- Coup de pouce: x6 ménages modestes (jusqu'à fin P6) ; x6 autres ménages (01/10/2025→31/03/2026), puis x5 (01/04/2026→fin P6)
- Non-cumul avec BAR-TH-148 depuis 2026

| ID stable                           | Zone | Type logement   | Forfait kWhc indicatif ⚠️      | V/P |
| ----------------------------------- | ---- | --------------- | ------------------------------ | --- |
| CEE.BAR-TH-171.H1.MAISON.70-90.2026 | H1   | Maison 70-90 m² | à calculer selon ETAS + arrêté | P6  |
| CEE.BAR-TH-171.H2.MAISON.70-90.2026 | H2   | Maison 70-90 m² | à calculer selon ETAS + arrêté | P6  |
| CEE.BAR-TH-171.H3.MAISON.70-90.2026 | H3   | Maison 70-90 m² | à calculer selon ETAS + arrêté | P6  |

⚠️ **Les valeurs chiffrées détaillées par zone/surface/ETAS doivent être extraites directement du PDF officiel DGEC de l'arrêté 15/12/2025 (annexe).** Sources de référence à récupérer manuellement: `ecologie.gouv.fr/politiques-publiques/operations-standardisees-deconomies-denergie` + PDF calculateur-cee.ademe.fr. Montants minimaux Coup de pouce historiques: 4 000 €/2 500 € (modeste/standard) avant refonte 2026.

---

### BAR-TH-104 — PAC géothermique ⚠️ SUPPRIMÉE

Fiche supprimée au 01/01/2024. Remplacée par BAR-TH-172 (eau/eau, eau glycolée/eau) — mêmes bonifications x5/x6 que BAR-TH-171 en 2026. Pour pro-géothermie pure, voir nouvelle BAR-TH-178 "Système géothermique" (créée arrêté 06/09/2025, en vigueur 01/01/2026).

---

### BAR-TH-148 — Chauffe-eau thermodynamique individuel

**Arrêté**: arrêté du 04/10/2023, dernière modif arrêté 06/09/2025. Version **A78-4 applicable 01/01/2026**. Durée conventionnelle 17 ans. Fin éligibilité: 31/10/2030.

**Conditions opposables**:

- COP (NF EN 16147) ≥ 2,5 (sur air extrait) ou ≥ 2,4 (autres)
- Profil de soutirage M, L ou XL (règlement UE 814/2013)
- Traçabilité fluide frigorigène
- RGE obligatoire
- **Non-cumul BAR-TH-171/172** depuis 2026

⚠️ Les forfaits chiffrés exacts par zone H1/H2/H3 et profil de soutirage sont dans la fiche A78-4 (pdf DGEC). À récupérer: `calculateur-cee.ademe.fr/pdf/display/.../BAR-TH-148`.

---

### BAR-TH-101 — Chauffe-eau solaire individuel (CESI)

**Arrêté**: dernière version A62-2 (applicable depuis 01/01/2025, toujours en vigueur 2026). [Fiche DGEC](https://www.ecologie.gouv.fr/politiques-publiques/operations-standardisees-deconomies-denergie). Durée conventionnelle 20 ans. Fin éligibilité: 01/01/2030.

| ID stable                     | Zone | Forfait kWhc | Source       |
| ----------------------------- | ---- | ------------ | ------------ |
| CEE.BAR-TH-101.H1.MAISON.2026 | H1   | **18 500**   | fiche vA62-2 |
| CEE.BAR-TH-101.H2.MAISON.2026 | H2   | **21 000**   | fiche vA62-2 |
| CEE.BAR-TH-101.H3.MAISON.2026 | H3   | **24 200**   | fiche vA62-2 |

**Conditions**: capteurs solaires certifiés CSTBat ou Solar Keymark; circulation forcée; RGE QualiSol obligatoire.

---

### BAR-TH-113 — Chaudière biomasse individuelle

**Arrêté**: arrêté cadre 22/12/2014 modifié. Durée conventionnelle 17 ans. ⚠️ Valeurs historiques divergentes entre sources — version actuelle révisée à la baisse.

| ID stable                     | Zone | Forfait kWhc (version actuelle, à vérifier) |
| ----------------------------- | ---- | ------------------------------------------- |
| CEE.BAR-TH-113.H1.MAISON.2026 | H1   | ~41 300 ⚠️                                  |
| CEE.BAR-TH-113.H2.MAISON.2026 | H2   | ~33 800 ⚠️                                  |
| CEE.BAR-TH-113.H3.MAISON.2026 | H3   | ~26 300 ⚠️                                  |

**Conditions**: rendement saisonnier (ETAS) ≥ seuils réglementaires; label Flamme Verte 7\* recommandé; RGE Qualibois obligatoire.

⚠️ Les valeurs 142 300/116 400/77 600 correspondent à une version antérieure. Vérifier impérativement la version en vigueur sur `ecologie.gouv.fr` avant usage en calcul opposable.

---

### BAR-TH-112 — Appareil indépendant de chauffage au bois (poêle, insert)

**Arrêté**: fiche DGEC `ecologie.gouv.fr/sites/default/files/documents/BAR-TH-112.pdf`. Durée conventionnelle 15 ans.

| ID stable                     | Zone | Forfait kWhc |
| ----------------------------- | ---- | ------------ |
| CEE.BAR-TH-112.H1.MAISON.2026 | H1   | **38 200**   |
| CEE.BAR-TH-112.H2.MAISON.2026 | H2   | **31 300**   |
| CEE.BAR-TH-112.H3.MAISON.2026 | H3   | **20 900**   |

**Conditions opposables**:

- Rendement ≥ 75%; émissions CO ≤ 0,12%; particules ≤ 40 mg/Nm³
- Normes NF EN 13240 (poêles), NF EN 13229 (inserts), NF EN 14785 (granulés), NF EN 15250 (accumulation), NF EN 12815 (cuisinières)
- Label Flamme Verte 7\* recommandé; RGE Qualibois obligatoire

---

### BAR-EN-101 — Isolation combles/toiture

**Arrêté**: [arrêté 04/10/2023 + arrêté 06/09/2025](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052212320). Version A29 en vigueur 2026. Durée conv. 30 ans.

| ID stable                   | Zone | Chauffage combustible | Chauffage électrique |
| --------------------------- | ---- | --------------------- | -------------------- |
| CEE.BAR-EN-101.H1.COMB.2026 | H1   | **2 300 kWhc/m²**     | 1 500 kWhc/m²        |
| CEE.BAR-EN-101.H2.COMB.2026 | H2   | **1 900 kWhc/m²**     | 1 200 kWhc/m²        |
| CEE.BAR-EN-101.H3.COMB.2026 | H3   | **1 300 kWhc/m²**     | 800 kWhc/m²          |

**Conditions opposables**: R ≥ 7 m²·K/W (combles perdus), R ≥ 6 m²·K/W (rampants toiture); isolant certifié ACERMI; RGE QualiBat isolation (5311/7131).

---

### BAR-EN-102 — Isolation des murs

**Arrêté**: fiche DGEC calculateur-cee.ademe.fr/pdf/display/20/BAR-EN-102. Durée conv. 30 ans.

| ID stable                   | Zone | Combustible       | Électrique    |
| --------------------------- | ---- | ----------------- | ------------- |
| CEE.BAR-EN-102.H1.COMB.2026 | H1   | **3 800 kWhc/m²** | 2 400 kWhc/m² |
| CEE.BAR-EN-102.H2.COMB.2026 | H2   | **3 100 kWhc/m²** | 2 000 kWhc/m² |
| CEE.BAR-EN-102.H3.COMB.2026 | H3   | **2 100 kWhc/m²** | 1 300 kWhc/m² |

**Conditions opposables**: R ≥ 3,7 m²·K/W; isolant ACERMI; RGE QualiBat 7131/7141 (ITE ou ITI).

---

### BAR-EN-103 — Isolation plancher bas

**Arrêté**: [fiche DGEC BAR-EN-103 vA29-2](https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-103%20mod%20A29-2.pdf). Nouvelles exigences depuis 01/01/2025. Durée conv. 30 ans.

| ID stable                     | Zone | Forfait kWhc/m² |
| ----------------------------- | ---- | --------------- |
| CEE.BAR-EN-103.H1.MAISON.2026 | H1   | **1 600**       |
| CEE.BAR-EN-103.H2.MAISON.2026 | H2   | **1 300**       |
| CEE.BAR-EN-103.H3.MAISON.2026 | H3   | **900**         |

**Conditions opposables**: R ≥ 3 m²·K/W; plancher sur sous-sol non chauffé / vide sanitaire / passage ouvert; RGE obligatoire.

---

### BAR-TH-127 — VMC simple flux hygroréglable ⚠️ (la cible "VMC DF" est BAR-TH-125)

**Arrêté**: [arrêté 15/09/2023](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048124066). Durée conv. 17 ans. Fin éligibilité: 30/06/2028.

**Conditions**: classe énergétique ≥ B (règlement UE 1254/2014); puissance absorbée pondérée ≤ 15 WThC en config T4.

⚠️ Valeur partielle retrouvée: **H3 ≈ 17 200 kWhc** (maison indiv). Valeurs H1/H2 à extraire du PDF fiche.

---

### BAR-TH-125 — Ventilation double flux haute performance (fiche réellement visée)

**Arrêté**: en vigueur depuis 01/01/2024. Fin éligibilité: 01/07/2028.

**Conditions opposables**:

- Rendement thermique ≥ 85% (NF EN 13141-7)
- Puissance électrique absorbée ≤ 47,6 WThC en T4
- Installation par pro RGE

**Exemple calcul documenté**: maison 100 m² zone H1 double flux modulé = **42 000 kWhc** (soit 420 kWhc/m² indicatif, à moduler selon zone et surface). Valeurs exactes zone par zone et surface par surface dans la fiche officielle.

⚠️ Prime moyenne observée marché: ~200 € (faible car coefficient faible).

---

### BAR-TH-143 — Système solaire combiné (SSC) ⚠️ RÉVISÉ 2026

**Arrêtés**: [arrêté 27/12/2025 (modif fiche + bonifications)](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053202091) + [arrêté 24/02/2026 (référentiel de contrôle)](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053586809). Durée conv. 20 ans.

**Valeurs historiques (avant 79e arrêté)**:

| ID stable                     | Zone | Forfait kWhc (pré-2026) | Après 79e arrêté       |
| ----------------------------- | ---- | ----------------------- | ---------------------- |
| CEE.BAR-TH-143.H1.MAISON.2026 | H1   | 134 800                 | **≈ 47 000** (–65%) ⚠️ |
| CEE.BAR-TH-143.H2.MAISON.2026 | H2   | 121 000                 | **≈ 42 000** (–65%) ⚠️ |
| CEE.BAR-TH-143.H3.MAISON.2026 | H3   | 100 500                 | **≈ 35 000** (–65%) ⚠️ |

**Conditions opposables 2026**:

- Non-cumul avec PAC et chaudière biomasse
- Référentiel de contrôle renforcé (arrêté 24/02/2026)
- Devis signés avant 31/12/2025 conservent l'ancien barème si achèvement avant 31/12/2026
- RGE QualiSol Combi obligatoire

---

## Sources de référence (opposabilité juridique)

### Textes officiels (obligatoires pour opposabilité)

- [Arrêté du 22/12/2014 définissant les opérations standardisées](https://aida.ineris.fr/reglementation/arrete-221214-definissant-operations-standardisees-deconomies-denergie)
- [Arrêté du 06/09/2025 (modif fiches + arrêté 29/12/2014)](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052212320)
- [Arrêté du 15/12/2025 — BAR-TH-171/172](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053043176)
- [Arrêté du 27/12/2025 — BAR-TH-143/137/BAT-TH-127](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053202091)
- [Arrêté du 24/02/2026 — référentiel contrôle BAR-TH-143](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053586809)
- [Arrêté du 04/10/2023](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048158900)
- [Arrêté du 15/09/2023](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048124066)

### Portails officiels

- [Ministère Transition Écologique — liste fiches](https://www.ecologie.gouv.fr/politiques-publiques/operations-standardisees-deconomies-denergie)
- [ATEE Club C2E Résidentiel](https://atee.fr/efficacite-energetique/club-c2e/fiches-doperations-standardisees/batiment-residentiel)
- [Calculateur CEE ADEME (PDF fiches)](https://calculateur-cee.ademe.fr/)
- [EMMY — cotation kWh cumac](https://www.emmy.fr/public/donnees-mensuelles)
- [France Rénov — aides CEE](https://mesaides.france-renov.gouv.fr/)

### Consultation publique / vie-publique

- [Projet arrêté BAR-TH-171/172 (vie-publique)](https://www.vie-publique.fr/consultations/299971-projet-arrete-revisant-les-fiches-doperations-bar-th-171-et-bar-th-172)

---

## Actions bloquantes avant mise en prod simulateur

1. ⚠️ **Télécharger les PDF officiels** (calculateur-cee.ademe.fr + ecologie.gouv.fr) pour chaque fiche listée et extraire les tables de forfaits exactes (surtout BAR-TH-171, BAR-TH-148, BAR-TH-143 post-arrêté 27/12/2025, BAR-TH-113 version en vigueur)
2. ⚠️ **Cron mensuel EMMY** pour mise à jour cotation €/kWhc classique + précarité (éviter affichage prime obsolète)
3. ⚠️ **Disclaimer juridique** en front: "montants indicatifs, barème arrêté DGEC version X, valorisation selon obligé/mandataire partenaire, variations ±20% possibles"
4. ⚠️ **Versionner** chaque ID stable avec le numéro de version de la fiche (ex: BAR-TH-101.vA62-2) pour traçabilité <30s

---

**Date prochaine révision obligatoire**: mensuelle pour cotation EMMY ; après chaque modification DGEC pour forfaits.
