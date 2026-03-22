-- Table pour stocker les métriques SEO (GSC stats, pruning reports, etc.)
CREATE TABLE IF NOT EXISTS seo_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  metric_type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  collected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_metrics_type_date ON seo_metrics (metric_type, collected_at DESC);

-- RLS
ALTER TABLE seo_metrics ENABLE ROW LEVEL SECURITY;

-- Seul service_role peut lire/écrire (crons uniquement)
CREATE POLICY "Service role full access on seo_metrics"
  ON seo_metrics
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
