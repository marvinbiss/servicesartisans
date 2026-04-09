-- =============================================================================
-- Migration 382 — CEE Operations (Brique 1 roadmap mandataire CEE)
-- =============================================================================
-- Cette migration crée la table `cee_operations` qui référence les fiches
-- d'opérations standardisées (FOS) résidentielles publiées par la DGEC dans
-- le cadre du dispositif des Certificats d'Économies d'Énergie.
--
-- Source officielle des fiches : ecologie.gouv.fr / ATEE
-- https://www.ecologie.gouv.fr/operations-standardisees-deconomies-denergie
--
-- Rôle :
--   1. Mapper les opérations CEE (ex: BAR-EN-101) vers les services SA
--      (ex: 'toiture-couverture', 'isolation') pour qualification auto
--      à la soumission d'un devis sur /devis
--   2. Spécifier les qualifications RGE requises par opération, pour
--      filtrage automatique des artisans éligibles (croisement avec
--      providers.rge_qualifications / rge_organismes migration 380)
--   3. Lister les justificatifs obligatoires (pour constitution du tunnel
--      CEE côté particulier - Brique 2)
--   4. Flag des opérations éligibles au segment "précarité énergétique"
--      (cours CEE ~2x plus élevé = segment cible prioritaire)
--
-- Cette table est alimentée manuellement ou via un script d'import depuis
-- les arrêtés officiels DGEC. Pas de seed dans cette migration — la data
-- officielle doit être sourcée pour éviter toute erreur de forfait.
--
-- Référence : période P6 démarrée le 1er janvier 2026 (décret 2025-1048
-- du 4 novembre 2025). Obligation annuelle 1050 TWhc/an dont 280 précarité.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table principale
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cee_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiant officiel de la fiche (ex: 'BAR-EN-101', 'BAR-TH-171')
  -- BAR = Bâtiment Résidentiel, EN = Enveloppe, TH = Thermique, SE = Services
  code TEXT NOT NULL UNIQUE,

  -- Libellé officiel de la fiche
  nom TEXT NOT NULL,
  description TEXT,

  -- Classification
  secteur TEXT NOT NULL
    CHECK (secteur IN ('residentiel', 'tertiaire', 'industrie',
                       'agriculture', 'reseaux', 'transports')),
  domaine TEXT NOT NULL
    CHECK (domaine IN ('enveloppe', 'chauffage', 'ecs', 'ventilation',
                       'services', 'eclairage', 'autre')),
  sous_domaine TEXT,

  -- -------------------------------------------------------------------------
  -- Exigences RGE (pour filtrage des artisans éligibles)
  -- -------------------------------------------------------------------------
  -- Codes qualifications acceptées — croisement avec providers.rge_qualifications
  -- Ex: ['Qualibat-8713','Qualibat-8714','QualiPAC-Chauffage']
  -- Laisser vide si aucune exigence RGE spécifique (rare).
  rge_qualifications_requises TEXT[] NOT NULL DEFAULT '{}',

  -- Meta-domaines RGE acceptés (fallback si le code exact n'est pas trouvé)
  -- Ex: ['Isolation thermique','Énergies renouvelables']
  rge_meta_domaines TEXT[] NOT NULL DEFAULT '{}',

  -- -------------------------------------------------------------------------
  -- Mapping vers les services ServicesArtisans
  -- -------------------------------------------------------------------------
  -- Slugs de services SA qui déclenchent cette opération CEE
  -- Ex: ['toiture-couverture','isolation'] pour BAR-EN-101 (isolation combles)
  services_slugs TEXT[] NOT NULL DEFAULT '{}',

  -- -------------------------------------------------------------------------
  -- Paramètres business
  -- -------------------------------------------------------------------------
  unite_mesure TEXT, -- 'm2', 'logement', 'kW', 'MWh_cumac'

  -- Forfait de base (en kWh cumac) défini par l'arrêté DGEC pour cette opération.
  -- Réel calcul = forfait × modulation zone climatique × coefficient bonification.
  -- Laisser NULL si opération à calcul complexe (ex: PAC avec COP variable).
  forfait_base_kwhc NUMERIC,

  -- Éligibilité par segment
  precarite_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  classique_eligible BOOLEAN NOT NULL DEFAULT TRUE,

  -- Fiches "Coup de pouce" boostées (bonification unilatérale par les signataires
  -- de la charte). Cours de prime nettement supérieurs.
  coup_de_pouce BOOLEAN NOT NULL DEFAULT FALSE,
  coup_de_pouce_charte TEXT, -- ex: 'Chauffage', 'Isolation', 'Pilotage connecté'

  -- -------------------------------------------------------------------------
  -- Justificatifs obligatoires pour constitution du dossier CEE
  -- -------------------------------------------------------------------------
  -- Schema JSON:
  -- [
  --   {"code":"ah","nom":"Attestation sur l'honneur","obligatoire":true,"signature_eidas":"avance"},
  --   {"code":"facture","nom":"Facture de travaux","obligatoire":true,"ocr":true},
  --   {"code":"photo_avant","nom":"Photo avant travaux","obligatoire":true,"exif_geotag":true},
  --   {"code":"photo_apres","nom":"Photo après travaux","obligatoire":true,"exif_geotag":true},
  --   {"code":"avis_imposition","nom":"Avis d'imposition N-2","obligatoire":true,"precarite_only":true}
  -- ]
  -- Référence : loi n°2025-594 du 30 juin 2025 exige photos horodatées
  -- géolocalisées + conservation 6 ans pour tous les dossiers CEE.
  justificatifs_requis JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- -------------------------------------------------------------------------
  -- Métadonnées officielles
  -- -------------------------------------------------------------------------
  date_publication_arrete DATE, -- date JO de l'arrêté qui publie la fiche
  date_fin_validite DATE,       -- si la fiche a une date de fin (rare)
  url_fiche_officielle TEXT,    -- lien PDF officiel (ecologie.gouv.fr ou ATEE)
  version_fiche TEXT,           -- ex: 'v1', 'v2 - révision 2024'

  -- -------------------------------------------------------------------------
  -- Admin
  -- -------------------------------------------------------------------------
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT, -- commentaires internes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Contraintes de cohérence
  CONSTRAINT cee_operations_at_least_one_segment
    CHECK (precarite_eligible = TRUE OR classique_eligible = TRUE),
  CONSTRAINT cee_operations_code_format
    CHECK (code ~ '^[A-Z]{2,3}-[A-Z]{2}-[0-9]{3}$')
);

-- -----------------------------------------------------------------------------
-- Index
-- -----------------------------------------------------------------------------

-- Lookup par secteur (filtre le plus commun — on ne traite que 'residentiel')
CREATE INDEX IF NOT EXISTS idx_cee_operations_secteur
  ON cee_operations (secteur)
  WHERE is_active = TRUE;

-- Lookup par domaine (isolation, chauffage, etc.)
CREATE INDEX IF NOT EXISTS idx_cee_operations_domaine
  ON cee_operations (domaine)
  WHERE is_active = TRUE;

-- Lookup par slug de service SA (qualification auto à la soumission devis)
CREATE INDEX IF NOT EXISTS idx_cee_operations_services_gin
  ON cee_operations USING GIN (services_slugs);

-- Lookup par qualification RGE (filtrage artisans)
CREATE INDEX IF NOT EXISTS idx_cee_operations_rge_gin
  ON cee_operations USING GIN (rge_qualifications_requises);

-- Filtre opérations précarité (segment prioritaire stratégiquement)
CREATE INDEX IF NOT EXISTS idx_cee_operations_precarite
  ON cee_operations (secteur, domaine)
  WHERE precarite_eligible = TRUE AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- Trigger updated_at
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cee_operations_set_updated_at()
RETURNS TRIGGER AS $trg$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$trg$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cee_operations_updated_at ON cee_operations;
CREATE TRIGGER trg_cee_operations_updated_at
  BEFORE UPDATE ON cee_operations
  FOR EACH ROW
  EXECUTE FUNCTION cee_operations_set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

ALTER TABLE cee_operations ENABLE ROW LEVEL SECURITY;

-- Lecture publique des opérations actives
-- (nécessaire pour l'affichage côté front : "éligible CEE" sur pages services)
DROP POLICY IF EXISTS cee_operations_public_read ON cee_operations;
CREATE POLICY cee_operations_public_read
  ON cee_operations
  FOR SELECT
  USING (is_active = TRUE);

-- Les writes ne passent que par service_role (backoffice / scripts d'import)
-- Pas de policy INSERT/UPDATE/DELETE pour anon/authenticated = refus par défaut.

COMMENT ON TABLE cee_operations IS
  'Fiches d''opérations standardisées CEE résidentielles (FOS). Alimentée '
  'depuis les arrêtés DGEC officiels. Référencée par le pipeline '
  'mandataire CEE : qualification auto devis → filtrage artisans RGE → '
  'génération dossier CEE. Voir migration 382 pour détails.';

-- -----------------------------------------------------------------------------
-- Extension devis_requests : qualification CEE automatique
-- -----------------------------------------------------------------------------
-- À la soumission d'un devis, on détermine si les travaux sont éligibles CEE
-- et quelle opération standardisée s'applique. Ça permet :
--  - D'afficher une estimation de prime côté front
--  - D'orienter le devis vers le tunnel CEE (Brique 2)
--  - De filtrer les artisans par qualification RGE adéquate (Brique 1 bis)

ALTER TABLE devis_requests
  ADD COLUMN IF NOT EXISTS cee_eligible BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE devis_requests
  ADD COLUMN IF NOT EXISTS cee_operation_codes TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE devis_requests
  ADD COLUMN IF NOT EXISTS cee_qualified_at TIMESTAMPTZ;

-- Index pour rapidement lister les devis CEE éligibles non encore traités
CREATE INDEX IF NOT EXISTS idx_devis_requests_cee_eligible
  ON devis_requests (cee_eligible, status)
  WHERE cee_eligible = TRUE;

COMMENT ON COLUMN devis_requests.cee_eligible IS
  'TRUE si au moins une opération CEE a matché le service demandé. Calculé à la soumission.';

COMMENT ON COLUMN devis_requests.cee_operation_codes IS
  'Codes FOS CEE applicables à ce devis (ex: [''BAR-EN-101'']). Vide si non éligible.';
