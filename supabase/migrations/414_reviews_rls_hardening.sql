-- =====================================================================
-- Migration 414 : Durcissement RLS sur public.reviews
-- Date : 2026-04-12
--
-- Problème :
--   Les policies historiques de la table `reviews` sont ouvertes :
--     - "Anyone can view reviews"  SELECT  USING (true)
--     - "Anyone can create reviews" INSERT WITH CHECK (true)
--   Cela constitue une faille de sécurité :
--     1. Fuite de données : les reviews non publiées (status != 'published',
--        en attente de modération, rejetées, etc.) sont lisibles par n'importe
--        quel client anon.
--     2. Spam anonyme : n'importe qui peut insérer des reviews via la clé
--        anon Supabase sans authentification ni contrôle serveur.
--
-- Fix :
--   - deny-all par défaut sur les writes côté anon (aucune policy permissive
--     INSERT/DELETE côté public — donc refus RLS systématique).
--   - Les reads publics sont restreints à status = 'published'.
--   - Les admins gardent un accès total (is_admin()).
--   - Les providers peuvent voir leurs propres reviews et y répondre.
--   - Tous les writes anonymes (création de review depuis le formulaire
--     public) doivent passer par le service_role côté serveur (route
--     /api/reviews avec createAdminClient) — bascule code hors scope ici.
-- =====================================================================

-- 1. Supprimer les policies problématiques historiques
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;

-- 2. S'assurer que RLS est bien activée sur la table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Nettoyage idempotent des nouvelles policies (au cas où re-run)
DROP POLICY IF EXISTS "Public can view published reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Providers can view own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Providers can reply to own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;

-- 4. Lecture publique : uniquement les reviews publiées
CREATE POLICY "Public can view published reviews"
  ON public.reviews
  FOR SELECT
  USING (status = 'published');

-- 5. Lecture admin : accès total en lecture
CREATE POLICY "Admins can view all reviews"
  ON public.reviews
  FOR SELECT
  USING (is_admin());

-- 6. Lecture provider : un provider peut voir toutes les reviews qui le
--    concernent, quel que soit leur status (utile pour dashboard pro).
CREATE POLICY "Providers can view own reviews"
  ON public.reviews
  FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- 7. Update provider : un provider peut répondre (reply / reply_date) à
--    ses propres reviews. Le WITH CHECK empêche qu'il réassigne la review
--    à un autre provider_id.
CREATE POLICY "Providers can reply to own reviews"
  ON public.reviews
  FOR UPDATE
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    provider_id IN (
      SELECT id FROM public.providers WHERE user_id = auth.uid()
    )
  );

-- 8. Admins : contrôle total (SELECT / INSERT / UPDATE / DELETE)
CREATE POLICY "Admins can manage all reviews"
  ON public.reviews
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================================
-- Notes post-deploy
-- =====================================================================
-- Conséquences immédiates côté clé anon Supabase :
--   - INSERT anonyme : IMPOSSIBLE (aucune policy INSERT permissive pour
--     anon/authenticated côté public). Toute tentative retourne un refus
--     RLS (new row violates row-level security policy).
--   - DELETE anonyme : IMPOSSIBLE (idem, seul "Admins can manage all
--     reviews" couvre DELETE et exige is_admin()).
--   - SELECT anonyme : limité aux lignes où status = 'published'.
--
-- Action code requise (HORS SCOPE de cette migration) :
--   Le endpoint POST /api/reviews (création review depuis formulaire
--   public) DOIT être basculé sur le service_role client
--   (lib/supabase/admin.ts → createAdminClient) pour continuer à
--   fonctionner. Toute la validation (rate limit, anti-spam, captcha,
--   authenticity_score) doit vivre côté serveur avant insert.
--
-- Tests manuels post-deploy (Supabase SQL editor en session anon) :
--   1. SELECT id, status FROM public.reviews LIMIT 50;
--      -> doit retourner uniquement des lignes avec status = 'published'.
--   2. INSERT INTO public.reviews (provider_id, rating, content)
--        VALUES ('<uuid>', 5, 'test spam');
--      -> doit être rejeté :
--         "new row violates row-level security policy for table reviews".
--   3. En session admin (JWT avec claim is_admin) :
--      SELECT count(*) FROM public.reviews;
--      -> doit retourner le total (toutes statuts confondus).
-- =====================================================================
