/**
 * Message Reactions API
 * POST: Add a reaction
 * DELETE: Remove a reaction
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = reactionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Emoji invalide' },
        { status: 400 }
      )
    }

    // Verify user has access to the conversation
    const { data: message } = await supabase
      .from('messages')
      .select('conversation_id')
      .eq('id', messageId)
      .single()

    if (!message) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      )
    }

    // Add reaction
    const { data, error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        emoji: parsed.data.emoji,
      })
      .select()
      .single()

    if (error) {
      // Unique constraint violation means reaction already exists
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Réaction déjà ajoutée' },
          { status: 409 }
        )
      }
      logger.error('Error adding reaction', error)
      return NextResponse.json(
        { error: 'Impossible d\'ajouter la réaction' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    logger.error('Add reaction error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const emoji = searchParams.get('emoji')

    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji requis' },
        { status: 400 }
      )
    }

    // Remove reaction
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)

    if (error) {
      logger.error('Error removing reaction', error)
      return NextResponse.json(
        { error: 'Impossible de supprimer la réaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Remove reaction error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
