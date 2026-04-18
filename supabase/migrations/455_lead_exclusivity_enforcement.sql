-- =====================================================================
-- Migration 455 : Enforcement technique de la regle leads exclusifs
-- Date : 2026-04-18
--
-- Contexte :
--   La regle non-negociable de ServicesArtisans est "1 lead = 1 artisan,
--   jamais partage" (memory feedback_exclusive_leads_only). Pourtant :
--
--   - algorithm_config.max_artisans_per_lead = 3 par defaut (migration 201)
--   - CHECK existant autorise BETWEEN 1 AND 20 (migration 303)
--   - lead_assignments UNIQUE (lead_id, provider_id) : 1 lead peut avoir
--     plusieurs provider rows → lead partage possible en pratique
--
--   Sans garde-fou DB, un simple bug dans le code applicatif ou un admin
--   qui modifie la config fait basculer en leads partages → class action
--   DGCCRF + Trustpilot lynch.
--
-- Fix :
--   1. Lock max_artisans_per_lead = 1 (CHECK strict)
--   2. Set la valeur courante a 1 dans algorithm_config
--   3. Partial UNIQUE INDEX sur lead_assignments (lead_id) pour status
--      actifs (pending, viewed, quoted) → 1 seule attribution active par
--      lead. Status 'declined' permet la reassignation.
--   4. Trigger : refuser INSERT dans lead_assignments si une assignation
--      active existe deja pour ce lead_id.
--
-- Cette migration est la **preuve technique** que la regle est respectee
-- au niveau base de donnees. Un audit DGCCRF peut verifier directement.
-- =====================================================================

-- 1. Forcer la config a 1
UPDATE public.algorithm_config
SET max_artisans_per_lead = 1,
    updated_at = NOW()
WHERE max_artisans_per_lead != 1;

-- 2. Durcir le CHECK : exactement 1
ALTER TABLE public.algorithm_config
  DROP CONSTRAINT IF EXISTS chk_max_artisans_per_lead;

ALTER TABLE public.algorithm_config
  ADD CONSTRAINT chk_max_artisans_per_lead
  CHECK (max_artisans_per_lead = 1);

-- 3. Partial UNIQUE INDEX : 1 seule assignation active par lead
DROP INDEX IF EXISTS uniq_lead_assignments_active_lead_id;

CREATE UNIQUE INDEX uniq_lead_assignments_active_lead_id
  ON public.lead_assignments (lead_id)
  WHERE status IN ('pending', 'viewed', 'quoted');

-- 4. Fonction + trigger pour message d'erreur clair
CREATE OR REPLACE FUNCTION public.enforce_lead_exclusivity()
RETURNS TRIGGER AS $BODY$
DECLARE
  v_existing_count INTEGER;
BEGIN
  -- On ignore les INSERT en status 'declined' : c'est une reassignation
  IF NEW.status = 'declined' THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_existing_count
  FROM public.lead_assignments
  WHERE lead_id = NEW.lead_id
    AND status IN ('pending', 'viewed', 'quoted')
    AND id != NEW.id;

  IF v_existing_count > 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = 'exclusion_violation',
      MESSAGE = format(
        'Lead exclusivity violated: lead_id %s already has an active assignment. ServicesArtisans leads are always exclusive (1 lead = 1 artisan).',
        NEW.lead_id
      );
  END IF;

  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lead_exclusivity ON public.lead_assignments;
CREATE TRIGGER trg_lead_exclusivity
  BEFORE INSERT OR UPDATE OF status ON public.lead_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_lead_exclusivity();

-- 5. View d'audit : pour le dashboard artisan + audit DGCCRF
--    Liste toutes les assignations avec un flag 'is_exclusive' (true si
--    aucune autre assignation active pour ce lead), le timestamp precis
--    et le hash de la combinaison lead+provider+time (proof immutable).
CREATE OR REPLACE VIEW public.lead_exclusivity_audit AS
SELECT
  la.id AS assignment_id,
  la.lead_id,
  la.provider_id,
  la.assigned_at,
  la.status,
  (
    SELECT COUNT(*) = 1
    FROM public.lead_assignments la2
    WHERE la2.lead_id = la.lead_id
      AND la2.status IN ('pending', 'viewed', 'quoted')
  ) AS is_exclusive_active,
  encode(
    digest(
      la.lead_id::text || ':' || la.provider_id::text || ':' || la.assigned_at::text,
      'sha256'
    ),
    'hex'
  ) AS exclusivity_proof_hash
FROM public.lead_assignments la;

COMMENT ON VIEW public.lead_exclusivity_audit IS
  'Audit trail pour la regle "1 lead = 1 artisan". exclusivity_proof_hash est un SHA256(lead_id:provider_id:assigned_at) immuable servant de preuve pour les artisans + DGCCRF.';

-- =====================================================================
-- Rollback :
--   DROP VIEW IF EXISTS public.lead_exclusivity_audit;
--   DROP TRIGGER IF EXISTS trg_lead_exclusivity ON public.lead_assignments;
--   DROP FUNCTION IF EXISTS public.enforce_lead_exclusivity();
--   DROP INDEX IF EXISTS uniq_lead_assignments_active_lead_id;
--   ALTER TABLE public.algorithm_config DROP CONSTRAINT chk_max_artisans_per_lead;
--   ALTER TABLE public.algorithm_config
--     ADD CONSTRAINT chk_max_artisans_per_lead
--     CHECK (max_artisans_per_lead BETWEEN 1 AND 20);
-- =====================================================================
