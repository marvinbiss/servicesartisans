-- 509_rls_explicit_service_role_policies.sql
-- Audit V2 SQL P0 (#7-10) : 10 tables `ENABLE RLS` sans aucune policy.
-- Le bypass `service_role` JWT fonctionne aujourd'hui mais si un linter
-- ajoute `FORCE ROW LEVEL SECURITY` (mig 472 le fait pour 9 tables) → tout
-- code SECURITY DEFINER ou createAdminClient bloqué silencieusement.
-- `cron_leases` est CRITIQUE (idempotence des 45 crons).
-- Standard senior : toujours créer policy explicite même si redondante.

DO $sa$
DECLARE
  tbl text;
  v_tables text[] := ARRAY[
    'newsletter_subscribers',
    'rate_limits',
    'provider_descriptions_draft',
    'provider_insee_enrichment',
    'providers_mar',
    'cee_observability',
    'cron_leases'
  ];
BEGIN
  FOREACH tbl IN ARRAY v_tables LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public' AND c.relname = tbl
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I_service_role_all ON public.%I', tbl, tbl);
      EXECUTE format(
        'CREATE POLICY %I_service_role_all ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        tbl, tbl
      );
    ELSE
      RAISE NOTICE 'table public.% does not exist, skipping policy', tbl;
    END IF;
  END LOOP;
END
$sa$;

COMMENT ON POLICY cron_leases_service_role_all ON public.cron_leases IS
  'Mig 509 — défense en profondeur. cron_leases pilote idempotence 45 crons : si FORCE RLS activée par erreur, cette policy maintient l''accès service_role.';
