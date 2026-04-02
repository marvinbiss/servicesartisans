-- Migration 373 : Table seo_page_scores
-- Persistance des scores de maillage interne (remplace /tmp)
-- Utilisée par les crons SEO pour calculer et stocker :
--   - liens entrants/sortants par page
--   - score de maillage, détection orphelins
--   - données GSC (phase 2)

-- ============================================================
-- A. Table seo_page_scores
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_page_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,          -- ex: /services/plombier/paris
  page_type TEXT,                           -- services, tarifs, devis, avis, urgence, blog, hub
  internal_links_in INTEGER DEFAULT 0,     -- liens entrants internes
  internal_links_out INTEGER DEFAULT 0,    -- liens sortants internes
  link_score NUMERIC(6,2) DEFAULT 0,       -- score calculé
  is_orphan BOOLEAN DEFAULT false,         -- true si < 2 liens entrants
  is_indexed BOOLEAN DEFAULT true,         -- dans le sitemap
  impressions INTEGER DEFAULT 0,           -- depuis GSC (phase 2)
  clicks INTEGER DEFAULT 0,               -- depuis GSC (phase 2)
  position NUMERIC(5,1),                   -- depuis GSC (phase 2)
  priority_class TEXT,                     -- A, B, C (phase 2)
  last_crawled_at TIMESTAMPTZ,
  last_gsc_sync_at TIMESTAMPTZ,
  source_run_id TEXT,                      -- ID du run cron qui a produit les données
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- B. Index pour les requêtes fréquentes
-- ============================================================
CREATE INDEX idx_seo_scores_type ON seo_page_scores(page_type);
CREATE INDEX idx_seo_scores_orphan ON seo_page_scores(is_orphan) WHERE is_orphan = true;
CREATE INDEX idx_seo_scores_priority ON seo_page_scores(priority_class);
CREATE INDEX idx_seo_scores_score ON seo_page_scores(link_score DESC);

-- ============================================================
-- C. Trigger updated_at (réutilise set_updated_at() de migration 102)
-- ============================================================
CREATE TRIGGER set_seo_page_scores_updated_at
  BEFORE UPDATE ON seo_page_scores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- D. Row Level Security
-- ============================================================
ALTER TABLE seo_page_scores ENABLE ROW LEVEL SECURITY;

-- Lecture publique (données SEO non sensibles, utilisées côté client pour debug/dashboard)
CREATE POLICY "Public read access on seo_page_scores" ON seo_page_scores
  FOR SELECT TO anon, authenticated
  USING (true);

-- Écriture réservée au service_role (crons via createAdminClient)
CREATE POLICY "Service role full access on seo_page_scores" ON seo_page_scores
  FOR ALL TO service_role USING (true) WITH CHECK (true);
