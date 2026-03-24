-- Add missing UNIQUE constraints to prevent race condition duplicates

-- Prevent multiple reviews for the same booking
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_booking_unique
  ON reviews(booking_id);

-- Prevent duplicate quotes from same provider for same request
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_request_provider_unique
  ON quotes(request_id, provider_id);
