import { createClient } from '@/lib/supabase/server'
import { getCachedData, generateCacheKey, CACHE_TTL } from '@/lib/cache'

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
  company_name: string
  description: string | null
  city: string
  postal_code: string
  services: string[]
  rating: number
  review_count: number
  is_verified: boolean
  subscription_plan: 'gratuit' | 'pro' | 'premium'
}

/**
 * Get all services
 */
export async function getServices(): Promise<Service[]> {
  return getCachedData(
    'services:all',
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching services:', error)
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
      const supabase = createClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching service:', error)
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
      const supabase = createClient()
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('user_type', 'artisan')
        .eq('is_verified', true)

      if (params.service) {
        query = query.contains('services', [params.service])
      }

      if (params.city) {
        query = query.ilike('city', `%${params.city}%`)
      }

      if (params.postalCode) {
        query = query.like('postal_code', `${params.postalCode.substring(0, 2)}%`)
      }

      // Order by subscription plan (premium first) and rating
      query = query
        .order('subscription_plan', { ascending: false })
        .order('rating', { ascending: false, nullsFirst: false })

      if (params.limit) {
        query = query.limit(params.limit)
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching artisans:', error)
        return { artisans: [], total: 0 }
      }

      return {
        artisans: (data || []).map((a) => ({
          id: a.id,
          company_name: a.company_name || 'Artisan',
          description: a.description,
          city: a.city || '',
          postal_code: a.postal_code || '',
          services: a.services || [],
          rating: a.rating || 0,
          review_count: a.review_count || 0,
          is_verified: a.is_verified || false,
          subscription_plan: a.subscription_plan || 'gratuit',
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
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('user_type', 'artisan')
        .single()

      if (error) {
        console.error('Error fetching artisan:', error)
        return null
      }

      return {
        id: data.id,
        company_name: data.company_name || 'Artisan',
        description: data.description,
        city: data.city || '',
        postal_code: data.postal_code || '',
        services: data.services || [],
        rating: data.rating || 0,
        review_count: data.review_count || 0,
        is_verified: data.is_verified || false,
        subscription_plan: data.subscription_plan || 'gratuit',
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
      const supabase = createClient()
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          client:profiles!reviews_client_id_fkey(full_name)
        `)
        .eq('artisan_id', artisanId)
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching reviews:', error)
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
      const supabase = createClient()

      const [artisansResult, reviewsResult, citiesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('user_type', 'artisan')
          .eq('is_verified', true),
        supabase
          .from('reviews')
          .select('rating')
          .eq('is_verified', true),
        supabase
          .from('profiles')
          .select('city')
          .eq('user_type', 'artisan')
          .eq('is_verified', true),
      ])

      const totalArtisans = artisansResult.count || 0
      const reviews = reviewsResult.data || []
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0
      const uniqueCities = new Set(citiesResult.data?.map((p) => p.city).filter(Boolean))

      return {
        totalArtisans,
        totalReviews: reviews.length,
        averageRating: Math.round(avgRating * 10) / 10,
        totalCities: uniqueCities.size,
      }
    },
    CACHE_TTL.stats
  )
}
