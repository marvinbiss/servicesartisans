-- Migration: Provider Performance Indexes
-- Purpose: Optimize queries for 50K+ artisans and 200K+ concurrent users
-- Date: 2026-02-01

-- Basic filtering indexes
CREATE INDEX IF NOT EXISTS idx_providers_city ON providers(address_city);
CREATE INDEX IF NOT EXISTS idx_providers_region ON providers(address_region);
CREATE INDEX IF NOT EXISTS idx_providers_department ON providers(address_department);
CREATE INDEX IF NOT EXISTS idx_providers_postal_code ON providers(address_postal_code);

-- Status filtering (partial indexes for efficiency)
CREATE INDEX IF NOT EXISTS idx_providers_verified ON providers(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_providers_active ON providers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_providers_premium ON providers(is_premium) WHERE is_premium = true;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_providers_verified_active ON providers(is_verified, is_active);
CREATE INDEX IF NOT EXISTS idx_providers_city_verified ON providers(address_city, is_verified, is_active);
CREATE INDEX IF NOT EXISTS idx_providers_region_verified ON providers(address_region, is_verified, is_active);

-- Sorting indexes
CREATE INDEX IF NOT EXISTS idx_providers_created ON providers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_providers_updated ON providers(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating_average DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_providers_review_count ON providers(review_count DESC NULLS LAST);

-- Identity lookups
CREATE INDEX IF NOT EXISTS idx_providers_siret ON providers(siret) WHERE siret IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_siren ON providers(siren) WHERE siren IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_slug ON providers(slug);
CREATE INDEX IF NOT EXISTS idx_providers_email ON providers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id) WHERE user_id IS NOT NULL;

-- Full-text search index (French language)
CREATE INDEX IF NOT EXISTS idx_providers_search ON providers
  USING gin(to_tsvector('french', COALESCE(name, '') || ' ' || COALESCE(address_city, '') || ' ' || COALESCE(meta_description, '')));

-- Source tracking
CREATE INDEX IF NOT EXISTS idx_providers_source ON providers(source);
CREATE INDEX IF NOT EXISTS idx_providers_source_id ON providers(source_id) WHERE source_id IS NOT NULL;

-- Provider services junction table optimization
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_service ON provider_services(service_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_composite ON provider_services(provider_id, service_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_primary ON provider_services(provider_id) WHERE is_primary = true;

-- Provider locations junction table optimization
CREATE INDEX IF NOT EXISTS idx_provider_locations_provider ON provider_locations(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_locations_location ON provider_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_provider_locations_primary ON provider_locations(provider_id) WHERE is_primary = true;

-- Services table optimization
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = true;

-- Locations table optimization
CREATE INDEX IF NOT EXISTS idx_locations_postal ON locations(postal_code);
CREATE INDEX IF NOT EXISTS idx_locations_department ON locations(department_code);
CREATE INDEX IF NOT EXISTS idx_locations_region ON locations(region_code);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);

-- Geospatial index for distance queries (if PostGIS is available)
-- CREATE INDEX IF NOT EXISTS idx_providers_location ON providers USING gist(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- Analyze tables after creating indexes
ANALYZE providers;
ANALYZE provider_services;
ANALYZE provider_locations;
ANALYZE services;
ANALYZE locations;

-- Comment for documentation
COMMENT ON INDEX idx_providers_search IS 'Full-text search index for provider name, city, and description';
COMMENT ON INDEX idx_providers_verified_active IS 'Composite index for filtering verified and active providers';
