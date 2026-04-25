-- Migration 473: Pin search_path on ALL public/app functions (linter sweep)
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Supabase database linter (run 2026-04-25) flags ~100 functions in `public`
-- and `app` schemas with `function_search_path_mutable` (CVE-2018-1058 class).
-- Migrations 467/468 only covered SECURITY DEFINER functions in `public`.
-- This sweep pins search_path on every remaining function in both schemas,
-- including SECURITY INVOKER ones — the linter does not distinguish.
--
-- STRATEGY
-- --------
-- Iterate pg_proc for schemas (`public`, `app`), detect functions whose
-- proconfig does NOT contain a `search_path=` entry, and ALTER them to pin
-- `search_path = public, pg_catalog`. Idempotent — already-pinned functions
-- are skipped. Aggregates / window functions / procedures are excluded.
--
-- spatial_ref_sys RLS warning is a known PostGIS false positive — not addressed.
-- auth_leaked_password_protection is a Supabase Auth dashboard toggle.
--
-- SQL EDITOR NOTE
-- ---------------
-- Uses named dollar-quote tag $mig473$ to survive the Supabase SQL editor
-- (per project rule: no bare $$). Idempotent — safe to re-run.

BEGIN;

DO $mig473$
DECLARE
  fn RECORD;
  altered_count INT := 0;
BEGIN
  FOR fn IN
    SELECT
      p.oid::regprocedure AS sig,
      n.nspname            AS schema_name,
      p.proname            AS fn_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('public', 'app')
      AND p.prokind = 'f'
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(COALESCE(p.proconfig, ARRAY[]::TEXT[])) AS cfg
        WHERE cfg LIKE 'search_path=%'
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_catalog', fn.sig);
      altered_count := altered_count + 1;
      RAISE NOTICE 'Hardened %.%', fn.schema_name, fn.sig;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Skipped % : %', fn.sig, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Migration 473 : % function(s) hardened across public + app.', altered_count;
END;
$mig473$ LANGUAGE plpgsql;

COMMIT;
