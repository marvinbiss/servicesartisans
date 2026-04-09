-- =============================================================================
-- Migration 386 — CEE Délégataires (Brique 1 bis roadmap mandataire CEE)
-- =============================================================================
-- Cette migration crée la table `cee_delegataires` qui référence les obligés,
-- délégataires et mandataires du dispositif CEE (période P6 2026-2030).
--
-- Contexte business
-- -----------------
-- Décision du 2026-04-09 : pivot vers un modèle mandataire CEE (SAS dédiée).
-- Cette table est la fondation data/config pour :
--   1. Lister les partenaires commerciaux potentiels (vague 1 → 3)
--   2. Router un dossier CEE vers le délégataire approprié selon l'opération
--      (cf. cee_operations.code) et la valorisation de prime
--   3. Tracer les accords commerciaux (statut partenaire/prospect)
--   4. Reporting PNCEE (cat. P6 obligés)
--
-- POC avant dev lourd : cette table est alimentée manuellement. Les briques 2-6
-- (tunnel dossier, API délégataires, dashboard, webhooks) ne démarrent qu'après
-- validation du POC avec la vague 1 (Effy, Sonergia, TotalEnergies).
--
-- Référence réglementaire : art. L221-1 et suiv. du Code de l'énergie,
-- décret 2025-1048 du 4 novembre 2025 (période P6).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table principale
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cee_delegataires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiant slug (URL-safe, utilisé côté lib/routing)
  -- Ex: 'effy', 'sonergia', 'total-energies'
  slug TEXT NOT NULL UNIQUE,

  -- Identité commerciale et légale
  nom_commercial TEXT NOT NULL,
  raison_sociale TEXT NOT NULL,

  -- SIRET (14 chiffres). NULLABLE car certains délégataires sont ajoutés
  -- avant vérification formelle. Règle zero-tolerance : mieux vaut NULL que faux.
  siret TEXT CHECK (siret IS NULL OR length(siret) = 14),

  -- -------------------------------------------------------------------------
  -- Classification PNCEE
  -- -------------------------------------------------------------------------
  -- Catégorie P6 PNCEE (oui par défaut — la table ne référence que des P6).
  -- Si un jour on ajoute des P5 résiduels, flipper à FALSE.
  is_p6 BOOLEAN NOT NULL DEFAULT TRUE,

  -- Nature juridique dans le dispositif
  -- - 'obligated'   : obligé direct (vendeur d'énergie soumis à quotas)
  -- - 'delegated'   : délégataire ayant repris l'obligation d'un obligé
  -- - 'mandataire'  : agit au nom d'obligés/délégataires (apport d'affaires)
  type TEXT NOT NULL
    CHECK (type IN ('obligated', 'delegated', 'mandataire')),

  -- -------------------------------------------------------------------------
  -- Roadmap d'intégration (vagues)
  -- -------------------------------------------------------------------------
  -- 1 = vague 1 (POC — Effy / Sonergia / TotalEnergies)
  -- 2 = vague 2 (obligés majeurs et délégataires top 10)
  -- 3 = vague 3 (queue longue P6)
  vague_priorite INT NOT NULL DEFAULT 3
    CHECK (vague_priorite IN (1, 2, 3)),

  -- Statut commercial actuel
  -- - 'partenaire' : accord signé, intégration en cours ou live
  -- - 'prospect'   : identifié, pas encore en négo
  -- - 'actif'      : intégration live en production
  -- - 'inactif'    : archivé, ne pas router de dossier
  statut TEXT NOT NULL DEFAULT 'prospect'
    CHECK (statut IN ('partenaire', 'prospect', 'actif', 'inactif')),

  -- -------------------------------------------------------------------------
  -- Contact & documentation
  -- -------------------------------------------------------------------------
  url_site TEXT,
  url_api_docs TEXT,                    -- doc API publique si connue
  contact_commercial_email TEXT,        -- PII — protégé par RLS (voir policies)
  contact_technique_email TEXT,         -- PII — protégé par RLS (voir policies)

  -- -------------------------------------------------------------------------
  -- Périmètre d'activité CEE
  -- -------------------------------------------------------------------------
  -- Codes opérations supportés (ex: ['BAR-EN-101','BAR-TH-171']).
  -- Tableau vide = toutes opérations supportées par défaut (cas le plus fréquent
  -- pour les gros obligés). Intersection avec cee_operations.code.
  operations_supportees TEXT[] NOT NULL DEFAULT '{}',

  -- Secteurs couverts (cf. cee_operations.secteur)
  secteurs_couverts TEXT[] NOT NULL DEFAULT ARRAY['residentiel']::TEXT[],

  -- Signataire de la charte "Coup de pouce" (bonification primes)
  coup_de_pouce_signataire BOOLEAN NOT NULL DEFAULT FALSE,

  -- Volume CEE déclaré PNCEE 2025 (en TWhc). NULLABLE car rarement public.
  -- Indicateur pour prioriser les vagues d'intégration.
  volume_cee_twhc_2025 NUMERIC,

  -- -------------------------------------------------------------------------
  -- Admin & métadonnées
  -- -------------------------------------------------------------------------
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Cohérence vague 1 ↔ statut : si une ligne est vague 1, elle ne peut pas
  -- être 'inactif' (la vague 1 est par définition un focus actuel).
  CONSTRAINT cee_delegataires_vague1_not_inactive
    CHECK (NOT (vague_priorite = 1 AND statut = 'inactif'))
);

-- -----------------------------------------------------------------------------
-- Index
-- -----------------------------------------------------------------------------

-- UNIQUE partiel sur SIRET (permet les NULL, refuse les doublons réels)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cee_delegataires_siret_unique
  ON cee_delegataires (siret)
  WHERE siret IS NOT NULL;

-- Routing vague × statut (query la plus fréquente : "actifs vague 1")
CREATE INDEX IF NOT EXISTS idx_cee_delegataires_vague_statut
  ON cee_delegataires (vague_priorite, statut)
  WHERE statut IN ('actif', 'partenaire');

-- Intersection opérations supportées (routing dossier CEE → délégataire)
CREATE INDEX IF NOT EXISTS idx_cee_delegataires_operations_gin
  ON cee_delegataires USING GIN (operations_supportees);

-- Intersection secteurs
CREATE INDEX IF NOT EXISTS idx_cee_delegataires_secteurs_gin
  ON cee_delegataires USING GIN (secteurs_couverts);

-- -----------------------------------------------------------------------------
-- Trigger updated_at (réutilise le pattern migration 382)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cee_delegataires_set_updated_at()
RETURNS TRIGGER AS $trg$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$trg$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cee_delegataires_updated_at ON cee_delegataires;
CREATE TRIGGER trg_cee_delegataires_updated_at
  BEFORE UPDATE ON cee_delegataires
  FOR EACH ROW
  EXECUTE FUNCTION cee_delegataires_set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
-- Lecture publique autorisée uniquement sur les lignes 'actif' ou 'partenaire',
-- ET les colonnes PII (emails contact) sont exposées uniquement via une vue
-- dédiée côté service_role. La policy SELECT ci-dessous autorise SELECT *
-- (côté DB) mais le code applicatif (src/lib/cee/delegataires.ts) ne sélectionne
-- QUE les colonnes publiques pour les anon/authenticated.

ALTER TABLE cee_delegataires ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_delegataires_public_read ON cee_delegataires;
CREATE POLICY cee_delegataires_public_read
  ON cee_delegataires
  FOR SELECT
  USING (statut IN ('actif', 'partenaire'));

-- Writes réservés au service_role (backoffice / scripts d'import).
-- Pas de policy INSERT/UPDATE/DELETE pour anon/authenticated = refus par défaut.

COMMENT ON TABLE cee_delegataires IS
  'Obligés, délégataires et mandataires CEE période P6 (2026-2030). Alimentée manuellement. Fondation brique 1 bis du pivot mandataire CEE (décision 2026-04-09). POC avant dev lourd — aucune intégration API dans cette migration. Voir migration 386.';

COMMENT ON COLUMN cee_delegataires.siret IS
  'SIRET 14 chiffres. NULLABLE — règle zero-tolerance sur les données légales : mieux vaut NULL que faux. À vérifier via INSEE/PNCEE avant remplissage.';

COMMENT ON COLUMN cee_delegataires.contact_commercial_email IS
  'PII — à ne JAMAIS exposer côté anon/authenticated. Lecture uniquement via service_role (backoffice).';

COMMENT ON COLUMN cee_delegataires.contact_technique_email IS
  'PII — à ne JAMAIS exposer côté anon/authenticated. Lecture uniquement via service_role (backoffice).';
