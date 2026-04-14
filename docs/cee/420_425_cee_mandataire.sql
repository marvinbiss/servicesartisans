-- ============================================================================
-- DDL COMPLET — Pivot Mandataire CEE — ServicesArtisans
-- Séquence : migrations 420 → 425
-- Cible    : Postgres 15 (Supabase)
-- Prérequis: fonction public.set_updated_at() déjà existante (pattern interne)
-- Exécution: split ce fichier en 6 fichiers (cf. entêtes "-- === FILE: ...")
--           OU exécuter tel quel (tout est idempotent / IF NOT EXISTS)
-- ============================================================================


-- === FILE: supabase/migrations/420_cee_referentiels_temporels.sql ===
BEGIN;

-- ---------------------------------------------------------------------------
-- 420.1  cee_operations_ref — Catalogue des fiches d'opérations standardisées
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_operations_ref (
  code               text PRIMARY KEY,                 -- ex: BAR-TH-171
  libelle            text NOT NULL,
  famille            text NOT NULL,                    -- BAR-TH / BAR-EN / BAR-EQ / ...
  fiche_url          text,                             -- PDF ministère
  date_debut         date NOT NULL,
  date_fin           date,                             -- NULL = toujours en vigueur
  actif              boolean GENERATED ALWAYS AS (
                       CURRENT_DATE >= date_debut
                       AND (date_fin IS NULL OR CURRENT_DATE <= date_fin)
                     ) STORED,
  created_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cee_operations_ref_code_fmt_chk
    CHECK (code ~ '^BAR-[A-Z]{2}-[0-9]{3}$')
);
COMMENT ON TABLE  public.cee_operations_ref IS 'Référentiel des opérations CEE standardisées (BAR-XX-NNN)';
COMMENT ON COLUMN public.cee_operations_ref.actif IS 'Calculé: CURRENT_DATE dans [date_debut, date_fin]';
CREATE INDEX IF NOT EXISTS idx_cee_operations_ref_famille ON public.cee_operations_ref(famille);
CREATE INDEX IF NOT EXISTS idx_cee_operations_ref_actif   ON public.cee_operations_ref(actif) WHERE actif;

-- ---------------------------------------------------------------------------
-- 420.2  cee_forfaits — Barèmes kWh cumac + prime forfaitaire (versionnés)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_forfaits (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_code          text NOT NULL REFERENCES public.cee_operations_ref(code) ON UPDATE CASCADE,
  zone                    text NOT NULL,                   -- H1/H2/H3 ou '*' si indépendant
  categorie_revenus       text NOT NULL,                   -- tres_modeste/modeste/intermediaire/superieur/*
  montant_kwh_cumac       bigint NOT NULL CHECK (montant_kwh_cumac >= 0),
  prime_forfait_eur_cts   integer NOT NULL CHECK (prime_forfait_eur_cts >= 0), -- en centimes
  date_validite_debut     date NOT NULL,
  date_validite_fin       date,
  source_doc              text,                            -- URL arrêté / BOAMP
  created_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cee_forfaits_unique UNIQUE
    (operation_code, zone, categorie_revenus, date_validite_debut)
);
COMMENT ON TABLE  public.cee_forfaits IS 'Barèmes CEE versionnés par opération/zone/revenus/date';
COMMENT ON COLUMN public.cee_forfaits.prime_forfait_eur_cts IS 'Prime forfaitaire en centimes EUR (INTEGER, jamais NUMERIC)';
CREATE INDEX IF NOT EXISTS idx_cee_forfaits_validite_debut ON public.cee_forfaits(date_validite_debut);
CREATE INDEX IF NOT EXISTS idx_cee_forfaits_validite_fin   ON public.cee_forfaits(date_validite_fin);
CREATE INDEX IF NOT EXISTS idx_cee_forfaits_operation     ON public.cee_forfaits(operation_code);

-- ---------------------------------------------------------------------------
-- 420.3  cee_spot_prices — Cotations Emmy (EEX)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_spot_prices (
  id                         bigserial PRIMARY KEY,
  date_cotation              date NOT NULL,
  prix_classique_eur_mwh_cts integer NOT NULL CHECK (prix_classique_eur_mwh_cts >= 0), -- €/MWh cumac en centimes
  prix_precarite_eur_mwh_cts integer NOT NULL CHECK (prix_precarite_eur_mwh_cts >= 0),
  source                     text NOT NULL DEFAULT 'emmy',
  ingested_at                timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cee_spot_prices_unique UNIQUE (date_cotation, source)
);
COMMENT ON TABLE public.cee_spot_prices IS 'Prix spot du kWh cumac scrapés Emmy (classique + précarité)';
CREATE INDEX IF NOT EXISTS idx_cee_spot_prices_date ON public.cee_spot_prices(date_cotation DESC);

-- ---------------------------------------------------------------------------
-- 420.4  revenus_plafonds — Plafonds ANAH/MPR par zone & composition foyer
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.revenus_plafonds (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone                     text NOT NULL CHECK (zone IN ('IDF','HORS_IDF')),
  nb_personnes             smallint NOT NULL CHECK (nb_personnes BETWEEN 1 AND 10),
  plafond_tres_modeste_eur integer NOT NULL,
  plafond_modeste_eur      integer NOT NULL,
  plafond_intermediaire_eur integer NOT NULL,
  plafond_superieur_eur    integer NOT NULL,
  date_validite_debut      date NOT NULL,
  date_validite_fin        date,
  created_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT revenus_plafonds_unique UNIQUE (zone, nb_personnes, date_validite_debut)
);
COMMENT ON TABLE public.revenus_plafonds IS 'Plafonds RFR en euros annuels par zone géo / composition / date';
CREATE INDEX IF NOT EXISTS idx_revenus_plafonds_validite ON public.revenus_plafonds(date_validite_debut);

-- ---------------------------------------------------------------------------
-- 420.5  zones_climatiques_ref — Mapping CP → zone H1/H2/H3
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.zones_climatiques_ref (
  code_postal text PRIMARY KEY CHECK (code_postal ~ '^[0-9]{5}$'),
  zone        text NOT NULL CHECK (zone IN ('H1','H2','H3')),
  note        text,                           -- ex: 'Commune mixte — altitude > 800m'
  updated_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.zones_climatiques_ref IS 'Zone climatique par code postal (CEE/RT)';
CREATE INDEX IF NOT EXISTS idx_zones_climatiques_zone ON public.zones_climatiques_ref(zone);

COMMIT;


-- === FILE: supabase/migrations/421_cee_enums.sql ===
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

COMMIT;


-- === FILE: supabase/migrations/422_devis_extensions_cee.sql ===
BEGIN;

ALTER TABLE public.devis
  ADD COLUMN IF NOT EXISTS cee_eligible           boolean    NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cee_operation_code     text,
  ADD COLUMN IF NOT EXISTS cee_forfait_id         uuid,
  ADD COLUMN IF NOT EXISTS cee_prime_estimee_cts  integer    CHECK (cee_prime_estimee_cts IS NULL OR cee_prime_estimee_cts >= 0),
  ADD COLUMN IF NOT EXISTS cee_prime_version      text,       -- hash du barème appliqué
  ADD COLUMN IF NOT EXISTS cee_lead_id            uuid,
  ADD COLUMN IF NOT EXISTS cee_detected_at        timestamptz,
  ADD COLUMN IF NOT EXISTS cee_detector_version   text;

-- FK operation_code (après ADD COLUMN)
DO $$ BEGIN
  ALTER TABLE public.devis
    ADD CONSTRAINT devis_cee_operation_code_fkey
    FOREIGN KEY (cee_operation_code) REFERENCES public.cee_operations_ref(code) ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.devis
    ADD CONSTRAINT devis_cee_forfait_id_fkey
    FOREIGN KEY (cee_forfait_id) REFERENCES public.cee_forfaits(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.devis
    ADD CONSTRAINT devis_cee_operation_code_fmt_chk
    CHECK (cee_operation_code IS NULL OR cee_operation_code ~ '^BAR-[A-Z]{2}-[0-9]{3}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_devis_cee_eligible
  ON public.devis(created_at DESC) WHERE cee_eligible;
CREATE INDEX IF NOT EXISTS idx_devis_cee_operation ON public.devis(cee_operation_code);
CREATE INDEX IF NOT EXISTS idx_devis_cee_lead_id   ON public.devis(cee_lead_id);

COMMENT ON COLUMN public.devis.cee_prime_estimee_cts IS 'Prime CEE estimée en centimes (snapshot au moment du devis)';
COMMENT ON COLUMN public.devis.cee_prime_version      IS 'Hash stable du barème appliqué (audit)';

COMMIT;


-- === FILE: supabase/migrations/423_providers_mar_extensions.sql ===
BEGIN;

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS is_mar_agree        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mar_source_id       text,
  ADD COLUMN IF NOT EXISTS mar_last_seen_at    timestamptz,
  ADD COLUMN IF NOT EXISTS mar_imported_at     timestamptz,
  ADD COLUMN IF NOT EXISTS mar_revoked_at      timestamptz,
  ADD COLUMN IF NOT EXISTS mar_qualifications  jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.providers.is_mar_agree IS 'Mon Accompagnateur Rénov''— agrément actif';
COMMENT ON COLUMN public.providers.mar_qualifications IS 'Détails agrément MAR (numéro, périmètre, dates)';

CREATE INDEX IF NOT EXISTS idx_providers_mar_agree
  ON public.providers(department) WHERE is_mar_agree;
CREATE INDEX IF NOT EXISTS idx_providers_siren ON public.providers(siren);

-- Staging d'import MAR (pattern atomic swap ADEME)
CREATE TABLE IF NOT EXISTS public.mar_staging (
  id              bigserial PRIMARY KEY,
  siret           text NOT NULL,
  siren           text,
  raison_sociale  text,
  source_id       text,
  fetched_at      timestamptz NOT NULL DEFAULT now(),
  import_run_id   uuid NOT NULL
);
COMMENT ON TABLE public.mar_staging IS 'Staging import MAR — purgé post-swap';
CREATE INDEX IF NOT EXISTS idx_mar_staging_run   ON public.mar_staging(import_run_id);
CREATE INDEX IF NOT EXISTS idx_mar_staging_siret ON public.mar_staging(siret);

COMMIT;


-- === FILE: supabase/migrations/424_cee_leads_mandats.sql ===
BEGIN;

-- ---------------------------------------------------------------------------
-- 424.1  cee_leads — Table centrale du funnel mandataire
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_leads (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- PII (brutes + hash)
  nom                   text,
  prenom                text,
  email                 text,
  email_hash            text GENERATED ALWAYS AS
                          (encode(digest(lower(coalesce(email,'')), 'sha256'), 'hex')) STORED,
  telephone_e164        text CHECK (telephone_e164 IS NULL OR telephone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  adresse               text,
  code_postal           text CHECK (code_postal IS NULL OR code_postal ~ '^[0-9]{5}$'),
  ville                 text,
  zone_climatique       public.zone_climatique,             -- résolue via zones_climatiques_ref

  -- Foyer
  nb_personnes          smallint CHECK (nb_personnes IS NULL OR nb_personnes BETWEEN 1 AND 10),
  revenu_fiscal_ref_eur integer,
  categorie_revenus     public.categorie_revenus,

  -- Opération CEE
  operation_code        text REFERENCES public.cee_operations_ref(code),
  forfait_id            uuid REFERENCES public.cee_forfaits(id) ON DELETE SET NULL,   -- snapshot barème
  plafond_revenus_id    uuid REFERENCES public.revenus_plafonds(id) ON DELETE SET NULL, -- snapshot plafond

  -- Primes (toutes en centimes)
  prime_estimee_cts     integer CHECK (prime_estimee_cts IS NULL OR prime_estimee_cts >= 0),
  prime_finale_cts      integer CHECK (prime_finale_cts  IS NULL OR prime_finale_cts  >= 0),

  -- Affectation
  artisan_id            uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  devis_id              uuid REFERENCES public.devis(id) ON DELETE SET NULL,
  pipedrive_person_id   bigint,
  pipedrive_deal_id     bigint,

  -- Workflow
  source                text NOT NULL DEFAULT 'simulator',
  status                public.cee_lead_status NOT NULL DEFAULT 'simulation',
  duplicate_of          uuid REFERENCES public.cee_leads(id) ON DELETE SET NULL,

  -- Timestamps
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  expires_at            timestamptz NOT NULL DEFAULT (now() + INTERVAL '3 years')
);

COMMENT ON TABLE  public.cee_leads IS 'Lead CEE — funnel simulateur → paiement. PII + hash email pour dédoublonnage.';
COMMENT ON COLUMN public.cee_leads.email_hash IS 'SHA-256(lower(email)) — dédoublonnage sans exposer la PII';
COMMENT ON COLUMN public.cee_leads.telephone_e164 IS 'Normalisé E.164 strictement (ex: +33612345678)';
COMMENT ON COLUMN public.cee_leads.forfait_id IS 'Snapshot du barème appliqué (ne change pas si cee_forfaits évolue)';
COMMENT ON COLUMN public.cee_leads.expires_at IS 'Purge RGPD — 3 ans après création';

CREATE INDEX IF NOT EXISTS idx_cee_leads_status      ON public.cee_leads(status);
CREATE INDEX IF NOT EXISTS idx_cee_leads_created_at  ON public.cee_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_leads_artisan     ON public.cee_leads(artisan_id);
CREATE INDEX IF NOT EXISTS idx_cee_leads_operation   ON public.cee_leads(operation_code);
CREATE INDEX IF NOT EXISTS idx_cee_leads_expires_at  ON public.cee_leads(expires_at);

-- Dédoublonnage : même email_hash + opération dans les 24h glissantes
CREATE UNIQUE INDEX IF NOT EXISTS uniq_cee_leads_dedup_24h
  ON public.cee_leads (email_hash, operation_code)
  WHERE created_at > (now() - INTERVAL '24 hours') AND duplicate_of IS NULL;

-- Trigger updated_at (fonction pré-existante)
DROP TRIGGER IF EXISTS trg_cee_leads_updated_at ON public.cee_leads;
CREATE TRIGGER trg_cee_leads_updated_at
  BEFORE UPDATE ON public.cee_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.cee_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_leads_admin_all         ON public.cee_leads;
DROP POLICY IF EXISTS cee_leads_artisan_select_own ON public.cee_leads;
DROP POLICY IF EXISTS cee_leads_anon_deny         ON public.cee_leads;

CREATE POLICY cee_leads_admin_all ON public.cee_leads
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY cee_leads_artisan_select_own ON public.cee_leads
  FOR SELECT TO authenticated
  USING (artisan_id::text = (auth.jwt() ->> 'provider_id'));

-- Anon : aucune policy => deny by default (accès API service_role uniquement)

-- ---------------------------------------------------------------------------
-- 424.2  cee_mandats — Mandats signés pour dépôt CEE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_mandats (
  id                                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id                            uuid NOT NULL REFERENCES public.cee_leads(id) ON DELETE RESTRICT,
  ppee_numero                        text,                -- numéro PPEE côté obligé
  signed_at                          timestamptz NOT NULL,
  bordereau_retractation_signed_at   timestamptz,
  retractation_possible_jusque       timestamptz,         -- J+14
  status                             text NOT NULL DEFAULT 'signe',
  docusign_envelope_id               text,
  created_at                         timestamptz NOT NULL DEFAULT now(),
  updated_at                         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cee_mandats_status_chk CHECK
    (status IN ('signe','retracte','depose','valide','refuse','annule'))
);
COMMENT ON TABLE public.cee_mandats IS 'Mandats signés client → SAS mandataire CEE';
CREATE INDEX IF NOT EXISTS idx_cee_mandats_lead      ON public.cee_mandats(lead_id);
CREATE INDEX IF NOT EXISTS idx_cee_mandats_signed_at ON public.cee_mandats(signed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_mandats_status    ON public.cee_mandats(status);

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

-- FK tardive : devis.cee_lead_id → cee_leads(id) (maintenant que la table existe)
DO $$ BEGIN
  ALTER TABLE public.devis
    ADD CONSTRAINT devis_cee_lead_id_fkey
    FOREIGN KEY (cee_lead_id) REFERENCES public.cee_leads(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;


-- === FILE: supabase/migrations/425_cee_observability_outbox.sql ===
BEGIN;

-- Requis pour digest() utilisé dans 424 (ip_hash ci-dessous + email_hash)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 425.1  cee_simulator_events — Funnel analytics (90 jours)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_simulator_events (
  id           bigserial PRIMARY KEY,
  session_id   uuid NOT NULL,
  lead_id      uuid REFERENCES public.cee_leads(id) ON DELETE SET NULL,
  step         smallint NOT NULL CHECK (step BETWEEN 1 AND 4),
  event_type   text NOT NULL,                    -- view / submit / abandon / error
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_hash      text,                             -- SHA-256 côté app (anonymisé)
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL DEFAULT (now() + INTERVAL '90 days')
);
COMMENT ON TABLE public.cee_simulator_events IS 'Événements funnel simulateur CEE (purge 90j)';
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_session    ON public.cee_simulator_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_lead       ON public.cee_simulator_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_created_at ON public.cee_simulator_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_sim_events_expires_at ON public.cee_simulator_events(expires_at);

-- ---------------------------------------------------------------------------
-- 425.2  email_outbox_cee — Outbox transactionnelle Brevo
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_outbox_cee (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template        text NOT NULL,
  recipient       text NOT NULL,
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','sent','failed','dead')),
  retries         smallint NOT NULL DEFAULT 0,
  next_retry_at   timestamptz NOT NULL DEFAULT now(),
  last_error      text,
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.email_outbox_cee IS 'Outbox emails transactionnels CEE (cron retry 6h — pattern Pipedrive)';
CREATE INDEX IF NOT EXISTS idx_email_outbox_cee_pending
  ON public.email_outbox_cee(next_retry_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_outbox_cee_created ON public.email_outbox_cee(created_at DESC);

-- ---------------------------------------------------------------------------
-- 425.3  Vues matérialisées
-- ---------------------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS public.v_cee_funnel_conversion;
CREATE MATERIALIZED VIEW public.v_cee_funnel_conversion AS
SELECT
  date_trunc('day', created_at)::date AS jour,
  step,
  count(*)                            AS events,
  count(DISTINCT session_id)          AS sessions
FROM public.cee_simulator_events
WHERE created_at > now() - INTERVAL '90 days'
GROUP BY 1,2
ORDER BY 1 DESC, 2;
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

COMMIT;

-- ============================================================================
-- FIN DDL — Appliquer via `supabase db push` ou SQL editor (split par BEGIN/COMMIT)
-- ============================================================================
