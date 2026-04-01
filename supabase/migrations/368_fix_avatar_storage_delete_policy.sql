-- Migration 368: Add missing DELETE policy on avatars storage bucket
-- Without this, artisans cannot replace or remove their avatar photo.

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
