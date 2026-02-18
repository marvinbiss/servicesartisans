-- Migration 315: Add noindex column to providers
-- Strategy: Index EVERYTHING by default. Only noindex truly dead businesses.
-- 743K artisans = 743K indexed pages = maximum SEO domination.

-- Add noindex column — default FALSE (everything is indexable)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS noindex BOOLEAN NOT NULL DEFAULT false;

-- Index for fast filtering on public queries
CREATE INDEX IF NOT EXISTS idx_providers_active_indexable
  ON providers (is_active, noindex)
  WHERE is_active = true AND noindex = false;

-- Only noindex inactive/dead businesses
UPDATE providers SET noindex = true WHERE is_active = false;
