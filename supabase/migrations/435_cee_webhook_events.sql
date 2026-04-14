-- ============================================================================
-- Migration 435 — cee_webhook_events (idempotency table for external webhooks)
-- Scope     : Yousign, future CEE webhooks (délégataires, Pipedrive)
-- Prérequis : none (standalone table)
-- Security  : service_role only writes, RLS enabled
-- Ref       : docs/cee/THREAT_MODEL_PR2.md §5 (Test 3 idempotency)
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.cee_webhook_events (
  id          bigserial PRIMARY KEY,
  source      text        NOT NULL CHECK (source IN ('yousign','pipedrive','other')),
  event_id    text        NOT NULL,
  event_type  text,
  payload     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cee_webhook_events_source_event_unique UNIQUE (source, event_id)
);

COMMENT ON TABLE public.cee_webhook_events
  IS 'Registre idempotency webhooks externes. INSERT ON CONFLICT DO NOTHING par (source, event_id).';

CREATE INDEX IF NOT EXISTS idx_cee_webhook_events_source_received
  ON public.cee_webhook_events(source, received_at DESC);

ALTER TABLE public.cee_webhook_events ENABLE ROW LEVEL SECURITY;

-- No authenticated policy: service_role only (bypass RLS). Admin read optional:
DROP POLICY IF EXISTS cee_webhook_events_admin_read ON public.cee_webhook_events;
CREATE POLICY cee_webhook_events_admin_read
  ON public.cee_webhook_events
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

COMMIT;
