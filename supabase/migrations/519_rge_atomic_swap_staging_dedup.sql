-- =============================================================================
-- 519_rge_atomic_swap_staging_dedup.sql
-- =============================================================================
-- Patch `rge_apply_staging_atomic` (mig 413) :
--   1. Dedupe `ademe_telephone` AU SEIN du staging avant le SET p.phone.
--      Sinon, plusieurs SIRET partageant le même tel HQ (entreprises multi-
--      établissements) tentent d'écrire le même phone sur des providers
--      différents dans la même UPDATE → violation `idx_providers_phone_unique`
--      → swap rollback. Observé prod 2026-05-10 : Key (phone)=(0235835998)
--      already exists.
--   2. SET statement_timeout = '5min' au niveau fonction. La sync complète
--      (60K UPDATE + derive_categories per-row + clear_stale) dépasse le
--      timeout default 60s sur Supabase. Le timeout doit survivre aux
--      `CREATE OR REPLACE FUNCTION` futurs (donc déclaré ici via SET).
--
-- Stratégie dedupe : on remplace le `s.ademe_telephone` brut par un
-- sous-CTE qui calcule `dedup_phone` = ademe_telephone UNIQUEMENT pour le
-- SIRET min de chaque cluster phone (ROW_NUMBER OVER PARTITION).
--
-- Idempotent : CREATE OR REPLACE.
-- =============================================================================

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
SET search_path = public, pg_catalog
SET statement_timeout = '5min'
AS $$
DECLARE
  v_staging_count  INTEGER;
  v_matched        INTEGER := 0;
  v_updated        INTEGER := 0;
  v_contacts       INTEGER := 0;
  v_cleared        INTEGER := 0;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_staging_count FROM public.rge_sync_staging;

  -- Garde-fou P0 : refuser le swap si staging est anormalement petit.
  IF p_allow_clear_stale AND v_staging_count < p_min_staging_rows THEN
    RAISE EXCEPTION
      'rge_apply_staging_atomic: staging has % rows (< % threshold) — refusing atomic apply to protect existing providers. Call with p_allow_clear_stale=false for partial syncs.',
      v_staging_count, p_min_staging_rows;
  END IF;

  -- Pré-calcul de la table de dedupe phones intra-staging.
  -- On garde le tel sur le siret MIN par cluster phone, NULL ailleurs.
  -- ON COMMIT DROP pour ne pas polluer entre invocations.
  CREATE TEMP TABLE rge_staging_phone_dedup ON COMMIT DROP AS
    WITH ranked AS (
      SELECT siret,
             ademe_telephone,
             ROW_NUMBER() OVER (PARTITION BY ademe_telephone ORDER BY siret) AS rn
        FROM public.rge_sync_staging
       WHERE ademe_telephone IS NOT NULL
    )
    SELECT siret,
           CASE WHEN rn = 1 THEN ademe_telephone ELSE NULL END AS dedup_phone
      FROM ranked;
  CREATE INDEX ON rge_staging_phone_dedup (siret);

  -- Compte les providers qui vont matcher (lecture seule).
  SELECT COUNT(*)::INTEGER INTO v_matched
  FROM public.providers p
  JOIN public.rge_sync_staging s ON s.siret = p.siret;

  -- Compte les providers qui vont RÉELLEMENT recevoir un contact ADEME.
  -- Utilise dedup_phone (pas s.ademe_telephone) côté tel pour matcher la
  -- réalité du swap. Le filtre `dedup_phone IS NOT NULL` exclut les rows où
  -- staging a dupé le tel mais ce n'est pas le siret canonical.
  SELECT COUNT(*)::INTEGER INTO v_contacts
  FROM public.providers p
  JOIN public.rge_sync_staging s ON s.siret = p.siret
  LEFT JOIN rge_staging_phone_dedup d ON d.siret = s.siret
  WHERE p.claimed_at IS NULL
    AND (
      (p.phone IS NULL AND d.dedup_phone IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM public.providers px
           WHERE px.phone = d.dedup_phone AND px.id <> p.id
         ))
      OR (p.email IS NULL AND s.ademe_email IS NOT NULL)
    );

  -- ------------------------------------------------------------------------
  -- Swap principal : UPDATE providers FROM staging.
  -- Le `dedup_phone` issu de `rge_staging_phone_dedup` garantit qu'un même
  -- tel ne sera assigné qu'à un seul provider dans cette UPDATE.
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
                  AND d.dedup_phone IS NOT NULL
                  AND NOT EXISTS (
                    SELECT 1 FROM public.providers px
                    WHERE px.phone = d.dedup_phone AND px.id <> p.id
                  )
             THEN d.dedup_phone
             ELSE p.phone
           END,
           email = CASE
             WHEN p.email IS NULL AND p.claimed_at IS NULL AND s.ademe_email IS NOT NULL
             THEN s.ademe_email
             ELSE p.email
           END
      FROM public.rge_sync_staging s
      LEFT JOIN rge_staging_phone_dedup d ON d.siret = s.siret
     WHERE p.siret = s.siret
    RETURNING 1
  )
  SELECT COUNT(*)::INTEGER INTO v_updated FROM upd;

  -- Clear stale : même transaction.
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
  'Applies rge_sync_staging to providers in one atomic transaction. Mig 519 patch (2026-05-10) : dedupe ademe_telephone intra-staging (PARTITION BY phone, keep MIN siret) — fixes Sunday cron crash on idx_providers_phone_unique when SIRENE shares HQ phone across multi-établissements. Function-level statement_timeout=5min for 60K UPDATE.';

GRANT EXECUTE ON FUNCTION public.rge_apply_staging_atomic(TIMESTAMPTZ, BOOLEAN, INTEGER)
  TO service_role;
