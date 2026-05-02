-- =============================================================================
-- Migration 490 : Pivot RGE 2026-05-01 — DELETE 120 271 providers Tier C
-- 2026-05-02
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Pivot RGE déclenché par mig 489 a désactivé les 16 services Tier C dans la
-- table `services`, mais les ~120 271 providers dont la `specialty` pointe sur
-- ces slugs sont restés en DB. Ils sont déjà invisibles côté front (middleware
-- 410 sur `VALID_SERVICE_SLUGS`) mais polluent :
--   - les compteurs nationaux (getRgeNationalStats, getReviewStatsByDept)
--   - le sitemap providers (`/api/sitemap-providers` paginate aveugle)
--   - les requêtes globales (anti-pattern N+1 ralentit le crawl)
--   - l'asset différenciateur affiché publiquement (« 970K artisans » devient
--     une demi-vérité car 12 % sont des fiches mortes)
--
-- DECISION (validée Marvin 2026-05-02)
-- ------------------------------------
-- DELETE pur, sans archive. 2 claims existants (user_id IS NOT NULL) sont
-- supprimés également — décision business explicite, RGPD acceptable car
-- volume négligeable (2 sur 120 271) et impact UX limité.
--
-- Volumes par specialty (audit prod 2026-05-02) :
--   architecte-interieur 38 198 | terrassier 34 125 | solier      25 521
--   metallier             6 863 | ascensoriste 6 035 | desinsectisation 2 287
--   storiste              2 161 | antenniste  2 122 | pisciniste     649
--   poseur-de-parquet       648 | deratisation  573 | miroitier      365
--   domoticien              363 | ferronnier    321
--   ──────────────────────────────────────────────────
--   TOTAL                                          120 271 lignes
--
-- CASCADES FK (auto-handled par Postgres selon ON DELETE policies définies)
-- ------------------------------------------------------------------------
-- - bookings.provider_id          : ON DELETE SET NULL (mig 100) → sauf
-- - reviews.provider_id           : selon mig — typiquement CASCADE
-- - lead_assignments.provider_id  : CASCADE attendue
-- - provider_claims.provider_id   : CASCADE attendue
-- - prospection_*.artisan_id      : ON DELETE SET NULL (mig 301)
--
-- Si une FK est ON DELETE RESTRICT, le DELETE échoue atomiquement (rollback
-- transactionnel). Aucun risque de corruption partielle.
--
-- IRREVERSIBILITY WARNING
-- -----------------------
-- DELETE pur sans table d'archive — ROLLBACK IMPOSSIBLE après commit.
-- Pour rollback complet, Marvin devra ré-importer le dataset ADEME via le
-- cron `/api/cron/rge-sync` (qui re-créera des fiches vierges).
-- =============================================================================

-- ============================================================================
-- 1. DELETE 120 271 PROVIDERS TIER C
-- ============================================================================
DELETE FROM public.providers
WHERE specialty IN (
  'solier',
  'terrassier',
  'metallier',
  'ferronnier',
  'poseur-de-parquet',
  'miroitier',
  'storiste',
  'architecte-interieur',
  'decorateur',
  'domoticien',
  'pisciniste',
  'antenniste',
  'ascensoriste',
  'geometre',
  'desinsectisation',
  'deratisation'
);

-- ============================================================================
-- 2. DELETE 5 LIGNES services DESACTIVEES (cleanup mig 489)
-- ============================================================================
-- bookings.service_id ON DELETE SET NULL (mig 100) → safe.
DELETE FROM public.services
WHERE slug IN ('architecte-interieur', 'ferronnier', 'metallier', 'pisciniste', 'terrassier')
  AND is_active = false;

-- ============================================================================
-- 3. VACUUM ANALYZE — récupération espace + stats à jour
-- ============================================================================
-- Postgres autovacuum prendra le relai mais on déclenche manuellement pour
-- éviter que le crawler/sitemap tombe sur des stats périmées les 24h suivantes.
-- Note : VACUUM ne peut pas être exécuté dans une transaction. Si la migration
-- est wrappée dans BEGIN/COMMIT par l'outil de migration, retirer ces lignes.
-- VACUUM ANALYZE public.providers;
-- VACUUM ANALYZE public.services;
