-- Rollback Migration 501 — restaure les RPC sitemap pré-pivot full RGE.
-- À exécuter uniquement si le pivot full RGE 2026-05-05 doit être annulé.

CREATE OR REPLACE FUNCTION get_provider_sitemap_v2(p_offset INTEGER, p_limit INTEGER)
RETURNS TABLE (id UUID, name TEXT, slug TEXT, stable_id TEXT, specialty TEXT, address_city TEXT, updated_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SET search_path = public, pg_catalog
AS 'SELECT id, name, slug, stable_id, specialty, address_city, updated_at FROM providers WHERE is_active = true AND noindex = false AND description IS NOT NULL AND length(description) >= 200 ORDER BY updated_at DESC, id DESC OFFSET p_offset LIMIT p_limit';

CREATE OR REPLACE FUNCTION get_provider_sitemap(p_offset INTEGER, p_limit INTEGER)
RETURNS TABLE (id UUID, name TEXT, slug TEXT, stable_id TEXT, specialty TEXT, address_city TEXT, updated_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SET search_path = public, pg_catalog
AS 'SELECT id, name, slug, stable_id, specialty, address_city, updated_at FROM providers WHERE is_active = true AND noindex = false ORDER BY updated_at DESC, id DESC OFFSET p_offset LIMIT p_limit';

DROP INDEX IF EXISTS idx_providers_sitemap_v2;
CREATE INDEX IF NOT EXISTS idx_providers_sitemap_v2
  ON providers (updated_at DESC, id DESC)
  WHERE is_active = true
    AND noindex = false
    AND description IS NOT NULL
    AND length(description) >= 200;

DROP INDEX IF EXISTS idx_providers_sitemap;
CREATE INDEX IF NOT EXISTS idx_providers_sitemap
  ON providers (updated_at DESC, id DESC)
  WHERE is_active = true AND noindex = false;
