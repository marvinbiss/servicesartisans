-- =============================================================================
-- Migration 312 : Indexes et vues pour passage à 2M+ pages
-- 2026-02-16
-- =============================================================================
-- Skill-audited with: supabase-postgres-best-practices
--
-- Optimisations nécessaires pour servir 50 métiers × 35K communes :
-- 1. MV mv_provider_counts : specialty × city (élimine COUNT(*) sur 350K rows)
-- 2. Covering index sur providers (query-covering-indexes.md)
-- 3. Partial index stable_id (query-partial-indexes.md)
-- 4. Fonctions de rafraîchissement avec ANALYZE (monitor-vacuum-analyze.md)
-- 5. KNN operator <-> au lieu de ORDER BY ST_Distance (query-index-types.md)
-- =============================================================================

-- ============================================================================
-- 1. VUE MATÉRIALISÉE : provider counts par specialty × city
-- ============================================================================
-- Élimine les COUNT(*) sur 350K rows pour chaque page service+ville.
-- Rafraîchie toutes les 15 minutes par cron.
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_provider_counts AS
SELECT
  specialty,
  address_city AS city,
  address_department AS department,
  COUNT(*)::int AS provider_count,
  COUNT(*) FILTER (WHERE is_verified)::int AS verified_count,
  ROUND(AVG(rating_average)::numeric, 1) AS avg_rating
FROM providers
WHERE is_active = TRUE
  AND specialty IS NOT NULL
  AND address_city IS NOT NULL
GROUP BY specialty, address_city, address_department
WITH DATA;

-- Unique index requis pour REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_provider_counts_pk
  ON mv_provider_counts(specialty, city);

-- Lookup par city seul (page ville: "tous les métiers à Lyon")
CREATE INDEX IF NOT EXISTS idx_mv_provider_counts_city
  ON mv_provider_counts(city);

-- Lookup par department (page département: "tous les métiers dans le Rhône")
CREATE INDEX IF NOT EXISTS idx_mv_provider_counts_dept
  ON mv_provider_counts(department);

-- Covering index sur la MV: évite heap fetch pour les pages service+ville
-- qui n'ont besoin que du count, verified_count et avg_rating
CREATE INDEX IF NOT EXISTS idx_mv_provider_counts_cover
  ON mv_provider_counts(specialty, city)
  INCLUDE (provider_count, verified_count, avg_rating);

-- ============================================================================
-- 2. COVERING INDEX sur providers (query-covering-indexes.md)
-- ============================================================================
-- Les pages service+ville font:
--   .select('name, stable_id, slug, rating_average, review_count, is_verified')
--   .eq('specialty', X).ilike('address_city', Y).eq('is_active', true)
--
-- Ce covering index sert toutes ces colonnes depuis l'index seul,
-- sans aller chercher dans le heap (2-5x faster per skill doc).
--
-- Column order: equality cols first (specialty, address_city) per
-- query-composite-indexes.md
CREATE INDEX IF NOT EXISTS idx_providers_specialty_city_cover
  ON providers (specialty, address_city)
  INCLUDE (name, stable_id, slug, rating_average, review_count, is_verified)
  WHERE is_active = TRUE;

-- ============================================================================
-- 3. PARTIAL INDEX stable_id (query-partial-indexes.md)
-- ============================================================================
-- L'index existant providers_stable_id_key est UNIQUE sur toute la table.
-- On ajoute un partial index filtré is_active = TRUE pour les lookups
-- de pages provider detail (5-20x smaller per skill doc).
CREATE INDEX IF NOT EXISTS idx_providers_stable_id_active
  ON providers (stable_id)
  WHERE is_active = TRUE AND stable_id IS NOT NULL;

-- ============================================================================
-- 4. METTRE À JOUR refresh_artisan_stats() — ajouter la nouvelle MV
-- ============================================================================
CREATE OR REPLACE FUNCTION refresh_artisan_stats()
RETURNS VOID AS $fn$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_artisan_counts_by_dept;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_artisan_counts_by_city;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_artisan_counts_by_region;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_provider_counts;
  -- Update stats after MV refresh (monitor-vacuum-analyze.md)
  ANALYZE mv_provider_counts;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION refresh_artisan_stats IS
  'Rafraîchit les 4 vues matérialisées + ANALYZE mv_provider_counts. À appeler après collecte/enrichissement.';

-- ============================================================================
-- 5. FONCTION : Mettre à jour communes.provider_count depuis providers
-- ============================================================================
-- Uses a single UPDATE with LEFT JOIN instead of two separate UPDATE passes.
-- The lower() comparison is intentional: providers.address_city may have
-- inconsistent casing. A future normalization script will align casing
-- and allow eq() instead of ilike().
CREATE OR REPLACE FUNCTION refresh_commune_provider_counts()
RETURNS VOID AS $fn$
BEGIN
  -- Single-pass update: set count from providers, 0 for communes without matches
  UPDATE communes c
  SET provider_count = COALESCE(sub.cnt, 0)
  FROM (
    SELECT
      lower(address_city) AS city_lower,
      COUNT(*)::int AS cnt
    FROM providers
    WHERE is_active = TRUE AND address_city IS NOT NULL
    GROUP BY lower(address_city)
  ) sub
  WHERE lower(c.name) = sub.city_lower;

  -- Zero out communes that had no match (no providers at all)
  UPDATE communes
  SET provider_count = 0
  WHERE provider_count > 0
    AND lower(name) NOT IN (
      SELECT DISTINCT lower(address_city)
      FROM providers
      WHERE is_active = TRUE AND address_city IS NOT NULL
    );

  -- Refresh stats after bulk update (monitor-vacuum-analyze.md)
  ANALYZE communes;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION refresh_commune_provider_counts IS
  'Met à jour communes.provider_count. Single-pass + ANALYZE. Exécuter après refresh_artisan_stats().';

-- ============================================================================
-- 6. FONCTION : Calculer nearest_city_with_providers (PostGIS KNN)
-- ============================================================================
-- BEFORE (O(n²) — ST_Distance + ORDER BY for every commune):
--   ORDER BY ST_Distance(geo1, geo2) — computes distance to ALL other communes
--
-- AFTER (KNN <-> operator — uses GiST index, O(n·log n)):
--   ORDER BY geo1 <-> geo2 — indexed nearest-neighbor, fast
--
-- Ref: query-index-types.md ("GiST: nearest-neighbor KNN queries")
CREATE OR REPLACE FUNCTION refresh_nearest_city_with_providers()
RETURNS VOID AS $fn$
BEGIN
  UPDATE communes c
  SET nearest_city_with_providers = (
    SELECT c2.slug
    FROM communes c2
    WHERE c2.provider_count > 0
      AND c2.code_insee != c.code_insee
      AND c2.geo IS NOT NULL
    ORDER BY c.geo <-> c2.geo  -- KNN operator: uses GiST index
    LIMIT 1
  )
  WHERE c.provider_count = 0
    AND c.geo IS NOT NULL;

  ANALYZE communes;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION refresh_nearest_city_with_providers IS
  'KNN nearest-neighbor via PostGIS <-> operator (indexed). Exécuter après refresh_commune_provider_counts().';

-- ============================================================================
-- 7. AUTOVACUUM pour providers (monitor-vacuum-analyze.md)
-- ============================================================================
-- providers (350K+ rows) est la table la plus requêtée.
-- Lower thresholds pour stats fraîches après enrichissement.
ALTER TABLE providers SET (
  autovacuum_vacuum_scale_factor = 0.05,   -- Vacuum at 5% dead tuples (default 20%)
  autovacuum_analyze_scale_factor = 0.02   -- Analyze at 2% changes (default 10%)
);

-- ============================================================================
-- 8. COMMENTAIRES
-- ============================================================================
COMMENT ON MATERIALIZED VIEW mv_provider_counts IS
  'Agrégats specialty × city pour les pages service+ville. Rafraîchie par refresh_artisan_stats(). Indexes: PK(specialty,city), covering(count,verified,avg_rating).';

COMMENT ON INDEX idx_providers_specialty_city_cover IS
  'Covering index: sert name, stable_id, slug, rating_average, review_count, is_verified depuis l''index. Évite heap fetch pour les listings service+ville.';
