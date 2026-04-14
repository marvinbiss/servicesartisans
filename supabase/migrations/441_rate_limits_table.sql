-- Distributed rate limit store (replaces in-memory Map)
-- Used by /api/simulateur/callback and other rate-limited endpoints.
-- In-memory Map resets per cold start on Vercel serverless, making the
-- 3/hour limit effectively unlimited. This table provides a shared store.

CREATE TABLE IF NOT EXISTS rate_limits (
  key          text PRIMARY KEY,
  count        int NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits (expires_at);

-- Cleanup function (called lazily or by cron)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void
LANGUAGE sql SECURITY DEFINER
AS $$
  DELETE FROM rate_limits WHERE expires_at < now();
$$;

-- Atomic increment RPC: returns allowed + remaining budget + reset_at
CREATE OR REPLACE FUNCTION rate_limit_check(
  p_key text,
  p_limit int,
  p_window_ms int
) RETURNS TABLE(allowed boolean, remaining int, reset_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_row rate_limits%ROWTYPE;
  v_now timestamptz := now();
  v_expires timestamptz := v_now + make_interval(secs => p_window_ms / 1000.0);
BEGIN
  INSERT INTO rate_limits (key, count, window_start, expires_at)
  VALUES (p_key, 1, v_now, v_expires)
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN rate_limits.expires_at < v_now THEN 1
      ELSE rate_limits.count + 1
    END,
    window_start = CASE
      WHEN rate_limits.expires_at < v_now THEN v_now
      ELSE rate_limits.window_start
    END,
    expires_at = CASE
      WHEN rate_limits.expires_at < v_now THEN v_expires
      ELSE rate_limits.expires_at
    END
  RETURNING * INTO v_row;

  RETURN QUERY SELECT
    v_row.count <= p_limit AS allowed,
    GREATEST(0, p_limit - v_row.count) AS remaining,
    v_row.expires_at AS reset_at;
END;
$$;

-- RLS: service_role only (admin client bypasses)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rate_limits FROM anon, authenticated;
