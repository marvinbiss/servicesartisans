-- Migration: Reviews System
-- Description: Adds reviews table and related columns for world-class review system

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  would_recommend BOOLEAN,
  status VARCHAR(50) DEFAULT 'published', -- 'published', 'pending_review', 'hidden', 'flagged'
  fraud_indicators JSONB,
  artisan_response TEXT,
  artisan_responded_at TIMESTAMPTZ,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add rating fields to profiles
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Review helpful votes (for "Was this review helpful?")
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  voter_ip VARCHAR(50),
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, voter_ip)
);

-- Ensure all columns exist (table may have been created with different schema)
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS artisan_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS fraud_indicators JSONB;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS artisan_response TEXT;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS artisan_responded_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_artisan ON reviews(artisan_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view published reviews
CREATE POLICY "Anyone can view published reviews" ON reviews
  FOR SELECT USING (status = 'published');

-- Clients can create reviews for their bookings
CREATE POLICY "Clients can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings
      WHERE client_email = client_email
    )
  );

-- Artisans can respond to their reviews
CREATE POLICY "Artisans can respond to reviews" ON reviews
  FOR UPDATE USING (artisan_id = auth.uid())
  WITH CHECK (artisan_id = auth.uid());

-- RLS for review votes
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can vote on reviews
CREATE POLICY "Anyone can vote on reviews" ON review_votes
  FOR INSERT WITH CHECK (true);

-- Function to update artisan rating on review changes
CREATE OR REPLACE FUNCTION update_artisan_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews
      WHERE artisan_id = COALESCE(NEW.artisan_id, OLD.artisan_id)
      AND status = 'published'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE artisan_id = COALESCE(NEW.artisan_id, OLD.artisan_id)
      AND status = 'published'
    )
  WHERE id = COALESCE(NEW.artisan_id, OLD.artisan_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_artisan_rating ON reviews;
CREATE TRIGGER trigger_update_artisan_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_artisan_rating();

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews
  SET helpful_count = (
    SELECT COUNT(*)
    FROM review_votes
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
    AND is_helpful = true
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpful count
DROP TRIGGER IF EXISTS trigger_update_helpful_count ON review_votes;
CREATE TRIGGER trigger_update_helpful_count
AFTER INSERT OR DELETE ON review_votes
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();
