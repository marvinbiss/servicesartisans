-- ============================================================================
-- Migration 476 — Vague G1 perf indexes (audit 2026-04-25)
-- ============================================================================
--
-- Restaure 1 index droppé en 419 (idx_providers_location) + crée 2 nouveaux
-- indexes pour des hot paths sans index :
--
--   B3. /api/search/map → seq scan 970K sur providers (gte/lte lat/lng)
--   B4. /api/search/suggestions → ilike '%X%' sur providers.name
--   B5. /api/devis (checkDuplicate + checkEmailRateLimit) → seq scan
--       devis_requests par client_email
--
-- Note : pas de CREATE INDEX CONCURRENTLY car les migrations Supabase tournent
-- en transaction implicite (psql -1). Sur 970K rows, le lock table providers
-- pendant la création (~30-60s) est acceptable hors trafic. Run-book : à
-- appliquer pendant la fenêtre de maintenance ou hors heures de pointe.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- B3. providers (latitude, longitude) — restauration
-- ----------------------------------------------------------------------------
-- Droppé en migration 419 ("0 scans since stats reset") mais effectivement
-- utilisé par /api/search/map qui filtre par bounding box. Le drop a causé
-- des seq scans sur 970K rows à chaque requête de carte.
-- Partiel : WHERE is_active AND latitude IS NOT NULL → réduit la taille de
-- l'index (~ 60% des providers ont des coords).

CREATE INDEX IF NOT EXISTS idx_providers_location
  ON public.providers USING btree (latitude, longitude)
  WHERE is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

COMMENT ON INDEX public.idx_providers_location IS
  'G1-B3 : bounding-box search /api/search/map. Restauré après drop 419.';

-- ----------------------------------------------------------------------------
-- B4. providers.name — gin_trgm pour autocomplete
-- ----------------------------------------------------------------------------
-- /api/search/suggestions fait `name.ilike.%X%,siret.ilike.%X%` sur 970K
-- rows. Hot path (autocomplete clavier). pg_trgm activé en 303.

CREATE INDEX IF NOT EXISTS idx_providers_name_trgm
  ON public.providers USING gin (name gin_trgm_ops)
  WHERE is_active = true;

COMMENT ON INDEX public.idx_providers_name_trgm IS
  'G1-B4 : autocomplete /api/search/suggestions (ilike %name%) hot path.';

-- ----------------------------------------------------------------------------
-- B5. devis_requests (client_email, created_at) — anti-double + rate limit
-- ----------------------------------------------------------------------------
-- src/lib/services/devis-service.ts:checkDuplicate + checkEmailRateLimit
-- font `.eq('client_email', email).gte('created_at', ...)` à chaque submit
-- /api/devis. Aucun index sur client_email seul ou composite.
-- Partiel : WHERE client_email IS NOT NULL → la colonne est NOT NULL en
-- schéma mais le partial reste défensif si schema bouge.

CREATE INDEX IF NOT EXISTS idx_devis_requests_email_created
  ON public.devis_requests (client_email, created_at DESC)
  WHERE client_email IS NOT NULL;

COMMENT ON INDEX public.idx_devis_requests_email_created IS
  'G1-B5 : anti-doublon + rate limit /api/devis (checkDuplicate + checkEmailRateLimit).';
