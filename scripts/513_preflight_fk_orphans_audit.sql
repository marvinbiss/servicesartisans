-- =============================================================================
-- B-Q3 — Audit FK orphelines avant application mig 513
-- ServicesArtisans — Plan B SLA 99.9 hardening — 2026-05-05
-- =============================================================================
-- Contexte : mig 100 a droppé 4 tables parents (disputes, escrow_transactions,
-- gift_cards, scheduled_reports) mais les tables enfants peuvent encore
-- exister en prod et porter des FK orphelines :
--   - dispute_messages         -> disputes              (parent dropped 100:175)
--   - escrow_milestones        -> escrow_transactions   (parent dropped 100:179)
--   - gift_card_transactions   -> gift_cards            (parent dropped 100:233)
--   - report_history           -> scheduled_reports     (parent dropped 100:199)
--
-- Mig 513 fait `DROP TABLE IF EXISTS ... CASCADE` sur les 4 tables enfants.
-- AVANT d'appliquer 513, lancer ce script dans Supabase SQL editor.
--
-- Décision après lecture du résultat :
--   1. Si les 4 enfants sont absents (count = 0) → mig 513 = no-op safe, apply OK.
--   2. Si une ou plusieurs sont présentes mais VIDES → mig 513 OK, apply.
--   3. Si une ou plusieurs contiennent des LIGNES MÉTIER → STOP. Retirer le
--      DROP correspondant de mig 513 et migrer les données ailleurs avant.
-- =============================================================================

-- 1. FK orphelines — détection dynamique (pour info uniquement)
-- ----------------------------------------------------------------------------
-- Liste les FK qui pointent vers une table parent qui n'existe plus.
-- Si rien ne sort → toutes les FK pointent sur des tables vivantes (clean).

SELECT
  c.conname                  AS fk_name,
  c.conrelid::regclass       AS child_table,
  c.confrelid::regclass      AS parent_table_oid,
  CASE
    WHEN c.confrelid = 0 THEN '!! ORPHELINE (parent inconnu)'
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_class WHERE oid = c.confrelid
    ) THEN '!! ORPHELINE (parent dropped)'
    ELSE 'OK'
  END                        AS status
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE c.contype = 'f'
  AND t.relname IN (
    'dispute_messages',
    'escrow_milestones',
    'gift_card_transactions',
    'report_history'
  )
ORDER BY child_table, fk_name;


-- 2. Existence + comptage lignes des 4 tables enfants
-- ----------------------------------------------------------------------------
-- Si table absente → row absente du résultat (la query suivante est tolérante
-- via UNION ALL et to_regclass).

WITH targets AS (
  SELECT unnest(ARRAY[
    'dispute_messages',
    'escrow_milestones',
    'gift_card_transactions',
    'report_history'
  ]) AS tname
)
SELECT
  tname                                                  AS table_name,
  to_regclass('public.' || tname) IS NOT NULL            AS exists_in_public,
  CASE
    WHEN to_regclass('public.' || tname) IS NULL THEN NULL
    ELSE (
      SELECT count(*)::bigint FROM (
        SELECT 1 FROM (SELECT 1) x
        WHERE to_regclass('public.' || tname) IS NOT NULL
      ) y
    )
  END                                                    AS marker_existence,
  -- Note : pour le count réel, lancer manuellement la query 3 ci-dessous
  -- pour CHAQUE table qui ressort exists_in_public = true.
  'Lancer manuellement query 3 si exists_in_public=true' AS next_step
FROM targets
ORDER BY tname;


-- 3. Comptage par table (à lancer SEULEMENT pour les tables qui existent)
-- ----------------------------------------------------------------------------
-- Décommenter UNIQUEMENT les lignes correspondant aux tables qui sortent
-- exists_in_public = true en query 2.

-- SELECT 'dispute_messages'         AS t, count(*) FROM public.dispute_messages;
-- SELECT 'escrow_milestones'        AS t, count(*) FROM public.escrow_milestones;
-- SELECT 'gift_card_transactions'   AS t, count(*) FROM public.gift_card_transactions;
-- SELECT 'report_history'           AS t, count(*) FROM public.report_history;


-- =============================================================================
-- Décision finale (à reporter dans le commit message de l'apply mig 513) :
--
--   [ ] Toutes les tables absentes        → apply 513 telle quelle
--   [ ] Toutes présentes et vides         → apply 513 telle quelle
--   [ ] Une ou plusieurs avec lignes      → éditer 513 (retirer DROP) AVANT apply
--                                            + créer une mig 514 d'archivage
-- =============================================================================
