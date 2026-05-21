-- ============================================================================
-- MIGRATION 522: RGE-OS Webhooks retry pipeline (pillar 8, v0.2)
-- ============================================================================
-- Contexte : Ralph 24 (`596c05828`) a livré la livraison single-shot des
-- webhooks RGE-OS. Si l'endpoint subscriber renvoie 5xx ou timeout, l'attempt
-- est loggée mais jamais re-tentée. Cette migration prépare le DLQ-retry :
--
--   - `next_retry_at`     : timestamp à partir duquel la row est éligible au
--                            retry. NULL = pas de retry planifié.
--   - `final_status_at`   : stampé quand la row atteint un état terminal
--                            (2xx, 4xx, max attempts, circuit breaker).
--                            NULL = encore en attente.
--
-- Le cron `/api/cron/webhooks-retry` scanne via un index partiel filtrant
-- les rows pas encore final ET dont le status est "retryable" (NULL pour
-- network error, ou ≥500 pour erreur serveur). Les status 2xx/3xx/4xx
-- terminaux n'apparaissent pas dans l'index.
--
-- Sécurité : pas de CREATE FUNCTION ici → aucun pin de search_path
-- nécessaire. Hook `audit-migration-search-path.mjs` reste vert.

alter table public.rge_os_webhook_deliveries
  add column if not exists next_retry_at timestamptz,
  add column if not exists final_status_at timestamptz;

-- Index partiel : scanner uniquement les attempts pas encore final ET
-- effectivement retryables (status null = network error, ≥500 = server error).
create index if not exists rge_os_webhook_deliveries_retryable_idx
  on public.rge_os_webhook_deliveries (next_retry_at)
  where final_status_at is null and (status is null or status >= 500);

comment on column public.rge_os_webhook_deliveries.next_retry_at is
  'When >= now() the row is eligible for retry. NULL = no further retry scheduled.';
comment on column public.rge_os_webhook_deliveries.final_status_at is
  'Stamped when row reaches terminal state (2xx/4xx OR attempt=MAX OR circuit-breaker). NULL = still pending.';
