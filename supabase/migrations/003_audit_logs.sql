-- ============================================================================
-- TABLE: AUDIT_LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_id UUID,
  resource_type TEXT,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist (table may have been created with minimal schema)
ALTER TABLE IF EXISTS audit_logs ADD COLUMN IF NOT EXISTS provider_id UUID;
ALTER TABLE IF EXISTS audit_logs ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE IF EXISTS audit_logs ADD COLUMN IF NOT EXISTS resource_id TEXT;
ALTER TABLE IF EXISTS audit_logs ADD COLUMN IF NOT EXISTS old_value JSONB;
ALTER TABLE IF EXISTS audit_logs ADD COLUMN IF NOT EXISTS new_value JSONB;
ALTER TABLE IF EXISTS audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE IF EXISTS audit_logs ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE IF EXISTS audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_provider ON audit_logs(provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id) WHERE resource_type IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY audit_logs_admin_read ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Comments
COMMENT ON TABLE audit_logs IS 'Audit trail for all important actions';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the resource affected';
COMMENT ON COLUMN audit_logs.old_value IS 'Previous state (for updates)';
COMMENT ON COLUMN audit_logs.new_value IS 'New state (for updates)';
