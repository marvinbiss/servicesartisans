-- =============================================================================
-- Migration 379: Restrict public RLS policy on profiles (security P0)
-- ServicesArtisans — 2026-04-08
-- =============================================================================
-- Context:
--   Migration 101_v2_rls_policies.sql lines 44-46 created a policy
--   "Public can view basic profile info" USING (TRUE) which exposes ALL rows
--   AND ALL columns of `profiles` to anonymous users via the Supabase anon key.
--
--   This leaked: email, phone, phone_e164, stripe_customer_id, subscription_*,
--   is_admin, role — a serious RGPD incident.
--
-- Fix:
--   Drop the permissive policy and replace with a policy that only exposes rows
--   where user_type = 'artisan'. Client profiles become inaccessible to
--   anonymous users. Authenticated owners still see their own via
--   "Users can view own profile"; admins via "Admins can view all profiles".
--
--   Column-level protection remains enforced at the application layer: public
--   code paths MUST explicitly SELECT only safe columns. As of 2026-04-08, no
--   public route queries `profiles` directly (grep audit done).
-- =============================================================================

DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;

CREATE POLICY "Public can view artisan profiles" ON profiles
  FOR SELECT
  USING (user_type = 'artisan');

COMMENT ON POLICY "Public can view artisan profiles" ON profiles IS
  'Security fix 2026-04-08: replaces the USING (TRUE) policy from migration 101. '
  'Only rows where user_type = ''artisan'' are visible to anonymous users. '
  'Column-level safety enforced at the application layer via explicit SELECT lists.';
