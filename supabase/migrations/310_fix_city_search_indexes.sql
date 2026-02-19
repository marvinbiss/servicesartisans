-- =============================================================================
-- Migration 310 : Index optimisés pour la recherche par ville
-- ServicesArtisans — 2026-02-19
-- =============================================================================
-- Problème : les requêtes ILIKE sur address_city avec 743K providers
-- ne peuvent pas utiliser le B-tree index efficacement quand des wildcards
-- (%) sont présents, causant des timeouts.
--
-- Solution :
--   1. Index fonctionnel sur lower(address_city) pour les correspondances
--      exactes case-insensitive (ILIKE sans wildcards).
--   2. Extension pg_trgm + GIN index pour les recherches partielles (admin).
--   3. Index composite optimisé pour la requête principale du site :
--      specialty + lower(address_city) WHERE is_active = true.
-- =============================================================================

-- 1. Extension pg_trgm (généralement déjà activée sur Supabase)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Index fonctionnel pour correspondance exacte case-insensitive
--    Utilisé par : getProvidersByServiceAndLocation, getProviderCountByServiceAndLocation
CREATE INDEX IF NOT EXISTS idx_providers_city_lower
  ON providers (lower(address_city))
  WHERE is_active = TRUE AND address_city IS NOT NULL;

-- 3. Index GIN trigram pour les recherches partielles (admin, API search)
--    Utilisé par : /api/admin/providers (recherche textuelle)
CREATE INDEX IF NOT EXISTS idx_providers_city_trgm
  ON providers USING gin (address_city gin_trgm_ops)
  WHERE is_active = TRUE AND address_city IS NOT NULL;

-- 4. Index composite optimisé : specialty + city (case-insensitive)
--    Remplace idx_providers_specialty_city_active qui n'est pas efficace
--    pour ILIKE (case-insensitive match).
CREATE INDEX IF NOT EXISTS idx_providers_specialty_city_lower_active
  ON providers (specialty, lower(address_city))
  WHERE is_active = TRUE;
