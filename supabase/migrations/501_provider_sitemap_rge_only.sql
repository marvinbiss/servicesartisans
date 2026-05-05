-- =============================================================================
-- Migration 501 — Pivot full RGE 2026-05-05 : sitemap providers RGE-only
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Le pivot full RGE 2026-05-05 a aligné tous les helpers Supabase
-- (getProvidersByService, getProvidersByLocation, etc.) sur un default
-- `rgeOnly: true`. La cascade noindex-sweep flippe `noindex=true` sur les
-- non-RGE non-claimed chaque nuit, ce qui exclut indirectement la majorité
-- des non-RGE des sitemaps. **MAIS** :
--
--   - Les artisans NON-RGE CLAIMED (`claimed_at IS NOT NULL`) restent
--     `noindex=false` (recovery phase 2 du sweep) → ils émergent toujours
--     dans `get_provider_sitemap` / `get_provider_sitemap_v2` qui filtrent
--     uniquement `is_active=true AND noindex=false`.
--   - Conséquence : le sitemap public émet des fiches non-RGE, contradictoire
--     avec le repositionnement "100% RGE certifiés" et amène Google à crawler
--     des pages sans la USP du pivot (CTR -, ranking dilué).
--
-- DECISION
-- --------
-- Ajouter le filtre RGE explicite dans les 2 RPC sitemap (v1 + v2) :
--   `rge_qualifications IS NOT NULL AND rge_valid_until >= CURRENT_DATE`
--
-- Effet attendu :
--   * Sitemap reste à ~35-40K URLs (description ≥ 200 chars filtre v2 dominant
--     car les pages avec description E-E-A-T sont ~100% RGE).
--   * Artisans claimed non-RGE retirés (poignée d'occurrences — non-impact UX
--     car ces fiches restent accessibles depuis l'espace artisan / lien
--     direct, juste non-promues côté SEO).
--   * Cohérence stricte avec le repositionnement public.
--
-- INDEX
-- -----
-- L'index partiel `idx_providers_sitemap_v2` actuel ne contient pas le filtre
-- RGE → on le drop + recrée avec le filtre. Le partial index `idx_providers_sitemap`
-- v1 reste utilisé en fallback runtime mais drop-recrée idem.
--
-- ROLLBACK
-- --------
-- `rollback/501_provider_sitemap_rge_only_rollback.sql` restaure les RPC
-- pré-pivot (sans filtre RGE).

-- ============================================================================
-- 1. RPC v2 (quality + RGE filter)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_provider_sitemap_v2(p_offset INTEGER, p_limit INTEGER)
RETURNS TABLE (id UUID, name TEXT, slug TEXT, stable_id TEXT, specialty TEXT, address_city TEXT, updated_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT id, name, slug, stable_id, specialty, address_city, updated_at
  FROM providers
  WHERE is_active = true
    AND noindex = false
    AND description IS NOT NULL
    AND length(description) >= 200
    AND rge_qualifications IS NOT NULL
    AND rge_valid_until >= CURRENT_DATE
  ORDER BY updated_at DESC, id DESC
  OFFSET p_offset
  LIMIT p_limit
$$;

GRANT EXECUTE ON FUNCTION get_provider_sitemap_v2(INTEGER, INTEGER) TO service_role;

COMMENT ON FUNCTION get_provider_sitemap_v2(INTEGER, INTEGER) IS
  'V3 #4 + pivot full RGE 2026-05-05 — quality filter (description >= 200 chars) + RGE actif (rge_qualifications NOT NULL AND rge_valid_until >= today). Cible top 35K fiches RGE E-E-A-T. Migration 501.';

-- ============================================================================
-- 2. RPC v1 (fallback — RGE filter only)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_provider_sitemap(p_offset INTEGER, p_limit INTEGER)
RETURNS TABLE (id UUID, name TEXT, slug TEXT, stable_id TEXT, specialty TEXT, address_city TEXT, updated_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT id, name, slug, stable_id, specialty, address_city, updated_at
  FROM providers
  WHERE is_active = true
    AND noindex = false
    AND rge_qualifications IS NOT NULL
    AND rge_valid_until >= CURRENT_DATE
  ORDER BY updated_at DESC, id DESC
  OFFSET p_offset
  LIMIT p_limit
$$;

GRANT EXECUTE ON FUNCTION get_provider_sitemap(INTEGER, INTEGER) TO service_role;

COMMENT ON FUNCTION get_provider_sitemap(INTEGER, INTEGER) IS
  'Atomic provider sitemap shard. Pivot full RGE 2026-05-05 — filtre RGE actif (rge_qualifications NOT NULL AND rge_valid_until >= today). Single round-trip, zero race condition. Migration 501.';

-- ============================================================================
-- 3. INDEX partiels — drop + recreate avec filtre RGE
-- ============================================================================
-- Note : CURRENT_DATE n'est PAS immutable côté Postgres → on ne peut PAS
-- l'inclure dans le predicate WHERE d'un index partiel. On garde donc le
-- predicate sans la coupe temporelle ; la query au runtime continue de filtrer.
-- Le partial index reste très sélectif (~50K rows RGE-NOT-NULL vs 750K total).

DROP INDEX IF EXISTS idx_providers_sitemap_v2;
CREATE INDEX IF NOT EXISTS idx_providers_sitemap_v2
  ON providers (updated_at DESC, id DESC)
  WHERE is_active = true
    AND noindex = false
    AND description IS NOT NULL
    AND length(description) >= 200
    AND rge_qualifications IS NOT NULL;

COMMENT ON INDEX idx_providers_sitemap_v2 IS
  'Partial index pour get_provider_sitemap_v2. ~30-35K rows RGE qualifiés (vs ~50K v1). Migration 501.';

DROP INDEX IF EXISTS idx_providers_sitemap;
CREATE INDEX IF NOT EXISTS idx_providers_sitemap
  ON providers (updated_at DESC, id DESC)
  WHERE is_active = true
    AND noindex = false
    AND rge_qualifications IS NOT NULL;

COMMENT ON INDEX idx_providers_sitemap IS
  'Partial index pour get_provider_sitemap (fallback v1). RGE actif uniquement. Migration 501.';
