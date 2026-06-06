-- Migration 544: Fix trigger cee_dossiers — INSERT bloqué depuis mig 431
-- Date 2026-06-06
--
-- Root cause : mig 431 attache trg_cee_dossiers_status_transition en
-- `BEFORE INSERT OR UPDATE OF status`, mais la fonction (433 puis 437)
-- suppose un UPDATE et lit OLD. Sur INSERT, OLD est NULL →
-- `OLD.status = NEW.status` est NULL (pas TRUE) → CASE OLD.status tombe en
-- ELSE false → exception « Illegal cee_dossiers status transition: <NULL> ->
-- draft ». TOUT INSERT dans cee_dossiers était donc impossible — troisième
-- verrou du tunnel CEE (avec les référentiels vides mig 543 et le payload
-- formulaire incompatible).
--
-- Fix : la fonction gère TG_OP = 'INSERT' explicitement :
--   - ownership partner_id conservé (s'applique aussi à l'INSERT) ;
--   - état d'entrée de la state-machine : seul 'draft' est accepté à
--     l'INSERT (y compris pour service_role — aucune raison légitime de
--     naître ailleurs que draft) ;
--   - logique UPDATE inchangée (transitions 437, zéro bypass admin).

BEGIN;

CREATE OR REPLACE FUNCTION public.cee_dossiers_check_status_transition()
RETURNS trigger
LANGUAGE plpgsql
-- Pas SECURITY DEFINER : doit s'exécuter avec les droits du caller pour que
-- current_role reflète le rôle réel (service_role vs authenticated).
SET search_path = public, pg_catalog
AS $$
DECLARE
  allowed           boolean := false;
  caller_role       text;
  is_service_role   boolean;
BEGIN
  -- ------------------------------------------------------------------
  -- Ownership check : NEW.partner_id doit appartenir à auth.uid()
  -- sauf si l'appelant est service_role (backend, cron, webhook).
  -- Voir note sécurité CWE-284 dans mig 437 : current_setting('role')
  -- reflète la connexion Postgres, pas le claim JWT.
  -- ------------------------------------------------------------------
  caller_role     := current_setting('role', true);
  is_service_role := (caller_role = 'service_role');

  IF NOT is_service_role AND NEW.partner_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM   public.cee_artisan_partners cap
      WHERE  cap.id      = NEW.partner_id
        AND  cap.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION
        'cee_dossiers: partner_id % does not belong to current user',
        NEW.partner_id
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  -- ------------------------------------------------------------------
  -- INSERT : état d'entrée de la state-machine = draft, point final.
  -- (Mig 431 attache le trigger en BEFORE INSERT OR UPDATE OF status ;
  --  les versions 433/437 de cette fonction lisaient OLD sur INSERT →
  --  exception systématique. Corrigé ici.)
  -- ------------------------------------------------------------------
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'draft' THEN
      RAISE EXCEPTION
        'cee_dossiers: INSERT must start at status draft (got %)',
        NEW.status
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  -- ------------------------------------------------------------------
  -- UPDATE : state-machine de transition (inchangée — 437, zéro bypass)
  -- ------------------------------------------------------------------
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  allowed := CASE OLD.status
    WHEN 'draft'                THEN NEW.status IN ('submitted_by_artisan', 'archived')
    WHEN 'submitted_by_artisan' THEN NEW.status IN ('qa_pending', 'qa_rejected', 'archived')
    WHEN 'qa_pending'           THEN NEW.status IN ('qa_approved', 'qa_rejected')
    WHEN 'qa_rejected'          THEN NEW.status IN ('submitted_by_artisan', 'archived')
    WHEN 'qa_approved'          THEN NEW.status IN ('deposited', 'archived')
    WHEN 'deposited'            THEN NEW.status IN ('validated_pncee', 'rejected_pncee')
    WHEN 'rejected_pncee'       THEN NEW.status IN ('archived')
    WHEN 'validated_pncee'      THEN NEW.status IN ('paid_client', 'archived')
    WHEN 'paid_client'          THEN NEW.status IN ('commission_due')
    WHEN 'commission_due'       THEN NEW.status IN ('commission_paid')
    WHEN 'commission_paid'      THEN NEW.status IN ('archived')
    ELSE false
  END;

  IF NOT allowed THEN
    RAISE EXCEPTION
      'Illegal cee_dossiers status transition: % -> %',
      OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.cee_dossiers_check_status_transition() IS
  'Trigger BEFORE INSERT OR UPDATE OF status sur cee_dossiers. '
  'Trois gardes : '
  '(1) partner_id ownership — NEW.partner_id doit appartenir à auth.uid() '
  'sauf si current_role = service_role (CWE-284). '
  '(2) INSERT : seul le statut draft est accepté (entrée de state-machine). '
  '(3) UPDATE : transitions illégales rejetées sans exception admin (H1 mig 433).';

COMMIT;
