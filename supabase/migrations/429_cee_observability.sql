-- Migration 429: Observability CEE (simulator events, email outbox DLQ, MVs stats/TAM)
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 102 (set_updated_at), 412 (pattern DLQ), 424-428

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 429.1  cee_simulator_events — Funnel analytics (purge 90 jours)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_simulator_events (
  id           bigserial PRIMARY KEY,
  session_id   uuid NOT NULL,
  lead_id      uuid REFERENCES public.cee_leads(id) ON DELETE SET NULL,
  step         smallint CHECK (step IS NULL OR step BETWEEN 1 AND 6),
  event_type   text NOT NULL,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_hash      text,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL DEFAULT (now() + INTERVAL '90 days')
);
COMMENT ON TABLE public.cee_simulator_events IS 'Événements funnel simulateur CEE (purge 90j)';
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_session    ON public.cee_simulator_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_lead       ON public.cee_simulator_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_created_at ON public.cee_simulator_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_expires_at ON public.cee_simulator_events(expires_at);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_type       ON public.cee_simulator_events(event_type);

-- ---------------------------------------------------------------------------
-- 429.2  email_outbox_cee — Outbox DLQ pattern (migration 412 Pipedrive)
-- Statuts: pending → sent | (retry backoff) → dead (MAX 5 attempts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_outbox_cee (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template          text NOT NULL,
  recipient         text NOT NULL,
  payload           jsonb NOT NULL DEFAULT '{}'::jsonb,
  status            text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','sent','failed','dead')),
  attempts          smallint NOT NULL DEFAULT 0 CHECK (attempts <= 5),
  next_retry_at     timestamptz NOT NULL DEFAULT now(),
  last_error        text,
  sent_at           timestamptz,
  dead_letter_at    timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.email_outbox_cee IS 'Outbox emails transactionnels CEE (DLQ pattern 412, retry cron 6h, MAX 5 tentatives)';
CREATE INDEX IF NOT EXISTS idx_email_outbox_cee_pending
  ON public.email_outbox_cee(next_retry_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_outbox_cee_created ON public.email_outbox_cee(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_outbox_cee_dead    ON public.email_outbox_cee(dead_letter_at) WHERE status = 'dead';

DROP TRIGGER IF EXISTS trg_email_outbox_cee_updated_at ON public.email_outbox_cee;
CREATE TRIGGER trg_email_outbox_cee_updated_at
  BEFORE UPDATE ON public.email_outbox_cee
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.email_outbox_cee ENABLE ROW LEVEL SECURITY;
-- service_role only (pas de policy)

-- ---------------------------------------------------------------------------
-- 429.3  Vues matérialisées — stats dossiers, TAM partenaires
-- NB: cee_dossiers créée en 431 → utilisation DO-block guard si absente
-- ---------------------------------------------------------------------------

DROP MATERIALIZED VIEW IF EXISTS public.v_cee_funnel_conversion;
CREATE MATERIALIZED VIEW public.v_cee_funnel_conversion AS
SELECT
  date_trunc('day', created_at)::date AS jour,
  step,
  event_type,
  count(*)                            AS events,
  count(DISTINCT session_id)          AS sessions
FROM public.cee_simulator_events
WHERE created_at > now() - INTERVAL '90 days'
GROUP BY 1,2,3
ORDER BY 1 DESC, 2, 3;
CREATE INDEX IF NOT EXISTS idx_v_cee_funnel_jour ON public.v_cee_funnel_conversion(jour);

DROP MATERIALIZED VIEW IF EXISTS public.v_cee_leads_daily_stats;
CREATE MATERIALIZED VIEW public.v_cee_leads_daily_stats AS
SELECT
  date_trunc('day', created_at)::date AS jour,
  status,
  count(*)                            AS nb_leads,
  count(DISTINCT artisan_id)          AS nb_artisans,
  coalesce(sum(prime_estimee_cts),0)  AS prime_estimee_cts_total
FROM public.cee_leads
GROUP BY 1,2
ORDER BY 1 DESC, 2;
CREATE INDEX IF NOT EXISTS idx_v_cee_leads_daily_jour ON public.v_cee_leads_daily_stats(jour);

-- mv_cee_dossiers_stats et mv_cee_partners_tam : créées en 431-430 respectivement
-- après la table cee_dossiers et cee_artisan_partners.

COMMIT;
