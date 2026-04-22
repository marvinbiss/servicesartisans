-- ===========================================================================
-- Migration 471 — Trigger sync_provider_noindex
-- ===========================================================================
-- Maintient providers.noindex synchronisé avec la règle RGE-only :
--   indexable SSI is_active = true ET (rge_valid_until > now() OU claimed_at IS NOT NULL)
--
-- Sans ce trigger, claim d'un artisan ou expiration RGE ne flip pas la
-- colonne → dérive silencieuse de l'index vs réalité. Section 13.6 du
-- MASTER-PLAN-00-SYNTHESIS.
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.sync_provider_noindex()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $body$
BEGIN
  NEW.noindex := NOT (
    NEW.is_active = true
    AND (
      (NEW.rge_valid_until IS NOT NULL AND NEW.rge_valid_until > now())
      OR NEW.claimed_at IS NOT NULL
    )
  );
  RETURN NEW;
END;
$body$;

DROP TRIGGER IF EXISTS trg_provider_noindex ON public.providers;

CREATE TRIGGER trg_provider_noindex
  BEFORE INSERT OR UPDATE OF rge_valid_until, claimed_at, is_active
  ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_provider_noindex();

COMMENT ON FUNCTION public.sync_provider_noindex() IS
  'Flip providers.noindex selon règle RGE-only. Évite dérive post-claim ou post-sync ADEME.';

COMMENT ON TRIGGER trg_provider_noindex ON public.providers IS
  'Maintient automatiquement la cohérence index/sitemap avec l''état RGE + claim.';
