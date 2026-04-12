-- =============================================================================
-- Migration 422 : RPC get_providers_by_dept
-- =============================================================================
-- Date        : 2026-04-12
-- Contexte    : Fonction RPC pour récupérer les providers par spécialité et
--               département, avec tri par validité RGE, note moyenne et nombre
--               d'avis. Utilisée pour le fallback cascade sur les pages
--               service×département.
--
-- Dépendance  : idx_providers_dept_specialty_active (migration 421)
-- =============================================================================

-- RPC pour fetching providers par service et département (fallback cascade)
CREATE OR REPLACE FUNCTION get_providers_by_dept(
  p_specialty_slugs TEXT[],
  p_department TEXT,
  p_limit INT DEFAULT 6
)
RETURNS SETOF providers
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT *
  FROM providers
  WHERE is_active = true
    AND specialty_slug = ANY(p_specialty_slugs)
    AND address_department = p_department
  ORDER BY
    rge_valid_until DESC NULLS LAST,
    rating_average DESC NULLS LAST,
    review_count DESC NULLS LAST
  LIMIT p_limit;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION get_providers_by_dept TO anon, authenticated;
