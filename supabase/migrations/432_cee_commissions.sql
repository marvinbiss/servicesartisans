-- Migration 432: cee_commissions + sepa_batches (paiement SEPA batch maison) + séquence factures
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 102 (set_updated_at), 430 (cee_artisan_partners), 431 (cee_dossiers)

BEGIN;

-- ---------------------------------------------------------------------------
-- 432.1  Séquence auto-incrément pour numéros de facture commission
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.cee_commission_invoice_seq
  START WITH 1
  INCREMENT BY 1
  NO CYCLE;

-- ---------------------------------------------------------------------------
-- 432.2  sepa_batches — Lots SEPA Credit Transfer (batch maison)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sepa_batches (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference          text NOT NULL UNIQUE,
  xml_sepa_url       text,
  status             text NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','generated','sent_to_bank','confirmed','failed')),
  total_cts          bigint NOT NULL DEFAULT 0 CHECK (total_cts >= 0),
  commissions_count  integer NOT NULL DEFAULT 0 CHECK (commissions_count >= 0),
  generated_at       timestamptz,
  sent_at            timestamptz,
  confirmed_at       timestamptz,
  failure_reason     text,
  created_by         uuid REFERENCES auth.users(id),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.sepa_batches IS 'Lots SEPA Credit Transfer pour paiement commissions partenaires CEE';
CREATE INDEX IF NOT EXISTS idx_sepa_batches_status     ON public.sepa_batches(status);
CREATE INDEX IF NOT EXISTS idx_sepa_batches_created_at ON public.sepa_batches(created_at DESC);

DROP TRIGGER IF EXISTS trg_sepa_batches_updated_at ON public.sepa_batches;
CREATE TRIGGER trg_sepa_batches_updated_at
  BEFORE UPDATE ON public.sepa_batches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.sepa_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sepa_batches_admin_all ON public.sepa_batches;
CREATE POLICY sepa_batches_admin_all ON public.sepa_batches
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- 432.3  cee_commissions — Commissions à verser aux artisans partenaires
-- status: due → batched → sent → confirmed | failed
-- payment_method default 'sepa_credit_transfer'
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_commissions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id         uuid NOT NULL UNIQUE REFERENCES public.cee_dossiers(id) ON DELETE RESTRICT,
  partner_id         uuid NOT NULL REFERENCES public.cee_artisan_partners(id) ON DELETE RESTRICT,

  amount_cts         bigint NOT NULL CHECK (amount_cts >= 0),
  currency           char(3) NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),

  status             text NOT NULL DEFAULT 'due'
                       CHECK (status IN ('due','batched','sent','confirmed','failed','cancelled')),
  batch_id           uuid REFERENCES public.sepa_batches(id) ON DELETE SET NULL,

  payment_method     text NOT NULL DEFAULT 'sepa_credit_transfer'
                       CHECK (payment_method IN ('sepa_credit_transfer','sepa_instant','wire','manual')),
  payment_reference  text,

  invoice_number     text UNIQUE,
  invoice_pdf_url    text,

  scheduled_at       timestamptz,
  sent_at            timestamptz,
  confirmed_at       timestamptz,
  failed_at          timestamptz,
  failure_reason     text,

  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.cee_commissions IS 'Commissions artisans partenaires (paiement SEPA batch maison)';
COMMENT ON COLUMN public.cee_commissions.payment_reference IS 'End-to-end ID SEPA (UETR) ou référence virement';
COMMENT ON COLUMN public.cee_commissions.invoice_number IS 'Numéro facture commission auto-incrémenté (séquence cee_commission_invoice_seq)';

CREATE INDEX IF NOT EXISTS idx_cee_commissions_batch_status
  ON public.cee_commissions(batch_id, status);
CREATE INDEX IF NOT EXISTS idx_cee_commissions_due
  ON public.cee_commissions(partner_id) WHERE status = 'due';
CREATE INDEX IF NOT EXISTS idx_cee_commissions_partner
  ON public.cee_commissions(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_commissions_status
  ON public.cee_commissions(status);

DROP TRIGGER IF EXISTS trg_cee_commissions_updated_at ON public.cee_commissions;
CREATE TRIGGER trg_cee_commissions_updated_at
  BEFORE UPDATE ON public.cee_commissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.cee_commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_commissions_artisan_self_read ON public.cee_commissions;
DROP POLICY IF EXISTS cee_commissions_admin_all         ON public.cee_commissions;

CREATE POLICY cee_commissions_artisan_self_read ON public.cee_commissions
  FOR SELECT TO authenticated
  USING (partner_id IN (
    SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid()
  ));

CREATE POLICY cee_commissions_admin_all ON public.cee_commissions
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

COMMIT;
