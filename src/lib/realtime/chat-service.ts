/**
 * Real-time Chat Service using Supabase Realtime
 * WebSocket-based messaging between clients and artisans
 */

import { getSupabaseClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'client' | 'artisan'
  content: string
  message_type: 'text' | 'image' | 'file' | 'system' | 'voice'
  file_url?: string
  read_at?: string
  created_at: string
  // NOTE: reply_to_message_id and rich_content were dropped in migration 102
  // (public.messages schema cleanup). Do not re-introduce without a new migration.
}

export interface Conversation {
  id: string
  client_id: string
  provider_id: string
  quote_id?: string
  booking_id?: string
  status: 'active' | 'archived' | 'blocked'
  last_message_at: string
  unread_count: number
  created_at: string
}

export interface TypingIndicator {
  user_id: string
  user_type: 'client' | 'artisan'
  is_typing: boolean
  timestamp: number
}

class ChatService {
  private _supabase: ReturnType<typeof getSupabaseClient> | null = null
  private get supabase() {
    if (!this._supabase) {
      this._supabase = getSupabaseClient()
    }
    return this._supabase
  }
  private channels: Map<string, RealtimeChannel> = new Map()
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Subscribe to a conversation for real-time messages
   */
  subscribeToConversation(
    conversationId: string,
    callbacks: {
      onMessage: (message: ChatMessage) => void
      onMessageUpdate?: (message: ChatMessage) => void
      onTyping?: (indicator: TypingIndicator) => void
      onPresence?: (users: string[]) => void
    }
  ): () => void {
    const channelName = `conversation:${conversationId}`

    // Unsubscribe if already subscribed
    this.unsubscribeFromConversation(conversationId)

    const channel = this.supabase
      .channel(channelName)
      // New messages
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callbacks.onMessage(payload.new as ChatMessage)
        }
      )
      // Message updates (edits)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (callbacks.onMessageUpdate) {
            callbacks.onMessageUpdate(payload.new as ChatMessage)
          }
        }
      )
      // Typing broadcast
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (callbacks.onTyping) {
          callbacks.onTyping(payload.payload as TypingIndicator)
        }
      })
      // Presence
      .on('presence', { event: 'sync' }, () => {
        if (callbacks.onPresence) {
          const state = channel.presenceState()
          const users = Object.keys(state)
          callbacks.onPresence(users)
        }
      })
      .subscribe()

    this.channels.set(conversationId, channel)

    // Return unsubscribe function
    return () => this.unsubscribeFromConversation(conversationId)
  }

  /**
   * Unsubscribe from a conversation
   */
  unsubscribeFromConversation(conversationId: string): void {
    const channel = this.channels.get(conversationId)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(conversationId)
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    content: string,
    senderId: string,
    senderType: 'client' | 'artisan',
    messageType: 'text' | 'image' | 'file' | 'voice' = 'text',
    options?: {
      fileUrl?: string
    }
  ): Promise<ChatMessage | null> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_type: senderType,
        content,
        message_type: messageType,
        file_url: options?.fileUrl,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error sending message', error)
      return null
    }

    // Update conversation last_message_at
    await this.supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data as ChatMessage
  }

  /**
   * Broadcast typing indicator
   */
  sendTypingIndicator(
    conversationId: string,
    userId: string,
    userType: 'client' | 'artisan',
    isTyping: boolean
  ): void {
    const channel = this.channels.get(conversationId)
    if (!channel) return

    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: userId,
        user_type: userType,
        is_typing: isTyping,
        timestamp: Date.now(),
      },
    })

    // Auto-clear typing after 3 seconds
    if (isTyping) {
      const existingTimeout = this.typingTimeouts.get(conversationId)
      if (existingTimeout) clearTimeout(existingTimeout)

      const timeout = setTimeout(() => {
        this.sendTypingIndicator(conversationId, userId, userType, false)
      }, 3000)

      this.typingTimeouts.set(conversationId, timeout)
    }
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await this.supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null)
  }

  /**
   * Get conversation messages with pagination
   */
  async getMessages(conversationId: string, limit = 50, before?: string): Promise<ChatMessage[]> {
    let query = this.supabase
      .from('messages')
      .select(
        `
        id, conversation_id, sender_id, sender_type, content, message_type, file_url, read_at, created_at
`
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching messages', error)
      return []
    }

    return (data as ChatMessage[]).reverse()
  }

  /**
   * Search messages in a conversation
   */
  async searchMessages(conversationId: string, query: string, limit = 20): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select(
        'id, conversation_id, sender_id, sender_type, content, message_type, file_url, read_at, created_at'
      )
      .eq('conversation_id', conversationId)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Error searching messages', error)
      return []
    }

    return data as ChatMessage[]
  }

  /**
   * Get or create conversation between client and provider
   */
  async getOrCreateConversation(
    clientId: string,
    providerId: string,
    quoteId?: string,
    bookingId?: string
  ): Promise<Conversation | null> {
    // Try to find existing conversation
    const { data: existing } = await this.supabase
      .from('conversations')
      .select(
        'id, client_id, provider_id, quote_id, booking_id, status, last_message_at, unread_count, created_at'
      )
      .eq('client_id', clientId)
      .eq('provider_id', providerId)
      .eq('status', 'active')
      .single()

    if (existing) return existing as Conversation

    // Create new conversation
    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        client_id: clientId,
        provider_id: providerId,
        quote_id: quoteId,
        booking_id: bookingId,
        status: 'active',
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating conversation', error)
      return null
    }

    return data as Conversation
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string, userType: 'client' | 'artisan'): Promise<Conversation[]> {
    const column = userType === 'client' ? 'client_id' : 'provider_id'

    const { data, error } = await this.supabase
      .from('conversations')
      .select(
        `
        id, client_id, provider_id, quote_id, booking_id, status, last_message_at, unread_count, created_at,
        client:profiles!client_id(id, full_name),
        provider:providers!provider_id(id, name)
      `
      )
      .eq(column, userId)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false })

    if (error) {
      logger.error('Error fetching conversations', error)
      return []
    }

    return data as Conversation[]
  }

  /**
   * Upload a file attachment
   */
  async uploadAttachment(
    file: File,
    conversationId: string
  ): Promise<{ url: string; thumbnailUrl?: string } | null> {
    // Validate file size (10 MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      logger.error('File too large', { size: file.size, max: MAX_FILE_SIZE })
      return null
    }

    // Validate MIME type
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!ALLOWED_TYPES.includes(file.type)) {
      logger.error('File type not allowed', { type: file.type })
      return null
    }

    // Sanitize filename: keep only alphanumeric, dots, hyphens
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileExt = safeName.split('.').pop()
    const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await this.supabase.storage
      .from('messages')
      .upload(fileName, file, { contentType: file.type })

    if (error) {
      logger.error('Error uploading attachment', error)
      return null
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('messages').getPublicUrl(data.path)

    return { url: publicUrl }
  }

  /**
   * Track user presence in conversation
   */
  async trackPresence(
    conversationId: string,
    userId: string,
    userType: 'client' | 'artisan'
  ): Promise<void> {
    const channel = this.channels.get(conversationId)
    if (!channel) return

    await channel.track({
      user_id: userId,
      user_type: userType,
      online_at: new Date().toISOString(),
    })
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout))
    this.typingTimeouts.clear()
  }
}

// Singleton instance
export const chatService = new ChatService()

export default chatService
