-- ===========================================================================
-- Migration 464 — Baromètre RGE mensuel : snapshots persistés
-- ===========================================================================
-- Objectif : persister chaque mois un cliché agrégé des artisans RGE
-- (par région + top qualifications + totaux nationaux) afin de :
--   1. Tracer l'évolution mensuelle (delta vs. M-1, M-12)
--   2. Générer une page publique /barometre/rge stable (ISR)
--   3. Fournir un jeu de données citable (Schema.org Dataset) pour PR/médias
--
-- La source de vérité reste la table `providers` (champs rge_*), synchronisée
-- chaque semaine depuis le répertoire ADEME. Un snapshot = photo figée.
-- ===========================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.barometre_rge_snapshots (
  id              BIGSERIAL PRIMARY KEY,
  yearmonth       TEXT        NOT NULL UNIQUE
    CHECK (yearmonth ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),  -- "2026-04" strict
  captured_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_rge_active INTEGER     NOT NULL,                -- artisans RGE en cours
  total_rge_expired INTEGER    NOT NULL,                -- RGE expirés
  total_providers  INTEGER     NOT NULL,                -- total providers actifs

  -- JSON structures pour éviter 20 colonnes volatiles
  by_region        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  -- [{ region, region_slug, nb_rge_active, nb_rge_expired, top_qualification }]

  by_qualification JSONB       NOT NULL DEFAULT '[]'::jsonb,
  -- [{ code, nb_artisans, rank }]

  by_specialty     JSONB       NOT NULL DEFAULT '[]'::jsonb,
  -- [{ specialty, nb_rge_active, share_pct }]

  organismes       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  -- [{ organisme, nb_artisans }]

  methodology      TEXT        NOT NULL DEFAULT '',
  source_note      TEXT        NOT NULL DEFAULT 'ADEME annuaire-entreprises RGE — sync hebdo'
);

COMMENT ON TABLE public.barometre_rge_snapshots IS
  'Snapshots mensuels du Baromètre RGE (agrégats publiables). Source : providers.rge_*, issus de la sync hebdomadaire ADEME.';

COMMENT ON COLUMN public.barometre_rge_snapshots.yearmonth IS
  'Format YYYY-MM. Unicité : 1 snapshot par mois, écrasable via INSERT ... ON CONFLICT.';

CREATE INDEX IF NOT EXISTS idx_barometre_rge_snapshots_yearmonth
  ON public.barometre_rge_snapshots(yearmonth DESC);

-- RLS : lecture publique (données publiées), écriture service_role uniquement
ALTER TABLE public.barometre_rge_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read barometre RGE" ON public.barometre_rge_snapshots;
CREATE POLICY "Public read barometre RGE"
  ON public.barometre_rge_snapshots FOR SELECT
  USING (true);

-- pas de policy INSERT/UPDATE/DELETE : seul le service_role (admin client) y écrit.

COMMIT;
