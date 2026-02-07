-- 107_notifications_v1.sql
-- Transactional notifications for lead lifecycle events
-- In-app notifications + idempotency tracking for email delivery

-- ============================================================
-- 1. notifications — in-app notification store
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'lead_created', 'lead_dispatched', 'lead_viewed',
    'quote_received', 'lead_closed', 'system'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id, read, created_at DESC)
  WHERE read = FALSE;

-- ============================================================
-- 2. notification_deliveries — idempotency tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app', 'sms', 'push')),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, channel, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_event
  ON notification_deliveries(event_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_recipient
  ON notification_deliveries(recipient_id, created_at DESC);

-- ============================================================
-- 3. RLS policies
-- ============================================================

-- notifications: users see only their own
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all notifications" ON notifications;
CREATE POLICY "Admins manage all notifications" ON notifications
  FOR ALL USING (is_admin());

-- notification_deliveries: admin-only (service_role inserts bypass RLS)
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage deliveries" ON notification_deliveries;
CREATE POLICY "Admins manage deliveries" ON notification_deliveries
  FOR ALL USING (is_admin());

-- ============================================================
-- 4. Comments
-- ============================================================
COMMENT ON TABLE notifications IS 'In-app notifications for users (lead events, system alerts)';
COMMENT ON TABLE notification_deliveries IS 'Idempotency tracking: one delivery per (event_id, channel, recipient_id)';
