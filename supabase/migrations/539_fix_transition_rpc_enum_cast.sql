-- =============================================================================
-- Migration 539 — Fix transition_cee_dossier_status : cast enum + statut invalide
-- =============================================================================
-- Contexte (audit drift 2026-06-05, suite 537) : la RPC de la migration 410 a
-- été écrite pour le schéma 402 où `cee_dossiers.status` était TEXT. La table
-- live (migration 431) type `status` en enum `cee_dossier_status` →
-- « column "status" is of type cee_dossier_status but expression is of type
-- text » sur chaque appel. 537 a réparé la colonne metadata manquante ;
-- cette migration ajoute le cast et transforme un statut hors enum en retour
-- contrôlé { ok:false, reason:'invalid_status' } au lieu d'une exception 500.
--
-- Consommateurs : cron cee-dossier-transitions + route admin transition
-- (via lib/cee/dossiers.ts → transitionCeeDossierStatus).
--
-- NB SQL editor : variable déclarée préfixée `_` (pas `v_`) — le dashboard
-- Supabase injecte un ALTER TABLE ENABLE RLS parasite sur les DECLARE v_xxx.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION transition_cee_dossier_status(
  p_dossier_id UUID,
  p_to_status TEXT,
  p_actor_id UUID,
  p_actor_type TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $fn$
DECLARE
  _row cee_dossiers%ROWTYPE;
BEGIN
  IF p_actor_type IS NOT NULL AND p_actor_type NOT IN ('system','admin','artisan','client','delegataire_api') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_actor_type');
  END IF;

  BEGIN
    UPDATE cee_dossiers
    SET status = p_to_status::cee_dossier_status,
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
          '_actor_type', p_actor_type,
          '_actor_id', p_actor_id,
          '_transitioned_at', to_jsonb(NOW())
        )
    WHERE id = p_dossier_id
    RETURNING * INTO _row;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'invalid_status');
  END;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'dossier_id', _row.id,
    'status', _row.status
  );
END;
$fn$;

COMMIT;
