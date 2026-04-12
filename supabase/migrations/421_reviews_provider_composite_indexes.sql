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
-- NOTE: NOT CONCURRENTLY — Supabase migrations run inside transactions
-- (cf. migration 351 convention)
-- =============================================================================

-- 1. Index composite reviews : provider_id + status + created_at DESC
--    Supports: WHERE provider_id = X AND status = 'published' ORDER BY created_at DESC
--    Complète idx_reviews_artisan_status_created qui indexe artisan_id (colonne legacy)
CREATE INDEX IF NOT EXISTS idx_reviews_provider_status_created
ON reviews (provider_id, status, created_at DESC);

-- 2. Index partiel providers : département + spécialité (actifs uniquement)
--    Supports: agrégations d'avis au niveau département, fallback cascade
--    Complète idx_providers_dept_specialty (migration 109) qui utilise specialty (pas specialty_slug)
CREATE INDEX IF NOT EXISTS idx_providers_dept_specialty_active
ON providers (address_department, specialty)
WHERE is_active = true;
