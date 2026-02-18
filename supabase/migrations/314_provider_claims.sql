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
