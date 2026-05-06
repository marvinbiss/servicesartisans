-- 512_refresh_functions_aliases.sql
-- Audit V2 SQL P0 #12 : 7 fonctions `refresh_*` interdites par règle SA
-- (Supabase SQL editor parser quirk sur le préfixe `refresh_`). Rename direct
-- = break du cron `calculate-trust-badges` qui appelle `refresh_provider_stats`.
-- Stratégie : créer les alias `fn_refresh_*` qui DELEGENT aux fonctions
-- existantes. Migration TS suivante (low-risk) basculera les call sites,
-- puis on pourra DROP les fonctions historiques.

CREATE OR REPLACE FUNCTION public.fn_refresh_artisan_stats()
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $sa$
BEGIN
  PERFORM public.refresh_artisan_stats();
END;
$sa$;

CREATE OR REPLACE FUNCTION public.fn_refresh_provider_stats()
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $sa$
BEGIN
  PERFORM public.refresh_provider_stats();
END;
$sa$;

CREATE OR REPLACE FUNCTION public.fn_refresh_commune_provider_counts()
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $sa$
BEGIN
  PERFORM public.refresh_commune_provider_counts();
END;
$sa$;

CREATE OR REPLACE FUNCTION public.fn_refresh_nearest_city_with_providers()
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $sa$
BEGIN
  PERFORM public.refresh_nearest_city_with_providers();
END;
$sa$;

GRANT EXECUTE ON FUNCTION public.fn_refresh_artisan_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_refresh_provider_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_refresh_commune_provider_counts() TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_refresh_nearest_city_with_providers() TO service_role;

COMMENT ON FUNCTION public.fn_refresh_provider_stats IS
  'Mig 512 — alias safe SQL editor (préfixe refresh_ interdit règle SA). Délègue à refresh_provider_stats existante. Caller TS doit migrer vers fn_*.';
