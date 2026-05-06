import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'

// SLA-99.9 : timeout dur Supabase 5s
const SUPABASE_TIMEOUT_MS = 5_000

// GET query params schema
const reportsQuerySchema = paginationSchema.extend({
  status: z.enum(['all', 'pending', 'reviewed', 'dismissed']).optional().default('all'),
  targetType: z.enum(['all', 'user', 'provider', 'review', 'message']).optional().default('all'),
})

export const dynamic = 'force-dynamic'

// GET - Liste des signalements
export async function GET(request: NextRequest) {
  try {
    // SLA-99.9 : rate-limit lecture 60/min/IP
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-reports-list:${ip}`, {
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

    // Verify admin with reviews:read permission
    const authResult = await requirePermission('reviews', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || 'all',
      targetType: searchParams.get('targetType') || 'all',
    }
    const result = reportsQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Paramètres invalides', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { page, limit, status, targetType } = result.data

    const offset = (page - 1) * limit

    let query = supabase.from('user_reports').select('*', { count: 'exact' })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (targetType !== 'all') {
      query = query.eq('target_type', targetType)
    }

    // SLA-99.9 : Promise.race timeout 5s sur la query Supabase
    const queryPromise = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const queryResult = await Promise.race([
      queryPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
      ),
    ])

    const { data: reports, count, error } = queryResult

    if (error) {
      logger.warn('Reports query failed, returning empty list', {
        code: error.code,
        message: error.message,
      })
      return NextResponse.json({
        success: true,
        reports: [],
        total: 0,
        page,
        totalPages: 0,
      })
    }

    return NextResponse.json({
      success: true,
      reports: reports || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    logger.error('admin-reports-list: error', error)
    captureError(error, { tags: { route: 'admin/reports', method: 'GET', critical: 'true' } })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
