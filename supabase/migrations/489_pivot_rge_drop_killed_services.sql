-- =============================================================================
-- Migration 489 : Pivot RGE 2026-05-01 — désactivation 16 services Tier C niche
-- 2026-05-02
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Pivot stratégique du 2026-05-01 : abandon des 16 métiers Tier C niche
-- (volume de recherche faible, conversion <0.5%, distance avec le pivot
-- rénovation énergétique RGE/CEE) au profit d'un focus exclusif sur le hub
-- énergétique. Les 16 slugs ont déjà été retirés côté code (france.ts +
-- france-light.ts → 30 services), avec filet 410 middleware sur leurs URLs
-- (`VALID_SERVICE_SLUGS` dans `src/lib/seo/gone-paths.ts`).
--
-- Cette migration aligne la prod sur le code en désactivant les services
-- correspondants dans la table `services`. On NE SUPPRIME PAS les rangées :
--   1. La table `bookings` a une FK `service_id REFERENCES services(id)
--      ON DELETE SET NULL` (mig 100) — DELETE casserait l'historique de
--      bookings sans intérêt opérationnel (les bookings sur services tués
--      sont déjà finalisés ou annulés).
--   2. Audit RGPD : les anciens devis pointent indirectement (via
--      `service_slug` text) sur ces slugs ; conserver les rangées permet
--      d'auditer la trace historique pendant la durée de conservation
--      légale.
--   3. Reversibilité : un simple UPDATE inverse réactive le service en cas
--      de pivot stratégique (rollback fourni).
--
-- DECISION
-- --------
-- 1. UPDATE services SET is_active = false WHERE slug IN (...16 killed)
-- 2. Aucun touch sur `providers.specialty` : les artisans avec ces
--    specialties resteront en DB mais leurs fiches sont déjà cachées
--    côté code (filtrage par `VALID_SERVICE_SLUGS` au middleware).
-- 3. Élargissement RGE +5 (borne-recharge déjà présent en DB ; les 4
--    nouveaux — chauffe-eau-thermodynamique, audit-energetique, ventilation,
--    fenetres — restent hors table `services` car virtuels RGE-only sans
--    hub `/services/[slug]` dédié).
--
-- IMPACT
-- ------
-- - Endpoint /api/services?active=true : 30 services au lieu de 46
-- - Sitemap : déjà aligné via VALID_SERVICE_SLUGS (middleware 410 actif)
-- - Hub artisans + filtres : code utilise france-light, déjà à 30
-- - Pas d'impact CEE/RGE : dispatch et listings RGE non concernés
--
-- VERIFICATION
-- ------------
-- SELECT slug, is_active FROM services WHERE slug IN (
--   'solier','terrassier','metallier','ferronnier','poseur-de-parquet',
--   'miroitier','storiste','architecte-interieur','decorateur',
--   'domoticien','pisciniste','antenniste','ascensoriste','geometre',
--   'desinsectisation','deratisation'
-- );
-- Attendu : 16 lignes, toutes is_active = false.
-- =============================================================================

-- ============================================================================
-- 1. DESACTIVATION DES 16 SERVICES TIER C
-- ============================================================================
UPDATE public.services
SET is_active = false,
    updated_at = NOW()
WHERE slug IN (
  -- Bâtiment / Gros œuvre
  'solier',
  'terrassier',
  'metallier',
  'ferronnier',
  -- Finitions / Aménagement intérieur
  'poseur-de-parquet',
  'miroitier',
  'storiste',
  'architecte-interieur',
  'decorateur',
  'domoticien',
  -- Extérieur / Loisirs
  'pisciniste',
  -- Sécurité / Technique
  'antenniste',
  'ascensoriste',
  -- Diagnostics / Conseil
  'geometre',
  -- Services spécialisés
  'desinsectisation',
  'deratisation'
);

-- ============================================================================
-- 2. VERIFICATION INVARIANT (FAIL-FAST si décompte inattendu)
-- ============================================================================
DO $$
DECLARE
  killed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO killed_count
  FROM public.services
  WHERE is_active = false
    AND slug IN (
      'solier','terrassier','metallier','ferronnier','poseur-de-parquet',
      'miroitier','storiste','architecte-interieur','decorateur',
      'domoticien','pisciniste','antenniste','ascensoriste','geometre',
      'desinsectisation','deratisation'
    );

  IF killed_count <> 16 THEN
    RAISE EXCEPTION 'Pivot RGE invariant violation: expected 16 services désactivés, got %', killed_count;
  END IF;

  RAISE NOTICE 'Pivot RGE 2026-05-01 : % services Tier C désactivés', killed_count;
END $$;
