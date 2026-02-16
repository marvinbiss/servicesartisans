import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { sanitizeSearchQuery } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const providersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  filter: z.enum(['all', 'verified', 'pending', 'suspended']).optional().default('all'),
  search: z.string().max(100).optional().default(''),
})

export const dynamic = 'force-dynamic'

// Define the select columns once
const SELECT_COLUMNS = `
  id,
  name,
  slug,
  email,
  phone,
  address_city,
  address_region,
  address_department,
  siret,
  is_verified,
  is_active,
  source,
  rating_average,
  review_count,
  created_at,
  provider_services (
    service:services (
      name,
      slug
    )
  )
`

export async function GET(request: NextRequest) {
  try {
    // Verify admin with providers:read permission
    const authResult = await requirePermission('providers', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

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
        { success: false, error: { message: 'Paramètres invalides', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { page, limit, filter, search } = result.data

    const offset = (page - 1) * limit

    // Build query with filters
    let query = supabase
      .from('providers')
      .select(SELECT_COLUMNS, { count: 'exact' })

    // Apply filters using in() for reliable boolean comparison
    if (filter === 'verified') {
      query = query.in('is_verified', [true]).in('is_active', [true])
    } else if (filter === 'pending') {
      query = query.in('is_verified', [false]).in('is_active', [true])
    } else if (filter === 'suspended') {
      query = query.in('is_active', [false])
    }

    // Apply search (sanitized to prevent injection)
    if (search) {
      const sanitized = sanitizeSearchQuery(search)
      if (sanitized) {
        query = query.or(`name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,address_city.ilike.%${sanitized}%,siret.ilike.%${sanitized}%`)
      }
    }

    // Execute query with ordering and pagination
    const { data: providers, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.warn('Providers query failed, returning empty list', { code: error.code, message: error.message })
      return NextResponse.json({
        success: true,
        providers: [],
        total: 0,
        page,
        totalPages: 0,
      })
    }

    // Transform data for frontend
    const transformedProviders = (providers || []).map((p: Record<string, unknown>) => {
      const providerServices = p.provider_services as Array<{ service: { name: string; slug: string } }> | undefined
      const firstService = providerServices?.[0]?.service

      return {
        id: p.id,
        company_name: p.name,
        slug: p.slug,
        email: p.email || '',
        phone: p.phone || '',
        city: p.address_city || '',
        region: p.address_region || '',
        service_type: firstService?.name || 'Artisan',
        is_verified: p.is_verified,
        is_active: p.is_active,
        subscription_type: 'free',
        rating_average: Number(p.rating_average) || 0,
        review_count: Number(p.review_count) || 0,
        created_at: p.created_at,
        source: p.source,
        siret: p.siret,
      }
    })

    const response = NextResponse.json({
      success: true,
      providers: transformedProviders,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
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
