-- Migration 428: CEE leads + mandats Yousign (funnel mandataire) + FK tardive devis_requests.cee_lead_id
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 102 (set_updated_at), 424 (refs), 425 (enums), 426 (devis_requests.cee_lead_id), 427 (providers)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Guard: garantir l'existence de public.set_updated_at (défini en 102, idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 428.1  cee_leads — Funnel simulateur → paiement
-- email_hash RGPD pour dédoublonnage sans exposer PII
-- expires_at = 3 ans (purge RGPD)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_leads (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- PII brutes + hash SHA-256
  nom                   text,
  prenom                text,
  email                 text,
  -- email_hash rempli par trigger (digest de pgcrypto pas considéré IMMUTABLE par Supabase
  -- dans les expressions GENERATED STORED — on passe par trigger BEFORE INSERT/UPDATE).
  email_hash            text,
  telephone_e164        text CHECK (telephone_e164 IS NULL OR telephone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  adresse               text,
  code_postal           text CHECK (code_postal IS NULL OR code_postal ~ '^[0-9]{5}$'),
  commune_insee         text CHECK (commune_insee IS NULL OR commune_insee ~ '^[0-9AB]{5}$'),
  ville                 text,
  zone_climatique       public.zone_climatique,

  -- Foyer
  nb_personnes          smallint CHECK (nb_personnes IS NULL OR nb_personnes BETWEEN 1 AND 10),
  revenu_fiscal_ref_eur integer,
  categorie_revenus     public.categorie_revenus,

  -- Opération CEE snapshot
  operation_code        text REFERENCES public.cee_operations_ref(code),
  forfait_id            bigint REFERENCES public.cee_forfaits(id) ON DELETE SET NULL,
  plafond_revenus_id    uuid   REFERENCES public.revenus_plafonds(id) ON DELETE SET NULL,

  -- Primes (centimes)
  prime_estimee_cts     bigint CHECK (prime_estimee_cts IS NULL OR prime_estimee_cts >= 0),
  prime_finale_cts      bigint CHECK (prime_finale_cts  IS NULL OR prime_finale_cts  >= 0),

  -- Affectation
  artisan_id            uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  devis_request_id      uuid REFERENCES public.devis_requests(id) ON DELETE SET NULL,
  pipedrive_person_id   bigint,
  pipedrive_deal_id     bigint,

  -- Workflow
  source                text NOT NULL DEFAULT 'simulator',
  status                public.cee_lead_status NOT NULL DEFAULT 'simulation',
  duplicate_of          uuid REFERENCES public.cee_leads(id) ON DELETE SET NULL,

  -- Timestamps (RGPD 3 ans)
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  expires_at            timestamptz NOT NULL DEFAULT (now() + INTERVAL '3 years')
);

COMMENT ON TABLE  public.cee_leads IS 'Lead CEE — funnel simulateur → paiement. PII + hash email pour dédoublonnage';
COMMENT ON COLUMN public.cee_leads.email_hash IS 'SHA-256(lower(email)) — dédoublonnage sans exposer PII';
COMMENT ON COLUMN public.cee_leads.telephone_e164 IS 'Normalisé E.164 (ex: +33612345678)';
COMMENT ON COLUMN public.cee_leads.forfait_id IS 'Snapshot barème appliqué (stable si cee_forfaits évolue)';
COMMENT ON COLUMN public.cee_leads.expires_at IS 'Purge RGPD — 3 ans après création';

CREATE INDEX IF NOT EXISTS idx_cee_leads_status      ON public.cee_leads(status);
CREATE INDEX IF NOT EXISTS idx_cee_leads_created_at  ON public.cee_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_leads_artisan     ON public.cee_leads(artisan_id);
CREATE INDEX IF NOT EXISTS idx_cee_leads_operation   ON public.cee_leads(operation_code);
CREATE INDEX IF NOT EXISTS idx_cee_leads_expires_at  ON public.cee_leads(expires_at);
CREATE INDEX IF NOT EXISTS idx_cee_leads_email_hash  ON public.cee_leads(email_hash);

-- Dédoublonnage: même email_hash + operation dans 24h glissantes
-- Postgres refuse now() dans un index partiel (STABLE, pas IMMUTABLE).
-- On passe par un trigger BEFORE INSERT qui rejette les doublons < 24h.
CREATE INDEX IF NOT EXISTS idx_cee_leads_dedup_lookup
  ON public.cee_leads (email_hash, operation_code, created_at DESC)
  WHERE duplicate_of IS NULL;

CREATE OR REPLACE FUNCTION public.cee_leads_reject_dedup_24h()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.duplicate_of IS NOT NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.email_hash IS NULL OR NEW.operation_code IS NULL THEN
    RETURN NEW;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.cee_leads
     WHERE email_hash     = NEW.email_hash
       AND operation_code = NEW.operation_code
       AND duplicate_of IS NULL
       AND created_at > (now() - INTERVAL '24 hours')
       AND id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'cee_leads dedup: lead (email_hash=%, operation_code=%) already exists within 24h',
      NEW.email_hash, NEW.operation_code
      USING ERRCODE = 'unique_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cee_leads_dedup_24h ON public.cee_leads;
CREATE TRIGGER trg_cee_leads_dedup_24h
  BEFORE INSERT ON public.cee_leads
  FOR EACH ROW EXECUTE FUNCTION public.cee_leads_reject_dedup_24h();

DROP TRIGGER IF EXISTS trg_cee_leads_updated_at ON public.cee_leads;
CREATE TRIGGER trg_cee_leads_updated_at
  BEFORE UPDATE ON public.cee_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger email_hash: SHA-256(lower(email)) maintenu automatiquement.
CREATE OR REPLACE FUNCTION public.cee_leads_fill_email_hash()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.email_hash := encode(digest(lower(coalesce(NEW.email,'')), 'sha256'), 'hex');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cee_leads_email_hash ON public.cee_leads;
CREATE TRIGGER trg_cee_leads_email_hash
  BEFORE INSERT OR UPDATE OF email ON public.cee_leads
  FOR EACH ROW EXECUTE FUNCTION public.cee_leads_fill_email_hash();

-- RLS
ALTER TABLE public.cee_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_leads_admin_all          ON public.cee_leads;
DROP POLICY IF EXISTS cee_leads_artisan_self_read  ON public.cee_leads;

CREATE POLICY cee_leads_admin_all ON public.cee_leads
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY cee_leads_artisan_self_read ON public.cee_leads
  FOR SELECT TO authenticated
  USING (artisan_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

-- Anon: pas de policy => deny

-- ---------------------------------------------------------------------------
-- 428.2  cee_mandats — Mandats signés via Yousign
-- expires_at = 10 ans (R.221-1 code énergie)
-- 6 mentions obligatoires arrêté 2/11/2023 stockées dans mandat_mentions (jsonb)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_mandats (
  id                               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id                          uuid NOT NULL REFERENCES public.cee_leads(id) ON DELETE RESTRICT,
  ppee_numero                      text,

  -- Yousign
  yousign_envelope_id              text,
  yousign_procedure_id             text,
  mandat_pdf_url                   text,

  -- Contenu légal
  mandat_mentions                  jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Workflow signature
  signed_at                        timestamptz,
  bordereau_retractation_signed_at timestamptz,
  retractation_possible_jusque     timestamptz,

  status                           text NOT NULL DEFAULT 'pending',
  created_at                       timestamptz NOT NULL DEFAULT now(),
  updated_at                       timestamptz NOT NULL DEFAULT now(),
  expires_at                       timestamptz NOT NULL DEFAULT (now() + INTERVAL '10 years'),

  CONSTRAINT cee_mandats_status_chk CHECK
    (status IN ('pending','signe','retracte','depose','valide','refuse','annule'))
);
COMMENT ON TABLE public.cee_mandats IS 'Mandats signés Yousign client → SAS mandataire CEE (conservation 10 ans R.221-1)';
COMMENT ON COLUMN public.cee_mandats.mandat_mentions IS '6 mentions obligatoires arrêté 2/11/2023 (identité mandant/mandataire, périmètre, durée, rémunération, révocation, signature)';

CREATE INDEX IF NOT EXISTS idx_cee_mandats_lead                ON public.cee_mandats(lead_id);
CREATE INDEX IF NOT EXISTS idx_cee_mandats_signed_at           ON public.cee_mandats(signed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_mandats_status              ON public.cee_mandats(status);
CREATE INDEX IF NOT EXISTS idx_cee_mandats_yousign_envelope    ON public.cee_mandats(yousign_envelope_id);

DROP TRIGGER IF EXISTS trg_cee_mandats_updated_at ON public.cee_mandats;
CREATE TRIGGER trg_cee_mandats_updated_at
  BEFORE UPDATE ON public.cee_mandats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.cee_mandats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cee_mandats_admin_all ON public.cee_mandats;
CREATE POLICY cee_mandats_admin_all ON public.cee_mandats
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- 428.3  FK tardive devis_requests.cee_lead_id → cee_leads(id)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.devis_requests
    ADD CONSTRAINT devis_requests_cee_lead_id_fkey
    FOREIGN KEY (cee_lead_id) REFERENCES public.cee_leads(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;
