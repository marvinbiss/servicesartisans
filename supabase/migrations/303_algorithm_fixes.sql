-- =============================================================================
-- Migration 303: Algorithm & Dispatch Fixes
-- Date: 2026-02-14
-- Purpose: Harden algorithm_config, fix trust score formula, improve dispatch
--
-- Fixes:
--   1. Fix RLS on algorithm_config (service_role only, not USING(true))
--   2. Add CHECK constraints on all configurable columns
--   3. Fix default daily_lead_quota from 0 to 15 (fairness)
--   4. Singleton pattern for algorithm_config (max 1 row)
--   5. Add missing index on providers.last_lead_assigned_at
--   6. Fix trust score formula to sum to 100 (was 125)
--   7. Rename weight_response_rate -> weight_data_quality (before dispatch fn)
--   8. Fix dispatch_lead: new artisan boost, LIKE escaping, category match
--   9. Add GIN trigram index for specialty fuzzy matching
--
-- All statements are idempotent (safe to re-run).
-- =============================================================================


-- ====== Section 1: Fix RLS on algorithm_config ======
-- The previous policy USING(true) allowed anonymous access. Replace with
-- service_role only access for both read and write operations.

DROP POLICY IF EXISTS "Service role full access" ON public.algorithm_config;
DROP POLICY IF EXISTS "Service role only" ON public.algorithm_config;

CREATE POLICY "Service role only" ON public.algorithm_config
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ====== Section 2: Add CHECK constraints on algorithm_config ======
-- All configurable numeric columns need bounds to prevent garbage values.
-- Uses EXCEPTION WHEN duplicate_object for idempotency.

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_weight_rating CHECK (weight_rating BETWEEN 0 AND 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_weight_reviews CHECK (weight_reviews BETWEEN 0 AND 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_weight_verified CHECK (weight_verified BETWEEN 0 AND 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_weight_proximity CHECK (weight_proximity BETWEEN 0 AND 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Note: weight_response_rate is renamed to weight_data_quality in Section 7.
-- The constraint is added here on the old name; ALTER RENAME preserves it.
DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_weight_response_rate CHECK (weight_response_rate BETWEEN 0 AND 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_max_artisans_per_lead CHECK (max_artisans_per_lead BETWEEN 1 AND 20);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_geo_radius_km CHECK (geo_radius_km BETWEEN 1 AND 500);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_cooldown_minutes CHECK (cooldown_minutes >= 0 AND cooldown_minutes <= 1440);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_daily_lead_quota CHECK (daily_lead_quota >= 0 AND daily_lead_quota <= 1000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_monthly_lead_quota CHECK (monthly_lead_quota >= 0 AND monthly_lead_quota <= 30000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_exclude_inactive_days CHECK (exclude_inactive_days >= 0 AND exclude_inactive_days <= 365);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_min_rating CHECK (min_rating >= 0 AND min_rating <= 5);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_urgency_low_multiplier CHECK (urgency_low_multiplier > 0 AND urgency_low_multiplier <= 10);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_urgency_medium_multiplier CHECK (urgency_medium_multiplier > 0 AND urgency_medium_multiplier <= 10);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_urgency_high_multiplier CHECK (urgency_high_multiplier > 0 AND urgency_high_multiplier <= 10);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_urgency_emergency_multiplier CHECK (urgency_emergency_multiplier > 0 AND urgency_emergency_multiplier <= 10);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_lead_expiry_hours CHECK (lead_expiry_hours > 0 AND lead_expiry_hours <= 168);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.algorithm_config
    ADD CONSTRAINT chk_auto_reassign_hours CHECK (auto_reassign_hours > 0 AND auto_reassign_hours <= 168);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ====== Section 3: Fix default daily_lead_quota from 0 to 15 ======
-- A quota of 0 means unlimited, which is unfair: one artisan could hog all
-- leads in a given day. Default to 15 for reasonable distribution.

ALTER TABLE public.algorithm_config ALTER COLUMN daily_lead_quota SET DEFAULT 15;
UPDATE public.algorithm_config SET daily_lead_quota = 15 WHERE daily_lead_quota = 0;


-- ====== Section 4: Singleton pattern for algorithm_config ======
-- Ensure only one config row can ever exist. The singleton column is always
-- true, and a UNIQUE constraint on it prevents a second row.

DO $$ BEGIN
  ALTER TABLE public.algorithm_config ADD COLUMN singleton BOOLEAN NOT NULL DEFAULT true;
  ALTER TABLE public.algorithm_config ADD CONSTRAINT algorithm_config_singleton UNIQUE (singleton);
  ALTER TABLE public.algorithm_config ADD CONSTRAINT algorithm_config_singleton_true CHECK (singleton = true);
EXCEPTION WHEN duplicate_column OR duplicate_object THEN NULL;
END $$;


-- ====== Section 5: Add missing index on providers.last_lead_assigned_at ======
-- The dispatch function filters on last_lead_assigned_at for cooldown and
-- inactivity checks. Without an index, these filters cause sequential scans.

CREATE INDEX IF NOT EXISTS idx_providers_last_lead_assigned
  ON public.providers(last_lead_assigned_at)
  WHERE last_lead_assigned_at IS NOT NULL;


-- ====== Section 6: Fix trust score formula ======
-- The old formula in migration 014 had a max of ~125:
--   v_rating_avg * 15 + v_response_rate * 0.3 + LEAST(v_review_cnt, 100) * 0.2
-- With max values: 5*15 + 100*0.3 + 100*0.2 = 75 + 30 + 20 = 125
--
-- New formula sums to 100:
--   (rating/5)*50 + (response_rate/100)*30 + (reviews_capped/100)*20 = 100
--
-- Note: migration 100 dropped trust_score, trust_badge, response_rate from
-- providers, so this trigger function now only updates rating_average and
-- review_count (which still exist). The trust_score calculation is kept in
-- the function for future use if those columns are restored.

CREATE OR REPLACE FUNCTION update_provider_trust_metrics()
RETURNS TRIGGER AS $$
DECLARE
    v_provider_id UUID;
    v_rating_avg DECIMAL;
    v_review_cnt INTEGER;
    v_response_rate DECIMAL;
    v_years INTEGER;
    v_badge VARCHAR(20);
    v_trust_score INTEGER;
BEGIN
    -- Get the provider ID from the review
    IF TG_OP = 'DELETE' THEN
        v_provider_id := OLD.provider_id;
    ELSE
        v_provider_id := NEW.provider_id;
    END IF;

    -- Calculate new averages
    SELECT
        COALESCE(AVG(rating), 0),
        COUNT(*),
        COALESCE(
            (COUNT(*) FILTER (WHERE response_text IS NOT NULL)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
            0
        )
    INTO v_rating_avg, v_review_cnt, v_response_rate
    FROM reviews
    WHERE provider_id = v_provider_id AND is_visible = true;

    -- Get years on platform
    SELECT EXTRACT(YEAR FROM AGE(NOW(), created_at))::INTEGER
    INTO v_years
    FROM providers WHERE id = v_provider_id;

    -- Calculate badge
    v_badge := calculate_trust_badge(v_review_cnt, v_rating_avg, v_response_rate, COALESCE(v_years, 0));

    -- Fixed trust score formula: max = (5/5)*50 + (100/100)*30 + (100/100)*20 = 100
    v_trust_score := LEAST(100, (
      (v_rating_avg / 5.0) * 50 +
      (v_response_rate / 100.0) * 30 +
      (LEAST(v_review_cnt, 100)::real / 100.0) * 20
    )::INTEGER);

    -- Update provider (only columns that currently exist)
    -- Note: trust_badge, trust_score, response_rate were dropped in migration 100.
    -- This updates rating_average and review_count which still exist.
    UPDATE providers SET
        rating_average = v_rating_avg,
        review_count = v_review_cnt
    WHERE id = v_provider_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


-- ====== Section 7: Rename weight_response_rate to weight_data_quality ======
-- The column name is misleading: it weights the data_quality_score column on
-- providers, not response_rate (which was dropped in migration 100).
-- ALTER TABLE RENAME preserves constraints, defaults, and references.
-- IMPORTANT: This must run BEFORE Section 8 (dispatch function) which
-- references the new column name weight_data_quality.

DO $$ BEGIN
  ALTER TABLE public.algorithm_config RENAME COLUMN weight_response_rate TO weight_data_quality;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;


-- ====== Section 8: Fix dispatch_lead function ======
-- Changes:
--   a) New artisan boost: +15 points if provider created in last 90 days
--   b) Escape LIKE patterns: prevent SQL injection via % and _ in service names
--   c) Category match mode: broader ILIKE on libelle_naf for category matching
--   d) Fix config auto-insert to use singleton pattern
--   e) Use renamed column weight_data_quality (was weight_response_rate)

-- Drop the old 3-param signature if it exists (from earlier migration)
DO $$ BEGIN
  DROP FUNCTION IF EXISTS dispatch_lead(UUID, TEXT, TEXT);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

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
  v_escaped_service TEXT;
BEGIN
  -- Load algorithm config (singleton row)
  SELECT * INTO v_config FROM public.algorithm_config LIMIT 1;

  IF v_config IS NULL THEN
    INSERT INTO public.algorithm_config (id, singleton)
    VALUES (gen_random_uuid(), true)
    ON CONFLICT DO NOTHING;
    SELECT * INTO v_config FROM public.algorithm_config LIMIT 1;
  END IF;

  -- Escape LIKE meta-characters in service name to prevent pattern injection
  IF p_service_name IS NOT NULL THEN
    v_escaped_service := replace(replace(p_service_name, '%', '\%'), '_', '\_');
  END IF;

  -- Advisory lock (idempotency)
  v_lock := ('x' || left(replace(p_lead_id::text, '-', ''), 16))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(v_lock);

  -- Already dispatched?
  IF EXISTS (
    SELECT 1 FROM lead_assignments
    WHERE lead_id = p_lead_id AND source_table = p_source_table
  ) THEN
    SELECT array_agg(provider_id) INTO v_assigned
    FROM lead_assignments
    WHERE lead_id = p_lead_id AND source_table = p_source_table;
    RETURN v_assigned;
  END IF;

  -- Build geo point
  IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
    v_lead_geo := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography;
  END IF;

  -- Department from postal code
  IF p_postal_code IS NOT NULL AND length(p_postal_code) >= 2 THEN
    v_department := left(p_postal_code, 2);
  END IF;

  -- Urgency multiplier
  v_urgency_multiplier := CASE p_urgency
    WHEN 'flexible' THEN v_config.urgency_low_multiplier
    WHEN 'normal'   THEN v_config.urgency_medium_multiplier
    WHEN 'semaine'  THEN v_config.urgency_medium_multiplier
    WHEN 'mois'     THEN v_config.urgency_low_multiplier
    WHEN 'urgent'   THEN v_config.urgency_high_multiplier
    WHEN 'tres_urgent' THEN v_config.urgency_emergency_multiplier
    ELSE v_config.urgency_medium_multiplier
  END;

  -- Main selection
  FOR v_provider IN
    SELECT
      p.id AS provider_id,
      p.created_at AS provider_created_at,
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
            + (COALESCE(p.data_quality_score, 0)::real / 100.0 * v_config.weight_data_quality)
            -- (a) New artisan boost: +15 points for providers created in last 90 days
            + (CASE WHEN p.created_at > now() - interval '90 days' THEN 15.0 ELSE 0.0 END)
          ) * v_urgency_multiplier
      END AS computed_score
    FROM providers p
    WHERE p.is_active = true
      AND (v_lead_geo IS NULL OR p.location IS NULL
           OR ST_DWithin(p.location, v_lead_geo, v_config.geo_radius_km * 1000))
      AND (NOT v_config.require_same_department OR v_department IS NULL
           OR p.address_postal_code IS NULL
           OR left(p.address_postal_code, 2) = v_department)
      -- (b) Escaped LIKE patterns + (c) Category match mode
      AND (NOT v_config.require_specialty_match OR v_escaped_service IS NULL
           OR (CASE v_config.specialty_match_mode
                WHEN 'exact' THEN p.specialty = p_service_name
                WHEN 'fuzzy' THEN (
                  p.specialty ILIKE '%' || v_escaped_service || '%'
                  OR COALESCE(p.libelle_naf, '') ILIKE '%' || v_escaped_service || '%'
                )
                WHEN 'category' THEN (
                  -- Category mode: broader match on libelle_naf (NAF code description)
                  -- which represents the business category/sector.
                  -- Matches the provider directly OR any provider sharing the same
                  -- code_naf as providers whose specialty/libelle_naf matches the query.
                  p.specialty ILIKE '%' || v_escaped_service || '%'
                  OR COALESCE(p.libelle_naf, '') ILIKE '%' || v_escaped_service || '%'
                  OR COALESCE(p.code_naf, '') IN (
                    SELECT DISTINCT p2.code_naf FROM providers p2
                    WHERE p2.is_active = true
                      AND p2.code_naf IS NOT NULL
                      AND (p2.specialty ILIKE '%' || v_escaped_service || '%'
                           OR p2.libelle_naf ILIKE '%' || v_escaped_service || '%')
                  )
                )
                ELSE p.specialty ILIKE '%' || v_escaped_service || '%'
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
    -- Daily quota
    IF v_config.daily_lead_quota > 0 THEN
      IF (SELECT count(*) FROM lead_assignments
          WHERE provider_id = v_provider.provider_id
            AND assigned_at >= date_trunc('day', now())
      ) >= v_config.daily_lead_quota THEN
        CONTINUE;
      END IF;
    END IF;

    -- Monthly quota
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
  'Distribue un lead aux artisans selon algorithm_config. Scored/round_robin/geographic. V2: new artisan boost, LIKE escaping, category match.';


-- ====== Section 9: GIN trigram index for specialty fuzzy matching ======
-- The dispatch function uses ILIKE on specialty which requires sequential
-- scans without a trigram index. pg_trgm enables index-backed ILIKE.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_providers_specialty_trgm
  ON public.providers USING GIN(specialty gin_trgm_ops);
