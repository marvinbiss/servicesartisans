-- 511_webhook_events_provider_column.sql
-- Audit V2 webhooks W5 : `webhook_events` réutilisée par Stripe + Resend +
-- Twilio + Vapi via préfixes (`twilio:`, `resend:`, `vapi:`) collés dans
-- `stripe_event_id`. Impossible d'agréger « combien d'events Stripe traités
-- ce mois » sans regex sur la PK. Pas d'index par provider.
--
-- Cette mig ajoute la colonne `provider` (rétro-déduite des préfixes existants
-- via UPDATE) + index composite. Le code TS continue d'utiliser
-- `stripe_event_id` (pas de breaking change). Une seconde phase (mig séparée)
-- pourra fusionner avec `cee_webhook_events` derrière un wrapper unique.

ALTER TABLE public.webhook_events
  ADD COLUMN IF NOT EXISTS provider TEXT;

UPDATE public.webhook_events
   SET provider = CASE
     WHEN stripe_event_id LIKE 'twilio:%' THEN 'twilio'
     WHEN stripe_event_id LIKE 'resend:%' THEN 'resend'
     WHEN stripe_event_id LIKE 'vapi:%'   THEN 'vapi'
     WHEN stripe_event_id LIKE 'evt_%'    THEN 'stripe'
     ELSE 'stripe'
   END
 WHERE provider IS NULL;

ALTER TABLE public.webhook_events
  ALTER COLUMN provider SET DEFAULT 'stripe',
  ALTER COLUMN provider SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_created
  ON public.webhook_events (provider, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status_processing
  ON public.webhook_events (status, created_at)
  WHERE status = 'processing';

COMMENT ON COLUMN public.webhook_events.provider IS
  'Discriminant providers : stripe|twilio|resend|vapi|vercel. Mig 511 — phase 1 (rétro-backfill). Phase 2 fusionnera avec cee_webhook_events.';
