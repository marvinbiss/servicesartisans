-- Migration 006: Analytics and Invoices
-- Adds tables for analytics tracking and invoice management

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_provider ON analytics_events(provider_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_date ON analytics_events(event_type, created_at);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Provider info snapshot
    provider_name TEXT NOT NULL,
    provider_address TEXT NOT NULL,
    provider_siret TEXT,
    provider_email TEXT NOT NULL,
    provider_phone TEXT,

    -- Client info snapshot
    client_name TEXT NOT NULL,
    client_address TEXT,
    client_email TEXT NOT NULL,
    client_phone TEXT,

    -- Invoice details
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tva_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,

    -- Dates
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    paid_date TIMESTAMPTZ,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),

    -- Payment info
    payment_method TEXT,
    payment_reference TEXT,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_provider ON invoices(provider_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events (admin only for full access)
CREATE POLICY "Service role can manage analytics" ON analytics_events
    FOR ALL USING (true);

-- Allow users to insert their own events
CREATE POLICY "Users can insert own analytics events" ON analytics_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for invoices
CREATE POLICY "Providers can view their invoices" ON invoices
    FOR SELECT
    USING (
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
    );

CREATE POLICY "Clients can view their invoices" ON invoices
    FOR SELECT
    USING (client_id = auth.uid());

CREATE POLICY "Providers can create invoices" ON invoices
    FOR INSERT
    WITH CHECK (
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
    );

CREATE POLICY "Providers can update their invoices" ON invoices
    FOR UPDATE
    USING (
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
    );

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_invoice_updated_at ON invoices;
CREATE TRIGGER trigger_invoice_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_updated_at();

-- Add comments for documentation
COMMENT ON TABLE analytics_events IS 'Platform analytics and tracking events';
COMMENT ON TABLE invoices IS 'Invoice records for bookings and services';
