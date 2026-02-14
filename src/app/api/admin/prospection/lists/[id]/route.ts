import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  list_type: z.enum(['static', 'dynamic']).optional(),
  filter_criteria: z.record(z.string(), z.unknown()).optional(),
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
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('prospection_lists')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, error: { message: 'Liste non trouvée' } }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Get list error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('prospection', 'write')
    if (!authResult.success) return authResult.error

    const { id } = await params
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
      .from('prospection_lists')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: { message: 'Resource not found' } }, { status: 404 })
      }
      logger.error('Update list error', error)
      return NextResponse.json({ success: false, error: { message: 'Erreur lors de la mise à jour' } }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ success: false, error: { message: 'Resource not found' } }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Patch list error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('prospection', 'write')
    if (!authResult.success) return authResult.error

    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('prospection_lists')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Delete list error', error)
      return NextResponse.json({ success: false, error: { message: 'Erreur lors de la suppression' } }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Delete list error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
