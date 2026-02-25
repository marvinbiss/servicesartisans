-- ============================================================================
-- Migration: provider_sitemap_system — Complete provider sitemap infrastructure
-- ============================================================================
-- Creates the full pre-computed sitemap pipeline in one atomic migration:
--   1. provider_sitemap_urls: pre-computed URLs (eliminates OFFSET pagination)
--   2. sitemap_snapshots: atomic snapshot lifecycle metadata
--   3. DB-level invariants: concurrency lock, single-active, per-snapshot unique
--   4. RPC function: atomic pointer flip for zero-downtime refresh
--
-- Design invariants enforced at the PostgreSQL level:
--   - At most 1 snapshot can be 'building' (concurrency lock)
--   - At most 1 snapshot can be 'active' (single-active)
--   - Each provider appears at most once per snapshot
--   - Pointer flip is atomic (RPC function with rollback on failure)
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

-- Status lookup index
CREATE INDEX idx_snapshots_status ON sitemap_snapshots(status);
CREATE INDEX idx_snapshots_active ON sitemap_snapshots(status) WHERE status = 'active';

-- DB-level concurrency lock: at most 1 building snapshot at any time.
-- INSERT with status='building' fails with 23505 if another refresh is running.
CREATE UNIQUE INDEX idx_snapshots_one_building
  ON sitemap_snapshots ((1))
  WHERE status = 'building';

-- DB-level single-active invariant: at most 1 active snapshot at any time.
-- Prevents corruption from manual SQL or buggy code paths.
CREATE UNIQUE INDEX idx_snapshots_one_active
  ON sitemap_snapshots ((1))
  WHERE status = 'active';

-- RLS: service_role only (no anon/authenticated access)
ALTER TABLE sitemap_snapshots ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE sitemap_snapshots IS
  'Lifecycle metadata for provider sitemap refresh snapshots. '
  'Exactly one row should have status=active at any time. '
  'Used by /api/sitemap-providers and refresh-provider-sitemaps.ts.';

-- ── 2. Pre-computed sitemap URLs table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS provider_sitemap_urls (
  id            BIGSERIAL   PRIMARY KEY,
  snapshot_id   INTEGER     NOT NULL,
  batch_id      INTEGER     NOT NULL,
  url           TEXT        NOT NULL,
  lastmod       DATE,
  provider_id   UUID        NOT NULL,
  refreshed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_psm_batch_id_non_negative CHECK (batch_id >= 0),
  CONSTRAINT chk_psm_url_not_empty CHECK (length(url) > 0)
);

-- Primary read pattern: WHERE snapshot_id = ? AND batch_id = ?
CREATE INDEX idx_psm_snapshot_batch ON provider_sitemap_urls(snapshot_id, batch_id);

-- Unique per snapshot: each provider appears at most once per snapshot
-- (NOT unique across snapshots — that would block atomic refresh)
CREATE UNIQUE INDEX idx_psm_provider_per_snapshot
  ON provider_sitemap_urls(snapshot_id, provider_id);

-- Diagnostic index: batch + refreshed_at per snapshot
CREATE INDEX idx_psm_snapshot_batch_refreshed ON provider_sitemap_urls(snapshot_id, batch_id, refreshed_at);

-- RLS: enable but NO policies = no anon/authenticated access
-- Only service_role (admin client) can read/write
ALTER TABLE provider_sitemap_urls ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE provider_sitemap_urls IS
  'Pre-computed sitemap URLs for providers. Refreshed by refresh-provider-sitemaps.ts. '
  'Read by /api/sitemap-providers. Each row belongs to exactly one snapshot.';

-- ── 3. Atomic pointer flip RPC function ─────────────────────────────────────

-- Supersedes the old active snapshot and activates the new one in a single
-- transaction. If the new snapshot is not in 'validating' state, the entire
-- operation is rolled back (the old active is NOT superseded).
--
-- The unique partial index on active ensures ordering:
--   1. Supersede old FIRST (removes from index)
--   2. Activate new SECOND (adds to index)
-- Reversing the order would violate the unique constraint.

CREATE OR REPLACE FUNCTION activate_sitemap_snapshot(p_new_snapshot_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Step 1: Supersede all currently active snapshots
  UPDATE sitemap_snapshots
  SET status = 'superseded', superseded_at = now()
  WHERE status = 'active';

  -- Step 2: Activate the new snapshot (must be in 'validating' state)
  UPDATE sitemap_snapshots
  SET status = 'active', activated_at = now()
  WHERE snapshot_id = p_new_snapshot_id
    AND status = 'validating';

  -- If step 2 didn't match any rows, RAISE EXCEPTION to rollback step 1 too.
  -- Without this, we'd commit with 0 active snapshots (step 1 superseded the old one
  -- but step 2 didn't activate the new one).
  IF NOT FOUND THEN
    RAISE EXCEPTION 'activate_sitemap_snapshot: snapshot % is not in validating state — rollback', p_new_snapshot_id;
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION activate_sitemap_snapshot(INTEGER) IS
  'Atomic pointer flip for sitemap snapshot activation. '
  'Supersedes old active snapshot and activates the new one in a single transaction. '
  'Raises exception if new snapshot is not in validating state (full rollback).';

-- ── 4. Seed initial snapshot ────────────────────────────────────────────────

-- Create snapshot_id=1 as 'active' so the system has a valid state
-- even before the first refresh runs.
INSERT INTO sitemap_snapshots (snapshot_id, status, created_at, activated_at)
VALUES (1, 'active', now(), now())
ON CONFLICT (snapshot_id) DO NOTHING;
