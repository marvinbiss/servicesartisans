-- Migration 477 — RPC search_providers_by_name
--
-- Pourquoi :
--   La SearchBar n'avait aucune capacité de recherche par nom d'entreprise/artisan.
--   Quand un user tapait "EDF Plomberie SARL" dans le champ "Service", le code
--   faisait `slugify(query)` et push vers `/services/edf-plomberie-sarl/...` qui
--   n'existe pas → 404 systématique. Bug fonctionnel présent depuis l'origine.
--
-- Cette RPC :
--   - utilise `providers.search_vector` (tsvector existant, weight A sur name +
--     specialty, B sur city/desc, C sur dept) maintenu par trigger 015
--   - filtre is_active=true AND noindex=false par défaut (on ne retourne que les
--     fiches référençables ; sinon Google indexerait des pages /recherche?q=...
--     pointant vers des fiches noindex)
--   - boost ranking : ts_rank → claimed → RGE → rating_average → review_count
--   - SECURITY INVOKER : respecte RLS (anon ne voit que les fiches publiques)
--   - search_path pinné (CVE-2018-1058, cf. CLAUDE.md règle migrations)
--
-- Index utilisé : idx_providers_search_vector (GIN, créé par 015).

CREATE OR REPLACE FUNCTION public.search_providers_by_name(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  stable_id TEXT,
  specialty TEXT,
  address_city TEXT,
  address_region TEXT,
  is_verified BOOLEAN,
  claimed_at TIMESTAMPTZ,
  rge_qualifications JSONB,
  rating_average DECIMAL,
  review_count INTEGER,
  rank REAL
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = public, pg_catalog
AS $function$
DECLARE
  _q TEXT;
  _tsq TSQUERY;
BEGIN
  _q := COALESCE(NULLIF(TRIM(p_query), ''), NULL);
  IF _q IS NULL OR LENGTH(_q) < 2 THEN
    RETURN;
  END IF;

  -- plainto_tsquery tolère les chaînes libres ("SARL Couverture du Nord")
  _tsq := plainto_tsquery('french', _q);
  IF _tsq IS NULL OR _tsq::TEXT = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.stable_id,
    p.specialty,
    p.address_city,
    p.address_region,
    p.is_verified,
    p.claimed_at,
    p.rge_qualifications,
    p.rating_average,
    p.review_count,
    ts_rank(p.search_vector, _tsq) AS rank
  FROM providers p
  WHERE p.is_active = true
    AND p.noindex = false
    AND p.search_vector @@ _tsq
  ORDER BY
    ts_rank(p.search_vector, _tsq) DESC,
    (p.claimed_at IS NOT NULL)::INT DESC,
    (CASE
       WHEN p.rge_qualifications IS NOT NULL AND jsonb_typeof(p.rge_qualifications) = 'array'
         THEN jsonb_array_length(p.rge_qualifications)
       ELSE 0
     END > 0)::INT DESC,
    p.rating_average DESC NULLS LAST,
    p.review_count DESC NULLS LAST
  LIMIT GREATEST(LEAST(p_limit, 50), 1)
  OFFSET GREATEST(p_offset, 0);
END;
$function$;

COMMENT ON FUNCTION public.search_providers_by_name(TEXT, INTEGER, INTEGER) IS
  'Recherche FTS pondérée par nom d''artisan/entreprise. Filtre is_active=true + noindex=false. Boost claimed > RGE > rating > review_count. SECURITY INVOKER, search_path pinné. Migration 477 (incident GSC 2026-04-26 — fix SearchBar 404).';

GRANT EXECUTE ON FUNCTION public.search_providers_by_name(TEXT, INTEGER, INTEGER) TO anon, authenticated;
