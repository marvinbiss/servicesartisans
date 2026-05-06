-- 508_cee_justificatifs_bucket.sql
-- Audit V2 storage P0-1 : bucket `cee-justificatifs` référencé dans
-- `src/lib/cee/justificatifs.ts:170` mais AUCUNE migration ne le crée.
-- Drift hors-Git probable (3e cas en 1 mois, après mig 483/486). Données YMYL
-- légales : loi 2025-594 art. 13 = archive 6 ans PNCEE. Bucket privé,
-- ownership via dossier_id (1er folder du path) + JOIN cee_dossiers.partner_id.

-- 1. Créer le bucket s'il n'existe pas (privé)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cee-justificatifs',
  'cee-justificatifs',
  FALSE,
  26214400, -- 25 MB (aligné src/lib/cee/justificatifs.ts:186)
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Policies storage.objects (path convention : `${dossier_id}/${type}/${filename}`)

DROP POLICY IF EXISTS cee_justificatifs_select ON storage.objects;
CREATE POLICY cee_justificatifs_select
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'cee-justificatifs'
    AND EXISTS (
      SELECT 1
        FROM public.cee_dossiers d
        JOIN public.cee_artisan_partners p ON p.id = d.partner_id
        JOIN public.providers pr ON pr.id = p.provider_id
       WHERE d.id::text = (storage.foldername(name))[1]
         AND pr.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS cee_justificatifs_insert ON storage.objects;
CREATE POLICY cee_justificatifs_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'cee-justificatifs'
    AND EXISTS (
      SELECT 1
        FROM public.cee_dossiers d
        JOIN public.cee_artisan_partners p ON p.id = d.partner_id
        JOIN public.providers pr ON pr.id = p.provider_id
       WHERE d.id::text = (storage.foldername(name))[1]
         AND pr.user_id = auth.uid()
         AND d.status IN ('draft', 'brouillon')
    )
  );

DROP POLICY IF EXISTS cee_justificatifs_update ON storage.objects;
CREATE POLICY cee_justificatifs_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'cee-justificatifs'
    AND EXISTS (
      SELECT 1
        FROM public.cee_dossiers d
        JOIN public.cee_artisan_partners p ON p.id = d.partner_id
        JOIN public.providers pr ON pr.id = p.provider_id
       WHERE d.id::text = (storage.foldername(name))[1]
         AND pr.user_id = auth.uid()
         AND d.status IN ('draft', 'brouillon')
    )
  );

DROP POLICY IF EXISTS cee_justificatifs_delete ON storage.objects;
CREATE POLICY cee_justificatifs_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'cee-justificatifs'
    AND EXISTS (
      SELECT 1
        FROM public.cee_dossiers d
        JOIN public.cee_artisan_partners p ON p.id = d.partner_id
        JOIN public.providers pr ON pr.id = p.provider_id
       WHERE d.id::text = (storage.foldername(name))[1]
         AND pr.user_id = auth.uid()
         AND d.status IN ('draft', 'brouillon')
    )
  );
