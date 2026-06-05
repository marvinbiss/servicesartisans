-- =============================================================================
-- Migration 537 — Hotfix drift colonnes (audit drift 2026-06-05)
-- =============================================================================
-- Contexte : audit complet code ↔ prod (OpenAPI service_role) du 2026-06-05.
-- Plusieurs créations conditionnelles de table ont été des no-op car la table
-- pré-existait avec un schéma différent (migrations 021, 106, 365, 402, 464),
-- et la migration 487 a omis une colonne. Conséquence : 5 chemins d'écriture
-- échouent silencieusement en prod (PostgREST rejette toute colonne inconnue).
--
-- Chemins cassés réparés ici :
--   1. reviews.fraud_indicators — INSERT de /api/reviews/submit-invitation/[token]
--      échoue → AUCUNE review par invitation ne peut être créée (flywheel reviews
--      mort depuis le 1er envoi). Colonne définie par mig 021, perdue lors de la
--      recréation de reviews (mig 414-417).
--   2. audit_logs.old_value — lib/audit/logger.ts écrit old_value/new_value ;
--      mig 487 a ajouté new_value, resource_type, resource_id, metadata mais a
--      OMIS old_value → tous les inserts audit échouent.
--   3. newsletter_subscribers.source — mig 365 no-op (table pré-existante sans
--      source) → POST /api/newsletter et /api/newsletter/subscribe échouent.
--   4. access_logs.user_id — mig 449 a créé la table sans user_id alors que
--      mig 106 indexait cette colonne ; lib/dashboard/events.ts insère user_id
--      → tous les access logs échouent.
--   5. cee_dossiers.metadata — la RPC transition_cee_dossier_status (mig 410)
--      écrit metadata, colonne du schéma 402 droppé par mig 431 → la RPC
--      échoue ("column metadata does not exist") → cron cee-dossier-transitions
--      + route admin transition cassés.
--   6. barometre_rge_snapshots — le schéma live vient de mig 488 (shape
--      simplifiée id/yearmonth/data) car mig 464 (shape riche) n'a jamais été
--      appliquée ; le cron barometre-rge et /barometre/rge consomment la shape
--      riche → upsert mensuel échoue. On aligne sur 464 par ADD COLUMN
--      (0 row live, types identiques à 464, defaults pour idempotence).
--
-- Idempotent : uniquement ADD COLUMN IF NOT EXISTS + CREATE INDEX IF NOT EXISTS.
-- =============================================================================

BEGIN;

-- 1. reviews.fraud_indicators (mirror mig 021)
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS fraud_indicators JSONB;

-- 2. audit_logs.old_value (complète mig 487)
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS old_value JSONB;

-- 3. newsletter_subscribers.source (mirror mig 365)
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'footer';

-- 4. access_logs.user_id (+ index prévu par mig 106)
ALTER TABLE access_logs
  ADD COLUMN IF NOT EXISTS user_id UUID;

CREATE INDEX IF NOT EXISTS idx_access_logs_user
  ON access_logs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- 5. cee_dossiers.metadata (répare RPC transition_cee_dossier_status mig 410)
ALTER TABLE cee_dossiers
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 6. barometre_rge_snapshots — alignement shape mig 464 (0 row live).
--    PK UUID et colonne data de mig 488 conservés (inoffensifs) ; yearmonth
--    UNIQUE déjà présent (utilisé par l'upsert onConflict du cron).
ALTER TABLE barometre_rge_snapshots
  ADD COLUMN IF NOT EXISTS captured_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS total_rge_active  INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_rge_expired INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_providers   INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS by_region         JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS by_qualification  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS by_specialty      JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS organismes        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS methodology       TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source_note       TEXT        NOT NULL DEFAULT 'ADEME annuaire-entreprises RGE — sync hebdo';

COMMIT;
