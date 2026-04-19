-- Migration 457 — RPC `get_provider_sitemap` for single-call atomic shard reads.
--
-- Why:
--   /api/sitemap-providers was using
--     .from('providers').select(...).range(offset, offset + 25_000 - 1)
--   which PostgREST silently capped at `db-max-rows` (Supabase default = 1000).
--   Result: only ~998 URLs per sitemap shard instead of 25_000 → 94% of
--   RGE-only indexables missing from Google's sitemap submission.
--
-- Trade-off vs loop pagination:
--   * Loop (pageSize=1000, 25 sub-calls) works with any max-rows setting but
--     opens a ~750ms race window where concurrent UPDATEs can dup/skip rows.
--   * This RPC is a single round-trip, atomic snapshot — zero race window.
--     Relies on `db-max-rows >= PROVIDER_BATCH_SIZE (25_000)`.
--
-- Observability:
--   /api/sitemap-providers logs `{rawFetched, urlsEmitted, fetchMs}` so a
--   regression (e.g. max-rows reverted to 1000) surfaces immediately.
--
-- Defense in depth:
--   Partial index `idx_providers_sitemap` keeps offset+limit lookups O(log n)
--   over the 50k noindex=false rows, independent of the full 970k providers
--   table size.

CREATE OR REPLACE FUNCTION get_provider_sitemap(p_offset INTEGER, p_limit INTEGER)
RETURNS TABLE (id UUID, name TEXT, slug TEXT, stable_id TEXT, specialty TEXT, address_city TEXT, updated_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
AS 'SELECT id, name, slug, stable_id, specialty, address_city, updated_at FROM providers WHERE is_active = true AND noindex = false ORDER BY updated_at DESC, id DESC OFFSET p_offset LIMIT p_limit';

GRANT EXECUTE ON FUNCTION get_provider_sitemap(INTEGER, INTEGER) TO service_role;

COMMENT ON FUNCTION get_provider_sitemap(INTEGER, INTEGER) IS
  'Atomic provider sitemap shard. Filtered noindex=false + is_active=true. Single round-trip, zero race condition. Requires idx_providers_sitemap.';

CREATE INDEX IF NOT EXISTS idx_providers_sitemap
  ON providers (updated_at DESC, id DESC)
  WHERE is_active = true AND noindex = false;
