-- =============================================================================
-- seed.sql — Donnees de test minimales pour ServicesArtisans
-- =============================================================================
-- Usage :
--   supabase db reset        (applique migrations + seed automatiquement)
--   psql -f supabase/seed.sql (application manuelle)
--
-- ATTENTION : Ne contient PAS de donnees de production.
--             Ne pas commiter de secrets ou de vrais numeros de telephone.
-- =============================================================================

-- ============================================================
-- 1. Services de test (2 metiers de base)
-- ============================================================
INSERT INTO services (id, name, slug, description, is_active, created_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Plombier', 'plombier',
   'Installation et reparation de plomberie, debouchage, chauffe-eau.',
   TRUE, NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'Electricien', 'electricien',
   'Installation electrique, depannage, mise aux normes.',
   TRUE, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Location de test (Paris)
-- ============================================================
INSERT INTO locations (id, name, slug, postal_code, department_code, department_name, region_code, region_name, latitude, longitude, population, is_active, created_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Paris', 'paris',
   '75000', '75', 'Paris', '11', 'Ile-de-France',
   48.8566, 2.3522, 2161000, TRUE, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- NOTE : Pas de seed pour profiles, providers, bookings, etc.
-- Ces donnees sont creees dynamiquement par l'application
-- (inscription, import, scraping, reservations, etc.)
-- ============================================================
