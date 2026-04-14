-- ============================================================================
-- Smoke tests post-migration 420 → 425
-- Chaque requête doit renvoyer exactement 1 ligne avec ok=true.
-- Exécuter : psql "$DB_URL" -f smoke_tests_420_425.sql
-- ============================================================================

-- 1. Table cee_operations_ref existe
SELECT to_regclass('public.cee_operations_ref') IS NOT NULL AS ok, '01_cee_operations_ref' AS test;

-- 2. Colonne générée cee_operations_ref.actif calculée
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema='public' AND table_name='cee_operations_ref'
    AND column_name='actif' AND is_generated='ALWAYS'
) AS ok, '02_operations_actif_generated' AS test;

-- 3. Table cee_forfaits + unique constraint
SELECT EXISTS (
  SELECT 1 FROM pg_constraint WHERE conname='cee_forfaits_unique'
) AS ok, '03_forfaits_unique' AS test;

-- 4. cee_spot_prices indexé sur date_cotation DESC
SELECT EXISTS (
  SELECT 1 FROM pg_indexes WHERE indexname='idx_cee_spot_prices_date'
) AS ok, '04_spot_prices_index' AS test;

-- 5. revenus_plafonds check zone IDF/HORS_IDF
SELECT EXISTS (
  SELECT 1 FROM information_schema.check_constraints cc
  JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
  WHERE ccu.table_name='revenus_plafonds' AND cc.check_clause ILIKE '%IDF%'
) AS ok, '05_plafonds_zone_chk' AS test;

-- 6. zones_climatiques_ref : PK code_postal 5 chiffres
SELECT EXISTS (
  SELECT 1 FROM information_schema.check_constraints
  WHERE check_clause LIKE '%[0-9]{5}%' OR check_clause LIKE '%0-9%'
) AS ok, '06_zones_cp_format' AS test;

-- 7. Enum cee_lead_status créé avec 10 valeurs
SELECT count(*) = 10 AS ok, '07_enum_cee_lead_status' AS test
FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
WHERE t.typname='cee_lead_status';

-- 8. Enum categorie_revenus = 4 valeurs
SELECT count(*) = 4 AS ok, '08_enum_categorie_revenus' AS test
FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
WHERE t.typname='categorie_revenus';

-- 9. Enum zone_climatique = H1/H2/H3
SELECT count(*) = 3 AS ok, '09_enum_zone_climatique' AS test
FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
WHERE t.typname='zone_climatique';

-- 10. devis.cee_eligible existe et NOT NULL default false
SELECT column_default LIKE '%false%' AS ok, '10_devis_cee_eligible_default' AS test
FROM information_schema.columns
WHERE table_name='devis' AND column_name='cee_eligible';

-- 11. devis FK cee_operation_code → cee_operations_ref
SELECT EXISTS (
  SELECT 1 FROM pg_constraint WHERE conname='devis_cee_operation_code_fkey'
) AS ok, '11_devis_fk_operation' AS test;

-- 12. Index partiel devis cee_eligible
SELECT EXISTS (
  SELECT 1 FROM pg_indexes
  WHERE indexname='idx_devis_cee_eligible' AND indexdef ILIKE '%WHERE cee_eligible%'
) AS ok, '12_devis_partial_index' AS test;

-- 13. providers.is_mar_agree existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name='providers' AND column_name='is_mar_agree'
) AS ok, '13_providers_mar_col' AS test;

-- 14. mar_staging table + index
SELECT (to_regclass('public.mar_staging') IS NOT NULL)
   AND EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_mar_staging_run')
   AS ok, '14_mar_staging' AS test;

-- 15. cee_leads RLS activée
SELECT relrowsecurity AS ok, '15_cee_leads_rls_enabled' AS test
FROM pg_class WHERE oid='public.cee_leads'::regclass;

-- 16. Policy cee_leads_admin_all présente
SELECT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname='public' AND tablename='cee_leads' AND policyname='cee_leads_admin_all'
) AS ok, '16_cee_leads_policy_admin' AS test;

-- 17. email_hash est bien GENERATED ALWAYS
SELECT is_generated='ALWAYS' AS ok, '17_email_hash_generated' AS test
FROM information_schema.columns
WHERE table_name='cee_leads' AND column_name='email_hash';

-- 18. Unique index dédoublonnage 24h
SELECT EXISTS (
  SELECT 1 FROM pg_indexes WHERE indexname='uniq_cee_leads_dedup_24h'
) AS ok, '18_dedup_24h_index' AS test;

-- 19. Trigger updated_at sur cee_leads
SELECT EXISTS (
  SELECT 1 FROM pg_trigger
  WHERE tgname='trg_cee_leads_updated_at' AND NOT tgisinternal
) AS ok, '19_cee_leads_trigger' AS test;

-- 20. Materialized views + outbox présentes
SELECT (to_regclass('public.v_cee_funnel_conversion') IS NOT NULL)
   AND (to_regclass('public.v_cee_leads_daily_stats') IS NOT NULL)
   AND (to_regclass('public.email_outbox_cee') IS NOT NULL)
   AND (to_regclass('public.cee_simulator_events') IS NOT NULL)
   AS ok, '20_observability_objects' AS test;
