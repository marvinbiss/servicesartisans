-- Migration 374: RGPD Art. 21 — Provider removal requests
-- Allows artisans to request deletion of their public profile page

CREATE TABLE IF NOT EXISTS provider_removal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  siret TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_removal_requests_provider ON provider_removal_requests(provider_id);
CREATE INDEX idx_removal_requests_status ON provider_removal_requests(status) WHERE status = 'pending';
CREATE INDEX idx_removal_requests_email ON provider_removal_requests(requester_email);

-- RLS
ALTER TABLE provider_removal_requests ENABLE ROW LEVEL SECURITY;

-- Public insert: anyone can submit a removal request (rate-limited at API level)
CREATE POLICY "Anyone can submit removal requests"
  ON provider_removal_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin-only read: only admins can view removal requests
CREATE POLICY "Admins can view removal requests"
  ON provider_removal_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin-only update: only admins can process removal requests
CREATE POLICY "Admins can update removal requests"
  ON provider_removal_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_removal_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_removal_request_updated_at
  BEFORE UPDATE ON provider_removal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_removal_request_updated_at();
