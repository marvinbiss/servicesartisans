-- Migration: Enhanced Messaging System
-- Phase 2: World-Class Messagerie

-- Message enhancements
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES messages(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS rich_content JSONB;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Message attachments
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- For audio/video files in seconds
    transcription TEXT, -- For voice messages
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Read receipts with timestamps
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Conversation settings per user
CREATE TABLE IF NOT EXISTS conversation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    is_muted BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    notification_preference TEXT DEFAULT 'all' CHECK (notification_preference IN ('all', 'mentions', 'none')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Quick reply templates
CREATE TABLE IF NOT EXISTS quick_reply_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    shortcut TEXT,
    category TEXT DEFAULT 'general',
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('french', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message search vector
DROP TRIGGER IF EXISTS trigger_update_message_search_vector ON messages;
CREATE TRIGGER trigger_update_message_search_vector
BEFORE INSERT OR UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION update_message_search_vector();

-- Update existing messages search vectors
UPDATE messages SET search_vector = to_tsvector('french', COALESCE(content, ''))
WHERE search_vector IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_search ON messages USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_message_id) WHERE reply_to_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_conversation_settings_conversation ON conversation_settings(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_settings_user ON conversation_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_reply_templates_user ON quick_reply_templates(user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE message_read_receipts;

-- RLS Policies for message_attachments
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments in their conversations" ON message_attachments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_attachments.message_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

CREATE POLICY "Users can insert attachments in their conversations" ON message_attachments
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_attachments.message_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

-- RLS Policies for message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions in their conversations" ON message_reactions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_reactions.message_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

CREATE POLICY "Users can add reactions to messages in their conversations" ON message_reactions
FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_reactions.message_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

CREATE POLICY "Users can remove their own reactions" ON message_reactions
FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for message_read_receipts
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view read receipts in their conversations" ON message_read_receipts
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_read_receipts.message_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

CREATE POLICY "Users can mark messages as read" ON message_read_receipts
FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_read_receipts.message_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

-- RLS Policies for conversation_settings
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversation settings" ON conversation_settings
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own conversation settings" ON conversation_settings
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversation settings" ON conversation_settings
FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for quick_reply_templates
ALTER TABLE quick_reply_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quick reply templates" ON quick_reply_templates
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own quick reply templates" ON quick_reply_templates
FOR ALL USING (user_id = auth.uid());
