-- Migration 485 — RGE quality filter for sitemap providers (V3 #4 stratégie 140K).
--
-- Why:
--   Audit 2026-04-29 : sitemap actuel émet 50 257 fiches RGE (is_active + noindex=false)
--   mais ~30% n'ont pas encore de description E-E-A-T publiée (description NULL ou
--   < 200 chars). Ces fiches "thin" diluent le crawl budget Google et tirent le
--   ratio d'indexation vers le bas.
--
--   Cible V3 #4 = top 35K fiches qualité (descriptions publiées rubric ≥7.5
--   via pipeline `provider_descriptions_draft` migration 458).
--
-- Stratégie :
--   * Nouveau RPC `get_provider_sitemap_v2` avec filtre quality :
--     `description IS NOT NULL AND length(description) >= 200`
--   * 200 chars = seuil pragmatique sous lequel la fiche est considérée
--     comme template-thin (les descriptions E-E-A-T cibles ~250 mots = ~1500 chars).
--   * Index partiel dédié pour O(log n) pickup, indépendant de l'index v1.
--   * v1 conservé pour fallback runtime si v2 absent (rolling deploy safe).
--
-- Effet attendu :
--   * Sitemap providers : 50 257 → ~35-40K URLs (-25 à -30%)
--   * Crawl budget concentré sur fiches qualité (E-E-A-T validé)
--   * Ratio d'indexation Google amélioré (quality signal global)
--
-- Application :
--   Marvin → Supabase SQL editor → split en 2 statements (CREATE FUNCTION puis
--   CREATE INDEX) car SQL editor ne tolère pas multi-statements avec CREATE.
--   Exécuter en heures creuses (CREATE INDEX scan complet de la table providers).

CREATE OR REPLACE FUNCTION get_provider_sitemap_v2(p_offset INTEGER, p_limit INTEGER)
RETURNS TABLE (id UUID, name TEXT, slug TEXT, stable_id TEXT, specialty TEXT, address_city TEXT, updated_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SET search_path = public, pg_catalog
AS 'SELECT id, name, slug, stable_id, specialty, address_city, updated_at FROM providers WHERE is_active = true AND noindex = false AND description IS NOT NULL AND length(description) >= 200 ORDER BY updated_at DESC, id DESC OFFSET p_offset LIMIT p_limit';

GRANT EXECUTE ON FUNCTION get_provider_sitemap_v2(INTEGER, INTEGER) TO service_role;

COMMENT ON FUNCTION get_provider_sitemap_v2(INTEGER, INTEGER) IS
  'V3 #4 stratégie 140K — quality filter (description NOT NULL AND length >= 200) on top of v1 (is_active + noindex=false). Cible top 35K fiches RGE E-E-A-T. Single round-trip atomic, requires idx_providers_sitemap_v2.';

CREATE INDEX IF NOT EXISTS idx_providers_sitemap_v2
  ON providers (updated_at DESC, id DESC)
  WHERE is_active = true
    AND noindex = false
    AND description IS NOT NULL
    AND length(description) >= 200;

COMMENT ON INDEX idx_providers_sitemap_v2 IS
  'Partial index pour get_provider_sitemap_v2. ~35K rows (vs 50K pour v1). Index v1 (idx_providers_sitemap) conservé pour fallback runtime.';
