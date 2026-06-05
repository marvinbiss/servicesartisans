-- verify-storage-rls-live.sql
-- Vérification LIVE des policies storage (audit 2026-06-05).
-- Contexte : drift RLS profiles (OFF depuis Feb 13, hors Git) découvert
-- 2026-06-04 — les policies storage n'ont jamais été re-vérifiées live.
-- READ-ONLY : à coller statement par statement dans le SQL editor Supabase.

-- VERIF 1 : RLS doit être ACTIVÉE sur storage.objects.
-- Attendu : rls_enabled = true. false = INCIDENT (équivalent drift profiles).
SELECT relname, relrowsecurity AS rls_enabled, relforcerowsecurity AS rls_forced
FROM pg_class
WHERE oid = 'storage.objects'::regclass;

-- VERIF 2 : buckets attendus, flag public, limites.
-- Attendu : portfolio/avatars/reviews public=true ;
-- messages/documents/reports/cee-justificatifs public=false.
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id IN ('portfolio','avatars','reviews','messages','documents','reports','cee-justificatifs')
ORDER BY id;

-- VERIF 3 : bucket privé marqué public par erreur. Attendu : 0 ligne.
SELECT id, public
FROM storage.buckets
WHERE public = true
  AND id IN ('messages','documents','reports','cee-justificatifs');

-- VERIF 4 : inventaire complet des policies sur storage.objects.
-- Attendu (post-mig 536) : portfolio S/I/U/D ; avatars S/I/U/D ;
-- reviews S ; messages S ; documents S ; reports S ; cee-justificatifs S/I/U/D.
-- Toute expr non-publique doit contenir (storage.foldername(name))[1]
-- ou le JOIN cee_dossiers.
SELECT polname AS policy_name,
       CASE polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT'
                   WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE'
                   WHEN '*' THEN 'ALL' END AS cmd,
       pg_get_expr(polqual, polrelid)      AS using_expr,
       pg_get_expr(polwithcheck, polrelid) AS check_expr
FROM pg_policy
WHERE polrelid = 'storage.objects'::regclass
ORDER BY cmd, policy_name;

-- VERIF 5 : policy trop large sur bucket PRIVÉ (ni foldername, ni JOIN dossier).
-- Attendu : 0 ligne.
SELECT polname,
       CASE polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' ELSE polcmd::text END AS cmd,
       pg_get_expr(polqual, polrelid)      AS using_expr,
       pg_get_expr(polwithcheck, polrelid) AS check_expr
FROM pg_policy
WHERE polrelid = 'storage.objects'::regclass
  AND (pg_get_expr(polqual, polrelid) ~ 'messages|documents|reports|cee-justificatifs'
       OR pg_get_expr(polwithcheck, polrelid) ~ 'messages|documents|reports|cee-justificatifs')
  AND coalesce(pg_get_expr(polqual, polrelid), pg_get_expr(polwithcheck, polrelid))
      NOT LIKE '%foldername%'
  AND coalesce(pg_get_expr(polqual, polrelid), pg_get_expr(polwithcheck, polrelid))
      NOT LIKE '%cee_dossiers%';
