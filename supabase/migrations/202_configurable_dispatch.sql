-- =============================================================================
-- Migration 202: Configurable Dispatch Algorithm
-- ServicesArtisans — 2026-02-11
-- =============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- =============================================================================

-- 1. Ensure last_lead_assigned_at on providers
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS last_lead_assigned_at TIMESTAMPTZ;

-- 2. Create lead_assignments table
CREATE TABLE IF NOT EXISTS lead_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'viewed', 'quoted', 'declined')),
  viewed_at TIMESTAMPTZ,
  source_table TEXT NOT NULL DEFAULT 'devis_requests'
    CHECK (source_table IN ('devis_requests', 'leads')),
  score REAL,
  distance_km REAL,
  position INTEGER,
  UNIQUE (lead_id, provider_id, source_table)
);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_provider
  ON lead_assignments(provider_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead
  ON lead_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_status
  ON lead_assignments(status);

-- 3. RLS — service_role full access (dispatch runs as SECURITY DEFINER)
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY lead_assignments_service_role
    ON lead_assignments FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Validation trigger
CREATE OR REPLACE FUNCTION validate_lead_assignment_fk()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source_table = 'devis_requests' THEN
    IF NOT EXISTS (SELECT 1 FROM devis_requests WHERE id = NEW.lead_id) THEN
      RAISE EXCEPTION 'lead_id % not found in devis_requests', NEW.lead_id;
    END IF;
  ELSIF NEW.source_table = 'leads' THEN
    IF NOT EXISTS (SELECT 1 FROM leads WHERE id = NEW.lead_id) THEN
      RAISE EXCEPTION 'lead_id % not found in leads', NEW.lead_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_validate_lead_assignment_fk ON lead_assignments;
  CREATE TRIGGER trg_validate_lead_assignment_fk
    BEFORE INSERT OR UPDATE ON lead_assignments
    FOR EACH ROW EXECUTE FUNCTION validate_lead_assignment_fk();
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- 5. Drop FK on lead_events if table exists
DO $$ BEGIN
  ALTER TABLE lead_events DROP CONSTRAINT IF EXISTS lead_events_lead_id_fkey;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- 6. Drop old dispatch_lead (3 params) if it exists
DO $$ BEGIN
  DROP FUNCTION IF EXISTS dispatch_lead(UUID, TEXT, TEXT);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 7. Create configurable dispatch_lead function
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
BEGIN
  -- Load algorithm config
  SELECT * INTO v_config FROM public.algorithm_config LIMIT 1;

  IF v_config IS NULL THEN
    INSERT INTO public.algorithm_config (id) VALUES (gen_random_uuid())
    ON CONFLICT DO NOTHING;
    SELECT * INTO v_config FROM public.algorithm_config LIMIT 1;
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
            + (COALESCE(p.data_quality_score, 0)::real / 100.0 * v_config.weight_response_rate)
          ) * v_urgency_multiplier
      END AS computed_score
    FROM providers p
    WHERE p.is_active = true
      AND (v_lead_geo IS NULL OR p.location IS NULL
           OR ST_DWithin(p.location, v_lead_geo, v_config.geo_radius_km * 1000))
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
  'Distribue un lead aux artisans selon algorithm_config. Scored/round_robin/geographic.';
