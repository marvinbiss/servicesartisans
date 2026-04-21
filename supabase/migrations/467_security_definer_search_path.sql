-- Migration 467: SECURITY DEFINER hardening — SET search_path = public
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Several functions are declared `SECURITY DEFINER` (run with the owner's
-- privileges) without a pinned `search_path`. This is a known Postgres
-- privilege-escalation vector : an attacker able to create objects in a
-- schema earlier in the search_path (e.g. via a temp schema or injected
-- CREATE rights) can shadow tables the function references and have the
-- function operate on the attacker-controlled object, running with owner
-- rights. CVE-2018-1058 class.
--
-- SCOPE
-- -----
-- This migration pins `search_path = public, pg_catalog` on the functions
-- that are (a) SECURITY DEFINER and (b) either callable by authenticated
-- users OR invoked from RLS policies. Functions used exclusively by
-- service_role (cron RPCs) are lower risk but still worth hardening; we
-- handle them in a follow-up to keep blast radius controllable.
--
-- Functions hardened here :
--   * is_admin()                                     (migration 001)
--     → invoked in every RLS policy. Highest blast radius.
--   * create_booking_atomic(...)                     (migration 019)
--     → callable by authenticated, writes to bookings.
--   * get_artisan_stats_v2(...)                      (migration 020)
--     → read-path invoked from the artisan dashboard.
--
-- If any of these signatures have drifted, ALTER FUNCTION will error on
-- the exact mismatch — safer than silent no-op. Wrap each in a DO block so
-- missing functions (e.g. after a rename) skip instead of aborting the
-- whole migration.

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_admin' AND p.pronargs = 0
  ) THEN
    EXECUTE 'ALTER FUNCTION public.is_admin() SET search_path = public, pg_catalog';
  END IF;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  fn_oid OID;
BEGIN
  SELECT p.oid INTO fn_oid
  FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.proname = 'create_booking_atomic'
  LIMIT 1;

  IF fn_oid IS NOT NULL THEN
    EXECUTE format(
      'ALTER FUNCTION %s SET search_path = public, pg_catalog',
      fn_oid::regprocedure
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  fn_oid OID;
BEGIN
  SELECT p.oid INTO fn_oid
  FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.proname = 'get_artisan_stats_v2'
  LIMIT 1;

  IF fn_oid IS NOT NULL THEN
    EXECUTE format(
      'ALTER FUNCTION %s SET search_path = public, pg_catalog',
      fn_oid::regprocedure
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- Follow-up required (separate migration, after staging validation) :
--   dispatch_lead, rge_apply_staging_atomic, cleanup_rate_limits, and all
--   cron-only SECURITY DEFINER functions identified in audit 2026-04-21.
