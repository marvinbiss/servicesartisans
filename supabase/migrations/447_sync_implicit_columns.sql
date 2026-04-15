-- =============================================================================
-- Migration 425 : sync implicit columns (drift repair, migrations <-> prod)
-- =============================================================================
-- Date        : 2026-04-15
-- Contexte    : Colonnes présentes en prod (créées via Supabase SQL editor) mais
--               jamais déclarées dans les migrations. Cette migration aligne
--               migrations/ avec prod pour qu'un replay from scratch produise
--               le même schéma.
--
-- Méthodologie : pour chaque colonne, preuve d'existence en prod via
--                références dans indexes/RLS/triggers d'autres migrations.
--                Toutes les ops sont idempotentes (IF NOT EXISTS).
--
-- Source du drift : scripts/schema-drift-check.ts + audit manuel des
--                   migrations 014, 021, 414, 415, 416, 417, 421.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table : public.reviews
-- -----------------------------------------------------------------------------
-- La table `reviews` a été créée par migration 021 avec un schéma orienté
-- booking (booking_id, artisan_id, comment, artisan_response, ...). Mais le
-- code applicatif et les migrations ultérieures (014 triggers, 414 RLS,
-- 421 indexes composites) référencent un schéma provider-centric :
--   provider_id, content, author_name, reply, reply_date, is_visible.
-- Ces colonnes ont été ajoutées en prod via SQL editor (cf. 416 qui documente
-- explicitement le schéma "dupliqué author_name/content/..." côté app.reviews).
-- -----------------------------------------------------------------------------

-- 1. provider_id : FK vers providers, utilisée par :
--    - 014_reviews_trust.sql (trigger update_provider_rating, ligne 145-160)
--    - 414_reviews_rls_hardening.sql (policies INSERT/UPDATE providers)
--    - 421_reviews_provider_composite_indexes.sql (idx composite)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_reviews_provider_id
  ON public.reviews(provider_id)
  WHERE provider_id IS NOT NULL;

COMMENT ON COLUMN public.reviews.provider_id IS
  'FK vers providers.id. Schéma provider-centric coexistant avec booking_id/artisan_id. Référencé par triggers (014), RLS (414), indexes (421).';

-- 2. content : texte de l'avis (schéma provider-centric, distinct de `comment`
--    utilisé par le schéma booking-centric). Référencé par :
--    - 014_reviews_trust.sql (CREATE TABLE review_response_templates.content,
--      mais aussi via reviews dans le code)
--    - 414_reviews_rls_hardening.sql (ligne 109 : exemple INSERT reviews
--      (provider_id, rating, content))
--    - 416_drop_orphan_app_reviews.sql (documentation "author_name/content/")
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS content TEXT;

COMMENT ON COLUMN public.reviews.content IS
  'Texte de l''avis (schéma provider-centric). Coexiste avec `comment` (schéma booking-centric).';

-- 3. author_name : nom du reviewer (schéma provider-centric, distinct de
--    `client_name`). Référencé par :
--    - 014_reviews_trust.sql (ligne 212 : WHERE r.author_name = p.full_name)
--    - 416_drop_orphan_app_reviews.sql (documentation)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS author_name TEXT;

COMMENT ON COLUMN public.reviews.author_name IS
  'Nom affiché de l''auteur de l''avis (schéma provider-centric). Coexiste avec `client_name` (schéma booking-centric).';

-- 4. reply + reply_date : réponse artisan (schéma provider-centric, distinct de
--    `artisan_response`/`artisan_responded_at` et `response_text`/`response_at`).
--    Référencés par :
--    - 414_reviews_rls_hardening.sql (policy "Providers can reply to own
--      reviews", commentaire ligne 64-67 "répondre (reply / reply_date)")
--    - 415_reviews_add_missing_columns.sql (note post-migration ligne 60-63 :
--      "NE PAS toucher aux colonnes doublons response_at/response_text
--      vs. reply/reply_date")
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reply TEXT;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reply_date TIMESTAMPTZ;

COMMENT ON COLUMN public.reviews.reply IS
  'Réponse du provider à l''avis (schéma provider-centric). Coexiste avec artisan_response/response_text. Cleanup prévu hors scope.';
COMMENT ON COLUMN public.reviews.reply_date IS
  'Horodatage de la réponse provider. Coexiste avec artisan_responded_at/response_at.';

-- 5. is_visible : flag de visibilité (distinct de `status = 'published'`).
--    Utilisé par :
--    - 014_reviews_trust.sql (ligne 160 : WHERE provider_id = v AND is_visible
--      = true ; ligne 197 : idx_reviews_provider_rating ... WHERE is_visible ;
--      ligne 259 : WHERE is_visible = true dans la MV rating refresh)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.reviews.is_visible IS
  'Flag de visibilité utilisé par les triggers de rating (014) et les indexes partiels. Coexiste avec `status`.';

-- =============================================================================
-- À trier dans une autre migration (référencés en code mais origine incertaine)
-- =============================================================================
-- Les items ci-dessous ont été flaggés par schema-drift-check.ts mais NE sont
-- PAS ajoutés ici, faute de preuve d'existence en prod via les migrations :
--
-- - providers.is_rge (BOOLEAN) : utilisé uniquement côté code
--   (src/app/(private)/espace-artisan/cee/**), jamais dans une migration.
--   Hypothèse 1 : colonne implicite ajoutée via SQL editor.
--   Hypothèse 2 : dérivation à calculer depuis rge_qualifications (non NULL).
--   --> audit manuel requis + décision côté équipe data/CEE avant ADD COLUMN.
--
-- - services.service_id, services.city : faux positif probable du scanner
--   (alias de join `.from('services').select('..., service_id:id, city')`).
--   À valider avec l'auteur de la requête devis/weekly-count/route.ts L43.
--
-- - prospection_conversations.prospection_contacts/prospection_campaigns :
--   faux positif probable du scanner (FK joins via alias nommés).
--   Voir api/admin/prospection/ai/generate/route.ts L34 — c'est un select
--   avec embed PostgREST, pas une vraie colonne.
--
-- - Les items suivants sont déjà couverts par des migrations explicites et
--   représentent des faux positifs du scanner (ne pas ré-ajouter) :
--     * devis_requests.pipedrive_synced_at/sync_attempts (377), dead_letter_at
--       (412)
--     * profiles.average_rating/review_count (021)
--     * providers.website (110 inline), providers.rge_last_synced_at (380)
--     * simulateur_estimations.nom/email/telephone/anonymized_at/deleted_at
--       (440)
--   --> corriger le scanner pour qu'il prenne en compte ces migrations.
-- =============================================================================
