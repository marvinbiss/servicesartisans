-- Bundle migrations 424-435 V3 CEE artisan-first


-- ============================================================
-- 424_cee_referentiels.sql
-- ============================================================
-- Migration 424: CEE référentiels (operations, forfaits, plafonds revenus, zones climatiques) + extension cee_market_prices SPOT
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 102 (set_updated_at), 420 (cee_market_prices existant)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 424.1  cee_operations_ref — Catalogue des fiches d'opérations standardisées
-- Familles: BAR (résidentiel), BAT (tertiaire), IND (industrie),
--           RES (réseaux), TRA (transport), AGRI (agriculture)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_operations_ref (
  code               text PRIMARY KEY,
  libelle            text NOT NULL,
  famille            text NOT NULL,
  fiche_url          text,
  date_debut         date NOT NULL,
  date_fin           date,
  created_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cee_operations_ref_code_fmt_chk
    CHECK (code ~ '^(BAR|BAT|IND|RES|TRA|AGRI)-[A-Z]{2}-[0-9]{3}$')
);
COMMENT ON TABLE  public.cee_operations_ref IS 'Référentiel des opérations CEE standardisées (BAR/BAT/IND/RES/TRA/AGRI-XX-NNN)';
CREATE INDEX IF NOT EXISTS idx_cee_operations_ref_famille ON public.cee_operations_ref(famille);
CREATE INDEX IF NOT EXISTS idx_cee_operations_ref_period  ON public.cee_operations_ref(date_debut, date_fin);

-- Vue de compat : expose "actif" calculé à la requête (CURRENT_DATE est STABLE, pas IMMUTABLE,
-- donc GENERATED STORED impossible — on calcule en lecture via vue).
CREATE OR REPLACE VIEW public.cee_operations_ref_v AS
SELECT *,
       (CURRENT_DATE >= date_debut
        AND (date_fin IS NULL OR CURRENT_DATE <= date_fin)) AS actif
FROM public.cee_operations_ref;
COMMENT ON VIEW public.cee_operations_ref_v IS 'Vue cee_operations_ref + colonne calculée actif (CURRENT_DATE dans [date_debut, date_fin])';

-- ---------------------------------------------------------------------------
-- 424.2  cee_forfaits — Barèmes kWh cumac + prime forfaitaire (versionnés)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_forfaits (
  id                      bigserial PRIMARY KEY,
  operation_code          text NOT NULL REFERENCES public.cee_operations_ref(code) ON UPDATE CASCADE,
  zone                    text NOT NULL,
  categorie_revenus       text NOT NULL,
  montant_kwh_cumac       bigint NOT NULL CHECK (montant_kwh_cumac >= 0),
  prime_forfait_eur_cts   bigint NOT NULL CHECK (prime_forfait_eur_cts >= 0),
  date_validite_debut     date NOT NULL,
  date_validite_fin       date,
  source_doc              text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cee_forfaits_unique UNIQUE
    (operation_code, zone, categorie_revenus, date_validite_debut)
);
COMMENT ON TABLE  public.cee_forfaits IS 'Barèmes CEE versionnés par opération/zone/revenus/date';
COMMENT ON COLUMN public.cee_forfaits.prime_forfait_eur_cts IS 'Prime forfaitaire en centimes EUR (bigint, jamais NUMERIC)';
CREATE INDEX IF NOT EXISTS idx_cee_forfaits_validite_debut ON public.cee_forfaits(date_validite_debut);
CREATE INDEX IF NOT EXISTS idx_cee_forfaits_validite_fin   ON public.cee_forfaits(date_validite_fin);
CREATE INDEX IF NOT EXISTS idx_cee_forfaits_operation      ON public.cee_forfaits(operation_code);

-- ---------------------------------------------------------------------------
-- 424.3  revenus_plafonds — Plafonds ANAH/MPR par zone & composition foyer
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.revenus_plafonds (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone                      text NOT NULL CHECK (zone IN ('IDF','HORS_IDF')),
  nb_personnes              smallint NOT NULL CHECK (nb_personnes BETWEEN 1 AND 10),
  plafond_tres_modeste_eur  integer NOT NULL,
  plafond_modeste_eur       integer NOT NULL,
  plafond_intermediaire_eur integer NOT NULL,
  plafond_superieur_eur     integer NOT NULL,
  date_validite_debut       date NOT NULL,
  date_validite_fin         date,
  created_at                timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT revenus_plafonds_unique UNIQUE (zone, nb_personnes, date_validite_debut)
);
COMMENT ON TABLE public.revenus_plafonds IS 'Plafonds RFR en euros annuels par zone géo / composition / date';
CREATE INDEX IF NOT EXISTS idx_revenus_plafonds_validite ON public.revenus_plafonds(date_validite_debut);

-- ---------------------------------------------------------------------------
-- 424.4  zones_climatiques_ref — Mapping INSEE → zone H1/H2/H3
-- NB: clé = code INSEE (pas code postal) pour robustesse des communes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.zones_climatiques_ref (
  code_insee  text PRIMARY KEY CHECK (code_insee ~ '^[0-9AB]{5}$'),
  code_postal text CHECK (code_postal IS NULL OR code_postal ~ '^[0-9]{5}$'),
  commune     text,
  departement text,
  zone        text NOT NULL CHECK (zone IN ('H1','H2','H3')),
  note        text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.zones_climatiques_ref IS 'Zone climatique par code INSEE (CEE/RT)';
CREATE INDEX IF NOT EXISTS idx_zones_climatiques_zone ON public.zones_climatiques_ref(zone);
CREATE INDEX IF NOT EXISTS idx_zones_climatiques_cp   ON public.zones_climatiques_ref(code_postal);

-- ---------------------------------------------------------------------------
-- 424.5  cee_market_prices — EXTENSION pour SPOT (unification avec 420 existant)
-- Ne pas créer cee_spot_prices — on étend la table existante.
-- ---------------------------------------------------------------------------
-- Drop ancien CHECK sur price_type pour accepter 'spot'
DO $$ BEGIN
  ALTER TABLE public.cee_market_prices DROP CONSTRAINT cee_market_prices_price_type_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

ALTER TABLE public.cee_market_prices
  ADD COLUMN IF NOT EXISTS date_validite date,
  ADD COLUMN IF NOT EXISTS ingested_at   timestamptz;

DO $$ BEGIN
  ALTER TABLE public.cee_market_prices
    ADD CONSTRAINT cee_market_prices_price_type_check
    CHECK (price_type IN ('classique','precarite','spot'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Index pour SPOT queries (par date cotation)
CREATE INDEX IF NOT EXISTS idx_cee_market_prices_spot_date
  ON public.cee_market_prices(price_type, date_validite DESC)
  WHERE price_type = 'spot';

COMMENT ON COLUMN public.cee_market_prices.date_validite IS 'Date de cotation (SPOT) ou d''entrée en vigueur (classique/precarite)';
COMMENT ON COLUMN public.cee_market_prices.ingested_at IS 'Horodatage ingestion (SPOT scraping Emmy)';

COMMIT;

-- ============================================================
-- 425_cee_enums.sql
-- ============================================================
-- Migration 425: Enums CEE (lead status, catégorie revenus, zone climatique, partner status, dossier status)
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: aucune (types seulement)

BEGIN;

DO $$ BEGIN
  CREATE TYPE public.cee_lead_status AS ENUM (
    'simulation','qualifie','transmis_artisan','devis_envoye',
    'devis_signe','mandat_signe','dossier_cee_depose','paye','perdu','doublon'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.categorie_revenus AS ENUM
    ('tres_modeste','modeste','intermediaire','superieur');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.zone_climatique AS ENUM ('H1','H2','H3');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cee_partner_status AS ENUM (
    'invited','onboarding','convention_sent','convention_signed',
    'training','certified','active','suspended','revoked'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cee_dossier_status AS ENUM (
    'draft','submitted_by_artisan','qa_pending','qa_approved','qa_rejected',
    'deposited','validated','rejected_pncee','paid_client',
    'commission_due','commission_paid','archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;

-- ============================================================
-- 426_devis_requests_cee.sql
-- ============================================================
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

-- ============================================================
-- 427_providers_mar.sql
-- ============================================================
-- Migration 427: Colonnes MAR (Mon Accompagnateur Rénov') sur providers + table staging atomic swap
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 001 (providers), 413 (pattern atomic swap)

BEGIN;

-- ---------------------------------------------------------------------------
-- 427.1  Colonnes MAR sur providers
-- ---------------------------------------------------------------------------
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS is_mar_agree        boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mar_source_id       text,
  ADD COLUMN IF NOT EXISTS mar_qualifications  jsonb       NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS mar_last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS mar_agree_since     date,
  ADD COLUMN IF NOT EXISTS mar_revoked_at      timestamptz;

COMMENT ON COLUMN public.providers.is_mar_agree IS 'Mon Accompagnateur Renov — agrément actif';
COMMENT ON COLUMN public.providers.mar_qualifications IS 'Détails agrément MAR (numéro, périmètre, dates)';
COMMENT ON COLUMN public.providers.mar_last_verified_at IS 'Dernière vérification via source officielle (ANAH)';

CREATE INDEX IF NOT EXISTS idx_providers_mar_agree
  ON public.providers(address_department) WHERE is_mar_agree;

-- ---------------------------------------------------------------------------
-- 427.2  mar_staging — Staging atomic swap (pattern migration 413 RGE)
-- Purgée post-swap. Accessible service_role uniquement (pas de RLS policy = deny).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mar_staging (
  id                    bigserial PRIMARY KEY,
  siret                 text NOT NULL,
  siren                 text,
  raison_sociale        text,
  mar_source_id         text,
  mar_qualifications    jsonb NOT NULL DEFAULT '{}'::jsonb,
  mar_agree_since       date,
  mar_last_verified_at  timestamptz NOT NULL DEFAULT now(),
  fetched_at            timestamptz NOT NULL DEFAULT now(),
  import_run_id         uuid NOT NULL
);
COMMENT ON TABLE public.mar_staging IS 'Staging import MAR (ANAH) — atomic swap pattern, purgé post-swap';
CREATE INDEX IF NOT EXISTS idx_mar_staging_run   ON public.mar_staging(import_run_id);
CREATE INDEX IF NOT EXISTS idx_mar_staging_siret ON public.mar_staging(siret);

-- RLS: activée mais aucune policy => deny par défaut (service_role bypasse RLS)
ALTER TABLE public.mar_staging ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================================
-- 428_cee_leads_mandats.sql
-- ============================================================
-- Migration 428: CEE leads + mandats Yousign (funnel mandataire) + FK tardive devis_requests.cee_lead_id
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 102 (set_updated_at), 424 (refs), 425 (enums), 426 (devis_requests.cee_lead_id), 427 (providers)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
CREATE UNIQUE INDEX IF NOT EXISTS uniq_cee_leads_dedup_24h
  ON public.cee_leads (email_hash, operation_code)
  WHERE created_at > (now() - INTERVAL '24 hours') AND duplicate_of IS NULL;

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

-- ============================================================
-- 429_cee_observability.sql
-- ============================================================
-- Migration 429: Observability CEE (simulator events, email outbox DLQ, MVs stats/TAM)
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 102 (set_updated_at), 412 (pattern DLQ), 424-428

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 429.1  cee_simulator_events — Funnel analytics (purge 90 jours)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_simulator_events (
  id           bigserial PRIMARY KEY,
  session_id   uuid NOT NULL,
  lead_id      uuid REFERENCES public.cee_leads(id) ON DELETE SET NULL,
  step         smallint CHECK (step IS NULL OR step BETWEEN 1 AND 6),
  event_type   text NOT NULL,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_hash      text,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL DEFAULT (now() + INTERVAL '90 days')
);
COMMENT ON TABLE public.cee_simulator_events IS 'Événements funnel simulateur CEE (purge 90j)';
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_session    ON public.cee_simulator_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_lead       ON public.cee_simulator_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_created_at ON public.cee_simulator_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_expires_at ON public.cee_simulator_events(expires_at);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_type       ON public.cee_simulator_events(event_type);

-- ---------------------------------------------------------------------------
-- 429.2  email_outbox_cee — Outbox DLQ pattern (migration 412 Pipedrive)
-- Statuts: pending → sent | (retry backoff) → dead (MAX 5 attempts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_outbox_cee (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template          text NOT NULL,
  recipient         text NOT NULL,
  payload           jsonb NOT NULL DEFAULT '{}'::jsonb,
  status            text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','sent','failed','dead')),
  attempts          smallint NOT NULL DEFAULT 0 CHECK (attempts <= 5),
  next_retry_at     timestamptz NOT NULL DEFAULT now(),
  last_error        text,
  sent_at           timestamptz,
  dead_letter_at    timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.email_outbox_cee IS 'Outbox emails transactionnels CEE (DLQ pattern 412, retry cron 6h, MAX 5 tentatives)';
CREATE INDEX IF NOT EXISTS idx_email_outbox_cee_pending
  ON public.email_outbox_cee(next_retry_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_outbox_cee_created ON public.email_outbox_cee(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_outbox_cee_dead    ON public.email_outbox_cee(dead_letter_at) WHERE status = 'dead';

DROP TRIGGER IF EXISTS trg_email_outbox_cee_updated_at ON public.email_outbox_cee;
CREATE TRIGGER trg_email_outbox_cee_updated_at
  BEFORE UPDATE ON public.email_outbox_cee
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.email_outbox_cee ENABLE ROW LEVEL SECURITY;
-- service_role only (pas de policy)

-- ---------------------------------------------------------------------------
-- 429.3  Vues matérialisées — stats dossiers, TAM partenaires
-- NB: cee_dossiers créée en 431 → utilisation DO-block guard si absente
-- ---------------------------------------------------------------------------

DROP MATERIALIZED VIEW IF EXISTS public.v_cee_funnel_conversion;
CREATE MATERIALIZED VIEW public.v_cee_funnel_conversion AS
SELECT
  date_trunc('day', created_at)::date AS jour,
  step,
  event_type,
  count(*)                            AS events,
  count(DISTINCT session_id)          AS sessions
FROM public.cee_simulator_events
WHERE created_at > now() - INTERVAL '90 days'
GROUP BY 1,2,3
ORDER BY 1 DESC, 2, 3;
CREATE INDEX IF NOT EXISTS idx_v_cee_funnel_jour ON public.v_cee_funnel_conversion(jour);

DROP MATERIALIZED VIEW IF EXISTS public.v_cee_leads_daily_stats;
CREATE MATERIALIZED VIEW public.v_cee_leads_daily_stats AS
SELECT
  date_trunc('day', created_at)::date AS jour,
  status,
  count(*)                            AS nb_leads,
  count(DISTINCT artisan_id)          AS nb_artisans,
  coalesce(sum(prime_estimee_cts),0)  AS prime_estimee_cts_total
FROM public.cee_leads
GROUP BY 1,2
ORDER BY 1 DESC, 2;
CREATE INDEX IF NOT EXISTS idx_v_cee_leads_daily_jour ON public.v_cee_leads_daily_stats(jour);

-- mv_cee_dossiers_stats et mv_cee_partners_tam : créées en 431-430 respectivement
-- après la table cee_dossiers et cee_artisan_partners.

COMMIT;

-- ============================================================
-- 430_cee_artisan_partners.sql
-- ============================================================
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

-- ============================================================
-- 431_cee_dossiers.sql
-- ============================================================
-- Migration 431: cee_dossiers (coeur métier) + cee_dossier_documents + cee_dossier_events + MV stats
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 102 (set_updated_at), 424 (refs), 425 (enums), 427 (providers), 430 (cee_artisan_partners)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 431.1  cee_dossiers — Dossier CEE monté par artisan partenaire
-- PII chiffrées (pgcrypto côté app) + email_hash généré pour dédoublonnage
-- expires_at = 10 ans (conservation pièces CEE R.221-1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_dossiers (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference                   text NOT NULL UNIQUE,

  -- Partenaire source
  partner_id                  uuid NOT NULL REFERENCES public.cee_artisan_partners(id) ON DELETE RESTRICT,
  provider_id                 uuid NOT NULL REFERENCES public.providers(id) ON DELETE RESTRICT,

  -- Client bénéficiaire (PII chiffrées)
  client_nom_encrypted        bytea NOT NULL,
  client_prenom_encrypted     bytea NOT NULL,
  client_email_encrypted      bytea NOT NULL,
  client_email_hash           text,
  client_telephone_encrypted  bytea,
  client_adresse_encrypted    bytea NOT NULL,
  client_code_postal          text NOT NULL CHECK (client_code_postal ~ '^[0-9]{5}$'),
  client_commune_insee        text NOT NULL REFERENCES public.zones_climatiques_ref(code_insee),

  -- Revenus bénéficiaire
  foyer_personnes             smallint NOT NULL CHECK (foyer_personnes BETWEEN 1 AND 12),
  revenus_categorie           public.categorie_revenus NOT NULL,
  rfr_declared_cts            bigint CHECK (rfr_declared_cts IS NULL OR rfr_declared_cts >= 0),

  -- Chantier
  operation_code              text NOT NULL REFERENCES public.cee_operations_ref(code),
  type_travaux                text NOT NULL,
  surface_m2                  numeric(7,2) CHECK (surface_m2 IS NULL OR surface_m2 >= 0),
  annee_construction          smallint CHECK (annee_construction IS NULL OR annee_construction BETWEEN 1800 AND 2100),
  energie_remplacee           text,
  montant_ht_cts              bigint NOT NULL CHECK (montant_ht_cts >= 0),
  montant_ttc_cts             bigint NOT NULL CHECK (montant_ttc_cts >= 0),
  date_devis                  date NOT NULL,
  date_chantier_prevue        date,
  date_chantier_realisee      date,

  -- Primes (snapshot versionné)
  forfait_id                  bigint NOT NULL REFERENCES public.cee_forfaits(id),
  forfait_version             text NOT NULL,
  prime_cee_cts               bigint NOT NULL CHECK (prime_cee_cts >= 0),
  prime_mpr_cts               bigint CHECK (prime_mpr_cts IS NULL OR prime_mpr_cts >= 0),
  prime_total_cts             bigint GENERATED ALWAYS AS (prime_cee_cts + COALESCE(prime_mpr_cts,0)) STORED,
  reste_a_charge_cts          bigint GENERATED ALWAYS AS (montant_ttc_cts - prime_cee_cts - COALESCE(prime_mpr_cts,0)) STORED,

  -- Délégataire
  delegataire                 text,
  delegataire_reference       text,
  delegataire_submission_at   timestamptz,
  delegataire_response_at     timestamptz,
  delegataire_response_status text CHECK (delegataire_response_status IS NULL OR delegataire_response_status IN ('accepted','rejected','pending')),
  delegataire_response_motif  text,
  pncee_reference             text,

  -- Status machine
  status                      public.cee_dossier_status NOT NULL DEFAULT 'draft',
  qa_score                    smallint CHECK (qa_score IS NULL OR qa_score BETWEEN 0 AND 100),
  qa_reviewer_id              uuid REFERENCES auth.users(id),
  qa_reviewed_at              timestamptz,
  qa_notes                    text,

  -- Commission artisan (snapshot taux au moment création)
  commission_rate             numeric(5,2) NOT NULL CHECK (commission_rate BETWEEN 0 AND 100),
  commission_amount_cts       bigint GENERATED ALWAYS AS
    ((montant_ht_cts * commission_rate / 100)::bigint) STORED,
  commission_status           text NOT NULL DEFAULT 'pending'
                                CHECK (commission_status IN ('pending','due','paid','cancelled')),
  commission_paid_at          timestamptz,

  -- Audit
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  expires_at                  timestamptz NOT NULL DEFAULT (now() + INTERVAL '10 years'),

  CONSTRAINT cee_dossiers_operation_code_fmt_chk
    CHECK (operation_code ~ '^(BAR|BAT|IND|RES|TRA|AGRI)-[A-Z]{2}-[0-9]{3}$'),
  CONSTRAINT cee_dossiers_reference_fmt_chk
    CHECK (reference ~ '^SAE-[0-9]{6}-[0-9]{6}$')
);

COMMENT ON TABLE  public.cee_dossiers IS 'Dossiers CEE montés par artisans partenaires (conservation 10 ans R.221-1)';
COMMENT ON COLUMN public.cee_dossiers.reference IS 'Format SAE-YYYYMM-NNNNNN (généré côté app)';
COMMENT ON COLUMN public.cee_dossiers.client_email_hash IS 'SHA-256(lower(email)) — renseigné côté app avant INSERT (email chiffré ne permet pas GENERATED)';
COMMENT ON COLUMN public.cee_dossiers.forfait_version IS 'Hash stable du barème (date_validite_debut + montant)';
COMMENT ON COLUMN public.cee_dossiers.commission_amount_cts IS 'Commission = montant_ht_cts * commission_rate / 100';

CREATE INDEX IF NOT EXISTS idx_cee_dossiers_partner_status ON public.cee_dossiers(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_qa_queue       ON public.cee_dossiers(created_at) WHERE status = 'qa_pending';
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_deleg
  ON public.cee_dossiers(delegataire, delegataire_submission_at)
  WHERE status IN ('deposited','validated','rejected_pncee');
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_provider      ON public.cee_dossiers(provider_id);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_operation     ON public.cee_dossiers(operation_code);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_email_hash    ON public.cee_dossiers(client_email_hash);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_expires_at    ON public.cee_dossiers(expires_at);

-- ---------------------------------------------------------------------------
-- 431.2  Trigger transitions de status (empêche transitions illégales)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_dossiers_check_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  allowed boolean := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('draft','submitted_by_artisan') THEN
      RAISE EXCEPTION 'cee_dossiers: status initial invalide %', NEW.status;
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Matrice transitions autorisées
  allowed := CASE
    WHEN OLD.status = 'draft'                AND NEW.status IN ('submitted_by_artisan','archived') THEN true
    WHEN OLD.status = 'submitted_by_artisan' AND NEW.status IN ('qa_pending','draft','archived') THEN true
    WHEN OLD.status = 'qa_pending'           AND NEW.status IN ('qa_approved','qa_rejected') THEN true
    WHEN OLD.status = 'qa_approved'          AND NEW.status IN ('deposited','archived') THEN true
    WHEN OLD.status = 'qa_rejected'          AND NEW.status IN ('draft','submitted_by_artisan','archived') THEN true
    WHEN OLD.status = 'deposited'            AND NEW.status IN ('validated','rejected_pncee') THEN true
    WHEN OLD.status = 'validated'            AND NEW.status IN ('paid_client','commission_due','archived') THEN true
    WHEN OLD.status = 'rejected_pncee'       AND NEW.status IN ('archived') THEN true
    WHEN OLD.status = 'paid_client'          AND NEW.status IN ('commission_due','archived') THEN true
    WHEN OLD.status = 'commission_due'       AND NEW.status IN ('commission_paid','archived') THEN true
    WHEN OLD.status = 'commission_paid'      AND NEW.status IN ('archived') THEN true
    ELSE false
  END;

  -- Admins peuvent forcer une transition (role JWT)
  IF NOT allowed AND (auth.jwt() ->> 'role') <> 'admin' THEN
    RAISE EXCEPTION 'cee_dossiers: transition illégale % → %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cee_dossiers_status_transition ON public.cee_dossiers;
CREATE TRIGGER trg_cee_dossiers_status_transition
  BEFORE INSERT OR UPDATE OF status ON public.cee_dossiers
  FOR EACH ROW EXECUTE FUNCTION public.cee_dossiers_check_status_transition();

DROP TRIGGER IF EXISTS trg_cee_dossiers_updated_at ON public.cee_dossiers;
CREATE TRIGGER trg_cee_dossiers_updated_at
  BEFORE UPDATE ON public.cee_dossiers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 431.3  RLS cee_dossiers
-- ---------------------------------------------------------------------------
ALTER TABLE public.cee_dossiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_dossiers_artisan_self_read     ON public.cee_dossiers;
DROP POLICY IF EXISTS cee_dossiers_artisan_insert        ON public.cee_dossiers;
DROP POLICY IF EXISTS cee_dossiers_artisan_update_draft  ON public.cee_dossiers;
DROP POLICY IF EXISTS cee_dossiers_admin_all             ON public.cee_dossiers;

CREATE POLICY cee_dossiers_artisan_self_read ON public.cee_dossiers
  FOR SELECT TO authenticated
  USING (partner_id IN (
    SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid()
  ));

CREATE POLICY cee_dossiers_artisan_insert ON public.cee_dossiers
  FOR INSERT TO authenticated
  WITH CHECK (partner_id IN (
    SELECT id FROM public.cee_artisan_partners
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY cee_dossiers_artisan_update_draft ON public.cee_dossiers
  FOR UPDATE TO authenticated
  USING (
    partner_id IN (SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid())
    AND status IN ('draft','qa_rejected')
  )
  WITH CHECK (
    partner_id IN (SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid())
    AND status IN ('draft','submitted_by_artisan','qa_rejected')
  );

CREATE POLICY cee_dossiers_admin_all ON public.cee_dossiers
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- 431.4  cee_dossier_documents — Pièces justificatives
-- Unique (dossier_id, kind, sha256) : pas de doublon binaire
-- Photos géoloc obligatoires (geo_lat/lng + EXIF taken_at) depuis 2026-01-01
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_dossier_documents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id         uuid NOT NULL REFERENCES public.cee_dossiers(id) ON DELETE CASCADE,
  kind               text NOT NULL CHECK (kind IN (
                        'devis_signe','facture','avis_imposition','mandat_cee',
                        'photo_avant','photo_apres','fiche_technique',
                        'attestation_rge','pv_reception','autre'
                      )),
  filename           text NOT NULL,
  storage_path       text NOT NULL,
  mime_type          text NOT NULL,
  size_bytes         bigint NOT NULL CHECK (size_bytes >= 0),
  sha256             text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  geo_lat            numeric(10,7) CHECK (geo_lat IS NULL OR geo_lat BETWEEN -90 AND 90),
  geo_lng            numeric(10,7) CHECK (geo_lng IS NULL OR geo_lng BETWEEN -180 AND 180),
  taken_at           timestamptz,
  uploaded_by        uuid NOT NULL REFERENCES auth.users(id),
  uploaded_at        timestamptz NOT NULL DEFAULT now(),
  virus_scan_status  text NOT NULL DEFAULT 'pending'
                       CHECK (virus_scan_status IN ('pending','clean','infected','error')),
  virus_scan_at      timestamptz,
  CONSTRAINT cee_dossier_documents_unique_binary UNIQUE (dossier_id, kind, sha256)
);

COMMENT ON TABLE public.cee_dossier_documents IS 'Pièces justificatives dossiers CEE (hash SHA-256 unique par dossier+kind)';
COMMENT ON COLUMN public.cee_dossier_documents.storage_path IS 'Supabase Storage: cee-dossiers/{dossier_id}/{kind}/{filename}';
COMMENT ON COLUMN public.cee_dossier_documents.geo_lat IS 'Latitude EXIF (photos géoloc obligatoires depuis 2026-01-01)';

CREATE INDEX IF NOT EXISTS idx_cee_dossier_documents_dossier  ON public.cee_dossier_documents(dossier_id);
CREATE INDEX IF NOT EXISTS idx_cee_dossier_documents_kind     ON public.cee_dossier_documents(kind);
CREATE INDEX IF NOT EXISTS idx_cee_dossier_documents_scan
  ON public.cee_dossier_documents(uploaded_at) WHERE virus_scan_status = 'pending';

ALTER TABLE public.cee_dossier_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_dossier_documents_artisan_self ON public.cee_dossier_documents;
DROP POLICY IF EXISTS cee_dossier_documents_admin_all    ON public.cee_dossier_documents;

CREATE POLICY cee_dossier_documents_artisan_self ON public.cee_dossier_documents
  FOR ALL TO authenticated
  USING (dossier_id IN (
    SELECT id FROM public.cee_dossiers WHERE partner_id IN (
      SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (dossier_id IN (
    SELECT id FROM public.cee_dossiers WHERE partner_id IN (
      SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY cee_dossier_documents_admin_all ON public.cee_dossier_documents
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- 431.5  cee_dossier_events — Audit trail (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_dossier_events (
  id           bigserial PRIMARY KEY,
  dossier_id   uuid NOT NULL REFERENCES public.cee_dossiers(id) ON DELETE CASCADE,
  event_type   text NOT NULL,
  actor_id     uuid REFERENCES auth.users(id),
  actor_role   text,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.cee_dossier_events IS 'Audit trail dossiers CEE (status_change, doc_uploaded, qa_review, deleg_submitted...)';
CREATE INDEX IF NOT EXISTS idx_cee_dossier_events_dossier ON public.cee_dossier_events(dossier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_dossier_events_type    ON public.cee_dossier_events(event_type);

ALTER TABLE public.cee_dossier_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_dossier_events_artisan_self_read ON public.cee_dossier_events;
DROP POLICY IF EXISTS cee_dossier_events_admin_all         ON public.cee_dossier_events;

CREATE POLICY cee_dossier_events_artisan_self_read ON public.cee_dossier_events
  FOR SELECT TO authenticated
  USING (dossier_id IN (
    SELECT id FROM public.cee_dossiers WHERE partner_id IN (
      SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY cee_dossier_events_admin_all ON public.cee_dossier_events
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- 431.6  mv_cee_dossiers_stats — Stats par partenaire × status × mois (refresh hebdo)
-- ---------------------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS public.mv_cee_dossiers_stats;
CREATE MATERIALIZED VIEW public.mv_cee_dossiers_stats AS
SELECT
  partner_id,
  status,
  date_trunc('month', created_at)::date AS mois,
  count(*)                              AS nb_dossiers,
  coalesce(sum(prime_cee_cts),0)        AS prime_cee_cts_total,
  coalesce(sum(prime_total_cts),0)      AS prime_total_cts_total,
  coalesce(sum(commission_amount_cts),0) AS commission_cts_total
FROM public.cee_dossiers
GROUP BY 1,2,3;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_cee_dossiers_stats_key
  ON public.mv_cee_dossiers_stats(partner_id, status, mois);
CREATE INDEX IF NOT EXISTS idx_mv_cee_dossiers_stats_mois
  ON public.mv_cee_dossiers_stats(mois DESC);

COMMENT ON MATERIALIZED VIEW public.mv_cee_dossiers_stats IS 'Stats dossiers CEE par partenaire × status × mois (refresh hebdo cron)';

COMMIT;

-- ============================================================
-- 432_cee_commissions.sql
-- ============================================================
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

-- ============================================================
-- 433_cee_security_patches.sql
-- ============================================================
-- Migration 433: Security patches CEE 424-432 (PR1 hardening)
-- Date 2026-04-14
-- Plan V3 PR1 — corrige findings SECURITY_AUDIT_424_432.md
-- Dépend: 428 (cee_mandats), 430 (mv_cee_partners_tam), 431 (cee_dossiers, cee_dossier_events, mv_cee_dossiers_stats)

BEGIN;

-- ---------------------------------------------------------------------------
-- C1 — cee_mandats: policy artisan self_read (CRITICAL)
-- Un artisan doit pouvoir lire ses propres mandats signés (UX espace-artisan/cee)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS cee_mandats_artisan_self_read ON public.cee_mandats;
CREATE POLICY cee_mandats_artisan_self_read ON public.cee_mandats
  FOR SELECT TO authenticated
  USING (
    lead_id IN (
      SELECT cl.id
      FROM public.cee_leads cl
      WHERE cl.artisan_id IN (
        SELECT p.id FROM public.providers p WHERE p.user_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- H1 — cee_dossiers: retirer admin bypass dans trigger transition (HIGH)
-- Zéro transition illégale, y compris pour admin.
-- Override légitime = RPC SECURITY DEFINER auditée (hors scope PR1).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_dossiers_check_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  allowed boolean := false;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  allowed := CASE OLD.status
    WHEN 'draft'                 THEN NEW.status IN ('submitted_by_artisan','archived')
    WHEN 'submitted_by_artisan'  THEN NEW.status IN ('qa_pending','qa_rejected','archived')
    WHEN 'qa_pending'            THEN NEW.status IN ('qa_approved','qa_rejected')
    WHEN 'qa_rejected'           THEN NEW.status IN ('submitted_by_artisan','archived')
    WHEN 'qa_approved'           THEN NEW.status IN ('deposited','archived')
    WHEN 'deposited'             THEN NEW.status IN ('validated_pncee','rejected_pncee')
    WHEN 'rejected_pncee'        THEN NEW.status IN ('archived')
    WHEN 'validated_pncee'       THEN NEW.status IN ('paid_client','archived')
    WHEN 'paid_client'           THEN NEW.status IN ('commission_due')
    WHEN 'commission_due'        THEN NEW.status IN ('commission_paid')
    WHEN 'commission_paid'       THEN NEW.status IN ('archived')
    ELSE false
  END;

  IF NOT allowed THEN
    RAISE EXCEPTION 'Illegal cee_dossiers status transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- H2 — cee_dossier_events: append-only (HIGH)
-- Audit trail immuable. UPDATE/DELETE interdits même pour admin.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS cee_dossier_events_admin_all ON public.cee_dossier_events;

-- Lecture admin seulement
CREATE POLICY cee_dossier_events_admin_read ON public.cee_dossier_events
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- INSERT admin (écriture via service_role reste libre car RLS bypass)
CREATE POLICY cee_dossier_events_admin_insert ON public.cee_dossier_events
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Trigger append-only (bloque UPDATE + DELETE, même service_role)
CREATE OR REPLACE FUNCTION public.cee_dossier_events_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'cee_dossier_events is append-only (operation: %)', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

DROP TRIGGER IF EXISTS trg_cee_dossier_events_no_update ON public.cee_dossier_events;
CREATE TRIGGER trg_cee_dossier_events_no_update
  BEFORE UPDATE ON public.cee_dossier_events
  FOR EACH ROW EXECUTE FUNCTION public.cee_dossier_events_append_only();

DROP TRIGGER IF EXISTS trg_cee_dossier_events_no_delete ON public.cee_dossier_events;
CREATE TRIGGER trg_cee_dossier_events_no_delete
  BEFORE DELETE ON public.cee_dossier_events
  FOR EACH ROW EXECUTE FUNCTION public.cee_dossier_events_append_only();

-- ---------------------------------------------------------------------------
-- H3 — mv_cee_partners_tam: REVOKE PII exposure (HIGH)
-- MV contient email/phone/siret. MVs ignorent RLS → REVOKE tout accès non service_role.
-- ---------------------------------------------------------------------------
REVOKE ALL ON public.mv_cee_partners_tam FROM PUBLIC;
REVOKE ALL ON public.mv_cee_partners_tam FROM authenticated;
REVOKE ALL ON public.mv_cee_partners_tam FROM anon;
GRANT  SELECT ON public.mv_cee_partners_tam TO service_role;

-- ---------------------------------------------------------------------------
-- M1 — mv_cee_dossiers_stats: restreindre agrégats cross-tenant (MEDIUM)
-- ---------------------------------------------------------------------------
REVOKE ALL ON public.mv_cee_dossiers_stats FROM PUBLIC;
REVOKE ALL ON public.mv_cee_dossiers_stats FROM authenticated;
REVOKE ALL ON public.mv_cee_dossiers_stats FROM anon;
GRANT  SELECT ON public.mv_cee_dossiers_stats TO service_role;

-- ---------------------------------------------------------------------------
-- M2/M3 — Fonctions purge RGPD (MEDIUM)
-- À invoquer par cron Vercel (Pro plan, wrappers dans /api/cron/cee-purge-*).
-- SECURITY DEFINER → exécute avec owner, bypasse RLS pour purge globale.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_purge_email_outbox_dead()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.email_outbox_cee
  WHERE status = 'dead'
    AND dead_letter_at IS NOT NULL
    AND dead_letter_at < now() - interval '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
REVOKE ALL ON FUNCTION public.cee_purge_email_outbox_dead() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_purge_email_outbox_dead() TO service_role;

CREATE OR REPLACE FUNCTION public.cee_purge_expired_rgpd()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  c_dossiers   integer := 0;
  c_leads      integer := 0;
  c_simulator  integer := 0;
  c_mandats    integer := 0;
BEGIN
  DELETE FROM public.cee_dossiers
  WHERE expires_at IS NOT NULL AND expires_at < now()
    AND status IN ('archived','rejected_pncee');
  GET DIAGNOSTICS c_dossiers = ROW_COUNT;

  DELETE FROM public.cee_mandats
  WHERE expires_at IS NOT NULL AND expires_at < now();
  GET DIAGNOSTICS c_mandats = ROW_COUNT;

  DELETE FROM public.cee_leads
  WHERE expires_at IS NOT NULL AND expires_at < now();
  GET DIAGNOSTICS c_leads = ROW_COUNT;

  DELETE FROM public.cee_simulator_events
  WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS c_simulator = ROW_COUNT;

  RETURN jsonb_build_object(
    'dossiers_deleted',   c_dossiers,
    'mandats_deleted',    c_mandats,
    'leads_deleted',      c_leads,
    'simulator_deleted',  c_simulator,
    'purged_at',          now()
  );
END;
$$;
REVOKE ALL ON FUNCTION public.cee_purge_expired_rgpd() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_purge_expired_rgpd() TO service_role;

COMMENT ON FUNCTION public.cee_purge_email_outbox_dead() IS 'RGPD M2: purge email DLQ dead >30j. Invoquer via cron hebdo.';
COMMENT ON FUNCTION public.cee_purge_expired_rgpd()     IS 'RGPD M3: purge dossiers/mandats/leads/simulator_events expirés. Invoquer via cron mensuel.';

COMMIT;

-- ============================================================
-- 434_cee_iban_rpc.sql
-- ============================================================
-- ============================================================================
-- Migration 434 — CEE IBAN RPC (encrypt/decrypt/store atomique)
-- Scope     : SECURITY DEFINER functions pour chiffrement IBAN artisan partner
-- Prérequis : 430_cee_artisan_partners.sql (cee_artisan_partners.iban_encrypted bytea)
-- Sécurité  : search_path verrouillé, pgcrypto, admin JWT check sur decrypt
-- Ref       : docs/cee/HANDOFF_PR2_2026-04-14.md §🚨
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- cee_encrypt_iban : chiffrement symétrique IBAN (usage service_role uniquement)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_encrypt_iban(p_iban text, p_key text)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_iban IS NULL OR length(regexp_replace(p_iban, '\s', '', 'g')) < 14 THEN
    RAISE EXCEPTION 'Invalid IBAN' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_key IS NULL OR length(p_key) < 16 THEN
    RAISE EXCEPTION 'Invalid key' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  RETURN pgp_sym_encrypt(p_iban, p_key);
END;
$$;

REVOKE ALL ON FUNCTION public.cee_encrypt_iban(text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_encrypt_iban(text, text) TO service_role;

COMMENT ON FUNCTION public.cee_encrypt_iban(text, text)
  IS 'Chiffre un IBAN avec pgp_sym_encrypt. service_role uniquement.';

-- ----------------------------------------------------------------------------
-- cee_decrypt_iban : déchiffrement (admin JWT required)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_decrypt_iban(p_encrypted bytea, p_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (auth.jwt() ->> 'role') <> 'admin' THEN
    RAISE EXCEPTION 'admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_encrypted IS NULL THEN
    RAISE EXCEPTION 'Invalid encrypted payload' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_key IS NULL OR length(p_key) < 16 THEN
    RAISE EXCEPTION 'Invalid key' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  RETURN pgp_sym_decrypt(p_encrypted, p_key);
END;
$$;

REVOKE ALL ON FUNCTION public.cee_decrypt_iban(bytea, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_decrypt_iban(bytea, text) TO service_role, authenticated;

COMMENT ON FUNCTION public.cee_decrypt_iban(bytea, text)
  IS 'Déchiffre un IBAN chiffré. Requiert JWT role=admin.';

-- ----------------------------------------------------------------------------
-- cee_store_partner_iban : écriture atomique (recommandé vs encrypt+UPDATE côté Node)
-- Vérifie ownership via auth.uid() = cee_artisan_partners.user_id
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_store_partner_iban(
  p_partner_id uuid,
  p_iban       text,
  p_bic        text,
  p_titulaire  text,
  p_key        text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_iban_clean text;
  v_last4      char(4);
BEGIN
  -- Validation entrée
  IF p_partner_id IS NULL THEN
    RAISE EXCEPTION 'partner_id required' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  v_iban_clean := regexp_replace(COALESCE(p_iban, ''), '\s', '', 'g');
  IF length(v_iban_clean) < 14 THEN
    RAISE EXCEPTION 'Invalid IBAN' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_bic IS NULL OR length(p_bic) NOT IN (8, 11) THEN
    RAISE EXCEPTION 'Invalid BIC' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_titulaire IS NULL OR length(trim(p_titulaire)) = 0 THEN
    RAISE EXCEPTION 'Titulaire required' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_key IS NULL OR length(p_key) < 16 THEN
    RAISE EXCEPTION 'Invalid key' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Ownership check
  IF NOT EXISTS (
    SELECT 1 FROM public.cee_artisan_partners
    WHERE id = p_partner_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not owner' USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_last4 := substring(v_iban_clean from '.{4}$');

  UPDATE public.cee_artisan_partners
  SET iban_encrypted   = pgp_sym_encrypt(v_iban_clean, p_key),
      iban_last4       = v_last4,
      bic              = upper(p_bic),
      titulaire_compte = p_titulaire,
      updated_at       = now()
  WHERE id = p_partner_id;
END;
$$;

REVOKE ALL ON FUNCTION public.cee_store_partner_iban(uuid, text, text, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_store_partner_iban(uuid, text, text, text, text) TO authenticated;

COMMENT ON FUNCTION public.cee_store_partner_iban(uuid, text, text, text, text)
  IS 'Store atomique IBAN chiffré sur cee_artisan_partners. Check ownership via auth.uid().';

COMMIT;

-- ============================================================
-- 435_cee_webhook_events.sql
-- ============================================================
-- ============================================================================
-- Migration 435 — cee_webhook_events (idempotency table for external webhooks)
-- Scope     : Yousign, future CEE webhooks (délégataires, Pipedrive)
-- Prérequis : none (standalone table)
-- Security  : service_role only writes, RLS enabled
-- Ref       : docs/cee/THREAT_MODEL_PR2.md §5 (Test 3 idempotency)
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.cee_webhook_events (
  id          bigserial PRIMARY KEY,
  source      text        NOT NULL CHECK (source IN ('yousign','pipedrive','other')),
  event_id    text        NOT NULL,
  event_type  text,
  payload     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cee_webhook_events_source_event_unique UNIQUE (source, event_id)
);

COMMENT ON TABLE public.cee_webhook_events
  IS 'Registre idempotency webhooks externes. INSERT ON CONFLICT DO NOTHING par (source, event_id).';

CREATE INDEX IF NOT EXISTS idx_cee_webhook_events_source_received
  ON public.cee_webhook_events(source, received_at DESC);

ALTER TABLE public.cee_webhook_events ENABLE ROW LEVEL SECURITY;

-- No authenticated policy: service_role only (bypass RLS). Admin read optional:
DROP POLICY IF EXISTS cee_webhook_events_admin_read ON public.cee_webhook_events;
CREATE POLICY cee_webhook_events_admin_read
  ON public.cee_webhook_events
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

COMMIT;
