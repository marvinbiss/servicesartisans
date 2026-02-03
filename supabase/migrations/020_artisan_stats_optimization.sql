-- Migration 020: Artisan Stats Optimization
-- Fixes N+1 queries in statistiques page with single RPC call

-- Create optimized function to get all artisan stats in one query
CREATE OR REPLACE FUNCTION get_artisan_dashboard_stats(
  p_artisan_id UUID,
  p_period TEXT DEFAULT 'month'
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_now TIMESTAMP := NOW();
  v_period_start DATE;
  v_last_period_start DATE;
  v_last_period_end DATE;
BEGIN
  -- Calculate period boundaries
  CASE p_period
    WHEN 'week' THEN
      v_period_start := DATE_TRUNC('week', v_now);
      v_last_period_start := v_period_start - INTERVAL '1 week';
      v_last_period_end := v_period_start - INTERVAL '1 day';
    WHEN 'year' THEN
      v_period_start := DATE_TRUNC('year', v_now);
      v_last_period_start := v_period_start - INTERVAL '1 year';
      v_last_period_end := v_period_start - INTERVAL '1 day';
    ELSE -- month (default)
      v_period_start := DATE_TRUNC('month', v_now);
      v_last_period_start := v_period_start - INTERVAL '1 month';
      v_last_period_end := v_period_start - INTERVAL '1 day';
  END CASE;

  SELECT json_build_object(
    -- Total bookings (all time, confirmed/completed)
    'totalBookings', (
      SELECT COUNT(*)
      FROM bookings b
      WHERE b.artisan_id = p_artisan_id
        AND b.status IN ('confirmed', 'completed')
    ),

    -- This period bookings
    'periodBookings', (
      SELECT COUNT(*)
      FROM bookings b
      JOIN availability_slots s ON b.slot_id = s.id
      WHERE b.artisan_id = p_artisan_id
        AND b.status IN ('confirmed', 'completed')
        AND s.date >= v_period_start
    ),

    -- Last period bookings (for comparison)
    'lastPeriodBookings', (
      SELECT COUNT(*)
      FROM bookings b
      JOIN availability_slots s ON b.slot_id = s.id
      WHERE b.artisan_id = p_artisan_id
        AND b.status IN ('confirmed', 'completed')
        AND s.date >= v_last_period_start
        AND s.date < v_period_start
    ),

    -- Revenue this period (from deposits)
    'periodRevenue', COALESCE((
      SELECT SUM(b.deposit_amount)
      FROM bookings b
      JOIN availability_slots s ON b.slot_id = s.id
      WHERE b.artisan_id = p_artisan_id
        AND b.status IN ('confirmed', 'completed')
        AND s.date >= v_period_start
    ), 0) / 100.0,

    -- Revenue last period
    'lastPeriodRevenue', COALESCE((
      SELECT SUM(b.deposit_amount)
      FROM bookings b
      JOIN availability_slots s ON b.slot_id = s.id
      WHERE b.artisan_id = p_artisan_id
        AND b.status IN ('confirmed', 'completed')
        AND s.date >= v_last_period_start
        AND s.date < v_period_start
    ), 0) / 100.0,

    -- Average rating
    'averageRating', COALESCE((
      SELECT ROUND(AVG(r.rating)::numeric, 1)
      FROM reviews r
      WHERE r.artisan_id = p_artisan_id
    ), 0),

    -- Total reviews
    'totalReviews', (
      SELECT COUNT(*)
      FROM reviews r
      WHERE r.artisan_id = p_artisan_id
    ),

    -- Upcoming bookings
    'upcomingBookings', (
      SELECT COUNT(*)
      FROM bookings b
      JOIN availability_slots s ON b.slot_id = s.id
      WHERE b.artisan_id = p_artisan_id
        AND b.status = 'confirmed'
        AND s.date >= CURRENT_DATE
    ),

    -- Cancel rate
    'cancelRate', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN
          ROUND((COUNT(*) FILTER (WHERE status = 'cancelled')::numeric / COUNT(*)) * 100)
        ELSE 0
      END
      FROM bookings
      WHERE artisan_id = p_artisan_id
    ),

    -- Bookings by day of week (0=Sunday, 6=Saturday)
    'bookingsByDay', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'day', day_num,
          'count', cnt
        ) ORDER BY day_num
      ), '[]'::json)
      FROM (
        SELECT
          EXTRACT(DOW FROM s.date)::int as day_num,
          COUNT(*) as cnt
        FROM bookings b
        JOIN availability_slots s ON b.slot_id = s.id
        WHERE b.artisan_id = p_artisan_id
          AND b.status IN ('confirmed', 'completed')
        GROUP BY EXTRACT(DOW FROM s.date)
      ) days
    ),

    -- Bookings by month (last 6 months)
    'bookingsByMonth', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'month', TO_CHAR(month, 'Mon'),
          'monthNum', EXTRACT(MONTH FROM month)::int,
          'count', cnt
        ) ORDER BY month
      ), '[]'::json)
      FROM (
        SELECT
          DATE_TRUNC('month', s.date) as month,
          COUNT(*) as cnt
        FROM bookings b
        JOIN availability_slots s ON b.slot_id = s.id
        WHERE b.artisan_id = p_artisan_id
          AND b.status IN ('confirmed', 'completed')
          AND s.date >= v_now - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', s.date)
      ) months
    ),

    -- Top services
    'topServices', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'name', service_description,
          'count', cnt
        ) ORDER BY cnt DESC
      ), '[]'::json)
      FROM (
        SELECT
          COALESCE(service_description, 'Non spécifié') as service_description,
          COUNT(*) as cnt
        FROM bookings
        WHERE artisan_id = p_artisan_id
          AND status IN ('confirmed', 'completed')
        GROUP BY service_description
        ORDER BY cnt DESC
        LIMIT 5
      ) services
    ),

    -- Fill rate (percentage of available slots that are booked)
    'fillRate', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN
          ROUND((COUNT(*) FILTER (WHERE is_available = false)::numeric / COUNT(*)) * 100)
        ELSE 0
      END
      FROM availability_slots
      WHERE artisan_id = p_artisan_id
        AND date >= CURRENT_DATE - INTERVAL '30 days'
        AND date <= CURRENT_DATE
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for faster booking queries by artisan and status
CREATE INDEX IF NOT EXISTS idx_bookings_artisan_status_date
ON bookings(artisan_id, status)
INCLUDE (deposit_amount, slot_id);

-- Index for reviews by artisan
CREATE INDEX IF NOT EXISTS idx_reviews_artisan_rating
ON reviews(artisan_id)
INCLUDE (rating);

-- Index for availability slots date range
CREATE INDEX IF NOT EXISTS idx_availability_slots_artisan_date
ON availability_slots(artisan_id, date)
INCLUDE (is_available);

COMMENT ON FUNCTION get_artisan_dashboard_stats IS 'Single optimized query for artisan dashboard stats - fixes N+1 problem';
