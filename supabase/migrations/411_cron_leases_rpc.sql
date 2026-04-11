-- ===========================================================================
-- Migration 411 — acquire_cron_lease / release_cron_lease (RPC atomiques)
-- ===========================================================================
-- Contexte :
--   La migration 409 fournit la table `cron_leases`. Le code appelant utilisait
--   `supabase.from('cron_leases').upsert(...).lt('expires_at', nowIso).select()`
--   pour acquérir un lease conditionnellement. C'est CASSÉ côté PostgREST :
--   le `.lt()` est appliqué au filtre de SELECT post-upsert, PAS au `WHERE` du
--   `ON CONFLICT DO UPDATE`. Conséquences :
--     - soit l'UPSERT écrase un lease encore actif (double-run silencieux),
--     - soit le `.lt()` post-upsert retourne systématiquement 0 ligne (skip total).
--
-- Fix :
--   On déplace l'atomicité côté Postgres via une fonction plpgsql qui injecte
--   le `WHERE cron_leases.expires_at < NOW()` DANS le `ON CONFLICT DO UPDATE`.
--   Cette clause est évaluée par Postgres (pas PostgREST) → garantie atomique.
--
--   Si le lease courant n'est PAS expiré :
--     - le `INSERT ... ON CONFLICT DO UPDATE WHERE ...` ne met rien à jour,
--     - `RETURNING` ne retourne rien,
--     - `v_acquired` reste NULL → `COALESCE(..., FALSE)` → le caller skip.
--
-- DETTE TECHNIQUE — owner_token (defense-in-depth, cross-worker safety)
-- ---------------------------------------------------------------------------
--   À ce jour, `release_cron_lease(p_name)` libère sans vérifier d'owner_token.
--   En mono-cron (un seul cron CEE consomme ce lease) c'est sûr : seul le
--   runner qui a acquis le lease peut le relâcher pendant la durée du run.
--
--   Scénario de race résiduel (extrêmement improbable mais documenté) :
--     1. Runner A acquiert le lease (TTL 15 min),
--     2. Runner A stalle > 15 min → TTL expire,
--     3. Runner B acquiert à son tour,
--     4. Runner A revient et appelle release → libère le lease de B.
--
--   Fix futur quand un 2e cron rejoindra ce mécanisme de lease (YAGNI pour
--   l'instant, un seul cron = cee-dossier-transitions) :
--     - ajouter colonne `cron_leases.owner_token UUID`,
--     - `acquire_cron_lease` génère et RETURNS le token,
--     - `release_cron_lease(p_name, p_token)` ne libère que si token match,
--     - caller TS stocke le token et le passe au release.
-- ===========================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.acquire_cron_lease(
  p_name        TEXT,
  p_ttl_seconds INT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acquired BOOLEAN;
BEGIN
  INSERT INTO public.cron_leases (name, acquired_at, expires_at)
  VALUES (p_name, NOW(), NOW() + make_interval(secs => p_ttl_seconds))
  ON CONFLICT (name) DO UPDATE
    SET acquired_at = NOW(),
        expires_at  = NOW() + make_interval(secs => p_ttl_seconds)
    WHERE cron_leases.expires_at < NOW()
  RETURNING TRUE INTO v_acquired;

  RETURN COALESCE(v_acquired, FALSE);
END;
$$;

CREATE OR REPLACE FUNCTION public.release_cron_lease(p_name TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.cron_leases
     SET expires_at = NOW()
   WHERE name = p_name;
$$;

GRANT EXECUTE ON FUNCTION public.acquire_cron_lease(TEXT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_cron_lease(TEXT)       TO service_role;

COMMENT ON FUNCTION public.acquire_cron_lease(TEXT, INT) IS
  'Acquisition atomique d''un lease cron. Remplace l''upsert PostgREST qui ne gérait pas le WHERE dans DO UPDATE. Retourne TRUE si acquis, FALSE si un lease actif est encore détenu.';

COMMENT ON FUNCTION public.release_cron_lease(TEXT) IS
  'Libère un lease cron en forçant expires_at = NOW(). Best-effort : une erreur ici ne doit pas faire échouer le cron (le TTL assure une libération naturelle).';

COMMIT;
