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
-- 3. REVIEW TRIGGERS
-- =============================================================================

-- Update provider rating_average and review_count when reviews change
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_provider_id UUID;
BEGIN
  v_provider_id := coalesce(NEW.provider_id, OLD.provider_id);

  UPDATE providers SET
    rating_average = coalesce((
      SELECT round(avg(rating)::numeric, 2)
      FROM reviews
      WHERE provider_id = v_provider_id AND is_visible = TRUE
    ), 0),
    review_count = (
      SELECT count(*)
      FROM reviews
      WHERE provider_id = v_provider_id AND is_visible = TRUE
    )
  WHERE id = v_provider_id;

  RETURN coalesce(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_provider_rating ON reviews;
DROP TRIGGER IF EXISTS trigger_update_artisan_rating ON reviews;
DROP TRIGGER IF EXISTS trigger_update_provider_trust ON reviews;
CREATE TRIGGER trigger_update_provider_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_rating();

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
-- 6. BUSINESS LOGIC FUNCTIONS
-- =============================================================================

-- Atomic booking creation (prevents double-booking via advisory lock)
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_artisan_id UUID,
  p_slot_id UUID,
  p_client_name TEXT,
  p_client_phone TEXT,
  p_client_email TEXT,
  p_service_description TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_payment_intent_id TEXT DEFAULT NULL,
  p_deposit_amount INTEGER DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_booking_id UUID;
  v_slot RECORD;
  v_existing RECORD;
BEGIN
  -- Advisory lock on slot to prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext(p_slot_id::text));

  -- Check slot exists and is available
  SELECT * INTO v_slot
  FROM availability_slots
  WHERE id = p_slot_id
    AND artisan_id = p_artisan_id
    AND is_available = TRUE
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'SLOT_UNAVAILABLE',
      'message', 'Ce créneau n''est plus disponible'
    );
  END IF;

  -- Check for existing booking on this slot
  SELECT id INTO v_existing
  FROM bookings
  WHERE slot_id = p_slot_id
    AND status IN ('confirmed', 'pending')
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'SLOT_ALREADY_BOOKED',
      'message', 'Ce créneau est déjà réservé'
    );
  END IF;

  -- Check duplicate by same client
  SELECT id INTO v_existing
  FROM bookings
  WHERE slot_id = p_slot_id
    AND lower(client_email) = lower(p_client_email)
    AND status = 'confirmed'
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'DUPLICATE_BOOKING',
      'message', 'Vous avez déjà une réservation pour ce créneau'
    );
  END IF;

  -- Create booking
  INSERT INTO bookings (
    artisan_id, slot_id, client_name, client_phone, client_email,
    service_description, address, payment_intent_id, deposit_amount,
    status, created_at
  ) VALUES (
    p_artisan_id, p_slot_id, p_client_name, p_client_phone,
    lower(p_client_email), p_service_description, p_address,
    p_payment_intent_id, p_deposit_amount, 'confirmed', NOW()
  )
  RETURNING id INTO v_booking_id;

  -- Mark slot as unavailable
  UPDATE availability_slots SET is_available = FALSE WHERE id = p_slot_id;

  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'slot', json_build_object(
      'id', v_slot.id,
      'date', v_slot.date,
      'start_time', v_slot.start_time,
      'end_time', v_slot.end_time
    )
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', 'DATABASE_ERROR',
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_booking_atomic IS
  'Atomic booking creation with advisory lock — prevents double-booking';

-- Artisan dashboard stats (single RPC call, no N+1)
CREATE OR REPLACE FUNCTION get_artisan_dashboard_stats(
  p_artisan_id UUID,
  p_period TEXT DEFAULT 'month'
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_now TIMESTAMP := NOW();
  v_period_start DATE;
  v_last_period_start DATE;
BEGIN
  CASE p_period
    WHEN 'week' THEN
      v_period_start := date_trunc('week', v_now);
      v_last_period_start := v_period_start - INTERVAL '1 week';
    WHEN 'year' THEN
      v_period_start := date_trunc('year', v_now);
      v_last_period_start := v_period_start - INTERVAL '1 year';
    ELSE
      v_period_start := date_trunc('month', v_now);
      v_last_period_start := v_period_start - INTERVAL '1 month';
  END CASE;

  SELECT json_build_object(
    'totalBookings', (
      SELECT count(*) FROM bookings
      WHERE artisan_id = p_artisan_id AND status IN ('confirmed', 'completed')
    ),
    'periodBookings', (
      SELECT count(*) FROM bookings b
      JOIN availability_slots s ON b.slot_id = s.id
      WHERE b.artisan_id = p_artisan_id
        AND b.status IN ('confirmed', 'completed')
        AND s.date >= v_period_start
    ),
    'lastPeriodBookings', (
      SELECT count(*) FROM bookings b
      JOIN availability_slots s ON b.slot_id = s.id
      WHERE b.artisan_id = p_artisan_id
        AND b.status IN ('confirmed', 'completed')
        AND s.date >= v_last_period_start
        AND s.date < v_period_start
    ),
    'periodRevenue', coalesce((
      SELECT sum(b.deposit_amount) FROM bookings b
      JOIN availability_slots s ON b.slot_id = s.id
      WHERE b.artisan_id = p_artisan_id
        AND b.status IN ('confirmed', 'completed')
        AND s.date >= v_period_start
    ), 0) / 100.0,
    'averageRating', coalesce((
      SELECT round(avg(r.rating)::numeric, 1) FROM reviews r
      WHERE r.provider_id IN (SELECT id FROM providers WHERE user_id = p_artisan_id)
    ), 0),
    'totalReviews', (
      SELECT count(*) FROM reviews r
      WHERE r.provider_id IN (SELECT id FROM providers WHERE user_id = p_artisan_id)
    ),
    'upcomingBookings', (
      SELECT count(*) FROM bookings b
      JOIN availability_slots s ON b.slot_id = s.id
      WHERE b.artisan_id = p_artisan_id
        AND b.status = 'confirmed'
        AND s.date >= CURRENT_DATE
    ),
    'cancelRate', (
      SELECT CASE WHEN count(*) > 0
        THEN round((count(*) FILTER (WHERE status = 'cancelled')::numeric / count(*)) * 100)
        ELSE 0
      END FROM bookings WHERE artisan_id = p_artisan_id
    ),
    'fillRate', (
      SELECT CASE WHEN count(*) > 0
        THEN round((count(*) FILTER (WHERE is_available = FALSE)::numeric / count(*)) * 100)
        ELSE 0
      END FROM availability_slots
      WHERE artisan_id = p_artisan_id
        AND date >= CURRENT_DATE - INTERVAL '30 days'
        AND date <= CURRENT_DATE
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_artisan_dashboard_stats IS
  'Single optimized RPC for artisan dashboard stats — no N+1';

-- =============================================================================
-- 7. SEARCH FUNCTION (replaces search_providers_by_distance)
-- Cleaned: no is_premium bias, no trust_badge/trust_score in output
-- =============================================================================

DROP FUNCTION IF EXISTS search_providers_by_distance;

CREATE OR REPLACE FUNCTION search_providers_v2(
  p_lat DECIMAL DEFAULT NULL,
  p_lon DECIMAL DEFAULT NULL,
  p_radius_km INTEGER DEFAULT 25,
  p_query TEXT DEFAULT NULL,
  p_service TEXT DEFAULT NULL,
  p_min_rating DECIMAL DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'relevance',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  stable_id TEXT,
  name TEXT,
  specialty TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  rating_average DECIMAL,
  review_count INTEGER,
  is_verified BOOLEAN,
  distance_km DECIMAL,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.stable_id,
    p.name,
    p.specialty,
    p.address_city,
    p.address_postal_code,
    p.latitude,
    p.longitude,
    p.rating_average,
    p.review_count,
    p.is_verified,
    CASE WHEN p_lat IS NOT NULL AND p_lon IS NOT NULL AND p.location IS NOT NULL THEN
      round((ST_Distance(
        p.location,
        ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography
      ) / 1000)::DECIMAL, 2)
    ELSE NULL
    END as distance_km,
    p.description
  FROM providers p
  WHERE p.is_active = TRUE
    AND (p_lat IS NULL OR p_lon IS NULL OR p.location IS NULL OR ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
      p_radius_km * 1000
    ))
    AND (p_query IS NULL OR p.search_vector @@ plainto_tsquery('french', p_query))
    AND (p_service IS NULL OR p.specialty ILIKE '%' || p_service || '%')
    AND (p_min_rating IS NULL OR p.rating_average >= p_min_rating)
  ORDER BY
    CASE WHEN p_sort_by = 'distance' AND p_lat IS NOT NULL THEN
      ST_Distance(p.location, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography)
    END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'rating' THEN p.rating_average END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'reviews' THEN p.review_count END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'relevance' OR p_sort_by IS NULL THEN
      -- Neutral relevance: verified first, then by review count (no premium bias)
      p.is_verified::INTEGER * 100 + least(p.review_count, 100)
    END DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_providers_v2 IS
  'Search providers by location, query, and filters — no premium bias, no trust_score exposure';

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
-- DONE — v2 migration complete
-- =============================================================================
-- Summary of what's been created:
--   • generate_stable_id() — HMAC function for provider public IDs
--   • set_provider_stable_id() — auto-set on INSERT
--   • prevent_stable_id_change() — immutability guard
--   • update_provider_location() — auto-sync lat/lon → geography
--   • update_provider_search_vector() — French full-text search
--   • update_provider_rating() — review aggregate cache
--   • update_conversation_on_message() — conversation freshness
--   • set_updated_at() — generic timestamp trigger
--   • create_booking_atomic() — double-booking prevention
--   • get_artisan_dashboard_stats() — single RPC for dashboard
--   • search_providers_v2() — clean search without premium bias
-- =============================================================================
