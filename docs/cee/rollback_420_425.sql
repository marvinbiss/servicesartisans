-- ============================================================================
-- ROLLBACK — Migrations 420 → 425 (ordre inverse)
-- Emplacement : supabase/migrations/rollback/420-425.sql
-- ⚠️  Destructif : supprime cee_leads, cee_mandats et données associées.
-- ============================================================================
BEGIN;

-- 425 — Observabilité
DROP MATERIALIZED VIEW IF EXISTS public.v_cee_leads_daily_stats;
DROP MATERIALIZED VIEW IF EXISTS public.v_cee_funnel_conversion;
DROP TABLE IF EXISTS public.email_outbox_cee;
DROP TABLE IF EXISTS public.cee_simulator_events;

-- 424 — Leads & mandats
ALTER TABLE public.devis DROP CONSTRAINT IF EXISTS devis_cee_lead_id_fkey;
DROP TABLE IF EXISTS public.cee_mandats;
DROP TABLE IF EXISTS public.cee_leads;

-- 423 — Providers MAR
DROP TABLE IF EXISTS public.mar_staging;
ALTER TABLE public.providers
  DROP COLUMN IF EXISTS mar_qualifications,
  DROP COLUMN IF EXISTS mar_revoked_at,
  DROP COLUMN IF EXISTS mar_imported_at,
  DROP COLUMN IF EXISTS mar_last_seen_at,
  DROP COLUMN IF EXISTS mar_source_id,
  DROP COLUMN IF EXISTS is_mar_agree;
DROP INDEX IF EXISTS public.idx_providers_siren;
DROP INDEX IF EXISTS public.idx_providers_mar_agree;

-- 422 — Devis CEE
ALTER TABLE public.devis
  DROP CONSTRAINT IF EXISTS devis_cee_operation_code_fmt_chk,
  DROP CONSTRAINT IF EXISTS devis_cee_forfait_id_fkey,
  DROP CONSTRAINT IF EXISTS devis_cee_operation_code_fkey;
ALTER TABLE public.devis
  DROP COLUMN IF EXISTS cee_detector_version,
  DROP COLUMN IF EXISTS cee_detected_at,
  DROP COLUMN IF EXISTS cee_lead_id,
  DROP COLUMN IF EXISTS cee_prime_version,
  DROP COLUMN IF EXISTS cee_prime_estimee_cts,
  DROP COLUMN IF EXISTS cee_forfait_id,
  DROP COLUMN IF EXISTS cee_operation_code,
  DROP COLUMN IF EXISTS cee_eligible;

-- 421 — ENUMs
DROP TYPE IF EXISTS public.zone_climatique;
DROP TYPE IF EXISTS public.categorie_revenus;
DROP TYPE IF EXISTS public.cee_lead_status;

-- 420 — Référentiels
DROP TABLE IF EXISTS public.zones_climatiques_ref;
DROP TABLE IF EXISTS public.revenus_plafonds;
DROP TABLE IF EXISTS public.cee_spot_prices;
DROP TABLE IF EXISTS public.cee_forfaits;
DROP TABLE IF EXISTS public.cee_operations_ref;

COMMIT;
