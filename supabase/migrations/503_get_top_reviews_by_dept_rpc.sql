-- 503_get_top_reviews_by_dept_rpc.sql
-- ----------------------------------------------------------------------------
-- Hotfix prod 2026-05-05 — HeadersOverflowError sur getTopReviewsByDept.
--
-- Avant : 2 queries client (providers WHERE department + IN(provider_id, [500 UUIDs])).
-- Le 2e .in() avec 500 UUIDs × 36 chars génère une query string PostgREST
-- de ~18 KB → dépasse la limite undici (UND_ERR_HEADERS_OVERFLOW).
--
-- Maintenant : 1 RPC qui fait le JOIN côté Postgres, retourne uniquement
-- les top N reviews triées rating DESC + created_at DESC. Pas d'overflow,
-- gain perf (1 round-trip vs 2), index sur (status, rating DESC) déjà actif.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_top_reviews_by_dept(
  p_specialties TEXT[],
  p_department_code TEXT,
  p_limit INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  rating SMALLINT,
  comment TEXT,
  created_at TIMESTAMPTZ,
  author_name TEXT,
  provider_name TEXT,
  provider_city TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
  SELECT
    r.id,
    r.rating,
    r.content AS comment,
    r.created_at,
    r.author_name,
    p.name AS provider_name,
    p.address_city AS provider_city
  FROM public.reviews r
  INNER JOIN public.providers p ON p.id = r.provider_id
  WHERE r.status = 'published'
    AND p.address_department = p_department_code
    AND p.specialty = ANY(p_specialties)
    AND p.is_active = true
  ORDER BY r.rating DESC, r.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 10));
$$;

COMMENT ON FUNCTION public.get_top_reviews_by_dept IS
  'Top reviews dept-level pour pages /services/[s]/[v]. Remplace le 2-query .in([500 UUIDs]) qui leakait UND_ERR_HEADERS_OVERFLOW. p_limit clamp 1..10.';

GRANT EXECUTE ON FUNCTION public.get_top_reviews_by_dept(TEXT[], TEXT, INT) TO anon, authenticated;
