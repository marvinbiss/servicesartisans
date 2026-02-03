/**
 * Conversation Archive API
 * POST: Archive/unarchive conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const archiveSchema = z.object({
  is_archived: z.boolean(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = archiveSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      )
    }

    // Verify user has access to conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
      .single()

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      )
    }

    // Update or create conversation settings
    const { data, error } = await supabase
      .from('conversation_settings')
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        is_archived: parsed.data.is_archived,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'conversation_id,user_id',
      })
      .select()
      .single()

    if (error) {
      logger.error('Archive conversation error', error)
      return NextResponse.json(
        { error: 'Impossible d\'archiver la conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Archive error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
