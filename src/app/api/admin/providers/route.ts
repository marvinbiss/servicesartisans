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

    // Apply filters
    if (filter === 'verified') {
      query = query.eq('is_verified', true).eq('is_active', true)
    } else if (filter === 'pending') {
      query = query.eq('is_verified', false).eq('is_active', true)
    } else if (filter === 'suspended') {
      query = query.eq('is_active', false)
    }

    // Apply search - utilise les vrais noms de colonnes
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,address_city.ilike.%${search}%,siret.ilike.%${search}%`)
    }

    const { data: providers, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Query error:', error)
      throw error
    }

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

    const response = NextResponse.json({
      success: true,
      providers: transformedProviders,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')

    return response
  } catch (error) {
    console.error('Admin providers list error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
