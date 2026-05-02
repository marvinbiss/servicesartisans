-- =============================================================================
-- Rollback 489 : restaurer les 16 services Tier C désactivés
-- =============================================================================
-- À exécuter UNIQUEMENT si le pivot RGE est annulé. Réactive les 16 slugs
-- qui avaient été désactivés. Note : cette opération seule ne suffit pas —
-- il faut également revert :
--   - france.ts + france-light.ts (services list)
--   - VALID_SERVICE_SLUGS dans gone-paths.ts (sinon middleware 410)
--   - les 28 articles blog dédiés supprimés (commit séparé)
--
-- Reversibility window : 30 jours (au-delà, Google a purgé l'index, le
-- rollback ne récupère pas le trafic perdu sur ces URLs).
-- =============================================================================

UPDATE public.services
SET is_active = true,
    updated_at = NOW()
WHERE slug IN (
  'solier','terrassier','metallier','ferronnier','poseur-de-parquet',
  'miroitier','storiste','architecte-interieur','decorateur',
  'domoticien','pisciniste','antenniste','ascensoriste','geometre',
  'desinsectisation','deratisation'
);
