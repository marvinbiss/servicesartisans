-- =====================================================================
-- Migration 417 : Correctif RLS reviews — clean sweep INSERT + FORCE RLS
-- =====================================================================
-- Date    : 2026-04-12
--
-- Contexte :
--   Après application de la migration 414 (RLS hardening), un test
--   d'intrusion via la clé anon Supabase a montré que l'INSERT anon
--   passait toujours (HTTP 201 + ligne insérée). Diagnostic `pg_policies` :
--   trois policies permissives INSERT/SELECT subsistaient alors que les
--   DROP POLICY IF EXISTS de la migration 414 auraient dû les supprimer.
--
--     - "Anyone can view reviews"                SELECT  USING (true)
--     - "Anyone can create reviews"              INSERT  WITH CHECK (true)
--     - "Authenticated users can create reviews" INSERT  WITH CHECK (auth.uid() IS NOT NULL)
--
--   Hypothèse : noms de policies contenant des whitespace/zero-width chars
--   invisibles dans le SQL editor → le matching exact `DROP POLICY
--   IF EXISTS "Nom"` ne capturait pas. Le fix d'origine avec ILIKE a
--   partiellement marché mais a laissé la troisième policy en place
--   (probablement même cause).
--
--   Approche retenue ici : CLEAN SWEEP — on drop TOUTES les policies
--   INSERT sur public.reviews, quel que soit leur nom, via un DO block
--   dynamique. C'est sûr parce que la policy "Admins can manage all
--   reviews" (FOR ALL) couvre déjà l'INSERT admin, et les writes publics
--   doivent obligatoirement passer par le service_role côté serveur
--   (POST /api/reviews avec createAdminClient → bypass RLS via rôle
--   service_role qui a l'attribut BYPASSRLS).
--
--   En prod, ce fix a été appliqué à chaud via le SQL editor et validé
--   par un curl anon qui retourne désormais HTTP 401 +
--   "new row violates row-level security policy for table reviews".
-- =====================================================================

-- 1. Clean sweep : DROP toutes les policies INSERT existantes sur reviews.
--    Dynamique pour être robuste aux noms invisibles/avec whitespace.
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.reviews', p.policyname);
    RAISE NOTICE 'Migration 417: dropped residual INSERT policy: %', p.policyname;
  END LOOP;
END $$;

-- 2. Nettoyage des éventuelles "Anyone can view reviews" résiduelles
--    (le clean sweep ci-dessus ne touche pas aux SELECT).
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND cmd = 'SELECT'
      AND policyname ILIKE '%anyone%'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.reviews', p.policyname);
    RAISE NOTICE 'Migration 417: dropped residual SELECT policy: %', p.policyname;
  END LOOP;
END $$;

-- 3. FORCE ROW LEVEL SECURITY
--    Par défaut, RLS est bypassé pour le owner de la table et les
--    superusers Postgres. FORCE l'impose à TOUS les rôles, y compris
--    owner. Le service_role Supabase garde son privilège via l'attribut
--    de rôle BYPASSRLS, donc les writes via createAdminClient continuent
--    de fonctionner. Seul un accès direct superuser (SQL editor) bypass.
ALTER TABLE public.reviews FORCE ROW LEVEL SECURITY;

-- =====================================================================
-- État final attendu après cette migration :
--   - 5 policies au total sur public.reviews :
--       * "Admins can manage all reviews"      (ALL,    is_admin())
--       * "Admins can view all reviews"        (SELECT, is_admin())
--       * "Public can view published reviews"  (SELECT, status='published')
--       * "Providers can view own reviews"     (SELECT, provider match)
--       * "Providers can reply to own reviews" (UPDATE, provider match)
--   - Zéro policy INSERT permissive → anon/authenticated ne peuvent
--     plus insérer directement via PostgREST.
--   - FORCE ROW LEVEL SECURITY activé (relforcerowsecurity=true).
--
-- Test de non-régression (validé 2026-04-12) via PostgREST anon key :
--
--   curl -X POST 'https://<ref>.supabase.co/rest/v1/reviews' \
--     -H "apikey: <anon>" -H "Authorization: Bearer <anon>" \
--     -H "Content-Type: application/json" \
--     -d '{"provider_id":"<valid_uuid>","rating":5,"content":"rls test"}'
--
--   -> HTTP 401
--   -> {"code":"42501","message":"new row violates row-level security
--       policy for table \"reviews\""}
-- =====================================================================
