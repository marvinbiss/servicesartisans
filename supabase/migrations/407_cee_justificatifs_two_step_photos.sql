-- Migration 407 : split photo justificatif en 2 étapes (avant/après travaux)
-- -----------------------------------------------------------------------------
-- Contexte
-- --------
-- La migration 400 seede `cee_operations.justificatifs_requis` (JSONB array)
-- avec un seul code fourre-tout `photos_horodatees_geolocalisees_avant_apres`.
-- Le flow réel de collecte mandataire CEE est en DEUX étapes distinctes :
--   1. Photos AVANT travaux — uploadées à l'engagement du dossier
--   2. Photos APRÈS travaux — uploadées à la fin du chantier
--
-- Cette migration remplace in-place l'item unique par 2 items distincts
-- (`photos_avant_travaux` + `photos_apres_travaux`) dans toutes les fiches
-- concernées, en préservant l'ordre et les autres items (attestation, facture,
-- devis, certificat RGE, mandat, etc.).
--
-- Source légale : loi n° 2025-594 du 30/06/2025, art. 13.
-- Contraintes conservées : exif_geotag=true, obligatoire=true,
-- duree_conservation_annees=6.
--
-- Idempotence
-- -----------
-- La migration est idempotente : si une fiche contient déjà `photos_avant_travaux`
-- OU `photos_apres_travaux` dans ses items, elle n'est PAS réécrite (no-op).
-- Détection via `jsonb_path_exists` sur le nouveau code.
--
-- Rollback manuel (si jamais nécessaire)
-- --------------------------------------
-- Pas d'undo automatique : les fiches seedées via migration 400 peuvent être
-- restaurées en ré-exécutant les UPDATE de 400. Aucune donnée utilisateur
-- n'est touchée — `cee_operations.justificatifs_requis` est un catalogue
-- référentiel (pas des dossiers).
-- -----------------------------------------------------------------------------

BEGIN;

DO $mig407$
DECLARE
  v_old_code       CONSTANT text := 'photos_horodatees_geolocalisees_avant_apres';
  v_new_code_avant CONSTANT text := 'photos_avant_travaux';
  v_new_code_apres CONSTANT text := 'photos_apres_travaux';
  v_item_avant     CONSTANT jsonb := jsonb_build_object(
    'code', 'photos_avant_travaux',
    'label', 'Photos horodatées avant travaux avec géolocalisation EXIF',
    'source', 'loi_2025-594',
    'obligatoire', true,
    'duree_conservation_annees', 6,
    'exif_geotag', true
  );
  v_item_apres     CONSTANT jsonb := jsonb_build_object(
    'code', 'photos_apres_travaux',
    'label', 'Photos horodatées après travaux avec géolocalisation EXIF',
    'source', 'loi_2025-594',
    'obligatoire', true,
    'duree_conservation_annees', 6,
    'exif_geotag', true
  );
  v_affected integer := 0;
BEGIN
  -- UPDATE reconstruit l'array `justificatifs_requis` via jsonb_agg :
  -- - chaque item dont `code = v_old_code` est remplacé par 2 items (avant/après)
  -- - tous les autres items sont préservés à l'identique
  -- - l'ordre relatif des items non-photo est respecté
  -- - idempotence : on n'opère QUE sur les fiches qui contiennent encore
  --   l'ancien code ET qui NE contiennent PAS déjà le nouveau code.
  WITH target AS (
    SELECT id
      FROM cee_operations
     WHERE justificatifs_requis IS NOT NULL
       AND jsonb_typeof(justificatifs_requis) = 'array'
       AND EXISTS (
         SELECT 1
           FROM jsonb_array_elements(justificatifs_requis) AS it
          WHERE it->>'code' = v_old_code
       )
       AND NOT EXISTS (
         SELECT 1
           FROM jsonb_array_elements(justificatifs_requis) AS it
          WHERE it->>'code' IN (v_new_code_avant, v_new_code_apres)
       )
  ),
  rebuilt AS (
    SELECT
      t.id,
      COALESCE(
        (
          SELECT jsonb_agg(new_item ORDER BY ordinality, sub_order)
            FROM jsonb_array_elements(op.justificatifs_requis)
                   WITH ORDINALITY AS arr(item, ordinality)
            CROSS JOIN LATERAL (
              SELECT new_item, sub_order
                FROM (
                  -- Si c'est l'ancien code : émet AVANT puis APRÈS (2 lignes)
                  SELECT v_item_avant AS new_item, 1 AS sub_order
                   WHERE arr.item->>'code' = v_old_code
                  UNION ALL
                  SELECT v_item_apres AS new_item, 2 AS sub_order
                   WHERE arr.item->>'code' = v_old_code
                  UNION ALL
                  -- Sinon : passe l'item inchangé
                  SELECT arr.item AS new_item, 0 AS sub_order
                   WHERE arr.item->>'code' IS DISTINCT FROM v_old_code
                ) s
            ) expanded
        ),
        '[]'::jsonb
      ) AS new_list
    FROM target t
    JOIN cee_operations op ON op.id = t.id
  )
  UPDATE cee_operations op
     SET justificatifs_requis = r.new_list,
         updated_at = now()
    FROM rebuilt r
   WHERE op.id = r.id;

  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RAISE NOTICE 'Migration 407 : % fiche(s) cee_operations mise(s) à jour (split photos avant/après)', v_affected;
END
$mig407$;

COMMIT;

-- -----------------------------------------------------------------------------
-- Test d'idempotence (à exécuter manuellement si besoin) :
--   ré-exécuter le DO block ci-dessus doit afficher
--   "Migration 407 : 0 fiche(s) cee_operations mise(s) à jour".
-- -----------------------------------------------------------------------------
