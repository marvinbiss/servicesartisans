-- Migration 478 — Table `seo_baseline_snapshots`
--
-- Pourquoi :
--   Le plan ULTRA DOMINATION SEO v2 (2026-04-28) impose un Gate P0 chiffré
--   à J+30 (+50% clics/jour vs baseline). Sans snapshot horodaté immuable
--   des metrics SEO, la décision GO/NO-GO P1 reste subjective.
--
--   Cette table fige l'agrégat de `seo_page_scores` à un instant T avec un
--   label sémantique (ex: 'baseline-2026-04-29-bugs-fix', 'gate-p0-j30')
--   pour permettre le calcul de delta avant/après.
--
-- Conception :
--   - Snapshot = tuple (label, snapshot_date, agrégats). Pas d'historisation
--     row-by-row (seo_page_scores fait déjà ça, on a juste besoin du résumé).
--   - `label` UNIQUE : empêche d'écraser un snapshot officiel par mégarde.
--   - `by_page_type` JSONB : breakdown par template (services, rge, avis,
--     blog, etc.) — pour repérer un drop ciblé sur un type seul.
--   - RLS admin-only : ce sont des décisions stratégiques, pas du public SEO.
--
-- Lecture côté app : SECURITY INVOKER + RLS (admin-only) — voir route
-- `/api/cron/seo-baseline-snapshot` (createAdminClient bypass) et page
-- `/admin/seo/foundations-impact` (requirePermission).

CREATE TABLE IF NOT EXISTS seo_baseline_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  label TEXT NOT NULL,
  total_pages INTEGER NOT NULL,
  indexed_count INTEGER NOT NULL DEFAULT 0,
  orphan_critical INTEGER NOT NULL DEFAULT 0,
  orphan_weak INTEGER NOT NULL DEFAULT 0,
  avg_link_score NUMERIC(6, 2),
  median_link_score NUMERIC(6, 2),
  by_page_type JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT seo_baseline_snapshots_label_unique UNIQUE (label),
  CONSTRAINT seo_baseline_snapshots_label_format CHECK (
    label ~ '^[a-z0-9][a-z0-9-]{1,80}[a-z0-9]$'
  )
);

CREATE INDEX IF NOT EXISTS idx_seo_baseline_snapshot_date_desc
  ON seo_baseline_snapshots (snapshot_date DESC);

COMMENT ON TABLE seo_baseline_snapshots IS
  'Snapshots horodatés des agrégats seo_page_scores. Servent à valider le Gate P0 J+30 du plan ULTRA DOMINATION SEO v2 (delta clics/impressions/orphans avant et après chaque sprint).';

COMMENT ON COLUMN seo_baseline_snapshots.label IS
  'Slug stable kebab-case (ex: baseline-2026-04-29, gate-p0-j30). UNIQUE pour empêcher écrasement.';

COMMENT ON COLUMN seo_baseline_snapshots.by_page_type IS
  'Breakdown par template : { "services": { count, indexed, avg_link_score }, "rge": { ... } }';

ALTER TABLE seo_baseline_snapshots ENABLE ROW LEVEL SECURITY;

-- Lecture admin uniquement (décisions stratégiques, pas du public).
CREATE POLICY "Admin read seo_baseline_snapshots" ON seo_baseline_snapshots
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Écriture service_role uniquement (cron + admin endpoints via createAdminClient).
CREATE POLICY "Service role write seo_baseline_snapshots" ON seo_baseline_snapshots
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- REVOKE explicite pour le rôle anon — ces snapshots ne doivent JAMAIS
-- transiter par le client navigateur.
REVOKE ALL ON seo_baseline_snapshots FROM anon;
