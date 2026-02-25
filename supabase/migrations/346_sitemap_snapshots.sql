-- ============================================================================
-- Migration: sitemap_snapshots — Atomic snapshot refresh for provider sitemaps
-- ============================================================================
-- Purpose: Enable atomic (zero-downtime) refresh of provider_sitemap_urls.
-- Instead of DELETE-ALL → INSERT, new rows are written with a new snapshot_id
-- while old rows continue being served. A metadata table tracks snapshot
-- lifecycle: building → validating → active → superseded → garbage_collected.
--
-- This eliminates the visible empty window during refresh and provides
-- forensic metadata for every refresh run.
-- ============================================================================

-- ── 1. Snapshot metadata table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sitemap_snapshots (
  id              SERIAL        PRIMARY KEY,
  snapshot_id     INTEGER       NOT NULL UNIQUE,
  status          TEXT          NOT NULL DEFAULT 'building',
  total_providers INTEGER,
  resolved_urls   INTEGER,
  dropped_providers INTEGER,
  batch_count     INTEGER,
  max_batch_id    INTEGER,
  build_duration_ms INTEGER,
  validation_errors TEXT[],
  error_message   TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  activated_at    TIMESTAMPTZ,
  superseded_at   TIMESTAMPTZ,

  CONSTRAINT chk_snapshot_status CHECK (
    status IN ('building', 'validating', 'active', 'superseded', 'failed', 'garbage_collected')
  ),
  CONSTRAINT chk_snapshot_id_positive CHECK (snapshot_id > 0)
);

CREATE INDEX idx_snapshots_status ON sitemap_snapshots(status);
CREATE INDEX idx_snapshots_active ON sitemap_snapshots(status) WHERE status = 'active';

-- RLS: service_role only (no anon/authenticated access)
ALTER TABLE sitemap_snapshots ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE sitemap_snapshots IS
  'Lifecycle metadata for provider sitemap refresh snapshots. '
  'Exactly one row should have status=active at any time. '
  'Used by /api/sitemap-providers and refresh-provider-sitemaps.ts.';

-- ── 2. Add snapshot_id to provider_sitemap_urls ─────────────────────────────

-- Add column with default 1 so existing rows are associated with snapshot 1
ALTER TABLE provider_sitemap_urls
  ADD COLUMN IF NOT EXISTS snapshot_id INTEGER NOT NULL DEFAULT 1;

-- ── 3. Replace indexes for composite (snapshot_id, batch_id) read pattern ───

-- Drop old single-column batch index (no longer optimal)
DROP INDEX IF EXISTS idx_psm_batch;

-- New primary read index: WHERE snapshot_id = ? AND batch_id = ?
CREATE INDEX idx_psm_snapshot_batch ON provider_sitemap_urls(snapshot_id, batch_id);

-- Keep the batch+refreshed index for diagnostics, add snapshot_id
DROP INDEX IF EXISTS idx_psm_batch_refreshed;
CREATE INDEX idx_psm_snapshot_batch_refreshed ON provider_sitemap_urls(snapshot_id, batch_id, refreshed_at);

-- ── 4. Seed initial snapshot record for existing data ───────────────────────

-- Create snapshot_id=1 as 'active' to represent the current pre-computed data
-- (if provider_sitemap_urls already has rows from the previous refresh)
INSERT INTO sitemap_snapshots (snapshot_id, status, created_at, activated_at)
VALUES (1, 'active', now(), now())
ON CONFLICT (snapshot_id) DO NOTHING;
