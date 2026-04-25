/**
 * Artisan Messages API
 * GET: Fetch conversations and messages
 * POST: Send a new message
 */

import { NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { notifyNewMessage } from '@/lib/notifications/message-notifications'
import { sanitizeUserInput } from '@/lib/sanitize'
import {
  getConversationById,
  getMessagesByConversation,
  markMessagesAsRead,
  getProviderConversations,
  getRecentMessagesForConversations,
  findConversation,
  createConversation,
  insertMessage,
  getProviderByUserId,
  getConversationClientId,
  getProfileById,
  getProviderName,
  type MessagePreviewRow,
} from '@/lib/services/messages-service'

// GET query params schema
const messagesQuerySchema = z.object({
  conversation_id: z.string().uuid().optional(),
})

// POST request schema
const sendMessageSchema = z.object({
  conversation_id: z.string().uuid().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  content: z.string().min(1).max(5000),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { error, user, supabase } = await requireArtisan()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const queryParams = {
      conversation_id: searchParams.get('conversation_id') || undefined,
    }
    const result = messagesQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Paramètres invalides', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const conversationId = result.data.conversation_id

    // Get provider linked to this user
    const { data: provider } = await getProviderByUserId(supabase, user.id)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    if (conversationId) {
      // Verify conversation belongs to this artisan
      const { data: conversation } = await getConversationById(supabase, conversationId, {
        providerId: provider.id,
      })

      if (!conversation) {
        return NextResponse.json(
          { success: false, error: { message: 'Conversation non trouvée' } },
          { status: 404 }
        )
      }

      // Fetch messages for this conversation (explicit columns, no select('*'))
      const { data: messages, error: messagesError } = await getMessagesByConversation(
        supabase,
        conversationId
      )

      if (messagesError) {
        logger.error('Error fetching messages:', messagesError)
        return NextResponse.json(
          { success: false, error: { message: 'Erreur lors de la récupération des messages' } },
          { status: 500 }
        )
      }

      // Mark messages sent by client as read
      await markMessagesAsRead(supabase, conversationId, 'client')

      return NextResponse.json({ messages, currentUserId: user.id })
    }

    // Bug fix: the Supabase JS client does not support .limit() on nested relation
    // selects, so loading all messages for all conversations in one query risks
    // pulling an unbounded number of rows into memory.
    //
    // Strategy: fetch conversations first (no messages embedded), then fetch the
    // last 2 messages per conversation via a single bounded query (.limit) and
    // group server-side. This caps the messages loaded to convCount × 2 rows.

    // Step 1: fetch conversations (no messages embedded)
    const { data: conversations, error: convsError } = await getProviderConversations(
      supabase,
      provider.id
    )

    if (convsError) {
      logger.error('Error fetching conversations:', convsError)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la récupération des conversations' } },
        { status: 500 }
      )
    }

    const convList = conversations
    const convIds = convList.map((c) => c.id)

    // Step 2: fetch recent messages for all conversations in one bounded query.
    // Limit to convIds.length * 2 so we have enough rows to determine lastMessage
    // and unread counts, without loading the entire message history.
    const msgLimit = Math.max(convIds.length * 2, 50)
    const { data: allMessages, error: msgsError } = await getRecentMessagesForConversations(
      supabase,
      convIds,
      msgLimit
    )

    if (msgsError) {
      logger.error('Error fetching recent messages:', msgsError)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la récupération des messages' } },
        { status: 500 }
      )
    }

    // Step 3: group messages by conversation_id server-side
    const msgsByConv = new Map<string, MessagePreviewRow[]>()
    for (const msg of allMessages) {
      const bucket = msgsByConv.get(msg.conversation_id) ?? []
      bucket.push(msg)
      msgsByConv.set(msg.conversation_id, bucket)
    }

    // Step 4: build result — derive lastMessage and unreadCount per conversation
    const conversationsWithMeta = convList.map((conv) => {
      // Messages are already ordered desc from the DB query
      const msgs = msgsByConv.get(conv.id) ?? []
      const lastMessage = msgs[0] ?? null
      const unreadCount = msgs.filter(
        (m) => m.sender_type === 'client' && m.read_at === null
      ).length

      return {
        id: conv.id,
        partner: (conv as Record<string, unknown>).client,
        lastMessage,
        unreadCount,
      }
    })

    return NextResponse.json({ conversations: conversationsWithMeta })
  } catch (error) {
    logger.error('Messages GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { error, user, supabase } = await requireArtisan()
    if (error) return error

    const body = await request.json()
    const result = sendMessageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { conversation_id, client_id, content } = result.data

    // Get provider linked to this user
    const { data: provider } = await getProviderByUserId(supabase, user.id)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    let resolvedConversationId = conversation_id

    if (!resolvedConversationId) {
      // Try to find existing conversation or create one
      if (!client_id) {
        return NextResponse.json(
          { success: false, error: { message: 'conversation_id ou client_id requis' } },
          { status: 400 }
        )
      }

      const { data: existingConv } = await findConversation(supabase, {
        providerId: provider.id,
        clientId: client_id,
      })

      if (existingConv) {
        resolvedConversationId = existingConv.id
      } else {
        const { data: newConv, error: convError } = await createConversation(supabase, {
          providerId: provider.id,
          clientId: client_id,
        })

        if (convError || !newConv) {
          logger.error('Error creating conversation:', convError)
          return NextResponse.json(
            { success: false, error: { message: 'Erreur lors de la création de la conversation' } },
            { status: 500 }
          )
        }
        resolvedConversationId = newConv.id
      }
    } else {
      // Verify conversation belongs to this artisan
      const { data: conversation } = await getConversationById(supabase, resolvedConversationId, {
        providerId: provider.id,
      })

      if (!conversation) {
        return NextResponse.json(
          { success: false, error: { message: 'Conversation non trouvée ou non autorisée' } },
          { status: 403 }
        )
      }
    }

    // Insert new message
    const { data: message, error: insertError } = await insertMessage(supabase, {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      conversationId: resolvedConversationId!,
      senderId: user.id,
      senderType: 'artisan',
      content: sanitizeUserInput(content),
    })

    if (insertError) {
      logger.error('Error sending message:', insertError)
      return NextResponse.json(
        { success: false, error: { message: "Erreur lors de l'envoi du message" } },
        { status: 500 }
      )
    }

    // Fire-and-forget: notify the client by email
    const effectiveConvId = resolvedConversationId
    const effectiveClientId = client_id
    ;(async () => {
      try {
        const adminSupabase = createAdminClient()

        // Resolve client_id from conversation if not provided directly
        let cid = effectiveClientId
        if (!cid && effectiveConvId) {
          const { data: conv } = await getConversationClientId(adminSupabase, effectiveConvId)
          cid = conv?.client_id ?? null
        }
        if (!cid) return

        const { data: clientProfile } = await getProfileById(adminSupabase, cid)

        if (!clientProfile?.email) return

        // Get artisan name from provider
        const { data: providerData } = await getProviderName(adminSupabase, provider.id)

        await notifyNewMessage({
          recipientEmail: clientProfile.email,
          recipientName: clientProfile.full_name || 'Client',
          senderName: providerData?.name || 'Un artisan',
          messageContent: content,
          recipientRole: 'client',
        })
      } catch (err) {
        logger.error('Failed to send message notification to client:', err)
      }
    })()

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    logger.error('Messages POST error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
