-- Migration 468: Bulk harden SECURITY DEFINER functions — SET search_path
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Migration 467 fixed 3 critical functions (is_admin, create_booking_atomic,
-- get_artisan_stats_v2). Audit 2026-04-21 identified ~40 other SECURITY DEFINER
-- functions in public schema without a pinned `search_path` — same CVE-2018-1058
-- class exposure.
--
-- STRATEGY
-- --------
-- Iterate pg_proc, detect SECURITY DEFINER functions in schema `public` that
-- do NOT already have `search_path` in `proconfig`, and ALTER them to pin
-- `search_path = public, pg_catalog`. No-op on functions already hardened,
-- no-op on functions in other schemas, no-op on non-SECURITY DEFINER.
--
-- Fully idempotent. Produces a NOTICE listing the count altered.
--
-- NOTE
-- ----
-- Functions like `is_admin()` already altered by 467 have search_path in
-- proconfig → skipped by this migration.
--
-- IMPORTANT
-- ---------
-- If any function legitimately needs a different search_path (e.g. accesses
-- an extension schema like `extensions` or `vault`), add it to the EXCLUDE
-- list below BEFORE applying this migration.

BEGIN;

DO $$
DECLARE
  fn RECORD;
  altered_count INT := 0;
  excluded CONSTANT TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOR fn IN
    SELECT
      p.oid,
      p.oid::regprocedure AS sig,
      p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.proconfig, ARRAY[]::TEXT[])) AS cfg
        WHERE cfg LIKE 'search_path=%'
      )
      AND NOT (p.proname = ANY(excluded))
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_catalog', fn.sig);
    altered_count := altered_count + 1;
    RAISE NOTICE 'Hardened %', fn.sig;
  END LOOP;

  RAISE NOTICE 'Migration 468 : % SECURITY DEFINER function(s) hardened.', altered_count;
END;
$$ LANGUAGE plpgsql;

COMMIT;
