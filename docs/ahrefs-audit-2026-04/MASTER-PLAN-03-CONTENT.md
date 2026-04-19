# MASTER PLAN 03 — Plan Éditorial Définitif ServicesArtisans

## Bible éditoriale 6 mois — Avril 2026 → Octobre 2026

**Version** : 1.0  
**Auteur** : Head of Content Strategy  
**Basé sur** : Ahrefs Premium export 18/04/2026 + Google Search Central docs + données GSC/GA4  
**Objectif** : Devenir le leader content français rénovation énergétique + artisans locaux

---

## EXECUTIVE SUMMARY

ServicesArtisans est un site de 71 jours avec 261 mots-clés en positions, 62 % en top 10, et un momentum unique : **tous les concurrents directs perdent du trafic** (-13 % à -41 %) pendant que nous gagnons 62 nouveaux mots-clés. Le seul concurrent en hausse (+63 %) est societe.com — un annuaire de données officielles SIREN. Ce signal dit tout : Google 2026 récompense la fiabilité institutionnelle et sanctionne le contenu thin générique.

Notre stratégie éditoriale repose sur 3 piliers différenciants que personne n'a encore combinés :

1. **Données SIREN officielles** (déjà en place) — signal trust comme societe.com
2. **RGE certifié** (via API ADEME france-renov.gouv.fr) — éligibilité aides prouvée
3. **Simulateur MaPrimeRénov'** (déjà en prod) — conversion directe

Ce document est la bible opérationnelle : 30 briefs exécutables, calendrier 12 semaines, templates, guidelines E-E-A-T, checklists, mesure de succès.

---

## PARTIE 1 — CARTOGRAPHIE ÉDITORIALE COMPLÈTE

### 1.1 Les 7 types de pages pSEO — architecture logique

```
servicesartisans.fr/
│
├── [TYPE A] /urgence/[metier]/[ville]          ← PATTERN #1 PROUVÉ
├── [TYPE B] /departements/[dept]/[metier]      ← PATTERN #2 PROUVÉ
├── [TYPE C] /services/[metier]/[ville]         ← Core directory
├── [TYPE D] /avis/[metier]/[ville]             ← Reviews locales
├── [TYPE E] /tarifs/[metier]/[ville]           ← Intention commerciale
├── [TYPE F] /regions/[region]/[metier]         ← Territoire large
├── [TYPE G] /blog/prix-[metier]-[YYYY]         ← Linkbait + trust
│
├── [HUB 1] /renovation-energetique/            ← PILLAR #2 (NOUVEAU)
│   ├── /aides/[dispositif]/
│   ├── /travaux/[type-travaux]/
│   └── /diagnostic/[type]/
│
├── [HUB 2] /guides/[theme-YYYY]/               ← Guides actualisés
├── [HUB 3] /artisans-rge/                     ← Trust signal RGE
└── [HUB 4] /aides/[dept]/[dispositif]         ← Local × aide financière
```

### 1.2 Règles de templating par type

#### TYPE A — `/urgence/[metier]/[ville]`

**Intent dominant** : Local + Transactionnel (appel immédiat)  
**Volume cible par page** : 50-200 vol/mois (longue traîne)  
**KW pattern** : `[metier] [ville] urgence`, `urgence [metier] [ville]`, `[metier] [ville] 24h24`, `appel [metier] [ville]`  
**Template variables** :

- `{{metier}}` : plombier, serrurier, électricien, chauffagiste, vitrier
- `{{ville}}` : top 200 villes France (> 10 000 habitants)
- `{{dept_nom}}` : pour les artisans du département entier
- `{{heure_intervention}}` : estimée selon métier (plombier 1h, serrurier 30min)

**Éléments obligatoires** :

- Numéro d'urgence prominent (CTA rouge)
- Liste artisans disponibles 24h/7j dans la ville
- Tarifs d'urgence indicatifs
- Map des zones d'intervention
- Schema.org `LocalBusiness` + `EmergencyService`

#### TYPE B — `/departements/[dept]/[metier]`

**Intent dominant** : Local + Informationnel  
**Volume cible** : 20-200 vol/mois par page  
**KW pattern** : `[metier] [dept_nom]`, `[metier] en [dept_nom]`, `[metier] département [numero]`  
**Template variables** :

- `{{dept_code}}` : 01-974
- `{{dept_nom}}` : Ain, Aisne, Allier...
- `{{metier_pluriel}}` : plombiers, serruriers, électriciens
- `{{nb_artisans}}` : depuis DB providers
- `{{ville_principale}}` : chef-lieu département

**Éléments obligatoires** :

- Nombre d'artisans référencés
- Top 5 communes du département
- Tarifs moyens dans le département
- Conditions spécifiques (zones rurales = délai + majoration)

#### TYPE E — `/tarifs/[metier]/[ville]`

**Intent dominant** : Commercial + Informationnel  
**Volume cible** : 50-300 vol/mois par page  
**KW pattern** : `tarif [metier] [ville]`, `prix [metier] [ville]`, `coût [metier] [ville]`  
**Différenciation** : tableau de prix avec fourchettes réelles (TTC, main-d'œuvre + matériaux séparés), comparaison avec moyenne nationale

#### TYPE G — `/blog/prix-[metier]-YYYY`

**Intent dominant** : Informationnel + Commercial  
**Volume cible** : 1 000-15 000 vol/mois par article  
**Rôle** : linkbait principal — 4 des 11 seules pages avec backlinks externes  
**Structure** : 2 500-4 000 mots, tableaux prix détaillés, FAQ schema, calculateur intégré

#### HUB Rénovation Énergétique — `/renovation-energetique/`

**Intent dominant** : Informationnel + YMYL  
**Volume cible hub** : 3 000-10 000 vol/mois  
**Règle absolue** : chaque page = auteur identifié + date MAJ visible + sources officielles citées + lien sortant france-renov.gouv.fr ou anah.gouv.fr

---

### 1.3 Matrice de priorisation des KW perdus (94 550 vol/mois à reconquérir)

| KW perdu           | Vol    | Pos précédente | Action                                        | Délai récupération |
| ------------------ | ------ | -------------- | --------------------------------------------- | ------------------ |
| serrurier          | 59 000 | 99             | Fix SSR + page hub serrurier                  | 4-8 sem post-fix   |
| carreleur          | 5 600  | 58             | Fix SSR + brief dédié                         | 4-6 sem            |
| serrurier lyon     | 3 100  | 34             | Fix SSR + page /urgence/serrurier/lyon        | 3-5 sem            |
| couvreur lille     | 2 300  | 80             | Fix SSR + page /departements/nord/couvreur    | 6-8 sem            |
| plombier marseille | 2 200  | 64             | Fix SSR + angle unique MaPrimeRénov' plombier | 4-6 sem            |
| plombier rouen     | 1 000  | 4 (!)          | Fix SSR urgent + rebuild page                 | 2-3 sem            |
| zingueur           | 1 300  | 54             | Fix SSR + guide zingueur                      | 6-8 sem            |
| electricien lyon   | 1 300  | 52             | Fix SSR + brief local angle RGE               | 4-6 sem            |

**Note critique** : 80 % de ces KW reviendront automatiquement après fix bailout SSR. Les briefs dédiés accélèrent et consolident.

---

## PARTIE 2 — 30 BRIEFS ÉDITORIAUX COMPLETS

### BLOC A — RÉNOVATION ÉNERGÉTIQUE (10 briefs)

---

#### BRIEF RE-01 — Hub Rénovation Énergétique (page pillar)

**URL** : `/renovation-energetique/`  
**Titre SEO** : `Rénovation Énergétique 2026 : Aides, Travaux & Artisans RGE | ServicesArtisans`  
**Meta description** : `Tout sur la rénovation énergétique en 2026 : MaPrimeRénov', isolation, pompe à chaleur, artisans RGE certifiés. Simulateur d'aides gratuit. Données officielles ANAH.`  
**Longueur meta** : titre 77 chars / description 159 chars

**KW principal** : `rénovation énergétique` — vol 10 000, KD 40, intent Informationnel  
**KW secondaires** :

- rénovation maison aides (4 000)
- travaux rénovation énergétique (3 500)
- artisan RGE (2 000)
- maprimerenov 2026 (6 200)
- rénovation énergétique aides (2 500)
- bilan thermique maison (1 200)

**SERP features cibles** : Featured snippet (définition + liste travaux éligibles), PAA (questions sur les aides), Sitelinks

---

**OUTLINE DÉTAILLÉE**

**H1** : Rénovation Énergétique en 2026 : Le Guide Complet (Aides, Travaux, Artisans) (~100 mots intro)

**H2** : Pourquoi rénover en 2026 ? Le contexte réglementaire urgent (~400 mots)

- H3 : Les passoires thermiques face à l'interdiction de location (G dès 2025, F en 2028, E en 2034)
- H3 : Le coût de l'inaction : exemple chiffré économies perdues sur 5 ans
- H3 : Tableau : Classe DPE → obligation → date limite

**H2** : Quelles aides financières en 2026 ? Le panorama complet (~600 mots)

- H3 : MaPrimeRénov' — montants par tranche de revenus (tableau : modeste/intermédiaire/supérieur/très aisé × type de travaux)
- H3 : Certificats d'économie d'énergie (CEE) — comment les cumuler avec MaPrimeRénov'
- H3 : Éco-PTZ — prêt taux 0 jusqu'à 50 000 €
- H3 : Prime Coup de Pouce — bonus spécifique chauffage
- H3 : TVA à 5,5 % sur travaux d'efficacité énergétique
- **[INSERT : Simulateur d'aides interactif]** — CTA "Calculez vos aides en 2 minutes"

**H2** : Quels travaux prioriser selon votre DPE ? (~500 mots)

- H3 : Isolation des combles (ROI le plus rapide — économies dès 15 % sur facture)
- H3 : Pompe à chaleur air-eau — remplacement chaudière fioul/gaz
- H3 : Isolation extérieure ITE — pour les maisons classées F/G
- H3 : Double vitrage et menuiseries
- H3 : VMC double flux — qualité air intérieur + économies chauffage
- H3 : Tableau récap : travaux × économies estimées × aides maximales

**H2** : Pourquoi votre artisan doit être RGE ? (~300 mots)

- H3 : RGE obligatoire pour toutes les aides MaPrimeRénov' depuis 2014
- H3 : Quelles certifications RGE selon les travaux (Qualibat, QualiPAC, QualiBois...)
- H3 : Comment vérifier la certification RGE d'un artisan (lien annuaire ADEME)
- **[INSERT : Widget "Trouver un artisan RGE près de chez vous"]**

**H2** : Les étapes d'un projet de rénovation énergétique (~400 mots)

- H3 : Étape 1 — Audit énergétique (obligatoire pour aides > 5 000 €)
- H3 : Étape 2 — Choix des travaux et de l'artisan RGE
- H3 : Étape 3 — Dossier MaPrimeRénov' (Mon Accompagnateur Rénov')
- H3 : Étape 4 — Réalisation des travaux
- H3 : Étape 5 — Versement des aides après travaux

**H2** : Questions fréquentes sur la rénovation énergétique (FAQ schema) (~400 mots)

- Peut-on cumuler MaPrimeRénov' et les CEE ?
- Quel est le délai de versement de MaPrimeRénov' ?
- La rénovation globale est-elle plus avantageuse que des travaux par lots ?
- Mon accompagnateur Rénov' est-il obligatoire ?
- Que faire si mon artisan n'est plus RGE après les travaux ?

---

**Internal links recommandés** :

1. `/renovation-energetique/aides/maprimerenov-2026/` — ancre "MaPrimeRénov' 2026 : montants et conditions"
2. `/renovation-energetique/travaux/pompe-a-chaleur/` — ancre "pompe à chaleur : guide complet et prix"
3. `/artisans-rge/` — ancre "trouver un artisan RGE certifié"
4. `/renovation-energetique/diagnostic/audit-energetique-obligatoire/` — ancre "l'audit énergétique obligatoire"
5. `/blog/prix-pompe-a-chaleur-2026-aides/` — ancre "prix d'une pompe à chaleur en 2026"

**External trust links** :

- `france-renov.gouv.fr` — "site officiel France Rénov'"
- `anah.gouv.fr/maprimerenov/` — "conditions MaPrimeRénov' ANAH"
- `service-public.fr/particuliers/vosdroits/F35083` — "éco-PTZ service-public.fr"

**Schema.org** :

```json
{
  "@type": ["WebPage", "Guide"],
  "about": { "@type": "Service", "name": "Rénovation énergétique" },
  "hasPart": [{ "@type": "GovernmentService", "name": "MaPrimeRénov'" }],
  "author": {
    "@type": "Person",
    "name": "Prénom Nom",
    "jobTitle": "Expert rénovation énergétique"
  },
  "dateModified": "2026-04-01",
  "breadcrumb": true
}
```

**Assets à produire** :

- Infographie "Calendrier interdictions passoires thermiques 2025-2034"
- Tableau interactif aides selon revenus et type travaux (ou lien simulateur)
- Schéma "Parcours rénovation étape par étape"

**Auteur E-E-A-T** : Conseiller en rénovation énergétique, idéalement ex-ADEME ou Mon Accompagnateur Rénov'. Bio avec photo, LinkedIn, années d'expérience.  
**Date publication** : Semaine 1  
**Date review** : Octobre 2026 (budget MaPrimeRénov' peut changer en PLF)  
**Longueur cible** : 2 800 mots

---

#### BRIEF RE-02 — MaPrimeRénov' 2026 : montants, conditions, démarches

**URL** : `/renovation-energetique/aides/maprimerenov-2026/`  
**Titre SEO** : `MaPrimeRénov' 2026 : Montants, Conditions & Comment en Bénéficier`  
**Meta description** : `MaPrimeRénov' 2026 : découvrez vos montants selon vos revenus, les travaux éligibles et les démarches. Données officielles ANAH. Simulateur gratuit inclus.`

**KW principal** : `maprimerenov 2026` — vol 6 200, KD 45, intent Informationnel + YMYL  
**KW secondaires** :

- maprimerenov montants 2026 (2 800)
- maprimerenov conditions (2 100)
- prime renov eligibilite (1 900)
- maprimerenov parcours accompagne (1 400)
- maprimerenov travaux eligibles (1 200)
- comment demander maprimerenov (900)

**Position actuelle** : 26 (+4 trafic) — objectif top 5 en 8 semaines

**SERP features cibles** : Featured snippet (tableau montants), PAA (5 questions), Rich Result FAQ

---

**OUTLINE DÉTAILLÉE**

**H1** : MaPrimeRénov' 2026 : Tout Ce Qu'il Faut Savoir (Montants, Conditions, Démarches) (~150 mots intro avec mise à jour visible "Données actualisées avril 2026")

**H2** : Qu'est-ce que MaPrimeRénov' en 2026 ? (~300 mots)

- H3 : Définition et historique (ancienne CITE → MaPrimeRénov' depuis 2020)
- H3 : Deux parcours : Monogeste vs Parcours accompagné
- H3 : Qui gère MaPrimeRénov' ? (ANAH — Agence Nationale de l'Habitat)

**H2** : Quels sont les montants de MaPrimeRénov' en 2026 ? (~500 mots)

- H3 : Tableau complet montants par travaux ET par tranche de revenus
  - Tableau à 4 colonnes (revenus très modestes / modestes / intermédiaires / supérieurs) × 8 lignes (PAC air-eau, isolation combles, ITE, double vitrage, VMC, chauffe-eau thermodynamique, chaudière biomasse, audit énergétique)
  - Avec % aide et montant max en euros
- H3 : Plafond de travaux selon le type de logement
- H3 : Les plafonds de ressources 2026 (tableau zones A/B/C par nombre de personnes)
- **[INSERT : Simulateur aides — "Calculez votre aide personnalisée"]**

**H2** : Quelles conditions pour être éligible ? (~400 mots)

- H3 : Conditions liées au logement (résidence principale, > 15 ans, propriétaire/locataire)
- H3 : Conditions liées aux revenus (plafonds Anah 2026, justificatifs)
- H3 : Artisan RGE obligatoire : quelles certifications selon les travaux
- H3 : Délai de 5 ans entre deux demandes sur le même logement

**H2** : Quels travaux sont éligibles à MaPrimeRénov' ? (~400 mots)

- H3 : Travaux de chauffage (PAC, chaudière biomasse, chauffe-eau thermodynamique)
- H3 : Travaux d'isolation (combles, ITE, plancher bas)
- H3 : Menuiseries (fenêtres double vitrage — attention : non cumulable seul depuis 2024)
- H3 : Ventilation (VMC double flux)
- H3 : Ce qui N'est PAS éligible : cuisines, salles de bain, peinture, décoration

**H2** : Comment faire une demande de MaPrimeRénov' ? (~500 mots)

- H3 : Étape 1 — Créer votre compte sur maprimerenov.gouv.fr
- H3 : Étape 2 — Faire réaliser un devis par un artisan RGE
- H3 : Étape 3 — Déposer votre dossier en ligne (documents à fournir)
- H3 : Étape 4 — Validation et accord de principe
- H3 : Étape 5 — Travaux réalisés + facturation
- H3 : Étape 6 — Demande de solde et versement (délai : 2 à 6 mois)

**H2** : MaPrimeRénov' Parcours accompagné : la voie des gros travaux (~300 mots)

- H3 : Quand est-il obligatoire ? (rénovation d'ampleur = saut de 2 classes DPE)
- H3 : Qui est Mon Accompagnateur Rénov' (MAR) ?
- H3 : Aide majorée : jusqu'à 70 % des travaux pour les ménages modestes

**H2** : FAQ MaPrimeRénov' 2026 (schema FAQ) (~400 mots, 8 questions)

---

**Internal links** :

1. `/renovation-energetique/` — ancre "guide complet rénovation énergétique"
2. `/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix/` — ancre "prix pompe à chaleur air-eau éligible MaPrimeRénov'"
3. `/artisans-rge/` — ancre "trouver un artisan RGE pour votre dossier"
4. `/renovation-energetique/diagnostic/audit-energetique-obligatoire/` — ancre "audit énergétique — première étape"
5. `/renovation-energetique/aides/cee-certificats-economie-energie/` — ancre "cumuler avec les CEE"

**External trust links** :

- `maprimerenov.gouv.fr` — lien direct vers le portail officiel
- `anah.gouv.fr` — conditions et plafonds de ressources
- `france-renov.gouv.fr` — annuaire artisans RGE

**Schema.org** : `FAQPage` + `FinancialProduct` (MaPrimeRénov' comme produit financier) + `GovernmentService` + auteur identifié avec bio

**Assets** :

- Tableau montants MaPrimeRénov' 2026 (exportable PDF)
- Infographie "Les étapes de votre demande"
- Calculateur aide estimée (intégrer simulateur existant)

**Auteur E-E-A-T** : Expert en financement travaux / conseiller ADEME / MAR agréé. Disclaimer YMYL obligatoire : "Cette page est fournie à titre informatif. Les montants peuvent évoluer. Consultez maprimerenov.gouv.fr pour les données officielles à jour."  
**Date publication** : Semaine 1  
**Date review** : Tous les 3 mois (montants changeants)  
**Longueur cible** : 3 200 mots

---

#### BRIEF RE-03 — Pompe à chaleur air-eau : prix, aides, installateurs RGE

**URL** : `/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix/`  
**Titre SEO** : `Pompe à Chaleur Air-Eau 2026 : Prix, Aides MaPrimeRénov' & Installateurs RGE`  
**Meta description** : `Prix d'une pompe à chaleur air-eau en 2026 : de 8 000 à 18 000 € pose incluse. Aides jusqu'à 11 000 €. Trouvez un installateur QualiPAC certifié près de chez vous.`

**KW principal** : `pompe à chaleur air eau prix` — vol 30 000, KD 40, intent Commercial + Informationnel  
**KW secondaires** :

- pompe à chaleur prix (30 000 vol global)
- pac air eau installation (8 000)
- pac air eau aides (6 000)
- installateur pac RGE (3 000)
- pompe à chaleur maprimerenov (4 000)
- qualipac certification (800)
- pompe à chaleur air eau 2026 (2 000)

**SERP features cibles** : Featured snippet (tableau prix par puissance), PAA (6 questions prix/aides), Rich Result Review (avis installateurs)

---

**OUTLINE DÉTAILLÉE**

**H1** : Pompe à Chaleur Air-Eau en 2026 : Prix, Aides et Guide d'Achat Complet (~120 mots)

**H2** : Quel est le prix d'une pompe à chaleur air-eau en 2026 ? (~600 mots)

- H3 : Tableau prix par puissance (7 kW / 9 kW / 11 kW / 14 kW / 16 kW)
  - Colonnes : puissance | fourchette équipement | pose incluse | surface adaptée
  - Prix TTC fourniture + pose, fabricants de référence (Daikin, Atlantic, Mitsubishi, Viessmann, De Dietrich)
- H3 : Ce qui fait varier le prix
  - Type de plancher chauffant ou radiateurs haute température
  - Ballons tampon et zone climatique
  - Complexité de l'installation (dépose ancienne chaudière + raccordement)
- H3 : PAC air-eau vs PAC géothermie : quel choix pour quelle maison ?
- H3 : Durée de vie et coût de maintenance annuel (contrat entretien recommandé)

**H2** : Quelles aides pour financer votre PAC air-eau ? (~500 mots)

- H3 : MaPrimeRénov' 2026 — tableau montants par tranche de revenus
  - Modestes : jusqu'à 11 000 € (70 %)
  - Intermédiaires : jusqu'à 8 000 € (50 %)
  - Supérieurs : jusqu'à 4 000 € (25 %)
- H3 : Certificats d'économie d'énergie (CEE) — bonus Prime Coup de Pouce chauffage
- H3 : TVA à 5,5 % sur l'installation
- H3 : Cumul possible : exemple chiffré (maison 100 m², ménage modeste = 12 500 € d'aides sur 15 000 € de travaux)
- **[INSERT : Simulateur d'aides]** — CTA "Calculez vos aides en 2 minutes"

**H2** : Économies d'énergie réelles : ce que dit la data (~300 mots)

- H3 : COP moyen d'une PAC air-eau (COP 3 à 5 selon marque et conditions)
- H3 : Économies estimées vs chaudière fioul : exemple maison G → C
- H3 : Retour sur investissement : 4 à 8 ans avec aides

**H2** : L'installateur RGE QualiPAC : pourquoi c'est obligatoire (~300 mots)

- H3 : QualiPAC — la certification imposée pour toucher les aides
- H3 : Ce que garantit la certification (formation, assurance décennale)
- H3 : Comment vérifier le RGE d'un installateur (lien ADEME)
- **[INSERT : Widget artisans RGE QualiPAC dans votre ville]**

**H2** : Les étapes d'installation d'une PAC air-eau (~300 mots)

- H3 : Visite technique préalable (dimensionnement par calcul de déperditions)
- H3 : Installation (1 à 3 jours selon configuration)
- H3 : Mise en service et réglages
- H3 : Entretien annuel obligatoire (contrat recommandé)

**H2** : FAQ pompe à chaleur air-eau 2026 (8 questions — schema FAQ) (~400 mots)

- Une PAC air-eau peut-elle chauffer et rafraîchir ?
- La PAC fonctionne-t-elle par grand froid ?
- Faut-il un plancher chauffant ou peut-on garder les radiateurs ?
- Quel est le bruit d'une PAC air-eau ?

---

**Internal links** :

1. `/renovation-energetique/aides/maprimerenov-2026/` — ancre "montants MaPrimeRénov' pour une pompe à chaleur"
2. `/artisans-rge/` — ancre "installateur QualiPAC RGE certifié"
3. `/renovation-energetique/diagnostic/dpe/` — ancre "votre classe DPE actuelle"
4. `/blog/prix-pompe-a-chaleur-2026-aides/` — ancre "article complet prix PAC 2026"
5. `/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix/` — ancre "PAC air-air : l'alternative réversible"

**External trust links** :

- `france-renov.gouv.fr/les-aides-financieres/maprimerenov/` — montants officiels
- `qualipac.qualibat.com` — vérifier certification QualiPAC
- `anah.gouv.fr` — conditions éligibilité

**Schema.org** : `Product` (PAC) + `FAQPage` + `HowTo` (étapes installation) + `Review` agrégé si avis collectés

**Assets** :

- Tableau prix PAC par puissance kW (visuellement attrayant, exportable)
- Infographie "Comment fonctionne une PAC air-eau" (schéma technique)
- Calculateur ROI PAC (inputs : surface, classe DPE, revenus → sortie : aides + retour investissement)

**Auteur E-E-A-T** : Technicien certifié QualiPAC ou ingénieur thermique, avec référence à des projets réalisés  
**Date publication** : Semaine 2  
**Date review** : Octobre 2026 (budget MaPrimeRénov' PLF)  
**Longueur cible** : 3 000 mots

---

#### BRIEF RE-04 — Audit énergétique obligatoire 2026 : qui est concerné ?

**URL** : `/renovation-energetique/diagnostic/audit-energetique-obligatoire/`  
**Titre SEO** : `Audit Énergétique Obligatoire 2026 : Logements Concernés, Prix & Démarches`  
**Meta description** : `L'audit énergétique est obligatoire pour vendre une passoire thermique. Prix : 500-1 500 €. Qui est concerné ? Comment le faire prendre en charge ? Guide officiel.`

**KW principal** : `audit énergétique obligatoire` — vol 5 000, KD 20 (EASY WIN), intent Informationnel + YMYL  
**KW secondaires** :

- audit énergétique prix (3 500)
- audit énergétique maison (2 800)
- audit énergétique maprimerenov (2 000)
- audit energetique qui le fait (1 500)
- audit energetique vs DPE (1 200)
- diagnostiqueur énergétique (900)

**KD 20 = easy win prioritaire** : faible concurrence, volume correct, contexte réglementaire urgent

**SERP features cibles** : Featured snippet (définition + qui est concerné), PAA, position 1-3 en 6-8 semaines

---

**OUTLINE DÉTAILLÉE**

**H1** : Audit Énergétique Obligatoire en 2026 : Ce Qui Change et Comment S'y Conformer (~120 mots)

**H2** : Qu'est-ce que l'audit énergétique ? Différence avec le DPE (~300 mots)

- H3 : DPE (diagnostic) vs audit énergétique (recommandations de travaux) — tableau comparatif
- H3 : Qui peut réaliser un audit énergétique ? (certificat OPQIBI ou équivalent)
- H3 : Contenu d'un rapport d'audit énergétique

**H2** : Qui est obligé de faire un audit énergétique en 2026 ? (~400 mots)

- H3 : Vente de maisons individuelles classées F et G (depuis 2023)
- H3 : Extension aux immeubles collectifs (calendrier 2025-2026)
- H3 : MaPrimeRénov' Parcours accompagné (travaux > 5 000 €) — audit préalable obligatoire
- H3 : Tableau récap : situations → obligation ou recommandation

**H2** : Quel est le prix d'un audit énergétique ? (~300 mots)

- H3 : Fourchette : 500 € à 1 500 € selon surface et région
- H3 : Ce qui est inclus (rapport, scénarios travaux, estimation économies)
- H3 : MaPrimeRénov' rembourse l'audit : jusqu'à 500 € pour les ménages modestes

**H2** : Comment choisir son auditeur énergétique ? (~250 mots)

- H3 : Certifications à vérifier (OPQIBI, Qualibat, AFNOR...)
- H3 : Annuaire des auditeurs agréés (lien france-renov.gouv.fr)
- **[INSERT : Widget "Trouver un auditeur énergétique"]**

**H2** : Que faire après l'audit ? Prioriser ses travaux (~300 mots)

- H3 : Lire les 3 scénarios de travaux fournis
- H3 : Choisir l'ordre optimal (ROI + gain DPE)
- H3 : Déclencher les aides avec le rapport d'audit

**H2** : FAQ audit énergétique (6 questions) (~300 mots)

---

**Internal links** :

1. `/renovation-energetique/` — ancre "guide rénovation énergétique"
2. `/renovation-energetique/aides/maprimerenov-2026/` — ancre "MaPrimeRénov' Parcours accompagné"
3. `/renovation-energetique/diagnostic/dpe/` — ancre "différence audit et DPE"
4. `/artisans-rge/` — ancre "auditeurs énergétiques agréés"
5. `/renovation-energetique/passoires-thermiques/` — ancre "passoires thermiques : obligations 2025-2034"

**External trust links** :

- `france-renov.gouv.fr/audit-energetique/` — définition officielle
- `service-public.fr` — obligation légale à la vente
- `anah.gouv.fr` — financement audit via MaPrimeRénov'

**Schema.org** : `HowTo` (étapes obtenir un audit) + `FAQPage` + `GovernmentService`  
**Assets** : Tableau DPE vs audit, infographie calendrier obligations, calculateur coût audit selon surface  
**Auteur** : Diagnostiqueur certifié OPQIBI avec numéro de certification visible  
**Date publication** : Semaine 2  
**Date review** : Trimestrielle (obligations peuvent s'étendre)  
**Longueur cible** : 2 400 mots

---

#### BRIEF RE-05 — Isolation combles perdus : prix, aides, artisans

**URL** : `/renovation-energetique/travaux/isolation/combles/`  
**Titre SEO** : `Isolation Combles 2026 : Prix au m², Aides MaPrimeRénov' & Artisans Certifiés`  
**Meta description** : `Isolation des combles perdus en 2026 : 20 à 60 €/m² pose incluse. MaPrimeRénov' jusqu'à 75 % selon revenus. Devis gratuit artisans Qualibat RGE près de vous.`

**KW principal** : `isolation combles` — vol 15 000, KD 30, intent Commercial + Informationnel  
**KW secondaires** :

- isolation combles prix (8 000)
- isolation combles perdus (5 000)
- isolation combles maprimerenov (4 000)
- artisan isolation combles RGE (2 000)
- isolation thermique combles (3 000)
- prix isolation combles m2 (4 500)

**SERP features cibles** : Featured snippet (fourchette de prix au m²), PAA, Local Pack (artisans par ville)

---

**OUTLINE DÉTAILLÉE**

**H1** : Isolation des Combles en 2026 : Prix, Aides et Guide Pratique (~100 mots)

**H2** : Quel est le prix d'une isolation de combles perdus en 2026 ? (~500 mots)

- H3 : Tableau prix selon la technique
  - Soufflage laine minérale : 15-25 €/m²
  - Soufflage ouate de cellulose : 20-35 €/m²
  - Panneaux laine de bois : 40-60 €/m²
  - Colonnes : technique | fourchette/m² | R recommandé | durée intervention
- H3 : Prix total pour une maison type (80 m² de combles = 1 200 à 3 500 €)
- H3 : Ce qui fait varier le prix (accessibilité, état de l'existant, épaisseur cible)
- H3 : Devis gratuit : ce qu'il doit mentionner (surface, technique, R, marque produit)

**H2** : Quelles aides pour l'isolation des combles ? (~450 mots)

- H3 : MaPrimeRénov' combles perdus 2026 — tableau par tranche revenus
- H3 : CEE Coup de Pouce Rénovation — prime supplémentaire
- H3 : TVA à 5,5 %
- H3 : Exemple chiffré : 100 m² combles, ménage modeste → coût réel après aides
- **[INSERT : Simulateur aides combles]**

**H2** : Quel niveau d'isolation choisir ? (~300 mots)

- H3 : Résistance thermique R recommandée (R ≥ 7 en zone H1, R ≥ 6 en H2)
- H3 : Zones climatiques France (carte)
- H3 : Impact sur le DPE : gain de classes estimé

**H2** : Trouver un artisan qualibat RGE isolation combles (~250 mots)

- **[INSERT : Widget artisans isolation combles]**
- H3 : Certifications à vérifier (Qualibat 7141, Qualibat RGE)
- H3 : Questions à poser avant de signer un devis

**H2** : FAQ isolation combles (6 questions) (~300 mots)

---

**Internal links** :

1. `/renovation-energetique/aides/maprimerenov-2026/` — ancre "MaPrimeRénov' 2026 montants"
2. `/renovation-energetique/` — ancre "tous les travaux de rénovation éligibles"
3. `/renovation-energetique/travaux/isolation/exterieure-ite/` — ancre "isolation extérieure ITE : l'alternative"
4. `/blog/prix-isolation-combles-2026/` — ancre "article détaillé prix isolation 2026"
5. `/artisans-rge/` — ancre "artisans Qualibat RGE isolation"

**External trust links** :

- `france-renov.gouv.fr` — aides officielles isolation
- `anah.gouv.fr` — plafonds revenus MaPrimeRénov'
- `ademe.fr` — données techniques isolation

**Schema.org** : `HowToStep` (étapes isolation) + `Product` (types d'isolation) + `FAQPage`  
**Assets** : Tableau prix par technique, carte zones climatiques, calculateur économies selon R choisi  
**Auteur** : Artisan qualibat ou thermicien certifié  
**Date publication** : Semaine 3  
**Date review** : Semestrielle  
**Longueur cible** : 2 600 mots

---

#### BRIEF RE-06 — Hub Artisans RGE : trouver un professionnel certifié

**URL** : `/artisans-rge/`  
**Titre SEO** : `Artisans RGE Certifiés 2026 : Trouver un Pro Qualifié Près de Chez Vous`  
**Meta description** : `Annuaire artisans RGE certifiés : QualiPAC, Qualibat, QualiBois, Eco Artisan. Trouvez un professionnel agréé MaPrimeRénov' dans votre département. Données ADEME.`

**KW principal** : `artisan RGE` — vol 2 000, KD 15, intent Local + Commercial  
**KW secondaires** :

- trouver artisan RGE (1 500)
- artisan RGE certifié (1 200)
- pro RGE maprimerenov (900)
- chauffagiste RGE (800)
- plombier RGE (600)
- qualibat RGE (700)
- qualipac (400)

**Différenciation** : Seul annuaire avec données SIREN officielles + vérification RGE via API ADEME

---

**OUTLINE DÉTAILLÉE**

**H1** : Trouver un Artisan RGE Certifié : L'Annuaire Officiel 2026 (~100 mots)

**H2** : Qu'est-ce que la certification RGE ? (~350 mots)

- H3 : RGE = Reconnu Garant de l'Environnement (cadre réglementaire)
- H3 : Organismes certificateurs (Qualibat, QUALIFELEC, AFPAC, Cerqual...)
- H3 : Durée de validité (4 ans, renouvellement obligatoire)
- H3 : Différence RGE et "se dit RGE" : comment vérifier

**H2** : Les certifications RGE par type de travaux (~400 mots)

- Tableau : certification | travaux couverts | organisme
  - QualiPAC | PAC air-eau, air-air, géothermie | Qualibat
  - Qualibat 7141 | Isolation thermique par extérieur | Qualibat
  - Qualibat 7131 | Isolation combles, plancher | Qualibat
  - QualiBois | Poêles, inserts, chaudières bois | Qualibat
  - QUALIFELEC | Travaux électriques rénovation | QUALIFELEC
  - Eco Artisan | Multitravaux | CAPEB

**H2** : [WIDGET INTERACTIF] Trouvez votre artisan RGE (~100 mots + widget)

- Champ : département ou ville + type de travaux → liste artisans RGE vérifiés

**H2** : Pourquoi choisir un artisan RGE est obligatoire (~250 mots)

- H3 : Sans RGE, zéro aide (MaPrimeRénov', CEE) — exemple concret
- H3 : Responsabilité en cas de certification expirée

**H2** : Comment vérifier la certification RGE d'un artisan (~200 mots)

- H3 : Annuaire officiel ADEME (lien direct)
- H3 : Le numéro de qualification sur le devis
- H3 : Vérifier la date d'expiration

**H2** : FAQ artisans RGE (6 questions) (~300 mots)

---

**Internal links** :

1. `/renovation-energetique/` — ancre "guide rénovation énergétique"
2. `/renovation-energetique/aides/maprimerenov-2026/` — ancre "aides financières disponibles"
3. `/renovation-energetique/travaux/pompe-a-chaleur/` — ancre "pompe à chaleur — trouver un installateur QualiPAC"
4. `/renovation-energetique/travaux/isolation/combles/` — ancre "isolation combles — artisans certifiés"
5. `/blog/prix-pompe-a-chaleur-2026-aides/` — ancre "guide prix PAC 2026"

**External trust links** :

- `france-renov.gouv.fr/professionnels-de-la-renovation/` — liste officielle RGE
- `data.ademe.fr` — base de données ouverte artisans RGE
- `qualibat.com` — vérifier certification Qualibat

**Schema.org** : `Organization` (ServicesArtisans comme annuaire) + `LocalBusiness` pour chaque artisan listé + `Service` (mise en relation)  
**Assets** : Infographie "Les certifications RGE expliquées", tableau certifications × travaux, widget de recherche  
**Auteur** : Page institutionnelle (pas d'auteur individuel), footer "Données ADEME synchronisées mensuellement"  
**Date publication** : Semaine 2  
**Date review** : Mensuelle (sync API RGE)  
**Longueur cible** : 2 200 mots + widget

---

#### BRIEF RE-07 — CEE Certificats Économie Énergie : guide pratique

**URL** : `/renovation-energetique/aides/cee-certificats-economie-energie/`  
**Titre SEO** : `Primes CEE 2026 : Certificats d'Économie d'Énergie, Comment en Bénéficier`  
**Meta description** : `Les primes CEE 2026 vous permettent d'obtenir jusqu'à plusieurs milliers d'euros pour vos travaux d'économie d'énergie. Cumulables avec MaPrimeRénov'. Guide complet.`

**KW principal** : `prime CEE` — vol 5 000, KD 25, intent Informationnel + YMYL  
**KW secondaires** : certificats économie énergie (3 000), prime énergie (4 000), prime CEE 2026 (2 000), cumul maprimerenov CEE (1 500)

**Date publication** : Semaine 4 | **Longueur cible** : 2 200 mots

---

#### BRIEF RE-08 — DPE 2026 : tout comprendre sur le diagnostic de performance énergétique

**URL** : `/renovation-energetique/diagnostic/dpe/`  
**Titre SEO** : `DPE 2026 : Comprendre le Diagnostic de Performance Énergétique (A à G)`  
**Meta description** : `Le DPE est obligatoire pour vendre ou louer. Classes A à G, validité, coût (100-250 €), conséquences sur votre bien. Ce qui change en 2026. Guide complet.`

**KW principal** : `DPE` — vol 40 000, KD 50, intent Informationnel (compétitif mais incontournable comme hub)  
**KW secondaires** : diagnostic performance énergétique (20 000), DPE classe G (8 000), DPE obligatoire (6 000), DPE prix (5 000), DPE validité (4 000)

**Stratégie** : viser les PAA et featured snippet sur les questions basiques (coût, validité, classes), qui ont KD plus faible  
**Date publication** : Semaine 3 | **Longueur cible** : 2 800 mots

---

#### BRIEF RE-09 — Chaudière à condensation : prix, aides, remplacement

**URL** : `/renovation-energetique/travaux/chauffage/chaudiere-condensation/`  
**Titre SEO** : `Chaudière à Condensation 2026 : Prix, Aides & Remplacement de Chaudière Fioul`  
**Meta description** : `Prix d'une chaudière à condensation gaz : 3 000 à 7 000 € pose incluse. Remplacer une vieille chaudière fioul ou gaz avec MaPrimeRénov'. Artisans Qualigaz certifiés.`

**KW principal** : `chaudière condensation prix` — vol 12 000, KD 30, intent Commercial  
**KW secondaires** : chaudière condensation aides (5 000), remplacement chaudière (8 000), chaudière fioul interdite (4 000), Qualigaz (1 500)

**Date publication** : Semaine 4 | **Longueur cible** : 2 600 mots

---

#### BRIEF RE-10 — Passoires thermiques : interdictions location 2025-2034

**URL** : `/renovation-energetique/passoires-thermiques/interdiction-location-g-f/`  
**Titre SEO** : `Passoire Thermique : Interdiction Location 2025-2028-2034 — Que Faire ?`  
**Meta description** : `Propriétaires de logements G, F ou E : les interdictions de location arrivent. Classe G interdite depuis janvier 2025. Votre plan d'action pour conserver vos revenus locatifs.`

**KW principal** : `passoire thermique` — vol 8 000, KD 30, intent Informationnel + YMYL  
**KW secondaires** : logement G interdit location (5 000), passoire thermique location 2025 (4 000), DPE G travaux obligatoires (2 500)

**Angle unique** : guide "propriétaire bailleur" — angle de l'urgence business (perdre son loyer vs investir dans travaux)  
**Date publication** : Semaine 3 | **Longueur cible** : 2 400 mots

---

### BLOC B — RECONQUÊTE KW PERDUS (10 briefs)

---

#### BRIEF RK-01 — Hub Serrurier : trouver un serrurier de confiance en France

**URL** : `/serrurier/` (ou `/metiers/serrurier/` selon architecture)  
**Titre SEO** : `Serrurier en France : Trouver un Pro Agréé, Tarifs & Urgence 24h/24`  
**Meta description** : `Trouvez un serrurier agréé près de chez vous. Tarifs indicatifs : 80-300 €. Ouverture porte, changement serrure, installation blindée. Urgence 24h/24 disponible.`

**KW principal** : `serrurier` — vol 59 000, KD estimé 50+, intent Local + Transactionnel  
**KW secondaires** :

- serrurier pas cher (15 000)
- serrurier agréé (8 000)
- ouverture porte serrurier (12 000)
- tarif serrurier (10 000)
- serrurier urgence (1 200)
- changement serrure prix (6 000)

**Note** : Ce KW était en position 99 — le fix SSR le ramènera mécaniquement. Ce brief consolide avec un contenu de référence qui justifie une position durable.

**Angle unique** : Seul annuaire avec SIREN officiel + badge "artisan déclaré" — différenciateur vs ou-serrurier.fr et autres annuaires douteux (problème arnaque serrurier est endémique en France)

---

**OUTLINE DÉTAILLÉE**

**H1** : Trouver un Serrurier de Confiance en France : Annuaire, Tarifs et Urgence (~120 mots)

**H2** : Comment trouver un vrai serrurier agréé (et éviter les arnaques) (~500 mots)

- H3 : Le problème des faux serruriers en France (Que Choisir, DGCCRF — citer les chiffres)
- H3 : Les signaux d'un artisan de confiance : SIRET, assurance RCP, devis écrit
- H3 : Certifications sérieuses (A2P, ASSA ABLOY, FICHET agréé...)
- H3 : Que dit le décret n°2017-853 sur les devis obligatoires des serruriers ?
- **[INSERT : Widget recherche serrurier avec badge SIREN vérifié]**

**H2** : Quels sont les tarifs d'un serrurier en 2026 ? (~500 mots)

- H3 : Tableau : prestations × fourchette de prix TTC
  - Ouverture de porte sans dégât : 80-180 €
  - Ouverture avec dégât (forçage) : 150-350 €
  - Changement cylindre : 100-250 € selon marque
  - Installation serrure 3 points : 250-500 €
  - Blindage de porte : 800-2 500 €
- H3 : Majorations légales (nuit, dimanche, jours fériés : +50 à +100 %)
- H3 : Devis obligatoire : comment l'exiger et le lire
- H3 : Que faire si le serrurier refuse de donner un devis ?

**H2** : Les services d'un serrurier par catégorie (~400 mots)

- H3 : Serrurerie d'urgence (ouverture porte claquée, effraction)
- H3 : Serrurerie sécurité (blindage, serrures connectées, digicode)
- H3 : Serrurerie neuve (installation, remplacement fenêtre, volet)
- H3 : Copropriété et bailleur : travaux de serrurerie pris en charge ?

**H2** : Urgence serrurier : comment ça se passe ? (~300 mots)

- H3 : Délai d'intervention moyen (30 min à 2h selon ville)
- H3 : Ce que vous pouvez faire en attendant
- H3 : Lien vers les pages /urgence/ par ville
- **[INSERT : Liens rapides vers principales villes — Paris, Lyon, Marseille, Bordeaux...]**

**H2** : FAQ serrurier (8 questions) (~400 mots)

- Mon assurance habitation couvre-t-elle le serrurier ?
- Comment savoir si mon serrure est vraiment défectueuse ?
- Peut-on changer sa serrure soi-même ?

---

**Internal links** :

1. `/urgence/serrurier/paris/` — ancre "serrurier urgence Paris 24h/24"
2. `/urgence/serrurier/lyon/` — ancre "serrurier urgence Lyon"
3. `/tarifs/serrurier/paris/` — ancre "tarifs serrurier Paris 2026"
4. `/departements/nord/serrurier/` — ancre "serruriers département du Nord"
5. `/blog/prix-serrurier-2026/` — ancre "article complet prix serrurier"

**External trust links** :

- `service-public.fr` — réglementation devis serrurier
- `quechoisir.org` — alerte arnaques serruriers (signal trust fort)
- `economie.gouv.fr/dgccrf` — enquêtes DGCCRF sur le secteur

**Schema.org** : `LocalBusiness` (type "Locksmith") + `FAQPage` + `HowTo` (choisir un serrurier)  
**Assets** : Infographie "Comment éviter les faux serruriers", tableau tarifs visuels, checklist devis serrurier  
**Auteur** : Éditorial ServicesArtisans (page hub institutionnelle) + citation expert FNSA (Fédération Nationale de la Serrurerie)  
**Date publication** : Semaine 1 (priorité maximale — 59 000 vol/mois)  
**Date review** : Semestrielle  
**Longueur cible** : 2 800 mots

---

#### BRIEF RK-02 — Plombier Marseille : annuaire et tarifs

**URL** : `/services/plombier/marseille/`  
**Titre SEO** : `Plombier Marseille 2026 : Artisans Certifiés, Tarifs & Urgence 24h/24`  
**Meta description** : `Plombier à Marseille : fuite, dépannage, chauffe-eau, rénovation salle de bain. Tarifs : 50-100 €/h. Artisans avec SIRET vérifié. Urgence disponible.`

**KW principal** : `plombier marseille` — vol 2 200, KD estimé 35, intent Local + Transactionnel  
**KW secondaires** : plombier marseille urgence (800), plombier 13 (600), dépannage plomberie marseille (500), plombier marseille pas cher (400)

**Angle unique** : angle "RGE plombier" — plombier Marseille pour chauffe-eau thermodynamique, PAC eau chaude, éligible MaPrimeRénov'

**Date publication** : Semaine 2 | **Longueur cible** : 2 000 mots

---

#### BRIEF RK-03 — Serrurier Lyon : trouver un serrurier de confiance

**URL** : `/urgence/serrurier/lyon/`  
**Titre SEO** : `Serrurier Lyon 2026 : Urgence 24h/24, Tarifs & Artisans Agréés`  
**Meta description** : `Serrurier à Lyon disponible 24h/24. Ouverture porte : 80-180 €. Artisans SIRET vérifiés dans les 9 arrondissements. Devis gratuit avant intervention.`

**KW principal** : `serrurier lyon` — vol 3 100, KD 40, intent Local + Transactionnel  
**KW secondaires** : serrurier urgence lyon (1 200), serrurier lyon pas cher (900), serrurier lyon 6 (500), ouverture porte lyon (700)

**Date publication** : Semaine 1 | **Longueur cible** : 1 800 mots

---

#### BRIEF RK-04 — Couvreur Lille : artisans toiture Nord-Pas-de-Calais

**URL** : `/departements/nord/couvreur/`  
**Titre SEO** : `Couvreur Lille & Nord (59) : Artisans Toiture Certifiés, Devis Gratuit`  
**Meta description** : `Couvreur dans le Nord (59) : réparation toiture, ardoise, tuile, zinc, isolation toiture. Artisans qualifiés Qualibat. Devis gratuit sous 24h.`

**KW principal** : `couvreur lille` — vol 2 300, KD 30, intent Local + Commercial  
**KW secondaires** : couvreur nord (1 500), toiture lille (1 000), couvreur 59 (800), réparation toiture lille (700)

**Date publication** : Semaine 2 | **Longueur cible** : 1 800 mots

---

#### BRIEF RK-05 — Carreleur : trouver un carreleur professionnel

**URL** : `/metiers/carreleur/`  
**Titre SEO** : `Carreleur en France 2026 : Tarifs, Prestations & Trouver un Pro Qualifié`  
**Meta description** : `Trouvez un carreleur qualifié pour votre projet salle de bain, cuisine, terrasse. Tarifs : 40-90 €/m² pose. Artisans avec SIRET vérifié et garantie décennale.`

**KW principal** : `carreleur` — vol 5 600, KD 40, intent Local + Informationnel  
**KW secondaires** : prix carrelage m2 (2 200 — déjà en pos 17 !), carreleur pas cher (2 000), tarif carreleur (1 800), carreleur professionnel (1 500), pose carrelage prix (3 000)

**Note** : `prix carrelage m2` est déjà en position 17 — ce brief capitalise sur ce signal existant

**Date publication** : Semaine 1 | **Longueur cible** : 2 400 mots

---

#### BRIEF RK-06 — Électricien Lyon : travaux électricité et rénovation

**URL** : `/urgence/electricien/lyon/` + page complémentaire `/services/electricien/lyon/`  
**Titre SEO** : `Électricien Lyon 2026 : Dépannage, Mise aux Normes & Rénovation Électrique`  
**Meta description** : `Électricien à Lyon qualifié QUALIFELEC. Tableau électrique, prises, éclairage, mise aux normes NFC 15-100. Urgence disponible. SIRET vérifié.`

**KW principal** : `electricien lyon` — vol 1 300, KD 35, intent Local + Commercial  
**KW secondaires** : electricien urgence lyon (500), electricien lyon rénovation (400), mise aux normes electricité lyon (350), electricien RGE lyon (200)

**Angle** : angle "rénovation + RGE" (QUALIFELEC) — éligibilité aides pour pompe à chaleur électrique

**Date publication** : Semaine 3 | **Longueur cible** : 1 800 mots

---

#### BRIEF RK-07 — Plombier Rouen : reconquête urgente (seule vraie perte)

**URL** : `/devis/plombier/rouen/` + `/urgence/plombier/rouen/`  
**Titre SEO** : `Plombier Rouen 2026 : Urgence, Dépannage & Artisans Qualifiés (76)`  
**Meta description** : `Plombier à Rouen et Seine-Maritime (76) : fuite, chauffe-eau, salle de bain. Urgence 24h/24. Artisans SIRET vérifiés. Tarif horaire : 50-90 €/h.`

**KW principal** : `plombier rouen` — vol 1 000, SEULE vraie perte trafic (-50), urgence absolue  
**KW secondaires** : plombier 76 (600), plombier rouen urgence (400), dépanneur plomberie rouen (300)

**Date publication** : Semaine 1 (priorité max — récupération trafic perdu)  
**Longueur cible** : 1 600 mots

---

#### BRIEF RK-08 — Zingueur : guide complet métier et tarifs

**URL** : `/metiers/zingueur/`  
**Titre SEO** : `Zingueur 2026 : Tarifs, Prestations & Comment Trouver un Zingueur Qualifié`  
**Meta description** : `Le zingueur pose gouttières, chéneaux, couverture zinc, évacuations. Tarifs : 60-120 €/m². Artisans Qualibat zinc dans toute la France. Devis gratuit.`

**KW principal** : `zingueur` — vol 1 300, KD 25, intent Informationnel + Commercial  
**KW secondaires** : zingueur prix (800), zingueur toiture (600), couvreur zingueur (700), gouttière zinc prix (1 200), pose gouttière zinc (900)

**Date publication** : Semaine 3 | **Longueur cible** : 2 000 mots

---

#### BRIEF RK-09 — Couvreur Lorient & Morbihan : toiture Bretagne

**URL** : `/departements/morbihan/couvreur/`  
**Titre SEO** : `Couvreur Lorient & Morbihan (56) : Toiture, Ardoise & Devis Gratuit`  
**Meta description** : `Couvreur dans le Morbihan (56) : ardoise bretonne, tuile, zinc, isolation toiture. Artisans Qualibat locaux à Lorient, Vannes, Auray. Devis sous 24h.`

**KW principal** : `couvreur lorient` — vol 1 200, KD 20, intent Local + Commercial  
**KW secondaires** : couvreur morbihan (800), toiture lorient (600), couvreur 56 (500), ardoisier lorient (300)

**Date publication** : Semaine 3 | **Longueur cible** : 1 600 mots

---

#### BRIEF RK-10 — Serrurier Urgence : guide national ouverture de porte

**URL** : `/urgence/serrurier/` (hub urgence serrurier national)  
**Titre SEO** : `Serrurier Urgence 24h/24 : Ouverture Porte, Tarifs & Comment Éviter les Arnaques`  
**Meta description** : `Serrurier d'urgence disponible 24h/24 partout en France. Ouverture porte claquée ou blindée : 80-350 €. Devis obligatoire avant intervention. Artisans vérifiés SIRET.`

**KW principal** : `serrurier urgence` — vol 1 200, KD 35, intent Transactionnel  
**KW secondaires** : urgence serrurier nuit (600), serrurier nuit pas cher (500), ouverture porte urgence (800), serrurier week-end (400)

**Date publication** : Semaine 1 | **Longueur cible** : 2 000 mots

---

### BLOC C — BLOG PRIX (5 briefs)

---

#### BRIEF BP-01 — Prix pompe à chaleur 2026 : guide complet avec aides

**URL** : `/blog/prix-pompe-a-chaleur-2026-aides/`  
**Titre SEO** : `Prix d'une Pompe à Chaleur en 2026 : Tableau Complet, Aides & Économies`  
**Meta description** : `Prix pompe à chaleur 2026 : de 6 000 à 25 000 € selon le type. Avec MaPrimeRénov', votre reste-à-charge peut descendre à 2 000 €. Tableau complet + calculateur.`

**KW principal** : `prix pompe à chaleur` — vol 30 000+, KD 40, intent Informationnel + Commercial  
**KW secondaires** :

- pompe à chaleur prix 2026 (15 000)
- PAC air eau coût installation (8 000)
- pompe à chaleur maison prix (6 000)
- aide pompe à chaleur 2026 (5 000)
- prix pac géothermie (4 000)

**Rôle** : linkbait principal — reproduire succès de `/blog/prix-climaticien-2026-installation-entretien` qui attire des backlinks

**SERP features cibles** : Featured snippet (tableau prix), PAA (6 questions)

---

**OUTLINE DÉTAILLÉE**

**H1** : Prix d'une Pompe à Chaleur en 2026 : Le Guide Complet avec Toutes les Aides (~120 mots, inclure "mis à jour avril 2026")

**H2** : Tableau des prix selon le type de pompe à chaleur (~500 mots)

- H3 : PAC air-eau (la plus répandue)
  - Tableau : puissance (7-16 kW) × prix équipement × prix pose totale
- H3 : PAC air-air (réversible, clim + chauf)
  - Tableau : mono-split vs multi-split × surface couverte × prix
- H3 : PAC géothermique (la plus efficace)
  - Tableau : géothermie horizontale vs verticale × prix
- H3 : PAC eau-eau (nappe phréatique)

**H2** : Les aides pour financer votre pompe à chaleur en 2026 (~500 mots)

- H3 : MaPrimeRénov' 2026 : tableau par type PAC × tranche revenus
- H3 : Prime Coup de Pouce Chauffage CEE
- H3 : TVA à 5,5 %
- H3 : Éco-PTZ : complément pour le reste-à-charge
- H3 : Exemple chiffré : famille modeste, maison 120 m², PAC air-eau 12 kW → total aides vs prix réel

**H2** : Économies et retour sur investissement réel (~400 mots)

- H3 : Comparaison factures annuelles : chaudière gaz vs PAC (données ADEME)
- H3 : COP réel sur une saison complète (données terrain)
- H3 : Durée d'amortissement selon l'aide obtenue

**H2** : Comment choisir sa pompe à chaleur ? (~400 mots)

- H3 : Calcul de la puissance nécessaire (règle des 100 W/m² rénovés)
- H3 : PAC air-eau ou air-air : quel critère décide ?
- H3 : Marques fiables en 2026 (Daikin, Atlantic, Viessmann, Mitsubishi, Atlantic...)

**H2** : Les questions à poser à votre installateur avant de signer (~300 mots)

- 10 questions clés, réponses attendues

**H2** : FAQ prix pompe à chaleur 2026 (10 questions) (~500 mots)

---

**Internal links** :

1. `/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix/` — ancre "guide technique PAC air-eau"
2. `/renovation-energetique/aides/maprimerenov-2026/` — ancre "MaPrimeRénov' 2026 : conditions et montants"
3. `/artisans-rge/` — ancre "trouver un installateur QualiPAC"
4. `/blog/prix-chaudiere-condensation-2026/` — ancre "comparer avec le prix d'une chaudière à condensation"
5. `/renovation-energetique/diagnostic/dpe/` — ancre "connaître votre DPE avant d'investir"

**External trust links** :

- `france-renov.gouv.fr` — aides officielles PAC
- `ademe.fr` — données COP et économies
- `anah.gouv.fr` — plafonds ressources

**Schema.org** : `Article` + `FAQPage` + `HowTo` (choisir sa PAC) + auteur avec bio  
**Assets** : Tableau prix PAC (format tableau + infographie), calculateur ROI interactif, comparatif marques  
**Auteur** : Ingénieur thermique ou expert PAC avec 5+ ans d'expérience, bio complète  
**Date publication** : Semaine 2  
**Date review** : Octobre 2026 (budget MaPrimeRénov' PLF)  
**Longueur cible** : 3 500 mots

---

#### BRIEF BP-02 — Prix isolation combles 2026

**URL** : `/blog/prix-isolation-combles-2026/`  
**Titre SEO** : `Prix Isolation Combles 2026 : Soufflage, Laine, Ouate — Devis & Aides`  
**Meta description** : `Prix isolation combles 2026 : 15 à 60 €/m² selon la technique. MaPrimeRénov' jusqu'à 75 %. Tout savoir sur les aides, les matériaux et les artisans. Guide complet.`

**KW principal** : `prix isolation combles 2026` — vol 4 500 (consolidation de plusieurs variantes)  
**KW secondaires** : isolation combles soufflage prix (3 000), isolation combles ouate cellulose prix (2 000), prix isolation thermique combles (2 500)

**Date publication** : Semaine 3 | **Longueur cible** : 3 000 mots

**Outline rapide** :

- H2 : Tableau prix par technique (soufflage laine minérale, ouate, panneaux)
- H2 : Aides disponibles 2026 (MaPrimeRénov', CEE, TVA)
- H2 : Calculateur : combien économisez-vous sur vos factures ?
- H2 : Choisir le bon matériau (laine minérale vs ouate vs laine de bois)
- H2 : Questions à votre artisan avant de signer
- H2 : FAQ 10 questions

---

#### BRIEF BP-03 — Prix chaudière à condensation 2026

**URL** : `/blog/prix-chaudiere-condensation-2026/`  
**Titre SEO** : `Prix Chaudière à Condensation 2026 : Gaz, Fioul, Installation & Aides`  
**Meta description** : `Chaudière à condensation 2026 : 3 000 à 7 000 € pose incluse. Aides disponibles si vous remplacez une chaudière fioul. Artisans Qualigaz près de chez vous.`

**KW principal** : `prix chaudière condensation` — vol 12 000, KD 30  
**KW secondaires** : chaudière condensation prix installation (6 000), chaudière gaz prix 2026 (4 000), aides chaudière condensation (3 000), Qualigaz (1 500)

**Date publication** : Semaine 4 | **Longueur cible** : 3 000 mots

---

#### BRIEF BP-04 — Prix audit énergétique 2026

**URL** : `/blog/prix-audit-energetique-2026/`  
**Titre SEO** : `Prix d'un Audit Énergétique en 2026 : De 500 à 1 500 € — Pris en Charge ?`  
**Meta description** : `Combien coûte un audit énergétique en 2026 ? Entre 500 et 1 500 € selon la surface. Comment le faire financer par MaPrimeRénov'. Guide complet avec exemples.`

**KW principal** : `prix audit énergétique` — vol 3 500, KD 20 (easy win — doublon opportunité avec RE-04)  
**KW secondaires** : coût audit énergétique (2 000), audit énergétique combien ça coûte (1 500)

**Date publication** : Semaine 4 | **Longueur cible** : 2 200 mots

---

#### BRIEF BP-05 — Prix serrurier 2026 : tarifs et arnaques à éviter

**URL** : `/blog/prix-serrurier-2026/`  
**Titre SEO** : `Prix Serrurier 2026 : Tarifs Officiels, Devis & Arnaques à Connaître`  
**Meta description** : `Serrurier en 2026 : ouverture porte de 80 à 350 €, changement serrure de 100 à 500 €. Comment obtenir un devis légal ? Arnaques fréquentes et comment les éviter.`

**KW principal** : `prix serrurier` — vol 10 000+, KD 35, intent Commercial  
**KW secondaires** : tarif serrurier (8 000), serrurier pas cher (6 000), devis serrurier (3 000), prix ouverture porte (4 000)

**Rôle double** : linkbait (reproductible sur médias généralistes "dossier arnaques serrurier") + signal confiance ServicesArtisans

**Date publication** : Semaine 2 | **Longueur cible** : 3 200 mots

---

### BLOC D — HUBS STRATÉGIQUES (5 briefs)

---

#### BRIEF HB-01 — Hub `/renovation-energetique/aides/` (page index)

**URL** : `/renovation-energetique/aides/`  
**Titre SEO** : `Aides à la Rénovation Énergétique 2026 : Tous les Dispositifs Expliqués`  
**Meta description** : `MaPrimeRénov', CEE, éco-PTZ, Prime Coup de Pouce, TVA 5,5 % : toutes les aides pour rénover en 2026. Guide officiel avec simulateur et conditions d'éligibilité.`

**KW principal** : `aides rénovation énergétique 2026` — vol 8 000, KD 35  
**KW secondaires** : financement rénovation maison (5 000), aides état rénovation (4 000), subventions rénovation 2026 (3 000)

**Rôle** : page index regroupant tous les briefs RE sous forme de navigation (pillar page pour le cluster "aides")  
**Date publication** : Semaine 1 (prérequis pour briefs RE)  
**Longueur cible** : 2 000 mots + cards vers chaque aide

---

#### BRIEF HB-02 — Hub `/artisans-rge/` (déjà inclus en RE-06)

_Voir BRIEF RE-06 ci-dessus._

---

#### BRIEF HB-03 — Hub Urgence Serrurier National

_Voir BRIEF RK-10 ci-dessus._

---

#### BRIEF HB-04 — Simulateur Aides Rénovation (landing page dédiée)

**URL** : `/simulateur-aides/`  
**Titre SEO** : `Simulateur Aides Rénovation Énergétique 2026 : Calculez Votre Aide Gratuite`  
**Meta description** : `Calculez en 2 minutes vos aides MaPrimeRénov' et CEE selon vos revenus, votre logement et vos travaux. Simulateur gratuit, sans inscription, données ANAH officielles.`

**KW principal** : `simulateur aide rénovation` — vol 4 000, KD 25  
**KW secondaires** : calculer aide rénovation (3 000), simulateur maprimerenov (2 500), estimation aide isolation (1 500)

**Note technique** : cette page utilise le simulateur Pipedrive existant (`/api/simulateur/submit`) — elle est principalement une landing SEO qui encapsule l'outil.

**Date publication** : Semaine 1 (simulateur déjà en prod — juste la landing SEO)  
**Longueur cible** : 800 mots autour du widget + 1 section FAQ 6 questions

---

#### BRIEF HB-05 — Guide MaPrimeRénov' 2026 (renforcement page existante)

**URL** : `/guides/maprimerenov-2026/` (page existante — position 26, +4 trafic)  
**Titre SEO** : `MaPrimeRénov' 2026 : Guide Complet, Montants & Nouveautés (Mis à Jour)`  
**Meta description** : `Ma Prime Rénov' 2026 : les montants, les changements par rapport à 2025, les travaux éligibles et les démarches étape par étape. Données officielles actualisées.`

**KW principal** : `ma prime renov 2026` — vol 6 200, pos 26 ACTUELLE → objectif top 5  
**KW secondaires** : maprimerenov 2026 montants (3 000), nouveautes maprimerenov 2026 (2 000), ma prime renov plafonds 2026 (1 500)

**Action** : amélioration de la page existante (pas une nouvelle page) — enrichir avec tableau montants, FAQ schema, internal links vers RE-02, auteur identifié, date mise à jour visible

**Date publication** : Semaine 1 (amélioration urgente — page déjà rankée)  
**Longueur cible** : 2 800 mots (upgrade depuis version actuelle)

---

## PARTIE 3 — CALENDRIER ÉDITORIAL 12 SEMAINES

### Légende

- CW = Content Writer in-house
- FL = Freelance spécialisé
- R = Review editor (SEO lead)
- D = Dev (pour widgets/simulateurs)

---

### SEMAINE 1 (21-27 avril 2026) — Fondations et quick wins

| Priorité | Brief                                          | Assigné         | Deadline | Review |
| -------- | ---------------------------------------------- | --------------- | -------- | ------ |
| 1        | Améliorer `/guides/maprimerenov-2026/` (HB-05) | CW              | 23/04    | 25/04  |
| 2        | Hub `/renovation-energetique/aides/` (HB-04)   | CW              | 24/04    | 26/04  |
| 3        | Hub `/renovation-energetique/` (RE-01)         | FL expert rénov | 26/04    | 28/04  |
| 4        | `/serrurier/` hub (RK-01)                      | CW              | 25/04    | 27/04  |
| 5        | `/urgence/serrurier/lyon/` (RK-03)             | CW              | 25/04    | 27/04  |
| 6        | `/blog/prix-serrurier-2026/` (BP-05)           | CW              | 27/04    | 30/04  |
| 7        | `/urgence/serrurier/` national (RK-10)         | CW              | 26/04    | 28/04  |
| 8        | `/devis/plombier/rouen/` rebuild (RK-07)       | CW              | 24/04    | 26/04  |
| 9        | `/simulateur-aides/` landing (HB-04)           | CW + D          | 27/04    | 29/04  |

**Note** : Semaine 1 = volume élevé car pages courtes (hubs + pages locales) + 1 article blog. Fix SSR doit être déployé avant ou simultanément.

---

### SEMAINE 2 (28 avril - 4 mai 2026) — Rénovation énergétique P1

| Priorité | Brief                            | Assigné        | Deadline | Review |
| -------- | -------------------------------- | -------------- | -------- | ------ |
| 1        | MaPrimeRénov' 2026 guide (RE-02) | FL expert YMYL | 01/05    | 03/05  |
| 2        | Hub artisans RGE (RE-06)         | CW + D         | 30/04    | 02/05  |
| 3        | Prix PAC 2026 blog (BP-01)       | FL expert PAC  | 02/05    | 04/05  |
| 4        | Plombier Marseille (RK-02)       | CW             | 30/04    | 02/05  |
| 5        | Couvreur Lille (RK-04)           | CW             | 01/05    | 03/05  |
| 6        | Carreleur hub (RK-05)            | CW             | 02/05    | 04/05  |

---

### SEMAINE 3 (5-11 mai 2026) — Rénovation technique + locaux

| Priorité | Brief                                 | Assigné             | Deadline | Review |
| -------- | ------------------------------------- | ------------------- | -------- | ------ |
| 1        | PAC air-eau guide (RE-03)             | FL expert thermique | 08/05    | 10/05  |
| 2        | Audit énergétique obligatoire (RE-04) | FL expert OPQIBI    | 07/05    | 09/05  |
| 3        | Passoires thermiques guide (RE-10)    | FL immobilier       | 09/05    | 11/05  |
| 4        | DPE guide (RE-08)                     | FL expert diag      | 10/05    | 12/05  |
| 5        | Isolation combles guide (RE-05)       | FL isolation        | 09/05    | 11/05  |
| 6        | Prix isolation combles blog (BP-02)   | FL isolation        | 10/05    | 12/05  |
| 7        | Électricien Lyon (RK-06)              | CW                  | 08/05    | 10/05  |
| 8        | Zingueur hub (RK-08)                  | CW                  | 09/05    | 11/05  |
| 9        | Couvreur Lorient (RK-09)              | CW                  | 09/05    | 11/05  |

---

### SEMAINE 4 (12-18 mai 2026) — Finalisation briefs + montée en charge

| Priorité | Brief                                | Assigné         | Deadline | Review |
| -------- | ------------------------------------ | --------------- | -------- | ------ |
| 1        | CEE guide (RE-07)                    | FL expert aides | 14/05    | 16/05  |
| 2        | Chaudière condensation guide (RE-09) | FL chauffagiste | 15/05    | 17/05  |
| 3        | Prix chaudière blog (BP-03)          | FL chauffagiste | 16/05    | 18/05  |
| 4        | Prix audit énergétique blog (BP-04)  | FL expert diag  | 16/05    | 18/05  |

---

### SEMAINES 5-8 (mai-juin 2026) — Scale pSEO et linkbuilding

**Production pSEO** :

- Multiplier `/urgence/[metier]/[ville]` : 50 nouvelles pages (top 50 villes × 5 métiers prioritaires)
- Multiplier `/departements/[dept]/[metier]` : 30 pages manquantes
- 13 pages `/aides/[region]/renovation/`

**Linkbuilding** :

- Identifier tous les sites qui linkent `/blog/prix-climaticien-2026` et `/blog/prix-electricien-2026`
- Outreach pitch : "Nous avons publié le guide prix le plus complet sur [métier]"
- Cibler presse locale (Ouest-France, La Voix du Nord) sur angle passoires thermiques locales

---

### SEMAINES 9-12 (juillet 2026) — Pages départementales MaPrimeRénov'

**Production** :

- 96 pages `/aides/[dept]/maprimerenov/` (template + données locales spécifiques)
- 96 pages `/aides/[dept]/cee/`
- Audit interne : vérification tous les briefs publiés, mise à jour si besoin

---

## PARTIE 4 — TEMPLATES pSEO RÉUTILISABLES

### Template A — Urgence métier + ville

```markdown
# {{metier_majuscule}} {{ville_nom}} : Urgence 24h/24, Tarifs & Artisans Vérifiés

[INTRO 80 mots : contexte local, disponibilité]

## Comment trouver un {{metier}} disponible rapidement à {{ville_nom}} ?

[Widget artisans + CTA appel]

## Tarifs {{metier}} à {{ville_nom}} en {{annee}}

| Prestation       | Fourchette TTC   |
| ---------------- | ---------------- |
| {{prestation_1}} | {{fourchette_1}} |
| {{prestation_2}} | {{fourchette_2}} |

[3-5 lignes selon métier]

Source : tarifs constatés auprès de {{nb_artisans}} artisans à {{ville_nom}}.

## Zones d'intervention {{ville_nom}} et alentours

[Liste communes voisines avec liens internes]
{{communes_voisines}}

## Pourquoi choisir un {{metier}} avec SIRET vérifié ?

[150 mots sur signal trust SIREN]

## FAQ {{metier}} {{ville_nom}} (4 questions)

**Quel est le délai d'intervention d'un {{metier}} à {{ville_nom}} ?**
En général, {{delai_intervention}} selon la disponibilité.
[etc.]

---

_Page mise à jour le {{date_maj}}. {{nb_artisans}} {{metier_pluriel}} référencés à {{ville_nom}} et dans un rayon de {{rayon_km}} km._
```

**Variables à interpoler** : `metier`, `ville_nom`, `ville_slug`, `dept_nom`, `nb_artisans`, `fourchette_prix_1`, `fourchette_prix_2`, `delai_intervention`, `date_maj`, `rayon_km`, `communes_voisines`

---

### Template B — Département + métier

```markdown
# {{metier_pluriel_majuscule}} en {{dept_nom}} ({{dept_code}}) : Annuaire & Devis Gratuit

[INTRO 100 mots : spécificités locales du département]

## {{nb_artisans}} {{metier_pluriel}} référencés en {{dept_nom}}

[Widget carte + liste paginée]

## Principales villes du {{dept_nom}} pour trouver un {{metier}}

- [**{{ville_1}}**](/services/{{metier_slug}}/{{ville_1_slug}}/) — {{nb_artisans_ville_1}} artisans
- [**{{ville_2}}**](/services/{{metier_slug}}/{{ville_2_slug}}/) — {{nb_artisans_ville_2}} artisans
  [5-8 villes principales]

## Tarifs moyens d'un {{metier}} en {{dept_nom}}

[Tableau fourchettes adaptées selon zone (rural/urbain)]

## Spécificités locales

[100 mots sur contexte local : type de logements, particularités climate, réglementations locales si pertinentes]

## {{metier_pluriel}} RGE en {{dept_nom}}

[Si applicable — artisans certifiés pour aides]

## FAQ {{metier}} {{dept_nom}} (4 questions)
```

---

### Template C — Article blog prix

```markdown
# Prix [Métier/Prestation] en {{annee}} : Tableau Complet, Aides & Ce Qui Fait Varier le Coût

_Mis à jour le {{date_maj}} — par {{auteur_prenom}} {{auteur_nom}}, {{auteur_titre}}_

[INTRO 150 mots : pourquoi ce guide, ce que vous allez trouver]

## Tableau des prix {{service}} en {{annee}}

[TABLEAU PRINCIPAL — élément le plus important, doit être en haut]

| Prestation  | Fourchette basse | Fourchette haute | Inclut       |
| ----------- | ---------------- | ---------------- | ------------ |
| {{prest_1}} | {{prix_min_1}}   | {{prix_max_1}}   | {{detail_1}} |

[...]

_Prix TTC, pose incluse, région parisienne en référence. Majoration de 10-20 % possible hors IDF._

## Ce qui fait varier le prix

[3-5 facteurs : taille, région, complexité, urgence, marque]

## Les aides disponibles en {{annee}}

[Section aides avec tableau si applicable]
[INSERT simulateur]

## Comment obtenir le meilleur devis ?

[5 conseils pratiques]

## Questions fréquentes (FAQ)

[8-12 questions en schema FAQ]

---

**Sources** : [liens officiels]  
**Auteur** : [bio courte avec photo et lien profil]  
**Dernière mise à jour** : {{date_maj}}  
**Prochaine révision prévue** : {{date_review}}
```

---

## PARTIE 5 — GUIDELINES RÉDACTIONNELLES E-E-A-T YMYL

### 5.1 Classification YMYL et niveau de rigueur

| Type de contenu                        | Niveau YMYL | Exigences                                              |
| -------------------------------------- | ----------- | ------------------------------------------------------ |
| Prix artisans locaux                   | Faible      | Sources locales, fourchettes honnêtes                  |
| Aides financières (MaPrimeRénov', CEE) | **Élevé**   | Sources officielles obligatoires, disclaimer, date MAJ |
| Obligations légales (DPE, audit)       | **Élevé**   | Textes de loi cités, liens service-public.fr           |
| Santé/sécurité (électricité, gaz)      | **Élevé**   | Normes NFC/NF citées, certifications professionnelles  |
| Guides techniques (isolation, PAC)     | Moyen-Élevé | Données techniques vérifiées, auteur qualifié          |

### 5.2 Auteur identifié — règle absolue pour YMYL

Chaque page YMYL **doit** avoir :

1. **Nom complet** de l'auteur (pas de pseudonyme)
2. **Photo** (signal confiance)
3. **Titre professionnel** précis (ex. : "Conseillère ADEME, 8 ans d'expérience en rénovation énergétique")
4. **Lien LinkedIn** ou profil vérifiable
5. **Date de publication** et **date de dernière mise à jour** (visible, pas cachée)
6. **Processus de review** mentionné si possible ("revu par un expert ANAH")

**Disclaimer YMYL obligatoire** (à inclure en bas de chaque page aides) :

> "Cette page est fournie à titre informatif uniquement. Les montants des aides et les conditions d'éligibilité peuvent évoluer. Consultez toujours maprimerenov.gouv.fr ou anah.gouv.fr pour les informations officielles à jour. ServicesArtisans n'est pas mandaté par l'État et ne garantit pas l'exactitude des montants publiés."

### 5.3 Sources officielles — règle d'utilisation

| Thème                     | Source obligatoire | Lien                      |
| ------------------------- | ------------------ | ------------------------- |
| MaPrimeRénov' montants    | ANAH               | anah.gouv.fr/maprimerenov |
| Liste artisans RGE        | ADEME              | france-renov.gouv.fr      |
| Obligations DPE/audit     | Service-public     | service-public.fr         |
| CEE                       | Ministère Énergie  | ecologie.gouv.fr          |
| Réglementation serruriers | DGCCRF             | economie.gouv.fr/dgccrf   |
| Décennale, assurances     | Ministère Justice  | justice.fr                |

**Règle** : au moins **2 liens sortants officiels** par page YMYL, dans le corps du texte (pas juste en fin d'article).

### 5.4 Anti-patterns à éviter absolument (Google section 4.6.5 et 4.6.6)

- Générer des centaines de pages avec texte quasi-identique (juste le nom de ville changé) sans valeur locale ajoutée
- Republier des données officielles sans analyse ni valeur ajoutée
- Créer des pages de prix sans source vérifiable des chiffres
- Rédiger en IA sans relecture et sans vérification des montants d'aides
- Oublier de mettre à jour les montants après changement de budget (PLF)

### 5.5 People-first content — test en 5 questions

Avant de publier chaque brief, vérifier :

1. Ce contenu aide-t-il réellement quelqu'un à prendre une décision ?
2. Quelqu'un qui lit cet article a-t-il moins besoin d'aller sur google.fr après ?
3. Les chiffres sont-ils sourcés et à jour ?
4. Y a-t-il une vraie valeur ajoutée par rapport à ce que font les concurrents ?
5. Le lecteur sait-il clairement quoi faire après avoir lu (CTA clair) ?

Si une réponse est "non" → réécrire avant publication.

---

## PARTIE 6 — CHECKLIST QUALITÉ PRÉ-PUBLICATION (28 points)

### Technique (8 points)

- [ ] Title tag : 50-70 caractères, KW principal inclus
- [ ] Meta description : 140-160 caractères, CTA implicite, KW inclus
- [ ] URL : tirets, pas de caractères spéciaux, KW dans le slug
- [ ] H1 unique sur la page, correspond au KW principal
- [ ] Structure H1 > H2 > H3 respectée (pas de saut de niveau)
- [ ] Schema.org implémenté et validé via Rich Results Test
- [ ] Image alt text sur toutes les images (KW contextuel, pas keyword stuffing)
- [ ] Internal links : 3-5 liens internes pertinents avec ancres descriptives

### Contenu (10 points)

- [ ] KW principal dans H1, premier paragraphe, une H2, une H3
- [ ] KW secondaires distribués naturellement dans le texte
- [ ] Longueur cible respectée (± 20 %)
- [ ] Tous les H2 de l'outline présents et développés
- [ ] Tableau de données présent si brief l'indique
- [ ] FAQ implémentée avec schema FAQ si indiqué
- [ ] Simulateur/widget inséré aux emplacements indiqués dans le brief
- [ ] Pas de duplication avec d'autres pages du site (KW cible unique)
- [ ] Texte lisible niveau B1-B2 (phrases courtes, peu de jargon non expliqué)
- [ ] Contenu original (pas de copier-coller de sources officielles)

### E-E-A-T et YMYL (6 points)

- [ ] Auteur identifié avec nom, titre et photo (pages YMYL)
- [ ] Date de publication et date de mise à jour visibles
- [ ] Disclaimer YMYL en bas de page (pages aides financières)
- [ ] Au moins 2 liens sortants vers sources officielles dans le corps
- [ ] Montants et données vérifiés contre sources officielles à jour
- [ ] Aucune affirmation non sourcée sur des montants d'aides

### Conversion (4 points)

- [ ] CTA principal clair et above the fold (ou dans le premier H2)
- [ ] Widget artisans ou simulateur intégré à l'endroit prescrit
- [ ] CTA secondaire en bas de page
- [ ] Numéro d'urgence prominent sur pages `/urgence/*`

---

## PARTIE 7 — INTERNAL LINKING STRATEGY

### 7.1 Règles structurelles

**Hub → Spoke** : Chaque page hub renvoie vers toutes ses sous-pages (spoke) dans une section de navigation dédiée.

```
/renovation-energetique/ → /renovation-energetique/aides/maprimerenov-2026/
                         → /renovation-energetique/travaux/pompe-a-chaleur/
                         → /artisans-rge/
                         → /simulateur-aides/
```

**Spoke → Hub** : Chaque page spoke revient vers le hub en début et en fin de page.

```
/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix/
  → "Guide complet rénovation énergétique" (/renovation-energetique/)
  → "Toutes les aides disponibles" (/renovation-energetique/aides/)
```

**Spoke → Spoke (sibling)** : Pages du même cluster se lient entre elles via sections "Lire aussi".

```
/renovation-energetique/travaux/isolation/combles/
  → "Isolation extérieure ITE : l'alternative" (/renovation-energetique/travaux/isolation/exterieure-ite/)
  → "Prix isolation combles 2026" (/blog/prix-isolation-combles-2026/)
```

**Blog → Hub** : Chaque article blog renvoie vers la page guide correspondante.

```
/blog/prix-pompe-a-chaleur-2026-aides/
  → /renovation-energetique/travaux/pompe-a-chaleur/ (guide technique)
  → /renovation-energetique/aides/maprimerenov-2026/ (aides)
  → /artisans-rge/ (trouver un pro)
```

### 7.2 Règles d'ancres

- **Ancres descriptives** avec KW : "pompe à chaleur air-eau : guide complet 2026" (pas "cliquez ici")
- **Variation des ancres** sur un même KW destination (Google interprète les variantes)
- **Pas d'ancre exacte répétée** plus de 2 fois vers la même destination
- **Ancres naturelles** intégrées dans le texte, pas de "Voir aussi : XXX" systématique

### 7.3 Priorités de maillage (les 10 liens les plus importants à établir en semaine 1-2)

| Source                                     | Destination                                                     | Ancre                                            | Priorité |
| ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------ | -------- |
| Homepage                                   | `/renovation-energetique/`                                      | "Rénovation énergétique — aides et artisans RGE" | 1        |
| Homepage                                   | `/artisans-rge/`                                                | "Trouver un artisan RGE certifié"                | 1        |
| `/renovation-energetique/`                 | `/renovation-energetique/aides/maprimerenov-2026/`              | "MaPrimeRénov' 2026 : montants et conditions"    | 2        |
| `/renovation-energetique/`                 | `/simulateur-aides/`                                            | "Calculez vos aides en 2 minutes"                | 2        |
| `/guides/maprimerenov-2026/`               | `/renovation-energetique/aides/maprimerenov-2026/`              | "Guide complet MaPrimeRénov' 2026"               | 2        |
| `/serrurier/`                              | `/urgence/serrurier/paris/`                                     | "Serrurier urgence Paris 24h/24"                 | 3        |
| `/serrurier/`                              | `/blog/prix-serrurier-2026/`                                    | "Tous les tarifs serrurier en 2026"              | 3        |
| Toutes pages `/urgence/serrurier/[ville]/` | `/serrurier/`                                                   | "Guide complet serrurier — tarifs et conseils"   | 3        |
| `/blog/prix-pompe-a-chaleur-2026-aides/`   | `/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix/` | "Guide technique pompe à chaleur air-eau"        | 3        |
| `/artisans-rge/`                           | `/renovation-energetique/aides/maprimerenov-2026/`              | "Conditions MaPrimeRénov' 2026"                  | 3        |

---

## PARTIE 8 — INTÉGRATION DU SIMULATEUR AIDES

### 8.1 Positionnement du simulateur dans le contenu

Le simulateur `/api/simulateur/submit` (canal Pipedrive `simulateur-aides`) est un actif de conversion existant. Il doit être inséré stratégiquement dans chaque page rénovation énergétique.

**Règle** : le simulateur doit apparaître **dans le premier tiers de la page** sur les pages aides (pas en footer).

| Page                                                            | Position                    | CTA texte                                        |
| --------------------------------------------------------------- | --------------------------- | ------------------------------------------------ |
| `/renovation-energetique/`                                      | Après H2 "Quelles aides ?"  | "Calculez vos aides personnalisées — 2 minutes"  |
| `/renovation-energetique/aides/maprimerenov-2026/`              | Après tableau montants      | "Calculez votre MaPrimeRénov' selon vos revenus" |
| `/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix/` | Après H2 "Quelles aides"    | "Combien d'aides pour votre PAC ?"               |
| `/simulateur-aides/`                                            | Au-dessus du fold (hero)    | "Calculez vos aides en 2 minutes"                |
| `/artisans-rge/`                                                | Avant la liste artisans     | "D'abord, calculez vos aides disponibles"        |
| Chaque article `/blog/prix-*`                                   | Section "Aides disponibles" | "Utilisez notre simulateur"                      |

### 8.2 Micro-engagements avant le simulateur

Pour augmenter le taux de completion, préparer l'utilisateur avec un ancrage :

- Montrer le gain potentiel avant le formulaire : "Des ménages comme vous ont obtenu en moyenne 8 500 € d'aides"
- Rassurer sur la confidentialité : "Aucun compte requis — aucune relance commerciale sans votre accord"
- Mentionner la durée : "2 minutes — 6 questions"

### 8.3 CTA secondaire (pour non-convertis)

Pour ceux qui ne lancent pas le simulateur, proposer :

- "Télécharger le guide MaPrimeRénov' 2026" (lead magnet léger)
- "Recevoir une liste d'artisans RGE dans votre département" (email capture)

---

## PARTIE 9 — MESURE DU SUCCÈS PAR TYPE DE PAGE

### 9.1 Métriques cibles à 3, 6 et 12 mois

#### Pages `/renovation-energetique/` (hub)

| Métrique                   | 3 mois | 6 mois | 12 mois |
| -------------------------- | ------ | ------ | ------- |
| Trafic organique/mois      | 500    | 3 000  | 10 000  |
| Position KW principal      | Top 20 | Top 10 | Top 5   |
| Backlinks gagnés           | 5      | 15     | 30      |
| Taux conversion simulateur | 3 %    | 5 %    | 7 %     |

#### Articles `/blog/prix-*`

| Métrique                            | 3 mois | 6 mois | 12 mois |
| ----------------------------------- | ------ | ------ | ------- |
| Trafic organique/mois (par article) | 300    | 1 500  | 5 000   |
| Backlinks par article               | 2      | 8      | 15      |
| Position KW principal               | Top 20 | Top 10 | Top 5   |
| CTR moyen (GSC)                     | 3 %    | 4 %    | 5 %     |

#### Pages `/urgence/[metier]/[ville]/`

| Métrique                         | 3 mois | 6 mois | 12 mois |
| -------------------------------- | ------ | ------ | ------- |
| Trafic organique/mois (par page) | 20     | 80     | 200     |
| Position médiane                 | Top 10 | Top 5  | Top 3   |
| Taux conversion (appel/devis)    | 5 %    | 8 %    | 10 %    |
| Nombre de pages rankant          | 10     | 30     | 60      |

#### Pages `/departements/[dept]/[metier]/`

| Métrique                         | 3 mois | 6 mois | 12 mois |
| -------------------------------- | ------ | ------ | ------- |
| Trafic organique/mois (par page) | 10     | 40     | 120     |
| Position médiane                 | Top 10 | Top 5  | Top 3   |
| Nombre de pages rankant          | 20     | 50     | 100     |

### 9.2 KPIs globaux site — objectifs 12 semaines

| KPI                                      | Actuel       | Objectif S12  |
| ---------------------------------------- | ------------ | ------------- |
| KW total en positions                    | 261          | 600           |
| Trafic Ahrefs/jour                       | 164          | 500           |
| Pages `/urgence/*` rankant               | 2-3          | 20+           |
| Position `serrurier`                     | out (99→out) | Top 50        |
| Position `maprimerenov 2026`             | 26           | Top 10        |
| Position `plombier rouen`                | out          | Top 10        |
| Position `audit énergétique obligatoire` | 0            | Top 5 (KD 20) |
| Backlinks totaux                         | 11 pages     | 25+ pages     |

### 9.3 Tracking en pratique

- **GA4** : créer segment "rénovation énergétique" (landing page contains `/renovation-energetique/`)
- **GSC** : filter par query sur cluster "maprimerenov", cluster "pompe à chaleur", cluster "serrurier"
- **Ahrefs Rank Tracker** : 50 KW cibles prioritaires (les 30 KW de ce plan + 20 KW pSEO)
- **Pipedrive** : conversions canal `simulateur-aides` vs canal `devis`
- **Review mensuelle** : chaque page publiée vs objectif de trafic à 30j / 60j / 90j

---

## PARTIE 10 — CALENDRIER DE REFRESH

Les pages rénovation énergétique sont soumises à des changements réglementaires fréquents. La date de mise à jour visible est un signal E-E-A-T crucial.

### 10.1 Fréquences de mise à jour obligatoires

| Type de page            | Fréquence refresh                       | Déclencheurs                            |
| ----------------------- | --------------------------------------- | --------------------------------------- |
| MaPrimeRénov' montants  | **Mensuelle** (ou dès changement)       | PLF, communiqué ANAH, circulaire        |
| CEE montants primes     | Trimestrielle                           | Arrêtés préfectoraux, fin bonification  |
| Passoires thermiques    | Semestrielle                            | Nouvelles décisions de justice, décrets |
| DPE classes             | Annuelle                                | Méthode 3CL, décisions gouvernementales |
| Prix artisans           | Semestrielle                            | Inflation, nouveaux tarifs syndicaux    |
| Pages urgence + locales | Annuelle                                | Mise à jour données artisans DB         |
| Articles blog prix      | Annuelle (décembre pour année suivante) | Révision globale avant mois de janvier  |

### 10.2 Process de mise à jour

1. **Monitoring** : Google Alert sur "MaPrimeRénov' + changement" + newsletter ANAH
2. **Signal de déclenchement** : tout changement de montant ou condition
3. **Mise à jour en < 48h** : modifier les données, changer la date de MAJ
4. **Resoumettre** dans GSC via "Demander l'indexation" après modification
5. **Annoter** dans GA4 (date changement = corrélation trafic)

### 10.3 Alerte rouge — modifications urgentes

Si MaPrimeRénov' change de montants (PLF annuel, généralement octobre-novembre) :

- **Toutes les pages concernées** doivent être mises à jour avant le 1er janvier
- Le disclaimer YMYL devient encore plus important pendant la période de transition
- Ajouter un encart "Attention : montants en cours de révision pour 2027" si applicable

---

## SYNTHÈSE — TABLEAU DE BORD ÉDITORIAL

### Les 30 briefs — vue d'ensemble

| #     | Brief                         | URL                                                                       | KW principal                  | Vol    | KD  | Semaine | KW unique |
| ----- | ----------------------------- | ------------------------------------------------------------------------- | ----------------------------- | ------ | --- | ------- | --------- |
| RE-01 | Hub rénovation énergétique    | `/renovation-energetique/`                                                | rénovation énergétique        | 10 000 | 40  | S1      | ✅        |
| RE-02 | MaPrimeRénov' 2026            | `/renovation-energetique/aides/maprimerenov-2026/`                        | maprimerenov 2026             | 6 200  | 45  | S2      | ✅        |
| RE-03 | PAC air-eau prix              | `/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix/`           | pompe à chaleur air eau prix  | 30 000 | 40  | S3      | ✅        |
| RE-04 | Audit énergétique obligatoire | `/renovation-energetique/diagnostic/audit-energetique-obligatoire/`       | audit énergétique obligatoire | 5 000  | 20  | S3      | ✅        |
| RE-05 | Isolation combles             | `/renovation-energetique/travaux/isolation/combles/`                      | isolation combles             | 15 000 | 30  | S3      | ✅        |
| RE-06 | Hub artisans RGE              | `/artisans-rge/`                                                          | artisan RGE                   | 2 000  | 15  | S2      | ✅        |
| RE-07 | CEE guide                     | `/renovation-energetique/aides/cee-certificats-economie-energie/`         | prime CEE                     | 5 000  | 25  | S4      | ✅        |
| RE-08 | DPE guide                     | `/renovation-energetique/diagnostic/dpe/`                                 | DPE                           | 40 000 | 50  | S3      | ✅        |
| RE-09 | Chaudière condensation        | `/renovation-energetique/travaux/chauffage/chaudiere-condensation/`       | chaudière condensation prix   | 12 000 | 30  | S4      | ✅        |
| RE-10 | Passoires thermiques          | `/renovation-energetique/passoires-thermiques/interdiction-location-g-f/` | passoire thermique            | 8 000  | 30  | S3      | ✅        |
| RK-01 | Hub serrurier                 | `/serrurier/`                                                             | serrurier                     | 59 000 | 50  | S1      | ✅        |
| RK-02 | Plombier Marseille            | `/services/plombier/marseille/`                                           | plombier marseille            | 2 200  | 35  | S2      | ✅        |
| RK-03 | Serrurier Lyon                | `/urgence/serrurier/lyon/`                                                | serrurier lyon                | 3 100  | 40  | S1      | ✅        |
| RK-04 | Couvreur Lille                | `/departements/nord/couvreur/`                                            | couvreur lille                | 2 300  | 30  | S2      | ✅        |
| RK-05 | Carreleur hub                 | `/metiers/carreleur/`                                                     | carreleur                     | 5 600  | 40  | S1      | ✅        |
| RK-06 | Électricien Lyon              | `/urgence/electricien/lyon/`                                              | electricien lyon              | 1 300  | 35  | S3      | ✅        |
| RK-07 | Plombier Rouen (rebuild)      | `/urgence/plombier/rouen/`                                                | plombier rouen                | 1 000  | 30  | S1      | ✅        |
| RK-08 | Zingueur                      | `/metiers/zingueur/`                                                      | zingueur                      | 1 300  | 25  | S3      | ✅        |
| RK-09 | Couvreur Lorient              | `/departements/morbihan/couvreur/`                                        | couvreur lorient              | 1 200  | 20  | S3      | ✅        |
| RK-10 | Serrurier Urgence national    | `/urgence/serrurier/`                                                     | serrurier urgence             | 1 200  | 35  | S1      | ✅        |
| BP-01 | Prix PAC 2026                 | `/blog/prix-pompe-a-chaleur-2026-aides/`                                  | prix pompe à chaleur          | 30 000 | 40  | S2      | ✅        |
| BP-02 | Prix isolation combles        | `/blog/prix-isolation-combles-2026/`                                      | prix isolation combles 2026   | 4 500  | 25  | S3      | ✅        |
| BP-03 | Prix chaudière                | `/blog/prix-chaudiere-condensation-2026/`                                 | prix chaudière condensation   | 12 000 | 30  | S4      | ✅        |
| BP-04 | Prix audit énergétique        | `/blog/prix-audit-energetique-2026/`                                      | prix audit énergétique        | 3 500  | 20  | S4      | ✅        |
| BP-05 | Prix serrurier                | `/blog/prix-serrurier-2026/`                                              | prix serrurier                | 10 000 | 35  | S2      | ✅        |
| HB-01 | Hub aides                     | `/renovation-energetique/aides/`                                          | aides rénovation 2026         | 8 000  | 35  | S1      | ✅        |
| HB-02 | Hub artisans RGE              | voir RE-06                                                                | —                             | —      | —   | S2      | ✅        |
| HB-03 | Hub urgence serrurier         | voir RK-10                                                                | —                             | —      | —   | S1      | ✅        |
| HB-04 | Simulateur aides landing      | `/simulateur-aides/`                                                      | simulateur aide rénovation    | 4 000  | 25  | S1      | ✅        |
| HB-05 | Upgrade guide MPR existant    | `/guides/maprimerenov-2026/`                                              | ma prime renov 2026           | 6 200  | 45  | S1      | ✅        |

**Vérification anti-cannibalisation** : 30 KW cibles uniques — aucun doublon (RE-02 cible "maprimerenov 2026" / HB-05 cible "ma prime renov 2026" = variantes distinctes avec intents légèrement différents, URL différentes, aucun conflit).

---

## ANNEXE — RESSOURCES POUR LES RÉDACTEURS

### Sources officielles bookmarkées (à consulter avant chaque brief YMYL)

1. **maprimerenov.gouv.fr** — portail officiel + FAQ
2. **anah.gouv.fr/maprimerenov** — conditions et plafonds ressources
3. **france-renov.gouv.fr** — annuaire RGE + guides travaux
4. **service-public.fr/particuliers/vosdroits** — obligations légales
5. **ecologie.gouv.fr/aides-renovation-energetique** — aperçu toutes aides
6. **data.ademe.fr** — données ouvertes artisans RGE (API)
7. **qualibat.com** — vérification certifications Qualibat
8. **economie.gouv.fr/dgccrf** — alertes et enquêtes secteur BTP

### Glossaire termes clés (pour cohérence rédactionnelle)

| Terme                     | Utilisation correcte                  | À éviter                      |
| ------------------------- | ------------------------------------- | ----------------------------- |
| MaPrimeRénov'             | Toujours avec apostrophe et majuscule | "ma prime renov", "MPR" seul  |
| RGE                       | Reconnu Garant de l'Environnement     | "agrément RGE", "label RGE"   |
| DPE                       | Diagnostic de performance énergétique | "bilan DPE" (pléonasme)       |
| Artisan                   | Toujours en minuscule                 | "artisan"                     |
| SIRET/SIREN               | Majuscules, sans tirets               | "Siret", "numéro siret"       |
| Éco-PTZ                   | Avec trait d'union                    | "eco PTZ", "éco prêt"         |
| Mon Accompagnateur Rénov' | Avec majuscules et apostrophe         | "MAR" seul (première mention) |

---

_Document généré le 18 avril 2026. Prochain review global : 18 juillet 2026._  
_Toute modification des montants MaPrimeRénov' ou nouvelles réglementations déclenche un update immédiat de la section concernée._
