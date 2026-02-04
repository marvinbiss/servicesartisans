/**
 * Map Search API - Geospatial Search for Providers
 * Returns providers within map bounds with filtering
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const mapSearchSchema = z.object({
  north: z.coerce.number().min(-90).max(90),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  west: z.coerce.number().min(-180).max(180),
  q: z.string().optional(),
  service: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  verified: z.coerce.boolean().optional(),
  premium: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(500000).optional().default(50),
})

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      north: searchParams.get('north'),
      south: searchParams.get('south'),
      east: searchParams.get('east'),
      west: searchParams.get('west'),
      q: searchParams.get('q') || undefined,
      service: searchParams.get('service') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      verified: searchParams.get('verified') || undefined,
      premium: searchParams.get('premium') || undefined,
      limit: searchParams.get('limit') || undefined,
    }

    const validation = mapSearchSchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { north, south, east, west, q, service, minRating, verified, premium, limit } = validation.data

    const supabase = getSupabaseClient()

    // Build the query - select only real columns (no derived/fake values)
    let query = supabase
      .from('providers')
      .select(`
        id,
        name,
        slug,
        latitude,
        longitude,
        address_street,
        address_city,
        address_postal_code,
        phone,
        is_verified,
        is_premium,
        is_active,
        meta_description,
        siret,
        rating_average,
        review_count,
        specialty,
        avatar_url,
        hourly_rate_min,
        avg_response_time_hours,
        years_on_platform,
        employee_count,
        response_time,
        emergency_available,
        certifications,
        insurance,
        intervention_zone
      `)
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      // Geospatial bounding box filter
      .gte('latitude', south)
      .lte('latitude', north)
      .gte('longitude', west)
      .lte('longitude', east)
      .limit(limit)

    // Apply additional filters
    if (minRating && minRating > 0) {
      query = query.gte('rating_average', minRating)
    }

    if (verified) {
      query = query.eq('is_verified', true)
    }

    if (premium) {
      query = query.eq('is_premium', true)
    }

    // Text search
    if (q) {
      query = query.or(`name.ilike.%${q}%,meta_description.ilike.%${q}%,address_city.ilike.%${q}%`)
    }

    // Order by premium status and name
    query = query
      .order('is_premium', { ascending: false })
      .order('name')

    const { data: providers, error } = await query

    if (error) {
      logger.error('Map search error:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la recherche' },
        { status: 500 }
      )
    }

    // Transform providers data - keep only real database values
    const transformedProviders = providers?.map((provider) => {
      const services = provider.specialty ? [provider.specialty] : []

      return {
        id: provider.id,
        name: provider.name,
        slug: provider.slug,
        latitude: provider.latitude,
        longitude: provider.longitude,
        rating_average: provider.rating_average,
        review_count: provider.review_count,
        address_street: provider.address_street,
        address_city: provider.address_city,
        address_postal_code: provider.address_postal_code,
        phone: provider.phone,
        is_verified: provider.is_verified,
        is_premium: provider.is_premium,
        specialty: provider.specialty,
        services,
        avatar_url: provider.avatar_url,
        hourly_rate_min: provider.hourly_rate_min,
        avg_response_time_hours: provider.avg_response_time_hours,
        years_on_platform: provider.years_on_platform,
        employee_count: provider.employee_count,
        emergency_available: provider.emergency_available,
        response_time: provider.response_time,
        certifications: provider.certifications,
        insurance: provider.insurance,
        intervention_zone: provider.intervention_zone,
      }
    }) || []

    // Filter by service if provided (after transformation)
    let filteredProviders = transformedProviders
    if (service) {
      filteredProviders = transformedProviders.filter((p) =>
        p.services.some((s: string) => s.toLowerCase().includes(service.toLowerCase()))
      )
    }

    return NextResponse.json({
      success: true,
      providers: filteredProviders,
      bounds: { north, south, east, west },
      count: filteredProviders.length,
    })
  } catch (error) {
    logger.error('Map search error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
