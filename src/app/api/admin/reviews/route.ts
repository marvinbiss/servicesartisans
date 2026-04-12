import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { listReviews } from '@/lib/services/admin-crud-service'

// GET query params schema
const reviewsQuerySchema = paginationSchema.extend({
  filter: z
    .enum(['pending', 'flagged', 'approved', 'rejected', 'all'])
    .optional()
    .default('pending'),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission('reviews', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      filter: searchParams.get('filter') || 'pending',
    }
    const result = reviewsQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Paramètres invalides', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const serviceResult = await listReviews(supabase, result.data)

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    return NextResponse.json({ success: true, ...serviceResult.data })
  } catch (error) {
    logger.error('Admin reviews list error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
