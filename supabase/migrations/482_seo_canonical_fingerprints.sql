-- Migration 482 — Table `seo_canonical_fingerprints`
--
-- Pourquoi :
--   Bouclier 2 du plan ULTRA DOMINATION SEO v2 — détection de drift
--   canonical / title / meta description / h1 / noindex sur les URLs
--   SEO-critiques. Empêche un déploy de tuer silencieusement l'indexation
--   d'une template (canonical changé) ou de basculer en noindex par
--   erreur.
--
-- Conception :
--   - 1 ligne par (snapshot_date, url) avec fingerprint hash + composantes
--     extraites pour debug rapide sans rejouer le crawl
--   - Index (url, snapshot_date DESC) pour la query "dernière empreinte
--     vue pour cette URL"
--   - CHECK fingerprint = SHA-256 hex (64 chars) → détecte les inserts
--     malformés (rien d'autre ne devrait jamais matcher)

CREATE TABLE IF NOT EXISTS seo_canonical_fingerprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  url TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  canonical TEXT,
  title TEXT,
  meta_description TEXT,
  h1 TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  status_code INTEGER NOT NULL DEFAULT 0,
  drift_severity TEXT NOT NULL DEFAULT 'ok',
  CONSTRAINT canonical_fp_hash_format CHECK (fingerprint ~ '^[a-f0-9]{64}$'),
  CONSTRAINT canonical_fp_severity_check CHECK (drift_severity IN ('ok', 'warn', 'critical', 'new')),
  CONSTRAINT canonical_fp_status_range CHECK (status_code >= 0 AND status_code < 600),
  CONSTRAINT canonical_fp_unique_day_url UNIQUE (snapshot_date, url)
);

CREATE INDEX IF NOT EXISTS idx_canonical_fp_url_date_desc
  ON seo_canonical_fingerprints (url, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_canonical_fp_snapshot_date_desc
  ON seo_canonical_fingerprints (snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_canonical_fp_drift_critical
  ON seo_canonical_fingerprints (snapshot_date DESC)
  WHERE drift_severity = 'critical';

COMMENT ON TABLE seo_canonical_fingerprints IS
  'Snapshots quotidiens des fingerprints SEO (canonical/title/meta/h1/noindex). Bouclier 2 plan v2.';
COMMENT ON COLUMN seo_canonical_fingerprints.drift_severity IS
  'critical = canonical changed OR noindex flipped, warn = title/meta/h1 changed, ok = identical, new = première occurrence.';

ALTER TABLE seo_canonical_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read seo_canonical_fingerprints" ON seo_canonical_fingerprints
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Service role write seo_canonical_fingerprints" ON seo_canonical_fingerprints
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON seo_canonical_fingerprints FROM anon;
