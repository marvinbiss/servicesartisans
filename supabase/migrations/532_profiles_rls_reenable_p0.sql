-- =============================================================================
-- Migration 532: RE-ENABLE RLS on `profiles` — P0 RGPD live leak
-- ServicesArtisans — 2026-06-04  (supersedes 531, which rolled back)
-- =============================================================================
-- ROOT CAUSE (confirmed via live PostgREST probe with the anon key)
-- ------------------------------------------------------------------
--   GET /rest/v1/profiles?select=*  → returned rows with role='client' AND
--   role='super_admin' (admin emails: marvin.bissohong@yeoskin.com,
--   contact@servicesartisans.fr), is_admin=true, etc.
--
--   The ONLY public SELECT policy was USING (user_type = 'artisan'). Those
--   non-artisan rows could NOT pass it — yet they were returned. Conclusion:
--   ROW LEVEL SECURITY IS DISABLED on public.profiles. It was dropped by the
--   "Project restart failed Feb 13, 2026" drift; migration 472 re-enabled RLS
--   on ~26 tables but `profiles` was NOT in its list. Every profiles policy
--   (mig 101/320/327/328/379/465) has been dead since then.
--
--   Migration 531 only did DROP POLICY + REVOKE FROM anon and gated COMMIT on
--   a `has_table_privilege('anon',...)` check. anon retains the grant via the
--   PUBLIC role, so the check failed → RAISE EXCEPTION → full ROLLBACK
--   (that is why artisans_public was absent and the leak persisted).
--
-- FIX
-- ---
--   1. Re-create is_admin() with a pinned search_path (CVE-2018-1058 +
--      CLAUDE.md rule). SECURITY DEFINER, owner bypasses RLS → no recursion.
--   2. ENABLE ROW LEVEL SECURITY on profiles. NOT `FORCE`: with FORCE the
--      table owner is also subject to RLS, which would make the SECURITY
--      DEFINER is_admin() re-enter RLS and recurse. ENABLE = owner/definer
--      bypass, anon/authenticated enforced, service_role (BYPASSRLS) bypass.
--   3. Drop the whole permissive policy soup, including
--      "Authenticated users can view profiles" (mig 320) which let ANY logged-in
--      user read every profile's PII — a second leak.
--   4. Clean minimal policy set: own-row SELECT/UPDATE + admin SELECT. No anon
--      policy: anon gets nothing. Cross-user reads already use createAdminClient
--      (RLS bypass); artisan names render from `providers`, not `profiles`.
--   5. REVOKE SELECT FROM anon and PUBLIC (defense in depth); re-GRANT to
--      authenticated + service_role explicitly so removing the PUBLIC grant
--      cannot starve them.
--   6. Safe public projection view `artisans_public` (SECURITY DEFINER).
--   7. Verify with RAISE NOTICE only — NO exception, so protections COMMIT
--      regardless. Final proof is the external anon curl probe.
--
-- IDEMPOTENT. Safe to re-run.
-- =============================================================================

BEGIN;

-- 1. Admin-check helper (pinned search_path, definer bypasses RLS).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_catalog;

-- 2. Turn RLS back on (the actual fix). No FORCE — see header.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop every permissive / overlapping SELECT policy accumulated over time.
DROP POLICY IF EXISTS "Public can view basic profile info"   ON public.profiles;
DROP POLICY IF EXISTS "Public can view artisan profiles"      ON public.profiles;
DROP POLICY IF EXISTS "Public can view artisan profiles only" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- 4. Clean minimal policy set.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 5. Privilege hygiene: anon/PUBLIC lose SELECT; authenticated + service_role
--    keep it explicitly (RLS still restricts authenticated to own+admin rows).
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.profiles FROM PUBLIC;
GRANT  SELECT, UPDATE ON public.profiles TO authenticated;
GRANT  SELECT ON public.profiles TO service_role;

-- 6. Safe public projection (display columns only, definer → needs no table grant).
-- NB: profiles has NO average_rating/review_count/user_type columns (DB truth
-- via anon probe). Artisan flag is `role = 'artisan'`. Display = full_name only.
DROP VIEW IF EXISTS public.artisans_public;
CREATE VIEW public.artisans_public
WITH (security_invoker = false) AS
  SELECT id, full_name
  FROM public.profiles
  WHERE role = 'artisan';
GRANT SELECT ON public.artisans_public TO anon, authenticated;

-- 7. Verify (NOTICE only — never rolls back the protections above).
DO $verify$
DECLARE
  v_rls BOOLEAN;
  v_anon BOOLEAN;
BEGIN
  SELECT relrowsecurity INTO v_rls
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'profiles';

  v_anon := has_table_privilege('anon', 'public.profiles', 'SELECT');

  RAISE NOTICE 'profiles RLS enabled = % (must be t)', v_rls;
  RAISE NOTICE 'anon has SELECT priv = % (should be f; RLS still blocks rows either way)', v_anon;

  IF v_rls IS NOT TRUE THEN
    RAISE WARNING 'RLS still OFF on profiles — investigate immediately';
  END IF;
END
$verify$;

COMMIT;

COMMENT ON TABLE public.profiles IS
  'PII table. RLS RE-ENABLED mig 532 (was OFF since Feb 13 restart drift). '
  'anon: no access. authenticated: own row + admin (is_admin()). Cross-user '
  'reads MUST use createAdminClient. Public artisan names → view artisans_public.';
