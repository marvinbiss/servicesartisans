import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sanitizeSearchQuery } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const mapQuerySchema = z.object({
  north: z.coerce.number().min(-90).max(90),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  west: z.coerce.number().min(-180).max(180),
  limit: z.coerce.number().int().min(1).max(200).optional().default(100),
  q: z.string().max(200).optional(),
  service: z.string().max(100).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  verified: z.enum(['true', 'false']).optional(),
})

/**
 * GET /api/search/map?north=...&south=...&east=...&west=...&limit=...&q=...&service=...&minRating=...&verified=...
 * Retourne les artisans dans une zone géographique (bounding box)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      north: searchParams.get('north'),
      south: searchParams.get('south'),
      east: searchParams.get('east'),
      west: searchParams.get('west'),
      limit: searchParams.get('limit') || '100',
      q: searchParams.get('q') || undefined,
      service: searchParams.get('service') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      verified: searchParams.get('verified') || undefined,
    }

    const result = mapQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Paramètres géographiques invalides', details: result.error.flatten() } },
        { status: 400 }
      )
    }

    const { north, south, east, west, limit, q, service, minRating, verified } = result.data

    const supabase = createAdminClient()

    let query = supabase
      .from('providers')
      .select('id, name, slug, specialty, address_city, address_region, latitude, longitude, is_verified, rating_average, review_count')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .gte('latitude', south)
      .lte('latitude', north)
      .gte('longitude', west)
      .lte('longitude', east)
      .limit(limit)

    // Filtre texte libre
    if (q) {
      const sanitized = sanitizeSearchQuery(q)
      if (sanitized) {
        query = query.or(`name.ilike.%${sanitized}%,specialty.ilike.%${sanitized}%,address_city.ilike.%${sanitized}%`)
      }
    }

    // Filtre par service/spécialité
    if (service) {
      const sanitizedService = sanitizeSearchQuery(service)
      if (sanitizedService) {
        query = query.ilike('specialty', `%${sanitizedService}%`)
      }
    }

    // Filtre par note minimale
    if (minRating && minRating > 0) {
      query = query.gte('rating_average', minRating)
    }

    // Filtre vérifiés uniquement
    if (verified === 'true') {
      query = query.eq('is_verified', true)
    }

    // Tri : vérifiés en premier, puis par note
    query = query
      .order('is_verified', { ascending: false })
      .order('rating_average', { ascending: false, nullsFirst: false })

    const { data: providers, error } = await query

    if (error) {
      logger.error('Map search Supabase error', { error: error.message })
      return NextResponse.json(
        { success: false, error: { message: 'Erreur de recherche' } },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        providers: providers || [],
        count: providers?.length || 0,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    logger.error('Map search API error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
