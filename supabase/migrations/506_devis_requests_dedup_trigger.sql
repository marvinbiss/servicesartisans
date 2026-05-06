-- 506_devis_requests_dedup_trigger.sql
-- Audit V2 races hors CEE / V1 API publiques :
-- `checkDuplicate` SELECT-then-INSERT non atomique. Double-clic + retry réseau
-- Vercel ⇒ 2 leads créés ⇒ 2 dispatches ⇒ 2 SMS Twilio + 2 emails Resend +
-- 2 entrées Pipedrive sur le canal #1 revenus. Postgres ne supporte pas les
-- UNIQUE INDEX avec time-window. Solution : trigger BEFORE INSERT qui lève
-- 23505 si un doublon récent existe sur (client_phone, service_name, city)
-- dans la dernière heure.

CREATE INDEX IF NOT EXISTS idx_devis_requests_dedup_lookup
  ON public.devis_requests (client_phone, service_name, city, created_at DESC)
  WHERE client_phone IS NOT NULL;

CREATE OR REPLACE FUNCTION public.devis_requests_dedup_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $sa$
DECLARE
  v_existing_id UUID;
BEGIN
  IF NEW.client_phone IS NULL OR NEW.client_phone = '' THEN
    RETURN NEW;
  END IF;

  SELECT id
    INTO v_existing_id
    FROM public.devis_requests
   WHERE client_phone = NEW.client_phone
     AND service_name = NEW.service_name
     AND COALESCE(city, '') = COALESCE(NEW.city, '')
     AND created_at >= now() - interval '1 hour'
   ORDER BY created_at DESC
   LIMIT 1
   FOR UPDATE SKIP LOCKED;

  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'duplicate devis request within 1h window'
      USING ERRCODE = '23505',
            DETAIL = format('existing_id=%s phone=%s service=%s city=%s',
                            v_existing_id, NEW.client_phone, NEW.service_name, NEW.city);
  END IF;

  RETURN NEW;
END;
$sa$;

DROP TRIGGER IF EXISTS devis_requests_dedup_trg ON public.devis_requests;
CREATE TRIGGER devis_requests_dedup_trg
  BEFORE INSERT ON public.devis_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.devis_requests_dedup_check();

COMMENT ON TRIGGER devis_requests_dedup_trg ON public.devis_requests IS
  'Race-safe dedup. Lève 23505 si phone+service+city existe <1h. Caller doit catch et retourner duplicate idempotent.';
