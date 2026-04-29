-- Migration 479 — Table `sitemap_health_runs`
--
-- Pourquoi :
--   Bouclier 5 du plan ULTRA DOMINATION SEO v2 : "Diff sitemap > 5%
--   URLs/jour → alerte". Sans persistance des runs, on ne peut pas comparer
--   un cron à son précédent. Cette table stocke chaque inventaire produit
--   par `/api/cron/sitemap-health` (1 ligne par child sitemap par run).
--
-- Conception :
--   - 1 ligne = (run_at, sitemap_url, url_count, status, ok). Pas
--     d'agrégation côté DB : la comparaison se fait côté code (LATERAL)
--     pour pouvoir muter le seuil sans migration.
--   - Index composite (sitemap_url, run_at DESC) pour la query "last run
--     per sitemap" en O(log n).
--   - Pas de FK : on ne tracke pas un run_id global (pas de table parent).
--     Le run logique est identifié par le timestamp partagé.

CREATE TABLE IF NOT EXISTS sitemap_health_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sitemap_url TEXT NOT NULL,
  url_count INTEGER NOT NULL DEFAULT 0,
  status INTEGER NOT NULL DEFAULT 0,
  ok BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_sitemap_health_runs_url_run_at_desc
  ON sitemap_health_runs (sitemap_url, run_at DESC);

CREATE INDEX IF NOT EXISTS idx_sitemap_health_runs_run_at_desc
  ON sitemap_health_runs (run_at DESC);

COMMENT ON TABLE sitemap_health_runs IS
  'Historique des runs de /api/cron/sitemap-health. Sert au diff jour-à-jour (Bouclier 5 du plan v2).';

ALTER TABLE sitemap_health_runs ENABLE ROW LEVEL SECURITY;

-- Lecture admin uniquement (debugging dashboard).
CREATE POLICY "Admin read sitemap_health_runs" ON sitemap_health_runs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Écriture service_role uniquement (cron via createAdminClient).
CREATE POLICY "Service role write sitemap_health_runs" ON sitemap_health_runs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Pas de transit anon — données techniques internes.
REVOKE ALL ON sitemap_health_runs FROM anon;
