/**
 * Message Read Receipt API
 * POST: Mark message as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Verify user has access to the conversation
    const { data: message } = await supabase
      .from('messages')
      .select('conversation_id, sender_id')
      .eq('id', messageId)
      .single()

    if (!message) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      )
    }

    // Don't create read receipt for own messages
    if (message.sender_id === user.id) {
      return NextResponse.json({ success: true, own_message: true })
    }

    // Create read receipt
    const { data, error } = await supabase
      .from('message_read_receipts')
      .insert({
        message_id: messageId,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      // Unique constraint violation means already read
      if (error.code === '23505') {
        return NextResponse.json({ success: true, already_read: true })
      }
      logger.error('Error marking message as read', error)
      return NextResponse.json(
        { error: 'Impossible de marquer comme lu' },
        { status: 500 }
      )
    }

    // Also update the read_at field on the message for backwards compatibility
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .is('read_at', null)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    logger.error('Mark as read error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
