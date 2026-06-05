/**
 * Client Messages API
 * GET: Fetch conversations and messages for client
 * POST: gelé (messagerie en lecture seule, voir stub en bas de fichier)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import {
  getConversationById,
  getMessagesByConversation,
  markMessagesAsRead,
  getClientConversations,
  getLastMessage,
  countUnreadMessages,
} from '@/lib/services/messages-service'

// GET query params schema
const messagesQuerySchema = z.object({
  conversation_id: z.string().uuid().optional(),
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

/**
 * POST gelé — messagerie en lecture seule depuis la fermeture de l'espace
 * particulier (2026-06-05). Les clients ne peuvent plus se connecter ; on
 * ferme aussi la surface d'écriture API (defense-in-depth, audit 2026-06-05).
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: { message: 'Messagerie en lecture seule' } },
    { status: 501 }
  )
}
