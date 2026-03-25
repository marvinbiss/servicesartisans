-- Track form abandonments for email recovery sequences
CREATE TABLE IF NOT EXISTS devis_abandons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  service_slug text,
  city_slug text,
  step_reached int DEFAULT 2,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,         -- NULL = not completed, set when form submitted
  email_1_sent_at timestamptz,      -- 30 min after abandon
  email_2_sent_at timestamptz,      -- 24h after abandon
  email_3_sent_at timestamptz,      -- 72h after abandon
  unsubscribed boolean DEFAULT false
);

-- For cron: find unsent emails efficiently
CREATE INDEX idx_devis_abandons_pending
  ON devis_abandons (created_at)
  WHERE completed_at IS NULL AND unsubscribed = false;

-- Deduplicate: same email within 24h
CREATE INDEX idx_devis_abandons_email_recent
  ON devis_abandons (email, created_at DESC);

-- RLS
ALTER TABLE devis_abandons ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write (cron + API routes use admin client)
CREATE POLICY "service_role_only" ON devis_abandons
  FOR ALL USING (auth.role() = 'service_role');
