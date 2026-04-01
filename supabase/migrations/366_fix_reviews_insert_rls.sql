-- Fix broken RLS policy: client_email = client_email was always true (migration 021)
-- Migration 101 replaced it with "Users can create reviews" (auth.uid() IS NOT NULL) which is too permissive
-- This tightens it to verify the authenticated user owns the booking

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Clients can create reviews" ON reviews;

CREATE POLICY "Clients can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings
      WHERE client_id = auth.uid()
    )
  );
