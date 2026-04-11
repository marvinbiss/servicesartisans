-- =============================================================================
-- Migration 396: RGPD Phase 1 — Patch correctif des migrations 393/394/395
-- ServicesArtisans — 2026-04-11
-- =============================================================================
-- Les migrations 393/394/395 ont été pushées (commit 5b6ac662) avant relecture
-- finale. Quatre bugs bloquants + un durcissement CHECK à appliquer en place :
--
--   Bug #1 (393) — sync_optout_to_suppressions() : clause ON CONFLICT ne matche
--                  pas l'index expression (lower(email), reason) de la migration
--                  308 — Postgres exige ((lower(email)), reason).
--   Bug #2 (395) — prospection_contacts_archive clonée manuellement, il manque
--                  consent_proof / bloctel_checked_at / bloctel_listed ajoutés
--                  par 394 → perte silencieuse de la preuve CNIL à l'archivage.
--   Bug #3 (394) — trigger prospection_enforce_consent_proof piège les lignes
--                  legacy opted_in sans preuve (immuables). Backfill préalable
--                  en 'unknown' pour libérer les UPDATEs.
--   Bug #4       — colonne anonymized_at manquante sur prospection_contacts
--                  (nécessaire au cron purge 3 ans Phase 1).
--   Nit #5       — CHECK durcis : ip_hash au format hex strict, consent_proof
--                  typage des clés obligatoires (timestamp/source string).
--
-- Idempotent : tous les DROP/ADD sont IF EXISTS / IF NOT EXISTS.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Bug #3 — Backfill PRÉALABLE des lignes legacy opted_in sans consent_proof.
-- DOIT s'exécuter avant toute autre opération : sinon une UPDATE ultérieure
-- déclencherait le trigger et ferait tout planter. On rétrograde en 'unknown'
-- (état neutre) — l'équipe legal pourra re-qualifier manuellement au besoin.
-- =============================================================================
DO $patch396$
DECLARE legacy_count INTEGER;
BEGIN
  UPDATE public.prospection_contacts
     SET consent_status = 'unknown'
   WHERE consent_status = 'opted_in'
     AND consent_proof IS NULL;
  GET DIAGNOSTICS legacy_count = ROW_COUNT;
  RAISE NOTICE 'Backfill consent_proof : % lignes legacy rétrogradées en unknown', legacy_count;
END;
$patch396$;

-- =============================================================================
-- Bug #1 — Fix sync_optout_to_suppressions() : ON CONFLICT doit utiliser
-- la même syntaxe que l'index expression (lower(email), reason) créé en 308.
-- Postgres impose des parenthèses supplémentaires autour de l'expression.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.sync_optout_to_suppressions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $patch396$
BEGIN
  INSERT INTO public.email_suppressions (email, reason, source)
  VALUES (NEW.email, 'unsubscribe', 'prospection_optout')
  ON CONFLICT ((lower(email)), reason) DO NOTHING;
  RETURN NEW;
END;
$patch396$;

COMMENT ON FUNCTION public.sync_optout_to_suppressions() IS
  'Réplique un opt-out prospection vers email_suppressions. Patch 396 : '
  'ON CONFLICT corrigé pour matcher l''index expression ((lower(email)), reason) '
  'créé en migration 308 — la syntaxe de 393 était silencieusement cassée.';

-- =============================================================================
-- Bug #2 — Recréer prospection_contacts_archive à partir du schéma réel de
-- prospection_contacts pour capturer consent_proof / bloctel_* (ajoutés en 394).
-- ATTENTION : DROP puis CREATE TABLE LIKE. En dev/prod la table est vide à
-- ce stade (le cron purge n'est pas encore actif) donc pas de perte de données.
-- À CONFIRMER AVEC L'USER si des lignes ont été insérées manuellement en dev.
-- On n'inclut PAS INCLUDING INDEXES : l'archive a ses propres index d'audit.
-- =============================================================================
DROP TABLE IF EXISTS public.prospection_contacts_archive;

CREATE TABLE public.prospection_contacts_archive
  (LIKE public.prospection_contacts
    INCLUDING DEFAULTS
    INCLUDING CONSTRAINTS
    INCLUDING STORAGE);

ALTER TABLE public.prospection_contacts_archive
  ADD COLUMN archived_at timestamptz NOT NULL DEFAULT now();

COMMENT ON TABLE public.prospection_contacts_archive IS
  'Archive intermédiaire RGPD (5 ans max) des contacts purgés. Patch 396 : '
  'recréée via LIKE prospection_contacts pour inclure consent_proof / '
  'bloctel_checked_at / bloctel_listed (manquants dans la 395 manuelle) et '
  'garantir la traçabilité CNIL à l''archivage.';

-- Index d'audit chronologique
CREATE INDEX IF NOT EXISTS prospection_contacts_archive_archived_at_idx
  ON public.prospection_contacts_archive(archived_at);

-- RLS : service_role only (réappliqué après DROP)
ALTER TABLE public.prospection_contacts_archive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON public.prospection_contacts_archive;
CREATE POLICY "Service role full access" ON public.prospection_contacts_archive
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- Bug #4 — Colonne anonymized_at pour tracer les contacts anonymisés par le
-- cron purge (placeholders anonymized-<id>@deleted.invalid après 3 ans).
-- Index partiel pour pointer uniquement les lignes anonymisées.
-- =============================================================================
ALTER TABLE public.prospection_contacts
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz NULL;

COMMENT ON COLUMN public.prospection_contacts.anonymized_at IS
  'Horodatage d''anonymisation RGPD (email/phone remplacés par des placeholders). '
  'NULL = contact actif. Non NULL = soft-deleted, ligne conservée pour FK '
  'prospection_messages.contact_id. Patch 396.';

CREATE INDEX IF NOT EXISTS prospection_contacts_anonymized_at_idx
  ON public.prospection_contacts(anonymized_at)
  WHERE anonymized_at IS NOT NULL;

-- =============================================================================
-- Nit #5a — Durcir le CHECK ip_hash de prospection_optouts au format hex strict.
-- Le CHECK inline de 393 (char_length=64) est anonyme et pénible à DROPer ; on
-- ajoute un CHECK nommé supplémentaire, les deux coexistent sans conflit.
-- =============================================================================
ALTER TABLE public.prospection_optouts
  DROP CONSTRAINT IF EXISTS prospection_optouts_ip_hash_hex;
ALTER TABLE public.prospection_optouts
  ADD CONSTRAINT prospection_optouts_ip_hash_hex
  CHECK (ip_hash IS NULL OR ip_hash ~ '^[0-9a-f]{64}$');

COMMENT ON CONSTRAINT prospection_optouts_ip_hash_hex ON public.prospection_optouts IS
  'Patch 396 : ip_hash doit être un SHA-256 hex lowercase (64 chars hex). '
  'Complète le CHECK char_length=64 de 393 pour rejeter les hash mal formés.';

-- =============================================================================
-- Nit #5b — Durcir le CHECK consent_proof de prospection_contacts.
-- La 394 a créé prosp_contacts_consent_proof_shape (vérifie seulement la
-- présence des clés). On le remplace pour typer timestamp et source en string.
-- =============================================================================
ALTER TABLE public.prospection_contacts
  DROP CONSTRAINT IF EXISTS prosp_contacts_consent_proof_shape;
ALTER TABLE public.prospection_contacts
  ADD CONSTRAINT prosp_contacts_consent_proof_shape
  CHECK (
    consent_proof IS NULL
    OR (
      jsonb_typeof(consent_proof) = 'object'
      AND jsonb_typeof(consent_proof->'timestamp') = 'string'
      AND jsonb_typeof(consent_proof->'source') = 'string'
      AND consent_proof ? 'optin_text_version'
    )
  );

COMMENT ON CONSTRAINT prosp_contacts_consent_proof_shape ON public.prospection_contacts IS
  'Patch 396 : typage strict des clés critiques de consent_proof. timestamp et '
  'source doivent être des string JSON (pas juste présentes), optin_text_version '
  'reste obligatoire. Défense en profondeur contre les preuves malformées.';

COMMIT;
