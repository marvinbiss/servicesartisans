-- =============================================================================
-- Migration 499 — Devis source attribution (Action #5 LP Effy-style 2026-05-03)
-- =============================================================================
--
-- Ajoute une colonne `source` à `devis_requests` pour tracker l'origine du lead
-- au-delà du canal Pipedrive existant (qui ne distingue que servicesartisans.fr
-- vs simulateur-aides vs callback-simulateur via le custom field source ID).
--
-- Pourquoi ? Les nouvelles landing pages /lp/[campaign] (Action #5 plan
-- domination Ahrefs Phase 0) doivent être attribuables individuellement :
--   - lp_aides-pac
--   - lp_prime-cee
--   - lp_isolation-aides
--   - lp_audit-energetique
--
-- Permet : reporting CTR par campaign, ROI par mot-clé Google Ads, attribution
-- multi-touch dans Pipedrive (custom field `source` reçoit la valeur full
-- `lp_${campaign}` au lieu du défaut `servicesartisans.fr`).
--
-- Idempotent (ADD COLUMN IF NOT EXISTS). Aucun back-fill nécessaire — les
-- leads historiques restent à NULL et fallback sur 'servicesartisans.fr'
-- côté code (cf. src/lib/integrations/pipedrive.ts).
-- =============================================================================

BEGIN;

ALTER TABLE public.devis_requests
  ADD COLUMN IF NOT EXISTS source TEXT;

COMMENT ON COLUMN public.devis_requests.source IS
  'Origine du lead pour attribution Pipedrive et reporting. NULL = défaut servicesartisans.fr. Convention LP : lp_<campaign> (ex lp_aides-pac). Mig 499 — Action #5 Ahrefs 2026-05-03.';

-- Index partiel pour reporting (la majorité des leads = NULL = défaut, on ne
-- veut pas les indexer). Permet COUNT(*) WHERE source LIKE 'lp_%' rapide.
CREATE INDEX IF NOT EXISTS idx_devis_requests_source_lp
  ON public.devis_requests (source)
  WHERE source IS NOT NULL;

COMMIT;

-- =============================================================================
-- Rollback :
--
--   BEGIN;
--   DROP INDEX IF EXISTS public.idx_devis_requests_source_lp;
--   ALTER TABLE public.devis_requests DROP COLUMN IF EXISTS source;
--   COMMIT;
--
-- → Aucune perte de données critique : la colonne sert uniquement au reporting
--   et au custom field Pipedrive qui retombe sur 'servicesartisans.fr' par
--   défaut côté code.
-- =============================================================================
