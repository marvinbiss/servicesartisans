-- Restrict anonymous access to profiles
-- Anonymous users should only see artisan profiles (not admin/client data)

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Authenticated users can see all profiles (needed for messaging, bookings, admin)
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Anonymous users can only see artisan profiles (for public artisan pages)
-- They CANNOT see admin profiles or client profiles
CREATE POLICY "Public can view artisan profiles only" ON profiles
  FOR SELECT USING (
    auth.uid() IS NULL
    AND role = 'artisan'
    AND is_admin = FALSE
  );
