-- ============================================================================
-- Migration: provider_sitemap_urls — Pre-computed sitemap URLs for providers
-- ============================================================================
-- Purpose: Eliminate runtime OFFSET pagination + slug resolution from
-- the /api/sitemap-providers route. URLs are pre-computed by a refresh
-- script and served via a single indexed query per batch.
--
-- Read pattern: SELECT url, lastmod FROM provider_sitemap_urls
--               WHERE batch_id = $1 ORDER BY id
-- ============================================================================

CREATE TABLE IF NOT EXISTS provider_sitemap_urls (
  id            BIGSERIAL   PRIMARY KEY,
  batch_id      INTEGER     NOT NULL,
  url           TEXT        NOT NULL,
  lastmod       DATE,
  provider_id   UUID        NOT NULL,
  refreshed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_psm_batch_id_non_negative CHECK (batch_id >= 0),
  CONSTRAINT chk_psm_url_not_empty CHECK (length(url) > 0)
);

-- Primary read pattern: get all URLs for a given batch
CREATE INDEX idx_psm_batch ON provider_sitemap_urls(batch_id);

-- Prevent duplicate providers (safety net during refresh)
CREATE UNIQUE INDEX idx_psm_provider_unique ON provider_sitemap_urls(provider_id);

-- For index route: SELECT MAX(batch_id) is covered by idx_psm_batch
-- For diagnostic: count per batch, find anomalies
CREATE INDEX idx_psm_batch_refreshed ON provider_sitemap_urls(batch_id, refreshed_at);

-- RLS: enable but NO policies = no anon/authenticated access
-- Only service_role (admin client) can read/write
ALTER TABLE provider_sitemap_urls ENABLE ROW LEVEL SECURITY;

-- Comment for documentation
COMMENT ON TABLE provider_sitemap_urls IS
  'Pre-computed sitemap URLs for providers. Refreshed by tools/refresh-provider-sitemaps.ts. Read by /api/sitemap-providers.';
