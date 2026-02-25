-- ============================================================================
-- Migration: sitemap_hardening — DB-level invariants for snapshot refresh
-- ============================================================================
-- Fixes:
--   F1 (CRITICAL): provider_id unique index blocks multi-snapshot operation.
--       Old: UNIQUE(provider_id) — prevents same provider in 2 snapshots.
--       New: UNIQUE(snapshot_id, provider_id) — unique per snapshot.
--   F2 (HIGH): DB-level concurrency lock for refresh.
--       Unique partial index on ((1)) WHERE status='building' — at most 1
--       building snapshot can exist. INSERT fails with 23505 if another
--       refresh is already running. No check-then-act race.
--   F3 (HIGH): DB-level single-active invariant.
--       Unique partial index on ((1)) WHERE status='active' — at most 1
--       active snapshot can exist. Prevents corruption.
--   F4 (MEDIUM): Atomic pointer flip via RPC function.
--       activate_sitemap_snapshot() runs supersede + activate in one
--       transaction. No crash-window between the two UPDATEs.
-- ============================================================================

-- ── F0: Drop snapshot_id DEFAULT to prevent silent misassignment ─────────────

-- Migration 346 added DEFAULT 1 so existing rows would get snapshot_id=1.
-- Now that the backfill is done, remove the default. Any future INSERT into
-- provider_sitemap_urls without an explicit snapshot_id will correctly fail
-- with a NOT NULL violation instead of silently landing in the dead snapshot 1.
ALTER TABLE provider_sitemap_urls ALTER COLUMN snapshot_id DROP DEFAULT;

-- ── F1: Fix provider_id unique index for multi-snapshot ──────────────────────

-- The old UNIQUE(provider_id) prevents having the same provider in two
-- snapshots simultaneously, which breaks the atomic refresh (new snapshot
-- is written while old snapshot is still being served).
DROP INDEX IF EXISTS idx_psm_provider_unique;

-- New: unique per snapshot — each provider appears at most once per snapshot
CREATE UNIQUE INDEX idx_psm_provider_per_snapshot
  ON provider_sitemap_urls(snapshot_id, provider_id);

-- ── F2: DB-level concurrency lock ───────────────────────────────────────────

-- Partial unique index on a constant expression: only rows with
-- status='building' are indexed. Since the indexed value is always 1,
-- and it's UNIQUE, at most ONE row can have status='building' at any time.
--
-- This closes the check-then-act race: the application just tries INSERT
-- with status='building'. If it fails with error code 23505, another
-- refresh is already running. The DB enforces the lock atomically.
CREATE UNIQUE INDEX idx_snapshots_one_building
  ON sitemap_snapshots ((1))
  WHERE status = 'building';

-- ── F3: DB-level single-active invariant ────────────────────────────────────

-- Same pattern: at most ONE row can have status='active'.
-- The pointer flip function (below) ensures the old active is superseded
-- before the new one is activated, all within a single transaction.
CREATE UNIQUE INDEX idx_snapshots_one_active
  ON sitemap_snapshots ((1))
  WHERE status = 'active';

-- ── F4: Atomic pointer flip function ────────────────────────────────────────

-- This function runs both UPDATEs (supersede old + activate new) in a
-- single transaction. If either fails, the entire operation is rolled back.
--
-- Without this, a crash between the two UPDATEs could leave 0 active
-- snapshots (old is superseded but new isn't activated yet).
--
-- The unique partial index on active ensures that:
--   1. The supersede step MUST complete before the activate step
--      (otherwise the activate would violate the unique constraint)
--   2. At no point can there be 2 active snapshots
--
-- Returns TRUE if the new snapshot was activated, FALSE otherwise.
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
  'Returns TRUE if the new snapshot was activated, FALSE otherwise.';
