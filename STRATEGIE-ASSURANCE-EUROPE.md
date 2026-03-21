# Stratégie Réseau Comparateur Assurance Europe

> Document de référence — Version 1.0 — 2026-03-21
> Discussion stratégique uniquement — aucun code écrit

---

## Table des matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Périmètre : 10 pays, 7 verticales, 29.5M pages](#2-périmètre)
3. [Architecture des URLs : 12 couches par verticale](#3-architecture-des-urls)
4. [Architecture Technique : Moteur 5 couches](#4-architecture-technique)
5. [Schéma Base de Données](#5-schéma-base-de-données)
6. [Data Moat : Sources de données par pays](#6-data-moat)
7. [Stratégie SEO & Sitemaps](#7-stratégie-seo--sitemaps)
8. [Monétisation Hybride (Courtage ORIAS + Lead Gen)](#8-monétisation)
9. [Stack Technique & Infrastructure](#9-stack-technique)
10. [Internationalisation (i18n)](#10-internationalisation)
11. [Stratégie de Déploiement : 1 domaine par pays](#11-stratégie-de-déploiement)
12. [Comparaison avec ServicesArtisans](#12-comparaison-avec-servicesartisans)
13. [Roadmap & Phases](#13-roadmap--phases)
14. [Risques & Mitigations](#14-risques--mitigations)
15. [Analyse Concurrentielle](#15-analyse-concurrentielle)

---

## 1. Vision & Positionnement

### Concept
Réseau de sites de comparaison d'assurance couvrant 10 pays européens, avec une approche **programmatique massive** : générer des millions de pages hyper-localisées (niveau commune) enrichies de données publiques exclusives pour créer un **data moat** infranchissable.

### Différenciateur clé
- **LeLynx/Assurland** : comparateurs classiques avec formulaire → devis. Pas de contenu local.
- **Notre approche** : contenu local enrichi de données publiques (accidents, sinistres, climat, démographie) + comparaison → **double valeur SEO + conversion**.

### Opérateur
Courtier en assurance enregistré **ORIAS** — pas un simple affilié. Permet le courtage direct (commission récurrente 10-20%) en plus du lead gen.

### Cible
- 29.5 millions de pages générées programmatiquement
- 10 pays européens
- 7 verticales d'assurance
- 6 langues
- Codebase : 40-50K lignes (vs 294K pour ServicesArtisans)

---

## 2. Périmètre

### 10 Pays cibles

| # | Pays | Domaine (ccTLD) | Langue | Communes | Verticales | Pages estimées |
|---|------|-----------------|--------|----------|------------|----------------|
| 1 | France | comparateur-assurance.fr | fr | 36 000 | 7 | 5.0M |
| 2 | Allemagne | versicherungsvergleich.de | de | 11 000 | 7 | 3.5M |
| 3 | Espagne | comparador-seguros.es | es | 8 100 | 7 | 2.8M |
| 4 | Italie | confronta-assicurazioni.it | it | 7 900 | 7 | 2.7M |
| 5 | Belgique | comparateur-assurance.be | fr/nl | 581 | 7 | 1.5M |
| 6 | Pays-Bas | verzekeringsvergelijker.nl | nl | 345 | 6 | 1.2M |
| 7 | Portugal | comparador-seguros.pt | pt | 3 092 | 6 | 1.8M |
| 8 | Autriche | versicherungsvergleich.at | de | 2 093 | 6 | 1.5M |
| 9 | Suisse | comparateur-assurance.ch | fr/de | 2 172 | 7 | 2.0M |
| 10 | Luxembourg | comparateur-assurance.lu | fr | 102 | 5 | 0.5M |
| | **TOTAL** | | **6 langues** | **~71 400** | | **~29.5M** |

### 7 Verticales

| Verticale | Slug FR | Obligatoire | Facteurs de risque locaux |
|-----------|---------|-------------|--------------------------|
| Auto | assurance-auto | Oui | Accidents/km, vols, densité trafic |
| Habitation | assurance-habitation | Non* | Cambriolages, inondations, séismes, DPE |
| Santé | mutuelle-sante | Non | Densité médecins, déserts médicaux, démographie |
| Emprunteur | assurance-emprunteur | Non* | Prix immobilier, taux, sinistralité |
| Moto | assurance-moto | Oui | Accidents moto, vols 2-roues |
| Pro | assurance-professionnelle | Non | Densité entreprises, secteurs, sinistres pro |
| Vie | assurance-vie | Non | Espérance de vie, revenus, patrimoine |

*Quasi-obligatoire en pratique (exigé par banques/bailleurs)

---

## 3. Architecture des URLs

### 12 couches par verticale

Chaque verticale génère 12 types de pages, multipliés par la granularité géographique :

```
COUCHE 1  — Service × Ville      /assurance-auto/paris
COUCHE 2  — Tarifs × Ville       /assurance-auto/paris/tarifs
COUCHE 3  — Devis × Ville        /assurance-auto/paris/devis
COUCHE 4  — Avis × Ville         /assurance-auto/paris/avis
COUCHE 5  — Département × Service /assurance-auto/departement/paris-75
COUCHE 6  — Région × Service     /assurance-auto/region/ile-de-france
COUCHE 7  — Comparaison          /assurance-auto/comparaison
COUCHE 8  — Assureur × Ville     /assurance-auto/paris/maif
COUCHE 9  — Guides               /assurance-auto/guides/jeune-conducteur
COUCHE 10 — Questions             /assurance-auto/questions/bonus-malus
COUCHE 11 — Baromètre            /assurance-auto/barometre
COUCHE 12 — Blog                 /assurance-auto/blog/reforme-2026
```

### Calcul des pages pour la France (1 verticale : Auto)

| Couche | Calcul | Pages |
|--------|--------|-------|
| Service × Ville | 36 000 communes | 36 000 |
| Tarifs × Ville | 36 000 communes | 36 000 |
| Devis × Ville | 36 000 communes | 36 000 |
| Avis × Ville | ~5 000 villes principales | 5 000 |
| Département | 101 départements | 101 |
| Région | 18 régions | 18 |
| Comparaison | 1 page globale | 1 |
| Assureur × Ville | 50 assureurs × 500 villes | 25 000 |
| Guides | ~50 guides | 50 |
| Questions | ~200 questions | 200 |
| Baromètre | 1 + 101 départements | 102 |
| Blog | ~100 articles | 100 |
| **Total Auto FR** | | **~138 500** |

**× 7 verticales × facteur de variation = ~700K pages pour la France**
**× 10 pays = ~29.5M pages au total**

### Structure URL par pays

```
FR: /assurance-auto/lyon
DE: /kfz-versicherung/münchen
ES: /seguro-coche/madrid
IT: /assicurazione-auto/roma
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
│   │   ├── ServiceCity.tsx       # Couche URL 1
│   │   ├── TarifsCity.tsx        # Couche URL 2
│   │   ├── DevisCity.tsx         # Couche URL 3
│   │   ├── AvisCity.tsx          # Couche URL 4
│   │   ├── Department.tsx        # Couche URL 5
│   │   ├── Region.tsx            # Couche URL 6
│   │   ├── Comparison.tsx        # Couche URL 7
│   │   ├── InsurerCity.tsx       # Couche URL 8
│   │   ├── Guide.tsx             # Couche URL 9
│   │   ├── Question.tsx          # Couche URL 10
│   │   ├── Barometer.tsx         # Couche URL 11
│   │   └── BlogPost.tsx          # Couche URL 12
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
│   ├── pt.ts
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

**Estimation : ~40-50K lignes** (vs 294K pour ServicesArtisans)

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

CREATE TABLE city_risk_data (
  city_id UUID REFERENCES cities(id),
  vertical_key TEXT REFERENCES verticals(key),
  year INTEGER NOT NULL,
  data JSONB NOT NULL,
  /*
  Exemple JSONB pour auto :
  {
    "accidents_total": 234,
    "accidents_per_1000_hab": 3.2,
    "accidents_mortels": 5,
    "vols_vehicules": 189,
    "vols_per_1000_hab": 2.6,
    "densite_trafic": "élevée",
    "prime_moyenne_estimee": 650,
    "variation_vs_national": "+12%",
    "top_assureurs_locaux": ["maif", "macif", "axa"]
  }

  Exemple JSONB pour habitation :
  {
    "cambriolages_per_1000": 4.1,
    "zone_inondation": true,
    "zone_sismique": 2,
    "dpe_moyen": "D",
    "prix_m2_moyen": 3200,
    "sinistres_climatiques_5ans": 12,
    "prime_moyenne_estimee": 280
  }
  */
  source TEXT NOT NULL,            -- 'onisr', 'min_interieur', etc.
  imported_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(city_id, vertical_key, year)
);

CREATE INDEX idx_risk_city ON city_risk_data(city_id);
CREATE INDEX idx_risk_vertical ON city_risk_data(vertical_key, year);

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

### Estimation du volume de données

| Table | Lignes estimées | Taille |
|-------|-----------------|--------|
| cities | ~71 400 | ~20 MB |
| city_risk_data | ~71 400 × 7 × 3 ans = ~1.5M | ~500 MB |
| insurers | ~500 | ~1 MB |
| insurer_verticals | ~2 000 | ~1 MB |
| guides | ~3 500 | ~50 MB |
| questions | ~14 000 | ~100 MB |
| leads | Croissance | Variable |
| **Total initial** | | **~700 MB** |

---

## 6. Data Moat

### Principe
Les données publiques sont **gratuites et accessibles** mais leur **collecte, nettoyage, normalisation et croisement au niveau commune** crée une barrière à l'entrée massive. C'est le même principe que ServicesArtisans avec les données SIRENE, DVF, INSEE.

### Sources par pays

#### France (15 sources) — Modèle de référence

| # | Source | Données | Verticale | Format | Fréquence |
|---|--------|---------|-----------|--------|-----------|
| 1 | ONISR | Accidents de la route | Auto, Moto | CSV | Annuel |
| 2 | SIV | Immatriculations, parc auto | Auto, Moto | CSV | Annuel |
| 3 | Min. Intérieur | Cambriolages, vols, délits | Auto, Habitation | CSV | Annuel |
| 4 | INSEE | Démographie, revenus, emploi | Toutes | CSV | Annuel |
| 5 | DVF | Transactions immobilières, prix/m² | Habitation, Emprunteur | CSV | Semestriel |
| 6 | Géorisques | Zones inondation, séisme, PPRI | Habitation | API | Temps réel |
| 7 | SDIS | Interventions pompiers, incendies | Habitation | CSV | Annuel |
| 8 | DREES | Offre de soins, déserts médicaux | Santé | CSV | Annuel |
| 9 | Ameli Open Data | Remboursements, consommation soins | Santé | CSV | Annuel |
| 10 | FFB | Construction, rénovation | Habitation | CSV | Annuel |
| 11 | BdF / ANIL | Taux crédit, endettement | Emprunteur | CSV | Trimestriel |
| 12 | ADEME / DPE | Performance énergétique | Habitation | CSV | Annuel |
| 13 | API Geo | Communes, codes, coordonnées | Toutes | API | Temps réel |
| 14 | SIRENE | Entreprises par commune | Pro | API | Quotidien |
| 15 | Météo-France | Climat, événements extrêmes | Habitation | API | Annuel |

#### Allemagne (8 sources)

| # | Source | Données | Format |
|---|--------|---------|--------|
| 1 | Destatis | Démographie, économie | CSV |
| 2 | KBA | Immatriculations, accidents | CSV |
| 3 | BKA | Criminalité | CSV |
| 4 | GDV | Stats assurance (fédération) | PDF/CSV |
| 5 | BBR/BBSR | Immobilier, construction | CSV |
| 6 | Gemeindeverzeichnis | Géographie communes | CSV |
| 7 | DWD | Météo, événements extrêmes | API |
| 8 | Bundesbank | Taux, crédit | CSV |

#### Espagne (8 sources)

| # | Source | Données | Format |
|---|--------|---------|--------|
| 1 | INE | Démographie, économie | API |
| 2 | DGT | Trafic, accidents | CSV |
| 3 | Min. Interior | Criminalité | CSV |
| 4 | DGSFP | Stats assurance | PDF |
| 5 | Catastro | Immobilier | API |
| 6 | IGN | Géographie | API |
| 7 | AEMET | Météo | API |
| 8 | BdE | Taux, crédit | CSV |

#### Même pattern pour IT, BE, NL, PT, AT, CH, LU
Chaque pays : 6-10 sources de données publiques équivalentes.

### Pipeline d'import

```
Sources publiques (CSV/API)
    ↓ scripts/import-data/{country}/
Nettoyage & normalisation
    ↓
Agrégation au niveau commune
    ↓
INSERT city_risk_data (JSONB)
    ↓ cron trimestriel
Recalcul des estimations de prix
    ↓
Invalidation ISR (IndexNow)
```

---

## 7. Stratégie SEO & Sitemaps

### Principes

1. **0 pages pré-rendues** — 100% ISR on-demand
2. **Sitemaps pré-générés par cron** (pas de routes API runtime comme ServicesArtisans)
3. **IndexNow** pour notifier Google/Bing après chaque import de données
4. **JSON-LD** sur chaque page (InsuranceAgency, FAQPage, BreadcrumbList)
5. **Hreflang** pour les pays multilingues (BE, CH)

### Pourquoi 0 pages pré-rendues

Avec 29.5M pages, le pré-rendu est **impossible** :
- À 1 page/seconde = 341 jours de build
- ISR on-demand : la page est générée au premier visit, puis mise en cache
- Les crawlers Google/Bing sont le premier visiteur → IndexNow les guide

### Architecture Sitemaps

```
/sitemap.xml (index)
├── /sitemaps/auto-communes-01.xml      (5000 URLs)
├── /sitemaps/auto-communes-02.xml      (5000 URLs)
├── ...
├── /sitemaps/auto-communes-08.xml      (dernières communes)
├── /sitemaps/auto-departements.xml     (101 URLs)
├── /sitemaps/auto-regions.xml          (18 URLs)
├── /sitemaps/auto-assureurs.xml        (25000 URLs)
├── /sitemaps/auto-guides.xml           (50 URLs)
├── /sitemaps/auto-questions.xml        (200 URLs)
├── /sitemaps/habitation-communes-01.xml
├── ...
└── /sitemaps/blog.xml
```

**~100 fichiers sitemap par pays** (max 50 000 URLs par fichier)

### Génération

```bash
# Cron quotidien (ou après import de données)
COUNTRY=fr node scripts/generate-sitemaps.ts

# Génère des fichiers statiques dans /public/sitemaps/
# Puis notifie IndexNow avec les URLs modifiées
```

### Maillage interne

Chaque page inclut des liens vers :
- Les autres couches de la même ville (`/assurance-auto/lyon` → `/assurance-auto/lyon/tarifs`)
- Les villes voisines (`/assurance-auto/lyon` → `/assurance-auto/villeurbanne`)
- Le département parent (`/assurance-auto/lyon` → `/assurance-auto/departement/rhone-69`)
- Les autres verticales de la même ville (`/assurance-auto/lyon` → `/assurance-habitation/lyon`)

---

## 8. Monétisation

### Modèle hybride (avantage courtier ORIAS)

```
┌──────────────────────────────────────────────────────────┐
│                   REVENUS                                │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │   COURTAGE DIRECT   │  │      LEAD GEN           │   │
│  │   (Prioritaire)     │  │      (Complémentaire)   │   │
│  │                     │  │                          │   │
│  │  Commission 10-20%  │  │  Vente de leads          │   │
│  │  récurrente annuelle│  │  qualifiés aux           │   │
│  │  sur chaque contrat │  │  assureurs partenaires   │   │
│  │  souscrit           │  │                          │   │
│  │                     │  │  15-80€ / lead selon     │   │
│  │  Relation directe   │  │  verticale et qualité    │   │
│  │  avec l'assuré      │  │                          │   │
│  └─────────────────────┘  └─────────────────────────┘   │
│                                                          │
│  Chaque assureur partenaire a sa propre infrastructure   │
│  d'intégration (API, webhook, email, extranet)           │
└──────────────────────────────────────────────────────────┘
```

### Pourquoi le courtage est supérieur à l'affiliation

| Critère | Affiliation | Courtage ORIAS |
|---------|-------------|----------------|
| Commission | 5-15€/lead one-shot | 10-20% récurrent/an |
| Relation client | Aucune | Directe (portefeuille) |
| LTV client | 0 (one-shot) | 3-5 ans × commission |
| Valorisation | Faible (dépend du trafic) | Élevée (portefeuille récurrent) |
| Contrôle prix | Aucun | Négociation directe |
| Réglementation | Légère | ORIAS, ACPR, DDA |

### Flux lead par assureur

Chaque assureur a son propre mode d'intégration :
- **API directe** : POST des leads en temps réel
- **Webhook** : notification + extraction via extranet
- **Email structuré** : envoi automatique au format attendu
- **Extranet** : dépôt dans le portail partenaire

La table `insurer_verticals.commission_type` gère cette diversité.

### Valeur d'un lead par verticale

| Verticale | Valeur lead (estimation) | Prime moyenne annuelle | Commission courtage |
|-----------|-------------------------|----------------------|---------------------|
| Auto | 15-30€ | 600€ | 60-120€/an |
| Habitation | 10-25€ | 250€ | 25-50€/an |
| Santé | 30-60€ | 1 200€ | 120-240€/an |
| Emprunteur | 50-80€ | 3 000€ (total) | 300-600€ (total) |
| Moto | 10-20€ | 350€ | 35-70€/an |
| Pro | 40-80€ | 2 000€ | 200-400€/an |
| Vie | 20-40€ | 1 500€/an | 150-300€/an |

---

## 9. Stack Technique

### Core

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Framework | Next.js 15 (App Router) | ISR, RSC, routing catch-all |
| Runtime | Node.js | Écosystème, Vercel natif |
| Base de données | Supabase (PostgreSQL) | Même stack que ServicesArtisans, JSONB natif |
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
| Redis | Oui (cache, rate limit) | Non nécessaire (ISR suffit) |
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

## 10. Internationalisation

### Approche : fonction t() simple

Pas de framework i18n lourd (next-intl, i18next). Une simple fonction `t(key, params)` avec 200-300 clés par langue.

```typescript
// src/i18n/t.ts
import { countryConfig } from '@/lib/country'

type Translations = Record<string, string>

const translations: Record<string, Translations> = {
  fr: { /* lazy import */ },
  de: { /* lazy import */ },
  // ...
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
  // Navigation
  'nav.home': 'Accueil',
  'nav.compare': 'Comparer',
  'nav.guides': 'Guides',

  // Pages service
  'service.title': 'Assurance {vertical} à {city}',
  'service.subtitle': 'Comparez les meilleures offres d\'assurance {vertical} à {city} ({department})',
  'service.cta': 'Obtenir mon devis gratuit',

  // Risques
  'risk.verdict.low': 'Risque faible',
  'risk.verdict.medium': 'Risque modéré',
  'risk.verdict.high': 'Risque élevé',
  'risk.accidents': '{count} accidents recensés en {year}',

  // Prix
  'price.estimate': 'Prix moyen estimé : {price}€/an',
  'price.vs_national': '{percent} par rapport à la moyenne nationale',

  // Formulaire
  'form.email': 'Votre email',
  'form.phone': 'Téléphone',
  'form.submit': 'Recevoir mes devis',
  'form.legal': 'En soumettant ce formulaire, vous acceptez d\'être contacté par nos partenaires assureurs.',

  // Footer
  'footer.orias': 'Courtier enregistré ORIAS n°{number}',
  'footer.acpr': 'Régulé par l\'ACPR',
}
```

### Pays multilingues

- **Belgique** : `fr` (Wallonie) + `nl` (Flandre) → sous-dossier ou préfixe URL `/nl/`
- **Suisse** : `fr` (Romandie) + `de` (Alémanique) → idem
- **Luxembourg** : `fr` uniquement (marché petit)

---

## 11. Stratégie de Déploiement

### 1 domaine par pays (ccTLD)

```
comparateur-assurance.fr     → COUNTRY=fr  vercel deploy
versicherungsvergleich.de    → COUNTRY=de  vercel deploy
comparador-seguros.es        → COUNTRY=es  vercel deploy
confronta-assicurazioni.it   → COUNTRY=it  vercel deploy
comparateur-assurance.be     → COUNTRY=be  vercel deploy
verzekeringsvergelijker.nl   → COUNTRY=nl  vercel deploy
comparador-seguros.pt        → COUNTRY=pt  vercel deploy
versicherungsvergleich.at    → COUNTRY=at  vercel deploy
comparateur-assurance.ch     → COUNTRY=ch  vercel deploy
comparateur-assurance.lu     → COUNTRY=lu  vercel deploy
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
        country: [fr, de, es, it, be, nl, pt, at, ch, lu]
    steps:
      - uses: actions/checkout@v4
      - run: vercel deploy --prod --env COUNTRY=${{ matrix.country }}
```

---

## 12. Comparaison avec ServicesArtisans

### Tableau comparatif complet

| Dimension | ServicesArtisans | Assurance Europe |
|-----------|------------------|------------------|
| **Type** | Marketplace biface | Site contenu + lead gen |
| **Lignes de code** | 294K | 40-50K (estimation) |
| **Pays** | France uniquement | 10 pays européens |
| **Pages** | ~2 millions | ~29.5 millions |
| **Ratio pages/code** | ~7 pages/ligne | ~655 pages/ligne |
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

---

## 13. Roadmap & Phases

### Phase 0 — Fondations (Semaines 1-3)

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

### Phase 1 — France complète (Semaines 4-6)

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

**Objectif** : 7 verticales × France = ~700K pages + premiers leads

### Phase 2 — Monétisation (Semaines 7-10)

```
□ Intégration courtage direct (top 10 assureurs FR)
□ Pipeline lead → assureur (API/webhook/email)
□ Tracking conversions
□ A/B testing formulaires
□ Analytics (Plausible/PostHog)
□ Optimisation SEO (maillage, vitesse, Core Web Vitals)
```

**Objectif** : Revenus récurrents depuis la France

### Phase 3 — Expansion Européenne (Semaines 11-20)

```
□ Allemagne (versicherungsvergleich.de) — 2ème marché
□ Espagne (comparador-seguros.es)
□ Italie (confronta-assicurazioni.it)
□ Import données par pays (8 sources chacun)
□ Traductions DE, ES, IT
□ Partenariats assureurs locaux
```

**Objectif** : 4 pays live, ~14M pages

### Phase 4 — Scale (Semaines 21-30)

```
□ Belgique, Pays-Bas, Portugal, Autriche
□ Suisse, Luxembourg
□ Multilingue BE (fr/nl) et CH (fr/de)
□ Optimisation performance (cache, CDN)
□ CRM courtier (discussion reportée)
```

**Objectif** : 10 pays live, ~29.5M pages

---

## 14. Risques & Mitigations

### Risques techniques

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| ISR cache invalidation à 29.5M pages | Élevé | Moyen | IndexNow ciblé, pas de purge globale |
| Vercel cold starts sur pages non-cachées | Moyen | Élevé | Edge runtime, queries optimisées |
| JSONB city_risk_data trop large | Moyen | Faible | Index GIN, queries spécifiques |
| Supabase connexion pool saturé | Élevé | Moyen | Connection pooler, 1 seul client |
| Build time avec 10 pays | Faible | Faible | 1 build = 1 pays (webpack alias) |

### Risques business

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Google pénalise contenu "thin" programmatique | Critique | Moyen | Données uniques par page, pas de duplicate |
| Réglementation courtage varie par pays | Élevé | Élevé | Config legal par pays, compliance locale |
| Assureurs refusent intégration | Élevé | Moyen | Lead gen email en fallback |
| Concurrents copient le data moat | Moyen | Faible | First mover + 15 sources = barrière élevée |
| Données publiques changent de format | Moyen | Élevé | Scripts import isolés, monitoring |

### Risques opérationnels

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Solo operator = bus factor 1 | Critique | Élevé | Code simple, documentation, moteur générique |
| 10 déploiements à maintenir | Moyen | Moyen | Même code, CI/CD automatisé |
| Support client multi-pays | Élevé | Moyen | Automatisation max, chatbot par pays |

---

## 15. Analyse Concurrentielle

### France

| Concurrent | Modèle | Pages programmatiques | Data moat | Position |
|-----------|--------|----------------------|-----------|----------|
| LeLynx | Comparateur + formulaire | ~10K | Non | Leader |
| Assurland | Comparateur + formulaire | ~5K | Non | #2 |
| LesFurets | Multi-vertical | ~8K | Non | #3 |
| Hyperassur | Comparateur simple | ~3K | Non | #4 |
| **Notre projet** | **Contenu local + courtage** | **~700K** | **Oui (15 sources)** | **Challenger** |

### Avantage compétitif

1. **Volume** : 700K pages FR vs ~10K max pour LeLynx → domination long-tail SEO
2. **Données locales** : aucun concurrent n'a de données de risque par commune
3. **Double revenus** : courtage ORIAS (récurrent) + lead gen (one-shot)
4. **Coût marginal quasi-nul** : ajouter un pays = config + données + traduction, pas de nouveau code
5. **Scalabilité** : 10 pays avec le même codebase de 40-50K lignes

### Menaces

- **Google** pourrait lancer un comparateur intégré (comme Flights)
- **LeLynx** pourrait pivoter vers le contenu programmatique (mais investissement lourd)
- **Réglementation** européenne pourrait durcir les règles courtage en ligne

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

> **Statut** : Discussion stratégique — Aucun code écrit
> **Prochaine étape** : Validation de la stratégie puis Phase 0 (fondations)
> **Auteur** : Claude Opus 4.6 × Marvin
