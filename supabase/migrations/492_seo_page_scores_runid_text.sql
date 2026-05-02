-- =============================================================================
-- Migration 492 — seo_page_scores.source_run_id : UUID → TEXT
-- =============================================================================
-- Audit Sentry 2026-05-02 (issue JAVASCRIPT-NEXTJS-7Q, 340 events en 27s).
--
-- Drift hors-Git :
--   - Migration 373 (origine) : `source_run_id TEXT` — alignée sur le code
--     `src/app/api/cron/link-scores/route.ts:255` qui génère un identifiant
--     lisible `runId = ls-${YYYY-MM-DD}-${ms36}` (ex. `ls-2026-05-02-monr86lj`).
--   - Migration 488 (consolidation `create_missing_tables`) a recréé la table
--     avec `source_run_id UUID`, perdant le typage TEXT d'origine.
--   - Conséquence : le cron `link-scores` upsert les 340+ batches en erreur
--     `22P02 invalid input syntax for type uuid: "ls-..."` à chaque run nocturne.
--
-- Fix :
--   ALTER COLUMN ... TYPE TEXT, ré-aligné sur la mig 373 (source de vérité).
--   USING source_run_id::TEXT cast les valeurs UUID éventuelles écrites avant
--   ce fix (aucune en pratique, le cron a 100% échoué depuis la mig 488).
--
-- 5e drift hors-Git du mois (cf. mig 474, 483, 486) — TODO
-- `scripts/audit-schema-drift.mjs` à créer (CLAUDE.md prévoit déjà ce hook).
-- =============================================================================

BEGIN;

ALTER TABLE public.seo_page_scores
  ALTER COLUMN source_run_id TYPE TEXT USING source_run_id::TEXT;

COMMENT ON COLUMN public.seo_page_scores.source_run_id IS
  'Identifiant du run cron `link-scores` (format `ls-YYYY-MM-DD-{ms36}`). TEXT, pas UUID — voir mig 492.';

COMMIT;
