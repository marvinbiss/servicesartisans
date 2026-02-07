-- 106_dashboard_v2.sql
-- Dashboard V2: lead_events (append-only), access_logs, immutability triggers
-- No CREATE for audit_logs — already exists (003_audit_logs.sql)

-- ============================================================
-- 1. lead_events — append-only event log for lead lifecycle
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'dispatched', 'viewed', 'quoted', 'declined',
    'accepted', 'refused', 'completed', 'expired', 'reassigned'
  )),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_events_lead ON lead_events(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_events_provider ON lead_events(provider_id, created_at DESC)
  WHERE provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_events_type ON lead_events(event_type);
CREATE INDEX IF NOT EXISTS idx_lead_events_created ON lead_events(created_at DESC);

-- ============================================================
-- 2. access_logs — page access tracking
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_access_logs_path
  ON access_logs(path, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_logs_created
  ON access_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_access_logs_path ON access_logs(path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at DESC);

-- ============================================================
-- 3. Immutability triggers — append-only enforcement
-- ============================================================

-- lead_events: no UPDATE, no DELETE
CREATE OR REPLACE FUNCTION prevent_lead_event_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'lead_events is append-only: % not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lead_events_no_update ON lead_events;
CREATE TRIGGER trigger_lead_events_no_update
  BEFORE UPDATE ON lead_events
  FOR EACH ROW EXECUTE FUNCTION prevent_lead_event_mutation();

DROP TRIGGER IF EXISTS trigger_lead_events_no_delete ON lead_events;
CREATE TRIGGER trigger_lead_events_no_delete
  BEFORE DELETE ON lead_events
  FOR EACH ROW EXECUTE FUNCTION prevent_lead_event_mutation();

-- audit_logs: make immutable (no UPDATE, no DELETE)
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is immutable: % not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_logs_no_update ON audit_logs;
CREATE TRIGGER trigger_audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

DROP TRIGGER IF EXISTS trigger_audit_logs_no_delete ON audit_logs;
CREATE TRIGGER trigger_audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

-- access_logs: append-only
CREATE OR REPLACE FUNCTION prevent_access_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'access_logs is append-only: % not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_access_logs_no_update ON access_logs;
CREATE TRIGGER trigger_access_logs_no_update
  BEFORE UPDATE ON access_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_access_log_mutation();

DROP TRIGGER IF EXISTS trigger_access_logs_no_delete ON access_logs;
CREATE TRIGGER trigger_access_logs_no_delete
  BEFORE DELETE ON access_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_access_log_mutation();

-- ============================================================
-- 4. RLS policies
-- ============================================================

-- lead_events
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans view own lead events" ON lead_events
  FOR SELECT USING (
    provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins view all lead events" ON lead_events
  FOR SELECT USING (is_admin());

-- No INSERT/UPDATE/DELETE for regular users
-- Events are inserted via service_role (admin client) which bypasses RLS

-- access_logs
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view access logs" ON access_logs
  FOR SELECT USING (is_admin());

-- No INSERT/UPDATE/DELETE for regular users
-- Logs are inserted via service_role (admin client) which bypasses RLS

-- ============================================================
-- 5. Comments
-- ============================================================
COMMENT ON TABLE lead_events IS 'Append-only event log for lead lifecycle transitions';
COMMENT ON TABLE access_logs IS 'Append-only page access tracking for audit';
