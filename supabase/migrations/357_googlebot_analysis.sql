-- Table de stockage des rapports d'analyse Googlebot hebdomadaires
CREATE TABLE IF NOT EXISTS googlebot_analysis (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_crawls integer NOT NULL DEFAULT 0,
  crawls_per_day jsonb NOT NULL DEFAULT '[]'::jsonb,
  top_pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  never_crawled_sample jsonb NOT NULL DEFAULT '[]'::jsonb,
  page_type_distribution jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_agent_distribution jsonb NOT NULL DEFAULT '[]'::jsonb,
  status_code_distribution jsonb NOT NULL DEFAULT '[]'::jsonb,
  hourly_distribution jsonb NOT NULL DEFAULT '[]'::jsonb,
  logs_purged integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour récupérer le dernier rapport rapidement
CREATE INDEX idx_googlebot_analysis_created_at ON googlebot_analysis (created_at DESC);

-- RLS: only service_role can insert/read (cron uses admin client)
ALTER TABLE googlebot_analysis ENABLE ROW LEVEL SECURITY;

-- Rétention : on garde max 52 rapports (1 an de rapports hebdomadaires)
-- À exécuter manuellement ou via pg_cron si nécessaire :
-- DELETE FROM googlebot_analysis WHERE created_at < now() - interval '1 year';
