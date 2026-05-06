-- 504_backfill_specialty_slug.sql
-- Audit V1 hot path : `specialty_slug` ajoutée par mig 487 mais jamais peuplée.
-- Conséquence : `/avis/[service]/[ville]` retourne 0 row systématiquement
-- (city query .in('specialty_slug', ...) filtre sur NULL).
-- Solution : backfill depuis `specialty` (même valeur, alias slug-friendly)
-- + trigger BEFORE INSERT/UPDATE pour maintenir l'invariant.

UPDATE public.providers
   SET specialty_slug = specialty
 WHERE specialty_slug IS NULL
   AND specialty IS NOT NULL;

CREATE OR REPLACE FUNCTION public.providers_sync_specialty_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $sa$
BEGIN
  IF NEW.specialty IS NOT NULL AND (NEW.specialty_slug IS NULL OR NEW.specialty_slug = '') THEN
    NEW.specialty_slug := NEW.specialty;
  END IF;
  RETURN NEW;
END;
$sa$;

DROP TRIGGER IF EXISTS providers_sync_specialty_slug_trg ON public.providers;
CREATE TRIGGER providers_sync_specialty_slug_trg
  BEFORE INSERT OR UPDATE OF specialty, specialty_slug ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.providers_sync_specialty_slug();

CREATE INDEX IF NOT EXISTS idx_providers_specialty_slug_active
  ON public.providers (specialty_slug)
  WHERE is_active = TRUE AND noindex = FALSE;
