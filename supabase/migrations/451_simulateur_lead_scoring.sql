-- Migration 451: Lead scoring & MAR routing flags
-- Scoring fioul (lead_priority = 'high' → appel prioritaire vendeuse)
-- MAR trigger (necessite_mar = true → routing vers MAR partenaire, pas vendeuse artisan)

ALTER TABLE simulateur_estimations
  ADD COLUMN IF NOT EXISTS lead_priority text NOT NULL DEFAULT 'normal'
    CHECK (lead_priority IN ('high', 'normal')),
  ADD COLUMN IF NOT EXISTS necessite_mar boolean NOT NULL DEFAULT false;

-- Index pour filtrer rapidement les leads fioul prioritaires dans l'admin
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_lead_priority
  ON simulateur_estimations (lead_priority)
  WHERE lead_priority = 'high';

-- Index pour filtrer les leads nécessitant un MAR
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_necessite_mar
  ON simulateur_estimations (necessite_mar)
  WHERE necessite_mar = true;

COMMENT ON COLUMN simulateur_estimations.lead_priority IS 'high = fioul (valeur 5x, appel prioritaire). normal = standard.';
COMMENT ON COLUMN simulateur_estimations.necessite_mar IS 'true = parcours accompagné avec MPR > 0 → router vers MAR partenaire.';
