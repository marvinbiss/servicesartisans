-- 516_mv_provider_counts_rge_filter.sql
-- Pivot full RGE 2026-05-06 : étend `mv_provider_counts` (mig 312) avec une
-- colonne `rge_provider_count` filtrée sur les artisans RGE actifs.
--
-- Pourquoi : depuis le pivot full RGE 2026-05-05, la DB n'a que ~46K artisans
-- RGE certifiés sur ~970K providers actifs. Les hubs `/services/[s]`,
-- `/avis/[s]`, `/rge/[s]`, `/villes/[v]`, `/urgence/[s]` listaient des combos
-- service×ville depuis `villes.slice(0, 2267)` sans vérifier la présence RGE
-- réelle → ~85K liens cassés en circulation, soft-404 SEO sur 30-40K combos
-- sitemap-émis. Voir audit `services-hub` 2026-05-06.
--
-- Stratégie : single source of truth via mat-view étendue. Helper TS
-- `getValidCityServiceCombos()` lit la MV. Sitemap, middleware Edge, hubs UI
-- consomment le même set. Drift impossible.
--
-- Idempotent : DROP + CREATE car ALTER MATERIALIZED VIEW ne peut pas ajouter
-- une colonne agrégée. La MV n'est lue par aucun code TS aujourd'hui (vérif
-- 2026-05-06 grep mv_provider_counts dans src/), donc le DROP transitoire est
-- safe.

-- =============================================================================
-- 1. DROP + CREATE avec colonne rge_provider_count
-- =============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.mv_provider_counts CASCADE;

CREATE MATERIALIZED VIEW public.mv_provider_counts AS
SELECT
  specialty,
  address_city AS city,
  address_department AS department,
  COUNT(*)::int AS provider_count,
  COUNT(*) FILTER (WHERE is_verified)::int AS verified_count,
  COUNT(*) FILTER (
    WHERE rge_qualifications IS NOT NULL
      AND rge_valid_until >= CURRENT_DATE
  )::int AS rge_provider_count,
  ROUND(AVG(rating_average)::numeric, 1) AS avg_rating
FROM public.providers
WHERE is_active = TRUE
  AND specialty IS NOT NULL
  AND address_city IS NOT NULL
GROUP BY specialty, address_city, address_department
WITH DATA;

COMMENT ON MATERIALIZED VIEW public.mv_provider_counts IS
  'Counts par specialty × city. provider_count = tous actifs (legacy),
   rge_provider_count = filtré RGE actifs (pivot 2026-05-05). Source vérité
   pour sitemap RGE-only + hubs UI + middleware Edge guard.';

-- =============================================================================
-- 2. Indexes (recréés post-DROP CASCADE)
-- =============================================================================

-- Unique index requis pour REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_provider_counts_pk
  ON public.mv_provider_counts (specialty, city);

-- Lookup par city seul
CREATE INDEX idx_mv_provider_counts_city
  ON public.mv_provider_counts (city);

-- Lookup par department
CREATE INDEX idx_mv_provider_counts_dept
  ON public.mv_provider_counts (department);

-- Covering index : sert le hot-path "valid combos with RGE"
-- WHERE rge_provider_count > 0 ORDER BY rge_provider_count DESC
CREATE INDEX idx_mv_provider_counts_rge
  ON public.mv_provider_counts (specialty, rge_provider_count DESC)
  WHERE rge_provider_count > 0;

-- Covering complet (toutes colonnes courantes — évite heap fetch)
CREATE INDEX idx_mv_provider_counts_cover
  ON public.mv_provider_counts (specialty, city)
  INCLUDE (provider_count, rge_provider_count, verified_count, avg_rating);

-- =============================================================================
-- 3. Re-pin search_path sur refresh_artisan_stats() (mig 312 : non-pinné)
-- =============================================================================
-- Mig 473 a réglé le search_path drift global, mais cette fonction a été
-- créée en mig 312 antérieurement et son SET search_path peut avoir dérivé.
-- On la re-pin proprement (CVE-2018-1058).
CREATE OR REPLACE FUNCTION public.refresh_artisan_stats()
RETURNS VOID AS $fn$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_artisan_counts_by_dept;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_artisan_counts_by_city;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_artisan_counts_by_region;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_provider_counts;
  ANALYZE public.mv_provider_counts;
END;
$fn$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public, pg_catalog;

COMMENT ON FUNCTION public.refresh_artisan_stats IS
  'Rafraîchit les 4 vues matérialisées + ANALYZE. Cron horaire recommandé
   (mig 516 : ajout colonne rge_provider_count).';

-- =============================================================================
-- 4. Premier refresh inline (peuple la MV juste après création)
-- =============================================================================
-- Note : la MV est créée WITH DATA donc déjà peuplée. Pas besoin de REFRESH.
-- Le cron `refresh_artisan_stats` continuera de la rafraîchir périodiquement.

-- =============================================================================
-- 5. Vérif post-mig (à run manuellement après application)
-- =============================================================================
-- SELECT
--   count(*) AS rows_total,
--   count(*) FILTER (WHERE rge_provider_count > 0) AS rows_with_rge,
--   sum(provider_count) AS total_providers_indexed,
--   sum(rge_provider_count) AS total_rge_indexed
-- FROM public.mv_provider_counts;
--
-- Attendu (snapshot 2026-05-06) :
--   rows_total ≈ 30K-50K (combos specialty × city)
--   rows_with_rge ≈ 5K-15K (combos avec ≥ 1 RGE)
--   total_rge_indexed ≈ 45K (cohérent avec query directe providers)
