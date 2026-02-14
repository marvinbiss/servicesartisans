-- Migration 305: CMS Content Management Schema
-- Fully idempotent — safe to re-run.

-- ============================================================
-- 1. TABLE: cms_pages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL,
  page_type       text NOT NULL CHECK (page_type IN ('static', 'blog', 'service', 'location', 'homepage', 'faq')),
  title           text NOT NULL,
  content_json    jsonb,
  content_html    text,
  structured_data jsonb,
  meta_title      text,
  meta_description text,
  og_image_url    text,
  canonical_url   text,
  excerpt         text,
  author          text,
  author_bio      text,
  category        text,
  tags            text[] DEFAULT '{}',
  read_time       text,
  featured_image  text,
  service_slug    text,
  location_slug   text,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at    timestamptz,
  published_by    uuid,
  sort_order      integer DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_by      uuid,
  updated_by      uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Unique index per slug+type+service+location
CREATE UNIQUE INDEX IF NOT EXISTS cms_pages_slug_type_uniq
  ON public.cms_pages(slug, page_type, COALESCE(service_slug, ''), COALESCE(location_slug, ''))
  WHERE is_active = true;

-- ============================================================
-- 1b. CONSTRAINTS on cms_pages (idempotent via DO blocks)
-- ============================================================

-- P0: Slug format validation — only lowercase alphanumeric with hyphens
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_slug_format
    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P0: Published pages must always have a published_at date
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_published_has_date
    CHECK (status != 'published' OR published_at IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P1: Type-specific field constraints — see updated definition below (lines ~155-162)
-- (first definition removed to avoid dead code; the constraint is dropped and recreated below)

-- P2: Slug length constraint (matches Zod schema: max 200)
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_slug_length
    CHECK (length(slug) <= 200);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P2: Title length constraint
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_title_length
    CHECK (length(title) <= 500);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P2: Meta title length constraint (matches Zod schema: max 70)
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_meta_title_length
    CHECK (meta_title IS NULL OR length(meta_title) <= 70);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P2: Meta description length constraint (matches Zod schema: max 170)
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_meta_description_length
    CHECK (meta_description IS NULL OR length(meta_description) <= 170);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P1: published_at symmetry — drafts/archived must not have published_at
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_published_at_symmetry
    CHECK (status = 'published' OR published_at IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P1: URL column length constraints
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_og_image_url_length
    CHECK (og_image_url IS NULL OR length(og_image_url) <= 2048);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_canonical_url_length
    CHECK (canonical_url IS NULL OR length(canonical_url) <= 2048);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_featured_image_length
    CHECK (featured_image IS NULL OR length(featured_image) <= 2048);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P1: Text field length constraints
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_excerpt_length
    CHECK (excerpt IS NULL OR length(excerpt) <= 1000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_author_length
    CHECK (author IS NULL OR length(author) <= 200);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_category_length
    CHECK (category IS NULL OR length(category) <= 200);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P1: service_slug / location_slug format validation (same as slug)
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_service_slug_format
    CHECK (service_slug IS NULL OR service_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_location_slug_format
    CHECK (location_slug IS NULL OR location_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P1: Service pages must have service_slug
-- Drop old constraint first (it allowed service_slug IS NULL for service pages)
DO $$ BEGIN
  ALTER TABLE cms_pages DROP CONSTRAINT IF EXISTS cms_pages_type_slugs_check;
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_type_slugs_check CHECK (
    (page_type = 'location' AND service_slug IS NOT NULL AND location_slug IS NOT NULL) OR
    (page_type = 'service' AND service_slug IS NOT NULL AND location_slug IS NULL) OR
    (page_type IN ('static', 'blog', 'homepage', 'faq') AND service_slug IS NULL AND location_slug IS NULL)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P2: content_html length constraint (matches Zod schema: max 500000)
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_content_html_length
    CHECK (content_html IS NULL OR length(content_html) <= 500000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P2: Tags array bounds
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_tags_length
    CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 50);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P2: Ensure tags is never NULL (TypeScript types it as non-nullable string[])
DO $$ BEGIN
  ALTER TABLE cms_pages ALTER COLUMN tags SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- P0: Published pages must have content
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_published_has_content
    CHECK (status != 'published' OR content_json IS NOT NULL OR content_html IS NOT NULL OR structured_data IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P1: author_bio length constraint
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_author_bio_length
    CHECK (author_bio IS NULL OR length(author_bio) <= 2000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P1: read_time length constraint
DO $$ BEGIN
  ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_read_time_length
    CHECK (read_time IS NULL OR length(read_time) <= 50);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 1c. INDEXES on cms_pages
-- ============================================================
CREATE INDEX IF NOT EXISTS cms_pages_type_idx ON public.cms_pages(page_type);
CREATE INDEX IF NOT EXISTS cms_pages_status_idx ON public.cms_pages(status);
CREATE INDEX IF NOT EXISTS cms_pages_slug_idx ON public.cms_pages(slug);
CREATE INDEX IF NOT EXISTS cms_pages_service_location_idx
  ON public.cms_pages(service_slug, location_slug) WHERE service_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS cms_pages_published_idx
  ON public.cms_pages(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS cms_pages_tags_idx ON public.cms_pages USING gin(tags);

-- P1: Composite lookup index for the primary read query (slug + type + status + is_active)
CREATE INDEX IF NOT EXISTS cms_pages_lookup_idx
  ON public.cms_pages(slug, page_type, status, is_active);

-- P2: Trigram index for admin ilike search (pg_trgm enabled in migration 303)
CREATE INDEX IF NOT EXISTS cms_pages_title_trgm_idx
  ON public.cms_pages USING gin(title gin_trgm_ops);

-- P1 fix #8: Removed unused full-text search index cms_pages_search_idx.
-- The admin search uses ilike, not tsvector, so the GIN tsvector index was dead weight.
DROP INDEX IF EXISTS cms_pages_search_idx;

-- ============================================================
-- 2. TABLE: cms_page_versions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cms_page_versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id         uuid NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  version_number  integer NOT NULL DEFAULT 1,
  title           text NOT NULL,
  content_json    jsonb,
  content_html    text,
  structured_data jsonb,
  meta_title      text,
  meta_description text,
  status          text NOT NULL,
  created_by      uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  change_summary  text
);

CREATE INDEX IF NOT EXISTS cms_versions_page_idx
  ON public.cms_page_versions(page_id, version_number DESC);

-- P0: Prevent race condition — only one row per (page_id, version_number)
DO $$ BEGIN
  ALTER TABLE cms_page_versions ADD CONSTRAINT cms_page_versions_page_version_uniq
    UNIQUE (page_id, version_number);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P1: version_number must be positive
DO $$ BEGIN
  ALTER TABLE cms_page_versions ADD CONSTRAINT cms_page_versions_number_positive
    CHECK (version_number > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P1: change_summary length constraint
DO $$ BEGIN
  ALTER TABLE cms_page_versions ADD CONSTRAINT cms_page_versions_summary_length
    CHECK (change_summary IS NULL OR length(change_summary) <= 500);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- P0: status CHECK on cms_page_versions
DO $$ BEGIN
  ALTER TABLE cms_page_versions ADD CONSTRAINT cms_page_versions_status_check
    CHECK (status IN ('draft', 'published', 'archived'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. TRIGGER: auto-version on update
--    Fires when content_json, content_html, structured_data,
--    title, meta_title, or meta_description change.
-- ============================================================
CREATE OR REPLACE FUNCTION cms_auto_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version integer;
BEGIN
  -- Lock existing versions for this page to prevent race conditions
  -- on concurrent edits computing the same next version_number.
  PERFORM 1 FROM cms_page_versions
    WHERE page_id = OLD.id FOR UPDATE;

  SELECT COALESCE(MAX(version_number), 0) + 1
    INTO next_version
    FROM cms_page_versions WHERE page_id = OLD.id;

  INSERT INTO cms_page_versions (
    page_id, version_number, title, content_json, content_html,
    structured_data, meta_title, meta_description, status,
    created_by, change_summary
  ) VALUES (
    OLD.id, next_version, OLD.title, OLD.content_json, OLD.content_html,
    OLD.structured_data, OLD.meta_title, OLD.meta_description, OLD.status,
    NEW.updated_by, 'Auto-snapshot before update'
  );

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cms_pages_auto_version ON cms_pages;
CREATE TRIGGER cms_pages_auto_version
  BEFORE UPDATE ON cms_pages
  FOR EACH ROW
  WHEN (OLD.content_json IS DISTINCT FROM NEW.content_json
     OR OLD.content_html IS DISTINCT FROM NEW.content_html
     OR OLD.structured_data IS DISTINCT FROM NEW.structured_data
     OR OLD.title IS DISTINCT FROM NEW.title
     OR OLD.meta_title IS DISTINCT FROM NEW.meta_title
     OR OLD.meta_description IS DISTINCT FROM NEW.meta_description)
  EXECUTE FUNCTION cms_auto_version();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_versions ENABLE ROW LEVEL SECURITY;

-- P0: Drop policies before re-creating to guarantee idempotency
DROP POLICY IF EXISTS "Public can view published CMS pages" ON cms_pages;
CREATE POLICY "Public can view published CMS pages" ON cms_pages
  FOR SELECT USING (status = 'published' AND is_active = true);

DROP POLICY IF EXISTS "Service role full access on cms_pages" ON cms_pages;
CREATE POLICY "Service role full access on cms_pages" ON cms_pages
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access on cms_page_versions" ON cms_page_versions;
CREATE POLICY "Service role full access on cms_page_versions" ON cms_page_versions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
