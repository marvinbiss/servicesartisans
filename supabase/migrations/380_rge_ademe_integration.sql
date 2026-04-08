-- =============================================================================
-- Migration 380 — Intégration RGE ADEME
-- =============================================================================
-- Ajoute les colonnes RGE dédiées sur `providers` pour stocker les
-- qualifications RGE issues du dataset officiel ADEME / France Rénov'.
--
-- Source : data.gouv.fr — dataset "liste-des-entreprises-rge-2"
-- API    : https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines
-- Licence: Etalab 2.0 (réutilisation commerciale autorisée, attribution requise)
--
-- Design :
-- - Colonnes préfixées `rge_*` pour éviter tout conflit avec l'historique
--   des colonnes phantom droppées (`certifications`, `insurance`, etc.)
-- - `rge_qualifications` en JSONB : 1-5 qualifs/artisan, toujours lu joint à
--   la fiche, pas de requête transverse fréquente → pas de table dédiée.
-- - `rge_valid_until` dénormalisé = MAX(date_fin) des qualifs → index partiel
--   ultra-compact pour filtrer "RGE actif" sans parser le JSONB.
-- - Phase 1 : matching uniquement (enrichit artisans existants par SIRET).
--   L'import des RGE absents comme fiches non-revendiquées viendra en PR
--   séparée (phase 2, axe acquisition).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Colonnes RGE sur providers
-- -----------------------------------------------------------------------------

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS rge_qualifications JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rge_valid_until    DATE  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rge_organismes     TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rge_last_synced_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rge_source_url     TEXT DEFAULT NULL;

-- Contrainte : JSONB doit être un tableau (ou NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_rge_qualifications_is_array'
  ) THEN
    ALTER TABLE providers
      ADD CONSTRAINT providers_rge_qualifications_is_array
      CHECK (rge_qualifications IS NULL OR jsonb_typeof(rge_qualifications) = 'array');
  END IF;
END $$;

-- Contrainte : max 10 qualifications par artisan (garde-fou contre données aberrantes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_rge_qualifications_max_length'
  ) THEN
    ALTER TABLE providers
      ADD CONSTRAINT providers_rge_qualifications_max_length
      CHECK (rge_qualifications IS NULL OR jsonb_array_length(rge_qualifications) <= 10);
  END IF;
END $$;

-- Contrainte : max 5 organismes par artisan
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_rge_organismes_max_length'
  ) THEN
    ALTER TABLE providers
      ADD CONSTRAINT providers_rge_organismes_max_length
      CHECK (rge_organismes IS NULL OR array_length(rge_organismes, 1) <= 5);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- Index
-- -----------------------------------------------------------------------------

-- Index partiel : uniquement les providers avec un RGE stocké.
-- Note : on n'inclut PAS `rge_valid_until > CURRENT_DATE` dans la WHERE clause
-- car Postgres exige des fonctions IMMUTABLE dans les index predicates, et
-- CURRENT_DATE est STABLE. Le filtre sur la date d'expiration est appliqué au
-- runtime — l'index reste très compact car la grande majorité des providers
-- n'ont pas de RGE (colonne NULL).
CREATE INDEX IF NOT EXISTS idx_providers_rge_active
  ON providers (rge_valid_until)
  WHERE rge_valid_until IS NOT NULL;

-- Index composite pour le backfill communes.nb_artisans_rge
-- (GROUP BY address_city WHERE rge_valid_until > now())
CREATE INDEX IF NOT EXISTS idx_providers_rge_by_city
  ON providers (address_city, rge_valid_until)
  WHERE rge_valid_until IS NOT NULL;

-- Index GIN sur le JSONB pour requêtes ciblées "artisans RGE domaine X"
-- (ex: recherche par code qualification ou organisme)
CREATE INDEX IF NOT EXISTS idx_providers_rge_qualifications_gin
  ON providers USING GIN (rge_qualifications)
  WHERE rge_qualifications IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Commentaires (traçabilité / E-E-A-T / licence Etalab)
-- -----------------------------------------------------------------------------

COMMENT ON COLUMN providers.rge_qualifications IS
  'Liste des qualifications RGE actives. Format: [{code, nom, organisme, domaine, date_debut, date_fin}]. Source: ADEME / France Rénov''. Licence Etalab 2.0.';

COMMENT ON COLUMN providers.rge_valid_until IS
  'Date max de validité parmi toutes les qualifications RGE (dénormalisé pour index). Si < CURRENT_DATE, l''artisan n''est plus RGE actif.';

COMMENT ON COLUMN providers.rge_organismes IS
  'Organismes certificateurs distincts (ex: Qualibat, Qualit''EnR, Qualifelec, Céquami, Certibat, OPQIBI).';

COMMENT ON COLUMN providers.rge_last_synced_at IS
  'Dernière synchronisation réussie avec le dataset ADEME. Permet de détecter les fiches obsolètes.';

COMMENT ON COLUMN providers.rge_source_url IS
  'URL de la fiche officielle sur france-renov.gouv.fr/annuaire-rge (transparence + E-E-A-T).';

COMMENT ON INDEX idx_providers_rge_active IS
  'Index partiel sur les providers avec RGE stocké. Filtre date au runtime (CURRENT_DATE pas IMMUTABLE).';

COMMIT;
