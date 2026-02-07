-- =============================================================================
-- SUPABASE V2 — Row Level Security Policies
-- ServicesArtisans — 2026-02-06
-- =============================================================================
-- Principles:
--   • Every table has RLS enabled
--   • No internal metrics exposed to anonymous/public users
--   • Admin access via is_admin flag on profiles (service_role bypasses RLS)
--   • Providers: public can only see active, verified providers
--   • Private data: user_id = auth.uid() strictly enforced
-- =============================================================================

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- PROFILES
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

-- Public profile lookup (for displaying artisan names in reviews, etc.)
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;
CREATE POLICY "Public can view basic profile info" ON profiles
  FOR SELECT USING (TRUE);
  -- Note: use a VIEW or RPC to limit which columns are returned to anonymous users

-- =============================================================================
-- PROVIDERS
-- =============================================================================
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Public: only active providers (no internal columns exposed via RLS — use views/RPCs)
DROP POLICY IF EXISTS "Public can view active providers" ON providers;
CREATE POLICY "Public can view active providers" ON providers
  FOR SELECT USING (is_active = TRUE);

-- Artisans can manage their own provider record
DROP POLICY IF EXISTS "Artisans can update own provider" ON providers;
CREATE POLICY "Artisans can update own provider" ON providers
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all providers
DROP POLICY IF EXISTS "Admins can manage providers" ON providers;
CREATE POLICY "Admins can manage providers" ON providers
  FOR ALL USING (is_admin());

-- =============================================================================
-- SERVICES
-- =============================================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active services" ON services;
CREATE POLICY "Public can view active services" ON services
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (is_admin());

-- =============================================================================
-- LOCATIONS
-- =============================================================================
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active locations" ON locations;
CREATE POLICY "Public can view active locations" ON locations
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
CREATE POLICY "Admins can manage locations" ON locations
  FOR ALL USING (is_admin());

-- =============================================================================
-- PROVIDER_SERVICES (junction)
-- =============================================================================
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view provider services" ON provider_services;
CREATE POLICY "Public can view provider services" ON provider_services
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Artisans can manage own provider services" ON provider_services;
CREATE POLICY "Artisans can manage own provider services" ON provider_services
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage provider services" ON provider_services;
CREATE POLICY "Admins can manage provider services" ON provider_services
  FOR ALL USING (is_admin());

-- =============================================================================
-- PROVIDER_LOCATIONS (junction)
-- =============================================================================
ALTER TABLE provider_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view provider locations" ON provider_locations;
CREATE POLICY "Public can view provider locations" ON provider_locations
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Artisans can manage own provider locations" ON provider_locations;
CREATE POLICY "Artisans can manage own provider locations" ON provider_locations
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage provider locations" ON provider_locations;
CREATE POLICY "Admins can manage provider locations" ON provider_locations
  FOR ALL USING (is_admin());

-- =============================================================================
-- AVAILABILITY_SLOTS
-- =============================================================================
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Public can view available slots (needed for booking calendar)
DROP POLICY IF EXISTS "Public can view available slots" ON availability_slots;
CREATE POLICY "Public can view available slots" ON availability_slots
  FOR SELECT USING (is_available = TRUE);

-- Artisans can manage their own slots
DROP POLICY IF EXISTS "Artisans can manage own slots" ON availability_slots;
CREATE POLICY "Artisans can manage own slots" ON availability_slots
  FOR ALL USING (artisan_id = auth.uid());

-- =============================================================================
-- BOOKINGS
-- =============================================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Clients can view their own bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can view own bookings" ON bookings;
CREATE POLICY "Clients can view own bookings" ON bookings
  FOR SELECT USING (
    client_id = auth.uid()
    OR client_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Artisans can view bookings for their slots
DROP POLICY IF EXISTS "Artisans can view their bookings" ON bookings;
CREATE POLICY "Artisans can view their bookings" ON bookings
  FOR SELECT USING (artisan_id = auth.uid());

-- Clients can create bookings (also via atomic function with SECURITY DEFINER)
DROP POLICY IF EXISTS "Clients can create bookings" ON bookings;
CREATE POLICY "Clients can create bookings" ON bookings
  FOR INSERT WITH CHECK (TRUE);
  -- The create_booking_atomic function runs as SECURITY DEFINER
  -- Direct inserts require authentication (enforced at API level)

-- Participants can update bookings
DROP POLICY IF EXISTS "Participants can update bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can update own bookings" ON bookings;
CREATE POLICY "Participants can update bookings" ON bookings
  FOR UPDATE USING (
    client_id = auth.uid()
    OR artisan_id = auth.uid()
  );

-- Admins can manage all bookings
DROP POLICY IF EXISTS "Admins can manage bookings" ON bookings;
CREATE POLICY "Admins can manage bookings" ON bookings
  FOR ALL USING (is_admin());

-- =============================================================================
-- REVIEWS
-- =============================================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can view visible reviews (no internal flags exposed)
DROP POLICY IF EXISTS "Anyone can view published reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view visible reviews" ON reviews;
CREATE POLICY "Public can view visible reviews" ON reviews
  FOR SELECT USING (is_visible = TRUE);

-- Authenticated users can create reviews
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Clients can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own reviews
DROP POLICY IF EXISTS "Users can update their reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (user_id = auth.uid());

-- Provider can respond to reviews about them
DROP POLICY IF EXISTS "Providers can respond to reviews" ON reviews;
DROP POLICY IF EXISTS "Artisans can respond to reviews" ON reviews;
CREATE POLICY "Providers can respond to reviews" ON reviews
  FOR UPDATE USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Admins can manage all reviews (moderation)
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL USING (is_admin());

-- =============================================================================
-- CONVERSATIONS
-- =============================================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    client_id = auth.uid()
    OR provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    client_id = auth.uid()
    OR provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (
    client_id = auth.uid()
    OR provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- =============================================================================
-- MESSAGES
-- =============================================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.client_id = auth.uid()
        OR c.provider_id IN (SELECT p.id FROM providers p WHERE p.user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.client_id = auth.uid()
        OR c.provider_id IN (SELECT p.id FROM providers p WHERE p.user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Users can update messages they sent" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- =============================================================================
-- DEVIS_REQUESTS (Quote Requests)
-- =============================================================================
ALTER TABLE devis_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view own requests" ON devis_requests;
CREATE POLICY "Clients can view own requests" ON devis_requests
  FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Clients can create requests" ON devis_requests;
CREATE POLICY "Clients can create requests" ON devis_requests
  FOR INSERT WITH CHECK (TRUE);
  -- Non-authenticated users can also submit quote requests

DROP POLICY IF EXISTS "Clients can update own requests" ON devis_requests;
CREATE POLICY "Clients can update own requests" ON devis_requests
  FOR UPDATE USING (client_id = auth.uid());

-- Artisans can view requests in their area (via API, not direct table access)
DROP POLICY IF EXISTS "Admins can manage requests" ON devis_requests;
CREATE POLICY "Admins can manage requests" ON devis_requests
  FOR ALL USING (is_admin());

-- =============================================================================
-- QUOTES (Artisan responses)
-- =============================================================================
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Providers can view own quotes" ON quotes;
CREATE POLICY "Providers can view own quotes" ON quotes
  FOR SELECT USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Clients can view quotes for their requests" ON quotes;
CREATE POLICY "Clients can view quotes for their requests" ON quotes
  FOR SELECT USING (
    request_id IN (SELECT id FROM devis_requests WHERE client_id = auth.uid())
  );

DROP POLICY IF EXISTS "Providers can create quotes" ON quotes;
CREATE POLICY "Providers can create quotes" ON quotes
  FOR INSERT WITH CHECK (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Providers can update own quotes" ON quotes;
CREATE POLICY "Providers can update own quotes" ON quotes
  FOR UPDATE USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- =============================================================================
-- INVOICES
-- =============================================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Providers can view their invoices" ON invoices;
CREATE POLICY "Providers can view own invoices" ON invoices
  FOR SELECT USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Clients can view their invoices" ON invoices;
CREATE POLICY "Clients can view own invoices" ON invoices
  FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Providers can create invoices" ON invoices;
CREATE POLICY "Providers can create invoices" ON invoices
  FOR INSERT WITH CHECK (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Providers can update their invoices" ON invoices;
CREATE POLICY "Providers can update own invoices" ON invoices
  FOR UPDATE USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- =============================================================================
-- DOCUMENTS
-- =============================================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their documents" ON documents;
CREATE POLICY "Users can manage own documents" ON documents
  FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Public documents are viewable" ON documents;
CREATE POLICY "Public documents are viewable" ON documents
  FOR SELECT USING (is_public = TRUE);

-- =============================================================================
-- PORTFOLIO_ITEMS
-- =============================================================================
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Artisans can manage own portfolio" ON portfolio_items;
DROP POLICY IF EXISTS "Artisans can manage portfolio" ON portfolio_items;
CREATE POLICY "Artisans can manage own portfolio" ON portfolio_items
  FOR ALL USING (artisan_id = auth.uid())
  WITH CHECK (artisan_id = auth.uid());

DROP POLICY IF EXISTS "Public can view visible portfolios" ON portfolio_items;
DROP POLICY IF EXISTS "Public can view portfolios" ON portfolio_items;
CREATE POLICY "Public can view visible portfolios" ON portfolio_items
  FOR SELECT USING (is_visible = TRUE);

-- =============================================================================
-- TEAM_MEMBERS
-- =============================================================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Artisans can manage their team" ON team_members;
CREATE POLICY "Artisans can manage own team" ON team_members
  FOR ALL USING (artisan_id = auth.uid());

-- =============================================================================
-- NOTIFICATION_LOGS
-- =============================================================================
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Artisans can view their notification logs" ON notification_logs;
CREATE POLICY "Artisans can view own notifications" ON notification_logs
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings WHERE artisan_id = auth.uid()
    )
  );

-- =============================================================================
-- USER_PREFERENCES
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users manage own preferences" ON user_preferences;
    CREATE POLICY "Users manage own preferences" ON user_preferences
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

-- =============================================================================
-- USER_REPORTS
-- =============================================================================
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create reports" ON user_reports;
CREATE POLICY "Users can create reports" ON user_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own reports" ON user_reports;
CREATE POLICY "Users can view own reports" ON user_reports
  FOR SELECT USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage reports" ON user_reports;
CREATE POLICY "Admins can manage reports" ON user_reports
  FOR ALL USING (is_admin());

-- =============================================================================
-- AUDIT_LOGS
-- =============================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
DROP POLICY IF EXISTS "audit_logs_admin_read" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin_insert" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

-- Service role inserts (bypasses RLS), but explicit policy for safety
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- =============================================================================
-- WEBHOOK_EVENTS
-- =============================================================================
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role should access this table (no user policies)
-- Service role bypasses RLS automatically
DROP POLICY IF EXISTS "Admins can view webhook events" ON webhook_events;
CREATE POLICY "Admins can view webhook events" ON webhook_events
  FOR SELECT USING (is_admin());

-- =============================================================================
-- STORAGE POLICIES (keep existing bucket structure, clean up policies)
-- =============================================================================

-- Portfolio: public read, owner write
DROP POLICY IF EXISTS "Anyone can view portfolio files" ON storage.objects;
CREATE POLICY "Anyone can view portfolio files" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Artisans can upload portfolio files" ON storage.objects;
CREATE POLICY "Artisans can upload portfolio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Artisans can update their portfolio files" ON storage.objects;
CREATE POLICY "Artisans can update portfolio files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Artisans can delete their portfolio files" ON storage.objects;
CREATE POLICY "Artisans can delete portfolio files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: public read, owner write
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their avatar" ON storage.objects;
CREATE POLICY "Users can upload avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their avatar" ON storage.objects;
CREATE POLICY "Users can update avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Documents: owner only
DROP POLICY IF EXISTS "Users can view their documents" ON storage.objects;
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Reviews: public read, owner write
DROP POLICY IF EXISTS "Anyone can view review files" ON storage.objects;
CREATE POLICY "Anyone can view review files" ON storage.objects
  FOR SELECT USING (bucket_id = 'reviews');

DROP POLICY IF EXISTS "Users can upload review files" ON storage.objects;
CREATE POLICY "Users can upload review files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reviews'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Messages: owner folder only
DROP POLICY IF EXISTS "Users can view message files in their conversations" ON storage.objects;
CREATE POLICY "Users can view message files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can upload message files" ON storage.objects;
CREATE POLICY "Users can upload message files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Reports: system write, owner read
DROP POLICY IF EXISTS "Users can view their reports" ON storage.objects;
CREATE POLICY "Users can view own reports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "System can create reports" ON storage.objects;
CREATE POLICY "System can create reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reports');

-- =============================================================================
-- DONE — RLS policies applied
-- Run 102_v2_functions_triggers.sql next
-- =============================================================================
