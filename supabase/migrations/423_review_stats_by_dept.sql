-- Materialized view: aggregated review stats by department × specialty
CREATE MATERIALIZED VIEW IF NOT EXISTS review_stats_by_dept AS
SELECT
  p.specialty AS specialty_slug,
  p.address_department,
  COUNT(*) as review_count,
  ROUND(AVG(r.rating)::numeric, 1) as avg_rating,
  MAX(r.created_at) as latest_review_at
FROM reviews r
JOIN providers p ON p.id = r.provider_id
WHERE r.status = 'published' AND p.is_active = true
GROUP BY p.specialty, p.address_department;

-- Unique index for fast lookups + required for REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_stats_dept_specialty
ON review_stats_by_dept (address_department, specialty_slug);

-- Grant read access
GRANT SELECT ON review_stats_by_dept TO anon, authenticated;

-- Refresh function (NOT prefixed refresh_ — Supabase SQL editor quirk)
CREATE OR REPLACE FUNCTION fn_refresh_review_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY review_stats_by_dept;
END;
$$;

-- Grant execute to authenticated only (not anon)
GRANT EXECUTE ON FUNCTION fn_refresh_review_stats() TO authenticated;
