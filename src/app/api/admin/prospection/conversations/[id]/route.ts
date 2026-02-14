import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['open', 'ai_handling', 'human_required', 'resolved', 'archived']).optional(),
  assigned_to: z.string().uuid().optional(),
}).strict()

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('prospection', 'read')
    if (!authResult.success) return authResult.error

    const { id } = await params
    if (!isValidUuid(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: conversation, error: convError } = await supabase
      .from('prospection_conversations')
      .select('id, campaign_id, contact_id, channel, status, ai_provider, ai_replies_count, assigned_to, last_message_at, created_at, contact:prospection_contacts(id, contact_name, company_name, email, phone, contact_type, city), campaign:prospection_campaigns(id, name, channel)')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ success: false, error: { message: 'Conversation non trouvée' } }, { status: 404 })
    }

    const { data: messages, error: msgError } = await supabase
      .from('prospection_conversation_messages')
      .select('id, direction, sender_type, content, ai_provider, ai_model, ai_prompt_tokens, ai_completion_tokens, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (msgError) {
      logger.error('Get conversation messages error', msgError)
    }

    return NextResponse.json({
      success: true,
      data: { ...conversation, messages: messages || [] },
    })
  } catch (error) {
    logger.error('Get conversation error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('prospection', 'write')
    if (!authResult.success || !authResult.admin) return authResult.error

    const { id } = await params
    if (!isValidUuid(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('prospection_conversations')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: { message: 'Ressource introuvable' } }, { status: 404 })
      }
      logger.error('Update conversation error', error)
      return NextResponse.json({ success: false, error: { message: 'Erreur lors de la mise à jour' } }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ success: false, error: { message: 'Ressource introuvable' } }, { status: 404 })
    }

    await logAdminAction(authResult.admin.id, 'conversation.update', 'prospection_conversation', id, {
      updated_fields: Object.keys(parsed.data),
      status: parsed.data.status,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Patch conversation error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
