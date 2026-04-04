-- =============================================================================
-- Migration 001 : Schema de base — ServicesArtisans
-- =============================================================================
-- CONTEXTE :
--   Cette migration cree les tables fondamentales que toutes les migrations
--   suivantes (002+) ALTER ou referencent via FK.
--   En production, ce schema a ete cree via le Supabase Dashboard.
--   Cette migration permet un fresh deploy reproductible.
--
-- IDEMPOTENCE :
--   Toutes les instructions utilisent IF NOT EXISTS / IF EXISTS.
--   Safe to re-run.
-- =============================================================================

-- Extensions requises
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PROFILES
-- =============================================================================
-- Etendu par : 021 (average_rating, review_count), 100 (is_admin, drop video cols),
--              309 (role, subscription_plan, stripe_customer_id)
-- FK depuis : providers, bookings, reviews, conversations, documents, etc.
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  phone         TEXT,
  phone_e164    TEXT,
  user_type     TEXT DEFAULT 'client'
                CHECK (user_type IN ('client', 'artisan')),
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique de base : les utilisateurs voient leur propre profil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Politique de base : les utilisateurs peuvent modifier leur propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique de base : insertion autorisee pour l'utilisateur lui-meme
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

COMMENT ON TABLE profiles IS 'Profils utilisateurs lies a auth.users. Cree au premier login (OAuth callback ou inscription).';


-- =============================================================================
-- 2. SERVICES
-- =============================================================================
-- Etendu par : 311 (category, icon, sort_order + 50 metiers)
-- Referencee par : provider_services, devis_requests (100)
-- =============================================================================
CREATE TABLE IF NOT EXISTS services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS : lecture publique
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view services" ON services;
CREATE POLICY "Public can view services" ON services
  FOR SELECT USING (true);

COMMENT ON TABLE services IS 'Liste des metiers/services artisanaux (plombier, electricien, etc.)';


-- =============================================================================
-- 3. LOCATIONS
-- =============================================================================
-- Referencee par : provider_locations
-- Enrichie par : 104 (seed Paris), 105 (wave2 geo)
-- =============================================================================
CREATE TABLE IF NOT EXISTS locations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  postal_code       TEXT,
  department_code   TEXT,
  department_name   TEXT,
  region_code       TEXT,
  region_name       TEXT,
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  population        INTEGER,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS : lecture publique
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view locations" ON locations;
CREATE POLICY "Public can view locations" ON locations
  FOR SELECT USING (true);

COMMENT ON TABLE locations IS 'Villes/communes pour le maillage geo (provider_locations junction).';


-- =============================================================================
-- 4. PROVIDERS
-- =============================================================================
-- Table centrale de l'annuaire artisans.
-- Etendu par de nombreuses migrations :
--   007 (indexes), 009 (geography expand), 011 (rating, specialty, etc.),
--   100 (stable_id, noindex, drop toxic cols), 103 (last_lead_assigned_at),
--   306 (public page fields), 314 (claimed_at/by), 347 (phone_source), etc.
-- =============================================================================
CREATE TABLE IF NOT EXISTS providers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Identite
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  email               TEXT,
  phone               TEXT,
  siret               TEXT,
  siren               TEXT,

  -- Adresse
  address_street      TEXT,
  address_city        TEXT,
  address_postal_code TEXT,
  address_department  VARCHAR(50),
  address_region      VARCHAR(50),

  -- Metier
  specialty           TEXT,
  specialty_slug      TEXT,
  meta_description    TEXT,
  description         TEXT,

  -- Geolocalisation (ajoutee/enrichie par 010)
  latitude            DECIMAL(10, 8),
  longitude           DECIMAL(11, 8),

  -- Reputation (ajoutee par 011, enrichie par 104)
  rating_average      DECIMAL(3, 2) DEFAULT 0,
  review_count        INTEGER DEFAULT 0,

  -- Source / enrichissement
  source              TEXT,
  source_id           TEXT,
  experience_years    INTEGER,

  -- Statut
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  is_available        BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour l'annuaire
DROP POLICY IF EXISTS "Public can view active providers" ON providers;
CREATE POLICY "Public can view active providers" ON providers
  FOR SELECT USING (true);

-- Les artisans peuvent modifier leur propre fiche
DROP POLICY IF EXISTS "Artisans can update own provider" ON providers;
CREATE POLICY "Artisans can update own provider" ON providers
  FOR UPDATE USING (auth.uid() = user_id);

-- Index de base (indexes avances dans 007)
CREATE INDEX IF NOT EXISTS idx_providers_slug ON providers(slug);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_is_active ON providers(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE providers IS 'Fiches artisans de l''annuaire. Creees par scraping/import, revendiquees par les artisans via provider_claims.';


-- =============================================================================
-- 5. PROVIDER_SERVICES (junction N:N)
-- =============================================================================
-- Indexes avances dans 007
-- =============================================================================
CREATE TABLE IF NOT EXISTS provider_services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider_id, service_id)
);

-- RLS
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view provider services" ON provider_services;
CREATE POLICY "Public can view provider services" ON provider_services
  FOR SELECT USING (true);

COMMENT ON TABLE provider_services IS 'Association N:N entre providers et services.';


-- =============================================================================
-- 6. PROVIDER_LOCATIONS (junction N:N)
-- =============================================================================
-- Indexes avances dans 007
-- =============================================================================
CREATE TABLE IF NOT EXISTS provider_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider_id, location_id)
);

-- RLS
ALTER TABLE provider_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view provider locations" ON provider_locations;
CREATE POLICY "Public can view provider locations" ON provider_locations
  FOR SELECT USING (true);

COMMENT ON TABLE provider_locations IS 'Association N:N entre providers et locations (zones d''intervention).';


-- =============================================================================
-- 7. AVAILABILITY_SLOTS
-- =============================================================================
-- Etendu par : 002 (is_available)
-- Referencee par : bookings (slot_id FK), 019 (atomic booking function)
-- =============================================================================
CREATE TABLE IF NOT EXISTS availability_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Artisans gerent leurs propres creneaux
DROP POLICY IF EXISTS "Artisans can manage own slots" ON availability_slots;
CREATE POLICY "Artisans can manage own slots" ON availability_slots
  FOR ALL USING (auth.uid() = artisan_id);

-- Lecture publique pour la reservation
DROP POLICY IF EXISTS "Public can view available slots" ON availability_slots;
CREATE POLICY "Public can view available slots" ON availability_slots
  FOR SELECT USING (is_available = TRUE);

CREATE INDEX IF NOT EXISTS idx_availability_slots_artisan ON availability_slots(artisan_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_date ON availability_slots(artisan_id, date);

COMMENT ON TABLE availability_slots IS 'Creneaux de disponibilite des artisans pour le systeme de reservation.';


-- =============================================================================
-- 8. BOOKINGS
-- =============================================================================
-- Etendu par : 002 (cancelled_at, payment_status, etc.), 004 (video cols — dropped en 100)
-- Referencee par : reviews (021), notification_logs (002), invoices (006),
--                  conversations (005), quotes (100), disputes (010)
-- =============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  provider_id         UUID REFERENCES providers(id) ON DELETE SET NULL,
  client_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  slot_id             UUID REFERENCES availability_slots(id) ON DELETE SET NULL,

  -- Client info (pas forcement authentifie)
  client_name         TEXT,
  client_email        TEXT,
  client_phone        TEXT,

  -- Service
  service_name        TEXT,
  service_description TEXT,
  service_type        TEXT,

  -- Planning
  scheduled_date      TIMESTAMPTZ,
  address             TEXT,
  city                TEXT,
  postal_code         TEXT,

  -- Paiement
  total_price         DECIMAL(10, 2),
  total_amount        DECIMAL(10, 2),
  deposit_amount      INTEGER DEFAULT 0,
  payment_status      TEXT DEFAULT 'not_required',

  -- Statut
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Les artisans voient les reservations de leur fiche
DROP POLICY IF EXISTS "Artisans can view own bookings" ON bookings;
CREATE POLICY "Artisans can view own bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = artisan_id OR
    auth.uid() = client_id OR
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Les clients peuvent creer des reservations
DROP POLICY IF EXISTS "Clients can create bookings" ON bookings;
CREATE POLICY "Clients can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Les artisans/clients peuvent modifier leurs reservations
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (
    auth.uid() = artisan_id OR
    auth.uid() = client_id OR
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_bookings_artisan ON bookings(artisan_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_id);

COMMENT ON TABLE bookings IS 'Reservations. artisan_id = auth.uid() du profil, provider_id = FK vers providers.';


-- =============================================================================
-- FUNCTION: updated_at trigger generique
-- =============================================================================
-- Utilisee par plusieurs migrations suivantes (010, etc.)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur profiles
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger sur providers
DROP TRIGGER IF EXISTS trigger_providers_updated_at ON providers;
CREATE TRIGGER trigger_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger sur bookings
DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON bookings;
CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- FUNCTION: is_admin() helper
-- =============================================================================
-- Utilisee par : 103 (lead_assignments RLS policy)
-- =============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_admin IS 'Retourne TRUE si l''utilisateur courant est admin. Utilise SECURITY DEFINER pour bypass RLS.';


-- =============================================================================
-- FIN DE LA MIGRATION DE BASE
-- =============================================================================
-- Migrations suivantes :
--   002 : Booking enhancements (cancellation, payment, notifications)
--   003 : Audit logs
--   004 : Video, documents, admin, GDPR
--   005 : Real-time chat (conversations, messages)
--   ...
-- =============================================================================
