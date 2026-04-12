import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'
import { getConversationWithMessages, updateConversation } from '@/lib/services/prospection-service'

const updateSchema = z
  .object({
    status: z.enum(['open', 'ai_handling', 'human_required', 'resolved', 'archived']).optional(),
    assigned_to: z.string().uuid().optional(),
  })
  .strict()

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { conversation, messages, error } = await getConversationWithMessages(supabase, id)

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { message: 'Conversation non trouvée' } },
        { status: 404 }
      )
    }

    if (error) {
      logger.error('Get conversation messages error', error)
    }

    return NextResponse.json({
      success: true,
      data: { ...conversation, messages },
    })
  } catch (error) {
    logger.error('Get conversation error', error as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        {
          success: false,
          error: { message: 'Données invalides', details: parsed.error.flatten() },
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data, error } = await updateConversation(supabase, id, parsed.data)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: { message: 'Ressource introuvable' } },
          { status: 404 }
        )
      }
      logger.error('Update conversation error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la mise à jour' } },
        { status: 500 }
      )
    }
    if (!data) {
      return NextResponse.json(
        { success: false, error: { message: 'Ressource introuvable' } },
        { status: 404 }
      )
    }

    await logAdminAction(
      authResult.admin.id,
      'conversation.update',
      'prospection_conversation',
      id,
      {
        updated_fields: Object.keys(parsed.data),
        status: parsed.data.status,
      }
    )

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Patch conversation error', error as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
