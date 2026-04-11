-- ============================================
-- Migration 394: Prospection — Base légale par canal
-- ============================================
-- Contexte : P1.4 de la prospection de masse (50 538 artisans RGE ADEME).
-- Les règles légales diffèrent radicalement par canal :
--   * Email B2B : intérêt légitime OK (RGPD Art. 6.1.f)
--   * SMS/WhatsApp : consentement explicite préalable OBLIGATOIRE
--     (Art. L.34-5 CPCE, pas d'exception B2B, 15 000 € par envoi illégal)
--   * Téléphone (voice) : Bloctel obligatoire (L.223-1 C.conso),
--     75 000 € par infraction
--
-- Cette migration ajoute la TRAÇABILITÉ juridique manquante :
--   * consent_proof JSONB — preuve opposable d'un opt-in (timestamp, source,
--     ip_hash, user_agent, optin_text_version). NULL = consentement non prouvé,
--     donc interdit pour SMS/WhatsApp.
--   * bloctel_listed / bloctel_checked_at — état Bloctel pour le canal voice.
--
-- Un trigger fail-close empêche de marquer consent_status='opted_in' sans
-- consent_proof attaché (défense en profondeur au niveau DB, en plus du
-- garde-fou applicatif dans src/lib/prospection/message-queue.ts).
-- ============================================

-- 1. Colonnes consentement / Bloctel
ALTER TABLE public.prospection_contacts
  ADD COLUMN IF NOT EXISTS consent_proof        jsonb,
  ADD COLUMN IF NOT EXISTS bloctel_checked_at   date,
  ADD COLUMN IF NOT EXISTS bloctel_listed       boolean;

COMMENT ON COLUMN public.prospection_contacts.consent_proof IS
  'Preuve opposable d''opt-in (Art. L.34-5 CPCE). Schéma attendu : '
  '{timestamp: ISO8601, source: text, ip_hash: text, user_agent: text, '
  'optin_text_version: text}. NULL = consentement non prouvé → SMS/WhatsApp interdits.';

COMMENT ON COLUMN public.prospection_contacts.bloctel_checked_at IS
  'Date du dernier check Bloctel (fichier hebdo opérateur). NULL = jamais vérifié.';

COMMENT ON COLUMN public.prospection_contacts.bloctel_listed IS
  'État Bloctel (L.223-1 C.conso). NULL=pas vérifié, TRUE=inscrit (NE PAS APPELER), '
  'FALSE=absent du fichier Bloctel (appel autorisé). Fail-close : NULL bloque l''appel.';

-- 2. Forme minimale du consent_proof (si présent)
--    Un CHECK strict inline sur JSONB est toléré par Postgres ; on valide les
--    clés critiques. Si le bloc est présent mais mal formé, on refuse l'insert.
ALTER TABLE public.prospection_contacts
  DROP CONSTRAINT IF EXISTS prosp_contacts_consent_proof_shape;
ALTER TABLE public.prospection_contacts
  ADD CONSTRAINT prosp_contacts_consent_proof_shape
  CHECK (
    consent_proof IS NULL
    OR (
      jsonb_typeof(consent_proof) = 'object'
      AND consent_proof ? 'timestamp'
      AND consent_proof ? 'source'
      AND consent_proof ? 'optin_text_version'
    )
  );

-- 3. Trigger fail-close : opted_in ⇒ consent_proof obligatoire.
--    On utilise un trigger plutôt qu'un CHECK simple pour pouvoir formuler un
--    message d'erreur explicite en français (l'équipe legal doit comprendre
--    immédiatement pourquoi un insert est refusé).
CREATE OR REPLACE FUNCTION public.prospection_enforce_consent_proof()
RETURNS trigger AS $$
BEGIN
  IF NEW.consent_status = 'opted_in' AND NEW.consent_proof IS NULL THEN
    RAISE EXCEPTION
      'Consentement opted_in sans preuve (consent_proof). '
      'Art. L.34-5 CPCE : un opt-in doit être horodaté et tracé '
      '(timestamp, source, optin_text_version).'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prosp_contacts_enforce_consent_proof
  ON public.prospection_contacts;
CREATE TRIGGER prosp_contacts_enforce_consent_proof
  BEFORE INSERT OR UPDATE OF consent_status, consent_proof
  ON public.prospection_contacts
  FOR EACH ROW EXECUTE FUNCTION public.prospection_enforce_consent_proof();

-- 4. Index de filtrage Bloctel (requêtes "contacts appelables")
--    Partiel sur FALSE uniquement — c'est le seul état "autorisé" et on ne
--    veut pas que le planner balaye les TRUE/NULL pour les campagnes voice.
CREATE INDEX IF NOT EXISTS prosp_contacts_bloctel_clean_idx
  ON public.prospection_contacts(bloctel_listed, bloctel_checked_at)
  WHERE bloctel_listed IS FALSE AND is_active;

-- Index d'audit : retrouver rapidement les contacts à re-checker
CREATE INDEX IF NOT EXISTS prosp_contacts_bloctel_stale_idx
  ON public.prospection_contacts(bloctel_checked_at)
  WHERE bloctel_listed IS NOT NULL;
