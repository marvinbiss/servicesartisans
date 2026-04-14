-- Migration 436 — Index composite partiel pour les requêtes CEE
--
-- Contexte
-- --------
-- Les pages /cee/[operation] et /cee/[operation]/[ville] timeout (Postgres
-- statement_timeout) sur les opérations à large empreinte specialty
-- (BAR-EN-102 isolation murs, BAR-EN-104 fenêtres). Cf. logs Vercel
-- 2026-04-14 :
--   [getCeeTopCitiesByOperation] FAILED for BAR-EN-102 — code 57014
--
-- Le code (src/lib/cee/listings.ts) filtre :
--   WHERE specialty IN (...)
--     AND is_active = TRUE
--     AND rge_valid_until >= today
--
-- Sans index dédié, le planner choisit `idx_providers_specialty` (large pour
-- les métiers d'isolation) puis filtre — coût élevé. Le code applicatif a
-- été ajusté pour aiguiller vers `idx_providers_rge_active`, mais ce dernier
-- n'a pas la specialty en clé → re-filtre nécessaire.
--
-- Solution
-- --------
-- Index composite partiel pré-filtré aux providers RGE. Très compact
-- (~quelques % des providers) et keyed sur (specialty, address_city) :
--   - Couvre `getCeeTopCitiesByOperation` (specialty seule)
--   - Couvre `getCeeProvidersByOperationAndCity` (specialty + address_city)
--   - Couvre `getCeeProviderCountByOperationAndCity` (specialty + address_city)
--
-- Le filtre `rge_valid_until >= today` n'est PAS dans la WHERE clause de
-- l'index (CURRENT_DATE n'est pas IMMUTABLE — cf. note migration 380).

CREATE INDEX IF NOT EXISTS idx_providers_cee_specialty_city
  ON providers (specialty, address_city)
  WHERE rge_valid_until IS NOT NULL AND is_active = TRUE;

COMMENT ON INDEX idx_providers_cee_specialty_city IS
  'CEE listings: specialty IN (...) [+ address_city IN (...)] AND rge_valid_until >= today. Partial index pré-filtré RGE actifs (cf. migration 436).';
