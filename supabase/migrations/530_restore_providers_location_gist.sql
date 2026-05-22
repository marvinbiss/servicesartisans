-- =============================================================================
-- Migration 530 — Restaure idx_providers_location_gist (dropped en 419)
-- =============================================================================
--
-- Contexte
-- --------
-- Mig 419 (`drop_unused_indexes`) a dropé `idx_providers_location_gist`
-- (justifié à l'époque : "0 scans since stats reset"). Depuis :
--   - Mig 498 (dispatch RGE-aware) : ST_DWithin(p.location, point) — fonctionne
--     sans GiST mais seq scan ~970K (latence variable selon trafic).
--   - Mig 527 (`get_communes_sitemap_hybrid`) : CROSS JOIN LATERAL avec
--     ST_DWithin(p.location, c.geo, 20000) sur ~49K RGE valides × ~36K communes.
--     Sans index GiST côté providers.location, le planner choisit un seq scan
--     répété → timeout potentiel sur le build sitemap (cron quotidien).
--
-- Cette migration recrée l'index, idempotent. Partial GiST sur (is_active,
-- noindex=false, rge_valid_until > today, location IS NOT NULL) pour réduire
-- la taille (~49K rows post-pivot RGE 2026-05-03 vs ~970K full).
--
-- ROLLBACK : DROP INDEX IF EXISTS public.idx_providers_location_gist;
-- =============================================================================

-- IMPORTANT : pas de BEGIN/COMMIT — CREATE INDEX CONCURRENTLY ne peut pas
-- tourner en transaction. Le runner Supabase psql tolère le -1 implicite ;
-- on émet IF NOT EXISTS pour idempotence.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_providers_location_gist
  ON public.providers
  USING GIST (location)
  WHERE is_active = true
    AND noindex = false
    AND location IS NOT NULL;

COMMENT ON INDEX public.idx_providers_location_gist IS
  'Restauré 2026-05-22 (dropped mig 419). Requis par mig 527 RPC '
  'get_communes_sitemap_hybrid (ST_DWithin sur location). Partial : actifs '
  'non-noindex avec geo connu (~49K rows post-pivot RGE).';
