-- =============================================================================
-- Migration 405 — append_cee_justificatif (RPC atomique, brique 4 mandataire CEE)
-- =============================================================================
-- Contexte
-- --------
-- La brique 4 (upload justificatifs, migration 402 + src/lib/cee/justificatifs.ts)
-- livrait un append JSONB via un select-then-update optimiste avec retry :
-- lecture de `justificatifs` + `updated_at`, puis UPDATE conditionné sur le
-- `updated_at` d'origine. Deux défauts :
--
--   1. Non atomique : fenêtre de race sous charge concurrente (deux uploads
--      simultanés sur le même dossier pouvaient faire perdre une entrée).
--   2. Double source de vérité pour le journal d'audit : l'insert dans
--      `cee_dossier_events` était fait côté applicatif, best-effort, alors
--      que le reste du cycle de vie du dossier est tracé par trigger
--      (cee_dossiers_audit_log, migration 402 — uniquement sur `status`).
--
-- Cette migration pose une fonction PL/pgSQL SECURITY DEFINER qui exécute
-- en une seule transaction :
--
--   a. Dédup par `content_hash` : si une entrée avec le même hash existe
--      déjà dans le tableau, retour no-op (tableau inchangé, pas de nouvel
--      événement journalisé).
--   b. Append atomique `justificatifs = justificatifs || p_entry`.
--   c. Insertion synchrone d'un événement `justificatif_uploaded` dans
--      `cee_dossier_events`, avec un payload normalisé.
--
-- Le code applicatif consomme cette RPC via `supabase.rpc('append_cee_justificatif', ...)`
-- et retombe sur le chemin legacy uniquement si la RPC n'est pas disponible
-- (cas dev local sans migration appliquée — fallback documenté côté TS).
--
-- Sources
-- -------
--   - Migration 402 (cee_dossiers, cee_dossier_events, triggers d'audit)
--   - Migration 400 (catalogue des codes justificatifs)
--   - src/lib/cee/justificatifs.ts (consommateur)
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Fonction RPC : append_cee_justificatif
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION append_cee_justificatif(
  p_dossier_id UUID,
  p_entry JSONB,
  p_actor_id UUID DEFAULT NULL,
  p_actor_type TEXT DEFAULT 'system'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash     TEXT;
  v_existing JSONB;
  v_updated  JSONB;
BEGIN
  -- -- Validation : p_entry doit être un objet JSONB non nul --------------------
  IF p_entry IS NULL OR jsonb_typeof(p_entry) <> 'object' THEN
    RAISE EXCEPTION 'append_cee_justificatif: p_entry doit être un objet JSONB'
      USING ERRCODE = '22023';
  END IF;

  v_hash := p_entry ->> 'content_hash';
  IF v_hash IS NULL OR length(v_hash) < 8 THEN
    RAISE EXCEPTION 'append_cee_justificatif: content_hash manquant ou invalide'
      USING ERRCODE = '22023';
  END IF;

  -- -- Dédup : même content_hash sur le même dossier → no-op -------------------
  -- On inspecte le tableau JSONB en place plutôt que de lire tout le dossier
  -- côté applicatif. Une seule requête suffit pour détecter l'existant.
  SELECT entry
    INTO v_existing
    FROM cee_dossiers AS d,
         jsonb_array_elements(d.justificatifs) AS entry
   WHERE d.id = p_dossier_id
     AND entry ->> 'content_hash' = v_hash
   LIMIT 1;

  IF v_existing IS NOT NULL THEN
    -- Déjà présent : on retourne le tableau inchangé, sans append ni event.
    SELECT justificatifs INTO v_updated
      FROM cee_dossiers
     WHERE id = p_dossier_id;
    RETURN v_updated;
  END IF;

  -- -- Append atomique ---------------------------------------------------------
  -- Le trigger `cee_dossiers_set_updated_at` rafraîchit updated_at.
  -- Le trigger `cee_dossiers_audit_log` (migration 402) ne se déclenche que
  -- sur changement de `status` : rien à neutraliser ici.
  UPDATE cee_dossiers
     SET justificatifs = justificatifs || p_entry,
         updated_at    = now()
   WHERE id = p_dossier_id
   RETURNING justificatifs INTO v_updated;

  IF v_updated IS NULL THEN
    RAISE EXCEPTION 'append_cee_justificatif: dossier % introuvable', p_dossier_id
      USING ERRCODE = 'P0002';
  END IF;

  -- -- Journal d'audit ---------------------------------------------------------
  -- Insert direct (plutôt qu'un trigger dédié) pour contrôler finement le
  -- payload et éviter le couplage au format JSONB de cee_dossiers. Le
  -- trigger append-only `cee_dossier_events_block_update` (migration 402)
  -- continue de protéger l'immutabilité de la ligne une fois créée.
  INSERT INTO cee_dossier_events (
    dossier_id,
    event_type,
    actor_type,
    actor_id,
    payload
  )
  VALUES (
    p_dossier_id,
    'justificatif_uploaded',
    COALESCE(p_actor_type, 'system'),
    p_actor_id,
    jsonb_build_object(
      'code',                 p_entry ->> 'code',
      'label',                p_entry ->> 'label',
      'content_hash',         v_hash,
      'size_bytes',           p_entry -> 'size_bytes',
      'mime_type',            p_entry ->> 'mime_type',
      'exif_geotag_verified', p_entry -> 'exif_geotag_verified'
    )
  );

  RETURN v_updated;
END;
$$;

COMMENT ON FUNCTION append_cee_justificatif(UUID, JSONB, UUID, TEXT) IS
  'Append atomique d''une entrée justificatif dans cee_dossiers.justificatifs. '
  'Dédup par content_hash (no-op si déjà présent). Journalise un événement '
  'justificatif_uploaded dans cee_dossier_events avec payload normalisé. '
  'Brique 4 mandataire CEE (loi 2025-594 art. 13). Appelée via supabase.rpc() '
  'depuis src/lib/cee/justificatifs.ts.';

-- -----------------------------------------------------------------------------
-- Accords d'exécution
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER → la fonction s'exécute avec les droits du propriétaire
-- (généralement postgres), et bypasse les RLS. On autorise explicitement
-- `authenticated` (pour les routes API server-side qui passent le JWT user)
-- et `service_role` (pour les routes admin / cron).
GRANT EXECUTE ON FUNCTION append_cee_justificatif(UUID, JSONB, UUID, TEXT)
  TO authenticated, service_role;

COMMIT;

-- -----------------------------------------------------------------------------
-- Notes de validation (tests côté vitest)
-- -----------------------------------------------------------------------------
-- Les garanties ci-dessous sont vérifiées par :
--   __tests__/lib/cee/justificatifs.test.ts
-- (un bloc DO $$ ... $$ de test embarqué dans une migration prod serait
-- risqué sur un schéma partagé ; on préfère les tests applicatifs isolés).
--
-- Invariants attendus :
--   - Append d'une entrée avec un hash inédit → tableau étendu d'un élément,
--     1 ligne ajoutée dans cee_dossier_events (event_type='justificatif_uploaded').
--   - Append d'une entrée avec un hash déjà présent → tableau inchangé,
--     AUCUNE ligne ajoutée dans cee_dossier_events.
--   - Dossier inexistant → RAISE EXCEPTION (ERRCODE P0002), transaction roll-back.
--   - p_entry sans content_hash / NULL / non-objet → RAISE EXCEPTION (22023).
-- =============================================================================
