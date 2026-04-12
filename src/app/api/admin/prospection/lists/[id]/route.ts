import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'
import { getListById, updateList, deleteList } from '@/lib/services/prospection-service'

const updateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    list_type: z.enum(['static', 'dynamic']).optional(),
    filter_criteria: z.record(z.string(), z.unknown()).optional(),
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
    const { data, error } = await getListById(supabase, id)

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: { message: 'Liste non trouvée' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Get list error', error as Error)
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

    // Strip HTML tags from text fields before storing
    const sanitizedData = { ...parsed.data }
    if (sanitizedData.name) sanitizedData.name = sanitizedData.name.replace(/<[^>]*>/g, '').trim()
    if (sanitizedData.description)
      sanitizedData.description = sanitizedData.description.replace(/<[^>]*>/g, '').trim()

    const supabase = createAdminClient()
    const { data, error } = await updateList(supabase, id, sanitizedData)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: { message: 'Ressource introuvable' } },
          { status: 404 }
        )
      }
      logger.error('Update list error', error)
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

    await logAdminAction(authResult.admin.id, 'list.update', 'prospection_list', id, {
      updated_fields: Object.keys(parsed.data),
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Patch list error', error as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const supabase = createAdminClient()
    const { error } = await deleteList(supabase, id)

    if (error) {
      logger.error('Delete list error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la suppression' } },
        { status: 500 }
      )
    }

    await logAdminAction(authResult.admin.id, 'list.delete', 'prospection_list', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Delete list error', error as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
