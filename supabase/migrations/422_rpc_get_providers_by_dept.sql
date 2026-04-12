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
-- Sécurité    : SECURITY INVOKER (RLS active providers déjà autorisé pour anon)
--               Projection explicite pour ne pas exposer colonnes sensibles.
-- =============================================================================

CREATE OR REPLACE FUNCTION get_providers_by_dept(
  p_specialty_slugs TEXT[],
  p_department TEXT,
  p_limit INT DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  stable_id TEXT,
  name TEXT,
  slug TEXT,
  specialty TEXT,
  specialty_slug TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_department TEXT,
  address_region TEXT,
  is_verified BOOLEAN,
  is_active BOOLEAN,
  rating_average NUMERIC,
  review_count INTEGER,
  rge_qualifications JSONB,
  rge_valid_until DATE,
  rge_organismes TEXT[],
  rge_source_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT
    p.id, p.stable_id, p.name, p.slug, p.specialty, p.specialty_slug,
    p.address_city, p.address_postal_code, p.address_department, p.address_region,
    p.is_verified, p.is_active, p.rating_average, p.review_count,
    p.rge_qualifications, p.rge_valid_until, p.rge_organismes, p.rge_source_url,
    p.latitude, p.longitude, p.created_at, p.updated_at
  FROM providers p
  WHERE p.is_active = true
    AND p.specialty_slug = ANY(p_specialty_slugs)
    AND p.address_department = p_department
  ORDER BY
    p.rge_valid_until DESC NULLS LAST,
    p.rating_average DESC NULLS LAST,
    p.review_count DESC NULLS LAST
  LIMIT LEAST(p_limit, 50);
$$;

GRANT EXECUTE ON FUNCTION get_providers_by_dept TO anon, authenticated;
