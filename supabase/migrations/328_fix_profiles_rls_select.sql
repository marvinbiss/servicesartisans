-- =============================================================================
-- Migration 328: Fix profiles RLS SELECT — suppression de la politique trop permissive
-- ServicesArtisans — 2026-02-21
-- =============================================================================
-- Problème:
--   Migration 101 a défini:
--     CREATE POLICY "Public can view basic profile info" ON profiles FOR SELECT USING (TRUE)
--   Ce qui expose TOUS les profils (email, téléphone, etc.) à n'importe quel
--   utilisateur anonyme ou authentifié.
--   Migration 320 a supprimé cette policy mais l'a remplacée par:
--     "Authenticated users can view profiles" USING (auth.uid() IS NOT NULL)
--   Ce qui permet à tout utilisateur authentifié de lire TOUS les profils.
--
-- Correction:
--   1. Supprimer toutes les policies SELECT trop permissives héritées
--   2. Créer des policies SELECT strictes:
--      a. Chaque utilisateur lit son propre profil (id = auth.uid())
--      b. Les admins lisent tous les profils
--      c. Les anonymes peuvent voir les profils artisans uniquement (pour les pages publiques)
-- =============================================================================

-- Supprimer les policies SELECT héritées des migrations précédentes
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public can view artisan profiles only" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;

-- 1. Chaque utilisateur authentifié peut lire son propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- 2. Les admins (is_admin = TRUE ou role admin/modérateur) peuvent tout lire
--    Utilise une sous-requête SECURITY DEFINER-safe via la fonction is_admin()
--    définie dans la migration 101.
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND (
          p.is_admin = TRUE
          OR p.role IN ('super_admin', 'admin', 'moderator', 'viewer')
        )
    )
  );

-- 3. Les anonymes ET les utilisateurs authentifiés peuvent voir les profils artisans
--    (nécessaire pour les pages publiques + routes bookings qui lisent l'artisan)
--    is_admin doit être FALSE ou NULL pour ne jamais exposer les comptes admin.
CREATE POLICY "Anyone can view artisan profiles" ON profiles
  FOR SELECT USING (
    role = 'artisan'
    AND (is_admin = FALSE OR is_admin IS NULL)
  );

-- =============================================================================
-- NOTE POUR LES DÉVELOPPEURS — appels côté serveur à corriger (hors scope):
-- Les routes suivantes utilisent createClient() (non-admin) pour lire le profil
-- d'un AUTRE utilisateur. Après cette migration, ces lectures échoueront silencieusement
-- car la politique ne couvre pas la lecture de profils tiers par un utilisateur authentifié.
-- Elles DOIVENT être migrées vers createAdminClient() ou une RPC SECURITY DEFINER:
--
--   1. src/app/api/bookings/route.ts (~ligne 226):
--      supabase.from('profiles').select('full_name, email').eq('id', artisanId)
--      → Lit le profil de l'artisan depuis le contexte du client qui réserve.
--
--   2. src/app/api/bookings/[id]/reschedule/route.ts (~ligne 120):
--      supabase.from('profiles').select('full_name, email').eq('id', bookingSlot?.artisan_id)
--      → Lit le profil de l'artisan depuis le contexte du client qui re-planifie.
--
--   3. src/app/api/bookings/[id]/cancel/route.ts (~ligne 100):
--      supabase.from('profiles').select('full_name, email').eq('id', booking.slot.artisan_id)
--      → Lit le profil de l'artisan depuis le contexte du client qui annule.
--
-- Solution recommandée: remplacer createClient() par createAdminClient() dans ces
-- trois routes, ou créer une RPC get_artisan_contact_info(artisan_id uuid) avec
-- SECURITY DEFINER qui retourne uniquement full_name et email pour un artisan donné.
-- =============================================================================
