-- Round 3 hardening — SQL slice
--
-- Fixes applied in this migration:
--
-- P0 (C1) — `unique_violation` branch in rate_limit_check (migration 442) short-
--           circuited with RETURN TRUE without re-checking count. Under
--           concurrency, N simultaneous first-window callers all received
--           `allowed=TRUE` and only the winning inserter incremented. Effective
--           rate-limit became O(1) instead of O(N). Fixed by falling through to
--           the standard check-before-increment path.
--
-- P1 (security) — SECURITY DEFINER functions `rate_limit_check` and
--                 `cleanup_rate_limits` were callable by PUBLIC (which includes
--                 `anon` and `authenticated`). An attacker holding the anon JWT
--                 could invoke `supabase.rpc('rate_limit_check', { p_limit:
--                 999999 })` to reset counters or DoS other users' buckets.
--                 Fixed by REVOKE EXECUTE FROM PUBLIC + explicit GRANT to
--                 service_role only.
--
-- P1 (token single-use) — `callbackToken` had TTL-only expiry; a leaked or
--                         replayed token created unlimited Pipedrive deals for
--                         the same estimation within 1 hour. Fixed by adding
--                         `callback_used_at` column on simulateur_estimations
--                         and gating the callback endpoint on NULL.

-- ===========================================================================
-- 1. Fix rate_limit_check atomicity (P0)
-- ===========================================================================

CREATE OR REPLACE FUNCTION rate_limit_check(
  p_key text,
  p_limit int,
  p_window_ms int
) RETURNS TABLE(allowed boolean, remaining int, reset_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row rate_limits%ROWTYPE;
  v_now timestamptz := now();
  v_expires timestamptz := v_now + make_interval(secs => p_window_ms / 1000.0);
  v_found boolean;
BEGIN
  SELECT * INTO v_row FROM rate_limits WHERE key = p_key FOR UPDATE;
  v_found := FOUND;

  IF NOT v_found THEN
    BEGIN
      INSERT INTO rate_limits (key, count, window_start, expires_at)
      VALUES (p_key, 1, v_now, v_expires)
      RETURNING * INTO v_row;
      -- Fresh insert: we own count=1 atomically; allowed.
      RETURN QUERY SELECT TRUE, GREATEST(0, p_limit - v_row.count), v_row.expires_at;
      RETURN;
    EXCEPTION WHEN unique_violation THEN
      -- Concurrent caller inserted first. Re-lock and fall through to the
      -- standard limit-check logic below (DO NOT short-circuit with TRUE —
      -- that was the v2 bug that allowed O(1) bypass under concurrency).
      SELECT * INTO v_row FROM rate_limits WHERE key = p_key FOR UPDATE;
      v_found := TRUE;
    END;
  END IF;

  -- Window expired → reset and allow.
  IF v_row.expires_at < v_now THEN
    UPDATE rate_limits
    SET count = 1, window_start = v_now, expires_at = v_expires
    WHERE key = p_key
    RETURNING * INTO v_row;
    RETURN QUERY SELECT TRUE, GREATEST(0, p_limit - v_row.count), v_row.expires_at;
    RETURN;
  END IF;

  -- Over limit → reject without incrementing.
  IF v_row.count >= p_limit THEN
    RETURN QUERY SELECT FALSE, 0, v_row.expires_at;
    RETURN;
  END IF;

  -- Under limit → increment and allow.
  UPDATE rate_limits
  SET count = count + 1
  WHERE key = p_key
  RETURNING * INTO v_row;
  RETURN QUERY SELECT TRUE, GREATEST(0, p_limit - v_row.count), v_row.expires_at;
END;
$$;

-- ===========================================================================
-- 2. Lock down RPC execution (P1 — privilege escalation)
-- ===========================================================================

REVOKE EXECUTE ON FUNCTION rate_limit_check(text, int, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION cleanup_rate_limits() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rate_limit_check(text, int, int) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_rate_limits() TO service_role;

-- ===========================================================================
-- 3. Single-use callback token (P1 — token replay)
-- ===========================================================================

ALTER TABLE simulateur_estimations
  ADD COLUMN IF NOT EXISTS callback_used_at timestamptz;

COMMENT ON COLUMN simulateur_estimations.callback_used_at IS
  'Timestamp of first successful /api/simulateur/callback for this estimation. '
  'Subsequent callbacks are rejected at the API layer (HTTP 409). Enforces '
  'single-use on callbackToken within its TTL.';
