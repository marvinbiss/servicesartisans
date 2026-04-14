-- Migration 439: simulateur_pipedrive_failures (DLQ)
-- Date: 2026-04-14
-- Phase P4 simulateur aides rénovation — intégration Pipedrive
-- Doc archi: docs/simulateur-architecture.md §6
-- Dépend: migration 438 (simulateur_estimations)

BEGIN;

-- ---------------------------------------------------------------------------
-- 439.1  simulateur_pipedrive_failures — dead-letter queue
--   Stocke les échecs de sync Pipedrive du simulateur.
--   Un cron /api/cron/simulateur-pipedrive-retry replay toutes les 6h
--   avec backoff exponentiel (2^retry_count h, cap 24h), 5 tentatives max.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.simulateur_pipedrive_failures (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimation_id   uuid NOT NULL REFERENCES public.simulateur_estimations(id) ON DELETE CASCADE,
  payload         jsonb NOT NULL,
  error           text NOT NULL,
  retry_count     integer NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  next_retry_at   timestamptz NOT NULL DEFAULT now(),
  last_retry_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.simulateur_pipedrive_failures IS 'DLQ échecs sync Pipedrive simulateur — cron retry 6h';
COMMENT ON COLUMN public.simulateur_pipedrive_failures.payload IS 'Payload complet SimulateurLeadInput pour rejouer createSimulateurDeal';
COMMENT ON COLUMN public.simulateur_pipedrive_failures.next_retry_at IS 'Prochaine tentative (backoff 2^retry_count h, cap 24h)';
COMMENT ON COLUMN public.simulateur_pipedrive_failures.retry_count IS 'Nombre de tentatives déjà effectuées (max 5)';

-- Index partiel : le cron ne scanne que les rows encore éligibles
CREATE INDEX IF NOT EXISTS idx_sim_pipedrive_failures_retry
  ON public.simulateur_pipedrive_failures(next_retry_at)
  WHERE retry_count < 5;

CREATE INDEX IF NOT EXISTS idx_sim_pipedrive_failures_estimation
  ON public.simulateur_pipedrive_failures(estimation_id);

-- ---------------------------------------------------------------------------
-- 439.2  RLS — service_role uniquement
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulateur_pipedrive_failures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS simulateur_pipedrive_failures_no_public ON public.simulateur_pipedrive_failures;

-- Aucune policy pour anon/authenticated → RLS deny-all.
-- service_role (createAdminClient) bypass RLS et reste le seul accès.

COMMIT;
