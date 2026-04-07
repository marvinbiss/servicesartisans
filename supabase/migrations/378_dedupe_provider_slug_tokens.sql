-- Migration 378: Dedupe consecutive identical tokens in provider slugs
--
-- Source data from recherche-entreprises.api.gouv.fr sometimes contains
-- repeated words (e.g. "Brandon Marx Marx Marx Plomberie et Dépannage"),
-- which produced ugly slugs like
-- `brandon-marx-marx-marx-plomberie-et-depannage-932572118`.
--
-- This migration rewrites each affected slug in-place, keeping the SIREN
-- suffix intact. Runtime slugify (src/lib/utils.ts) and the ingestion
-- script (scripts/collect-artisans.ts) have been patched separately so
-- future slugs won't have this problem.

CREATE OR REPLACE FUNCTION dedupe_slug_tokens(s TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  tokens TEXT[];
  out_tokens TEXT[] := ARRAY[]::TEXT[];
  prev TEXT := NULL;
  t TEXT;
BEGIN
  IF s IS NULL OR s = '' THEN RETURN s; END IF;
  tokens := string_to_array(s, '-');
  FOREACH t IN ARRAY tokens LOOP
    IF t IS DISTINCT FROM prev THEN
      out_tokens := array_append(out_tokens, t);
      prev := t;
    END IF;
  END LOOP;
  RETURN array_to_string(out_tokens, '-');
END;
$$;

-- Dry-run count first — log what will change
DO $$
DECLARE
  affected INTEGER;
BEGIN
  SELECT COUNT(*) INTO affected
  FROM providers
  WHERE slug IS NOT NULL
    AND slug <> dedupe_slug_tokens(slug);
  RAISE NOTICE 'Migration 378: % provider slugs will be deduped', affected;
END $$;

-- Apply the dedup, skipping rows that would collide with an existing slug
UPDATE providers p
SET slug = dedupe_slug_tokens(p.slug)
WHERE p.slug IS NOT NULL
  AND p.slug <> dedupe_slug_tokens(p.slug)
  AND NOT EXISTS (
    SELECT 1 FROM providers p2
    WHERE p2.id <> p.id
      AND p2.slug = dedupe_slug_tokens(p.slug)
  );

-- Drop the helper function — it was only needed for this migration
DROP FUNCTION dedupe_slug_tokens(TEXT);
