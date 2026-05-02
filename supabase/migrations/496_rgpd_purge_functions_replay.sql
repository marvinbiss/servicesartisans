-- =============================================================================
-- Migration 496 — Replay RGPD purge functions (find_inactive_users + purge_audit_logs)
-- =============================================================================
-- Audit Sentry 2026-05-02 (issues JAVASCRIPT-NEXTJS-7T/7V/7S, 4 events sur
-- `/api/cron/purge-rgpd`, 100% failure depuis 9h).
--
-- Erreurs observées :
--   - "Could not find the function public.find_inactive_users(retention_days)
--     in the schema cache"
--   - "Could not find the function public.purge_audit_logs(retention_days)
--     in the schema cache"
--
-- Constat :
--   - La mig 475 (`475_rgpd_purge_functions.sql`) crée les 2 fonctions avec
--     SECURITY DEFINER + search_path pinné + grants service_role.
--   - Le repo est aligné depuis 2026-04-25 (audit 10-agents).
--   - Mais en prod elles n'existent pas, preuve que la mig 475 n'a jamais été
--     appliquée.
--   - Conséquence légale : l'engagement de purge sur /confidentialite (1 an
--     audit_logs, 3 ans comptes inactifs) n'est pas tenu — risque CNIL.
--
-- Fix :
--   On rejoue les 2 définitions sous une nouvelle mig pour garantir leur
--   application + tracking dans `supabase_migrations`. `CREATE OR REPLACE`
--   reste idempotent. Définitions copiées 1:1 depuis mig 475 — toute évolution
--   doit modifier mig 475 ET cette mig (ou créer une nouvelle replay).
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. purge_audit_logs(retention_days int) → int
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purge_audit_logs(retention_days integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $func$
DECLARE
  _deleted integer;
BEGIN
  IF retention_days IS NULL OR retention_days < 30 THEN
    RAISE EXCEPTION 'retention_days must be >= 30 (got %)', retention_days
      USING ERRCODE = 'check_violation';
  END IF;

  WITH _del AS (
    DELETE FROM public.audit_logs
    WHERE created_at < NOW() - make_interval(days => retention_days)
    RETURNING 1
  )
  SELECT COUNT(*)::integer INTO _deleted FROM _del;

  RETURN _deleted;
END;
$func$;

REVOKE ALL ON FUNCTION public.purge_audit_logs(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_audit_logs(integer) TO service_role;

COMMENT ON FUNCTION public.purge_audit_logs(integer) IS
  'RGPD article 5.1.e : purge audit_logs older than retention_days. Replay mig 475 (Sentry 2026-05-02).';

-- ----------------------------------------------------------------------------
-- 2. find_inactive_users(retention_days int) → setof uuid
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.find_inactive_users(retention_days integer)
RETURNS TABLE (user_id uuid, last_sign_in_at timestamptz, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $func$
BEGIN
  IF retention_days IS NULL OR retention_days < 365 THEN
    RAISE EXCEPTION 'retention_days must be >= 365 (got %)', retention_days
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.last_sign_in_at,
    u.created_at
  FROM auth.users u
  WHERE
    u.created_at < NOW() - make_interval(days => retention_days)
    AND (
      u.last_sign_in_at IS NULL
      OR u.last_sign_in_at < NOW() - make_interval(days => retention_days)
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = u.id AND p.is_admin = true
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.providers pr
      WHERE pr.user_id = u.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.devis_requests dr
      WHERE dr.client_id = u.id
        AND dr.created_at >= NOW() - make_interval(days => retention_days)
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.client_id = u.id
        AND b.created_at >= NOW() - make_interval(days => retention_days)
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.deletion_requests dq
      WHERE dq.user_id = u.id
        AND dq.status = 'scheduled'
    )
  ORDER BY u.created_at ASC
  LIMIT 1000;
END;
$func$;

REVOKE ALL ON FUNCTION public.find_inactive_users(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_inactive_users(integer) TO service_role;

COMMENT ON FUNCTION public.find_inactive_users(integer) IS
  'RGPD article 5.1.e : candidats à suppression (no login + old account). Replay mig 475 (Sentry 2026-05-02).';

NOTIFY pgrst, 'reload schema';
