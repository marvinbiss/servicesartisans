-- Auto-sync providers.noindex with RGE / claim state.
-- Closes the v1.2 RGE-only indexation loop: every ADEME sync that expires a
-- rge_valid_until, every claim that flips claimed_at, every is_active toggle
-- now updates noindex atomically inside the same transaction.
--
-- Before this trigger the invariant was maintained only by scripts/noindex-non-rge.ts
-- running batch. Between runs, an expired RGE would still appear in the sitemap.
--
-- Rule: noindex := NOT ( is_active AND (rge_valid_until > now() OR claimed_at IS NOT NULL) )
--
-- Idempotent: safe to re-run. Trigger attached only if missing.

BEGIN;

CREATE OR REPLACE FUNCTION sync_provider_noindex()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.noindex := NOT (
    COALESCE(NEW.is_active, false)
    AND (NEW.rge_valid_until > now() OR NEW.claimed_at IS NOT NULL)
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION sync_provider_noindex() IS
  'Maintains providers.noindex invariant: false iff provider is active and (RGE-valid OR claimed). v1.2 RGE-only indexation strategy.';

DROP TRIGGER IF EXISTS trg_sync_provider_noindex ON providers;

CREATE TRIGGER trg_sync_provider_noindex
  BEFORE INSERT OR UPDATE OF rge_valid_until, claimed_at, is_active
  ON providers
  FOR EACH ROW
  EXECUTE FUNCTION sync_provider_noindex();

COMMENT ON TRIGGER trg_sync_provider_noindex ON providers IS
  'Auto-flips noindex when RGE expires, claim happens, or is_active toggles. Manual noindex overrides remain possible via direct UPDATE providers SET noindex=... (trigger only fires on the 3 trigger columns).';

-- Bulk reconciliation of existing rows is intentionally NOT performed in this
-- migration: 970K rows × trigger firing = multi-minute lock unsafe for prod.
-- Use scripts/noindex-non-rge.ts for initial sweep (already run 2026-04-21).
-- From now on, every ADEME/claim/is_active change keeps noindex in sync.

COMMIT;
