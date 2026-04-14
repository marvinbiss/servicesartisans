-- Fix rate_limit_check atomicity:
-- The original v1 (migration 441) incremented the counter BEFORE checking the
-- limit, so 2 concurrent calls at count=limit-1 would both be stamped to
-- limit and both allowed. Also, rejected attempts inflated the counter.
--
-- v2: SELECT FOR UPDATE (row-level lock) → check count vs limit → only
-- increment if allowed. Rejected calls do not inflate the counter.

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
  v_found boolean;
BEGIN
  -- Try to acquire the row with FOR UPDATE (serialises concurrent callers)
  SELECT * INTO v_row FROM rate_limits WHERE key = p_key FOR UPDATE;
  v_found := FOUND;

  IF NOT v_found THEN
    -- First call in this window — insert fresh (atomic via PK)
    BEGIN
      INSERT INTO rate_limits (key, count, window_start, expires_at)
      VALUES (p_key, 1, v_now, v_expires)
      RETURNING * INTO v_row;
    EXCEPTION WHEN unique_violation THEN
      -- Concurrent insert won — re-fetch with lock
      SELECT * INTO v_row FROM rate_limits WHERE key = p_key FOR UPDATE;
    END;
    RETURN QUERY SELECT TRUE, GREATEST(0, p_limit - v_row.count), v_row.expires_at;
    RETURN;
  END IF;

  -- Window expired → reset
  IF v_row.expires_at < v_now THEN
    UPDATE rate_limits
    SET count = 1, window_start = v_now, expires_at = v_expires
    WHERE key = p_key
    RETURNING * INTO v_row;
    RETURN QUERY SELECT TRUE, GREATEST(0, p_limit - v_row.count), v_row.expires_at;
    RETURN;
  END IF;

  -- Over limit → reject WITHOUT incrementing (prevents counter inflation)
  IF v_row.count >= p_limit THEN
    RETURN QUERY SELECT FALSE, 0, v_row.expires_at;
    RETURN;
  END IF;

  -- Under limit → increment and allow
  UPDATE rate_limits
  SET count = count + 1
  WHERE key = p_key
  RETURNING * INTO v_row;
  RETURN QUERY SELECT TRUE, GREATEST(0, p_limit - v_row.count), v_row.expires_at;
END;
$$;
