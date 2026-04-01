-- Migration 369: Allow artisans to SELECT their own provider record
-- Without this, authenticated artisans cannot read their own profile
-- because the existing "Public can view active providers" policy
-- only applies to the anon role, not authenticated users.

-- Artisans can read their own provider
CREATE POLICY "Artisans can view own provider" ON providers
  FOR SELECT USING (user_id = auth.uid());

-- Also ensure authenticated users can still see active providers (listings)
-- The existing policy may only apply to anon role on some Supabase configs
DROP POLICY IF EXISTS "Public can view active providers" ON providers;
CREATE POLICY "Anyone can view active providers" ON providers
  FOR SELECT USING (is_active = true);
