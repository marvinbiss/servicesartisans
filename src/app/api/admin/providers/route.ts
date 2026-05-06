import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { listProviders } from '@/lib/services/admin-crud-service'

// GET query params schema
const providersQuerySchema = paginationSchema.extend({
  filter: z.enum(['all', 'verified', 'pending', 'suspended']).optional().default('all'),
  search: z.string().max(100).optional().default(''),
})

export const dynamic = 'force-dynamic'

// SLA-99.9 : timeout court (5s) pour borner toute requête Supabase et éviter
// l'épuisement du pool de connexions en cas de DB lente.
const SUPABASE_TIMEOUT_MS = 5_000

function withSupabaseTimeout<T>(p: PromiseLike<T>): Promise<T> {
  return Promise.race<T>([
    Promise.resolve(p),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
    ),
  ])
}

export async function GET(request: NextRequest) {
  try {
    // SLA-99.9 : rate limit 60/min/IP, fail-open pour ne pas bloquer l'admin si Upstash glitch.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-providers-list:${ip}`, {
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

    // SLA-99.9 : RBAC obligatoire — providers:read.
    const authResult = await requirePermission('providers', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      filter: searchParams.get('filter') || 'all',
      search: searchParams.get('search') || '',
    }
    const result = providersQuerySchema.safeParse(queryParams)
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
    // SLA-99.9 : Promise.race avec timeout 5s.
    const serviceResult = await withSupabaseTimeout(listProviders(supabase, result.data))

    if (serviceResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: { message: serviceResult.error.message, code: serviceResult.error.code },
        },
        { status: serviceResult.error.status }
      )
    }

    const response = NextResponse.json({
      success: true,
      ...serviceResult.data,
    })

    // Prevent caching
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('CDN-Cache-Control', 'no-store')
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store')

    return response
  } catch (error) {
    logger.error('admin-providers-list: error', error)
    captureError(error, {
      tags: { route: 'admin/providers', method: 'GET', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
