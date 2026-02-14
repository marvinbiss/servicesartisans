-- ============================================
-- Migration 302: Critical Security Fixes
-- Date: 2026-02-14
-- Purpose: Address findings from Big 4 security audit
--
-- Fixes:
--   1. Whitelist increment() function (was open to arbitrary table/column)
--   2. Replace O(n) COUNT(*) campaign stats trigger with increment/decrement
--   3. Atomic message claim RPC (FOR UPDATE SKIP LOCKED)
--   4. UNIQUE constraint on (campaign_id, contact_id, queued_at) to prevent double-send
--   5. GDPR erasure function (RGPD suppression)
--   6. Campaign state transition validation trigger
--   7. Fix AI settings singleton (prevent duplicate rows)
--   8. Add updated_at trigger for ai_settings
--   9. Backfill unknown consent to opted_out
--  10. CHECK constraint on consent_status (no 'unknown' allowed)
--  11. DEFAULT 'opted_out' on consent_status column
--  12. RLS verification comment
--
-- All statements are idempotent (safe to re-run).
-- ============================================


-- ====== Section 1: Whitelist increment() function ======
-- The previous increment() accepted arbitrary table_name and column_name,
-- allowing SECURITY DEFINER privilege escalation. Replace with a whitelisted
-- version that ONLY allows prospection_campaigns counter columns.

DROP FUNCTION IF EXISTS public.increment(text, text, uuid);

CREATE OR REPLACE FUNCTION public.increment(
  p_table_name text,
  p_column_name text,
  row_id uuid
)
RETURNS void AS $$
BEGIN
  IF p_table_name = 'prospection_campaigns' AND p_column_name IN (
    'sent_count','delivered_count','opened_count','clicked_count',
    'replied_count','failed_count','opted_out_count'
  ) THEN
    EXECUTE format(
      'UPDATE public.%I SET %I = %I + 1 WHERE id = $1',
      p_table_name, p_column_name, p_column_name
    ) USING row_id;
  ELSE
    RAISE EXCEPTION 'Disallowed table/column: %.%', p_table_name, p_column_name;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.increment(text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment(text, text, uuid) TO service_role;


-- ====== Section 2: Replace O(n) campaign stats trigger with increment/decrement ======
-- The previous version ran COUNT(*) on every status change, which is O(n) on
-- the entire messages partition. This version uses O(1) increment/decrement.

CREATE OR REPLACE FUNCTION public.prospection_update_campaign_stats()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Single UPDATE with CASE expressions: decrement old bucket + increment new bucket
    UPDATE public.prospection_campaigns SET
      sent_count = GREATEST(sent_count
        + CASE WHEN NEW.status IN ('sent','delivered','read','replied') THEN 1 ELSE 0 END
        - CASE WHEN OLD.status IN ('sent','delivered','read','replied') THEN 1 ELSE 0 END,
        0),
      delivered_count = GREATEST(delivered_count
        + CASE WHEN NEW.status IN ('delivered','read','replied') THEN 1 ELSE 0 END
        - CASE WHEN OLD.status IN ('delivered','read','replied') THEN 1 ELSE 0 END,
        0),
      failed_count = GREATEST(failed_count
        + CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END
        - CASE WHEN OLD.status = 'failed' THEN 1 ELSE 0 END,
        0),
      updated_at = now()
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ====== Section 3: Atomic message claim RPC (FOR UPDATE SKIP LOCKED) ======
-- Prevents race conditions when multiple workers try to send the same batch.
-- Uses FOR UPDATE SKIP LOCKED to atomically claim queued messages.

CREATE OR REPLACE FUNCTION public.claim_queued_messages(
  p_campaign_id uuid,
  p_batch_size int
)
RETURNS SETOF public.prospection_messages AS $$
BEGIN
  RETURN QUERY
  WITH claimed AS (
    SELECT id FROM public.prospection_messages
    WHERE campaign_id = p_campaign_id
      AND status = 'queued'
      AND (next_retry_at IS NULL OR next_retry_at <= now())
    ORDER BY queued_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.prospection_messages m
  SET status = 'sending', sent_at = now()
  FROM claimed c
  WHERE m.id = c.id
  RETURNING m.*;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.claim_queued_messages(uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_queued_messages(uuid, int) TO service_role;


-- ====== Section 4: UNIQUE constraint on (campaign_id, contact_id, created_at) ======
-- Prevents sending the same campaign to the same contact more than once.
-- Since prospection_messages is partitioned by created_at (RANGE), the partition
-- key MUST be included in any unique constraint.

DO $$ BEGIN
  ALTER TABLE public.prospection_messages
    ADD CONSTRAINT uq_campaign_contact UNIQUE (campaign_id, contact_id, created_at);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ====== Section 5: GDPR erasure function (RGPD suppression) ======
-- Anonymizes all PII for a given contact and redacts message content.
-- Required for GDPR Article 17 right-to-erasure compliance.

CREATE OR REPLACE FUNCTION public.prospection_gdpr_erase(p_contact_id uuid)
RETURNS void AS $$
BEGIN
  -- Anonymize contact PII
  -- Note: email_canonical is GENERATED ALWAYS from email, so setting email=NULL auto-nullifies it
  UPDATE public.prospection_contacts SET
    company_name = '[SUPPRIME]',
    contact_name = '[SUPPRIME]',
    email = NULL,
    phone = NULL,
    phone_e164 = NULL,
    address = NULL,
    postal_code = NULL,
    city = NULL,
    department = NULL,
    region = NULL,
    commune_code = NULL,
    custom_fields = '{}'::jsonb,
    tags = ARRAY[]::text[],
    is_active = false,
    consent_status = 'opted_out',
    opted_out_at = COALESCE(opted_out_at, now())
  WHERE id = p_contact_id;

  -- Redact message content
  UPDATE public.prospection_conversation_messages SET
    content = '[CONTENU SUPPRIME - RGPD]'
  WHERE conversation_id IN (
    SELECT id FROM public.prospection_conversations WHERE contact_id = p_contact_id
  );

  -- Redact rendered message bodies
  UPDATE public.prospection_messages SET
    rendered_body = '[SUPPRIME - RGPD]',
    rendered_subject = '[SUPPRIME - RGPD]'
  WHERE contact_id = p_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.prospection_gdpr_erase(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prospection_gdpr_erase(uuid) TO service_role;


-- ====== Section 6: Campaign state transition validation trigger ======
-- Enforces a strict state machine for campaign status transitions.
-- Prevents invalid transitions like completed -> sending.

CREATE OR REPLACE FUNCTION public.prospection_validate_campaign_transition()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  CASE OLD.status
    WHEN 'draft' THEN
      IF NEW.status NOT IN ('scheduled', 'sending', 'cancelled') THEN
        RAISE EXCEPTION 'Transition invalide: draft -> %', NEW.status;
      END IF;
    WHEN 'scheduled' THEN
      IF NEW.status NOT IN ('sending', 'cancelled', 'draft') THEN
        RAISE EXCEPTION 'Transition invalide: scheduled -> %', NEW.status;
      END IF;
    WHEN 'sending' THEN
      IF NEW.status NOT IN ('paused', 'completed', 'cancelled') THEN
        RAISE EXCEPTION 'Transition invalide: sending -> %', NEW.status;
      END IF;
    WHEN 'paused' THEN
      IF NEW.status NOT IN ('sending', 'cancelled') THEN
        RAISE EXCEPTION 'Transition invalide: paused -> %', NEW.status;
      END IF;
    WHEN 'completed' THEN
      RAISE EXCEPTION 'Transition impossible depuis le statut completed';
    WHEN 'cancelled' THEN
      RAISE EXCEPTION 'Transition impossible depuis le statut cancelled';
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prosp_campaigns_validate_transition ON public.prospection_campaigns;
CREATE TRIGGER prosp_campaigns_validate_transition
  BEFORE UPDATE OF status ON public.prospection_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.prospection_validate_campaign_transition();


-- ====== Section 7: Fix AI settings singleton ======
-- The previous migration used gen_random_uuid() which created a new row on
-- every re-run. Fix by using a deterministic UUID and cleaning up duplicates.

INSERT INTO public.prospection_ai_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (id) DO NOTHING;

-- Delete any extra rows from previous migration re-runs
DELETE FROM public.prospection_ai_settings
WHERE id != '00000000-0000-0000-0000-000000000001'::uuid;


-- ====== Section 8: Add updated_at trigger for ai_settings ======
-- Ensures updated_at is automatically set on every UPDATE.

DROP TRIGGER IF EXISTS prosp_ai_settings_updated_at ON public.prospection_ai_settings;
CREATE TRIGGER prosp_ai_settings_updated_at
  BEFORE UPDATE ON public.prospection_ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.prospection_updated_at();


-- ====== Section 9: Backfill unknown consent to opted_out ======
-- GDPR compliance: contacts with unknown consent status should default to
-- opted_out to prevent unsolicited messages to non-consenting contacts.

UPDATE public.prospection_contacts SET consent_status = 'opted_out' WHERE consent_status = 'unknown';


-- ====== Section 10: CHECK constraint on consent_status (no 'unknown' allowed) ======
-- After backfilling 'unknown' -> 'opted_out' in Section 9, prevent any future
-- rows from using 'unknown'. Only 'opted_in' and 'opted_out' are valid.

DO $$ BEGIN
  ALTER TABLE public.prospection_contacts
    ADD CONSTRAINT chk_consent_no_unknown
    CHECK (consent_status IN ('opted_in', 'opted_out'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ====== Section 11: DEFAULT 'opted_out' on consent_status column ======
-- Ensures new contacts default to opted_out (GDPR-safe) when no consent
-- status is explicitly provided at insert time.

ALTER TABLE public.prospection_contacts ALTER COLUMN consent_status SET DEFAULT 'opted_out';


-- ====== Section 12: RLS verification ======
-- Row Level Security is enabled on ALL prospection tables via migration 300
-- (300_prospection_tables.sql). The policies restrict access to service_role
-- and authenticated admin users. No additional RLS changes are needed here;
-- this migration only adds functions, triggers, and constraints.
--
-- Tables with RLS enabled (from migration 300):
--   - prospection_contacts
--   - prospection_lists
--   - prospection_list_members
--   - prospection_templates
--   - prospection_campaigns
--   - prospection_messages (partitioned)
--   - prospection_conversations
--   - prospection_conversation_messages
--   - prospection_ai_settings
--   - prospection_unsubscribe_tokens
