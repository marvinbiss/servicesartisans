-- 505_notification_deliveries_pending_status.sql
-- Audit V2 races hors CEE : fix write-ahead-log pour `lead-notifications.ts`.
-- Le pattern actuel (insert APRÈS send) cause double envoi Resend/Twilio quand
-- un cron concurrent traite le même event. Solution : insert AVANT send avec
-- status='pending', UPDATE après. Le UNIQUE (event_id, channel, recipient_id)
-- bloque le 2e worker via 23505.

ALTER TABLE public.notification_deliveries
  DROP CONSTRAINT IF EXISTS notification_deliveries_status_check;

ALTER TABLE public.notification_deliveries
  ADD CONSTRAINT notification_deliveries_status_check
  CHECK (status IN ('pending', 'sent', 'failed', 'skipped'));
