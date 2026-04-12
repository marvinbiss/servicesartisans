import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { createAdminClient } from '@/lib/supabase/admin'
import { adminListConversations } from '@/lib/services/messages-service'

// GET query params schema
const messagesQuerySchema = paginationSchema.extend({
  status: z.enum(['all', 'active', 'archived', 'blocked']).optional().default('all'),
})

export const dynamic = 'force-dynamic'

// GET - Liste des conversations
export async function GET(request: NextRequest) {
  try {
    // Verify admin with users:read permission
    const authResult = await requirePermission('users', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || 'all',
    }
    const result = messagesQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Paramètres invalides', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { page, limit } = result.data

    const {
      data: conversations,
      count,
      error,
    } = await adminListConversations(supabase, { page, limit })

    if (error) {
      // If the conversations table doesn't exist or FK fails, return empty
      logger.warn('Conversations query failed, returning empty list')
      return NextResponse.json({
        success: true,
        conversations: [],
        total: 0,
        page,
        totalPages: 0,
      })
    }

    return NextResponse.json({
      success: true,
      conversations,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    })
  } catch (error) {
    logger.error('Admin messages list error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
