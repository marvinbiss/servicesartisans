-- Migration 005: Real-time Chat System
-- Adds messaging tables for real-time communication

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unread_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure unique conversation between client and provider
    UNIQUE(client_id, provider_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'artisan', 'system')),
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_provider ON conversations(provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT
    USING (
        auth.uid() = client_id OR
        auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id)
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT
    WITH CHECK (
        auth.uid() = client_id OR
        auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id)
    );

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE
    USING (
        auth.uid() = client_id OR
        auth.uid() IN (SELECT user_id FROM providers WHERE id = provider_id)
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE client_id = auth.uid() OR
                  provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE client_id = auth.uid() OR
                  provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can update messages they sent" ON messages
    FOR UPDATE
    USING (sender_id = auth.uid());

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET
        last_message_at = NEW.created_at,
        unread_count = unread_count + 1,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new messages
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- Function to reset unread count when messages are read
CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
        UPDATE conversations
        SET
            unread_count = GREATEST(0, unread_count - 1),
            updated_at = NOW()
        WHERE id = NEW.conversation_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for read messages
DROP TRIGGER IF EXISTS trigger_reset_unread_count ON messages;
CREATE TRIGGER trigger_reset_unread_count
    AFTER UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION reset_unread_count();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Add comment for documentation
COMMENT ON TABLE conversations IS 'Real-time chat conversations between clients and providers';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
