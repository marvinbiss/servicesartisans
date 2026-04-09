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

-- Note : pattern "OUT params + RETURN NEXT" (pas RETURN QUERY + CTE) pour éviter
-- l'erreur PL/pgSQL "query has no destination for result data" observée avec
-- le couple "WITH ... UPDATE" + "RETURN QUERY SELECT" (bug reproductible en P16).
CREATE OR REPLACE FUNCTION public.rge_backfill_communes()
RETURNS TABLE(communes_updated INTEGER, total_rge INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER := 0;
  v_total   INTEGER := 0;
BEGIN
  -- Reset : toutes les communes actives sont remises à 0 pour éviter les valeurs stales
  UPDATE public.communes
     SET nb_artisans_rge = 0
   WHERE nb_artisans_rge IS DISTINCT FROM 0
     AND is_active = TRUE;

  -- Backfill via sous-requête (pas de CTE — déclenche le bug ci-dessus)
  UPDATE public.communes c
     SET nb_artisans_rge = sub.cnt
    FROM (
      SELECT
        lower(p.address_city) AS city_key,
        COUNT(*)::INTEGER     AS cnt
      FROM public.providers p
      WHERE p.rge_valid_until IS NOT NULL
        AND p.rge_valid_until > CURRENT_DATE
        AND p.address_city IS NOT NULL
        AND p.is_active = TRUE
      GROUP BY lower(p.address_city)
    ) AS sub
   WHERE lower(c.name) = sub.city_key
     AND c.is_active = TRUE;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  SELECT COUNT(*)::INTEGER
    INTO v_total
    FROM public.providers
   WHERE rge_valid_until IS NOT NULL
     AND rge_valid_until > CURRENT_DATE
     AND is_active = TRUE;

  communes_updated := v_updated;
  total_rge := v_total;
  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION public.rge_backfill_communes() IS
  'Backfill communes.nb_artisans_rge depuis providers.rge_valid_until en une seule requête. Retourne (communes_updated, total_rge_actifs). Appelé par scripts/enrich-rge-ademe.ts et /api/cron/rge-sync.';

REVOKE ALL ON FUNCTION public.rge_backfill_communes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rge_backfill_communes() FROM anon;
REVOKE ALL ON FUNCTION public.rge_backfill_communes() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rge_backfill_communes() TO service_role;
