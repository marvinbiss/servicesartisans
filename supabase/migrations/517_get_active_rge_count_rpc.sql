-- 517_get_active_rge_count_rpc.sql
-- 2026-05-06
-- RPC scalaire : nombre total d'artisans RGE actifs (somme déjà préagrégée
-- dans `mv_provider_counts`, mig 516).
--
-- Pourquoi : `_getProviderCount()` faisait `COUNT(*) exact head` sur
-- `providers` (970K rows) avec 3 prédicats dont `rge_valid_until >= today` →
-- timeout 4s régulier en prod (logs Vercel 2026-05-06 19:24-19:26). Lire la
-- MV via `.select()` PostgREST sous-compterait à 1000 rows max sans
-- pagination explicite. Cette RPC retourne un scalaire en ~ms.

CREATE OR REPLACE FUNCTION public.get_active_rge_count()
RETURNS bigint AS $fn$
  SELECT COALESCE(SUM(rge_provider_count), 0)::bigint
  FROM public.mv_provider_counts;
$fn$ LANGUAGE sql STABLE
   SECURITY DEFINER
   SET search_path = public, pg_catalog;

COMMENT ON FUNCTION public.get_active_rge_count IS
  'Total artisans RGE actifs (SUM préagrégée mv_provider_counts mig 516).
   Source vérité homepage TrustBar + tout call-site getProviderCount().';
