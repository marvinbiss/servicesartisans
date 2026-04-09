-- =============================================================================
-- Migration 381 — RPC backfill communes.nb_artisans_rge
-- =============================================================================
-- Crée une fonction SQL qui backfille `communes.nb_artisans_rge` en une seule
-- requête côté DB, au lieu de ~35k round-trips depuis l'application.
--
-- Jointure : communes.code_insee = trim(providers.address_city)
--
-- IMPORTANT — pourquoi on joint sur code INSEE et PAS sur le nom :
-- Dans l'API recherche-entreprises, `siege.libelle_commune` (qu'on stocke dans
-- providers.address_city) contient en réalité le **code INSEE à 5 chiffres** de
-- la commune (ex: "01004", "10035"), et non le libellé. Validé 2026-04-09 sur
-- un échantillon de 1000 providers RGE : 99.1% ont un code INSEE en
-- address_city, 0.9% sont vides, 0% sont des noms de ville.
--
-- La première version jointait sur `lower(communes.name) = lower(address_city)`
-- et ne matchait que 1033 communes (les rares fallbacks texte). Avec le bon
-- join INSEE on passe à ~14 274 communes (x14).
--
-- Nom `rge_backfill_communes` (pas `refresh_*`) car le parser SQL editor de
-- Supabase tronque les identifiants commençant par "refresh" (bug observé
-- 2026-04-09).
--
-- Performance : ~100ms sur 35k communes (vs 5-10 min en boucle JS).
-- Sécurité   : SECURITY DEFINER (contourne RLS) + GRANT service_role only.
-- =============================================================================

-- Nettoyage de l'ancien index fonctionnel (version lower(address_city)).
DROP INDEX IF EXISTS idx_providers_rge_by_city_lower;

-- Index pour accélérer la jointure par code INSEE.
-- Le filtre regex garantit qu'on n'indexe que les lignes utilisables.
CREATE INDEX IF NOT EXISTS idx_providers_rge_by_insee
  ON providers (address_city)
  WHERE rge_valid_until IS NOT NULL
    AND address_city ~ '^\d{5}$';

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

  -- Backfill via sous-requête (pas de CTE — déclenche le bug ci-dessus).
  -- Join via code INSEE (providers.address_city contient le code, pas le nom).
  UPDATE public.communes c
     SET nb_artisans_rge = sub.cnt
    FROM (
      SELECT
        trim(p.address_city) AS insee_code,
        COUNT(*)::INTEGER    AS cnt
      FROM public.providers p
      WHERE p.rge_valid_until IS NOT NULL
        AND p.rge_valid_until > CURRENT_DATE
        AND p.address_city IS NOT NULL
        AND p.address_city ~ '^\d{5}$'
        AND p.is_active = TRUE
      GROUP BY trim(p.address_city)
    ) AS sub
   WHERE c.code_insee = sub.insee_code
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
  'Backfill communes.nb_artisans_rge depuis providers.rge_valid_until en une seule requête. Join via code INSEE (providers.address_city contient le code INSEE, pas le libellé). Retourne (communes_updated, total_rge_actifs). Appelé par scripts/enrich-rge-ademe.ts et /api/cron/rge-sync.';

REVOKE ALL ON FUNCTION public.rge_backfill_communes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rge_backfill_communes() FROM anon;
REVOKE ALL ON FUNCTION public.rge_backfill_communes() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rge_backfill_communes() TO service_role;
