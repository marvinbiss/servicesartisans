import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'
import {
  listMembers,
  addMembers,
  removeMembers,
  buildPagination,
} from '@/lib/services/prospection-service'

const addMembersSchema = z.object({
  contact_ids: z.array(z.string().uuid()).min(1).max(1000),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const rawPage = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const rawLimit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 100)

    const { data, count, error } = await listMembers(supabase, id, { page, limit })

    if (error) {
      logger.error('List members error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la récupération des données' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: buildPagination(page, limit, count || 0),
    })
  } catch (error) {
    logger.error('Members GET error', error as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const parsed = addMembersSchema.safeParse(body)

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
    const { error } = await addMembers(supabase, id, parsed.data.contact_ids)

    if (error) {
      logger.error('Add members error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la création' } },
        { status: 500 }
      )
    }

    await logAdminAction(authResult.admin.id, 'list.add_members', 'prospection_list', id, {
      member_count: parsed.data.contact_ids.length,
    })

    return NextResponse.json({ success: true, data: { added: parsed.data.contact_ids.length } })
  } catch (error) {
    logger.error('Members POST error', error as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const bodySchema = z.object({
      contact_ids: z.array(z.string().uuid()).min(1).max(1000),
    })
    const parsed = bodySchema.safeParse(body)

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
    const { error } = await removeMembers(supabase, id, parsed.data.contact_ids)

    if (error) {
      logger.error('Remove members error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la suppression' } },
        { status: 500 }
      )
    }

    await logAdminAction(authResult.admin.id, 'list.remove_members', 'prospection_list', id, {
      member_count: parsed.data.contact_ids.length,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Members DELETE error', error as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
