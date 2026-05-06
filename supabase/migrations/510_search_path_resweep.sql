-- 510_search_path_resweep.sql
-- Audit V2 SQL P1 : 22 mig POST-473 ont fait `CREATE OR REPLACE FUNCTION`
-- sans `SET search_path`, perdant le pinning runtime de mig 473. À chaque
-- redéploiement de ces mig, la dette CVE-2018-1058 réapparaît.
-- Solution : re-run le bulk-fix pour rattraper toutes les fonctions créées
-- depuis 473. Idempotent — fonctions déjà pinnées sont skippées.

BEGIN;

DO $mig510$
DECLARE
  fn RECORD;
  altered_count INT := 0;
BEGIN
  FOR fn IN
    SELECT
      p.oid::regprocedure AS sig,
      n.nspname            AS schema_name,
      p.proname            AS fn_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('public', 'app')
      AND p.prokind = 'f'
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(COALESCE(p.proconfig, ARRAY[]::TEXT[])) AS cfg
        WHERE cfg LIKE 'search_path=%'
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_catalog', fn.sig);
      altered_count := altered_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'mig510: skip %.% (%)', fn.schema_name, fn.fn_name, SQLERRM;
    END;
  END LOOP;
  RAISE NOTICE 'mig510: pinned search_path on % functions', altered_count;
END
$mig510$;

COMMIT;
