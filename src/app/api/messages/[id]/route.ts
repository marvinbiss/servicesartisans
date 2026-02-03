/**
 * Message API - Edit and Delete
 * PATCH: Edit a message
 * DELETE: Soft delete a message
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const editMessageSchema = z.object({
  content: z.string().min(1).max(5000),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = editMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Update message (RLS will verify ownership)
    const { data, error } = await supabase
      .from('messages')
      .update({
        content: parsed.data.content,
        edited_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('sender_id', user.id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      logger.error('Error editing message', error)
      return NextResponse.json(
        { error: 'Impossible de modifier le message' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Message non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Edit message error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Soft delete message (RLS will verify ownership)
    const { data, error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('sender_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Error deleting message', error)
      return NextResponse.json(
        { error: 'Impossible de supprimer le message' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Message non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Delete message error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
