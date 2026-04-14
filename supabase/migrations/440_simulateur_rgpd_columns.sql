-- Migration 440: simulateur_estimations — colonnes RGPD + coordonnées (P7)
-- Date: 2026-04-14
-- Phase P7 simulateur aides rénovation — cron anonymisation + export + delete
-- Doc RGPD: docs/rgpd-simulateur-aides.md §4 (durées) + §5 (droits)
-- Dépend: migrations 438, 439
--
-- Pourquoi cette migration :
--   Migration 438 créait `rfr` en clair mais sans support d'anonymisation.
--   Step 4 UI (P3) capture nom/email/téléphone mais la table n'avait pas les
--   colonnes de stockage — les coords étaient envoyées directement à Pipedrive.
--   Le cron rgpd-anonymize a besoin de rfr_exact / rfr_tranche / anonymized_at
--   + coords nullables pour respecter §4.

BEGIN;

-- ---------------------------------------------------------------------------
-- 440.1  Colonnes coordonnées (nullables pour anonymisation à 3 ans)
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulateur_estimations
  ADD COLUMN IF NOT EXISTS prenom      text,
  ADD COLUMN IF NOT EXISTS nom         text,
  ADD COLUMN IF NOT EXISTS email       text,
  ADD COLUMN IF NOT EXISTS telephone   text;

COMMENT ON COLUMN public.simulateur_estimations.email     IS 'Coord. lead — nullable : anonymisée à 3 ans (§4 RGPD)';
COMMENT ON COLUMN public.simulateur_estimations.telephone IS 'Coord. lead — nullable : anonymisée à 3 ans (§4 RGPD)';
COMMENT ON COLUMN public.simulateur_estimations.prenom    IS 'Coord. lead — nullable : anonymisée à 3 ans (§4 RGPD)';
COMMENT ON COLUMN public.simulateur_estimations.nom       IS 'Coord. lead — nullable : anonymisée à 3 ans (§4 RGPD)';

-- ---------------------------------------------------------------------------
-- 440.2  Colonnes RGPD anonymisation RFR
--   - rfr_exact : RFR en clair, NULL après 90j
--   - rfr_tranche : tranche 10k arrondie inf ("20000-29999"), conservée
--   - anonymized_at : horodatage de l'anonymisation coords
--   - deleted_at : horodatage demande art. 17 (effacement)
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulateur_estimations
  ADD COLUMN IF NOT EXISTS rfr_exact       integer,
  ADD COLUMN IF NOT EXISTS rfr_tranche     text,
  ADD COLUMN IF NOT EXISTS anonymized_at   timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at      timestamptz,
  ADD COLUMN IF NOT EXISTS consent_rgpd_at timestamptz,
  ADD COLUMN IF NOT EXISTS budget_ht       numeric(10,2);

COMMENT ON COLUMN public.simulateur_estimations.rfr_exact      IS 'RFR en clair — NULL après 90j (§4 RGPD)';
COMMENT ON COLUMN public.simulateur_estimations.rfr_tranche    IS 'Tranche 10k arrondie inf (ex: "20000-29999") — conservée pour stats';
COMMENT ON COLUMN public.simulateur_estimations.anonymized_at  IS 'Horodatage anonymisation coords (cron §4 règle 2)';
COMMENT ON COLUMN public.simulateur_estimations.deleted_at     IS 'Horodatage demande effacement art. 17 RGPD';
COMMENT ON COLUMN public.simulateur_estimations.consent_rgpd_at IS 'Horodatage consentement RGPD Step 4';
COMMENT ON COLUMN public.simulateur_estimations.budget_ht      IS 'Budget HT saisi par le prospect, sert au recompute admin (P5) et à l''écrêtement reproductible';

-- Backfill rfr_exact depuis rfr pour les rows existantes
UPDATE public.simulateur_estimations
SET rfr_exact = rfr
WHERE rfr_exact IS NULL AND rfr IS NOT NULL;

-- Backfill rfr_tranche
UPDATE public.simulateur_estimations
SET rfr_tranche = ((rfr / 10000) * 10000) || '-' || ((rfr / 10000) * 10000 + 9999)
WHERE rfr_tranche IS NULL AND rfr IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 440.3  Index pour le cron rgpd-anonymize (§4)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sim_estim_rgpd_rfr_cleanup
  ON public.simulateur_estimations(created_at)
  WHERE rfr_exact IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sim_estim_rgpd_coords_cleanup
  ON public.simulateur_estimations(created_at)
  WHERE anonymized_at IS NULL AND pipedrive_deal_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_sim_estim_rgpd_iphash_cleanup
  ON public.simulateur_estimations(created_at)
  WHERE ip_hash IS NOT NULL;

COMMIT;
