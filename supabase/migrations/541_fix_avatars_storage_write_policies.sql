-- Migration 541: (re)create write policies on the avatars storage bucket.
--
-- Live incident 2026-06-06: POST /api/artisan/avatar returns
-- "new row violates row-level security policy" when REPLACING an existing
-- avatar (first upload works). The upload path is `${user.id}/avatar.{ext}`
-- with { upsert: true }: replacing requires UPDATE (and the prior cleanup
-- requires DELETE) on storage.objects. Migrations 018/368 define these
-- policies but at least one is missing in production (schema drift).
-- Idempotent re-creation of the three write policies + SELECT.

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their avatar" ON storage.objects;
CREATE POLICY "Users can upload their avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their avatar" ON storage.objects;
CREATE POLICY "Users can update their avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
