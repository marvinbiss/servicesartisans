-- Migration 321: Fix search_providers_by_distance() function
-- Columns trust_badge, trust_score, hourly_rate_min, hourly_rate_max, is_premium
-- were dropped in migration 100_v2_schema_cleanup.sql.
-- This migration replaces the function with a version using only current columns.

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
    is_verified BOOLEAN,
    data_quality_score INTEGER,
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
        p.is_verified,
        p.data_quality_score,
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
    ORDER BY
        CASE WHEN p_sort_by = 'distance' AND p_lat IS NOT NULL THEN
            ST_Distance(p.location, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography)
        END ASC NULLS LAST,
        CASE WHEN p_sort_by = 'rating' THEN p.rating_average END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'relevance' OR p_sort_by IS NULL THEN
            p.data_quality_score
        END DESC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
