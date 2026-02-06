-- =============================================================================
-- SUPABASE V2 — Functions, Triggers & Indexes
-- ServicesArtisans — 2026-02-06
-- =============================================================================
-- This migration:
--   1. Trigger functions (updated_at, search_vector, stable_id, etc.)
--   2. Business logic functions (atomic booking, rating update)
--   3. Performance indexes
--   4. Realtime publications
-- =============================================================================

-- =============================================================================
-- 1. UTILITY FUNCTIONS
-- =============================================================================

-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 2. PROVIDER TRIGGERS
-- =============================================================================

-- 2a. Auto-generate stable_id on INSERT
CREATE OR REPLACE FUNCTION set_provider_stable_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stable_id IS NULL OR NEW.stable_id = '' THEN
    NEW.stable_id := generate_stable_id(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_provider_stable_id ON providers;
CREATE TRIGGER trigger_set_provider_stable_id
  BEFORE INSERT ON providers
  FOR EACH ROW
  EXECUTE FUNCTION set_provider_stable_id();

-- 2b. Prevent stable_id mutation after creation
CREATE OR REPLACE FUNCTION prevent_stable_id_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stable_id IS NOT NULL
     AND OLD.stable_id != ''
     AND NEW.stable_id IS DISTINCT FROM OLD.stable_id
  THEN
    RAISE EXCEPTION 'stable_id is immutable and cannot be changed (provider %)', OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_stable_id_change ON providers;
CREATE TRIGGER trigger_prevent_stable_id_change
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION prevent_stable_id_change();

-- 2c. Auto-update provider location (GEOGRAPHY) from lat/lon
CREATE OR REPLACE FUNCTION update_provider_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_provider_location ON providers;
CREATE TRIGGER trigger_update_provider_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_location();

-- 2d. Auto-update provider search_vector (French full-text search)
CREATE OR REPLACE FUNCTION update_provider_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.specialty, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.meta_description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(NEW.address_city, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(NEW.address_department, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_provider_search_vector ON providers;
CREATE TRIGGER trigger_update_provider_search_vector
  BEFORE INSERT OR UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_search_vector();

-- 2e. Auto-update updated_at on providers
DROP TRIGGER IF EXISTS trigger_providers_updated_at ON providers;
CREATE TRIGGER trigger_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 3. REVIEW TRIGGERS — DEFERRED
-- update_provider_rating() will be created in a later PR when reviews are wired
-- For now, just clean up the old toxic trigger
-- =============================================================================

DROP TRIGGER IF EXISTS trigger_update_provider_rating ON reviews;
DROP TRIGGER IF EXISTS trigger_update_artisan_rating ON reviews;
DROP TRIGGER IF EXISTS trigger_update_provider_trust ON reviews;

-- =============================================================================
-- 4. CONVERSATION TRIGGERS
-- =============================================================================

-- Update conversation.last_message_at on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- =============================================================================
-- 5. UPDATED_AT TRIGGERS FOR ALL TABLES WITH updated_at
-- =============================================================================

-- profiles
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- bookings
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON bookings;
CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- invoices
DROP TRIGGER IF EXISTS trigger_invoice_updated_at ON invoices;
DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON invoices;
CREATE TRIGGER trigger_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- reviews
DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- conversations
DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- devis_requests
DROP TRIGGER IF EXISTS trigger_devis_requests_updated_at ON devis_requests;
CREATE TRIGGER trigger_devis_requests_updated_at
  BEFORE UPDATE ON devis_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- quotes
DROP TRIGGER IF EXISTS trigger_quotes_updated_at ON quotes;
CREATE TRIGGER trigger_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- documents
DROP TRIGGER IF EXISTS trigger_documents_updated_at ON documents;
CREATE TRIGGER trigger_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- portfolio_items
DROP TRIGGER IF EXISTS trigger_portfolio_updated_at ON portfolio_items;
DROP TRIGGER IF EXISTS trigger_portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER trigger_portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- team_members
DROP TRIGGER IF EXISTS trigger_team_members_updated_at ON team_members;
CREATE TRIGGER trigger_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- user_preferences (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    DROP TRIGGER IF EXISTS trigger_user_preferences_updated_at ON user_preferences;
    CREATE TRIGGER trigger_user_preferences_updated_at
      BEFORE UPDATE ON user_preferences
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- =============================================================================
-- 6. BUSINESS LOGIC FUNCTIONS — DEFERRED
-- =============================================================================
-- The following functions are NOT part of the v2 socle minimal.
-- They will be created in dedicated PRs:
--
--   create_booking_atomic()        → PR: booking-v2
--   get_artisan_dashboard_stats()  → PR: dashboard-artisan-v2
--   search_providers_v2()          → PR: search-api-v2
--   update_provider_rating()       → PR: reviews-v2
--
-- For now, just drop the old toxic search function:
DROP FUNCTION IF EXISTS search_providers_by_distance;

-- =============================================================================
-- 8. PERFORMANCE INDEXES
-- =============================================================================

-- ---- Providers ----
CREATE INDEX IF NOT EXISTS idx_providers_stable_id ON providers(stable_id);
CREATE INDEX IF NOT EXISTS idx_providers_slug ON providers(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_siret ON providers(siret) WHERE siret IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_siren ON providers(siren) WHERE siren IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_email ON providers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_providers_source ON providers(source);

-- Active providers (most common query)
CREATE INDEX IF NOT EXISTS idx_providers_active ON providers(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_providers_verified ON providers(is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_providers_verified_active ON providers(is_verified, is_active);
CREATE INDEX IF NOT EXISTS idx_providers_noindex ON providers(noindex) WHERE noindex = FALSE;

-- Geographic
CREATE INDEX IF NOT EXISTS idx_providers_city ON providers(address_city);
CREATE INDEX IF NOT EXISTS idx_providers_postal_code ON providers(address_postal_code);
CREATE INDEX IF NOT EXISTS idx_providers_department ON providers(address_department);
CREATE INDEX IF NOT EXISTS idx_providers_city_verified ON providers(address_city, is_verified, is_active);
CREATE INDEX IF NOT EXISTS idx_providers_location ON providers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_providers_location_gist ON providers USING GIST(location);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_providers_search_vector ON providers USING GIN(search_vector);

-- Sorting
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating_average DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_providers_review_count ON providers(review_count DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_providers_created ON providers(created_at DESC);

-- ---- Services ----
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = TRUE;

-- ---- Locations ----
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_postal ON locations(postal_code);
CREATE INDEX IF NOT EXISTS idx_locations_department ON locations(department_code);

-- ---- Provider junctions ----
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_service ON provider_services(service_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_primary ON provider_services(provider_id) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_provider_locations_provider ON provider_locations(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_locations_location ON provider_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_provider_locations_primary ON provider_locations(provider_id) WHERE is_primary = TRUE;

-- ---- Availability slots ----
CREATE INDEX IF NOT EXISTS idx_availability_slots_artisan ON availability_slots(artisan_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_artisan_date ON availability_slots(artisan_id, date) INCLUDE (is_available);
CREATE INDEX IF NOT EXISTS idx_availability_slots_artisan_available ON availability_slots(artisan_id, is_available, date);

-- ---- Bookings ----
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_artisan ON bookings(artisan_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_status ON bookings(slot_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_artisan_status ON bookings(artisan_id, status) INCLUDE (deposit_amount, slot_id);

-- ---- Reviews ----
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_visible ON reviews(provider_id, rating) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- ---- Conversations ----
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_provider ON conversations(provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- ---- Messages ----
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- ---- Devis ----
CREATE INDEX IF NOT EXISTS idx_devis_requests_client ON devis_requests(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_devis_requests_status ON devis_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotes_request ON quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_provider ON quotes(provider_id);

-- ---- Invoices ----
CREATE INDEX IF NOT EXISTS idx_invoices_provider ON invoices(provider_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- ---- Documents ----
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_booking ON documents(booking_id) WHERE booking_id IS NOT NULL;

-- ---- Portfolio ----
CREATE INDEX IF NOT EXISTS idx_portfolio_artisan ON portfolio_items(artisan_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_artisan_visible ON portfolio_items(artisan_id, is_visible, display_order) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio_items(artisan_id, is_featured) WHERE is_featured = TRUE;

-- ---- Team ----
CREATE INDEX IF NOT EXISTS idx_team_members_artisan ON team_members(artisan_id);

-- ---- Audit ----
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id) WHERE resource_type IS NOT NULL;

-- ---- Notification logs ----
CREATE INDEX IF NOT EXISTS idx_notification_logs_booking ON notification_logs(booking_id);

-- ---- User reports ----
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);

-- ---- Webhook events ----
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);

-- =============================================================================
-- 9. REALTIME PUBLICATIONS
-- =============================================================================

-- Only publish tables that need real-time updates
-- (Supabase requires explicit publication for realtime subscriptions)

-- Remove old publications (may fail if not exists, that's OK)
DO $$
BEGIN
  -- Remove tables that no longer exist from publication
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS message_reactions; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS message_read_receipts; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS realtime_activity; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS analytics_insights; EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Add essential tables
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE messages; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE conversations; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE bookings; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- =============================================================================
-- 10. CLEANUP OLD FUNCTIONS & TRIGGERS
-- =============================================================================

-- Remove old toxic functions
DROP FUNCTION IF EXISTS calculate_trust_badge CASCADE;
DROP FUNCTION IF EXISTS update_provider_trust_metrics CASCADE;
DROP FUNCTION IF EXISTS update_artisan_rating CASCADE;
DROP FUNCTION IF EXISTS update_review_helpful_count CASCADE;
DROP FUNCTION IF EXISTS update_message_search_vector CASCADE;
DROP FUNCTION IF EXISTS update_analytics_aggregates CASCADE;
DROP FUNCTION IF EXISTS update_portfolio_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_invoice_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS reset_unread_count CASCADE;

-- Remove message search vector column (no longer needed without enhanced messaging)
ALTER TABLE messages DROP COLUMN IF EXISTS search_vector;
ALTER TABLE messages DROP COLUMN IF EXISTS edited_at;
ALTER TABLE messages DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE messages DROP COLUMN IF EXISTS reply_to_message_id;
ALTER TABLE messages DROP COLUMN IF EXISTS rich_content;

-- =============================================================================
-- 11. ANALYZE TABLES
-- =============================================================================

ANALYZE providers;
ANALYZE services;
ANALYZE locations;
ANALYZE provider_services;
ANALYZE provider_locations;
ANALYZE bookings;
ANALYZE reviews;
ANALYZE conversations;
ANALYZE messages;

-- =============================================================================
-- DONE — v2 socle minimal complete
-- =============================================================================
-- Created (socle):
--   • generate_stable_id()              — HMAC for provider public IDs
--   • set_provider_stable_id()          — auto-set on INSERT
--   • prevent_stable_id_change()        — immutability guard
--   • update_provider_location()        — lat/lon → geography sync
--   • update_provider_search_vector()   — French full-text search
--   • update_conversation_on_message()  — conversation freshness
--   • set_updated_at()                  — generic timestamp trigger
--
-- Deferred (later PRs):
--   • update_provider_rating()          → PR reviews-v2
--   • create_booking_atomic()           → PR booking-v2
--   • get_artisan_dashboard_stats()     → PR dashboard-artisan-v2
--   • search_providers_v2()             → PR search-api-v2
-- =============================================================================
