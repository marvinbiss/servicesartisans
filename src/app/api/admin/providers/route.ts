import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { listProviders } from '@/lib/services/admin-crud-service'

// GET query params schema
const providersQuerySchema = paginationSchema.extend({
  filter: z.enum(['all', 'verified', 'pending', 'suspended']).optional().default('all'),
  search: z.string().max(100).optional().default(''),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify admin with providers:read permission
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
    const serviceResult = await listProviders(supabase, result.data)

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
    logger.error('Admin providers list error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
