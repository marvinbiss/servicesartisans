/**
 * Advanced Search API - ServicesArtisans
 * Full-text search with PostGIS distance, filters, and AI recommendations
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// Enhanced search query params schema
const searchQuerySchema = z.object({
  q: z.string().max(200).optional().default(''),
  service: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  lon: z.coerce.number().min(-180).max(180).optional().nullable(),
  radius: z.coerce.number().min(1).max(100).default(25),
  minRating: z.coerce.number().min(0).max(5).optional().nullable(),
  minPrice: z.coerce.number().min(0).optional().nullable(),
  maxPrice: z.coerce.number().min(0).optional().nullable(),
  availability: z.enum(['today', 'tomorrow', 'this_week', 'any']).optional().nullable(),
  trustBadge: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional().nullable(),
  verified: z.enum(['true', 'false']).optional().nullable(),
  sortBy: z.enum(['relevance', 'rating', 'distance', 'price_low', 'price_high']).optional().default('relevance'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
})

// Artisan type for search results
interface SearchArtisan {
  id: string
  business_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  city: string | null
  postal_code: string
  address: string | null
  specialty: string
  description: string | null
  average_rating: number
  review_count: number
  hourly_rate: number | null
  hourly_rate_max: number | null
  is_verified: boolean
  is_premium: boolean
  is_center: boolean
  team_size: number | null
  services: string[]
  availability_status: 'available_today' | 'available_this_week' | 'unavailable'
  response_time: string | null
  distance_km: number | null
  accepts_new_clients: boolean
  intervention_zone: string
  slug: string
  phone: string | null
  email: string | null
  website: string | null
  siret: string | null
  latitude: number | null
  longitude: number | null
  trust_badge: string
  trust_score: number
}

// Availability data is no longer generated - should be fetched from real scheduling data

// Transform provider to artisan format
function transformProviderToArtisan(provider: any, distanceKm?: number): SearchArtisan {
  let specialty = provider.specialty || 'Artisan'
  if (!provider.specialty) {
    const name = provider.name?.toLowerCase() || ''
    if (name.includes('plomb')) specialty = 'Plombier'
    else if (name.includes('electr')) specialty = 'Électricien'
    else if (name.includes('serr')) specialty = 'Serrurier'
    else if (name.includes('peintr')) specialty = 'Peintre en bâtiment'
    else if (name.includes('maçon') || name.includes('macon')) specialty = 'Maçon'
    else if (name.includes('menuisi')) specialty = 'Menuisier'
    else if (name.includes('carrel')) specialty = 'Carreleur'
    else if (name.includes('couv')) specialty = 'Couvreur'
    else if (name.includes('chauff')) specialty = 'Chauffagiste'
    else if (name.includes('jardin') || name.includes('paysag')) specialty = 'Jardinier'
  }

  // Use real data only, no fake generation
  const rating = provider.rating_average || 0
  const reviewCount = provider.review_count || 0

  return {
    id: provider.id,
    business_name: provider.name,
    first_name: null,
    last_name: null,
    avatar_url: provider.avatar_url || null,
    city: provider.address_city,
    postal_code: provider.address_postal_code || '',
    address: provider.address_street,
    specialty,
    description: provider.meta_description || provider.description || `${provider.name} - Artisan professionnel à ${provider.address_city}`,
    average_rating: parseFloat(rating.toFixed(1)),
    review_count: reviewCount,
    hourly_rate: provider.hourly_rate_min || null,
    hourly_rate_max: provider.hourly_rate_max || null,
    is_verified: provider.is_verified || false,
    is_premium: provider.is_premium || false,
    is_center: (provider.employee_count || 0) > 1,
    team_size: provider.employee_count || null,
    services: [specialty],
    availability_status: 'unavailable' as const, // Real availability from scheduling system not yet implemented
    response_time: provider.avg_response_time_hours ? `< ${Math.ceil(provider.avg_response_time_hours)}h` : '< 2h',
    distance_km: distanceKm !== undefined ? parseFloat(distanceKm.toFixed(2)) : null,
    accepts_new_clients: true,
    intervention_zone: provider.intervention_zone || '20 km',
    slug: provider.slug,
    phone: provider.phone,
    email: provider.email,
    website: provider.website,
    siret: provider.siret,
    latitude: provider.latitude,
    longitude: provider.longitude,
    trust_badge: provider.trust_badge || 'none',
    trust_score: provider.trust_score || 0,
  }
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse and validate search parameters
    const queryParams = {
      q: searchParams.get('q') || '',
      service: searchParams.get('service'),
      location: searchParams.get('location'),
      lat: searchParams.get('lat'),
      lon: searchParams.get('lon'),
      radius: searchParams.get('radius') || '25',
      minRating: searchParams.get('minRating'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      availability: searchParams.get('availability'),
      trustBadge: searchParams.get('trustBadge'),
      verified: searchParams.get('verified'),
      sortBy: searchParams.get('sortBy') || 'relevance',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    }

    const result = searchQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const {
      q: query,
      location,
      lat,
      lon,
      radius,
      minRating,
      minPrice,
      maxPrice,
      availability,
      trustBadge,
      verified,
      sortBy,
      page,
      limit,
    } = result.data

    const offset = (page - 1) * limit
    const hasLocation = lat !== null && lon !== null

    // Use PostGIS function if coordinates provided
    if (hasLocation) {
      const { data: providers, error } = await supabase.rpc('search_providers_by_distance', {
        p_lat: lat,
        p_lon: lon,
        p_radius_km: radius,
        p_query: query || null,
        p_service: result.data.service || null,
        p_min_rating: minRating || null,
        p_min_price: minPrice || null,
        p_max_price: maxPrice || null,
        p_trust_badge: trustBadge || null,
        p_sort_by: sortBy,
        p_limit: limit,
        p_offset: offset,
      })

      if (error) {
        logger.error('PostGIS search error:', error)
        // Fall back to regular search
      } else if (providers) {
        let artisans = providers.map((p: any) => transformProviderToArtisan(p, p.distance_km))

        // Filter by availability
        if (availability && availability !== 'any') {
          artisans = artisans.filter((a: SearchArtisan) => {
            if (availability === 'today') return a.availability_status === 'available_today'
            if (availability === 'tomorrow' || availability === 'this_week') return a.availability_status !== 'unavailable'
            return true
          })
        }

        // Filter by verified
        if (verified === 'true') {
          artisans = artisans.filter((a: SearchArtisan) => a.is_verified)
        }

        // Don't add fake availability data - will be fetched separately if needed

        // Build facets
        const facets = buildFacets(artisans)

        return NextResponse.json({
          results: artisans,
          pagination: {
            page,
            limit,
            total: artisans.length, // Note: This would need a separate count query for accurate total
            totalPages: Math.ceil(artisans.length / limit),
          },
          facets,
          query: {
            q: query,
            service: result.data.service,
            location,
            lat,
            lon,
            radius,
            minRating,
            minPrice,
            maxPrice,
            availability,
            trustBadge,
            verified,
            sortBy,
          },
          source: 'postgis',
        })
      }
    }

    // Regular database query (no coordinates)
    let dbQuery = supabase
      .from('providers')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Filter by search query
    if (query) {
      dbQuery = dbQuery.or(
        `name.ilike.%${query}%,meta_description.ilike.%${query}%,address_city.ilike.%${query}%,specialty.ilike.%${query}%`
      )
    }

    // Filter by location
    if (location) {
      dbQuery = dbQuery.or(
        `address_city.ilike.%${location}%,address_postal_code.ilike.%${location}%`
      )
    }

    // Filter by minimum rating
    if (minRating) {
      dbQuery = dbQuery.gte('rating_average', minRating)
    }

    // Filter by price range
    if (minPrice) {
      dbQuery = dbQuery.gte('hourly_rate_min', minPrice)
    }
    if (maxPrice) {
      dbQuery = dbQuery.lte('hourly_rate_max', maxPrice)
    }

    // Filter by trust badge
    if (trustBadge) {
      const badgeOrder = ['bronze', 'silver', 'gold', 'platinum']
      const minBadgeIndex = badgeOrder.indexOf(trustBadge)
      const allowedBadges = badgeOrder.slice(minBadgeIndex)
      dbQuery = dbQuery.in('trust_badge', allowedBadges)
    }

    // Filter by verified
    if (verified === 'true') {
      dbQuery = dbQuery.eq('is_verified', true)
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        dbQuery = dbQuery.order('rating_average', { ascending: false, nullsFirst: false })
        break
      case 'price_low':
        dbQuery = dbQuery.order('hourly_rate_min', { ascending: true, nullsFirst: false })
        break
      case 'price_high':
        dbQuery = dbQuery.order('hourly_rate_max', { ascending: false, nullsFirst: false })
        break
      default:
        dbQuery = dbQuery
          .order('is_premium', { ascending: false })
          .order('trust_score', { ascending: false })
          .order('rating_average', { ascending: false })
    }

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1)

    const { data: providers, error, count } = await dbQuery

    if (error) {
      logger.error('Database query error:', error)
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      )
    }

    // Transform providers to artisan format
    let artisans = (providers || []).map((p: any) => transformProviderToArtisan(p))

    // Filter by availability
    if (availability && availability !== 'any') {
      artisans = artisans.filter((a: SearchArtisan) => {
        if (availability === 'today') return a.availability_status === 'available_today'
        if (availability === 'tomorrow' || availability === 'this_week') return a.availability_status !== 'unavailable'
        return true
      })
    }

    // Don't add fake availability data - will be fetched separately if needed

    // Build facets
    const facets = buildFacets(artisans)

    return NextResponse.json({
      results: artisans,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      facets,
      query: {
        q: query,
        service: result.data.service,
        location,
        minRating,
        minPrice,
        maxPrice,
        availability,
        trustBadge,
        verified,
        sortBy,
      },
      source: 'database',
    })
  } catch (error) {
    logger.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

function buildFacets(artisans: SearchArtisan[]) {
  // Cities
  const cityCount = new Map<string, number>()
  artisans.forEach(a => {
    if (a.city) {
      cityCount.set(a.city, (cityCount.get(a.city) || 0) + 1)
    }
  })
  const cities = Array.from(cityCount.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Ratings
  const ratings: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
  artisans.forEach(a => {
    const rating = Math.floor(a.average_rating)
    if (rating >= 1 && rating <= 5) {
      ratings[rating.toString()]++
    }
  })

  // Price ranges
  const priceRanges = {
    under30: artisans.filter(a => a.hourly_rate && a.hourly_rate < 30).length,
    '30to50': artisans.filter(a => a.hourly_rate && a.hourly_rate >= 30 && a.hourly_rate < 50).length,
    '50to80': artisans.filter(a => a.hourly_rate && a.hourly_rate >= 50 && a.hourly_rate < 80).length,
    over80: artisans.filter(a => a.hourly_rate && a.hourly_rate >= 80).length,
  }

  // Trust badges
  const trustBadges = {
    platinum: artisans.filter(a => a.trust_badge === 'platinum').length,
    gold: artisans.filter(a => a.trust_badge === 'gold').length,
    silver: artisans.filter(a => a.trust_badge === 'silver').length,
    bronze: artisans.filter(a => a.trust_badge === 'bronze').length,
  }

  // Availability
  const availabilityStats = {
    available_today: artisans.filter(a => a.availability_status === 'available_today').length,
    available_this_week: artisans.filter(a => a.availability_status === 'available_this_week').length,
    unavailable: artisans.filter(a => a.availability_status === 'unavailable').length,
  }

  return {
    cities,
    ratings,
    priceRanges,
    trustBadges,
    availability: availabilityStats,
  }
}
