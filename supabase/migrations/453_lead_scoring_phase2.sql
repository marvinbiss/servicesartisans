-- Migration 453: Lead scoring Phase 2 — urgence projet + âge chaudière
-- Deux signaux UI forts pour le scoring commercial.

ALTER TABLE simulateur_estimations
  ADD COLUMN IF NOT EXISTS urgence_projet text,
  ADD COLUMN IF NOT EXISTS age_chaudiere text;

COMMENT ON COLUMN simulateur_estimations.urgence_projet IS
  'Urgence déclarée : urgent_panne | sous_3_mois | sous_6_mois | je_me_renseigne (nullable si non renseigné)';
COMMENT ON COLUMN simulateur_estimations.age_chaudiere IS
  'Âge chaudière déclaré : moins_5_ans | 5_10_ans | 10_15_ans | plus_15_ans | en_panne (nullable, conditionnel objectif=chauffage)';

-- Index pour segmentation admin : filtrer les leads urgents
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_urgence
  ON simulateur_estimations (urgence_projet)
  WHERE urgence_projet IS NOT NULL;
