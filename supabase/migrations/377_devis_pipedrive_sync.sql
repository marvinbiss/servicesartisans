-- Migration 377: Pipedrive CRM sync tracking on devis_requests
-- Adds columns to track Pipedrive sync state for each lead.
-- The DB remains source of truth; Pipedrive is a mirror.

ALTER TABLE devis_requests
  ADD COLUMN IF NOT EXISTS pipedrive_deal_id BIGINT,
  ADD COLUMN IF NOT EXISTS pipedrive_person_id BIGINT,
  ADD COLUMN IF NOT EXISTS pipedrive_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pipedrive_sync_error TEXT,
  ADD COLUMN IF NOT EXISTS pipedrive_sync_attempts SMALLINT NOT NULL DEFAULT 0;

-- Partial index to quickly find un-synced leads for the retry cron
CREATE INDEX IF NOT EXISTS idx_devis_requests_pipedrive_pending
  ON devis_requests (created_at)
  WHERE pipedrive_synced_at IS NULL;
