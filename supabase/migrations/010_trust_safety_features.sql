-- ===========================================
-- Trust & Safety Features Migration
-- KYC, Disputes, Escrow, 2FA
-- ===========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- KYC Verification Tables
-- ===========================================

-- KYC Profiles
CREATE TABLE IF NOT EXISTS kyc_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  verification_level VARCHAR(20) DEFAULT 'none' CHECK (verification_level IN ('none', 'basic', 'standard', 'premium', 'enterprise')),
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  identity_verified BOOLEAN DEFAULT FALSE,
  insurance_verified BOOLEAN DEFAULT FALSE,
  certification_verified BOOLEAN DEFAULT FALSE,
  video_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KYC Documents
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('identity', 'insurance', 'certification', 'registration', 'address_proof')),
  file_url TEXT NOT NULL,
  document_number VARCHAR(100),
  issuing_authority VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Identity Verifications
CREATE TABLE IF NOT EXISTS identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_number VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality VARCHAR(50),
  expiry_date DATE,
  verification_method VARCHAR(50) DEFAULT 'automated',
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'manual_review')),
  confidence_score DECIMAL(5, 2),
  verification_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Insurance Verifications
CREATE TABLE IF NOT EXISTS insurance_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  policy_number VARCHAR(100) NOT NULL,
  insurer_name VARCHAR(255) NOT NULL,
  coverage_type VARCHAR(50) NOT NULL CHECK (coverage_type IN ('rc_pro', 'decennale', 'multirisque')),
  coverage_amount DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_valid BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(20) DEFAULT 'pending',
  verification_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Certification Verifications
CREATE TABLE IF NOT EXISTS certification_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  certification_type VARCHAR(100) NOT NULL,
  certification_name VARCHAR(255) NOT NULL,
  issuing_body VARCHAR(255) NOT NULL,
  certificate_number VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  is_valid BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(20) DEFAULT 'pending',
  verification_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Video Verification Sessions
CREATE TABLE IF NOT EXISTS video_verification_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Dispute Resolution Tables
-- ===========================================

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  artisan_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  mediator_id UUID REFERENCES profiles(id),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'quality_of_work', 'incomplete_work', 'pricing_issue', 'no_show',
    'communication', 'damage', 'delay', 'refund_request', 'other'
  )),
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  amount_disputed DECIMAL(10, 2),
  client_desired_outcome TEXT NOT NULL,
  evidence_urls TEXT[],
  status VARCHAR(30) DEFAULT 'opened' CHECK (status IN (
    'opened', 'under_review', 'artisan_responded', 'mediation',
    'resolved', 'escalated', 'closed'
  )),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  artisan_response TEXT,
  artisan_responded_at TIMESTAMPTZ,
  counter_proposal JSONB,
  mediation_started_at TIMESTAMPTZ,
  resolution JSONB,
  resolved_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispute Messages
CREATE TABLE IF NOT EXISTS dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'artisan', 'mediator', 'system')),
  message TEXT NOT NULL,
  attachments TEXT[],
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Escrow Tables
-- ===========================================

-- Escrow Transactions
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  artisan_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 500),
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  description TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'created' CHECK (status IN (
    'created', 'funded', 'in_progress', 'work_completed',
    'released', 'disputed', 'refunded', 'cancelled'
  )),
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  funded_at TIMESTAMPTZ,
  work_started_at TIMESTAMPTZ,
  work_completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  inspection_deadline TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  dispute_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escrow Milestones
CREATE TABLE IF NOT EXISTS escrow_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID REFERENCES escrow_transactions(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'approved', 'disputed')),
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Two-Factor Authentication Tables
-- ===========================================

-- 2FA Secrets
CREATE TABLE IF NOT EXISTS two_factor_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  encrypted_secret TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  enabled_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2FA Backup Codes
CREATE TABLE IF NOT EXISTS two_factor_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Fraud Detection Tables
-- ===========================================

-- Fraud Assessments
CREATE TABLE IF NOT EXISTS fraud_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assessment_type VARCHAR(50) NOT NULL CHECK (assessment_type IN ('review', 'payment', 'behavior', 'account')),
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  signals JSONB,
  action_taken VARCHAR(50),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Indexes for Performance
-- ===========================================

-- KYC indexes
CREATE INDEX IF NOT EXISTS idx_kyc_profiles_user ON kyc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_profiles_level ON kyc_profiles(verification_level);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_user ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_verifications_user ON insurance_verifications(user_id);

-- Dispute indexes
CREATE INDEX IF NOT EXISTS idx_disputes_client ON disputes(client_id);
CREATE INDEX IF NOT EXISTS idx_disputes_artisan ON disputes(artisan_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_booking ON disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute ON dispute_messages(dispute_id);

-- Escrow indexes
CREATE INDEX IF NOT EXISTS idx_escrow_client ON escrow_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_escrow_artisan ON escrow_transactions(artisan_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_booking ON escrow_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_escrow ON escrow_milestones(escrow_id);

-- 2FA indexes
CREATE INDEX IF NOT EXISTS idx_2fa_secrets_user ON two_factor_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_backup_codes_user ON two_factor_backup_codes(user_id);

-- Fraud indexes
CREATE INDEX IF NOT EXISTS idx_fraud_assessments_user ON fraud_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_assessments_type ON fraud_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_fraud_assessments_risk ON fraud_assessments(risk_level);

-- ===========================================
-- Row Level Security Policies
-- ===========================================

-- Enable RLS
ALTER TABLE kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_assessments ENABLE ROW LEVEL SECURITY;

-- KYC Policies
CREATE POLICY "Users can view own KYC profile" ON kyc_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC profile" ON kyc_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own documents" ON kyc_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON kyc_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Dispute Policies
CREATE POLICY "Users can view own disputes" ON disputes
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = artisan_id OR auth.uid() = mediator_id);

CREATE POLICY "Clients can create disputes" ON disputes
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Participants can update disputes" ON disputes
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = artisan_id OR auth.uid() = mediator_id);

CREATE POLICY "Participants can view dispute messages" ON dispute_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM disputes
      WHERE disputes.id = dispute_messages.dispute_id
      AND (disputes.client_id = auth.uid() OR disputes.artisan_id = auth.uid() OR disputes.mediator_id = auth.uid())
    )
  );

CREATE POLICY "Participants can add dispute messages" ON dispute_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM disputes
      WHERE disputes.id = dispute_messages.dispute_id
      AND (disputes.client_id = auth.uid() OR disputes.artisan_id = auth.uid() OR disputes.mediator_id = auth.uid())
    )
  );

-- Escrow Policies
CREATE POLICY "Users can view own escrows" ON escrow_transactions
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = artisan_id);

CREATE POLICY "Clients can create escrows" ON escrow_transactions
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Participants can update escrows" ON escrow_transactions
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = artisan_id);

CREATE POLICY "Users can view escrow milestones" ON escrow_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM escrow_transactions
      WHERE escrow_transactions.id = escrow_milestones.escrow_id
      AND (escrow_transactions.client_id = auth.uid() OR escrow_transactions.artisan_id = auth.uid())
    )
  );

-- 2FA Policies
CREATE POLICY "Users can view own 2FA" ON two_factor_secrets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own 2FA" ON two_factor_secrets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own backup codes" ON two_factor_backup_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own backup codes" ON two_factor_backup_codes
  FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- Triggers for Updated Timestamps
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kyc_profiles_updated_at
  BEFORE UPDATE ON kyc_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at
  BEFORE UPDATE ON kyc_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_transactions_updated_at
  BEFORE UPDATE ON escrow_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_two_factor_secrets_updated_at
  BEFORE UPDATE ON two_factor_secrets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Add geographic columns to providers if not exist
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'latitude') THEN
    ALTER TABLE providers ADD COLUMN latitude DECIMAL(10, 8);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'longitude') THEN
    ALTER TABLE providers ADD COLUMN longitude DECIMAL(11, 8);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_providers_location ON providers(latitude, longitude);

-- Composite index for geo + filters
CREATE INDEX IF NOT EXISTS idx_providers_geo_search ON providers(latitude, longitude, is_verified, is_available);
