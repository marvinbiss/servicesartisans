-- =============================================================================
-- Migration 387 — Seed CEE Délégataires (vagues 1-3)
-- =============================================================================
-- Seed initial de la table `cee_delegataires` créée par la migration 386.
--
-- RÈGLE ABSOLUE — Zero-tolerance sur les données légales :
-- Les SIRET ne sont PAS fabriqués. Toutes les colonnes SIRET sont à NULL dans ce
-- seed. Un script de vérification (à écrire) devra les remplir depuis l'INSEE
-- ou la liste officielle des obligés publiée par la DGEC/PNCEE.
--
-- Source de référence pour la liste :
--   https://www.ecologie.gouv.fr/certificats-deconomies-denergie
--   https://atee.fr (Association Technique Énergie Environnement)
--
-- Ce seed est idempotent : INSERT ... ON CONFLICT (slug) DO UPDATE.
--
-- Vagues
-- ------
-- Vague 1 (statut='partenaire') : POC mandataire CEE — cibles d'intégration
--   immédiate. Décision business 2026-04-09.
-- Vague 2 (statut='prospect')   : obligés majeurs et délégataires top 10.
-- Vague 3 (statut='prospect')   : queue longue P6 connue.
--
-- Toute ligne dont l'identité n'est pas certaine est OMISE plutôt qu'insérée
-- avec des valeurs approximatives.
-- =============================================================================

INSERT INTO cee_delegataires (
  slug, nom_commercial, raison_sociale, siret,
  type, vague_priorite, statut,
  url_site, operations_supportees, secteurs_couverts,
  coup_de_pouce_signataire, notes
)
VALUES
  -- ---------------------------------------------------------------------------
  -- VAGUE 1 — POC mandataire CEE (2026-04-09)
  -- ---------------------------------------------------------------------------
  (
    'effy',
    'Effy',
    'Effy (Economie d''Energie SAS)',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'delegated',
    1,
    'partenaire',
    'https://www.effy.fr',
    '{}'::TEXT[],
    ARRAY['residentiel']::TEXT[],
    TRUE,
    'Vague 1 POC mandataire — pure-player rénovation énergétique, un des plus gros délégataires P6 résidentiel.'
  ),
  (
    'sonergia',
    'Sonergia',
    'Sonergia',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'delegated',
    1,
    'partenaire',
    'https://www.sonergia.fr',
    '{}'::TEXT[],
    ARRAY['residentiel', 'tertiaire']::TEXT[],
    TRUE,
    'Vague 1 POC mandataire — délégataire historique, fort sur opérations BAR-TH et BAT-EN.'
  ),
  (
    'total-energies',
    'TotalEnergies',
    'TotalEnergies Electricité et Gaz France',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'obligated',
    1,
    'partenaire',
    'https://www.totalenergies.fr',
    '{}'::TEXT[],
    ARRAY['residentiel', 'tertiaire']::TEXT[],
    TRUE,
    'Vague 1 POC mandataire — obligé majeur, charte Coup de pouce signée.'
  ),

  -- ---------------------------------------------------------------------------
  -- VAGUE 2 — Obligés majeurs & délégataires top 10
  -- ---------------------------------------------------------------------------
  (
    'edf',
    'EDF',
    'Électricité de France',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'obligated',
    2,
    'prospect',
    'https://www.edf.fr',
    '{}'::TEXT[],
    ARRAY['residentiel', 'tertiaire', 'industrie']::TEXT[],
    TRUE,
    'Obligé historique le plus volumineux — priorité vague 2.'
  ),
  (
    'engie',
    'ENGIE',
    'ENGIE SA',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'obligated',
    2,
    'prospect',
    'https://www.engie.fr',
    '{}'::TEXT[],
    ARRAY['residentiel', 'tertiaire', 'industrie']::TEXT[],
    TRUE,
    'Obligé majeur gaz & électricité.'
  ),
  (
    'hellio',
    'Hellio',
    'Hellio',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'delegated',
    2,
    'prospect',
    'https://www.hellio.com',
    '{}'::TEXT[],
    ARRAY['residentiel', 'tertiaire']::TEXT[],
    FALSE,
    'Délégataire généraliste, fort ancrage accompagnement travaux.'
  ),
  (
    'geo-plc',
    'GEO PLC',
    'GEO PLC',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'delegated',
    2,
    'prospect',
    'https://www.geoplc.com',
    '{}'::TEXT[],
    ARRAY['residentiel', 'tertiaire', 'industrie']::TEXT[],
    FALSE,
    'Délégataire multi-segments.'
  ),
  (
    'certinergy',
    'Certinergy',
    'Certinergy',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'delegated',
    2,
    'prospect',
    'https://www.certinergy.com',
    '{}'::TEXT[],
    ARRAY['residentiel', 'tertiaire']::TEXT[],
    FALSE,
    'Délégataire spécialisé résidentiel et copropriétés.'
  ),
  (
    'capital-energy',
    'Capital Energy',
    'Capital Energy',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'delegated',
    2,
    'prospect',
    NULL,
    '{}'::TEXT[],
    ARRAY['residentiel']::TEXT[],
    FALSE,
    'TODO: vérifier statut P6 et nom commercial exact avant activation.'
  ),
  (
    'vattenfall',
    'Vattenfall',
    'Vattenfall SA',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'obligated',
    2,
    'prospect',
    'https://www.vattenfall.fr',
    '{}'::TEXT[],
    ARRAY['residentiel', 'tertiaire']::TEXT[],
    FALSE,
    'Obligé électricité, périmètre France.'
  ),

  -- ---------------------------------------------------------------------------
  -- VAGUE 3 — Queue longue P6 (carburants, retail, gaz alternatif)
  -- ---------------------------------------------------------------------------
  (
    'butagaz',
    'Butagaz',
    'Butagaz SAS',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'obligated',
    3,
    'prospect',
    'https://www.butagaz.fr',
    '{}'::TEXT[],
    ARRAY['residentiel']::TEXT[],
    FALSE,
    'Obligé gaz en bouteille/citerne.'
  ),
  (
    'primagaz',
    'Primagaz',
    'Primagaz',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'obligated',
    3,
    'prospect',
    'https://www.primagaz.fr',
    '{}'::TEXT[],
    ARRAY['residentiel']::TEXT[],
    FALSE,
    'Obligé gaz propane.'
  ),
  (
    'bp-france',
    'BP France',
    'BP France SAS',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'obligated',
    3,
    'prospect',
    NULL,
    '{}'::TEXT[],
    ARRAY['residentiel', 'transports']::TEXT[],
    FALSE,
    'Obligé carburants.'
  ),
  (
    'dyneff',
    'Dyneff',
    'Dyneff SAS',
    NULL, -- TODO: vérifier SIRET via INSEE avant prod
    'obligated',
    3,
    'prospect',
    'https://www.dyneff.fr',
    '{}'::TEXT[],
    ARRAY['residentiel', 'transports']::TEXT[],
    FALSE,
    'Obligé carburants.'
  )

  -- TODO (à compléter après vérification officielle PNCEE) :
  --   - Auchan Énergies
  --   - Leclerc Énergies
  --   - Carrefour Énergies
  --   - Intermarché Carburants
  --   - Économie d'Énergie SAS (si distinct d'Effy)
  --   - Objectif Eco Energie
  -- Ne seront ajoutés qu'après vérification stricte de l'identité légale.

ON CONFLICT (slug) DO UPDATE
  SET nom_commercial           = EXCLUDED.nom_commercial,
      raison_sociale           = EXCLUDED.raison_sociale,
      type                     = EXCLUDED.type,
      vague_priorite           = EXCLUDED.vague_priorite,
      statut                   = EXCLUDED.statut,
      url_site                 = EXCLUDED.url_site,
      operations_supportees    = EXCLUDED.operations_supportees,
      secteurs_couverts        = EXCLUDED.secteurs_couverts,
      coup_de_pouce_signataire = EXCLUDED.coup_de_pouce_signataire,
      notes                    = EXCLUDED.notes;
