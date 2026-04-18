-- Snapshot providers.noindex state avant migration RGE-only (date 2026-04-21)
-- Permet rollback complet ou partiel via scripts/revert-noindex-non-rge.ts

CREATE TABLE IF NOT EXISTS providers_noindex_snapshot (
  provider_id UUID PRIMARY KEY REFERENCES providers(id) ON DELETE CASCADE,
  noindex_before BOOLEAN NOT NULL,
  rge_valid_until_before DATE,
  claimed_at_before TIMESTAMPTZ,
  is_active_before BOOLEAN,
  snapshotted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  script_version TEXT NOT NULL DEFAULT 'noindex-non-rge-v1'
);

CREATE INDEX IF NOT EXISTS idx_pnsnap_noindex_false
  ON providers_noindex_snapshot(provider_id)
  WHERE noindex_before = false;

COMMENT ON TABLE providers_noindex_snapshot IS
  'Snapshot state avant migration noindex RGE-only 2026-04-21. Drop à J+30 après validation.';
