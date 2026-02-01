import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
  is_premium,
  source,
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
    // Utilise le client admin pour contourner RLS
    const supabase = createAdminClient()

    // Debug: Check if Supabase connection is working
    console.log('[Admin API] Supabase client created')

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const filter = searchParams.get('filter') || 'all'
    const search = searchParams.get('search') || ''
    const cacheBuster = searchParams.get('_t') || ''

    console.log(`[Admin API] GET providers - filter="${filter}", page=${page}, limit=${limit}, _t=${cacheBuster}`)

    const offset = (page - 1) * limit

    // First, do a simple count test to verify DB connection
    const { count: totalProvidersCount, error: countError } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('[Admin API] DB connection test failed:', countError)
    } else {
      console.log(`[Admin API] DB connection OK, total providers in DB: ${totalProvidersCount}`)
    }

    // Build query with filters
    let query = supabase
      .from('providers')
      .select(SELECT_COLUMNS, { count: 'exact' })

    // Apply filters using filter() method for more explicit control
    if (filter === 'verified') {
      console.log('[Admin API] Applying verified filter')
      query = query
        .filter('is_verified', 'eq', true)
        .filter('is_active', 'eq', true)
    } else if (filter === 'pending') {
      console.log('[Admin API] Applying pending filter')
      query = query
        .filter('is_verified', 'eq', false)
        .filter('is_active', 'eq', true)
    } else if (filter === 'suspended') {
      console.log('[Admin API] Applying suspended filter')
      query = query
        .filter('is_active', 'eq', false)
    } else {
      console.log('[Admin API] No filter (showing all)')
    }

    // Apply search
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,address_city.ilike.%${search}%,siret.ilike.%${search}%`)
    }

    // Execute query with ordering and pagination
    const { data: providers, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[Admin API] Query error:', error)
      throw error
    }

    console.log(`[Admin API] Query returned ${providers?.length || 0} providers, total count=${count}`)

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
        subscription_type: p.is_premium ? 'premium' : 'free',
        rating_average: 0,
        review_count: 0,
        created_at: p.created_at,
        source: p.source,
        siret: p.siret,
      }
    })

    // Debug logging
    const verifiedInResult = transformedProviders.filter((p) => p.is_verified === true).length
    console.log(`[Admin API] In result: ${verifiedInResult} verified out of ${transformedProviders.length}`)

    const response = NextResponse.json({
      success: true,
      providers: transformedProviders,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      _debug: {
        filter,
        timestamp: Date.now(),
        resultCount: transformedProviders.length,
        verifiedInResult,
        totalProvidersInDb: totalProvidersCount || 'unknown',
        hasCountError: !!countError,
      },
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
    console.error('Admin providers list error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
