-- ============================================================================
-- MIGRATION 520: audit_logs immutability (P1 security fix F-11)
-- ============================================================================
-- Contexte : audit_logs.UPDATE et audit_logs.DELETE étaient autorisés pour le
-- service role (RLS bypass), donc un super_admin compromis (ou un script
-- malveillant utilisant la SERVICE_ROLE_KEY) pouvait effacer ses propres
-- entrées d'audit après une action illicite. STRIDE/R = repudiation.
--
-- Fix : trigger BEFORE UPDATE/DELETE qui lève une exception. Le SELECT et
-- INSERT restent normaux (insert via service role, read via RLS admin).
--
-- Bypass légitime (rétention RGPD/purge) : exécuter en superuser dans une
-- session avec `SET LOCAL audit_logs.allow_purge = 'on'` avant DELETE.

CREATE OR REPLACE FUNCTION public.audit_logs_block_mutation()
RETURNS trigger AS $func$
BEGIN
  -- Échappatoire purge RGPD : session définit le flag avant DELETE.
  IF current_setting('audit_logs.allow_purge', true) = 'on' THEN
    RETURN COALESCE(OLD, NEW);
  END IF;

  RAISE EXCEPTION 'audit_logs is immutable (operation: %)', TG_OP
    USING ERRCODE = 'insufficient_privilege',
          HINT = 'audit_logs entries cannot be modified or deleted. For RGPD purge, set audit_logs.allow_purge=on in a superuser session.';
END;
$func$
LANGUAGE plpgsql
SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS audit_logs_prevent_update ON audit_logs;
CREATE TRIGGER audit_logs_prevent_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_logs_block_mutation();

DROP TRIGGER IF EXISTS audit_logs_prevent_delete ON audit_logs;
CREATE TRIGGER audit_logs_prevent_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_logs_block_mutation();

COMMENT ON FUNCTION public.audit_logs_block_mutation IS
  'Empêche UPDATE/DELETE sur audit_logs (immutabilité). Bypass purge RGPD via SET LOCAL audit_logs.allow_purge=on.';
