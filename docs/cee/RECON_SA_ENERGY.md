# RECON_SA_ENERGY — Option C Plan V3 Artisan-First CEE

**Date** : 2026-04-14
**Auteur** : recon@sa-energy-cee (ralph-researcher)
**Scope** : reconnaissance obligatoire §3 du plan avant PR1 DDL

---

## 1. Collision numéros migrations

**Migrations 420-423 déjà utilisées** (toutes datées 2026-04-12, audit archi) :

| # | Fichier | Rôle |
|---|---|---|
| 420 | `420_cee_market_prices.sql` | Table `cee_market_prices` (cours classique/précarité, admin-editable) |
| 421 | `421_reviews_provider_composite_indexes.sql` | Index composite `reviews(provider_id, status, created_at DESC)` + `idx_providers_dept_specialty_active` |
| 422 | `422_rpc_get_providers_by_dept.sql` | RPC `get_providers_by_dept(specialty_slugs, department, limit)` |
| 423 | `423_review_stats_by_dept.sql` | Materialized view `review_stats_by_dept` (specialty × department) |

**Migrations 424-431 libres** — vérifié : aucun fichier.

### Table de mapping renumérotation proposée

| DDL actuel | Nouveau # | Rôle |
|---|---|---|
| 420 (cee_referentiels_temporels) | **424** | `cee_operations_ref`, `cee_forfaits`, `cee_spot_prices`, `revenus_plafonds`, `zones_climatiques_ref` |
| 421 (cee_enums) | **425** | ENUMs `cee_lead_status`, `categorie_revenus`, `zone_climatique` |
| 422 (devis_extensions_cee) | **426** | Colonnes `cee_*` sur `devis_requests` (⚠️ pas `devis`) |
| 423 (providers_mar_extensions) | **427** | Colonnes MAR + table `mar_staging` |
| 424 (cee_leads_mandats) | **428** | `cee_leads` + `cee_mandats` |
| 425 (observability_outbox) | **429** | `cee_simulator_events`, `email_outbox_cee`, MVs |
| Nouvelles V3 | **430-432** | `cee_artisan_partners`, `cee_dossiers`+documents+events, `cee_commissions` |

**⚠️ Conflit potentiel** : 420 existant crée `cee_market_prices`. DDL nouveau crée `cee_spot_prices`. Décision user requise.

---

## 2. TAM artisans activables — Requêtes SQL

**⚠️ Colonne réelle = `rge_qualifications` jsonb (migration 380), PAS `qualifications`.**

Structure : `[{code, nom, organisme, domaine, date_debut, date_fin}, ...]`.

Requête UNION ALL copy-paste ready (Supabase SQL editor) :

```sql
WITH base AS (
  SELECT rge_qualifications
  FROM providers
  WHERE is_active = true
    AND email IS NOT NULL
    AND is_rge = true
    AND rge_qualifications IS NOT NULL
)
SELECT 'QualiPAC' AS qualification,
       count(*) FILTER (WHERE rge_qualifications @> '[{"code":"QualiPAC"}]'::jsonb) AS nb
FROM base
UNION ALL
SELECT 'Qualibat',
       count(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements(rge_qualifications) q
         WHERE q->>'code' ILIKE 'Qualibat%'))
FROM base
UNION ALL
SELECT 'QualiBois',
       count(*) FILTER (WHERE rge_qualifications @> '[{"code":"QualiBois"}]'::jsonb)
FROM base
UNION ALL
SELECT 'Qualit-EnR',
       count(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements(rge_qualifications) q
         WHERE q->>'code' ILIKE 'Qualit%EnR%' OR q->>'code' ILIKE 'QualiSol%' OR q->>'code' ILIKE 'QualiPV%'))
FROM base
UNION ALL
SELECT 'Qualifelec',
       count(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements(rge_qualifications) q
         WHERE q->>'code' ILIKE 'Qualifelec%'))
FROM base;
```

**Validation préalable** (codes RGE distincts) :
```sql
SELECT DISTINCT q->>'code' AS code, count(*)
FROM providers, jsonb_array_elements(rge_qualifications) q
WHERE is_active = true AND is_rge = true
GROUP BY q->>'code' ORDER BY count(*) DESC LIMIT 50;
```

---

## 3. Schéma actuel

### `providers` (colonnes vivantes)

| Colonne | Type | Source |
|---|---|---|
| id, name, slug, email, phone, siret, siren | text/uuid | 001, 108 |
| is_active, is_verified, is_rge | bool | base + 380 |
| stable_id, noindex | text/bool | 100, 315 |
| address_city, address_region, address_department | text | 009, 100 |
| user_id, claimed_at, claimed_by | uuid/tz | 342 |
| specialty, intervention_zone | text | 015 |
| latitude, longitude, location | numeric/geo | 010, 015 |
| code_naf, libelle_naf, is_artisan, source_api | text/bool | 108 |
| rge_qualifications | jsonb | 380 |
| avatar_url, bio, opening_hours, service_prices, faq, services_offered | jsonb/text | 306, 326 |
| intervention_radius_km, accepts_new_clients, free_quote, phone_secondary, available_24h, team_size | int/bool/text | 306 |
| data_quality_score, data_quality_flags, derniere_maj_api | int/jsonb/tz | 108 |
| search_vector | tsvector | 015 |

**Colonnes MAR** : **AUCUNE** présente. DDL 427 les ajoute from scratch.

### `devis_requests` (⚠️ nom réel — PAS `devis`)

Source : `100_v2_schema_cleanup.sql:279`.

| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| client_id | uuid FK profiles | |
| service_id, service_name | uuid/text | |
| postal_code, city | text | |
| description, budget | text | |
| urgency | text check | normal/urgent/tres_urgent |
| status | text check | pending/sent/accepted/refused/completed |
| client_name, client_email, client_phone | text | |
| created_at, updated_at | tz | |
| pipedrive_person_id, pipedrive_deal_id, pipedrive_synced_at | bigint/tz | 377 |
| pipedrive_sync_attempts, pipedrive_next_retry_at, pipedrive_dead_letter_at | int/tz | 412 |

**Colonnes CEE sur `devis_requests`** : **AUCUNE**. Migration `408_devis_cee_dossier_link.sql` lie au dossier, pas les colonnes `cee_*` du DDL §422.

**⚠️ ACTION** : DDL `422_devis_extensions_cee.sql` référence `public.devis` → renommer `public.devis_requests`.

### `profiles`

| Colonne | Type |
|---|---|
| id, email, full_name, phone_e164 | uuid/text |
| is_admin, role | bool/text |
| user_type | text check('client','artisan') |
| average_rating, review_count | numeric/int |
| created_at, updated_at | tz |

---

## 4. Helpers existants

| Fichier | Pattern | Description |
|---|---|---|
| `src/lib/integrations/pipedrive.ts` | pipedrive DLQ | Fire-and-forget sync Person+Deal, backoff 30s→2h, MAX 5 |
| `src/app/api/cron/pipedrive-retry/route.ts` | cron retry | Rejoue leads échus non dead-lettered |
| `supabase/migrations/412_pipedrive_dlq_backoff.sql` | DLQ pattern | **Template direct pour `email_outbox_cee`** |
| `src/lib/supabase/admin.ts` | `createAdminClient()` | Bypass RLS service_role |
| `src/lib/supabase/server.ts` | `createClient()` | Respect RLS (cookies) |
| `src/lib/notifications/email.ts:464` | `sendEmail()` | Transport unifié — **Resend selon env, pas Brevo dédié** |
| `src/lib/cee/emails.ts` | templates CEE | Existants |
| `src/lib/cee/relance-emails.ts` | CEE relance | Campagnes relance |
| `src/lib/cee/dispatcher.ts` + `dispatcher-integration.ts` | dispatch CEE | Routing artisan pour dossiers |
| `src/lib/cee/dossiers.ts` | CRUD cee_dossiers | Data layer, fail-open list/get |
| `src/lib/cee/qualify.ts` | qualif RGE→CEE | Match rge_qualifications ↔ fiches CEE |
| `src/lib/cee/rge-filter.ts` | filtre RGE | Par fiche |
| `src/lib/cee/scoring.ts` | priority scoring | |
| `src/lib/cee/market-prices.ts` | prix marché | ⚠️ duplique `cee_spot_prices` du DDL |
| `src/lib/cee/climate-zones.ts` | zones H1/H2/H3 | ⚠️ duplique `zones_climatiques_ref` du DDL 424 ? |
| `src/lib/cee/catalogue.ts` | catalogue opérations | Référentiel fiches BAR-* |
| `src/lib/cee/delegataires.ts` | CRUD delegataires | Migrations 386-388 |
| `src/lib/cee/artisan-notification.ts` | notif artisan | |
| `supabase/migrations/102_v2_functions_triggers.sql:17` | `set_updated_at()` | Trigger générique OK |
| `src/app/api/cron/rge-sync/route.ts` + migration 380/413 | ADEME sync | Pipeline atomic swap, 60k SIRET, cron hebdo |
| `supabase/migrations/409_cron_leases.sql` | cron leases | Verrou exclusif crons concurrents |
| `src/lib/stripe/server.ts` + `stripe-admin.ts` | Stripe | `stripe@14.25.0`, **Connect NON configuré** |
| `src/lib/webhook-idempotency.ts` | webhook idempotency | Table `webhook_events` |
| `src/lib/monitoring/sentry.ts` | `captureError` | Observability |

---

## 5. Espace artisan existant

Racine : `src/app/(private)/espace-artisan/`

### Routes existantes

| Route | Fichier |
|---|---|
| `/espace-artisan` | `page.tsx` |
| `/espace-artisan/dashboard` | |
| `/espace-artisan/profil` | |
| `/espace-artisan/leads` + `/leads/[id]` + `/leads/statistiques` | |
| `/espace-artisan/demandes` + `/demandes-recues` | devis |
| `/espace-artisan/messages`, `/calendrier`, `/avis`, `/portfolio` | |
| `/espace-artisan/equipe`, `/statistiques`, `/parametres`, `/abonnement` | |
| **`/espace-artisan/cee`** | ✅ **EXISTE** — listing dossiers + `[dossierId]` |
| `/espace-artisan/layout.tsx` | Layout partagé |

### Composants réutilisables

- `components/artisan-dashboard/ArtisanSidebar.tsx`
- `ProfileCompleteness.tsx`, `Calendar.tsx`, `AvailabilityManager.tsx`
- `OpeningHoursEditor.tsx`, `InterventionZoneEditor.tsx`
- `components/artisan-dashboard/profil/*.tsx` (11 sections)
- `components/cee-artisan/DossierListCard.tsx`, `PriorityBadge.tsx`

**Impact** : `/cee` existe déjà — à **étendre** pour V3 (`/cee/nouveau`, `/cee/convention`, `/cee/formation`, `/cee/commissions`), pas ex-nihilo.

---

## 6. DocuSign / Stripe / signing

| Système | Status |
|---|---|
| **DocuSign** | ❌ **ABSENT** — 0 match. `cee_mandats.docusign_envelope_id` du DDL → à prévoir from scratch |
| **Yousign / Universign / eSign** | ❌ ABSENT |
| **Stripe** | ✅ `stripe@14.25.0`. Utilisé abonnements/paiements |
| **Stripe Connect** | ❌ **NON configuré** (0 match `accounts.create`, `express_account`) |
| **SEPA batch** | ❌ ABSENT |

---

## TL;DR actions avant migration

1. **Renuméroter** DDL 420→424, 421→425, 422→426, 423→427, 424→428, 425→429
2. **Corriger** `public.devis` → `public.devis_requests` dans DDL (nouveau 426)
3. **Vérifier** `qualifications` → `rge_qualifications` partout
4. **Décider** unification `cee_market_prices` (existant 420) ↔ `cee_spot_prices` (DDL nouveau)
5. **Décider** unification helpers `src/lib/cee/climate-zones.ts` ↔ table `zones_climatiques_ref`
6. **Prévoir** intégration DocuSign (absent) + Stripe Connect (non configuré)
7. **Exécuter** la query TAM §2 pour dimensionner la cible artisan
