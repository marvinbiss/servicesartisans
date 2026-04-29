# Migration 483 — Runbook déploiement

## Pré-requis

- Migration 482 appliquée
- Variable env `GOOGLE_PLACES_API_KEY` provisionnée côté serveur (pas de prefix `NEXT_PUBLIC_*`)
- Restriction Google Cloud Console : limiter la clé Places API à l'IP du serveur de backfill (defense in depth — audit security 2026-04-29)

## Application

```sql
-- Via Supabase SQL editor (dashboard) :
\i supabase/migrations/483_providers_google_places.sql
```

## Smoke tests post-déploiement (3 assertions OBLIGATOIRES)

À exécuter dans le SQL editor immédiatement après la migration.
Chaque bloc doit être exécuté en transaction et rollback à la fin.

### 1. CHECK rating_range (0–5)

```sql
BEGIN;
-- Doit lever : new row violates check constraint "providers_google_rating_range"
INSERT INTO public.providers (id, name, slug, google_rating)
VALUES (gen_random_uuid(), 'smoke_test_rating', 'smoke-rating', 6.0);
ROLLBACK;
```

Attendu : `ERROR:  new row for relation "providers" violates check constraint "providers_google_rating_range"`

### 2. CHECK sync_status enum

```sql
BEGIN;
-- Doit passer (valeur dans l'enum)
INSERT INTO public.providers (id, name, slug, google_sync_status)
VALUES (gen_random_uuid(), 'smoke_test_sync', 'smoke-sync', 'collision');
-- Doit lever
INSERT INTO public.providers (id, name, slug, google_sync_status)
VALUES (gen_random_uuid(), 'smoke_test_sync2', 'smoke-sync2', 'invalid_status');
ROLLBACK;
```

Attendu : 1ère ligne OK, 2ème lève `violates check constraint "providers_google_sync_status_enum"`

### 3. CHECK place_id format + index unique partial

```sql
BEGIN;
-- Doit lever (caractères spéciaux non autorisés)
INSERT INTO public.providers (id, name, slug, google_place_id)
VALUES (gen_random_uuid(), 'smoke_test_format', 'smoke-format', 'invalid place id with spaces');

-- Doit passer
INSERT INTO public.providers (id, name, slug, google_place_id)
VALUES (gen_random_uuid(), 'smoke_test_a', 'smoke-place-a', 'ChIJ_test_A');

-- Doit lever (collision unique)
INSERT INTO public.providers (id, name, slug, google_place_id)
VALUES (gen_random_uuid(), 'smoke_test_b', 'smoke-place-b', 'ChIJ_test_A');
ROLLBACK;
```

Attendu :

- 1ère ligne : `violates check constraint "providers_google_place_id_format"`
- 2ème : OK
- 3ème : `duplicate key value violates unique constraint "providers_google_place_id_uniq"`

## Rollback

Si une smoke test échoue, lancer le rollback (la migration est idempotente, mais
les colonnes ajoutées ne peuvent plus être DROP si déjà sync) :

```sql
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_google_place_id_format;
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_google_sync_status_enum;
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_google_business_status_enum;
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_google_user_ratings_total_nonneg;
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_google_rating_range;
DROP INDEX IF EXISTS providers_google_rating_present_idx;
DROP INDEX IF EXISTS providers_google_synced_at_pending_idx;
DROP INDEX IF EXISTS providers_google_place_id_uniq;
ALTER TABLE public.providers
  DROP COLUMN IF EXISTS google_sync_status,
  DROP COLUMN IF EXISTS google_synced_at,
  DROP COLUMN IF EXISTS google_business_status,
  DROP COLUMN IF EXISTS google_user_ratings_total,
  DROP COLUMN IF EXISTS google_rating,
  DROP COLUMN IF EXISTS google_place_id;
```

## Backfill — premier run (pilot 50 providers)

Après les smoke tests OK :

```bash
# Dry-run (aucun write DB, juste log)
GOOGLE_PLACES_API_KEY=xxx npx tsx scripts/backfill-google-places.ts --limit=50

# Apply après validation visuelle des logs
GOOGLE_PLACES_API_KEY=xxx npx tsx scripts/backfill-google-places.ts --apply --limit=50

# Vérification DB
SELECT google_sync_status, count(*) FROM public.providers
  WHERE google_synced_at IS NOT NULL
  GROUP BY google_sync_status
  ORDER BY 2 DESC;
```

Si le ratio `matched` est ≥60% (sur SIRET valides), scale-up à 500 puis 5000 puis
49K avec --throttle=200ms (5 req/s, sous la limite Places 100 QPM).

## Coût estimé

- Cold start : 49K SIRET × 0.017 € = **833 €** (one-shot)
- Re-sync incrémental mensuel (--status=stale, ~10K à reprendre) : ~70 €/mois
- Cron à wirer plus tard (Phase 2) : daily incremental sur les `pending` + monthly stale.
