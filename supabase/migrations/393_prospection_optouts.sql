-- =============================================================================
-- Migration 393: Traçabilité opt-out prospection (P1.3)
-- ServicesArtisans — 2026-04-11
-- =============================================================================
-- Contexte : la Phase 2 de prospection (email/SMS/WhatsApp) démarre bientôt.
-- Avant toute activation, il faut pouvoir prouver à la CNIL que chaque
-- demande d'opt-out est :
--   1. horodatée (requested_at)
--   2. attribuée à une source identifiable (email_link, sms_reply_stop, …)
--   3. respectée en aval via `email_suppressions` (déjà consommée par
--      message-queue.ts via la RPC find_suppressed_emails — migration 392)
--
-- La table `email_suppressions` (migration 308) gère les suppressions
-- techniques (hard bounce, complaint Resend). Elle ne porte pas la preuve
-- RGPD d'une demande utilisateur (IP hashée, user-agent, token du lien
-- cliqué, campagne d'origine). Cette migration ajoute `prospection_optouts`
-- qui sert de registre légal, plus un trigger qui réplique l'opt-out dans
-- `email_suppressions` pour que le filtre de queue existant fonctionne
-- sans double lookup.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.prospection_optouts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL CHECK (char_length(email) <= 320),
  phone_e164      text NULL CHECK (phone_e164 IS NULL OR char_length(phone_e164) <= 32),
  reason          text NOT NULL CHECK (reason IN ('user_request','complaint','legal_request')),
  source          text NOT NULL CHECK (source IN ('email_link','sms_reply_stop','api','manual_admin')),
  requested_at    timestamptz NOT NULL DEFAULT now(),
  ip_hash         text NULL CHECK (ip_hash IS NULL OR char_length(ip_hash) = 64),
  user_agent      text NULL CHECK (user_agent IS NULL OR char_length(user_agent) <= 500),
  campaign_id     uuid NULL REFERENCES public.prospection_campaigns(id) ON DELETE SET NULL,
  token_used      text NULL CHECK (token_used IS NULL OR char_length(token_used) <= 512),
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.prospection_optouts IS
  'Registre légal des opt-outs de prospection (article L.34-5 CPCE / RGPD). '
  'Source de vérité pour prouver à la CNIL qu''une demande a été tracée et respectée.';

-- Idempotence : un email ne peut figurer qu'une seule fois (case-insensitive).
-- Un deuxième clic sur le lien doit être un no-op, pas un doublon.
CREATE UNIQUE INDEX IF NOT EXISTS prospection_optouts_email_lower_uniq
  ON public.prospection_optouts (lower(email));

-- Index de lookup par campagne (audit CNIL par campagne)
CREATE INDEX IF NOT EXISTS prospection_optouts_campaign_idx
  ON public.prospection_optouts (campaign_id)
  WHERE campaign_id IS NOT NULL;

-- Index chronologique (audit fenêtré)
CREATE INDEX IF NOT EXISTS prospection_optouts_requested_at_idx
  ON public.prospection_optouts (requested_at DESC);

-- RLS : service_role uniquement. Aucun accès public/authentifié.
ALTER TABLE public.prospection_optouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on prospection_optouts" ON public.prospection_optouts;
CREATE POLICY "Service role full access on prospection_optouts"
  ON public.prospection_optouts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- Trigger : après insert, réplique l'opt-out dans email_suppressions.
-- Raison : message-queue.ts filtre déjà via find_suppressed_emails(). En
-- écrivant aussi dans email_suppressions, on n'a pas à ajouter un second
-- lookup dans la queue — un seul passage SQL suffit. L'ON CONFLICT DO
-- NOTHING gère le cas où la même adresse y serait déjà (hard bounce).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.sync_optout_to_suppressions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $sync$
BEGIN
  INSERT INTO public.email_suppressions (email, reason, source)
  VALUES (NEW.email, 'unsubscribe', 'prospection_optout')
  ON CONFLICT (lower(email), reason) DO NOTHING;
  RETURN NEW;
END;
$sync$;

COMMENT ON FUNCTION public.sync_optout_to_suppressions() IS
  'Trigger : réplique un opt-out prospection vers email_suppressions pour que '
  'find_suppressed_emails() le filtre dans la queue de prospection.';

DROP TRIGGER IF EXISTS trg_prospection_optouts_sync ON public.prospection_optouts;
CREATE TRIGGER trg_prospection_optouts_sync
  AFTER INSERT ON public.prospection_optouts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_optout_to_suppressions();

COMMIT;
