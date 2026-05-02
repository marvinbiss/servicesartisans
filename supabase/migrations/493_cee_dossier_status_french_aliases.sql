-- =============================================================================
-- Migration 493 — cee_dossier_status : ajout des 12 valeurs FR (alias mig 402)
-- =============================================================================
-- Audit Sentry 2026-05-02 (issues JAVASCRIPT-NEXTJS-6W/6X/6Y, 76/77/78,
-- 81/82, ~70 events/24h).
--
-- Drift entre code TS et enum DB :
--   - `src/lib/cee/dossier-types.ts` (CeeDossierStatus type) déclare 12 valeurs
--     FR alignées sur la migration 402 (CHECK constraint d'origine) : `brouillon`,
--     `pre_visite_planifiee`, `pre_visite_effectuee`, `engagement_signe`,
--     `travaux_en_cours`, `travaux_acheves`, `ah_signee`, `depose_delegataire`,
--     `depose_pncee`, `valide`, `rejete`, `annule`.
--   - Les routes `/api/cron/cee-dossier-transitions` et `/api/cron/cee-relance`
--     consomment ces valeurs FR.
--   - Migrations 425 + 431 ont remplacé la CHECK constraint TEXT par un ENUM
--     TYPE `cee_dossier_status` avec des valeurs EN différentes : `draft`,
--     `submitted_by_artisan`, `qa_pending`, `qa_approved`, `qa_rejected`,
--     `deposited`, `validated`, `rejected_pncee`, `paid_client`,
--     `commission_due`, `commission_paid`, `archived`.
--   - Conséquence : tout WHERE / DEFAULT / cast utilisant une valeur FR throw
--     `22P02 invalid input value for enum cee_dossier_status: "..."` à chaque
--     tick des 2 crons (toutes les 5 min).
--
-- Stratégie :
--   On AJOUTE les 12 valeurs FR à l'enum existant sans supprimer les EN.
--   L'enum devient un superset cohérent qui supporte simultanément :
--     * les valeurs FR (consommées par le code TS / les crons)
--     * les valeurs EN historiques (préservation des éventuelles lignes prod
--       déjà persistées avec `draft`, `qa_pending`, etc.)
--   Aucune ligne n'est touchée. Le code n'a aucune ligne à changer.
--
--   Une migration future (495+) pourra :
--     1. Auditer la distribution réelle des valeurs en prod
--        (`SELECT status, count(*) FROM cee_dossiers GROUP BY 1`)
--     2. Migrer les EN orphelines vers leur équivalent FR si nécessaire
--     3. Retirer les EN de l'enum si zéro ligne ne les utilise.
--
-- ALTER TYPE ... ADD VALUE n'est pas transactionnel en PostgreSQL ≤ 17 :
-- chaque statement doit être en autocommit. On exécute donc ces 12 ADD VALUE
-- hors BEGIN/COMMIT — `IF NOT EXISTS` rend chaque ADD idempotent.
-- =============================================================================

ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'brouillon';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'pre_visite_planifiee';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'pre_visite_effectuee';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'engagement_signe';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'travaux_en_cours';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'travaux_acheves';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'ah_signee';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'depose_delegataire';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'depose_pncee';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'valide';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'rejete';
ALTER TYPE public.cee_dossier_status ADD VALUE IF NOT EXISTS 'annule';

COMMENT ON TYPE public.cee_dossier_status IS
  'Statuts dossier CEE — superset FR (mig 402, source de vérité code) + EN (mig 425/431, historique). Voir mig 493.';
