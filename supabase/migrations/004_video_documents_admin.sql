-- Migration: Video Consultations, Documents, Admin & GDPR
-- Description: World-class features for Doctolib-level platform

-- ===========================================
-- VIDEO CONSULTATIONS
-- ===========================================

-- Video rooms table
CREATE TABLE IF NOT EXISTS video_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  room_url TEXT NOT NULL,
  room_name VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES profiles(id),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add video_enabled to profiles
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS video_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS video_price INTEGER DEFAULT 0;

-- Add video_consultation to bookings
ALTER TABLE IF EXISTS bookings
ADD COLUMN IF NOT EXISTS is_video_consultation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS video_room_id UUID REFERENCES video_rooms(id);

CREATE INDEX IF NOT EXISTS idx_video_rooms_booking ON video_rooms(booking_id);

-- ===========================================
-- DOCUMENT MANAGEMENT
-- ===========================================

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'invoice', 'quote', 'contract', 'certificate', 'photo', 'other'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio/Gallery for artisans
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(100),
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_booking ON documents(booking_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_artisan ON portfolio_items(artisan_id);

-- ===========================================
-- ADMIN & MODERATION
-- ===========================================

-- Admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'super_admin', 'admin', 'moderator', 'support'
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Moderation logs
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL, -- 'review_removed', 'user_banned', 'content_flagged', etc.
  target_type VARCHAR(50) NOT NULL, -- 'user', 'review', 'booking', 'artisan'
  target_id UUID NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reports/flags
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id),
  target_type VARCHAR(50) NOT NULL, -- 'user', 'review', 'artisan', 'message'
  target_id UUID NOT NULL,
  reason VARCHAR(100) NOT NULL, -- 'spam', 'inappropriate', 'fake', 'harassment', 'other'
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform statistics (cached)
CREATE TABLE IF NOT EXISTS platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  total_artisans INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_revenue BIGINT DEFAULT 0,
  new_users_today INTEGER DEFAULT 0,
  new_bookings_today INTEGER DEFAULT 0,
  active_users_7d INTEGER DEFAULT 0,
  top_services JSONB DEFAULT '[]',
  top_regions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_admin ON moderation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target ON moderation_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);

-- ===========================================
-- PUSH NOTIFICATIONS
-- ===========================================

-- Push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- ===========================================
-- GDPR & USER PREFERENCES
-- ===========================================

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Notification preferences
  email_booking_confirmation BOOLEAN DEFAULT true,
  email_booking_reminder BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  email_newsletter BOOLEAN DEFAULT false,
  sms_booking_reminder BOOLEAN DEFAULT true,
  sms_marketing BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  push_booking_updates BOOLEAN DEFAULT true,
  push_messages BOOLEAN DEFAULT true,
  push_promotions BOOLEAN DEFAULT false,
  -- Privacy preferences
  profile_public BOOLEAN DEFAULT true,
  show_online_status BOOLEAN DEFAULT true,
  allow_reviews BOOLEAN DEFAULT true,
  -- Display preferences
  language VARCHAR(5) DEFAULT 'fr',
  currency VARCHAR(3) DEFAULT 'EUR',
  theme VARCHAR(20) DEFAULT 'light',
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- GDPR data export requests
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'expired'
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Account deletion requests
CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  scheduled_for TIMESTAMPTZ, -- Grace period before deletion
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cookie consent
CREATE TABLE IF NOT EXISTS cookie_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address VARCHAR(50),
  necessary BOOLEAN DEFAULT true,
  functional BOOLEAN DEFAULT false,
  analytics BOOLEAN DEFAULT false,
  marketing BOOLEAN DEFAULT false,
  consented_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user ON deletion_requests(user_id);

-- ===========================================
-- ADVANCED SEARCH
-- ===========================================

-- Search history (for suggestions)
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  query TEXT,
  filters JSONB DEFAULT '{}',
  notify_new_results BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorite artisans
CREATE TABLE IF NOT EXISTS favorite_artisans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, artisan_id)
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_artisans_user ON favorite_artisans(user_id);

-- ===========================================
-- RLS POLICIES
-- ===========================================

-- Video rooms
ALTER TABLE video_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their video rooms" ON video_rooms
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE artisan_id = auth.uid() OR client_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

-- Documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their documents" ON documents
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Public documents are viewable" ON documents
  FOR SELECT USING (is_public = true);

-- Portfolio
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can manage portfolio" ON portfolio_items
  FOR ALL USING (artisan_id = auth.uid());

CREATE POLICY "Public can view portfolios" ON portfolio_items
  FOR SELECT USING (true);

-- User preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences" ON user_preferences
  FOR ALL USING (user_id = auth.uid());

-- Push subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subs" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- Favorites
ALTER TABLE favorite_artisans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage favorites" ON favorite_artisans
  FOR ALL USING (user_id = auth.uid());
