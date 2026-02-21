-- Migration 325: Create notification_logs table
-- Used by unified-notification-service.ts to log email/SMS delivery attempts per booking.
-- Distinct from notification_deliveries (which tracks in-app lead event notifications).

CREATE TABLE IF NOT EXISTS notification_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  recipient_email TEXT NOT NULL,
  error_message TEXT,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_booking_id ON notification_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at    ON notification_logs(sent_at DESC);

-- RLS: only service_role can write; admins can read
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_logs_service_only" ON notification_logs
  FOR ALL USING (false);  -- Blocked for all regular roles; service_role bypasses RLS

COMMENT ON TABLE notification_logs IS 'Delivery log for booking-related email/SMS notifications (confirmation, reminders, cancellation, etc.)';
