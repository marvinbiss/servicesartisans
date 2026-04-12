import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { listConversations, buildPagination } from '@/lib/services/prospection-service'

const querySchema = paginationSchema.extend({
  status: z
    .enum(['all', 'open', 'ai_handling', 'human_required', 'resolved', 'archived'])
    .optional()
    .default('all'),
  channel: z.enum(['all', 'email', 'sms', 'whatsapp']).optional().default('all'),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission('prospection', 'read')
    if (!authResult.success) return authResult.error

    const params = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = querySchema.safeParse(params)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Paramètres invalides' } },
        { status: 400 }
      )
    }

    const { page, limit, status, channel } = parsed.data
    const supabase = createAdminClient()
    const { data, count, error } = await listConversations(supabase, {
      page,
      limit,
      status,
      channel,
    })

    if (error) {
      logger.error('List conversations error', error)
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
    logger.error('Conversations GET error', error as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
