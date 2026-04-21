-- Migration 465: Tighten profiles RLS — remove `USING (TRUE)` public read
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Migration 101 created the policy "Public can view basic profile info" with
-- `USING (TRUE)` to allow displaying artisan names in reviews, but this exposes
-- the ENTIRE profiles table to anon: email, phone_e164, role, is_admin, etc.
-- Any `anon` client can `SELECT * FROM profiles` and harvest 50K+ contacts.
--
-- FIX
-- ---
-- 1. Drop the permissive policy.
-- 2. Replace with a narrow policy that only exposes artisan rows (not admin/client
--    profiles), still without column-level filtering at the RLS layer.
-- 3. Expose a safe public VIEW `artisans_public` limited to display columns
--    (id, full_name, average_rating, review_count). Grant SELECT on the VIEW
--    to anon. Callers should migrate from `.from('profiles')` to
--    `.from('artisans_public')`.
-- 4. REVOKE table-level SELECT from anon on profiles (keep for authenticated).
--
-- IDEMPOTENT: uses CREATE OR REPLACE for VIEW, DROP POLICY IF EXISTS.
--
-- ⚠️ REVIEW REQUIRED BEFORE APPLY
-- --------------------------------
-- Audit code paths that call `supabase.from('profiles')` with the anon key:
--   grep -rn "from('profiles')" src/ | grep -v "admin\|server-only"
-- Migrate those callers to `from('artisans_public')` BEFORE applying this
-- migration in prod, otherwise public pages listing artisan names will break.

BEGIN;

-- 1. Drop the permissive policy
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;

-- 2. Create a narrow replacement — only artisan rows, still visible row-level
CREATE POLICY "Public can view artisan profiles" ON profiles
  FOR SELECT
  TO anon
  USING (user_type = 'artisan');

-- 3. Create the safe public VIEW
CREATE OR REPLACE VIEW public.artisans_public
WITH (security_invoker = true) AS
  SELECT
    id,
    full_name,
    average_rating,
    review_count
  FROM profiles
  WHERE user_type = 'artisan';

GRANT SELECT ON public.artisans_public TO anon, authenticated;

COMMENT ON VIEW public.artisans_public IS
  'Safe public projection of profiles for artisan display. Anon reads should use this instead of profiles.';

COMMIT;
