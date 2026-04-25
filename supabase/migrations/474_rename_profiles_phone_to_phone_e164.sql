-- Migration 474: Restore profiles.phone_e164 column name
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Sentry 2026-04-21 (135 + 160 + N events) : crons send-review-requests,
-- send-reminders, send-reminders-1h, /api/reviews et review-service all crash
-- avec PostgREST 42703 "column profiles_1.phone_e164 does not exist".
--
-- Diagnostic SQL prod (information_schema) : la colonne s'appelle `phone`
-- alors que migration 001 + ~15 fichiers code attendent `phone_e164`.
-- Origine du drift : rename hors-Git (probable manuel via Supabase dashboard
-- ou migration purgée). Aucune migration tracée n'a fait ce rename.
--
-- DECISION
-- --------
-- Restaurer le nom historique `phone_e164` plutot que de patcher 15 fichiers
-- (auth/signup, admin/utilisateurs, gdpr-service, bookings-service, crons,
-- review-service, vapi/webhook, etc.). Reversible trivialement.
--
-- IDEMPOTENT
-- ----------
-- - No-op si phone_e164 existe deja (rerun safe).
-- - No-op si phone a deja ete drop (rare).
-- - Force PostgREST schema reload pour eviter cache stale.

BEGIN;

DO $mig474$
DECLARE
  v_has_phone     BOOLEAN;
  v_has_phone_e164 BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'phone'
  ) INTO v_has_phone;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'phone_e164'
  ) INTO v_has_phone_e164;

  IF v_has_phone AND NOT v_has_phone_e164 THEN
    ALTER TABLE public.profiles RENAME COLUMN phone TO phone_e164;
    RAISE NOTICE 'Migration 474 : renamed public.profiles.phone -> phone_e164';
  ELSIF v_has_phone_e164 THEN
    RAISE NOTICE 'Migration 474 : no-op (phone_e164 already exists)';
  ELSE
    RAISE WARNING 'Migration 474 : neither phone nor phone_e164 found on public.profiles — schema diverged further than expected';
  END IF;
END
$mig474$ LANGUAGE plpgsql;

COMMIT;

-- Force PostgREST to reload its schema cache so embedded resource queries
-- (`client:profiles!client_id(...phone_e164)`) pick up the new column name
-- immediately. Without this, the API can serve stale schema for ~10 minutes.
NOTIFY pgrst, 'reload schema';
