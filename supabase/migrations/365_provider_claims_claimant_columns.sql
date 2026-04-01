-- Add missing claimant columns to provider_claims
ALTER TABLE provider_claims ADD COLUMN IF NOT EXISTS claimant_name TEXT;
ALTER TABLE provider_claims ADD COLUMN IF NOT EXISTS claimant_email TEXT;
ALTER TABLE provider_claims ADD COLUMN IF NOT EXISTS claimant_phone TEXT;
ALTER TABLE provider_claims ADD COLUMN IF NOT EXISTS claimant_position TEXT;
