-- =============================================================================
-- Migration 381 — RPC backfill communes.nb_artisans_rge
-- =============================================================================
-- Crée une fonction SQL qui backfille `communes.nb_artisans_rge` en une seule
-- requête côté DB, au lieu de ~35k round-trips depuis l'application.
--
-- Jointure : lower(communes.name) = lower(providers.address_city)
-- - `communes.name` vient des sources officielles (INSEE / geo.api.gouv.fr)
-- - `providers.address_city` est du TEXT libre (recherche-entreprises API)
-- - `lower()` rend robuste face à "PARIS" vs "Paris"
-- - On n'utilise PAS `communes.slug` car il est parfois dénormalisé (cf. 367, 376)
--
-- Nom `rge_backfill_communes` (pas `refresh_*`) car le parser SQL editor de
-- Supabase tronque les identifiants commençant par "refresh" (bug observé
-- 2026-04-09).
--
-- Performance : ~100ms sur 35k communes (vs 5-10 min en boucle JS).
-- Sécurité   : SECURITY DEFINER (contourne RLS) + GRANT service_role only.
-- =============================================================================

-- Index fonctionnel pour accélérer la jointure case-insensitive.
CREATE INDEX IF NOT EXISTS idx_providers_rge_by_city_lower
  ON providers (lower(address_city))
  WHERE rge_valid_until IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Fonction RPC
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rge_backfill_communes()
RETURNS TABLE(communes_updated INTEGER, total_rge INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_updated INTEGER;
  v_total   INTEGER;
BEGIN
  -- Reset d'abord toutes les communes à 0 pour éviter les valeurs stales
  UPDATE communes
     SET nb_artisans_rge = 0
   WHERE nb_artisans_rge IS DISTINCT FROM 0
     AND is_active = TRUE;

  -- Puis mise à jour depuis l'agrégat providers
  WITH rge_counts AS (
    SELECT
      lower(address_city) AS city_key,
      COUNT(*)::INTEGER   AS cnt
    FROM providers
    WHERE rge_valid_until IS NOT NULL
      AND rge_valid_until > CURRENT_DATE
      AND address_city IS NOT NULL
      AND is_active = TRUE
    GROUP BY lower(address_city)
  )
  UPDATE communes c
     SET nb_artisans_rge = rc.cnt
    FROM rge_counts rc
   WHERE lower(c.name) = rc.city_key
     AND c.is_active = TRUE;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  SELECT COUNT(*)::INTEGER INTO v_total
    FROM providers
   WHERE rge_valid_until IS NOT NULL
     AND rge_valid_until > CURRENT_DATE
     AND is_active = TRUE;

  RETURN QUERY SELECT v_updated, v_total;
END;
$func$;

COMMENT ON FUNCTION public.rge_backfill_communes() IS
  'Backfill communes.nb_artisans_rge depuis providers.rge_valid_until en une seule requête. Retourne (communes_updated, total_rge_actifs). Appelé par scripts/enrich-rge-ademe.ts et /api/cron/rge-sync.';

REVOKE ALL ON FUNCTION public.rge_backfill_communes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rge_backfill_communes() FROM anon;
REVOKE ALL ON FUNCTION public.rge_backfill_communes() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rge_backfill_communes() TO service_role;
