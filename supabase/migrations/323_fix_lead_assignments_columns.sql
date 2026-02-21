-- Migration 323: Add missing columns to lead_assignments
--
-- Migration 103 created lead_assignments (id, lead_id, provider_id, assigned_at, status, viewed_at).
-- Migration 202 tried to recreate the table with additional columns
-- (source_table, score, distance_km, position) using CREATE TABLE IF NOT EXISTS,
-- which is a no-op when the table already exists.
-- This migration adds the missing columns via ALTER TABLE ADD COLUMN IF NOT EXISTS.

ALTER TABLE lead_assignments
  ADD COLUMN IF NOT EXISTS source_table TEXT NOT NULL DEFAULT 'devis_requests'
    CHECK (source_table IN ('devis_requests', 'leads'));

ALTER TABLE lead_assignments
  ADD COLUMN IF NOT EXISTS score REAL;

ALTER TABLE lead_assignments
  ADD COLUMN IF NOT EXISTS distance_km REAL;

ALTER TABLE lead_assignments
  ADD COLUMN IF NOT EXISTS position INTEGER;
