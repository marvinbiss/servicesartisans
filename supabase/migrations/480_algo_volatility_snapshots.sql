-- Migration 480 — Table `algo_volatility_snapshots`
--
-- Pourquoi :
--   Bouclier 1 du plan ULTRA DOMINATION SEO v2 : surveillance des
--   "weather reports" SEO (Semrush Sensor, Mozcast, AlgoRoo). Quand notre
--   trafic dipt simultanément avec une volatilité industrie élevée, on
--   sait que c'est un algo update Google (pas notre faute) → pas de
--   panique rollback. Inversement, dip côté SA + industrie calme = on a
--   pété quelque chose.
--
-- Conception :
--   - 1 ligne par (snapshot_date, source, country)
--   - score 0-10 normalisé (Semrush 0-10, Mozcast 0-100 → /10)
--   - raw_payload JSONB pour debug + future ML
--   - Index (snapshot_date DESC) pour la query "dernière semaine"
--   - Index (source, snapshot_date DESC) pour comparer sources entre elles

CREATE TABLE IF NOT EXISTS algo_volatility_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'fr',
  score NUMERIC(4, 2) NOT NULL,
  severity TEXT NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT algo_volatility_score_range CHECK (score >= 0 AND score <= 10),
  CONSTRAINT algo_volatility_severity_check CHECK (severity IN ('calm', 'warn', 'critical')),
  CONSTRAINT algo_volatility_source_format CHECK (source ~ '^[a-z][a-z0-9_-]{1,40}$'),
  CONSTRAINT algo_volatility_country_format CHECK (country ~ '^[a-z]{2}$'),
  CONSTRAINT algo_volatility_raw_payload_size CHECK (octet_length(raw_payload::text) < 65536),
  CONSTRAINT algo_volatility_unique_day_source_country UNIQUE (snapshot_date, source, country)
);

CREATE INDEX IF NOT EXISTS idx_algo_volatility_snapshot_date_desc
  ON algo_volatility_snapshots (snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_algo_volatility_source_date_desc
  ON algo_volatility_snapshots (source, snapshot_date DESC);

COMMENT ON TABLE algo_volatility_snapshots IS
  'Snapshots quotidiens de la volatilité SERP (Semrush Sensor, Mozcast). Bouclier 1 du plan v2.';
COMMENT ON COLUMN algo_volatility_snapshots.score IS
  'Score 0-10 normalisé. >=7 = critical (algo update probable), 4-7 = warn, <4 = calm.';

ALTER TABLE algo_volatility_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read algo_volatility_snapshots" ON algo_volatility_snapshots
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Service role write algo_volatility_snapshots" ON algo_volatility_snapshots
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON algo_volatility_snapshots FROM anon;
