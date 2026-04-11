-- =============================================================================
-- Migration 410 — transition_cee_dossier_status (RPC atomique, brique 2 CEE)
-- =============================================================================
-- Contexte
-- --------
-- `src/lib/cee/dossiers.ts::transitionCeeDossierStatus` livrait les transitions
-- de statut via un pattern select-then-merge-then-update non atomique :
--
--   1. SELECT metadata FROM cee_dossiers WHERE id = $1
--   2. côté TS : merged = { ...metadata, _actor_type, _actor_id, _transitioned_at }
--   3. UPDATE cee_dossiers SET status, metadata = merged WHERE id = $1
--
-- Entre l'étape 1 et l'étape 3, n'importe quel autre writer (cron de dépose
-- délégataire, worker PNCEE, admin concurrent) peut modifier `metadata` —
-- les clés écrites entre-temps sont silencieusement perdues au moment de
-- l'UPDATE. Cette migration expose une RPC plpgsql qui exécute la transition
-- en une seule requête atomique via `metadata || jsonb_build_object(...)`.
--
-- Le code applicatif consomme cette RPC via `supabase.rpc('transition_cee_dossier_status', ...)`
-- et retombe sur une erreur explicite si la RPC n'est pas installée
-- (dev local sans migration appliquée). Fail-closed côté TS.
--
-- Triggers concernés
-- ------------------
-- L'UPDATE standard sur `cee_dossiers` fait exécuter normalement :
--   - `cee_dossiers_validate_status_transition` (BEFORE UPDATE, DAG guard)
--   - `freeze_engagement` (BEFORE UPDATE)
--   - `cee_dossiers_set_updated_at` (BEFORE UPDATE)
--   - trigger d'audit (AFTER UPDATE, lecture de metadata._actor_*)
--
-- Sources
-- -------
--   - Migration 402 (cee_dossiers, triggers DAG + audit)
--   - src/lib/cee/dossiers.ts (consommateur)
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Fonction RPC : transition_cee_dossier_status
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION transition_cee_dossier_status(
  p_dossier_id UUID,
  p_to_status TEXT,
  p_actor_id UUID,
  p_actor_type TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row cee_dossiers%ROWTYPE;
BEGIN
  IF p_actor_type IS NOT NULL AND p_actor_type NOT IN ('system','admin','artisan','client','delegataire_api') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_actor_type');
  END IF;

  UPDATE cee_dossiers
  SET status = p_to_status,
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        '_actor_type', p_actor_type,
        '_actor_id', p_actor_id,
        '_transitioned_at', to_jsonb(NOW())
      )
  WHERE id = p_dossier_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'dossier_id', v_row.id,
    'status', v_row.status
  );
END;
$$;

REVOKE ALL ON FUNCTION transition_cee_dossier_status(UUID, TEXT, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION transition_cee_dossier_status(UUID, TEXT, UUID, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION transition_cee_dossier_status(UUID, TEXT, UUID, TEXT)
  TO service_role;

COMMENT ON FUNCTION transition_cee_dossier_status(UUID, TEXT, UUID, TEXT) IS
  'Transition atomique du DAG cee_dossiers avec merge metadata. Fix race condition select-then-update (audit Phase 2 mandataire CEE).';

COMMIT;
