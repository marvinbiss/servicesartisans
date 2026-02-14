-- ============================================
-- Migration 301: Prospection Schema Hardening
-- Patches the schema created in 300_prospection_schema.sql
-- Adds missing FKs, CHECK constraints, indexes, validation triggers,
-- content length limits, artisan_id FK, increment RPC, and DOM-TOM phone support
-- ============================================

-- ============================================
-- 1. MISSING FOREIGN KEYS on prospection_campaigns
-- Add ON DELETE SET NULL behavior for template and list references
-- ============================================

ALTER TABLE public.prospection_campaigns
  DROP CONSTRAINT IF EXISTS prospection_campaigns_template_id_fkey,
  ADD CONSTRAINT prospection_campaigns_template_id_fkey
    FOREIGN KEY (template_id) REFERENCES public.prospection_templates(id) ON DELETE SET NULL;

ALTER TABLE public.prospection_campaigns
  DROP CONSTRAINT IF EXISTS prospection_campaigns_list_id_fkey,
  ADD CONSTRAINT prospection_campaigns_list_id_fkey
    FOREIGN KEY (list_id) REFERENCES public.prospection_lists(id) ON DELETE SET NULL;

ALTER TABLE public.prospection_campaigns
  DROP CONSTRAINT IF EXISTS prospection_campaigns_ab_variant_b_template_id_fkey,
  ADD CONSTRAINT prospection_campaigns_ab_variant_b_template_id_fkey
    FOREIGN KEY (ab_variant_b_template_id) REFERENCES public.prospection_templates(id) ON DELETE SET NULL;

-- ============================================
-- 2. CHECK CONSTRAINTS for valid ranges
-- ============================================

-- prospection_campaigns: batch_size must be 1-10000
DO $$ BEGIN
  ALTER TABLE public.prospection_campaigns ADD CONSTRAINT chk_batch_size
    CHECK (batch_size BETWEEN 1 AND 10000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- prospection_campaigns: batch_delay_ms must be 0-60000
DO $$ BEGIN
  ALTER TABLE public.prospection_campaigns ADD CONSTRAINT chk_batch_delay
    CHECK (batch_delay_ms BETWEEN 0 AND 60000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- prospection_campaigns: ai_temperature must be 0-2.0
DO $$ BEGIN
  ALTER TABLE public.prospection_campaigns ADD CONSTRAINT chk_ai_temperature
    CHECK (ai_temperature >= 0 AND ai_temperature <= 2.0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- prospection_campaigns: ai_max_tokens must be 1-8000
DO $$ BEGIN
  ALTER TABLE public.prospection_campaigns ADD CONSTRAINT chk_ai_max_tokens
    CHECK (ai_max_tokens BETWEEN 1 AND 8000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- prospection_ai_settings: claude_temperature 0-2.0
DO $$ BEGIN
  ALTER TABLE public.prospection_ai_settings ADD CONSTRAINT chk_claude_temp
    CHECK (claude_temperature >= 0 AND claude_temperature <= 2.0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- prospection_ai_settings: openai_temperature 0-2.0
DO $$ BEGIN
  ALTER TABLE public.prospection_ai_settings ADD CONSTRAINT chk_openai_temp
    CHECK (openai_temperature >= 0 AND openai_temperature <= 2.0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- prospection_ai_settings: claude_max_tokens 1-8000
DO $$ BEGIN
  ALTER TABLE public.prospection_ai_settings ADD CONSTRAINT chk_claude_tokens
    CHECK (claude_max_tokens BETWEEN 1 AND 8000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- prospection_ai_settings: openai_max_tokens 1-8000
DO $$ BEGIN
  ALTER TABLE public.prospection_ai_settings ADD CONSTRAINT chk_openai_tokens
    CHECK (openai_max_tokens BETWEEN 1 AND 8000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- prospection_ai_settings: max_auto_replies 1-50
DO $$ BEGIN
  ALTER TABLE public.prospection_ai_settings ADD CONSTRAINT chk_max_auto_replies
    CHECK (max_auto_replies BETWEEN 1 AND 50);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 3. MISSING INDEXES for analytics performance
-- ============================================

-- Analytics: messages by created_at and status (critical for partition pruning)
CREATE INDEX IF NOT EXISTS prosp_msg_created_status_idx
  ON public.prospection_messages(created_at DESC, status);

-- Analytics: campaign stats by status + created_at
CREATE INDEX IF NOT EXISTS prosp_campaigns_status_created_idx
  ON public.prospection_campaigns(status, created_at DESC);

-- Conversations: order by last_message_at
CREATE INDEX IF NOT EXISTS prosp_conv_last_msg_idx
  ON public.prospection_conversations(last_message_at DESC NULLS LAST);

-- Conversation messages: order by created_at DESC for latest first
CREATE INDEX IF NOT EXISTS prosp_conv_msgs_desc_idx
  ON public.prospection_conversation_messages(conversation_id, created_at DESC);

-- Contacts: search performance on name (partial index, non-null only)
CREATE INDEX IF NOT EXISTS prosp_contacts_name_idx
  ON public.prospection_contacts(contact_name) WHERE contact_name IS NOT NULL;

-- Contacts: search performance on company (partial index, non-null only)
CREATE INDEX IF NOT EXISTS prosp_contacts_company_idx
  ON public.prospection_contacts(company_name) WHERE company_name IS NOT NULL;

-- ============================================
-- 4. VALIDATION TRIGGER for messages referential integrity
-- prospection_messages is partitioned and cannot have regular FKs in
-- older PostgreSQL versions, so we enforce integrity via a trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.prospection_validate_message()
RETURNS trigger AS $$
BEGIN
  -- Validate campaign exists
  IF NOT EXISTS (SELECT 1 FROM public.prospection_campaigns WHERE id = NEW.campaign_id) THEN
    RAISE EXCEPTION 'Campaign % does not exist', NEW.campaign_id;
  END IF;

  -- Validate contact exists
  IF NOT EXISTS (SELECT 1 FROM public.prospection_contacts WHERE id = NEW.contact_id) THEN
    RAISE EXCEPTION 'Contact % does not exist', NEW.contact_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate to ensure idempotency
DROP TRIGGER IF EXISTS prosp_messages_validate ON public.prospection_messages;
CREATE TRIGGER prosp_messages_validate
  BEFORE INSERT ON public.prospection_messages
  FOR EACH ROW EXECUTE FUNCTION public.prospection_validate_message();

-- ============================================
-- 5. CONTENT LENGTH CONSTRAINTS
-- Prevent oversized payloads from being stored
-- ============================================

DO $$ BEGIN
  ALTER TABLE public.prospection_conversation_messages
    ADD CONSTRAINT chk_content_length CHECK (length(content) <= 10000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.prospection_templates
    ADD CONSTRAINT chk_body_length CHECK (length(body) <= 50000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 6. ARTISAN_ID FOREIGN KEY
-- Link prospection_contacts.artisan_id to providers table if it exists
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'providers' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.prospection_contacts
      DROP CONSTRAINT IF EXISTS prospection_contacts_artisan_id_fkey;
    ALTER TABLE public.prospection_contacts
      ADD CONSTRAINT prospection_contacts_artisan_id_fkey
        FOREIGN KEY (artisan_id) REFERENCES public.providers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 7. INCREMENT RPC FUNCTION
-- Used by webhook handlers to atomically increment stat counters
-- ============================================

CREATE OR REPLACE FUNCTION public.increment(table_name text, column_name text, row_id uuid)
RETURNS void AS $$
BEGIN
  EXECUTE format(
    'UPDATE public.%I SET %I = %I + 1 WHERE id = $1',
    table_name, column_name, column_name
  ) USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. PHONE NORMALIZATION: DOM-TOM support
-- Replaces the function from migration 300 to handle French
-- overseas territories:
--   Guadeloupe / Saint-Martin / Saint-Barth : +590
--   Martinique : +596
--   Guyane : +594
--   Reunion / Mayotte : +262
--   Saint-Pierre-et-Miquelon : +508
-- DOM-TOM numbers start with 0690, 0691, 0694, 0696, 0697, 0262, 0263, 0269, 0508
-- ============================================

CREATE OR REPLACE FUNCTION public.prospection_normalize_phone()
RETURNS trigger AS $$
DECLARE
  cleaned text;
  prefix text;
BEGIN
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    -- Supprimer tout sauf les chiffres et le +
    cleaned := regexp_replace(NEW.phone, '[^0-9+]', '', 'g');

    -- --------------------------------------------------------
    -- DOM-TOM : numéros français à 10 chiffres commençant par 0
    -- qui doivent recevoir un indicatif autre que +33
    -- --------------------------------------------------------

    IF cleaned ~ '^0[0-9]{9}$' AND length(cleaned) = 10 THEN
      prefix := substring(cleaned from 1 for 4);

      -- Guadeloupe, Saint-Martin, Saint-Barth : 0590, 0690, 0691
      IF prefix IN ('0590', '0690', '0691') THEN
        cleaned := '+590' || substring(cleaned from 2);

      -- Martinique : 0596, 0696, 0697
      ELSIF prefix IN ('0596', '0696', '0697') THEN
        cleaned := '+596' || substring(cleaned from 2);

      -- Guyane : 0594, 0694
      ELSIF prefix IN ('0594', '0694') THEN
        cleaned := '+594' || substring(cleaned from 2);

      -- Reunion : 0262, 0263, 0692, 0693
      ELSIF prefix IN ('0262', '0263', '0692', '0693') THEN
        cleaned := '+262' || substring(cleaned from 2);

      -- Mayotte : 0269, 0639
      ELSIF prefix IN ('0269', '0639') THEN
        cleaned := '+262' || substring(cleaned from 2);

      -- Saint-Pierre-et-Miquelon : 0508
      ELSIF prefix = '0508' THEN
        cleaned := '+508' || substring(cleaned from 2);

      -- France metropolitaine : tout autre 0X
      ELSIF cleaned ~ '^0[1-9]' THEN
        cleaned := '+33' || substring(cleaned from 2);
      END IF;

    -- Format sans le 0 initial : 33XXXXXXXXX (11 digits)
    ELSIF cleaned ~ '^33[1-9]' AND length(cleaned) = 11 THEN
      cleaned := '+' || cleaned;

    -- DOM-TOM sans le 0 initial : 590XXXXXXXXX, 596XXXXXXXXX, etc.
    ELSIF cleaned ~ '^(590|596|594|262|508)[0-9]{9}$' THEN
      cleaned := '+' || cleaned;
    END IF;

    -- Valider format E.164 final
    IF cleaned ~ '^\+[1-9][0-9]{6,14}$' THEN
      NEW.phone_e164 := cleaned;
    ELSE
      NEW.phone_e164 := NULL;
    END IF;
  ELSE
    NEW.phone_e164 := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Le trigger prosp_contacts_normalize_phone existe deja depuis migration 300
-- et pointe vers cette fonction, donc il sera automatiquement mis a jour

-- ============================================
-- 9. DEFAULT PARTITION for out-of-range dates
-- Catches any rows that don't fit existing monthly partitions
-- ============================================

CREATE TABLE IF NOT EXISTS public.prospection_messages_default PARTITION OF public.prospection_messages DEFAULT;

-- ============================================
-- 10. PG_CRON JOB for monthly partition creation
-- Schedules automatic creation of future partitions on the 1st of each month
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('prosp-create-partitions', '0 0 1 * *', 'SELECT public.prospection_create_partitions()');
  END IF;
END;
$$;

-- ============================================
-- 11. GDPR COMPLIANCE: consent_status default
-- Default to 'opted_out' instead of 'unknown' for new contacts
-- ============================================

ALTER TABLE public.prospection_contacts ALTER COLUMN consent_status SET DEFAULT 'opted_out';

-- ============================================
-- 12. CAMPAIGN STATS TRIGGER
-- Automatically update campaign counters when message status changes
-- ============================================

CREATE OR REPLACE FUNCTION public.prospection_update_campaign_stats()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    UPDATE public.prospection_campaigns SET
      sent_count = (SELECT count(*) FROM public.prospection_messages WHERE campaign_id = NEW.campaign_id AND status IN ('sent','delivered','read','replied')),
      delivered_count = (SELECT count(*) FROM public.prospection_messages WHERE campaign_id = NEW.campaign_id AND status IN ('delivered','read','replied')),
      failed_count = (SELECT count(*) FROM public.prospection_messages WHERE campaign_id = NEW.campaign_id AND status = 'failed'),
      updated_at = now()
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prosp_msg_update_campaign_stats ON public.prospection_messages;
CREATE TRIGGER prosp_msg_update_campaign_stats
  AFTER UPDATE OF status ON public.prospection_messages
  FOR EACH ROW EXECUTE FUNCTION public.prospection_update_campaign_stats();

-- ============================================
-- 13. MISSING INDEX on list_members(list_id)
-- ============================================

CREATE INDEX IF NOT EXISTS prosp_list_members_list_idx ON public.prospection_list_members(list_id);

-- ============================================
-- 14. AI REPLIES COUNT TRIGGER
-- Increment ai_replies_count on conversations when an AI message is inserted
-- ============================================

CREATE OR REPLACE FUNCTION public.prospection_update_ai_replies()
RETURNS trigger AS $$
BEGIN
  IF NEW.sender_type = 'ai' THEN
    UPDATE public.prospection_conversations SET ai_replies_count = ai_replies_count + 1 WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prosp_conv_msg_ai_count ON public.prospection_conversation_messages;
CREATE TRIGGER prosp_conv_msg_ai_count
  AFTER INSERT ON public.prospection_conversation_messages
  FOR EACH ROW EXECUTE FUNCTION public.prospection_update_ai_replies();
