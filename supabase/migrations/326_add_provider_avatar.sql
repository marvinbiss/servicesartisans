-- Migration 326: Add avatar_url to providers table
-- Re-introduces avatar_url column for Supabase Storage integration

ALTER TABLE providers ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN providers.avatar_url IS 'URL de l''avatar stocké dans Supabase Storage (bucket: avatars)';
