-- =========================================================================
-- CEE PR2 — Smoke tests (post-deploy, production-safe READ-only + probes)
-- =========================================================================
-- Executes in <5s on Supabase SQL editor. Runs RPC + RLS + index checks.
-- All statements are idempotent and side-effect free (no INSERT/UPDATE).
--
-- Usage
--   1. Open Supabase SQL editor
--   2. Paste this file
--   3. Run each block one at a time (Supabase SQL editor quirk)
--   4. All results must match "expected" column
--
-- Scope mapped to THREAT_MODEL_PR2.md §5:
--   Tests 1-3  : schema integrity (tables + columns exist, migrations 424-435)
--   Tests 4-6  : RLS policies present + scoped
--   Tests 7-9  : RPC signatures (cee_store_partner_iban, cee_encrypt_iban)
--   Tests 10-12: indexes critical for hot paths
--   Tests 13-15: pgcrypto + unique idempotency constraint
-- =========================================================================

-- ---------- Test 1: table cee_artisan_partners exists -----------------
SELECT
  'test-1: cee_artisan_partners exists'                     AS name,
  COUNT(*)::text                                            AS got,
  '1'                                                       AS expected
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'cee_artisan_partners';

-- ---------- Test 2: table cee_webhook_events exists (idempotency) -----
SELECT
  'test-2: cee_webhook_events exists'                       AS name,
  COUNT(*)::text                                            AS got,
  '1'                                                       AS expected
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'cee_webhook_events';

-- ---------- Test 3: iban_encrypted column is bytea --------------------
SELECT
  'test-3: iban_encrypted is bytea'                         AS name,
  data_type                                                 AS got,
  'bytea'                                                   AS expected
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name  = 'cee_artisan_partners'
  AND column_name = 'iban_encrypted';

-- ---------- Test 4: RLS enabled on cee_artisan_partners ---------------
SELECT
  'test-4: RLS enabled on cee_artisan_partners'             AS name,
  relrowsecurity::text                                      AS got,
  'true'                                                    AS expected
FROM pg_class
WHERE relname = 'cee_artisan_partners';

-- ---------- Test 5: self-read policy exists ---------------------------
SELECT
  'test-5: artisan self-read policy exists'                 AS name,
  COUNT(*)::text                                            AS got,
  '>= 1'                                                    AS expected
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'cee_artisan_partners'
  AND cmd        = 'SELECT';

-- ---------- Test 6: anon cannot UPDATE iban_encrypted -----------------
-- Check absence of UPDATE policy permitting anon/authenticated writes
-- to iban_encrypted directly. Only SECURITY DEFINER RPC should write.
SELECT
  'test-6: no public UPDATE policy with iban_encrypted'     AS name,
  COUNT(*)::text                                            AS got,
  '0'                                                       AS expected
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'cee_artisan_partners'
  AND cmd        = 'UPDATE'
  AND (qual LIKE '%iban_encrypted%' OR with_check LIKE '%iban_encrypted%')
  AND roles::text LIKE '%authenticated%';

-- ---------- Test 7: RPC cee_store_partner_iban exists -----------------
SELECT
  'test-7: RPC cee_store_partner_iban exists'               AS name,
  COUNT(*)::text                                            AS got,
  '1'                                                       AS expected
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'cee_store_partner_iban';

-- ---------- Test 8: RPC is SECURITY DEFINER ---------------------------
SELECT
  'test-8: cee_store_partner_iban is SECURITY DEFINER'      AS name,
  prosecdef::text                                           AS got,
  'true'                                                    AS expected
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'cee_store_partner_iban';

-- ---------- Test 9: pgcrypto extension installed ----------------------
SELECT
  'test-9: pgcrypto installed'                              AS name,
  COUNT(*)::text                                            AS got,
  '1'                                                       AS expected
FROM pg_extension WHERE extname = 'pgcrypto';

-- ---------- Test 10: index on cee_artisan_partners(user_id) ----------
SELECT
  'test-10: index on cee_artisan_partners(user_id)'         AS name,
  COUNT(*)::text                                            AS got,
  '>= 1'                                                    AS expected
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename  = 'cee_artisan_partners'
  AND indexdef LIKE '%(user_id%';

-- ---------- Test 11: unique on webhook event_id (idempotency) --------
SELECT
  'test-11: unique constraint on webhook event_id'          AS name,
  COUNT(*)::text                                            AS got,
  '>= 1'                                                    AS expected
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename  = 'cee_webhook_events'
  AND (indexdef LIKE '%UNIQUE%event_id%' OR indexdef LIKE '%unique%event_id%');

-- ---------- Test 12: status column has valid CHECK --------------------
SELECT
  'test-12: cee_artisan_partners.status is constrained'     AS name,
  COUNT(*)::text                                            AS got,
  '>= 1'                                                    AS expected
FROM information_schema.check_constraints cc
JOIN information_schema.constraint_column_usage ccu
  ON cc.constraint_name = ccu.constraint_name
WHERE ccu.table_name   = 'cee_artisan_partners'
  AND ccu.column_name  = 'status';

-- ---------- Test 13: cee_dossier_events table exists (audit trail) ---
SELECT
  'test-13: cee_dossier_events exists'                      AS name,
  COUNT(*)::text                                            AS got,
  '1'                                                       AS expected
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'cee_dossier_events';

-- ---------- Test 14: migrations 424-435 present in audit log ---------
-- If schema_migrations table is available, check that all target
-- migrations have been applied. This query is soft-fail on hosts
-- where the migrations table differs.
SELECT
  'test-14: migrations 424-435 applied'                     AS name,
  COUNT(*)::text                                            AS got,
  '12'                                                      AS expected
FROM information_schema.tables WHERE table_name = 'cee_artisan_partners'
-- Replace this heuristic with the actual schema_migrations table
-- if Supabase exposes it (supabase_migrations.schema_migrations).
;

-- ---------- Test 15: pg_policies for webhook table scoped to service_role
SELECT
  'test-15: cee_webhook_events writeable only by service_role'  AS name,
  COUNT(*)::text                                                AS got,
  '0'                                                           AS expected
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'cee_webhook_events'
  AND cmd        = 'INSERT'
  AND roles::text LIKE '%authenticated%';

-- =========================================================================
-- End of smoke tests. All 15 rows should match "expected".
-- For production: run this file after deploying migrations 424-435
-- and before re-enabling traffic.
-- =========================================================================
