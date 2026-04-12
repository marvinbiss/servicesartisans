/**
 * Messages Service — Centralized Supabase queries for conversations, messages, and notifications
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal supabase client type accepted by all service functions */
type SupabaseParam = SupabaseClient

export interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: string
  content: string
  read_at: string | null
  created_at: string
}

export interface MessagePreviewRow {
  id: string
  conversation_id: string
  content: string
  created_at: string
  sender_type: string
  read_at: string | null
}

export interface ConversationRow {
  id: string
  client_id: string
  provider_id: string
  created_at: string
}

export interface SearchMessageRow {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: string
  content: string
  message_type: string
  file_url: string | null
  file_name: string | null
  file_size: number | null
  read_at: string | null
  created_at: string
}

export interface NotificationRow {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

/** Fetch a single conversation by id, optionally filtering by provider or client */
export async function getConversationById(
  supabase: SupabaseParam,
  conversationId: string,
  filters?: { providerId?: string; clientId?: string }
) {
  let query = supabase
    .from('conversations')
    .select('id, client_id, provider_id')
    .eq('id', conversationId)

  if (filters?.providerId) {
    query = query.eq('provider_id', filters.providerId)
  }
  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId)
  }

  const { data, error } = await query.single()
  return { data, error }
}

/** Fetch a conversation checking that user is either client or provider */
export async function getConversationForUser(
  supabase: SupabaseParam,
  conversationId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .or(`client_id.eq.${userId},provider_id.eq.${userId}`)
    .single()
  return { data, error }
}

/** Fetch all conversations for a provider (no messages embedded) */
export async function getProviderConversations(supabase: SupabaseParam, providerId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `
      id,
      client_id,
      provider_id,
      created_at,
      client:profiles!client_id(id, full_name)
    `
    )
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

/** Fetch all active conversations for a client */
export async function getClientConversations(supabase: SupabaseParam, clientId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `
      id,
      client_id,
      provider_id,
      status,
      created_at,
      booking_id,
      provider:providers!provider_id(id, name),
      booking:bookings!booking_id(service_description)
    `
    )
    .eq('client_id', clientId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

/** Find existing conversation between a provider and client */
export async function findConversation(
  supabase: SupabaseParam,
  filters: { providerId: string; clientId: string }
) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id')
    .eq('provider_id', filters.providerId)
    .eq('client_id', filters.clientId)
    .single()
  return { data, error }
}

/** Create a new conversation */
export async function createConversation(
  supabase: SupabaseParam,
  params: { providerId: string; clientId: string }
) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ provider_id: params.providerId, client_id: params.clientId })
    .select('id')
    .single()
  return { data, error }
}

/** Update conversation status (archive/unarchive/block) */
export async function updateConversationStatus(
  supabase: SupabaseParam,
  conversationId: string,
  status: string
) {
  const { data, error } = await supabase
    .from('conversations')
    .update({ status })
    .eq('id', conversationId)
    .select('id, status')
    .single()
  return { data, error }
}

/** Admin: update conversation status (no select return) */
export async function adminUpdateConversationStatus(
  supabase: SupabaseParam,
  conversationId: string,
  status: string
) {
  const { error } = await supabase.from('conversations').update({ status }).eq('id', conversationId)
  return { error }
}

/** Admin: list conversations with pagination */
export async function adminListConversations(
  supabase: SupabaseParam,
  params: { page: number; limit: number }
) {
  const offset = (params.page - 1) * params.limit

  const { data, count, error } = await supabase
    .from('conversations')
    .select(
      `
        *,
        client:profiles!client_id (
          id,
          email,
          full_name
        ),
        provider:providers!provider_id (
          id,
          name
        )
      `,
      { count: 'exact' }
    )
    .order('last_message_at', { ascending: false })
    .range(offset, offset + params.limit - 1)

  return { data: data ?? [], count: count ?? 0, error }
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

/** Fetch all messages for a conversation, ordered ascending */
export async function getMessagesByConversation(supabase: SupabaseParam, conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, sender_type, content, read_at, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  return { data: data ?? [], error }
}

/** Fetch recent messages for multiple conversations (bounded) */
export async function getRecentMessagesForConversations(
  supabase: SupabaseParam,
  conversationIds: string[],
  limit: number
) {
  if (conversationIds.length === 0) {
    return { data: [] as MessagePreviewRow[], error: null }
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, content, created_at, sender_type, read_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: (data ?? []) as MessagePreviewRow[], error }
}

/** Fetch last message for a single conversation */
export async function getLastMessage(supabase: SupabaseParam, conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, created_at, sender_type, read_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)

  return { data: data?.[0] ?? null, error }
}

/** Count unread messages in a conversation from a specific sender type */
export async function countUnreadMessages(
  supabase: SupabaseParam,
  conversationId: string,
  senderType: 'client' | 'artisan'
) {
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('sender_type', senderType)
    .is('read_at', null)

  return { count: count ?? 0, error }
}

/** Mark messages as read in a conversation for a given sender type */
export async function markMessagesAsRead(
  supabase: SupabaseParam,
  conversationId: string,
  senderType: 'client' | 'artisan'
) {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('sender_type', senderType)
    .is('read_at', null)

  return { error }
}

/** Mark a single message as read by id */
export async function markSingleMessageAsRead(supabase: SupabaseParam, messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .is('read_at', null)

  return { error }
}

/** Get a message by id (for read receipts / access checks) */
export async function getMessageById(supabase: SupabaseParam, messageId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('conversation_id, sender_id')
    .eq('id', messageId)
    .single()

  return { data, error }
}

/** Insert a new message */
export async function insertMessage(
  supabase: SupabaseParam,
  params: {
    conversationId: string
    senderId: string
    senderType: 'client' | 'artisan'
    content: string
  }
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      sender_type: params.senderType,
      content: params.content,
    })
    .select('id, conversation_id, sender_id, sender_type, content, read_at, created_at')
    .single()

  return { data, error }
}

/** Insert a new message (client — selects all columns) */
export async function insertMessageFull(
  supabase: SupabaseParam,
  params: {
    conversationId: string
    senderId: string
    senderType: 'client' | 'artisan'
    content: string
  }
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      sender_type: params.senderType,
      content: params.content,
    })
    .select()
    .single()

  return { data, error }
}

/** Update message content (edit) */
export async function updateMessageContent(
  supabase: SupabaseParam,
  messageId: string,
  senderId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .update({ content })
    .eq('id', messageId)
    .eq('sender_id', senderId)
    .select()
    .single()

  return { data, error }
}

/** Delete a message (hard delete) */
export async function deleteMessage(supabase: SupabaseParam, messageId: string, senderId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', senderId)

  return { error }
}

/** Search messages within a conversation using ilike */
export async function searchMessages(
  supabase: SupabaseParam,
  params: { conversationId: string; query: string; limit: number }
) {
  const { data, error } = await supabase
    .from('messages')
    .select(
      'id, conversation_id, sender_id, sender_type, content, message_type, file_url, file_name, file_size, read_at, created_at'
    )
    .eq('conversation_id', params.conversationId)
    .ilike('content', `%${params.query}%`)
    .order('created_at', { ascending: false })
    .limit(params.limit)

  return { data: data ?? [], error }
}

// ---------------------------------------------------------------------------
// Message Attachments
// ---------------------------------------------------------------------------

/** Insert a message attachment record */
export async function insertMessageAttachment(
  supabase: SupabaseParam,
  params: {
    messageId: string
    fileUrl: string
    fileName: string
    fileSize: number
    mimeType: string
    thumbnailUrl: string | null
  }
) {
  const { error } = await supabase.from('message_attachments').insert({
    message_id: params.messageId,
    file_url: params.fileUrl,
    file_name: params.fileName,
    file_size: params.fileSize,
    mime_type: params.mimeType,
    thumbnail_url: params.thumbnailUrl,
  })

  return { error }
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

/** Fetch notifications for a user */
export async function getNotifications(
  supabase: SupabaseParam,
  userId: string,
  params: { limit: number; unreadOnly: boolean }
) {
  let query = supabase
    .from('notifications')
    .select('id, type, title, message, link, read, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(params.limit)

  if (params.unreadOnly) {
    query = query.eq('read', false)
  }

  const { data, error } = await query
  return { data: data ?? [], error }
}

/** Count unread notifications for a user */
export async function countUnreadNotifications(supabase: SupabaseParam, userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  return { count: count ?? 0, error }
}

/** Mark a single notification as read */
export async function markNotificationAsRead(
  supabase: SupabaseParam,
  notificationId: string,
  userId: string
) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)

  return { error }
}

/** Mark all notifications as read for a user */
export async function markAllNotificationsAsRead(supabase: SupabaseParam, userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  return { error }
}

// ---------------------------------------------------------------------------
// Profile / Provider lookups (used by notification fire-and-forget)
// ---------------------------------------------------------------------------

/** Get provider id from user id */
export async function getProviderByUserId(supabase: SupabaseParam, userId: string) {
  const { data, error } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

/** Get provider name and email by provider id */
export async function getProviderDetails(supabase: SupabaseParam, providerId: string) {
  const { data, error } = await supabase
    .from('providers')
    .select('name, email')
    .eq('id', providerId)
    .single()

  return { data, error }
}

/** Get provider name only */
export async function getProviderName(supabase: SupabaseParam, providerId: string) {
  const { data, error } = await supabase
    .from('providers')
    .select('name')
    .eq('id', providerId)
    .single()

  return { data, error }
}

/** Get profile email and full_name by id */
export async function getProfileById(supabase: SupabaseParam, profileId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', profileId)
    .single()

  return { data, error }
}

/** Get profile full_name only */
export async function getProfileName(supabase: SupabaseParam, profileId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', profileId)
    .single()

  return { data, error }
}

/** Get client_id from a conversation */
export async function getConversationClientId(supabase: SupabaseParam, conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('client_id')
    .eq('id', conversationId)
    .single()

  return { data, error }
}

/** Get provider_id from a conversation */
export async function getConversationProviderId(supabase: SupabaseParam, conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('provider_id')
    .eq('id', conversationId)
    .single()

  return { data, error }
}
