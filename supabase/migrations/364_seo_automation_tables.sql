-- SEO Automation Infrastructure
-- Tables pour A/B testing meta, métriques GSC, cycle de vie pages, cannibalisation, PAA

-- ============================================================
-- A. seo_meta_variants — A/B testing meta titles/descriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_meta_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  variant_label text NOT NULL DEFAULT 'control',
  meta_title text NOT NULL,
  meta_description text NOT NULL,
  impressions int DEFAULT 0,
  clicks int DEFAULT 0,
  is_active boolean DEFAULT true,
  promoted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_path, variant_label)
);

CREATE INDEX idx_seo_meta_variants_path ON seo_meta_variants(page_path) WHERE is_active = true;

-- ============================================================
-- B. gsc_daily_metrics — Stockage données GSC pour analyse auto
-- ============================================================
CREATE TABLE IF NOT EXISTS gsc_daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  query text NOT NULL,
  date date NOT NULL,
  clicks int DEFAULT 0,
  impressions int DEFAULT 0,
  ctr numeric(7,4) DEFAULT 0,
  position numeric(6,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(page_path, query, date)
);

CREATE INDEX idx_gsc_metrics_page_date ON gsc_daily_metrics(page_path, date DESC);
CREATE INDEX idx_gsc_metrics_query ON gsc_daily_metrics(query, date DESC);
CREATE INDEX idx_gsc_metrics_striking ON gsc_daily_metrics(position, impressions) WHERE position BETWEEN 4 AND 10;

-- ============================================================
-- C. seo_page_lifecycle — Suivi cycle de vie crawl → ranking
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_page_lifecycle (
  page_path text PRIMARY KEY,
  first_crawled_at timestamptz,
  first_indexed_at timestamptz,
  first_click_at timestamptz,
  avg_position_7d numeric(5,2),
  impressions_7d int DEFAULT 0,
  clicks_7d int DEFAULT 0,
  crawl_frequency_7d int DEFAULT 0,
  content_hash text,
  last_content_change_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- D. seo_cannibalization_pairs — Détection cannibalisation
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_cannibalization_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  page_a text NOT NULL,
  page_b text NOT NULL,
  avg_position_a numeric(5,2),
  avg_position_b numeric(5,2),
  total_impressions int DEFAULT 0,
  status text DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'resolved', 'ignored')),
  resolution text,
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  UNIQUE(query, page_a, page_b)
);

-- ============================================================
-- E. seo_paa_questions — Suivi People Also Ask
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_paa_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_query text NOT NULL,
  paa_question text NOT NULL,
  answer_page_path text,
  is_answered boolean DEFAULT false,
  search_volume_estimate int,
  created_at timestamptz DEFAULT now(),
  UNIQUE(target_query, paa_question)
);

-- ============================================================
-- F. Row Level Security — toutes les tables
-- ============================================================
ALTER TABLE seo_meta_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_page_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_cannibalization_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_paa_questions ENABLE ROW LEVEL SECURITY;

-- Admin read access
CREATE POLICY "Admins can read seo_meta_variants" ON seo_meta_variants
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can read gsc_daily_metrics" ON gsc_daily_metrics
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can read seo_page_lifecycle" ON seo_page_lifecycle
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can read seo_cannibalization_pairs" ON seo_cannibalization_pairs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can read seo_paa_questions" ON seo_paa_questions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Service role full access (pour les cron jobs)
CREATE POLICY "Service role full access on seo_meta_variants" ON seo_meta_variants
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on gsc_daily_metrics" ON gsc_daily_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on seo_page_lifecycle" ON seo_page_lifecycle
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on seo_cannibalization_pairs" ON seo_cannibalization_pairs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on seo_paa_questions" ON seo_paa_questions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- G. Vues analytiques
-- ============================================================

-- Opportunités "striking distance" (positions 4-10, impressions > 20)
CREATE OR REPLACE VIEW seo_striking_distance AS
SELECT page_path, query,
  AVG(position) as avg_position,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  ROUND(SUM(clicks)::numeric / NULLIF(SUM(impressions), 0) * 100, 2) as ctr_percent
FROM gsc_daily_metrics
WHERE date > CURRENT_DATE - interval '28 days'
GROUP BY page_path, query
HAVING AVG(position) BETWEEN 4 AND 10 AND SUM(impressions) > 20
ORDER BY total_impressions DESC;

-- Pages en crise CTR (impressions élevées, CTR < 2%)
CREATE OR REPLACE VIEW seo_ctr_crisis AS
SELECT page_path,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  ROUND(SUM(clicks)::numeric / NULLIF(SUM(impressions), 0) * 100, 2) as ctr_percent,
  ROUND(AVG(position), 2) as avg_position
FROM gsc_daily_metrics
WHERE date > CURRENT_DATE - interval '28 days'
GROUP BY page_path
HAVING SUM(impressions) > 50 AND SUM(clicks)::numeric / NULLIF(SUM(impressions), 0) < 0.02
ORDER BY total_impressions DESC;
