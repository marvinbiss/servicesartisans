-- Migration 430: cee_artisan_partners (activation + convention Yousign + IBAN chiffré SEPA) + MV TAM
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 102 (set_updated_at), 380 (rge_qualifications), 425 (enums), 427 (providers MAR)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 430.1  cee_artisan_partners — Partenaires SA Energy mandataire CEE
-- Paiement SEPA batch maison (IBAN chiffré pgcrypto + last4 clair)
-- Signature convention Yousign (pas DocuSign)
-- Status machine: invited → onboarding → convention_sent → convention_signed → training → certified → active → suspended → revoked
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_artisan_partners (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id                 uuid NOT NULL REFERENCES public.providers(id) ON DELETE RESTRICT,
  user_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Status activation
  status                      public.cee_partner_status NOT NULL DEFAULT 'invited',
  invited_at                  timestamptz,
  onboarding_started_at       timestamptz,
  convention_sent_at          timestamptz,
  convention_signed_at        timestamptz,
  yousign_envelope_id         text,
  yousign_procedure_id        text,
  convention_pdf_url          text,
  training_completed_at       timestamptz,
  certification_score         smallint CHECK (certification_score IS NULL OR certification_score BETWEEN 0 AND 10),
  certified_at                timestamptz,
  activated_at                timestamptz,
  suspended_at                timestamptz,
  suspended_reason            text,
  revoked_at                  timestamptz,
  revoked_reason              text,

  -- Paiement SEPA (batch maison, pas Stripe Connect)
  iban_encrypted              bytea,
  iban_last4                  char(4) CHECK (iban_last4 IS NULL OR iban_last4 ~ '^[0-9A-Z]{4}$'),
  bic                         text CHECK (bic IS NULL OR bic ~ '^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$'),
  titulaire_compte            text,

  -- Commission (taux en %, pas de stockage centimes ici car barème)
  commission_rate_default     numeric(5,2) NOT NULL DEFAULT 10.00 CHECK (commission_rate_default BETWEEN 0 AND 100),
  commission_rate_override    numeric(5,2) CHECK (commission_rate_override IS NULL OR commission_rate_override BETWEEN 0 AND 100),
  commission_rate_effective   numeric(5,2) GENERATED ALWAYS AS
    (COALESCE(commission_rate_override, commission_rate_default)) STORED,

  -- Scope
  qualifications_snapshot     jsonb NOT NULL DEFAULT '[]'::jsonb,
  operations_allowed          text[] NOT NULL DEFAULT ARRAY[]::text[],
  zones_allowed               text[] NOT NULL DEFAULT ARRAY[]::text[],

  -- Audit
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT cee_artisan_partners_provider_unique UNIQUE (provider_id)
);

COMMENT ON TABLE  public.cee_artisan_partners IS 'Partenaires SA Energy — activation CEE, convention Yousign, paiement SEPA batch';
COMMENT ON COLUMN public.cee_artisan_partners.iban_encrypted IS 'IBAN chiffré via pgcrypto.pgp_sym_encrypt (clé CEE_IBAN_KEY côté app)';
COMMENT ON COLUMN public.cee_artisan_partners.iban_last4 IS 'Derniers 4 caractères IBAN en clair (display UI)';
COMMENT ON COLUMN public.cee_artisan_partners.commission_rate_effective IS 'Taux effectif = override ?? default';
COMMENT ON COLUMN public.cee_artisan_partners.qualifications_snapshot IS 'Snapshot providers.rge_qualifications au moment activation';
COMMENT ON COLUMN public.cee_artisan_partners.operations_allowed IS 'Codes opérations autorisées (ex: BAR-TH-171)';
COMMENT ON COLUMN public.cee_artisan_partners.zones_allowed IS 'Départements couverts (ex: {75,92,93})';

CREATE INDEX IF NOT EXISTS idx_cee_partners_status
  ON public.cee_artisan_partners(status) WHERE status IN ('active','certified');
CREATE INDEX IF NOT EXISTS idx_cee_partners_user        ON public.cee_artisan_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_cee_partners_provider    ON public.cee_artisan_partners(provider_id);
CREATE INDEX IF NOT EXISTS idx_cee_partners_yousign_env ON public.cee_artisan_partners(yousign_envelope_id);
CREATE INDEX IF NOT EXISTS idx_cee_partners_ops_allowed ON public.cee_artisan_partners USING GIN (operations_allowed);
CREATE INDEX IF NOT EXISTS idx_cee_partners_zones       ON public.cee_artisan_partners USING GIN (zones_allowed);

DROP TRIGGER IF EXISTS trg_cee_partners_updated_at ON public.cee_artisan_partners;
CREATE TRIGGER trg_cee_partners_updated_at
  BEFORE UPDATE ON public.cee_artisan_partners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.cee_artisan_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_artisan_partners_artisan_self_read ON public.cee_artisan_partners;
DROP POLICY IF EXISTS cee_artisan_partners_admin_all         ON public.cee_artisan_partners;

CREATE POLICY cee_artisan_partners_artisan_self_read ON public.cee_artisan_partners
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY cee_artisan_partners_admin_all ON public.cee_artisan_partners
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- 430.2  mv_cee_partners_tam — TAM artisans activables (refresh hebdo)
-- Colonne réelle = rge_qualifications (pas qualifications)
-- ---------------------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS public.mv_cee_partners_tam;
CREATE MATERIALIZED VIEW public.mv_cee_partners_tam AS
SELECT
  p.id,
  p.name,
  p.email,
  p.phone,
  p.siret,
  p.rge_qualifications,
  CASE
    WHEN p.rge_qualifications @> '[{"code":"QualiPAC"}]'::jsonb THEN 'PAC'
    WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(p.rge_qualifications) q
                 WHERE q->>'code' ILIKE 'Qualibat%') THEN 'ITE_ITI'
    WHEN p.rge_qualifications @> '[{"code":"QualiBois"}]'::jsonb THEN 'BIOMASSE'
    WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(p.rge_qualifications) q
                 WHERE q->>'code' ILIKE 'Qualit%EnR%'
                    OR q->>'code' ILIKE 'QualiSol%'
                    OR q->>'code' ILIKE 'QualiPV%') THEN 'SOLAIRE'
    WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(p.rge_qualifications) q
                 WHERE q->>'code' ILIKE 'Qualifelec%') THEN 'ELEC'
    ELSE 'AUTRE'
  END AS segment,
  p.address_region,
  p.address_department
FROM public.providers p
WHERE p.is_active = true
  AND p.email IS NOT NULL
  AND p.is_rge = true
  AND p.rge_qualifications IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.cee_artisan_partners cap WHERE cap.provider_id = p.id
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_cee_partners_tam_id ON public.mv_cee_partners_tam(id);
CREATE INDEX IF NOT EXISTS idx_mv_cee_partners_tam_segment   ON public.mv_cee_partners_tam(segment);
CREATE INDEX IF NOT EXISTS idx_mv_cee_partners_tam_dept      ON public.mv_cee_partners_tam(address_department);

COMMENT ON MATERIALIZED VIEW public.mv_cee_partners_tam IS 'TAM artisans activables CEE (refresh hebdo via cron)';

COMMIT;
