-- ============================================================================
-- MIGRATION: Fix audit_logs RLS policy
-- Description: The original policy referenced non-existent admin_users table
-- ============================================================================

-- Drop the incorrect policy
DROP POLICY IF EXISTS audit_logs_admin_read ON audit_logs;

-- Create corrected policy that references profiles table
CREATE POLICY audit_logs_admin_read ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = true OR role IN ('super_admin', 'admin', 'moderator'))
    )
  );

-- Also create INSERT policy for admin client (service role bypasses RLS anyway,
-- but good practice to have explicit policies)
CREATE POLICY audit_logs_admin_insert ON audit_logs
  FOR INSERT
  WITH CHECK (true);  -- Service role will bypass, but this allows explicit inserts
