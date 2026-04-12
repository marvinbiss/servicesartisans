import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

const mockSupabaseFrom = vi.fn()
const mockSupabaseClient = { from: mockSupabaseFrom } as never

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a chainable mock query builder for Supabase */
function createMockQueryBuilder(finalResult: Record<string, unknown> = {}) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}
  const chainable = (name: string) => {
    builder[name] = vi.fn().mockReturnValue(builder)
  }
  ;[
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'or',
    'is',
    'in',
    'ilike',
    'gte',
    'order',
    'limit',
    'range',
    'single',
  ].forEach(chainable)

  // Override terminals to resolve finalResult by default
  builder.single = vi.fn().mockResolvedValue(finalResult)
  builder.limit = vi.fn().mockResolvedValue(finalResult)
  // Make order chainable by default (non-terminal)
  builder.order = vi.fn().mockReturnValue(builder)

  return builder
}

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  getConversationById,
  getConversationForUser,
  getProviderConversations,
  getClientConversations,
  findConversation,
  createConversation,
  updateConversationStatus,
  adminUpdateConversationStatus,
  adminListConversations,
  getMessagesByConversation,
  getRecentMessagesForConversations,
  getLastMessage,
  countUnreadMessages,
  markMessagesAsRead,
  markSingleMessageAsRead,
  getMessageById,
  insertMessage,
  insertMessageFull,
  updateMessageContent,
  deleteMessage,
  searchMessages,
  insertMessageAttachment,
  getNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getProviderByUserId,
  getProviderDetails,
  getProviderName,
  getProfileById,
  getProfileName,
  getConversationClientId,
  getConversationProviderId,
} from '@/lib/services/messages-service'

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// getConversationById
// ===========================================================================

describe('getConversationById', () => {
  it('returns conversation when found', async () => {
    const conv = { id: 'conv-1', client_id: 'c1', provider_id: 'p1' }
    const builder = createMockQueryBuilder({ data: conv, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getConversationById(mockSupabaseClient, 'conv-1')

    expect(result.data).toEqual(conv)
    expect(result.error).toBeNull()
    expect(mockSupabaseFrom).toHaveBeenCalledWith('conversations')
    expect(builder.eq).toHaveBeenCalledWith('id', 'conv-1')
  })

  it('returns error when not found', async () => {
    const builder = createMockQueryBuilder({
      data: null,
      error: { message: 'Not found', code: 'PGRST116' },
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getConversationById(mockSupabaseClient, 'nonexistent')

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })

  it('applies providerId filter when provided', async () => {
    const builder = createMockQueryBuilder({ data: { id: 'conv-1' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getConversationById(mockSupabaseClient, 'conv-1', { providerId: 'p1' })

    expect(builder.eq).toHaveBeenCalledWith('provider_id', 'p1')
  })

  it('applies clientId filter when provided', async () => {
    const builder = createMockQueryBuilder({ data: { id: 'conv-1' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getConversationById(mockSupabaseClient, 'conv-1', { clientId: 'c1' })

    expect(builder.eq).toHaveBeenCalledWith('client_id', 'c1')
  })

  it('applies both filters when both provided', async () => {
    const builder = createMockQueryBuilder({ data: { id: 'conv-1' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getConversationById(mockSupabaseClient, 'conv-1', { providerId: 'p1', clientId: 'c1' })

    expect(builder.eq).toHaveBeenCalledWith('provider_id', 'p1')
    expect(builder.eq).toHaveBeenCalledWith('client_id', 'c1')
  })
})

// ===========================================================================
// getConversationForUser
// ===========================================================================

describe('getConversationForUser', () => {
  it('returns conversation when user is participant', async () => {
    const builder = createMockQueryBuilder({ data: { id: 'conv-1' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getConversationForUser(mockSupabaseClient, 'conv-1', 'user-1')

    expect(result.data).toEqual({ id: 'conv-1' })
    expect(builder.or).toHaveBeenCalledWith('client_id.eq.user-1,provider_id.eq.user-1')
  })

  it('returns error when user is not participant', async () => {
    const builder = createMockQueryBuilder({ data: null, error: { message: 'Not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getConversationForUser(mockSupabaseClient, 'conv-1', 'stranger')

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// getProviderConversations
// ===========================================================================

describe('getProviderConversations', () => {
  it('returns conversations list for a provider', async () => {
    const convs = [
      { id: 'conv-1', client_id: 'c1', provider_id: 'p1', created_at: '2026-01-01' },
      { id: 'conv-2', client_id: 'c2', provider_id: 'p1', created_at: '2026-01-02' },
    ]
    const builder = createMockQueryBuilder()
    // order is the terminal here (returns the resolved value)
    builder.order = vi.fn().mockResolvedValue({ data: convs, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderConversations(mockSupabaseClient, 'p1')

    expect(result.data).toEqual(convs)
    expect(result.error).toBeNull()
    expect(builder.eq).toHaveBeenCalledWith('provider_id', 'p1')
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('returns empty array when no conversations', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderConversations(mockSupabaseClient, 'p-empty')

    expect(result.data).toEqual([])
  })
})

// ===========================================================================
// getClientConversations
// ===========================================================================

describe('getClientConversations', () => {
  it('returns active conversations for a client', async () => {
    const convs = [{ id: 'conv-1' }]
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: convs, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getClientConversations(mockSupabaseClient, 'c1')

    expect(result.data).toEqual(convs)
    expect(builder.eq).toHaveBeenCalledWith('client_id', 'c1')
    expect(builder.eq).toHaveBeenCalledWith('status', 'active')
  })

  it('returns empty array when no active conversations', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getClientConversations(mockSupabaseClient, 'c-empty')

    expect(result.data).toEqual([])
  })
})

// ===========================================================================
// findConversation
// ===========================================================================

describe('findConversation', () => {
  it('returns conversation when it exists', async () => {
    const builder = createMockQueryBuilder({ data: { id: 'conv-1' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await findConversation(mockSupabaseClient, { providerId: 'p1', clientId: 'c1' })

    expect(result.data).toEqual({ id: 'conv-1' })
    expect(builder.eq).toHaveBeenCalledWith('provider_id', 'p1')
    expect(builder.eq).toHaveBeenCalledWith('client_id', 'c1')
  })

  it('returns error when conversation not found', async () => {
    const builder = createMockQueryBuilder({ data: null, error: { message: 'Not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await findConversation(mockSupabaseClient, { providerId: 'p1', clientId: 'c99' })

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// createConversation
// ===========================================================================

describe('createConversation', () => {
  it('creates and returns new conversation', async () => {
    const builder = createMockQueryBuilder({ data: { id: 'new-conv' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await createConversation(mockSupabaseClient, {
      providerId: 'p1',
      clientId: 'c1',
    })

    expect(result.data).toEqual({ id: 'new-conv' })
    expect(result.error).toBeNull()
    expect(builder.insert).toHaveBeenCalledWith({ provider_id: 'p1', client_id: 'c1' })
  })

  it('returns error on DB failure', async () => {
    const builder = createMockQueryBuilder({
      data: null,
      error: { message: 'DB error', code: '23505' },
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await createConversation(mockSupabaseClient, {
      providerId: 'p1',
      clientId: 'c1',
    })

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// updateConversationStatus
// ===========================================================================

describe('updateConversationStatus', () => {
  it('updates status and returns updated row', async () => {
    const builder = createMockQueryBuilder({
      data: { id: 'conv-1', status: 'archived' },
      error: null,
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await updateConversationStatus(mockSupabaseClient, 'conv-1', 'archived')

    expect(result.data).toEqual({ id: 'conv-1', status: 'archived' })
    expect(builder.update).toHaveBeenCalledWith({ status: 'archived' })
    expect(builder.eq).toHaveBeenCalledWith('id', 'conv-1')
  })
})

// ===========================================================================
// adminUpdateConversationStatus
// ===========================================================================

describe('adminUpdateConversationStatus', () => {
  it('updates status without select', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await adminUpdateConversationStatus(mockSupabaseClient, 'conv-1', 'blocked')

    expect(result.error).toBeNull()
    expect(builder.update).toHaveBeenCalledWith({ status: 'blocked' })
  })
})

// ===========================================================================
// adminListConversations
// ===========================================================================

describe('adminListConversations', () => {
  it('returns paginated conversations with count', async () => {
    const convs = [{ id: 'conv-1' }, { id: 'conv-2' }]
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: convs, count: 50, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await adminListConversations(mockSupabaseClient, { page: 2, limit: 10 })

    expect(result.data).toEqual(convs)
    expect(result.count).toBe(50)
    // page 2, limit 10 -> offset 10, range(10, 19)
    expect(builder.range).toHaveBeenCalledWith(10, 19)
  })

  it('returns empty array when no data', async () => {
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: null, count: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await adminListConversations(mockSupabaseClient, { page: 1, limit: 10 })

    expect(result.data).toEqual([])
    expect(result.count).toBe(0)
  })
})

// ===========================================================================
// getMessagesByConversation
// ===========================================================================

describe('getMessagesByConversation', () => {
  it('returns messages ordered ascending', async () => {
    const msgs = [
      { id: 'm1', content: 'Hello', created_at: '2026-01-01T10:00:00Z' },
      { id: 'm2', content: 'Hi', created_at: '2026-01-01T10:01:00Z' },
    ]
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: msgs, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getMessagesByConversation(mockSupabaseClient, 'conv-1')

    expect(result.data).toEqual(msgs)
    expect(mockSupabaseFrom).toHaveBeenCalledWith('messages')
    expect(builder.eq).toHaveBeenCalledWith('conversation_id', 'conv-1')
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('returns empty array when no messages', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getMessagesByConversation(mockSupabaseClient, 'conv-empty')

    expect(result.data).toEqual([])
  })
})

// ===========================================================================
// getRecentMessagesForConversations
// ===========================================================================

describe('getRecentMessagesForConversations', () => {
  it('returns recent messages for multiple conversations', async () => {
    const msgs = [{ id: 'm1', conversation_id: 'conv-1' }]
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: msgs, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getRecentMessagesForConversations(
      mockSupabaseClient,
      ['conv-1', 'conv-2'],
      5
    )

    expect(result.data).toEqual(msgs)
    expect(builder.in).toHaveBeenCalledWith('conversation_id', ['conv-1', 'conv-2'])
    expect(builder.limit).toHaveBeenCalledWith(5)
  })

  it('returns empty array for empty conversationIds', async () => {
    const result = await getRecentMessagesForConversations(mockSupabaseClient, [], 5)

    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
    expect(mockSupabaseFrom).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// getLastMessage
// ===========================================================================

describe('getLastMessage', () => {
  it('returns the last message', async () => {
    const msg = { id: 'm1', content: 'Latest' }
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [msg], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLastMessage(mockSupabaseClient, 'conv-1')

    expect(result.data).toEqual(msg)
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(builder.limit).toHaveBeenCalledWith(1)
  })

  it('returns null when no messages', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLastMessage(mockSupabaseClient, 'conv-empty')

    expect(result.data).toBeNull()
  })
})

// ===========================================================================
// countUnreadMessages
// ===========================================================================

describe('countUnreadMessages', () => {
  it('returns correct count for client sender type', async () => {
    const builder = createMockQueryBuilder()
    builder.is = vi.fn().mockResolvedValue({ count: 3, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await countUnreadMessages(mockSupabaseClient, 'conv-1', 'client')

    expect(result.count).toBe(3)
    expect(builder.eq).toHaveBeenCalledWith('conversation_id', 'conv-1')
    expect(builder.eq).toHaveBeenCalledWith('sender_type', 'client')
    expect(builder.is).toHaveBeenCalledWith('read_at', null)
  })

  it('returns 0 when count is null', async () => {
    const builder = createMockQueryBuilder()
    builder.is = vi.fn().mockResolvedValue({ count: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await countUnreadMessages(mockSupabaseClient, 'conv-1', 'artisan')

    expect(result.count).toBe(0)
  })
})

// ===========================================================================
// markMessagesAsRead
// ===========================================================================

describe('markMessagesAsRead', () => {
  it('marks unread messages as read for sender type', async () => {
    const builder = createMockQueryBuilder()
    builder.is = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await markMessagesAsRead(mockSupabaseClient, 'conv-1', 'client')

    expect(result.error).toBeNull()
    expect(mockSupabaseFrom).toHaveBeenCalledWith('messages')
    expect(builder.update).toHaveBeenCalledWith({ read_at: expect.any(String) })
    expect(builder.eq).toHaveBeenCalledWith('conversation_id', 'conv-1')
    expect(builder.eq).toHaveBeenCalledWith('sender_type', 'client')
    expect(builder.is).toHaveBeenCalledWith('read_at', null)
  })
})

// ===========================================================================
// markSingleMessageAsRead
// ===========================================================================

describe('markSingleMessageAsRead', () => {
  it('marks a specific message as read', async () => {
    const builder = createMockQueryBuilder()
    builder.is = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await markSingleMessageAsRead(mockSupabaseClient, 'msg-1')

    expect(result.error).toBeNull()
    expect(builder.update).toHaveBeenCalledWith({ read_at: expect.any(String) })
    expect(builder.eq).toHaveBeenCalledWith('id', 'msg-1')
    expect(builder.is).toHaveBeenCalledWith('read_at', null)
  })
})

// ===========================================================================
// getMessageById
// ===========================================================================

describe('getMessageById', () => {
  it('returns message when found', async () => {
    const msg = { conversation_id: 'conv-1', sender_id: 'user-1' }
    const builder = createMockQueryBuilder({ data: msg, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getMessageById(mockSupabaseClient, 'msg-1')

    expect(result.data).toEqual(msg)
    expect(builder.eq).toHaveBeenCalledWith('id', 'msg-1')
  })

  it('returns error when message not found', async () => {
    const builder = createMockQueryBuilder({ data: null, error: { message: 'Not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getMessageById(mockSupabaseClient, 'nonexistent')

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// insertMessage
// ===========================================================================

describe('insertMessage', () => {
  it('inserts and returns the new message', async () => {
    const newMsg = {
      id: 'msg-new',
      conversation_id: 'conv-1',
      sender_id: 'u1',
      sender_type: 'client',
      content: 'Hello',
      read_at: null,
      created_at: '2026-01-01',
    }
    const builder = createMockQueryBuilder({ data: newMsg, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await insertMessage(mockSupabaseClient, {
      conversationId: 'conv-1',
      senderId: 'u1',
      senderType: 'client',
      content: 'Hello',
    })

    expect(result.data).toEqual(newMsg)
    expect(result.error).toBeNull()
    expect(builder.insert).toHaveBeenCalledWith({
      conversation_id: 'conv-1',
      sender_id: 'u1',
      sender_type: 'client',
      content: 'Hello',
    })
  })
})

// ===========================================================================
// insertMessageFull
// ===========================================================================

describe('insertMessageFull', () => {
  it('inserts and returns the full message', async () => {
    const newMsg = { id: 'msg-full', conversation_id: 'conv-1', content: 'Bonjour' }
    const builder = createMockQueryBuilder({ data: newMsg, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await insertMessageFull(mockSupabaseClient, {
      conversationId: 'conv-1',
      senderId: 'u1',
      senderType: 'artisan',
      content: 'Bonjour',
    })

    expect(result.data).toEqual(newMsg)
    expect(builder.insert).toHaveBeenCalledWith({
      conversation_id: 'conv-1',
      sender_id: 'u1',
      sender_type: 'artisan',
      content: 'Bonjour',
    })
  })
})

// ===========================================================================
// updateMessageContent
// ===========================================================================

describe('updateMessageContent', () => {
  it('updates and returns the message', async () => {
    const updated = { id: 'msg-1', content: 'Updated text' }
    const builder = createMockQueryBuilder({ data: updated, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await updateMessageContent(mockSupabaseClient, 'msg-1', 'user-1', 'Updated text')

    expect(result.data).toEqual(updated)
    expect(builder.update).toHaveBeenCalledWith({ content: 'Updated text' })
    expect(builder.eq).toHaveBeenCalledWith('id', 'msg-1')
    expect(builder.eq).toHaveBeenCalledWith('sender_id', 'user-1')
  })

  it('returns error when message not found or not owned', async () => {
    const builder = createMockQueryBuilder({ data: null, error: { message: 'Not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await updateMessageContent(mockSupabaseClient, 'msg-999', 'user-1', 'text')

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// deleteMessage
// ===========================================================================

describe('deleteMessage', () => {
  it('deletes message successfully', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockReturnValue(builder)
    // The last .eq returns the final promise
    let callCount = 0
    builder.eq = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount >= 2) {
        return Promise.resolve({ error: null })
      }
      return builder
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await deleteMessage(mockSupabaseClient, 'msg-1', 'user-1')

    expect(result.error).toBeNull()
    expect(builder.delete).toHaveBeenCalled()
  })

  it('returns error on delete failure', async () => {
    const builder = createMockQueryBuilder()
    let callCount = 0
    builder.eq = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount >= 2) {
        return Promise.resolve({ error: { message: 'Delete failed' } })
      }
      return builder
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await deleteMessage(mockSupabaseClient, 'msg-1', 'user-1')

    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// searchMessages
// ===========================================================================

describe('searchMessages', () => {
  it('returns matching messages', async () => {
    const msgs = [{ id: 'm1', content: 'plomberie urgente' }]
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: msgs, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await searchMessages(mockSupabaseClient, {
      conversationId: 'conv-1',
      query: 'plomberie',
      limit: 20,
    })

    expect(result.data).toEqual(msgs)
    expect(builder.ilike).toHaveBeenCalledWith('content', '%plomberie%')
    expect(builder.limit).toHaveBeenCalledWith(20)
  })

  it('returns empty array when no matches', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await searchMessages(mockSupabaseClient, {
      conversationId: 'conv-1',
      query: 'zzz_no_match',
      limit: 10,
    })

    expect(result.data).toEqual([])
  })

  it('passes search term with special characters through to ilike', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await searchMessages(mockSupabaseClient, {
      conversationId: 'conv-1',
      query: '50% discount',
      limit: 10,
    })

    expect(builder.ilike).toHaveBeenCalledWith('content', '%50% discount%')
  })
})

// ===========================================================================
// insertMessageAttachment
// ===========================================================================

describe('insertMessageAttachment', () => {
  it('inserts attachment successfully', async () => {
    const builder = createMockQueryBuilder()
    builder.insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await insertMessageAttachment(mockSupabaseClient, {
      messageId: 'msg-1',
      fileUrl: 'https://storage.example.com/file.pdf',
      fileName: 'file.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      thumbnailUrl: null,
    })

    expect(result.error).toBeNull()
    expect(mockSupabaseFrom).toHaveBeenCalledWith('message_attachments')
    expect(builder.insert).toHaveBeenCalledWith({
      message_id: 'msg-1',
      file_url: 'https://storage.example.com/file.pdf',
      file_name: 'file.pdf',
      file_size: 1024,
      mime_type: 'application/pdf',
      thumbnail_url: null,
    })
  })

  it('returns error on attachment insert failure', async () => {
    const builder = createMockQueryBuilder()
    builder.insert = vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await insertMessageAttachment(mockSupabaseClient, {
      messageId: 'msg-1',
      fileUrl: 'url',
      fileName: 'f',
      fileSize: 0,
      mimeType: 'text/plain',
      thumbnailUrl: 'thumb.jpg',
    })

    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// getNotifications
// ===========================================================================

describe('getNotifications', () => {
  it('returns notifications with pagination', async () => {
    const notifs = [
      { id: 'n1', type: 'message', title: 'Nouveau message', read: false },
      { id: 'n2', type: 'booking', title: 'Reservation', read: true },
    ]
    const builder = createMockQueryBuilder()
    // When unreadOnly is false, the terminal is limit (after order().limit())
    builder.limit = vi.fn().mockResolvedValue({ data: notifs, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getNotifications(mockSupabaseClient, 'user-1', {
      limit: 20,
      unreadOnly: false,
    })

    expect(result.data).toEqual(notifs)
    expect(mockSupabaseFrom).toHaveBeenCalledWith('notifications')
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(builder.limit).toHaveBeenCalledWith(20)
  })

  it('filters by unread only when specified', async () => {
    const builder = createMockQueryBuilder()
    // limit returns builder (still chainable), eq('read', false) is called after
    builder.limit = vi.fn().mockReturnValue(builder)
    // The final await on the builder needs to resolve — make it thenable
    builder.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
      resolve({ data: [], error: null })
    })
    mockSupabaseFrom.mockReturnValue(builder)

    await getNotifications(mockSupabaseClient, 'user-1', { limit: 10, unreadOnly: true })

    expect(builder.eq).toHaveBeenCalledWith('read', false)
  })

  it('returns empty array when no notifications', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getNotifications(mockSupabaseClient, 'user-1', {
      limit: 10,
      unreadOnly: false,
    })

    expect(result.data).toEqual([])
  })
})

// ===========================================================================
// countUnreadNotifications
// ===========================================================================

describe('countUnreadNotifications', () => {
  it('returns correct unread count', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockReturnValue(builder)
    // Last eq resolves
    let eqCount = 0
    builder.eq = vi.fn().mockImplementation(() => {
      eqCount++
      if (eqCount >= 2) {
        return Promise.resolve({ count: 7, error: null })
      }
      return builder
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await countUnreadNotifications(mockSupabaseClient, 'user-1')

    expect(result.count).toBe(7)
  })

  it('returns 0 when count is null', async () => {
    const builder = createMockQueryBuilder()
    let eqCount = 0
    builder.eq = vi.fn().mockImplementation(() => {
      eqCount++
      if (eqCount >= 2) {
        return Promise.resolve({ count: null, error: null })
      }
      return builder
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await countUnreadNotifications(mockSupabaseClient, 'user-1')

    expect(result.count).toBe(0)
  })
})

// ===========================================================================
// markNotificationAsRead
// ===========================================================================

describe('markNotificationAsRead', () => {
  it('marks notification as read', async () => {
    const builder = createMockQueryBuilder()
    let eqCount = 0
    builder.eq = vi.fn().mockImplementation(() => {
      eqCount++
      if (eqCount >= 2) {
        return Promise.resolve({ error: null })
      }
      return builder
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await markNotificationAsRead(mockSupabaseClient, 'notif-1', 'user-1')

    expect(result.error).toBeNull()
    expect(builder.update).toHaveBeenCalledWith({ read: true })
  })
})

// ===========================================================================
// markAllNotificationsAsRead
// ===========================================================================

describe('markAllNotificationsAsRead', () => {
  it('marks all unread notifications as read', async () => {
    const builder = createMockQueryBuilder()
    let eqCount = 0
    builder.eq = vi.fn().mockImplementation(() => {
      eqCount++
      if (eqCount >= 2) {
        return Promise.resolve({ error: null })
      }
      return builder
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await markAllNotificationsAsRead(mockSupabaseClient, 'user-1')

    expect(result.error).toBeNull()
    expect(builder.update).toHaveBeenCalledWith({ read: true })
  })
})

// ===========================================================================
// getProviderByUserId
// ===========================================================================

describe('getProviderByUserId', () => {
  it('returns provider when found', async () => {
    const builder = createMockQueryBuilder({ data: { id: 'prov-1' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderByUserId(mockSupabaseClient, 'user-1')

    expect(result.data).toEqual({ id: 'prov-1' })
    expect(mockSupabaseFrom).toHaveBeenCalledWith('providers')
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('returns error when provider not found', async () => {
    const builder = createMockQueryBuilder({ data: null, error: { message: 'Not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderByUserId(mockSupabaseClient, 'user-999')

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// getProviderDetails
// ===========================================================================

describe('getProviderDetails', () => {
  it('returns provider name and email', async () => {
    const builder = createMockQueryBuilder({
      data: { name: 'Plombier Pro', email: 'pro@test.fr' },
      error: null,
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderDetails(mockSupabaseClient, 'prov-1')

    expect(result.data).toEqual({ name: 'Plombier Pro', email: 'pro@test.fr' })
    expect(builder.select).toHaveBeenCalledWith('name, email')
  })
})

// ===========================================================================
// getProviderName
// ===========================================================================

describe('getProviderName', () => {
  it('returns provider name only', async () => {
    const builder = createMockQueryBuilder({ data: { name: 'Artisan ABC' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderName(mockSupabaseClient, 'prov-1')

    expect(result.data).toEqual({ name: 'Artisan ABC' })
    expect(builder.select).toHaveBeenCalledWith('name')
  })
})

// ===========================================================================
// getProfileById
// ===========================================================================

describe('getProfileById', () => {
  it('returns profile when found', async () => {
    const profile = { email: 'jean@test.fr', full_name: 'Jean Dupont' }
    const builder = createMockQueryBuilder({ data: profile, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProfileById(mockSupabaseClient, 'profile-1')

    expect(result.data).toEqual(profile)
    expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles')
    expect(builder.eq).toHaveBeenCalledWith('id', 'profile-1')
  })

  it('returns error when profile not found', async () => {
    const builder = createMockQueryBuilder({ data: null, error: { message: 'Not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProfileById(mockSupabaseClient, 'nonexistent')

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

// ===========================================================================
// getProfileName
// ===========================================================================

describe('getProfileName', () => {
  it('returns profile full_name', async () => {
    const builder = createMockQueryBuilder({ data: { full_name: 'Marie Martin' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProfileName(mockSupabaseClient, 'profile-1')

    expect(result.data).toEqual({ full_name: 'Marie Martin' })
    expect(builder.select).toHaveBeenCalledWith('full_name')
  })
})

// ===========================================================================
// getConversationClientId
// ===========================================================================

describe('getConversationClientId', () => {
  it('returns client_id from conversation', async () => {
    const builder = createMockQueryBuilder({ data: { client_id: 'c1' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getConversationClientId(mockSupabaseClient, 'conv-1')

    expect(result.data).toEqual({ client_id: 'c1' })
    expect(builder.select).toHaveBeenCalledWith('client_id')
  })
})

// ===========================================================================
// getConversationProviderId
// ===========================================================================

describe('getConversationProviderId', () => {
  it('returns provider_id from conversation', async () => {
    const builder = createMockQueryBuilder({ data: { provider_id: 'p1' }, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getConversationProviderId(mockSupabaseClient, 'conv-1')

    expect(result.data).toEqual({ provider_id: 'p1' })
    expect(builder.select).toHaveBeenCalledWith('provider_id')
  })
})
