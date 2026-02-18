-- Migration 314: Provider claiming system
-- Adds columns to track when/how a provider page was claimed,
-- and a table to manage claim requests with admin validation.

-- Claiming columns on providers
ALTER TABLE providers ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES profiles(id);

-- Table for claim requests (admin validation workflow)
CREATE TABLE IF NOT EXISTS provider_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  siret_provided TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_claims_status ON provider_claims(status);
CREATE INDEX IF NOT EXISTS idx_provider_claims_provider ON provider_claims(provider_id);
CREATE INDEX IF NOT EXISTS idx_providers_claimed ON providers(claimed_by) WHERE claimed_at IS NOT NULL;

-- Enable RLS
ALTER TABLE provider_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY provider_claims_select_own ON provider_claims
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert a claim for themselves only
CREATE POLICY provider_claims_insert_own ON provider_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only service_role (admin) can update claims (approve/reject)
-- No UPDATE policy for authenticated users — admin API uses service_role client

-- Admins (via profiles.is_admin or role) can read all claims
CREATE POLICY provider_claims_select_admin ON provider_claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role IN ('super_admin', 'admin'))
    )
  );
