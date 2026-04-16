-- Migration 450: Enrichissement simulateur — nouvelles aides P0-P2
-- Ajout colonnes pour MAR, CEE ampleur, éco-PTZ, PAR, copropriété, complémentaires

-- Parcours accompagné
ALTER TABLE simulateur_estimations
  ADD COLUMN IF NOT EXISTS mar_prise_en_charge integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cee_ampleur integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mpr_budget_plafonne integer,
  ADD COLUMN IF NOT EXISTS mpr_plafond_ht integer;

-- Prêts (informatifs)
ALTER TABLE simulateur_estimations
  ADD COLUMN IF NOT EXISTS eco_ptz_eligible boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS eco_ptz_montant_max integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS eco_ptz_duree_max_ans integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS par_eligible boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS par_montant_max integer DEFAULT 0;

-- Aides complémentaires (JSON — structure variable)
ALTER TABLE simulateur_estimations
  ADD COLUMN IF NOT EXISTS complementaires jsonb DEFAULT '{}'::jsonb;

-- Total aides (fourchettes)
ALTER TABLE simulateur_estimations
  ADD COLUMN IF NOT EXISTS total_aides_bas integer,
  ADD COLUMN IF NOT EXISTS total_aides_haut integer;

-- Copropriété flag (situation)
ALTER TABLE simulateur_estimations
  ADD COLUMN IF NOT EXISTS copropriete boolean DEFAULT false;

COMMENT ON COLUMN simulateur_estimations.mar_prise_en_charge IS 'Prise en charge MAR par État (parcours accompagné)';
COMMENT ON COLUMN simulateur_estimations.cee_ampleur IS 'CEE rénovation ampleur (parcours accompagné)';
COMMENT ON COLUMN simulateur_estimations.eco_ptz_eligible IS 'Éligibilité éco-PTZ';
COMMENT ON COLUMN simulateur_estimations.eco_ptz_montant_max IS 'Montant max éco-PTZ';
COMMENT ON COLUMN simulateur_estimations.par_eligible IS 'Éligibilité PAR+ (bleu/jaune)';
COMMENT ON COLUMN simulateur_estimations.par_montant_max IS 'Montant max PAR+';
COMMENT ON COLUMN simulateur_estimations.complementaires IS 'Aides complémentaires (copro, Denormandie, taxe foncière) — JSON';
