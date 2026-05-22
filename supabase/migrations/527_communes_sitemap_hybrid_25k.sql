-- =============================================================================
-- Migration 527 — Hybride 25K communes : RGE local OU rayon 20 km
-- ServicesArtisans — 2026-05-22
-- =============================================================================
-- CONTEXT
-- -------
-- Post-pivot full RGE (2026-05-03), seules ~17K communes ont au moins 1 artisan
-- RGE local (`communes.nb_artisans_rge >= 1`, backfill mig 381). Les ~19K
-- restantes (hameaux, communes rurales) basculent en noindex/exclues du sitemap
-- via `isCommuneQualified` + filter `qualifiedOnly` dans `getAllCommuneSlugs`.
--
-- Audit 2026-05-22 (tmp/sitemap-diff-2026-05-22.md) confirme :
--   - 17.5K URLs dans les shards `communes-cities-{0,1,2}` (`communes-cities-3`
--     déjà retiré car 0 URL).
--   - Le filter `≥500 hab OU ≥1 artisan en commune` exclut ~16K communes
--     démographiquement viables mais sans artisan REGISTRÉ EN COMMUNE.
--
-- INSIGHT : un artisan RGE basé dans la commune voisine (5-15 km) intervient
-- naturellement sur 80-95% des communes périphériques (rayon moyen
-- d'intervention BTP = 30 km). Refuser ces ~8K communes du sitemap = soft 404
-- évité MAIS perte de couverture longue traîne SEO injustifiée — la page peut
-- être enrichie côté UI ("Pas d'artisan basé à X, voici les 5 plus proches dans
-- 20 km") sans devenir thin content (data INSEE/DPE/Géorisques inchangée).
--
-- DECISION
-- --------
-- RPC unique `get_communes_sitemap_hybrid()` qui UNION :
--   1. Communes avec ≥1 RGE local (existant — équivalent
--      `nb_artisans_rge >= 1`, has_local_rge = true, distance = 0).
--   2. Communes SANS RGE local MAIS avec ≥1 RGE valide dans un rayon 20 km
--      (`ST_DWithin` PostGIS sur `communes.geo` + `providers.location`).
--
-- Skip strict des communes >20 km de tout RGE valide (vrai soft 404 — le
-- pivot full RGE 2026-05-03 ne permet pas d'enrichir une page sans artisan
-- couvrant la zone).
--
-- Target sitemap : 17K (local) + ~8K (fallback) = ~25K URLs.
--
-- DEPENDENCIES (vérifiées 2026-05-22) :
--   - `communes.geo geography(Point, 4326)` (mig 310) + index `idx_communes_geo`
--     GiST partial (geo NOT NULL).
--   - `providers.location geography(Point, 4326)` (mig 015) + index
--     `idx_providers_location_gist` GiST.
--   - `providers.rge_valid_until DATE` (mig 380) + index partiel
--     `idx_providers_rge_valid_until` WHERE rge_valid_until IS NOT NULL.
--
-- Aucune extension `cube`/`earthdistance` requise — PostGIS est l'unique stack
-- spatiale du projet (cohérence avec dispatch mig 498, recherche mig 015).
--
-- PERFORMANCE
-- -----------
-- `ST_DWithin(geography, geography, meters)` exploite l'index GiST côté
-- providers ET côté communes. CROSS JOIN LATERAL borné par LIMIT 1 + bbox
-- implicite ST_DWithin. Sur ~36K communes × ~49K RGE valides + bbox 20km,
-- temps estimé : 2-5s (acceptable car appelé une fois au build du sitemap +
-- ISR `revalidate = 86400`).
--
-- ROLLBACK
-- --------
-- DROP FUNCTION public.get_communes_sitemap_hybrid() ;
-- Revert sitemap.ts vers `getAllCommuneSlugs(qualifiedOnly=true)`.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_communes_sitemap_hybrid(
  p_radius_km INTEGER DEFAULT 20,
  p_max_communes INTEGER DEFAULT 30000
)
RETURNS TABLE (
  commune_slug   text,
  code_insee     text,
  has_local_rge  boolean,
  nearest_rge_distance_km numeric,
  last_modified  timestamptz
)
LANGUAGE sql
STABLE
SET search_path = public, pg_catalog
AS $func$
  WITH local_rge AS (
    -- Vague 1 : communes avec ≥1 RGE basé en commune (backfill mig 381).
    -- nb_artisans_rge est entretenu par cron `rge_backfill_communes()`.
    SELECT
      c.slug          AS commune_slug,
      c.code_insee    AS code_insee,
      true            AS has_local_rge,
      0::numeric      AS nearest_rge_distance_km,
      c.updated_at    AS last_modified
    FROM public.communes c
    WHERE c.is_active = true
      AND COALESCE(c.nb_artisans_rge, 0) >= 1
  ),
  fallback_rge AS (
    -- Vague 2 : communes sans RGE local mais ≥1 RGE valide dans rayon p_radius_km.
    -- ST_DWithin exploite les index GiST des deux côtés (geography, meters).
    SELECT
      c.slug                                AS commune_slug,
      c.code_insee                          AS code_insee,
      false                                 AS has_local_rge,
      ROUND(
        (ST_Distance(c.geo, nearest.location) / 1000.0)::numeric,
        1
      )                                     AS nearest_rge_distance_km,
      c.updated_at                          AS last_modified
    FROM public.communes c
    CROSS JOIN LATERAL (
      SELECT p.location
      FROM public.providers p
      WHERE p.is_active = true
        AND p.noindex = false
        AND p.rge_valid_until IS NOT NULL
        AND p.rge_valid_until > CURRENT_DATE
        AND p.location IS NOT NULL
        AND ST_DWithin(p.location, c.geo, p_radius_km * 1000)
      ORDER BY p.location <-> c.geo
      LIMIT 1
    ) AS nearest
    WHERE c.is_active = true
      AND c.geo IS NOT NULL
      AND COALESCE(c.nb_artisans_rge, 0) = 0
  )
  SELECT * FROM local_rge
  UNION ALL
  SELECT * FROM fallback_rge
  ORDER BY has_local_rge DESC, nearest_rge_distance_km ASC NULLS LAST
  LIMIT p_max_communes
$func$;

COMMENT ON FUNCTION public.get_communes_sitemap_hybrid(INTEGER, INTEGER) IS
  'Hybride 25K — Vague 1 (communes avec >=1 RGE local via nb_artisans_rge) UNION Vague 2 (communes avec >=1 RGE valide dans rayon 20 km via ST_DWithin). Évite le soft 404 post-pivot RGE 2026-05-03 sur les communes RGE-éloignées. Migration 527.';

REVOKE ALL ON FUNCTION public.get_communes_sitemap_hybrid(INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_communes_sitemap_hybrid(INTEGER, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_communes_sitemap_hybrid(INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_communes_sitemap_hybrid(INTEGER, INTEGER) TO authenticated;

-- -----------------------------------------------------------------------------
-- RPC compagnon : 5 RGE valides les plus proches d'une commune (rayon p_radius_km).
-- Utilisé par la page commune en mode "fallback" pour afficher la liste des
-- artisans RGE proches sans casser la règle "no phone from DB" (gated isRgeActive).
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_nearest_rge_providers_for_commune(
  p_commune_slug text,
  p_radius_km    INTEGER DEFAULT 20,
  p_limit        INTEGER DEFAULT 5
)
RETURNS TABLE (
  id              uuid,
  name            text,
  slug            text,
  stable_id       text,
  specialty       text,
  address_city    text,
  address_postal_code text,
  home_commune_slug text,
  distance_km     numeric
)
LANGUAGE sql
STABLE
SET search_path = public, pg_catalog
AS $func$
  WITH origin AS (
    SELECT c.geo
    FROM public.communes c
    WHERE c.slug = p_commune_slug
      AND c.is_active = true
      AND c.geo IS NOT NULL
    LIMIT 1
  )
  SELECT
    p.id,
    p.name,
    p.slug,
    p.stable_id,
    p.specialty,
    p.address_city,
    p.address_postal_code,
    home.slug AS home_commune_slug,
    ROUND((ST_Distance(p.location, origin.geo) / 1000.0)::numeric, 1) AS distance_km
  FROM public.providers p
  CROSS JOIN origin
  LEFT JOIN public.communes home
    ON home.code_insee = trim(p.address_city)
   AND home.is_active = true
  WHERE p.is_active = true
    AND p.noindex = false
    AND p.rge_valid_until IS NOT NULL
    AND p.rge_valid_until > CURRENT_DATE
    AND p.location IS NOT NULL
    AND ST_DWithin(p.location, origin.geo, p_radius_km * 1000)
  ORDER BY p.location <-> origin.geo
  LIMIT p_limit
$func$;

COMMENT ON FUNCTION public.get_nearest_rge_providers_for_commune(text, INTEGER, INTEGER) IS
  'Retourne les N artisans RGE valides les plus proches d''une commune (rayon p_radius_km). Pour la page commune en mode fallback (no local RGE). Migration 527.';

REVOKE ALL ON FUNCTION public.get_nearest_rge_providers_for_commune(text, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_nearest_rge_providers_for_commune(text, INTEGER, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_nearest_rge_providers_for_commune(text, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_nearest_rge_providers_for_commune(text, INTEGER, INTEGER) TO authenticated;

COMMIT;
