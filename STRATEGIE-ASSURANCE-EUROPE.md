# Stratégie Réseau Comparateur Assurance Europe

> Document de référence — Version 3.0 — 2026-03-21
> Mis à jour après analyse scientifique de 8 licornes (Wise, Canva, NerdWallet, Check24, Facile.it, MoneySuperMarket, PolicyBazaar) + audit 6 axes (Firefly/Google, Revenue, Tech, Data, Legal, Compétition)

---

## Table des matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Périmètre : 10 pays, 7 verticales, 2.3M pages robustes](#2-périmètre)
3. [Architecture des URLs : 12 couches par verticale](#3-architecture-des-urls)
4. [Architecture Technique : Moteur 5 couches](#4-architecture-technique)
5. [Schéma Base de Données](#5-schéma-base-de-données)
6. [Data Moat : Sources de données par pays](#6-data-moat)
7. [Stratégie SEO & Sitemaps](#7-stratégie-seo--sitemaps)
7bis. [Performance & Vitesse Serveur](#7bis-performance--vitesse-serveur)
8. [Réglementation & Légal par pays](#8-réglementation--légal-par-pays)
9. [Intégrations assureurs](#9-intégrations-assureurs)
10. [i18n — Internationalisation & Multilingue](#10-i18n--internationalisation--multilingue)
11. [Scripts d'import de données](#11-scripts-dimport-de-données)
12. [Monitoring production](#12-monitoring-production)
13. [Stack Technique & Infrastructure](#13-stack-technique)
14. [Stratégie de Déploiement : 1 domaine par pays](#14-stratégie-de-déploiement)
15. [Comparaison avec ServicesArtisans](#15-comparaison-avec-servicesartisans)
16. [Roadmap & Phases](#16-roadmap--phases)
17. [Risques & Mitigations](#17-risques--mitigations)
18. [Analyse Concurrentielle](#18-analyse-concurrentielle)

---

## 1. Vision & Positionnement

### Concept
Réseau de 10 sites de comparaison d'assurance (ccTLD par pays) couvrant 10 pays européens, avec :
- **Comparateur fonctionnel day one** (devis en temps réel)
- **2.3M pages data-rich** enrichies de 26+ sources gouvernementales vérifiées
- **Data moat par agrégation croisée** : personne en Europe ne croise ces données sur 10 pays

### Modèle opérationnel — 3 phases
```
Phase 1 (Day one) : SEO + Comparateur → Leads → Courtiers grossistes (partage commission)
Phase 2 (M12-M18) : Comparateur propre avec données de devis → data moat irréplicable
Phase 3 (M24-M36) : Propre produit d'assurance (MGA marque blanche)
```
**Pas de téléphone.** Le comparateur est self-service, le courtier grossiste rappelle le client.

### Différenciateur clé — Ce que PERSONNE ne fait
| Avantage | Check24 | Facile.it | NerdWallet | **Ce projet** |
|---|---|---|---|---|
| Multi-pays (10) | ❌ (DE) | ❌ (IT) | ❌ (US) | **✅** |
| Comparateur day one | ✅ | ✅ | ❌ | **✅** |
| Données gouv croisées 26+ sources | ❌ | ❌ | ❌ | **✅** |
| Données cross-pays | ❌ | ❌ | ❌ | **✅** |
| ORIAS + LPS 10 pays | ❌ | ❌ | ❌ | **✅** |

### Opérateur
Courtier en assurance enregistré **ORIAS** + **passeport européen LPS** (Libre Prestation de Services, directive IDD 2016/97) notifié via l'ACPR pour les 9 autres pays. Pas un simple affilié.

### Cible
- **2.3M pages** (10 domaines expirés DA 30-50, soumission sitemap progressive ~20K/semaine/domaine)
- **10 pays européens** (1 domaine = 1 pays, ouverture quand l'API est prête)
- **7 verticales** par pays (5-6 pour petits marchés)
- **7 langues**
- Codebase estimée : **120-160K lignes** (monorepo Turborepo, moteur générique partagé)

### Validation scientifique
Analyse de 8 licornes du SEO programmatique (Wise $11B, Canva $42B, NerdWallet $1.2B, Check24 €5.4B, Facile.it €1.05B, MoneySuperMarket £1B+, PolicyBazaar $7.3B) :
- **Le volume de pages ne corrèle PAS avec la valorisation** (NerdWallet 14K pages = $1.2B, Canva 190K = $42B)
- **Le moat vient des données propriétaires**, pas du nombre de pages
- **Le comparateur fonctionnel sur chaque page** = pattern Wise (dailyGoodClicks maximal)
- **Le cercle vertueux Facile.it** : trafic → devis → données → contenu → trafic (activé day one grâce au comparateur)

### Track record
130K pages indexées en 33 jours sur ServicesArtisans (domaine 15 ans, DA élevé). Le pattern d'indexation est prouvé.

### Stratégie domaines expirés DA 30-50
- **Domaine neuf** : DA 0, crawl lent, 10-20% indexé mois 1, 6-12 mois pour ranker
- **Domaine expiré DA 30-50** : milliers de backlinks existants, Googlebot revient par habitude, 35-45% indexé mois 1, positions en semaines
- **ServicesArtisans** (référence) : 122K indexées en 35 jours = 3 500 pages/jour, position moyenne 16 dès indexation
- Les domaines expirés DA 30-50 reproduisent ce comportement : Google fait confiance immédiatement

---

## 2. Périmètre

### 10 Pays cibles — 2.3M pages robustes sur domaines expirés DA 30-50

| # | Pays | Domaine (ccTLD) | Langue | Pages | Couches principales | Sources vérifiées |
|---|------|-----------------|--------|-------|--------------------|--------------------|
| 1 | **France** | comparateur-assurance.fr | fr | **880K** | 36K communes × 7 vert. × 3 intents (756K) + profils/besoins/assureurs/contenu (124K) | Géorisques, DVF, DPE, ONISR, GASPAR, INSEE, DREES, Ameli, SIV |
| 2 | **Allemagne** | versicherungsvergleich.de | de | **380K** | 11K Gemeinden × 7 × 3 (231K) + 8K PLZ × 3 vert. (24K) + Ortsteile (21K) + extras (104K) | GDV Typklassen, Destatis, KBA, KfZ-Zulassung |
| 3 | **Italie** | confronta-assicurazioni.it | it | **280K** | 7.9K comuni × 7 × 3 (166K) + Cat Nat obligatoire (16K) + zones sismiques (8K) + extras (90K) | ISTAT, IVASS, ISPRA, ACI |
| 4 | **Espagne** | comparador-seguros.es | es | **270K** | 8.1K municipios × 7 × 3 (170K) + decesos (16K) + barrios (13K) + extras (71K) | INE, DGT, Consorcio |
| 5 | **Autriche** | versicherungsvergleich.at | de | **100K** | 2K Gemeinden × 6 × 3 (38K) + 5K Ortschaften × 3 × 2 (30K) + extras (32K) | Statistik Austria, HORA |
| 6 | **Portugal** | comparador-seguros.pt | pt | **90K** | 3K freguesias × 6 × 3 (56K) + municípios hubs (6K) + expat (1K) + extras (27K) | INE PT, ASF, IMT |
| 7 | **Irlande** | insurance-comparator.ie | en | **85K** | 3.4K EDs × 5 × 3 (52K) + 800 towns × 5 × 2 (8K) + extras (25K) | CSO, OPW, RSA/Garda |
| 8 | **Belgique** | comparateur-assurance.be | fr/nl | **80K** | 565 communes × 6 × 3 × 1.7 bilingue (17K) + 1.5K anc. communes (27K) + extras ×2 (36K) | Statbel, FSMA |
| 9 | **Pays-Bas** | verzekeringsvergelijker.nl | nl | **75K** | 2.5K woonplaatsen × 6 × 3 (45K) + zorgverzekering depth (15K) + extras (15K) | CBS, Kadaster/BAG, RDW |
| 10 | **Luxembourg** | comparateur-assurance.lu | fr | **35K** | 600 localités × 5 × 3 (9K) × 2.5 langues (23K) + frontaliers/contenu (12K) | STATEC, CAA |
| | **TOTAL** | | **7 langues** | **~2.3M** | **3+ données uniques par page, 0 thin content** | **26+ sources vérifiées** |

### Détail des 12 couches — Modèle France (880K pages)

| Couche | Formule | Pages | Données sources |
|--------|---------|-------|-----------------|
| **A** Commune × Verticale × Intent | 36K × 7 × 3 (service/tarifs/devis) | **756 000** | INSEE, ONISR, DVF, Géorisques — 5-15 data points/commune |
| **B** Avis × Villes > 2K hab | 5K villes × 7 | **35 000** | Notes, retours, satisfaction par assureur |
| **C** Département × Profil | 101 × 7 × 10 profils | **7 070** | ONISR par tranche d'âge, DREES par profil, INSEE par CSP |
| **D** Top villes × Profil | 300 × 7 × 8 | **16 800** | Croisement données commune + profil département |
| **E** Département × Besoin | 101 × 7 × 6 | **4 242** | SIV motorisation, INSEE logement, Ameli soins |
| **F** Top villes × Besoin | 300 × 7 × 6 | **12 600** | Croisement ville + besoin (parc électrique, bornes...) |
| **G** Assureur × Département | 40 × 101 × 3 vert. majeures | **12 120** | Tarifs réels par zone tarifaire + sinistralité |
| **H** Assureur × Top villes | 40 × 200 × 3 | **24 000** | Croisement tarif assureur + données locales |
| **I** Hubs géographiques | 101 dép. + 18 régions × 7 | **833** | Agrégations département/région |
| **J** Contenu éditorial | Guides + FAQ + blog + baromètres + glossaire + calc. | **2 400** | Expertise rédactionnelle + données nationales |
| **K** Comparatifs / Classements | "meilleure" × dép/région/national | **861** | Rankings assureurs par zone |
| **L** Quartiers grandes villes | 30 villes × 10 quartiers × 7 × 2 | **4 200** | DVF + criminalité par quartier |
| | **TOTAL FRANCE** | **876 126** | **≈ 880K** |

> Ce modèle 12 couches s'adapte à chaque pays en remplaçant les unités géo (comuni, municipios, Gemeinden, etc.) et les sources de données locales.

### Masse critique par domaine

| Catégorie | Pays | Seuil | Atteint |
|-----------|------|-------|---------|
| **Grand** | FR, DE, IT, ES | 200K+ | ✅ 880K, 380K, 280K, 270K |
| **Moyen** | AT, PT, IE, BE, NL | 70K+ | ✅ 100K, 90K, 85K, 80K, 75K |
| **Petit** | LU | 30K+ | ✅ 35K |

> Chaque domaine dépasse sa masse critique SEO. Le plus petit (LU 35K) reste robuste grâce au trilinguisme (fr/de/en) et aux frontaliers.

### Projection d'indexation — Domaines expirés DA 30-50

| Pays | Pages | Mois 1 (39%) | Mois 3 (69%) | Mois 6 (84%) |
|------|-------|-------------|-------------|-------------|
| France | 880K | 350K | 615K | 750K |
| Allemagne | 380K | 150K | 265K | 325K |
| Italie | 280K | 110K | 195K | 240K |
| Espagne | 270K | 108K | 190K | 230K |
| Autriche | 100K | 40K | 70K | 85K |
| Portugal | 90K | 36K | 63K | 77K |
| Irlande | 85K | 34K | 60K | 72K |
| Belgique | 80K | 32K | 56K | 68K |
| Pays-Bas | 75K | 30K | 52K | 64K |
| Luxembourg | 35K | 14K | 24K | 30K |
| **TOTAL** | **2.3M** | **904K** | **1.59M** | **1.94M** |

> Référence : ServicesArtisans (domaine 15 ans) = 40% indexé en 35 jours. Domaines expirés DA 30-50 = comportement similaire (35-45%).

> **Calibrage v4** : 29.7M (v1) → 1.5M (v2) → 1.7M (v3) → **2.3M (v4)**. Évolution v3→v4 :
> - FR : 560K → 880K — modèle 12 couches complet (commune × vert. × 3 intents = 756K base)
> - DE : 325K → 380K — Ortsteile + PLZ croisés Typklassen
> - IT : 245K → 280K — Cat Nat obligatoire + zones sismiques × comuni
> - ES : 224K → 270K — barrios + seguros de decesos (verticale unique ES)
> - Tous les petits pays recalibrés avec couches profils/besoins/assureurs
> - **Hypothèse clé** : domaines expirés DA 30-50 → indexation rapide (35-45% mois 1)
> - **Principe directeur** : ≥3 data points par page ou la page n'existe pas
> - **2.3M pages data-backed avec comparateur fonctionnel > 29.7M pages template vides**

### Ordre de lancement (1 pays = 1 API prête)

| Phase | Pays | Raison | Timeline |
|---|---|---|---|
| **M0** | **France** | ORIAS, 5 sources communales, marché connu | Day one |
| **M1** | **Portugal** | Marché vierge (8/10), INE API simple | Quand API prête |
| **M2** | **Belgique** | Pas de leader digital (7/10), francophone | Quand Statbel branchée |
| **M3** | **Espagne + Luxembourg** | ES en croissance, LU = extension FR/BE | Quand INE ES prête |
| **M4** | **Italie** | Gros marché, ISTAT API ok | Quand ISTAT branchée |
| **M5** | **Irlande** | CSO API clean, anglophone | Quand CSO prête |
| **M6** | **Pays-Bas** | CBS = meilleure API d'Europe, mais AFM strict | Quand CBS branchée |
| **M7** | **Autriche** | StatAT partiellement payant | Quand négocié |
| **M8** | **Allemagne** | GDV = PDF à scraper, Check24 = mur | En dernier |

### 5-7 Verticales (variable par pays)

| Verticale | Slug FR | Sources données locales | Revenue/lead estimé |
|-----------|---------|----------------------|-------------------|
| Auto | assurance-auto | ONISR, SIV, GDV, DGT, ACI | €8-15 |
| Habitation | assurance-habitation | DVF, DPE, Géorisques, CatNat, HORA | €6-12 |
| Santé/Mutuelle | mutuelle-sante | DREES, Ameli, densité médecins | €15-30 |
| Pro/RC | assurance-professionnelle | SIRENE, densité entreprises | €20-50 |
| Vie/Prévoyance | assurance-vie | Espérance de vie, revenus, patrimoine | €25-60 |
| Voyage | assurance-voyage | Destinations, risques pays | €2-5 |
| Emprunteur | assurance-emprunteur | DVF, taux BdF/ANIL | €40-120 |

---

## 3. Architecture des URLs

### 12 couches par verticale

Chaque verticale génère 12 types de pages, multipliés par la granularité géographique :

| Couche | URL pattern | Volume (FR, 1 verticale) | Description |
|--------|-------------|--------------------------|-------------|
| 1 | `/[type]/[ville]` | 35 000 | Page ville principale |
| 2 | `/[type]/[profil]/[ville]` | 10 × 35K = **350K** | Jeune conducteur, senior, résilié... |
| 3 | `/[type]/[assureur]/[ville]` | 20 × 2 449 = **49K** | AXA Lyon, MAIF Toulouse... |
| 4 | `/tarifs/[type]/[ville]` | 35 000 | Tableaux de prix locaux |
| 5 | `/tarifs/[type]/[profil]/[ville]` | 10 × 35K = **350K** | Prix par profil et ville |
| 6 | `/[assureur-a]-vs-[b]/[ville]` | 190 × 300 villes = **57K** | Comparatifs top 300 villes |
| 7 | `/[type]/[departement]` | 101 | Hub département |
| 8 | `/[type]/[region]` | 18 | Hub région |
| 9 | `/[type]/[vehicule-ou-besoin]/[ville]` | 8 × 35K = **280K** | SUV Lyon, optique Toulouse... |
| 10 | `/guide/[sujet]` | 100-500 | Guides et FAQ |
| 11 | `/[type]/[evenement]/[ville]` | 5 × 35K = **175K** | Résiliation, déménagement... |
| 12 | `/blog` | 100-200 | Articles SEO |
| | | **~1.3M par verticale** | |

**× 7 verticales × 12 couches = ~880K pages pour la France (modèle détaillé en Section 2)**
**× 10 pays (calibré par granularité des sources, 12 couches par verticale) = ~2.3M pages au total**

> **Changement majeur v2** : Les couches multiplicatrices (profils, besoins, événements) ne sont créées QUE pour les communes avec données uniques suffisantes (≥3 data points distincts). Les petites communes sans données spécifiques sont regroupées au niveau département. Cela évite le piège "location-swap" détecté par le système Firefly de Google.
>
> **Règle absolue** : Chaque page DOIT avoir un comparateur fonctionnel (devis temps réel) + 3-7 data points API réels. Pas de page sans outil interactif.

### Maillage interne — Architecture en silo

```
Page d'accueil .fr
├── /assurance-auto/                          ← Hub vertical (PageRank max)
│   ├── /assurance-auto/ile-de-france/        ← Hub région
│   │   ├── /assurance-auto/paris/            ← Hub département
│   │   │   ├── /assurance-auto/paris-15/     ← Commune (comparateur + data)
│   │   │   └── ...
│   │   └── /assurance-auto/hauts-de-seine/
│   └── /assurance-auto/auvergne-rhone-alpes/
├── /assurance-habitation/                    ← Hub vertical (même arborescence)
├── /mutuelle-sante/
├── /assurance-pro/
├── /assurance-vie/
├── /assurance-voyage/
├── /assurance-emprunteur/
├── /assureurs/                               ← Profils assureurs
│   ├── /assureurs/axa/
│   └── /assureurs/axa-vs-allianz/           ← Comparaisons
└── /guides/                                  ← Contenu éditorial data-rich
```

Chaque page commune lie vers : ↑ département (parent), ↔ communes voisines (siblings), ↔ autres verticales même commune, → comparateur (CTA).

### Structure URL par pays

```
Couche 1 — Ville
  FR: /assurance-auto/lyon
  DE: /kfz-versicherung/münchen
  ES: /seguro-coche/madrid
  IT: /assicurazione-auto/roma
  IE: /car-insurance/dublin

Couche 2 — Profil × Ville
  FR: /assurance-auto/jeune-conducteur/lyon
  DE: /kfz-versicherung/fahranfaenger/münchen

Couche 3 — Assureur × Ville
  FR: /assurance-auto/maif/lyon
  ES: /seguro-coche/mapfre/madrid

Couche 6 — Comparatif × Ville
  FR: /maif-vs-axa/lyon
  DE: /allianz-vs-huk-coburg/münchen

Couche 9 — Besoin × Ville
  FR: /assurance-auto/suv/lyon
  IE: /car-insurance/electric-vehicle/dublin

Couche 11 — Événement × Ville
  FR: /assurance-auto/resiliation/lyon
  IT: /assicurazione-auto/cambio-residenza/roma
```

Les slugs sont définis dans la config pays — pas de traduction runtime.

---

## 4. Architecture Technique

### Moteur 5 couches

Le coeur du système est un **moteur de résolution** en 5 couches strictement séparées :

```
┌─────────────────────────────────────────────────────┐
│ COUCHE 0 — CONFIG (Build Time)                      │
│ Webpack alias → @country-config → fr.ts             │
│ Résolu au build, tree-shaké, typé                   │
├─────────────────────────────────────────────────────┤
│ COUCHE 1 — RÉSOLUTION (Runtime — RSC)               │
│ URL → PageContext { country, vertical, city, layer } │
│ Validation, redirects, 404                          │
├─────────────────────────────────────────────────────┤
│ COUCHE 2 — DONNÉES (Runtime — RSC)                  │
│ 6 queries Supabase parallèles                       │
│ city_risk_data, insurers, comparisons, stats...     │
├─────────────────────────────────────────────────────┤
│ COUCHE 3 — CALCUL (Runtime — RSC)                   │
│ Raw data → insights, verdicts, FAQ, rankings        │
│ Aucun accès DB — pure transformation                │
├─────────────────────────────────────────────────────┤
│ COUCHE 4 — RENDU (Runtime — RSC)                    │
│ React components + JSON-LD + t() i18n               │
│ Aucune logique métier — pure présentation           │
└─────────────────────────────────────────────────────┘
```

### Couche 0 — CONFIG (Build Time)

```typescript
// next.config.js
const country = process.env.COUNTRY || 'fr'
module.exports = {
  webpack: (config) => {
    config.resolve.alias['@country-config'] =
      path.resolve(__dirname, `src/config/countries/${country}.ts`)
    return config
  },
}
```

```typescript
// src/lib/country.ts
import config from '@country-config'
import type { CountryConfig } from '@/types/config'
export const countryConfig: CountryConfig = config
```

**Avantages du webpack alias** :
- Import synchrone (pas de `await import()`)
- Tree-shaking : seul le pays du build est inclus dans le bundle
- TypeScript autocomplete complet
- Résolution au build, pas au runtime

### Couche 0 — Structure CountryConfig

```typescript
// src/config/countries/fr.ts
export default {
  // Identité
  code: 'fr',
  name: 'France',
  lang: 'fr',
  currency: 'EUR',
  domain: 'comparateur-assurance.fr',

  // Géographie
  geo: {
    subdivisions: {
      level1: { name: 'région', count: 18 },
      level2: { name: 'département', count: 101 },
      level3: { name: 'commune', count: 36000 },
    },
    codeFormat: /^\d{5}$/,  // Code postal
  },

  // Verticales activées
  verticals: {
    auto: {
      slug: 'assurance-auto',
      obligatoire: true,
      riskFactors: ['accidents_km', 'vols_vehicules', 'densite_trafic'],
      layers: [1,2,3,4,5,6,7,8,9,10,11,12],
    },
    habitation: {
      slug: 'assurance-habitation',
      obligatoire: false,
      riskFactors: ['cambriolages', 'inondations', 'seismes', 'dpe_moyen'],
      layers: [1,2,3,5,6,7,8,9,10,11,12],
    },
    sante: {
      slug: 'mutuelle-sante',
      obligatoire: false,
      riskFactors: ['densite_medecins', 'deserts_medicaux', 'age_moyen'],
      layers: [1,2,3,5,6,7,9,10,11,12],
    },
    // ... emprunteur, moto, pro, vie
  },

  // Sources de données
  dataSources: {
    accidents: { name: 'ONISR', url: 'https://...', format: 'csv', frequency: 'annual' },
    vehicules: { name: 'SIV', url: 'https://...', format: 'csv', frequency: 'annual' },
    securite: { name: 'Min. Intérieur', url: 'https://...', format: 'csv', frequency: 'annual' },
    demographie: { name: 'INSEE', url: 'https://...', format: 'csv', frequency: 'annual' },
    immobilier: { name: 'DVF', url: 'https://...', format: 'csv', frequency: 'semestrial' },
    risques_naturels: { name: 'Géorisques', url: 'https://...', format: 'api', frequency: 'realtime' },
    incendies: { name: 'SDIS', url: 'https://...', format: 'csv', frequency: 'annual' },
    sante: { name: 'DREES', url: 'https://...', format: 'csv', frequency: 'annual' },
    remboursements: { name: 'Ameli Open Data', url: 'https://...', format: 'csv', frequency: 'annual' },
    construction: { name: 'FFB', url: 'https://...', format: 'csv', frequency: 'annual' },
    credit: { name: 'BdF/ANIL', url: 'https://...', format: 'csv', frequency: 'quarterly' },
    energie: { name: 'ADEME/DPE', url: 'https://...', format: 'csv', frequency: 'annual' },
    geo: { name: 'API Geo', url: 'https://geo.api.gouv.fr', format: 'api', frequency: 'realtime' },
    entreprises: { name: 'SIRENE', url: 'https://...', format: 'api', frequency: 'daily' },
    meteo: { name: 'Météo-France', url: 'https://...', format: 'api', frequency: 'annual' },
  },

  // Légal
  legal: {
    regulator: 'ACPR',
    brokerRegistry: 'ORIAS',
    brokerNumber: process.env.ORIAS_NUMBER,
    mentionsLegales: {
      rcs: '...',
      siret: '...',
    },
  },
} satisfies CountryConfig
```

### Couche 1 — RÉSOLUTION

```typescript
// src/engine/resolve.ts
type PageContext = {
  country: CountryCode
  vertical: VerticalKey
  city?: City
  department?: Department
  region?: Region
  insurer?: Insurer
  layer: LayerType  // 'service' | 'tarifs' | 'devis' | 'avis' | 'dept' | 'region' | ...
  slug: string
}

function resolve(params: string[]): PageContext | Redirect | NotFound {
  // 1. Identifier la verticale depuis le premier segment
  // 2. Identifier le layer depuis la structure URL
  // 3. Résoudre la géographie (city/dept/region)
  // 4. Valider que la combinaison existe
  // 5. Retourner PageContext ou redirect/404
}
```

### Couche 2 — DONNÉES

```typescript
// src/engine/data.ts
async function fetchPageData(ctx: PageContext): Promise<PageData> {
  const [cityData, riskData, insurers, comparisons, stats, content] =
    await Promise.all([
      fetchCity(ctx),
      fetchRiskData(ctx),
      fetchInsurers(ctx),
      fetchComparisons(ctx),
      fetchStats(ctx),
      fetchContent(ctx),
    ])

  return { cityData, riskData, insurers, comparisons, stats, content }
}
```

### Couche 3 — CALCUL

```typescript
// src/engine/compute.ts
function computeInsights(ctx: PageContext, data: PageData): PageInsights {
  return {
    riskVerdict: computeRiskVerdict(data.riskData, ctx.vertical),
    ranking: rankInsurers(data.insurers, data.riskData, ctx),
    priceEstimate: estimatePrice(data.stats, data.riskData, ctx),
    faq: generateFAQ(ctx, data),
    comparativeStats: computeComparative(data.stats, ctx),
    seoTitle: generateTitle(ctx, data),
    seoDescription: generateDescription(ctx, data),
  }
}
```

### Moteur de contenu unique (le plus critique)

> **Prouvé par ServicesArtisans** : `data-driven-content.ts` avec helpers → 643K pages à 90-95% de contenu unique. Sans ce moteur, Google voit du thin content et désindexe.

Le moteur de contenu transforme les données brutes en texte unique par page. **Chaque phrase contient au minimum 1 data point variable.** C'est ce qui fait que 2 pages du même template sont 90%+ différentes.

```typescript
// src/engine/content.ts — Adapté de ServicesArtisans data-driven-content.ts

// ═══════════════════════════════════════════
// HELPERS — Recodés depuis ServicesArtisans
// ═══════════════════════════════════════════

function citySize(population: number): string {
  if (population > 500_000) return t('city.size.metropole')        // "grande métropole"
  if (population > 100_000) return t('city.size.grande_ville')     // "grande ville"
  if (population > 30_000)  return t('city.size.ville_moyenne')    // "ville moyenne"
  if (population > 5_000)   return t('city.size.petite_ville')     // "petite ville"
  return t('city.size.commune')                                     // "commune"
}

function primeLevel(local: number, national: number): string {
  const diff = ((local - national) / national) * 100
  if (diff > 15) return t('prime.level.elevee')     // "élevée"
  if (diff > -10) return t('prime.level.moderee')   // "modérée"
  return t('prime.level.basse')                      // "basse"
}

function riskLevel(score: number): string {
  if (score > 7) return t('risk.level.eleve')       // "élevé"
  if (score > 4) return t('risk.level.modere')      // "modéré"
  return t('risk.level.faible')                      // "faible"
}

function formatNumber(n: number, lang: string): string {
  return new Intl.NumberFormat(lang).format(n)
  // FR: "2 165 423" | DE: "2.165.423" | EN: "2,165,423"
}

function formatPercent(n: number): string {
  return (n > 0 ? '+' : '') + n.toFixed(0) + '%'
  // "+26%" / "-12%"
}

function regionalMultiplier(region: string, country: string): number {
  // FR: Île-de-France +25%, PACA +15%, Bretagne -5%, DOM +30-40%
  // DE: Bayern +10%, Berlin +20%, Sachsen -15%
  // ES: Madrid +15%, Cataluña +10%, Extremadura -20%
  return REGIONAL_MULTIPLIERS[country]?.[region] ?? 1.0
}

// ═══════════════════════════════════════════
// GÉNÉRATEUR DE CONTENU — Par verticale
// ═══════════════════════════════════════════

function generateIntro(ctx: PageContext, risk: RiskData, city: CityStats): string {
  const primeLabel = primeLevel(risk.avg_premium_estimate, risk.national_avg)
  const riskLabel = riskLevel(risk.risk_score)
  const cityLabel = citySize(city.population)

  return t('intro.auto', {
    city: ctx.city.name,
    population: formatNumber(city.population, ctx.lang),
    cityLabel,
    premium: risk.avg_premium_estimate,
    primeLabel,
    vsNational: formatPercent(risk.premium_vs_national),
    riskLabel,
    accidents: risk.accidents_per_1000,
    thefts: risk.vehicle_theft_rate,
    year: ctx.year,
  })
  // → "Paris, grande métropole de 2 165 423 habitants,
  //    affiche une prime auto moyenne de 687€/an en 2026,
  //    un niveau élevé (+26% vs la moyenne nationale de 545€).
  //    Avec 12.3 accidents pour 1 000 habitants et un taux
  //    de vol de véhicules de 8.7‰, le niveau de risque
  //    est classé élevé."
}

// Même pattern pour chaque bloc de contenu :
function generateRiskAnalysis(ctx, risk, city): string { /* ... */ }
function generatePriceComparison(ctx, risk, insurers): string { /* ... */ }
function generateLocalContext(ctx, city, risk): string { /* ... */ }
function generateFAQContent(ctx, risk, city): FAQItem[] { /* ... */ }
```

#### Blocs de contenu par page (chaque bloc = données uniques)

| Bloc | Données utilisées | Exemple de sortie |
|------|-------------------|-------------------|
| **Intro démographique** | population, densité, type de ville | "Lyon, grande ville de 516 092 habitants..." |
| **Analyse de risque** | accidents, vols, sinistres, score | "Avec 8.7 vols/1000 hab, le risque auto est élevé..." |
| **Estimation prix** | prime locale, nationale, régionale | "Prime moyenne 687€/an (+26% vs national)..." |
| **Comparaison assureurs** | prix min/max par assureur, features | "Eurofil propose le tarif le plus bas à 420€/an..." |
| **Contexte immobilier** | prix/m², transactions, DPE | "Le prix moyen au m² est de 5 200€ (source DVF)..." |
| **Contexte santé** | médecins/1000 hab, dépenses, ALD | "Avec 3.2 médecins/1000 hab, Lyon est bien couvert..." |
| **FAQ enrichie** | toutes les données croisées | "Combien coûte l'assurance auto à Lyon ? → 687€/an..." |
| **Sources E-E-A-T** | citations des sources officielles | "Sources : ONISR 2025, INSEE 2024, Min. Intérieur 2025" |

#### Clés i18n — La structure est identique dans toutes les langues

```typescript
// src/i18n/fr.ts
'intro.auto': '{city}, {cityLabel} de {population} habitants, affiche une prime auto moyenne de {premium}€/an en {year}, un niveau {primeLabel} ({vsNational} vs la moyenne nationale). Avec {accidents} accidents pour 1 000 habitants et un taux de vol de {thefts}‰, le niveau de risque est classé {riskLabel}.',

// src/i18n/de.ts
'intro.auto': '{city}, {cityLabel} mit {population} Einwohnern, weist eine durchschnittliche Kfz-Prämie von {premium}€/Jahr im Jahr {year} auf — ein {primeLabel} Niveau ({vsNational} vs. Bundesdurchschnitt). Mit {accidents} Unfällen pro 1.000 Einwohner und einer Diebstahlrate von {thefts}‰ wird das Risikoniveau als {riskLabel} eingestuft.',

// src/i18n/es.ts
'intro.auto': '{city}, {cityLabel} de {population} habitantes, presenta una prima media de seguro de auto de {premium}€/año en {year}, un nivel {primeLabel} ({vsNational} vs la media nacional). Con {accidents} accidentes por cada 1.000 habitantes y una tasa de robo de {thefts}‰, el nivel de riesgo se clasifica como {riskLabel}.',
```

**Le texte change de langue mais la structure reste identique. Les mêmes placeholders dans toutes les langues = 1 moteur, 6 langues.**

#### Seuils de qualité contenu

| Critère | Seuil | Notre cible | Comment |
|---------|-------|-------------|---------|
| Mots uniques par page | 500+ | **800-1200** | 8 blocs × 100-150 mots chacun |
| Différenciation entre pages | 30-40% | **90-95%** | Chaque phrase contient 1+ data point variable |
| Data points par page | 5+ | **15-25** | 15 sources × données croisées |
| Sources citées (E-E-A-T) | 1+ | **3-5** | ONISR, INSEE, Min. Intérieur, DVF, DREES... |

### Couche 4 — RENDU

```typescript
// src/app/[...slug]/page.tsx
export default async function Page({ params }) {
  const ctx = resolve(params.slug)
  if (ctx instanceof Redirect) return redirect(ctx.to)
  if (ctx instanceof NotFound) return notFound()

  const data = await fetchPageData(ctx)
  const insights = computeInsights(ctx, data)

  const Component = layerComponents[ctx.layer]

  return (
    <>
      <Component ctx={ctx} data={data} insights={insights} />
      <JsonLd data={buildJsonLd(ctx, data, insights)} />
    </>
  )
}

export async function generateMetadata({ params }) {
  const ctx = resolve(params.slug)
  const data = await fetchPageData(ctx)
  const insights = computeInsights(ctx, data)
  return { title: insights.seoTitle, description: insights.seoDescription }
}
```

### Structure des fichiers

```
src/
├── app/
│   ├── [...slug]/
│   │   └── page.tsx              # Catch-all → moteur 5 couches
│   ├── api/
│   │   ├── leads/route.ts        # Soumission lead
│   │   ├── webhook/route.ts      # Webhooks assureurs
│   │   └── admin/                # Routes admin
│   ├── admin/                    # Dashboard admin
│   └── layout.tsx
├── config/
│   └── countries/
│       ├── fr.ts                 # Config France
│       ├── de.ts                 # Config Allemagne
│       ├── es.ts                 # Config Espagne
│       └── ...                   # 10 fichiers pays
├── engine/
│   ├── resolve.ts                # Couche 1
│   ├── data.ts                   # Couche 2
│   ├── compute.ts                # Couche 3
│   └── types.ts                  # PageContext, PageData, PageInsights
├── components/
│   ├── layers/
│   │   ├── ServiceCity.tsx       # Couche 1 — /[type]/[ville]
│   │   ├── ProfileCity.tsx       # Couche 2 — /[type]/[profil]/[ville]
│   │   ├── InsurerCity.tsx       # Couche 3 — /[type]/[assureur]/[ville]
│   │   ├── TarifsCity.tsx        # Couche 4 — /tarifs/[type]/[ville]
│   │   ├── TarifsProfileCity.tsx # Couche 5 — /tarifs/[type]/[profil]/[ville]
│   │   ├── VsComparison.tsx      # Couche 6 — /[assureur-a]-vs-[b]/[ville]
│   │   ├── Department.tsx        # Couche 7 — /[type]/[departement]
│   │   ├── Region.tsx            # Couche 8 — /[type]/[region]
│   │   ├── NeedCity.tsx          # Couche 9 — /[type]/[besoin]/[ville]
│   │   ├── Guide.tsx             # Couche 10 — /guide/[sujet]
│   │   ├── EventCity.tsx         # Couche 11 — /[type]/[evenement]/[ville]
│   │   └── BlogPost.tsx          # Couche 12 — /blog
│   ├── ui/                       # Composants réutilisables
│   ├── forms/
│   │   └── LeadForm.tsx          # Formulaire de devis
│   └── seo/
│       └── JsonLd.tsx            # Structured data
├── i18n/
│   ├── fr.ts
│   ├── de.ts
│   ├── es.ts
│   ├── it.ts
│   ├── nl.ts
│   ├── en.ts
│   └── t.ts                     # Fonction t(key, params)
├── lib/
│   ├── supabase.ts               # 1 seul client (pas 4 comme SA)
│   ├── country.ts                # Re-export @country-config
│   └── utils.ts
├── scripts/
│   ├── import-data/
│   │   ├── fr/
│   │   │   ├── onisr.ts          # Import accidents
│   │   │   ├── siv.ts            # Import véhicules
│   │   │   └── ...
│   │   ├── de/
│   │   │   ├── destatis.ts
│   │   │   └── ...
│   │   └── run-all.ts
│   └── generate-sitemaps.ts      # Cron pré-génération
└── types/
    └── config.ts                 # CountryConfig type
```

**Estimation : ~120-160K lignes** (vs 294K pour ServicesArtisans, -45-60% grâce à l'absence de marketplace)

---

## 5. Schéma Base de Données

### Tables principales

```sql
-- ═══════════════════════════════════════════
-- GÉOGRAPHIE (par pays)
-- ═══════════════════════════════════════════

CREATE TABLE countries (
  code CHAR(2) PRIMARY KEY,        -- 'fr', 'de', 'es'
  name TEXT NOT NULL,
  lang CHAR(2) NOT NULL,
  currency CHAR(3) DEFAULT 'EUR',
  config JSONB NOT NULL,           -- Métadonnées pays
  active BOOLEAN DEFAULT false
);

CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) REFERENCES countries(code),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  code TEXT,                       -- Code officiel
  UNIQUE(country_code, slug)
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) REFERENCES countries(code),
  region_id UUID REFERENCES regions(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  code TEXT NOT NULL,              -- '75', '13', etc.
  UNIQUE(country_code, slug)
);

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) REFERENCES countries(code),
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  postal_code TEXT,
  insee_code TEXT,                  -- Code officiel (INSEE FR, AGS DE, etc.)
  population INTEGER,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  UNIQUE(country_code, slug)
);

CREATE INDEX idx_cities_country ON cities(country_code);
CREATE INDEX idx_cities_department ON cities(department_id);
CREATE INDEX idx_cities_population ON cities(country_code, population DESC);

-- ═══════════════════════════════════════════
-- VERTICALES & ASSUREURS
-- ═══════════════════════════════════════════

CREATE TABLE verticals (
  key TEXT PRIMARY KEY,            -- 'auto', 'habitation', 'sante'
  name_key TEXT NOT NULL,          -- Clé i18n
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE insurers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) REFERENCES countries(code),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description_key TEXT,            -- Clé i18n
  rating DECIMAL(2,1),             -- Note globale
  active BOOLEAN DEFAULT true,
  UNIQUE(country_code, slug)
);

CREATE TABLE insurer_verticals (
  insurer_id UUID REFERENCES insurers(id),
  vertical_key TEXT REFERENCES verticals(key),
  price_range_min INTEGER,         -- €/an estimé
  price_range_max INTEGER,
  features JSONB,                  -- Garanties, options
  affiliate_url TEXT,              -- URL partenaire
  commission_type TEXT,            -- 'courtage' | 'lead' | 'affiliation'
  commission_value DECIMAL(5,2),   -- % ou € fixe
  PRIMARY KEY(insurer_id, vertical_key)
);

-- ═══════════════════════════════════════════
-- DATA MOAT — Données de risque par ville
-- ═══════════════════════════════════════════
-- CHOIX ARCHITECTURAL : colonnes normalisées (PAS JSONB)
--
-- Raison : avec 1.6M+ lignes, JSONB cause :
-- - Query planner aveugle (pas de statistiques sur les champs internes)
-- - Covering index INCLUDE(data) = bloat mémoire (2KB× par ligne)
-- - Extraction JSON à chaque query (cast ::numeric non optimisable)
--
-- Colonnes normalisées = index sélectifs, CHECK constraints, ANALYZE précis.
-- Pattern validé par ServicesArtisans : table `communes` avec colonnes
-- (population, prix_m2_moyen, part_maisons_pct, etc.) → jamais JSONB.

CREATE TABLE city_risk_data (
  city_id UUID REFERENCES cities(id),
  vertical_key TEXT REFERENCES verticals(key),
  year INTEGER NOT NULL,

  -- ═══ Colonnes communes à toutes les verticales ═══
  prime_moyenne_estimee INTEGER,       -- €/an (NULL si pas de source fiable)
  prime_min INTEGER,                   -- €/an — fourchette basse
  prime_max INTEGER,                   -- €/an — fourchette haute
  variation_vs_national DECIMAL(5,2),  -- % vs moyenne nationale (+12.5 = 12.5% au-dessus)
  risk_score SMALLINT,                 -- 1-10 (calculé post-import)

  -- ═══ Auto / Moto ═══
  accidents_total INTEGER,
  accidents_per_1000_hab DECIMAL(5,2),
  accidents_mortels INTEGER,
  vols_vehicules INTEGER,
  vols_per_1000_hab DECIMAL(5,2),
  densite_trafic TEXT,                 -- 'faible', 'moderee', 'elevee', 'tres_elevee'

  -- ═══ Habitation ═══
  cambriolages_per_1000 DECIMAL(5,2),
  zone_inondation BOOLEAN,
  zone_sismique SMALLINT,             -- 0-5
  dpe_moyen CHAR(1),                  -- A-G
  prix_m2_moyen INTEGER,
  sinistres_climatiques_5ans INTEGER,

  -- ═══ Santé ═══
  densite_medecins_per_10k DECIMAL(5,2),
  desert_medical BOOLEAN,
  age_moyen_population DECIMAL(4,1),
  taux_ald DECIMAL(5,2),              -- % affections longue durée

  -- ═══ Pro ═══
  nb_entreprises INTEGER,
  nb_sinistres_pro INTEGER,
  secteurs_principaux TEXT[],          -- ARRAY ['btp', 'commerce', 'services']

  -- ═══ Emprunteur ═══
  taux_credit_moyen DECIMAL(4,2),
  prix_m2_achat INTEGER,
  volume_transactions INTEGER,

  -- ═══ Métadonnées import ═══
  source TEXT NOT NULL,                -- 'onisr', 'min_interieur', 'insee', etc.
  source_year INTEGER,                 -- Année de la donnée source (peut différer de `year`)
  imported_at TIMESTAMPTZ DEFAULT now(),
  freshness_days INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM now() - imported_at)::integer
  ) STORED,                            -- Jours depuis le dernier import

  PRIMARY KEY(city_id, vertical_key, year)
);

-- Index sélectifs (chaque colonne indexable indépendamment)
CREATE INDEX idx_risk_city ON city_risk_data(city_id, vertical_key, year DESC);
CREATE INDEX idx_risk_vertical ON city_risk_data(vertical_key, year DESC);
CREATE INDEX idx_risk_score ON city_risk_data(vertical_key, risk_score DESC)
  WHERE risk_score IS NOT NULL;
CREATE INDEX idx_risk_freshness ON city_risk_data(imported_at)
  WHERE freshness_days > 365;  -- Alerte données périmées

-- ═══════════════════════════════════════════
-- CONTENU
-- ═══════════════════════════════════════════

CREATE TABLE guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) REFERENCES countries(code),
  vertical_key TEXT REFERENCES verticals(key),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,           -- Markdown
  meta_description TEXT,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(country_code, vertical_key, slug)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) REFERENCES countries(code),
  vertical_key TEXT REFERENCES verticals(key),
  slug TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,            -- Markdown
  published_at TIMESTAMPTZ,
  UNIQUE(country_code, vertical_key, slug)
);

CREATE TABLE blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) REFERENCES countries(code),
  vertical_key TEXT,               -- NULL = général
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(country_code, slug)
);

-- ═══════════════════════════════════════════
-- BUSINESS — Leads
-- ═══════════════════════════════════════════

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) REFERENCES countries(code),
  vertical_key TEXT REFERENCES verticals(key),
  city_id UUID REFERENCES cities(id),

  -- Contact
  email TEXT NOT NULL,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,

  -- Données formulaire (variable selon verticale)
  form_data JSONB NOT NULL,

  -- Tracking
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Statut
  status TEXT DEFAULT 'new',       -- new, sent, converted, expired
  insurer_id UUID REFERENCES insurers(id),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  event_type TEXT NOT NULL,        -- 'created', 'sent_to_insurer', 'opened', 'converted'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_country ON leads(country_code, created_at DESC);
CREATE INDEX idx_leads_status ON leads(status, created_at DESC);
CREATE INDEX idx_lead_events_lead ON lead_events(lead_id, created_at);

-- ═══════════════════════════════════════════
-- ANALYTICS
-- ═══════════════════════════════════════════

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2),
  vertical_key TEXT,
  city_slug TEXT,
  layer TEXT,                      -- 'service', 'tarifs', 'devis', etc.
  event_type TEXT NOT NULL,        -- 'page_view', 'form_start', 'form_submit', 'cta_click'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Partition par mois pour performance
-- CREATE TABLE analytics_events_2026_03 PARTITION OF analytics_events
--   FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

### Vues matérialisées — Stats agrégées (pattern ServicesArtisans)

> **Prouvé par ServicesArtisans** : migrations 351 — `mv_provider_stats`, `mv_provider_counts`. Rafraîchies par cron. Évitent les COUNT(*)/AVG() en temps réel.

```sql
-- Vue matérialisée pour les pages département et région
-- Sans ça, chaque page département fait COUNT/AVG sur 500-1000 lignes
-- Avec la vue : 1 lookup, 2ms

CREATE MATERIALIZED VIEW mv_city_risk_summary AS
SELECT
  c.country_code,
  c.department_id,
  crd.vertical_key,
  COUNT(DISTINCT c.id) as city_count,
  AVG(crd.prime_moyenne_estimee) as avg_premium,
  MIN(crd.prime_moyenne_estimee) as min_premium,
  MAX(crd.prime_moyenne_estimee) as max_premium,
  AVG(crd.accidents_per_1000_hab) as avg_accidents,
  AVG(crd.risk_score) as avg_risk_score,
  MAX(crd.imported_at) as last_import
FROM cities c
JOIN city_risk_data crd ON crd.city_id = c.id
WHERE crd.year = EXTRACT(YEAR FROM now())
GROUP BY c.country_code, c.department_id, crd.vertical_key;

CREATE UNIQUE INDEX ON mv_city_risk_summary(country_code, department_id, vertical_key);

-- Rafraîchir après chaque import de données (cron trimestriel)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_city_risk_summary;
```

**Utilisé pour** :
- Pages département (stats agrégées : prime moyenne, min, max, nb accidents)
- Pages région (agrégation des départements)
- Baromètre national (comparaison tous les départements)
- Comparaison villes voisines (moyenne département vs ville)

### Covering indexes — Migrations concrètes

> **Prouvé par ServicesArtisans** : migration 348 — `idx_providers_sitemap_v2` avec INCLUDE. Query time 50ms → 2ms. Sur 2.3M pages c'est la différence entre TTFB 800ms et TTFB 200ms.

```sql
-- Index couvrant pour les pages service×ville (la requête la plus fréquente)
-- Colonnes normalisées = INCLUDE léger (~60 bytes vs ~2KB JSONB)
CREATE INDEX idx_risk_page_lookup
ON city_risk_data(city_id, vertical_key, year DESC)
INCLUDE (prime_moyenne_estimee, risk_score, accidents_per_1000_hab,
         cambriolages_per_1000, densite_medecins_per_10k, source, imported_at);

-- Index couvrant pour les sitemaps
CREATE INDEX idx_cities_sitemap
ON cities(country_code, slug)
INCLUDE (id, name, population, latitude, longitude, department_id);

-- Index couvrant pour les voisins
CREATE INDEX idx_neighbors_page
ON city_neighbors(city_id, distance_km ASC)
INCLUDE (neighbor_id);

-- Index couvrant pour les assureurs par verticale
CREATE INDEX idx_insurers_vertical_lookup
ON insurer_verticals(vertical_key)
INCLUDE (insurer_id, price_range_min, price_range_max, commission_type);

-- Index couvrant pour les guides
CREATE INDEX idx_guides_page_lookup
ON guides(country_code, vertical_key, slug)
INCLUDE (id, title, meta_description);
```

**Chaque index élimine le heap fetch** : la query est servie entièrement depuis l'index B-tree, sans lire la table. Critique sur `city_risk_data` (1.6M lignes).

### Table GSC boost pages

> **Prouvé par ServicesArtisans** : `gsc-priority-cities.ts` — 60+ villes en positions 5-20, maillage interne renforcé ciblé.

```sql
-- Pages identifiées par GSC comme proches de la page 1
CREATE TABLE gsc_boost_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) REFERENCES countries(code),
  city_id UUID REFERENCES cities(id),
  vertical_key TEXT REFERENCES verticals(key),
  gsc_position DECIMAL(4,1),    -- Position moyenne (5.0-20.0)
  gsc_impressions INTEGER,       -- Impressions/mois
  gsc_clicks INTEGER,            -- Clics/mois
  boost_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

```typescript
// src/scripts/gsc-boost.ts — Cron hebdomadaire
// 1. Query GSC API → pages en position 5-20 (proches page 1)
// 2. Pour chaque page identifiée :
//    → Ajouter 5-10 liens internes depuis les pages à forte autorité
//    → Priorité dans les hubs département/région
//    → Mention dans les guides liés
// 3. Stocker dans gsc_boost_pages
// 4. InternalLinks consulte cette table pour renforcer le maillage
//
// C'est un feedback loop :
// GSC → identifie les opportunités → renforce le maillage
// → la page monte → plus de trafic → plus de données GSC
//
// Automatiser dès le mois 3-4 (assez de données GSC)
```

### Estimation du volume de données

| Table | Lignes estimées | Taille |
|-------|-----------------|--------|
| cities | ~71 700 | ~22 MB |
| city_risk_data | ~71 700 × 7 × 3 ans = ~1.6M | ~180 MB (colonnes normalisées, ~120 bytes/row) |
| insurers | ~500 | ~1 MB |
| insurer_verticals | ~2 000 | ~1 MB |
| guides | ~3 500 | ~50 MB |
| questions | ~14 000 | ~100 MB |
| leads | Croissance | Variable |
| **Total initial** | | **~350 MB** (vs ~700 MB si JSONB) |

### Validation des variables d'environnement (pattern ServicesArtisans)

> **Copié de** : `src/lib/env.ts` — schema Zod qui valide toutes les env vars au boot. Si `COUNTRY` ou `SUPABASE_URL` manque → crash immédiat avec message clair, pas une erreur cryptique en runtime.

```typescript
// src/lib/env.ts — adapté de ServicesArtisans
import { z } from 'zod'

const envSchema = z.object({
  // Core — obligatoire
  COUNTRY: z.enum(['fr', 'de', 'es', 'it', 'be', 'nl', 'at', 'ch', 'lu', 'ie']),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Sécurité leads
  LEAD_ENCRYPTION_KEY: z.string().length(64),  // 32 bytes hex
  REVALIDATE_SECRET: z.string().min(16),
  CRON_SECRET: z.string().min(16),

  // Redis (L2 cache)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  ALERT_WEBHOOK_URL: z.string().url().optional(),

  // Assureurs (per-insurer secrets)
  // Pas validés ici — chargés dynamiquement depuis country_legal_config
})

export const env = envSchema.parse(process.env)
```

### Data quality & freshness — SLA par source

> **Règle critique** : Les données d'assurance évoluent (tarifs Q1/Q4, sinistralité annuelle). Des données périmées = pages obsolètes = perte de confiance Google.

| Source | Fréquence publication | Délai réel | SLA import | Alerte si > |
|--------|----------------------|------------|------------|-------------|
| ONISR (accidents FR) | Annuel (sept.) | 9-12 mois | Annuel oct. | 400 jours |
| INSEE (démographie) | Annuel | 6-12 mois | Annuel | 400 jours |
| DVF (prix immo) | Trimestriel | 3-6 mois | Trimestriel | 200 jours |
| Géorisques (catastrophes nat.) | Continu | Temps réel | Mensuel | 60 jours |
| DREES (médecins) | Annuel | 6-9 mois | Annuel | 400 jours |
| ASF Portugal (rapports marché) | Annuel | 0 (direct) | Annuel | 400 jours |

**Automatisation** : Le cron `/api/cron/data-freshness` vérifie `freshness_days` (colonne générée) et alerte si une source dépasse son SLA.

> **Transparence SEO** : chaque page affiche "Données {source}, {année}" en footer. Google valorise la transparence des sources (E-E-A-T).

### Validation des données importées

```sql
-- Contraintes de validité sur city_risk_data
ALTER TABLE city_risk_data
  ADD CONSTRAINT chk_prime_range
    CHECK (prime_moyenne_estimee IS NULL OR prime_moyenne_estimee BETWEEN 50 AND 20000),
  ADD CONSTRAINT chk_risk_score
    CHECK (risk_score IS NULL OR risk_score BETWEEN 1 AND 10),
  ADD CONSTRAINT chk_accidents
    CHECK (accidents_per_1000_hab IS NULL OR accidents_per_1000_hab BETWEEN 0 AND 200),
  ADD CONSTRAINT chk_variation
    CHECK (variation_vs_national IS NULL OR variation_vs_national BETWEEN -90 AND 500);
```

```typescript
// scripts/import/shared/validators.ts — Validation Zod pré-insert
const CityRiskRowSchema = z.object({
  city_id: z.string().uuid(),
  vertical_key: z.enum(['auto', 'habitation', 'sante', 'emprunteur', 'moto', 'pro', 'vie']),
  year: z.number().int().min(2020).max(2030),
  prime_moyenne_estimee: z.number().min(50).max(20000).nullable(),
  risk_score: z.number().int().min(1).max(10).nullable(),
  source: z.string().min(2).max(50),
})

// Rejecter les rows invalides AVANT l'insert — pas de données corrompues en DB
```

---

## 6. Data Moat

### Principe

L'architecture ServicesArtisans a prouvé le modèle : **6 sources de données publiques → 643K pages avec 90-95% de contenu unique**. Pour l'assurance, 15 sources → 7.3M pages uniques en France. Même pattern : enrichir offline, générer runtime, cache ISR.

Les données publiques sont **gratuites et accessibles** mais leur **collecte, nettoyage, normalisation et croisement au niveau commune** crée une barrière à l'entrée massive.

### Sources réutilisées de ServicesArtisans (0 travail)

| Source | Données | URL |
|--------|---------|-----|
| API Geo | Population, coordonnées, densité, superficie | geo.api.gouv.fr |
| SIRENE | Nb entreprises BTP par commune (NAF 41-43) | recherche-entreprises.api.gouv.fr |
| DVF Etalab | Prix immobilier 2022-2024 par commune | data.gouv.fr |
| Géorisques | Inondation, sismique, radon, argile | georisques.gouv.fr |
| ADEME RGE/DPE | Artisans certifiés + passoires énergétiques | data.ademe.fr |

### Nouvelles sources par verticale — France

#### Auto

| # | Source | Données | Colonnes DB | Format |
|---|--------|---------|-------------|--------|
| 1 | ONISR (data.gouv.fr) | Accidents corporels par commune/département | `nb_accidents_annuels`, `taux_accidents_1000hab`, `gravite_moyenne` | CSV |
| 2 | SDES / Fichier SIV | Parc automobile par commune | `nb_vehicules`, `age_moyen_parc`, `pct_electrique`, `pct_diesel` | CSV |
| 3 | Ministère Intérieur | Vols de véhicules par département | `nb_vols_vehicules`, `taux_vol_1000hab` | CSV |

#### Mutuelle / Santé

| # | Source | Données | Colonnes DB | Format |
|---|--------|---------|-------------|--------|
| 1 | DREES | Démographie médicale par commune | `densite_medecins`, `densite_dentistes`, `deserts_medicaux` | CSV |
| 2 | Ameli (data.ameli.fr) | Dépenses de santé par département | `depense_sante_habitant`, `taux_ald`, `conso_optique` | CSV |
| 3 | INSEE pyramide âges | Structure d'âge par commune | `pct_moins_25`, `pct_25_45`, `pct_plus_65`, `age_median` | CSV |

#### Pro / Décennale

| # | Source | Données | Colonnes DB | Format |
|---|--------|---------|-------------|--------|
| 1 | SIRENE enrichi | Nb entreprises BTP détaillé par code NAF × commune (48 métiers) | Déjà en base | API |
| 2 | FFB/FFBTP | Sinistralité décennale par département | `ca_btp_dept`, `sinistralite_decennale`, `cout_moyen_sinistre` | CSV |
| 3 | Pappers/Societe.com | Créations/radiations entreprises BTP | `creations_btp_annuelles`, `radiations_btp_annuelles` | API |

#### Emprunteur + Habitation

| # | Source | Données | Colonnes DB | Format |
|---|--------|---------|-------------|--------|
| 1 | DVF Etalab (déjà utilisé) | Volume transactions, prix moyen | `nb_transactions_annuelles`, `montant_moyen_pret` | CSV |
| 2 | Banque de France / ANIL | Taux d'intérêt par région | `taux_moyen_pret_region`, `duree_moyenne_pret` | CSV |
| 3 | INSEE logement | Propriétaires vs locataires, maisons vs appartements | `pct_proprietaires`, `pct_locataires` | CSV |
| 4 | SDIS (incendies) | Interventions incendie par département | `nb_incendies_habitation` | CSV |

**Total France : 15 sources → 7.3M pages de contenu unique**

### Sources par pays

#### Belgique (581 communes — 10 sources)

| # | Source | Données | Colonnes DB | Format | URL |
|---|--------|---------|-------------|--------|-----|
| 1 | Statbel (SPF Économie) | Population, évolution, habitat, revenus fiscaux, parc véhicules PAR COMMUNE. Outil "Découvrez votre commune". Licence CC BY 4.0 | `population`, `densite`, `nb_logements`, `revenu_median` | CSV/API | statbel.fgov.be/fr/open-data |
| 2 | Statbel Accidents | Accidents de la route PAR COMMUNE. Données annuelles | `nb_accidents`, `nb_tues`, `nb_blesses`, `taux_accidents_1000hab` | CSV | statbel.fgov.be/fr/figures/accidents |
| 3 | SPF Mobilité / DIV | Parc de véhicules par commune (inclus dans Statbel) | `nb_vehicules`, `pct_diesel`, `pct_electrique`, `age_moyen_parc` | CSV | statbel.fgov.be |
| 4 | Police Fédérale | Criminalité par zone de police. Vols véhicules, cambriolages | `nb_vols_vehicules`, `nb_cambriolages`, `taux_criminalite` | CSV | police.be/statistiques |
| 5 | INAMI | Dépenses de santé par arrondissement. Démographie médicale | `densite_medecins`, `depense_sante_habitant`, `nb_hopitaux` | CSV | inami.fgov.be |
| 6 | Notaire.be / Statbel Immobilier | Prix immobilier par commune (transactions notariales) | `prix_m2_maison`, `prix_m2_appartement`, `nb_transactions` | API | notaire.be/barometre |
| 7 | SPF Intérieur | Incendies, interventions services secours | `nb_incendies_habitation` | CSV | ibz.be/fr/statistiques |
| 8 | BNB (Banque Nationale) | Taux crédit, endettement ménages | `taux_moyen_pret`, `endettement_menages` | CSV | nbb.be/fr/statistiques |
| 9 | BCE/KBO | Banque Carrefour des Entreprises. Registre public. Nb entreprises par commune et code NACE (équiv. NAF) | `nb_entreprises_construction`, `nb_entreprises_total`, `creations_annuelles` | API | kbopub.economie.fgov.be |
| 10 | data.gov.be | Portail open data fédéral. Agrège toutes les sources ci-dessus. API REST | Toutes | CSV/API | data.gov.be |

#### Allemagne (11 014 Gemeinden — 8 sources)

| # | Source | Données | Colonnes DB | Format | URL |
|---|--------|---------|-------------|--------|-----|
| 1 | Destatis GENESIS-Online | Base statistique fédérale. Population, logement, âges, revenus PAR Gemeinde. API REST/JSON. Regionalstatistik.de pour données infra-Land. Licence Datenlizenz Deutschland 2.0 | `einwohner`, `flaeche`, `bevoelkerungsdichte`, `altersstruktur` | API | www-genesis.destatis.de |
| 2 | Unfallatlas | Accidents de la route géolocalisés depuis 2016. CSV + shapefile. Chaque accident avec coordonnées GPS + gravité | `nb_unfaelle`, `nb_verletzte`, `nb_getoetete`, `unfallschwere` | CSV | unfallatlas.statistikportal.de |
| 3 | KBA Open Data | Kraftfahrt-Bundesamt. Parc automobile par Zulassungsbezirk (district). Marques, types, motorisation, âge | `nb_fahrzeuge`, `pct_elektro`, `pct_diesel`, `durchschnittsalter_pkw` | CSV | kba.de/DE/Service/OpenData |
| 4 | BKA / PKS | Polizeiliche Kriminalstatistik. Vols véhicules, cambriolages par Landkreis | `nb_kfz_diebstahl`, `nb_wohnungseinbruch`, `haeufigkeitszahl` | CSV | bka.de/polizeiliche-kriminalstatistik |
| 5 | Handelsregister + Gewerbeanmeldungen | Registre du commerce. Entreprises par Gemeinde et WZ-Code (équiv. NAF). Via Destatis Regionalstatistik | `nb_unternehmen_bau`, `nb_handwerker`, `gewerbe_anmeldungen` | CSV | destatis.de |
| 6 | GKV-Spitzenverband / Destatis Gesundheit | Statistiques santé. Démographie médicale par Kreis. Dépenses GKV/PKV | `aerzte_je_100000`, `zahnaerzte_dichte`, `gesundheitsausgaben_kopf` | CSV | gkv-spitzenverband.de |
| 7 | Gutachterausschuss / BORIS | Prix immobilier par Gemeinde. Bodenrichtwerte (valeurs foncières). Chaque Land a son propre portail BORIS | `bodenrichtwert`, `kaufpreis_m2`, `nb_transaktionen` | CSV | boris.nrw.de (et équivalents par Land) |
| 8 | OpenPLZ API | API gratuite. Codes postaux, communes, coordonnées pour DE, AT, CH. Complément geocoding | `plz`, `gemeinde`, `lat`, `lon` | API | openplzapi.org |

#### Espagne (8 131 municipios — 8 sources)

| # | Source | Données | Colonnes DB | Format | URL |
|---|--------|---------|-------------|--------|-----|
| 1 | INE | Instituto Nacional de Estadística. Population, logement, âges, revenus PAR municipio. API JSON-stat | `poblacion`, `densidad`, `pct_mayores_65`, `renta_media` | API | ine.es/dyngs/INEbase |
| 2 | DGT | Dirección General de Tráfico. Parc automobile, accidents, permis par provincia | `nb_vehiculos`, `nb_accidentes`, `nb_victimas`, `tasa_accidentes` | CSV | dgt.es/datos-abiertos |
| 3 | Ministerio del Interior | Criminalité par provincia/municipio. Vols véhicules, cambriolages | `nb_robos_vehiculo`, `nb_robos_vivienda`, `tasa_criminalidad` | CSV | estadisticasdecriminalidad.ses.mir.es |
| 4 | Registro Mercantil / INE Directorio | Entreprises par municipio et CNAE (équiv. NAF). Via INE DIRCE | `nb_empresas_construccion`, `nb_autonomos`, `altas_anuales` | API | ine.es |
| 5 | Ministerio de Sanidad | Statistiques santé par comunidad autónoma. Médecins, hôpitaux, dépenses | `medicos_por_1000hab`, `gasto_sanitario_capita`, `nb_hospitales` | CSV | sanidad.gob.es |
| 6 | Min. Fomento / Colegio de Registradores | Prix immobilier par provincia et municipio. Transactions | `precio_m2_vivienda`, `nb_compraventas`, `hipoteca_media` | CSV | registradores.org |
| 7 | Catastro | Cadastre espagnol. Données sur les biens immobiliers par municipio | Complément habitation | API | catastro.minhap.es |
| 8 | datos.gob.es | Portail open data national espagnol. 40 000+ datasets | Toutes | API | datos.gob.es |

#### Italie (7 904 comuni — 8 sources)

| # | Source | Données | Colonnes DB | Format | URL |
|---|--------|---------|-------------|--------|-----|
| 1 | ISTAT | Istituto Nazionale di Statistica. Population, logement, âges, revenus PAR comune. I.Stat = base interrogeable | `popolazione`, `densita`, `pct_over65`, `reddito_medio` | API | dati.istat.it |
| 2 | ACI + ISTAT | Automobile Club d'Italia. Parc automobile par provincia. Base ISTAT incidenti stradali | `nb_veicoli`, `nb_incidenti`, `nb_morti`, `nb_feriti`, `tasso_incidenti` | CSV | aci.it/lautomobilista/open-data |
| 3 | Ministero dell'Interno | Criminalité par provincia. Vols véhicules, cambriolages | `nb_furti_auto`, `nb_furti_abitazione`, `tasso_criminalita` | CSV | dati.interno.gov.it |
| 4 | Registro Imprese + ISTAT ASIA | Entreprises par comune et code ATECO (équiv. NAF). Via Camera di Commercio | `nb_imprese_costruzione`, `nb_artigiani`, `iscrizioni_annuali` | API | registroimprese.it |
| 5 | Ministero della Salute | Statistiques santé par ASL/regione. Médecins, hôpitaux, dépenses | `medici_per_1000ab`, `spesa_sanitaria_capita`, `posti_letto` | CSV | dati.salute.gov.it |
| 6 | OMI Agenzia delle Entrate | Osservatorio Mercato Immobiliare. Prix immobilier par comune. LA référence officielle italienne | `prezzo_m2_residenziale`, `nb_transazioni`, `valore_medio` | CSV | agenziaentrate.gov.it/portale/omi |
| 7 | INGV + Protezione Civile | Risque sismique par comune (classificazione sismica). Essentiel pour assicurazione terremoto | `zona_sismica` (1-4), `rischio_idrogeologico` | API | ingv.it |
| 8 | dati.gov.it | Portail open data national italien. 50 000+ datasets publics | Toutes | API | dati.gov.it |

#### Belgique — détail complémentaire

> Sources déjà détaillées ci-dessus avec colonnes DB. data.gov.be agrège toutes les sources via API REST.

#### Pays-Bas (345 gemeenten — 10 sources)

| # | Source | Données | Colonnes DB | Format | URL |
|---|--------|---------|-------------|--------|-----|
| 1 | CBS (StatLine) | Démographie, revenus, logement par gemeente. OData protocol, 4000+ datasets | `bevolking`, `dichtheid`, `gemiddeld_inkomen` | API | opendata.cbs.nl |
| 2 | CBS Verkeer | Accidents route par gemeente, type véhicule | `nb_verkeersongevallen`, `nb_doden`, `nb_gewonden` | API | opendata.cbs.nl |
| 3 | Politie | Criminalité par quartier/gemeente | `nb_autodiefstal`, `nb_woninginbraak`, `misdaadcijfer` | CSV | data.politie.nl |
| 4 | RDW | Parc véhicules, immatriculations, APK (contrôle technique) | `nb_voertuigen`, `pct_elektrisch`, `gemiddelde_leeftijd` | API | opendata.rdw.nl |
| 5 | Kadaster | Transactions immobilières, prix/m² par gemeente | `prijs_m2`, `nb_transacties`, `gemiddelde_koopsom` | API | kadaster.nl |
| 6 | RIVM | Santé publique, espérance de vie, soins par région | `levensverwachting`, `huisartsen_per_1000` | API | statline.rivm.nl |
| 7 | Zorginstituut NL | Coûts santé, remboursements par type de soin | `zorgkosten_capita`, `nb_ziekenhuizen` | CSV | zorgcijfersdatabank.nl |
| 8 | KVK | Entreprises par gemeente, secteurs (Kamer van Koophandel) | `nb_bedrijven_bouw`, `nb_zzp`, `nieuwe_inschrijvingen` | API | developers.kvk.nl |
| 9 | Rijkswaterstaat | Risques inondation, niveau eau par zone | `overstromingsrisico`, `waterstand` | API | waterinfo.rws.nl |
| 10 | KNMI | Météo, événements extrêmes par station (tempêtes, grêle) | `nb_stormen`, `nb_hagelbuien` | API | dataplatform.knmi.nl |

#### Autriche (2 093 Gemeinden — 9 sources)

| # | Source | Données | Colonnes DB | Format | URL |
|---|--------|---------|-------------|--------|-----|
| 1 | Statistik Austria | Démographie, revenus, logement par Gemeinde | `einwohner`, `flaeche`, `medianeinkommen` | CSV/API | data.statistik.gv.at |
| 2 | BMI Kriminalstatistik | Criminalité par Bezirk (vols, cambriolages) | `nb_kfz_diebstahl`, `nb_einbruch`, `kriminalitaetsrate` | PDF/CSV | bundeskriminalamt.at/kriminalstatistik |
| 3 | Statistik Austria Verkehrsunfälle | Accidents route par Bundesland/Bezirk | `nb_unfaelle`, `nb_verletzte`, `nb_getoetete` | CSV | data.statistik.gv.at |
| 4 | Statistik Austria KFZ | Parc auto, immatriculations par Bundesland | `nb_fahrzeuge`, `pct_elektro`, `durchschnittsalter` | CSV | data.statistik.gv.at |
| 5 | Grundbuch / Immobilienpreisspiegel | Transactions immobilières, prix/m² par Bezirk | `kaufpreis_m2`, `nb_transaktionen` | CSV | data.gv.at |
| 6 | Hauptverband Sozialversicherung | Dépenses santé, médecins par Bezirk | `aerzte_dichte`, `gesundheitsausgaben` | CSV | sozialversicherung.at |
| 7 | OeNB (Banque nationale) | Taux crédit, endettement | `hypothekenzins`, `verschuldung` | CSV | oenb.at/statistik |
| 8 | WKO (Wirtschaftskammer) | Entreprises par Bezirk, secteurs d'activité | `nb_unternehmen_bau`, `nb_handwerker` | API | firmen.wko.at |
| 9 | data.gv.at | Portail open data fédéral (géorisques, énergie, ZAMG météo, communes) | Toutes | CSV/API | data.gv.at |

#### Portugal (308 municípios — 9 sources)

| # | Source | Description | Colonnes clés | Format | URL |
|---|--------|-------------|---------------|--------|-----|
| 1 | INE (Instituto Nacional de Estatística) | Démographie, logement, revenus par município. Base CENSOS + Anuários. Licence open data | `populacao`, `densidade`, `rendimento_medio` | API/CSV | ine.pt/xportal |
| 2 | ANSR (Autoridade Nacional de Segurança Rodoviária) | Accidents routiers géolocalisés par município et distrito | `nb_acidentes`, `nb_feridos`, `nb_mortos` | CSV | ansr.pt/estatisticas |
| 3 | DGPJ (Direção-Geral da Política de Justiça) | Statistiques criminalité par distrito | `nb_furtos`, `nb_assaltos`, `taxa_criminalidade` | CSV | dgpj.mj.pt/estatisticas |
| 4 | IMT (Instituto da Mobilidade e dos Transportes) | Parc véhicules, immatriculations par distrito | `nb_veiculos`, `pct_eletrico` | CSV | imt-ip.pt |
| 5 | INE Habitação | Prix immobilier par município, transactions | `preco_m2_medio`, `nb_transacoes` | CSV | ine.pt |
| 6 | ASF (Autoridade de Supervisão de Seguros) | Rapports annuels marché assurance, primes moyennes par segment | `premio_medio_auto`, `premio_medio_saude` | PDF/CSV | asf.com.pt |
| 7 | Banco de Portugal | Taux crédit immobilier, endettement ménages | `taxa_juro_habitacao`, `endividamento` | CSV | bportugal.pt/estatisticas |
| 8 | PORDATA | Entreprises par município, registre commercial | `nb_empresas`, `nb_criadas` | API | pordata.pt |
| 9 | IPMA (Instituto Português do Mar e da Atmosfera) | Événements météo extrêmes, sécheresse, incendies par distrito | `nb_incendios`, `area_ardida`, `seca_nivel` | API | ipma.pt |

#### Luxembourg (102 communes — 7 sources)

| # | Source | Données | Colonnes DB | Format | URL |
|---|--------|---------|-------------|--------|-----|
| 1 | STATEC (LUSTAT) | Démographie, revenus, logement par commune (650+ tables) | `population`, `densite`, `revenu_median` | API | statistiques.public.lu |
| 2 | Police Grand-Ducale | Accidents route, criminalité par commune | `nb_accidents`, `nb_vols`, `nb_cambriolages` | CSV | police.public.lu/fr/statistiques |
| 3 | SNCA | Immatriculations, parc véhicules | `nb_vehicules`, `age_moyen_parc` | CSV | snca.lu |
| 4 | Administration du Cadastre | Transactions immobilières, prix/m² par commune | `prix_m2`, `nb_transactions` | CSV | data.public.lu |
| 5 | CNS (Caisse nationale de santé) | Dépenses santé, remboursements | `depense_sante_habitant`, `densite_medecins` | CSV | cns.public.lu |
| 6 | BCL (Banque centrale) | Taux crédit, endettement | `taux_moyen_pret`, `endettement_menages` | CSV | bcl.lu/fr/statistiques |
| 7 | data.public.lu | Portail open data national (MCP server expérimental, cadastre, météo, communes) | Toutes | API | data.public.lu |

#### Irlande (3 440 communes — 9 sources)

| # | Source | Données | Colonnes DB | Format | URL |
|---|--------|---------|-------------|--------|-----|
| 1 | CSO (Central Statistics Office) | Démographie, revenus, logement par county/ED. PxStat API | `population`, `density`, `median_income` | API | data.cso.ie |
| 2 | RSA (Road Safety Authority) | Accidents route par county | `nb_accidents`, `nb_fatalities`, `nb_injuries` | CSV | rsa.ie/road-safety/statistics |
| 3 | An Garda Síochána | Criminalité par Garda division (vols, cambriolages) | `nb_vehicle_theft`, `nb_burglary`, `crime_rate` | CSV | cso.ie/en/statistics/crimeandjustice |
| 4 | DTTS | Parc véhicules, immatriculations par county | `nb_vehicles`, `avg_vehicle_age`, `pct_electric` | CSV | gov.ie/transport |
| 5 | Property Price Register | Transactions immobilières, prix par county/Eircode | `price_per_m2`, `nb_transactions`, `avg_price` | CSV | propertypriceregister.ie |
| 6 | HSE / HIA | Dépenses santé, densité médecins par county | `gp_per_1000`, `health_spend_capita` | CSV | hia.ie/data |
| 7 | Central Bank of Ireland | Taux hypothécaires, endettement ménages | `avg_mortgage_rate`, `household_debt` | CSV | centralbank.ie/statistics |
| 8 | CRO (Companies Registration Office) | Entreprises par county | `nb_construction_companies`, `new_registrations` | API | core.cro.ie |
| 9 | data.gov.ie | Portail open data national (géorisques, énergie, météo Met Éireann) | Toutes | CSV/API | data.gov.ie |

### Pipeline d'import

```
Sources publiques (CSV/API)
    ↓ scripts/import-data/{country}/
Nettoyage & normalisation
    ↓
Agrégation au niveau commune
    ↓
UPSERT city_risk_data (colonnes normalisées)
    ↓ cron trimestriel
Recalcul des estimations de prix
    ↓
Invalidation ISR (IndexNow)
```

---

## 7. Stratégie SEO & Sitemaps

### Principes

1. **0 pages pré-rendues** — 100% ISR on-demand + cache
2. **Sitemaps shardés à 30K URLs** — par verticale et département
3. **Déploiement progressif** — 100K → 500K → scale, pas tout d'un coup
4. **45-50 liens internes par page** — maillage automatisé dense
5. **Schemas financiers** — `InsuranceProduct`, `FinancialProduct`, `positiveNotes/negativeNotes`
6. **Flux RSS par verticale** — accélère la découverte Google
7. **Pruning actif** — suppression des pages non-rankées après 6 mois
8. **Log file analysis** — comprendre le comportement réel de Googlebot
9. **IndexNow** pour notifier Google/Bing après chaque import de données
10. **Hreflang** pour les pays multilingues (BE, CH)

### Pourquoi 0 pages pré-rendues

Avec 2.3M pages, le pré-rendu complet est **impossible** :
- À 1 page/seconde = 341 jours de build
- ISR on-demand : la page est générée au premier visit, puis mise en cache
- Les crawlers Google/Bing sont le premier visiteur → IndexNow les guide

### Architecture Sitemaps — Shardés à 30K URLs max

**Règle absolue** : pas de sitemap géant. Sharder par **verticale** et par **département/région**. Cible : fichiers de 30K URLs traités par Google en ~2 jours (vs semaines pour des fichiers de 50K).

```
/sitemap.xml (index)
│
├── /sitemaps/auto/
│   ├── auto-dept-01-ain.xml              (communes Ain, ~30K URLs max)
│   ├── auto-dept-13-bouches-du-rhone.xml
│   ├── auto-dept-75-paris.xml
│   ├── ...                               (101 fichiers département)
│   ├── auto-profils-dept-75.xml          (couche 2 : profils × ville)
│   ├── auto-assureurs.xml                (couche 3 : assureur × ville)
│   ├── auto-tarifs-dept-75.xml           (couche 4-5 : tarifs)
│   ├── auto-comparatifs.xml              (couche 6 : A-vs-B)
│   ├── auto-hubs.xml                     (couches 7-8 : départements + régions)
│   ├── auto-besoins.xml                  (couche 9 : véhicule/besoin × ville)
│   ├── auto-evenements.xml               (couche 11 : résiliation, déménagement...)
│   └── auto-guides.xml                   (couche 10 : guides)
│
├── /sitemaps/habitation/
│   ├── habitation-dept-01-ain.xml
│   └── ...
│
├── /sitemaps/mutuelle/
│   └── ...
│
├── /sitemaps/blog.xml
└── /sitemaps/guides-general.xml
```

**Règles de sharding** :
- **Max 30 000 URLs par fichier** (pas 50K — Google traite mieux les petits fichiers)
- **`lastmod` précis** : date du dernier import de données, PAS la date du build. Faux `lastmod` = perte de confiance sitemap
- **1 fichier = 1 verticale × 1 département** pour les couches ville (1, 2, 4, 5)
- Les couches à faible volume (guides, hubs, blog) sont regroupées

### Génération

```bash
# Cron quotidien (ou après import de données)
COUNTRY=fr node scripts/generate-sitemaps.ts

# Génère des fichiers statiques dans /public/sitemaps/
# Puis notifie IndexNow avec les URLs modifiées
```

### Image sitemap + News sitemap

> **Prouvé par ServicesArtisans** : `image-sitemap.xml/route.ts` + `news-sitemap.xml/route.ts`. Les sitemaps texte ne suffisent pas.

#### /image-sitemap.xml

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://comparateur-assurance.fr/assurance-auto/lyon</loc>
    <image:image>
      <image:loc>https://cdn.comparateur-assurance.fr/logos/maif.svg</image:loc>
      <image:title>Logo MAIF — Assurance auto à Lyon</image:title>
      <image:caption>MAIF, assureur auto à Lyon (69) — prime moyenne 520€/an</image:caption>
    </image:image>
  </url>
</urlset>
```

**Contenu** :
- Logos des 50+ assureurs par pays (SVG/WebP)
- Images génériques par verticale (voiture, maison, stéthoscope)
- Chaque image avec `<image:title>` et `<image:caption>` localisés
- Cache-Control: `public, s-maxage=86400, stale-while-revalidate=86400`
- Last-Modified header pour HTTP 304

#### /news-sitemap.xml

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://comparateur-assurance.fr/blog/reforme-assurance-2026</loc>
    <news:news>
      <news:publication>
        <news:name>Comparateur Assurance</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>2026-03-21T10:00:00+01:00</news:publication_date>
      <news:title>Réforme assurance auto 2026 : ce qui change</news:title>
    </news:news>
  </url>
</urlset>
```

**Règles** :
- Articles blog < **48h uniquement** (exigence Google News)
- `<news:publication>` localisé par pays (nom + langue)
- Last-Modified header pour HTTP 304 (évite recrawl inutile)
- Peut légitimement être vide (0 articles récents)
- Requis pour apparaître dans Google News

### Flux RSS par verticale et par pays

Google s'abonne automatiquement aux flux RSS découverts dans le HTML. Accélère la découverte des nouvelles pages sans attendre le crawl des sitemaps.

```xml
<!-- Dans le <head> de chaque page -->
<link rel="alternate" type="application/rss+xml"
  title="Assurance Auto France — Nouvelles pages"
  href="/rss/auto.xml" />
```

```
/rss/auto.xml            → 50 dernières pages auto publiées
/rss/habitation.xml      → 50 dernières pages habitation publiées
/rss/mutuelle.xml        → 50 dernières pages mutuelle publiées
/rss/guides.xml          → Derniers guides publiés
/rss/blog.xml            → Derniers articles blog
```

**Implémentation** (pattern ServicesArtisans : `feed/blog.xml/route.ts`) :
- Route API Next.js → RSS 2.0
- Cache : `s-maxage=3600, stale-while-revalidate=86400`
- `<atom:link rel="self">` pour auto-découverte
- `escapeXml()` sur toutes les données dynamiques
- Déclaration dans `robots.txt` ET dans `<head>` de chaque page
- Revalidation toutes les heures

### Déploiement progressif des pages

**Ne pas lancer 9.2M pages (France) d'un coup.** 60% des sites programmatiques qui déploient massivement d'un coup subissent une désindexation. Zapier est passé de 100 à 70 000 pages sur plusieurs années.

```
Phase A — 100K pages
  → 7 verticales × top 300 villes × couches 1 + 7 + 8
  → Monitorer : ratio indexation, crawl rate, Search Console
  → Seuil pour passer à B : ratio indexation > 60%

Phase B — 500K pages
  → Ajouter couches 2, 3, 4 (profils, assureurs, tarifs) pour top 300 villes
  → Ajouter les 2 449 villes suivantes en couche 1
  → Seuil pour passer à C : ratio indexation > 60%, pas de pénalité

Phase C — Scale complet
  → Toutes les communes, toutes les couches
  → Déployer ~100K pages/semaine max
  → 1 deploy par semaine = bonne pratique confirmée
```

### Schemas JSON-LD — 14 schemas (base ServicesArtisans + financiers)

> **Track record ServicesArtisans (J+33, Google Search Console)** :
> - Fils d'Ariane : **4 322 valides**, 1 erreur
> - FAQ : **2 124 valides**, 0 erreur
> - Extraits de produits : **158 valides**, 0 erreur
> - Pages de profil : **61 valides**, 0 erreur
>
> Google fait confiance au balisage. L'implémentation est propre. On transpose le même niveau de rigueur sur l'assurance.

> **Rôle stratégique anti-AI Overviews** : Les données structurées `FinancialProduct` + `InsuranceProduct` avec `offers[]` signalent à Google que la page est **transactionnelle** (comparateur avec devis réels), pas informative. Google ne peut pas remplacer un outil interactif par une réponse IA. C'est le bouclier qui protège les 2.3M pages de la cannibalisation par AI Overviews.

> **Copié de** : `src/lib/seo/jsonld.ts` (425+ lignes) — ServicesArtisans implémente déjà **14 schemas JSON-LD** complets. On les copie tous et on ajoute les schemas financiers spécifiques.

**Schemas copiés de SA (fonctionnels tels quels)** :
- `getOrganizationSchema()` — Organization avec contact, areaServed
- `getWebsiteSchema()` — WebSite + SearchAction (recherche interne)
- `getBreadcrumbSchema()` — BreadcrumbList (Google-compliant)
- `getFAQSchema()` — FAQPage (rich snippets FAQ)
- `getHowToSchema()` — HowTo (guides étape par étape)
- `getItemListSchema()` — ItemList (pages listing/classement)
- `getPlaceSchema()` — City/Place (pages géo)
- `getCollectionPageSchema()` — CollectionPage (hubs)
- `getSpeakableSchema()` — SpeakableSpecification (AI Overviews)

**Schemas adaptés de SA** :
- `getServicePricingSchema()` → `getInsurancePricingSchema()` — AggregateOffer avec prix min/max
- `getLocalServiceSchema()` → `getLocalInsuranceSchema()` — InsuranceProduct avec city-level areaServed
- `getServiceRatingSchema()` → `getInsurerRatingSchema()` — AggregateRating (avis clients)
- `getComparisonReviewSchema()` — Review avec positiveNotes/negativeNotes (déjà pour comparatifs)

**Schemas nouveaux (assurance-spécifiques)** :
- `getInsuranceProductSchema()` — InsuranceProduct (couches 1, 2, 3)
- `getFinancialProductSchema()` — FinancialProduct + Pros/Cons (couche 6 : comparatifs)

Les schemas financiers spécifiques augmentent le CTR de **+20-35%** grâce aux rich results.

#### InsuranceProduct (couches 1, 2, 3)

```json
{
  "@context": "https://schema.org",
  "@type": "InsuranceProduct",
  "name": "Assurance Auto à Lyon — Jeune conducteur",
  "provider": {
    "@type": "InsuranceAgency",
    "name": "Comparateur Assurance",
    "identifier": "ORIAS XXXXXXX"
  },
  "areaServed": {
    "@type": "City",
    "name": "Lyon"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "450",
    "highPrice": "1200",
    "priceCurrency": "EUR",
    "offerCount": "12"
  }
}
```

#### FinancialProduct + Pros/Cons (couche 6 : comparatifs)

```json
{
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "MAIF vs AXA — Assurance Auto Lyon",
  "review": {
    "@type": "Review",
    "positiveNotes": {
      "@type": "ItemList",
      "itemListElement": [
        "MAIF : meilleur tarif jeune conducteur (-15%)",
        "AXA : couverture bris de glace incluse"
      ]
    },
    "negativeNotes": {
      "@type": "ItemList",
      "itemListElement": [
        "MAIF : pas d'assistance 0 km",
        "AXA : franchise plus élevée (300€)"
      ]
    }
  }
}
```

#### BreadcrumbList (toutes les couches)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "position": 1, "name": "Accueil", "item": "https://comparateur-assurance.fr/" },
    { "position": 2, "name": "Assurance Auto", "item": "/assurance-auto" },
    { "position": 3, "name": "Rhône (69)", "item": "/assurance-auto/rhone-69" },
    { "position": 4, "name": "Lyon", "item": "/assurance-auto/lyon" },
    { "position": 5, "name": "Jeune conducteur", "item": "/assurance-auto/jeune-conducteur/lyon" }
  ]
}
```

#### SpeakableSpecification (Voice AI — pattern ServicesArtisans)

> **Prouvé par ServicesArtisans** : JSON-LD `SpeakableSpecification` avec `cssSelectors`. Anticipation des recherches vocales et AI Overviews. Coût : 10 lignes de JSON-LD.

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [
      ".risk-verdict",
      ".price-estimate",
      ".faq-answer"
    ]
  }
}
```

Cible les blocs qu'un assistant vocal lirait :
- "La prime auto moyenne à Lyon est de 687€ par an"
- "Le niveau de risque est élevé"
- "L'assureur le moins cher est Eurofil à 420€/an"

Les recherches vocales et les AI Overviews de Google vont de plus en plus lire ces blocs.

### Maillage interne — 45-50 liens par page

Le maillage interne est le **levier SEO #1** sur un site programmatique (étude sur 23M liens : pic de trafic organique corrélé à 45-50 liens internes/page). Avec 2.3M pages, **0 page orpheline** — chaque page accessible en 2-3 clics via la hiérarchie en silo (hub vertical → région → département → commune).

#### Graphe hiérarchique à 4 niveaux

```
                    ┌─────────────┐
                    │   PAYS      │
                    │ /assurance  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌───┴────┐ ┌────┴─────┐
        │  RÉGION   │ │ RÉGION │ │  RÉGION  │
        │ /region/  │ │        │ │          │
        │ idf       │ │  aura  │ │   paca   │
        └─────┬─────┘ └───┬────┘ └────┬─────┘
              │            │            │
        ┌─────┴─────┐     │      ┌────┴─────┐
        │   DEPT    │     │      │   DEPT   │
        │ /dept/    │     │      │ /dept/   │
        │ paris-75  │     │      │ bdr-13   │
        └─────┬─────┘     │      └────┬─────┘
              │            │            │
     ┌────────┼────┐       │     ┌─────┼────────┐
     │        │    │       │     │     │        │
  ┌──┴──┐ ┌──┴─┐ ┌┴──┐    │  ┌──┴──┐ ┌┴───┐ ┌──┴──┐
  │VILLE│ │VILL│ │VIL│    │  │VILLE│ │VILL│ │VILLE│
  │paris│ │boul│ │nan│    │  │mars│ │aix │ │toulo│
  └──┬──┘ └────┘ └───┘    │  └──┬──┘ └────┘ └─────┘
     │                     │     │
  ┌──┴───────────────┐     │  ┌──┴───────────────┐
  │ 12 LAYERS        │     │  │ 12 LAYERS        │
  │ /profil/ville    │     │  │ /profil/ville    │
  │ /assureur/ville  │     │  │ /assureur/ville  │
  │ /tarifs/ville    │     │  │ /tarifs/ville    │
  │ /a-vs-b/ville   │     │  │ /a-vs-b/ville   │
  └──────────────────┘     │  └──────────────────┘
```

#### 9 types de liens par page — Objectif 45-50 liens

Chaque page générée inclut **9 catégories de liens internes**, calculés par la Couche 3 (Calcul) :

| # | Type de lien | Direction | Exemple depuis `/assurance-auto/lyon` | Liens |
|---|-------------|-----------|--------------------------------------|-------|
| 1 | **Layers frères** | Horizontal | → `/lyon/tarifs`, `/lyon/jeune-conducteur`, `/lyon/maif` | 8-12 |
| 2 | **Villes voisines** | Horizontal | → `/villeurbanne`, `/vénissieux`, `/caluire` | 8-10 |
| 3 | **Département parent** | Ascendant | → `/departement/rhone-69` | 1 |
| 4 | **Région parent** | Ascendant | → `/region/auvergne-rhone-alpes` | 1 |
| 5 | **Verticales croisées** | Transversal | → `/assurance-habitation/lyon`, `/mutuelle-sante/lyon` | 6 |
| 6 | **Assureurs locaux** | Descendant | → `/maif/lyon`, `/axa/lyon`, `/macif/lyon` | 5 |
| 7 | **Comparatifs** | Descendant | → `/maif-vs-axa/lyon`, `/macif-vs-matmut/lyon` | 3-5 |
| 8 | **Contenu éditorial** | Transversal | → `/guide/jeune-conducteur`, `/guide/bonus-malus` | 3-4 |
| 9 | **Profils/besoins liés** | Horizontal | → `/suv/lyon`, `/resiliation/lyon` | 4-6 |
| | | | **Total** | **45-50** |

#### Calcul des villes voisines

```typescript
// src/engine/compute.ts — dans computeInsights()
function findNearbyCities(city: City, allCities: City[], limit = 10): City[] {
  // Haversine distance — pré-calculée et stockée en DB
  // Critères de sélection :
  // 1. Distance < 30km
  // 2. Priorité aux villes de population supérieure (PageRank effect)
  // 3. Maximum 10 villes, minimum 3
  // 4. Toujours inclure la préfecture du département si différente
  return allCities
    .filter(c => c.id !== city.id && haversine(city, c) < 30)
    .sort((a, b) => b.population - a.population)
    .slice(0, limit)
}
```

**Table DB de support** :

```sql
-- Table pré-calculée pour éviter le calcul Haversine à chaque requête
CREATE TABLE city_neighbors (
  city_id UUID REFERENCES cities(id),
  neighbor_id UUID REFERENCES cities(id),
  distance_km DECIMAL(6,2) NOT NULL,
  PRIMARY KEY(city_id, neighbor_id)
);

CREATE INDEX idx_neighbors_city ON city_neighbors(city_id, distance_km);

-- Peuplé par script : ~71 700 villes × 10 voisins = ~748K lignes
-- Recalculé uniquement si la table cities change (jamais en pratique)
```

#### Composant de maillage

```typescript
// src/components/seo/InternalLinks.tsx
type InternalLinksProps = {
  ctx: PageContext
  nearby: City[]
  parentDept: Department
  parentRegion: Region
  verticals: VerticalKey[]
  topInsurers: Insurer[]
  comparisons: Comparison[]
  relatedGuides: Guide[]
  relatedProfiles: Profile[]
  relatedNeeds: Need[]
}

// Rendu : blocs de liens en bas de page
// - "Assurance auto dans les villes proches" (8-10 liens)
// - "Toutes les assurances à Lyon" (6 liens cross-vertical)
// - "Comparez les assureurs à Lyon" (5 liens assureurs + 3-5 comparatifs)
// - "Profils et besoins" (4-6 liens profils + besoins)
// - "Lyon, Rhône — Auvergne-Rhône-Alpes" (breadcrumb géo)
// - "Nos guides assurance auto" (3-4 liens)
```

#### Maillage entre verticales (liens transversaux)

```
/assurance-auto/lyon ←→ /assurance-habitation/lyon
                     ←→ /mutuelle-sante/lyon
                     ←→ /assurance-moto/lyon
                     ←→ /assurance-emprunteur/lyon
                     ←→ /assurance-professionnelle/lyon
                     ←→ /assurance-vie/lyon
```

Chaque page de ville affiche un bloc **"Toutes les assurances à {ville}"** avec des liens vers les 6 autres verticales. Ce maillage transversal est **critique** : il distribue l'autorité SEO entre verticales et augmente le temps passé sur le site.

#### Maillage des pages contenu (guides/questions/blog)

Les pages éditoriales ont un rôle spécial dans le maillage :

```
Guide "Jeune conducteur"
  → liens vers les 10 plus grandes villes (auto)
  → liens vers les questions liées (bonus-malus, permis)
  → liens vers les assureurs spécialisés jeunes

Page commune "Paris / Auto"
  → lien vers le guide "Jeune conducteur" (si pertinent)
  → lien vers les comparatifs locaux (MAIF vs AXA)
  → lien vers le blog (articles récents auto)
```

**Règle** : chaque guide/question contient **au minimum 5 liens vers des pages programmatiques** (villes). Les pages programmatiques contiennent **au maximum 4 liens vers du contenu éditorial** (pour ne pas diluer le jus vers des pages à faible volume).

#### Breadcrumbs (fil d'Ariane)

Chaque page inclut un breadcrumb structuré (JSON-LD `BreadcrumbList`) :

```
Accueil > Assurance Auto > Rhône (69) > Lyon
Accueil > Assurance Auto > Rhône (69) > Lyon > Jeune conducteur
Accueil > Assurance Auto > Rhône (69) > Lyon > MAIF
Accueil > Assurance Auto > MAIF vs AXA > Lyon
Accueil > Assurance Auto > Tarifs > Rhône (69) > Lyon
Accueil > Guides > Assurance Auto > Jeune conducteur
```

#### Métriques de maillage à surveiller

| Métrique | Cible | Outil |
|----------|-------|-------|
| Pages orphelines (0 lien entrant) | **0** | Screaming Frog / script crawl |
| Liens internes par page | **45-50** | Crawl interne |
| Profondeur max (clics depuis homepage) | **≤ 3** | Crawl interne |
| Ratio liens internes / liens externes | > 10:1 | Audit SEO |
| Pages à 1 seul lien entrant | < 5% | Crawl interne |
| Couverture breadcrumb | 100% | Validation JSON-LD |

#### Pagination et liens "Voir plus"

Pour les pages département (101 communes en moyenne) et région (5-10 départements) :
- **Départements** : afficher les 20 plus grandes villes + lien "Voir les {n} communes du {département}"
- **Régions** : afficher tous les départements (toujours < 15)
- Pas de pagination infinie — une seule page avec lazy-loading si nécessaire

### Pruning actif — Suppression des pages non-rankées

Kevin Indig recommande de supprimer **10-20% des pages par an** qui ne rankent pas. Les pages inutiles diluent l'autorité du domaine.

```
Après 6 mois de déploiement :
  1. Extraire les pages avec 0 impressions (Search Console API)
  2. Croiser avec les pages à 0 clics organiques (Analytics)
  3. Supprimer ou noindex les pages identifiées
  4. Redirect 301 vers la page hub parent (département)
  5. Mettre à jour les sitemaps

Critères de suppression :
  - 0 impressions après 6 mois
  - 0 trafic organique après 6 mois
  - Contenu insuffisant (< 500 mots uniques)
  - Score de différenciation < 30% vs pages similaires
```

**Automatisation** : cron mensuel qui identifie les candidats, les marque `noindex`, et envoie un rapport pour validation avant suppression définitive.

### robots.txt — Copié de ServicesArtisans (même stratégie)

> **Prouvé par ServicesArtisans** : `src/app/robots.ts` — 175 lignes. Distinction fine entre bots IA search (autorisés) et bots IA training (bloqués). 1 fichier, copier-coller direct.

```
# robots.txt

# ═══════════════════════════════════════════
# MOTEURS DE RECHERCHE — Priorité absolue
# ═══════════════════════════════════════════
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: AdsBot-Google
Allow: /

User-agent: APIs-Google
Allow: /

# ═══════════════════════════════════════════
# BOTS IA SEARCH — AUTORISÉS (visibilité dans les réponses IA)
# On VEUT être cité dans ChatGPT, Perplexity, Claude, etc.
# ═══════════════════════════════════════════
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: YouBot
Allow: /

User-agent: Google-CloudVertexBot
Allow: /

# ═══════════════════════════════════════════
# BOTS SOCIAUX — AUTORISÉS (previews OG tags)
# ═══════════════════════════════════════════
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: Slackbot
Allow: /

User-agent: TelegramBot
Allow: /

User-agent: Discordbot
Allow: /

User-agent: WhatsApp
Allow: /

# ═══════════════════════════════════════════
# BOTS IA TRAINING — BLOQUÉS (protéger le contenu original)
# ═══════════════════════════════════════════
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Timpibot
Disallow: /

User-agent: Diffbot
Disallow: /

# ═══════════════════════════════════════════
# SCRAPERS SEO AGRESSIFS — BLOQUÉS (ressources)
# ═══════════════════════════════════════════
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

User-agent: PetalBot
Disallow: /

User-agent: DataForSeoBot
Disallow: /

User-agent: Bytespider
Disallow: /

# ═══════════════════════════════════════════
# RÈGLES GLOBALES
# ═══════════════════════════════════════════
User-agent: *
Disallow: /_next/static/
Disallow: /admin/
Disallow: /api/
Disallow: /*?sort=
Disallow: /*?page=
Disallow: /*?filter=
Disallow: /*?utm_
Disallow: /*?redirect=

# ═══════════════════════════════════════════
# SITEMAPS + FEEDS
# ═══════════════════════════════════════════
Sitemap: https://{domain}/sitemap.xml
Sitemap: https://{domain}/image-sitemap.xml
Sitemap: https://{domain}/news-sitemap.xml

# Feeds RSS
Sitemap: https://{domain}/rss/auto.xml
Sitemap: https://{domain}/rss/habitation.xml
Sitemap: https://{domain}/rss/mutuelle.xml
Sitemap: https://{domain}/rss/guides.xml
Sitemap: https://{domain}/rss/blog.xml
```

> **Stratégie** : visible dans les résultats IA (ChatGPT, Perplexity, Claude) mais pas utilisé pour entraîner des modèles. Pas scrappé par les outils SEO concurrents. Previews sociaux fonctionnels. Élimine **50%+ du gaspillage de crawl**.

### Log file analysis — Comportement réel de Googlebot

Analyser les logs serveur pour comprendre ce que Googlebot crawle **réellement** vs ce qu'on lui soumet dans les sitemaps.

```typescript
// scripts/analyze-crawl-logs.ts
// Analyse des logs Vercel (ou export vers BigQuery)

type CrawlLogEntry = {
  timestamp: Date
  bot: 'Googlebot' | 'Bingbot' | 'GPTBot' | 'other'
  url: string
  status: number
  responseTime: number
}

// Métriques à extraire :
// 1. Quelles pages sont crawlées (top 100 URLs)
// 2. Quelles pages sont ignorées (jamais crawlées en 30j)
// 3. Fréquence de crawl par type de page
// 4. Temps de réponse moyen par couche
// 5. Taux de 404/500 rencontrés par les bots
```

| Métrique | Cible | Action si hors cible |
|----------|-------|----------------------|
| Pages crawlées / pages indexées | > 80% | Améliorer maillage vers pages ignorées |
| Fréquence crawl pages clés | > 1×/semaine | Soumettre via IndexNow |
| Taux 404 crawlés | < 0.1% | Corriger redirections |
| Crawl budget gaspillé (params, facettes) | < 5% | Durcir robots.txt |

### Contenu unique — Seuils de qualité

| Critère | Seuil minimum | Notre cible | Statut |
|---------|---------------|-------------|--------|
| Mots uniques par page | 500+ | 800-1200 | Garanti par 15 sources de données |
| Différenciation entre pages | 30-40% | **90-95%** | Données locales uniques par commune |
| TTFB | < 100ms | **58ms** | Top tier (seuil expert : 100ms) |
| ISR + cache | Recommandé | Oui | Architecture standard pour le programmatique |
| Schema JSON-LD | Basique | Financier complet | `InsuranceProduct` + Pros/Cons |
| Deploy fréquence | 1/semaine | 1/semaine | Bonne pratique confirmée |

### Checklist technique pré-lancement

| # | Action | Impact | Statut |
|---|--------|--------|--------|
| 1 | TTFB < 100ms sur toutes les pages | 4× crawl rate. Cible : 58ms | Architecture ISR |
| 2 | Sitemaps shardés 30K URLs par fichier | Traitement en 2j vs semaines | Scripts à implémenter |
| 3 | 45-50 liens internes par page | Pic de trafic organique (étude 23M liens) | Composant InternalLinks |
| 4 | 0 page orpheline | Chaque page accessible en 2-3 clics | Maillage automatisé |
| 5 | Schema JSON-LD sur chaque template | +20-35% CTR. `InsuranceProduct` + Pros/Cons | À implémenter |
| 6 | Flux RSS par verticale | Découverte accélérée des nouvelles pages | Routes API RSS |
| 7 | robots.txt optimisé (bloquer facettes, params, IA) | Élimine 50%+ du gaspillage de crawl | Config à écrire |
| 8 | `lastmod` précis (pas date du build) | Confiance sitemap préservée | Script import |
| 9 | Déploiement progressif (100K puis scale) | Évite la désindexation massive (60% échec) | Process |
| 10 | 500+ mots uniques par page | Seuil qualité Google confirmé | Garanti par données |
| 11 | 30-40% différenciation min entre pages | En dessous = thin content. Nous : 90-95% | Garanti par données |
| 12 | Ratio indexation > 60% | En dessous = problème systémique | Monitoring Search Console |

---

## 7bis. Performance & Vitesse Serveur

### Objectifs Core Web Vitals

| Métrique | Cible | Seuil Google "Good" |
|----------|-------|---------------------|
| **LCP** (Largest Contentful Paint) | < 1.5s | < 2.5s |
| **FID/INP** (Interaction to Next Paint) | < 100ms | < 200ms |
| **CLS** (Cumulative Layout Shift) | < 0.05 | < 0.1 |
| **TTFB** (Time to First Byte) | < 200ms (cache hit), < 800ms (cache miss) | < 800ms |
| **FCP** (First Contentful Paint) | < 1.0s | < 1.8s |

### Architecture de cache — 4 niveaux

```
┌────────────────────────────────────────────────────────────────┐
│                    REQUÊTE UTILISATEUR                         │
│                    GET /assurance-auto/lyon                    │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  NIVEAU 1 — CDN EDGE (Vercel Edge Network)                    │
│                                                                │
│  Cache-Control: s-maxage=86400, stale-while-revalidate=604800 │
│  = Page servie depuis le POP le plus proche                   │
│  = 0 compute, ~50ms TTFB                                      │
│                                                                │
│  HIT → Réponse instantanée (~50ms)                            │
│  STALE → Réponse instantanée + revalidation en background     │
│  MISS ↓                                                       │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  NIVEAU 2 — ISR CACHE (Vercel Data Cache)                     │
│                                                                │
│  Next.js ISR : revalidate = 86400 (24h)                       │
│  = Page HTML pré-rendue stockée                               │
│  = Si expiré, régénération en background                      │
│                                                                │
│  HIT → ~100ms TTFB                                            │
│  MISS ↓ (première visite de cette page)                       │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  NIVEAU 3 — RSC RENDERING (Serverless Function)               │
│                                                                │
│  Couche 1 → 2 → 3 → 4 du moteur                              │
│  = 6 queries Supabase parallèles                              │
│  = Calcul insights                                            │
│  = Rendu React Server Component                               │
│                                                                │
│  Temps : ~500-800ms                                           │
│  Cold start : +200-500ms supplémentaires                      │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  NIVEAU 3.5 — CACHE APPLICATIF L1/L2 (Copié de SA)           │
│                                                                │
│  L1 : In-memory Map (durée Lambda, 60s TTL max)              │
│  = 0ms, même invocation serverless                            │
│                                                                │
│  L2 : Redis Upstash (~1ms, cross-instances, ~5€/mois)        │
│  = Partagé entre toutes les fonctions Vercel                  │
│                                                                │
│  Pattern : L1 → L2 → DB → écrire L1 + L2                    │
│  skipNull: true → ne cache PAS les erreurs DB                │
│  Déduplication des requêtes concurrentes identiques           │
│                                                                │
│  TTLs :                                                        │
│  city_risk_data : 24h (change 1×/an)                          │
│  communes (lat/lng, pop) : 7 jours (change jamais)            │
│  city_neighbors : 7 jours (change jamais)                     │
│  insurers : 1h (change rarement)                              │
│  guides/questions : 1h + invalidation on-demand               │
│                                                                │
│  Impact mesuré : TTFB ÷1.3-1.5 sur les cache miss ISR        │
│  (÷2-3 uniquement si L1 hit rate > 80%, à valider en prod)  │
└───────────────────────────┬────────────────────────────────────┘
                            │ (L1+L2 miss uniquement)
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  NIVEAU 4 — BASE DE DONNÉES (Supabase / PostgreSQL)           │
│                                                                │
│  Connection pooler (PgBouncer) : transaction mode              │
│  6 queries parallèles → ~50-150ms total                       │
│  Indexes couvrants → zero heap fetch                          │
│                                                                │
│  Résultat mis en cache aux niveaux 3.5, 2 et 1                │
└────────────────────────────────────────────────────────────────┘
```

### Scénarios de performance réels

| Scénario | TTFB | LCP | Comment |
|----------|------|-----|---------|
| Page populaire (Paris, Lyon) — cache chaud | ~50ms | ~800ms | CDN edge hit |
| Page moyenne — ISR cache | ~100ms | ~1.0s | Vercel data cache |
| Page rare (petite commune) — 1ère visite | ~800ms | ~1.8s | Rendering complet |
| Page rare — cold start serverless | ~1.2s | ~2.2s | Worst case, encore dans le "Good" |
| Page déjà visitée — navigateur | 0ms | ~300ms | Cache navigateur |

### Optimisations Supabase — Queries ultra-rapides

#### Indexes couvrants (zero heap fetch)

> Voir **Section 5 — Covering indexes** pour les migrations SQL complètes (5 index couvrants). Query time 50ms → 2ms sur `city_risk_data` (1.6M lignes).

#### Connection pooling

```
Supabase connection string :
postgresql://postgres:[password]@db.[ref].supabase.co:6543/postgres
                                                      ^^^^
                                                      Port 6543 = PgBouncer (transaction mode)
                                                      Port 5432 = Direct (session mode)
```

**Toujours utiliser le port 6543** (PgBouncer) pour les serverless functions :
- Pool de connexions partagé
- Pas de surcharge de connexion à chaque cold start
- Max 200 connexions simultanées (vs ~20 en direct)

#### Batch des 6 queries avec Promise.all()

```typescript
// src/engine/data.ts
async function fetchPageData(ctx: PageContext): Promise<PageData> {
  // TOUTES les queries partent en parallèle — temps total = max(queries) pas sum(queries)
  const [city, risk, insurers, neighbors, guides, stats] = await Promise.all([
    // Query 1 : Ville + département + région — ~2ms (index couvrant)
    supabase.from('cities')
      .select('*, department:departments(*), region:departments!inner(region:regions(*))')
      .eq('country_code', ctx.country)
      .eq('slug', ctx.citySlug)
      .single(),

    // Query 2 : Données de risque — ~3ms (index couvrant sur city_id + vertical)
    supabase.from('city_risk_data')
      .select('data, year, source')
      .eq('city_id', ctx.cityId)
      .eq('vertical_key', ctx.vertical)
      .order('year', { ascending: false })
      .limit(3),

    // Query 3 : Assureurs pour cette verticale — ~5ms
    supabase.from('insurer_verticals')
      .select('*, insurer:insurers(*)')
      .eq('vertical_key', ctx.vertical)
      .order('price_range_min'),

    // Query 4 : Villes voisines — ~2ms (index + limit 10)
    supabase.from('city_neighbors')
      .select('neighbor:cities!neighbor_id(id, name, slug, population)')
      .eq('city_id', ctx.cityId)
      .order('distance_km')
      .limit(10),

    // Query 5 : Guides liés — ~2ms
    supabase.from('guides')
      .select('slug, title')
      .eq('country_code', ctx.country)
      .eq('vertical_key', ctx.vertical)
      .limit(5),

    // Query 6 : Stats agrégées département — ~5ms
    supabase.rpc('get_department_stats', {
      dept_id: ctx.departmentId,
      vertical: ctx.vertical
    }),
  ])

  // Temps total : ~5-10ms (max des 6 queries)
  // Pas 20-30ms (sum des 6 queries en séquentiel)
  return { city, risk, insurers, neighbors, guides, stats }
}
```

### Optimisations Next.js / React

#### RSC (React Server Components) — zéro JS client

```typescript
// Toutes les pages sont 100% RSC — pas de "use client"
// Le HTML est streamé directement, pas de hydration
// Bundle JS client : ~0 KB pour les pages de contenu

// Exception unique : le formulaire lead
// src/components/forms/LeadForm.tsx
'use client'  // Seul composant client — interactivité formulaire
```

**Impact** : une page typique envoie **~50 KB de HTML** et **~15 KB de JS** (framework Next.js + formulaire). Pas de React hydration = FID/INP quasi-nul.

#### Streaming et Suspense

```typescript
// src/app/[...slug]/page.tsx
import { Suspense } from 'react'

export default async function Page({ params }) {
  const ctx = resolve(params.slug)
  const data = await fetchPageData(ctx)  // Données critiques — bloque le rendu
  const insights = computeInsights(ctx, data)

  return (
    <>
      {/* Contenu principal — rendu immédiat */}
      <HeroSection ctx={ctx} insights={insights} />
      <RiskAnalysis data={data} insights={insights} />
      <InsurerRanking insurers={data.insurers} insights={insights} />

      {/* Formulaire — streamé en priorité */}
      <LeadForm ctx={ctx} />

      {/* Contenu secondaire — streamé après */}
      <Suspense fallback={<LinksSkeleton />}>
        <NearbyLinks ctx={ctx} neighbors={data.neighbors} />
        <VerticalCrossLinks ctx={ctx} />
        <RelatedGuides guides={data.guides} />
      </Suspense>
    </>
  )
}
```

#### Images optimisées

```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280],  // Pas de 1920/2560 — pas besoin pour ce type de site
    minimumCacheTTL: 2592000,  // 30 jours
    // Images servies depuis Vercel Image Optimization (CDN edge)
  },
}

// Logos assureurs : SVG quand possible (vectoriel, ~2 KB)
// Sinon : WebP/AVIF via next/image, lazy-loading natif
// Pas de hero images géantes — ce n'est pas un site vitrine
```

#### Fonts optimisées

```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',           // Texte visible immédiatement
  preload: true,
  variable: '--font-inter',
  // Subset automatique par Next.js : seuls les glyphes utilisés sont chargés
})
```

### Headers de cache — Stratégie par type de page

```typescript
// src/middleware.ts ou dans les pages directement

// Pages programmatiques (communes, départements, régions)
// = Données changent rarement (import trimestriel)
export const revalidate = 86400  // 24h ISR
// CDN : s-maxage=86400, stale-while-revalidate=604800

// Pages contenu (guides, questions, blog)
// = Changent quand on édite
export const revalidate = 3600  // 1h ISR
// On-demand revalidation via webhook admin

// API leads
// = Jamais caché
// Cache-Control: no-store, no-cache

// Sitemaps (fichiers statiques /public/sitemaps/)
// = Changent au cron
// Cache-Control: public, max-age=86400, stale-while-revalidate=86400
```

### On-demand ISR revalidation

> **Lacune corrigée** : ISR revalidate=86400 signifie que les pages restent stale pendant 24h max. Pour les mises à jour critiques (nouveau provider, correction de données), on a besoin d'une invalidation immédiate.

```typescript
// src/app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { paths } = await req.json()
  // paths: ['/assurance-auto/lyon', '/tarifs/assurance-auto/lyon']

  for (const path of paths) {
    revalidatePath(path)
  }

  return Response.json({ revalidated: paths.length })
}

// Appelé par :
// 1. Webhook post-import de données → invalide les villes concernées
// 2. Admin dashboard → bouton "Purger le cache"
// 3. Cron post-sitemap-generation → invalide les hubs modifiés
```

### Rate limiting : fail-open obligatoire

> **Règle critique** : Le rate limiter doit être **fail-open** par défaut. Si Redis tombe, les pages continuent à être servies. Ne JAMAIS bloquer du trafic SEO à cause d'un incident cache.

```typescript
// src/lib/rate-limiter.ts
const DEFAULT_CONFIG = {
  failOpen: true,  // TOUJOURS true par défaut — fail-closed = perte de trafic
}

// Seules les routes sensibles (API leads, admin) peuvent être fail-closed
```

### Monitoring cache hit/miss

```typescript
// src/lib/cache.ts — ajouter des métriques
const cacheMetrics = {
  l1_hits: 0,
  l2_hits: 0,
  misses: 0,
  errors: 0,
}

export async function getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // L1 check
  const l1 = memoryCache.get(key)
  if (l1) { cacheMetrics.l1_hits++; return l1 }

  // L2 check (Redis)
  const l2 = await redis.get(key)
  if (l2) { cacheMetrics.l2_hits++; memoryCache.set(key, l2); return l2 }

  // Miss → DB
  cacheMetrics.misses++
  const data = await fetcher()
  await Promise.all([
    memoryCache.set(key, data),
    redis.set(key, data, { ex: TTL }),
  ])
  return data
}

// Exposé via /api/admin/cache-stats — dashboard opérationnel
// Cible : L1 hit rate > 60%, L2 hit rate > 85%, miss < 15%
```

### Core Web Vitals — Monitoring continu

```typescript
// src/app/api/cron/cwv-check/route.ts
// Cron hebdomadaire : requête PageSpeed Insights API sur 20 pages représentatives

const PAGES_TO_TEST = [
  // 5 grandes villes (cache chaud)
  '/assurance-auto/paris', '/assurance-auto/lyon', '/assurance-auto/marseille',
  '/mutuelle-sante/toulouse', '/assurance-habitation/nice',
  // 5 petites communes (cache froid)
  '/assurance-auto/saint-pierre-de-chartreuse',
  // 5 pages hub
  '/assurance-auto/rhone-69', '/assurance-auto/auvergne-rhone-alpes',
  // 5 pages spéciales
  '/tarifs/assurance-auto/lyon', '/maif-vs-axa/lyon',
]

// Seuils d'alerte
const THRESHOLDS = {
  LCP: 2500,   // ms — alerte si > 2.5s (Good threshold Google)
  CLS: 0.1,    // alerte si > 0.1
  INP: 200,    // ms
  TTFB: 1500,  // ms — même cold start ne devrait pas dépasser 1.5s
}
```

### Protection contre les cold starts

```
Problème : Vercel serverless = cold start de 200-500ms après inactivité
Impact : TTFB passe de ~200ms à ~800ms pour la première requête

Solutions :
```

| Solution | Coût | Efficacité |
|----------|------|------------|
| **ISR cache** (déjà en place) | $0 | ✅ 99% des requêtes servies depuis le cache |
| **Vercel Fluid Compute** | Inclus Pro | ✅ Fonctions restent chaudes plus longtemps |
| **Edge Runtime** pour le resolve | $0 | ✅ Couche 1 (résolution) en <5ms edge, pas de cold start |
| **Cron keep-alive** | $0 | ⚠️ Ping toutes les 5min — hacky mais efficace |
| **Provisioned concurrency** | ~$30/mois | ✅ Garantit 1+ instance toujours chaude |

#### Middleware Edge — Copié de ServicesArtisans (~90% identique)

> **Prouvé par ServicesArtisans** : `src/middleware.ts` — 334 lignes, ~40ms, 0 cold start.

```typescript
// src/middleware.ts — Adapté de ServicesArtisans
export const config = { matcher: ['/((?!api|_next|sitemaps).*)'] }

export default function middleware(request: NextRequest) {
  // ═══ IDENTIQUE à ServicesArtisans (copier-coller) ═══
  // 1. Canonicalisation URL (301 cachées au CDN edge)
  //    - HTTP → HTTPS
  //    - www → non-www
  //    - Trailing slash removal
  //    - Lowercase enforcement
  //    - UTM parameter stripping (canonicals propres)
  //    → Exécuté EN PREMIER (avant CSP nonce = évite crypto inutile)

  // 2. Rate limiting fail-open
  //    - Redis Upstash (même instance que le cache L2)
  //    - Fallback in-memory si Redis down
  //    - JAMAIS bloquer du trafic à cause d'une erreur rate limiter

  // 3. CSP nonce injection
  //    - Nonce dynamique pour Stripe, Google Analytics, OSM

  // 4. Googlebot logging (fire-and-forget)
  //    - event.waitUntil() → non-bloquant
  //    - Log vers Supabase : URL crawlée, status, response time

  // 5. CDN cache headers
  //    - public, s-maxage=86400, stale-while-revalidate=604800
  //    - Routes privées : no-store + X-Robots-Tag: noindex

  // ═══ ADAPTÉ pour l'assurance ═══
  // 6. Domaine dynamique (lire depuis env COUNTRY)
  //    - Redirections spécifiques par pays

  // ═══ NOUVEAU ═══
  // 7. Détection langue pour BE
  //    - BE : commune → fr ou nl
  //    - Injection hreflang headers
}
```

### Budget de taille par page

| Ressource | Budget | Réel estimé |
|-----------|--------|-------------|
| HTML (streamé) | < 100 KB | ~50 KB |
| CSS (Tailwind purgé) | < 30 KB | ~15 KB |
| JS (framework + formulaire) | < 50 KB | ~15-30 KB |
| Fonts (Inter subset) | < 30 KB | ~20 KB |
| Images (logos assureurs) | < 50 KB | ~10-30 KB |
| **Total page** | **< 260 KB** | **~120-150 KB** |

À comparer : LeLynx.fr charge **~2.5 MB** par page (React SPA, trackers, pubs).

### Monitoring performance en production

```typescript
// src/lib/performance.ts — envoyé vers analytics
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Envoie LCP, FID, CLS, TTFB, FCP vers Vercel Analytics
  // ou vers un endpoint custom /api/vitals
}
```

| Outil | Usage | Fréquence |
|-------|-------|-----------|
| **Vercel Analytics** | Core Web Vitals en temps réel (RUM) | Continu |
| **Vercel Speed Insights** | Distribution LCP/CLS/INP | Continu |
| **Google Search Console** | Core Web Vitals (données terrain) | Hebdo |
| **PageSpeed Insights API** | Tests synthétiques sur pages clés | Cron quotidien |
| **Sentry Performance** | Traces serveur (TTFB, query time) | Continu |

#### Script de monitoring automatisé

```bash
# scripts/monitor-performance.ts
# Cron quotidien : teste 50 pages représentatives

# Pages testées :
# - 10 grandes villes (Paris, Lyon, Marseille...) → cache chaud
# - 10 petites communes aléatoires → cache froid
# - 7 pages département (1 par verticale)
# - 7 pages région
# - 7 pages guide
# - 7 pages assureur × ville
# - 2 pages baromètre

# Alerte si :
# - TTFB > 1.5s sur une page (même cache froid)
# - LCP > 2.5s
# - Taux d'erreur > 0.1%
```

### Comparaison performance vs concurrents

| Métrique | Notre cible | LeLynx | Assurland | LesFurets |
|----------|-------------|--------|-----------|-----------|
| TTFB | < 200ms | ~800ms | ~1.2s | ~600ms |
| LCP | < 1.5s | ~3.5s | ~4.0s | ~2.8s |
| Total page size | ~150 KB | ~2.5 MB | ~3.0 MB | ~2.0 MB |
| JS chargé | ~20 KB | ~800 KB | ~1.2 MB | ~600 KB |
| CLS | < 0.05 | ~0.15 | ~0.25 | ~0.12 |

**Avantage : RSC + ISR + pas de SPA = 10-20x plus léger que les concurrents qui sont des React SPA classiques avec des tonnes de trackers.**

---

## 8. Réglementation & Légal par pays

### Licences courtage par juridiction

Le statut **ORIAS** français ne permet pas d'exercer le courtage direct dans les autres pays sans passeport européen ou licence locale. Chaque pays a son propre régulateur et ses propres exigences.

| Pays | Régulateur | Licence requise | Registre | Passeport IDD depuis FR |
|------|-----------|-----------------|----------|-------------------------|
| France | ACPR | Courtier ORIAS | orias.fr | — (pays d'origine) |
| Allemagne | BaFin | §34d GewO (Versicherungsvermittler) | vermittlerregister.info | Oui — notification ACPR → BaFin |
| Espagne | DGSFP | Mediador de seguros | dgsfp.mineco.es | Oui — notification ACPR → DGSFP |
| Italie | IVASS | Intermediario RUI sezione B | servizi.ivass.it/RuirPubblica | Oui — notification ACPR → IVASS |
| Belgique | FSMA | Intermédiaire d'assurance | fsma.be/fr/registre | Oui — notification ACPR → FSMA |
| Pays-Bas | AFM | Vergunning verzekeringsbemiddeling | afm.nl/registers | Oui — notification ACPR → AFM |
| Autriche | FMA | Versicherungsvermittler | fma.gv.at | Oui — notification ACPR → FMA |
| Portugal | ASF | Mediador de seguros | asf.com.pt/registos | Oui — notification ACPR → ASF |
| Luxembourg | CAA | Intermédiaire d'assurance | caa.lu | Oui — notification ACPR → CAA |
| Irlande | Central Bank | Insurance Intermediary | centralbank.ie/regulation | Oui — notification ACPR → CBI |

### Passeport européen IDD (Insurance Distribution Directive)

```
Procédure pour exercer dans un autre pays EEE :

1. Obtenir le statut ORIAS en France (courtier, cat. COA)
2. Notifier l'ACPR de l'intention d'exercer en libre prestation de services (LPS)
   ou en libre établissement (LE)
3. L'ACPR transmet au régulateur du pays hôte
4. Délai : 1 mois (LPS) ou 2 mois (LE)
5. Pas de licence locale supplémentaire requise

Documents requis :
- Attestation ORIAS
- Programme d'activité
- Preuve de compétence professionnelle (150h formation)
- RC Pro (assurance responsabilité civile professionnelle)
- Garantie financière
```

### Stratégie de déploiement légal

```
Phase 1 — France uniquement
  → Courtage direct (ORIAS déjà obtenu ou en cours)
  → Lead gen en complément

Phase 2 — Expansion EEE via passeport IDD
  → Notification ACPR pour DE, ES, IT, BE, NL, AT, LU, IE
  → 1-2 mois par pays
  → Lead gen immédiat, courtage après notification

Phase 3 — Portugal
  → Notification ACPR → ASF
  → Lead gen immédiat, courtage après notification
  → 1-2 mois de délai
```

### Compliance matrix multi-pays

> **Chaque pays a des exigences différentes.** Un consentement valide en France peut être insuffisant en Allemagne. La config légale est per-country, pas globale.

| Obligation | FR (CNIL) | DE (BfDI) | IT (Garante) | ES (AEPD) | BE (APD) | PT (CNPD) |
|------------|-----------|-----------|--------------|-----------|----------|------------|
| Base légale leads | Consentement | Consentement (strict) | Consentement + info | Consentement | Consentement | Consentement |
| Double opt-in | Recommandé | **Obligatoire** | Recommandé | Recommandé | Recommandé | Recommandé |
| Conservation max | 3 ans | 3 ans | 2 ans | 3 ans | 3 ans | 3 ans |
| DPO obligatoire | > 5000 leads/mois | **Toujours** (si courtage) | > 250 employés | > 250 employés | > 5000 | > 5000 |
| Transfert hors EEE | Interdit sans CCT | Interdit | Interdit | Interdit | Interdit | Interdit |
| DSA (Digital Services Act) | Oui (depuis 2024) | Oui | Oui | Oui | Oui | Oui |

```sql
-- Table de configuration légale par pays
CREATE TABLE country_legal_config (
  country_code CHAR(2) PRIMARY KEY REFERENCES countries(code),
  regulator_name TEXT NOT NULL,         -- 'CNIL', 'BfDI', etc.
  regulator_url TEXT NOT NULL,
  broker_registry TEXT NOT NULL,        -- 'orias.fr', 'vermittlerregister.info'
  broker_number TEXT,                   -- Numéro d'inscription local
  double_optin_required BOOLEAN DEFAULT false,
  max_retention_days INTEGER DEFAULT 1095, -- 3 ans par défaut
  dpo_required BOOLEAN DEFAULT false,
  dsa_applies BOOLEAN DEFAULT true,     -- Digital Services Act
  consent_types TEXT[] DEFAULT ARRAY['lead_gen', 'marketing', 'third_party'],
  min_logging_retention_days INTEGER DEFAULT 365,
);
```

### RGPD & Cookies — Multi-pays

| Obligation | Implémentation |
|------------|----------------|
| Bandeau cookies | Consent Management Platform (CMP) — Axeptio ou Didomi |
| Base légale leads | Consentement explicite (case à cocher, pas pré-cochée) |
| Double opt-in (DE) | Email de confirmation obligatoire avant transmission à l'assureur |
| Durée conservation leads | Variable par pays (voir matrix ci-dessus) |
| Droit de suppression | API `/api/gdpr/delete` + process automatisé ≤ 30 jours |
| Suppression cascade | Si lead envoyé à assureur → notification de suppression envoyée aussi |
| DPO | Obligatoire dès le lancement DE (toujours requis pour courtage) |
| Transfert hors EEE | Supabase région eu-west → données restent dans l'EEE |
| Registre des traitements | Document interne obligatoire (CNIL/équivalent par pays) |

### Purge automatique des leads expirés

```typescript
// src/app/api/cron/gdpr-purge/route.ts
// Cron hebdomadaire — anonymise les leads dépassant la durée de conservation

export async function GET(request: Request) {
  const country = process.env.COUNTRY!
  const { data: config } = await supabase
    .from('country_legal_config')
    .select('max_retention_days')
    .eq('country_code', country)
    .single()

  const { count } = await supabase.rpc('gdpr_anonymize_expired_leads', {
    p_country: country,
    p_max_days: config.max_retention_days,
  })
  // Anonymise : email→'[SUPPRIME]', phone→NULL, form_data→'{}'
  // NE supprime PAS la row (audit trail conservé)

  logger.info(`GDPR purge: ${count} leads anonymized`, { country })
}
```

### Audit trail obligatoire

> **Pattern ServicesArtisans** : table `audit_logs` avec old_value/new_value. Requis par ACPR/BaFin pour prouver la traçabilité des opérations de courtage.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                     -- Admin ou système
  action TEXT NOT NULL,             -- 'lead.created', 'lead.sent', 'lead.deleted', 'gdpr.purge'
  resource_type TEXT NOT NULL,      -- 'lead', 'insurer', 'config'
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  country_code CHAR(2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id, created_at DESC);

-- Rétention : 5 ans minimum (exigence ACPR)
-- Jamais purgé automatiquement — archivage cold storage après 2 ans
```

### DSA (Digital Services Act) — Obligations depuis 2024

Les comparateurs d'assurance en ligne sont des **"online platforms"** au sens du DSA. Obligations :
- **Transparence** : afficher clairement "résultats sponsorisés" vs "résultats organiques"
- **Paramètres de classement** : expliquer les critères de classement des assureurs (prix, note, commission)
- **Point de contact** : formulaire de signalement accessible sur chaque site
- **Rapports de transparence** : annuels, publics

**Mentions légales obligatoires par pays** (footer de chaque site) :
- Numéro ORIAS + régulateur local
- RC Pro (nom assureur + n° contrat)
- Raison sociale + SIRET/équivalent
- CGV + politique de confidentialité (traduite dans la langue locale)
- Mention DDA : "En qualité de courtier, nous percevons une rémunération de la part des assureurs"
- Mention DSA : "Classement basé sur [critères]. Certains résultats sont sponsorisés."

---

## 9. Intégrations assureurs

### Formats de transmission des leads

Chaque assureur a son propre mode d'intégration. La table `insurer_verticals.commission_type` gère cette diversité.

| Mode | Délai | Fiabilité | Assureurs typiques |
|------|-------|-----------|-------------------|
| **API REST** | Temps réel | Haute | AXA, Allianz, Generali |
| **Webhook** | Temps réel | Haute | MAIF, MACIF, Groupama |
| **Email structuré** | 1-5 min | Moyenne | Petits assureurs régionaux |
| **Extranet** | Batch quotidien | Basse | Mutuelles locales |

### Spécification API Lead (format standard)

```typescript
// POST /api/leads — format interne
// Chaque lead est ensuite transformé au format de l'assureur cible

type LeadPayload = {
  // Identité
  email: string              // Validé Zod
  phone?: string             // E.164 format
  first_name: string
  last_name: string

  // Contexte
  country_code: string       // 'fr', 'de', etc.
  vertical_key: string       // 'auto', 'habitation', etc.
  city_slug: string          // Pré-rempli depuis la page
  source_url: string         // URL de la page d'origine

  // Données formulaire (variable selon verticale)
  form_data: Record<string, unknown>
  // Auto : { marque, modele, annee, carburant, bonus_malus, sinistres_3ans }
  // Habitation : { type_logement, surface, nb_pieces, proprietaire }
  // Santé : { date_naissance, regime, besoins: ['optique', 'dentaire'] }

  // Tracking
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}
```

### Pipeline lead → assureur

```
Lead soumis (formulaire)
    ↓
Validation Zod (schéma par verticale)
    ↓
INSERT leads table (status: 'new')
    ↓
Matching assureurs (par verticale × zone géo × critères)
    ↓
Pour chaque assureur match :
    ├── API REST → POST payload transformé → attendre réponse
    ├── Webhook → POST notification → log event
    ├── Email → Resend template structuré → log event
    └── Extranet → Queue batch → traitement cron
    ↓
INSERT lead_events (event_type: 'sent_to_insurer')
    ↓
UPDATE leads (status: 'sent', insurer_id)
```

### Sécurité des intégrations

| Mesure | Détail |
|--------|--------|
| Auth assureurs | API key, OAuth2 ou mTLS selon l'assureur. Clés dans Vercel env vars, jamais en DB |
| Webhooks | HMAC-SHA256 signature par assureur + `timingSafeEqual` |
| Idempotency | Unique constraint `lead_id × insurer_id` — anti-rejeu |
| PII masking | Jamais de données personnelles dans les logs (email/phone/name masqués) |
| Encryption | `form_data` chiffré AES-256-GCM côté app avant INSERT. Clé dans Vercel env vars |
| Email | DKIM + SPF + DMARC `p=reject` + TLS 1.2 minimum |

---

## 10. i18n — Internationalisation & Multilingue

### Approche : fonction t() simple

Pas de framework i18n lourd (next-intl, i18next). Une simple fonction `t(key, params)` avec 200-300 clés par langue.

```typescript
// src/i18n/t.ts
import { countryConfig } from '@/lib/country'

type Translations = Record<string, string>

const translations: Record<string, Translations> = {
  fr: { /* lazy import */ },
  de: { /* lazy import */ },
  nl: { /* lazy import */ },
  es: { /* lazy import */ },
  it: { /* lazy import */ },
  en: { /* lazy import */ },
}

export function t(key: string, params?: Record<string, string | number>): string {
  const lang = countryConfig.lang
  let text = translations[lang]?.[key] ?? translations.fr[key] ?? key

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }

  return text
}
```

### Exemples de clés

```typescript
// src/i18n/fr.ts
export default {
  'nav.home': 'Accueil',
  'nav.compare': 'Comparer',
  'service.title': 'Assurance {vertical} à {city}',
  'service.subtitle': 'Comparez les meilleures offres d\'assurance {vertical} à {city} ({department})',
  'risk.verdict.low': 'Risque faible',
  'risk.verdict.high': 'Risque élevé',
  'risk.accidents': '{count} accidents recensés en {year}',
  'price.estimate': 'Prix moyen estimé : {price}€/an',
  'form.submit': 'Recevoir mes devis',
  'footer.orias': 'Courtier enregistré ORIAS n°{number}',
}
```

### Pays multilingues

- **Belgique** : `fr` (Wallonie) + `nl` (Flandre) → préfixe URL `/nl/`
- **Portugal** : `pt` uniquement
- **Luxembourg** : `fr` uniquement (marché petit)
- **Irlande** : `en` uniquement

### Routing multilingue BE

Pour la Belgique (fr/nl), un préfixe URL optionnel détermine la langue :

```
Belgique (comparateur-assurance.be) :
  /assurance-auto/bruxelles           → fr (défaut)
  /nl/autoverzekering/brussel         → nl
```

### Détection de la langue

```typescript
// src/engine/resolve.ts — dans la résolution URL

function detectLanguage(ctx: PageContext): Language {
  // 1. Préfixe URL explicite (/nl/, /de/) → priorité absolue
  if (ctx.urlPrefix === 'nl') return 'nl'
  if (ctx.urlPrefix === 'de') return 'de'

  // 2. Belgique : commune → région linguistique
  if (ctx.country === 'be') {
    // Bruxelles = bilingue → défaut fr
    // Flandre (Antwerpen, Gent, Bruges...) → nl
    // Wallonie (Liège, Namur, Charleroi...) → fr
    return COMMUNE_LANGUAGE_MAP[ctx.city.slug] ?? 'fr'
  }

  // 3. Défaut : langue du pays
  return countryConfig.lang
}
```

### Table de mapping commune → langue

```sql
-- Belgique : 581 communes avec région linguistique
ALTER TABLE cities ADD COLUMN language_code CHAR(2);

-- Peuplé depuis les données Statbel
-- Flandre = 300 communes → 'nl'
-- Wallonie = 262 communes → 'fr'
-- Bruxelles = 19 communes → 'fr' (défaut, bilingue)
UPDATE cities SET language_code = 'nl'
WHERE country_code = 'be' AND department_id IN (SELECT id FROM departments WHERE region_id IN
  (SELECT id FROM regions WHERE slug IN ('flandre-occidentale', 'flandre-orientale', 'anvers', 'limbourg', 'brabant-flamand')));

```

### Hreflang bidirectionnel

Chaque page bilingue inclut des balises hreflang pointant vers la version dans l'autre langue :

```html
<!-- Sur /assurance-auto/bruxelles (version FR) -->
<link rel="alternate" hreflang="fr" href="https://comparateur-assurance.be/assurance-auto/bruxelles" />
<link rel="alternate" hreflang="nl" href="https://comparateur-assurance.be/nl/autoverzekering/brussel" />
<link rel="alternate" hreflang="x-default" href="https://comparateur-assurance.be/assurance-auto/bruxelles" />

<!-- Sur /nl/autoverzekering/brussel (version NL) -->
<link rel="alternate" hreflang="nl" href="https://comparateur-assurance.be/nl/autoverzekering/brussel" />
<link rel="alternate" hreflang="fr" href="https://comparateur-assurance.be/assurance-auto/bruxelles" />
<link rel="alternate" hreflang="x-default" href="https://comparateur-assurance.be/assurance-auto/bruxelles" />
```

**Règles hreflang** :
- `x-default` pointe toujours vers la version FR (langue principale)
- Chaque page doit pointer vers elle-même ET vers toutes les alternatives
- Les slugs de ville changent selon la langue (`bruxelles` / `brussel`, `geneve` / `genf`)
- Les slugs de verticale changent (`assurance-auto` / `autoverzekering` / `autoversicherung`)
- Le middleware injecte les headers hreflang depuis le `PageContext`

### Fallback

```
Si une page n'existe pas dans la langue demandée :
1. Redirect 302 vers la version dans la langue par défaut
2. Pas de 404 — toujours une page à afficher
3. Log l'événement pour identifier les traductions manquantes
```

---

## 11. Scripts d'import de données

### Philosophie

Chaque source de données = 1 script isolé, idempotent, testable. Pattern commun pour tous les pays.

### Script de référence — ONISR France (accidents routiers)

```typescript
// scripts/import/fr/onisr.ts
import { createAdminClient } from '@/lib/supabase/admin'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { logger } from '@/lib/logger'

interface ONISRRecord {
  commune_code: string
  commune_name: string
  nb_accidents: number
  nb_tues: number
  nb_blesses: number
  year: number
}

const ONISR_URL = 'https://www.data.gouv.fr/fr/datasets/r/...'  // CSV annuel
const BATCH_SIZE = 500

async function importONISR() {
  const supabase = createAdminClient()

  // 1. Télécharger le CSV
  logger.info('Downloading ONISR data...')
  const response = await fetch(ONISR_URL)
  const csvText = await response.text()

  // 2. Parser
  const records: ONISRRecord[] = parse(csvText, {
    columns: true,
    delimiter: ';',
    cast: true,
    skip_empty_lines: true,
  })
  logger.info(`Parsed ${records.length} records`)

  // 3. Transformer → format DB
  const rows = records.map(r => ({
    city_code: r.commune_code,
    data_source: 'onisr',
    data_year: r.year,
    data_key: 'accidents',
    data_value: {
      accidents: r.nb_accidents,
      tues: r.nb_tues,
      blesses: r.nb_blesses,
      ratio_per_10k: null, // calculé en post-processing
    },
  }))

  // 4. Upsert par batch (idempotent)
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('city_risk_data')
      .upsert(batch, {
        onConflict: 'city_code,data_source,data_key,data_year',
        ignoreDuplicates: false,
      })
    if (error) {
      logger.error(`Batch ${i / BATCH_SIZE} failed`, { error })
      throw error
    }
    inserted += batch.length
  }

  // 5. Post-processing : calculer les ratios
  const { error: rpcError } = await supabase.rpc('compute_accident_ratios', {
    p_year: records[0]?.year,
  })
  if (rpcError) logger.warn('Ratio computation failed', { error: rpcError })

  logger.info(`Import ONISR complete: ${inserted} rows upserted`)
}

importONISR().catch(e => {
  logger.error('ONISR import failed', { error: e })
  process.exit(1)
})
```

### Pattern réutilisable — Runner multi-sources

```typescript
// scripts/import/runner.ts
import { logger } from '@/lib/logger'

interface ImportTask {
  name: string
  country: string
  run: () => Promise<{ inserted: number; errors: number }>
}

async function runAll(tasks: ImportTask[]) {
  const results: Record<string, { ok: boolean; inserted: number; errors: number; duration: number }> = {}

  for (const task of tasks) {
    const start = Date.now()
    try {
      logger.info(`Starting import: ${task.name} (${task.country})`)
      const { inserted, errors } = await task.run()
      results[task.name] = { ok: errors === 0, inserted, errors, duration: Date.now() - start }
      logger.info(`✓ ${task.name}: ${inserted} rows, ${errors} errors, ${Date.now() - start}ms`)
    } catch (e) {
      results[task.name] = { ok: false, inserted: 0, errors: 1, duration: Date.now() - start }
      logger.error(`✗ ${task.name} failed`, { error: e })
    }
  }

  // Rapport final
  const failed = Object.entries(results).filter(([, r]) => !r.ok)
  if (failed.length > 0) {
    logger.error(`Import terminé avec ${failed.length} erreurs`, { results })
    process.exit(1)
  }
  logger.info('Tous les imports réussis', { results })
}

// Usage : COUNTRY=fr node scripts/import/runner.ts
const country = process.env.COUNTRY || 'fr'
const tasks: ImportTask[] = [
  // Chargé dynamiquement selon le pays
  ...(await import(`./${country}/index.ts`)).default,
]
runAll(tasks)
```

### Structure des scripts

```
scripts/import/
├── runner.ts           # Orchestrateur multi-sources
├── fr/
│   ├── index.ts        # Exporte les tasks FR
│   ├── onisr.ts        # Accidents routiers (data.gouv.fr)
│   ├── insee.ts        # Démographie communes (API INSEE)
│   ├── dvf.ts          # Prix immobilier (DVF open data)
│   ├── catnat.ts       # Catastrophes naturelles (Gaspar)
│   ├── drees.ts        # Densité médecins (DREES)
│   └── sirene.ts       # Entreprises (SIRENE API)
├── de/
│   ├── index.ts
│   ├── destatis.ts     # Statistisches Bundesamt
│   ├── gdv.ts          # Assurance auto régionale
│   └── polizei.ts      # Statistiques accidents
├── pt/
│   ├── index.ts
│   ├── ine.ts          # INE demographics
│   ├── ansr.ts         # Accidents routiers
│   └── asf.ts          # Données assurance ASF
└── shared/
    ├── csv-parser.ts   # Parseur CSV/XLSX commun
    ├── geo-matcher.ts  # Matching commune → city_code
    ├── validators.ts   # Validation schemas Zod (copié de SA schemas.ts)
    ├── sanitize.ts     # Copié de SA sanitize.ts (+ sanitizeIBAN, sanitizeCountryCode)
    └── geography.ts    # Copié de SA geography.ts (DEPARTMENTS, getDeptCodeFromPostal) × 10 pays
```

### Commandes

```bash
# Import toutes les sources d'un pays
COUNTRY=fr node scripts/import/runner.ts

# Import une source spécifique
COUNTRY=fr node scripts/import/fr/onisr.ts

# Import avec dry-run (pas d'écriture DB)
COUNTRY=fr DRY_RUN=1 node scripts/import/runner.ts

# Vérifier la fraîcheur des données
node scripts/import/check-freshness.ts
```

---

## 12. Monitoring production

### Stack monitoring

| Outil | Rôle | Coût |
|-------|------|------|
| Sentry | Erreurs runtime + performance traces | Gratuit (50K events/mois) |
| Vercel Analytics | Core Web Vitals, TTFB | Inclus (Pro) |
| Plausible / PostHog | Analytics trafic | ~10€/mois |
| UptimeRobot | Uptime + alertes | Gratuit (50 monitors) |
| Cron Vercel | Santé sitemaps + imports | Inclus |

### Configuration Sentry

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  tracesSampleRate: 0.1,  // 10% des requêtes (suffisant à 2.3M pages)
  profilesSampleRate: 0.05,

  // Tags custom par pays
  initialScope: {
    tags: {
      country: process.env.COUNTRY || 'fr',
    },
  },

  // Ignorer les erreurs sans intérêt
  ignoreErrors: [
    'NEXT_NOT_FOUND',
    'AbortError',
    'ResizeObserver loop',
  ],

  // Alertes sur les requêtes Supabase lentes
  beforeSendTransaction(event) {
    const dbSpans = event.spans?.filter(s => s.op === 'db.query')
    const slowQueries = dbSpans?.filter(s => (s.timestamp ?? 0) - (s.start_timestamp ?? 0) > 2)
    if (slowQueries?.length) {
      Sentry.captureMessage('Slow DB queries detected', {
        level: 'warning',
        extra: { queries: slowQueries.map(s => s.description) },
      })
    }
    return event
  },
})
```

### Alertes TTFB

```typescript
// src/app/api/cron/ttfb-check/route.ts
import { logger } from '@/lib/logger'

const CRITICAL_PAGES = [
  '/',
  '/assurance-auto/paris',
  '/assurance-auto/lyon',
  '/tarifs/assurance-auto/paris',
  '/mutuelle-sante/marseille',
]

const TTFB_THRESHOLD_MS = 800  // Alerte si > 800ms

export async function GET(request: Request) {
  // Auth cron
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const results: { url: string; ttfb: number; status: number }[] = []

  for (const path of CRITICAL_PAGES) {
    const start = Date.now()
    const res = await fetch(`${baseUrl}${path}`, { cache: 'no-store' })
    const ttfb = Date.now() - start
    results.push({ url: path, ttfb, status: res.status })
  }

  const slow = results.filter(r => r.ttfb > TTFB_THRESHOLD_MS)
  const errors = results.filter(r => r.status >= 400)

  if (slow.length > 0 || errors.length > 0) {
    logger.error('TTFB check failed', { slow, errors })
    // Webhook Slack/Discord
    if (process.env.ALERT_WEBHOOK_URL) {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `⚠️ TTFB Alert (${process.env.COUNTRY})\n${slow.map(s => `${s.url}: ${s.ttfb}ms`).join('\n')}`,
        }),
      })
    }
  }

  logger.info('TTFB check complete', { results })
  return Response.json({ ok: slow.length === 0 && errors.length === 0, results })
}
```

### Monitoring indexation (Search Console)

```typescript
// scripts/monitoring/gsc-indexation.ts
// Exécuté quotidiennement — vérifie que les pages critiques sont indexées

import { google } from 'googleapis'
import { logger } from '@/lib/logger'

const EXPECTED_INDEXED_MIN = {
  fr: 50_000,   // Phase 1 : au moins 50K pages indexées
  de: 20_000,
  es: 15_000,
}

async function checkIndexation() {
  const country = process.env.COUNTRY || 'fr'
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GSC_SERVICE_ACCOUNT || '{}'),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })

  const searchconsole = google.searchconsole({ version: 'v1', auth })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  // Pages indexées (derniers 7 jours)
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: getDateNDaysAgo(7),
      endDate: getDateNDaysAgo(1),
      dimensions: ['page'],
      rowLimit: 1,
      // On veut juste le total
    },
  })

  const totalPages = res.data.rows?.length ?? 0
  const expected = EXPECTED_INDEXED_MIN[country as keyof typeof EXPECTED_INDEXED_MIN] ?? 1000

  if (totalPages < expected) {
    logger.error(`Indexation below threshold`, {
      country,
      indexed: totalPages,
      expected,
      deficit: expected - totalPages,
    })
  } else {
    logger.info(`Indexation OK`, { country, indexed: totalPages, expected })
  }
}
```

### Dashboard opérationnel

```
┌──────────────────────────────────────────────────────────┐
│ DASHBOARD MONITORING — [COUNTRY]                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  UPTIME         TTFB (p95)      ERRORS (24h)             │
│  ██████ 99.9%   ███░░ 420ms     ██░░░ 12                 │
│                                                          │
│  INDEXATION      SITEMAPS        DATA FRESHNESS           │
│  ██████ 52K      ██████ 39/39    █████░ 14/15 sources    │
│                                                          │
│  LEADS (24h)     CACHE HIT       ISR REVALIDATIONS       │
│  ███░░░ 47       █████░ 94%      ██████ 1,200            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ALERTES ACTIVES                                         │
│  ⚠️ Source DREES : dernière MAJ > 30 jours               │
│  ✅ Aucune erreur Sentry critique                        │
│  ✅ TTFB < 800ms sur toutes les pages critiques          │
└──────────────────────────────────────────────────────────┘
```

### Crons Vercel

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sitemap-health",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/ttfb-check",
      "schedule": "0 */4 * * *"
    },
    {
      "path": "/api/cron/indexnow-submit",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/data-freshness",
      "schedule": "0 7 * * 1"
    }
  ]
}
```

| Cron | Fréquence | Rôle |
|------|-----------|------|
| `sitemap-health` | Quotidien 6h | Vérifie les sitemaps (HTTP 200 + XML valide) |
| `ttfb-check` | Toutes les 4h | TTFB des pages critiques, alerte si > 800ms |
| `indexnow-submit` | Quotidien 8h | Soumet ~200 URLs stratégiques à Bing/Yandex |
| `data-freshness` | Hebdo lundi 7h | Vérifie freshness_days par source (SLA table §5) |
| `cwv-check` | Hebdo dimanche 2h | PageSpeed Insights API sur 20 pages, alerte si hors seuils |
| `gdpr-purge` | Hebdo samedi 3h | Anonymise les leads dépassant la durée de conservation |
| `gsc-boost` | Hebdo mercredi 9h | Identifie pages position 5-20, renforce le maillage interne |
| `googlebot-log-purge` | Mensuel 1er 4h | Supprime les logs Googlebot > 30 jours (TTL anti-bloat) |

---

## 13. Stack Technique

### Core

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Framework | Next.js 15 (App Router) | ISR, RSC, routing catch-all |
| Runtime | Node.js | Écosystème, Vercel natif |
| Base de données | Supabase (PostgreSQL) | Même stack que ServicesArtisans, colonnes normalisées + PgBouncer |
| Hébergement | Vercel | ISR natif, edge, multi-domaines |
| CSS | Tailwind CSS | Rapide, composants utilitaires |
| UI | shadcn/ui | Composants headless, personnalisables |
| Analytics | Plausible / PostHog | Privacy-first, RGPD-compatible |
| Monitoring | Sentry | Erreurs, performance |
| Emails | Resend | Transactionnel leads |

### Différences vs ServicesArtisans

| Aspect | ServicesArtisans | Assurance |
|--------|------------------|-----------|
| Clients Supabase | 4 (admin, server, client, service) | 1 (server uniquement) |
| Auth | 2FA TOTP, multi-rôle | Admin simple uniquement |
| Realtime | Oui (chat) | Non |
| Paiement | Stripe | Non |
| Redis | Oui (cache, rate limit) | **Oui** (cache L2 Upstash, ~5€/mois — TTFB ÷1.3-1.5, ÷2-3 si hit L1 > 80%) |
| Capacitor | Oui (app mobile) | Non |
| VAPI | Oui (voice AI) | Non |

### Ce qu'on NE construit PAS (vs ServicesArtisans : ~147K lignes éliminées)

- ❌ Chat realtime (~15K lignes)
- ❌ Système de booking (~12K lignes)
- ❌ Paiement Stripe (~10K lignes)
- ❌ Auth multi-rôle + 2FA (~8K lignes)
- ❌ Prospection artisans (~10K lignes)
- ❌ Portfolio photos (~5K lignes)
- ❌ VAPI voice AI (~8K lignes)
- ❌ App mobile Capacitor (~5K lignes)
- ❌ Système d'avis vérifié (~8K lignes)
- ❌ Estimation interactive (~10K lignes)
- ❌ CRM intégré (~5K lignes)
- ❌ Notifications push (~3K lignes)
- **= ~100-150K lignes de complexité en moins**

---

## 14. Stratégie de Déploiement

### 1 domaine par pays (ccTLD)

```
comparateur-assurance.fr     → COUNTRY=fr  vercel deploy
versicherungsvergleich.de    → COUNTRY=de  vercel deploy
comparador-seguros.es        → COUNTRY=es  vercel deploy
confronta-assicurazioni.it   → COUNTRY=it  vercel deploy
comparateur-assurance.be     → COUNTRY=be  vercel deploy
verzekeringsvergelijker.nl   → COUNTRY=nl  vercel deploy
versicherungsvergleich.at    → COUNTRY=at  vercel deploy
comparador-seguros.pt        → COUNTRY=pt  vercel deploy
comparateur-assurance.lu     → COUNTRY=lu  vercel deploy
insurance-comparator.ie      → COUNTRY=ie  vercel deploy
```

### Pourquoi ccTLD et pas sous-domaines ou sous-répertoires

| Approche | SEO local | Gestion | Isolation |
|----------|-----------|---------|-----------|
| ccTLD (choisi) | ✅ Optimal | Indépendante | ✅ Totale |
| Sous-domaine | ⚠️ Moyen | Liée | ⚠️ Partielle |
| Sous-répertoire | ❌ Dilué | Complexe | ❌ Aucune |

### Déploiement Vercel

Chaque pays = 1 projet Vercel avec :
- `COUNTRY=xx` en variable d'environnement
- Son propre domaine custom
- Son propre ISR cache
- Ses propres sitemaps

Le **même code source** est déployé 10 fois avec une variable d'environnement différente.

### CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy All Countries
on:
  push:
    branches: [main]

jobs:
  deploy:
    strategy:
      matrix:
        country: [fr, de, es, it, be, nl, at, pt, lu, ie]
    steps:
      - uses: actions/checkout@v4
      - run: vercel deploy --prod --env COUNTRY=${{ matrix.country }}
```

---

## 15. Comparaison avec ServicesArtisans

### Tableau comparatif complet

| Dimension | ServicesArtisans | Assurance Europe |
|-----------|------------------|------------------|
| **Type** | Marketplace biface | Site contenu + lead gen |
| **Lignes de code** | 294K | 120-160K (estimation) |
| **Pays** | France uniquement | 10 pays européens |
| **Pages** | ~2 millions | ~1.5 million (data-backed, comparateur sur chaque page) |
| **Ratio pages/code** | ~7 pages/ligne | ~250-370 pages/ligne (moteur générique, données font le travail) |
| **Migrations DB** | 89 | ~15-20 (estimation) |
| **Routes API** | 189 | ~30 |
| **Composants** | 257 | ~50-60 |
| **Clients Supabase** | 4 | 1 |
| **Auth** | 2FA TOTP, multi-rôle | Admin simple |
| **Realtime** | Oui (chat) | Non |
| **Paiement** | Stripe | Non |
| **État runtime** | Stateful (sessions, chat, booking) | Quasi-stateless |
| **Architecture** | Organique (89 migrations) | Moteur 5 couches dès le départ |
| **Config pays** | Hardcodé France | Webpack alias, paramétrique |
| **Sitemaps** | Runtime API routes (fragile) | Pré-générés cron (robuste) |
| **Data loading** | Patterns variés | 1 pattern unique (6 queries //) |

### Pourquoi l'architecture assurance est meilleure

1. **Couche 0 (Config)** — N'existe pas dans ServicesArtisans. Ici le pays est un paramètre de build.
2. **5 couches strictes** — Force la séparation des responsabilités. Impossible de mélanger data/calcul/rendu.
3. **Quasi-stateless** — Pas de chat, booking, sessions. Moins de bugs, scaling horizontal naturel.
4. **Ratio pages/code 100x meilleur** — Le moteur est générique, les données font le travail.
5. **Leçons tirées** — 89 migrations → schéma simple dès le départ. 4 clients → 1 client. Sitemaps runtime → cron.

### Ce qui n'est PAS comparable
ServicesArtisans est une **marketplace** avec des features intrinsèquement complexes (2 types d'utilisateurs, transactions, confiance). La comparer à un site de contenu n'est pas fair — c'est un problème différent.

### Fichiers directement réutilisables — Inventaire exhaustif ServicesArtisans

> **Scan complet : 232 composants, 97 fichiers lib, 189 API routes, 89 migrations SQL, 16 fichiers de test, 12 configs.**
> Résultat : **72 fichiers/patterns directement réutilisables** (~12 000 lignes). Gain estimé : **4-5 semaines de développement économisées.**

#### Catégorie 1 — Infrastructure Core (copier-coller direct, 0 adaptation)

| # | Fichier SA | Lignes | Ce que c'est | Gain |
|---|-----------|--------|-------------|------|
| 1 | `src/lib/cache.ts` | 334 | Cache L1 (in-memory) + L2 (Redis) + déduplication requêtes concurrentes | Pattern complet, skipNull, TTL par type |
| 2 | `src/lib/cache/redis-client.ts` | ~150 | Client Upstash REST : `get()`, `set()`, `getOrSet()`, `deletePattern()`, `increment()` | Serverless-compatible, fallback gracieux |
| 3 | `src/lib/logger.ts` | 114 | Logger structuré singleton : `debug/info/warn/error` + child loggers nommés (`apiLogger`, `dbLogger`) | Remplace console.log, intégrable Sentry |
| 4 | `src/lib/rate-limiter.ts` | ~200 | Rate limiter Upstash + fallback in-memory + config per-route (auth:10/min, api:60/min, webhook:200/min) | Fail-open par défaut |
| 5 | `src/middleware.ts` | 334 | Edge middleware : canonical, CSP nonce, rate limit, Googlebot logging, CDN headers | 90% identique au besoin assurance |
| 6 | `next.config.js` | 413 | Security headers (HSTS, X-Frame-Options, CSP), cache par route type, rewrites sitemaps, `removeConsole` prod, 25 redirects SEO | Copier et adapter les prefixes |
| 7 | `src/lib/utils.ts` | 361 | `cn()` (tailwind-merge), `formatPrice()`, `formatDate()`, `slugify()`, `calculateDistance()` (Haversine) | Fondamentaux réutilisables partout |
| 8 | `src/lib/env.ts` | ~100 | Validation Zod de toutes les env vars au boot. Si `SUPABASE_URL` manque → crash immédiat avec message clair | Évite les erreurs runtime cryptiques en prod |

#### Catégorie 2 — Sécurité & Audit (copier-coller direct)

| # | Fichier SA | Lignes | Ce que c'est | Gain |
|---|-----------|--------|-------------|------|
| 9 | `src/lib/admin-auth.ts` | 332 | `requirePermission()` : CSRF check (Sec-Fetch-Site + Origin) + permission granulaire + audit log. 4 rôles × 13 permissions | Pattern admin robuste, remapper les permissions |
| 10 | `src/lib/audit-logger.ts` | 235 | `logAuditEvent()` + helpers typés (`auditUserAction`, `auditGdprAction`). Capture IP, UA, timestamps | Conformité ACPR/BaFin — le SQL existe dans §8, ce fichier est le helper TS |
| 11 | `src/lib/sanitize.ts` | 166 | 8 sanitizers : `sanitizeSearchQuery()` (échappe LIKE), `sanitizeHtml()` (XSS), `sanitizeEmail/Phone/Siret/Uuid()` | Ajouter `sanitizeIBAN()`, `sanitizeCountryCode()` |
| 12 | `src/lib/prospection/webhook-security.ts` | 95 | Vérification HMAC-SHA256 Svix + Twilio : `verifyResendSignature()`, `verifyTwilioSignature()`, timing-safe compare, reject >5min | Adapter pour webhooks assureurs |

#### Catégorie 3 — SEO (copier + adapter les schemas)

| # | Fichier SA | Lignes | Ce que c'est | Gain |
|---|-----------|--------|-------------|------|
| 13 | `src/lib/seo/jsonld.ts` | 425+ | **14 schemas JSON-LD** : Organization, WebSite, Service, BreadcrumbList, FAQPage, HowTo, ItemList, Place, CollectionPage, ServicePricing (AggregateOffer), LocalService, ServiceRating (AggregateRating), ComparisonReview (positiveNotes/negativeNotes), Speakable | Remapper Service→InsuranceProduct |
| 14 | `src/lib/seo/internal-links.ts` | ~100 | 65+ mappages keywords→slugs pour maillage contextuel auto + scoring articles related | Créer `insuranceProductMapping` |
| 15 | `src/lib/seo/config.ts` | 133 | `SITE_URL`, `defaultSEOConfig`, helpers `getServiceSEO()`, `getLocationSEO()` | Adapter pour `getProductSEO()`, `getCitySEO()` |
| 16 | `src/lib/seo/data-driven-content.ts` | ~400 | **Moteur de contenu programmatique** : 8 sections (intro, socio-économique, immobilier, marché, énergétique, climat, demande locale, réglementation) + FAQ data-driven + citation sources E-E-A-T | Pattern clé pour pages ville×verticale assurance |
| 17 | `src/lib/seo/location-content.ts` | ~200 | Contenu localisé : `generateLocationContent()`, multiplicateurs régionaux (0.9-1.4), contexte saisonnier par climat | Adapter multiplicateurs risque par commune |
| 18 | `src/lib/seo/natural-terms.ts` | ~300 | 46 services × (singulier, pluriel, article, genre, synonymes, verbes, qualificatifs) | Créer termes naturels assurance (7 verticales × 10 langues) |
| 19 | `src/lib/seo/blog-schema.ts` | ~100 | `getBlogArticleSchema()` + `extractFAQFromContent()` : parse H2 questions, max 5 FAQs, limit 500 chars | Réutilisable pour blog guides assurance |
| 20 | `src/lib/seo/indexnow.ts` | ~80 | `submitToIndexNow()` + `getProviderAffectedUrls()` (batch 10K URLs) | Adapter pour URLs assurance |
| 21 | `src/app/robots.ts` | 175 | robots.txt dynamique : 11 AI search bots autorisés, 10 training bloqués, 8 scrapers bloqués | Copier-coller intégral |
| 22 | `src/app/sitemap.ts` | ~200 | Architecture 39 sitemaps : `generateSitemaps()` + batching Phase 1 (300 villes) / Phase 2 | Adapter slugs (services→verticales) |

#### Catégorie 4 — Composants UI (copier-coller direct)

| # | Fichier SA | Lignes | Ce que c'est | Gain |
|---|-----------|--------|-------------|------|
| 23 | `src/components/ui/Button.tsx` | 124 | 6 variants (primary, secondary, outline, ghost, danger, premium), 4 tailles, loading state, icons | Design system de base |
| 24 | `src/components/ui/Input.tsx` | 91 | Text input accessible : label, error, hint, left/right icons, aria-describedby | Formulaires devis |
| 25 | `src/components/ui/Select.tsx` | 112 | Dropdown accessible : label, error, placeholder, left icon | Sélection type assurance |
| 26 | `src/components/ui/Card.tsx` | 97 | 4 variants (default, outlined, elevated, premium), padding, hover effect | Cartes offres assurance |
| 27 | `src/components/ui/Modal.tsx` | 110 | Focus trap, escape key, scroll lock, 5 tailles, accessible | Détails couverture |
| 28 | `src/components/ui/Badge.tsx` | ~50 | 8 variants colorées pour statuts | Badges "Meilleur prix", "Recommandé" |
| 29 | `src/components/ui/Skeleton.tsx` | ~80 | 6 types loading states (card, list, profile...) | Chargement comparaisons |
| 30 | `src/components/ui/Pagination.tsx` | 122 | Pagination SSR-friendly avec Next/Link | Listes résultats |
| 31 | `src/components/forms/FormField.tsx` | 49 | Wrapper formulaire : auto-ID, aria-invalid, error role="alert" | Tous les formulaires |
| 32 | `src/components/forms/FormSection.tsx` | 22 | Container titre + description + `space-y-4` | Sections formulaire multi-étapes |

#### Catégorie 5 — Composants Comparateur (adaptation directe)

| # | Fichier SA | Lignes | Ce que c'est | Adaptation |
|---|-----------|--------|-------------|------------|
| 33 | `src/components/compare/CompareView.tsx` | 293 | Grille comparateur 2-3 colonnes, rows configurables | Rows → tarif, garanties, franchise, délai carence, note, support 24/7 |
| 34 | `src/components/compare/CompareProvider.tsx` | ~60 | Context React + hook `useCompare()` | Renommer `useCompareInsurance()` |
| 35 | `src/components/compare/CompareBar.tsx` | ~80 | Barre sticky "X sélectionnés — Comparer" | Identique pour assurance |
| 36 | `src/components/search/AdvancedFilters.tsx` | 200+ | Filtres collapsibles : rating, prix, rayon, tri | Adapter → âge, franchise, garanties, type couverture |
| 37 | `src/components/search/PriceRangeFilter.tsx` | 142 | Min-max inputs + presets + visual bar | → `PremiumRangeFilter` (€/mois) |

#### Catégorie 6 — Composants SEO (copier-coller direct)

| # | Fichier SA | Lignes | Ce que c'est | Gain |
|---|-----------|--------|-------------|------|
| 38 | `src/components/JsonLd.tsx` | 30 | `<script type="application/ld+json">` avec échappement XSS | Réutilisable tel quel |
| 39 | `src/components/seo/Breadcrumb.tsx` | 65 | Schema.org BreadcrumbList avec itemProp, position, accessible | Réutilisable tel quel |
| 40 | `src/components/seo/LastUpdated.tsx` | ~30 | Badge "Mis à jour le" + dateModified SEO | Réutilisable tel quel |
| 41 | `src/components/seo/CrossIntentLinks.tsx` | ~80 | Navigation 5 intents (tarifs, avis, services, urgence, devis) pour même ville×service | Adapter intents → devis, tarifs, avis, FAQ, réclamation |
| 42 | `src/components/seo/DeepPageLinks.tsx` | ~150 | 6 modules cross-links : villes proches, département, région, cross-service, blog, problèmes | Adapter modules → verticales croisées, régions, guides |

#### Catégorie 7 — Composants Admin Dashboard (copier + adapter)

| # | Fichier SA | Lignes | Ce que c'est | Adaptation |
|---|-----------|--------|-------------|------------|
| 43 | `src/components/admin/DataTable.tsx` | 105 | Tableau générique : colonnes, tri, loading, empty state | Identique pour admin assurance |
| 44 | `src/components/admin/dashboard/StatsGrid.tsx` | 138 | 4 cartes stats avec tendances (%, flèches) | → leads, conversions, primes, sinistres |
| 45 | `src/components/admin/dashboard/ActivityChart.tsx` | 165 | Recharts AreaChart sur 30j, très polish | → conversions/primes/sinistres |
| 46 | `src/components/admin/FilterPanel.tsx` | 135 | Filtres multiples, pills, clear all, single/multi select | Identique |
| 47 | `src/components/admin/Pagination.tsx` | 173 | Pagination stateful + page size dropdown | Identique |
| 48 | `src/components/admin/ConfirmationModal.tsx` | ~60 | Modal confirmation actions destructives | Identique |

#### Catégorie 8 — Composants Géolocalisation (copier + adapter)

| # | Fichier SA | Lignes | Ce que c'est | Adaptation |
|---|-----------|--------|-------------|------------|
| 49 | `src/components/ui/VilleAutocomplete.tsx` | 200+ | API Adresse.data.gouv.fr, ville + code postal + coords, bouton géolocalisation | "Code postal de résidence" (API gratuite) |
| 50 | `src/components/ui/AdresseAutocomplete.tsx` | 200+ | Adresse complète (rue + CP + ville + coords), debounced search | "Adresse du bien assuré" |
| 51 | `src/components/maps/GeographicMap.tsx` | 356 | Leaflet + MarkerCluster + custom icons + popups HTML | Carte agences assurance par ville |

#### Catégorie 9 — Custom Hooks (copier-coller direct, 0 adaptation)

| # | Fichier SA | Lignes | Ce que c'est | Gain |
|---|-----------|--------|-------------|------|
| 52 | `src/hooks/useDebounce.ts` | ~50 | `useDebounce()` + `useDebouncedCallback()` + `useThrottledCallback()` | Recherche, sliders, filtres |
| 53 | `src/hooks/useToast.ts` | ~80 | Système de toasts : `success/error/warning/info`, auto-dismiss, timer management | Feedback utilisateur |
| 54 | `src/hooks/use-local-storage.ts` | ~40 | `useLocalStorage<T>(key, initial)` avec sérialisation JSON | Comparaisons sauvegardées sans auth |
| 55 | `src/hooks/use-media-query.ts` | ~30 | `useMediaQuery()`, `useIsMobile()`, `useIsDesktop()` | Layout responsive comparateur |
| 56 | `src/hooks/useGeolocation.ts` | ~60 | Géolocalisation browser : lat/lon, accuracy, watch, gestion erreurs permission | Détection ville automatique |
| 57 | `src/hooks/useIntersectionObserver.ts` | ~80 | `useIntersectionObserver()` + `useInfiniteScroll()` + `useLazyLoad()` | Lazy load images assureurs, infinite scroll |
| 58 | `src/hooks/useFavorites.ts` | ~60 | Favoris localStorage + sync multi-onglets (StorageEvent + custom events) | "Mes comparaisons sauvegardées" |
| 59 | `src/hooks/useAuth.ts` | ~100 | Auth complète Supabase : signIn/signUp/signOut/resetPassword/OAuth, onAuthStateChange | Espace client assurance |
| 60 | `src/hooks/admin/useAdminFetch.ts` | ~80 | SWR fetcher : déduplication 30s, retry 2x, timeout 30s, cache + revalidation background | Dashboard admin |

#### Catégorie 10 — Types TypeScript (copier + adapter)

| # | Fichier SA | Ce que c'est | Adaptation |
|---|-----------|-------------|------------|
| 61 | `src/types/branded.ts` | **Branded types** : `ProviderId`, `Email`, `Phone`, `Siret` + validators `isValidEmail()`, `isValidPhone()`, `isValidPostalCode()` avec checksums | Ajouter `PolicyId`, `ContractId`, `IBAN` |
| 62 | `src/types/admin.ts` | `ApiResponse<T>`, `PaginatedResponse<T>`, `PaginationState`, `AdminFilters` | Identique |

#### Catégorie 11 — Supabase 3-tier Client (copier-coller direct)

| # | Fichier SA | Ce que c'est | Gain |
|---|-----------|-------------|------|
| 63 | `src/lib/supabase/client.ts` | Client browser (RLS respectée) + singleton pattern | Pages publiques comparaison |
| 64 | `src/lib/supabase/server.ts` | Client serveur (cookies + sessions) pour API routes SSR | API routes, pages SSR |
| 65 | `src/lib/supabase/admin.ts` | Client admin (service_role, bypass RLS) + ISR cache 1h | Cron jobs, imports, dashboard admin |
| 66 | `src/lib/supabase/middleware.ts` | `updateSession()` : refresh session automatique par requête | Auth middleware |

#### Catégorie 12 — Données & Géographie (adapter)

| # | Fichier SA | Lignes | Ce que c'est | Adaptation |
|---|-----------|--------|-------------|------------|
| 67 | `src/lib/geography.ts` | ~100 | 101 depts, mapping dept→région, `getDeptCodeFromPostal()` (Corse, DOM-TOM) | Généraliser pour 10 pays |
| 68 | `src/lib/storage.ts` | 321 | Upload Supabase : validation MIME, path unique, thumbnails | Pièces jointes leads |
| 69 | `src/lib/validations/schemas.ts` | 238+ | Zod schemas : email, phone, uuid, date + `validateRequest()`, `formatZodErrors()` | Base pour schemas assurance |
| 70 | `src/lib/config/company-identity.ts` | ~80 | Single Source of Truth : brand, legal, contact, social, hosting, `isCompanyRegistered()` | Données légales ORIAS, ACPR |
| 71 | `src/lib/notifications/unified-notification-service.ts` | ~200 | Multi-canal (email/SMS) : retry exponentiel, priority queue, preferences par user | Confirmations, rappels, alertes |
| 72 | `src/lib/prospection/message-queue.ts` | ~100 | Rate limiting par canal + batch processing + phone masking logs | Alertes renouvellement multi-pays |

#### Catégorie 13 — Patterns SQL à copier depuis les migrations

| # | Migration SA | Pattern | Adaptation |
|---|-------------|---------|------------|
| S1 | `102_v2_functions_triggers.sql` | `set_updated_at()` trigger générique BEFORE UPDATE | Appliquer à policies, claims, quotes |
| S2 | `102_v2_functions_triggers.sql` | `prevent_stable_id_change()` : immutabilité IDs métier | Protéger numéros contrats, polices |
| S3 | `102_v2_functions_triggers.sql` | Full-text search pondéré : `setweight(to_tsvector('french',...), 'A'\|'B'\|'C')` + index GIN | Recherche polices, garanties, bénéficiaires |
| S4 | `101_v2_rls_policies.sql` | `is_admin()` SECURITY DEFINER STABLE — helper RLS centralisé | Créer `is_manager()`, `is_claims_officer()` |
| S5 | `328_fix_profiles_rls_select.sql` | RLS hiérarchique 3-tiers (own data / admin / public) | Client lit sa police, manager sa branche, public voit stats |
| S6 | `302_critical_security_fixes.sql` | Trigger incrémental O(1) pour compteurs (sent_count += 1 au lieu de COUNT(*)) | Compteurs sinistres, documents, paiements sans scan |
| S7 | `312_scale_indexes.sql` | MV multidimensionnelle `mv_provider_counts` (specialty × city × dept) + REFRESH CONCURRENTLY | `mv_sinistres_par_region_type` pour dashboard KPIs |
| S8 | `329_recreate_gdpr_tables.sql` | Tables GDPR : `deletion_requests` (scheduled→completed), `data_export_requests`, `cookie_consents` (5 catégories) | Conforme RGPD multi-pays, rétention par pays |
| S9 | `302_critical_security_fixes.sql` | Fonction SECURITY DEFINER avec whitelist (IF table IN (...)) + `%I` quoting + GRANT/REVOKE | Fonctions admin sécurisées |
| S10 | `300_prospection_schema.sql` | `GENERATED ALWAYS AS STORED` : `email_canonical text GENERATED ALWAYS AS (lower(trim(email))) STORED` | Colonnes calculées : `freshness_days`, `date_iso`, normalisation |
| S11 | `202_configurable_dispatch.sql` | Advisory locks `pg_advisory_xact_lock()` pour idempotence | Lock per sinistre avant paiement (prevent double-payout) |
| S12 | `351_performance_crawl_optimization.sql` | Covering index `INCLUDE(...)` + `WHERE is_active = TRUE` (partial) | Index polices actives avec colonnes SELECT incluses |

#### Catégorie 14 — Tests & CI (copier la structure)

| # | Fichier SA | Ce que c'est | Gain |
|---|-----------|-------------|------|
| T1 | `__tests__/api/*.test.ts` | 20+ fichiers : mock Supabase thenable builder, assertions auth/validation/pagination/error/cache | Pattern complet pour tester API assurance |
| T2 | `src/test/setup.ts` | Setup Vitest + mocks globaux Supabase | Réutilisable tel quel |
| T3 | `vitest.config.ts` | Config : jsdom, alias @/, coverage thresholds (60% statements) | Copier tel quel |
| T4 | `playwright.config.ts` | E2E : 5 browsers (Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari), retries CI | Copier tel quel |
| T5 | `.github/workflows/guardrails.yml` | CI statique : admin auth check, toxic fields, fallback URLs, build artifacts | Adapter checks pour assurance |
| T6 | `lighthouserc.json` | Quality gates : perf ≥ 70%, a11y ≥ 90% (error), SEO ≥ 90% (error), FCP ≤ 3s, CLS ≤ 0.1 | Copier tel quel |

#### Catégorie 15 — Configs projet (copier + adapter)

| # | Fichier SA | Ce que c'est | Adaptation |
|---|-----------|-------------|------------|
| C1 | `vercel.json` | Crons (7), regions (cdg1), maxDuration (30/60s) | Ajouter crons assurance, adapter régions EU |
| C2 | `tailwind.config.js` | 227 lignes : palette 5 couleurs, 20+ shadows, 15+ animations, polices Inter+Jakarta | Adapter palette (bleu confiance + or premium) |
| C3 | `tsconfig.json` | Strict mode, noUnusedLocals/Parameters, path alias `@/*` | Copier tel quel |
| C4 | `.lintstagedrc.json` | Pre-commit : eslint --fix + prettier | Copier tel quel |
| C5 | `public/manifest.json` | PWA : 8 tailles icônes, shortcuts, categories | Adapter shortcuts ("Comparer", "Mes devis") |
| C6 | `public/.well-known/security.txt` | Contact, policy, preferred-languages | Adapter avec DPO assurance |
| C7 | `public/.well-known/ai-plugin.json` | ChatGPT Plugin spec : schema_version, api, auth | Adapter pour comparateur assurance |

### Mapping fichiers SA → fichiers Assurance (complet)

```
ServicesArtisans                                Assurance Europe
───────────────────────────────────────────     ────────────────────────────────────────────

INFRASTRUCTURE (identique)
src/lib/cache.ts                           →   src/lib/cache.ts
src/lib/cache/redis-client.ts              →   src/lib/cache/redis-client.ts
src/lib/logger.ts                          →   src/lib/logger.ts
src/lib/rate-limiter.ts                    →   src/lib/rate-limiter.ts
src/lib/utils.ts                           →   src/lib/utils.ts
src/lib/env.ts                             →   src/lib/env.ts (+ COUNTRY, CURRENCY, LEAD_ENCRYPTION_KEY)
src/middleware.ts                           →   src/middleware.ts (+ i18n routing)
next.config.js                             →   next.config.js (adapter prefixes cache)

SÉCURITÉ (remapper permissions)
src/lib/admin-auth.ts                      →   src/lib/admin-auth.ts
src/lib/audit-logger.ts                    →   src/lib/audit-logger.ts
src/lib/sanitize.ts                        →   src/lib/sanitize.ts (+ sanitizeIBAN)
src/lib/prospection/webhook-security.ts    →   src/lib/webhook-security.ts (HMAC assureurs)

SEO (adapter slugs/schemas)
src/lib/seo/jsonld.ts                      →   src/lib/seo/jsonld.ts (+ InsuranceProduct)
src/lib/seo/config.ts                      →   src/lib/seo/config.ts (multi-domaine)
src/lib/seo/internal-links.ts              →   src/lib/seo/internal-links.ts
src/lib/seo/data-driven-content.ts         →   src/lib/seo/insurance-content.ts (8 sections risque)
src/lib/seo/location-content.ts            →   src/lib/seo/location-content.ts (× 10 pays)
src/lib/seo/natural-terms.ts              →   src/lib/seo/insurance-terms.ts (7 verticales × 10 langues)
src/lib/seo/blog-schema.ts                →   src/lib/seo/blog-schema.ts (identique)
src/lib/seo/indexnow.ts                   →   src/lib/seo/indexnow.ts (identique)
src/app/robots.ts                          →   src/app/robots.ts (identique)
src/app/sitemap.ts                         →   src/app/sitemap.ts (adapter verticales)

COMPOSANTS UI (identique)
src/components/ui/Button.tsx               →   src/components/ui/Button.tsx
src/components/ui/Input.tsx                →   src/components/ui/Input.tsx
src/components/ui/Select.tsx               →   src/components/ui/Select.tsx
src/components/ui/Card.tsx                 →   src/components/ui/Card.tsx
src/components/ui/Modal.tsx                →   src/components/ui/Modal.tsx
src/components/ui/Badge.tsx                →   src/components/ui/Badge.tsx
src/components/ui/Skeleton.tsx             →   src/components/ui/Skeleton.tsx
src/components/ui/Pagination.tsx           →   src/components/ui/Pagination.tsx
src/components/forms/FormField.tsx         →   src/components/forms/FormField.tsx
src/components/forms/FormSection.tsx       →   src/components/forms/FormSection.tsx

COMPARATEUR (adapter les rows)
src/components/compare/CompareView.tsx     →   src/components/compare/CompareInsuranceView.tsx
src/components/compare/CompareProvider.tsx →   src/components/compare/CompareInsuranceProvider.tsx
src/components/compare/CompareBar.tsx      →   src/components/compare/CompareInsuranceBar.tsx
src/components/search/AdvancedFilters.tsx  →   src/components/search/InsuranceFilters.tsx
src/components/search/PriceRangeFilter.tsx →   src/components/search/PremiumRangeFilter.tsx

SEO COMPONENTS (adapter intents)
src/components/JsonLd.tsx                  →   src/components/JsonLd.tsx (identique)
src/components/seo/Breadcrumb.tsx          →   src/components/seo/Breadcrumb.tsx (identique)
src/components/seo/LastUpdated.tsx         →   src/components/seo/LastUpdated.tsx (identique)
src/components/seo/CrossIntentLinks.tsx    →   src/components/seo/CrossIntentLinks.tsx (remapper intents)
src/components/seo/DeepPageLinks.tsx       →   src/components/seo/DeepPageLinks.tsx (remapper modules)

ADMIN DASHBOARD (adapter métriques)
src/components/admin/DataTable.tsx         →   src/components/admin/DataTable.tsx (identique)
src/components/admin/dashboard/StatsGrid.tsx    →   (leads, conversions, primes, sinistres)
src/components/admin/dashboard/ActivityChart.tsx →   (conversions/primes/sinistres)
src/components/admin/FilterPanel.tsx       →   src/components/admin/FilterPanel.tsx (identique)

GÉO (adapter API par pays)
src/components/ui/VilleAutocomplete.tsx    →   src/components/ui/CityAutocomplete.tsx (API par pays)
src/components/ui/AdresseAutocomplete.tsx  →   src/components/ui/AddressAutocomplete.tsx
src/components/maps/GeographicMap.tsx      →   src/components/maps/AgencyMap.tsx

HOOKS (identique)
src/hooks/useDebounce.ts                   →   src/hooks/useDebounce.ts
src/hooks/useToast.ts                      →   src/hooks/useToast.ts
src/hooks/use-local-storage.ts             →   src/hooks/use-local-storage.ts
src/hooks/use-media-query.ts               →   src/hooks/use-media-query.ts
src/hooks/useGeolocation.ts                →   src/hooks/useGeolocation.ts
src/hooks/useIntersectionObserver.ts       →   src/hooks/useIntersectionObserver.ts
src/hooks/useFavorites.ts                  →   src/hooks/useSavedComparisons.ts
src/hooks/useAuth.ts                       →   src/hooks/useAuth.ts
src/hooks/admin/useAdminFetch.ts           →   src/hooks/admin/useAdminFetch.ts

TYPES (adapter champs métier)
src/types/branded.ts                       →   src/types/branded.ts (+ PolicyId, ContractId)
src/types/admin.ts                         →   src/types/admin.ts (ApiResponse<T>, PaginatedResponse<T>)

SUPABASE (identique)
src/lib/supabase/client.ts                 →   src/lib/supabase/client.ts
src/lib/supabase/server.ts                 →   src/lib/supabase/server.ts
src/lib/supabase/admin.ts                  →   src/lib/supabase/admin.ts
src/lib/supabase/middleware.ts             →   src/lib/supabase/middleware.ts

DONNÉES (adapter)
src/lib/geography.ts                       →   src/lib/geography.ts (× 10 pays)
src/lib/storage.ts                         →   src/lib/storage.ts (PDF, JPG, PNG)
src/lib/validations/schemas.ts             →   src/lib/validations/schemas.ts
src/lib/config/company-identity.ts         →   src/lib/config/company-identity.ts (ORIAS, ACPR)
src/lib/notifications/unified-*.ts         →   src/lib/notifications/unified-*.ts
src/lib/prospection/message-queue.ts       →   src/lib/message-queue.ts
```

### Impact sur la Phase 0 (révisé avec 72 fichiers)

Avec ces 72 fichiers copiés (~12 000 lignes), la **Phase 0 passe de 17 jours à ~5-6 jours** :

| Tâche Phase 0 | Sans SA | Avec SA copié | Fichiers gagnés |
|----------------|---------|--------------|----------------|
| Setup Next.js + infra | 2j | **0.5j** | env.ts, next.config.js, middleware.ts, tsconfig, vercel.json |
| Cache + Redis | 2j | **0j** | cache.ts, redis-client.ts, rate-limiter.ts |
| Sécurité admin | 1j | **0.5j** | admin-auth.ts, sanitize.ts, audit-logger.ts, webhook-security.ts |
| SEO (JSON-LD, robots, sitemap) | 3j | **0.5j** | jsonld.ts (14 schemas), robots.ts, sitemap.ts, config.ts, indexnow.ts |
| Contenu programmatique | 3j | **1j** | data-driven-content.ts, location-content.ts, natural-terms.ts |
| Composants UI | 2j | **0.5j** | 10 composants UI + 5 comparateur + 5 SEO + 6 admin |
| Hooks | 1j | **0j** | 9 hooks prêts à l'emploi |
| Supabase clients | 0.5j | **0j** | 4 fichiers client (browser, server, admin, middleware) |
| Formulaires | 1j | **0.5j** | FormField.tsx, FormSection.tsx, schemas.ts |
| Tests setup | 1j | **0.5j** | setup.ts, vitest.config, playwright.config, guardrails.yml, lighthouserc |
| Logger + monitoring | 0.5j | **0j** | logger.ts |
| Géographie FR | 1j | **0.5j** | geography.ts, VilleAutocomplete, AdresseAutocomplete |
| Types + branded | 0.5j | **0j** | branded.ts, admin.ts |
| **Total** | **18.5j** | **5j** | **-13.5 jours** |

> **En résumé** : ServicesArtisans n'est pas juste une "inspiration architecturale" — c'est un **kit de démarrage concret** de 72 fichiers (~12 000 lignes) qui économise **13-14 jours** de Phase 0. Les patterns les plus précieux :
> - **Comparateur** (CompareView/Provider/Bar) → directement adaptable pour comparaison assurances
> - **Contenu programmatique** (data-driven-content.ts) → moteur 8 sections par commune, pattern clé du projet
> - **9 hooks React** → zéro réinvention (debounce, toast, localStorage, geolocation, favorites, auth, SWR)
> - **12 patterns SQL** → triggers, RLS, MV, GDPR tables, advisory locks, covering indexes
> - **Supabase 3-tier** → architecture client prouvée en production avec 3 749+ pages

---

## 16. Roadmap & Phases

### Phase 0 — Fondations

```
□ Setup projet Next.js 15 + TypeScript
□ Système CountryConfig + webpack alias
□ Schéma DB Supabase (tables de base)
□ Moteur 5 couches (resolve → data → compute → render)
□ 1 verticale (Auto) + 1 pays (France)
□ Import ONISR + INSEE + Min. Intérieur
□ Composants de base (12 layers)
□ Fonction t() + traductions FR
□ Sitemaps pré-générés
□ Deploy Vercel (comparateur-assurance.fr)
```

**Objectif** : 1 verticale × 1 pays = ~138K pages fonctionnelles

### Phase 1 — France complète

```
□ 6 verticales restantes (habitation, santé, emprunteur, moto, pro, vie)
□ Import de toutes les sources FR (15 sources)
□ Formulaire lead + table leads
□ Intégration 3-5 assureurs partenaires
□ JSON-LD complet
□ IndexNow
□ Admin dashboard basique
□ Monitoring Sentry
```

**Objectif** : 7 verticales × France = ~700K pages (couches prioritaires 1-8) + premiers leads

### Phase 2 — Monétisation

```
□ Intégration courtage direct (top 10 assureurs FR)
□ Pipeline lead → assureur (API/webhook/email)
□ Tracking conversions
□ A/B testing formulaires
□ Analytics (Plausible/PostHog)
□ Optimisation SEO (maillage, vitesse, Core Web Vitals)
```

**Objectif** : Revenus récurrents depuis la France

### Phase 3 — Expansion Européenne

```
□ Allemagne (versicherungsvergleich.de) — 2ème marché
□ Portugal (comparador-seguros.pt)
□ Espagne (comparador-seguros.es)
□ Italie (confronta-assicurazioni.it)
□ Import données par pays (8 sources chacun)
□ Traductions DE, ES, IT
□ Partenariats assureurs locaux
□ Passeport IDD pour DE, ES, IT (notification ACPR, 1-2 mois chacun)
□ Passeport IDD pour PT (notification ACPR → ASF, 1-2 mois)
```

**Objectif** : 4-5 pays live, ~14M pages
**Pré-requis** : France opérationnelle (> 500 leads/mois)

### Phase 4 — Scale

```
□ Belgique, Pays-Bas, Autriche
□ Luxembourg, Irlande
□ Multilingue BE (fr/nl)
□ Optimisation performance (cache, CDN)
□ CRM courtier
□ Support client multi-pays (chatbot + email)
□ Monitoring centralisé 10 déploiements
```

**Objectif** : 10 pays live, ~2.3M pages data-backed avec comparateur
**Pré-requis** : API branchée par pays

---

## 17. Risques & Mitigations

### Risques Google/SEO (audit Firefly)

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Système Firefly — spike `numOfUrlsByPeriods`** | Critique | Moyen | Soumission sitemap progressive 20K/semaine/domaine |
| **HCU site-wide classifier** | Critique | Faible | Comparateur fonctionnel + données API = dailyGoodClicks élevé |
| **Location-swap** (mêmes données ONISR sur 500 communes) | Élevé | Moyen | Pages communales UNIQUEMENT si ≥3 data points propres à la commune |
| **AI Overviews cannibalisent les pages informatives** | Élevé | Élevé | Prioriser pages transactionnelles avec comparateur, pas les guides |
| Taux d'indexation < 85% | Élevé | Moyen | Monitoring Search Console, pause scaling si < 70% |
| Cross-domain footprint détecté | Moyen | Faible | Pas de hreflang entre domaines, templates variés par pays, pas de WHOIS identique |
| **Risque global Firefly (avec comparateur + API)** | | | **2-3/10** (vs 7.3/10 sans comparateur) |

### Risques réglementaires (audit 10 pays)

| Pays | Risque | Mitigation |
|------|--------|------------|
| **NL** | TRÈS ÉLEVÉ — AFM considère le lead gen comme intermédiation | Notification LPS obligatoire + formulaire minimaliste |
| **DE** | TRÈS ÉLEVÉ — BaFin §34d GewO, infraction pénale possible | Notification LPS + formulaire sans qualification des besoins |
| **AT** | ÉLEVÉ — aligné approche germanophone | Notification LPS via ACPR |
| **IT** | MOYEN-ÉLEVÉ — IVASS actif sur surveillance web | Inscription RUI section E via LPS |
| **IE/BE/ES** | MOYEN | Notification LPS standard |
| **FR** | FAIBLE — ORIAS en poche | Déjà couvert |
| **PT/LU** | FAIBLE | Notification LPS, marchés peu surveillés |

**Action immédiate** : Notifier l'ACPR pour LPS dans les 9 pays (coût quasi nul, délai 1-3 mois). RC Pro avec couverture territoriale européenne.

### Risques techniques

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| ISR cold starts en cascade (Googlebot crawle 10K pages/jour) | Élevé | Moyen | Pre-warmer cron sur top pages, `Crawl-delay` dans robots.txt |
| Supabase SPOF (1 instance pour 10 apps) | Critique | Moyen | Read replicas, ou 2 instances (FR+BE+LU / reste) |
| 26+ parsers de sources cassent silencieusement | Élevé | Élevé | Table `data_source_runs`, alertes sur échec 2x, smoke tests quotidiens |
| Facture Vercel explose avec succès SEO | Moyen | Moyen | Cloudflare CDN devant Vercel, monitoring hebdo |
| Build time 150K pages SSG | Bloquant | Certain | ISR on-demand (pas SSG). Pre-build top 1-5K pages seulement |

### Risques business

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Courtiers grossistes baissent le prix du lead | Élevé | Moyen | Diversifier les partenaires, monter en Phase 2 rapidement |
| Revenue A1 insuffisant (€1-3M) pour survivre | Élevé | Moyen | Coûts opérationnels ultra-bas ($300-700/mois infra) |
| Concurrents copient le data moat | Moyen | Faible | First mover + 26 sources croisées + données de devis Phase 2 |
| Dépendance 100% Google | Critique | Moyen | 10 domaines séparés = diversification. Phase 2 = trafic direct/brand |
| Phase 3 (MGA) = métier différent | Élevé | Moyen | Capital réglementaire + actuaires nécessaires (levée €10-20M) |

---

## 18. Analyse Concurrentielle (audit 10 pays)

### Classement marchés — du plus ouvert au plus fermé

| Rang | Pays | Note | Leader actuel | Trafic leader/mois | Notre chance |
|------|------|------|--------------|-------------------|-------------|
| 1 | **Portugal** | 8/10 | ComparaJá (300-500K) | Faible | Marché vierge, dominable en 6 mois |
| 2 | **Belgique** | 7/10 | TopCompare (300-500K) | Faible | Pas de leader digital, culture courtier = bon fit |
| 3 | **Espagne** | 6/10 | Rastreator (3-4M) | Moyen | Programmatique sous-exploité, santé en croissance |
| 4 | **Luxembourg** | 6/10 | Aucun vrai comparateur | Quasi nul | Marché vide mais microscopique |
| 5 | **Irlande** | 5/10 | Bonkers.ie (500K-1M) | Faible | Accessible, anglophone, petit |
| 6 | **Italie** | 4/10 | Facile.it (5-7M) | Élevé | Auto saturé, mais santé/habitation ouverts |
| 7 | **France** | 3/10 | LeLynx (4-5M) | Élevé | Très saturé, 15 ans d'avance, budgets massifs |
| 8 | **Pays-Bas** | 3/10 | Independer (3-5M) | Élevé | Petit, mature, AFM strict |
| 9 | **Autriche** | 3/10 | durchblicker (1-2M) | Moyen | Quasi-monopole durchblicker |
| 10 | **Allemagne** | 2/10 | Check24 (15-20M) | Écrasant | Check24 = mur infranchissable |

### France — Positionnement détaillé

| Concurrent | Modèle | Pages pSEO | Data moat | Budget marketing/an |
|-----------|--------|-----------|-----------|-------------------|
| LeLynx | Comparateur (Moneysupermarket Group) | ~10K | Non | €20-30M |
| LesFurets | Multi-vertical | ~8K | Non | €15-25M |
| Assurland | Comparateur (Covéa) | ~5K | Non (conflit d'intérêts) | €10-20M |
| **Ce projet** | **Comparateur + data locale + ORIAS** | **350K** | **Oui (26+ sources)** | **€0 (SEO pur)** |

### Avantage compétitif structurel

1. **Multi-pays** : seul acteur avec vue comparative pan-européenne (contenu cross-pays exclusif)
2. **350K pages FR** vs ~10K pour LeLynx → domination long-tail
3. **Données locales croisées** : aucun concurrent ne croise CatNat + DVF + DPE + ONISR par commune
4. **Comparateur + données** : double valeur sur chaque page (outil + information)
5. **Coût marginal quasi-nul** : ajouter un pays = brancher l'API + config, pas de nouveau code
6. **Zéro coût opérationnel** : pas de téléphone, pas de store, pas d'employés → marge ~90%

### Menaces

- **Google AI Overviews** cannibalisent les pages informationnelles → mitigation : prioriser le transactionnel avec comparateur
- **Check24/Facile.it** pourraient s'étendre pan-Europe → mais 25 ans de mono-pays, pivot lent
- **Réglementation** IDD pourrait durcir → notification LPS = protection juridique
- **Incumbents copient le data moat** → ils peuvent copier les sources mais pas les données de devis propriétaires (Phase 2)

### Projection revenue

| Année | Pages | Trafic/mois | Devis/mois | Revenue | Valorisation |
|---|---|---|---|---|---|
| **A1** | 500-700K | 5-12M | 100-400K | **€5-15M** | €25-75M |
| **A2** | 700K-1M | 15-30M | 500K-1.5M | **€20-50M** | €100-300M |
| **A3** | 1M+ | 30-60M | 1.5-3M | **€60-150M** | €300-750M |
| **A4** | 1-2.3M | 50-100M | 3-6M | **€120-300M** | **€600M-1.5B** |

---

## Annexes

### A. Formulaire lead type (Auto)

```
Étape 1 — Véhicule
- Marque / Modèle / Année
- Carburant
- Usage (perso/pro)

Étape 2 — Conducteur
- Date de naissance
- Date de permis
- Bonus/Malus actuel
- Sinistres 3 dernières années

Étape 3 — Couverture
- Tiers / Tiers+ / Tous risques
- Franchise souhaitée
- Options (assistance, bris de glace, etc.)

Étape 4 — Contact
- Email
- Téléphone
- Ville (pré-rempli depuis la page)
```

### B. JSON-LD type (page service × ville)

```json
{
  "@context": "https://schema.org",
  "@type": "InsuranceAgency",
  "name": "Comparateur Assurance Auto à Lyon",
  "areaServed": {
    "@type": "City",
    "name": "Lyon",
    "containedInPlace": {
      "@type": "AdministrativeArea",
      "name": "Rhône"
    }
  },
  "makesOffer": {
    "@type": "Offer",
    "itemOffered": {
      "@type": "Service",
      "name": "Assurance Auto",
      "description": "Comparaison des assurances auto à Lyon"
    }
  },
  "broker": {
    "@type": "Organization",
    "name": "...",
    "identifier": "ORIAS XXXXXXX"
  }
}
```

### C. Commandes clés

```bash
# Développement local (France)
COUNTRY=fr npm run dev

# Build production (Allemagne)
COUNTRY=de npm run build

# Import données France
COUNTRY=fr node scripts/import-data/run-all.ts

# Générer sitemaps France
COUNTRY=fr node scripts/generate-sitemaps.ts

# Deploy tous les pays
gh workflow run deploy.yml
```

---

> **Statut** : Stratégie validée v2.0 — Analyse scientifique complète (8 licornes + 6 audits)
> **Configuration** : 2.3M pages, 10 ccTLD (domaines expirés DA 30-50), 7 verticales, comparateur day one, 26+ sources API, ORIAS + LPS, modèle 12 couches
> **Prochaine étape** : Notification LPS à l'ACPR + branchement APIs + lancement FR
> **Auteur** : Claude Opus 4.6 × Marvin
