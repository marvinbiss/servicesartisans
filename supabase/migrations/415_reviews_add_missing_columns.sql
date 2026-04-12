-- =============================================================================
-- Migration 415 : reviews — ajout des colonnes manquantes (booking_id, would_recommend)
-- =============================================================================
-- Date        : 2026-04-12
-- Contexte    : Audit schema drift 2026-04-12 sur la table public.reviews.
--               Le code applicatif (API /api/reviews, composants UI, dashboards)
--               référence deux colonnes absentes du schéma prod réel, provoquant
--               des erreurs silencieuses et des régressions fonctionnelles.
--
-- Colonnes ajoutées :
--
--   1. booking_id (UUID, FK -> public.bookings.id, ON DELETE SET NULL)
--      - Utilisée par POST /api/reviews (L155) pour un filtre
--        `.eq('booking_id', ...)` afin de prévenir les doubles-reviews sur
--        une même réservation.
--      - Source d'authenticité : lie un avis à une prestation réellement
--        effectuée (vs. reviews importées de Google/Trustpilot).
--
--   2. would_recommend (BOOLEAN, nullable)
--      - Signal UX : badge "Recommande" affiché sur la fiche artisan et
--        dans la liste d'avis côté public.
--      - Alimente le calcul du taux de recommandation dans les dashboards
--        (admin + artisan) et les KPIs qualité.
-- =============================================================================

-- 1. Ajout des colonnes (idempotent)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN;

-- 2. Index pour les lookups `.eq('booking_id', ...)` (partiel, NULL exclus)
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id
  ON public.reviews(booking_id)
  WHERE booking_id IS NOT NULL;

-- 3. Contrainte UNIQUE partielle : 1 review max par booking
--    (empêche les doubles-reviews sur une même réservation ; les reviews
--    importées externes avec booking_id NULL ne sont pas concernées)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_reviews_booking_id
  ON public.reviews(booking_id)
  WHERE booking_id IS NOT NULL;

-- =============================================================================
-- Notes post-migration :
--
-- - Les reviews existantes conservent booking_id = NULL. C'est acceptable :
--   la majorité provient d'imports externes (Google, Trustpilot, etc.) via
--   la colonne `source`, et n'ont pas de booking interne associé.
--
-- - Un backfill des reviews historiques (matching heuristique avis <-> bookings
--   par provider_id + author_email + date) sera traité dans une migration
--   dédiée si un besoin opérationnel le justifie. Hors scope ici.
--
-- - would_recommend reste NULL pour les reviews existantes. Choix volontaire
--   et non-opiniated : pas d'inférence depuis rating pour éviter d'introduire
--   des biais dans les taux de recommandation affichés.
--
-- - NE PAS toucher aux colonnes doublons `response_at` / `response_text`
--   (vs. `reply` / `reply_date`) dans cette migration. Un cleanup séparé
--   sera planifié une fois confirmé par grep code + logs que ces colonnes
--   dupliquées ne sont plus lues/écrites nulle part.
-- =============================================================================
