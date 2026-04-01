-- Migration 370: Allow artisans to view their own lead events
-- Previously only admins had SELECT access (migration 106/322).
-- Artisan dashboard history endpoint had to bypass RLS via adminClient.
-- This policy enables direct access for artisans to their own events.

DROP POLICY IF EXISTS "Artisans can view own lead events" ON lead_events;
CREATE POLICY "Artisans can view own lead events"
  ON lead_events
  FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );
