-- Migration 459 — Table `provider_insee_enrichment` for E-E-A-T enrichment
--
-- Why:
--   The RGE description pipeline plateaus on ~730 judged_fail drafts where
--   the generator (Haiku or Sonnet) can't land E-E-A-T signals strong
--   enough to cross the 7.5 publish threshold. Root cause : providers
--   context is too thin — only ADEME qualifications + slug, no business
--   history, no size, no age, no official lifecycle state.
--
--   recherche-entreprises.api.gouv.fr (powered by INSEE Sirene) returns
--   exactly the missing signals, free and without auth :
--     * date_creation        — Experience pillar (E of E-E-A-T)
--     * tranche_effectif     — credibility (TPE vs solo vs PME)
--     * activite_principale  — NAF code, Expertise anchor
--     * etat_administratif   — A=active / C=cessée (noindex candidates)
--     * nombre_etablissements — multi-site presence
--     * liste_rge            — cross-check vs ADEME qualifications
--
-- Design decisions:
--   * PK = provider_id (1 enrichment row per provider). Refresh = UPSERT.
--   * ON DELETE CASCADE — provider disappears, enrichment follows.
--   * Typed columns for the 6 common signals consumed by the prompt builder
--     + JSONB `raw` to carry the full API payload without re-migrating on
--     every schema tweak upstream.
--   * Timestamps : `fetched_at` drives the refresh cron, `last_api_update`
--     records the upstream INSEE mise_à_jour so we can detect real drift.
--   * RLS : public NO READ. service_role only.

BEGIN;

CREATE TABLE provider_insee_enrichment (
  provider_id               UUID PRIMARY KEY REFERENCES providers(id) ON DELETE CASCADE,

  -- Canonical identifiers (denormalised for easy joins without providers)
  siren                     TEXT,
  siret_siege               TEXT,

  -- E-E-A-T primary signals
  date_creation             DATE,
  tranche_effectif_code     TEXT,
  tranche_effectif_label    TEXT,
  activite_principale_naf   TEXT,
  etat_administratif        TEXT,       -- 'A' = active, 'C' = cessée
  nombre_etablissements     INTEGER,
  nombre_etablissements_ouverts INTEGER,

  -- Official identity fallback (useful when providers.name drifted from legal name)
  nom_complet               TEXT,

  -- Cross-check anchor : RGE codes declared in the official registry.
  -- Used by the validator to flag hallucinated qualifications and by the
  -- prompt to mention "10 qualifications officielles" when applicable.
  liste_rge_codes           TEXT[],

  -- Full API payload for forensics (debug, replay, schema migration)
  raw                       JSONB DEFAULT '{}'::jsonb,

  -- Lifecycle
  fetched_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_api_update           TIMESTAMPTZ,
  fetch_error               TEXT,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index partiel pour cron refresh (candidats : pas touchés depuis X jours)
CREATE INDEX idx_pie_refresh_candidates
  ON provider_insee_enrichment (fetched_at ASC)
  WHERE fetch_error IS NULL;

-- Index for noindex-sweep : providers cessées côté INSEE
CREATE INDEX idx_pie_etat_cessee
  ON provider_insee_enrichment (provider_id)
  WHERE etat_administratif = 'C';

CREATE OR REPLACE FUNCTION set_pie_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS 'BEGIN NEW.updated_at = now(); RETURN NEW; END;';

CREATE TRIGGER trg_pie_updated_at
  BEFORE UPDATE ON provider_insee_enrichment
  FOR EACH ROW
  EXECUTE FUNCTION set_pie_updated_at();

ALTER TABLE provider_insee_enrichment ENABLE ROW LEVEL SECURITY;
-- RLS enabled + zero policy = deny-all for anon/authenticated.
-- service_role bypasses RLS natively via createAdminClient.

COMMENT ON TABLE provider_insee_enrichment IS
  'E-E-A-T enrichment pulled from recherche-entreprises.api.gouv.fr (INSEE Sirene). Feeds the RGE description prompt v1.1 and the noindex sweep on etat_administratif=C.';

COMMIT;
