-- =============================================================================
-- Migration 309: Add 'role' column to profiles table
-- ServicesArtisans — 2026-02-14
-- =============================================================================
-- The admin dashboard RBAC system expects a 'role' column on profiles.
-- Previously only 'is_admin' existed, causing admin auth to fail.
-- =============================================================================

-- Add role column with CHECK constraint
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT
  DEFAULT NULL
  CHECK (role IS NULL OR role IN ('super_admin', 'admin', 'moderator', 'viewer'));

-- Set role = 'super_admin' for existing admins
UPDATE profiles SET role = 'super_admin' WHERE is_admin = TRUE AND role IS NULL;

-- Add subscription-related columns (used by admin payments/subscriptions pages)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'gratuit'
  CHECK (subscription_plan IN ('gratuit', 'pro', 'premium'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL
  CHECK (subscription_status IS NULL OR subscription_status IN ('active', 'canceled', 'past_due', 'trialing'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL;

-- Index for admin lookups
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
