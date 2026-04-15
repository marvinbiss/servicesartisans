-- =============================================================================
-- Migration 446 : Consolidation des tables créées hors migrations/
-- =============================================================================
-- Date     : 2026-04-15
-- Contexte : Tables créées en prod via Supabase SQL editor — on les rapatrie
--            ici pour que supabase/migrations/ redevienne source de vérité.
--            Migration IDEMPOTENTE : IF NOT EXISTS partout, safe à ré-appliquer.
--
-- Source   : scripts/prod-schema-dump.sql (généré via pg connection directe)
--
-- Tables consolidées :
--   - cee_dossiers           (dossiers CEE principal)
--   - cee_dossier_events     (audit trail)
--   - access_logs            (logs d'accès HTTP)
--
-- Tables phantoms (référencées en code mais inexistantes en prod — ignore-list) :
--   - platform_settings, prospection_contacts_archive,
--     message_attachments, admin_users
--   → À nettoyer en follow-up (dead code), pas à créer.
-- =============================================================================

-- =============================================================================
-- ENUMS
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.categorie_revenus AS ENUM ('tres_modeste', 'modeste', 'intermediaire', 'superieur');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cee_dossier_status AS ENUM (
    'draft', 'submitted_by_artisan', 'qa_pending', 'qa_approved', 'qa_rejected',
    'deposited', 'validated', 'rejected_pncee', 'paid_client', 'commission_due',
    'commission_paid', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cee_lead_status AS ENUM (
    'simulation', 'qualifie', 'transmis_artisan', 'devis_envoye', 'devis_signe',
    'mandat_signe', 'dossier_cee_depose', 'paye', 'perdu', 'doublon'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cee_partner_status AS ENUM (
    'invited', 'onboarding', 'convention_sent', 'convention_signed', 'training',
    'certified', 'active', 'suspended', 'revoked'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.zone_climatique AS ENUM ('H1', 'H2', 'H3');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- TABLE: cee_dossiers
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cee_dossiers (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "reference" text NOT NULL,
  "partner_id" uuid NOT NULL,
  "provider_id" uuid NOT NULL,
  "client_nom_encrypted" bytea NOT NULL,
  "client_prenom_encrypted" bytea NOT NULL,
  "client_email_encrypted" bytea NOT NULL,
  "client_email_hash" text,
  "client_telephone_encrypted" bytea,
  "client_adresse_encrypted" bytea NOT NULL,
  "client_code_postal" text NOT NULL,
  "client_commune_insee" text NOT NULL,
  "foyer_personnes" smallint NOT NULL,
  "revenus_categorie" categorie_revenus NOT NULL,
  "rfr_declared_cts" bigint,
  "operation_code" text NOT NULL,
  "type_travaux" text NOT NULL,
  "surface_m2" numeric,
  "annee_construction" smallint,
  "energie_remplacee" text,
  "montant_ht_cts" bigint NOT NULL,
  "montant_ttc_cts" bigint NOT NULL,
  "date_devis" date NOT NULL,
  "date_chantier_prevue" date,
  "date_chantier_realisee" date,
  "forfait_id" bigint NOT NULL,
  "forfait_version" text NOT NULL,
  "prime_cee_cts" bigint NOT NULL,
  "prime_mpr_cts" bigint,
  "prime_total_cts" bigint,
  "reste_a_charge_cts" bigint,
  "delegataire" text,
  "delegataire_reference" text,
  "delegataire_submission_at" timestamp with time zone,
  "delegataire_response_at" timestamp with time zone,
  "delegataire_response_status" text,
  "delegataire_response_motif" text,
  "pncee_reference" text,
  "status" cee_dossier_status NOT NULL DEFAULT 'draft'::cee_dossier_status,
  "qa_score" smallint,
  "qa_reviewer_id" uuid,
  "qa_reviewed_at" timestamp with time zone,
  "qa_notes" text,
  "commission_rate" numeric NOT NULL,
  "commission_amount_cts" bigint,
  "commission_status" text NOT NULL DEFAULT 'pending'::text,
  "commission_paid_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "expires_at" timestamp with time zone NOT NULL DEFAULT (now() + '10 years'::interval),
  CONSTRAINT cee_dossiers_pkey PRIMARY KEY (id),
  CONSTRAINT cee_dossiers_reference_key UNIQUE (reference)
);

-- FKs : wrapped in DO blocks pour idempotence
DO $$ BEGIN
  ALTER TABLE public.cee_dossiers
    ADD CONSTRAINT cee_dossiers_client_commune_insee_fkey
    FOREIGN KEY (client_commune_insee) REFERENCES public.zones_climatiques_ref (code_insee);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.cee_dossiers
    ADD CONSTRAINT cee_dossiers_forfait_id_fkey
    FOREIGN KEY (forfait_id) REFERENCES public.cee_forfaits (id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.cee_dossiers
    ADD CONSTRAINT cee_dossiers_operation_code_fkey
    FOREIGN KEY (operation_code) REFERENCES public.cee_operations_ref (code);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.cee_dossiers
    ADD CONSTRAINT cee_dossiers_partner_id_fkey
    FOREIGN KEY (partner_id) REFERENCES public.cee_artisan_partners (id) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.cee_dossiers
    ADD CONSTRAINT cee_dossiers_provider_id_fkey
    FOREIGN KEY (provider_id) REFERENCES public.providers (id) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.cee_dossiers
    ADD CONSTRAINT cee_dossiers_qa_reviewer_id_fkey
    FOREIGN KEY (qa_reviewer_id) REFERENCES public.users (id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_deleg ON public.cee_dossiers
  USING btree (delegataire, delegataire_submission_at)
  WHERE (status = ANY (ARRAY['deposited'::cee_dossier_status, 'validated'::cee_dossier_status, 'rejected_pncee'::cee_dossier_status]));
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_email_hash ON public.cee_dossiers USING btree (client_email_hash);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_expires_at ON public.cee_dossiers USING btree (expires_at);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_operation ON public.cee_dossiers USING btree (operation_code);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_partner_status ON public.cee_dossiers USING btree (partner_id, status);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_provider ON public.cee_dossiers USING btree (provider_id);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_qa_queue ON public.cee_dossiers USING btree (created_at)
  WHERE (status = 'qa_pending'::cee_dossier_status);

-- =============================================================================
-- TABLE: cee_dossier_events
-- =============================================================================

CREATE SEQUENCE IF NOT EXISTS public.cee_dossier_events_id_seq;

CREATE TABLE IF NOT EXISTS public.cee_dossier_events (
  "id" bigint NOT NULL DEFAULT nextval('cee_dossier_events_id_seq'::regclass),
  "dossier_id" uuid NOT NULL,
  "event_type" text NOT NULL,
  "actor_id" uuid,
  "actor_role" text,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cee_dossier_events_pkey PRIMARY KEY (id)
);

DO $$ BEGIN
  ALTER TABLE public.cee_dossier_events
    ADD CONSTRAINT cee_dossier_events_actor_id_fkey
    FOREIGN KEY (actor_id) REFERENCES public.users (id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.cee_dossier_events
    ADD CONSTRAINT cee_dossier_events_dossier_id_fkey
    FOREIGN KEY (dossier_id) REFERENCES public.cee_dossiers (id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_cee_dossier_events_dossier ON public.cee_dossier_events
  USING btree (dossier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_dossier_events_type ON public.cee_dossier_events USING btree (event_type);

-- =============================================================================
-- TABLE: access_logs
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.access_logs (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "path" text NOT NULL,
  "method" text NOT NULL DEFAULT 'GET'::text,
  "status_code" integer,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT access_logs_pkey PRIMARY KEY (id)
);

-- =============================================================================
-- RLS
-- =============================================================================

ALTER TABLE public.cee_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cee_dossier_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "admin_access_logs_read" ON public.access_logs
    FOR SELECT USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "cee_dossier_events_admin_insert" ON public.cee_dossier_events
    FOR INSERT TO authenticated
    WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "cee_dossier_events_admin_read" ON public.cee_dossier_events
    FOR SELECT TO authenticated
    USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "cee_dossier_events_artisan_self_read" ON public.cee_dossier_events
    FOR SELECT TO authenticated
    USING (dossier_id IN (
      SELECT cee_dossiers.id FROM cee_dossiers
      WHERE cee_dossiers.partner_id IN (
        SELECT cee_artisan_partners.id FROM cee_artisan_partners
        WHERE cee_artisan_partners.user_id = auth.uid()
      )
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "cee_dossiers_admin_all" ON public.cee_dossiers
    FOR ALL TO authenticated
    USING (((auth.jwt() ->> 'role'::text) = 'admin'::text))
    WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "cee_dossiers_artisan_insert" ON public.cee_dossiers
    FOR INSERT TO authenticated
    WITH CHECK (partner_id IN (
      SELECT cee_artisan_partners.id FROM cee_artisan_partners
      WHERE cee_artisan_partners.user_id = auth.uid()
        AND cee_artisan_partners.status = 'active'::cee_partner_status
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "cee_dossiers_artisan_self_read" ON public.cee_dossiers
    FOR SELECT TO authenticated
    USING (partner_id IN (
      SELECT cee_artisan_partners.id FROM cee_artisan_partners
      WHERE cee_artisan_partners.user_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "cee_dossiers_artisan_update_draft" ON public.cee_dossiers
    FOR UPDATE TO authenticated
    USING (
      partner_id IN (
        SELECT cee_artisan_partners.id FROM cee_artisan_partners
        WHERE cee_artisan_partners.user_id = auth.uid()
      )
      AND status = ANY (ARRAY['draft'::cee_dossier_status, 'qa_rejected'::cee_dossier_status])
    )
    WITH CHECK (
      partner_id IN (
        SELECT cee_artisan_partners.id FROM cee_artisan_partners
        WHERE cee_artisan_partners.user_id = auth.uid()
      )
      AND status = ANY (ARRAY['draft'::cee_dossier_status, 'submitted_by_artisan'::cee_dossier_status, 'qa_rejected'::cee_dossier_status])
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
