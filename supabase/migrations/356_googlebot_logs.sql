-- Googlebot crawl logging table for SEO monitoring
CREATE TABLE IF NOT EXISTS googlebot_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  url text NOT NULL,
  user_agent text NOT NULL,
  status smallint,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for dashboard queries: top crawled pages, crawl rate/day
CREATE INDEX idx_googlebot_logs_created_at ON googlebot_logs (created_at DESC);
CREATE INDEX idx_googlebot_logs_url ON googlebot_logs (url);

-- Auto-cleanup: drop rows older than 30 days (run via pg_cron or manual)
-- DELETE FROM googlebot_logs WHERE created_at < now() - interval '30 days';

-- RLS: only service_role can insert (middleware uses admin client)
ALTER TABLE googlebot_logs ENABLE ROW LEVEL SECURITY;

-- RPC: crawl rate by day (last 14 days)
CREATE OR REPLACE FUNCTION googlebot_crawl_rate_by_day()
RETURNS TABLE(day date, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT created_at::date AS day, count(*) AS count
  FROM googlebot_logs
  WHERE created_at >= now() - interval '14 days'
  GROUP BY created_at::date
  ORDER BY day DESC;
$$;

-- RPC: page type distribution (last 30 days)
CREATE OR REPLACE FUNCTION googlebot_page_type_distribution()
RETURNS TABLE(page_type text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    CASE
      WHEN url LIKE '/services/%/%/%' THEN 'provider'
      WHEN url LIKE '/services/%/%' THEN 'service×ville'
      WHEN url LIKE '/services/%' THEN 'service'
      WHEN url LIKE '/devis/%/%' THEN 'devis×ville'
      WHEN url LIKE '/devis/%' THEN 'devis'
      WHEN url LIKE '/tarifs/%/%/%' THEN 'tarifs×task'
      WHEN url LIKE '/tarifs/%/%' THEN 'tarifs×ville'
      WHEN url LIKE '/tarifs/%' THEN 'tarifs'
      WHEN url LIKE '/avis/%/%' THEN 'avis×ville'
      WHEN url LIKE '/avis/%' THEN 'avis'
      WHEN url LIKE '/urgence/%/%' THEN 'urgence×ville'
      WHEN url LIKE '/problemes/%/%' THEN 'problemes×ville'
      WHEN url LIKE '/problemes/%' THEN 'problemes'
      WHEN url LIKE '/departements/%/%' THEN 'dept×service'
      WHEN url LIKE '/departements/%' THEN 'departement'
      WHEN url LIKE '/regions/%/%' THEN 'region×service'
      WHEN url LIKE '/regions/%' THEN 'region'
      WHEN url LIKE '/villes/%' THEN 'ville'
      WHEN url LIKE '/blog/%' THEN 'blog'
      WHEN url LIKE '/guides/%' THEN 'guide'
      WHEN url LIKE '/barometre/%' THEN 'barometre'
      ELSE 'other'
    END AS page_type,
    count(*) AS count
  FROM googlebot_logs
  WHERE created_at >= now() - interval '30 days'
  GROUP BY page_type
  ORDER BY count DESC;
$$;
