-- Migration: Intelligent Search System
-- Phase 5: World-Class Recherche Intelligente

-- Enable PostGIS extension for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography column to providers for spatial queries
ALTER TABLE providers ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- Update location from existing lat/lon columns
UPDATE providers
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

-- Create trigger to auto-update location when lat/lon changes
CREATE OR REPLACE FUNCTION update_provider_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_provider_location ON providers;
CREATE TRIGGER trigger_update_provider_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON providers
FOR EACH ROW EXECUTE FUNCTION update_provider_location();

-- Add full-text search vector to providers
ALTER TABLE providers ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_provider_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.specialty, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.meta_description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.address_city, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.address_department, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_provider_search_vector ON providers;
CREATE TRIGGER trigger_update_provider_search_vector
BEFORE INSERT OR UPDATE ON providers
FOR EACH ROW EXECUTE FUNCTION update_provider_search_vector();

-- Update existing search vectors
UPDATE providers SET search_vector =
    setweight(to_tsvector('french', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(specialty, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(meta_description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(address_city, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(address_department, '')), 'C')
WHERE search_vector IS NULL;

-- Saved search alerts for users
CREATE TABLE IF NOT EXISTS saved_search_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    query TEXT,
    filters JSONB, -- {service: 'plomberie', location: 'Paris', minRating: 4, maxPrice: 100}
    location_lat DECIMAL(10, 7),
    location_lon DECIMAL(10, 7),
    radius_km INTEGER DEFAULT 25,
    frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly', 'never')),
    is_active BOOLEAN DEFAULT true,
    last_checked TIMESTAMPTZ DEFAULT NOW(),
    last_notified TIMESTAMPTZ,
    new_results_count INTEGER DEFAULT 0,
    total_alerts_sent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search analytics for artisans
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    user_id UUID,
    session_id TEXT,
    search_query TEXT,
    filters JSONB,
    position_in_results INTEGER,
    total_results INTEGER,
    was_clicked BOOLEAN DEFAULT false,
    was_contacted BOOLEAN DEFAULT false,
    click_timestamp TIMESTAMPTZ,
    contact_timestamp TIMESTAMPTZ,
    device_type TEXT,
    source TEXT, -- 'web', 'mobile', 'api'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search suggestions / autocomplete cache
CREATE TABLE IF NOT EXISTS search_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term TEXT NOT NULL UNIQUE,
    category TEXT, -- 'service', 'location', 'artisan'
    popularity_score INTEGER DEFAULT 0,
    last_searched TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE
);

-- Recently searched (per user)
CREATE TABLE IF NOT EXISTS user_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB,
    results_count INTEGER,
    clicked_provider_id UUID,
    searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider availability cache for fast filtering
CREATE TABLE IF NOT EXISTS provider_availability_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE UNIQUE,
    available_today BOOLEAN DEFAULT false,
    available_tomorrow BOOLEAN DEFAULT false,
    available_this_week BOOLEAN DEFAULT false,
    next_available_date DATE,
    total_slots_this_week INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Similar artisans / recommendations
CREATE TABLE IF NOT EXISTS artisan_similarities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    similar_artisan_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    similarity_score DECIMAL(4, 3) CHECK (similarity_score >= 0 AND similarity_score <= 1),
    factors JSONB, -- {service: 0.9, location: 0.8, price: 0.7}
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(artisan_id, similar_artisan_id)
);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_providers_location_gist ON providers USING GIST(location);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_providers_search_vector ON providers USING GIN(search_vector);

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_saved_search_alerts_user ON saved_search_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_search_alerts_active ON saved_search_alerts(is_active, frequency, last_checked);
CREATE INDEX IF NOT EXISTS idx_search_analytics_artisan ON search_analytics(artisan_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created ON search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_term ON search_suggestions(term);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_category ON search_suggestions(category);
CREATE INDEX IF NOT EXISTS idx_user_search_history_user ON user_search_history(user_id, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_provider_availability_cache_provider ON provider_availability_cache(provider_id);
CREATE INDEX IF NOT EXISTS idx_artisan_similarities_artisan ON artisan_similarities(artisan_id, similarity_score DESC);

-- Add price range columns to providers for filtering
ALTER TABLE providers ADD COLUMN IF NOT EXISTS hourly_rate_min DECIMAL(10, 2);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS hourly_rate_max DECIMAL(10, 2);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS intervention_zone TEXT DEFAULT '25 km';

-- Function to search providers with distance
CREATE OR REPLACE FUNCTION search_providers_by_distance(
    p_lat DECIMAL,
    p_lon DECIMAL,
    p_radius_km INTEGER DEFAULT 25,
    p_query TEXT DEFAULT NULL,
    p_service TEXT DEFAULT NULL,
    p_min_rating DECIMAL DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_trust_badge TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'distance',
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    specialty TEXT,
    address_city TEXT,
    address_postal_code TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    rating_average DECIMAL,
    review_count INTEGER,
    trust_badge TEXT,
    trust_score INTEGER,
    hourly_rate_min DECIMAL,
    hourly_rate_max DECIMAL,
    is_verified BOOLEAN,
    is_premium BOOLEAN,
    distance_km DECIMAL,
    phone TEXT,
    email TEXT,
    website TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.slug,
        p.specialty,
        p.address_city,
        p.address_postal_code,
        p.latitude,
        p.longitude,
        p.rating_average,
        p.review_count,
        p.trust_badge,
        p.trust_score,
        p.hourly_rate_min,
        p.hourly_rate_max,
        p.is_verified,
        p.is_premium,
        ROUND((ST_Distance(
            p.location,
            ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography
        ) / 1000)::DECIMAL, 2) as distance_km,
        p.phone,
        p.email,
        p.website
    FROM providers p
    WHERE p.is_active = true
        AND (p_lat IS NULL OR p_lon IS NULL OR ST_DWithin(
            p.location,
            ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
            p_radius_km * 1000
        ))
        AND (p_query IS NULL OR p.search_vector @@ plainto_tsquery('french', p_query))
        AND (p_service IS NULL OR p.specialty ILIKE '%' || p_service || '%')
        AND (p_min_rating IS NULL OR p.rating_average >= p_min_rating)
        AND (p_min_price IS NULL OR p.hourly_rate_min >= p_min_price)
        AND (p_max_price IS NULL OR p.hourly_rate_max <= p_max_price)
        AND (p_trust_badge IS NULL OR p.trust_badge = p_trust_badge)
    ORDER BY
        CASE WHEN p_sort_by = 'distance' AND p_lat IS NOT NULL THEN
            ST_Distance(p.location, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography)
        END ASC NULLS LAST,
        CASE WHEN p_sort_by = 'rating' THEN p.rating_average END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'price_low' THEN p.hourly_rate_min END ASC NULLS LAST,
        CASE WHEN p_sort_by = 'price_high' THEN p.hourly_rate_max END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'relevance' OR p_sort_by IS NULL THEN
            p.is_premium::INTEGER * 1000 + p.trust_score
        END DESC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE saved_search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved searches" ON saved_search_alerts
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own saved searches" ON saved_search_alerts
FOR ALL USING (user_id = auth.uid());

ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can view their own search analytics" ON search_analytics
FOR SELECT USING (artisan_id IN (
    SELECT id FROM providers WHERE user_id = auth.uid()
));

ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search history" ON user_search_history
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own search history" ON user_search_history
FOR ALL USING (user_id = auth.uid());

ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view search suggestions" ON search_suggestions
FOR SELECT USING (is_active = true);

ALTER TABLE provider_availability_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view provider availability" ON provider_availability_cache
FOR SELECT USING (true);

ALTER TABLE artisan_similarities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artisan similarities" ON artisan_similarities
FOR SELECT USING (true);
