-- =============================================================================
-- Migration 412 : Pipedrive DLQ + exponential backoff
-- =============================================================================
-- Date    : 2026-04-12
--
-- Contexte:
--   Audit 2026-04-12 : le retry Pipedrive (cron /api/cron/pipedrive-retry)
--   rejoue les leads non synced en aveugle toutes les 6h pendant 5 tentatives,
--   sans backoff et sans terminal state. Conséquences :
--     - Un Pipedrive down pendant 1h est rejoué 5 fois à 6h d'écart -> 25h
--       avant abandon, au lieu d'un backoff exponentiel qui récupère en ~1h.
--     - Passé 5 tentatives, les leads restent silencieusement non synced
--       (pas de dead-letter state, pas d'alerte).
--     - Aucune remontée Sentry sur transition "dead letter" -> on ne sait
--       pas qu'un lead est perdu tant qu'un humain ne regarde pas la DB.
--
-- Ce que fait cette migration :
--   1. pipedrive_next_retry_at  timestamptz  - prochain créneau de rejeu
--      (backoff exponentiel 30s -> 2min -> 8min -> 32min -> 2h côté code).
--   2. pipedrive_dead_letter_at timestamptz  - terminal state après 5 échecs,
--      filtré par le cron pour arrêter les rejeux.
--   3. idx_devis_requests_pipedrive_retry  - index partiel pour que le cron
--      serve ses lookups entièrement depuis l'index (leads en attente de
--      rejeu, non morts, non synced, échus).
--
-- Le cron (migration code) lira ces colonnes pour ne rejouer que les leads
-- échus ET non dead-lettered. Les inserts de nouveaux leads gardent
-- next_retry_at = NULL (premier essai immédiat via API route).
-- =============================================================================

ALTER TABLE public.devis_requests
  ADD COLUMN IF NOT EXISTS pipedrive_next_retry_at  timestamptz,
  ADD COLUMN IF NOT EXISTS pipedrive_dead_letter_at timestamptz;

-- Index partiel : le cron filtre sur (synced_at IS NULL, dead_letter_at IS NULL,
-- next_retry_at <= now()). Index couvre exactement ce predicate + ordre created_at.
DROP INDEX IF EXISTS public.idx_devis_requests_pipedrive_retry;
CREATE INDEX idx_devis_requests_pipedrive_retry
  ON public.devis_requests (pipedrive_next_retry_at, created_at)
  WHERE pipedrive_synced_at IS NULL
    AND pipedrive_dead_letter_at IS NULL;

COMMENT ON COLUMN public.devis_requests.pipedrive_next_retry_at IS
  'Prochain créneau autorisé pour rejouer la sync Pipedrive (exponential backoff). NULL = rejouable immédiatement.';
COMMENT ON COLUMN public.devis_requests.pipedrive_dead_letter_at IS
  'Timestamp de passage en dead letter après MAX_ATTEMPTS échecs. NULL = encore actif. Alerte Sentry émise à la transition.';
