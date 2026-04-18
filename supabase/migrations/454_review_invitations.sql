-- =====================================================================
-- Migration 454 : review_invitations — bridge devis_requests → reviews
-- Date : 2026-04-18
--
-- Contexte :
--   Le cron existant send-review-requests ne lit que la table `bookings`
--   (RDV confirmes/termines). Les 80% du volume viennent de /api/devis
--   qui alimente `devis_requests` — pipeline qui ne declenche aujourd'hui
--   aucune collecte d'avis. D'ou 0 avis live en prod.
--
-- Solution :
--   Nouvelle table `review_invitations` qui :
--     1. Est creee automatiquement par processDevis() apres chaque devis
--        (scheduled_at = created_at + 7 jours, window standard industrie).
--     2. Est lue par un nouveau cron send-review-invitations qui envoie
--        l'email d'invitation avec un token HMAC URL-safe.
--     3. Trace sent_at, completed_at, review_id pour eviter les doublons
--        et mesurer le funnel collecte.
--
-- Securite :
--   - RLS deny-all par defaut cote public (writes via service_role only).
--   - Token stocke en hash SHA256 (le plaintext est transmis par email
--     puis HMAC-compare cote API /api/reviews/submit-invitation).
--   - Expiration automatique a scheduled_at + 30 jours.
-- =====================================================================

-- 1. Table principale
CREATE TABLE IF NOT EXISTS public.review_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_request_id UUID NOT NULL REFERENCES public.devis_requests(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  client_email TEXT NOT NULL,
  client_name TEXT,
  service_name TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_invitations_scheduled_before_expires
    CHECK (scheduled_at < expires_at)
);

-- 2. Indexes
-- Cron scan : pending invitations dont la fenetre d'envoi est ouverte
CREATE INDEX IF NOT EXISTS idx_review_invitations_pending
  ON public.review_invitations (scheduled_at)
  WHERE sent_at IS NULL AND completed_at IS NULL;

-- Lookup par token_hash (API /api/reviews/submit-invitation)
CREATE INDEX IF NOT EXISTS idx_review_invitations_token_hash
  ON public.review_invitations (token_hash);

-- FK lookups
CREATE INDEX IF NOT EXISTS idx_review_invitations_devis_request
  ON public.review_invitations (devis_request_id);

CREATE INDEX IF NOT EXISTS idx_review_invitations_provider
  ON public.review_invitations (provider_id)
  WHERE provider_id IS NOT NULL;

-- Analytics : invitations envoyees, taux de completion
CREATE INDEX IF NOT EXISTS idx_review_invitations_sent_at
  ON public.review_invitations (sent_at)
  WHERE sent_at IS NOT NULL;

-- 3. Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_review_invitations_updated_at()
RETURNS TRIGGER AS $BODY$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_invitations_updated_at ON public.review_invitations;
CREATE TRIGGER trg_review_invitations_updated_at
  BEFORE UPDATE ON public.review_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_review_invitations_updated_at();

-- 4. RLS : deny-all par defaut, service_role bypass RLS
ALTER TABLE public.review_invitations ENABLE ROW LEVEL SECURITY;

-- Admin full access
DROP POLICY IF EXISTS "Admins manage review_invitations" ON public.review_invitations;
CREATE POLICY "Admins manage review_invitations"
  ON public.review_invitations
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Aucune policy public : les writes/reads publics passent par service_role
-- (createAdminClient) via les endpoints API dedies :
--   - POST /api/reviews/submit-invitation/[token] (cote client)
--   - GET  /api/cron/send-review-invitations      (cote cron)

-- 5. Commentaires pour l'equipe
COMMENT ON TABLE public.review_invitations IS
  'Invitations d''avis declenchees apres devis_requests. Cron send-review-invitations lit scheduled_at, envoie email, marque sent_at. Client submit via token → completed_at + review_id.';

COMMENT ON COLUMN public.review_invitations.token_hash IS
  'SHA256(plaintext_token). Le plaintext est envoye dans l''URL email et compare via hash cote serveur. Ne stocker que le hash.';

COMMENT ON COLUMN public.review_invitations.scheduled_at IS
  'Moment auquel l''email doit etre envoye. Typiquement devis_request.created_at + 7 jours (window standard collecte post-travaux).';

COMMENT ON COLUMN public.review_invitations.expires_at IS
  'Apres cette date, le token n''est plus valide et le cron ignore l''invitation. Default scheduled_at + 30 jours.';

-- =====================================================================
-- Rollback (a executer manuellement si besoin) :
--
--   DROP TRIGGER IF EXISTS trg_review_invitations_updated_at ON public.review_invitations;
--   DROP FUNCTION IF EXISTS public.set_review_invitations_updated_at();
--   DROP TABLE IF EXISTS public.review_invitations CASCADE;
-- =====================================================================
