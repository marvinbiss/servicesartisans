import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Utilise le client admin pour contourner RLS
    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const filter = searchParams.get('filter') || 'all'
    const search = searchParams.get('search') || ''
    const cacheBuster = searchParams.get('_t') || '' // Used for cache busting

    console.log(`[Admin API] GET providers - filter=${filter}, page=${page}, _t=${cacheBuster}`)

    const offset = (page - 1) * limit

    let query = supabase
      .from('providers')
      .select(`
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
      `, { count: 'exact' })

    // Apply filters with detailed logging
    console.log(`[Admin API] Applying filter: "${filter}" (type: ${typeof filter})`)
    if (filter === 'verified') {
      console.log('[Admin API] Adding verified filter: is_verified=true AND is_active=true')
      query = query.eq('is_verified', true).eq('is_active', true)
    } else if (filter === 'pending') {
      console.log('[Admin API] Adding pending filter: is_verified=false AND is_active=true')
      query = query.eq('is_verified', false).eq('is_active', true)
    } else if (filter === 'suspended') {
      console.log('[Admin API] Adding suspended filter: is_active=false')
      query = query.eq('is_active', false)
    } else {
      console.log('[Admin API] No filter applied (showing all)')
    }

    // Apply search - utilise les vrais noms de colonnes
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,address_city.ilike.%${search}%,siret.ilike.%${search}%`)
    }

    const { data: providers, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[Admin API] Query error:', error)
      throw error
    }

    console.log(`[Admin API] Query returned ${providers?.length || 0} providers, count=${count}`)

    // Transformer les données pour correspondre au format frontend
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

    // Log pour debugging
    const verifiedCount = transformedProviders.filter((p) => p.is_verified === true).length
    const activeCount = transformedProviders.filter((p) => p.is_active === true).length
    console.log(`[Admin API] Returning ${transformedProviders.length} providers (${verifiedCount} verified, ${activeCount} active)`)

    const response = NextResponse.json({
      success: true,
      providers: transformedProviders,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      _timestamp: Date.now(), // Include timestamp in response for debugging
    })

    // Aggressively prevent caching at all levels
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
