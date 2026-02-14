-- ============================================
-- Migration 300: Prospection Multi-Canal Dashboard
-- Dashboard de prospection pour contacter artisans, clients et mairies
-- via WhatsApp, SMS et Email avec réponses IA
-- ============================================

-- ============================================
-- 1. TABLE: prospection_contacts
-- Contacts unifiés (artisan/client/mairie) avec déduplication
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Classification
  contact_type    text NOT NULL CHECK (contact_type IN ('artisan','client','mairie')),

  -- Identité
  company_name    text,
  contact_name    text,
  email           text,
  email_canonical text GENERATED ALWAYS AS (lower(trim(email))) STORED,
  phone           text,
  phone_e164      text,

  -- Localisation
  address         text,
  postal_code     text,
  city            text,
  department      text,
  region          text,

  -- Spécifique mairie
  commune_code    text,
  population      integer,

  -- Lien vers artisan existant
  artisan_id      uuid,

  -- Source du contact
  source          text NOT NULL DEFAULT 'import'
                  CHECK (source IN ('import','database','manual','api','scraping')),
  source_file     text,
  source_row      integer,

  -- Tags et champs personnalisés
  tags            text[] DEFAULT '{}',
  custom_fields   jsonb DEFAULT '{}'::jsonb,

  -- RGPD
  consent_status  text DEFAULT 'unknown'
                  CHECK (consent_status IN ('opted_in','opted_out','unknown')),
  opted_out_at    timestamptz,

  -- Lifecycle
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index de déduplication
CREATE UNIQUE INDEX IF NOT EXISTS prosp_contacts_phone_uniq
  ON public.prospection_contacts(phone_e164)
  WHERE phone_e164 IS NOT NULL AND is_active;
CREATE UNIQUE INDEX IF NOT EXISTS prosp_contacts_email_uniq
  ON public.prospection_contacts(email_canonical)
  WHERE email_canonical IS NOT NULL AND is_active;

-- Index de recherche
CREATE INDEX IF NOT EXISTS prosp_contacts_type_idx
  ON public.prospection_contacts(contact_type);
CREATE INDEX IF NOT EXISTS prosp_contacts_dept_idx
  ON public.prospection_contacts(department);
CREATE INDEX IF NOT EXISTS prosp_contacts_tags_idx
  ON public.prospection_contacts USING gin(tags);
CREATE INDEX IF NOT EXISTS prosp_contacts_artisan_idx
  ON public.prospection_contacts(artisan_id) WHERE artisan_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS prosp_contacts_active_idx
  ON public.prospection_contacts(is_active, contact_type);

-- ============================================
-- 2. TABLE: prospection_lists
-- Listes et segments de contacts
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_lists (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text,

  -- Type: statique (membres manuels) ou dynamique (filtre auto)
  list_type       text NOT NULL DEFAULT 'static'
                  CHECK (list_type IN ('static','dynamic')),

  -- Filtre pour listes dynamiques
  filter_criteria jsonb,

  -- Stats (mis à jour par trigger)
  contact_count   integer DEFAULT 0,

  created_by      uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- 3. TABLE: prospection_list_members
-- Appartenance contact ↔ liste
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_list_members (
  list_id         uuid NOT NULL REFERENCES public.prospection_lists(id) ON DELETE CASCADE,
  contact_id      uuid NOT NULL REFERENCES public.prospection_contacts(id) ON DELETE CASCADE,
  added_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (list_id, contact_id)
);

CREATE INDEX IF NOT EXISTS prosp_list_members_contact_idx
  ON public.prospection_list_members(contact_id);

-- ============================================
-- 4. TABLE: prospection_templates
-- Templates de messages par canal
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_templates (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,

  -- Ciblage
  channel               text NOT NULL CHECK (channel IN ('email','sms','whatsapp')),
  audience_type         text CHECK (audience_type IN ('artisan','client','mairie')),

  -- Contenu
  subject               text,
  body                  text NOT NULL,
  html_body             text,

  -- WhatsApp spécifique
  whatsapp_template_name text,
  whatsapp_template_sid  text,
  whatsapp_approved      boolean DEFAULT false,

  -- Config IA pour les réponses
  ai_system_prompt      text,
  ai_context            jsonb DEFAULT '{}'::jsonb,

  -- Variables attendues
  variables             text[] DEFAULT '{}',

  -- Lifecycle
  is_active             boolean NOT NULL DEFAULT true,
  created_by            uuid,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prosp_templates_channel_idx
  ON public.prospection_templates(channel, audience_type);

-- ============================================
-- 5. TABLE: prospection_campaigns
-- Campagnes d'envoi
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_campaigns (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text NOT NULL,
  description             text,

  -- Canal et audience
  channel                 text NOT NULL CHECK (channel IN ('email','sms','whatsapp')),
  audience_type           text NOT NULL CHECK (audience_type IN ('artisan','client','mairie')),

  -- Template
  template_id             uuid REFERENCES public.prospection_templates(id),

  -- Liste de contacts
  list_id                 uuid REFERENCES public.prospection_lists(id),

  -- Workflow: draft → scheduled → sending → paused → completed / cancelled
  status                  text NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','scheduled','sending','paused','completed','cancelled')),

  -- Planification
  scheduled_at            timestamptz,
  started_at              timestamptz,
  completed_at            timestamptz,
  paused_at               timestamptz,

  -- Config d'envoi
  batch_size              integer DEFAULT 100,
  batch_delay_ms          integer DEFAULT 1000,
  daily_send_limit        integer DEFAULT 10000,

  -- A/B testing
  ab_test_enabled         boolean DEFAULT false,
  ab_variant_b_template_id uuid REFERENCES public.prospection_templates(id),
  ab_split_percent        integer DEFAULT 50 CHECK (ab_split_percent BETWEEN 10 AND 90),

  -- Config IA pour réponses automatiques
  ai_auto_reply           boolean DEFAULT false,
  ai_provider             text DEFAULT 'claude' CHECK (ai_provider IN ('claude','openai')),
  ai_model                text DEFAULT 'claude-sonnet-4-20250514',
  ai_system_prompt        text,
  ai_max_tokens           integer DEFAULT 500,
  ai_temperature          numeric(3,2) DEFAULT 0.7,

  -- Stats (mis à jour par trigger/cron)
  total_recipients        integer DEFAULT 0,
  sent_count              integer DEFAULT 0,
  delivered_count         integer DEFAULT 0,
  opened_count            integer DEFAULT 0,
  clicked_count           integer DEFAULT 0,
  replied_count           integer DEFAULT 0,
  failed_count            integer DEFAULT 0,
  opted_out_count         integer DEFAULT 0,

  -- Coûts
  estimated_cost          numeric(10,2) DEFAULT 0,
  actual_cost             numeric(10,2) DEFAULT 0,

  -- Metadata
  created_by              uuid,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prosp_campaigns_status_idx
  ON public.prospection_campaigns(status);
CREATE INDEX IF NOT EXISTS prosp_campaigns_channel_idx
  ON public.prospection_campaigns(channel, audience_type);

-- ============================================
-- 6. TABLE: prospection_messages (partitionnée par mois)
-- Messages individuels envoyés
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_messages (
  id                uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id       uuid NOT NULL,
  contact_id        uuid NOT NULL,

  -- Canal
  channel           text NOT NULL CHECK (channel IN ('email','sms','whatsapp')),

  -- Contenu rendu (snapshot au moment de l'envoi)
  rendered_body     text,
  rendered_subject  text,

  -- A/B variant
  ab_variant        text DEFAULT 'A' CHECK (ab_variant IN ('A','B')),

  -- ID externe (Twilio SID ou Resend email ID)
  external_id       text,

  -- Statut
  status            text NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued','sending','sent','delivered','read','replied',
                                      'failed','bounced','opted_out','cancelled')),

  -- Timestamps
  queued_at         timestamptz NOT NULL DEFAULT now(),
  sent_at           timestamptz,
  delivered_at      timestamptz,
  read_at           timestamptz,
  replied_at        timestamptz,
  failed_at         timestamptz,

  -- Erreurs et retry
  error_code        text,
  error_message     text,
  retry_count       integer DEFAULT 0,
  max_retries       integer DEFAULT 3,
  next_retry_at     timestamptz,

  -- Coût
  cost              numeric(8,4) DEFAULT 0,

  created_at        timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Créer les partitions pour 12 mois
DO $$
DECLARE
  start_date date;
  end_date date;
  partition_name text;
BEGIN
  FOR i IN 0..11 LOOP
    start_date := date_trunc('month', now()) + (i || ' months')::interval;
    end_date := start_date + '1 month'::interval;
    partition_name := 'prospection_messages_' || to_char(start_date, 'YYYY_MM');

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.prospection_messages FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END LOOP;
END;
$$;

-- Index sur la table partitionnée
CREATE INDEX IF NOT EXISTS prosp_msg_campaign_idx
  ON public.prospection_messages(campaign_id, status);
CREATE INDEX IF NOT EXISTS prosp_msg_contact_idx
  ON public.prospection_messages(contact_id);
CREATE INDEX IF NOT EXISTS prosp_msg_status_idx
  ON public.prospection_messages(status) WHERE status IN ('queued','sending','failed');
CREATE INDEX IF NOT EXISTS prosp_msg_external_idx
  ON public.prospection_messages(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS prosp_msg_retry_idx
  ON public.prospection_messages(next_retry_at)
  WHERE status = 'failed' AND retry_count < max_retries;

-- ============================================
-- 7. TABLE: prospection_conversations
-- Conversations de réponses (inbox unifié)
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid REFERENCES public.prospection_campaigns(id),
  contact_id      uuid NOT NULL REFERENCES public.prospection_contacts(id),
  message_id      uuid,

  channel         text NOT NULL CHECK (channel IN ('email','sms','whatsapp')),
  status          text NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','ai_handling','human_required','resolved','archived')),

  -- IA
  ai_provider     text CHECK (ai_provider IN ('claude','openai')),
  ai_model        text,
  ai_replies_count integer DEFAULT 0,

  -- Assignation
  assigned_to     uuid,

  last_message_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prosp_conv_contact_idx
  ON public.prospection_conversations(contact_id);
CREATE INDEX IF NOT EXISTS prosp_conv_status_idx
  ON public.prospection_conversations(status) WHERE status IN ('open','ai_handling','human_required');
CREATE INDEX IF NOT EXISTS prosp_conv_channel_idx
  ON public.prospection_conversations(channel);

-- ============================================
-- 8. TABLE: prospection_conversation_messages
-- Messages dans chaque conversation
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_conversation_messages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     uuid NOT NULL REFERENCES public.prospection_conversations(id) ON DELETE CASCADE,

  direction           text NOT NULL CHECK (direction IN ('inbound','outbound')),
  sender_type         text NOT NULL CHECK (sender_type IN ('contact','ai','human','system')),

  content             text NOT NULL,

  -- Metadata IA
  ai_provider         text,
  ai_model            text,
  ai_prompt_tokens    integer,
  ai_completion_tokens integer,
  ai_cost             numeric(8,6) DEFAULT 0,

  -- Référence externe
  external_id         text,

  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prosp_conv_msgs_conv_idx
  ON public.prospection_conversation_messages(conversation_id, created_at);

-- ============================================
-- 9. TABLE: prospection_ai_settings
-- Configuration IA globale
-- ============================================
CREATE TABLE IF NOT EXISTS public.prospection_ai_settings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider par défaut
  default_provider      text NOT NULL DEFAULT 'claude'
                        CHECK (default_provider IN ('claude','openai')),

  -- Config Claude
  claude_model          text DEFAULT 'claude-sonnet-4-20250514',
  claude_api_key_set    boolean DEFAULT false,
  claude_max_tokens     integer DEFAULT 500,
  claude_temperature    numeric(3,2) DEFAULT 0.7,

  -- Config OpenAI
  openai_model          text DEFAULT 'gpt-4o',
  openai_api_key_set    boolean DEFAULT false,
  openai_max_tokens     integer DEFAULT 500,
  openai_temperature    numeric(3,2) DEFAULT 0.7,

  -- Règles de réponse
  auto_reply_enabled    boolean DEFAULT false,
  max_auto_replies      integer DEFAULT 3,
  escalation_keywords   text[] DEFAULT '{urgent,plainte,avocat,rgpd,annuler,probleme,remboursement}',

  -- Prompts système par audience
  artisan_system_prompt text DEFAULT 'Tu es un assistant commercial pour ServicesArtisans, une plateforme de mise en relation avec des artisans qualifiés. Tu contactes des artisans pour les inviter à rejoindre la plateforme. Sois professionnel, concis et mets en avant les avantages : visibilité en ligne, leads qualifiés, gestion simplifiée. Réponds toujours en français.',
  client_system_prompt  text DEFAULT 'Tu es un assistant de ServicesArtisans. Tu aides les clients à trouver les meilleurs artisans pour leurs travaux. Sois chaleureux, professionnel et orienté solution. Réponds toujours en français.',
  mairie_system_prompt  text DEFAULT 'Tu es un représentant de ServicesArtisans. Tu contactes les mairies pour proposer un partenariat de mise en relation entre leurs administrés et des artisans locaux qualifiés. Sois formel, professionnel et mets en avant le service public. Réponds toujours en français.',

  updated_by            uuid,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Insérer la config par défaut
INSERT INTO public.prospection_ai_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. TRIGGERS: updated_at automatique
-- ============================================
CREATE OR REPLACE FUNCTION public.prospection_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prosp_contacts_updated_at ON public.prospection_contacts;
CREATE TRIGGER prosp_contacts_updated_at
  BEFORE UPDATE ON public.prospection_contacts
  FOR EACH ROW EXECUTE FUNCTION public.prospection_updated_at();

DROP TRIGGER IF EXISTS prosp_lists_updated_at ON public.prospection_lists;
CREATE TRIGGER prosp_lists_updated_at
  BEFORE UPDATE ON public.prospection_lists
  FOR EACH ROW EXECUTE FUNCTION public.prospection_updated_at();

DROP TRIGGER IF EXISTS prosp_templates_updated_at ON public.prospection_templates;
CREATE TRIGGER prosp_templates_updated_at
  BEFORE UPDATE ON public.prospection_templates
  FOR EACH ROW EXECUTE FUNCTION public.prospection_updated_at();

DROP TRIGGER IF EXISTS prosp_campaigns_updated_at ON public.prospection_campaigns;
CREATE TRIGGER prosp_campaigns_updated_at
  BEFORE UPDATE ON public.prospection_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.prospection_updated_at();

DROP TRIGGER IF EXISTS prosp_conversations_updated_at ON public.prospection_conversations;
CREATE TRIGGER prosp_conversations_updated_at
  BEFORE UPDATE ON public.prospection_conversations
  FOR EACH ROW EXECUTE FUNCTION public.prospection_updated_at();

-- ============================================
-- 11. TRIGGER: Mise à jour contact_count sur les listes
-- ============================================
CREATE OR REPLACE FUNCTION public.prospection_list_count_update()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prospection_lists
    SET contact_count = contact_count + 1, updated_at = now()
    WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prospection_lists
    SET contact_count = GREATEST(contact_count - 1, 0), updated_at = now()
    WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prosp_list_members_count ON public.prospection_list_members;
CREATE TRIGGER prosp_list_members_count
  AFTER INSERT OR DELETE ON public.prospection_list_members
  FOR EACH ROW EXECUTE FUNCTION public.prospection_list_count_update();

-- ============================================
-- 12. FONCTION: Normalisation téléphone E.164
-- ============================================
CREATE OR REPLACE FUNCTION public.prospection_normalize_phone()
RETURNS trigger AS $$
DECLARE
  cleaned text;
BEGIN
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    -- Supprimer tout sauf les chiffres et le +
    cleaned := regexp_replace(NEW.phone, '[^0-9+]', '', 'g');

    -- Format français: 0X → +33X
    IF cleaned ~ '^0[1-9]' AND length(cleaned) = 10 THEN
      cleaned := '+33' || substring(cleaned from 2);
    END IF;

    -- Ajouter + si absent et commence par 33
    IF cleaned ~ '^33[1-9]' AND length(cleaned) = 11 THEN
      cleaned := '+' || cleaned;
    END IF;

    -- Valider format E.164
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

DROP TRIGGER IF EXISTS prosp_contacts_normalize_phone ON public.prospection_contacts;
CREATE TRIGGER prosp_contacts_normalize_phone
  BEFORE INSERT OR UPDATE OF phone ON public.prospection_contacts
  FOR EACH ROW EXECUTE FUNCTION public.prospection_normalize_phone();

-- ============================================
-- 13. FONCTION: Auto-création des partitions futures
-- ============================================
CREATE OR REPLACE FUNCTION public.prospection_create_partitions()
RETURNS void AS $$
DECLARE
  start_date date;
  end_date date;
  partition_name text;
BEGIN
  FOR i IN 0..11 LOOP
    start_date := date_trunc('month', now()) + (i || ' months')::interval;
    end_date := start_date + '1 month'::interval;
    partition_name := 'prospection_messages_' || to_char(start_date, 'YYYY_MM');

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.prospection_messages FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 14. RLS: Toutes les tables admin-only
-- ============================================
ALTER TABLE public.prospection_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospection_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospection_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospection_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospection_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospection_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospection_conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospection_ai_settings ENABLE ROW LEVEL SECURITY;

-- Policies: service_role a accès total (les routes API utilisent createAdminClient())
-- Aucune policy pour anon/authenticated car tout passe par les API routes admin
DROP POLICY IF EXISTS "Service role full access" ON public.prospection_contacts;
CREATE POLICY "Service role full access" ON public.prospection_contacts
  FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Service role full access" ON public.prospection_lists;
CREATE POLICY "Service role full access" ON public.prospection_lists
  FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Service role full access" ON public.prospection_list_members;
CREATE POLICY "Service role full access" ON public.prospection_list_members
  FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Service role full access" ON public.prospection_templates;
CREATE POLICY "Service role full access" ON public.prospection_templates
  FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Service role full access" ON public.prospection_campaigns;
CREATE POLICY "Service role full access" ON public.prospection_campaigns
  FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Service role full access" ON public.prospection_messages;
CREATE POLICY "Service role full access" ON public.prospection_messages
  FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Service role full access" ON public.prospection_conversations;
CREATE POLICY "Service role full access" ON public.prospection_conversations
  FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Service role full access" ON public.prospection_conversation_messages;
CREATE POLICY "Service role full access" ON public.prospection_conversation_messages
  FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Service role full access" ON public.prospection_ai_settings;
CREATE POLICY "Service role full access" ON public.prospection_ai_settings
  FOR ALL USING (auth.role() = 'service_role');
