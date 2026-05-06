-- 513_drop_orphan_fk_tables.sql
-- Audit V2 SQL P0 #1-4 : 4 FK orphelines vers tables droppées par mig 100.
-- Tables enfants susceptibles d'être encore vivantes :
--   - dispute_messages -> disputes (dropped 100:175)
--   - escrow_milestones -> escrow_transactions (dropped 100:179)
--   - gift_card_transactions -> gift_cards (dropped 100:233)
--   - report_history -> scheduled_reports (dropped 100:199)
-- Selon résultat audit prod B-Q3 (à attendre user). Mig idempotente :
-- DROP IF EXISTS sur tables enfants. Si elles n'existent plus en prod,
-- no-op silencieux. Si elles existent, drop CASCADE qui supprime aussi
-- les FK orphelines.

DROP TABLE IF EXISTS public.dispute_messages CASCADE;
DROP TABLE IF EXISTS public.escrow_milestones CASCADE;
DROP TABLE IF EXISTS public.gift_card_transactions CASCADE;
DROP TABLE IF EXISTS public.report_history CASCADE;

-- Note : ne pas appliquer cette mig avant validation prod par
-- B-Q3 (résultat SQL audit FK orphelines). Si les tables enfants
-- contiennent encore des données métier, retirer le DROP correspondant
-- avant exec.
