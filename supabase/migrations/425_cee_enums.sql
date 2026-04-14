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
