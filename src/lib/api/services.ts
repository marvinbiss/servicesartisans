import { createClient } from '@/lib/supabase/server'
import { getCachedData, generateCacheKey, CACHE_TTL } from '@/lib/cache'
import { logger } from '@/lib/logger'

export interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  category: string | null
  is_active: boolean
}

export interface Artisan {
  id: string
  name: string
  specialty: string | null
  address_city: string
  address_postal_code: string
  rating_average: number
  review_count: number
  is_verified: boolean
  is_active: boolean
}

/**
 * Get all services
 */
export async function getServices(): Promise<Service[]> {
  return getCachedData(
    'services:all',
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        logger.error('Error fetching services', error)
        return []
      }

      return data || []
    },
    CACHE_TTL.services
  )
}

/**
 * Get service by slug
 */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return getCachedData(
    `service:${slug}`,
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        logger.error('Error fetching service', error)
        return null
      }

      return data
    },
    CACHE_TTL.services
  )
}

/**
 * Get artisans by service and location
 */
export async function getArtisans(params: {
  service?: string
  city?: string
  postalCode?: string
  limit?: number
  offset?: number
}): Promise<{ artisans: Artisan[]; total: number }> {
  const cacheKey = generateCacheKey('artisans', params)

  return getCachedData(
    cacheKey,
    async () => {
      const supabase = await createClient()
      let query = supabase
        .from('providers')
        .select('id, name, slug, specialty, address_city, address_postal_code, rating_average, review_count, is_verified, is_active', { count: 'exact' })
        .eq('is_active', true)
        .eq('is_verified', true)

      if (params.service) {
        query = query.eq('specialty', params.service)
      }

      if (params.city) {
        query = query.ilike('address_city', `%${params.city}%`)
      }

      if (params.postalCode) {
        query = query.like('address_postal_code', `${params.postalCode.substring(0, 2)}%`)
      }

      // Order by rating
      query = query
        .order('rating_average', { ascending: false, nullsFirst: false })

      if (params.limit) {
        query = query.limit(params.limit)
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        logger.error('Error fetching artisans', error)
        return { artisans: [], total: 0 }
      }

      return {
        artisans: (data || []).map((a) => ({
          id: a.id,
          name: a.name || 'Artisan',
          specialty: a.specialty,
          address_city: a.address_city || '',
          address_postal_code: a.address_postal_code || '',
          rating_average: a.rating_average || 0,
          review_count: a.review_count || 0,
          is_verified: a.is_verified || false,
          is_active: a.is_active || false,
        })),
        total: count || 0,
      }
    },
    CACHE_TTL.artisans
  )
}

/**
 * Get artisan by ID
 */
export async function getArtisanById(id: string): Promise<Artisan | null> {
  return getCachedData(
    `artisan:${id}`,
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('providers')
        .select('id, name, slug, specialty, address_city, address_postal_code, rating_average, review_count, is_verified, is_active')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        logger.error('Error fetching artisan', error)
        return null
      }

      return {
        id: data.id,
        name: data.name || 'Artisan',
        specialty: data.specialty,
        address_city: data.address_city || '',
        address_postal_code: data.address_postal_code || '',
        rating_average: data.rating_average || 0,
        review_count: data.review_count || 0,
        is_verified: data.is_verified || false,
        is_active: data.is_active || false,
      }
    },
    CACHE_TTL.artisans
  )
}

/**
 * Get reviews for an artisan
 */
export async function getArtisanReviews(artisanId: string, limit = 10) {
  return getCachedData(
    `reviews:${artisanId}:${limit}`,
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          client:profiles!reviews_client_id_fkey(full_name)
        `)
        .eq('provider_id', artisanId)
        // REMOVED: .eq('is_verified', true) to show ALL real reviews
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logger.error('Error fetching reviews', error)
        return []
      }

      return data || []
    },
    CACHE_TTL.reviews
  )
}

/**
 * Get platform stats
 */
export async function getPlatformStats() {
  return getCachedData(
    'stats:platform',
    async () => {
      const supabase = await createClient()

      const [providersResult, reviewsCountResult, reviewsAvgResult, citiesResult] = await Promise.all([
        supabase
          .from('providers')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('is_verified', true),
        supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('reviews')
          .select('rating')
          .limit(1000),
        supabase
          .from('providers')
          .select('address_city')
          .eq('is_active', true)
          .eq('is_verified', true),
      ])

      const totalArtisans = providersResult.count || 0
      const totalReviews = reviewsCountResult.count || 0
      const reviewsSample = reviewsAvgResult.data || []
      const avgRating =
        reviewsSample.length > 0
          ? reviewsSample.reduce((sum, r) => sum + r.rating, 0) / reviewsSample.length
          : 0
      const uniqueCities = new Set(citiesResult.data?.map((p) => p.address_city).filter(Boolean))

      return {
        totalArtisans,
        totalReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        totalCities: uniqueCities.size,
      }
    },
    CACHE_TTL.stats
  )
}
