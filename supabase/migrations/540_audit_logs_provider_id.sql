-- =============================================================================
-- Migration 540 — audit_logs.provider_id (complément 537, audit drift 2026-06-05)
-- =============================================================================
-- lib/audit/logger.ts insère provider_id (colonne définie par mig 003, perdue
-- à la recréation de audit_logs). 537 a réparé old_value mais provider_id
-- manquait aussi → inserts audit toujours rejetés par PostgREST.
-- =============================================================================

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS provider_id UUID;
