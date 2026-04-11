-- =============================================================================
-- Migration 398 — Audit SIRET délégataires CEE (2e passe post-388)
-- ServicesArtisans — 2026-04-11
-- =============================================================================
-- Contexte : la migration 388 avait validé 3 SIRET (sonergia, total-energies,
-- certinergy) via recherche-entreprises.api.gouv.fr. 11 délégataires restaient
-- en siret NULL + TODO. Cette migration ajoute 6 SIRET à haute confiance après
-- une 2e passe d'audit manuel sur l'API officielle.
--
-- Méthode (inchangée vs 388) :
--   Source : recherche-entreprises.api.gouv.fr (API publique INSEE, sans auth)
--   Critères zero-fabrication :
--     1. 1 seule entité active dominante retournée (open_etab >> autres)
--     2. Raison sociale match exact ou strict substring
--     3. Grande entité (forte empreinte établissements)
--   Règle mémoire feedback_legal_data_quality : mieux NULL que faux.
--
-- Statut post-398 : 9/14 SIRET validés, 5 TODO (voir bloc fin migration).
-- =============================================================================

BEGIN;

-- EDF — Électricité de France, obligé historique
-- API : SIREN 552081317, 3610 établissements actifs, siège Paris
UPDATE cee_delegataires
SET siret = '55208131766522',
    updated_at = NOW()
WHERE slug = 'edf'
  AND siret IS NULL;

-- ENGIE SA — obligé gaz/électricité majeur
-- API : SIREN 542107651, 928 établissements actifs, siège La Garenne-Colombes
UPDATE cee_delegataires
SET siret = '54210765114459',
    updated_at = NOW()
WHERE slug = 'engie'
  AND siret IS NULL;

-- BUTAGAZ SAS — obligé gaz bouteille/citerne
-- API : SIREN 402960397, 20 établissements actifs, siège Levallois-Perret.
-- Dominant sur les 3 résultats "BUTAGAZ" (les autres sont une filiale fermée
-- 0 open_etab et "BUTAGAZ ECO-ENERGIE" 1 etab récente).
UPDATE cee_delegataires
SET siret = '40296039700048',
    updated_at = NOW()
WHERE slug = 'butagaz'
  AND siret IS NULL;

-- PRIMAGAZ — obligé propane. Raison sociale officielle "Compagnie des Gaz de
-- Pétrole Primagaz" (CGPP).
-- API : SIREN 542084454, 38 établissements actifs, siège Nanterre.
UPDATE cee_delegataires
SET siret = '54208445400843',
    updated_at = NOW()
WHERE slug = 'primagaz'
  AND siret IS NULL;

-- DYNEFF SAS — obligé carburants
-- API : SIREN 305800997, 72 établissements actifs, siège Montpellier.
-- Dominant sur "DYNEFF RETAIL" (filiale, 18 etab) et "DYNEF" (1 etab non lié).
UPDATE cee_delegataires
SET siret = '30580099701000',
    updated_at = NOW()
WHERE slug = 'dyneff'
  AND siret IS NULL;

-- BP FRANCE — obligé carburants
-- API : SIREN 542034327, 331 établissements actifs, siège Cergy.
-- Dominant : les autres "BP FRANCE" sont une filiale 0 etab et un CE.
UPDATE cee_delegataires
SET siret = '54203432713118',
    updated_at = NOW()
WHERE slug = 'bp-france'
  AND siret IS NULL;

COMMIT;

-- =============================================================================
-- TODO — 5 délégataires encore en siret NULL (ambiguïté persistante)
-- =============================================================================
-- effy          : ambiguïté parent "EFFY" (SIREN 509302469) vs "EFFY RENOV"
--                 (SIREN 538589052). La liste P6 mémoire cite "EFFY RENOV" mais
--                 le seed 387 utilise raison_sociale "Effy (Economie d'Energie
--                 SAS)" qui correspond à l'historique parent. Besoin PDF DGEC
--                 P6 officiel pour lever l'ambiguïté.
--
-- hellio        : la liste P6 cite "HELLIO SOLUTIONS" (SIREN 749891214, API
--                 confirme 12 etab actifs Clichy). Le seed utilise raison sociale
--                 "Hellio" sans précision. Rachat CMAF annoncé 24/02/2026 en
--                 cours → raison sociale pourrait changer. Attendre
--                 stabilisation post-rachat + confirmation PDF DGEC P6.
--
-- vattenfall    : l'API retourne "VATTENFALL" (525154555, 0 etab actif,
--                 Paris 14) et "VATTENFALL ENERGIES" (421550823, 2 etab
--                 Boulogne). Les 2 candidats sont faibles. Vattenfall a
--                 largement réduit son périmètre France après 2019 → vérifier
--                 si toujours obligé en P6 avant d'attribuer un SIRET.
--
-- geo-plc       : entité en transition — historiquement "GEO PLC" rachetée
--                 par Hellio (qui est lui-même en cours d'acquisition par CMAF).
--                 L'API ne retourne aucune entité active avec cette
--                 dénomination (seul hit = SCI Villa d'Asie hors périmètre).
--                 Probablement fusionnée dans Hellio Solutions. Envisager de
--                 DELETE cette ligne du seed 387 ou la marquer obsolète plutôt
--                 que d'y rattacher un SIRET.
--
-- capital-energy : 2 entités API concurrentes — "CAPITAL ENERGY" (521618579,
--                  Courbevoie, 2 etab) et homonymes. Pas de confirmation P6
--                  publique. Seed 387 lui-même porte déjà un commentaire
--                  "TODO: vérifier statut P6 et nom commercial exact avant
--                  activation". Statut prospect vague 2 — non-bloquant POC.
-- =============================================================================
