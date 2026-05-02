-- =============================================================================
-- Migration 491 : Pivot pure-play BTP énergétique 2026-05-02
-- DESACTIVATION 5 services hors thèse + DELETE providers correspondants
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Suite au pivot RGE 2026-05-01 (mig 489+490 : 16 métiers Tier C niche
-- supprimés), audit thèse SA :
--   - jardinier      : service à la personne, hors BTP, 0 RGE/CEE
--   - nettoyage      : service à la personne, hors BTP, 0 RGE/CEE
--   - paysagiste     : marché jardins, hors thèse rénovation énergétique
--   - alarme-securite: marché dominé installateurs marques, hors BTP artisan
--   - demenageur     : logistique, hors BTP, 0 RGE/CEE
--
-- Décision : SA = pure-play rénovation BTP énergétique. Coupe nette pour
-- libérer le PageRank vers les 25 services core et concentrer le crawl
-- budget sur les pages porteuses de leads RGE/CEE.
--
-- DECISION (validée Marvin 2026-05-02)
-- ------------------------------------
-- Mêmes principes que mig 489+490 :
--   - UPDATE services SET is_active = false (5 lignes)
--   - DELETE providers WHERE specialty IN (5) (volume estimé 30K-60K)
--   - Cascades FK auto-handled (CASCADE/SET NULL/RESTRICT selon table)
--
-- VOLUMES À AUDITER avant exécution
-- ---------------------------------
-- SELECT specialty, COUNT(*)
-- FROM providers
-- WHERE specialty IN ('jardinier','nettoyage','paysagiste','alarme-securite','demenageur')
-- GROUP BY specialty ORDER BY count DESC;
--
-- IRREVERSIBILITY WARNING
-- -----------------------
-- DELETE pur sans table d'archive — ROLLBACK IMPOSSIBLE après commit.
-- Pour rollback : ré-importer dataset ADEME via cron `/api/cron/rge-sync`
-- (note : ces 5 specialties sont hors RGE, donc pas re-importables ainsi —
-- backup pré-migration recommandé si volume des claims user_id IS NOT NULL > 0).
-- =============================================================================

-- ============================================================================
-- 0. AUDIT PRÉ-EXÉCUTION (read-only, à coller séparément avant le DELETE)
-- ============================================================================
-- SELECT 'providers_killed_specialty' AS check_name,
--        specialty,
--        COUNT(*) AS n,
--        SUM(CASE WHEN user_id IS NOT NULL THEN 1 ELSE 0 END) AS claimed
-- FROM public.providers
-- WHERE specialty IN ('jardinier','nettoyage','paysagiste','alarme-securite','demenageur')
-- GROUP BY specialty
-- ORDER BY n DESC;

-- ============================================================================
-- 1. DESACTIVATION 5 SERVICES (services.is_active = false)
-- ============================================================================
UPDATE public.services
SET is_active = false
WHERE slug IN ('jardinier', 'nettoyage', 'paysagiste', 'alarme-securite', 'demenageur');

-- Invariant fonctionnel : aucun de ces 5 ne doit rester is_active après UPDATE.
DO $$
DECLARE
  remaining_active INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_active
  FROM public.services
  WHERE slug IN ('jardinier', 'nettoyage', 'paysagiste', 'alarme-securite', 'demenageur')
    AND is_active = true;

  IF remaining_active > 0 THEN
    RAISE EXCEPTION 'Pivot pure-play BTP invariant violation: % services hors thèse encore is_active', remaining_active;
  END IF;
END $$;

-- ============================================================================
-- 2. DELETE PROVIDERS DES 5 SPECIALTIES HORS THÈSE
-- ============================================================================
-- Cascades attendues :
--  - bookings.provider_id          : SET NULL (mig 001)
--  - reviews.provider_id           : selon mig — typiquement CASCADE
--  - lead_assignments.provider_id  : CASCADE
--  - provider_claims.provider_id   : CASCADE (mig 314 sans ON DELETE explicite
--                                      → comportement par défaut RESTRICT.
--                                      Si claims existants : passer par
--                                      DELETE provider_claims d'abord, idem mig 490).
--  - prospection_*.artisan_id      : SET NULL (mig 301)
--  - lead_provider_dispatches      : CASCADE (mig 202+462)
DELETE FROM public.providers
WHERE specialty IN (
  'jardinier',
  'nettoyage',
  'paysagiste',
  'alarme-securite',
  'demenageur'
);

-- ============================================================================
-- 3. DELETE 5 LIGNES services DESACTIVEES (cleanup symétrique avec mig 490)
-- ============================================================================
-- bookings.service_id ON DELETE SET NULL → safe.
DELETE FROM public.services
WHERE slug IN ('jardinier', 'nettoyage', 'paysagiste', 'alarme-securite', 'demenageur')
  AND is_active = false;

-- ============================================================================
-- 4. VACUUM ANALYZE (commenté — outil migration peut wrapper en transaction)
-- ============================================================================
-- VACUUM ANALYZE public.providers;
-- VACUUM ANALYZE public.services;
