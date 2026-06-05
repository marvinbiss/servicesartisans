-- =============================================================================
-- Migration 538 — Réconciliation prospection_optouts (shape 488 → intent 393)
-- =============================================================================
-- Contexte (audit drift 2026-06-05) : la migration 393 (registre légal opt-out
-- RGPD complet) n'a JAMAIS été appliquée en prod. La migration 488
-- (create_missing_tables) a ensuite créé une version stopgap minimale :
-- colonnes TEXT sans CHECK, pas d'unicité email, pas de trigger de
-- réplication vers email_suppressions, `optout_at` au lieu de `requested_at`.
-- Rejouer 393 telle quelle échoue (création de table no-op + index sur
-- requested_at inexistant — erreur 42703 constatée au SQL editor).
--
-- Cette migration porte la table live (shape 488, 0 row) au niveau de 393 :
--   - `optout_at` est conservé comme horodatage canonique (équivalent
--     sémantique de requested_at — on ne crée PAS de doublon de colonne).
--   - phone_e164 ajouté (STOP SMS, prévu par 393).
--   - NOT NULL sur email/reason/source/optout_at (0 row → safe ; le code
--     /api/prospection/optout écrit toujours ces champs).
--   - CHECKs nommés (valeurs reason/source de 393, longueurs, ip_hash hex
--     strict — reprend aussi le nit #5a de la migration 396).
--   - Unicité lower(email) : le handler optout gère explicitement la course
--     « deux clics simultanés » via la contrainte unique — elle DOIT exister.
--   - Index campagne + chronologique (audit CNIL).
--   - Trigger de réplication vers email_suppressions (filtre unique dans
--     message-queue.ts via find_suppressed_emails — migration 392).
--
-- PRÉREQUIS : migrations 308 (email_suppressions) puis 392 (RPC lookup)
-- appliquées AVANT celle-ci (le trigger insère dans email_suppressions).
--
-- RLS : policy service_role déjà posée par 488 — rien à faire ici.
-- =============================================================================

BEGIN;

-- 1. Colonne manquante de 393
ALTER TABLE public.prospection_optouts
  ADD COLUMN IF NOT EXISTS phone_e164 TEXT;

-- 2. NOT NULL (0 row live — vérifié 2026-06-05)
ALTER TABLE public.prospection_optouts
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN reason SET NOT NULL,
  ALTER COLUMN source SET NOT NULL,
  ALTER COLUMN optout_at SET NOT NULL,
  ALTER COLUMN optout_at SET DEFAULT now();

-- 3. CHECKs nommés (valeurs et longueurs de 393 + nit hex de 396)
ALTER TABLE public.prospection_optouts
  DROP CONSTRAINT IF EXISTS prospection_optouts_email_len;
ALTER TABLE public.prospection_optouts
  ADD CONSTRAINT prospection_optouts_email_len
  CHECK (char_length(email) <= 320);

ALTER TABLE public.prospection_optouts
  DROP CONSTRAINT IF EXISTS prospection_optouts_phone_len;
ALTER TABLE public.prospection_optouts
  ADD CONSTRAINT prospection_optouts_phone_len
  CHECK (phone_e164 IS NULL OR char_length(phone_e164) <= 32);

ALTER TABLE public.prospection_optouts
  DROP CONSTRAINT IF EXISTS prospection_optouts_reason_values;
ALTER TABLE public.prospection_optouts
  ADD CONSTRAINT prospection_optouts_reason_values
  CHECK (reason IN ('user_request', 'complaint', 'legal_request'));

ALTER TABLE public.prospection_optouts
  DROP CONSTRAINT IF EXISTS prospection_optouts_source_values;
ALTER TABLE public.prospection_optouts
  ADD CONSTRAINT prospection_optouts_source_values
  CHECK (source IN ('email_link', 'sms_reply_stop', 'api', 'manual_admin'));

ALTER TABLE public.prospection_optouts
  DROP CONSTRAINT IF EXISTS prospection_optouts_ip_hash_hex;
ALTER TABLE public.prospection_optouts
  ADD CONSTRAINT prospection_optouts_ip_hash_hex
  CHECK (ip_hash IS NULL OR ip_hash ~ '^[0-9a-f]{64}$');

ALTER TABLE public.prospection_optouts
  DROP CONSTRAINT IF EXISTS prospection_optouts_user_agent_len;
ALTER TABLE public.prospection_optouts
  ADD CONSTRAINT prospection_optouts_user_agent_len
  CHECK (user_agent IS NULL OR char_length(user_agent) <= 500);

ALTER TABLE public.prospection_optouts
  DROP CONSTRAINT IF EXISTS prospection_optouts_token_len;
ALTER TABLE public.prospection_optouts
  ADD CONSTRAINT prospection_optouts_token_len
  CHECK (token_used IS NULL OR char_length(token_used) <= 512);

-- 4. Unicité (idempotence opt-out — le handler compte dessus pour la course)
CREATE UNIQUE INDEX IF NOT EXISTS prospection_optouts_email_lower_uniq
  ON public.prospection_optouts (lower(email));

-- 5. Index d'audit CNIL
CREATE INDEX IF NOT EXISTS prospection_optouts_campaign_idx
  ON public.prospection_optouts (campaign_id)
  WHERE campaign_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS prospection_optouts_optout_at_idx
  ON public.prospection_optouts (optout_at DESC);

COMMENT ON TABLE public.prospection_optouts IS
  'Registre légal des opt-outs de prospection (article L.34-5 CPCE / RGPD). '
  'Source de vérité pour prouver à la CNIL qu''une demande a été tracée et respectée. '
  'Shape : 488 réconciliée par 538 (393 jamais appliquée).';

-- 6. Trigger : réplique l'opt-out dans email_suppressions (cf. 393)
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
