-- Migration 388 — Patch SIRETs INSEE pour délégataires CEE vérifiés
-- =============================================================================
-- Contexte : la seed 387 a créé 14 délégataires CEE avec siret NULL + TODO.
-- Le script scripts/verify-cee-delegataires-siret.ts interroge
-- recherche-entreprises.api.gouv.fr (source INSEE officielle) et applique
-- un matching strict (1 résultat actif unique + similarité nom ≥ 90% Levenshtein
-- + grande entité). Sur 14 délégataires, 3 ont matché avec certitude.
--
-- Les 11 autres (effy, capital-energy, edf, engie, geo-plc, hellio, vattenfall,
-- bp-france, butagaz, dyneff, primagaz) restent siret NULL en attente d'une
-- vérification manuelle (ambiguïté ou absence de résultat actif).
--
-- Règle zéro fabrication SIRET : on ne patche QUE ce qui est validé par l'API
-- officielle. Aucune inférence, aucune estimation. cf. règle mémoire
-- feedback_legal_data_quality.
-- =============================================================================

BEGIN;

-- Sonergia — groupe d'obligés historique, mandataire CEE P6 vague 1
-- Source : recherche-entreprises.api.gouv.fr — dénomination "SONERGIA"
-- Match 100% Levenshtein, 1 seul résultat actif, grande entité.
UPDATE cee_delegataires
SET siret = '51868551600057',
    updated_at = NOW()
WHERE slug = 'sonergia'
  AND siret IS NULL;

-- TotalEnergies Électricité et Gaz France — filiale commerciale
-- Source : recherche-entreprises.api.gouv.fr — dénomination
-- "TOTALENERGIES ELECTRICITE ET GAZ FRANCE"
-- Match 100% Levenshtein sur raison_sociale normalisée.
UPDATE cee_delegataires
SET siret = '44239544800057',
    updated_at = NOW()
WHERE slug = 'total-energies'
  AND siret IS NULL;

-- Certinergy — délégataire P6 vague 1
-- Source : recherche-entreprises.api.gouv.fr — dénomination "CERTINERGY"
-- Match 100% Levenshtein, 1 seul résultat actif.
UPDATE cee_delegataires
SET siret = '79864199900049',
    updated_at = NOW()
WHERE slug = 'certinergy'
  AND siret IS NULL;

-- Garde-fou : la migration ne doit PAS lever d'erreur si ces slugs n'existent
-- pas (environnement dev sans seed 387) ou si les siret ont déjà été renseignés
-- manuellement — les UPDATE filtrent sur siret IS NULL, donc idempotents.

COMMIT;
