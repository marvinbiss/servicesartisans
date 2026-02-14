-- Migration 308: Email Suppression List
-- Prevents sending to bounced/complained addresses
-- Critical for email deliverability - Gmail bans senders who repeatedly send to bounced addresses

CREATE TABLE IF NOT EXISTS public.email_suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (char_length(email) <= 320),
  reason text NOT NULL CHECK (reason IN ('hard_bounce', 'soft_bounce', 'complaint', 'unsubscribe', 'manual')),
  source text CHECK (source IS NULL OR char_length(source) <= 100), -- 'resend_webhook', 'manual', 'unsubscribe_api'
  error_message text CHECK (error_message IS NULL OR char_length(error_message) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique per email+reason (allow same email with different reasons)
CREATE UNIQUE INDEX IF NOT EXISTS email_suppressions_email_reason_uniq
  ON public.email_suppressions(lower(email), reason);

-- Fast lookup by email
CREATE INDEX IF NOT EXISTS email_suppressions_email_idx
  ON public.email_suppressions(lower(email));

-- RLS
ALTER TABLE email_suppressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on email_suppressions" ON email_suppressions;
CREATE POLICY "Service role full access on email_suppressions" ON email_suppressions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
