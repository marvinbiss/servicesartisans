-- =============================================================================
-- Migration 413 — RGE atomic swap via staging table (P0 from audit 2026-04-12)
-- =============================================================================
-- Problème résolu
-- ---------------
-- Le sync RGE actuel (migration 406 + sync.ts) applique les UPDATEs par
-- batches de 500 via `rge_bulk_update_providers(payload jsonb)`, chaque batch
-- étant sa propre transaction. Entre deux batches, la table providers est
-- dans un état mixte : certaines lignes ont les nouvelles qualifs, d'autres
-- les anciennes, et `rge_last_synced_at` n'est plus un indicateur fiable de
-- fraîcheur globale. Pire, `clearStaleRge()` tourne APRÈS tous les UPDATEs
-- dans une phase séparée → fenêtre supplémentaire où des providers ont déjà
-- perdu leurs qualifs alors que d'autres n'ont pas encore reçu les nouvelles.
--
-- Approche
-- --------
-- 1. `rge_sync_staging` — table de staging keyed par SIRET (pas provider.id :
--    on ne connaît le provider qu'au moment du JOIN, et ça permet d'y mettre
--    des SIRET "orphelins" sans casser la logique).
-- 2. Le client streame les lignes aggregées dans staging en batches (non
--    atomiques, sans impact sur providers).
-- 3. Un seul appel `rge_apply_staging_atomic()` qui, DANS UNE SEULE
--    TRANSACTION :
--      a. valide le nombre de lignes staging (garde-fou anti-wipe)
--      b. UPDATE providers FROM staging JOIN siret  → écrit qualifs + last_synced_at + contacts ADEME
--      c. NULL-out providers qui ont rge_valid_until IS NOT NULL mais siret pas dans staging
--      d. renvoie les compteurs (matched, updated, contacts_enriched, stale_cleared)
--
-- La migration 406 (`rge_bulk_update_providers`) est conservée le temps du
-- déploiement pour ne pas casser un rollback rapide. Sera supprimée dans une
-- migration ultérieure une fois le staging validé en prod.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Staging table
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.rge_sync_staging (
  siret              TEXT PRIMARY KEY,
  rge_qualifications JSONB NOT NULL,
  rge_valid_until    DATE NOT NULL,
  rge_organismes     TEXT[] NOT NULL,
  rge_source_url     TEXT NOT NULL,
  ademe_telephone    TEXT,
  ademe_email        TEXT,
  inserted_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rge_sync_staging IS
  'Staging table for RGE ADEME sync — populated by client, consumed in one atomic swap by rge_apply_staging_atomic(). Migration 413.';

-- -----------------------------------------------------------------------------
-- 2. Bulk loader — upsert a JSONB array of rows into staging
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rge_stage_rows(payload JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted INTEGER := 0;
BEGIN
  IF payload IS NULL OR jsonb_typeof(payload) <> 'array' THEN
    RETURN 0;
  END IF;

  INSERT INTO public.rge_sync_staging (
    siret, rge_qualifications, rge_valid_until, rge_organismes,
    rge_source_url, ademe_telephone, ademe_email
  )
  SELECT
    s.siret,
    s.rge_qualifications,
    s.rge_valid_until::DATE,
    s.rge_organismes,
    s.rge_source_url,
    s.ademe_telephone,
    s.ademe_email
  FROM jsonb_to_recordset(payload) AS s(
    siret              TEXT,
    rge_qualifications JSONB,
    rge_valid_until    TEXT,
    rge_organismes     TEXT[],
    rge_source_url     TEXT,
    ademe_telephone    TEXT,
    ademe_email        TEXT
  )
  WHERE s.siret IS NOT NULL
  ON CONFLICT (siret) DO UPDATE SET
    rge_qualifications = EXCLUDED.rge_qualifications,
    rge_valid_until    = EXCLUDED.rge_valid_until,
    rge_organismes     = EXCLUDED.rge_organismes,
    rge_source_url     = EXCLUDED.rge_source_url,
    ademe_telephone    = EXCLUDED.ademe_telephone,
    ademe_email        = EXCLUDED.ademe_email,
    inserted_at        = now();

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RETURN v_inserted;
END;
$$;

COMMENT ON FUNCTION public.rge_stage_rows(JSONB) IS
  'Upserts a JSONB array of aggregated ADEME rows into rge_sync_staging. Non-atomic with providers table — safe to call in batches. Migration 413.';

-- -----------------------------------------------------------------------------
-- 3. Truncate helper — reset staging before a new run
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rge_truncate_staging()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  TRUNCATE public.rge_sync_staging;
END;
$$;

COMMENT ON FUNCTION public.rge_truncate_staging() IS
  'Truncates rge_sync_staging. Call at the start of each sync run. Migration 413.';

-- -----------------------------------------------------------------------------
-- 4. Atomic swap — the single transaction that applies staging to providers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rge_apply_staging_atomic(
  p_last_synced_at    TIMESTAMPTZ,
  p_allow_clear_stale BOOLEAN DEFAULT TRUE,
  p_min_staging_rows  INTEGER DEFAULT 10000
)
RETURNS TABLE(
  staging_rows       INTEGER,
  providers_matched  INTEGER,
  providers_updated  INTEGER,
  contacts_enriched  INTEGER,
  stale_cleared      INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staging_count  INTEGER;
  v_matched        INTEGER := 0;
  v_updated        INTEGER := 0;
  v_contacts       INTEGER := 0;
  v_cleared        INTEGER := 0;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_staging_count FROM public.rge_sync_staging;

  -- Garde-fou P0 : refuser le swap si staging est anormalement petit. Reproduit
  -- la logique ADEME_MIN_ROWS_FOR_CLEAR côté DB pour que le garde-fou survive
  -- même en cas d'appel direct (bypass TypeScript).
  IF p_allow_clear_stale AND v_staging_count < p_min_staging_rows THEN
    RAISE EXCEPTION
      'rge_apply_staging_atomic: staging has % rows (< % threshold) — refusing atomic apply to protect existing providers. Call with p_allow_clear_stale=false for partial syncs.',
      v_staging_count, p_min_staging_rows;
  END IF;

  -- Compte les providers qui vont matcher (lecture seule).
  SELECT COUNT(*)::INTEGER INTO v_matched
  FROM public.providers p
  JOIN public.rge_sync_staging s ON s.siret = p.siret;

  -- Compte les providers qui vont RÉELLEMENT recevoir un contact ADEME
  -- (phone/email NULL + non revendiqué + tel/email ADEME présent + pas de
  -- doublon phone). Sémantique identique à l'ancien metric côté TypeScript
  -- (qui comptait les payload rows avec telephone OR email), mais au niveau
  -- DB on peut être précis et ne compter que les écritures effectives.
  SELECT COUNT(*)::INTEGER INTO v_contacts
  FROM public.providers p
  JOIN public.rge_sync_staging s ON s.siret = p.siret
  WHERE p.claimed_at IS NULL
    AND (
      (p.phone IS NULL AND s.ademe_telephone IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM public.providers px
           WHERE px.phone = s.ademe_telephone AND px.id <> p.id
         ))
      OR (p.email IS NULL AND s.ademe_email IS NOT NULL)
    );

  -- ------------------------------------------------------------------------
  -- Swap principal : UPDATE providers FROM staging.
  -- Même logique que rge_bulk_update_providers (migration 406), mais en UNE
  -- seule transaction pour TOUS les providers concernés (pas de batching).
  -- ------------------------------------------------------------------------
  WITH upd AS (
    UPDATE public.providers p
       SET rge_qualifications = s.rge_qualifications,
           rge_valid_until    = s.rge_valid_until,
           rge_organismes     = s.rge_organismes,
           rge_last_synced_at = p_last_synced_at,
           rge_source_url     = s.rge_source_url,
           rge_categories_decret = COALESCE(
             (
               SELECT array_agg(DISTINCT cat ORDER BY cat)
                 FROM (
                   SELECT unnest(
                            derive_rge_categories_from_qualif(
                              qual->>'domaine',
                              qual->>'meta_domaine'
                            )
                          ) AS cat
                     FROM jsonb_array_elements(s.rge_qualifications) AS qual
                    WHERE jsonb_typeof(s.rge_qualifications) = 'array'
                      AND (
                        qual->>'date_fin' IS NULL
                        OR length(qual->>'date_fin') < 10
                        OR substring(qual->>'date_fin', 1, 10) >= to_char(now(), 'YYYY-MM-DD')
                      )
                 ) AS cats
                WHERE cat IS NOT NULL
             ),
             ARRAY[]::INT[]
           ),
           phone = CASE
             WHEN p.phone IS NULL
                  AND p.claimed_at IS NULL
                  AND s.ademe_telephone IS NOT NULL
                  AND NOT EXISTS (
                    SELECT 1 FROM public.providers px
                    WHERE px.phone = s.ademe_telephone AND px.id <> p.id
                  )
             THEN s.ademe_telephone
             ELSE p.phone
           END,
           email = CASE
             WHEN p.email IS NULL AND p.claimed_at IS NULL AND s.ademe_email IS NOT NULL
             THEN s.ademe_email
             ELSE p.email
           END
      FROM public.rge_sync_staging s
     WHERE p.siret = s.siret
    RETURNING 1
  )
  SELECT COUNT(*)::INTEGER INTO v_updated FROM upd;

  -- ------------------------------------------------------------------------
  -- Clear stale : même transaction. Les providers dont le SIRET a disparu
  -- d'ADEME voient leurs colonnes rge_* nullées. Skip si partial sync.
  -- ------------------------------------------------------------------------
  IF p_allow_clear_stale THEN
    WITH cleared AS (
      UPDATE public.providers p
         SET rge_qualifications    = NULL,
             rge_valid_until       = NULL,
             rge_organismes        = NULL,
             rge_source_url        = NULL,
             rge_categories_decret = ARRAY[]::INT[]
       WHERE p.rge_valid_until IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM public.rge_sync_staging s WHERE s.siret = p.siret
         )
      RETURNING 1
    )
    SELECT COUNT(*)::INTEGER INTO v_cleared FROM cleared;
  END IF;

  RETURN QUERY SELECT v_staging_count, v_matched, v_updated, v_contacts, v_cleared;
END;
$$;

COMMENT ON FUNCTION public.rge_apply_staging_atomic(TIMESTAMPTZ, BOOLEAN, INTEGER) IS
  'Applies rge_sync_staging to providers in one atomic transaction : UPDATE matched + clear stale + derive rge_categories_decret. Replaces the batched-per-500 approach of rge_bulk_update_providers. Migration 413.';

-- -----------------------------------------------------------------------------
-- 5. Permissions — service_role only (called from server-side sync worker)
-- -----------------------------------------------------------------------------

REVOKE ALL ON TABLE public.rge_sync_staging FROM PUBLIC;
REVOKE ALL ON TABLE public.rge_sync_staging FROM anon, authenticated;
GRANT ALL ON TABLE public.rge_sync_staging TO service_role;

REVOKE ALL ON FUNCTION public.rge_stage_rows(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rge_stage_rows(JSONB) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rge_stage_rows(JSONB) TO service_role;

REVOKE ALL ON FUNCTION public.rge_truncate_staging() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rge_truncate_staging() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rge_truncate_staging() TO service_role;

REVOKE ALL ON FUNCTION public.rge_apply_staging_atomic(TIMESTAMPTZ, BOOLEAN, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rge_apply_staging_atomic(TIMESTAMPTZ, BOOLEAN, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rge_apply_staging_atomic(TIMESTAMPTZ, BOOLEAN, INTEGER) TO service_role;
