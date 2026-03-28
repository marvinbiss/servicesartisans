-- Pages prioritaires SEO (positions 8-15 dans Search Console)
-- Permet de cibler les pages "à portée de main" pour enrichissement

CREATE TABLE IF NOT EXISTS seo_priority_pages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path text NOT NULL,
  position numeric(5,1) NOT NULL,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  query text NOT NULL DEFAULT '',
  enhanced boolean NOT NULL DEFAULT false,
  enhanced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contrainte unique sur path + query (une page peut avoir plusieurs requêtes)
ALTER TABLE seo_priority_pages
  ADD CONSTRAINT uq_seo_priority_pages_path_query UNIQUE (path, query);

-- Index pour les lookups par path (utilisé par isPriorityPage)
CREATE INDEX idx_seo_priority_pages_path ON seo_priority_pages (path);

-- Index pour filtrer les pages non enrichies
CREATE INDEX idx_seo_priority_pages_pending ON seo_priority_pages (enhanced, position ASC)
  WHERE enhanced = false;

-- RLS
ALTER TABLE seo_priority_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on seo_priority_pages"
  ON seo_priority_pages
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- Table de log des enrichissements appliqués
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS seo_enhancement_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  page_path text NOT NULL,
  enhancement_type text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour requêtes par page
CREATE INDEX idx_seo_enhancement_log_path ON seo_enhancement_log (page_path, applied_at DESC);

-- Index pour requêtes par type
CREATE INDEX idx_seo_enhancement_log_type ON seo_enhancement_log (enhancement_type, applied_at DESC);

-- RLS
ALTER TABLE seo_enhancement_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on seo_enhancement_log"
  ON seo_enhancement_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
