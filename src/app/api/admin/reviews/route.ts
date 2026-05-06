import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { listReviews } from '@/lib/services/admin-crud-service'

// SLA-99.9 : timeout dur sur tout appel Supabase (5s) — empêche un blocage DB de saturer le pool
const SUPABASE_TIMEOUT_MS = 5_000

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
    // SLA-99.9 : rate-limit IP avant tout I/O — protège DB d'un flood admin
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-reviews-list:${ip}`, {
      window: 60_000,
      max: 60,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

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
    // SLA-99.9 : Promise.race timeout 5s pour ne jamais hang sur Supabase down
    const serviceResult = await Promise.race([
      listReviews(supabase, result.data),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
      ),
    ])

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    return NextResponse.json({ success: true, ...serviceResult.data })
  } catch (error) {
    logger.error('admin-reviews-list: error', error)
    captureError(error, { tags: { route: 'admin/reviews', method: 'GET', critical: 'true' } })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
