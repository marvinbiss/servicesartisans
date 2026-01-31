-- Migration: Booking System Enhancements
-- Description: Adds tables for the enhanced booking system

-- Ensure availability_slots table has all needed columns
ALTER TABLE IF EXISTS availability_slots
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Ensure bookings table has all needed columns
ALTER TABLE IF EXISTS bookings
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rescheduled_from_slot_id UUID,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'not_required',
ADD COLUMN IF NOT EXISTS payment_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS deposit_amount INTEGER DEFAULT 0;

-- Notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'confirmation', 'reminder', 'cancellation', 'reschedule'
  status VARCHAR(50) NOT NULL, -- 'sent', 'failed'
  recipient_email VARCHAR(255) NOT NULL,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  preferred_date DATE NOT NULL,
  preferred_time_slot VARCHAR(50) DEFAULT 'any', -- 'morning', 'afternoon', 'any'
  service_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'notified', 'removed'
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loyalty points table
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_email VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift cards table
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- In cents
  balance INTEGER NOT NULL, -- In cents
  sender_name VARCHAR(255),
  sender_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  message TEXT,
  artisan_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL = usable anywhere
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'used', 'expired'
  stripe_session_id VARCHAR(255),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift card transactions
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL, -- In cents
  type VARCHAR(50) NOT NULL, -- 'redemption', 'refund'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth states for Google Calendar
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Google Calendar tokens
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artisan pricing settings
CREATE TABLE IF NOT EXISTS artisan_pricing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enable_dynamic_pricing BOOLEAN DEFAULT true,
  off_peak_discount INTEGER DEFAULT -15,
  weekend_surcharge INTEGER DEFAULT 5,
  last_minute_surcharge INTEGER DEFAULT 10,
  holiday_surcharge INTEGER DEFAULT 20,
  custom_rules JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add google_calendar_connected to profiles
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS google_calendar_connected BOOLEAN DEFAULT false;

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  properties JSONB DEFAULT '{}',
  session_id VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client booking history for smart suggestions
CREATE TABLE IF NOT EXISTS client_booking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email VARCHAR(255) NOT NULL,
  artisan_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  booked_day_of_week INTEGER, -- 0-6
  booked_hour INTEGER, -- 0-23
  lead_time_days INTEGER,
  was_no_show BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artisan popular slots cache
CREATE TABLE IF NOT EXISTS artisan_slot_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  time_slot VARCHAR(5) NOT NULL, -- HH:MM format
  booking_count INTEGER DEFAULT 0,
  day_of_week INTEGER, -- 0-6, NULL for all days
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artisan_id, time_slot, day_of_week)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_booking ON notification_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_team_members_artisan ON team_members(artisan_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_artisan ON waitlist(artisan_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_date ON waitlist(preferred_date);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_client ON loyalty_points(client_email);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_artisan ON loyalty_points(artisan_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_client_booking_history_email ON client_booking_history(client_email);
CREATE INDEX IF NOT EXISTS idx_artisan_slot_stats_artisan ON artisan_slot_stats(artisan_id);

-- RLS Policies

-- Notification logs: artisans can see their booking notifications
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can view their notification logs" ON notification_logs
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings WHERE artisan_id = auth.uid()
    )
  );

-- Team members: artisans can manage their team
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can manage their team" ON team_members
  FOR ALL USING (artisan_id = auth.uid());

-- Waitlist: artisans can view and manage their waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can manage their waitlist" ON waitlist
  FOR ALL USING (artisan_id = auth.uid());

CREATE POLICY "Clients can add themselves to waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Loyalty points: artisans can manage, clients can view their own
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can manage loyalty points" ON loyalty_points
  FOR ALL USING (artisan_id = auth.uid());

CREATE POLICY "Clients can view their loyalty points" ON loyalty_points
  FOR SELECT USING (client_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Gift cards: public can check, authenticated can purchase
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check gift card balance" ON gift_cards
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can purchase gift cards" ON gift_cards
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Google calendar tokens: users can only access their own
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tokens" ON google_calendar_tokens
  FOR ALL USING (user_id = auth.uid());

-- Pricing settings: artisans can manage their own
ALTER TABLE artisan_pricing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can manage their pricing" ON artisan_pricing_settings
  FOR ALL USING (artisan_id = auth.uid());

CREATE POLICY "Public can view pricing settings" ON artisan_pricing_settings
  FOR SELECT USING (true);
