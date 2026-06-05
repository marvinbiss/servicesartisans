-- 536_storage_drop_dead_write_policies.sql
-- Audit storage RLS 2026-06-05 : 4 buckets ont des policies INSERT actives
-- alors qu'AUCUN code dans src/ ne les utilise (reviews, documents, reports)
-- ou que la feature est gelée (messages — messagerie en lecture seule depuis
-- la fermeture de l'espace particulier, routes upload 501).
--
-- Risque fermé : "System can create reports" acceptait l'INSERT de N'IMPORTE
-- QUEL utilisateur authentifié (WITH CHECK bucket_id = 'reports' sans scoping
-- owner) → pollution possible du bucket. Les écritures système passent par
-- service_role qui bypass RLS — aucune policy nécessaire.
--
-- On ne touche PAS aux policies SELECT (lecture d'objets legacy éventuels)
-- ni aux buckets actifs (portfolio, avatars, cee-justificatifs).

DROP POLICY IF EXISTS "System can create reports" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload review files" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload message files" ON storage.objects;
