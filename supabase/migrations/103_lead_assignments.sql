-- 103_lead_assignments.sql
-- Lead dispatch: round-robin assignment of leads to eligible artisans
-- Part of slice-e2e step 2

-- ============================================================
-- 1. lead_assignments table
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES devis_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'viewed', 'quoted', 'declined')),
  viewed_at TIMESTAMPTZ,
  UNIQUE (lead_id, provider_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lead_assignments_provider
  ON lead_assignments(provider_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead
  ON lead_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_status
  ON lead_assignments(status);

-- ============================================================
-- 2. Round-robin counter on providers
-- ============================================================
-- Lightweight column: last time this provider received a lead
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS last_lead_assigned_at TIMESTAMPTZ;

-- ============================================================
-- 3. RLS policies for lead_assignments
-- ============================================================
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;

-- Artisans can view their own assignments
CREATE POLICY lead_assignments_provider_select
  ON lead_assignments FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

-- Artisans can update their own assignments (viewed, declined)
CREATE POLICY lead_assignments_provider_update
  ON lead_assignments FOR UPDATE
  USING (
    provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    status IN ('viewed', 'declined')
  );

-- Admins can do everything
CREATE POLICY lead_assignments_admin_all
  ON lead_assignments FOR ALL
  USING (is_admin());

-- Service role (dispatch) bypasses RLS

-- ============================================================
-- 4. dispatch_lead() — server-only function (SECURITY DEFINER)
-- ============================================================
-- Round-robin: pick the eligible artisan who was assigned least recently
CREATE OR REPLACE FUNCTION dispatch_lead(
  p_lead_id UUID,
  p_service_name TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_provider_id UUID;
BEGIN
  -- Find eligible provider: active, matching service/city if provided,
  -- ordered by last_lead_assigned_at ASC NULLS FIRST (round-robin)
  SELECT p.id INTO v_provider_id
  FROM providers p
  WHERE p.is_active = true
    AND (p_service_name IS NULL OR p.specialty ILIKE '%' || p_service_name || '%')
    AND (p_city IS NULL OR p.address_city ILIKE '%' || p_city || '%')
    AND p.id NOT IN (
      SELECT la.provider_id FROM lead_assignments la WHERE la.lead_id = p_lead_id
    )
  ORDER BY p.last_lead_assigned_at ASC NULLS FIRST, p.name ASC
  LIMIT 1;

  -- No eligible provider found
  IF v_provider_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Create assignment
  INSERT INTO lead_assignments (lead_id, provider_id)
  VALUES (p_lead_id, v_provider_id);

  -- Update round-robin counter
  UPDATE providers SET last_lead_assigned_at = now()
  WHERE id = v_provider_id;

  RETURN v_provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. Seed: 1 city (Paris) × 1 métier (Plombier) × 200 artisans
-- ============================================================
-- Only insert if fewer than 200 plombiers in Paris exist
DO $$
DECLARE
  existing_count INTEGER;
  i INTEGER;
  v_stable_id TEXT;
BEGIN
  SELECT count(*) INTO existing_count
  FROM providers
  WHERE specialty = 'Plombier' AND address_city = 'Paris';

  IF existing_count < 200 THEN
    FOR i IN (existing_count + 1)..200 LOOP
      -- Generate a deterministic stable_id for seed data
      v_stable_id := encode(
        digest('seed-plombier-paris-' || i::text, 'sha256'),
        'base64'
      );
      v_stable_id := replace(replace(left(v_stable_id, 16), '+', '-'), '/', '_');

      INSERT INTO providers (
        id, name, slug, stable_id, specialty,
        address_city, address_postal_code,
        is_active, is_verified, noindex,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'Plombier Paris ' || i,
        'plombier-paris-' || i,
        v_stable_id,
        'Plombier',
        'Paris',
        '75001',
        true, -- is_active
        (i % 3 = 0), -- every 3rd is verified
        true, -- noindex (seed data)
        now(),
        now()
      )
      ON CONFLICT (stable_id) DO NOTHING;
    END LOOP;
  END IF;
END $$;
