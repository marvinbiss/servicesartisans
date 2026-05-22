-- 529_aggregate_rating_helpers.sql
-- ----------------------------------------------------------------------------
-- Mini-badge social proof sous H1 (6 templates pSEO) — voir
-- `src/components/conversion/SocialProofBadge.tsx`.
--
-- Pour les templates pSEO sans contexte département (cluster reno, opération
-- CEE nationale, commune sans service), on a besoin d'un agrégat NATIONAL
-- (parfois filtré par cluster de spécialités).
--
-- Les templates `(service × dept)` continuent d'utiliser
-- `getReviewStatsByDept` (table `review_stats_by_dept`, mig 423) — pas de
-- duplication ici.
--
-- Anti-fake (Google rich-snippet abuse) :
--   - On retourne (NULL, 0) si moins de 3 reviews — le composant skip.
--   - Pas de moyenne pondérée bidon : on agrège sur les VRAIES reviews
--     `status = 'published'` joinées sur `providers.is_active = true`.
--
-- Source unique de vérité : table `reviews` + `providers` (cohérent avec
-- la materialized view `review_stats_by_dept`).
-- ----------------------------------------------------------------------------

-- 1) Agrégat national filtré par liste de spécialités (cluster).
--    Utilisé par /renovation-energetique/[cluster], /cee/[operation],
--    /renovation-energetique/travaux/.../prix.
CREATE OR REPLACE FUNCTION public.get_aggregate_rating_by_specialties(
  p_specialties TEXT[]
)
RETURNS TABLE (avg_rating NUMERIC, review_count BIGINT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
  SELECT
    ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
    COUNT(*)::bigint AS review_count
  FROM public.reviews r
  INNER JOIN public.providers p ON p.id = r.provider_id
  WHERE r.status = 'published'
    AND p.is_active = true
    AND p.specialty = ANY(p_specialties);
$$;

COMMENT ON FUNCTION public.get_aggregate_rating_by_specialties IS
  'Mini-badge social proof — agrégat NATIONAL par cluster de spécialités. Retourne (NULL, 0) si <3 reviews. Source : reviews status=published + providers is_active=true.';

GRANT EXECUTE ON FUNCTION public.get_aggregate_rating_by_specialties(TEXT[]) TO anon, authenticated;

-- 2) Agrégat tous-artisans (commune-level / hub global).
--    Utilisé par /communes/[commune] (qui n'a pas de notion de service).
CREATE OR REPLACE FUNCTION public.get_aggregate_rating_global()
RETURNS TABLE (avg_rating NUMERIC, review_count BIGINT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
  SELECT
    ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
    COUNT(*)::bigint AS review_count
  FROM public.reviews r
  INNER JOIN public.providers p ON p.id = r.provider_id
  WHERE r.status = 'published'
    AND p.is_active = true;
$$;

COMMENT ON FUNCTION public.get_aggregate_rating_global IS
  'Mini-badge social proof — agrégat NATIONAL tous artisans (commune-level). Source : reviews status=published + providers is_active=true.';

GRANT EXECUTE ON FUNCTION public.get_aggregate_rating_global() TO anon, authenticated;
