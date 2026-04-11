-- ============================================
-- Migration 395: Prospection Purge Audit (RGPD Art. 5.1.e)
-- Conservation limitée : 3 ans après dernier contact actif
-- Double seuil : archive intermédiaire purgée hard après 5 ans
-- ============================================

-- ============================================
-- 1. TABLE: prospection_purge_log
-- Audit trail des exécutions du cron de purge
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_purge_log (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at                  timestamptz NOT NULL DEFAULT now(),
  contacts_soft_deleted   integer NOT NULL DEFAULT 0,
  contacts_hard_deleted   integer NOT NULL DEFAULT 0,
  oldest_activity_cutoff  date,
  duration_ms             integer,
  error_message           text NULL,
  dry_run                 boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS prospection_purge_log_run_at_idx
  ON public.prospection_purge_log(run_at DESC);

-- ============================================
-- 2. TABLE: prospection_contacts_archive
-- Copie exacte de prospection_contacts + archived_at
-- Conservation intermédiaire (5 ans max) pour preuve en cas de contestation
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_contacts_archive (
  id              uuid PRIMARY KEY,
  contact_type    text NOT NULL,
  company_name    text,
  contact_name    text,
  email           text,
  email_canonical text,
  phone           text,
  phone_e164      text,
  address         text,
  postal_code     text,
  city            text,
  department      text,
  region          text,
  commune_code    text,
  population      integer,
  artisan_id      uuid,
  source          text,
  source_file     text,
  source_row      integer,
  tags            text[] DEFAULT '{}',
  custom_fields   jsonb DEFAULT '{}'::jsonb,
  consent_status  text,
  opted_out_at    timestamptz,
  is_active       boolean,
  created_at      timestamptz,
  updated_at      timestamptz,
  archived_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prospection_contacts_archive_archived_at_idx
  ON public.prospection_contacts_archive(archived_at);

-- ============================================
-- 3. RLS : service_role only
-- Les routes API admin utilisent createAdminClient() (service_role)
-- ============================================
ALTER TABLE public.prospection_purge_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospection_contacts_archive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON public.prospection_purge_log;
CREATE POLICY "Service role full access" ON public.prospection_purge_log
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON public.prospection_contacts_archive;
CREATE POLICY "Service role full access" ON public.prospection_contacts_archive
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- NOTE : Pas de cascade de suppression sur prospection_messages
-- L'historique d'envoi est conservé par design (preuve en cas de contrôle CNIL).
-- Le soft-delete de prospection_contacts anonymise email/phone/custom_fields
-- mais garde l'id pour cohérence FK avec prospection_messages.contact_id.
-- ============================================
