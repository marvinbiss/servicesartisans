-- Newsletter subscribers table
-- Stores email subscriptions for the weekly newsletter

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'footer',
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email)
);

-- Index for quick lookup by email
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers (email);

-- Index for active subscribers (for batch sends)
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers (subscribed_at)
  WHERE unsubscribed_at IS NULL;

-- RLS: only service_role can access this table (no public access)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
