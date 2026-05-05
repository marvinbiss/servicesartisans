-- 502_provider_claims_manual_verification.sql
-- ----------------------------------------------------------------------------
-- Funnel claim 2026-05-05 — débloque le supply-side.
--
-- Avant : si la fiche provider n'avait pas de SIRET en DB (~ 60% du parc qui
-- vient de seeds anciens), l'API claim renvoyait 400 dead-end et l'UI affichait
-- "envoyez un email à support". Résultat : 0 claim possible sur ces fiches,
-- claim rate plafonné à 0.002% (19 / 970K).
--
-- Maintenant : on accepte le claim avec `manual_verification_required = true`,
-- l'admin vérifie le SIRET fourni via API SIRENE puis approuve. Le flag laisse
-- une trace explicite pour distinguer les flux auto-approve (sprint 4 vague 4)
-- des claims qui nécessitent un check humain.
-- ----------------------------------------------------------------------------

ALTER TABLE provider_claims
  ADD COLUMN IF NOT EXISTS manual_verification_required BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN provider_claims.manual_verification_required IS
  'TRUE si la fiche provider n''avait pas de SIRET en DB au moment du claim. '
  'Bloque l''auto-approve cron (sprint 4 vague 4) et oblige un admin à '
  'vérifier le SIRET fourni via API SIRENE avant approbation.';

-- Index partiel pour la file admin "à vérifier manuellement"
CREATE INDEX IF NOT EXISTS provider_claims_manual_verif_idx
  ON provider_claims (created_at DESC)
  WHERE manual_verification_required = TRUE AND status = 'pending';
