/**
 * Message Read Receipt API
 * POST: Mark message as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { getMessageById, markSingleMessageAsRead } from '@/lib/services/messages-service'

export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: messageId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorisé' } },
        { status: 401 }
      )
    }

    // Verify user has access to the conversation
    const { data: message } = await getMessageById(supabase, messageId)

    if (!message) {
      return NextResponse.json(
        { success: false, error: { message: 'Message non trouvé' } },
        { status: 404 }
      )
    }

    // Don't mark own messages as read
    if (message.sender_id === user.id) {
      return NextResponse.json({ success: true, own_message: true })
    }

    // Mark message as read by updating read_at on messages table
    // (message_read_receipts table was dropped in migration 100)
    const { error } = await markSingleMessageAsRead(supabase, messageId)

    if (error) {
      logger.error('Error marking message as read', error)
      return NextResponse.json(
        { success: false, error: { message: 'Impossible de marquer comme lu' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Mark as read error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
