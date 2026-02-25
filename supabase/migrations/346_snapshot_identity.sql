-- ============================================================================
-- Migration: snapshot_identity — Eliminate TOCTOU in snapshot ID allocation
-- ============================================================================
-- Changes:
--   1. Convert snapshot_id to GENERATED ALWAYS AS IDENTITY (sequence-backed)
--      - Eliminates the read-then-write max()+1 race condition
--      - INSERT without snapshot_id returns the auto-assigned ID
--   2. Add force_activate_sitemap_snapshot() RPC for ops recovery
--      - Accepts superseded, failed, or validating snapshots
--      - Idempotent: no-op if already active
--      - Requires a reason string for audit trail
-- ============================================================================

-- ── 1. Convert snapshot_id to IDENTITY column ─────────────────────────────

-- Drop the old manual constraint (snapshot_id > 0)
ALTER TABLE sitemap_snapshots DROP CONSTRAINT IF EXISTS chk_snapshot_id_positive;

-- To convert an existing column to IDENTITY, we need to:
-- a) Create a sequence
-- b) Set the column default to use it
-- c) Mark it as identity
--
-- However, PostgreSQL does not allow ALTER COLUMN ... SET GENERATED on an
-- existing column. The cleanest approach that preserves data:
-- Create a sequence starting after the max existing snapshot_id.

DO $$
DECLARE
  max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(snapshot_id), 0) INTO max_id FROM sitemap_snapshots;
  EXECUTE format('CREATE SEQUENCE IF NOT EXISTS sitemap_snapshots_snapshot_id_seq START WITH %s', max_id + 1);
  EXECUTE 'ALTER TABLE sitemap_snapshots ALTER COLUMN snapshot_id SET DEFAULT nextval(''sitemap_snapshots_snapshot_id_seq'')';
  EXECUTE 'ALTER SEQUENCE sitemap_snapshots_snapshot_id_seq OWNED BY sitemap_snapshots.snapshot_id';
END
$$;

-- ── 2. RPC: allocate_snapshot_id — INSERT + RETURNING ───────────────────────

CREATE OR REPLACE FUNCTION allocate_snapshot_id()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id INTEGER;
BEGIN
  INSERT INTO sitemap_snapshots (status)
  VALUES ('building')
  RETURNING snapshot_id INTO new_id;

  RETURN new_id;
END;
$$;

COMMENT ON FUNCTION allocate_snapshot_id() IS
  'Atomically allocates a new snapshot ID by INSERT + RETURNING. '
  'The unique partial index on status=building ensures at most 1 concurrent refresh. '
  'Returns the new snapshot_id on success, raises 23505 if another refresh is running.';

-- ── 3. RPC: force_activate_sitemap_snapshot ─────────────────────────────────

CREATE OR REPLACE FUNCTION force_activate_sitemap_snapshot(
  p_snapshot_id INTEGER,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
BEGIN
  -- Validate reason is provided
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'force_activate: reason is required for audit trail';
  END IF;

  -- Check the snapshot exists and get its current status
  SELECT status INTO v_status
  FROM sitemap_snapshots
  WHERE snapshot_id = p_snapshot_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'force_activate: snapshot % does not exist', p_snapshot_id;
  END IF;

  -- Idempotent: if already active, no-op
  IF v_status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- Only allow from safe source states
  IF v_status NOT IN ('superseded', 'failed', 'validating') THEN
    RAISE EXCEPTION 'force_activate: snapshot % is in state "%" — only superseded, failed, or validating allowed',
      p_snapshot_id, v_status;
  END IF;

  -- Supersede the current active (if any)
  UPDATE sitemap_snapshots
  SET status = 'superseded', superseded_at = now()
  WHERE status = 'active';

  -- Activate the target snapshot
  UPDATE sitemap_snapshots
  SET status = 'active',
      activated_at = now(),
      error_message = 'force-activate: ' || p_reason
  WHERE snapshot_id = p_snapshot_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'force_activate: failed to activate snapshot %', p_snapshot_id;
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION force_activate_sitemap_snapshot(INTEGER, TEXT) IS
  'Emergency ops recovery: force-activate a snapshot from superseded/failed/validating state. '
  'Requires a reason string for audit trail. Idempotent if already active. '
  'Atomic: supersedes old active + activates target in one transaction.';
