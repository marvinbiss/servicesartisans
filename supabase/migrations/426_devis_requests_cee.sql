-- Migration 426: Extensions CEE sur devis_requests (détection éligibilité, lien lead, flags review)
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 424 (cee_operations_ref, cee_forfaits), 425 (enums). FK vers cee_leads posée en 428.

BEGIN;

ALTER TABLE public.devis_requests
  ADD COLUMN IF NOT EXISTS cee_eligible           boolean    NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cee_operation_code     text,
  ADD COLUMN IF NOT EXISTS cee_forfait_id         bigint,
  ADD COLUMN IF NOT EXISTS cee_prime_estimee_cts  bigint     CHECK (cee_prime_estimee_cts IS NULL OR cee_prime_estimee_cts >= 0),
  ADD COLUMN IF NOT EXISTS cee_prime_version      text,
  ADD COLUMN IF NOT EXISTS cee_lead_id            uuid,
  ADD COLUMN IF NOT EXISTS cee_detected_at        timestamptz,
  ADD COLUMN IF NOT EXISTS cee_detector_version   text,
  ADD COLUMN IF NOT EXISTS cee_auto_flagged_at    timestamptz,
  ADD COLUMN IF NOT EXISTS cee_manual_review      boolean    NOT NULL DEFAULT false;

DO $$ BEGIN
  ALTER TABLE public.devis_requests
    ADD CONSTRAINT devis_requests_cee_operation_code_fkey
    FOREIGN KEY (cee_operation_code) REFERENCES public.cee_operations_ref(code) ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.devis_requests
    ADD CONSTRAINT devis_requests_cee_forfait_id_fkey
    FOREIGN KEY (cee_forfait_id) REFERENCES public.cee_forfaits(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.devis_requests
    ADD CONSTRAINT devis_requests_cee_operation_code_fmt_chk
    CHECK (cee_operation_code IS NULL OR cee_operation_code ~ '^(BAR|BAT|IND|RES|TRA|AGRI)-[A-Z]{2}-[0-9]{3}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_devis_requests_cee_eligible
  ON public.devis_requests(created_at DESC) WHERE cee_eligible;
CREATE INDEX IF NOT EXISTS idx_devis_requests_cee_operation ON public.devis_requests(cee_operation_code);
CREATE INDEX IF NOT EXISTS idx_devis_requests_cee_lead_id   ON public.devis_requests(cee_lead_id);
CREATE INDEX IF NOT EXISTS idx_devis_requests_cee_review
  ON public.devis_requests(created_at DESC) WHERE cee_manual_review;

COMMENT ON COLUMN public.devis_requests.cee_prime_estimee_cts IS 'Prime CEE estimée en centimes (snapshot au moment du devis)';
COMMENT ON COLUMN public.devis_requests.cee_prime_version     IS 'Hash stable du barème appliqué (audit)';
COMMENT ON COLUMN public.devis_requests.cee_auto_flagged_at   IS 'Timestamp flagging auto par détecteur éligibilité';
COMMENT ON COLUMN public.devis_requests.cee_manual_review     IS 'Demande review humaine (éligibilité ambiguë)';

COMMIT;
