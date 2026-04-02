-- RGPD Art. 15 & 16 — Access & Rectification Requests
CREATE TABLE IF NOT EXISTS gdpr_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification')),
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  siret TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE gdpr_access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) can submit a request
CREATE POLICY "Anyone can submit" ON gdpr_access_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view requests
CREATE POLICY "Admins can view" ON gdpr_access_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Only admins can update requests
CREATE POLICY "Admins can update" ON gdpr_access_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
