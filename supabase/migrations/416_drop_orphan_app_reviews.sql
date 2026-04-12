-- =============================================================================
-- Migration 416 : DROP de la table orpheline `app.reviews`
-- =============================================================================
-- Date    : 2026-04-12
-- Contexte:
--   L'audit architecture du 2026-04-12 a identifié une table `app.reviews`
--   créée par la migration 110 avec un schéma dupliqué (author_name/content/
--   lead_id) et JAMAIS utilisée par le code applicatif (aucun `.from('reviews')`
--   du code pointe sur le schéma `app`, tous restent sur `public.reviews`).
--
--   Garder deux tables `reviews` dans deux schémas distincts est une source
--   permanente de confusion (grep ambigus, risque d'écrire dans la mauvaise
--   table lors d'un refactor, policies RLS dupliquées). On DROP la version
--   orpheline.
--
-- Sécurité :
--   - La table ne peut être droppée que si elle existe ET est vide OU si
--     on accepte la perte (audit a confirmé 0 consommateur). On utilise
--     DROP TABLE IF EXISTS pour rester idempotent.
--   - CASCADE pour nettoyer automatiquement les policies RLS / index /
--     séquences associés (tous orphelins par construction).
-- =============================================================================

-- Garde-fou : avertir si la table contient des données (visible dans les
-- logs de migration sans bloquer l'exécution).
DO $$
DECLARE
  row_count BIGINT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'app' AND table_name = 'reviews'
  ) THEN
    EXECUTE 'SELECT COUNT(*) FROM app.reviews' INTO row_count;
    IF row_count > 0 THEN
      RAISE NOTICE 'app.reviews contient % lignes qui seront supprimées', row_count;
    ELSE
      RAISE NOTICE 'app.reviews est vide, DROP en cours';
    END IF;
  ELSE
    RAISE NOTICE 'app.reviews n''existe pas (no-op)';
  END IF;
END $$;

-- DROP effectif (idempotent + cascade pour RLS/indexes orphelins)
DROP TABLE IF EXISTS app.reviews CASCADE;

-- =============================================================================
-- Notes post-migration :
--
-- - Le schéma `app` peut rester en place s'il contient d'autres tables.
--   Le DROP ne touche QUE `app.reviews`.
--
-- - Si une régression apparaît (inattendu : audit a confirmé 0 consommateur),
--   la restauration se fait via la migration 110_* dans un rollback ciblé.
--
-- - Tous les reads/writes de reviews passent désormais exclusivement par
--   `public.reviews` (source de vérité unique).
-- =============================================================================
