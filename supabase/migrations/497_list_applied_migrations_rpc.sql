-- =============================================================================
-- Migration 497 — list_applied_migrations() RPC pour audit drift CI/CD
-- =============================================================================
-- Audit Sentry 2026-05-02 — pivot stratégique 90+/100 monitoring & sécurité.
--
-- Contexte :
--   `scripts/audit-migrations-applied.mjs` (livré dans le même commit) a besoin
--   de lire `supabase_migrations.schema_migrations` depuis le code applicatif
--   pour détecter les drifts "migration repo non appliquée en prod" (cas mig
--   475/477/483/486 qui ont causé 4 incidents en 1 mois).
--
--   PostgREST par défaut n'expose que les schemas `public` + `graphql_public`.
--   Plutôt que de modifier la config Supabase Dashboard (action externe non
--   tracée dans Git), on expose une RPC publique qui retourne juste les
--   metadata utiles (version + name) sans le SQL des migrations (qui pourrait
--   leaker des hints d'attaque).
--
-- Sécurité :
--   - SECURITY DEFINER : nécessaire pour SELECT cross-schema sur
--     `supabase_migrations.schema_migrations`.
--   - search_path pinné (CVE-2018-1058 — règle CLAUDE.md).
--   - GRANT EXECUTE uniquement à `service_role` : le hook pre-push tourne avec
--     SUPABASE_SERVICE_ROLE_KEY (jamais commit, .env.local gitignored).
--   - Retourne version + name SEULEMENT — pas les `statements[]` qui sont du
--     SQL potentiellement sensible.
--
-- Idempotent : CREATE OR REPLACE FUNCTION + DROP FUNCTION IF EXISTS au cas où
-- une version antérieure aurait un schéma RETURNS TABLE différent.
-- =============================================================================

DROP FUNCTION IF EXISTS public.list_applied_migrations();

CREATE OR REPLACE FUNCTION public.list_applied_migrations()
RETURNS TABLE (
  version TEXT,
  name    TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, supabase_migrations, pg_catalog
AS $function$
  SELECT
    sm.version::text AS version,
    sm.name::text    AS name
  FROM supabase_migrations.schema_migrations sm
  ORDER BY sm.version ASC;
$function$;

REVOKE ALL ON FUNCTION public.list_applied_migrations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_applied_migrations() TO service_role;

COMMENT ON FUNCTION public.list_applied_migrations() IS
  'Audit CI : liste des versions migrations appliquées (sans le SQL). Service_role only. Voir scripts/audit-migrations-applied.mjs.';
