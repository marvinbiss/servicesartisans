-- Migration 481 — Table `lighthouse_scores`
--
-- Pourquoi :
--   Bouclier 4 du plan ULTRA DOMINATION SEO v2 — pre-deploy quality gates.
--   Tracking quotidien des Core Web Vitals + scores Lighthouse via PageSpeed
--   Insights API (gratuit, pas de Chrome local). Permet :
--     1) Détecter régression LCP/CLS/INP entre 2 deploys.
--     2) Comparer mobile vs desktop (mobile-first ranking Google).
--     3) Trace historique des scores pour le dashboard SEO Foundations.
--
-- Conception :
--   - 1 ligne par (snapshot_date, url, strategy) — strategy ∈ {'mobile', 'desktop'}
--   - Performance score 0-100, métriques LCP/CLS/INP/FCP/TBT en ms ou ratio
--   - raw_audit JSONB capé pour conserver le détail diagnostic
--   - Index (url, strategy, snapshot_date DESC) pour la query "dernière semaine
--     par URL et device"

CREATE TABLE IF NOT EXISTS lighthouse_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  url TEXT NOT NULL,
  strategy TEXT NOT NULL,
  performance_score INTEGER,
  lcp_ms INTEGER,
  cls NUMERIC(5, 3),
  inp_ms INTEGER,
  fcp_ms INTEGER,
  tbt_ms INTEGER,
  severity TEXT NOT NULL,
  raw_audit JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT lighthouse_strategy_check CHECK (strategy IN ('mobile', 'desktop')),
  CONSTRAINT lighthouse_severity_check CHECK (severity IN ('ok', 'warn', 'critical')),
  CONSTRAINT lighthouse_perf_score_range CHECK (performance_score IS NULL OR (performance_score >= 0 AND performance_score <= 100)),
  CONSTRAINT lighthouse_raw_audit_size CHECK (octet_length(raw_audit::text) < 131072),
  CONSTRAINT lighthouse_unique_day_url_strategy UNIQUE (snapshot_date, url, strategy)
);

CREATE INDEX IF NOT EXISTS idx_lighthouse_url_strategy_date_desc
  ON lighthouse_scores (url, strategy, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_lighthouse_snapshot_date_desc
  ON lighthouse_scores (snapshot_date DESC);

COMMENT ON TABLE lighthouse_scores IS
  'Snapshots quotidiens Lighthouse via PageSpeed Insights API. Bouclier 4 plan v2.';
COMMENT ON COLUMN lighthouse_scores.severity IS
  'critical = perf<50 OR LCP>4000ms OR CLS>0.25, warn = perf<70, sinon ok.';

ALTER TABLE lighthouse_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read lighthouse_scores" ON lighthouse_scores
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Service role write lighthouse_scores" ON lighthouse_scores
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON lighthouse_scores FROM anon;
