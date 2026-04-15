-- =============================================================================
-- Migration 445 : sync implicit columns (round 2, drift repair)
-- =============================================================================
-- Date        : 2026-04-15
-- Contexte    : Suite au triage des drifts restants (schema-drift-check.ts,
--               72 issues), cette migration synchronise les colonnes implicites
--               supplémentaires. Cf. 425_sync_implicit_columns.sql (round 1).
--
-- Méthodologie : toutes les opérations sont idempotentes (IF NOT EXISTS /
--                ADD COLUMN IF NOT EXISTS). Pas de backfill : les lignes
--                existantes gardent NULL sur les nouvelles colonnes.
--
-- Source du drift : scripts/schema-drift-check.ts + audit code vs. migrations
--                   2026-04-15.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table : public.reviews — colonnes provider-centric implicites
-- -----------------------------------------------------------------------------
-- Ces colonnes sont référencées par le code (reviews-service, admin-crud,
-- gdpr-service, api/client/avis, api/stats/public, api/services, ...) et
-- documentées dans le commentaire post-migration de 415_reviews_add_missing_columns.sql
-- (ligne 53 : "backfill ... par provider_id + author_email + date").
-- Elles existent en prod (SQL editor) mais n'ont jamais été déclarées en migration.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS author_email TEXT;

COMMENT ON COLUMN public.reviews.author_email IS
  'Email de l''auteur de l''avis. Référencé par api/client/avis (insert), gdpr-service (anonymisation), admin-crud (stats client), review-service (insert). Implicite en prod, formalisé ici.';

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS source TEXT;

COMMENT ON COLUMN public.reviews.source IS
  'Source de l''avis (synthetic, google, trustpilot, internal, ...). Utilisé par api/stats/public pour exclure les avis synthétiques du comptage public.';

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.reviews.is_verified IS
  'Flag d''avis vérifié (booking lié + client authentifié). Distinct de `status = ''published''`. Présent dans le schéma historique app.reviews (migration 110, droppée en 416).';

-- -----------------------------------------------------------------------------
-- Table : public.providers — colonnes implicites
-- -----------------------------------------------------------------------------

-- 1. website : URL du site web de l'artisan. Référencée par :
--    - src/app/api/artisan/stats/route.ts (select L131)
--    - src/lib/services/artisan-profile-service.ts (L279)
--    Jamais ajoutée via ALTER TABLE explicite (seul app.artisans de 110 l'a).
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS website TEXT;

COMMENT ON COLUMN public.providers.website IS
  'URL du site web de l''artisan (profil public). Implicite en prod (SQL editor), formalisé ici.';

-- 2. is_rge : flag RGE (Reconnu Garant de l'Environnement). Utilisé pour
--    éligibilité CEE. Référencé par :
--    - src/app/(private)/espace-artisan/cee/nouveau/page.tsx (L33)
--    - src/app/(private)/espace-artisan/cee/page.tsx (L81)
--    Colonne dérivable depuis rge_qualifications (NOT NULL), mais stockée en dur
--    pour perf (évite jointure sur pages CEE à fort trafic).
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS is_rge BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.providers.is_rge IS
  'Flag RGE (Reconnu Garant de l''Environnement) : éligibilité CEE. Dénormalisation de rge_qualifications pour perf.';

CREATE INDEX IF NOT EXISTS idx_providers_is_rge
  ON public.providers(is_rge)
  WHERE is_rge = true;

-- -----------------------------------------------------------------------------
-- Table : public.analytics_events — colonne user_id implicite
-- -----------------------------------------------------------------------------
-- Le schéma v2 (345_analytics_events_v2.sql) NE contient PAS user_id, seulement
-- provider_id + visitor_id (346). Le code analytics-service.ts:55 insère user_id.
-- Soit la colonne existe implicitement en prod, soit l'insert est ignoré
-- silencieusement. On la formalise (nullable, pas de FK : l'user peut être
-- anonyme ou supprimé sans casser les events historiques).
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS user_id UUID;

COMMENT ON COLUMN public.analytics_events.user_id IS
  'User authentifié ayant déclenché l''event (nullable, pas de FK pour garder l''historique même après suppression du user). Distinct de visitor_id (anonyme).';

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id
  ON public.analytics_events(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Table : public.user_preferences — created_at
-- -----------------------------------------------------------------------------
-- 004_video_documents_admin.sql ligne 182 déclare seulement `updated_at`. Le
-- code gdpr-service.ts:438 sélectionne `created_at`. Ajout nullable (ou défaut
-- NOW() pour les futures lignes).
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

COMMENT ON COLUMN public.user_preferences.created_at IS
  'Horodatage de création de la préférence user. Référencé par l''export GDPR.';

-- -----------------------------------------------------------------------------
-- Table : public.bookings — notes
-- -----------------------------------------------------------------------------
-- Référencé par gdpr-service.ts:554 (export GDPR des bookings). Jamais déclaré
-- en migration, mais champ standard booking.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN public.bookings.notes IS
  'Notes libres sur la réservation (champ optionnel). Référencé par l''export GDPR.';

-- -----------------------------------------------------------------------------
-- Table : public.services — colonnes de taxonomie et SEO
-- -----------------------------------------------------------------------------
-- 001_base_schema.sql déclare services(id, name, slug, description, is_active,
-- created_at). 311 ajoute (category, icon, sort_order). Le code admin-crud-service
-- insère/update parent_id, meta_title, meta_description, updated_at.
-- On formalise ces colonnes d'admin CRUD.
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.services(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.services.parent_id IS
  'FK self-référence pour la taxonomie parent/enfant des services. Permet de grouper des sous-services sous un service parent.';

CREATE INDEX IF NOT EXISTS idx_services_parent_id
  ON public.services(parent_id)
  WHERE parent_id IS NOT NULL;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS meta_title TEXT;

COMMENT ON COLUMN public.services.meta_title IS
  'Balise <title> SEO dédiée pour les pages service (défaut = name).';

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

COMMENT ON COLUMN public.services.meta_description IS
  'Meta description SEO dédiée pour les pages service (défaut = description).';

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

COMMENT ON COLUMN public.services.updated_at IS
  'Horodatage de dernière modification (admin CRUD).';

-- -----------------------------------------------------------------------------
-- Table : public.quotes — colonnes booking-centric implicites
-- -----------------------------------------------------------------------------
-- 100_v2_schema_cleanup.sql déclare quotes(request_id, provider_id, amount, ...).
-- Le code quotes-service.ts:242 insère booking_id + client_id + items.
-- Soit ces colonnes existent implicitement en prod, soit ce code path est
-- mort. On les ajoute en nullable pour préserver le comportement actuel sans
-- rendre l'insert bloquant.
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.quotes.booking_id IS
  'FK optionnelle vers bookings (quote liée à une réservation directe, sans devis_request). Coexiste avec request_id.';

CREATE INDEX IF NOT EXISTS idx_quotes_booking_id
  ON public.quotes(booking_id)
  WHERE booking_id IS NOT NULL;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.quotes.client_id IS
  'FK optionnelle vers profiles (client ciblé par la quote, dénormalisation pour perf dashboard).';

CREATE INDEX IF NOT EXISTS idx_quotes_client_id
  ON public.quotes(client_id)
  WHERE client_id IS NOT NULL;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.quotes.items IS
  'Lignes de la quote (structure libre : label, quantité, prix unitaire, ...). Default [].';

-- =============================================================================
-- Notes post-migration :
--
-- - Toutes les colonnes sont IF NOT EXISTS : replay safe, pas d'effet secondaire
--   si déjà présentes en prod.
-- - Aucune colonne droppée : cette migration n'enlève rien.
-- - Les drifts restants (scanner false positives) sont whitelistés dans
--   scripts/.schema-drift-ignore (cf. commit associé).
--
-- Drifts ADRESSÉS par cette migration :
--   * reviews.author_email (6 refs), reviews.source, reviews.is_verified
--   * providers.website (3 refs), providers.is_rge (2 refs)
--   * analytics_events.user_id
--   * user_preferences.created_at
--   * bookings.notes
--   * services.parent_id, meta_title, meta_description, updated_at
--   * quotes.booking_id, client_id, items
--
-- Drifts ADRESSÉS ailleurs :
--   * messages.reply_to_message_id / rich_content : colonnes droppées en 102,
--     retirées du code (src/lib/realtime/chat-service.ts)
--   * notifications.provider_id / body : schéma réel est user_id / message,
--     code corrigé (src/lib/services/notifications-service.ts)
-- =============================================================================
