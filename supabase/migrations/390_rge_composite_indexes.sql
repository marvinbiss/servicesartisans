-- Migration 390 — Indexes composites RGE pour pSEO service×ville
--
-- Contexte : audit perf 2026-04-11 a identifié 2 requêtes critiques sur /rge/
-- qui scannaient séquentiellement ~50k lignes à chaque cache miss :
--
-- 1. `getRgeServiceCityProviders()` (src/lib/rge/service-city-listings.ts:205)
--    .in('specialty', specialties)
--    .in('address_city', cityValues)
--    .eq('is_active', true)
--    .not('rge_qualifications', 'is', null)
--    .gte('rge_valid_until', today)
--
-- 2. `getRgeGuideStats()` (src/lib/rge/guide-stats.ts:131-146)
--    .in('specialty', specialties)
--    .eq('is_active', true)
--    .not('rge_qualifications', 'is', null)
--    .gte('rge_valid_until', today)
--
-- L'index existant `idx_providers_rge_by_city (address_city, rge_valid_until)`
-- ne couvre pas `specialty`. Ici on ajoute un index composite qui permet un
-- bitmap index scan ciblé sur (specialty, address_city, rge_valid_until).
--
-- Note : `rge_valid_until > CURRENT_DATE` ne peut pas figurer dans la WHERE
-- clause de l'index (CURRENT_DATE n'est pas IMMUTABLE). On se contente du
-- filtre `IS NOT NULL` ; le runtime applique la borne date.

BEGIN;

-- Index composite pour pSEO /rge/[service]/[ville]
-- Cibles : les deux requêtes ci-dessus + toute variation future filtrant
-- simultanément sur metier et commune.
CREATE INDEX IF NOT EXISTS idx_providers_rge_specialty_city
  ON providers (specialty, address_city, rge_valid_until)
  WHERE rge_valid_until IS NOT NULL
    AND is_active = true;

-- Index composite pour stats nationales RGE par service
-- (getRgeGuideStats sans contrainte ville : filtre specialty + is_active +
-- rge_valid_until). Utile aussi pour /rge/[service] (hub métier).
CREATE INDEX IF NOT EXISTS idx_providers_rge_specialty_active
  ON providers (specialty, rge_valid_until)
  WHERE rge_valid_until IS NOT NULL
    AND is_active = true;

COMMENT ON INDEX idx_providers_rge_specialty_city IS
  'pSEO /rge/[service]/[ville] — couvre getRgeServiceCityProviders (filtre specialty + address_city + rge_valid_until).';

COMMENT ON INDEX idx_providers_rge_specialty_active IS
  'Stats RGE par service — couvre getRgeGuideStats et hub /rge/[service] (filtre specialty + rge_valid_until).';

COMMIT;
