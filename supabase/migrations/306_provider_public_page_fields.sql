-- Migration 306: Provider Public Page Fields
-- Adds artisan-managed columns for their public profile page.
-- Fully idempotent — safe to re-run.

-- ============================================================
-- 1. NEW COLUMNS
-- ============================================================
ALTER TABLE providers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS insurance TEXT[] DEFAULT '{}';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['Français'];
ALTER TABLE providers ADD COLUMN IF NOT EXISTS emergency_available BOOLEAN DEFAULT FALSE;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS available_24h BOOLEAN DEFAULT FALSE;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS hourly_rate_min NUMERIC(10,2);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS hourly_rate_max NUMERIC(10,2);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS phone_secondary TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{}';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS accepts_new_clients BOOLEAN DEFAULT TRUE;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS free_quote BOOLEAN DEFAULT TRUE;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS intervention_radius_km INTEGER DEFAULT 30;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS service_prices JSONB DEFAULT '[]';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS team_size INTEGER;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS services_offered TEXT[] DEFAULT '{}';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS bio TEXT;

-- ============================================================
-- 2. CONSTRAINTS (idempotent via DO blocks)
-- ============================================================

-- Rate range check: max >= min when both are set
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_hourly_rate_check
    CHECK (hourly_rate_max IS NULL OR hourly_rate_min IS NULL OR hourly_rate_max >= hourly_rate_min);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Intervention radius: between 1 and 200
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_intervention_radius_check
    CHECK (intervention_radius_km IS NULL OR (intervention_radius_km >= 1 AND intervention_radius_km <= 200));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Team size: between 1 and 1000
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_team_size_check
    CHECK (team_size IS NULL OR (team_size >= 1 AND team_size <= 1000));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Avatar URL length
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_avatar_url_length
    CHECK (avatar_url IS NULL OR length(avatar_url) <= 2048);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Bio length
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_bio_length
    CHECK (bio IS NULL OR length(bio) <= 5000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Phone secondary length
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_phone_secondary_length
    CHECK (phone_secondary IS NULL OR length(phone_secondary) <= 20);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Array bounds: certifications max 20
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_certifications_length
    CHECK (array_length(certifications, 1) IS NULL OR array_length(certifications, 1) <= 20);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Array bounds: insurance max 10
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_insurance_length
    CHECK (array_length(insurance, 1) IS NULL OR array_length(insurance, 1) <= 10);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Array bounds: payment_methods max 10
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_payment_methods_length
    CHECK (array_length(payment_methods, 1) IS NULL OR array_length(payment_methods, 1) <= 10);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Array bounds: languages max 10
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_languages_length
    CHECK (array_length(languages, 1) IS NULL OR array_length(languages, 1) <= 10);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Array bounds: services_offered max 30
DO $$ BEGIN
  ALTER TABLE providers ADD CONSTRAINT providers_services_offered_length
    CHECK (array_length(services_offered, 1) IS NULL OR array_length(services_offered, 1) <= 30);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS providers_emergency_idx
  ON providers(emergency_available) WHERE emergency_available = TRUE AND is_active = TRUE;
