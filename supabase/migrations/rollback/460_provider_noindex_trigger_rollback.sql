-- Rollback for 460_provider_noindex_trigger.sql
-- Drops the trigger + function. Existing providers.noindex values are not
-- reverted: use scripts/revert-noindex-non-rge.ts + providers_noindex_snapshot
-- table if you also need to restore the pre-migration noindex state.

BEGIN;

DROP TRIGGER IF EXISTS trg_sync_provider_noindex ON providers;
DROP FUNCTION IF EXISTS sync_provider_noindex();

COMMIT;
