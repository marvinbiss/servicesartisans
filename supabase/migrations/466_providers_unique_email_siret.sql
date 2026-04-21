-- Migration 466: UNIQUE providers.email and providers.siret (partial indexes)
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- 970K rows in providers. No unicity on `email` or `siret`. Duplicate SIRETs
-- have already been observed (same SIRET inserted under two different slugs
-- when ADEME sync collided with scrape). Same for emails (Pipedrive dedup
-- fallback uses phone when email is reused).
--
-- Consequences:
--   * spam cron emails multiple times for the same artisan
--   * Pipedrive Person dedup mismatches → duplicate deals
--   * Claim flow can match the wrong provider row
--
-- STRATEGY
-- --------
-- 1. Pre-flight guard : count duplicates. If >0, RAISE EXCEPTION with the
--    count so the DBA must run `scripts/466-preflight-fix.sql` first. No
--    silent failure, no data mutation.
-- 2. If clean, create the two partial UNIQUE indexes.
--
-- Idempotent : on a re-run, the guard will pass (no dups left), and the
-- indexes use IF NOT EXISTS.
--
-- Partial UNIQUE indexes (WHERE ... IS NOT NULL AND <> '') — strict unicity
-- only on non-empty values, keeping historical rows with NULL/empty untouched.

BEGIN;

DO $$
DECLARE
  dup_email_count INT;
  dup_siret_count INT;
BEGIN
  SELECT COUNT(*) INTO dup_email_count
  FROM (
    SELECT email
    FROM providers
    WHERE email IS NOT NULL AND email <> ''
    GROUP BY email
    HAVING COUNT(*) > 1
  ) AS dup_emails;

  SELECT COUNT(*) INTO dup_siret_count
  FROM (
    SELECT siret
    FROM providers
    WHERE siret IS NOT NULL AND siret <> ''
    GROUP BY siret
    HAVING COUNT(*) > 1
  ) AS dup_sirets;

  IF dup_email_count > 0 OR dup_siret_count > 0 THEN
    RAISE EXCEPTION
      'Migration 466 aborted : % duplicate email group(s), % duplicate siret group(s). '
      'Run scripts/466-preflight-fix.sql first to resolve, then re-apply this migration.',
      dup_email_count, dup_siret_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE UNIQUE INDEX IF NOT EXISTS providers_email_unique
  ON providers (email)
  WHERE email IS NOT NULL AND email <> '';

CREATE UNIQUE INDEX IF NOT EXISTS providers_siret_unique
  ON providers (siret)
  WHERE siret IS NOT NULL AND siret <> '';

COMMENT ON INDEX providers_email_unique IS
  'Partial unique index. NULL and empty string allowed (legacy rows).';
COMMENT ON INDEX providers_siret_unique IS
  'Partial unique index. NULL and empty string allowed (legacy rows).';

COMMIT;
