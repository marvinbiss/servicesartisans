-- =============================================================================
-- SUPABASE V2 SCHEMA — Clean Room Migration
-- ServicesArtisans — 2026-02-06
-- =============================================================================
-- This migration:
--   1. Adds stable_id (HMAC) + noindex columns to providers
--   2. Removes toxic columns (trust_badge, trust_score, is_premium, etc.)
--   3. Drops unused/over-engineered tables
--   4. Creates missing core tables (devis_requests, quotes)
--   5. Cleans up profiles table
-- =============================================================================

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================================================
-- 1. STABLE_ID FUNCTION
-- Deterministic, immutable, URL-safe identifier for providers
-- Used in public URLs: /services/{trade}/{city}/{stable_id}
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_stable_id(provider_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  hmac_secret TEXT;
  raw_hmac BYTEA;
BEGIN
  -- In production, store the secret in Supabase Vault:
  --   SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'stable_id_secret'
  -- For now, use app.settings (set via ALTER DATABASE ... SET app.stable_id_secret = '...')
  hmac_secret := coalesce(
    current_setting('app.stable_id_secret', true),
    'sa-stable-id-v2-default-change-me'
  );

  raw_hmac := hmac(provider_uuid::text::bytea, hmac_secret::bytea, 'sha256');

  -- Base64url encode, take first 12 chars (~72 bits entropy)
  -- Collision probability with 50K providers: ~5×10^-13
  RETURN left(
    replace(replace(encode(raw_hmac, 'base64'), '+', '-'), '/', '_'),
    12
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_stable_id IS
  'Generates a deterministic, URL-safe, 12-char public identifier from a provider UUID via HMAC-SHA256';

-- =============================================================================
-- 2. ADD NEW COLUMNS TO providers
-- =============================================================================

-- stable_id: immutable public identifier for URLs
ALTER TABLE providers ADD COLUMN IF NOT EXISTS stable_id TEXT;

-- noindex: default TRUE = not indexed by search engines
-- Wave-based sitemap will flip to FALSE for verified providers
ALTER TABLE providers ADD COLUMN IF NOT EXISTS noindex BOOLEAN NOT NULL DEFAULT TRUE;

-- Backfill stable_id for all existing providers that don't have one
UPDATE providers
SET stable_id = generate_stable_id(id)
WHERE stable_id IS NULL;

-- Now make it NOT NULL + UNIQUE
ALTER TABLE providers ALTER COLUMN stable_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_stable_id_key'
  ) THEN
    ALTER TABLE providers ADD CONSTRAINT providers_stable_id_key UNIQUE (stable_id);
  END IF;
END $$;

-- =============================================================================
-- 3. REMOVE TOXIC COLUMNS FROM providers
-- These were exposed client-side and represent internal scoring/ranking logic
-- =============================================================================

-- trust_badge — internal badge exposed in /api/search (TOXIC)
ALTER TABLE providers DROP COLUMN IF EXISTS trust_badge;

-- trust_score — internal score exposed in /api/search (TOXIC)
ALTER TABLE providers DROP COLUMN IF EXISTS trust_score;

-- is_premium — paid ranking bias exposed in search results & sitemap (TOXIC)
ALTER TABLE providers DROP COLUMN IF EXISTS is_premium;

-- avg_response_time_hours — internal metric (TOXIC)
ALTER TABLE providers DROP COLUMN IF EXISTS avg_response_time_hours;

-- response_rate — internal metric (TOXIC)
ALTER TABLE providers DROP COLUMN IF EXISTS response_rate;

-- years_on_platform — internal metric (TOXIC)
ALTER TABLE providers DROP COLUMN IF EXISTS years_on_platform;

-- response_time — internal display metric from migration 011
ALTER TABLE providers DROP COLUMN IF EXISTS response_time;

-- hourly_rate_min/max — pricing rules exposed (TOXIC)
ALTER TABLE providers DROP COLUMN IF EXISTS hourly_rate_min;
ALTER TABLE providers DROP COLUMN IF EXISTS hourly_rate_max;

-- intervention_zone — vague string, not actionable
ALTER TABLE providers DROP COLUMN IF EXISTS intervention_zone;

-- video_enabled / video_price — video feature removed
ALTER TABLE providers DROP COLUMN IF EXISTS video_enabled;
ALTER TABLE providers DROP COLUMN IF EXISTS video_price;

-- response_rate from 011 — duplicate
ALTER TABLE providers DROP COLUMN IF EXISTS emergency_available;
ALTER TABLE providers DROP COLUMN IF EXISTS certifications;
ALTER TABLE providers DROP COLUMN IF EXISTS insurance;
ALTER TABLE providers DROP COLUMN IF EXISTS payment_methods;
ALTER TABLE providers DROP COLUMN IF EXISTS languages;
ALTER TABLE providers DROP COLUMN IF EXISTS avatar_url;

-- =============================================================================
-- 4. CLEAN UP profiles TABLE
-- =============================================================================

-- Remove video/calendar columns added by old migrations
ALTER TABLE profiles DROP COLUMN IF EXISTS google_calendar_connected;
ALTER TABLE profiles DROP COLUMN IF EXISTS video_enabled;
ALTER TABLE profiles DROP COLUMN IF EXISTS video_price;

-- Ensure is_admin exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- =============================================================================
-- 5. DROP TOXIC / UNUSED / OVER-ENGINEERED TABLES
-- Order matters: drop dependent tables first (FK constraints)
-- =============================================================================

-- ---- Features never implemented ----

-- KYC (never shipped)
DROP TABLE IF EXISTS identity_verifications CASCADE;
DROP TABLE IF EXISTS insurance_verifications CASCADE;
DROP TABLE IF EXISTS certification_verifications CASCADE;
DROP TABLE IF EXISTS video_verification_sessions CASCADE;
DROP TABLE IF EXISTS kyc_documents CASCADE;
DROP TABLE IF EXISTS kyc_profiles CASCADE;

-- Disputes (never shipped)
DROP TABLE IF EXISTS dispute_messages CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;

-- Escrow (never shipped)
DROP TABLE IF EXISTS escrow_milestones CASCADE;
DROP TABLE IF EXISTS escrow_transactions CASCADE;

-- 2FA (never shipped)
DROP TABLE IF EXISTS two_factor_backup_codes CASCADE;
DROP TABLE IF EXISTS two_factor_secrets CASCADE;

-- Fraud detection (never shipped)
DROP TABLE IF EXISTS fraud_assessments CASCADE;

-- Artisan similarities (never shipped)
DROP TABLE IF EXISTS artisan_similarities CASCADE;

-- ---- Over-engineered features ----

-- Analytics dashboard (TOXIC — exposed benchmarking/ranking)
DROP TABLE IF EXISTS realtime_activity CASCADE;
DROP TABLE IF EXISTS provider_goals CASCADE;
DROP TABLE IF EXISTS analytics_insights CASCADE;
DROP TABLE IF EXISTS analytics_funnels CASCADE;
DROP TABLE IF EXISTS report_history CASCADE;
DROP TABLE IF EXISTS scheduled_reports CASCADE;
DROP TABLE IF EXISTS provider_benchmarks CASCADE;
DROP TABLE IF EXISTS analytics_aggregates CASCADE;

-- Over-engineered search
DROP TABLE IF EXISTS saved_search_alerts CASCADE;
DROP TABLE IF EXISTS search_analytics CASCADE;
DROP TABLE IF EXISTS search_suggestions CASCADE;
DROP TABLE IF EXISTS user_search_history CASCADE;
DROP TABLE IF EXISTS provider_availability_cache CASCADE;

-- Over-engineered reviews
DROP TABLE IF EXISTS review_response_templates CASCADE;
DROP TABLE IF EXISTS response_metrics CASCADE;
DROP TABLE IF EXISTS trust_badges CASCADE;
DROP TABLE IF EXISTS review_authenticity CASCADE;
DROP TABLE IF EXISTS review_sentiment CASCADE;
DROP TABLE IF EXISTS review_media CASCADE;
DROP TABLE IF EXISTS review_votes CASCADE;

-- Over-engineered messaging
DROP TABLE IF EXISTS quick_reply_templates CASCADE;
DROP TABLE IF EXISTS conversation_settings CASCADE;
DROP TABLE IF EXISTS message_read_receipts CASCADE;
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS message_attachments CASCADE;

-- ---- Unused features ----

-- Video rooms (feature removed)
DROP TABLE IF EXISTS video_rooms CASCADE;

-- Loyalty/Gift cards (never used)
DROP TABLE IF EXISTS gift_card_transactions CASCADE;
DROP TABLE IF EXISTS gift_cards CASCADE;
DROP TABLE IF EXISTS loyalty_points CASCADE;

-- Waitlist (unused)
DROP TABLE IF EXISTS waitlist CASCADE;

-- Google Calendar integration (removed)
DROP TABLE IF EXISTS google_calendar_tokens CASCADE;
DROP TABLE IF EXISTS oauth_states CASCADE;

-- Artisan pricing settings (TOXIC — exposed pricing rules)
DROP TABLE IF EXISTS artisan_pricing_settings CASCADE;

-- Client booking prediction (unused)
DROP TABLE IF EXISTS client_booking_history CASCADE;
DROP TABLE IF EXISTS artisan_slot_stats CASCADE;

-- Platform fake stats (TOXIC — hardcoded fake data)
DROP TABLE IF EXISTS platform_stats CASCADE;

-- Over-engineered admin
DROP TABLE IF EXISTS admin_roles CASCADE;
DROP TABLE IF EXISTS moderation_logs CASCADE;

-- GDPR over-engineering (handle via edge functions, not tables)
DROP TABLE IF EXISTS data_export_requests CASCADE;
DROP TABLE IF EXISTS deletion_requests CASCADE;
DROP TABLE IF EXISTS cookie_consents CASCADE;

-- Push subscriptions (stub hook, rebuild when needed)
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- Old search tables (from 004)
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS favorite_artisans CASCADE;

-- Analytics events (replaced by external analytics)
DROP TABLE IF EXISTS analytics_events CASCADE;

-- =============================================================================
-- 6. ENSURE CORE TABLES EXIST
-- These may already exist but we ensure consistency
-- =============================================================================

-- devis_requests (quote requests from clients)
CREATE TABLE IF NOT EXISTS devis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT,
  description TEXT NOT NULL,
  budget TEXT,
  urgency TEXT NOT NULL DEFAULT 'normal'
    CHECK (urgency IN ('normal', 'urgent', 'tres_urgent')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'accepted', 'refused', 'completed')),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- quotes (artisan responses to devis_requests)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES devis_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  valid_until DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'refused', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- webhook_events (Stripe webhook idempotency)
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  payload JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- =============================================================================
-- 7. CLEANUP: Remove video_room_id FK from bookings
-- =============================================================================

ALTER TABLE bookings DROP COLUMN IF EXISTS video_room_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS is_video_consultation;

-- =============================================================================
-- DONE — Schema cleanup complete
-- Run 101_v2_rls_policies.sql next
-- =============================================================================
