-- =============================================================================
-- Migration 327: Add 'artisan' and 'client' to profiles.role CHECK constraint
-- ServicesArtisans — 2026-02-21
-- =============================================================================
-- Migration 309 defined the CHECK without 'artisan' and 'client', blocking all
-- artisan and client access when these role values are written to the column.
-- =============================================================================

-- Drop the auto-generated constraint (name varies — try both common names)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_role_check;

-- Add corrected constraint allowing all valid roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IS NULL OR role IN ('super_admin', 'admin', 'moderator', 'viewer', 'artisan', 'client'));
