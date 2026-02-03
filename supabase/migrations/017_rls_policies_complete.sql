-- Migration 017: Complete RLS Policies
-- All tables with proper security policies

-- =============================================
-- CONVERSATIONS & MESSAGES
-- =============================================

-- Conversations policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
FOR SELECT USING (client_id = auth.uid() OR provider_id = auth.uid());

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
FOR INSERT WITH CHECK (client_id = auth.uid() OR provider_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update their conversations" ON conversations
FOR UPDATE USING (client_id = auth.uid() OR provider_id = auth.uid());

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations" ON messages
FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages" ON messages
FOR UPDATE USING (sender_id = auth.uid());

-- Message attachments policies
DROP POLICY IF EXISTS "Users can view attachments in their conversations" ON message_attachments;
CREATE POLICY "Users can view attachments in their conversations" ON message_attachments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_attachments.message_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can add attachments to their messages" ON message_attachments;
CREATE POLICY "Users can add attachments to their messages" ON message_attachments
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM messages m
        WHERE m.id = message_attachments.message_id
        AND m.sender_id = auth.uid()
    )
);

-- Message reactions policies
DROP POLICY IF EXISTS "Users can view reactions" ON message_reactions;
CREATE POLICY "Users can view reactions" ON message_reactions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_reactions.message_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can add reactions" ON message_reactions;
CREATE POLICY "Users can add reactions" ON message_reactions
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can remove their reactions" ON message_reactions;
CREATE POLICY "Users can remove their reactions" ON message_reactions
FOR DELETE USING (user_id = auth.uid());

-- Read receipts policies
DROP POLICY IF EXISTS "Users can view read receipts" ON message_read_receipts;
CREATE POLICY "Users can view read receipts" ON message_read_receipts
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_read_receipts.message_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can mark messages as read" ON message_read_receipts;
CREATE POLICY "Users can mark messages as read" ON message_read_receipts
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Conversation settings policies
DROP POLICY IF EXISTS "Users can view their conversation settings" ON conversation_settings;
CREATE POLICY "Users can view their conversation settings" ON conversation_settings
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their conversation settings" ON conversation_settings;
CREATE POLICY "Users can manage their conversation settings" ON conversation_settings
FOR ALL USING (user_id = auth.uid());

-- Quick reply templates policies
DROP POLICY IF EXISTS "Users can view their templates" ON quick_reply_templates;
CREATE POLICY "Users can view their templates" ON quick_reply_templates
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their templates" ON quick_reply_templates;
CREATE POLICY "Users can manage their templates" ON quick_reply_templates
FOR ALL USING (user_id = auth.uid());

-- =============================================
-- REVIEWS & TRUST
-- =============================================

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view visible reviews" ON reviews;
CREATE POLICY "Anyone can view visible reviews" ON reviews
FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their reviews" ON reviews;
CREATE POLICY "Users can update their reviews" ON reviews
FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Providers can respond to reviews" ON reviews;
CREATE POLICY "Providers can respond to reviews" ON reviews
FOR UPDATE USING (provider_id = auth.uid())
WITH CHECK (provider_id = auth.uid());

-- Review media policies
DROP POLICY IF EXISTS "Anyone can view approved media" ON review_media;
CREATE POLICY "Anyone can view approved media" ON review_media
FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Review authors can add media" ON review_media;
CREATE POLICY "Review authors can add media" ON review_media
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM reviews r
        WHERE r.id = review_media.review_id
        AND r.user_id = auth.uid()
    )
);

-- Review sentiment (read-only)
DROP POLICY IF EXISTS "Anyone can view sentiment" ON review_sentiment;
CREATE POLICY "Anyone can view sentiment" ON review_sentiment
FOR SELECT USING (true);

-- Review authenticity (read-only)
DROP POLICY IF EXISTS "Anyone can view authenticity" ON review_authenticity;
CREATE POLICY "Anyone can view authenticity" ON review_authenticity
FOR SELECT USING (true);

-- Trust badges (read-only for active)
DROP POLICY IF EXISTS "Anyone can view active badges" ON trust_badges;
CREATE POLICY "Anyone can view active badges" ON trust_badges
FOR SELECT USING (is_active = true);

-- Response metrics (read-only)
DROP POLICY IF EXISTS "Anyone can view response metrics" ON response_metrics;
CREATE POLICY "Anyone can view response metrics" ON response_metrics
FOR SELECT USING (true);

-- =============================================
-- SEARCH
-- =============================================

-- Saved search alerts
DROP POLICY IF EXISTS "Users can view their alerts" ON saved_search_alerts;
CREATE POLICY "Users can view their alerts" ON saved_search_alerts
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their alerts" ON saved_search_alerts;
CREATE POLICY "Users can manage their alerts" ON saved_search_alerts
FOR ALL USING (user_id = auth.uid());

-- Search analytics (providers can view their own)
DROP POLICY IF EXISTS "Providers can view their search analytics" ON search_analytics;
CREATE POLICY "Providers can view their search analytics" ON search_analytics
FOR SELECT USING (
    artisan_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
);

-- User search history
DROP POLICY IF EXISTS "Users can view their search history" ON user_search_history;
CREATE POLICY "Users can view their search history" ON user_search_history
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their search history" ON user_search_history;
CREATE POLICY "Users can manage their search history" ON user_search_history
FOR ALL USING (user_id = auth.uid());

-- Provider availability (read-only)
DROP POLICY IF EXISTS "Anyone can view availability" ON provider_availability_cache;
CREATE POLICY "Anyone can view availability" ON provider_availability_cache
FOR SELECT USING (true);

-- =============================================
-- ANALYTICS
-- =============================================

-- Analytics events (providers can view their own)
DROP POLICY IF EXISTS "Providers can view their analytics" ON analytics_events;
CREATE POLICY "Providers can view their analytics" ON analytics_events
FOR SELECT USING (
    provider_id = auth.uid() OR
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "System can insert analytics" ON analytics_events;
CREATE POLICY "System can insert analytics" ON analytics_events
FOR INSERT WITH CHECK (true);

-- Analytics aggregates
DROP POLICY IF EXISTS "Providers can view their aggregates" ON analytics_aggregates;
CREATE POLICY "Providers can view their aggregates" ON analytics_aggregates
FOR SELECT USING (provider_id = auth.uid());

-- Provider benchmarks
DROP POLICY IF EXISTS "Providers can view their benchmarks" ON provider_benchmarks;
CREATE POLICY "Providers can view their benchmarks" ON provider_benchmarks
FOR SELECT USING (provider_id = auth.uid());

-- Scheduled reports
DROP POLICY IF EXISTS "Providers can view their reports" ON scheduled_reports;
CREATE POLICY "Providers can view their reports" ON scheduled_reports
FOR SELECT USING (provider_id = auth.uid());

DROP POLICY IF EXISTS "Providers can manage their reports" ON scheduled_reports;
CREATE POLICY "Providers can manage their reports" ON scheduled_reports
FOR ALL USING (provider_id = auth.uid());

-- Analytics insights
DROP POLICY IF EXISTS "Providers can view their insights" ON analytics_insights;
CREATE POLICY "Providers can view their insights" ON analytics_insights
FOR SELECT USING (provider_id = auth.uid());

DROP POLICY IF EXISTS "Providers can update their insights" ON analytics_insights;
CREATE POLICY "Providers can update their insights" ON analytics_insights
FOR UPDATE USING (provider_id = auth.uid());

-- Provider goals
DROP POLICY IF EXISTS "Providers can view their goals" ON provider_goals;
CREATE POLICY "Providers can view their goals" ON provider_goals
FOR SELECT USING (provider_id = auth.uid());

DROP POLICY IF EXISTS "Providers can manage their goals" ON provider_goals;
CREATE POLICY "Providers can manage their goals" ON provider_goals
FOR ALL USING (provider_id = auth.uid());

-- Realtime activity
DROP POLICY IF EXISTS "Providers can view their activity" ON realtime_activity;
CREATE POLICY "Providers can view their activity" ON realtime_activity
FOR SELECT USING (provider_id = auth.uid());

-- Report history
DROP POLICY IF EXISTS "Providers can view their report history" ON report_history;
CREATE POLICY "Providers can view their report history" ON report_history
FOR SELECT USING (provider_id = auth.uid());
