-- Migration: Portfolio Enhancements
-- Description: Add support for videos and before/after comparisons in artisan portfolios

-- ===========================================
-- EXTEND PORTFOLIO_ITEMS TABLE
-- ===========================================

-- Add media type column to support different content types
ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image';

-- Add video support
ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add before/after comparison support
ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS before_image_url TEXT;

ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS after_image_url TEXT;

-- Add visibility control
ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add updated_at timestamp
ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add file metadata
ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS file_size INTEGER;

ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

-- Add constraint for media_type values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_items_media_type_check'
  ) THEN
    ALTER TABLE portfolio_items
    ADD CONSTRAINT portfolio_items_media_type_check
    CHECK (media_type IN ('image', 'video', 'before_after'));
  END IF;
END $$;

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Index for filtering visible items by artisan
CREATE INDEX IF NOT EXISTS idx_portfolio_artisan_visible
ON portfolio_items(artisan_id, is_visible, display_order)
WHERE is_visible = true;

-- Index for filtering by media type
CREATE INDEX IF NOT EXISTS idx_portfolio_media_type
ON portfolio_items(artisan_id, media_type);

-- Index for featured items
CREATE INDEX IF NOT EXISTS idx_portfolio_featured
ON portfolio_items(artisan_id, is_featured)
WHERE is_featured = true;

-- ===========================================
-- TRIGGER FOR UPDATED_AT
-- ===========================================

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_portfolio_updated_at ON portfolio_items;
CREATE TRIGGER trigger_portfolio_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_updated_at();

-- ===========================================
-- UPDATE RLS POLICIES
-- ===========================================

-- Drop existing policies to recreate with better logic
DROP POLICY IF EXISTS "Artisans can manage portfolio" ON portfolio_items;
DROP POLICY IF EXISTS "Public can view portfolios" ON portfolio_items;

-- Artisans can fully manage their own portfolio items
CREATE POLICY "Artisans can manage own portfolio"
ON portfolio_items
FOR ALL
USING (artisan_id = auth.uid())
WITH CHECK (artisan_id = auth.uid());

-- Public can only view visible portfolio items
CREATE POLICY "Public can view visible portfolios"
ON portfolio_items
FOR SELECT
USING (is_visible = true);

-- ===========================================
-- STORAGE BUCKET FOR PORTFOLIO
-- ===========================================

-- Note: Run this in Supabase Dashboard > Storage or via API
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'portfolio',
--   'portfolio',
--   true,
--   52428800, -- 50MB
--   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
-- )
-- ON CONFLICT (id) DO NOTHING;
