-- =============================================================================
-- Migration 463: dispatch_lead — claim-aware score boost (Pilier 1 enabler)
-- ServicesArtisans — 2026-04-20
-- =============================================================================
-- Context:
--   Supply-side audit shows 970 339 providers / 19 claimed / 16 active claimed.
--   Over 30 days, 58/58 lead assignments went to UNCLAIMED artisans → 0 accept.
--   Unclaimed providers have no account, no email alerts, no motivation to
--   respond. The flywheel dies before ever starting.
--
--   Fix: bias the dispatcher toward claimed artisans via an additive score
--   boost, configurable through algorithm_config.claimed_boost_weight. Zero
--   by default (opt-in) so existing dispatch behavior is unchanged until we
--   flip the switch once 100+ claimed artisans are onboarded.
--
--   Rationale for boost-not-filter:
--     - Filter would starve 99.998% of zones (only 16 claimed, national).
--     - Boost lets claimed artisans outcompete on score without hard-excluding
--       unclaimed ones; once enough claimed exist per zone, boost becomes
--       de-facto filter.
--     - Reversible in one UPDATE (no migration to roll back).
--
-- Post-apply:
--   - algorithm_config.claimed_boost_weight defaults to 0 (no change).
--   - Once Pilier 1 supply campaign reaches 100 claimed, set to 30-50:
--       UPDATE algorithm_config SET claimed_boost_weight = 40 WHERE id = (...);
--
-- Variable naming: prefixed `_` to avoid the Supabase SQL editor PL/pgSQL
-- auto-RLS quirk (cf. memory feedback_supabase_plpgsql_auto_rls).
-- =============================================================================

BEGIN;

-- 1. Add the config column (idempotent, off by default)
ALTER TABLE public.algorithm_config
  ADD COLUMN IF NOT EXISTS claimed_boost_weight REAL NOT NULL DEFAULT 0.0;

COMMENT ON COLUMN public.algorithm_config.claimed_boost_weight IS
  'Additive score bonus for providers with user_id (claimed fiche). 0 = disabled. Recommended 30-50 once ≥100 claimed. Migration 463.';

-- 2. Recreate dispatch_lead with claimed boost added to the score formula.
--    Same 9-param signature as migration 462 — no PGRST202 fallback needed.
CREATE OR REPLACE FUNCTION dispatch_lead(
  p_lead_id UUID,
  p_service_name TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_urgency TEXT DEFAULT 'normal',
  p_latitude DOUBLE PRECISION DEFAULT NULL,
  p_longitude DOUBLE PRECISION DEFAULT NULL,
  p_source_table TEXT DEFAULT 'devis_requests',
  p_cee_eligible BOOLEAN DEFAULT false
)
RETURNS UUID[] AS $$
DECLARE
  _cfg RECORD;
  _lock BIGINT;
  _cnt INT := 0;
  _out UUID[] := '{}';
  _prov RECORD;
  _geo GEOGRAPHY;
  _urg_mult REAL := 1.0;
  _dept TEXT;
  _has_loc BOOLEAN;
BEGIN
  SELECT * INTO _cfg FROM public.algorithm_config LIMIT 1;

  IF _cfg IS NULL THEN
    INSERT INTO public.algorithm_config (id) VALUES (gen_random_uuid())
    ON CONFLICT DO NOTHING;
    SELECT * INTO _cfg FROM public.algorithm_config LIMIT 1;
  END IF;

  _lock := ('x' || left(replace(p_lead_id::text, '-', ''), 16))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(_lock);

  IF EXISTS (
    SELECT 1 FROM lead_assignments
    WHERE lead_id = p_lead_id AND source_table = p_source_table
  ) THEN
    SELECT array_agg(provider_id) INTO _out
    FROM lead_assignments
    WHERE lead_id = p_lead_id AND source_table = p_source_table;
    RETURN _out;
  END IF;

  IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
    _geo := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography;
  END IF;

  IF p_postal_code IS NOT NULL AND length(p_postal_code) >= 2 THEN
    _dept := left(p_postal_code, 2);
  END IF;

  _has_loc := (_geo IS NOT NULL OR p_city IS NOT NULL OR p_postal_code IS NOT NULL);

  _urg_mult := CASE p_urgency
    WHEN 'flexible' THEN _cfg.urgency_low_multiplier
    WHEN 'normal'   THEN _cfg.urgency_medium_multiplier
    WHEN 'semaine'  THEN _cfg.urgency_medium_multiplier
    WHEN 'mois'     THEN _cfg.urgency_low_multiplier
    WHEN 'urgent'   THEN _cfg.urgency_high_multiplier
    WHEN 'tres_urgent' THEN _cfg.urgency_emergency_multiplier
    ELSE _cfg.urgency_medium_multiplier
  END;

  FOR _prov IN
    SELECT
      p.id AS provider_id,
      CASE WHEN p.location IS NOT NULL AND _geo IS NOT NULL
        THEN ST_Distance(p.location, _geo) / 1000.0
        ELSE NULL
      END AS distance_km,
      CASE _cfg.matching_strategy
        WHEN 'round_robin' THEN 0::real
        WHEN 'geographic' THEN
          CASE WHEN p.location IS NOT NULL AND _geo IS NOT NULL
            THEN (1.0 - LEAST(ST_Distance(p.location, _geo) / 1000.0
                  / GREATEST(_cfg.geo_radius_km, 1), 1.0)) * 100.0
            ELSE 0
          END::real
        ELSE
          (
            (COALESCE(p.rating_average, 0)::real / 5.0 * _cfg.weight_rating)
            + (LEAST(COALESCE(p.review_count, 0), 100)::real / 100.0 * _cfg.weight_reviews)
            + (CASE WHEN p.is_verified = true THEN _cfg.weight_verified ELSE 0 END)
            + (CASE WHEN p.location IS NOT NULL AND _geo IS NOT NULL
                THEN (1.0 - LEAST(ST_Distance(p.location, _geo) / 1000.0
                      / GREATEST(_cfg.geo_radius_km, 1), 1.0))
                      * _cfg.weight_proximity
                ELSE 0
              END)
            + (COALESCE(p.data_quality_score, 0)::real / 100.0 * _cfg.weight_data_quality)
            + (CASE WHEN p_cee_eligible
                     AND p.rge_qualifications IS NOT NULL
                     AND p.rge_valid_until IS NOT NULL
                     AND p.rge_valid_until > CURRENT_DATE
                THEN _cfg.rge_boost_weight
                ELSE 0
              END)
            -- NEW (migration 463): boost claimed artisans to fix 0% accept rate.
            -- Off by default (claimed_boost_weight = 0); opt-in once ≥100 claimed.
            + (CASE WHEN p.user_id IS NOT NULL
                THEN COALESCE(_cfg.claimed_boost_weight, 0)
                ELSE 0
              END)
          ) * _urg_mult
      END AS computed_score
    FROM providers p
    WHERE p.is_active = true
      AND (
        NOT _has_loc
        OR
        (_geo IS NOT NULL AND p.location IS NOT NULL
         AND ST_DWithin(p.location, _geo, _cfg.geo_radius_km * 1000))
        OR
        (_geo IS NULL AND p_city IS NOT NULL
         AND p.address_city IS NOT NULL
         AND lower(unaccent(p.address_city)) = lower(unaccent(p_city)))
        OR
        (_geo IS NULL AND p_postal_code IS NOT NULL
         AND p.address_postal_code IS NOT NULL
         AND left(p.address_postal_code, 2) = left(p_postal_code, 2))
      )
      AND (NOT _cfg.require_same_department OR _dept IS NULL
           OR p.address_postal_code IS NULL
           OR left(p.address_postal_code, 2) = _dept)
      AND (NOT _cfg.require_specialty_match OR p_service_name IS NULL
           OR (CASE _cfg.specialty_match_mode
                WHEN 'exact' THEN p.specialty = p_service_name
                WHEN 'fuzzy' THEN (p.specialty ILIKE '%' || p_service_name || '%'
                  OR COALESCE(p.libelle_naf, '') ILIKE '%' || p_service_name || '%')
                ELSE p.specialty ILIKE '%' || p_service_name || '%'
              END))
      AND (_cfg.min_rating = 0 OR COALESCE(p.rating_average, 0) >= _cfg.min_rating)
      AND (NOT _cfg.require_verified_urgent
           OR p_urgency NOT IN ('urgent', 'tres_urgent')
           OR p.is_verified = true)
      AND (_cfg.exclude_inactive_days = 0
           OR p.last_lead_assigned_at IS NULL
           OR p.last_lead_assigned_at > now() - (_cfg.exclude_inactive_days || ' days')::interval)
      AND (_cfg.cooldown_minutes = 0
           OR p.last_lead_assigned_at IS NULL
           OR p.last_lead_assigned_at < now() - (_cfg.cooldown_minutes || ' minutes')::interval)
      AND (
        NOT p_cee_eligible
        OR NOT _cfg.require_rge_for_cee
        OR (p.rge_qualifications IS NOT NULL
            AND p.rge_valid_until IS NOT NULL
            AND p.rge_valid_until > CURRENT_DATE)
      )
      AND p.id NOT IN (
        SELECT la.provider_id FROM lead_assignments la
        WHERE la.lead_id = p_lead_id AND la.source_table = p_source_table)
    ORDER BY
      CASE WHEN _cfg.matching_strategy = 'round_robin'
        THEN EXTRACT(EPOCH FROM COALESCE(p.last_lead_assigned_at, '1970-01-01'::timestamptz))
        ELSE 0
      END ASC,
      computed_score DESC,
      random()
    LIMIT _cfg.max_artisans_per_lead * 2
  LOOP
    IF _cfg.daily_lead_quota > 0 THEN
      IF (SELECT count(*) FROM lead_assignments
          WHERE provider_id = _prov.provider_id
            AND assigned_at >= date_trunc('day', now())
      ) >= _cfg.daily_lead_quota THEN
        CONTINUE;
      END IF;
    END IF;

    IF _cfg.monthly_lead_quota > 0 THEN
      IF (SELECT count(*) FROM lead_assignments
          WHERE provider_id = _prov.provider_id
            AND assigned_at >= date_trunc('month', now())
      ) >= _cfg.monthly_lead_quota THEN
        CONTINUE;
      END IF;
    END IF;

    _cnt := _cnt + 1;

    INSERT INTO lead_assignments (lead_id, provider_id, source_table, score, distance_km, position)
    VALUES (p_lead_id, _prov.provider_id, p_source_table,
            _prov.computed_score, _prov.distance_km, _cnt);

    UPDATE providers SET last_lead_assigned_at = now()
    WHERE id = _prov.provider_id;

    _out := _out || _prov.provider_id;

    EXIT WHEN _cnt >= _cfg.max_artisans_per_lead;
  END LOOP;

  RETURN _out;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Qualified COMMENT (signature-explicit to avoid 42725 re-emergence)
COMMENT ON FUNCTION dispatch_lead(
  UUID, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, BOOLEAN
) IS
  'Distributes a lead to artisans per algorithm_config. Location filter: coords > city > department. Score: rating + reviews + verified + proximity + data_quality + RGE-boost (if CEE) + claimed-boost. Migration 463 = 462 + claimed_boost_weight for Pilier 1 supply activation.';

COMMIT;
