-- Migration 433: Security patches CEE 424-432 (PR1 hardening)
-- Date 2026-04-14
-- Plan V3 PR1 — corrige findings SECURITY_AUDIT_424_432.md
-- Dépend: 428 (cee_mandats), 430 (mv_cee_partners_tam), 431 (cee_dossiers, cee_dossier_events, mv_cee_dossiers_stats)

BEGIN;

-- ---------------------------------------------------------------------------
-- C1 — cee_mandats: policy artisan self_read (CRITICAL)
-- Un artisan doit pouvoir lire ses propres mandats signés (UX espace-artisan/cee)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS cee_mandats_artisan_self_read ON public.cee_mandats;
CREATE POLICY cee_mandats_artisan_self_read ON public.cee_mandats
  FOR SELECT TO authenticated
  USING (
    lead_id IN (
      SELECT cl.id
      FROM public.cee_leads cl
      WHERE cl.artisan_id IN (
        SELECT p.id FROM public.providers p WHERE p.user_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- H1 — cee_dossiers: retirer admin bypass dans trigger transition (HIGH)
-- Zéro transition illégale, y compris pour admin.
-- Override légitime = RPC SECURITY DEFINER auditée (hors scope PR1).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_dossiers_check_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  allowed boolean := false;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  allowed := CASE OLD.status
    WHEN 'draft'                 THEN NEW.status IN ('submitted_by_artisan','archived')
    WHEN 'submitted_by_artisan'  THEN NEW.status IN ('qa_pending','qa_rejected','archived')
    WHEN 'qa_pending'            THEN NEW.status IN ('qa_approved','qa_rejected')
    WHEN 'qa_rejected'           THEN NEW.status IN ('submitted_by_artisan','archived')
    WHEN 'qa_approved'           THEN NEW.status IN ('deposited','archived')
    WHEN 'deposited'             THEN NEW.status IN ('validated_pncee','rejected_pncee')
    WHEN 'rejected_pncee'        THEN NEW.status IN ('archived')
    WHEN 'validated_pncee'       THEN NEW.status IN ('paid_client','archived')
    WHEN 'paid_client'           THEN NEW.status IN ('commission_due')
    WHEN 'commission_due'        THEN NEW.status IN ('commission_paid')
    WHEN 'commission_paid'       THEN NEW.status IN ('archived')
    ELSE false
  END;

  IF NOT allowed THEN
    RAISE EXCEPTION 'Illegal cee_dossiers status transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- H2 — cee_dossier_events: append-only (HIGH)
-- Audit trail immuable. UPDATE/DELETE interdits même pour admin.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS cee_dossier_events_admin_all ON public.cee_dossier_events;

-- Lecture admin seulement
CREATE POLICY cee_dossier_events_admin_read ON public.cee_dossier_events
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- INSERT admin (écriture via service_role reste libre car RLS bypass)
CREATE POLICY cee_dossier_events_admin_insert ON public.cee_dossier_events
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Trigger append-only (bloque UPDATE + DELETE, même service_role)
CREATE OR REPLACE FUNCTION public.cee_dossier_events_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'cee_dossier_events is append-only (operation: %)', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

DROP TRIGGER IF EXISTS trg_cee_dossier_events_no_update ON public.cee_dossier_events;
CREATE TRIGGER trg_cee_dossier_events_no_update
  BEFORE UPDATE ON public.cee_dossier_events
  FOR EACH ROW EXECUTE FUNCTION public.cee_dossier_events_append_only();

DROP TRIGGER IF EXISTS trg_cee_dossier_events_no_delete ON public.cee_dossier_events;
CREATE TRIGGER trg_cee_dossier_events_no_delete
  BEFORE DELETE ON public.cee_dossier_events
  FOR EACH ROW EXECUTE FUNCTION public.cee_dossier_events_append_only();

-- ---------------------------------------------------------------------------
-- H3 — mv_cee_partners_tam: REVOKE PII exposure (HIGH)
-- MV contient email/phone/siret. MVs ignorent RLS → REVOKE tout accès non service_role.
-- ---------------------------------------------------------------------------
REVOKE ALL ON public.mv_cee_partners_tam FROM PUBLIC;
REVOKE ALL ON public.mv_cee_partners_tam FROM authenticated;
REVOKE ALL ON public.mv_cee_partners_tam FROM anon;
GRANT  SELECT ON public.mv_cee_partners_tam TO service_role;

-- ---------------------------------------------------------------------------
-- M1 — mv_cee_dossiers_stats: restreindre agrégats cross-tenant (MEDIUM)
-- ---------------------------------------------------------------------------
REVOKE ALL ON public.mv_cee_dossiers_stats FROM PUBLIC;
REVOKE ALL ON public.mv_cee_dossiers_stats FROM authenticated;
REVOKE ALL ON public.mv_cee_dossiers_stats FROM anon;
GRANT  SELECT ON public.mv_cee_dossiers_stats TO service_role;

-- ---------------------------------------------------------------------------
-- M2/M3 — Fonctions purge RGPD (MEDIUM)
-- À invoquer par cron Vercel (Pro plan, wrappers dans /api/cron/cee-purge-*).
-- SECURITY DEFINER → exécute avec owner, bypasse RLS pour purge globale.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_purge_email_outbox_dead()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.email_outbox_cee
  WHERE status = 'dead'
    AND dead_letter_at IS NOT NULL
    AND dead_letter_at < now() - interval '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
REVOKE ALL ON FUNCTION public.cee_purge_email_outbox_dead() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_purge_email_outbox_dead() TO service_role;

CREATE OR REPLACE FUNCTION public.cee_purge_expired_rgpd()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  c_dossiers   integer := 0;
  c_leads      integer := 0;
  c_simulator  integer := 0;
  c_mandats    integer := 0;
BEGIN
  DELETE FROM public.cee_dossiers
  WHERE expires_at IS NOT NULL AND expires_at < now()
    AND status IN ('archived','rejected_pncee');
  GET DIAGNOSTICS c_dossiers = ROW_COUNT;

  DELETE FROM public.cee_mandats
  WHERE expires_at IS NOT NULL AND expires_at < now();
  GET DIAGNOSTICS c_mandats = ROW_COUNT;

  DELETE FROM public.cee_leads
  WHERE expires_at IS NOT NULL AND expires_at < now();
  GET DIAGNOSTICS c_leads = ROW_COUNT;

  DELETE FROM public.cee_simulator_events
  WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS c_simulator = ROW_COUNT;

  RETURN jsonb_build_object(
    'dossiers_deleted',   c_dossiers,
    'mandats_deleted',    c_mandats,
    'leads_deleted',      c_leads,
    'simulator_deleted',  c_simulator,
    'purged_at',          now()
  );
END;
$$;
REVOKE ALL ON FUNCTION public.cee_purge_expired_rgpd() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_purge_expired_rgpd() TO service_role;

COMMENT ON FUNCTION public.cee_purge_email_outbox_dead() IS 'RGPD M2: purge email DLQ dead >30j. Invoquer via cron hebdo.';
COMMENT ON FUNCTION public.cee_purge_expired_rgpd()     IS 'RGPD M3: purge dossiers/mandats/leads/simulator_events expirés. Invoquer via cron mensuel.';

COMMIT;
