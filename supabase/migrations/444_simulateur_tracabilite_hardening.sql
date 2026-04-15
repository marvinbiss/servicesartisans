-- Migration 444: simulateur_estimations — traçabilité plan 20/20
-- Date: 2026-04-15
-- Doc plan : memory servicesartisans-simulateur-aides-plan §Architecture 20/20
-- Dépend   : migrations 438, 440
--
-- Pourquoi cette migration :
--   Le plan 20/20 exige 4 renforcements de traçabilité absents jusqu'ici :
--     1. request_id UUID v4 propagé Vercel logs ↔ DB ↔ Pipedrive ↔ admin
--     2. inputs_hash SHA-256 des inputs pour idempotence recompute
--     3. formule_debug (= calculation_trace) en NOT NULL pour garantir reconstruction
--     4. consent_text_sha256 — SHA-256 du texte RGPD versionné affiché à l'user
--
--   Objectif : "Pourquoi ce lead a eu 8 200€ le 14 avril ?" → réponse avec
--   version barème + inputs + logique + source réglementaire en < 30s.

BEGIN;

-- ---------------------------------------------------------------------------
-- 444.1  Colonnes traçabilité
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulateur_estimations
  ADD COLUMN IF NOT EXISTS request_id          uuid,
  ADD COLUMN IF NOT EXISTS inputs_hash         text,
  ADD COLUMN IF NOT EXISTS consent_text_sha256 text;

COMMENT ON COLUMN public.simulateur_estimations.request_id
  IS 'UUID v4 propagé Vercel logs ↔ DB ↔ Pipedrive ↔ admin — reconstruction < 30s';
COMMENT ON COLUMN public.simulateur_estimations.inputs_hash
  IS 'SHA-256 hex des inputs canonicalisés — idempotence recompute + détection drift';
COMMENT ON COLUMN public.simulateur_estimations.consent_text_sha256
  IS 'SHA-256 du texte RGPD versionné affiché à l''utilisateur (CNIL: preuve consentement)';

-- ---------------------------------------------------------------------------
-- 444.2  Backfill request_id pour rows existantes (gen_random_uuid)
-- ---------------------------------------------------------------------------
UPDATE public.simulateur_estimations
SET request_id = gen_random_uuid()
WHERE request_id IS NULL;

-- Backfill inputs_hash avec un sentinel pour les anciennes rows (non recalculables)
UPDATE public.simulateur_estimations
SET inputs_hash = 'legacy:' || substr(md5(id::text), 1, 32)
WHERE inputs_hash IS NULL;

-- Backfill consent_text_sha256 avec v0 pour anciennes rows
UPDATE public.simulateur_estimations
SET consent_text_sha256 = 'legacy-v0'
WHERE consent_text_sha256 IS NULL AND consent_rgpd = true;

-- ---------------------------------------------------------------------------
-- 444.3  Durcir NOT NULL (après backfill)
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulateur_estimations
  ALTER COLUMN request_id  SET NOT NULL,
  ALTER COLUMN request_id  SET DEFAULT gen_random_uuid(),
  ALTER COLUMN inputs_hash SET NOT NULL;

-- formule_debug : jusqu'ici nullable. On backfill un objet vide pour les rows
-- orphelines, puis on durcit en NOT NULL. Nouveaux inserts doivent fournir
-- le trace complet (rule_id, montant, source_url, condition).
UPDATE public.simulateur_estimations
SET formule_debug = '{"legacy": true, "rules_applied": []}'::jsonb
WHERE formule_debug IS NULL;

ALTER TABLE public.simulateur_estimations
  ALTER COLUMN formule_debug SET NOT NULL;

COMMENT ON COLUMN public.simulateur_estimations.formule_debug
  IS 'Calculation trace NOT NULL — { rules_applied: [{rule_id, montant, source_url, condition}], bareme_version, ... }';

-- ---------------------------------------------------------------------------
-- 444.4  Index lookup par request_id (admin /explain, logs Vercel)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sim_estim_request_id
  ON public.simulateur_estimations(request_id);

CREATE INDEX IF NOT EXISTS idx_sim_estim_inputs_hash
  ON public.simulateur_estimations(inputs_hash);

-- ---------------------------------------------------------------------------
-- 444.5  Contrainte format SHA-256 hex 64 chars (hors legacy sentinel)
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulateur_estimations
  ADD CONSTRAINT simulateur_estimations_inputs_hash_fmt_chk
  CHECK (inputs_hash ~ '^(legacy:[a-f0-9]{32}|[a-f0-9]{64})$');

COMMIT;
