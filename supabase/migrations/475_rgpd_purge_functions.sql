-- ============================================================================
-- Migration 475 — RGPD purge functions (audit_logs + inactive users)
-- ============================================================================
--
-- Audit 2026-04-25 (agent #10 conformité — HIGH article 5.1.e RGPD).
--
-- /confidentialite annonce des rétentions de 1 an pour audit_logs et 3 ans
-- pour les comptes inactifs, mais aucun cron n'exécutait ces purges. Ces
-- 2 RPC sont appelées quotidiennement par /api/cron/purge-rgpd avec des
-- `retention_days` configurables via env.
--
-- Sécurité :
--   - SECURITY DEFINER : nécessaire pour DELETE sur audit_logs (RLS strict).
--   - search_path pinned (CVE-2018-1058).
--   - Granted EXECUTE uniquement à `service_role` (cron Vercel).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. purge_audit_logs(retention_days int) → int
-- ----------------------------------------------------------------------------
-- Supprime tous les audit_logs.created_at < NOW() - retention_days.
-- Retourne le nombre de lignes supprimées.

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
  'RGPD article 5.1.e : purge audit_logs older than retention_days. Called by /api/cron/purge-rgpd.';

-- ----------------------------------------------------------------------------
-- 2. find_inactive_users(retention_days int) → setof uuid
-- ----------------------------------------------------------------------------
-- Retourne les user IDs candidats à la suppression : aucun login depuis
-- `retention_days` jours ET compte créé il y a au moins `retention_days`.
-- La suppression effective passe par le cron qui appelle
-- `supabase.auth.admin.deleteUser(id)` (service_role) pour propager
-- correctement la cascade auth.users → profiles → tables liées.

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
    -- Compte créé il y a longtemps (sinon on supprime un signup neuf qui n'a
    -- pas eu le temps de se connecter)
    u.created_at < NOW() - make_interval(days => retention_days)
    AND (
      -- Jamais connecté
      u.last_sign_in_at IS NULL
      -- OU dernière connexion il y a plus de retention_days
      OR u.last_sign_in_at < NOW() - make_interval(days => retention_days)
    )
    -- Ne jamais supprimer les admins (sécurité)
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = u.id AND p.is_admin = true
    )
    -- Ne jamais supprimer les artisans qui ont revendiqué une fiche
    AND NOT EXISTS (
      SELECT 1 FROM public.providers pr
      WHERE pr.user_id = u.id
    )
    -- Ne jamais supprimer les clients ayant soumis un devis dans la fenêtre
    -- de rétention (sinon perte historique CRM + lead Pipedrive orphelin).
    -- F-bis : un user peut avoir 5 devis sur 4 ans sans s'être jamais connecté
    -- (parcours rappel téléphonique) → pas inactif, garder.
    AND NOT EXISTS (
      SELECT 1 FROM public.devis_requests dr
      WHERE dr.client_id = u.id
        AND dr.created_at >= NOW() - make_interval(days => retention_days)
    )
    -- Ne jamais supprimer les clients ayant un booking dans la fenêtre.
    -- F-ter : public.reviews n'a pas de colonne user_id/client_id (schéma
    -- booking-centric via reviews.booking_id → bookings.client_id, ou
    -- provider-centric via author_name sans user). Le guard bookings
    -- couvre déjà le cas booking-centric : une review récente implique un
    -- booking récent (review.created_at ≥ booking.created_at en pratique).
    -- Les reviews provider-centric (author_name texte libre) ne sont pas
    -- attachables à un user_id, donc sans implication ici.
    AND NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.client_id = u.id
        AND b.created_at >= NOW() - make_interval(days => retention_days)
    )
    -- F-ter : ne jamais supprimer un user dont une suppression RGPD est déjà
    -- programmée par /api/gdpr/delete (status='scheduled'). Évite que les
    -- deux crons (process-gdpr-deletions @04:00 et purge-rgpd @05:00) se
    -- marchent dessus pendant la fenêtre de grâce de 30 jours.
    AND NOT EXISTS (
      SELECT 1 FROM public.deletion_requests dq
      WHERE dq.user_id = u.id
        AND dq.status = 'scheduled'
    )
  ORDER BY u.created_at ASC
  LIMIT 1000;  -- Cap à 1000/run pour éviter un purge massif accidentel.
END;
$func$;

REVOKE ALL ON FUNCTION public.find_inactive_users(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_inactive_users(integer) TO service_role;

COMMENT ON FUNCTION public.find_inactive_users(integer) IS
  'RGPD article 5.1.e : find user IDs candidates for deletion (no login + old account). Excludes admins + claimed artisans. Capped at 1000/run.';
