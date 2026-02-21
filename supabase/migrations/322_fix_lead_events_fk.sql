-- Migration 322: Fix lead_events.lead_id FK
-- Migration 106 referenced leads(id) but the `leads` table only exists in the
-- aspirational `app` schema (migration 110), never in the public schema.
-- The correct target is devis_requests(id) which exists in the public schema
-- (created by migration 100_v2_schema_cleanup.sql).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'lead_events'
  ) THEN
    -- Table exists: drop the bad FK and add the correct one
    ALTER TABLE lead_events DROP CONSTRAINT IF EXISTS lead_events_lead_id_fkey;

    ALTER TABLE lead_events
      ADD CONSTRAINT lead_events_lead_id_fkey
        FOREIGN KEY (lead_id) REFERENCES devis_requests(id) ON DELETE CASCADE;
  ELSE
    -- Table never got created (migration 106 failed because leads didn't exist).
    -- Create it now with the correct FK.
    CREATE TABLE lead_events (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id     UUID        NOT NULL REFERENCES devis_requests(id) ON DELETE CASCADE,
      provider_id UUID        REFERENCES providers(id) ON DELETE SET NULL,
      actor_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
      event_type  TEXT        NOT NULL CHECK (event_type IN (
        'created', 'dispatched', 'viewed', 'quoted', 'declined',
        'accepted', 'refused', 'completed', 'expired', 'reassigned'
      )),
      metadata    JSONB       NOT NULL DEFAULT '{}',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_lead_events_lead     ON lead_events(lead_id, created_at DESC);
    CREATE INDEX idx_lead_events_provider ON lead_events(provider_id, created_at DESC)
      WHERE provider_id IS NOT NULL;
    CREATE INDEX idx_lead_events_type     ON lead_events(event_type);
    CREATE INDEX idx_lead_events_created  ON lead_events(created_at DESC);

    -- Append-only triggers
    CREATE OR REPLACE FUNCTION prevent_lead_event_mutation()
    RETURNS TRIGGER AS $trigger$
    BEGIN
      RAISE EXCEPTION 'lead_events is append-only: % not allowed', TG_OP;
    END;
    $trigger$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_lead_events_no_update
      BEFORE UPDATE ON lead_events
      FOR EACH ROW EXECUTE FUNCTION prevent_lead_event_mutation();

    CREATE TRIGGER trigger_lead_events_no_delete
      BEFORE DELETE ON lead_events
      FOR EACH ROW EXECUTE FUNCTION prevent_lead_event_mutation();

    -- RLS
    ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admins view all lead events" ON lead_events;
    CREATE POLICY "Admins view all lead events" ON lead_events
      FOR SELECT USING (is_admin());
  END IF;
END;
$$;
