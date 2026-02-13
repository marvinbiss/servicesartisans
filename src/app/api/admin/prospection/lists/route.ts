import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  list_type: z.enum(['static', 'dynamic']).optional().default('static'),
  filter_criteria: z.record(z.string(), z.unknown()).optional(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const authResult = await requirePermission('prospection', 'read')
    if (!authResult.success) return authResult.error

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('prospection_lists')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('List lists error', error)
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Lists GET error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission('prospection', 'write')
    if (!authResult.success || !authResult.admin) return authResult.error

    const supabase = createAdminClient()
    const body = await request.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('prospection_lists')
      .insert({ ...parsed.data, created_by: authResult.admin.id })
      .select()
      .single()

    if (error) {
      logger.error('Create list error', error)
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    logger.error('Lists POST error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
