/**
 * Client Messages API
 * GET: Fetch conversations and messages for client
 * POST: Send a new message
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { notifyNewMessage } from '@/lib/notifications/message-notifications'
import { sanitizeUserInput } from '@/lib/sanitize'
import {
  getConversationById,
  getMessagesByConversation,
  markMessagesAsRead,
  getClientConversations,
  getLastMessage,
  countUnreadMessages,
  findConversation,
  createConversation,
  insertMessageFull,
  getConversationProviderId,
  getProviderDetails,
  getProfileName,
} from '@/lib/services/messages-service'

// GET query params schema
const messagesQuerySchema = z.object({
  conversation_id: z.string().uuid().optional(),
})

// POST request schema
const sendMessageSchema = z.object({
  conversation_id: z.string().uuid().optional().nullable(),
  provider_id: z.string().uuid().optional().nullable(),
  content: z.string().min(1).max(5000),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const queryParams = {
      conversation_id: searchParams.get('conversation_id') || undefined,
    }
    const result = messagesQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const conversationId = result.data.conversation_id

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (conversationId) {
      // Verify conversation belongs to this client
      const { data: conversation } = await getConversationById(supabase, conversationId, {
        clientId: user.id,
      })

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 })
      }

      // Fetch messages for this conversation
      const { data: messages, error: messagesError } = await getMessagesByConversation(
        supabase,
        conversationId
      )

      if (messagesError) {
        logger.error('Error fetching messages:', messagesError)
        return NextResponse.json(
          { error: 'Erreur lors de la récupération des messages' },
          { status: 500 }
        )
      }

      // Mark messages sent by artisan as read
      await markMessagesAsRead(supabase, conversationId, 'artisan')

      return NextResponse.json({ messages, currentUserId: user.id })
    }

    // Fetch all conversations for this client
    const { data: conversations, error: convsError } = await getClientConversations(
      supabase,
      user.id
    )

    if (convsError) {
      logger.error('Error fetching conversations:', convsError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des conversations' },
        { status: 500 }
      )
    }

    // For each conversation, get the last message and unread count
    const conversationsWithMeta = await Promise.all(
      conversations.map(async (conv) => {
        const { data: lastMessage } = await getLastMessage(supabase, conv.id)
        const { count: unreadCount } = await countUnreadMessages(supabase, conv.id, 'artisan')

        return {
          id: conv.id,
          partner: (conv as Record<string, unknown>).provider,
          lastMessage,
          unreadCount,
          service:
            ((conv as Record<string, unknown>).booking as { service_description: string } | null)
              ?.service_description || null,
        }
      })
    )

    return NextResponse.json({ conversations: conversationsWithMeta })
  } catch (error) {
    logger.error('Client Messages GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const result = sendMessageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Erreur de validation', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { conversation_id, provider_id, content } = result.data

    let resolvedConversationId = conversation_id

    if (!resolvedConversationId) {
      // Try to find existing conversation or create one
      if (!provider_id) {
        return NextResponse.json(
          { error: 'conversation_id ou provider_id requis' },
          { status: 400 }
        )
      }

      const { data: existingConv } = await findConversation(supabase, {
        providerId: provider_id,
        clientId: user.id,
      })

      if (existingConv) {
        resolvedConversationId = existingConv.id
      } else {
        const { data: newConv, error: convError } = await createConversation(supabase, {
          providerId: provider_id,
          clientId: user.id,
        })

        if (convError || !newConv) {
          logger.error('Error creating conversation:', convError)
          return NextResponse.json(
            { error: 'Erreur lors de la création de la conversation' },
            { status: 500 }
          )
        }
        resolvedConversationId = newConv.id
      }
    } else {
      // Verify conversation belongs to this client
      const { data: conversation } = await getConversationById(supabase, resolvedConversationId, {
        clientId: user.id,
      })

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation non trouvée ou non autorisée' },
          { status: 403 }
        )
      }
    }

    // Insert new message
    const { data: message, error: insertError } = await insertMessageFull(supabase, {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      conversationId: resolvedConversationId!,
      senderId: user.id,
      senderType: 'client',
      content: sanitizeUserInput(content),
    })

    if (insertError) {
      logger.error('Error sending message:', insertError)
      return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 })
    }

    // Fire-and-forget: notify the artisan by email
    const effectiveConvId = resolvedConversationId
    const effectiveProviderId = provider_id
    ;(async () => {
      try {
        const adminSupabase = createAdminClient()

        // Resolve provider_id from conversation if not provided directly
        let pid = effectiveProviderId
        if (!pid && effectiveConvId) {
          const { data: conv } = await getConversationProviderId(adminSupabase, effectiveConvId)
          pid = conv?.provider_id ?? null
        }
        if (!pid) return

        const { data: provider } = await getProviderDetails(adminSupabase, pid)

        if (!provider?.email) return

        // Get sender name
        const { data: senderProfile } = await getProfileName(adminSupabase, user.id)

        await notifyNewMessage({
          recipientEmail: provider.email,
          recipientName: provider.name || 'Artisan',
          senderName: senderProfile?.full_name || 'Un client',
          messageContent: content,
          recipientRole: 'artisan',
        })
      } catch (err) {
        logger.error('Failed to send message notification to artisan:', err)
      }
    })()

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    logger.error('Client Messages POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
