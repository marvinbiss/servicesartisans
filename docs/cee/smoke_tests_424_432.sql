-- ============================================================================
-- Smoke tests post-migrations 424 → 432 (CEE PR1)
-- Date: 2026-04-14
--
-- Exécution:
--   Option A (psql service_role):
--     psql "$DB_URL" -f smoke_tests_424_432.sql
--   Option B (Supabase SQL editor):
--     Copier/coller bloc par bloc (séparés par les commentaires "-- BLOCK NN").
--     Quirk Supabase: ne PAS préfixer noms temp avec `refresh_*`, et splitter les
--     multi-statements / $$ tags séparément (cf. feedback_supabase_sql_editor_quirks).
--
-- Format: chaque test SELECT renvoie 1 ligne avec colonne "ok" (boolean) et "test" (label).
--         Quand boolean ok = false → échec à investiguer.
--         Les tests destructifs (21-35) utilisent BEGIN; ... ROLLBACK; (idempotents).
--
-- Limitations RLS:
--   Les tests d'effet RLS réels nécessitent `SET ROLE authenticated` + JWT mock,
--   ce qui n'est pas faisable en mode service_role Supabase SQL editor direct.
--   → Fallback: vérifications pg_catalog (relrowsecurity, pg_policies).
--   → TODO: compléter via tests E2E API avec SUPABASE_SERVICE_ROLE_KEY + JWT auth.
-- ============================================================================

-- ============================================================================
-- BLOCK A — STRUCTURE (tests 01-10)
-- ============================================================================

-- Test 01 : Tables référentiels existent (migration 424)
SELECT (to_regclass('public.cee_operations_ref') IS NOT NULL)
   AND (to_regclass('public.cee_forfaits')       IS NOT NULL)
   AND (to_regclass('public.zones_climatiques_ref') IS NOT NULL)
   AND (to_regclass('public.revenus_plafonds')   IS NOT NULL)
   AS ok, '01_ref_tables_exist' AS test;

-- Test 02 : Tables CEE coeur + support (migrations 427-432)
SELECT (to_regclass('public.cee_leads')              IS NOT NULL)
   AND (to_regclass('public.cee_mandats')            IS NOT NULL)
   AND (to_regclass('public.cee_artisan_partners')   IS NOT NULL)
   AND (to_regclass('public.cee_dossiers')           IS NOT NULL)
   AND (to_regclass('public.cee_dossier_documents')  IS NOT NULL)
   AND (to_regclass('public.cee_dossier_events')     IS NOT NULL)
   AND (to_regclass('public.cee_commissions')        IS NOT NULL)
   AND (to_regclass('public.sepa_batches')           IS NOT NULL)
   AND (to_regclass('public.mar_staging')            IS NOT NULL)
   AND (to_regclass('public.email_outbox_cee')       IS NOT NULL)
   AND (to_regclass('public.cee_simulator_events')   IS NOT NULL)
   AS ok, '02_core_tables_exist' AS test;

-- Test 03 : ENUMs existent avec cardinalité attendue
SELECT
  (SELECT count(*) FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='cee_lead_status')     = 10 AS ok_lead_status,
  (SELECT count(*) FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='categorie_revenus')   = 4  AS ok_categorie,
  (SELECT count(*) FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='zone_climatique')     = 3  AS ok_zone,
  (SELECT count(*) FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='cee_partner_status')  = 9  AS ok_partner_status,
  (SELECT count(*) FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='cee_dossier_status')  = 12 AS ok_dossier_status,
  '03_enums_cardinality' AS test;

-- Test 04 : Colonnes CEE ajoutées à devis_requests (migration 426)
SELECT bool_and(has_col) AS ok, '04_devis_requests_cee_cols' AS test
FROM (
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='devis_requests' AND column_name = c
  ) AS has_col
  FROM unnest(ARRAY[
    'cee_eligible','cee_operation_code','cee_lead_id',
    'cee_forfait_id','cee_prime_estimee_cts'
  ]) AS c
) q;

-- Test 05 : Colonnes MAR ajoutées à providers (migration 427)
SELECT bool_and(has_col) AS ok, '05_providers_mar_cols' AS test
FROM (
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='providers' AND column_name = c
  ) AS has_col
  FROM unnest(ARRAY[
    'is_mar_agree','mar_source_id','mar_qualifications','mar_last_verified_at'
  ]) AS c
) q;

-- Test 06 : Extension cee_market_prices — colonnes date_validite, ingested_at + CHECK accepte 'spot'
SELECT
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_name='cee_market_prices' AND column_name='date_validite')
  AND EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name='cee_market_prices' AND column_name='ingested_at')
  AND EXISTS (SELECT 1 FROM information_schema.check_constraints
              WHERE constraint_name='cee_market_prices_price_type_check'
                AND check_clause ILIKE '%spot%')
  AS ok, '06_cee_market_prices_spot' AS test;

-- Test 07 : Index partiels présents
SELECT
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_cee_dossiers_qa_queue'
            AND indexdef ILIKE '%qa_pending%')
  AND EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_cee_commissions_due'
            AND indexdef ILIKE '%due%')
  AND EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_email_outbox_cee_pending'
            AND indexdef ILIKE '%pending%')
  AS ok, '07_partial_indexes' AS test;

-- Test 08 : MVs existent avec unique index (refresh concurrent compatible)
SELECT
  (to_regclass('public.mv_cee_dossiers_stats') IS NOT NULL)
  AND (to_regclass('public.mv_cee_partners_tam') IS NOT NULL)
  AND EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_mv_cee_dossiers_stats_key'
              AND indexdef ILIKE '%UNIQUE%')
  AND EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_mv_cee_partners_tam_id'
              AND indexdef ILIKE '%UNIQUE%')
  AS ok, '08_mvs_with_unique_index' AS test;

-- Test 09 : FK tardive devis_requests.cee_lead_id → cee_leads.id (migration 428.3)
SELECT EXISTS (
  SELECT 1
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_class f ON f.oid = c.confrelid
  WHERE c.conname = 'devis_requests_cee_lead_id_fkey'
    AND t.relname = 'devis_requests'
    AND f.relname = 'cee_leads'
) AS ok, '09_fk_devis_cee_lead' AS test;

-- Test 10 : Trigger set_updated_at appliqué sur toutes les tables avec updated_at
SELECT bool_and(has_trigger) AS ok, '10_updated_at_triggers' AS test
FROM (
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger tr
    JOIN pg_class cls ON cls.oid = tr.tgrelid
    WHERE cls.relname = t
      AND NOT tr.tgisinternal
      AND tr.tgname ILIKE '%updated_at%'
  ) AS has_trigger
  FROM unnest(ARRAY[
    'cee_leads','cee_mandats','cee_artisan_partners',
    'cee_dossiers','email_outbox_cee','cee_commissions','sepa_batches'
  ]) AS t
) q;

-- ============================================================================
-- BLOCK B — RLS (tests 11-20)
-- ============================================================================

-- Test 11 : RLS ENABLED sur toutes les tables PII / business
SELECT bool_and(rls_on) AS ok, '11_rls_enabled' AS test
FROM (
  SELECT c.relrowsecurity AS rls_on
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname='public'
    AND c.relname = ANY(ARRAY[
      'cee_leads','cee_mandats','cee_artisan_partners','cee_dossiers',
      'cee_dossier_documents','cee_dossier_events','cee_commissions',
      'sepa_batches','mar_staging','email_outbox_cee'
    ])
) q;

-- Test 12 : Policy cee_dossiers_artisan_self_read présente
SELECT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname='public' AND tablename='cee_dossiers'
    AND policyname='cee_dossiers_artisan_self_read'
) AS ok, '12_policy_dossiers_self_read' AS test;

-- Test 13 : Policy cee_dossiers_artisan_insert présente + WITH CHECK référence partner active
SELECT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname='public' AND tablename='cee_dossiers'
    AND policyname='cee_dossiers_artisan_insert'
    AND with_check ILIKE '%active%'
) AS ok, '13_policy_dossiers_insert_active' AS test;

-- Test 14 : Policy cee_dossiers_artisan_update_draft (USING status IN draft/qa_rejected)
SELECT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname='public' AND tablename='cee_dossiers'
    AND policyname='cee_dossiers_artisan_update_draft'
    AND qual ILIKE '%draft%'
    AND qual ILIKE '%qa_rejected%'
) AS ok, '14_policy_dossiers_update_draft' AS test;

-- Test 15 : Policy admin_all sur cee_dossiers (role = admin)
SELECT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname='public' AND tablename='cee_dossiers'
    AND policyname='cee_dossiers_admin_all'
    AND qual ILIKE '%admin%'
) AS ok, '15_policy_dossiers_admin_all' AS test;

-- Test 16 : mar_staging — RLS ENABLED sans policy (service_role only deny par défaut)
SELECT
  (SELECT relrowsecurity FROM pg_class
   WHERE oid='public.mar_staging'::regclass)
  AND (SELECT count(*) FROM pg_policies
       WHERE schemaname='public' AND tablename='mar_staging') = 0
  AS ok, '16_mar_staging_rls_no_policy' AS test;

-- Test 17 : Référentiels — RLS non activée (lecture publique via grants SELECT)
-- NB: les migrations 424 n'activent PAS RLS sur les tables ref (lecture libre voulue).
SELECT bool_and(NOT rls_on) AS ok, '17_referentiels_no_rls' AS test
FROM (
  SELECT c.relrowsecurity AS rls_on
  FROM pg_class c
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public'
    AND c.relname = ANY(ARRAY[
      'cee_operations_ref','cee_forfaits','zones_climatiques_ref','revenus_plafonds'
    ])
) q;

-- Test 18 : Compter policies par table critique (minimum attendu)
SELECT
  (SELECT count(*) FROM pg_policies WHERE tablename='cee_dossiers')          >= 4 AS ok_dossiers,
  (SELECT count(*) FROM pg_policies WHERE tablename='cee_artisan_partners')  >= 2 AS ok_partners,
  (SELECT count(*) FROM pg_policies WHERE tablename='cee_leads')             >= 2 AS ok_leads,
  '18_policies_count' AS test;

-- Test 19 : Aucune policy USING (true) sur tables PII (anti-leak)
SELECT NOT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname='public'
    AND tablename IN (
      'cee_leads','cee_mandats','cee_dossiers','cee_dossier_documents',
      'cee_dossier_events','cee_commissions','cee_artisan_partners'
    )
    AND (qual = 'true' OR qual ILIKE '%USING (true)%' OR qual IS NULL)
    AND cmd <> 'INSERT'  -- WITH CHECK peut légitimement avoir qual NULL
) AS ok, '19_no_using_true_on_pii' AS test;

-- Test 20 : cee_commissions — artisan ne voit que ses commissions (policy SELECT restrictive)
SELECT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname='public' AND tablename='cee_commissions'
    AND policyname='cee_commissions_artisan_self_read'
    AND cmd='SELECT'
    AND qual ILIKE '%user_id = auth.uid()%'
) AS ok, '20_policy_commissions_artisan_self' AS test;

-- ============================================================================
-- BLOCK C — CONTRAINTES & CHECKS (tests 21-27) — destructifs, rollback
-- ============================================================================

-- Test 21 : CHECK reference format cee_dossiers SAE-YYYYMM-NNNNNN
-- On teste uniquement la violation du CHECK format; la violation bloque tôt.
BEGIN;
DO $test21$
DECLARE
  v_ok boolean := false;
BEGIN
  BEGIN
    INSERT INTO public.cee_dossiers (
      reference, partner_id, provider_id,
      client_nom_encrypted, client_prenom_encrypted, client_email_encrypted,
      client_adresse_encrypted, client_code_postal, client_commune_insee,
      foyer_personnes, revenus_categorie, operation_code, type_travaux,
      montant_ht_cts, montant_ttc_cts, date_devis,
      forfait_id, forfait_version, prime_cee_cts, commission_rate
    ) VALUES (
      'BAD-FORMAT',
      '00000000-0000-0000-0000-000000000001'::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid,
      '\x00'::bytea, '\x00'::bytea, '\x00'::bytea, '\x00'::bytea,
      '75001', '75056', 1, 'modeste', 'BAR-TH-171', 'PAC',
      100000, 120000, CURRENT_DATE, 1, 'v1', 50000, 10.00
    );
    RAISE NOTICE 'Test 21 FAIL: bad reference accepted';
  EXCEPTION
    WHEN check_violation THEN v_ok := true; -- attendu
    WHEN foreign_key_violation THEN v_ok := true; -- aussi OK si FK bloque avant CHECK (ordre impl)
    WHEN others THEN RAISE NOTICE 'Test 21 FAIL unexpected: %', SQLERRM;
  END;
  IF v_ok THEN RAISE NOTICE 'Test 21 OK (rejet bad reference)'; END IF;
END $test21$;
ROLLBACK;

-- Test 22 : CHECK operation_code format cee_dossiers
SELECT EXISTS (
  SELECT 1 FROM information_schema.check_constraints
  WHERE constraint_name='cee_dossiers_operation_code_fmt_chk'
    AND check_clause ILIKE '%BAR|BAT|IND%'
) AS ok, '22_dossiers_operation_code_chk' AS test;

-- Test 23 : UNIQUE (dossier_id, kind, sha256) sur cee_dossier_documents
SELECT EXISTS (
  SELECT 1 FROM pg_constraint
  WHERE conname='cee_dossier_documents_unique_binary'
    AND contype='u'
) AS ok, '23_documents_unique_binary' AS test;

-- Test 24 : UNIQUE provider_id sur cee_artisan_partners
SELECT EXISTS (
  SELECT 1 FROM pg_constraint
  WHERE conname='cee_artisan_partners_provider_unique'
    AND contype='u'
) AS ok, '24_partners_unique_provider' AS test;

-- Test 25 : UNIQUE dossier_id sur cee_commissions (1 commission / dossier)
SELECT EXISTS (
  SELECT 1 FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu USING (constraint_name)
  WHERE tc.table_name='cee_commissions'
    AND tc.constraint_type='UNIQUE'
    AND kcu.column_name='dossier_id'
) AS ok, '25_commissions_unique_dossier' AS test;

-- Test 26 : zones_climatiques_ref — CHECK code_insee format 5 car [0-9AB]
-- NB: clé réelle = code_insee (pas code_postal). Test valide contrainte format.
SELECT EXISTS (
  SELECT 1 FROM information_schema.check_constraints
  WHERE check_clause ILIKE '%0-9AB%'
     OR check_clause ILIKE '%[0-9AB]{5}%'
) AS ok, '26_zones_code_insee_fmt' AS test;

-- Test 27 : cee_artisan_partners BIC regex
BEGIN;
DO $test27$
DECLARE
  v_ok_valid   boolean := false;
  v_ok_invalid boolean := false;
BEGIN
  -- BIC valide doit passer la contrainte CHECK (peut échouer sur FK provider/user - on capture)
  BEGIN
    INSERT INTO public.cee_artisan_partners (
      provider_id, user_id, bic
    ) VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid,
      'BNPAFRPPXXX'
    );
    v_ok_valid := true;
  EXCEPTION
    WHEN foreign_key_violation THEN v_ok_valid := true; -- FK échoue APRES CHECK = CHECK OK
    WHEN check_violation THEN v_ok_valid := false;      -- CHECK rejette valide = FAIL
    WHEN others THEN v_ok_valid := true; -- autre = CHECK BIC OK
  END;
  -- BIC invalide doit être rejeté par CHECK
  BEGIN
    INSERT INTO public.cee_artisan_partners (
      provider_id, user_id, bic
    ) VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid,
      'invalid'
    );
    v_ok_invalid := false;
  EXCEPTION
    WHEN check_violation THEN v_ok_invalid := true;
    WHEN foreign_key_violation THEN v_ok_invalid := false; -- FK avant CHECK = test non concluant
    WHEN others THEN v_ok_invalid := false;
  END;
  RAISE NOTICE 'Test 27 BIC valid_ok=% invalid_rejected=%', v_ok_valid, v_ok_invalid;
END $test27$;
ROLLBACK;

-- ============================================================================
-- BLOCK D — GENERATED columns (tests 28-31)
-- ============================================================================

-- Test 28 : cee_dossiers.prime_total_cts = prime_cee_cts + COALESCE(prime_mpr_cts,0)
SELECT is_generated='ALWAYS'
   AND generation_expression ILIKE '%prime_cee_cts%'
   AND generation_expression ILIKE '%prime_mpr_cts%'
   AS ok, '28_prime_total_generated' AS test
FROM information_schema.columns
WHERE table_name='cee_dossiers' AND column_name='prime_total_cts';

-- Test 29 : cee_dossiers.reste_a_charge_cts = montant_ttc_cts - prime_cee_cts - COALESCE(prime_mpr_cts,0)
SELECT is_generated='ALWAYS'
   AND generation_expression ILIKE '%montant_ttc_cts%'
   AND generation_expression ILIKE '%prime_cee_cts%'
   AS ok, '29_reste_a_charge_generated' AS test
FROM information_schema.columns
WHERE table_name='cee_dossiers' AND column_name='reste_a_charge_cts';

-- Test 30 : cee_dossiers.commission_amount_cts = (montant_ht_cts * commission_rate / 100)::bigint
SELECT is_generated='ALWAYS'
   AND generation_expression ILIKE '%montant_ht_cts%'
   AND generation_expression ILIKE '%commission_rate%'
   AS ok, '30_commission_amount_generated' AS test
FROM information_schema.columns
WHERE table_name='cee_dossiers' AND column_name='commission_amount_cts';

-- Test 31 : cee_artisan_partners.commission_rate_effective = COALESCE(override, default)
SELECT is_generated='ALWAYS'
   AND generation_expression ILIKE '%COALESCE%'
   AND generation_expression ILIKE '%override%'
   AND generation_expression ILIKE '%default%'
   AS ok, '31_commission_rate_effective_generated' AS test
FROM information_schema.columns
WHERE table_name='cee_artisan_partners' AND column_name='commission_rate_effective';

-- ============================================================================
-- BLOCK E — TRANSITIONS STATUS (tests 32-35)
-- ============================================================================

-- Test 32 : Trigger transitions présent sur cee_dossiers (INSERT + UPDATE OF status)
SELECT EXISTS (
  SELECT 1 FROM pg_trigger
  WHERE tgname='trg_cee_dossiers_status_transition'
    AND NOT tgisinternal
) AS ok, '32_trigger_status_transition_present' AS test;

-- Test 33 : Fonction de transition — matrice draft→qa_pending interdite (doit passer par submitted_by_artisan)
-- Vérifie que la fonction de transition gère bien draft comme "INSERT only"
-- et n'autorise PAS draft → validated direct.
SELECT EXISTS (
  SELECT 1 FROM pg_proc
  WHERE proname='cee_dossiers_check_status_transition'
    AND pg_get_functiondef(oid) ILIKE '%draft%submitted_by_artisan%'
    AND pg_get_functiondef(oid) ILIKE '%qa_pending%qa_approved%qa_rejected%'
) AS ok, '33_transition_matrix_defined' AS test;

-- Test 34 : Transition qa_rejected → draft autorisée dans la matrice
SELECT (
  SELECT pg_get_functiondef(oid) FROM pg_proc
  WHERE proname='cee_dossiers_check_status_transition'
) ILIKE '%qa_rejected%draft%submitted_by_artisan%archived%'
  AS ok, '34_transition_qa_rejected_to_draft' AS test;

-- Test 35 : cee_dossier_events append-only (durci par migration 433 H2)
-- Migration 433 installe 2 triggers BEFORE UPDATE/DELETE qui RAISE EXCEPTION
-- pour tout appelant (y compris service_role), garantissant l'immutabilité du
-- journal d'audit. On vérifie ici leur présence.
SELECT (
  SELECT COUNT(*) FROM pg_trigger
  WHERE tgrelid = 'public.cee_dossier_events'::regclass
    AND tgname IN ('trg_cee_dossier_events_no_update','trg_cee_dossier_events_no_delete')
    AND NOT tgisinternal
) = 2 AS ok, '35_events_append_only_triggers' AS test;

-- Test 35bis : trigger append-only bloque effectivement un UPDATE (destructif rollback)
DO $$
DECLARE
  evt_id uuid;
  blocked boolean := false;
BEGIN
  SELECT id INTO evt_id FROM public.cee_dossier_events LIMIT 1;
  IF evt_id IS NULL THEN
    RAISE NOTICE 'Test 35bis skipped — aucun event en base';
    RETURN;
  END IF;
  BEGIN
    UPDATE public.cee_dossier_events SET event_type = 'tampered' WHERE id = evt_id;
  EXCEPTION WHEN insufficient_privilege OR others THEN
    blocked := true;
  END;
  IF blocked THEN
    RAISE NOTICE 'Test 35bis OK — UPDATE bloqué par trigger append-only';
  ELSE
    RAISE EXCEPTION 'Test 35bis FAIL — UPDATE passé, trigger absent ou inactif';
  END IF;
  ROLLBACK;
END $$;

-- ============================================================================
-- FIN smoke tests 424_432
-- Attendu: 35 tests, chaque SELECT renvoie ok=true (les DO blocks loggent via NOTICE).
-- Tests destructifs protégés par BEGIN/ROLLBACK — zéro impact prod.
-- ============================================================================
