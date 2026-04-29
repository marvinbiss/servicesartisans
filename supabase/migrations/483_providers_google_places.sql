-- ============================================================================
-- Migration 483 — Google Places enrichment columns on public.providers
-- ============================================================================
-- Plan v2 ULTRA DOMINATION SEO — synthèse 10-agents 2026-04-28 #5 :
--   "Google Places SIRET match 49K fiches RGE → +45-60K avis externes,
--    +18-25% CTR via étoiles SERP".
--
-- Stratégie :
--   - SIRET (déjà présent sur providers) → Find Place (Places API New)
--   - Stocker place_id + rating + user_ratings_total + business_status
--   - Sync timestamp pour throttling backfill + re-sync incrémental
--
-- ⚠️ Distinct des colonnes legacy `rating_average`/`review_count` qui restent
-- la source de vérité interne (avis first-party plateforme). Les colonnes
-- google_* alimentent UNIQUEMENT le bloc "avis Google" UI + un fallback
-- AggregateRating si first-party=0 sur la fiche claim.
-- ============================================================================

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS google_place_id           TEXT,
  ADD COLUMN IF NOT EXISTS google_rating             NUMERIC(2,1),
  ADD COLUMN IF NOT EXISTS google_user_ratings_total INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS google_business_status    TEXT,
  ADD COLUMN IF NOT EXISTS google_synced_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS google_sync_status        TEXT NOT NULL DEFAULT 'pending';

-- Contraintes : rating dans [0, 5], business_status enum officiel Places API,
-- sync_status enum interne backfill.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_google_rating_range'
  ) THEN
    ALTER TABLE public.providers
      ADD CONSTRAINT providers_google_rating_range
      CHECK (google_rating IS NULL OR google_rating BETWEEN 0 AND 5);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_google_user_ratings_total_nonneg'
  ) THEN
    ALTER TABLE public.providers
      ADD CONSTRAINT providers_google_user_ratings_total_nonneg
      CHECK (google_user_ratings_total >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_google_business_status_enum'
  ) THEN
    ALTER TABLE public.providers
      ADD CONSTRAINT providers_google_business_status_enum
      CHECK (
        google_business_status IS NULL
        OR google_business_status IN (
          'OPERATIONAL',
          'CLOSED_TEMPORARILY',
          'CLOSED_PERMANENTLY'
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_google_sync_status_enum'
  ) THEN
    -- Enum sync_status :
    --   pending     → jamais sync
    --   matched     → 1 résultat unique trouvé, place_id retenu
    --   ambiguous   → ≥2 résultats Places, top retenu MAIS flag pour audit manuel
    --                 (audit security 2026-04-29 : éviter corruption silencieuse)
    --   no_match    → 0 résultat Places (SIRET non trouvé)
    --   api_error   → erreur HTTP/réseau, à retry
    --   collision   → unique-index violation 23505 (un autre provider porte
    --                 déjà ce place_id — homonymie SIRET → audit manuel)
    --   skipped     → SIRET absent ou format invalide
    ALTER TABLE public.providers
      ADD CONSTRAINT providers_google_sync_status_enum
      CHECK (google_sync_status IN (
        'pending', 'matched', 'ambiguous', 'no_match', 'api_error', 'collision', 'skipped'
      ));
  END IF;
END $$;

-- Index unique partial sur place_id (Places retourne un identifiant stable).
-- Permet de détecter dans le backfill un place_id déjà attribué à un autre
-- provider (collision homonyme SIRET) et de lever une alerte.
CREATE UNIQUE INDEX IF NOT EXISTS providers_google_place_id_uniq
  ON public.providers (google_place_id)
  WHERE google_place_id IS NOT NULL;

-- Index pour throttling backfill : pickup ASC pending puis stale.
CREATE INDEX IF NOT EXISTS providers_google_synced_at_pending_idx
  ON public.providers (google_synced_at NULLS FIRST)
  WHERE google_sync_status IN ('pending', 'matched');

-- Index pour requêtes UI fiche : "afficher rating google si présent et stale < 90j"
CREATE INDEX IF NOT EXISTS providers_google_rating_present_idx
  ON public.providers (id)
  WHERE google_rating IS NOT NULL AND google_business_status = 'OPERATIONAL';

COMMENT ON COLUMN public.providers.google_place_id IS
  'Identifiant stable Google Places API (Find Place via SIRET → match). NULL si no_match ou pending.';
COMMENT ON COLUMN public.providers.google_rating IS
  'Note Google Places (0–5, 1 décimale). Source : Places API. Ne se substitue pas à rating_average (first-party).';
COMMENT ON COLUMN public.providers.google_user_ratings_total IS
  'Nombre d''avis Google Places. Distinct de review_count (avis first-party plateforme).';
COMMENT ON COLUMN public.providers.google_business_status IS
  'OPERATIONAL / CLOSED_TEMPORARILY / CLOSED_PERMANENTLY. Si CLOSED_PERMANENTLY → noindex automatique.';
COMMENT ON COLUMN public.providers.google_synced_at IS
  'Dernière exécution réussie du backfill Google Places. NULL = jamais sync.';
COMMENT ON COLUMN public.providers.google_sync_status IS
  'pending = jamais sync, matched = 1 résultat unique, ambiguous = ≥2 résultats top retenu mais à auditer, no_match = SIRET non trouvé, api_error = erreur transitoire à retry, collision = unique-index 23505 (homonymie place_id), skipped = SIRET absent ou invalide.';

-- Validation format place_id côté DB (longueur bornée + alphabet restreint).
-- Anti-corruption si l'API Places change de format dans une future version.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_google_place_id_format'
  ) THEN
    ALTER TABLE public.providers
      ADD CONSTRAINT providers_google_place_id_format
      CHECK (
        google_place_id IS NULL
        OR (length(google_place_id) BETWEEN 4 AND 300
            AND google_place_id ~ '^[A-Za-z0-9_\-]+$')
      );
  END IF;
END $$;
