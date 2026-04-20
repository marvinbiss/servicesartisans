-- =============================================================================
-- Migration 462: Ship dispatch_lead RGE-aware (consolidates 391 + 461 fixes)
-- ServicesArtisans — 2026-04-20
-- =============================================================================
-- Context:
--   Migration 391 (2026-04-11) was written but never cleanly applied in prod.
--   It had two defects:
--     (a) line 136 reintroduced the stale v_config.weight_response_rate
--         (renamed to weight_data_quality by migration 303) — same root bug
--         fixed by migration 461.
--     (b) line 249 had `COMMENT ON FUNCTION dispatch_lead IS ...` without
--         qualifying the argument list, which raises 42725 as soon as two
--         overloads coexist (the 8-param from 363/461 and the 9-param 391 adds).
--
--   Migration 461 already stabilised the 8-param signature in prod and
--   restored the dispatch flywheel. This 462 ships the RGE-aware version
--   cleanly by:
--     1. DROPping the 8-param signature first (avoids overload collision)
--     2. Recreating with 9 params AND weight_data_quality
--     3. Qualifying COMMENT ON FUNCTION with the full argument list
--
-- Post-apply:
--   dispatch_lead has a single signature (9 params). The TS fallback from
--   PGRST202 → 8-param in src/app/actions/dispatch.ts becomes a no-op (safe
--   to leave in place but never triggers).
-- =============================================================================

BEGIN;

-- 1. Config columns (idempotent; already present if 391 was partially applied)
ALTER TABLE public.algorithm_config
  ADD COLUMN IF NOT EXISTS rge_boost_weight REAL NOT NULL DEFAULT 20.0;

ALTER TABLE public.algorithm_config
  ADD COLUMN IF NOT EXISTS require_rge_for_cee BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.algorithm_config.rge_boost_weight IS
  'Score bonus added to RGE-valid artisans when the lead is CEE-eligible. Migration 462.';
COMMENT ON COLUMN public.algorithm_config.require_rge_for_cee IS
  'If true, CEE-eligible leads are hard-filtered to RGE-valid artisans only. Opt-in (defaults false) to avoid dropouts in low-RGE-density zones. Migration 462.';

-- 2. Drop the 8-param signature from migration 461 to avoid overload collision.
--    Use IF EXISTS so the migration is re-runnable if partially applied.
DROP FUNCTION IF EXISTS dispatch_lead(
  UUID, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT
);

-- 3. Recreate with 9 params + weight_data_quality (461 fix preserved)
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
  v_config RECORD;
  v_lock BIGINT;
  v_count INT := 0;
  v_assigned UUID[] := '{}';
  v_provider RECORD;
  v_lead_geo GEOGRAPHY;
  v_urgency_multiplier REAL := 1.0;
  v_department TEXT;
  v_has_location_info BOOLEAN;
BEGIN
  SELECT * INTO v_config FROM public.algorithm_config LIMIT 1;

  IF v_config IS NULL THEN
    INSERT INTO public.algorithm_config (id) VALUES (gen_random_uuid())
    ON CONFLICT DO NOTHING;
    SELECT * INTO v_config FROM public.algorithm_config LIMIT 1;
  END IF;

  v_lock := ('x' || left(replace(p_lead_id::text, '-', ''), 16))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(v_lock);

  IF EXISTS (
    SELECT 1 FROM lead_assignments
    WHERE lead_id = p_lead_id AND source_table = p_source_table
  ) THEN
    SELECT array_agg(provider_id) INTO v_assigned
    FROM lead_assignments
    WHERE lead_id = p_lead_id AND source_table = p_source_table;
    RETURN v_assigned;
  END IF;

  IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
    v_lead_geo := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography;
  END IF;

  IF p_postal_code IS NOT NULL AND length(p_postal_code) >= 2 THEN
    v_department := left(p_postal_code, 2);
  END IF;

  v_has_location_info := (v_lead_geo IS NOT NULL OR p_city IS NOT NULL OR p_postal_code IS NOT NULL);

  v_urgency_multiplier := CASE p_urgency
    WHEN 'flexible' THEN v_config.urgency_low_multiplier
    WHEN 'normal'   THEN v_config.urgency_medium_multiplier
    WHEN 'semaine'  THEN v_config.urgency_medium_multiplier
    WHEN 'mois'     THEN v_config.urgency_low_multiplier
    WHEN 'urgent'   THEN v_config.urgency_high_multiplier
    WHEN 'tres_urgent' THEN v_config.urgency_emergency_multiplier
    ELSE v_config.urgency_medium_multiplier
  END;

  FOR v_provider IN
    SELECT
      p.id AS provider_id,
      CASE WHEN p.location IS NOT NULL AND v_lead_geo IS NOT NULL
        THEN ST_Distance(p.location, v_lead_geo) / 1000.0
        ELSE NULL
      END AS distance_km,
      CASE v_config.matching_strategy
        WHEN 'round_robin' THEN 0::real
        WHEN 'geographic' THEN
          CASE WHEN p.location IS NOT NULL AND v_lead_geo IS NOT NULL
            THEN (1.0 - LEAST(ST_Distance(p.location, v_lead_geo) / 1000.0
                  / GREATEST(v_config.geo_radius_km, 1), 1.0)) * 100.0
            ELSE 0
          END::real
        ELSE
          (
            (COALESCE(p.rating_average, 0)::real / 5.0 * v_config.weight_rating)
            + (LEAST(COALESCE(p.review_count, 0), 100)::real / 100.0 * v_config.weight_reviews)
            + (CASE WHEN p.is_verified = true THEN v_config.weight_verified ELSE 0 END)
            + (CASE WHEN p.location IS NOT NULL AND v_lead_geo IS NOT NULL
                THEN (1.0 - LEAST(ST_Distance(p.location, v_lead_geo) / 1000.0
                      / GREATEST(v_config.geo_radius_km, 1), 1.0))
                      * v_config.weight_proximity
                ELSE 0
              END)
            -- FIX (ex-391 bug): was v_config.weight_response_rate, renamed by migration 303
            + (COALESCE(p.data_quality_score, 0)::real / 100.0 * v_config.weight_data_quality)
            -- RGE boost when the lead is CEE-eligible
            + (CASE WHEN p_cee_eligible
                     AND p.rge_qualifications IS NOT NULL
                     AND p.rge_valid_until IS NOT NULL
                     AND p.rge_valid_until > CURRENT_DATE
                THEN v_config.rge_boost_weight
                ELSE 0
              END)
          ) * v_urgency_multiplier
      END AS computed_score
    FROM providers p
    WHERE p.is_active = true
      AND (
        NOT v_has_location_info
        OR
        (v_lead_geo IS NOT NULL AND p.location IS NOT NULL
         AND ST_DWithin(p.location, v_lead_geo, v_config.geo_radius_km * 1000))
        OR
        (v_lead_geo IS NULL AND p_city IS NOT NULL
         AND p.address_city IS NOT NULL
         AND lower(unaccent(p.address_city)) = lower(unaccent(p_city)))
        OR
        (v_lead_geo IS NULL AND p_postal_code IS NOT NULL
         AND p.address_postal_code IS NOT NULL
         AND left(p.address_postal_code, 2) = left(p_postal_code, 2))
      )
      AND (NOT v_config.require_same_department OR v_department IS NULL
           OR p.address_postal_code IS NULL
           OR left(p.address_postal_code, 2) = v_department)
      AND (NOT v_config.require_specialty_match OR p_service_name IS NULL
           OR (CASE v_config.specialty_match_mode
                WHEN 'exact' THEN p.specialty = p_service_name
                WHEN 'fuzzy' THEN (p.specialty ILIKE '%' || p_service_name || '%'
                  OR COALESCE(p.libelle_naf, '') ILIKE '%' || p_service_name || '%')
                ELSE p.specialty ILIKE '%' || p_service_name || '%'
              END))
      AND (v_config.min_rating = 0 OR COALESCE(p.rating_average, 0) >= v_config.min_rating)
      AND (NOT v_config.require_verified_urgent
           OR p_urgency NOT IN ('urgent', 'tres_urgent')
           OR p.is_verified = true)
      AND (v_config.exclude_inactive_days = 0
           OR p.last_lead_assigned_at IS NULL
           OR p.last_lead_assigned_at > now() - (v_config.exclude_inactive_days || ' days')::interval)
      AND (v_config.cooldown_minutes = 0
           OR p.last_lead_assigned_at IS NULL
           OR p.last_lead_assigned_at < now() - (v_config.cooldown_minutes || ' minutes')::interval)
      -- RGE hard filter for CEE leads (opt-in via algorithm_config.require_rge_for_cee)
      AND (
        NOT p_cee_eligible
        OR NOT v_config.require_rge_for_cee
        OR (p.rge_qualifications IS NOT NULL
            AND p.rge_valid_until IS NOT NULL
            AND p.rge_valid_until > CURRENT_DATE)
      )
      AND p.id NOT IN (
        SELECT la.provider_id FROM lead_assignments la
        WHERE la.lead_id = p_lead_id AND la.source_table = p_source_table)
    ORDER BY
      CASE WHEN v_config.matching_strategy = 'round_robin'
        THEN EXTRACT(EPOCH FROM COALESCE(p.last_lead_assigned_at, '1970-01-01'::timestamptz))
        ELSE 0
      END ASC,
      computed_score DESC,
      random()
    LIMIT v_config.max_artisans_per_lead * 2
  LOOP
    IF v_config.daily_lead_quota > 0 THEN
      IF (SELECT count(*) FROM lead_assignments
          WHERE provider_id = v_provider.provider_id
            AND assigned_at >= date_trunc('day', now())
      ) >= v_config.daily_lead_quota THEN
        CONTINUE;
      END IF;
    END IF;

    IF v_config.monthly_lead_quota > 0 THEN
      IF (SELECT count(*) FROM lead_assignments
          WHERE provider_id = v_provider.provider_id
            AND assigned_at >= date_trunc('month', now())
      ) >= v_config.monthly_lead_quota THEN
        CONTINUE;
      END IF;
    END IF;

    v_count := v_count + 1;

    INSERT INTO lead_assignments (lead_id, provider_id, source_table, score, distance_km, position)
    VALUES (p_lead_id, v_provider.provider_id, p_source_table,
            v_provider.computed_score, v_provider.distance_km, v_count);

    UPDATE providers SET last_lead_assigned_at = now()
    WHERE id = v_provider.provider_id;

    v_assigned := v_assigned || v_provider.provider_id;

    EXIT WHEN v_count >= v_config.max_artisans_per_lead;
  END LOOP;

  RETURN v_assigned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Qualified COMMENT (signature-explicit to avoid 42725 if overloads reappear)
COMMENT ON FUNCTION dispatch_lead(
  UUID, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, BOOLEAN
) IS
  'Distributes a lead to artisans per algorithm_config. Location filter: coords > city > department. Migration 462 = 391 RGE-aware + 461 weight_data_quality fix + drop 8-param overload.';

COMMIT;
