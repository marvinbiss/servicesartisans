-- =============================================================================
-- Migration 461: Fix dispatch_lead referencing non-existent weight_response_rate
-- ServicesArtisans — 2026-04-20
-- =============================================================================
-- Root cause:
--   Migration 303 renamed algorithm_config.weight_response_rate to weight_data_quality
--   (section 9). Migration 304 fixed dispatch_lead to use the new name. However,
--   migration 363 (location filtering rework) CREATE OR REPLACE'd dispatch_lead and
--   reintroduced the stale reference to v_config.weight_response_rate.
--
--   PL/pgSQL resolves record field names at execution time: since the column no
--   longer exists on algorithm_config, every call of dispatch_lead since 363 was
--   shipped has raised `42703: record "v_config" has no field "weight_response_rate"`.
--
-- Impact:
--   No lead_assignments produced since last successful assignment 2026-03-28.
--   Every submitLead server action silently failed the dispatch (error logged,
--   empty array returned, no artisan notified).
--
-- Fix:
--   CREATE OR REPLACE dispatch_lead with body identical to migration 363 except
--   line 127 uses v_config.weight_data_quality (the current column name).
--   Signature unchanged (8 params, matches migration 363). Migration 391's
--   p_cee_eligible 9th param is intentionally NOT added here — that work ships
--   separately once RGE coverage is validated.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION dispatch_lead(
  p_lead_id UUID,
  p_service_name TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_urgency TEXT DEFAULT 'normal',
  p_latitude DOUBLE PRECISION DEFAULT NULL,
  p_longitude DOUBLE PRECISION DEFAULT NULL,
  p_source_table TEXT DEFAULT 'devis_requests'
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
            -- FIX: was v_config.weight_response_rate (renamed in migration 303)
            + (COALESCE(p.data_quality_score, 0)::real / 100.0 * v_config.weight_data_quality)
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

COMMENT ON FUNCTION dispatch_lead IS
  'Distribue un lead aux artisans selon algorithm_config. Migration 461: fix weight_response_rate → weight_data_quality (stale reference reintroduced by 363).';

COMMIT;
