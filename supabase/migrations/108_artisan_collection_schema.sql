-- =============================================================================
-- Migration 108: Artisan Collection Schema
-- ServicesArtisans — 2026-02-08
-- =============================================================================
-- Adds columns to providers for API-sourced artisan data, plus support tables
-- for import job tracking, directors, and financial data.
-- =============================================================================

-- =============================================================================
-- 1. ADD COLUMNS TO providers
-- =============================================================================

-- NAF/APE activity code from official registries
ALTER TABLE providers ADD COLUMN IF NOT EXISTS code_naf TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS libelle_naf TEXT;

-- Legal form code (e.g., '5710' = SAS)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS legal_form_code TEXT;

-- Capital social (in euros)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS capital NUMERIC;

-- Date de radiation (cessation)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS date_radiation DATE;

-- Flag: is this an artisan (from CMA / NAF codes)?
ALTER TABLE providers ADD COLUMN IF NOT EXISTS is_artisan BOOLEAN DEFAULT FALSE;

-- Source API that last updated this record
ALTER TABLE providers ADD COLUMN IF NOT EXISTS source_api TEXT;

-- Last time this record was updated from an external API
ALTER TABLE providers ADD COLUMN IF NOT EXISTS derniere_maj_api TIMESTAMPTZ;

-- Data quality score (0-100)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS data_quality_score INTEGER DEFAULT 0;

-- Data quality flags (JSON array of issues/badges)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS data_quality_flags JSONB DEFAULT '[]'::jsonb;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_providers_code_naf ON providers (code_naf);
CREATE INDEX IF NOT EXISTS idx_providers_is_artisan ON providers (is_artisan) WHERE is_artisan = TRUE;
CREATE INDEX IF NOT EXISTS idx_providers_source_api ON providers (source_api);
CREATE INDEX IF NOT EXISTS idx_providers_data_quality ON providers (data_quality_score);

-- =============================================================================
-- 2. IMPORT JOBS TABLE — Track collection & enrichment runs
-- =============================================================================

CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,               -- 'collection', 'enrich_insee', 'enrich_pappers', 'enrich_geocode'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'paused'

  -- Progress tracking
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  created_items INTEGER DEFAULT 0,
  updated_items INTEGER DEFAULT 0,
  skipped_items INTEGER DEFAULT 0,
  error_items INTEGER DEFAULT 0,

  -- Parameters for resume
  params JSONB DEFAULT '{}'::jsonb,      -- NAF code, department, page, etc.
  last_cursor TEXT,                       -- Pagination cursor for resume

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Error tracking
  last_error TEXT,
  error_log JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_type_status ON import_jobs (job_type, status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs (created_at DESC);

-- =============================================================================
-- 3. PROVIDER DIRECTORS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS provider_directors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,

  nom TEXT NOT NULL,
  prenom TEXT,
  fonction TEXT,                         -- 'Gérant', 'Président', etc.
  date_naissance DATE,
  nationalite TEXT,

  -- Source tracking
  source TEXT,                           -- 'pappers', 'annuaire', etc.
  fetched_at TIMESTAMPTZ DEFAULT now(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate directors per provider
  UNIQUE (provider_id, nom, prenom, fonction)
);

CREATE INDEX IF NOT EXISTS idx_provider_directors_provider ON provider_directors (provider_id);

-- =============================================================================
-- 4. PROVIDER FINANCIALS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS provider_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,

  annee INTEGER NOT NULL,
  chiffre_affaires NUMERIC,
  resultat_net NUMERIC,
  effectif TEXT,

  -- Source tracking
  source TEXT,                           -- 'pappers'
  fetched_at TIMESTAMPTZ DEFAULT now(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One financial record per provider per year
  UNIQUE (provider_id, annee)
);

CREATE INDEX IF NOT EXISTS idx_provider_financials_provider ON provider_financials (provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_financials_annee ON provider_financials (annee DESC);

-- =============================================================================
-- 5. AUTO-UPDATE updated_at TRIGGER FOR import_jobs
-- =============================================================================

CREATE OR REPLACE FUNCTION update_import_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_import_jobs_updated_at ON import_jobs;
CREATE TRIGGER trg_import_jobs_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_import_jobs_updated_at();

-- =============================================================================
-- 6. RLS POLICIES
-- =============================================================================

-- import_jobs: admin only
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage import_jobs" ON import_jobs
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
  );

-- Service role can always access (for scripts)
CREATE POLICY "Service role can manage import_jobs" ON import_jobs
  FOR ALL
  USING (auth.role() = 'service_role');

-- provider_directors: public read, admin write
ALTER TABLE provider_directors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view directors" ON provider_directors
  FOR SELECT USING (TRUE);

CREATE POLICY "Service role can manage directors" ON provider_directors
  FOR ALL
  USING (auth.role() = 'service_role');

-- provider_financials: public read, admin write
ALTER TABLE provider_financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view financials" ON provider_financials
  FOR SELECT USING (TRUE);

CREATE POLICY "Service role can manage financials" ON provider_financials
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE import_jobs IS 'Tracks collection and enrichment job runs for artisan data pipeline';
COMMENT ON TABLE provider_directors IS 'Directors/managers of artisan businesses, sourced from Pappers/Annuaire';
COMMENT ON TABLE provider_financials IS 'Annual financial data (CA, résultat) for artisan businesses';
