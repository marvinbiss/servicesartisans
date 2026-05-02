-- =============================================================================
-- Migration 495 — Replay search_providers_by_name (jsonb_array_length fix)
-- =============================================================================
-- Audit Sentry 2026-05-02 (issue JAVASCRIPT-NEXTJS-84, 1 event sur
-- `/recherche/artisans?q=architecte`).
--
-- Erreur observée :
--   `function array_length(jsonb, integer) does not exist` (code 42883)
--
-- Constat :
--   - La mig 477 introduit `search_providers_by_name` qui utilise correctement
--     `jsonb_array_length(p.rge_qualifications)` côté ORDER BY.
--   - Le repo est aligné depuis 2026-04-26 (commit incident GSC).
--   - Mais en prod la fonction utilise encore `array_length(jsonb, integer)`,
--     preuve que la mig 477 n'a jamais été appliquée OU qu'une définition
--     antérieure (jamais commitée) tourne toujours.
--
-- Fix :
--   On ré-exécute la définition correcte sous une nouvelle mig pour la tracker
--   dans `supabase_migrations` et garantir l'application. `CREATE OR REPLACE`
--   reste idempotent côté instances déjà alignées.
--
-- Voir aussi mig 477 (origine) — cette migration en est une copie 1:1.
--
-- 2026-05-02 (post-application incident SQL editor) :
-- DROP préalable obligatoire car la version qui tournait en prod avait une
-- TABLE de retour différente (probablement définition pré-mig 477 jamais
-- remplacée). PG ≤ 17 refuse `CREATE OR REPLACE FUNCTION` qui modifie le
-- RETURNS TABLE — message d'erreur typique :
--   ERROR:  42P13: cannot change return type of existing function
--   HINT:   Use DROP FUNCTION ... first.
-- DROP IF EXISTS est idempotent et reset les GRANTs, donc on les ré-applique
-- en bas de migration.
-- =============================================================================

DROP FUNCTION IF EXISTS public.search_providers_by_name(TEXT, INTEGER, INTEGER);

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
  'Recherche FTS pondérée par nom artisan. Replay mig 477 — fix array_length(jsonb)→jsonb_array_length confirmé via Sentry 2026-05-02.';

GRANT EXECUTE ON FUNCTION public.search_providers_by_name(TEXT, INTEGER, INTEGER) TO anon, authenticated;
