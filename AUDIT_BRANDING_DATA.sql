-- Audit branding data completeness for map/list UI
-- Only real data should drive the capture-style UI

-- 1) Global coverage of fields used by the branding
SELECT
  COUNT(*) AS total_providers,
  COUNT(*) FILTER (WHERE is_premium IS TRUE) AS premium_count,
  COUNT(*) FILTER (WHERE is_verified IS TRUE) AS verified_count,
  COUNT(*) FILTER (WHERE rating_average IS NOT NULL) AS rating_count,
  COUNT(*) FILTER (WHERE review_count IS NOT NULL) AS review_count_count,
  COUNT(*) FILTER (WHERE response_time IS NOT NULL OR avg_response_time_hours IS NOT NULL) AS response_time_count,
  COUNT(*) FILTER (WHERE years_on_platform IS NOT NULL) AS experience_count,
  COUNT(*) FILTER (WHERE employee_count IS NOT NULL) AS employee_count_count,
  COUNT(*) FILTER (WHERE address_street IS NOT NULL) AS address_street_count,
  COUNT(*) FILTER (WHERE address_city IS NOT NULL) AS address_city_count
FROM providers
WHERE is_active IS TRUE;

-- 2) Premium providers missing any key branding field
SELECT
  id,
  name,
  slug,
  is_premium,
  is_verified,
  rating_average,
  review_count,
  response_time,
  avg_response_time_hours,
  years_on_platform,
  employee_count,
  address_street,
  address_city
FROM providers
WHERE is_active IS TRUE
  AND is_premium IS TRUE
  AND (
    is_verified IS DISTINCT FROM TRUE
    OR rating_average IS NULL
    OR review_count IS NULL
    OR (response_time IS NULL AND avg_response_time_hours IS NULL)
    OR years_on_platform IS NULL
    OR employee_count IS NULL
    OR address_street IS NULL
    OR address_city IS NULL
  )
ORDER BY name;

-- 3) Verified providers without rating/reviews (will hide top-right score)
SELECT
  id,
  name,
  slug,
  is_verified,
  rating_average,
  review_count
FROM providers
WHERE is_active IS TRUE
  AND is_verified IS TRUE
  AND (rating_average IS NULL OR review_count IS NULL)
ORDER BY name;

-- 4) Map list: missing address fields for card subtitle
SELECT
  id,
  name,
  slug,
  address_street,
  address_postal_code,
  address_city
FROM providers
WHERE is_active IS TRUE
  AND (address_street IS NULL OR address_city IS NULL)
ORDER BY name;

-- 5) Missing premium badge data (premium but not verified)
SELECT
  id,
  name,
  slug,
  is_premium,
  is_verified
FROM providers
WHERE is_active IS TRUE
  AND is_premium IS TRUE
  AND is_verified IS DISTINCT FROM TRUE
ORDER BY name;
