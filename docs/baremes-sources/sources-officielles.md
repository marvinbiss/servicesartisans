# Sources officielles des baremes — Tracabilite

Date de mise a jour : 2026-04-16
Bareme version : `2026-01` (fichier `src/lib/simulateur/baremes/2026-01.ts`)

## 1. MaPrimeRenov' (MPR)

### Plafonds de revenus ANAH (Categorie bleu/jaune/violet/rose)

- **Source** : Arrete du 14 janvier 2020 modifie (derniere MAJ : arrete du 29/12/2025 publie au JO du 31/12/2025)
- **URL** : https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000041400376
- **Fichier bareme** : `ANAH_PLAFONDS_IDF`, `ANAH_PLAFONDS_HORS_IDF`
- **Statut** : CONFIRME

### Forfaits MPR par geste (parcours geste)

- **Source** : Annexe I de l'arrete du 17/11/2020 modifie par arrete du 29/12/2025
- **URL** : https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042532442
- **Fichier bareme** : `MPR_GESTE_PAC_AIREAU`, `MPR_GESTE_CET`, etc.
- **Notes** :
  - BIOMASSE, ITE, ITI : supprimes depuis 01/01/2026 (arrete du 29/12/2025 art. 4)
  - CESI, POELE_BUCHES : non confirmes au JO → baremeId suffixe `.UNCONFIRMED.`
  - ISO_TOITURE_*, ISO_PLANCHERS_BAS : necessitent surface isolee → baremeId suffixe `.NEEDS_SURFACE.`
- **Statut** : PARTIELLEMENT CONFIRME (voir notes)

### MPR accompagne (taux + plafonds HT)

- **Source** : Decret n° 2024-899 du 4/10/2024, modifie par decret du 30/12/2025
- **URL** : https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000050370002
- **Fichier bareme** : `MPR_ACCOMPAGNE`, `MPR_ACCOMPAGNE_PLAFOND_HT`
- **Notes** :
  - Taux bleu/jaune : interpolation lineaire 2→4 sauts DPE (60%→80% / 40%→60%)
  - Taux violet : 45% constant, rose : 10% constant
  - Plafonds HT : 40K (2 sauts), 55K (3 sauts), 70K (4+ sauts)
- **Statut** : CONFIRME

## 2. CEE — Fiches standardisees

### BAR-TH-148 (CET)

- **Source** : Fiche standardisee BAR-TH-148 v. A43.1 (DGEC)
- **URL** : https://www.ecologie.gouv.fr/politiques-publiques/fiches-doperations-standardisees
- **Statut** : CONFIRME

### BAR-TH-113 (Biomasse individuelle)

- **Source** : Fiche BAR-TH-113 v. A43.1
- **Statut** : CONFIRME

### BAR-TH-143 (SSC)

- **Source** : Fiche BAR-TH-143 v. A43.1
- **Statut** : CONFIRME

### BAR-TH-127 (VMC simple flux)

- **Source** : Fiche BAR-TH-127 v. A43.1
- **Statut** : CONFIRME

### BAR-TH-171 (PAC air/eau)

- **Source** : Fiche BAR-TH-171 v. A78.4 (arrete 15/12/2025), Legifrance JORFTEXT000053043176
- **URL PDF** : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-171%20vA78.4%20%C3%A0%20compter%20du%2001-01-2026.pdf
- **Formule** : kWhc = montant_de_base x coeff_surface x coeff_zone
  - Montants de base : maison ETAS1=90900, ETAS2=109200 / appart ETAS1=48700, ETAS2=58900
  - Coeff surface maison : <70m2=0.5, 70-90m2=0.7, >=90m2=1.0
  - Coeff surface appart : <35m2=0.5, 35-60m2=0.7, >=60m2=1.0
  - Coeff zone : H1=1.2, H2=1.0, H3=0.7
- **Validation** : maison H1, 80m2, ETAS2 → 109200 x 0.7 x 1.2 = 91728 kWhc (x5 CdP = 458640 ≈ 458 MWhc Argile.ai)
- **Statut** : CONFIRME (formule officielle implementee, remplace l'approximation)

### BAR-EN-101 (Isolation combles/toitures)

- **Source** : Fiche BAR-EN-101 v. A64-6 (01/01/2025)
- **URL PDF** : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-101%20vA64-6.pdf
- **Formule** : kWhc = forfait_par_m2 x surface_isolee
- **Valeurs** : H1: 2300/1500, H2: 1900/1200, H3: 1300/800 (combustible/electrique)
- **R min** : combles perdus >= 7, rampants >= 6 m2.K/W
- **Notes** : Surface isolee estimee via ratio 1.1x surface habitable (stepper simplifie)
- **Statut** : CONFIRME (valeurs officielles, surface ESTIMEE)

### BAR-EN-102 (Isolation murs)

- **Source** : Fiche BAR-EN-102 v. A39-5
- **URL** : https://calculateur-cee.ademe.fr/pdf/display/20/BAR-EN-102
- **Formule** : kWhc = forfait_par_m2 x surface_isolee
- **Valeurs** : H1: 3800/2400, H2: 3100/2000, H3: 2100/1300 (combustible/electrique)
- **R min** : >= 3.7 m2.K/W
- **Notes** : Surface isolee estimee via ratio 2.5x surface habitable (perimetre x hauteur)
- **Statut** : CONFIRME (valeurs officielles, surface ESTIMEE)

### BAR-EN-103 (Isolation plancher bas)

- **Source** : Fiche BAR-EN-103 v. A39-5
- **URL PDF** : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-103%20vA39-5.pdf
- **Formule** : kWhc = forfait_par_m2 x surface_isolee (pas de distinction energie)
- **Valeurs** : H1: 1600, H2: 1300, H3: 900
- **R min** : >= 3 m2.K/W
- **Statut** : CONFIRME (valeurs officielles, surface ESTIMEE)

### Fiches NON IMPLEMENTEES (STUB dans le pipeline)

| Fiche | Geste | Raison du STUB |
|-------|-------|----------------|
| BAR-TH-125 | VMC_2FLUX | Non implemente |
| BAR-TH-112 | POELE_GRANULES, POELE_BUCHES | Non implemente |
| BAR-TH-101 | CESI | Non implemente |
| BAR-TH-104 | PAC_GEOTHERMIE | Non implemente |

**Les STUBs restants retournent 0 EUR CEE avec un baremeId explicite** (`CEE.{fiche}.STUB.NON_IMPLEMENTE.2026-01`).

## 3. Prix CEE (conversion kWhc → EUR)

- **Source** : Cotation Emmy (registre national CEE)
- **URL** : https://www.emmy.fr
- **Valeurs par defaut** :
  - Classique : 8.5 EUR/MWhc (env `CEE_PRIX_CLASSIQUE`)
  - Precarite : 15.0 EUR/MWhc (env `CEE_PRIX_PRECARITE`)
- **Notes** : Prix fluctuants. Les env vars permettent de mettre a jour sans redeployer.
- **Statut** : INDICATIF (marche)

## 4. Coup de Pouce

### CDP Chauffage (parcours geste)

- **Source** : Charte Coup de Pouce Chauffage (ministere, 2025-2026)
- **URL** : https://www.ecologie.gouv.fr/politiques-publiques/coup-pouce-chauffage
- **Notes** : Fourchettes indicatives par equipement remplace + categorie. Boost x5 pour gaz/fioul/charbon.
- **Statut** : CONFIRME (montants indicatifs)

### CDP Renovation ampleur (parcours accompagne)

- **Source** : Charte Coup de Pouce Renovation performante (2025-2026)
- **Notes** : Exige residence principale depuis 17/01/2026. Plancher x facteur surface.
- **Statut** : CONFIRME

## 5. Ecretement

- **Source** : Code de la construction, art. R.232-4 + arrete du 29/12/2025
- **Taux** :
  - Parcours geste : bleu 90%, jaune 75%, violet 60%, rose exclu
  - Parcours accompagne : bleu 100%, jaune 90%, violet 80%, rose 50%
- **Statut** : CONFIRME

## 6. Eco-PTZ et PAR

- **Source** : Code general des impots art. 244 quater U, modifie par LOI n°2024-1174
- **Eco-PTZ** : 15K (1 geste), 25K (2), 30K (3+), 50K (ampleur), 7K (copro). Duree max 20 ans.
- **PAR** : bleu/jaune uniquement, max 50K accompagne / 30K geste.
- **Statut** : CONFIRME

## 7. Zones climatiques

- **Source** : RT 2012, annexe de l'arrete du 26/10/2010
- **URL** : https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000022959289
- **Fichier** : `src/lib/simulateur/zones.ts`
- **Statut** : CONFIRME (stable depuis 2012)

## 8. Eligibilite

| Regle | Source | Statut |
|-------|--------|--------|
| < 2 ans : tous gestes rejetes | Arrete du 14/01/2020 art. 2 | CONFIRME |
| Accompagne exige > 15 ans | Decret n° 2024-899 art. 3 | CONFIRME |
| Rose + geste : tous rejetes | Arrete du 29/12/2025 art. 5 | CONFIRME |
| Non-principale + accompagne rejete (17/01/2026) | Note ANAH du 17/01/2026 | CONFIRME |

---

## Legende des statuts

| Statut | Signification |
|--------|--------------|
| CONFIRME | Verifie dans un texte officiel (JO, arrete, decret) |
| PARTIELLEMENT CONFIRME | Certaines valeurs verifiees, d'autres en attente de publication |
| APPROXIMATION | Valeur estimee, pas de source officielle exacte |
| INDICATIF | Valeur de marche, fluctuante, non reglementaire |
| STUB | Non implemente, retourne 0 EUR avec trace |
