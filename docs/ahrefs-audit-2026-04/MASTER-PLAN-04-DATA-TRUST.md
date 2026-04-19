# MASTER-PLAN-04-DATA-TRUST — ServicesArtisans

**Agent** : Head of Data & Trust
**Date** : 2026-04-18
**Mission** : Plan data/trust définitif pour faire de ServicesArtisans la source la plus fiable du marché artisans + rénovation énergétique français

## 0. Synthèse exécutive

**Problème** : 21 concurrents en chute (-13 % à -41 %), SEUL `societe.com` gagne (+63 %). Pourquoi ? Positionnement « source officielle SIREN ». Google récompense massivement les sources qui citent les données administratives officielles françaises (INSEE, INPI, ADEME, ANAH).

**Opportunité** : ServicesArtisans possède déjà 60 % des briques (SIRET, code NAF, libellé NAF, forme juridique, géocodage, simulateur MaPrimeRénov' en prod). Il manque : (1) certifications RGE synchronisées quotidiennement depuis ADEME, (2) base de connaissance MaPrimeRénov' 2026 structurée, (3) Schema.org officiel, (4) gouvernance data.

**Thèse data-as-a-moat** : combiner 4 sources officielles sur une seule fiche artisan crée un signal de confiance inégalé : `SIREN (INSEE) + RGE (ADEME) + Éligibilité aides (ANAH/France-Rénov') + Géocodage officiel (BAN)`. Aucun concurrent ne le fait. Ce positionnement protège contre AI Overviews (Google cite les sources officielles) ET contre Perplexity/ChatGPT (qui citent Wikipedia + sources gouv.fr en priorité).

**Livrables** :

- Intégration API ADEME RGE (endpoint public, 600 req/min, gratuit, ~62 000 à 173 000 entités)
- Migration DB : 8 colonnes + 2 tables + 4 index
- Base de connaissance MaPrimeRénov' 2026 structurée (JSON versionné)
- 3 cron jobs (quotidien RGE, mensuel barèmes, hebdo SIREN validation)
- Schema.org par typologie de page (LocalBusiness / GovernmentService / FinancialProduct / Certification)
- Roadmap 12 semaines

**KPI cible à 6 mois** :

- 100 % providers RGE avec certification vérifiée et datée
- Schema.org 100 % déployé sur pages artisans, aides, travaux
- Montants MaPrimeRénov' mis à jour automatiquement (dernière validation visible)
- DR cible > 15 (actuel : 0,6)
- Position `artisan RGE [ville]` top 10 sur 200 villes

## 1. Audit trust signals actuels vs concurrents

### 1.1 ServicesArtisans — état des lieux

| Signal                          | État                                       | Fichier / colonne                               | Score /10 |
| ------------------------------- | ------------------------------------------ | ----------------------------------------------- | --------- |
| SIREN/SIRET par artisan         | ✅ En DB                                   | `providers.siret`                               | 9         |
| Code NAF + libellé              | ✅ En DB                                   | `providers.code_naf`, `libelle_naf`             | 9         |
| Forme juridique                 | ✅ En DB                                   | `providers.legal_form_code`                     | 8         |
| Géocodage officiel (BAN)        | ✅ En DB                                   | `latitude`, `longitude`, `location` (geography) | 8         |
| Certifications RGE              | ❌ Absent                                  | —                                               | 0         |
| Éligibilité MaPrimeRénov'       | ⚠️ Simulateur mais pas lié à fiche artisan | Pipedrive simulateur                            | 3         |
| Review vérifiées (avec booking) | ✅ En DB (FK `booking_id`)                 | `reviews.booking_id`                            | 7         |
| Noindex pour artisans non claim | ✅                                         | `providers.noindex`                             | 8         |
| Schema.org LocalBusiness        | ⚠️ Partiel (à auditer)                     | —                                               | 4         |
| Schema.org Certification        | ❌ Absent                                  | —                                               | 0         |
| Citations sources officielles   | ⚠️ Présent sur quelques guides             | —                                               | 4         |
| Mise à jour datée visible       | ⚠️ Inconsistant                            | —                                               | 5         |
| Auteur identifié (YMYL)         | ❌ Absent                                  | —                                               | 1         |

**Trust score global : 66 % de fondation déjà posée, 34 % à construire.**

### 1.2 societe.com (le seul gagnant, +63 %) — pourquoi il gagne

- Positionnement unique : « extrait RNE officiel, comptes annuels, dirigeants, bilans »
- Chaque page entreprise cite : SIREN + SIRET + RCS + NAF + RNE + date immatriculation + capital social + dirigeants
- Toutes les données sont _traçables_ vers INSEE / INPI
- Schema.org `Organization` + `LocalBusiness` + `Corporation` bien implémentés
- Fraîcheur visible : « Données mises à jour le XX/XX/2026 »
- Backlinks structurels massifs (tout le web comptable / juridique cite societe.com)

**Leçon** : Google = moteur d'autorité. Il récompense les sites qui _citent_ les sources officielles + les sites _identifiables comme sources secondaires fiables_.

### 1.3 effy.fr — concurrent direct rénovation énergétique

- DR 70+, positionnement « spécialiste aides »
- Points forts : guides MaPrimeRénov' très complets, simulateur, annuaire RGE interne
- Points faibles : pas de SIREN visible, pas de vérification ADEME live, noeuds d'autorité anciens
- Trust score estimé : 75 %

### 1.4 quelleenergie.fr — leader historique

- Ancienneté = autorité implicite
- Simulateur puissant, base artisans RGE vérifiée manuellement
- Points faibles : UX datée, data pas en temps réel
- Trust score estimé : 70 %

### 1.5 Fenêtre d'opportunité

Aucun des 3 concurrents ne combine **sync live ADEME + SIREN officiel + barèmes MaPrimeRénov' versionnés + attestations Schema.org Certification**. C'est la position gagnante disponible.

## 2. Stratégie data-as-a-moat

### 2.1 Principe directeur — « Officielle par construction »

Chaque donnée affichée DOIT pouvoir répondre à 4 questions :

1. **Source** : quelle API/fichier officiel ?
2. **Date** : dernière synchronisation ?
3. **Traçabilité** : URL vers la source publique ?
4. **Fréquence** : quand re-validée ?

### 2.2 Les 4 piliers du trust moat

| Pilier                 | Source                                                                | Fréquence sync   | Impact SEO             |
| ---------------------- | --------------------------------------------------------------------- | ---------------- | ---------------------- |
| **Identité légale**    | API Recherche Entreprises (data.gouv.fr) + SIRENE                     | Hebdo            | Valide SIRET non radié |
| **Qualification RGE**  | `data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2` | Quotidien        | E-E-A-T technique      |
| **Éligibilité aides**  | Arrêtés JORF + `france-renov.gouv.fr`                                 | Mensuel          | YMYL financier         |
| **Géocodage officiel** | API BAN (adresse.data.gouv.fr)                                        | Sur modification | Local SEO              |

### 2.3 Badge « Vérifié ServicesArtisans »

Chaque fiche artisan affichera un bloc visible :

```
✓ SIREN actif (vérifié il y a X jours via INSEE)
✓ RGE Qualibat #8611 (valide jusqu'au 15/07/2027)
✓ Géocodage BAN : 48.8566,2.3522
✓ Domaines éligibles MaPrimeRénov' : 6 gestes
```

Chaque ligne est cliquable → modale avec lien vers la source officielle. Ceci est l'**arme anti-AI-Overview** : les LLM citeront ServicesArtisans comme source de données consolidée.

### 2.4 Effet réseau data

Plus la DB est enrichie, plus :

- Les pages `/artisans/[slug]` deviennent canoniques pour « [nom artisan] avis/SIRET »
- Les pages `/services/[métier]-rge/[ville]` filtrent en live les artisans RGE du coin
- Les pages `/aides/[dept]/maprimerenov` affichent `X artisans RGE agréés`
- Les backlinks éditoriaux (presse, blogs) ciblent automatiquement ServicesArtisans comme source

## 3. Intégration API FRANCE-RÉNOV' / ADEME

### 3.1 Endpoint retenu : Open Data ADEME (gratuit, sans token)

**Base URL** : `https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2`

**Endpoints disponibles** :

- `GET /` — métadonnées dataset
- `GET /lines` — query records (paginé)
- `GET /values_agg` — agrégations
- `GET /geo_agg` — agrégations géographiques

**Authentification** :

- Anonyme : OK, limite 600 requêtes / 60 sec
- Avec API key : 1 200 req / 60 sec
- Pour notre volumétrie initiale : anonyme suffit

**Rate limits effectifs** :

- 600 req/min = 10 req/s anonyme
- Download : 500 kB/s calls dynamiques, 8 MB/s static
- **Stratégie** : téléchargement CSV/JSON complet (actualisé hebdo) plutôt que pagination live

**Endpoint alternatif premium — API Entreprise (gouv.fr)** :

- URL : `https://entreprise.api.gouv.fr/v3/ademe/etablissements/{siret}/certification_rge`
- Requiert : token DataPass
- Avantage : PDF certificats officiels téléchargeables
- Utilisation : process de _claim_ artisan (validation admin) — pas pour bulk sync

### 3.2 Champs à mapper vers `providers`

| Champ ADEME          | Type   | Champ cible                              | Note                |
| -------------------- | ------ | ---------------------------------------- | ------------------- |
| `siret`              | string | `siret` (PK matching)                    | Matching exact      |
| `nom_entreprise`     | string | Validation `name`                        | Check cohérence     |
| `code_qualification` | string | → `rge_qualifications[].code`            | Ex : `8611`, `QPAC` |
| `nom_qualification`  | string | → `rge_qualifications[].label`           |                     |
| `nom_certificat`     | string | → `rge_qualifications[].certificate`     |                     |
| `domaine`            | array  | → `rge_qualifications[].domains`         |                     |
| `meta_domaine`       | string | → `rge_qualifications[].meta_domain`     |                     |
| `organisme`          | string | → `rge_qualifications[].issuer`          | Qualibat/Qualit'EnR |
| `particulier`        | bool   | → `rge_qualifications[].for_individuals` |                     |
| `lien_date_debut`    | date   | → `rge_qualifications[].valid_from`      |                     |
| `lien_date_fin`      | date   | → `rge_qualifications[].valid_until`     |                     |
| `latitude/longitude` | number | Validation `providers.location`          | Cross-check         |
| `telephone`/`email`  | string | ⚠️ NE PAS écraser (claim-owned)          |                     |

### 3.3 Volumétrie attendue

- **~62 000 entreprises RGE** (mars 2026) ou ~173 000 labellisations
- Fichier complet JSON ~ 150-200 Mo
- Matching via `siret` (indexed)
- Taux de match attendu : 15-25 %

### 3.4 Fréquence sync recommandée

| Type                                | Fréquence                  | Pourquoi                     |
| ----------------------------------- | -------------------------- | ---------------------------- |
| **Bulk RGE complet**                | Quotidien 04:00 UTC        | ADEME publie API quotidienne |
| **Re-validation SIRET INSEE**       | Hebdo (dimanche 02:00)     | Détecte radiations           |
| **Re-fetch per-artisan (on claim)** | On-demand                  | Validation lors du claim     |
| **Purge qualifs expirées**          | Quotidien (après sync RGE) | Masquage auto si expiré      |

### 3.5 Script Node.js complet

Placement : `scripts/sync-rge-ademe.ts`, lancé via GitHub Action quotidien.

```typescript
// scripts/sync-rge-ademe.ts
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

type AdemeRow = {
  siret: string
  nom_entreprise: string
  code_qualification: string
  nom_qualification: string
  nom_certificat: string
  domaine: string[]
  meta_domaine: string
  organisme: string
  particulier: boolean
  lien_date_debut: string
  lien_date_fin: string
}

type AdemeResponse = {
  total: number
  next?: string
  results: AdemeRow[]
}

const ADEME_BASE = 'https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2'
const PAGE_SIZE = 10_000

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function fetchPage(after?: string): Promise<AdemeResponse> {
  const url = new URL(`${ADEME_BASE}/lines`)
  url.searchParams.set('size', String(PAGE_SIZE))
  url.searchParams.set(
    'select',
    [
      'siret',
      'nom_entreprise',
      'code_qualification',
      'nom_qualification',
      'nom_certificat',
      'domaine',
      'meta_domaine',
      'organisme',
      'particulier',
      'lien_date_debut',
      'lien_date_fin',
    ].join(',')
  )
  if (after) url.searchParams.set('after', after)

  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`ADEME ${res.status}: ${await res.text()}`)
  return res.json()
}

async function syncBatch(rows: AdemeRow[]) {
  const bySiret = new Map<string, AdemeRow[]>()
  for (const r of rows) {
    if (!r.siret) continue
    const arr = bySiret.get(r.siret) ?? []
    arr.push(r)
    bySiret.set(r.siret, arr)
  }

  for (const [siret, quals] of bySiret) {
    const payload = quals.map((q) => ({
      code: q.code_qualification,
      label: q.nom_qualification,
      certificate: q.nom_certificat,
      issuer: q.organisme,
      domains: q.domaine,
      meta_domain: q.meta_domaine,
      for_individuals: q.particulier,
      valid_from: q.lien_date_debut,
      valid_until: q.lien_date_fin,
    }))

    const signature = createHash('sha256').update(JSON.stringify(payload)).digest('hex')

    const { data: existing } = await supabase
      .from('providers')
      .select('id, rge_signature')
      .eq('siret', siret)
      .maybeSingle()

    if (!existing) continue
    if (existing.rge_signature === signature) continue

    await supabase
      .from('providers')
      .update({
        rge_qualifications: payload,
        rge_verified_at: new Date().toISOString(),
        rge_signature: signature,
        rge_source_url: `${ADEME_BASE}/lines?filters={"siret":"${siret}"}`,
      })
      .eq('id', existing.id)
  }
}

async function main() {
  let after: string | undefined
  let total = 0
  const startedAt = Date.now()

  do {
    const page = await fetchPage(after)
    await syncBatch(page.results)
    total += page.results.length
    after = page.next
    await new Promise((r) => setTimeout(r, 120))
  } while (after)

  await supabase.from('sync_logs').insert({
    source: 'ademe_rge',
    rows_processed: total,
    duration_ms: Date.now() - startedAt,
    finished_at: new Date().toISOString(),
  })

  console.log(`[RGE] Synced ${total} rows in ${(Date.now() - startedAt) / 1000}s`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

### 3.6 Stratégie de matching SIRET

- **Clé primaire** : `providers.siret` (14 chiffres, déjà indexé via migration 312)
- **Normalisation** : strip whitespace, validate Luhn checksum avant matching
- **Cas edge** :
  - SIRET en DB mais pas dans ADEME → provider PAS RGE (OK)
  - SIRET dans ADEME mais pas en DB → ignorer (pas créer fantômes)
  - SIRET en DB avec qualifs expirées → masquer automatiquement
  - Multi-qualifs : array JSON sur `providers.rge_qualifications`

## 4. Migration DB Supabase — SQL exact

### 4.1 Migration `370_rge_data_trust_foundation.sql`

```sql
BEGIN;

-- 4.1.1 Extend providers with RGE fields
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS rge_qualifications jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rge_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS rge_signature text,
  ADD COLUMN IF NOT EXISTS rge_source_url text,
  ADD COLUMN IF NOT EXISTS rge_is_active boolean
    GENERATED ALWAYS AS (
      jsonb_array_length(COALESCE(rge_qualifications, '[]'::jsonb)) > 0
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(COALESCE(rge_qualifications,'[]'::jsonb)) q
        WHERE (q->>'valid_until')::date >= CURRENT_DATE
      )
    ) STORED;

COMMENT ON COLUMN providers.rge_qualifications IS
  'Array of RGE qualifications synced from ADEME';
COMMENT ON COLUMN providers.rge_verified_at IS
  'Last successful sync timestamp with ADEME';

-- 4.1.2 Indexes
CREATE INDEX IF NOT EXISTS idx_providers_rge_active
  ON providers (rge_is_active) WHERE rge_is_active = true;
CREATE INDEX IF NOT EXISTS idx_providers_rge_gin
  ON providers USING gin (rge_qualifications);
CREATE INDEX IF NOT EXISTS idx_providers_rge_geo_active
  ON providers USING gist (location)
  WHERE rge_is_active = true AND noindex = false;

-- 4.1.3 Catalog of RGE qualification codes
CREATE TABLE IF NOT EXISTS rge_qualifications_catalog (
  code text PRIMARY KEY,
  label text NOT NULL,
  issuer text NOT NULL,
  meta_domain text,
  domains text[] DEFAULT '{}',
  eligible_maprimerenov text[] DEFAULT '{}',
  eligible_cee text[] DEFAULT '{}',
  description text,
  official_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4.1.4 History of MaPrimeRénov' rates
CREATE TABLE IF NOT EXISTS maprimerenov_rates_history (
  id bigserial PRIMARY KEY,
  valid_from date NOT NULL,
  valid_until date,
  work_slug text NOT NULL,
  work_label text NOT NULL,
  color text NOT NULL CHECK (color IN ('bleu','jaune','violet','rose')),
  amount_eur numeric(10,2) NOT NULL,
  ceiling_eur numeric(10,2),
  requires_rge boolean DEFAULT true,
  requires_mar boolean DEFAULT false,
  parcours text CHECK (parcours IN ('geste','accompagne','both')),
  conditions jsonb DEFAULT '{}'::jsonb,
  source_url text NOT NULL,
  source_pub_date date NOT NULL,
  arrete_jorf text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE (work_slug, color, valid_from)
);

CREATE INDEX idx_mpr_current
  ON maprimerenov_rates_history (work_slug, color)
  WHERE valid_until IS NULL;
CREATE INDEX idx_mpr_history
  ON maprimerenov_rates_history (valid_from DESC, work_slug);

-- 4.1.5 Income thresholds history
CREATE TABLE IF NOT EXISTS maprimerenov_income_thresholds (
  id bigserial PRIMARY KEY,
  valid_from date NOT NULL,
  valid_until date,
  color text NOT NULL CHECK (color IN ('bleu','jaune','violet','rose')),
  household_size smallint NOT NULL CHECK (household_size BETWEEN 1 AND 10),
  zone text NOT NULL CHECK (zone IN ('idf','hors_idf')),
  rfr_max_eur numeric(10,2) NOT NULL,
  rfr_extra_per_person_eur numeric(10,2),
  source_url text NOT NULL,
  arrete_jorf text,
  UNIQUE (color, household_size, zone, valid_from)
);

CREATE INDEX idx_mpr_income_current
  ON maprimerenov_income_thresholds (color, household_size, zone)
  WHERE valid_until IS NULL;

-- 4.1.6 Sync logs
CREATE TABLE IF NOT EXISTS sync_logs (
  id bigserial PRIMARY KEY,
  source text NOT NULL,
  status text DEFAULT 'ok',
  rows_processed int,
  rows_updated int,
  rows_errored int,
  duration_ms int,
  error_message text,
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX idx_sync_logs_source_time ON sync_logs (source, started_at DESC);

-- 4.1.7 RLS policies
ALTER TABLE rge_qualifications_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE maprimerenov_rates_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE maprimerenov_income_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON rge_qualifications_catalog FOR SELECT USING (true);
CREATE POLICY "public_read" ON maprimerenov_rates_history FOR SELECT USING (true);
CREATE POLICY "public_read" ON maprimerenov_income_thresholds FOR SELECT USING (true);

CREATE POLICY "admin_write" ON rge_qualifications_catalog FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "admin_write" ON maprimerenov_rates_history FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "admin_write" ON maprimerenov_income_thresholds FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "admin_read_logs" ON sync_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

COMMIT;
```

### 4.2 Migration `371_seed_rge_catalog.sql`

```sql
INSERT INTO rge_qualifications_catalog (code, label, issuer, meta_domain, domains, eligible_maprimerenov, official_url) VALUES
('8611','Isolation thermique par l''intérieur','Qualibat','Isolation',
  ARRAY['Isolation'], ARRAY['isolation-murs-interieurs','isolation-combles'],
  'https://www.qualibat.com/nomenclature'),
('8612','Isolation thermique par l''extérieur (ITE)','Qualibat','Isolation',
  ARRAY['Isolation'], ARRAY['isolation-exterieure-ite'],
  'https://www.qualibat.com/nomenclature'),
('8621','Chauffage et eau chaude sanitaire','Qualibat','Chauffage',
  ARRAY['Chauffage','ECS'], ARRAY['chaudiere-condensation','pompe-a-chaleur-air-eau'],
  'https://www.qualibat.com/nomenclature'),
('QPAC','QualiPAC - Pompes à chaleur','Qualit''EnR','EnR',
  ARRAY['PAC air-eau','PAC air-air','PAC géothermie'],
  ARRAY['pompe-a-chaleur-air-eau','pompe-a-chaleur-geothermique'],
  'https://www.qualit-enr.org/qualifications/qualipac/'),
('QB','QualiBois - Chauffage bois','Qualit''EnR','EnR',
  ARRAY['Poêle granulés','Poêle bûches','Chaudière biomasse'],
  ARRAY['poele-granules','poele-buches','chaudiere-biomasse'],
  'https://www.qualit-enr.org/'),
('QPV','QualiPV - Photovoltaïque','Qualit''EnR','EnR',
  ARRAY['Solaire PV'], ARRAY['panneaux-photovoltaiques'],
  'https://www.qualit-enr.org/'),
('QSOL','QualiSol - Solaire thermique','Qualit''EnR','EnR',
  ARRAY['Chauffe-eau solaire','Système solaire combiné'],
  ARRAY['chauffe-eau-solaire','systeme-solaire-combine'],
  'https://www.qualit-enr.org/'),
('QFEE','Qualifelec mention RGE','Qualifelec','Électricité',
  ARRAY['Électricité','Chauffage électrique'],
  ARRAY['chauffage-electrique-performant','bornes-irve'],
  'https://www.qualifelec.fr/'),
('ECOA','Eco Artisan (CAPEB)','Qualibat','Global',
  ARRAY['Rénovation globale'], ARRAY['audit-energetique','renovation-ampleur'],
  'https://www.capeb.fr/')
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  issuer = EXCLUDED.issuer,
  eligible_maprimerenov = EXCLUDED.eligible_maprimerenov,
  updated_at = now();
```

## 5. Base de connaissance MaPrimeRénov' 2026

### 5.1 Montants 2026 (par geste)

⚠️ **À re-vérifier manuellement** sur `france-renov.gouv.fr/bareme` avant mise en prod (certains montants varient selon sources tiers).

| Geste                          | Bleu                           | Jaune   | Violet  | Rose | Plafond        |
| ------------------------------ | ------------------------------ | ------- | ------- | ---- | -------------- |
| Pompe à chaleur air/eau        | 5 000 €                        | 4 000 € | 3 000 € | —    | 18 000 €       |
| Pompe à chaleur géothermique   | 11 000 €                       | 9 000 € | 6 000 € | —    | 18 000 €       |
| Chauffe-eau thermodynamique    | 1 200 €                        | 800 €   | 400 €   | —    | 3 500 €        |
| Chauffe-eau solaire individuel | 4 000 €                        | 3 000 € | 2 000 € | —    | 7 000 €        |
| Poêle à granulés               | 2 500 €                        | 2 000 € | 1 500 € | —    | 5 000 €        |
| Poêle à bûches                 | 2 000 €                        | 1 500 € | 800 €   | —    | 4 000 €        |
| Chaudière biomasse             | parcours accompagné uniquement | —       | —       | —    | —              |
| Isolation combles              | 25 €/m²                        | 20 €/m² | 15 €/m² | —    | variable       |
| Isolation murs ITE             | 75 €/m²                        | 60 €/m² | 40 €/m² | —    | variable       |
| Isolation murs ITI             | parcours accompagné            | —       | —       | —    | —              |
| Isolation planchers bas        | 30 €/m²                        | 25 €/m² | 15 €/m² | —    | variable       |
| VMC double flux                | 2 500 €                        | 2 000 € | 1 500 € | —    | 6 000 €        |
| Audit énergétique              | 500 €                          | 400 €   | 300 €   | —    | plafond unique |

⚠️ **Changements 2026** :

- **ITI et chaudière biomasse** : plus en parcours par geste — rénovation d'ampleur uniquement
- **Rose** : accès uniquement au parcours accompagné
- **Taux financement max** : Bleu 90 %, Jaune 75 %, Violet 60 %, Rose 40 %

### 5.2 Parcours accompagné

- **Audit énergétique obligatoire** préalable
- **Mon Accompagnateur Rénov' (MAR)** obligatoire (arrêté 3 février 2026 — plus de seuil 5 000 €)
- **Gain minimum 2 classes DPE**
- **Rendez-vous personnalisé France Rénov'** obligatoire (communiqué 6 fév 2026)
- **Entreprise RGE** pour chaque geste

### 5.3 Calendrier réglementaire critique

| Date             | Événement                                 |
| ---------------- | ----------------------------------------- |
| 1er janvier 2025 | Interdiction location DPE G (métropole)   |
| 1er mars 2026    | Nouveaux contrats MAR (arrêté 3 fév 2026) |
| 1er janvier 2028 | Interdiction location DPE F (métropole)   |
| 1er janvier 2028 | Interdiction location DPE G (DOM)         |
| 1er janvier 2031 | Interdiction location DPE F (DOM)         |
| 1er janvier 2034 | Interdiction location DPE E (métropole)   |

## 6. Positionnement trust vs societe.com

### 6.1 Tableau comparatif

| Signal                             | societe.com | effy.fr | quelleenergie | **SA (cible)** |
| ---------------------------------- | ----------- | ------- | ------------- | -------------- |
| SIREN officiel par page            | ✅          | ⚠️      | ❌            | ✅             |
| Lien outbound INSEE                | ⚠️          | ❌      | ❌            | ✅             |
| RGE vérifié ADEME live             | ❌          | ⚠️      | ⚠️            | ✅             |
| Barèmes aides versionnés           | ❌          | ✅      | ✅            | ✅             |
| Date dernière vérif visible        | ✅          | ⚠️      | ⚠️            | ✅             |
| Schema.org `Certification`         | ❌          | ❌      | ❌            | ✅             |
| Annuaire artisans RGE géolocalisés | ❌          | ✅      | ✅            | ✅             |
| Simulateur aides intégré           | ❌          | ✅      | ✅            | ✅             |
| Lead exclusif (1 lead = 1 artisan) | ❌          | ✅      | ✅            | ✅             |

### 6.2 Fiche artisan — blueprint trust

1. **En-tête identité légale** : SIREN + SIRET + lien `annuaire-entreprises.data.gouv.fr/entreprise/{siren}` + forme juridique + code NAF + date dernière vérif INSEE
2. **Bloc certifications RGE** : liste qualifs actives, codes, validités, organismes + lien ADEME
3. **Bloc aides éligibles** : gestes MaPrimeRénov' couverts + CTA simulateur
4. **Bloc avis vérifiés** : uniquement depuis `reviews.booking_id NOT NULL` + Schema.org
5. **Footer méthodologie** : sources INSEE/ADEME/ANAH + fréquence MAJ

### 6.3 Stratégie anti-AI-Overview

LLM (Google Overviews, Perplexity, ChatGPT) citent en priorité :

- Sites `.gouv.fr`, Wikipedia
- Sites avec `Organization` + `citation` schema propre
- Sites avec URLs sources officielles dans le markup

**Exploitation** : sur chaque page, bloc `<cite>` avec URLs officielles + `Certification.auditDate` + `issuedBy` pour extraction auto LLM.

## 7. Schema.org — implémentation page par page

### 7.1 Page artisan `/artisans/[slug]`

```jsonld
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://servicesartisans.fr/artisans/{slug}#business",
  "name": "{providers.name}",
  "legalName": "{providers.name}",
  "identifier": [
    {"@type":"PropertyValue","propertyID":"SIRET","value":"{siret}"},
    {"@type":"PropertyValue","propertyID":"SIREN","value":"{siret.slice(0,9)}"},
    {"@type":"PropertyValue","propertyID":"NAF","value":"{code_naf}"}
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{address_street}",
    "addressLocality": "{address_city}",
    "postalCode": "{address_postal_code}",
    "addressRegion": "{address_region}",
    "addressCountry": "FR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": {latitude},
    "longitude": {longitude}
  },
  "url": "https://servicesartisans.fr/artisans/{slug}",
  "areaServed": { "@type": "AdministrativeArea", "name": "{department}" },
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "Certification",
      "name": "{qualification.label} - {qualification.certificate}",
      "recognizedBy": { "@type": "Organization", "name": "{qualification.issuer}" },
      "dateCreated": "{qualification.valid_from}",
      "expires": "{qualification.valid_until}",
      "identifier": "{qualification.code}",
      "url": "{rge_source_url}"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{rating_average}",
    "reviewCount": "{review_count}"
  },
  "knowsAbout": ["Rénovation énergétique","Pompe à chaleur","MaPrimeRénov'"]
}
```

### 7.2 Page aide `/renovation-energetique/aides/maprimerenov-2026`

```jsonld
{
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  "name": "MaPrimeRénov'",
  "serviceType": "Aide financière à la rénovation énergétique",
  "provider": {
    "@type": "GovernmentOrganization",
    "name": "Agence nationale de l'habitat (ANAH)",
    "url": "https://www.anah.fr"
  },
  "areaServed": { "@type":"Country", "name":"France" },
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://france-renov.gouv.fr"
  },
  "audience": {
    "@type":"Audience",
    "audienceType":"Propriétaires occupants, bailleurs, copropriétés"
  },
  "isRelatedTo": [
    { "@type": "FinancialProduct", "name": "Éco-PTZ",
      "description": "Prêt à taux zéro jusqu'à 50 000 € sur 20 ans" }
  ]
}
```

### 7.3 Page travaux `/renovation-energetique/travaux/pompe-a-chaleur`

```jsonld
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Installation pompe à chaleur air/eau",
  "serviceType": "Chauffage rénovation énergétique",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "EUR",
    "lowPrice": 8000,
    "highPrice": 18000,
    "offerCount": "{count_artisans_rge}"
  },
  "isRelatedTo": [
    { "@type": "GovernmentService",
      "name": "MaPrimeRénov' pompe à chaleur air/eau",
      "url": "https://servicesartisans.fr/renovation-energetique/aides/maprimerenov-2026" }
  ]
}
```

### 7.4 Review

```jsonld
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": { "@id": "https://servicesartisans.fr/artisans/{slug}#business" },
  "reviewRating": { "@type": "Rating", "ratingValue": "{rating}", "bestRating": "5" },
  "author": { "@type": "Person", "name": "{client_name}" },
  "datePublished": "{created_at}",
  "reviewBody": "{comment}"
}
```

### 7.5 Guide YMYL

```jsonld
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "MaPrimeRénov' 2026 — montants, conditions, démarches",
  "author": {
    "@type": "Person",
    "name": "{author}",
    "jobTitle": "Expert rénovation énergétique",
    "url": "https://servicesartisans.fr/auteurs/{author-slug}"
  },
  "datePublished": "2026-04-18",
  "dateModified": "{last_mpr_rates_update}",
  "publisher": {
    "@type": "Organization",
    "name": "ServicesArtisans",
    "logo": { "@type":"ImageObject","url":"https://servicesartisans.fr/logo.png" }
  },
  "citation": [
    "https://france-renov.gouv.fr/bareme",
    "https://www.anah.fr",
    "https://www.service-public.gouv.fr/particuliers/vosdroits/F35083"
  ]
}
```

## 8. Cron jobs

| Job                      | Planning              | Script                              | Fallback                                     |
| ------------------------ | --------------------- | ----------------------------------- | -------------------------------------------- |
| `sync-rge-ademe`         | Quotidien 04:00 UTC   | `scripts/sync-rge-ademe.ts`         | Retry x3, alert Slack si >5 % erreurs        |
| `validate-sirene`        | Hebdo dim 02:00 UTC   | `scripts/validate-sirene.ts`        | Mark `siren_status='radiated'` si 404        |
| `refresh-mpr-rates`      | Mensuel 1er 06:00 UTC | `scripts/refresh-mpr-rates.ts`      | Crée draft + notification admin              |
| `detect-ghost-providers` | Hebdo dim 03:00 UTC   | `scripts/detect-ghost-providers.ts` | noindex auto si 0 claim + 0 activity 6 mois  |
| `rebuild-sitemap-rge`    | Quotidien 05:00 UTC   | `scripts/sitemap-rge.ts`            | Génère `/sitemap-rge.xml`                    |
| `warn-rge-expiring`      | Hebdo                 | `scripts/warn-rge-expiring.ts`      | Email artisans claim dont qualif expire <60j |

**Exemple GitHub Action** `.github/workflows/sync-rge.yml` :

```yaml
name: sync-rge-ademe
on:
  schedule:
    - cron: '0 4 * * *'
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx tsx scripts/sync-rge-ademe.ts
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: '{"text":"🚨 sync-rge-ademe failed"}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 9. Gouvernance data

### 9.1 Matrice RACI

| Activité                       | Responsable         | Consulté     | Informé          |
| ------------------------------ | ------------------- | ------------ | ---------------- |
| Nouveau barème MaPrimeRénov'   | Admin content       | Dev          | All team         |
| Intégration nouveau dataset    | Lead Dev            | Head of Data | Content          |
| Correction erreur RGE signalée | Admin support       | Dev          | Artisan concerné |
| Processus claim artisan        | Modérateur          | Admin        | Artisan          |
| Détection incohérence SIRET    | Auto (cron) → Admin | Dev          | —                |

### 9.2 Process mise à jour montants aides

1. **Veille mensuelle** : admin content check `france-renov.gouv.fr/bareme` + JORF
2. **Si changement** :
   - Nouvelle ligne dans `maprimerenov_rates_history` avec `valid_from` + `valid_until=NULL`
   - Ancienne ligne : `valid_until = new_valid_from - 1`
   - Lien arrêté JORF obligatoire
3. **Review croisée** : 2e admin valide avant publication
4. **Front** : fonction SQL `get_current_mpr_rate(work_slug, color, date)` retourne ligne active
5. **Audit trail** : `audit_logs` enregistre auteur version

### 9.3 Détection incohérences — vue SQL

```sql
CREATE OR REPLACE VIEW v_data_quality_issues AS
SELECT
  p.id, p.name, p.siret,
  CASE
    WHEN p.siret IS NULL OR length(p.siret) != 14 THEN 'invalid_siret'
    WHEN p.location IS NULL THEN 'missing_geo'
    WHEN p.rge_verified_at < now() - interval '7 days' THEN 'rge_stale'
    WHEN EXISTS (
      SELECT 1 FROM jsonb_array_elements(p.rge_qualifications) q
      WHERE (q->>'valid_until')::date < CURRENT_DATE
    ) AND p.rge_is_active = true THEN 'rge_expired_not_purged'
    WHEN p.is_verified = true AND p.siret IS NULL THEN 'verified_without_siret'
  END as issue
FROM providers p
WHERE issue IS NOT NULL;
```

### 9.4 Règle d'or

> **Ne jamais afficher sur une page publique une donnée dont la source n'est pas traçable ET datée.**

Tout affichage de montant d'aide DOIT contenir :

- Le montant
- La date de validité (`valid_from`)
- Un lien vers la source officielle (`source_url`)
- La date de dernière vérification (`source_pub_date`)

## 10. Conformité RGPD

### 10.1 Nature données artisan

Artisans = majoritairement personnes physiques (auto-entrepreneurs, EI, EIRL). Données personnelles RGPD :

- Nom/prénom dirigeant
- Email personnel/pro
- Téléphone
- Adresse (si domicile)

### 10.2 Bases légales

| Donnée                            | Base légale                            | Source                   |
| --------------------------------- | -------------------------------------- | ------------------------ |
| SIREN/SIRET, NAF, forme juridique | Opendata Etalab + intérêt légitime     | data.gouv.fr             |
| Nom dirigeant                     | Opendata INPI/INSEE + intérêt légitime | data.gouv.fr             |
| Qualifications RGE                | Opendata ADEME + intérêt légitime      | data.ademe.fr            |
| Email/téléphone PRO               | Intérêt légitime + droit opposition    | Collecte directe (claim) |
| Email/téléphone PERSO             | ⚠️ Opt-in explicite requis             | NON publier              |

### 10.3 Règles pages publiques

1. **Artisans non-claim** : uniquement données opendata. **Aucune donnée contact**.
2. **Artisans claim** : artisan choisit via dashboard. Défaut : formulaire de contact.
3. **Droit opposition** : route `/contact-rgpd` → suppression/masquage sous 30 j
4. **Base légale** : mentions légales indiquent base publication par dataset

### 10.4 Spécifique ADEME

- Données ADEME = Etalab open data → réutilisation autorisée
- Si artisan demande suppression RGE : `providers.rge_hidden = true`

### 10.5 DPO

- Pas obligatoire <250 employés mais recommandé à partir de 100k providers actifs

## 11. Roadmap data 12 semaines

### Sprint 0 (semaine 0) — prérequis

- [ ] Fix bailout SSR global
- [ ] Upload disavow file GSC

### Sprint 1 (S1-2) — fondation DB

- [ ] Migration 370 (RGE foundation + tables)
- [ ] Migration 371 (seed catalog RGE)
- [ ] Migration 372 (seed barèmes MaPrimeRénov' 2026) après validation
- [ ] Migration 373 (seed plafonds revenus IDF + hors IDF)
- [ ] Tests RLS + indexes
- [ ] Vue `v_data_quality_issues`

### Sprint 2 (S3-4) — sync ADEME + cron

- [ ] `scripts/sync-rge-ademe.ts` (1ère passe complète)
- [ ] GitHub Action quotidien + Slack
- [ ] Dashboard admin `/admin/sync-status`
- [ ] Test staging 10k providers
- [ ] Déploiement prod + première sync

### Sprint 3 (S5-6) — Schema.org + fiche artisan

- [ ] Refonte `/artisans/[slug]` avec bloc identité + RGE
- [ ] Composant `<TrustBadge>` réutilisable
- [ ] JSON-LD LocalBusiness + Certification
- [ ] Tests Rich Results Google
- [ ] Audit Ahrefs pages mises à jour

### Sprint 4 (S7-8) — pages aides + travaux

- [ ] Hub `/renovation-energetique/` avec GovernmentService
- [ ] Pages travaux avec AggregateOffer dynamique (count RGE)
- [ ] Pages aides × 96 départements
- [ ] Cron `rebuild-sitemap-rge`

### Sprint 5 (S9-10) — longue traîne

- [ ] Pattern `/services/[métier-rge]/[ville]` top 200 villes × 5 métiers = 1 000 pages
- [ ] Internal linking hub ↔ services ↔ simulateur ↔ artisans
- [ ] Validation SIRENE hebdo

### Sprint 6 (S11-12) — amplification

- [ ] Simulateur aides v2 avec pré-remplissage depuis fiche artisan
- [ ] Carte interactive artisans RGE par département
- [ ] Newsletter mensuelle « Barèmes MaPrimeRénov' actualisés »
- [ ] Outreach presse spécialisée : pitch « première plateforme sync RGE + SIREN + MaPrimeRénov' temps réel »
- [ ] Partenariat Mon Accompagnateur Rénov'

### Métriques succès 12 semaines

- 100 % providers SIRET avec `rge_verified_at < 48h`
- 100 % pages artisan avec Schema.org Certification si RGE
- 100 % pages aides avec GovernmentService + citations
- Position `maprimerenov 2026` : pos 26 → top 10
- Position `artisan RGE [ville]` : top 10 sur 50 villes minimum
- DR : 0,6 → 5 (+800 %)
- +200 % trafic segment `/renovation-energetique/*`

## 12. Points d'attention et risques

### 12.1 À valider avant migration

Montants MaPrimeRénov' 2026 (section 5.1) issus d'articles tiers (Hellio, revue-fonciere, Carrefour Énergie, Vasco). **Avant INSERT SQL prod**, croiser avec :

1. `https://france-renov.gouv.fr/bareme` (source primaire)
2. Arrêté JORF 29/12/2025 + arrêté 3 février 2026
3. Fiches service-public.fr (F35083)

### 12.2 Volumétrie ADEME

173 000 labellisations / ~62 000 entreprises. Sync quotidien :

- `data-files` (fichier complet hebdo) pour full resync
- `/lines?filters={"_updatedAt":"after:2026-04-17"}` pour delta
- Index `providers.siret` obligatoire
- SHA-256 signature pour éviter UPDATE inutiles

### 12.3 Cannibalisation SEO

`/renovation-energetique/travaux/pompe-a-chaleur` vs `/services/pompe-a-chaleur/[ville]` :

- Premier : intention informationnelle
- Second : intention transactionnelle
- Canonical + internal linking clairs

### 12.4 RGPD artisans non-claim

`providers.noindex = true` par défaut pour non-claim. **Maintenir stricte**. Publier uniquement opendata.

### 12.5 YMYL

Pages aides = YMYL. Exige :

- Auteur identifié (expert crédible)
- Date MAJ visible
- Disclaimer : « seul france-renov.gouv.fr fait foi »
- Lien sortant systématique source officielle

## Fichiers à créer

- `supabase/migrations/370_rge_data_trust_foundation.sql`
- `supabase/migrations/371_seed_rge_catalog.sql`
- `supabase/migrations/372_seed_mpr_rates_2026.sql`
- `supabase/migrations/373_seed_mpr_income_thresholds.sql`
- `scripts/sync-rge-ademe.ts`
- `scripts/validate-sirene.ts`
- `scripts/refresh-mpr-rates.ts`
- `.github/workflows/sync-rge.yml`
- `src/components/trust/TrustBadge.tsx`
- `src/lib/schemaOrg/*.ts` (generators par type)

## Sources officielles

**APIs et datasets** :

- Liste entreprises RGE — data.ademe.fr/datasets/liste-des-entreprises-rge-2
- API docs ADEME : `/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/api-docs.json`
- API Professionnels RGE — api.gouv.fr
- Certification RGE (API Entreprise DataPass)
- API Recherche Entreprises — data.gouv.fr
- API SIRENE open data
- France Rénov' annuaire RGE

**Réglementation & barèmes** :

- MaPrimeRénov' — service-public.gouv.fr/vosdroits/F35083
- Barèmes — france-renov.gouv.fr/bareme
- Mon Accompagnateur Rénov' — ecologie.gouv.fr
- Éco-PTZ — service-public.gouv.fr/vosdroits/F19905
- Calendrier passoires thermiques — service-public.gouv.fr/actualites/A17975
- CEE — service-public.gouv.fr/vosdroits/F35584
- Arrêté 3 février 2026 MAR

**Qualifications RGE** :

- Nomenclature Qualibat — qualibat.com/nomenclature
- QualiPAC — qualit-enr.org/qualifications/qualipac
- Quelles qualifs pour quels travaux — qualit-enr.org ADEME PDF

**Schema.org** :

- schema.org/Certification
- schema.org/LocalBusiness
- schema.org/GovernmentService
- schema.org/FinancialProduct
