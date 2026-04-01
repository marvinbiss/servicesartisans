-- =============================================================================
-- Migration 371: Restore rating trigger on reviews
-- Date: 2026-04-01
--
-- FIX: Migration 102_v2_functions_triggers.sql (lines 119-121) dropped
-- trigger_update_provider_trust along with two other review triggers,
-- intending to re-create them in a later PR ("reviews-v2"). The function
-- update_provider_trust_metrics() was re-created in migration 303, but
-- the TRIGGER that calls it was never restored. As a result, inserting,
-- updating, or deleting a review does NOT automatically recalculate
-- providers.rating_average and providers.review_count.
--
-- This migration restores the trigger. Idempotent (safe to re-run).
-- =============================================================================

-- Drop first for idempotency
DROP TRIGGER IF EXISTS trigger_update_provider_trust ON reviews;

-- Re-create the trigger that was accidentally left out after migration 303
CREATE TRIGGER trigger_update_provider_trust
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_trust_metrics();
