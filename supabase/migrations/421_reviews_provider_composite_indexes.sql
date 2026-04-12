-- =============================================================================
-- Migration 421 : Index composites pour reviews et providers
-- =============================================================================
-- Date        : 2026-04-12
-- Contexte    : Les requêtes fréquentes sur reviews (filtrage par provider_id +
--               status + tri created_at DESC) et sur providers (agrégation par
--               département + spécialité) ne bénéficient d'aucun index composite
--               adapté. L'index existant idx_reviews_provider_rating couvre
--               (provider_id, rating) mais pas le pattern status + created_at.
--
-- CONCURRENTLY : évite le verrouillage exclusif en prod.
-- =============================================================================

-- 1. Index composite reviews : provider_id + status + created_at DESC
--    Supports: WHERE provider_id = X AND status = 'published' ORDER BY created_at DESC
--    Remplace le pattern couvert par l'ancien idx_reviews_artisan_status_created
--    qui indexe artisan_id (colonne legacy)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_provider_status_created
ON reviews (provider_id, status, created_at DESC);

-- 2. Index composite providers : département + spécialité + is_active (partiel)
--    Supports: JOIN providers ON reviews.provider_id = providers.id GROUP BY department
--    Optimise les agrégations d'avis au niveau département
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_providers_dept_specialty_active
ON providers (address_department, specialty_slug, is_active)
WHERE is_active = true;
