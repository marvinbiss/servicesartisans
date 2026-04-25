-- Rollback for migration 474_rename_profiles_phone_to_phone_e164.sql
-- =============================================================================
-- WHEN TO USE
-- -----------
-- Apply this if migration 474 (rename phone -> phone_e164) caused a regression
-- in production AND the application is being rolled back to a deploy from
-- BEFORE Apr 25 2026 that referenced `phone` instead of `phone_e164`.
--
-- DO NOT APPLY this rollback unless the application code is also reverted —
-- otherwise auth/signup, admin/utilisateurs, gdpr-service, bookings-service,
-- 5 crons, review-service and vapi/webhook will all start failing with 42703
-- "column phone_e164 does not exist".
--
-- IDEMPOTENT — safe to re-run, no-op if already rolled back.

BEGIN;

DO $rb474$
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

  IF v_has_phone_e164 AND NOT v_has_phone THEN
    ALTER TABLE public.profiles RENAME COLUMN phone_e164 TO phone;
    RAISE NOTICE 'Rollback 474 : renamed public.profiles.phone_e164 -> phone';
  ELSIF v_has_phone THEN
    RAISE NOTICE 'Rollback 474 : no-op (phone already exists)';
  ELSE
    RAISE WARNING 'Rollback 474 : neither column found — diverged schema';
  END IF;
END
$rb474$ LANGUAGE plpgsql;

COMMIT;

-- Force PostgREST schema reload so /rest/v1/profiles?select=phone works again
NOTIFY pgrst, 'reload schema';
